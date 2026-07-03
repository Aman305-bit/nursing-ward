"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  Download,
  Eye,
  FileCheck2,
  FileText,
  IdCard,
  Link2,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
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
import {
  mockConsentForms,
  mockDuplicatePatients,
  mockEmergencyPatients,
  mockFamilyMembers,
  mockPatientAuditEvents,
  mockPatientDocuments,
  mockPatientPortalPreview,
  mockPatients,
  mockPatientVisits,
  getPatientById,
} from "@/data/patients";
import { ConfirmDrawer, DetailRow, FilterBar, NativeSelect, StatusBadge, StickyActionBar } from "@/features/admin/admin-shared";
import {
  PatientAlertChips,
  PatientHeader,
  PatientInfoCard,
  PatientNotFound,
  PatientPrivacyNote,
  PatientStatusBadge,
  ProtectedPatient,
} from "@/features/patients/patient-shared";
import type { ConsentForm, DuplicatePatientMatch, FamilyMember, PatientDocument, PatientRecord, PatientVisit } from "@/types";

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function fullName(patient: PatientRecord) {
  return `${patient.firstName} ${patient.middleName ? `${patient.middleName} ` : ""}${patient.lastName}`;
}

function patientLabel(patientId: string) {
  const patient = getPatientById(patientId);
  return patient ? `${fullName(patient)} • ${patient.uhid}` : "Unknown patient";
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function PatientsPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<PatientRecord | null>(null);
  const filtered = mockPatients.filter((patient) => {
    const haystack = `${fullName(patient)} ${patient.uhid} ${patient.mobile} ${patient.department} ${patient.status} ${patient.alertFlags.join(" ")}`;
    return includes(haystack, search) && (status === "All status" || patient.status === status);
  });
  const columns = React.useMemo<ColumnDef<PatientRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => <div><div className="font-medium">{fullName(row.original)}</div><div className="text-xs text-muted-foreground">{row.original.uhid}</div></div> },
    { header: "Age/gender", cell: ({ row }) => `${row.original.age}/${row.original.gender}` },
    { header: "Mobile", accessorKey: "maskedMobile" },
    { header: "Last visit", accessorKey: "lastVisitAt" },
    { header: "Department", accessorKey: "department" },
    { header: "Alerts", cell: ({ row }) => <PatientAlertChips alerts={row.original.alertFlags} /> },
    { header: "Docs", cell: ({ row }) => <StatusBadge status={row.original.documentStatus} /> },
    { header: "Status", cell: ({ row }) => <PatientStatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="h-3.5 w-3.5" />Quick</Button><Button size="sm" asChild><Link href={`/patients/${row.original.id}`}>Open</Link></Button></div> },
  ], []);

  return (
    <ProtectedPatient>
      {({ readOnly }) => (
        <>
          <PageHeader
            eyebrow="Phase 3 • Patient Registry"
            title="Patients"
            description="Fast patient search, safety flags, document status, and quick patient context."
            actions={<><Button variant="outline" onClick={() => toast.info("Advanced search placeholder opened")}><Search className="h-4 w-4" />Advanced</Button><Button variant="outline" asChild><Link href="/patients/duplicates">Duplicates</Link></Button><Button variant="outline" onClick={() => toast.info("Export pending backend integration")}><Download className="h-4 w-4" />Export</Button><Button disabled={readOnly} asChild><Link href="/patients/register"><Plus className="h-4 w-4" />Register patient</Link></Button></>}
          />
          <SummaryGrid>
            <StatCard label="Total patients" value={mockPatients.length} change="Seeded" context="Static registry" tone="info" icon={IdCard} />
            <StatCard label="Registered today" value={2} change="Today" context="Front office" tone="success" icon={Plus} />
            <StatCard label="OPD visits today" value={2} change="Active" context="Visit summary" tone="warning" icon={CalendarClock} />
            <StatCard label="Duplicate alerts" value={mockDuplicatePatients.length} change="Review" context="Identity safety" tone="danger" icon={ShieldAlert} />
          </SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search by name, UHID, mobile, ABHA, temporary ID...">
            <NativeSelect label="Patient status" value={status} onChange={setStatus} options={["All status", "Active", "Unknown emergency", "Deceased", "Duplicate review", "Inactive"]} />
            <Button variant="outline" onClick={() => toast.success("Static patient list refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
          </FilterBar>
          <DataTable data={filtered} columns={columns} />
          <PatientQuickDrawer patient={selected} onOpenChange={(open) => !open && setSelected(null)} />
        </>
      )}
    </ProtectedPatient>
  );
}

function PatientQuickDrawer({ patient, onOpenChange }: { patient: PatientRecord | null; onOpenChange: (open: boolean) => void }) {
  const visits = patient ? mockPatientVisits.filter((visit) => visit.patientId === patient.id) : [];
  const docs = patient ? mockPatientDocuments.filter((doc) => doc.patientId === patient.id) : [];
  return (
    <Drawer open={Boolean(patient)} onOpenChange={onOpenChange} title={patient ? fullName(patient) : "Patient"} description="Quick view, alerts, contact, last visit, and actions.">
      {patient ? (
        <div className="space-y-4">
          <PatientPrivacyNote />
          <DetailRow label="UHID" value={patient.uhid} />
          <DetailRow label="Age/gender" value={`${patient.age}/${patient.gender}`} />
          <DetailRow label="Mobile" value={patient.maskedMobile} />
          <DetailRow label="Status" value={<PatientStatusBadge status={patient.status} />} />
          <div><div className="mb-2 text-xs font-medium text-muted-foreground">Alerts</div><PatientAlertChips alerts={patient.alertFlags} /></div>
          <DetailRow label="Last visit" value={visits[0]?.summary ?? "No visit recorded"} />
          <DetailRow label="Documents" value={`${docs.length} documents • ${patient.documentStatus}`} />
          <div className="grid gap-2">
            <Button asChild><Link href={`/patients/${patient.id}`}>Open profile</Link></Button>
            <Button variant="outline" onClick={() => toast.info("Appointment creation placeholder")}>Create appointment</Button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export function PatientRegistrationPage() {
  const [mode, setMode] = React.useState("quick");
  const [mobile, setMobile] = React.useState("");
  const duplicate = mobile.length >= 5 ? mockPatients.find((patient) => patient.mobile.includes(mobile) || patient.maskedMobile.includes(mobile)) : undefined;
  return (
    <ProtectedPatient>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 3 • Registration" title="Patient Registration" description="Low-click quick registration with detailed demographic, identity, guardian, insurance, ABHA, preference, and alert sections." actions={<><Button variant="outline" asChild><Link href="/patients/emergency-register">Emergency register</Link></Button><Button disabled={readOnly}><ClipboardCheck className="h-4 w-4" />Save patient</Button></>} />
          <Tabs value={mode} onValueChange={setMode} className="space-y-4">
            <TabsList><TabsTrigger value="quick">Quick registration</TabsTrigger><TabsTrigger value="detailed">Detailed registration</TabsTrigger><TabsTrigger value="review">Review</TabsTrigger></TabsList>
            {duplicate ? (
              <AlertBanner icon={AlertTriangle} tone="warning" title="Possible duplicate detected">
                Matching patient found: {fullName(duplicate)} ({duplicate.uhid}). Review before saving or create a merge request placeholder.
              </AlertBanner>
            ) : null}
            <TabsContent value="quick">
              <RegistrationGrid onMobileChange={setMobile} compact />
            </TabsContent>
            <TabsContent value="detailed" className="space-y-4">
              {["Basic details", "Contact details", "Identity details", "Guardian / emergency contact", "Insurance placeholder", "ABHA / Health ID", "Preferences", "Risk & alerts"].map((section) => (
                <Card key={section}><CardContent className="p-4"><div className="mb-3 text-sm font-semibold">{section}</div><RegistrationGrid onMobileChange={setMobile} section={section} /></CardContent></Card>
              ))}
            </TabsContent>
            <TabsContent value="review"><PatientPrivacyNote /><ReviewPanel /></TabsContent>
          </Tabs>
          <StickyActionBar readOnly={readOnly} saveLabel="Save patient" />
        </>
      )}
    </ProtectedPatient>
  );
}

function RegistrationGrid({ onMobileChange, compact, section }: { onMobileChange: (value: string) => void; compact?: boolean; section?: string }) {
  const fields = compact
    ? ["First name", "Last name", "Age or DOB", "Gender", "Mobile number", "Department", "Visit type", "Emergency/unknown toggle"]
    : ["Field 1", "Field 2", "Field 3", "Field 4", "Field 5", "Field 6"].map((field) => `${section} ${field}`);
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => (
        <label className="space-y-1 text-sm" key={field}>
          <span className="font-medium text-foreground">{field}</span>
          <Input placeholder={field.includes("Mobile") ? "+91 98765 44210" : "Static placeholder"} onChange={field.includes("Mobile") ? (event) => onMobileChange(event.target.value) : undefined} />
        </label>
      ))}
    </div>
  );
}

