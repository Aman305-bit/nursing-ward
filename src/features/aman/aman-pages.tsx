import { CalendarClock } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AmanDemoPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Testing"
        title="Aman Demo UI"
        description="Bundle components ko use karke testing page."
      />

      <Card className="max-w-md">
        <CardHeader>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted">
            <CalendarClock className="h-4 w-4 text-primary" />
          </div>
          <Badge tone="warning">Pending</Badge>
        </CardHeader>

        <CardContent>
          <CardTitle>Appointment with Dr. Nisha Sen</CardTitle>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Aisha Khan | UHID-240221 | Today, 11:30 AM
          </p>

          <div className="mt-3 flex gap-2">
            <Button size="sm">View</Button>
            <Button size="sm" variant="outline">Reschedule</Button>
            <Button size="sm" variant="danger">Cancel</Button>
            <Button>Primary Button</Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
