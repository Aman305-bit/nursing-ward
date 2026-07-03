"use client";

import * as React from "react";
import { BedDouble, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdmissionStore } from "@/features/admission/admission-store";
import { admissionBeds } from "@/features/admission/data/admission-data";
import type { AdmissionBed, AdmissionBedStatus } from "@/features/admission/types";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";
import { cn } from "@/lib/utils";

const allStatuses: Array<"All" | AdmissionBedStatus> = [
  "All",
  "Available",
  "Occupied",
  "Reserved",
  "Cleaning",
  "Maintenance",
  "Isolation",
  "Blocked",
];

const allWards = ["All", ...Array.from(new Set(admissionBeds.map((bed) => bed.ward)))];

function bedText(bed: AdmissionBed) {
  return `${bed.bedNo} ${bed.ward} ${bed.floor} ${bed.roomType} ${bed.nurseStation} ${bed.status} ${bed.tags.join(" ")}`.toLowerCase();
}

export function BedManagerWorkspace() {
  const { state, activeRequest, actions } = useAdmissionStore();
  const [search, setSearch] = React.useState("");
  const [ward, setWard] = React.useState("All");
  const [status, setStatus] = React.useState<"All" | AdmissionBedStatus>("Available");
  const [selectedId, setSelectedId] = React.useState<string>(state.beds.find((bed) => bed.status === "Available")?.id ?? state.beds[0]?.id ?? "");
  const activeRequests = state.requests.filter((request) => ["Pending Bed Allotment", "Accepted", "Billing Hold", "Ready for Nursing"].includes(request.status));

  const beds = state.beds.filter((bed) => {
    const wardMatch = ward === "All" || bed.ward === ward;
    const statusMatch = status === "All" || bed.status === status;
    return wardMatch && statusMatch && bedText(bed).includes(search.toLowerCase());
  });
  const selected = state.beds.find((bed) => bed.id === selectedId) ?? beds[0] ?? state.beds[0];

  function count(value: AdmissionBedStatus) {
    return state.beds.filter((bed) => bed.status === value).length;
  }

  function allotSelectedBed() {
    if (!selected) {
      toast.error("Select a bed first.");
      return;
    }
    if (selected.status !== "Available") {
      toast.error("Only available beds can be allotted.");
      return;
    }
    if (!activeRequest) {
      toast.error("Select an active request first.");
      return;
    }
    actions.allotBed(selected.id, activeRequest.id);
    toast.success(`${selected.bedNo} allotted to ${activeRequest.patient}.`);
    setStatus("Reserved");
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Bed Manager</CardTitle>
          <CardDescription>Review patient requests, room/ward availability, and bed manager actions.</CardDescription>
        </div>
        <Badge tone="info">Step 3</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs font-medium text-muted-foreground">Active Request</div>
            <div className="mt-1 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold">{activeRequest?.patient ?? "No active request selected"}</div>
                <div className="text-xs text-muted-foreground">
                  {activeRequest ? `${activeRequest.uhid} | ${activeRequest.doctor} | Ward: ${activeRequest.ward}` : "Use the selector below or open from Admission Desk."}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeRequest ? (
                  <>
                    <AdmissionStatusBadge value={activeRequest.type} />
                    <AdmissionStatusBadge value={activeRequest.priority} />
                    <AdmissionStatusBadge value={activeRequest.status} />
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <BedStat label="Available beds" value={count("Available")} />
            <BedStat label="Occupied beds" value={count("Occupied")} />
            <BedStat label="Beds under service" value={count("Cleaning") + count("Maintenance")} />
            <BedStat label="Reserved beds" value={count("Reserved")} />
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search bed, ward, floor, station" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={ward} onChange={(event) => setWard(event.target.value)}>
              {allWards.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={status} onChange={(event) => setStatus(event.target.value as "All" | AdmissionBedStatus)}>
              {allStatuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>

          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={activeRequest?.id ?? ""}
            onChange={(event) => actions.setActiveRequest(event.target.value)}
          >
            <option value="" disabled>Select active admission request</option>
            {activeRequests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.patient} | {request.uhid} | {request.status}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {allStatuses.map((item) => (
              <Button key={item} size="sm" variant={status === item ? "default" : "outline"} onClick={() => setStatus(item)}>
                {item}
              </Button>
            ))}
          </div>

          <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div>
                <div className="text-sm font-semibold">Bed list</div>
                <div className="text-xs text-muted-foreground">{beds.length} beds found from 100 total beds</div>
              </div>
              <Badge tone="success">{beds.filter((bed) => bed.status === "Available").length} ready beds</Badge>
            </div>
            <div className="max-h-[520px] overflow-y-auto p-3">
              <div className="grid gap-2 md:grid-cols-2">
                {beds.map((bed) => {
                  const selectedBed = selected?.id === bed.id;
                  return (
                    <button
                      className={cn(
                        "rounded-lg border border-border p-3 text-left transition hover:border-primary/45 hover:bg-surface-muted",
                        selectedBed && "border-primary bg-primary/5",
                      )}
                      key={bed.id}
                      onClick={() => setSelectedId(bed.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-info/10 text-info">
                            <BedDouble className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{bed.bedNo}</div>
                            <div className="truncate text-xs text-muted-foreground">{bed.ward} | {bed.floor} | {bed.roomType}</div>
                          </div>
                        </div>
                        <AdmissionStatusBadge value={bed.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {bed.tags.slice(0, 3).map((tag) => <Badge key={tag} tone="info">{tag}</Badge>)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          {selected ? (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Room/Ward</div>
                  <div className="mt-1 text-lg font-semibold">{selected.bedNo}</div>
                  <div className="text-xs text-muted-foreground">{selected.ward} | {selected.floor}</div>
                </div>
                <AdmissionStatusBadge value={selected.status} />
              </div>
              <div className="mt-4 space-y-3 rounded-lg bg-surface-muted p-3 text-sm">
                <Detail label="Room Type" value={selected.roomType} />
                <Detail label="Nurse Station" value={selected.nurseStation} />
                <Detail label="Last Updated" value={selected.lastUpdated} />
              </div>
            </div>
          ) : null}
          {["Ready to allot", "Requested room/ward matched", "No isolation conflict"].map((item) => (
            <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success" key={item}>
              <CheckCircle2 className="h-4 w-4" />
              {item}
            </div>
          ))}
          <div className="rounded-lg border border-info/20 bg-info/10 p-3 text-sm font-semibold text-info">Recommendation score: 100/100</div>
          <Button className="w-full" disabled={!selected || selected.status !== "Available" || !activeRequest} onClick={allotSelectedBed}>
            Allot Selected Bed
          </Button>
        </aside>
      </CardContent>
    </Card>
  );
}

function BedStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="font-semibold text-foreground">{value}</div>
    </div>
  );
}
