"use client";

import React from "react";
import { Poll, UserVoteRecord } from "@/lib/pollStore";

interface PollCardProps {
  poll: Poll;
  userVote?: UserVoteRecord;
  onSelect: (poll: Poll) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, userVote, onSelect }) => {
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Governance":
        return "badge-purple";
      case "Grants":
        return "badge-amber";
      case "Tech":
        return "badge-blue";
      case "Community":
        return "badge-emerald";
      default:
        return "badge-slate";
    }
  };

  return (
    <div
      onClick={() => onSelect(poll)}
      className="app-card app-card-hover p-5 flex flex-col justify-between cursor-pointer group space-y-4"
    >
      {/* Header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`badge ${getCategoryBadgeClass(poll.category)}`}>
            {poll.category}
          </span>

          <div className="flex items-center gap-2">
            {userVote && (
              <span className="badge badge-emerald text-[11px]">
                ✓ Sudah Vote
              </span>
            )}
            <span
              className={`badge text-[11px] ${
                poll.isOpen ? "badge-emerald" : "badge-slate text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  poll.isOpen ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              {poll.isOpen ? "Aktif" : "Ditutup"}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
            {poll.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {poll.description}
          </p>
        </div>
      </div>

      {/* Options preview bars */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
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
                    isUserPick ? "text-blue-400 font-semibold" : "text-slate-300"
                  }`}
                >
                  {isUserPick && "✓ "}
                  {opt.text}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {pct}% ({opt.votes})
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isUserPick ? "bg-blue-500" : "bg-slate-600"
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

      {/* Footer */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
        <span className="font-mono text-[11px]">
          Oleh: {poll.creatorAlias || `${poll.creator.slice(0, 4)}...${poll.creator.slice(-4)}`}
        </span>

        <span className="font-semibold text-slate-300">
          {poll.totalVotes} suara
        </span>
      </div>
    </div>
  );
};

export default PollCard;
