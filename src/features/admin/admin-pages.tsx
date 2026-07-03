"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Lock,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockAuditLogs,
  mockBranches,
  mockDepartments,
  mockDevices,
  mockHospitalProfile,
  mockIpRules,
  mockMfaPolicy,
  mockPasswordPolicy,
  mockPermissions,
  mockRoles,
  mockSecuritySessions,
  mockUsers,
} from "@/data/admin";
import {
  AdminSection,
  ConfirmDrawer,
  DetailRow,
  DisabledFutureAction,
  DisabledReason,
  FilterBar,
  NativeSelect,
  ProtectedAdmin,
  RiskBadge,
  SecurityNote,
  StatusBadge,
  StickyActionBar,
  adminFullAccessRoles,
  adminReadOnlyRoles,
} from "@/features/admin/admin-shared";
import type { AdminRoleRecord, AuditLog, BranchRecord, DepartmentRecord, PermissionRecord, Role, SecuritySession, TrustedDevice, UserRecord } from "@/types";

function textMatch(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function pageToast(label: string) {
  toast.info(`${label} is reserved for backend integration`);
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function DrawerTabs({ children, defaultValue = "overview" }: { children: React.ReactNode; defaultValue?: string }) {
  return <Tabs defaultValue={defaultValue}>{children}</Tabs>;
}

export function RolesPage() {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("All types");
  const [selected, setSelected] = React.useState<AdminRoleRecord | null>(null);
  const [confirm, setConfirm] = React.useState<AdminRoleRecord | null>(null);
  const filtered = mockRoles.filter((role) => textMatch(`${role.name} ${role.description} ${role.departmentScope}`, search) && (type === "All types" || role.type === type));

  const columns = React.useMemo<ColumnDef<AdminRoleRecord>[]>(() => [
    { header: "Role", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.description}</div></div> },
    { header: "Type", accessorKey: "type" },
    { header: "Users", accessorKey: "userCount" },
    { header: "Modules", accessorKey: "modulesAllowed" },
    { header: "Risk", cell: ({ row }) => <RiskBadge risk={row.original.risk} /> },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="h-3.5 w-3.5" />View</Button>
        <DisabledReason disabled={row.original.protected}><Button size="sm" variant="ghost" disabled={row.original.protected} onClick={() => setConfirm(row.original)}>Deactivate</Button></DisabledReason>
      </div>
    ) },
  ], []);

  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <PageHeader
            eyebrow="Phase 2 • RBAC"
            title="Roles & Permissions"
            description="Create, duplicate, and govern protected system and custom hospital roles."
            actions={<><Button variant="outline" onClick={() => pageToast("Role export")}><Download className="h-4 w-4" />Export</Button><Button variant="outline" onClick={() => pageToast("Permission matrix")}><SlidersHorizontal className="h-4 w-4" />Matrix</Button><Button disabled={readOnly}><Plus className="h-4 w-4" />Create role</Button></>}
          />
          <SummaryGrid>
            <StatCard label="Total roles" value={mockRoles.length} icon={ShieldCheck} change="Configured" context="Static RBAC set" tone="info" />
            <StatCard label="Active roles" value={mockRoles.filter((role) => role.status === "Active").length} icon={Check} change="Current" context="Available roles" tone="success" />
            <StatCard label="System roles" value={mockRoles.filter((role) => role.type === "System").length} icon={Lock} change="Protected" context="Destructive edits locked" tone="warning" />
            <StatCard label="Custom roles" value={mockRoles.filter((role) => role.type === "Custom").length} icon={Copy} change="Editable" context="Can duplicate/edit" tone="info" />
          </SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search role, scope, description...">
            <NativeSelect label="Role type" value={type} onChange={setType} options={["All types", "System", "Custom"]} />
            <Button variant="outline" onClick={() => toast.success("Static role data refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
          </FilterBar>
          <DataTable data={filtered} columns={columns} />
          <RoleDrawer role={selected} onOpenChange={(open) => !open && setSelected(null)} />
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Deactivate role" target={confirm?.name ?? ""} action="Deactivate" />
        </>
      )}
    </ProtectedAdmin>
  );
}

