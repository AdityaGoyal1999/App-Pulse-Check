"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { CheckSidebarMenu } from "@/components/CheckSidebarMenu";
import { Button } from "@/components/ui/button";
import { SidebarInput } from "@/components/ui/sidebar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getChecks } from "@/lib/api";
import type { Check } from "@/lib/types";

type CheckSidebarSectionProps = {
  refreshKey: number;
  activeCheckId?: string;
  activeCheckSection?: "settings" | "history";
};

export function CheckSidebarSection({
  refreshKey,
  activeCheckId,
  activeCheckSection,
}: CheckSidebarSectionProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [checks, setChecks] = useState<Check[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChecks = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const res = await getChecks(
        searchQuery.trim() ? { q: searchQuery.trim() } : undefined,
      );
      setChecks(res.checks);
      setTotal(res.total);
    } catch {
      setChecks([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchChecks(debouncedQuery);
  }, [debouncedQuery, refreshKey, fetchChecks]);

  const isSearching = debouncedQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-2 px-1">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <SidebarInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search checks…"
          className="pl-8"
          aria-label="Search checks"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 px-1 py-1 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading…
        </div>
      ) : total === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">
          {isSearching ? "No checks match your search." : "No checks yet"}
        </p>
      ) : (
        <>
          {isSearching && (
            <p className="px-1 text-xs text-muted-foreground">
              {checks.length} of {total} matching
            </p>
          )}
          <div className="max-h-64 overflow-y-auto pr-1">
            <CheckSidebarMenu
              checks={checks}
              activeCheckId={activeCheckId}
              activeCheckSection={activeCheckSection}
            />
          </div>
        </>
      )}
    </div>
  );
}
