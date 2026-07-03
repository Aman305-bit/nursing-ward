"use client";

import * as React from "react";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdmissionStore } from "@/features/admission/admission-store";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";

export function NurseCareWorkspace() {
  const { state, activeRequest, actions } = useAdmissionStore();
  const careRequests = state.requests.filter((request) => ["Received", "Care Started"].includes(request.status));
  const currentRequest = careRequests.find((request) => request.id === activeRequest?.id) ?? careRequests[0] ?? null;
  const existing = state.careRecords.find((record) => record.requestId === currentRequest?.id);
  const [bloodPressure, setBloodPressure] = React.useState(existing?.bloodPressure ?? "");
  const [pulse, setPulse] = React.useState(existing?.pulse ?? "");
  const [temperature, setTemperature] = React.useState(existing?.temperature ?? "");
  const [notes, setNotes] = React.useState(existing?.notes ?? "");

  React.useEffect(() => {
    const nextExisting = state.careRecords.find((record) => record.requestId === currentRequest?.id);
    setBloodPressure(nextExisting?.bloodPressure ?? "");
    setPulse(nextExisting?.pulse ?? "");
    setTemperature(nextExisting?.temperature ?? "");
    setNotes(nextExisting?.notes ?? "");
  }, [currentRequest?.id, state.careRecords]);

  function startCare() {
    if (!currentRequest) {
      toast.error("Receive a patient before starting care.");
      return;
    }
    if (!bloodPressure || !pulse || !temperature) {
      toast.error("Record BP, pulse, and temperature.");
      return;
    }
    actions.startCare({
      requestId: currentRequest.id,
      bloodPressure,
      pulse,
      temperature,
      notes,
      startedAt: new Date().toLocaleString("en-IN"),
    });
    toast.success("Initial care started.");
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Patient Care</CardTitle>
          <CardDescription>Start initial nursing care after patient receiving.</CardDescription>
        </div>
        <Badge tone="info">Step 5</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-muted p-3">
          <div className="text-xs font-medium text-muted-foreground">Care patient</div>
          {currentRequest ? (
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold">{currentRequest.patient}</div>
                <div className="text-xs text-muted-foreground">{currentRequest.uhid} | Bed: {currentRequest.bedNo ?? "Not assigned"}</div>
              </div>
              <AdmissionStatusBadge value={currentRequest.status} />
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted-foreground">No received patient available for care.</div>
          )}
        </div>

        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          value={currentRequest?.id ?? ""}
          onChange={(event) => actions.setActiveRequest(event.target.value)}
          disabled={!careRequests.length}
        >
          <option value="" disabled>Select patient for care</option>
          {careRequests.map((request) => (
            <option key={request.id} value={request.id}>{request.patient} | {request.uhid} | {request.status}</option>
          ))}
        </select>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Blood Pressure</span>
            <Input placeholder="120/80" value={bloodPressure} onChange={(event) => setBloodPressure(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Pulse</span>
            <Input placeholder="BPM" value={pulse} onChange={(event) => setPulse(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Temperature</span>
            <Input placeholder="F" value={temperature} onChange={(event) => setTemperature(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm md:col-span-3">
            <span className="font-medium">Care Notes</span>
            <textarea
              className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              placeholder="Initial nursing notes and care instructions"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>

        <div className="flex justify-end">
          <Button disabled={!currentRequest} onClick={startCare}>
            <HeartPulse className="h-4 w-4" />
            Start Patient Care
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
