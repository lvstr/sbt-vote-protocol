"use client";

import Image from "next/image";
import { WalletButton } from "./WalletButton";
import { useWallet } from "@/hooks/useWallet";

interface NavbarProps {
  activeTab: "landing" | "polls" | "create" | "identity";
  setActiveTab: (tab: "landing" | "polls" | "create" | "identity") => void;
  hasSbt: boolean;
  onOpenSbtModal: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  hasSbt,
  onOpenSbtModal,
}: NavbarProps) {
  const { isConnected } = useWallet();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3.5">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab("landing")}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
              <Image
                src="/soulbound.png"
                alt="SBT Vote Protocol"
                width={26}
                height={26}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-brand-400 transition-colors">
                SBT Vote
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30 rounded-md">
                Protocol
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Stellar Soroban Multi-Voting
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "landing"
                ? "bg-slate-800 text-brand-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => setActiveTab("polls")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "polls"
                ? "bg-slate-800 text-brand-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            Voting Hub
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
              activeTab === "create"
                ? "bg-slate-800 text-brand-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <span className="text-brand-400 font-bold">+</span> Buat Voting
          </button>
          <button
            onClick={() => setActiveTab("identity")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "identity"
                ? "bg-slate-800 text-brand-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            Identitas SBT
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Stellar Testnet</span>
          </div>

          {/* SBT Badge Pill */}
          {isConnected && (
            <button
              onClick={onOpenSbtModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                hasSbt
                  ? "bg-brand-950/60 border border-brand-500/40 text-brand-300 hover:bg-brand-900/40"
                  : "bg-amber-950/60 border border-amber-500/50 text-amber-300 hover:bg-amber-900/40 animate-pulse"
              }`}
            >
              {hasSbt ? (
                <>
                  <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  <span className="hidden sm:inline">SBT Terverifikasi</span>
                  <span className="sm:hidden">SBT ✓</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>Klaim SBT</span>
                </>
              )}
            </button>
          )}

          {/* Wallet Connect */}
          <WalletButton />
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab("landing")}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === "landing" ? "bg-slate-800 text-brand-300" : "text-slate-400"
          }`}
        >
          Beranda
        </button>
        <button
          onClick={() => setActiveTab("polls")}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === "polls" ? "bg-slate-800 text-brand-300" : "text-slate-400"
          }`}
        >
          Voting Hub
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === "create" ? "bg-slate-800 text-brand-300" : "text-slate-400"
          }`}
        >
          + Buat
        </button>
        <button
          onClick={() => setActiveTab("identity")}
          className={`px-3 py-1 text-xs font-medium rounded-lg ${
            activeTab === "identity" ? "bg-slate-800 text-brand-300" : "text-slate-400"
          }`}
        >
          SBT
        </button>
      </div>
    </header>
  );
}
