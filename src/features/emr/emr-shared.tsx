"use client";

import Link from "next/link";
import { AlertTriangle, FileText, LockKeyhole, Printer, ShieldAlert, UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { PatientAlertChips, PatientStatusBadge } from "@/features/patients/patient-shared";
import { cn } from "@/lib/utils";
import { getPatientById } from "@/data/patients";
import { getEmrEncountersByPatient, mockClinicalTimeline } from "@/data/emr";
import type {
  ClinicalRecordStatus,
  DigitalSignatureStatus,
  EmrEncounter,
  Role,
  SensitivityLevel,
  StatusTone,
} from "@/types";

export const emrAccessRoles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Doctor",
  "Nurse",
  "Receptionist",
  "Billing Executive",
  "Lab Technician",
  "Radiologist",
  "Pharmacist",
  "Management",
];

export const emrReadOnlyRoles: Role[] = [
  "Hospital Admin",
  "Receptionist",
  "Billing Executive",
  "Lab Technician",
  "Radiologist",
  "Pharmacist",
  "Management",
];

export function useEmrAccess() {
  const { role } = useRole();
  return {
    role,
    allowed: emrAccessRoles.includes(role),
    readOnly: emrReadOnlyRoles.includes(role),
  };
}

export function ProtectedEmr({ children }: { children: (state: { role: Role; readOnly: boolean }) => React.ReactNode }) {
  const access = useEmrAccess();
  if (!access.allowed) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="EMR/EHR permission required"
        description="Your current static role cannot access clinical continuity records. Switch to an allowed care or governance role to preview Phase 7."
      />
    );
  }

  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only record access">
          {access.role} can review allowed EMR/EHR records in this static preview. Addendum, verification, signature, and disclosure actions are disabled or reason-gated.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function emrTone(status: string): StatusTone {
  if (["Completed", "Signed placeholder", "Verified", "Current", "Allowed", "Approved placeholder", "Shared placeholder", "Available"].includes(status)) return "success";
  if (["Draft", "Pending", "Pending verification", "Consent required", "Approval pending", "Reason required placeholder", "Uploaded"].includes(status)) return "warning";
  if (["Rejected", "Rejected placeholder", "Cancelled", "Denied placeholder", "Expired", "Expired certificate placeholder", "Archived"].includes(status)) return "danger";
  if (["Legal hold placeholder", "Break-glass placeholder", "Restricted", "Critical"].includes(status)) return "critical";
  if (["Sensitive", "Consent-gated placeholder", "Addendum", "Addendum placeholder", "Revised placeholder", "Superseded", "Superseded placeholder"].includes(status)) return "info";
  if (["Not required", "Normal", "Previous", "Archived placeholder", "Masked", "Not applicable"].includes(status)) return "muted";
  return "info";
}

export function EmrStatus({ status }: { status: string }) {
  return <StatusPill tone={emrTone(status)}>{status}</StatusPill>;
}

export function SensitivityBadge({ sensitivity }: { sensitivity: SensitivityLevel }) {
  const iconRequired = sensitivity !== "Normal";
  return (
    <StatusPill tone={emrTone(sensitivity)}>
      <span className="inline-flex items-center gap-1">
        {iconRequired ? <ShieldAlert className="h-3 w-3" /> : null}
        {sensitivity}
      </span>
    </StatusPill>
  );
}

export function SignatureBadge({ status }: { status: DigitalSignatureStatus }) {
  return <EmrStatus status={status} />;
}

export function RecordStatusBadge({ status }: { status: ClinicalRecordStatus }) {
  return <EmrStatus status={status} />;
}

