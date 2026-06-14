import { Badge } from "@/components/ui/badge";
import type { CheckStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  CheckStatus,
  { label: string; variant: "outline" | "destructive" | "secondary"; className?: string }
> = {
  NEW: { label: "New", variant: "outline" },
  UP: {
    label: "Up",
    variant: "secondary",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
  },
  DOWN: { label: "Down", variant: "destructive" },
};

function StatusDot({
  status,
  pulse = false,
}: {
  status: CheckStatus;
  pulse?: boolean;
}) {
  if (status === "UP") {
    return (
      <span className="relative flex size-2 shrink-0" aria-hidden>
        {pulse ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500/70" />
        ) : null}
        <span className="relative inline-flex size-2 rounded-full bg-green-600 dark:bg-green-500" />
      </span>
    );
  }

  if (status === "DOWN") {
    return (
      <span
        className="size-2 shrink-0 rounded-full bg-destructive"
        aria-hidden
      />
    );
  }

  return null;
}

export function StatusBadge({
  status,
  paused = false,
}: {
  status: CheckStatus;
  paused?: boolean;
}) {
  const config = STATUS_CONFIG[status];
  const showUpPulse = status === "UP" && !paused;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant={config.variant}
        className={cn("gap-1.5", config.className)}
      >
        <StatusDot status={status} pulse={showUpPulse} />
        {config.label}
      </Badge>
      {paused && (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
        >
          Paused
        </Badge>
      )}
    </div>
  );
}
