import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center", className)}>
      <div className="mb-3 rounded-full border border-border bg-surface p-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? (
        <Button className="mt-4" variant="outline" size="sm">
          {action}
        </Button>
      ) : null}
    </div>
  );
}
