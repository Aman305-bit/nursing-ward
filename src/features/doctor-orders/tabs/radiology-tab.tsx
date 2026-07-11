"use client";

import * as React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { RadiologyOrderSummaryTab } from "./radiology/order-summary-tab";
import { RadiologyResultReviewTab } from "./radiology/result-review-tab";
import { RadiologyTestOrderTab } from "./radiology/test-order-tab";
import { radiologyResultBlocks, radiologySummaryRows, radiologyTestGroups, radiologyTestList } from "./radiology/data";
import type { RadiologyPriority, RadiologyResultBlock, RadiologySummaryRow } from "./radiology/types";

type MainTab = "test-order" | "order-summary" | "result-review";
type SummarySortKey = keyof Pick<RadiologySummaryRow, "selectedTests" | "loincCode" | "category" | "specification" | "priority" | "status" | "orderDateTime">;

const selectedByDefault = ["xray-chest"];
const selectedGroupDefault: string[] = [];

function buildRadiologySnapshotRows(testIds: string[], groupIds: string[]) {
  const rows: RadiologySummaryRow[] = [];

  for (const id of testIds) {
    const test = radiologyTestList.find((item) => item.id === id);
    if (!test) continue;
    rows.push({
      id: `saved-${test.id}`,
      selectedTests: test.name,
      loincCode: test.code ?? "-",
      category: test.category ?? "-",
      specification: test.specifications?.[0] ?? "-",
      priority: "Routine",
      status: "Ordered",
      orderDateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
  }

  for (const id of groupIds) {
    const group = radiologyTestGroups.find((item) => item.id === id);
    if (!group) continue;
    rows.push({
      id: `saved-${group.id}`,
      selectedTests: group.name,
      loincCode: "-",
      category: group.modality,
      specification: "Grouped request",
      priority: "Routine",
      status: "Ordered",
      orderDateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
  }

  return rows.length ? rows : radiologySummaryRows;
}

function buildRadiologySnapshotBlocks(testIds: string[], groupIds: string[]) {
  const blocks: RadiologyResultBlock[] = [];

  for (const id of testIds) {
    const test = radiologyTestList.find((item) => item.id === id);
    if (!test) continue;
    blocks.push({
      id: `saved-${test.id}`,
      selectedTests: test.name,
      loincCode: test.code ?? "-",
      category: test.category ?? "-",
      specification: test.specifications?.[0] ?? "-",
      priority: "Routine",
      rows: [
        { parameter: test.name, result: "Pending", unit: "-", referenceRange: "-" },
      ],
    });
  }

  for (const id of groupIds) {
    const group = radiologyTestGroups.find((item) => item.id === id);
    if (!group) continue;
    blocks.push({
      id: `saved-${group.id}`,
      selectedTests: group.name,
      loincCode: "-",
      category: group.modality,
      specification: "Grouped request",
      priority: "Routine",
      rows: [
        { parameter: group.name, result: "Pending", unit: "-", referenceRange: "-" },
      ],
    });
  }

  return blocks.length ? blocks : radiologyResultBlocks;
}

export function RadiologyTab() {
  const [activeTab, setActiveTab] = React.useState<MainTab>("test-order");
  const [search, setSearch] = React.useState("");
  const [selectedTestIds, setSelectedTestIds] = React.useState<string[]>(selectedByDefault);
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<string[]>(selectedGroupDefault);
  const [priority, setPriority] = React.useState<RadiologyPriority>("Routine");
  const [notes, setNotes] = React.useState("");
  const [savedSummaryRows, setSavedSummaryRows] = React.useState<RadiologySummaryRow[]>(() => buildRadiologySnapshotRows(selectedByDefault, selectedGroupDefault));
  const [savedResultList, setSavedResultList] = React.useState<RadiologyResultBlock[]>(() => buildRadiologySnapshotBlocks(selectedByDefault, selectedGroupDefault));
  const [summarySort, setSummarySort] = React.useState<{ key: SummarySortKey; direction: "asc" | "desc" }>({ key: "selectedTests", direction: "asc" });
  const [billingNote, setBillingNote] = React.useState("Radiology order ready.");

  const filteredTests = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return radiologyTestList.filter((test) => `${test.name} ${test.description} ${test.code ?? ""}`.toLowerCase().includes(query));
  }, [search]);

  const sortedSummaryRows = React.useMemo(() => {
    return [...savedSummaryRows].sort((left, right) => {
      const leftValue = String(left[summarySort.key]);
      const rightValue = String(right[summarySort.key]);
      const comparison = leftValue.localeCompare(rightValue);
      return summarySort.direction === "asc" ? comparison : -comparison;
    });
  }, [savedSummaryRows, summarySort]);

  const toggleTest = (id: string) => {
    setSelectedTestIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const updateSummarySort = (key: SummarySortKey) => {
    setSummarySort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  };

  const commitSavedSelection = () => {
    setSavedSummaryRows(buildRadiologySnapshotRows(selectedTestIds, selectedGroupIds));
    setSavedResultList(buildRadiologySnapshotBlocks(selectedTestIds, selectedGroupIds));
  };

  const saveOrder = () => {
    commitSavedSelection();
    setBillingNote("Radiology order saved successfully.");
    setActiveTab("order-summary");
    toast.success("Radiology order saved");
  };

  const saveAndBill = () => {
    commitSavedSelection();
    setBillingNote("Radiology order saved and sent to billing.");
    setActiveTab("order-summary");
    toast.success("Order saved and added to bill");
  };

  const addToBill = () => {
    setBillingNote("Radiology order sent to billing queue.");
    toast.success("Added to billing queue");
  };

  const editSummaryRow = (id: string) => {
    const row = savedSummaryRows.find((item) => item.id === id);
    if (!row) return;
    setSearch(row.selectedTests);
    const matchedTest = radiologyTestList.find((test) => test.name.toLowerCase() === row.selectedTests.toLowerCase());
    if (matchedTest) setSelectedTestIds((current) => Array.from(new Set([...current, matchedTest.id])));
    setActiveTab("test-order");
    toast.success(`Editing ${row.selectedTests}`);
  };

  const deleteSummaryRow = (id: string) => {
    setSavedSummaryRows((current) => current.filter((row) => row.id !== id));
    toast.success("Summary row deleted");
  };

  const reorderResult = (name: string) => toast.success(`Reorder requested for ${name}`);

  return (
    <div className="space-y-4">
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
                  {tab === "test-order" ? "Test Order" : tab === "order-summary" ? "Order Summary" : "Result Review"}
                </Button>
              ))}
            </div>

            <TabsContent value="test-order" className="mt-0">
              <RadiologyTestOrderTab
                search={search}
                onSearchChange={setSearch}
                filteredTests={filteredTests}
                selectedTestIds={selectedTestIds}
                selectedGroupIds={selectedGroupIds}
                onToggleTest={toggleTest}
                onToggleGroup={toggleGroup}
                priority={priority}
                onPriorityChange={setPriority}
                notes={notes}
                onNotesChange={setNotes}
                onOpenSummary={() => setActiveTab("order-summary")}
                onSave={saveOrder}
              />
            </TabsContent>

            <TabsContent value="order-summary" className="mt-0">
              <RadiologyOrderSummaryTab
                rows={sortedSummaryRows}
                sort={summarySort}
                onSort={updateSummarySort}
                billingNote={billingNote}
                onSave={saveOrder}
                onAddToBill={addToBill}
                onSaveAndBill={saveAndBill}
                onEdit={editSummaryRow}
                onDelete={deleteSummaryRow}
              />
            </TabsContent>

            <TabsContent value="result-review" className="mt-0">
              <RadiologyResultReviewTab resultBlocks={savedResultList} onReorderResult={reorderResult} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
