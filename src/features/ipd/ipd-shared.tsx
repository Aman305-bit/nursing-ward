"use client";

import { AlertTriangle, BedDouble, LockKeyhole, ShieldAlert, UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { PatientAlertChips } from "@/features/patients/patient-shared";
import { getPatientById } from "@/data/patients";
import { mockInfectionIsolationFlags } from "@/data/ipd";
import type { AdmissionRecord, BedRecord, Role, StatusTone, TriagePriority } from "@/types";

export const ipdAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Pharmacist", "Management"];
export const ipdReadOnlyRoles: Role[] = ["Management", "Pharmacist"];

export function useIpdAccess() {
  const { role } = useRole();
  return { role, allowed: ipdAccessRoles.includes(role), readOnly: ipdReadOnlyRoles.includes(role) };
}

export function ProtectedIpd({ children }: { children: (state: { role: Role; readOnly: boolean }) => React.ReactNode }) {
  const access = useIpdAccess();
  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="IPD/Emergency permission required" description="Your current static role cannot access Phase 6 inpatient or emergency workflows." />;
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only inpatient access">
          {access.role} can review inpatient and emergency records, but high-impact actions are disabled in this static preview.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function ipdTone(status: string): StatusTone {
  if (["Available", "Completed", "Administered", "Discharged", "Approved", "Arrived", "Paid placeholder", "Active"].includes(status)) return "success";
  if (["Requested", "Reserved", "Cleaning", "Pending", "Due", "Due now", "Discharge initiated", "Triage pending", "Assigned", "Dispatched", "Nearing limit"].includes(status)) return "warning";
  if (["Overdue", "Missed", "Refused", "Delayed", "Maintenance", "Blocked", "Cancelled", "Deceased placeholder"].includes(status)) return "danger";
  if (["In ICU", "Isolation", "Red: immediate", "Orange: very urgent", "Critical", "Stabilizing"].includes(status)) return "critical";
  return "info";
}

export function IpdStatus({ status }: { status: string }) {
  return <StatusPill tone={ipdTone(status)}>{status}</StatusPill>;
}

export function TriageBadge({ priority }: { priority: TriagePriority | string }) {
  return <StatusPill tone={ipdTone(priority)}>{priority}</StatusPill>;
}

export function InpatientHeader({ admission }: { admission: AdmissionRecord }) {
  const patient = getPatientById(admission.patientId);
  const isolation = mockInfectionIsolationFlags.find((flag) => flag.patientId === admission.patientId);
  if (!patient) return null;
  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg border border-border bg-surface-muted p-3"><UserRound className="h-5 w-5 text-muted-foreground" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{patient.firstName} {patient.lastName}</span>
              <Badge tone="muted">{patient.uhid}</Badge>
              <Badge tone="info">{patient.age}/{patient.gender}</Badge>
              <Badge tone="warning">{admission.admissionNo}</Badge>
            </div>
            <div className="mt-2"><PatientAlertChips alerts={patient.alertFlags} /></div>
          </div>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-2 xl:min-w-[420px]">
          <div className="rounded-md border border-border bg-surface-muted p-2">Bed: {admission.bedId}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Ward: {admission.ward}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Consultant: {admission.consultant}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Status: {admission.status}</div>
        </div>
        {isolation ? <Badge tone="critical">{isolation.type}</Badge> : null}
      </CardContent>
    </Card>
  );
}

export function BedCard({ bed, onAction }: { bed: BedRecord; onAction?: (bed: BedRecord) => void }) {
  const patient = bed.patientId ? getPatientById(bed.patientId) : undefined;
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold">{bed.bedNo}</div>
            <div className="text-xs text-muted-foreground">{bed.ward} • {bed.roomNo} • {bed.bedType}</div>
          </div>
          <IpdStatus status={bed.status} />
        </div>
        {patient ? <div className="rounded-md bg-surface-muted p-2 text-xs">{patient.firstName} {patient.lastName} • {patient.uhid}</div> : null}
        <div className="text-xs text-muted-foreground">{bed.statusReason}</div>
        <div className="flex flex-wrap gap-1">
          {bed.isIsolationCapable ? <Badge tone="critical">Isolation capable</Badge> : null}
          <Badge tone="muted">{bed.genderRestriction}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => onAction?.(bed)}><BedDouble className="h-3.5 w-3.5" />Actions</Button>
      </CardContent>
    </Card>
  );
}

export function InpatientSafetyPanel({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  const isolation = mockInfectionIsolationFlags.find((flag) => flag.patientId === patientId);
  return (
    <div className="space-y-2">
      {patient?.alertFlags.length ? (
        <AlertBanner icon={ShieldAlert} tone="warning" title="Patient safety context">
          {patient.alertFlags.join(", ")}. These alerts remain visible across nursing, MAR, bed, and emergency workflows.
        </AlertBanner>
      ) : null}
      {isolation ? (
        <AlertBanner icon={AlertTriangle} tone="critical" title="Isolation / infection risk">
          {isolation.type}: {isolation.notes}
        </AlertBanner>
      ) : null}
    </div>
  );
}
