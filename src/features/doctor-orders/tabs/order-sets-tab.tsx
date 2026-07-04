"use client";

import * as React from "react";
import { Edit2, Layers3, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";

type SetStatus = "Draft" | "Submitted" | "Partially Completed" | "Completed";
type IncludedOrder = { id: string; name: string; selected: boolean; quantity: string; frequency: string; priority: string };
type OrderSet = {
  id: string;
  orderSetName: string;
  department: string;
  diagnosis: string;
  instructions: string;
  status: SetStatus;
  includedOrders: IncludedOrder[];
};

const departments = ["ICU", "Medicine", "Surgery", "Emergency", "Cardiology"];
const orderLibrary = ["Drugs", "Pathology", "Radiology", "Procedures", "Refer/Consult"];
const selectedItemsByModule: Record<string, string[]> = {
  Drugs: ["Paracetamol 650", "Pantoprazole", "Ceftriaxone", "NS 500 ml", "Insulin"],
  Pathology: ["CBC", "KFT", "LFT", "HbA1c"],
  Radiology: ["Chest X-Ray", "CT Brain"],
  Procedures: ["Dressing Change"],
  Requests: ["Vital sign check", "Mobility review", "Request 3"],
};
const initialSets: OrderSet[] = [
  { id: "set-1", orderSetName: "Chest pain panel", department: "Cardiology", diagnosis: "Chest pain", instructions: "Follow ACS pathway", status: "Submitted", includedOrders: orderLibrary.map((name, index) => ({ id: `${name}-${index}`, name, selected: true, quantity: "1", frequency: "Once", priority: "Routine" })) },
  { id: "set-2", orderSetName: "ICU sepsis set", department: "ICU", diagnosis: "Sepsis", instructions: "Bundle for ICU admission", status: "Draft", includedOrders: orderLibrary.map((name, index) => ({ id: `${name}-2-${index}`, name, selected: index !== 1, quantity: "1", frequency: "Once", priority: "Urgent" })) },
];

function confirmDelete(message: string) {
  return window.confirm(message);
}

function StatusBadge({ status }: { status: SetStatus }) {
  const tone = status === "Completed" ? "success" : status === "Partially Completed" ? "warning" : status === "Submitted" ? "info" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}

export function OrderSetsTab() {
  const [activeTab, setActiveTab] = React.useState<"test-order" | "order-summary">("test-order");
  const [sets, setSets] = React.useState(initialSets);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [expandedModule, setExpandedModule] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<OrderSet>({
    id: "",
    orderSetName: "",
    department: "ICU",
    diagnosis: "",
    instructions: "",
    status: "Draft",
    includedOrders: orderLibrary.map((name, index) => ({ id: `${name}-${index}`, name, selected: true, quantity: "1", frequency: "Once", priority: "Routine" })),
  });

  const filtered = sets.filter((item) => `${item.orderSetName} ${item.department} ${item.status}`.toLowerCase().includes(search.trim().toLowerCase()));

  const save = () => {
    if (!draft.orderSetName.trim()) return toast.error("Order Set Name is required");
    if (editingId) {
      setSets((current) => current.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
      toast.success("Order set updated");
    } else {
      setSets((current) => [{ ...draft, id: `set-${Date.now()}` }, ...current]);
      toast.success("Order set saved");
    }
    setEditingId(null);
    setDraft({ ...draft, id: "", orderSetName: "", diagnosis: "", instructions: "" });
  };

  const edit = (id: string) => {
    const item = sets.find((row) => row.id === id);
    if (!item) return;
    setEditingId(id);
    setDraft(item);
    setActiveTab("test-order");
  };

  const remove = (id: string) => {
    if (!confirmDelete("Delete this order set?")) return;
    setSets((current) => current.filter((item) => item.id !== id));
    toast.success("Order set deleted");
  };

  const toggleIncluded = (id: string) => setDraft((current) => ({ ...current, includedOrders: current.includedOrders.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)) }));
  const updateIncluded = (id: string, values: Partial<IncludedOrder>) => setDraft((current) => ({ ...current, includedOrders: current.includedOrders.map((item) => (item.id === id ? { ...item, ...values } : item)) }));
  return (
    <div className="space-y-4">
      {/* <PatientSummaryBanner /> */}
      <Card>
        {/* <CardHeader>
          <CardTitle>Order Sets</CardTitle>
          <CardDescription>Order set builder for multiple orders with selective inclusion and quantity controls.</CardDescription>
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
              <div className="grid gap-4 md:grid-cols-4">
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Order Set Name</div><Input value={draft.orderSetName} onChange={(e) => setDraft((d) => ({ ...d, orderSetName: e.target.value }))} /></label>
                <label className="space-y-2"><div className="text-xs font-medium text-muted-foreground">Department / Specialty</div><select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={draft.department} onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))}>{departments.map((d) => <option key={d}>{d}</option>)}</select></label>
                <label className="space-y-2 md:col-span-2"><div className="text-xs font-medium text-muted-foreground">Diagnosis / Condition</div><Input value={draft.diagnosis} onChange={(e) => setDraft((d) => ({ ...d, diagnosis: e.target.value }))} /></label>
                <label className="space-y-2 md:col-span-2"><div className="text-xs font-medium text-muted-foreground">Special Notes/ Comments</div><textarea className="min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.instructions} onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value }))} /></label>
              
              </div>
              <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
                  <div className="text-sm font-semibold text-foreground">Included Orders</div>
                  {/* <div className="text-xs text-muted-foreground">Use View to open module-wise selected items.</div> */}
                  <div className="grid gap-3 md:grid-cols-2">
                    {draft.includedOrders.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="checkbox" checked={item.selected} onChange={() => toggleIncluded(item.id)} />
                            {item.name}
                          </label>
                          <Button type="button" size="sm" variant="outline" onClick={() => setExpandedModule((current) => (current === item.name ? null : item.name))}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                <div key={item.id} className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[minmax(0,1fr)_120px_140px_auto] md:items-center">
                  <div><div className="font-semibold text-foreground">{item.orderSetName}</div><div className="text-xs text-muted-foreground">{item.diagnosis}</div></div>
                  <StatusBadge status={item.status} />
                  <Badge tone="info">{item.department}</Badge>
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

      <Drawer
        open={Boolean(expandedModule)}
        onOpenChange={(open) => !open && setExpandedModule(null)}
        title={expandedModule ?? "Order set"}
        className="w-[calc(100vw-2rem)] max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setExpandedModule(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => { toast.success(`${expandedModule} saved`); setExpandedModule(null); }}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          {(selectedItemsByModule[expandedModule ?? ""] ?? []).map((label) => (
            <label key={label} className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input accent-primary" />
              {label}
            </label>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
