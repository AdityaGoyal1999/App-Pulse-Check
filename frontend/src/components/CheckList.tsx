"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Activity, BookOpen, Search } from "lucide-react";

import { CheckRow } from "@/components/CheckRow";
import { CheckListSkeleton } from "@/components/skeletons/CheckListSkeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChecks } from "@/lib/api";
import type { Check } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckListProps = {
  refreshKey: number;
  searchQuery?: string;
  onDeleted: () => void;
  onChecksChange?: (checks: Check[]) => void;
  onCreateClick?: () => void;
  createDisabled?: boolean;
};

export type CheckListRef = {
  refresh: () => void;
};

export const CheckList = forwardRef<CheckListRef, CheckListProps>(
  function CheckList(
    {
      refreshKey,
      searchQuery = "",
      onDeleted,
      onChecksChange,
      onCreateClick,
      createDisabled = false,
    },
    ref,
  ) {
    const hasLoadedRef = useRef(false);
    const [checks, setChecks] = useState<Check[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchChecks = useCallback(
      async (background = false) => {
        if (background) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError("");
        try {
          const q = searchQuery.trim();
          const res = await getChecks(q ? { q } : undefined);
          setChecks(res.checks);
          setTotal(res.total);
          onChecksChange?.(res.checks);
          hasLoadedRef.current = true;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load checks");
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [onChecksChange, searchQuery],
    );

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
      return <CheckListSkeleton />;
    }

    if (error) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchChecks(false)}>
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (total === 0) {
      const isSearching = searchQuery.trim().length > 0;
      const EmptyIcon = isSearching ? Search : Activity;

      return (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-20 text-center">
            <div
              className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-hidden
            >
              <EmptyIcon className="size-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isSearching ? "No checks match your search" : "No checks yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSearching
                  ? "Try a different name or clear the search."
                  : "Create your first check to start monitoring a job or cron."}
              </p>
            </div>
            {!isSearching && (
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <Button
                  type="button"
                  disabled={createDisabled}
                  onClick={onCreateClick}
                >
                  Create check
                </Button>
                <Link
                  href="/docs#quick-start"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  <BookOpen className="size-3.5" />
                  Read the quick start guide
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    const isSearching = searchQuery.trim().length > 0;

    return (
      <Card className={isRefreshing ? "opacity-60 transition-opacity" : undefined}>
        <CardHeader className={isSearching ? "border-b" : "sr-only"}>
          {isSearching ? (
            <>
              <CardTitle>Search results</CardTitle>
              <CardDescription>
                Showing {checks.length} of {total} matching checks
              </CardDescription>
            </>
          ) : (
            <CardTitle>Checks</CardTitle>
          )}
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Last Pinged</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ping URL</TableHead>
                <TableHead className="w-28 text-right">
                  <span className="sr-only">Actions</span>
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
        </CardContent>
      </Card>
    );
  },
);
