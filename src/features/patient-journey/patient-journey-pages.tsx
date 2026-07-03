"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Ambulance, BarChart3, BedDouble, Bell, Clock3, CreditCard, FileCheck2, FlaskConical, LayoutDashboard, Monitor, Pill, ScanSearch, Stethoscope, UserRound } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSplitWorkflowOrders, getSplitWorkflowTokens, journeyStages, mockBottlenecks, mockJourneyEvents, mockJourneyPatients, mockRadiologyOrders, mockSmartAlerts, splitWorkflowConfigs, trackerBoards } from "@/features/patient-journey/patient-journey-data";
import { DetailLine, JourneyStageColumn, JourneyTimeline, Patient360Drawer, PatientJourneyAccessBanner, PatientJourneyCard, PatientJourneyCenterWindow, ProtectedPatientJourney, SmartAlertPanel, Snapshot, StageStepper, journeyTone, waitLabel } from "@/features/patient-journey/patient-journey-shared";
import type { BottleneckMetric, PatientJourneyRecord, PatientJourneyStage, RadiologyJourneyOrder, RadiologyModality, RadiologyOrderStatus, RadiologyPriority, RadiologySource, ServiceToken, ServiceWorkOrder, SplitWorkflowKey, SplitWorkflowPriority, TrackerKey } from "@/features/patient-journey/patient-journey-types";

const trackerIconMap: Record<TrackerKey, typeof LayoutDashboard> = {
  emergency: Ambulance,
  ipd: BedDouble,
  icu: Monitor,
  ot: Stethoscope,
  lab: FlaskConical,
  radiology: ScanSearch,
  pharmacy: Pill,
  billing: CreditCard,
  insurance: FileCheck2,
  discharge: FileCheck2,
  followup: Clock3,
};

function patientSearchText(patient: PatientJourneyRecord) {
  return [
    patient.patientName,
    patient.uhid,
    patient.visitId,
    patient.token,
    patient.department,
    patient.doctor,
    patient.stage,
    patient.priority,
    patient.billingStatus,
    patient.labStatus,
    patient.radiologyStatus,
    patient.pharmacyStatus,
    patient.insuranceStatus,
    patient.dischargeStatus,
    patient.status,
    patient.ownerRole,
    patient.chiefComplaint,
    patient.nextAction,
    patient.blocker ?? "",
  ].join(" ").toLowerCase();
}

