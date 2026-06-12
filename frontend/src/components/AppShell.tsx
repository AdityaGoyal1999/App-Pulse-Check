"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useChecks } from "@/contexts/ChecksContext";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  active,
  icon: Icon,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{children}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { checks, isLoading } = useChecks();

  const isDashboard = pathname === "/dashboard";
  const activeCheckId = pathname.match(/^\/checks\/([^/]+)\/settings$/)?.[1];

  return (
    <>
      <div className="flex items-center gap-2.5 px-3 py-1">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-4" strokeWidth={2.25} />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">
          App Pulse Check
        </span>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        <NavLink
          href="/dashboard"
          active={isDashboard}
          icon={LayoutDashboard}
          onNavigate={onNavigate}
        >
          Checks
        </NavLink>

        <NavLink
          href="/docs"
          active={pathname.startsWith("/docs")}
          icon={BookOpen}
          onNavigate={onNavigate}
        >
          Docs
        </NavLink>

        <div className="mt-6 mb-2 px-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your checks
          </p>
        </div>

        {isLoading ? (
          <p className="px-3 text-sm text-muted-foreground">Loading…</p>
        ) : checks.length === 0 ? (
          <p className="px-3 text-sm text-muted-foreground">No checks yet</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {checks.map((check) => (
              <Link
                key={check.id}
                href={`/checks/${check.id}/settings`}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  activeCheckId === check.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Settings className="size-3.5 shrink-0 opacity-70" />
                <span className="truncate font-medium">{check.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto px-2 pb-2">
        <Separator className="mb-3" />
        <div className="rounded-lg border border-sidebar-border bg-background px-3 py-3">
          {user?.email && (
            <p className="truncate text-sm text-foreground" title={user.email}>
              {user.email}
            </p>
          )}
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
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-full flex-col gap-2 p-4">
          <SidebarContent />
        </div>
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar p-4 md:hidden">
            <div className="mb-4 flex justify-end">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="size-3.5" strokeWidth={2.25} />
            </div>
            <span className="text-sm font-semibold">App Pulse Check</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
