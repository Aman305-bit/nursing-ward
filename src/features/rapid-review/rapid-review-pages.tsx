"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Edit3,
  Eye,
  FileText,
  HeartPulse,
  ListChecks,
  LockKeyhole,
  Maximize2,
  Minimize2,
  PhoneCall,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  UserPlus,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect } from "@/features/admin/admin-shared";
import { cn } from "@/lib/utils";
import { RapidReviewControlToggle } from "@/features/rapid-review/rapid-review-control-toggle";
import type { Role, StatusTone } from "@/types";
import {
  adultObservationChartRows,
  adultObservationHours,
  adultObservationRiskPalette,
  consciousnessScores,
  gcsScoreLabel,
  getRiskLevel,
  inferFio2FromOxygenSupport,
  pulseDeficitRiskLevel,
  pulseDeficitValue,
  pulseQualityRiskLevel,
  pulseRhythmRiskLevel,
  rapidAllowedRoles,
  rapidEcgRhythmOptions,
  rapidLevelTone,
  rapidPriorityRank,
  rapidPulseActionOptions,
  rapidPulseQualityOptions,
  rapidPulseRhythmOptions,
  rapidPulseSiteOptions,
  rapidPulseSourceOptions,
  rapidPulseSymptomOptions,
  rapidObservationRows,
  rapidResponseRules,
  rapidReviewPatients,
  rapidRoleAccess,
  rapidStatusTone,
  rapidZoneTone,
  type AdultObservationDataRow,
  type AdultObservationRiskLevel,
  type AdultObservationVitalType,
  type RapidQueueStatus,
  type RapidObservationSet,
  type RapidEcgRhythm,
  type RapidPulseAction,
  type RapidPulseQuality,
  type RapidPulseRhythm,
  type RapidPulseSite,
  type RapidPulseSource,
  type RapidPulseSymptom,
  type RapidResponseLevel,
  type RapidReviewPatient,
  type RapidZone,
} from "./rapid-review-data";
import { RapidReviewGraphTab } from "./rapid-review-graph";

type ReviewUpdate = {
  status: RapidQueueStatus;
  decision: string;
  note: string;
  owner: string;
  nextObservation: string;
  updatedAt: string;
};

type DialogState = {
  patient: RapidReviewPatient;
  intent: "review" | "escalate" | "observe";
};

type ObservationDraft = {
  patientId: string;
  observationDate: string;
  observationTime: string;
  recordedBy: string;
  shift: "Morning" | "Evening" | "Night" | "Emergency";
  respiratoryRate: string;
  spo2: string;
  oxygenFlow: string;
  fio2: string;
  deliveryMethod: NonNullable<RapidObservationSet["deliveryMethod"]>;
  systolic: string;
  diastolic: string;
  pulse: string;
  monitorHeartRate: string;
  pulseRhythm: RapidPulseRhythm;
  pulseSource: RapidPulseSource;
  pulseSite: RapidPulseSite;
  pulseQuality: RapidPulseQuality;
  pulseSymptoms: RapidPulseSymptom[];
  pulseActionTaken: RapidPulseAction;
  temperature: string;
  consciousness: string;
  painScore: string;
  urineOutput: string;
  note: string;
};

type ObservationReviewUpdate = {
  reviewStatus: NonNullable<RapidObservationSet["reviewStatus"]>;
  reviewedBy: string;
  reviewedAt: string;
  doctorAction: string;
  note: string;
  ecgRhythm?: RapidEcgRhythm;
  rhythmPlan?: string;
};

type ObservationReviewDialogState = {
  patient: RapidReviewPatient;
  observation: RapidObservationSet;
} | null;

type ClinicalConsultPriority = "Routine" | "Urgent" | "Emergency";
type ClinicalConsultStatus = "Requested" | "Acknowledged" | "Assigned" | "In progress" | "Advice given" | "Completed" | "Escalated";

type ClinicalConsultEvent = {
  id: string;
  status: ClinicalConsultStatus;
  action: string;
  actor: string;
  at: string;
  note: string;
};

type ClinicalConsultRequest = {
  id: string;
  patientId: string;
  observationId?: string;
  patientName: string;
  uhid: string;
  location: string;
  date: string;
  time: string;
  requestedBy: string;
  department: string;
  requestedTo: string;
  priority: ClinicalConsultPriority;
  requestType: string;
  investigation: string;
  responseTarget: string;
  clinicalQuestion: string;
  handoffSummary: string;
  status: ClinicalConsultStatus;
  advice?: string;
  lastUpdated: string;
  events: ClinicalConsultEvent[];
};

type ClinicalConsultDialogState = {
  patient: RapidReviewPatient;
  observation?: RapidObservationSet;
} | null;

type NurseObservationStatus = "Active" | "Edited" | "Voided" | "Doctor reviewed";
type NurseObservationAuditAction = "Created" | "Edited" | "Voided";

type NurseObservationVoid = {
  observationId: string;
  voidedBy: string;
  voidedAt: string;
  reason: string;
  note: string;
};

type NurseObservationAuditItem = {
  id: string;
  observationId: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  action: NurseObservationAuditAction;
  performedBy: string;
  reason: string;
  summary: string;
  previousSummary?: string;
  newSummary?: string;
};

type NurseObservationEditDialogState = {
  patient: RapidReviewPatient;
  observation: RapidObservationSet;
} | null;

type NurseObservationVoidDialogState = {
  patient: RapidReviewPatient;
  observation: RapidObservationSet;
} | null;

type ObservationLogRow = {
  patient: RapidReviewPatient;
  observation: RapidObservationSet;
};

type PatientTimelineSummary = {
  latest?: RapidObservationSet;
  firstWarning?: RapidObservationSet;
  firstHighRisk?: RapidObservationSet;
  peak?: RapidObservationSet;
  reviewedCount: number;
  pendingCount: number;
};

const DATE_LOG_PAGE_SIZE = 20;

const clinicalConsultDepartments = [
  "Cardiology",
  "Nephrology",
  "ICU / Anaesthesia",
  "Pulmonology",
  "Medicine",
  "Surgery",
  "Radiology",
  "Pathology / Lab",
  "Dialysis Unit",
  "Emergency Team",
];

const clinicalConsultDoctorsByDepartment: Record<string, string[]> = {
  Cardiology: ["On-call cardiologist", "Dr. Sameer Mehta", "Dr. Ritu Anand"],
  Nephrology: ["On-call nephrologist", "Dr. Mohan Ahluvia", "Dr. Neha Malik"],
  "ICU / Anaesthesia": ["On-call intensivist", "Dr. Kavita Rao", "Anaesthesia emergency team"],
  Pulmonology: ["On-call pulmonologist", "Dr. Imran Shah", "Respiratory therapy lead"],
  Medicine: ["On-call physician", "Dr. Aman Verma", "Medical registrar"],
  Surgery: ["On-call surgeon", "Surgical registrar", "Procedure team"],
  Radiology: ["On-call radiologist", "CT reporting desk", "Ultrasound team"],
  "Pathology / Lab": ["Lab consultant", "Critical lab desk", "Phlebotomy lead"],
  "Dialysis Unit": ["Dialysis consultant", "Dialysis coordinator", "Renal technician lead"],
  "Emergency Team": ["MER team", "Emergency physician", "Rapid response coordinator"],
};

const clinicalConsultRequestTypes = ["Bedside review", "Phone advice", "Investigation review", "Procedure clearance", "Transfer advice", "Second opinion"];
const clinicalConsultInvestigations = ["None", "ECG", "ABG", "Serum electrolytes", "Chest X-ray", "CT review", "Echo", "Dialysis review", "Medication review", "Procedure clearance", "ICU transfer assessment"];
const clinicalConsultResponseTargets = ["Immediate / 5 min", "Within 15 min", "Within 30 min", "Within 1 hour", "Same shift", "Today"];
const clinicalConsultStatusWorkflow: ClinicalConsultStatus[] = ["Requested", "Acknowledged", "Assigned", "In progress", "Advice given", "Completed", "Escalated"];

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function effectiveStatus(patient: RapidReviewPatient, updates: Record<string, ReviewUpdate>) {
  return updates[patient.id]?.status ?? patient.queueStatus;
}

function optionValue(value: string) {
  return value;
}

