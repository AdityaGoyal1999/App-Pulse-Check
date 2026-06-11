"use client";

import { useRef, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

import { CheckList, type CheckListRef } from "@/components/CheckList";
import { CreateCheckForm } from "@/components/CreateCheckForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const checkListRef = useRef<CheckListRef>(null);

  function bumpRefreshKey() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-full flex-col bg-background">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-4" strokeWidth={2.25} />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              App Pulse Check
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
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
        </main>
      </div>
    </ProtectedRoute>
  );
}
