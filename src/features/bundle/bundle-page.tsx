"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ClipboardList, Package, Search, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { BundlePageHeader, ComponentVariantSection } from "@/features/bundle/bundle-components";
import { bundleCategories, bundleItems, getBundleItem } from "@/features/bundle/bundle-registry";
import { getBundleShowcaseSections } from "@/features/bundle/bundle-showcases";

function BundleHomePage() {
  const [query, setQuery] = React.useState("");
  const filteredItems = bundleItems.filter((item) => {
    const haystack = [item.label ?? item.title, item.title, item.description, item.category, ...(item.keywords ?? [])].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const totalComponents = bundleItems.reduce((sum, item) => sum + (item.count ?? 1), 0);

  return (
    <div className="space-y-5">
      <BundlePageHeader
        title="UI Bundle Library"
        subtitle="Reusable frontend components for fast hospital module development."
        breadcrumb={["Dashboard", "Bundle"]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bundle sections" value={bundleItems.length} change="Ready" context="Reusable pages" tone="success" icon={Package} />
        <StatCard label="Component examples" value={totalComponents} change="Copyable" context="Preview + code" tone="info" icon={ClipboardList} />
        <StatCard label="Categories" value={bundleCategories.length} change="Organized" context="Fast discovery" tone="muted" icon={Settings} />
        <StatCard label="Backend APIs" value={0} change="Dummy data" context="Frontend only" tone="warning" icon={AlertCircle} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Search component box</CardTitle>
            <CardDescription>Search by component name, healthcare scenario, or UI pattern.</CardDescription>
          </div>
          <Badge tone="info">{filteredItems.length} sections</Badge>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search buttons, patient card, billing, upload, chart..." />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/bundle/${item.id}`} key={item.id}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-muted">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge tone="muted">{item.category}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold text-foreground">{item.label ?? item.title}</div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <Badge tone="info">{item.count ?? 1} examples</Badge>
                    <span className="text-primary group-hover:underline">{`/bundle/${item.id}`}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quick navigation</CardTitle>
            <CardDescription>Open common component groups while building modules.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["buttons", "forms", "inputs", "tables", "charts", "patient-components", "pharmacy-components"].map((id) => {
            const item = getBundleItem(id);
            return item ? <Button asChild variant="outline" key={id}><Link href={`/bundle/${id}`}>{item.label ?? item.title}</Link></Button> : null;
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function BundleDetailPage({ itemId }: { itemId: string }) {
  const item = getBundleItem(itemId);

  if (!item) {
    return (
      <div className="space-y-5">
        <BundlePageHeader title="Component not found" subtitle="This Bundle route does not exist yet." breadcrumb={["Dashboard", "Bundle", "Not Found"]} />
        <EmptyState icon={Search} title="No bundle item found" description="Open Bundle Home and choose an available component section." action="Back to bundle" />
      </div>
    );
  }

  const sections = getBundleShowcaseSections(item);
  const totalVariants = sections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="space-y-5">
      <BundlePageHeader
        title={item.title}
        subtitle={item.description}
        breadcrumb={["Dashboard", "Bundle", item.label ?? item.title]}
        category={item.category}
        count={totalVariants}
      />

      <div className="space-y-5">
        {sections.map((section) => <ComponentVariantSection key={section.title} {...section} />)}
      </div>
    </div>
  );
}

export function BundlePage({ itemId }: { itemId?: string }) {
  if (!itemId) return <BundleHomePage />;
  return <BundleDetailPage itemId={itemId} />;
}
