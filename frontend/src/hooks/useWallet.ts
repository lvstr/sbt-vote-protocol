"use client";

import { useCallback, useEffect, useState } from "react";
import { NETWORK_PASSPHRASE } from "@/lib/stellar";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isFreighterInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const freighterApi = await import("@stellar/freighter-api");
        const connected = await freighterApi.isConnected();
        setIsFreighterInstalled(connected);

        if (connected) {
          const pubKey = await freighterApi.getPublicKey();
          if (pubKey) {
            setAddress(pubKey);
          }
        }
      } catch {
        setIsFreighterInstalled(false);
      }
    };

    checkFreighter();
  }, []);

  const connect = useCallback(async () => {
    try {
      const freighterApi = await import("@stellar/freighter-api");
      const pubKey = await freighterApi.requestAccess();
      if (pubKey) {
        setAddress(pubKey);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const signTransaction = useCallback(async (xdr: string): Promise<string> => {
    const freighterApi = await import("@stellar/freighter-api");
    const signedXdr = await freighterApi.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    return signedXdr;
  }, []);

  return {
    address,
    isConnected: !!address,
    isFreighterInstalled,
    connect,
    disconnect,
    signTransaction,
  };
}
