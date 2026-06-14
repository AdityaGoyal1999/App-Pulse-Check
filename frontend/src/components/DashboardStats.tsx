"use client";

import type { ReactNode } from "react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

import { PlanBadge } from "@/components/PlanBadge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";
import type { Check, UserMe } from "@/lib/types";
import { cn } from "@/lib/utils";

function StatusPulseDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2", className)} aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/70" />
      <span className="relative inline-flex size-2 rounded-full bg-success" />
    </span>
  );
}

type DashboardStatsProps = {
  userMe: UserMe;
  checks: Check[];
};

type StatCardProps = {
  icon: ReactNode;
  value: number | string;
  label: string;
  description: string;
  className?: string;
};

function StatCard({ icon, value, label, description, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">{icon}</div>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <CardDescription>
          <span className="font-medium text-foreground">{label}</span>
          <span className="mt-0.5 block">{description}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function DashboardStats({ userMe, checks }: DashboardStatsProps) {
  const upCount = checks.filter((c) => c.status === "UP").length;
  const downCount = checks.filter((c) => c.status === "DOWN").length;
  const atLimit = userMe.checkCount >= userMe.limits.maxChecks;
  const usagePercent = Math.min(
    100,
    (userMe.checkCount / userMe.limits.maxChecks) * 100,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="size-4" />
          </div>
        }
        value={userMe.checkCount}
        label="Total checks"
        description="Across your account"
      />

      <StatCard
        icon={
          <div className="relative flex size-9 items-center justify-center rounded-lg border border-success-border bg-success-muted text-success-foreground">
            <StatusPulseDot className="absolute top-2 right-2" />
            <CheckCircle2 className="size-4" />
          </div>
        }
        value={upCount}
        label="Up"
        description="Healthy and checking in"
      />

      <StatCard
        className={downCount > 0 ? "bg-destructive/5" : undefined}
        icon={
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="size-4" />
          </div>
        }
        value={downCount}
        label="Down"
        description="Missed check-in window"
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-4" />
            </div>
            <PlanBadge plan={userMe.plan} asLink />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {userMe.checkCount} / {userMe.limits.maxChecks}
          </CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">Plan usage</span>
          </CardDescription>
          <ProgressPrimitive.Root
            value={usagePercent}
            className="mt-3 flex w-full flex-col gap-2"
          >
            <div className="flex w-full items-center gap-2">
              <ProgressLabel>Checks used</ProgressLabel>
              <ProgressValue />
            </div>
            <ProgressTrack className="h-1.5">
              <ProgressIndicator
                className={cn(atLimit && "bg-destructive")}
              />
            </ProgressTrack>
          </ProgressPrimitive.Root>
          {atLimit && (
            <p className="text-xs text-destructive">Limit reached</p>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
