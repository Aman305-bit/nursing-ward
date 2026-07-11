"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { initialOrders } from "./drugs/data";
import { OrderDetailsCard } from "./drugs/order-details-card";
import { SelectDrugsCard } from "./drugs/select-drugs-card";
import { SummaryCard } from "./drugs/summary-card";
import type { DrugOrder, DrugScope, OrderDraft } from "./drugs/types";
import { calculateAutoQty, deriveCategory, isAutoQtyForm, isContinuousFluid, isFormADrug, isInjectionForm, isIvRoute, makeDraft, routeOptionsForForm } from "./drugs/utils";
import { PatientSummaryBanner } from "./shared/patient-summary-banner";

function SubmitOrderCard({ count, onSubmit }: { count: number; onSubmit: () => void }) {
  return (
    <Card className="xl:col-start-2">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">Ready to submit</div>
          <div className="mt-1 text-xs text-muted-foreground">{count ? `${count} selected drug order${count > 1 ? "s" : ""} will be submitted.` : "Select drugs before submitting."}</div>
        </div>
        <Button type="button" disabled={!count} onClick={onSubmit}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

export function DrugsTab() {
  const [orders] = React.useState<DrugOrder[]>(initialOrders);
  const [search, setSearch] = React.useState("");
  const [selectedDrugIds, setSelectedDrugIds] = React.useState<string[]>([]);
  const [drugScope, setDrugScope] = React.useState<DrugScope>("All Drugs");
  const [drafts, setDrafts] = React.useState<Record<string, OrderDraft>>({});
  const [activeEditorId, setActiveEditorId] = React.useState<string | null>(null);
  const [flashIds, setFlashIds] = React.useState<Record<string, boolean>>({});
  const editorRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const scopedOrders =
    drugScope === "All Drugs"
      ? orders
      : orders.filter((order) => order.availableQty > 0).slice(0, 5);

  const filteredOrders = scopedOrders.filter((order) => {
    const matchesSearch = `${order.genericName} ${order.name} ${order.form} ${order.availableQty}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch;
  });
  const selectableOrders = filteredOrders;
  const selectedOrders = selectedDrugIds.map((id) => orders.find((order) => order.id === id)).filter(Boolean) as DrugOrder[];

  const flashTotalQty = (id: string) => {
    setFlashIds((current) => ({ ...current, [id]: true }));
    window.setTimeout(() => {
      setFlashIds((current) => ({ ...current, [id]: false }));
    }, 700);
  };

  const updateDraft = (id: string, values: Partial<OrderDraft>) => {
    setDrafts((current) => {
      const sourceOrder = orders.find((order) => order.id === id);
      const currentDraft = current[id] ?? (sourceOrder ? makeDraft(sourceOrder) : null);
      if (!currentDraft) return current;

      const nextDraft = { ...currentDraft, ...values };
      const formChanged = "form" in values;
      const routeChanged = "route" in values;
      const categoryChanged = "category" in values;

      if (formChanged && isContinuousFluid(nextDraft.form)) {
        nextDraft.route = "Intravenous (IV)";
        nextDraft.continuous = true;
        nextDraft.intermittent = false;
      }
      if (formChanged && isInjectionForm(nextDraft.form) && isIvRoute(nextDraft.route)) {
        nextDraft.intermittent = true;
        nextDraft.continuous = false;
      }
      if (formChanged && !isInjectionForm(nextDraft.form) && !isContinuousFluid(nextDraft.form)) {
        nextDraft.bolus = false;
        nextDraft.intermittent = false;
        nextDraft.continuous = false;
      }
      if (formChanged && isFormADrug(nextDraft.form) && !nextDraft.sos && !nextDraft.stat) {
        nextDraft.category = "";
      }
      if (routeChanged && isInjectionForm(nextDraft.form) && isIvRoute(nextDraft.route)) {
        nextDraft.intermittent = true;
        nextDraft.continuous = false;
      }
      if (routeChanged && !isIvRoute(nextDraft.route)) {
        nextDraft.intermittent = false;
        nextDraft.continuous = false;
      }
      if (values.intermittent) {
        nextDraft.route = "Intravenous (IV)";
        nextDraft.continuous = false;
      }
      if (values.continuous) {
        nextDraft.route = "Intravenous (IV)";
        nextDraft.intermittent = false;
        nextDraft.days = "";
        nextDraft.frequency = "";
      }
      if (values.sos) {
        nextDraft.frequency = nextDraft.frequency || "SOS";
      }
      if (values.stat || values.bolus) {
        nextDraft.days = "";
      }
      if (nextDraft.continuous) {
        nextDraft.frequency = "";
      }
      if (values.category === "Unscheduled") {
        nextDraft.frequency = "";
        nextDraft.days = "";
        nextDraft.startDate = "";
        nextDraft.endDate = "";
      }
      if (values.category === "Discontinued") {
        nextDraft.days = "0";
        nextDraft.orderedQty = "0";
      }
      if (values.startDate && nextDraft.endDate && nextDraft.endDate < values.startDate) {
        nextDraft.endDate = "";
      }
      if (!routeOptionsForForm(nextDraft.form, nextDraft.continuous, nextDraft.intermittent).includes(nextDraft.route)) {
        nextDraft.route = routeOptionsForForm(nextDraft.form, nextDraft.continuous, nextDraft.intermittent)[0] ?? "";
      }
      if (!categoryChanged) {
        nextDraft.category = deriveCategory(nextDraft);
      }

      if (formChanged && !isAutoQtyForm(nextDraft.form)) {
        nextDraft.orderedQty = "1";
      }
      const shouldAutoFill = isAutoQtyForm(nextDraft.form) && !("orderedQty" in values) && ("frequency" in values || "days" in values || "category" in values || "dosage" in values || "totalDose" in values || "bolusDose" in values || "rateDose" in values || "rateTimeUnit" in values || "totalDuration" in values || "totalDurationUnit" in values || "continuous" in values || "intermittent" in values || "sos" in values || "stat" in values || "bolus" in values);
      if (shouldAutoFill) {
        const nextQty = calculateAutoQty({
          form: nextDraft.form,
          category: nextDraft.category,
          frequency: nextDraft.frequency,
          days: nextDraft.days,
          dose: nextDraft.dosage,
          totalDose: nextDraft.totalDose,
          bolusDose: nextDraft.bolusDose,
          rateDose: nextDraft.rateDose,
          rateTimeUnit: nextDraft.rateTimeUnit,
          totalDuration: nextDraft.totalDuration,
          totalDurationUnit: nextDraft.totalDurationUnit,
        });
        const nextQtyValue = nextQty > 0 ? String(nextQty) : "";
        if (nextQtyValue !== nextDraft.orderedQty) {
          nextDraft.orderedQty = nextQtyValue;
          flashTotalQty(id);
        }
      }
      if (!isAutoQtyForm(nextDraft.form) && !nextDraft.orderedQty) {
        nextDraft.orderedQty = "1";
      }

      return { ...current, [id]: nextDraft };
    });
  };

  const toggleDrug = (order: DrugOrder, checked: boolean) => {
    if (checked) {
      setSelectedDrugIds((current) => (current.includes(order.id) ? current : [...current, order.id]));
      setDrafts((current) => ({ ...current, [order.id]: current[order.id] ?? makeDraft(order) }));
      setActiveEditorId(order.id);
      return;
    }

    setSelectedDrugIds((current) => current.filter((id) => id !== order.id));
    setActiveEditorId((current) => (current === order.id ? null : current));
  };

  const openSummaryEditor = (id: string) => {
    setActiveEditorId(id);
    window.setTimeout(() => {
      editorRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const deleteSummaryOrder = (id: string) => {
    setSelectedDrugIds((current) => current.filter((drugId) => drugId !== id));
    setActiveEditorId((current) => (current === id ? null : current));
    toast.success("Drug removed from summary");
  };

  const submitOrders = () => {
    const invalidTimeOrder = selectedOrders.find((order) => {
      const draft = drafts[order.id];
      return draft?.startDate && draft.endDate && draft.startTime && draft.endTime && `${draft.endDate}T${draft.endTime}` <= `${draft.startDate}T${draft.startTime}`;
    });
    const missingDiluentOrder = selectedOrders.find((order) => {
      const draft = drafts[order.id];
      return draft && isIvRoute(draft.route) && !draft.diluent;
    });

    if (invalidTimeOrder) {
      toast.error("Start time must be before end time");
      return;
    }
    if (missingDiluentOrder) {
      toast.error("Diluent is required for IV route");
      return;
    }

    toast.success(`${selectedOrders.length} drug order${selectedOrders.length > 1 ? "s" : ""} submitted`);
  };

  return (
    <div className="space-y-4">
      {/* <PatientSummaryBanner /> */}

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SelectDrugsCard
          orders={selectableOrders}
          selectedOrders={selectedOrders}
          selectedIds={selectedDrugIds}
          search={search}
          drugScope={drugScope}
          onSearchChange={setSearch}
          onDrugScopeChange={setDrugScope}
          onToggleDrug={toggleDrug}
        />
        <OrderDetailsCard
          orders={selectedOrders}
          drafts={drafts}
          flashIds={flashIds}
          activeId={activeEditorId}
          panelRef={(id, node) => {
            editorRefs.current[id] = node;
          }}
          onActiveChange={setActiveEditorId}
          onDraftChange={updateDraft}
        />
        <SubmitOrderCard count={selectedOrders.length} onSubmit={submitOrders} />
        <SummaryCard orders={selectedOrders} drafts={drafts} onEdit={openSummaryEditor} onDelete={deleteSummaryOrder} />
      </div>
    </div>
  );
}
