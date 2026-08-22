"use client";

import { useWalletContext, WalletState } from "@/context/WalletContext";

export type { WalletState };

export function useWallet(): WalletState {
  return useWalletContext();
}
