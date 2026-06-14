"use client";

import {
  forwardRef,
  type FormEvent,
  useImperativeHandle,
  useState,
} from "react";
import Link from "next/link";
import { toast } from "sonner";

import { ButtonPending } from "@/components/ButtonPending";
import { SetupChecklistContent } from "@/components/SetupChecklistContent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheck, ApiError } from "@/lib/api";
import type { Check } from "@/lib/types";
import {
  type CreateCheckFieldErrors,
  validateCreateCheckForm,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

type CreateCheckFormProps = {
  onCreated: (check: Check) => void;
  atLimit?: boolean;
};

export type CreateCheckFormRef = {
  open: () => void;
};

const DEFAULT_INTERVAL = "300";
const DEFAULT_GRACE = "60";

export const CreateCheckForm = forwardRef<
  CreateCheckFormRef,
  CreateCheckFormProps
>(function CreateCheckForm({ onCreated, atLimit = false }, ref) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"create" | "setup">("create");
  const [createdCheck, setCreatedCheck] = useState<Check | null>(null);
  const [name, setName] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULT_INTERVAL);
  const [graceSeconds, setGraceSeconds] = useState(DEFAULT_GRACE);
  const [fieldErrors, setFieldErrors] = useState<CreateCheckFieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  function resetForm() {
    setName("");
    setIntervalSeconds(DEFAULT_INTERVAL);
    setGraceSeconds(DEFAULT_GRACE);
    setFieldErrors({});
    setApiError("");
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
      setStep("create");
      setCreatedCheck(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError("");

    const result = validateCreateCheckForm(
      name,
      intervalSeconds,
      graceSeconds,
    );
    setFieldErrors(result.errors);
    if (!result.valid || !result.values) return;

    setIsSubmitting(true);
    try {
      const check = await createCheck(result.values);
      resetForm();
      setCreatedCheck(check);
      setStep("setup");
      toast.success(`"${check.name}" created`);
      onCreated(check);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        const limit = err.body.limit;
        setApiError(
          typeof limit === "number"
            ? `Check limit reached (${limit} checks on your plan).`
            : err.message,
        );
      } else {
        setApiError(err instanceof Error ? err.message : "Request failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button disabled={atLimit} className="w-full sm:w-auto" />}
      >
        Create Check
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,800px)] overflow-y-auto",
          step === "create" ? "sm:max-w-md" : "sm:max-w-2xl",
        )}
      >
        {step === "create" ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create check</DialogTitle>
              <DialogDescription>
                {atLimit
                  ? "You've reached your plan limit. Delete a check to create a new one."
                  : "Add a heartbeat monitor for a cron job or background task."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="check-name">Name</Label>
                <Input
                  id="check-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nightly backup"
                  disabled={isSubmitting}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="check-interval">Interval (seconds)</Label>
                <Input
                  id="check-interval"
                  type="number"
                  min={60}
                  max={86400}
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(e.target.value)}
                  disabled={isSubmitting}
                />
                {fieldErrors.intervalSeconds && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.intervalSeconds}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="check-grace">Grace period (seconds)</Label>
                <Input
                  id="check-grace"
                  type="number"
                  min={0}
                  max={3600}
                  value={graceSeconds}
                  onChange={(e) => setGraceSeconds(e.target.value)}
                  disabled={isSubmitting}
                />
                {fieldErrors.graceSeconds && (
                  <p className="text-sm text-destructive">
                    {fieldErrors.graceSeconds}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Not sure what to pick? See{" "}
                <Link
                  href="/docs#interval-grace"
                  className="font-medium text-primary hover:underline"
                >
                  interval &amp; grace presets
                </Link>{" "}
                in the docs.
              </p>

              {apiError && (
                <p className="text-sm text-destructive">{apiError}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                <ButtonPending pending={isSubmitting} pendingLabel="Creating…">
                  Create check
                </ButtonPending>
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Get started</DialogTitle>
              <DialogDescription>
                Follow these steps to finish setting up &quot;
                {createdCheck?.name}&quot;.
              </DialogDescription>
            </DialogHeader>
            {createdCheck ? (
              <SetupChecklistContent
                check={createdCheck}
                onNavigateAway={() => handleOpenChange(false)}
              />
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});
