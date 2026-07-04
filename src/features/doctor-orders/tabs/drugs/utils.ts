import { formARoutes, frequencyMultiplier, injectionRoutes } from "./data";
import type { DraftCategory, DrugCategory, DrugOrder, OrderDraft } from "./types";

export const formWiseCategories = {
  Tablet: ["Scheduled", "SOS", "STAT", "Discontinued"],
  Capsule: ["Scheduled", "SOS", "STAT", "Discontinued"],
  Syrup: ["Scheduled", "SOS", "Discontinued"],
  Suspension: ["Scheduled", "SOS", "Discontinued"],
  Drops: ["Scheduled", "SOS", "Discontinued"],
  Injection: ["Scheduled", "SOS", "STAT", "Intermittent", "Bolus", "Discontinued"],
  Infusion: ["Continuous", "Intermittent", "STAT", "Discontinued"],
  "IV Fluid": ["Continuous", "Intermittent", "Bolus", "Diluent", "STAT", "Discontinued"],
  Nebulizer: ["Scheduled", "SOS", "Discontinued"],
  Inhaler: ["Scheduled", "SOS", "Discontinued"],
  Ointment: ["Scheduled", "Discontinued"],
  Cream: ["Scheduled", "Discontinued"],
  Gel: ["Scheduled", "Discontinued"],
  Patch: ["Scheduled", "Discontinued"],
  "Eye Drops": ["Scheduled", "SOS", "Discontinued"],
  "Ear Drops": ["Scheduled", "SOS", "Discontinued"],
  "Nasal Spray": ["Scheduled", "SOS", "Discontinued"],
  Suppository: ["Scheduled", "SOS", "Discontinued"],
} as const satisfies Record<string, readonly DraftCategory[]>;

export function categoriesForForm(form: string): readonly DraftCategory[] {
  return formWiseCategories[form as keyof typeof formWiseCategories] ?? ["Scheduled", "SOS", "STAT", "Bolus", "Diluent", "Intermittent", "Continuous", "Discontinued"];
}

const continuousInfusionDrugNames = [
  "dopamine infusion",
  "noradrenaline infusion",
  "insulin infusion",
];

function isContinuousInfusionDrug(name: string, genericName?: string) {
  const haystacks = [name, genericName ?? ""].map((value) => value.trim().toLowerCase());
  return haystacks.some((value) => continuousInfusionDrugNames.includes(value));
}

export function categoryTone(category: DrugCategory) {
  if (category === "Scheduled") return "info";
  if (category === "SOS") return "warning";
  if (category === "STAT" || category === "Bolus" || category === "Diluent") return "warning";
  if (category === "Continuous") return "success";
  if (category === "Discontinued") return "danger";
  return "muted";
}

export function remainingQty(order: DrugOrder) {
  return Math.max(order.receivedQty - order.administeredQty, 0);
}

export function isIvRoute(route: string) {
  return route === "Intravenous (IV)";
}

export function isInjectionForm(form: string) {
  return form === "Injection";
}

export function isContinuousFluid(form: string) {
  return form === "IV Fluid";
}

export function isFormADrug(form: string) {
  return !isInjectionForm(form) && !isContinuousFluid(form);
}

export function routeOptionsForForm(form: string, continuous: boolean, intermittent: boolean) {
  if (continuous || (isInjectionForm(form) && intermittent) || isContinuousFluid(form)) return ["Intravenous (IV)"];
  if (isInjectionForm(form)) return injectionRoutes;
  return formARoutes;
}

const autoQtyForms = ["Tablet", "Capsule", "Lozenge"] as const;
export function isAutoQtyForm(form: string) {
  return autoQtyForms.includes(form as typeof autoQtyForms[number]);
}

