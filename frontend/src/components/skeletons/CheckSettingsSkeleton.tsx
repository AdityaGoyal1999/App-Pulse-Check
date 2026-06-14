import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SummaryCardSkeleton() {
  return (
    <div className="relative">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="mt-2 h-9 w-full max-w-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MonitoringCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring</CardTitle>
        <CardDescription>
          Paused checks are skipped by the evaluation worker and will not
          trigger down alerts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

function AlertsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Down alerts</CardTitle>
        <CardDescription>
          Get notified when this check goes DOWN. Configure a Slack incoming
          webhook.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </CardContent>
    </Card>
  );
}

export function CheckSettingsSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Loading check settings"
    >
      <SummaryCardSkeleton />
      <MonitoringCardSkeleton />
      <AlertsCardSkeleton />
    </div>
  );
}
