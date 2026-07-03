"use client";

import * as React from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FileQuestion,
  MessageSquare,
  PencilLine,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

type CommunicationPriority = "Normal" | "High" | "Sensitive" | "Critical";
type ConsentStatus = "Pending" | "Obtained" | "Not Required";
type FollowUpStatus = "Pending" | "In Progress" | "Completed" | "Overdue" | "Escalated" | "Not Required";
type ReviewStatus = "Not Reviewed" | "Reviewed" | "Needs Clarification" | "Escalated";
type WorkspaceSection = "logs" | "follow-ups" | "review";
const ROWS_PER_PAGE = 4;

type CommunicationLog = {
  id: string;
  dateLabel: string;
  dateValue: string;
  timeLabel: string;
  patientName: string;
  uhid: string;
  bed: string;
  type: string;
  attendees: string;
  summary: string;
  questions: number;
  consentStatus: ConsentStatus;
  followUpStatus: FollowUpStatus;
  recordedBy: string;
  priority: CommunicationPriority;
  reviewStatus: ReviewStatus;
};

type FollowUp = {
  id: string;
  communicationId: string;
  patientName: string;
  bed: string;
  issue: string;
  assignedTo: string;
  due: string;
  priority: CommunicationPriority;
  status: Exclude<FollowUpStatus, "Not Required">;
};

type CommunicationDraft = Omit<CommunicationLog, "id" | "dateLabel" | "timeLabel" | "reviewStatus">;

const initialLogs: CommunicationLog[] = [
  { id: "FAM-1001", dateLabel: "Today", dateValue: "2026-06-20", timeLabel: "11:30 AM", patientName: "Ramesh Kumar", uhid: "UHID-ICU-1024", bed: "ICU-Bed-05", type: "Critical Condition Update", attendees: "Wife, Son, Intensivist", summary: "Current condition, ventilator support, treatment response, and next review explained.", questions: 3, consentStatus: "Pending", followUpStatus: "Pending", recordedBy: "Dr. Mehta", priority: "Critical", reviewStatus: "Not Reviewed" },
  { id: "FAM-1002", dateLabel: "Today", dateValue: "2026-06-20", timeLabel: "09:45 AM", patientName: "Anjali Sharma", uhid: "UHID-ICU-1025", bed: "ICU-Bed-02", type: "Daily ICU Update", attendees: "Husband, Family Coordinator", summary: "Updated family about overnight stability, current medicines, and planned investigations.", questions: 1, consentStatus: "Not Required", followUpStatus: "Not Required", recordedBy: "Anjali Verma", priority: "Normal", reviewStatus: "Reviewed" },
  { id: "FAM-1003", dateLabel: "Yesterday", dateValue: "2026-06-19", timeLabel: "07:10 PM", patientName: "Mohan Verma", uhid: "UHID-ICU-1026", bed: "ICU-Bed-08", type: "Consent Discussion", attendees: "Daughter, Brother, Doctor", summary: "Shock status, central-line need, benefits, risks, and alternatives discussed.", questions: 2, consentStatus: "Obtained", followUpStatus: "Completed", recordedBy: "Dr. Rao", priority: "High", reviewStatus: "Reviewed" },
  { id: "FAM-1004", dateLabel: "Yesterday", dateValue: "2026-06-19", timeLabel: "04:20 PM", patientName: "Kavita Singh", uhid: "UHID-ICU-1027", bed: "ICU-Bed-04", type: "Complaint / Concern Discussion", attendees: "Husband, ICU Head", summary: "Concern about delayed update acknowledged; communication schedule agreed with family.", questions: 4, consentStatus: "Pending", followUpStatus: "Overdue", recordedBy: "ICU Head", priority: "Sensitive", reviewStatus: "Needs Clarification" },
  { id: "FAM-1005", dateLabel: "Today", dateValue: "2026-06-20", timeLabel: "01:15 PM", patientName: "Ramesh Kumar", uhid: "UHID-ICU-1024", bed: "ICU-Bed-05", type: "Procedure Explanation", attendees: "Wife, Senior Resident", summary: "Ventilator weaning steps and possible tracheostomy pathway explained.", questions: 2, consentStatus: "Pending", followUpStatus: "Pending", recordedBy: "Dr. Mehta", priority: "Normal", reviewStatus: "Reviewed" },
  { id: "FAM-1006", dateLabel: "Today", dateValue: "2026-06-20", timeLabel: "01:15 PM", patientName: "Anjali Sharma", uhid: "UHID-ICU-1025", bed: "ICU-Bed-02", type: "General Query", attendees: "Husband, Bedside Nurse", summary: "Diet, visitation timing, and expected transfer milestones clarified.", questions: 3, consentStatus: "Not Required", followUpStatus: "Completed", recordedBy: "Anjali Verma", priority: "Normal", reviewStatus: "Reviewed" },
  { id: "FAM-1007", dateLabel: "Yesterday", dateValue: "2026-06-19", timeLabel: "10:10 AM", patientName: "Mohan Verma", uhid: "UHID-ICU-1026", bed: "ICU-Bed-08", type: "Procedure Explanation", attendees: "Daughter, Intensivist", summary: "Central-line procedure outcome and monitoring plan discussed.", questions: 1, consentStatus: "Obtained", followUpStatus: "Completed", recordedBy: "Dr. Rao", priority: "Normal", reviewStatus: "Reviewed" },
  { id: "FAM-1008", dateLabel: "Yesterday", dateValue: "2026-06-19", timeLabel: "10:10 AM", patientName: "Kavita Singh", uhid: "UHID-ICU-1027", bed: "ICU-Bed-04", type: "General Query", attendees: "Husband, ICU Head", summary: "Current treatment response and timing of the next consultant update discussed.", questions: 2, consentStatus: "Pending", followUpStatus: "In Progress", recordedBy: "ICU Head", priority: "High", reviewStatus: "Not Reviewed" },
];