function ReviewPanel() {
  return (
    <Card><CardContent className="space-y-3 p-4"><DetailRow label="Generated UHID" value="PLH-NEW-####" /><DetailRow label="Duplicate check" value="Required before save" /><DetailRow label="Audit impact" value="Identity edits will be recorded in future audit logs" /><DetailRow label="ABHA" value="Consent required before link action" /></CardContent></Card>
  );
}

export function PatientProfilePage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return <PatientNotFound />;
  const documents = mockPatientDocuments.filter((doc) => doc.patientId === patient.id);
  const consents = mockConsentForms.filter((consent) => consent.patientId === patient.id);
  const visits = mockPatientVisits.filter((visit) => visit.patientId === patient.id);
  return (
    <ProtectedPatient>
      {({ readOnly }) => (
        <>
          <PatientHeader patient={patient} />
          <div className="flex flex-wrap gap-2"><Button disabled={readOnly || patient.status === "Deceased"}><Plus className="h-4 w-4" />New visit</Button><Button variant="outline" disabled={readOnly}>Edit profile</Button><Button variant="outline" onClick={() => toast.info("Patient card print placeholder")}><Printer className="h-4 w-4" />Card</Button></div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="demographics">Demographics</TabsTrigger><TabsTrigger value="contacts">Contacts</TabsTrigger><TabsTrigger value="alerts">Alerts</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="consents">Consents</TabsTrigger><TabsTrigger value="visits">Visit summary</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList>
            <TabsContent value="overview"><SummaryGrid><PatientInfoCard title="Contact" value={patient.maskedMobile} meta={patient.email} icon={IdCard} /><PatientInfoCard title="Last visit" value={patient.lastVisitAt} meta={visits[0]?.summary} icon={CalendarClock} /><PatientInfoCard title="Documents" value={`${documents.length} records`} meta={patient.documentStatus} icon={FileText} /><PatientInfoCard title="Consents" value={`${consents.length} forms`} meta={consents[0]?.status} icon={FileCheck2} /></SummaryGrid></TabsContent>
            <TabsContent value="demographics"><DetailPanel rows={[["Name", fullName(patient)], ["DOB", patient.dateOfBirth], ["Age/gender", `${patient.age}/${patient.gender}`], ["Blood group", patient.bloodGroup], ["Category", patient.isMinor ? "Minor" : "General"], ["ID", patient.maskedIdNumber]]} /></TabsContent>
            <TabsContent value="contacts"><DetailPanel rows={[["Mobile", patient.maskedMobile], ["Email", patient.email], ["Address", `${patient.address}, ${patient.city}`], ["PIN", patient.pinCode], ["Guardian", patient.guardianRequired ? "Required" : "Not required"]]} /></TabsContent>
            <TabsContent value="alerts"><PatientAlertChips alerts={patient.alertFlags} /></TabsContent>
            <TabsContent value="documents"><DocumentTable patientId={patient.id} /></TabsContent>
            <TabsContent value="consents"><ConsentTable patientId={patient.id} /></TabsContent>
            <TabsContent value="visits"><VisitsView patientId={patient.id} embedded /></TabsContent>
            <TabsContent value="audit"><AuditList patientId={patient.id} /></TabsContent>
          </Tabs>
        </>
      )}
    </ProtectedPatient>
  );
}

