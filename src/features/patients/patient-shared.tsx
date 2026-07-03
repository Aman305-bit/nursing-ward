"use client";

import Link from "next/link";
import { AlertTriangle, Baby, FileText, HeartPulse, IdCard, LockKeyhole, Printer, ShieldAlert, UserRound } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { useRole } from "@/components/providers/role-provider";
import type { PatientRecord, Role, StatusTone } from "@/types";

export const patientAccessRoles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Receptionist",
  "Doctor",
  "Nurse",
  "Billing Executive",
  "Lab Technician",
  "Radiologist",
  "Management",
];

export const patientReadOnlyRoles: Role[] = ["Doctor", "Nurse", "Billing Executive", "Lab Technician", "Radiologist", "Management"];

export function usePatientAccess() {
  const { role } = useRole();
  return {
    role,
    allowed: patientAccessRoles.includes(role),
    readOnly: patientReadOnlyRoles.includes(role),
  };
}

export function ProtectedPatient({ children }: { children: (state: { role: Role; readOnly: boolean }) => React.ReactNode }) {
  const access = usePatientAccess();
  if (!access.allowed) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="Patient permission required"
        description="Your current static role cannot access patient identity workflows. Switch to a patient-facing role to preview Phase 3."
      />
    );
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only patient access">
          {access.role} can review patient records in this static preview, but registration and sensitive edit actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function patientStatusTone(status: PatientRecord["status"]): StatusTone {
  if (status === "Active") return "success";
  if (status === "Unknown emergency" || status === "Duplicate review") return "warning";
  if (status === "Deceased" || status === "Archived placeholder") return "danger";
  if (status === "Merged placeholder") return "critical";
  return "muted";
}

export function PatientStatusBadge({ status }: { status: PatientRecord["status"] }) {
  return <StatusPill tone={patientStatusTone(status)}>{status}</StatusPill>;
}

export function PatientAlertChips({ alerts }: { alerts: string[] }) {
  if (!alerts.length) return <Badge tone="muted">No alerts</Badge>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {alerts.map((alert) => (
        <Badge key={alert} tone={alert.includes("Allergy") || alert.includes("Unknown") || alert.includes("Deceased") ? "danger" : alert.includes("VIP") ? "info" : "warning"}>
          {alert}
        </Badge>
      ))}
    </div>
  );
}

export function PatientHeader({
  patient,
  title = "Patient Profile",
  description = "Patient identity, safety flags, and Phase 3 management context.",
}: {
  patient: PatientRecord;
  title?: string;
  description?: string;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Phase 3 • Patient Management"
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button asChild>
              <Link href={`/patients/${patient.id}`}>Open profile</Link>
            </Button>
          </>
        }
      />
      <Card className="sticky top-[132px] z-20">
        <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-foreground">{patient.firstName} {patient.lastName}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>UHID {patient.uhid}</span>
                <span>{patient.age}/{patient.gender}</span>
                <span>{patient.maskedMobile}</span>
                <span>{patient.department}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PatientStatusBadge status={patient.status} />
            <Badge tone={patient.abhaStatus === "Linked" ? "success" : "warning"}>{patient.abhaStatus}</Badge>
            <Badge tone={patient.identityCompleteness > 85 ? "success" : "warning"}>{patient.identityCompleteness}% identity</Badge>
          </div>
        </CardContent>
      </Card>
      <PatientSafetyBanners patient={patient} />
    </>
  );
}

export function PatientSafetyBanners({ patient }: { patient: PatientRecord }) {
  return (
    <div className="space-y-2">
      {patient.status === "Unknown emergency" ? (
        <AlertBanner icon={AlertTriangle} tone="warning" title="Unknown emergency identity">
          This record is incomplete and must be converted to a regular patient after identity confirmation and duplicate check.
        </AlertBanner>
      ) : null}
      {patient.status === "Deceased" ? (
        <AlertBanner icon={ShieldAlert} tone="danger" title="Deceased patient record">
          This patient record is read-only except authorized administrative updates. Scheduling and new visits are blocked.
        </AlertBanner>
      ) : null}
      {patient.guardianRequired ? (
        <AlertBanner icon={Baby} tone="warning" title="Guardian consent required">
          Minor patient workflows require guardian details and consent before linked actions.
        </AlertBanner>
      ) : null}
    </div>
  );
}

export function PatientNotFound() {
  return <EmptyState icon={IdCard} title="Patient not found" description="The static patient record does not exist or is not included in the Phase 3 seed data." />;
}

export function PatientInfoCard({ title, value, meta, icon: Icon = FileText }: { title: string; value: React.ReactNode; meta?: string; icon?: typeof FileText }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-3">
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
          {meta ? <div className="mt-1 text-xs text-muted-foreground">{meta}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientPrivacyNote() {
  return (
    <AlertBanner icon={HeartPulse} tone="info" title="Patient privacy preview">
      Sensitive identifiers are masked. Document previews, ABHA verification, portal access, and merge actions are static placeholders only.
    </AlertBanner>
  );
}
