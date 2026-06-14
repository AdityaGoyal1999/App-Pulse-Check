"use client";

import Link from "next/link";
import { ArrowLeft, History, Settings } from "lucide-react";

import { AppPageHeader } from "@/components/AppPageHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CheckPageNavProps = {
  checkId: string;
  checkName?: string | null;
  active: "settings" | "history";
};

const navItems = [
  {
    key: "settings" as const,
    label: "Settings",
    icon: Settings,
    suffix: "settings",
  },
  {
    key: "history" as const,
    label: "History",
    icon: History,
    suffix: "history",
  },
];

export function CheckPageNav({ checkId, checkName, active }: CheckPageNavProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "h-auto w-fit gap-1.5 px-0 text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-3.5" />
        Back to checks
      </Link>

      <AppPageHeader
        title={checkName ?? "Check"}
        description={
          active === "settings"
            ? "Monitoring, alerts, and pause controls"
            : "Recent ping activity for this check"
        }
        footer={
          <nav
            aria-label="Check sections"
            className="inline-flex rounded-lg bg-background/80 p-1 shadow-sm ring-1 ring-border/60"
          >
            {navItems.map(({ key, label, icon: Icon, suffix }) => {
              const isActive = active === key;
              return (
                <Link
                  key={key}
                  href={`/checks/${checkId}/${suffix}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        }
      />
    </div>
  );
}