function DetailPanel({ rows }: { rows: [string, React.ReactNode][] }) {
  return <Card><CardContent className="p-4">{rows.map(([label, value]) => <DetailRow key={label} label={label} value={value} />)}</CardContent></Card>;
}

function AuditList({ patientId }: { patientId: string }) {
  const rows = mockPatientAuditEvents.filter((event) => event.patientId === patientId);
  return <div className="space-y-2">{rows.map((event) => <Card key={event.id}><CardContent className="p-3"><div className="text-sm font-medium">{event.event}</div><div className="text-xs text-muted-foreground">{event.by} • {event.at} • {event.note}</div></CardContent></Card>)}</div>;
}

export function VisitsPage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return <PatientNotFound />;
  return <ProtectedPatient>{() => <><PatientHeader patient={patient} title="Visit History" description="Summary-level OPD, IPD, emergency, diagnostics, pharmacy, and billing timeline." /><VisitsView patientId={patientId} /></>}</ProtectedPatient>;
}

function VisitsView({ patientId, embedded }: { patientId: string; embedded?: boolean }) {
  const [tab, setTab] = React.useState("All visits");
  const visits = mockPatientVisits.filter((visit) => visit.patientId === patientId && (tab === "All visits" || visit.visitType === tab));
  const columns = React.useMemo<ColumnDef<PatientVisit>[]>(() => [
    { header: "Visit date", accessorKey: "visitedAt" }, { header: "Type", accessorKey: "visitType" }, { header: "Department", accessorKey: "department" }, { header: "Provider", accessorKey: "provider" }, { header: "Ref", accessorKey: "referenceNumber" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Amount", accessorKey: "amount" },
  ], []);
  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      {!embedded ? <TabsList>{["All visits", "OPD", "IPD", "Emergency", "Lab", "Radiology", "Pharmacy", "Billing"].map((item) => <TabsTrigger key={item} value={item}>{item}</TabsTrigger>)}</TabsList> : null}
      <div className="grid gap-3 xl:grid-cols-[360px_1fr]">
        <div className="space-y-2">{visits.map((visit) => <Card key={visit.id}><CardContent className="p-3"><div className="flex justify-between gap-2"><div className="font-medium">{visit.visitType} • {visit.department}</div><StatusBadge status={visit.status} /></div><div className="mt-1 text-xs text-muted-foreground">{visit.visitedAt} • {visit.provider}</div><p className="mt-2 text-sm text-muted-foreground">{visit.summary}</p></CardContent></Card>)}</div>
        <DataTable data={visits} columns={columns} />
      </div>
    </Tabs>
  );
}

