"use client";

import React from "react";
import { TransactionStatus } from "@/lib/contract";

interface Props {
  status: TransactionStatus;
  error?: string | null;
}

export const TransactionStatusBadge: React.FC<Props> = ({ status, error }) => {
  if (status === "idle") return null;

  if (
    status === "building" ||
    status === "signing" ||
    status === "submitting"
  ) {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
        <svg className="w-4 h-4 animate-spin text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>
          {status === "building" && "Membangun transaksi on-chain..."}
          {status === "signing" && "Menunggu tanda tangan di Freighter..."}
          {status === "submitting" && "Mengirim dan mencatat ke Stellar Soroban..."}
        </span>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Transaksi berhasil dicatat di blockchain Stellar.</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
      <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <div className="flex-1 min-w-0 break-words leading-relaxed text-[11px] sm:text-xs">
        {error || "Transaksi gagal dieksekusi"}
      </div>
    </div>
  );
};

export default TransactionStatusBadge;
