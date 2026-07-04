"use client";

import { ChevronDown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DrugDraftFields } from "./field-controls";
import type { DrugOrder, OrderDraft } from "./types";

export function OrderDetailsCard({
  orders,
  drafts,
  flashIds,
  activeId,
  panelRef,
  onActiveChange,
  onDraftChange,
}: {
  orders: DrugOrder[];
  drafts: Record<string, OrderDraft>;
  flashIds: Record<string, boolean>;
  activeId: string | null;
  panelRef: (id: string, node: HTMLDivElement | null) => void;
  onActiveChange: (id: string | null) => void;
  onDraftChange: (id: string, values: Partial<OrderDraft>) => void;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Order Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        {orders.length ? (
          orders.map((order) => {
            const draft = drafts[order.id];
            if (!draft) return null;
            const open = activeId === order.id;
            return (
              <div
                key={order.id}
                ref={(node) => panelRef(order.id, node)}
                className={[
                  "rounded-md border border-border bg-surface",
                  open ? "ring-2 ring-primary/25" : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="flex w-full min-w-0 items-center justify-between gap-3 px-3 py-3 text-left"
                  onClick={() => onActiveChange(open ? null : order.id)}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{draft.name}</div>
                    <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="mt-2 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{draft.genericName}</span>
                        <span>{order.name}</span>
                        <span>{draft.form || order.form}</span>
                        <span>Available: {order.availableQty}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={["h-4 w-4 shrink-0 text-muted-foreground transition", open ? "rotate-180" : ""].join(" ")} />
                </button>
                {open ? (
                  <div className="border-t border-border p-3">
                    <DrugDraftFields draft={draft} flash={Boolean(flashIds[order.id])} onChange={(values) => onDraftChange(order.id, values)} />
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Select a drug from the left card to start ordering.</div>
        )}
      </CardContent>
    </Card>
  );
}
