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
        className="btn-primary text-xs sm:text-sm px-3.5 py-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        <span>Pasang Freighter</span>
      </a>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-900 border border-brand-500/40 rounded-xl px-3 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-xs sm:text-sm text-brand-200 font-mono font-medium">
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="btn-outline text-xs px-2.5 py-1.5 text-slate-400 hover:text-red-400 hover:border-red-500/40"
          title="Putuskan Wallet"
        >
          Putus
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="btn-primary text-xs sm:text-sm px-4 py-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
      <span>Hubungkan Wallet</span>
    </button>
  );
}
