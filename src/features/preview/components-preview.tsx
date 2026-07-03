"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, FileText, Filter, PanelRightOpen, Save, Search } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PreviewRow = {
  id: string;
  patient: string;
  module: string;
  status: "Ready" | "Pending" | "Critical";
};

const previewRows: PreviewRow[] = [
  { id: "1", patient: "Meera Joshi", module: "Laboratory", status: "Critical" },
  { id: "2", patient: "Arjun Kapoor", module: "Billing", status: "Pending" },
  { id: "3", patient: "Neha Rao", module: "OPD", status: "Ready" },
];

const columns: ColumnDef<PreviewRow>[] = [
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

export function ComponentsPreview() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Components Preview"
        description="Internal Phase 1 design system preview for reusable controls, states, tables, tabs, drawers, alerts, and skeletons."
        eyebrow="Development-only foundation"
        actions={
          <Button onClick={() => setDrawerOpen(true)}>
            <PanelRightOpen className="h-4 w-4" />
            Open drawer
          </Button>
        }
      />

      <div className="grid gap-4 pt-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buttons And Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button><Save className="h-4 w-4" />Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger"><AlertTriangle className="h-4 w-4" />Danger</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Search patient" />
              <Input placeholder="Disabled input" disabled />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge tone="success">Approved</Badge>
              <Badge tone="warning">Pending</Badge>
              <Badge tone="critical">Critical</Badge>
              <Badge tone="danger">Rejected</Badge>
              <Badge tone="info">In progress</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts And States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertBanner icon={CheckCircle2} title="System ready" tone="success">
              All Phase 1 primitives are using shared tokens.
            </AlertBanner>
            <AlertBanner icon={AlertTriangle} title="Critical state" tone="critical">
              Critical states remain stable across dynamic primary colors.
            </AlertBanner>
            <div className="grid gap-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Tabs And Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="table">
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="empty">Empty state</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <DataTable columns={columns} data={previewRows} />
              </TabsContent>
              <TabsContent value="empty">
                <EmptyState icon={FileText} title="No preview records" description="This compact empty state is designed for work surfaces, not marketing pages." action="Reset filters" />
              </TabsContent>
              <TabsContent value="filters">
                <div className="grid gap-3 sm:grid-cols-[1fr_180px_140px]">
                  <Input placeholder="Search..." />
                  <Button variant="outline"><Filter className="h-4 w-4" />Open filter drawer</Button>
                  <Button><Search className="h-4 w-4" />Apply</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Reusable Drawer"
        description="Desktop side drawer and mobile full-screen sheet pattern."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => setDrawerOpen(false)}>Save</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input placeholder="Drawer form field" />
          <AlertBanner icon={AlertTriangle} title="Reason-gated action" tone="warning">
            Future phases use this pattern for approvals, overrides, returns, and critical workflow changes.
          </AlertBanner>
        </div>
      </Drawer>
    </div>
  );
}
