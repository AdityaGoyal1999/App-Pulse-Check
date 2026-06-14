"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MoreVertical, History, Pause, Play, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CopyPingUrlButton } from "@/components/CopyPingUrlButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { useChecks } from "@/contexts/ChecksContext";
import { deleteCheck, updateCheckPaused } from "@/lib/api";
import type { Check } from "@/lib/types";

type CheckRowProps = {
  check: Check;
  onDeleted: () => void;
  onUpdated: () => void;
};

function useCheckRowState({ check, onDeleted, onUpdated }: CheckRowProps) {
  const { refreshChecks } = useChecks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const isBusy = isDeleting || isTogglingPause;

  async function handleDelete() {
    if (!window.confirm("Delete this check?")) return;

    setIsDeleting(true);
    try {
      await deleteCheck(check.id);
      void refreshChecks();
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete check");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleTogglePause() {
    const nextPaused = !check.paused;
    setIsTogglingPause(true);
    try {
      await updateCheckPaused(check.id, nextPaused);
      toast.success(nextPaused ? "Check paused" : "Check resumed");
      void refreshChecks();
      onUpdated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update check",
      );
    } finally {
      setIsTogglingPause(false);
    }
  }

  const lastPinged = check.lastPingedAt
    ? formatDistanceToNow(new Date(check.lastPingedAt), { addSuffix: true })
    : "Never";

  return {
    check,
    isBusy,
    isDeleting,
    isTogglingPause,
    lastPinged,
    handleDelete,
    handleTogglePause,
  };
}

function CheckRowActions({
  check,
  isBusy,
  isDeleting,
  isTogglingPause,
  handleDelete,
  handleTogglePause,
  showQuickLinks = true,
}: ReturnType<typeof useCheckRowState> & { showQuickLinks?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {showQuickLinks ? (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/checks/${check.id}/settings`} />}
            aria-label={`Settings for ${check.name}`}
          >
            <Settings className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/checks/${check.id}/history`} />}
            aria-label={`History for ${check.name}`}
          >
            <History className="size-4" />
          </Button>
        </>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isBusy}
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Options for ${check.name}`}
            />
          }
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner align="end">
            <DropdownMenuContent>
              <DropdownMenuLinkItem
                closeOnClick
                render={<Link href={`/checks/${check.id}/settings`} />}
              >
                <Settings />
                Settings
              </DropdownMenuLinkItem>
              <DropdownMenuLinkItem
                closeOnClick
                render={<Link href={`/checks/${check.id}/history`} />}
              >
                <History />
                History
              </DropdownMenuLinkItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isBusy}
                onClick={() => void handleTogglePause()}
              >
                {check.paused ? <Play /> : <Pause />}
                {isTogglingPause
                  ? "Saving…"
                  : check.paused
                    ? "Resume"
                    : "Pause"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isBusy}
                className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                onClick={() => void handleDelete()}
              >
                <Trash2 />
                {isDeleting ? "Deleting…" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}

export function CheckRow(props: CheckRowProps) {
  const state = useCheckRowState(props);
  const { check, lastPinged } = state;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link
          href={`/checks/${check.id}/settings`}
          className="hover:text-primary hover:underline"
        >
          {check.name}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{lastPinged}</TableCell>
      <TableCell>
        <StatusBadge status={check.status} paused={check.paused} />
      </TableCell>
      <TableCell>
        <CopyPingUrlButton uuid={check.uuid} />
      </TableCell>
      <TableCell className="w-28 text-right">
        <CheckRowActions {...state} />
      </TableCell>
    </TableRow>
  );
}

export function CheckCard(props: CheckRowProps) {
  const state = useCheckRowState(props);
  const { check, lastPinged } = state;

  return (
    <div className="border-b border-border p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/checks/${check.id}/settings`}
            className="block truncate font-medium hover:text-primary hover:underline"
          >
            {check.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{lastPinged}</p>
        </div>
        <StatusBadge status={check.status} paused={check.paused} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <CopyPingUrlButton uuid={check.uuid} />
        <CheckRowActions {...state} showQuickLinks={false} />
      </div>
    </div>
  );
}
