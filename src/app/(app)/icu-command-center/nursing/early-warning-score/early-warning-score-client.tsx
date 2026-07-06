"use client";

import * as React from "react";
import { icuPatients } from "@/features/nursing-icu/nursing-icu-data";

type SelectedIcuPatient = (typeof icuPatients)[number];

export default function EarlyWarningScoreClient({ initialPatientId }: { initialPatientId: string }) {
  const [patientId, setPatientId] = React.useState(initialPatientId);
  const patient = icuPatients.find((item) => item.id === patientId) ?? null;

  return (
    <div className="min-h-[calc(100vh-88px)] space-y-3 bg-slate-50 p-4">
      {patient ? <EarlyWarningPatientStrip patient={patient} /> : null}

      <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <label className="block max-w-xl space-y-1 text-sm">
          <span className="font-semibold text-slate-800">Patient</span>
          <select
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-sky-200"
            onChange={(event) => setPatientId(event.target.value)}
            value={patientId}
          >
            <option value="">Select patient</option>
            {icuPatients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.patientName} - {item.bedNo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {patient ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <iframe
            className="h-[calc(100vh-250px)] min-h-[760px] w-full"
            src="/icu-early-warning-score/index.html"
            title="Early Warning Score"
          />
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Select patient to open early warning score.
        </div>
      )}
    </div>
  );
}

function EarlyWarningPatientStrip({ patient }: { patient: SelectedIcuPatient }) {
  return (
    <section
      className="overflow-x-auto rounded-xl border border-[#7367f0]/40 px-4 py-3 text-white shadow-[0_8px_20px_rgba(115,103,240,0.24)]"
      style={{ background: "linear-gradient(90deg,#7367f0,#5b8def)" }}
    >
      <div className="flex min-w-max items-center gap-3 text-sm font-semibold text-white/85">
        <span className="pr-1 text-base font-bold text-white">{patient.patientName}</span>
        <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 shadow-sm">
          {patient.criticalityScore >= 8 ? "Urgent" : patient.currentStatus}
        </span>
        <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white shadow-sm">
          MR: {patient.mrn}
        </span>
        <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white shadow-sm">
          Age/Sex: {patient.ageGender}
        </span>
        <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white shadow-sm">
          Bed: {patient.bedNo}
        </span>
        <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white shadow-sm">
          Unit: {patient.unit}
        </span>
        <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white shadow-sm">
          Doctor: {patient.admittingDoctor}
        </span>
        <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium text-white shadow-sm">
          Nurse: {patient.assignedWardNurse}
        </span>
        <button
          className="ml-auto inline-flex h-9 items-center justify-center rounded-xl border border-white/30 bg-white px-4 text-xs font-semibold text-[#7367f0] shadow-sm transition hover:bg-white/90"
          onClick={() => window.history.back()}
          type="button"
        >
          Back
        </button>
      </div>
    </section>
  );
}
