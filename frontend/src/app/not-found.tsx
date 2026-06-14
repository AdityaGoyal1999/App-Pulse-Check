import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MarketingHeader } from "@/components/MarketingHeader";
import { buttonVariants } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Page not found",
  description: "The page you're looking for doesn't exist or has been moved.",
});

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <MarketingHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <Link
            href="/docs"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Read the docs
          </Link>
        </div>
      </main>
    </div>
  );
}
