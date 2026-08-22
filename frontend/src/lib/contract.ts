import * as StellarSdk from "@stellar/stellar-sdk";
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
  const server = getServer();
  const contract = new StellarSdk.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ID || ""
  );

  const tx = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    ),
    {
      fee: "100000",
      networkPassphrase:
        process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
        "Test SDF Network ; September 2015",
    }
  )
    .addOperation(
      contract.call(
        "get_votes",
        StellarSdk.nativeToScVal(candidateId, { type: "u32" })
      )
    )
    .setTimeout(30)
    .build();

  const response = await server.simulateTransaction(tx);

  if (
    StellarSdk.SorobanRpc.Api.isSimulationSuccess(response) &&
    response.result
  ) {
    return StellarSdk.scValToNative(response.result.retval) as number;
  }

  return 0;
}

/**
 * Get the number of registered candidates.
 */
export async function getCandidateCount(): Promise<number> {
  const server = getServer();
  const contract = new StellarSdk.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ID || ""
  );

  const tx = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    ),
    {
      fee: "100000",
      networkPassphrase:
        process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
        "Test SDF Network ; September 2015",
    }
  )
    .addOperation(contract.call("get_candidate_count"))
    .setTimeout(30)
    .build();

  const response = await server.simulateTransaction(tx);

  if (
    StellarSdk.SorobanRpc.Api.isSimulationSuccess(response) &&
    response.result
  ) {
    return StellarSdk.scValToNative(response.result.retval) as number;
  }

  return 0;
}

/**
 * Check if voting is open.
 */
export async function isVotingOpen(): Promise<boolean> {
  const server = getServer();
  const contract = new StellarSdk.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ID || ""
  );

  const tx = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    ),
    {
      fee: "100000",
      networkPassphrase:
        process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
        "Test SDF Network ; September 2015",
    }
  )
    .addOperation(contract.call("is_voting_open"))
    .setTimeout(30)
    .build();

  const response = await server.simulateTransaction(tx);

  if (
    StellarSdk.SorobanRpc.Api.isSimulationSuccess(response) &&
    response.result
  ) {
    return StellarSdk.scValToNative(response.result.retval) as boolean;
  }

  return false;
}

/**
 * Get voter record (has_sbt, has_voted).
 */
export async function getVoterRecord(
  voterAddress: string
): Promise<{ has_sbt: boolean; has_voted: boolean }> {
  const server = getServer();
  const contract = new StellarSdk.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ID || ""
  );

  const tx = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    ),
    {
      fee: "100000",
      networkPassphrase:
        process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
        "Test SDF Network ; September 2015",
    }
  )
    .addOperation(
      contract.call(
        "get_voter",
        StellarSdk.nativeToScVal(voterAddress, { type: "address" })
      )
    )
    .setTimeout(30)
    .build();

  const response = await server.simulateTransaction(tx);

  if (
    StellarSdk.SorobanRpc.Api.isSimulationSuccess(response) &&
    response.result
  ) {
    const val = StellarSdk.scValToNative(response.result.retval);
    return val as { has_sbt: boolean; has_voted: boolean };
  }

  return { has_sbt: false, has_voted: false };
}
