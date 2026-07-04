"use client";

import * as React from "react";
import { Edit2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";

type RequestStatus = "Requested" | "In Progress" | "Completed";
type RequestPriority = "Routine" | "Urgent" | "STAT";
type RequestType = "Nursing" | "Dietary" | "Physiotherapy" | "Equipment" | "Transport" | "Housekeeping" | "Discharge" | "Blood Bank";
type DietType = "Normal Diet" | "Diabetic Diet" | "Renal Diet" | "Cardiac Diet" | "Liquid Diet" | "Soft Diet" | "High Protein Diet";
type SessionFrequency = "Once" | "Daily" | "Twice Daily";
type EquipmentType = "Wheelchair" | "Infusion Pump" | "Syringe Pump" | "Oxygen Cylinder" | "Ventilator" | "Cardiac Monitor";
type Location = "Ward" | "ICU" | "OT" | "CT Scan" | "MRI" | "Radiology" | "Cath Lab";
type BloodProduct = "Packed RBC" | "FFP" | "Platelets" | "Whole Blood";
type RequestItem = {
  id: string;
  requestType: string;
  requestTitle: string;
  dietType: string;
  sessionFrequency: string;
  equipmentType: string;
  quantity: string;
  fromLocation: string;
  toLocation: string;
  expectedDischargeDate: string;
  bloodProduct: string;
  units: string;
  description: string;
  priority: RequestPriority;
  requiredByDateTime: string;
  assignedToDepartment: string;
  remarks: string;
  status: RequestStatus;
};

const requestTypes: RequestType[] = ["Nursing", "Dietary", "Physiotherapy", "Equipment", "Transport", "Housekeeping", "Discharge", "Blood Bank"];
const dietTypes: DietType[] = ["Normal Diet", "Diabetic Diet", "Renal Diet", "Cardiac Diet", "Liquid Diet", "Soft Diet", "High Protein Diet"];
const sessionFrequencies: SessionFrequency[] = ["Once", "Daily", "Twice Daily"];
const equipmentTypes: EquipmentType[] = ["Wheelchair", "Infusion Pump", "Syringe Pump", "Oxygen Cylinder", "Ventilator", "Cardiac Monitor"];
const locations: Location[] = ["Ward", "ICU", "OT", "CT Scan", "MRI", "Radiology", "Cath Lab"];
const bloodProducts: BloodProduct[] = ["Packed RBC", "FFP", "Platelets", "Whole Blood"];
const initialItems: RequestItem[] = [
  { id: "req-1", requestType: "Nursing", requestTitle: "Vital sign check", dietType: "", sessionFrequency: "", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", expectedDischargeDate: "", bloodProduct: "", units: "", description: "Patient needs repeat vitals", priority: "Routine", requiredByDateTime: "2026-06-08T10:30", assignedToDepartment: "Nursing", remarks: "Before rounds", status: "Requested" },
  { id: "req-2", requestType: "Physiotherapy", requestTitle: "Mobility review", dietType: "", sessionFrequency: "Daily", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", expectedDischargeDate: "", bloodProduct: "", units: "", description: "Post-op ambulation support", priority: "Urgent", requiredByDateTime: "2026-06-08T12:00", assignedToDepartment: "Physiotherapy", remarks: "", status: "In Progress" },
];

function confirmDelete(message: string) {
  return window.confirm(message);
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = status === "Completed" ? "success" : status === "In Progress" ? "warning" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function defaultDraft(): RequestItem {
  return {
    id: "",
    requestType: "Nursing",
    requestTitle: "",
    dietType: "",
    sessionFrequency: "Once",
    equipmentType: "",
    quantity: "1",
    fromLocation: "Ward",
    toLocation: "ICU",
    expectedDischargeDate: todayIso(),
    bloodProduct: "Packed RBC",
    units: "1",
    description: "",
    priority: "Routine",
    requiredByDateTime: `${todayIso()}T${currentTime()}`,
    assignedToDepartment: "Nursing",
    remarks: "",
    status: "Requested",
  };
}

function requestTone(priority: RequestPriority) {
  return priority === "STAT" ? "danger" : priority === "Urgent" ? "warning" : "success";
}

function isType(value: string, type: RequestType) {
  return value === type;
}

export function RequestsTab() {
  const [activeTab, setActiveTab] = React.useState<"test-order" | "order-summary">("test-order");
  const [items, setItems] = React.useState(initialItems);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [draft, setDraft] = React.useState<RequestItem>(defaultDraft());
  const [requestType, setRequestType] = React.useState<RequestType>("Nursing");

  const syncTypeDefaults = (type: RequestType) => {
    setRequestType(type);
    setDraft((current) => {
      const base = { ...current, requestType: type };
      if (type === "Nursing") return { ...base, requestTitle: base.requestTitle || "", assignedToDepartment: "Nursing", dietType: "", sessionFrequency: "", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", bloodProduct: "", units: "", expectedDischargeDate: "" };
      if (type === "Dietary") return { ...base, requestTitle: base.requestTitle || "", dietType: base.dietType || "Normal Diet", assignedToDepartment: "Dietary", sessionFrequency: "", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", bloodProduct: "", units: "", expectedDischargeDate: "" };
      if (type === "Physiotherapy") return { ...base, requestTitle: base.requestTitle || "", sessionFrequency: base.sessionFrequency || "Once", assignedToDepartment: "Physiotherapy", dietType: "", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", bloodProduct: "", units: "", expectedDischargeDate: "" };
      if (type === "Equipment") return { ...base, requestTitle: base.requestTitle || "", equipmentType: base.equipmentType || "Wheelchair", quantity: base.quantity || "1", assignedToDepartment: "Maintenance", dietType: "", sessionFrequency: "", fromLocation: "", toLocation: "", bloodProduct: "", units: "", expectedDischargeDate: "" };
      if (type === "Transport") return { ...base, requestTitle: base.requestTitle || "", fromLocation: base.fromLocation || "Ward", toLocation: base.toLocation || "ICU", assignedToDepartment: "Transport", dietType: "", sessionFrequency: "", equipmentType: "", quantity: "", bloodProduct: "", units: "", expectedDischargeDate: "" };
      if (type === "Housekeeping") return { ...base, requestTitle: base.requestTitle || "", assignedToDepartment: "Housekeeping", dietType: "", sessionFrequency: "", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", bloodProduct: "", units: "", expectedDischargeDate: "" };
      if (type === "Discharge") return { ...base, requestTitle: base.requestTitle || "", expectedDischargeDate: base.expectedDischargeDate || todayIso(), assignedToDepartment: "Ward", dietType: "", sessionFrequency: "", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", bloodProduct: "", units: "" };
      return { ...base, requestTitle: base.requestTitle || "", bloodProduct: base.bloodProduct || "Packed RBC", units: base.units || "1", assignedToDepartment: "Blood Bank", dietType: "", sessionFrequency: "", equipmentType: "", quantity: "", fromLocation: "", toLocation: "", expectedDischargeDate: "" };
    });
  };

  const filtered = items.filter((item) => `${item.requestTitle} ${item.requestType} ${item.status} ${item.dietType} ${item.equipmentType} ${item.bloodProduct}`.toLowerCase().includes(search.trim().toLowerCase()));

  const save = () => {
    const needsTitle = ["Nursing", "Housekeeping", "Other"].includes(draft.requestType) || !["Dietary", "Physiotherapy", "Equipment", "Transport", "Discharge", "Blood Bank"].includes(draft.requestType);
    if (needsTitle && !draft.requestTitle.trim()) return toast.error("Request Title is required");
    if (draft.requestType === "Dietary" && !draft.dietType) return toast.error("Diet Type is required");
    if (draft.requestType === "Physiotherapy" && !draft.sessionFrequency) return toast.error("Session Frequency is required");
    if (draft.requestType === "Equipment" && (!draft.equipmentType || !draft.quantity.trim())) return toast.error("Equipment Type and Quantity are required");
    if (draft.requestType === "Transport" && (!draft.fromLocation || !draft.toLocation)) return toast.error("From and To Location are required");
    if (draft.requestType === "Discharge" && !draft.expectedDischargeDate) return toast.error("Expected Discharge Date is required");
    if (draft.requestType === "Blood Bank" && (!draft.bloodProduct || !draft.units.trim())) return toast.error("Blood Product and Units are required");
    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
      toast.success("Request updated");
    } else {
      setItems((current) => [{ ...draft, id: `req-${Date.now()}` }, ...current]);
      toast.success("Request saved");
    }
    setEditingId(null);
    setDraft(defaultDraft());
    setRequestType("Nursing");
  };

  const edit = (id: string) => {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    setEditingId(id);
    setDraft(item);
    setRequestType(item.requestType as RequestType);
    setActiveTab("test-order");
  };

  const remove = (id: string) => {
    if (!confirmDelete("Delete this request?")) return;
    setItems((current) => current.filter((item) => item.id !== id));
    toast.success("Request deleted");
  };

  return (
    <div className="space-y-4">
      {/* <PatientSummaryBanner /> */}
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Doctor general requests for nursing, dietary, physiotherapy, equipment, transport, housekeeping, discharge, and blood bank.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["test-order", "order-summary"] as const).map((tab) => (
              <Button key={tab} size="sm" variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)}>
                {tab === "test-order" ? "Test Order" : tab === "order-summary" ? "Order Summary" : "Result / Status Review"}
              </Button>
            ))}
          </div>

          {activeTab === "test-order" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Request Type *</div>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={requestType} onChange={(e) => syncTypeDefaults(e.target.value as RequestType)}>
                    {requestTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>

                {["Nursing", "Housekeeping", "Dietary", "Physiotherapy", "Equipment", "Transport", "Blood Bank"].includes(requestType) ? (
                  <label className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Request Title *</div>
                    <Input value={draft.requestTitle} onChange={(e) => setDraft((d) => ({ ...d, requestTitle: e.target.value }))} placeholder="Enter request title" />
                  </label>
                ) : null}

                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Priority *</div>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as RequestPriority }))}>
                    <option>Routine</option><option>Urgent</option><option>STAT</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Required By Date & Time</div>
                  <Input type="datetime-local" value={draft.requiredByDateTime} onChange={(e) => setDraft((d) => ({ ...d, requiredByDateTime: e.target.value }))} />
                </label>

                {requestType === "Dietary" ? (
                  <label className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Diet Type *</div>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.dietType} onChange={(e) => setDraft((d) => ({ ...d, dietType: e.target.value }))}>
                      <option value="">Select</option>
                      {dietTypes.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                ) : null}

                {requestType === "Physiotherapy" ? (
                  <label className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Session Frequency *</div>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.sessionFrequency} onChange={(e) => setDraft((d) => ({ ...d, sessionFrequency: e.target.value }))}>
                      <option value="">Select</option>
                      {sessionFrequencies.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                ) : null}

                {requestType === "Equipment" ? (
                  <>
                    <label className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Equipment Type *</div>
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.equipmentType} onChange={(e) => setDraft((d) => ({ ...d, equipmentType: e.target.value }))}>
                        <option value="">Select</option>
                        {equipmentTypes.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Quantity *</div>
                      <Input type="number" min={1} value={draft.quantity} onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))} />
                    </label>
                  </>
                ) : null}

                {requestType === "Transport" ? (
                  <>
                    <label className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">From Location *</div>
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.fromLocation} onChange={(e) => setDraft((d) => ({ ...d, fromLocation: e.target.value }))}>
                        {locations.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">To Location *</div>
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.toLocation} onChange={(e) => setDraft((d) => ({ ...d, toLocation: e.target.value }))}>
                        {locations.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  </>
                ) : null}

                {requestType === "Housekeeping" ? (
                  <label className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Assigned Department</div>
                    <Input value="Housekeeping" readOnly />
                  </label>
                ) : null}

                {requestType === "Discharge" ? (
                  <label className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Expected Discharge Date *</div>
                    <Input type="date" value={draft.expectedDischargeDate} onChange={(e) => setDraft((d) => ({ ...d, expectedDischargeDate: e.target.value }))} />
                  </label>
                ) : null}

                {requestType === "Blood Bank" ? (
                  <>
                    <label className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Blood Product *</div>
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.bloodProduct} onChange={(e) => setDraft((d) => ({ ...d, bloodProduct: e.target.value }))}>
                        {bloodProducts.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Units *</div>
                      <Input type="number" min={1} value={draft.units} onChange={(e) => setDraft((d) => ({ ...d, units: e.target.value }))} />
                    </label>
                  </>
                ) : null}

                {requestType === "Nursing" ? (
                  <label className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Assigned Department</div>
                    <Input value="Nursing" readOnly />
                  </label>
                ) : null}

                <label className="space-y-2 md:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Description *</div>
                  <textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Remarks</div>
                  <textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" value={draft.remarks} onChange={(e) => setDraft((d) => ({ ...d, remarks: e.target.value }))} />
                </label>
              </div>
              <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
                <div className="text-sm font-semibold text-foreground">Request Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="rounded-md border border-border bg-white p-3">Title: <span className="font-semibold">{draft.requestTitle || "-"}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Type: <span className="font-semibold">{draft.requestType}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Priority: <span className="font-semibold">{draft.priority}</span></div>
                  <div className="rounded-md border border-border bg-white p-3">Status: <span className="font-semibold">{draft.status}</span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1" onClick={save}><Save className="h-4 w-4" />Submit Order</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setActiveTab("order-summary")}>View Summary</Button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "order-summary" ? (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_auto] md:items-center">
                  <div><div className="font-semibold text-foreground">{item.requestTitle || item.requestType}</div><div className="text-xs text-muted-foreground">{item.description}</div></div>
                  <StatusBadge status={item.status} />
                  <Badge tone={requestTone(item.priority)}>{item.priority}</Badge>
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
