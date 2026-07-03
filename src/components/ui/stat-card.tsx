import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import type { StatusTone } from "@/types";

export function StatCard({
  label,
  value,
  change,
  context,
  tone,
  icon: Icon,
  currency,
}: {
  label: string;
  value: number;
  change: string;
  context: string;
  tone: StatusTone;
  icon: LucideIcon;
  currency?: boolean;
}) {
  return (
    <Card className="min-h-[150px] p-5 transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {currency ? formatCurrency(value) : formatCompactNumber(value)}
          </div>
        </div>
        <div className="rounded-xl border border-sky-100 bg-sky-50 p-2.5 text-sky-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <StatusPill tone={tone}>{change}</StatusPill>
        <span className="truncate text-xs font-medium text-slate-500">{context}</span>
      </div>
    </Card>
  );
}
