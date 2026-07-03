"use client";

import * as React from "react";
import { BellRing, CheckCheck, Filter, MoreHorizontal } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { notifications } from "@/data/mock";
import type { NotificationItem, StatusTone } from "@/types";

const priorityTone: Record<NotificationItem["priority"], StatusTone> = {
  high: "critical",
  medium: "warning",
  low: "info",
};

export function NotificationCenter() {
  const [selected, setSelected] = React.useState<NotificationItem | null>(null);
  const [items, setItems] = React.useState<NotificationItem[]>(notifications);
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const filteredItems = items.filter((item) => {
    const haystack = `${item.title} ${item.message} ${item.module} ${item.patient ?? ""}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesType = !typeFilter || item.type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesPriority = !priorityFilter || item.priority.toLowerCase().includes(priorityFilter.toLowerCase());
    const matchesStatus = !statusFilter || item.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesQuery && matchesType && matchesPriority && matchesStatus;
  });

  function updateStatus(id: string, status: NotificationItem["status"]) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    setSelected((current) => (current?.id === id ? { ...current, status } : current));
  }

  const columns = React.useMemo<ColumnDef<NotificationItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Notification",
        cell: ({ row }) => (
          <button className="text-left" onClick={() => setSelected(row.original)} type="button">
            <span className="block font-medium text-foreground">{row.original.title}</span>
            <span className="block text-xs text-muted-foreground">{row.original.message}</span>
          </button>
        ),
      },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "module", header: "Module" },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <StatusPill tone={priorityTone[row.original.priority]}>{row.original.priority}</StatusPill>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusPill tone={row.original.status === "unread" ? "warning" : row.original.status === "acknowledged" ? "success" : "muted"}>{row.original.status}</StatusPill>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button variant="ghost" size="icon" aria-label={`Open ${row.original.title}`} onClick={() => setSelected(row.original)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notification Center"
        description="Operational alerts, clinical warnings, approvals, system messages, and task assignments."
        eyebrow="Phase 1 / Static notification workflow"
        actions={
          <>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => setItems((current) => current.map((item) => ({ ...item, status: item.status === "acknowledged" ? item.status : "read" })))}>
              <CheckCheck className="h-4 w-4" />
              Mark read
            </Button>
          </>
        }
      />

      <Card className="mt-4">
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_160px_160px_160px]">
            <Input placeholder="Search title, patient, module..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <Input placeholder="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} />
            <Input placeholder="Priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} />
            <Input placeholder="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} />
          </div>
          <DataTable data={filteredItems} columns={columns} />
        </CardContent>
      </Card>

      <Drawer
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title ?? "Notification"}
        description={selected ? `${selected.type} • ${selected.module}` : undefined}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => selected && updateStatus(selected.id, "read")}>
              Mark read
            </Button>
            <Button onClick={() => selected && updateStatus(selected.id, "acknowledged")}>Acknowledge</Button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <BellRing className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm text-foreground">{selected.message}</p>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><StatusPill tone={priorityTone[selected.priority]}>{selected.priority}</StatusPill></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{selected.status}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Related module</span><span>{selected.module}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span>{selected.patient ?? "Not linked"}</span></div>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
