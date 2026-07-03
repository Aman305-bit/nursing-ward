"use client";

import Link from "next/link";
import { AlertTriangle, Barcode, FlaskConical, LockKeyhole, ScanSearch, ShieldAlert, UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { PatientAlertChips, PatientStatusBadge } from "@/features/patients/patient-shared";
import { getPatientById } from "@/data/patients";
import { getLabOrderById, getRadiologyOrderById, mockSampleCollections } from "@/data/diagnostics";
import type { Role, StatusTone } from "@/types";

export const diagnosticsAccessRoles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Doctor",
  "Nurse",
  "Receptionist",
  "Lab Technician",
  "Radiologist",
  "Billing Executive",
  "Management",
];

export const labFullAccessRoles: Role[] = ["Super Admin", "Lab Technician"];
export const radiologyFullAccessRoles: Role[] = ["Super Admin", "Radiologist"];
export const diagnosticsReadOnlyRoles: Role[] = ["Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Management"];

export function useDiagnosticsAccess(module: "lab" | "radiology" = "lab") {
  const { role } = useRole();
  const full = module === "lab" ? labFullAccessRoles : radiologyFullAccessRoles;
  return {
    role,
    allowed: diagnosticsAccessRoles.includes(role),
    readOnly: !full.includes(role),
  };
}

export function ProtectedDiagnostics({
  module = "lab",
  children,
}: {
  module?: "lab" | "radiology";
  children: (state: { role: Role; readOnly: boolean }) => React.ReactNode;
}) {
  const access = useDiagnosticsAccess(module);
  if (!access.allowed) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="Diagnostics permission required"
        description="Your current static role cannot access Phase 8 laboratory or radiology workflows."
      />
    );
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only diagnostics access">
          {access.role} can review diagnostic status, approved reports, and safety states in this static preview, but collection, approval, correction, and integration actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function diagnosticTone(status: string): StatusTone {
  if (["Approved", "Report printed", "Collected", "Received", "Stored", "Completed", "PACS synced placeholder", "Image available placeholder", "Active", "Online placeholder", "Done"].includes(status)) return "success";
  if (["Ordered", "Sample pending", "Pending collection", "Result pending", "Draft", "Approval pending", "Scheduled", "PACS sync pending", "Study pending", "Pending", "Consent pending", "Safety checklist pending"].includes(status)) return "warning";
  if (["Rejected", "Cancelled", "Offline", "Sync failed placeholder", "Image unavailable", "Lost/damaged placeholder", "Hemolyzed/clotted placeholder", "Quantity not sufficient placeholder", "Correction requested", "Blocked placeholder", "Failed/prep incomplete"].includes(status)) return "danger";
  if (["Critical", "Critical low", "Critical high", "Emergency", "STAT placeholder", "Escalated"].includes(status)) return "critical";
  if (["Abnormal", "High", "Low", "Corrected placeholder", "Addendum placeholder", "Superseded placeholder", "Image acquired placeholder", "Report draft", "In progress", "Processing", "In processing"].includes(status)) return "info";
  return "muted";
}

export function DiagnosticStatus({ status }: { status: string }) {
  return <StatusPill tone={diagnosticTone(status)}>{status}</StatusPill>;
}

export function DiagnosticSafetyBanner({ type = "diagnostics" }: { type?: "diagnostics" | "lab" | "radiology" | "viewer" }) {
  const text =
    type === "viewer"
      ? "DICOM viewer and PACS image states are placeholders. No diagnostic image is rendered or interpreted in Phase 8."
      : type === "radiology"
        ? "Contrast, consent, preparation, implant, and checklist states must be reviewed before imaging workflow actions."
        : type === "lab"
          ? "Barcode, sample custody, rejection, critical values, correction, and approval states are placeholders for future LIS governance."
          : "Print/export, EMR handoff, report versioning, and critical alert actions are static UI placeholders.";
  return <AlertBanner icon={ShieldAlert} tone="warning" title="Diagnostic safety">{text}</AlertBanner>;
}

export function CriticalBanner({ children }: { children: React.ReactNode }) {
  return <AlertBanner icon={AlertTriangle} tone="critical" title="Critical result / finding">{children}</AlertBanner>;
}

export function DiagnosticOrderHeader({
  labOrderId,
  radiologyOrderId,
}: {
  labOrderId?: string;
  radiologyOrderId?: string;
}) {
  const labOrder = labOrderId ? getLabOrderById(labOrderId) : undefined;
  const radiologyOrder = radiologyOrderId ? getRadiologyOrderById(radiologyOrderId) : undefined;
  const order = labOrder ?? radiologyOrder;
  const patient = order ? getPatientById(order.patientId) : undefined;
  const sample = labOrder ? mockSampleCollections.find((item) => item.orderId === labOrder.id) : undefined;

  if (!order || !patient) {
    return <EmptyState icon={UserRound} title="Order context not found" description="The selected static diagnostic order is not available." />;
  }

  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted">
            {labOrder ? <FlaskConical className="h-5 w-5 text-muted-foreground" /> : <ScanSearch className="h-5 w-5 text-muted-foreground" />}
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
          <div className="rounded-md border border-border bg-surface-muted p-2">Order: {order.orderNo}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Source: {order.source} • {order.priority}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">
            Status: {labOrder ? labOrder.status : radiologyOrder?.scheduleStatus}
          </div>
          <div className="rounded-md border border-border bg-surface-muted p-2">
            {sample ? `Barcode: ${sample.barcode}` : `Study: ${radiologyOrder?.study}`}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild><Link href={`/emr/patients/${patient.id}/timeline`}>EMR timeline</Link></Button>
          {sample ? <Badge tone="info" className="gap-1"><Barcode className="h-3 w-3" />{sample.status}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function BarcodePreview({ barcode, orderNo, patientName, sampleType }: { barcode: string; orderNo: string; patientName: string; sampleType: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold">{orderNo}</span>
        <span>{sampleType}</span>
      </div>
      <div className="flex h-16 items-end justify-center gap-1 rounded-md bg-surface-muted p-3" aria-label={`Barcode ${barcode}`}>
        {Array.from({ length: 26 }).map((_, index) => (
          <span key={index} className="block bg-foreground" style={{ height: `${18 + (index % 5) * 7}px`, width: index % 4 === 0 ? "3px" : "2px" }} />
        ))}
      </div>
      <div className="mt-2 text-center text-xs font-semibold tracking-wide">{barcode}</div>
      <div className="mt-1 text-center text-xs text-muted-foreground">{patientName}</div>
    </div>
  );
}
