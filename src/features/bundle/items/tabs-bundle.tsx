import { Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const tabsBundle: BundleItem = {
  id: "tabs",
  category: "Layout",
  title: "Tabs",
  description: "Tabbed view for overview, orders, and audit content.",
  icon: Settings,
  code: String.raw`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function TabsBundle() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="audit">Audit</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><div className="rounded-md border border-border p-3 text-sm">Summary content</div></TabsContent>
      <TabsContent value="orders"><div className="flex gap-2 rounded-md border border-border p-3"><Badge tone="warning">3 pending</Badge><Badge tone="success">8 complete</Badge></div></TabsContent>
      <TabsContent value="audit"><div className="rounded-md border border-border p-3 text-sm">Audit timeline</div></TabsContent>
    </Tabs>
  );
}`,
  renderPreview: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="audit">Audit</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><div className="rounded-md border border-border p-3 text-sm">Summary content</div></TabsContent>
      <TabsContent value="orders"><div className="flex flex-wrap gap-2 rounded-md border border-border p-3"><Badge tone="warning">3 pending</Badge><Badge tone="success">8 complete</Badge></div></TabsContent>
      <TabsContent value="audit"><div className="rounded-md border border-border p-3 text-sm">Audit timeline</div></TabsContent>
    </Tabs>
  ),
};
