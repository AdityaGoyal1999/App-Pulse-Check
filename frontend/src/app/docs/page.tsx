import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Clock,
  Shield,
  Zap,
} from "lucide-react";

import { CodeBlock } from "@/components/docs/CodeBlock";
import { MarketingHeader } from "@/components/MarketingHeader";
import { IntegrationIcon } from "@/components/landing/IntegrationIcon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { MARKETING_PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentation — App Pulse Check",
  description:
    "Learn how to integrate heartbeat monitoring into your cron jobs, scripts, and background workers. Slack alerts supported today.",
};

const TOC = [
  { id: "overview", label: "What & why" },
  { id: "what-we-offer", label: "What we offer" },
  { id: "plans", label: "Plans & limits" },
  { id: "quick-start", label: "Quick start" },
  { id: "ping-api", label: "Ping API" },
  { id: "interval-grace", label: "Interval & grace" },
  { id: "statuses", label: "Statuses & pause" },
  { id: "integrating", label: "How to integrate" },
  { id: "alerts", label: "Alerts" },
  { id: "best-practices", label: "Best practices" },
  { id: "faq", label: "FAQ" },
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

const ALERT_CHANNELS = [
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

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border py-12 last:border-b-0">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--subtle-foreground)]">
        {children}
      </div>
    </section>
  );
}

function DocH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 text-lg font-semibold text-foreground first:mt-0">{children}</h3>
  );
}