function RoleDrawer({ role, onOpenChange }: { role: AdminRoleRecord | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={Boolean(role)} onOpenChange={onOpenChange} title={role?.name ?? "Role"} description="Role details, permissions, assigned users, and audit summary.">
      {role ? (
        <DrawerTabs>
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="permissions">Permissions</TabsTrigger><TabsTrigger value="users">Users</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList>
          <TabsContent value="overview">
            <DetailRow label="Type" value={role.type} />
            <DetailRow label="Scope" value={role.departmentScope} />
            <DetailRow label="Status" value={<StatusBadge status={role.status} />} />
            <DetailRow label="Protected" value={role.protected ? "System protected role" : "Editable custom role"} />
            <DetailRow label="Risk" value={<RiskBadge risk={role.risk} />} />
          </TabsContent>
          <TabsContent value="permissions" className="space-y-2">
            {mockPermissions.slice(0, 6).map((permission) => <PermissionLine key={permission.id} permission={permission} />)}
          </TabsContent>
          <TabsContent value="users" className="space-y-2">
            {mockUsers.filter((user) => user.roleIds.includes(role.id)).map((user) => <MiniRecord key={user.id} title={user.name} meta={`${user.designation} • ${user.status}`} />)}
          </TabsContent>
          <TabsContent value="audit">
            <DetailRow label="Updated" value={role.updatedAt} />
            <DetailRow label="Changed by" value="Hospital Admin" />
            <DetailRow label="Last change" value="Permission risk summary reviewed" />
          </TabsContent>
        </DrawerTabs>
      ) : null}
    </Drawer>
  );
}

function PermissionLine({ permission }: { permission: PermissionRecord }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{permission.page} • {permission.action}</div>
        {permission.sensitive ? <Badge tone="critical">Sensitive</Badge> : <Badge tone="muted">Standard</Badge>}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{permission.description}</div>
    </div>
  );
}

function MiniRecord({ title, meta }: { title: string; meta: string }) {
  return <div className="rounded-md border border-border p-3"><div className="text-sm font-medium">{title}</div><div className="text-xs text-muted-foreground">{meta}</div></div>;
}

export function PermissionsPage() {
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState<Role>("Hospital Admin");
  const [module, setModule] = React.useState("All modules");
  const filtered = mockPermissions.filter((permission) => textMatch(`${permission.module} ${permission.page} ${permission.action}`, search) && (module === "All modules" || permission.module === module));
  const modules = ["All modules", ...Array.from(new Set(mockPermissions.map((permission) => permission.module)))];

  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <PageHeader
            eyebrow="Phase 2 • Permission Matrix"
            title="Permission Matrix"
            description="Role, module, page, tab, action, and sensitive access configuration with dependency states."
            actions={<><NativeSelect label="Role selector" value={role} onChange={(value) => setRole(value as Role)} options={mockRoles.map((item) => item.name)} /><Button variant="outline" onClick={() => pageToast("Expand all")}><SlidersHorizontal className="h-4 w-4" />Expand</Button></>}
          />
          <FilterBar search={search} onSearch={setSearch} placeholder="Search permission, page, module...">
            <NativeSelect label="Module group" value={module} onChange={setModule} options={modules} />
          </FilterBar>
          <Tabs defaultValue="module" className="space-y-4">
            <TabsList><TabsTrigger value="module">Module access</TabsTrigger><TabsTrigger value="page">Page access</TabsTrigger><TabsTrigger value="tab">Tab access</TabsTrigger><TabsTrigger value="action">Action access</TabsTrigger><TabsTrigger value="sensitive">Sensitive access</TabsTrigger></TabsList>
            {["module", "page", "tab", "action", "sensitive"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <PermissionMatrix permissions={filtered} dependency={tab} readOnly={readOnly} />
              </TabsContent>
            ))}
          </Tabs>
          <StickyActionBar readOnly={readOnly} saveLabel="Save permission changes" />
        </>
      )}
    </ProtectedAdmin>
  );
}

