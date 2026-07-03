"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, CreditCard, PauseCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useAdmissionStore } from "@/features/admission/admission-store";
import type { BillingClearance } from "@/features/admission/types";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";
import { formatCurrency } from "@/lib/utils";

function totalEstimate(rows: BillingClearance[]) {
  return rows.reduce((sum, item) => sum + item.estimate, 0);
}

export function BillingClearanceWorkspace() {
  const { state, actions } = useAdmissionStore();
  const columns = React.useMemo<ColumnDef<BillingClearance>[]>(
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
      { header: "Hold Type", accessorKey: "holdType" },
      { header: "Risk", cell: ({ row }) => <AdmissionStatusBadge value={row.original.risk} /> },
      { header: "Estimate", cell: ({ row }) => formatCurrency(row.original.estimate) },
      { header: "Status", cell: ({ row }) => <AdmissionStatusBadge value={row.original.status ?? "Pending"} /> },
      { header: "Note", accessorKey: "note" },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                actions.reviewBilling({ clearanceId: row.original.id, status: "Cleared" });
                toast.success("Billing cleared.");
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Clear
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                actions.reviewBilling({ clearanceId: row.original.id, status: "Hold" });
                toast.warning("Billing hold applied.");
              }}
            >
              <PauseCircle className="h-4 w-4" />
              Hold
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
          <CardTitle>Billing & Insurance Clearance</CardTitle>
          <CardDescription>Approve billing holds before bed confirmation or final admission.</CardDescription>
        </div>
        <Badge tone="info">Finance check</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <div className="text-xs font-medium text-muted-foreground">Pending clearance</div>
            <div className="mt-2 text-2xl font-semibold">{state.clearances.filter((item) => item.status !== "Cleared").length}</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="text-xs font-medium text-muted-foreground">High risk</div>
            <div className="mt-2 text-2xl font-semibold">{state.clearances.filter((item) => item.risk === "High" && item.status !== "Cleared").length}</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="text-xs font-medium text-muted-foreground">Estimated value</div>
            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              {formatCurrency(totalEstimate(state.clearances.filter((item) => item.status !== "Cleared")))}
            </div>
          </div>
        </div>
        <DataTable data={state.clearances} columns={columns} />
      </CardContent>
    </Card>
  );
}
