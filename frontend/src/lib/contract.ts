import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { buildTransaction, submitTransaction, getServer, CONTRACT_ID, NETWORK_PASSPHRASE } from "./stellar";

/**
 * Map VoteError codes to human-readable messages.
 */
export const ERROR_MESSAGES: Record<number, string> = {
  1: "Tidak memiliki izin: Hanya pembuat atau admin yang dapat melakukan aksi ini",
  2: "Periode voting untuk proposal ini sudah ditutup",
  3: "Anda sudah memberikan suara pada voting ini (1-person-1-vote)",
  4: "Anda belum memiliki Soulbound Token. Silakan klaim SBT Voter ID Anda terlebih dahulu!",
  5: "Opsi pilihan tidak valid",
  6: "Kontrak pintar sudah diinisialisasi sebelumnya",
  7: "Anda sudah memiliki Soulbound Token (tidak perlu klaim ulang)",
  8: "Voting / Proposal tidak ditemukan",
  9: "Jumlah opsi pilihan harus antara 2 dan 20",
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

/**
 * Parse raw Soroban / Stellar errors into clean, human-readable messages.
 */
export function parseContractError(error: unknown): string {
  if (!error) return "Terjadi kesalahan saat memproses transaksi.";
  const msg = error instanceof Error ? error.message : String(error);

  // Contract custom error codes: Error(Contract, #N)
  const codeMatch = msg.match(/Error\(Contract, #(\d+)\)/);
  if (codeMatch) {
    const code = Number(codeMatch[1]);
    return ERROR_MESSAGES[code] || `Error Kontrak #${code}`;
  }

  // Non-existent function (contract not redeployed yet)
  if (msg.includes("trying to invoke non-existent contract function") || msg.includes("non-existent contract function")) {
    if (msg.includes("claim_sbt")) {
      return "Fungsi 'claim_sbt' belum ada pada Contract ID saat ini. Silakan deploy ulang smart contract ke testnet dengan menjalankan 'make deploy'.";
    }
    return "Fungsi smart contract tidak ditemukan. Kontrak di testnet perlu diperbarui ke versi terbaru ('make deploy').";
  }

  // User rejected in Freighter
  if (msg.includes("User declined") || msg.includes("rejected") || msg.includes("Declined")) {
    return "Transaksi dibatalkan oleh pengguna di Freighter.";
  }

  // Missing value / WasmVm error
  if (msg.includes("MissingValue") || msg.includes("WasmVm")) {
    return "Terjadi kendala eksekusi Wasm pada smart contract. Pastikan contract ID di .env.local sesuai dengan deployment terbaru.";
  }

  // Insufficient balance
  if (msg.includes("insufficient balance") || msg.includes("underfunded")) {
    return "Saldo XLM testnet tidak mencukupi untuk biaya gas transaksi.";
  }

  // Fallback trimmed message
  if (msg.length > 180) {
    return msg.slice(0, 180) + "... (periksa console untuk detail teknis)";
  }

  return msg;
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
    await new Promise((res) => setTimeout(res, 600));
    return "SUCCESS_MOCK";
  }

  try {
    const params = [new StellarSdk.Address(voterAddress).toScVal()];
    const tx = await buildTransaction(voterAddress, "claim_sbt", params);
    const signedXdr = await signTransaction(tx.toXDR());
    const result = await submitTransaction(signedXdr);

    if (result.status === "SUCCESS") {
      return result.status;
    }
    throw new Error(`Transaction failed with status: ${result.status}`);
  } catch (err) {
    const parsed = parseContractError(err);
    throw new Error(parsed);
  }
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
    await new Promise((res) => setTimeout(res, 800));
    return { status: "SUCCESS_MOCK", pollId: Date.now() };
  }

  try {
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
  } catch (err) {
    const parsed = parseContractError(err);
    throw new Error(parsed);
  }
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
    await new Promise((res) => setTimeout(res, 600));
    return "SUCCESS_MOCK";
  }

  try {
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
  } catch (err) {
    const parsed = parseContractError(err);
    throw new Error(parsed);
  }
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
