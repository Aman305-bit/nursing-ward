"use client";

import * as React from "react";
import { Activity, BarChart3, HeartPulse, RefreshCcw, Search, Table2, UsersRound } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { NativeSelect } from "@/features/admin/admin-shared";
import { cn } from "@/lib/utils";
import { RapidReviewControlToggle } from "@/features/rapid-review/rapid-review-control-toggle";
import type { StatusTone } from "@/types";
import {
  adultObservationRiskPalette,
  gcsScoreLabel,
  getRiskLevel,
  inferFio2FromOxygenSupport,
  pulseDeficitValue,
  pulseRhythmRiskScore,
  rapidLevelTone,
  rapidZoneTone,
  type AdultObservationRiskLevel,
  type AdultObservationVitalType,
  type RapidObservationSet,
  type RapidReviewPatient,
} from "./rapid-review-data";

type ReviewGraphMetricId =
  | "respiratoryRate"
  | "oxygenSaturation"
  | "oxygenFlowRate"
  | "fio2"
  | "bloodPressure"
  | "pulseRate"
  | "monitorHeartRate"
  | "pulseDeficit"
  | "pulseRhythm"
  | "temperature"
  | "consciousnessSedation"
  | "painScore"
  | "fluidIntake"
  | "urineOutput";

type ReviewGraphMetric = {
  id: ReviewGraphMetricId;
  vitalType: AdultObservationVitalType;
  label: string;
  shortLabel: string;
  unit: string;
  normalText: string;
  extractor: (observation: RapidObservationSet) => number | null;
  display: (observation: RapidObservationSet) => string;
  riskExtractor?: (observation: RapidObservationSet) => AdultObservationRiskLevel;
};

type ReviewGraphPoint = {
  date: string;
  hour: string;
  time: string;
  xLabel: string;
  value: number | null;
  displayValue: string;
  fio2: string;
  risk: AdultObservationRiskLevel;
};

type CombinedReviewGraphPoint = {
  date: string;
  time: string;
  xLabel: string;
  displays: Partial<Record<ReviewGraphMetricId, string>>;
  risks: Partial<Record<ReviewGraphMetricId, AdultObservationRiskLevel>>;
} & Partial<Record<ReviewGraphMetricId, number | null>>;

type AllVitalsGraphSection = {
  title: string;
  description: string;
  metrics: ReviewGraphMetricId[];
};

type RapidReviewGraphTabProps = {
  patients: RapidReviewPatient[];
  lockedPatientId?: string;
  defaultMetricId?: ReviewGraphMetricId;
  defaultViewMode?: string;
  title?: string;
  description?: string;
};

const reviewGraphLineColor = "#2563eb";
const allVitalsGraphView = "All vitals graph";
const combinedGraphColors = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#7c3aed",
  "#dc2626",
  "#0891b2",
  "#be123c",
  "#9333ea",
  "#4f46e5",
  "#ca8a04",
  "#0f766e",
  "#db2777",
];

