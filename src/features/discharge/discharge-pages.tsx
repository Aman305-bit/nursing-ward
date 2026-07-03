"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileSignature,
  FileCheck2,
  FileText,
  Languages,
  LockKeyhole,
  Plus,
  Printer,
  QrCode,
  RefreshCcw,
  Search,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar, NativeSelect } from "@/features/admin/admin-shared";
import { DischargeFollowUpHandoverPage } from "@/features/discharge/discharge-follow-up-handover";
import { DischargeMedicationPage } from "@/features/discharge/discharge-medication-reconciliation";
import { cn } from "@/lib/utils";
import type { Role, StatusTone } from "@/types";
import {
  dischargeSearchText,
  dischargeStatusOptions,
  dischargeTemplateOptions,
  getChecklistProgress,
  getDischargeTone,
  getOpenDischargeBlockers,
  mockDischargeAudit,
  mockDischargeChecklist,
  mockDischargeMedications,
  mockDischargePlans,
  type DischargeAuditEvent,
  type DischargeChecklistCategory,
  type DischargeChecklistItem,
  type DischargeChecklistStatus,
  type DischargeMedication,
  type DischargePatientPlan,
  type DischargeStatus,
} from "@/features/discharge/discharge-data";

const dischargeAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Pharmacist", "Billing Executive", "Management"];
const dischargeReadOnlyRoles: Role[] = ["Management"];

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClassName =
  "min-h-[104px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20";

function useDischargeAccess() {
  const { role } = useRole();
  return {
    role,
    allowed: dischargeAccessRoles.includes(role),
    readOnly: dischargeReadOnlyRoles.includes(role),
  };
}

type ChecklistCategoryRollup = "complete" | "pending" | "blocked";

type EvidenceDocument = {
  title: string;
  subtitle: string;
  status?: string;
  sections: Array<{
    title: string;
    rows: Array<{ label: string; value: string }>;
    note?: string;
  }>;
};

function getChecklistCategoryRollup(category: DischargeChecklistCategory, checklist: DischargeChecklistItem[]): ChecklistCategoryRollup {
  const applicable = checklist.filter((item) => item.category === category && item.status !== "Not required");
  if (!applicable.length) return "complete";
  if (applicable.some((item) => item.status === "Blocked")) return "blocked";
  if (applicable.some((item) => item.status === "Pending")) return "pending";
  return "complete";
}

function derivePlanStatusesFromChecklist(plan: DischargePatientPlan, planChecklist: DischargeChecklistItem[]): DischargePatientPlan {
  const medication = getChecklistCategoryRollup("Medication", planChecklist);
  const nursing = getChecklistCategoryRollup("Nursing", planChecklist);
  const billing = getChecklistCategoryRollup("Billing", planChecklist);
  const summary = getChecklistCategoryRollup("Summary", planChecklist);
  const progress = getChecklistProgress(planChecklist);
  const hasBlocked = planChecklist.some((item) => item.status === "Blocked");

  let status: DischargeStatus = plan.status;
  if (plan.status !== "Discharged") {
    if (hasBlocked) status = "On hold";
    else if (progress.percent === 100) status = "Ready for clearance";
    else if (billing !== "complete") status = "Billing pending";
    else if (summary !== "complete") status = "Summary pending";
    else status = "Checklist in progress";
  }

  return {
    ...plan,
    status,
    billingStatus: billing === "complete" ? "Cleared" : billing === "blocked" ? "Query raised" : "Pending",
    pharmacyStatus: medication === "complete" ? "Reconciled" : medication === "blocked" ? "Clarification required" : "Pending reconciliation",
    nurseClearance: nursing === "complete" ? "Done" : nursing === "blocked" ? "Pending" : "Education due",
    summaryStatus: plan.summaryStatus === "Signed" ? "Signed" : summary === "complete" ? "Ready for signature" : summary === "blocked" ? "Pending" : "Draft",
  };
}

export function DischargeManagementPage() {
  const access = useDischargeAccess();
  const [plans, setPlans] = React.useState<DischargePatientPlan[]>(mockDischargePlans);
  const [checklist, setChecklist] = React.useState<DischargeChecklistItem[]>(mockDischargeChecklist);
  const [medications] = React.useState<DischargeMedication[]>(mockDischargeMedications);
  const [audit, setAudit] = React.useState<DischargeAuditEvent[]>(mockDischargeAudit);
  const [selectedId, setSelectedId] = React.useState(mockDischargePlans[0]?.id ?? "");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"All status" | DischargeStatus>("All status");
  const [patientFilter, setPatientFilter] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState("queue");
  const [template, setTemplate] = React.useState(dischargeTemplateOptions[0]);

  const filteredPlans = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesSearch = !query || dischargeSearchText(plan).includes(query);
      const matchesStatus = statusFilter === "All status" || plan.status === statusFilter;
      const matchesPatient = patientFilter === "all" || plan.id === patientFilter;
      return matchesSearch && matchesStatus && matchesPatient;
    });
  }, [patientFilter, plans, search, statusFilter]);

  const selected = (patientFilter !== "all" ? plans.find((plan) => plan.id === patientFilter) : undefined) ?? plans.find((plan) => plan.id === selectedId) ?? filteredPlans[0] ?? plans[0];
  const selectedChecklist = checklist.filter((item) => item.planId === selected?.id);
  const selectedMedications = medications.filter((medication) => medication.planId === selected?.id);
  const selectedAudit = audit.filter((event) => event.planId === selected?.id);
  const progress = getChecklistProgress(selectedChecklist);
  const blockers = getOpenDischargeBlockers(selectedChecklist);

  const updatePlan = React.useCallback((planId: string, updater: (plan: DischargePatientPlan) => DischargePatientPlan) => {
    setPlans((current) => current.map((plan) => (plan.id === planId ? updater(plan) : plan)));
  }, []);

  const addAudit = React.useCallback((planId: string, event: string, note: string, severity: DischargeAuditEvent["severity"] = "Info") => {
    setAudit((current) => [
      {
        id: `dc-a-local-${Date.now()}`,
        planId,
        at: "Now",
        by: access.role,
        role: access.role,
        event,
        severity,
        note,
      },
      ...current,
    ]);
  }, [access.role]);

  const handleSelectPlan = (planId: string) => {
    setSelectedId(planId);
    setPatientFilter(planId);
    setActiveTab("overview");
  };

  const handleChecklistAction = (item: DischargeChecklistItem) => {
    const nextStatus: DischargeChecklistStatus = item.status === "Done" ? "Pending" : "Done";
    const nextChecklist = checklist.map((row) =>
      row.id === item.id
        ? {
            ...row,
            status: nextStatus,
            blocker: nextStatus === "Done" ? undefined : row.blocker,
            updatedBy: access.role,
            updatedAt: "Now",
          }
        : row,
    );
    const nextPlanChecklist = nextChecklist.filter((row) => row.planId === item.planId);

    setChecklist(nextChecklist);
    setPlans((current) => current.map((plan) => (plan.id === item.planId ? derivePlanStatusesFromChecklist(plan, nextPlanChecklist) : plan)));
    addAudit(
      item.planId,
      nextStatus === "Done" ? "Checklist item completed" : "Checklist item reopened",
      `${item.label}. Summary readiness and clearance status recalculated from checklist.`,
      nextStatus === "Done" ? "Info" : "Warning",
    );
    toast.success(nextStatus === "Done" ? "Checklist item marked done" : "Checklist item reopened");
  };

  const handleReadyForClearance = () => {
    if (!selected) return;
    if (blockers.length) {
      toast.error("Clear pending or blocked checklist items before marking ready");
      return;
    }
    updatePlan(selected.id, (plan) => ({ ...plan, status: "Ready for clearance", billingStatus: "Cleared", nurseClearance: "Done", pharmacyStatus: "Reconciled" }));
    addAudit(selected.id, "Ready for final clearance", "Clinical, nursing, pharmacy, and billing checks are complete.");
    toast.success("Marked ready for clearance");
  };

  const handleFinalizeDischarge = () => {
    if (!selected) return;
    if (blockers.length) {
      toast.error("Discharge cannot be finalized while checklist items are open");
      return;
    }
    updatePlan(selected.id, (plan) => ({ ...plan, status: "Discharged", summaryStatus: "Signed", orderLock: "Active" }));
    addAudit(selected.id, "Patient discharged", "Final summary signed and discharge closure recorded.", "Info");
    toast.success("Discharge finalized");
  };

  const updateSelectedInstructions = (field: keyof DischargePatientPlan["instructions"], value: string) => {
    if (!selected) return;
    updatePlan(selected.id, (plan) => ({ ...plan, instructions: { ...plan.instructions, [field]: value } }));
  };

  const updateSelectedFollowUp = (field: keyof DischargePatientPlan["followUp"], value: string) => {
    if (!selected) return;
    updatePlan(selected.id, (plan) => ({ ...plan, followUp: { ...plan.followUp, [field]: value as DischargePatientPlan["followUp"][typeof field] } }));
  };

  const updateSelectedFinalDischargeStatus = (value: DischargePatientPlan["finalDischargeStatus"]) => {
    if (!selected) return;
    updatePlan(selected.id, (plan) => ({ ...plan, finalDischargeStatus: value }));
    addAudit(selected.id, "Final discharge status updated", `Discharge status changed to ${value}.`, value === "Death" ? "Critical" : "Info");
  };

  const updateSelectedClinicalFindings = (clinicalFindings: string[]) => {
    if (!selected) return;
    updatePlan(selected.id, (plan) => ({
      ...plan,
      clinicalSummary: {
        ...plan.clinicalSummary,
        clinicalFindings: clinicalFindings.length ? clinicalFindings : [""],
      },
    }));
  };

  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="Discharge permission required" description="Switch to an inpatient, doctor, nurse, pharmacy, billing, admin, or management role to open discharge coordination." />;
  }

  if (!selected) {
    return <EmptyState icon={FileCheck2} title="No discharge plans" description="No active discharge workflow is available in the static dataset." />;
  }

  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only discharge review">
          Management can review the discharge board, summary, and audit trail while clinical actions remain disabled.
        </AlertBanner>
      ) : null}

      <PageHeader
        eyebrow="IPD discharge coordination"
        title="Discharge Management"
        description="Plan discharge, close multidisciplinary checklist, reconcile medication, prepare instructions, sign summary, and complete final clearance."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                addAudit(selected.id, "Discharge summary draft saved", "Summary draft saved from top action bar.");
                toast.success("Draft saved");
              }}
              disabled={access.readOnly}
            >
              <ClipboardCheck className="h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("summary")}>
              <Eye className="h-4 w-4" />
              Preview PDF
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={() => toast.success("Share request queued with patient consent check")}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleFinalizeDischarge} disabled={access.readOnly || selected.status === "Discharged"}>
              <FileSignature className="h-4 w-4" />
              Finalize
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Planned discharges" value={plans.filter((plan) => plan.status !== "Discharged").length} change="Active" context="Today queue" tone="info" icon={FileCheck2} />
        <StatCard label="Ready cases" value={plans.filter((plan) => plan.status === "Ready for clearance").length} change="Clear" context="Final stage" tone="success" icon={CheckCircle2} />
        <StatCard label="Open blockers" value={checklist.filter((item) => item.status === "Blocked").length} change="Resolve" context="Before exit" tone="danger" icon={AlertTriangle} />
        <StatCard label="Signed summaries" value={plans.filter((plan) => plan.summaryStatus === "Signed").length} change="Signed" context="Printable" tone="success" icon={FileText} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Discharge Queue</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="medications">Medication</TabsTrigger>
          <TabsTrigger value="instructions">Notes & Instructions</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, admission, bed, ward, consultant...">
          <select className={inputClassName} value={patientFilter} onChange={(event) => setPatientFilter(event.target.value)} aria-label="Patient filter">
            <option value="all">All patients</option>
            {plans.map((plan) => (
              <option value={plan.id} key={plan.id}>
                {plan.patientName} - {plan.uhid}
              </option>
            ))}
          </select>
          <NativeSelect label="Status filter" value={statusFilter} onChange={(value) => setStatusFilter(value as typeof statusFilter)} options={["All status", ...dischargeStatusOptions]} />
        </FilterBar>

        <TabsContent value="queue">
          <DischargeQueue plans={filteredPlans} checklist={checklist} selectedId={selected.id} onSelect={handleSelectPlan} />
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <PatientWorkspaceContext plan={selected} progress={progress} blockers={blockers} />
          <ChecklistTab checklist={selectedChecklist} readOnly={access.readOnly} onAction={handleChecklistAction} />
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <PatientWorkspaceContext plan={selected} progress={progress} blockers={blockers} />
          <MedicationTab plan={selected} readOnly={access.readOnly} />
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <PatientWorkspaceContext plan={selected} progress={progress} blockers={blockers} />
          <InstructionsTab
            plan={selected}
            template={template}
            onTemplateChange={setTemplate}
            readOnly={access.readOnly}
            onInstructionChange={updateSelectedInstructions}
          />
        </TabsContent>

        <TabsContent value="followup" className="space-y-4">
          <FollowUpTab key={selected.id} plan={selected} checklist={selectedChecklist} readOnly={access.readOnly} onFollowUpChange={updateSelectedFollowUp} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <PatientWorkspaceContext plan={selected} progress={progress} blockers={blockers} />
          <PremiumSummaryTab
            plan={selected}
            checklist={selectedChecklist}
            medications={selectedMedications}
            readOnly={access.readOnly}
            onFinalDischargeStatusChange={updateSelectedFinalDischargeStatus}
            onClinicalFindingsChange={updateSelectedClinicalFindings}
          />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <PatientWorkspaceContext plan={selected} progress={progress} blockers={blockers} />
          <AuditTab events={selectedAudit} />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 z-30 -mx-4 border-t border-border bg-background/92 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            {selected.patientName} | {selected.uhid} | {selected.bed}, {selected.ward}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.info("Static discharge data restored")} disabled={access.readOnly}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                addAudit(selected.id, "Discharge workflow saved", "Current discharge workspace changes saved.");
                toast.success("Discharge workflow saved");
              }}
              disabled={access.readOnly}
            >
              <ClipboardCheck className="h-4 w-4" />
              Save workflow
            </Button>
            <Button variant="outline" onClick={handleReadyForClearance} disabled={access.readOnly || selected.status === "Discharged"}>
              <ClipboardCheck className="h-4 w-4" />
              Mark ready
            </Button>
            <Button onClick={handleFinalizeDischarge} disabled={access.readOnly || selected.status === "Discharged"}>
              <CheckCircle2 className="h-4 w-4" />
              Final discharge
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

