"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getPingUrl } from "@/lib/api";

export function CopyPingUrlButton({ uuid }: { uuid: string }) {
  const [isCopying, setIsCopying] = useState(false);
  const url = getPingUrl(uuid);

  async function handleCopy() {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ping URL copied");
    } catch {
      toast.error("Failed to copy URL");
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      title={url}
      disabled={isCopying}
      onClick={() => void handleCopy()}
    >
      {isCopying ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Copy className="size-3.5" />
      )}
      Copy URL
    </Button>
  );
}
