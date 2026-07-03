"use client";

import * as React from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  AlertTriangle,
  ClipboardCheck,
  Database,
  Download,
  Droplets,
  FileText,
  FlaskConical,
  Gauge,
  Plus,
  Printer,
  Search,
  ShieldAlert,
  Stethoscope,
  Workflow,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import { PatientMini } from "@/features/appointments/appointment-shared";
import {
  BalanceBadge,
  ClinicalTable,
  ClinicalTd,
  ClinicalTh,
  formatMl,
  formatSignedMl,
  ProtectedRenal,
  RenalMetricCard,
  RenalPatientHeader,
  RenalRoleBanner,
  renalAlertTone,
  RenalStatusBadge,
  SectionShell,
  useRenalAccess,
} from "@/features/renal/renal-shared";
import { getPatientById, mockPatientVisits, mockPatients } from "@/data/patients";
import {
  getRenalAlertsByPatient,
  getRenalBalanceRows,
  getRenalChartByPatient,
  getRenalDrainsByPatient,
  getRenalHourlyUrineByPatient,
  getRenalIntakeByPatient,
  getRenalLabsByPatient,
  getRenalOrdersByPatient,
  getRenalOutputByPatient,
  mockDialysisSessions,
  mockRenalAlerts,
  mockRenalCharts,
  mockRenalDrains,
  mockRenalLabs,
  mockRenalOrders,
  sumValues,
  totalIntake,
  totalOutput,
  type DialysisSession,
  type RenalAlert,
  type RenalDrainRecord,
  type RenalIntakeEntry,
  type RenalLabRecord,
  type RenalOutputEntry,
  type RenalPatientChart,
} from "@/data/renal";
import type { StatusTone } from "@/types";

type OverviewActionType = "entry" | "review" | "labs" | "order" | "billing" | "alert";
type RenalEntryMode = "io" | "intake" | "output";

type OverviewActionRequest = {
  type: OverviewActionType;
  chart?: RenalPatientChart;
  alert?: RenalAlert;
  entryMode?: RenalEntryMode;
};

type RoleActionItem = {
  id: string;
  type: OverviewActionType;
  title: string;
  description: string;
  when: string;
  result: string;
  lockedReason: string;
  owner: string;
  resource: string;
  enabled: boolean;
  rank: number;
  icon: typeof Plus;
};

type FhirResourceName = "Patient" | "Encounter" | "Observation" | "Device" | "DiagnosticReport" | "ServiceRequest" | "AuditEvent" | "Provenance";

type RenalFhirResource = {
  resource: FhirResourceName;
  reference: string;
  status: string;
  payload: string;
};

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function patientName(patientId: string) {
  const patient = getPatientById(patientId);
  return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown patient";
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}

function statusTone(value: string): StatusTone {
  const lower = value.toLowerCase();
  if (lower.includes("critical") || lower.includes("escalated") || lower.includes("low")) return "critical";
  if (lower.includes("watch") || lower.includes("pending") || lower.includes("review")) return "warning";
  if (lower.includes("stable") || lower.includes("signed") || lower.includes("active") || lower.includes("normal")) return "success";
  if (lower.includes("high") || lower.includes("overload")) return "danger";
  return "info";
}

function renalPriorityScore(chart: RenalPatientChart) {
  const alerts = getRenalAlertsByPatient(chart.patientId);
  const critical = alerts.filter((alert) => alert.severity === "Critical").length;
  const warning = alerts.filter((alert) => alert.severity === "Warning").length;
  const positiveBalance = Math.max(0, chart.cumulativeBalanceMl - chart.targetBalanceMl);
  const dialysis = chart.dialysisStatus.toLowerCase().includes("review") ? 30 : 0;
  return critical * 70 + warning * 25 + Math.min(30, Math.round(positiveBalance / 150)) + dialysis;
}

function renalPriorityLabel(score: number) {
  if (score >= 90) return "Critical";
  if (score >= 45) return "Review";
  return "Routine";
}

function renalNextAction(chart: RenalPatientChart) {
  const alerts = getRenalAlertsByPatient(chart.patientId);
  const criticalAlert = alerts.find((alert) => alert.severity === "Critical");
  if (criticalAlert) return criticalAlert.title;
  if (chart.dialysisStatus.toLowerCase().includes("review")) return "Nephrology dialysis review";
  if (chart.cumulativeBalanceMl > chart.targetBalanceMl) return "Review fluid balance target";
  return "Continue renal charting";
}

function getRenalFhirBundle(chart: RenalPatientChart): RenalFhirResource[] {
  const latestLab = getRenalLabsByPatient(chart.patientId)[0];
  const activeOrder = getRenalOrdersByPatient(chart.patientId)[0];
  return [
    { resource: "Patient", reference: `Patient/${chart.patientId}`, status: "Resolved", payload: "Identity, demographics, alerts" },
    { resource: "Encounter", reference: `Encounter/${chart.admissionId}`, status: "Active", payload: `${chart.bedNo}, ${chart.ward}` },
    { resource: "Observation", reference: `Observation/renal-io-${chart.patientId}`, status: "Current", payload: "Intake, output, UOP, balance" },
    { resource: "Device", reference: `Device/renal-device-${chart.patientId}`, status: chart.catheterStatus.includes("No catheter") ? "Not present" : "Active", payload: chart.catheterStatus },
    { resource: "DiagnosticReport", reference: `DiagnosticReport/renal-lab-${chart.patientId}`, status: latestLab?.flag ?? "Pending", payload: latestLab ? `Cr ${latestLab.creatinine}, K ${latestLab.potassium}` : "Renal labs pending" },
    { resource: "ServiceRequest", reference: activeOrder ? `ServiceRequest/${activeOrder.id}` : `ServiceRequest/renal-review-${chart.patientId}`, status: activeOrder?.status ?? "Not ordered", payload: activeOrder?.order ?? "Renal review placeholder" },
    { resource: "AuditEvent", reference: `AuditEvent/renal-access-${chart.patientId}`, status: "Tracked", payload: "View, print, acknowledge, sign-off" },
    { resource: "Provenance", reference: `Provenance/renal-chart-${chart.patientId}`, status: "Source tagged", payload: "Nurse, doctor, lab authorship" },
  ];
}

function fhirStatusTone(status: string): StatusTone {
  if (status === "Current" || status === "Resolved" || status === "Active" || status === "Tracked" || status === "Source tagged") return "success";
  if (status === "Critical" || status === "Escalated") return "critical";
  if (status === "Watch" || status === "Pending" || status === "Pending sign" || status === "Not ordered") return "warning";
  return "info";
}

function renalPatientSearchText(chart: RenalPatientChart) {
  const patient = getPatientById(chart.patientId);
  return [
    patientName(chart.patientId),
    patient?.uhid,
    chart.bedNo,
    chart.ward,
    chart.consultant,
    chart.nephrologist,
    chart.renalStatus,
    chart.dialysisStatus,
    chart.catheterStatus,
    chart.riskFlags.join(" "),
  ].filter(Boolean).join(" ");
}

function sortRenalPatients(rows: RenalPatientChart[], sort: string) {
  return rows.slice().sort((left, right) => {
    if (sort === "Patient A-Z") return patientName(left.patientId).localeCompare(patientName(right.patientId));
    if (sort === "Ward") return `${left.ward} ${left.bedNo}`.localeCompare(`${right.ward} ${right.bedNo}`);
    if (sort === "Balance high-low") return right.cumulativeBalanceMl - left.cumulativeBalanceMl;
    if (sort === "Dialysis review") {
      const leftReview = left.dialysisStatus.toLowerCase().includes("review") ? 1 : 0;
      const rightReview = right.dialysisStatus.toLowerCase().includes("review") ? 1 : 0;
      return rightReview - leftReview || renalPriorityScore(right) - renalPriorityScore(left);
    }
    return renalPriorityScore(right) - renalPriorityScore(left);
  });
}

function renalChartRiskMatch(chart: RenalPatientChart, risk: string) {
  if (risk === "All risk") return true;
  if (risk === "Critical") return renalPriorityLabel(renalPriorityScore(chart)) === "Critical" || chart.renalStatus === "Critical";
  if (risk === "Positive balance") return chart.cumulativeBalanceMl > chart.targetBalanceMl;
  if (risk === "Dialysis review") return chart.dialysisStatus.toLowerCase().includes("review");
  if (risk === "AKI watch") return chart.renalStatus === "AKI watch";
  return true;
}

function renalBalanceSearchText(row: RenalPatientChart & { totalIntakeMl: number; totalOutputMl: number; balanceMl: number }) {
  return [
    renalPatientSearchText(row),
    formatMl(row.totalIntakeMl),
    formatMl(row.totalOutputMl),
    formatSignedMl(row.balanceMl),
    formatSignedMl(row.cumulativeBalanceMl),
  ].join(" ");
}

function sortRenalBalanceRows<T extends RenalPatientChart & { totalIntakeMl: number; totalOutputMl: number; balanceMl: number }>(rows: T[], sort: string) {
  return rows.slice().sort((left, right) => {
    if (sort === "Patient A-Z") return patientName(left.patientId).localeCompare(patientName(right.patientId));
    if (sort === "Ward") return `${left.ward} ${left.bedNo}`.localeCompare(`${right.ward} ${right.bedNo}`);
    if (sort === "Intake high-low") return right.totalIntakeMl - left.totalIntakeMl;
    if (sort === "Output high-low") return right.totalOutputMl - left.totalOutputMl;
    if (sort === "Cumulative high-low") return right.cumulativeBalanceMl - left.cumulativeBalanceMl;
    return right.balanceMl - left.balanceMl;
  });
}

function renalBalanceFilterMatch(row: RenalPatientChart & { balanceMl: number }, filter: string) {
  if (filter === "Positive only") return row.balanceMl > 0;
  if (filter === "Negative only") return row.balanceMl < 0;
  if (filter === "Above target") return row.balanceMl > row.targetBalanceMl || row.cumulativeBalanceMl > row.targetBalanceMl;
  if (filter === "Critical status") return row.renalStatus === "Critical";
  return true;
}

function renalDrainSearchText(drain: RenalDrainRecord) {
  const chart = getRenalChartByPatient(drain.patientId);
  return [
    patientName(drain.patientId),
    getPatientById(drain.patientId)?.uhid,
    chart?.bedNo,
    chart?.ward,
    drain.drainName,
    drain.site,
    drain.deviceStatus,
    drain.character,
    drain.concern,
    formatMl(drain.total24HrMl),
  ].filter(Boolean).join(" ");
}

function sortRenalDrains(rows: RenalDrainRecord[], sort: string) {
  return rows.slice().sort((left, right) => {
    if (sort === "Patient A-Z") return patientName(left.patientId).localeCompare(patientName(right.patientId));
    if (sort === "Drain A-Z") return left.drainName.localeCompare(right.drainName);
    if (sort === "Site A-Z") return left.site.localeCompare(right.site);
    if (sort === "Concern first") return renalDrainConcernRank(right.concern) - renalDrainConcernRank(left.concern);
    return right.total24HrMl - left.total24HrMl;
  });
}

function renalDrainConcernRank(concern: string) {
  const lower = concern.toLowerCase();
  if (lower.includes("high")) return 3;
  if (lower.includes("review") || lower.includes("watch")) return 2;
  if (lower.includes("normal")) return 1;
  return 0;
}

function renalAlertSearchText(alert: RenalAlert) {
  return [
    patientName(alert.patientId),
    alert.title,
    alert.metric,
    alert.threshold,
    alert.owner,
    alert.status,
    alert.severity,
  ].join(" ");
}

function renalAlertSeverityRank(severity: RenalAlert["severity"]) {
  if (severity === "Critical") return 3;
  if (severity === "Warning") return 2;
  return 1;
}

function sortRenalAlerts(rows: RenalAlert[], sort: string) {
  return rows.slice().sort((left, right) => {
    if (sort === "Patient") return patientName(left.patientId).localeCompare(patientName(right.patientId));
    if (sort === "Owner") return left.owner.localeCompare(right.owner);
    if (sort === "Status") return left.status.localeCompare(right.status) || renalAlertSeverityRank(right.severity) - renalAlertSeverityRank(left.severity);
  return renalAlertSeverityRank(right.severity) - renalAlertSeverityRank(left.severity);
  });
}

function renalLabSearchText(lab: RenalLabRecord) {
  return [
    patientName(lab.patientId),
    lab.collectedAt,
    lab.creatinine,
    lab.urea,
    lab.sodium,
    lab.potassium,
    lab.egfr,
    lab.urineProtein,
    lab.flag,
    lab.trend,
  ].join(" ");
}

function renalLabFlagRank(flag: RenalLabRecord["flag"]) {
  if (flag === "Critical") return 3;
  if (flag === "Watch") return 2;
  return 1;
}

function renalLabPotassiumValue(lab: RenalLabRecord) {
  return Number.parseFloat(lab.potassium);
}

function sortRenalLabs(rows: RenalLabRecord[], sort: string) {
  return rows.slice().sort((left, right) => {
    if (sort === "Patient") return patientName(left.patientId).localeCompare(patientName(right.patientId));
    if (sort === "Flag severity") return renalLabFlagRank(right.flag) - renalLabFlagRank(left.flag) || patientName(left.patientId).localeCompare(patientName(right.patientId));
    if (sort === "Worsening first") return Number(right.trend === "Worsening") - Number(left.trend === "Worsening") || renalLabFlagRank(right.flag) - renalLabFlagRank(left.flag);
    if (sort === "Potassium high-low") return renalLabPotassiumValue(right) - renalLabPotassiumValue(left);
    return right.id.localeCompare(left.id);
  });
}

function dialysisSessionSearchText(session: DialysisSession) {
  return [
    patientName(session.patientId),
    session.sessionNo,
    session.modality,
    session.scheduledAt,
    session.accessSite,
    session.status,
  ].join(" ");
}

function dialysisStatusRank(status: DialysisSession["status"]) {
  if (status === "In progress") return 4;
  if (status === "Scheduled") return 3;
  if (status === "Billing pending") return 2;
  return 1;
}

function sortDialysisSessions(rows: DialysisSession[], sort: string) {
  return rows.slice().sort((left, right) => {
    if (sort === "Patient") return patientName(left.patientId).localeCompare(patientName(right.patientId));
    if (sort === "Status priority") return dialysisStatusRank(right.status) - dialysisStatusRank(left.status);
    if (sort === "UF target high-low") return right.ufTargetMl - left.ufTargetMl;
    if (sort === "Billing pending") return Number(right.status === "Billing pending") - Number(left.status === "Billing pending");
    return right.id.localeCompare(left.id);
  });
}

function dialysisBillingAmount(session: DialysisSession, packageMode: string) {
  const modalityBase: Record<DialysisSession["modality"], number> = {
    Hemodialysis: 4500,
    "CRRT placeholder": 18000,
    "SLED placeholder": 8500,
  };
  const packageAddOn = packageMode === "Consumables included" ? 1500 : packageMode === "Emergency add-on" ? 2500 : 0;
  const ufAddOn = session.ufTargetMl > 1500 ? 750 : 0;
  return modalityBase[session.modality] + packageAddOn + ufAddOn;
}

function formatInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function entryModeLabel(mode: RenalEntryMode) {
  if (mode === "intake") return "Intake only";
  if (mode === "output") return "Output only";
  return "Intake + output";
}

function patientRecordName(patient: (typeof mockPatients)[number]) {
  return `${patient.firstName} ${patient.lastName}`;
}

function patientRecordSearchText(patient: (typeof mockPatients)[number]) {
  const visit = mockPatientVisits.find((item) => item.patientId === patient.id);
  return [
    patientRecordName(patient),
    patient.uhid,
    patient.status,
    patient.department,
    patient.lastVisitAt,
    visit?.visitType,
    visit?.referenceNumber,
    patient.alertFlags.join(" "),
  ].filter(Boolean).join(" ");
}

function getRoleActionItems(access: ReturnType<typeof useRenalAccess>): RoleActionItem[] {
  return [
    {
      id: "entry",
      type: "entry",
      title: "Add I/O entry",
      description: "Record intake, urine output, drain output, and shift note.",
      when: "Use during bedside hourly or shift charting.",
      result: "Fluid balance table and renal chart get updated.",
      lockedReason: "Nurse or Doctor role required",
      owner: "Nurse / Doctor",
      resource: "Observation + Device",
      enabled: access.canEnterIO,
      rank: 1,
      icon: Droplets,
    },
    {
      id: "alert",
      type: "alert",
      title: "Acknowledge alert",
      description: "Review an open renal alert and record the clinical reason.",
      when: "Use when a renal rule needs acknowledgement or escalation.",
      result: "Alert action is captured for audit and handoff.",
      lockedReason: "Nurse or Doctor role required",
      owner: "Nurse / Doctor",
      resource: "DetectedIssue",
      enabled: access.canEnterIO || access.canReview,
      rank: 2,
      icon: ShieldAlert,
    },
    {
      id: "review",
      type: "review",
      title: "Sign renal report",
      description: "Finalize the renal report after I/O, labs, alerts, and orders are reviewed.",
      when: "Use at the end of report review or before EMR handoff.",
      result: "Report becomes ready for signed clinical handoff.",
      lockedReason: "Doctor role required",
      owner: "Doctor",
      resource: "DiagnosticReport",
      enabled: access.canReview,
      rank: 3,
      icon: Stethoscope,
    },
    {
      id: "order",
      type: "order",
      title: "Add renal order",
      description: "Add a renal instruction such as repeat RFT, potassium watch, or dialysis review.",
      when: "Use when the doctor needs a new renal follow-up action.",
      result: "Order appears in labs, orders, and sign-off checklist.",
      lockedReason: "Doctor role required",
      owner: "Doctor",
      resource: "ServiceRequest",
      enabled: access.canReview,
      rank: 4,
      icon: ClipboardCheck,
    },
    {
      id: "labs",
      type: "labs",
      title: "Update renal labs",
      description: "Enter creatinine, urea, electrolytes, eGFR, protein, flag, and trend.",
      when: "Use after a renal sample result is available.",
      result: "Latest renal labs and abnormal flags get refreshed.",
      lockedReason: "Lab or Doctor role required",
      owner: "Lab / Doctor",
      resource: "DiagnosticReport",
      enabled: access.canUpdateLabs,
      rank: 5,
      icon: FlaskConical,
    },
    {
      id: "billing",
      type: "billing",
      title: "Prepare dialysis billing",
      description: "Prepare dialysis session rows for billing handoff.",
      when: "Use when dialysis session status is billing pending.",
      result: "Billing receives service rows without changing clinical charting.",
      lockedReason: "Billing role required",
      owner: "Billing",
      resource: "ChargeItem",
      enabled: access.canBill,
      rank: 6,
      icon: FileText,
    },
  ];
}

function roleActionSearchText(action: RoleActionItem) {
  return [
    action.title,
    action.description,
    action.when,
    action.result,
    action.lockedReason,
    action.owner,
    action.resource,
    action.enabled ? "available enabled ready" : "locked disabled",
  ].join(" ");
}

function sortRoleActions(rows: RoleActionItem[], sort: string) {
  return rows.slice().sort((left, right) => {
    if (sort === "Role A-Z") return left.owner.localeCompare(right.owner) || left.rank - right.rank;
    if (sort === "System record A-Z") return left.resource.localeCompare(right.resource) || left.rank - right.rank;
    if (sort === "Locked first") return Number(left.enabled) - Number(right.enabled) || left.rank - right.rank;
    if (sort === "Workflow order") return left.rank - right.rank;
    return Number(right.enabled) - Number(left.enabled) || left.rank - right.rank;
  });
}

function useRenalChartColumns(onOpen: (chart: RenalPatientChart) => void) {
  return React.useMemo<ColumnDef<RenalPatientChart>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Bed/Ward", cell: ({ row }) => `${row.original.bedNo} • ${row.original.ward}` },
    { header: "Consultant", accessorKey: "consultant" },
    { header: "Renal status", cell: ({ row }) => <RenalStatusBadge status={row.original.renalStatus} /> },
    { header: "Fluid target", cell: ({ row }) => formatMl(row.original.fluidRestrictionMl) },
    { header: "Cumulative", cell: ({ row }) => <BalanceBadge value={row.original.cumulativeBalanceMl} /> },
    { header: "Dialysis", accessorKey: "dialysisStatus" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" asChild>
            <Link href={`/renal/patients/${row.original.patientId}`}>Open</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => onOpen(row.original)}>Review</Button>
        </div>
      ),
    },
  ], [onOpen]);
}

export function RenalDashboardPage() {
  const [selected, setSelected] = React.useState<RenalPatientChart | null>(null);
  const [action, setAction] = React.useState<OverviewActionRequest | null>(null);
  const [patientSearch, setPatientSearch] = React.useState("");
  const [patientSort, setPatientSort] = React.useState("Priority");
  const [alertSearch, setAlertSearch] = React.useState("");
  const [alertSort, setAlertSort] = React.useState("Severity");
  const [actionSearch, setActionSearch] = React.useState("");
  const [actionSort, setActionSort] = React.useState("Available first");
  const columns = useRenalChartColumns(setSelected);
  const criticalAlerts = mockRenalAlerts.filter((alert) => alert.severity === "Critical");
  const positiveBalance = mockRenalCharts.filter((chart) => chart.cumulativeBalanceMl > chart.targetBalanceMl);
  const openAlerts = React.useMemo(() => mockRenalAlerts.filter((alert) => alert.status !== "Acknowledged"), []);
  const patientRows = React.useMemo(() => {
    const search = patientSearch.trim();
    const rows = search
      ? mockRenalCharts.filter((chart) => includes(renalPatientSearchText(chart), search))
      : mockRenalCharts;
    return sortRenalPatients(rows, patientSort);
  }, [patientSearch, patientSort]);
  const alertRows = React.useMemo(() => {
    const search = alertSearch.trim();
    const rows = search
      ? openAlerts.filter((alert) => includes(renalAlertSearchText(alert), search))
      : openAlerts;
    return sortRenalAlerts(rows, alertSort);
  }, [alertSearch, alertSort, openAlerts]);

  return (
    <ProtectedRenal>
      {(access) => {
        const roleActionRows = sortRoleActions(
          getRoleActionItems(access).filter((item) => includes(roleActionSearchText(item), actionSearch.trim())),
          actionSort,
        );

        return (
          <div className="space-y-5">
            <PageHeader
              eyebrow="Renal System"
              title="Renal Command Center"
              description="Role-aware renal monitoring for inpatient fluid balance, hourly urine output, drains, labs, dialysis review, and signed reporting."
              actions={
                <>
                  <PrintButton label="Print renal list" />
                  <Button variant="outline" asChild><Link href="/renal/fluid-balance">Fluid balance</Link></Button>
                  <Button disabled={!access.canEnterIO} onClick={() => setAction({ type: "entry" })}>
                    <Plus className="h-4 w-4" />
                    New renal entry
                  </Button>
                </>
              }
            />

            <RenalRoleBanner role={access.role} />

            <SummaryGrid>
              <StatCard label="Active renal charts" value={mockRenalCharts.length} change="Live" context="Inpatient watch" tone="info" icon={Droplets} />
              <StatCard label="Critical alerts" value={criticalAlerts.length} change="Escalate" context="Doctor review" tone="critical" icon={ShieldAlert} />
              <StatCard label="Positive balance" value={positiveBalance.length} change="Fluid" context="Above target" tone="warning" icon={Gauge} />
              <StatCard label="Dialysis queue" value={mockDialysisSessions.filter((item) => item.status !== "Completed").length} change="Renal" context="Sessions" tone="danger" icon={Activity} />
            </SummaryGrid>

            <Tabs defaultValue="dashboard" className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="patient-chart">Patient Chart</TabsTrigger>
                <TabsTrigger value="fluid-balance">Fluid Balance</TabsTrigger>
                <TabsTrigger value="drains">Drains & Devices</TabsTrigger>
                <TabsTrigger value="labs">Renal Lab</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="alert-queue">Alert Queue</TabsTrigger>
                <TabsTrigger value="priority-queue">Clinical Priority Queue</TabsTrigger>
                <TabsTrigger value="actions">Action</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-3">
                <RenalPatientChartsTab
                  rows={patientRows}
                  columns={columns}
                  search={patientSearch}
                  onSearch={setPatientSearch}
                  sort={patientSort}
                  onSort={setPatientSort}
                />
              </TabsContent>

              <TabsContent value="patient-chart" className="space-y-3">
                <RenalPatientChartsTab
                  rows={patientRows}
                  columns={columns}
                  search={patientSearch}
                  onSearch={setPatientSearch}
                  sort={patientSort}
                  onSort={setPatientSort}
                />
              </TabsContent>

              <TabsContent value="fluid-balance">
                <RenalFluidBalanceTab />
              </TabsContent>

              <TabsContent value="drains">
                <RenalDrainsDevicesTab access={access} />
              </TabsContent>

              <TabsContent value="labs">
                <RenalLabsDashboardTab access={access} />
              </TabsContent>

              <TabsContent value="reports">
                <RenalReportsDashboardTab access={access} />
              </TabsContent>

              <TabsContent value="alert-queue" className="space-y-3">
                <FilterBar
                  search={alertSearch}
                  onSearch={setAlertSearch}
                  placeholder="Search alert, patient, metric, owner, status..."
                >
                  <Badge tone="critical">{alertRows.length} open</Badge>
                  <NativeSelect
                    label="Sort alerts"
                    value={alertSort}
                    onChange={setAlertSort}
                    options={["Severity", "Patient", "Owner", "Status"]}
                  />
                  <Button variant="outline" onClick={() => { setAlertSearch(""); setAlertSort("Severity"); }}>Reset</Button>
                </FilterBar>
                <RenalAlertQueue alerts={alertRows} onAction={(alert) => setAction({ type: "alert", alert })} />
              </TabsContent>

              <TabsContent value="priority-queue" className="space-y-4">
                <RenalPriorityQueueTab charts={mockRenalCharts} onAction={setAction} />
              </TabsContent>

              <TabsContent value="actions">
                <RoleActionPanel
                  actions={roleActionRows}
                  search={actionSearch}
                  onSearch={setActionSearch}
                  sort={actionSort}
                  onSort={setActionSort}
                  role={access.role}
                  onAction={(type) => setAction({ type })}
                />
              </TabsContent>
            </Tabs>
            <RenalChartDrawer chart={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
            <RenalOverviewActionDrawer action={action} open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)} />
          </div>
        );
      }}
    </ProtectedRenal>
  );
}

