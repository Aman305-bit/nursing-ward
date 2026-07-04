"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { DrugOrder, OrderDraft } from "./types";
import { categoryTone } from "./utils";

type SummarySortKey = "name" | "category" | "form" | "route" | "dosage" | "frequency" | "days" | "orderedQty" | "instructions" | "taper";
type SummarySort = { key: SummarySortKey; direction: "asc" | "desc" };

const columns: { key: SummarySortKey | "actions"; label: string; className?: string }[] = [
  { key: "name", label: "Drug" },
  { key: "category", label: "Category" },
  { key: "form", label: "Form" },
  { key: "route", label: "Route" },
  { key: "dosage", label: "Dosage" },
  { key: "frequency", label: "Frequency" },
  { key: "days", label: "Days" },
  { key: "orderedQty", label: "Total Qty" },
  { key: "instructions", label: "Instruction" },
  { key: "taper", label: "Taper dose" },
  { key: "actions", label: "Actions", className: "text-right" },
];

const hiddenFieldsByCategory: Partial<Record<OrderDraft["category"], Partial<Record<SummarySortKey, boolean>>>> = {
  Scheduled: {},
  SOS: { frequency: true, days: true },
  STAT: { frequency: true, days: true },
  Bolus: { frequency: true, days: true },
  Diluent: { frequency: true, days: true, dosage: true, instructions: false },
  Intermittent: {},
  Continuous: { frequency: true, days: true },
  Discontinued: { frequency: true, days: true },
  Unscheduled: { frequency: true, days: true },
};

function isHidden(draft: OrderDraft, key: SummarySortKey) {
  return Boolean(hiddenFieldsByCategory[draft.category]?.[key]);
}

function SortButton({ label, column, sort, onSort }: { label: string; column: SummarySortKey; sort: SummarySort; onSort: (key: SummarySortKey) => void }) {
  const active = sort.key === column;
  const SortIcon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <button type="button" className="flex items-center gap-2 text-left font-semibold uppercase tracking-wide hover:text-foreground" onClick={() => onSort(column)}>
      {label}
      <SortIcon className={active ? "h-3.5 w-3.5 text-foreground" : "h-3.5 w-3.5 text-muted-foreground/70"} />
    </button>
  );
}

function draftValue(draft: OrderDraft, key: SummarySortKey) {
  if (isHidden(draft, key)) return "-";
  if (key === "dosage") {
    if (draft.category === "Continuous") return draft.totalDose ? `${draft.totalDose} ${draft.totalDoseUnit}` : `${draft.rateDose} ${draft.rateUnit}/${draft.rateTimeUnit}`;
    if (draft.category === "Intermittent") return draft.totalDose ? `${draft.totalDose} ${draft.totalDoseUnit}` : `${draft.rateDose} ${draft.rateUnit}/${draft.rateTimeUnit}`;
    if (draft.category === "Bolus") return draft.bolusDose ? `${draft.bolusDose} ${draft.bolusUnit}` : `${draft.dosage} ${draft.doseUnit}`;
    return draft.dosage ? `${draft.dosage} ${draft.doseUnit}` : draft.maxDosage;
  }
  if (key === "frequency") return !draft.category || draft.category === "Unscheduled" || draft.category === "STAT" || draft.category === "Bolus" || draft.category === "Continuous" ? "" : draft.frequency;
  if (key === "days") return draft.category === "Unscheduled" || draft.category === "STAT" || draft.category === "Bolus" ? "" : draft.days;
  if (key === "taper") return draft.taperDoses.map((row) => `${row.dose} ${row.unit} ${row.frequency} ${row.fromDate} ${row.toDate}`).join(" ");
  return draft[key] ?? "";
}

