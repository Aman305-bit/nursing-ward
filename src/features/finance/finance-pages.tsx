"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Banknote,
  BarChart3,
  Building2,
  CreditCard,
  FileCheck2,
  FileClock,
  Landmark,
  Percent,
  Printer,
  ReceiptText,
  RefreshCcw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import { PatientMini } from "@/features/appointments/appointment-shared";
import {
  AmountWarning,
  BillingPatientHeader,
  FinanceSafetyBanner,
  FinanceStatus,
  PayerContextCard,
  ProtectedFinance,
  type FinanceModule,
} from "@/features/finance/finance-shared";
import {
  getBillById,
  getInvoiceById,
  mockAdvances,
  mockBankEntries,
  mockBillLines,
  mockBillingPackages,
  mockBillingRecords,
  mockBillingTariffs,
  mockCashCounters,
  mockClaimRejections,
  mockClaims,
  mockClaimSettlements,
  mockCreditBills,
  mockDiscountRequests,
  mockExpenses,
  mockInvoices,
  mockPatientPolicies,
  mockPayments,
  mockPreauthorizations,
  mockReceipts,
  mockRefunds,
  mockRevenueSummaries,
} from "@/data/finance";
import { getPatientById } from "@/data/patients";
import type { BillingRecord, ClaimRecord, InvoiceRecord } from "@/types";

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">{children}</div>;
}

