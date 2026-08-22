import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { buildTransaction, submitTransaction, getServer } from "./stellar";

/**
 * Map VoteError codes to human-readable messages.
 */
export const ERROR_MESSAGES: Record<number, string> = {
  1: "Not authorized: only admin can perform this action",
  2: "Voting is currently closed",
  3: "You have already voted",
  4: "You do not have a Soulbound Token",
  5: "Invalid candidate ID",
  6: "Contract is already initialized",
  7: "Voter already has an SBT",
};

export type TransactionStatus =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "success"
  | "error";

// Simulate-only account (zero-balance, used for read queries)
const SIMULATE_ACCOUNT = new StellarSdk.Account(
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  "0"
);

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";

function buildSimulateTransaction(
  method: string,
  ...params: StellarSdk.xdr.ScVal[]
): StellarSdk.Transaction {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
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
  const server = getServer();
  const tx = buildSimulateTransaction(method, ...params);
  const response = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationSuccess(response) && response.result) {
    return StellarSdk.scValToNative(response.result.retval) as T;
  }
  return null;
}

/**
 * Vote for a candidate.
 */
export async function vote(
  voterAddress: string,
  candidateId: number,
  signTransaction: (xdr: string) => Promise<string>
): Promise<string> {
  const params = [
    StellarSdk.nativeToScVal(voterAddress, { type: "address" }),
    StellarSdk.nativeToScVal(candidateId, { type: "u32" }),
  ];

  const tx = await buildTransaction(voterAddress, "vote", params);
  const signedXdr = await signTransaction(tx.toXDR());
  const result = await submitTransaction(signedXdr);

  if (result.status === "SUCCESS") {
    return result.status;
  }
  throw new Error(`Transaction failed with status: ${result.status}`);
}

/**
 * Get votes for a candidate (read-only, no signing needed).
 */
export async function getVotes(candidateId: number): Promise<number> {
  const result = await simulateAndDecode<number>(
    "get_votes",
    StellarSdk.nativeToScVal(candidateId, { type: "u32" })
  );
  return result ?? 0;
}

/**
 * Get the number of registered candidates.
 */
export async function getCandidateCount(): Promise<number> {
  const result = await simulateAndDecode<number>("get_candidate_count");
  return result ?? 0;
}

/**
 * Check if voting is open.
 */
export async function isVotingOpen(): Promise<boolean> {
  const result = await simulateAndDecode<boolean>("is_voting_open");
  return result ?? false;
}

/**
 * Get voter record (has_sbt, has_voted).
 */
export async function getVoterRecord(
  voterAddress: string
): Promise<{ has_sbt: boolean; has_voted: boolean }> {
  const result = await simulateAndDecode<{
    has_sbt: boolean;
    has_voted: boolean;
  }>("get_voter", StellarSdk.nativeToScVal(voterAddress, { type: "address" }));
  return result ?? { has_sbt: false, has_voted: false };
}
