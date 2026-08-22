"use client";

interface ResultsPanelProps {
  results: { candidateId: number; votes: number }[];
  isLoading: boolean;
}

export function ResultsPanel({ results, isLoading }: ResultsPanelProps) {
  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  return (
    <div className="bg-stellar-card border border-stellar-border rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Live Results</h2>
        <span className="text-sm text-gray-400">
          Total: {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-gray-400">Loading results...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          No candidates registered
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(({ candidateId, votes }) => {
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            return (
              <div key={candidateId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Candidate #{candidateId}</span>
                  <span className="text-gray-400">
                    {votes} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-stellar-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stellar-purple rounded-full transition-all duration-500"
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
