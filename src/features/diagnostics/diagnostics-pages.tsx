"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Barcode,
  CalendarClock,
  Eye,
  FileCheck2,
  FileClock,
  FilePenLine,
  FlaskConical,
  Microscope,
  MonitorCog,
  Package,
  Printer,
  RefreshCcw,
  ScanLine,
  ScanSearch,
  Search,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import { PatientMini } from "@/features/appointments/appointment-shared";
import {
  BarcodePreview,
  CriticalBanner,
  DiagnosticOrderHeader,
  DiagnosticSafetyBanner,
  DiagnosticStatus,
  ProtectedDiagnostics,
} from "@/features/diagnostics/diagnostics-shared";
import {
  getLabOrderById,
  getRadiologyOrderById,
  mockAnalyzers,
  mockCriticalLabAlerts,
  mockLabOrders,
  mockLabPackages,
  mockLabResults,
  mockLabTests,
  mockPacsStudies,
  mockRadiologyOrders,
  mockRadiologyReports,
  mockRadiologySafetyChecklists,
  mockRadiologySchedules,
  mockSampleCollections,
  mockSampleCustodyEvents,
} from "@/data/diagnostics";
import { getPatientById } from "@/data/patients";
import type {
  LabDepartment,
  LabOrder,
  LabPackage,
  LabTest,
  RadiologyModality,
  RadiologyOrder,
  RadiologySafetyChecklist,
  SampleCollection,
} from "@/types";

type LabResultRecord = (typeof mockLabResults)[number];

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function patientUhid(patientId: string) {
  return getPatientById(patientId)?.uhid ?? "Unknown";
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">{children}</div>;
}

