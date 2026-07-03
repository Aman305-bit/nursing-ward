"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, Check, Clock3, Download, Eye, PhoneCall, Plus, RefreshCcw, Search, ShieldAlert, Ticket, UserCheck, Video } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDrawer, DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import {
  AppointmentDetailDrawer,
  AppointmentPatientStrip,
  ConflictPanel,
  DelayBadge,
  OperationalStatus,
  PatientMini,
  PrintAction,
  PriorityBadge,
  ProtectedAppointment,
  TokenBoardPreview,
  patientName,
  patientUhid,
} from "@/features/appointments/appointment-shared";
import { getPatientById, mockPatients } from "@/data/patients";
import {
  mockAppointmentSlots,
  mockAppointments,
  mockCounters,
  mockDoctorSchedules,
  mockEnquiries,
  mockFollowUps,
  mockFrontOfficeWorklist,
  mockQueueEntries,
  mockRooms,
  mockTeleconsultations,
  mockTokens,
  mockVisitorDirections,
} from "@/data/appointments";
import type { AppointmentRecord, DoctorSchedule, FollowUpRecord, FrontOfficeWorkItem, QueueEntry, TeleconsultationRecord, TokenRecord } from "@/types";

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function AppointmentsPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<AppointmentRecord | null>(null);
  const [confirm, setConfirm] = React.useState<{ target: string; action: string } | null>(null);
  const rows = mockAppointments.filter((appointment) => {
    const patient = getPatientById(appointment.patientId);
    const haystack = `${appointment.appointmentNo} ${patient?.firstName} ${patient?.lastName} ${patient?.uhid} ${appointment.department} ${appointment.doctor} ${appointment.status}`;
    return includes(haystack, search) && (status === "All status" || appointment.status === status);
  });
  const columns = React.useMemo<ColumnDef<AppointmentRecord>[]>(() => [
    { header: "Time", cell: ({ row }) => <div><div className="font-medium">{row.original.startTime}</div><div className="text-xs text-muted-foreground">{row.original.date}</div></div> },
    { header: "Token", cell: ({ row }) => row.original.tokenId ? mockTokens.find((token) => token.id === row.original.tokenId)?.tokenNo : "Not issued" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Department", accessorKey: "department" },
    { header: "Doctor", accessorKey: "doctor" },
    { header: "Visit", accessorKey: "visitType" },
    { header: "Status", cell: ({ row }) => <OperationalStatus status={row.original.status} /> },
    { header: "Payment", cell: ({ row }) => <OperationalStatus status={row.original.paymentStatus} /> },
    { header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="h-3.5 w-3.5" />Detail</Button><Button size="sm" variant="ghost" onClick={() => setConfirm({ target: row.original.appointmentNo, action: "Cancel appointment" })}>Cancel</Button></div> },
  ], []);

  return (
    <ProtectedAppointment>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 4 • Appointments" title="Appointments" description="Manage booking, check-in, reschedule, cancellation, token issue, and daily appointment flow." actions={<><Button variant="outline" asChild><Link href="/appointments/calendar">Calendar</Link></Button><Button variant="outline" asChild><Link href="/appointments/queue">Queue</Link></Button><PrintAction label="Print list" /><Button variant="outline" onClick={() => toast.info("Export pending backend integration")}><Download className="h-4 w-4" />Export</Button><Button disabled={readOnly} asChild><Link href="/appointments/book"><Plus className="h-4 w-4" />Book appointment</Link></Button></>} />
          <SummaryGrid>
            <StatCard label="Today" value={mockAppointments.length} change="Active day" context="All appointments" tone="info" icon={CalendarClock} />
            <StatCard label="Checked in" value={mockAppointments.filter((a) => a.status === "Checked in").length} change="Arrived" context="Ready for queue" tone="success" icon={UserCheck} />
            <StatCard label="Waiting" value={mockQueueEntries.filter((q) => q.status === "Waiting").length} change="Queue" context="Needs action" tone="warning" icon={Clock3} />
            <StatCard label="No-show/cancelled" value={mockAppointments.filter((a) => ["No-show", "Cancelled"].includes(a.status)).length} change="Exception" context="Operational history" tone="danger" icon={ShieldAlert} />
          </SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, appointment no, doctor...">
            <NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Scheduled", "Confirmed", "Checked in", "Waiting", "Late", "No-show", "Completed", "Cancelled"]} />
            <Button variant="outline" onClick={() => toast.success("Static appointment data refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
          </FilterBar>
          <DataTable data={rows} columns={columns} />
          <AppointmentDetailDrawer appointment={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Operational confirmation" target={confirm?.target ?? ""} action={confirm?.action ?? ""} />
        </>
      )}
    </ProtectedAppointment>
  );
}

export function AppointmentBookingPage() {
  const [patientId, setPatientId] = React.useState("pat-001");
  return (
    <ProtectedAppointment>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 4 • Booking" title="Book Appointment" description="Step-based booking with patient selection, visit details, doctor slot, conflict checks, and confirmation." actions={<><Button variant="outline" asChild><Link href="/patients/register">Register new patient</Link></Button><Button disabled={readOnly}><Check className="h-4 w-4" />Save appointment</Button></>} />
          <Tabs defaultValue="patient" className="space-y-4">
            <TabsList><TabsTrigger value="patient">Patient</TabsTrigger><TabsTrigger value="visit">Visit details</TabsTrigger><TabsTrigger value="slot">Doctor & slot</TabsTrigger><TabsTrigger value="confirm">Confirmation</TabsTrigger></TabsList>
            <ConflictPanel />
            <TabsContent value="patient" className="grid gap-4 xl:grid-cols-[1fr_380px]">
              <Card><CardContent className="space-y-3 p-4"><label className="space-y-1 text-sm"><span className="font-medium">Search/select patient</span><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={patientId} onChange={(e) => setPatientId(e.target.value)}>{mockPatients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} • {p.uhid}</option>)}</select></label><Button variant="outline" asChild><Link href="/patients/emergency-register">Emergency / unknown shortcut</Link></Button></CardContent></Card>
              <AppointmentPatientStrip patientId={patientId} />
            </TabsContent>
            <TabsContent value="visit"><FormGrid fields={["Department", "Visit type", "Appointment type", "Priority", "Reason for visit", "Referral source", "Notes", "Teleconsultation consent"]} /></TabsContent>
            <TabsContent value="slot" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{mockAppointmentSlots.map((slot) => <Card key={slot.id}><CardContent className="p-3"><div className="flex items-center justify-between gap-2"><div className="font-medium">{slot.time}</div><OperationalStatus status={slot.status} /></div><div className="mt-1 text-xs text-muted-foreground">{slot.doctor} • {slot.room} • {slot.duration} min</div><Button className="mt-3 w-full" variant="outline" disabled={slot.status === "Booked" || slot.status === "Doctor unavailable"}>Choose slot</Button></CardContent></Card>)}</TabsContent>
            <TabsContent value="confirm"><Card><CardContent className="space-y-3 p-4"><AppointmentPatientStrip patientId={patientId} /><DetailRow label="Token preview" value="Generated after save/check-in" /><DetailRow label="Reminder" value="SMS/WhatsApp/email placeholders" /><DetailRow label="Audit" value="Override, reschedule, and conflict actions require reason" /></CardContent></Card></TabsContent>
          </Tabs>
          <StickyActionBar readOnly={readOnly} saveLabel="Save appointment" />
        </>
      )}
    </ProtectedAppointment>
  );
}

