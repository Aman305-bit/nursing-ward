"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Ambulance, BedDouble, ClipboardCheck, FileText, HeartPulse, Pill, Plus, Printer, ShieldAlert } from "lucide-react";
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
import { ConfirmDrawer, DetailRow, StickyActionBar } from "@/features/admin/admin-shared";
import { PatientMini } from "@/features/appointments/appointment-shared";
import { BedCard, InpatientHeader, InpatientSafetyPanel, IpdStatus, ProtectedIpd, TriageBadge } from "@/features/ipd/ipd-shared";
import {
  getAdmissionById,
  mockAdmissions,
  mockAmbulanceRequests,
  mockBeds,
  mockDischarges,
  mockDoctorRounds,
  mockEmergencyCases,
  mockIntakeOutput,
  mockMedicationAdministration,
  mockNursingTasks,
  mockTransfers,
  mockTriageQueue,
  mockWards,
} from "@/data/ipd";
import type { AdmissionRecord, BedRecord, MedicationAdministrationRecord, NursingTask } from "@/types";

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function PrintButton({ label = "Print" }: { label?: string }) {
  return <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />{label}</Button>;
}

export function IpdDashboardPage() {
  return <ProtectedIpd>{() => <><PageHeader eyebrow="Phase 6 • IPD" title="IPD Dashboard" description="Admission, bed, ward, nursing, medication, transfer, and discharge overview." actions={<><Button variant="outline" asChild><Link href="/ipd/beds">Open bed map</Link></Button><Button asChild><Link href="/ipd/admissions"><Plus className="h-4 w-4" />New admission</Link></Button></>} /><SummaryGrid><StatCard label="Active admissions" value={mockAdmissions.length} change="Live" context="Static IPD census" tone="info" icon={BedDouble} /><StatCard label="Available beds" value={mockBeds.filter(b => b.status === "Available").length} change="Ready" context="Assignable" tone="success" icon={BedDouble} /><StatCard label="ICU patients" value={mockAdmissions.filter(a => a.status === "In ICU").length} change="Critical" context="High priority" tone="critical" icon={HeartPulse} /><StatCard label="Medication due" value={mockMedicationAdministration.filter(m => ["Due", "Delayed"].includes(m.status)).length} change="MAR" context="Nursing action" tone="danger" icon={Pill} /></SummaryGrid><div className="grid gap-4 xl:grid-cols-[1fr_360px]"><BedMap compact /><SidePanel title="Critical patient alerts" items={mockNursingTasks.filter(t => t.risk === "Critical").map(t => `${t.bedNo} • ${t.task} • ${t.status}`)} /><SidePanel title="Discharge queue" items={mockDischarges.map(d => `${d.status} • ${d.checklist} • ${d.billing}`)} /></div></>}</ProtectedIpd>;
}