function PatientWorkspaceContext({
  plan,
  progress,
  blockers,
}: {
  plan: DischargePatientPlan;
  progress: ReturnType<typeof getChecklistProgress>;
  blockers: DischargeChecklistItem[];
}) {
  return (
    <div className="space-y-3">
      <SelectedDischargeHeader plan={plan} progress={progress} blockers={blockers.length} />
      {blockers.length ? (
        <AlertBanner icon={AlertTriangle} tone={blockers.some((item) => item.status === "Blocked") ? "danger" : "warning"} title="Discharge blockers">
          {blockers.slice(0, 4).map((item) => `${item.label}${item.blocker ? `: ${item.blocker}` : ""}`).join(" | ")}
        </AlertBanner>
      ) : (
        <AlertBanner icon={ShieldCheck} tone="success" title="Checklist clear">
          All applicable discharge checklist items are closed for this patient.
        </AlertBanner>
      )}
    </div>
  );
}

function DischargeQueue({
  plans,
  checklist,
  selectedId,
  onSelect,
}: {
  plans: DischargePatientPlan[];
  checklist: DischargeChecklistItem[];
  selectedId: string;
  onSelect: (planId: string) => void;
}) {
  const ready = plans.filter((plan) => plan.status === "Ready for clearance").length;
  const billing = plans.filter((plan) => plan.billingStatus !== "Cleared").length;
  const signed = plans.filter((plan) => plan.summaryStatus === "Signed").length;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Discharge queue</CardTitle>
          <CardDescription>Select a patient, then open the required discharge tab from the top workflow bar.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="info">{plans.length} cases</Badge>
          <Badge tone="success">{ready} ready</Badge>
          <Badge tone="warning">{billing} billing</Badge>
          <Badge tone="muted">{signed} signed</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-3 md:grid-cols-2 2xl:grid-cols-3">
        {plans.length ? (
          plans.map((plan) => {
            const items = checklist.filter((item) => item.planId === plan.id);
            const progress = getChecklistProgress(items);
            const blockers = getOpenDischargeBlockers(items);
            return (
              <button
                type="button"
                key={plan.id}
                onClick={() => onSelect(plan.id)}
                className={cn(
                  "min-h-[178px] w-full rounded-lg border p-3 text-left transition hover:border-primary/60 hover:bg-surface-muted/70",
                  selectedId === plan.id ? "border-primary bg-primary/5" : "border-border bg-background",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{plan.patientName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{plan.uhid} | {plan.bed} | {plan.ward}</div>
                  </div>
                  <StatusPill tone={getDischargeTone(plan.status)}>{plan.status}</StatusPill>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progress.done}/{progress.total} checks</span>
                  <span>{blockers.length} open</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <QueueMiniStatus label="Billing" value={plan.billingStatus} />
                  <QueueMiniStatus label="Pharmacy" value={plan.pharmacyStatus} />
                  <QueueMiniStatus label="Nurse" value={plan.nurseClearance} />
                  <QueueMiniStatus label="Summary" value={plan.summaryStatus} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {plan.riskFlags.slice(0, 2).map((flag) => (
                    <Badge tone="warning" key={flag}>{flag}</Badge>
                  ))}
                </div>
              </button>
            );
          })
        ) : (
          <EmptyState icon={Search} title="No matching discharge cases" description="Try another patient, status, ward, or consultant search." />
        )}
      </CardContent>
    </Card>
  );
}

function QueueMiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted px-2 py-1">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-medium text-foreground">{value}</div>
    </div>
  );
}

function SelectedDischargeHeader({ plan, progress, blockers }: { plan: DischargePatientPlan; progress: ReturnType<typeof getChecklistProgress>; blockers: number }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-semibold text-foreground">{plan.patientName}</div>
              <Badge tone="muted">{plan.uhid}</Badge>
              <Badge tone="info">{plan.ageGender}</Badge>
              <StatusPill tone={getDischargeTone(plan.status)}>{plan.status}</StatusPill>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {plan.diagnosis} | {plan.consultant} | {plan.bed}, {plan.ward}
            </div>
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-2 xl:min-w-[420px]">
            <HeaderMetric label="Planned" value={plan.dischargePlannedAt} />
            <HeaderMetric label="Expected exit" value={plan.expectedDeparture} />
            <HeaderMetric label="Checklist" value={`${progress.percent}% complete`} />
            <HeaderMetric label="Open items" value={String(blockers)} tone={blockers ? "warning" : "success"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeaderMetric({ label, value, tone = "info" }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-2">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className={cn("mt-1 truncate text-sm font-semibold text-foreground", tone === "success" && "text-success", tone === "warning" && "text-warning")}>{value}</div>
    </div>
  );
}

function ChecklistTab({
  checklist,
  readOnly,
  onAction,
}: {
  checklist: DischargeChecklistItem[];
  readOnly: boolean;
  onAction: (item: DischargeChecklistItem) => void;
}) {
  const [previewDocument, setPreviewDocument] = React.useState<EvidenceDocument | null>(null);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Multidisciplinary discharge checklist</CardTitle>
          <CardDescription>Clinical, medication, diagnostic, nursing, billing, and summary clearance</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[62dvh] overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="sticky top-0 z-20 bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Checklist item</th>
                <th className="px-3 py-2">Area</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Blocker</th>
                <th className="px-3 py-2 text-right">Preview</th>
                <th className="px-3 py-2 text-right">Download</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item) => {
                const evidence = buildChecklistEvidenceDocument(item);
                return (
                  <tr className="border-t border-border hover:bg-surface-muted/60" key={item.id}>
                    <td className="px-3 py-2 font-medium text-foreground">{item.label}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.ownerRole}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => toast.info(`${item.source} opened`)}>
                        {item.source}
                      </Button>
                    </td>
                    <td className="px-3 py-2"><StatusPill tone={getDischargeTone(item.status)}>{item.status}</StatusPill></td>
                    <td className="max-w-[260px] px-3 py-2 text-xs text-muted-foreground">{item.blocker ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => setPreviewDocument(evidence)}>
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => downloadEvidenceDocument(evidence)}>
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant={item.status === "Done" ? "outline" : "default"} disabled={readOnly || item.status === "Not required"} onClick={() => onAction(item)}>
                        {item.status === "Done" ? "Reopen" : "Mark done"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
      <EvidencePreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
    </Card>
  );
}

function MedicationTab({ plan, readOnly }: { plan: DischargePatientPlan; readOnly: boolean }) {
  const [age = "0", gender = ""] = plan.ageGender.split(" / ");

  return (
    <DischargeMedicationPage
      readOnly={readOnly}
      patient={{
        patientName: plan.patientName,
        mrn: plan.uhid,
        ipdNo: plan.admissionId.toUpperCase(),
        age: Number(age) || 0,
        gender,
        consultant: plan.consultant,
      }}
    />
  );
}

type InstructionField = keyof DischargePatientPlan["instructions"];