export function deriveCategory(draft: Pick<OrderDraft, "name" | "genericName" | "sos" | "stat" | "bolus" | "intermittent" | "continuous" | "category">): DraftCategory {
  if (isContinuousInfusionDrug(draft.name, draft.genericName)) return "Continuous";
  if (draft.continuous) return "Continuous";
  if (draft.intermittent) return "Intermittent";
  if (draft.sos) return "SOS";
  if (draft.stat) return "STAT";
  if (draft.bolus) return "Bolus";
  return draft.category || "";
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function toHours(value: number, unit: string) {
  if (unit === "sec") return value / 3600;
  if (unit === "min") return value / 60;
  if (unit === "day") return value * 24;
  return value;
}

function durationInRateUnits(duration: number, durationUnit: string, rateTimeUnit: string) {
  const hours = toHours(duration, durationUnit);
  if (rateTimeUnit === "sec") return hours * 3600;
  if (rateTimeUnit === "min") return hours * 60;
  if (rateTimeUnit === "day") return hours / 24;
  return hours;
}

export function calculateAutoQty({
  form,
  category,
  frequency,
  days,
  dose = "1",
  totalDose = "",
  bolusDose = "",
  rateDose = "",
  totalDuration = "",
  rateTimeUnit = "hour",
  totalDurationUnit = "hour",
}: {
  form: string;
  category: DraftCategory;
  frequency: string;
  days: string;
  dose?: string;
  totalDose?: string;
  bolusDose?: string;
  rateDose?: string;
  totalDuration?: string;
  rateTimeUnit?: string;
  totalDurationUnit?: string;
}) {
  const effectiveCategory = category || "Scheduled";
  if (effectiveCategory === "Unscheduled") return 1;
  if (effectiveCategory === "Discontinued") return 0;
  if (!isAutoQtyForm(form)) return 1;
  if (effectiveCategory === "STAT") return Math.ceil(toNumber(dose) || 1);
  if (effectiveCategory === "Bolus") return Math.ceil(toNumber(bolusDose) || toNumber(dose) || 1);
  if (effectiveCategory === "Continuous") {
    const parsedTotalDose = toNumber(totalDose);
    if (parsedTotalDose) return Math.ceil(parsedTotalDose);

    const parsedRate = toNumber(rateDose);
    const parsedDuration = toNumber(totalDuration);
    if (!parsedRate || !parsedDuration) return 0;
    return Math.ceil(parsedRate * durationInRateUnits(parsedDuration, totalDurationUnit, rateTimeUnit));
  }

  const parsedDays = toNumber(days);
  const parsedDose = toNumber(totalDose || dose || "1");
  const multiplier = frequencyMultiplier[frequency] ?? 1;
  if (!parsedDays || !parsedDose) return 0;
  return Math.max(Math.ceil(parsedDose * multiplier * parsedDays), 1);
}

export function makeDraft(order: DrugOrder): OrderDraft {
  const continuousInfusion = isContinuousInfusionDrug(order.name, order.genericName);
  const intermittent = !continuousInfusion && isInjectionForm(order.form) && isIvRoute(order.route);
  const continuous = continuousInfusion || isContinuousFluid(order.form);
  const category = continuous ? "Continuous" : intermittent ? "Intermittent" : order.category === "SOS" || order.category === "STAT" || order.category === "Bolus" || order.category === "Diluent" ? order.category : "";
  const defaultContinuousDuration = continuous && Number(order.days) > 0 ? String(Number(order.days) * 24) : "";
  const orderedQty = isAutoQtyForm(order.form) ? String(order.orderedQty || 1) : "1";

  return {
    name: order.name,
    genericName: order.genericName,
    form: order.form,
    dosage: order.dosage,
    maxDosage: order.maxDosage,
    frequency: order.frequency,
    days: order.days,
    dayUnit: "Days",
    startDate: order.startDate,
    startTime: "",
    endDate: "",
    endTime: "",
    instructions: order.instructions,
    category,
    orderedQty,
    route: order.route,
    doseUnit: order.doseUnit,
    maxDoseUnit: order.doseUnit,
    pharmacy: order.pharmacy,
    drugScope: "All Drugs",
    site: "",
    diluent: order.diluents?.[0] ?? "",
    sos: category === "SOS",
    stat: category === "STAT",
    bolus: category === "Bolus",
    intermittent,
    continuous,
    bolusDose: "",
    bolusUnit: order.doseUnit,
    bolusKg: false,
    rateDose: order.dosage,
    rateUnit: order.doseUnit,
    rateTimeUnit: "hour",
    rateKg: false,
    totalDose: "",
    totalDoseUnit: order.doseUnit,
    totalDuration: defaultContinuousDuration,
    totalDurationUnit: "hour",
    dosageCalcDose: order.dosage,
    dosageCalcUnit: order.doseUnit,
    dosageCalcTimeUnit: "day",
    dosageCalcFrequency: order.frequency,
    dosageCalcKg: false,
    dosageCalcFreq: false,
    weightKg: "70",
    hasContraindication: Boolean(order.hasContraindication),
    taperEntry: {
      id: "",
      dose: "",
      unit: "",
      frequency: "",
      fromDate: "",
      toDate: "",
    },
    taperDoses: [],
  };
}
