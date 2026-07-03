"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Bell, Clock3, CreditCard, FileText, FlaskConical, MoreHorizontal, PhoneCall, Pill, ScanSearch, ShieldAlert, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import { patientJourneyRoles, journeyStages, mockJourneyEvents } from "@/features/patient-journey/patient-journey-data";
import type { JourneyEvent, PatientJourneyPriority, PatientJourneyRecord, PatientJourneyStage, SmartAlert } from "@/features/patient-journey/patient-journey-types";
import type { StatusTone } from "@/types";

export function ProtectedPatientJourney({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  if (!patientJourneyRoles.includes(role)) {
    return <EmptyState icon={ShieldAlert} title="Patient Journey access required" description="Switch to an operational, clinical, diagnostic, billing, or management role to open the command desk." />;
  }
  return <>{children}</>;
}

export function journeyTone(status: string): StatusTone {
  if (["Completed", "Complete", "Ready", "Report Ready", "Paid", "Clear"].includes(status)) return "success";
  if (["Critical", "Critical Alert", "Blocked"].includes(status)) return "critical";
  if (["Delayed", "Discharge Pending", "Billing Pending", "Query raised"].includes(status)) return "danger";
  if (["Waiting Doctor", "Lab Pending", "Radiology Pending", "Pharmacy Pending", "Approaching delay", "Pending"].includes(status)) return "warning";
  if (["Registered", "In Consultation", "Admission Suggested"].includes(status)) return "info";
  return "muted";
}

export function priorityTone(priority: PatientJourneyPriority): StatusTone {
  if (priority === "Critical") return "critical";
  if (["Urgent", "Pregnancy", "Pediatric"].includes(priority)) return "warning";
  if (["VIP", "Senior Citizen", "Disabled"].includes(priority)) return "info";
  return "muted";
}

export function waitLabel(minutes: number) {
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function PatientJourneyCard({ patient, onOpen }: { patient: PatientJourneyRecord; onOpen: (patient: PatientJourneyRecord) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(patient)}
      className={cn(
        "w-full rounded-lg border bg-background p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-muted/70 hover:shadow-md",
        patient.status === "Critical" ? "border-critical/60 ring-1 ring-critical/20" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="info">{patient.token}</Badge>
            <Badge tone={priorityTone(patient.priority)}>{patient.priority}</Badge>
          </div>
          <div className="mt-2 truncate text-sm font-semibold text-foreground">{patient.patientName}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{patient.uhid} | {patient.ageGender}</div>
        </div>
        <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <MiniStatus icon={Clock3} label="Waiting" value={waitLabel(patient.waitingMinutes)} tone={journeyTone(patient.status)} />
        <MiniStatus icon={UserRound} label="Doctor" value={patient.doctor} />
      </div>
      <div className="mt-4 rounded-md border border-border bg-surface-muted p-3">
        <div className="text-[11px] font-medium uppercase text-muted-foreground">Next action</div>
        <div className="mt-1 text-xs font-medium text-foreground">{patient.nextAction}</div>
      </div>
      {patient.blocker ? <div className="mt-2 text-xs text-warning">{patient.blocker}</div> : null}
    </button>
  );
}

function MiniStatus({ icon: Icon, label, value, tone = "muted" }: { icon: typeof Clock3; label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-background px-2 py-1.5">
      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={cn("mt-0.5 truncate font-medium text-foreground", tone === "danger" && "text-danger", tone === "critical" && "text-critical", tone === "warning" && "text-warning")}>{value}</div>
    </div>
  );
}

export function JourneyStageColumn({ stage, patients, onOpen }: { stage: PatientJourneyStage; patients: PatientJourneyRecord[]; onOpen: (patient: PatientJourneyRecord) => void }) {
  const averageWait = patients.length ? Math.round(patients.reduce((sum, patient) => sum + patient.waitingMinutes, 0) / patients.length) : 0;
  return (
    <section className="flex h-full min-h-[560px] w-[360px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="border-b border-border bg-surface-muted/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{stage}</CardTitle>
          <Badge tone={patients.some((patient) => patient.status === "Critical") ? "critical" : patients.length ? "info" : "muted"}>{patients.length}</Badge>
        </div>
        <CardDescription>{averageWait ? `${averageWait}m average wait` : "No active patient"}</CardDescription>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-background/40 p-4">
        {patients.length ? patients.map((patient) => <PatientJourneyCard key={patient.id} patient={patient} onOpen={onOpen} />) : <div className="rounded-md border border-dashed border-border bg-surface p-6 text-center text-xs text-muted-foreground">No patients in this stage.</div>}
      </div>
    </section>
  );
}

export function PatientJourneyCenterWindow({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(86dvh,760px)] w-[min(94vw,780px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="border-b border-border bg-surface-muted/80 px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex gap-1.5">
                  <span className="h-1.5 w-10 rounded-full bg-primary" />
                  <span className="h-1.5 w-10 rounded-full bg-success" />
                  <span className="h-1.5 w-10 rounded-full bg-warning" />
                </div>
                <Dialog.Title className="truncate text-base font-semibold text-foreground">{title}</Dialog.Title>
                {description ? <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description> : null}
              </div>
              <Dialog.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Close window">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-background/35 p-4">{children}</div>
          {footer ? <div className="border-t border-border bg-surface p-3">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Patient360Drawer({ patient, open, onOpenChange }: { patient: PatientJourneyRecord | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const events = patient ? mockJourneyEvents.filter((event) => event.visitId === patient.visitId).slice(-5) : [];
  return (
    <PatientJourneyCenterWindow
      open={open}
      onOpenChange={onOpenChange}
      title={patient?.patientName ?? "Patient 360"}
      description={patient ? `${patient.uhid} | ${patient.visitId}` : "Patient journey quick view"}
      footer={
        patient ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild><Link href={`/patient-journey/patient/${patient.id}`}>Open 360</Link></Button>
            <Button asChild><Link href={`/patient-journey/timeline/${patient.visitId}`}>Full Timeline</Link></Button>
          </div>
        ) : null
      }
    >
      {patient ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={journeyTone(patient.stage)}>{patient.stage}</StatusPill>
              <Badge tone={priorityTone(patient.priority)}>{patient.priority}</Badge>
              <Badge tone="muted">{patient.visitType}</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <DetailLine label="Location" value={patient.location} />
              <DetailLine label="Doctor" value={patient.doctor} />
              <DetailLine label="Waiting" value={waitLabel(patient.waitingMinutes)} />
              <DetailLine label="Next action" value={patient.nextAction} />
            </div>
          </div>
          <Snapshot title="Clinical Snapshot" rows={[["Complaint", patient.chiefComplaint], ["Vitals", patient.vitals], ["Allergy", patient.allergy]]} />
          <Snapshot title="Financial Snapshot" rows={[["Billing", patient.billingStatus], ["Insurance", patient.insuranceStatus], ["Discharge", patient.dischargeStatus]]} />
          <Snapshot title="Orders Snapshot" rows={[["Lab", patient.labStatus], ["Radiology", patient.radiologyStatus], ["Pharmacy", patient.pharmacyStatus]]} />
          <Card>
            <CardHeader><CardTitle>Timeline preview</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {events.map((event) => <TimelineMiniEvent event={event} key={event.id} />)}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PatientJourneyCenterWindow>
  );
}

export function DetailLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-md border border-border bg-surface-muted p-2 sm:grid-cols-[130px_1fr]">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="min-w-0 text-sm text-foreground">{value}</div>
    </div>
  );
}

export function Snapshot({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.map(([label, value]) => <DetailLine label={label} value={value} key={label} />)}
      </CardContent>
    </Card>
  );
}

function TimelineMiniEvent({ event }: { event: JourneyEvent }) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-foreground">{event.event}</div>
        <StatusPill tone={journeyTone(event.status)}>{event.status}</StatusPill>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{event.time} | {event.department} | {event.duration}</div>
    </div>
  );
}

export function JourneyTimeline({ events }: { events: JourneyEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Journey timeline</CardTitle>
          <CardDescription>Complete event trail with department, user, status, and duration.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-[110px_1fr_150px]" key={event.id}>
            <div>
              <div className="text-sm font-semibold text-foreground">{event.time}</div>
              <div className="text-xs text-muted-foreground">{event.duration}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">{event.event}</div>
              <div className="mt-1 text-xs text-muted-foreground">{event.department} | {event.user}</div>
            </div>
            <div className="md:text-right"><StatusPill tone={journeyTone(event.status)}>{event.status}</StatusPill></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function StageStepper({ currentStage }: { currentStage: PatientJourneyStage }) {
  const activeIndex = journeyStages.indexOf(currentStage);
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface p-3">
      <div className="flex min-w-[920px] items-center gap-2">
        {journeyStages.map((stage, index) => (
          <React.Fragment key={stage}>
            <div className="min-w-0 flex-1">
              <div className={cn("rounded-md border px-2 py-2 text-center text-xs font-medium", index <= activeIndex ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground")}>{stage}</div>
            </div>
            {index < journeyStages.length - 1 ? <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" /> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function SmartAlertPanel({ alerts }: { alerts: SmartAlert[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Smart alerts</CardTitle>
          <CardDescription>Delay, critical, billing, clinical, inventory, insurance, and discharge alerts.</CardDescription>
        </div>
        <Badge tone="warning">{alerts.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div className="rounded-lg border border-border bg-background p-3" key={alert.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={alert.severity}>{alert.type}</Badge>
                  <Badge tone="muted">{alert.age}</Badge>
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">{alert.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{alert.department}</div>
              </div>
              <Bell className="h-4 w-4 shrink-0 text-warning" />
            </div>
            <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => toast.success(`${alert.action} queued`)}>
              {alert.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PatientJourneyAccessBanner() {
  return (
    <AlertBanner icon={AlertTriangle} tone="info" title="Patient Journey Command Desk">
      Static frontend command layer for live patient movement, delays, next actions, bottlenecks, and department handoffs.
    </AlertBanner>
  );
}

export const journeyIcons = {
  lab: FlaskConical,
  radiology: ScanSearch,
  pharmacy: Pill,
  billing: CreditCard,
  discharge: FileText,
  emergency: AlertTriangle,
  call: PhoneCall,
};
