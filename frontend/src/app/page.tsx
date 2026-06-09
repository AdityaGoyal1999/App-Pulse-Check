import { Activity, Bell, Clock, Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const features = [
  {
    icon: Activity,
    label: "Heartbeat pings",
    description: "One URL per cron job or script",
  },
  {
    icon: Bell,
    label: "Down alerts",
    description: "Know when silence means failure",
  },
  {
    icon: Clock,
    label: "Simple dashboard",
    description: "Status at a glance, no noise",
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-background">
      {/* Soft background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.8))]" />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center gap-2.5 px-6 py-8">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Activity className="size-4" strokeWidth={2.25} />
        </div>
        <span className="text-lg font-semibold tracking-tight">
          App Pulse Check
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-8">
        <div className="w-full max-w-xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium"
          >
            <Construction className="size-3.5" />
            Under construction
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
            Something useful is on the way.
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
            We&apos;re building a lightweight heartbeat monitor for cron jobs,
            background scripts, and scheduled tasks — so you know the moment
            something stops checking in.
          </p>

          <div className="mx-auto mt-10 max-w-sm space-y-2 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Build progress</span>
              <span className="text-muted-foreground">Early stages</span>
            </div>
            <Progress value={35} className="gap-0" />
          </div>
        </div>

        <div className="mt-16 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="rounded-xl border border-border/80 bg-card/80 p-5 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" strokeWidth={2} />
              </div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        App Pulse Check · Coming soon
      </footer>
    </div>
  );
}
