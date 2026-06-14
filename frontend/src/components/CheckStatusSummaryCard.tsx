import { formatDistanceToNow } from "date-fns";
import { Copy } from "lucide-react";

import { CopyPingUrlButton } from "@/components/CopyPingUrlButton";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CheckStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckStatusSummaryCardProps = {
  name: string;
  status: CheckStatus;
  paused?: boolean;
  lastPingedAt: string | null;
  intervalSeconds: number;
  graceSeconds?: number;
  uuid: string;
  showPingUrl?: boolean;
  className?: string;
};

function formatInterval(seconds: number): string {
  if (seconds >= 86400 && seconds % 86400 === 0) {
    return `${seconds / 86400}d`;
  }
  if (seconds >= 3600 && seconds % 3600 === 0) {
    return `${seconds / 3600}h`;
  }
  if (seconds >= 60 && seconds % 60 === 0) {
    return `${seconds / 60}m`;
  }
  return `${seconds}s`;
}

export function CheckStatusSummaryCard({
  name,
  status,
  paused = false,
  lastPingedAt,
  intervalSeconds,
  graceSeconds,
  uuid,
  showPingUrl = true,
  className,
}: CheckStatusSummaryCardProps) {
  const lastPingLabel = lastPingedAt
    ? formatDistanceToNow(new Date(lastPingedAt), { addSuffix: true })
    : "Never";

  const metaParts = [
    `Last ping ${lastPingLabel}`,
    `interval ${formatInterval(intervalSeconds)}`,
  ];
  if (graceSeconds != null) {
    metaParts.push(`grace ${formatInterval(graceSeconds)}`);
  }

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute -inset-3 rounded-2xl bg-primary/5 blur-xl"
      />
      <Card className="relative" elevation="featured">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="truncate text-base font-semibold">
              {name}
            </CardTitle>
            <StatusBadge status={status} paused={paused} />
          </div>
          <CardDescription>{metaParts.join(" · ")}</CardDescription>
        </CardHeader>
        {showPingUrl ? (
          <CardContent className="pt-4">
            <div className="rounded-lg elevation-flat bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Copy className="size-3.5" />
                Ping URL
              </div>
              <div className="mt-2">
                <CopyPingUrlButton uuid={uuid} />
              </div>
            </div>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}
