"use client";

import React from "react";
import Image from "next/image";
import { Poll } from "@/lib/pollStore";
import { WalletButton } from "./WalletButton";
import { useWallet } from "@/hooks/useWallet";

interface HeroLandingProps {
  totalPolls: number;
  totalVotes: number;
  featuredPoll?: Poll;
  onExplore: () => void;
  onCreatePoll: () => void;
  onSelectPoll: (poll: Poll) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  totalPolls,
  totalVotes,
  featuredPoll,
  onExplore,
  onCreatePoll,
  onSelectPoll,
}) => {
  const { isConnected } = useWallet();

  return (
    <section className="py-12 sm:py-16 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Stellar Soroban • Soulbound Voting Protocol</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Voting Terdesentralisasi. <br />
              <span className="text-blue-400">1-Person-1-Vote</span> yang Adil & Terbuka.
            </h1>

            <p className="text-base text-slate-400 max-w-xl leading-relaxed">
              Platform voting permissionless di blockchain Stellar. Siapa pun dapat membuat voting publik atau proposal komunitas, sedangkan token Soulbound (SBT) memastikan tidak ada manipulasi bot atau akun ganda.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <WalletButton />

              <button
                onClick={onExplore}
                className="btn-secondary"
              >
                <span>Jelajahi Voting Hub</span>
              </button>

              <button
                onClick={onCreatePoll}
                className="btn-outline"
              >
                <span>+ Buat Voting</span>
              </button>
            </div>

            {/* Clean Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              <div className="app-card p-3">
                <div className="text-xl font-bold text-white tabular-nums">
                  {totalPolls}
                </div>
                <div className="text-xs text-slate-400">Voting Komunitas</div>
              </div>
              <div className="app-card p-3">
                <div className="text-xl font-bold text-white tabular-nums">
                  {totalVotes}
                </div>
                <div className="text-xs text-slate-400">Total Suara On-Chain</div>
              </div>
              <div className="app-card p-3">
                <div className="text-xl font-bold text-white">
                  1-Person
                </div>
                <div className="text-xs text-slate-400">Integritas SBT</div>
              </div>
              <div className="app-card p-3">
                <div className="text-xl font-bold text-white">
                  ~3.5s
                </div>
                <div className="text-xs text-slate-400">Finalitas Soroban</div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Proposal Preview */}
          <div className="lg:col-span-5">
            <div className="app-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="badge badge-purple">
                  {featuredPoll?.category || "Governance"}
                </span>
                <span className="badge badge-emerald">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Voting Aktif
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white leading-snug">
                  {featuredPoll?.title ||
                    "Stellar Protocol 22 Feature Priorities: Ecosystem Grant"}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {featuredPoll?.description ||
                    "Proposal alokasi dana ekosistem dan prioritas fitur Soroban untuk efisiensi transaksi."}
                </p>
              </div>

              {/* Progress items */}
              <div className="space-y-2.5 pt-1">
                {(featuredPoll?.options || [
                  { id: 1, text: "Soroban Gas Optimizations", votes: 42 },
                  { id: 2, text: "Multi-Sig Account Abstraction", votes: 28 },
                  { id: 3, text: "Zero-Knowledge State Verifiers", votes: 19 },
                ]).map((opt) => {
                  const total = featuredPoll?.totalVotes || 89;
                  const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                  return (
                    <div key={opt.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{opt.text}</span>
                        <span className="text-slate-400 font-mono">{pct}% ({opt.votes})</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                <span className="text-slate-400">Total {featuredPoll?.totalVotes || 89} suara</span>
                <button
                  onClick={() => featuredPoll && onSelectPoll(featuredPoll)}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroLanding;
