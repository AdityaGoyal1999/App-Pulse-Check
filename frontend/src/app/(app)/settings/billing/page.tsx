"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import { ButtonPending } from "@/components/ButtonPending";
import { PlanBadge } from "@/components/PlanBadge";
import { AppPageHeader } from "@/components/AppPageHeader";
import { BillingSkeleton } from "@/components/skeletons/BillingSkeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  confirmCheckoutSession,
  createCheckoutSession,
  createPortalSession,
  getBillingStatus,
  getCurrentUser,
  syncBilling,
} from "@/lib/api";
import { notifyPlanUpdated } from "@/lib/plan-events";
import type { BillingStatus, UserMe } from "@/lib/types";
import { getMarketingPlan } from "@/lib/plans";

function formatPeriodEnd(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BillingSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserMe | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBillingData() {
      const [me, status] = await Promise.all([
        getCurrentUser(),
        getBillingStatus(),
      ]);
      if (cancelled) return;
      setUser(me);
      setBilling(status);
      notifyPlanUpdated();
    }

    async function initialize() {
      setIsLoading(true);
      setError("");

      try {
        const success = searchParams.get("success") === "1";
        const canceled = searchParams.get("canceled") === "1";
        const sessionId = searchParams.get("session_id");

        if (success) {
          if (sessionId) {
            await confirmCheckoutSession(sessionId);
          } else {
            await syncBilling();
          }
          if (!cancelled) {
            toast.success(
              "Subscription updated. Thanks for supporting App Pulse Check!",
            );
          }
        } else if (canceled) {
          if (!cancelled) toast.message("Checkout canceled");
        }

        await loadBillingData();

        if (success || canceled) {
          router.replace("/settings/billing");
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load billing");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  async function handleSync() {
    setIsSyncing(true);
    setError("");

    try {
      await syncBilling();
      const [me, status] = await Promise.all([
        getCurrentUser(),
        getBillingStatus(),
      ]);
      setUser(me);
      setBilling(status);
      notifyPlanUpdated();
      toast.success("Billing synced from Stripe.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync billing");
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleUpgrade() {
    setIsUpgrading(true);
    setError("");

    try {
      const { url } = await createCheckoutSession("SUPPORTER");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setIsUpgrading(false);
    }
  }

  async function handleManageSubscription() {
    setIsOpeningPortal(true);
    setError("");

    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open portal");
      setIsOpeningPortal(false);
    }
  }

  const plan = user?.plan ?? billing?.plan ?? "FREE";
  const marketingPlan = getMarketingPlan(plan);
  const periodEnd = formatPeriodEnd(billing?.currentPeriodEnd ?? null);
  const canUpgradeToSupporter = plan === "FREE";
  const canManageSubscription =
    plan === "SUPPORTER" && billing?.subscriptionStatus !== null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:py-12">
      <AppPageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Billing
            </h1>
          </div>
        }
        description="Manage your plan and subscription."
        className="mb-8"
      />

      {isLoading ? (
        <BillingSkeleton />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Current plan</CardTitle>
                  <CardDescription className="mt-1">
                    {marketingPlan.description}
                  </CardDescription>
                </div>
                <PlanBadge plan={plan} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Checks</p>
                  <p className="font-medium text-foreground">
                    {user?.limits.maxChecks.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ping logs / check</p>
                  <p className="font-medium text-foreground">
                    {user?.limits.maxPingLogsPerCheck.toLocaleString()}
                  </p>
                </div>
              </div>

              {billing?.subscriptionStatus && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                  <p className="text-muted-foreground">Subscription status</p>
                  <p className="font-medium capitalize text-foreground">
                    {billing.subscriptionStatus.replaceAll("_", " ")}
                  </p>
                  {periodEnd && (
                    <p className="mt-1 text-muted-foreground">
                      Current period ends {periodEnd}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {canUpgradeToSupporter && (
                  <>
                    <Button onClick={() => void handleUpgrade()} disabled={isUpgrading}>
                      <ButtonPending pending={isUpgrading} pendingLabel="Redirecting...">
                        Upgrade to Supporter — $5/mo
                      </ButtonPending>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleSync()}
                      disabled={isSyncing}
                    >
                      <ButtonPending pending={isSyncing} pendingLabel="Syncing...">
                        Sync from Stripe
                      </ButtonPending>
                    </Button>
                  </>
                )}

                {canManageSubscription && (
                  <Button
                    variant="outline"
                    onClick={() => void handleManageSubscription()}
                    disabled={isOpeningPortal}
                  >
                    <ButtonPending
                      pending={isOpeningPortal}
                      pendingLabel="Opening portal..."
                    >
                      Manage subscription
                    </ButtonPending>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
