"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IcuPatient } from "../nursing-icu-data";

type VentilationGroup =
  | "Mode / device"
  | "Oxygen / support"
  | "Pressures"
  | "Mechanics"
  | "Monitoring / safety";

type VentilationProfile = {
  support: "Invasive" | "NIV" | "Oxygen" | "Room air";
  mode: string;
  device: string;
  fio2: number;
  peep: number;
  rrSet: number;
  tidalVolume: number;
  pressureSupport: number;
  peakPressure: number;
  plateauPressure: number;
  meanPressure: number;
  complianceStatic: number;
  complianceDynamic: number;
  spo2: number;
  etco2: number;
};

type VentilationRowDefinition = {
  parameter: string;
  group: VentilationGroup;
  unit: string;
  value: (profile: VentilationProfile, hour: number) => string;
};

type VentilationRow = VentilationRowDefinition & {
  values: string[];
};

type VentilationChartWorkspaceProps = {
  patient: IcuPatient;
};

const hourColumns = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}00`);

const pulse = [-2, -1, 0, 1, 2, 1, 0, -1];

function shiftValue(base: number, hour: number, amplitude = 1, seed = 0) {
  return base + pulse[(hour + seed) % pulse.length] * amplitude;
}

function scheduledValue(hour: number, interval: number, value: string) {
  return hour % interval === 0 ? value : "-";
}

function patientVentilationProfile(patient: IcuPatient): VentilationProfile {
  const status = patient.ventilatorStatus.toLowerCase();
  const seed = patient.id.length % 3;

  if (status.includes("invasive")) {
    return {
      support: "Invasive",
      mode: "VCV",
      device: "Ventilator",
      fio2: 46 + seed,
      peep: 7,
      rrSet: 18,
      tidalVolume: 430,
      pressureSupport: 10,
      peakPressure: 26,
      plateauPressure: 22,
      meanPressure: 13,
      complianceStatic: 42,
      complianceDynamic: 36,
      spo2: 97,
      etco2: 38,
    };
  }

  if (status.includes("niv")) {
    return {
      support: "NIV",
      mode: "NIV S/T",
      device: "NIV mask",
      fio2: 55 + seed,
      peep: 6,
      rrSet: 16,
      tidalVolume: 0,
      pressureSupport: 12,
      peakPressure: 18,
      plateauPressure: 0,
      meanPressure: 10,
      complianceStatic: 0,
      complianceDynamic: 0,
      spo2: 95,
      etco2: 42,
    };
  }

  if (status.includes("oxygen")) {
    return {
      support: "Oxygen",
      mode: "Oxygen mask",
      device: "Mask",
      fio2: 35,
      peep: 0,
      rrSet: 0,
      tidalVolume: 0,
      pressureSupport: 0,
      peakPressure: 0,
      plateauPressure: 0,
      meanPressure: 0,
      complianceStatic: 0,
      complianceDynamic: 0,
      spo2: 96,
      etco2: 0,
    };
  }

  return {
    support: "Room air",
    mode: "Room air",
    device: "None",
    fio2: 21,
    peep: 0,
    rrSet: 0,
    tidalVolume: 0,
    pressureSupport: 0,
    peakPressure: 0,
    plateauPressure: 0,
    meanPressure: 0,
    complianceStatic: 0,
    complianceDynamic: 0,
    spo2: 98,
    etco2: 0,
  };
}

function ifSupported(profile: VentilationProfile, value: string) {
  return profile.support === "Room air" ? "-" : value;
}

function ifVentilator(profile: VentilationProfile, value: string) {
  return profile.support === "Invasive" || profile.support === "NIV" ? value : "-";
}

function numericOrDash(value: number, unitless = false) {
  if (!value) return "-";
  return unitless ? String(value) : value.toFixed(0);
}

const rowDefinitions: VentilationRowDefinition[] = [
  {
    parameter: "Ventilation Mode",
    group: "Mode / device",
    unit: "Celcius",
    value: (profile, hour) => scheduledValue(hour, 4, profile.mode),
  },
  {
    parameter: "Sxxx Ventilation Mode",
    group: "Mode / device",
    unit: "None",
    value: (profile, hour) => ifVentilator(profile, scheduledValue(hour, 4, profile.support === "Invasive" ? "SIMV" : "S/T")),
  },
  {
    parameter: "Ventilator Type",
    group: "Mode / device",
    unit: "Beats/min",
    value: (profile, hour) => scheduledValue(hour, 4, profile.device),
  },
  {
    parameter: "Humidification",
    group: "Mode / device",
    unit: "mmHg",
    value: (profile, hour) => ifVentilator(profile, scheduledValue(hour, 6, profile.support === "Invasive" ? "HME" : "Heated")),
  },
  {
    parameter: "Humidification temparature",
    group: "Mode / device",
    unit: "mmHg",
    value: (profile, hour) => ifVentilator(profile, hour % 6 === 0 ? String(shiftValue(36, hour, 0.5, 1)) : "-"),
  },
  {
    parameter: "Humidified water check",
    group: "Mode / device",
    unit: "ml",
    value: (profile, hour) => ifVentilator(profile, scheduledValue(hour, 8, "Checked")),
  },
  {
    parameter: "Mandatory breath type",
    group: "Mode / device",
    unit: "/min",
    value: (profile, hour) => ifVentilator(profile, scheduledValue(hour, 4, profile.support === "Invasive" ? "Volume" : "Pressure")),
  },
  {
    parameter: "Apnea vantillatory",
    group: "Mode / device",
    unit: "cmH2O",
    value: (profile, hour) => ifVentilator(profile, scheduledValue(hour, 6, profile.support === "Invasive" ? "On" : "Standby")),
  },
  {
    parameter: "Spontaneous",
    group: "Oxygen / support",
    unit: "%",
    value: (profile, hour) => ifSupported(profile, String(shiftValue(profile.support === "Invasive" ? 4 : 18, hour, 1, 3))),
  },
  {
    parameter: "FiO2",
    group: "Oxygen / support",
    unit: "kPa",
    value: (profile, hour) => String(Math.max(21, shiftValue(profile.fio2, hour, 1, 2))),
  },
  {
    parameter: "Peep",
    group: "Oxygen / support",
    unit: "kPa",
    value: (profile, hour) => numericOrDash(profile.peep ? shiftValue(profile.peep, hour, 1, 1) : 0, true),
  },
  {
    parameter: "Spontaneous breath",
    group: "Oxygen / support",
    unit: "kPa",
    value: (profile, hour) => ifSupported(profile, String(shiftValue(profile.support === "Invasive" ? 4 : 18, hour, 1, 3))),
  },
  {
    parameter: "IE(inspiratory \" Expiratory ratio)",
    group: "Oxygen / support",
    unit: "kPa",
    value: (profile, hour) => ifVentilator(profile, scheduledValue(hour, 2, profile.support === "Invasive" ? "1:2" : "1:3")),
  },
  {
    parameter: "T High",
    group: "Oxygen / support",
    unit: "/min",
    value: (profile, hour) => ifVentilator(profile, profile.support === "Invasive" ? String(shiftValue(1, hour, 0.1, 1).toFixed(1)) : "-"),
  },
  {
    parameter: "T low",
    group: "Oxygen / support",
    unit: "cmH2O",
    value: (profile, hour) => ifVentilator(profile, profile.support === "Invasive" ? String(shiftValue(0.6, hour, 0.1, 2).toFixed(1)) : "-"),
  },
  {
    parameter: "Ppeak Pressure",
    group: "Pressures",
    unit: "%",
    value: (profile, hour) => numericOrDash(profile.peakPressure ? shiftValue(profile.peakPressure, hour, 1, 2) : 0, true),
  },
  {
    parameter: "Pplatou pressure",
    group: "Pressures",
    unit: "kPa",
    value: (profile, hour) => numericOrDash(profile.plateauPressure ? shiftValue(profile.plateauPressure, hour, 1, 3) : 0, true),
  },
  {
    parameter: "compliance static ( cstatic)",
    group: "Mechanics",
    unit: "kPa",
    value: (profile, hour) => numericOrDash(profile.complianceStatic ? shiftValue(profile.complianceStatic, hour, 1, 1) : 0, true),
  },
  {
    parameter: "compliance dynamics ( cdynamics)",
    group: "Mechanics",
    unit: "kPa",
    value: (profile, hour) => numericOrDash(profile.complianceDynamic ? shiftValue(profile.complianceDynamic, hour, 1, 2) : 0, true),
  },
  {
    parameter: "Pressure support ( Ps) - tidal volume",
    group: "Mechanics",
    unit: "kPa",
    value: (profile, hour) => numericOrDash(profile.tidalVolume ? shiftValue(profile.tidalVolume, hour, 5, 2) : 0),
  },
  {
    parameter: "Pinspiratory",
    group: "Pressures",
    unit: "kPa",
    value: (profile, hour) => ifVentilator(profile, profile.support === "NIV" ? String(shiftValue(16, hour, 1, 1)) : numericOrDash(profile.peakPressure ? shiftValue(profile.peakPressure - 6, hour, 1, 1) : 0, true)),
  },
  {
    parameter: "Pressure support ( Ps) - miute volume",
    group: "Mechanics",
    unit: "kPa",
    value: (profile, hour) => ifVentilator(profile, String((shiftValue(profile.support === "Invasive" ? 7 : 9, hour, 0.4, 2)).toFixed(1))),
  },
  {
    parameter: "respiratory rate",
    group: "Monitoring / safety",
    unit: "kPa",
    value: (profile, hour) => String(shiftValue(profile.rrSet || 20, hour, 1, 3)),
  },
];

const propertyColumns = ["38", "39", "40", "41", "42", "43", "44", "45", "46", "47"];

const propertyValueTemplates = [
  ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-"],
  ["-", "98", "130", "132", "37.5", "not good", "yes", "-", "night", "-"],
  ["-", "96", "141", "46", "38", "very good", "no result", "-", "morning", "-"],
  ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-"],
  ["-", "95", "96", "85", "37", "nice", "yes", "-", "noon", "-"],
  ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-"],
  ["-", "95", "70", "82", "36.5", "very good", "yes", "-", "noon", "-"],
  ["-", "79", "150", "90", "38", "good", "yes", "-", "night", "-"],
];

function propertyValuesForRow(rowIndex: number) {
  return propertyValueTemplates[rowIndex % propertyValueTemplates.length];
}

function buildRows(profile: VentilationProfile): VentilationRow[] {
  return rowDefinitions.map((row) => ({
    ...row,
    values: hourColumns.map((_, hour) => row.value(profile, hour)),
  }));
}

export function VentilationChartWorkspace({ patient }: VentilationChartWorkspaceProps) {
  const profile = React.useMemo(() => patientVentilationProfile(patient), [patient]);
  const rows = React.useMemo(() => buildRows(profile), [profile]);

  const latestMode = profile.mode;
  const latestFiO2 = rows.find((row) => row.parameter === "FiO2")?.values[10] ?? "-";
  const latestPeep = rows.find((row) => row.parameter === "Peep")?.values[10] ?? "-";

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Hourly ventilation parameters</h3>
            <p className="mt-1 text-xs font-medium text-slate-600">{patient.bedNo} - {patient.patientName} | {latestMode} | FiO2 {latestFiO2}% | PEEP {latestPeep}</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">0000 - 2300</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[2100px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-600">
                <th className="sticky left-0 z-20 w-64 border-r border-slate-200 bg-white px-4 py-3 text-left font-bold">Property</th>
                {hourColumns.map((hour) => (
                  <th key={hour} className="w-20 border-r border-slate-200 px-3 py-3 text-center font-bold">{hour}</th>
                ))}
                <th className="sticky right-0 z-20 w-28 border-l border-slate-200 bg-white px-3 py-3 text-left font-bold">Units</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.parameter} className="border-b border-slate-100 hover:bg-sky-50/40">
                  <th className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-3 text-left font-bold text-slate-900">{row.parameter}</th>
                  {hourColumns.map((hour, hourIndex) => {
                    const value = row.values[hourIndex] ?? "-";
                    return (
                      <td
                        key={`${row.parameter}-${hour}`}
                        className={cn(
                          "border-r border-slate-100 px-3 py-3 text-center font-semibold text-slate-800",
                          value === "-" && "font-medium text-slate-400",
                        )}
                      >
                        {value}
                      </td>
                    );
                  })}
                  <td className="sticky right-0 z-10 border-l border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-950">Property</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-xs uppercase tracking-wide text-slate-600">
                <th className="sticky left-0 z-20 w-72 border-r border-slate-200 bg-white px-4 py-3 text-left font-bold">Property</th>
                {propertyColumns.map((column) => (
                  <th key={`property-column-${column}`} className="w-20 border-r border-slate-200 px-3 py-3 text-center font-bold">{column}</th>
                ))}
                <th className="sticky right-0 z-20 w-28 border-l border-slate-200 bg-white px-4 py-3 text-left font-bold">Units</th>
              </tr>
            </thead>
            <tbody>
              {rowDefinitions.map((row, rowIndex) => {
                const propertyValues = propertyValuesForRow(rowIndex);
                return (
                <tr className="border-b border-slate-100 last:border-b-0" key={`property-${row.parameter}`}>
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-900">{row.parameter}</td>
                  {propertyColumns.map((column, columnIndex) => (
                    <td
                      className="border-r border-slate-100 px-3 py-2.5 text-center font-medium text-slate-700"
                      key={`property-${row.parameter}-${column}`}
                    >
                      {propertyValues[columnIndex]}
                    </td>
                  ))}
                  <td className="sticky right-0 z-10 border-l border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-600">{row.unit}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
