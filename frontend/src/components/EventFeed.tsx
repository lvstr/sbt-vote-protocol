"use client";

import { useEvents, ContractEvent } from "@/hooks/useEvents";

export function EventFeed() {
  const { events, isPolling, error } = useEvents(5000);

  return (
    <div className="bg-stellar-card border border-stellar-border rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Event Feed</h2>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isPolling
              ? "bg-green-900/40 text-green-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {isPolling ? "Live" : "Paused"}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No events yet. Events will appear here in real-time.
          </p>
        ) : (
          events.map((event) => <EventRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: ContractEvent }) {
  const isVote = event.type.includes("vote");
  const isMint = event.type.includes("mint");

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-stellar-dark/50 text-sm">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isVote
            ? "bg-blue-400"
            : isMint
              ? "bg-green-400"
              : "bg-gray-400"
        }`}
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium">
          {isVote ? "Vote Cast" : isMint ? "SBT Minted" : "Event"}
        </span>
        <span className="text-gray-400 ml-2">Ledger #{event.ledger}</span>
      </div>
      <time className="text-xs text-gray-500 shrink-0">
        {event.timestamp.toLocaleTimeString()}
      </time>
    </div>
  );
}