const instructionAdviceLibrary: Record<string, Partial<Record<InstructionField, string[]>>> = {
  "Routine discharge": {
    dischargeNote: [
      "Patient is clinically stable for discharge with follow-up advice.",
      "Discharge after completion of nursing, pharmacy, billing, and summary clearance.",
      "Patient and attendant have been counselled regarding medicines, diet, activity, and warning signs.",
    ],
    patientInstructions: [
      "Continue medicines exactly as prescribed in the discharge medication list.",
      "Keep this discharge summary safely and bring it for every follow-up visit.",
      "Do not start or stop any medicine without doctor advice.",
      "Maintain adequate hydration unless fluid restriction is advised.",
    ],
    diet: [
      "Regular home diet as tolerated.",
      "Maintain adequate oral fluids unless restricted by the treating doctor.",
      "Avoid alcohol and smoking.",
    ],
    activity: [
      "Resume routine activities gradually as tolerated.",
      "Avoid strenuous activity for 48 hours.",
      "Take adequate rest and avoid unnecessary travel on the day of discharge.",
    ],
    woundCare: [
      "Keep wound or dressing clean and dry if applicable.",
      "Return for review if redness, swelling, discharge, bleeding, or dressing soakage occurs.",
      "Not applicable if no wound or procedure site is present.",
    ],
    lifestyle: [
      "Avoid smoking and alcohol during recovery.",
      "Maintain sleep, hydration, and medicine adherence.",
      "Resume work or school only as advised by the consultant.",
    ],
    warningSigns: [
      "Visit emergency immediately if fever, chest pain, breathing difficulty, severe weakness, persistent vomiting, bleeding, or altered sensorium occurs.",
      "Return to hospital if symptoms worsen or new symptoms develop.",
    ],
  },
  "Asthma discharge": {
    patientInstructions: [
      "Use inhaler with spacer as demonstrated by the nursing team.",
      "Avoid smoke, dust, cold exposure, and known allergy triggers.",
      "Keep rescue inhaler available at all times.",
    ],
    diet: ["Regular diet with adequate hydration.", "Avoid food items known to trigger allergy or wheeze."],
    activity: ["Avoid heavy exertion for 48 hours.", "Resume school/work only after symptoms remain controlled."],
    lifestyle: ["Avoid smoke, dust, cold exposure, and known asthma triggers.", "Keep rescue inhaler available at all times."],
    warningSigns: [
      "Visit emergency immediately if breathlessness at rest, bluish lips, drowsiness, poor oral intake, or poor response to inhaler occurs.",
    ],
  },
  "Post procedure discharge": {
    dischargeNote: [
      "Procedure recovery is satisfactory and patient is fit for discharge with post-procedure advice.",
      "Post-procedure warning signs and follow-up plan have been explained.",
    ],
    patientInstructions: [
      "Keep procedure documents and reports safely.",
      "Take pain medicines only as prescribed.",
      "Do not remove dressing unless advised.",
    ],
    activity: ["Avoid heavy lifting until review.", "Gradual mobilization is advised.", "Physiotherapy as advised."],
    woundCare: ["Keep dressing or cast dry and intact.", "Do not remove dressing unless advised by the consultant."],
    warningSigns: [
      "Visit emergency immediately if severe pain, swelling, fever, bleeding, wound discharge, limb discoloration, or breathing difficulty occurs.",
    ],
  },
  "Renal follow-up discharge": {
    patientInstructions: [
      "Monitor urine output and report sudden reduction immediately.",
      "Take renal medicines as prescribed and avoid over-the-counter painkillers unless approved.",
      "Bring latest renal function reports for follow-up.",
    ],
    diet: [
      "Follow renal diet as advised by dietician.",
      "Maintain fluid restriction if prescribed.",
      "Avoid high-salt and high-potassium foods if advised.",
    ],
    warningSigns: [
      "Visit emergency immediately if breathlessness, swelling, very low urine output, confusion, chest pain, or severe weakness occurs.",
    ],
  },
  "LAMA discharge": {
    dischargeNote: [
      "Patient/attendant has chosen discharge against medical advice after counselling regarding risks.",
      "Risks and need for urgent return if symptoms worsen have been explained.",
    ],
    patientInstructions: [
      "Return to emergency immediately if condition worsens.",
      "Continue only medicines prescribed in this discharge advice.",
      "Follow up with treating doctor as early as possible.",
    ],
    warningSigns: [
      "Emergency return is required for worsening symptoms, unconsciousness, breathing difficulty, chest pain, bleeding, or severe weakness.",
    ],
  },
  "Transfer discharge": {
    dischargeNote: [
      "Patient is being transferred with clinical summary, current medicines, and handover advice.",
      "Receiving facility handover and transport precautions have been explained.",
    ],
    patientInstructions: [
      "Carry all reports, discharge summary, medication chart, and referral note during transfer.",
      "Do not delay transfer or stop monitoring during transport.",
    ],
    warningSigns: ["During transfer, report breathing difficulty, fall in consciousness, chest pain, seizure, or bleeding immediately."],
  },
};

function getInstructionAdviceOptions(template: string, department: string, field: InstructionField) {
  const routine = instructionAdviceLibrary["Routine discharge"][field] ?? [];
  const templateOptions = instructionAdviceLibrary[template]?.[field] ?? [];
  const departmentOptions = getDepartmentInstructionOptions(department, field);
  return Array.from(new Set([...templateOptions, ...departmentOptions, ...routine]));
}

function getDepartmentInstructionOptions(department: string, field: InstructionField) {
  if (department === "Orthopedics") {
    const options: Partial<Record<InstructionField, string[]>> = {
      patientInstructions: ["Keep limb elevated and do not wet the cast or dressing.", "Report numbness, severe swelling, or increasing pain immediately."],
      activity: ["Non-weight-bearing mobilization with walker until orthopedic review.", "Physiotherapy and limb elevation as advised."],
      woundCare: ["Keep cast or dressing dry.", "Do not insert objects inside cast or remove dressing unless advised."],
      lifestyle: ["Use fall-prevention precautions at home.", "Continue blood pressure medicine and follow assisted walking advice."],
      warningSigns: ["Visit emergency if finger/toe discoloration, severe swelling, cast tightness, fever, or uncontrolled pain occurs."],
    };
    return options[field] ?? [];
  }
  if (department === "Pediatrics") {
    const options: Partial<Record<InstructionField, string[]>> = {
      patientInstructions: ["Guardian has been counselled regarding medicine dose, danger signs, and follow-up.", "Ensure adequate oral intake and age-appropriate rest."],
      diet: ["Age-appropriate diet with adequate fluids.", "Avoid known allergens if any."],
      lifestyle: ["Avoid smoke, dust, and known allergy triggers.", "Keep rescue medicines available as advised."],
      warningSigns: ["Return immediately if child has poor feeding, drowsiness, breathing difficulty, high fever, convulsion, or bluish lips."],
    };
    return options[field] ?? [];
  }
  if (department === "Emergency") {
    const options: Partial<Record<InstructionField, string[]>> = {
      dischargeNote: ["Emergency stabilization summary prepared with transfer/return precautions."],
      patientInstructions: ["Attend emergency immediately if any symptom worsens after discharge or transfer."],
      woundCare: ["Maintain IV site or dressing as advised during transfer."],
      warningSigns: ["Emergency return is required for altered consciousness, breathing difficulty, chest pain, bleeding, seizure, or severe weakness."],
    };
    return options[field] ?? [];
  }
  return [];
}

function appendInstructionText(current: string, addition: string) {
  const cleaned = addition.trim();
  if (!cleaned) return current;
  if (!current.trim()) return cleaned;
  return `${current.trim()}\n${cleaned}`;
}

