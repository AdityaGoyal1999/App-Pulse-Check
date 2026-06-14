"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

import { ButtonPending } from "@/components/ButtonPending";

import { CheckList, type CheckListRef } from "@/components/CheckList";
import { CheckSearchInput } from "@/components/CheckSearchInput";
import {
  CreateCheckForm,
  type CreateCheckFormRef,
} from "@/components/CreateCheckForm";
import { DashboardStats } from "@/components/DashboardStats";
import { DashboardStatsSkeleton } from "@/components/skeletons/DashboardStatsSkeleton";
import { AppPageHeader } from "@/components/AppPageHeader";
import { Button } from "@/components/ui/button";
import { useChecks } from "@/contexts/ChecksContext";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getChecks, getCurrentUser } from "@/lib/api";
import type { Check, UserMe } from "@/lib/types";

export default function DashboardPage() {
  const { refreshChecks, refreshKey } = useChecks();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [userMe, setUserMe] = useState<UserMe | null | undefined>(undefined);
  const [allChecks, setAllChecks] = useState<Check[]>([]);
  const [isRefreshingChecks, setIsRefreshingChecks] = useState(false);
  const checkListRef = useRef<CheckListRef>(null);
  const createCheckFormRef = useRef<CreateCheckFormRef>(null);

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

  useEffect(() => {
    let cancelled = false;

    async function fetchAllChecks() {
      try {
        const res = await getChecks();
        if (!cancelled) setAllChecks(res.checks);
      } catch {
        if (!cancelled) setAllChecks([]);
      }
    }

    void fetchAllChecks();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleChecksChange = useCallback(
    (checks: Check[]) => {
      if (!debouncedSearch.trim()) {
        setAllChecks(checks);
      }
    },
    [debouncedSearch],
  );

  function bumpRefreshKey() {
    refreshChecks();
    void refreshUsage();
  }

  const atLimit =
    userMe != null && userMe.checkCount >= userMe.limits.maxChecks;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:py-12">
      <AppPageHeader
        title="Your checks"
        description="Monitor cron jobs and background tasks."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isRefreshingChecks}
              onClick={() => checkListRef.current?.refresh()}
            >
              <ButtonPending pending={isRefreshingChecks} pendingLabel="Refreshing…">
                <>
                  <RefreshCw className="size-4" />
                  Refresh
                </>
              </ButtonPending>
            </Button>
            <CreateCheckForm
              ref={createCheckFormRef}
              onCreated={bumpRefreshKey}
              atLimit={atLimit}
            />
          </>
        }
      />

      {userMe === undefined ? (
        <DashboardStatsSkeleton />
      ) : userMe ? (
        <DashboardStats userMe={userMe} checks={allChecks} />
      ) : null}

      <CheckSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        className="max-w-sm"
      />

      <CheckList
        ref={checkListRef}
        refreshKey={refreshKey}
        searchQuery={debouncedSearch}
        onDeleted={bumpRefreshKey}
        onChecksChange={handleChecksChange}
        onCreateClick={() => createCheckFormRef.current?.open()}
        createDisabled={atLimit}
        onRefreshingChange={setIsRefreshingChecks}
      />
    </div>
  );
}
