"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ClipboardList, Download, FileText, HeartPulse, Pill, Plus, Printer, RefreshCcw, Search, ShieldAlert, Stethoscope, Syringe, Thermometer, Workflow } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import { AppointmentDetailDrawer } from "@/features/appointments/appointment-shared";
import { PatientMini } from "@/features/appointments/appointment-shared";
import {
  ClinicalLinkBar,
  ClinicalPatientHeader,
  ClinicalPrintActions,
  ClinicalSafetyPanel,
  ClinicalStatus,
  CompletionChecklist,
  ProtectedOpd,
  VisitContext,
} from "@/features/opd/opd-shared";
import { getPatientById } from "@/data/patients";
import { mockAppointments, mockQueueEntries } from "@/data/appointments";
import {
  getConsultationByVisit,
  mockAllergies,
  mockChronicConditions,
  mockClinicalHandoffs,
  mockClinicalTemplates,
  mockConsultations,
  mockDiagnoses,
  mockDrugAlerts,
  mockOpdWorklist,
  mockPrescriptionMedicines,
  mockPrescriptionPrintHistory,
  mockProcedures,
  mockVaccinations,
  mockVitals,
} from "@/data/opd";
import type { AllergyRecord, ClinicalTemplate, ConsultationRecord, DiagnosisRecord, OpdWorklistItem, PrescriptionMedicine, VitalRecord } from "@/types";

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function OpdWorklistPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<OpdWorklistItem | null>(null);
  const appointment = selected ? mockAppointments.find((item) => item.id === selected.appointmentId) ?? null : null;
  const rows = mockOpdWorklist.filter((item) => {
    const patient = getPatientById(item.patientId);
    const text = `${patient?.firstName} ${patient?.lastName} ${patient?.uhid} ${item.tokenNo} ${item.department} ${item.doctor} ${item.queueStatus} ${item.consultationStatus}`;
    return includes(text, search) && (status === "All status" || item.consultationStatus === status);
  });
  const columns = React.useMemo<ColumnDef<OpdWorklistItem>[]>(() => [
    { header: "Token", accessorKey: "tokenNo" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Time", accessorKey: "appointmentTime" },
    { header: "Waiting", accessorKey: "waitingTime" },
    { header: "Visit", accessorKey: "visitType" },
    { header: "Vitals", cell: ({ row }) => <ClinicalStatus status={row.original.vitalsStatus} /> },
    { header: "Consultation", cell: ({ row }) => <ClinicalStatus status={row.original.consultationStatus} /> },
    { header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button size="sm" asChild><Link href={`/opd/consultation/${row.original.visitId}`}>Start</Link></Button><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Context</Button></div> },
  ], []);
  return (
    <ProtectedOpd>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 5 • OPD" title="OPD Worklist" description="Doctor-facing checked-in queue with patient alerts, vitals state, consultation state, and appointment context." actions={<><Button variant="outline" onClick={() => toast.success("Static OPD worklist refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button><Button variant="outline" asChild><Link href="/appointments/calendar">Calendar</Link></Button><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button><Button disabled={readOnly} asChild><Link href="/opd/consultation/visit-001"><Stethoscope className="h-4 w-4" />Start next</Link></Button></>} />
          <SummaryGrid>
            <StatCard label="Waiting" value={mockQueueEntries.filter((q) => q.status === "Waiting").length} change="Queue" context="Needs doctor" tone="warning" icon={Stethoscope} />
            <StatCard label="In consultation" value={mockOpdWorklist.filter((w) => w.consultationStatus === "In progress").length} change="Active" context="Clinical rooms" tone="info" icon={ClipboardList} />
            <StatCard label="Completed today" value={mockConsultations.filter((c) => c.status === "Completed").length} change="Done" context="Printed/locked" tone="success" icon={FileText} />
            <StatCard label="Critical alerts" value={mockVitals.filter((v) => v.status === "Critical").length + mockAllergies.filter((a) => a.severity === "Severe" || a.severity === "Critical").length} change="Safety" context="Vitals/allergies" tone="danger" icon={ShieldAlert} />
          </SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, token, doctor, status...">
            <NativeSelect label="Consultation status" value={status} onChange={setStatus} options={["All status", "Not started", "In progress", "Draft saved", "Completed"]} />
          </FilterBar>
          <DataTable data={rows} columns={columns} />
          <AppointmentDetailDrawer appointment={appointment} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
        </>
      )}
    </ProtectedOpd>
  );
}

