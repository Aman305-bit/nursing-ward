"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardPlus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdmissionStore } from "@/features/admission/admission-store";
import type { AdmissionPriority } from "@/features/admission/types";

const controlClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function DoctorAdmissionOrder() {
  const { selectedPatient, activeRequest, state, actions } = useAdmissionStore();
  const [patientName, setPatientName] = React.useState(selectedPatient?.name ?? "");
  const [uhid, setUhid] = React.useState(selectedPatient?.uhid ?? "Auto generated");

  React.useEffect(() => {
    setPatientName(selectedPatient?.name ?? "");
    setUhid(selectedPatient?.uhid ?? "Auto generated");
  }, [selectedPatient?.id, selectedPatient?.name, selectedPatient?.uhid]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("patientName") ?? "").trim();
    if (!name) {
      toast.error("Patient name required.");
      return;
    }
    actions.submitDoctorOrder({
      patientName: name,
      uhid: String(form.get("uhid") ?? "") || "Auto generated",
      source: String(form.get("source") ?? "OPD"),
      doctor: String(form.get("doctor") ?? "Dr. Mohan Ahluvia"),
      type: String(form.get("type") ?? "Regular"),
      ward: String(form.get("ward") ?? "General Ward"),
      priority: String(form.get("priority") ?? "Routine") as AdmissionPriority,
      instructions: String(form.get("instructions") ?? ""),
    });
    toast.success("Admission request submitted.");
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Admission Order</CardTitle>
          <CardDescription>Create admission request after doctor consultation.</CardDescription>
        </div>
        <Badge tone="info">Step 1</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Patient source</div>
            <div className="text-sm font-semibold text-foreground">{state.selectedScenario ?? "Patient not selected"}</div>
            <div className="text-xs text-muted-foreground">
              {selectedPatient ? `${selectedPatient.name} | ${selectedPatient.uhid}` : "Go to reception and choose patient scenario first."}
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admission/reception">Change Patient</Link>
          </Button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Patient Name">
              <Input name="patientName" placeholder="Enter patient name" value={patientName} onChange={(event) => setPatientName(event.target.value)} />
            </Field>
            <Field label="UHID / Patient ID">
              <Input name="uhid" value={uhid} onChange={(event) => setUhid(event.target.value)} />
            </Field>
            <Field label="Source">
              <select className={controlClass} name="source" defaultValue={state.selectedScenario === "Emergency Unknown Patient" ? "Emergency" : "OPD"}>
                {["OPD", "Emergency", "Referral", "Daycare", "Transfer"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>
            <Field label="Admitting Doctor">
              <select className={controlClass} name="doctor" defaultValue="Dr. Mohan Ahluvia">
                {["Dr. Mohan Ahluvia", "Dr. Neha Rao", "Dr. Kamal Sen", "Dr. Aditi Shah"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>
            <Field label="Admission Type">
              <select className={controlClass} name="type" defaultValue={state.selectedScenario === "Emergency Unknown Patient" ? "Emergency" : "Regular"}>
                {["Regular", "Observation", "Emergency", "Day Care", "Planned Surgery"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>
            <Field label="Requested Ward">
              <select className={controlClass} name="ward" defaultValue="ICU">
                {["ICU", "General Ward", "Private Ward", "Emergency", "Pediatric"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={controlClass} name="priority" defaultValue={state.selectedScenario === "Emergency Unknown Patient" ? "Emergency" : "Routine"}>
                {["Routine", "Urgent", "Critical", "Emergency"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>
            <label className="space-y-1 text-sm md:col-span-2 xl:col-span-3">
              <span className="font-medium text-foreground">Instructions</span>
              <textarea className={`${controlClass} h-auto min-h-24 resize-y`} name="instructions" placeholder="Add admission instructions, precautions, or nursing notes" />
            </label>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Active request: {activeRequest ? `${activeRequest.patient} | ${activeRequest.status}` : "No admission request submitted yet."}
            </span>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => {
                setPatientName(selectedPatient?.name ?? "");
                setUhid(selectedPatient?.uhid ?? "Auto generated");
              }}>
                Clear
              </Button>
              <Button>
                <ClipboardPlus className="h-4 w-4" />
                Submit Admission Request
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