function PermissionMatrix({ permissions, dependency, readOnly }: { permissions: PermissionRecord[]; dependency: string; readOnly?: boolean }) {
  const scoped = dependency === "sensitive" ? permissions.filter((permission) => permission.sensitive) : permissions;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 bg-surface-muted text-xs uppercase text-muted-foreground">
            <tr>{["Permission", "View", "Create", "Edit", "Delete", "Approve", "Export", "Status"].map((heading) => <th key={heading} className="border-b border-border px-3 py-2">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {scoped.map((permission) => (
              <tr key={permission.id} className="border-b border-border last:border-0">
                <td className="sticky left-0 bg-surface px-3 py-3">
                  <div className="font-medium">{permission.page}</div>
                  <div className="text-xs text-muted-foreground">{permission.module} • {permission.description}</div>
                </td>
                {["View", "Create", "Edit", "Delete", "Approve", "Export"].map((action) => (
                  <td key={action} className="px-3 py-2">
                    <input className="h-4 w-4 accent-primary disabled:opacity-40" type="checkbox" defaultChecked={permission.enabled && (action === "View" || permission.action === action)} disabled={readOnly || (!permission.enabled && action !== "View")} aria-label={`${permission.page} ${action}`} />
                  </td>
                ))}
                <td className="px-3 py-2">{permission.sensitive ? <Badge tone="critical">Sensitive</Badge> : <Badge tone="success">Enabled</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UsersPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<UserRecord | null>(null);
  const [confirm, setConfirm] = React.useState<UserRecord | null>(null);
  const filtered = mockUsers.filter((user) => textMatch(`${user.name} ${user.email} ${user.employeeCode} ${user.designation}`, search) && (status === "All status" || user.status === status));
  const roleById = Object.fromEntries(mockRoles.map((role) => [role.id, role.name]));
  const deptById = Object.fromEntries(mockDepartments.map((dept) => [dept.id, dept.name]));
  const columns = React.useMemo<ColumnDef<UserRecord>[]>(() => [
    { header: "User", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.email}</div></div> },
    { header: "Code", accessorKey: "employeeCode" },
    { header: "Role", cell: ({ row }) => row.original.roleIds.map((id) => roleById[id]).join(", ") },
    { header: "Department", cell: ({ row }) => row.original.departmentIds.map((id) => deptById[id]).join(", ") },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Last login", accessorKey: "lastLoginAt" },
    { header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(row.original)}>{row.original.locked ? "Unlock" : "Lock"}</Button></div> },
  ], [deptById, roleById]);

  return (
    <ProtectedAdmin allowed={adminFullAccessRoles} readOnly={["HR Manager", "Management"]}>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 2 • IAM" title="User Management" description="Manage staff accounts, access mapping, security status, and activity preview." actions={<><Button variant="outline" onClick={() => pageToast("User import")}><Download className="h-4 w-4" />Import</Button><Button variant="outline" onClick={() => pageToast("Invite user")}>Invite</Button><Button disabled={readOnly}><Plus className="h-4 w-4" />Add user</Button></>} />
          <SummaryGrid>
            <StatCard label="Total users" value={mockUsers.length} icon={Users} change="Seeded" context="Static staff records" tone="info" />
            <StatCard label="Active users" value={mockUsers.filter((user) => user.status === "Active").length} icon={Check} change="Enabled" context="Can sign in" tone="success" />
            <StatCard label="Locked users" value={mockUsers.filter((user) => user.locked).length} icon={Lock} change="Review" context="Security action needed" tone="danger" />
            <StatCard label="Online sessions" value={mockSecuritySessions.filter((session) => session.status === "Active").length} icon={ShieldCheck} change="Live" context="Session preview" tone="warning" />
          </SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search user, code, email, designation..."><NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Active", "Locked", "Invited", "Inactive"]} /></FilterBar>
          <DataTable data={filtered} columns={columns} />
          <UserDrawer user={selected} onOpenChange={(open) => !open && setSelected(null)} roleById={roleById} deptById={deptById} />
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Account security action" target={confirm?.name ?? ""} action={confirm?.locked ? "Unlock" : "Lock"} />
        </>
      )}
    </ProtectedAdmin>
  );
}

