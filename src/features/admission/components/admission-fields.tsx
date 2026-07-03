import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const controlClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

export function FieldShell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("space-y-1 text-sm", className)}>
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function TextField({ label, placeholder, value, readOnly }: { label: string; placeholder?: string; value?: string; readOnly?: boolean }) {
  return (
    <FieldShell label={label}>
      <Input placeholder={placeholder ?? label} defaultValue={value} readOnly={readOnly} />
    </FieldShell>
  );
}

export function SelectField({ label, options, value }: { label: string; options: string[]; value?: string }) {
  return (
    <FieldShell label={label}>
      <select className={controlClass} defaultValue={value ?? ""}>
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({ label, placeholder, rows = 4 }: { label: string; placeholder: string; rows?: number }) {
  return (
    <FieldShell label={label} className="md:col-span-2 xl:col-span-3">
      <textarea
        className={cn(controlClass, "h-auto min-h-24 resize-y")}
        placeholder={placeholder}
        rows={rows}
      />
    </FieldShell>
  );
}
