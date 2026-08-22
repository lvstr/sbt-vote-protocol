"use client";

import { useEvents, ContractEvent } from "@/hooks/useEvents";

export function EventFeed() {
  const { events, isPolling, error } = useEvents(5000);

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Aktivitas Terbaru</h2>
          <p className="text-sm text-gray-500 mt-0.5">Event dari smart contract</p>
        </div>
        {isPolling && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
          {error}
        </p>
      )}

      <div className="space-y-1 max-h-56 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Belum ada aktivitas. Event akan muncul di sini secara real-time.
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
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isVote
            ? "bg-blue-100 text-blue-600"
            : isMint
              ? "bg-gold-100 text-gold-700"
              : "bg-gray-100 text-gray-500"
        }`}
      >
        {isVote ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : isMint ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-700">
          {isVote ? "Suara Dicatat" : isMint ? "SBT Diterbitkan" : "Event"}
        </span>
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs text-gray-400 font-mono">
          #{event.ledger}
        </span>
      </div>
    </div>
  );
}
