"use client";

import React from "react";
import Image from "next/image";
import { WalletButton } from "./WalletButton";
import { useWallet } from "@/hooks/useWallet";

interface NavbarProps {
  currentView: "landing" | "dashboard";
  onSwitchView: (view: "landing" | "dashboard") => void;
  hasSbt: boolean;
  onOpenSbtModal: () => void;
  onCreatePoll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSwitchView,
  hasSbt,
  onOpenSbtModal,
  onCreatePoll,
}) => {
  const { isConnected } = useWallet();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-[#0B0F17]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4 py-3">
        {/* Brand / Logo */}
        <div
          onClick={() => onSwitchView(isConnected ? "dashboard" : "landing")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center p-1">
            <Image
              src="/soulbound.png"
              alt="SBT Vote"
              width={18}
              height={18}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-white tracking-tight">
              SBT Vote
            </span>
            <span className="badge badge-blue text-[10px] px-1.5 py-0">
              Soroban
            </span>
          </div>
        </div>

        {/* Center Nav Links - ONLY VISIBLE WHEN LOGGED IN */}
        {isConnected && (
          <nav className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => onSwitchView("dashboard")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentView === "dashboard"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSwitchView("landing")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                currentView === "landing"
                  ? "bg-slate-800 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tentang
            </button>
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Testnet</span>
          </div>

          {isConnected && (
            <>
              {/* SBT Verification Status */}
              <button
                onClick={onOpenSbtModal}
                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                  hasSbt
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                {hasSbt ? "SBT Aktif ✓" : "Klaim SBT"}
              </button>

              {/* Quick Create Poll */}
              <button
                onClick={onCreatePoll}
                className="hidden md:inline-flex btn-primary text-xs px-3 py-1.5"
              >
                <span>+ Buat Voting</span>
              </button>
            </>
          )}

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
