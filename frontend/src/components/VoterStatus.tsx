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
    <div className="bg-stellar-card border border-stellar-border rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Your Status</h3>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="flex gap-4">
          <StatusPill label="SBT" active={hasSbt} />
          <StatusPill label="Voted" active={hasVoted} />
        </div>
      )}
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${
        active
          ? "bg-green-900/30 text-green-400 border border-green-800"
          : "bg-gray-800 text-gray-400 border border-gray-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-green-400" : "bg-gray-500"
        }`}
      />
      {label}
    </span>
  );
}