function RenalPriorityQueueTab({
  charts,
  onAction,
}: {
  charts: RenalPatientChart[];
  onAction: (action: OverviewActionRequest) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [risk, setRisk] = React.useState("All risk");
  const [sort, setSort] = React.useState("Priority");
  const rows = React.useMemo(() => {
    const filtered = charts.filter((chart) => {
      const matchesSearch = search.trim() ? includes(renalPatientSearchText(chart), search.trim()) : true;
      return matchesSearch && renalChartRiskMatch(chart, risk);
    });
    return sortRenalPatients(filtered, sort);
  }, [charts, risk, search, sort]);

  return (
    <div className="space-y-4">
      <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, bed, ward, renal risk...">
        <Badge tone="info">{rows.length} patients</Badge>
        <NativeSelect label="Risk" value={risk} onChange={setRisk} options={["All risk", "Critical", "Positive balance", "Dialysis review", "AKI watch"]} />
        <NativeSelect label="Sort queue" value={sort} onChange={setSort} options={["Priority", "Patient A-Z", "Ward", "Balance high-low", "Dialysis review"]} />
        <Button variant="outline" onClick={() => { setSearch(""); setRisk("All risk"); setSort("Priority"); }}>Reset</Button>
      </FilterBar>
      <RenalPriorityBoard charts={rows} onAction={onAction} />
      <RenalQueueDetailPanel charts={rows} onAction={onAction} />
    </div>
  );
}

function RenalPatientChartsTab({
  rows,
  columns,
  search,
  onSearch,
  sort,
  onSort,
}: {
  rows: RenalPatientChart[];
  columns: ColumnDef<RenalPatientChart>[];
  search: string;
  onSearch: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
}) {
  const [status, setStatus] = React.useState("All status");
  const filteredRows = React.useMemo(
    () => rows.filter((chart) => status === "All status" || chart.renalStatus === status),
    [rows, status],
  );

  return (
    <div className="space-y-3">
      <FilterBar
        search={search}
        onSearch={onSearch}
        placeholder="Search patient, UHID, bed, ward, consultant, status..."
      >
        <Badge tone="info">{filteredRows.length} patients</Badge>
        <NativeSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={["All status", "Stable", "AKI watch", "Fluid overload", "Critical", "Dialysis review"]}
        />
        <NativeSelect
          label="Sort patients"
          value={sort}
          onChange={onSort}
          options={["Priority", "Patient A-Z", "Ward", "Balance high-low", "Dialysis review"]}
        />
        <Button variant="outline" onClick={() => { onSearch(""); onSort("Priority"); setStatus("All status"); }}>Reset</Button>
      </FilterBar>
      <DataTable data={filteredRows} columns={columns} />
    </div>
  );
}

function RenalFluidBalanceTab() {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("All balance");
  const [sort, setSort] = React.useState("Balance high-low");
  const baseRows = React.useMemo(() => mockRenalCharts.map((chart) => {
    const balanceRows = getRenalBalanceRows(chart.patientId);
    return {
      ...chart,
      totalIntakeMl: sumValues(balanceRows, (row) => row.totalIntakeMl),
      totalOutputMl: sumValues(balanceRows, (row) => row.totalOutputMl),
      balanceMl: sumValues(balanceRows, (row) => row.balanceMl),
    };
  }), []);
  const rows = React.useMemo(() => {
    const filtered = baseRows.filter((row) => {
      const matchesSearch = search.trim() ? includes(renalBalanceSearchText(row), search.trim()) : true;
      return matchesSearch && renalBalanceFilterMatch(row, filter);
    });
    return sortRenalBalanceRows(filtered, sort);
  }, [baseRows, filter, search, sort]);
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const columns = React.useMemo<ColumnDef<(typeof rows)[number]>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Bed/Ward", cell: ({ row }) => `${row.original.bedNo} • ${row.original.ward}` },
    { header: "Status", cell: ({ row }) => <RenalStatusBadge status={row.original.renalStatus} /> },
    { header: "Intake", cell: ({ row }) => formatMl(row.original.totalIntakeMl) },
    { header: "Output", cell: ({ row }) => formatMl(row.original.totalOutputMl) },
    { header: "24h balance", cell: ({ row }) => <BalanceBadge value={row.original.balanceMl} /> },
    { header: "Cumulative", cell: ({ row }) => <BalanceBadge value={row.original.cumulativeBalanceMl} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" asChild><Link href={`/renal/patients/${row.original.patientId}`}>Open</Link></Button> },
  ], []);

  return (
    <div className="space-y-4">
      <SectionShell
        title="Fluid Balance"
        action={<><PrintButton label="Print balance" /><Button variant="outline"><Download className="h-4 w-4" />Export</Button></>}
      >
        <div className="space-y-3 p-4">
          <p className="text-xs text-muted-foreground">24-hour intake, output, balance, and cumulative renal chart summary across active inpatients.</p>
          <SummaryGrid>
            <StatCard label="Total intake" value={sumValues(rows, (row) => row.totalIntakeMl)} change="ml" context="All active charts" tone="info" icon={Droplets} />
            <StatCard label="Total output" value={sumValues(rows, (row) => row.totalOutputMl)} change="ml" context="Urine + drains" tone="success" icon={Activity} />
            <StatCard label="Positive balances" value={rows.filter((row) => row.balanceMl > 0).length} change="Review" context="Clinical watch" tone="warning" icon={Gauge} />
            <StatCard label="Critical alerts" value={mockRenalAlerts.filter((alert) => alert.severity === "Critical").length} change="Escalate" context="Renal rules" tone="critical" icon={ShieldAlert} />
          </SummaryGrid>
        </div>
      </SectionShell>
      <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, ward, intake, output, balance...">
        <Badge tone="info">{rows.length} records</Badge>
        <NativeSelect label="Balance filter" value={filter} onChange={setFilter} options={["All balance", "Positive only", "Negative only", "Above target", "Critical status"]} />
        <NativeSelect label="Sort balance" value={sort} onChange={setSort} options={["Balance high-low", "Intake high-low", "Output high-low", "Cumulative high-low", "Patient A-Z", "Ward"]} />
        <Button variant="outline" onClick={() => { setSearch(""); setFilter("All balance"); setSort("Balance high-low"); }}>Reset</Button>
      </FilterBar>
      <DataTable data={rows} columns={columns} />
    </div>
  );
}

function RenalDrainsDevicesTab({ access }: { access: ReturnType<typeof useRenalAccess> }) {
  const [selected, setSelected] = React.useState<RenalDrainRecord | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [concernFilter, setConcernFilter] = React.useState("All concern");
  const [sort, setSort] = React.useState("Output high-low");
  const rows = React.useMemo(() => {
    const filtered = mockRenalDrains.filter((drain) => {
      const matchesSearch = search.trim() ? includes(renalDrainSearchText(drain), search.trim()) : true;
      const matchesStatus = statusFilter === "All status" || drain.deviceStatus === statusFilter;
      const matchesConcern = concernFilter === "All concern" || drain.concern === concernFilter;
      return matchesSearch && matchesStatus && matchesConcern;
    });
    return sortRenalDrains(filtered, sort);
  }, [concernFilter, search, sort, statusFilter]);
  const columns = React.useMemo<ColumnDef<RenalDrainRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Drain", accessorKey: "drainName" },
    { header: "Site", accessorKey: "site" },
    { header: "Status", cell: ({ row }) => <StatusPill tone={statusTone(row.original.deviceStatus)}>{row.original.deviceStatus}</StatusPill> },
    { header: "24h output", cell: ({ row }) => formatMl(row.original.total24HrMl) },
    { header: "Character", accessorKey: "character" },
    { header: "Concern", cell: ({ row }) => <StatusPill tone={statusTone(row.original.concern)}>{row.original.concern}</StatusPill> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], []);

  return (
    <div className="space-y-4">
      <SectionShell
        title="Drains & Devices"
        action={<><PrintButton label="Print drains" /><Button disabled={!access.canEnterIO} onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add drain reading</Button></>}
      >
        <div className="space-y-3 p-4">
          <p className="text-xs text-muted-foreground">Drain-wise renal output monitoring with site, device state, character, concern, and review action.</p>
          <SummaryGrid>
            <StatCard label="Active drains" value={mockRenalDrains.filter((drain) => drain.deviceStatus !== "Removed placeholder").length} change="Devices" context="Across renal charts" tone="info" icon={Droplets} />
            <StatCard label="High output" value={mockRenalDrains.filter((drain) => drain.concern === "High output").length} change="Watch" context="Drain alerts" tone="warning" icon={AlertTriangle} />
            <StatCard label="Total drain output" value={sumValues(mockRenalDrains, (drain) => drain.total24HrMl)} change="ml" context="24h" tone="success" icon={Activity} />
            <StatCard label="Removed" value={mockRenalDrains.filter((drain) => drain.deviceStatus === "Removed placeholder").length} change="Audit" context="Line lifecycle" tone="muted" icon={ClipboardCheck} />
          </SummaryGrid>
        </div>
      </SectionShell>
      <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, drain, site, device status, character, concern...">
        <Badge tone="info">{rows.length} drains</Badge>
        <NativeSelect label="Device status" value={statusFilter} onChange={setStatusFilter} options={["All status", ...Array.from(new Set(mockRenalDrains.map((drain) => drain.deviceStatus)))]} />
        <NativeSelect label="Concern" value={concernFilter} onChange={setConcernFilter} options={["All concern", ...Array.from(new Set(mockRenalDrains.map((drain) => drain.concern)))]} />
        <NativeSelect label="Sort drains" value={sort} onChange={setSort} options={["Output high-low", "Concern first", "Patient A-Z", "Drain A-Z", "Site A-Z"]} />
        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("All status"); setConcernFilter("All concern"); setSort("Output high-low"); }}>Reset</Button>
      </FilterBar>
      <DataTable data={rows} columns={columns} />
      <DrainReadingModal open={addOpen} onOpenChange={setAddOpen} canSubmit={access.canEnterIO} />
      <DrainReviewModal drain={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} canSubmit={access.canEnterIO || access.canReview} />
    </div>
  );
}

function RenalLabsDashboardTab({ access }: { access: ReturnType<typeof useRenalAccess> }) {
  const firstChart = mockRenalCharts[0];
  const [search, setSearch] = React.useState("");
  const [flagFilter, setFlagFilter] = React.useState("All flags");
  const [sort, setSort] = React.useState("Latest");
  const [reviewLab, setReviewLab] = React.useState<RenalLabRecord | null>(null);
  const [updatePatientId, setUpdatePatientId] = React.useState(firstChart?.patientId ?? "");
  const [updateOpen, setUpdateOpen] = React.useState(false);

  const rows = React.useMemo(() => {
    const filtered = mockRenalLabs.filter((lab) => {
      const matchesSearch = search.trim() ? includes(renalLabSearchText(lab), search.trim()) : true;
      const matchesFlag = flagFilter === "All flags" || lab.flag === flagFilter;
      return matchesSearch && matchesFlag;
    });
    return sortRenalLabs(filtered, sort);
  }, [flagFilter, search, sort]);

  const columns = React.useMemo<ColumnDef<RenalLabRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Collected", accessorKey: "collectedAt" },
    { header: "Creatinine", accessorKey: "creatinine" },
    { header: "Urea", accessorKey: "urea" },
    { header: "Sodium", accessorKey: "sodium" },
    { header: "Potassium", accessorKey: "potassium" },
    { header: "eGFR", accessorKey: "egfr" },
    { header: "Flag", cell: ({ row }) => <StatusPill tone={statusTone(row.original.flag)}>{row.original.flag}</StatusPill> },
    { header: "Trend", cell: ({ row }) => <StatusPill tone={statusTone(row.original.trend)}>{row.original.trend}</StatusPill> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" onClick={() => setReviewLab(row.original)}>Review</Button>
          <Button
            size="sm"
            onClick={() => {
              setUpdatePatientId(row.original.patientId);
              setUpdateOpen(true);
            }}
          >
            Update
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <SectionShell
        title="Renal Lab"
        action={<><PrintButton label="Print labs" /><Button disabled={!access.canUpdateLabs} onClick={() => { setUpdatePatientId(firstChart?.patientId ?? ""); setUpdateOpen(true); }}><FlaskConical className="h-4 w-4" />Update labs</Button></>}
      >
        <div className="space-y-3 p-4">
          <p className="text-xs text-muted-foreground">Creatinine, urea, electrolytes, eGFR, urine protein, abnormal flags, and renal trend review.</p>
          <AlertBanner icon={FlaskConical} tone="warning" title="Critical value visibility">Critical potassium, creatinine trend, and dialysis review indicators remain visible in the renal workspace.</AlertBanner>
          <SummaryGrid>
            <StatCard label="Total lab rows" value={mockRenalLabs.length} change="Results" context="Renal diagnostics" tone="info" icon={FlaskConical} />
            <StatCard label="Critical results" value={mockRenalLabs.filter((lab) => lab.flag === "Critical").length} change="Escalate" context="Doctor acknowledgement" tone="critical" icon={ShieldAlert} />
            <StatCard label="Worsening trend" value={mockRenalLabs.filter((lab) => lab.trend === "Worsening").length} change="Review" context="Creatinine / eGFR watch" tone="warning" icon={Activity} />
            <StatCard label="Pending sign orders" value={mockRenalOrders.filter((order) => order.status === "Pending sign").length} change="Orders" context="Renal orders" tone="danger" icon={ClipboardCheck} />
          </SummaryGrid>
        </div>
      </SectionShell>
      <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, creatinine, potassium, eGFR, flag, trend...">
        <Badge tone="info">{rows.length} results</Badge>
        <NativeSelect label="Flag" value={flagFilter} onChange={setFlagFilter} options={["All flags", "Critical", "Watch", "Normal"]} />
        <NativeSelect label="Sort labs" value={sort} onChange={setSort} options={["Latest", "Patient", "Flag severity", "Worsening first", "Potassium high-low"]} />
        <Button variant="outline" onClick={() => { setSearch(""); setFlagFilter("All flags"); setSort("Latest"); }}>Reset</Button>
      </FilterBar>
      <DataTable data={rows} columns={columns} />
      <RenalLabEntryModal key={updatePatientId} open={updateOpen} onOpenChange={setUpdateOpen} patientId={updatePatientId} canSubmit={access.canUpdateLabs} />
      <RenalLabReviewModal lab={reviewLab} open={Boolean(reviewLab)} onOpenChange={(open) => !open && setReviewLab(null)} canSubmit={access.canReview || access.canUpdateLabs} />
    </div>
  );
}

function RenalReportsDashboardTab({ access }: { access: ReturnType<typeof useRenalAccess> }) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [sort, setSort] = React.useState("Status priority");
  const [workflow, setWorkflow] = React.useState<"balance" | "signoff" | "billing" | "emr" | null>(null);
  const [selectedSession, setSelectedSession] = React.useState<DialysisSession | null>(null);

  const rows = React.useMemo(() => {
    const filtered = mockDialysisSessions.filter((session) => {
      const matchesSearch = search.trim() ? includes(dialysisSessionSearchText(session), search.trim()) : true;
      const matchesStatus = statusFilter === "All status" || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortDialysisSessions(filtered, sort);
  }, [search, sort, statusFilter]);

  const dialysisColumns = React.useMemo<ColumnDef<DialysisSession>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Session", accessorKey: "sessionNo" },
    { header: "Modality", accessorKey: "modality" },
    { header: "Scheduled", accessorKey: "scheduledAt" },
    { header: "Access", accessorKey: "accessSite" },
    { header: "UF target", cell: ({ row }) => formatMl(row.original.ufTargetMl) },
    { header: "UF removed", cell: ({ row }) => formatMl(row.original.ufRemovedMl) },
    { header: "Status", cell: ({ row }) => <StatusPill tone={statusTone(row.original.status)}>{row.original.status}</StatusPill> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelectedSession(row.original)}>Review</Button> },
  ], []);

  return (
    <div className="space-y-4">
      <SectionShell
        title="Reports"
        action={<><PrintButton label="Print renal report" /><Button variant="outline" onClick={() => toast.success("Renal report PDF export queued in static workflow")}><Download className="h-4 w-4" />Export PDF</Button><Button disabled={!access.canReview} onClick={() => setWorkflow("emr")}>Send to EMR</Button></>}
      >
        <div className="space-y-3 p-4">
          <p className="text-xs text-muted-foreground">Renal chart print, doctor sign-off, dialysis session summary, billing-ready service rows, and EMR handoff.</p>
          <div className="grid gap-4 lg:grid-cols-3">
            <ReportCard title="24h fluid balance" value={`${mockRenalCharts.length} patients`} status="Ready to print" actionLabel="Preview" onAction={() => setWorkflow("balance")} />
            <ReportCard title="Doctor sign-off" value={`${mockRenalOrders.filter((order) => order.status === "Pending sign").length} pending`} status="Review required" actionLabel="Open sign-off" onAction={() => setWorkflow("signoff")} disabled={!access.canReview} />
            <ReportCard title="Billing handoff" value={`${mockDialysisSessions.filter((session) => session.status === "Billing pending").length} pending`} status={access.canBill ? "Billing access" : "Read only"} actionLabel="Prepare" onAction={() => setWorkflow("billing")} disabled={!access.canBill} />
          </div>
        </div>
      </SectionShell>
      <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, dialysis session, modality, access, status...">
        <Badge tone="info">{rows.length} sessions</Badge>
        <NativeSelect label="Dialysis status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Scheduled", "In progress", "Completed", "Billing pending"]} />
        <NativeSelect label="Sort sessions" value={sort} onChange={setSort} options={["Status priority", "Patient", "UF target high-low", "Billing pending"]} />
        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("All status"); setSort("Status priority"); }}>Reset</Button>
      </FilterBar>
      <DataTable data={rows} columns={dialysisColumns} />
      <RenalReportWorkflowModal workflow={workflow} open={Boolean(workflow)} onOpenChange={(open) => !open && setWorkflow(null)} access={access} />
      <DialysisSessionReviewModal session={selectedSession} open={Boolean(selectedSession)} onOpenChange={(open) => !open && setSelectedSession(null)} canSubmit={access.canReview || access.canBill} />
    </div>
  );
}