function DiagnosticShell({
  module,
  title,
  description,
  icon: Icon,
  children,
  actions,
}: {
  module: "lab" | "radiology";
  title: string;
  description: string;
  icon: typeof FlaskConical;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <ProtectedDiagnostics module={module}>
      {() => (
        <>
          <PageHeader
            eyebrow={`Phase 8 • ${module === "lab" ? "Laboratory / LIS" : "Radiology / RIS"}`}
            title={title}
            description={description}
            actions={
              actions ?? (
                <>
                  <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
                  <Button variant="outline" onClick={() => toast.info("Static diagnostics refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
                  <Button><Icon className="h-4 w-4" />Open worklist</Button>
                </>
              )
            }
          />
          {children}
        </>
      )}
    </ProtectedDiagnostics>
  );
}

export function LaboratoryDashboardPage() {
  return (
    <DiagnosticShell
      module="lab"
      title="Laboratory"
      description="Operational LIS dashboard for orders, samples, processing, result entry, approvals, critical alerts, and analyzer placeholders."
      icon={FlaskConical}
      actions={<><Button variant="outline" asChild><Link href="/laboratory/samples">Collect sample</Link></Button><Button variant="outline" asChild><Link href="/laboratory/results">Enter result</Link></Button><Button asChild><Link href="/laboratory/critical-alerts">Critical alerts</Link></Button></>}
    >
      <SummaryGrid>
        <StatCard label="Orders today" value={mockLabOrders.length} change="Live static" context="LIS queue" tone="info" icon={FlaskConical} />
        <StatCard label="Samples pending" value={mockLabOrders.filter((item) => item.sampleStatus === "Pending collection").length} change="Collect" context="Front desk / ward" tone="warning" icon={TestTube2} />
        <StatCard label="Collected" value={mockSampleCollections.filter((item) => item.status === "Collected" || item.status === "Processing").length} change="Custody" context="Tracked" tone="success" icon={Barcode} />
        <StatCard label="Results pending" value={mockLabOrders.filter((item) => item.resultStatus === "Not entered" || item.resultStatus === "Draft").length} change="Entry" context="Result bench" tone="warning" icon={FilePenLine} />
        <StatCard label="Approval pending" value={mockLabOrders.filter((item) => item.status === "Approval pending").length} change="Pathologist" context="Review queue" tone="info" icon={ShieldCheck} />
        <StatCard label="Critical alerts" value={mockCriticalLabAlerts.length} change="Escalate" context="Acknowledgement" tone="critical" icon={AlertTriangle} />
        <StatCard label="Rejected samples" value={mockSampleCollections.filter((item) => item.status.includes("placeholder")).length} change="Reason" context="Quality issue" tone="danger" icon={TestTube2} />
        <StatCard label="Avg TAT" value={42} change="Minutes" context="Future analytics" tone="muted" icon={FileClock} />
      </SummaryGrid>
      <DiagnosticSafetyBanner type="lab" />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <LabOrdersPage embedded />
        <div className="space-y-4">
          <CriticalAlertCards />
          <DepartmentLinks />
          <AnalyzerCards compact />
        </div>
      </div>
    </DiagnosticShell>
  );
}

export function LabOrdersPage({ embedded }: { embedded?: boolean }) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<LabOrder | null>(null);
  const rows = mockLabOrders.filter((order) => {
    const patient = getPatientById(order.patientId);
    const text = `${order.orderNo} ${patient?.firstName} ${patient?.lastName} ${patient?.uhid} ${order.source} ${order.tests.join(" ")} ${order.department} ${order.priority} ${order.status}`;
    return includes(text, search) && (status === "All status" || order.status === status);
  });
  const columns = React.useMemo<ColumnDef<LabOrder>[]>(() => [
    { header: "Order", accessorKey: "orderNo" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "UHID", cell: ({ row }) => patientUhid(row.original.patientId) },
    { header: "Source", accessorKey: "source" },
    { header: "Test/package", cell: ({ row }) => row.original.tests.join(", ") },
    { header: "Department", accessorKey: "department" },
    { header: "Priority", cell: ({ row }) => <DiagnosticStatus status={row.original.priority} /> },
    { header: "Sample", cell: ({ row }) => <DiagnosticStatus status={row.original.sampleStatus} /> },
    { header: "Result", cell: ({ row }) => <DiagnosticStatus status={row.original.resultStatus} /> },
    { header: "Ordered by", accessorKey: "orderedBy" },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], [setSelected]);
  const content = (
    <>
      <FilterBar search={search} onSearch={setSearch} placeholder="Search order, patient, UHID, source, test, status...">
        <NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Ordered", "Sample pending", "Sample collected", "In processing", "Approval pending", "Approved", "Rejected", "Report printed"]} />
      </FilterBar>
      <DataTable data={rows} columns={columns} />
      <LabOrderDrawer order={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
  if (embedded) return <Card className="min-w-0"><CardContent className="min-w-0 space-y-3 p-3"><div className="font-semibold">Lab order worklist</div>{content}</CardContent></Card>;
  return <DiagnosticShell module="lab" title="Lab Orders" description="OPD, IPD, emergency, and external laboratory order worklist with source, sample, result, billing, and EMR handoff context." icon={FlaskConical}>{content}</DiagnosticShell>;
}

export function TestMasterPage() {
  const [selected, setSelected] = React.useState<LabTest | null>(null);
  const columns = React.useMemo<ColumnDef<LabTest>[]>(() => [
    { header: "Test", accessorKey: "name" },
    { header: "Code", accessorKey: "code" },
    { header: "Department", accessorKey: "department" },
    { header: "Sample type", accessorKey: "sampleType" },
    { header: "Method", accessorKey: "method" },
    { header: "Ranges", cell: ({ row }) => <DiagnosticStatus status={row.original.normalRangeStatus} /> },
    { header: "Price", accessorKey: "price" },
    { header: "Status", cell: ({ row }) => <DiagnosticStatus status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Configure</Button> },
  ], [setSelected]);
  return <DiagnosticShell module="lab" title="Test Master" description="Structured test setup for sample requirements, result parameters, reference ranges, report settings, billing placeholder, and audit readiness." icon={Microscope}><DataTable data={mockLabTests} columns={columns} /><TestDrawer test={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></DiagnosticShell>;
}

export function LabPackagesPage() {
  const [selected, setSelected] = React.useState<LabPackage | null>(null);
  const columns = React.useMemo<ColumnDef<LabPackage>[]>(() => [
    { header: "Package", accessorKey: "name" },
    { header: "Code", accessorKey: "code" },
    { header: "Included tests", cell: ({ row }) => row.original.includedTests.join(", ") },
    { header: "Department", accessorKey: "department" },
    { header: "Price", accessorKey: "price" },
    { header: "Status", cell: ({ row }) => <DiagnosticStatus status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], [setSelected]);
  return <DiagnosticShell module="lab" title="Test Packages" description="Lab package management with included tests, sample conflicts, report grouping, and billing placeholder details." icon={Package}><DataTable data={mockLabPackages} columns={columns} /><PackageDrawer item={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></DiagnosticShell>;
}

export function SampleCollectionPage() {
  const [selected, setSelected] = React.useState<SampleCollection | null>(mockSampleCollections[0]);
  const columns = React.useMemo<ColumnDef<SampleCollection>[]>(() => [
    { header: "Time", accessorKey: "collectedAt" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={getLabOrderById(row.original.orderId)?.patientId ?? ""} /> },
    { header: "UHID", cell: ({ row }) => patientUhid(getLabOrderById(row.original.orderId)?.patientId ?? "") },
    { header: "Order", cell: ({ row }) => getLabOrderById(row.original.orderId)?.orderNo },
    { header: "Sample", accessorKey: "sampleType" },
    { header: "Barcode", accessorKey: "barcode" },
    { header: "Status", cell: ({ row }) => <DiagnosticStatus status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Collect</Button> },
  ], [setSelected]);
  return <DiagnosticShell module="lab" title="Sample Collection" description="Collection queue with barcode labels, patient/order matching, reprint reason, rejection, recollection, quality issue, and custody preview." icon={Barcode}><DiagnosticOrderHeader labOrderId={selected?.orderId ?? "lo-001"} /><div className="grid gap-4 xl:grid-cols-[1fr_360px]"><DataTable data={mockSampleCollections} columns={columns} /><SampleActionPanel sample={selected} /></div><StickyActionBar saveLabel="Mark collected" /></DiagnosticShell>;
}

export function SampleProcessingPage() {
  return <LabBoardPage title="Sample Processing" description="Department routing board with received samples, analyzer/manual routing, TAT delay, custody, rejection, recollection, and quality issue states." rows={mockSampleCollections} />;
}

export function BarcodeManagementPage() {
  const [scan, setScan] = React.useState("BC-8844-WB");
  const sample = mockSampleCollections.find((item) => item.barcode === scan) ?? mockSampleCollections[1];
  const order = getLabOrderById(sample.orderId);
  return (
    <DiagnosticShell module="lab" title="Barcode Management" description="Keyboard-friendly barcode scan, preview, recent scans, reprint queue, damaged-label placeholder, and custody lookup." icon={Barcode}>
      <DiagnosticSafetyBanner type="lab" />
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card><CardContent className="space-y-3 p-4"><div className="text-sm font-semibold">Scan barcode</div><Input value={scan} onChange={(event) => setScan(event.target.value)} aria-label="Scan barcode" /><Button className="w-full" onClick={() => toast.info("Barcode scan placeholder matched static record")}><ScanLine className="h-4 w-4" />Scan placeholder</Button><BarcodePreview barcode={sample.barcode} orderNo={order?.orderNo ?? "Unknown"} patientName={order ? patientUhid(order.patientId) : "Unknown"} sampleType={sample.sampleType} /></CardContent></Card>
        <div className="space-y-4"><SimpleRecordGrid title="Barcode details" records={[sample]} /><SimpleRecordGrid title="Recent custody events" records={mockSampleCustodyEvents.filter((item) => item.sampleId === sample.id)} /></div>
      </div>
    </DiagnosticShell>
  );
}

export function AnalyzerPage() {
  return <DiagnosticShell module="lab" title="Analyzer Integration" description="Future analyzer/device integration UI with connection states, sync logs, import placeholders, mapped tests, and failed import visibility." icon={MonitorCog}><DiagnosticSafetyBanner type="lab" /><AnalyzerCards /><SimpleTable records={mockAnalyzers} /></DiagnosticShell>;
}

export function ResultEntryPage() {
  const result = mockLabResults[0];
  const order = getLabOrderById(result.orderId);
  return (
    <DiagnosticShell module="lab" title="Result Entry" description="Structured result entry with parameter values, reference ranges, abnormal and critical flags, attachments, correction/addendum, and approval submission." icon={FilePenLine}>
      {order ? <DiagnosticOrderHeader labOrderId={order.id} /> : null}
      {result.critical ? <CriticalBanner>Critical value requires acknowledgement after approval placeholder and is visible before report print/export.</CriticalBanner> : null}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card><CardContent className="space-y-3 p-4"><div className="text-sm font-semibold">Parameter entry</div><ParameterTable result={result} /><textarea className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue="Comments, attachment placeholder, and correction reason are captured before submit." /></CardContent></Card>
        <Card><CardContent className="space-y-3 p-4"><div className="text-sm font-semibold">Version and approval</div><DetailRow label="Status" value={<DiagnosticStatus status={result.status} />} /><DetailRow label="Version" value={result.version} /><DetailRow label="Entered by" value={result.enteredBy} /><DetailRow label="Approved by" value={result.approvedBy} /><Button className="w-full">Submit for approval</Button><Button className="w-full" variant="outline">Print draft</Button></CardContent></Card>
      </div>
      <StickyActionBar saveLabel="Save result draft" />
    </DiagnosticShell>
  );
}

export function ApprovalPage() {
  return <LabResultWorklist title="Pathologist Approval" description="Approval queue with result values, abnormal/critical flags, previous result, attachments, comments, approve/reject/correction, and print report placeholders." />;
}

export function CriticalAlertsPage() {
  return <DiagnosticShell module="lab" title="Critical Lab Alerts" description="Critical result acknowledgement, escalation, contact, EMR handoff, and print/export placeholders." icon={AlertTriangle}><CriticalBanner>Critical alerts are not color-only; escalation and acknowledgement states stay visible in every theme.</CriticalBanner><CriticalAlertCards table /></DiagnosticShell>;
}

export function LabDepartmentPage({ department }: { department: LabDepartment }) {
  const rows = mockLabOrders.filter((order) => order.department === department);
  return <DiagnosticShell module="lab" title={department} description={`${department} worklist with department-specific result, sample, approval, and reporting placeholders.`} icon={Microscope}><SimpleTable records={rows} /><SimpleRecordGrid title="Department notes" records={[{ id: "note", worklist: department, placeholder: department === "Microbiology" ? "Culture and sensitivity workflow" : department === "Histopathology" ? "Grossing, microscopy, sign-out workflow" : "Analyzer/manual result workflow", emrHandoff: "Approved reports attach to EMR timeline placeholder" }]} /></DiagnosticShell>;
}

export function RadiologyDashboardPage() {
  return (
    <DiagnosticShell module="radiology" title="Radiology" description="RIS dashboard for orders, scheduling, modality queues, PACS state, DICOM placeholder, reporting, approvals, and critical findings." icon={ScanSearch} actions={<><Button variant="outline" asChild><Link href="/radiology/schedule">Schedule</Link></Button><Button variant="outline" asChild><Link href="/radiology/pacs">PACS</Link></Button><Button asChild><Link href="/radiology/reports">Reports</Link></Button></>}>
      <SummaryGrid>
        <StatCard label="Orders today" value={mockRadiologyOrders.length} change="RIS" context="Worklist" tone="info" icon={ScanSearch} />
        <StatCard label="Scheduled" value={mockRadiologyOrders.filter((item) => item.scheduleStatus === "Scheduled").length} change="Calendar" context="Slots" tone="warning" icon={CalendarClock} />
        <StatCard label="Reporting pending" value={mockRadiologyOrders.filter((item) => String(item.reportStatus).includes("pending") || item.reportStatus === "Report draft").length} change="Radiologist" context="Review" tone="info" icon={FilePenLine} />
        <StatCard label="PACS failures" value={mockRadiologyOrders.filter((item) => item.pacsStatus === "Sync failed placeholder").length} change="Placeholder" context="Sync errors" tone="danger" icon={MonitorCog} />
        <StatCard label="Critical findings" value={mockRadiologyReports.filter((item) => item.criticalFinding).length} change="Escalate" context="Acknowledgement" tone="critical" icon={AlertTriangle} />
        <StatCard label="Safety pending" value={mockRadiologyOrders.filter((item) => item.safetyChecklistStatus !== "Completed").length} change="Checklist" context="Before study" tone="warning" icon={ShieldCheck} />
        <StatCard label="Image available" value={mockPacsStudies.filter((item) => item.imageStatus === "Image available placeholder").length} change="Placeholder" context="No DICOM" tone="success" icon={Eye} />
        <StatCard label="Utilization" value={68} change="Percent" context="Modality load" tone="muted" icon={FileClock} />
      </SummaryGrid>
      <DiagnosticSafetyBanner type="radiology" />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"><RadiologyOrdersPage embedded /><ModalityLinks /></div>
    </DiagnosticShell>
  );
}

export function RadiologyOrdersPage({ embedded }: { embedded?: boolean }) {
  const [selected, setSelected] = React.useState<RadiologyOrder | null>(null);
  const columns = React.useMemo<ColumnDef<RadiologyOrder>[]>(() => [
    { header: "Order", accessorKey: "orderNo" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Modality", accessorKey: "modality" },
    { header: "Study", accessorKey: "study" },
    { header: "Source", accessorKey: "source" },
    { header: "Priority", cell: ({ row }) => <DiagnosticStatus status={row.original.priority} /> },
    { header: "Schedule", cell: ({ row }) => <DiagnosticStatus status={row.original.scheduleStatus} /> },
    { header: "PACS", cell: ({ row }) => <DiagnosticStatus status={row.original.pacsStatus} /> },
    { header: "Report", cell: ({ row }) => <DiagnosticStatus status={row.original.reportStatus} /> },
    { header: "Safety", cell: ({ row }) => <DiagnosticStatus status={row.original.safetyChecklistStatus} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], [setSelected]);
  const content = <><DataTable data={mockRadiologyOrders} columns={columns} /><RadiologyOrderDrawer order={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></>;
  if (embedded) return <Card className="min-w-0"><CardContent className="min-w-0 space-y-3 p-3"><div className="font-semibold">Radiology order worklist</div>{content}</CardContent></Card>;
  return <DiagnosticShell module="radiology" title="Radiology Orders" description="Imaging order worklist with modality, schedule, PACS, report, safety checklist, and EMR timeline context." icon={ScanSearch}>{content}</DiagnosticShell>;
}

export function RadiologySchedulePage() {
  return <DiagnosticShell module="radiology" title="Radiology Scheduling" description="Modality calendar with slots, preparation, consent, contrast, checklist, conflict warning, and emergency override placeholders." icon={CalendarClock}><DiagnosticSafetyBanner type="radiology" /><ScheduleBoard /></DiagnosticShell>;
}

export function PacsPage() {
  return <DiagnosticShell module="radiology" title="PACS Integration" description="Study list, image availability, PACS sync state, viewer placeholder, retry sync, link study, and sync log placeholders." icon={MonitorCog}><DiagnosticSafetyBanner type="viewer" /><SimpleTable records={mockPacsStudies} /></DiagnosticShell>;
}

export function DicomViewerPage() {
  const study = mockPacsStudies[0];
  return (
    <DiagnosticShell module="radiology" title="DICOM Viewer" description="Realistic viewer layout placeholder with study header, series panel, tool buttons, viewport, and report side panel. No real DICOM rendering." icon={ScanSearch}>
      <DiagnosticSafetyBanner type="viewer" />
      <DiagnosticOrderHeader radiologyOrderId={study.orderId} />
      <div className="grid min-h-[560px] gap-4 xl:grid-cols-[220px_1fr_320px]">
        <Card><CardContent className="space-y-2 p-3"><div className="text-sm font-semibold">Series</div>{["Scout", "Axial series", "Coronal reformats", "Prior comparison placeholder"].map((item) => <button key={item} className="w-full rounded-md border border-border bg-surface-muted p-2 text-left text-xs">{item}</button>)}</CardContent></Card>
        <Card><CardContent className="flex min-h-[520px] flex-col p-3"><div className="mb-3 flex flex-wrap gap-2">{["Zoom", "Pan", "Window/level", "Measure", "Rotate", "Invert", "Compare"].map((tool) => <Button key={tool} size="sm" variant="outline" disabled>{tool}</Button>)}</div><div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-center text-sm text-muted-foreground"><div><ScanSearch className="mx-auto mb-3 h-10 w-10" />DICOM image viewport placeholder<br />No diagnostic pixels are loaded in Phase 8.</div></div></CardContent></Card>
        <Card><CardContent className="space-y-3 p-4"><div className="text-sm font-semibold">Report side panel</div><DetailRow label="Study UID" value={study.studyUid} /><DetailRow label="Modality" value={study.modality} /><DetailRow label="Image" value={<DiagnosticStatus status={study.imageStatus} />} /><DetailRow label="Sync" value={<DiagnosticStatus status={study.syncStatus} />} /><Button className="w-full" variant="outline" asChild><Link href="/radiology/reports">Open report</Link></Button></CardContent></Card>
      </div>
    </DiagnosticShell>
  );
}

export function RadiologyReportsPage() {
  const report = mockRadiologyReports[0];
  const order = getRadiologyOrderById(report.orderId);
  return (
    <DiagnosticShell module="radiology" title="Radiology Reporting" description="Template-based report editor with indication, technique, findings, impression, recommendations, approval, addendum/correction, print preview, and critical finding panel." icon={FilePenLine}>
      {order ? <DiagnosticOrderHeader radiologyOrderId={order.id} /> : null}
      {mockRadiologyReports.some((item) => item.criticalFinding) ? <CriticalBanner>Critical radiology findings trigger acknowledgement and EMR timeline placeholders.</CriticalBanner> : null}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card><CardContent className="space-y-3 p-4"><Tabs defaultValue="findings"><TabsList><TabsTrigger value="findings">Findings</TabsTrigger><TabsTrigger value="impression">Impression</TabsTrigger><TabsTrigger value="templates">Templates</TabsTrigger><TabsTrigger value="approval">Approval</TabsTrigger></TabsList><TabsContent value="findings"><textarea className="min-h-48 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue={report.findings} /></TabsContent><TabsContent value="impression"><textarea className="min-h-36 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue={report.impression} /></TabsContent><TabsContent value="templates"><SimpleRecordGrid title="Template picker" records={[{ id: "tpl-ct", template: "Emergency CT brain", warning: "Insert appends; does not overwrite existing report" }, { id: "tpl-xray", template: "X-Ray fracture follow-up", warning: "Prior study comparison placeholder" }]} /></TabsContent><TabsContent value="approval"><SimpleTable records={mockRadiologyReports} /></TabsContent></Tabs></CardContent></Card>
        <Card><CardContent className="space-y-3 bg-white p-4 text-slate-900"><div className="text-sm font-semibold">Print preview</div><div className="text-xs">Plasmit Hospital Radiology Report</div><DetailRow label="Version" value={report.version} /><DetailRow label="Status" value={report.status} /><DetailRow label="Radiologist" value={report.radiologist} /><div className="rounded-md border p-3 text-xs">Approved reports are read-only unless correction/addendum placeholder is started.</div></CardContent></Card>
      </div>
      <StickyActionBar saveLabel="Submit report" />
    </DiagnosticShell>
  );
}

export function ModalityWorklistPage({ modality }: { modality: RadiologyModality }) {
  const rows = mockRadiologyOrders.filter((order) => order.modality === modality);
  const extra = modality === "CT" ? "Contrast requirement and renal function placeholders" : modality === "MRI" ? "Implant checklist, claustrophobia, sedation placeholders" : modality === "X-Ray" ? "Body part and portable X-Ray placeholders" : modality === "Mammography" ? "Screening/diagnostic and prior comparison placeholders" : modality === "PET" ? "Radiotracer and uptake time placeholders" : "Probe/preparation and obstetric consent placeholders";
  return <DiagnosticShell module="radiology" title={`${modality} Worklist`} description={`${modality} modality worklist with safety, PACS, report status, and modality-specific placeholders.`} icon={ScanSearch}><DiagnosticSafetyBanner type="radiology" /><SimpleTable records={rows} /><SimpleRecordGrid title="Modality-specific safety" records={[{ id: "safety", modality, details: extra, beforeStart: "Checklist must be completed before start-study placeholder" }]} /></DiagnosticShell>;
}

function LabBoardPage({ title, description, rows }: { title: string; description: string; rows: SampleCollection[] }) {
  return <DiagnosticShell module="lab" title={title} description={description} icon={TestTube2}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{["Received", "Processing", "Analyzer pending", "Manual processing", "Result pending", "Delayed", "Rejected", "Quality issue"].map((column) => <Card key={column}><CardContent className="space-y-2 p-3"><div className="text-sm font-semibold">{column}</div>{rows.filter((item) => item.status.includes(column.split(" ")[0]) || column === "Quality issue").slice(0, 3).map((sample) => <div key={sample.id} className="rounded-md border border-border bg-surface-muted p-2 text-xs"><div className="font-medium">{sample.barcode}</div><div>{sample.sampleType} • {sample.container}</div><DiagnosticStatus status={sample.status} /></div>)}</CardContent></Card>)}</div><SimpleRecordGrid title="Custody events" records={mockSampleCustodyEvents} /></DiagnosticShell>;
}

function LabResultWorklist({ title, description }: { title: string; description: string }) {
  const [selected, setSelected] = React.useState<LabResultRecord | null>(null);
  const columns = React.useMemo<ColumnDef<LabResultRecord>[]>(() => [
    { header: "Order", cell: ({ row }) => getLabOrderById(row.original.orderId)?.orderNo },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={getLabOrderById(row.original.orderId)?.patientId ?? ""} /> },
    { header: "Test", cell: ({ row }) => mockLabTests.find((test) => test.id === row.original.testId)?.name },
    { header: "Status", cell: ({ row }) => <DiagnosticStatus status={row.original.status} /> },
    { header: "Critical", cell: ({ row }) => row.original.critical ? <Badge tone="critical">Critical</Badge> : <Badge tone="muted">No</Badge> },
    { header: "Entered by", accessorKey: "enteredBy" },
    { header: "Approved by", accessorKey: "approvedBy" },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], [setSelected]);
  return <DiagnosticShell module="lab" title={title} description={description} icon={FileCheck2}><DataTable data={mockLabResults} columns={columns} /><ResultDrawer result={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></DiagnosticShell>;
}

function CriticalAlertCards({ table }: { table?: boolean }) {
  if (table) return <SimpleTable records={mockCriticalLabAlerts} />;
  return <Card><CardContent className="space-y-3 p-4"><div className="font-semibold">Critical alerts</div>{mockCriticalLabAlerts.map((alert) => <div key={alert.id} className="rounded-md border border-critical/30 bg-critical/10 p-3 text-sm text-critical"><div className="font-semibold">{alert.test} • {alert.parameter}</div><div>{alert.value} • {alert.escalation} • {alert.assignedTo}</div></div>)}</CardContent></Card>;
}

function AnalyzerCards({ compact }: { compact?: boolean }) {
  return <div className={compact ? "space-y-2" : "grid gap-3 md:grid-cols-3"}>{mockAnalyzers.map((analyzer) => <Card key={analyzer.id}><CardContent className="space-y-2 p-3"><div className="font-semibold">{analyzer.name}</div><div className="text-xs text-muted-foreground">{analyzer.department} • Last sync {analyzer.lastSync}</div><div className="flex flex-wrap gap-1"><DiagnosticStatus status={analyzer.connectionStatus} /><Badge tone={analyzer.errorCount ? "danger" : "success"}>{analyzer.errorCount} errors</Badge><Badge tone="info">{analyzer.pendingResults} pending</Badge></div></CardContent></Card>)}</div>;
}

function DepartmentLinks() {
  const items = [["Histopathology", "/laboratory/histopathology"], ["Microbiology", "/laboratory/microbiology"], ["Biochemistry", "/laboratory/biochemistry"], ["Hematology", "/laboratory/hematology"]];
  return <Card><CardContent className="space-y-2 p-4"><div className="font-semibold">Department worklists</div>{items.map(([label, href]) => <Button key={href} className="w-full justify-start" variant="outline" asChild><Link href={href}>{label}</Link></Button>)}</CardContent></Card>;
}

function ModalityLinks() {
  const items = [["Ultrasound", "/radiology/ultrasound"], ["CT", "/radiology/ct"], ["MRI", "/radiology/mri"], ["X-Ray", "/radiology/x-ray"], ["Mammography", "/radiology/mammography"], ["PET", "/radiology/pet"]];
  return <Card><CardContent className="space-y-2 p-4"><div className="font-semibold">Modality worklists</div>{items.map(([label, href]) => <Button key={href} className="w-full justify-start" variant="outline" asChild><Link href={href}>{label}</Link></Button>)}</CardContent></Card>;
}

function ScheduleBoard() {
  return <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">{mockRadiologySchedules.map((slot) => { const order = getRadiologyOrderById(slot.orderId); return <Card key={slot.id}><CardContent className="space-y-2 p-3"><div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{slot.dateTime}</div><div className="text-xs text-muted-foreground">{slot.room} • {slot.technician}</div></div><DiagnosticStatus status={order?.priority ?? "Routine"} /></div><div className="text-sm">{order?.study}</div><div className="flex flex-wrap gap-1"><DiagnosticStatus status={slot.preparation} /><Badge tone={slot.consentRequired === "Pending" ? "warning" : "muted"}>Consent {slot.consentRequired}</Badge><Badge tone={slot.contrastRequired === "Yes" ? "warning" : "muted"}>Contrast {slot.contrastRequired}</Badge></div><Button size="sm" variant="outline">Safety checklist</Button></CardContent></Card>; })}</div>;
}

function ParameterTable({ result }: { result: LabResultRecord }) {
  const columns = React.useMemo<ColumnDef<LabResultRecord["parameters"][number]>[]>(() => [
    { header: "Parameter", accessorKey: "parameter" },
    { header: "Value", accessorKey: "value" },
    { header: "Unit", accessorKey: "unit" },
    { header: "Reference", accessorKey: "referenceRange" },
    { header: "Flag", cell: ({ row }) => <DiagnosticStatus status={row.original.flag} /> },
    { header: "Previous", accessorKey: "previousValue" },
    { header: "Comment", accessorKey: "comment" },
  ], []);
  return <DataTable data={result.parameters} columns={columns} />;
}

function SimpleTable<T extends Record<string, unknown>>({ records }: { records: T[] }) {
  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    const keys = Object.keys(records[0] ?? {}).filter((key) => key !== "id").slice(0, 8);
    return keys.map((key) => ({
      header: key.replace(/([A-Z])/g, " $1"),
      cell: ({ row }) => {
        const value = row.original[key];
        if (typeof value === "string" && (value.includes("pending") || value.includes("placeholder") || value.includes("Approved") || value.includes("Critical") || value.includes("Rejected"))) return <DiagnosticStatus status={value} />;
        if (Array.isArray(value)) return value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ");
        return String(value ?? "NA");
      },
    }));
  }, [records]);
  return <DataTable data={records} columns={columns} />;
}

function SimpleRecordGrid({ title, records }: { title: string; records: Record<string, unknown>[] }) {
  if (!records.length) return <EmptyState icon={Search} title={`No ${title.toLowerCase()}`} description="No static records match this workflow state." />;
  return <Card><CardContent className="space-y-3 p-4"><div className="font-semibold">{title}</div><div className="grid gap-2">{records.map((record) => <div key={String(record.id)} className="rounded-md border border-border bg-surface-muted p-3 text-xs">{Object.entries(record).filter(([key]) => key !== "id").slice(0, 7).map(([key, value]) => <div key={key} className="grid gap-2 border-b border-border/60 py-1 last:border-0 sm:grid-cols-[150px_1fr]"><span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span><span>{Array.isArray(value) ? value.map((item) => typeof item === "object" ? JSON.stringify(item) : String(item)).join(", ") : String(value)}</span></div>)}</div>)}</div></CardContent></Card>;
}

function SampleActionPanel({ sample }: { sample: SampleCollection | null }) {
  const order = sample ? getLabOrderById(sample.orderId) : undefined;
  const patient = order ? getPatientById(order.patientId) : undefined;
  if (!sample || !order || !patient) return <EmptyState icon={Barcode} title="Select sample" description="Choose a collection row to preview barcode and custody details." />;
  return <Card><CardContent className="space-y-3 p-4"><div className="text-sm font-semibold">Collection drawer preview</div><BarcodePreview barcode={sample.barcode} orderNo={order.orderNo} patientName={`${patient.firstName} ${patient.lastName}`} sampleType={sample.sampleType} /><DetailRow label="Container" value={sample.container} /><DetailRow label="Status" value={<DiagnosticStatus status={sample.status} />} /><DetailRow label="Custody" value={sample.custodyStatus} /><DetailRow label="Reprints" value={`${sample.reprintCount} • ${sample.lastReprintReason}`} /><Button className="w-full">Mark collected</Button><Button className="w-full" variant="outline">Reprint barcode</Button><Button className="w-full" variant="outline">Reject / quality issue</Button></CardContent></Card>;
}

function DrawerRows({ rows, warning }: { rows: [string, React.ReactNode][]; warning: string }) {
  return <div className="space-y-4"><AlertBanner icon={ShieldCheck} tone="warning" title="Placeholder governance">{warning}</AlertBanner><Card><CardContent className="space-y-1 p-4">{rows.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}</CardContent></Card></div>;
}

function LabOrderDrawer({ order, open, onOpenChange }: { order: LabOrder | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Lab order detail" description={order?.orderNo}>{order ? <div className="space-y-4"><DiagnosticOrderHeader labOrderId={order.id} /><DrawerRows warning="Cancel, barcode print, result handoff, and EMR attachment are placeholders only." rows={[["Tests", order.tests.join(", ")], ["Department", order.department], ["Priority", <DiagnosticStatus key="p" status={order.priority} />], ["Sample", <DiagnosticStatus key="s" status={order.sampleStatus} />], ["Result", <DiagnosticStatus key="r" status={order.resultStatus} />], ["Billing", order.billingStatus], ["Ordered by", order.orderedBy]]} /></div> : null}</Drawer>;
}

function TestDrawer({ test, open, onOpenChange }: { test: LabTest | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Test configuration" description={test?.name}>{test ? <div className="space-y-4"><DrawerRows warning="Reference ranges support age/gender and critical thresholds; billing is placeholder only." rows={[["Code", test.code], ["Department", test.department], ["Sample", test.sampleType], ["Method", test.method], ["Range state", <DiagnosticStatus key="range" status={test.normalRangeStatus} />], ["Price", test.price], ["Status", <DiagnosticStatus key="status" status={test.status} />]]} /><SimpleRecordGrid title="Result parameters" records={test.parameters.map((item, index) => ({ id: `${test.id}-${index}`, ...item }))} /></div> : null}</Drawer>;
}

function PackageDrawer({ item, open, onOpenChange }: { item: LabPackage | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Package detail" description={item?.name}>{item ? <DrawerRows warning="Sample requirement conflicts and report grouping are shown for future billing/LIS integration." rows={[["Code", item.code], ["Tests", item.includedTests.join(", ")], ["Department", item.department], ["Price", item.price], ["Status", <DiagnosticStatus key="status" status={item.status} />], ["Sample requirements", item.sampleRequirements]]} /> : null}</Drawer>;
}

function ResultDrawer({ result, open, onOpenChange }: { result: LabResultRecord | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Result review" description={result ? getLabOrderById(result.orderId)?.orderNo : undefined}>{result ? <div className="space-y-4">{result.critical ? <CriticalBanner>Critical result approval will trigger acknowledgement and escalation placeholders.</CriticalBanner> : null}<ParameterTable result={result} /><DrawerRows warning="Approve, reject, correction request, addendum, and print are controlled-report placeholders." rows={[["Status", <DiagnosticStatus key="status" status={result.status} />], ["Critical", result.critical ? "Yes" : "No"], ["Entered by", result.enteredBy], ["Approved by", result.approvedBy], ["Version", result.version], ["Correction", result.correctionReason || "None"], ["Addendum", result.addendum || "None"]]} /></div> : null}</Drawer>;
}

function RadiologyOrderDrawer({ order, open, onOpenChange }: { order: RadiologyOrder | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const schedule = order ? mockRadiologySchedules.find((item) => item.orderId === order.id) : undefined;
  const checklist = order ? mockRadiologySafetyChecklists.find((item) => item.orderId === order.id) : undefined;
  return <Drawer open={open} onOpenChange={onOpenChange} title="Radiology order detail" description={order?.orderNo}>{order ? <div className="space-y-4"><DiagnosticOrderHeader radiologyOrderId={order.id} /><DrawerRows warning="Study start, PACS sync, report approval, and emergency override are placeholders only." rows={[["Modality", order.modality], ["Study", order.study], ["Schedule", <DiagnosticStatus key="s" status={order.scheduleStatus} />], ["PACS", <DiagnosticStatus key="p" status={order.pacsStatus} />], ["Report", <DiagnosticStatus key="r" status={order.reportStatus} />], ["Safety", <DiagnosticStatus key="safe" status={order.safetyChecklistStatus} />], ["Slot", schedule?.dateTime ?? "Unscheduled"]]} />{checklist ? <ChecklistPanel checklist={checklist} /> : null}</div> : null}</Drawer>;
}

function ChecklistPanel({ checklist }: { checklist: RadiologySafetyChecklist }) {
  return <Card><CardContent className="space-y-2 p-4"><div className="text-sm font-semibold">Safety checklist</div>{checklist.items.map((item) => <div key={item.label} className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-muted p-2 text-xs"><span>{item.label}</span><DiagnosticStatus status={item.status} /></div>)}</CardContent></Card>;
}