export function ConsultationPage({ visitId }: { visitId: string }) {
  const consultation = getConsultationByVisit(visitId) ?? mockConsultations[0];
  return (
    <ProtectedOpd>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 5 • Consultation" title="OPD Consultation" description="Tab-based clinical workspace with patient safety context, draft state, handoffs, print, and completion checklist." actions={<><ClinicalPrintActions /><Button disabled={readOnly}>Save draft</Button><Button disabled={readOnly}>Complete consultation</Button></>} />
          <ClinicalPatientHeader patientId={consultation.patientId} token={mockOpdWorklist.find((item) => item.visitId === visitId)?.tokenNo} appointmentTime={mockOpdWorklist.find((item) => item.visitId === visitId)?.appointmentTime} consultation={consultation} />
          <ClinicalSafetyPanel patientId={consultation.patientId} />
          <VisitContext consultation={consultation} />
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Tabs defaultValue="complaints" className="min-w-0 space-y-4">
              <TabsList><TabsTrigger value="complaints">Chief complaints</TabsTrigger><TabsTrigger value="history">History</TabsTrigger><TabsTrigger value="exam">Examination</TabsTrigger><TabsTrigger value="vitals">Vitals</TabsTrigger><TabsTrigger value="diagnosis">Diagnosis</TabsTrigger><TabsTrigger value="rx">Prescription</TabsTrigger><TabsTrigger value="advice">Advice</TabsTrigger><TabsTrigger value="summary">Summary</TabsTrigger></TabsList>
              <TabsContent value="complaints"><NoteEditor title="Chief complaints" defaultValue={consultation.chiefComplaint} /></TabsContent>
              <TabsContent value="history"><NoteEditor title="History of present illness" defaultValue={consultation.notes} /></TabsContent>
              <TabsContent value="exam"><NoteEditor title="Examination findings" defaultValue="Cardio-respiratory exam placeholder. Template insertion appends by default." /></TabsContent>
              <TabsContent value="vitals"><VitalsTable patientId={consultation.patientId} /></TabsContent>
              <TabsContent value="diagnosis"><DiagnosisTable patientId={consultation.patientId} /></TabsContent>
              <TabsContent value="rx"><PrescriptionTable prescriptionId={consultation.prescriptionId} patientId={consultation.patientId} /></TabsContent>
              <TabsContent value="advice"><HandoffPanel consultation={consultation} /></TabsContent>
              <TabsContent value="summary"><ConsultationSummary consultation={consultation} /></TabsContent>
            </Tabs>
            <div className="min-w-0 space-y-4"><CompletionChecklist /><ClinicalLinkBar /><HandoffPanel consultation={consultation} compact /></div>
          </div>
          <StickyActionBar readOnly={readOnly} saveLabel="Complete consultation" />
        </>
      )}
    </ProtectedOpd>
  );
}

function NoteEditor({ title, defaultValue }: { title: string; defaultValue: string }) {
  return <Card><CardContent className="space-y-3 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-semibold">{title}</div><Button size="sm" variant="outline" onClick={() => toast.info("Template appended to note placeholder")}>Insert template</Button></div><textarea className="min-h-40 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue={defaultValue} /><div className="flex flex-wrap gap-2">{["Append only", "Copy last visit", "Save as template", "Clear requires confirmation"].map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div></CardContent></Card>;
}

function HandoffPanel({ consultation, compact }: { consultation: ConsultationRecord; compact?: boolean }) {
  const entries = Object.entries(consultation.handoffStatuses);
  return <Card><CardContent className="space-y-2 p-3"><div className="text-sm font-semibold">Clinical handoffs</div>{entries.map(([target, status]) => <div key={target} className="flex items-center justify-between rounded-md border border-border p-2 text-xs"><span className="capitalize">{target}</span><ClinicalStatus status={status} /></div>)}{!compact ? <AlertBanner icon={Workflow} tone="info" title="Placeholder only">No pharmacy, billing, lab, or radiology order is created in Phase 5.</AlertBanner> : null}</CardContent></Card>;
}

function ConsultationSummary({ consultation }: { consultation: ConsultationRecord }) {
  return <Card><CardContent className="space-y-3 p-4"><DetailRow label="Status" value={<ClinicalStatus status={consultation.status} />} /><DetailRow label="Started" value={consultation.startedAt} /><DetailRow label="Completed" value={consultation.completedAt ?? "Not completed"} /><DetailRow label="Printed" value={consultation.printedAt ?? "Not printed"} /><DetailRow label="Addendum" value="Addendum placeholder does not overwrite original notes" /></CardContent></Card>;
}

