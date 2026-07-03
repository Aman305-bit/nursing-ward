"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  MonitorSmartphone,
  Printer,
  RadioTower,
  RefreshCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import {
  mockAbhaSync,
  mockAccessReviews,
  mockAiItems,
  mockApiApps,
  mockAuthPolicies,
  mockBackups,
  mockCompliance,
  mockConsents,
  mockDevices,
  mockDisasterRecovery,
  mockEncryptionCoverage,
  mockIntegrations,
  mockInteropMappings,
  mockIpRules,
  mockMessageProviderSync,
  mockMobileViews,
  mockPaymentGatewaySync,
  mockQaChecks,
  mockQaCrossBrowser,
  mockRemoteMonitoring,
  mockRetentionIncidents,
  mockSecurityEvents,
  mockSessions,
  mockWebhookEvents,
  type Phase12Record,
} from "@/data/phase12";
import type { Role, StatusTone } from "@/types";

type Phase12Module = "integrations" | "security" | "mobile" | "remote" | "smart" | "qa";

const moduleMeta: Record<Phase12Module, { eyebrow: string; label: string; icon: typeof Workflow; allowed: Role[]; fullAccess: Role[]; warning: string }> = {
  integrations: {
    eyebrow: "Phase 12 • Integrations",
    label: "Integrations",
    icon: Workflow,
    allowed: ["Super Admin", "Hospital Admin", "Billing Executive", "Lab Technician", "Radiologist", "Management"],
    fullAccess: ["Super Admin", "Hospital Admin"],
    warning: "All connectors are static placeholders. Source, target, direction, environment, credential expiry, failed reason, retry state, and audit handoff must remain visible.",
  },
  security: {
    eyebrow: "Phase 12 • Security",
    label: "Security & Compliance",
    icon: ShieldCheck,
    allowed: ["Super Admin", "Hospital Admin", "HR Manager", "Management"],
    fullAccess: ["Super Admin", "Hospital Admin"],
    warning: "Force logout, block device/IP, revoke access, restore backup, rotate key, withdraw consent, and privacy incident actions require reason and confirmation placeholders.",
  },
  mobile: {
    eyebrow: "Phase 12 • Mobile",
    label: "Mobile",
    icon: Smartphone,
    allowed: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Billing Executive", "HR Manager", "Management"],
    fullAccess: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Management"],
    warning: "Mobile role previews preserve role permissions and show offline, conflict, push permission, restricted action, and session timeout placeholders.",
  },
  remote: {
    eyebrow: "Phase 12 • Remote Monitoring",
    label: "Remote Monitoring",
    icon: RadioTower,
    allowed: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Management"],
    fullAccess: ["Super Admin", "Hospital Admin", "Doctor", "Nurse"],
    warning: "Remote feeds are placeholders. Stale data, threshold alerts, device status, consent restrictions, and escalation paths remain visible.",
  },
  smart: {
    eyebrow: "Phase 12 • Smart Healthcare",
    label: "AI & Smart Healthcare",
    icon: Bot,
    allowed: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Radiologist", "Management"],
    fullAccess: ["Super Admin", "Doctor", "Radiologist"],
    warning: "AI, voice, prediction, smart alert, and CDS outputs are placeholders and always require authorized clinical review, accept/reject, and override reason states.",
  },
  qa: {
    eyebrow: "Phase 12 • Final QA",
    label: "Final QA",
    icon: CheckCircle2,
    allowed: ["Super Admin", "Hospital Admin", "Management", "HR Manager"],
    fullAccess: ["Super Admin", "Hospital Admin"],
    warning: "Final QA tracks route coverage, theme, responsive, accessibility, performance, browser, print/export, blocker, waiver, owner, and sign-off placeholders.",
  },
};

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function titleize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function phase12Tone(status: string): StatusTone {
  if (["Active", "Connected placeholder", "Synced", "Normal", "Resolved", "Completed", "Drill completed", "Available", "Accepted", "Passed", "Signed off"].includes(status)) return "success";
  if (["Risk flagged", "Backup failed", "Escalated", "Restricted", "Offline placeholder", "Blocked", "Failed", "Overridden"].includes(status)) return "critical";
  if (["Configured placeholder", "Sync pending", "Syncing placeholder", "Retrying", "Key pending placeholder", "Warning", "Force logout pending", "Scheduled", "Running placeholder", "Restore requested placeholder", "Expiring soon", "Renewal required", "Pending sync placeholder", "Needs review", "Suggested", "In progress", "Review pending"].includes(status)) return "warning";
  if (["Error", "Revoked placeholder", "Inactive", "Disabled", "Withdrawn", "Expired", "Rejected", "Export failed placeholder"].includes(status)) return "danger";
  if (["Draft", "Rate limited placeholder", "Drill pending", "Waived placeholder", "Action pending"].includes(status)) return "info";
  return "muted";
}

