"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CopyPingUrlButton } from "@/components/CopyPingUrlButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { deleteCheck } from "@/lib/api";
import type { Check } from "@/lib/types";

type CheckRowProps = {
  check: Check;
  onDeleted: () => void;
};

export function CheckRow({ check, onDeleted }: CheckRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const lastPinged = check.lastPingedAt
    ? formatDistanceToNow(new Date(check.lastPingedAt), { addSuffix: true })
    : "Never";

  return (
    <TableRow>
      <TableCell className="font-medium">{check.name}</TableCell>
      <TableCell className="text-muted-foreground">{lastPinged}</TableCell>
      <TableCell>
        <StatusBadge status={check.status} />
      </TableCell>
      <TableCell>
        <CopyPingUrlButton uuid={check.uuid} />
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/checks/${check.id}/settings`} />}
        >
          <Bell className="size-3.5" />
          Alerts
        </Button>
      </TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
          {isDeleting ? "Deleting…" : "Delete"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