export function FamilyPage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  const [confirm, setConfirm] = React.useState<FamilyMember | null>(null);
  const rows = mockFamilyMembers.filter((member) => member.patientId === patientId);
  const columns = React.useMemo<ColumnDef<FamilyMember>[]>(() => [
    { header: "Name", accessorKey: "name" }, { header: "Relationship", accessorKey: "relationship" }, { header: "UHID", cell: ({ row }) => row.original.linkedUhid ?? "Not linked" }, { header: "Age/gender", accessorKey: "ageGender" }, { header: "Mobile", accessorKey: "mobile" }, { header: "Primary", cell: ({ row }) => row.original.primaryContact ? "Yes" : "No" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setConfirm(row.original)}>Remove</Button> },
  ], []);
  if (!patient) return <PatientNotFound />;
  return <ProtectedPatient>{({ readOnly }) => <><PatientHeader patient={patient} title="Family Management" description="Family relationships for future family billing and shared history workflows." /><SummaryGrid><PatientInfoCard title="Family members" value={rows.length} icon={Users} /><PatientInfoCard title="Primary contact" value={rows.find((r) => r.primaryContact)?.name ?? "Not set"} /><PatientInfoCard title="Shared address" value="Patient address" /><PatientInfoCard title="Linked records" value={rows.filter((r) => r.linkedUhid).length} /></SummaryGrid><Button disabled={readOnly}><Plus className="h-4 w-4" />Add family member</Button><DataTable data={rows} columns={columns} /><ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Remove family relationship" target={confirm?.name ?? ""} action="Remove relationship" /></>}</ProtectedPatient>;
}

