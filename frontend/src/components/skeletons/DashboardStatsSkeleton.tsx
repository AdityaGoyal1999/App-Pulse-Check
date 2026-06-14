import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="size-9 rounded-lg" />
        <Skeleton className="mt-3 h-8 w-12" />
        <div className="mt-1 space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardHeader>
    </Card>
  );
}

function PlanUsageCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-8 w-20" />
        <Skeleton className="mt-1 h-4 w-24" />
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </CardHeader>
    </Card>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading dashboard stats"
    >
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <PlanUsageCardSkeleton />
    </div>
  );
}
