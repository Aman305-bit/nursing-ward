"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

export function DataTable<TData>({
  columns,
  data,
  loading,
  className,
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  className?: string;
}) {
  // TanStack Table intentionally returns table helpers that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <Skeleton className="h-8 w-full" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-[var(--density-control-height-lg)] w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState icon={SearchX} title="No records found" description="Adjust filters or search another term to continue." />;
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]", className)}>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="border-b border-slate-200 px-[var(--density-table-cell-x)] py-3" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr className="group even:bg-slate-50/45 hover:bg-sky-50/70 [&:last-child>td]:border-0" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <td className="border-b border-slate-100 px-[var(--density-table-cell-x)] py-3 align-middle text-slate-700" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-white px-[var(--density-table-cell-x)] py-3 text-xs text-slate-500">
        <span>{data.length} static records • Page 1 of 1</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
