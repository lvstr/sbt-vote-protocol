"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";
import { claimSbt, TransactionStatus, parseContractError } from "@/lib/contract";
import { UserVoteRecord, Poll, claimStoredSbt } from "@/lib/pollStore";
import { TransactionStatusBadge } from "./TransactionStatus";

interface SbtBadgeModalProps {
  isOpen: boolean;
  hasSbt: boolean;
  userVotes: UserVoteRecord[];
  polls: Poll[];
  onClose: () => void;
  onSbtClaimed: () => void;
}

export const SbtBadgeModal: React.FC<SbtBadgeModalProps> = ({
  isOpen,
  hasSbt,
  userVotes,
  polls,
  onClose,
  onSbtClaimed,
}) => {
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
      }, 1000);
    } catch (err) {
      setTxStatus("error");
      const msg = parseContractError(err);
      setErrorMessage(msg);
    }
  };

  const handleLocalBypass = () => {
    if (address) {
      claimStoredSbt(address);
      onSbtClaimed();
      setTxStatus("idle");
      setErrorMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="app-panel w-full max-w-md p-6 sm:p-7 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">
            Soulbound Token (SBT)
          </h2>
          <p className="text-xs text-slate-400">
            Identitas pemilih terverifikasi di jaringan Stellar Soroban.
          </p>
        </div>

        {/* Digital Passport Card */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center p-1">
                <Image src="/soulbound.png" alt="" width={18} height={18} />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                VOTER PASSPORT
              </span>
            </div>

            <span
              className={`badge text-[11px] ${
                hasSbt ? "badge-emerald" : "badge-amber"
              }`}
            >
              {hasSbt ? "Terverifikasi ✓" : "Belum Diklaim"}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">
                Alamat Akun
              </div>
              <div className="text-slate-300 truncate bg-slate-900 p-2 rounded border border-slate-800 text-[11px] mt-0.5">
                {address || "Wallet Belum Terhubung"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase">Hak Suara</div>
                <div className="text-emerald-400 font-semibold">1-Person-1-Vote</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[9px] text-slate-500 uppercase">Tipe Token</div>
                <div className="text-blue-400 font-semibold">Non-Transferable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action / Vote History */}
        {!isConnected ? (
          <p className="text-center text-xs text-slate-400">
            Hubungkan wallet Freighter untuk mengklaim atau melihat status SBT.
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
              className="btn-primary w-full py-2.5 font-medium text-xs sm:text-sm"
            >
              {txStatus === "building" && "Membangun Transaksi..."}
              {txStatus === "signing" && "Menunggu Tanda Tangan..."}
              {txStatus === "submitting" && "Mendaftarkan SBT On-Chain..."}
              {txStatus === "idle" && "Klaim SBT Voter ID (Gratis) ⚡"}
              {txStatus === "success" && "SBT Berhasil Diklaim! ✓"}
              {txStatus === "error" && "Coba Klaim Lagi"}
            </button>

            <TransactionStatusBadge status={txStatus} error={errorMessage} />

            {txStatus === "error" && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleLocalBypass}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Gunakan Verifikasi SBT Cepat (Mode Demo / Lokal) →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-300">
              Riwayat Suara Anda ({userVotes.length} proposal)
            </div>
            {userVotes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-950 rounded-lg border border-slate-800">
                Belum ada riwayat suara.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {userVotes.map((v, i) => {
                  const p = polls.find((poll) => poll.id === v.pollId);
                  const opt = p?.options.find((o) => o.id === v.optionId);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 rounded bg-slate-950 border border-slate-800"
                    >
                      <span className="truncate max-w-[180px] text-slate-300">
                        {p?.title || `Poll #${v.pollId}`}
                      </span>
                      <span className="text-blue-400 shrink-0 font-medium">
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
};

export default SbtBadgeModal;
