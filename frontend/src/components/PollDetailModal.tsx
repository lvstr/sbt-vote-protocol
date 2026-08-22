"use client";

import { useState } from "react";
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

export function PollDetailModal({
  poll,
  userVote,
  hasSbt,
  onClose,
  onVoteCast,
  onClaimSbtPrompt,
  onPollUpdated,
}: PollDetailModalProps) {
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

      // Update local state
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top Badges & Share */}
        <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {poll.category}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
              Poll #{poll.id}
            </span>
            <span
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                poll.isOpen
                  ? "text-emerald-300 bg-emerald-950/40 border border-emerald-500/20"
                  : "text-slate-400 bg-slate-800 border border-slate-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  poll.isOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              {poll.isOpen ? "Voting Dibuka" : "Voting Ditutup"}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-300 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.52a4.5 4.5 0 00-6.364-6.364L4.5 8.257" />
            </svg>
            <span>{copiedLink ? "Link Disalin! ✓" : "Bagi Link"}</span>
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            {poll.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            {poll.description}
          </p>
        </div>

        {/* Voter Eligibility / Status Banner */}
        {!isConnected ? (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Hubungkan wallet Freighter Anda untuk melihat status suara.
            </span>
          </div>
        ) : !hasSbt ? (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-200">
              <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>Anda belum memiliki SBT Voter ID. Klaim gratis sekarang untuk ikut memilih.</span>
            </div>
            <button
              onClick={onClaimSbtPrompt}
              className="btn-gold text-xs px-3.5 py-1.5 shrink-0"
            >
              Klaim SBT ID
            </button>
          </div>
        ) : hasUserVoted ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-200">
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Suara Anda telah tercatat on-chain untuk opsi:{" "}
              <strong>
                {poll.options.find((o) => o.id === userVote?.optionId)?.text || `Opsi ${userVote?.optionId}`}
              </strong>
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-brand-950/30 border border-brand-500/30 flex items-center gap-2 text-xs text-brand-200">
            <svg className="w-4 h-4 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <span>Identitas SBT Terverifikasi: Pilih salah satu opsi di bawah ini.</span>
          </div>
        )}

        {/* Options List & Live Tally */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Pilihan Kandidat / Opsi</span>
            <span className="text-slate-400 font-normal">
              Total {totalVotes} suara terkumpul
            </span>
          </div>

          <div className="space-y-2.5">
            {poll.options.map((opt) => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isSelected = selectedOption === opt.id;
              const isUserPick = userVote?.optionId === opt.id;
              const canSelect = !hasUserVoted && poll.isOpen && isConnected;

              return (
                <label
                  key={opt.id}
                  onClick={() => canSelect && setSelectedOption(opt.id)}
                  className={`block p-4 rounded-xl border transition-all duration-200 ${
                    canSelect ? "cursor-pointer" : "cursor-default"
                  } ${
                    isSelected
                      ? "bg-brand-950/50 border-brand-500/80 shadow-md shadow-brand-500/10"
                      : isUserPick
                      ? "bg-emerald-950/40 border-emerald-500/60"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {canSelect && (
                        <input
                          type="radio"
                          name="poll_option"
                          checked={isSelected}
                          onChange={() => setSelectedOption(opt.id)}
                          className="w-4 h-4 text-brand-500 border-slate-700 focus:ring-brand-500"
                        />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          isSelected
                            ? "text-brand-200"
                            : isUserPick
                            ? "text-emerald-300"
                            : "text-slate-100"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {pct}%
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5 font-mono">
                        ({opt.votes})
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 w-full bg-slate-800/90 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUserPick
                          ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                          : isSelected
                          ? "bg-gradient-to-r from-brand-400 to-cyan-300"
                          : "bg-gradient-to-r from-brand-600 to-teal-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Voting Action Section */}
        {poll.isOpen && !hasUserVoted && (
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={handleVote}
              disabled={
                !selectedOption ||
                txStatus === "building" ||
                txStatus === "signing" ||
                txStatus === "submitting"
              }
              className="btn-primary w-full py-3 text-sm font-bold shadow-cyan-500/25"
            >
              {txStatus === "building" && "Membangun Transaksi..."}
              {txStatus === "signing" && "Menunggu Tanda Tangan Freighter..."}
              {txStatus === "submitting" && "Mencatat Suara ke Stellar..."}
              {txStatus === "idle" &&
                (selectedOption ? "Kirim Suara On-Chain 🚀" : "Pilih Opsi Terlebih Dahulu")}
              {txStatus === "success" && "Suara Berhasil Dicatat! ✓"}
              {txStatus === "error" && "Coba Lagi"}
            </button>

            <TransactionStatusBadge status={txStatus} error={errorMessage} />
          </div>
        )}

        {/* Creator Controls */}
        {isCreator && (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Anda adalah pembuat voting ini</span>
            <button
              onClick={handleToggleStatus}
              className="btn-outline text-xs px-3 py-1 text-slate-300"
            >
              {poll.isOpen ? "Tutup Voting Sekarang" : "Buka Kembali Voting"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
