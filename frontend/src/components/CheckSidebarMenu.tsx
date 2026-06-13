"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History, Settings } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Check } from "@/lib/types";
import { cn } from "@/lib/utils";

type CheckSidebarMenuProps = {
  checks: Check[];
  activeCheckId?: string;
  activeCheckSection?: "settings" | "history";
};

export function CheckSidebarMenu({
  checks,
  activeCheckId,
  activeCheckSection,
}: CheckSidebarMenuProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);

  useEffect(() => {
    if (activeCheckId) {
      setExpandedCheckId(activeCheckId);
    }
  }, [activeCheckId]);

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  function toggleCheck(checkId: string) {
    setExpandedCheckId((current) => (current === checkId ? null : checkId));
  }

  return (
    <SidebarMenu>
      {checks.map((check) => {
        const isExpanded = expandedCheckId === check.id;
        const isCheckActive = activeCheckId === check.id;

        return (
          <SidebarMenuItem key={check.id}>
            <SidebarMenuButton
              type="button"
              isActive={isCheckActive}
              aria-expanded={isExpanded}
              onClick={() => toggleCheck(check.id)}
              className="w-full"
            >
              <ChevronRight
                className={cn(
                  "shrink-0 opacity-70 transition-transform duration-200",
                  isExpanded && "rotate-90",
                )}
              />
              <span className="truncate">{check.name}</span>
            </SidebarMenuButton>

            {isExpanded && (
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
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