const reviewGraphMetrics: ReviewGraphMetric[] = [
  {
    id: "respiratoryRate",
    vitalType: "respiratoryRate",
    label: "Respiratory Rate",
    shortLabel: "RR",
    unit: "/min",
    normalText: "Normal 16-20 /min",
    extractor: (observation) => parseObservationNumber(observation.respiratoryRate),
    display: (observation) => observation.respiratoryRate,
  },
  {
    id: "oxygenSaturation",
    vitalType: "oxygenSaturation",
    label: "O2 Saturation",
    shortLabel: "SpO2",
    unit: "%",
    normalText: "Normal >= 98%",
    extractor: (observation) => parseObservationNumber(observation.spo2),
    display: (observation) => observation.spo2,
  },
  {
    id: "oxygenFlowRate",
    vitalType: "oxygenFlowRate",
    label: "O2 Flow Rate",
    shortLabel: "O2 Flow",
    unit: "L/min",
    normalText: "Normal 0 L/min",
    extractor: (observation) => oxygenFlowValue(observation.oxygenFlow),
    display: (observation) => observation.oxygenFlow,
  },
  {
    id: "fio2",
    vitalType: "fio2",
    label: "FiO2",
    shortLabel: "FiO2",
    unit: "%",
    normalText: "Room air 21%, rising oxygen need is higher risk",
    extractor: (observation) => parseObservationNumber(fio2Value(observation)),
    display: (observation) => fio2Value(observation),
  },
  {
    id: "bloodPressure",
    vitalType: "bloodPressure",
    label: "Blood Pressure",
    shortLabel: "BP sys",
    unit: "mmHg",
    normalText: "Systolic normal 91-159",
    extractor: (observation) => systolicValue(observation.bloodPressure),
    display: (observation) => observation.bloodPressure,
  },
  {
    id: "pulseRate",
    vitalType: "pulseRate",
    label: "Pulse Rate",
    shortLabel: "Pulse",
    unit: "/min",
    normalText: "Normal 60-99 /min",
    extractor: (observation) => parseObservationNumber(observation.pulse),
    display: (observation) => observation.pulse,
  },
  {
    id: "monitorHeartRate",
    vitalType: "monitorHeartRate",
    label: "Monitor Heart Rate",
    shortLabel: "HR",
    unit: "bpm",
    normalText: "Normal 60-99 bpm",
    extractor: (observation) => parseObservationNumber(monitorHeartRateValue(observation)),
    display: (observation) => monitorHeartRateValue(observation),
  },
  {
    id: "pulseDeficit",
    vitalType: "pulseDeficit",
    label: "Pulse Deficit",
    shortLabel: "Deficit",
    unit: "bpm",
    normalText: "Normal <= 10 bpm difference",
    extractor: (observation) => pulseDeficitValue(monitorHeartRateValue(observation), observation.pulse),
    display: (observation) => {
      const value = pulseDeficitValue(monitorHeartRateValue(observation), observation.pulse);
      return value === null ? "--" : `${value}`;
    },
  },
  {
    id: "pulseRhythm",
    vitalType: "pulseRhythm",
    label: "Pulse Rhythm",
    shortLabel: "Rhythm",
    unit: "risk score",
    normalText: "Regular = normal, irregular = risk",
    extractor: (observation) => pulseRhythmRiskScore(pulseRhythmLabel(observation)),
    display: (observation) => pulseRhythmLabel(observation),
  },
  {
    id: "temperature",
    vitalType: "temperature",
    label: "Temperature",
    shortLabel: "Temp",
    unit: "deg C",
    normalText: "Normal 36.1-37.5 deg C",
    extractor: (observation) => parseObservationNumber(observation.temperature),
    display: (observation) => observation.temperature,
  },
  {
    id: "consciousnessSedation",
    vitalType: "consciousnessSedation",
    label: "GCS Score",
    shortLabel: "GCS",
    unit: "score",
    normalText: "Normal score 0",
    extractor: (observation) => parseObservationNumber(observation.consciousness),
    display: (observation) => gcsScoreLabel(observation.consciousness),
  },
  {
    id: "painScore",
    vitalType: "painScore",
    label: "Pain Score",
    shortLabel: "Pain",
    unit: "/10",
    normalText: "Normal 0-3",
    extractor: (observation) => parseObservationNumber(observation.painScore),
    display: (observation) => observation.painScore,
  },
  {
    id: "fluidIntake",
    vitalType: "intervention",
    label: "Fluid Intake",
    shortLabel: "Intake",
    unit: "ml/hr",
    normalText: "Sample hourly intake for graph review",
    extractor: rapidReviewFluidIntakeValue,
    display: (observation) => {
      const intake = rapidReviewFluidIntakeValue(observation);
      return intake === null ? "--" : `${intake} ml/hr`;
    },
  },
  {
    id: "urineOutput",
    vitalType: "intervention",
    label: "Urine Output",
    shortLabel: "Urine",
    unit: "ml/hr",
    normalText: "Normal >= 40 ml/hr, low < 30 ml/hr",
    extractor: (observation) => parseObservationNumber(observation.urineOutput),
    display: (observation) => observation.urineOutput,
    riskExtractor: (observation) => urineOutputRiskLevel(observation.urineOutput),
  },
];

const allVitalsGraphSections: AllVitalsGraphSection[] = [
  {
    title: "Respiration",
    description: "Respiratory rate, oxygen saturation, oxygen flow, and FiO2 trend.",
    metrics: ["respiratoryRate", "oxygenSaturation", "oxygenFlowRate", "fio2"],
  },
  {
    title: "CVS",
    description: "Pulse, monitor heart rate, systolic blood pressure, pulse deficit, and rhythm risk.",
    metrics: ["pulseRate", "monitorHeartRate", "bloodPressure", "pulseDeficit", "pulseRhythm"],
  },
  {
    title: "Infection",
    description: "Temperature trend with risk markers.",
    metrics: ["temperature"],
  },
  {
    title: "Neuro / Pain",
    description: "GCS and pain-score trend for deterioration review.",
    metrics: ["consciousnessSedation", "painScore"],
  },
  {
    title: "Intake / Output",
    description: "Hourly intake and urine output trend from rapid review observations.",
    metrics: ["fluidIntake", "urineOutput"],
  },
];

