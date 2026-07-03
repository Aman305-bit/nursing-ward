import { AlertTriangle, Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const buttonBundle: BundleItem = {
  id: "button",
  category: "Actions",
  title: "Button",
  description: "Primary, secondary, outline, ghost, danger, icon, and disabled button states.",
  icon: Save,
  code: String.raw`import { AlertTriangle, Plus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ButtonBundle() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button><Save className="h-4 w-4" />Save</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger"><AlertTriangle className="h-4 w-4" />Danger</Button>
      <Button size="icon" aria-label="Add"><Plus className="h-4 w-4" /></Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}`,
  renderPreview: () => (
    <div className="flex flex-wrap gap-2">
      <Button><Save className="h-4 w-4" />Save</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger"><AlertTriangle className="h-4 w-4" />Danger</Button>
      <Button size="icon" aria-label="Add"><Plus className="h-4 w-4" /></Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};
