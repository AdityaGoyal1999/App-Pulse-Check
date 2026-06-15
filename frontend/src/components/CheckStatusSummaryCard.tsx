import type { ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";

import { CopyPingUrlButton } from "@/components/CopyPingUrlButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { CheckStatus } from "@/lib/types";
import { getCheckSurfaceClassName } from "@/lib/check-status";
import { cn } from "@/lib/utils";

type CheckStatusSummaryCardProps = {
  status: CheckStatus;
  paused?: boolean;
  lastPingedAt: string | null;
  intervalSeconds: number;
  graceSeconds?: number;
  uuid: string;
  showPingUrl?: boolean;
  actions?: ReactNode;
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
  status,
  paused = false,
  lastPingedAt,
  intervalSeconds,
  graceSeconds,
  uuid,
  showPingUrl = true,
  actions,
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

  const hasActions = showPingUrl || actions;

  return (
    <Card
      className={cn(
        getCheckSurfaceClassName({ status, paused }),
        className,
      )}
      elevation="featured"
    >
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <StatusBadge status={status} paused={paused} />
          <p className="text-sm text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        </div>
        {hasActions ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            {showPingUrl ? <CopyPingUrlButton uuid={uuid} /> : null}
            {actions}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
