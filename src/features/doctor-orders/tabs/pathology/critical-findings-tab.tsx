"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsLeft, ChevronsRight, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { PathologyResultBlock } from "./types";

type CriticalFinding = {
  id: string;
  test: string;
  parameter: string;
  result: string;
  range: string;
  flag: "H" | "L";
};

type SortKey = keyof Pick<CriticalFinding, "test" | "parameter" | "result" | "range" | "flag">;
type SortDirection = "asc" | "desc";
const PAGE_SIZE_OPTIONS = [5, 10, 20];

export function PathologyCriticalFindingsTab({ resultBlocks }: { resultBlocks: PathologyResultBlock[] }) {
  const findings = React.useMemo<CriticalFinding[]>(
    () =>
      resultBlocks.flatMap((block) =>
        block.rows
          .filter((row) => row.flag !== "N")
          .map((row, index) => ({
            id: `${block.id}-${row.parameter}-${index}`,
            test: block.name,
            parameter: row.parameter,
            result: row.result,
            range: row.referenceRange,
            flag: row.flag as "H" | "L",
          })),
      ),
    [resultBlocks],
  );
  const [sortKey, setSortKey] = React.useState<SortKey>("test");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [pageSize, setPageSize] = React.useState(5);
  const [pageIndex, setPageIndex] = React.useState(0);

  const sortedFindings = React.useMemo(() => {
    const items = [...findings];
    items.sort((left, right) => {
      const comparison = String(left[sortKey]).localeCompare(String(right[sortKey]), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return items;
  }, [findings, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(sortedFindings.length / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pagedFindings = React.useMemo(() => sortedFindings.slice(currentPage * pageSize, currentPage * pageSize + pageSize), [currentPage, pageSize, sortedFindings]);

  const requestSort = (nextKey: SortKey) => {
    setPageIndex(0);
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  };

  return (
    // <Card>
    //   <CardContent className="space-y-4 p-4">
        <div >
          {/* <div className="text-sm font-semibold text-danger">⚠ Critical Findings</div> */}
          {findings.length ? (
            <div className="mt-3 overflow-auto rounded-md border border-danger/20 bg-white">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-danger/10 text-xs font-semibold uppercase tracking-wide text-danger">
                  <tr>
                    {(["test", "parameter", "result", "range", "flag"] as SortKey[]).map((key) => (
                      <th key={key} className="px-3 py-2">
                        <button className="inline-flex items-center gap-1.5" type="button" onClick={() => requestSort(key)}>
                          {key === "test" ? "Test" : key === "parameter" ? "Parameter" : key === "result" ? "Result" : key === "range" ? "Range" : "Flag"}
                          {sortKey === key ? sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedFindings.map((finding) => (
                    <tr key={finding.id} className="border-t border-danger/10">
                      <td className="px-3 py-2 font-medium text-foreground">{finding.test}</td>
                      <td className="px-3 py-2 text-muted-foreground">{finding.parameter}</td>
                      <td className="px-3 py-2 font-semibold text-danger">{finding.result}</td>
                      <td className="px-3 py-2 text-muted-foreground">{finding.range}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-danger">{finding.flag}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted-foreground">No critical findings available.</div>
          )}
          {findings.length ? (
            <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                {sortedFindings.length} records - Page {currentPage + 1} of {pageCount}
              </span>
              <div className="flex items-center gap-2">
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
          ) : null}
        </div>
    //   </CardContent>
    // </Card>
  );
}