export function DocumentsPage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return <PatientNotFound />;
  return <ProtectedPatient>{({ readOnly }) => <><PatientHeader patient={patient} title="Patient Documents" description="Document grid/table, preview, metadata, verification, and archive placeholders." /><div className="flex flex-wrap gap-2"><Button disabled={readOnly}><Plus className="h-4 w-4" />Add document</Button><Button variant="outline" onClick={() => toast.info("Verify selected placeholder")}>Verify selected</Button><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print list</Button></div><DocumentTable patientId={patientId} /></>}</ProtectedPatient>;
}

function DocumentTable({ patientId }: { patientId: string }) {
  const [selected, setSelected] = React.useState<PatientDocument | null>(null);
  const rows = mockPatientDocuments.filter((document) => document.patientId === patientId);
  const columns = React.useMemo<ColumnDef<PatientDocument>[]>(() => [
    { header: "Document", accessorKey: "name" }, { header: "Category", accessorKey: "category" }, { header: "Uploaded", accessorKey: "uploadedAt" }, { header: "By", accessorKey: "uploadedBy" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.verificationStatus} /> }, { header: "Type", accessorKey: "fileType" }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Preview</Button> },
  ], []);
  return <><DataTable data={rows} columns={columns} /><Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.name ?? "Document"} description="Static document preview and verification metadata.">{selected ? <div className="space-y-4"><div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted text-sm text-muted-foreground">Preview unavailable in Phase 3 static UI</div><DetailRow label="Category" value={selected.category} /><DetailRow label="Status" value={<StatusBadge status={selected.verificationStatus} />} /><DetailRow label="Comments" value={selected.comments} /><PatientPrivacyNote /></div> : null}</Drawer></>;
}

export function ConsentsPage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return <PatientNotFound />;
  return <ProtectedPatient>{({ readOnly }) => <><PatientHeader patient={patient} title="Consent Management" description="Consent forms, signed status, guardian states, withdrawal, print, and audit placeholders." /><Button disabled={readOnly}><Plus className="h-4 w-4" />Create consent</Button><ConsentTable patientId={patientId} /></>}</ProtectedPatient>;
}

function ConsentTable({ patientId }: { patientId: string }) {
  const [selected, setSelected] = React.useState<ConsentForm | null>(null);
  const rows = mockConsentForms.filter((consent) => consent.patientId === patientId);
  const columns = React.useMemo<ColumnDef<ConsentForm>[]>(() => [
    { header: "Consent", accessorKey: "type" }, { header: "Version", accessorKey: "version" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Signed by", accessorKey: "signedBy" }, { header: "Relationship", accessorKey: "relationship" }, { header: "Signed", accessorKey: "signedAt" }, { header: "Expiry", accessorKey: "expiresAt" }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Details</Button> },
  ], []);
  return <><DataTable data={rows} columns={columns} /><Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.type ?? "Consent"} description="Consent text preview, signature state, guardian details, and audit trail.">{selected ? <div className="space-y-4"><DetailRow label="Version" value={selected.version} /><DetailRow label="Status" value={<StatusBadge status={selected.status} />} /><DetailRow label="Signed by" value={`${selected.signedBy} • ${selected.relationship}`} /><div className="rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted-foreground">Consent text preview placeholder. Digital signature integration is future-ready.</div><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print consent</Button></div> : null}</Drawer></>;
}

