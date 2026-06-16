"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  label: string;
};

const SCROLL_OFFSET = 100;

const ActiveSectionContext = createContext("");

function useActiveSection(items: readonly TocItem[]) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sectionIds = items.map((item) => item.id);

    const updateActiveSection = () => {
      let current = sectionIds[0] ?? "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= SCROLL_OFFSET) {
          current = id;
        }
      }
      setActiveId(current);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [items]);

  return activeId;
}

export function DocsTocRoot({
  items,
  children,
}: {
  items: readonly TocItem[];
  children: React.ReactNode;
}) {
  const activeId = useActiveSection(items);

  return (
    <ActiveSectionContext.Provider value={activeId}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

function TocLink({
  item,
  isActive,
  className,
}: {
  item: TocItem;
  isActive: boolean;
  className?: string;
}) {
  return (
    <a
      href={`#${item.id}`}
      aria-current={isActive ? "location" : undefined}
      className={className}
    >
      {item.label}
    </a>
  );
}

export function DocsTocNav({
  items,
  variant,
}: {
  items: readonly TocItem[];
  variant: "horizontal" | "sidebar";
}) {
  const activeId = useContext(ActiveSectionContext);

  if (variant === "horizontal") {
    return (
      <nav
        aria-label="On this page"
        className="border-b border-border lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <TocLink
                key={item.id}
                item={item}
                isActive={isActive}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              />
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <nav className="sticky top-24 space-y-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          On this page
        </p>
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <TocLink
              key={item.id}
              item={item}
              isActive={isActive}
              className={cn(
                "block rounded-md border-l-2 py-1.5 pl-2 pr-2 text-sm transition-colors",
                isActive
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
              )}
            />
          );
        })}
      </nav>
    </aside>
  );
}
