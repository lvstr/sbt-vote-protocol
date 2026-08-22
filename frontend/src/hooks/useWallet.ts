"use client";

import { useCallback, useEffect, useState } from "react";
import { NETWORK_PASSPHRASE, NETWORK } from "@/lib/stellar";

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
        const { isConnected } = await freighterApi.isConnected();
        setIsFreighterInstalled(isConnected);

        if (isConnected) {
          const { address: addr } = await freighterApi.getAddress();
          if (addr) {
            setAddress(addr);
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
      const { address: addr } = await freighterApi.requestAccess();
      if (addr) {
        setAddress(addr);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const freighterApi = await import("@stellar/freighter-api");
      const { signedTxXdr } = await freighterApi.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        network: NETWORK,
      });
      return signedTxXdr;
    },
    []
  );

  return {
    address,
    isConnected: !!address,
    isFreighterInstalled,
    connect,
    disconnect,
    signTransaction,
  };
}
