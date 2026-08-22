"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Poll, UserVoteRecord } from "@/lib/pollStore";
import { PollList } from "./PollList";
import { EventFeed } from "./EventFeed";

interface DashboardViewProps {
  userAddress: string;
  hasSbt: boolean;
  polls: Poll[];
  userVotes: UserVoteRecord[];
  onSelectPoll: (poll: Poll) => void;
  onCreatePoll: () => void;
  onOpenSbtModal: () => void;
  onViewLanding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userAddress,
  hasSbt,
  polls,
  userVotes,
  onSelectPoll,
  onCreatePoll,
  onOpenSbtModal,
  onViewLanding,
}) => {
  const [activeTab, setActiveTab] = useState<
    "explore" | "my-votes" | "my-polls" | "events"
  >("explore");

  const totalVotesCast = useMemo(
    () => polls.reduce((acc, p) => acc + p.totalVotes, 0),
    [polls]
  );

  const myVotedPolls = useMemo(() => {
    const votedIds = new Set(userVotes.map((v) => v.pollId));
    return polls.filter((p) => votedIds.has(p.id));
  }, [polls, userVotes]);

  const myCreatedPolls = useMemo(() => {
    return polls.filter(
      (p) => p.creator.toLowerCase() === userAddress.toLowerCase()
    );
  }, [polls, userAddress]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="app-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-slate-400">
              Wallet Terhubung: {userAddress.slice(0, 6)}...{userAddress.slice(-6)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Voting Komunitas
          </h1>

          <p className="text-sm text-slate-400 max-w-xl">
            {hasSbt ? (
              <span className="text-emerald-400 font-medium">
                ✓ Identitas Soulbound (SBT) Aktif. Anda berhak memberikan 1 suara di setiap voting.
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                ⚠️ Anda belum mengklaim SBT Voter ID. Klaim sekarang untuk mulai voting.
              </span>
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {!hasSbt && (
            <button onClick={onOpenSbtModal} className="btn-primary text-xs sm:text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Klaim SBT ID</span>
            </button>
          )}

          <button onClick={onCreatePoll} className="btn-primary text-xs sm:text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Buat Voting Baru</span>
          </button>

          <button onClick={onOpenSbtModal} className="btn-secondary text-xs sm:text-sm">
            <span>Passport SBT</span>
          </button>

          <button onClick={onViewLanding} className="btn-outline text-xs sm:text-sm">
            <span>Info Protokol</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="app-card p-4 space-y-1">
          <span className="text-xs text-slate-400">Total Voting Aktif</span>
          <div className="text-2xl font-bold text-white tabular-nums">
            {polls.filter((p) => p.isOpen).length}
          </div>
        </div>

        <div className="app-card p-4 space-y-1">
          <span className="text-xs text-slate-400">Suara Komunitas</span>
          <div className="text-2xl font-bold text-blue-400 tabular-nums">
            {totalVotesCast}
          </div>
        </div>

        <div className="app-card p-4 space-y-1">
          <span className="text-xs text-slate-400">Voting Diikuti Saya</span>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums">
            {userVotes.length}
          </div>
        </div>

        <div className="app-card p-4 space-y-1">
          <span className="text-xs text-slate-400">Status Hak Suara</span>
          <div className="text-sm font-semibold text-white mt-1">
            {hasSbt ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span>Terverifikasi</span> ✓
              </span>
            ) : (
              <span className="text-amber-400">Belum Diklaim</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area with Sub-Tabs */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === "explore"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Semua Voting ({polls.length})
          </button>

          <button
            onClick={() => setActiveTab("my-votes")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === "my-votes"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Suara Saya ({userVotes.length})
          </button>

          <button
            onClick={() => setActiveTab("my-polls")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === "my-polls"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Voting Dibuat Saya ({myCreatedPolls.length})
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors shrink-0 ${
              activeTab === "events"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            Aktivitas On-Chain
          </button>
        </div>

        {/* Tab 1: Explore All Polls */}
        {activeTab === "explore" && (
          <PollList
            polls={polls}
            userVotes={userVotes}
            userAddress={userAddress}
            onSelectPoll={onSelectPoll}
            onCreatePoll={onCreatePoll}
          />
        )}

        {/* Tab 2: My Votes */}
        {activeTab === "my-votes" && (
          <div className="space-y-4">
            {myVotedPolls.length === 0 ? (
              <div className="app-card p-12 text-center space-y-3">
                <p className="text-sm text-slate-300">
                  Anda belum memberikan suara pada voting apa pun.
                </p>
                <p className="text-xs text-slate-500">
                  Jelajahi voting komunitas dan gunakan hak suara Soulbound Anda.
                </p>
                <button
                  onClick={() => setActiveTab("explore")}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Jelajahi Voting
                </button>
              </div>
            ) : (
              <PollList
                polls={myVotedPolls}
                userVotes={userVotes}
                userAddress={userAddress}
                onSelectPoll={onSelectPoll}
                onCreatePoll={onCreatePoll}
              />
            )}
          </div>
        )}

        {/* Tab 3: My Created Polls */}
        {activeTab === "my-polls" && (
          <div className="space-y-4">
            {myCreatedPolls.length === 0 ? (
              <div className="app-card p-12 text-center space-y-3">
                <p className="text-sm text-slate-300">
                  Anda belum pernah membuat voting.
                </p>
                <p className="text-xs text-slate-500">
                  Siapa pun dapat meluncurkan proposal baru ke blockchain Stellar.
                </p>
                <button
                  onClick={onCreatePoll}
                  className="btn-primary text-xs px-4 py-2"
                >
                  + Buat Voting Pertama
                </button>
              </div>
            ) : (
              <PollList
                polls={myCreatedPolls}
                userVotes={userVotes}
                userAddress={userAddress}
                onSelectPoll={onSelectPoll}
                onCreatePoll={onCreatePoll}
              />
            )}
          </div>
        )}

        {/* Tab 4: On-Chain Event Activity */}
        {activeTab === "events" && <EventFeed />}
      </div>
    </div>
  );
};

export default DashboardView;