export function RapidReviewPage() {
  const { role } = useRole();
  const roleProfile = rapidRoleAccess[role];
  const allowed = rapidAllowedRoles.includes(role);
  const readOnly = Boolean(roleProfile?.readOnly);
  const [search, setSearch] = React.useState("");
  const [response, setResponse] = React.useState("All response");
  const [ward, setWard] = React.useState("All wards");
  const [sortBy, setSortBy] = React.useState("Clinical priority");
  const [selectedPatientId, setSelectedPatientId] = React.useState(rapidReviewPatients[0]?.id ?? "");
  const [activeTab, setActiveTab] = React.useState("queue");
  const [dialogState, setDialogState] = React.useState<DialogState | null>(null);
  const [observationReviewDialog, setObservationReviewDialog] = React.useState<ObservationReviewDialogState>(null);
  const [updates, setUpdates] = React.useState<Record<string, ReviewUpdate>>({});
  const [addedObservations, setAddedObservations] = React.useState<Record<string, RapidObservationSet[]>>({});
  const [editedObservations, setEditedObservations] = React.useState<Record<string, RapidObservationSet>>({});
  const [voidedObservations, setVoidedObservations] = React.useState<Record<string, NurseObservationVoid>>({});
  const [nurseAuditTrail, setNurseAuditTrail] = React.useState<NurseObservationAuditItem[]>([]);
  const [observationReviews, setObservationReviews] = React.useState<Record<string, ObservationReviewUpdate>>({});
  const [clinicalConsults, setClinicalConsults] = React.useState<ClinicalConsultRequest[]>(() => createInitialClinicalConsultRequests(rapidReviewPatients));

  const nurseReviewPatients = React.useMemo<RapidReviewPatient[]>(
    () => rapidReviewPatients.map((patient) => ({
      ...patient,
      observationHistory: [...patient.observationHistory, ...(addedObservations[patient.id] ?? [])].map((observation) => editedObservations[observation.id] ?? observation),
    })),
    [addedObservations, editedObservations],
  );

  const patients = React.useMemo<RapidReviewPatient[]>(
    () => nurseReviewPatients.map((patient) => ({
      ...patient,
      observationHistory: patient.observationHistory.filter((observation) => !voidedObservations[observation.id]),
    })),
    [nurseReviewPatients, voidedObservations],
  );

  const wards = React.useMemo(() => ["All wards", ...Array.from(new Set(patients.map((patient) => patient.ward)))], [patients]);

  const rows = React.useMemo(() => {
    const filtered = patients.filter((patient) => {
      const text = `${patient.patientName} ${patient.uhid} ${patient.visitNo} ${patient.ward} ${patient.bed} ${patient.source} ${patient.consultant} ${patient.owner} ${patient.responseLevel} ${patient.trigger}`;
      return includes(text, search) && (response === "All response" || patient.responseLevel === response) && (ward === "All wards" || patient.ward === ward);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "Oldest wait") return b.waitMinutes - a.waitMinutes;
      if (sortBy === "Newest wait") return a.waitMinutes - b.waitMinutes;
      if (sortBy === "Patient name") return a.patientName.localeCompare(b.patientName);
      if (sortBy === "Ward") return `${a.ward} ${a.bed}`.localeCompare(`${b.ward} ${b.bed}`);
      return rapidPriorityRank(b.responseLevel) - rapidPriorityRank(a.responseLevel) || b.waitMinutes - a.waitMinutes;
    });
  }, [patients, response, search, sortBy, ward]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const merCount = patients.filter((patient) => patient.responseLevel === "MER Call").length;
  const mdtCount = patients.filter((patient) => patient.responseLevel === "MDT Review").length;
  const rnCount = patients.filter((patient) => patient.responseLevel === "RN Review").length;
  const openCount = patients.filter((patient) => effectiveStatus(patient, updates) !== "Closed").length;
  const pendingObservationCount = React.useMemo(
    () => patients.flatMap((patient) => patient.observationHistory).filter((observation) => observationReviewStatus(observation, observationReviews) === "Pending doctor review").length,
    [observationReviews, patients],
  );

  const handleSaveReview = React.useCallback((patient: RapidReviewPatient, update: ReviewUpdate) => {
    setUpdates((current) => ({ ...current, [patient.id]: update }));
    toast.success(`${update.decision} recorded for ${patient.patientName}`);
    setDialogState(null);
  }, []);

  const handleAddObservation = React.useCallback((patient: RapidReviewPatient, observation: RapidObservationSet) => {
    setAddedObservations((current) => ({ ...current, [patient.id]: [...(current[patient.id] ?? []), observation] }));
    setNurseAuditTrail((current) => [createNurseObservationAuditItem("Created", patient, observation, {
      performedBy: observation.recordedBy,
      reason: "New nurse observation entry",
      summary: "Observation created from Nurse Entry",
      newObservation: observation,
    }), ...current]);
    setSelectedPatientId(patient.id);
    setActiveTab("doctor");
    toast.success(`Observation added for ${patient.patientName}`);
  }, []);

  const handleUpdateNurseObservation = React.useCallback((patient: RapidReviewPatient, original: RapidObservationSet, updated: RapidObservationSet, reason: string, performedBy: string) => {
    setEditedObservations((current) => ({ ...current, [original.id]: updated }));
    setNurseAuditTrail((current) => [createNurseObservationAuditItem("Edited", patient, updated, {
      performedBy,
      reason,
      summary: "Nurse amendment saved",
      previousObservation: original,
      newObservation: updated,
    }), ...current]);
    setSelectedPatientId(patient.id);
    toast.success(`Observation edited for ${patient.patientName}`);
  }, []);

  const handleVoidNurseObservation = React.useCallback((patient: RapidReviewPatient, observation: RapidObservationSet, voidEntry: NurseObservationVoid) => {
    setVoidedObservations((current) => ({ ...current, [observation.id]: voidEntry }));
    setNurseAuditTrail((current) => [createNurseObservationAuditItem("Voided", patient, observation, {
      performedBy: voidEntry.voidedBy,
      reason: voidEntry.reason,
      summary: voidEntry.note || "Observation voided from active clinical chart",
      previousObservation: observation,
    }), ...current]);
    setSelectedPatientId(patient.id);
    toast.success(`Observation voided for ${patient.patientName}`);
  }, []);

  const handleOpenDoctorReview = React.useCallback((patient: RapidReviewPatient) => {
    setSelectedPatientId(patient.id);
    setActiveTab("doctor");
    toast.info(`${patient.patientName} loaded in Doctor Review`);
  }, []);

  const handleSaveObservationReview = React.useCallback((observation: RapidObservationSet, update: ObservationReviewUpdate) => {
    setObservationReviews((current) => ({ ...current, [observation.id]: update }));
    toast.success(`${update.reviewStatus} by ${update.reviewedBy}`);
    setObservationReviewDialog(null);
  }, []);

  const handleCreateClinicalConsult = React.useCallback((request: ClinicalConsultRequest) => {
    setClinicalConsults((current) => [request, ...current]);
    toast.success(`${request.department} consult requested for ${request.patientName}`);
  }, []);

  const handleUpdateClinicalConsultStatus = React.useCallback((requestId: string, status: ClinicalConsultStatus) => {
    setClinicalConsults((current) => current.map((request) => {
      if (request.id !== requestId) return request;
      const advice = status === "Advice given" && !request.advice
        ? `Advice recorded by ${request.requestedTo}. Continue monitoring and update if vitals worsen.`
        : request.advice;
      return appendClinicalConsultEvent(
        { ...request, status, advice, lastUpdated: "Just now" },
        status,
        clinicalConsultStatusActionText(status),
        request.requestedTo,
        clinicalConsultStatusEventNote(status, request),
      );
    }));
    toast.success(`Consult marked ${status}`);
  }, []);

  const handleSendClinicalConsultReminder = React.useCallback((requestId: string) => {
    setClinicalConsults((current) => current.map((request) => {
      if (request.id !== requestId) return request;
      return {
        ...request,
        advice: request.advice ?? `Reminder sent to ${request.requestedTo}. Awaiting consult response.`,
        lastUpdated: "Reminder sent just now",
        events: [
          ...request.events,
          createClinicalConsultEvent(request.status, "Reminder sent", "Consult coordinator", `Reminder sent to ${request.requestedTo}.`),
        ],
      };
    }));
    toast.success("Consult reminder sent");
  }, []);

  const columns = React.useMemo<ColumnDef<RapidReviewPatient>[]>(() => [
    {
      header: "Patient",
      cell: ({ row }) => (
        <div className="min-w-[190px]">
          <div className="font-medium text-foreground">{row.original.patientName}</div>
          <div className="text-xs text-muted-foreground">{row.original.uhid} - {row.original.visitNo}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge tone="muted">{row.original.ageGender}</Badge>
            <Badge tone="info">{row.original.source}</Badge>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.bed}</div>
          <div className="text-xs text-muted-foreground">{row.original.ward}</div>
        </div>
      ),
    },
    {
      header: "Trigger",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <StatusPill tone={rapidLevelTone(row.original.responseLevel)}>{row.original.responseLevel}</StatusPill>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">{row.original.trigger}</div>
        </div>
      ),
    },
    {
      header: "Time",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.reviewDue}</div>
          <div className="text-xs text-muted-foreground">{row.original.waitMinutes} min waiting</div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: ({ row }) => {
        const status = effectiveStatus(row.original, updates);
        return <StatusPill tone={rapidStatusTone(status)}>{status}</StatusPill>;
      },
    },
    {
      header: "Owner",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{updates[row.original.id]?.owner ?? row.original.owner}</div>
          <div className="text-xs text-muted-foreground">{row.original.lastObservationAt}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex min-w-[174px] flex-wrap gap-1">
          <Button size="sm" onClick={() => handleOpenDoctorReview(row.original)}>
            <ClipboardCheck className="h-4 w-4" />
            Review
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDialogState({ patient: row.original, intent: "escalate" })} disabled={row.original.responseLevel === "Routine" && readOnly}>
            <Zap className="h-4 w-4" />
            Escalate
          </Button>
        </div>
      ),
    },
  ], [handleOpenDoctorReview, readOnly, updates]);

  if (!allowed || !roleProfile) {
    return (
      <div className="py-6">
        <EmptyState
          icon={LockKeyhole}
          title="Rapid Review access required"
          description="This doctor quick review module is available for clinical and management roles only."
        />
      </div>
    );
  }

  return (
    <>
      <RapidReviewControlToggle label="Review queue controls">
          <div className="space-y-3">
            <SummaryGrid>
              <StatCard label="MER calls" value={merCount} change="Immediate" context="Purple zone" tone="critical" icon={ShieldAlert} />
              <StatCard label="MDT review" value={mdtCount} change="30 min" context="Red zone or urine risk" tone="danger" icon={HeartPulse} />
              <StatCard label="RN review" value={rnCount} change="Prompt" context="Yellow zone" tone="warning" icon={BellRing} />
              <StatCard label="Doctor pending" value={pendingObservationCount} change="Review" context={`${openCount} active queue`} tone="info" icon={Eye} />
            </SummaryGrid>

            <div className="flex flex-col gap-3 border-t border-border pt-3 lg:flex-row lg:items-center">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search review queue</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-label="Search patient, UHID, ward, bed, trigger, consultant"
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search patient, UHID, ward, bed, trigger, consultant..."
                  value={search}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <NativeSelect label="Response level" value={response} onChange={setResponse} options={["All response", "MER Call", "MDT Review", "RN Review", "Routine"]} />
                <NativeSelect label="Ward" value={ward} onChange={setWard} options={wards} />
                <NativeSelect label="Sort" value={sortBy} onChange={setSortBy} options={["Clinical priority", "Oldest wait", "Newest wait", "Patient name", "Ward"]} />
              </div>
            </div>
          </div>
      </RapidReviewControlToggle>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="entry">Nurse Entry</TabsTrigger>
          <TabsTrigger value="nurse-review">Nurse Review</TabsTrigger>
          <TabsTrigger value="doctor">Doctor Review</TabsTrigger>
          <TabsTrigger value="consults">Consult Queue</TabsTrigger>
          <TabsTrigger value="log">Date Wise Log</TabsTrigger>
          <TabsTrigger value="chart">Patient Timeline</TabsTrigger>
          <TabsTrigger value="rules">Response Rules</TabsTrigger>
          <TabsTrigger value="review-graph">Review Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <DataTable data={rows} columns={columns} />
            <QueueCommandPanel
              rows={rows}
              updates={updates}
              readOnly={readOnly}
              onReview={(patient, intent) => {
                if (intent === "review") {
                  handleOpenDoctorReview(patient);
                  return;
                }
                setDialogState({ patient, intent });
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="entry" className="space-y-4">
          <NurseObservationEntryTab
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectedPatient={setSelectedPatientId}
            readOnly={readOnly}
            onAddObservation={handleAddObservation}
          />
        </TabsContent>

        <TabsContent value="nurse-review" className="space-y-4">
          <NurseReviewTab
            auditTrail={nurseAuditTrail}
            patients={nurseReviewPatients}
            readOnly={readOnly}
            reviews={observationReviews}
            role={role}
            voidedObservations={voidedObservations}
            onEditObservation={handleUpdateNurseObservation}
            onVoidObservation={handleVoidNurseObservation}
          />
        </TabsContent>

        <TabsContent value="doctor" className="space-y-4">
          <DoctorReviewTab
            clinicalConsults={clinicalConsults}
            patients={patients}
            reviews={observationReviews}
            role={role}
            readOnly={readOnly}
            selectedPatientId={selectedPatientId}
            onCreateConsult={handleCreateClinicalConsult}
            onSelectedPatient={setSelectedPatientId}
            onUpdateConsultStatus={handleUpdateClinicalConsultStatus}
            onReview={(patient, observation) => setObservationReviewDialog({ patient, observation })}
          />
        </TabsContent>

        <TabsContent value="consults" className="space-y-4">
          <ClinicalConsultQueueTab
            patients={patients}
            readOnly={readOnly}
            requests={clinicalConsults}
            onOpenPatient={handleOpenDoctorReview}
            onReminder={handleSendClinicalConsultReminder}
            onStatusChange={handleUpdateClinicalConsultStatus}
          />
        </TabsContent>

        <TabsContent value="log" className="space-y-4">
          <DateWiseLogTab
            patients={patients}
            reviews={observationReviews}
            onReview={(patient, observation) => setObservationReviewDialog({ patient, observation })}
          />
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <ObservationChartTab
            selectedPatient={selectedPatient}
            selectedPatientId={selectedPatientId}
            onSelectedPatient={setSelectedPatientId}
            reviews={observationReviews}
            onReview={(patient) => setDialogState({ patient, intent: "observe" })}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <ResponseRulesTab role={role} />
        </TabsContent>

        <TabsContent value="review-graph" className="space-y-4">
          <RapidReviewGraphTab patients={patients} />
        </TabsContent>
      </Tabs>

      <ReviewActionDialog
        key={dialogState ? `${dialogState.patient.id}-${dialogState.intent}` : "closed"}
        state={dialogState}
        readOnly={readOnly}
        role={role}
        onOpenChange={(open) => !open && setDialogState(null)}
        onConfirm={handleSaveReview}
      />
      <ObservationReviewDialog
        key={observationReviewDialog ? observationReviewDialog.observation.id : "observation-review-closed"}
        state={observationReviewDialog}
        role={role}
        readOnly={readOnly}
        onOpenChange={(open) => !open && setObservationReviewDialog(null)}
        onConfirm={handleSaveObservationReview}
      />
    </>
  );
}

function NurseObservationEntryTab({
  patients,
  selectedPatientId,
  onSelectedPatient,
  readOnly,
  onAddObservation,
}: {
  patients: RapidReviewPatient[];
  selectedPatientId: string;
  onSelectedPatient: (value: string) => void;
  readOnly: boolean;
  onAddObservation: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  const [draft, setDraft] = React.useState<ObservationDraft>(() => createObservationDraft(selectedPatientId));
  const selectedPatient = patients.find((patient) => patient.id === draft.patientId) ?? patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const preview = buildObservationPreview(draft);
  const pulseDeficit = pulseDeficitValue(draft.monitorHeartRate, draft.pulse);
  const pulseDeficitRisk = pulseDeficitRiskLevel(draft.monitorHeartRate, draft.pulse);

  function updateDraft<Key extends keyof ObservationDraft>(key: Key, value: ObservationDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handlePatientChange(patientId: string) {
    updateDraft("patientId", patientId);
    onSelectedPatient(patientId);
  }

  function togglePulseSymptom(symptom: RapidPulseSymptom) {
    updateDraft(
      "pulseSymptoms",
      draft.pulseSymptoms.includes(symptom)
        ? draft.pulseSymptoms.filter((item) => item !== symptom)
        : [...draft.pulseSymptoms, symptom],
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nurse Observation Entry</CardTitle>
            <CardDescription>Respiratory rate, saturation, oxygen flow, blood pressure, pulse rhythm, temperature, GCS score, pain, and urine output are entered here.</CardDescription>
          </div>
          <StatusPill tone={rapidLevelTone(preview.responseLevel)}>{preview.responseLevel}</StatusPill>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Patient">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.patientId} onChange={(event) => handlePatientChange(event.target.value)} disabled={readOnly}>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientName} - {patient.uhid} - {patient.bed}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Date">
              <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" type="date" value={draft.observationDate} onChange={(event) => updateDraft("observationDate", event.target.value)} disabled={readOnly} />
            </FormField>
            <FormField label="Time">
              <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" type="time" value={draft.observationTime} onChange={(event) => updateDraft("observationTime", event.target.value)} disabled={readOnly} />
            </FormField>
            <FormField label="Shift">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.shift} onChange={(event) => updateDraft("shift", event.target.value as ObservationDraft["shift"])} disabled={readOnly}>
                {["Morning", "Evening", "Night", "Emergency"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Recorded by">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.recordedBy} onChange={(event) => updateDraft("recordedBy", event.target.value)} disabled={readOnly}>
                {["Ward Nurse", "Shift Coordinator", "ER Nurse", "Renal Nurse", "Pediatric Nurse"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Respiratory rate">
              <VitalInput value={draft.respiratoryRate} onChange={(value) => updateDraft("respiratoryRate", value)} disabled={readOnly} suffix="/min" />
            </FormField>
            <FormField label="O2 saturation">
              <VitalInput value={draft.spo2} onChange={(value) => updateDraft("spo2", value)} disabled={readOnly} suffix="%" />
            </FormField>
            <FormField label="O2 flow rate">
              <VitalInput value={draft.oxygenFlow} onChange={(value) => updateDraft("oxygenFlow", value)} disabled={readOnly} suffix="L/min" />
            </FormField>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            <FormField label="FiO2">
              <VitalInput value={draft.fio2} onChange={(value) => updateDraft("fio2", value)} disabled={readOnly} suffix="%" />
            </FormField>
            <FormField label="Blood pressure">
              <BloodPressureInput
                disabled={readOnly}
                diastolic={draft.diastolic}
                onDiastolicChange={(value) => updateDraft("diastolic", value)}
                onSystolicChange={(value) => updateDraft("systolic", value)}
                systolic={draft.systolic}
              />
            </FormField>
            <FormField label="Delivery method">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.deliveryMethod} onChange={(event) => updateDraft("deliveryMethod", event.target.value as ObservationDraft["deliveryMethod"])} disabled={readOnly}>
                {["Room air", "Nasal cannula", "Simple mask", "Venturi mask", "NRBM", "CPAP", "Ventilator"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Pulse rhythm">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseRhythm} onChange={(event) => updateDraft("pulseRhythm", event.target.value as RapidPulseRhythm)} disabled={readOnly}>
                {rapidPulseRhythmOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Pulse rate">
              <VitalInput value={draft.pulse} onChange={(value) => updateDraft("pulse", value)} disabled={readOnly} suffix="/min" />
            </FormField>
            <FormField label="Monitor heart rate">
              <VitalInput value={draft.monitorHeartRate} onChange={(value) => updateDraft("monitorHeartRate", value)} disabled={readOnly} suffix="bpm" />
            </FormField>
            <FormField label="Pulse source">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseSource} onChange={(event) => updateDraft("pulseSource", event.target.value as RapidPulseSource)} disabled={readOnly}>
                {rapidPulseSourceOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Pulse site">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseSite} onChange={(event) => updateDraft("pulseSite", event.target.value as RapidPulseSite)} disabled={readOnly}>
                {rapidPulseSiteOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Pulse quality">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseQuality} onChange={(event) => updateDraft("pulseQuality", event.target.value as RapidPulseQuality)} disabled={readOnly}>
                {rapidPulseQualityOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Pulse action taken">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseActionTaken} onChange={(event) => updateDraft("pulseActionTaken", event.target.value as RapidPulseAction)} disabled={readOnly}>
                {rapidPulseActionOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Temperature">
              <VitalInput value={draft.temperature} onChange={(value) => updateDraft("temperature", value)} disabled={readOnly} suffix="deg C" step="0.1" />
            </FormField>
            <FormField label="GCS score">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.consciousness} onChange={(event) => updateDraft("consciousness", event.target.value)} disabled={readOnly}>
                {consciousnessScores.map((item) => (
                  <option key={item.score} value={item.score}>
                    {item.score}/{item.meaning}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Pain score">
              <VitalInput value={draft.painScore} onChange={(value) => updateDraft("painScore", value)} disabled={readOnly} suffix="/10" />
            </FormField>
            <FormField label="Urine output">
              <VitalInput value={draft.urineOutput} onChange={(value) => updateDraft("urineOutput", value)} disabled={readOnly} suffix="ml/hr" />
            </FormField>
            <FormField label="Pulse deficit">
              <div className="flex h-9 items-center justify-between gap-2 rounded-md border border-border bg-surface-muted px-3">
                <span className="text-sm font-semibold text-foreground">{pulseDeficit === null ? "--" : `${pulseDeficit} bpm`}</span>
                <Badge tone={adultRiskTone(pulseDeficitRisk)}>
                  {pulseDeficitRisk === "empty" ? "Not checked" : (pulseDeficit ?? 0) > 10 ? "Suspected" : "Normal"}
                </Badge>
              </div>
            </FormField>
            <FormField label="System preview">
              <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-muted px-3">
                <Badge tone={rapidZoneTone(preview.dominantZone)}>{preview.dominantZone}</Badge>
                <StatusPill tone={rapidLevelTone(preview.responseLevel)}>{preview.responseLevel}</StatusPill>
              </div>
            </FormField>
          </div>

          <div className="rounded-md border border-border bg-surface-muted p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Pulse rhythm symptoms</div>
                <div className="mt-1 text-xs text-muted-foreground">Select only symptoms present during the pulse rhythm assessment.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={adultRiskTone(pulseRhythmRiskLevel(draft.pulseRhythm))}>
                  Rhythm {adultObservationRiskPalette[pulseRhythmRiskLevel(draft.pulseRhythm)].label}
                </Badge>
                <Badge tone={adultRiskTone(pulseQualityRiskLevel(draft.pulseQuality))}>
                  Quality {adultObservationRiskPalette[pulseQualityRiskLevel(draft.pulseQuality)].label}
                </Badge>
                {pulseDeficitRisk !== "normal" && pulseDeficitRisk !== "empty" ? (
                  <Badge tone={adultRiskTone(pulseDeficitRisk)}>Pulse deficit</Badge>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {rapidPulseSymptomOptions.map((symptom) => (
                <Button
                  key={symptom}
                  size="sm"
                  type="button"
                  variant={draft.pulseSymptoms.includes(symptom) ? "default" : "outline"}
                  onClick={() => togglePulseSymptom(symptom)}
                  disabled={readOnly}
                >
                  {symptom}
                </Button>
              ))}
            </div>
          </div>

          <FormField label="Bedside note">
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={draft.note}
              onChange={(event) => updateDraft("note", event.target.value)}
              disabled={readOnly}
            />
          </FormField>

          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-muted p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={rapidZoneTone(preview.dominantZone)}>{preview.dominantZone} zone</Badge>
                <StatusPill tone={rapidLevelTone(preview.responseLevel)}>{preview.responseLevel}</StatusPill>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">System preview updates from the vitals before save. Doctor can review it from Doctor Review or Date Wise Log.</div>
            </div>
            <Button
              disabled={readOnly || !selectedPatient}
              onClick={() => {
                if (!selectedPatient) return;
                const observation = buildObservationFromDraft(draft);
                onAddObservation(selectedPatient, observation);
                setDraft(createObservationDraft(selectedPatient.id));
              }}
            >
              <Save className="h-4 w-4" />
              Save observation
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Selected Patient</CardTitle>
              <CardDescription>Add entry goes into the selected patient date-wise observation log.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <DetailRow label="Patient" value={selectedPatient?.patientName ?? "Not selected"} />
            <DetailRow label="UHID" value={selectedPatient?.uhid ?? "-"} />
            <DetailRow label="Location" value={selectedPatient ? `${selectedPatient.bed}, ${selectedPatient.ward}` : "-"} />
            <DetailRow label="Consultant" value={selectedPatient?.consultant ?? "-"} />
          </CardContent>
        </Card>
        {selectedPatient ? (
          <MultiObservationTable
            patient={selectedPatient}
            title="Latest Patient Entries"
            description="Saved readings for this patient."
            compact
          />
        ) : null}
      </div>
    </div>
  );
}

function NurseReviewTab({
  auditTrail,
  patients,
  readOnly,
  reviews,
  role,
  voidedObservations,
  onEditObservation,
  onVoidObservation,
}: {
  auditTrail: NurseObservationAuditItem[];
  patients: RapidReviewPatient[];
  readOnly: boolean;
  reviews: Record<string, ObservationReviewUpdate>;
  role: Role;
  voidedObservations: Record<string, NurseObservationVoid>;
  onEditObservation: (patient: RapidReviewPatient, original: RapidObservationSet, updated: RapidObservationSet, reason: string, performedBy: string) => void;
  onVoidObservation: (patient: RapidReviewPatient, observation: RapidObservationSet, voidEntry: NurseObservationVoid) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const [shiftFilter, setShiftFilter] = React.useState("All shifts");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [riskFilter, setRiskFilter] = React.useState("All response");
  const [dateMode, setDateMode] = React.useState("Latest record date");
  const [selectedDates] = React.useState<string[]>([]);
  const [singleDate, setSingleDate] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [timeMode, setTimeMode] = React.useState("All times");
  const [timeFrom, setTimeFrom] = React.useState("");
  const [timeTo, setTimeTo] = React.useState("");
  const [editDialog, setEditDialog] = React.useState<NurseObservationEditDialogState>(null);
  const [voidDialog, setVoidDialog] = React.useState<NurseObservationVoidDialogState>(null);

  const allRows = flattenObservationRows(patients);
  const dateOptions = uniqueObservationDates(patients);
  const latestDataDate = latestAvailableDate(dateOptions);
  const editedObservationIds = new Set(auditTrail.filter((item) => item.action === "Edited").map((item) => item.observationId));
  const patientOptions = ["All patients", ...patients.map((patient) => `${patient.patientName} - ${patient.uhid}`)];
  const shiftOptions = ["All shifts", ...uniqueValues(allRows.map((row) => row.observation.shift ?? "Shift not set"))];
  const rows = allRows
    .map((row) => ({
      ...row,
      nurseStatus: nurseObservationStatus(row.observation, reviews, voidedObservations, editedObservationIds),
    }))
    .filter((row) => patientFilter === "All patients" || `${row.patient.patientName} - ${row.patient.uhid}` === patientFilter)
    .filter((row) => shiftFilter === "All shifts" || (row.observation.shift ?? "Shift not set") === shiftFilter)
    .filter((row) => statusFilter === "All status" || row.nurseStatus === statusFilter)
    .filter((row) => riskFilter === "All response" || row.observation.responseLevel === riskFilter)
    .filter((row) => observationMatchesDateFilter(row.observation, dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate))
    .filter((row) => observationMatchesTimeFilter(row.observation, timeMode, timeFrom, timeTo))
    .filter((row) => {
      if (!search.trim()) return true;
      const review = observationReviewDetails(row.observation, reviews);
      const text = [
        row.patient.patientName,
        row.patient.uhid,
        row.patient.bed,
        row.patient.ward,
        row.observation.recordedBy,
        row.observation.shift ?? "",
        row.observation.responseLevel,
        row.observation.dominantZone,
        row.observation.note,
        row.nurseStatus,
        review.reviewStatus,
      ].join(" ");
      return includes(text, search);
    })
    .sort((a, b) => observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation)));

  const activeCount = rows.filter((row) => row.nurseStatus === "Active").length;
  const editedCount = rows.filter((row) => row.nurseStatus === "Edited").length;
  const voidedCount = rows.filter((row) => row.nurseStatus === "Voided").length;
  const reviewedCount = rows.filter((row) => row.nurseStatus === "Doctor reviewed").length;

  function updateDateMode(value: string) {
    setDateMode(value);
    if (value === "Single date" && !singleDate) setSingleDate(latestDataDate || todayDateValue());
    if (value === "Custom range" && !dateFrom && !dateTo) {
      const defaultDate = latestDataDate || todayDateValue();
      setDateFrom(defaultDate);
      setDateTo(defaultDate);
    }
  }

  return (
    <div className="space-y-4">
      <RapidReviewControlToggle label="Nurse review controls">
        <Card>
        <CardHeader>
          <div>
            <CardTitle>Nurse Review</CardTitle>
            <CardDescription>Edit nurse-entered observations, void incorrect entries, and keep an audit trail.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{rows.length} records</Badge>
            <Badge tone="success">{activeCount} active</Badge>
            <Badge tone="warning">{editedCount} edited</Badge>
            <Badge tone="danger">{voidedCount} voided</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, bed, nurse, note, status...">
            <NativeSelect label="Patient" value={patientFilter} onChange={setPatientFilter} options={patientOptions} />
            <NativeSelect label="Shift" value={shiftFilter} onChange={setShiftFilter} options={shiftOptions} />
            <NativeSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Active", "Edited", "Doctor reviewed", "Voided"]} />
            <NativeSelect label="Risk" value={riskFilter} onChange={setRiskFilter} options={["All response", "MER Call", "MDT Review", "RN Review", "Routine"]} />
          </FilterBar>

          <DoctorReviewDateTimeFilter
            dateFrom={dateFrom}
            dateMode={dateMode}
            dateTo={dateTo}
            hasDates={dateOptions.length > 0}
            latestDataDate={latestDataDate}
            onDateFrom={setDateFrom}
            onDateMode={updateDateMode}
            onDateTo={setDateTo}
            onSingleDate={setSingleDate}
            onTimeFrom={setTimeFrom}
            onTimeMode={setTimeMode}
            onTimeTo={setTimeTo}
            selectedDates={selectedDates}
            singleDate={singleDate}
            timeFrom={timeFrom}
            timeMode={timeMode}
            timeTo={timeTo}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <NurseReviewStat label="Active" value={activeCount} tone="success" />
            <NurseReviewStat label="Edited" value={editedCount} tone="warning" />
            <NurseReviewStat label="Doctor reviewed" value={reviewedCount} tone="info" />
            <NurseReviewStat label="Voided" value={voidedCount} tone="danger" />
          </div>
        </CardContent>
        </Card>
      </RapidReviewControlToggle>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Observation Correction Worklist</CardTitle>
            <CardDescription>Use edit for clinical corrections. Use void when an entry should be removed from active charts.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[1420px] border-collapse text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="sticky left-0 z-10 border-b border-r border-border bg-surface-muted px-3 py-2 text-left">Patient</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Date</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Time</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">By / Shift</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Vitals</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Pulse</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Neuro / Pain</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Risk</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Status</th>
                  <th className="border-b border-border px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isVoided = row.nurseStatus === "Voided";
                  const voidInfo = voidedObservations[row.observation.id];
                  return (
                    <tr className={cn("border-b border-border last:border-0", isVoided && "bg-surface-muted/70 text-muted-foreground")} key={row.observation.id}>
                      <td className="sticky left-0 z-10 border-r border-border bg-background px-3 py-2">
                        <div className="font-semibold text-foreground">{row.patient.patientName}</div>
                        <div className="text-xs text-muted-foreground">{row.patient.uhid} - {row.patient.bed}, {row.patient.ward}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">{formatDateLabel(observationDateValue(row.observation))}</td>
                      <td className="border-r border-border px-3 py-2">{observationTimeLabel(row.observation)}</td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="font-medium text-foreground">{row.observation.recordedBy}</div>
                        <div className="text-xs text-muted-foreground">{row.observation.shift ?? "Shift not set"}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="text-xs">RR {row.observation.respiratoryRate} / SpO2 {row.observation.spo2} / O2 {row.observation.oxygenFlow}</div>
                        <div className="text-xs text-muted-foreground">BP {row.observation.bloodPressure}, Temp {row.observation.temperature}, Urine {row.observation.urineOutput}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="text-xs">Pulse {row.observation.pulse}, HR {monitorHeartRateValue(row.observation)}</div>
                        <div className="text-xs text-muted-foreground">{pulseRhythmLabel(row.observation)} - {pulseQualityLabel(row.observation)}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="text-xs">{gcsScoreLabel(row.observation.consciousness)}</div>
                        <div className="text-xs text-muted-foreground">Pain {row.observation.painScore}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <Badge tone={rapidZoneTone(row.observation.dominantZone)}>{row.observation.dominantZone}</Badge>
                        <div className="mt-1"><StatusPill tone={rapidLevelTone(row.observation.responseLevel)}>{row.observation.responseLevel}</StatusPill></div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <StatusPill tone={nurseObservationStatusTone(row.nurseStatus)}>{row.nurseStatus}</StatusPill>
                        {voidInfo ? <div className="mt-1 text-xs text-muted-foreground">{voidInfo.reason}</div> : null}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <Button disabled={readOnly || isVoided} size="sm" variant="outline" onClick={() => setEditDialog({ patient: row.patient, observation: row.observation })}>
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button disabled={readOnly || isVoided} size="sm" variant="danger" onClick={() => setVoidDialog({ patient: row.patient, observation: row.observation })}>
                            <Trash2 className="h-4 w-4" />
                            Void
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!rows.length ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={10}>No nurse observations match the selected filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <NurseAuditTrailCard auditTrail={auditTrail} />

      <NurseObservationEditDialog
        key={editDialog ? editDialog.observation.id : "nurse-edit-closed"}
        state={editDialog}
        readOnly={readOnly}
        reviews={reviews}
        role={role}
        onOpenChange={(open) => !open && setEditDialog(null)}
        onConfirm={(patient, original, updated, reason, performedBy) => {
          onEditObservation(patient, original, updated, reason, performedBy);
          setEditDialog(null);
        }}
      />

      <NurseObservationVoidDialog
        key={voidDialog ? voidDialog.observation.id : "nurse-void-closed"}
        state={voidDialog}
        readOnly={readOnly}
        role={role}
        reviews={reviews}
        onOpenChange={(open) => !open && setVoidDialog(null)}
        onConfirm={(patient, observation, voidEntry) => {
          onVoidObservation(patient, observation, voidEntry);
          setVoidDialog(null);
        }}
      />
    </div>
  );
}

function NurseReviewStat({ label, value, tone }: { label: string; value: number; tone: StatusTone }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <StatusPill tone={tone}>{label}</StatusPill>
      </div>
    </div>
  );
}

function NurseAuditTrailCard({ auditTrail }: { auditTrail: NurseObservationAuditItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Nurse Observation Audit Trail</CardTitle>
          <CardDescription>Every edit and void action is kept here for clinical accountability.</CardDescription>
        </div>
        <Badge tone="muted">{auditTrail.length} audit events</Badge>
      </CardHeader>
      <CardContent>
        {auditTrail.length ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Date</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Time</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Patient</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Action</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">By</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Reason</th>
                  <th className="border-b border-border px-3 py-2 text-left">Summary</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.slice(0, 12).map((item) => (
                  <tr className="border-b border-border last:border-0" key={item.id}>
                    <td className="border-r border-border px-3 py-2">{formatDateLabel(item.date)}</td>
                    <td className="border-r border-border px-3 py-2">{item.time}</td>
                    <td className="border-r border-border px-3 py-2">
                      <div className="font-medium text-foreground">{item.patientName}</div>
                      <div className="text-xs text-muted-foreground">{item.observationId}</div>
                    </td>
                    <td className="border-r border-border px-3 py-2"><Badge tone={nurseAuditActionTone(item.action)}>{item.action}</Badge></td>
                    <td className="border-r border-border px-3 py-2">{item.performedBy}</td>
                    <td className="border-r border-border px-3 py-2">{item.reason}</td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-foreground">{item.summary}</div>
                      {item.previousSummary || item.newSummary ? (
                        <div className="mt-1 text-xs text-muted-foreground">{item.previousSummary ? `Before: ${item.previousSummary}` : ""} {item.newSummary ? `After: ${item.newSummary}` : ""}</div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-surface-muted p-4 text-sm text-muted-foreground">
            No nurse correction audit yet. Edits and void actions will appear here.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NurseObservationEditDialog({
  state,
  readOnly,
  reviews,
  role,
  onOpenChange,
  onConfirm,
}: {
  state: NurseObservationEditDialogState;
  readOnly: boolean;
  reviews: Record<string, ObservationReviewUpdate>;
  role: Role;
  onOpenChange: (open: boolean) => void;
  onConfirm: (patient: RapidReviewPatient, original: RapidObservationSet, updated: RapidObservationSet, reason: string, performedBy: string) => void;
}) {
  const patient = state?.patient ?? null;
  const observation = state?.observation ?? null;
  const [draft, setDraft] = React.useState<ObservationDraft>(() => observation && patient ? createObservationDraftFromObservation(patient.id, observation) : createObservationDraft(""));
  const [reason, setReason] = React.useState("Clinical correction after nurse verification");
  const [performedBy, setPerformedBy] = React.useState(role === "Nurse" ? "Current Nurse" : role);

  if (!patient || !observation) return null;

  const preview = buildObservationPreview(draft);
  const doctorReviewed = observationReviewStatus(observation, reviews) !== "Pending doctor review";
  const pulseDeficit = pulseDeficitValue(draft.monitorHeartRate, draft.pulse);

  function updateDraft<Key extends keyof ObservationDraft>(key: Key, value: ObservationDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <DialogPrimitive.Root open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Edit nurse observation</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {patient.patientName} - {patient.uhid} - {formatDateLabel(observationDateValue(observation))}, {observationTimeLabel(observation)}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close edit observation dialog">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {doctorReviewed ? (
                <AlertBanner icon={AlertTriangle} tone="warning" title="Doctor review already exists">
                  Editing this observation will mark the amended entry for doctor re-review in active charts.
                </AlertBanner>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Date">
                  <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" type="date" value={draft.observationDate} onChange={(event) => updateDraft("observationDate", event.target.value)} disabled={readOnly} />
                </FormField>
                <FormField label="Time">
                  <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" type="time" value={draft.observationTime} onChange={(event) => updateDraft("observationTime", event.target.value)} disabled={readOnly} />
                </FormField>
                <FormField label="Shift">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.shift} onChange={(event) => updateDraft("shift", event.target.value as ObservationDraft["shift"])} disabled={readOnly}>
                    {["Morning", "Evening", "Night", "Emergency"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Edited by">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={performedBy} onChange={(event) => setPerformedBy(event.target.value)} disabled={readOnly}>
                    {["Current Nurse", "Ward Nurse", "Shift Coordinator", "ER Nurse", "Renal Nurse", role].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Respiratory rate">
                  <VitalInput value={draft.respiratoryRate} onChange={(value) => updateDraft("respiratoryRate", value)} disabled={readOnly} suffix="/min" />
                </FormField>
                <FormField label="O2 saturation">
                  <VitalInput value={draft.spo2} onChange={(value) => updateDraft("spo2", value)} disabled={readOnly} suffix="%" />
                </FormField>
                <FormField label="O2 flow rate">
                  <VitalInput value={draft.oxygenFlow} onChange={(value) => updateDraft("oxygenFlow", value)} disabled={readOnly} suffix="L/min" />
                </FormField>
                <FormField label="FiO2">
                  <VitalInput value={draft.fio2} onChange={(value) => updateDraft("fio2", value)} disabled={readOnly} suffix="%" />
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Blood pressure">
                  <BloodPressureInput disabled={readOnly} diastolic={draft.diastolic} onDiastolicChange={(value) => updateDraft("diastolic", value)} onSystolicChange={(value) => updateDraft("systolic", value)} systolic={draft.systolic} />
                </FormField>
                <FormField label="Delivery method">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.deliveryMethod} onChange={(event) => updateDraft("deliveryMethod", event.target.value as ObservationDraft["deliveryMethod"])} disabled={readOnly}>
                    {["Room air", "Nasal cannula", "Simple mask", "Venturi mask", "NRBM", "CPAP", "Ventilator"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Pulse rhythm">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseRhythm} onChange={(event) => updateDraft("pulseRhythm", event.target.value as RapidPulseRhythm)} disabled={readOnly}>
                    {rapidPulseRhythmOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Pulse rate">
                  <VitalInput value={draft.pulse} onChange={(value) => updateDraft("pulse", value)} disabled={readOnly} suffix="/min" />
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Monitor heart rate">
                  <VitalInput value={draft.monitorHeartRate} onChange={(value) => updateDraft("monitorHeartRate", value)} disabled={readOnly} suffix="bpm" />
                </FormField>
                <FormField label="Pulse source">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseSource} onChange={(event) => updateDraft("pulseSource", event.target.value as RapidPulseSource)} disabled={readOnly}>
                    {rapidPulseSourceOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Pulse site">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseSite} onChange={(event) => updateDraft("pulseSite", event.target.value as RapidPulseSite)} disabled={readOnly}>
                    {rapidPulseSiteOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Pulse quality">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseQuality} onChange={(event) => updateDraft("pulseQuality", event.target.value as RapidPulseQuality)} disabled={readOnly}>
                    {rapidPulseQualityOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Pulse action taken">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.pulseActionTaken} onChange={(event) => updateDraft("pulseActionTaken", event.target.value as RapidPulseAction)} disabled={readOnly}>
                    {rapidPulseActionOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </FormField>
                <FormField label="Temperature">
                  <VitalInput value={draft.temperature} onChange={(value) => updateDraft("temperature", value)} disabled={readOnly} suffix="deg C" step="0.1" />
                </FormField>
                <FormField label="GCS score">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.consciousness} onChange={(event) => updateDraft("consciousness", event.target.value)} disabled={readOnly}>
                    {consciousnessScores.map((item) => <option key={item.score} value={item.score}>{item.score}/{item.meaning}</option>)}
                  </select>
                </FormField>
                <FormField label="Pain score">
                  <VitalInput value={draft.painScore} onChange={(value) => updateDraft("painScore", value)} disabled={readOnly} suffix="/10" />
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Urine output">
                  <VitalInput value={draft.urineOutput} onChange={(value) => updateDraft("urineOutput", value)} disabled={readOnly} suffix="ml/hr" />
                </FormField>
                <FormField label="Pulse deficit">
                  <div className="flex h-9 items-center rounded-md border border-border bg-surface-muted px-3 text-sm font-semibold text-foreground">{pulseDeficit === null ? "--" : `${pulseDeficit} bpm`}</div>
                </FormField>
                <FormField label="Risk preview">
                  <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface-muted px-3">
                    <Badge tone={rapidZoneTone(preview.dominantZone)}>{preview.dominantZone}</Badge>
                    <StatusPill tone={rapidLevelTone(preview.responseLevel)}>{preview.responseLevel}</StatusPill>
                  </div>
                </FormField>
                <FormField label="Correction reason">
                  <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Clinical correction" disabled={readOnly} />
                </FormField>
              </div>

              <FormField label="Bedside note">
                <textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.note} onChange={(event) => updateDraft("note", event.target.value)} disabled={readOnly} />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">{readOnly ? "Read-only role cannot edit nurse observations." : "Save correction is active. Reason is stored in audit trail."}</div>
            <div className="flex justify-end gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button
                disabled={readOnly}
                onClick={() => onConfirm(patient, observation, buildNurseUpdatedObservationFromDraft(draft, observation, doctorReviewed), reason.trim() || "Clinical correction after nurse verification", performedBy)}
              >
                <Save className="h-4 w-4" />
                Save correction
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function NurseObservationVoidDialog({
  state,
  readOnly,
  role,
  reviews,
  onOpenChange,
  onConfirm,
}: {
  state: NurseObservationVoidDialogState;
  readOnly: boolean;
  role: Role;
  reviews: Record<string, ObservationReviewUpdate>;
  onOpenChange: (open: boolean) => void;
  onConfirm: (patient: RapidReviewPatient, observation: RapidObservationSet, voidEntry: NurseObservationVoid) => void;
}) {
  const patient = state?.patient ?? null;
  const observation = state?.observation ?? null;
  const [voidedBy, setVoidedBy] = React.useState(role === "Nurse" ? "Current Nurse" : role);
  const [reason, setReason] = React.useState("Wrong value entered");
  const [note, setNote] = React.useState("");

  if (!patient || !observation) return null;

  const doctorReviewed = observationReviewStatus(observation, reviews) !== "Pending doctor review";
  const reasonOptions = ["Wrong value entered", "Duplicate entry", "Wrong patient selected", "Wrong date/time", "Device artifact", "Entered in wrong chart", "Cancelled by nurse after verification", "Other"];

  return (
    <DialogPrimitive.Root open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Void nurse observation</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {patient.patientName} - {formatDateLabel(observationDateValue(observation))}, {observationTimeLabel(observation)}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close void observation dialog">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="space-y-4 overflow-y-auto p-4">
            <AlertBanner icon={AlertTriangle} tone={doctorReviewed ? "danger" : "warning"} title={doctorReviewed ? "Reviewed entry will be voided" : "Void keeps audit trail"}>
              This removes the observation from active Doctor Review, Review Graph, and Timeline, but the audit record remains visible in Nurse Review.
            </AlertBanner>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Patient" value={`${patient.patientName} - ${patient.uhid}`} />
              <DetailRow label="Vitals" value={`RR ${observation.respiratoryRate}, SpO2 ${observation.spo2}, BP ${observation.bloodPressure}, Pulse ${observation.pulse}`} />
              <FormField label="Voided by">
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={voidedBy} onChange={(event) => setVoidedBy(event.target.value)} disabled={readOnly}>
                  {["Current Nurse", "Ward Nurse", "Shift Coordinator", "ER Nurse", "Renal Nurse", role].map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="Reason">
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reason} onChange={(event) => setReason(event.target.value)} disabled={readOnly}>
                  {reasonOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
            </div>

            <FormField label="Void note">
              <textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add details for audit..." disabled={readOnly} />
            </FormField>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">{readOnly ? "Read-only role cannot void observations." : "Void action requires a reason and stays in audit trail."}</div>
            <div className="flex justify-end gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button
                disabled={readOnly || !reason.trim()}
                variant="danger"
                onClick={() => onConfirm(patient, observation, {
                  observationId: observation.id,
                  voidedBy,
                  voidedAt: `${formatDateLabel(todayDateValue())}, ${currentTimeValue()}`,
                  reason,
                  note: note.trim(),
                })}
              >
                <Trash2 className="h-4 w-4" />
                Void entry
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ClinicalConsultQueueTab({
  patients,
  requests,
  readOnly,
  onOpenPatient,
  onReminder,
  onStatusChange,
}: {
  patients: RapidReviewPatient[];
  requests: ClinicalConsultRequest[];
  readOnly: boolean;
  onOpenPatient: (patient: RapidReviewPatient) => void;
  onReminder: (requestId: string) => void;
  onStatusChange: (requestId: string, status: ClinicalConsultStatus) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Open consults");
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const [departmentFilter, setDepartmentFilter] = React.useState("All departments");
  const [priorityFilter, setPriorityFilter] = React.useState("All priority");
  const [doctorFilter, setDoctorFilter] = React.useState("All doctors");
  const [sortBy, setSortBy] = React.useState("Clinical priority");

  const patientOptions = ["All patients", ...uniqueValues(requests.map((request) => `${request.patientName} - ${request.uhid}`))];
  const departmentOptions = ["All departments", ...uniqueValues(requests.map((request) => request.department))];
  const doctorOptions = ["All doctors", ...uniqueValues(requests.map((request) => request.requestedTo))];
  const rows = requests
    .filter((request) => patientFilter === "All patients" || `${request.patientName} - ${request.uhid}` === patientFilter)
    .filter((request) => departmentFilter === "All departments" || request.department === departmentFilter)
    .filter((request) => priorityFilter === "All priority" || request.priority === priorityFilter)
    .filter((request) => doctorFilter === "All doctors" || request.requestedTo === doctorFilter)
    .filter((request) => clinicalConsultStatusMatches(request, statusFilter))
    .filter((request) => {
      if (!search.trim()) return true;
      return includes([
        request.patientName,
        request.uhid,
        request.location,
        request.department,
        request.requestedTo,
        request.priority,
        request.status,
        request.requestType,
        request.investigation,
        request.clinicalQuestion,
        request.handoffSummary,
        request.advice ?? "",
      ].join(" "), search);
    })
    .sort((a, b) => sortClinicalConsults(a, b, sortBy));

  const openCount = requests.filter((request) => request.status !== "Completed").length;
  const delayedCount = requests.filter(clinicalConsultIsDelayed).length;
  const awaitingAdviceCount = requests.filter((request) => request.status !== "Completed" && request.status !== "Advice given").length;
  const completedCount = requests.filter((request) => request.status === "Completed").length;
  const statusColumns = clinicalConsultStatusWorkflow.map((status) => ({
    status,
    requests: rows.filter((request) => request.status === status),
  }));

  return (
    <div className="space-y-4">
      <RapidReviewControlToggle label="Consult queue controls">
        <Card>
        <CardHeader>
          <div>
            <CardTitle>Consult Queue</CardTitle>
            <CardDescription>Global closed-loop view for specialty, on-call, investigation, and escalation requests.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={openCount ? "warning" : "success"}>{openCount} open</Badge>
            <Badge tone={delayedCount ? "critical" : "muted"}>{delayedCount} delayed</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, department, doctor, investigation, advice...">
            <NativeSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Open consults", "Delayed", "Requested", "Acknowledged", "Assigned", "In progress", "Advice given", "Completed", "Escalated"]} />
            <NativeSelect label="Patient" value={patientFilter} onChange={setPatientFilter} options={patientOptions} />
            <NativeSelect label="Department" value={departmentFilter} onChange={setDepartmentFilter} options={departmentOptions} />
            <NativeSelect label="Priority" value={priorityFilter} onChange={setPriorityFilter} options={["All priority", "Emergency", "Urgent", "Routine"]} />
            <NativeSelect label="Doctor" value={doctorFilter} onChange={setDoctorFilter} options={doctorOptions} />
            <NativeSelect label="Sort" value={sortBy} onChange={setSortBy} options={["Clinical priority", "Oldest request", "Newest request", "Department", "Status"]} />
          </FilterBar>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ClinicalConsultQueueStat label="Open" value={openCount} tone={openCount ? "warning" : "success"} />
            <ClinicalConsultQueueStat label="Delayed" value={delayedCount} tone={delayedCount ? "critical" : "success"} />
            <ClinicalConsultQueueStat label="Awaiting advice" value={awaitingAdviceCount} tone={awaitingAdviceCount ? "danger" : "success"} />
            <ClinicalConsultQueueStat label="Completed" value={completedCount} tone="muted" />
          </div>
        </CardContent>
        </Card>
      </RapidReviewControlToggle>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Consult Request Tracking Board</CardTitle>
            <CardDescription>Status-wise containers show exactly where each doctor consult request is stuck or completed.</CardDescription>
          </div>
          <Badge tone="info">{rows.length} shown</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[1960px] grid-cols-7 gap-3">
              {statusColumns.map((column) => (
                <ClinicalConsultStatusColumn
                  key={column.status}
                  onOpenPatient={onOpenPatient}
                  onReminder={onReminder}
                  onStatusChange={onStatusChange}
                  patients={patients}
                  readOnly={readOnly}
                  requests={column.requests}
                  status={column.status}
                />
              ))}
            </div>
          </div>

          {!rows.length ? (
            <div className="mt-3 rounded-lg border border-dashed border-border bg-surface-muted p-5 text-center text-sm text-muted-foreground">
              No consult requests match the selected filters.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ClinicalConsultAuditLog requests={requests} />
    </div>
  );
}

function ClinicalConsultStatusColumn({
  status,
  requests,
  patients,
  readOnly,
  onOpenPatient,
  onReminder,
  onStatusChange,
}: {
  status: ClinicalConsultStatus;
  requests: ClinicalConsultRequest[];
  patients: RapidReviewPatient[];
  readOnly: boolean;
  onOpenPatient: (patient: RapidReviewPatient) => void;
  onReminder: (requestId: string) => void;
  onStatusChange: (requestId: string, status: ClinicalConsultStatus) => void;
}) {
  return (
    <div className="flex min-h-[520px] flex-col rounded-md border border-border bg-surface-muted">
      <div className="border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <StatusPill tone={clinicalConsultStatusTone(status)}>{status}</StatusPill>
          <Badge tone="muted">{requests.length}</Badge>
        </div>
        <div className="mt-2 text-xs leading-5 text-muted-foreground">{clinicalConsultStatusMeaning(status)}</div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {requests.map((request) => {
          const patient = patients.find((item) => item.id === request.patientId);
          return (
            <ClinicalConsultBoardCard
              key={request.id}
              onOpenPatient={onOpenPatient}
              onReminder={onReminder}
              onStatusChange={onStatusChange}
              patient={patient}
              readOnly={readOnly}
              request={request}
            />
          );
        })}

        {!requests.length ? (
          <div className="rounded-md border border-dashed border-border bg-background p-3 text-center text-xs text-muted-foreground">
            No request in {status}.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ClinicalConsultBoardCard({
  request,
  patient,
  readOnly,
  onOpenPatient,
  onReminder,
  onStatusChange,
}: {
  request: ClinicalConsultRequest;
  patient?: RapidReviewPatient;
  readOnly: boolean;
  onOpenPatient: (patient: RapidReviewPatient) => void;
  onReminder: (requestId: string) => void;
  onStatusChange: (requestId: string, status: ClinicalConsultStatus) => void;
}) {
  const delayed = clinicalConsultIsDelayed(request);
  const action = clinicalConsultPrimaryAction(request);

  return (
    <div className={cn("rounded-md border border-border bg-background p-3 shadow-sm", delayed && "border-danger/40 bg-danger/5")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{request.patientName}</div>
          <div className="text-xs text-muted-foreground">{request.uhid} - {request.location}</div>
        </div>
        <Badge tone={clinicalConsultPriorityTone(request.priority)}>{request.priority}</Badge>
      </div>

      <div className="mt-3 grid gap-2 text-xs">
        <div className="flex items-start justify-between gap-2">
          <span className="text-muted-foreground">Department</span>
          <span className="text-right font-medium text-foreground">{request.department}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-muted-foreground">Doctor</span>
          <span className="text-right font-medium text-foreground">{request.requestedTo}</span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-muted-foreground">Target</span>
          <span className={cn("text-right font-medium", delayed ? "text-danger" : "text-foreground")}>
            {delayed ? "Delayed" : clinicalConsultDueLabel(request)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-muted-foreground">Requested</span>
          <span className="text-right font-medium text-foreground">{formatDateLabel(request.date)}, {request.time}</span>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-surface-muted p-2 text-xs leading-5 text-foreground">
        {request.advice || request.clinicalQuestion}
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <div className="text-xs font-medium text-foreground">{action.help}</div>
        <div className="mt-2 grid gap-2">
          <Button
            className="w-full"
            disabled={readOnly || !action.nextStatus}
            size="sm"
            variant={action.variant}
            onClick={() => action.nextStatus && onStatusChange(request.id, action.nextStatus)}
          >
            {action.label}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={!patient} size="sm" variant="outline" onClick={() => patient && onOpenPatient(patient)}>
              Patient
            </Button>
            {delayed && request.status !== "Completed" ? (
              <Button disabled={readOnly} size="sm" variant="outline" onClick={() => onReminder(request.id)}>
                Remind
              </Button>
            ) : (
              <Button disabled={readOnly || ["Completed", "Escalated"].includes(request.status) || request.priority === "Routine"} size="sm" variant="danger" onClick={() => onStatusChange(request.id, "Escalated")}>
                Escalate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClinicalConsultAuditLog({ requests }: { requests: ClinicalConsultRequest[] }) {
  const [filter, setFilter] = React.useState("All logs");
  const [search, setSearch] = React.useState("");
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const patientOptions = ["All patients", ...uniqueValues(requests.map((request) => `${request.patientName} - ${request.uhid}`))];
  const rows = requests
    .filter((request) => {
      if (filter === "All logs") return true;
      if (filter === "Completed") return request.status === "Completed";
      if (filter === "Active") return request.status !== "Completed";
      if (filter === "Escalated") return request.status === "Escalated";
      return request.priority === filter;
    })
    .filter((request) => patientFilter === "All patients" || `${request.patientName} - ${request.uhid}` === patientFilter)
    .filter((request) => {
      if (!search.trim()) return true;
      return includes([
        request.patientName,
        request.uhid,
        request.location,
        request.department,
        request.requestedTo,
        request.requestedBy,
        request.priority,
        request.status,
        request.requestType,
        request.investigation,
        request.responseTarget,
        request.clinicalQuestion,
        request.handoffSummary,
        request.advice ?? "",
        ...request.events.flatMap((event) => [event.action, event.actor, event.at, event.note, event.status]),
      ].join(" "), search);
    })
    .sort((a, b) => clinicalConsultSortValue(b).localeCompare(clinicalConsultSortValue(a)));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Consult Audit Log</CardTitle>
          <CardDescription>Completed consults and full request history stay here with clinical question, advice, handoff, and status timeline.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Completed", "Active", "Escalated", "Emergency", "Urgent", "Routine", "All logs"].map((item) => (
            <Button key={item} size="sm" variant={filter === item ? "default" : "outline"} onClick={() => setFilter(item)}>
              {item}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-border bg-surface-muted p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              aria-label="Search consult audit log"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Search audit by patient, UHID, doctor, department, advice, handoff, timeline event..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <NativeSelect label="Patient" value={patientFilter} onChange={setPatientFilter} options={patientOptions} />
            </div>
          </div>
        </div>

        {rows.map((request) => (
          <div className="overflow-hidden rounded-lg border border-border bg-background" key={request.id}>
            <div className="border-b border-border bg-surface-muted p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-foreground">{request.patientName}</div>
                    <Badge tone="muted">{request.uhid}</Badge>
                    <StatusPill tone={clinicalConsultStatusTone(request.status)}>{request.status}</StatusPill>
                    <Badge tone={clinicalConsultPriorityTone(request.priority)}>{request.priority}</Badge>
                    {clinicalConsultIsDelayed(request) ? <Badge tone="critical">Delayed</Badge> : null}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{request.location}</div>
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:min-w-[420px]">
                  <div className="rounded-md bg-background px-3 py-2">
                    <div className="font-semibold uppercase">Requested</div>
                    <div className="mt-1 text-foreground">{formatDateLabel(request.date)}, {request.time}</div>
                  </div>
                  <div className="rounded-md bg-background px-3 py-2">
                    <div className="font-semibold uppercase">Last update</div>
                    <div className="mt-1 text-foreground">{request.lastUpdated}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <ClinicalAuditMetaTile label="Requested by" value={request.requestedBy} />
                  <ClinicalAuditMetaTile label="Department" value={request.department} />
                  <ClinicalAuditMetaTile label="Requested to" value={request.requestedTo} />
                  <ClinicalAuditMetaTile label="Response target" value={request.responseTarget} />
                  <ClinicalAuditMetaTile label="Request type" value={request.requestType} />
                  <ClinicalAuditMetaTile label="Investigation" value={request.investigation} />
                  <ClinicalAuditMetaTile label="Current status" value={<StatusPill tone={clinicalConsultStatusTone(request.status)}>{request.status}</StatusPill>} />
                  <ClinicalAuditMetaTile label="Delay status" value={clinicalConsultIsDelayed(request) ? <Badge tone="critical">Delayed</Badge> : clinicalConsultDueLabel(request)} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <ClinicalAuditTextBlock title="Clinical question" text={request.clinicalQuestion} />
                  <ClinicalAuditTextBlock title="Final advice / current note" text={request.advice ?? "Advice not recorded yet."} />
                </div>

                <ClinicalAuditTextBlock title="Handoff summary" text={request.handoffSummary} />
              </div>

              <div className="rounded-md border border-border bg-surface-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Status timeline</div>
                  <Badge tone="muted">{request.events.length} events</Badge>
                </div>
                <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {request.events.map((event) => (
                    <div className="grid grid-cols-[12px_1fr] gap-3" key={event.id}>
                      <div className="relative flex justify-center">
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="absolute top-5 h-[calc(100%+12px)] w-px bg-border last:hidden" />
                      </div>
                      <div className="rounded-md border border-border bg-background p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">{event.action}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{event.actor}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{event.at}</div>
                          </div>
                          <StatusPill tone={clinicalConsultStatusTone(event.status)}>{event.status}</StatusPill>
                        </div>
                        <div className="mt-2 text-xs leading-5 text-muted-foreground">{event.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {!rows.length ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-muted p-5 text-center text-sm text-muted-foreground">
            No consult audit records for {filter}.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ClinicalAuditMetaTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-muted px-3 py-2">
      <div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 min-w-0 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function ClinicalAuditTextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{title}</div>
      <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{text}</div>
    </div>
  );
}

function ClinicalConsultQueueStat({ label, value, tone }: { label: string; value: number; tone: StatusTone }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <StatusPill tone={tone}>{label}</StatusPill>
      </div>
    </div>
  );
}

function DoctorReviewTab({
  clinicalConsults,
  patients,
  readOnly,
  reviews,
  role,
  selectedPatientId,
  onCreateConsult,
  onSelectedPatient,
  onUpdateConsultStatus,
  onReview,
}: {
  clinicalConsults: ClinicalConsultRequest[];
  patients: RapidReviewPatient[];
  readOnly: boolean;
  reviews: Record<string, ObservationReviewUpdate>;
  role: Role;
  selectedPatientId: string;
  onCreateConsult: (request: ClinicalConsultRequest) => void;
  onSelectedPatient: (patientId: string) => void;
  onUpdateConsultStatus: (requestId: string, status: ClinicalConsultStatus) => void;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const [statusFilter, setStatusFilter] = React.useState("Pending doctor review");
  const [dateMode, setDateMode] = React.useState("Latest record date");
  const [selectedDates] = React.useState<string[]>([]);
  const [singleDate, setSingleDate] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [timeMode, setTimeMode] = React.useState("All times");
  const [timeFrom, setTimeFrom] = React.useState("");
  const [timeTo, setTimeTo] = React.useState("");
  const [quickNote, setQuickNote] = React.useState("");
  const [consultDialog, setConsultDialog] = React.useState<ClinicalConsultDialogState>(null);

  function handleChartPatientChange(patientId: string) {
    onSelectedPatient(patientId);
  }

  const dateOptions = uniqueObservationDates(patients);
  const latestDataDate = latestAvailableDate(dateOptions);
  const rows = flattenObservationRows(patients)
    .filter((row) => patientFilter === "All patients" || row.patient.id === patientFilter)
    .filter((row) => statusFilter === "All status" || observationReviewStatus(row.observation, reviews) === statusFilter)
    .filter((row) => observationMatchesDateFilter(row.observation, dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate))
    .filter((row) => observationMatchesTimeFilter(row.observation, timeMode, timeFrom, timeTo))
    .sort((a, b) => observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation)));

  const pending = flattenObservationRows(patients).filter((row) => observationReviewStatus(row.observation, reviews) === "Pending doctor review").length;
  const chartPatient = patients.find((patient) => patient.id === selectedPatientId) ?? rows[0]?.patient ?? patients[0];
  const patientRows = chartPatient ? rows.filter((row) => row.patient.id === chartPatient.id) : rows;
  const chartObservations = chartPatient
    ? chartPatient.observationHistory
      .filter((observation) => observationMatchesDateFilter(observation, dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate))
      .filter((observation) => observationMatchesTimeFilter(observation, timeMode, timeFrom, timeTo))
      .sort((a, b) => observationDateTimeSortValue(a).localeCompare(observationDateTimeSortValue(b)))
    : [];
  const nextObservation = patientRows[0]?.observation ?? chartObservations.at(-1) ?? chartPatient?.observationHistory.at(-1);
  const chartEntryCount = chartObservations.length;
  const latestObservation = chartObservations.at(-1) ?? chartPatient?.observationHistory.at(-1);
  const openConsultCount = clinicalConsults.filter((request) => request.status !== "Completed").length;
  const urgentConsultCount = clinicalConsults.filter((request) => request.status !== "Completed" && request.priority !== "Routine").length;

  function updateDateMode(value: string) {
    setDateMode(value);
    if (value === "Single date" && !singleDate) setSingleDate(latestDataDate || todayDateValue());
    if (value === "Custom range" && !dateFrom && !dateTo) {
      const defaultDate = latestDataDate || todayDateValue();
      setDateFrom(defaultDate);
      setDateTo(defaultDate);
    }
  }

  return (
    <div className="space-y-4">
      <RapidReviewControlToggle label="Doctor review controls">
        <Card>
        <CardHeader>
          <div>
            <CardTitle>Doctor Review Command Center</CardTitle>
            <CardDescription>Select patient, review date/status, then use the full 24-hour chart for clinical review.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{rows.length} readings</Badge>
            <Badge tone="warning">{pending} pending</Badge>
            <Badge tone={urgentConsultCount ? "danger" : "info"}>{openConsultCount} consults</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.3fr)_minmax(210px,1fr)_190px_150px] lg:items-end">
            <label className="min-w-0 space-y-1 text-sm">
              <span className="font-medium text-foreground">Chart patient</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                value={chartPatient?.id ?? ""}
                onChange={(event) => handleChartPatientChange(event.target.value)}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.patientName} - {patient.uhid} - {patient.bed}</option>
                ))}
              </select>
            </label>
            <label className="min-w-0 space-y-1 text-sm">
              <span className="font-medium text-foreground">Worklist patient</span>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20" value={patientFilter} onChange={(event) => setPatientFilter(event.target.value)}>
                <option value="All patients">All patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.patientName} - {patient.uhid}</option>
                ))}
              </select>
            </label>
            <NativeSelect label="Review status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Pending doctor review", "Reviewed", "Escalated", "Closed"]} />
            <div className="flex min-w-0">
              <Button className="h-9 w-full whitespace-nowrap" disabled={!nextObservation} onClick={() => nextObservation && chartPatient && onReview(chartPatient, nextObservation)}>
                <ClipboardCheck className="h-4 w-4" />
                Review latest
              </Button>
            </div>
          </div>

          <DoctorReviewDateTimeFilter
            dateFrom={dateFrom}
            dateMode={dateMode}
            dateTo={dateTo}
            hasDates={dateOptions.length > 0}
            latestDataDate={latestDataDate}
            onDateFrom={setDateFrom}
            onDateMode={updateDateMode}
            onDateTo={setDateTo}
            onSingleDate={setSingleDate}
            onTimeFrom={setTimeFrom}
            onTimeMode={setTimeMode}
            onTimeTo={setTimeTo}
            selectedDates={selectedDates}
            singleDate={singleDate}
            timeFrom={timeFrom}
            timeMode={timeMode}
            timeTo={timeTo}
          />
        </CardContent>
        </Card>
      </RapidReviewControlToggle>

      <AdultObservationChartCard
        patient={chartPatient}
        observations={chartObservations}
        reviews={reviews}
        onCellClick={(row, hour, value, level) => {
          const observationAtHour = [...chartObservations].reverse().find((observation) => observationHourKey(observation) === hour);
          if (chartPatient && observationAtHour && value !== undefined) {
            onReview(chartPatient, observationAtHour);
            return;
          }
          toast.info(`${row.label} at ${hour}: ${value ?? "--"} (${adultObservationRiskPalette[level].label})`);
        }}
      />

      <ClinicalConsultPanel
        patient={chartPatient}
        observation={nextObservation ?? latestObservation}
        readOnly={readOnly}
        requests={clinicalConsults}
        onRequest={(patient, observation) => setConsultDialog({ patient, observation })}
        onStatusChange={onUpdateConsultStatus}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,440px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <WorkflowStep icon={Plus} title="Nurse enters" description="Hourly vitals and intervention." />
            <WorkflowStep icon={ListChecks} title="System triage" description="Risk zone is calculated." />
            <WorkflowStep icon={Eye} title="Doctor reviews" description={`${pending} pending readings.`} />
          </div>
        {chartPatient ? (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{chartPatient.patientName}</CardTitle>
                <CardDescription>{chartPatient.uhid} - {chartPatient.bed}, {chartPatient.ward}</CardDescription>
              </div>
              <StatusPill tone={rapidLevelTone(chartPatient.responseLevel)}>{chartPatient.responseLevel}</StatusPill>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <DetailRow label="Consultant" value={chartPatient.consultant} />
                <DetailRow label="Due" value={chartPatient.reviewDue} />
                <DetailRow label="Last obs" value={latestObservation ? observationTimeLabel(latestObservation) : chartPatient.lastObservationAt} />
                <DetailRow label="24 hr entries" value={`${chartEntryCount} records`} />
                <DetailRow label="Urine" value={chartPatient.urineOutput} />
                <DetailRow label="Owner" value={chartPatient.owner} />
              </div>
              <div className="rounded-md border border-border bg-surface-muted p-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Suggested review focus</div>
                <div className="mt-2 space-y-2">
                  {chartPatient.recommendedActions.slice(0, 4).map((action) => (
                    <div className="flex gap-2 text-sm text-foreground" key={action}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
              <FormField label="Quick doctor note">
                <textarea
                  className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  value={quickNote}
                  onChange={(event) => setQuickNote(event.target.value)}
                  placeholder="Add quick note before opening detailed review..."
                />
              </FormField>
              <div className="flex flex-wrap gap-2">
                <Button disabled={!nextObservation} onClick={() => nextObservation && onReview(chartPatient, nextObservation)}>
                  <ClipboardCheck className="h-4 w-4" />
                  Review selected
                </Button>
                <Button disabled={readOnly || !chartPatient} variant="outline" onClick={() => setConsultDialog({ patient: chartPatient, observation: nextObservation ?? latestObservation })}>
                  <UserPlus className="h-4 w-4" />
                  Request consult
                </Button>
                <Button variant="outline" onClick={() => toast.success("Quick doctor note saved in static review workspace")}>
                  <Save className="h-4 w-4" />
                  Save note
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        </div>

        <DoctorReviewWorklist rows={rows} reviews={reviews} onSelectPatient={handleChartPatientChange} onReview={onReview} />
      </div>

      <ClinicalConsultDialog
        key={consultDialog ? `${consultDialog.patient.id}-${consultDialog.observation?.id ?? "patient"}` : "consult-closed"}
        state={consultDialog}
        role={role}
        readOnly={readOnly}
        onOpenChange={(open) => !open && setConsultDialog(null)}
        onConfirm={(request) => {
          onCreateConsult(request);
          setConsultDialog(null);
        }}
      />
    </div>
  );
}

function DoctorReviewDateTimeFilter({
  dateMode,
  onDateMode,
  selectedDates,
  singleDate,
  onSingleDate,
  dateFrom,
  onDateFrom,
  dateTo,
  onDateTo,
  latestDataDate,
  hasDates,
  timeMode,
  onTimeMode,
  timeFrom,
  onTimeFrom,
  timeTo,
  onTimeTo,
}: {
  dateMode: string;
  onDateMode: (mode: string) => void;
  selectedDates: string[];
  singleDate: string;
  onSingleDate: (date: string) => void;
  dateFrom: string;
  onDateFrom: (date: string) => void;
  dateTo: string;
  onDateTo: (date: string) => void;
  latestDataDate: string;
  hasDates: boolean;
  timeMode: string;
  onTimeMode: (mode: string) => void;
  timeFrom: string;
  onTimeFrom: (time: string) => void;
  timeTo: string;
  onTimeTo: (time: string) => void;
}) {
  const dateModes = ["All dates", "Latest record date", "Today", "Yesterday", "Last 7 days", "Last 30 days", "Single date", "Custom range"];
  const timeModes = ["All times", "Morning 06-13", "Afternoon 14-17", "Evening 18-21", "Night 22-05", "Business hours", "Custom time range"];
  const invalidDateRange = dateMode === "Custom range" && Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const sameTimeRange = timeMode === "Custom time range" && Boolean(timeFrom && timeTo && timeFrom === timeTo);

  if (!hasDates) {
    return (
      <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
        No observation dates available.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Date filter</div>
          <div className="mt-1 text-sm text-foreground">
            {dateFilterSummary(dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {dateModes.map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={dateMode === mode ? "default" : "outline"}
              onClick={() => onDateMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {dateMode === "Single date" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Select date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={singleDate}
              onChange={(event) => onSingleDate(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => onSingleDate(latestDataDate || todayDateValue())}>
            Latest record date
          </Button>
        </div>
      ) : null}

      {dateMode === "Custom range" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">From date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFrom(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">To date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateTo}
              onChange={(event) => onDateTo(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => {
            onDateFrom("");
            onDateTo("");
          }}>
            <RefreshCcw className="h-4 w-4" />
            Reset range
          </Button>
        </div>
      ) : null}

      {invalidDateRange ? (
        <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          From date cannot be after To date.
        </div>
      ) : null}

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Time filter</div>
            <div className="mt-1 text-sm text-foreground">{timeFilterSummary(timeMode, timeFrom, timeTo)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeModes.map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={timeMode === mode ? "default" : "outline"}
                onClick={() => onTimeMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {timeMode === "Custom time range" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_auto] sm:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">From time</span>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                type="time"
                value={timeFrom}
                onChange={(event) => onTimeFrom(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">To time</span>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                type="time"
                value={timeTo}
                onChange={(event) => onTimeTo(event.target.value)}
              />
            </label>
            <Button variant="outline" onClick={() => {
              onTimeFrom("");
              onTimeTo("");
            }}>
              <RefreshCcw className="h-4 w-4" />
              Reset time
            </Button>
          </div>
        ) : null}

        {sameTimeRange ? (
          <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            Same start and end time will match the full day. Choose different times for a narrow range.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ClinicalConsultPanel({
  patient,
  observation,
  requests,
  readOnly,
  onRequest,
  onStatusChange,
}: {
  patient?: RapidReviewPatient;
  observation?: RapidObservationSet;
  requests: ClinicalConsultRequest[];
  readOnly: boolean;
  onRequest: (patient: RapidReviewPatient, observation?: RapidObservationSet) => void;
  onStatusChange: (requestId: string, status: ClinicalConsultStatus) => void;
}) {
  if (!patient) {
    return <EmptyState icon={UserPlus} title="No patient selected" description="Select a patient to request a consult or investigation review." />;
  }

  const patientRequests = requests
    .filter((request) => request.patientId === patient.id)
    .sort((a, b) => clinicalConsultSortValue(b).localeCompare(clinicalConsultSortValue(a)));
  const openRequests = patientRequests.filter((request) => request.status !== "Completed");
  const emergencyRequests = openRequests.filter((request) => request.priority === "Emergency");
  const awaitingAdvice = openRequests.filter((request) => !["Advice given", "Completed"].includes(request.status));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Clinical Consult & Escalation</CardTitle>
          <CardDescription>{patient.patientName} - specialty review, on-call doctor, investigation, and advice tracking.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={openRequests.length ? "warning" : "success"}>{openRequests.length} open</Badge>
          <Badge tone={emergencyRequests.length ? "critical" : "muted"}>{emergencyRequests.length} emergency</Badge>
          <Button disabled={readOnly} onClick={() => onRequest(patient, observation)}>
            <UserPlus className="h-4 w-4" />
            Request consult
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <ClinicalConsultStat label="Open consults" value={openRequests.length} tone={openRequests.length ? "warning" : "success"} />
          <ClinicalConsultStat label="Awaiting advice" value={awaitingAdvice.length} tone={awaitingAdvice.length ? "danger" : "success"} />
          <ClinicalConsultStat label="Latest status" value={patientRequests[0]?.status ?? "No request"} tone={patientRequests[0] ? clinicalConsultStatusTone(patientRequests[0].status) : "muted"} />
        </div>

        {patientRequests.length ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[1080px] border-collapse text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Date</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Time</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Department</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Requested to</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Priority</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Need</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Status</th>
                  <th className="border-b border-r border-border px-3 py-2 text-left">Advice / handoff</th>
                  <th className="border-b border-border px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {patientRequests.map((request) => {
                  const nextStatus = nextClinicalConsultStatus(request.status);
                  return (
                    <tr className="border-b border-border last:border-0" key={request.id}>
                      <td className="border-r border-border px-3 py-2 font-medium">{formatDateLabel(request.date)}</td>
                      <td className="border-r border-border px-3 py-2">{request.time}</td>
                      <td className="border-r border-border px-3 py-2">{request.department}</td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="font-medium text-foreground">{request.requestedTo}</div>
                        <div className="text-xs text-muted-foreground">{request.responseTarget}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <Badge tone={clinicalConsultPriorityTone(request.priority)}>{request.priority}</Badge>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="font-medium text-foreground">{request.requestType}</div>
                        <div className="text-xs text-muted-foreground">{request.investigation}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <StatusPill tone={clinicalConsultStatusTone(request.status)}>{request.status}</StatusPill>
                        <div className="mt-1 text-xs text-muted-foreground">{request.lastUpdated}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="line-clamp-2 text-xs text-foreground">{request.advice || request.clinicalQuestion}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            disabled={readOnly || !nextStatus}
                            size="sm"
                            variant="outline"
                            onClick={() => nextStatus && onStatusChange(request.id, nextStatus)}
                          >
                            {nextStatus ?? "Done"}
                          </Button>
                          <Button
                            disabled={readOnly || ["Completed", "Escalated"].includes(request.status)}
                            size="sm"
                            variant="ghost"
                            onClick={() => onStatusChange(request.id, "Escalated")}
                          >
                            Escalate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-surface-muted p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-foreground">No consult requested for this patient</div>
              <div className="mt-1 text-sm text-muted-foreground">Use consult request when specialty advice, on-call review, or investigation escalation is needed.</div>
            </div>
            <Button disabled={readOnly} variant="outline" onClick={() => onRequest(patient, observation)}>
              <PhoneCall className="h-4 w-4" />
              Call on-call
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClinicalConsultStat({ label, value, tone }: { label: string; value: string | number; tone: StatusTone }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-xl font-semibold text-foreground">{value}</div>
        <StatusPill tone={tone}>{tone === "muted" ? "Idle" : "Active"}</StatusPill>
      </div>
    </div>
  );
}

function ClinicalConsultDialog({
  state,
  role,
  readOnly,
  onOpenChange,
  onConfirm,
}: {
  state: ClinicalConsultDialogState;
  role: Role;
  readOnly: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (request: ClinicalConsultRequest) => void;
}) {
  const patient = state?.patient ?? null;
  const observation = state?.observation;
  const defaultDepartment = patient ? defaultClinicalConsultDepartment(patient, observation) : clinicalConsultDepartments[0];
  const [department, setDepartment] = React.useState(defaultDepartment);
  const [requestedTo, setRequestedTo] = React.useState((clinicalConsultDoctorsByDepartment[defaultDepartment] ?? ["On-call doctor"])[0]);
  const [priority, setPriority] = React.useState<ClinicalConsultPriority>(patient ? defaultClinicalConsultPriority(patient, observation) : "Routine");
  const [requestType, setRequestType] = React.useState(patient ? defaultClinicalConsultType(patient, observation) : clinicalConsultRequestTypes[0]);
  const [investigation, setInvestigation] = React.useState(patient ? defaultClinicalConsultInvestigation(patient, observation) : "None");
  const [responseTarget, setResponseTarget] = React.useState(defaultClinicalConsultResponseTarget(priority));
  const [clinicalQuestion, setClinicalQuestion] = React.useState(patient ? defaultClinicalQuestion(patient, observation) : "");
  const [handoffSummary, setHandoffSummary] = React.useState(patient ? defaultClinicalHandoff(patient, observation) : "");

  if (!patient) return null;

  return (
    <DialogPrimitive.Root open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Clinical consult request</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {patient.patientName} - {patient.uhid} - {patient.bed}, {patient.ward}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close consult request dialog">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <AlertBanner icon={ShieldAlert} tone={clinicalConsultPriorityTone(priority)} title={`${priority} consult - ${department}`}>
                  {patient.trigger}
                </AlertBanner>

                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Department">
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                      value={department}
                      onChange={(event) => {
                        const nextDepartment = event.target.value;
                        setDepartment(nextDepartment);
                        setRequestedTo((clinicalConsultDoctorsByDepartment[nextDepartment] ?? ["On-call doctor"])[0]);
                      }}
                      disabled={readOnly}
                    >
                      {clinicalConsultDepartments.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Requested to">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={requestedTo} onChange={(event) => setRequestedTo(event.target.value)} disabled={readOnly}>
                      {(clinicalConsultDoctorsByDepartment[department] ?? ["On-call doctor"]).map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Priority">
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                      value={priority}
                      onChange={(event) => {
                        const nextPriority = event.target.value as ClinicalConsultPriority;
                        setPriority(nextPriority);
                        setResponseTarget(defaultClinicalConsultResponseTarget(nextPriority));
                      }}
                      disabled={readOnly}
                    >
                      {["Routine", "Urgent", "Emergency"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Response target">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={responseTarget} onChange={(event) => setResponseTarget(event.target.value)} disabled={readOnly}>
                      {clinicalConsultResponseTargets.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Request type">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={requestType} onChange={(event) => setRequestType(event.target.value)} disabled={readOnly}>
                      {clinicalConsultRequestTypes.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Investigation / action">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={investigation} onChange={(event) => setInvestigation(event.target.value)} disabled={readOnly}>
                      {clinicalConsultInvestigations.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                </div>

                <FormField label="Clinical question">
                  <textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={clinicalQuestion} onChange={(event) => setClinicalQuestion(event.target.value)} disabled={readOnly} />
                </FormField>

                <FormField label="Handoff summary">
                  <textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={handoffSummary} onChange={(event) => setHandoffSummary(event.target.value)} disabled={readOnly} />
                </FormField>
              </div>

              <Card className="self-start">
                <CardHeader>
                  <div>
                    <CardTitle>Patient Snapshot</CardTitle>
                    <CardDescription>Latest context for the receiving doctor.</CardDescription>
                  </div>
                  <Badge tone={rapidLevelTone(patient.responseLevel)}>{patient.responseLevel}</Badge>
                </CardHeader>
                <CardContent className="space-y-1">
                  <DetailRow label="Patient" value={patient.patientName} />
                  <DetailRow label="UHID" value={patient.uhid} />
                  <DetailRow label="Location" value={`${patient.bed}, ${patient.ward}`} />
                  <DetailRow label="Consultant" value={patient.consultant} />
                  <DetailRow label="Review due" value={patient.reviewDue} />
                  {observation ? (
                    <>
                      <DetailRow label="Date" value={formatDateLabel(observationDateValue(observation))} />
                      <DetailRow label="Time" value={observationTimeLabel(observation)} />
                      <DetailRow label="RR / SpO2" value={`${observation.respiratoryRate} / ${observation.spo2}`} />
                      <DetailRow label="BP / Pulse" value={`${observation.bloodPressure} / ${observation.pulse}`} />
                      <DetailRow label="Rhythm" value={pulseRhythmLabel(observation)} />
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {readOnly ? "Read-only role cannot send consult requests." : "Request will be added to consult tracker for closed-loop follow-up."}
            </div>
            <div className="flex justify-end gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button
                disabled={readOnly}
                onClick={() => onConfirm(buildClinicalConsultRequest({
                  patient,
                  observation,
                  role,
                  department,
                  requestedTo,
                  priority,
                  requestType,
                  investigation,
                  responseTarget,
                  clinicalQuestion,
                  handoffSummary,
                }))}
              >
                <Send className="h-4 w-4" />
                Send request
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function AdultObservationChartCard({
  patient,
  observations,
  reviews,
  onCellClick,
}: {
  patient?: RapidReviewPatient;
  observations?: RapidObservationSet[];
  reviews: Record<string, ObservationReviewUpdate>;
  onCellClick: (row: AdultObservationDataRow, hour: string, value: string | number | undefined, level: AdultObservationRiskLevel) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  if (!patient) {
    return <EmptyState icon={CalendarDays} title="No patient selected" description="Select a patient from the doctor review panel to load the adult observation chart." />;
  }

  const chartObservations = observations ?? patient.observationHistory;
  const chartRows = buildAdultObservationData(chartObservations, reviews);

  return (
    <>
      {expanded ? <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" /> : null}
    <Card className={cn("min-w-0 overflow-hidden", expanded && "fixed inset-3 z-50 flex flex-col bg-background shadow-2xl")}>
      <CardHeader className="items-start">
        <div>
          <CardTitle>Adult Observation Chart - 24 Hours</CardTitle>
          <CardDescription>Hourly vitals monitoring with risk-based color zones for {patient.patientName}.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="muted">{chartObservations.length} entries</Badge>
          <StatusPill tone={rapidLevelTone(patient.responseLevel)}>{patient.responseLevel}</StatusPill>
          <Button size="sm" variant="outline" onClick={() => setExpanded((current) => !current)}>
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {expanded ? "Exit full screen" : "Full screen"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3 p-3", expanded && "flex min-h-0 flex-1 flex-col")}>
        <AdultObservationLegend />
        <div className="rounded-lg border" style={{ borderColor: adultObservationRiskPalette.empty.border }}>
          <div className={cn("overflow-auto", expanded ? "h-[calc(100vh-174px)]" : "max-h-[calc(100vh-260px)] min-h-[560px]")}>
            <table className="w-full min-w-[1760px] border-collapse text-xs">
              <thead>
                <tr>
                  <th
                    className="sticky left-0 top-0 z-30 min-w-[190px] border-b border-r bg-surface-muted px-3 py-2 text-left text-[11px] font-semibold uppercase text-muted-foreground"
                    style={{ borderColor: adultObservationRiskPalette.empty.border }}
                  >
                    Vital
                  </th>
                  {adultObservationHours.map((hour) => (
                    <th
                      className="sticky top-0 z-20 min-w-[64px] border-b border-r bg-surface-muted px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground"
                      style={{ borderColor: adultObservationRiskPalette.empty.border }}
                      key={hour}
                    >
                      {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartRows.map((row) => (
                  <tr key={row.vitalType}>
                    <th
                      className="sticky left-0 z-10 border-b border-r bg-background px-3 py-2 text-left align-middle font-semibold text-foreground"
                      style={{ borderColor: adultObservationRiskPalette.empty.border }}
                    >
                      <div>{row.label}</div>
                      {row.unit ? <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">{row.unit}</div> : null}
                    </th>
                    {adultObservationHours.map((hour) => {
                      const value = row.values[hour];
                      const level = getRiskLevel(row.vitalType, value);
                      return (
                        <AdultObservationCell
                          key={`${row.vitalType}-${hour}`}
                          row={row}
                          hour={hour}
                          value={value}
                          level={level}
                          onClick={() => onCellClick(row, hour, value, level)}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

function AdultObservationLegend() {
  const levels: AdultObservationRiskLevel[] = ["critical", "highRisk", "warning", "normal", "empty"];
  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((level) => (
        <span
          className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium"
          key={level}
          style={adultObservationLegendStyle(level)}
        >
          <span className="h-2.5 w-2.5 rounded-full border" style={adultObservationSwatchStyle(level)} />
          {adultObservationRiskPalette[level].label}
        </span>
      ))}
    </div>
  );
}

function AdultObservationCell({
  row,
  hour,
  value,
  level,
  onClick,
}: {
  row: AdultObservationDataRow;
  hour: string;
  value: string | number | undefined;
  level: AdultObservationRiskLevel;
  onClick: () => void;
}) {
  const displayValue = value ?? "--";
  const tooltip = `${row.label} | ${hour} | ${displayValue} | ${adultObservationRiskPalette[level].label}`;
  return (
    <td
      aria-label={tooltip}
      className="h-11 cursor-pointer border-b border-r px-1.5 py-1 text-center align-middle text-[11px] font-medium transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-ring/20"
      onClick={onClick}
      style={adultObservationCellStyle(level)}
      tabIndex={0}
      title={tooltip}
    >
      <span className="block break-words leading-tight">{displayValue}</span>
    </td>
  );
}

function DoctorReviewWorklist({
  rows,
  reviews,
  onSelectPatient,
  onReview,
}: {
  rows: Array<{ patient: RapidReviewPatient; observation: RapidObservationSet }>;
  reviews: Record<string, ObservationReviewUpdate>;
  onSelectPatient: (patientId: string) => void;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  if (!rows.length) {
    return <EmptyState icon={FileText} title="No observation records" description="Change filters to see doctor review worklist." />;
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Review Worklist</CardTitle>
          <CardDescription>Click a record to load its 24-hour chart on the left.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[460px] overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="border-b border-border px-3 py-2 text-left">Date</th>
                <th className="border-b border-border px-3 py-2 text-left">Time</th>
                <th className="border-b border-border px-3 py-2 text-left">Patient</th>
                <th className="border-b border-border px-3 py-2 text-left">Risk</th>
                <th className="border-b border-border px-3 py-2 text-left">Review</th>
                <th className="border-b border-border px-3 py-2 text-left">Doctor action</th>
                <th className="border-b border-border px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ patient, observation }) => {
                const reviewStatus = observationReviewStatus(observation, reviews);
                const review = observationReviewDetails(observation, reviews);
                const deficitRisk = pulseDeficitRiskLevel(monitorHeartRateValue(observation), observation.pulse);
                return (
                  <tr
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-muted/60"
                    key={observation.id}
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-medium">{formatDateLabel(observationDateValue(observation))}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="font-medium">{observationTimeLabel(observation)}</div>
                      <div className="text-xs text-muted-foreground">{observation.shift ?? "Shift not set"}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-foreground">{patient.patientName}</div>
                      <div className="text-xs text-muted-foreground">{patient.uhid} - {patient.bed}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                        <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                        <Badge tone={adultRiskTone(pulseRhythmRiskLevel(pulseRhythmLabel(observation)))}>Rhythm: {pulseRhythmLabel(observation)}</Badge>
                        {deficitRisk !== "normal" && deficitRisk !== "empty" ? <Badge tone={adultRiskTone(deficitRisk)}>Deficit {pulseDeficitChartValue(observation)} bpm</Badge> : null}
                      </div>
                    </td>
                    <td className="px-3 py-2"><StatusPill tone={reviewStatusTone(reviewStatus)}>{reviewStatus}</StatusPill></td>
                    <td className="min-w-[220px] px-3 py-2 text-xs text-muted-foreground">{review.doctorAction}</td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onReview(patient, observation);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DateWiseLogTab({
  patients,
  reviews,
  onReview,
}: {
  patients: RapidReviewPatient[];
  reviews: Record<string, ObservationReviewUpdate>;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [dateMode, setDateMode] = React.useState("All dates");
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
  const [singleDate, setSingleDate] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const [wardFilter, setWardFilter] = React.useState("All wards");
  const [sourceFilter, setSourceFilter] = React.useState("All sources");
  const [responseFilter, setResponseFilter] = React.useState("All response");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [shiftFilter, setShiftFilter] = React.useState("All shifts");
  const [enteredByFilter, setEnteredByFilter] = React.useState("All staff");
  const [reviewedByFilter, setReviewedByFilter] = React.useState("All reviewers");
  const [sortBy, setSortBy] = React.useState("Newest first");
  const [page, setPage] = React.useState(1);

  const allRows = flattenObservationRows(patients);
  const dateOptions = uniqueObservationDates(patients);
  const wardOptions = ["All wards", ...uniqueValues(patients.map((patient) => patient.ward))];
  const sourceOptions = ["All sources", ...uniqueValues(patients.map((patient) => patient.source))];
  const shiftOptions = ["All shifts", ...uniqueValues(allRows.map((row) => row.observation.shift ?? "Shift not set"))];
  const enteredByOptions = ["All staff", ...uniqueValues(allRows.map((row) => row.observation.recordedBy))];
  const reviewedByOptions = ["All reviewers", ...uniqueValues(allRows.map((row) => observationReviewDetails(row.observation, reviews).reviewedBy))];
  const dateCounts = observationDateCounts(allRows);
  const latestDataDate = latestAvailableDate(dateOptions);

  const rows = allRows
    .filter((row) => {
      const review = observationReviewDetails(row.observation, reviews);
      const text = observationLogSearchText(row, review);
      return includes(text, search);
    })
    .filter((row) => patientFilter === "All patients" || row.patient.id === patientFilter)
    .filter((row) => observationMatchesDateFilter(row.observation, dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate))
    .filter((row) => wardFilter === "All wards" || row.patient.ward === wardFilter)
    .filter((row) => sourceFilter === "All sources" || row.patient.source === sourceFilter)
    .filter((row) => responseFilter === "All response" || row.observation.responseLevel === responseFilter)
    .filter((row) => statusFilter === "All status" || observationReviewStatus(row.observation, reviews) === statusFilter)
    .filter((row) => shiftFilter === "All shifts" || (row.observation.shift ?? "Shift not set") === shiftFilter)
    .filter((row) => enteredByFilter === "All staff" || row.observation.recordedBy === enteredByFilter)
    .filter((row) => reviewedByFilter === "All reviewers" || observationReviewDetails(row.observation, reviews).reviewedBy === reviewedByFilter)
    .sort((a, b) => compareObservationLogRows(a, b, reviews, sortBy));

  const selectedPatientCount = new Set(rows.map((row) => row.patient.id)).size;
  const pendingCount = rows.filter((row) => observationReviewStatus(row.observation, reviews) === "Pending doctor review").length;
  const criticalCount = rows.filter((row) => row.observation.dominantZone === "Purple" || row.observation.responseLevel === "MER Call").length;
  const totalPages = Math.max(1, Math.ceil(rows.length / DATE_LOG_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = rows.length ? (currentPage - 1) * DATE_LOG_PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(currentPage * DATE_LOG_PAGE_SIZE, rows.length);
  const paginatedRows = rows.slice((currentPage - 1) * DATE_LOG_PAGE_SIZE, currentPage * DATE_LOG_PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setDateMode("All dates");
    setSelectedDates([]);
    setSingleDate("");
    setDateFrom("");
    setDateTo("");
    setPatientFilter("All patients");
    setWardFilter("All wards");
    setSourceFilter("All sources");
    setResponseFilter("All response");
    setStatusFilter("All status");
    setShiftFilter("All shifts");
    setEnteredByFilter("All staff");
    setReviewedByFilter("All reviewers");
    setSortBy("Newest first");
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateDateMode(value: string) {
    setDateMode(value);
    if (value === "Single date" && !singleDate) setSingleDate(latestDataDate || todayDateValue());
    if (value === "Custom range" && !dateFrom && !dateTo) {
      const defaultDate = latestDataDate || todayDateValue();
      setDateFrom(defaultDate);
      setDateTo(defaultDate);
    }
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <RapidReviewControlToggle label="Date wise log controls">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Filtered records" value={rows.length} change={dateFilterSummary(dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate)} context="Observation log rows" tone="info" icon={FileText} />
            <StatCard label="Patients" value={selectedPatientCount} change={patientFilter === "All patients" ? "All selected" : "Focused"} context="Matched patient records" tone="success" icon={UserRound} />
            <StatCard label="Pending reviews" value={pendingCount} change="Action needed" context="Doctor review status" tone="warning" icon={Clock3} />
            <StatCard label="Critical / MER" value={criticalCount} change="Priority" context="Purple zone or MER call" tone="critical" icon={ShieldAlert} />
          </div>

          <Card>
        <CardHeader>
          <div>
            <CardTitle>Date Wise Log Filters</CardTitle>
            <CardDescription>Filter one patient across multiple dates, or audit multiple patients by ward, staff, response, and review status.</CardDescription>
          </div>
          <Button variant="outline" onClick={resetFilters}>
            <RefreshCcw className="h-4 w-4" />
            Clear
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar search={search} onSearch={updateSearch} placeholder="Search patient, UHID, bed, recorded by, doctor, note, action...">
            <label className="flex min-w-[230px] items-center gap-2 text-xs text-muted-foreground">
              <span className="sr-only">Patient</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                value={patientFilter}
                onChange={(event) => {
                  setPatientFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="All patients">All patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.patientName} - {patient.uhid} - {patient.bed}</option>
                ))}
              </select>
            </label>
            <NativeSelect
              label="Sort"
              value={sortBy}
              onChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
              options={["Newest first", "Oldest first", "Clinical priority", "Patient name", "Review status", "Entered by"]}
            />
          </FilterBar>

          <DateSmartFilter
            dates={dateOptions}
            dateCounts={dateCounts}
            latestDataDate={latestDataDate}
            mode={dateMode}
            onMode={updateDateMode}
            selectedDates={selectedDates}
            onSelectedDates={(value) => {
              setSelectedDates(value);
              setPage(1);
            }}
            singleDate={singleDate}
            onSingleDate={(value) => {
              setSingleDate(value);
              setPage(1);
            }}
            dateFrom={dateFrom}
            onDateFrom={(value) => {
              setDateFrom(value);
              setPage(1);
            }}
            dateTo={dateTo}
            onDateTo={(value) => {
              setDateTo(value);
              setPage(1);
            }}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <NativeSelect label="Ward" value={wardFilter} onChange={(value) => { setWardFilter(value); setPage(1); }} options={wardOptions} />
            <NativeSelect label="Source" value={sourceFilter} onChange={(value) => { setSourceFilter(value); setPage(1); }} options={sourceOptions} />
            <NativeSelect label="Response" value={responseFilter} onChange={(value) => { setResponseFilter(value); setPage(1); }} options={["All response", "MER Call", "MDT Review", "RN Review", "Routine"]} />
            <NativeSelect label="Review status" value={statusFilter} onChange={(value) => { setStatusFilter(value); setPage(1); }} options={["All status", "Pending doctor review", "Reviewed", "Escalated", "Closed"]} />
            <NativeSelect label="Shift" value={shiftFilter} onChange={(value) => { setShiftFilter(value); setPage(1); }} options={shiftOptions} />
            <NativeSelect label="Entered by" value={enteredByFilter} onChange={(value) => { setEnteredByFilter(value); setPage(1); }} options={enteredByOptions} />
            <NativeSelect label="Reviewed by" value={reviewedByFilter} onChange={(value) => { setReviewedByFilter(value); setPage(1); }} options={reviewedByOptions} />
          </div>
        </CardContent>
          </Card>
        </div>
      </RapidReviewControlToggle>

      <ObservationLogTable
        rows={paginatedRows}
        reviews={reviews}
        onReview={onReview}
        totalRows={rows.length}
        currentPage={currentPage}
        totalPages={totalPages}
        pageStart={pageStart}
        pageEnd={pageEnd}
        onPageChange={setPage}
      />
    </div>
  );
}

function DateSmartFilter({
  dates,
  dateCounts,
  latestDataDate,
  mode,
  onMode,
  selectedDates,
  onSelectedDates,
  singleDate,
  onSingleDate,
  dateFrom,
  onDateFrom,
  dateTo,
  onDateTo,
}: {
  dates: string[];
  dateCounts: Record<string, number>;
  latestDataDate: string;
  mode: string;
  onMode: (mode: string) => void;
  selectedDates: string[];
  onSelectedDates: (dates: string[]) => void;
  singleDate: string;
  onSingleDate: (date: string) => void;
  dateFrom: string;
  onDateFrom: (date: string) => void;
  dateTo: string;
  onDateTo: (date: string) => void;
}) {
  if (!dates.length) {
    return (
      <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
        No observation dates available.
      </div>
    );
  }

  const allSelected = mode === "All dates" || selectedDates.length === 0 || selectedDates.length === dates.length;
  const dateModeGroups = [
    { label: "Quick", modes: ["All dates", "Latest record date", "Today", "Yesterday"] },
    { label: "Rolling", modes: ["Last 24 hours", "Last 48 hours", "Last 7 days", "Last 30 days"] },
    { label: "Calendar", modes: ["This week", "Last week", "This month", "Last month"] },
    { label: "Manual", modes: ["Single date", "Specific dates", "Custom range"] },
  ];
  const invalidRange = mode === "Custom range" && Boolean(dateFrom && dateTo && dateFrom > dateTo);

  function toggleDate(date: string) {
    if (selectedDates.includes(date)) {
      onSelectedDates(selectedDates.filter((value) => value !== date));
      return;
    }
    onSelectedDates([...selectedDates, date]);
  }

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Date filter</div>
          <div className="mt-1 text-sm text-foreground">
            {dateFilterSummary(mode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate)}
          </div>
        </div>
        <div className="grid gap-3 xl:grid-cols-4">
          {dateModeGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">{group.label}</div>
              <div className="flex flex-wrap gap-2">
                {group.modes.map((dateMode) => (
                  <Button
                    key={dateMode}
                    size="sm"
                    variant={mode === dateMode ? "default" : "outline"}
                    onClick={() => onMode(dateMode)}
                  >
                    {dateMode}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {mode === "Single date" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Select date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={singleDate}
              onChange={(event) => onSingleDate(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => onSingleDate(latestDataDate || todayDateValue())}>
            Latest record date
          </Button>
        </div>
      ) : null}

      {mode === "Custom range" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">From date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFrom(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">To date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateTo}
              onChange={(event) => onDateTo(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => {
            onDateFrom("");
            onDateTo("");
          }}>
            <RefreshCcw className="h-4 w-4" />
            Reset range
          </Button>
        </div>
      ) : null}

      {invalidRange ? (
        <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          From date cannot be after To date. Please correct the range.
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-xs text-muted-foreground">Available dates</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={allSelected ? "default" : "outline"} onClick={() => {
            onMode("All dates");
            onSelectedDates([]);
          }}>
            Show all
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            onMode("Specific dates");
            onSelectedDates(dates);
          }}>
            Select all dates
          </Button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {dates.map((date) => {
          const selected = mode !== "Specific dates"
            ? observationMatchesDateValue(date, mode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate)
            : selectedDates.length === 0 || selectedDates.includes(date);
          return (
            <button
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-surface",
              )}
              key={date}
              onClick={() => {
                onMode("Specific dates");
                toggleDate(date);
              }}
              type="button"
            >
              {formatDateLabel(date)}
              <span className="ml-1 opacity-75">({dateCounts[date] ?? 0})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSmartFilter({
  mode,
  onMode,
  timeFrom,
  onTimeFrom,
  timeTo,
  onTimeTo,
}: {
  mode: string;
  onMode: (mode: string) => void;
  timeFrom: string;
  onTimeFrom: (time: string) => void;
  timeTo: string;
  onTimeTo: (time: string) => void;
}) {
  const modes = ["All times", "Morning 06-13", "Afternoon 14-17", "Evening 18-21", "Night 22-05", "Business hours", "Custom time range"];
  const invalidRange = mode === "Custom time range" && Boolean(timeFrom && timeTo && timeFrom === timeTo);

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Time filter</div>
          <div className="mt-1 text-sm text-foreground">{timeFilterSummary(mode, timeFrom, timeTo)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <Button key={item} size="sm" variant={mode === item ? "default" : "outline"} onClick={() => onMode(item)}>
              {item}
            </Button>
          ))}
        </div>
      </div>

      {mode === "Custom time range" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">From time</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="time"
              value={timeFrom}
              onChange={(event) => onTimeFrom(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">To time</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="time"
              value={timeTo}
              onChange={(event) => onTimeTo(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => {
            onTimeFrom("");
            onTimeTo("");
          }}>
            <RefreshCcw className="h-4 w-4" />
            Reset time
          </Button>
        </div>
      ) : null}

      {invalidRange ? (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          Same start and end time will match the full day. Choose different times for a narrow range.
        </div>
      ) : null}
    </div>
  );
}

function ObservationLogTable({
  rows,
  reviews,
  onReview,
  totalRows,
  currentPage,
  totalPages,
  pageStart,
  pageEnd,
  onPageChange,
}: {
  rows: ObservationLogRow[];
  reviews: Record<string, ObservationReviewUpdate>;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
  totalRows: number;
  currentPage: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  onPageChange: (page: number) => void;
}) {
  if (!totalRows) {
    return <EmptyState icon={FileText} title="No observation records" description="Change date, patient, or review filters to see observation history." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] border-collapse text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-3 py-2 text-left">Date</th>
              <th className="border-b border-border px-3 py-2 text-left">Time</th>
              <th className="border-b border-border px-3 py-2 text-left">Patient</th>
              <th className="border-b border-border px-3 py-2 text-left">Entered by</th>
              <th className="border-b border-border px-3 py-2 text-left">Vitals</th>
              <th className="border-b border-border px-3 py-2 text-left">O2 / urine</th>
              <th className="border-b border-border px-3 py-2 text-left">Severity</th>
              <th className="border-b border-border px-3 py-2 text-left">Review</th>
              <th className="border-b border-border px-3 py-2 text-left">Reviewed by</th>
              <th className="border-b border-border px-3 py-2 text-left">Doctor action</th>
              <th className="border-b border-border px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ patient, observation }) => {
              const review = observationReviewDetails(observation, reviews);
              const reviewStatus = observationReviewStatus(observation, reviews);
              return (
                <tr key={observation.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-3 py-2 font-medium">
                    {formatDateLabel(observationDateValue(observation))}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="font-medium">{observationTimeLabel(observation)}</div>
                    <div className="text-xs text-muted-foreground">{observation.shift ?? "Shift not set"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{patient.patientName}</div>
                    <div className="text-xs text-muted-foreground">{patient.uhid} - {patient.bed}, {patient.ward}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{observation.recordedBy}</div>
                    <div className="text-xs text-muted-foreground">{observation.deliveryMethod ?? "Method not set"}</div>
                  </td>
                  <td className="min-w-[230px] px-3 py-2 text-xs leading-5">
                    RR {observation.respiratoryRate} | SpO2 {observation.spo2} | FiO2 {fio2Value(observation)} | BP {observation.bloodPressure} | HR {monitorHeartRateValue(observation)} | Pulse {observation.pulse} | Deficit {pulseDeficitChartValue(observation)} | Rhythm {pulseRhythmLabel(observation)} | Quality {pulseQualityLabel(observation)} | Temp {observation.temperature}
                  </td>
                  <td className="px-3 py-2 text-xs leading-5">
                    O2 {observation.oxygenFlow}<br />Urine {observation.urineOutput}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-start gap-1">
                      <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                      <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                    </div>
                  </td>
                  <td className="px-3 py-2"><StatusPill tone={reviewStatusTone(reviewStatus)}>{reviewStatus}</StatusPill></td>
                  <td className="px-3 py-2">
                    <div>{review.reviewedBy}</div>
                    <div className="text-xs text-muted-foreground">{review.reviewedAt}</div>
                  </td>
                  <td className="min-w-[240px] px-3 py-2 text-xs text-muted-foreground">
                    <div>{review.doctorAction}</div>
                    {review.ecgRhythm !== "Not confirmed" ? <div className="mt-1 text-foreground">ECG: {review.ecgRhythm}</div> : null}
                    <div className="mt-1">{review.rhythmPlan}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant={reviewStatus === "Pending doctor review" ? "default" : "outline"} onClick={() => onReview(patient, observation)}>
                      <Eye className="h-4 w-4" />
                      Review
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-3 py-3 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <div>
          Showing {pageStart}-{pageEnd} of {totalRows} observation records. Page {currentPage} of {totalPages}.
        </div>
        <ObservationLogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

function ObservationLogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = paginationPages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </Button>
      {pages.map((pageNumber) => (
        <Button
          key={pageNumber}
          size="sm"
          variant={pageNumber === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </Button>
    </div>
  );
}

function WorkflowStep({ icon: Icon, title, description }: { icon: typeof Plus; title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3 p-3">
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function VitalInput({ value, onChange, disabled, suffix, step = "1" }: { value: string; onChange: (value: string) => void; disabled?: boolean; suffix: string; step?: string }) {
  return (
    <div className="relative">
      <input
        className="h-9 w-full rounded-md border border-input bg-background px-3 pr-14 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{suffix}</span>
    </div>
  );
}

function BloodPressureInput({
  systolic,
  diastolic,
  onSystolicChange,
  onDiastolicChange,
  disabled,
}: {
  systolic: string;
  diastolic: string;
  onSystolicChange: (value: string) => void;
  onDiastolicChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <div className="grid h-9 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/20">
        <label className="relative min-w-0">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-muted-foreground">SYS</span>
          <input
            className="h-full w-full border-0 bg-transparent pl-9 pr-2 text-sm outline-none"
            type="number"
            min="0"
            inputMode="numeric"
            value={systolic}
            onChange={(event) => onSystolicChange(event.target.value)}
            disabled={disabled}
            placeholder="120"
          />
        </label>
        <span className="flex h-full items-center border-x border-input px-2 text-sm font-semibold text-muted-foreground">/</span>
        <label className="relative min-w-0">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-muted-foreground">DIA</span>
          <input
            className="h-full w-full border-0 bg-transparent pl-9 pr-2 text-sm outline-none"
            type="number"
            min="0"
            inputMode="numeric"
            value={diastolic}
            onChange={(event) => onDiastolicChange(event.target.value)}
            disabled={disabled}
            placeholder="80"
          />
        </label>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{systolic || "--"}/{diastolic || "--"} mmHg</div>
    </div>
  );
}

function QueueCommandPanel({
  rows,
  updates,
  readOnly,
  onReview,
}: {
  rows: RapidReviewPatient[];
  updates: Record<string, ReviewUpdate>;
  readOnly: boolean;
  onReview: (patient: RapidReviewPatient, intent: DialogState["intent"]) => void;
}) {
  const top = rows[0];

  if (!top) {
    return (
      <Card>
        <CardContent className="p-4">
          <EmptyState icon={Activity} title="No rapid review patients" description="Change filters to bring patients back into the queue." />
        </CardContent>
      </Card>
    );
  }

  const status = effectiveStatus(top, updates);
  const highestMetric = top.metrics.find((metric) => metric.zone === "Purple") ?? top.metrics.find((metric) => metric.zone === "Red") ?? top.metrics[0];

  return (
    <Card className="self-start">
      <CardHeader>
        <div>
          <CardTitle>Next Best Action</CardTitle>
          <CardDescription>Designed to reduce clicks during doctor review.</CardDescription>
        </div>
        <StatusPill tone={rapidLevelTone(top.responseLevel)}>{top.responseLevel}</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-surface-muted p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">{top.patientName}</div>
              <div className="mt-1 text-xs text-muted-foreground">{top.uhid} - {top.bed}, {top.ward}</div>
            </div>
            <StatusPill tone={rapidStatusTone(status)}>{status}</StatusPill>
          </div>
          <div className="mt-3 text-xs leading-5 text-muted-foreground">{top.trigger}</div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <CompactMetric label={highestMetric.label} value={`${highestMetric.value}${highestMetric.unit ? ` ${highestMetric.unit}` : ""}`} zone={highestMetric.zone} />
          <CompactMetric label="Urine output" value={top.urineOutput} zone={top.responseLevel === "MDT Review" ? "Red" : "Safe"} />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Recommended actions</div>
          {top.recommendedActions.slice(0, 4).map((action) => (
            <div key={action} className="flex gap-2 rounded-md border border-border px-3 py-2 text-xs">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <span>{action}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button className="flex-1" onClick={() => onReview(top, "review")} disabled={readOnly}>
            <ClipboardCheck className="h-4 w-4" />
            Open review
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => onReview(top, "escalate")} disabled={readOnly}>
            <Zap className="h-4 w-4" />
            Escalate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompactMetric({ label, value, zone }: { label: string; value: string; zone: RapidZone }) {
  return (
    <div className={cn("rounded-md border p-3", zonePanelClass(zone))}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs">{zone} zone</div>
    </div>
  );
}

function ObservationChartTab({
  selectedPatient,
  selectedPatientId,
  onSelectedPatient,
  reviews,
  onReview,
  readOnly,
}: {
  selectedPatient: RapidReviewPatient;
  selectedPatientId: string;
  onSelectedPatient: (value: string) => void;
  reviews: Record<string, ObservationReviewUpdate>;
  onReview: (patient: RapidReviewPatient) => void;
  readOnly: boolean;
}) {
  const timeline = patientTimelineObservations(selectedPatient);
  const summary = patientTimelineSummary(selectedPatient, reviews);

  return (
    <div className="space-y-4">
      <RapidReviewControlToggle label="Patient timeline controls">
        <div className="space-y-3">
          <Card>
        <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              value={selectedPatientId}
              onChange={(event) => onSelectedPatient(event.target.value)}
              aria-label="Select patient for observation chart"
            >
              {rapidReviewPatients.map((patient) => (
                <option key={patient.id} value={optionValue(patient.id)}>
                  {patient.patientName} - {patient.uhid} - {patient.bed}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => onReview(selectedPatient)} disabled={readOnly}>
            <ClipboardCheck className="h-4 w-4" />
            Record timeline note
          </Button>
        </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <TimelineSummaryTile label="Latest response" value={summary.latest?.responseLevel ?? "-"} change={summary.latest ? observationTimeLabel(summary.latest) : "-"} context="Current clinical state" tone={summary.latest ? rapidLevelTone(summary.latest.responseLevel) : "info"} icon={Activity} />
            <TimelineSummaryTile label="First warning" value={summary.firstWarning ? observationTimeLabel(summary.firstWarning) : "-"} change={summary.firstWarning?.responseLevel ?? "None"} context="First non-routine trigger" tone={summary.firstWarning ? rapidLevelTone(summary.firstWarning.responseLevel) : "success"} icon={BellRing} />
            <TimelineSummaryTile label="Peak risk" value={summary.peak ? summary.peak.responseLevel : "-"} change={summary.peak ? observationTimeLabel(summary.peak) : "-"} context={summary.peak?.dominantZone ?? "No high risk"} tone={summary.peak ? rapidLevelTone(summary.peak.responseLevel) : "info"} icon={ShieldAlert} />
            <TimelineSummaryTile label="Readings" value={timeline.length} change="Timeline" context={`${summary.reviewedCount} reviewed / ${summary.pendingCount} pending`} tone="info" icon={Clock3} />
          </div>
        </div>
      </RapidReviewControlToggle>

      <TimelineRiskJourney observations={timeline} />

      <AdultObservationChartCard
        patient={selectedPatient}
        reviews={reviews}
        onCellClick={(row, hour, value, level) => {
          toast.info(`${row.label} at ${hour}: ${value ?? "--"} (${adultObservationRiskPalette[level].label})`);
        }}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <PatientTimelineEvents patient={selectedPatient} observations={timeline} reviews={reviews} />

        <div className="space-y-4">
          <TimelineHandoverSummary patient={selectedPatient} summary={summary} />
          <TimelineTurningPoints summary={summary} />
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Latest Vitals Snapshot</CardTitle>
                <CardDescription>Current patient condition from the latest observation set.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {patientMetricsWithRhythm(selectedPatient).map((metric) => (
                <MetricTile key={metric.id} metric={metric} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TimelineSummaryTile({
  label,
  value,
  change,
  context,
  tone,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  change: string;
  context: string;
  tone: StatusTone;
  icon: typeof Activity;
}) {
  return (
    <Card className="min-h-[132px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <StatusPill tone={tone}>{change}</StatusPill>
        <span className="truncate text-xs text-muted-foreground">{context}</span>
      </div>
    </Card>
  );
}

function TimelineRiskJourney({ observations }: { observations: RapidObservationSet[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Risk Journey</CardTitle>
          <CardDescription>Read-only sequence of how the patient moved through response levels over time.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-2">
            {observations.map((observation, index) => (
              <div className="flex items-center gap-2" key={observation.id}>
                {index > 0 ? <div className="h-px w-5 bg-border" /> : null}
                <div className={cn("min-w-[92px] rounded-md border px-2 py-2 text-center", zonePanelClass(observation.dominantZone))}>
                  <div className="text-[11px] font-semibold">{observationTimeLabel(observation)}</div>
                  <div className="mt-1 text-[10px]">{observation.responseLevel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientTimelineEvents({
  patient,
  observations,
  reviews,
}: {
  patient: RapidReviewPatient;
  observations: RapidObservationSet[];
  reviews: Record<string, ObservationReviewUpdate>;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{patient.patientName} Timeline</CardTitle>
          <CardDescription>{patient.uhid} - {patient.bed}, {patient.ward}. Chronological clinical story from nurse entries and review outcomes.</CardDescription>
        </div>
        <Badge tone="info">{observations.length} events</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {observations.map((observation, index) => {
          const previous = observations[index - 1];
          const review = observationReviewDetails(observation, reviews);
          const reviewStatus = observationReviewStatus(observation, reviews);
          return (
            <div className="relative grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[96px_minmax(0,1fr)]" key={observation.id}>
              <div className="text-sm">
                <div className="font-semibold text-foreground">{observationTimeLabel(observation)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDateLabel(observationDateValue(observation))}</div>
                <div className="mt-2">
                  <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                </div>
              </div>
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                      <StatusPill tone={reviewStatusTone(reviewStatus)}>{reviewStatus}</StatusPill>
                      <Badge tone="muted">{timelineChangeLabel(observation, previous)}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-foreground">{observation.note}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{observation.recordedBy}</div>
                    <div>{observation.shift ?? "Shift not set"}</div>
                  </div>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
                  <TimelineVital label="RR" value={observation.respiratoryRate} />
                  <TimelineVital label="SpO2" value={observation.spo2} />
                  <TimelineVital label="FiO2" value={fio2Value(observation)} />
                  <TimelineVital label="BP" value={observation.bloodPressure} />
                  <TimelineVital label="HR" value={monitorHeartRateValue(observation)} />
                  <TimelineVital label="Pulse" value={observation.pulse} />
                  <TimelineVital label="Deficit" value={`${pulseDeficitChartValue(observation)} bpm`} />
                  <TimelineVital label="Rhythm" value={pulseRhythmLabel(observation)} />
                  <TimelineVital label="Quality" value={pulseQualityLabel(observation)} />
                  <TimelineVital label="Temp" value={observation.temperature} />
                  <TimelineVital label="O2" value={`${observation.oxygenFlow}${observation.deliveryMethod ? `, ${observation.deliveryMethod}` : ""}`} />
                  <TimelineVital label="GCS / pain" value={`${gcsScoreLabel(observation.consciousness)} / ${observation.painScore}`} />
                  <TimelineVital label="Urine" value={observation.urineOutput} />
                </div>
                <div className="rounded-md border border-border bg-surface-muted p-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Review action:</span> {review.doctorAction}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TimelineVital({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted px-2 py-1.5">
      <div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-foreground">{value}</div>
    </div>
  );
}

function TimelineHandoverSummary({
  patient,
  summary,
}: {
  patient: RapidReviewPatient;
  summary: PatientTimelineSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Handover Summary</CardTitle>
          <CardDescription>Latest status and unresolved items for the next clinician.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <DetailRow label="Consultant" value={patient.consultant} />
        <DetailRow label="Owner" value={patient.owner} />
        <DetailRow label="Latest" value={summary.latest ? `${observationTimeLabel(summary.latest)} - ${summary.latest.responseLevel}` : "-"} />
        <DetailRow label="Trigger" value={patient.trigger} />
        <DetailRow label="Urine" value={patient.urineOutput} />
        <DetailRow label="Review due" value={patient.reviewDue} />
        <DetailRow label="Pending" value={`${summary.pendingCount} observation reviews`} />
      </CardContent>
    </Card>
  );
}

function TimelineTurningPoints({ summary }: { summary: PatientTimelineSummary }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Key Turning Points</CardTitle>
          <CardDescription>Moments that explain deterioration or recovery.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <TurningPoint label="First warning" observation={summary.firstWarning} fallback="No warning trigger recorded" />
        <TurningPoint label="First high risk" observation={summary.firstHighRisk} fallback="No MDT/MER threshold crossed" />
        <TurningPoint label="Peak risk" observation={summary.peak} fallback="No peak risk event" />
        <TurningPoint label="Latest state" observation={summary.latest} fallback="No latest observation" />
      </CardContent>
    </Card>
  );
}

function TurningPoint({ label, observation, fallback }: { label: string; observation?: RapidObservationSet; fallback: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {observation ? `${observationTimeLabel(observation)} - ${observation.responseLevel}` : fallback}
          </div>
        </div>
        {observation ? <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge> : null}
      </div>
      {observation ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{observation.note}</div> : null}
    </div>
  );
}

function MultiObservationTable({
  patient,
  title,
  description,
  compact,
}: {
  patient: RapidReviewPatient;
  title: string;
  description?: string;
  compact?: boolean;
}) {
  const rows = [...patient.observationHistory].reverse();

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-col gap-1 border-b border-border bg-surface-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
        </div>
        <Badge tone="info">{rows.length} readings</Badge>
      </div>
      <div className={cn("overflow-x-auto", compact && "max-h-64 overflow-y-auto")}>
        <table className="w-full min-w-[1320px] border-collapse text-sm">
          <thead className="bg-background text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-3 py-2 text-left">Date</th>
              <th className="border-b border-border px-3 py-2 text-left">Time</th>
              <th className="border-b border-border px-3 py-2 text-left">By</th>
              <th className="border-b border-border px-3 py-2 text-left">RR</th>
              <th className="border-b border-border px-3 py-2 text-left">SpO2</th>
              <th className="border-b border-border px-3 py-2 text-left">O2 / method</th>
              <th className="border-b border-border px-3 py-2 text-left">BP</th>
              <th className="border-b border-border px-3 py-2 text-left">HR</th>
              <th className="border-b border-border px-3 py-2 text-left">Pulse</th>
              <th className="border-b border-border px-3 py-2 text-left">Deficit</th>
              <th className="border-b border-border px-3 py-2 text-left">Rhythm</th>
              <th className="border-b border-border px-3 py-2 text-left">Quality / Site</th>
              <th className="border-b border-border px-3 py-2 text-left">Temp</th>
              <th className="border-b border-border px-3 py-2 text-left">GCS / Pain</th>
              <th className="border-b border-border px-3 py-2 text-left">Urine</th>
              <th className="border-b border-border px-3 py-2 text-left">Zone</th>
              <th className="border-b border-border px-3 py-2 text-left">Response</th>
              <th className="border-b border-border px-3 py-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((observation) => (
              <tr key={observation.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-3 py-2 font-medium">{formatDateLabel(observationDateValue(observation))}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="font-medium">{observationTimeLabel(observation)}</div>
                  <div className="text-xs text-muted-foreground">{observation.shift ?? "Shift not set"}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{observation.recordedBy}</td>
                <td className="px-3 py-2">{observation.respiratoryRate}</td>
                <td className="px-3 py-2">{observation.spo2}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div>{observation.oxygenFlow}</div>
                  <div className="text-xs text-muted-foreground">{observation.deliveryMethod ?? "Method not set"}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-2">{observation.bloodPressure}</td>
                <td className="px-3 py-2">{monitorHeartRateValue(observation)}</td>
                <td className="px-3 py-2">{observation.pulse}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <Badge tone={adultRiskTone(pulseDeficitRiskLevel(monitorHeartRateValue(observation), observation.pulse))}>{pulseDeficitChartValue(observation)} bpm</Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <Badge tone={adultRiskTone(pulseRhythmRiskLevel(pulseRhythmLabel(observation)))}>{pulseRhythmLabel(observation)}</Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div><Badge tone={adultRiskTone(pulseQualityRiskLevel(pulseQualityLabel(observation)))}>{pulseQualityLabel(observation)}</Badge></div>
                  <div className="mt-1 text-xs text-muted-foreground">{pulseSiteLabel(observation)} - {observation.pulseSource ?? "Manual radial pulse"}</div>
                </td>
                <td className="px-3 py-2">{observation.temperature}</td>
                <td className="whitespace-nowrap px-3 py-2">{gcsScoreLabel(observation.consciousness)} / {observation.painScore}</td>
                <td className="whitespace-nowrap px-3 py-2">{observation.urineOutput}</td>
                <td className="px-3 py-2"><Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge></td>
                <td className="px-3 py-2"><StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill></td>
                <td className="min-w-[220px] px-3 py-2 text-muted-foreground">{observation.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function patientMetricsWithRhythm(patient: RapidReviewPatient) {
  const latestObservation = patientTimelineObservations(patient).at(-1);
  if (!latestObservation) return patient.metrics;
  const rhythm = pulseRhythmLabel(latestObservation);
  const risk = pulseRhythmRiskLevel(rhythm);
  const quality = pulseQualityLabel(latestObservation);
  const qualityRisk = pulseQualityRiskLevel(quality);
  const deficit = pulseDeficitChartValue(latestObservation);
  const deficitRisk = pulseDeficitRiskLevel(monitorHeartRateValue(latestObservation), latestObservation.pulse);
  const additions: RapidReviewPatient["metrics"] = [
    patient.metrics.some((metric) => metric.id === "fio2") ? null : {
      id: "fio2",
      label: "FiO2",
      value: fio2Value(latestObservation),
      zone: adultRiskZone(getRiskLevel("fio2", fio2Value(latestObservation))),
      trend: "Stable",
      note: "Inspired oxygen concentration from oxygen support.",
    },
    patient.metrics.some((metric) => metric.id === "pulse-rhythm") ? null : {
      id: "pulse-rhythm",
      label: "Pulse rhythm",
      value: rhythm,
      zone: adultRiskZone(risk),
      trend: risk === "normal" ? "Stable" : "Worsening",
      note: `${adultObservationRiskPalette[risk].label} rhythm from latest observation.`,
    },
    patient.metrics.some((metric) => metric.id === "pulse-quality") ? null : {
      id: "pulse-quality",
      label: "Pulse quality",
      value: quality,
      zone: adultRiskZone(qualityRisk),
      trend: qualityRisk === "normal" ? "Stable" : "Worsening",
      note: `${adultObservationRiskPalette[qualityRisk].label} pulse quality at ${pulseSiteLabel(latestObservation)}.`,
    },
    patient.metrics.some((metric) => metric.id === "pulse-deficit") ? null : {
      id: "pulse-deficit",
      label: "Pulse deficit",
      value: `${deficit} bpm`,
      zone: adultRiskZone(deficitRisk),
      trend: deficitRisk === "normal" || deficitRisk === "empty" ? "Stable" : "Worsening",
      note: `Monitor HR ${monitorHeartRateValue(latestObservation)} vs pulse ${latestObservation.pulse}.`,
    },
  ].filter(Boolean) as RapidReviewPatient["metrics"];
  return [...patient.metrics, ...additions];
}

function MetricTile({ metric }: { metric: RapidReviewPatient["metrics"][number] }) {
  return (
    <div className={cn("rounded-md border p-3", zonePanelClass(metric.zone))}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-medium opacity-80">{metric.label}</div>
          <div className="mt-1 text-xl font-semibold">{metric.value}{metric.unit ? <span className="ml-1 text-sm font-medium">{metric.unit}</span> : null}</div>
        </div>
        <Badge tone={rapidZoneTone(metric.zone)}>{metric.zone}</Badge>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span>{metric.trend}</span>
        <span className="truncate opacity-80">{metric.note}</span>
      </div>
    </div>
  );
}

function ResponseRulesTab({ role }: { role: Role }) {
  const [search, setSearch] = React.useState("");
  const [level, setLevel] = React.useState("All levels");

  const rules = rapidResponseRules.filter((rule) => {
    const text = `${rule.level} ${rule.title} ${rule.owner} ${rule.criteria.join(" ")} ${rule.actions.join(" ")}`;
    return includes(text, search) && (level === "All levels" || rule.level === level);
  });
  const observationRows = rapidObservationRows.filter((row) => {
    const text = `${row.metric} ${row.safe} ${row.yellow} ${row.red} ${row.purple} ${row.doctorNote}`;
    return includes(text, search);
  });

  return (
    <>
      <RapidReviewControlToggle label="Response rule controls">
        <FilterBar search={search} onSearch={setSearch} placeholder="Search response criteria, action, owner...">
          <NativeSelect label="Level" value={level} onChange={setLevel} options={["All levels", "MER Call", "MDT Review", "RN Review"]} />
        </FilterBar>
      </RapidReviewControlToggle>

      <div className="grid gap-4 xl:grid-cols-3">
        {rules.map((rule) => (
          <ResponseRuleCard key={rule.level} rule={rule} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Observation Rule Matrix</CardTitle>
            <CardDescription>Bedside thresholds and expected action from respiratory rate through pain score.</CardDescription>
          </div>
          <Badge tone="info">{observationRows.length} rules</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[1180px] border-collapse text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b border-border px-3 py-2 text-left">Observation</th>
                  <th className="border-b border-border px-3 py-2 text-left">Safe / Routine</th>
                  <th className="border-b border-border px-3 py-2 text-left">Yellow / RN Review</th>
                  <th className="border-b border-border px-3 py-2 text-left">Red / MDT Review</th>
                  <th className="border-b border-border px-3 py-2 text-left">Purple / MER Call</th>
                  <th className="border-b border-border px-3 py-2 text-left">What should happen</th>
                </tr>
              </thead>
              <tbody>
                {observationRows.length ? observationRows.map((row) => (
                  <tr key={row.metric} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 font-semibold">{row.metric}</td>
                    <td className="px-3 py-2"><RuleCell tone="success" label={row.safe} /></td>
                    <td className="px-3 py-2"><RuleCell tone="warning" label={row.yellow} /></td>
                    <td className="px-3 py-2"><RuleCell tone="danger" label={row.red} /></td>
                    <td className="px-3 py-2"><RuleCell tone="critical" label={row.purple} /></td>
                    <td className="min-w-[280px] px-3 py-2 text-muted-foreground">{row.doctorNote}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>No observation rule matched your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>GCS Score Guide</CardTitle>
              <CardDescription>Fast reference for GCS score changes during review.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="border-b border-border px-3 py-2 text-left">Score</th>
                    <th className="border-b border-border px-3 py-2 text-left">Meaning</th>
                    <th className="border-b border-border px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consciousnessScores.map((item) => (
                    <tr key={item.score} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-semibold">{item.score}</td>
                      <td className="px-3 py-2">{item.meaning}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <AlertBanner icon={ShieldAlert} tone="info" title={`Role aware for ${role}`}>
          These rules are shown as decision support. Final clinical judgement, hospital policy, and bedside assessment remain primary.
        </AlertBanner>
      </div>
    </>
  );
}

function RuleCell({ tone, label }: { tone: StatusTone; label: string }) {
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
      <Badge tone={tone}>{tone === "success" ? "Safe" : tone === "warning" ? "Yellow" : tone === "danger" ? "Red" : "Purple"}</Badge>
      <span className="text-xs leading-5 text-foreground">{label}</span>
    </div>
  );
}

function ResponseRuleCard({ rule }: { rule: (typeof rapidResponseRules)[number] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{rule.title}</CardTitle>
          <CardDescription>{rule.owner} - Target {rule.targetTime}</CardDescription>
        </div>
        <StatusPill tone={rule.tone}>{rule.level}</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Criteria</div>
          <div className="mt-2 space-y-2">
            {rule.criteria.map((item) => (
              <div key={item} className="flex gap-2 rounded-md border border-border px-3 py-2 text-xs">
                <AlertTriangle className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", toneTextClass(rule.tone))} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Actions</div>
          <div className="mt-2 space-y-2">
            {rule.actions.map((item) => (
              <div key={item} className="flex gap-2 rounded-md border border-border px-3 py-2 text-xs">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ObservationReviewDialog({
  state,
  role,
  readOnly,
  onOpenChange,
  onConfirm,
}: {
  state: ObservationReviewDialogState;
  role: Role;
  readOnly: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (observation: RapidObservationSet, update: ObservationReviewUpdate) => void;
}) {
  const patient = state?.patient ?? null;
  const observation = state?.observation ?? null;
  const [reviewStatus, setReviewStatus] = React.useState<ObservationReviewUpdate["reviewStatus"]>(observation?.responseLevel === "Routine" ? "Reviewed" : "Reviewed");
  const [reviewedBy, setReviewedBy] = React.useState(role === "Doctor" ? "Current Doctor" : role);
  const [reviewedAt, setReviewedAt] = React.useState("24 May 2026, now");
  const [doctorAction, setDoctorAction] = React.useState(observation ? defaultDoctorAction(observation) : "Continue clinical review");
  const [note, setNote] = React.useState(observation?.note ?? "");
  const [ecgRhythm, setEcgRhythm] = React.useState<RapidEcgRhythm>("Not confirmed");
  const [rhythmPlan, setRhythmPlan] = React.useState(observation ? defaultPulseRhythmPlan(observation) : "");

  if (!patient || !observation) return null;

  return (
    <DialogPrimitive.Root open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Doctor observation review</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {patient.patientName} - {patient.uhid} - {formatDateLabel(observationDateValue(observation))}, {observationTimeLabel(observation)}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close observation review dialog">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <ObservationValue label="RR" value={observation.respiratoryRate} />
                  <ObservationValue label="SpO2" value={observation.spo2} />
                  <ObservationValue label="O2 flow" value={observation.oxygenFlow} />
                  <ObservationValue label="FiO2" value={fio2Value(observation)} />
                  <ObservationValue label="BP" value={observation.bloodPressure} />
                  <ObservationValue label="Monitor HR" value={monitorHeartRateValue(observation)} />
                  <ObservationValue label="Pulse" value={observation.pulse} />
                  <ObservationValue label="Pulse deficit" value={`${pulseDeficitChartValue(observation)} bpm`} />
                  <ObservationValue label="Rhythm" value={pulseRhythmLabel(observation)} />
                  <ObservationValue label="Pulse quality" value={pulseQualityLabel(observation)} />
                  <ObservationValue label="Temp" value={observation.temperature} />
                  <ObservationValue label="GCS / Pain" value={`${gcsScoreLabel(observation.consciousness)} / ${observation.painScore}`} />
                  <ObservationValue label="Urine" value={observation.urineOutput} />
                </div>

                <AlertBanner icon={ShieldAlert} tone={rapidLevelTone(observation.responseLevel)} title={`${observation.dominantZone} zone - ${observation.responseLevel}`}>
                  Recorded by {observation.recordedBy}. Delivery method: {observation.deliveryMethod ?? "Not set"}. FiO2: {fio2Value(observation)}. Pulse source: {observation.pulseSource ?? "Manual radial pulse"} at {pulseSiteLabel(observation)}. Note: {observation.note}
                </AlertBanner>

                <div className="rounded-md border border-border bg-surface-muted p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Rhythm clinical check</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Symptoms: {observation.pulseSymptoms?.length ? observation.pulseSymptoms.join(", ") : "None recorded"}. Quality: {pulseQualityLabel(observation)}. Pulse deficit: {pulseDeficitChartValue(observation)} bpm. Nurse action: {observation.pulseActionTaken ?? "No immediate action"}.
                      </div>
                    </div>
                    <Badge tone={adultRiskTone(pulseRhythmRiskLevel(pulseRhythmLabel(observation)))}>
                      {adultObservationRiskPalette[pulseRhythmRiskLevel(pulseRhythmLabel(observation))].label}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Review status">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as ObservationReviewUpdate["reviewStatus"])} disabled={readOnly}>
                      {["Reviewed", "Escalated", "Closed", "Pending doctor review"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Reviewed by">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reviewedBy} onChange={(event) => setReviewedBy(event.target.value)} disabled={readOnly}>
                      {["Current Doctor", "Dr. Aman Verma", "Dr. Nisha Rao", "Emergency Team", "Shift Coordinator", role].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Reviewed at">
                    <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} disabled={readOnly} />
                  </FormField>
                  <FormField label="Doctor action">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={doctorAction} onChange={(event) => setDoctorAction(event.target.value)} disabled={readOnly}>
                      {["Continue routine observation", "Increase observation frequency", "Order ECG and review rhythm", "Check electrolytes", "Cardiology review", "Review oxygen and pain plan", "Start MDT review", "Escalate to MER call", "Review fluid and urine output", "Close after stable repeat"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="ECG rhythm confirmation">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={ecgRhythm} onChange={(event) => setEcgRhythm(event.target.value as RapidEcgRhythm)} disabled={readOnly}>
                      {rapidEcgRhythmOptions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Rhythm plan">
                    <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={rhythmPlan} onChange={(event) => setRhythmPlan(event.target.value)} disabled={readOnly} />
                  </FormField>
                </div>

                <FormField label="Doctor note">
                  <textarea className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={note} onChange={(event) => setNote(event.target.value)} disabled={readOnly} />
                </FormField>
              </div>

              <Card className="self-start">
                <CardHeader>
                  <div>
                    <CardTitle>Audit Context</CardTitle>
                    <CardDescription>Who entered and who reviewed.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <DetailRow label="Entered by" value={observation.recordedBy} />
                  <DetailRow label="Date" value={formatDateLabel(observationDateValue(observation))} />
                  <DetailRow label="Time" value={observationTimeLabel(observation)} />
                  <DetailRow label="Shift" value={observation.shift ?? "Not set"} />
                  <DetailRow label="Pulse source" value={observation.pulseSource ?? "Manual radial pulse"} />
                  <DetailRow label="Pulse site" value={pulseSiteLabel(observation)} />
                  <DetailRow label="Pulse quality" value={pulseQualityLabel(observation)} />
                  <DetailRow label="Monitor HR" value={monitorHeartRateValue(observation)} />
                  <DetailRow label="Pulse deficit" value={`${pulseDeficitChartValue(observation)} bpm`} />
                  <DetailRow label="Rhythm action" value={observation.pulseActionTaken ?? "No immediate action"} />
                  <DetailRow label="Zone" value={<Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>} />
                  <DetailRow label="Response" value={<StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">{readOnly ? "Read-only role cannot save doctor review." : "This review updates the date-wise observation audit in the UI."}</div>
            <div className="flex justify-end gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button disabled={readOnly} onClick={() => onConfirm(observation, { reviewStatus, reviewedBy, reviewedAt, doctorAction, note, ecgRhythm, rhythmPlan })}>
                <ClipboardCheck className="h-4 w-4" />
                Save doctor review
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ObservationValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ReviewActionDialog({
  state,
  readOnly,
  role,
  onOpenChange,
  onConfirm,
}: {
  state: DialogState | null;
  readOnly: boolean;
  role: Role;
  onOpenChange: (open: boolean) => void;
  onConfirm: (patient: RapidReviewPatient, update: ReviewUpdate) => void;
}) {
  const patient = state?.patient ?? null;
  const intent = state?.intent ?? "review";
  const initialDecision = patient ? defaultDialogDecision(patient, intent) : "Record clinical review";
  const initialStatus: RapidQueueStatus = patient ? defaultDialogStatus(patient, intent) : "Acknowledged";
  const initialNextObservation = patient ? defaultNextObservation(patient.responseLevel) : "Repeat observations every 15 minutes";
  const [decision, setDecision] = React.useState(initialDecision);
  const [status, setStatus] = React.useState<RapidQueueStatus>(initialStatus);
  const [nextObservation, setNextObservation] = React.useState(initialNextObservation);
  const [owner, setOwner] = React.useState(patient?.owner ?? "");
  const [note, setNote] = React.useState(patient?.trigger ?? "");

  if (!patient) return null;

  return (
    <DialogPrimitive.Root open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Rapid review action</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {patient.patientName} - {patient.uhid} - {patient.bed}, {patient.ward}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close rapid review dialog">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <AlertBanner icon={ShieldAlert} tone={rapidLevelTone(patient.responseLevel)} title={patient.responseLevel}>
                  {patient.trigger}
                </AlertBanner>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Decision">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={decision} onChange={(event) => setDecision(event.target.value)} disabled={readOnly}>
                      {["Record clinical review", "Record observation review", "Start MDT review", "Escalate to MDT review", "Place MER call", "Continue routine observation", "Close after stable repeat"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Queue status">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={status} onChange={(event) => setStatus(event.target.value as RapidQueueStatus)} disabled={readOnly}>
                      {["In review", "Acknowledged", "Escalated", "Closed"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Owner">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={owner} onChange={(event) => setOwner(event.target.value)} disabled={readOnly}>
                      {[patient.owner, patient.consultant, "Emergency Team", "Shift Coordinator", role].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Next observations">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={nextObservation} onChange={(event) => setNextObservation(event.target.value)} disabled={readOnly}>
                      {["Continuous or every 5 minutes", "Repeat observations every 15 minutes", "Repeat observations every 30 minutes", "Repeat observations every 1 hour", "Routine ward frequency"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label="Clinical note">
                  <textarea
                    className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={readOnly}
                  />
                </FormField>

                <div className="rounded-md border border-border">
                  <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Latest observations</div>
                  <div className="grid gap-2 p-3 sm:grid-cols-2">
                    {patientMetricsWithRhythm(patient).map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between gap-2 rounded-md bg-surface-muted px-3 py-2 text-xs">
                        <span className="font-medium">{metric.label}</span>
                        <span className="flex items-center gap-2">
                          {metric.value}{metric.unit ? ` ${metric.unit}` : ""}
                          <Badge tone={rapidZoneTone(metric.zone)}>{metric.zone}</Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <MultiObservationTable
                  patient={patient}
                  title="Multi Observation Trend"
                  description="Previous readings are available before saving the review action."
                  compact
                />
              </div>

              <div className="space-y-3">
                <div className="rounded-md border border-border bg-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Patient context</div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="font-semibold">{patient.patientName}</div>
                    <div className="text-xs text-muted-foreground">{patient.ageGender}</div>
                    <div className="text-xs text-muted-foreground">{patient.visitNo}</div>
                  </div>
                </div>
                <DetailRow label="Consultant" value={patient.consultant} />
                <DetailRow label="Urine" value={patient.urineOutput} />
                <DetailRow label="Due" value={patient.reviewDue} />
                <div className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Actions
                  </div>
                  <div className="space-y-2">
                    {patient.recommendedActions.map((action) => (
                      <div key={action} className="text-xs leading-5 text-muted-foreground">{action}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {readOnly ? "Read-only role. Switch to Doctor, Nurse, or Admin to save." : "Action will be added to the static review audit trail."}
            </div>
            <div className="flex justify-end gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button
                disabled={readOnly}
                onClick={() => onConfirm(patient, { status, decision, note, owner, nextObservation, updatedAt: "Just now" })}
              >
                <ClipboardCheck className="h-4 w-4" />
                Save review
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function defaultDialogDecision(patient: RapidReviewPatient, intent: DialogState["intent"]) {
  if (intent === "escalate") return patient.responseLevel === "MER Call" ? "Place MER call" : "Escalate to MDT review";
  if (intent === "observe") return "Record observation review";
  return "Record clinical review";
}

function defaultDialogStatus(patient: RapidReviewPatient, intent: DialogState["intent"]): RapidQueueStatus {
  if (intent === "escalate") return "Escalated";
  if (patient.responseLevel === "Routine") return "Closed";
  return "Acknowledged";
}

function defaultNextObservation(level: RapidResponseLevel) {
  if (level === "MER Call") return "Continuous or every 5 minutes";
  if (level === "MDT Review") return "Repeat observations every 15 minutes";
  return "Repeat observations every 30 minutes";
}

function createInitialClinicalConsultRequests(patients: RapidReviewPatient[]): ClinicalConsultRequest[] {
  const emergencyPatient = patients.find((patient) => patient.responseLevel === "MER Call") ?? patients[0];
  const dialysisPatient = patients.find((patient) => patient.trigger.toLowerCase().includes("dialysis")) ?? patients.find((patient) => patient.responseLevel === "MDT Review") ?? patients[1];
  const requests: ClinicalConsultRequest[] = [];

  if (emergencyPatient) {
    const observation = emergencyPatient.observationHistory.at(-1);
    requests.push({
      id: `consult-${emergencyPatient.id}-cardiology-seed`,
      patientId: emergencyPatient.id,
      observationId: observation?.id,
      patientName: emergencyPatient.patientName,
      uhid: emergencyPatient.uhid,
      location: `${emergencyPatient.bed}, ${emergencyPatient.ward}`,
      date: observation ? observationDateValue(observation) : todayDateValue(),
      time: observation ? observationTimeLabel(observation) : "23:00",
      requestedBy: "Current Doctor",
      department: "Cardiology",
      requestedTo: "On-call cardiologist",
      priority: "Emergency",
      requestType: "Bedside review",
      investigation: "ECG",
      responseTarget: "Immediate / 5 min",
      clinicalQuestion: defaultClinicalQuestion(emergencyPatient, observation),
      handoffSummary: defaultClinicalHandoff(emergencyPatient, observation),
      status: "Requested",
      lastUpdated: "Just now",
      events: [createClinicalConsultEvent("Requested", "Consult requested", "Current Doctor", "Cardiology emergency bedside review requested.")],
    });
  }

  if (dialysisPatient) {
    const observation = dialysisPatient.observationHistory.at(-1);
    requests.push({
      id: `consult-${dialysisPatient.id}-renal-seed`,
      patientId: dialysisPatient.id,
      observationId: observation?.id,
      patientName: dialysisPatient.patientName,
      uhid: dialysisPatient.uhid,
      location: `${dialysisPatient.bed}, ${dialysisPatient.ward}`,
      date: observation ? observationDateValue(observation) : todayDateValue(),
      time: observation ? observationTimeLabel(observation) : "17:00",
      requestedBy: "Current Doctor",
      department: "Nephrology",
      requestedTo: "On-call nephrologist",
      priority: "Urgent",
      requestType: "Investigation review",
      investigation: "Dialysis review",
      responseTarget: "Within 30 min",
      clinicalQuestion: defaultClinicalQuestion(dialysisPatient, observation),
      handoffSummary: defaultClinicalHandoff(dialysisPatient, observation),
      status: "Acknowledged",
      advice: "Review potassium, fluid balance, and dialysis timing before next shift.",
      lastUpdated: "10 min ago",
      events: [
        createClinicalConsultEvent("Requested", "Consult requested", "Current Doctor", "Nephrology dialysis review requested."),
        createClinicalConsultEvent("Acknowledged", "Request acknowledged", "On-call nephrologist", "Nephrology team acknowledged the request."),
      ],
    });
  }

  return requests;
}

function buildClinicalConsultRequest({
  patient,
  observation,
  role,
  department,
  requestedTo,
  priority,
  requestType,
  investigation,
  responseTarget,
  clinicalQuestion,
  handoffSummary,
}: {
  patient: RapidReviewPatient;
  observation?: RapidObservationSet;
  role: Role;
  department: string;
  requestedTo: string;
  priority: ClinicalConsultPriority;
  requestType: string;
  investigation: string;
  responseTarget: string;
  clinicalQuestion: string;
  handoffSummary: string;
}): ClinicalConsultRequest {
  return {
    id: `consult-${patient.id}-${observation?.id ?? "patient"}-${Date.now()}`,
    patientId: patient.id,
    observationId: observation?.id,
    patientName: patient.patientName,
    uhid: patient.uhid,
    location: `${patient.bed}, ${patient.ward}`,
    date: todayDateValue(),
    time: currentTimeValue(),
    requestedBy: role === "Doctor" ? "Current Doctor" : role,
    department,
    requestedTo,
    priority,
    requestType,
    investigation,
    responseTarget,
    clinicalQuestion,
    handoffSummary,
    status: "Requested",
    lastUpdated: "Just now",
    events: [createClinicalConsultEvent("Requested", "Consult requested", role === "Doctor" ? "Current Doctor" : role, `Request sent to ${requestedTo}.`)],
  };
}

function createClinicalConsultEvent(status: ClinicalConsultStatus, action: string, actor: string, note: string): ClinicalConsultEvent {
  return {
    id: `consult-event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status,
    action,
    actor,
    at: `${formatDateLabel(todayDateValue())}, ${currentTimeValue()}`,
    note,
  };
}

function appendClinicalConsultEvent(
  request: ClinicalConsultRequest,
  status: ClinicalConsultStatus,
  action: string,
  actor: string,
  note: string,
): ClinicalConsultRequest {
  return {
    ...request,
    events: [...request.events, createClinicalConsultEvent(status, action, actor, note)],
  };
}

function clinicalConsultStatusActionText(status: ClinicalConsultStatus) {
  if (status === "Acknowledged") return "Request acknowledged";
  if (status === "Assigned") return "Doctor assigned";
  if (status === "In progress") return "Consult started";
  if (status === "Advice given") return "Advice given";
  if (status === "Completed") return "Consult completed";
  if (status === "Escalated") return "Consult escalated";
  return "Consult requested";
}

function clinicalConsultStatusEventNote(status: ClinicalConsultStatus, request: ClinicalConsultRequest) {
  if (status === "Acknowledged") return `${request.requestedTo} acknowledged the consult request.`;
  if (status === "Assigned") return `${request.requestedTo} is assigned as consult owner.`;
  if (status === "In progress") return `${request.requestedTo} started consult review.`;
  if (status === "Advice given") return request.advice ?? `Advice recorded by ${request.requestedTo}.`;
  if (status === "Completed") return "Consult closed after advice/action was accepted.";
  if (status === "Escalated") return "Consult escalated due to clinical priority or delay.";
  return "Consult request created.";
}

function defaultClinicalConsultDepartment(patient: RapidReviewPatient, observation?: RapidObservationSet) {
  const trigger = patient.trigger.toLowerCase();
  const rhythm = observation ? pulseRhythmLabel(observation) : "Regular";
  const spo2 = observation ? parsePercentValue(observation.spo2) : null;
  const oxygenFlow = observation ? oxygenFlowChartValue(observation) : 0;
  if (patient.responseLevel === "MER Call") return "ICU / Anaesthesia";
  if (["AF", "SVT", "VT", "VF", "Complete heart block", "Irregularly irregular"].includes(rhythm)) return "Cardiology";
  if (trigger.includes("dialysis") || trigger.includes("urine") || trigger.includes("renal")) return "Nephrology";
  if ((spo2 !== null && spo2 < 94) || Number(oxygenFlow) >= 6 || trigger.includes("oxygen") || trigger.includes("respiratory")) return "Pulmonology";
  if (trigger.includes("ct") || trigger.includes("x-ray") || trigger.includes("scan")) return "Radiology";
  return "Medicine";
}

function defaultClinicalConsultPriority(patient: RapidReviewPatient, observation?: RapidObservationSet): ClinicalConsultPriority {
  if (patient.responseLevel === "MER Call" || observation?.dominantZone === "Purple") return "Emergency";
  if (patient.responseLevel === "MDT Review" || observation?.dominantZone === "Red") return "Urgent";
  return "Routine";
}

function defaultClinicalConsultType(patient: RapidReviewPatient, observation?: RapidObservationSet) {
  if (patient.responseLevel === "MER Call" || observation?.dominantZone === "Purple") return "Bedside review";
  if (defaultClinicalConsultInvestigation(patient, observation) !== "None") return "Investigation review";
  return "Phone advice";
}

function defaultClinicalConsultInvestigation(patient: RapidReviewPatient, observation?: RapidObservationSet) {
  const department = defaultClinicalConsultDepartment(patient, observation);
  const trigger = patient.trigger.toLowerCase();
  if (department === "Cardiology") return "ECG";
  if (department === "Pulmonology" || trigger.includes("oxygen")) return "ABG";
  if (department === "Nephrology" || trigger.includes("dialysis")) return "Dialysis review";
  if (department === "Radiology") return "CT review";
  return "None";
}

function defaultClinicalConsultResponseTarget(priority: ClinicalConsultPriority) {
  if (priority === "Emergency") return "Immediate / 5 min";
  if (priority === "Urgent") return "Within 30 min";
  return "Today";
}

function defaultClinicalQuestion(patient: RapidReviewPatient, observation?: RapidObservationSet) {
  const rhythm = observation ? ` Rhythm ${pulseRhythmLabel(observation)}.` : "";
  return `${patient.responseLevel} patient needs ${defaultClinicalConsultDepartment(patient, observation)} input for ${patient.trigger}.${rhythm}`;
}

function defaultClinicalHandoff(patient: RapidReviewPatient, observation?: RapidObservationSet) {
  if (!observation) return `${patient.patientName}, ${patient.uhid}, ${patient.bed}, ${patient.ward}. Trigger: ${patient.trigger}.`;
  return [
    `${patient.patientName}, ${patient.uhid}, ${patient.bed}, ${patient.ward}.`,
    `Trigger: ${patient.trigger}.`,
    `Vitals ${formatDateLabel(observationDateValue(observation))} ${observationTimeLabel(observation)}: RR ${observation.respiratoryRate}, SpO2 ${observation.spo2}, O2 ${observation.oxygenFlow}, BP ${observation.bloodPressure}, pulse ${observation.pulse}, rhythm ${pulseRhythmLabel(observation)}, temp ${observation.temperature}, GCS ${gcsScoreLabel(observation.consciousness)}, pain ${observation.painScore}.`,
    `Response: ${observation.responseLevel}, zone ${observation.dominantZone}.`,
  ].join(" ");
}

function clinicalConsultSortValue(request: ClinicalConsultRequest) {
  return `${request.date}T${request.time}`;
}

function clinicalConsultStatusMatches(request: ClinicalConsultRequest, filter: string) {
  if (filter === "All status") return true;
  if (filter === "Open consults") return request.status !== "Completed";
  if (filter === "Delayed") return clinicalConsultIsDelayed(request);
  return request.status === filter;
}

function sortClinicalConsults(a: ClinicalConsultRequest, b: ClinicalConsultRequest, sortBy: string) {
  if (sortBy === "Oldest request") return clinicalConsultSortValue(a).localeCompare(clinicalConsultSortValue(b));
  if (sortBy === "Newest request") return clinicalConsultSortValue(b).localeCompare(clinicalConsultSortValue(a));
  if (sortBy === "Department") return a.department.localeCompare(b.department) || clinicalConsultSortValue(b).localeCompare(clinicalConsultSortValue(a));
  if (sortBy === "Status") return a.status.localeCompare(b.status) || clinicalConsultSortValue(b).localeCompare(clinicalConsultSortValue(a));
  return clinicalConsultPriorityRank(b) - clinicalConsultPriorityRank(a) || Number(clinicalConsultIsDelayed(b)) - Number(clinicalConsultIsDelayed(a)) || clinicalConsultSortValue(a).localeCompare(clinicalConsultSortValue(b));
}

function clinicalConsultPriorityRank(request: ClinicalConsultRequest) {
  const priorityRank: Record<ClinicalConsultPriority, number> = { Routine: 1, Urgent: 2, Emergency: 3 };
  const statusBoost = clinicalConsultIsDelayed(request) ? 2 : 0;
  const openBoost = request.status === "Completed" ? 0 : 1;
  return priorityRank[request.priority] + statusBoost + openBoost;
}

function clinicalConsultIsDelayed(request: ClinicalConsultRequest) {
  if (request.status === "Completed" || request.status === "Advice given") return false;
  if (request.priority === "Emergency" && request.status === "Requested") return true;
  return clinicalConsultElapsedMinutes(request) > clinicalConsultTargetMinutes(request.responseTarget);
}

function clinicalConsultDueLabel(request: ClinicalConsultRequest) {
  const remaining = clinicalConsultTargetMinutes(request.responseTarget) - clinicalConsultElapsedMinutes(request);
  if (request.status === "Completed") return "Closed";
  if (request.status === "Advice given") return "Advice received";
  if (remaining <= 0) return "Due now";
  return `${remaining} min remaining`;
}

function clinicalConsultPrimaryAction(request: ClinicalConsultRequest): {
  help: string;
  label: string;
  nextStatus: ClinicalConsultStatus | null;
  variant: "default" | "outline" | "danger";
} {
  if (request.status === "Requested") {
    return {
      help: "Receiving doctor should confirm the request first.",
      label: "Acknowledge",
      nextStatus: "Acknowledged",
      variant: "default",
    };
  }
  if (request.status === "Acknowledged") {
    return {
      help: "Assign responsibility before clinical work starts.",
      label: "Assign",
      nextStatus: "Assigned",
      variant: "default",
    };
  }
  if (request.status === "Assigned") {
    return {
      help: "Mark when the consult review has started.",
      label: "Start review",
      nextStatus: "In progress",
      variant: "default",
    };
  }
  if (request.status === "In progress") {
    return {
      help: "Record consult advice for the requesting team.",
      label: "Add advice",
      nextStatus: "Advice given",
      variant: "default",
    };
  }
  if (request.status === "Advice given" || request.status === "Escalated") {
    return {
      help: "Close after advice/action has been accepted.",
      label: "Complete",
      nextStatus: "Completed",
      variant: "outline",
    };
  }
  return {
    help: "Consult workflow is closed.",
    label: "Completed",
    nextStatus: null,
    variant: "outline",
  };
}

function clinicalConsultStatusMeaning(status: ClinicalConsultStatus) {
  if (status === "Requested") return "Request sent. Waiting for receiving doctor to confirm.";
  if (status === "Acknowledged") return "Receiving team has seen it. Assignment is pending.";
  if (status === "Assigned") return "Specific doctor/team owns the consult.";
  if (status === "In progress") return "Consult review is actively being worked on.";
  if (status === "Advice given") return "Consultant advice is available for the requesting team.";
  if (status === "Completed") return "Consult has been closed after advice/action.";
  return "Escalated to higher clinical priority or backup team.";
}

function clinicalConsultElapsedMinutes(request: ClinicalConsultRequest) {
  const relativeMatch = request.lastUpdated.match(/(\d+)\s*min ago/i);
  if (relativeMatch) return Number(relativeMatch[1]);
  if (request.lastUpdated.toLowerCase().includes("reminder sent")) return 1;
  const requestDate = request.date;
  const today = todayDateValue();
  if (requestDate < today) return 24 * 60;
  if (requestDate > today) return 0;
  const requestMinutes = timeToMinutes(request.time);
  const nowMinutes = timeToMinutes(currentTimeValue());
  if (requestMinutes === null || nowMinutes === null) return 0;
  return Math.max(0, nowMinutes - requestMinutes);
}

function clinicalConsultTargetMinutes(target: string) {
  if (target.includes("Immediate")) return 5;
  if (target.includes("15")) return 15;
  if (target.includes("30")) return 30;
  if (target.includes("1 hour")) return 60;
  if (target.includes("Same shift")) return 240;
  return 8 * 60;
}

function nextClinicalConsultStatus(status: ClinicalConsultStatus): ClinicalConsultStatus | null {
  if (status === "Requested") return "Acknowledged";
  if (status === "Acknowledged") return "Assigned";
  if (status === "Assigned") return "In progress";
  if (status === "In progress") return "Advice given";
  if (status === "Advice given" || status === "Escalated") return "Completed";
  return null;
}

function clinicalConsultPriorityTone(priority: ClinicalConsultPriority): StatusTone {
  if (priority === "Emergency") return "critical";
  if (priority === "Urgent") return "danger";
  return "info";
}

function clinicalConsultStatusTone(status: ClinicalConsultStatus): StatusTone {
  if (status === "Escalated") return "critical";
  if (status === "Requested") return "info";
  if (status === "Acknowledged" || status === "Assigned" || status === "In progress") return "warning";
  if (status === "Advice given") return "success";
  return "muted";
}

function currentTimeValue() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

function createObservationDraftFromObservation(patientId: string, observation: RapidObservationSet): ObservationDraft {
  const [systolic = "", diastolic = ""] = observation.bloodPressure.split("/");
  return {
    patientId,
    observationDate: observationDateValue(observation),
    observationTime: observationTimeLabel(observation),
    recordedBy: observation.recordedBy,
    shift: observation.shift ?? "Morning",
    respiratoryRate: numericText(observation.respiratoryRate),
    spo2: numericText(observation.spo2),
    oxygenFlow: numericText(observation.oxygenFlow),
    fio2: numericText(fio2Value(observation)) || "21",
    deliveryMethod: observation.deliveryMethod ?? "Room air",
    systolic: numericText(systolic),
    diastolic: numericText(diastolic),
    pulse: numericText(observation.pulse),
    monitorHeartRate: numericText(monitorHeartRateValue(observation)),
    pulseRhythm: pulseRhythmLabel(observation),
    pulseSource: observation.pulseSource ?? "Manual radial pulse",
    pulseSite: pulseSiteLabel(observation),
    pulseQuality: pulseQualityLabel(observation),
    pulseSymptoms: observation.pulseSymptoms ?? [],
    pulseActionTaken: observation.pulseActionTaken ?? "No immediate action",
    temperature: numericText(observation.temperature),
    consciousness: numericText(observation.consciousness),
    painScore: numericText(observation.painScore),
    urineOutput: numericText(observation.urineOutput),
    note: observation.note,
  };
}

function createObservationDraft(patientId: string): ObservationDraft {
  return {
    patientId,
    observationDate: "2026-05-27",
    observationTime: "17:30",
    recordedBy: "Ward Nurse",
    shift: "Evening",
    respiratoryRate: "20",
    spo2: "97",
    oxygenFlow: "0",
    fio2: "21",
    deliveryMethod: "Room air",
    systolic: "120",
    diastolic: "80",
    pulse: "86",
    monitorHeartRate: "86",
    pulseRhythm: "Regular",
    pulseSource: "Manual radial pulse",
    pulseSite: "Radial",
    pulseQuality: "Normal",
    pulseSymptoms: [],
    pulseActionTaken: "No immediate action",
    temperature: "37.0",
    consciousness: "0",
    painScore: "2",
    urineOutput: "60",
    note: "Routine bedside observation recorded by nurse.",
  };
}

function buildObservationPreview(draft: ObservationDraft) {
  const dominantZone = maxZone([
    respiratoryRateZone(toNumber(draft.respiratoryRate)),
    spo2Zone(toNumber(draft.spo2)),
    fio2Zone(toNumber(draft.fio2)),
    systolicBpZone(toNumber(draft.systolic)),
    pulseZone(toNumber(draft.pulse)),
    pulseZone(toNumber(draft.monitorHeartRate)),
    pulseDeficitZone(draft.monitorHeartRate, draft.pulse),
    pulseRhythmZone(draft.pulseRhythm),
    pulseQualityZone(draft.pulseQuality),
    temperatureZone(toNumber(draft.temperature)),
    consciousnessZone(toNumber(draft.consciousness)),
    painZone(toNumber(draft.painScore)),
    urineZone(toNumber(draft.urineOutput)),
  ]);

  return {
    dominantZone,
    responseLevel: responseFromZone(dominantZone),
  };
}

function buildObservationFromDraft(draft: ObservationDraft, observationId?: string): RapidObservationSet {
  const preview = buildObservationPreview(draft);
  const routine = preview.responseLevel === "Routine";
  return {
    id: observationId ?? `obs-${draft.patientId}-${Date.now()}`,
    observationDate: draft.observationDate,
    recordedAt: `${formatDateLabel(draft.observationDate)}, ${draft.observationTime}`,
    recordedBy: draft.recordedBy,
    shift: draft.shift,
    respiratoryRate: draft.respiratoryRate,
    spo2: `${draft.spo2}%`,
    oxygenFlow: `${draft.oxygenFlow || "0"} L/min`,
    fio2: `${draft.fio2 || "21"}%`,
    deliveryMethod: draft.deliveryMethod,
    bloodPressure: `${draft.systolic}/${draft.diastolic}`,
    pulse: draft.pulse,
    monitorHeartRate: draft.monitorHeartRate,
    pulseRhythm: draft.pulseRhythm,
    pulseSource: draft.pulseSource,
    pulseSite: draft.pulseSite,
    pulseQuality: draft.pulseQuality,
    pulseSymptoms: draft.pulseSymptoms,
    pulseActionTaken: draft.pulseActionTaken,
    temperature: `${draft.temperature} deg C`,
    consciousness: draft.consciousness,
    painScore: `${draft.painScore}/10`,
    urineOutput: `${draft.urineOutput || "0"} ml/hr`,
    dominantZone: preview.dominantZone,
    responseLevel: preview.responseLevel,
    reviewStatus: routine ? "Reviewed" : "Pending doctor review",
    reviewedBy: routine ? "Auto screening" : undefined,
    reviewedAt: routine ? "Same time" : undefined,
    doctorAction: routine ? "Continue routine observation" : "Doctor review pending",
    note: draft.note,
  };
}

function buildNurseUpdatedObservationFromDraft(draft: ObservationDraft, original: RapidObservationSet, wasDoctorReviewed: boolean): RapidObservationSet {
  const updated = buildObservationFromDraft(draft, original.id);
  if (!wasDoctorReviewed) return updated;

  return {
    ...updated,
    reviewStatus: "Pending doctor review",
    reviewedBy: undefined,
    reviewedAt: undefined,
    doctorAction: "Nurse amendment saved - doctor re-review pending",
  };
}

function createNurseObservationAuditItem(
  action: NurseObservationAuditAction,
  patient: RapidReviewPatient,
  observation: RapidObservationSet,
  options: {
    performedBy: string;
    reason: string;
    summary: string;
    previousObservation?: RapidObservationSet;
    newObservation?: RapidObservationSet;
  },
): NurseObservationAuditItem {
  return {
    id: `nurse-audit-${observation.id}-${Date.now()}`,
    observationId: observation.id,
    patientId: patient.id,
    patientName: patient.patientName,
    date: todayDateValue(),
    time: currentTimeValue(),
    action,
    performedBy: options.performedBy,
    reason: options.reason,
    summary: options.summary,
    previousSummary: options.previousObservation ? nurseObservationAuditSummary(options.previousObservation) : undefined,
    newSummary: options.newObservation ? nurseObservationAuditSummary(options.newObservation) : undefined,
  };
}

function nurseObservationAuditSummary(observation: RapidObservationSet) {
  return `RR ${observation.respiratoryRate}, SpO2 ${observation.spo2}, BP ${observation.bloodPressure}, Pulse ${observation.pulse}, ${observation.responseLevel}`;
}

function nurseObservationStatus(
  observation: RapidObservationSet,
  reviews: Record<string, ObservationReviewUpdate>,
  voidedObservations: Record<string, NurseObservationVoid>,
  editedObservationIds: Set<string>,
): NurseObservationStatus {
  if (voidedObservations[observation.id]) return "Voided";
  if (editedObservationIds.has(observation.id)) return "Edited";
  if (observationReviewStatus(observation, reviews) !== "Pending doctor review") return "Doctor reviewed";
  return "Active";
}

function nurseObservationStatusTone(status: NurseObservationStatus): StatusTone {
  if (status === "Active") return "success";
  if (status === "Edited") return "warning";
  if (status === "Voided") return "danger";
  return "info";
}

function nurseAuditActionTone(action: NurseObservationAuditAction): StatusTone {
  if (action === "Created") return "success";
  if (action === "Edited") return "warning";
  return "danger";
}

function numericText(value: string | number | undefined) {
  const match = String(value ?? "").match(/-?\d+(\.\d+)?/);
  return match?.[0] ?? "";
}

function toNumber(value: string) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function parsePercentValue(value: string | number | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = String(value ?? "").match(/\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

const zoneRank: Record<RapidZone, number> = { Safe: 1, Yellow: 2, Red: 3, Purple: 4 };

function maxZone(zones: RapidZone[]) {
  return zones.reduce<RapidZone>((highest, zone) => (zoneRank[zone] > zoneRank[highest] ? zone : highest), "Safe");
}

function responseFromZone(zone: RapidZone): RapidResponseLevel {
  if (zone === "Purple") return "MER Call";
  if (zone === "Red") return "MDT Review";
  if (zone === "Yellow") return "RN Review";
  return "Routine";
}

function respiratoryRateZone(value: number): RapidZone {
  if (value <= 5 || value >= 36) return "Purple";
  if ((value >= 6 && value <= 8) || (value >= 25 && value <= 35)) return "Red";
  if ((value >= 9 && value <= 11) || (value >= 21 && value <= 24)) return "Yellow";
  return "Safe";
}

function spo2Zone(value: number): RapidZone {
  if (value < 90) return "Purple";
  if (value <= 92) return "Red";
  if (value <= 94) return "Yellow";
  return "Safe";
}

function fio2Zone(value: number): RapidZone {
  if (value >= 80) return "Purple";
  if (value >= 60) return "Red";
  if (value >= 25) return "Yellow";
  return "Safe";
}

function systolicBpZone(value: number): RapidZone {
  if (value < 70) return "Purple";
  if ((value >= 70 && value <= 79) || value >= 200) return "Red";
  if ((value >= 80 && value <= 89) || (value >= 181 && value <= 199)) return "Yellow";
  return "Safe";
}

function pulseZone(value: number): RapidZone {
  if (value < 30 || value > 140) return "Purple";
  if ((value >= 30 && value <= 39) || (value >= 121 && value <= 140)) return "Red";
  if ((value >= 40 && value <= 49) || (value >= 111 && value <= 120)) return "Yellow";
  return "Safe";
}

function pulseRhythmZone(value: RapidPulseRhythm): RapidZone {
  const risk = pulseRhythmRiskLevel(value);
  if (risk === "critical") return "Purple";
  if (risk === "highRisk") return "Red";
  if (risk === "warning") return "Yellow";
  return "Safe";
}

function pulseQualityZone(value: RapidPulseQuality): RapidZone {
  const risk = pulseQualityRiskLevel(value);
  if (risk === "critical") return "Purple";
  if (risk === "highRisk") return "Red";
  if (risk === "warning") return "Yellow";
  return "Safe";
}

function pulseDeficitZone(monitorHeartRate: string, pulseRate: string): RapidZone {
  const risk = pulseDeficitRiskLevel(monitorHeartRate, pulseRate);
  if (risk === "critical") return "Purple";
  if (risk === "highRisk") return "Red";
  if (risk === "warning") return "Yellow";
  return "Safe";
}

function temperatureZone(value: number): RapidZone {
  if (value <= 35 || value >= 39) return "Red";
  if ((value > 35 && value <= 36) || (value >= 38 && value < 39)) return "Yellow";
  return "Safe";
}

function consciousnessZone(value: number): RapidZone {
  if (value >= 3) return "Purple";
  if (value === 2) return "Red";
  if (value === 1) return "Yellow";
  return "Safe";
}

function painZone(value: number): RapidZone {
  if (value >= 7) return "Yellow";
  return "Safe";
}

function urineZone(value: number): RapidZone {
  if (value > 0 && value < 30) return "Red";
  return "Safe";
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function patientTimelineObservations(patient: RapidReviewPatient) {
  return [...patient.observationHistory].sort((a, b) => observationDateTimeSortValue(a).localeCompare(observationDateTimeSortValue(b)));
}

function patientTimelineSummary(patient: RapidReviewPatient, reviews: Record<string, ObservationReviewUpdate>): PatientTimelineSummary {
  const observations = patientTimelineObservations(patient);
  const latest = observations.at(-1);
  const firstWarning = observations.find((observation) => observation.responseLevel !== "Routine" || observation.dominantZone !== "Safe");
  const firstHighRisk = observations.find((observation) => observation.responseLevel === "MDT Review" || observation.responseLevel === "MER Call" || observation.dominantZone === "Red" || observation.dominantZone === "Purple");
  const peak = [...observations].sort((a, b) => observationRiskRank(b) - observationRiskRank(a) || observationDateTimeSortValue(b).localeCompare(observationDateTimeSortValue(a)))[0];
  const pendingCount = observations.filter((observation) => observationReviewStatus(observation, reviews) === "Pending doctor review").length;

  return {
    latest,
    firstWarning,
    firstHighRisk,
    peak,
    reviewedCount: observations.length - pendingCount,
    pendingCount,
  };
}

function timelineChangeLabel(observation: RapidObservationSet, previous?: RapidObservationSet) {
  if (!previous) return "Baseline";
  const currentRank = observationRiskRank(observation);
  const previousRank = observationRiskRank(previous);
  if (currentRank > previousRank) return "Worsening";
  if (currentRank < previousRank) return "Improving";
  return "Stable";
}

function observationRiskRank(observation: RapidObservationSet) {
  return rapidPriorityRank(observation.responseLevel) * 10 + zoneSeverityRank(observation.dominantZone);
}

function zoneSeverityRank(zone: RapidZone) {
  if (zone === "Purple") return 4;
  if (zone === "Red") return 3;
  if (zone === "Yellow") return 2;
  return 1;
}

function paginationPages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

function observationDateCounts(rows: ObservationLogRow[]) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const date = observationDateValue(row.observation);
    counts[date] = (counts[date] ?? 0) + 1;
    return counts;
  }, {});
}

function observationMatchesDateFilter(
  observation: RapidObservationSet,
  mode: string,
  selectedDates: string[],
  singleDate: string,
  dateFrom: string,
  dateTo: string,
  latestDataDate: string,
) {
  return observationMatchesDateValue(observationDateValue(observation), mode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate);
}

function observationMatchesTimeFilter(observation: RapidObservationSet, mode: string, timeFrom: string, timeTo: string) {
  const minutes = observationTimeMinutes(observation);
  if (minutes === null) return true;
  if (mode === "All times") return true;
  if (mode === "Morning 06-13") return minutesWithinRange(minutes, 6 * 60, 13 * 60 + 59);
  if (mode === "Afternoon 14-17") return minutesWithinRange(minutes, 14 * 60, 17 * 60 + 59);
  if (mode === "Evening 18-21") return minutesWithinRange(minutes, 18 * 60, 21 * 60 + 59);
  if (mode === "Night 22-05") return minutesWithinRange(minutes, 22 * 60, 5 * 60 + 59);
  if (mode === "Business hours") return minutesWithinRange(minutes, 9 * 60, 17 * 60 + 59);
  if (mode === "Custom time range") {
    const from = timeToMinutes(timeFrom);
    const to = timeToMinutes(timeTo);
    if (from === null && to === null) return true;
    if (from !== null && to === null) return minutes >= from;
    if (from === null && to !== null) return minutes <= to;
    if (from === to) return true;
    return minutesWithinRange(minutes, from ?? 0, to ?? 0);
  }
  return true;
}

function observationMatchesDateValue(
  date: string,
  mode: string,
  selectedDates: string[],
  singleDate: string,
  dateFrom: string,
  dateTo: string,
  latestDataDate: string,
) {
  const today = todayDateValue();
  if (mode === "All dates") return true;
  if (mode === "Latest record date") return Boolean(latestDataDate) && date === latestDataDate;
  if (mode === "Today") return date === todayDateValue();
  if (mode === "Yesterday") return date === addDaysToDateValue(today, -1);
  if (mode === "Last 24 hours") return dateWithinRange(date, addDaysToDateValue(today, -1), today);
  if (mode === "Last 48 hours") return dateWithinRange(date, addDaysToDateValue(today, -2), today);
  if (mode === "Last 7 days") return dateWithinRange(date, addDaysToDateValue(today, -6), today);
  if (mode === "Last 30 days") return dateWithinRange(date, addDaysToDateValue(today, -29), today);
  if (mode === "This week") return dateWithinRange(date, startOfWeekDateValue(today), today);
  if (mode === "Last week") return dateWithinRange(date, addDaysToDateValue(startOfWeekDateValue(today), -7), addDaysToDateValue(startOfWeekDateValue(today), -1));
  if (mode === "This month") return dateWithinRange(date, startOfMonthDateValue(today), today);
  if (mode === "Last month") return dateWithinRange(date, startOfPreviousMonthDateValue(today), endOfPreviousMonthDateValue(today));
  if (mode === "Single date") return singleDate ? date === singleDate : true;
  if (mode === "Specific dates") return selectedDates.length === 0 || selectedDates.includes(date);
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return false;
    const afterFrom = !dateFrom || date >= dateFrom;
    const beforeTo = !dateTo || date <= dateTo;
    return afterFrom && beforeTo;
  }
  return true;
}

function dateFilterSummary(mode: string, selectedDates: string[], singleDate: string, dateFrom: string, dateTo: string, latestDataDate: string) {
  if (mode === "Latest record date") return latestDataDate ? formatDateLabel(latestDataDate) : "Latest record date";
  if (mode === "Single date") return singleDate ? formatDateLabel(singleDate) : "Single date";
  if (mode === "Specific dates") return selectedDates.length ? `${selectedDates.length} specific dates` : "All specific dates";
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return "Invalid date range";
    if (dateFrom && dateTo) return `${formatDateLabel(dateFrom)} to ${formatDateLabel(dateTo)}`;
    if (dateFrom) return `From ${formatDateLabel(dateFrom)}`;
    if (dateTo) return `Until ${formatDateLabel(dateTo)}`;
    return "Custom range";
  }
  return mode;
}

function timeFilterSummary(mode: string, timeFrom: string, timeTo: string) {
  if (mode === "Custom time range") {
    if (timeFrom && timeTo) return `${timeFrom} to ${timeTo}`;
    if (timeFrom) return `From ${timeFrom}`;
    if (timeTo) return `Until ${timeTo}`;
    return "Custom time range";
  }
  return mode;
}

function latestAvailableDate(dates: string[]) {
  return dates.slice().sort((a, b) => b.localeCompare(a))[0] ?? "";
}

function dateWithinRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function observationTimeMinutes(observation: RapidObservationSet) {
  return timeToMinutes(observationTimeLabel(observation));
}

function timeToMinutes(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesWithinRange(value: number, from: number, to: number) {
  if (from <= to) return value >= from && value <= to;
  return value >= from || value <= to;
}

function todayDateValue() {
  return dateToValue(new Date());
}

function addDaysToDateValue(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateToValue(date);
}

function startOfWeekDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return dateToValue(date);
}

function startOfMonthDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(1);
  return dateToValue(date);
}

function startOfPreviousMonthDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setMonth(date.getMonth() - 1, 1);
  return dateToValue(date);
}

function endOfPreviousMonthDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(0);
  return dateToValue(date);
}

function dateToValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function observationLogSearchText(row: ObservationLogRow, review: ReturnType<typeof observationReviewDetails>) {
  return [
    row.patient.patientName,
    row.patient.uhid,
    row.patient.visitNo,
    row.patient.bed,
    row.patient.ward,
    row.patient.source,
    row.patient.consultant,
    row.observation.recordedBy,
    row.observation.shift ?? "",
    fio2Value(row.observation),
    monitorHeartRateValue(row.observation),
    pulseDeficitChartValue(row.observation),
    pulseRhythmLabel(row.observation),
    pulseQualityLabel(row.observation),
    pulseSiteLabel(row.observation),
    row.observation.pulseSource ?? "",
    row.observation.pulseActionTaken ?? "",
    row.observation.pulseSymptoms?.join(" ") ?? "",
    row.observation.note,
    row.observation.responseLevel,
    row.observation.dominantZone,
    review.reviewedBy,
    review.reviewedAt,
    review.doctorAction,
    review.ecgRhythm,
    review.rhythmPlan,
    review.note,
  ].join(" ");
}

function compareObservationLogRows(
  a: ObservationLogRow,
  b: ObservationLogRow,
  reviews: Record<string, ObservationReviewUpdate>,
  sortBy: string,
) {
  if (sortBy === "Oldest first") return observationDateTimeSortValue(a.observation).localeCompare(observationDateTimeSortValue(b.observation));
  if (sortBy === "Clinical priority") {
    return rapidPriorityRank(b.observation.responseLevel) - rapidPriorityRank(a.observation.responseLevel)
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  if (sortBy === "Patient name") {
    return a.patient.patientName.localeCompare(b.patient.patientName)
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  if (sortBy === "Review status") {
    return observationReviewStatus(a.observation, reviews).localeCompare(observationReviewStatus(b.observation, reviews))
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  if (sortBy === "Entered by") {
    return a.observation.recordedBy.localeCompare(b.observation.recordedBy)
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  return observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
}

function observationDateTimeSortValue(observation: RapidObservationSet) {
  return `${observationDateValue(observation)} ${observationTimeLabel(observation)}`;
}

function flattenObservationRows(patients: RapidReviewPatient[]): ObservationLogRow[] {
  return patients
    .flatMap((patient) => patient.observationHistory.map((observation) => ({ patient, observation })))
    .sort((a, b) => `${observationDateValue(b.observation)} ${observationTimeLabel(b.observation)}`.localeCompare(`${observationDateValue(a.observation)} ${observationTimeLabel(a.observation)}`));
}

function uniqueObservationDates(patients: RapidReviewPatient[]) {
  return Array.from(new Set(flattenObservationRows(patients).map((row) => observationDateValue(row.observation))));
}

function observationDateValue(observation: RapidObservationSet) {
  return observation.observationDate ?? "2026-05-24";
}

function observationTimeLabel(observation: RapidObservationSet) {
  const match = observation.recordedAt.match(/(\d{1,2}:\d{2})/);
  return match?.[1] ?? observation.recordedAt.replace("Today ", "");
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(match[2]) - 1;
  return `${Number(match[3])} ${monthNames[monthIndex] ?? match[2]} ${match[1]}`;
}

function observationReviewStatus(observation: RapidObservationSet, reviews: Record<string, ObservationReviewUpdate>) {
  return reviews[observation.id]?.reviewStatus ?? observation.reviewStatus ?? (observation.responseLevel === "Routine" ? "Reviewed" : "Pending doctor review");
}

function observationReviewDetails(observation: RapidObservationSet, reviews: Record<string, ObservationReviewUpdate>) {
  const update = reviews[observation.id];
  return {
    reviewStatus: observationReviewStatus(observation, reviews),
    reviewedBy: update?.reviewedBy ?? observation.reviewedBy ?? (observation.responseLevel === "Routine" ? "Auto screening" : "Pending"),
    reviewedAt: update?.reviewedAt ?? observation.reviewedAt ?? (observation.responseLevel === "Routine" ? "Same time" : "Not reviewed"),
    doctorAction: update?.doctorAction ?? observation.doctorAction ?? defaultDoctorAction(observation),
    ecgRhythm: update?.ecgRhythm ?? "Not confirmed",
    rhythmPlan: update?.rhythmPlan ?? defaultPulseRhythmPlan(observation),
    note: update?.note ?? observation.note,
  };
}

function defaultDoctorAction(observation: RapidObservationSet) {
  const rhythmRisk = pulseRhythmRiskLevel(pulseRhythmLabel(observation));
  const qualityRisk = pulseQualityRiskLevel(pulseQualityLabel(observation));
  const deficitRisk = pulseDeficitRiskLevel(monitorHeartRateValue(observation), observation.pulse);
  if (rhythmRisk === "critical") return "Escalate to MER call";
  if (qualityRisk === "critical") return "Escalate to MER call";
  if (deficitRisk === "highRisk") return "Order ECG and assess pulse deficit";
  if (rhythmRisk === "highRisk") return "Order ECG and review rhythm";
  if (qualityRisk === "highRisk") return "Assess perfusion and repeat pulse check";
  if (deficitRisk === "warning") return "Repeat apical and radial pulse count";
  if (rhythmRisk === "warning") return "Increase observation frequency";
  if (observation.responseLevel === "MER Call") return "Escalate to MER call";
  if (observation.responseLevel === "MDT Review") return "Start MDT review";
  if (observation.responseLevel === "RN Review") return "Increase observation frequency";
  return "Continue routine observation";
}

function defaultPulseRhythmPlan(observation: RapidObservationSet) {
  const rhythmRisk = pulseRhythmRiskLevel(pulseRhythmLabel(observation));
  const qualityRisk = pulseQualityRiskLevel(pulseQualityLabel(observation));
  const deficitRisk = pulseDeficitRiskLevel(monitorHeartRateValue(observation), observation.pulse);
  if (rhythmRisk === "critical") return "Emergency rhythm review, ECG now, prepare resuscitation support";
  if (qualityRisk === "critical") return "Confirm central pulse, call emergency team, start resuscitation pathway";
  if (deficitRisk === "highRisk") return "Check apical-radial pulse deficit, ECG now, review perfusion and electrolytes";
  if (rhythmRisk === "highRisk") return "Order ECG, check electrolytes, repeat vitals in 15 minutes";
  if (qualityRisk === "highRisk") return "Assess peripheral perfusion, capillary refill, BP trend, and repeat pulse manually";
  if (deficitRisk === "warning") return "Repeat manual pulse count and compare with monitor heart rate";
  if (rhythmRisk === "warning") return "Repeat pulse rhythm check and monitor for symptoms";
  return "Continue routine rhythm monitoring";
}

function buildAdultObservationData(observations: RapidObservationSet[], reviews: Record<string, ObservationReviewUpdate>): AdultObservationDataRow[] {
  const chartRows: AdultObservationDataRow[] = adultObservationChartRows.map((row) => ({ ...row, values: {} }));
  const rowMap = new Map<AdultObservationVitalType, AdultObservationDataRow>(chartRows.map((row) => [row.vitalType, row]));

  observations.forEach((observation) => {
    const hour = observationHourKey(observation);
    setAdultObservationValue(rowMap, "respiratoryRate", hour, observation.respiratoryRate);
    setAdultObservationValue(rowMap, "oxygenSaturation", hour, observation.spo2);
    setAdultObservationValue(rowMap, "oxygenFlowRate", hour, oxygenFlowChartValue(observation));
    setAdultObservationValue(rowMap, "fio2", hour, fio2ChartValue(observation));
    setAdultObservationValue(rowMap, "deliveryMethod", hour, deliveryMethodChartValue(observation));
    setAdultObservationValue(rowMap, "bloodPressure", hour, observation.bloodPressure);
    setAdultObservationValue(rowMap, "pulseRate", hour, observation.pulse);
    setAdultObservationValue(rowMap, "monitorHeartRate", hour, monitorHeartRateValue(observation));
    setAdultObservationValue(rowMap, "pulseDeficit", hour, pulseDeficitChartValue(observation));
    setAdultObservationValue(rowMap, "pulseRhythm", hour, pulseRhythmChartValue(observation));
    setAdultObservationValue(rowMap, "pulseQuality", hour, pulseQualityLabel(observation));
    setAdultObservationValue(rowMap, "pulseSite", hour, pulseSiteLabel(observation));
    setAdultObservationValue(rowMap, "temperature", hour, observation.temperature);
    setAdultObservationValue(rowMap, "consciousnessSedation", hour, gcsScoreLabel(observation.consciousness));
    setAdultObservationValue(rowMap, "painScore", hour, observation.painScore);
    setAdultObservationValue(rowMap, "intervention", hour, observationReviewDetails(observation, reviews).doctorAction);
  });

  return chartRows;
}

function setAdultObservationValue(
  rowMap: Map<AdultObservationVitalType, AdultObservationDataRow>,
  vitalType: AdultObservationVitalType,
  hour: string,
  value: string | number | undefined,
) {
  const row = rowMap.get(vitalType);
  if (row) row.values[hour] = value;
}

function observationHourKey(observation: RapidObservationSet) {
  const hour = Number.parseInt(observationTimeLabel(observation).split(":")[0] ?? "", 10);
  return Number.isFinite(hour) ? `${hour.toString().padStart(2, "0")}:00` : "00:00";
}

function oxygenFlowChartValue(observation: RapidObservationSet) {
  const oxygenFlow = observation.oxygenFlow.trim();
  const lower = oxygenFlow.toLowerCase();
  if (lower === "air" || lower.includes("room air")) return 0;
  const match = oxygenFlow.match(/\d+(\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : oxygenFlow;
}

function fio2Value(observation: RapidObservationSet) {
  return observation.fio2 ?? inferFio2FromOxygenSupport(observation.oxygenFlow, observation.deliveryMethod);
}

function fio2ChartValue(observation: RapidObservationSet) {
  return parsePercentValue(fio2Value(observation)) ?? fio2Value(observation);
}

function monitorHeartRateValue(observation: RapidObservationSet) {
  return observation.monitorHeartRate?.trim() ? observation.monitorHeartRate : observation.pulse;
}

function pulseDeficitChartValue(observation: RapidObservationSet) {
  const deficit = pulseDeficitValue(monitorHeartRateValue(observation), observation.pulse);
  return deficit ?? "--";
}

function pulseRhythmChartValue(observation: RapidObservationSet) {
  return pulseRhythmLabel(observation);
}

function pulseRhythmLabel(observation: RapidObservationSet): RapidPulseRhythm {
  if (observation.pulseRhythm) return observation.pulseRhythm;
  const pulse = Number.parseFloat(observation.pulse);
  if (observation.responseLevel === "MER Call") return "Irregularly irregular";
  if (observation.responseLevel === "MDT Review" || pulse >= 120) return "Irregular";
  if (observation.responseLevel === "RN Review" || pulse >= 100) return "Regularly irregular";
  return "Regular";
}

function pulseQualityLabel(observation: RapidObservationSet): RapidPulseQuality {
  if (observation.pulseQuality) return observation.pulseQuality;
  const risk = pulseRhythmRiskLevel(pulseRhythmLabel(observation));
  if (risk === "critical" || observation.responseLevel === "MER Call") return "Weak/thready";
  if (risk === "highRisk" || observation.responseLevel === "MDT Review") return "Diminished";
  return "Normal";
}

function pulseSiteLabel(observation: RapidObservationSet): RapidPulseSite {
  if (observation.pulseSite) return observation.pulseSite;
  if (observation.pulseSource === "Arterial line") return "Arterial line";
  if (observation.pulseSource === "Apical pulse") return "Apical";
  return "Radial";
}

function deliveryMethodChartValue(observation: RapidObservationSet) {
  if (observation.deliveryMethod) return observation.deliveryMethod;
  const lower = observation.oxygenFlow.toLowerCase();
  if (lower.includes("nrbm")) return "NRBM";
  if (lower.includes("nasal")) return "Nasal cannula";
  if (lower.includes("mask")) return "Simple mask";
  if (lower === "air" || lower.includes("room air")) return "Room air";
  return "--";
}

function adultObservationLegendStyle(level: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[level];
  return {
    backgroundColor: palette.background,
    borderColor: palette.border,
    color: palette.text,
  };
}

function adultObservationSwatchStyle(level: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[level];
  return {
    backgroundColor: palette.background,
    borderColor: palette.border,
  };
}

function adultObservationCellStyle(level: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[level];
  return {
    backgroundColor: palette.background,
    borderColor: palette.border,
    color: palette.text,
  };
}

function reviewStatusTone(status: ObservationReviewUpdate["reviewStatus"]): StatusTone {
  if (status === "Pending doctor review") return "warning";
  if (status === "Escalated") return "danger";
  if (status === "Closed") return "success";
  return "info";
}

function adultRiskTone(level: AdultObservationRiskLevel): StatusTone {
  if (level === "critical") return "critical";
  if (level === "highRisk") return "danger";
  if (level === "warning") return "warning";
  if (level === "normal") return "success";
  return "muted";
}

function adultRiskZone(level: AdultObservationRiskLevel): RapidZone {
  if (level === "critical") return "Purple";
  if (level === "highRisk") return "Red";
  if (level === "warning") return "Yellow";
  return "Safe";
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function zonePanelClass(zone: RapidZone) {
  if (zone === "Purple") return "border-critical/30 bg-critical/10 text-critical";
  if (zone === "Red") return "border-danger/30 bg-danger/10 text-danger";
  if (zone === "Yellow") return "border-warning/30 bg-warning/10 text-warning";
  return "border-success/25 bg-success/10 text-success";
}

function toneTextClass(tone: StatusTone) {
  if (tone === "critical") return "text-critical";
  if (tone === "danger") return "text-danger";
  if (tone === "warning") return "text-warning";
  if (tone === "success") return "text-success";
  return "text-info";
}
