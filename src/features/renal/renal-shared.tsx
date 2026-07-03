"use client";

import type * as React from "react";
import Link from "next/link";
import { AlertTriangle, Droplets, LockKeyhole, ShieldAlert } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { getPatientById } from "@/data/patients";
import type { RenalAlertSeverity, RenalStatus } from "@/data/renal";
import { cn } from "@/lib/utils";
import type { Role, StatusTone } from "@/types";

export const renalAllowedRoles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Doctor",
  "Nurse",
  "Lab Technician",
  "Billing Executive",
  "Management",
];

const renalEntryRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Nurse"];
const renalReviewRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor"];
const renalLabRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Lab Technician"];
const renalBillingRoles: Role[] = ["Super Admin", "Hospital Admin", "Billing Executive"];

export function useRenalAccess() {
  const { role } = useRole();
  const allowed = renalAllowedRoles.includes(role);
  const canEnterIO = renalEntryRoles.includes(role);
  const canReview = renalReviewRoles.includes(role);
  const canUpdateLabs = renalLabRoles.includes(role);
  const canBill = renalBillingRoles.includes(role);
  const readOnly = role === "Management" || role === "Billing Executive";

  return { role, allowed, canEnterIO, canReview, canUpdateLabs, canBill, readOnly };
}

export function ProtectedRenal({ children }: { children: (access: ReturnType<typeof useRenalAccess>) => React.ReactNode }) {
  const access = useRenalAccess();

  if (!access.allowed) {
    return (
      <div className="space-y-3 py-6">
        <EmptyState
          icon={LockKeyhole}
          title="Renal permission required"
          description="Your current static role cannot access renal workflows."
        />
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children(access)}</>;
}

export function RenalRoleBanner({ role }: { role: Role }) {
  if (role === "Nurse") {
    return <AlertBanner icon={Droplets} tone="info" title="Nursing renal chart">Intake, output, drains, and shift notes are enabled for this role.</AlertBanner>;
  }
  if (role === "Doctor") {
    return <AlertBanner icon={ShieldAlert} tone="warning" title="Doctor review">Trends, alerts, renal orders, and sign-off actions are enabled for this role.</AlertBanner>;
  }
  if (role === "Lab Technician") {
    return <AlertBanner icon={AlertTriangle} tone="info" title="Renal investigations">Renal lab update actions are enabled; clinical I/O entry remains protected.</AlertBanner>;
  }
  if (role === "Billing Executive" || role === "Management") {
    return <AlertBanner icon={LockKeyhole} tone="muted" title="Read-only renal view">Patient renal data is visible for review, while clinical edits are disabled.</AlertBanner>;
  }
  return <AlertBanner icon={ShieldAlert} tone="info" title="Renal module access">Clinical, audit, and configuration actions follow the selected static role.</AlertBanner>;
}

export function renalStatusTone(status: RenalStatus): StatusTone {
  if (status === "Stable") return "success";
  if (status === "AKI watch" || status === "Dialysis review") return "warning";
  if (status === "Fluid overload") return "danger";
  return "critical";
}

export function renalAlertTone(severity: RenalAlertSeverity): StatusTone {
  if (severity === "Info") return "info";
  if (severity === "Warning") return "warning";
  return "critical";
}

export function RenalStatusBadge({ status }: { status: RenalStatus | string }) {
  const tone = ["Stable", "AKI watch", "Fluid overload", "Critical", "Dialysis review"].includes(status)
    ? renalStatusTone(status as RenalStatus)
    : "info";
  return <StatusPill tone={tone}>{status}</StatusPill>;
}

export function BalanceBadge({ value }: { value: number }) {
  const tone: StatusTone = value > 1000 ? "critical" : value > 500 ? "warning" : value >= 0 ? "success" : "info";
  const prefix = value > 0 ? "+" : "";
  return <Badge tone={tone}>{prefix}{formatMl(value)}</Badge>;
}

export function formatMl(value: number) {
  return `${value.toLocaleString("en-IN")} ml`;
}

export function formatSignedMl(value: number) {
  return `${value > 0 ? "+" : ""}${formatMl(value)}`;
}

export function RenalPatientHeader({
  patientId,
  bedNo,
  ward,
  consultant,
  nephrologist,
  status,
  windowLabel,
}: {
  patientId: string;
  bedNo: string;
  ward: string;
  consultant: string;
  nephrologist: string;
  status: RenalStatus;
  windowLabel: string;
}) {
  const patient = getPatientById(patientId);
  const name = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient";

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold text-foreground">{name}</div>
            <RenalStatusBadge status={status} />
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>UHID: {patient?.uhid ?? "Unknown"}</span>
            <span>Bed: {bedNo}</span>
            <span>Ward: {ward}</span>
            <span>{patient?.age ?? "-"} / {patient?.gender ?? "-"}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{windowLabel}</div>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-2 lg:min-w-[360px]">
          <MiniMeta label="Consultant" value={consultant} />
          <MiniMeta label="Nephrology" value={nephrologist} />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted px-3 py-2">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function RenalMetricCard({
  label,
  value,
  subtext,
  tone = "info",
  className,
}: {
  label: string;
  value: React.ReactNode;
  subtext: string;
  tone?: StatusTone;
  className?: string;
}) {
  const toneClass: Record<StatusTone, string> = {
    success: "border-success/25 bg-success/5",
    warning: "border-warning/25 bg-warning/5",
    danger: "border-danger/25 bg-danger/5",
    info: "border-info/25 bg-info/5",
    critical: "border-critical/25 bg-critical/5",
    muted: "border-border bg-surface-muted",
  };

  return (
    <div className={cn("rounded-lg border p-3", toneClass[tone], className)}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{subtext}</div>
    </div>
  );
}

export function SectionShell({
  title,
  action,
  children,
  className,
}: {
  number?: number;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)}>
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="min-w-0 text-sm font-semibold uppercase tracking-wide text-foreground">
          {title}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

export function ClinicalTable({
  children,
  minWidth = "720px",
}: {
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function ClinicalTh({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("border-b border-border bg-surface-muted px-3 py-2 font-semibold uppercase text-muted-foreground", className)}>{children}</th>;
}

export function ClinicalTd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-border px-3 py-2 align-middle text-foreground", className)}>{children}</td>;
}
