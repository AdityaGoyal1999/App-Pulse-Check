import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CHECK_TABLE_CLASS, CHECK_TABLE_COLUMNS } from "@/lib/check-table";
import { cn } from "@/lib/utils";

function CheckRowSkeleton({ nameWidth }: { nameWidth: string }) {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className={cn("h-4", nameWidth)} />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-48 max-w-full" />
      </TableCell>
      <TableCell className={CHECK_TABLE_COLUMNS.actions}>
        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

function CheckCardSkeleton({ nameWidth }: { nameWidth: string }) {
  return (
    <div className="border-b border-border p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className={cn("h-4", nameWidth)} />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

const ROW_WIDTHS = ["w-28", "w-36", "w-32", "w-40", "w-24"];

type CheckListSkeletonProps = {
  rows?: number;
};

export function CheckListSkeleton({ rows = 5 }: CheckListSkeletonProps) {
  return (
    <Card aria-busy="true" aria-label="Loading checks">
      <CardHeader className="sr-only">
        <CardTitle>Checks</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="md:hidden">
          {Array.from({ length: rows }).map((_, index) => (
            <CheckCardSkeleton
              key={index}
              nameWidth={ROW_WIDTHS[index % ROW_WIDTHS.length]}
            />
          ))}
        </div>
        <div className="hidden md:block">
          <Table className={CHECK_TABLE_CLASS}>
            <TableHeader>
              <TableRow>
                <TableHead className={CHECK_TABLE_COLUMNS.name}>Name</TableHead>
                <TableHead className={CHECK_TABLE_COLUMNS.lastPinged}>
                  Last Pinged
                </TableHead>
                <TableHead className={CHECK_TABLE_COLUMNS.status}>
                  Status
                </TableHead>
                <TableHead className={CHECK_TABLE_COLUMNS.pingUrl}>
                  Ping URL
                </TableHead>
                <TableHead className={CHECK_TABLE_COLUMNS.actions}>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, index) => (
                <CheckRowSkeleton
                  key={index}
                  nameWidth={ROW_WIDTHS[index % ROW_WIDTHS.length]}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