const initialFollowUps: FollowUp[] = [
  { id: "FU-2001", communicationId: "FAM-1001", patientName: "Ramesh Kumar", bed: "ICU-Bed-05", issue: "Family requested update about ventilator removal plan", assignedTo: "Dr. Mehta", due: "Today, 05:00 PM", priority: "High", status: "Pending" },
  { id: "FU-2002", communicationId: "FAM-1004", patientName: "Kavita Singh", bed: "ICU-Bed-04", issue: "Family concern regarding delay in update", assignedTo: "ICU Head", due: "Today, 02:00 PM", priority: "Sensitive", status: "Overdue" },
  { id: "FU-2003", communicationId: "FAM-1003", patientName: "Mohan Verma", bed: "ICU-Bed-08", issue: "Post central-line procedure update", assignedTo: "Dr. Iyer", due: "Today, 12:00 PM", priority: "High", status: "Completed" },
  { id: "FU-2004", communicationId: "FAM-1002", patientName: "Anjali Sharma", bed: "ICU-Bed-02", issue: "Clarify discharge readiness after rounds", assignedTo: "Neha Singh", due: "Tomorrow, 10:00 AM", priority: "Normal", status: "In Progress" },
  { id: "FU-2005", communicationId: "FAM-1005", patientName: "Ramesh Kumar", bed: "ICU-Bed-05", issue: "Consent counselling review by senior doctor", assignedTo: "Dr. Mehta", due: "Today, 06:30 PM", priority: "Critical", status: "Pending" },
];

const communicationTypes = ["Critical Condition Update", "Daily ICU Update", "Consent Discussion", "Complaint / Concern Discussion", "Procedure Explanation", "General Query"];

function emptyDraft(): CommunicationDraft {
  return {
    dateValue: "2026-06-20",
    patientName: "Ramesh Kumar",
    uhid: "UHID-ICU-1024",
    bed: "ICU-Bed-05",
    type: "Daily ICU Update",
    attendees: "Primary attendant",
    summary: "",
    questions: 0,
    consentStatus: "Not Required",
    followUpStatus: "Not Required",
    recordedBy: "Dr. Mehta",
    priority: "Normal",
  };
}

