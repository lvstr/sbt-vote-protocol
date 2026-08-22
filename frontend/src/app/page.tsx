"use client";

import { useCallback, useEffect, useState } from "react";
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

      // Fetch votes for each candidate
      const votesPromises = Array.from({ length: count }, (_, i) =>
        getVotes(i + 1).then((votes) => ({ candidateId: i + 1, votes }))
      );
      const votesResults = await Promise.all(votesPromises);
      setResults(votesResults);

      // Fetch voter status if connected
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
    <main className="min-h-screen p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <div>
          <h1 className="text-2xl font-bold">SBT Vote Protocol</h1>
          <p className="text-sm text-gray-400">
            Decentralized voting with Soulbound Tokens on Stellar
          </p>
        </div>
        <WalletButton />
      </header>

      {/* Voting status banner */}
      <div
        className={`text-center py-2 rounded-lg text-sm font-medium ${
          votingOpen
            ? "bg-green-900/20 text-green-400 border border-green-800"
            : "bg-red-900/20 text-red-400 border border-red-800"
        }`}
      >
        Voting is {votingOpen ? "OPEN" : "CLOSED"}
      </div>

      {/* Voter status */}
      {isConnected && (
        <VoterStatus
          address={address}
          hasSbt={voterStatus.hasSbt}
          hasVoted={voterStatus.hasVoted}
          isLoading={isLoading}
        />
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VotePanel candidateCount={candidateCount} onVoteSuccess={fetchData} />
        <ResultsPanel results={results} isLoading={isLoading} />
      </div>

      {/* Event feed */}
      <EventFeed />

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4">
        Built on Stellar Soroban &middot; Testnet
      </footer>
    </main>
  );
}
