"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdmissionStore } from "@/features/admission/admission-store";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";
import type { AdmissionPatient, AdmissionScenario } from "@/features/admission/types";
import { cn } from "@/lib/utils";

function patientText(patient: AdmissionPatient) {
  return `${patient.name} ${patient.uhid} ${patient.phone} ${patient.ageSex}`.toLowerCase();
}

export function PatientLookupWorkspace() {
  const { state, selectedPatient, actions } = useAdmissionStore();
  const [search, setSearch] = React.useState("");
  const rows = state.patients.filter((patient) => patientText(patient).includes(search.toLowerCase()));

  function startScenario(scenario: AdmissionScenario) {
    if (scenario === "Old Patient / Re-admission" && !selectedPatient) {
      toast.error("Select an existing patient first.");
      return;
    }
    actions.startScenario(scenario);
    toast.success(`${scenario} ready for doctor order.`);
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Patient Lookup</CardTitle>
          <CardDescription>Search first, then continue with the correct admission scenario.</CardDescription>
        </div>
        <Badge tone="info">Start here</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, UHID, phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            {rows.map((patient) => {
              const selected = state.selectedPatientId === patient.id;
              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between gap-3 border-b border-border px-3 py-3 text-left last:border-0 hover:bg-surface-muted",
                    selected && "bg-primary/5",
                  )}
                  key={patient.id}
                  onClick={() => actions.selectPatient(patient.id)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{patient.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {patient.uhid} | {patient.ageSex} | {patient.phone}
                    </span>
                  </span>
                  <AdmissionStatusBadge value={patient.status} />
                </button>
              );
            })}
            {!rows.length ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">No patient matched. Start a new or emergency admission.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <div className="text-sm font-semibold text-foreground">{selectedPatient ? selectedPatient.name : "No patient selected"}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedPatient
              ? `${selectedPatient.uhid} selected. Continue with the matching admission flow.`
              : "Select an existing patient or start a new/emergency admission."}
          </p>
          {state.selectedScenario ? (
            <div className="mt-3">
              <AdmissionStatusBadge value={state.selectedScenario} />
            </div>
          ) : null}

          <div className="mt-4 grid gap-2">
            <Button variant="outline" className="border-info text-info" onClick={() => startScenario("Old Patient / Re-admission")}>
              <UserPlus className="h-4 w-4" />
              Old Patient / Re-admission
            </Button>
            <Button variant="outline" onClick={() => startScenario("New Patient Admission")}>
              <UserPlus className="h-4 w-4" />
              New Patient Admission
            </Button>
            <Button variant="outline" className="border-danger text-danger" onClick={() => startScenario("Emergency Unknown Patient")}>
              <AlertCircle className="h-4 w-4" />
              Emergency Unknown Patient
            </Button>
            <Button asChild>
              <Link href="/admission/doctor">Continue to Doctor Order</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