function RenalOverviewSearchBar({
  search,
  onSearch,
  status,
  onStatus,
  risk,
  onRisk,
  resultCount,
  onReset,
}: {
  search: string;
  onSearch: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  risk: string;
  onRisk: (value: string) => void;
  resultCount: number;
  onReset: () => void;
}) {
  const quickRisks = ["Critical alerts", "Positive balance", "Dialysis review", "Low urine output", "Stable only"];

  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-center">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 pr-20"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search patient, UHID, bed, ward, consultant, status, dialysis..."
              aria-label="Search renal overview"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{resultCount} found</div>
          </div>
          <NativeSelect label="Renal status" value={status} onChange={onStatus} options={["All status", "Stable", "AKI watch", "Fluid overload", "Critical", "Dialysis review"]} />
          <NativeSelect label="Risk" value={risk} onChange={onRisk} options={["All risk", ...quickRisks]} />
          <Button variant="outline" onClick={onReset}>Reset</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickRisks.map((item) => (
            <Button key={item} size="sm" variant={risk === item ? "default" : "outline"} onClick={() => onRisk(risk === item ? "All risk" : item)}>
              {item}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RenalFhirOperationsStrip({
  activeCharts,
  visibleCharts,
  criticalAlerts,
  positiveBalance,
  dialysisQueue,
}: {
  activeCharts: number;
  visibleCharts: number;
  criticalAlerts: number;
  positiveBalance: number;
  dialysisQueue: number;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[minmax(260px,0.9fr)_repeat(5,minmax(120px,1fr))]">
          <div className="border-b border-border bg-sidebar p-4 text-sidebar-foreground lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70">
              <Database className="h-4 w-4" />
              HL7 FHIR R4
            </div>
            <div className="mt-2 text-lg font-semibold">Renal Resource Workbench</div>
            <div className="mt-1 text-xs leading-5 text-sidebar-foreground/75">Patient, Encounter, Observation, Device, DiagnosticReport, ServiceRequest, AuditEvent, Provenance</div>
          </div>
          <MetricCell label="Visible" value={visibleCharts} tone="info" helper={`of ${activeCharts} charts`} />
          <MetricCell label="Critical" value={criticalAlerts} tone="critical" helper="Open alerts" />
          <MetricCell label="Positive" value={positiveBalance} tone="warning" helper="Balance above target" />
          <MetricCell label="Dialysis" value={dialysisQueue} tone="danger" helper="Queue / review" />
          <div className="border-b border-border p-4 lg:border-b-0">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Workflow className="h-4 w-4" />
              FHIR Flow
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {["Observation", "Device", "DiagnosticReport", "AuditEvent"].map((resource) => (
                <Badge key={resource} tone="muted">{resource}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCell({ label, value, tone, helper }: { label: string; value: number; tone: StatusTone; helper: string }) {
  return (
    <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        <StatusPill tone={tone}>{helper}</StatusPill>
      </div>
    </div>
  );
}

function RenalOverviewPatientList({
  charts,
  onReview,
  onAction,
}: {
  charts: RenalPatientChart[];
  onReview: (chart: RenalPatientChart) => void;
  onAction: (action: OverviewActionRequest) => void;
}) {
  const sortedCharts = React.useMemo(() => charts.slice().sort((left, right) => renalPriorityScore(right) - renalPriorityScore(left)), [charts]);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>FHIR-Aligned Renal Worklist</CardTitle>
          <CardDescription>Patient and encounter context with renal Observations, devices, lab reports, orders, and audit status.</CardDescription>
        </div>
        <Badge tone="info">{sortedCharts.length} patients</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {sortedCharts.length ? (
          <>
            <div className="hidden border-y border-border bg-surface-muted px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground 2xl:grid 2xl:grid-cols-[minmax(300px,1.05fr)_190px_minmax(260px,1fr)_minmax(240px,0.95fr)_170px]">
              <span>Patient / Encounter</span>
              <span>Clinical State</span>
              <span>FHIR Resources</span>
              <span>Next Clinical Action</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="max-h-[680px] overflow-y-auto">
            {sortedCharts.map((chart) => {
              const patient = getPatientById(chart.patientId);
              const score = renalPriorityScore(chart);
              const alerts = getRenalAlertsByPatient(chart.patientId);
              const criticalAlerts = alerts.filter((alert) => alert.severity === "Critical").length;
              const warningAlerts = alerts.filter((alert) => alert.severity === "Warning").length;
              const fhirBundle = getRenalFhirBundle(chart);
              return (
                <div className="grid gap-3 border-b border-border p-4 last:border-0 hover:bg-surface-muted/55 2xl:grid-cols-[minmax(300px,1.05fr)_190px_minmax(260px,1fr)_minmax(240px,0.95fr)_170px] 2xl:items-center" key={chart.id}>
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-primary">
                      {(patient?.firstName?.[0] ?? "P")}{(patient?.lastName?.[0] ?? "")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-semibold text-foreground">{patientName(chart.patientId)}</div>
                        <Badge tone="muted">{patient?.uhid ?? "Unknown UHID"}</Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{patient?.age ?? "-"} / {patient?.gender ?? "-"}</span>
                        <span>{chart.bedNo}</span>
                        <span>{chart.ward}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge tone="muted">{fhirBundle[0].reference}</Badge>
                        <Badge tone="muted">{fhirBundle[1].reference}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-1 text-xs">
                    <div className="flex flex-wrap gap-2">
                      <RenalStatusBadge status={chart.renalStatus} />
                      <StatusPill tone={statusTone(renalPriorityLabel(score))}>{renalPriorityLabel(score)}</StatusPill>
                    </div>
                    <span className="text-muted-foreground">{chart.nephrologist}</span>
                    <span className="text-muted-foreground">{chart.dialysisStatus}</span>
                  </div>

                  <div className="grid gap-2">
                    <div className="grid gap-1 sm:grid-cols-2">
                      {fhirBundle.slice(2, 6).map((item) => (
                        <div className="rounded-md border border-border bg-background px-2 py-1.5" key={item.resource}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[11px] font-semibold text-foreground">{item.resource}</span>
                            <StatusPill tone={fhirStatusTone(item.status)}>{item.status}</StatusPill>
                          </div>
                          <div className="mt-1 truncate text-[11px] text-muted-foreground">{item.payload}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="text-sm font-medium text-foreground">{renalNextAction(chart)}</div>
                    <div className="flex flex-wrap gap-2">
                      <BalanceBadge value={chart.cumulativeBalanceMl} />
                      {criticalAlerts ? <Badge tone="critical">{criticalAlerts} critical</Badge> : null}
                      {warningAlerts ? <Badge tone="warning">{warningAlerts} warning</Badge> : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-start gap-2 2xl:justify-end">
                    <Button size="sm" variant="outline" asChild><Link href={`/renal/patients/${chart.patientId}`}>Open</Link></Button>
                    <Button size="sm" variant="outline" onClick={() => onReview(chart)}>Review</Button>
                    <Button size="sm" onClick={() => onAction({ type: "entry", chart })}>Entry</Button>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        ) : (
          <div className="p-4">
            <EmptyState icon={Search} title="No renal patients found" description="Change filters or clear search to see the renal worklist." />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RenalPriorityBoard({ charts, onAction }: { charts: RenalPatientChart[]; onAction: (action: OverviewActionRequest) => void }) {
  const [queueFilter, setQueueFilter] = React.useState("Action queue");
  const sortedCharts = React.useMemo(() => charts
    .slice()
    .sort((left, right) => renalPriorityScore(right) - renalPriorityScore(left)), [charts]);
  const queueCharts = React.useMemo(() => sortedCharts.filter((chart) => {
    const label = renalPriorityLabel(renalPriorityScore(chart));
    if (queueFilter === "Critical") return label === "Critical";
    if (queueFilter === "Review") return label === "Review";
    if (queueFilter === "Dialysis") return chart.dialysisStatus.toLowerCase().includes("review");
    return label !== "Routine";
  }), [queueFilter, sortedCharts]);
  const visibleCharts = queueCharts.length ? queueCharts : sortedCharts;
  const criticalCount = sortedCharts.filter((chart) => renalPriorityLabel(renalPriorityScore(chart)) === "Critical").length;
  const reviewCount = sortedCharts.filter((chart) => renalPriorityLabel(renalPriorityScore(chart)) === "Review").length;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Clinical Priority Queue</CardTitle>
          <CardDescription>Compact queue for high-volume renal wards.</CardDescription>
        </div>
        <Badge tone="info">{visibleCharts.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <QueueCount label="Critical" value={criticalCount} tone="critical" />
          <QueueCount label="Review" value={reviewCount} tone="warning" />
          <QueueCount label="Total" value={sortedCharts.length} tone="info" />
        </div>
        <Tabs value={queueFilter} onValueChange={setQueueFilter}>
          <TabsList>
            <TabsTrigger value="Action queue">Queue</TabsTrigger>
            <TabsTrigger value="Critical">Critical</TabsTrigger>
            <TabsTrigger value="Review">Review</TabsTrigger>
            <TabsTrigger value="Dialysis">Dialysis</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="max-h-[460px] overflow-y-auto rounded-lg border border-border">
          {visibleCharts.length ? visibleCharts.map((chart, index) => {
            const score = renalPriorityScore(chart);
            const fhirBundle = getRenalFhirBundle(chart);
            return (
              <div className="border-b border-border bg-surface p-3 last:border-0 hover:bg-surface-muted/70" key={chart.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 min-w-5 items-center justify-center rounded bg-surface-muted text-[11px] font-semibold text-muted-foreground">{index + 1}</span>
                      <div className="truncate text-sm font-semibold text-foreground">{patientName(chart.patientId)}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{chart.bedNo} • {chart.ward}</div>
                  </div>
                  <StatusPill tone={statusTone(renalPriorityLabel(score))}>{renalPriorityLabel(score)}</StatusPill>
                </div>
                <div className="mt-2 text-xs font-medium text-foreground">{renalNextAction(chart)}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {fhirBundle.slice(2, 5).map((resource) => (
                    <Badge key={resource.resource} tone={fhirStatusTone(resource.status)}>{resource.resource}</Badge>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" asChild><Link href={`/renal/patients/${chart.patientId}`}>Open</Link></Button>
                  <Button size="sm" onClick={() => onAction({ type: "review", chart })}>Act now</Button>
                </div>
              </div>
            );
          }) : (
            <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">No patients match this queue.</div>
          )}
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          For 50+ patients, this board stays scrollable and filterable while the main worklist remains sorted by priority.
        </div>
      </CardContent>
    </Card>
  );
}

function QueueCount({ label, value, tone }: { label: string; value: number; tone: StatusTone }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="text-lg font-semibold text-foreground">{value}</div>
        <StatusPill tone={tone}>{label}</StatusPill>
      </div>
    </div>
  );
}

function RenalQueueDetailPanel({ charts, onAction }: { charts: RenalPatientChart[]; onAction: (action: OverviewActionRequest) => void }) {
  const sortedCharts = React.useMemo(() => charts.slice().sort((left, right) => renalPriorityScore(right) - renalPriorityScore(left)), [charts]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Queue Detail</CardTitle>
          <CardDescription>Priority, renal trigger, and action in a single review table.</CardDescription>
        </div>
        <Badge tone="muted">{sortedCharts.length} rows</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ClinicalTable minWidth="860px">
          <thead>
            <tr>
              <ClinicalTh>Rank</ClinicalTh>
              <ClinicalTh>Patient</ClinicalTh>
              <ClinicalTh>Priority</ClinicalTh>
              <ClinicalTh>Trigger</ClinicalTh>
              <ClinicalTh>FHIR source</ClinicalTh>
              <ClinicalTh className="text-right">Action</ClinicalTh>
            </tr>
          </thead>
          <tbody>
            {sortedCharts.map((chart, index) => {
              const priority = renalPriorityLabel(renalPriorityScore(chart));
              return (
                <tr key={chart.id}>
                  <ClinicalTd>{index + 1}</ClinicalTd>
                  <ClinicalTd>
                    <div className="font-medium">{patientName(chart.patientId)}</div>
                    <div className="text-[11px] text-muted-foreground">{chart.bedNo} • {chart.ward}</div>
                  </ClinicalTd>
                  <ClinicalTd><StatusPill tone={statusTone(priority)}>{priority}</StatusPill></ClinicalTd>
                  <ClinicalTd>{renalNextAction(chart)}</ClinicalTd>
                  <ClinicalTd>
                    <div className="flex flex-wrap gap-1">
                      {getRenalFhirBundle(chart).slice(2, 5).map((resource) => <Badge key={resource.resource} tone="muted">{resource.resource}</Badge>)}
                    </div>
                  </ClinicalTd>
                  <ClinicalTd className="text-right">
                    <Button size="sm" onClick={() => onAction({ type: "review", chart })}>Act</Button>
                  </ClinicalTd>
                </tr>
              );
            })}
          </tbody>
        </ClinicalTable>
      </CardContent>
    </Card>
  );
}

function RenalFhirMapPanel({ charts }: { charts: RenalPatientChart[] }) {
  const chart = charts.slice().sort((left, right) => renalPriorityScore(right) - renalPriorityScore(left))[0] ?? mockRenalCharts[0];
  const bundle = getRenalFhirBundle(chart);
  const resourceRows = [
    ["Patient", "Identity, demographics, contact, clinical flags"],
    ["Encounter", "Admission, bed, ward, care context"],
    ["Observation", "Urine output, intake, output, balance, weight-based UOP"],
    ["Device", "Foley catheter, drains, tubes, active device state"],
    ["DiagnosticReport", "Renal lab report summary and abnormal flags"],
    ["ServiceRequest", "Fluid restriction, dialysis review, renal orders"],
    ["AuditEvent", "View, print, acknowledge, sign-off audit"],
    ["Provenance", "Author/source for nursing, doctor, and lab data"],
  ] as const;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle>FHIR Resource Map</CardTitle>
            <CardDescription>Renal data grouped by interoperable clinical resource.</CardDescription>
          </div>
          <Badge tone="info">HL7 FHIR R4</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <ClinicalTable minWidth="760px">
            <thead>
              <tr>
                <ClinicalTh>Resource</ClinicalTh>
                <ClinicalTh>Renal use</ClinicalTh>
                <ClinicalTh>Status</ClinicalTh>
                <ClinicalTh>Example reference</ClinicalTh>
              </tr>
            </thead>
            <tbody>
              {resourceRows.map(([resource, use]) => {
                const mapped = bundle.find((item) => item.resource === resource);
                return (
                  <tr key={resource}>
                    <ClinicalTd className="font-semibold">{resource}</ClinicalTd>
                    <ClinicalTd>{use}</ClinicalTd>
                    <ClinicalTd><StatusPill tone={fhirStatusTone(mapped?.status ?? "Pending")}>{mapped?.status ?? "Pending"}</StatusPill></ClinicalTd>
                    <ClinicalTd>{mapped?.reference ?? `${resource}/pending`}</ClinicalTd>
                  </tr>
                );
              })}
            </tbody>
          </ClinicalTable>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Selected Bundle</CardTitle>
            <CardDescription>{patientName(chart.patientId)} • {chart.bedNo}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {bundle.map((resource) => (
            <div className="rounded-md border border-border bg-surface-muted p-3" key={resource.resource}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{resource.resource}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{resource.reference}</div>
                </div>
                <StatusPill tone={fhirStatusTone(resource.status)}>{resource.status}</StatusPill>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{resource.payload}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RenalActionScopePanel() {
  const rows = [
    ["Nurse", "I/O entry, drains, shift note", "Observation + Device"],
    ["Doctor", "Review, orders, sign-off", "ServiceRequest + DiagnosticReport"],
    ["Lab", "Renal investigation update", "DiagnosticReport"],
    ["Billing", "Dialysis service handoff", "ServiceRequest"],
    ["Management", "Read-only queue review", "AuditEvent"],
  ] as const;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Action Scope</CardTitle>
          <CardDescription>Role actions mapped to clinical resources.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ClinicalTable minWidth="680px">
          <thead>
            <tr>
              <ClinicalTh>Role</ClinicalTh>
              <ClinicalTh>Action</ClinicalTh>
              <ClinicalTh>FHIR resource</ClinicalTh>
            </tr>
          </thead>
          <tbody>
            {rows.map(([role, action, resource]) => (
              <tr key={role}>
                <ClinicalTd className="font-semibold">{role}</ClinicalTd>
                <ClinicalTd>{action}</ClinicalTd>
                <ClinicalTd>{resource}</ClinicalTd>
              </tr>
            ))}
          </tbody>
        </ClinicalTable>
      </CardContent>
    </Card>
  );
}

export function RenalPatientsPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<RenalPatientChart | null>(null);
  const [action, setAction] = React.useState<OverviewActionRequest | null>(null);
  const rows = mockRenalCharts.filter((chart) => {
    const patient = getPatientById(chart.patientId);
    const text = `${patient?.firstName} ${patient?.lastName} ${patient?.uhid} ${chart.bedNo} ${chart.ward} ${chart.consultant} ${chart.nephrologist} ${chart.renalStatus}`;
    return includes(text, search) && (status === "All status" || chart.renalStatus === status);
  });
  const columns = useRenalChartColumns(setSelected);

  return (
    <ProtectedRenal>
      {(access) => (
        <div className="space-y-5">
          <PageHeader
            eyebrow="Renal System"
            title="Renal Patient Charts"
            description="Active inpatient renal charts with patient, ward, status, fluid restriction, cumulative balance, and review action."
            actions={
              <>
                <PrintButton label="Print charts" />
                <Button disabled={!access.canEnterIO} onClick={() => setAction({ type: "entry" })}><Plus className="h-4 w-4" />Create chart</Button>
              </>
            }
          />
          <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, bed, ward, consultant, renal status...">
            <NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Stable", "AKI watch", "Fluid overload", "Critical", "Dialysis review"]} />
          </FilterBar>
          <DataTable data={rows} columns={columns} />
          <RenalChartDrawer chart={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
          <RenalOverviewActionDrawer action={action} open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)} />
        </div>
      )}
    </ProtectedRenal>
  );
}

export function RenalPatientWorkspace({ patientId }: { patientId: string }) {
  const chart = getRenalChartByPatient(patientId);
  const access = useRenalAccess();
  const [action, setAction] = React.useState<OverviewActionRequest | null>(null);
  const [shiftNote, setShiftNote] = React.useState("");
  const [dirty, setDirty] = React.useState(false);

  if (!chart) {
    return (
      <ProtectedRenal>
        {() => <EmptyState icon={Search} title="Renal chart not found" description="No renal chart is available for the selected patient." />}
      </ProtectedRenal>
    );
  }

  const intake = getRenalIntakeByPatient(patientId);
  const output = getRenalOutputByPatient(patientId);
  const drains = getRenalDrainsByPatient(patientId);
  const alerts = getRenalAlertsByPatient(patientId);
  const balanceRows = getRenalBalanceRows(patientId);
  const totalIntakeMl = sumValues(intake, totalIntake);
  const totalOutputMl = sumValues(output, totalOutput);
  const balanceMl = totalIntakeMl - totalOutputMl;
  const latestLab = getRenalLabsByPatient(patientId)[0];
  const readOnly = !access.canEnterIO && !access.canReview;

  return (
    <ProtectedRenal>
      {() => (
        <div className="space-y-5">
          <PageHeader
            eyebrow="Renal System"
            title={`${patientName(patientId)} Renal Chart`}
            description="Production-style renal workspace for hourly urine output, 24-hour fluid balance, drains, labs, notes, and signed report workflow."
            actions={
              <>
                <PrintButton label="Print report" />
                <Button variant="outline" disabled={!access.canReview} onClick={() => setAction({ type: "review", chart })}>
                  <ClipboardCheck className="h-4 w-4" />
                  Doctor sign-off
                </Button>
                <Button disabled={!access.canEnterIO} onClick={() => setAction({ type: "entry", chart, entryMode: "io" })}>
                  <Plus className="h-4 w-4" />
                  Add I/O entry
                </Button>
              </>
            }
          />

          <RenalPatientHeader
            patientId={patientId}
            bedNo={chart.bedNo}
            ward={chart.ward}
            consultant={chart.consultant}
            nephrologist={chart.nephrologist}
            status={chart.renalStatus}
            windowLabel={chart.windowLabel}
          />

          {alerts.some((alert) => alert.severity === "Critical") ? (
            <AlertBanner icon={ShieldAlert} tone="critical" title="Critical renal alert">
              {alerts.filter((alert) => alert.severity === "Critical").map((alert) => alert.title).join(" • ")}
            </AlertBanner>
          ) : (
            <RenalRoleBanner role={access.role} />
          )}

          <Tabs defaultValue="overview" className="space-y-4">
            <div className="sticky top-0 z-30 -mx-1 border-y border-border bg-background/95 px-1 py-2 backdrop-blur">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="io">I/O Chart</TabsTrigger>
                <TabsTrigger value="drains-labs">Labs & Orders</TabsTrigger>
                <TabsTrigger value="notes">Notes & Sign-off</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 2xl:grid-cols-[0.95fr_1fr_1.25fr]">
                <RenalOverviewSection
                  chart={chart}
                  totalIntakeMl={totalIntakeMl}
                  totalOutputMl={totalOutputMl}
                  balanceMl={balanceMl}
                  drainsCount={drains.filter((drain) => drain.deviceStatus !== "Removed placeholder").length}
                  latestCreatinine={latestLab?.creatinine ?? "Pending"}
                />
                <UrineHourlySection patientId={patientId} />
                <FluidSummarySection chart={chart} intake={intake} output={output} balanceMl={balanceMl} />
              </div>
            </TabsContent>

            <TabsContent value="io" className="space-y-4">
              <DetailedIntakeSection intake={intake} />
              <DetailedDrainsSection drains={drains} />
              <CompleteBalanceSection rows={balanceRows} cumulativeBalanceMl={chart.cumulativeBalanceMl} />
            </TabsContent>

            <TabsContent value="drains-labs" className="space-y-4">
              <RenalLabsOrdersSection chart={chart} onAction={setAction} access={access} />
              <BalanceTrendSection rows={balanceRows} />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <RenalNotesActions
                  access={access}
                  chart={chart}
                  note={shiftNote}
                  onNoteChange={(value) => {
                    setShiftNote(value);
                    setDirty(true);
                  }}
                  onAction={setAction}
                  onStageNote={() => {
                    setDirty(true);
                    toast.success("Renal note staged for this patient");
                  }}
                />
                <RenalSignOffSummary chart={chart} alerts={alerts} balanceMl={balanceMl} access={access} onAction={setAction} />
              </div>
            </TabsContent>
          </Tabs>

          <StickyActionBar
            dirty={dirty}
            readOnly={readOnly}
            saveLabel="Save renal chart"
            onReset={() => {
              setShiftNote("");
              setDirty(false);
              setAction(null);
              toast.info(`Renal chart draft reset for ${patientName(patientId)}`);
            }}
            onSave={() => {
              setDirty(false);
              toast.success(`Renal chart saved for ${patientName(patientId)}`);
            }}
          />
          <RenalOverviewActionDrawer action={action} open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)} />
        </div>
      )}
    </ProtectedRenal>
  );
}

function RenalOverviewSection({
  chart,
  totalIntakeMl,
  totalOutputMl,
  balanceMl,
  drainsCount,
  latestCreatinine,
}: {
  chart: RenalPatientChart;
  totalIntakeMl: number;
  totalOutputMl: number;
  balanceMl: number;
  drainsCount: number;
  latestCreatinine: string;
}) {
  const hourlyUrine = getRenalHourlyUrineByPatient(chart.patientId);
  const currentUrine = hourlyUrine.length ? hourlyUrine[hourlyUrine.length - 1].runningTotalMl : 0;

  return (
    <SectionShell number={1} title="Renal System - Overview">
      <div className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <RenalMetricCard label="Urine output (12 hrs)" value={formatMl(currentUrine)} subtext={chart.shiftLabel} tone={currentUrine < 300 ? "critical" : "info"} />
          <RenalMetricCard label="Fluid balance (24 hrs)" value={formatSignedMl(balanceMl)} subtext={`Target ${formatSignedMl(chart.targetBalanceMl)}`} tone={balanceMl > chart.targetBalanceMl ? "warning" : "success"} />
          <RenalMetricCard label="Cumulative balance" value={formatSignedMl(chart.cumulativeBalanceMl)} subtext="Since renal chart opened" tone={chart.cumulativeBalanceMl > 3000 ? "critical" : "warning"} />
          <RenalMetricCard label="Total intake (24 hrs)" value={formatMl(totalIntakeMl)} subtext={`Restriction ${formatMl(chart.fluidRestrictionMl)}`} tone={totalIntakeMl > chart.fluidRestrictionMl ? "danger" : "info"} />
          <RenalMetricCard label="Total output (24 hrs)" value={formatMl(totalOutputMl)} subtext="Urine + drains + other" tone="success" />
          <RenalMetricCard label="Active drains" value={drainsCount} subtext={`Creatinine ${latestCreatinine}`} tone={drainsCount > 2 ? "warning" : "muted"} />
        </div>
        <div className="rounded-lg border border-border bg-surface-muted p-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            {chart.riskFlags.map((flag) => <Badge key={flag} tone={statusTone(flag)}>{flag}</Badge>)}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <span>Catheter: {chart.catheterStatus}</span>
            <span>Dialysis: {chart.dialysisStatus}</span>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function UrineHourlySection({ patientId }: { patientId: string }) {
  const [range, setRange] = React.useState("12h");
  const rows = getRenalHourlyUrineByPatient(patientId);
  const visibleRows = range === "12h" ? rows.slice(-12) : rows;
  return (
    <SectionShell
      number={2}
      title="Urine Output - Per Hour"
      action={
        <Tabs value={range} onValueChange={setRange}>
          <TabsList className="h-8 p-0">
            <TabsTrigger value="12h">12 Hours</TabsTrigger>
            <TabsTrigger value="24h">24 Hours</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      <ClinicalTable minWidth="560px">
        <thead>
          <tr>
            <ClinicalTh>Time</ClinicalTh>
            <ClinicalTh className="text-right">Per hour</ClinicalTh>
            <ClinicalTh className="text-right">{range === "12h" ? "12h total" : "Running total"}</ClinicalTh>
            <ClinicalTh>ml/kg/hr</ClinicalTh>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.id}>
              <ClinicalTd>{row.timeRange}</ClinicalTd>
              <ClinicalTd className="text-right font-medium">{row.perHourMl}</ClinicalTd>
              <ClinicalTd className="text-right">{row.runningTotalMl}</ClinicalTd>
              <ClinicalTd><StatusPill tone={statusTone(row.status)}>{row.mlPerKgHr.toFixed(1)}</StatusPill></ClinicalTd>
            </tr>
          ))}
        </tbody>
      </ClinicalTable>
    </SectionShell>
  );
}

function FluidSummarySection({
  chart,
  intake,
  output,
  balanceMl,
}: {
  chart: RenalPatientChart;
  intake: RenalIntakeEntry[];
  output: RenalOutputEntry[];
  balanceMl: number;
}) {
  const totalIntakeMl = sumValues(intake, totalIntake);
  const totalOutputMl = sumValues(output, totalOutput);
  const intakeSummary = [
    ["IV fluids", sumValues(intake, (entry) => entry.ivFluidsMl)],
    ["Oral intake", sumValues(intake, (entry) => entry.oralIntakeMl)],
    ["Medications / flush", sumValues(intake, (entry) => entry.medicationsFlushMl)],
    ["Blood / products", sumValues(intake, (entry) => entry.bloodProductsMl)],
  ] as const;
  const outputSummary = [
    ["Urine output", sumValues(output, (entry) => entry.urineOutputMl)],
    ["Drains output", sumValues(output, (entry) => entry.drainsOutputMl)],
    ["Stool / other", sumValues(output, (entry) => entry.stoolOtherMl)],
    ["Insensible loss", sumValues(output, (entry) => entry.insensibleLossMl)],
  ] as const;

  return (
    <SectionShell number={3} title="Fluid Balance - 24 Hours Summary" action={<Badge tone="muted">{chart.lastReviewedAt}</Badge>}>
      <div className="space-y-3 p-4">
        <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">{chart.windowLabel}</div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <RenalMetricCard label="Total intake" value={formatMl(totalIntakeMl)} subtext="24h" tone="info" />
          <RenalMetricCard label="Total output" value={formatMl(totalOutputMl)} subtext="24h" tone="success" />
          <RenalMetricCard label="24h balance" value={formatSignedMl(balanceMl)} subtext="Intake - output" tone={balanceMl > chart.targetBalanceMl ? "warning" : "success"} />
          <RenalMetricCard label="Cumulative" value={formatSignedMl(chart.cumulativeBalanceMl)} subtext="Chart total" tone="critical" />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <SummaryList title="Intake summary" rows={intakeSummary} total={totalIntakeMl} />
          <SummaryList title="Output summary" rows={outputSummary} total={totalOutputMl} />
        </div>
      </div>
    </SectionShell>
  );
}

function SummaryList({ title, rows, total }: { title: string; rows: readonly (readonly [string, number])[]; total: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">{title}</div>
      {rows.map(([label, value]) => (
        <div className="flex justify-between border-b border-border px-3 py-2 text-xs last:border-0" key={label}>
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{formatMl(value)}</span>
        </div>
      ))}
      <div className="flex justify-between bg-surface-muted px-3 py-2 text-xs font-semibold">
        <span>Total</span>
        <span>{formatMl(total)}</span>
      </div>
    </div>
  );
}

function DetailedIntakeSection({ intake }: { intake: RenalIntakeEntry[] }) {
  const [activeTab, setActiveTab] = React.useState("iv");
  const intakeTabs = React.useMemo(() => [
    {
      value: "iv",
      label: "IV Fluids",
      shortLabel: "IV",
      valueOf: (entry: RenalIntakeEntry) => entry.ivFluidsMl,
      tone: "info" as StatusTone,
    },
    {
      value: "oral",
      label: "Oral Intake",
      shortLabel: "Oral",
      valueOf: (entry: RenalIntakeEntry) => entry.oralIntakeMl,
      tone: "success" as StatusTone,
    },
    {
      value: "flush",
      label: "Medications / Flush",
      shortLabel: "Med/Flush",
      valueOf: (entry: RenalIntakeEntry) => entry.medicationsFlushMl,
      tone: "warning" as StatusTone,
    },
    {
      value: "blood",
      label: "Blood / Products",
      shortLabel: "Blood",
      valueOf: (entry: RenalIntakeEntry) => entry.bloodProductsMl,
      tone: "danger" as StatusTone,
    },
  ], []);
  const selectedTab = intakeTabs.find((tab) => tab.value === activeTab) ?? intakeTabs[0];
  const selectedTotal = sumValues(intake, selectedTab.valueOf);
  const activeSlots = intake.filter((entry) => selectedTab.valueOf(entry) > 0).length;
  const averageMl = intake.length ? Math.round(selectedTotal / intake.length) : 0;

  return (
    <SectionShell number={4} title="Fluid Balance - Detailed Input" action={<Badge tone={selectedTab.tone}>{formatMl(selectedTotal)}</Badge>}>
      <div className="space-y-3 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            {intakeTabs.map((tab) => (
              <TabsTrigger value={tab.value} key={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-2 sm:grid-cols-4">
          <RenalMetricCard label={selectedTab.label} value={formatMl(selectedTotal)} subtext="24h category total" tone={selectedTab.tone} />
          <RenalMetricCard label="Active slots" value={activeSlots} subtext={`${intake.length} hourly rows`} tone={activeSlots ? "info" : "muted"} />
          <RenalMetricCard label="Average / slot" value={formatMl(averageMl)} subtext={selectedTab.shortLabel} tone="muted" />
          <RenalMetricCard label="All intake" value={formatMl(sumValues(intake, totalIntake))} subtext="Across all tabs" tone="info" />
        </div>

        <ClinicalTable minWidth="720px">
          <thead>
            <tr>
              <ClinicalTh>Time</ClinicalTh>
              <ClinicalTh className="text-right">{selectedTab.label}</ClinicalTh>
              <ClinicalTh className="text-right">Hour total</ClinicalTh>
              <ClinicalTh>Entered by</ClinicalTh>
              <ClinicalTh>Status</ClinicalTh>
            </tr>
          </thead>
          <tbody>
            {intake.map((entry) => (
              <tr key={entry.id}>
                <ClinicalTd>{entry.timeRange}</ClinicalTd>
                <ClinicalTd className="text-right font-semibold">{formatMl(selectedTab.valueOf(entry))}</ClinicalTd>
                <ClinicalTd className="text-right">{formatMl(totalIntake(entry))}</ClinicalTd>
                <ClinicalTd>{entry.enteredBy}</ClinicalTd>
                <ClinicalTd><StatusPill tone={statusTone(entry.status)}>{entry.status}</StatusPill></ClinicalTd>
              </tr>
            ))}
            <tr>
              <ClinicalTd className="font-semibold">Total (24 hrs)</ClinicalTd>
              <ClinicalTd className="text-right font-semibold">{formatMl(selectedTotal)}</ClinicalTd>
              <ClinicalTd className="text-right font-semibold">{formatMl(sumValues(intake, totalIntake))}</ClinicalTd>
              <ClinicalTd>{activeSlots} active slots</ClinicalTd>
              <ClinicalTd><StatusPill tone={selectedTab.tone}>{selectedTab.shortLabel}</StatusPill></ClinicalTd>
            </tr>
          </tbody>
        </ClinicalTable>
      </div>
    </SectionShell>
  );
}

function DetailedDrainsSection({ drains }: { drains: RenalDrainRecord[] }) {
  return (
    <SectionShell number={5} title="Fluid Balance - Detailed Output">
      <ClinicalTable minWidth="620px">
        <thead>
          <tr>
            <ClinicalTh>Drain / Site</ClinicalTh>
            <ClinicalTh>Status</ClinicalTh>
            <ClinicalTh className="text-right">24h output</ClinicalTh>
            <ClinicalTh>Concern</ClinicalTh>
          </tr>
        </thead>
        <tbody>
          {drains.map((drain) => (
            <tr key={drain.id}>
              <ClinicalTd>
                <div className="font-medium">{drain.drainName}</div>
                <div className="text-[11px] text-muted-foreground">{drain.site} • {drain.character}</div>
              </ClinicalTd>
              <ClinicalTd><StatusPill tone={statusTone(drain.deviceStatus)}>{drain.deviceStatus}</StatusPill></ClinicalTd>
              <ClinicalTd className="text-right font-semibold">{formatMl(drain.total24HrMl)}</ClinicalTd>
              <ClinicalTd><StatusPill tone={statusTone(drain.concern)}>{drain.concern}</StatusPill></ClinicalTd>
            </tr>
          ))}
          <tr>
            <ClinicalTd className="font-semibold">Total drains output</ClinicalTd>
            <ClinicalTd>{null}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{formatMl(sumValues(drains, (drain) => drain.total24HrMl))}</ClinicalTd>
            <ClinicalTd>{null}</ClinicalTd>
          </tr>
        </tbody>
      </ClinicalTable>
    </SectionShell>
  );
}

function BalanceTrendSection({ rows }: { rows: ReturnType<typeof getRenalBalanceRows> }) {
  const trend = React.useMemo(() => {
    const dayWindowRows = [
      { time: "6 AM", intakeMl: 140, outputMl: 110 },
      { time: "7 AM", intakeMl: 180, outputMl: 135 },
      { time: "8 AM", intakeMl: 170, outputMl: 150 },
      { time: "9 AM", intakeMl: 190, outputMl: 165 },
      { time: "10 AM", intakeMl: 210, outputMl: 180 },
      { time: "11 AM", intakeMl: rows[0]?.totalIntakeMl ?? 280, outputMl: rows[0]?.totalOutputMl ?? 200 },
      { time: "12 PM", intakeMl: rows[1]?.totalIntakeMl ?? 270, outputMl: rows[1]?.totalOutputMl ?? 170 },
      { time: "1 PM", intakeMl: rows[2]?.totalIntakeMl ?? 240, outputMl: rows[2]?.totalOutputMl ?? 170 },
      { time: "2 PM", intakeMl: rows[3]?.totalIntakeMl ?? 280, outputMl: rows[3]?.totalOutputMl ?? 200 },
      { time: "3 PM", intakeMl: rows[4]?.totalIntakeMl ?? 290, outputMl: rows[4]?.totalOutputMl ?? 225 },
      { time: "4 PM", intakeMl: rows[5]?.totalIntakeMl ?? 290, outputMl: rows[5]?.totalOutputMl ?? 240 },
      { time: "5 PM", intakeMl: rows[6]?.totalIntakeMl ?? 290, outputMl: rows[6]?.totalOutputMl ?? 255 },
      { time: "6 PM", intakeMl: rows[7]?.totalIntakeMl ?? 300, outputMl: rows[7]?.totalOutputMl ?? 270 },
    ];

    return dayWindowRows.reduce<Array<{ time: string; intake: number; output: number; balance: number }>>((acc, row) => {
      const previous = acc[acc.length - 1];
      const intake = (previous?.intake ?? 0) + row.intakeMl;
      const output = (previous?.output ?? 0) + row.outputMl;
      return acc.concat({
        time: row.time,
        intake,
        output,
        balance: intake - output,
      });
    }, []);
  }, [rows]);

  return (
    <SectionShell number={6} title="Fluid Balance - Per Hour Overview" action={<Badge tone="muted">6 AM - 6 PM</Badge>}>
      <div className="p-4">
        <Tabs defaultValue="graph">
          <TabsList>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          <TabsContent value="graph">
            <div className="h-[280px] min-w-0 rounded-lg border border-border p-3">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={trend} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--surface))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="intake" name="Intake" stroke="hsl(var(--info))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="output" name="Output" stroke="hsl(var(--danger))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="hsl(var(--success))" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="table">
            <ClinicalTable minWidth="520px">
              <thead>
                <tr><ClinicalTh>Time</ClinicalTh><ClinicalTh className="text-right">Intake</ClinicalTh><ClinicalTh className="text-right">Output</ClinicalTh><ClinicalTh className="text-right">Balance</ClinicalTh></tr>
              </thead>
              <tbody>
                {trend.map((row) => <tr key={row.time}><ClinicalTd>{row.time}</ClinicalTd><ClinicalTd className="text-right">{formatMl(row.intake)}</ClinicalTd><ClinicalTd className="text-right">{formatMl(row.output)}</ClinicalTd><ClinicalTd className="text-right">{formatSignedMl(row.balance)}</ClinicalTd></tr>)}
              </tbody>
            </ClinicalTable>
          </TabsContent>
        </Tabs>
      </div>
    </SectionShell>
  );
}

function CompleteBalanceSection({ rows, cumulativeBalanceMl }: { rows: ReturnType<typeof getRenalBalanceRows>; cumulativeBalanceMl: number }) {
  const displayRows = React.useMemo(() => rows.reduce<Array<ReturnType<typeof getRenalBalanceRows>[number] & { cumulativeMl: number }>>((acc, row) => {
    const previous = acc[acc.length - 1];
    const cumulativeMl = (previous?.cumulativeMl ?? 0) + row.balanceMl;
    return acc.concat({ ...row, cumulativeMl });
  }, []), [rows]);

  return (
    <SectionShell number={7} title="Fluid Balance - Complete 24 Hours Table">
      <ClinicalTable minWidth="980px">
        <thead>
          <tr>
            <ClinicalTh>Time</ClinicalTh>
            <ClinicalTh className="text-right">IV</ClinicalTh>
            <ClinicalTh className="text-right">Oral</ClinicalTh>
            <ClinicalTh className="text-right">Med/flush</ClinicalTh>
            <ClinicalTh className="text-right">Blood</ClinicalTh>
            <ClinicalTh className="text-right">Total intake</ClinicalTh>
            <ClinicalTh className="text-right">Urine</ClinicalTh>
            <ClinicalTh className="text-right">Drains</ClinicalTh>
            <ClinicalTh className="text-right">Other</ClinicalTh>
            <ClinicalTh className="text-right">Total output</ClinicalTh>
            <ClinicalTh className="text-right">Balance</ClinicalTh>
            <ClinicalTh className="text-right">Cumulative</ClinicalTh>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => (
            <tr key={row.id}>
              <ClinicalTd>{row.timeRange}</ClinicalTd>
              <ClinicalTd className="text-right">{row.ivFluidsMl}</ClinicalTd>
              <ClinicalTd className="text-right">{row.oralIntakeMl}</ClinicalTd>
              <ClinicalTd className="text-right">{row.medicationsFlushMl}</ClinicalTd>
              <ClinicalTd className="text-right">{row.bloodProductsMl}</ClinicalTd>
              <ClinicalTd className="text-right font-medium">{row.totalIntakeMl}</ClinicalTd>
              <ClinicalTd className="text-right">{row.urineOutputMl}</ClinicalTd>
              <ClinicalTd className="text-right">{row.drainsOutputMl}</ClinicalTd>
              <ClinicalTd className="text-right">{row.stoolOtherMl}</ClinicalTd>
              <ClinicalTd className="text-right font-medium">{row.totalOutputMl}</ClinicalTd>
              <ClinicalTd className="text-right">{formatSignedMl(row.balanceMl)}</ClinicalTd>
              <ClinicalTd className="text-right">{formatSignedMl(row.cumulativeMl)}</ClinicalTd>
            </tr>
          ))}
          <tr>
            <ClinicalTd className="font-semibold">24h total</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.ivFluidsMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.oralIntakeMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.medicationsFlushMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.bloodProductsMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.totalIntakeMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.urineOutputMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.drainsOutputMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.stoolOtherMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{sumValues(rows, (row) => row.totalOutputMl)}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{formatSignedMl(sumValues(rows, (row) => row.balanceMl))}</ClinicalTd>
            <ClinicalTd className="text-right font-semibold">{formatSignedMl(cumulativeBalanceMl)}</ClinicalTd>
          </tr>
        </tbody>
      </ClinicalTable>
    </SectionShell>
  );
}

function RenalLabsOrdersSection({
  chart,
  access,
  onAction,
}: {
  chart: RenalPatientChart;
  access: ReturnType<typeof useRenalAccess>;
  onAction: (action: OverviewActionRequest) => void;
}) {
  const labs = getRenalLabsByPatient(chart.patientId);
  const orders = getRenalOrdersByPatient(chart.patientId);
  const latestLab = labs[0];
  const activeOrders = orders.filter((order) => order.status === "Active");
  const pendingOrders = orders.filter((order) => order.status === "Pending sign");
  const abnormalLabs = labs.filter((lab) => lab.flag !== "Normal");

  return (
    <SectionShell
      number={8}
      title="Renal Labs & Orders"
      action={
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!access.canUpdateLabs} onClick={() => onAction({ type: "labs", chart })}>
            <FlaskConical className="h-4 w-4" />
            Update labs
          </Button>
          <Button size="sm" disabled={!access.canReview} onClick={() => onAction({ type: "order", chart })}>
            <Plus className="h-4 w-4" />
            Add order
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <RenalMetricCard label="Latest creatinine" value={latestLab?.creatinine ?? "Pending"} subtext={latestLab?.collectedAt ?? "No sample"} tone={statusTone(latestLab?.flag ?? "Pending")} />
          <RenalMetricCard label="Potassium" value={latestLab?.potassium ?? "Pending"} subtext="Electrolyte watch" tone={latestLab?.potassium.includes("5.") || latestLab?.potassium.includes("6.") ? "warning" : "info"} />
          <RenalMetricCard label="eGFR" value={latestLab?.egfr ?? "Pending"} subtext={latestLab?.trend ?? "Trend pending"} tone={statusTone(latestLab?.trend ?? "Pending")} />
          <RenalMetricCard label="Urine protein" value={latestLab?.urineProtein ?? "Pending"} subtext="Urinalysis" tone={latestLab?.urineProtein === "Nil" ? "success" : "warning"} />
          <RenalMetricCard label="Active orders" value={activeOrders.length} subtext={`${orders.length} total orders`} tone="info" />
          <RenalMetricCard label="Pending sign" value={pendingOrders.length} subtext={`${abnormalLabs.length} flagged labs`} tone={pendingOrders.length ? "warning" : "success"} />
        </div>

        <ClinicalTable minWidth="980px">
          <thead>
            <tr>
              <ClinicalTh>Collected</ClinicalTh>
              <ClinicalTh>Creatinine</ClinicalTh>
              <ClinicalTh>Urea</ClinicalTh>
              <ClinicalTh>Sodium</ClinicalTh>
              <ClinicalTh>Potassium</ClinicalTh>
              <ClinicalTh>eGFR</ClinicalTh>
              <ClinicalTh>Urine protein</ClinicalTh>
              <ClinicalTh>Trend</ClinicalTh>
              <ClinicalTh>Flag</ClinicalTh>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr key={lab.id}>
                <ClinicalTd>{lab.collectedAt}</ClinicalTd>
                <ClinicalTd className="font-semibold">{lab.creatinine}</ClinicalTd>
                <ClinicalTd>{lab.urea}</ClinicalTd>
                <ClinicalTd>{lab.sodium}</ClinicalTd>
                <ClinicalTd className="font-semibold">{lab.potassium}</ClinicalTd>
                <ClinicalTd>{lab.egfr}</ClinicalTd>
                <ClinicalTd>{lab.urineProtein}</ClinicalTd>
                <ClinicalTd><StatusPill tone={statusTone(lab.trend)}>{lab.trend}</StatusPill></ClinicalTd>
                <ClinicalTd><StatusPill tone={statusTone(lab.flag)}>{lab.flag}</StatusPill></ClinicalTd>
              </tr>
            ))}
          </tbody>
        </ClinicalTable>

        <ClinicalTable minWidth="860px">
          <thead>
            <tr>
              <ClinicalTh>Order</ClinicalTh>
              <ClinicalTh>Target / instruction</ClinicalTh>
              <ClinicalTh>Ordered by</ClinicalTh>
              <ClinicalTh>Ordered at</ClinicalTh>
              <ClinicalTh>Status</ClinicalTh>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <ClinicalTd className="font-semibold">{order.order}</ClinicalTd>
                <ClinicalTd>{order.target}</ClinicalTd>
                <ClinicalTd>{order.orderedBy}</ClinicalTd>
                <ClinicalTd>{order.orderedAt}</ClinicalTd>
                <ClinicalTd><StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill></ClinicalTd>
              </tr>
            ))}
          </tbody>
        </ClinicalTable>
      </div>
    </SectionShell>
  );
}

function RenalSignOffSummary({
  chart,
  alerts,
  balanceMl,
  access,
  onAction,
}: {
  chart: RenalPatientChart;
  alerts: RenalAlert[];
  balanceMl: number;
  access: ReturnType<typeof useRenalAccess>;
  onAction: (action: OverviewActionRequest) => void;
}) {
  const openAlerts = alerts.filter((alert) => alert.status !== "Acknowledged");
  const pendingOrders = getRenalOrdersByPatient(chart.patientId).filter((order) => order.status === "Pending sign");
  const balanceTone: StatusTone = balanceMl > chart.targetBalanceMl ? "warning" : "success";

  return (
    <SectionShell number={10} title="Sign-off Checklist" action={<Badge tone={access.canReview ? "info" : "muted"}>{access.role}</Badge>}>
      <div className="space-y-3 p-4">
        <SignOffCheck label="Clinical review" value={access.canReview ? "Enabled" : "Read only"} tone={access.canReview ? "success" : "muted"} />
        <SignOffCheck label="24h balance" value={`${formatSignedMl(balanceMl)} / target ${formatSignedMl(chart.targetBalanceMl)}`} tone={balanceTone} />
        <SignOffCheck label="Open alerts" value={`${openAlerts.length} pending`} tone={openAlerts.length ? "warning" : "success"} />
        <SignOffCheck label="Pending orders" value={`${pendingOrders.length} require sign`} tone={pendingOrders.length ? "warning" : "success"} />
        <SignOffCheck label="Dialysis state" value={chart.dialysisStatus} tone={statusTone(chart.dialysisStatus)} />
        <Button className="w-full" disabled={!access.canReview} onClick={() => onAction({ type: "review", chart })}>
          <ClipboardCheck className="h-4 w-4" />
          Open doctor sign-off
        </Button>
      </div>
    </SectionShell>
  );
}

function SignOffCheck({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
        </div>
        <StatusPill tone={tone}>Check</StatusPill>
      </div>
    </div>
  );
}

function RenalNotesActions({
  access,
  chart,
  note,
  onNoteChange,
  onAction,
  onStageNote,
}: {
  access: ReturnType<typeof useRenalAccess>;
  chart: RenalPatientChart;
  note: string;
  onNoteChange: (value: string) => void;
  onAction: (action: OverviewActionRequest) => void;
  onStageNote: () => void;
}) {
  const orders = getRenalOrdersByPatient(chart.patientId);
  const canWriteNote = access.canEnterIO || access.canReview;
  return (
    <div className="grid gap-4">
      <SectionShell number={8} title="Notes">
        <div className="space-y-3 p-3">
          <textarea
            className="min-h-[128px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Shift renal note..."
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            disabled={!canWriteNote}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{note.trim() ? `${note.trim().length} characters drafted` : "No note drafted"}</span>
            <Button size="sm" variant="outline" disabled={!canWriteNote || !note.trim()} onClick={onStageNote}>
              Stage note
            </Button>
          </div>
          <div className="space-y-2">
            {orders.map((order) => (
              <div className="rounded-md border border-border bg-surface-muted p-2 text-xs" key={order.id}>
                <div className="font-semibold text-foreground">{order.order}</div>
                <div className="mt-1 text-muted-foreground">{order.target} • {order.status}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
      <SectionShell number={9} title="Actions">
        <div className="grid gap-2 p-3">
          <Button variant="outline" disabled={!access.canEnterIO} onClick={() => onAction({ type: "entry", chart, entryMode: "intake" })}>
            <Plus className="h-4 w-4" />
            Add intake entry
          </Button>
          <Button variant="outline" disabled={!access.canEnterIO} onClick={() => onAction({ type: "entry", chart, entryMode: "output" })}>
            <Droplets className="h-4 w-4" />
            Add output entry
          </Button>
          <Button variant="outline" disabled={!access.canUpdateLabs} onClick={() => onAction({ type: "labs", chart })}>
            <FlaskConical className="h-4 w-4" />
            Update renal labs
          </Button>
          <Button variant="outline" asChild><Link href="/renal/fluid-balance">View all records</Link></Button>
          <Button disabled={!access.canReview} onClick={() => onAction({ type: "review", chart })}>
            <ClipboardCheck className="h-4 w-4" />
            Sign report
          </Button>
        </div>
      </SectionShell>
    </div>
  );
}

export function RenalFluidBalancePage() {
  const rows = mockRenalCharts.map((chart) => {
    const balanceRows = getRenalBalanceRows(chart.patientId);
    return {
      ...chart,
      totalIntakeMl: sumValues(balanceRows, (row) => row.totalIntakeMl),
      totalOutputMl: sumValues(balanceRows, (row) => row.totalOutputMl),
      balanceMl: sumValues(balanceRows, (row) => row.balanceMl),
    };
  });
  const columns = React.useMemo<ColumnDef<(typeof rows)[number]>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Bed/Ward", cell: ({ row }) => `${row.original.bedNo} • ${row.original.ward}` },
    { header: "Status", cell: ({ row }) => <RenalStatusBadge status={row.original.renalStatus} /> },
    { header: "Intake", cell: ({ row }) => formatMl(row.original.totalIntakeMl) },
    { header: "Output", cell: ({ row }) => formatMl(row.original.totalOutputMl) },
    { header: "24h balance", cell: ({ row }) => <BalanceBadge value={row.original.balanceMl} /> },
    { header: "Cumulative", cell: ({ row }) => <BalanceBadge value={row.original.cumulativeBalanceMl} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" asChild><Link href={`/renal/patients/${row.original.patientId}`}>Open</Link></Button> },
  ], []);

  return (
    <ProtectedRenal>
      {() => (
        <div className="space-y-5">
          <PageHeader eyebrow="Renal System" title="Fluid Balance" description="24-hour intake, output, balance, and cumulative renal chart summary across active inpatients." actions={<><PrintButton label="Print balance" /><Button variant="outline"><Download className="h-4 w-4" />Export</Button></>} />
          <SummaryGrid>
            <StatCard label="Total intake" value={sumValues(rows, (row) => row.totalIntakeMl)} change="ml" context="All active charts" tone="info" icon={Droplets} />
            <StatCard label="Total output" value={sumValues(rows, (row) => row.totalOutputMl)} change="ml" context="Urine + drains" tone="success" icon={Activity} />
            <StatCard label="Positive balances" value={rows.filter((row) => row.balanceMl > 0).length} change="Review" context="Clinical watch" tone="warning" icon={Gauge} />
            <StatCard label="Critical alerts" value={mockRenalAlerts.filter((alert) => alert.severity === "Critical").length} change="Escalate" context="Renal rules" tone="critical" icon={ShieldAlert} />
          </SummaryGrid>
          <DataTable data={rows} columns={columns} />
        </div>
      )}
    </ProtectedRenal>
  );
}

export function RenalDrainsPage() {
  const [selected, setSelected] = React.useState<RenalDrainRecord | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const columns = React.useMemo<ColumnDef<RenalDrainRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Drain", accessorKey: "drainName" },
    { header: "Site", accessorKey: "site" },
    { header: "Status", cell: ({ row }) => <StatusPill tone={statusTone(row.original.deviceStatus)}>{row.original.deviceStatus}</StatusPill> },
    { header: "24h output", cell: ({ row }) => formatMl(row.original.total24HrMl) },
    { header: "Character", accessorKey: "character" },
    { header: "Concern", cell: ({ row }) => <StatusPill tone={statusTone(row.original.concern)}>{row.original.concern}</StatusPill> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], []);

  return (
    <ProtectedRenal>
      {(access) => (
        <div className="space-y-5">
          <PageHeader eyebrow="Renal System" title="Drains & Devices" description="Drain-wise renal output monitoring with site, device state, character, concern, and review action." actions={<><PrintButton label="Print drains" /><Button disabled={!access.canEnterIO} onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add drain reading</Button></>} />
          <SummaryGrid>
            <StatCard label="Active drains" value={mockRenalDrains.filter((drain) => drain.deviceStatus !== "Removed placeholder").length} change="Devices" context="Across renal charts" tone="info" icon={Droplets} />
            <StatCard label="High output" value={mockRenalDrains.filter((drain) => drain.concern === "High output").length} change="Watch" context="Drain alerts" tone="warning" icon={AlertTriangle} />
            <StatCard label="Total drain output" value={sumValues(mockRenalDrains, (drain) => drain.total24HrMl)} change="ml" context="24h" tone="success" icon={Activity} />
            <StatCard label="Removed" value={mockRenalDrains.filter((drain) => drain.deviceStatus === "Removed placeholder").length} change="Audit" context="Line lifecycle" tone="muted" icon={ClipboardCheck} />
          </SummaryGrid>
          <DataTable data={mockRenalDrains} columns={columns} />
          <DrainReadingModal open={addOpen} onOpenChange={setAddOpen} canSubmit={access.canEnterIO} />
          <DrainReviewModal drain={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} canSubmit={access.canEnterIO || access.canReview} />
        </div>
      )}
    </ProtectedRenal>
  );
}

export function RenalLabsPage() {
  const firstChart = mockRenalCharts[0];
  const [search, setSearch] = React.useState("");
  const [flagFilter, setFlagFilter] = React.useState("All flags");
  const [sort, setSort] = React.useState("Latest");
  const [reviewLab, setReviewLab] = React.useState<RenalLabRecord | null>(null);
  const [updatePatientId, setUpdatePatientId] = React.useState(firstChart?.patientId ?? "");
  const [updateOpen, setUpdateOpen] = React.useState(false);

  const rows = React.useMemo(() => {
    const filtered = mockRenalLabs.filter((lab) => {
      const matchesSearch = search.trim() ? includes(renalLabSearchText(lab), search.trim()) : true;
      const matchesFlag = flagFilter === "All flags" || lab.flag === flagFilter;
      return matchesSearch && matchesFlag;
    });
    return sortRenalLabs(filtered, sort);
  }, [flagFilter, search, sort]);

  const columns = React.useMemo<ColumnDef<RenalLabRecord>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Collected", accessorKey: "collectedAt" },
    { header: "Creatinine", accessorKey: "creatinine" },
    { header: "Urea", accessorKey: "urea" },
    { header: "Sodium", accessorKey: "sodium" },
    { header: "Potassium", accessorKey: "potassium" },
    { header: "eGFR", accessorKey: "egfr" },
    { header: "Flag", cell: ({ row }) => <StatusPill tone={statusTone(row.original.flag)}>{row.original.flag}</StatusPill> },
    { header: "Trend", cell: ({ row }) => <StatusPill tone={statusTone(row.original.trend)}>{row.original.trend}</StatusPill> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" onClick={() => setReviewLab(row.original)}>Review</Button>
          <Button
            size="sm"
            onClick={() => {
              setUpdatePatientId(row.original.patientId);
              setUpdateOpen(true);
            }}
          >
            Update
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <ProtectedRenal>
      {(access) => (
        <div className="space-y-5">
          <PageHeader
            eyebrow="Renal System"
            title="Renal Labs"
            description="Creatinine, urea, electrolytes, eGFR, urine protein, abnormal flags, and renal trend review."
            actions={
              <>
                <PrintButton label="Print labs" />
                <Button
                  disabled={!access.canUpdateLabs}
                  onClick={() => {
                    setUpdatePatientId(firstChart?.patientId ?? "");
                    setUpdateOpen(true);
                  }}
                >
                  <FlaskConical className="h-4 w-4" />
                  Update labs
                </Button>
              </>
            }
          />
          <AlertBanner icon={FlaskConical} tone="warning" title="Critical value visibility">Critical potassium, creatinine trend, and dialysis review indicators remain visible in the renal workspace.</AlertBanner>
          <SummaryGrid>
            <StatCard label="Total lab rows" value={mockRenalLabs.length} change="Results" context="Renal diagnostics" tone="info" icon={FlaskConical} />
            <StatCard label="Critical results" value={mockRenalLabs.filter((lab) => lab.flag === "Critical").length} change="Escalate" context="Doctor acknowledgement" tone="critical" icon={ShieldAlert} />
            <StatCard label="Worsening trend" value={mockRenalLabs.filter((lab) => lab.trend === "Worsening").length} change="Review" context="Creatinine / eGFR watch" tone="warning" icon={Activity} />
            <StatCard label="Pending sign orders" value={mockRenalOrders.filter((order) => order.status === "Pending sign").length} change="Orders" context="Renal orders" tone="danger" icon={ClipboardCheck} />
          </SummaryGrid>
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Search patient, creatinine, potassium, eGFR, flag, trend..."
          >
            <Badge tone="info">{rows.length} results</Badge>
            <NativeSelect label="Flag" value={flagFilter} onChange={setFlagFilter} options={["All flags", "Critical", "Watch", "Normal"]} />
            <NativeSelect label="Sort labs" value={sort} onChange={setSort} options={["Latest", "Patient", "Flag severity", "Worsening first", "Potassium high-low"]} />
            <Button variant="outline" onClick={() => { setSearch(""); setFlagFilter("All flags"); setSort("Latest"); }}>Reset</Button>
          </FilterBar>
          <DataTable data={rows} columns={columns} />
          <RenalLabEntryModal
            key={updatePatientId}
            open={updateOpen}
            onOpenChange={setUpdateOpen}
            patientId={updatePatientId}
            canSubmit={access.canUpdateLabs}
          />
          <RenalLabReviewModal lab={reviewLab} open={Boolean(reviewLab)} onOpenChange={(open) => !open && setReviewLab(null)} canSubmit={access.canReview || access.canUpdateLabs} />
        </div>
      )}
    </ProtectedRenal>
  );
}

export function RenalReportsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [sort, setSort] = React.useState("Status priority");
  const [workflow, setWorkflow] = React.useState<"balance" | "signoff" | "billing" | "emr" | null>(null);
  const [selectedSession, setSelectedSession] = React.useState<DialysisSession | null>(null);

  const rows = React.useMemo(() => {
    const filtered = mockDialysisSessions.filter((session) => {
      const matchesSearch = search.trim() ? includes(dialysisSessionSearchText(session), search.trim()) : true;
      const matchesStatus = statusFilter === "All status" || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortDialysisSessions(filtered, sort);
  }, [search, sort, statusFilter]);

  const dialysisColumns = React.useMemo<ColumnDef<DialysisSession>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Session", accessorKey: "sessionNo" },
    { header: "Modality", accessorKey: "modality" },
    { header: "Scheduled", accessorKey: "scheduledAt" },
    { header: "Access", accessorKey: "accessSite" },
    { header: "UF target", cell: ({ row }) => formatMl(row.original.ufTargetMl) },
    { header: "UF removed", cell: ({ row }) => formatMl(row.original.ufRemovedMl) },
    { header: "Status", cell: ({ row }) => <StatusPill tone={statusTone(row.original.status)}>{row.original.status}</StatusPill> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelectedSession(row.original)}>Review</Button> },
  ], []);

  return (
    <ProtectedRenal>
      {(access) => (
        <div className="space-y-5">
          <PageHeader
            eyebrow="Renal System"
            title="Reports & Dialysis"
            description="Renal chart print, doctor sign-off, dialysis session summary, billing-ready service rows, and EMR handoff."
            actions={
              <>
                <PrintButton label="Print renal report" />
                <Button variant="outline" onClick={() => toast.success("Renal report PDF export queued in static workflow")}>
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button disabled={!access.canReview} onClick={() => setWorkflow("emr")}>Send to EMR</Button>
              </>
            }
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <ReportCard title="24h fluid balance" value={`${mockRenalCharts.length} patients`} status="Ready to print" actionLabel="Preview" onAction={() => setWorkflow("balance")} />
            <ReportCard title="Doctor sign-off" value={`${mockRenalOrders.filter((order) => order.status === "Pending sign").length} pending`} status="Review required" actionLabel="Open sign-off" onAction={() => setWorkflow("signoff")} disabled={!access.canReview} />
            <ReportCard title="Billing handoff" value={`${mockDialysisSessions.filter((session) => session.status === "Billing pending").length} pending`} status={access.canBill ? "Billing access" : "Read only"} actionLabel="Prepare" onAction={() => setWorkflow("billing")} disabled={!access.canBill} />
          </div>
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Search patient, dialysis session, modality, access, status..."
          >
            <Badge tone="info">{rows.length} sessions</Badge>
            <NativeSelect label="Dialysis status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Scheduled", "In progress", "Completed", "Billing pending"]} />
            <NativeSelect label="Sort sessions" value={sort} onChange={setSort} options={["Status priority", "Patient", "UF target high-low", "Billing pending"]} />
            <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("All status"); setSort("Status priority"); }}>Reset</Button>
          </FilterBar>
          <DataTable data={rows} columns={dialysisColumns} />
          <RenalReportWorkflowModal workflow={workflow} open={Boolean(workflow)} onOpenChange={(open) => !open && setWorkflow(null)} access={access} />
          <DialysisSessionReviewModal session={selectedSession} open={Boolean(selectedSession)} onOpenChange={(open) => !open && setSelectedSession(null)} canSubmit={access.canReview || access.canBill} />
        </div>
      )}
    </ProtectedRenal>
  );
}

function ReportCard({
  title,
  value,
  status,
  actionLabel,
  onAction,
  disabled,
}: {
  title: string;
  value: string;
  status: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">{title}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          </div>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <StatusPill tone={statusTone(status)}>{status}</StatusPill>
          {actionLabel ? <Button size="sm" variant="outline" disabled={disabled} onClick={onAction}>{actionLabel}</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function RenalReportWorkflowModal({
  workflow,
  open,
  onOpenChange,
  access,
}: {
  workflow: "balance" | "signoff" | "billing" | "emr" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  access: ReturnType<typeof useRenalAccess>;
}) {
  const [scope, setScope] = React.useState<"all" | "single" | "selected">("all");
  const [singlePatientId, setSinglePatientId] = React.useState(mockRenalCharts[0]?.patientId ?? "");
  const [selectedPatientIds, setSelectedPatientIds] = React.useState<string[]>(() => mockRenalCharts.map((chart) => chart.patientId));
  const reportCharts = React.useMemo(() => {
    if (scope === "single") return mockRenalCharts.filter((chart) => chart.patientId === singlePatientId);
    if (scope === "selected") return mockRenalCharts.filter((chart) => selectedPatientIds.includes(chart.patientId));
    return mockRenalCharts;
  }, [scope, selectedPatientIds, singlePatientId]);

  if (!workflow) return null;

  const title =
    workflow === "balance" ? "24h fluid balance report"
      : workflow === "signoff" ? "Doctor sign-off queue"
        : workflow === "billing" ? "Dialysis billing handoff"
          : "EMR handoff";
  const description =
    workflow === "balance" ? "Preview intake, output, balance, and cumulative values before printing."
      : workflow === "signoff" ? "Review pending renal signatures, alerts, and orders before final report sign-off."
        : workflow === "billing" ? "Prepare billing-ready dialysis rows without changing clinical charting."
          : "Send signed renal report resources into the EMR handoff workflow.";
  const submitLabel =
    workflow === "balance" ? "Generate report"
      : workflow === "signoff" ? "Mark sign-off reviewed"
        : workflow === "billing" ? "Prepare billing handoff"
          : "Send to EMR";
  const canSubmit = reportCharts.length > 0 && (workflow === "billing" ? access.canBill : workflow === "balance" ? true : access.canReview);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(700px,90dvh)] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close renal report workflow">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  {reportCharts.length ? "Your current role can view this report workflow, but cannot submit it." : "Select at least one patient to generate this report."}
                </AlertBanner>
              ) : null}
              <RenalReportScopeSelector
                scope={scope}
                onScopeChange={setScope}
                singlePatientId={singlePatientId}
                onSinglePatientChange={setSinglePatientId}
                selectedPatientIds={selectedPatientIds}
                onSelectedPatientIdsChange={setSelectedPatientIds}
                selectedCount={reportCharts.length}
              />
              <RenalReportWorkflowBody workflow={workflow} charts={reportCharts} />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${submitLabel} completed for ${reportCharts.length} patient${reportCharts.length === 1 ? "" : "s"} in static renal workflow`);
                onOpenChange(false);
              }}
            >
              {submitLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalReportScopeSelector({
  scope,
  onScopeChange,
  singlePatientId,
  onSinglePatientChange,
  selectedPatientIds,
  onSelectedPatientIdsChange,
  selectedCount,
}: {
  scope: "all" | "single" | "selected";
  onScopeChange: (scope: "all" | "single" | "selected") => void;
  singlePatientId: string;
  onSinglePatientChange: (patientId: string) => void;
  selectedPatientIds: string[];
  onSelectedPatientIdsChange: (patientIds: string[]) => void;
  selectedCount: number;
}) {
  const togglePatient = React.useCallback((patientId: string) => {
    onSelectedPatientIdsChange(
      selectedPatientIds.includes(patientId)
        ? selectedPatientIds.filter((id) => id !== patientId)
        : [...selectedPatientIds, patientId],
    );
  }, [onSelectedPatientIdsChange, selectedPatientIds]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Report scope</CardTitle>
          <CardDescription>Generate for one patient, selected patients, or every active renal chart.</CardDescription>
        </div>
        <Badge tone={selectedCount ? "info" : "warning"}>{selectedCount} selected</Badge>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <Tabs value={scope} onValueChange={(value) => onScopeChange(value as "all" | "single" | "selected")}>
          <TabsList className="grid h-9 w-full grid-cols-3 overflow-visible p-1">
            <TabsTrigger value="all">All active</TabsTrigger>
            <TabsTrigger value="single">Individual</TabsTrigger>
            <TabsTrigger value="selected">Selected</TabsTrigger>
          </TabsList>
        </Tabs>

        {scope === "single" ? (
          <ActionSelect
            label="Patient"
            value={singlePatientId}
            onChange={onSinglePatientChange}
            options={mockRenalCharts.map((chart) => ({ value: chart.patientId, label: `${patientName(chart.patientId)} - ${chart.bedNo}, ${chart.ward}` }))}
          />
        ) : null}

        {scope === "selected" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {mockRenalCharts.map((chart) => {
              const checked = selectedPatientIds.includes(chart.patientId);
              return (
                <label className={checked ? "flex min-h-[72px] items-start gap-3 rounded-lg border border-info bg-info/5 p-3" : "flex min-h-[72px] items-start gap-3 rounded-lg border border-border bg-surface-muted p-3"} key={chart.id}>
                  <input
                    checked={checked}
                    className="mt-1 h-4 w-4 rounded border-input"
                    onChange={() => togglePatient(chart.patientId)}
                    type="checkbox"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{patientName(chart.patientId)}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{chart.bedNo} • {chart.ward} • {chart.renalStatus}</span>
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RenalReportWorkflowBody({ workflow, charts }: { workflow: "balance" | "signoff" | "billing" | "emr"; charts: RenalPatientChart[] }) {
  if (!charts.length) {
    return <EmptyState icon={FileText} title="No patients selected" description="Choose an individual patient, selected patients, or all active renal charts." className="min-h-48" />;
  }

  if (workflow === "balance") {
    const rows = charts.map((chart) => {
      const balanceRows = getRenalBalanceRows(chart.patientId);
      return {
        chart,
        intake: sumValues(balanceRows, (row) => row.totalIntakeMl),
        output: sumValues(balanceRows, (row) => row.totalOutputMl),
        balance: sumValues(balanceRows, (row) => row.balanceMl),
      };
    });

    return (
      <>
        <AlertBanner icon={FileText} tone="info" title="Printable balance summary">
          Report includes 24-hour intake, output, balance, cumulative balance, and patient renal status for {charts.length} patient{charts.length === 1 ? "" : "s"}.
        </AlertBanner>
        <ClinicalTable minWidth="760px">
          <thead>
            <tr>
              <ClinicalTh>Patient</ClinicalTh>
              <ClinicalTh>Window</ClinicalTh>
              <ClinicalTh>Intake</ClinicalTh>
              <ClinicalTh>Output</ClinicalTh>
              <ClinicalTh>24h balance</ClinicalTh>
              <ClinicalTh>Cumulative</ClinicalTh>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ chart, intake, output, balance }) => (
              <tr key={chart.id}>
                <ClinicalTd className="font-semibold">{patientName(chart.patientId)}</ClinicalTd>
                <ClinicalTd>{chart.windowLabel}</ClinicalTd>
                <ClinicalTd>{formatMl(intake)}</ClinicalTd>
                <ClinicalTd>{formatMl(output)}</ClinicalTd>
                <ClinicalTd>{formatSignedMl(balance)}</ClinicalTd>
                <ClinicalTd><BalanceBadge value={chart.cumulativeBalanceMl} /></ClinicalTd>
              </tr>
            ))}
          </tbody>
        </ClinicalTable>
      </>
    );
  }

  if (workflow === "signoff") {
    return (
      <>
        <AlertBanner icon={Stethoscope} tone="warning" title="Sign-off readiness">
          Doctor sign-off should happen only after open alerts, pending orders, and latest labs are reviewed.
        </AlertBanner>
        <div className="grid gap-3">
          {charts.map((chart) => {
            const alerts = getRenalAlertsByPatient(chart.patientId).filter((alert) => alert.status !== "Acknowledged");
            const pendingOrders = getRenalOrdersByPatient(chart.patientId).filter((order) => order.status === "Pending sign");
            const latestLab = getRenalLabsByPatient(chart.patientId)[0];
            return (
              <div className="rounded-lg border border-border bg-surface-muted p-3" key={chart.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{patientName(chart.patientId)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{chart.bedNo} • {chart.ward} • {chart.renalStatus}</div>
                  </div>
                  <StatusPill tone={alerts.length || pendingOrders.length ? "warning" : "success"}>{alerts.length || pendingOrders.length ? "Review required" : "Ready"}</StatusPill>
                </div>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                  <RenalAlertMeta label="Open alerts" value={String(alerts.length)} />
                  <RenalAlertMeta label="Pending orders" value={String(pendingOrders.length)} />
                  <RenalAlertMeta label="Latest labs" value={latestLab ? `Cr ${latestLab.creatinine}, K ${latestLab.potassium}` : "Pending"} />
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  if (workflow === "billing") {
    const patientIds = new Set(charts.map((chart) => chart.patientId));
    const sourceSessions = mockDialysisSessions.filter((session) => patientIds.has(session.patientId));
    const rows = sourceSessions.filter((session) => session.status === "Billing pending");
    return (
      <>
        <AlertBanner icon={FileText} tone="info" title="Billing-ready sessions">
          Billing handoff includes dialysis session, access, UF target, weights, and service status.
        </AlertBanner>
        {sourceSessions.length ? (
          <ClinicalTable minWidth="760px">
            <thead>
              <tr>
                <ClinicalTh>Patient</ClinicalTh>
                <ClinicalTh>Session</ClinicalTh>
                <ClinicalTh>Modality</ClinicalTh>
                <ClinicalTh>Scheduled</ClinicalTh>
                <ClinicalTh>UF target</ClinicalTh>
                <ClinicalTh>Status</ClinicalTh>
              </tr>
            </thead>
            <tbody>
              {(rows.length ? rows : sourceSessions).map((session) => (
                <tr key={session.id}>
                  <ClinicalTd className="font-semibold">{patientName(session.patientId)}</ClinicalTd>
                  <ClinicalTd>{session.sessionNo}</ClinicalTd>
                  <ClinicalTd>{session.modality}</ClinicalTd>
                  <ClinicalTd>{session.scheduledAt}</ClinicalTd>
                  <ClinicalTd>{formatMl(session.ufTargetMl)}</ClinicalTd>
                  <ClinicalTd><StatusPill tone={statusTone(session.status)}>{session.status}</StatusPill></ClinicalTd>
                </tr>
              ))}
            </tbody>
          </ClinicalTable>
        ) : (
          <EmptyState icon={FileText} title="No dialysis sessions in scope" description="Selected patient scope has no dialysis rows for billing handoff." className="min-h-40" />
        )}
      </>
    );
  }

  return (
    <>
      <AlertBanner icon={Database} tone="info" title="FHIR-aligned EMR package">
        Handoff includes Patient, Encounter, Observation, Device, DiagnosticReport, ServiceRequest, AuditEvent, and Provenance references.
      </AlertBanner>
      <div className="grid gap-3">
        {charts.map((chart) => {
          const resources = getRenalFhirBundle(chart);
          return (
            <div className="rounded-lg border border-border bg-surface-muted p-3" key={chart.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{patientName(chart.patientId)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{chart.bedNo} • {chart.ward} • {chart.windowLabel}</div>
                </div>
                <Badge tone="info">{resources.length} resources</Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {resources.slice(0, 4).map((resource) => (
                  <RenalAlertMeta key={resource.reference} label={resource.resource} value={`${resource.status} - ${resource.payload}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DialysisSessionReviewModal({
  session,
  open,
  onOpenChange,
  canSubmit,
}: {
  session: DialysisSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
}) {
  const [decisionBySessionId, setDecisionBySessionId] = React.useState<Record<string, string>>({});

  if (!session) return null;
  const chart = getRenalChartByPatient(session.patientId);
  const defaultDecision = session.status === "Billing pending" ? "Send billing handoff" : session.status === "Scheduled" ? "Confirm dialysis plan" : "Review session";
  const decision = decisionBySessionId[session.id] ?? defaultDecision;
  const weightDelta = session.postWeightKg ? `${(session.preWeightKg - session.postWeightKg).toFixed(1)} kg removed` : "Pending post weight";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(620px,90dvh)] w-[min(660px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Dialysis session review</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(session.patientId)} • {session.sessionNo} • {session.status}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close dialysis session review">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can view dialysis sessions, but cannot record this review.
                </AlertBanner>
              ) : null}
              <AlertBanner icon={Activity} tone={statusTone(session.status)} title={session.modality}>
                {session.scheduledAt} • Access {session.accessSite}
              </AlertBanner>
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Session summary</CardTitle>
                    <CardDescription>Clinical and billing values for the dialysis row.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-x-5 gap-y-1 p-4 pt-0 sm:grid-cols-2">
                  <DetailRow label="Patient" value={patientName(session.patientId)} />
                  <DetailRow label="Bed / ward" value={chart ? `${chart.bedNo} • ${chart.ward}` : "No active chart"} />
                  <DetailRow label="Access" value={session.accessSite} />
                  <DetailRow label="UF target" value={formatMl(session.ufTargetMl)} />
                  <DetailRow label="UF removed" value={formatMl(session.ufRemovedMl)} />
                  <DetailRow label="Weight change" value={weightDelta} />
                  <DetailRow label="Pre weight" value={`${session.preWeightKg} kg`} />
                  <DetailRow label="Post weight" value={session.postWeightKg ? `${session.postWeightKg} kg` : "Pending"} />
                </CardContent>
              </Card>
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionSelect
                  label="Decision"
                  value={decision}
                  onChange={(value) => setDecisionBySessionId((current) => ({ ...current, [session.id]: value }))}
                  options={["Confirm dialysis plan", "Send billing handoff", "Hold for doctor review", "Mark completed"].map((item) => ({ value: item, label: item }))}
                />
                <ActionInput label="Reviewed by" value="Current user" readOnly />
              </div>
              <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Dialysis note / billing reason / clinical handoff" />
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:justify-end">
            <Button variant="outline" asChild>
              <Link href={`/renal/patients/${session.patientId}`}>Open patient chart</Link>
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${decision} recorded for ${session.sessionNo}`);
                onOpenChange(false);
              }}
            >
              Save review
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalLabEntryModal({
  open,
  onOpenChange,
  patientId,
  canSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  canSubmit: boolean;
}) {
  const initialLab = getRenalLabsByPatient(patientId)[0];
  const [selectedPatientId, setSelectedPatientId] = React.useState(patientId);
  const [collectedAt, setCollectedAt] = React.useState("Current time");
  const [creatinine, setCreatinine] = React.useState(initialLab?.creatinine ?? "");
  const [urea, setUrea] = React.useState(initialLab?.urea ?? "");
  const [sodium, setSodium] = React.useState(initialLab?.sodium ?? "");
  const [potassium, setPotassium] = React.useState(initialLab?.potassium ?? "");
  const [egfr, setEgfr] = React.useState(initialLab?.egfr ?? "");
  const [urineProtein, setUrineProtein] = React.useState(initialLab?.urineProtein ?? "Nil");
  const [flag, setFlag] = React.useState<RenalLabRecord["flag"]>(initialLab?.flag ?? "Normal");
  const [trend, setTrend] = React.useState<RenalLabRecord["trend"]>(initialLab?.trend ?? "Stable");
  const selectedChart = getRenalChartByPatient(selectedPatientId);

  const handlePatientChange = React.useCallback((nextPatientId: string) => {
    const latestLab = getRenalLabsByPatient(nextPatientId)[0];
    setSelectedPatientId(nextPatientId);
    setCreatinine(latestLab?.creatinine ?? "");
    setUrea(latestLab?.urea ?? "");
    setSodium(latestLab?.sodium ?? "");
    setPotassium(latestLab?.potassium ?? "");
    setEgfr(latestLab?.egfr ?? "");
    setUrineProtein(latestLab?.urineProtein ?? "Nil");
    setFlag(latestLab?.flag ?? "Normal");
    setTrend(latestLab?.trend ?? "Stable");
  }, []);

  const handleSave = React.useCallback(() => {
    if (!canSubmit) {
      toast.error("Current role cannot update renal labs");
      return;
    }
    if (!selectedPatientId) {
      toast.error("Select a renal patient first");
      return;
    }
    if (!creatinine.trim() || !urea.trim() || !sodium.trim() || !potassium.trim() || !egfr.trim()) {
      toast.error("Enter complete renal lab values");
      return;
    }
    toast.success(`Renal lab update staged for ${patientName(selectedPatientId)}`);
    onOpenChange(false);
  }, [canSubmit, creatinine, egfr, onOpenChange, potassium, selectedPatientId, sodium, urea]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(680px,90dvh)] w-[min(660px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Update renal labs</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {selectedChart ? `${patientName(selectedPatientId)} • ${selectedChart.bedNo}, ${selectedChart.ward}` : "Select renal patient"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close renal lab update modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can view renal labs, but cannot update results.
                </AlertBanner>
              ) : null}
              <AlertBanner icon={FlaskConical} tone="info" title="Diagnostic result entry">
                Capture renal function, electrolyte, protein, trend, and abnormal flag in one step.
              </AlertBanner>
              <Card>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                  <ActionSelect
                    label="Patient"
                    value={selectedPatientId}
                    onChange={handlePatientChange}
                    options={mockRenalCharts.map((chart) => ({ value: chart.patientId, label: `${patientName(chart.patientId)} - ${chart.bedNo}, ${chart.ward}` }))}
                  />
                  <ActionInput label="Collected at" value={collectedAt} onChange={setCollectedAt} />
                  <ActionInput label="Creatinine" value={creatinine} onChange={setCreatinine} />
                  <ActionInput label="Urea" value={urea} onChange={setUrea} />
                  <ActionInput label="Sodium" value={sodium} onChange={setSodium} />
                  <ActionInput label="Potassium" value={potassium} onChange={setPotassium} />
                  <ActionInput label="eGFR" value={egfr} onChange={setEgfr} />
                  <ActionSelect label="Urine protein" value={urineProtein} onChange={setUrineProtein} options={["Nil", "Trace", "+", "++", "+++"].map((item) => ({ value: item, label: item }))} />
                  <ActionSelect label="Flag" value={flag} onChange={(value) => setFlag(value as RenalLabRecord["flag"])} options={["Normal", "Watch", "Critical"].map((item) => ({ value: item, label: item }))} />
                  <ActionSelect label="Trend" value={trend} onChange={(value) => setTrend(value as RenalLabRecord["trend"])} options={["Improving", "Stable", "Worsening"].map((item) => ({ value: item, label: item }))} />
                </CardContent>
              </Card>
              <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Lab note / critical value acknowledgement / sample condition" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={!canSubmit} onClick={handleSave}>Save lab update</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalLabReviewModal({
  lab,
  open,
  onOpenChange,
  canSubmit,
}: {
  lab: RenalLabRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
}) {
  const [decisionByLabId, setDecisionByLabId] = React.useState<Record<string, string>>({});

  if (!lab) return null;
  const defaultDecision = lab.flag === "Critical" ? "Escalate to doctor" : "Continue monitoring";
  const decision = decisionByLabId[lab.id] ?? defaultDecision;
  const chart = getRenalChartByPatient(lab.patientId);
  const alerts = getRenalAlertsByPatient(lab.patientId).filter((alert) => alert.title.toLowerCase().includes("potassium") || alert.title.toLowerCase().includes("renal") || lab.flag === "Critical");
  const orders = getRenalOrdersByPatient(lab.patientId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(640px,90dvh)] w-[min(660px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Review renal lab</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(lab.patientId)} • {lab.collectedAt} • {lab.flag}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close renal lab review modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can review this result, but cannot record a lab review.
                </AlertBanner>
              ) : null}
              <AlertBanner icon={FlaskConical} tone={statusTone(lab.flag)} title={`${lab.flag} renal result`}>
                Creatinine {lab.creatinine} • Potassium {lab.potassium} • Trend {lab.trend}
              </AlertBanner>
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Result summary</CardTitle>
                    <CardDescription>Renal DiagnosticReport values linked to the active chart.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-x-5 gap-y-1 p-4 pt-0 sm:grid-cols-2">
                  <DetailRow label="Patient" value={patientName(lab.patientId)} />
                  <DetailRow label="Bed / ward" value={chart ? `${chart.bedNo} • ${chart.ward}` : "No active chart"} />
                  <DetailRow label="Creatinine" value={lab.creatinine} />
                  <DetailRow label="Urea" value={lab.urea} />
                  <DetailRow label="Sodium" value={lab.sodium} />
                  <DetailRow label="Potassium" value={lab.potassium} />
                  <DetailRow label="eGFR" value={lab.egfr} />
                  <DetailRow label="Urine protein" value={lab.urineProtein} />
                  <DetailRow label="Flag" value={<StatusPill tone={statusTone(lab.flag)}>{lab.flag}</StatusPill>} />
                  <DetailRow label="Trend" value={<StatusPill tone={statusTone(lab.trend)}>{lab.trend}</StatusPill>} />
                </CardContent>
              </Card>
              <div className="grid gap-3 sm:grid-cols-2">
                <ActionSelect
                  label="Review decision"
                  value={decision}
                  onChange={(value) => setDecisionByLabId((current) => ({ ...current, [lab.id]: value }))}
                  options={["Continue monitoring", "Repeat sample", "Escalate to doctor", "Prepare dialysis review"].map((item) => ({ value: item, label: item }))}
                />
                <ActionInput label="Reviewed by" value="Current user" readOnly />
              </div>
              {alerts.length || orders.length ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Related alerts and orders</div>
                  {alerts.map((alert) => (
                    <div className="rounded-md border border-border bg-surface-muted p-2 text-xs" key={alert.id}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-foreground">{alert.title}</span>
                        <StatusPill tone={renalAlertTone(alert.severity)}>{alert.severity}</StatusPill>
                      </div>
                      <div className="mt-1 text-muted-foreground">{alert.metric} • {alert.status}</div>
                    </div>
                  ))}
                  {orders.slice(0, 3).map((order) => (
                    <div className="rounded-md border border-border bg-surface-muted p-2 text-xs" key={order.id}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-foreground">{order.order}</span>
                        <StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill>
                      </div>
                      <div className="mt-1 text-muted-foreground">{order.target} • {order.orderedAt}</div>
                    </div>
                  ))}
                </div>
              ) : null}
              <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Review note / repeat sample reason / escalation plan" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${decision} recorded for ${patientName(lab.patientId)}`);
                onOpenChange(false);
              }}
            >
              Save review
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalAlertQueue({ alerts, onAction }: { alerts: RenalAlert[]; onAction?: (alert: RenalAlert) => void }) {
  const criticalCount = alerts.filter((alert) => alert.severity === "Critical").length;
  const warningCount = alerts.filter((alert) => alert.severity === "Warning").length;
  const escalatedCount = alerts.filter((alert) => alert.status === "Escalated").length;
  const patientCount = new Set(alerts.map((alert) => alert.patientId)).size;
  const lanes = (["Critical", "Warning", "Info"] as RenalAlert["severity"][])
    .map((severity) => ({ severity, rows: alerts.filter((alert) => alert.severity === severity) }))
    .filter((lane) => lane.rows.length);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RenalAlertQueueMetric icon={ShieldAlert} label="Critical" value={criticalCount} subtext="Immediate doctor review" tone="critical" />
        <RenalAlertQueueMetric icon={AlertTriangle} label="Warning" value={warningCount} subtext="Review during current shift" tone="warning" />
        <RenalAlertQueueMetric icon={Activity} label="Escalated" value={escalatedCount} subtext="Already escalated to owner" tone="danger" />
        <RenalAlertQueueMetric icon={Gauge} label="Patients" value={patientCount} subtext="Affected renal charts" tone="info" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="items-start">
          <div>
            <CardTitle>Renal Alert Queue</CardTitle>
            <CardDescription>Open clinical rules grouped by severity with patient context and action ownership.</CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Badge tone="critical">{alerts.length} open</Badge>
            <Badge tone="muted">FHIR DetectedIssue</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length ? (
            lanes.map((lane) => (
              <div className="space-y-2" key={lane.severity}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={renalAlertTone(lane.severity)}>{lane.severity}</StatusPill>
                    <span className="text-xs font-semibold text-foreground">{lane.rows.length} active</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{renalAlertLanePurpose(lane.severity)}</div>
                </div>
                <div className="grid gap-3">
                  {lane.rows.map((alert) => (
                    <RenalAlertQueueItem alert={alert} key={alert.id} onAction={onAction} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No open renal alerts"
              description="All active renal rules are acknowledged for the current filter."
              className="min-h-48"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RenalAlertQueueMetric({
  icon: Icon,
  label,
  value,
  subtext,
  tone,
}: {
  icon: typeof ShieldAlert;
  label: string;
  value: number;
  subtext: string;
  tone: StatusTone;
}) {
  const toneClass: Record<StatusTone, string> = {
    success: "border-success/25 bg-success/5 text-success",
    warning: "border-warning/25 bg-warning/5 text-warning",
    danger: "border-danger/25 bg-danger/5 text-danger",
    info: "border-info/25 bg-info/5 text-info",
    critical: "border-critical/25 bg-critical/5 text-critical",
    muted: "border-border bg-surface-muted text-muted-foreground",
  };

  return (
    <div className={`rounded-lg border p-3 ${toneClass[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        </div>
        <div className="rounded-md border border-current/20 bg-background/70 p-2">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{subtext}</div>
    </div>
  );
}

function RenalAlertQueueItem({ alert, onAction }: { alert: RenalAlert; onAction?: (alert: RenalAlert) => void }) {
  const chart = getRenalChartByPatient(alert.patientId);
  const patient = getPatientById(alert.patientId);
  const latestLab = getRenalLabsByPatient(alert.patientId)[0];
  const pendingOrders = getRenalOrdersByPatient(alert.patientId).filter((order) => order.status === "Pending sign").length;
  const highRisk = alert.severity === "Critical" || alert.status === "Escalated";
  const containerClass = highRisk
    ? "rounded-lg border border-critical/35 bg-critical/5 p-3"
    : "rounded-lg border border-border bg-surface-muted p-3";

  return (
    <div className={containerClass}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.8fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-sm font-semibold text-foreground">{alert.title}</div>
            <StatusPill tone={renalAlertTone(alert.severity)}>{alert.severity}</StatusPill>
            <StatusPill tone={statusTone(alert.status)}>{alert.status}</StatusPill>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {patientName(alert.patientId)} • {patient?.uhid ?? "UHID not linked"} • {chart ? `${chart.bedNo}, ${chart.ward}` : patient?.department ?? "No active renal chart"}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <RenalAlertMeta label="Metric" value={alert.metric} />
            <RenalAlertMeta label="Threshold" value={alert.threshold} />
            <RenalAlertMeta label="SLA" value={renalAlertSla(alert)} />
            <RenalAlertMeta label="Owner" value={alert.owner} />
          </div>
        </div>

        <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-1">
          <RenalAlertMeta label="Renal status" value={chart ? chart.renalStatus : "No renal chart"} />
          <RenalAlertMeta label="Cumulative balance" value={chart ? formatSignedMl(chart.cumulativeBalanceMl) : "Not available"} />
          <RenalAlertMeta label="Latest labs" value={latestLab ? `Cr ${latestLab.creatinine}, K ${latestLab.potassium}` : "Not available"} />
          <RenalAlertMeta label="Pending signs" value={`${pendingOrders} orders`} />
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/renal/patients/${alert.patientId}`}>Open chart</Link>
          </Button>
          <Button size="sm" onClick={() => onAction ? onAction(alert) : toast.success(`${alert.title} acknowledged`)}>
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}

function RenalAlertMeta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}

function renalAlertSla(alert: RenalAlert) {
  if (alert.status === "Escalated") return "Immediate owner response";
  if (alert.severity === "Critical") return "Doctor within 15 min";
  if (alert.severity === "Warning") return "Review this shift";
  return "Routine audit";
}

function renalAlertLanePurpose(severity: RenalAlert["severity"]) {
  if (severity === "Critical") return "Escalate, acknowledge, and document clinical action.";
  if (severity === "Warning") return "Review trend and assign bedside follow-up.";
  return "Track informational renal rules for audit.";
}

function RoleActionPanel({
  actions,
  search,
  onSearch,
  sort,
  onSort,
  role,
  onAction,
}: {
  actions: RoleActionItem[];
  search: string;
  onSearch: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
  role: string;
  onAction: (type: OverviewActionType) => void;
}) {
  return (
    <div className="space-y-3">
      <FilterBar
        search={search}
        onSearch={onSearch}
        placeholder="Search action, role, when to use, result..."
      >
        <Badge tone="info">{actions.length} actions</Badge>
        <NativeSelect
          label="Sort actions"
          value={sort}
          onChange={onSort}
          options={["Available first", "Workflow order", "Role A-Z", "System record A-Z", "Locked first"]}
        />
        <Button variant="outline" onClick={() => { onSearch(""); onSort("Available first"); }}>Reset</Button>
      </FilterBar>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>My Actions</CardTitle>
            <CardDescription>Current role: {role}. Ready actions can be submitted now; locked actions show the required role.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {actions.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {actions.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    className="flex min-h-[240px] flex-col justify-between rounded-lg border border-border bg-surface-muted p-4"
                    key={item.id}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className={item.enabled ? "rounded-lg border border-info/25 bg-info/5 p-2 text-info" : "rounded-lg border border-border bg-background p-2 text-muted-foreground"}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">{item.title}</div>
                            <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                        <StatusPill tone={item.enabled ? "success" : "muted"}>{item.enabled ? "Ready" : "Locked"}</StatusPill>
                      </div>
                      <div className="grid gap-2 text-xs">
                        <div className="rounded-md border border-border bg-background px-3 py-2">
                          <div className="font-medium text-muted-foreground">When</div>
                          <div className="mt-0.5 font-semibold text-foreground">{item.when}</div>
                        </div>
                        <div className="rounded-md border border-border bg-background px-3 py-2">
                          <div className="font-medium text-muted-foreground">After submit</div>
                          <div className="mt-0.5 font-semibold text-foreground">{item.result}</div>
                        </div>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div className="rounded-md border border-border bg-background px-3 py-2">
                          <div className="font-medium text-muted-foreground">Allowed role</div>
                          <div className="mt-0.5 font-semibold text-foreground">{item.owner}</div>
                        </div>
                        <div className="rounded-md border border-border bg-background px-3 py-2">
                          <div className="font-medium text-muted-foreground">System record</div>
                          <div className="mt-0.5 font-semibold text-foreground">{item.resource}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">{item.enabled ? "You can submit this action now." : item.lockedReason}</span>
                      <Button size="sm" disabled={!item.enabled} onClick={() => onAction(item.type)}>
                        {item.enabled ? "Start" : "Locked"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No actions found"
              description="Adjust search or sorting to find the action you need."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RenalOverviewActionDrawer({
  action,
  open,
  onOpenChange,
}: {
  action: OverviewActionRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const access = useRenalAccess();
  const activeAlert = action?.type === "alert"
    ? action.alert ?? mockRenalAlerts.find((alert) => alert.status !== "Acknowledged")
    : action?.alert;
  const newEntryWorkflow = action?.type === "entry" && !action.chart && !action.entryMode;
  if (newEntryWorkflow) {
    return <RenalEntryWorkflowModal open={open} onOpenChange={onOpenChange} access={access} />;
  }

  const chart = action?.chart
    ?? (activeAlert ? getRenalChartByPatient(activeAlert.patientId) : undefined)
    ?? mockRenalCharts.slice().sort((left, right) => renalPriorityScore(right) - renalPriorityScore(left))[0];
  const entryModal = action?.type === "entry" && Boolean(chart);
  const labsModal = action?.type === "labs" && Boolean(chart);
  const orderModal = action?.type === "order" && Boolean(chart);
  const reviewModal = action?.type === "review" && Boolean(chart);
  const alertModal = action?.type === "alert" && Boolean(activeAlert);
  const billingModal = action?.type === "billing";
  const canSubmit =
    action?.type === "entry" ? access.canEnterIO
      : action?.type === "review" ? access.canReview
        : action?.type === "labs" ? access.canUpdateLabs
          : action?.type === "order" ? access.canReview
            : action?.type === "billing" ? access.canBill
              : Boolean(action) && (access.canReview || access.canEnterIO);
  const title =
    action?.type === "entry" && action.entryMode === "intake" ? "Add intake entry"
      : action?.type === "entry" && action.entryMode === "output" ? "Add output entry"
        : action?.type === "entry" ? "New renal entry"
      : action?.type === "review" ? "Sign renal report"
        : action?.type === "labs" ? "Update renal labs"
          : action?.type === "order" ? "Add renal order"
            : action?.type === "billing" ? "Dialysis billing handoff"
              : "Renal alert action";
  const primaryLabel =
    action?.type === "entry" && action.entryMode === "intake" ? "Save intake entry"
      : action?.type === "entry" && action.entryMode === "output" ? "Save output entry"
        : action?.type === "entry" ? "Save I/O entry"
      : action?.type === "review" ? "Sign renal report"
        : action?.type === "labs" ? "Save lab update"
          : action?.type === "order" ? "Save renal order"
            : action?.type === "billing" ? "Prepare billing handoff"
              : "Acknowledge alert";

  if (entryModal && chart) {
    return (
      <RenalEntryActionModal
        chart={chart}
        mode={action?.entryMode ?? "io"}
        open={open}
        onOpenChange={onOpenChange}
        canSubmit={canSubmit}
        primaryLabel={primaryLabel}
      />
    );
  }

  if (labsModal && chart) {
    return (
      <RenalLabActionModal
        chart={chart}
        open={open}
        onOpenChange={onOpenChange}
        canSubmit={canSubmit}
        primaryLabel={primaryLabel}
      />
    );
  }

  if (orderModal && chart) {
    return (
      <RenalOrderActionModal
        chart={chart}
        open={open}
        onOpenChange={onOpenChange}
        canSubmit={canSubmit}
        primaryLabel={primaryLabel}
      />
    );
  }

  if (reviewModal && chart) {
    return (
      <RenalSignReportModal
        chart={chart}
        open={open}
        onOpenChange={onOpenChange}
        canSubmit={canSubmit}
        primaryLabel={primaryLabel}
      />
    );
  }

  if (alertModal && activeAlert) {
    return (
      <RenalAlertActionModal
        alert={activeAlert}
        open={open}
        onOpenChange={onOpenChange}
        canSubmit={canSubmit}
        primaryLabel={primaryLabel}
      />
    );
  }

  if (billingModal) {
    return (
      <RenalBillingActionModal
        open={open}
        onOpenChange={onOpenChange}
        canSubmit={canSubmit}
        primaryLabel={primaryLabel}
      />
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={chart ? `${patientName(chart.patientId)} • ${chart.bedNo} • ${access.role}` : access.role}
      className="md:w-[620px]"
      footer={action ? (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!canSubmit}
            onClick={() => {
              toast.success(`${primaryLabel} recorded in static renal workflow`);
              onOpenChange(false);
            }}
          >
            {primaryLabel}
          </Button>
        </div>
      ) : undefined}
    >
      {action ? (
        <div className="space-y-4">
          {!canSubmit ? (
            <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
              Your current role can view this action, but cannot submit it.
            </AlertBanner>
          ) : null}
          {action.type === "entry" && chart ? <RenalEntryActionForm chart={chart} mode={action.entryMode ?? "io"} /> : null}
          {action.type === "review" && chart ? <RenalReviewActionForm chart={chart} /> : null}
          {action.type === "labs" && chart ? <RenalLabActionForm chart={chart} /> : null}
          {action.type === "billing" ? <RenalBillingActionForm /> : null}
          {action.type === "alert" && activeAlert ? <RenalAlertActionForm alert={activeAlert} /> : null}
        </div>
      ) : null}
    </Drawer>
  );
}

function RenalEntryWorkflowModal({
  open,
  onOpenChange,
  access,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  access: ReturnType<typeof useRenalAccess>;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(740px,90dvh)] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Create renal chart / entry</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Existing chart or new chart • {access.role}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close create renal chart">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <NewRenalEntryWorkflow access={access} onOpenChange={onOpenChange} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const renalNewChartWardOptions = ["Assign current bed", "Renal ward", "ICU", "Ortho Ward", "Cardiac Ward", "Emergency observation"].map((item) => ({ value: item, label: item }));
const renalFluidRestrictionOptions = ["No restriction", "1500 ml / 24h", "1800 ml / 24h", "2000 ml / 24h", "2200 ml / 24h"].map((item) => ({ value: item, label: item }));
const renalNephrologistOptions = ["Assign nephrologist", "Dr. Mohan Ahluvia", "Dr. Ritu Menon", "Nephrology on call", "Not required"].map((item) => ({ value: item, label: item }));
const renalTargetBalanceOptions = ["Neutral 0 ml", "+500 ml", "+750 ml", "-500 ml", "Doctor defined"].map((item) => ({ value: item, label: item }));
const renalTimeSlotOptions = ["Current hour", "Previous hour", "Next hour", "Morning shift", "Evening shift", "Night shift"].map((item) => ({ value: item, label: item }));
const renalEnteredByOptions = ["Current user", "Bedside nurse", "Shift in-charge", "ICU nurse", "Night nurse"].map((item) => ({ value: item, label: item }));

function RenalEntryActionModal({
  chart,
  mode,
  open,
  onOpenChange,
  canSubmit,
  primaryLabel,
}: {
  chart: RenalPatientChart;
  mode: RenalEntryMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  primaryLabel: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(680px,90dvh)] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{entryModeLabel(mode)} entry</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(chart.patientId)} • {chart.bedNo} • {chart.ward}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close entry modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <RenalEntryActionForm chart={chart} mode={mode} />
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${primaryLabel} recorded in static renal workflow`);
                onOpenChange(false);
              }}
            >
              {primaryLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalLabActionModal({
  chart,
  open,
  onOpenChange,
  canSubmit,
  primaryLabel,
}: {
  chart: RenalPatientChart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  primaryLabel: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(620px,90dvh)] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Update renal labs</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(chart.patientId)} • {chart.bedNo} • {chart.ward}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close lab update modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <RenalLabActionForm chart={chart} />
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${primaryLabel} recorded in static renal workflow`);
                onOpenChange(false);
              }}
            >
              {primaryLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalOrderActionModal({
  chart,
  open,
  onOpenChange,
  canSubmit,
  primaryLabel,
}: {
  chart: RenalPatientChart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  primaryLabel: string;
}) {
  const templates = [
    { order: "Repeat RFT + electrolytes", target: "Next sample in 6 hours" },
    { order: "Potassium watch", target: "Notify doctor if K+ >= 5.5 mmol/L" },
    { order: "Urine protein repeat", target: "Send next void sample" },
    { order: "Dialysis review", target: "Nephrology bedside review" },
    { order: "Strict intake source tagging", target: "Separate IV, oral, flush, blood products" },
  ];
  const [orderName, setOrderName] = React.useState(templates[0].order);
  const [target, setTarget] = React.useState(templates[0].target);
  const [status, setStatus] = React.useState("Active");

  const handleOrderChange = React.useCallback((value: string) => {
    const template = templates.find((item) => item.order === value);
    setOrderName(value);
    setTarget(template?.target ?? "");
  }, [templates]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(560px,90dvh)] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Add renal order</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(chart.patientId)} • {chart.bedNo} • {chart.ward}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close renal order modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can view renal orders, but cannot add a doctor order.
                </AlertBanner>
              ) : null}
              <AlertBanner icon={ClipboardCheck} tone="info" title="Order workflow">
                Orders saved here appear in the renal labs and sign-off checklist.
              </AlertBanner>
              <Card>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                  <ActionInput label="Patient" value={patientName(chart.patientId)} readOnly />
                  <ActionInput label="Renal status" value={chart.renalStatus} readOnly />
                  <ActionSelect label="Order" value={orderName} onChange={handleOrderChange} options={templates.map((item) => ({ value: item.order, label: item.order }))} />
                  <ActionSelect label="Status" value={status} onChange={setStatus} options={["Active", "Pending sign", "Completed"].map((item) => ({ value: item, label: item }))} />
                  <ActionInput label="Target / instruction" value={target} onChange={setTarget} />
                  <ActionInput label="Ordered by" value="Current doctor" readOnly />
                </CardContent>
              </Card>
              <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Clinical reason / order note" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                if (!orderName.trim() || !target.trim()) {
                  toast.error("Select order and target first");
                  return;
                }
                toast.success(`${primaryLabel}: ${orderName} for ${patientName(chart.patientId)}`);
                onOpenChange(false);
              }}
            >
              {primaryLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalSignReportModal({
  chart,
  open,
  onOpenChange,
  canSubmit,
  primaryLabel,
}: {
  chart: RenalPatientChart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  primaryLabel: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(680px,90dvh)] w-[min(660px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Sign renal report</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(chart.patientId)} • {chart.bedNo} • {chart.ward}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close sign report modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <RenalReviewActionForm chart={chart} />
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${primaryLabel} recorded in static renal workflow`);
                onOpenChange(false);
              }}
            >
              {primaryLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalAlertActionModal({
  alert,
  open,
  onOpenChange,
  canSubmit,
  primaryLabel,
}: {
  alert: RenalAlert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  primaryLabel: string;
}) {
  const chart = getRenalChartByPatient(alert.patientId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(560px,90dvh)] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Acknowledge renal alert</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(alert.patientId)} • {chart ? `${chart.bedNo}, ${chart.ward}` : alert.owner} • {alert.severity}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close alert acknowledgement modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can view this alert, but cannot acknowledge it.
                </AlertBanner>
              ) : null}
              <RenalAlertActionForm alert={alert} />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${primaryLabel} recorded in static renal workflow`);
                onOpenChange(false);
              }}
            >
              {primaryLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RenalBillingActionModal({
  open,
  onOpenChange,
  canSubmit,
  primaryLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
  primaryLabel: string;
}) {
  const defaultSelected = React.useMemo(
    () => mockDialysisSessions.filter((session) => session.status === "Billing pending").map((session) => session.id),
    [],
  );
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Billing pending");
  const [packageMode, setPackageMode] = React.useState("Consumables included");
  const [payerStatus, setPayerStatus] = React.useState("Insurance / TPA review");
  const [priority, setPriority] = React.useState("Routine");
  const [handoffTo, setHandoffTo] = React.useState("Billing desk");
  const [patientScope, setPatientScope] = React.useState("All patients");
  const [singlePatientId, setSinglePatientId] = React.useState(mockRenalCharts[0]?.patientId ?? "");
  const [selectedPatientIds, setSelectedPatientIds] = React.useState<string[]>(() => mockRenalCharts.map((chart) => chart.patientId));
  const [selectedIds, setSelectedIds] = React.useState<string[]>(defaultSelected);
  const scopedPatientIds = React.useMemo(() => {
    if (patientScope === "Individual patient") return singlePatientId ? [singlePatientId] : [];
    if (patientScope === "Selected patients") return selectedPatientIds;
    return mockRenalCharts.map((chart) => chart.patientId);
  }, [patientScope, selectedPatientIds, singlePatientId]);
  const scopedPatientSet = React.useMemo(() => new Set(scopedPatientIds), [scopedPatientIds]);
  const rows = React.useMemo(() => {
    return mockDialysisSessions.filter((session) => {
      const matchesPatientScope = scopedPatientSet.has(session.patientId);
      const matchesSearch = search.trim() ? includes(dialysisSessionSearchText(session), search.trim()) : true;
      const matchesStatus = statusFilter === "All status" || session.status === statusFilter;
      return matchesPatientScope && matchesSearch && matchesStatus;
    });
  }, [scopedPatientSet, search, statusFilter]);
  const selectedSessions = mockDialysisSessions.filter((session) => selectedIds.includes(session.id));
  const selectedEstimate = selectedSessions.reduce((total, session) => total + dialysisBillingAmount(session, packageMode), 0);
  const visibleIds = rows.map((session) => session.id);
  const visibleSelectedCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const patientOptions = mockRenalCharts.map((chart) => ({ value: chart.patientId, label: `${patientName(chart.patientId)} - ${chart.bedNo}, ${chart.ward}` }));

  const toggleSession = React.useCallback((sessionId: string) => {
    setSelectedIds((current) => current.includes(sessionId) ? current.filter((id) => id !== sessionId) : [...current, sessionId]);
  }, []);

  const togglePatient = React.useCallback((patientId: string) => {
    setSelectedPatientIds((current) => current.includes(patientId) ? current.filter((id) => id !== patientId) : [...current, patientId]);
  }, []);

  const applyPatientScope = React.useCallback(() => {
    const scopedSessionIds = mockDialysisSessions
      .filter((session) => scopedPatientSet.has(session.patientId) && (statusFilter === "All status" || session.status === statusFilter))
      .map((session) => session.id);
    setSelectedIds(scopedSessionIds);
  }, [scopedPatientSet, statusFilter]);

  const selectVisible = React.useCallback(() => {
    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  }, [visibleIds]);

  const clearVisible = React.useCallback(() => {
    setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)));
  }, [visibleIds]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(720px,90dvh)] w-[min(780px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Prepare dialysis billing</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Select dialysis sessions, confirm billing package, and send billing-ready service rows.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close dialysis billing modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can view dialysis billing, but cannot prepare the billing handoff.
                </AlertBanner>
              ) : null}
              <AlertBanner icon={FileText} tone="info" title="Billing handoff">
                Clinical dialysis details stay read-only. Billing receives selected service rows, package, payer status, and priority.
              </AlertBanner>

              <div className="grid gap-3 sm:grid-cols-3">
                <RenalMetricCard label="Selected sessions" value={selectedSessions.length} subtext={`${visibleSelectedCount} visible`} tone={selectedSessions.length ? "success" : "warning"} />
                <RenalMetricCard label="Estimated amount" value={formatInr(selectedEstimate)} subtext={packageMode} tone="info" />
                <RenalMetricCard label="Billing pending" value={mockDialysisSessions.filter((session) => session.status === "Billing pending").length} subtext="Open service rows" tone="warning" />
              </div>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Billing setup</CardTitle>
                    <CardDescription>Choose how selected dialysis sessions should be handed over.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                  <ActionSelect label="Package" value={packageMode} onChange={setPackageMode} options={["Procedure only", "Consumables included", "Emergency add-on"].map((item) => ({ value: item, label: item }))} />
                  <ActionSelect label="Payer status" value={payerStatus} onChange={setPayerStatus} options={["Cash billing", "Insurance / TPA review", "Corporate panel", "Government scheme"].map((item) => ({ value: item, label: item }))} />
                  <ActionSelect label="Priority" value={priority} onChange={setPriority} options={["Routine", "Discharge priority", "Emergency billing", "Hold for clarification"].map((item) => ({ value: item, label: item }))} />
                  <ActionSelect label="Handoff to" value={handoffTo} onChange={setHandoffTo} options={["Billing desk", "TPA desk", "Cash counter", "Discharge billing"].map((item) => ({ value: item, label: item }))} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Patient selection</CardTitle>
                    <CardDescription>Filter billing rows by all patients, one patient, or selected patients.</CardDescription>
                  </div>
                  <Badge tone="info">{scopedPatientIds.length} patients</Badge>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-end">
                    <ActionSelect
                      label="Patient scope"
                      value={patientScope}
                      onChange={setPatientScope}
                      options={["All patients", "Individual patient", "Selected patients"].map((item) => ({ value: item, label: item }))}
                    />
                    {patientScope === "Individual patient" ? (
                      <ActionSelect label="Patient" value={singlePatientId} onChange={setSinglePatientId} options={patientOptions} />
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {patientScope === "All patients" ? "Showing dialysis sessions for every active renal chart." : "Choose multiple patients below."}
                      </div>
                    )}
                    <Button variant="outline" onClick={applyPatientScope}>Apply scope</Button>
                  </div>

                  {patientScope === "Selected patients" ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {mockRenalCharts.map((chart) => {
                        const checked = selectedPatientIds.includes(chart.patientId);
                        return (
                          <label className={checked ? "flex min-h-[68px] items-start gap-3 rounded-lg border border-info bg-info/5 p-3" : "flex min-h-[68px] items-start gap-3 rounded-lg border border-border bg-surface-muted p-3"} key={chart.id}>
                            <input
                              checked={checked}
                              className="mt-1 h-4 w-4 rounded border-input"
                              onChange={() => togglePatient(chart.patientId)}
                              type="checkbox"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-foreground">{patientName(chart.patientId)}</span>
                              <span className="mt-1 block text-xs text-muted-foreground">{chart.bedNo} • {chart.ward} • {chart.renalStatus}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Dialysis sessions</CardTitle>
                    <CardDescription>Select one or more sessions for billing handoff.</CardDescription>
                  </div>
                  <Badge tone="info">{rows.length} shown</Badge>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_auto_auto] lg:items-center">
                    <div className="relative min-w-0">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search patient, session, modality, access..."
                      />
                    </div>
                    <NativeSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Scheduled", "In progress", "Completed", "Billing pending"]} />
                    <Button size="sm" variant="outline" onClick={selectVisible}>Select shown</Button>
                    <Button size="sm" variant="outline" onClick={clearVisible}>Clear shown</Button>
                  </div>

                  {rows.length ? (
                    <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                      {rows.map((session) => {
                        const checked = selectedIds.includes(session.id);
                        const chart = getRenalChartByPatient(session.patientId);
                        return (
                          <label
                            className={checked ? "flex gap-3 rounded-lg border border-info bg-info/5 p-3" : "flex gap-3 rounded-lg border border-border bg-surface-muted p-3"}
                            key={session.id}
                          >
                            <input
                              checked={checked}
                              className="mt-1 h-4 w-4 rounded border-input"
                              onChange={() => toggleSession(session.id)}
                              type="checkbox"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-start justify-between gap-3">
                                <span>
                                  <span className="block text-sm font-semibold text-foreground">{session.sessionNo} • {patientName(session.patientId)}</span>
                                  <span className="mt-1 block text-xs text-muted-foreground">{session.modality} • {session.scheduledAt} • {session.accessSite}</span>
                                </span>
                                <StatusPill tone={statusTone(session.status)}>{session.status}</StatusPill>
                              </span>
                              <span className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
                                <RenalAlertMeta label="Bed / ward" value={chart ? `${chart.bedNo} • ${chart.ward}` : "No chart"} />
                                <RenalAlertMeta label="UF target" value={formatMl(session.ufTargetMl)} />
                                <RenalAlertMeta label="UF removed" value={formatMl(session.ufRemovedMl)} />
                                <RenalAlertMeta label="Estimate" value={formatInr(dialysisBillingAmount(session, packageMode))} />
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState icon={Search} title="No dialysis sessions found" description="Adjust search or status filter to find billing rows." className="min-h-40" />
                  )}
                </CardContent>
              </Card>

              <textarea className="min-h-[88px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Billing note / package clarification / payer instruction" />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {selectedSessions.length ? `${selectedSessions.length} session${selectedSessions.length === 1 ? "" : "s"} selected • ${formatInr(selectedEstimate)}` : "Select at least one session to continue."}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                disabled={!canSubmit || !selectedSessions.length}
                onClick={() => {
                  if (!selectedSessions.length) {
                    toast.error("Select at least one dialysis session");
                    return;
                  }
                  toast.success(`${primaryLabel}: ${selectedSessions.length} session${selectedSessions.length === 1 ? "" : "s"} sent to ${handoffTo} (${formatInr(selectedEstimate)})`);
                  onOpenChange(false);
                }}
              >
                {primaryLabel}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function NewRenalEntryWorkflow({
  access,
  onOpenChange,
}: {
  access: ReturnType<typeof useRenalAccess>;
  onOpenChange: (open: boolean) => void;
}) {
  const existingCharts = React.useMemo(() => mockRenalCharts.slice().sort((left, right) => renalPriorityScore(right) - renalPriorityScore(left)), []);
  const newCandidates = React.useMemo(() => mockPatients.filter((patient) => !getRenalChartByPatient(patient.id)), []);
  const [scenario, setScenario] = React.useState<"existing" | "new">("new");
  const [entryMode, setEntryMode] = React.useState<RenalEntryMode>("io");
  const [selectedExistingId, setSelectedExistingId] = React.useState(existingCharts[0]?.patientId ?? "");
  const [selectedNewId, setSelectedNewId] = React.useState(newCandidates[0]?.id ?? "");
  const [newBedWard, setNewBedWard] = React.useState("Assign current bed");
  const [newFluidRestriction, setNewFluidRestriction] = React.useState("1800 ml / 24h");
  const [newConsultant, setNewConsultant] = React.useState("Use visit provider");
  const [newNephrologist, setNewNephrologist] = React.useState("Assign nephrologist");
  const [newTargetBalance, setNewTargetBalance] = React.useState("+500 ml");
  const selectedChart = existingCharts.find((chart) => chart.patientId === selectedExistingId) ?? existingCharts[0];
  const selectedNewPatient = newCandidates.find((patient) => patient.id === selectedNewId) ?? newCandidates[0];
  const selectedPatient = scenario === "existing" ? getPatientById(selectedChart?.patientId ?? "") : selectedNewPatient;
  const selectedVisit = selectedPatient ? mockPatientVisits.find((visit) => visit.patientId === selectedPatient.id) : undefined;
  const newPatientBlocked = scenario === "new" && selectedNewPatient?.status === "Deceased";
  const canSubmit = access.canEnterIO && Boolean(selectedPatient) && !newPatientBlocked;
  const submitLabel = scenario === "existing" ? "Save entry" : "Create chart";
  const existingChartOptions = existingCharts.map((chart) => ({
    value: chart.patientId,
    label: `${patientName(chart.patientId)} - ${chart.bedNo}, ${chart.ward} - ${chart.renalStatus}`,
  }));
  const newPatientOptions = newCandidates.length
    ? newCandidates.map((patient) => {
      const visit = mockPatientVisits.find((item) => item.patientId === patient.id);
      const blocked = patient.status === "Deceased";
      return {
        value: patient.id,
        label: `${patientRecordName(patient)} - ${patient.uhid} - ${visit?.visitType ?? patient.department}${blocked ? " - blocked" : ""}`,
      };
    })
    : [{ value: "", label: "No patient available for new renal chart" }];
  const consultantOptions = [
    { value: "Use visit provider", label: selectedVisit?.provider ? `Use visit provider - ${selectedVisit.provider}` : "Use visit provider" },
    { value: "Dr. Aman Verma", label: "Dr. Aman Verma" },
    { value: "Dr. Neha Malik", label: "Dr. Neha Malik" },
    { value: "Dr. Kavita Rao", label: "Dr. Kavita Rao" },
    { value: "Emergency Desk", label: "Emergency Desk" },
  ];

  const handleSubmit = React.useCallback(() => {
    if (!access.canEnterIO) {
      toast.error("Current role cannot create renal entries");
      return;
    }
    if (!selectedPatient || newPatientBlocked) {
      toast.error("Select an eligible patient first");
      return;
    }

    if (scenario === "existing") {
      toast.success(`${entryModeLabel(entryMode)} staged for existing renal chart: ${patientRecordName(selectedPatient)}`);
    } else {
      toast.success(`New renal chart created for ${patientRecordName(selectedPatient)} - ${newBedWard}, target ${newTargetBalance}`);
    }
    onOpenChange(false);
  }, [access.canEnterIO, entryMode, newBedWard, newPatientBlocked, newTargetBalance, onOpenChange, scenario, selectedPatient]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border p-3">
        <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
          <Tabs value={scenario} onValueChange={(value) => setScenario(value as "existing" | "new")}>
            <TabsList className="grid h-9 w-full grid-cols-2 overflow-visible p-1 md:w-[220px]">
              <TabsTrigger className="min-w-0 px-2" value="new">New chart</TabsTrigger>
              <TabsTrigger className="min-w-0 px-2" value="existing">Existing</TabsTrigger>
            </TabsList>
          </Tabs>
          {scenario === "existing" ? (
            <ActionSelect label="Existing renal chart" value={selectedExistingId} onChange={setSelectedExistingId} options={existingChartOptions} />
          ) : (
            <ActionSelect label="Patient for new chart" value={selectedNewId} onChange={setSelectedNewId} options={newPatientOptions} />
          )}
          <Badge tone={scenario === "existing" ? "info" : "warning"}>{scenario === "existing" ? `${existingCharts.length} charts` : `${newCandidates.length} candidates`}</Badge>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{selectedPatient ? patientRecordName(selectedPatient) : "Select patient"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {selectedPatient ? `${selectedPatient.uhid} • ${selectedVisit?.visitType ?? selectedPatient.department}` : "Choose a patient from the dropdown."}
                  </div>
                </div>
                {scenario === "existing" && selectedChart ? <RenalStatusBadge status={selectedChart.renalStatus} /> : <Badge tone="info">New renal chart</Badge>}
              </div>
              {newPatientBlocked ? (
                <div className="mt-3">
                  <AlertBanner icon={ShieldAlert} tone="danger" title="Patient blocked">
                    Deceased/read-only records cannot start a new renal chart.
                  </AlertBanner>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm sm:col-span-3">
                <span className="font-medium text-foreground">Entry type</span>
                <Tabs value={entryMode} onValueChange={(value) => setEntryMode(value as RenalEntryMode)}>
                  <TabsList className="grid h-9 w-full grid-cols-3 overflow-visible p-1">
                    <TabsTrigger className="min-w-0 px-2" value="io">I/O</TabsTrigger>
                    <TabsTrigger className="min-w-0 px-2" value="intake">Intake</TabsTrigger>
                    <TabsTrigger className="min-w-0 px-2" value="output">Output</TabsTrigger>
                  </TabsList>
                </Tabs>
              </label>
              {scenario === "existing" && selectedChart ? (
                <>
                  <ActionInput label="Bed / Ward" value={`${selectedChart.bedNo} • ${selectedChart.ward}`} readOnly />
                  <ActionInput label="Fluid restriction" value={formatMl(selectedChart.fluidRestrictionMl)} readOnly />
                </>
              ) : (
                <>
                  <ActionSelect label="Bed / Ward" value={newBedWard} onChange={setNewBedWard} options={renalNewChartWardOptions} />
                  <ActionSelect label="Fluid restriction" value={newFluidRestriction} onChange={setNewFluidRestriction} options={renalFluidRestrictionOptions} />
                </>
              )}
            </div>

            {scenario === "new" ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <ActionSelect label="Consultant" value={newConsultant} onChange={setNewConsultant} options={consultantOptions} />
                <ActionSelect label="Nephrologist" value={newNephrologist} onChange={setNewNephrologist} options={renalNephrologistOptions} />
                <ActionSelect label="Target balance" value={newTargetBalance} onChange={setNewTargetBalance} options={renalTargetBalanceOptions} />
              </div>
            ) : null}

            <RenalFirstEntryDraft mode={entryMode} />
          </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {scenario === "existing" ? "Saves an entry without recreating the renal chart." : "Creates chart context and first renal entry together."}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        {scenario === "existing" && selectedChart ? (
          <Button variant="outline" asChild>
            <Link href={`/renal/patients/${selectedChart.patientId}`}>Open chart</Link>
          </Button>
        ) : null}
        <Button disabled={!canSubmit} onClick={handleSubmit}>
          {submitLabel}
        </Button>
        </div>
      </div>
    </div>
  );
}

function RenalFirstEntryDraft({ mode }: { mode: RenalEntryMode }) {
  const showIntake = mode !== "output";
  const showOutput = mode !== "intake";
  const [timeSlot, setTimeSlot] = React.useState("Current hour");
  const [enteredBy, setEnteredBy] = React.useState("Current user");

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>First Entry Draft</CardTitle>
          <CardDescription>{entryModeLabel(mode)} for the first renal chart row.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
        <ActionSelect label="Time slot" value={timeSlot} onChange={setTimeSlot} options={renalTimeSlotOptions} />
        {showIntake ? <ActionInput label="IV fluids (ml)" value="0" /> : null}
        {showIntake ? <ActionInput label="Oral intake (ml)" value="0" /> : null}
        {showIntake ? <ActionInput label="Med / flush (ml)" value="0" /> : null}
        {showIntake ? <ActionInput label="Blood products (ml)" value="0" /> : null}
        {showOutput ? <ActionInput label="Urine output (ml)" value="0" /> : null}
        {showOutput ? <ActionInput label="Drain output (ml)" value="0" /> : null}
        {showOutput ? <ActionInput label="Stool / other (ml)" value="0" /> : null}
        <ActionSelect label="Entered by" value={enteredBy} onChange={setEnteredBy} options={renalEnteredByOptions} />
      </CardContent>
    </Card>
  );
}

function RenalEntryActionForm({ chart, mode = "io" }: { chart: RenalPatientChart; mode?: RenalEntryMode }) {
  const showIntake = mode !== "output";
  const showOutput = mode !== "intake";
  const title = mode === "intake" ? "Intake entry" : mode === "output" ? "Output entry" : "Fast renal entry";
  const helper = mode === "intake"
    ? "Capture IV, oral intake, medication flush, and blood products for this time slot."
    : mode === "output"
      ? "Capture urine output, drain output, stool/other output, and bedside note."
      : "Use this quick action for bedside intake, output, drain, and shift note capture.";

  return (
    <>
      <AlertBanner icon={Droplets} tone="info" title={title}>
        {helper}
      </AlertBanner>
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <ActionInput label="Patient" value={patientName(chart.patientId)} readOnly />
          <ActionInput label="Bed" value={`${chart.bedNo} • ${chart.ward}`} readOnly />
          <ActionInput label="Time slot" value="Current hour" />
          {showIntake ? <ActionInput label="IV fluids (ml)" value="100" /> : null}
          {showIntake ? <ActionInput label="Oral intake (ml)" value="0" /> : null}
          {showIntake ? <ActionInput label="Med / flush (ml)" value="0" /> : null}
          {showIntake ? <ActionInput label="Blood products (ml)" value="0" /> : null}
          {showOutput ? <ActionInput label="Urine output (ml)" value="0" /> : null}
          {showOutput ? <ActionInput label="Drain output (ml)" value="0" /> : null}
          {showOutput ? <ActionInput label="Stool / other (ml)" value="0" /> : null}
          <ActionInput label="Entered by" value="Current user" />
        </CardContent>
      </Card>
      <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Renal shift note / correction reason" />
    </>
  );
}

function RenalReviewActionForm({ chart }: { chart: RenalPatientChart }) {
  const alerts = getRenalAlertsByPatient(chart.patientId);
  const orders = getRenalOrdersByPatient(chart.patientId);
  const latestLab = getRenalLabsByPatient(chart.patientId)[0];
  const pendingOrders = orders.filter((order) => order.status === "Pending sign").length;
  return (
    <>
      <AlertBanner icon={Stethoscope} tone={renalStatusToneForDrawer(chart.renalStatus)} title="Final renal report sign-off">
        Use this only after intake/output, drains, labs, alerts, and renal orders are reviewed for EMR handoff.
      </AlertBanner>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sign-off checklist</CardTitle>
            <CardDescription>Confirm the renal report is clinically ready before signing.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-x-5 gap-y-1 p-4 pt-0 sm:grid-cols-2">
          <DetailRow label="Patient status" value={<RenalStatusBadge status={chart.renalStatus} />} />
          <DetailRow label="Next action" value={renalNextAction(chart)} />
          <DetailRow label="Cumulative balance" value={<BalanceBadge value={chart.cumulativeBalanceMl} />} />
          <DetailRow label="Fluid restriction" value={formatMl(chart.fluidRestrictionMl)} />
          <DetailRow label="Dialysis" value={chart.dialysisStatus} />
          <DetailRow label="Open alerts" value={String(alerts.length)} />
          <DetailRow label="Pending orders" value={String(pendingOrders)} />
          <DetailRow label="Latest labs" value={latestLab ? `Cr ${latestLab.creatinine}, K ${latestLab.potassium}` : "Not available"} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Final decision</CardTitle>
            <CardDescription>Clear sign-off fields for doctor accountability.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2">
          <ActionInput label="Decision" value="Sign report after review" />
          <ActionInput label="Signed by" value="Current doctor / reviewer" />
          <ActionInput label="Report status" value="Ready for EMR handoff" readOnly />
          <ActionInput label="Signed at" value="Current time" readOnly />
        </CardContent>
      </Card>
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Items reviewed</div>
        {alerts.map((alert) => (
          <div className="rounded-md border border-border bg-surface-muted p-2 text-xs" key={alert.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold text-foreground">{alert.title}</span>
              <StatusPill tone={renalAlertTone(alert.severity)}>{alert.severity}</StatusPill>
            </div>
            <div className="mt-1 text-muted-foreground">{alert.metric} • {alert.status}</div>
          </div>
        ))}
        {orders.map((order) => (
          <div className="rounded-md border border-border bg-surface-muted p-2 text-xs" key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold text-foreground">{order.order}</span>
              <StatusPill tone={statusTone(order.status)}>{order.status}</StatusPill>
            </div>
            <div className="mt-1 text-muted-foreground">{order.target} • {order.orderedBy} • {order.orderedAt}</div>
          </div>
        ))}
      </div>
      <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Sign-off note / renal plan / escalation reason" />
    </>
  );
}

function RenalLabActionForm({ chart }: { chart: RenalPatientChart }) {
  const latestLab = getRenalLabsByPatient(chart.patientId)[0];
  return (
    <>
      <AlertBanner icon={FlaskConical} tone="warning" title="Renal lab update">
        Critical electrolytes should be acknowledged by the doctor after entry.
      </AlertBanner>
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <ActionInput label="Patient" value={patientName(chart.patientId)} readOnly />
          <ActionInput label="Collected at" value="Now" />
          <ActionInput label="Creatinine" value={latestLab?.creatinine ?? ""} />
          <ActionInput label="Urea" value={latestLab?.urea ?? ""} />
          <ActionInput label="Sodium" value={latestLab?.sodium ?? ""} />
          <ActionInput label="Potassium" value={latestLab?.potassium ?? ""} />
          <ActionInput label="eGFR" value={latestLab?.egfr ?? ""} />
          <ActionInput label="Urine protein" value={latestLab?.urineProtein ?? ""} />
        </CardContent>
      </Card>
    </>
  );
}

function RenalBillingActionForm() {
  return (
    <>
      <AlertBanner icon={FileText} tone="info" title="Dialysis billing handoff">
        Billing receives service rows only; clinical chart editing remains protected.
      </AlertBanner>
      <div className="space-y-2">
        {mockDialysisSessions.map((session) => (
          <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm" key={session.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-foreground">{session.sessionNo}</div>
                <div className="mt-1 text-xs text-muted-foreground">{patientName(session.patientId)} • {session.modality} • {session.scheduledAt}</div>
              </div>
              <StatusPill tone={statusTone(session.status)}>{session.status}</StatusPill>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RenalAlertActionForm({ alert }: { alert: RenalAlert }) {
  return (
    <>
      <AlertBanner icon={ShieldAlert} tone={renalAlertTone(alert.severity)} title={alert.title}>
        {alert.metric} • Threshold: {alert.threshold}
      </AlertBanner>
      <Card>
        <CardContent className="space-y-1 p-4">
          <DetailRow label="Patient" value={patientName(alert.patientId)} />
          <DetailRow label="Owner" value={alert.owner} />
          <DetailRow label="Status" value={alert.status} />
          <DetailRow label="Severity" value={<StatusPill tone={renalAlertTone(alert.severity)}>{alert.severity}</StatusPill>} />
        </CardContent>
      </Card>
      <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Acknowledgement note / escalation reason" />
    </>
  );
}

function ActionInput({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <Input
        defaultValue={onChange ? undefined : value}
        readOnly={readOnly}
        value={onChange ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </label>
  );
}

function ActionSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <select
        className="h-[var(--density-control-height)] w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function RenalChartDrawer({ chart, open, onOpenChange }: { chart: RenalPatientChart | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(560px,90dvh)] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Renal chart review</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {chart ? `${patientName(chart.patientId)} • ${chart.bedNo}, ${chart.ward}` : "Select renal chart"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close renal chart review">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {chart ? (
              <div className="space-y-4">
                <AlertBanner icon={ShieldAlert} tone={renalStatusToneForDrawer(chart.renalStatus)} title={chart.renalStatus}>
                  {chart.riskFlags.join(" • ")}
                </AlertBanner>
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Chart summary</CardTitle>
                      <CardDescription>Quick review before opening the full renal workspace.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-x-5 gap-y-1 p-4 pt-0 sm:grid-cols-2">
                    <DetailRow label="Bed/Ward" value={`${chart.bedNo} • ${chart.ward}`} />
                    <DetailRow label="Consultant" value={chart.consultant} />
                    <DetailRow label="Nephrologist" value={chart.nephrologist} />
                    <DetailRow label="Fluid limit" value={formatMl(chart.fluidRestrictionMl)} />
                    <DetailRow label="Cumulative" value={<BalanceBadge value={chart.cumulativeBalanceMl} />} />
                    <DetailRow label="Target balance" value={formatSignedMl(chart.targetBalanceMl)} />
                    <DetailRow label="Catheter" value={chart.catheterStatus} />
                    <DetailRow label="Dialysis" value={chart.dialysisStatus} />
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            {chart ? (
              <Button asChild>
                <Link href={`/renal/patients/${chart.patientId}`}>Open full renal chart</Link>
              </Button>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function renalStatusToneForDrawer(status: RenalPatientChart["renalStatus"]): StatusTone {
  if (status === "Stable") return "success";
  if (status === "Critical") return "critical";
  if (status === "Fluid overload") return "danger";
  return "warning";
}

const renalDrainDeviceCatalog = [
  { name: "Surgical drain", sites: ["Right lower abdomen", "Left lower abdomen", "Pelvic drain site"], character: "Serous" },
  { name: "Abdominal drain", sites: ["Right lower abdomen", "Left lower abdomen", "Subhepatic drain"], character: "Serous" },
  { name: "Chest drain", sites: ["Right chest", "Left chest"], character: "Serosanguinous" },
  { name: "NG tube output", sites: ["NG tube", "Right nostril", "Left nostril"], character: "Bilious" },
  { name: "Gastrostomy output", sites: ["Gastrostomy", "Left upper abdomen"], character: "Clear" },
  { name: "Flexi seal", sites: ["Rectal tube"], character: "Liquid stool" },
  { name: "Pericardial drain", sites: ["Pericardial"], character: "Serous" },
] as const;

function renalDrainDeviceSites(deviceName: string) {
  return renalDrainDeviceCatalog.find((item) => item.name === deviceName)?.sites ?? ["Drain site"];
}

function DrainReadingModal({
  open,
  onOpenChange,
  canSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
}) {
  const firstChart = mockRenalCharts[0];
  const [mode, setMode] = React.useState<"existing" | "new">("existing");
  const [patientId, setPatientId] = React.useState(firstChart?.patientId ?? "");
  const patientDrains = React.useMemo(
    () => mockRenalDrains.filter((drain) => drain.patientId === patientId && drain.deviceStatus !== "Removed placeholder"),
    [patientId],
  );
  const [drainId, setDrainId] = React.useState(patientDrains[0]?.id ?? "");
  const selectedDrain = patientDrains.find((drain) => drain.id === drainId) ?? patientDrains[0];
  const selectedChart = getRenalChartByPatient(patientId);
  const [readingMl, setReadingMl] = React.useState("0");
  const [newDrainName, setNewDrainName] = React.useState<string>(renalDrainDeviceCatalog[0].name);
  const [newSite, setNewSite] = React.useState<string>(renalDrainDeviceCatalog[0].sites[0]);
  const [character, setCharacter] = React.useState("Serous");
  const [deviceStatus, setDeviceStatus] = React.useState("Active");
  const [concern, setConcern] = React.useState("None");
  const newDeviceSites = renalDrainDeviceSites(newDrainName);

  const handlePatientChange = React.useCallback((nextPatientId: string) => {
    const nextDrain = mockRenalDrains.find((drain) => drain.patientId === nextPatientId && drain.deviceStatus !== "Removed placeholder");
    setPatientId(nextPatientId);
    setDrainId(nextDrain?.id ?? "");
  }, []);

  const handleNewDrainNameChange = React.useCallback((value: string) => {
    const device = renalDrainDeviceCatalog.find((item) => item.name === value);
    setNewDrainName(value);
    setNewSite(device?.sites[0] ?? "Drain site");
    setCharacter(device?.character ?? "Serous");
  }, []);

  const handleSave = React.useCallback(() => {
    const outputValue = Number(readingMl);
    if (!canSubmit) {
      toast.error("Current role cannot add drain readings");
      return;
    }
    if (!patientId) {
      toast.error("Select a renal patient first");
      return;
    }
    if (!Number.isFinite(outputValue) || outputValue < 0) {
      toast.error("Enter a valid drain output in ml");
      return;
    }
    if (mode === "existing" && !selectedDrain) {
      toast.error("Select an active drain first");
      return;
    }
    if (mode === "new" && (!newDrainName.trim() || !newSite.trim())) {
      toast.error("Add drain/device name and site");
      return;
    }

    const label = mode === "existing" ? selectedDrain?.drainName : newDrainName.trim();
    toast.success(`${formatMl(outputValue)} drain reading staged for ${label} - ${patientName(patientId)}`);
    onOpenChange(false);
  }, [canSubmit, mode, newDrainName, newSite, onOpenChange, patientId, readingMl, selectedDrain]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(700px,90dvh)] w-[min(680px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Add drain reading</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Capture drain/device output and bedside condition for renal fluid balance.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close add drain reading modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can view drains, but cannot add a new reading.
                </AlertBanner>
              ) : null}
              <AlertBanner icon={Droplets} tone="info" title="Drain output entry">
                Output saved here should be included in the same 24-hour renal balance window.
              </AlertBanner>

              <div className="grid gap-3 sm:grid-cols-2">
                <ActionSelect
                  label="Patient"
                  value={patientId}
                  onChange={handlePatientChange}
                  options={mockRenalCharts.map((chart) => ({
                    value: chart.patientId,
                    label: `${patientName(chart.patientId)} - ${chart.bedNo}, ${chart.ward}`,
                  }))}
                />
                <ActionInput label="Renal window" value={selectedChart?.windowLabel ?? "No active renal chart"} readOnly />
              </div>

              <Tabs value={mode} onValueChange={(value) => setMode(value as "existing" | "new")}>
                <TabsList className="grid h-9 w-full grid-cols-2 overflow-visible p-1">
                  <TabsTrigger value="existing">Existing drain</TabsTrigger>
                  <TabsTrigger value="new">New device</TabsTrigger>
                </TabsList>
              </Tabs>

              {mode === "existing" ? (
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Existing drain</CardTitle>
                      <CardDescription>Select the active drain/device receiving this reading.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                    <ActionSelect
                      label="Drain / device"
                      value={selectedDrain?.id ?? ""}
                      onChange={setDrainId}
                      options={patientDrains.map((drain) => ({ value: drain.id, label: `${drain.drainName} - ${drain.site}` }))}
                    />
                    <ActionInput label="Current 24h total" value={selectedDrain ? formatMl(selectedDrain.total24HrMl) : "No active drain"} readOnly />
                    <ActionInput label="Current shift" value={selectedDrain ? formatMl(selectedDrain.currentShiftMl) : "No active drain"} readOnly />
                    <ActionInput label="Last checked" value={selectedDrain?.lastCheckedAt ?? "Not checked"} readOnly />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>New drain / device</CardTitle>
                      <CardDescription>Create the device context and first reading together.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                    <ActionSelect
                      label="Drain / device name"
                      value={newDrainName}
                      onChange={handleNewDrainNameChange}
                      options={renalDrainDeviceCatalog.map((item) => ({ value: item.name, label: item.name }))}
                    />
                    <ActionSelect
                      label="Site"
                      value={newSite}
                      onChange={setNewSite}
                      options={newDeviceSites.map((item) => ({ value: item, label: item }))}
                    />
                    <ActionSelect label="Device status" value={deviceStatus} onChange={setDeviceStatus} options={["Active", "Clamp trial", "Removed placeholder"].map((item) => ({ value: item, label: item }))} />
                    <ActionInput label="Created by" value="Current user" readOnly />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Reading details</CardTitle>
                    <CardDescription>Capture output, appearance, concern, and nursing note.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                  <ActionInput label="Output this check (ml)" value={readingMl} onChange={setReadingMl} />
                  <ActionInput label="Checked at" value="Current time" readOnly />
                  <ActionSelect label="Character" value={character} onChange={setCharacter} options={["Serous", "Serosanguinous", "Clear", "Bilious", "Liquid stool", "Coffee-ground watch"].map((item) => ({ value: item, label: item }))} />
                  <ActionSelect label="Concern" value={concern} onChange={setConcern} options={["None", "High output", "Blockage watch", "Infection watch"].map((item) => ({ value: item, label: item }))} />
                </CardContent>
              </Card>
              <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Drain note / dressing condition / escalation reason" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={!canSubmit} onClick={handleSave}>Save drain reading</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DrainReviewModal({
  drain,
  open,
  onOpenChange,
  canSubmit,
}: {
  drain: RenalDrainRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canSubmit: boolean;
}) {
  const [decisionByDrainId, setDecisionByDrainId] = React.useState<Record<string, string>>({});

  if (!drain) return null;
  const defaultDecision = drain.concern === "None" ? "Continue monitoring" : "Escalate to doctor";
  const decision = decisionByDrainId[drain.id] ?? defaultDecision;
  const chart = getRenalChartByPatient(drain.patientId);
  const relatedAlerts = getRenalAlertsByPatient(drain.patientId).filter((alert) => includes(`${alert.title} ${alert.metric}`, "drain") || drain.concern !== "None");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(640px,90dvh)] w-[min(660px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Drain review</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patientName(drain.patientId)} • {drain.drainName} • {drain.site}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close drain review modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {!canSubmit ? (
                <AlertBanner icon={ShieldAlert} tone="warning" title="Role limited">
                  Your current role can review this drain, but cannot record a review.
                </AlertBanner>
              ) : null}
              <AlertBanner icon={Droplets} tone={statusTone(drain.concern)} title={drain.concern}>
                {drain.character} • Last checked {drain.lastCheckedAt}
              </AlertBanner>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Device summary</CardTitle>
                    <CardDescription>Review drain status before signing the shift check.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-x-5 gap-y-1 p-4 pt-0 sm:grid-cols-2">
                  <DetailRow label="Patient" value={patientName(drain.patientId)} />
                  <DetailRow label="Bed / ward" value={chart ? `${chart.bedNo} • ${chart.ward}` : "No active chart"} />
                  <DetailRow label="Site" value={drain.site} />
                  <DetailRow label="Status" value={<StatusPill tone={statusTone(drain.deviceStatus)}>{drain.deviceStatus}</StatusPill>} />
                  <DetailRow label="Shift output" value={formatMl(drain.currentShiftMl)} />
                  <DetailRow label="24h output" value={formatMl(drain.total24HrMl)} />
                  <DetailRow label="Character" value={drain.character} />
                  <DetailRow label="Concern" value={<StatusPill tone={statusTone(drain.concern)}>{drain.concern}</StatusPill>} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Review action</CardTitle>
                    <CardDescription>Record what should happen next for this drain/device.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2">
                  <ActionSelect
                    label="Decision"
                    value={decision}
                    onChange={(value) => setDecisionByDrainId((current) => ({ ...current, [drain.id]: value }))}
                    options={["Continue monitoring", "Escalate to doctor", "Check patency", "Prepare removal review"].map((item) => ({ value: item, label: item }))}
                  />
                  <ActionInput label="Reviewed by" value="Current user" readOnly />
                  <ActionInput label="Next check" value="Next shift" />
                  <ActionInput label="Report status" value={drain.concern === "None" ? "Routine" : "Needs follow-up"} readOnly />
                </CardContent>
              </Card>

              {relatedAlerts.length ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Related renal alerts</div>
                  {relatedAlerts.map((alert) => (
                    <div className="rounded-md border border-border bg-surface-muted p-2 text-xs" key={alert.id}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-foreground">{alert.title}</span>
                        <StatusPill tone={renalAlertTone(alert.severity)}>{alert.severity}</StatusPill>
                      </div>
                      <div className="mt-1 text-muted-foreground">{alert.metric} • {alert.status}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              <textarea className="min-h-[96px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Drain review note / action taken / escalation reason" />
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:justify-end">
            <Button variant="outline" asChild>
              <Link href={`/renal/patients/${drain.patientId}`}>Open patient chart</Link>
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              disabled={!canSubmit}
              onClick={() => {
                toast.success(`${decision} recorded for ${drain.drainName}`);
                onOpenChange(false);
              }}
            >
              Save review
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