export function SummaryCard({
  orders,
  drafts,
  onEdit,
  onDelete,
}: {
  orders: DrugOrder[];
  drafts: Record<string, OrderDraft>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [sort, setSort] = React.useState<SummarySort>({ key: "name", direction: "asc" });
  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((left, right) => {
      const leftDraft = drafts[left.id];
      const rightDraft = drafts[right.id];
      if (!leftDraft || !rightDraft) return 0;

      const leftValue = draftValue(leftDraft, sort.key);
      const rightValue = draftValue(rightDraft, sort.key);
      const result = Number.isFinite(Number(leftValue)) && Number.isFinite(Number(rightValue))
        ? Number(leftValue) - Number(rightValue)
        : String(leftValue).localeCompare(String(rightValue));

      return sort.direction === "asc" ? result : -result;
    });
  }, [drafts, orders, sort]);

  const updateSort = (key: SummarySortKey) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  };

  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <div>
          <CardTitle>Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!orders.length ? (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Select drugs from the left card to build the order summary.</div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {sortedOrders.map((order) => {
                const draft = drafts[order.id];
                if (!draft) return null;

                return (
                  <div key={order.id} className="rounded-lg border border-border bg-surface p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{draft.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{draft.form || "-"} · {draft.route || "-"}</div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button size="icon" variant="outline" onClick={() => onEdit(order.id)} aria-label={`Edit ${draft.name}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => onDelete(order.id)} aria-label={`Delete ${draft.name}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-surface-muted p-2">
                        <div className="text-muted-foreground">Category</div>
                        <div className="mt-1 font-medium">{draft.category ? <Badge tone={categoryTone(draft.category)}>{draft.category}</Badge> : "-"}</div>
                      </div>
                      <div className="rounded-md bg-surface-muted p-2">
                        <div className="text-muted-foreground">Qty</div>
                        <div className="mt-1 font-medium text-foreground">{draft.orderedQty || "-"}</div>
                      </div>
                      <div className="rounded-md bg-surface-muted p-2">
                        <div className="text-muted-foreground">Dosage</div>
                        <div className="mt-1 font-medium text-foreground">{draftValue(draft, "dosage") || "-"}</div>
                      </div>
                      <div className="rounded-md bg-surface-muted p-2">
                        <div className="text-muted-foreground">Frequency</div>
                        <div className="mt-1 font-medium text-foreground">{isHidden(draft, "frequency") ? "-" : (!draft.category || draft.category === "Unscheduled" || draft.category === "STAT" || draft.category === "Bolus" || draft.category === "Continuous" ? "-" : draft.frequency || "-")}</div>
                      </div>
                      <div className="rounded-md bg-surface-muted p-2">
                        <div className="text-muted-foreground">Days</div>
                        <div className="mt-1 font-medium text-foreground">{isHidden(draft, "days") ? "-" : (draft.category === "Unscheduled" || draft.category === "STAT" || draft.category === "Bolus" || draft.category === "Continuous" ? "-" : draft.days || "-")}</div>
                      </div>
                      <div className="rounded-md bg-surface-muted p-2">
                        <div className="text-muted-foreground">Instruction</div>
                        <div className="mt-1 line-clamp-2 font-medium text-foreground">{draft.instructions || "-"}</div>
                      </div>
                      <div className="col-span-2 rounded-md bg-surface-muted p-2">
                        <div className="text-muted-foreground">Taper dose</div>
                        <div className="mt-1 line-clamp-2 font-medium text-foreground">{draftValue(draft, "taper") || "-"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded-lg border border-border md:block">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} className={["border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]", column.className].filter(Boolean).join(" ")}>
                        {column.key === "actions" ? column.label : <SortButton label={column.label} column={column.key} sort={sort} onSort={updateSort} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order) => {
                    const draft = drafts[order.id];
                    if (!draft) return null;
                    return (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] font-medium">{draft.name}</td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                          {draft.category ? <Badge tone={categoryTone(draft.category)}>{draft.category}</Badge> : <Badge tone="muted">-</Badge>}
                        </td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{draft.form || "-"}</td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{draft.route || "-"}</td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                          {draftValue(draft, "dosage") || "-"}
                        </td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                          {isHidden(draft, "frequency") ? "-" : (!draft.category || draft.category === "Unscheduled" || draft.category === "STAT" || draft.category === "Bolus" || draft.category === "Continuous" ? "-" : draft.frequency || "-")}
                        </td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{isHidden(draft, "days") ? "-" : (draft.category === "Unscheduled" || draft.category === "STAT" || draft.category === "Bolus" || draft.category === "Continuous" ? "-" : draft.days || "-")}</td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] font-semibold">{draft.orderedQty || "-"}</td>
                        <td className="max-w-64 truncate px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{draft.instructions || "-"}</td>
                        <td className="max-w-72 px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                          {draft.taperDoses.filter((row) => row.dose || row.frequency || row.fromDate || row.toDate).length ? (
                            <div className="space-y-1 text-xs">
                              {draft.taperDoses
                                .filter((row) => row.dose || row.frequency || row.fromDate || row.toDate)
                                .map((row) => (
                                  <div key={row.id} className="truncate">
                                    {row.dose || "-"} {row.unit || ""} / {row.frequency || "-"} / {row.fromDate || "-"} to {row.toDate || "-"}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" onClick={() => onEdit(order.id)} aria-label={`Edit ${draft.name}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => onDelete(order.id)} aria-label={`Delete ${draft.name}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
