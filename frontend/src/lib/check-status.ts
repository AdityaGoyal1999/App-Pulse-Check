import type { CheckStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckStatusState = {
  status: CheckStatus;
  paused?: boolean;
};

export function getCheckRowClassName({
  status,
  paused = false,
}: CheckStatusState) {
  return cn(
    paused && "opacity-60",
    status === "DOWN" &&
      "bg-destructive/5 hover:bg-destructive/10 has-aria-expanded:bg-destructive/10",
  );
}

export function getCheckSurfaceClassName({
  status,
  paused = false,
}: CheckStatusState) {
  return cn(
    paused && "opacity-60",
    status === "DOWN" && "bg-destructive/5",
  );
}
