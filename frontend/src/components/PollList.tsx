"use client";

import { useMemo, useState } from "react";
import { Poll, UserVoteRecord } from "@/lib/pollStore";
import { PollCard } from "./PollCard";

interface PollListProps {
  polls: Poll[];
  userVotes: UserVoteRecord[];
  userAddress: string | null;
  onSelectPoll: (poll: Poll) => void;
  onCreatePoll: () => void;
}

export function PollList({
  polls,
  userVotes,
  userAddress,
  onSelectPoll,
  onCreatePoll,
}: PollListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed" | "voted">("all");
  const [sortBy, setSortBy] = useState<"popular" | "newest">("popular");

  const categories = ["Semua", "Governance", "Grants", "Tech", "Community", "General"];

  const filteredPolls = useMemo(() => {
    return polls
      .filter((poll) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = poll.title.toLowerCase().includes(q);
          const matchesDesc = poll.description.toLowerCase().includes(q);
          const matchesOption = poll.options.some((o) =>
            o.text.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesDesc && !matchesOption) return false;
        }

        // Category filter
        if (selectedCategory !== "Semua" && poll.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (statusFilter === "active" && !poll.isOpen) return false;
        if (statusFilter === "closed" && poll.isOpen) return false;
        if (statusFilter === "voted") {
          const hasVoted = userVotes.some((v) => v.pollId === poll.id);
          if (!hasVoted) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return b.totalVotes - a.totalVotes;
        }
        return b.createdAt - a.createdAt;
      });
  }, [polls, searchQuery, selectedCategory, statusFilter, sortBy, userVotes]);

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="glass-panel p-5 space-y-4">
        {/* Top Row: Search & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Cari voting atau opsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "popular" | "newest")}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="popular">🔥 Terpopuler (Banyak Suara)</option>
              <option value="newest">⚡ Terbaru</option>
            </select>

            <button
              onClick={onCreatePoll}
              className="btn-primary text-xs sm:text-sm px-4 py-2 shrink-0"
            >
              <span>+ Buat Voting</span>
            </button>
          </div>
        </div>

        {/* Second Row: Category Chips & Status Tabs */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shrink-0 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === "all"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Semua ({polls.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === "active"
                  ? "bg-slate-800 text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === "closed"
                  ? "bg-slate-800 text-slate-300 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Ditutup
            </button>
            {userAddress && (
              <button
                onClick={() => setStatusFilter("voted")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === "voted"
                    ? "bg-slate-800 text-brand-300 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Saya Ikuti ({userVotes.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Poll Cards Grid */}
      {filteredPolls.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Tidak Ada Voting yang Cocok
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Tidak ditemukan voting dengan filter atau kata kunci tersebut. Ingin membuat voting baru?
            </p>
          </div>
          <button onClick={onCreatePoll} className="btn-primary text-xs sm:text-sm px-5 py-2.5">
            + Buat Voting Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => {
            const userVote = userVotes.find((v) => v.pollId === poll.id);
            return (
              <PollCard
                key={poll.id}
                poll={poll}
                userVote={userVote}
                onSelect={onSelectPoll}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