function FinanceShell({
  module,
  title,
  description,
  icon: Icon,
  children,
  actions,
}: {
  module: FinanceModule;
  title: string;
  description: string;
  icon: typeof CreditCard;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <ProtectedFinance module={module}>
      {() => (
        <>
          <PageHeader
            eyebrow={`Phase 10 • ${module === "billing" ? "Billing" : module === "finance" ? "Finance" : "Insurance / TPA"}`}
            title={title}
            description={description}
            actions={
              actions ?? (
                <>
                  <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
                  <Button variant="outline" onClick={() => toast.info("Static Phase 10 data refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
                  <Button><Icon className="h-4 w-4" />Open workflow</Button>
                </>
              )
            }
          />
          {children}
        </>
      )}
    </ProtectedFinance>
  );
}

export function BillingDashboardPage() {
  return (
    <FinanceShell module="billing" title="Billing" description="Billing summary, pending bills, collections, discounts, refunds, advances, credit, insurance/TPA pending, and cash counter status." icon={CreditCard} actions={<><Button variant="outline" asChild><Link href="/billing/opd">Create OPD bill</Link></Button><Button variant="outline" asChild><Link href="/billing/payments">Collect payment</Link></Button><Button asChild><Link href="/billing/worklist">Open worklist</Link></Button></>}>
      <SummaryGrid>
        <StatCard label="Pending bills" value={mockBillingRecords.filter((item) => item.status === "Pending" || item.status === "Ready to bill").length} change="Action" context="Worklist" tone="warning" icon={ReceiptText} />
        <StatCard label="Finalized today" value={mockBillingRecords.filter((item) => item.status === "Finalized" || item.status === "Paid").length} change="Today" context="Invoices" tone="success" icon={FileCheck2} />
        <StatCard label="Collections" value={mockPayments.reduce((sum, item) => sum + item.amount, 0)} change="Today" context="Cash/UPI/card" tone="success" icon={WalletCards} currency />
        <StatCard label="Partial payments" value={mockBillingRecords.filter((item) => item.status === "Partially paid").length} change="Follow up" context="Receivable" tone="info" icon={CreditCard} />
        <StatCard label="Refunds" value={mockRefunds.filter((item) => item.status !== "Paid").length} change="Approval" context="Queue" tone="danger" icon={Banknote} />
        <StatCard label="Discounts" value={mockDiscountRequests.filter((item) => item.status === "Requested").length} change="Pending" context="Audit" tone="warning" icon={Percent} />
        <StatCard label="Credit due" value={mockCreditBills.reduce((sum, item) => sum + item.outstandingAmount, 0)} change="Outstanding" context="Credit" tone="critical" icon={FileClock} currency />
        <StatCard label="Claims pending" value={mockClaims.filter((item) => item.status !== "Settled").length} change="Insurance" context="Claim desk" tone="info" icon={Landmark} />
        <StatCard label="Overdue" value={mockBillingRecords.filter((item) => item.status === "Overdue").length} change="Escalate" context="Bills" tone="critical" icon={ShieldCheck} />
        <StatCard label="Advances" value={mockAdvances.reduce((sum, item) => sum + item.balanceAmount, 0)} change="Balance" context="Available" tone="muted" icon={Banknote} currency />
      </SummaryGrid>
      <FinanceSafetyBanner module="billing" />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <BillingWorklistPage embedded />
        <div className="space-y-4"><CollectionModeCard /><QueueLinks /></div>
      </div>
    </FinanceShell>
  );
}

export function BillingWorklistPage({ embedded }: { embedded?: boolean }) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<BillingRecord | null>(null);
  const rows = mockBillingRecords.filter((bill) => {
    const patient = getPatientById(bill.patientId);
    const text = `${bill.billNo} ${patient?.firstName} ${patient?.lastName} ${patient?.uhid} ${bill.source} ${bill.department} ${bill.payerType} ${bill.status}`;
    return includes(text, search) && (status === "All status" || bill.status === status);
  });
  const columns = React.useMemo<ColumnDef<BillingRecord>[]>(() => [
    { header: "Bill ref", accessorKey: "billNo" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "UHID", cell: ({ row }) => getPatientById(row.original.patientId)?.uhid ?? "Unknown" },
    { header: "Source", accessorKey: "source" },
    { header: "Visit/admission", cell: ({ row }) => row.original.admissionId || row.original.visitId },
    { header: "Department", accessorKey: "department" },
    { header: "Amount", cell: ({ row }) => money(row.original.netAmount) },
    { header: "Payer", accessorKey: "payerType" },
    { header: "Status", cell: ({ row }) => <FinanceStatus status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], [setSelected]);
  const content = <><FilterBar search={search} onSearch={setSearch} placeholder="Search bill, patient, UHID, source, payer, status..."><NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Draft", "Pending", "Ready to bill", "Finalized", "Partially paid", "Paid", "Overdue", "Cancelled", "Revised"]} /></FilterBar><DataTable data={rows} columns={columns} /><BillDrawer bill={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></>;
  if (embedded) return <Card className="min-w-0"><CardContent className="min-w-0 space-y-3 p-3"><div className="font-semibold">Pending billing worklist</div>{content}</CardContent></Card>;
  return <FinanceShell module="billing" title="Billing Worklist" description="Pending OPD, IPD, emergency, diagnostic, pharmacy, OT, package, insurance, and TPA billing items with source and payer context." icon={ReceiptText}>{content}</FinanceShell>;
}

export function TariffsPage() {
  return <FinanceShell module="billing" title="Tariff & Charge Master" description="Service rates, payer tariffs, package rates, tax rules, effective dates, inactive state, override rules, and rate history placeholders." icon={Percent}><FinanceSafetyBanner module="billing" /><SimpleTable records={mockBillingTariffs} /></FinanceShell>;
}

export function SourceBillingPage({ source }: { source: "OPD" | "IPD" }) {
  const bill = mockBillingRecords.find((item) => item.source === source) ?? mockBillingRecords[0];
  return (
    <FinanceShell module="billing" title={`${source} Billing`} description={`${source} billing with source charges, diagnostics, pharmacy/OT/package handoff, discounts, payment summary, invoice preview, and insurance placeholders.`} icon={CreditCard}>
      <BillingPatientHeader bill={bill} title={`${source} billing`} />
      {source === "IPD" ? <AmountWarning>IPD final bill requires package, advance, insurance, discharge clearance, and pending handoff review before finalization.</AmountWarning> : null}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <SimpleTable records={mockBillLines.filter((line) => line.billId === bill.id || line.source === source)} />
        <InvoicePreview bill={bill} />
      </div>
      <StickyActionBar saveLabel="Finalize bill" />
    </FinanceShell>
  );
}

export function InvoicesPage() {
  const [selected, setSelected] = React.useState<InvoiceRecord | null>(null);
  const columns = React.useMemo<ColumnDef<InvoiceRecord>[]>(() => [
    { header: "Invoice", accessorKey: "invoiceNo" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Payer", accessorKey: "payerId" },
    { header: "Date", accessorKey: "invoiceDate" },
    { header: "Gross", cell: ({ row }) => money(row.original.grossAmount) },
    { header: "Tax", cell: ({ row }) => money(row.original.taxAmount) },
    { header: "Net", cell: ({ row }) => money(row.original.netAmount) },
    { header: "Status", cell: ({ row }) => <FinanceStatus status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Detail</Button> },
  ], [setSelected]);
  return <FinanceShell module="billing" title="Invoice Management" description="Invoice list, detail, finalize, cancel, revise, credit note placeholder, audit trail, and print-safe invoice preview." icon={ReceiptText}><DataTable data={mockInvoices} columns={columns} /><InvoiceDrawer invoice={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></FinanceShell>;
}

export function PaymentsPage() {
  return <FinanceShell module="billing" title="Payment Management" description="Cash, card, UPI, bank, cheque, wallet, split payment, advance adjustment, receipt print, and reversal placeholders." icon={WalletCards}><FinanceSafetyBanner module="billing" /><SimpleTable records={mockPayments} /></FinanceShell>;
}

export function ReceiptsPage() {
  return <FinanceShell module="billing" title="Receipt Management" description="Receipt print, reprint audit, delivery channel placeholders, cancellation state, and patient/invoice receipt traceability." icon={Printer}><FinanceSafetyBanner module="billing" /><SimpleTable records={mockReceipts} /></FinanceShell>;
}

export function RefundsPage() {
  return <FinanceShell module="billing" title="Refund Management" description="Refund request, original payment link, eligible amount, approval, rejection, paid state, refund note, and receipt reversal placeholders." icon={Banknote}><AmountWarning>Refund cannot exceed eligible amount and requires original payment, reason, and approval placeholder.</AmountWarning><SimpleTable records={mockRefunds} /></FinanceShell>;
}

export function DiscountsPage() {
  return <FinanceShell module="billing" title="Discount Approval" description="Discount request queue with reason, approver, approval/rejection, applied state, audit trail, and print summary placeholder." icon={Percent}><SimpleTable records={mockDiscountRequests} /></FinanceShell>;
}

export function AdvancesPage() {
  return <FinanceShell module="billing" title="Advance Collection" description="Patient advance, deposit, adjustment, hold, refund placeholder, remaining balance, and advance receipt print." icon={Banknote}><SimpleTable records={mockAdvances} /></FinanceShell>;
}

export function CreditBillingPage() {
  return <FinanceShell module="billing" title="Credit Billing" description="Company/patient credit, outstanding, aging, settlement, dispute, write-off placeholder, follow-up and statement print." icon={FileClock}><SimpleTable records={mockCreditBills} /></FinanceShell>;
}

export function PackageBillingPage() {
  return <FinanceShell module="billing" title="Package Billing" description="Package assignment, utilization, inclusions, exclusions, overage, closure, and package summary print placeholders." icon={Building2}><SimpleTable records={mockBillingPackages} /></FinanceShell>;
}

export function PayerBillingPage({ mode }: { mode: "Insurance" | "TPA" }) {
  return <FinanceShell module="billing" title={`${mode} Billing`} description={`${mode} payer bill split with eligible amount, approved amount, patient payable, shortfall, non-payable lines, and claim handoff placeholders.`} icon={Landmark}><FinanceSafetyBanner module="insurance" /><SimpleTable records={mockBillingRecords.filter((item) => item.payerType === mode)} /><SimpleTable records={mockClaims} /></FinanceShell>;
}

export function FinanceDashboardPage() {
  return (
    <FinanceShell module="finance" title="Finance" description="Revenue, collections, receivables, expenses, cash counter, bank exceptions, GST/tax summary, and settlement shortfall placeholders." icon={BarChart3}>
      <SummaryGrid>
        <StatCard label="Revenue" value={mockBillingRecords.reduce((sum, item) => sum + item.netAmount, 0)} change="Today" context="Gross net" tone="info" icon={BarChart3} currency />
        <StatCard label="Collections" value={mockPayments.reduce((sum, item) => sum + item.amount, 0)} change="Received" context="Modes" tone="success" icon={WalletCards} currency />
        <StatCard label="Receivable" value={mockBillingRecords.reduce((sum, item) => sum + item.dueAmount, 0)} change="Due" context="Outstanding" tone="critical" icon={FileClock} currency />
        <StatCard label="Expenses" value={mockExpenses.reduce((sum, item) => sum + item.amount, 0)} change="Pending" context="Approval" tone="warning" icon={Banknote} currency />
        <StatCard label="Bank unmatched" value={mockBankEntries.filter((item) => item.matchStatus === "Unmatched").length} change="Match" context="Reconciliation" tone="danger" icon={Landmark} />
      </SummaryGrid>
      <FinanceSafetyBanner module="finance" />
      <div className="grid gap-4 xl:grid-cols-2"><SimpleRecordGrid title="Revenue summary" records={mockRevenueSummaries} /><SimpleRecordGrid title="Cash counters" records={mockCashCounters} /></div>
    </FinanceShell>
  );
}

export function FinanceSimplePage({ title, description, records }: { title: string; description: string; records: Record<string, unknown>[] }) {
  return <FinanceShell module="finance" title={title} description={description} icon={BarChart3}><FinanceSafetyBanner module="finance" /><SimpleTable records={records} /></FinanceShell>;
}

export function InsuranceDashboardPage() {
  return (
    <FinanceShell module="insurance" title="Insurance & TPA" description="Preauthorization, claims, settlements, rejections, document exceptions, payer aging, shortfall risk, and package mapping placeholders." icon={Landmark}>
      <SummaryGrid>
        <StatCard label="Preauth pending" value={mockPreauthorizations.filter((item) => item.status !== "Preauthorization approved").length} change="Documents" context="Desk" tone="warning" icon={ShieldCheck} />
        <StatCard label="Claims" value={mockClaims.length} change="Queue" context="Submitted/rejected" tone="info" icon={FileCheck2} />
        <StatCard label="Rejected" value={mockClaims.filter((item) => item.status === "Rejected").length} change="Correct" context="Resubmit" tone="danger" icon={Landmark} />
        <StatCard label="Settlements" value={mockClaimSettlements.length} change="Shortfall" context="Review" tone="critical" icon={Banknote} />
        <StatCard label="Policies" value={mockPatientPolicies.length} change="Eligibility" context="Coverage" tone="success" icon={ReceiptText} />
      </SummaryGrid>
      <FinanceSafetyBanner module="insurance" />
      <div className="grid gap-4 xl:grid-cols-2"><SimpleRecordGrid title="Claim queue" records={mockClaims} /><SimpleRecordGrid title="Rejection risks" records={mockClaimRejections} /></div>
    </FinanceShell>
  );
}

export function InsuranceSimplePage({ title, description, records }: { title: string; description: string; records: Record<string, unknown>[] }) {
  return <FinanceShell module="insurance" title={title} description={description} icon={Landmark}><FinanceSafetyBanner module="insurance" /><SimpleTable records={records} /></FinanceShell>;
}

export function ClaimsPage() {
  const [selected, setSelected] = React.useState<ClaimRecord | null>(null);
  const columns = React.useMemo<ColumnDef<ClaimRecord>[]>(() => [
    { header: "Claim", accessorKey: "claimNo" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Invoice", cell: ({ row }) => getInvoiceById(row.original.invoiceId)?.invoiceNo ?? row.original.invoiceId },
    { header: "Claim", cell: ({ row }) => money(row.original.claimAmount) },
    { header: "Submitted", cell: ({ row }) => money(row.original.submittedAmount) },
    { header: "Approved", cell: ({ row }) => money(row.original.approvedAmount) },
    { header: "Aging", accessorKey: "agingDays" },
    { header: "Status", cell: ({ row }) => <FinanceStatus status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Review</Button> },
  ], [setSelected]);
  return <FinanceShell module="insurance" title="Claim Processing" description="Claim queue with document validation, submission, query, rejection, correction, resubmission, and settlement handoff placeholders." icon={Landmark}><DataTable data={mockClaims} columns={columns} /><ClaimDrawer claim={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></FinanceShell>;
}

function CollectionModeCard() {
  return <Card><CardContent className="space-y-3 p-4"><div className="font-semibold">Collection by mode</div>{mockPayments.map((payment) => <div key={payment.id} className="flex items-center justify-between rounded-md border border-border bg-surface-muted p-2 text-xs"><span>{payment.paymentMode}</span><span className="font-semibold">{money(payment.amount)}</span></div>)}</CardContent></Card>;
}

function QueueLinks() {
  const links = [["Receipt register", "/billing/receipts"], ["Refund queue", "/billing/refunds"], ["Discount queue", "/billing/discounts"], ["Credit outstanding", "/billing/credit"], ["Cash counter", "/finance/cash-counter"], ["Insurance claims", "/insurance/claims"]];
  return <Card><CardContent className="space-y-2 p-4"><div className="font-semibold">Quick actions</div>{links.map(([label, href]) => <Button key={href} className="w-full justify-start" variant="outline" asChild><Link href={href}>{label}</Link></Button>)}</CardContent></Card>;
}

function InvoicePreview({ bill }: { bill: BillingRecord }) {
  return <Card><CardContent className="space-y-3 bg-white p-4 text-slate-900"><div className="text-sm font-semibold">Print-safe invoice preview</div><DetailRow label="Bill" value={bill.billNo} /><DetailRow label="Gross" value={money(bill.grossAmount)} /><DetailRow label="Discount" value={money(bill.discountAmount)} /><DetailRow label="Tax" value={money(bill.taxAmount)} /><DetailRow label="Net" value={money(bill.netAmount)} /><DetailRow label="Paid" value={money(bill.paidAmount)} /><DetailRow label="Due" value={money(bill.dueAmount)} /><div className="rounded-md border p-3 text-xs">Invoice cancellation/revision requires reason and audit placeholder.</div></CardContent></Card>;
}

function BillDrawer({ bill, open, onOpenChange }: { bill: BillingRecord | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Bill detail" description={bill?.billNo} className="md:w-[680px]">{bill ? <div className="space-y-4"><BillingPatientHeader bill={bill} title="Bill review" />{bill.status === "Overdue" || bill.dueAmount > 0 ? <AmountWarning>Outstanding amount, payer state, discount/refund approvals, and cash/claim actions require audit placeholders.</AmountWarning> : null}<SimpleTable records={mockBillLines.filter((line) => line.billId === bill.id)} /><InvoicePreview bill={bill} /><PayerContextCard payerId={bill.payerType === "Insurance" ? "ins-001" : undefined} /></div> : null}</Drawer>;
}

function InvoiceDrawer({ invoice, open, onOpenChange }: { invoice: InvoiceRecord | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const bill = invoice ? getBillById(invoice.billId) : undefined;
  return <Drawer open={open} onOpenChange={onOpenChange} title="Invoice detail" description={invoice?.invoiceNo}>{invoice ? <div className="space-y-4">{bill ? <BillingPatientHeader bill={bill} title="Invoice detail" /> : null}<SimpleRecordGrid title="Invoice controls" records={[{ id: "invoice", status: invoice.status, print: "Print placeholder", cancellation: "Reason required", revision: "Audit trail placeholder", creditNote: "Credit note placeholder" }]} /><PayerContextCard payerId={invoice.payerId} /></div> : null}</Drawer>;
}

function ClaimDrawer({ claim, open, onOpenChange }: { claim: ClaimRecord | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const invoice = claim ? getInvoiceById(claim.invoiceId) : undefined;
  const bill = invoice ? getBillById(invoice.billId) : undefined;
  return <Drawer open={open} onOpenChange={onOpenChange} title="Claim detail" description={claim?.claimNo} className="md:w-[680px]">{claim ? <div className="space-y-4">{bill ? <BillingPatientHeader bill={bill} title="Claim processing" /> : null}<AmountWarning>Claim submission/resubmission requires document checklist, correction note, payer eligibility, and audit placeholders.</AmountWarning><SimpleRecordGrid title="Claim values" records={[claim]} /><SimpleRecordGrid title="Documents / rejections" records={mockClaimRejections.filter((item) => item.claimId === claim.id)} /></div> : null}</Drawer>;
}

function SimpleTable<T extends Record<string, unknown>>({ records }: { records: T[] }) {
  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    const keys = Object.keys(records[0] ?? {}).filter((key) => key !== "id").slice(0, 8);
    return keys.map((key) => ({
      header: key.replace(/([A-Z])/g, " $1"),
      cell: ({ row }) => {
        const value = row.original[key];
        if (typeof value === "number" && /amount|balance|debit|credit|revenue|collections|outstanding|tax/i.test(key)) return money(value);
        if (typeof value === "string" && /pending|placeholder|Paid|Rejected|Approved|Overdue|Draft|Issued|Matched|Unmatched|Settled|Eligible|Query|Cancelled|Revised|Open|Disputed|Available/i.test(value)) return <FinanceStatus status={value} />;
        if (Array.isArray(value)) return value.join(", ");
        return String(value ?? "NA");
      },
    }));
  }, [records]);
  return <DataTable data={records} columns={columns} />;
}

function SimpleRecordGrid({ title, records }: { title: string; records: Record<string, unknown>[] }) {
  if (!records.length) return <EmptyState icon={Search} title={`No ${title.toLowerCase()}`} description="No static records match this Phase 10 workflow state." />;
  return <Card><CardContent className="space-y-3 p-4"><div className="font-semibold">{title}</div><div className="grid gap-2">{records.map((record) => <div key={String(record.id)} className="rounded-md border border-border bg-surface-muted p-3 text-xs">{Object.entries(record).filter(([key]) => key !== "id").slice(0, 7).map(([key, value]) => <div key={key} className="grid gap-2 border-b border-border/60 py-1 last:border-0 sm:grid-cols-[150px_1fr]"><span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span><span>{Array.isArray(value) ? value.join(", ") : typeof value === "number" && /amount|balance|debit|credit|revenue|collections|outstanding|tax/i.test(key) ? money(value) : String(value)}</span></div>)}</div>)}</div></CardContent></Card>;
}
