"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { BedDouble, CheckCircle2, CreditCard, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useAdmissionStore } from "@/features/admission/admission-store";
import type { AdmissionRequest } from "@/features/admission/types";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";

export function AdmissionRequestsWorkspace() {
  const { state, actions } = useAdmissionStore();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"All" | "Pending" | "Accepted" | "Ready">("Pending");
  const rows = state.requests.filter((request) => {
    const text = `${request.patient} ${request.uhid} ${request.source} ${request.doctor} ${request.type} ${request.ward} ${request.priority} ${request.status}`.toLowerCase();
    const statusMatch =
      status === "All" ||
      (status === "Pending" && request.status.includes("Pending")) ||
      (status === "Accepted" && request.status === "Accepted") ||
      (status === "Ready" && request.status === "Ready for Nursing");
    return text.includes(search.toLowerCase()) && statusMatch;
  });
  const columns = React.useMemo<ColumnDef<AdmissionRequest>[]>(
    () => [
      {
        header: "Patient",
        cell: ({ row }) => (
          <div>
            <div className="font-semibold">{row.original.patient}</div>
            <div className="text-xs text-muted-foreground">{row.original.uhid}</div>
          </div>
        ),
      },
      { header: "Source", accessorKey: "source" },
      { header: "Doctor", accessorKey: "doctor" },
      { header: "Type", accessorKey: "type" },
      { header: "Ward", accessorKey: "ward" },
      { header: "Priority", cell: ({ row }) => <AdmissionStatusBadge value={row.original.priority} /> },
      { header: "Status", cell: ({ row }) => <AdmissionStatusBadge value={row.original.status} /> },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                actions.updateRequestStatus(row.original.id, "Accepted");
                toast.success("Request verified.");
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                actions.updateRequestStatus(row.original.id, "Billing Hold");
                toast.info("Request sent to billing hold.");
              }}
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </Button>
            <Button
              asChild
              size="sm"
              onClick={() => {
                actions.setActiveRequest(row.original.id);
              }}
            >
              <Link href="/admission/bed-manager">
                <BedDouble className="h-4 w-4" />
                Allot
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [actions],
  );

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Admission Requests</CardTitle>
          <CardDescription>Requests waiting for review and bed allotment.</CardDescription>
        </div>
        <Badge tone="info">Step 2</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search patient or UHID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["All", "Pending", "Accepted", "Ready"] as const).map((item) => (
              <Button key={item} size="sm" variant={status === item ? "default" : "outline"} onClick={() => setStatus(item)}>
                {item}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <QueueStat label="Total" value={state.requests.length} />
          <QueueStat label="Pending" value={state.requests.filter((item) => item.status.includes("Pending")).length} />
          <QueueStat label="Accepted" value={state.requests.filter((item) => item.status === "Accepted").length} />
          <QueueStat label="Ready" value={state.requests.filter((item) => item.status === "Ready for Nursing").length} />
        </div>
        <DataTable data={rows} columns={columns} />
      </CardContent>
    </Card>
  );
}

function QueueStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
