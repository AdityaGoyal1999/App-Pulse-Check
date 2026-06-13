"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ChecksContextValue = {
  refreshKey: number;
  refreshChecks: () => void;
};

const ChecksContext = createContext<ChecksContextValue | null>(null);

export function ChecksProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshChecks = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(
    () => ({ refreshKey, refreshChecks }),
    [refreshKey, refreshChecks],
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
