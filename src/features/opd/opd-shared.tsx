"use client";

import Link from "next/link";
import { AlertTriangle, ClipboardCheck, HeartPulse, LockKeyhole, Printer, Stethoscope } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { DetailRow } from "@/features/admin/admin-shared";
import { OperationalStatus } from "@/features/appointments/appointment-shared";
import { PatientAlertChips } from "@/features/patients/patient-shared";
import { getPatientById } from "@/data/patients";
import { mockAllergies, mockVitals } from "@/data/opd";
import type { ConsultationRecord, ConsultationStatus, Role, StatusTone } from "@/types";

export const opdAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Technician", "Management"];
export const opdReadOnlyRoles: Role[] = ["Hospital Admin", "Receptionist", "Pharmacist", "Lab Technician", "Management"];

export function useOpdAccess() {
  const { role } = useRole();
  return {
    role,
    allowed: opdAccessRoles.includes(role),
    readOnly: opdReadOnlyRoles.includes(role),
    vitalsOnly: role === "Nurse",
  };
}

export function ProtectedOpd({ children }: { children: (state: { role: Role; readOnly: boolean; vitalsOnly: boolean }) => React.ReactNode }) {
  const access = useOpdAccess();
  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="OPD permission required" description="Your current static role cannot access OPD clinical workflows." />;
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only clinical access">
          {access.role} can review OPD records in this static preview, but clinical save and completion actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly, vitalsOnly: access.vitalsOnly })}
    </div>
  );
}

export function clinicalTone(status: string): StatusTone {
  if (["Completed", "Printed", "Normal", "Active", "Administered", "Controlled"].includes(status)) return "success";
  if (["In progress", "Draft saved", "Due", "Overdue", "Abnormal", "Moderate", "Warning", "Needs review"].includes(status)) return "warning";
  if (["Critical", "Severe", "Missing", "Not started", "Contraindicated placeholder"].includes(status)) return "danger";
  if (["Revised placeholder", "Addendum placeholder"].includes(status)) return "critical";
  return "info";
}

export function ClinicalStatus({ status }: { status: string }) {
  return <StatusPill tone={clinicalTone(status)}>{status}</StatusPill>;
}

export function ConsultationStateBadge({ status }: { status: ConsultationStatus }) {
  return <ClinicalStatus status={status} />;
}

export function ClinicalPatientHeader({
  patientId,
  token,
  appointmentTime,
  consultation,
}: {
  patientId: string;
  token?: string;
  appointmentTime?: string;
  consultation?: ConsultationRecord;
}) {
  const patient = getPatientById(patientId);
  const latestVitals = mockVitals.find((vital) => vital.patientId === patientId);
  const allergies = mockAllergies.filter((allergy) => allergy.patientId === patientId && allergy.status === "Active");
  if (!patient) return null;
  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold">{patient.firstName} {patient.lastName}</div>
            <Badge tone="muted">{patient.uhid}</Badge>
            <Badge tone="info">{patient.age}/{patient.gender}</Badge>
            {token ? <Badge tone="warning">Token {token}</Badge> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <PatientAlertChips alerts={patient.alertFlags} />
            {allergies.map((allergy) => <Badge key={allergy.id} tone={allergy.severity === "Critical" || allergy.severity === "Severe" ? "danger" : "warning"}>{allergy.allergen} allergy</Badge>)}
          </div>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-2 xl:min-w-[420px]">
          <div className="rounded-md border border-border bg-surface-muted p-2">Appt: {appointmentTime ?? "Not linked"}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Vitals: {latestVitals ? `${latestVitals.bloodPressure}, SpO2 ${latestVitals.spo2}` : "Missing"}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Last visit: {patient.lastVisitAt}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">State: {consultation ? consultation.status : "Not started"}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClinicalSafetyPanel({ patientId }: { patientId: string }) {
  const vitals = mockVitals.find((vital) => vital.patientId === patientId);
  const allergies = mockAllergies.filter((allergy) => allergy.patientId === patientId && allergy.status === "Active");
  return (
    <div className="space-y-2">
      {allergies.length ? (
        <AlertBanner icon={AlertTriangle} tone="danger" title="Allergy warning visible during prescribing">
          {allergies.map((allergy) => `${allergy.allergen}: ${allergy.reaction}`).join("; ")}
        </AlertBanner>
      ) : null}
      {vitals && vitals.status !== "Normal" ? (
        <AlertBanner icon={HeartPulse} tone={vitals.status === "Critical" ? "critical" : "warning"} title={`${vitals.status} vitals`}>
          BP {vitals.bloodPressure}, pulse {vitals.pulse}, SpO2 {vitals.spo2}. Unit and reference range placeholders are shown in vitals.
        </AlertBanner>
      ) : null}
    </div>
  );
}

export function CompletionChecklist() {
  const items = ["Chief complaint recorded", "Diagnosis selected", "Prescription or no-medicine note", "Follow-up advice", "Vitals reviewed", "Handoff targets confirmed"];
  return (
    <Card>
      <CardContent className="space-y-2 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="h-4 w-4" />Completion checklist</div>
        {items.map((item, index) => (
          <div key={item} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
            <span>{item}</span>
            <OperationalStatus status={index < 3 ? "Completed" : "Pending"} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ClinicalPrintActions() {
  return (
    <>
      <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print prescription</Button>
      <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print summary</Button>
    </>
  );
}

export function ClinicalLinkBar() {
  const links = [
    ["/opd/notes", "Notes"],
    ["/opd/diagnosis", "Diagnosis"],
    ["/opd/prescriptions", "Prescription"],
    ["/opd/vitals", "Vitals"],
    ["/opd/allergies", "Allergies"],
    ["/opd/templates", "Templates"],
  ];
  return (
    <Card>
      <CardContent className="flex flex-wrap gap-2 p-3">
        {links.map(([href, label]) => <Button key={href} variant="outline" size="sm" asChild><Link href={href}>{label}</Link></Button>)}
      </CardContent>
    </Card>
  );
}

export function VisitContext({ consultation }: { consultation: ConsultationRecord }) {
  return (
    <Card>
      <CardContent className="grid gap-2 p-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <DetailRow label="Visit" value={consultation.visitId} />
        <DetailRow label="Department" value={consultation.department} />
        <DetailRow label="Doctor" value={consultation.doctor} />
        <DetailRow label="Status" value={<ConsultationStateBadge status={consultation.status} />} />
      </CardContent>
    </Card>
  );
}

export function OpdIcon() {
  return <Stethoscope className="h-4 w-4" />;
}
