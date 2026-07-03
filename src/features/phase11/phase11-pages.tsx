"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileBarChart,
  FileText,
  LockKeyhole,
  MessageSquareText,
  Printer,
  RefreshCcw,
  Search,
  ShieldAlert,
  Users,
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
  mockAlertRules,
  mockAttendance,
  mockCommunicationLogs,
  mockCommunicationTemplates,
  mockComplaints,
  mockEmployees,
  mockFeedback,
  mockLeaves,
  mockPayroll,
  mockReportBuilderFields,
  mockReports,
  mockScheduledReports,
  mockShifts,
  mockStaffDocuments,
  mockSupportTasks,
  mockTraining,
  mockVisitors,
  type Phase11Record,
} from "@/data/phase11";
import type { Role, StatusTone } from "@/types";

type Phase11Module = "hrms" | "administration" | "communication" | "reports";

const moduleMeta: Record<Phase11Module, { eyebrow: string; label: string; icon: typeof Users; allowed: Role[]; fullAccess: Role[]; warning: string }> = {
  hrms: {
    eyebrow: "Phase 11 • HRMS",
    label: "HRMS",
    icon: Users,
    allowed: ["Super Admin", "Hospital Admin", "HR Manager", "Doctor", "Nurse", "Management"],
    fullAccess: ["Super Admin", "HR Manager"],
    warning: "Employee status, attendance correction, shift publication, leave approval, payroll, appraisal, and credential verification actions require reason, permission, and audit placeholders.",
  },
  administration: {
    eyebrow: "Phase 11 • Administration",
    label: "Administration",
    icon: Building2,
    allowed: ["Super Admin", "Hospital Admin", "Receptionist", "HR Manager", "Management"],
    fullAccess: ["Super Admin", "Hospital Admin"],
    warning: "Visitor passes, service reassignment, support task closure, complaint resolution, security incidents, and feedback escalation preserve owner, due date, and audit placeholders.",
  },
  communication: {
    eyebrow: "Phase 11 • Communication",
    label: "Communication",
    icon: MessageSquareText,
    allowed: ["Super Admin", "Hospital Admin", "HR Manager", "Receptionist", "Management"],
    fullAccess: ["Super Admin", "Hospital Admin"],
    warning: "SMS, email, WhatsApp, push, retry, alert activation, and emergency broadcast actions are static placeholders and must respect consent, quiet-hour, opt-out, severity, and acknowledgement states.",
  },
  reports: {
    eyebrow: "Phase 11 • Reports",
    label: "Reports",
    icon: FileBarChart,
    allowed: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Billing Executive", "HR Manager", "Management"],
    fullAccess: ["Super Admin", "Hospital Admin", "Management"],
    warning: "Reports use static data. Exports, schedules, restricted fields, clinical privacy, payroll visibility, and audit-sensitive access require role validation placeholders.",
  },
};

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function titleize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function phase11Tone(status: string): StatusTone {
  if (["Active", "Present", "Published", "Approved", "Completed", "Resolved", "Ready", "Delivered placeholder", "Printed", "Payslip generated placeholder"].includes(status)) return "success";
  if (["Probation", "Requested", "Assigned", "In progress", "Queued", "Scheduled", "Review pending", "Correction requested", "Interview scheduled", "Screening", "Draft", "Export pending", "Due"].includes(status)) return "warning";
  if (["Failed", "Cancelled", "Absent", "Rejected", "Balance insufficient", "Inactive", "Export failed placeholder", "Blocklisted placeholder"].includes(status)) return "danger";
  if (["Delayed", "Short staffed", "Overstay", "Incident reported", "Escalated", "Triggered", "Critical", "Restricted", "Renewal required", "Expiring"].includes(status)) return "critical";
  if (["On leave", "Swap requested", "Offered", "Processing placeholder", "Retrying", "Delivered placeholder", "Verification pending"].includes(status)) return "info";
  return "muted";
}

function Phase11Status({ status }: { status: string }) {
  return <StatusPill tone={phase11Tone(status)}>{status}</StatusPill>;
}

function ProtectedPhase11({
  module,
  children,
}: {
  module: Phase11Module;
  children: (state: { role: Role; readOnly: boolean }) => React.ReactNode;
}) {
  const { role } = useRole();
  const meta = moduleMeta[module];
  const allowed = meta.allowed.includes(role);
  const readOnly = !meta.fullAccess.includes(role);

  if (!allowed) {
    return <EmptyState icon={LockKeyhole} title={`${meta.label} permission required`} description={`Your current static role cannot access Phase 11 ${meta.label.toLowerCase()} workflows.`} />;
  }

  return (
    <div className="space-y-4">
      {readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title={`Read-only ${meta.label} access`}>
          {role} can review Phase 11 operational status in this static preview, but approval, broadcast, export, payroll, visitor, and report-sharing actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role, readOnly })}
    </div>
  );
}