export function RapidReviewGraphTab({
  patients,
  lockedPatientId,
  defaultMetricId = "respiratoryRate",
  defaultViewMode = "Graph + table",
  title = "Review Graph",
  description = "Select one patient and review focused vital trends or the complete combined clinical trend.",
}: RapidReviewGraphTabProps) {
  const [metricId, setMetricId] = React.useState<ReviewGraphMetricId>(defaultMetricId);
  const [patientId, setPatientId] = React.useState(lockedPatientId ?? patients[0]?.id ?? "");
  const [viewMode, setViewMode] = React.useState(defaultViewMode);
  const [search, setSearch] = React.useState("");
  const [dateMode, setDateMode] = React.useState("Latest record date");
  const [singleDate, setSingleDate] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [timeMode, setTimeMode] = React.useState("24 Hours");
  const [timeFrom, setTimeFrom] = React.useState("");
  const [timeTo, setTimeTo] = React.useState("");

  const metric = reviewGraphMetrics.find((item) => item.id === metricId) ?? reviewGraphMetrics[0];
  const selectedPatient = patients.find((patient) => patient.id === (lockedPatientId ?? patientId)) ?? patients[0];
  const patientDates = selectedPatient ? uniqueObservationDates(selectedPatient.observationHistory) : [];
  const latestDataDate = latestAvailableDate(patientDates);
  const filteredObservations = selectedPatient
    ? selectedPatient.observationHistory
      .filter((observation) => observationMatchesDateFilter(observation, dateMode, singleDate, dateFrom, dateTo, latestDataDate))
      .filter((observation) => observationMatchesTimeFilter(observation, timeMode, timeFrom, timeTo))
      .sort((a, b) => observationDateTimeSortValue(a).localeCompare(observationDateTimeSortValue(b)))
    : [];
  const patientMatches = React.useMemo(() => {
    if (lockedPatientId) return patients.filter((patient) => patient.id === lockedPatientId);
    return patients.filter((patient) => {
      const searchText = `${patient.patientName} ${patient.uhid} ${patient.bed} ${patient.ward} ${patient.consultant}`;
      return searchText.toLowerCase().includes(search.toLowerCase());
    });
  }, [lockedPatientId, patients, search]);
  const isAllVitalsGraph = viewMode === allVitalsGraphView;
  const graphData = buildReviewGraphData(filteredObservations, metric);
  const summary = buildReviewGraphSummary(filteredObservations, metric);
  const combinedGraphData = buildCombinedReviewGraphData(filteredObservations);
  const combinedSummary = buildCombinedReviewGraphSummary(filteredObservations);
  const activeSummary = isAllVitalsGraph ? combinedSummary : summary;
  const filterSummary = `${dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)} | ${timeFilterSummary(timeMode, timeFrom, timeTo)}`;

  function updateDateMode(value: string) {
    setDateMode(value);
    if (value === "Single date" && !singleDate) setSingleDate(latestDataDate || todayDateValue());
    if (value === "Custom range" && !dateFrom && !dateTo) {
      const defaultDate = latestDataDate || todayDateValue();
      setDateFrom(defaultDate);
      setDateTo(defaultDate);
    }
  }

  if (!patients.length) {
    return <EmptyState icon={BarChart3} title="No patients available" description="No rapid review observations are available for graph review." />;
  }

  return (
    <div className="space-y-4">
      <RapidReviewControlToggle label="Review graph controls">
        <Card>
        <CardHeader>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge tone="info">{lockedPatientId ? "Patient locked" : "Patient-wise"}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("grid gap-3 lg:items-end", lockedPatientId ? "lg:grid-cols-[minmax(260px,1fr)_180px]" : "lg:grid-cols-[minmax(260px,1.35fr)_minmax(240px,1fr)_180px]")}>
            {lockedPatientId ? (
              <div className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Selected patient</span>
                <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-md border border-input bg-surface-muted px-3 py-2 text-sm text-foreground">
                  <span className="font-semibold">{selectedPatient?.patientName ?? "Patient"}</span>
                  <span className="text-muted-foreground">{selectedPatient?.uhid} - {selectedPatient?.bed}</span>
                </div>
              </div>
            ) : (
              <>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-foreground">Search patient</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className="h-9 w-full rounded-md border border-input bg-background px-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="Search name, UHID, bed, ward..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-foreground">Patient filter</span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                    value={patientId}
                    onChange={(event) => setPatientId(event.target.value)}
                  >
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.patientName} - {patient.uhid} - {patient.bed}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <NativeSelect
              label="View"
              value={viewMode}
              onChange={setViewMode}
              options={["Graph + table", "Graph only", "Table only", allVitalsGraphView]}
            />
          </div>

          <ReviewGraphDateFilter
            dateFrom={dateFrom}
            dateMode={dateMode}
            dateTo={dateTo}
            latestDataDate={latestDataDate}
            onDateFrom={setDateFrom}
            onDateMode={updateDateMode}
            onDateTo={setDateTo}
            onSingleDate={setSingleDate}
            onTimeFrom={setTimeFrom}
            onTimeMode={setTimeMode}
            onTimeTo={setTimeTo}
            singleDate={singleDate}
            timeFrom={timeFrom}
            timeMode={timeMode}
            timeTo={timeTo}
          />

          {!lockedPatientId && search.trim() ? (
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Matching patients</div>
              <div className="flex flex-wrap gap-2">
                {patientMatches.length ? patientMatches.map((patient) => (
                  <Button
                    key={patient.id}
                    size="sm"
                    variant={patient.id === selectedPatient?.id ? "default" : "outline"}
                    onClick={() => setPatientId(patient.id)}
                  >
                    {patient.patientName} - {patient.bed}
                  </Button>
                )) : <span className="text-sm text-muted-foreground">No patient matched this search.</span>}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {reviewGraphMetrics.map((item) => (
              <button
                className={cn(
                  "rounded-md border p-3 text-left transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-ring/20",
                  isAllVitalsGraph
                    ? "border-primary/40 bg-primary/5"
                    : item.id === metric.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background",
                )}
                key={item.id}
                onClick={() => setMetricId(item.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.normalText}</div>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        </Card>
      </RapidReviewControlToggle>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GraphStatCard label="Selected vital" value={isAllVitalsGraph ? "All graphs" : metric.shortLabel} context={isAllVitalsGraph ? `${allVitalsGraphSections.length} panels` : metric.unit} tone="info" icon={BarChart3} />
        <GraphStatCard label="Total entries" value={activeSummary.totalEntries} context={filterSummary} tone="success" icon={Table2} />
        <GraphStatCard label="High/Critical" value={activeSummary.highRiskCount + activeSummary.criticalCount} context={`${activeSummary.criticalCount} critical`} tone={activeSummary.criticalCount ? "critical" : activeSummary.highRiskCount ? "danger" : "success"} icon={HeartPulse} />
        <GraphStatCard label="Patient" value={selectedPatient?.patientName ?? "-"} context={selectedPatient ? `${selectedPatient.bed}, ${selectedPatient.ward}` : "Focused"} tone="info" icon={UsersRound} />
      </div>

      {isAllVitalsGraph && selectedPatient ? (
        <AllVitalsGraphDashboard patient={selectedPatient} data={combinedGraphData} dateSummary={filterSummary} />
      ) : viewMode !== "Table only" && selectedPatient ? (
        <ReviewGraphPanel patient={selectedPatient} data={graphData} metric={metric} dateSummary={filterSummary} />
      ) : null}

      {!isAllVitalsGraph && viewMode !== "Graph only" && selectedPatient ? (
        <ReviewGraphTable patient={selectedPatient} observations={filteredObservations} metric={metric} dateSummary={filterSummary} />
      ) : null}
    </div>
  );
}

function ReviewGraphDateFilter({
  dateMode,
  onDateMode,
  singleDate,
  onSingleDate,
  dateFrom,
  onDateFrom,
  dateTo,
  onDateTo,
  latestDataDate,
  timeMode,
  onTimeMode,
  timeFrom,
  onTimeFrom,
  timeTo,
  onTimeTo,
}: {
  dateMode: string;
  onDateMode: (mode: string) => void;
  singleDate: string;
  onSingleDate: (date: string) => void;
  dateFrom: string;
  onDateFrom: (date: string) => void;
  dateTo: string;
  onDateTo: (date: string) => void;
  latestDataDate: string;
  timeMode: string;
  onTimeMode: (mode: string) => void;
  timeFrom: string;
  onTimeFrom: (time: string) => void;
  timeTo: string;
  onTimeTo: (time: string) => void;
}) {
  const modes = ["All dates", "Latest record date", "Today", "Yesterday", "Last 7 days", "Last 30 days", "Single date", "Custom range"];
  const timeModes = ["24 Hours", "Morning 06-13", "Afternoon 14-17", "Evening 18-21", "Night 22-05", "Business hours", "Custom time range"];
  const invalidRange = dateMode === "Custom range" && Boolean(dateFrom && dateTo && dateFrom > dateTo);

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Date filter</div>
          <div className="mt-1 text-sm text-foreground">{dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
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
            Reset range
          </Button>
        </div>
      ) : null}

      {invalidRange ? (
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
      </div>
    </div>
  );
}

function ReviewGraphPanel({
  patient,
  data,
  metric,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  data: ReviewGraphPoint[];
  metric: ReviewGraphMetric;
  dateSummary: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{metric.label} - Date / Time Trend</CardTitle>
          <CardDescription>{patient.patientName} - {patient.uhid} - {patient.bed}. {dateSummary}.</CardDescription>
        </div>
        <StatusPill tone="info">{metric.unit}</StatusPill>
      </CardHeader>
      <CardContent>
        <ReviewGraphRiskLegend />
        <div className="h-[360px]">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={data} margin={{ left: -16, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="xLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} width={52} />
              <Tooltip content={<ReviewGraphTooltip metric={metric} />} />
              <Legend />
              <Line
                activeDot={renderActiveReviewGraphDot}
                connectNulls
                dataKey="value"
                dot={renderReviewGraphDot}
                name={`${patient.patientName} (${metric.shortLabel})`}
                stroke={reviewGraphLineColor}
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewGraphRiskLegend() {
  const levels: AdultObservationRiskLevel[] = ["critical", "highRisk", "warning", "normal"];

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {levels.map((level) => {
        const palette = adultObservationRiskPalette[level];
        return (
          <span
            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium"
            key={level}
            style={{ backgroundColor: palette.background, borderColor: palette.border, color: palette.text }}
          >
            <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: palette.background, borderColor: palette.text }} />
            {palette.label}
          </span>
        );
      })}
    </div>
  );
}

function ReviewGraphTooltip({ active, payload, metric }: { active?: boolean; payload?: Array<{ payload?: ReviewGraphPoint }>; metric: ReviewGraphMetric }) {
  if (!active) return null;
  const point = payload?.[0]?.payload;
  if (!point) return null;
  const palette = adultObservationRiskPalette[point.risk];

  return (
    <div className="rounded-md border border-border bg-background p-3 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{formatDateLabel(point.date)} - {point.time}</div>
      <div className="mt-1 text-muted-foreground">{metric.label}: <span className="font-semibold text-foreground">{point.displayValue}</span></div>
      {metric.id === "oxygenSaturation" ? (
        <div className="mt-1 text-muted-foreground">FiO2: <span className="font-semibold text-foreground">{point.fio2}</span></div>
      ) : null}
      <div className="mt-2 inline-flex rounded-full border px-2 py-0.5 font-medium" style={{ backgroundColor: palette.background, borderColor: palette.border, color: palette.text }}>
        {palette.label}
      </div>
    </div>
  );
}

type ReviewGraphDotProps = {
  active?: boolean;
  cx?: number;
  cy?: number;
  payload?: ReviewGraphPoint;
};

function renderReviewGraphDot(props: unknown) {
  return <ReviewGraphDot {...(props as ReviewGraphDotProps)} />;
}

function renderActiveReviewGraphDot(props: unknown) {
  return <ReviewGraphDot {...(props as ReviewGraphDotProps)} active />;
}

function ReviewGraphDot({ active, cx, cy, payload }: ReviewGraphDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number" || payload?.value === null) return null;

  const palette = adultObservationRiskPalette[payload?.risk ?? "empty"];
  return (
    <circle
      cx={cx}
      cy={cy}
      fill={palette.background}
      r={active ? 6 : 4}
      stroke={palette.text}
      strokeWidth={active ? 2.5 : 2}
    />
  );
}

function ReviewGraphTable({
  patient,
  observations,
  metric,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  observations: RapidObservationSet[];
  metric: ReviewGraphMetric;
  dateSummary: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{metric.label} - Date / Time Data</CardTitle>
          <CardDescription>{patient.patientName} patient-wise table. Date filter: {dateSummary}.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-border bg-surface-muted px-3 py-2 text-left">Date</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Time</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Value</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Risk</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Response</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Entered by</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {observations.length ? observations.map((observation) => {
                const value = metric.display(observation);
                const risk = metricRiskLevel(metric, observation);
                return (
                  <tr className="border-b border-border last:border-0" key={observation.id}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border-r border-border bg-background px-3 py-2 font-medium">{formatDateLabel(observationDateValue(observation))}</td>
                    <td className="whitespace-nowrap border-r border-border px-3 py-2">
                      <div className="font-medium">{observationTimeLabel(observation)}</div>
                      <div className="text-xs text-muted-foreground">{observation.shift ?? "Shift not set"}</div>
                    </td>
                    <td className="border-r border-border px-3 py-2 font-semibold" style={riskCellStyle(risk)}>{value}</td>
                    <td className="border-r border-border px-3 py-2">
                      <Badge tone={riskBadgeTone(risk)}>{adultObservationRiskPalette[risk].label}</Badge>
                    </td>
                    <td className="border-r border-border px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                        <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                      </div>
                    </td>
                    <td className="border-r border-border px-3 py-2 text-muted-foreground">{observation.recordedBy}</td>
                    <td className="min-w-[260px] border-r border-border px-3 py-2 text-muted-foreground">{observation.note}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td className="px-3 py-8 text-center text-muted-foreground" colSpan={7}>No graph data matched the selected date and time filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AllVitalsGraphDashboard({
  patient,
  data,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  data: CombinedReviewGraphPoint[];
  dateSummary: string;
}) {
  return (
    <div className="space-y-4">
      {allVitalsGraphSections.map((section) => (
        <AllVitalsGraphSectionCard data={data} key={section.title} section={section} />
      ))}
    </div>
  );
}

function AllVitalsGraphSectionCard({
  section,
  data,
}: {
  section: AllVitalsGraphSection;
  data: CombinedReviewGraphPoint[];
}) {
  if (section.metrics.includes("urineOutput")) {
    return <AllVitalsFluidBalanceSectionCard data={data} section={section} />;
  }

  const sectionMetrics = section.metrics
    .map((metricId) => reviewGraphMetrics.find((metric) => metric.id === metricId))
    .filter((metric): metric is ReviewGraphMetric => Boolean(metric));

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="border-b border-border bg-surface-muted p-4 lg:border-b-0 lg:border-r">
          <h3 className="text-2xl font-semibold text-foreground">{section.title}</h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{section.description}</p>
          <div className="mt-5">
            <p className="text-sm font-semibold text-foreground">Legend</p>
            <div className="mt-3 space-y-3">
              {sectionMetrics.map((metric) => (
                <div className="flex items-start gap-3 text-sm" key={metric.id}>
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: reviewMetricColor(metric.id) }} />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{metric.shortLabel}</span>
                    <span className="block text-xs leading-4 text-muted-foreground">{metric.label} {metric.unit ? `(${metric.unit})` : ""}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 p-4">
          {data.length ? (
            <div className="h-[310px]">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={data} margin={{ left: -10, right: 18, top: 12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={48} />
                  <Tooltip content={<CombinedReviewGraphTooltip />} />
                  <Legend />
                  {sectionMetrics.map((metric) => (
                    <Line
                      activeDot={(props) => <CombinedReviewGraphDot {...(props as unknown as CombinedReviewGraphDotProps)} active metric={metric} />}
                      connectNulls
                      dataKey={metric.id}
                      dot={(props) => <CombinedReviewGraphDot {...(props as unknown as CombinedReviewGraphDotProps)} metric={metric} />}
                      key={metric.id}
                      name={metric.shortLabel}
                      stroke={reviewMetricColor(metric.id)}
                      strokeWidth={metric.id === "bloodPressure" || metric.id === "oxygenSaturation" ? 2.4 : 2}
                      type="monotone"
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={BarChart3} title={`${section.title} graph unavailable`} description="No observation data matched the selected date and time filter." />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AllVitalsFluidBalanceSectionCard({
  section,
  data,
}: {
  section: AllVitalsGraphSection;
  data: CombinedReviewGraphPoint[];
}) {
  const intakeMetric = reviewGraphMetrics.find((item) => item.id === "fluidIntake");
  const outputMetric = reviewGraphMetrics.find((item) => item.id === "urineOutput");
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="border-b border-border bg-surface-muted p-4 lg:border-b-0 lg:border-r">
          <h3 className="text-2xl font-semibold text-foreground">{section.title}</h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{section.description}</p>
          <div className="mt-5">
            <p className="text-sm font-semibold text-foreground">Legend</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-white bg-sky-500 shadow-sm" />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{intakeMetric?.shortLabel ?? "Intake"}</span>
                  <span className="block text-xs leading-4 text-muted-foreground">Fluid intake above baseline ({intakeMetric?.unit ?? "ml/hr"})</span>
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-white bg-emerald-500 shadow-sm" />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{outputMetric?.shortLabel ?? "Output"}</span>
                  <span className="block text-xs leading-4 text-muted-foreground">Urine output below baseline ({outputMetric?.unit ?? "ml/hr"})</span>
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="mt-2 h-0 w-8 shrink-0 border-t border-dashed border-slate-400" />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">Baseline</span>
                  <span className="block text-xs leading-4 text-muted-foreground">Zero reference line</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 p-4">
          {data.length ? (
            <RapidReviewIntakeOutputGraph data={data} />
          ) : (
            <EmptyState icon={BarChart3} title={`${section.title} graph unavailable`} description="No observation data matched the selected date and time filter." />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RapidReviewIntakeOutputGraph({ data }: { data: CombinedReviewGraphPoint[] }) {
  const width = Math.max(640, data.length * 56);
  const height = 260;
  const pad = 34;
  const labelSpace = 24;
  const baseline = Math.round((height - labelSpace) / 2);
  const plotWidth = width - pad * 2;
  const intakePlotHeight = baseline - pad - 10;
  const outputPlotHeight = height - labelSpace - baseline - 10;
  const intakeValues = data.map((point) => parseObservationNumber(String(point.displays.fluidIntake ?? "")) ?? 0);
  const outputValues = data.map((point) => parseObservationNumber(String(point.displays.urineOutput ?? "")) ?? 0);
  const maxVolume = Math.max(40, ...intakeValues, ...outputValues);

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-background p-3">
      <svg className="block" height={height} role="img" viewBox={`0 0 ${width} ${height}`} width={width}>
        <line stroke="#cbd5e1" strokeDasharray="4 4" x1={pad} x2={width - pad} y1={baseline} y2={baseline} />
        {data.map((point, index) => {
          const x = pad + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
          const intake = intakeValues[index] ?? 0;
          const output = outputValues[index] ?? 0;
          const intakeHeight = intake > 0 ? Math.max(4, (intake / maxVolume) * intakePlotHeight) : 0;
          const outputHeight = output > 0 ? Math.max(4, (output / maxVolume) * outputPlotHeight) : 0;
          const risk = point.risks.urineOutput ?? "empty";
          const palette = adultObservationRiskPalette[risk];
          return (
            <g key={`${point.date}-${point.time}-${index}`}>
              <rect fill="#0ea5e9" height={intakeHeight} rx="4" width="16" x={x - 20} y={baseline - intakeHeight} />
              <rect fill="#10b981" height={outputHeight} rx="4" width="16" x={x + 4} y={baseline} />
              <circle cx={x} cy={baseline + outputHeight + 7} fill={palette.background} r="4" stroke={palette.text} strokeWidth="1.5" />
              <text fill="#475569" fontSize="10" textAnchor="middle" x={x} y={height - 8}>{point.time}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type CombinedReviewGraphTooltipEntry = {
  color?: string;
  dataKey?: string | number;
  name?: string;
  payload?: CombinedReviewGraphPoint;
  value?: number | null;
};

function CombinedReviewGraphTooltip({ active, payload }: { active?: boolean; payload?: CombinedReviewGraphTooltipEntry[] }) {
  if (!active) return null;
  const point = payload?.[0]?.payload;
  if (!point) return null;
  const visibleEntries = (payload ?? []).filter((entry) => typeof entry.value === "number");

  return (
    <div className="max-h-[360px] min-w-[260px] overflow-auto rounded-md border border-border bg-background p-3 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{formatDateLabel(point.date)} - {point.time}</div>
      <div className="mt-2 space-y-1">
        {visibleEntries.map((entry) => {
          const metricId = String(entry.dataKey) as ReviewGraphMetricId;
          const metric = reviewGraphMetrics.find((item) => item.id === metricId);
          if (!metric) return null;
          const risk = point.risks[metric.id] ?? "empty";
          const palette = adultObservationRiskPalette[risk];
          return (
            <div className="flex items-center justify-between gap-4" key={metric.id}>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {metric.shortLabel}
              </span>
              <span className="font-semibold text-foreground">{point.displays[metric.id] ?? "--"}</span>
              <span className="rounded-full border px-2 py-0.5 font-medium" style={{ backgroundColor: palette.background, borderColor: palette.border, color: palette.text }}>
                {palette.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CombinedReviewGraphDotProps = {
  active?: boolean;
  cx?: number;
  cy?: number;
  metric: ReviewGraphMetric;
  payload?: CombinedReviewGraphPoint;
  stroke?: string;
  value?: number | null;
};

function CombinedReviewGraphDot({ active, cx, cy, metric, payload, stroke, value }: CombinedReviewGraphDotProps) {
  const metricValue = typeof value === "number" ? value : payload?.[metric.id];
  if (typeof cx !== "number" || typeof cy !== "number" || typeof metricValue !== "number") return null;

  const risk = payload?.risks[metric.id] ?? "empty";
  const palette = adultObservationRiskPalette[risk];
  return (
    <circle
      cx={cx}
      cy={cy}
      fill={stroke ?? palette.text}
      r={active ? 5 : 3.2}
      stroke={palette.text}
      strokeWidth={active ? 2.4 : 1.8}
    />
  );
}

function GraphStatCard({
  label,
  value,
  context,
  tone,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  context: string;
  tone: StatusTone;
  icon: typeof Activity;
}) {
  return (
    <Card className="min-h-[116px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4">
        <StatusPill tone={tone}>{context}</StatusPill>
      </div>
    </Card>
  );
}

function reviewMetricColor(metricId: ReviewGraphMetricId) {
  const index = reviewGraphMetrics.findIndex((metric) => metric.id === metricId);
  return combinedGraphColors[Math.max(0, index) % combinedGraphColors.length];
}

function metricRiskLevel(metric: ReviewGraphMetric, observation: RapidObservationSet) {
  if (metric.riskExtractor) return metric.riskExtractor(observation);
  const value = metric.extractor(observation);
  const displayValue = metric.display(observation);
  return getRiskLevel(metric.vitalType, metric.vitalType === "pulseRhythm" ? displayValue : value ?? displayValue);
}

function urineOutputRiskLevel(value: string | number | null | undefined): AdultObservationRiskLevel {
  const numericValue = typeof value === "number" ? value : parseObservationNumber(String(value ?? ""));
  if (numericValue === null) return "empty";
  if (numericValue < 15) return "critical";
  if (numericValue < 30) return "highRisk";
  if (numericValue < 40) return "warning";
  return "normal";
}

function rapidReviewFluidIntakeValue(observation: RapidObservationSet) {
  const documentedIntake = parseObservationNumber(observation.fluidIntake ?? "");
  if (documentedIntake !== null) return documentedIntake;
  const urine = parseObservationNumber(observation.urineOutput);
  if (urine === null) return null;
  const oxygenFlow = oxygenFlowValue(observation.oxygenFlow) ?? 0;
  const painScore = parseObservationNumber(observation.painScore) ?? 0;
  const minutes = observationTimeMinutes(observation) ?? 0;
  const hourFactor = (Math.floor(minutes / 60) % 4) * 8;
  const riskLoad = observation.responseLevel === "MER Call" ? 48 : observation.responseLevel === "MDT Review" ? 34 : observation.responseLevel === "RN Review" ? 20 : 8;
  const renalGuard = urine < 30 ? 12 : urine < 40 ? 22 : 34;
  return Math.round(Math.min(160, Math.max(35, renalGuard + riskLoad + hourFactor + oxygenFlow * 4 + painScore * 2)));
}

function buildReviewGraphData(observations: RapidObservationSet[], metric: ReviewGraphMetric): ReviewGraphPoint[] {
  return observations.map((observation) => {
    const value = metric.extractor(observation);
    const displayValue = metric.display(observation);
    const date = observationDateValue(observation);
    const time = observationTimeLabel(observation);
    return {
      date,
      hour: observationHourKey(observation),
      time,
      xLabel: `${formatDateShortLabel(date)} ${time}`,
      value,
      displayValue,
      fio2: fio2Value(observation),
      risk: metricRiskLevel(metric, observation),
    };
  });
}

function buildReviewGraphSummary(observations: RapidObservationSet[], metric: ReviewGraphMetric) {
  return observations.reduce(
    (summary, observation) => {
      const risk = metricRiskLevel(metric, observation);
      summary.totalEntries += 1;
      if (risk === "critical") summary.criticalCount += 1;
      if (risk === "highRisk") summary.highRiskCount += 1;
      return summary;
    },
    { criticalCount: 0, highRiskCount: 0, totalEntries: 0 },
  );
}

function buildCombinedReviewGraphData(observations: RapidObservationSet[]): CombinedReviewGraphPoint[] {
  return observations.map((observation) => {
    const date = observationDateValue(observation);
    const time = observationTimeLabel(observation);
    const point: CombinedReviewGraphPoint = {
      date,
      time,
      xLabel: `${formatDateShortLabel(date)} ${time}`,
      displays: {},
      risks: {},
    };

    reviewGraphMetrics.forEach((metric) => {
      const rawValue = metric.extractor(observation);
      const displayValue = metric.display(observation);
      const risk = metricRiskLevel(metric, observation);
      point[metric.id] = normalizeReviewGraphValue(metric.id, rawValue);
      point.displays[metric.id] = displayValue;
      point.risks[metric.id] = risk;
    });

    return point;
  });
}

function buildCombinedReviewGraphSummary(observations: RapidObservationSet[]) {
  return observations.reduce(
    (summary, observation) => {
      summary.totalEntries += 1;
      reviewGraphMetrics.forEach((metric) => {
        const risk = metricRiskLevel(metric, observation);
        if (risk === "critical") summary.criticalCount += 1;
        if (risk === "highRisk") summary.highRiskCount += 1;
      });
      return summary;
    },
    { criticalCount: 0, highRiskCount: 0, totalEntries: 0 },
  );
}

function uniqueObservationDates(observations: RapidObservationSet[]) {
  return Array.from(new Set(observations.map((observation) => observationDateValue(observation)))).sort((a, b) => b.localeCompare(a));
}

function observationMatchesDateFilter(
  observation: RapidObservationSet,
  mode: string,
  singleDate: string,
  dateFrom: string,
  dateTo: string,
  latestDataDate: string,
) {
  const date = observationDateValue(observation);
  const today = todayDateValue();
  if (mode === "All dates") return true;
  if (mode === "Latest record date") return Boolean(latestDataDate) && date === latestDataDate;
  if (mode === "Today") return date === today;
  if (mode === "Yesterday") return date === addDaysToDateValue(today, -1);
  if (mode === "Last 7 days") return date >= addDaysToDateValue(today, -6) && date <= today;
  if (mode === "Last 30 days") return date >= addDaysToDateValue(today, -29) && date <= today;
  if (mode === "Single date") return singleDate ? date === singleDate : true;
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return false;
    return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
  }
  return true;
}

function observationMatchesTimeFilter(observation: RapidObservationSet, mode: string, timeFrom: string, timeTo: string) {
  const minutes = observationTimeMinutes(observation);
  if (minutes === null) return true;
  if (mode === "24 Hours" || mode === "All times") return true;
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

function dateFilterSummary(mode: string, singleDate: string, dateFrom: string, dateTo: string, latestDataDate: string) {
  if (mode === "Latest record date") return latestDataDate ? formatDateLabel(latestDataDate) : "Latest record date";
  if (mode === "Single date") return singleDate ? formatDateLabel(singleDate) : "Single date";
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
  return dates[0] ?? "";
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

function formatDateShortLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${Number(match[3])}/${match[2]}`;
}

function observationDateTimeSortValue(observation: RapidObservationSet) {
  return `${observationDateValue(observation)} ${observationTimeLabel(observation)}`;
}

function todayDateValue() {
  return dateToValue(new Date());
}

function addDaysToDateValue(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateToValue(date);
}

function dateToValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function observationHourKey(observation: RapidObservationSet) {
  const hour = Number.parseInt(observationTimeLabel(observation).split(":")[0] ?? "", 10);
  return Number.isFinite(hour) ? `${hour.toString().padStart(2, "0")}:00` : "00:00";
}

function parseObservationNumber(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function systolicValue(value: string) {
  const systolic = Number.parseFloat(value.split("/")[0] ?? "");
  return Number.isFinite(systolic) ? systolic : null;
}

function oxygenFlowValue(value: string) {
  const lower = value.toLowerCase();
  if (lower === "air" || lower.includes("room air")) return 0;
  return parseObservationNumber(value);
}

function normalizeReviewGraphValue(metricId: ReviewGraphMetricId, value: number | null) {
  if (value === null) return null;
  if (metricId === "respiratoryRate") return scaleToPercent(value, 8, 40);
  if (metricId === "oxygenSaturation") return scaleToPercent(value, 80, 100);
  if (metricId === "oxygenFlowRate") return scaleToPercent(value, 0, 15);
  if (metricId === "fio2") return scaleToPercent(value, 21, 100);
  if (metricId === "bloodPressure") return scaleToPercent(value, 70, 220);
  if (metricId === "pulseRate" || metricId === "monitorHeartRate") return scaleToPercent(value, 40, 180);
  if (metricId === "pulseDeficit") return scaleToPercent(value, 0, 60);
  if (metricId === "pulseRhythm") return scaleToPercent(value, 0, 4);
  if (metricId === "temperature") return scaleToPercent(value, 34, 42);
  if (metricId === "consciousnessSedation") return scaleToPercent(value, 0, 4);
  if (metricId === "painScore") return scaleToPercent(value, 0, 10);
  if (metricId === "fluidIntake") return scaleToPercent(value, 0, 180);
  if (metricId === "urineOutput") return scaleToPercent(value, 0, 100);
  return value;
}

function scaleToPercent(value: number, min: number, max: number) {
  if (max <= min) return value;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function fio2Value(observation: RapidObservationSet) {
  return observation.fio2 ?? inferFio2FromOxygenSupport(observation.oxygenFlow, observation.deliveryMethod);
}

function monitorHeartRateValue(observation: RapidObservationSet) {
  return observation.monitorHeartRate?.trim() ? observation.monitorHeartRate : observation.pulse;
}

function pulseRhythmLabel(observation: RapidObservationSet) {
  if (observation.pulseRhythm) return observation.pulseRhythm;
  const pulse = Number.parseFloat(observation.pulse);
  if (observation.responseLevel === "MER Call") return "Irregularly irregular";
  if (observation.responseLevel === "MDT Review" || pulse >= 120) return "Irregular";
  if (observation.responseLevel === "RN Review" || pulse >= 100) return "Regularly irregular";
  return "Regular";
}

function riskCellStyle(risk: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[risk];
  return {
    backgroundColor: palette.background,
    color: palette.text,
  };
}

function riskBadgeTone(risk: AdultObservationRiskLevel): StatusTone {
  if (risk === "critical") return "critical";
  if (risk === "highRisk") return "danger";
  if (risk === "warning") return "warning";
  if (risk === "normal") return "success";
  return "muted";
}
