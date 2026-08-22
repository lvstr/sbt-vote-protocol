"use client";

interface ResultsPanelProps {
  results: { candidateId: number; votes: number }[];
  isLoading: boolean;
}

export function ResultsPanel({ results, isLoading }: ResultsPanelProps) {
  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Hasil Voting</h2>
          <p className="text-sm text-gray-500 mt-0.5">Data langsung dari blockchain</p>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {totalVotes} suara
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          Belum ada kandidat terdaftar.
        </p>
      ) : (
        <div className="space-y-4">
          {results.map(({ candidateId, votes }) => {
            const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            return (
              <div key={candidateId} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Kandidat {candidateId}
                  </span>
                  <span className="text-sm tabular-nums text-gray-900 font-semibold">
                    {pct.toFixed(0)}%
                    <span className="text-gray-400 font-normal ml-1.5 text-xs">
                      ({votes})
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
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
