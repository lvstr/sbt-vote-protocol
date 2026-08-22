"use client";

import { TransactionStatus } from "@/lib/contract";

interface Props {
  status: TransactionStatus;
  error?: string | null;
}

export function TransactionStatusBadge({ status, error }: Props) {
  if (status === "idle") return null;

  if (
    status === "building" ||
    status === "signing" ||
    status === "submitting"
  ) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-sm">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>
          {status === "building" && "Membangun transaksi..."}
          {status === "signing" && "Menunggu tanda tangan di Freighter..."}
          {status === "submitting" && "Mengirim ke jaringan Stellar..."}
        </span>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Suara berhasil dicatat di blockchain.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <span>{error || "Transaksi gagal"}</span>
    </div>
  );
}
