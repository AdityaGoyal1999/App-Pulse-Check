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

export function StatusBadge({
  status,
  paused = false,
}: {
  status: CheckStatus;
  paused?: boolean;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={config.variant} className={cn(config.className)}>
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
