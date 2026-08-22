"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isConnected) {
      setTxStatus("idle");
      setErrorMessage(null);
      setSelectedCandidate(0);
    }
  }, [isConnected]);

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
        err instanceof Error ? err.message : "Terjadi kesalahan";

      const errorCodeMatch = message.match(/Error\(Contract, #(\d+)\)/);
      if (errorCodeMatch) {
        const code = parseInt(errorCodeMatch[1]);
        setErrorMessage(ERROR_MESSAGES[code] || `Error kontrak #${code}`);
      } else {
        setErrorMessage(message);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-gray-600 text-sm">Hubungkan wallet untuk memberikan suara</p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Pilih Kandidat</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Pilih satu kandidat. Suara bersifat final dan tidak dapat diubah.
        </p>
      </div>

      {candidateCount === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          Belum ada kandidat terdaftar.
        </p>
      ) : (
        <div className="space-y-2">
          {Array.from({ length: candidateCount }, (_, i) => i + 1).map((id) => (
            <label
              key={id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedCandidate === id
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="candidate"
                value={id}
                checked={selectedCandidate === id}
                onChange={() => setSelectedCandidate(id)}
                className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedCandidate === id
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {id}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  Kandidat {id}
                </span>
              </div>
            </label>
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
        className="btn-primary w-full"
      >
        {txStatus === "signing" || txStatus === "submitting" || txStatus === "building"
          ? "Memproses..."
          : "Kirim Suara"}
      </button>

      <TransactionStatusBadge status={txStatus} error={errorMessage} />
    </div>
  );
}
