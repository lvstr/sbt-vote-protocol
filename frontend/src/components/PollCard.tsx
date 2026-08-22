"use client";

import { Poll, UserVoteRecord } from "@/lib/pollStore";

interface PollCardProps {
  poll: Poll;
  userVote?: UserVoteRecord;
  onSelect: (poll: Poll) => void;
}

export function PollCard({ poll, userVote, onSelect }: PollCardProps) {
  const categoryColors: Record<string, string> = {
    Governance: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    Grants: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Tech: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    Community: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    General: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };

  const badgeColor =
    categoryColors[poll.category] || categoryColors.General;

  const votedOption = userVote
    ? poll.options.find((o) => o.id === userVote.optionId)
    : null;

  return (
    <div
      onClick={() => onSelect(poll)}
      className="glass-card glass-card-hover p-5 flex flex-col justify-between cursor-pointer group space-y-4"
    >
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badgeColor}`}
          >
            {poll.category}
          </span>

          <div className="flex items-center gap-2">
            {userVote && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Sudah Vote</span>
              </span>
            )}
            <span
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                poll.isOpen
                  ? "text-emerald-300 bg-emerald-950/40 border border-emerald-500/20"
                  : "text-slate-400 bg-slate-800 border border-slate-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  poll.isOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              {poll.isOpen ? "Aktif" : "Ditutup"}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
            {poll.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {poll.description}
          </p>
        </div>
      </div>

      {/* Options preview bars */}
      <div className="space-y-2 pt-1 border-t border-slate-800/60">
        {poll.options.slice(0, 3).map((opt) => {
          const pct =
            poll.totalVotes > 0
              ? Math.round((opt.votes / poll.totalVotes) * 100)
              : 0;
          const isUserPick = userVote?.optionId === opt.id;

          return (
            <div key={opt.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`truncate max-w-[200px] ${
                    isUserPick ? "text-brand-300 font-semibold" : "text-slate-300"
                  }`}
                >
                  {isUserPick && "✓ "}
                  {opt.text}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isUserPick
                      ? "bg-gradient-to-r from-brand-400 to-teal-300"
                      : "bg-slate-600"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {poll.options.length > 3 && (
          <div className="text-[11px] text-slate-500 text-right">
            +{poll.options.length - 3} opsi lainnya
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="font-mono text-[11px]">
            {poll.creatorAlias || `${poll.creator.slice(0, 4)}...${poll.creator.slice(-4)}`}
          </span>
        </div>

        <div className="flex items-center gap-1 font-semibold text-slate-200">
          <span>{poll.totalVotes}</span>
          <span className="text-slate-400 font-normal text-[11px]">suara</span>
        </div>
      </div>
    </div>
  );
}
