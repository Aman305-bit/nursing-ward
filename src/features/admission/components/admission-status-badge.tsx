import { Badge, type BadgeProps } from "@/components/ui/badge";

function toneFor(value: string): BadgeProps["tone"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("emergency") || normalized.includes("blocked") || normalized.includes("high")) {
    return "danger";
  }
  if (normalized.includes("urgent") || normalized.includes("pending") || normalized.includes("cleaning") || normalized.includes("medium")) {
    return "warning";
  }
  if (normalized.includes("accepted") || normalized.includes("ready") || normalized.includes("available") || normalized.includes("low")) {
    return "success";
  }
  if (normalized.includes("occupied") || normalized.includes("reserved") || normalized.includes("isolation")) {
    return "info";
  }
  return "muted";
}

export function AdmissionStatusBadge({ value }: { value: string }) {
  return <Badge tone={toneFor(value)}>{value}</Badge>;
}