export function NotesPage() {
  return <ProtectedOpd>{() => <><PageHeader eyebrow="Phase 5 • Notes" title="Clinical Notes" description="Structured and free-text clinical notes with safe template insertion and SOAP mode support." actions={<Button variant="outline" onClick={() => toast.info("Clinical notes export placeholder")}><Download className="h-4 w-4" />Export</Button>} /><Tabs defaultValue="notes" className="space-y-4"><TabsList><TabsTrigger value="notes">Clinical notes</TabsTrigger><TabsTrigger value="soap">SOAP notes</TabsTrigger><TabsTrigger value="templates">Template picker</TabsTrigger></TabsList><TabsContent value="notes" className="grid gap-4 md:grid-cols-2">{["Chief complaints", "History of present illness", "Past medical history", "Surgical history", "Family history", "Social history", "Examination findings", "Doctor advice"].map((section) => <NoteEditor key={section} title={section} defaultValue={`${section} placeholder text.`} />)}</TabsContent><TabsContent value="soap"><SoapPanel /></TabsContent><TabsContent value="templates"><TemplatesGrid /></TabsContent></Tabs></>}</ProtectedOpd>;
}

function SoapPanel() {
  return <div className="grid gap-4 md:grid-cols-2">{["Subjective", "Objective", "Assessment", "Plan"].map((section) => <NoteEditor key={section} title={section} defaultValue={`${section} SOAP content placeholder. Switching modes preserves draft content.`} />)}</div>;
}

export function DiagnosisPage() {
  return <ProtectedOpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 5 • Diagnosis" title="Diagnosis & ICD Coding" description="Diagnosis capture, primary/secondary markers, ICD placeholder, templates, and remove-primary safety." actions={<Button disabled={readOnly}><Plus className="h-4 w-4" />Add diagnosis</Button>} /><AlertBanner icon={Search} tone="info" title="ICD placeholder">ICD search, specialty templates, and recently used diagnosis lists are static and do not call an external coding API.</AlertBanner><DiagnosisTable /><TemplatesGrid filter="Diagnosis" /></>}</ProtectedOpd>;
}

function DiagnosisTable({ patientId }: { patientId?: string }) {
  const rows = patientId ? mockDiagnoses.filter((dx) => dx.patientId === patientId) : mockDiagnoses;
  const columns = React.useMemo<ColumnDef<DiagnosisRecord>[]>(() => [
    { header: "Diagnosis", accessorKey: "diagnosis" }, { header: "ICD", accessorKey: "icdCode" }, { header: "Type", accessorKey: "type" }, { header: "Primary", cell: ({ row }) => row.original.primary ? <Badge tone="success">Primary</Badge> : <Badge tone="muted">Secondary</Badge> }, { header: "Severity", cell: ({ row }) => <ClinicalStatus status={row.original.severity} /> }, { header: "Status", cell: ({ row }) => <ClinicalStatus status={row.original.status} /> }, { header: "Actions", cell: () => <Button size="sm" variant="outline">Edit</Button> },
  ], []);
  return <DataTable data={rows} columns={columns} />;
}

function VitalsTable({ patientId }: { patientId?: string }) {
  const rows = patientId ? mockVitals.filter((vital) => vital.patientId === patientId) : mockVitals;
  const columns = React.useMemo<ColumnDef<VitalRecord>[]>(() => [
    { header: "Date/time", accessorKey: "recordedAt" },
    { header: "Recorded by", accessorKey: "recordedBy" },
    { header: "Temp", accessorKey: "temperature" },
    { header: "Pulse", accessorKey: "pulse" },
    { header: "BP", accessorKey: "bloodPressure" },
    { header: "SpO2", accessorKey: "spo2" },
    { header: "BMI", accessorKey: "bmi" },
    { header: "Status", cell: ({ row }) => <ClinicalStatus status={row.original.status} /> },
  ], []);
  return <DataTable data={rows} columns={columns} />;
}

