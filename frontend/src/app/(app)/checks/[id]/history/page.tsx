"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckPageNav } from "@/components/CheckPageNav";
import { CheckStatusSummaryCard } from "@/components/CheckStatusSummaryCard";
import { PingHistoryTimeline } from "@/components/PingHistoryTimeline";
import { CheckHistorySkeleton } from "@/components/skeletons/CheckHistorySkeleton";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCheck, getCheckPingLogs } from "@/lib/api";
import type { CheckSettings, PingLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CheckHistoryPage() {
  const params = useParams<{ id: string }>();
  const checkId = params.id;

  const [check, setCheck] = useState<CheckSettings | null>(null);
  const [logs, setLogs] = useState<PingLogEntry[]>([]);
  const [retentionLimit, setRetentionLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setApiError("");
      setNotFound(false);

      try {
        const [check, pingLogs] = await Promise.all([
          getCheck(checkId),
          getCheckPingLogs(checkId),
        ]);
        if (cancelled) return;
        setCheck(check);
        setLogs(pingLogs.logs);
        setRetentionLimit(pingLogs.retentionLimit);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Request failed";
        if (message === "Check not found") {
          setNotFound(true);
        } else {
          setApiError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [checkId]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8 lg:py-12">
      <CheckPageNav
        checkId={checkId}
        checkName={check?.name}
        active="history"
      />

      {isLoading ? (
        <CheckHistorySkeleton />
      ) : notFound ? (
        <div className="space-y-3">
          <p className="text-destructive">Check not found.</p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to checks
          </Link>
        </div>
      ) : apiError ? (
        <p className="text-destructive">{apiError}</p>
      ) : check ? (
        <div className="flex flex-col gap-6">
          <CheckStatusSummaryCard
            status={check.status}
            paused={check.paused}
            lastPingedAt={check.lastPingedAt}
            intervalSeconds={check.intervalSeconds}
            graceSeconds={check.graceSeconds}
            uuid={check.uuid}
            showPingUrl={false}
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent pings</CardTitle>
              <CardDescription>
                Newest pings first. Older entries are removed once your plan
                retention limit is reached.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>No pings recorded yet.</p>
                  <Link
                    href={`/checks/${checkId}/settings`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Go to check settings
                  </Link>
                </div>
              ) : (
                <>
                  <PingHistoryTimeline logs={logs} />
                  {retentionLimit !== null && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Showing {logs.length} of up to {retentionLimit} retained
                      pings
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
