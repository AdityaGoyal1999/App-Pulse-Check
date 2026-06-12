"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";

import { CheckRow } from "@/components/CheckRow";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChecks } from "@/lib/api";
import type { Check } from "@/lib/types";

type CheckListProps = {
  refreshKey: number;
  onDeleted: () => void;
};

export type CheckListRef = {
  refresh: () => void;
};

export const CheckList = forwardRef<CheckListRef, CheckListProps>(
  function CheckList({ refreshKey, onDeleted }, ref) {
    const hasLoadedRef = useRef(false);
    const [checks, setChecks] = useState<Check[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchChecks = useCallback(async (background = false) => {
      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError("");
      try {
        const res = await getChecks();
        setChecks(res.checks);
        hasLoadedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load checks");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        refresh: () => fetchChecks(true),
      }),
      [fetchChecks],
    );

    useEffect(() => {
      fetchChecks(hasLoadedRef.current);
    }, [fetchChecks, refreshKey]);

    useEffect(() => {
      function handleFocus() {
        if (hasLoadedRef.current) {
          fetchChecks(true);
        }
      }

      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }, [fetchChecks]);

    if (isLoading) {
      return (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchChecks(false)}>
            Retry
          </Button>
        </div>
      );
    }

    if (checks.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No checks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first check to start monitoring a job or cron.
          </p>
        </div>
      );
    }

    return (
      <div className={isRefreshing ? "opacity-60 transition-opacity" : undefined}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Last Pinged</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ping URL</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Options</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.map((check) => (
              <CheckRow
                key={check.id}
                check={check}
                onDeleted={onDeleted}
                onUpdated={() => fetchChecks(true)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
);
