"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheckBig, ClipboardCheck, Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { LdtTestOrderTab, type LdtDraft } from "./ldt/test-order-tab";
import { DEFAULT_LDT_TYPE_ID, getLdtTypeConfig } from "./ldt/config";
import type { LdtOrderPriority, LdtOrderStatus, LdtSummaryRow } from "./ldt/types";

type DraftErrors = Partial<Record<keyof LdtDraft, string>>;
type MainTab = "test-order";
type TestOrderRow = LdtSummaryRow & {
  nurseLocked?: boolean;
  dynamicValues: Record<string, string | string[]>;
  ldtTypeId: string;
  ldtName: string;
  clinicalNotes: string;
  createdAt: string;
  createdBy: string;
};

const today = new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const currentUser = "Dr. Admin";

const initialRows: TestOrderRow[] = [
  { id: "ldt-001", orderNo: "LDT-001", ldtType: "PICC Single Lumen", ldtTypeId: "line", ldtName: "PICC Single Lumen", clinicalNotes: "Initial placement request", createdAt: nowIso(), createdBy: currentUser, priority: "Routine", indication: "Blood", status: "Pending", orderDate: today, nurseLocked: false, dynamicValues: {} },
  { id: "ldt-002", orderNo: "LDT-002", ldtType: "Intercoastal Drain", ldtTypeId: "drain", ldtName: "Intercoastal Drain", clinicalNotes: "Nurse inserted", createdAt: nowIso(), createdBy: currentUser, priority: "Urgent", indication: "Urine", status: "Active", orderDate: today, nurseLocked: true, dynamicValues: {} },
  { id: "ldt-003", orderNo: "LDT-003", ldtType: "Nasogastric Tube", ldtTypeId: "tube", ldtName: "Nasogastric Tube", clinicalNotes: "Reviewed", createdAt: nowIso(), createdBy: currentUser, priority: "STAT", indication: "Saline", status: "Completed", orderDate: today, nurseLocked: false, dynamicValues: {} },
];

function statusTone(status: LdtOrderStatus) {
  if (status === "Completed") return "success";
  if (status === "Active") return "info";
  if (status === "Cancelled") return "danger";
  return "warning";
}

function isEditableStatus(status: LdtOrderStatus) {
  return status === "Pending";
}

function formatValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(", ") : value;
}

function buildAssessmentRows(row: TestOrderRow) {
  const config = getLdtTypeConfig(row.ldtTypeId);
  const assessmentFields = config?.fields.filter((field) => field.group === "assessment") ?? [];

  return assessmentFields
    .filter((field) => row.dynamicValues[field.id] !== undefined && row.dynamicValues[field.id] !== "" && !(Array.isArray(row.dynamicValues[field.id]) && row.dynamicValues[field.id].length === 0))
    .map((field) => ({
      dateTime: row.createdAt,
      assessment: field.label,
      value: formatValue(row.dynamicValues[field.id]),
      by: row.createdBy,
    }));
}

function buildRemovalInfo(row: TestOrderRow) {
  const config = getLdtTypeConfig(row.ldtTypeId);
  const propertyFields = config?.fields.filter((field) => field.group === "property") ?? [];

  return [
    // { field: "Order No", value: row.orderNo },
    { field: "LDT Type", value: row.ldtType },
    { field: "LDT Name", value: row.ldtName },
    { field: "Order Date", value: row.orderDate },
    { field: "Status", value: row.status },
    ...propertyFields
      .filter((field) => row.dynamicValues[field.id] !== undefined && row.dynamicValues[field.id] !== "" && !(Array.isArray(row.dynamicValues[field.id]) && row.dynamicValues[field.id].length === 0))
      .map((field) => ({ field: field.label, value: formatValue(row.dynamicValues[field.id]) })),
  ];
}

