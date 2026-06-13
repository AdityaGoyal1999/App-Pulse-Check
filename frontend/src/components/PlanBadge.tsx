"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { getCurrentUser, getToken } from "@/lib/api";
import { getMarketingPlan, type MarketingPlanId } from "@/lib/plans";
import { PLAN_UPDATED_EVENT } from "@/lib/plan-events";
import type { Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

function badgeVariantForPlan(plan: Plan): "default" | "secondary" | "outline" {
  if (plan === "FREE") return "secondary";
  if (plan === "SUPPORTER") return "default";
  return "outline";
}

type PlanBadgeProps = {
  plan: Plan;
  className?: string;
  asLink?: boolean;
};

export function PlanBadge({ plan, className, asLink = false }: PlanBadgeProps) {
  const label = getMarketingPlan(plan as MarketingPlanId).name;
  const badge = (
    <Badge variant={badgeVariantForPlan(plan)} className={className}>
      {label}
    </Badge>
  );

  if (asLink) {
    return (
      <Link href="/settings/billing" className="inline-flex">
        {badge}
      </Link>
    );
  }

  return badge;
}

export function UserPlanBadge({ className }: { className?: string }) {
  const pathname = usePathname();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    function onPlanUpdated() {
      setRefreshKey((key) => key + 1);
    }

    window.addEventListener(PLAN_UPDATED_EVENT, onPlanUpdated);
    return () => window.removeEventListener(PLAN_UPDATED_EVENT, onPlanUpdated);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getToken()) {
        if (!cancelled) setPlan(null);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!cancelled) setPlan(user.plan);
      } catch {
        if (!cancelled) setPlan(null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pathname, refreshKey]);

  if (!plan) return null;

  return (
    <PlanBadge
      plan={plan}
      asLink
      className={cn("mt-1.5", className)}
    />
  );
}