const patientPageSize = 10;
const radiologyPageSize = 10;
const radiologyBoardColumns: RadiologyOrderStatus[] = ["Ordered", "Payment Pending", "Scheduled", "Arrived", "In Scan", "Reporting", "Approval Pending", "Ready"];
const chartColors = ["#2563eb", "#0891b2", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed", "#f97316", "#0f766e"];

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function countPatientsBy(patients: PatientJourneyRecord[], getKey: (patient: PatientJourneyRecord) => string) {
  const counts = new Map<string, number>();
  patients.forEach((patient) => counts.set(getKey(patient), (counts.get(getKey(patient)) ?? 0) + 1));
  return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function useIsClient() {
  return React.useSyncExternalStore(
    React.useCallback(() => () => undefined, []),
    () => true,
    () => false,
  );
}

function radiologySearchText(order: RadiologyJourneyOrder) {
  return [
    order.orderNo,
    order.patientName,
    order.uhid,
    order.token,
    order.source,
    order.department,
    order.doctor,
    order.modality,
    order.study,
    order.priority,
    order.status,
    order.billingStatus,
    order.safetyStatus,
    order.reportStatus,
    order.assignedRadiologist,
    order.blocker ?? "",
  ].join(" ").toLowerCase();
}

function radiologyPriorityTone(priority: RadiologyPriority) {
  if (priority === "Critical") return "critical";
  if (priority === "STAT") return "danger";
  if (priority === "Urgent") return "warning";
  return "muted";
}

function radiologyStatusTone(status: RadiologyOrderStatus) {
  if (status === "Ready") return "success";
  if (status === "Approval Pending" || status === "Reporting") return "warning";
  if (status === "Payment Pending") return "danger";
  if (status === "In Scan" || status === "Arrived") return "info";
  return "muted";
}

function usePatientJourneyFilters(sourcePatients: PatientJourneyRecord[] = mockJourneyPatients) {
  const [query, setQuery] = React.useState("");
  const [visitType, setVisitType] = React.useState("All visits");
  const [stage, setStage] = React.useState("All stages");
  const [priority, setPriority] = React.useState("All priority");
  const [department, setDepartment] = React.useState("All departments");
  const [status, setStatus] = React.useState("All status");
  const [page, setPage] = React.useState(1);

  const resetPage = React.useCallback(() => setPage(1), []);

  const patients = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sourcePatients.filter((patient) => {
      const matchesQuery = !normalized || patientSearchText(patient).includes(normalized);
      const matchesVisit = visitType === "All visits" || patient.visitType === visitType;
      const matchesStage = stage === "All stages" || patient.stage === stage;
      const matchesPriority = priority === "All priority" || patient.priority === priority;
      const matchesDepartment = department === "All departments" || patient.department === department;
      const matchesStatus = status === "All status" || patient.status === status;
      return matchesQuery && matchesVisit && matchesStage && matchesPriority && matchesDepartment && matchesStatus;
    });
  }, [department, priority, query, sourcePatients, stage, status, visitType]);

  const totalPages = Math.max(1, Math.ceil(patients.length / patientPageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePatients = patients.slice((currentPage - 1) * patientPageSize, currentPage * patientPageSize);
  const departments = React.useMemo(() => uniqueOptions(sourcePatients.map((patient) => patient.department)), [sourcePatients]);

  const setQueryFilter = (value: string) => {
    setQuery(value);
    resetPage();
  };
  const setVisitTypeFilter = (value: string) => {
    setVisitType(value);
    resetPage();
  };
  const setStageFilter = (value: string) => {
    setStage(value);
    resetPage();
  };
  const setPriorityFilter = (value: string) => {
    setPriority(value);
    resetPage();
  };
  const setDepartmentFilter = (value: string) => {
    setDepartment(value);
    resetPage();
  };
  const setStatusFilter = (value: string) => {
    setStatus(value);
    resetPage();
  };

  return {
    query,
    setQuery: setQueryFilter,
    visitType,
    setVisitType: setVisitTypeFilter,
    stage,
    setStage: setStageFilter,
    priority,
    setPriority: setPriorityFilter,
    department,
    setDepartment: setDepartmentFilter,
    status,
    setStatus: setStatusFilter,
    patients,
    pagePatients,
    departments,
    page: currentPage,
    totalPages,
    setPage,
  };
}

function useRadiologyFilters() {
  const [query, setQuery] = React.useState("");
  const [modality, setModality] = React.useState<"All modalities" | RadiologyModality>("All modalities");
  const [priority, setPriority] = React.useState<"All priority" | RadiologyPriority>("All priority");
  const [status, setStatus] = React.useState<"All status" | RadiologyOrderStatus>("All status");
  const [source, setSource] = React.useState<"All sources" | RadiologySource>("All sources");
  const [delayedOnly, setDelayedOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const resetPage = React.useCallback(() => setPage(1), []);
  const orders = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return mockRadiologyOrders
      .filter((order) => {
        const matchesQuery = !normalized || radiologySearchText(order).includes(normalized);
        const matchesModality = modality === "All modalities" || order.modality === modality;
        const matchesPriority = priority === "All priority" || order.priority === priority;
        const matchesStatus = status === "All status" || order.status === status;
        const matchesSource = source === "All sources" || order.source === source;
        const matchesDelay = !delayedOnly || order.waitingMinutes >= 45 || order.priority === "Critical" || Boolean(order.blocker);
        return matchesQuery && matchesModality && matchesPriority && matchesStatus && matchesSource && matchesDelay;
      })
      .sort((a, b) => {
        const rank = (order: RadiologyJourneyOrder) => (order.priority === "Critical" ? 0 : order.priority === "STAT" ? 1 : order.blocker ? 2 : order.priority === "Urgent" ? 3 : 4);
        return rank(a) - rank(b) || b.waitingMinutes - a.waitingMinutes;
      });
  }, [delayedOnly, modality, priority, query, source, status]);

  const totalPages = Math.max(1, Math.ceil(orders.length / radiologyPageSize));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = orders.slice((currentPage - 1) * radiologyPageSize, currentPage * radiologyPageSize);

  return {
    query,
    setQuery: (value: string) => {
      setQuery(value);
      resetPage();
    },
    modality,
    setModality: (value: "All modalities" | RadiologyModality) => {
      setModality(value);
      resetPage();
    },
    priority,
    setPriority: (value: "All priority" | RadiologyPriority) => {
      setPriority(value);
      resetPage();
    },
    status,
    setStatus: (value: "All status" | RadiologyOrderStatus) => {
      setStatus(value);
      resetPage();
    },
    source,
    setSource: (value: "All sources" | RadiologySource) => {
      setSource(value);
      resetPage();
    },
    delayedOnly,
    setDelayedOnly: (value: boolean) => {
      setDelayedOnly(value);
      resetPage();
    },
    orders,
    pageOrders,
    page: currentPage,
    totalPages,
    setPage,
  };
}

export function PatientJourneyDashboardPage() {
  return (
    <ProtectedPatientJourney>
      <PatientJourneyDashboard />
    </ProtectedPatientJourney>
  );
}

function PatientJourneyDashboard() {
  const [selected, setSelected] = React.useState<PatientJourneyRecord | null>(null);
  const { query, setQuery, visitType, setVisitType, stage, setStage, priority, setPriority, department, setDepartment, status, setStatus, departments, patients, pagePatients, page, totalPages, setPage } = usePatientJourneyFilters();
  const activePatients = patients.filter((patient) => patient.stage !== "Completed");
  const delayed = patients.filter((patient) => ["Delayed", "Critical"].includes(patient.status)).length;
  const averageWait = activePatients.length ? Math.round(activePatients.reduce((sum, patient) => sum + patient.waitingMinutes, 0) / activePatients.length) : 0;
  return (
    <div className="space-y-4">
      <PatientJourneyAccessBanner />
      <PageHeader
        eyebrow="Patient Journey Command Desk"
        title="Live Hospital Flow Dashboard"
        description="One command surface for OPD, emergency, IPD, diagnostics, pharmacy, billing, insurance, discharge, and follow-up movement."
        actions={<><Button variant="outline" asChild><Link href="/patient-journey/live-board">Open Live Board</Link></Button><Button asChild><Link href="/patient-journey/alerts">View Alerts</Link></Button></>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active patients" value={activePatients.length} change="Live" context="Current visits" tone="info" icon={UserRound} />
        <StatCard label="Delayed" value={delayed} change="Needs action" context="Threshold crossed" tone="danger" icon={AlertTriangle} />
        <StatCard label="Critical" value={patients.filter((patient) => patient.priority === "Critical").length} change="Emergency" context="Top priority" tone="critical" icon={Ambulance} />
        <StatCard label="Average wait" value={averageWait} change="Minutes" context="Across active flow" tone="warning" icon={Clock3} />
        <StatCard label="Discharge blocks" value={patients.filter((patient) => patient.stage === "Discharge Pending").length} change="Bed turnover" context="IPD exit" tone="warning" icon={FileCheck2} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Command filters</CardTitle>
            <CardDescription>Search and slice the whole patient journey by scenario, stage, department, priority, and risk.</CardDescription>
          </div>
          <Badge tone="info">{patients.length} matching</Badge>
        </CardHeader>
        <CardContent>
          <JourneyFilters framed={false} query={query} setQuery={setQuery} visitType={visitType} setVisitType={setVisitType} stage={stage} setStage={setStage} priority={priority} setPriority={setPriority} department={department} setDepartment={setDepartment} status={status} setStatus={setStatus} departments={departments} />
        </CardContent>
      </Card>

      <DashboardCommandTabs
        activePatients={activePatients}
        bottlenecks={mockBottlenecks}
        page={page}
        pagePatients={pagePatients}
        patients={patients}
        setPage={setPage}
        totalPages={totalPages}
        onOpen={setSelected}
      />
      <Patient360Drawer patient={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}

function DashboardCommandTabs({
  activePatients,
  bottlenecks,
  page,
  pagePatients,
  patients,
  setPage,
  totalPages,
  onOpen,
}: {
  activePatients: PatientJourneyRecord[];
  bottlenecks: BottleneckMetric[];
  page: number;
  pagePatients: PatientJourneyRecord[];
  patients: PatientJourneyRecord[];
  setPage: (page: number) => void;
  totalPages: number;
  onOpen: (patient: PatientJourneyRecord) => void;
}) {
  return (
    <Tabs defaultValue="scenario" className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <TabsList className="min-w-max">
          <TabsTrigger value="scenario">Scenario Command</TabsTrigger>
          <TabsTrigger value="live">Live Flow</TabsTrigger>
          <TabsTrigger value="review">Review Worklist</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="graphs">Graphs</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="scenario" className="space-y-4">
        <ScenarioTabs patients={patients} onOpen={onOpen} />
      </TabsContent>

      <TabsContent value="live" className="space-y-4">
        <LiveFlowPreview patients={activePatients} onOpen={onOpen} />
      </TabsContent>

      <TabsContent value="review" className="space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Patient review worklist</CardTitle>
              <CardDescription>Search and filter every active scenario by patient, UHID, token, visit, department, status, and priority.</CardDescription>
            </div>
            <Badge tone="info">{patients.length} filtered</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <PatientReviewGrid patients={pagePatients} onOpen={onOpen} />
            <PaginationBar page={page} totalPages={totalPages} total={patients.length} onPageChange={setPage} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bottlenecks" className="space-y-4">
        <BottleneckTable metrics={bottlenecks} />
      </TabsContent>

      <TabsContent value="insights" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <SmartInsightPanel patients={patients} />
          <div className="space-y-4">
            <SmartAlertPanel alerts={mockSmartAlerts} />
            <QuickActions />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="graphs" className="space-y-4">
        <DashboardCharts patients={patients} />
      </TabsContent>
    </Tabs>
  );
}

function LiveFlowPreview({ patients, onOpen }: { patients: PatientJourneyRecord[]; onOpen: (patient: PatientJourneyRecord) => void }) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(patients.length / patientPageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePatients = patients.slice((currentPage - 1) * patientPageSize, currentPage * patientPageSize);

  React.useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Live patient flow preview</CardTitle>
          <CardDescription>Latest active patient cards grouped by current journey stage.</CardDescription>
        </div>
        <Button variant="outline" asChild><Link href="/patient-journey/live-board">Expand</Link></Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {pagePatients.map((patient) => <PatientJourneyCard key={patient.id} patient={patient} onOpen={onOpen} />)}
        </div>
        <PaginationBar page={currentPage} totalPages={totalPages} total={patients.length} onPageChange={setPage} />
      </CardContent>
    </Card>
  );
}

function DashboardCharts({ patients }: { patients: PatientJourneyRecord[] }) {
  const isClient = useIsClient();
  const departmentDelayData = countPatientsBy(patients.filter((patient) => ["Delayed", "Critical"].includes(patient.status)), (patient) => patient.department).slice(0, 8);
  const visitTypeData = countPatientsBy(patients, (patient) => patient.visitType);
  const stageData = journeyStages.map((stageName) => ({ name: stageName.replace(" Pending", ""), value: patients.filter((patient) => patient.stage === stageName).length })).filter((row) => row.value);
  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Department delay pressure</CardTitle>
            <CardDescription>Filtered delayed and critical patients by department.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            {isClient ? <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <BarChart data={departmentDelayData} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer> : <ChartPlaceholder />}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Visit mix</CardTitle>
            <CardDescription>OPD, IPD, emergency, and follow-up split.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            {isClient ? <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <PieChart>
                <Pie data={visitTypeData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3}>
                  {visitTypeData.map((entry, index) => <Cell fill={chartColors[index % chartColors.length]} key={entry.name} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer> : <ChartPlaceholder />}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {visitTypeData.map((entry, index) => (
              <div className="flex items-center gap-2" key={entry.name}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                <span className="truncate text-muted-foreground">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="2xl:col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Stage workload</CardTitle>
            <CardDescription>Where filtered patients are currently parked in the journey.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            {isClient ? <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <BarChart data={stageData} layout="vertical" margin={{ left: 12, right: 20, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={126} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer> : <ChartPlaceholder />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartPlaceholder() {
  return <div className="grid h-full place-items-center rounded-lg border border-dashed border-border bg-surface-muted text-xs text-muted-foreground">Chart loading</div>;
}

function ScenarioTabs({ patients, onOpen }: { patients: PatientJourneyRecord[]; onOpen: (patient: PatientJourneyRecord) => void }) {
  const scenarios = [
    { key: "overview", label: "Overview", rows: patients },
    { key: "opd", label: "OPD Flow", rows: patients.filter((patient) => patient.visitType === "OPD") },
    { key: "emergency", label: "Emergency", rows: patients.filter((patient) => patient.visitType === "Emergency" || patient.priority === "Critical") },
    { key: "diagnostics", label: "Diagnostics", rows: patients.filter((patient) => patient.stage === "Lab Pending" || patient.stage === "Radiology Pending" || patient.stage === "Report Ready") },
    { key: "finance", label: "Billing/Insurance", rows: patients.filter((patient) => patient.stage === "Billing Pending" || patient.insuranceStatus !== "Not required") },
    { key: "discharge", label: "Discharge", rows: patients.filter((patient) => patient.stage === "Discharge Pending" || patient.dischargeStatus !== "Not applicable") },
    { key: "followup", label: "Follow-up", rows: patients.filter((patient) => patient.visitType === "Follow-up") },
  ];
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Scenario command tabs</CardTitle>
          <CardDescription>Focused operational slices for teams and management review.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-3">
          <TabsList>
            {scenarios.map((scenario) => <TabsTrigger value={scenario.key} key={scenario.key}>{scenario.label}</TabsTrigger>)}
          </TabsList>
          {scenarios.map((scenario) => (
            <TabsContent value={scenario.key} key={scenario.key}>
              <ScenarioPatientList rows={scenario.rows} scenarioKey={scenario.key} onOpen={onOpen} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ScenarioPatientList({ rows, scenarioKey, onOpen }: { rows: PatientJourneyRecord[]; scenarioKey: string; onOpen: (patient: PatientJourneyRecord) => void }) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / patientPageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * patientPageSize, currentPage * patientPageSize);

  React.useEffect(() => {
    setPage(1);
  }, [rows.length, scenarioKey]);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {pageRows.map((patient) => <PatientJourneyCard key={`${scenarioKey}-${patient.id}`} patient={patient} onOpen={onOpen} />)}
      </div>
      {!rows.length ? <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No patients in this scenario for the current filter.</div> : null}
      <PaginationBar page={currentPage} totalPages={totalPages} total={rows.length} onPageChange={setPage} />
    </div>
  );
}

function SmartInsightPanel({ patients }: { patients: PatientJourneyRecord[] }) {
  const longest = [...patients].sort((a, b) => b.waitingMinutes - a.waitingMinutes).slice(0, 4);
  const topBlockers = patients.filter((patient) => patient.blocker).slice(0, 4);
  const critical = patients.filter((patient) => patient.priority === "Critical" || patient.status === "Critical").length;
  const delayed = patients.filter((patient) => patient.status === "Delayed").length;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Smart insights</CardTitle>
          <CardDescription>Operational hints from the current dashboard filter.</CardDescription>
        </div>
        <Badge tone={critical ? "critical" : delayed ? "warning" : "success"}>{critical ? `${critical} critical` : `${delayed} delayed`}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-xs font-medium uppercase text-muted-foreground">Recommended action</div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {critical ? "Clear critical emergency and diagnostic blockers first." : delayed ? "Escalate delayed department owners before queue pressure rises." : "Current filtered flow is stable."}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">Longest waiting</div>
          {longest.map((patient) => (
            <div className="rounded-md border border-border bg-background p-2 text-xs" key={`wait-${patient.id}`}>
              <div className="font-semibold text-foreground">{patient.patientName}</div>
              <div className="mt-1 text-muted-foreground">{patient.stage} | {waitLabel(patient.waitingMinutes)} | {patient.department}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">Top blockers</div>
          {topBlockers.length ? topBlockers.map((patient) => (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning" key={`blocker-${patient.id}`}>
              <div className="font-semibold">{patient.patientName}</div>
              <div className="mt-1">{patient.blocker}</div>
            </div>
          )) : <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground">No blockers in current filter.</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function PatientReviewGrid({ patients, onOpen }: { patients: PatientJourneyRecord[]; onOpen: (patient: PatientJourneyRecord) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {patients.map((patient) => <PatientJourneyCard key={patient.id} patient={patient} onOpen={onOpen} />)}
    </div>
  );
}

function QuickActions() {
  const actions = [
    ["Register OPD", "/patients/register"],
    ["Emergency desk", "/patient-journey/emergency-desk"],
    ["Call queue", "/patient-journey/queue"],
    ["Discharge tracker", "/patient-journey/discharge-tracker"],
    ["Bottlenecks", "/patient-journey/bottlenecks"],
    ["Settings", "/patient-journey/settings"],
  ] as const;
  return (
    <Card>
      <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map(([label, route]) => <Button key={route} variant="outline" asChild><Link href={route}>{label}</Link></Button>)}
      </CardContent>
    </Card>
  );
}

export function LiveBoardPage() {
  const { query, setQuery, visitType, setVisitType, stage, setStage, priority, setPriority, department, setDepartment, status, setStatus, departments, patients } = usePatientJourneyFilters();
  const [selected, setSelected] = React.useState<PatientJourneyRecord | null>(null);
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow="Patient Journey / Live Board" title="Live Patient Flow Board" description="Kanban-style journey board where every patient has a current stage, timer, blocker, and next action." actions={<Button variant="outline" asChild><Link href="/patient-journey">Dashboard</Link></Button>} />
        <JourneyFilters query={query} setQuery={setQuery} visitType={visitType} setVisitType={setVisitType} stage={stage} setStage={setStage} priority={priority} setPriority={setPriority} department={department} setDepartment={setDepartment} status={status} setStatus={setStatus} departments={departments} />
        <div className="overflow-x-auto pb-3">
          <div className="flex min-h-[520px] gap-3">
            {journeyStages.map((boardStage) => <JourneyStageColumn key={boardStage} stage={boardStage} patients={patients.filter((patient) => patient.stage === boardStage)} onOpen={setSelected} />)}
          </div>
        </div>
        <Patient360Drawer patient={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
      </div>
    </ProtectedPatientJourney>
  );
}

function JourneyFilters({
  query,
  setQuery,
  visitType,
  setVisitType,
  stage,
  setStage,
  priority = "All priority",
  setPriority,
  department = "All departments",
  setDepartment,
  status = "All status",
  setStatus,
  departments = [],
  framed = true,
}: {
  query: string;
  setQuery: (value: string) => void;
  visitType: string;
  setVisitType: (value: string) => void;
  stage: string;
  setStage: (value: string) => void;
  priority?: string;
  setPriority?: (value: string) => void;
  department?: string;
  setDepartment?: (value: string) => void;
  status?: string;
  setStatus?: (value: string) => void;
  departments?: string[];
  framed?: boolean;
}) {
  const content = (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_150px_180px_160px_180px_150px]">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search UHID, patient, token, doctor, department, bill..." />
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={visitType} onChange={(event) => setVisitType(event.target.value)}>
          {["All visits", "OPD", "IPD", "Emergency", "Follow-up"].map((option) => <option key={option}>{option}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={stage} onChange={(event) => setStage(event.target.value)}>
          {["All stages", ...journeyStages].map((option) => <option key={option}>{option}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={(event) => setPriority?.(event.target.value)}>
          {["All priority", "Normal", "Urgent", "Critical", "VIP", "Senior Citizen", "Pediatric", "Pregnancy", "Disabled"].map((option) => <option key={option}>{option}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={department} onChange={(event) => setDepartment?.(event.target.value)}>
          {["All departments", ...departments].map((option) => <option key={option}>{option}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(event) => setStatus?.(event.target.value)}>
          {["All status", "Normal", "Approaching delay", "Delayed", "Critical"].map((option) => <option key={option}>{option}</option>)}
        </select>
    </div>
  );
  if (!framed) return content;
  return (
    <Card>
      <CardContent className="p-3">{content}</CardContent>
    </Card>
  );
}

function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
  itemLabel = "patients",
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}) {
  const start = total ? (page - 1) * patientPageSize + 1 : 0;
  const end = Math.min(page * patientPageSize, total);
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {start}-{end} of {total} {itemLabel} | 10 per page
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Badge tone="muted">Page {page} of {totalPages}</Badge>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function QueueManagementPage() {
  const [selected, setSelected] = React.useState<PatientJourneyRecord | null>(null);
  const queuePatients = mockJourneyPatients.filter((patient) => ["Registered", "Waiting Doctor", "In Consultation"].includes(patient.stage));
  const { query, setQuery, visitType, setVisitType, stage, setStage, priority, setPriority, department, setDepartment, status, setStatus, departments, patients, pagePatients, page, totalPages, setPage } = usePatientJourneyFilters(queuePatients);
  const columns = React.useMemo<ColumnDef<PatientJourneyRecord>[]>(() => [
    { accessorKey: "token", header: "Token", cell: ({ row }) => <Badge tone="info">{row.original.token}</Badge> },
    { accessorKey: "patientName", header: "Patient", cell: ({ row }) => <button className="text-left font-medium text-primary" onClick={() => setSelected(row.original)}>{row.original.patientName}<div className="text-xs text-muted-foreground">{row.original.uhid} | {row.original.ageGender}</div></button> },
    { accessorKey: "doctor", header: "Doctor" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "stage", header: "Stage", cell: ({ row }) => <StatusPill tone={journeyTone(row.original.stage)}>{row.original.stage}</StatusPill> },
    { accessorKey: "waitingMinutes", header: "Waiting", cell: ({ row }) => waitLabel(row.original.waitingMinutes) },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <Badge tone={journeyTone(row.original.status)}>{row.original.priority}</Badge> },
    { id: "actions", header: "Action", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => toast.success(`${row.original.token} called`)}>Call</Button> },
  ], []);
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow="Patient Journey / Queue" title="Queue and Token Management" description="Doctor-wise, department-wise, priority, follow-up, emergency, no-show, call, recall, hold, skip, and transfer controls." actions={<Button variant="outline" onClick={() => toast.info("TV display opened")}>TV Display Mode</Button>} />
        <JourneyFilters query={query} setQuery={setQuery} visitType={visitType} setVisitType={setVisitType} stage={stage} setStage={setStage} priority={priority} setPriority={setPriority} department={department} setDepartment={setDepartment} status={status} setStatus={setStatus} departments={departments} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Waiting" value={patients.filter((patient) => patient.stage === "Waiting Doctor").length} change="Queue" context="Doctor queue" tone="warning" icon={Clock3} />
          <StatCard label="In consultation" value={patients.filter((patient) => patient.stage === "In Consultation").length} change="Active" context="Current rooms" tone="info" icon={Stethoscope} />
          <StatCard label="Delayed" value={patients.filter((patient) => patient.status === "Delayed").length} change="Action" context="Threshold crossed" tone="danger" icon={AlertTriangle} />
          <StatCard label="Critical" value={patients.filter((patient) => patient.priority === "Critical").length} change="Emergency" context="Top queue" tone="critical" icon={Ambulance} />
        </div>
        <DataTable data={pagePatients} columns={columns} />
        <PaginationBar page={page} totalPages={totalPages} total={patients.length} onPageChange={setPage} />
        <TvDisplayPreview patients={patients} />
        <Patient360Drawer patient={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
      </div>
    </ProtectedPatientJourney>
  );
}

function TvDisplayPreview({ patients }: { patients: PatientJourneyRecord[] }) {
  const serving = patients[0];
  return (
    <Card>
      <CardHeader><CardTitle>Token TV preview</CardTitle><CardDescription>Public display avoids sensitive clinical details.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 bg-slate-950 text-white md:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="text-sm uppercase text-white/60">Now serving</div>
          <div className="mt-2 text-4xl font-bold">{serving?.token ?? "-"}</div>
          <div className="mt-2 text-white/70">Room 2 | {serving?.doctor ?? "Doctor"}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="text-sm uppercase text-white/60">Next tokens</div>
          <div className="mt-3 flex flex-wrap gap-2">{patients.slice(1, 5).map((patient) => <span className="rounded-md bg-white/10 px-3 py-2 text-xl font-semibold" key={patient.id}>{patient.token}</span>)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientJourneyPatientPage({ patientId }: { patientId: string }) {
  const patient = mockJourneyPatients.find((row) => row.id === patientId) ?? mockJourneyPatients[0];
  const events = mockJourneyEvents.filter((event) => event.visitId === patient.visitId);
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow="Patient Journey / Patient 360" title={patient.patientName} description={`${patient.uhid} | ${patient.visitId} | ${patient.department}`} actions={<><Button variant="outline" asChild><Link href="/patient-journey/live-board">Live Board</Link></Button><Button asChild><Link href={`/patient-journey/timeline/${patient.visitId}`}>Timeline</Link></Button></>} />
        <StageStepper currentStage={patient.stage} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Current status</CardTitle><StatusPill tone={journeyTone(patient.stage)}>{patient.stage}</StatusPill></CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                <DetailLine label="Location" value={patient.location} />
                <DetailLine label="Waiting time" value={waitLabel(patient.waitingMinutes)} />
                <DetailLine label="Next action" value={patient.nextAction} />
                <DetailLine label="Owner role" value={patient.ownerRole} />
              </CardContent>
            </Card>
            <JourneyTimeline events={events.length ? events : mockJourneyEvents.slice(0, 4)} />
          </div>
          <div className="space-y-4">
            <Snapshot title="Clinical Snapshot" rows={[["Complaint", patient.chiefComplaint], ["Vitals", patient.vitals], ["Allergy", patient.allergy]]} />
            <Snapshot title="Financial Snapshot" rows={[["Billing", patient.billingStatus], ["Insurance", patient.insuranceStatus], ["Discharge", patient.dischargeStatus]]} />
            <Snapshot title="Orders Snapshot" rows={[["Lab", patient.labStatus], ["Radiology", patient.radiologyStatus], ["Pharmacy", patient.pharmacyStatus]]} />
          </div>
        </div>
      </div>
    </ProtectedPatientJourney>
  );
}

export function PatientJourneyTimelinePage({ visitId }: { visitId: string }) {
  const patient = mockJourneyPatients.find((row) => row.visitId === visitId) ?? mockJourneyPatients[0];
  const events = mockJourneyEvents.filter((event) => event.visitId === patient.visitId);
  const durationRows: Array<[string, string]> = [
    ["Registration", "4m"],
    ["Queue waiting", waitLabel(patient.waitingMinutes)],
    ["Consultation", patient.stage === "In Consultation" ? "Active" : "18m"],
    ["Lab TAT", patient.labStatus],
    ["Radiology TAT", patient.radiologyStatus],
    ["Billing duration", patient.billingStatus],
    ["Pharmacy duration", patient.pharmacyStatus],
    ["Total hospital time", waitLabel(patient.totalMinutes)],
  ];
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow="Patient Journey / Timeline" title={`${patient.patientName} journey timeline`} description={`${patient.uhid} | ${patient.visitId} | Current stage: ${patient.stage}`} actions={<Button variant="outline" asChild><Link href={`/patient-journey/patient/${patient.id}`}>Patient 360</Link></Button>} />
        <StageStepper currentStage={patient.stage} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <JourneyTimeline events={events.length ? events : mockJourneyEvents} />
          <Snapshot title="Stage duration analysis" rows={durationRows} />
        </div>
      </div>
    </ProtectedPatientJourney>
  );
}

function RadiologyTrackerPage() {
  const [selectedOrder, setSelectedOrder] = React.useState<RadiologyJourneyOrder | null>(null);
  const { query, setQuery, modality, setModality, priority, setPriority, status, setStatus, source, setSource, delayedOnly, setDelayedOnly, orders, pageOrders, page, totalPages, setPage } = useRadiologyFilters();
  const delayedCount = orders.filter((order) => order.waitingMinutes >= 45 || Boolean(order.blocker)).length;
  const statCount = orders.filter((order) => order.priority === "STAT" || order.priority === "Critical").length;
  const reportingCount = orders.filter((order) => ["Reporting", "Approval Pending"].includes(order.status)).length;
  const readyCount = orders.filter((order) => order.status === "Ready").length;
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader
          eyebrow="Patient Journey / Radiology"
          title="Radiology Tracker"
          description="Manage 50 radiology orders by modality, priority, current status, source, TAT, blockers, reporting, approval, and readiness."
          actions={<><Button variant="outline" asChild><Link href="/patient-journey/live-board">Live Board</Link></Button><Button onClick={() => toast.success("Radiology view saved")}>Save View</Button></>}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total orders" value={orders.length} change="Filtered" context="Radiology queue" tone="info" icon={ScanSearch} />
          <StatCard label="STAT/Critical" value={statCount} change="Priority" context="Always on top" tone="critical" icon={AlertTriangle} />
          <StatCard label="Delayed" value={delayedCount} change="Escalate" context="TAT or blocker" tone="danger" icon={Clock3} />
          <StatCard label="Reporting" value={reportingCount} change="Draft/Approval" context="Radiologist desk" tone="warning" icon={FileCheck2} />
          <StatCard label="Ready" value={readyCount} change="Doctor review" context="Reports available" tone="success" icon={FileCheck2} />
        </div>

        <RadiologyFilters
          query={query}
          onQuery={setQuery}
          modality={modality}
          onModality={setModality}
          priority={priority}
          onPriority={setPriority}
          status={status}
          onStatus={setStatus}
          source={source}
          onSource={setSource}
          delayedOnly={delayedOnly}
          onDelayedOnly={setDelayedOnly}
        />

        <RadiologyBoard orders={orders} onOpen={setSelectedOrder} />
        <RadiologyOrderTable orders={pageOrders} onOpen={setSelectedOrder} />
        <PaginationBar page={page} totalPages={totalPages} total={orders.length} onPageChange={setPage} itemLabel="orders" />
        <RadiologyOrderDrawer order={selectedOrder} open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)} />
      </div>
    </ProtectedPatientJourney>
  );
}

function RadiologyFilters({
  query,
  onQuery,
  modality,
  onModality,
  priority,
  onPriority,
  status,
  onStatus,
  source,
  onSource,
  delayedOnly,
  onDelayedOnly,
}: {
  query: string;
  onQuery: (value: string) => void;
  modality: "All modalities" | RadiologyModality;
  onModality: (value: "All modalities" | RadiologyModality) => void;
  priority: "All priority" | RadiologyPriority;
  onPriority: (value: "All priority" | RadiologyPriority) => void;
  status: "All status" | RadiologyOrderStatus;
  onStatus: (value: "All status" | RadiologyOrderStatus) => void;
  source: "All sources" | RadiologySource;
  onSource: (value: "All sources" | RadiologySource) => void;
  delayedOnly: boolean;
  onDelayedOnly: (value: boolean) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_150px_140px_170px_130px_150px]">
        <Input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search order, UHID, patient, token, study, doctor, radiologist..." />
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={modality} onChange={(event) => onModality(event.target.value as typeof modality)}>
          {["All modalities", "X-Ray", "CT", "MRI", "USG", "PET", "Mammography"].map((option) => <option key={option}>{option}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={(event) => onPriority(event.target.value as typeof priority)}>
          {["All priority", "Routine", "Urgent", "STAT", "Critical"].map((option) => <option key={option}>{option}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(event) => onStatus(event.target.value as typeof status)}>
          {["All status", ...radiologyBoardColumns].map((option) => <option key={option}>{option}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={source} onChange={(event) => onSource(event.target.value as typeof source)}>
          {["All sources", "OPD", "IPD", "Emergency"].map((option) => <option key={option}>{option}</option>)}
        </select>
        <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
          <input type="checkbox" checked={delayedOnly} onChange={(event) => onDelayedOnly(event.target.checked)} />
          Delayed only
        </label>
      </CardContent>
    </Card>
  );
}

function RadiologyBoard({ orders, onOpen }: { orders: RadiologyJourneyOrder[]; onOpen: (order: RadiologyJourneyOrder) => void }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3">
        {radiologyBoardColumns.map((column) => {
          const columnOrders = orders.filter((order) => order.status === column);
          const averageWait = columnOrders.length ? Math.round(columnOrders.reduce((sum, order) => sum + order.waitingMinutes, 0) / columnOrders.length) : 0;
          return (
            <section className="flex h-[560px] w-[360px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm" key={column}>
              <div className="border-b border-border bg-surface-muted/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{column}</CardTitle>
                  <Badge tone={columnOrders.some((order) => order.priority === "Critical") ? "critical" : columnOrders.length ? "info" : "muted"}>{columnOrders.length}</Badge>
                </div>
                <CardDescription>{averageWait ? `${averageWait}m average wait` : "No order in this status"}</CardDescription>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-background/40 p-4">
                {columnOrders.slice(0, patientPageSize).map((order) => <RadiologyOrderCard key={order.id} order={order} onOpen={onOpen} />)}
                {!columnOrders.length ? <div className="rounded-md border border-dashed border-border bg-surface p-6 text-center text-xs text-muted-foreground">No orders.</div> : null}
                {columnOrders.length > patientPageSize ? <div className="rounded-md border border-dashed border-border bg-surface p-3 text-center text-xs text-muted-foreground">Showing first 10. Use Order Worklist pagination for all {columnOrders.length} orders.</div> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function RadiologyOrderCard({ order, onOpen }: { order: RadiologyJourneyOrder; onOpen: (order: RadiologyJourneyOrder) => void }) {
  return (
    <button type="button" onClick={() => onOpen(order)} className="w-full rounded-lg border border-border bg-background p-4 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-muted hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{order.token} | {order.patientName}</div>
          <div className="mt-1 text-muted-foreground">{order.modality} | {order.study}</div>
        </div>
        <Badge tone={radiologyPriorityTone(order.priority)}>{order.priority}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusPill tone={radiologyStatusTone(order.status)}>{order.status}</StatusPill>
        <Badge tone={order.waitingMinutes >= 45 ? "warning" : "muted"}>{waitLabel(order.waitingMinutes)}</Badge>
      </div>
      {order.blocker ? <div className="mt-2 text-warning">{order.blocker}</div> : null}
    </button>
  );
}

function RadiologyOrderTable({ orders, onOpen }: { orders: RadiologyJourneyOrder[]; onOpen: (order: RadiologyJourneyOrder) => void }) {
  const columns = React.useMemo<ColumnDef<RadiologyJourneyOrder>[]>(() => [
    { accessorKey: "orderNo", header: "Order No", cell: ({ row }) => <button className="text-left font-medium text-primary" onClick={() => onOpen(row.original)}>{row.original.orderNo}<div className="text-xs text-muted-foreground">{row.original.token}</div></button> },
    { accessorKey: "patientName", header: "Patient", cell: ({ row }) => <div className="font-medium">{row.original.patientName}<div className="text-xs text-muted-foreground">{row.original.uhid} | {row.original.ageGender}</div></div> },
    { accessorKey: "modality", header: "Modality", cell: ({ row }) => <Badge tone="info">{row.original.modality}</Badge> },
    { accessorKey: "study", header: "Study" },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <Badge tone={radiologyPriorityTone(row.original.priority)}>{row.original.priority}</Badge> },
    { accessorKey: "source", header: "Source" },
    { accessorKey: "scheduledAt", header: "Scheduled" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill tone={radiologyStatusTone(row.original.status)}>{row.original.status}</StatusPill> },
    { accessorKey: "waitingMinutes", header: "TAT", cell: ({ row }) => <span>{waitLabel(row.original.waitingMinutes)} / {waitLabel(row.original.tatMinutes)}</span> },
    { accessorKey: "assignedRadiologist", header: "Radiologist" },
    { id: "action", header: "Action", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => toast.success(row.original.nextAction)}>{row.original.status === "Ready" ? "Notify" : "Update"}</Button> },
  ], [onOpen]);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Radiology order worklist</CardTitle>
          <CardDescription>10 orders per page. STAT, critical, and blocked orders are sorted to the top.</CardDescription>
        </div>
        <Badge tone="info">{orders.length} visible</Badge>
      </CardHeader>
      <CardContent>
        <DataTable data={orders} columns={columns} />
      </CardContent>
    </Card>
  );
}

function RadiologyOrderDrawer({ order, open, onOpenChange }: { order: RadiologyJourneyOrder | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <PatientJourneyCenterWindow
      open={open}
      onOpenChange={onOpenChange}
      title={order?.orderNo ?? "Radiology order"}
      description={order ? `${order.patientName} | ${order.uhid} | ${order.modality}` : "Radiology order details"}
      footer={order ? <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => toast.info("Delay escalated")}>Escalate</Button><Button onClick={() => toast.success(order.nextAction)}>{order.status === "Ready" ? "Notify Doctor" : "Update Status"}</Button></div> : null}
    >
      {order ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">{order.modality}</Badge>
              <Badge tone={radiologyPriorityTone(order.priority)}>{order.priority}</Badge>
              <StatusPill tone={radiologyStatusTone(order.status)}>{order.status}</StatusPill>
            </div>
            <div className="mt-3 grid gap-2">
              <DetailLine label="Study" value={order.study} />
              <DetailLine label="Source" value={`${order.source} | ${order.department}`} />
              <DetailLine label="Doctor" value={order.doctor} />
              <DetailLine label="Room" value={order.room} />
              <DetailLine label="Scheduled" value={order.scheduledAt} />
              <DetailLine label="Waiting / TAT" value={`${waitLabel(order.waitingMinutes)} / ${waitLabel(order.tatMinutes)}`} />
            </div>
          </div>
          <Snapshot title="Operational status" rows={[["Billing", order.billingStatus], ["Safety checklist", order.safetyStatus], ["Report", order.reportStatus], ["Radiologist", order.assignedRadiologist]]} />
          <Snapshot title="Next action" rows={[["Action", order.nextAction], ["Blocker", order.blocker ?? "No blocker"]]} />
        </div>
      ) : null}
    </PatientJourneyCenterWindow>
  );
}

function servicePriorityTone(priority: SplitWorkflowPriority) {
  if (priority === "Critical") return "critical";
  if (priority === "STAT") return "danger";
  if (priority === "Urgent") return "warning";
  return "muted";
}

function serviceSearchText(row: ServiceToken | ServiceWorkOrder) {
  return Object.values(row).join(" ").toLowerCase();
}

function SplitWorkflowTrackerPage({ workflowKey }: { workflowKey: SplitWorkflowKey }) {
  const config = splitWorkflowConfigs[workflowKey];
  const [query, setQuery] = React.useState("");
  const [priority, setPriority] = React.useState<"All priority" | SplitWorkflowPriority>("All priority");
  const [status, setStatus] = React.useState("All status");
  const [category, setCategory] = React.useState("All categories");
  const [delayedOnly, setDelayedOnly] = React.useState(false);
  const [tokenPage, setTokenPage] = React.useState(1);
  const [orderPage, setOrderPage] = React.useState(1);
  const [selectedToken, setSelectedToken] = React.useState<ServiceToken | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<ServiceWorkOrder | null>(null);
  const tokens = React.useMemo(() => getSplitWorkflowTokens(workflowKey), [workflowKey]);
  const orders = React.useMemo(() => getSplitWorkflowOrders(workflowKey), [workflowKey]);

  const filteredTokens = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tokens.filter((token) => {
      const matchesQuery = !normalized || serviceSearchText(token).includes(normalized);
      const matchesPriority = priority === "All priority" || token.priority === priority;
      const matchesDelay = !delayedOnly || token.waitingMinutes >= 45 || Boolean(token.blocker);
      return matchesQuery && matchesPriority && matchesDelay;
    });
  }, [delayedOnly, priority, query, tokens]);

  const filteredOrders = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders
      .filter((order) => {
        const matchesQuery = !normalized || serviceSearchText(order).includes(normalized);
        const matchesPriority = priority === "All priority" || order.priority === priority;
        const matchesStatus = status === "All status" || order.status === status;
        const matchesCategory = category === "All categories" || order.category === category;
        const matchesDelay = !delayedOnly || order.waitingMinutes >= 45 || Boolean(order.blocker);
        return matchesQuery && matchesPriority && matchesStatus && matchesCategory && matchesDelay;
      })
      .sort((a, b) => {
        const rank = (order: ServiceWorkOrder) => (order.priority === "Critical" ? 0 : order.priority === "STAT" ? 1 : order.blocker ? 2 : order.priority === "Urgent" ? 3 : 4);
        return rank(a) - rank(b) || b.waitingMinutes - a.waitingMinutes;
      });
  }, [category, delayedOnly, orders, priority, query, status]);

  const pagedTokens = filteredTokens.slice((tokenPage - 1) * patientPageSize, tokenPage * patientPageSize);
  const pagedOrders = filteredOrders.slice((orderPage - 1) * patientPageSize, orderPage * patientPageSize);
  const tokenPages = Math.max(1, Math.ceil(filteredTokens.length / patientPageSize));
  const orderPages = Math.max(1, Math.ceil(filteredOrders.length / patientPageSize));
  const blockedCount = filteredOrders.filter((order) => order.blocker).length + filteredTokens.filter((token) => token.blocker).length;
  const criticalCount = filteredOrders.filter((order) => order.priority === "Critical").length + filteredTokens.filter((token) => token.priority === "Critical").length;

  const resetFilters = () => {
    setTokenPage(1);
    setOrderPage(1);
  };

  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          actions={<><Button variant="outline" asChild><Link href="/patient-journey/live-board">Live Board</Link></Button><Button onClick={() => toast.success(`${config.title} view saved`)}>Save View</Button></>}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Queue" value={config.showTokens ? filteredTokens.length : 0} change={config.showTokens ? "Active" : "Hidden"} context={config.tokenTitle} tone="info" icon={UserRound} />
          <StatCard label="Orders / Tasks" value={filteredOrders.length} change="Worklist" context={config.orderTitle} tone="info" icon={FileCheck2} />
          <StatCard label="Critical" value={criticalCount} change="Priority" context="Top of queue" tone="critical" icon={AlertTriangle} />
          <StatCard label="Blocked" value={blockedCount} change="Escalate" context="SLA or dependency" tone="danger" icon={Clock3} />
          <StatCard label="Ready/Complete" value={filteredOrders.filter((order) => order.status === config.boardColumns[config.boardColumns.length - 1]).length} change="Done" context="Last stage" tone="success" icon={FileCheck2} />
        </div>

        <Card>
          <CardContent className="grid gap-3 p-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_150px_190px_190px_150px]">
            <Input value={query} onChange={(event) => { setQuery(event.target.value); resetFilters(); }} placeholder="Search patient, UHID, token, order, category, owner, blocker..." />
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={(event) => { setPriority(event.target.value as typeof priority); resetFilters(); }}>
              {["All priority", "Routine", "Urgent", "STAT", "Critical"].map((option) => <option key={option}>{option}</option>)}
            </select>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(event) => { setStatus(event.target.value); resetFilters(); }}>
              {["All status", ...config.boardColumns].map((option) => <option key={option}>{option}</option>)}
            </select>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(event) => { setCategory(event.target.value); resetFilters(); }}>
              {["All categories", ...config.categories].map((option) => <option key={option}>{option}</option>)}
            </select>
            <label className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
              <input type="checkbox" checked={delayedOnly} onChange={(event) => { setDelayedOnly(event.target.checked); resetFilters(); }} />
              Delayed only
            </label>
          </CardContent>
        </Card>

        <Tabs defaultValue={config.showTokens ? "tokens" : "orders"} className="space-y-4">
          <TabsList>
            {config.showTokens ? <TabsTrigger value="tokens">Queue</TabsTrigger> : null}
            <TabsTrigger value="orders">Order Worklist</TabsTrigger>
            <TabsTrigger value="board">Board View</TabsTrigger>
            <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
          </TabsList>
          {config.showTokens ? (
            <TabsContent value="tokens" className="space-y-3">
              <ServiceTokenTable tokens={pagedTokens} orders={orders} onOpen={setSelectedToken} />
              <PaginationBar page={Math.min(tokenPage, tokenPages)} totalPages={tokenPages} total={filteredTokens.length} onPageChange={setTokenPage} itemLabel="tokens" />
            </TabsContent>
          ) : null}
          <TabsContent value="orders" className="space-y-3">
            <ServiceOrderTable orders={pagedOrders} onOpen={setSelectedOrder} />
            <PaginationBar page={Math.min(orderPage, orderPages)} totalPages={orderPages} total={filteredOrders.length} onPageChange={setOrderPage} itemLabel="orders" />
          </TabsContent>
          <TabsContent value="board">
            <ServiceOrderBoard columns={config.boardColumns} orders={filteredOrders} onOpen={setSelectedOrder} />
          </TabsContent>
          <TabsContent value="alerts">
            <ServiceAlerts orders={filteredOrders} tokens={filteredTokens} onOpenOrder={setSelectedOrder} onOpenToken={setSelectedToken} />
          </TabsContent>
        </Tabs>
        <ServiceTokenDrawer token={selectedToken} orders={orders.filter((order) => selectedToken?.linkedOrderIds.includes(order.id))} open={Boolean(selectedToken)} onOpenChange={(open) => !open && setSelectedToken(null)} />
        <ServiceOrderDrawer order={selectedOrder} token={tokens.find((token) => token.id === selectedOrder?.tokenId)} open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)} />
      </div>
    </ProtectedPatientJourney>
  );
}

function ServiceTokenTable({ tokens, orders, onOpen }: { tokens: ServiceToken[]; orders: ServiceWorkOrder[]; onOpen: (token: ServiceToken) => void }) {
  const columns = React.useMemo<ColumnDef<ServiceToken>[]>(() => [
    { accessorKey: "tokenNo", header: "Token", cell: ({ row }) => <button className="font-medium text-primary" onClick={() => onOpen(row.original)}>{row.original.tokenNo}</button> },
    { accessorKey: "patientName", header: "Patient", cell: ({ row }) => <div className="font-medium">{row.original.patientName}<div className="text-xs text-muted-foreground">{row.original.uhid} | {row.original.ageGender}</div></div> },
    { accessorKey: "source", header: "Source" },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <Badge tone={servicePriorityTone(row.original.priority)}>{row.original.priority}</Badge> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill tone={journeyTone(row.original.status)}>{row.original.status}</StatusPill> },
    { accessorKey: "waitingMinutes", header: "Waiting", cell: ({ row }) => waitLabel(row.original.waitingMinutes) },
    { id: "orders", header: "Linked Orders", cell: ({ row }) => orders.filter((order) => row.original.linkedOrderIds.includes(order.id)).length },
    { id: "action", header: "Action", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => toast.success(row.original.nextAction)}>{row.original.nextAction}</Button> },
  ], [onOpen, orders]);
  return <DataTable data={tokens} columns={columns} />;
}

function ServiceOrderTable({ orders, onOpen }: { orders: ServiceWorkOrder[]; onOpen: (order: ServiceWorkOrder) => void }) {
  const columns = React.useMemo<ColumnDef<ServiceWorkOrder>[]>(() => [
    { accessorKey: "orderNo", header: "Order", cell: ({ row }) => <button className="text-left font-medium text-primary" onClick={() => onOpen(row.original)}>{row.original.orderNo}</button> },
    { accessorKey: "patientName", header: "Patient", cell: ({ row }) => <div className="font-medium">{row.original.patientName}<div className="text-xs text-muted-foreground">{row.original.uhid}</div></div> },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "item", header: "Item" },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <Badge tone={servicePriorityTone(row.original.priority)}>{row.original.priority}</Badge> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill tone={journeyTone(row.original.status)}>{row.original.status}</StatusPill> },
    { accessorKey: "waitingMinutes", header: "TAT", cell: ({ row }) => `${waitLabel(row.original.waitingMinutes)} / ${waitLabel(row.original.tatMinutes)}` },
    { accessorKey: "owner", header: "Owner" },
    { id: "action", header: "Action", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => toast.success(row.original.nextAction)}>Update</Button> },
  ], [onOpen]);
  return <DataTable data={orders} columns={columns} />;
}

function ServiceOrderBoard({ columns, orders, onOpen }: { columns: string[]; orders: ServiceWorkOrder[]; onOpen: (order: ServiceWorkOrder) => void }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3">
        {columns.map((column) => {
          const columnOrders = orders.filter((order) => order.status === column);
          return (
            <section className="flex h-[560px] w-[360px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm" key={column}>
              <div className="border-b border-border bg-surface-muted/70 p-4">
                <div className="flex items-center justify-between gap-2"><CardTitle className="text-base">{column}</CardTitle><Badge tone={columnOrders.some((order) => order.priority === "Critical") ? "critical" : columnOrders.length ? "info" : "muted"}>{columnOrders.length}</Badge></div>
                <CardDescription>{columnOrders.length ? `${Math.round(columnOrders.reduce((sum, order) => sum + order.waitingMinutes, 0) / columnOrders.length)}m average wait` : "No items"}</CardDescription>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-background/40 p-4">
                {columnOrders.slice(0, patientPageSize).map((order) => (
                  <button type="button" onClick={() => onOpen(order)} className="w-full rounded-lg border border-border bg-background p-4 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-muted hover:shadow-md" key={order.id}>
                    <div className="text-sm font-semibold text-foreground">{order.orderNo}</div>
                    <div className="mt-1 text-muted-foreground">{order.patientName} | {order.category}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone={servicePriorityTone(order.priority)}>{order.priority}</Badge><Badge tone={order.waitingMinutes >= 45 ? "warning" : "muted"}>{waitLabel(order.waitingMinutes)}</Badge></div>
                    {order.blocker ? <div className="mt-2 text-warning">{order.blocker}</div> : null}
                  </button>
                ))}
                {columnOrders.length > patientPageSize ? <div className="rounded-md border border-dashed border-border bg-surface p-3 text-center text-xs text-muted-foreground">Showing first 10. Use Order Worklist pagination for all {columnOrders.length} items.</div> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ServiceAlerts({ orders, tokens, onOpenOrder, onOpenToken }: { orders: ServiceWorkOrder[]; tokens: ServiceToken[]; onOpenOrder: (order: ServiceWorkOrder) => void; onOpenToken: (token: ServiceToken) => void }) {
  const [page, setPage] = React.useState(1);
  const alertRows = [
    ...tokens.filter((token) => token.priority === "Critical" || token.blocker).map((token) => ({ kind: "token" as const, item: token })),
    ...orders.filter((order) => order.priority === "Critical" || order.blocker).map((order) => ({ kind: "order" as const, item: order })),
  ];
  const totalPages = Math.max(1, Math.ceil(alertRows.length / patientPageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = alertRows.slice((currentPage - 1) * patientPageSize, currentPage * patientPageSize);

  React.useEffect(() => {
    setPage(1);
  }, [orders.length, tokens.length]);

  return (
    <Card>
      <CardHeader><CardTitle>Critical and blocked queue</CardTitle><CardDescription>Immediate attention items across token queue and work orders.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 xl:grid-cols-2">
          {pageRows.map((row) => row.kind === "token"
            ? <button className="rounded-lg border border-border bg-background p-3 text-left" key={row.item.id} onClick={() => onOpenToken(row.item)}><Badge tone={servicePriorityTone(row.item.priority)}>{row.item.priority}</Badge><div className="mt-2 font-semibold">{row.item.tokenNo} | {row.item.patientName}</div><div className="mt-1 text-xs text-muted-foreground">{row.item.blocker ?? row.item.nextAction}</div></button>
            : <button className="rounded-lg border border-border bg-background p-3 text-left" key={row.item.id} onClick={() => onOpenOrder(row.item)}><Badge tone={servicePriorityTone(row.item.priority)}>{row.item.priority}</Badge><div className="mt-2 font-semibold">{row.item.orderNo} | {row.item.patientName}</div><div className="mt-1 text-xs text-muted-foreground">{row.item.blocker ?? row.item.nextAction}</div></button>
          )}
        </div>
        <PaginationBar page={currentPage} totalPages={totalPages} total={alertRows.length} onPageChange={setPage} itemLabel="alerts" />
      </CardContent>
    </Card>
  );
}

function ServiceTokenDrawer({ token, orders, open, onOpenChange }: { token: ServiceToken | null; orders: ServiceWorkOrder[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <PatientJourneyCenterWindow open={open} onOpenChange={onOpenChange} title={token?.tokenNo ?? "Token"} description={token ? `${token.patientName} | ${token.uhid}` : undefined}>
      {token ? <div className="space-y-4"><Snapshot title="Token context" rows={[["Patient", token.patientName], ["Source", token.source], ["Priority", token.priority], ["Status", token.status], ["Waiting", waitLabel(token.waitingMinutes)], ["Next action", token.nextAction]]} /><ServiceOrderTable orders={orders} onOpen={() => undefined} /></div> : null}
    </PatientJourneyCenterWindow>
  );
}

function ServiceOrderDrawer({ order, token, open, onOpenChange }: { order: ServiceWorkOrder | null; token?: ServiceToken; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <PatientJourneyCenterWindow open={open} onOpenChange={onOpenChange} title={order?.orderNo ?? "Order"} description={order ? `${order.patientName} | ${order.uhid}` : undefined} footer={order ? <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => toast.info("Supervisor escalation queued")}>Escalate</Button><Button onClick={() => toast.success(order.nextAction)}>Update</Button></div> : null}>
      {order ? <div className="space-y-4"><Snapshot title="Order context" rows={[["Item", order.item], ["Category", order.category], ["Priority", order.priority], ["Status", order.status], ["Owner", order.owner], ["TAT", `${waitLabel(order.waitingMinutes)} / ${waitLabel(order.tatMinutes)}`], ["Billing", order.billingStatus], ["Safety", order.safetyStatus ?? "Not required"], ["Next action", order.nextAction], ["Blocker", order.blocker ?? "No blocker"]]} />{token ? <Snapshot title="Linked token" rows={[["Token", token.tokenNo], ["Token status", token.status], ["Location", token.location], ["Waiting", waitLabel(token.waitingMinutes)]]} /> : null}</div> : null}
    </PatientJourneyCenterWindow>
  );
}

export function TrackerPage({ trackerKey }: { trackerKey: TrackerKey }) {
  if (["emergency", "ipd", "icu", "lab", "pharmacy", "billing", "insurance", "discharge", "ot", "followup"].includes(trackerKey)) return <SplitWorkflowTrackerPage workflowKey={trackerKey as SplitWorkflowKey} />;
  if (trackerKey === "radiology") return <RadiologyTrackerPage />;

  const tracker = trackerBoards.find((board) => board.key === trackerKey) ?? trackerBoards[0];
  const Icon = trackerIconMap[tracker.key];
  const relevantPatients = React.useMemo(() => mockJourneyPatients.filter((patient) => {
    if (tracker.key === "emergency") return patient.visitType === "Emergency";
    if (tracker.key === "lab") return patient.stage === "Lab Pending" || patient.labStatus !== "Not ordered";
    if (tracker.key === "radiology") return patient.stage === "Radiology Pending" || patient.radiologyStatus !== "Not ordered";
    if (tracker.key === "pharmacy") return patient.stage === "Pharmacy Pending" || patient.pharmacyStatus !== "Not started";
    if (tracker.key === "billing" || tracker.key === "insurance") return patient.stage === "Billing Pending" || patient.billingStatus !== "Paid" || patient.insuranceStatus !== "Not required";
    if (tracker.key === "discharge") return patient.stage === "Discharge Pending" || patient.dischargeStatus !== "Not applicable";
    if (tracker.key === "ipd" || tracker.key === "icu") return patient.visitType === "IPD" || patient.stage === "Admission Suggested";
    return patient.visitType === "Follow-up" || patient.stage === "Completed";
  }), [tracker.key]);
  const { query, setQuery, visitType, setVisitType, stage, setStage, priority, setPriority, department, setDepartment, status, setStatus, departments, patients, pagePatients, page, totalPages, setPage } = usePatientJourneyFilters(relevantPatients);
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow={tracker.eyebrow} title={tracker.title} description={tracker.description} actions={<><Button variant="outline" asChild><Link href="/patient-journey/live-board">Live Board</Link></Button><Button onClick={() => toast.success(`${tracker.title} action saved`)}>Save View</Button></>} />
        <JourneyFilters query={query} setQuery={setQuery} visitType={visitType} setVisitType={setVisitType} stage={stage} setStage={setStage} priority={priority} setPriority={setPriority} department={department} setDepartment={setDepartment} status={status} setStatus={setStatus} departments={departments} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active rows" value={patients.length} change="Filtered" context="Tracker queue" tone="info" icon={Icon} />
          <StatCard label="Delayed" value={patients.filter((patient) => patient.status === "Delayed").length} change="Resolve" context="Over threshold" tone="danger" icon={AlertTriangle} />
          <StatCard label="Critical" value={patients.filter((patient) => patient.status === "Critical").length} change="Safety" context="Immediate response" tone="critical" icon={Ambulance} />
          <StatCard label="Owners" value={tracker.ownerRoles.length} change="Roles" context={tracker.ownerRoles.join(", ")} tone="muted" icon={UserRound} />
        </div>
        <TrackerColumns trackerColumns={tracker.columns} patients={pagePatients} />
        <TrackerWorklist patients={pagePatients} />
        <PaginationBar page={page} totalPages={totalPages} total={patients.length} onPageChange={setPage} />
      </div>
    </ProtectedPatientJourney>
  );
}

function TrackerColumns({ trackerColumns, patients }: { trackerColumns: string[]; patients: PatientJourneyRecord[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3">
        {trackerColumns.map((column, index) => (
          <Card className="min-h-[220px] w-[260px] shrink-0" key={column}>
            <CardHeader><CardTitle>{column}</CardTitle><Badge tone="info">{index === 0 ? patients.length : Math.max(0, patients.length - index)}</Badge></CardHeader>
            <CardContent className="space-y-2">
              {patients.slice(0, Math.max(1, patients.length - index)).map((patient) => (
                <div className="rounded-md border border-border bg-background p-2 text-xs" key={`${column}-${patient.id}`}>
                  <div className="font-semibold text-foreground">{patient.token} | {patient.patientName}</div>
                  <div className="mt-1 text-muted-foreground">{patient.nextAction}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TrackerWorklist({ patients }: { patients: PatientJourneyRecord[] }) {
  const columns = React.useMemo<ColumnDef<PatientJourneyRecord>[]>(() => [
    { accessorKey: "token", header: "Token" },
    { accessorKey: "patientName", header: "Patient" },
    { accessorKey: "stage", header: "Stage", cell: ({ row }) => <StatusPill tone={journeyTone(row.original.stage)}>{row.original.stage}</StatusPill> },
    { accessorKey: "waitingMinutes", header: "Timer", cell: ({ row }) => waitLabel(row.original.waitingMinutes) },
    { accessorKey: "blocker", header: "Blocker", cell: ({ row }) => row.original.blocker ?? "-" },
    { accessorKey: "nextAction", header: "Next Action" },
  ], []);
  return <DataTable data={patients} columns={columns} />;
}

export function AlertsPage() {
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow="Patient Journey / Alerts" title="Smart Alerts" description="All delay, critical, billing, clinical, inventory, insurance, discharge, and queue alerts with resolution actions." />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AlertList />
          <SmartAlertPanel alerts={mockSmartAlerts} />
        </div>
      </div>
    </ProtectedPatientJourney>
  );
}

function AlertList() {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(mockSmartAlerts.length / patientPageSize));
  const currentPage = Math.min(page, totalPages);
  const pageAlerts = mockSmartAlerts.slice((currentPage - 1) * patientPageSize, currentPage * patientPageSize);

  return (
    <Card>
      <CardHeader><CardTitle>Resolution queue</CardTitle><CardDescription>Assign staff, escalate, mark resolved, open patient, notify department, or add note.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {pageAlerts.map((alert) => (
          <div className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-[1fr_160px]" key={alert.id}>
            <div>
              <div className="flex flex-wrap gap-2"><Badge tone={alert.severity}>{alert.type}</Badge><Badge tone="muted">{alert.age}</Badge></div>
              <div className="mt-2 font-semibold text-foreground">{alert.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{alert.department}</div>
            </div>
            <div className="grid gap-2"><Button size="sm" onClick={() => toast.success("Alert resolved")}>Resolve</Button><Button size="sm" variant="outline">Escalate</Button></div>
          </div>
        ))}
        <PaginationBar page={currentPage} totalPages={totalPages} total={mockSmartAlerts.length} onPageChange={setPage} itemLabel="alerts" />
      </CardContent>
    </Card>
  );
}

export function BottlenecksPage() {
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow="Patient Journey / Bottlenecks" title="Bottleneck Analytics" description="Department-wise delay, workload, TAT pressure, discharge delay, emergency response, and queue performance." actions={<Button variant="outline" onClick={() => toast.info("Analytics exported")}>Export</Button>} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {mockBottlenecks.map((metric) => <StatCard key={metric.id} label={metric.department} value={metric.delayed} change={metric.trend} context={metric.averageWait} tone={metric.tone} icon={BarChart3} />)}
        </div>
        <BottleneckTable metrics={mockBottlenecks} />
      </div>
    </ProtectedPatientJourney>
  );
}

function BottleneckTable({ metrics }: { metrics: BottleneckMetric[] }) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(metrics.length / patientPageSize));
  const currentPage = Math.min(page, totalPages);
  const pageMetrics = metrics.slice((currentPage - 1) * patientPageSize, currentPage * patientPageSize);

  return (
    <Card>
      <CardHeader><CardTitle>Department bottlenecks</CardTitle><CardDescription>Average wait, delayed cases, blocker, and trend.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2">Department</th><th className="px-3 py-2">Delayed</th><th className="px-3 py-2">Avg wait</th><th className="px-3 py-2">Blocker</th><th className="px-3 py-2">Trend</th></tr></thead>
            <tbody>{pageMetrics.map((metric) => <tr className="border-t border-border" key={metric.id}><td className="px-3 py-2 font-medium">{metric.department}</td><td className="px-3 py-2"><StatusPill tone={metric.tone}>{metric.delayed}</StatusPill></td><td className="px-3 py-2">{metric.averageWait}</td><td className="px-3 py-2 text-muted-foreground">{metric.blocker}</td><td className="px-3 py-2">{metric.trend}</td></tr>)}</tbody>
          </table>
        </div>
        <PaginationBar page={currentPage} totalPages={totalPages} total={metrics.length} onPageChange={setPage} itemLabel="departments" />
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const settings = [
    ["Waiting Doctor delay threshold", "More than 30 minutes = delayed"],
    ["Lab pending delay threshold", "More than 60 minutes = delayed"],
    ["Billing pending delay threshold", "More than 20 minutes = delayed"],
    ["Emergency unassigned threshold", "More than 5 minutes = critical"],
    ["Discharge pending threshold", "More than 2 hours = delayed"],
    ["Token format", "OPD-001, ER-001, LAB-001"],
    ["Role visibility", "Doctor sees clinical queue, billing sees payment queue"],
  ];
  return (
    <ProtectedPatientJourney>
      <div className="space-y-4">
        <PageHeader eyebrow="Patient Journey / Settings" title="Workflow Configuration" description="Stage sequence, thresholds, priority rules, token format, role permissions, alerts, escalation, and TV display settings." actions={<Button onClick={() => toast.success("Settings saved")}>Save settings</Button>} />
        <Tabs defaultValue="thresholds">
          <TabsList><TabsTrigger value="thresholds">Thresholds</TabsTrigger><TabsTrigger value="roles">Roles</TabsTrigger><TabsTrigger value="display">TV Display</TabsTrigger></TabsList>
          <TabsContent value="thresholds" className="mt-4"><Card><CardContent className="space-y-2 p-4">{settings.map(([label, value]) => <DetailLine key={label} label={label} value={value} />)}</CardContent></Card></TabsContent>
          <TabsContent value="roles" className="mt-4"><Card><CardContent className="grid gap-2 p-4 md:grid-cols-2">{trackerBoards.map((board) => <DetailLine key={board.key} label={board.title} value={board.ownerRoles.join(", ")} />)}</CardContent></Card></TabsContent>
          <TabsContent value="display" className="mt-4"><Card><CardContent className="grid gap-2 p-4 md:grid-cols-2"><DetailLine label="Public fields" value="Token, room, doctor, next tokens" /><DetailLine label="Hidden fields" value="Clinical details, financial details, phone, UHID" /><DetailLine label="Refresh" value="Auto-refresh queue display" /><DetailLine label="Announcement" value="Now serving and next tokens" /></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </ProtectedPatientJourney>
  );
}
