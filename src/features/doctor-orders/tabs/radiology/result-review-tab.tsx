"use client";

import * as React from "react";
import { ArrowUpDown, Download, Eye, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";

import type { RadiologyResultBlock } from "./types";
import { downloadRadiologyPdf as downloadRadiologyPdfFromUtility } from "../report-pdf-utils";
import { StatusPill } from "@/components/ui/status-pill";

type SortKey = "selectedTests" | "loincCode" | "category" | "specification" | "priority";
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function getCompletedDate(status: string, completionDate?: string) {
  if (status === "Cancelled" || status === "Ordered" || status === "Sample Collected" || status === "Sample Received" || status === "Processing") {
    return "";
  }
  if (status === "Report Ready" || status === "Completed" || status === "Reviewed") {
    return completionDate ?? new Date().toLocaleDateString("en-GB");
  }
  return completionDate ?? "";
}

export function RadiologyResultReviewTab({
  resultBlocks,
  onReorderResult,
}: {
  resultBlocks: RadiologyResultBlock[];
  onReorderResult: (name: string) => void;
}) {
  const [pageIndex, setPageIndex] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("selectedTests");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [pageSize, setPageSize] = React.useState(5);
  const [selectedBlock, setSelectedBlock] = React.useState<RadiologyResultBlock | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("");

  const visibleBlocks = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const items = resultBlocks.filter((block) => `${block.selectedTests} ${block.loincCode} ${block.category} ${block.specification} ${block.priority}`.toLowerCase().includes(query));
    if (!dateFilter) return items;
    return items.filter(() => "14/05/2021".includes(dateFilter));
  }, [dateFilter, resultBlocks, searchQuery]);

  const sortedBlocks = React.useMemo(() => {
    const items = [...visibleBlocks];
    items.sort((left, right) => {
      const leftValue = String(left[sortKey]);
      const rightValue = String(right[sortKey]);
      const comparison = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return items;
  }, [sortDirection, sortKey, visibleBlocks]);

  const pageCount = Math.max(1, Math.ceil(sortedBlocks.length / pageSize));

  React.useEffect(() => {
    setPageIndex(0);
  }, [dateFilter, searchQuery]);
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const paged = React.useMemo(() => sortedBlocks.slice(currentPage * pageSize, currentPage * pageSize + pageSize), [currentPage, pageSize, sortedBlocks]);

  const requestSort = (nextKey: SortKey) => {
    setPageIndex(0);
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  };

  const handleDownload = (block: RadiologyResultBlock) => {
    void downloadRadiologyPdfFromUtility([block], "radiology-report.pdf");
  };

  const handleDownloadAll = () => {
    void downloadRadiologyPdfFromUtility(sortedBlocks, "radiology-reports.pdf");
  };

  const openBlockView = (block: RadiologyResultBlock) => setSelectedBlock(block);
  const closeBlockView = () => setSelectedBlock(null);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_110px_auto] md:items-end">
        <div className="flex-1 space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search selected test, code, category, or specification" />
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Date</div>
          <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        </div>
        <Button type="button" variant="outline" onClick={() => { setSearchQuery(""); setDateFilter(""); }}>Reset</Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              {[
                ["selectedTests", "Selected Test"],
                ["loincCode", "Code"],
                ["category", "Category"],
                ["specification", "Specification"],
                ["priority", "Priority"],
              ].map(([key, label]) => (
                <th key={key} className="px-3 py-3">
                  <button className="inline-flex items-center gap-1.5" type="button" onClick={() => requestSort(key as SortKey)}>
                    {label}
                    {sortKey === key ? <ArrowUpDown className="h-3.5 w-3.5" /> : null}
                  </button>
                </th>
              ))}
              <th className="px-3 py-3">Completed Date</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3"><Button size="sm" variant="outline" onClick={handleDownloadAll}>
            <Download className="h-3.5 w-3.5" />
            Download All Reports
          </Button></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((block) => (
              <React.Fragment key={block.id}>
                <tr className="border-t border-border">
                  <td className="px-3 py-3 font-medium text-foreground">{block.selectedTests}</td>
                  <td className="px-3 py-3 text-muted-foreground">{block.loincCode}</td>
                  <td className="px-3 py-3 text-muted-foreground">{block.category}</td>
                  <td className="px-3 py-3 text-muted-foreground">{block.specification}</td>
                  <td className="px-3 py-3 text-muted-foreground">{block.priority}</td>
                  <td className="w-[160px] px-3 py-3 text-muted-foreground">12/05/2021</td>
                  <td className="px-3 py-3">
                      <StatusPill tone="success">Completed</StatusPill>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => onReorderResult(block.selectedTests)}>
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => openBlockView(block)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleDownload(block)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer
        open={Boolean(selectedBlock)}
        onOpenChange={(open) => {
          if (!open) closeBlockView();
        }}
        title={selectedBlock?.selectedTests ?? "Result preview"}
        description={selectedBlock ? `${selectedBlock.category} • ${selectedBlock.specification} ` : "Static result preview"}
      >
        {selectedBlock ? (
          <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_110px_auto] md:items-end">
        <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search selected test, code, category, or specification" />
        <div className="min-w-0">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Date</div>
          <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        </div>
        <Button type="button" variant="outline" onClick={() => { setSearchQuery(""); setDateFilter(""); }}>Reset</Button>
      </div>
            
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Parameter</th>
                    <th className="px-3 py-2">Result</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBlock.rows.map((row) => (
                    <tr key={row.parameter} className="border-t border-border">
                      <td className="px-3 py-2 font-medium text-foreground">{row.parameter}</td>
                      <td className="px-3 py-2 text-foreground">{row.result}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.unit}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.referenceRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Drawer>

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
              onChange={(event) => {setPageSize(Number(event.target.value));             setPageIndex(0);           }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-1">
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
    </div>
  );
}