export default function DocsPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <MarketingHeader sticky activeNav="docs" />

      <nav
        aria-label="On this page"
        className="border-b border-border lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-12 px-4 py-10 sm:px-6 lg:py-14">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              On this page
            </p>
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-10">
            <Badge variant="secondary" className="mb-4">
              Documentation
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Integrate heartbeat monitoring into your workflow
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--subtle-foreground)]">
              Everything you need to wire App Pulse Check into cron jobs, scripts,
              and background workers — and get alerted when they go quiet.
            </p>
          </div>

          <DocSection id="overview" title="What the product is and why you should care">
            <p>
              App Pulse Check is a <strong className="font-medium text-foreground">heartbeat monitor</strong> for
              background jobs, cron tasks, and scripts. Each monitored job gets a unique ping URL.
              When the job runs successfully, it calls that URL to signal it&apos;s alive. If pings
              stop arriving within the expected window, the check is marked down and your team gets
              notified.
            </p>
            <p>
              This is <strong className="font-medium text-foreground">not</strong> traditional HTTP
              uptime monitoring. You don&apos;t point us at a public endpoint and wait for it to
              respond. Instead, <em>your job tells us it finished</em> — which catches silent
              failures: scripts that crash, crons that never fire, workers that hang, pipelines that
              stall without raising an error.
            </p>
            <DocH3>What it&apos;s for</DocH3>
            <ul className="list-disc space-y-2 pl-5">
              <li>Nightly backups and database maintenance scripts</li>
              <li>Scheduled data syncs and ETL pipelines</li>
              <li>Queue workers and background processors</li>
              <li>GitHub Actions or CI jobs that must run on a schedule</li>
              <li>Any recurring task that can fail without anyone noticing</li>
            </ul>
            <DocH3>Heartbeat vs. health checks</DocH3>
            <p>
              App Pulse Check exposes <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">GET /health</code> on
              the API server for monitoring the service itself. Your jobs use{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">GET /ping/:uuid</code> — a
              separate, public endpoint scoped to each check you create.
            </p>
          </DocSection>

          <DocSection id="what-we-offer" title="What we offer">
            <p>
              App Pulse Check gives indie hackers and small teams focused monitoring — everything
              you need to know when scheduled work stops running, without a full observability stack.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-5" strokeWidth={2} />
                    </div>
                    <CardTitle className="mt-4 text-base">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <DocH3>Also included</DocH3>
            <ul className="list-disc space-y-2 pl-5">
              <li>Web dashboard with live status badges and relative last-ping times</li>
              <li>Copy-ping-URL workflow — no SDK, no package install</li>
              <li>Per-check Slack webhook configuration</li>
              <li>Pause checks during planned maintenance</li>
              <li>Configurable interval and grace period per job</li>
              <li>JWT-protected API for creating and managing checks</li>
            </ul>
          </DocSection>

          <DocSection id="plans" title="Plans & limits">
            <p>
              App Pulse Check offers four plans:{" "}
              <strong className="font-medium text-foreground">Free</strong>,{" "}
              <strong className="font-medium text-foreground">Supporter</strong>,{" "}
              <strong className="font-medium text-foreground">Enterprise</strong>, and{" "}
              <strong className="font-medium text-foreground">Enterprise Plus</strong>.
              New accounts start on Free. Paid tiers unlock higher limits and additional alert
              channels as they launch.
            </p>
            <div className="not-prose my-6 overflow-x-auto rounded-lg elevation-flat">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">
                      Plan
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">
                      Max checks
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">
                      Ping logs per check
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MARKETING_PLANS.map((plan) => (
                    <tr key={plan.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {plan.name}
                      </td>
                      <td className="px-4 py-2.5">{plan.maxChecks}</td>
                      <td className="px-4 py-2.5">{plan.maxPingLogsPerCheck}</td>
                      <td className="px-4 py-2.5">
                        {plan.available ? (
                          <Badge className="text-xs">Available</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Coming soon
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DocH3>Ping log retention</DocH3>
            <p>
              Every successful ping creates a log entry on that check&apos;s history page. Each
              plan caps how many entries are kept per check. When a new ping would exceed your
              plan&apos;s limit, the{" "}
              <strong className="font-medium text-foreground">oldest</strong> log entries are
              deleted automatically — both when pings arrive and during a periodic retention
              cleanup.
            </p>
            <p>
              On Free and Supporter, up to{" "}
              <strong className="font-medium text-foreground">100</strong> pings per check are
              retained. Enterprise and Enterprise Plus retain up to{" "}
              <strong className="font-medium text-foreground">1,000</strong> per check.
            </p>
            <DocH3>Check limits</DocH3>
            <p>
              Each plan also limits how many checks you can create. The dashboard shows your
              current usage (for example, &quot;12 / 20 checks&quot;). When you reach the limit,
              existing checks keep running but you cannot create new ones until you delete a check
              or upgrade your plan.
            </p>
            <p>
              See the full comparison on the{" "}
              <Link href="/pricing" className="font-medium text-primary hover:underline">
                pricing page
              </Link>
              .
            </p>
          </DocSection>

          <DocSection id="quick-start" title="Quick start">
            <p>Get your first check running in about five minutes.</p>
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>{" "}
                and open the{" "}
                <Link href="/dashboard" className="font-medium text-primary hover:underline">
                  dashboard
                </Link>
                .
              </li>
              <li>
                Click <strong className="font-medium text-foreground">Create Check</strong> — give
                it a name, set an expected interval (seconds between successful runs), and a grace
                period (extra buffer before marking down).
              </li>
              <li>
                Copy the ping URL from the check row. It looks like{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                  https://your-api.example.com/ping/a1b2c3d4-…
                </code>
              </li>
              <li>
                Add a single HTTP GET at the <strong className="font-medium text-foreground">end</strong> of
                your job, only when the work succeeds. See{" "}
                <a href="#integrating" className="font-medium text-primary hover:underline">
                  How to integrate
                </a>{" "}
                for copy-paste examples.
              </li>
              <li>
                Configure Slack alerts under{" "}
                <strong className="font-medium text-foreground">Alerts</strong> on the check row.
                See{" "}
                <a href="#alerts" className="font-medium text-primary hover:underline">
                  Alerts
                </a>{" "}
                for setup steps.
              </li>
              <li>
                Run your job once. The check should move from{" "}
                <Badge variant="outline" className="mx-0.5 align-middle text-xs">NEW</Badge> to{" "}
                <Badge variant="outline" className="mx-0.5 align-middle text-xs">UP</Badge> after
                the first ping.
              </li>
            </ol>
          </DocSection>

          <DocSection id="ping-api" title="Ping API reference">
            <p>
              The ping endpoint is public and requires no authentication. The UUID in the URL acts
              as the secret — treat it like an API key.
            </p>
            <div className="not-prose my-4 overflow-x-auto rounded-lg elevation-flat">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="bg-muted/40 px-4 py-2.5 font-medium text-foreground">Method</td>
                    <td className="px-4 py-2.5 font-mono">GET</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="bg-muted/40 px-4 py-2.5 font-medium text-foreground">URL</td>
                    <td className="px-4 py-2.5 font-mono text-foreground">
                      {"{API_URL}"}/ping/{"{uuid}"}
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="bg-muted/40 px-4 py-2.5 font-medium text-foreground">Auth</td>
                    <td className="px-4 py-2.5">None</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="bg-muted/40 px-4 py-2.5 font-medium text-foreground">When to call</td>
                    <td className="px-4 py-2.5">
                      After your job completes <strong className="text-foreground">successfully</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-muted/40 px-4 py-2.5 font-medium text-foreground">Response</td>
                    <td className="px-4 py-2.5 font-mono text-xs sm:text-sm">
                      200 {"{ ok: true, checkId, pingedAt }"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <DocH3>Test with curl</DocH3>
            <CodeBlock title="bash">{`curl -fsS -o /dev/null "https://your-api.example.com/ping/YOUR-UUID"`}</CodeBlock>
            <p className="text-sm">
              <code className="font-mono">-f</code> fails on non-2xx responses;{" "}
              <code className="font-mono">-sS</code> keeps output quiet but surfaces errors.
            </p>
            <DocH3>Errors</DocH3>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <code className="font-mono text-sm">404</code> — UUID not found (wrong URL or deleted
                check)
              </li>
              <li>
                <code className="font-mono text-sm">500</code> — server error; retry is safe
              </li>
            </ul>
          </DocSection>

          <DocSection id="interval-grace" title="Interval & grace period">
            <p>
              When you create a check, you set two timing values that control when a missed ping
              triggers a down state.
            </p>
            <div className="not-prose my-4 overflow-x-auto rounded-lg elevation-flat">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">Field</th>
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">Range</th>
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5 font-medium text-foreground">Interval</td>
                    <td className="px-4 py-2.5 font-mono">60 – 86,400 s</td>
                    <td className="px-4 py-2.5">Expected time between successful runs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-foreground">Grace</td>
                    <td className="px-4 py-2.5 font-mono">0 – 3,600 s</td>
                    <td className="px-4 py-2.5">Extra buffer before marking DOWN</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <DocH3>Down detection formula</DocH3>
            <CodeBlock>{`A check goes DOWN when:
  now > lastPingedAt + intervalSeconds + graceSeconds`}</CodeBlock>
            <p>
              A background worker evaluates all non-paused checks every{" "}
              <strong className="font-medium text-foreground">60 seconds</strong>, so detection can
              lag by up to ~60 seconds after the deadline passes.
            </p>
            <DocH3>Suggested presets</DocH3>
            <div className="not-prose overflow-x-auto rounded-lg elevation-flat">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">Job type</th>
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">Interval</th>
                    <th className="px-4 py-2.5 text-left font-medium text-foreground">Grace</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5">Every 5 minutes</td>
                    <td className="px-4 py-2.5 font-mono">300 s</td>
                    <td className="px-4 py-2.5 font-mono">60 s</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-2.5">Hourly cron</td>
                    <td className="px-4 py-2.5 font-mono">3,600 s</td>
                    <td className="px-4 py-2.5 font-mono">300 s</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Daily backup</td>
                    <td className="px-4 py-2.5 font-mono">86,400 s</td>
                    <td className="px-4 py-2.5 font-mono">3,600 s</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm">
              Tip: set the interval slightly <em>above</em> your real schedule if jobs sometimes run
              a few minutes late.
            </p>
          </DocSection>

          <DocSection id="statuses" title="Statuses & pause">
            <p>Each check moves through a simple lifecycle visible on your dashboard.</p>
            <ul className="space-y-3">
              <li>
                <Badge variant="outline" className="mr-2">NEW</Badge>
                Check created but never pinged. Will <strong className="font-medium text-foreground">not</strong> go
                DOWN until the first successful ping arrives.
              </li>
              <li>
                <Badge variant="outline" className="mr-2">UP</Badge>
                Last ping arrived within the expected window. Everything looks healthy.
              </li>
              <li>
                <Badge variant="destructive" className="mr-2 bg-destructive/10 text-destructive">DOWN</Badge>
                Pings stopped arriving on time. A Slack alert fires if configured.
              </li>
            </ul>
            <DocH3>Pause</DocH3>
            <p>
              Use <strong className="font-medium text-foreground">Pause</strong> on the dashboard
              during planned maintenance, deployments, or migrations. Paused checks are skipped by
              the evaluation worker and will not be marked DOWN or send alerts.
            </p>
          </DocSection>

          <DocSection id="integrating" title="How to integrate">
            <p>
              Add one HTTP GET at the <strong className="font-medium text-foreground">end</strong> of
              your job, only after work completes successfully. Store the ping URL in an environment
              variable — never commit it to version control.
            </p>
            <DocH3>Linux cron</DocH3>
            <CodeBlock title="crontab">{`# Run backup at 2 AM; ping only if backup succeeds
0 2 * * * /usr/local/bin/nightly-backup.sh && curl -fsS -o /dev/null "$PULSECHECK_URL"`}</CodeBlock>
            <DocH3>Bash script</DocH3>
            <CodeBlock title="backup.sh">{`#!/usr/bin/env bash
set -euo pipefail

# ... your backup logic ...

curl -fsS -o /dev/null "$PULSECHECK_URL"`}</CodeBlock>
            <DocH3>Node.js</DocH3>
            <CodeBlock title="job.js">{`async function runJob() {
  // ... your work ...
  const res = await fetch(process.env.PULSECHECK_URL);
  if (!res.ok) throw new Error(\`Ping failed: \${res.status}\`);
}

runJob().catch((err) => {
  console.error(err);
  process.exit(1);
});`}</CodeBlock>
            <DocH3>Python</DocH3>
            <CodeBlock title="job.py">{`import os
import urllib.request

def run_job():
    # ... your work ...
    urllib.request.urlopen(os.environ["PULSECHECK_URL"])

if __name__ == "__main__":
    run_job()`}</CodeBlock>
            <DocH3>GitHub Actions</DocH3>
            <CodeBlock title=".github/workflows/scheduled.yml">{`jobs:
  nightly:
    runs-on: ubuntu-latest
    steps:
      - name: Run task
        run: ./scripts/nightly-task.sh
      - name: Ping App Pulse Check
        if: success()
        run: curl -fsS -o /dev/null "$PULSECHECK_URL"
    env:
      PULSECHECK_URL: \${{ secrets.PULSECHECK_URL }}`}</CodeBlock>
            <DocH3>Docker / Kubernetes CronJob</DocH3>
            <p>
              Run your main container command first, then ping in a post-step or wrapper script.
              In Kubernetes, use an init-style wrapper or chain commands with{" "}
              <code className="font-mono text-sm">&&</code> so the ping only runs on success.
            </p>
            <CodeBlock title="wrapper.sh">{`#!/bin/sh
set -e
/node-app/run-sync.sh
curl -fsS -o /dev/null "$PULSECHECK_URL"`}</CodeBlock>
          </DocSection>

          <DocSection id="alerts" title="Alerts">
            <p>
              Get notified the moment a check goes DOWN — before your users or downstream systems
              notice something is wrong.
            </p>
            <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
              {ALERT_CHANNELS.map((channel) => (
                <Card
                  key={channel.id}
                  className={cn(channel.available && "ring-primary/20")}
                  elevation={channel.available ? "featured" : "default"}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex size-10 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: channel.brandColor }}
                      >
                        <IntegrationIcon name={channel.id} className="size-5" />
                      </div>
                      {channel.available ? (
                        <Badge className="shrink-0">Available</Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          Coming soon
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4 text-base">{channel.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {channel.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <DocH3>Setting up Slack alerts</DocH3>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                In Slack, go to{" "}
                <strong className="font-medium text-foreground">Apps → Incoming Webhooks</strong>{" "}
                (or create a Slack app with Incoming Webhooks enabled).
              </li>
              <li>
                Add a new webhook and choose the channel where alerts should appear (e.g.{" "}
                <code className="font-mono text-sm">#alerts</code>).
              </li>
              <li>
                Copy the webhook URL — it starts with{" "}
                <code className="font-mono text-sm">https://hooks.slack.com/services/…</code>
              </li>
              <li>
                On the dashboard, click <strong className="font-medium text-foreground">Alerts</strong> on
                your check and paste the URL. Save settings.
              </li>
            </ol>
            <p>
              Alerts are configured <strong className="font-medium text-foreground">per check</strong>,
              so different jobs can notify different channels. An alert fires when a check
              transitions to DOWN. More channels ship soon — no migration needed when they land.
            </p>
          </DocSection>

          <DocSection id="best-practices" title="Best practices">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium text-foreground">Ping after success, not before.</strong>{" "}
                A ping at the start of a job will mark it UP even if the job crashes midway.
              </li>
              <li>
                <strong className="font-medium text-foreground">Don&apos;t ping on failure.</strong>{" "}
                Let the missed ping surface the problem — unless you intentionally want failures to
                look healthy.
              </li>
              <li>
                <strong className="font-medium text-foreground">One check per distinct job.</strong>{" "}
                Don&apos;t reuse one UUID for unrelated tasks.
              </li>
              <li>
                <strong className="font-medium text-foreground">Use environment variables.</strong>{" "}
                Store <code className="font-mono text-sm">PULSECHECK_URL</code> in your secrets
                manager or CI secrets — never in source code.
              </li>
              <li>
                <strong className="font-medium text-foreground">Pause during maintenance.</strong>{" "}
                Avoid false alarms when you intentionally stop a job.
              </li>
              <li>
                <strong className="font-medium text-foreground">Leave headroom in your interval.</strong>{" "}
                If a job usually finishes in 50 minutes but sometimes takes 70, don&apos;t set a
                3,600-second interval with zero grace.
              </li>
            </ul>
          </DocSection>

          <DocSection id="faq" title="FAQ & troubleshooting">
            <DocH3>My check is stuck on NEW</DocH3>
            <p>
              No ping has been received yet. Test manually with curl using the URL from your
              dashboard. Confirm the UUID is correct and the request returns 200.
            </p>
            <DocH3>My check went DOWN but the job is fine</DocH3>
            <p>
              Your interval may be too tight or the job ran slower than expected. Increase the grace
              period or interval. Also confirm you&apos;re pinging <em>after</em> the work finishes,
              not before.
            </p>
            <DocH3>I didn&apos;t get a Slack alert</DocH3>
            <p>
              Verify a webhook URL is saved on the check&apos;s alert settings, the URL is valid, and
              the check isn&apos;t paused. Alerts fire on DOWN transitions — not on every evaluation
              cycle.
            </p>
            <DocH3>Ping returns 404</DocH3>
            <p>
              The UUID is wrong or the check was deleted. Copy a fresh URL from the dashboard.
            </p>
            <DocH3>Status changed late</DocH3>
            <p>
              The evaluation worker runs every 60 seconds. A check may appear DOWN up to a minute
              after the actual deadline.
            </p>
            <DocH3>Can I ping from multiple places?</DocH3>
            <p>
              Yes — any successful GET to the ping URL updates <code className="font-mono text-sm">lastPingedAt</code> and
              sets status to UP. Use one check per logical job, not per server instance, unless
              that&apos;s intentional.
            </p>
          </DocSection>

          <div className="mt-12 rounded-xl elevation-flat bg-primary/5 p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">Ready to add your first check?</h2>
            <p className="mt-2 text-muted-foreground">
              Create an account and copy a ping URL in under a minute.
            </p>
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "mt-6")}
            >
              Get started free
              <ArrowRight />
            </Link>
          </div>
        </main>
      </div>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="size-3.5" strokeWidth={2.25} />
            </div>
            <span className="font-medium text-foreground">App Pulse Check</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-foreground">
              Documentation
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
