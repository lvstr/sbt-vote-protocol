"use client";

import React, { useMemo, useState } from "react";
import { Poll, UserVoteRecord } from "@/lib/pollStore";
import { PollCard } from "./PollCard";

interface PollListProps {
  polls: Poll[];
  userVotes: UserVoteRecord[];
  userAddress: string | null;
  onSelectPoll: (poll: Poll) => void;
  onCreatePoll: () => void;
}

export const PollList: React.FC<PollListProps> = ({
  polls,
  userVotes,
  userAddress,
  onSelectPoll,
  onCreatePoll,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed" | "voted">("all");
  const [sortBy, setSortBy] = useState<"popular" | "newest">("popular");

  const categories = ["Semua", "Governance", "Grants", "Tech", "Community", "General"];

  const filteredPolls = useMemo(() => {
    return polls
      .filter((poll) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = poll.title.toLowerCase().includes(q);
          const matchesDesc = poll.description.toLowerCase().includes(q);
          const matchesOption = poll.options.some((o) =>
            o.text.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesDesc && !matchesOption) return false;
        }

        // Category
        if (selectedCategory !== "Semua" && poll.category !== selectedCategory) {
          return false;
        }

        // Status
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
      {/* Search & Filter Bar */}
      <div className="app-panel p-4 sm:p-5 space-y-4">
        {/* Row 1: Search & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Cari proposal atau opsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 text-xs"
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
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="popular">Paling Populer</option>
              <option value="newest">Paling Baru</option>
            </select>

            <button
              onClick={onCreatePoll}
              className="btn-primary text-xs px-3.5 py-2 shrink-0"
            >
              <span>+ Buat Voting</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Chips & Status Tabs */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg shrink-0 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "all"
                  ? "bg-slate-800 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Semua ({polls.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "active"
                  ? "bg-slate-800 text-emerald-400 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === "closed"
                  ? "bg-slate-800 text-slate-300 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Ditutup
            </button>
            {userAddress && (
              <button
                onClick={() => setStatusFilter("voted")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === "voted"
                    ? "bg-slate-800 text-blue-400 font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Saya Ikuti ({userVotes.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredPolls.length === 0 ? (
        <div className="app-card p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-white">
            Tidak ada voting yang cocok
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau filter kategori di atas.
          </p>
          <button onClick={onCreatePoll} className="btn-primary text-xs px-4 py-2">
            + Buat Voting Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
};

export default PollList;