export function LdtTab() {
  const [activeTab] = React.useState<MainTab>("test-order");
  const [summaryRows, setSummaryRows] = React.useState<TestOrderRow[]>(initialRows);
  const [draft, setDraft] = React.useState<LdtDraft>({
    ldtTypeId: DEFAULT_LDT_TYPE_ID,
    priority: "Routine",
    reason: "",
    clinicalNotes: "",
    ldtName: getLdtTypeConfig(DEFAULT_LDT_TYPE_ID)?.ldtName ?? "",
    orderDate: today,
    status: "Pending",
    dynamicValues: {},
  });
  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<LdtOrderPriority | "All Priority">("All Priority");
  const [statusFilter, setStatusFilter] = React.useState<LdtOrderStatus | "All Status">("All Status");
  const [dateRange, setDateRange] = React.useState("");
  const [editingRow, setEditingRow] = React.useState<TestOrderRow | null>(null);
  const [viewingRow, setViewingRow] = React.useState<TestOrderRow | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false);
  const [orderDrawerOpen, setOrderDrawerOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TestOrderRow | null>(null);
  const [draftErrors, setDraftErrors] = React.useState<DraftErrors>({});
  const [submitMessage, setSubmitMessage] = React.useState<string | null>(null);

  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return summaryRows.filter((row) => {
      const matchesSearch = `${row.orderNo} ${row.ldtType} ${row.indication} ${row.priority} ${row.status}`.toLowerCase().includes(query);
      const matchesPriority = priorityFilter === "All Priority" || row.priority === priorityFilter;
      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;
      const matchesDate = !dateRange || row.orderDate === dateRange;
      return matchesSearch && matchesPriority && matchesStatus && matchesDate;
    });
  }, [dateRange, priorityFilter, search, statusFilter, summaryRows]);

  const resetForm = React.useCallback((row?: TestOrderRow | null) => {
    if (!row) {
      setDraft({
        ldtTypeId: DEFAULT_LDT_TYPE_ID,
        priority: "Routine",
        reason: "",
        clinicalNotes: "",
        ldtName: getLdtTypeConfig(DEFAULT_LDT_TYPE_ID)?.ldtName ?? "",
        orderDate: today,
        status: "Pending",
        dynamicValues: {},
      });
      return;
    }

    setDraft({
      ldtTypeId: row.ldtTypeId,
      priority: row.priority,
      reason: row.indication,
      clinicalNotes: row.clinicalNotes,
      ldtName: row.ldtName,
      orderDate: row.orderDate,
      status: row.status,
      dynamicValues: row.dynamicValues ?? {},
    });
  }, []);

  const validateDraft = React.useCallback((value: LdtDraft) => {
    const nextErrors: DraftErrors = {};
    if (!value.ldtTypeId.trim()) nextErrors.ldtTypeId = "LDT Type is required.";
    if (!value.ldtName.trim()) nextErrors.ldtName = "LDT Name is required.";
    if (!value.priority) nextErrors.priority = "Priority is required.";
    if (!value.reason.trim()) nextErrors.reason = "Reason / Indication is required.";
    return nextErrors;
  }, []);

  const saveLdtOrder = React.useCallback(() => {
    const nextErrors = validateDraft(draft);
    setDraftErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitMessage(null);
      return;
    }

    const ldtType = getLdtTypeConfig(draft.ldtTypeId)?.label || draft.ldtName;
    const indication = draft.reason.trim() || "-";
    const priority = draft.priority || "Routine";
    const orderDate = draft.orderDate || today;

    if (editingRow) {
      setSummaryRows((current) => current.map((row) => (row.id === editingRow.id ? { ...row, ldtType, ldtTypeId: draft.ldtTypeId, ldtName: draft.ldtName, clinicalNotes: draft.clinicalNotes, priority, indication, status: draft.status, orderDate, dynamicValues: draft.dynamicValues } : row)));
      setSubmitMessage(`LDT order ${editingRow.orderNo} updated successfully.`);
      setEditingRow(null);
    } else {
      const nextOrderNo = `LDT-${String(summaryRows.length + 1).padStart(3, "0")}`;
      setSummaryRows((current) => [
        { id: `ldt-${String(current.length + 1).padStart(3, "0")}`, orderNo: nextOrderNo, ldtType, ldtTypeId: draft.ldtTypeId, ldtName: draft.ldtName, clinicalNotes: draft.clinicalNotes, createdAt: nowIso(), createdBy: currentUser, indication, priority, status: draft.status, orderDate, nurseLocked: false, dynamicValues: draft.dynamicValues },
        ...current,
      ]);
      setSubmitMessage(`LDT order ${nextOrderNo} saved successfully.`);
    }

    resetForm(null);
    setDraftErrors({});
    setOrderDrawerOpen(false);
  }, [draft, editingRow, resetForm, summaryRows.length, validateDraft]);

  const openAddOrder = () => {
    setEditingRow(null);
    resetForm(null);
    setDraftErrors({});
    setSubmitMessage(null);
    setOrderDrawerOpen(true);
  };

  const openViewDrawer = React.useCallback((row: TestOrderRow) => {
    setViewingRow(row);
    setViewDrawerOpen(true);
  }, []);

  const handleEdit = (row: TestOrderRow) => {
    if (!isEditableStatus(row.status)) return;
    setEditingRow(row);
    resetForm(row);
    setDraftErrors({});
    setSubmitMessage(null);
    setOrderDrawerOpen(true);
  };

  const handleDelete = (row: TestOrderRow) => {
    if (row.status !== "Pending") return;
    setDeleteTarget(row);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setSummaryRows((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    setSubmitMessage(`LDT order ${deleteTarget.orderNo} deleted successfully.`);
  };

  const columns = React.useMemo<ColumnDef<TestOrderRow>[]>(
    () => [
      // { header: "Order No", accessorKey: "orderNo" },
      { header: "LDT Type", cell: ({ row }) => getLdtTypeConfig(row.original.ldtTypeId)?.label ?? row.original.ldtType },
      { header: "LDT Name", accessorKey: "ldtName" },
      { header: "Priority", accessorKey: "priority" },
      { header: "Order Date", accessorKey: "orderDate" },
      { header: "Status", cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{row.original.status}</Badge> },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => openViewDrawer(row.original)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={!isEditableStatus(row.original.status)} onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-danger" disabled={row.original.status !== "Pending"} onClick={() => handleDelete(row.original)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [openViewDrawer],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          
          {submitMessage ? (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CircleCheckBig className="h-4 w-4" />
              {submitMessage}
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-4">
            <label className="mt-1 space-y-1 text-xs font-medium text-muted-foreground md:col-span-2">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search LDT orders..." aria-label="Search LDT orders" />
            </label>
            {/* <SelectFilter label="" value={priorityFilter} onChange={setPriorityFilter} options={["All Priority", "Routine", "Urgent", "STAT"]} />
            <SelectFilter label="" value={statusFilter} onChange={setStatusFilter} options={["All Status", "Pending", "Active", "Completed", "Cancelled"]} /> */}
            <label className="mt-1 space-y-1 text-xs font-medium text-muted-foreground">
              <Input type="date" value={dateRange} onChange={(event) => setDateRange(event.target.value)} aria-label="Filter order date" className="pr-10" />
            </label>
            <div className="flex items-center justify-end gap-3">
           
            <Button type="button" onClick={openAddOrder}>
              <ClipboardCheck className="h-4 w-4" />
              Add LDT Order
            </Button>
          </div>
          </div>

          <DataTable data={filteredRows} columns={columns} />
        </CardContent>
      </Card>

      <Drawer
        open={orderDrawerOpen}
        onOpenChange={(open) => {
          setOrderDrawerOpen(open);
          if (!open) setEditingRow(null);
        }}
        title={editingRow ? `Edit ${editingRow.orderNo}` : "Add Order"}
       
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOrderDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveLdtOrder}>
              Save Order
            </Button>
          </div>
        }
      >
        <LdtTestOrderTab draft={draft} onDraftChange={setDraft} onSave={saveLdtOrder} readOnly={false} errors={draftErrors} />
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete LDT order"
        description={deleteTarget?.nurseLocked ? "This order was inserted from Nurse side, so it cannot be deleted." : `Are you sure you want to delete ${deleteTarget?.orderNo ?? "this LDT order"}?`}
        confirmLabel="Delete"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      <Drawer
        open={viewDrawerOpen && Boolean(viewingRow)}
        onOpenChange={(open) => {
          setViewDrawerOpen(open);
          if (!open) setViewingRow(null);
        }}
        title={viewingRow ? `View ${viewingRow.orderNo}` : "View LDT Order"}
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => setViewDrawerOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {viewingRow ? <ViewContent row={viewingRow} /> : null}
      </Drawer>
    </div>
  );
}

function ViewContent({ row }: { row: TestOrderRow }) {
  const config = getLdtTypeConfig(row.ldtTypeId);
  const dynamicFields = config?.fields ?? [];
  const removalInfo = buildRemovalInfo(row);
  const assessmentRows = buildAssessmentRows(row);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailItem label="Order No" value={row.orderNo} />
        <DetailItem label="LDT Type" value={row.ldtType} />
        <DetailItem label="LDT Name" value={row.ldtName} />
        <DetailItem label="Priority" value={row.priority} />
        <DetailItem label="Indication" value={row.indication} />
        <DetailItem label="Order Date" value={row.orderDate} />
        <DetailItem label="Status" value={row.status} />
        <DetailItem label="Clinical Notes" value={row.clinicalNotes || "-"} />
      </div>

      <section className="space-y-3 rounded-lg border border-border bg-surface-muted/30 p-4">
        <h4 className="text-sm font-semibold text-foreground">Dynamic Values</h4>
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {dynamicFields.length ? (
                dynamicFields.map((field) => {
                  const value = row.dynamicValues[field.id];
                  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return null;
                  return (
                    <tr key={field.id} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2 font-medium text-foreground">{field.label}</td>
                      <td className="px-3 py-2 text-muted-foreground">{formatValue(value)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-3 py-3 text-muted-foreground" colSpan={2}>
                    No dynamic values saved.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-surface-muted/30 p-4">
        <h4 className="text-sm font-semibold text-foreground">Assessment History</h4>
        <div className="overflow-hidden rounded-md border border-border bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Date &amp; Time</th>
                <th className="px-3 py-2">Assessment</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">By</th>
              </tr>
            </thead>
            <tbody>
              {assessmentRows.length ? (
                assessmentRows.map((item, index) => (
                  <tr key={`${item.assessment}-${index}`} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-muted-foreground">{item.dateTime}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{item.assessment}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.value}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.by}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-3 text-muted-foreground" colSpan={4}>
                    No assessment history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {row.status === "Completed" || row.status === "Cancelled" ? (
        <section className="space-y-3 rounded-lg border border-border bg-surface-muted/30 p-4">
          <h4 className="text-sm font-semibold text-foreground">Removal Information</h4>
          <div className="overflow-hidden rounded-md border border-border bg-background">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Field</th>
                  <th className="px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {removalInfo.map((item) => (
                  <tr key={item.field} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 font-medium text-foreground">{item.field}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SelectFilter<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: readonly T[] }) {
  return (
    <label className="space-y-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

