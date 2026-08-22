"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { WalletButton } from "@/components/WalletButton";
import { VotePanel } from "@/components/VotePanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { EventFeed } from "@/components/EventFeed";
import { VoterStatus } from "@/components/VoterStatus";
import { useWallet } from "@/hooks/useWallet";
import {
  getCandidateCount,
  getVotes,
  getVoterRecord,
  isVotingOpen,
} from "@/lib/contract";

export default function Home() {
  const { address, isConnected } = useWallet();
  const [candidateCount, setCandidateCount] = useState(0);
  const [results, setResults] = useState<
    { candidateId: number; votes: number }[]
  >([]);
  const [votingOpen, setVotingOpen] = useState(false);
  const [voterStatus, setVoterStatus] = useState({
    hasSbt: false,
    hasVoted: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [count, open] = await Promise.all([
        getCandidateCount(),
        isVotingOpen(),
      ]);
      setCandidateCount(count);
      setVotingOpen(open);

      const votesPromises = Array.from({ length: count }, (_, i) =>
        getVotes(i + 1).then((votes) => ({ candidateId: i + 1, votes }))
      );
      const votesResults = await Promise.all(votesPromises);
      setResults(votesResults);

      if (address) {
        const record = await getVoterRecord(address);
        setVoterStatus({
          hasSbt: record.has_sbt,
          hasVoted: record.has_voted,
        });
      }
    } catch (err) {
      console.error("Failed to fetch contract data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CONTRACT_ID) {
      setIsLoading(false);
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen">
      {/* Background gradient accent */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/soulbound.png"
              alt="SBT Vote Protocol"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                SBT Vote
              </h1>
              <p className="text-xs text-gray-500">
                Soulbound Voting on Stellar
              </p>
            </div>
          </div>
          <WalletButton />
        </header>

        {/* Status Banner */}
        <div
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border ${
            votingOpen
              ? "bg-green-950/20 text-green-400 border-green-800/40"
              : "bg-red-950/20 text-red-400 border-red-800/40"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              votingOpen ? "bg-green-400 animate-pulse-slow" : "bg-red-400"
            }`}
          />
          Voting is {votingOpen ? "Open" : "Closed"}
        </div>

        {/* Voter Status */}
        {isConnected && (
          <VoterStatus
            address={address}
            hasSbt={voterStatus.hasSbt}
            hasVoted={voterStatus.hasVoted}
            isLoading={isLoading}
          />
        )}

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VotePanel candidateCount={candidateCount} onVoteSuccess={fetchData} />
          <ResultsPanel results={results} isLoading={isLoading} />
        </div>

        {/* Event Feed */}
        <EventFeed />

        {/* Footer */}
        <footer className="flex items-center justify-center gap-2 py-6 text-xs text-gray-600">
          <Image
            src="/soulbound.png"
            alt=""
            width={16}
            height={16}
            className="rounded opacity-50"
          />
          <span>Built on Stellar Soroban</span>
          <span className="text-gray-700">&middot;</span>
          <span>Testnet</span>
        </footer>
      </main>
    </div>
  );
}