function UserDrawer({ user, onOpenChange, roleById, deptById }: { user: UserRecord | null; onOpenChange: (open: boolean) => void; roleById: Record<string, string>; deptById: Record<string, string> }) {
  return (
    <Drawer open={Boolean(user)} onOpenChange={onOpenChange} title={user?.name ?? "User"} description="Profile, access, security, and recent activity.">
      {user ? (
        <DrawerTabs>
          <TabsList><TabsTrigger value="overview">Profile</TabsTrigger><TabsTrigger value="access">Access</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>
          <TabsContent value="overview"><DetailRow label="Code" value={user.employeeCode} /><DetailRow label="Designation" value={user.designation} /><DetailRow label="Mobile" value={user.mobile} /><DetailRow label="Email" value={user.email} /><DetailRow label="Status" value={<StatusBadge status={user.status} />} /></TabsContent>
          <TabsContent value="access"><DetailRow label="Roles" value={user.roleIds.map((id) => roleById[id]).join(", ")} /><DetailRow label="Departments" value={user.departmentIds.map((id) => deptById[id]).join(", ")} /><DetailRow label="Landing" value="/dashboard" /></TabsContent>
          <TabsContent value="security" className="space-y-3"><SecurityNote /><DetailRow label="Failed logins" value={user.failedLogins} /><DetailRow label="Password" value="Never displayed" masked /><Button variant="danger"><Lock className="h-4 w-4" />Force logout</Button></TabsContent>
          <TabsContent value="activity"><DetailRow label="Last login" value={user.lastLoginAt} /><DetailRow label="Recent action" value="Viewed dashboard summary" /><DetailRow label="Failed attempt" value={`${user.failedLogins} recent attempts`} /></TabsContent>
        </DrawerTabs>
      ) : null}
    </Drawer>
  );
}

export function DepartmentsPage() {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<DepartmentRecord | null>(null);
  const filtered = mockDepartments.filter((dept) => textMatch(`${dept.name} ${dept.code} ${dept.type} ${dept.head}`, search));
  const columns = React.useMemo<ColumnDef<DepartmentRecord>[]>(() => [
    { header: "Department", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.code}</div></div> },
    { header: "Type", accessorKey: "type" },
    { header: "Head", accessorKey: "head" },
    { header: "Location", accessorKey: "location" },
    { header: "Users", accessorKey: "users" },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], []);
  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 2 • Master Setup" title="Department Management" description="Operational department master for future OPD, IPD, LIS, billing, and reporting modules." actions={<Button disabled={readOnly}><Plus className="h-4 w-4" />Add department</Button>} />
          <SummaryGrid><StatCard label="Total departments" value={mockDepartments.length} icon={Building2} change="Master" context="Reusable setup" tone="info" /><StatCard label="Clinical" value={mockDepartments.filter((d) => d.type === "Clinical").length} icon={ShieldCheck} change="Ready" context="OPD/IPD mapping" tone="success" /><StatCard label="Support" value={mockDepartments.filter((d) => d.type === "Support" || d.type === "Store").length} icon={Users} change="Ops" context="Support workflows" tone="warning" /><StatCard label="Active" value={mockDepartments.filter((d) => d.status === "Active").length} icon={Check} change="Enabled" context="Available now" tone="success" /></SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search department, code, head..." />
          <DataTable data={filtered} columns={columns} />
          <Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.name ?? "Department"} description="Department settings and workflow readiness.">
            {selected ? <DrawerTabs><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="staff">Staff mapping</TabsTrigger><TabsTrigger value="settings">Operating settings</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList><TabsContent value="overview"><DetailRow label="Code" value={selected.code} /><DetailRow label="Type" value={selected.type} /><DetailRow label="Location" value={selected.location} /><DetailRow label="Status" value={<StatusBadge status={selected.status} />} /></TabsContent><TabsContent value="staff"><DetailRow label="Head" value={selected.head} /><DetailRow label="Users" value={selected.users} /></TabsContent><TabsContent value="settings" className="space-y-2">{selected.enabledWorkflows.map((item) => <Badge key={item} tone="info">{item}</Badge>)}</TabsContent><TabsContent value="audit"><DetailRow label="Updated by" value="Hospital Admin" /><DetailRow label="Last review" value="Today 08:45" /></TabsContent></DrawerTabs> : null}
          </Drawer>
        </>
      )}
    </ProtectedAdmin>
  );
}

