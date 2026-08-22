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

        // Freighter API v6: isConnected() → { isConnected: boolean, error? }
        const connResult = await freighterApi.isConnected();
        const isInstalled = connResult.isConnected;
        setIsFreighterInstalled(isInstalled);

        const wasConnected =
          localStorage.getItem(STORAGE_WALLET_CONNECTED) === "true";

        if (isInstalled && wasConnected) {
          // v6: getAddress() → { address: string, error? }
          const addrResult = await freighterApi.getAddress();
          if (addrResult.error) {
            localStorage.removeItem(STORAGE_WALLET_CONNECTED);
            localStorage.removeItem(STORAGE_WALLET_ADDRESS);
            setAddress(null);
          } else if (addrResult.address) {
            setAddress(addrResult.address);
            localStorage.setItem(STORAGE_WALLET_ADDRESS, addrResult.address);
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
      // v6: requestAccess() → { address: string, error? }
      const result = await freighterApi.requestAccess();
      if (result.error) {
        console.error("Freighter access error:", result.error);
        return;
      }
      if (result.address) {
        setAddress(result.address);
        localStorage.setItem(STORAGE_WALLET_CONNECTED, "true");
        localStorage.setItem(STORAGE_WALLET_ADDRESS, result.address);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.setItem(STORAGE_WALLET_CONNECTED, "false");
    localStorage.removeItem(STORAGE_WALLET_ADDRESS);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string): Promise<string> => {
      const freighterApi = await import("@stellar/freighter-api");
      // v6: signTransaction() → { signedTxXdr: string, signerAddress: string, error? }
      const result = await freighterApi.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      if (result.error) {
        throw new Error(result.error.message || "Freighter signing failed");
      }
      return result.signedTxXdr;
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
