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

export function StatusBadge({ status }: { status: CheckStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
