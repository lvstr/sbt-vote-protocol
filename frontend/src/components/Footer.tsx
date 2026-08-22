"use client";

import React from "react";
import Image from "next/image";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#0B0F17] py-8 mt-12 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center p-0.5">
              <Image src="/soulbound.png" alt="" width={16} height={16} />
            </div>
            <span className="font-semibold text-slate-200">SBT Vote Protocol</span>
            <span className="text-slate-500">|</span>
            <span>Stellar Soroban Decentralized Voting</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              Soroban Docs
            </a>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              Freighter Wallet
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} SBT Vote Protocol. MIT License.</span>
          <span>1-Person-1-Vote Soulbound Identity Protection</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
