import { Home, LayoutDashboard, Settings, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const sidebarBundle: BundleItem = {
  id: "sidebar",
  category: "Layout",
  title: "Sidebar",
  description: "Vertical navigation with active state, groups, and compact items.",
  icon: LayoutDashboard,
  code: String.raw`import { Home, LayoutDashboard, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SidebarBundle() {
  const items = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "Patients", icon: Users },
    { label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 rounded-lg border border-border bg-sidebar p-2 text-sidebar-foreground">
      <div className="mb-2 flex items-center gap-2 px-2 py-2 font-semibold"><Home className="h-4 w-4" />Hospital</div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.label} className={item.active ? "flex h-9 w-full items-center gap-2 rounded-md bg-sidebar-active px-2 text-sm text-sidebar-active-foreground" : "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-active/10"}>
            <Icon className="h-4 w-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.active ? <Badge>Live</Badge> : null}
          </button>
        );
      })}
    </aside>
  );
}`,
  renderPreview: () => {
    const items = [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      { label: "Patients", icon: Users },
      { label: "Settings", icon: Settings },
    ];

    return (
      <aside className="w-full max-w-72 rounded-lg border border-border bg-sidebar p-2 text-sidebar-foreground">
        <div className="mb-2 flex items-center gap-2 px-2 py-2 font-semibold"><Home className="h-4 w-4" />Hospital</div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.active ? "flex h-9 w-full items-center gap-2 rounded-md bg-sidebar-active px-2 text-sm text-sidebar-active-foreground" : "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-active/10"}
              key={item.label}
              type="button"
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.active ? <Badge>Live</Badge> : null}
            </button>
          );
        })}
      </aside>
    );
  },
};