function Phase11Shell({
  module,
  title,
  description,
  icon,
  children,
  actions,
}: {
  module: Phase11Module;
  title: string;
  description: string;
  icon?: typeof Users;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const meta = moduleMeta[module];
  const Icon = icon ?? meta.icon;
  return (
    <ProtectedPhase11 module={module}>
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
                  <Button variant="outline" onClick={() => toast.info("Static Phase 11 data refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
                  <Button><Icon className="h-4 w-4" />Open workflow</Button>
                </>
              )
            }
          />
          <AlertBanner icon={ShieldAlert} tone="warning" title={`${meta.label} governance`}>
            {meta.warning}
          </AlertBanner>
          {children}
        </>
      )}
    </ProtectedPhase11>
  );
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">{children}</div>;
}

function valueForCell(key: string, value: Phase11Record[string]) {
  if (typeof value === "number" && /amount|gross|revenue|collection|salary|payroll|rating/i.test(key)) return /rating/i.test(key) ? String(value) : money(value);
  if (typeof value === "string" && /Active|Present|Published|Approved|Completed|Resolved|Ready|Delivered|Printed|Probation|Requested|Assigned|progress|Queued|Scheduled|pending|Correction|Interview|Screening|Draft|Export|Due|Failed|Cancelled|Absent|Rejected|Balance|Inactive|Blocklisted|Delayed|Short|Overstay|Incident|Escalated|Triggered|Critical|Restricted|Renewal|Expiring|leave|Swap|Offered|Retrying|Verification/i.test(value)) return <Phase11Status status={value} />;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value ?? "NA");
}

function SimpleTable({ records, onOpen }: { records: Phase11Record[]; onOpen?: (record: Phase11Record) => void }) {
  const columns = React.useMemo<ColumnDef<Phase11Record>[]>(() => {
    const keys = Object.keys(records[0] ?? {}).filter((key) => key !== "id").slice(0, 8);
    const baseColumns = keys.map((key) => ({
      header: titleize(key),
      cell: ({ row }: { row: { original: Phase11Record } }) => valueForCell(key, row.original[key]),
    }));
    if (!onOpen) return baseColumns;
    return [
      ...baseColumns,
      { header: "Actions", cell: ({ row }: { row: { original: Phase11Record } }) => <Button size="sm" variant="outline" onClick={() => onOpen(row.original)}>Detail</Button> },
    ];
  }, [records, onOpen]);
  return <DataTable data={records} columns={columns} />;
}

function RecordGrid({ title, records }: { title: string; records: Phase11Record[] }) {
  if (!records.length) return <EmptyState icon={Search} title={`No ${title.toLowerCase()}`} description="No static records match this Phase 11 workflow state." />;
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

function ContextHeader({ module, title, subtitle, status }: { module: Phase11Module; title: string; subtitle: string; status: string }) {
  const Icon = moduleMeta[module].icon;
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
              <Badge tone="muted">{moduleMeta[module].label}</Badge>
              <Phase11Status status={status} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <Button size="sm" variant="outline" asChild><Link href="/admin/audit-logs">Audit handoff</Link></Button>
      </CardContent>
    </Card>
  );
}

