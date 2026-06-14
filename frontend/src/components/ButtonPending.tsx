import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type ButtonPendingProps = {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
};

export function ButtonPending({
  pending,
  pendingLabel,
  children,
}: ButtonPendingProps) {
  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" />
        {pendingLabel}
      </>
    );
  }

  return <>{children}</>;
}
