"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center p-1">
              <Image src="/soulbound.png" alt="SBT Vote" width={22} height={22} />
            </div>
            <div>
              <span className="font-bold text-sm text-white">SBT Vote Protocol</span>
              <p className="text-xs text-slate-400">
                Decentralized Permissionless Voting on Stellar Soroban
              </p>
            </div>
          </div>

          {/* Links & Info */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Stellar Testnet RPC Connected</span>
            </div>
            <a
              href="https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-300 transition-colors"
            >
              Soroban Docs
            </a>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-300 transition-colors"
            >
              Freighter Wallet
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>&copy; {new Date().getFullYear()} SBT Vote Protocol. Open-Source MIT License.</span>
          <span>1-Person-1-Vote Soulbound Identity Protection</span>
        </div>
      </div>
    </footer>
  );
}
