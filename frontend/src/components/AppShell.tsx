"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

import { CheckSidebarSection } from "@/components/CheckSidebarSection";
import { UserPlanBadge } from "@/components/PlanBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useChecks } from "@/contexts/ChecksContext";

function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { refreshKey } = useChecks();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isDashboard = pathname === "/dashboard";
  const isBilling = pathname === "/settings/billing";
  const checkRouteMatch = pathname.match(
    /^\/checks\/([^/]+)\/(settings|history)$/,
  );
  const activeCheckId = checkRouteMatch?.[1];
  const activeCheckSection = checkRouteMatch?.[2] as
    | "settings"
    | "history"
    | undefined;

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
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isDashboard}
                  render={
                    <Link href="/dashboard" onClick={closeMobile} />
                  }
                >
                  <LayoutDashboard />
                  <span>Checks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isBilling}
                  render={
                    <Link href="/settings/billing" onClick={closeMobile} />
                  }
                >
                  <CreditCard />
                  <span>Billing</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/docs")}
                  render={<Link href="/docs" onClick={closeMobile} />}
                >
                  <BookOpen />
                  <span>Docs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your checks</SidebarGroupLabel>
          <SidebarGroupContent>
            <CheckSidebarSection
              refreshKey={refreshKey}
              activeCheckId={activeCheckId}
              activeCheckSection={activeCheckSection}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="rounded-lg border border-sidebar-border bg-background px-3 py-3">
          {user?.email && (
            <div>
              <p className="truncate text-sm text-foreground" title={user.email}>
                {user.email}
              </p>
              <UserPlanBadge />
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => void logout()}
          >
            <LogOut className="size-3.5" />
            Log out
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Activity className="size-3.5" strokeWidth={2.25} />
              </div>
              <span className="text-sm font-semibold">App Pulse Check</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <UserPlanBadge className="mt-0" />
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
