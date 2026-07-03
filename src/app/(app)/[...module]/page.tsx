import { Construction, FileText } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type PlannedModulePageProps = {
  params: Promise<{
    module: string[];
  }>;
};

export default async function PlannedModulePage({ params }: PlannedModulePageProps) {
  const { module } = await params;
  const title = module.map((part) => part.replaceAll("-", " ")).join(" / ");

  return (
    <div className="space-y-5">
      <PageHeader
        title={title.replace(/\b\w/g, (char) => char.toUpperCase())}
        description="This route is reserved by Phase 1 navigation for a future detailed module phase."
        eyebrow="Future module placeholder"
      />
      <div className="grid gap-4 pt-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <EmptyState
          icon={Construction}
          title="Module reserved for later phase"
          description="Phase 1 prepares the route, navigation visibility, shell, responsive behavior, and states. Business workflows will be implemented only when their phase begins."
          action="Return to dashboard"
        />
        <Card>
          <CardHeader>
            <CardTitle>Prepared Foundation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertBanner icon={FileText} title="Phase discipline" tone="info">
              This app intentionally avoids building future business workflows before their phase documentation is active.
            </AlertBanner>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Shared app shell and role-aware navigation are active.</li>
              <li>Theme, density, drawers, tables, forms, and page headers are ready.</li>
              <li>Static mock data can be extended when the module phase starts.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
