"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, RefreshCcw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmissionStore } from "@/features/admission/admission-store";
import { admissionWorkflowCards } from "@/features/admission/data/admission-data";
import { PatientLookupWorkspace } from "@/features/admission/components/patient-lookup-workspace";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";

function workflowStatus(title: string, state: ReturnType<typeof useAdmissionStore>["state"]) {
  if (title === "Patient Lookup") return state.selectedScenario ? "Started" : "Start here";
  if (title === "Admission Order") return state.requests.length ? `${state.requests.length} orders` : "Clinical input";
  if (title === "Requests") return `${state.requests.filter((item) => item.status.includes("Pending")).length} pending`;
  if (title === "Billing") return `${state.clearances.filter((item) => item.status !== "Cleared").length} pending`;
  if (title === "Bed Manager") return `${state.requests.filter((item) => item.bedNo).length} allotted`;
  if (title === "Receive Patient") return `${state.receiveRecords.length} received`;
  if (title === "Patient Care") return `${state.careRecords.length} started`;
  return "Open";
}

export function AdminWorkflowOverview() {
  const { state, actions } = useAdmissionStore();
  const availableBeds = state.beds.filter((bed) => bed.status === "Available").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Pending requests" value={state.requests.filter((request) => request.status.includes("Pending")).length} tone="warning" />
        <Metric label="Billing holds" value={state.clearances.filter((item) => item.status !== "Cleared").length} tone="danger" />
        <Metric label="Available beds" value={availableBeds} tone="success" />
        <Metric label="Nurse handover" value={state.receiveRecords.length} tone="info" />
      </div>

      <AlertBanner icon={ShieldAlert} tone="info" title="Admin view">
        Full frontend workflow is connected with local state. Reception, doctor order, desk, billing, bed, and nurse actions update this overview.
      </AlertBanner>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Admission Workflow</CardTitle>
            <CardDescription>Open any role workspace from one operational overview.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">All roles</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                actions.resetDemo();
                toast.success("Admission demo state reset.");
              }}
            >
              <RefreshCcw className="h-4 w-4" />
              Reset demo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {admissionWorkflowCards.map((card, index) => (
              <Link
                className="group rounded-lg border border-border p-3 transition hover:border-primary/40 hover:bg-surface-muted"
                href={card.route}
                key={card.title}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <Badge tone="muted">Step {index + 1}</Badge>
                </div>
                <div className="mt-3 text-sm font-semibold text-foreground">{card.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{card.owner}</div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <AdmissionStatusBadge value={workflowStatus(card.title, state)} />
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PatientLookupWorkspace />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Live Activity</CardTitle>
              <CardDescription>Latest frontend workflow actions.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.activities.map((activity) => (
              <div className="rounded-lg border border-border p-3 text-sm" key={activity.id}>
                <div className="font-semibold text-foreground">{activity.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{activity.detail}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">{activity.at}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number | string; tone: "success" | "warning" | "danger" | "info" }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold">{value}</div>
        <Badge tone={tone}>Live</Badge>
      </div>
    </div>
  );
}
