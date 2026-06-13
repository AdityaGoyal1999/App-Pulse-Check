"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

import { CheckList, type CheckListRef } from "@/components/CheckList";
import { CreateCheckForm } from "@/components/CreateCheckForm";
import { Button } from "@/components/ui/button";
import { useChecks } from "@/contexts/ChecksContext";
import { getCurrentUser } from "@/lib/api";
import type { UserMe } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { refreshChecks } = useChecks();
  const [refreshKey, setRefreshKey] = useState(0);
  const [userMe, setUserMe] = useState<UserMe | null>(null);
  const checkListRef = useRef<CheckListRef>(null);

  const refreshUsage = useCallback(async () => {
    try {
      const profile = await getCurrentUser();
      setUserMe(profile);
    } catch {
      setUserMe(null);
    }
  }, []);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  function bumpRefreshKey() {
    setRefreshKey((k) => k + 1);
    void refreshChecks();
    void refreshUsage();
  }

  const atLimit =
    userMe !== null && userMe.checkCount >= userMe.limits.maxChecks;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Your checks
          </h1>
          <p className="mt-2 text-muted-foreground">
            Monitor cron jobs and background tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => checkListRef.current?.refresh()}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <CreateCheckForm onCreated={bumpRefreshKey} atLimit={atLimit} />
        </div>
      </div>

      {userMe && (
        <p
          className={cn(
            "text-sm",
            atLimit ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {userMe.checkCount} / {userMe.limits.maxChecks} checks
          {atLimit ? " — limit reached" : ""}
        </p>
      )}

      <CheckList
        ref={checkListRef}
        refreshKey={refreshKey}
        onDeleted={bumpRefreshKey}
      />
    </div>
  );
}
