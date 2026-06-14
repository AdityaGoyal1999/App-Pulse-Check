import { format, formatDistanceToNow } from "date-fns";

import type { PingLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type PingHistoryTimelineProps = {
  logs: PingLogEntry[];
};

export function PingHistoryTimeline({ logs }: PingHistoryTimelineProps) {
  return (
    <ol className="space-y-0">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;

        return (
          <li
            key={log.id}
            className="row-fade-in flex gap-4"
            style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
          >
            <div className="flex flex-col items-center pt-1.5">
              <span
                className="size-2 shrink-0 rounded-full bg-green-500"
                aria-hidden
              />
              {!isLast ? (
                <span className="my-1 w-px flex-1 bg-border" aria-hidden />
              ) : null}
            </div>
            <div className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
              <p className="font-medium text-foreground">
                {formatDistanceToNow(new Date(log.pingedAt), {
                  addSuffix: true,
                })}
              </p>
              <code className="mt-2 block rounded-md bg-muted/50 px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
                {format(new Date(log.pingedAt), "PPpp")}
              </code>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
