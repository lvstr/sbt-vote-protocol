"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroLanding } from "@/components/HeroLanding";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { HowItWorks } from "@/components/HowItWorks";
import { PollList } from "@/components/PollList";
import { CreatePollModal } from "@/components/CreatePollModal";
import { PollDetailModal } from "@/components/PollDetailModal";
import { SbtBadgeModal } from "@/components/SbtBadgeModal";
import { Footer } from "@/components/Footer";
import { useWallet } from "@/hooks/useWallet";
import {
  getStoredPolls,
  getStoredUserVotes,
  hasStoredSbt,
  claimStoredSbt,
  castStoredVote,
  Poll,
  UserVoteRecord,
} from "@/lib/pollStore";
import { checkHasSbt } from "@/lib/contract";

export default function Home() {
  const { address, isConnected } = useWallet();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<
    "landing" | "polls" | "create" | "identity"
  >("landing");

  // Local & on-chain state
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<UserVoteRecord[]>([]);
  const [hasSbt, setHasSbt] = useState<boolean>(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [isSbtModalOpen, setIsSbtModalOpen] = useState(false);

  // Initialize and load polls
  const refreshData = useCallback(async () => {
    const loadedPolls = getStoredPolls();
    setPolls(loadedPolls);

    if (address) {
      const votes = getStoredUserVotes(address);
      setUserVotes(votes);

      // Check SBT status on-chain + local fallback
      const localSbt = hasStoredSbt(address);
      if (localSbt) {
        setHasSbt(true);
      } else {
        const onChainSbt = await checkHasSbt(address);
        if (onChainSbt) {
          claimStoredSbt(address);
          setHasSbt(true);
        } else {
          setHasSbt(false);
        }
      }
    } else {
      setUserVotes([]);
      setHasSbt(false);
    }
  }, [address]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle URL query parameter e.g. ?poll=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pollId = params.get("poll");
      if (pollId) {
        const found = getStoredPolls().find((p) => p.id === Number(pollId));
        if (found) {
          setSelectedPoll(found);
        }
      }
    }
  }, []);

  // Total stats
  const totalVotes = useMemo(
    () => polls.reduce((acc, p) => acc + p.totalVotes, 0),
    [polls]
  );
  const featuredPoll = useMemo(
    () => polls.find((p) => p.featured) || polls[0],
    [polls]
  );

  // Handlers
  const handlePollCreated = (newPoll: Poll) => {
    refreshData();
    setSelectedPoll(newPoll);
  };

  const handleVoteCast = (pollId: number, optionId: number) => {
    if (!address) return;
    const res = castStoredVote(pollId, optionId, address);
    if (res.success && res.poll) {
      setSelectedPoll(res.poll);
      refreshData();
    }
  };

  const handleSbtClaimed = () => {
    if (address) {
      claimStoredSbt(address);
      setHasSbt(true);
      refreshData();
    }
  };

  const handlePollUpdated = (updatedPoll: Poll) => {
    setSelectedPoll(updatedPoll);
    refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === "create") setIsCreateModalOpen(true);
          if (tab === "identity") setIsSbtModalOpen(true);
        }}
        hasSbt={hasSbt}
        onOpenSbtModal={() => setIsSbtModalOpen(true)}
      />

      <main className="flex-1 w-full">
        {/* LANDING VIEW */}
        {activeTab === "landing" && (
          <div>
            {/* Hero */}
            <HeroLanding
              totalPolls={polls.length}
              totalVotes={totalVotes}
              hasSbt={hasSbt}
              featuredPoll={featuredPoll}
              onExplore={() => {
                setActiveTab("polls");
                const el = document.getElementById("voting-hub-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              onCreatePoll={() => setIsCreateModalOpen(true)}
              onClaimSbt={() => setIsSbtModalOpen(true)}
              onSelectPoll={(p) => setSelectedPoll(p)}
            />

            {/* Feature Highlights */}
            <FeatureHighlights />

            {/* How It Works */}
            <HowItWorks />

            {/* Live Voting Hub Preview on Landing */}
            <section id="voting-hub-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-semibold text-brand-300 mb-2">
                    ⚡ Voting Komunitas Terbuka
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Jelajahi & Berikan Suara Anda
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Semua orang dapat membuat proposal dan memilih dengan token identitas Soulbound.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary text-xs sm:text-sm px-4 py-2.5"
                >
                  + Buat Voting Baru
                </button>
              </div>

              <PollList
                polls={polls}
                userVotes={userVotes}
                userAddress={address}
                onSelectPoll={(poll) => setSelectedPoll(poll)}
                onCreatePoll={() => setIsCreateModalOpen(true)}
              />
            </section>
          </div>
        )}

        {/* DEDICATED POLLS / VOTING HUB VIEW */}
        {activeTab === "polls" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Voting Hub Komunitas
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Daftar lengkap voting terbuka di Stellar. Saring berdasarkan kategori, status, atau cari topik tertentu.
              </p>
            </div>

            <PollList
              polls={polls}
              userVotes={userVotes}
              userAddress={address}
              onSelectPoll={(poll) => setSelectedPoll(poll)}
              onCreatePoll={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}

        {/* DEDICATED CREATE VIEW */}
        {activeTab === "create" && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <button
              onClick={() => setActiveTab("landing")}
              className="text-xs text-slate-400 hover:text-white mb-6 flex items-center gap-1.5"
            >
              ← Kembali ke Beranda
            </button>
            <div className="glass-panel p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Buat Voting Baru
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Klik tombol di bawah ini untuk membuka dialog pembuatan voting on-chain.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary w-full py-3 text-sm font-bold"
              >
                Buka Formulir Buat Voting 🚀
              </button>
            </div>
          </div>
        )}

        {/* DEDICATED IDENTITY VIEW */}
        {activeTab === "identity" && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <button
              onClick={() => setActiveTab("landing")}
              className="text-xs text-slate-400 hover:text-white mb-6 flex items-center gap-1.5"
            >
              ← Kembali ke Beranda
            </button>
            <div className="glass-panel p-6 sm:p-8 text-center space-y-4">
              <h1 className="text-2xl font-bold text-white">
                Status Identitas Soulbound (SBT)
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Kelola kredensial pemilih terverifikasi Anda untuk mengikuti pemilihan di Stellar Soroban.
              </p>
              <button
                onClick={() => setIsSbtModalOpen(true)}
                className="btn-gold px-6 py-3 text-sm font-bold mx-auto"
              >
                Buka Digital Passport SBT 🛡️
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <CreatePollModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPollCreated={handlePollCreated}
      />

      <PollDetailModal
        poll={selectedPoll}
        userVote={userVotes.find((v) => v.pollId === selectedPoll?.id)}
        hasSbt={hasSbt}
        onClose={() => setSelectedPoll(null)}
        onVoteCast={handleVoteCast}
        onClaimSbtPrompt={() => setIsSbtModalOpen(true)}
        onPollUpdated={handlePollUpdated}
      />

      <SbtBadgeModal
        isOpen={isSbtModalOpen}
        hasSbt={hasSbt}
        userVotes={userVotes}
        polls={polls}
        onClose={() => setIsSbtModalOpen(false)}
        onSbtClaimed={handleSbtClaimed}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
