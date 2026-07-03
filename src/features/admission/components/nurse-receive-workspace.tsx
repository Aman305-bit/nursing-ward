"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdmissionStore } from "@/features/admission/admission-store";
import { nurseReceiveChecklist } from "@/features/admission/data/admission-data";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";

export function NurseReceiveWorkspace() {
  const { state, activeRequest, actions } = useAdmissionStore();
  const readyRequests = state.requests.filter((request) => ["Ready for Nursing", "Received", "Care Started"].includes(request.status));
  const currentRequest = readyRequests.find((request) => request.id === activeRequest?.id) ?? readyRequests[0] ?? null;
  const existing = state.receiveRecords.find((record) => record.requestId === currentRequest?.id);
  const admissionTime = currentRequest ? admissionTimeLabel(currentRequest) : "";
  const [receivedBy, setReceivedBy] = React.useState(existing?.receivedBy ?? "");
  const [receivedTime, setReceivedTime] = React.useState(existing?.receivedTime ?? "");
  const [checked, setChecked] = React.useState<string[]>(existing?.checklist ?? []);

  React.useEffect(() => {
    const nextExisting = state.receiveRecords.find((record) => record.requestId === currentRequest?.id);
    queueMicrotask(() => {
      setReceivedBy(nextExisting?.receivedBy ?? "");
      setReceivedTime(nextExisting?.receivedTime ?? "");
      setChecked(nextExisting?.checklist ?? []);
    });
  }, [currentRequest?.id, state.receiveRecords]);

  function toggle(item: string) {
    setChecked((current) => (current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]));
  }

  function confirmReceive() {
    if (!currentRequest) {
      toast.error("No bed-allotted patient available.");
      return;
    }
    if (!receivedBy || !receivedTime || checked.length !== nurseReceiveChecklist.length) {
      toast.error("Complete nurse name, receive time, and all checklist items.");
      return;
    }
    actions.confirmReceive({
      requestId: currentRequest.id,
      receivedBy,
      receivedTime,
      checklist: checked,
    });
    toast.success("Patient received and ready for care.");
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Receive Patient</CardTitle>
          <CardDescription>Unit nurse verifies patient arrival and handover.</CardDescription>
        </div>
        <Badge tone="info">Step 4</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-muted p-3">
          <div className="text-xs font-medium text-muted-foreground">Patient handover</div>
          {currentRequest ? (
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold">{currentRequest.patient}</div>
                <div className="text-xs text-muted-foreground">
                  {currentRequest.uhid} | Bed: {currentRequest.bedNo ?? "Not assigned"} | Admission: {admissionTime}
                </div>
              </div>
              <AdmissionStatusBadge value={currentRequest.status} />
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">No patient is ready for nursing receive.</div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admission/bed-manager">Open Bed Manager</Link>
              </Button>
            </div>
          )}
        </div>

        <select
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          value={currentRequest?.id ?? ""}
          onChange={(event) => actions.setActiveRequest(event.target.value)}
          disabled={!readyRequests.length}
        >
          <option value="" disabled>Select patient to receive</option>
          {readyRequests.map((request) => (
            <option key={request.id} value={request.id}>
              {request.patient} | {request.uhid} | {request.bedNo ?? "No bed"} | Admission {admissionTimeLabel(request)}
            </option>
          ))}
        </select>

        <div className="grid gap-3 lg:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Received By</span>
            <Input placeholder="Enter nurse name" value={receivedBy} onChange={(event) => setReceivedBy(event.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Admission Time</span>
            <Input readOnly value={admissionTime} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Received Time</span>
            <Input type="datetime-local" value={receivedTime} onChange={(event) => setReceivedTime(event.target.value)} />
          </label>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="space-y-3">
            {nurseReceiveChecklist.map((item) => (
              <label className="flex items-center gap-2 text-sm" key={item}>
                <input className="h-4 w-4 rounded border-input text-primary focus:ring-ring" checked={checked.includes(item)} onChange={() => toggle(item)} type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/admission/nurse-care">Open Care</Link>
          </Button>
          <Button disabled={!currentRequest} onClick={confirmReceive}>
            <CheckCircle2 className="h-4 w-4" />
            Confirm Patient Received
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function admissionTimeLabel(request: { admissionTime?: string; createdAt?: string }) {
  return request.admissionTime ?? request.createdAt ?? "Auto from admission order";
}
