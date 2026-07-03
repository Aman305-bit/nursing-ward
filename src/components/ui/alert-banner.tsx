import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

const toneClasses: Record<StatusTone, string> = {
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-danger/25 bg-danger/10 text-danger",
  info: "border-info/25 bg-info/10 text-info",
  critical: "border-critical/25 bg-critical/10 text-critical",
  muted: "border-border bg-surface-muted text-muted-foreground",
};

export function AlertBanner({
  icon: Icon,
  title,
  children,
  tone = "info",
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 rounded-lg border p-3", toneClasses[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs leading-5 opacity-90">{children}</div>
      </div>
    </div>
  );
}
