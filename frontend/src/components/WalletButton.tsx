"use client";

import { useWallet } from "@/hooks/useWallet";

export function WalletButton() {
  const { address, isConnected, isFreighterInstalled, connect, disconnect } =
    useWallet();

  if (!isFreighterInstalled) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary text-sm"
      >
        Install Freighter
      </a>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-200 border border-surface-400 rounded-xl px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
          <span className="text-sm text-gray-300 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button onClick={disconnect} className="btn-secondary text-sm">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connect} className="btn-primary text-sm">
      Connect Wallet
    </button>
  );
}