export function AdmissionsPage() {
  const [selected, setSelected] = React.useState<AdmissionRecord | null>(null);
  const columns = React.useMemo<ColumnDef<AdmissionRecord>[]>(() => [
    { header: "Admission", accessorKey: "admissionNo" }, { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "Type", accessorKey: "admissionType" }, { header: "Department", accessorKey: "department" }, { header: "Consultant", accessorKey: "consultant" }, { header: "Bed/ward", cell: ({ row }) => `${row.original.bedId} • ${row.original.ward}` }, { header: "Status", cell: ({ row }) => <IpdStatus status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], []);
  return <ProtectedIpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 6 • Admissions" title="Admission Management" description="Admission requests, consultant assignment, bed requests, consent, payer/package, and active admissions." actions={<><PrintButton label="Print list" /><Button disabled={readOnly}><Plus className="h-4 w-4" />New admission</Button></>} /><SummaryGrid><StatCard label="Requests" value={1} change="Pending" context="Needs approval" tone="warning" icon={ClipboardCheck} /><StatCard label="Admitted today" value={3} change="Today" context="Active flow" tone="info" icon={BedDouble} /><StatCard label="Bed pending" value={1} change="Assign" context="Bed request" tone="danger" icon={BedDouble} /><StatCard label="Discharge pending" value={mockDischarges.length} change="Queue" context="Checklist" tone="warning" icon={FileText} /></SummaryGrid><DataTable data={mockAdmissions} columns={columns} /><AdmissionDrawer admission={selected} onClose={() => setSelected(null)} /></>}</ProtectedIpd>;
}

function AdmissionDrawer({ admission, onClose }: { admission: AdmissionRecord | null; onClose: () => void }) {
  return <Drawer open={Boolean(admission)} onOpenChange={(open) => !open && onClose()} title={admission?.admissionNo ?? "Admission"} description="Admission form tabs and high-impact action placeholders.">{admission ? <Tabs defaultValue="patient"><TabsList><TabsTrigger value="patient">Patient</TabsTrigger><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="bed">Bed request</TabsTrigger><TabsTrigger value="consent">Consent</TabsTrigger><TabsTrigger value="review">Review</TabsTrigger></TabsList><TabsContent value="patient"><PatientMini patientId={admission.patientId} /><InpatientSafetyPanel patientId={admission.patientId} /></TabsContent><TabsContent value="details"><DetailRows rows={[["Type", admission.admissionType], ["Department", admission.department], ["Diagnosis", admission.diagnosis], ["Priority", admission.priority]]} /></TabsContent><TabsContent value="bed"><DetailRows rows={[["Ward preference", admission.ward], ["Bed", admission.bedId], ["Isolation", "Filter visually if required"], ["Attendant", "Allowed placeholder"]]} /></TabsContent><TabsContent value="consent"><DetailRows rows={[["Admission consent", "Signed placeholder"], ["Financial consent", "Pending placeholder"], ["High-risk consent", "Required for ICU/emergency"]]} /></TabsContent><TabsContent value="review"><AlertBanner icon={ShieldAlert} tone="warning" title="Audit note">Admit, assign bed, cancel, transfer, and discharge actions require reason placeholders.</AlertBanner></TabsContent></Tabs> : null}</Drawer>;
}

export function AdmissionDetailPage({ admissionId }: { admissionId: string }) {
  const admission = getAdmissionById(admissionId) ?? mockAdmissions[0];
  return <ProtectedIpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 6 • Inpatient" title="Admission Detail" description="Central inpatient workspace with bed, ward, nursing, MAR, transfer, discharge, and package context." actions={<><PrintButton label="Print summary" /><Button disabled={readOnly}>Transfer</Button><Button disabled={readOnly}>Start discharge</Button></>} /><InpatientHeader admission={admission} /><InpatientSafetyPanel patientId={admission.patientId} /><Tabs defaultValue="overview" className="space-y-4"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="rounds">Rounds</TabsTrigger><TabsTrigger value="nursing">Nursing</TabsTrigger><TabsTrigger value="mar">MAR</TabsTrigger><TabsTrigger value="io">Intake-output</TabsTrigger><TabsTrigger value="transfers">Transfers</TabsTrigger><TabsTrigger value="discharge">Discharge</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList><TabsContent value="overview"><SummaryGrid><InfoCard title="Admission" value={admission.status} /><InfoCard title="Diagnosis" value={admission.diagnosis} /><InfoCard title="Bed/Ward" value={`${admission.bedId} • ${admission.ward}`} /><InfoCard title="Consultant" value={admission.consultant} /></SummaryGrid></TabsContent><TabsContent value="rounds"><GenericTable rows={mockDoctorRounds.filter(r => r.admissionId === admission.id)} /></TabsContent><TabsContent value="nursing"><GenericTable rows={mockNursingTasks.filter(t => t.admissionId === admission.id)} /></TabsContent><TabsContent value="mar"><MarTable admissionId={admission.id} /></TabsContent><TabsContent value="io"><GenericTable rows={mockIntakeOutput.filter(i => i.admissionId === admission.id)} /></TabsContent><TabsContent value="transfers"><GenericTable rows={mockTransfers.filter(t => t.admissionId === admission.id)} /></TabsContent><TabsContent value="discharge"><GenericTable rows={mockDischarges.filter(d => d.admissionId === admission.id)} /></TabsContent><TabsContent value="audit"><AlertBanner icon={ShieldAlert} tone="info" title="Future audit">Bed, medication, transfer, and discharge state changes will be audited.</AlertBanner></TabsContent></Tabs><StickyActionBar readOnly={readOnly} saveLabel="Save inpatient workspace" /></>}</ProtectedIpd>;
}

export function BedsPage({ mode = "beds" }: { mode?: "beds" | "wards" | "icu" }) {
  return <ProtectedIpd>{() => <><PageHeader eyebrow="Phase 6 • Bed Operations" title={mode === "icu" ? "ICU Management" : mode === "wards" ? "Ward Management" : "Bed Management"} description="Bed availability, occupancy, cleaning, maintenance, isolation, ward/ICU state, and transfer-safe lifecycle." actions={<><PrintButton label="Print occupancy" /><Button variant="outline" onClick={() => toast.info("Bed data refreshed")}>Refresh</Button></>} />{mode === "wards" ? <GenericTable rows={mockWards} /> : <BedMap icuOnly={mode === "icu"} />}</>}</ProtectedIpd>;
}

function BedMap({ compact, icuOnly }: { compact?: boolean; icuOnly?: boolean }) {
  const [selected, setSelected] = React.useState<BedRecord | null>(null);
  const beds = icuOnly ? mockBeds.filter(b => b.bedType === "ICU") : mockBeds;
  return <><div className={`grid gap-3 ${compact ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>{beds.map(bed => <BedCard key={bed.id} bed={bed} onAction={setSelected} />)}</div><ConfirmDrawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title="Bed lifecycle action" target={selected?.bedNo ?? ""} action="Update bed state" /></>;
}

export function NursingStationPage() {
  const columns = React.useMemo<ColumnDef<NursingTask>[]>(() => [
    { header: "Bed", accessorKey: "bedNo" }, { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "Task", accessorKey: "task" }, { header: "Category", accessorKey: "category" }, { header: "Due", accessorKey: "dueAt" }, { header: "Risk", accessorKey: "risk" }, { header: "Status", cell: ({ row }) => <IpdStatus status={row.original.status} /> }, { header: "Actions", cell: () => <Button size="sm" variant="outline">Acknowledge</Button> },
  ], []);
  return <ProtectedIpd>{() => <><PageHeader eyebrow="Phase 6 • Nursing" title="Nursing Station" description="Assigned patients, due medications, vitals, overdue tasks, infection flags, and handoff notes." actions={<PrintButton label="Print tasks" />} /><SummaryGrid><StatCard label="Assigned patients" value={mockAdmissions.length} change="Ward" context="Nursing list" tone="info" icon={BedDouble} /><StatCard label="Medication due" value={mockMedicationAdministration.filter(m => ["Due", "Delayed"].includes(m.status)).length} change="MAR" context="Action needed" tone="danger" icon={Pill} /><StatCard label="Vitals due" value={1} change="Now" context="Critical watch" tone="warning" icon={HeartPulse} /><StatCard label="Tasks overdue" value={mockNursingTasks.filter(t => t.status === "Overdue").length} change="Escalate" context="Audit placeholder" tone="critical" icon={ShieldAlert} /></SummaryGrid><DataTable data={mockNursingTasks} columns={columns} /></>}</ProtectedIpd>;
}

export function MarPage() {
  return <ProtectedIpd>{() => <><PageHeader eyebrow="Phase 6 • MAR" title="Medication Administration" description="Scheduled, due, administered, missed, held, refused, delayed medication states with safety checks." actions={<PrintButton label="Print MAR" />} /><AlertBanner icon={Pill} tone="danger" title="Medication safety">Patient, medicine, dose, route, due time, allergy context, and safety checks stay together before administration.</AlertBanner><MarTable /></>}</ProtectedIpd>;
}

function MarTable({ admissionId }: { admissionId?: string }) {
  const [confirm, setConfirm] = React.useState<MedicationAdministrationRecord | null>(null);
  const rows = admissionId ? mockMedicationAdministration.filter(m => m.admissionId === admissionId) : mockMedicationAdministration;
  const columns = React.useMemo<ColumnDef<MedicationAdministrationRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> }, { header: "Medicine", accessorKey: "medicineName" }, { header: "Dose", accessorKey: "dose" }, { header: "Route", accessorKey: "route" }, { header: "Due", accessorKey: "dueTime" }, { header: "Status", cell: ({ row }) => <IpdStatus status={row.original.status} /> }, { header: "Safety", cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.safetyChecks.map(check => <Badge key={check} tone="warning">{check}</Badge>)}</div> }, { header: "Actions", cell: ({ row }) => <Button size="sm" onClick={() => setConfirm(row.original)}>Administer</Button> },
  ], []);
  return <><DataTable data={rows} columns={columns} /><ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Medication administration confirmation" target={confirm?.medicineName ?? ""} action="Administer medication" /></>;
}

export function SimpleIpdPage({ title, description, rows, print = true }: { title: string; description: string; rows: Record<string, unknown>[]; print?: boolean }) {
  return <ProtectedIpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 6 • IPD" title={title} description={description} actions={<>{print ? <PrintButton /> : null}<Button disabled={readOnly}><Plus className="h-4 w-4" />Add record</Button></>} /><GenericTable rows={rows} /></>}</ProtectedIpd>;
}

export function EmergencyDashboardPage() {
  return <ProtectedIpd>{() => <><PageHeader eyebrow="Phase 6 • Emergency" title="Emergency Dashboard" description="Emergency registration, triage, casualty, ambulance, admission, and billing overview." actions={<><Button variant="outline" asChild><Link href="/emergency/triage">Triage</Link></Button><Button asChild><Link href="/emergency/register"><Plus className="h-4 w-4" />Register emergency</Link></Button></>} /><SummaryGrid><StatCard label="Emergency today" value={mockEmergencyCases.length} change="ER" context="Cases" tone="info" icon={Ambulance} /><StatCard label="Triage pending" value={mockEmergencyCases.filter(c => c.status === "Triage pending").length} change="Now" context="Priority" tone="warning" icon={ShieldAlert} /><StatCard label="Red/orange" value={mockEmergencyCases.filter(c => c.priority.startsWith("Red") || c.priority.startsWith("Orange")).length} change="Critical" context="Visible always" tone="critical" icon={HeartPulse} /><StatCard label="Ambulance incoming" value={mockAmbulanceRequests.filter(a => ["Dispatched", "Arriving"].includes(a.status)).length} change="ETA" context="Static" tone="warning" icon={Ambulance} /></SummaryGrid><div className="grid gap-4 xl:grid-cols-[1fr_360px]"><GenericTable rows={mockEmergencyCases} /><SidePanel title="Ambulance handoffs" items={mockAmbulanceRequests.map(a => `${a.requestNo} • ${a.status} • ${a.eta}`)} /></div></>}</ProtectedIpd>;
}

export function EmergencyRegisterPage() {
  return <ProtectedIpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 6 • Emergency" title="Emergency Registration" description="Rapid known/unknown emergency registration with triage and IPD handoff placeholders." actions={<><PrintButton label="Print card" /><Button disabled={readOnly}>Register emergency patient</Button></>} /><AlertBanner icon={ShieldAlert} tone="warning" title="Unknown patient safety">Temporary ID, approximate age, gender, arrival mode, and chief complaint are enough for rapid emergency capture.</AlertBanner><Card><CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{["Known/unknown toggle", "Patient search", "Temporary emergency ID", "Approximate age", "Gender", "Brought by", "Contact number", "Chief complaint", "Emergency tag", "Arrival mode", "Arrival time"].map(field => <label key={field} className="space-y-1 text-sm"><span className="font-medium">{field}</span><Input placeholder={field} /></label>)}</CardContent></Card><StickyActionBar readOnly={readOnly} saveLabel="Send to triage" /></>}</ProtectedIpd>;
}

export function TriagePage() {
  return <ProtectedIpd>{() => <><PageHeader eyebrow="Phase 6 • Triage" title="Triage Management" description="Priority, vitals, symptoms, reassessment, escalation, and handoff to casualty/IPD." actions={<PrintButton label="Print triage" />} /><AlertBanner icon={ShieldAlert} tone="critical" title="Priority must remain visible">Red/orange priority, reassessment timers, unknown identity, and escalation reasons are shown in every triage row.</AlertBanner><GenericTable rows={mockTriageQueue} /></>}</ProtectedIpd>;
}

export function EmergencySimplePage({ title, description, rows, icon: Icon = Ambulance, print = true }: { title: string; description: string; rows: Record<string, unknown>[]; icon?: typeof Ambulance; print?: boolean }) {
  return <ProtectedIpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 6 • Emergency" title={title} description={description} actions={<>{print ? <PrintButton /> : null}<Button disabled={readOnly}><Icon className="h-4 w-4" />Add action</Button></>} /><GenericTable rows={rows} /></>}</ProtectedIpd>;
}

function GenericTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = React.useMemo<ColumnDef<Record<string, unknown>>[]>(() => Object.keys(rows[0] ?? {}).filter(k => k !== "id").slice(0, 8).map((key) => ({
    header: key.replace(/([A-Z])/g, " $1"),
    cell: ({ row }) => {
      const value = row.original[key];
      if (key === "patientId") return <PatientMini patientId={String(value)} compact />;
      if (key.toLowerCase().includes("status")) return <IpdStatus status={String(value)} />;
      if (key.toLowerCase().includes("priority") || key === "triage") return <TriageBadge priority={String(value)} />;
      return String(value);
    },
  })), [rows]);
  return <DataTable data={rows} columns={columns} />;
}

function DetailRows({ rows }: { rows: [string, React.ReactNode][] }) {
  return <Card><CardContent className="p-3">{rows.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}</CardContent></Card>;
}

function InfoCard({ title, value }: { title: string; value: React.ReactNode }) {
  return <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">{title}</div><div className="mt-1 text-sm font-semibold">{value}</div></CardContent></Card>;
}

function SidePanel({ title, items }: { title: string; items: string[] }) {
  return <Card><CardContent className="space-y-2 p-3"><div className="text-sm font-semibold">{title}</div>{items.map(item => <div key={item} className="rounded-md border border-border p-2 text-xs text-muted-foreground">{item}</div>)}</CardContent></Card>;
}
