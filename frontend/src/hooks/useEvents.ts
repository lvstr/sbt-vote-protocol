"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { rpc } from "@stellar/stellar-sdk";
import { getContractEvents } from "@/lib/stellar";

export interface ContractEvent {
  id: string;
  type: string;
  topic: string[];
  data: string;
  ledger: number;
  timestamp: Date;
}

/**
 * Hook that polls for real-time contract events.
 */
export function useEvents(intervalMs: number = 5000) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLedgerRef = useRef<number | undefined>(undefined);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await getContractEvents(lastLedgerRef.current);

      if (response.events && response.events.length > 0) {
        const newEvents: ContractEvent[] = response.events.map(
          (event: rpc.Api.EventResponse, idx: number) => ({
            id: `${event.id || idx}-${Date.now()}`,
            type:
              event.topic
                .map((t: rpc.Api.EventResponse["topic"][number]) =>
                  t.toString()
                )
                .find(
                  (t: string) => t.includes("mint") || t.includes("vote")
                ) || "unknown",
            topic: event.topic.map(
              (t: rpc.Api.EventResponse["topic"][number]) => t.toString()
            ),
            data: event.value.toString(),
            ledger: event.ledger,
            timestamp: new Date(),
          })
        );

        setEvents((prev) => [...newEvents, ...prev].slice(0, 100));
        lastLedgerRef.current = response.latestLedger;
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    }
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CONTRACT_ID) return;

    setIsPolling(true);
    fetchEvents();

    const interval = setInterval(fetchEvents, intervalMs);
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [fetchEvents, intervalMs]);

  return { events, isPolling, error };
}
