"use client";

import * as React from "react";
import { Edit2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";

type ReferralStatus = "Requested" | "Accepted" | "Seen" | "Completed";
type ReferralUrgency = "Routine" | "Urgent";
type ReferralItem = {
  id: string;
  referToDepartment: string;
  consultantDoctor: string;
  reason: string;
  urgency: ReferralUrgency;
  clinicalSummary: string;
  preferredDateTime: string;
  notes: string;
  status: ReferralStatus;
};

const departments = ["Cardiology", "Neurology", "Nephrology", "Pulmonology", "Gastroenterology", "Endocrinology"] as const;

const initialItems: ReferralItem[] = [
  { id: "ref-1", referToDepartment: "Cardiology", consultantDoctor: "Dr. Raj Mehta", reason: "Chest discomfort", urgency: "Routine", clinicalSummary: "Troponin pending", preferredDateTime: "2026-06-08T11:30", notes: "Please review ECG", status: "Requested" },
  { id: "ref-2", referToDepartment: "Nephrology", consultantDoctor: "Dr. Nisha Verma", reason: "Creatinine rise", urgency: "Urgent", clinicalSummary: "CKD suspected", preferredDateTime: "2026-06-08T12:00", notes: "Fluid balance concern", status: "Accepted" },
];

function confirmDelete(message: string) {
  return window.confirm(message);
}

function StatusBadge({ status }: { status: ReferralStatus }) {
  const tone = status === "Completed" ? "success" : status === "Seen" ? "info" : status === "Accepted" ? "warning" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}

export function ReferConsultationTab() {
  const [activeTab, setActiveTab] = React.useState<"test-order" | "order-summary">("test-order");
  const [items, setItems] = React.useState(initialItems);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [draft, setDraft] = React.useState<ReferralItem>({
    id: "",
    referToDepartment: "Cardiology",
    consultantDoctor: "",
    reason: "",
    urgency: "Routine",
    clinicalSummary: "",
    preferredDateTime: "",
    notes: "",
    status: "Requested",
  });

  const filtered = items.filter((item) => `${item.consultantDoctor} ${item.referToDepartment} ${item.status}`.toLowerCase().includes(search.trim().toLowerCase()));

  const save = () => {
    if (!draft.consultantDoctor.trim()) return toast.error("Consultant Doctor is required");
    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
      toast.success("Referral updated");
    } else {
      setItems((current) => [{ ...draft, id: `ref-${Date.now()}` }, ...current]);
      toast.success("Referral saved");
    }
    setEditingId(null);
    setDraft({ ...draft, id: "", consultantDoctor: "", reason: "", clinicalSummary: "", preferredDateTime: "", notes: "" });
  };

  const edit = (id: string) => {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    setEditingId(id);
    setDraft(item);
    setActiveTab("test-order");
  };

  const remove = (id: string) => {
    if (!confirmDelete("Delete this referral?")) return;
    setItems((current) => current.filter((item) => item.id !== id));
    toast.success("Referral deleted");
  };

  return (
    <div className="space-y-4">
      {/* <PatientSummaryBanner /> */}
      <Card>
        {/* <CardHeader>
          <CardTitle>Referral / Consult</CardTitle>
          <CardDescription>Doctor referral screen with department, consultant, reason, notes, and review flow.</CardDescription>
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
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Refer To Department</div><select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={draft.referToDepartment} onChange={(e) => setDraft((d) => ({ ...d, referToDepartment: e.target.value }))}>{departments.map((d) => <option key={d}>{d}</option>)}</select></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Consultant Doctor</div><Input value={draft.consultantDoctor} onChange={(e) => setDraft((d) => ({ ...d, consultantDoctor: e.target.value }))} placeholder="Consultant name" /></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Urgency</div><select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={draft.urgency} onChange={(e) => setDraft((d) => ({ ...d, urgency: e.target.value as ReferralUrgency }))}><option>Routine</option><option>Urgent</option></select></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Date & Time</div><Input type="datetime-local" value={draft.preferredDateTime} onChange={(e) => setDraft((d) => ({ ...d, preferredDateTime: e.target.value }))} /></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Reason for Reference</div><textarea className="min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.reason} onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))} /></label>
                {/* <label className="space-y-2 md:col-span-2"><div className="text-xs font-medium text-muted-foreground">Referral Notes</div><textarea className="min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.clinicalSummary} onChange={(e) => setDraft((d) => ({ ...d, clinicalSummary: e.target.value }))} /></label> */}
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Referral Notes</div><textarea className="min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} /></label>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("order-summary")}>
                  View 
                </Button>
                <Button type="button"  onClick={save}>
                  Save
                </Button>
              </div>
              {/* <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
                <div className="text-sm font-semibold text-foreground">Consultation Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="rounded-md border border-border bg-white p-3">Department: <span className="font-semibold">{draft.referToDepartment}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Consultant: <span className="font-semibold">{draft.consultantDoctor || "-"}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Urgency: <span className="font-semibold">{draft.urgency}</span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1" onClick={save}><Save className="h-4 w-4" />Submit Order</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setActiveTab("order-summary")}>View Summary</Button>
                </div>
              </div> */}
            </div>
          ) : null}

          {activeTab === "order-summary" ? (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_auto] md:items-center">
                  <div><div className="font-semibold text-foreground">{item.consultantDoctor}</div><div className="text-xs text-muted-foreground">{item.reason}</div></div>
                  <StatusBadge status={item.status} />
                  <Badge tone={item.urgency === "Urgent" ? "warning" : "success"}>{item.urgency}</Badge>
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
