"use client";

import { useState } from "react";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";
import { claimSbt, TransactionStatus, ERROR_MESSAGES } from "@/lib/contract";
import { UserVoteRecord, Poll } from "@/lib/pollStore";
import { TransactionStatusBadge } from "./TransactionStatus";

interface SbtBadgeModalProps {
  isOpen: boolean;
  hasSbt: boolean;
  userVotes: UserVoteRecord[];
  polls: Poll[];
  onClose: () => void;
  onSbtClaimed: () => void;
}

export function SbtBadgeModal({
  isOpen,
  hasSbt,
  userVotes,
  polls,
  onClose,
  onSbtClaimed,
}: SbtBadgeModalProps) {
  const { address, isConnected, signTransaction } = useWallet();
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaim = async () => {
    if (!address) return;

    setTxStatus("building");
    setErrorMessage(null);

    try {
      setTxStatus("signing");
      await claimSbt(address, signTransaction);
      setTxStatus("submitting");
      setTxStatus("success");
      onSbtClaimed();
      setTimeout(() => {
        setTxStatus("idle");
      }, 1500);
    } catch (err) {
      setTxStatus("error");
      const msg = err instanceof Error ? err.message : "Gagal mengklaim SBT";
      const match = msg.match(/Error\(Contract, #(\d+)\)/);
      if (match) {
        setErrorMessage(ERROR_MESSAGES[Number(match[1])] || `Error on-chain #${match[1]}`);
      } else {
        setErrorMessage(msg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-lg p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">
            Identitas Soulbound (SBT)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Kredensial identitas on-chain permanen untuk hak suara di ekosistem Stellar.
          </p>
        </div>

        {/* Digital Holographic Card */}
        <div className="relative mx-auto max-w-sm">
          {/* Card glow flare */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-brand-500/40 via-purple-500/30 to-amber-500/30 rounded-3xl blur-lg opacity-75 animate-pulse-slow -z-10" />

          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#0c1220] border border-brand-500/40 p-6 shadow-2xl space-y-6 overflow-hidden">
            {/* Background watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
              <Image src="/soulbound.png" alt="" width={180} height={180} />
            </div>

            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center p-1.5">
                  <Image src="/soulbound.png" alt="" width={24} height={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    SOULBOUND PASSPORT
                  </div>
                  <div className="text-[10px] text-brand-300">
                    Stellar Soroban Network
                  </div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  hasSbt
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                }`}
              >
                {hasSbt ? "VERIFIED ID ✓" : "UNCLAIMED"}
              </span>
            </div>

            {/* Identity Details */}
            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Holder Address
                </div>
                <div className="text-slate-200 text-[11px] truncate bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  {address || "Wallet Belum Terhubung"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                  <div className="text-[9px] text-slate-500 uppercase">Hak Suara</div>
                  <div className="text-emerald-400 font-semibold">1-Person-1-Vote</div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                  <div className="text-[9px] text-slate-500 uppercase">Status Transfer</div>
                  <div className="text-purple-400 font-semibold">Non-Transferable</div>
                </div>
              </div>
            </div>

            {/* Footer warning */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-3">
              <svg className="w-4 h-4 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span>Token ini terikat permanen pada akun Stellar Anda.</span>
            </div>
          </div>
        </div>

        {/* Claim / Action Button */}
        {!isConnected ? (
          <p className="text-center text-xs text-slate-400">
            Hubungkan wallet Freighter terlebih dahulu untuk mengklaim SBT.
          </p>
        ) : !hasSbt ? (
          <div className="space-y-3">
            <button
              onClick={handleClaim}
              disabled={
                txStatus === "building" ||
                txStatus === "signing" ||
                txStatus === "submitting"
              }
              className="btn-gold w-full py-3 text-sm font-bold shadow-amber-500/25"
            >
              {txStatus === "building" && "Membangun Transaksi..."}
              {txStatus === "signing" && "Menunggu Tanda Tangan..."}
              {txStatus === "submitting" && "Mendaftarkan ke Blockchain..."}
              {txStatus === "idle" && "Klaim SBT Voter ID Saya (Gratis) ⚡"}
              {txStatus === "success" && "SBT Berhasil Diklaim! ✓"}
              {txStatus === "error" && "Coba Lagi"}
            </button>

            <TransactionStatusBadge status={txStatus} error={errorMessage} />
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-300">
              Riwayat Suara Anda ({userVotes.length} voting)
            </div>
            {userVotes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3 bg-slate-900/40 rounded-xl border border-slate-800">
                Anda belum memberikan suara pada voting apa pun.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {userVotes.map((v, i) => {
                  const p = polls.find((poll) => poll.id === v.pollId);
                  const opt = p?.options.find((o) => o.id === v.optionId);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
                    >
                      <span className="truncate max-w-[200px] text-slate-200 font-medium">
                        {p?.title || `Poll #${v.pollId}`}
                      </span>
                      <span className="text-brand-300 shrink-0 font-semibold">
                        {opt?.text || `Opsi #${v.optionId}`} ✓
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
