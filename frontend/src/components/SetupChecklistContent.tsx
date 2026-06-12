"use client";

import Link from "next/link";
import {
  Bell,
  Check as CheckIcon,
  Circle,
  Copy,
  PartyPopper,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getPingUrl } from "@/lib/api";
import type { Check } from "@/lib/types";
import { cn } from "@/lib/utils";

type SetupChecklistContentProps = {
  check: Check;
  onNavigateAway?: () => void;
};

type StepState = "complete" | "current" | "upcoming";

function getStepState(index: number, completed: boolean[]): StepState {
  if (completed[index]) return "complete";
  const firstIncomplete = completed.findIndex((done) => !done);
  return index === firstIncomplete ? "current" : "upcoming";
}

export function SetupChecklistContent({
  check,
  onNavigateAway,
}: SetupChecklistContentProps) {
  const pingUrl = getPingUrl(check.uuid);
  const hasPinged = check.lastPingedAt !== null;
  const hasAlerts = check.hasAlerts;
  const allDone = hasPinged;

  const completed = [true, hasPinged, hasAlerts, allDone];

  async function copyPingUrl() {
    try {
      await navigator.clipboard.writeText(pingUrl);
      toast.success("Ping URL copied");
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  const steps = [
    {
      title: "Create a check",
      description: `"${check.name}" is ready to monitor.`,
      icon: PlusCircle,
      detail: null,
    },
    {
      title: "Add the ping URL to your script",
      description: hasPinged
        ? "Your job has sent at least one successful ping."
        : "Call this URL with HTTP GET when the job finishes successfully.",
      icon: Copy,
      detail: (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <code className="block min-w-0 flex-1 break-all rounded-md border border-border bg-muted/50 px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground">
              {pingUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 sm:mt-0.5"
              onClick={() => void copyPingUrl()}
            >
              <Copy className="size-3.5" />
              Copy URL
            </Button>
          </div>
          <div className="overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Example
            </p>
            <code className="block font-mono text-xs leading-relaxed break-all text-foreground">
              curl -fsS &quot;{pingUrl}&quot;
            </code>
          </div>
        </div>
      ),
    },
    {
      title: "Set up alerts (optional)",
      description: hasAlerts
        ? "Slack webhook configured for this check."
        : "Add a Slack Incoming Webhook so you get notified when this check goes down.",
      icon: Bell,
      detail: !hasAlerts ? (
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/checks/${check.id}/settings`} />}
          onClick={onNavigateAway}
        >
          <Bell className="size-3.5" />
          Configure alerts
        </Button>
      ) : null,
    },
    {
      title: "You're all set",
      description: allDone
        ? "App Pulse Check will watch this job and alert you if it misses a beat."
        : "Add the ping URL to your script — then we will monitor it for you.",
      icon: PartyPopper,
      detail: null,
    },
  ];

  return (
    <div className="min-w-0">
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const state = getStepState(index, completed);
          const isLast = index === steps.length - 1;
          const StepIcon = step.icon;

          return (
            <li key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border",
                    state === "complete" &&
                      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
                    state === "current" &&
                      "border-primary/30 bg-primary/10 text-primary",
                    state === "upcoming" &&
                      "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  {state === "complete" ? (
                    <CheckIcon className="size-4" strokeWidth={2.5} />
                  ) : state === "current" ? (
                    <StepIcon className="size-4" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "my-1 min-h-6 w-px flex-1",
                      completed[index]
                        ? "bg-green-200 dark:bg-green-900"
                        : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
                <p
                  className={cn(
                    "leading-snug font-medium",
                    state === "upcoming"
                      ? "text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
                {state !== "upcoming" && step.detail ? (
                  <div className="mt-3">{step.detail}</div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-2 text-xs text-muted-foreground">
        Need more detail? See the{" "}
        <Link
          href="/docs#quick-start"
          className="text-primary hover:underline"
          onClick={onNavigateAway}
        >
          quick start guide
        </Link>
        .
      </p>
    </div>
  );
}