function DetailDrawer({ module, record, open, onOpenChange }: { module: Phase11Module; record: Phase11Record | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const title = record ? String(record.name ?? record.staff ?? record.taskNo ?? record.logNo ?? record.report ?? record.id) : "Detail";
  const status = record ? String(record.status ?? record.stage ?? record.risk ?? "Ready") : "Ready";
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Phase 11 detail" description={title} className="md:w-[680px]">
      {record ? (
        <div className="space-y-4">
          <ContextHeader module={module} title={title} subtitle="Static operational detail, approval state, print/export placeholder, and audit trail handoff." status={status} />
          <AlertBanner icon={AlertTriangle} tone="warning" title="Action control">
            High-impact actions require reason, role permission, confirmation, and audit placeholders before production integration.
          </AlertBanner>
          <RecordGrid title="Detail fields" records={[record]} />
          <Card>
            <CardContent className="space-y-3 bg-white p-4 text-slate-900">
              <div className="text-sm font-semibold">Print-safe preview</div>
              <DetailRow label="Record" value={title} />
              <DetailRow label="Status" value={status} />
              <DetailRow label="Generated" value="Static Phase 11 preview" />
              <div className="rounded-md border p-3 text-xs">Navigation and internal controls are hidden in real print/export flows.</div>
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

export function HrmsDashboardPage() {
  return (
    <Phase11Shell module="hrms" title="HRMS" description="Staff operations dashboard for attendance, leave, shifts, payroll placeholders, recruitment, training, and document alerts." icon={Users} actions={<><Button variant="outline" asChild><Link href="/hrms/employees">Add employee</Link></Button><Button variant="outline" asChild><Link href="/hrms/attendance">Open attendance</Link></Button><Button asChild><Link href="/hrms/leaves">Review leave</Link></Button></>}>
      <SummaryGrid>
        <StatCard label="Active employees" value={mockEmployees.filter((item) => item.status === "Active").length} change="Roster" context="Staff" tone="success" icon={Users} />
        <StatCard label="Present today" value={mockAttendance.filter((item) => item.status === "Present").length} change="Live" context="Attendance" tone="success" icon={CalendarDays} />
        <StatCard label="Absent/late" value={mockAttendance.filter((item) => ["Absent", "Late"].includes(String(item.status))).length} change="Exception" context="Corrections" tone="warning" icon={AlertTriangle} />
        <StatCard label="Leave pending" value={mockLeaves.filter((item) => item.status === "Requested" || item.status === "Balance insufficient").length} change="Approve" context="Queue" tone="warning" icon={FileText} />
        <StatCard label="Shift gaps" value={mockShifts.reduce((sum, item) => sum + Number(item.gap), 0)} change="Publish" context="Roster" tone="critical" icon={CalendarDays} />
        <StatCard label="Payroll review" value={mockPayroll.filter((item) => item.status === "Review pending").length} change="Restricted" context="Payroll" tone="danger" icon={BriefcaseBusiness} />
        <StatCard label="Documents expiring" value={mockStaffDocuments.filter((item) => String(item.status).includes("Expiring") || String(item.status).includes("Renewal")).length} change="Verify" context="Credentials" tone="critical" icon={FileText} />
        <StatCard label="Training due" value={mockTraining.filter((item) => item.status !== "Completed").length} change="Due" context="Completion" tone="info" icon={Users} />
      </SummaryGrid>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <RecordGrid title="Attendance and document exceptions" records={[...mockAttendance.filter((item) => item.status !== "Present"), ...mockStaffDocuments]} />
        <ModuleLinks links={[["Employee list", "/hrms/employees"], ["Publish shift roster", "/hrms/shifts"], ["Payroll review", "/hrms/payroll"], ["Staff documents", "/hrms/documents"], ["Training due", "/hrms/training"]]} />
      </div>
    </Phase11Shell>
  );
}

export function AdministrationDashboardPage() {
  return (
    <Phase11Shell module="administration" title="Administration" description="Non-clinical operations dashboard for front office, housekeeping, laundry, cafeteria, visitors, security, complaints, and feedback." icon={Building2}>
      <SummaryGrid>
        <StatCard label="Support tasks" value={mockSupportTasks.length} change="Open" context="Admin" tone="info" icon={Building2} />
        <StatCard label="Delayed tasks" value={mockSupportTasks.filter((item) => item.status === "Delayed").length} change="SLA" context="Escalate" tone="critical" icon={AlertTriangle} />
        <StatCard label="Visitors inside" value={mockVisitors.filter((item) => item.status === "Checked in" || item.status === "Overstay").length} change="Live" context="Security" tone="warning" icon={Users} />
        <StatCard label="Complaints" value={mockComplaints.filter((item) => item.status !== "Completed").length} change="Owner" context="Quality" tone="danger" icon={BellRing} />
        <StatCard label="Low feedback" value={mockFeedback.filter((item) => Number(item.rating) < 3).length} change="Escalate" context="Service" tone="warning" icon={MessageSquareText} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <RecordGrid title="Support operation queue" records={mockSupportTasks} />
        <ModuleLinks links={[["Front office", "/administration/front-office"], ["Reception", "/administration/reception"], ["Housekeeping", "/administration/housekeeping"], ["Register visitor", "/administration/visitors"], ["Security desk", "/administration/security-desk"], ["Feedback queue", "/administration/feedback"]]} />
      </div>
    </Phase11Shell>
  );
}

export function CommunicationDashboardPage() {
  return (
    <Phase11Shell module="communication" title="Communication" description="Message volume, failed deliveries, templates, consent blocks, alert rules, and emergency broadcast state." icon={MessageSquareText}>
      <SummaryGrid>
        <StatCard label="Sent today" value={mockCommunicationLogs.filter((item) => item.status === "Delivered placeholder").length} change="Provider" context="Placeholder" tone="success" icon={MessageSquareText} />
        <StatCard label="Failed" value={mockCommunicationLogs.filter((item) => item.status === "Failed").length} change="Retry" context="Delivery" tone="danger" icon={AlertTriangle} />
        <StatCard label="Queued/retrying" value={mockCommunicationLogs.filter((item) => ["Queued", "Retrying"].includes(String(item.status))).length} change="Pending" context="Channels" tone="warning" icon={BellRing} />
        <StatCard label="Templates" value={mockCommunicationTemplates.length} change="Active" context="Channels" tone="info" icon={FileText} />
        <StatCard label="Alerts" value={mockAlertRules.filter((item) => item.status === "Triggered" || item.status === "Escalated").length} change="Active" context="Rules" tone="critical" icon={ShieldAlert} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-2"><RecordGrid title="Communication log" records={mockCommunicationLogs} /><RecordGrid title="Alert rules" records={mockAlertRules} /></div>
    </Phase11Shell>
  );
}

export function ReportsDashboardPage() {
  return (
    <Phase11Shell module="reports" title="Reports & Analytics" description="MIS, financial, clinical, operational, doctor performance, revenue, occupancy, audit, custom report, scheduled report, and dashboard analytics placeholders." icon={FileBarChart}>
      <SummaryGrid>
        <StatCard label="Reports ready" value={mockReports.filter((item) => item.status === "Ready").length} change="View" context="Static" tone="success" icon={FileBarChart} />
        <StatCard label="Restricted" value={mockReports.filter((item) => item.status === "Restricted").length} change="Role" context="Privacy" tone="critical" icon={LockKeyhole} />
        <StatCard label="Export pending" value={mockReports.filter((item) => item.status === "Export pending").length} change="Export" context="Placeholder" tone="warning" icon={Printer} />
        <StatCard label="Schedules failed" value={mockScheduledReports.filter((item) => item.status === "Export failed placeholder").length} change="Retry" context="Scheduler" tone="danger" icon={BellRing} />
        <StatCard label="Custom fields" value={mockReportBuilderFields.length} change="Builder" context="Fields" tone="info" icon={FileText} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <RecordGrid title="Report access queue" records={mockReports} />
        <ModuleLinks links={[["MIS reports", "/reports/mis"], ["Financial reports", "/reports/financial"], ["Clinical reports", "/reports/clinical"], ["Doctor performance", "/reports/doctor-performance"], ["Audit reports", "/reports/audit"], ["Custom builder", "/reports/custom-builder"]]} />
      </div>
    </Phase11Shell>
  );
}

export function Phase11SimplePage({
  module,
  title,
  description,
  records,
  icon,
}: {
  module: Phase11Module;
  title: string;
  description: string;
  records: Phase11Record[];
  icon?: typeof Users;
}) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<Phase11Record | null>(null);
  const statusOptions = React.useMemo(() => ["All status", ...Array.from(new Set(records.map((record) => String(record.status ?? "")).filter(Boolean)))], [records]);
  const filtered = records.filter((record) => {
    const text = Object.values(record).flat().join(" ");
    return includes(text, search) && (status === "All status" || record.status === status);
  });

  return (
    <Phase11Shell module={module} title={title} description={description} icon={icon}>
      <FilterBar search={search} onSearch={setSearch} placeholder={`Search ${title.toLowerCase()}, owner, department, source, status...`}>
        <NativeSelect label="Status" value={status} onChange={setStatus} options={statusOptions} />
      </FilterBar>
      <SimpleTable records={filtered} onOpen={setSelected} />
      <StickyActionBar saveLabel={module === "reports" ? "Export placeholder" : module === "communication" ? "Send placeholder" : "Save placeholder"} />
      <DetailDrawer module={module} record={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </Phase11Shell>
  );
}

export function CustomReportBuilderPage() {
  return (
    <Phase11Shell module="reports" title="Custom Report Builder" description="Field picker, filters, grouping, sorting, preview, restricted fields, save/share, schedule, and export placeholders." icon={FileBarChart}>
      <AlertBanner icon={LockKeyhole} tone="critical" title="Restricted fields">
        Patient contact fields, payroll placeholders, and sensitive clinical fields are masked until role access and export reason placeholders are approved.
      </AlertBanner>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="font-semibold">Builder controls</div>
            {["Data source: Billing + Patient + HRMS", "Fields: 3 selected", "Filters: Date range, department, status", "Grouping: Department", "Sorting: Revenue descending", "Export: Backend pending"].map((item) => (
              <div key={item} className="rounded-md border border-border bg-surface-muted p-2 text-xs">{item}</div>
            ))}
          </CardContent>
        </Card>
        <SimpleTable records={mockReportBuilderFields} />
      </div>
      <StickyActionBar saveLabel="Save report placeholder" />
    </Phase11Shell>
  );
}

export function DashboardAnalyticsPage() {
  return (
    <Phase11Shell module="reports" title="Dashboard Analytics" description="Role-wise widgets, saved view placeholder, executive summaries, print/export placeholder, and restricted widget states." icon={BarChart3}>
      <div className="grid gap-4 xl:grid-cols-3">
        <RecordGrid title="Executive widgets" records={mockReports} />
        <RecordGrid title="Communication widgets" records={mockCommunicationLogs} />
        <RecordGrid title="Support widgets" records={mockSupportTasks} />
      </div>
    </Phase11Shell>
  );
}
