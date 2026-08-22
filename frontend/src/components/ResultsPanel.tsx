"use client";

interface ResultsPanelProps {
  results: { candidateId: number; votes: number }[];
  isLoading: boolean;
}

const COLORS = [
  "from-brand-500 to-brand-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

export function ResultsPanel({ results, isLoading }: ResultsPanelProps) {
  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Results</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
          <span className="text-sm text-gray-400">
            {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 bg-surface-300 rounded w-1/3" />
              <div className="h-3 bg-surface-300 rounded-full" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-10 h-10 text-surface-500 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <p className="text-sm text-gray-500">No candidates registered</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(({ candidateId, votes }, idx) => {
            const percentage =
              totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const colorClass = COLORS[idx % COLORS.length];

            return (
              <div key={candidateId} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">
                    Candidate #{candidateId}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-500">
                      {votes} vote{votes !== 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-semibold text-gray-300">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 bg-surface-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
