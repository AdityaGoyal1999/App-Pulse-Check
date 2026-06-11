"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getCheckNotifications, updateCheckNotifications } from "@/lib/api";
import {
  type NotificationFieldErrors,
  validateNotificationForm,
} from "@/lib/validation";

export default function CheckSettingsPage() {
  const params = useParams<{ id: string }>();
  const checkId = params.id;
  const { user, logout } = useAuth();

  const [checkName, setCheckName] = useState("");
  const [alertWebhookUrl, setAlertWebhookUrl] = useState("");
  // const [alertEmail, setAlertEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<NotificationFieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setApiError("");
      setNotFound(false);

      try {
        const data = await getCheckNotifications(checkId);
        if (cancelled) return;
        setCheckName(data.name);
        setAlertWebhookUrl(data.alertWebhookUrl ?? "");
        // setAlertEmail(data.alertEmail ?? "");
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");

    const result = validateNotificationForm(alertWebhookUrl);
    setFieldErrors(result.errors);
    if (!result.valid || !result.values) return;

    setIsSubmitting(true);
    try {
      const updated = await updateCheckNotifications(checkId, result.values);
      setCheckName(updated.name);
      setAlertWebhookUrl(updated.alertWebhookUrl ?? "");
      // setAlertEmail(updated.alertEmail ?? "");
      toast.success("Alert settings saved");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-full flex-col bg-background">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-4" strokeWidth={2.25} />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              App Pulse Check
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2"
              render={<Link href="/dashboard" />}
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Alert settings
            </h1>
            {checkName && (
              <p className="mt-2 text-muted-foreground">
                Configure notifications for{" "}
                <span className="font-medium text-foreground">{checkName}</span>
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading settings…
            </div>
          ) : notFound ? (
            <p className="text-destructive">Check not found.</p>
          ) : (
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle>Down alerts</CardTitle>
                <CardDescription>
                  Get notified when this check goes DOWN. Configure a Slack
                  incoming webhook.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
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

                  {/* Email alerts disabled until verified domain (next ship):
                  <div className="grid gap-2">
                    <Label htmlFor="alert-email">Alert email</Label>
                    <Input
                      id="alert-email"
                      type="email"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                    />
                    <p className="text-sm text-muted-foreground">
                      Uses Resend. In dev with onboarding@resend.dev, only your
                      verified Resend account email will receive messages.
                    </p>
                    {fieldErrors.alertEmail && (
                      <p className="text-sm text-destructive">
                        {fieldErrors.alertEmail}
                      </p>
                    )}
                  </div>
                  */}

                  {fieldErrors.form && (
                    <p className="text-sm text-destructive">{fieldErrors.form}</p>
                  )}
                  {apiError && (
                    <p className="text-sm text-destructive">{apiError}</p>
                  )}

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