function InstructionsTab({
  plan,
  template,
  onTemplateChange,
  readOnly,
  onInstructionChange,
}: {
  plan: DischargePatientPlan;
  template: string;
  onTemplateChange: (value: string) => void;
  readOnly: boolean;
  onInstructionChange: (field: keyof DischargePatientPlan["instructions"], value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Notes and discharge instructions</CardTitle>
          <CardDescription>Doctor note, patient instructions, diet, activity, and warning signs</CardDescription>
        </div>
        <NativeSelect label="Template" value={template} onChange={onTemplateChange} options={dischargeTemplateOptions} />
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2 [&>*]:min-w-0">
        <TextAreaField
          label="Discharge note"
          value={plan.instructions.dischargeNote}
          readOnly={readOnly}
          suggestions={getInstructionAdviceOptions(template, plan.department, "dischargeNote")}
          onChange={(value) => onInstructionChange("dischargeNote", value)}
        />
        <TextAreaField
          label="Patient instructions"
          value={plan.instructions.patientInstructions}
          readOnly={readOnly}
          suggestions={getInstructionAdviceOptions(template, plan.department, "patientInstructions")}
          onChange={(value) => onInstructionChange("patientInstructions", value)}
        />
        <TextAreaField
          label="Diet advice"
          value={plan.instructions.diet}
          readOnly={readOnly}
          suggestions={getInstructionAdviceOptions(template, plan.department, "diet")}
          onChange={(value) => onInstructionChange("diet", value)}
        />
        <TextAreaField
          label="Activity advice"
          value={plan.instructions.activity}
          readOnly={readOnly}
          suggestions={getInstructionAdviceOptions(template, plan.department, "activity")}
          onChange={(value) => onInstructionChange("activity", value)}
        />
        <TextAreaField
          label="Wound care"
          value={plan.instructions.woundCare}
          readOnly={readOnly}
          suggestions={getInstructionAdviceOptions(template, plan.department, "woundCare")}
          onChange={(value) => onInstructionChange("woundCare", value)}
        />
        <TextAreaField
          label="Lifestyle modifications"
          value={plan.instructions.lifestyle}
          readOnly={readOnly}
          suggestions={getInstructionAdviceOptions(template, plan.department, "lifestyle")}
          onChange={(value) => onInstructionChange("lifestyle", value)}
        />
        <div className="xl:col-span-2">
          <TextAreaField
            label="Warning signs"
            value={plan.instructions.warningSigns}
            readOnly={readOnly}
            suggestions={getInstructionAdviceOptions(template, plan.department, "warningSigns")}
            onChange={(value) => onInstructionChange("warningSigns", value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TextAreaField({
  label,
  value,
  readOnly,
  suggestions = [],
  onChange,
}: {
  label: string;
  value: string;
  readOnly: boolean;
  suggestions?: string[];
  onChange: (value: string) => void;
}) {
  const [selectedSuggestion, setSelectedSuggestion] = React.useState("");
  const activeSuggestion = suggestions.includes(selectedSuggestion) ? selectedSuggestion : suggestions[0] ?? "";

  return (
    <div className="min-w-0 space-y-2 text-sm">
      <div className="font-medium text-foreground">{label}</div>
      {suggestions.length ? (
        <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <select
              className={cn(inputClassName, "min-w-0 truncate")}
              value={activeSuggestion}
              disabled={readOnly}
              onChange={(event) => setSelectedSuggestion(event.target.value)}
              aria-label={`${label} quick advice`}
            >
              {suggestions.map((suggestion) => (
                <option value={suggestion} key={suggestion}>
                  {suggestion}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            disabled={readOnly || !activeSuggestion}
            onClick={() => onChange(appendInstructionText(value, activeSuggestion))}
          >
            Add advice
          </Button>
        </div>
      ) : null}
      <textarea className={textareaClassName} value={value} disabled={readOnly} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ClinicalFindingsEditor({
  findings,
  readOnly,
  onChange,
}: {
  findings: string[];
  readOnly: boolean;
  onChange: (findings: string[]) => void;
}) {
  const rows = findings.length ? findings : [""];

  const updateFinding = (index: number, value: string) => {
    onChange(rows.map((finding, rowIndex) => (rowIndex === index ? value : finding)));
  };

  const addFinding = () => {
    onChange([...rows, ""]);
  };

  const removeFinding = (index: number) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    onChange(nextRows.length ? nextRows : [""]);
  };

  return (
    <div className="min-w-0 space-y-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium text-foreground">Clinical findings</div>
        <Button type="button" size="sm" variant="outline" disabled={readOnly} onClick={addFinding}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {rows.map((finding, index) => (
          <div className="grid gap-2 sm:grid-cols-[36px_minmax(0,1fr)_36px]" key={`clinical-finding-${index}`}>
            <div className="grid h-9 place-items-center rounded-md border border-border bg-surface-muted text-sm font-semibold text-muted-foreground">
              {index + 1}
            </div>
            <Input
              value={finding}
              disabled={readOnly}
              placeholder={`Clinical finding ${index + 1}`}
              onChange={(event) => updateFinding(index, event.target.value)}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={readOnly || rows.length === 1}
              aria-label={`Remove clinical finding ${index + 1}`}
              onClick={() => removeFinding(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpTab({
  plan,
  checklist,
  readOnly,
  onFollowUpChange,
}: {
  plan: DischargePatientPlan;
  checklist: DischargeChecklistItem[];
  readOnly: boolean;
  onFollowUpChange: (field: keyof DischargePatientPlan["followUp"], value: string) => void;
}) {
  return <DischargeFollowUpHandoverPage plan={plan} checklist={checklist} readOnly={readOnly} onFollowUpChange={onFollowUpChange} />;
}

function Field({ label, value, disabled, onChange }: { label: string; value: string; disabled?: boolean; onChange?: (value: string) => void }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <Input value={value} disabled={disabled} onChange={(event) => onChange?.(event.target.value)} />
    </label>
  );
}

function HandoverRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-2">
      <span className="text-muted-foreground">{label}</span>
      <StatusPill tone={getDischargeTone(value)}>{value}</StatusPill>
    </div>
  );
}

const hospitalProfile = {
  name: "Plasmit Hospital",
  branch: "Main Campus",
  address: "Multi Department Day Operations, Pune",
  phone: "+91 20 4000 1100",
  email: "care@plasmithospital.example",
  website: "www.plasmithospital.example",
  accreditation: "NABH / JCI accreditation placeholder",
};

type SummaryReadinessStatus = "Complete" | "Review" | "Blocked";

type SummaryReadinessItem = {
  label: string;
  source: string;
  status: SummaryReadinessStatus;
  detail: string;
  evidence: EvidenceDocument;
};

type SummaryReadinessSeed = Omit<SummaryReadinessItem, "evidence">;

function getChecklistCategoryState(category: DischargeChecklistCategory, checklist: DischargeChecklistItem[]) {
  const rows = checklist.filter((item) => item.category === category);
  if (!rows.length) return { status: "Review" as SummaryReadinessStatus, detail: "No checklist source" };
  if (rows.some((item) => item.status === "Blocked")) return { status: "Blocked" as SummaryReadinessStatus, detail: rows.find((item) => item.status === "Blocked")?.blocker ?? "Blocked item present" };
  if (rows.some((item) => item.status === "Pending")) return { status: "Review" as SummaryReadinessStatus, detail: `${rows.filter((item) => item.status === "Pending").length} pending` };
  return { status: "Complete" as SummaryReadinessStatus, detail: "Checklist complete" };
}

function getSummaryReadinessItems(
  plan: DischargePatientPlan,
  checklist: DischargeChecklistItem[],
  medications: DischargeMedication[],
  pendingReports: ReturnType<typeof getPremiumPendingRows>,
): SummaryReadinessItem[] {
  const diagnostics = getChecklistCategoryState("Diagnostics", checklist);
  const medication = getChecklistCategoryState("Medication", checklist);
  const nursing = getChecklistCategoryState("Nursing", checklist);
  const billing = getChecklistCategoryState("Billing", checklist);
  const summary = getChecklistCategoryState("Summary", checklist);
  const dischargeMeds = medications.filter((row) => row.dischargeMedication);
  const pendingOpen = pendingReports.filter((row) => row.status !== "Clear");

  const items: SummaryReadinessSeed[] = [
    { label: "Patient identity", source: "Admission", status: plan.uhid && plan.patientName ? "Complete" : "Blocked", detail: plan.uhid || "UHID missing" },
    { label: "Diagnosis", source: "Doctor", status: plan.clinicalSummary.primaryDiagnosis ? "Complete" : "Blocked", detail: plan.clinicalSummary.primaryDiagnosis || "Final diagnosis required" },
    { label: "Clinical summary", source: "EMR notes", status: plan.clinicalSummary.hpi && getClinicalFindingRows(plan).length && plan.clinicalSummary.treatmentProvided ? "Complete" : "Review", detail: "HPI, findings, and treatment" },
    { label: "Diagnostics reviewed", source: "Checklist", ...diagnostics },
    { label: "Medication reconciliation", source: "Checklist / MAR", ...medication },
    { label: "Discharge medicines", source: "Pharmacy", status: dischargeMeds.length ? "Complete" : "Review", detail: dischargeMeds.length ? `${dischargeMeds.length} take-home medicines` : "Confirm no discharge medicine" },
    { label: "Nursing education", source: "Checklist", ...nursing },
    { label: "Billing clearance", source: "Checklist / Billing", status: plan.billingStatus === "Cleared" ? billing.status : "Review", detail: plan.billingStatus },
    { label: "Instructions and diet", source: "Patient advice", status: plan.instructions.patientInstructions && plan.instructions.diet && plan.instructions.activity && plan.instructions.woundCare && plan.instructions.lifestyle && plan.instructions.warningSigns ? "Complete" : "Review", detail: "Patient-friendly advice" },
    { label: "Follow-up", source: "Appointment", status: plan.followUp.date !== "Pending" && plan.followUp.physician ? "Complete" : "Review", detail: `${plan.followUp.physician}, ${plan.followUp.date}` },
    { label: "Pending reports", source: "Lab / Radiology", status: pendingOpen.length ? "Review" : "Complete", detail: pendingOpen.length ? `${pendingOpen.length} pending` : "No pending critical report" },
    { label: "Legal sign-off", source: "Summary approval", status: plan.summaryStatus === "Signed" ? "Complete" : summary.status, detail: plan.summaryStatus },
  ];

  return items.map((item) => ({
    ...item,
    evidence: buildSummaryReadinessEvidence(item, plan, checklist, medications, pendingReports),
  }));
}

function summaryReadinessTone(status: SummaryReadinessStatus): StatusTone {
  if (status === "Complete") return "success";
  if (status === "Blocked") return "danger";
  return "warning";
}

function buildChecklistEvidenceDocument(item: DischargeChecklistItem): EvidenceDocument {
  return {
    title: `${item.category} checklist evidence`,
    subtitle: item.label,
    status: item.status,
    sections: [
      {
        title: "Checklist source",
        rows: [
          { label: "Checklist item", value: item.label },
          { label: "Area", value: item.category },
          { label: "Owner", value: item.ownerRole },
          { label: "Source", value: item.source },
          { label: "Status", value: item.status },
          { label: "Updated by", value: item.updatedBy },
          { label: "Updated at", value: item.updatedAt },
        ],
        note: item.blocker ? `Blocker: ${item.blocker}` : "No active blocker recorded for this checklist item.",
      },
      {
        title: "Audit-ready use",
        rows: [
          { label: "Preview purpose", value: "Quick review of the evidence behind this discharge checklist row." },
          { label: "Download purpose", value: "Static frontend evidence file for presentation, audit walkthrough, or handover." },
        ],
      },
    ],
  };
}

function buildSummaryReadinessEvidence(
  item: SummaryReadinessSeed,
  plan: DischargePatientPlan,
  checklist: DischargeChecklistItem[],
  medications: DischargeMedication[],
  pendingReports: ReturnType<typeof getPremiumPendingRows>,
): EvidenceDocument {
  const checklistRows = checklist.filter((row) => row.category === readinessCategoryForLabel(item.label));
  const dischargeMeds = medications.filter((row) => row.dischargeMedication);
  const defaultSection = {
    title: "Readiness status",
    rows: [
      { label: "Item", value: item.label },
      { label: "Source", value: item.source },
      { label: "Status", value: item.status },
      { label: "Detail", value: item.detail },
    ],
  };

  if (item.label === "Patient identity") {
    return {
      title: "Patient identity preview",
      subtitle: `${plan.patientName} | ${plan.uhid}`,
      status: item.status,
      sections: [
        {
          title: "Patient and encounter",
          rows: [
            { label: "Patient", value: plan.patientName },
            { label: "UHID / MRN", value: plan.uhid },
            { label: "Age / Gender", value: plan.ageGender },
            { label: "Address", value: plan.address },
            { label: "Contact number", value: plan.contactNumber },
            { label: "Admission", value: plan.admissionId },
            { label: "Admission date/time", value: plan.admissionDateTime },
            { label: "Discharge date/time", value: plan.dischargeDateTime },
            { label: "Ward / Bed", value: `${plan.ward}, ${plan.bed}` },
            { label: "Admitting consultant", value: plan.admittingConsultant },
            { label: "Consultant", value: plan.consultant },
            { label: "Department", value: plan.department },
            { label: "Specialty", value: plan.specialty },
          ],
        },
        defaultSection,
      ],
    };
  }

  if (item.label === "Diagnosis") {
    return {
      title: "Diagnosis preview",
      subtitle: plan.clinicalSummary.primaryDiagnosis,
      status: item.status,
      sections: [
        {
          title: "Diagnosis details",
          rows: [
            { label: "Final diagnosis", value: plan.clinicalSummary.primaryDiagnosis },
            { label: "Secondary diagnosis", value: plan.clinicalSummary.secondaryDiagnosis },
            { label: "Department", value: plan.department },
            { label: "Type of discharge", value: getDischargeTypeLabel(plan) },
            { label: "Discharge status", value: plan.finalDischargeStatus },
            { label: "Destination", value: plan.destination },
          ],
        },
        defaultSection,
      ],
    };
  }

  if (item.label === "Clinical summary") {
    return {
      title: "Clinical summary preview",
      subtitle: "HPI, history, findings, treatment, and procedure summary",
      status: item.status,
      sections: [
        {
          title: "Clinical content",
          rows: [
            { label: "History of present illness", value: plan.clinicalSummary.hpi },
            { label: "Chief complaints", value: plan.clinicalSummary.chiefComplaints },
            { label: "Duration", value: plan.clinicalSummary.complaintDuration },
            { label: "Brief clinical history", value: plan.clinicalSummary.briefClinicalHistory },
            { label: "Past history", value: plan.clinicalSummary.pastHistory },
            { label: "Medical history", value: plan.clinicalSummary.medicalHistory },
            { label: "Social history", value: plan.clinicalSummary.socialHistory },
            { label: "Allergic history", value: plan.clinicalSummary.allergicHistory },
            { label: "Clinical findings", value: getClinicalFindingsText(plan) },
            { label: "Treatment provided", value: plan.clinicalSummary.treatmentProvided },
            { label: "Procedure", value: plan.clinicalSummary.procedure },
            { label: "Condition at discharge", value: getConditionAtDischargeText(plan) },
          ],
        },
        defaultSection,
      ],
    };
  }

  if (item.label === "Discharge medicines") {
    return {
      title: "Discharge medicines preview",
      subtitle: `${dischargeMeds.length} selected take-home medicine(s)`,
      status: item.status,
      sections: [
        {
          title: "Selected discharge medication",
          rows: dischargeMeds.length
            ? dischargeMeds.map((medication) => ({
                label: medication.medicine,
                value: `${medication.dose} | ${medication.route} | ${medication.frequency} | ${medication.duration} | ${medication.instructions}`,
              }))
            : [{ label: "Discharge medicines", value: "No discharge medicine selected. Confirm no discharge medicine if clinically appropriate." }],
        },
        defaultSection,
      ],
    };
  }

  if (item.label === "Instructions and diet") {
    return {
      title: "Instructions and diet preview",
      subtitle: "Patient-facing discharge advice",
      status: item.status,
      sections: [
        {
          title: "Instructions",
          rows: [
            { label: "Patient instructions", value: plan.instructions.patientInstructions },
            { label: "Diet advice", value: plan.instructions.diet },
            { label: "Activity advice", value: plan.instructions.activity },
            { label: "Wound care", value: plan.instructions.woundCare },
            { label: "Lifestyle modifications", value: plan.instructions.lifestyle },
            { label: "Red flag symptoms", value: plan.instructions.warningSigns },
          ],
        },
        defaultSection,
      ],
    };
  }

  if (item.label === "Follow-up") {
    return {
      title: "Follow-up preview",
      subtitle: `${plan.followUp.physician} | ${plan.followUp.date}`,
      status: item.status,
      sections: [
        {
          title: "Follow-up plan",
          rows: [
            { label: "Doctor", value: plan.followUp.physician },
            { label: "Department", value: plan.followUp.department },
            { label: "Date", value: plan.followUp.date },
            { label: "Time", value: plan.followUp.time },
            { label: "Mode", value: plan.followUp.mode },
          ],
        },
        defaultSection,
      ],
    };
  }

  if (item.label === "Pending reports") {
    return {
      title: "Pending reports preview",
      subtitle: item.detail,
      status: item.status,
      sections: [
        {
          title: "Pending report tracking",
          rows: pendingReports.map((report) => ({
            label: report.item,
            value: `${report.status} | Expected: ${report.expectedAt} | Owner: ${report.owner} | Contact: ${report.contact}`,
          })),
        },
        defaultSection,
      ],
    };
  }

  if (item.label === "Legal sign-off") {
    return {
      title: "Legal sign-off preview",
      subtitle: `Summary status: ${plan.summaryStatus}`,
      status: item.status,
      sections: [
        {
          title: "Approval context",
          rows: [
            { label: "Summary status", value: plan.summaryStatus },
            { label: "Order lock", value: plan.orderLock },
            { label: "Treating consultant", value: plan.consultant },
            { label: "Summary number", value: getPremiumSummaryNo(plan) },
            { label: "Discharge status", value: plan.status },
          ],
        },
        defaultSection,
      ],
    };
  }

  return {
    title: `${item.label} preview`,
    subtitle: item.detail,
    status: item.status,
    sections: [
      {
        title: "Checklist evidence",
        rows: checklistRows.length
          ? checklistRows.map((row) => ({
              label: row.label,
              value: `${row.status} | ${row.ownerRole} | ${row.source} | Updated ${row.updatedAt}`,
            }))
          : [{ label: item.label, value: item.detail }],
        note: checklistRows.find((row) => row.blocker)?.blocker,
      },
      defaultSection,
    ],
  };
}

function readinessCategoryForLabel(label: string): DischargeChecklistCategory {
  if (label.includes("Diagnostic")) return "Diagnostics";
  if (label.includes("Medication")) return "Medication";
  if (label.includes("Nursing")) return "Nursing";
  if (label.includes("Billing")) return "Billing";
  if (label.includes("Legal")) return "Summary";
  return "Clinical";
}

function PremiumSummaryTab({
  plan,
  checklist,
  medications,
  readOnly,
  onFinalDischargeStatusChange,
  onClinicalFindingsChange,
}: {
  plan: DischargePatientPlan;
  checklist: DischargeChecklistItem[];
  medications: DischargeMedication[];
  readOnly: boolean;
  onFinalDischargeStatusChange: (value: DischargePatientPlan["finalDischargeStatus"]) => void;
  onClinicalFindingsChange: (clinicalFindings: string[]) => void;
}) {
  const progress = getChecklistProgress(checklist);
  const dischargeMeds = medications.filter((medication) => medication.dischargeMedication);
  const labs = getPremiumLabRows(plan);
  const procedures = getPremiumProcedureRows(plan);
  const alerts = getPremiumAlertRows(plan);
  const pendingReports = getPremiumPendingRows(plan);
  const pendingCount = pendingReports.filter((report) => report.status !== "Clear").length;
  const readinessItems = getSummaryReadinessItems(plan, checklist, medications, pendingReports);
  const completion = Math.round((readinessItems.filter((item) => item.status === "Complete").length / readinessItems.length) * 100);
  const [pdfPreviewOpen, setPdfPreviewOpen] = React.useState(false);

  const openPdfPreview = () => {
    setPdfPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      <SummaryExecutiveHeader
        plan={plan}
        completion={completion}
        pendingCount={pendingCount}
        onDownload={() => downloadDischargeSummaryPdf(plan, progress.percent, medications, dischargeMeds, labs, procedures, pendingReports)}
        onPreview={openPdfPreview}
      />
      <SummaryReadinessPanel items={readinessItems} completion={completion} />
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Discharge Summary Workbench</CardTitle>
              <CardDescription>Doctor-editable sections with live A4 preview</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Draft saved")}>
                <ClipboardCheck className="h-4 w-4" />
                Save Draft
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Hindi/regional patient instructions prepared")}>
                <Languages className="h-4 w-4" />
                Language
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadDischargeSummaryPdf(plan, progress.percent, medications, dischargeMeds, labs, procedures, pendingReports)}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button size="sm" variant="outline" onClick={openPdfPreview}>
                <Eye className="h-4 w-4" />
                Preview PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryStatusTile label="Summary No." value={getPremiumSummaryNo(plan)} tone="info" />
            <SummaryStatusTile label="Document status" value={plan.summaryStatus} tone={getDischargeTone(plan.summaryStatus)} />
            <SummaryStatusTile label="Version" value="v1.0 draft" tone="muted" />
            <SummaryStatusTile label="Lock state" value={plan.summaryStatus === "Signed" ? "Locked" : "Editable"} tone={plan.summaryStatus === "Signed" ? "success" : "warning"} />
            <label className="rounded-lg border border-border bg-background p-3 text-xs">
              <span className="font-medium text-muted-foreground">Discharge status</span>
              <select
                className={cn(inputClassName, "mt-2")}
                value={plan.finalDischargeStatus}
                disabled={readOnly}
                onChange={(event) => onFinalDischargeStatusChange(event.target.value as DischargePatientPlan["finalDischargeStatus"])}
              >
                <option value="Alive">Alive</option>
                <option value="Death">Death</option>
              </select>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Structured clinical editor</CardTitle>
              <CardDescription>Fast-fill sections mapped to EMR, MAR, lab, radiology, nursing, billing, and pharmacy data</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <details className="rounded-lg border border-border bg-background p-3" open>
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Diagnosis and clinical summary</summary>
              <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <Field label="Type of discharge" value={getDischargeTypeLabel(plan)} disabled />
                <Field label="Discharge status" value={plan.finalDischargeStatus} disabled />
                <Field label="Final diagnosis" value={plan.clinicalSummary.primaryDiagnosis} />
                <Field label="ICD-10 code" value={plan.department === "Pediatrics" ? "J45.901" : plan.department === "Orthopedics" ? "S52.90XA" : "Z04.9"} />
                <TextAreaField label="Chief complaints" value={`${plan.clinicalSummary.chiefComplaints}\nDuration: ${plan.clinicalSummary.complaintDuration}`} readOnly={false} onChange={() => undefined} />
                <TextAreaField label="History of present illness" value={plan.clinicalSummary.hpi} readOnly={false} onChange={() => undefined} />
                <TextAreaField label="Brief clinical history leading to admission" value={plan.clinicalSummary.briefClinicalHistory} readOnly={false} onChange={() => undefined} />
                <TextAreaField label="Past and medical history" value={`Past history: ${plan.clinicalSummary.pastHistory}\nMedical history: ${plan.clinicalSummary.medicalHistory}`} readOnly={false} onChange={() => undefined} />
                <TextAreaField label="Social history" value={plan.clinicalSummary.socialHistory} readOnly={false} onChange={() => undefined} />
                <TextAreaField label="Allergic history" value={plan.clinicalSummary.allergicHistory} readOnly={false} onChange={() => undefined} />
                <div className="xl:col-span-2">
                  <ClinicalFindingsEditor
                    findings={plan.clinicalSummary.clinicalFindings}
                    readOnly={readOnly}
                    onChange={onClinicalFindingsChange}
                  />
                </div>
                <TextAreaField label="Treatment provided during hospital course" value={plan.clinicalSummary.treatmentProvided} readOnly={false} onChange={() => undefined} />
              </div>
            </details>

            <details className="rounded-lg border border-border bg-background p-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Vitals, alerts, investigations and procedures</summary>
              <div className="mt-3 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <SummaryVital label="Temperature" value={plan.vitals.temp} />
                  <SummaryVital label="Pulse" value={plan.vitals.pulse} />
                  <SummaryVital label="Blood pressure" value={plan.vitals.bp} />
                  <SummaryVital label="SpO2" value={plan.vitals.spo2} />
                  <SummaryVital label="Recorded" value={plan.vitals.recordedAt} />
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                  {plan.clinicalSummary.conditionAtDischarge.map((condition) => (
                    <div className="rounded-md border border-success/30 bg-success/10 p-2 text-xs font-semibold text-success" key={condition}>
                      {condition}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {alerts.map((alert) => (
                    <Badge tone={alert.severity === "Severe" ? "danger" : alert.severity === "Moderate" ? "warning" : "muted"} key={alert.label}>
                      {alert.label} - {alert.severity}
                    </Badge>
                  ))}
                </div>
                <PremiumLabTable rows={labs} />
                <PremiumProcedureList rows={procedures} />
              </div>
            </details>

            <details className="rounded-lg border border-border bg-background p-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Medication, instructions, diet and follow-up</summary>
              <div className="mt-3 space-y-3">
                <PremiumMedicationGroups medications={dischargeMeds} />
                <div className="grid gap-3 xl:grid-cols-2">
                  <TextAreaField label="Patient instructions" value={plan.instructions.patientInstructions} readOnly={false} onChange={() => undefined} />
                  <TextAreaField label="Red flag symptoms" value={plan.instructions.warningSigns} readOnly={false} onChange={() => undefined} />
                  <TextAreaField label="Diet advice" value={plan.instructions.diet} readOnly={false} onChange={() => undefined} />
                  <TextAreaField label="Activity advice" value={plan.instructions.activity} readOnly={false} onChange={() => undefined} />
                  <TextAreaField label="Wound care" value={plan.instructions.woundCare} readOnly={false} onChange={() => undefined} />
                  <TextAreaField label="Lifestyle modifications" value={plan.instructions.lifestyle} readOnly={false} onChange={() => undefined} />
                </div>
              </div>
            </details>
          </CardContent>
        </Card>

        <PremiumA4Preview
          plan={plan}
          progress={progress.percent}
          dischargeMeds={dischargeMeds}
          admissionMeds={medications}
          labs={labs}
          procedures={procedures}
          alerts={alerts}
          pendingReports={pendingReports}
          onPreview={openPdfPreview}
        />
      </div>

      <Card className="h-fit 2xl:sticky 2xl:top-[88px]">
        <CardHeader>
          <div>
            <CardTitle>Patient and legal panel</CardTitle>
            <CardDescription>Approval context</CardDescription>
          </div>
          <StatusPill tone={getDischargeTone(plan.status)}>{plan.status}</StatusPill>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="font-semibold text-foreground">{plan.patientName}</div>
            <div className="mt-1 text-xs text-muted-foreground">{plan.uhid} | {plan.ageGender}</div>
            <div className="mt-1 text-xs text-muted-foreground">{plan.bed}, {plan.ward}</div>
            <div className="mt-1 text-xs text-muted-foreground">{plan.contactNumber}</div>
            <div className="mt-1 text-xs text-muted-foreground">Admit: {plan.admissionDateTime}</div>
            <div className="mt-1 text-xs text-muted-foreground">Discharge: {plan.dischargeDateTime}</div>
            <div className="mt-1 text-xs text-muted-foreground">{plan.consultant}</div>
          </div>
          <HandoverRow label="Billing" value={plan.billingStatus} />
          <HandoverRow label="Pharmacy" value={plan.pharmacyStatus} />
          <HandoverRow label="Nursing" value={plan.nurseClearance} />
          <HandoverRow label="Checklist" value={`${progress.percent}% complete`} />
          <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <QrCode className="h-4 w-4" />
              Digital verification
            </div>
            <div className="grid h-28 place-items-center rounded-md border border-dashed border-border bg-surface-muted">
              QR verification placeholder
            </div>
            <div className="mt-2">Summary No: {getPremiumSummaryNo(plan)}</div>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
            Finalized summaries are locked. Any correction must use amendment workflow with reason, approver, timestamp, and version history.
          </div>
        </CardContent>
      </Card>
      </div>
      <PdfPreviewModal
        open={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        onDownload={() => downloadDischargeSummaryPdf(plan, progress.percent, medications, dischargeMeds, labs, procedures, pendingReports)}
        plan={plan}
        progress={progress.percent}
        dischargeMeds={dischargeMeds}
        admissionMeds={medications}
        labs={labs}
        procedures={procedures}
        alerts={alerts}
        pendingReports={pendingReports}
      />
    </div>
  );
}

function SummaryReadinessPanel({ items, completion }: { items: SummaryReadinessItem[]; completion: number }) {
  const [previewDocument, setPreviewDocument] = React.useState<EvidenceDocument | null>(null);
  const reviewCount = items.filter((item) => item.status === "Review").length;
  const blockedCount = items.filter((item) => item.status === "Blocked").length;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="min-w-0">Summary readiness</CardTitle>
              <Badge tone="info">{completion}% complete</Badge>
              <Badge tone={blockedCount ? "danger" : "success"}>{blockedCount} blocked</Badge>
              <Badge tone={reviewCount ? "warning" : "success"}>{reviewCount} review</Badge>
            </div>
            <CardDescription className="mt-1">Connected with discharge checklist, MAR, nursing, billing, pending reports, and summary approval.</CardDescription>
          </div>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => toast.info("Checklist-connected validation completed")}>
            <ShieldCheck className="h-4 w-4" />
            Validate
          </Button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
        </div>
        <div className="grid min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div className="min-w-0 rounded-md border border-border bg-background p-2" key={item.label}>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <div className="break-words text-xs font-semibold text-foreground">{item.label}</div>
                  <div className="mt-0.5 break-words text-[11px] text-muted-foreground">{item.source} - {item.detail}</div>
                </div>
                <div className="shrink-0">
                  <StatusPill tone={summaryReadinessTone(item.status)}>{item.status}</StatusPill>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                <Button size="sm" variant="outline" onClick={() => setPreviewDocument(item.evidence)}>
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadEvidenceDocument(item.evidence)}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <EvidencePreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
    </Card>
  );
}

function EvidencePreviewModal({ document, onClose }: { document: EvidenceDocument | null; onClose: () => void }) {
  return (
    <Dialog.Root open={Boolean(document)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(94vw,760px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          {document ? (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <Dialog.Title className="truncate text-sm font-semibold text-foreground">{document.title}</Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-muted-foreground">{document.subtitle}</Dialog.Description>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {document.status ? <StatusPill tone={getDischargeTone(document.status)}>{document.status}</StatusPill> : null}
                  <Dialog.Close asChild>
                    <Button size="icon" variant="ghost" aria-label="Close evidence preview">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <div className="space-y-3">
                  {document.sections.map((section) => (
                    <div className="rounded-lg border border-border bg-background p-3" key={section.title}>
                      <div className="text-sm font-semibold text-foreground">{section.title}</div>
                      <div className="mt-3 grid gap-2">
                        {section.rows.map((row) => (
                          <div className="grid gap-1 rounded-md border border-border bg-surface-muted p-2 text-sm sm:grid-cols-[170px_1fr]" key={`${section.title}-${row.label}`}>
                            <div className="font-medium text-muted-foreground">{row.label}</div>
                            <div className="text-foreground">{row.value || "-"}</div>
                          </div>
                        ))}
                      </div>
                      {section.note ? <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">{section.note}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-border p-3">
                <Button variant="outline" onClick={() => downloadEvidenceDocument(document)}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button onClick={onClose}>Done</Button>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function downloadEvidenceDocument(document: EvidenceDocument) {
  const text = evidenceDocumentToText(document);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugifyFileName(document.title)}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast.success(`${document.title} downloaded`);
}

function evidenceDocumentToText(document: EvidenceDocument) {
  const lines = [
    document.title,
    document.subtitle,
    document.status ? `Status: ${document.status}` : "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
  ];

  document.sections.forEach((section) => {
    lines.push(section.title);
    section.rows.forEach((row) => lines.push(`${row.label}: ${row.value || "-"}`));
    if (section.note) lines.push(`Note: ${section.note}`);
    lines.push("");
  });

  return lines.filter(Boolean).join("\n");
}

function slugifyFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "discharge-evidence";
}

function SummaryExecutiveHeader({
  plan,
  completion,
  pendingCount,
  onDownload,
  onPreview,
}: {
  plan: DischargePatientPlan;
  completion: number;
  pendingCount: number;
  onDownload: () => void;
  onPreview: () => void;
}) {
  return (
    <Card className="overflow-hidden border-primary/20">
      <div className="border-b border-border bg-gradient-to-r from-primary/10 via-surface to-success/10 px-4 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">Discharge Summary</Badge>
              <Badge tone={plan.summaryStatus === "Signed" ? "success" : "warning"}>{plan.summaryStatus}</Badge>
              <Badge tone={pendingCount ? "warning" : "success"}>{pendingCount ? `${pendingCount} pending` : "No pending reports"}</Badge>
            </div>
            <h2 className="mt-2 truncate text-xl font-semibold text-foreground">{plan.patientName} discharge document</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {getPremiumSummaryNo(plan)} | {plan.uhid} | {plan.admissionId} | {plan.consultant}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[460px]">
            <SummaryHeroMetric label="Completion" value={`${completion}%`} />
            <SummaryHeroMetric label="Discharge type" value={getDischargeTypeLabel(plan)} />
            <SummaryHeroMetric label="Status" value={plan.finalDischargeStatus} />
          </div>
        </div>
      </div>
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="text-sm text-muted-foreground">
          Doctor-editable clinical summary, patient-friendly medicine advice, legal sign-off, QR verification, and A4 PDF export are managed from this workspace.
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4" />
            Preview PDF
          </Button>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryHeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/85 p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function getPremiumSummaryNo(plan: DischargePatientPlan) {
  return `DS-${plan.uhid.replace(/[^A-Z0-9]/gi, "")}-${plan.id.slice(-3).toUpperCase()}`;
}

function getDischargeTypeLabel(plan: DischargePatientPlan) {
  if (plan.dischargeType === "Transfer") return "Referred";
  if (plan.dischargeType === "LAMA" || plan.dischargeType === "Against advice") return "LAMA / Against Medical Advice";
  if (plan.dischargeType === "Day care") return "Normal - Day care";
  if (plan.dischargeType === "Deceased") return "Others - Deceased";
  return "Normal";
}

function getConditionAtDischargeText(plan: DischargePatientPlan) {
  return plan.clinicalSummary.conditionAtDischarge.join(", ");
}

function getClinicalFindingRows(plan: DischargePatientPlan) {
  return plan.clinicalSummary.clinicalFindings.map((finding) => finding.trim()).filter(Boolean);
}

function getClinicalFindingsText(plan: DischargePatientPlan) {
  const rows = getClinicalFindingRows(plan);
  return rows.length ? rows.map((finding, index) => `${index + 1}. ${finding}`).join("\n") : "No clinical finding recorded.";
}

function getPremiumLabRows(plan: DischargePatientPlan) {
  if (plan.department === "Orthopedics") {
    return [
      { test: "Hemoglobin", sampleAt: "28 May 2026, 07:30 AM", value: "11.6", unit: "g/dL", range: "13.0-17.0", flag: "Low", remark: "Post-procedure monitoring" },
      { test: "Creatinine", sampleAt: "28 May 2026, 07:30 AM", value: "0.9", unit: "mg/dL", range: "0.7-1.3", flag: "Normal", remark: "Reviewed" },
      { test: "X-Ray limb", sampleAt: "28 May 2026, 09:00 AM", value: "Aligned", unit: "-", range: "-", flag: "Normal", remark: "Cast position acceptable" },
    ];
  }
  if (plan.department === "Emergency") {
    return [
      { test: "ABG lactate", sampleAt: "28 May 2026, 10:10 AM", value: "2.4", unit: "mmol/L", range: "0.5-2.2", flag: "High", remark: "Repeat advised before transfer" },
      { test: "CBC - WBC", sampleAt: "28 May 2026, 10:05 AM", value: "12.8", unit: "10^3/uL", range: "4.0-11.0", flag: "High", remark: "Clinical correlation required" },
    ];
  }
  return [
    { test: "CBC - WBC", sampleAt: "28 May 2026, 08:10 AM", value: "8.4", unit: "10^3/uL", range: "4.0-11.0", flag: "Normal", remark: "Within acceptable range" },
    { test: "CRP", sampleAt: "28 May 2026, 08:10 AM", value: "5.2", unit: "mg/L", range: "<6", flag: "Normal", remark: "No acute concern" },
    { test: "Serum potassium", sampleAt: "27 May 2026, 07:40 PM", value: "4.1", unit: "mmol/L", range: "3.5-5.1", flag: "Normal", remark: "Reviewed" },
  ];
}

function getPremiumProcedureRows(plan: DischargePatientPlan) {
  if (plan.department === "Orthopedics") {
    return [{ name: "Closed reduction and immobilization", at: "27 May 2026, 03:20 PM", doctor: plan.consultant, finding: "Alignment acceptable", advice: "Non-weight-bearing mobilization" }];
  }
  if (plan.department === "Emergency") {
    return [{ name: "Emergency stabilization", at: "28 May 2026, 10:20 AM", doctor: "Emergency Team", finding: "Hemodynamically stable", advice: "Transfer with monitored handover" }];
  }
  return [{ name: "Nebulization and observation", at: "27 May 2026, 07:30 PM", doctor: plan.consultant, finding: "Symptoms improved", advice: "Use spacer with inhaler" }];
}

function getPremiumAlertRows(plan: DischargePatientPlan) {
  const riskRows = plan.riskFlags.map((flag, index) => ({ label: flag, severity: index === 0 ? "Moderate" : "Mild" }));
  return riskRows.length ? riskRows : [{ label: "No active allergy recorded", severity: "Mild" }];
}

function getPremiumPendingRows(plan: DischargePatientPlan) {
  if (plan.department === "Emergency") {
    return [
      { item: "Identity confirmation", expectedAt: "Before transfer", owner: "Emergency desk", contact: "ER coordinator", status: "Pending" },
      { item: "Transfer acceptance note", expectedAt: "Pending", owner: "Emergency consultant", contact: "Transfer desk", status: "Blocked" },
    ];
  }
  if (plan.department === "Orthopedics") {
    return [{ item: "Insurance implant query", expectedAt: "28 May 2026, 06:00 PM", owner: "Billing desk", contact: "TPA coordinator", status: "Pending" }];
  }
  return [{ item: "No pending critical report", expectedAt: "Not applicable", owner: "Doctor", contact: "OPD desk", status: "Clear" }];
}

function premiumLabTone(flag: string): StatusTone {
  if (flag === "Critical") return "critical";
  if (["High", "Low"].includes(flag)) return "warning";
  if (flag === "Normal") return "success";
  return "info";
}

async function downloadDischargeSummaryPdf(
  plan: DischargePatientPlan,
  progress: number,
  admissionMeds: DischargeMedication[],
  dischargeMeds: DischargeMedication[],
  labs: ReturnType<typeof getPremiumLabRows>,
  procedures: ReturnType<typeof getPremiumProcedureRows>,
  pendingReports: ReturnType<typeof getPremiumPendingRows>,
) {
  const toastId = toast.loading("Preparing discharge PDF...");
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const alerts = getPremiumAlertRows(plan);

    container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-12000px";
    container.style.top = "0";
    container.style.width = "826px";
    container.style.background = "#f1f5f9";
    container.style.pointerEvents = "none";
    container.style.zIndex = "-1";
    document.body.appendChild(container);

    root = createRoot(container);
    flushSync(() => {
      root?.render(
        <div className="space-y-5 bg-slate-100 p-4">
          <DischargeSummaryPdfPages
            plan={plan}
            progress={progress}
            dischargeMeds={dischargeMeds}
            admissionMeds={admissionMeds}
            labs={labs}
            procedures={procedures}
            alerts={alerts}
            pendingReports={pendingReports}
          />
        </div>,
      );
    });

    await waitForPdfPaint();
    const pageElements = Array.from(container.querySelectorAll<HTMLElement>("[data-discharge-pdf-page='true']"));
    if (!pageElements.length) throw new Error("PDF pages are not available.");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (const [index, pageElement] of pageElements.entries()) {
      const canvas = await html2canvas(pageElement, {
        backgroundColor: "#ffffff",
        logging: false,
        scale: 2,
        useCORS: true,
        windowWidth: pageElement.scrollWidth,
        windowHeight: pageElement.scrollHeight,
      });
      const imageData = canvas.toDataURL("image/png");
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const renderWidth = canvas.width * ratio;
      const renderHeight = canvas.height * ratio;
      const x = (pdfWidth - renderWidth) / 2;

      if (index > 0) pdf.addPage();
      pdf.addImage(imageData, "PNG", x, 0, renderWidth, renderHeight, undefined, "FAST");
    }

    pdf.save(`${getPremiumSummaryNo(plan)}.pdf`);
    toast.success("PDF downloaded like preview", { id: toastId });
  } catch (error) {
    console.error(error);
    toast.error("PDF download failed. Please use Preview PDF > Print for now.", { id: toastId });
  } finally {
    root?.unmount();
    container?.remove();
  }
}

async function waitForPdfPaint() {
  if ("fonts" in document) {
    await document.fonts.ready;
  }
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function SummaryStatusTile({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">{value}</div>
      <div className="mt-2"><StatusPill tone={tone}>{value}</StatusPill></div>
    </div>
  );
}

function SummaryVital({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-2">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function PremiumLabTable({ rows }: { rows: ReturnType<typeof getPremiumLabRows> }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="bg-surface-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Lab / radiology</th>
            <th className="px-3 py-2">Sample date/time</th>
            <th className="px-3 py-2">Result</th>
            <th className="px-3 py-2">Reference</th>
            <th className="px-3 py-2">Flag</th>
            <th className="px-3 py-2">Doctor remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border" key={`${row.test}-${row.sampleAt}`}>
              <td className="px-3 py-2 font-medium text-foreground">{row.test}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.sampleAt}</td>
              <td className="px-3 py-2">{row.value} {row.unit}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.range}</td>
              <td className="px-3 py-2"><StatusPill tone={premiumLabTone(row.flag)}>{row.flag}</StatusPill></td>
              <td className="px-3 py-2 text-muted-foreground">{row.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PremiumProcedureList({ rows }: { rows: ReturnType<typeof getPremiumProcedureRows> }) {
  return (
    <div className="grid gap-2 xl:grid-cols-2">
      {rows.map((row) => (
        <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm" key={row.name}>
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.at} | {row.doctor}</div>
          <div className="mt-2 text-xs text-muted-foreground">Finding: {row.finding}</div>
          <div className="text-xs text-muted-foreground">Advice: {row.advice}</div>
        </div>
      ))}
    </div>
  );
}

function PremiumMedicationGroups({ medications }: { medications: DischargeMedication[] }) {
  const groups = [
    { label: "Continue these medicines", rows: medications.filter((medication) => medication.status === "Continue") },
    { label: "New medicines started at discharge", rows: medications.filter((medication) => medication.status === "New") },
    { label: "Changed / hold medicines", rows: medications.filter((medication) => ["Changed", "Hold"].includes(medication.status)) },
  ];
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      {groups.map((group) => (
        <div className="rounded-lg border border-border bg-background p-3" key={group.label}>
          <div className="text-sm font-semibold text-foreground">{group.label}</div>
          <div className="mt-2 space-y-2">
            {group.rows.length ? group.rows.map((medication) => (
              <div className="rounded-md bg-surface-muted p-2 text-xs" key={medication.id}>
                <div className="font-semibold text-foreground">{medication.medicine}</div>
                <div className="mt-1 text-muted-foreground">{medication.dose} | {medication.frequency} | {medication.duration}</div>
                <div className="mt-1 text-muted-foreground">{medication.instructions}</div>
              </div>
            )) : <div className="text-xs text-muted-foreground">No medicine in this group.</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PremiumA4Preview({
  plan,
  progress,
  dischargeMeds,
  admissionMeds,
  labs,
  procedures,
  alerts,
  pendingReports,
  onPreview,
}: {
  plan: DischargePatientPlan;
  progress: number;
  dischargeMeds: DischargeMedication[];
  admissionMeds: DischargeMedication[];
  labs: ReturnType<typeof getPremiumLabRows>;
  procedures: ReturnType<typeof getPremiumProcedureRows>;
  alerts: ReturnType<typeof getPremiumAlertRows>;
  pendingReports: ReturnType<typeof getPremiumPendingRows>;
  onPreview: () => void;
}) {
  return (
    <Card>
      <details>
        <summary className="flex cursor-pointer flex-col gap-3 border-b border-border px-[var(--density-card-header-x)] py-[var(--density-card-header-y)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>A4 PDF preview</CardTitle>
            <CardDescription>Collapsed by default to keep the workspace light. Expand only when checking print layout.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={(event) => { event.preventDefault(); downloadDischargeSummaryPdf(plan, progress, admissionMeds, dischargeMeds, labs, procedures, pendingReports); }}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button size="sm" variant="outline" onClick={(event) => { event.preventDefault(); onPreview(); }}>
              <Eye className="h-4 w-4" />
              Preview PDF
            </Button>
          </div>
        </summary>
        <CardContent className="space-y-5 bg-surface-muted">
          <DischargeSummaryPdfPages
            plan={plan}
            progress={progress}
            dischargeMeds={dischargeMeds}
            admissionMeds={admissionMeds}
            labs={labs}
            procedures={procedures}
            alerts={alerts}
            pendingReports={pendingReports}
          />
        </CardContent>
      </details>
    </Card>
  );
}

function DischargeSummaryPdfPages({
  plan,
  progress,
  dischargeMeds,
  admissionMeds,
  labs,
  procedures,
  alerts,
  pendingReports,
}: {
  plan: DischargePatientPlan;
  progress: number;
  dischargeMeds: DischargeMedication[];
  admissionMeds: DischargeMedication[];
  labs: ReturnType<typeof getPremiumLabRows>;
  procedures: ReturnType<typeof getPremiumProcedureRows>;
  alerts: ReturnType<typeof getPremiumAlertRows>;
  pendingReports: ReturnType<typeof getPremiumPendingRows>;
}) {
  return (
    <>
      <PdfPage>
        <PdfHeader plan={plan} progress={progress} />
        <PdfSection title="Patient Details">
          <div className="grid gap-2 text-[11px] sm:grid-cols-2">
            <PdfLine label="Name" value={plan.patientName} />
            <PdfLine label="UHID / MRN" value={plan.uhid} />
            <PdfLine label="Age / Sex" value={plan.ageGender} />
            <PdfLine label="Contact" value={plan.contactNumber} />
            <PdfLine label="Address" value={plan.address} />
            <PdfLine label="Ward / Bed" value={`${plan.ward}, ${plan.bed}`} />
          </div>
        </PdfSection>
        <PdfSection title="Type of Discharge">
          <PdfParagraph title="Type" value={getDischargeTypeLabel(plan)} />
        </PdfSection>
        <PdfSection title="Admission Details">
          <div className="grid gap-2 text-[11px] sm:grid-cols-2">
            <PdfLine label="Admission" value={plan.admissionDateTime} />
            <PdfLine label="Discharge" value={plan.dischargeDateTime} />
            <PdfLine label="Admitting consultant" value={plan.admittingConsultant} />
            <PdfLine label="Department" value={plan.department} />
            <PdfLine label="Specialty" value={plan.specialty} />
            <PdfLine label="Encounter" value={plan.admissionId} />
          </div>
        </PdfSection>
        <PdfSection title="Diagnosis">
          <PdfParagraph title="Primary diagnosis" value={plan.clinicalSummary.primaryDiagnosis} />
          <PdfParagraph title="Secondary diagnoses / comorbidities" value={plan.clinicalSummary.secondaryDiagnosis} />
          <PdfParagraph title="Discharge status" value={plan.finalDischargeStatus} />
        </PdfSection>
        <PdfFooter pageNo={1} />
      </PdfPage>

      <PdfPage>
        <PdfHeader plan={plan} progress={progress} compact />
        <PdfSection title="Chief Complaints">
          <PdfParagraph title="Duration and presenting symptoms" value={`${plan.clinicalSummary.complaintDuration}; ${plan.clinicalSummary.chiefComplaints}`} />
          <PdfParagraph title="History of present illness" value={plan.clinicalSummary.hpi} />
          <PdfParagraph title="Brief clinical history leading to admission" value={plan.clinicalSummary.briefClinicalHistory} />
          <PdfParagraph title="Past history" value={plan.clinicalSummary.pastHistory} />
          <PdfParagraph title="Medical history" value={plan.clinicalSummary.medicalHistory} />
          <PdfParagraph title="Social history" value={plan.clinicalSummary.socialHistory} />
          <PdfParagraph title="Allergic history" value={plan.clinicalSummary.allergicHistory} />
        </PdfSection>
        <PdfSection title="Hospital Course">
          <div className="mt-2 text-xs leading-5">
            <div className="font-semibold">Clinical findings:</div>
            <PdfNumberedList rows={getClinicalFindingRows(plan)} />
          </div>
          <PdfParagraph title="Treatment provided during hospital course" value={plan.clinicalSummary.treatmentProvided} />
        </PdfSection>
        <PdfSection title="Condition at Discharge">
          <div className="grid gap-2 text-[11px] sm:grid-cols-3">
            {plan.clinicalSummary.conditionAtDischarge.map((condition) => (
              <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 font-semibold text-emerald-700" key={condition}>
                {condition}
              </div>
            ))}
          </div>
        </PdfSection>
        <PdfFooter pageNo={2} />
      </PdfPage>

      <PdfPage>
        <PdfHeader plan={plan} progress={progress} compact />
        <PdfSection title="Vitals, Investigations and Procedures">
          <div className="grid gap-2 text-[11px] sm:grid-cols-5">
            <PdfMetric label="Temp" value={plan.vitals.temp} />
            <PdfMetric label="Pulse" value={plan.vitals.pulse} />
            <PdfMetric label="BP" value={plan.vitals.bp} />
            <PdfMetric label="SpO2" value={plan.vitals.spo2} />
            <PdfMetric label="Recorded" value={plan.vitals.recordedAt} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {alerts.map((alert) => <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px]" key={alert.label}>{alert.label}</span>)}
          </div>
          <PdfTable headers={["Test", "Date/time", "Value", "Range", "Flag"]} rows={labs.map((row) => [row.test, row.sampleAt, `${row.value} ${row.unit}`, row.range, row.flag])} />
          <PdfTable headers={["Procedure name", "Date", "Surgeon / consultant", "Finding", "Advice"]} rows={procedures.map((row) => [row.name, row.at, row.doctor, row.finding, row.advice])} />
        </PdfSection>
        <PdfSection title="Medication During Admission">
          <PdfTable headers={["Medication", "Dose", "Route", "Frequency", "Status"]} rows={admissionMeds.map((row) => [row.medicine, row.dose, row.route, row.frequency, row.status])} />
        </PdfSection>
        <PdfSection title="Medication at the Time of Discharge">
          <PdfTable headers={["Medication", "Dose", "Route", "Frequency", "Duration", "Advice"]} rows={dischargeMeds.map((row) => [row.medicine, row.dose, row.route, row.frequency, row.duration, row.instructions])} />
        </PdfSection>
        <PdfFooter pageNo={3} />
      </PdfPage>

      <PdfPage>
        <PdfHeader plan={plan} progress={progress} compact />
        <PdfSection title="Discharge Advice">
          <PdfParagraph title="General advice" value={plan.instructions.patientInstructions} />
          <PdfParagraph title="Diet" value={plan.instructions.diet} />
          <PdfParagraph title="Activity restrictions" value={plan.instructions.activity} />
          <PdfParagraph title="Wound care" value={plan.instructions.woundCare} />
          <PdfParagraph title="Lifestyle modifications" value={plan.instructions.lifestyle} />
          <PdfParagraph title="Warning signs requiring urgent medical attention" value={plan.instructions.warningSigns} />
        </PdfSection>
        <PdfSection title="Follow-Up">
          <div className="grid gap-2 text-[11px] sm:grid-cols-2">
            <PdfLine label="Follow-up date" value={`${plan.followUp.date} ${plan.followUp.time}`} />
            <PdfLine label="Department" value={plan.followUp.department} />
            <PdfLine label="Consultant" value={plan.followUp.physician} />
            <PdfLine label="Mode" value={plan.followUp.mode} />
          </div>
          <PdfTable headers={["Pending investigation", "Expected", "Owner", "Contact", "Status"]} rows={pendingReports.map((row) => [row.item, row.expectedAt, row.owner, row.contact, row.status])} />
        </PdfSection>
        <PdfSection title="Consultant Signature">
          <div className="grid gap-3 text-[11px] sm:grid-cols-4">
            <div className="rounded border border-slate-300 p-2">
              <div className="text-slate-500">Name</div>
              <div className="mt-2 font-semibold">{plan.consultantSignature.name}</div>
            </div>
            <div className="rounded border border-slate-300 p-2">
              <div className="text-slate-500">Registration number</div>
              <div className="mt-2 font-semibold">{plan.consultantSignature.registrationNumber}</div>
            </div>
            <div className="rounded border border-slate-300 p-2">
              <div className="text-slate-500">Date</div>
              <div className="mt-2 font-semibold">{plan.consultantSignature.date}</div>
            </div>
            <div className="h-20 rounded border border-slate-300 p-2">
              <div className="text-slate-500">Signature</div>
              <div className="mt-8 border-t border-slate-300 pt-1">Signed by consultant</div>
            </div>
          </div>
        </PdfSection>
        <PdfFooter pageNo={4} />
      </PdfPage>
    </>
  );
}

function PdfPage({ children }: { children: React.ReactNode }) {
  return (
    <section data-discharge-pdf-page="true" className="mx-auto min-h-[1123px] w-full max-w-[794px] border-l-4 border-blue-700 bg-white p-8 text-slate-950 shadow-sm ring-1 ring-slate-200 print:min-h-screen print:max-w-none print:rounded-none print:border-l-0 print:p-6 print:shadow-none print:ring-0">
      {children}
    </section>
  );
}

function PdfHeader({ plan, progress, compact }: { plan: DischargePatientPlan; progress: number; compact?: boolean }) {
  return (
    <header className="border-b-2 border-blue-700 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-sm font-bold text-blue-700">PH</div>
          <div>
            <div className="text-lg font-bold">{hospitalProfile.name}</div>
            <div className="text-xs text-slate-600">{hospitalProfile.branch} | {hospitalProfile.accreditation}</div>
            <div className="mt-1 text-[11px] text-slate-500">{hospitalProfile.address} | {hospitalProfile.phone}</div>
            <div className="text-[11px] text-slate-500">{hospitalProfile.email} | {hospitalProfile.website}</div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-right text-[11px] text-slate-600">
          <div className="text-sm font-bold uppercase text-blue-800">Discharge Summary</div>
          <div>Summary No: {getPremiumSummaryNo(plan)}</div>
          <div>Generated: 28 May 2026, 06:30 PM</div>
          <div>Completion: {progress}%</div>
        </div>
      </div>
      {!compact ? (
        <div className="mt-4 grid gap-2 text-[11px] sm:grid-cols-[1fr_120px_150px]">
          <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <b>UHID:</b> {plan.uhid} | <b>IPD:</b> {plan.admissionId} | <b>Patient:</b> {plan.patientName}
          </div>
          <div className="grid h-20 place-items-center rounded border border-dashed border-slate-300">
            <QrCode className="h-8 w-8 text-slate-500" />
          </div>
          <div className="rounded border border-slate-200 p-2">
            <div className="h-8 bg-[repeating-linear-gradient(90deg,#0f172a_0_2px,transparent_2px_5px)]" />
            <div className="mt-1 text-center text-[10px]">{plan.uhid}</div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function PdfSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <div className="border-b border-slate-200 pb-1 text-sm font-bold uppercase tracking-wide text-slate-800">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function PdfLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[135px_1fr] gap-2 rounded border border-slate-200 px-2 py-1">
      <span className="font-semibold text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PdfMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-2">
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function PdfParagraph({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-2 text-xs leading-5">
      <span className="font-semibold">{title}: </span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

function PdfNumberedList({ rows }: { rows: string[] }) {
  const visibleRows = rows.length ? rows : ["No clinical finding recorded."];
  return (
    <div className="mt-1 space-y-1 text-slate-700">
      {visibleRows.map((row, index) => (
        <div className="grid grid-cols-[20px_1fr] gap-1" key={`${row}-${index}`}>
          <span className="font-semibold text-slate-500">{index + 1}.</span>
          <span>{row}</span>
        </div>
      ))}
    </div>
  );
}

function PdfTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 overflow-hidden rounded border border-slate-200">
      <table className="w-full text-left text-[10px]">
        <thead className="bg-slate-100 text-slate-600">
          <tr>{headers.map((header) => <th className="px-2 py-1.5" key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="border-t border-slate-200" key={`${row.join("-")}-${rowIndex}`}>
              {row.map((cell, cellIndex) => <td className="px-2 py-1.5 align-top" key={`${cell}-${cellIndex}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PdfFooter({ pageNo, totalPages = 4 }: { pageNo: number; totalPages?: number }) {
  return (
    <footer className="mt-6 flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-500">
      <span>Digitally verifiable document. Use QR code to verify authenticity.</span>
      <span>Page {pageNo} of {totalPages}</span>
    </footer>
  );
}

function PdfPreviewModal({
  open,
  onClose,
  onDownload,
  plan,
  progress,
  dischargeMeds,
  admissionMeds,
  labs,
  procedures,
  alerts,
  pendingReports,
}: {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  plan: DischargePatientPlan;
  progress: number;
  dischargeMeds: DischargeMedication[];
  admissionMeds: DischargeMedication[];
  labs: ReturnType<typeof getPremiumLabRows>;
  procedures: ReturnType<typeof getPremiumProcedureRows>;
  alerts: ReturnType<typeof getPremiumAlertRows>;
  pendingReports: ReturnType<typeof getPremiumPendingRows>;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[94dvh] w-[min(96vw,1180px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold text-foreground">Discharge Summary Preview</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Native A4 preview of the same structured content used for PDF download.
              </Dialog.Description>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Dialog.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Close preview">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>
          <div className="grid min-h-0 flex-1 overflow-hidden bg-slate-100 lg:grid-cols-[240px_1fr]">
            <aside className="hidden border-r border-border bg-surface p-3 lg:block">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-sm font-semibold text-foreground">{plan.patientName}</div>
                <div className="mt-1 text-xs text-muted-foreground">{plan.uhid} | {plan.admissionId}</div>
                <div className="mt-2"><StatusPill tone={getDischargeTone(plan.status)}>{plan.status}</StatusPill></div>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                {["Page 1: Patient, admission & diagnosis", "Page 2: History, course & condition", "Page 3: Procedures & medicines", "Page 4: Advice, follow-up & signature"].map((item) => (
                  <div className="rounded-md border border-border bg-background p-2 text-muted-foreground" key={item}>{item}</div>
                ))}
              </div>
            </aside>
            <div className="min-h-0 overflow-auto p-4">
              <div className="space-y-5">
                <DischargeSummaryPdfPages
                  plan={plan}
                  progress={progress}
                  dischargeMeds={dischargeMeds}
                  admissionMeds={admissionMeds}
                  labs={labs}
                  procedures={procedures}
                  alerts={alerts}
                  pendingReports={pendingReports}
                />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AuditTab({ events }: { events: DischargeAuditEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Discharge audit log</CardTitle>
          <CardDescription>Status changes, user actions, owner updates, and clearance trail</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-[170px_1fr_160px]" key={event.id}>
            <div>
              <div className="text-sm font-semibold text-foreground">{event.at}</div>
              <div className="text-xs text-muted-foreground">{event.by} | {event.role}</div>
            </div>
            <div>
              <div className="font-medium text-foreground">{event.event}</div>
              <div className="mt-1 text-sm text-muted-foreground">{event.note}</div>
            </div>
            <div className="md:text-right">
              <StatusPill tone={auditTone(event.severity)}>{event.severity}</StatusPill>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function auditTone(severity: DischargeAuditEvent["severity"]): StatusTone {
  if (severity === "Critical") return "critical";
  if (severity === "Warning") return "warning";
  return "info";
}
