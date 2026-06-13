"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useChecks } from "@/contexts/ChecksContext";
import { cn } from "@/lib/utils";

function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { checks, isLoading } = useChecks();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isDashboard = pathname === "/dashboard";
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
            {isLoading ? (
              <p className="px-2 text-sm text-muted-foreground">Loading…</p>
            ) : checks.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">
                No checks yet
              </p>
            ) : (
              <SidebarMenu>
                {checks.map((check) => {
                  const isCheckActive = activeCheckId === check.id;

                  return (
                    <SidebarMenuItem key={check.id}>
                      <div
                        className={cn(
                          "truncate px-2 py-1.5 text-xs font-semibold tracking-wide uppercase",
                          isCheckActive
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/60",
                        )}
                        title={check.name}
                      >
                        {check.name}
                      </div>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={
                              isCheckActive && activeCheckSection === "settings"
                            }
                            render={
                              <Link
                                href={`/checks/${check.id}/settings`}
                                onClick={closeMobile}
                              />
                            }
                          >
                            <Settings />
                            <span>Settings</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={
                              isCheckActive && activeCheckSection === "history"
                            }
                            render={
                              <Link
                                href={`/checks/${check.id}/history`}
                                onClick={closeMobile}
                              />
                            }
                          >
                            <History />
                            <span>History</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="rounded-lg border border-sidebar-border bg-background px-3 py-3">
          {user?.email && (
            <p className="truncate text-sm text-foreground" title={user.email}>
              {user.email}
            </p>
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
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