export function PrescriptionsPage() {
  return <ProtectedOpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 5 • Prescription" title="Prescription Management" description="Medicine entry, dose/frequency/duration rows, allergy warnings, interaction placeholders, and print preview." actions={<><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button><Button disabled={readOnly}><Pill className="h-4 w-4" />Save prescription</Button></>} /><ClinicalSafetyPanel patientId="pat-001" /><AlertBanner icon={AlertTriangle} tone="danger" title="Prescription safety placeholders">{mockDrugAlerts.map((alert) => alert.alert).join("; ")}</AlertBanner><div className="grid gap-4 xl:grid-cols-[1fr_360px]"><PrescriptionTable prescriptionId="rx-001" patientId="pat-001" /><PrescriptionPreview /></div></>}</ProtectedOpd>;
}

function PrescriptionTable({ prescriptionId }: { prescriptionId: string; patientId?: string }) {
  const rows = mockPrescriptionMedicines.filter((medicine) => medicine.prescriptionId === prescriptionId);
  const columns = React.useMemo<ColumnDef<PrescriptionMedicine>[]>(() => [
    { header: "Medicine", cell: ({ row }) => <div><div className="font-medium">{row.original.medicineName}</div><div className="text-xs text-muted-foreground">{row.original.genericName} • {row.original.strength}</div></div> },
    { header: "Dose", cell: ({ row }) => `${row.original.dose} ${row.original.doseUnit}` },
    { header: "Frequency", accessorKey: "frequency" },
    { header: "Duration", cell: ({ row }) => `${row.original.duration} ${row.original.durationUnit}` },
    { header: "Timing", accessorKey: "timing" },
    { header: "Route", accessorKey: "route" },
    { header: "Qty", accessorKey: "quantity" },
    { header: "Alerts", cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.alerts.map((alert) => <Badge key={alert} tone="warning">{alert}</Badge>)}</div> },
  ], []);
  return <DataTable data={rows} columns={columns} />;
}

function PrescriptionPreview() {
  return <Card><CardContent className="space-y-3 bg-white p-4 text-slate-900"><div className="text-sm font-semibold">Plasmit Hospital Prescription Preview</div><div className="text-xs">Patient: Meera Joshi • UHID PLH-240118 • Allergy: Penicillin</div><div className="border-t pt-3 text-xs">Medicines, diagnosis, advice, follow-up, and doctor signature placeholder. Internal warnings hidden unless selected.</div><div className="text-xs text-slate-500">Print history: {mockPrescriptionPrintHistory[0]?.printedAt ?? "Draft not printed"}</div></CardContent></Card>;
}

export function ProceduresPage() {
  return <SimpleClinicalTable title="Procedure Management" description="Advised/performed OPD procedures, billing link, consent, and referral placeholders." rows={mockProcedures} icon={Workflow} />;
}

export function VitalsPage() {
  const columns = React.useMemo<ColumnDef<VitalRecord>[]>(() => [
    { header: "Date/time", accessorKey: "recordedAt" }, { header: "Recorded by", accessorKey: "recordedBy" }, { header: "Temp", accessorKey: "temperature" }, { header: "Pulse", accessorKey: "pulse" }, { header: "BP", accessorKey: "bloodPressure" }, { header: "SpO2", accessorKey: "spo2" }, { header: "Weight", accessorKey: "weight" }, { header: "BMI", accessorKey: "bmi" }, { header: "Status", cell: ({ row }) => <ClinicalStatus status={row.original.status} /> },
  ], []);
  return <ProtectedOpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 5 • Vitals" title="Vitals Management" description="Vitals entry, units, reference range placeholders, trend cards, and abnormal indicators." actions={<><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print vitals</Button><Button disabled={readOnly}><Thermometer className="h-4 w-4" />Record vitals</Button></>} /><SummaryGrid><StatCard label="Abnormal" value={mockVitals.filter(v => v.status === "Abnormal").length} change="Review" context="Visible in header" tone="warning" icon={HeartPulse} /><StatCard label="Critical" value={mockVitals.filter(v => v.status === "Critical").length} change="Urgent" context="Emergency" tone="critical" icon={ShieldAlert} /><StatCard label="Missing" value={mockOpdWorklist.filter(w => w.vitalsStatus === "Missing").length} change="Required" context="Before complete" tone="danger" icon={Thermometer} /><StatCard label="Manual entries" value={mockVitals.length} change="Static" context="No device integration" tone="info" icon={ClipboardList} /></SummaryGrid><DataTable data={mockVitals} columns={columns} /><Card><CardContent className="grid gap-3 p-4 md:grid-cols-3">{["BP trend placeholder", "Weight/BMI trend placeholder", "Temperature trend placeholder"].map((item) => <div key={item} className="rounded-md border border-border bg-surface-muted p-4 text-sm">{item}</div>)}</CardContent></Card></>}</ProtectedOpd>;
}

