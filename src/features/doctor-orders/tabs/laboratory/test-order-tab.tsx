"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { groupedTests, priorities, specimenSources, testList, visitProblems } from "./data";
import type { LaboratoryIndicationType, LaboratoryPriority, LaboratoryOrderHistory, LaboratoryRequestType, LaboratorySex, LaboratoryTest } from "./types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">{children}</div>;
}

function CheckboxRow({ label, checked, indent = false, onToggle }: { label: string; checked?: boolean; indent?: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={["flex w-full items-center gap-2 border-b border-border/60 py-2 text-left text-sm last:border-0", indent ? "pl-5 text-xs text-muted-foreground" : "text-foreground"].join(" ")}
    >
      <span className={["flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border", checked ? "border-primary bg-primary" : "border-border bg-white"].join(" ")}>
        {checked ? <span className="h-1.5 w-1.5 rounded-[1px] bg-white" /> : null}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function SelectField({ value, onChange, options }: { value: LaboratoryPriority; onChange: (value: LaboratoryPriority) => void; options: LaboratoryPriority[] }) {
  return (
    <select
      className="h-9 w-full rounded-md border border-input px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0"
      value={value}
      onChange={(event) => onChange(event.target.value as LaboratoryPriority)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

type SortState = { key: string; direction: "asc" | "desc" };

type SelectedTestRow = {
  id: string;
  selectedTests: string;
  type: string;
  department: string;
  specimenSource: string;
  fastingStatus: boolean;
  priority: LaboratoryPriority;
};

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

function getSortedItems<T>(items: T[], sort: SortState, getValue: (item: T) => string) {
  return [...items].sort((left, right) => {
    const comparison = compareText(getValue(left), getValue(right));
    return sort.direction === "asc" ? comparison : -comparison;
  });
}
export function LaboratoryTestOrderTab({
  search,
  onSearchChange,
  filteredTests,
  departmentFilter = "All",
  onDepartmentFilterChange = () => {},
  selectedTestIds,
  selectedGroupIds,
  patientName = "",
  onPatientNameChange = () => {},
  uhid = "",
  onUhidChange = () => {},
  admissionNo = "",
  onAdmissionNoChange = () => {},
  age = "",
  onAgeChange = () => {},
  sex = "Female",
  onSexChange = () => {},
  wardBedNo = "",
  onWardBedNoChange = () => {},
  consultant = "",
  onConsultantChange = () => {},
  requestingDoctor = "",
  onRequestingDoctorChange = () => {},
  clinicalDiagnosis = "",
  onClinicalDiagnosisChange = () => {},
  indicationType = "Therapeutic",
  onIndicationTypeChange = () => {},
  surgicalProcedure = "",
  onSurgicalProcedureChange = () => {},
  previousTransfusion = "No",
  onPreviousTransfusionChange = () => {},
  previousTransfusionDetails = "",
  onPreviousTransfusionDetailsChange = () => {},
  previousReaction = "No",
  onPreviousReactionChange = () => {},
  previousReactionDetails = "",
  onPreviousReactionDetailsChange = () => {},
  pregnancies = "N/A",
  onPregnanciesChange = () => {},
  miscarriage = "",
  onMiscarriageChange = () => {},
  stillBirth = "",
  onStillBirthChange = () => {},
  erythroblastosis = "",
  onErythroblastosisChange = () => {},
  antibodiesDetected = "No",
  onAntibodiesDetectedChange = () => {},
  antibodyNames = "",
  onAntibodyNamesChange = () => {},
  patientBloodGroup = "",
  onPatientBloodGroupChange = () => {},
  patientRh = "",
  onPatientRhChange = () => {},
  groupScreenDate = "",
  onGroupScreenDateChange = () => {},
  wbc = "",
  onWbcChange = () => {},
  rbc = "",
  onRbcChange = () => {},
  hb = "",
  onHbChange = () => {},
  pcv = "",
  onPcvChange = () => {},
  platelets = "",
  onPlateletsChange = () => {},
  pt = "",
  onPtChange = () => {},
  ptt = "",
  onPttChange = () => {},
  otherLabs = "",
  onOtherLabsChange = () => {},
  requestType = "Routine",
  onRequestTypeChange = () => {},
  requiredDate = "",
  onRequiredDateChange = () => {},
  requiredTime = "",
  onRequiredTimeChange = () => {},
  natureOfEmergency = "",
  onNatureOfEmergencyChange = () => {},
  consentExplained = true,
  onConsentExplainedChange = () => {},
  doctorSignature = "",
  onDoctorSignatureChange = () => {},
  consentText = "",
  onConsentTextChange = () => {},
  errors = [],
  problems,
  newProblem,
  onNewProblemChange,
  problemListVisible,
  activeProblemView,
  onProblemListVisibleChange,
  onActiveProblemViewChange,
  onAddProblem,
  onToggleTest,
  onToggleGroup,
  specimenSourceById,
  onSpecimenSourceChange,
  priority,
  onPriorityChange,
  fasting,
  onFastingChange,
  clinicalNotes,
  onClinicalNotesChange,
  instructionsForLab,
  onInstructionsForLabChange,
  collectionDate,
  onCollectionDateChange,
  collectionTime,
  onCollectionTimeChange,
  onOpenSummary,
  onSave,
  onSaveAndBill,
  onAddToBill,
  onReorderPrevious,
  onDownloadAllReports,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filteredTests: LaboratoryTest[];
  departmentFilter?: string;
  onDepartmentFilterChange?: (value: string) => void;
  selectedTestIds: string[];
  selectedGroupIds: string[];
   patientName?: string;
   onPatientNameChange?: (value: string) => void;
   uhid?: string;
   onUhidChange?: (value: string) => void;
   admissionNo?: string;
   onAdmissionNoChange?: (value: string) => void;
   age?: string;
   onAgeChange?: (value: string) => void;
   sex?: LaboratorySex;
   onSexChange?: (value: LaboratorySex) => void;
   wardBedNo?: string;
   onWardBedNoChange?: (value: string) => void;
   consultant?: string;
   onConsultantChange?: (value: string) => void;
   requestingDoctor?: string;
   onRequestingDoctorChange?: (value: string) => void;
   clinicalDiagnosis?: string;
   onClinicalDiagnosisChange?: (value: string) => void;
   indicationType?: LaboratoryIndicationType;
   onIndicationTypeChange?: (value: LaboratoryIndicationType) => void;
   surgicalProcedure?: string;
   onSurgicalProcedureChange?: (value: string) => void;
   previousTransfusion?: string;
   onPreviousTransfusionChange?: (value: string) => void;
   previousTransfusionDetails?: string;
   onPreviousTransfusionDetailsChange?: (value: string) => void;
   previousReaction?: string;
   onPreviousReactionChange?: (value: string) => void;
   previousReactionDetails?: string;
   onPreviousReactionDetailsChange?: (value: string) => void;
   pregnancies?: string;
   onPregnanciesChange?: (value: string) => void;
   miscarriage?: string;
   onMiscarriageChange?: (value: string) => void;
   stillBirth?: string;
   onStillBirthChange?: (value: string) => void;
   erythroblastosis?: string;
   onErythroblastosisChange?: (value: string) => void;
   antibodiesDetected?: string;
   onAntibodiesDetectedChange?: (value: string) => void;
   antibodyNames?: string;
   onAntibodyNamesChange?: (value: string) => void;
   patientBloodGroup?: string;
   onPatientBloodGroupChange?: (value: string) => void;
   patientRh?: string;
   onPatientRhChange?: (value: string) => void;
   groupScreenDate?: string;
   onGroupScreenDateChange?: (value: string) => void;
   wbc?: string;
   onWbcChange?: (value: string) => void;
   rbc?: string;
   onRbcChange?: (value: string) => void;
   hb?: string;
   onHbChange?: (value: string) => void;
   pcv?: string;
   onPcvChange?: (value: string) => void;
   platelets?: string;
   onPlateletsChange?: (value: string) => void;
   pt?: string;
   onPtChange?: (value: string) => void;
   ptt?: string;
   onPttChange?: (value: string) => void;
   otherLabs?: string;
   onOtherLabsChange?: (value: string) => void;
   requestType?: LaboratoryRequestType;
   onRequestTypeChange?: (value: LaboratoryRequestType) => void;
   requiredDate?: string;
   onRequiredDateChange?: (value: string) => void;
   requiredTime?: string;
   onRequiredTimeChange?: (value: string) => void;
   natureOfEmergency?: string;
   onNatureOfEmergencyChange?: (value: string) => void;
   consentExplained?: boolean;
   onConsentExplainedChange?: (value: boolean) => void;
   doctorSignature?: string;
   onDoctorSignatureChange?: (value: string) => void;
   consentText?: string;
   onConsentTextChange?: (value: string) => void;
  errors?: string[];
  problems?: string[];
  newProblem?: string;
  onNewProblemChange?: (value: string) => void;
  problemListVisible?: boolean;
  activeProblemView?: "Active" | "Find";
  onProblemListVisibleChange?: (value: boolean) => void;
  onActiveProblemViewChange?: (value: "Active" | "Find") => void;
  onAddProblem?: () => void;
  onToggleTest?: (id: string) => void;
  onToggleGroup?: (id: string) => void;
  specimenSourceById?: Record<string, string>;
  onSpecimenSourceChange?: (id: string, value: string) => void;
  priority?: LaboratoryPriority;
  onPriorityChange?: (value: LaboratoryPriority) => void;
  fasting?: boolean;
  onFastingChange?: (value: boolean) => void;
  clinicalNotes?: string;
  onClinicalNotesChange?: (value: string) => void;
  instructionsForLab?: string;
  onInstructionsForLabChange?: (value: string) => void;
  collectionDate?: string;
  onCollectionDateChange?: (value: string) => void;
  collectionTime?: string;
  onCollectionTimeChange?: (value: string) => void;
  onOpenSummary?: () => void;
  onSave?: () => void;
  onSaveAndBill?: () => void;
  onAddToBill?: () => void;
  onReorderPrevious?: (historyId: string) => void;
  onDownloadAllReports?: () => void;
}) {
  const historyOptions: LaboratoryOrderHistory[] = [
    { id: "hist-cbc", label: "CBC (12 Apr 2026)", selectedTestIds: ["cbc"], selectedGroupIds: [] },
    { id: "hist-lft", label: "LFT (02 Mar 2025)", selectedTestIds: ["lft"], selectedGroupIds: ["liver"] },
    { id: "hist-kft", label: "KFT (02 Mar 2025)", selectedTestIds: ["kft"], selectedGroupIds: ["renal"] },
  ];
  const doctorSuggestions = ["Dr. Kavita Rao", "Dr. Aman Verma", "Dr. Priya Singh", "Dr. Rohit Mehta", "Dr. Neha Sharma", "Dr. Sandeep Yadav"];
  const safeProblems = problems ?? [];
  const filteredProblems = React.useMemo(() => {
    const query = (newProblem ?? "").trim().toLowerCase();
    if (!query) return safeProblems;
    return safeProblems.filter((problem) => problem.toLowerCase().includes(query));
  }, [newProblem, safeProblems]);
  const selectedTests = filteredTests.filter((test) => selectedTestIds.includes(test.id));
  const selectedGroups = groupedTests.filter((group) => selectedGroupIds.includes(group.id));
  const [groupSort, setGroupSort] = React.useState<SortState>({ key: "name", direction: "asc" });
  const [testSort, setTestSort] = React.useState<SortState>({ key: "name", direction: "asc" });
  const getSpecimenSource = (id: string) => specimenSourceById?.[id] ?? "Blood";
  const selectedTestRows = React.useMemo<SelectedTestRow[]>(
    () => [
      ...selectedTests.map((test) => ({
        id: test.id,
        selectedTests: test.name,
        type: "Individual Test",
        department: test.department,
        specimenSource: getSpecimenSource(test.id),
        fastingStatus: Boolean(fasting),
        priority: priority ?? "Routine",
      })),
      ...selectedGroups.map((group) => ({
        id: group.id,
        selectedTests: group.name,
        type: "Profile",
        department: group.department,
        specimenSource: getSpecimenSource(group.id),
        fastingStatus: Boolean(fasting),
        priority: priority ?? "Routine",
      })),
    ],
    [fasting, getSpecimenSource, priority, selectedGroups, selectedTests],
  );
  const filteredGroupedTests = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groupedTests;
    return groupedTests.filter((group) => `${group.name}`.toLowerCase().includes(query));
  }, [search]);
  const sortedGroupedTests = React.useMemo(() => getSortedItems(filteredGroupedTests, groupSort, (group) => group.name), [filteredGroupedTests, groupSort]);
  const sortedTests = React.useMemo(() => getSortedItems(filteredTests, testSort, (test) => `${test.name} ${test.description}`), [filteredTests, testSort]);
  const selectedTestColumns = React.useMemo<ColumnDef<SelectedTestRow>[]>(
    () => [
      { accessorKey: "selectedTests", header: "Selected Tests" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "department", header: "Department" },
      {
        accessorKey: "specimenSource",
        header: "Choose Specimen Source",
        cell: ({ row }) => (
          <select
            className="h-9 w-full rounded-md border border-input px-3 text-sm"
            value={row.original.specimenSource}
            onChange={(event) => onSpecimenSourceChange?.(row.original.id, event.target.value)}
          >
            {specimenSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "fastingStatus",
        header: "Choose Fasting Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={!row.original.fastingStatus}
                onChange={() => onFastingChange?.(false)}
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={row.original.fastingStatus}
                onChange={() => onFastingChange?.(true)}
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Choose Priority",
        cell: ({ row }) => (
          <select
            className="h-9 w-full rounded-md border border-input px-3 text-sm"
            value={row.original.priority}
            onChange={(event) => onPriorityChange?.(event.target.value as LaboratoryPriority)}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ),
      },
    ],
    [onFastingChange, onPriorityChange, onSpecimenSourceChange],
  );
  const departmentOptions = [
    "All",
    "Hematology",
    "Biochemistry",
    "Microbiology",
    "Serology",
    "Clinical Pathology",
    "Histopathology",
    "Cytology",
    "Immunology",
    "Molecular Biology",
    "Toxicology",
    "Blood Bank / Transfusion Medicine",
    "Genetics",
  ];

  return (
    <div className="space-y-4">
      {errors.length ? (
        <Card className="border-danger/30 bg-danger/10">
          <CardContent className="space-y-1 p-4">
            <div className="text-sm font-semibold text-foreground">Please fix these validation errors</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      {/* <Card>
        <CardContent className="space-y-4 p-4"> */}
        <div className="grid min-w-0 gap-4 overflow-x-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="grid gap-3">
            <div className="max-w-full overflow-hidden rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <SectionTitle>Clinical Diagnosis</SectionTitle>
                {/* <Button type="button" size="sm" variant="outline" onClick={onAddProblem}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button> */}
                <div className="ml-auto flex overflow-hidden border border-input bg-surface-muted">
                  {(["Active", "Find"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={[
                        "border-l border-input px-3 py-1 text-xs font-medium first:border-l-0",
                        activeProblemView === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                      ].join(" ")}
                      onClick={() => onActiveProblemViewChange?.(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              {activeProblemView === "Find" ? (
                <div className="mt-3">
                  <Input placeholder="Search problem..." value={newProblem} onChange={(event) => onNewProblemChange?.(event.target.value)} />
                </div>
              ) : null}
              <div className="mt-3 max-w-full overflow-hidden border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-surface-muted text-muted-foreground">
                    <tr>
                      <th className="border-r border-border px-2 py-2 text-left">Date</th>
                      <th className="border-r border-border px-2 py-2 text-left">Clinical Dx</th>
                      <th className="px-2 py-2 text-left">Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(problemListVisible ? filteredProblems : []).slice(0, 4).map((problem, index) => (
                      <tr key={problem} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                        <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">12 May 2026</td>
                        <td className="border-t border-r border-border px-2 py-2 text-foreground">{problem}</td>
                        <td className="border-t border-border px-2 py-2 text-muted-foreground">-</td>
                      </tr>
                    ))}
                    {problemListVisible && !filteredProblems.length ? (
                      <tr>
                        <td colSpan={3} className="border-t border-border px-2 py-4 text-center text-muted-foreground">
                          No problems reported
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              
            </div>

            <div className="max-w-full overflow-hidden rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <SectionTitle>Reorder from previous tests</SectionTitle>
                {/* <Button type="button" size="sm" variant="outline" onClick={() => onProblemListVisibleChange(!problemListVisible)}>
                  {problemListVisible ? "Hide" : "Show"}
                </Button> */}
              </div>
              <div className="mt-3 max-w-full overflow-hidden border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-surface-muted text-muted-foreground">
                    <tr>
                      <th className="border-r border-border px-2 py-2 text-left">Date</th>
                      <th className="border-r border-border px-2 py-2 text-left">Test Name</th>
                      <th className="px-2 py-2 text-left">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyOptions.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                        <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">{item.label.split("(")[1]?.replace(")", "") ?? "-"}</td>
                        <td className="border-t border-r border-border px-2 py-2 font-medium text-foreground">{item.label.split(" (")[0]}</td>
                        <td className="border-t border-border px-2 py-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => onReorderPrevious?.(item.id)}>
                            Reorder
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
                            
          </div>
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by entering few characters." />
              </div>
              <select
                className="h-10 min-w-[220px] rounded-md border border-input px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0"
                value={departmentFilter}
                onChange={(event) => onDepartmentFilterChange(event.target.value)}
              >
                {departmentOptions.map((department, index) => (
                  <option key={`${department}-${index}`} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid min-w-0 gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Select grouped tests</span>
                  <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setGroupSort((current) => ({ key: "name", direction: current.direction === "asc" ? "desc" : "asc" }))}>
                    
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-[360px] overflow-auto px-3">
                  {sortedGroupedTests.map((group) => (
                    <CheckboxRow key={group.id} label={group.name} checked={selectedGroupIds.includes(group.id)} onToggle={() => onToggleGroup?.(group.id)} />
                  ))}
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Select tests</span>
                  <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setTestSort((current) => ({ key: "name", direction: current.direction === "asc" ? "desc" : "asc" }))}>
                    
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-[360px] overflow-auto px-3">
                  {sortedTests.map((test) => (
                    <CheckboxRow key={test.id} label={`${test.name} - ${test.description}`} checked={selectedTestIds.includes(test.id)} onToggle={() => onToggleTest?.(test.id)} />
                  ))}
                  {filteredTests.some((test) => test.children?.length) ? (
                    <div className="pl-5">
                      {filteredTests.flatMap((test) => (test.children ?? []).map((child) => <CheckboxRow key={`${test.id}-${child}`} label={child} indent />))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

        </div>
          <div className="grid min-w-0 gap-4">
            <DataTable data={selectedTestRows} columns={selectedTestColumns} />

            <label className="space-y-2">
              <SectionTitle>Instructions</SectionTitle>
              <textarea
                className="min-h-[92px] w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-border focus:ring-0"
                placeholder="Instructions for the lab"
                value={instructionsForLab}
                onChange={(event) => onInstructionsForLabChange?.(event.target.value)}
              />
            </label>
          </div>


          <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-4">
            <div className="text-sm text-muted-foreground">
              {selectedTestIds.length + selectedGroupIds.length} tests selected
              {selectedTestIds.length ? `, ${selectedTestIds.length} test(s)` : ""}
              {selectedGroupIds.length ? `, ${selectedGroupIds.length} group(s)` : ""}
            </div>
            
            <div className="ml-auto flex flex-wrap gap-2">
              {/* <Button type="button" variant="outline" onClick={() => onDownloadAllReports?.()}>
                Download All Reports
              </Button> */}
              <Button type="button" variant="outline" onClick={() => onOpenSummary?.()}>
                View
              </Button>
              <Button type="button"  onClick={() => onSave?.()}>
                Save
              </Button>
              {/* <Button type="button" variant="outline" onClick={onAddToBill}>
                Add to bill
              </Button>
              <Button type="button" onClick={onSaveAndBill}>
                Save & add to bill
              </Button> */}
            </div>
          </div>
      {/* </CardContent>
    </Card> */}
      </div>
  );
}