export function PortalPreviewPage({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return <PatientNotFound />;
  return <ProtectedPatient>{() => <><PatientHeader patient={patient} title="Patient Portal Preview" description="Internal preview of future patient-facing portal data. Staff-only actions are hidden." /><AlertBanner icon={Eye} title="Internal preview only">No patient login exists in Phase 3. This view uses static, patient-friendly labels only.</AlertBanner><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{["Appointments", "Visit summary", "Documents", "Lab reports", "Radiology reports", "Prescriptions", "Bills", "Consent status"].map((section) => <Card key={section}><CardContent className="p-4"><div className="text-sm font-semibold">{section}</div><div className="mt-2 text-sm text-muted-foreground">{mockPatientPortalPreview.appointments[0] ?? "Static preview placeholder"}</div></CardContent></Card>)}</div></>}</ProtectedPatient>;
}

export function AbhaPage() {
  const [search, setSearch] = React.useState("");
  const rows = mockPatients.filter((patient) => includes(`${patient.uhid} ${fullName(patient)} ${patient.mobile} ${patient.abhaStatus}`, search));
  const columns = React.useMemo<ColumnDef<PatientRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => `${fullName(row.original)} • ${row.original.uhid}` }, { header: "Mobile", accessorKey: "maskedMobile" }, { header: "ABHA", cell: ({ row }) => <StatusBadge status={row.original.abhaStatus} /> }, { header: "Consent", cell: ({ row }) => row.original.abhaStatus === "Consent required" ? <Badge tone="warning">Required</Badge> : <Badge tone="success">Available</Badge> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" disabled={row.original.abhaStatus === "Consent required"} onClick={() => toast.info("ABHA link placeholder only")}>Link</Button> },
  ], []);
  return <ProtectedPatient>{() => <><PageHeader eyebrow="Phase 3 • ABHA" title="ABHA / Health ID" description="Future-ready Health ID linking, consent requirement, masked ABHA display, and sync log placeholders." actions={<Button variant="outline" onClick={() => toast.info("ABHA verification placeholder")}><Link2 className="h-4 w-4" />Verify placeholder</Button>} /><PatientPrivacyNote /><FilterBar search={search} onSearch={setSearch} placeholder="Search UHID, patient, mobile, ABHA status..." /><DataTable data={rows} columns={columns} /><AuditList patientId="pat-001" /></>}</ProtectedPatient>;
}

