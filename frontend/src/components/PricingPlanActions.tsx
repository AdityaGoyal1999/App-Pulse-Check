"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { ButtonPending } from "@/components/ButtonPending";
import { buttonVariants } from "@/components/ui/button";
import { getToken, getCurrentUser, createCheckoutSession } from "@/lib/api";
import type { Plan } from "@/lib/types";
import type { MarketingPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

type PricingPlanActionsProps = {
  plan: MarketingPlan;
};

export function PricingPlanActions({ plan }: PricingPlanActionsProps) {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getToken()) {
        if (!cancelled) {
          setCurrentPlan(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!cancelled) setCurrentPlan(user.plan);
      } catch {
        if (!cancelled) setCurrentPlan(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSupporterUpgrade() {
    if (!getToken()) {
      router.push("/login?next=/pricing");
      return;
    }

    setIsCheckingOut(true);
    try {
      const { url } = await createCheckoutSession("SUPPORTER");
      window.location.href = url;
    } catch {
      router.push("/settings/billing");
      setIsCheckingOut(false);
    }
  }

  if (plan.id === "FREE") {
    if (isLoading) {
      return (
        <button
          type="button"
          disabled
          className={cn(buttonVariants({ className: "w-full" }))}
        >
          <Loader2 className="size-4 animate-spin" />
        </button>
      );
    }

    if (currentPlan) {
      return (
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ className: "w-full" }))}
        >
          Go to dashboard
          <ArrowRight />
        </Link>
      );
    }

    return (
      <Link
        href="/signup"
        className={cn(buttonVariants({ className: "w-full" }))}
      >
        Get started free
        <ArrowRight />
      </Link>
    );
  }

  if (plan.id === "SUPPORTER") {
    if (isLoading) {
      return (
        <button
          type="button"
          disabled
          className={cn(buttonVariants({ variant: "outline", className: "w-full" }))}
        >
          <Loader2 className="size-4 animate-spin" />
        </button>
      );
    }

    if (currentPlan === "SUPPORTER") {
      return (
        <Link
          href="/settings/billing"
          className={cn(buttonVariants({ variant: "outline", className: "w-full" }))}
        >
          Current plan
        </Link>
      );
    }

    if (currentPlan === "FREE") {
      return (
        <button
          type="button"
          onClick={() => void handleSupporterUpgrade()}
          disabled={isCheckingOut}
          className={cn(buttonVariants({ className: "w-full" }))}
        >
          <ButtonPending pending={isCheckingOut} pendingLabel="Redirecting...">
            <>
              Upgrade to Supporter
              <ArrowRight />
            </>
          </ButtonPending>
        </button>
      );
    }

    return (
      <Link
        href="/settings/billing"
        className={cn(buttonVariants({ variant: "outline", className: "w-full" }))}
      >
        View billing
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled
      className={cn(buttonVariants({ variant: "outline", className: "w-full" }))}
    >
      Coming soon
    </button>
  );
}
