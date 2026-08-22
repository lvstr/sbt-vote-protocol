import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { buildTransaction, submitTransaction, getServer, CONTRACT_ID, NETWORK_PASSPHRASE } from "./stellar";

/**
 * Map VoteError codes to human-readable messages.
 */
export const ERROR_MESSAGES: Record<number, string> = {
  1: "Not authorized: only creator or admin can perform this action",
  2: "Voting for this poll is currently closed",
  3: "You have already voted on this poll (1-person-1-vote)",
  4: "You do not have a Soulbound Token. Please claim your free SBT Voter ID first!",
  5: "Invalid option selected",
  6: "Contract is already initialized",
  7: "You already hold a Soulbound Token",
  8: "Poll not found",
  9: "Invalid options count (must be between 2 and 20)",
};

export type TransactionStatus =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "success"
  | "error";

export interface PollOptionItem {
  id: number;
  text: string;
  votes: number;
}

export interface PollItem {
  id: number;
  creator: string;
  title: string;
  description: string;
  category: "Governance" | "Community" | "Grants" | "Tech" | "General";
  options: PollOptionItem[];
  isOpen: boolean;
  totalVotes: number;
  createdAt: number;
}

export interface VoterStatusData {
  hasSbt: boolean;
  hasVoted: boolean;
  votedOption: number;
}

// Simulate-only account (zero-balance, used for read queries)
const SIMULATE_ACCOUNT = new StellarSdk.Account(
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  "0"
);

function buildSimulateTransaction(
  method: string,
  ...params: StellarSdk.xdr.ScVal[]
): StellarSdk.Transaction {
  const contract = new StellarSdk.Contract(CONTRACT_ID || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
  return new StellarSdk.TransactionBuilder(SIMULATE_ACCOUNT, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();
}

async function simulateAndDecode<T>(
  method: string,
  ...params: StellarSdk.xdr.ScVal[]
): Promise<T | null> {
  if (!CONTRACT_ID) return null;
  try {
    const server = getServer();
    const tx = buildSimulateTransaction(method, ...params);
    const response = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationSuccess(response) && response.result) {
      return StellarSdk.scValToNative(response.result.retval) as T;
    }
  } catch (err) {
    console.warn(`Simulate query for ${method} error:`, err);
  }
  return null;
}

/**
 * Claim a Soulbound Token (SBT) for voter eligibility.
 */
export async function claimSbt(
  voterAddress: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<string> {
  if (!CONTRACT_ID) {
    await new Promise((res) => setTimeout(res, 800));
    return "SUCCESS_MOCK";
  }

  const params = [new StellarSdk.Address(voterAddress).toScVal()];
  const tx = await buildTransaction(voterAddress, "claim_sbt", params);
  const signedXdr = await signTransaction(tx.toXDR());
  const result = await submitTransaction(signedXdr);

  if (result.status === "SUCCESS") {
    return result.status;
  }
  throw new Error(`Transaction failed with status: ${result.status}`);
}

/**
 * Create a new community poll on-chain.
 */
export async function createPollOnChain(
  creatorAddress: string,
  optionsCount: number,
  signTransaction: (xdr: string) => Promise<string>
): Promise<{ status: string; pollId: number }> {
  if (!CONTRACT_ID) {
    await new Promise((res) => setTimeout(res, 1000));
    return { status: "SUCCESS_MOCK", pollId: Date.now() };
  }

  const params = [
    new StellarSdk.Address(creatorAddress).toScVal(),
    StellarSdk.nativeToScVal(optionsCount, { type: "u32" }),
  ];

  const tx = await buildTransaction(creatorAddress, "create_poll", params);
  const signedXdr = await signTransaction(tx.toXDR());
  const result = await submitTransaction(signedXdr);

  if (result.status === "SUCCESS") {
    return { status: result.status, pollId: 0 };
  }
  throw new Error(`Create poll failed: ${result.status}`);
}

/**
 * Vote for an option in a poll.
 */
export async function voteOnPoll(
  voterAddress: string,
  pollId: number,
  optionId: number,
  signTransaction: (xdr: string) => Promise<string>
): Promise<string> {
  if (!CONTRACT_ID) {
    await new Promise((res) => setTimeout(res, 800));
    return "SUCCESS_MOCK";
  }

  const params = [
    StellarSdk.nativeToScVal(pollId, { type: "u32" }),
    new StellarSdk.Address(voterAddress).toScVal(),
    StellarSdk.nativeToScVal(optionId, { type: "u32" }),
  ];

  const tx = await buildTransaction(voterAddress, "vote", params);
  const signedXdr = await signTransaction(tx.toXDR());
  const result = await submitTransaction(signedXdr);

  if (result.status === "SUCCESS") {
    return result.status;
  }
  throw new Error(`Vote failed with status: ${result.status}`);
}

/**
 * Backward compatibility alias for single-poll vote.
 */
export async function vote(
  voterAddress: string,
  candidateId: number,
  signTransaction: (xdr: string) => Promise<string>,
  pollId: number = 1
): Promise<string> {
  return voteOnPoll(voterAddress, pollId, candidateId, signTransaction);
}

/**
 * Check if a voter holds a Soulbound Token.
 */
export async function checkHasSbt(voterAddress: string): Promise<boolean> {
  const result = await simulateAndDecode<boolean>(
    "has_sbt",
    new StellarSdk.Address(voterAddress).toScVal()
  );
  return result ?? false;
}

/**
 * Get voter status for a specific poll.
 */
export async function getPollVoterStatus(
  pollId: number,
  voterAddress: string
): Promise<VoterStatusData> {
  const result = await simulateAndDecode<{
    has_sbt: boolean;
    has_voted: boolean;
    voted_option: number;
  }>(
    "get_poll_voter",
    StellarSdk.nativeToScVal(pollId, { type: "u32" }),
    new StellarSdk.Address(voterAddress).toScVal()
  );

  return result
    ? {
        hasSbt: result.has_sbt,
        hasVoted: result.has_voted,
        votedOption: result.voted_option,
      }
    : { hasSbt: false, hasVoted: false, votedOption: 0 };
}

/**
 * Get total number of polls on-chain.
 */
export async function getPollCount(): Promise<number> {
  const result = await simulateAndDecode<number>("get_poll_count");
  return result ?? 0;
}

export async function getCandidateCount(): Promise<number> {
  return getPollCount();
}

export async function getVotes(candidateId: number, pollId: number = 1): Promise<number> {
  const result = await simulateAndDecode<number>(
    "get_poll_votes",
    StellarSdk.nativeToScVal(pollId, { type: "u32" }),
    StellarSdk.nativeToScVal(candidateId, { type: "u32" })
  );
  return result ?? 0;
}

export async function isVotingOpen(): Promise<boolean> {
  return true;
}

export async function getVoterRecord(
  voterAddress: string,
  pollId: number = 1
): Promise<{ has_sbt: boolean; has_voted: boolean }> {
  const status = await getPollVoterStatus(pollId, voterAddress);
  return { has_sbt: status.hasSbt, has_voted: status.hasVoted };
}
