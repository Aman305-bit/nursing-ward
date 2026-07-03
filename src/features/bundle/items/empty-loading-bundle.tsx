import { FileText } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const emptyLoadingBundle: BundleItem = {
  id: "empty-loading",
  category: "Data",
  title: "Empty / Loading",
  description: "Skeleton rows, loading blocks, and empty state surface.",
  icon: FileText,
  code: String.raw`import { FileText } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyLoadingBundle() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-lg border border-border p-3">
        <Skeleton className="h-8" />
        <Skeleton className="h-20" />
        <Skeleton className="h-8 w-2/3" />
      </div>
      <EmptyState icon={FileText} title="No records found" description="Adjust filters or search another term." action="Reset filters" />
    </div>
  );
}`,
  renderPreview: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-lg border border-border p-3">
        <Skeleton className="h-8" />
        <Skeleton className="h-20" />
        <Skeleton className="h-8 w-2/3" />
      </div>
      <EmptyState icon={FileText} title="No records found" description="Adjust filters or search another term." action="Reset filters" />
    </div>
  ),
};
