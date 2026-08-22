"use client";

import { TransactionStatus } from "@/lib/contract";

interface Props {
  status: TransactionStatus;
  error?: string | null;
}

export function TransactionStatusBadge({ status, error }: Props) {
  if (status === "idle") return null;

  const config: Record<
    Exclude<TransactionStatus, "idle">,
    { label: string; color: string }
  > = {
    building: { label: "Building transaction...", color: "text-yellow-400" },
    signing: { label: "Waiting for signature...", color: "text-yellow-400" },
    submitting: { label: "Submitting to network...", color: "text-blue-400" },
    success: { label: "Transaction successful!", color: "text-green-400" },
    error: { label: error || "Transaction failed", color: "text-red-400" },
  };

  const { label, color } = config[status];

  return (
    <div className={`text-sm font-medium ${color} mt-2`}>
      <span className="inline-flex items-center gap-2">
        {(status === "building" ||
          status === "signing" ||
          status === "submitting") && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {status === "success" && <span>&#10003;</span>}
        {status === "error" && <span>&#10007;</span>}
        {label}
      </span>
    </div>
  );
}
