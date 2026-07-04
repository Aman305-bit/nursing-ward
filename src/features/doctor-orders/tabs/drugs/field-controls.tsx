"use client";

import * as React from "react";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  diluents,
  doseUnits,
  durationUnits,
  frequencyMultiplier,
  frequencies,
  infusionTimeUnits,
  instructions,
  sites,
  timeUnits,
} from "./data";
import type { DoseUnit, DraftCategory, OrderDraft, TaperDose } from "./types";
import { categoriesForForm, isAutoQtyForm, isContinuousFluid, isInjectionForm, isIvRoute, routeOptionsForForm } from "./utils";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

export function SelectField<T extends string>({ value, options, onChange, disabled }: { value: T; options: T[]; onChange: (value: T) => void; disabled?: boolean }) {
  return (
    <select
      className="h-9 w-full appearance-none rounded-md border border-input px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0 disabled:bg-surface-muted disabled:text-muted-foreground"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as T)}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function NumberInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} inputMode="decimal" pattern="[0-9]*[.]?[0-9]*" />;
}

function ToggleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={[
        "h-9 rounded-md border px-3 text-sm font-medium transition",
        active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-surface-muted",
      ].join(" ")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function CategoryRadio({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: () => void;
}) {
  return (
    <label
      className={[
        "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md border px-3 text-sm font-medium transition md:flex-none md:min-w-0",
        checked ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground",
        "cursor-pointer hover:bg-surface-muted",
      ].join(" ")}
    >
      <input
        type="radio"
        name={name}
        className="h-4 w-4 rounded border-input accent-primary"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

const createTaperDose = (frequency = "", unit: DoseUnit = ""): TaperDose => ({
  id: `taper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  dose: "",
  unit,
  frequency,
  fromDate: "",
  toDate: "",
});

function useDraftWarnings(draft: OrderDraft) {
  const dose = Number(draft.dosage);
  const maxDose = Number(draft.maxDosage);
  const frequencyMultiplier = draft.frequency === "QID" ? 4 : draft.frequency === "TID" ? 3 : draft.frequency === "BID" ? 2 : 1;
  const exceedsMaxDose = draft.sos && Number.isFinite(dose) && Number.isFinite(maxDose) && maxDose > 0 && dose * frequencyMultiplier > maxDose;
  const needsDiluent = isIvRoute(draft.route) && !draft.diluent;
  const invalidTime = Boolean(draft.startDate && draft.endDate && draft.startTime && draft.endTime && `${draft.endDate}T${draft.endTime}` <= `${draft.startDate}T${draft.startTime}`);

  return { exceedsMaxDose, needsDiluent, invalidTime };
}

export function DrugDraftFields({
  draft,
  flash,
  onChange,
}: {
  draft: OrderDraft;
  flash: boolean;
  onChange: (values: Partial<OrderDraft>) => void;
}) {
  const today = React.useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);
  const instructionListId = React.useId();
  const categoryRadioName = React.useId();
  const endDateMin = draft.startDate || today;
  const routeOptions = routeOptionsForForm(draft.form, draft.continuous, draft.intermittent);
  const ivRoute = isIvRoute(draft.route);
  const injection = isInjectionForm(draft.form);
  const infusion = ivRoute && (draft.intermittent || draft.continuous);
  const continuous = draft.continuous || isContinuousFluid(draft.form);
  const showStandaloneDosage = !infusion;
  const showFrequency = !continuous && !draft.stat && !draft.bolus;
  const showDays = !continuous && !draft.stat && !draft.bolus;
  const showSite = injection && !infusion;
  const showRate = infusion || continuous;
  const showDiluent = ivRoute || draft.category === "Diluent";
  const taperDoses = draft.taperDoses;
  const warnings = useDraftWarnings(draft);
  const autoQtyForm = isAutoQtyForm(draft.form);
  const displayedOrderedQty = autoQtyForm ? draft.orderedQty : draft.orderedQty || "1";
  const dosageCalcWeight = Number(draft.weightKg || "0");
  const totalDosageValue = (() => {
    const dose = Number(draft.dosageCalcDose);
    if (!dose) return "0";
    const weightFactor = dosageCalcWeight || 70;
    const freqMultiplier = frequencyMultiplier[draft.dosageCalcFrequency] ?? 1;
    return `${Math.ceil(dose * weightFactor * freqMultiplier)} ${draft.dosageCalcUnit || ""}`.trim();
  })();
  const categoryOptions = categoriesForForm(draft.form);
  const isScheduled = draft.category === "Scheduled" || !draft.category;
  const isTabletLike = ["Tablet", "Capsule", "Syrup"].includes(draft.form);
  const showScheduledFrequency = isScheduled && isTabletLike;
  const showScheduledDays = isScheduled && isTabletLike;
  const showScheduledQuantity = isScheduled && isTabletLike;
  const showScheduledStartTime = isScheduled && isTabletLike;
  const showScheduledEndDate = isScheduled && isTabletLike;
  const showScheduledEndTime = isScheduled && isTabletLike;
  const showInjectionSite = isInjectionForm(draft.form) && ["Intramuscular (IM)", "Subcutaneous (SC)", "Spinal"].includes(draft.route);
  const showBolusFields = draft.category === "Bolus";
  const showIntermittentFields = draft.category === "Intermittent";
  const showContinuousFields = draft.category === "Continuous" || isContinuousFluid(draft.form);
  const showSOSFields = draft.category === "SOS";
  const hideDosageCalcCard = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Suspension",
    "Cream",
    "Ointment",
    "Patch",
    "Eye Drops",
    "Ear Drops",
    "Nasal Spray",
    "Inhaler",
    "Nebulizer",
  ].includes(draft.form);

  const selectCategory = (category: DraftCategory) => {
    if (category === "SOS") {
      onChange({ category: "SOS", sos: true, stat: false, bolus: false, intermittent: false, continuous: false });
      return;
    }
    if (category === "STAT") {
      onChange({ category: "STAT", stat: true, sos: false, bolus: false, intermittent: false, continuous: false });
      return;
    }
    if (category === "Bolus") {
      onChange({ category: "Bolus", bolus: true, sos: false, stat: false, intermittent: false, continuous: false });
      return;
    }
    if (category === "Intermittent") {
      onChange({ category: "Intermittent", intermittent: true, continuous: false, sos: false, stat: false, bolus: false });
      return;
    }
    if (category === "Continuous") {
      onChange({ category: "Continuous", continuous: true, intermittent: false, sos: false, stat: false, bolus: false });
      return;
    }

    onChange({ category, sos: false, stat: false, bolus: false, intermittent: false, continuous: false });
  };

  React.useEffect(() => {
    const nextCategory = draft.category && categoryOptions.includes(draft.category) ? draft.category : categoryOptions[0] ?? "";
    if (nextCategory !== draft.category) {
      selectCategory(nextCategory);
    }
    // keep category aligned to the selected form only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.form, draft.category]);

  const updateTaperDose = (id: string, values: Partial<TaperDose>) => {
    onChange({ taperDoses: taperDoses.map((row) => (row.id === id ? { ...row, ...values } : row)) });
  };

  const saveTaperEntry = () => {
    const nextEntry = draft.taperEntry;
    if (!(nextEntry.dose || nextEntry.unit || nextEntry.frequency || nextEntry.fromDate || nextEntry.toDate)) {
      return;
    }

    onChange({
      taperDoses: [...taperDoses, { ...nextEntry, id: `taper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }],
      taperEntry: createTaperDose(),
    });
  };

  const removeTaperDose = (id: string) => {
    onChange({ taperDoses: taperDoses.filter((row) => row.id !== id) });
  };

  const editTaperDose = (row: TaperDose) => {
    onChange({
      taperEntry: { ...row },
      taperDoses: taperDoses.filter((dose) => dose.id !== row.id),
    });
  };

  const hasDraftTaperValue = Boolean(draft.taperEntry.dose || draft.taperEntry.unit || draft.taperEntry.frequency || draft.taperEntry.fromDate || draft.taperEntry.toDate);

  return (
    <div className="space-y-4">
      {draft.hasContraindication ? (
        <div className="flex items-center gap-2 rounded-md border border-danger bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          <AlertTriangle className="h-4 w-4" />
          Contraindication alert acknowledged for this order.
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2">
            <FieldLabel>Route</FieldLabel>
            <SelectField value={draft.route} options={routeOptions} disabled={infusion || continuous} onChange={(route) => onChange({ route })} />
          </label>
          {showFrequency || showScheduledFrequency ? (
            <label className="space-y-2">
              <FieldLabel>Frequency</FieldLabel>
              <SelectField value={draft.frequency} options={frequencies} onChange={(frequency) => onChange({ frequency })} />
            </label>
          ) : null}
          {showStandaloneDosage ? (
            <label className="space-y-2">
              <FieldLabel>Dosage</FieldLabel>
              <div className="grid grid-cols-[minmax(0,1fr)_105px] gap-2">
                <NumberInput value={draft.dosage} onChange={(event) => onChange({ dosage: event.target.value })} />
                <SelectField value={draft.doseUnit} options={doseUnits} onChange={(doseUnit) => onChange({ doseUnit })} />
              </div>
            </label>
          ) : null}
          {showDays || showScheduledDays ? (
            <label className="space-y-2">
              <FieldLabel>No. of Days</FieldLabel>
              <div className="grid grid-cols-[minmax(0,1fr)_105px] gap-2">
                <NumberInput type="number" min={0} value={draft.days} onChange={(event) => onChange({ days: event.target.value })} />
                <SelectField value={draft.dayUnit} options={durationUnits} onChange={(dayUnit) => onChange({ dayUnit })} />
              </div>
            </label>
          ) : null}
          {showSite || showInjectionSite ? (
            <label className="space-y-2">
              <FieldLabel>Site</FieldLabel>
              <SelectField value={draft.site} options={sites} onChange={(site) => onChange({ site })} />
            </label>
          ) : null}
          {showDiluent || showIntermittentFields || showContinuousFields ? (
            <label className="space-y-2">
              <FieldLabel>Diluent</FieldLabel>
              <SelectField value={draft.diluent} options={diluents} onChange={(diluent) => onChange({ diluent })} />
              {warnings.needsDiluent ? <span className="text-xs font-medium text-danger">Diluent is required for IV route.</span> : null}
            </label>
          ) : null}
          {showRate || showIntermittentFields || showContinuousFields ? (
            <>
              <label className="space-y-2">
                <FieldLabel>{showContinuousFields ? "Dose" : "Total Dose"}</FieldLabel>
                <div className="grid grid-cols-[minmax(0,1fr)_105px] gap-2">
                  <NumberInput value={draft.totalDose} onChange={(event) => onChange({ totalDose: event.target.value })} />
                  <SelectField value={draft.totalDoseUnit} options={doseUnits} onChange={(totalDoseUnit) => onChange({ totalDoseUnit })} />
                </div>
              </label>
              <label className="space-y-2">
                <FieldLabel>Total Duration</FieldLabel>
                <div className="grid grid-cols-[minmax(0,1fr)_105px] gap-2">
                  <NumberInput value={draft.totalDuration} onChange={(event) => onChange({ totalDuration: event.target.value })} />
                  <SelectField value={draft.totalDurationUnit} options={timeUnits} onChange={(totalDurationUnit) => onChange({ totalDurationUnit })} />
                </div>
              </label>
            </>
          ) : null}
          {draft.sos || showSOSFields ? (
            <label className="space-y-2">
              <FieldLabel>Max Dose/Day</FieldLabel>
              <div className="grid grid-cols-[minmax(0,1fr)_105px] gap-2">
                <NumberInput value={draft.maxDosage} onChange={(event) => onChange({ maxDosage: event.target.value })} />
                <SelectField value={draft.maxDoseUnit} options={doseUnits} onChange={(maxDoseUnit) => onChange({ maxDoseUnit })} />
              </div>
              {warnings.exceedsMaxDose ? <span className="text-xs font-medium text-danger">Dose exceeds max dose/day.</span> : null}
            </label>
          ) : null}
          {showRate || showIntermittentFields || showContinuousFields ? (
            <label className="space-y-2 xl:col-span-2">
              <FieldLabel>Rate</FieldLabel>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_100px_100px]">
                <div className="min-w-0">
                  <NumberInput
                    value={draft.rateDose}
                    onChange={(event) => onChange({ rateDose: event.target.value })}
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    value={draft.rateUnit}
                    options={doseUnits}
                    onChange={(rateUnit) => onChange({ rateUnit })}
                  />
                </div>

                <div className="min-w-0">
                  <SelectField
                    value={draft.rateTimeUnit}
                    options={infusionTimeUnits}
                    onChange={(rateTimeUnit) => onChange({ rateTimeUnit })}
                  />
                </div>
              </div>
            </label>
          ) : null}
          
          {!showContinuousFields ? <label className="space-y-2">
            <FieldLabel>Start Date</FieldLabel>
            <Input
              type="date"
              min={today}
              value={draft.startDate}
              onChange={(event) =>
                onChange({
                  startDate: event.target.value,
                  endDate: draft.endDate && event.target.value > draft.endDate ? "" : draft.endDate,
                })
              }
            />
          </label> : null}
          {showScheduledStartTime || draft.category === "STAT" || showBolusFields || showIntermittentFields || showContinuousFields ? <label className="space-y-2">
            <FieldLabel>Start Time</FieldLabel>
            <Input type="time" value={draft.startTime} onChange={(event) => onChange({ startTime: event.target.value })} />
          </label> : null}
          {showScheduledEndDate || showIntermittentFields || showContinuousFields ? <label className="space-y-2">
            <FieldLabel>End Date</FieldLabel>
            <Input type="date" min={endDateMin} value={draft.endDate} onChange={(event) => onChange({ endDate: event.target.value })} />
          </label> : null}
          {showScheduledEndTime || showIntermittentFields || showContinuousFields ? <label className="space-y-2">
            <FieldLabel>End Time</FieldLabel>
            <Input type="time" value={draft.endTime} onChange={(event) => onChange({ endTime: event.target.value })} />
            {warnings.invalidTime ? <span className="text-xs font-medium text-danger">Start time must be before end time.</span> : null}
          </label> : null}
          {showScheduledQuantity || showBolusFields || showIntermittentFields || showContinuousFields ? <label className="space-y-2">
            <FieldLabel>Total Quantity</FieldLabel>
            <Input
              type="number"
              min={1}
              value={displayedOrderedQty}
              onChange={(event) => onChange({ orderedQty: event.target.value || "1" })}
              className={flash ? "border-success bg-success/10 font-semibold ring-2 ring-success/20 transition" : "font-semibold transition"}
            />
            <span className="text-xs text-muted-foreground">
              {/* {autoQtyForm ? "Auto-calculated for tablet, capsule, and lozenge; edit as needed." : "Defaults to 1 for other forms; edit to adjust."} */}
            </span>
          </label> : null}
          <label className="space-y-2 sm:col-span-2">
            <FieldLabel>Instructions</FieldLabel>
            <Input list={instructionListId} value={draft.instructions} onChange={(event) => onChange({ instructions: event.target.value })} />
            {/* <datalist id={instructionListId}>
              {instructions.map((instruction) => (
                <option key={instruction} value={instruction} />
              ))}
            </datalist> */}
          </label>
        </div>

        <div className="min-w-0 space-y-2">
          <FieldLabel>Category</FieldLabel>
          <div className="grid min-w-0 grid-cols-2 gap-2 md:flex md:flex-wrap md:overflow-visible">
            {categoryOptions.map((category) => (
              <CategoryRadio
                key={category}
                checked={draft.category === category}
                label={category}
                name={categoryRadioName}
                onChange={() => selectCategory(category)}
              />
            ))}
          </div>
        </div>
      </div>

      {draft.bolus ? (
        <div className="grid gap-4 rounded-md border border-border bg-surface-muted p-3 sm:grid-cols-2 md:grid-cols-3">
          <label className="space-y-2">
            <FieldLabel>Bolus Dose</FieldLabel>
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <NumberInput value={draft.bolusDose} onChange={(event) => onChange({ bolusDose: event.target.value })} />
              <SelectField value={draft.bolusUnit} options={doseUnits} onChange={(bolusUnit) => onChange({ bolusUnit })} />
            </div>
          </label>
          {continuous ? (
            <div className="space-y-2">
              <FieldLabel>Bolus /kg</FieldLabel>
              <ToggleButton active={draft.bolusKg} label="/kg" onClick={() => onChange({ bolusKg: !draft.bolusKg })} />
            </div>
          ) : null}
        </div>
      ) : null}

      {!hideDosageCalcCard ? (
        <div className="grid gap-4 rounded-md border border-border bg-surface-muted p-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <FieldLabel>Dosage Cal Dose</FieldLabel>
          <NumberInput
            value={draft.dosageCalcDose}
            onChange={(event) => onChange({ dosageCalcDose: event.target.value })}
          />
        </div>

        <div className="min-w-0">
          <FieldLabel>Unit</FieldLabel>
          <SelectField
            value={draft.dosageCalcUnit}
            options={doseUnits}
            onChange={(dosageCalcUnit) => onChange({ dosageCalcUnit })}
          />
        </div>

        <div className="min-w-0">
          <FieldLabel>Frequency</FieldLabel>
          <SelectField
            value={draft.dosageCalcFrequency}
            options={frequencies}
            onChange={(dosageCalcFrequency) => onChange({ dosageCalcFrequency })}
          />
        </div>

        <div className="min-w-0">
          <FieldLabel>Weight(Kg)</FieldLabel>
          <Input readOnly value={draft.weightKg} />
        </div>

        <div className="min-w-0">
          <FieldLabel>Total Dosage</FieldLabel>
          <Input readOnly value={totalDosageValue} />
        </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>Taper Dose</FieldLabel>
          <Button type="button" size="icon" variant="outline" onClick={saveTaperEntry} aria-label="Add taper dose">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-3">
          {hasDraftTaperValue ? (
            <div className="mb-2 grid gap-2 rounded-md border border-dashed border-primary/30 bg-primary/5 p-2 text-xs text-muted-foreground md:grid-cols-[1fr_110px_150px_1fr_1fr]">
              <div className="font-medium text-foreground">{draft.taperEntry.dose || "-"}</div>
              <div>{draft.taperEntry.unit || "-"}</div>
              <div>{draft.taperEntry.frequency || "-"}</div>
              <div>{draft.taperEntry.fromDate || "-"}</div>
              <div>{draft.taperEntry.toDate || "-"}</div>
            </div>
          ) : null}
          <div className="grid gap-2 md:grid-cols-[1fr_110px_150px_1fr_1fr]">
            <NumberInput value={draft.taperEntry.dose} onChange={(event) => onChange({ taperEntry: { ...draft.taperEntry, dose: event.target.value } })} placeholder="Dose" />
            <SelectField value={draft.taperEntry.unit} options={doseUnits} onChange={(unit) => onChange({ taperEntry: { ...draft.taperEntry, unit } })} />
            <SelectField value={draft.taperEntry.frequency} options={frequencies} onChange={(frequency) => onChange({ taperEntry: { ...draft.taperEntry, frequency } })} />
            <Input type="date" value={draft.taperEntry.fromDate} min={today} onChange={(event) => onChange({ taperEntry: { ...draft.taperEntry, fromDate: event.target.value } })} aria-label="From date" />
            <Input type="date" value={draft.taperEntry.toDate} min={draft.taperEntry.fromDate || today} onChange={(event) => onChange({ taperEntry: { ...draft.taperEntry, toDate: event.target.value } })} aria-label="To date" />
          </div>
        </div>
        <div className="space-y-2">
          {taperDoses.length ? (
            taperDoses.map((row) => (
              <div key={row.id} className="grid gap-2 rounded-md border border-border bg-surface p-3 md:grid-cols-[1fr_110px_150px_1fr_1fr_88px] md:items-center">
                <div className="text-sm font-medium text-foreground">{row.dose || "-"}</div>
                <div className="text-sm text-muted-foreground">{row.unit || "-"}</div>
                <div className="text-sm text-muted-foreground">{row.frequency || "-"}</div>
                <div className="text-sm text-muted-foreground">{row.fromDate || "-"}</div>
                <div className="text-sm text-muted-foreground">{row.toDate || "-"}</div>
                <div className="flex justify-end gap-2">
                  <Button type="button" size="icon" variant="outline" onClick={() => editTaperDose(row)} aria-label="Edit taper dose">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeTaperDose(row.id)} aria-label="Remove taper dose">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              Add taper entries using the form above. Saved rows will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
