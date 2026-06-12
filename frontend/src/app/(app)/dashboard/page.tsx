"use client";

import { useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

import { CheckList, type CheckListRef } from "@/components/CheckList";
import { CreateCheckForm } from "@/components/CreateCheckForm";
import { Button } from "@/components/ui/button";
import { useChecks } from "@/contexts/ChecksContext";

export default function DashboardPage() {
  const { refreshChecks } = useChecks();
  const [refreshKey, setRefreshKey] = useState(0);
  const checkListRef = useRef<CheckListRef>(null);

  function bumpRefreshKey() {
    setRefreshKey((k) => k + 1);
    void refreshChecks();
  }

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
          <CreateCheckForm onCreated={bumpRefreshKey} />
        </div>
      </div>
      <CheckList
        ref={checkListRef}
        refreshKey={refreshKey}
        onDeleted={bumpRefreshKey}
      />
    </div>
  );
}
