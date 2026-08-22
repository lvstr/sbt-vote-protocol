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
        className="px-4 py-2 bg-stellar-purple rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Install Freighter
      </a>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300 font-mono">
          {address.slice(0, 4)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-3 py-1.5 bg-stellar-card border border-stellar-border rounded-lg text-sm hover:bg-red-900/30 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-stellar-purple rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
    >
      Connect Wallet
    </button>
  );
}
