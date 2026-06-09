import { Activity, Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center gap-2.5 px-6 py-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-4" strokeWidth={2.25} />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">
          App Pulse Check
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
        <div className="w-full max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-8 gap-1.5 border-border px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <Construction className="size-3.5" />
            Under construction
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            The heartbeat monitor for jobs that can&apos;t afford to fail
            silently.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--subtle-foreground)] sm:text-xl sm:leading-8">
            Create a check, ping it when your cron or script runs, and get
            alerted the moment something stops checking in — without a full
            observability stack.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" disabled>
              Coming soon
            </Button>
            <Button size="lg" variant="outline" disabled>
              Watch demo
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Built for indie hackers and small teams. Launching soon.
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        App Pulse Check
      </footer>
    </div>
  );
}
