import { Check } from "lucide-react";

import { PASSWORD_REQUIREMENTS } from "@/lib/validation";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  password: string;
};

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <ul className="space-y-1 text-sm text-muted-foreground">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const met = requirement.test(password);

        return (
          <li key={requirement.id} className="flex items-center gap-2">
            <Check
              className={cn(
                "size-3.5 shrink-0",
                met ? "text-green-600" : "text-muted-foreground/40",
              )}
              strokeWidth={2.5}
            />
            <span className={cn(met && "text-foreground")}>
              {requirement.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
