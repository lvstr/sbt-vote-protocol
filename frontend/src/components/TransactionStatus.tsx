"use client";

import { TransactionStatus } from "@/lib/contract";

interface Props {
  status: TransactionStatus;
  error?: string | null;
}

export function TransactionStatusBadge({ status, error }: Props) {
  if (status === "idle") return null;

  return (
    <div className="animate-slide-up mt-3">
      {(status === "building" ||
        status === "signing" ||
        status === "submitting") && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-950/30 border border-brand-800/30">
          <div className="w-5 h-5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin shrink-0" />
          <span className="text-sm text-brand-300">
            {status === "building" && "Building transaction..."}
            {status === "signing" && "Confirm in Freighter..."}
            {status === "submitting" && "Submitting to Stellar..."}
          </span>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-950/30 border border-green-800/30">
          <svg
            className="w-5 h-5 text-green-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-green-300">
            Vote submitted successfully!
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-950/30 border border-red-800/30">
          <svg
            className="w-5 h-5 text-red-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <span className="text-sm text-red-300">
            {error || "Transaction failed"}
          </span>
        </div>
      )}
    </div>
  );
}
