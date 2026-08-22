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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/soulbound.png"
              alt="SBT Vote"
              width={36}
              height={36}
              className="shrink-0"
            />
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-900 leading-tight">
                SBT Vote Protocol
              </h1>
              <p className="text-xs text-gray-500">Soulbound Voting on Stellar</p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Hero / Status */}
        <section className="card overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-gold-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold">
                  Soulbound Voting
                </h2>
                <p className="text-teal-100 text-sm">
                  Satu identitas, satu suara — tidak dapat dipindahkan
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                votingOpen
                  ? "bg-white/15 text-white"
                  : "bg-red-500/20 text-red-100"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  votingOpen ? "bg-green-300 animate-pulse" : "bg-red-300"
                }`}
              />
              {votingOpen ? "Voting Dibuka" : "Voting Ditutup"}
            </div>
          </div>

          {/* Info bar */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M18 6.75a3 3 0 11-6 0 3 3 0 016 0zm-8.25 6a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              {candidateCount} kandidat
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Stellar Testnet
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.52a4.5 4.5 0 00-6.364-6.364L4.5 8.257" />
              </svg>
              Non-transferable token
            </span>
          </div>
        </section>

        {/* Voter status */}
        {isConnected && (
          <VoterStatus
            hasSbt={voterStatus.hasSbt}
            hasVoted={voterStatus.hasVoted}
            isLoading={isLoading}
          />
        )}

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VotePanel candidateCount={candidateCount} onVoteSuccess={fetchData} />
          <ResultsPanel results={results} isLoading={isLoading} />
        </div>

        {/* Event feed */}
        <EventFeed />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Image src="/soulbound.png" alt="" width={18} height={18} />
            <span>SBT Vote Protocol</span>
          </div>
          <span>Dibangun di atas Stellar Soroban</span>
        </div>
      </footer>
    </div>
  );
}