function FormGrid({ fields }: { fields: string[] }) {
  return <Card><CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{fields.map((field) => <label className="space-y-1 text-sm" key={field}><span className="font-medium text-foreground">{field}</span><Input placeholder="Static booking field" /></label>)}</CardContent></Card>;
}

export function SchedulesPage() {
  const columns = React.useMemo<ColumnDef<DoctorSchedule>[]>(() => [
    { header: "Doctor", accessorKey: "doctor" }, { header: "Department", accessorKey: "department" }, { header: "Day", accessorKey: "dayOfWeek" }, { header: "Start", accessorKey: "startTime" }, { header: "End", accessorKey: "endTime" }, { header: "Slot", cell: ({ row }) => `${row.original.slotDuration} min` }, { header: "Room", accessorKey: "room" }, { header: "Max", accessorKey: "maxPatients" }, { header: "Status", cell: ({ row }) => <OperationalStatus status={row.original.status} /> },
  ], []);
  return <ProtectedAppointment>{({ readOnly }) => <><PageHeader eyebrow="Phase 4 • Scheduling" title="Doctor Scheduling" description="Doctor availability, recurring slots, blocks, templates, rooms, and capacity placeholders." actions={<><PrintAction label="Print schedule" /><Button disabled={readOnly}><Plus className="h-4 w-4" />Add schedule</Button></>} /><Tabs defaultValue="schedules" className="space-y-4"><TabsList><TabsTrigger value="schedules">Schedules</TabsTrigger><TabsTrigger value="availability">Availability</TabsTrigger><TabsTrigger value="blocks">Leaves & blocks</TabsTrigger><TabsTrigger value="templates">Templates</TabsTrigger><TabsTrigger value="rooms">Rooms</TabsTrigger><TabsTrigger value="capacity">Capacity</TabsTrigger></TabsList><TabsContent value="schedules"><DataTable data={mockDoctorSchedules} columns={columns} /></TabsContent><TabsContent value="availability"><CardGrid items={mockAppointmentSlots.map((slot) => `${slot.doctor} • ${slot.time} • ${slot.status}`)} /></TabsContent><TabsContent value="blocks"><AlertBanner icon={ShieldAlert} tone="warning" title="Affected appointment warning">Blocks show affected appointment count and suggested reschedule placeholders.</AlertBanner><FormGrid fields={["Doctor", "Date range", "Start time", "End time", "Reason", "Block type", "Affected appointments", "Suggested reschedule"]} /></TabsContent><TabsContent value="templates"><CardGrid items={["Cardiology morning OPD • Mon-Sat • 15 min", "Orthopedics walk-in • Mon-Fri • 15 min", "Pediatrics review • Wed • 20 min"]} /></TabsContent><TabsContent value="rooms"><CardGrid items={mockRooms.map((room) => `${room.name} • ${room.department} • ${room.status}`)} /></TabsContent><TabsContent value="capacity"><CardGrid items={mockCounters.map((counter) => `${counter.name} • ${counter.type} • Capacity ${counter.capacity}`)} /></TabsContent></Tabs></>}</ProtectedAppointment>;
}

