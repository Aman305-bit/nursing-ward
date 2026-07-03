"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, LockKeyhole, Printer, UserRound } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/ui/status-pill";
import { useRole } from "@/components/providers/role-provider";
import { DetailRow, SecurityNote } from "@/features/admin/admin-shared";
import { PatientAlertChips } from "@/features/patients/patient-shared";
import { getPatientById, mockPatientVisits } from "@/data/patients";
import { mockQueueEntries, mockTokens } from "@/data/appointments";
import type { AppointmentRecord, DelayLevel, OperationalPriority, Role, StatusTone } from "@/types";

export const appointmentAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Receptionist", "Doctor", "Nurse", "Billing Executive", "Management"];
export const appointmentReadOnlyRoles: Role[] = ["Doctor", "Nurse", "Billing Executive", "Management"];

export function useAppointmentAccess() {
  const { role } = useRole();
  return {
    role,
    allowed: appointmentAccessRoles.includes(role),
    readOnly: appointmentReadOnlyRoles.includes(role),
  };
}

export function ProtectedAppointment({ children }: { children: (state: { role: Role; readOnly: boolean }) => React.ReactNode }) {
  const access = useAppointmentAccess();
  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="Appointment permission required" description="Your current static role cannot access Phase 4 scheduling and front-office workflows." />;
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only operational access">
          {access.role} can review appointment, queue, and front-office data, but status-changing actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function operationalTone(status: string): StatusTone {
  if (["Completed", "Confirmed", "Paid", "Available", "Active", "Ready to join", "Signed"].includes(status)) return "success";
  if (["Waiting", "Late", "Due today", "Link pending", "Pending", "Held", "On hold", "Approaching delay"].includes(status)) return "warning";
  if (["Cancelled", "No-show", "Skipped", "Expired", "Failed/no-show", "Missing", "Delayed"].includes(status)) return "danger";
  if (["Emergency", "Critical delay", "In consultation", "Serving", "In call placeholder"].includes(status)) return "critical";
  if (["Checked in", "Called", "Issued", "Scheduled", "Rescheduled", "Overbook allowed"].includes(status)) return "info";
  return "muted";
}

export function OperationalStatus({ status }: { status: string }) {
  return <StatusPill tone={operationalTone(status)}>{status}</StatusPill>;
}

export function PriorityBadge({ priority }: { priority: OperationalPriority }) {
  return <StatusPill tone={priority === "Emergency" ? "critical" : priority === "Urgent" || priority === "VIP" ? "warning" : "muted"}>{priority}</StatusPill>;
}

export function DelayBadge({ delay }: { delay: DelayLevel }) {
  return <StatusPill tone={operationalTone(delay)}>{delay}</StatusPill>;
}

export function patientName(patientId: string) {
  const patient = getPatientById(patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient";
}

export function patientUhid(patientId: string) {
  return getPatientById(patientId)?.uhid ?? "Unknown";
}

export function PatientMini({ patientId, compact = false }: { patientId: string; compact?: boolean }) {
  const patient = getPatientById(patientId);
  if (!patient) return <span>Unknown patient</span>;
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="truncate font-medium">{patient.firstName} {patient.lastName}</span>
        {!compact ? <Badge tone="muted">{patient.uhid}</Badge> : null}
      </div>
      {!compact ? <div className="mt-1 text-xs text-muted-foreground">{patient.age}/{patient.gender} • {patient.maskedMobile}</div> : null}
    </div>
  );
}

export function AppointmentDetailDrawer({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const patient = appointment ? getPatientById(appointment.patientId) : undefined;
  const token = appointment?.tokenId ? mockTokens.find((item) => item.id === appointment.tokenId) : undefined;
  const queue = appointment ? mockQueueEntries.find((item) => item.appointmentId === appointment.id) : undefined;
  const visits = appointment ? mockPatientVisits.filter((item) => item.patientId === appointment.patientId) : [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={appointment?.appointmentNo ?? "Appointment"} description="Appointment, patient, queue, communication, and audit context.">
      {appointment && patient ? (
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <DetailRow label="Time" value={`${appointment.date} ${appointment.startTime}-${appointment.endTime}`} />
            <DetailRow label="Status" value={<OperationalStatus status={appointment.status} />} />
            <DetailRow label="Doctor" value={appointment.doctor} />
            <DetailRow label="Department" value={appointment.department} />
            <DetailRow label="Reason" value={appointment.reason} />
            <div className="mt-3"><PatientAlertChips alerts={patient.alertFlags} /></div>
          </TabsContent>
          <TabsContent value="patient">
            <DetailRow label="Patient" value={`${patient.firstName} ${patient.lastName}`} />
            <DetailRow label="UHID" value={patient.uhid} />
            <DetailRow label="Contact" value={patient.maskedMobile} />
            <DetailRow label="Last visit" value={visits[0]?.summary ?? "No visit summary"} />
            <Button className="mt-3" asChild variant="outline"><Link href={`/patients/${patient.id}`}>Open patient profile</Link></Button>
          </TabsContent>
          <TabsContent value="queue">
            <DetailRow label="Token" value={token?.tokenNo ?? "Not issued"} />
            <DetailRow label="Queue" value={queue ? <OperationalStatus status={queue.status} /> : "Not in queue"} />
            <DetailRow label="Counter" value={appointment.counter} />
            <DetailRow label="Room" value={appointment.room} />
            <DetailRow label="Wait" value={queue?.waitingSince ?? "Not checked in"} />
          </TabsContent>
          <TabsContent value="communication">
            <DetailRow label="SMS" value="Reminder placeholder queued" />
            <DetailRow label="WhatsApp" value="Backend integration pending" />
            <DetailRow label="Email" value="No real message sent in Phase 4" />
          </TabsContent>
          <TabsContent value="audit">
            <DetailRow label="Created by" value={appointment.createdBy} />
            <DetailRow label="Created at" value={appointment.createdAt} />
            <DetailRow label="Status history" value="Check-in, token, reschedule, cancel events will be audited." />
            <SecurityNote />
          </TabsContent>
        </Tabs>
      ) : null}
    </Drawer>
  );
}

export function TokenBoardPreview() {
  const active = mockTokens.filter((token) => ["Called", "Serving", "Issued", "Held"].includes(token.status)).slice(0, 4);
  return (
    <Card className="bg-sidebar text-sidebar-foreground">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3 border-b border-sidebar-foreground/15 pb-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-sidebar-foreground/65">Token board preview</div>
            <div className="mt-1 text-xl font-semibold">Static display, no device integration</div>
          </div>
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {active.map((token) => (
            <div key={token.id} className="rounded-lg border border-sidebar-foreground/15 bg-sidebar-foreground/5 p-3">
              <div className="text-3xl font-semibold">{token.tokenNo}</div>
              <div className="mt-1 text-sm">{token.counter}</div>
              <div className="text-xs text-sidebar-foreground/70">{token.department} • {token.doctor}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PrintAction({ label = "Print" }: { label?: string }) {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}

export function ConflictPanel() {
  return (
    <AlertBanner icon={AlertTriangle} tone="warning" title="Operational conflict checks">
      Same-day appointment, booked slot, teleconsultation consent, room capacity, active queue entry, and duplicate patient warnings are shown as static placeholders before save.
    </AlertBanner>
  );
}

export function AppointmentPatientStrip({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return null;
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-md border border-border bg-surface-muted p-2"><UserRound className="h-4 w-4 text-muted-foreground" /></div>
          <PatientMini patientId={patientId} />
        </div>
        <PatientAlertChips alerts={patient.alertFlags} />
      </CardContent>
    </Card>
  );
}
