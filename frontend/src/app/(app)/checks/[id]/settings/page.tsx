"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { toast } from "sonner";

import { CheckPageNav } from "@/components/CheckPageNav";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function CheckSettingsPage() {
  const params = useParams<{ id: string }>();
  const checkId = params.id;
  const { refreshChecks } = useChecks();

  const [settings, setSettings] = useState<CheckSettings | null>(null);
  const [alertWebhookUrl, setAlertWebhookUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<NotificationFieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [notFound, setNotFound] = useState(false);

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

    const result = validateNotificationForm(alertWebhookUrl);
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
              alertEmail: updated.alertEmail,
            }
          : prev,
      );
      setAlertWebhookUrl(updated.alertWebhookUrl ?? "");
      toast.success("Alert settings saved");
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
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
            name={settings.name}
            status={settings.status}
            paused={settings.paused}
            lastPingedAt={settings.lastPingedAt}
            intervalSeconds={settings.intervalSeconds}
            graceSeconds={settings.graceSeconds}
            uuid={settings.uuid}
          />

          <Card>
            <CardHeader>
              <CardTitle>Monitoring</CardTitle>
              <CardDescription>
                Paused checks are skipped by the evaluation worker and will not
                trigger down alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {settings.paused ? "Check is paused" : "Check is active"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {settings.paused
                      ? "Resume to start evaluating this check again."
                      : "Pause to temporarily stop monitoring."}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isTogglingPause}
                  onClick={() => void handleTogglePause()}
                >
                  {settings.paused ? (
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Down alerts</CardTitle>
              <CardDescription>
                Get notified when this check goes DOWN. Configure a Slack
                incoming webhook.{" "}
                <Link
                  href="/docs#alerts"
                  className="font-medium text-primary hover:underline"
                >
                  View setup guide
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAlertSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="alert-webhook">Slack webhook URL</Label>
                  <Input
                    id="alert-webhook"
                    type="url"
                    value={alertWebhookUrl}
                    onChange={(e) => setAlertWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-muted-foreground">
                    Create one in Slack: Apps → Incoming Webhooks → Add to
                    workspace.
                  </p>
                  {fieldErrors.alertWebhookUrl && (
                    <p className="text-sm text-destructive">
                      {fieldErrors.alertWebhookUrl}
                    </p>
                  )}
                </div>

                {fieldErrors.form && (
                  <p className="text-sm text-destructive">{fieldErrors.form}</p>
                )}
                {apiError && (
                  <p className="text-sm text-destructive">{apiError}</p>
                )}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save alert settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
