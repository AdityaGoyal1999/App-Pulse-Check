"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Bell, MoreVertical, Pause, Play, Trash2 } from "lucide-react";
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
import { deleteCheck, updateCheckPaused } from "@/lib/api";
import type { Check } from "@/lib/types";

type CheckRowProps = {
  check: Check;
  onDeleted: () => void;
  onUpdated: () => void;
};

export function CheckRow({ check, onDeleted, onUpdated }: CheckRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const isBusy = isDeleting || isTogglingPause;

  async function handleDelete() {
    if (!window.confirm("Delete this check?")) return;

    setIsDeleting(true);
    try {
      await deleteCheck(check.id);
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
    <TableRow>
      <TableCell className="font-medium">{check.name}</TableCell>
      <TableCell className="text-muted-foreground">{lastPinged}</TableCell>
      <TableCell>
        <StatusBadge status={check.status} paused={check.paused} />
      </TableCell>
      <TableCell>
        <CopyPingUrlButton uuid={check.uuid} />
      </TableCell>
      <TableCell className="w-12 text-right">
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
                  <Bell />
                  Alert settings
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
      </TableCell>
    </TableRow>
  );
}