export function FamilyCommunicationWorkspace() {
  const [logs, setLogs] = React.useState(initialLogs);
  const [followUps, setFollowUps] = React.useState(initialFollowUps);
  const [search, setSearch] = React.useState("");
  const [patient, setPatient] = React.useState("All patients");
  const [bed, setBed] = React.useState("All ICU beds");
  const [doctor, setDoctor] = React.useState("All staff");
  const [type, setType] = React.useState("All types");
  const [consent, setConsent] = React.useState("All consent");
  const [followUp, setFollowUp] = React.useState("All follow-up");
  const [priority, setPriority] = React.useState("All priority");
  const [date, setDate] = React.useState("");
  const [reviewFilter, setReviewFilter] = React.useState("All review status");
  const [controlsOpen, setControlsOpen] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<WorkspaceSection>("logs");
  const [logPage, setLogPage] = React.useState(1);
  const [reviewPage, setReviewPage] = React.useState(1);
  const [selectedLog, setSelectedLog] = React.useState<CommunicationLog | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingLog, setEditingLog] = React.useState<CommunicationLog | null>(null);
  const [draft, setDraft] = React.useState<CommunicationDraft>(emptyDraft);
  const [followUpEditor, setFollowUpEditor] = React.useState<FollowUp | null>(null);

  const patients = unique(logs.map((row) => row.patientName));
  const beds = unique(logs.map((row) => row.bed));
  const staff = unique(logs.map((row) => row.recordedBy));
  const visibleLogs = logs.filter((row) => {
    const query = search.trim().toLowerCase();
    const searchable = `${row.id} ${row.patientName} ${row.uhid} ${row.bed} ${row.type} ${row.attendees} ${row.summary} ${row.recordedBy}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (patient === "All patients" || row.patientName === patient)
      && (bed === "All ICU beds" || row.bed === bed)
      && (doctor === "All staff" || row.recordedBy === doctor)
      && (type === "All types" || row.type === type)
      && (consent === "All consent" || row.consentStatus === consent)
      && (followUp === "All follow-up" || row.followUpStatus === followUp)
      && (priority === "All priority" || row.priority === priority)
      && (!date || row.dateValue === date)
      && (reviewFilter === "All review status" || row.reviewStatus === reviewFilter);
  });

  const metrics = [
    { label: "Total Communications", value: logs.length, icon: MessageSquare, tone: "info" as StatusTone },
    { label: "Updates Today", value: logs.filter((row) => row.dateLabel === "Today").length, icon: RefreshCcw, tone: "info" as StatusTone },
    { label: "Consent Pending", value: logs.filter((row) => row.consentStatus === "Pending").length, icon: FileQuestion, tone: "warning" as StatusTone },
    { label: "Follow-up Required", value: logs.filter((row) => !["Completed", "Not Required"].includes(row.followUpStatus)).length, icon: ClipboardCheck, tone: "warning" as StatusTone },
    { label: "High Priority Discussions", value: logs.filter((row) => ["Critical", "Sensitive"].includes(row.priority)).length, icon: ShieldAlert, tone: "danger" as StatusTone },
    { label: "Completed Updates", value: logs.filter((row) => row.reviewStatus === "Reviewed").length, icon: CheckCircle2, tone: "success" as StatusTone },
  ];
  const logPages = Math.max(1, Math.ceil(visibleLogs.length / ROWS_PER_PAGE));
  const safeLogPage = Math.min(logPage, logPages);
  const pagedLogs = visibleLogs.slice((safeLogPage - 1) * ROWS_PER_PAGE, safeLogPage * ROWS_PER_PAGE);
  const reviewPages = Math.max(1, Math.ceil(logs.length / ROWS_PER_PAGE));
  const safeReviewPage = Math.min(reviewPage, reviewPages);
  const pagedReviewRows = logs.slice((safeReviewPage - 1) * ROWS_PER_PAGE, safeReviewPage * ROWS_PER_PAGE);

  function resetFilters() {
    setSearch("");
    setPatient("All patients");
    setBed("All ICU beds");
    setDoctor("All staff");
    setType("All types");
    setConsent("All consent");
    setFollowUp("All follow-up");
    setPriority("All priority");
    setDate("");
    setReviewFilter("All review status");
    setLogPage(1);
  }

  function openCreate() {
    setEditingLog(null);
    setDraft(emptyDraft());
    setFormOpen(true);
  }

  function openEdit(row: CommunicationLog) {
    setEditingLog(row);
    setDraft({
      dateValue: row.dateValue,
      patientName: row.patientName,
      uhid: row.uhid,
      bed: row.bed,
      type: row.type,
      attendees: row.attendees,
      summary: row.summary,
      questions: row.questions,
      consentStatus: row.consentStatus,
      followUpStatus: row.followUpStatus,
      recordedBy: row.recordedBy,
      priority: row.priority,
    });
    setFormOpen(true);
  }

  function saveCommunication() {
    if (!draft.summary.trim()) {
      toast.error("Discussion summary is required");
      return;
    }
    if (editingLog) {
      setLogs((current) => current.map((row) => row.id === editingLog.id ? { ...row, ...draft } : row));
      toast.success(`${editingLog.id} updated`);
    } else {
      const nextId = `FAM-${1000 + logs.length + 1}`;
      setLogs((current) => [{ ...draft, id: nextId, dateLabel: "Today", timeLabel: "Now", reviewStatus: "Not Reviewed" }, ...current]);
      toast.success(`${nextId} added`);
    }
    setEditingLog(null);
    setFormOpen(false);
  }

  function setReviewStatus(id: string, status: ReviewStatus) {
    setLogs((current) => current.map((row) => row.id === id ? { ...row, reviewStatus: status } : row));
    toast.success(`${id}: ${status}`);
  }

  function updateFollowUp(id: string, patch: Partial<FollowUp>) {
    setFollowUps((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
    const item = followUps.find((row) => row.id === id);
    if (item && patch.status) {
      setLogs((current) => current.map((row) => row.id === item.communicationId ? { ...row, followUpStatus: patch.status as FollowUpStatus } : row));
    }
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden [&>*]:min-w-0 [&>*]:max-w-full">
      <Card className="w-full min-w-0 overflow-hidden">
        <button
          aria-expanded={controlsOpen}
          className="flex w-full min-w-0 items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-slate-50"
          onClick={() => setControlsOpen((open) => !open)}
          type="button"
        >
          <span className="min-w-0">
            <span className="block text-sm font-bold text-foreground">Search & filters</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{visibleLogs.length} communication record(s)</span>
          </span>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm">
            <ChevronDown className={cn("h-4 w-4 transition-transform", controlsOpen && "rotate-180")} />
          </span>
        </button>
        {controlsOpen ? (
          <CardContent className="space-y-3 border-t border-border p-3">
            <div className="flex justify-end">
              <Button className="w-full sm:w-auto" onClick={openCreate}><Plus className="h-4 w-4" />Add Family Update</Button>
            </div>
            <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.6fr)_repeat(7,minmax(112px,1fr))]">
              <label className="relative min-w-0">
                <span className="sr-only">Search communications</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input className="h-9 w-full min-w-0 rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" placeholder="Search patient, UHID, bed..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
              <FilterSelect ariaLabel="Patient" value={patient} onChange={setPatient} options={["All patients", ...patients]} />
              <FilterSelect ariaLabel="ICU bed" value={bed} onChange={setBed} options={["All ICU beds", ...beds]} />
              <FilterSelect ariaLabel="Doctor or recorder" value={doctor} onChange={setDoctor} options={["All staff", ...staff]} />
              <FilterSelect ariaLabel="Communication type" value={type} onChange={setType} options={["All types", ...communicationTypes]} />
              <FilterSelect ariaLabel="Consent" value={consent} onChange={setConsent} options={["All consent", "Pending", "Obtained", "Not Required"]} />
              <FilterSelect ariaLabel="Follow-up" value={followUp} onChange={setFollowUp} options={["All follow-up", "Pending", "In Progress", "Completed", "Overdue", "Escalated", "Not Required"]} />
              <FilterSelect ariaLabel="Priority" value={priority} onChange={setPriority} options={["All priority", "Normal", "High", "Sensitive", "Critical"]} />
            </div>
            {advancedOpen ? (
              <div className="grid min-w-0 gap-2 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,240px)_minmax(180px,240px)]">
                <input aria-label="Communication date" className="h-9 min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                <FilterSelect ariaLabel="Review status" value={reviewFilter} onChange={setReviewFilter} options={["All review status", "Not Reviewed", "Reviewed", "Needs Clarification", "Escalated"]} />
              </div>
            ) : null}
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <Button className="w-full sm:w-auto" variant="outline" onClick={resetFilters}><X className="h-4 w-4" />Reset</Button>
              <Button className="w-full sm:w-auto" onClick={() => toast.success(`${visibleLogs.length} communication logs matched`)}><SlidersHorizontal className="h-4 w-4" />Apply Filters</Button>
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => setAdvancedOpen((open) => !open)}>Advanced Filters</Button>
            </div>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border shadow-sm lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((item) => <CommunicationMetric key={item.label} {...item} />)}
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-white p-1 shadow-sm">
        <SectionTab active={activeSection === "logs"} count={visibleLogs.length} label="Communication Logs" onClick={() => setActiveSection("logs")} />
        <SectionTab active={activeSection === "follow-ups"} count={followUps.length} label="Follow-ups" onClick={() => setActiveSection("follow-ups")} />
        <SectionTab active={activeSection === "review"} count={logs.filter((row) => row.reviewStatus !== "Reviewed").length} label="Review" onClick={() => setActiveSection("review")} />
      </div>

      {activeSection === "logs" ? <CommunicationLogTable page={safeLogPage} pages={logPages} rows={pagedLogs} total={visibleLogs.length} onPage={setLogPage} onView={setSelectedLog} onEdit={openEdit} /> : null}

      {activeSection === "follow-ups" ? (
        <FollowUpTracker
          rows={followUps}
          onEdit={setFollowUpEditor}
          onComplete={(row) => {
            updateFollowUp(row.id, { status: "Completed" });
            toast.success(`${row.id} marked completed`);
          }}
          onEscalate={(row) => {
            updateFollowUp(row.id, { status: "Escalated", priority: "Critical" });
            toast.success(`${row.id} escalated`);
          }}
          onView={(row) => setSelectedLog(logs.find((item) => item.id === row.communicationId) ?? null)}
        />
      ) : null}

      {activeSection === "review" ? <CommunicationReviewOverview page={safeReviewPage} pages={reviewPages} rows={pagedReviewRows} total={logs.length} onPage={setReviewPage} onView={setSelectedLog} onStatus={setReviewStatus} /> : null}

      <CommunicationFormModal open={formOpen} editing={editingLog} draft={draft} onDraft={setDraft} onClose={() => { setFormOpen(false); setEditingLog(null); }} onSave={saveCommunication} />

      <CenterModal open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)} title={selectedLog?.id ?? "Communication"} description={selectedLog ? `${selectedLog.patientName} | ${selectedLog.bed}` : undefined}>
        {selectedLog ? <CommunicationDetails row={selectedLog} /> : null}
      </CenterModal>

      <CenterModal open={Boolean(followUpEditor)} onOpenChange={(open) => !open && setFollowUpEditor(null)} title="Update follow-up" description={followUpEditor?.id}>
        {followUpEditor ? (
          <div className="space-y-4">
            <FormField label="Issue / question"><textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm" value={followUpEditor.issue} onChange={(event) => setFollowUpEditor({ ...followUpEditor, issue: event.target.value })} /></FormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Assigned to"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={followUpEditor.assignedTo} onChange={(event) => setFollowUpEditor({ ...followUpEditor, assignedTo: event.target.value })} /></FormField>
              <FormField label="Status"><FilterSelect ariaLabel="Follow-up status" value={followUpEditor.status} onChange={(value) => setFollowUpEditor({ ...followUpEditor, status: value as FollowUp["status"] })} options={["Pending", "In Progress", "Completed", "Overdue", "Escalated"]} /></FormField>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setFollowUpEditor(null)}>Cancel</Button><Button onClick={() => { updateFollowUp(followUpEditor.id, followUpEditor); toast.success(`${followUpEditor.id} updated`); setFollowUpEditor(null); }}>Save Follow-up</Button></div>
          </div>
        ) : null}
      </CenterModal>
    </div>
  );
}

function CommunicationMetric({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof MessageSquare; tone: StatusTone }) {
  return (
    <div className="min-h-[62px] bg-white p-2.5">
      <div className="flex items-start justify-between gap-2"><span className="text-xs font-semibold text-muted-foreground">{label}</span><Icon className={cn("h-4 w-4 shrink-0", tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : "text-info")} /></div>
      <div className="mt-1 text-lg font-semibold leading-none text-foreground">{value}</div>
    </div>
  );
}

function SectionTab({ active, count, label, onClick }: { active: boolean; count: number; label: string; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex min-w-0 items-center justify-center gap-1 rounded px-2 py-2 text-xs font-semibold transition sm:text-sm",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="truncate">{label}</span>
      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", active ? "bg-white/20" : "bg-surface-muted")}>{count}</span>
    </button>
  );
}

function CommunicationLogTable({ rows, total, page, pages, onPage, onView, onEdit }: { rows: CommunicationLog[]; total: number; page: number; pages: number; onPage: (page: number) => void; onView: (row: CommunicationLog) => void; onEdit: (row: CommunicationLog) => void }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="divide-y divide-border md:hidden">
          {rows.length ? rows.map((row) => (
            <article className="space-y-2 p-3" key={`mobile-${row.id}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0"><div className="font-semibold text-foreground">{row.patientName}</div><div className="text-xs text-muted-foreground">{row.uhid} | {row.bed}</div></div>
                <Badge tone={priorityTone(row.priority)}>{row.priority}</Badge>
              </div>
              <div className="text-sm font-semibold text-foreground">{row.type}</div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{row.summary}</p>
              <div className="flex flex-wrap items-center gap-1.5"><Badge tone={consentTone(row.consentStatus)}>Consent: {row.consentStatus}</Badge><Badge tone={followUpTone(row.followUpStatus)}>Follow-up: {row.followUpStatus}</Badge></div>
              <div className="flex items-center justify-between gap-2 border-t border-border pt-2"><span className="text-xs text-muted-foreground">{row.id} | {row.dateLabel}, {row.timeLabel}</span><div className="flex gap-1"><Button aria-label={`View ${row.id}`} size="icon" title="View communication" variant="outline" onClick={() => onView(row)}><Eye className="h-4 w-4" /></Button><Button aria-label={`Edit ${row.id}`} size="icon" title="Edit communication" variant="outline" onClick={() => onEdit(row)}><PencilLine className="h-4 w-4" /></Button></div></div>
            </article>
          )) : <div className="p-8 text-center text-sm text-muted-foreground">No records match the selected filters.</div>}
        </div>
        <div className="hidden max-w-full overflow-x-auto overscroll-x-contain md:block">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground"><tr>{["Log / Time", "Patient / Bed", "Communication", "Discussion", "Questions", "Consent / Follow-up", "Recorded By", "Priority", "Action"].map((label) => <th className="border-b border-border px-3 py-2 text-left" key={label}>{label}</th>)}</tr></thead>
            <tbody>{rows.length ? rows.map((row) => (
              <tr className="border-b border-border last:border-0" key={row.id}>
                <Cell strong>{row.id}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">{row.dateLabel}, {row.timeLabel}</span></Cell>
                <Cell strong><span className="whitespace-nowrap">{row.patientName}</span><span className="block whitespace-nowrap text-xs font-normal text-muted-foreground">{row.bed}</span></Cell>
                <Cell strong>{row.type}<span className="mt-0.5 block max-w-40 truncate text-xs font-normal text-muted-foreground">{row.attendees}</span></Cell>
                <Cell><span className="line-clamp-2 max-w-[220px]">{row.summary}</span></Cell>
                <Cell strong>{row.questions}</Cell>
                <Cell><div className="flex max-w-36 flex-wrap gap-1"><Badge tone={consentTone(row.consentStatus)}>{row.consentStatus}</Badge><Badge tone={followUpTone(row.followUpStatus)}>{row.followUpStatus}</Badge></div></Cell>
                <Cell strong>{row.recordedBy}</Cell><Cell><Badge tone={priorityTone(row.priority)}>{row.priority}</Badge></Cell>
                <td className="px-3 py-2"><div className="flex gap-1"><Button aria-label={`View ${row.id}`} size="icon" title="View communication" variant="outline" onClick={() => onView(row)}><Eye className="h-4 w-4" /></Button><Button aria-label={`Edit ${row.id}`} size="icon" title="Edit communication" variant="outline" onClick={() => onEdit(row)}><PencilLine className="h-4 w-4" /></Button></div></td>
              </tr>
            )) : <tr><td className="px-4 py-10 text-center text-muted-foreground" colSpan={9}>No records match the selected filters.</td></tr>}</tbody>
          </table>
        </div>
      </CardContent>
      <CompactPagination page={page} pages={pages} total={total} onPage={onPage} />
    </Card>
  );
}

