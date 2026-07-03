import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const alertStatusBundle: BundleItem = {
  id: "alert-status",
  category: "Feedback",
  title: "Alert / Status",
  description: "Success, warning, critical alerts, badges, and status pills.",
  icon: AlertTriangle,
  code: String.raw`import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";

export function AlertStatusBundle() {
  return (
    <div className="space-y-3">
      <AlertBanner icon={CheckCircle2} title="System ready" tone="success">The workflow is ready for action.</AlertBanner>
      <AlertBanner icon={AlertTriangle} title="Critical alert" tone="critical">Review this item before continuing.</AlertBanner>
      <div className="flex flex-wrap gap-2"><Badge>Default</Badge><Badge tone="info">Info</Badge><StatusPill tone="success">Approved</StatusPill></div>
    </div>
  );
}`,
  renderPreview: () => (
    <div className="space-y-3">
      <AlertBanner icon={CheckCircle2} title="System ready" tone="success">The workflow is ready for action.</AlertBanner>
      <AlertBanner icon={AlertTriangle} title="Critical alert" tone="critical">Review this item before continuing.</AlertBanner>
      <div className="flex flex-wrap gap-2"><Badge>Default</Badge><Badge tone="info">Info</Badge><StatusPill tone="success">Approved</StatusPill></div>
    </div>
  ),
};
