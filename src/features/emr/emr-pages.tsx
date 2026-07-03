"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Download,
  FileCheck2,
  FileClock,
  FileSearch,
  FileSignature,
  FileText,
  History,
  LockKeyhole,
  NotebookText,
  Printer,
  RefreshCcw,
  Search,
  ShieldAlert,
  Share2,
  Stethoscope,
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
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import { PatientMini } from "@/features/appointments/appointment-shared";
import {
  BreakGlassWarning,
  EmrStatus,
  EncounterSummaryCard,
  PatientRecordHeader,
  PrivacyWarning,
  ProtectedEmr,
  RecordMetricStrip,
  RecordStatusBadge,
  SensitivityBadge,
  SignatureBadge,
} from "@/features/emr/emr-shared";
import {
  getEmrEncounterById,
  getEmrEncountersByPatient,
  mockClinicalAttachments,
  mockClinicalTimeline,
  mockDigitalSignatures,
  mockDisclosureRequests,
  mockEmrEncounters,
  mockMedicalHistory,
  mockProgressNotes,
  mockRecordAccessAudit,
  mockRecordVersions,
  mockRetentionPolicies,
} from "@/data/emr";
import { mockAllergies, mockChronicConditions, mockDiagnoses, mockPrescriptionMedicines, mockProcedures, mockVaccinations, mockVitals } from "@/data/opd";
import { mockAdmissions, mockEmergencyCases } from "@/data/ipd";
import { getPatientById, mockConsentForms, mockPatientDocuments } from "@/data/patients";
import type {
  ClinicalAttachment,
  ClinicalTimelineEvent,
  DigitalSignatureRecord,
  DisclosureRequest,
  EmrEncounter,
  MedicalHistoryItem,
  ProgressNote,
  RecordAccessAudit,
  RecordVersion,
} from "@/types";

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{children}</div>;
}

function patientName(patientId: string) {
  const patient = getPatientById(patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient";
}

function encounterLabel(encounterId?: string) {
  if (!encounterId) return "Not linked";
  const encounter = getEmrEncounterById(encounterId);
  return encounter?.encounterNo ?? encounterId;
}

export function EmrDashboardPage() {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("All types");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<EmrEncounter | null>(null);

  const rows = mockEmrEncounters.filter((encounter) => {
    const patient = getPatientById(encounter.patientId);
    const text = `${patient?.firstName} ${patient?.lastName} ${patient?.uhid} ${encounter.encounterNo} ${encounter.encounterType} ${encounter.department} ${encounter.provider} ${encounter.status}`;
    return includes(text, search) && (type === "All types" || encounter.encounterType === type) && (status === "All status" || encounter.status === status);
  });

  const columns = React.useMemo<ColumnDef<EmrEncounter>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "UHID", cell: ({ row }) => getPatientById(row.original.patientId)?.uhid ?? "Unknown" },
    { header: "Encounter", accessorKey: "encounterNo" },
    { header: "Type", accessorKey: "encounterType" },
    { header: "Department", accessorKey: "department" },
    { header: "Provider", accessorKey: "provider" },
    { header: "Date", accessorKey: "startedAt" },
    { header: "Status", cell: ({ row }) => <RecordStatusBadge status={row.original.status} /> },
    { header: "Signature", cell: ({ row }) => <SignatureBadge status={row.original.signatureStatus} /> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" asChild><Link href={`/emr/patients/${row.original.patientId}`}>Open</Link></Button>
          <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Audit</Button>
        </div>
      ),
    },
  ], [setSelected]);

  return (
    <ProtectedEmr>
      {() => (
        <>
          <PageHeader
            eyebrow="Phase 7 • EMR / EHR"
            title="EMR"
            description="Encounter-wise medical record command center with restricted access, pending signatures, attachments, audit, and continuity indicators."
            actions={
              <>
                <Button variant="outline" onClick={() => toast.success("Recent static records refreshed")}>
                  <RefreshCcw className="h-4 w-4" />
                  Recent records
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  Print list
                </Button>
                <Button>
                  <Search className="h-4 w-4" />
                  Search patient record
                </Button>
              </>
            }
          />
          <SummaryGrid>
            <StatCard label="Viewed today" value={mockRecordAccessAudit.length} change="Static audit" context="Access events" tone="info" icon={FileSearch} />
            <StatCard label="Recent OPD" value={mockEmrEncounters.filter((item) => item.encounterType === "OPD").length} change="Clinical" context="OPD records" tone="success" icon={Stethoscope} />
            <StatCard label="Recent IPD" value={mockEmrEncounters.filter((item) => item.encounterType === "IPD").length} change="Inpatient" context="IPD records" tone="warning" icon={FileText} />
            <StatCard label="Emergency" value={mockEmrEncounters.filter((item) => item.encounterType === "Emergency").length} change="Restricted" context="Break-glass" tone="critical" icon={ShieldAlert} />
            <StatCard label="Pending signatures" value={mockDigitalSignatures.filter((item) => item.status === "Pending").length} change="Worklist" context="Doctor action" tone="warning" icon={FileSignature} />
            <StatCard label="Attach verify" value={mockClinicalAttachments.filter((item) => item.verificationStatus === "Pending verification").length} change="Documents" context="Review queue" tone="danger" icon={FileCheck2} />
          </SummaryGrid>
          <PrivacyWarning label="EMR search exposes encounter metadata only in this UI preview." />
          <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, encounter, department, provider, status...">
            <NativeSelect label="Type" value={type} onChange={setType} options={["All types", "OPD", "IPD", "Emergency", "Teleconsultation placeholder", "Lab placeholder", "Radiology placeholder", "Pharmacy placeholder", "Billing placeholder"]} />
            <NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Draft", "Completed", "Signed placeholder", "Addendum placeholder", "Revised placeholder", "Superseded placeholder", "Legal hold placeholder"]} />
          </FilterBar>
          <DataTable data={rows} columns={columns} />
          <EncounterDrawer encounter={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
        </>
      )}
    </ProtectedEmr>
  );
}

