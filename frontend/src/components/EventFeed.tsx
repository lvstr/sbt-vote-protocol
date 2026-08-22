"use client";

import { useEvents, ContractEvent } from "@/hooks/useEvents";

export function EventFeed() {
  const { events, isPolling, error } = useEvents(5000);

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Event Stream</h2>
        <div className="flex items-center gap-2">
          <span
            className={`badge ${
              isPolling
                ? "bg-green-950/50 text-green-400 border border-green-800/50"
                : "bg-surface-300 text-gray-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPolling ? "bg-green-400 animate-pulse" : "bg-gray-500"
              }`}
            />
            {isPolling ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg p-2.5">
          {error}
        </div>
      )}

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-8 h-8 text-surface-500 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <p className="text-sm text-gray-500">
              Listening for contract events...
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Events will appear here in real-time
            </p>
          </div>
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
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-50 hover:bg-surface-200 transition-colors animate-slide-up">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isVote
            ? "bg-blue-950/50 text-blue-400"
            : isMint
              ? "bg-green-950/50 text-green-400"
              : "bg-surface-300 text-gray-400"
        }`}
      >
        {isVote ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : isMint ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {isVote ? "Vote Cast" : isMint ? "SBT Minted" : "Contract Event"}
        </p>
        <p className="text-xs text-gray-500">Ledger #{event.ledger}</p>
      </div>

      <time className="text-xs text-gray-600 shrink-0 font-mono">
        {event.timestamp.toLocaleTimeString()}
      </time>
    </div>
  );
}
