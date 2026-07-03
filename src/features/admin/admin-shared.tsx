"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  LockKeyhole,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import type { Role, StatusTone } from "@/types";

export const adminFullAccessRoles: Role[] = ["Super Admin", "Hospital Admin"];
export const adminReadOnlyRoles: Role[] = ["Management", "HR Manager"];

export function useAdminAccess(allowed: Role[] = adminFullAccessRoles, readOnly: Role[] = adminReadOnlyRoles) {
  const { role } = useRole();
  return {
    role,
    allowed: allowed.includes(role) || readOnly.includes(role),
    readOnly: readOnly.includes(role) && !allowed.includes(role),
  };
}

export function AccessDenied({ title = "Admin permission required" }: { title?: string }) {
  return (
    <div className="space-y-3 py-6">
      <EmptyState
        icon={LockKeyhole}
        title={title}
        description="Your current static role cannot access this admin workflow. Switch to Super Admin or Hospital Admin to preview the full Phase 2 UI."
      />
      <div className="flex justify-center">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

export function ReadOnlyBanner({ role }: { role: Role }) {
  return (
    <AlertBanner
      icon={AlertCircle}
      tone="warning"
      title="Read-only preview"
    >
      {role} can review this page in the static Phase 2 demo, but save and high-risk actions are disabled.
    </AlertBanner>
  );
}

export function FilterBar({
  search,
  onSearch,
  children,
  placeholder = "Search records...",
}: {
  search: string;
  onSearch: (value: string) => void;
  children?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
        </div>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </CardContent>
    </Card>
  );
}

export function NativeSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex min-w-[150px] items-center gap-2 text-xs text-muted-foreground">
      <span className="sr-only">{label}</span>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function StickyActionBar({
  dirty = true,
  readOnly,
  onSave,
  onReset,
  saveLabel = "Save changes",
}: {
  dirty?: boolean;
  readOnly?: boolean;
  onSave?: () => void;
  onReset?: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-border bg-background/92 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {dirty ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
          {dirty ? "Unsaved static changes are staged for review." : "All static settings are aligned."}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset ?? (() => toast.info("Static data refreshed"))} disabled={readOnly}>
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={onSave ?? (() => toast.success("Static UI state saved"))} disabled={readOnly}>
            <ClipboardCheck className="h-4 w-4" />
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDrawer({
  open,
  onOpenChange,
  title,
  target,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  target: string;
  action: string;
}) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="High-risk admin action. This will be recorded in audit logs."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              toast.success(`${action} recorded for ${target}`);
              onOpenChange(false);
            }}
          >
            Confirm {action}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <AlertBanner icon={ShieldAlert} tone="danger" title="Confirmation required">
          You are about to {action.toLowerCase()} {target}.
        </AlertBanner>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">Reason</span>
          <Input placeholder="Enter operational reason for audit trail" />
        </label>
      </div>
    </Drawer>
  );
}

export function DetailRow({ label, value, masked }: { label: string; value: React.ReactNode; masked?: boolean }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-border py-2 text-sm last:border-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="min-w-0 text-foreground">{masked ? "•••••• masked" : value}</div>
    </div>
  );
}

export function AdminSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" | "Critical" }) {
  const tone: StatusTone = risk === "Low" ? "success" : risk === "Medium" ? "warning" : risk === "High" ? "danger" : "critical";
  return <StatusPill tone={tone}>{risk}</StatusPill>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone: StatusTone =
    status === "Active" || status === "Trusted"
      ? "success"
      : status === "Locked" || status === "Blocked" || status === "Critical"
        ? "danger"
        : status === "Future Ready" || status === "Invited" || status === "Review"
          ? "info"
          : status === "Inactive" || status === "Expired"
            ? "muted"
            : "warning";
  return <StatusPill tone={tone}>{status}</StatusPill>;
}

export function ProtectedAdmin({
  children,
  allowed,
  readOnly,
}: {
  children: (state: { role: Role; readOnly: boolean }) => React.ReactNode;
  allowed?: Role[];
  readOnly?: Role[];
}) {
  const access = useAdminAccess(allowed, readOnly);
  if (!access.allowed) return <AccessDenied />;
  return (
    <div className="space-y-4">
      {access.readOnly ? <ReadOnlyBanner role={access.role} /> : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function DisabledReason({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <span className={cn("inline-flex", disabled && "cursor-not-allowed")} title={disabled ? "Unavailable for the current role or protected system record" : undefined}>
      {children}
    </span>
  );
}

export function SecurityNote() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>Reason capture, masking, and audit trail indicators are shown for backend integration readiness.</span>
    </div>
  );
}

export function DisabledFutureAction() {
  return (
    <Badge tone="muted" className="gap-1">
      <Ban className="h-3 w-3" />
      Future
    </Badge>
  );
}