export function PatientEmrPage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  const encounters = getEmrEncountersByPatient(patientId);
  const [selected, setSelected] = React.useState<EmrEncounter | null>(encounters[0] ?? null);

  if (!patient) return <ProtectedEmr>{() => <EmptyState icon={FileText} title="Patient not found" description="The selected patient is not part of the static Phase 7 record set." />}</ProtectedEmr>;

  return (
    <ProtectedEmr>
      {({ readOnly }) => (
        <>
          <PageHeader
            eyebrow="Phase 7 • Patient EMR"
            title={`${patient.firstName} ${patient.lastName} EMR`}
            description="Encounter-wise clinical record view with sticky identity, alerts, tabs, governance states, and drawer-based record review."
            actions={
              <>
                <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print summary</Button>
                <Button variant="outline" asChild><Link href={`/emr/patients/${patientId}/audit`}>Access audit</Link></Button>
                <Button disabled={readOnly}>Add addendum</Button>
              </>
            }
          />
          <PatientRecordHeader patientId={patientId} title="Patient EMR" />
          {encounters.some((item) => item.sensitivity === "Break-glass placeholder") ? <BreakGlassWarning /> : <PrivacyWarning />}
          <Tabs defaultValue="encounters" className="space-y-4">
            <TabsList>
              <TabsTrigger value="encounters">Encounters</TabsTrigger>
              <TabsTrigger value="opd">OPD</TabsTrigger>
              <TabsTrigger value="ipd">IPD</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="rx">Prescriptions</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="dx">Diagnosis</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>
            <TabsContent value="encounters" className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
              {encounters.map((encounter) => <EncounterSummaryCard key={encounter.id} encounter={encounter} onOpen={setSelected} />)}
            </TabsContent>
            <TabsContent value="opd" className="grid gap-3 lg:grid-cols-2">{encounters.filter((item) => item.encounterType === "OPD" || item.encounterType === "Teleconsultation placeholder").map((item) => <EncounterSummaryCard key={item.id} encounter={item} onOpen={setSelected} />)}</TabsContent>
            <TabsContent value="ipd"><SimpleRecords title="IPD continuity" records={mockAdmissions.filter((item) => item.patientId === patientId)} /></TabsContent>
            <TabsContent value="emergency"><SimpleRecords title="Emergency continuity" records={mockEmergencyCases.filter((item) => item.patientId === patientId)} /></TabsContent>
            <TabsContent value="rx"><SimpleRecords title="Medication continuity" records={mockPrescriptionMedicines.filter((item) => encounters.some((encounter) => encounter.prescriptionSummary.includes(item.medicineName)))} /></TabsContent>
            <TabsContent value="vitals"><SimpleRecords title="Vitals trend records" records={mockVitals.filter((item) => item.patientId === patientId)} /></TabsContent>
            <TabsContent value="dx"><SimpleRecords title="Diagnosis records" records={mockDiagnoses.filter((item) => item.patientId === patientId)} /></TabsContent>
            <TabsContent value="documents"><SimpleRecords title="Clinical and patient documents" records={[...mockClinicalAttachments.filter((item) => item.patientId === patientId), ...mockPatientDocuments.filter((item) => item.patientId === patientId)]} /></TabsContent>
            <TabsContent value="audit"><AuditPanel patientId={patientId} compact /></TabsContent>
          </Tabs>
          <StickyActionBar readOnly={readOnly} saveLabel="Record addendum" />
          <EncounterDrawer encounter={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
        </>
      )}
    </ProtectedEmr>
  );
}

