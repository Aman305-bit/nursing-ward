"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  Droplets,
  Plus,
  RefreshCcw,
  Search,
  Table2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import {
  icuPatients,
  intakeOutputRows,
  type IcuIntakeOutput,
} from "../nursing-icu-data";

type IoView = "Hourly" | "12 Hours" | "24 Hours" | "Cumulative";
type IoMode = "Table" | "Graph";
type TimeWindow = "All time" | "Day shift" | "Night shift" | "Custom range";
type MatrixRowType = "section" | "group" | "category" | "total" | "net";
type SourceFilter = "All sources" | IcuIntakeOutput["source"];

type MatrixRow = {
  label: string;
  type: MatrixRowType;
  kind?: IcuIntakeOutput["kind"];
  subRow?: boolean;
};

type Bucket = {
  key: string;
  label: string;
  sublabel?: string;
  match: (row: IcuIntakeOutput) => boolean;
};

type ActiveCell = {
  title: string;
  bucket: string;
  total: number;
  rows: IcuIntakeOutput[];
} | null;

type GraphPoint = {
  key: string;
  label: string;
  intake: number;
  output: number;
  balance: number;
};

type IoDraft = {
  kind: IcuIntakeOutput["kind"];
  category: string;
  component: string;
  quantity: string;
  route: string;
  source: IcuIntakeOutput["source"];
  date: string;
  time: string;
  comment: string;
};

type IntakeOutputWorkspaceProps = {
  entryOnly?: boolean;
  initialPatientId?: string;
  lockedPatientId?: string;
  initialView?: IoView;
  initialMode?: IoMode;
  forceFluidBalanceView?: boolean;
};

