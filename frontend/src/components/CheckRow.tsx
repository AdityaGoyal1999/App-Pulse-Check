"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MoreVertical, History, Pause, Play, Settings, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CopyPingUrlButton } from "@/components/CopyPingUrlButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChecks } from "@/contexts/ChecksContext";
import { deleteCheck, updateCheckPaused } from "@/lib/api";
import { CHECK_TABLE_COLUMNS } from "@/lib/check-table";
import { getCheckRowClassName } from "@/lib/check-status";
import type { Check } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckRowProps = {
  check: Check;
  index?: number;
  onDeleted: () => void;
  onUpdated: () => void;
};

export function CheckRow({ check, index = 0, onDeleted, onUpdated }: CheckRowProps) {
  const { refreshChecks } = useChecks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isBusy = isDeleting || isTogglingPause;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteCheck(check.id);
      toast.success(`"${check.name}" deleted`);
      setDeleteOpen(false);
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

  return (
    <TableRow
      className={cn(
        "row-fade-in",
        getCheckRowClassName({
          status: check.status,
          paused: check.paused,
        }),
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
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
      <TableCell className={CHECK_TABLE_COLUMNS.actions}>
        <div className="flex items-center justify-end gap-0.5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/checks/${check.id}/settings`} />}
                  aria-label={`Settings for ${check.name}`}
                >
                  <Settings className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/checks/${check.id}/history`} />}
                  aria-label={`History for ${check.name}`}
                >
                  <History className="size-4" />
                </Button>
              }
            />
            <TooltipContent>History</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
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
                          {isTogglingPause ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : check.paused ? (
                            <Play />
                          ) : (
                            <Pause />
                          )}
                          {isTogglingPause
                            ? "Saving…"
                            : check.paused
                              ? "Resume"
                              : "Pause"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={isBusy}
                          className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                          onClick={() => setDeleteOpen(true)}
                        >
                          {isDeleting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                          {isDeleting ? "Deleting…" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenuPositioner>
                  </DropdownMenuPortal>
                </DropdownMenu>
              }
            />
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>Delete check?</DialogTitle>
            <DialogDescription>
              &quot;{check.name}&quot; will be permanently removed along with
              its ping history and alert settings. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete check"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}
