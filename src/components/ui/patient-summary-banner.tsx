"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PatientSummaryField = {
  label: string;
  value: string;
};

const defaultFields: PatientSummaryField[] = [
  { label: "Name", value: "Meera Joshi" },
  { label: "UHID", value: "UHID-45821" },
  { label: "Age/Sex", value: "42 years / Female" },
  { label: "Ward/Bed", value: "Ward 3 / Bed 12" },
  { label: "Blood Group", value: "A+" },
];

export function PatientSummaryBanner({
  title = "",
  fields = defaultFields,
  className,
  children,
}: {
  title?: string;
  fields?: PatientSummaryField[];
  className?: string;
  children?: React.ReactNode;
}) {
  const [primaryField, ...rest] = fields;

  return (
    <Card className={cn("overflow-hidden border-blue-900/10 bg-white shadow-sm", className)}>
      <CardContent className="space-y-3 p-0">
        <div className="overflow-x-auto border-b border-blue-800/20 bg-gradient-to-r from-[#155bd8] via-[#0f63d1] to-[#0d4fb8] px-3 py-2 text-white sm:px-4">
          <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
            {primaryField ? <PatientPrimaryField field={primaryField} /> : null}
            {rest.length ? (
              <div className="flex items-center gap-2">
                {rest.map((field) => (
                  <PatientMetaField key={field.label} field={field} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {/* <div className="px-3 pt-3 sm:px-4 sm:pb-4">{children}</div> */}
      </CardContent>
    </Card>
  );
}

function PatientPrimaryField({ field }: { field: PatientSummaryField }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5">
      <div className="min-w-0 break-words text-sm font-bold leading-5 text-white sm:text-base lg:text-lg">{field.value}</div>
    </div>
  );
}

function PatientMetaField({ field }: { field: PatientSummaryField }) {
  return (
    <div className="min-w-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] leading-4 sm:text-sm">
      <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className="shrink-0 font-semibold text-white/80">{field.label}:</span>
        <span className="break-words font-semibold text-white">{field.value}</span>
      </div>
    </div>
  );
}
