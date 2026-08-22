"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { vote, ERROR_MESSAGES, TransactionStatus } from "@/lib/contract";
import { TransactionStatusBadge } from "./TransactionStatus";

interface VotePanelProps {
  candidateCount: number;
  onVoteSuccess: () => void;
}

export function VotePanel({ candidateCount, onVoteSuccess }: VotePanelProps) {
  const { address, isConnected, signTransaction } = useWallet();
  const [selectedCandidate, setSelectedCandidate] = useState<number>(0);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVote = async () => {
    if (!address || !selectedCandidate) return;

    setTxStatus("building");
    setErrorMessage(null);

    try {
      setTxStatus("signing");
      await vote(address, selectedCandidate, signTransaction);
      setTxStatus("success");
      onVoteSuccess();
    } catch (err) {
      setTxStatus("error");
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";

      const errorCodeMatch = message.match(/Error\(Contract, #(\d+)\)/);
      if (errorCodeMatch) {
        const code = parseInt(errorCodeMatch[1]);
        setErrorMessage(ERROR_MESSAGES[code] || `Contract error #${code}`);
      } else {
        setErrorMessage(message);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-12 h-12 text-surface-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
          />
        </svg>
        <p className="text-gray-400 text-sm">
          Connect your wallet to cast a vote
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cast Your Vote</h2>
        <span className="badge bg-surface-300 text-gray-400">
          {candidateCount} candidate{candidateCount !== 1 ? "s" : ""}
        </span>
      </div>

      {candidateCount === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No candidates registered yet
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: candidateCount }, (_, i) => i + 1).map((id) => (
            <button
              key={id}
              onClick={() => setSelectedCandidate(id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedCandidate === id
                  ? "border-brand-500 bg-brand-950/30 shadow-lg shadow-brand-950/30"
                  : "border-surface-300 hover:border-surface-500 bg-surface-200/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    selectedCandidate === id
                      ? "bg-brand-600 text-white"
                      : "bg-surface-300 text-gray-400"
                  }`}
                >
                  {id}
                </div>
                <div>
                  <p className="font-medium text-sm">Candidate #{id}</p>
                  <p className="text-xs text-gray-500">Tap to select</p>
                </div>
              </div>
              {selectedCandidate === id && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-5 h-5 text-brand-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleVote}
        disabled={
          !selectedCandidate ||
          txStatus === "signing" ||
          txStatus === "submitting" ||
          txStatus === "building"
        }
        className="btn-primary w-full py-3 text-base"
      >
        {txStatus === "signing" || txStatus === "submitting" || txStatus === "building"
          ? "Processing..."
          : "Submit Vote"}
      </button>

      <TransactionStatusBadge status={txStatus} error={errorMessage} />
    </div>
  );
}
