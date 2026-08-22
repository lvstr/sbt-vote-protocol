"use client";

interface VoterStatusProps {
  hasSbt: boolean;
  hasVoted: boolean;
  isLoading: boolean;
}

export function VoterStatus({ hasSbt, hasVoted, isLoading }: VoterStatusProps) {
  if (isLoading) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <StatusTag
          active={hasSbt}
          label={hasSbt ? "SBT Aktif" : "Belum Punya SBT"}
          description={hasSbt ? "Identitas terverifikasi" : "Hubungi admin untuk mint"}
        />
        <div className="w-px h-8 bg-gray-200 hidden sm:block" />
        <StatusTag
          active={hasVoted}
          label={hasVoted ? "Sudah Memilih" : "Belum Memilih"}
          description={hasVoted ? "Suara tercatat permanen" : "Anda berhak memberikan suara"}
        />
      </div>
    </div>
  );
}

function StatusTag({
  active,
  label,
  description,
}: {
  active: boolean;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"
        }`}
      >
        {active ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div>
        <p className={`text-sm font-medium ${active ? "text-teal-800" : "text-gray-600"}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
