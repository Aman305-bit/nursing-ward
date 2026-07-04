"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Save, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import type { RadiologySummaryRow } from "./types";
import { Input } from "@/components/ui/input";

type SummarySortKey = keyof Pick<RadiologySummaryRow, "selectedTests" | "loincCode" | "category" | "specification" | "priority" | "status" | "orderDateTime">;

export function RadiologyOrderSummaryTab({
  rows,
  billingNote,
  sort,
  onSort,
  onSave,
  onAddToBill,
  onSaveAndBill,
  onEdit,
  onDelete,
}: {
  rows: RadiologySummaryRow[];
  billingNote: string;
  sort: { key: SummarySortKey; direction: "asc" | "desc" };
  onSort: (key: SummarySortKey) => void;
  onSave: () => void;
  onAddToBill: () => void;
  onSaveAndBill: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const columns = React.useMemo<ColumnDef<RadiologySummaryRow>[]>(
    () => [
      { accessorKey: "selectedTests", header: "Selected Test" },
      { accessorKey: "loincCode", header: "Code" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "specification", header: "Specification" },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <Badge>{row.original.priority}</Badge>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge tone={row.original.status === "Completed" || row.original.status === "Reviewed" ? "success" : "info"}>{row.original.status}</Badge>,
      },
      { accessorKey: "orderDateTime", header: "Order Date Time" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {/* <Button type="button" size="sm" variant="outline" onClick={() => onEdit(row.original.id)}>
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button type="button" size="sm" variant="outline" className="text-danger" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onDelete, onEdit],
  );

  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("");
  const filteredRows = React.useMemo(() => rows.filter((row) => {
    const haystack = `${row.selectedTests} ${row.loincCode} ${row.category} ${row.specification} ${row.priority} ${row.status} ${row.orderDateTime}`.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    return (!query || haystack.includes(query)) && (!dateFilter || row.orderDateTime.startsWith(dateFilter));
  }), [dateFilter, rows, searchQuery]);

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
          <input type="date" className="h-9 w-full rounded-md border border-input px-3 text-sm outline-none" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        </label>
        <Button type="button" variant="outline" onClick={() => { setSearchQuery(""); setDateFilter(""); }}>Reset</Button>
      </div>
      <DataTable data={filteredRows} columns={columns} />
      <div className="flex flex-wrap items-center gap-2">
        {/* <div className="text-sm text-muted-foreground">{billingNote}</div> */}
        <div className="ml-auto flex flex-wrap gap-2">
          
          <Button type="button" variant="outline" onClick={onAddToBill}>
            Add to bill
          </Button>
        </div>
      </div>
    </div>
  );
}

