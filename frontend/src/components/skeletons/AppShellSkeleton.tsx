import { Activity } from "lucide-react";

import { CheckListSkeleton } from "@/components/skeletons/CheckListSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";

function AppSidebarSkeleton() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" strokeWidth={2.25} />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            App Pulse Check
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex flex-col gap-1 px-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <SidebarMenuSkeleton key={index} showIcon />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your checks</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-col gap-2 px-1">
              <Skeleton className="h-8 w-full" />
              <div className="flex flex-col gap-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SidebarMenuSkeleton key={index} />
                ))}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border border-sidebar-border bg-background px-3 py-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-5 w-16 rounded-full" />
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-9 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-8 w-full" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function AppShellSkeleton() {
  return (
    <SidebarProvider>
      <AppSidebarSkeleton />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
          <Skeleton className="size-9 rounded-md" />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="size-3.5" strokeWidth={2.25} />
            </div>
            <span className="text-sm font-semibold">App Pulse Check</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </header>

        <div
          className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:py-12"
          aria-busy="true"
          aria-label="Loading app"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full max-w-sm" />
          <CheckListSkeleton />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