export function DuplicatesPage() {
  const [selected, setSelected] = React.useState<DuplicatePatientMatch | null>(null);
  const [confirm, setConfirm] = React.useState<DuplicatePatientMatch | null>(null);
  const columns = React.useMemo<ColumnDef<DuplicatePatientMatch>[]>(() => [
    { header: "Primary patient", cell: ({ row }) => patientLabel(row.original.primaryPatientId) }, { header: "Possible match", cell: ({ row }) => patientLabel(row.original.matchedPatientId) }, { header: "Reason", accessorKey: "matchReason" }, { header: "Confidence", cell: ({ row }) => `${row.original.confidence}%` }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Compare</Button><Button size="sm" variant="danger" onClick={() => setConfirm(row.original)}>Merge request</Button></div> },
  ], []);
  return <ProtectedPatient>{() => <><PageHeader eyebrow="Phase 3 • Identity Safety" title="Duplicate Patients" description="Possible duplicate detection and non-destructive merge request placeholder." actions={<Button variant="outline" onClick={() => toast.info("Duplicate scan refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>} /><SummaryGrid><StatCard label="Possible duplicates" value={mockDuplicatePatients.length} change="Open" context="Needs review" tone="warning" icon={ShieldAlert} /><StatCard label="High confidence" value={1} change="94%" context="Identity risk" tone="danger" icon={AlertTriangle} /><StatCard label="Merge requests" value={0} change="None" context="No merge done" tone="info" icon={Link2} /><StatCard label="Resolved" value={1} change="Reviewed" context="Static state" tone="success" icon={FileCheck2} /></SummaryGrid><DataTable data={mockDuplicatePatients} columns={columns} /><Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title="Patient comparison" description="Side-by-side identity comparison before any future merge request.">{selected ? <div className="grid gap-3 md:grid-cols-2"><Comparison patientId={selected.primaryPatientId} title="Primary" /><Comparison patientId={selected.matchedPatientId} title="Possible match" /><div className="md:col-span-2"><AlertBanner icon={ShieldAlert} tone="danger" title="Merge safety">No merge happens in Phase 3. Merge request requires reason and future audit trail.</AlertBanner></div></div> : null}</Drawer><ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Create merge request" target={confirm ? patientLabel(confirm.matchedPatientId) : ""} action="Create merge request" /></>}</ProtectedPatient>;
}

function Comparison({ patientId, title }: { patientId: string; title: string }) {
  const patient = getPatientById(patientId);
  if (!patient) return null;
  return <Card><CardContent className="p-3"><div className="mb-2 text-sm font-semibold">{title}</div><DetailRow label="Name" value={fullName(patient)} /><DetailRow label="UHID" value={patient.uhid} /><DetailRow label="DOB" value={patient.dateOfBirth} /><DetailRow label="Mobile" value={patient.maskedMobile} /><DetailRow label="ID" value={patient.maskedIdNumber} /></CardContent></Card>;
}

export function EmergencyRegisterPage() {
  return <ProtectedPatient>{({ readOnly }) => <><PageHeader eyebrow="Phase 3 • Emergency Identity" title="Emergency Registration" description="Fast unknown-patient capture with temporary ID, identity warning, and conversion/link placeholders." actions={<><Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print band</Button><Button disabled={readOnly}><Plus className="h-4 w-4" />Create emergency patient</Button></>} /><AlertBanner icon={AlertTriangle} tone="warning" title="Unknown emergency record">Identity is incomplete. Later conversion to a regular patient must run duplicate detection.</AlertBanner><div className="grid gap-4 xl:grid-cols-[1fr_360px]"><Card><CardContent className="grid gap-3 p-4 md:grid-cols-2"><EmergencyFields /></CardContent></Card><Card><CardContent className="space-y-3 p-4"><div className="text-sm font-semibold">Existing emergency records</div>{mockEmergencyPatients.map((item) => <div key={item.id} className="rounded-md border border-border p-3"><div className="font-medium">{item.temporaryId}</div><div className="text-xs text-muted-foreground">{item.department} • {item.unknownReason}</div><Badge tone="warning" className="mt-2">{item.status}</Badge></div>)}</CardContent></Card></div><StickyActionBar readOnly={readOnly} saveLabel="Create emergency patient" /></>}</ProtectedPatient>;
}

function EmergencyFields() {
  return (
    <>
      {["Temporary patient ID", "Approximate age", "Gender", "Brought by", "Contact number if available", "Emergency department", "Identification marks", "Unknown identity reason", "Initial alert flags"].map((field) => (
        <label className="space-y-1 text-sm" key={field}>
          <span className="font-medium text-foreground">{field}</span>
          <Input placeholder={field === "Temporary patient ID" ? "TMP-ER-####" : "Static emergency capture"} />
        </label>
      ))}
    </>
  );
}
