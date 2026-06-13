"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCheck, getCheckPingLogs } from "@/lib/api";
import type { PingLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CheckHistoryPage() {
  const params = useParams<{ id: string }>();
  const checkId = params.id;

  const [checkName, setCheckName] = useState<string | null>(null);
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
        setCheckName(check.name);
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
      <div>
        <Link
          href={`/checks/${checkId}/settings`}
          className={cn(
            buttonVariants({ variant: "link", size: "sm" }),
            "mb-2 h-auto px-0 text-muted-foreground",
          )}
        >
          Back to settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Ping history
        </h1>
        {checkName && (
          <p className="mt-2 text-muted-foreground">
            Recent pings for{" "}
            <span className="font-medium text-foreground">{checkName}</span>
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading ping history…
        </div>
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
      ) : (
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pinged</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {formatDistanceToNow(new Date(log.pingedAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(log.pingedAt), "PPpp")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
      )}
    </div>
  );
}
