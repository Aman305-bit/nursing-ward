"use client";

import Link from "next/link";
import { AlertTriangle, LockKeyhole, PackageCheck, Pill, Scissors, ShieldAlert, Store, UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { PatientAlertChips, PatientStatusBadge } from "@/features/patients/patient-shared";
import { getPatientById } from "@/data/patients";
import type { Role, StatusTone } from "@/types";

export type OperationsModule = "pharmacy" | "inventory" | "ot";

const operationsAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Pharmacist", "Billing Executive", "Management"];
const moduleFullAccess: Record<OperationsModule, Role[]> = {
  pharmacy: ["Super Admin", "Pharmacist"],
  inventory: ["Super Admin", "Pharmacist"],
  ot: ["Super Admin", "Doctor", "Nurse"],
};

export function useOperationsAccess(module: OperationsModule) {
  const { role } = useRole();
  return {
    role,
    allowed: operationsAccessRoles.includes(role),
    readOnly: !moduleFullAccess[module].includes(role),
  };
}

export function ProtectedOperations({
  module,
  children,
}: {
  module: OperationsModule;
  children: (state: { role: Role; readOnly: boolean }) => React.ReactNode;
}) {
  const access = useOperationsAccess(module);
  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="Phase 9 permission required" description="Your current static role cannot access pharmacy, inventory, store, or OT workflows." />;
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only operational access">
          {access.role} can review Phase 9 operational states, but dispense, stock, purchase, OT, sterilization, and infection-control actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function operationTone(status: string): StatusTone {
  if (["Dispensed", "In stock", "Received", "Sterilized", "Available", "Ready", "Clean", "Completed", "Approved placeholder", "Matched", "Signed"].includes(status)) return "success";
  if (["Pending", "Requested", "Ordered", "Scheduled", "Pre-op pending", "Sterilization pending", "Cleaning due", "Pending guardian", "Partially received", "Partially dispensed", "Invoice draft placeholder"].includes(status)) return "warning";
  if (["Out of stock", "Expired", "Cancelled", "Rejected", "Rejected placeholder", "Damaged", "Missing", "Failed checklist", "Blacklisted placeholder", "Mismatch", "Expired placeholder"].includes(status)) return "danger";
  if (["Critical stock", "Controlled medicine placeholder", "Emergency", "Quarantined", "Blocked", "Override required"].includes(status)) return "critical";
  if (["Low stock", "Near expiry", "Reserved", "In transit", "In surgery", "Recovery", "Delayed", "Substitution requested placeholder", "Returned placeholder", "Used", "Cleaning"].includes(status)) return "info";
  return "muted";
}

export function OperationStatus({ status }: { status: string }) {
  return <StatusPill tone={operationTone(status)}>{status}</StatusPill>;
}

export function OperationSafetyBanner({ module }: { module: OperationsModule }) {
  const text =
    module === "pharmacy"
      ? "Allergy, drug interaction, batch, expiry, controlled medicine, return, and billing states are placeholders and require future audit-backed workflows."
      : module === "inventory"
        ? "Stock adjustment, quarantine, recall, GRN, transfer variance, and audit approval actions are reason-gated placeholders."
        : "OT consent, instrument readiness, surgical counts, sterilization, infection checklist, and room release states must be complete before live workflow actions.";
  return <AlertBanner icon={ShieldAlert} tone="warning" title="Operational safety">{text}</AlertBanner>;
}

export function CriticalOperationBanner({ children }: { children: React.ReactNode }) {
  return <AlertBanner icon={AlertTriangle} tone="critical" title="High-impact action">{children}</AlertBanner>;
}

export function PatientOperationHeader({
  patientId,
  context,
  meta,
  module,
}: {
  patientId: string;
  context: string;
  meta: string;
  module: OperationsModule;
}) {
  const patient = getPatientById(patientId);
  if (!patient) return <EmptyState icon={UserRound} title="Patient not found" description="The patient context is not available in static Phase 9 data." />;
  const Icon = module === "pharmacy" ? Pill : module === "inventory" ? Store : Scissors;
  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{patient.firstName} {patient.lastName}</span>
              <Badge tone="muted">{patient.uhid}</Badge>
              <Badge tone="info">{patient.age}/{patient.gender}</Badge>
              <PatientStatusBadge status={patient.status} />
            </div>
            <div className="mt-2"><PatientAlertChips alerts={patient.alertFlags} /></div>
          </div>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-2 xl:min-w-[520px]">
          <div className="rounded-md border border-border bg-surface-muted p-2">Context: {context}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Meta: {meta}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">ABHA: {patient.abhaStatus}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Privacy: audit handoff placeholder</div>
        </div>
        <Button size="sm" variant="outline" asChild><Link href={`/emr/patients/${patientId}/timeline`}>EMR timeline</Link></Button>
      </CardContent>
    </Card>
  );
}

export function StockWarningStrip({ status, batch, expiry }: { status: string; batch?: string; expiry?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-muted p-3 text-xs">
      <PackageCheck className="h-4 w-4 text-muted-foreground" />
      <OperationStatus status={status} />
      {batch ? <Badge tone="muted">Batch {batch}</Badge> : null}
      {expiry ? <Badge tone={expiry.includes("Expired") || expiry === "Expired" ? "danger" : expiry.includes("Near") ? "warning" : "muted"}>Expiry {expiry}</Badge> : null}
      <span className="text-muted-foreground">Expired, quarantined, recalled, or damaged stock remains blocked visually.</span>
    </div>
  );
}
