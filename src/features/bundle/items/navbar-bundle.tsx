import { Bell, Menu, Search, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const navbarBundle: BundleItem = {
  id: "navbar",
  category: "Layout",
  title: "Navbar",
  description: "Top navigation bar with menu, search, notifications, and settings actions.",
  icon: Menu,
  code: String.raw`import { Bell, Menu, Search, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NavbarBundle() {
  return (
    <header className="flex h-14 items-center gap-3 rounded-lg border border-border bg-surface px-3">
      <Button size="icon" variant="ghost" aria-label="Menu"><Menu className="h-4 w-4" /></Button>
      <div className="font-semibold">Dashboard</div>
      <div className="ml-auto hidden max-w-sm flex-1 sm:block"><Input placeholder="Search..." /></div>
      <Button size="icon" variant="outline" aria-label="Search"><Search className="h-4 w-4" /></Button>
      <Button size="icon" variant="outline" aria-label="Notifications"><Bell className="h-4 w-4" /></Button>
      <Button size="icon" variant="outline" aria-label="Settings"><Settings className="h-4 w-4" /></Button>
    </header>
  );
}`,
  renderPreview: () => (
    <header className="flex h-14 items-center gap-3 rounded-lg border border-border bg-surface px-3">
      <Button size="icon" variant="ghost" aria-label="Menu"><Menu className="h-4 w-4" /></Button>
      <div className="font-semibold">Dashboard</div>
      <div className="ml-auto hidden max-w-sm flex-1 sm:block"><Input placeholder="Search..." /></div>
      <Button size="icon" variant="outline" aria-label="Search"><Search className="h-4 w-4" /></Button>
      <Button size="icon" variant="outline" aria-label="Notifications"><Bell className="h-4 w-4" /></Button>
      <Button size="icon" variant="outline" aria-label="Settings"><Settings className="h-4 w-4" /></Button>
    </header>
  ),
};