export function HospitalSetupPage() {
  return (
    <ProtectedAdmin readOnly={adminReadOnlyRoles}>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 2 • Hospital Master" title="Hospital Master Setup" description="Hospital profile, contact, legal, operations, branding, print settings, and audit summary." actions={<><Button variant="outline" onClick={() => pageToast("Print preview")}><Printer className="h-4 w-4" />Print</Button><Button disabled={readOnly}><Save className="h-4 w-4" />Save setup</Button></>} />
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="contact">Contact</TabsTrigger><TabsTrigger value="legal">Legal</TabsTrigger><TabsTrigger value="operations">Operations</TabsTrigger><TabsTrigger value="branding">Branding</TabsTrigger><TabsTrigger value="print">Print</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList>
            <TabsContent value="profile"><SettingsForm fields={[["Hospital name", mockHospitalProfile.name], ["Short name", mockHospitalProfile.shortName], ["Hospital type", mockHospitalProfile.type], ["Established year", mockHospitalProfile.establishedYear]]} /></TabsContent>
            <TabsContent value="contact"><SettingsForm fields={[["Address", mockHospitalProfile.address], ["Phone", mockHospitalProfile.phone], ["Email", mockHospitalProfile.email], ["Website", mockHospitalProfile.website]]} /></TabsContent>
            <TabsContent value="legal"><SettingsForm fields={[["Registration number", mockHospitalProfile.registrationNumber], ["GST number", mockHospitalProfile.gst], ["NABH/NABL", "Prepared placeholder"], ["PAN", "•••••• masked"]]} /></TabsContent>
            <TabsContent value="operations"><SettingsForm fields={[["Working hours", mockHospitalProfile.workingHours], ["Timezone", mockHospitalProfile.timezone], ["Currency", mockHospitalProfile.currency], ["Default appointment duration", "15 minutes"]]} /></TabsContent>
            <TabsContent value="branding"><AdminSection title="Branding values" description="Branding maps into Phase 1 theme tokens without bypassing semantic colors."><SettingsForm fields={[["Logo", "Upload placeholder"], ["Primary preset", "Uses global dynamic theme"], ["Hospital seal", "Future upload placeholder"]]} /></AdminSection></TabsContent>
            <TabsContent value="print"><AdminSection title="Print-safe preview" description="Navigation and actions hide during print. Sensitive fields remain masked."><div className="rounded-lg border border-border bg-white p-4 text-slate-900"><div className="font-semibold">{mockHospitalProfile.name}</div><div className="text-xs">{mockHospitalProfile.address}</div><div className="mt-4 border-t pt-3 text-sm">Prescription / Invoice / Lab report header placeholder</div></div></AdminSection></TabsContent>
            <TabsContent value="audit"><SettingsForm fields={[["Last updated by", "Hospital Admin"], ["Last updated", "Today 09:20"], ["Sensitive changes", "Legal fields masked in audit log"]]} /></TabsContent>
          </Tabs>
          <StickyActionBar readOnly={readOnly} saveLabel="Save hospital setup" />
        </>
      )}
    </ProtectedAdmin>
  );
}

function SettingsForm({ fields }: { fields: [string, string][] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {fields.map(([label, value]) => (
        <label key={label} className="space-y-1 text-sm">
          <span className="font-medium text-foreground">{label}</span>
          <Input defaultValue={value} />
        </label>
      ))}
    </div>
  );
}

export function BranchesPage() {
  const [selected, setSelected] = React.useState<BranchRecord | null>(null);
  const columns = React.useMemo<ColumnDef<BranchRecord>[]>(() => [
    { header: "Branch", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.code}</div></div> },
    { header: "City", accessorKey: "city" },
    { header: "Type", accessorKey: "type" },
    { header: "Departments", accessorKey: "departments" },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], []);
  return (
    <ProtectedAdmin>
      {() => (
        <>
          <PageHeader eyebrow="Phase 2 • Future Ready" title="Branch Management" description="Single-hospital mode today, with branch-ready information architecture reserved for future expansion." actions={<><DisabledFutureAction /><Button disabled><Plus className="h-4 w-4" />Add branch</Button></>} />
          <AdminSection title="Single hospital mode" description="Future branches are visible as disabled records so current users are not confused by unavailable operations."><DataTable data={mockBranches} columns={columns} /></AdminSection>
          <Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.name ?? "Branch"} description="Overview, departments, contacts, and future settings.">
            {selected ? <DrawerTabs><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="departments">Departments</TabsTrigger><TabsTrigger value="contacts">Contacts</TabsTrigger><TabsTrigger value="future">Future settings</TabsTrigger></TabsList><TabsContent value="overview"><DetailRow label="Code" value={selected.code} /><DetailRow label="Type" value={selected.type} /><DetailRow label="Status" value={<StatusBadge status={selected.status} />} /></TabsContent><TabsContent value="departments"><DetailRow label="Departments" value={`${selected.departments} available`} /></TabsContent><TabsContent value="contacts"><DetailRow label="Contact" value={selected.status === "Active" ? mockHospitalProfile.phone : "Future setup"} /></TabsContent><TabsContent value="future"><SecurityNote /></TabsContent></DrawerTabs> : null}
          </Drawer>
        </>
      )}
    </ProtectedAdmin>
  );
}