export function AllergiesPage() {
  const columns = React.useMemo<ColumnDef<AllergyRecord>[]>(() => [
    { header: "Allergen", accessorKey: "allergen" }, { header: "Type", accessorKey: "type" }, { header: "Reaction", accessorKey: "reaction" }, { header: "Severity", cell: ({ row }) => <ClinicalStatus status={row.original.severity} /> }, { header: "Status", cell: ({ row }) => <ClinicalStatus status={row.original.status} /> }, { header: "Updated", accessorKey: "updatedAt" }, { header: "Actions", cell: () => <Button size="sm" variant="outline">Review</Button> },
  ], []);
  return <ProtectedOpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 5 • Allergies" title="Allergy Management" description="Allergy records that stay visible in consultation and prescription safety contexts." actions={<Button disabled={readOnly}><Plus className="h-4 w-4" />Add allergy</Button>} /><AlertBanner icon={ShieldAlert} tone="danger" title="Prescription integration placeholder">Severe and critical allergies are surfaced in prescription screens before medicine entry.</AlertBanner><DataTable data={mockAllergies} columns={columns} /></>}</ProtectedOpd>;
}

export function VaccinationsPage() {
  return <SimpleClinicalTable title="Vaccination Management" description="Vaccination schedule, due/overdue/administered states, batch, expiry, and adverse event placeholders." rows={mockVaccinations} icon={Syringe} print />;
}

export function ChronicCarePage() {
  return <SimpleClinicalTable title="Chronic Disease Management" description="Chronic conditions, control status, current medicines, risk markers, and review dates." rows={mockChronicConditions} icon={HeartPulse} />;
}

export function TemplatesPage() {
  return <ProtectedOpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 5 • Templates" title="Clinical Templates" description="Reusable templates for notes, SOAP, diagnosis, prescription, procedures, advice, and follow-up." actions={<Button disabled={readOnly}><Plus className="h-4 w-4" />Create template</Button>} /><TemplatesGrid /></>}</ProtectedOpd>;
}

function TemplatesGrid({ filter }: { filter?: ClinicalTemplate["type"] }) {
  const templates = filter ? mockClinicalTemplates.filter((template) => template.type === filter) : mockClinicalTemplates;
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => <Card key={template.id}><CardContent className="space-y-2 p-4"><div className="flex justify-between gap-2"><div className="font-semibold">{template.name}</div><ClinicalStatus status={template.status} /></div><div className="text-xs text-muted-foreground">{template.type} • {template.specialty} • {template.scope}</div><p className="text-sm text-muted-foreground">{template.content}</p><div className="flex flex-wrap gap-1">{template.tags.map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}</div><Button size="sm" variant="outline" onClick={() => toast.info("Template insertion appends and re-runs safety warnings")}>Insert</Button></CardContent></Card>)}</div>;
}

function SimpleClinicalTable({ title, description, rows, icon: Icon, print }: { title: string; description: string; rows: Record<string, unknown>[]; icon: typeof Workflow; print?: boolean }) {
  const columns = React.useMemo<ColumnDef<Record<string, unknown>>[]>(() => Object.keys(rows[0] ?? {}).filter((key) => key !== "id" && key !== "patientId").slice(0, 7).map((key) => ({
    header: key.replace(/([A-Z])/g, " $1"),
    cell: ({ row }) => {
      const value = row.original[key];
      return key.toLowerCase().includes("status") || key.toLowerCase().includes("severity") || key.toLowerCase().includes("priority") ? <ClinicalStatus status={String(value)} /> : String(value);
    },
  })), [rows]);
  return <ProtectedOpd>{({ readOnly }) => <><PageHeader eyebrow="Phase 5 • OPD" title={title} description={description} actions={<>{print ? <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button> : null}<Button disabled={readOnly}><Icon className="h-4 w-4" />Add record</Button></>} /><DataTable data={rows} columns={columns} /></>}</ProtectedOpd>;
}

export function ClinicalHandoffsPreview() {
  return <div className="space-y-2">{mockClinicalHandoffs.map((handoff) => <Card key={handoff.id}><CardContent className="flex justify-between gap-3 p-3 text-sm"><span>{handoff.targetDepartment} • {handoff.handoffType}</span><ClinicalStatus status={handoff.status} /></CardContent></Card>)}</div>;
}
