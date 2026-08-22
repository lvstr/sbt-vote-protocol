"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroLanding } from "@/components/HeroLanding";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { HowItWorks } from "@/components/HowItWorks";
import { DashboardView } from "@/components/DashboardView";
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

  // View state: automatically switches to 'dashboard' when wallet is connected
  const [viewMode, setViewMode] = useState<"landing" | "dashboard">("landing");

  // Local & on-chain data state
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<UserVoteRecord[]>([]);
  const [hasSbt, setHasSbt] = useState<boolean>(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [isSbtModalOpen, setIsSbtModalOpen] = useState(false);

  // Synchronize view mode with wallet connection state
  useEffect(() => {
    if (isConnected && address) {
      setViewMode("dashboard");
    } else {
      setViewMode("landing");
    }
  }, [isConnected, address]);

  // Load and refresh polls & user votes
  const refreshData = useCallback(async () => {
    const loadedPolls = getStoredPolls();
    setPolls(loadedPolls);

    if (address) {
      const votes = getStoredUserVotes(address);
      setUserVotes(votes);

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

  // URL query parameter handler e.g. ?poll=1
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

  const totalVotes = useMemo(
    () => polls.reduce((acc, p) => acc + p.totalVotes, 0),
    [polls]
  );
  const featuredPoll = useMemo(
    () => polls.find((p) => p.featured) || polls[0],
    [polls]
  );

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
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F17]">
      {/* Top Navbar */}
      <Navbar
        currentView={viewMode}
        onSwitchView={setViewMode}
        hasSbt={hasSbt}
        onOpenSbtModal={() => setIsSbtModalOpen(true)}
        onCreatePoll={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1 w-full">
        {/* VIEW 1: CONNECTED DASHBOARD */}
        {viewMode === "dashboard" && isConnected && address ? (
          <DashboardView
            userAddress={address}
            hasSbt={hasSbt}
            polls={polls}
            userVotes={userVotes}
            onSelectPoll={(p) => setSelectedPoll(p)}
            onCreatePoll={() => setIsCreateModalOpen(true)}
            onOpenSbtModal={() => setIsSbtModalOpen(true)}
            onViewLanding={() => setViewMode("landing")}
          />
        ) : (
          /* VIEW 2: GUEST / PUBLIC LANDING */
          <div>
            <HeroLanding
              totalPolls={polls.length}
              totalVotes={totalVotes}
              featuredPoll={featuredPoll}
              onExplore={() => {
                const el = document.getElementById("public-voting-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              onCreatePoll={() => setIsCreateModalOpen(true)}
              onSelectPoll={(p) => setSelectedPoll(p)}
            />

            <FeatureHighlights />

            <HowItWorks />

            {/* Public Community Voting Preview */}
            <section id="public-voting-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Voting Komunitas Terbuka
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hubungkan wallet untuk membuat proposal atau berpartisipasi dalam pemilihan.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary text-xs px-3.5 py-2"
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
