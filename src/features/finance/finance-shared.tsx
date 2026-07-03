"use client";

import Link from "next/link";
import { AlertTriangle, Landmark, LockKeyhole, ReceiptText, ShieldAlert, UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { PatientAlertChips, PatientStatusBadge } from "@/features/patients/patient-shared";
import { mockInsuranceCompanies } from "@/data/finance";
import { getPatientById } from "@/data/patients";
import type { BillingRecord, Role, StatusTone } from "@/types";

export type FinanceModule = "billing" | "finance" | "insurance";

const financeAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Billing Executive", "Doctor", "Nurse", "Pharmacist", "Management"];
const fullAccess: Record<FinanceModule, Role[]> = {
  billing: ["Super Admin", "Billing Executive"],
  finance: ["Super Admin", "Billing Executive"],
  insurance: ["Super Admin", "Billing Executive"],
};

export function useFinanceAccess(module: FinanceModule) {
  const { role } = useRole();
  return {
    role,
    allowed: financeAccessRoles.includes(role),
    readOnly: !fullAccess[module].includes(role),
  };
}

export function ProtectedFinance({
  module,
  children,
}: {
  module: FinanceModule;
  children: (state: { role: Role; readOnly: boolean }) => React.ReactNode;
}) {
  const access = useFinanceAccess(module);
  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="Finance permission required" description="Your current static role cannot access billing, finance, insurance, or TPA workflows." />;
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only finance access">
          {access.role} can review financial status in this static preview, but billing, refund, discount, cash, claim, and reconciliation actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function financeTone(status: string): StatusTone {
  if (["Paid", "Received", "Approved", "Applied", "Available", "Settled", "Eligible", "Preauthorization approved", "Matched", "Reconciled placeholder", "Posted placeholder", "Printed"].includes(status)) return "success";
  if (["Draft", "Pending", "Ready to bill", "Requested", "Under review", "Partially paid", "Partially adjusted", "Open", "Preauthorization submitted", "Claim submitted", "Query raised", "Pending approval", "Eligibility pending"].includes(status)) return "warning";
  if (["Rejected", "Cancelled", "Failed placeholder", "Reversed placeholder", "Refunded", "Preauthorization rejected", "Unmatched", "Credit note placeholder"].includes(status)) return "danger";
  if (["Overdue", "Short settled", "Write-off requested placeholder", "Disputed", "Rejected", "Blocked placeholder", "Variance"].includes(status)) return "critical";
  if (["Finalized", "Issued", "Revised", "Split payment", "Partially settled", "Active", "Over limit", "Resubmitted", "Under review"].includes(status)) return "info";
  return "muted";
}

export function FinanceStatus({ status }: { status: string }) {
  return <StatusPill tone={financeTone(status)}>{status}</StatusPill>;
}

export function FinanceSafetyBanner({ module }: { module: FinanceModule }) {
  const text =
    module === "billing"
      ? "Finalizing bills, rate overrides, invoice cancellation, payments, refunds, discounts, and package closure require reason, permission, and audit placeholders."
      : module === "finance"
        ? "Ledger posting, GST export, expense approval, cash close, and bank matching are placeholders and must preserve unmatched/variance states."
        : "Eligibility, preauthorization, claim submission, rejection correction, settlement shortfall, and package mapping are placeholders for future payer integrations.";
  return <AlertBanner icon={ShieldAlert} tone="warning" title="Financial governance">{text}</AlertBanner>;
}

export function AmountWarning({ children }: { children: React.ReactNode }) {
  return <AlertBanner icon={AlertTriangle} tone="critical" title="Amount / approval warning">{children}</AlertBanner>;
}

export function BillingPatientHeader({
  bill,
  title,
}: {
  bill: BillingRecord;
  title: string;
}) {
  const patient = getPatientById(bill.patientId);
  if (!patient) return <EmptyState icon={UserRound} title="Patient not found" description="Static patient context is unavailable for this bill." />;
  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted">
            <ReceiptText className="h-5 w-5 text-muted-foreground" />
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
        <div className="grid gap-2 text-xs sm:grid-cols-2 xl:min-w-[560px]">
          <div className="rounded-md border border-border bg-surface-muted p-2">Workspace: {title}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Bill: {bill.billNo} • {bill.source}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Payer: {bill.payerType}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Due: ₹{bill.dueAmount.toLocaleString("en-IN")}</div>
        </div>
        <Button size="sm" variant="outline" asChild><Link href={`/emr/patients/${bill.patientId}/timeline`}>Audit/EMR handoff</Link></Button>
      </CardContent>
    </Card>
  );
}

export function PayerContextCard({ payerId }: { payerId?: string }) {
  const payer = payerId ? mockInsuranceCompanies.find((item) => item.id === payerId) : undefined;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold"><Landmark className="h-4 w-4" />Payer context</div>
        <div className="grid gap-2 text-xs">
          <div className="rounded-md bg-surface-muted p-2">Payer: {payer?.name ?? "Self / package / TPA placeholder"}</div>
          <div className="rounded-md bg-surface-muted p-2">Tariff: {payer?.tariff ?? "Hospital default tariff"}</div>
          <div className="rounded-md bg-surface-muted p-2">Contract: {payer?.contractStatus ?? "Not applicable"}</div>
        </div>
      </CardContent>
    </Card>
  );
}
