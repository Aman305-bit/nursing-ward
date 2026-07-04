"use client";

import * as React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";
import { previousTestOrders, resultBlocks as initialResultBlocks, groupedTests, summaryRows as initialSummaryRows, testList } from "./pathology/data";
import { PathologyCriticalFindingsTab } from "./pathology/critical-findings-tab";
import { PathologyOrderSummaryTab } from "./pathology/order-summary-tab";
import { PathologyResultReviewTab } from "./pathology/result-review-tab";
import { PathologyTestOrderTab } from "./pathology/test-order-tab";
import type { PathologyPriority, PathologyResultBlock, PathologySummaryRow } from "./pathology/types";

type MainTab = "test-order" | "order-summary" | "result-review" | "critical-findings";
type SummarySortKey = keyof Pick<PathologySummaryRow, "name" | "loinc" | "cpt" | "department" | "specimen" | "priority">;

const selectedByDefault = ["cbc", "kft"];
const selectedGroupDefault = ["renal"];

function normalizeSelectionLabel(value: string) {
  return value.toLowerCase().replace(/[-_]/g, " ").trim();
}

function buildPathologySnapshotRows(testIds: string[], groupIds: string[], fallbackRows: PathologySummaryRow[]) {
  const rows: PathologySummaryRow[] = [];

  for (const id of testIds) {
    const test = testList.find((item) => item.id === id);
    if (!test) continue;
    rows.push({
      id: `saved-${test.id}`,
      name: test.name,
      loinc: test.code ?? "-",
      cpt: "-",
      department: test.department,
      specimen: "Blood",
      priority: "Routine" as PathologySummaryRow["priority"],
      status: "Ordered" as PathologySummaryRow["status"],
      orderedBy: "Saved order",
      orderDateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
  }

  for (const id of groupIds) {
    const group = groupedTests.find((item) => item.id === id);
    if (!group) continue;
    rows.push({
      id: `saved-${group.id}`,
      name: group.name,
      loinc: "-",
      cpt: "-",
      department: group.department,
      specimen: "Blood",
      priority: "Routine" as PathologySummaryRow["priority"],
      status: "Ordered" as PathologySummaryRow["status"],
      orderedBy: "Saved order",
      orderDateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
  }

  return rows.length ? rows : fallbackRows;
}

function buildPathologySnapshotBlocks(testIds: string[], groupIds: string[], fallbackBlocks: PathologyResultBlock[]) {
  const blocks: PathologyResultBlock[] = [];

  for (const id of testIds) {
    const test = testList.find((item) => item.id === id);
    if (!test) continue;
    blocks.push({
      id: `saved-${test.id}`,
      name: `${test.name} - ${test.description}`,
      specialty: test.department,
      rows: [{ parameter: test.name, result: "Pending", unit: "-", referenceRange: "-", flag: "N" }],
    });
  }

  for (const id of groupIds) {
    const group = groupedTests.find((item) => item.id === id);
    if (!group) continue;
    blocks.push({
      id: `saved-${group.id}`,
      name: `${group.name} - grouped request`,
      specialty: group.department,
      rows: [{ parameter: group.name, result: "Pending", unit: "-", referenceRange: "-", flag: "N" }],
    });
  }

  return blocks.length ? blocks : fallbackBlocks;
}

function buildSavedPathologyRows(testIds: string[], groupIds: string[]) {
  return buildPathologySnapshotRows(testIds, groupIds, initialSummaryRows);
}

function buildSavedPathologyBlocks(testIds: string[], groupIds: string[]) {
  return buildPathologySnapshotBlocks(testIds, groupIds, initialResultBlocks);
}

export function PathologyTab() {
  const [activeTab, setActiveTab] = React.useState<MainTab>("test-order");
  const [search, setSearch] = React.useState("");
  const [selectedTestIds, setSelectedTestIds] = React.useState<string[]>(selectedByDefault);
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<string[]>(selectedGroupDefault);
  const [savedTestIds, setSavedTestIds] = React.useState<string[]>(selectedByDefault);
  const [savedGroupIds, setSavedGroupIds] = React.useState<string[]>(selectedGroupDefault);
  const [savedSummaryRows, setSavedSummaryRows] = React.useState<PathologySummaryRow[]>(() => buildSavedPathologyRows(selectedByDefault, selectedGroupDefault));
  const [savedResultBlocks, setSavedResultBlocks] = React.useState<PathologyResultBlock[]>(() => buildSavedPathologyBlocks(selectedByDefault, selectedGroupDefault));
  const [savedInstructionsForLab, setSavedInstructionsForLab] = React.useState("");
  const [problemListVisible, setProblemListVisible] = React.useState(true);
  const [activeProblemView, setActiveProblemView] = React.useState<"Active" | "Find">("Active");
  const [problems, setProblems] = React.useState(["Diabetes Type 2", "Hypertension", "Fatigue"]);
  const [newProblem, setNewProblem] = React.useState("");
  const [specimenSourceById, setSpecimenSourceById] = React.useState<Record<string, string>>({});
  const [priority, setPriority] = React.useState<PathologyPriority>("Routine");
  const [fasting, setFasting] = React.useState(false);
  const [clinicalNotes, setClinicalNotes] = React.useState("");
  const [instructionsForLab, setInstructionsForLab] = React.useState("");
  const [collectionDate, setCollectionDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [collectionTime, setCollectionTime] = React.useState(new Date().toTimeString().slice(0, 5));
  const [summarySort, setSummarySort] = React.useState<{ key: SummarySortKey; direction: "asc" | "desc" }>({ key: "name", direction: "asc" });
  const [diagnosisSearch, setDiagnosisSearch] = React.useState("");
  const [diagnosisType, setDiagnosisType] = React.useState("Primary");
  const [diagnosisOpen, setDiagnosisOpen] = React.useState(false);
  const [selectedDiagnosisLabel, setSelectedDiagnosisLabel] = React.useState("");
  const [billingNote, setBillingNote] = React.useState("Orders are ready.");
  const [deleteTarget, setDeleteTarget] = React.useState<PathologySummaryRow | null>(null);

  const selectedCount = selectedTestIds.length + selectedGroupIds.length;

  const filteredTests = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return testList.filter((test) => `${test.name} ${test.description} ${test.code ?? ""}`.toLowerCase().includes(query));
  }, [search]);

  const sortedSummaryRows = React.useMemo(() => {
    return [...savedSummaryRows].sort((left, right) => {
      const leftValue = String(left[summarySort.key]);
      const rightValue = String(right[summarySort.key]);
      const comparison = leftValue.localeCompare(rightValue);
      return summarySort.direction === "asc" ? comparison : -comparison;
    });
  }, [savedSummaryRows, summarySort]);

  const selectedSummaryRows = React.useMemo(() => sortedSummaryRows, [sortedSummaryRows]);
  const selectedResultBlocks = React.useMemo(() => savedResultBlocks, [savedResultBlocks]);

  const addProblem = () => {
    const value = newProblem.trim();
    if (!value) {
      toast.error("Please enter a problem or symptom");
      return;
    }
    setProblems((current) => [value, ...current]);
    setNewProblem("");
    setProblemListVisible(true);
    toast.success("Problem added");
  };

  const toggleTest = (id: string) => {
    setSelectedTestIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const updateSpecimenSource = (id: string, value: string) => {
    setSpecimenSourceById((current) => ({ ...current, [id]: value }));
  };

  const selectHistory = (historyId: string) => {
    const history = previousTestOrders.find((item) => item.id === historyId);
    if (!history) return;
    setSelectedTestIds(history.selectedTestIds);
    setSelectedGroupIds(history.selectedGroupIds);
    toast.success(`${history.label} loaded`);
  };

  const handleOpenSummary = () => {
    if (!selectedSummaryRows.length) {
      toast.info("No matching summary rows found yet");
    }
    setActiveTab("order-summary");
  };

  const commitSavedSelection = () => {
    setSavedTestIds([...selectedTestIds]);
    setSavedGroupIds([...selectedGroupIds]);
    setSavedSummaryRows(buildSavedPathologyRows(selectedTestIds, selectedGroupIds));
    setSavedResultBlocks(buildSavedPathologyBlocks(selectedTestIds, selectedGroupIds));
    setSavedInstructionsForLab(instructionsForLab);
  };

  const saveOrder = () => {
    commitSavedSelection();
    setBillingNote("Pathology order saved successfully.");
    setActiveTab("order-summary");
    toast.success("Pathology order saved");
  };

  const saveAndBill = () => {
    commitSavedSelection();
    setBillingNote("Order saved and sent to billing.");
    setActiveTab("order-summary");
    toast.success("Order saved and added to bill");
  };

  const addToBill = () => {
    setBillingNote("Order sent to billing queue.");
    toast.success("Added to billing queue");
  };

  const updateSummarySort = (key: SummarySortKey) => {
    setSummarySort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  };

  const editSummaryRow = (id: string) => {
    const row = savedSummaryRows.find((item) => item.id === id);
    if (!row) return;
    setSearch(row.name);
    const matchedTest = testList.find((test) => test.name.toLowerCase() === row.name.toLowerCase());
    if (matchedTest) {
      setSelectedTestIds((current) => Array.from(new Set([...current, matchedTest.id])));
    }
    const matchedGroup = groupedTests.find((group) => row.name.toLowerCase().includes(group.name.toLowerCase().split(" ")[0] ?? ""));
    if (matchedGroup) {
      setSelectedGroupIds((current) => Array.from(new Set([...current, matchedGroup.id])));
    }
    setActiveTab("test-order");
    toast.success(`Editing ${row.name}`);
  };

  const requestDeleteSummaryRow = (id: string) => {
    const row = savedSummaryRows.find((item) => item.id === id);
    if (!row) return;
    setDeleteTarget(row);
  };

  const confirmDeleteSummaryRow = () => {
    if (!deleteTarget) return;
    setSavedSummaryRows((current) => current.filter((row) => row.id !== deleteTarget.id));
    setSavedResultBlocks((current) => current.filter((block) => normalizeSelectionLabel(block.name) !== normalizeSelectionLabel(deleteTarget.name)));
    setSavedTestIds((current) => current.filter((id) => normalizeSelectionLabel(testList.find((test) => test.id === id)?.name ?? "") !== normalizeSelectionLabel(deleteTarget.name)));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  const addDiagnosis = () => {
    const label = diagnosisSearch.trim();
    if (!label) {
      toast.error("Search diagnosis first");
      return;
    }
    setSelectedDiagnosisLabel(`${label} (${diagnosisType})`);
    setDiagnosisOpen(false);
    toast.success("Diagnosis added");
  };

  const removeResultBlock = (id: string) => {
    setSavedResultBlocks((current) => current.filter((block) => block.id !== id));
    toast.success("Result removed");
  };

  const editResultBlock = (name: string) => {
    setDiagnosisSearch(name);
    setDiagnosisOpen(true);
    toast.success(`Editing ${name}`);
  };

  const reorderResult = (name: string) => {
    toast.success(`Reorder requested for ${name}`);
  };

  const downloadAllReports = () => {
    toast.info("Preparing pathology reports download");
    // The actual PDF generation stays in the result review tab; this keeps the test-order action visible here.
  };

  return (
    <div className="space-y-4">
      {/* <PatientSummaryBanner /> */}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MainTab)} className="w-full">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
              {(["test-order", "order-summary", "result-review"] as const).map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="sm"
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                  className="min-w-[132px] shrink-0"
                >
                  {tab === "test-order" ? "Test Order" : tab === "order-summary" ? "Order Summary" : tab === "result-review" ? "Result Review" : ''}
                </Button>
              ))}
            </div>

        <TabsContent value="test-order" className="mt-0">
          <PathologyTestOrderTab
            search={search}
            onSearchChange={setSearch}
            filteredTests={filteredTests}
            selectedTestIds={selectedTestIds}
            selectedGroupIds={selectedGroupIds}
            problems={problems}
            newProblem={newProblem}
            onNewProblemChange={setNewProblem}
            problemListVisible={problemListVisible}
            activeProblemView={activeProblemView}
            onProblemListVisibleChange={setProblemListVisible}
            onActiveProblemViewChange={setActiveProblemView}
            onAddProblem={addProblem}
            onToggleTest={toggleTest}
            onToggleGroup={toggleGroup}
            specimenSourceById={specimenSourceById}
            onSpecimenSourceChange={updateSpecimenSource}
            priority={priority}
            onPriorityChange={setPriority}
            fasting={fasting}
            onFastingChange={setFasting}
            clinicalNotes={clinicalNotes}
            onClinicalNotesChange={setClinicalNotes}
            instructionsForLab={instructionsForLab}
            onInstructionsForLabChange={setInstructionsForLab}
            collectionDate={collectionDate}
            onCollectionDateChange={setCollectionDate}
            collectionTime={collectionTime}
            onCollectionTimeChange={setCollectionTime}
            onOpenSummary={handleOpenSummary}
            onSave={saveOrder}
            onSaveAndBill={saveAndBill}
            onAddToBill={addToBill}
            onReorderPrevious={selectHistory}
            onDownloadAllReports={downloadAllReports}
          />
        </TabsContent>
        <TabsContent value="order-summary" className="mt-0">
          <PathologyOrderSummaryTab
            rows={selectedSummaryRows}
            selectedCount={selectedCount}
            billingNote={billingNote}
            instructionsForLab={savedInstructionsForLab}
            onSort={updateSummarySort}
            sort={summarySort}
            onSave={saveOrder}
            onAddToBill={addToBill}
            onSaveAndBill={saveAndBill}
            onEdit={editSummaryRow}
            onDelete={requestDeleteSummaryRow}
            onViewAll={() => setSavedSummaryRows(buildSavedPathologyRows(savedTestIds, savedGroupIds))}
            onBackToTestOrder={() => setActiveTab("test-order")}
          />
        </TabsContent>
        <TabsContent value="result-review" className="mt-0">
          <PathologyResultReviewTab
            resultBlocks={selectedResultBlocks}
            diagnosisSearch={diagnosisSearch}
            diagnosisType={diagnosisType}
            diagnosisOpen={diagnosisOpen}
            selectedDiagnosisLabel={selectedDiagnosisLabel}
            instructionsForLab={savedInstructionsForLab}
            onDiagnosisSearchChange={setDiagnosisSearch}
            onDiagnosisTypeChange={setDiagnosisType}
            onDiagnosisOpenChange={setDiagnosisOpen}
            onAddDiagnosis={addDiagnosis}
            onEditResult={editResultBlock}
            onDeleteResult={removeResultBlock}
            onReorderResult={reorderResult}
          />
        </TabsContent>
        <TabsContent value="critical-findings" className="mt-0">
          <PathologyCriticalFindingsTab resultBlocks={selectedResultBlocks} />
        </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this pathology row"}? This action cannot be undone in the current screen.`}
        onConfirm={confirmDeleteSummaryRow}
      />
    </div>
  );
}

