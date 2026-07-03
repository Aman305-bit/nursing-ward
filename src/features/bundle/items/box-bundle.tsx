import { Box } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const boxBundle: BundleItem = {
  id: "box",
  category: "Layout",
  title: "Box / Card",
  description: "Reusable box surface with header, content, metric, badge, and status.",
  icon: Box,
  code: String.raw`import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";

export function BoxBundle() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today Overview</CardTitle>
        <Badge tone="info">Live</Badge>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div><div className="text-xs text-muted-foreground">Appointments</div><div className="mt-1 text-2xl font-semibold">128</div></div>
        <div><div className="text-xs text-muted-foreground">Admissions</div><div className="mt-1 text-2xl font-semibold">18</div></div>
        <div className="flex items-end justify-between gap-2"><StatusPill tone="success">Stable</StatusPill></div>
      </CardContent>
    </Card>
  );
}`,
  renderPreview: () => (
    <Card>
      <CardHeader>
        <CardTitle>Today Overview</CardTitle>
        <Badge tone="info">Live</Badge>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div><div className="text-xs text-muted-foreground">Appointments</div><div className="mt-1 text-2xl font-semibold">128</div></div>
        <div><div className="text-xs text-muted-foreground">Admissions</div><div className="mt-1 text-2xl font-semibold">18</div></div>
        <div className="flex items-end justify-between gap-2"><StatusPill tone="success">Stable</StatusPill></div>
      </CardContent>
    </Card>
  ),
};
