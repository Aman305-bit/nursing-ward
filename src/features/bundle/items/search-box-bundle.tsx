import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const searchBoxBundle: BundleItem = {
  id: "search-box",
  category: "Forms",
  title: "Search Box",
  description: "Search input with icon button and optional filter action.",
  icon: Search,
  code: String.raw`import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBoxBundle() {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <Input placeholder="Search patient, UHID, mobile" />
      <Button size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
      <Button variant="outline"><Filter className="h-4 w-4" />Filter</Button>
    </div>
  );
}`,
  renderPreview: () => (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <Input placeholder="Search patient, UHID, mobile" />
      <Button size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>
      <Button variant="outline"><Filter className="h-4 w-4" />Filter</Button>
    </div>
  ),
};
