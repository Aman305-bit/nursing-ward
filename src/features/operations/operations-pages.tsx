"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  Archive,
  ClipboardCheck,
  CreditCard,
  FilePenLine,
  PackageCheck,
  Pill,
  Printer,
  RefreshCcw,
  Scissors,
  Search,
  ShieldAlert,
  ShoppingCart,
  Store,
  Syringe,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect, StickyActionBar } from "@/features/admin/admin-shared";
import { PatientMini } from "@/features/appointments/appointment-shared";
import {
  CriticalOperationBanner,
  OperationSafetyBanner,
  OperationStatus,
  PatientOperationHeader,
  ProtectedOperations,
  StockWarningStrip,
  type OperationsModule,
} from "@/features/operations/operations-shared";
import {
  getStockItemById,
  getVendorById,
  mockAssets,
  mockDispenseItems,
  mockDrugAlerts,
  mockGrns,
  mockInstrumentSets,
  mockOtBilling,
  mockOtRoomCleaning,
  mockPharmacyBills,
  mockPharmacyPrescriptions,
  mockPurchaseOrders,
  mockPurchaseRequests,
  mockStockAudits,
  mockStockBatches,
  mockStockItems,
  mockStockTransfers,
  mockSurgeries,
  mockSurgicalCounts,
  mockSterilizationCycles,
  mockVendors,
} from "@/data/operations";
import { getPatientById } from "@/data/patients";
import type {
  DispenseItem,
  OtSurgery,
  PharmacyPrescription,
  StockBatch,
  StockItem,
} from "@/types";

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">{children}</div>;
}

