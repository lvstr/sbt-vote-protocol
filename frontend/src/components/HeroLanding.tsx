"use client";

import { useState } from "react";
import Image from "next/image";
import { Poll } from "@/lib/pollStore";

interface HeroLandingProps {
  totalPolls: number;
  totalVotes: number;
  hasSbt: boolean;
  featuredPoll?: Poll;
  onExplore: () => void;
  onCreatePoll: () => void;
  onClaimSbt: () => void;
  onSelectPoll: (poll: Poll) => void;
}

export function HeroLanding({
  totalPolls,
  totalVotes,
  hasSbt,
  featuredPoll,
  onExplore,
  onCreatePoll,
  onClaimSbt,
  onSelectPoll,
}: HeroLandingProps) {
  return (
    <section className="relative pt-6 pb-16 overflow-hidden">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/15 via-teal-500/10 to-purple-600/10 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-xs font-semibold text-brand-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              <span>Stellar Soroban • Soulbound Voting Protocol</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Satu Identitas, <br className="hidden sm:inline" />
              <span className="text-gradient-cyan">Satu Suara Abadi.</span> <br />
              <span className="text-slate-300 font-bold text-3xl sm:text-4xl lg:text-5xl">
                Bebas Dibuat Siapa Saja.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Platform voting terdesentralisasi berbasis <strong>Soulbound Token (SBT)</strong> di blockchain Stellar. Siapa pun dapat meluncurkan proposal/voting publik secara bebas, dan komunitas berpartisipasi dengan jaminan keadilan mutlak tanpa bot.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExplore}
                className="btn-primary text-sm sm:text-base px-6 py-3.5 shadow-cyan-500/30"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span>Jelajahi Voting Hub</span>
              </button>

              <button
                onClick={onCreatePoll}
                className="btn-secondary text-sm sm:text-base px-5 py-3.5"
              >
                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Buat Voting Baru</span>
              </button>

              {!hasSbt && (
                <button
                  onClick={onClaimSbt}
                  className="btn-outline text-sm sm:text-base px-4 py-3.5 border-amber-500/40 text-amber-300 hover:bg-amber-950/40"
                >
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Klaim SBT Pass (Gratis)</span>
                </button>
              )}
            </div>

            {/* Protocol Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60">
                <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                  {totalPolls}
                </div>
                <div className="text-[11px] text-slate-400">Voting Terbuka</div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60">
                <div className="text-xl sm:text-2xl font-bold text-brand-300 tabular-nums">
                  {totalVotes}
                </div>
                <div className="text-[11px] text-slate-400">Total Suara Cast</div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60">
                <div className="text-xl sm:text-2xl font-bold text-emerald-300">
                  1-Person
                </div>
                <div className="text-[11px] text-slate-400">SBT Sybil Defense</div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60">
                <div className="text-xl sm:text-2xl font-bold text-purple-300">
                  &lt; 4s
                </div>
                <div className="text-[11px] text-slate-400">Finalitas Soroban</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Featured Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Outer decorative gradient border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/30 via-teal-500/20 to-purple-500/30 rounded-3xl blur-md opacity-75 animate-pulse-slow -z-10" />

              <div className="glass-panel p-6 space-y-5 relative">
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      ⚡ Featured Proposal
                    </span>
                    <span className="text-xs text-slate-400">
                      {featuredPoll?.category || "Governance"}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sedang Berlangsung
                  </span>
                </div>

                {/* Proposal Title */}
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {featuredPoll?.title ||
                      "Stellar Protocol 22 Feature Priorities: Ecosystem Grant"}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                    {featuredPoll?.description ||
                      "Proposal alokasi dana ekosistem dan prioritas fitur Soroban untuk efisiensi transaksi dan interoperabilitas."}
                  </p>
                </div>

                {/* Live Vote Progress Preview */}
                <div className="space-y-3 pt-1">
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
                          <span className="font-medium text-slate-200">
                            {opt.text}
                          </span>
                          <span className="text-slate-400 font-mono">
                            {pct}% ({opt.votes})
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Sisa 5 hari lagi</span>
                  </div>

                  <button
                    onClick={() => featuredPoll && onSelectPoll(featuredPoll)}
                    className="text-xs font-semibold text-brand-300 hover:text-brand-200 flex items-center gap-1 group"
                  >
                    <span>Ikut Vote Sekarang</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
