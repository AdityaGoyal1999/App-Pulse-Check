"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getChecks } from "@/lib/api";
import type { Check } from "@/lib/types";

type ChecksContextValue = {
  checks: Check[];
  isLoading: boolean;
  refreshChecks: () => Promise<void>;
};

const ChecksContext = createContext<ChecksContextValue | null>(null);

export function ChecksProvider({ children }: { children: React.ReactNode }) {
  const [checks, setChecks] = useState<Check[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshChecks = useCallback(async () => {
    try {
      const res = await getChecks();
      setChecks(res.checks);
    } catch {
      // Leave existing list on transient errors.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load sidebar checks after mount; same pattern as AuthContext hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only fetch
    void refreshChecks();
  }, [refreshChecks]);

  const value = useMemo(
    () => ({ checks, isLoading, refreshChecks }),
    [checks, isLoading, refreshChecks],
  );

  return (
    <ChecksContext.Provider value={value}>{children}</ChecksContext.Provider>
  );
}

export function useChecks() {
  const ctx = useContext(ChecksContext);
  if (!ctx) {
    throw new Error("useChecks must be used within ChecksProvider");
  }
  return ctx;
}