function OperationsShell({
  module,
  title,
  description,
  icon: Icon,
  children,
  actions,
}: {
  module: OperationsModule;
  title: string;
  description: string;
  icon: typeof Pill;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <ProtectedOperations module={module}>
      {() => (
        <>
          <PageHeader
            eyebrow={`Phase 9 • ${module === "pharmacy" ? "Pharmacy" : module === "inventory" ? "Inventory / Store" : "Operation Theatre"}`}
            title={title}
            description={description}
            actions={
              actions ?? (
                <>
                  <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
                  <Button variant="outline" onClick={() => toast.info("Static Phase 9 data refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
                  <Button><Icon className="h-4 w-4" />Open workflow</Button>
                </>
              )
            }
          />
          {children}
        </>
      )}
    </ProtectedOperations>
  );
}

export function PharmacyDashboardPage() {
  return (
    <OperationsShell module="pharmacy" title="Pharmacy" description="Prescription queue, dispense readiness, stock alerts, expiry alerts, billing placeholders, purchases, returns, and drug safety alerts." icon={Pill} actions={<><Button variant="outline" asChild><Link href="/pharmacy/prescriptions">Queue</Link></Button><Button variant="outline" asChild><Link href="/pharmacy/inventory">Search medicine</Link></Button><Button asChild><Link href="/pharmacy/expiry">Expiry dashboard</Link></Button></>}>
      <SummaryGrid>
        <StatCard label="Pending Rx" value={mockPharmacyPrescriptions.filter((item) => item.status === "Pending").length} change="Dispense" context="Queue" tone="warning" icon={Pill} />
        <StatCard label="Partial" value={mockPharmacyPrescriptions.filter((item) => item.status === "Partially dispensed").length} change="Reason" context="Stock gap" tone="info" icon={PackageCheck} />
        <StatCard label="Dispensed" value={mockPharmacyPrescriptions.filter((item) => item.status === "Dispensed").length} change="Today" context="Static" tone="success" icon={ClipboardCheck} />
        <StatCard label="Low stock" value={mockStockItems.filter((item) => item.status === "Low stock" || item.status === "Critical stock").length} change="Reorder" context="Pharmacy" tone="danger" icon={Archive} />
        <StatCard label="Near expiry" value={mockStockItems.filter((item) => item.nearExpiry > 0).length} change="Review" context="Batches" tone="warning" icon={AlertTriangle} />
        <StatCard label="Quarantine" value={mockStockBatches.filter((item) => item.status === "Expired" || item.status === "Quarantined").length} change="Blocked" context="No dispense" tone="critical" icon={ShieldAlert} />
        <StatCard label="Bills pending" value={mockPharmacyBills.filter((item) => item.paymentStatus !== "Paid").length} change="Placeholder" context="Billing" tone="info" icon={CreditCard} />
        <StatCard label="Drug alerts" value={mockDrugAlerts.length} change="Safety" context="Acknowledge" tone="critical" icon={AlertTriangle} />
      </SummaryGrid>
      <OperationSafetyBanner module="pharmacy" />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PrescriptionQueuePage embedded />
        <div className="space-y-4"><DrugAlertCards /><StockAlertCards /><PharmacyLinks /></div>
      </div>
    </OperationsShell>
  );
}

export function PrescriptionQueuePage({ embedded }: { embedded?: boolean }) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<PharmacyPrescription | null>(null);
  const rows = mockPharmacyPrescriptions.filter((rx) => {
    const patient = getPatientById(rx.patientId);
    const text = `${rx.prescriptionNo} ${patient?.firstName} ${patient?.lastName} ${patient?.uhid} ${rx.source} ${rx.doctor} ${rx.status} ${rx.allergyAlert}`;
    return includes(text, search) && (status === "All status" || rx.status === status);
  });
  const columns = React.useMemo<ColumnDef<PharmacyPrescription>[]>(() => [
    { header: "Prescription", accessorKey: "prescriptionNo" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "UHID", cell: ({ row }) => getPatientById(row.original.patientId)?.uhid ?? "Unknown" },
    { header: "Source", accessorKey: "source" },
    { header: "Doctor", accessorKey: "doctor" },
    { header: "Medicines", accessorKey: "medicineCount" },
    { header: "Allergy/interactions", cell: ({ row }) => <Badge tone={row.original.allergyAlert.includes("No active") ? "muted" : "danger"}>{row.original.allergyAlert}</Badge> },
    { header: "Stock", cell: ({ row }) => <OperationStatus status={row.original.stockStatus} /> },
    { header: "Dispense", cell: ({ row }) => <OperationStatus status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Dispense</Button> },
  ], [setSelected]);
  const content = <><FilterBar search={search} onSearch={setSearch} placeholder="Search prescription, patient, UHID, source, doctor, status..."><NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Pending", "Partially dispensed", "Dispensed", "On hold", "Substitution requested placeholder", "Returned placeholder"]} /></FilterBar><DataTable data={rows} columns={columns} /><PrescriptionDrawer prescription={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></>;
  if (embedded) return <Card className="min-w-0"><CardContent className="min-w-0 space-y-3 p-3"><div className="font-semibold">Prescription queue</div>{content}</CardContent></Card>;
  return <OperationsShell module="pharmacy" title="Prescription Queue" description="OPD/IPD/emergency prescription queue with batch selection, allergy warnings, stock availability, substitution, controlled medicine, and print placeholders." icon={Pill}>{content}</OperationsShell>;
}

export function PharmacyBillingPage() {
  return <OperationsShell module="pharmacy" title="Pharmacy Billing" description="Medicine invoice placeholder with dispensed medicines, payment state, return workflow, print invoice, and billing module handoff." icon={CreditCard}><OperationSafetyBanner module="pharmacy" /><SimpleTable records={mockPharmacyBills} /><SimpleRecordGrid title="Dispensed medicine invoice rows" records={mockDispenseItems} /></OperationsShell>;
}

export function PharmacyInventoryPage() {
  return <StockPage title="Pharmacy Inventory" description="Pharmacy item stock, reorder levels, critical stock, batch links, near-expiry and quarantine states." records={mockStockItems} />;
}

export function BatchManagementPage() {
  return <StockPage title="Batch Management" description="Batch-level stock, vendor, received date, expiry, saleable/quarantined quantity, recall and return placeholders." records={mockStockBatches} />;
}

export function ExpiryManagementPage() {
  return <StockPage title="Expiry Management" description="Near-expiry, expired, quarantined, return-to-vendor, disposal, and recall placeholder views." records={mockStockBatches.filter((item) => item.status === "Near expiry" || item.status === "Expired" || item.status === "Quarantined" || item.quarantinedQuantity > 0)} />;
}

export function PurchaseManagementPage() {
  return <OperationsShell module="inventory" title="Purchase Management" description="Purchase requests, purchase orders, supplier states, approval placeholders, cancellation reasons, and printable PO workflow." icon={ShoppingCart}><Tabs defaultValue="requests"><TabsList><TabsTrigger value="requests">Requests</TabsTrigger><TabsTrigger value="orders">Purchase orders</TabsTrigger></TabsList><TabsContent value="requests"><SimpleTable records={mockPurchaseRequests} /></TabsContent><TabsContent value="orders"><SimpleTable records={mockPurchaseOrders.map((po) => ({ ...po, vendor: getVendorById(po.vendorId)?.vendorName ?? po.vendorId }))} /></TabsContent></Tabs></OperationsShell>;
}

export function VendorsPage({ scope = "Pharmacy" }: { scope?: "Pharmacy" | "Store" }) {
  return <OperationsShell module="inventory" title={`${scope} Vendors`} description="Vendor contacts, categories, rating placeholders, purchase history, on-hold and blacklist safety states." icon={UserRound}><SimpleTable records={mockVendors.filter((vendor) => scope === "Pharmacy" ? vendor.category === "Pharmacy" || vendor.category === "Surgical" : true)} /></OperationsShell>;
}

export function DrugAlertsPage() {
  return <OperationsShell module="pharmacy" title="Drug Alerts" description="Allergy, interaction, duplicate therapy, controlled medicine, high-risk and near-expiry dispense alerts with acknowledgement placeholders." icon={AlertTriangle}><CriticalOperationBanner>Drug safety alerts stay visible before dispense and are not color-only.</CriticalOperationBanner><SimpleTable records={mockDrugAlerts} /></OperationsShell>;
}

export function StockAuditPage({ store = false }: { store?: boolean }) {
  return <OperationsShell module="inventory" title={store ? "Store Stock Audit" : "Stock Audit"} description="Physical/system stock variance, adjustment reason, approval placeholder, print audit sheet, and read-only ledger history." icon={ClipboardCheck}><OperationSafetyBanner module="inventory" /><SimpleTable records={mockStockAudits.map((audit) => ({ ...audit, item: getStockItemById(audit.itemId)?.name ?? audit.itemId }))} /></OperationsShell>;
}

export function InventoryDashboardPage() {
  return (
    <OperationsShell module="inventory" title="Inventory & Store" description="Central stock, department stock, transfers, GRNs, stock audit, expiry tracking, assets, and store vendor workflows." icon={Store} actions={<><Button variant="outline" asChild><Link href="/inventory/central-store">Central store</Link></Button><Button variant="outline" asChild><Link href="/inventory/transfers">Transfers</Link></Button><Button asChild><Link href="/inventory/audit">Audit</Link></Button></>}>
      <SummaryGrid>
        <StatCard label="Items" value={mockStockItems.length} change="Master" context="Pharmacy/store" tone="info" icon={Store} />
        <StatCard label="Low stock" value={mockStockItems.filter((item) => item.status === "Low stock" || item.status === "Critical stock").length} change="Reorder" context="Thresholds" tone="danger" icon={Archive} />
        <StatCard label="Transfers" value={mockStockTransfers.length} change="Custody" context="In transit" tone="warning" icon={Truck} />
        <StatCard label="GRNs" value={mockGrns.length} change="QC" context="Receipt" tone="info" icon={PackageCheck} />
        <StatCard label="Variance" value={mockStockAudits.filter((item) => item.variance !== 0).length} change="Approval" context="Audit" tone="critical" icon={ClipboardCheck} />
        <StatCard label="Assets" value={mockAssets.length} change="Placeholder" context="Maintenance" tone="muted" icon={Wrench} />
        <StatCard label="Expired" value={mockStockItems.reduce((sum, item) => sum + item.expired, 0)} change="Blocked" context="No issue" tone="danger" icon={AlertTriangle} />
        <StatCard label="Pending PO" value={mockPurchaseOrders.filter((po) => po.status !== "Received").length} change="Purchase" context="Supply" tone="warning" icon={ShoppingCart} />
      </SummaryGrid>
      <OperationSafetyBanner module="inventory" />
      <div className="grid gap-4 xl:grid-cols-2"><SimpleRecordGrid title="Central stock alerts" records={mockStockItems} /><SimpleRecordGrid title="Transfers and custody" records={mockStockTransfers} /></div>
    </OperationsShell>
  );
}

export function ItemMasterPage() {
  return <StockPage title="Item Master" description="Central pharmacy/store item definitions, categories, units, reorder levels, critical levels, and stock status placeholders." records={mockStockItems} inventory />;
}

export function CentralStorePage() {
  return <StockPage title="Central Store" description="Central store stock, issue workflow, quarantine, reorder, stock card, and ledger placeholders." records={mockStockItems} inventory />;
}

export function DepartmentStorePage() {
  return <OperationsShell module="inventory" title="Department Store" description="Department stock requests, issue, return, consumption placeholders, and minimum stock alerts." icon={Store}><SimpleRecordGrid title="Department stock requests" records={mockStockTransfers} /><SimpleRecordGrid title="Department stock view" records={mockStockItems.slice(0, 4)} /></OperationsShell>;
}

export function GrnPage() {
  return <OperationsShell module="inventory" title="GRN Management" description="Goods receipt notes with batch creation, expiry, short/extra/damaged/rejected items, quality check, ledger preview, and print placeholders." icon={PackageCheck}><SimpleTable records={mockGrns.map((grn) => ({ ...grn, vendor: getVendorById(grn.vendorId)?.vendorName ?? grn.vendorId }))} /></OperationsShell>;
}

export function TransfersPage() {
  return <OperationsShell module="inventory" title="Stock Transfer" description="Transfer request, approval, issue, receive, partial receive, reject, variance, custody, and history placeholders." icon={Truck}><SimpleTable records={mockStockTransfers} /></OperationsShell>;
}

export function AssetsPage() {
  return <OperationsShell module="inventory" title="Asset Management" description="Asset assignment, location, maintenance status, service hold, lost placeholder, and future biomedical integration readiness." icon={Wrench}><SimpleTable records={mockAssets} /></OperationsShell>;
}

export function OtDashboardPage() {
  return (
    <OperationsShell module="ot" title="Operation Theatre" description="OT schedule, surgery list, room readiness, instrument status, sterilization, infection alerts, and billing handoff placeholders." icon={Scissors} actions={<><Button variant="outline" asChild><Link href="/ot/schedule">Schedule</Link></Button><Button variant="outline" asChild><Link href="/ot/instruments">Instruments</Link></Button><Button asChild><Link href="/ot/surgeries">Surgeries</Link></Button></>}>
      <SummaryGrid>
        <StatCard label="Surgeries" value={mockSurgeries.length} change="Today" context="OT list" tone="info" icon={Scissors} />
        <StatCard label="Delayed" value={mockSurgeries.filter((item) => item.status === "Delayed").length} change="Reason" context="Checklist" tone="danger" icon={AlertTriangle} />
        <StatCard label="Instruments" value={mockInstrumentSets.filter((item) => item.status === "Available").length} change="Ready" context="Sterile" tone="success" icon={PackageCheck} />
        <StatCard label="Counts mismatch" value={mockSurgicalCounts.filter((item) => item.status === "Mismatch").length} change="Escalate" context="Sign-out" tone="critical" icon={ClipboardCheck} />
        <StatCard label="Cleaning due" value={mockOtRoomCleaning.filter((item) => item.status !== "Ready").length} change="Room" context="Release" tone="warning" icon={ShieldAlert} />
        <StatCard label="Sterilization fail" value={mockSterilizationCycles.filter((item) => item.indicatorResult === "Failed").length} change="Blocked" context="CSSD" tone="danger" icon={Syringe} />
        <StatCard label="Billing drafts" value={mockOtBilling.length} change="Placeholder" context="Charges" tone="info" icon={CreditCard} />
        <StatCard label="Utilization" value={72} change="Percent" context="Placeholder" tone="muted" icon={FilePenLine} />
      </SummaryGrid>
      <OperationSafetyBanner module="ot" />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"><SurgeriesPage embedded /><OtReadinessCards /></div>
    </OperationsShell>
  );
}

export function OtSchedulePage() {
  return <OperationsShell module="ot" title="OT Scheduling" description="Surgery calendar, OT room allocation, surgeon/anesthesia team, consent, pre-op, instrument readiness, and emergency override placeholders." icon={Scissors}><SimpleTable records={mockSurgeries} /></OperationsShell>;
}

export function SurgeriesPage({ embedded }: { embedded?: boolean }) {
  const [selected, setSelected] = React.useState<OtSurgery | null>(null);
  const columns = React.useMemo<ColumnDef<OtSurgery>[]>(() => [
    { header: "Time", accessorKey: "scheduledAt" },
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "Procedure", accessorKey: "procedure" },
    { header: "Room", accessorKey: "otRoom" },
    { header: "Surgeon", accessorKey: "surgeon" },
    { header: "Status", cell: ({ row }) => <OperationStatus status={row.original.status} /> },
    { header: "Consent", cell: ({ row }) => <OperationStatus status={row.original.consentStatus} /> },
    { header: "Instruments", cell: ({ row }) => <OperationStatus status={row.original.instrumentStatus} /> },
    { header: "Count", cell: ({ row }) => <OperationStatus status={row.original.surgicalCountStatus} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], [setSelected]);
  const content = <><DataTable data={mockSurgeries} columns={columns} /><SurgeryDrawer surgery={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} /></>;
  if (embedded) return <Card className="min-w-0"><CardContent className="min-w-0 space-y-3 p-3"><div className="font-semibold">Surgery list</div>{content}</CardContent></Card>;
  return <OperationsShell module="ot" title="Surgery Management" description="Pre-op, sign-in/time-out/sign-out, intra-op, counts, implants, specimen handoff, recovery, delay/cancellation, and read-only completed placeholders." icon={Scissors}>{content}</OperationsShell>;
}

export function AnesthesiaNotesPage() {
  return <OtNotesPage title="Anesthesia Notes" description="Pre-anesthesia assessment, plan, intra-op vitals placeholder, medications, airway, recovery, and print-safe anesthesia note." />;
}

export function SurgicalNotesPage() {
  return <OtNotesPage title="Surgical Notes" description="Procedure notes, findings, implants/consumables with stock context, complications, specimen-to-lab handoff, instructions, addendum, and print." surgical />;
}

export function OtBillingPage() {
  return <OperationsShell module="ot" title="OT Billing" description="OT room charges, surgeon/anesthesia charges, consumables, implants, package link, and billing handoff placeholder." icon={CreditCard}><SimpleTable records={mockOtBilling} /><SimpleRecordGrid title="Consumables and implants with stock context" records={mockStockItems.filter((item) => item.category === "Surgical" || item.category === "Implant")} /></OperationsShell>;
}

export function InstrumentsPage() {
  return <OperationsShell module="ot" title="Instrument Tracking" description="Instrument sets, assignment, usage, cleaning, packing, sterilization cycle, expiry, failed cycle, missing/damaged states, and checklist print." icon={PackageCheck}><OperationSafetyBanner module="ot" /><SimpleTable records={mockInstrumentSets} /><SimpleRecordGrid title="Sterilization cycles" records={mockSterilizationCycles} /></OperationsShell>;
}

export function InfectionControlPage() {
  return <OperationsShell module="ot" title="Infection Control" description="OT cleaning status, infection checklist, sterilization alerts, isolation warnings, post-surgery cleaning, room release, and failure override placeholders." icon={ShieldAlert}><CriticalOperationBanner>Blocked or failed-checklist rooms cannot be scheduled visually until cleaning completion or override reason is captured.</CriticalOperationBanner><SimpleTable records={mockOtRoomCleaning} /></OperationsShell>;
}

function StockPage({ title, description, records, inventory }: { title: string; description: string; records: (StockItem | StockBatch)[]; inventory?: boolean }) {
  return <OperationsShell module={inventory ? "inventory" : "pharmacy"} title={title} description={description} icon={Store}><OperationSafetyBanner module={inventory ? "inventory" : "pharmacy"} /><SimpleTable records={records.map((record) => "itemId" in record ? { ...record, item: getStockItemById(record.itemId)?.name ?? record.itemId, vendor: getVendorById(record.vendorId)?.vendorName ?? record.vendorId } : record)} /><SimpleRecordGrid title="Stock ledger / action placeholders" records={[{ id: "ledger", adjustment: "Reason required", quarantine: "Reason and affected batch required", recall: "Affected location visible", print: "Stock card placeholder" }]} /></OperationsShell>;
}

function DrugAlertCards() {
  return <Card><CardContent className="space-y-3 p-4"><div className="font-semibold">Drug alerts</div>{mockDrugAlerts.map((alert) => <div key={alert.id} className="rounded-md border border-critical/30 bg-critical/10 p-3 text-sm text-critical"><div className="font-semibold">{alert.alertType} • {alert.severity}</div><div>{alert.message}</div></div>)}</CardContent></Card>;
}

function StockAlertCards() {
  return <Card><CardContent className="space-y-3 p-4"><div className="font-semibold">Stock and expiry alerts</div>{mockStockItems.filter((item) => item.status !== "In stock").map((item) => <StockWarningStrip key={item.id} status={item.status} expiry={item.nearExpiry ? "Near expiry" : item.expired ? "Expired" : undefined} />)}</CardContent></Card>;
}

function PharmacyLinks() {
  const links = [["Billing", "/pharmacy/billing"], ["Batches", "/pharmacy/batches"], ["Purchases", "/pharmacy/purchases"], ["Stock audit", "/pharmacy/stock-audit"]];
  return <Card><CardContent className="space-y-2 p-4"><div className="font-semibold">Quick actions</div>{links.map(([label, href]) => <Button key={href} className="w-full justify-start" variant="outline" asChild><Link href={href}>{label}</Link></Button>)}</CardContent></Card>;
}

function OtReadinessCards() {
  return <div className="space-y-4"><SimpleRecordGrid title="Room cleaning" records={mockOtRoomCleaning} /><SimpleRecordGrid title="Instrument readiness" records={mockInstrumentSets} /></div>;
}

function OtNotesPage({ title, description, surgical }: { title: string; description: string; surgical?: boolean }) {
  const surgery = mockSurgeries[0];
  return (
    <OperationsShell module="ot" title={title} description={description} icon={FilePenLine}>
      <PatientOperationHeader patientId={surgery.patientId} context={surgery.procedure} meta={`${surgery.otRoom} • ${surgery.status}`} module="ot" />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card><CardContent className="space-y-3 p-4"><Tabs defaultValue="note"><TabsList><TabsTrigger value="note">Note</TabsTrigger><TabsTrigger value="counts">Counts</TabsTrigger><TabsTrigger value="handoff">Handoff</TabsTrigger></TabsList><TabsContent value="note"><textarea className="min-h-56 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue={surgical ? "Procedure findings, implant/consumable traceability, complications, specimen handoff, post-op instructions, addendum placeholder." : "Pre-anesthesia assessment, airway plan, intra-op placeholder, recovery score, medication and device integration placeholders."} /></TabsContent><TabsContent value="counts"><SimpleTable records={mockSurgicalCounts.filter((item) => item.surgeryId === surgery.id || surgical)} /></TabsContent><TabsContent value="handoff"><SimpleRecordGrid title="Specimen / billing / EMR handoff" records={[{ id: "handoff", specimen: "Lab handoff placeholder", consumables: "Batch/stock context preserved", emr: "Timeline attachment placeholder", billing: "OT billing draft" }]} /></TabsContent></Tabs></CardContent></Card>
        <Card><CardContent className="space-y-3 bg-white p-4 text-slate-900"><div className="text-sm font-semibold">Print preview</div><DetailRow label="Surgery" value={surgery.procedure} /><DetailRow label="Status" value={surgery.status} /><DetailRow label="Addendum" value="Does not overwrite completed notes" /><div className="rounded-md border p-3 text-xs">Completed notes open read-only unless addendum/revision placeholder is started.</div></CardContent></Card>
      </div>
      <StickyActionBar saveLabel={surgical ? "Save surgical note" : "Save anesthesia note"} />
    </OperationsShell>
  );
}

function PrescriptionDrawer({ prescription, open, onOpenChange }: { prescription: PharmacyPrescription | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const rows = prescription ? mockDispenseItems.filter((item) => item.prescriptionId === prescription.id) : [];
  return <Drawer open={open} onOpenChange={onOpenChange} title="Dispense workflow" description={prescription?.prescriptionNo} className="md:w-[680px]">{prescription ? <div className="space-y-4"><PatientOperationHeader patientId={prescription.patientId} context={prescription.prescriptionNo} meta={`${prescription.source} • ${prescription.doctor}`} module="pharmacy" />{prescription.allergyAlert.includes("No active") ? null : <CriticalOperationBanner>{prescription.allergyAlert}. Acknowledgement is required before dispense placeholder.</CriticalOperationBanner>}<DataTable data={rows} columns={dispenseColumns} /><SimpleRecordGrid title="Dispense controls" records={[{ id: "controls", batch: "Required", partial: "Reason required", substitution: "Reason placeholder", controlled: "Authorization/register required", print: "Dispense slip placeholder" }]} /></div> : null}</Drawer>;
}

const dispenseColumns: ColumnDef<DispenseItem>[] = [
  { header: "Medicine", accessorKey: "medicine" },
  { header: "Dose", accessorKey: "dose" },
  { header: "Requested", accessorKey: "requestedQty" },
  { header: "Available", accessorKey: "availableQty" },
  { header: "Batch", accessorKey: "batchNo" },
  { header: "Expiry", accessorKey: "expiryDate" },
  { header: "Dispense", accessorKey: "dispenseQty" },
  { header: "Substitution", cell: ({ row }) => <OperationStatus status={row.original.substitutionStatus} /> },
];

function SurgeryDrawer({ surgery, open, onOpenChange }: { surgery: OtSurgery | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange} title="Surgery detail" description={surgery?.procedure} className="md:w-[680px]">{surgery ? <div className="space-y-4"><PatientOperationHeader patientId={surgery.patientId} context={surgery.procedure} meta={`${surgery.otRoom} • ${surgery.scheduledAt}`} module="ot" /><OperationSafetyBanner module="ot" /><SimpleRecordGrid title="WHO checklist placeholders" records={[{ id: "sign-in", step: "Sign-in", status: surgery.checklistStatus, required: "Patient identity, consent, site, allergy" }, { id: "time-out", step: "Time-out", status: "Pending", required: "Team, procedure, antibiotics, instruments" }, { id: "sign-out", step: "Sign-out", status: surgery.surgicalCountStatus, required: "Counts, specimens, notes, recovery" }]} /><SimpleTable records={mockSurgicalCounts.filter((item) => item.surgeryId === surgery.id)} /><SimpleRecordGrid title="Instrument and sterilization" records={mockInstrumentSets.filter((item) => item.assignedSurgeryId === surgery.id)} /></div> : null}</Drawer>;
}

function SimpleTable<T extends Record<string, unknown>>({ records }: { records: T[] }) {
  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    const keys = Object.keys(records[0] ?? {}).filter((key) => key !== "id").slice(0, 8);
    return keys.map((key) => ({
      header: key.replace(/([A-Z])/g, " $1"),
      cell: ({ row }) => {
        const value = row.original[key];
        if (typeof value === "string" && /pending|placeholder|stock|Expired|Quarantined|Delayed|Damaged|Missing|Received|Approved|Rejected|Ready|Clean|Mismatch|Sterilized|In surgery/i.test(value)) return <OperationStatus status={value} />;
        if (Array.isArray(value)) return value.join(", ");
        return String(value ?? "NA");
      },
    }));
  }, [records]);
  return <DataTable data={records} columns={columns} />;
}

function SimpleRecordGrid({ title, records }: { title: string; records: Record<string, unknown>[] }) {
  if (!records.length) return <EmptyState icon={Search} title={`No ${title.toLowerCase()}`} description="No static records match this Phase 9 workflow state." />;
  return <Card><CardContent className="space-y-3 p-4"><div className="font-semibold">{title}</div><div className="grid gap-2">{records.map((record) => <div key={String(record.id)} className="rounded-md border border-border bg-surface-muted p-3 text-xs">{Object.entries(record).filter(([key]) => key !== "id").slice(0, 7).map(([key, value]) => <div key={key} className="grid gap-2 border-b border-border/60 py-1 last:border-0 sm:grid-cols-[150px_1fr]"><span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span><span>{Array.isArray(value) ? value.join(", ") : String(value)}</span></div>)}</div>)}</div></CardContent></Card>;
}