function FollowUpTracker({ rows, onEdit, onComplete, onEscalate, onView }: { rows: FollowUp[]; onEdit: (row: FollowUp) => void; onComplete: (row: FollowUp) => void; onEscalate: (row: FollowUp) => void; onView: (row: FollowUp) => void }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="min-w-0 p-0">
        <div className="divide-y divide-border md:hidden">
          {rows.map((row) => <article className="space-y-2 p-3" key={`mobile-${row.id}`}><div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{row.patientName}</div><div className="text-xs text-muted-foreground">{row.id} | {row.bed}</div></div><Badge tone={followUpTone(row.status)}>{row.status}</Badge></div><p className="text-sm">{row.issue}</p><div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>Owner: {row.assignedTo}</span><span>Due: {row.due}</span></div><div className="flex items-center justify-between gap-2 border-t border-border pt-2"><Badge tone={priorityTone(row.priority)}>{row.priority}</Badge><FollowUpActions row={row} onEdit={onEdit} onComplete={onComplete} onEscalate={onEscalate} onView={onView} /></div></article>)}
        </div>
        <div className="hidden max-w-full overflow-x-auto overscroll-x-contain md:block">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground"><tr>{["Patient / Bed", "Issue / Question", "Owner / Due", "Priority", "Status", "Action"].map((label) => <th className="border-b border-border px-3 py-2.5 text-left" key={label}>{label}</th>)}</tr></thead>
            <tbody>{rows.map((row) => <tr className="border-b border-border last:border-0" key={row.id}><Cell strong>{row.patientName}<span className="block text-xs font-normal text-muted-foreground">{row.id} | {row.bed}</span></Cell><Cell>{row.issue}</Cell><Cell strong>{row.assignedTo}<span className="block text-xs font-normal text-muted-foreground">{row.due}</span></Cell><Cell><Badge tone={priorityTone(row.priority)}>{row.priority}</Badge></Cell><Cell><Badge tone={followUpTone(row.status)}>{row.status}</Badge></Cell><td className="px-3 py-2.5"><FollowUpActions row={row} onEdit={onEdit} onComplete={onComplete} onEscalate={onEscalate} onView={onView} /></td></tr>)}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function FollowUpActions({ row, onEdit, onComplete, onEscalate, onView }: { row: FollowUp; onEdit: (row: FollowUp) => void; onComplete: (row: FollowUp) => void; onEscalate: (row: FollowUp) => void; onView: (row: FollowUp) => void }) {
  return <div className="flex gap-1"><Button aria-label={`Update ${row.id}`} size="icon" title="Update follow-up" variant="outline" onClick={() => onEdit(row)}><PencilLine className="h-4 w-4" /></Button><Button aria-label={`Complete ${row.id}`} disabled={row.status === "Completed"} size="icon" title="Mark completed" onClick={() => onComplete(row)}><CheckCircle2 className="h-4 w-4" /></Button><Button aria-label={`Escalate ${row.id}`} disabled={row.status === "Completed"} size="icon" title="Escalate" variant="outline" onClick={() => onEscalate(row)}><ShieldAlert className="h-4 w-4" /></Button><Button aria-label={`View ${row.id}`} size="icon" title="View communication" variant="outline" onClick={() => onView(row)}><Eye className="h-4 w-4" /></Button></div>;
}

function CommunicationReviewOverview({ rows, total, page, pages, onPage, onView, onStatus }: { rows: CommunicationLog[]; total: number; page: number; pages: number; onPage: (page: number) => void; onView: (row: CommunicationLog) => void; onStatus: (id: string, status: ReviewStatus) => void }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="min-w-0 p-0">
        <div className="divide-y divide-border md:hidden">
          {rows.map((row) => <article className="space-y-2 p-3" key={`mobile-review-${row.id}`}><div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{row.patientName}</div><div className="text-xs text-muted-foreground">{row.bed} | {row.dateLabel}, {row.timeLabel}</div></div><Badge tone={reviewTone(row.reviewStatus)}>{row.reviewStatus}</Badge></div><div className="text-sm">{row.type}</div><div className="flex items-center justify-between gap-2 border-t border-border pt-2"><Badge tone={priorityTone(row.priority)}>{row.priority}</Badge><ReviewActions row={row} onView={onView} onStatus={onStatus} /></div></article>)}
        </div>
        <div className="hidden max-w-full overflow-x-auto overscroll-x-contain md:block">
          <table className="w-full min-w-[820px] border-collapse text-sm"><thead className="bg-surface-muted text-xs uppercase text-muted-foreground"><tr>{["Patient / Bed", "Communication", "Recorded", "Priority", "Review Status", "Action"].map((label) => <th className="border-b border-border px-3 py-2.5 text-left" key={label}>{label}</th>)}</tr></thead>
            <tbody>{rows.map((row) => <tr className="border-b border-border last:border-0" key={`review-${row.id}`}><Cell strong>{row.patientName}<span className="block text-xs font-normal text-muted-foreground">{row.bed}</span></Cell><Cell>{row.type}</Cell><Cell>{row.recordedBy}<span className="block text-xs text-muted-foreground">{row.dateLabel}, {row.timeLabel}</span></Cell><Cell><Badge tone={priorityTone(row.priority)}>{row.priority}</Badge></Cell><Cell><Badge tone={reviewTone(row.reviewStatus)}>{row.reviewStatus}</Badge></Cell><td className="px-3 py-2.5"><ReviewActions row={row} onView={onView} onStatus={onStatus} /></td></tr>)}</tbody>
          </table>
        </div>
      </CardContent>
      <CompactPagination page={page} pages={pages} total={total} onPage={onPage} />
    </Card>
  );
}

function CompactPagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, total);
  return <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-3 py-2"><span className="text-xs text-muted-foreground">{start}-{end} of {total}</span><div className="flex items-center gap-1"><Button aria-label="Previous page" disabled={page <= 1} size="icon" variant="outline" onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="min-w-12 text-center text-xs font-semibold">{page} / {pages}</span><Button aria-label="Next page" disabled={page >= pages} size="icon" variant="outline" onClick={() => onPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>;
}

function ReviewActions({ row, onView, onStatus }: { row: CommunicationLog; onView: (row: CommunicationLog) => void; onStatus: (id: string, status: ReviewStatus) => void }) {
  return <div className="flex gap-1"><Button aria-label={`Review ${row.id}`} size="icon" title="Review" variant="outline" onClick={() => onView(row)}><Eye className="h-4 w-4" /></Button><Button aria-label={`Clarify ${row.id}`} size="icon" title="Ask clarification" variant="outline" onClick={() => onStatus(row.id, "Needs Clarification")}><FileQuestion className="h-4 w-4" /></Button><Button aria-label={`Mark ${row.id} reviewed`} size="icon" title="Mark reviewed" onClick={() => onStatus(row.id, "Reviewed")}><CheckCircle2 className="h-4 w-4" /></Button><Button aria-label={`Escalate ${row.id}`} size="icon" title="Escalate" variant="outline" onClick={() => onStatus(row.id, "Escalated")}><ShieldAlert className="h-4 w-4" /></Button></div>;
}

