import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "testnet";
export const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";
export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
  "https://soroban-testnet.stellar.org";
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";

export function getServer(): rpc.Server {
  return new rpc.Server(SOROBAN_RPC_URL);
}

export function getContract(): StellarSdk.Contract {
  return new StellarSdk.Contract(CONTRACT_ID);
}

/**
 * Build a transaction for contract invocation.
 */
export async function buildTransaction(
  sourceAddress: string,
  method: string,
  params: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.Transaction> {
  const server = getServer();
  const account = await server.getAccount(sourceAddress);
  const contract = getContract();

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...params))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared as StellarSdk.Transaction;
}

/**
 * Submit a signed transaction and wait for result.
 */
export async function submitTransaction(
  signedXdr: string
): Promise<rpc.Api.GetTransactionResponse> {
  const server = getServer();
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );
  const response = await server.sendTransaction(tx);

  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${response.status}`);
  }

  // Poll for result
  let result = await server.getTransaction(response.hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    result = await server.getTransaction(response.hash);
  }

  return result;
}

/**
 * Fetch recent contract events from Soroban RPC.
 */
export async function getContractEvents(
  startLedger?: number
): Promise<rpc.Api.GetEventsResponse> {
  const server = getServer();

  const latestLedger = await server.getLatestLedger();
  const start = startLedger || latestLedger.sequence - 1000;

  return server.getEvents({
    startLedger: start,
    filters: [
      {
        type: "contract",
        contractIds: [CONTRACT_ID],
      },
    ],
    limit: 50,
  });
}