export function SecurityPage() {
  const [confirm, setConfirm] = React.useState<{ target: string; action: string } | null>(null);
  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 2 • Security" title="Security Management" description="Sessions, devices, IP restrictions, password policy, MFA policy, and login rules." actions={<Button disabled={readOnly} onClick={() => toast.success("Security policy saved in static preview")}><Save className="h-4 w-4" />Save policy</Button>} />
          <SummaryGrid><StatCard label="Active sessions" value={mockSecuritySessions.filter((s) => s.status === "Active").length} icon={ShieldCheck} change="Live" context="Current access" tone="success" /><StatCard label="Failed attempts" value={5} icon={ShieldAlert} change="Last 24h" context="Login risk" tone="danger" /><StatCard label="Trusted devices" value={mockDevices.filter((d) => d.trustStatus === "Trusted").length} icon={UserCog} change="Approved" context="Remembered devices" tone="info" /><StatCard label="Blocked IPs" value={mockIpRules.filter((r) => r.type === "Block").length} icon={Lock} change="Restricted" context="IP rules" tone="warning" /></SummaryGrid>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="sessions">Sessions</TabsTrigger><TabsTrigger value="devices">Devices</TabsTrigger><TabsTrigger value="ip">IP restrictions</TabsTrigger><TabsTrigger value="password">Password policy</TabsTrigger><TabsTrigger value="mfa">MFA policy</TabsTrigger><TabsTrigger value="login">Login rules</TabsTrigger></TabsList>
            <TabsContent value="overview"><SecurityNote /></TabsContent>
            <TabsContent value="sessions"><SessionsTable data={mockSecuritySessions} onRisk={(row) => setConfirm({ target: row.user, action: "Force logout" })} /></TabsContent>
            <TabsContent value="devices"><DevicesTable data={mockDevices} onRisk={(row) => setConfirm({ target: row.name, action: "Block device" })} /></TabsContent>
            <TabsContent value="ip"><IpRulesTable onRisk={(target) => setConfirm({ target, action: "Disable IP rule" })} /></TabsContent>
            <TabsContent value="password"><PolicyGrid fields={[["Minimum length", `${mockPasswordPolicy.minLength}`], ["Uppercase", "Required"], ["Lowercase", "Required"], ["Number", "Required"], ["Special character", "Required"], ["Expiry", `${mockPasswordPolicy.expiryDays} days`], ["Failed lock count", `${mockPasswordPolicy.failedAttemptLockCount}`], ["Reuse limit", `${mockPasswordPolicy.reuseLimit}`]]} /></TabsContent>
            <TabsContent value="mfa"><PolicyGrid fields={[["Admin roles", mockMfaPolicy.requiredForAdmin ? "Required" : "Optional"], ["Security settings", "Required"], ["Financial approvals", "Required placeholder"], ["Methods", mockMfaPolicy.methods.join(", ")], ["Trusted device", `${mockMfaPolicy.trustedDeviceDurationDays} days`], ["Failed OTP limit", `${mockMfaPolicy.failedAttemptLimit}`]]} /></TabsContent>
            <TabsContent value="login"><PolicyGrid fields={[["Session timeout", "30 minutes"], ["Remember device", "Allowed after MFA"], ["Multiple sessions", "Warn and allow"], ["First login", "Force password change"], ["Location warning", "Enabled placeholder"], ["New device alert", "Enabled placeholder"]]} /></TabsContent>
          </Tabs>
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Security confirmation" target={confirm?.target ?? ""} action={confirm?.action ?? ""} />
        </>
      )}
    </ProtectedAdmin>
  );
}

function SessionsTable({ data, onRisk }: { data: SecuritySession[]; onRisk: (row: SecuritySession) => void }) {
  const columns = React.useMemo<ColumnDef<SecuritySession>[]>(() => [
    { header: "User", accessorKey: "user" }, { header: "Role", accessorKey: "role" }, { header: "Device", accessorKey: "device" }, { header: "IP address", accessorKey: "ipAddress" }, { header: "Last activity", accessorKey: "lastActivity" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="danger" onClick={() => onRisk(row.original)}>Force logout</Button> },
  ], [onRisk]);
  return <DataTable data={data} columns={columns} />;
}

