"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getPingUrl } from "@/lib/api";

export function CopyPingUrlButton({ uuid }: { uuid: string }) {
  const url = getPingUrl(uuid);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ping URL copied");
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      title={url}
      onClick={handleCopy}
    >
      <Copy className="size-3.5" />
      Copy URL
    </Button>
  );
}