function CommunicationFormModal({ open, editing, draft, onDraft, onClose, onSave }: { open: boolean; editing: CommunicationLog | null; draft: CommunicationDraft; onDraft: (draft: CommunicationDraft) => void; onClose: () => void; onSave: () => void }) {
  return (
    <CenterModal open={open} onOpenChange={(value) => !value && onClose()} title={editing ? `Edit ${editing.id}` : "Add Family Update"} description="Document the discussion, consent, questions, priority, and next action.">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Patient"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.patientName} onChange={(event) => onDraft({ ...draft, patientName: event.target.value })} /></FormField>
          <FormField label="UHID"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.uhid} onChange={(event) => onDraft({ ...draft, uhid: event.target.value })} /></FormField>
          <FormField label="ICU bed"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.bed} onChange={(event) => onDraft({ ...draft, bed: event.target.value })} /></FormField>
          <FormField label="Date"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" type="date" value={draft.dateValue} onChange={(event) => onDraft({ ...draft, dateValue: event.target.value })} /></FormField>
          <FormField label="Communication type"><FilterSelect ariaLabel="Communication type" value={draft.type} onChange={(value) => onDraft({ ...draft, type: value })} options={communicationTypes} /></FormField>
          <FormField label="Recorded by"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.recordedBy} onChange={(event) => onDraft({ ...draft, recordedBy: event.target.value })} /></FormField>
        </div>
        <FormField label="Attendees"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.attendees} onChange={(event) => onDraft({ ...draft, attendees: event.target.value })} /></FormField>
        <FormField label="Discussion summary"><textarea className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm" value={draft.summary} onChange={(event) => onDraft({ ...draft, summary: event.target.value })} /></FormField>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Questions"><input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" min="0" type="number" value={draft.questions} onChange={(event) => onDraft({ ...draft, questions: Number(event.target.value) })} /></FormField>
          <FormField label="Consent"><FilterSelect ariaLabel="Consent status" value={draft.consentStatus} onChange={(value) => onDraft({ ...draft, consentStatus: value as ConsentStatus })} options={["Pending", "Obtained", "Not Required"]} /></FormField>
          <FormField label="Follow-up"><FilterSelect ariaLabel="Follow-up status" value={draft.followUpStatus} onChange={(value) => onDraft({ ...draft, followUpStatus: value as FollowUpStatus })} options={["Pending", "In Progress", "Completed", "Overdue", "Not Required"]} /></FormField>
          <FormField label="Priority"><FilterSelect ariaLabel="Priority" value={draft.priority} onChange={(value) => onDraft({ ...draft, priority: value as CommunicationPriority })} options={["Normal", "High", "Sensitive", "Critical"]} /></FormField>
        </div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={onSave}>{editing ? "Save Changes" : "Add Update"}</Button></div>
      </div>
    </CenterModal>
  );
}

