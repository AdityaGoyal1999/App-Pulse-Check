import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Check } from "lucide-react";

import { MarketingHeader } from "@/components/MarketingHeader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MARKETING_PLANS, PLAN_DIFFERENTIATORS } from "@/lib/plans";
import { PricingPlanActions } from "@/components/PricingPlanActions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — App Pulse Check",
  description:
    "Simple pricing for heartbeat monitoring. Start free with 20 checks and 100 ping logs per check.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <MarketingHeader activeNav="pricing" />

      <main className="flex-1">
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
            <Badge variant="secondary" className="mb-4">
              Simple, honest pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Monitor more jobs without surprise bills
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--subtle-foreground)]">
              Start on Free with 20 checks and 100 ping logs per check. Upgrade
              when you need higher limits, email alerts, or team features.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
            {MARKETING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "flex flex-col",
                  plan.highlighted && "ring-2 ring-primary/30",
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.available ? (
                      <Badge>Available</Badge>
                    ) : (
                      <Badge variant="outline">Coming soon</Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    {plan.priceNote && (
                      <span className="ml-1.5 text-sm text-muted-foreground">
                        {plan.priceNote}
                      </span>
                    )}
                  </div>
                  <CardDescription className="mt-3 text-sm leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <PricingPlanActions plan={plan} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Built-in from day one
              </h2>
              <p className="mt-4 text-lg text-[var(--subtle-foreground)]">
                Features that set App Pulse Check apart — included on every plan.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {PLAN_DIFFERENTIATORS.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Limits at a glance
            </h2>
            <div className="mt-8 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 font-medium text-foreground">
                      Plan
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Checks
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Ping logs / check
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MARKETING_PLANS.map((plan) => (
                    <tr key={plan.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {plan.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {plan.maxChecks.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {plan.maxPingLogsPerCheck.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Ping logs are retained per check. When the limit is reached, the
              oldest entries are removed automatically.{" "}
              <Link href="/docs#plans" className="font-medium text-primary hover:underline">
                Read more in the docs
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="size-3.5" strokeWidth={2.25} />
            </div>
            <span className="font-medium text-foreground">App Pulse Check</span>
          </Link>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <p>Heartbeat monitoring for jobs that matter.</p>
            <Link href="/docs" className="font-medium text-foreground hover:text-primary">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
