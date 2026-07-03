import { Type } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const textboxBundle: BundleItem = {
  id: "textbox",
  category: "Forms",
  title: "Textbox",
  description: "Basic text, number, password, date, and disabled input fields.",
  icon: Type,
  code: String.raw`import { Input } from "@/components/ui/input";

export function TextboxBundle() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input placeholder="Patient name" />
      <Input type="number" placeholder="Mobile number" />
      <Input type="password" placeholder="Password" />
      <Input type="date" />
      <Input placeholder="Disabled input" disabled />
    </div>
  );
}`,
  renderPreview: () => (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input placeholder="Patient name" />
      <Input type="number" placeholder="Mobile number" />
      <Input type="password" placeholder="Password" />
      <Input type="date" />
      <Input placeholder="Disabled input" disabled />
    </div>
  ),
};
