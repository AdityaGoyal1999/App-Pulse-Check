import { cn } from "@/lib/utils";

type CodeBlockProps = {
  children: string;
  title?: string;
  className?: string;
};

export function CodeBlock({ children, title, className }: CodeBlockProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg elevation-flat", className)}>
      {title && (
        <div className="border-b border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto bg-muted/30 p-4 text-sm leading-relaxed">
        <code className="font-mono text-foreground">{children.trim()}</code>
      </pre>
    </div>
  );
}