function Phase12Status({ status }: { status: string }) {
  return <StatusPill tone={phase12Tone(status)}>{status}</StatusPill>;
}

function ProtectedPhase12({
  module,
  children,
}: {
  module: Phase12Module;
  children: (state: { role: Role; readOnly: boolean }) => React.ReactNode;
}) {
  const { role } = useRole();
  const meta = moduleMeta[module];
  const allowed = meta.allowed.includes(role);
  const readOnly = !meta.fullAccess.includes(role);
  if (!allowed) {
    return <EmptyState icon={LockKeyhole} title={`${meta.label} permission required`} description={`Your current static role cannot access Phase 12 ${meta.label.toLowerCase()} workflows.`} />;
  }
  return (
    <div className="space-y-4">
      {readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title={`Read-only ${meta.label} access`}>
          {role} can review Phase 12 states in this static preview, but sync retry, key rotation, security block, AI approval, export, and sign-off actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role, readOnly })}
    </div>
  );
}

function Phase12Shell({
  module,
  title,
  description,
  icon,
  actions,
  children,
}: {
  module: Phase12Module;
  title: string;
  description: string;
  icon?: typeof Workflow;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const meta = moduleMeta[module];
  const Icon = icon ?? meta.icon;
  return (
    <ProtectedPhase12 module={module}>
      {() => (
        <>
          <PageHeader
            eyebrow={meta.eyebrow}
            title={title}
            description={description}
            actions={
              actions ?? (
                <>
                  <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
                  <Button variant="outline" onClick={() => toast.info("Static Phase 12 data refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
                  <Button><Icon className="h-4 w-4" />Open workflow</Button>
                </>
              )
            }
          />
          <AlertBanner icon={AlertTriangle} tone="warning" title={`${meta.label} governance`}>{meta.warning}</AlertBanner>
          {children}
        </>
      )}
    </ProtectedPhase12>
  );
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">{children}</div>;
}

function valueForCell(key: string, value: Phase12Record[string]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && /configured|connected|sync|synced|failed|retry|disabled|active|inactive|pending|limited|error|revoked|normal|warning|risk|blocked|logout|resolved|scheduled|running|completed|restore|drill|expiring|expired|withdrawn|restricted|available|offline|draft|suggested|review|accepted|rejected|overridden|escalated|passed|waived|signed/i.test(value)) return <Phase12Status status={value} />;
  return String(value ?? "NA");
}

function SimpleTable({ records, onOpen }: { records: Phase12Record[]; onOpen?: (record: Phase12Record) => void }) {
  const columns = React.useMemo<ColumnDef<Phase12Record>[]>(() => {
    const keys = Object.keys(records[0] ?? {}).filter((key) => key !== "id").slice(0, 8);
    const baseColumns = keys.map((key) => ({
      header: titleize(key),
      cell: ({ row }: { row: { original: Phase12Record } }) => valueForCell(key, row.original[key]),
    }));
    if (!onOpen) return baseColumns;
    return [
      ...baseColumns,
      { header: "Actions", cell: ({ row }: { row: { original: Phase12Record } }) => <Button size="sm" variant="outline" onClick={() => onOpen(row.original)}>Detail</Button> },
    ];
  }, [records, onOpen]);
  return <DataTable data={records} columns={columns} />;
}

function RecordGrid({ title, records }: { title: string; records: Phase12Record[] }) {
  if (!records.length) return <EmptyState icon={Search} title={`No ${title.toLowerCase()}`} description="No static records match this Phase 12 workflow state." />;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="font-semibold">{title}</div>
        <div className="grid gap-2">
          {records.map((record) => (
            <div key={String(record.id)} className="rounded-md border border-border bg-surface-muted p-3 text-xs">
              {Object.entries(record).filter(([key]) => key !== "id").slice(0, 7).map(([key, value]) => (
                <div key={key} className="grid gap-2 border-b border-border/60 py-1 last:border-0 sm:grid-cols-[150px_1fr]">
                  <span className="text-muted-foreground">{titleize(key)}</span>
                  <span>{valueForCell(key, value)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ContextHeader({ module, record }: { module: Phase12Module; record: Phase12Record }) {
  const meta = moduleMeta[module];
  const Icon = meta.icon;
  const title = String(record.connector ?? record.appName ?? record.actor ?? record.patient ?? record.roleView ?? record.surface ?? record.area ?? record.id);
  const status = String(record.status ?? "Configured placeholder");
  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{title}</span>
              <Badge tone="muted">{meta.label}</Badge>
              <Phase12Status status={status} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Static context, review state, reason placeholder, print/export, and audit handoff.</div>
          </div>
        </div>
        <Button size="sm" variant="outline" asChild><Link href="/security-compliance/audit-trail">Audit handoff</Link></Button>
      </CardContent>
    </Card>
  );
}

function DetailDrawer({ module, record, open, onOpenChange }: { module: Phase12Module; record: Phase12Record | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Phase 12 detail" description={record ? String(record.connector ?? record.appName ?? record.area ?? record.id) : "Detail"} className="md:w-[700px]">
      {record ? (
        <div className="space-y-4">
          <ContextHeader module={module} record={record} />
          <AlertBanner icon={ShieldCheck} tone="warning" title="High-impact action control">
            Retry, revoke, rotate, force logout, block, restore, consent withdrawal, AI approval, override, and release sign-off actions require reason and confirmation placeholders.
          </AlertBanner>
          <RecordGrid title="Detail fields" records={[record]} />
          <Card>
            <CardContent className="space-y-3 bg-white p-4 text-slate-900">
              <div className="text-sm font-semibold">Print-safe preview</div>
              <DetailRow label="Record" value={String(record.connector ?? record.appName ?? record.area ?? record.id)} />
              <DetailRow label="Status" value={String(record.status ?? "Ready")} />
              <DetailRow label="Generated" value="Static Phase 12 preview" />
              <div className="rounded-md border p-3 text-xs">Secrets remain masked; internal controls are hidden in real print/export flows.</div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </Drawer>
  );
}

function ModuleLinks({ links }: { links: Array<[string, string]> }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="font-semibold">Quick actions</div>
        {links.map(([label, href]) => <Button key={href} className="w-full justify-start" variant="outline" asChild><Link href={href}>{label}</Link></Button>)}
      </CardContent>
    </Card>
  );
}

export function IntegrationsDashboardPage() {
  return (
    <Phase12Shell module="integrations" title="Integrations" description="Connector health, failed syncs, API status, credential expiry, retry queues, mapping gaps, and integration risk." icon={Workflow}>
      <SummaryGrid>
        <StatCard label="Configured" value={mockIntegrations.length} change="Connectors" context="Static" tone="info" icon={Workflow} />
        <StatCard label="Failed syncs" value={mockIntegrations.filter((item) => item.status === "Failed").length + mockWebhookEvents.filter((item) => item.status === "Failed").length + mockPaymentGatewaySync.filter((item) => item.status === "Failed").length + mockMessageProviderSync.filter((item) => item.status === "Failed").length} change="Retry" context="Queue" tone="danger" icon={AlertTriangle} />
        <StatCard label="Credential warnings" value={mockIntegrations.filter((item) => String(item.credentialExpiry).includes("Expired") || String(item.credentialExpiry).includes("days")).length} change="Rotate" context="Keys" tone="warning" icon={LockKeyhole} />
        <StatCard label="Mapping pending" value={mockInteropMappings.filter((item) => item.status !== "Synced").length} change="Review" context="HL7/FHIR" tone="critical" icon={FileCheck2} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <RecordGrid title="Connector health" records={mockIntegrations} />
        <ModuleLinks links={[["API management", "/integrations/api"], ["Webhook queue", "/integrations/webhooks"], ["HL7", "/integrations/hl7"], ["FHIR", "/integrations/fhir"], ["ABHA", "/integrations/abha"], ["Integration logs", "/integrations/logs"]]} />
      </div>
    </Phase12Shell>
  );
}

export function SecurityDashboardPage() {
  return (
    <Phase12Shell module="security" title="Security & Compliance" description="Security posture, audit risk, access review, sessions, devices, IPs, backup, DR, consent, encryption, and compliance readiness." icon={ShieldCheck}>
      <SummaryGrid>
        <StatCard label="Risk events" value={mockSecurityEvents.filter((item) => item.status === "Risk flagged" || item.status === "Blocked").length + mockIpRules.filter((item) => item.status === "Blocked").length + mockEncryptionCoverage.filter((item) => item.status === "Risk flagged").length} change="Review" context="Audit" tone="critical" icon={ShieldCheck} />
        <StatCard label="Suspicious sessions" value={mockSessions.filter((item) => item.status !== "Normal").length} change="Action" context="Sessions" tone="danger" icon={MonitorSmartphone} />
        <StatCard label="Backup issues" value={mockBackups.filter((item) => item.status !== "Completed").length + mockDisasterRecovery.filter((item) => item.status !== "Drill completed").length} change="Restore" context="DR" tone="warning" icon={RefreshCcw} />
        <StatCard label="Consent restricted" value={mockConsents.filter((item) => item.status !== "Active").length} change="Privacy" context="Patients" tone="critical" icon={LockKeyhole} />
        <StatCard label="Compliance gaps" value={mockCompliance.filter((item) => item.status !== "Resolved").length} change="Owner" context="Checklist" tone="warning" icon={FileCheck2} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-2"><RecordGrid title="Security risks" records={mockSecurityEvents} /><RecordGrid title="Compliance gaps" records={mockCompliance} /></div>
    </Phase12Shell>
  );
}

export function MobileDashboardPage() {
  return (
    <Phase12Shell module="mobile" title="Mobile" description="Mobile role views, phone-first previews, offline/sync placeholders, push permissions, restricted actions, and mobile navigation summary." icon={Smartphone}>
      <SummaryGrid>
        <StatCard label="Role views" value={mockMobileViews.length} change="Preview" context="Mobile" tone="info" icon={Smartphone} />
        <StatCard label="Restricted actions" value={mockMobileViews.reduce((sum, item) => sum + Number(item.restrictedActions), 0)} change="Role" context="Permissions" tone="warning" icon={LockKeyhole} />
        <StatCard label="Push blocked" value={mockMobileViews.filter((item) => item.pushPermission === "Blocked").length} change="Permission" context="Device" tone="danger" icon={RadioTower} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <MobilePreview records={mockMobileViews} />
        <RecordGrid title="Mobile role permissions" records={mockMobileViews} />
      </div>
    </Phase12Shell>
  );
}

function MobilePreview({ records }: { records: Phase12Record[] }) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[32px] border border-border bg-surface p-3 shadow-soft">
      <div className="rounded-[24px] border border-border bg-surface-muted p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>Plasmit Mobile</span><span>Phase 12</span></div>
        <div className="space-y-3">
          {records.map((record) => (
            <div key={String(record.id)} className="rounded-lg border border-border bg-surface p-3 text-xs">
              <div className="flex items-center justify-between gap-2"><span className="font-semibold">{record.roleView}</span><Phase12Status status={String(record.status)} /></div>
              <div className="mt-2 text-muted-foreground">{record.primaryTasks}</div>
              <div className="mt-2 rounded-md bg-surface-muted p-2">Push: {record.pushPermission} • Offline: {record.offlineState}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MobileRolePage({
  title,
  description,
  roleView,
  records,
}: {
  title: string;
  description: string;
  roleView: string;
  records: Phase12Record[];
}) {
  const previewRecords = mockMobileViews.filter((item) => item.roleView === roleView);
  return (
    <Phase12Shell module="mobile" title={title} description={description} icon={Smartphone}>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <MobilePreview records={previewRecords} />
        <SimpleWorkflowPage module="mobile" records={records} hideShell />
      </div>
    </Phase12Shell>
  );
}

export function RemoteMonitoringPage() {
  return (
    <Phase12Shell module="remote" title="Remote Monitoring" description="Monitored patients, vitals feed placeholders, device/feed status, stale data warnings, threshold alerts, escalation, and print summary." icon={RadioTower}>
      <SimpleWorkflowPage module="remote" records={mockRemoteMonitoring} hideShell />
    </Phase12Shell>
  );
}

export function SmartHealthcareDashboardPage() {
  return (
    <Phase12Shell module="smart" title="AI & Smart Healthcare" description="AI suggestions pending review, accepted/rejected states, overrides, predictions, smart alerts, CDS pending, model version, and data freshness placeholders." icon={Bot}>
      <SummaryGrid>
        <StatCard label="Needs review" value={mockAiItems.filter((item) => item.status === "Needs review" || item.status === "Suggested").length} change="Doctor" context="Approval" tone="warning" icon={Bot} />
        <StatCard label="Escalated" value={mockAiItems.filter((item) => item.status === "Escalated").length} change="Smart alert" context="Critical" tone="critical" icon={AlertTriangle} />
        <StatCard label="Overrides" value={mockAiItems.filter((item) => item.status === "Overridden").length} change="Reason" context="CDS" tone="info" icon={FileCheck2} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <RecordGrid title="AI review queue" records={mockAiItems} />
        <ModuleLinks links={[["Clinical assistant", "/smart-healthcare/clinical-assistant"], ["Voice prescription", "/smart-healthcare/voice-prescription"], ["Radiology AI", "/smart-healthcare/radiology-ai"], ["Predictive analytics", "/smart-healthcare/predictive-analytics"], ["Smart alerts", "/smart-healthcare/smart-alerts"], ["CDS", "/smart-healthcare/clinical-decision-support"]]} />
      </div>
    </Phase12Shell>
  );
}

export function FinalQaDashboardPage() {
  return (
    <Phase12Shell module="qa" title="Final QA" description="Theme, responsive, accessibility, performance, cross-browser, print/export, route, role, blocker, waiver, and release sign-off readiness." icon={CheckCircle2}>
      <SummaryGrid>
        <StatCard label="Passed" value={mockQaChecks.filter((item) => item.status === "Passed").length} change="Checks" context="QA" tone="success" icon={CheckCircle2} />
        <StatCard label="In progress" value={mockQaChecks.filter((item) => item.status === "In progress").length} change="Owner" context="QA" tone="warning" icon={Activity} />
        <StatCard label="Blocked" value={mockQaChecks.filter((item) => item.status === "Blocked").length} change="Release" context="Gate" tone="critical" icon={AlertTriangle} />
      </SummaryGrid>
      <RecordGrid title="Release readiness matrix" records={mockQaChecks} />
    </Phase12Shell>
  );
}

export function SimpleWorkflowPage({
  module,
  title,
  description,
  records,
  icon,
  hideShell,
}: {
  module: Phase12Module;
  title?: string;
  description?: string;
  records: Phase12Record[];
  icon?: typeof Workflow;
  hideShell?: boolean;
}) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<Phase12Record | null>(null);
  const statusOptions = React.useMemo(() => ["All status", ...Array.from(new Set(records.map((record) => String(record.status ?? "")).filter(Boolean)))], [records]);
  const filtered = records.filter((record) => {
    const text = Object.values(record).flat().join(" ");
    return includes(text, search) && (status === "All status" || record.status === status);
  });
  const content = (
    <>
      <FilterBar search={search} onSearch={setSearch} placeholder={`Search ${title?.toLowerCase() ?? "records"}, owner, source, target, patient, status...`}>
        <NativeSelect label="Status" value={status} onChange={setStatus} options={statusOptions} />
      </FilterBar>
      <SimpleTable records={filtered} onOpen={setSelected} />
      <StickyActionBar saveLabel={module === "smart" ? "Approve review placeholder" : module === "qa" ? "Sign off placeholder" : module === "security" ? "Mark reviewed" : "Save placeholder"} />
      <DetailDrawer module={module} record={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
  if (hideShell) return content;
  return <Phase12Shell module={module} title={title ?? "Phase 12"} description={description ?? "Static Phase 12 workflow."} icon={icon}>{content}</Phase12Shell>;
}

export {
  mockAbhaSync,
  mockAccessReviews,
  mockAiItems,
  mockApiApps,
  mockAuthPolicies,
  mockBackups,
  mockCompliance,
  mockConsents,
  mockDevices,
  mockDisasterRecovery,
  mockEncryptionCoverage,
  mockIntegrations,
  mockInteropMappings,
  mockIpRules,
  mockMessageProviderSync,
  mockMobileViews,
  mockPaymentGatewaySync,
  mockQaChecks,
  mockQaCrossBrowser,
  mockRemoteMonitoring,
  mockRetentionIncidents,
  mockSecurityEvents,
  mockSessions,
  mockWebhookEvents,
};
