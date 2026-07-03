import type { ColumnDef } from "@tanstack/react-table";
import { Table2 } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import type { BundleItem } from "@/features/bundle/bundle-types";

type Row = {
  patient: string;
  module: string;
  status: "Ready" | "Pending" | "Critical";
};

const rows: Row[] = [
  { patient: "Meera Joshi", module: "Laboratory", status: "Critical" },
  { patient: "Arjun Kapoor", module: "Billing", status: "Pending" },
  { patient: "Neha Rao", module: "OPD", status: "Ready" },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: "patient", header: "Patient" },
  { accessorKey: "module", header: "Module" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusPill tone={row.original.status === "Critical" ? "critical" : row.original.status === "Pending" ? "warning" : "success"}>
        {row.original.status}
      </StatusPill>
    ),
  },
];

export const tableBundle: BundleItem = {
  id: "table",
  category: "Data",
  title: "Table",
  description: "Reusable TanStack based table with status rendering.",
  icon: Table2,
  code: String.raw`import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";

type Row = { patient: string; module: string; status: "Ready" | "Pending" | "Critical" };

const rows: Row[] = [
  { patient: "Meera Joshi", module: "Laboratory", status: "Critical" },
  { patient: "Arjun Kapoor", module: "Billing", status: "Pending" },
  { patient: "Neha Rao", module: "OPD", status: "Ready" },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: "patient", header: "Patient" },
  { accessorKey: "module", header: "Module" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusPill tone={row.original.status === "Critical" ? "critical" : row.original.status === "Pending" ? "warning" : "success"}>{row.original.status}</StatusPill>,
  },
];

export function TableBundle() {
  return <DataTable columns={columns} data={rows} />;
}`,
  renderPreview: () => <DataTable columns={columns} data={rows} />,
};
