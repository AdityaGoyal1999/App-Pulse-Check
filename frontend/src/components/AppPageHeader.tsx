import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AppPageHeader({
  title,
  description,
  actions,
  footer,
  className,
}: AppPageHeaderProps) {
  return (
    <div
      className={cn(
        "relative -mx-6 overflow-hidden rounded-xl elevation-flat bg-secondary/30 px-6 py-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,102,204,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,102,204,0.03),transparent)]"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {typeof title === "string" ? (
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          ) : (
            title
          )}
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
      {footer ? <div className="relative mt-4">{footer}</div> : null}
    </div>
  );
}
