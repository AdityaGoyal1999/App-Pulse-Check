"use client";

import { type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { ButtonPending } from "@/components/ButtonPending";
import { IntegrationIcon } from "@/components/landing/IntegrationIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NotificationFieldErrors } from "@/lib/validation";

type CheckAlertsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertWebhookUrl: string;
  alertDiscordWebhookUrl: string;
  onAlertWebhookUrlChange: (value: string) => void;
  onAlertDiscordWebhookUrlChange: (value: string) => void;
  fieldErrors: NotificationFieldErrors;
  apiError: string;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
};

function LabelHelp({ children }: { children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Help"
          />
        }
      >
        <HelpCircle className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export function CheckAlertsSheet({
  open,
  onOpenChange,
  alertWebhookUrl,
  alertDiscordWebhookUrl,
  onAlertWebhookUrlChange,
  onAlertDiscordWebhookUrlChange,
  fieldErrors,
  apiError,
  isSubmitting,
  onSubmit,
}: CheckAlertsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Down alerts</SheetTitle>
          <SheetDescription>
            Get notified when this check goes DOWN.{" "}
            <Link
              href="/docs#alerts"
              className="font-medium text-primary hover:underline"
            >
              View setup guide
            </Link>
          </SheetDescription>
        </SheetHeader>

        <form
          id="check-alerts-form"
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="alert-webhook" className="flex items-center gap-2">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded text-white"
                style={{ backgroundColor: "#4A154B" }}
                aria-hidden
              >
                <IntegrationIcon name="slack" className="size-3" />
              </span>
              Slack webhook URL
              <LabelHelp>
                Create in Slack: Apps → Incoming Webhooks → Add to workspace.
                See setup guide for details.
              </LabelHelp>
            </Label>
            <Input
              id="alert-webhook"
              type="url"
              value={alertWebhookUrl}
              onChange={(e) => onAlertWebhookUrlChange(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              disabled={isSubmitting}
            />
            {fieldErrors.alertWebhookUrl && (
              <p className="text-sm text-destructive">
                {fieldErrors.alertWebhookUrl}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="alert-discord-webhook"
              className="flex items-center gap-2"
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded text-white"
                style={{ backgroundColor: "#5865F2" }}
                aria-hidden
              >
                <IntegrationIcon name="discord" className="size-3" />
              </span>
              Discord webhook URL
              <LabelHelp>
                In Discord: Server Settings → Integrations → Webhooks → New
                Webhook.
              </LabelHelp>
            </Label>
            <Input
              id="alert-discord-webhook"
              type="url"
              value={alertDiscordWebhookUrl}
              onChange={(e) => onAlertDiscordWebhookUrlChange(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              disabled={isSubmitting}
            />
            {fieldErrors.alertDiscordWebhookUrl && (
              <p className="text-sm text-destructive">
                {fieldErrors.alertDiscordWebhookUrl}
              </p>
            )}
          </div>

          {fieldErrors.form && (
            <p className="text-sm text-destructive">{fieldErrors.form}</p>
          )}
          {apiError && (
            <p className="text-sm text-destructive">{apiError}</p>
          )}
        </form>

        <SheetFooter>
          <Button type="submit" form="check-alerts-form" disabled={isSubmitting}>
            <ButtonPending pending={isSubmitting} pendingLabel="Saving…">
              Save alert settings
            </ButtonPending>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
