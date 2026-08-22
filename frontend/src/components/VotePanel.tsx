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

      // Try to parse contract error code
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
      <div className="bg-stellar-card border border-stellar-border rounded-xl p-6 text-center">
        <p className="text-gray-400">Connect your wallet to vote</p>
      </div>
    );
  }

  return (
    <div className="bg-stellar-card border border-stellar-border rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Cast Your Vote</h2>

      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: candidateCount }, (_, i) => i + 1).map((id) => (
          <button
            key={id}
            onClick={() => setSelectedCandidate(id)}
            className={`p-3 rounded-lg border transition-all ${
              selectedCandidate === id
                ? "border-stellar-purple bg-stellar-purple/20"
                : "border-stellar-border hover:border-gray-500"
            }`}
          >
            Candidate #{id}
          </button>
        ))}
      </div>

      {candidateCount === 0 && (
        <p className="text-sm text-gray-400">No candidates registered yet</p>
      )}

      <button
        onClick={handleVote}
        disabled={!selectedCandidate || txStatus === "signing" || txStatus === "submitting"}
        className="w-full py-3 bg-stellar-blue rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {txStatus === "signing" || txStatus === "submitting"
          ? "Processing..."
          : "Vote"}
      </button>

      <TransactionStatusBadge status={txStatus} error={errorMessage} />
    </div>
  );
}
