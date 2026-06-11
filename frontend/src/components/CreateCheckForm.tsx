"use client";

import { type FormEvent, useState } from "react";

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
import { createCheck } from "@/lib/api";
import {
  type CreateCheckFieldErrors,
  validateCreateCheckForm,
} from "@/lib/validation";

type CreateCheckFormProps = {
  onCreated: () => void;
};

const DEFAULT_INTERVAL = "300";
const DEFAULT_GRACE = "60";

export function CreateCheckForm({ onCreated }: CreateCheckFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULT_INTERVAL);
  const [graceSeconds, setGraceSeconds] = useState(DEFAULT_GRACE);
  const [fieldErrors, setFieldErrors] = useState<CreateCheckFieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setIntervalSeconds(DEFAULT_INTERVAL);
    setGraceSeconds(DEFAULT_GRACE);
    setFieldErrors({});
    setApiError("");
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
      await createCheck(result.values);
      setOpen(false);
      resetForm();
      onCreated();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>Create Check</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create check</DialogTitle>
            <DialogDescription>
              Add a heartbeat monitor for a cron job or background task.
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

            {apiError && (
              <p className="text-sm text-destructive">{apiError}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create check"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
