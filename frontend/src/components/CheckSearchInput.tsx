"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CheckSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export function CheckSearchInput({
  value,
  onChange,
  placeholder = "Search checks…",
  className,
  inputClassName,
}: CheckSearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-8 pl-8", value && "pr-8", inputClassName)}
        aria-label="Search checks"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
