import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Clock,
  Copy,
  Shield,
  Zap,
} from "lucide-react";

import { IntegrationIcon } from "@/components/landing/IntegrationIcon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    title: "Create a check",
    description:
      "Set an expected interval and grace period for each cron job, script, or background worker.",
  },
  {
    step: "02",
    title: "Ping on success",
    description:
      "Add one HTTP call to your job. Each successful run hits your unique ping URL.",
  },
  {
    step: "03",
    title: "Get alerted when it stops",
    description:
      "If pings stop arriving on time, the check goes down and your team gets notified.",
  },
] as const;

const FEATURES = [
  {
    icon: Zap,
    title: "One-line integration",
    description:
      "No SDK required. Copy a ping URL and add a single GET request to your existing job.",
  },
  {
    icon: Clock,
    title: "Smart missed-ping detection",
    description:
      "A background worker evaluates every check every 60 seconds, respecting your interval and grace window.",
  },
  {
    icon: Bell,
    title: "Actionable down alerts",
    description:
      "Know the moment something stops checking in — before your users or data pipeline do.",
  },
  {
    icon: Shield,
    title: "Built for small teams",
    description:
      "Lightweight monitoring without standing up Prometheus, Grafana, or a full observability stack.",
  },
] as const;

const INTEGRATIONS = [
  {
    id: "slack" as const,
    name: "Slack",
    description: "Incoming webhook alerts delivered straight to your channel.",
    available: true,
    brandColor: "#4A154B",
  },
  {
    id: "discord" as const,
    name: "Discord",
    description: "Webhook notifications for your server channels.",
    available: false,
    brandColor: "#5865F2",
  },
  {
    id: "email" as const,
    name: "Email",
    description: "Inbox alerts when a check goes down.",
    available: false,
    brandColor: "#0066cc",
  },
  {
    id: "pagerduty" as const,
    name: "PagerDuty",
    description: "Escalate critical failures to your on-call rotation.",
    available: false,
    brandColor: "#06AC38",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-4" strokeWidth={2.25} />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            App Pulse Check
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,102,204,0.08),transparent)]"
          />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-28 lg:pt-16">
            <div>
              <Badge variant="secondary" className="mb-6">
                Heartbeat monitoring for cron &amp; scripts
              </Badge>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                The heartbeat monitor for jobs that can&apos;t afford to fail
                silently.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--subtle-foreground)] sm:text-xl sm:leading-8">
                Create a check, ping it when your cron or script runs, and get
                alerted the moment something stops checking in — without a full
                observability stack.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Get started free
                  <ArrowRight />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                  )}
                >
                  Log in
                </Link>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Built for indie hackers and small teams.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl"
              />
              <Card className="relative shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-sm font-semibold">
                      nightly-backup
                    </CardTitle>
                    <Badge
                      variant="destructive"
                      className="bg-destructive/10 text-destructive"
                    >
                      Down
                    </Badge>
                  </div>
                  <CardDescription>
                    Last ping 2 hours ago · interval 30m
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Copy className="size-3.5" />
                      Ping URL
                    </div>
                    <code className="mt-2 block truncate font-mono text-xs text-foreground">
                      GET /ping/a1b2c3d4-e5f6-7890-abcd-ef1234567890
                    </code>
                  </div>

                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#4A154B] text-white">
                        <IntegrationIcon name="slack" className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          Slack alert sent
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          nightly-backup missed its check-in window and was
                          marked down.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-[var(--subtle-foreground)]">
                Three steps from silent failure to instant visibility.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {STEPS.map((item) => (
                <Card key={item.step} className="relative">
                  <CardHeader>
                    <span className="text-xs font-semibold tracking-widest text-primary">
                      {item.step}
                    </span>
                    <CardTitle className="mt-2 text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border bg-secondary/40 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="mt-4 text-lg text-[var(--subtle-foreground)]">
                Focused monitoring for scheduled and background work.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-5" strokeWidth={2} />
                    </div>
                    <CardTitle className="mt-4 text-lg">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="border-b border-border py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Get notified where your team already lives
              </h2>
              <p className="mt-4 text-lg text-[var(--subtle-foreground)]">
                Connect alerts per check. Slack is supported today — Discord,
                Email, and PagerDuty are on the way.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {INTEGRATIONS.map((integration) => (
                <Card
                  key={integration.id}
                  className={cn(
                    "relative transition-shadow",
                    integration.available && "ring-primary/20",
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex size-10 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: integration.brandColor }}
                      >
                        <IntegrationIcon
                          name={integration.id}
                          className="size-5"
                        />
                      </div>
                      {integration.available ? (
                        <Badge className="shrink-0">Available</Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          Coming soon
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4">{integration.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted-foreground">
              Configure a Slack Incoming Webhook per check from your dashboard.
              More channels ship soon — no migration needed when they land.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <Card className="overflow-hidden bg-primary text-primary-foreground ring-primary/20">
              <CardContent className="flex flex-col items-center px-6 py-14 text-center sm:px-12">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Stop finding out from your users
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
                  Set up your first check in minutes. Know the moment a cron
                  job, backup script, or background worker goes quiet.
                </p>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-8 bg-white text-primary hover:bg-white/90",
                  )}
                >
                  Create your first check
                  <ArrowRight />
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="size-3.5" strokeWidth={2.25} />
            </div>
            <span className="font-medium text-foreground">App Pulse Check</span>
          </div>
          <p>Heartbeat monitoring for jobs that matter.</p>
        </div>
      </footer>
    </div>
  );
}
