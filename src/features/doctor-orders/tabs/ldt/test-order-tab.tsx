"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

import { getAllLdtTypeConfigs, getLdtTypeConfig, type LdtDynamicField, type LdtFieldOption } from "./config";
import type { LdtOrderPriority, LdtOrderStatus } from "./types";

const priorityOptions: LdtOrderPriority[] = ["Routine", "Urgent", "STAT"];

export type LdtDraft = {
  ldtTypeId: string;
  priority: LdtOrderPriority | "";
  reason: string;
  clinicalNotes: string;
  ldtName: string;
  orderDate: string;
  status: LdtOrderStatus;
  dynamicValues: Record<string, string | string[]>;
};

type Props = {
  draft: LdtDraft;
  onDraftChange: (value: LdtDraft) => void;
  onSave: () => void;
  readOnly?: boolean;
  errors?: Partial<Record<keyof LdtDraft, string>>;
};

export function LdtTestOrderTab({ draft, onDraftChange, onSave, readOnly = false, errors = {} }: Props) {
  const selectedConfig = draft.ldtTypeId ? getLdtTypeConfig(draft.ldtTypeId) : null;
  const propertyFields = selectedConfig?.fields.filter((field) => field.group === "property") ?? [];
  const assessmentFields = selectedConfig?.fields.filter((field) => field.group === "assessment") ?? [];
  const ldtNameOptions = selectedConfig ? [{ label: selectedConfig.ldtName, value: selectedConfig.ldtName }] : [];

  const updateDraft = (next: Partial<LdtDraft>) => onDraftChange({ ...draft, ...next });

  const handleLdtTypeChange = (ldtTypeId: string) => {
    const config = getLdtTypeConfig(ldtTypeId);
    onDraftChange({
      ...draft,
      ldtTypeId,
      ldtName: config?.ldtName ?? "",
      dynamicValues: {},
    });
  };

  const renderField = (field: LdtDynamicField) => {
    const value = draft.dynamicValues[field.id] ?? (field.type === "multiselect" ? [] : "");

    if (field.type === "select") {
      return (
        <select
          className="h-10 w-full rounded-md border border-input px-3 text-sm outline-none"
          value={typeof value === "string" ? value : ""}
          disabled={readOnly}
          onChange={(event) => updateDraft({ dynamicValues: { ...draft.dynamicValues, [field.id]: event.target.value } })}
        >
          <option value="">Select {field.label}</option>
          {(field.options ?? []).map((option: LdtFieldOption) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "multiselect") {
      const selected = new Set(Array.isArray(value) ? value : []);
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {(field.options ?? []).map((option: LdtFieldOption) => (
            <label key={option.value} className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={selected.has(option.value)}
                disabled={readOnly}
                onChange={(event) => {
                  const next = new Set(selected);
                  if (event.target.checked) next.add(option.value);
                  else next.delete(option.value);
                  updateDraft({ dynamicValues: { ...draft.dynamicValues, [field.id]: Array.from(next) } });
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    return (
      <input
        type={field.type}
        className="h-10 w-full rounded-md border border-input px-3 text-sm outline-none"
        value={typeof value === "string" ? value : ""}
        disabled={readOnly}
        onChange={(event) => updateDraft({ dynamicValues: { ...draft.dynamicValues, [field.id]: event.target.value } })}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 px-4 pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            <span>LDT Type</span>
            <select
              className="h-10 w-full rounded-md border border-input px-3 text-sm"
              value={draft.ldtTypeId}
              disabled={readOnly}
              onChange={(event) => handleLdtTypeChange(event.target.value)}
            >
              <option value="">Select LDT Type</option>
              {getAllLdtTypeConfigs().map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.ldtTypeId ? <p className="text-[11px] text-danger">{errors.ldtTypeId}</p> : null}
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            <span>LDT Name</span>
            <select
              className="h-10 w-full rounded-md border border-input px-3 text-sm"
              value={draft.ldtName}
              disabled={readOnly || !selectedConfig}
              onChange={(event) => updateDraft({ ldtName: event.target.value })}
            >
              <option value="">Select LDT Name</option>
              {ldtNameOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.ldtName ? <p className="text-[11px] text-danger">{errors.ldtName}</p> : null}
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            <span>Priority</span>
            <select
              className="h-10 w-full rounded-md border border-input px-3 text-sm"
              value={draft.priority}
              disabled={readOnly}
              onChange={(event) => onDraftChange({ ...draft, priority: event.target.value as LdtOrderPriority })}
            >
              <option value="">Select Priority</option>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-1">
            <span>Reason / Indication</span>
            <textarea className="min-h-24 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.reason} disabled={readOnly} onChange={(event) => onDraftChange({ ...draft, reason: event.target.value })} />
            {errors.reason ? <p className="text-[11px] text-danger">{errors.reason}</p> : null}
          </label>
          <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-1">
            <span>Clinical Notes</span>
            <textarea className="min-h-24 w-full rounded-md border border-input px-3 py-2 text-sm outline-none" value={draft.clinicalNotes} disabled={readOnly} onChange={(event) => onDraftChange({ ...draft, clinicalNotes: event.target.value })} />
          </label>
        </div>

        {draft.ldtTypeId ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-3 rounded-md border border-border bg-surface-muted/30 p-4">
              <h4 className="text-sm font-semibold text-foreground">Properties</h4>
              <div className="grid gap-4">
                {propertyFields.map((field) => (
                  <label key={field.id} className="space-y-1 text-xs font-medium text-muted-foreground">
                    <span>{field.label}</span>
                    {renderField(field)}
                  </label>
                ))}
                {propertyFields.length === 0 ? <p className="text-sm text-muted-foreground">No properties configured for this LDT Type.</p> : null}
              </div>
            </section>
            <section className="space-y-3 rounded-md border border-border bg-surface-muted/30 p-4">
              <h4 className="text-sm font-semibold text-foreground">Assessment</h4>
              <div className="grid gap-4">
                {assessmentFields.map((field) => (
                  <label key={field.id} className="space-y-1 text-xs font-medium text-muted-foreground">
                    <span>{field.label}</span>
                    {renderField(field)}
                  </label>
                ))}
                {assessmentFields.length === 0 ? <p className="text-sm text-muted-foreground">No assessments configured for this LDT Type.</p> : null}
              </div>
            </section>
          </div>
        ) : null}



      </div>
    </div>
  );
}



