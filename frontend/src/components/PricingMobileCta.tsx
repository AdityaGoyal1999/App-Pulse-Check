"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingMobileCta() {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/80 sm:hidden",
      )}
    >
      <Link href="/signup" className={cn(buttonVariants({ className: "w-full" }))}>
        Get started free
        <ArrowRight />
      </Link>
    </div>
  );
}