const selectedToday = "2026-06-06";
const selectedFromDate = "2026-06-05";
const ioDateOptions = [
  { label: "06 Jun 2026", value: selectedToday },
  { label: "05 Jun 2026", value: selectedFromDate },
  { label: "04 Jun 2026", value: "2026-06-04" },
];
const hourOptions = ["All hours", ...Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`)] as const;
const exactHourOptions = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);
const timeWindowOptions: TimeWindow[] = ["All time", "Day shift", "Night shift", "Custom range"];

const intakeCategories = [
  "Oral Intake",
  "Enteral Feed / Tube Feed",
  "IV Fluids",
  "IV Medication Dilution",
  "Continuous Infusions",
  "NTG Pump",
  "Blood & Blood Products",
  "Parenteral Nutrition / TPN",
  "Electrolyte Replacement",
  "Irrigation Input",
  "Other Intake",
];

const outputCategories = [
  "Urine",
  "Fecal",
  "NG Aspirate",
  "Ryle's Tube Aspirate",
  "Gastric Drainage",
  "Gastrostomy Output",
  "Abdominal Drain",
  "Pleural Space",
  "Mediastinum",
  "Blood Loss",
  "Other Output",
];

const sourceOptions: SourceFilter[] = [
  "All sources",
  "Manual entry",
  "Medication administration",
  "Blood administration",
  "Urine assessment",
  "Stool assessment",
  "Emesis assessment",
  "Drain assessment",
  "Infusion pump",
];

const captureSourceOptions: IcuIntakeOutput["source"][] = sourceOptions.filter((source): source is IcuIntakeOutput["source"] => source !== "All sources");

const matrixRows: MatrixRow[] = [
  { label: "Intake", type: "section" },
  ...intakeCategories.map((label) => ({ label, type: "category" as const, kind: "Intake" as const })),
  { label: "Intake total", type: "total", kind: "Intake" },
  { label: "Output", type: "section" },
  ...outputCategories.flatMap((label): MatrixRow[] => {
    if (label === "Pleural Space") {
      return [
        { label: "Chest Drainage", type: "group", kind: "Output" },
        { label, type: "category", kind: "Output", subRow: true },
      ];
    }
    if (label === "Mediastinum") return [{ label, type: "category", kind: "Output", subRow: true }];
    return [{ label, type: "category", kind: "Output" }];
  }),
  { label: "Output total", type: "total", kind: "Output" },
  { label: "Intake/Output", type: "net" },
];

export function IntakeOutputWorkspace(props: IntakeOutputWorkspaceProps = {}) {
  return (
    <React.Suspense fallback={<FluidWorkspaceLoading />}>
      <IntakeOutputWorkspaceInner {...props} />
    </React.Suspense>
  );
}

function IntakeOutputWorkspaceInner({
  entryOnly = false,
  initialPatientId,
  lockedPatientId,
  initialView = "Hourly",
  initialMode = "Table",
  forceFluidBalanceView,
}: IntakeOutputWorkspaceProps) {
  const searchParams = useSearchParams();
  const queryPatientId = searchParams.get("patientId") ?? undefined;
  const isFluidBalanceView = !entryOnly && (forceFluidBalanceView ?? searchParams.get("view") === "fluid-balance");
  const [patientId, setPatientId] = React.useState(lockedPatientId ?? initialPatientId ?? queryPatientId ?? icuPatients[0]?.id ?? "");
  const [view, setView] = React.useState<IoView>(initialView);
  const [mode, setMode] = React.useState<IoMode>(initialMode);
  const [selectedDate, setSelectedDate] = React.useState(selectedToday);
  const [fromDate, setFromDate] = React.useState(selectedFromDate);
  const [toDate, setToDate] = React.useState(selectedToday);
  const [timeWindow, setTimeWindow] = React.useState<TimeWindow>("All time");
  const [customStartTime, setCustomStartTime] = React.useState("06:00");
  const [customEndTime, setCustomEndTime] = React.useState("17:30");
  const [hourFilter, setHourFilter] = React.useState<(typeof hourOptions)[number]>("All hours");
  const [sourceFilter, setSourceFilter] = React.useState<SourceFilter>("All sources");
  const [query, setQuery] = React.useState("");
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [manualRows, setManualRows] = React.useState<IcuIntakeOutput[]>([]);
  const [activeCell, setActiveCell] = React.useState<ActiveCell>(null);
  const [draft, setDraft] = React.useState<IoDraft>({
    kind: "Intake",
    category: "IV Fluids",
    component: "Normal saline",
    quantity: "100",
    route: "IV",
    source: getCaptureSourceForIoCategory("Intake", "IV Fluids"),
    date: selectedToday,
    time: "12:00",
    comment: "",
  });

  const selectedPatient = icuPatients.find((patient) => patient.id === (lockedPatientId ?? patientId)) ?? icuPatients[0];
  const allRows = React.useMemo(() => [...manualRows, ...intakeOutputRows.map(normalizeIoCategory)], [manualRows]);

  const scopedRows = React.useMemo(() => {
    const text = query.trim().toLowerCase();
    return allRows.filter((row) => {
      const inPatient = row.patientId === selectedPatient.id;
      const inDate = view === "Cumulative" ? row.date >= fromDate && row.date <= toDate : row.date === selectedDate;
      const inTime = isInTimeWindow(row, timeWindow, customStartTime, customEndTime);
      const inHour = hourFilter === "All hours" || row.time.slice(0, 2) === hourFilter.slice(0, 2);
      const inSource = sourceFilter === "All sources" || row.source === sourceFilter;
      const inText = !text || [row.component, row.category, row.route, row.note, row.nurse, row.source].some((value) => value.toLowerCase().includes(text));
      return inPatient && inDate && inTime && inHour && inSource && inText;
    });
  }, [allRows, customEndTime, customStartTime, fromDate, hourFilter, query, selectedDate, selectedPatient.id, sourceFilter, timeWindow, toDate, view]);

  const buckets = React.useMemo(() => buildBuckets(view, selectedDate, scopedRows), [scopedRows, selectedDate, view]);
  const totals = React.useMemo(() => summarizeRows(scopedRows), [scopedRows]);
  const previousRows = React.useMemo(() => allRows.filter((row) => row.patientId === selectedPatient.id && row.date < selectedDate), [allRows, selectedDate, selectedPatient.id]);
  const previousBalance = React.useMemo(() => summarizeRows(previousRows).balance, [previousRows]);
  const alerts = React.useMemo(() => buildFluidAlerts(scopedRows, totals.balance), [scopedRows, totals.balance]);
  const graphSeries = React.useMemo(() => buildGraphSeries(scopedRows, buckets), [buckets, scopedRows]);
  const isCumulative = view === "Cumulative";
  const effectiveMode: IoMode = entryOnly ? "Table" : isFluidBalanceView ? "Graph" : mode;

  const resetFilters = () => {
    setSelectedDate(selectedToday);
    setFromDate(selectedFromDate);
    setToDate(selectedToday);
    setTimeWindow("All time");
    setCustomStartTime("06:00");
    setCustomEndTime("17:30");
    setHourFilter("All hours");
    setSourceFilter("All sources");
    setQuery("");
    setView(initialView);
    setMode(initialMode);
    toast.success("Intake/output filters reset");
  };

  const saveManualEntry = () => {
    const quantity = Number(draft.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    const row: IcuIntakeOutput = {
      id: `io-manual-${Date.now()}`,
      patientId: selectedPatient.id,
      date: draft.date,
      time: draft.time,
      shift: getShift(draft.time),
      kind: draft.kind,
      category: draft.category,
      component: draft.component.trim() || draft.category,
      quantityMl: quantity,
      route: draft.route.trim() || draft.category,
      source: getCaptureSourceForIoCategory(draft.kind, draft.category),
      status: "Pending review",
      intakeType: draft.kind === "Intake" ? draft.category : "",
      intakeMl: draft.kind === "Intake" ? quantity : 0,
      outputType: draft.kind === "Output" ? draft.category : "",
      outputMl: draft.kind === "Output" ? quantity : 0,
      balanceMl: draft.kind === "Intake" ? quantity : -quantity,
      nurse: selectedPatient.assignedWardNurse,
      capturedAt: draft.time,
      note: draft.comment.trim() || "Manual bedside fluid balance entry",
    };

    setManualRows((rows) => [row, ...rows]);
    setSelectedDate(row.date);
    setFromDate((current) => (row.date < current ? row.date : current));
    setToDate((current) => (row.date > current ? row.date : current));
    setActiveCell({ title: row.category, bucket: row.time, total: row.quantityMl, rows: [row] });
    setQuickAddOpen(false);
    toast.success("Intake/output entry added");
  };

  const changeDraftKind = (kind: IcuIntakeOutput["kind"]) => {
    const defaults = getIoDraftDefaults(kind);
    setDraft((current) => ({
      ...current,
      kind,
      ...defaults,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <IoCollapsiblePanel
            summary={`${selectedPatient.bedNo} - ${selectedPatient.patientName} | ${view} | ${timeWindow} | ${scopedRows.length} row(s)`}
            title="Search & filters"
          >
            <div className="p-3">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <FieldBlock label="Patient / bed">
                  {lockedPatientId ? (
                    <div className="flex h-10 items-center justify-between gap-2 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-950">
                      <span className="truncate">{selectedPatient.bedNo} - {selectedPatient.patientName}</span>
                      <Badge tone="info">Locked</Badge>
                    </div>
                  ) : (
                    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-sky-200" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
                      {icuPatients.map((patient) => (
                        <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>
                      ))}
                    </select>
                  )}
                </FieldBlock>
                <FieldBlock label="View">
                  <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-sky-200" value={view} onChange={(event) => setView(event.target.value as IoView)}>
                    {(["Hourly", "12 Hours", "24 Hours", "Cumulative"] satisfies IoView[]).map((option) => <option key={option}>{option}</option>)}
                  </select>
                </FieldBlock>
                <FieldBlock label={view === "Cumulative" ? "From date" : "Date"}>
                  <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-sky-200" value={view === "Cumulative" ? fromDate : selectedDate} onChange={(event) => view === "Cumulative" ? setFromDate(event.target.value) : setSelectedDate(event.target.value)}>
                    {ioDateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </FieldBlock>
                {view === "Cumulative" ? (
                  <FieldBlock label="To date">
                    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-sky-200" value={toDate} onChange={(event) => setToDate(event.target.value)}>
                      {ioDateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </FieldBlock>
                ) : null}
                <FieldBlock label="Shift">
                  <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-sky-200" value={timeWindow} onChange={(event) => setTimeWindow(event.target.value as TimeWindow)}>
                    {timeWindowOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </FieldBlock>
                {timeWindow === "Custom range" ? (
                  <>
                    <FieldBlock label="From time">
                      <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-sky-200" value={customStartTime} onChange={(event) => setCustomStartTime(event.target.value)}>
                        {exactHourOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </FieldBlock>
                    <FieldBlock label="To time">
                      <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-sky-200" value={customEndTime} onChange={(event) => setCustomEndTime(event.target.value)}>
                        {exactHourOptions.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </FieldBlock>
                  </>
                ) : null}
                <FieldBlock className={cn(view === "Cumulative" || timeWindow === "Custom range" ? "" : "xl:col-span-2")} label="Search">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input className="w-full pl-9" placeholder="Component, nurse, source..." value={query} onChange={(event) => setQuery(event.target.value)} />
                  </div>
                </FieldBlock>
                {!entryOnly && !isFluidBalanceView ? (
                  <div className="flex h-10 min-w-0 self-end rounded-md border border-slate-300 bg-white p-1">
                    {(["Table", "Graph"] satisfies IoMode[]).map((option) => (
                      <button
                        className={cn("flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded px-2 text-xs font-semibold transition", mode === option ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100")}
                        key={option}
                        type="button"
                        onClick={() => setMode(option)}
                      >
                        {option === "Table" ? <Table2 className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}{option}
                      </button>
                    ))}
                  </div>
                ) : null}
                <Button className="h-10 justify-center self-end whitespace-nowrap" variant="outline" onClick={resetFilters}>
                  <RefreshCcw className="h-4 w-4" />Reset
                </Button>
              </div>
            </div>
          </IoCollapsiblePanel>
        </div>
        {!isFluidBalanceView ? (
          <Button className="h-10 shrink-0 justify-center whitespace-nowrap lg:mt-0.5" onClick={() => setQuickAddOpen(true)}>
            <Plus className="h-4 w-4" />Add entry
          </Button>
        ) : null}
      </div>

      <div className="space-y-4">
        {entryOnly ? (
          <>
            <FluidBalanceMatrix buckets={buckets} rows={scopedRows} activeCell={activeCell} onSelectCell={setActiveCell} />
            <FluidLedger rows={scopedRows} />
          </>
        ) : isFluidBalanceView ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <FluidBalanceGraph series={graphSeries} />
            <FluidGraphReviewPanel alerts={alerts} previousBalance={previousBalance} rows={scopedRows} series={graphSeries} />
          </div>
        ) : effectiveMode === "Table" ? (
          <FluidBalanceMatrix buckets={buckets} rows={scopedRows} activeCell={activeCell} onSelectCell={setActiveCell} />
        ) : (
          <FluidBalanceGraph series={graphSeries} />
        )}

        {!isFluidBalanceView ? (
          <FluidLedger rows={scopedRows} />
        ) : null}
      </div>

      <QuickFluidEntryDialog
        draft={draft}
        open={quickAddOpen}
        onChange={setDraft}
        onKindChange={changeDraftKind}
        onOpenChange={setQuickAddOpen}
        onSave={saveManualEntry}
        patientLabel={`${selectedPatient.bedNo} - ${selectedPatient.patientName}`}
      />
    </div>
  );
}

function FluidWorkspaceLoading() {
  return (
    <div className="space-y-4">
      <div className="h-32 rounded-md border border-sky-100 bg-sky-50" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="h-24 rounded-md border border-slate-200 bg-slate-50" key={index} />
        ))}
      </div>
    </div>
  );
}

function FluidHeaderMetric({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className="rounded-md border border-white/20 bg-white/15 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase text-sky-100">{label}</div>
      <div className={cn("mt-1 text-lg font-bold text-white", tone === "danger" || tone === "critical" ? "text-rose-50" : "")}>{value}</div>
    </div>
  );
}

function IoCollapsiblePanel({ children, summary, title }: { children: React.ReactNode; summary: string; title: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-slate-50"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-slate-950">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">{summary}</span>
        </span>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
          <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
        </span>
      </button>
      {open ? <div className="border-t border-slate-200 bg-slate-50/80">{children}</div> : null}
    </div>
  );
}

function FieldBlock({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block min-w-0 space-y-1", className)}>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function FluidBalanceMatrix({ buckets, rows, activeCell, onSelectCell }: { buckets: Bucket[]; rows: IcuIntakeOutput[]; activeCell: ActiveCell; onSelectCell: (cell: ActiveCell) => void }) {
  return (
    <Card className="overflow-hidden border-slate-200">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="sticky left-0 z-10 w-44 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-bold uppercase text-slate-600">Component</th>
                {buckets.map((bucket) => (
                  <th className="border-b border-r border-slate-200 px-3 py-3 text-center text-xs font-bold uppercase text-slate-600" key={bucket.key}>
                    <span className="block">{bucket.label}</span>
                    {bucket.sublabel ? <span className="mt-0.5 block text-[10px] font-medium normal-case text-slate-400">{bucket.sublabel}</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr className={cn(row.type === "section" ? "bg-slate-100 font-bold text-slate-900" : row.type === "group" ? "bg-slate-50 font-bold text-slate-800" : row.type === "total" || row.type === "net" ? "bg-slate-100 font-bold" : "bg-white", "border-b border-slate-100")} key={`${row.type}-${row.label}`}>
                  <td className={cn("sticky left-0 z-10 border-r border-slate-200 px-3 py-2", row.type === "section" ? "bg-slate-100 text-slate-900" : row.type === "group" ? "bg-slate-50 text-slate-800" : row.type === "total" || row.type === "net" ? "bg-slate-100 text-slate-950" : "bg-white text-slate-900", row.subRow ? "pl-7 text-sm" : "")}>
                    {row.subRow ? <span className="mr-2 text-slate-400">-</span> : null}{row.label}
                  </td>
                  {buckets.map((bucket) => {
                    if (row.type === "section") return <td className="border-r border-slate-200 bg-slate-100 px-3 py-2" key={bucket.key} />;
                    if (row.type === "group") return <td className="border-r border-slate-200 bg-slate-50 px-3 py-2" key={bucket.key} />;
                    const cellRows = getCellRows(rows, row, bucket);
                    const value = sumCellRows(cellRows, row.type);
                    return (
                      <td className="border-r border-slate-100 px-2 py-2 text-center" key={bucket.key}>
                        <IoQuantityCell
                          bucket={bucket}
                          row={row}
                          rows={cellRows}
                          value={value}
                          active={activeCell?.title === row.label && activeCell.bucket === bucket.label}
                          onSelect={() => onSelectCell({ title: row.label, bucket: bucket.label, total: value, rows: cellRows })}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function IoQuantityCell({ bucket, row, rows, value, active, onSelect }: { bucket: Bucket; row: MatrixRow; rows: IcuIntakeOutput[]; value: number; active: boolean; onSelect: () => void }) {
  const title = rows.length ? rows.map((entry) => `${entry.component}: ${entry.quantityMl} ml at ${entry.time} | ${entry.source} | ${entry.note}`).join("\n") : "No entry";
  const tone = row.type === "net" ? balanceTextClass(value) : "text-slate-800";
  const surface = rows.length ? "bg-white border-slate-200 hover:bg-slate-50" : "bg-white border-transparent text-slate-300";

  return (
    <button
      aria-label={`${row.label} ${bucket.label} ${value} ml`}
      className={cn("min-h-9 w-full rounded-md border px-2 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-200", surface, tone, active ? "ring-2 ring-sky-300" : "")}
      title={title}
      type="button"
      onClick={onSelect}
    >
      {value ? formatSignedForNet(value, row.type) : "-"}
    </button>
  );
}

function FluidBalanceGraph({ series }: { series: GraphPoint[] }) {
  const width = Math.max(760, series.length * 84);
  const height = 300;
  const pad = 36;
  const labelSpace = 24;
  const maxVolume = Math.max(100, ...series.flatMap((point) => [point.intake, point.output]));
  const plotWidth = width - pad * 2;
  const baseline = Math.round((height - labelSpace) / 2);
  const intakePlotHeight = baseline - pad - 10;
  const outputPlotHeight = height - labelSpace - baseline - 10;

  return (
    <Card className="overflow-hidden border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-white">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Fluid Balance Graph</CardTitle>
            <CardDescription>Blue intake is plotted above the baseline and green output below it.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">Intake</Badge>
            <Badge tone="success">Output</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-wrap gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
          <FluidGraphLegendItem color="#0ea5e9" label="Intake above baseline" />
          <FluidGraphLegendItem color="#10b981" label="Output below baseline" />
          <span className="inline-flex items-center gap-2">
            <span className="h-0 w-8 border-t border-dashed border-slate-400" />
            Zero baseline
          </span>
        </div>
        <div className="overflow-x-auto p-4">
          <svg className="block" height={height} role="img" viewBox={`0 0 ${width} ${height}`} width={width}>
            <line stroke="#cbd5e1" strokeDasharray="4 4" x1={pad} x2={width - pad} y1={baseline} y2={baseline} />
            {series.map((point, index) => {
              const x = pad + (series.length <= 1 ? plotWidth / 2 : (index / (series.length - 1)) * plotWidth);
              const intakeHeight = point.intake > 0 ? Math.max(4, (point.intake / maxVolume) * intakePlotHeight) : 0;
              const outputHeight = point.output > 0 ? Math.max(4, (point.output / maxVolume) * outputPlotHeight) : 0;
              return (
                <g key={point.key}>
                  <rect fill="#0ea5e9" height={intakeHeight} rx="4" width="18" x={x - 23} y={baseline - intakeHeight} />
                  <rect fill="#10b981" height={outputHeight} rx="4" width="18" x={x + 5} y={baseline} />
                  <text fill="#475569" fontSize="10" textAnchor="middle" x={x} y={height - 10}>{point.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function FluidGraphLegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function FluidGraphReviewPanel({
  rows,
  alerts,
  series,
  previousBalance,
}: {
  rows: IcuIntakeOutput[];
  alerts: Array<{ title: string; detail: string; tone: StatusTone }>;
  series: GraphPoint[];
  previousBalance: number;
}) {
  const totals = summarizeRows(rows);
  const sourceStats = buildSourceStats(rows).slice(0, 5);
  const fallbackPoint: GraphPoint = { key: "empty", label: "-", intake: 0, output: 0, balance: 0 };
  const peakPositive = series.reduce((best, point) => point.balance > best.balance ? point : best, series[0] ?? fallbackPoint);
  const peakNegative = series.reduce((best, point) => point.balance < best.balance ? point : best, series[0] ?? fallbackPoint);
  const lowUrineCount = rows.filter((row) => row.category === "Urine" && row.quantityMl < 30).length;
  const drainOutput = rows.filter((row) => ["Abdominal Drain", "Pleural Space", "Mediastinum", "Gastric Drainage", "Gastrostomy Output"].includes(row.category)).reduce((sum, row) => sum + row.quantityMl, 0);
  const pendingCount = rows.filter((row) => row.status === "Pending review").length;

  return (
    <div className="space-y-4">
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-white">
          <CardTitle>Balance Review</CardTitle>
          <CardDescription>Doctor/head nurse review summary for the selected date and time window.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <TotalLine label="Current intake" value={`${totals.intake} ml`} tone="info" />
          <TotalLine label="Current output" value={`${totals.output} ml`} tone="success" />
          <TotalLine label="Net balance" value={formatSignedMl(totals.balance)} tone={balanceTone(totals.balance)} />
          <TotalLine label="Previous balance" value={formatSignedMl(previousBalance)} tone={balanceTone(previousBalance)} />
          <TotalLine label={`Peak positive (${peakPositive.label})`} value={formatSignedMl(peakPositive.balance)} tone={balanceTone(peakPositive.balance)} />
          <TotalLine label={`Peak negative (${peakNegative.label})`} value={formatSignedMl(peakNegative.balance)} tone={balanceTone(peakNegative.balance)} />
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-white">
          <CardTitle>Scenario Checks</CardTitle>
          <CardDescription>Common ICU fluid-balance review triggers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <FluidScenarioLine title="Low urine output" detail={lowUrineCount ? `${lowUrineCount} hour(s) below 30 ml` : "No low urine output in selected window"} tone={lowUrineCount ? "danger" : "success"} />
          <FluidScenarioLine title="Drain output" detail={`${drainOutput} ml drain output`} tone={drainOutput > 200 ? "warning" : "success"} />
          <FluidScenarioLine title="Positive balance" detail={formatSignedMl(totals.balance)} tone={totals.balance > 500 ? "warning" : "success"} />
          <FluidScenarioLine title="Pending verification" detail={`${pendingCount} entry(s) pending`} tone={pendingCount ? "info" : "success"} />
          {alerts.map((alert) => (
            <div className={cn("rounded-md border p-3", metricToneClass(alert.tone))} key={alert.title}>
              <div className="text-sm font-bold text-slate-950">{alert.title}</div>
              <div className="mt-1 text-xs text-slate-600">{alert.detail}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-white">
          <CardTitle>Source Sync</CardTitle>
          <CardDescription>Where visible fluid records are coming from.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          {sourceStats.map((stat) => (
            <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" key={stat.source}>
              <span className="text-slate-700">{stat.source}</span>
              <span className="font-bold text-slate-950">{stat.quantity} ml</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function FluidScenarioLine({ title, detail, tone }: { title: string; detail: string; tone: StatusTone }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-md border px-3 py-2", metricToneClass(tone))}>
      <span className="text-sm font-bold text-slate-950">{title}</span>
      <Badge tone={tone}>{detail}</Badge>
    </div>
  );
}

function FluidLedger({ rows }: { rows: IcuIntakeOutput[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-white">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Source Ledger</CardTitle>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">{rows.length} visible</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Time", "Entry", "Quantity", "Status", "Recorded by"].map((heading) => (
                  <th className="border-b border-slate-200 px-3 py-2 text-left" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-b border-slate-100 last:border-0" key={row.id}>
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    <span className="block">{row.time}</span>
                    <span className="text-xs font-medium text-slate-500">{row.date}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">{row.component}</div>
                    <div className="text-xs text-slate-500">{row.kind} | {row.category} | {row.route}</div>
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-900">{row.quantityMl} ml</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">{row.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900">{row.nurse}</div>
                    <div className="text-xs text-slate-500">{row.source}</div>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-slate-500" colSpan={5}>No intake/output records found for the selected filters.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickFluidEntryDialog({
  draft,
  open,
  onChange,
  onKindChange,
  onOpenChange,
  onSave,
  patientLabel,
}: {
  draft: IoDraft;
  open: boolean;
  onChange: (draft: IoDraft) => void;
  onKindChange: (kind: IcuIntakeOutput["kind"]) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  patientLabel: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-sky-700 p-4 text-white">
            <div>
              <Dialog.Title className="text-lg font-bold">Add Intake / Output</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-sky-50">{patientLabel} | source, component, quantity, time, and comment.</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-md p-2 text-sky-50 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50" type="button" aria-label="Close quick add">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <QuickFluidEntry draft={draft} onChange={onChange} onKindChange={onKindChange} onSave={onSave} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QuickFluidEntry({ draft, onChange, onKindChange, onSave }: { draft: IoDraft; onChange: (draft: IoDraft) => void; onKindChange: (kind: IcuIntakeOutput["kind"]) => void; onSave: () => void }) {
  const categories = draft.kind === "Intake" ? intakeCategories : outputCategories;
  const updateCategory = (category: string) => {
    onChange({ ...draft, ...getIoDraftDefaults(draft.kind, category) });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-950">Entry type</div>
          <Badge tone={draft.kind === "Intake" ? "info" : "success"}>{draft.kind}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["Intake", "Output"] satisfies IcuIntakeOutput["kind"][]).map((kind) => (
            <Button className="h-9" key={kind} variant={draft.kind === kind ? "default" : "outline"} onClick={() => onKindChange(kind)}>{kind}</Button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <FieldBlock label={draft.kind === "Intake" ? "Intake source" : "Output source"}>
          <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200" value={draft.category} onChange={(event) => updateCategory(event.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </FieldBlock>
        <FieldBlock label="Component">
          <Input value={draft.component} onChange={(event) => onChange({ ...draft, component: event.target.value })} />
        </FieldBlock>
        <FieldBlock label="Quantity ml">
          <Input inputMode="numeric" value={draft.quantity} onChange={(event) => onChange({ ...draft, quantity: event.target.value })} />
        </FieldBlock>
        <FieldBlock label="Time">
          <Input type="time" value={draft.time} onChange={(event) => onChange({ ...draft, time: event.target.value })} />
        </FieldBlock>
        <FieldBlock label="Date">
          <Input type="date" value={draft.date} onChange={(event) => onChange({ ...draft, date: event.target.value })} />
        </FieldBlock>
        <FieldBlock label="Route">
          <Input value={draft.route} onChange={(event) => onChange({ ...draft, route: event.target.value })} />
        </FieldBlock>
        <FieldBlock className="md:col-span-2" label="Comment">
          <textarea className="min-h-20 w-full rounded-md border border-slate-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-sky-200" value={draft.comment} onChange={(event) => onChange({ ...draft, comment: event.target.value })} />
        </FieldBlock>
      </div>
      <div className="flex justify-end border-t border-slate-200 pt-4">
        <Button className="min-w-[160px]" onClick={onSave}>
          <Plus className="h-4 w-4" />Add entry
        </Button>
      </div>
    </div>
  );
}

function normalizeIoCategory(row: IcuIntakeOutput): IcuIntakeOutput {
  const category = normalizeIoCategoryName(row.kind, row.category, row.component, row.outputType, row.intakeType);
  return {
    ...row,
    category,
    intakeType: row.kind === "Intake" ? category : row.intakeType,
    outputType: row.kind === "Output" ? category : row.outputType,
  };
}

function getIoDraftDefaults(kind: IcuIntakeOutput["kind"], category = kind === "Intake" ? "IV Fluids" : "Urine"): Pick<IoDraft, "category" | "component" | "route" | "source"> {
  const source = getCaptureSourceForIoCategory(kind, category);
  const defaults: Record<string, { component: string; route: string }> = {
    "Oral Intake": { component: "Water / diet intake", route: "Oral" },
    "Enteral Feed / Tube Feed": { component: "Enteral feed", route: "NG / feeding tube" },
    "IV Fluids": { component: "Normal saline", route: "IV" },
    "IV Medication Dilution": { component: "Medication diluent", route: "IV" },
    "Continuous Infusions": { component: "Infusion carrier volume", route: "Infusion" },
    "NTG Pump": { component: "NTG infusion pump", route: "Infusion pump" },
    "Blood & Blood Products": { component: "Blood product unit", route: "Blood transfusion" },
    "Parenteral Nutrition / TPN": { component: "TPN bag", route: "Central line" },
    "Electrolyte Replacement": { component: "Electrolyte infusion", route: "IV" },
    "Irrigation Input": { component: "Irrigation fluid", route: "Irrigation" },
    "Other Intake": { component: "Other intake", route: "As documented" },
    Urine: { component: "Foley catheter", route: "Urinary catheter" },
    Fecal: { component: "Stool", route: "Stool chart" },
    "NG Aspirate": { component: "NG aspirate", route: "NG tube" },
    "Ryle's Tube Aspirate": { component: "Ryle's tube aspirate", route: "Ryle's tube" },
    "Gastric Drainage": { component: "Gastric drainage", route: "Gastric tube" },
    "Gastrostomy Output": { component: "Gastrostomy output", route: "Gastrostomy" },
    "Abdominal Drain": { component: "Abdominal drain", route: "Surgical drain" },
    "Pleural Space": { component: "Pleural chest drain", route: "Pleural drain" },
    Mediastinum: { component: "Mediastinal chest drain", route: "Mediastinal drain" },
    "Blood Loss": { component: "Estimated blood loss", route: "Procedure estimate" },
    "Other Output": { component: "Other output", route: "As documented" },
  };
  return { category, component: defaults[category]?.component ?? category, route: defaults[category]?.route ?? category, source };
}

function getCaptureSourceForIoCategory(kind: IcuIntakeOutput["kind"], category: string): IcuIntakeOutput["source"] {
  if (kind === "Intake") {
    if (category === "Blood & Blood Products") return "Blood administration";
    if (category === "IV Medication Dilution" || category === "Electrolyte Replacement") return "Medication administration";
    if (category === "IV Fluids" || category === "Continuous Infusions" || category === "NTG Pump") return "Infusion pump";
    return "Manual entry";
  }
  if (category === "Urine") return "Urine assessment";
  if (category === "Fecal") return "Stool assessment";
  if (["NG Aspirate", "Ryle's Tube Aspirate", "Gastric Drainage", "Gastrostomy Output", "Abdominal Drain", "Pleural Space", "Mediastinum"].includes(category)) return "Drain assessment";
  return "Manual entry";
}

function normalizeIoCategoryName(kind: IcuIntakeOutput["kind"], category: string, component: string, outputType: string, intakeType: string) {
  const text = `${category} ${component} ${outputType} ${intakeType}`.toLowerCase();

  if (kind === "Intake") {
    if (text.includes("ntg") || text.includes("nitroglycerin")) return "NTG Pump";
    if (text.includes("blood") || text.includes("prbc") || text.includes("ffp") || text.includes("platelet")) return "Blood & Blood Products";
    if (text.includes("medication") || text.includes("medicine") || text.includes("diluent") || text.includes("antibiotic")) return "IV Medication Dilution";
    if (text.includes("infusion") || text.includes("vasopressor") || text.includes("noradrenaline")) return "Continuous Infusions";
    if (text.includes("ng") || text.includes("tube") || text.includes("enteral") || text.includes("feed")) return "Enteral Feed / Tube Feed";
    if (text.includes("tpn") || text.includes("parenteral")) return "Parenteral Nutrition / TPN";
    if (text.includes("electrolyte") || text.includes("potassium") || text.includes("magnesium")) return "Electrolyte Replacement";
    if (text.includes("irrigation") || text.includes("wash")) return "Irrigation Input";
    if (text.includes("iv") || text.includes("fluid") || text.includes("saline") || text.includes("ringer") || text.includes("dextrose") || text.includes("crystalloid")) return "IV Fluids";
    if (text.includes("oral") || text.includes("p.o") || text.includes("supplement") || text.includes("water") || text.includes("juice") || text.includes("ice")) return "Oral Intake";
    return "Other Intake";
  }

  if (text.includes("urine") || text.includes("foley") || text.includes("catheter") || text.includes("urinal")) return "Urine";
  if (text.includes("stool") || text.includes("fecal")) return "Fecal";
  if (text.includes("vomit") || text.includes("emesis")) return "Other Output";
  if (text.includes("ryle")) return "Ryle's Tube Aspirate";
  if (text.includes("ng aspirate")) return "NG Aspirate";
  if (text.includes("gastric")) return "Gastric Drainage";
  if (text.includes("gastrostomy")) return "Gastrostomy Output";
  if (text.includes("mediastinum") || text.includes("mediastinal")) return "Mediastinum";
  if (text.includes("chest drain") || text.includes("pleural")) return "Pleural Space";
  if (text.includes("drain")) return "Abdominal Drain";
  if (text.includes("blood loss") || text.includes("blood")) return "Blood Loss";
  return outputCategories.includes(category) ? category : "Other Output";
}

function TotalLine({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

function buildBuckets(view: IoView, selectedDate: string, rows: IcuIntakeOutput[]): Bucket[] {
  if (view === "Hourly") {
    return Array.from({ length: 24 }, (_, hour) => {
      const label = `${String(hour).padStart(2, "0")}:00`;
      return {
        key: label,
        label,
        match: (row: IcuIntakeOutput) => row.date === selectedDate && Number(row.time.slice(0, 2)) === hour,
      };
    });
  }

  if (view === "12 Hours") {
    return [
      { key: "day", label: "06:00 - 17:30", sublabel: "Day shift", match: (row) => row.date === selectedDate && row.shift === "Day" },
      { key: "night", label: "18:00 - 05:30", sublabel: "Night shift", match: (row) => row.date === selectedDate && row.shift === "Night" },
    ];
  }

  if (view === "24 Hours") {
    return [{ key: selectedDate, label: formatShortDate(selectedDate), sublabel: "24 hour total", match: (row) => row.date === selectedDate }];
  }

  const dates = Array.from(new Set(rows.map((row) => row.date))).sort();
  const safeDates = dates.length ? dates : [selectedDate];
  return safeDates.map((date) => ({
    key: date,
    label: formatShortDate(date),
    sublabel: "Cumulative",
    match: (row: IcuIntakeOutput) => row.date === date,
  }));
}

function getCellRows(rows: IcuIntakeOutput[], matrixRow: MatrixRow, bucket: Bucket) {
  return rows.filter((row) => {
    if (!bucket.match(row)) return false;
    if (matrixRow.type === "category") return row.kind === matrixRow.kind && row.category === matrixRow.label;
    if (matrixRow.type === "total") return row.kind === matrixRow.kind;
    if (matrixRow.type === "net") return true;
    return false;
  });
}

function sumCellRows(rows: IcuIntakeOutput[], type: MatrixRowType) {
  if (type === "net") return rows.reduce((sum, row) => sum + row.balanceMl, 0);
  return rows.reduce((sum, row) => sum + row.quantityMl, 0);
}

function summarizeRows(rows: IcuIntakeOutput[]) {
  const intake = rows.reduce((sum, row) => sum + row.intakeMl, 0);
  const output = rows.reduce((sum, row) => sum + row.outputMl, 0);
  return { intake, output, balance: intake - output };
}

function buildGraphSeries(rows: IcuIntakeOutput[], buckets: Bucket[]) {
  return buckets.map((bucket) => {
    const bucketRows = rows.filter((row) => bucket.match(row));
    const totals = summarizeRows(bucketRows);
    return { key: bucket.key, label: bucket.label, ...totals };
  });
}

function buildFluidAlerts(rows: IcuIntakeOutput[], balance: number): Array<{ title: string; detail: string; tone: StatusTone }> {
  const lowUrine = rows.filter((row) => row.category === "Urine" && row.quantityMl < 30);
  const drainTotal = rows.filter((row) => ["Abdominal Drain", "Pleural Space", "Mediastinum", "Gastric Drainage", "Gastrostomy Output"].includes(row.category)).reduce((sum, row) => sum + row.quantityMl, 0);
  const pending = rows.filter((row) => row.status === "Pending review");
  const alerts: Array<{ title: string; detail: string; tone: StatusTone }> = [];

  if (lowUrine.length) {
    alerts.push({ title: "Low urine output", detail: `${lowUrine.length} hour(s) below 30 ml. Escalate renal/fluid review.`, tone: "danger" });
  }
  if (balance > 500) {
    alerts.push({ title: "Positive balance watch", detail: `${formatSignedMl(balance)} visible balance. Review fluids, vasopressors, and diuretic plan.`, tone: "warning" });
  }
  if (drainTotal > 200) {
    alerts.push({ title: "Drain output rising", detail: `${drainTotal} ml drain output in selected window. Surgical review threshold crossed.`, tone: "warning" });
  }
  if (pending.length) {
    alerts.push({ title: "Pending verification", detail: `${pending.length} entries need review/sign-off.`, tone: "info" });
  }

  return alerts;
}

function buildSourceStats(rows: IcuIntakeOutput[]): Array<{ source: string; quantity: number }> {
  const stats = captureSourceOptions
    .map((source) => ({
      source,
      quantity: rows.filter((row) => row.source === source).reduce((sum, row) => sum + row.quantityMl, 0),
    }))
    .filter((stat) => stat.quantity > 0);

  return stats.length ? stats : [{ source: "No source activity", quantity: 0 }];
}

function getShift(time: string): IcuIntakeOutput["shift"] {
  const hour = Number(time.slice(0, 2));
  return hour >= 6 && hour < 18 ? "Day" : "Night";
}

function isInTimeWindow(row: IcuIntakeOutput, timeWindow: TimeWindow, startTime: string, endTime: string) {
  if (timeWindow === "All time") return true;
  if (timeWindow === "Day shift") return row.shift === "Day";
  if (timeWindow === "Night shift") return row.shift === "Night";

  const rowMinutes = toMinutes(row.time);
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  if (startMinutes <= endMinutes) {
    return rowMinutes >= startMinutes && rowMinutes <= endMinutes;
  }

  return rowMinutes >= startMinutes || rowMinutes <= endMinutes;
}

function toMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function formatSignedMl(value: number) {
  if (value > 0) return `+${value} ml`;
  if (value < 0) return `${value} ml`;
  return "0 ml";
}

function formatSignedForNet(value: number, type: MatrixRowType) {
  return type === "net" ? formatSignedMl(value) : `${value} ml`;
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`));
}

function balanceTone(value: number): StatusTone {
  if (value > 500 || value < -300) return "danger";
  if (value > 300 || value < -150) return "warning";
  return "success";
}

function balanceTextClass(value: number) {
  if (value > 500 || value < -300) return "text-rose-700";
  if (value > 300 || value < -150) return "text-amber-700";
  return "text-slate-800";
}

function metricToneClass(tone: StatusTone) {
  if (tone === "danger" || tone === "critical") return "border-slate-200 border-l-rose-500 bg-white text-rose-700";
  if (tone === "warning") return "border-slate-200 border-l-amber-500 bg-white text-amber-700";
  if (tone === "success") return "border-slate-200 border-l-sky-500 bg-white text-sky-700";
  if (tone === "info") return "border-slate-200 border-l-sky-500 bg-white text-sky-700";
  return "border-slate-200 border-l-slate-300 bg-white text-slate-700";
}
