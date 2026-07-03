import { AlignLeft } from "lucide-react";

import type { BundleItem } from "@/features/bundle/bundle-types";

export const textareaBundle: BundleItem = {
  id: "textarea",
  category: "Forms",
  title: "Textarea",
  description: "Multi-line note input for remarks, clinical notes, and comments.",
  icon: AlignLeft,
  code: String.raw`export function TextareaBundle() {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">Clinical note</span>
      <textarea
        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        placeholder="Enter note"
      />
    </label>
  );
}`,
  renderPreview: () => (
    <label className="space-y-1 text-sm">
      <span className="font-medium">Clinical note</span>
      <textarea
        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        placeholder="Enter note"
      />
    </label>
  ),
};
