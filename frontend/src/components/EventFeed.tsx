"use client";

import { useEvents, ContractEvent } from "@/hooks/useEvents";

export function EventFeed() {
  const { events, isPolling, error } = useEvents(5000);

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Aktivitas On-Chain Terbaru</h2>
          <p className="text-xs text-slate-400 mt-0.5">Event live dari smart contract Soroban</p>
        </div>
        {isPolling && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 bg-brand-950/60 border border-brand-500/30 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Live Polling
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-300 bg-red-950/50 border border-red-500/40 rounded-lg p-2.5">
          {error}
        </p>
      )}

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            Belum ada aktivitas baru. Event voting & mint SBT akan tampil di sini.
          </p>
        ) : (
          events.map((event) => <EventRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: ContractEvent }) {
  const isVote = event.type.toLowerCase().includes("vote");
  const isMint = event.type.toLowerCase().includes("mint");
  const isPoll = event.type.toLowerCase().includes("poll");

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/60 transition-colors text-xs">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            isVote
              ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
              : isMint
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
          }`}
        >
          {isVote ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : isMint ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </div>
        <span className="font-medium text-slate-200">
          {isVote
            ? "Suara On-Chain Dicatat"
            : isMint
            ? "SBT Voter ID Diterbitkan"
            : isPoll
            ? "Voting Baru Dibuat"
            : "Event Smart Contract"}
        </span>
      </div>

      <span className="text-[11px] text-slate-400 font-mono">
        Ledger #{event.ledger}
      </span>
    </div>
  );
}
