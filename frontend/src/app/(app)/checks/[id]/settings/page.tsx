"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pause, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CheckAlertsSheet } from "@/components/CheckAlertsSheet";
import { CheckPageNav } from "@/components/CheckPageNav";
import { IntegrationIcon } from "@/components/landing/IntegrationIcon";
import { CheckStatusSummaryCard } from "@/components/CheckStatusSummaryCard";
import { CheckSettingsSkeleton } from "@/components/skeletons/CheckSettingsSkeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChecks } from "@/contexts/ChecksContext";
import {
  getCheck,
  updateCheckNotifications,
  updateCheckPaused,
} from "@/lib/api";
import type { CheckSettings } from "@/lib/types";
import {
  type NotificationFieldErrors,
  validateNotificationForm,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

function AlertStatusRow({
  name,
  iconName,
  iconBg,
  configured,
}: {
  name: string;
  iconName: "slack" | "discord";
  iconBg: string;
  configured: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded text-white"
          style={{ backgroundColor: iconBg }}
          aria-hidden
        >
          <IntegrationIcon name={iconName} className="size-3" />
        </span>
        {name}
      </div>
      <span
        className={cn(
          "font-medium",
          configured ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {configured ? "Configured" : "Not configured"}
      </span>
    </div>
  );
}

export default function CheckSettingsPage() {
  const params = useParams<{ id: string }>();
  const checkId = params.id;
  const { refreshChecks } = useChecks();

  const [settings, setSettings] = useState<CheckSettings | null>(null);
  const [alertWebhookUrl, setAlertWebhookUrl] = useState("");
  const [alertDiscordWebhookUrl, setAlertDiscordWebhookUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<NotificationFieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setApiError("");
      setNotFound(false);

      try {
        const data = await getCheck(checkId);
        if (cancelled) return;
        setSettings(data);
        setAlertWebhookUrl(data.alertWebhookUrl ?? "");
        setAlertDiscordWebhookUrl(data.alertDiscordWebhookUrl ?? "");
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Request failed";
        if (message === "Check not found") {
          setNotFound(true);
        } else {
          setApiError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [checkId]);

  async function handleAlertSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");

    const result = validateNotificationForm(
      alertWebhookUrl,
      alertDiscordWebhookUrl,
    );
    setFieldErrors(result.errors);
    if (!result.valid || !result.values) return;

    setIsSubmitting(true);
    try {
      const updated = await updateCheckNotifications(checkId, result.values);
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              name: updated.name,
              alertWebhookUrl: updated.alertWebhookUrl,
              alertDiscordWebhookUrl: updated.alertDiscordWebhookUrl,
              alertEmail: updated.alertEmail,
            }
          : prev,
      );
      setAlertWebhookUrl(updated.alertWebhookUrl ?? "");
      setAlertDiscordWebhookUrl(updated.alertDiscordWebhookUrl ?? "");
      toast.success("Alert settings saved");
      setAlertsOpen(false);
      void refreshChecks();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTogglePause() {
    if (!settings) return;

    const nextPaused = !settings.paused;
    setIsTogglingPause(true);
    try {
      const updated = await updateCheckPaused(checkId, nextPaused);
      setSettings((prev) =>
        prev ? { ...prev, paused: updated.paused, status: updated.status } : prev,
      );
      toast.success(nextPaused ? "Check paused" : "Check resumed");
      void refreshChecks();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update check",
      );
    } finally {
      setIsTogglingPause(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8 lg:py-12">
      <CheckPageNav
        checkId={checkId}
        checkName={settings?.name}
        active="settings"
      />

      {isLoading ? (
        <CheckSettingsSkeleton />
      ) : notFound ? (
        <div className="space-y-3">
          <p className="text-destructive">Check not found.</p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Back to checks
          </Link>
        </div>
      ) : settings ? (
        <div className="flex flex-col gap-6">
          <CheckStatusSummaryCard
            status={settings.status}
            paused={settings.paused}
            lastPingedAt={settings.lastPingedAt}
            intervalSeconds={settings.intervalSeconds}
            graceSeconds={settings.graceSeconds}
            uuid={settings.uuid}
            actions={
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isTogglingPause}
                onClick={() => void handleTogglePause()}
              >
                {isTogglingPause ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : settings.paused ? (
                  <Play className="size-4" />
                ) : (
                  <Pause className="size-4" />
                )}
                {isTogglingPause
                  ? "Saving…"
                  : settings.paused
                    ? "Resume check"
                    : "Pause check"}
              </Button>
            }
          />

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle>Down alerts</CardTitle>
                <CardDescription>
                  Notify when this check goes down.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setAlertsOpen(true)}
              >
                Configure alerts
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <AlertStatusRow
                name="Slack"
                iconName="slack"
                iconBg="#4A154B"
                configured={Boolean(settings.alertWebhookUrl)}
              />
              <AlertStatusRow
                name="Discord"
                iconName="discord"
                iconBg="#5865F2"
                configured={Boolean(settings.alertDiscordWebhookUrl)}
              />
            </CardContent>
          </Card>

          <CheckAlertsSheet
            open={alertsOpen}
            onOpenChange={setAlertsOpen}
            alertWebhookUrl={alertWebhookUrl}
            alertDiscordWebhookUrl={alertDiscordWebhookUrl}
            onAlertWebhookUrlChange={setAlertWebhookUrl}
            onAlertDiscordWebhookUrlChange={setAlertDiscordWebhookUrl}
            fieldErrors={fieldErrors}
            apiError={apiError}
            isSubmitting={isSubmitting}
            onSubmit={handleAlertSubmit}
          />
        </div>
      ) : null}
    </div>
  );
}
