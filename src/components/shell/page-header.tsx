import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  metrics,
  className,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  metrics?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("-mx-3 border-b border-slate-200 bg-white px-4 py-5 shadow-[0_8px_26px_rgba(15,23,42,0.03)] md:-mx-5 md:px-6", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-600">{eyebrow}</div> : null}
          <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {metrics ? <div className="mt-3">{metrics}</div> : null}
    </div>
  );
}
