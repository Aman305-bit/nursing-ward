import { ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fieldClass, type BundleItem } from "@/features/bundle/bundle-types";

export const formControlsBundle: BundleItem = {
  id: "form-controls",
  category: "Forms",
  title: "Form Controls",
  description: "Select, checkbox, radio, date, and form action controls.",
  icon: ListChecks,
  code: String.raw`import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldClass = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export function FormControlsBundle() {
  return (
    <form className="grid gap-3 sm:grid-cols-2">
      <select className={fieldClass}>
        <option>OPD</option>
        <option>IPD</option>
        <option>Laboratory</option>
      </select>
      <Input type="date" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-primary" />
        Send SMS confirmation
      </label>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2"><input name="priority" type="radio" className="h-4 w-4 accent-primary" />Routine</label>
        <label className="flex items-center gap-2"><input name="priority" type="radio" className="h-4 w-4 accent-primary" />Urgent</label>
      </div>
      <Button className="sm:col-span-2">Save form</Button>
    </form>
  );
}`,
  renderPreview: () => (
    <form className="grid gap-3 sm:grid-cols-2">
      <select className={fieldClass} defaultValue="OPD">
        <option>OPD</option>
        <option>IPD</option>
        <option>Laboratory</option>
      </select>
      <Input type="date" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-primary" defaultChecked />
        Send SMS confirmation
      </label>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2"><input name="priority-preview" type="radio" className="h-4 w-4 accent-primary" defaultChecked />Routine</label>
        <label className="flex items-center gap-2"><input name="priority-preview" type="radio" className="h-4 w-4 accent-primary" />Urgent</label>
      </div>
      <Button className="sm:col-span-2">Save form</Button>
    </form>
  ),
};