function DevicesTable({ data, onRisk }: { data: TrustedDevice[]; onRisk: (row: TrustedDevice) => void }) {
  const columns = React.useMemo<ColumnDef<TrustedDevice>[]>(() => [
    { header: "Device", accessorKey: "name" }, { header: "User", accessorKey: "user" }, { header: "Browser", accessorKey: "browser" }, { header: "Last used", accessorKey: "lastUsed" }, { header: "Trust", cell: ({ row }) => <StatusBadge status={row.original.trustStatus} /> }, { header: "Risk", cell: ({ row }) => <RiskBadge risk={row.original.risk} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="danger" onClick={() => onRisk(row.original)}>Block</Button> },
  ], [onRisk]);
  return <DataTable data={data} columns={columns} />;
}

function IpRulesTable({ onRisk }: { onRisk: (target: string) => void }) {
  const columns = React.useMemo<ColumnDef<(typeof mockIpRules)[number]>[]>(() => [
    { header: "IP/range", accessorKey: "range" }, { header: "Type", accessorKey: "type" }, { header: "Description", accessorKey: "description" }, { header: "Added by", accessorKey: "addedBy" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => onRisk(row.original.range)}>Disable</Button> },
  ], [onRisk]);
  return <DataTable data={mockIpRules} columns={columns} />;
}

function PolicyGrid({ fields }: { fields: [string, string][] }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{fields.map(([label, value]) => <Card key={label}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></CardContent></Card>)}</div>;
}

export function AuditLogsPage() {
  const [search, setSearch] = React.useState("");
  const [severity, setSeverity] = React.useState("All severity");
  const [selected, setSelected] = React.useState<AuditLog | null>(null);
  const filtered = mockAuditLogs.filter((log) => textMatch(`${log.actorName} ${log.module} ${log.eventType} ${log.target} ${log.ipAddress}`, search) && (severity === "All severity" || log.severity === severity));
  const columns = React.useMemo<ColumnDef<AuditLog>[]>(() => [
    { header: "Time", accessorKey: "timestamp" }, { header: "User", accessorKey: "actorName" }, { header: "Role", accessorKey: "actorRole" }, { header: "Module", accessorKey: "module" }, { header: "Event", accessorKey: "eventType" }, { header: "Target", accessorKey: "target" }, { header: "IP", accessorKey: "ipAddress" }, { header: "Severity", cell: ({ row }) => <StatusBadge status={row.original.severity} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Details</Button> },
  ], []);
  return (
    <ProtectedAdmin allowed={["Super Admin", "Hospital Admin"]} readOnly={["Management"]}>
      {() => (
        <>
          <PageHeader eyebrow="Phase 2 • Immutable Audit" title="Audit Logs" description="Searchable read-only activity records for user, role, setup, and security events." actions={<><Button variant="outline" onClick={() => pageToast("Audit print")}><Printer className="h-4 w-4" />Print</Button><Button variant="outline" onClick={() => pageToast("Audit export")}><Download className="h-4 w-4" />Export</Button></>} />
          <SummaryGrid><StatCard label="Events today" value={3} icon={FileText} change="Static" context="Read-only log" tone="info" /><StatCard label="Security events" value={2} icon={ShieldAlert} change="Review" context="Needs attention" tone="danger" /><StatCard label="Permission changes" value={1} icon={SlidersHorizontal} change="Pending" context="Approval trail" tone="warning" /><StatCard label="Critical events" value={1} icon={Lock} change="High" context="Priority event" tone="critical" /></SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search audit event, user, module, target, IP..."><NativeSelect label="Severity" value={severity} onChange={setSeverity} options={["All severity", "Info", "Warning", "Critical", "Security"]} /></FilterBar>
          <DataTable data={filtered} columns={columns} />
          <Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.eventType ?? "Audit event"} description="Read-only detail. Clinical and sensitive values are masked.">
            {selected ? <div><DetailRow label="Actor" value={`${selected.actorName} (${selected.actorRole})`} /><DetailRow label="Target" value={selected.target} /><DetailRow label="Module" value={selected.module} /><DetailRow label="Device/IP" value={`${selected.device} • ${selected.ipAddress}`} /><DetailRow label="Before" value={selected.before} masked={selected.sensitiveFieldsMasked} /><DetailRow label="After" value={selected.after} masked={selected.sensitiveFieldsMasked} /><SecurityNote /></div> : null}
          </Drawer>
        </>
      )}
    </ProtectedAdmin>
  );
}
