"use client";

import * as React from "react";
import { Check, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultPreference, isHexColor, themePresets } from "@/config/theme";
import { cn } from "@/lib/utils";
import { useUiPreference } from "@/components/providers/ui-preference-provider";
import type { UiPreference } from "@/types";

export function ThemeSettingsPanel() {
  const { preference, setPreference, resetPreference } = useUiPreference();
  const preferenceKey = JSON.stringify(preference);
  const [draftState, setDraftState] = React.useState<{ key: string; value: UiPreference }>(() => ({
    key: preferenceKey,
    value: preference,
  }));

  const draft = draftState.key === preferenceKey ? draftState.value : preference;
  const setDraft = (value: UiPreference) => setDraftState({ key: preferenceKey, value });

  const customInvalid = draft.colorPreset === "custom" && draft.customPrimary ? !isHexColor(draft.customPrimary) : false;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3">
              {(["light", "dark", "system"] as const).map((mode) => (
                <button
                  className={cn(
                    "rounded-lg border border-border bg-surface p-3 text-left text-sm outline-none transition hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring",
                    draft.mode === mode && "border-primary bg-primary/10 ring-1 ring-primary/20",
                  )}
                  key={mode}
                  onClick={() => setDraft({ ...draft, mode })}
                  type="button"
                >
                  <span className="font-medium capitalize text-foreground">{mode}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {mode === "system" ? "Follow device preference" : `${mode} interface tokens`}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dynamic Color</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {themePresets.map((preset) => (
                <button
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left outline-none transition hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring",
                    draft.colorPreset === preset.id && "border-primary bg-primary/10 ring-1 ring-primary/20",
                  )}
                  key={preset.id}
                  onClick={() => setDraft({ ...draft, colorPreset: preset.id })}
                  type="button"
                >
                  <span className="h-8 w-8 rounded-md border border-border" style={{ backgroundColor: preset.primary }} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{preset.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{preset.description}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <label className="text-xs font-semibold text-foreground" htmlFor="custom-color">
                Custom primary color
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="custom-color"
                  placeholder="#6878e8"
                  value={draft.customPrimary ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, colorPreset: "custom", customPrimary: event.target.value })
                  }
                />
                <div className="h-9 w-12 rounded-md border border-border" style={{ backgroundColor: isHexColor(draft.customPrimary ?? "") ? draft.customPrimary : "#6878e8" }} />
              </div>
              {customInvalid ? <p className="mt-2 text-xs text-danger">Use a valid 6-digit hex color, for example #0f766e.</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Density And Layout</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Density</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["compact", "comfortable"] as const).map((density) => (
                  <Button
                    key={density}
                    type="button"
                    variant={draft.density === density ? "default" : "outline"}
                    onClick={() => setDraft({ ...draft, density })}
                  >
                    {density}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Sidebar</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["auto", "expanded", "collapsed"] as const).map((sidebar) => (
                  <Button
                    key={sidebar}
                    type="button"
                    variant={draft.sidebar === sidebar ? "default" : "outline"}
                    onClick={() => setDraft({ ...draft, sidebar })}
                  >
                    {sidebar}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Plasmit Hospital</p>
                <p className="text-xs text-muted-foreground">Preview uses persisted tokens after apply.</p>
              </div>
              <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">Active</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-md bg-success/10 p-2 text-xs text-success">Success state</div>
              <div className="rounded-md bg-warning/10 p-2 text-xs text-warning">Warning state</div>
              <div className="rounded-md bg-danger/10 p-2 text-xs text-danger">Danger state</div>
              <div className="rounded-md bg-info/10 p-2 text-xs text-info">Info state</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={customInvalid}
              onClick={() => setPreference({ ...draft, version: 1 })}
              type="button"
            >
              <Check className="h-4 w-4" />
              Apply
            </Button>
            <Button
              onClick={() => {
                resetPreference();
                setDraft(defaultPreference);
              }}
              type="button"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Default resets to {defaultPreference.colorPreset}, compact density, and system mode.</p>
        </CardContent>
      </Card>
    </div>
  );
}
