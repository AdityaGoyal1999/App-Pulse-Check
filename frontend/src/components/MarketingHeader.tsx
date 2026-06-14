"use client";

import Link from "next/link";
import { Activity, BookOpen, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MarketingHeaderProps = {
  sticky?: boolean;
  activeNav?: "pricing" | "docs";
};

const navLinks = [
  { href: "/pricing", label: "Pricing", key: "pricing" as const },
  { href: "/docs", label: "Docs", key: "docs" as const, icon: BookOpen },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up", primary: true },
];

export function MarketingHeader({
  sticky = false,
  activeNav,
}: MarketingHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-border",
        sticky &&
          "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" strokeWidth={2.25} />
          </div>
          <span className="truncate text-base font-semibold tracking-tight text-foreground">
            App Pulse Check
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({
                  variant: link.primary ? "default" : "ghost",
                  size: "sm",
                }),
                link.key && activeNav === link.key && "text-foreground",
              )}
            >
              {link.icon ? <link.icon className="size-4" /> : null}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      buttonVariants({
                        variant: link.primary ? "default" : "ghost",
                        size: "sm",
                      }),
                      "justify-start",
                      link.key && activeNav === link.key && "bg-muted",
                    )}
                  >
                    {link.icon ? <link.icon className="size-4" /> : null}
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
