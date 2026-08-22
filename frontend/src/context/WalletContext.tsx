"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { NETWORK_PASSPHRASE } from "@/lib/stellar";

const STORAGE_WALLET_CONNECTED = "sbt_vote_wallet_connected";
const STORAGE_WALLET_ADDRESS = "sbt_vote_wallet_address";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isFreighterInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const freighterApi = await import("@stellar/freighter-api");
        const connected = await freighterApi.isConnected();
        setIsFreighterInstalled(connected);

        // Check if user previously connected (and did not click disconnect)
        const wasConnected =
          localStorage.getItem(STORAGE_WALLET_CONNECTED) === "true";

        if (connected && wasConnected) {
          const pubKey = await freighterApi.getPublicKey();
          if (pubKey) {
            setAddress(pubKey);
            localStorage.setItem(STORAGE_WALLET_ADDRESS, pubKey);
          } else {
            localStorage.removeItem(STORAGE_WALLET_CONNECTED);
            localStorage.removeItem(STORAGE_WALLET_ADDRESS);
            setAddress(null);
          }
        } else {
          setAddress(null);
        }
      } catch {
        setIsFreighterInstalled(false);
        setAddress(null);
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
        localStorage.setItem(STORAGE_WALLET_CONNECTED, "true");
        localStorage.setItem(STORAGE_WALLET_ADDRESS, pubKey);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    // Explicitly record disconnection so auto-connect will NOT trigger
    localStorage.setItem(STORAGE_WALLET_CONNECTED, "false");
    localStorage.removeItem(STORAGE_WALLET_ADDRESS);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const freighterApi = await import("@stellar/freighter-api");
      const signedXdr = await freighterApi.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      return signedXdr;
    },
    []
  );

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: Boolean(address),
        isFreighterInstalled,
        connect,
        disconnect,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWalletContext(): WalletState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
