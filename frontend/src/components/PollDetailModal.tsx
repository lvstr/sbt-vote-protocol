"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Poll, UserVoteRecord, toggleStoredPollStatus } from "@/lib/pollStore";
import { voteOnPoll, TransactionStatus, ERROR_MESSAGES } from "@/lib/contract";
import { TransactionStatusBadge } from "./TransactionStatus";

interface PollDetailModalProps {
  poll: Poll | null;
  userVote?: UserVoteRecord;
  hasSbt: boolean;
  onClose: () => void;
  onVoteCast: (pollId: number, optionId: number) => void;
  onClaimSbtPrompt: () => void;
  onPollUpdated: (updatedPoll: Poll) => void;
}

export const PollDetailModal: React.FC<PollDetailModalProps> = ({
  poll,
  userVote,
  hasSbt,
  onClose,
  onVoteCast,
  onClaimSbtPrompt,
  onPollUpdated,
}) => {
  const { address, isConnected, signTransaction } = useWallet();

  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!poll) return null;

  const totalVotes = poll.totalVotes;
  const hasUserVoted = !!userVote;
  const isCreator = address && address.toLowerCase() === poll.creator.toLowerCase();

  const handleVote = async () => {
    if (!address || !selectedOption) return;

    if (!hasSbt) {
      onClaimSbtPrompt();
      return;
    }

    setTxStatus("building");
    setErrorMessage(null);

    try {
      setTxStatus("signing");
      await voteOnPoll(address, poll.id, selectedOption, signTransaction);
      setTxStatus("submitting");

      onVoteCast(poll.id, selectedOption);
      setTxStatus("success");
    } catch (err) {
      setTxStatus("error");
      const msg = err instanceof Error ? err.message : "Gagal memberikan suara";
      const match = msg.match(/Error\(Contract, #(\d+)\)/);
      if (match) {
        setErrorMessage(ERROR_MESSAGES[Number(match[1])] || `Error on-chain #${match[1]}`);
      } else {
        setErrorMessage(msg);
      }
    }
  };

  const handleToggleStatus = () => {
    if (!address) return;
    const res = toggleStoredPollStatus(poll.id, address);
    if (res.success && res.poll) {
      onPollUpdated(res.poll);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}?poll=${poll.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="app-panel w-full max-w-xl p-6 sm:p-7 space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        {/* Top Badges & Share */}
        <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
          <div className="flex items-center gap-2">
            <span className="badge badge-purple text-xs">
              {poll.category}
            </span>
            <span className="badge badge-slate text-xs font-mono">
              Poll #{poll.id}
            </span>
            <span
              className={`badge text-xs ${
                poll.isOpen ? "badge-emerald" : "badge-slate text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  poll.isOpen ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              {poll.isOpen ? "Aktif" : "Ditutup"}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-950 border border-slate-800 transition-colors"
          >
            {copiedLink ? "Link Disalin! ✓" : "Bagi Link"}
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white leading-snug">
            {poll.title}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            {poll.description}
          </p>
        </div>

        {/* Status / SBT Prompt */}
        {!isConnected ? (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
            Hubungkan wallet Freighter Anda untuk memberikan suara.
          </div>
        ) : !hasSbt ? (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-2 text-xs text-amber-300">
            <span>Perlu Soulbound Token (SBT) Voter ID untuk memilih.</span>
            <button
              onClick={onClaimSbtPrompt}
              className="btn-primary text-xs px-2.5 py-1 shrink-0"
            >
              Klaim SBT ID
            </button>
          </div>
        ) : hasUserVoted ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
            ✓ Suara Anda tercatat on-chain untuk opsi:{" "}
            <strong>
              {poll.options.find((o) => o.id === userVote?.optionId)?.text || `Opsi ${userVote?.optionId}`}
            </strong>
          </div>
        ) : null}

        {/* Options List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Pilihan Opsi</span>
            <span className="text-slate-400 font-normal">
              Total {totalVotes} suara
            </span>
          </div>

          <div className="space-y-2">
            {poll.options.map((opt) => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isSelected = selectedOption === opt.id;
              const isUserPick = userVote?.optionId === opt.id;
              const canSelect = !hasUserVoted && poll.isOpen && isConnected;

              return (
                <label
                  key={opt.id}
                  onClick={() => canSelect && setSelectedOption(opt.id)}
                  className={`block p-3.5 rounded-lg border transition-colors ${
                    canSelect ? "cursor-pointer" : "cursor-default"
                  } ${
                    isSelected
                      ? "bg-blue-950/40 border-blue-500"
                      : isUserPick
                      ? "bg-emerald-950/40 border-emerald-500/60"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {canSelect && (
                        <input
                          type="radio"
                          name="poll_option"
                          checked={isSelected}
                          onChange={() => setSelectedOption(opt.id)}
                          className="w-3.5 h-3.5 text-blue-600 border-slate-700 focus:ring-blue-500"
                        />
                      )}
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isSelected
                            ? "text-blue-300 font-semibold"
                            : isUserPick
                            ? "text-emerald-300 font-semibold"
                            : "text-slate-200"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400">
                      {pct}% ({opt.votes})
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUserPick
                          ? "bg-emerald-500"
                          : isSelected
                          ? "bg-blue-500"
                          : "bg-slate-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Voting Action */}
        {poll.isOpen && !hasUserVoted && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleVote}
              disabled={
                !selectedOption ||
                txStatus === "building" ||
                txStatus === "signing" ||
                txStatus === "submitting"
              }
              className="btn-primary w-full py-2.5 text-sm"
            >
              {txStatus === "building" && "Membangun Transaksi..."}
              {txStatus === "signing" && "Menunggu Tanda Tangan Freighter..."}
              {txStatus === "submitting" && "Mencatat ke Blockchain..."}
              {txStatus === "idle" &&
                (selectedOption ? "Kirim Suara On-Chain" : "Pilih Opsi Terlebih Dahulu")}
              {txStatus === "success" && "Suara Berhasil Dicatat! ✓"}
              {txStatus === "error" && "Coba Lagi"}
            </button>

            <TransactionStatusBadge status={txStatus} error={errorMessage} />
          </div>
        )}

        {/* Creator Controls */}
        {isCreator && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Anda adalah pembuat proposal ini</span>
            <button
              onClick={handleToggleStatus}
              className="btn-secondary text-xs px-2.5 py-1"
            >
              {poll.isOpen ? "Tutup Voting" : "Buka Kembali"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollDetailModal;
