"use client";
import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsLeft, ChevronsRight, ChevronsUpDown, Pencil, Save, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { PathologySummaryRow } from "./types";
import { Input } from "@/components/ui/input";

type SummarySortKey = keyof Pick<PathologySummaryRow, "name" | "loinc" | "cpt" | "department" | "specimen" | "priority">;
const PAGE_SIZE_OPTIONS = [5, 10, 20];

function SortButton({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: SummarySortKey;
  sort: { key: SummarySortKey; direction: "asc" | "desc" };
  onSort: (key: SummarySortKey) => void;
}) {
  const active = sort.key === column;
  const SortIcon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <button type="button" className="flex items-center gap-2 text-left font-semibold uppercase tracking-wide hover:text-foreground" onClick={() => onSort(column)}>
      {label}
      <SortIcon className={active ? "h-3.5 w-3.5 text-foreground" : "h-3.5 w-3.5 text-muted-foreground/70"} />
    </button>
  );
}

export function PathologyOrderSummaryTab({
  rows,
  selectedCount,
  billingNote,
  instructionsForLab,
  sort,
  onSort,
  onSave,
  onAddToBill,
  onSaveAndBill,
  onEdit,
  onDelete,
  onViewAll,
  onBackToTestOrder,
}: {
  rows: PathologySummaryRow[];
  selectedCount: number;
  billingNote: string;
  instructionsForLab: string;
  sort: { key: SummarySortKey; direction: "asc" | "desc" };
  onSort: (key: SummarySortKey) => void;
  onSave: () => void;
  onAddToBill: () => void;
  onSaveAndBill: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
  onBackToTestOrder: () => void;
}) {
  const headers: Array<{ key?: SummarySortKey; label: string }> = [
    { label: "Order ID" },
    { key: "name", label: "Test name" },
    { key: "loinc", label: "LOINC code" },
    { key: "cpt", label: "CPT code" },
    // { key: "department", label: "Department" },
    { key: "specimen", label: "Specimen" },
    { key: "priority", label: "Priority" },
  ];
  const [pageSize, setPageSize] = React.useState(5);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("");

  const filteredRows = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const haystack = `${row.id} ${row.name} ${row.loinc} ${row.cpt} ${row.department} ${row.specimen} ${row.priority} ${row.status} ${row.orderDateTime}`.toLowerCase();
      return (!query || haystack.includes(query)) && (!dateFilter || row.orderDateTime.startsWith(dateFilter));
    });
  }, [dateFilter, rows, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pagedRows = React.useMemo(() => filteredRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize), [currentPage, filteredRows, pageSize]);

  React.useEffect(() => {
    setPageIndex(0);
  }, [dateFilter, rows.length, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-3 sm:flex-row sm:items-end">
        
       <div className="flex-1 space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by test, code, specimen, status" />
        </div>
        <label className="space-y-1 sm:w-[180px]">
          <span className="text-xs font-medium text-muted-foreground">Date</span>
          <input type="date" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        </label>
        <Button type="button" variant="outline" onClick={() => { setSearchQuery(""); setDateFilter(""); setPageIndex(0); }}>Reset</Button>
      </div>
      {/* <div className="rounded-md border border-border bg-surface-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Saved instructions: {instructionsForLab || "None"}
      </div> */}
      {/* <Card>
        <CardContent className="space-y-4 p-4"> */}
          
          {/* <div className="rounded-md border border-border bg-surface-muted p-3 text-sm text-muted-foreground">{billingNote}</div> */}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  {headers.map((header) => (
                    <th key={header.key ?? header.label} className="px-4 py-3">
                      {header.key ? <SortButton label={header.label} column={header.key} sort={sort} onSort={onSort} /> : header.label}
                    </th>
                  ))}
                  <th className="px-4 py-3">Status</th>
                  {/* <th className="px-4 py-3">Ordered By</th> */}
                  <th className="px-4 py-3">Order Date Time</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length ? pagedRows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.loinc}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.cpt}</td>
                    {/* <td className="px-4 py-3 text-muted-foreground">{row.department}</td> */}
                    <td className="px-4 py-3">{row.specimen}</td>
                    <td className="px-4 py-3">
                      <Badge tone={row.priority === "Urgent" || row.priority === "STAT" ? "warning" : "default"}>{row.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={row.status === "Cancelled" ? "danger" : row.status === "Released" || row.status === "Verified" ? "success" : row.status === "Processing" ? "warning" : "info"}>
                        {row.status}
                      </Badge>
                    </td>
                    {/* <td className="px-4 py-3 text-muted-foreground">{row.orderedBy}</td> */}
                    <td className="px-4 py-3 text-muted-foreground">{row.orderDateTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {/* <Button type="button" size="sm" variant="outline" onClick={() => onEdit(row.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button> */}
                        <Button type="button" size="sm" variant="outline" className="text-danger" onClick={() => onDelete(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted-foreground" colSpan={10}>
                      No summary records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-border/80 bg-white px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                {filteredRows.length} records - Page {currentPage + 1} of {pageCount}
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
            <div className="flex items-center justify-end gap-1 overflow-x-auto">
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

          <div className="flex flex-wrap gap-2">
            {/* <Button type="button" variant="outline" onClick={onBackToTestOrder}>
              Edit order
            </Button> */}
            {/* <Button type="button" variant="outline" onClick={onViewAll}>
              View all summary
            </Button> */}
            <div className="ml-auto flex flex-wrap gap-2">
             
              <Button type="button" variant="outline" onClick={onAddToBill}>
                Add to bill
              </Button>
              {/* <Button type="button" onClick={onSaveAndBill}>
                Save & add to bill
              </Button> */}
            </div>
          </div>
        {/* </CardContent>
      </Card> */}
    </div>
  );
}
