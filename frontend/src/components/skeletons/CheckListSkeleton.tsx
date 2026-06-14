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
      <TableCell className="text-right">
        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Last Pinged</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ping URL</TableHead>
              <TableHead className="w-28 text-right">
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
      </CardContent>
    </Card>
  );
}
