"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Eye, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

import { diagnosisTypes } from "./data";
import type { LaboratoryResultBlock, LaboratorySummaryRow } from "./types";
import { downloadLaboratoryPdf } from "../report-pdf-utils";

type SortKey = "loinc" | "test" | "orderDate" | "completionDate" | "status";
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const COMPLETED_DATE_STATUSES = new Set(["Report Ready", "Completed", "Reviewed"]);
function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Pending"
      ? "bg-warning/10 text-warning"
      : status === "Completed"
        ? "bg-success/10 text-success"
        : status === "Pending" || status === "Ordered"
          ? "bg-info/10 text-info"
          : "bg-surface-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>{status}</span>;
}
function getCompletedDate(status: string, completionDate?: string) {
  if (status === "Cancelled" || status === "Ordered" || status === "Sample Collected" || status === "Sample Received" || status === "Processing") {
    return "";
  }
  if (COMPLETED_DATE_STATUSES.has(status)) {
    return completionDate || new Date().toLocaleDateString("en-GB");
  }
  return completionDate || "";
}

function compareDates(left: string, right: string) {
  return parseReviewDate(left) - parseReviewDate(right);
}

function parseReviewDate(value: string) {
  const [day, month, year] = value.split("/").map((part) => Number(part));
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

function getSortValue(block: LaboratoryResultBlock, sortKey: SortKey) {
  if (sortKey === "loinc") return block.name.toLowerCase().includes("cbc") ? "11273-0" : "28515-7";
  if (sortKey === "test") return block.name.replace(" - complete blood count", "").replace(" - kidney function test", "");
  if (sortKey === "orderDate") return "12/05/2021";
  if (sortKey === "status") return "Completed";
  return "14/05/2021";
}

type SelectedReportRow = {
  group?: string;
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: "N" | "H" | "L";
};

function getSelectedReportRows(block: LaboratoryResultBlock): SelectedReportRow[] {
  const name = block.name.toLowerCase();
  if (name.includes("cbc")) {
    return [
      { group: "RBC Parameters", parameter: "Hemoglobin", result: "13.6", unit: "g/dL", referenceRange: "13.0 - 17.0", flag: "N" },
      { group: "RBC Parameters", parameter: "RBC Count", result: "4.6", unit: "10^6/µl", referenceRange: "4.5 - 5.5", flag: "N" },
      { group: "RBC Parameters", parameter: "PCV", result: "40.1", unit: "%", referenceRange: "40 - 50", flag: "N" },
      { group: "RBC Parameters", parameter: "MCV", result: "86.8", unit: "fL", referenceRange: "83 - 101", flag: "N" },
      { group: "RBC Parameters", parameter: "MCH", result: "29.5", unit: "pg", referenceRange: "27 - 32", flag: "N" },
      { group: "RBC Parameters", parameter: "MCHC", result: "34", unit: "g/dL", referenceRange: "31.5 - 34.5", flag: "N" },
      { group: "RBC Parameters", parameter: "RDW (CV)", result: "13.1", unit: "%", referenceRange: "11.6 - 14.0", flag: "N" },
      { group: "RBC Parameters", parameter: "RDW-SD", result: "28.5", unit: "fL", referenceRange: "35.1 - 43.9", flag: "L" },
      { group: "WBC Parameters", parameter: "TLC", result: "6.8", unit: "10^3/µl", referenceRange: "4 - 10", flag: "N" },
      { group: "WBC Parameters", parameter: "Neutrophils", result: "64", unit: "%", referenceRange: "40 - 80", flag: "N" },
      { group: "WBC Parameters", parameter: "Lymphocytes", result: "25", unit: "%", referenceRange: "20 - 40", flag: "N" },
      { group: "WBC Parameters", parameter: "Monocytes", result: "9", unit: "%", referenceRange: "2 - 10", flag: "N" },
      { group: "WBC Parameters", parameter: "Eosinophils", result: "2", unit: "%", referenceRange: "0 - 6", flag: "N" },
      { group: "WBC Parameters", parameter: "Basophils", result: "0", unit: "%", referenceRange: "0 - 1", flag: "N" },
      { group: "WBC Parameters", parameter: "Neutrophils, absolute", result: "4.35", unit: "10^3/µl", referenceRange: "2 - 7", flag: "N" },
      { group: "WBC Parameters", parameter: "Lymphocytes, absolute", result: "1.7", unit: "10^3/µl", referenceRange: "1 - 3", flag: "N" },
      { group: "WBC Parameters", parameter: "Monocytes, absolute", result: "0.61", unit: "10^3/µl", referenceRange: "0.2 - 1.0", flag: "N" },
      { group: "WBC Parameters", parameter: "Eosinophils, absolute", result: "0.14", unit: "10^3/µl", referenceRange: "0.02 - 0.5", flag: "N" },
      { group: "WBC Parameters", parameter: "Basophils, absolute", result: "0", unit: "10^3/µl", referenceRange: "0.02 - 0.5", flag: "L" },
      { group: "Platelet Parameters", parameter: "Platelet Count", result: "211", unit: "10^3/µl", referenceRange: "150 - 410", flag: "N" },
      { group: "Platelet Parameters", parameter: "MPV", result: "8.7", unit: "fL", referenceRange: "9.3 - 12.1", flag: "L" },
      { group: "Platelet Parameters", parameter: "PCT", result: "0.2", unit: "%", referenceRange: "0.17 - 0.32", flag: "N" },
      { group: "Platelet Parameters", parameter: "PDW", result: "14.6", unit: "fL", referenceRange: "8.3 - 25.0", flag: "N" },
      { group: "Platelet Parameters", parameter: "P-LCR", result: "25.5", unit: "%", referenceRange: "18 - 50", flag: "N" },
      { group: "Platelet Parameters", parameter: "P-LCC", result: "54", unit: "10^9/L", referenceRange: "44 - 140", flag: "N" },
      { group: "Platelet Parameters", parameter: "Mentzer Index", result: "18.87", unit: "", referenceRange: "> 13", flag: "N" },
    ];
  }
  if (name.includes("kft") || name.includes("kidney function")) {
    return [
      { group: "Main Parameters", parameter: "Serum Creatinine", result: "1.9", unit: "mg/dL", referenceRange: "0.6 - 1.2", flag: "H" },
      { group: "Main Parameters", parameter: "Blood Urea Nitrogen", result: "22", unit: "mg/dL", referenceRange: "7 - 20", flag: "H" },
      { group: "Main Parameters", parameter: "Uric Acid", result: "6.3", unit: "mg/dL", referenceRange: "2.6 - 6.0", flag: "H" },
      { group: "Main Parameters", parameter: "eGFR", result: "58", unit: "mL/min/1.73m2", referenceRange: ">= 90", flag: "L" },
    ];
  }
  return block.rows.map((row) => ({
    group: "Main Parameters",
    parameter: row.parameter,
    result: row.result,
    unit: row.unit,
    referenceRange: row.referenceRange,
    flag: row.flag,
  }));
}

function resultTone(flag: "N" | "H" | "L") {
  if (flag === "H") return "text-danger font-semibold";
  if (flag === "L") return "text-warning font-semibold";
  return "text-success font-medium";
}

export function LaboratoryResultReviewTab({
  resultBlocks: allBlocks,
  diagnosisSearch,
  diagnosisType,
  diagnosisOpen,
  selectedDiagnosisLabel,
  instructionsForLab,
  savedSummaryRows = [],
  onDiagnosisSearchChange,
  onDiagnosisTypeChange,
  onDiagnosisOpenChange,
  onAddDiagnosis,
  onReorderResult,
}: {
  resultBlocks: LaboratoryResultBlock[];
  diagnosisSearch: string;
  diagnosisType: string;
  diagnosisOpen: boolean;
  selectedDiagnosisLabel: string;
  savedSummaryRows?: LaboratorySummaryRow[];
  instructionsForLab: string;
  onDiagnosisSearchChange: (value: string) => void;
  onDiagnosisTypeChange: (value: string) => void;
  onDiagnosisOpenChange: (value: boolean) => void;
  onAddDiagnosis: () => void;
  onEditResult: (name: string) => void;
  onDeleteResult: (id: string) => void;
  onReorderResult: (name: string) => void;
}) {
  const diagnosisOptions = React.useMemo(
    () => [
      { conclusion: "Thrombocytopenic disorder", code: "302215000", type: "Primary" },
      { conclusion: "Iron deficiency anemia", code: "271737000", type: "Secondary" },
      { conclusion: "Leukocytosis", code: "267038008", type: "Differential" },
      { conclusion: "Chronic kidney disease", code: "709044004", type: "Primary" },
      { conclusion: "Hypertension", code: "38341003", type: "Secondary" },
    ],
    [],
  );
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState<(typeof diagnosisOptions)[number] | null>(null);
  const [commentDraft, setCommentDraft] = React.useState(selectedDiagnosisLabel);
  const [confirmedDiagnoses, setConfirmedDiagnoses] = React.useState<Array<{ id: string; type: string; diagnosis: string; snomed: string; comments: string }>>([]);
  const [sortKey, setSortKey] = React.useState<SortKey>("orderDate");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [pageSize, setPageSize] = React.useState(5);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [selectedBlock, setSelectedBlock] = React.useState<LaboratoryResultBlock | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("");

  const visibleBlocks = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allBlocks;
    return allBlocks.filter((block) => `${block.name} ${block.specialty}`.toLowerCase().includes(query));
  }, [allBlocks, searchQuery]);

  const sortedBlocks = React.useMemo(() => {
    const items = [...visibleBlocks];
    items.sort((left, right) => {
      const leftValue = getSortValue(left, sortKey);
      const rightValue = getSortValue(right, sortKey);
      let comparison = 0;

      if (sortKey === "orderDate" || sortKey === "completionDate") {
        comparison = compareDates(leftValue, rightValue);
      } else {
        comparison = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
    return items;
  }, [sortDirection, sortKey, visibleBlocks]);

  const pageCount = Math.max(1, Math.ceil(sortedBlocks.length / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pagedBlocks = React.useMemo(() => {
    const start = currentPage * pageSize;
    return sortedBlocks.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedBlocks]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [searchQuery]);

  React.useEffect(() => {
    if (currentPage !== pageIndex) setPageIndex(currentPage);
  }, [currentPage, pageIndex]);

  const downloadReport = () => {
    const reportBlocks = allBlocks.map((block) => ({
        testName: block.name.replace(" - complete blood count", "").replace(" - kidney function test", ""),
        department: block.specialty,
        sampleCollectedOn: "12/05/2021",
        completedOn: "14/05/2021",
        reportStatus: "Final",
        barcodeNo: `BAR-${block.id}`,
        sampleType: "Blood",
        reportDate: "14/05/2021",
        interpretation: block.name.includes("CBC") ? "CBC pattern suggests anemia and low hematocrit." : "KFT indicates renal function abnormality.",
        rows: getSelectedReportRows(block).map((row) => ({
          testName: block.name,
          parameter: row.parameter,
          value: row.result,
          unit: row.unit,
          referenceRange: row.referenceRange,
          flag: row.flag,
        })),
      }));
    downloadLaboratoryPdf(reportBlocks, "laboratory-reports.pdf");
  };

  const filteredDiagnosisOptions = React.useMemo(() => {
    const query = diagnosisSearch.trim().toLowerCase();
    return diagnosisOptions.filter((item) => {
      const searchMatch = !query || `${item.conclusion} ${item.code}`.toLowerCase().includes(query);
      const typeMatch = !diagnosisType || item.type === diagnosisType;
      return searchMatch && typeMatch;
    });
  }, [diagnosisOptions, diagnosisSearch, diagnosisType]);

  const requestSort = (nextKey: SortKey) => {
    setPageIndex(0);
    if (sortKey === nextKey) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  };

  React.useEffect(() => {
    if (!selectedDiagnosis && filteredDiagnosisOptions.length) setSelectedDiagnosis(filteredDiagnosisOptions[0]);
  }, [filteredDiagnosisOptions, selectedDiagnosis]);

  const openDiagnosisDialog = () => {
    setSelectedDiagnosis(null);
    setCommentDraft("");
    onDiagnosisTypeChange("");
    onDiagnosisOpenChange(true);
  };

  const closeDiagnosisDialog = () => {
    onDiagnosisOpenChange(false);
    setSelectedDiagnosis(null);
    setCommentDraft("");
  };

  const openBlockView = (block: LaboratoryResultBlock) => setSelectedBlock(block);
  const closeBlockView = () => setSelectedBlock(null);

  const selectedReportName = selectedBlock ? selectedBlock.name.replace(" - complete blood count", "").replace(" - kidney function test", "") : "";
  const selectedReportStatus = "Final";
  const isCbc = Boolean(selectedBlock?.name.toLowerCase().includes("cbc"));
  const selectedSpecimen = React.useMemo(() => {
    const normalized = selectedBlock ? selectedBlock.name.toLowerCase() : "";
    const matched = savedSummaryRows.find((row) => row.name.toLowerCase().includes(normalized) || normalized.includes(row.name.toLowerCase()));
    return matched?.specimen ?? "Blood";
  }, [savedSummaryRows, selectedBlock]);

  const groupedRows = React.useMemo(() => {
    if (!selectedBlock || !isCbc) return [];
    return getSelectedReportRows(selectedBlock).reduce<Record<string, SelectedReportRow[]>>((acc, row) => {
      const groupName = row.group ?? "Main Parameters";
      acc[groupName] = [...(acc[groupName] ?? []), row];
      return acc;
    }, {});
  }, [isCbc, selectedBlock]);

  return (
    <div className="space-y-4">
     <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-3 sm:flex-row sm:items-end">
            
             <div className="flex-1 space-y-1">
               <span className="text-xs font-medium text-muted-foreground">Search</span>
               <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input className="pl-9" value={searchQuery}
               onChange={(event) => setSearchQuery(event.target.value)}
               placeholder="Search test, code, or department" />
             </div>
             <div className="min-w-0">
               <div className="mb-1 text-xs font-medium text-muted-foreground">Date</div>
               <Input
                 type="date"
                 value={dateFilter}
                 onChange={(event) => setDateFilter(event.target.value)}
               />
             </div>
             <Button
               type="button"
               variant="outline"
               onClick={() => {
                 setSearchQuery("");
                 setDateFilter("");
               }}
             >
               Reset
             </Button>
           </div>
     

      <div className="overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-[180px] px-3 py-3">
                <button className="inline-flex items-center gap-1.5" type="button" onClick={() => requestSort("loinc")}>
                  LOINC Code
                  {sortKey === "loinc" ? sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
                </button>
              </th>
              <th className="w-[220px] px-3 py-3">
                <button className="inline-flex items-center gap-1.5" type="button" onClick={() => requestSort("test")}>
                  Test
                  {sortKey === "test" ? sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
                </button>
              </th>
              <th className="w-[160px] px-3 py-3">
                <button className="inline-flex items-center gap-1.5" type="button" onClick={() => requestSort("orderDate")}>
                  Order Date
                  {sortKey === "orderDate" ? sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
                </button>
              </th>
              <th className="w-[160px] px-3 py-3">
                <button className="inline-flex items-center gap-1.5" type="button" onClick={() => requestSort("completionDate")}>
                  Order completion Date
                  {sortKey === "completionDate" ? sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
                </button>
              </th>
              <th className="w-[160px] px-3 py-3">
                <button className="inline-flex items-center gap-1.5" type="button" onClick={() => requestSort("status")}>
                  Status
                {sortKey === "status" ? sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
                </button>
              </th>
              <th className="w-[180px] px-3 py-3">Action</th>
              <th className="w-[120px] px-3 py-3">
                              <Button type="button" variant="outline" size="sm" onClick={downloadReport}>
                                <Download className="h-4 w-4" />
                                Download All Reports
                              </Button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedBlocks.length ? pagedBlocks.map((block) => {
                            return (
                              <React.Fragment key={block.id}>
                                <tr className="border-t border-border align-top">
                                  <td className="w-[180px] px-3 py-3 text-xs text-muted-foreground">{block.name.toLowerCase().includes("cbc") ? "11273-0" : "28515-7"}</td>
                                  <td className="w-[220px] px-3 py-3">
                                    <div className="font-medium text-foreground">{block.name.replace(" - complete blood count", "").replace(" - kidney function test", "")}</div>
                                    <div className="text-xs text-muted-foreground">{block.specialty}</div>
                                  </td>
                                  {/* <td className="px-3 py-3 text-muted-foreground">{primaryRow?.unit ?? "-"}</td>
                                  <td className="px-3 py-3">
                                    <div className={["font-semibold", hasHigh ? "text-danger" : hasLow ? "text-warning" : "text-foreground"].join(" ")}>
                                      {primaryRow?.result ?? "-"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-muted-foreground">{primaryRow?.referenceRange ?? "-"}</td> */}
                                  <td className="w-[160px] px-3 py-3 text-muted-foreground">12/05/2021</td>
                                  <td className="w-[160px] px-3 py-3 text-muted-foreground">14/05/2021</td>
                                  <td className="px-3 py-3">
                                    <StatusPill status="Completed" />
                                  </td>
                                  <td className="w-[180px] px-3 py-3">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                      <Button type="button" variant="outline" size="sm" onClick={() => onReorderResult(block.name)}>
                                        <ArrowUpDown className="h-4 w-4" />
                                        {/* Reorder */}
                                      </Button>
                                      <Button type="button" variant="outline" size="sm" onClick={() => {
                                        downloadLaboratoryPdf([
                                          {
                                            testName: block.name.replace(" - complete blood count", "").replace(" - kidney function test", ""),
                                            department: block.specialty,
                                            sampleCollectedOn: "12/05/2021",
                                            completedOn: "14/05/2021",
                                            reportStatus: "Final",
                                            barcodeNo: `BAR-${block.id}`,
                                            sampleType: "Blood",
                                            reportDate: "14/05/2021",
                                            interpretation: block.name.includes("CBC") ? "CBC pattern suggests anemia and low hematocrit." : "KFT indicates renal function abnormality.",
                                            rows: getSelectedReportRows(block).map((row) => ({
                                              testName: block.name,
                                              parameter: row.parameter,
                                              value: row.result,
                                              unit: row.unit,
                                              referenceRange: row.referenceRange,
                                              flag: row.flag,
                                            })),
                                          },
                                        ], "pathology-report.pdf", "PATHOLOGY REPORT");
                                      }}>
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button type="button" variant="outline" size="sm" onClick={() => openBlockView(block)}>
                                        <Eye className="h-4 w-4"/>
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          }) : (
                            <tr>
                              <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                                No result review records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-white px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            {sortedBlocks.length} records - Page {currentPage + 1} of {pageCount}
          </span>
          <label className="flex items-center gap-2">
            <span>Rows</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPageIndex(0);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button size="sm" variant="outline" onClick={() => setPageIndex(0)} disabled={currentPage === 0} aria-label="First page">
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPageIndex((current) => Math.max(0, current - 1))} disabled={currentPage === 0}>
            Previous
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))} disabled={currentPage >= pageCount - 1}>
            Next
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPageIndex(pageCount - 1)} disabled={currentPage >= pageCount - 1} aria-label="Last page">
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={openDiagnosisDialog}>
          Add Diagnosis
        </Button>
        {/* <Button type="button">Save</Button> */}
      </div>

      <div className="rounded-md border border-border bg-surface-muted/30 p-4">
        <div className="mb-3 text-sm font-semibold text-foreground">Selected Diagnosis</div>
        {confirmedDiagnoses.length ? (
          <div className="overflow-hidden rounded-md border border-border bg-white">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Diagnosis</th>
                  <th className="px-3 py-2 text-left">SNOMED CT</th>
                  <th className="px-3 py-2 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {confirmedDiagnoses.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">{item.type}</td>
                    <td className="px-3 py-2 text-foreground">{item.diagnosis}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.snomed}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.comments || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No diagnosis selected yet.</div>
        )}
      </div>

      <Drawer
        open={Boolean(selectedBlock)}
        onOpenChange={(open) => {
          if (!open) closeBlockView();
        }}
        title={selectedBlock ? selectedReportName : "Result preview"}
        description={selectedBlock ? `${selectedBlock.specialty} • Report status: ${selectedReportStatus} • Sample Name: ${selectedBlock.specimen}` : "Static result preview"}
      >
        {selectedBlock ? (
          <div className="space-y-4">
            {isCbc ? (
              <div className="space-y-4">
                {Object.entries(groupedRows).map(([groupName, rows]) => (
                  <div key={groupName} className="overflow-hidden rounded-md border border-border">
                    <div className="border-b border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-foreground">{groupName}</div>
                    <table className="w-full table-fixed border-collapse text-left text-sm">
                      <thead className="bg-surface-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="w-[240px] px-3 py-2">Test Parameter</th>
                          <th className="w-[160px] px-3 py-2">Result</th>
                          <th className="w-[140px] px-3 py-2">Unit</th>
                          <th className="w-[180px] px-3 py-2">Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.parameter} className="border-t border-border">
                            <td className="px-3 py-2 font-medium text-foreground">{row.parameter}</td>
                            <td className={`px-3 py-2 ${resultTone(row.flag)}`}>{row.result}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.unit}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.referenceRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full table-fixed border-collapse text-left text-sm">
                  <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="w-[240px] px-3 py-2">Parameter</th>
                      <th className="w-[160px] px-3 py-2">Result</th>
                      <th className="w-[140px] px-3 py-2">Unit</th>
                      <th className="w-[180px] px-3 py-2">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSelectedReportRows(selectedBlock).map((row) => (
                      <tr key={row.parameter} className="border-t border-border">
                        <td className="px-3 py-2 font-medium text-foreground">{row.parameter}</td>
                        <td className={`px-3 py-2 ${resultTone(row.flag)}`}>{row.result}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.unit}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.referenceRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={diagnosisOpen}
        onOpenChange={(open) => {
          if (!open) closeDiagnosisDialog();
        }}
        title="Add Diagnosis"
        className="w-[calc(100vw-2rem)] max-w-4xl"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeDiagnosisDialog}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedDiagnosis) {
                  setConfirmedDiagnoses((current) => [
                    {
                      id: `${selectedDiagnosis.code}-${Date.now()}`,
                      type: selectedDiagnosis.type,
                      diagnosis: selectedDiagnosis.conclusion,
                      snomed: selectedDiagnosis.code,
                      comments: commentDraft,
                    },
                    ...current,
                  ]);
                  onAddDiagnosis();
                  closeDiagnosisDialog();
                }
              }}
            >
              Add Diagnosis
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
            <div className="min-w-0">
              <Input value={diagnosisSearch} onChange={(event) => onDiagnosisSearchChange(event.target.value)} placeholder="Search by clinical conclusion or SNOMED code" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 text-xs font-medium text-muted-foreground">Diagnosis Type</div>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0" value={diagnosisType} onChange={(event) => onDiagnosisTypeChange(event.target.value)}>
                <option value="">All Types</option>
                {diagnosisTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Select</th>
                  <th className="px-3 py-2 text-left">Clinical Conclusion</th>
                  <th className="px-3 py-2 text-left">SNOMED CT Code</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiagnosisOptions.map((item) => {
                  const checked = selectedDiagnosis?.code === item.code;
                  return (
                    <tr key={item.code} className={checked ? "bg-primary/5" : "border-t border-border"}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={checked}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedDiagnosis(item);
                            } else if (selectedDiagnosis?.code === item.code) {
                              setSelectedDiagnosis(null);
                            }
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 text-foreground">{item.conclusion}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.code}</td>
                    </tr>
                  );
                })}
                {!filteredDiagnosisOptions.length ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                      No diagnosis found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <div className="text-xs font-medium text-muted-foreground">Comments</div>
              <textarea className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-border focus:ring-0" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Enter comments" />
            </label>
          </div>
        </div>
      </Drawer>
    </div>
  );
}