export function PatientEhrPage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return <ProtectedEmr>{() => <EmptyState icon={FileText} title="Patient not found" description="The selected patient is not available." />}</ProtectedEmr>;
  const encounters = getEmrEncountersByPatient(patientId);
  const allergies = mockAllergies.filter((item) => item.patientId === patientId);
  const chronic = mockChronicConditions.filter((item) => item.patientId === patientId);
  const diagnoses = mockDiagnoses.filter((item) => item.patientId === patientId);
  const vitals = mockVitals.filter((item) => item.patientId === patientId);

  return (
    <ProtectedEmr>
      {() => (
        <>
          <PageHeader
            eyebrow="Phase 7 • EHR"
            title={`${patient.firstName} ${patient.lastName} EHR`}
            description="Longitudinal patient health summary across encounters, departments, diagnoses, medicines, vitals, procedures, consent, and ABHA placeholders."
            actions={
              <>
                <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print EHR</Button>
                <Button variant="outline"><Download className="h-4 w-4" />Export placeholder</Button>
                <Button asChild><Link href={`/emr/patients/${patientId}/timeline`}>Clinical timeline</Link></Button>
              </>
            }
          />
          <PatientRecordHeader patientId={patientId} title="Lifetime EHR" />
          <PrivacyWarning label="EHR print/export is consent-gated and excludes internal-only notes by default." />
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <RecordMetricStrip patientId={patientId} />
              <div className="grid gap-3 lg:grid-cols-2">
                <LongitudinalPanel title="Active allergies" records={allergies} alert />
                <LongitudinalPanel title="Chronic conditions" records={chronic} />
                <LongitudinalPanel title="Major diagnoses" records={diagnoses} />
                <LongitudinalPanel title="Recent vitals trends" records={vitals} />
                <LongitudinalPanel title="Procedures and surgeries" records={mockProcedures.filter((item) => item.patientId === patientId)} />
                <LongitudinalPanel title="Vaccinations" records={mockVaccinations.filter((item) => item.patientId === patientId)} />
                <LongitudinalPanel title="Admission / emergency history" records={[...mockAdmissions.filter((item) => item.patientId === patientId), ...mockEmergencyCases.filter((item) => item.patientId === patientId)]} />
                <LongitudinalPanel title="Lab / radiology placeholders" records={encounters.filter((item) => item.encounterType.includes("placeholder"))} />
              </div>
            </div>
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="text-sm font-semibold">Patient profile summary</div>
                <DetailRow label="UHID" value={patient.uhid} />
                <DetailRow label="Age/Gender" value={`${patient.age}/${patient.gender}`} />
                <DetailRow label="Blood group" value={patient.bloodGroup} />
                <DetailRow label="ABHA" value={<EmrStatus status={patient.abhaStatus} />} />
                <DetailRow label="Consent" value={mockConsentForms.filter((item) => item.patientId === patientId).map((item) => item.status).join(", ") || "Not captured"} />
                <Button className="w-full" variant="outline" asChild><Link href={`/patients/${patientId}`}>Open patient profile</Link></Button>
                <Button className="w-full" variant="outline" asChild><Link href={`/emr/patients/${patientId}/disclosures`}>Request disclosure package</Link></Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </ProtectedEmr>
  );
}

export function MedicalHistoryPage({ patientId }: { patientId: string }) {
  const rows = mockMedicalHistory.filter((item) => item.patientId === patientId);
  const [selected, setSelected] = React.useState<MedicalHistoryItem | null>(null);
  const columns = React.useMemo<ColumnDef<MedicalHistoryItem>[]>(() => [
    { header: "Section", accessorKey: "section" },
    { header: "Condition/Event", accessorKey: "condition" },
    { header: "Onset", accessorKey: "onset" },
    { header: "Status", cell: ({ row }) => <EmrStatus status={row.original.status} /> },
    { header: "Severity", cell: ({ row }) => <EmrStatus status={row.original.severity} /> },
    { header: "Verified", cell: ({ row }) => row.original.verified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Unverified</Badge> },
    { header: "Sensitivity", cell: ({ row }) => <SensitivityBadge sensitivity={row.original.sensitivity} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], [setSelected]);
  return <PatientRecordTablePage patientId={patientId} title="Medical History" description="Structured past medical, surgical, family, social, medication, allergy, immunization, and obstetric placeholders." rows={rows} columns={columns} icon={History} primaryLabel="Add history item" drawer={<HistoryDrawer item={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />} />;
}

export function ProgressNotesPage({ patientId }: { patientId: string }) {
  const rows = mockProgressNotes.filter((item) => item.patientId === patientId);
  const [selected, setSelected] = React.useState<ProgressNote | null>(null);
  const columns = React.useMemo<ColumnDef<ProgressNote>[]>(() => [
    { header: "Date/time", accessorKey: "createdAt" },
    { header: "Type", accessorKey: "noteType" },
    { header: "Author", accessorKey: "author" },
    { header: "Department", accessorKey: "department" },
    { header: "Encounter", cell: ({ row }) => encounterLabel(row.original.encounterId) },
    { header: "Status", cell: ({ row }) => <RecordStatusBadge status={row.original.status} /> },
    { header: "Signature", cell: ({ row }) => <SignatureBadge status={row.original.signatureStatus} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], [setSelected]);
  return <PatientRecordTablePage patientId={patientId} title="Progress Notes" description="Chronological OPD, IPD, emergency, nursing, round, addendum, and referral note placeholders." rows={rows} columns={columns} icon={NotebookText} primaryLabel="Add progress note" drawer={<ProgressNoteDrawer note={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />} />;
}

export function AttachmentsPage({ patientId }: { patientId: string }) {
  const rows = mockClinicalAttachments.filter((item) => item.patientId === patientId);
  const [selected, setSelected] = React.useState<ClinicalAttachment | null>(null);
  const columns = React.useMemo<ColumnDef<ClinicalAttachment>[]>(() => [
    { header: "Attachment", accessorKey: "name" },
    { header: "Category", accessorKey: "category" },
    { header: "Encounter", cell: ({ row }) => encounterLabel(row.original.encounterId) },
    { header: "Uploaded by", accessorKey: "uploadedBy" },
    { header: "Uploaded", accessorKey: "uploadedAt" },
    { header: "Verification", cell: ({ row }) => <EmrStatus status={row.original.verificationStatus} /> },
    { header: "Signature", cell: ({ row }) => <SignatureBadge status={row.original.signatureStatus} /> },
    { header: "Sensitivity", cell: ({ row }) => <SensitivityBadge sensitivity={row.original.sensitivity} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Preview</Button> },
  ], [setSelected]);
  return <PatientRecordTablePage patientId={patientId} title="Clinical Attachments" description="Unified documents, reports, scanned notes, discharge summaries, consent forms, preview, verification, retention, and legal hold placeholders." rows={rows} columns={columns} icon={FileSearch} primaryLabel="Upload placeholder" drawer={<AttachmentDrawer attachment={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />} />;
}

export function SignaturesPage({ patientId }: { patientId: string }) {
  const rows = mockDigitalSignatures.filter((item) => item.patientId === patientId);
  const [selected, setSelected] = React.useState<DigitalSignatureRecord | null>(null);
  const columns = React.useMemo<ColumnDef<DigitalSignatureRecord>[]>(() => [
    { header: "Document", accessorKey: "documentName" },
    { header: "Encounter", cell: ({ row }) => encounterLabel(row.original.encounterId) },
    { header: "Requested by", accessorKey: "requestedBy" },
    { header: "Signer", accessorKey: "signer" },
    { header: "Requested", accessorKey: "requestedAt" },
    { header: "Status", cell: ({ row }) => <SignatureBadge status={row.original.status} /> },
    { header: "Certificate", accessorKey: "certificateStatus" },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], [setSelected]);
  return <PatientRecordTablePage patientId={patientId} title="Digital Signatures" description="Signature worklists for pending, signed, rejected, expired certificate, and not-required states without real provider integration." rows={rows} columns={columns} icon={FileSignature} primaryLabel="Request signature" drawer={<SignatureDrawer signature={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />} />;
}

export function TimelinePage({ patientId }: { patientId: string }) {
  const [category, setCategory] = React.useState("All categories");
  const [selected, setSelected] = React.useState<ClinicalTimelineEvent | null>(null);
  const rows = mockClinicalTimeline
    .filter((item) => item.patientId === patientId)
    .filter((item) => category === "All categories" || item.category === category);

  return (
    <ProtectedEmr>
      {() => (
        <>
          <PageHeader eyebrow="Phase 7 • Timeline" title="Clinical Timeline" description="Chronological cross-module events with filters, linked encounters, sensitive markers, version context, and governance signals." actions={<><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print timeline</Button><Button asChild><Link href={`/emr/patients/${patientId}`}>Open EMR</Link></Button></>} />
          <PatientRecordHeader patientId={patientId} title="Clinical timeline" />
          <FilterBar search="" onSearch={() => undefined} placeholder="Timeline filters are static in this phase">
            <NativeSelect label="Category" value={category} onChange={setCategory} options={["All categories", "Clinical", "Operational", "Governance"]} />
          </FilterBar>
          <div className="grid gap-4 xl:grid-cols-[280px_1fr_360px]">
            <Card><CardContent className="space-y-2 p-3"><div className="text-sm font-semibold">Filters</div>{["Date range", "Event type", "Department", "Provider", "Encounter", "Clinical only", "Operational only", "Sensitive events"].map((item) => <div key={item} className="rounded-md border border-border bg-surface-muted p-2 text-xs">{item}</div>)}</CardContent></Card>
            <div className="space-y-3">
              {rows.map((event) => (
                <button key={event.id} className="w-full rounded-lg border border-border bg-surface p-3 text-left transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-ring/20" onClick={() => setSelected(event)}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{event.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{event.occurredAt} • {event.eventType} • {event.department} • {event.provider}</div>
                    </div>
                    <EmrStatus status={event.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{event.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5"><SensitivityBadge sensitivity={event.sensitivity} /><Badge tone="muted">{event.category}</Badge><Badge tone="info">{event.versionContext}</Badge></div>
                </button>
              ))}
            </div>
            <Card className="hidden xl:block"><CardContent className="space-y-3 p-4"><div className="text-sm font-semibold">Selected event</div>{selected ? <EventDetails event={selected} /> : <div className="text-sm text-muted-foreground">Choose a timeline event to review linked encounter, audit note, and governance context.</div>}</CardContent></Card>
          </div>
          <EventDrawer event={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
        </>
      )}
    </ProtectedEmr>
  );
}

export function AuditPage({ patientId }: { patientId: string }) {
  return <AuditPanel patientId={patientId} />;
}

function AuditPanel({ patientId, compact }: { patientId: string; compact?: boolean }) {
  const rows = mockRecordAccessAudit.filter((item) => item.patientId === patientId);
  const [selected, setSelected] = React.useState<RecordAccessAudit | null>(null);
  const columns = React.useMemo<ColumnDef<RecordAccessAudit>[]>(() => [
    { header: "Time", accessorKey: "timestamp" },
    { header: "User", accessorKey: "user" },
    { header: "Role", accessorKey: "role" },
    { header: "Action", accessorKey: "action" },
    { header: "Record", accessorKey: "recordType" },
    { header: "Reason", accessorKey: "reason" },
    { header: "Sensitivity", cell: ({ row }) => <SensitivityBadge sensitivity={row.original.sensitivity} /> },
    { header: "IP/device", cell: ({ row }) => `${row.original.ipAddress} • ${row.original.device}` },
    { header: "Outcome", cell: ({ row }) => <EmrStatus status={row.original.outcome} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Details</Button> },
  ], [setSelected]);
  const content = (
    <>
      {!compact ? <SummaryGrid><StatCard label="Access events" value={rows.length} change="Today" context="Static audit" tone="info" icon={LockKeyhole} /><StatCard label="Restricted" value={rows.filter((item) => item.sensitivity === "Restricted").length} change="Review" context="Sensitive rows" tone="warning" icon={ShieldAlert} /><StatCard label="Print/export" value={rows.filter((item) => item.action.includes("Export")).length} change="Governed" context="Privacy warning" tone="danger" icon={Download} /><StatCard label="Signature events" value={rows.filter((item) => item.recordType === "Signature").length} change="Worklist" context="Audit linked" tone="success" icon={FileSignature} /></SummaryGrid> : null}
      <PrivacyWarning label="Audit rows are immutable and values may be masked for sensitive records." />
      <DataTable data={rows} columns={columns} />
      <AuditDrawer audit={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
  if (compact) return content;
  return <ProtectedEmr>{() => <><PageHeader eyebrow="Phase 7 • Audit" title="Record Access Audit" description="Read-only clinical record access history with restricted, break-glass, print/export, addendum, signature, disclosure, and legal hold events." actions={<Button variant="outline"><Download className="h-4 w-4" />Export audit placeholder</Button>} /><PatientRecordHeader patientId={patientId} title="Access audit" />{content}</>}</ProtectedEmr>;
}

export function VersionsPage({ patientId }: { patientId: string }) {
  const rows = mockRecordVersions.filter((item) => item.patientId === patientId);
  const [selected, setSelected] = React.useState<RecordVersion | null>(null);
  const columns = React.useMemo<ColumnDef<RecordVersion>[]>(() => [
    { header: "Record", accessorKey: "recordName" },
    { header: "Type", accessorKey: "recordType" },
    { header: "Encounter", cell: ({ row }) => encounterLabel(row.original.encounterId) },
    { header: "Version", accessorKey: "version" },
    { header: "State", cell: ({ row }) => <EmrStatus status={row.original.state} /> },
    { header: "Author", accessorKey: "author" },
    { header: "Updated", accessorKey: "updatedAt" },
    { header: "Legal hold", cell: ({ row }) => row.original.legalHold ? <Badge tone="critical">Blocked</Badge> : <Badge tone="success">No hold</Badge> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>View</Button> },
  ], [setSelected]);
  return <PatientRecordTablePage patientId={patientId} title="Version History" description="Record lineage with current, previous, addendum, superseded, archived, compare, and legal hold placeholders." rows={rows} columns={columns} icon={FileClock} primaryLabel="Add addendum" drawer={<VersionDrawer version={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />} />;
}

export function DisclosuresPage({ patientId }: { patientId: string }) {
  const rows = mockDisclosureRequests.filter((item) => item.patientId === patientId);
  const [selected, setSelected] = React.useState<DisclosureRequest | null>(null);
  const columns = React.useMemo<ColumnDef<DisclosureRequest>[]>(() => [
    { header: "Request", accessorKey: "requestNo" },
    { header: "Recipient", accessorKey: "recipient" },
    { header: "Purpose", accessorKey: "purpose" },
    { header: "Scope", accessorKey: "recordScope" },
    { header: "Consent", cell: ({ row }) => <EmrStatus status={row.original.consentStatus} /> },
    { header: "Approval", cell: ({ row }) => <EmrStatus status={row.original.approvalStatus} /> },
    { header: "Requested by", accessorKey: "requestedBy" },
    { header: "Requested", accessorKey: "requestedAt" },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], [setSelected]);
  return <PatientRecordTablePage patientId={patientId} title="Disclosure Requests" description="Future print/export/share governance with consent, approval, recipient, purpose, record scope, and package generation placeholders." rows={rows} columns={columns} icon={Share2} primaryLabel="Create request" drawer={<DisclosureDrawer request={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />} />;
}

function PatientRecordTablePage<T>({
  patientId,
  title,
  description,
  rows,
  columns,
  icon: Icon,
  primaryLabel,
  drawer,
}: {
  patientId: string;
  title: string;
  description: string;
  rows: T[];
  columns: ColumnDef<T>[];
  icon: typeof FileText;
  primaryLabel: string;
  drawer?: React.ReactNode;
}) {
  return (
    <ProtectedEmr>
      {({ readOnly }) => (
        <>
          <PageHeader
            eyebrow="Phase 7 • EMR Governance"
            title={title}
            description={description}
            actions={
              <>
                <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
                <Button variant="outline"><Download className="h-4 w-4" />Export placeholder</Button>
                <Button disabled={readOnly}><Icon className="h-4 w-4" />{primaryLabel}</Button>
              </>
            }
          />
          <PatientRecordHeader patientId={patientId} title={title} />
          <PrivacyWarning />
          <DataTable data={rows} columns={columns} />
          <StickyActionBar readOnly={readOnly} saveLabel="Save placeholder" />
          {drawer}
        </>
      )}
    </ProtectedEmr>
  );
}

function SimpleRecords({ title, records }: { title: string; records: Record<string, unknown>[] }) {
  if (!records.length) return <EmptyState icon={FileSearch} title={`No ${title.toLowerCase()}`} description="No static continuity records are available for this patient and filter." />;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="text-sm font-semibold">{title}</div>
        <div className="grid gap-2">
          {records.map((record) => (
            <div key={String(record.id)} className="rounded-md border border-border bg-surface-muted p-3 text-sm">
              {Object.entries(record).filter(([key]) => key !== "id" && key !== "patientId").slice(0, 6).map(([key, value]) => (
                <div key={key} className="grid gap-2 border-b border-border/70 py-1 last:border-0 sm:grid-cols-[150px_1fr]">
                  <span className="text-xs font-medium capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="min-w-0 text-foreground">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LongitudinalPanel({ title, records, alert }: { title: string; records: Record<string, unknown>[]; alert?: boolean }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">{title}</div>
          <Badge tone={alert && records.length ? "danger" : records.length ? "info" : "muted"}>{records.length} records</Badge>
        </div>
        {records.length ? (
          <div className="space-y-2">
            {records.slice(0, 4).map((record) => (
              <div key={String(record.id)} className="rounded-md border border-border bg-surface-muted p-2 text-xs">
                {Object.entries(record).filter(([key]) => !["id", "patientId", "visitId"].includes(key)).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-3 py-0.5">
                    <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-right text-foreground">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">No static longitudinal records available.</div>
        )}
      </CardContent>
    </Card>
  );
}

function EncounterDrawer({ encounter, open, onOpenChange }: { encounter: EmrEncounter | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Encounter detail" description={encounter ? `${encounter.encounterNo} • ${patientName(encounter.patientId)}` : undefined} className="md:w-[640px]">
      {encounter ? (
        <div className="space-y-4">
          {encounter.sensitivity === "Break-glass placeholder" ? <BreakGlassWarning /> : <PrivacyWarning label="Opening this encounter will be audit tracked in production." />}
          <Card><CardContent className="space-y-1 p-4"><DetailRow label="Encounter" value={encounter.encounterNo} /><DetailRow label="Type" value={encounter.encounterType} /><DetailRow label="Department" value={encounter.department} /><DetailRow label="Provider" value={encounter.provider} /><DetailRow label="Status" value={<RecordStatusBadge status={encounter.status} />} /><DetailRow label="Signature" value={<SignatureBadge status={encounter.signatureStatus} />} /><DetailRow label="Sensitivity" value={<SensitivityBadge sensitivity={encounter.sensitivity} />} /><DetailRow label="Version" value={<EmrStatus status={encounter.versionState} />} /></CardContent></Card>
          <SimpleRecords title="Clinical sections" records={[{ id: "summary", summary: encounter.summary, diagnosis: encounter.diagnosisSummary, prescription: encounter.prescriptionSummary, documents: `${encounter.documentsCount} linked documents`, related: encounter.relatedRoute }]} />
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => window.print()}>Print encounter</Button><Button variant="outline" asChild><Link href={`/emr/patients/${encounter.patientId}/versions`}>Version history</Link></Button><Button asChild><Link href={encounter.relatedRoute}>Cross-module link</Link></Button></div>
        </div>
      ) : null}
    </Drawer>
  );
}

function HistoryDrawer({ item, open, onOpenChange }: { item: MedicalHistoryItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="History item" description={item?.condition}>{item ? <DrawerRows rows={[["Section", item.section], ["Onset", item.onset], ["Status", <EmrStatus key="s" status={item.status} />], ["Severity", <EmrStatus key="sev" status={item.severity} />], ["Source", item.sourceEncounter], ["Verified", item.verified ? "Verified" : "Unverified"], ["Sensitivity", <SensitivityBadge key="sens" sensitivity={item.sensitivity} />], ["Notes", item.notes]]} warning="Archive and verification changes require reason capture in production." /> : null}</Drawer>;
}

function ProgressNoteDrawer({ note, open, onOpenChange }: { note: ProgressNote | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Progress note" description={note?.noteType}>{note ? <div className="space-y-4">{note.internalOnly ? <AlertBanner icon={LockKeyhole} tone="warning" title="Internal-only note">This note is hidden from patient-facing print/export by default.</AlertBanner> : null}<DrawerRows rows={[["Author", note.author], ["Department", note.department], ["Encounter", encounterLabel(note.encounterId)], ["Created", note.createdAt], ["Status", <RecordStatusBadge key="s" status={note.status} />], ["Signature", <SignatureBadge key="sig" status={note.signatureStatus} />], ["Version", note.version], ["Summary", note.summary], ["Full note", note.fullNote], ["Addendum", note.addendumHistory]]} warning="Completed notes are read-only; addendums never overwrite the original note." /></div> : null}</Drawer>;
}

function AttachmentDrawer({ attachment, open, onOpenChange }: { attachment: ClinicalAttachment | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Attachment preview" description={attachment?.name} className="md:w-[620px]">{attachment ? <div className="space-y-4">{attachment.legalHold ? <AlertBanner icon={Archive} tone="critical" title="Legal hold active">Archive, destructive, and casual download placeholders are blocked.</AlertBanner> : <PrivacyWarning label="Attachment download and print require privacy acknowledgement." />}<div className="rounded-lg border border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">{attachment.previewAvailable ? "Document preview placeholder uses print-safe light styling in production." : "Unsupported preview. Metadata remains visible and accessible."}</div><DrawerRows rows={[["Category", attachment.category], ["Encounter", encounterLabel(attachment.encounterId)], ["Uploaded by", attachment.uploadedBy], ["Uploaded", attachment.uploadedAt], ["Verification", <EmrStatus key="v" status={attachment.verificationStatus} />], ["Signature", <SignatureBadge key="s" status={attachment.signatureStatus} />], ["Sensitivity", <SensitivityBadge key="sens" sensitivity={attachment.sensitivity} />], ["Retention", attachment.retentionStatus]]} warning="Reject/archive actions require reason capture and are placeholders only." /></div> : null}</Drawer>;
}

function SignatureDrawer({ signature, open, onOpenChange }: { signature: DigitalSignatureRecord | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Signature status" description={signature?.documentName}>{signature ? <DrawerRows rows={[["Document", signature.documentName], ["Encounter", encounterLabel(signature.encounterId)], ["Requested by", signature.requestedBy], ["Signer", signature.signer], ["Requested", signature.requestedAt], ["Status", <SignatureBadge key="s" status={signature.status} />], ["Certificate", signature.certificateStatus], ["Reason", signature.reason]]} warning="No real digital signature provider is connected in Phase 7." /> : null}</Drawer>;
}

function EventDrawer({ event, open, onOpenChange }: { event: ClinicalTimelineEvent | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Timeline event" description={event?.title}>{event ? <EventDetails event={event} /> : null}</Drawer>;
}

function EventDetails({ event }: { event: ClinicalTimelineEvent }) {
  return <DrawerRows rows={[["Occurred", event.occurredAt], ["Type", event.eventType], ["Department", event.department], ["Provider", event.provider], ["Status", <EmrStatus key="s" status={event.status} />], ["Encounter", encounterLabel(event.encounterId)], ["Sensitivity", <SensitivityBadge key="sens" sensitivity={event.sensitivity} />], ["Version", event.versionContext], ["Summary", event.summary]]} warning="Timeline detail preserves linked encounter, audit, version, and disclosure context." />;
}

function AuditDrawer({ audit, open, onOpenChange }: { audit: RecordAccessAudit | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Audit detail" description={audit?.action}>{audit ? <DrawerRows rows={[["Time", audit.timestamp], ["User", audit.user], ["Role", audit.role], ["Action", audit.action], ["Record", `${audit.recordType} • ${audit.recordId}`], ["Reason", audit.reason], ["Sensitivity", <SensitivityBadge key="sens" sensitivity={audit.sensitivity} />], ["IP", audit.ipAddress], ["Device", audit.device], ["Outcome", <EmrStatus key="out" status={audit.outcome} />]]} warning="Audit data is immutable, read-only, and masks sensitive values where required." /> : null}</Drawer>;
}

function VersionDrawer({ version, open, onOpenChange }: { version: RecordVersion | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Record version" description={version?.recordName}>{version ? <DrawerRows rows={[["Record", version.recordName], ["Type", version.recordType], ["Encounter", encounterLabel(version.encounterId)], ["Version", version.version], ["State", <EmrStatus key="state" status={version.state} />], ["Author", version.author], ["Updated", version.updatedAt], ["Reason", version.reason], ["Current ref", version.currentVersionId], ["Legal hold", version.legalHold ? "Active - archive blocked" : "No hold"]]} warning="Previous and superseded versions are read-only; compare is a placeholder only." /> : null}</Drawer>;
}

function DisclosureDrawer({ request, open, onOpenChange }: { request: DisclosureRequest | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Disclosure request" description={request?.requestNo}>{request ? <DrawerRows rows={[["Recipient", request.recipient], ["Purpose", request.purpose], ["Scope", request.recordScope], ["Consent", <EmrStatus key="consent" status={request.consentStatus} />], ["Approval", <EmrStatus key="approval" status={request.approvalStatus} />], ["Requested by", request.requestedBy], ["Requested", request.requestedAt], ["Reason", request.reason]]} warning="Package generation is disabled; consent and restricted-record checks are UI placeholders." /> : null}</Drawer>;
}

function DrawerRows({ rows, warning }: { rows: [string, React.ReactNode][]; warning: string }) {
  return (
    <div className="space-y-4">
      <AlertBanner icon={ShieldAlert} tone="warning" title="Governance placeholder">{warning}</AlertBanner>
      <Card><CardContent className="space-y-1 p-4">{rows.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}</CardContent></Card>
      <Card><CardContent className="space-y-2 p-4"><div className="text-sm font-semibold">Retention policy</div>{mockRetentionPolicies.map((policy) => <div key={policy.id} className="rounded-md border border-border bg-surface-muted p-2 text-xs">{policy.recordType}: {policy.retention} • {policy.archiveAllowed}</div>)}</CardContent></Card>
    </div>
  );
}