function CardGrid({ items }: { items: string[] }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <Card key={item}><CardContent className="p-4 text-sm text-foreground">{item}</CardContent></Card>)}</div>;
}

export function CalendarPage() {
  const [view, setView] = React.useState("Day");
  const [selected, setSelected] = React.useState<AppointmentRecord | null>(null);
  return <ProtectedAppointment>{() => <><PageHeader eyebrow="Phase 4 • Calendar" title="Calendar Management" description="Day, week, month, doctor, department, and room calendar views with agenda fallback." actions={<><NativeSelect label="View" value={view} onChange={setView} options={["Day", "Week", "Month", "Doctor", "Department", "Room"]} /><Button variant="outline">Today</Button></>} /><div className="grid gap-3 xl:grid-cols-[280px_1fr]"><Card><CardContent className="space-y-2 p-3">{["Department filter", "Doctor filter", "Status filter", "Show cancelled/no-show"].map((field) => <label key={field} className="space-y-1 text-sm"><span className="font-medium">{field}</span><Input placeholder={field} /></label>)}</CardContent></Card><div className="grid min-h-[480px] gap-2 rounded-lg border border-border bg-surface p-3 md:grid-cols-2 xl:grid-cols-3">{mockAppointments.map((appointment) => <button key={appointment.id} className="rounded-md border border-border bg-surface-muted p-3 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setSelected(appointment)}><div className="flex justify-between gap-2"><span className="font-medium">{appointment.startTime}</span><OperationalStatus status={appointment.status} /></div><div className="mt-1 text-sm">{patientName(appointment.patientId)}</div><div className="text-xs text-muted-foreground">{appointment.doctor} • {appointment.visitType}</div>{getPatientById(appointment.patientId)?.alertFlags.length ? <div className="mt-2"><Badge tone="warning">Alert</Badge></div> : null}</button>)}</div></div><AppointmentDetailDrawer appointment={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></>}</ProtectedAppointment>;
}

export function QueuePage() {
  const [confirm, setConfirm] = React.useState<{ target: string; action: string } | null>(null);
  const columns = React.useMemo<ColumnDef<QueueEntry>[]>(() => [
    { header: "Pos", accessorKey: "position" }, { header: "Token", accessorKey: "tokenNo" }, { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "Appt", cell: ({ row }) => mockAppointments.find((a) => a.id === row.original.appointmentId)?.startTime }, { header: "Wait", accessorKey: "waitingSince" }, { header: "Department", accessorKey: "department" }, { header: "Doctor", accessorKey: "doctor" }, { header: "Priority", cell: ({ row }) => <PriorityBadge priority={row.original.priority} /> }, { header: "Delay", cell: ({ row }) => <DelayBadge delay={row.original.delayLevel} /> }, { header: "Status", cell: ({ row }) => <OperationalStatus status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button size="sm" onClick={() => setConfirm({ target: row.original.tokenNo, action: "Call" })}>Call</Button><Button size="sm" variant="outline" onClick={() => setConfirm({ target: row.original.tokenNo, action: "Hold" })}>Hold</Button><Button size="sm" variant="ghost" onClick={() => setConfirm({ target: row.original.tokenNo, action: "Skip" })}>Skip</Button></div> },
  ], []);
  return <ProtectedAppointment>{({ readOnly }) => <><PageHeader eyebrow="Phase 4 • Queue" title="Queue Management" description="OPD queue by doctor, department, room, status, priority, and waiting-time pressure." actions={<><Button disabled={readOnly} onClick={() => setConfirm({ target: "priority queue", action: "Call next" })}><PhoneCall className="h-4 w-4" />Call next</Button><Button variant="outline" asChild><Link href="/appointments/tokens">Token board</Link></Button></>} /><SummaryGrid><StatCard label="Waiting" value={mockQueueEntries.filter(q => q.status === "Waiting").length} change="Now" context="Queue pressure" tone="warning" icon={Clock3} /><StatCard label="Called" value={mockQueueEntries.filter(q => q.status === "Called").length} change="Active" context="Ready" tone="info" icon={PhoneCall} /><StatCard label="Emergency" value={mockQueueEntries.filter(q => q.priority === "Emergency").length} change="Priority" context="Never hidden" tone="critical" icon={ShieldAlert} /><StatCard label="Delayed" value={mockQueueEntries.filter(q => q.delayLevel === "Delayed" || q.delayLevel === "Critical delay").length} change="Watch" context="Threshold" tone="danger" icon={Clock3} /></SummaryGrid><DataTable data={mockQueueEntries} columns={columns} /><ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Queue action confirmation" target={confirm?.target ?? ""} action={confirm?.action ?? ""} /></>}</ProtectedAppointment>;
}

export function TokensPage() {
  const [confirm, setConfirm] = React.useState<TokenRecord | null>(null);
  const columns = React.useMemo<ColumnDef<TokenRecord>[]>(() => [
    { header: "Token", accessorKey: "tokenNo" }, { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "Department", accessorKey: "department" }, { header: "Doctor", accessorKey: "doctor" }, { header: "Counter", accessorKey: "counter" }, { header: "Status", cell: ({ row }) => <OperationalStatus status={row.original.status} /> }, { header: "Issued", accessorKey: "issuedAt" }, { header: "Called", cell: ({ row }) => row.original.calledAt ?? "Not called" }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setConfirm(row.original)}>Reprint</Button> },
  ], []);
  return <ProtectedAppointment>{({ readOnly }) => <><PageHeader eyebrow="Phase 4 • Tokens" title="Token Management" description="Issue, call, skip, hold, complete, print, and board-preview token workflows." actions={<><PrintAction label="Print token" /><Button disabled={readOnly}><Ticket className="h-4 w-4" />Issue token</Button></>} /><AlertBanner icon={ShieldAlert} tone="warning" title="Duplicate token safeguard">Active duplicate token for the same patient shows warning before issue. Reprint and cancel require reason.</AlertBanner><div className="grid gap-4 xl:grid-cols-[1fr_420px]"><DataTable data={mockTokens} columns={columns} /><TokenBoardPreview /></div><ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Reprint token" target={confirm?.tokenNo ?? ""} action="Reprint token" /></>}</ProtectedAppointment>;
}

export function FollowUpsPage() {
  const [selected, setSelected] = React.useState<FollowUpRecord | null>(null);
  const columns = React.useMemo<ColumnDef<FollowUpRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "UHID", cell: ({ row }) => patientUhid(row.original.patientId) }, { header: "Due", accessorKey: "dueDate" }, { header: "Department", accessorKey: "department" }, { header: "Doctor", accessorKey: "doctor" }, { header: "Reason", accessorKey: "reason" }, { header: "Status", cell: ({ row }) => <OperationalStatus status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], []);
  return <ProtectedAppointment>{() => <><PageHeader eyebrow="Phase 4 • Follow-ups" title="Follow-Up Management" description="Due, overdue, scheduled, missed, completed follow-ups and reminder placeholders." actions={<><PrintAction label="Print follow-ups" /><Button asChild><Link href="/appointments/book">Book follow-up</Link></Button></>} /><SummaryGrid><StatCard label="Due today" value={1} change="Call" context="Needs contact" tone="warning" icon={PhoneCall} /><StatCard label="Overdue" value={1} change="Escalate" context="Past due" tone="danger" icon={Clock3} /><StatCard label="Scheduled" value={1} change="Ready" context="Booked" tone="success" icon={CalendarClock} /><StatCard label="Missed" value={1} change="Retry" context="Contact attempts" tone="critical" icon={ShieldAlert} /></SummaryGrid><DataTable data={mockFollowUps} columns={columns} /><Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title="Follow-up detail" description="Patient, last visit, suggested date, contact attempts, and reminder log.">{selected ? <div className="space-y-3"><AppointmentPatientStrip patientId={selected.patientId} /><DetailRow label="Reason" value={selected.reason} /><DetailRow label="Attempts" value={selected.contactAttempts} /><DetailRow label="Reminder" value="SMS/WhatsApp reminder placeholder" /></div> : null}</Drawer></>}</ProtectedAppointment>;
}

export function TeleconsultationPage() {
  const [selected, setSelected] = React.useState<TeleconsultationRecord | null>(null);
  const columns = React.useMemo<ColumnDef<TeleconsultationRecord>[]>(() => [
    { header: "Time", accessorKey: "time" }, { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "UHID", cell: ({ row }) => patientUhid(row.original.patientId) }, { header: "Doctor", accessorKey: "doctor" }, { header: "Consent", cell: ({ row }) => <OperationalStatus status={row.original.consentStatus} /> }, { header: "Link", cell: ({ row }) => <OperationalStatus status={row.original.linkStatus} /> }, { header: "Status", cell: ({ row }) => <OperationalStatus status={row.original.appointmentStatus} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Video className="h-3.5 w-3.5" />Open</Button> },
  ], []);
  return <ProtectedAppointment>{() => <><PageHeader eyebrow="Phase 4 • Teleconsultation" title="Teleconsultation Placeholder" description="Virtual appointment workflow with consent, link, readiness, and no-show states. No real video call integration." actions={<Button variant="outline" onClick={() => toast.info("Video link generation placeholder")}><Video className="h-4 w-4" />Generate link</Button>} /><AlertBanner icon={Video} tone="info" title="Future integration placeholder">Join and link actions do not start a real call in Phase 4. Consent blocks join visually.</AlertBanner><DataTable data={mockTeleconsultations} columns={columns} /><Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title="Teleconsultation detail" description="Appointment, patient, consent, link, checklist, and readiness preview.">{selected ? <div className="space-y-3"><AppointmentPatientStrip patientId={selected.patientId} /><DetailRow label="Consent" value={<OperationalStatus status={selected.consentStatus} />} /><DetailRow label="Link" value={<OperationalStatus status={selected.linkStatus} />} /><DetailRow label="Checklist" value="Camera, microphone, network, identity confirmation placeholders" /><Button disabled={selected.consentStatus !== "Signed"}>Join call placeholder</Button></div> : null}</Drawer></>}</ProtectedAppointment>;
}

export function FrontOfficePage() {
  const columns = React.useMemo<ColumnDef<FrontOfficeWorkItem>[]>(() => [
    { header: "Time", accessorKey: "time" }, { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "Purpose", accessorKey: "purpose" }, { header: "Department", accessorKey: "department" }, { header: "Doctor", accessorKey: "doctor" }, { header: "Status", cell: ({ row }) => <OperationalStatus status={row.original.status} /> }, { header: "Token", cell: ({ row }) => row.original.token ?? "Not issued" }, { header: "Next action", accessorKey: "nextAction" },
  ], []);
  return <ProtectedAppointment>{({ readOnly }) => <><PageHeader eyebrow="Phase 4 • Reception" title="Front Office Dashboard" description="Reception work surface for check-in, enquiries, queue, tokens, visitor direction, and handoffs." actions={<><Button variant="outline" asChild><Link href="/patients/register">Register patient</Link></Button><Button disabled={readOnly} asChild><Link href="/appointments/book">Book appointment</Link></Button></>} /><SummaryGrid><StatCard label="Today's appts" value={mockAppointments.length} change="Live desk" context="Static count" tone="info" icon={CalendarClock} /><StatCard label="Check-ins" value={mockAppointments.filter(a => a.status === "Checked in").length} change="Arrived" context="Queue handoff" tone="success" icon={UserCheck} /><StatCard label="Tokens" value={mockTokens.filter(t => t.status !== "Expired").length} change="Active" context="Board preview" tone="warning" icon={Ticket} /><StatCard label="Enquiries" value={mockEnquiries.length} change="Open" context="Follow-up required" tone="info" icon={Search} /></SummaryGrid><div className="grid gap-4 xl:grid-cols-[1fr_360px]"><div className="space-y-4"><Card><CardContent className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">{[{ label: "Check in patient", href: "/appointments" }, { label: "Issue token", href: "/appointments/tokens" }, { label: "Open queue", href: "/appointments/queue" }, { label: "Emergency register", href: "/patients/emergency-register" }].map((action) => <Button key={action.label} variant="outline" asChild><Link href={action.href}>{action.label}</Link></Button>)}</CardContent></Card><DataTable data={mockFrontOfficeWorklist} columns={columns} /></div><div className="space-y-4"><TokenBoardPreview /><SideList title="Enquiries" items={mockEnquiries.map((e) => `${e.name} • ${e.type} • ${e.followUpDate}`)} /><SideList title="Visitor directions" items={mockVisitorDirections.map((v) => `${v.visitor} • ${v.destination} • Pass ${v.passRequired ? "required" : "not required"}`)} /></div></div></>}</ProtectedAppointment>;
}

function SideList({ title, items }: { title: string; items: string[] }) {
  return <Card><CardContent className="space-y-2 p-3"><div className="text-sm font-semibold">{title}</div>{items.map((item) => <div key={item} className="rounded-md border border-border p-2 text-xs text-muted-foreground">{item}</div>)}</CardContent></Card>;
}