export function PatientRecordHeader({
  patientId,
  title = "Clinical record",
  compact,
}: {
  patientId: string;
  title?: string;
  compact?: boolean;
}) {
  const patient = getPatientById(patientId);
  const encounters = getEmrEncountersByPatient(patientId);
  const lastEncounter = encounters[0];
  const highSensitivity = encounters.find((item) => item.sensitivity !== "Normal")?.sensitivity ?? "Normal";

  if (!patient) {
    return <EmptyState icon={UserRound} title="Patient not found" description="The selected static patient is not available in the Phase 7 EMR data." />;
  }

  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted">
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-foreground">{patient.firstName} {patient.lastName}</span>
              <Badge tone="muted">{patient.uhid}</Badge>
              <Badge tone="info">{patient.age}/{patient.gender}</Badge>
              <PatientStatusBadge status={patient.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PatientAlertChips alerts={patient.alertFlags} />
              <SensitivityBadge sensitivity={highSensitivity} />
            </div>
          </div>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-2 xl:min-w-[440px]">
          <div className="rounded-md border border-border bg-surface-muted p-2">Workspace: {title}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Last encounter: {lastEncounter?.encounterNo ?? patient.lastVisitAt}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">ABHA: {patient.abhaStatus}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Records: {encounters.length} encounters</div>
        </div>
        {!compact ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild><Link href={`/ehr/patients/${patientId}`}>EHR</Link></Button>
            <Button size="sm" variant="outline" asChild><Link href={`/emr/patients/${patientId}/timeline`}>Timeline</Link></Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PrivacyWarning({ label = "Print/export and restricted record actions are placeholders only." }: { label?: string }) {
  return (
    <AlertBanner icon={ShieldAlert} tone="warning" title="Privacy and audit warning">
      {label} Sensitive records require reason capture, consent checks, and future audit logging before real sharing or download.
    </AlertBanner>
  );
}

export function BreakGlassWarning() {
  return (
    <AlertBanner icon={AlertTriangle} tone="critical" title="Break-glass placeholder">
      Restricted emergency access is shown for UI readiness only. Production access must capture reason, permission, session, IP, device, and immutable audit trail.
    </AlertBanner>
  );
}

export function RecordMetricStrip({ patientId }: { patientId?: string }) {
  const encounters = patientId ? getEmrEncountersByPatient(patientId) : [];
  const source = patientId ? encounters : [];
  const timeline = patientId ? mockClinicalTimeline.filter((item) => item.patientId === patientId) : mockClinicalTimeline;
  const metrics = [
    ["Events", timeline.length],
    ["Restricted", timeline.filter((item) => item.sensitivity === "Restricted" || item.sensitivity === "Break-glass placeholder").length],
    ["Legal hold", source.filter((item) => item.legalHold).length],
    ["Pending signatures", source.filter((item) => item.signatureStatus === "Pending").length],
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border bg-surface-muted p-3">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
        </div>
      ))}
    </div>
  );
}

export function EncounterSummaryCard({
  encounter,
  onOpen,
  className,
}: {
  encounter: EmrEncounter;
  onOpen?: (encounter: EmrEncounter) => void;
  className?: string;
}) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-foreground">{encounter.encounterNo}</div>
            <div className="mt-1 text-xs text-muted-foreground">{encounter.encounterType} • {encounter.department} • {encounter.provider}</div>
          </div>
          <RecordStatusBadge status={encounter.status} />
        </div>
        <p className="text-sm text-muted-foreground">{encounter.summary}</p>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-md bg-surface-muted p-2">Diagnosis: {encounter.diagnosisSummary}</div>
          <div className="rounded-md bg-surface-muted p-2">Rx: {encounter.prescriptionSummary}</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <SensitivityBadge sensitivity={encounter.sensitivity} />
          <SignatureBadge status={encounter.signatureStatus} />
          <EmrStatus status={encounter.versionState} />
          {encounter.legalHold ? <Badge tone="critical">Legal hold</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onOpen?.(encounter)}>
            <FileText className="h-3.5 w-3.5" />
            Details
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button size="sm" variant="outline" asChild><Link href={`/emr/patients/${encounter.patientId}/timeline`}>Timeline</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}
