"use client";

import * as React from "react";
import { Edit2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";

type ProcedureStatus = "Ordered" | "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type ProcedurePriority = "Routine" | "Urgent" | "STAT";
type ProcedureItem = {
  id: string;
  procedureName: string;
  procedureType: string;
  priority: ProcedurePriority;
  reason: string;
  requiredDateTime: string;
  consentRequired: boolean;
  specialInstructions: string;
  assignedDepartment: string;
  status: ProcedureStatus;
};

const types = ["Bedside Procedure",
"Diagnostic Procedure",
"Therapeutic Procedure",
"Surgical Procedure",
"Interventional Procedure",
"Endoscopy Procedure",
"Cardiology Procedure",
"Respiratory Procedure",
"ICU"] as const;

const departments = ["General Surgery",
"Orthopedics",
"Cardiology",
"Neurology",
"Gastroenterology",
"Pulmonology",
"ENT",
"Urology",
"Nephrology",
"Radiology",
"Nursing",
"Cath Lab",
"Operation Theatre"] as const;

const initialItems: ProcedureItem[] = [
  { id: "proc-1", procedureName: "Dressing change", procedureType: "Bedside", priority: "Routine", reason: "Post-op wound care", requiredDateTime: "2026-06-08T11:00", consentRequired: false, specialInstructions: "Aseptic technique", assignedDepartment: "Nursing", status: "Ordered" },
  { id: "proc-2", procedureName: "Central line insertion", procedureType: "ICU", priority: "STAT", reason: "Vasopressor support", requiredDateTime: "2026-06-08T12:30", consentRequired: true, specialInstructions: "Use ultrasound", assignedDepartment: "ICU", status: "Scheduled" },
];

function confirmDelete(message: string) {
  return window.confirm(message);
}

function StatusBadge({ status }: { status: ProcedureStatus }) {
  const tone = status === "Completed" ? "success" : status === "Cancelled" ? "danger" : status === "In Progress" ? "warning" : status === "Scheduled" ? "info" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}

export function ProceduresTab() {
  const [activeTab, setActiveTab] = React.useState<"test-order" | "order-summary">("test-order");
  const [items, setItems] = React.useState(initialItems);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [draft, setDraft] = React.useState<ProcedureItem>({
    id: "",
    procedureName: "",
    procedureType: "Bedside",
    priority: "Routine",
    reason: "",
    requiredDateTime: "",
    consentRequired: false,
    specialInstructions: "",
    assignedDepartment: "Nursing",
    status: "Ordered",
  });

  const filtered = items.filter((item) => `${item.procedureName} ${item.procedureType} ${item.status}`.toLowerCase().includes(search.trim().toLowerCase()));

  const save = () => {
    if (!draft.procedureName.trim()) return toast.error("Procedure Name is required");
    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
      toast.success("Procedure updated");
    } else {
      setItems((current) => [{ ...draft, id: `proc-${Date.now()}` }, ...current]);
      toast.success("Procedure saved");
    }
    setEditingId(null);
    setDraft({ ...draft, id: "", procedureName: "", reason: "", requiredDateTime: "", specialInstructions: "" });
  };

  const edit = (id: string) => {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    setEditingId(id);
    setDraft(item);
    setActiveTab("test-order");
  };

  const remove = (id: string) => {
    if (!confirmDelete("Delete this procedure order?")) return;
    setItems((current) => current.filter((item) => item.id !== id));
    toast.success("Procedure deleted");
  };

  return (
    <div className="space-y-4">
      {/* <PatientSummaryBanner /> */}
      <Card>
        {/* <CardHeader>
          <CardTitle>Procedures Order</CardTitle>
          <CardDescription>Doctor-side procedure request with schedule, consent, and review tabs.</CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["test-order", "order-summary"] as const).map((tab) => (
              <Button key={tab} size="sm" variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)}>
                {tab === "test-order" ? "Test Order" : tab === "order-summary" ? "Order Summary" : "Result / Status Review"}
              </Button>
            ))}
          </div>

          {activeTab === "test-order" ? (
            <div className="grid gap-4 ">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Procedure Name</div><Input value={draft.procedureName} onChange={(e) => setDraft((d) => ({ ...d, procedureName: e.target.value }))} /></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Procedure Type</div><select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={draft.procedureType} onChange={(e) => setDraft((d) => ({ ...d, procedureType: e.target.value }))}>{types.map((t) => <option key={t}>{t}</option>)}</select></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Priority</div><select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as ProcedurePriority }))}><option>Routine</option><option>Urgent</option><option>STAT</option></select></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Required Date & Time</div><Input type="datetime-local" value={draft.requiredDateTime} onChange={(e) => setDraft((d) => ({ ...d, requiredDateTime: e.target.value }))} /></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Consent Required</div><select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={String(draft.consentRequired)} onChange={(e) => setDraft((d) => ({ ...d, consentRequired: e.target.value === "true" }))}><option value="true">Written Consent</option><option value="true">Verbal Consent</option><option value="false">No</option></select></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Assigned Department</div><select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={draft.assignedDepartment} onChange={(e) => setDraft((d) => ({ ...d, assignedDepartment: e.target.value }))}>{departments.map((d) => <option key={d}>{d}</option>)}</select></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Reason / Diagnosis</div><textarea className="min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.reason} onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))} /></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Special Instructions</div><textarea className="min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.specialInstructions} onChange={(e) => setDraft((d) => ({ ...d, specialInstructions: e.target.value }))} /></label>
              </div>
              {/* <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
                <div className="text-sm font-semibold text-foreground">Order Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="rounded-md border border-border bg-white p-3">Procedure: <span className="font-semibold">{draft.procedureName || "-"}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Department: <span className="font-semibold">{draft.assignedDepartment}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Priority: <span className="font-semibold">{draft.priority}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Status: <span className="font-semibold">{draft.status}</span></div>
                </div>
                </div> */}
                <div className="ml-auto flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("order-summary")}>
                    View 
                  </Button>
                  <Button type="button"  onClick={save}>
                    Save
                  </Button>
                </div>
            </div>
          ) : null}

          {activeTab === "order-summary" ? (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[minmax(0,1fr)_120px_100px_auto] md:items-center">
                  <div><div className="font-semibold text-foreground">{item.procedureName}</div><div className="text-xs text-muted-foreground">{item.reason}</div></div>
                  <StatusBadge status={item.status} />
                  <Badge tone={item.priority === "STAT" ? "danger" : item.priority === "Urgent" ? "warning" : "success"}>{item.priority}</Badge>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => edit(item.id)}><Edit2 className="h-4 w-4" />Edit</Button>
                    <Button size="sm" variant="outline" className="text-danger" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" />Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

        </CardContent>
      </Card>
    </div>
  );
}
