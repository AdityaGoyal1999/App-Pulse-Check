import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function PingLogRowSkeleton({
  relativeWidth,
  timestampWidth,
}: {
  relativeWidth: string;
  timestampWidth: string;
}) {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4" style={{ width: relativeWidth }} />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4" style={{ width: timestampWidth }} />
      </TableCell>
    </TableRow>
  );
}

type CheckHistorySkeletonProps = {
  rows?: number;
};

export function CheckHistorySkeleton({ rows = 6 }: CheckHistorySkeletonProps) {
  return (
    <Card aria-busy="true" aria-label="Loading ping history">
      <CardHeader>
        <CardTitle>Recent pings</CardTitle>
        <CardDescription>
          Newest pings first. Older entries are removed once your plan retention
          limit is reached.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pinged</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <PingLogRowSkeleton
                key={index}
                relativeWidth={index % 2 === 0 ? "5.5rem" : "6.5rem"}
                timestampWidth={index % 2 === 0 ? "12rem" : "13rem"}
              />
            ))}
          </TableBody>
        </Table>
        <Skeleton className="mt-4 h-4 w-56" />
      </CardContent>
    </Card>
  );
}