function CommunicationDetails({ row }: { row: CommunicationLog }) {
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Detail label="Patient" value={`${row.patientName} (${row.uhid})`} /><Detail label="Location" value={row.bed} /><Detail label="Date & time" value={`${row.dateLabel}, ${row.timeLabel}`} /><Detail label="Recorded by" value={row.recordedBy} /><Detail label="Communication type" value={row.type} /><Detail label="Attendees" value={row.attendees} /></div><div className="rounded-md border border-border bg-surface-muted p-3"><div className="text-xs font-semibold uppercase text-muted-foreground">Discussion Summary</div><p className="mt-2 text-sm text-foreground">{row.summary}</p></div><div className="flex flex-wrap gap-2"><Badge tone={consentTone(row.consentStatus)}>Consent: {row.consentStatus}</Badge><Badge tone={followUpTone(row.followUpStatus)}>Follow-up: {row.followUpStatus}</Badge><Badge tone={priorityTone(row.priority)}>{row.priority}</Badge><Badge tone={reviewTone(row.reviewStatus)}>{row.reviewStatus}</Badge></div></div>;
}

function FilterSelect({ ariaLabel, value, onChange, options }: { ariaLabel: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <select aria-label={ariaLabel} className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-sm font-semibold text-foreground">{value}</div></div>;
}

function Cell({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={cn("px-3 py-2 align-middle text-foreground", strong && "font-semibold")}>{children}</td>;
}

function unique(values: string[]) { return Array.from(new Set(values)); }
function priorityTone(value: CommunicationPriority): StatusTone { return value === "Critical" ? "critical" : value === "Sensitive" ? "danger" : value === "High" ? "warning" : "muted"; }
function consentTone(value: ConsentStatus): StatusTone { return value === "Obtained" ? "success" : value === "Pending" ? "warning" : "muted"; }
function followUpTone(value: FollowUpStatus): StatusTone { return value === "Completed" || value === "Not Required" ? "success" : value === "Overdue" || value === "Escalated" ? "danger" : value === "In Progress" ? "info" : "warning"; }
function reviewTone(value: ReviewStatus): StatusTone { return value === "Reviewed" ? "success" : value === "Escalated" ? "critical" : value === "Needs Clarification" ? "warning" : "info"; }
