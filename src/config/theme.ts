import type { UiPreference } from "@/types";

export type ThemePreset = {
  id: UiPreference["colorPreset"];
  label: string;
  description: string;
  primary: string;
  hsl: string;
  foreground: string;
  soft: string;
};

export const defaultPreference: UiPreference = {
  version: 1,
  mode: "system",
  colorPreset: "clinical-blue",
  density: "compact",
  sidebar: "auto",
};

export const themePresets: ThemePreset[] = [
  {
    id: "clinical-blue",
    label: "Patient Indigo",
    description: "Default operational HMS palette",
    primary: "#6878e8",
    hsl: "232 74% 66%",
    foreground: "0 0% 100%",
    soft: "232 74% 96%",
  },
  {
    id: "care-green",
    label: "Care Green",
    description: "Calm care team accent",
    primary: "#15803d",
    hsl: "142 72% 29%",
    foreground: "0 0% 100%",
    soft: "142 72% 94%",
  },
  {
    id: "trust-teal",
    label: "Trust Teal",
    description: "Balanced clinical-admin accent",
    primary: "#0f766e",
    hsl: "175 77% 26%",
    foreground: "0 0% 100%",
    soft: "175 77% 94%",
  },
  {
    id: "emergency-red",
    label: "Emergency Red",
    description: "Urgent accent without changing status colors",
    primary: "#b91c1c",
    hsl: "0 74% 42%",
    foreground: "0 0% 100%",
    soft: "0 74% 95%",
  },
  {
    id: "executive-neutral",
    label: "Executive Neutral",
    description: "Restrained management workspace",
    primary: "#475569",
    hsl: "215 16% 47%",
    foreground: "0 0% 100%",
    soft: "210 20% 96%",
  },
];

export const uiPreferenceStorageKey = "plasmit-ui-preference-v1";

export function isHexColor(value: string) {
  return /^#([0-9a-fA-F]{6})$/.test(value.trim());
}

export function hexToHsl(hex: string) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function foregroundForHex(hex: string) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? "222 47% 11%" : "0 0% 100%";
}
