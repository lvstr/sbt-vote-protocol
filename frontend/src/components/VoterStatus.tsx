"use client";

interface VoterStatusProps {
  address: string | null;
  hasSbt: boolean;
  hasVoted: boolean;
  isLoading: boolean;
}

export function VoterStatus({
  address,
  hasSbt,
  hasVoted,
  isLoading,
}: VoterStatusProps) {
  if (!address) return null;

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Voter Status
        </h3>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        )}
      </div>

      {!isLoading && (
        <div className="flex gap-3 mt-3">
          <StatusChip
            label="Soulbound Token"
            active={hasSbt}
            icon={hasSbt ? "shield-check" : "shield"}
          />
          <StatusChip
            label="Vote Cast"
            active={hasVoted}
            icon={hasVoted ? "check-circle" : "circle"}
          />
        </div>
      )}
    </div>
  );
}

function StatusChip({
  label,
  active,
  icon,
}: {
  label: string;
  active: boolean;
  icon: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
        active
          ? "bg-green-950/40 border-green-700/50 text-green-300"
          : "bg-surface-200 border-surface-400 text-gray-400"
      }`}
    >
      {icon === "shield-check" && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )}
      {icon === "shield" && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
        </svg>
      )}
      {icon === "check-circle" && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {icon === "circle" && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
