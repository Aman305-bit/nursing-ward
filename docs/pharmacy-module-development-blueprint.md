# Pharmacy Module Development Blueprint

This document explains how to create a new module in this Next.js hospital project using Pharmacy as the example. The same structure can be reused for Lab, Radiology, Billing, Insurance, OT, or any future module.

## How To Teach This Document

Use this document like a classroom handout. First explain the simple idea, then show the folder structure, then build one route live, then connect that route to one UI page.

Simple explanation for new joiners:

```txt
Route folder decides the URL.
Feature folder contains the real UI and logic.
Types file defines the shape of data.
Data file gives dummy data for development.
API file connects the frontend with backend.
Navigation file shows the module in the sidebar/menu.
```

The most important rule:

```txt
Do not put large UI code inside src/app route files.
Keep route files small.
Build the actual screen inside src/features/module-name.
```

## Quick Mental Model

Think of a module like a hospital department.

| Part | Meaning | Example |
| --- | --- | --- |
| Route | URL/page address | `/pharmacy/orders` |
| Page wrapper | Small file that connects URL to UI | `src/app/(app)/pharmacy/orders/page.tsx` |
| Feature page | Actual screen design | `PharmacyOrdersPage` |
| Shared components | Reusable UI parts | filters, cards, modals, badges |
| Types | Data structure | `PharmacyOrder`, `InventoryItem` |
| Data | Dummy records | 20 orders, 50 medicines |
| API | Backend connection | `getPharmacyOrders()` |
| Navigation | Sidebar/menu entry | Pharmacy menu |

## 1. Module Objective

The Pharmacy module should manage the complete medicine journey:

- Prescription/order received from doctor, OPD, IPD, emergency, discharge, or repeat visit.
- Pharmacist verifies medicine, dose, route, frequency, allergy, interaction, and stock.
- Billing/payment or package eligibility is checked.
- Medicine is packed, dispensed, returned, substituted, or held.
- Inventory, batch, expiry, purchase, stock adjustment, and audit log are updated.

## 2. Main Roles

| Role | Main Screens |
| --- | --- |
| Pharmacist | Order Queue, Verification, Dispensing, Patient Medication History |
| Pharmacy Manager | Dashboard, Inventory, Batch/Expiry, Purchase, Reports, Audit Log |
| Doctor | Prescription status, substitution request, medication history |
| Nurse | Medication availability, IPD issue status, ward delivery |
| Billing Staff | Payment clearance, package mapping, refund/return billing |
| Inventory Staff | Stock, GRN, supplier, transfer, adjustment |
| Admin/Auditor | Settings, access control, audit trail |

## 3. Recommended Folder Structure

Route files should stay thin. Actual UI, data, types, helpers, and reusable logic should live inside `src/features/pharmacy`.

Full recommended structure:

```txt
src/
  app/
    (app)/
      pharmacy/
        page.tsx
        orders/
          page.tsx
          [orderId]/
            page.tsx
        dispensing/
          page.tsx
        inventory/
          page.tsx
        batches/
          page.tsx
        expiry-alerts/
          page.tsx
        purchase/
          page.tsx
        returns/
          page.tsx
        billing/
          page.tsx
        patient-history/
          page.tsx
        reports/
          page.tsx
        audit-log/
          page.tsx
        settings/
          page.tsx

  features/
    pharmacy/
      pharmacy-pages.tsx
      pharmacy-shared.tsx
      pharmacy-types.ts
      pharmacy-data.ts
      pharmacy-api.ts
      pharmacy-utils.ts

  data/
    navigation.ts
```

What each file is responsible for:

| File or folder | Responsibility |
| --- | --- |
| `src/app/(app)/pharmacy/page.tsx` | Creates `/pharmacy` URL and renders `PharmacyDashboardPage` |
| `src/app/(app)/pharmacy/orders/page.tsx` | Creates `/pharmacy/orders` URL and renders `PharmacyOrdersPage` |
| `src/app/(app)/pharmacy/orders/[orderId]/page.tsx` | Creates dynamic order detail URL like `/pharmacy/orders/ORD-1001` |
| `src/features/pharmacy/pharmacy-pages.tsx` | Main UI screens: dashboard, orders, inventory, reports, settings |
| `src/features/pharmacy/pharmacy-shared.tsx` | Reusable UI: filters, cards, modals, badges, pagination |
| `src/features/pharmacy/pharmacy-types.ts` | TypeScript types and status unions |
| `src/features/pharmacy/pharmacy-data.ts` | Dummy/mock data for frontend development |
| `src/features/pharmacy/pharmacy-api.ts` | API functions for backend integration |
| `src/features/pharmacy/pharmacy-utils.ts` | Search, filter, formatting, status tone helpers |
| `src/data/navigation.ts` | Sidebar/menu entry for Pharmacy |

Minimum first version structure:

```txt
src/app/(app)/pharmacy/page.tsx
src/app/(app)/pharmacy/orders/page.tsx
src/features/pharmacy/pharmacy-pages.tsx
src/features/pharmacy/pharmacy-shared.tsx
src/features/pharmacy/pharmacy-types.ts
src/features/pharmacy/pharmacy-data.ts
```

## 4. Route File vs UI File

This is the most important concept for beginners.

### Route File

Route file means URL file. It lives inside `src/app/(app)`.

Example:

```txt
src/app/(app)/pharmacy/orders/page.tsx
```

This creates the browser URL:

```txt
http://localhost:3000/pharmacy/orders
```

This file should be small. It should only call the actual UI component.

### UI File

UI file means actual screen design. It lives inside `src/features/pharmacy`.

Example:

```txt
src/features/pharmacy/pharmacy-pages.tsx
```

This file contains:

- dashboard layout
- cards
- tables
- tabs
- filters
- buttons
- modals
- business screen logic

### Simple Mapping

| URL | Route file | UI component |
| --- | --- | --- |
| `/pharmacy` | `src/app/(app)/pharmacy/page.tsx` | `PharmacyDashboardPage` |
| `/pharmacy/orders` | `src/app/(app)/pharmacy/orders/page.tsx` | `PharmacyOrdersPage` |
| `/pharmacy/orders/[orderId]` | `src/app/(app)/pharmacy/orders/[orderId]/page.tsx` | `PharmacyOrderDetailPage` |
| `/pharmacy/inventory` | `src/app/(app)/pharmacy/inventory/page.tsx` | `PharmacyInventoryPage` |

## 5. Route File Pattern

Each route page should only import and render the matching feature page.

```tsx
import { PharmacyDashboardPage } from "@/features/pharmacy/pharmacy-pages";

export default function Page() {
  return <PharmacyDashboardPage />;
}
```

Dynamic route example:

```tsx
import { PharmacyOrderDetailPage } from "@/features/pharmacy/pharmacy-pages";

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <PharmacyOrderDetailPage orderId={orderId} />;
}
```

## 6. Route Structure

| Route | Purpose |
| --- | --- |
| `/pharmacy` | Main dashboard |
| `/pharmacy/orders` | Prescription and medication order queue |
| `/pharmacy/orders/[orderId]` | Full order detail |
| `/pharmacy/dispensing` | Packing, issue, dispense, ward delivery |
| `/pharmacy/inventory` | Stock list, search, low stock |
| `/pharmacy/batches` | Batch, lot, expiry, manufacturer |
| `/pharmacy/expiry-alerts` | Near-expiry and expired stock |
| `/pharmacy/purchase` | Supplier, PO, GRN, inward stock |
| `/pharmacy/returns` | Patient return, IPD return, refund |
| `/pharmacy/billing` | Payment, package, insurance, credit issue |
| `/pharmacy/patient-history` | Patient medication history |
| `/pharmacy/reports` | Consumption, fast-moving, slow-moving, expiry, stock valuation |
| `/pharmacy/audit-log` | All user actions |
| `/pharmacy/settings` | Thresholds, role access, substitutions, stock rules |

## 7. Navigation Entry

Add Pharmacy into `src/data/navigation.ts`.

Expected navigation children:

```txt
Pharmacy
- Dashboard
- Orders
- Dispensing
- Inventory
- Batches
- Expiry Alerts
- Purchase
- Returns
- Billing
- Patient History
- Reports
- Audit Log
- Settings
```

Teaching note:

```txt
Route creates the URL.
Navigation only shows a clickable menu link.
Both are different things.
```

## 8. Core Screens

### Pharmacy Dashboard

Purpose: management overview.

Should include:

- Total pending orders
- Verification pending
- Dispense pending
- Out of stock
- Low stock
- Near expiry
- Critical medications
- Delayed orders
- Graphs for order status, stock risk, department demand
- Tabs for command views

### Order Queue

Purpose: handle prescriptions and medicine orders.

Required controls:

- Search by patient, UHID, visit ID, order number, medicine, doctor, ward, bed
- Filters by source, status, priority, payment, department, doctor, ward
- Pagination after every 10 rows
- Action buttons: verify, hold, substitute, reject, send to billing, pack

### Dispensing Workbench

Purpose: issue medicines safely.

Should show:

- Patient details
- Medication list
- Dose, route, frequency, duration
- Allergy warning
- Drug interaction warning
- Stock availability
- Batch selection
- Expiry check
- Payment/package status
- Final dispense button

### Inventory

Purpose: stock control.

Should include:

- Medicine name, generic, category, strength, form
- Current stock
- Reorder level
- Rack/bin location
- Batch count
- Expiry risk
- Supplier
- Stock adjustment
- Transfer stock

### Batch and Expiry

Purpose: batch-level safety.

Should include:

- Batch number
- Expiry date
- Manufacturer
- Purchase rate
- MRP
- Available quantity
- Block expired stock from dispensing

### Purchase / GRN

Purpose: stock inward.

Should include:

- Purchase order
- Supplier
- GRN
- Invoice
- Batch entry
- Tax
- MRP
- Purchase price
- Expiry
- Stock posting

### Returns

Purpose: medicine return workflow.

Should include:

- Patient return
- IPD ward return
- Damaged/expired return
- Refund eligibility
- Stock re-entry if safe
- Audit trail

### Billing

Purpose: financial clearance.

Should include:

- Paid/unpaid
- Credit issue
- Package covered
- Insurance covered
- Refund
- Partial dispensing if allowed

### Audit Log

Purpose: traceability.

Should include:

- Who verified
- Who substituted
- Who dispensed
- Which batch was used
- Quantity changed
- Return/refund actions
- Timestamp and role

## 9. Types

Create `src/features/pharmacy/pharmacy-types.ts`.

```ts
export type PharmacyOrderStatus =
  | "Ordered"
  | "Verification Pending"
  | "Verified"
  | "Billing Pending"
  | "Packing"
  | "Ready"
  | "Dispensed"
  | "Partially Dispensed"
  | "On Hold"
  | "Cancelled"
  | "Returned";

export type PharmacyPriority = "Routine" | "Urgent" | "STAT" | "Critical";

export type PharmacySource = "OPD" | "IPD" | "Emergency" | "Discharge" | "Follow-up";

export type PharmacyOrder = {
  id: string;
  orderNo: string;
  patientName: string;
  uhid: string;
  visitId: string;
  ageGender: string;
  source: PharmacySource;
  department: string;
  doctor: string;
  ward?: string;
  bed?: string;
  priority: PharmacyPriority;
  status: PharmacyOrderStatus;
  paymentStatus: "Paid" | "Unpaid" | "Package" | "Insurance" | "Credit";
  allergyWarning?: string;
  interactionWarning?: string;
  blocker?: string;
  waitingMinutes: number;
  items: PharmacyOrderItem[];
};

export type PharmacyOrderItem = {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  strength: string;
  form: "Tablet" | "Capsule" | "Injection" | "Syrup" | "Drops" | "Ointment";
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  orderedQty: number;
  dispensedQty: number;
  status: "Pending" | "Available" | "Substitution Needed" | "Out of Stock" | "Dispensed";
};

export type InventoryItem = {
  id: string;
  medicineName: string;
  genericName: string;
  category: string;
  form: string;
  strength: string;
  currentStock: number;
  reorderLevel: number;
  rack: string;
  supplier: string;
  status: "Available" | "Low Stock" | "Out of Stock" | "Blocked";
};

export type BatchStock = {
  id: string;
  medicineId: string;
  batchNo: string;
  expiryDate: string;
  manufacturer: string;
  availableQty: number;
  mrp: number;
  purchaseRate: number;
  status: "Active" | "Near Expiry" | "Expired" | "Blocked";
};

export type PharmacyAuditLog = {
  id: string;
  entityId: string;
  entityType: "Order" | "Inventory" | "Batch" | "Return" | "Purchase";
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  note?: string;
};
```

## 10. Dummy Data Strategy

Create `src/features/pharmacy/pharmacy-data.ts`.

Start with:

- 20 pharmacy orders
- 50 medicine inventory rows
- 80 batch records
- 20 audit logs
- 10 suppliers

All list screens must support:

- search
- filters
- sorting where useful
- pagination after 10 rows
- empty state
- delayed/blocked state

## 11. Shared Components

Create `src/features/pharmacy/pharmacy-shared.tsx`.

Recommended reusable components:

```txt
PharmacyAccessBanner
PharmacyStatusBadge
PharmacyPriorityBadge
PharmacyFilters
PharmacyStatGrid
PharmacyOrderCard
PharmacyOrderTable
PharmacyOrderDetailModal
InventoryTable
BatchTable
PharmacyPaginationBar
PharmacyEmptyState
PharmacyAlertPanel
```

Use existing app components first:

```txt
PageHeader
Card
Button
Badge
StatusPill
StatCard
DataTable
Tabs
Input
```

## 12. API Integration Layer

Create `src/features/pharmacy/pharmacy-api.ts`.

Keep API calls separate from UI components.

```ts
const API_BASE = "/api/pharmacy";

export async function getPharmacyOrders(params: URLSearchParams) {
  const response = await fetch(`${API_BASE}/orders?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to load pharmacy orders");
  return response.json();
}

export async function verifyPharmacyOrder(orderId: string) {
  const response = await fetch(`${API_BASE}/orders/${orderId}/verify`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Unable to verify order");
  return response.json();
}
```

Suggested backend endpoints:

```txt
GET    /api/pharmacy/dashboard
GET    /api/pharmacy/orders
GET    /api/pharmacy/orders/:orderId
POST   /api/pharmacy/orders/:orderId/verify
POST   /api/pharmacy/orders/:orderId/hold
POST   /api/pharmacy/orders/:orderId/substitute
POST   /api/pharmacy/orders/:orderId/pack
POST   /api/pharmacy/orders/:orderId/dispense
POST   /api/pharmacy/orders/:orderId/cancel

GET    /api/pharmacy/inventory
GET    /api/pharmacy/inventory/:medicineId
POST   /api/pharmacy/inventory/adjust
POST   /api/pharmacy/inventory/transfer

GET    /api/pharmacy/batches
POST   /api/pharmacy/batches/block

GET    /api/pharmacy/purchase-orders
POST   /api/pharmacy/purchase-orders
POST   /api/pharmacy/grn

GET    /api/pharmacy/returns
POST   /api/pharmacy/returns

GET    /api/pharmacy/audit-log
GET    /api/pharmacy/reports/consumption
GET    /api/pharmacy/reports/expiry
GET    /api/pharmacy/reports/stock-valuation
```

## 13. API Query Parameters

For large data, filtering and pagination should happen backend-side.

Example:

```txt
GET /api/pharmacy/orders?page=1&pageSize=10&query=paracetamol&status=Verified&source=IPD&priority=Urgent
```

Standard query params:

```txt
page
pageSize
query
status
source
priority
department
doctor
ward
paymentStatus
fromDate
toDate
sortBy
sortDirection
```

Standard response:

```ts
type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
```

## 14. Search, Filter, Pagination Rules

Every queue/list screen should have:

- Search input
- Filters
- 10 rows per page
- Previous/Next buttons
- Total count
- Empty state
- Mobile-safe layout

Minimum searchable fields:

```txt
patient name
UHID
visit ID
order number
medicine name
generic name
doctor
department
ward
bed
batch number
supplier
status
priority
```

## 15. Pharmacy Workflow

Recommended order flow:

```txt
Ordered
-> Verification Pending
-> Verified
-> Billing Pending, if unpaid
-> Packing
-> Ready
-> Dispensed
```

Alternative flows:

```txt
Ordered -> On Hold -> Verified
Ordered -> Substitution Needed -> Doctor Approval -> Verified
Verified -> Partially Dispensed
Verified -> Cancelled
Dispensed -> Returned
```

Block dispensing when:

- Medicine is out of stock
- Batch is expired
- Allergy warning is unresolved
- Interaction warning is unresolved
- Payment is required but unpaid
- Controlled drug authorization is missing

## 16. UI Rules

Follow the existing design system.

- Keep route pages thin.
- Use reusable feature components.
- Tables must be horizontally safe on mobile.
- Modals should open centered for detail views.
- Avoid long unpaginated lists.
- Use tabs for Dashboard sections.
- Use cards for repeated entities only.
- Use status badges for clinical/operational state.
- Use charts only where they help management decisions.

Recommended dashboard tabs:

```txt
Command
Order Queue
Dispensing
Inventory Risk
Expiry Risk
Billing Blocks
Graphs
```

## 17. Validation and Safety Rules

Frontend validation should prevent:

- Dispense quantity greater than available stock
- Dispensing expired batch
- Dispensing blocked batch
- Missing batch number
- Missing pharmacist verification
- Controlled drug issue without approval
- Return quantity greater than dispensed quantity

Backend must revalidate everything. Frontend validation is only for user guidance.

## 18. Audit Requirements

Always log:

- Verify order
- Hold order
- Substitute medicine
- Dispense medicine
- Cancel order
- Return medicine
- Stock adjustment
- Batch block/unblock
- Purchase inward
- GRN posting
- Settings change

Audit log should include:

```txt
action
entity
old value
new value
user
role
timestamp
reason/note
```

## 19. Suggested Implementation Order

Follow this order when teaching or building the module. Do not start with all screens at once. First create the foundation, then one working page, then expand.

### Step 1: Understand the Module Scope

Before writing code, list the screens and users.

For Pharmacy:

```txt
Users: pharmacist, pharmacy manager, doctor, nurse, billing staff, admin
Main screens: dashboard, orders, dispensing, inventory, batches, purchase, returns, billing, reports
Important rule: every list needs search, filter, and 10-row pagination
```

Output of this step:

```txt
You know which URLs will be created.
You know which screens are needed.
You know which roles will use which screen.
```

### Step 2: Create the Route Folder Skeleton

Create only route files under `src/app/(app)/pharmacy`.

```txt
src/app/(app)/pharmacy/page.tsx
src/app/(app)/pharmacy/orders/page.tsx
src/app/(app)/pharmacy/orders/[orderId]/page.tsx
src/app/(app)/pharmacy/dispensing/page.tsx
src/app/(app)/pharmacy/inventory/page.tsx
src/app/(app)/pharmacy/batches/page.tsx
src/app/(app)/pharmacy/expiry-alerts/page.tsx
src/app/(app)/pharmacy/purchase/page.tsx
src/app/(app)/pharmacy/returns/page.tsx
src/app/(app)/pharmacy/billing/page.tsx
src/app/(app)/pharmacy/patient-history/page.tsx
src/app/(app)/pharmacy/reports/page.tsx
src/app/(app)/pharmacy/audit-log/page.tsx
src/app/(app)/pharmacy/settings/page.tsx
```

Each file should only call a component from `src/features/pharmacy/pharmacy-pages.tsx`.

Example:

```tsx
import { PharmacyOrdersPage } from "@/features/pharmacy/pharmacy-pages";

export default function Page() {
  return <PharmacyOrdersPage />;
}
```

Teaching point:

```txt
At this stage we are only creating URLs.
We are not designing the full UI inside these route files.
```

### Step 3: Create the Feature Folder

Create:

```txt
src/features/pharmacy/
```

Inside it create:

```txt
pharmacy-pages.tsx
pharmacy-shared.tsx
pharmacy-types.ts
pharmacy-data.ts
pharmacy-api.ts
pharmacy-utils.ts
```

Teaching point:

```txt
src/app gives URL.
src/features gives the real module.
```

### Step 4: Create TypeScript Types First

Start with `src/features/pharmacy/pharmacy-types.ts`.

Define:

```txt
PharmacyOrderStatus
PharmacyPriority
PharmacySource
PharmacyOrder
PharmacyOrderItem
InventoryItem
BatchStock
PharmacyAuditLog
```

Why types first:

```txt
Types decide what data looks like.
After types are clear, dummy data, UI tables, filters, and API response become easier.
```

### Step 5: Create Dummy Data

Create dummy records in `src/features/pharmacy/pharmacy-data.ts`.

Minimum data:

```txt
20 pharmacy orders
50 inventory medicines
80 batch records
20 audit log rows
10 suppliers
```

Dummy data should include different scenarios:

```txt
normal order
urgent order
critical order
billing pending
stock available
out of stock
low stock
near expiry
expired batch
returned medicine
partially dispensed order
cancelled order
```

Teaching point:

```txt
Good dummy data helps us test real hospital scenarios before backend is ready.
```

### Step 6: Create Shared UI Components

Create reusable parts in `src/features/pharmacy/pharmacy-shared.tsx`.

Start with:

```txt
PharmacyFilters
PharmacyPaginationBar
PharmacyOrderCard
PharmacyOrderDetailModal
PharmacyStatusBadge
PharmacyPriorityBadge
InventoryStatusBadge
PharmacyEmptyState
```

Use existing project components:

```txt
PageHeader
Card
Button
Badge
StatusPill
StatCard
DataTable
Tabs
Input
```

Teaching point:

```txt
If one UI part is used on more than one screen, keep it in shared.
Do not duplicate filters and badges on every page.
```

### Step 7: Build the First Working Page

Start with `/pharmacy/orders`.

In `pharmacy-pages.tsx`, create:

```tsx
export function PharmacyOrdersPage() {
  return (
    <div>
      {/* header, filters, table, pagination, modal */}
    </div>
  );
}
```

This page must have:

```txt
PageHeader
search input
status filter
priority filter
source filter
10 rows per page
order table
detail modal
empty state
```

After this page works, the team understands the full module pattern.

### Step 8: Add Dashboard

Create `PharmacyDashboardPage` in `pharmacy-pages.tsx`.

Dashboard should include:

```txt
stats cards
command filters
tabs
pending order preview
inventory risk preview
expiry risk preview
billing blocked preview
graphs tab
```

Recommended tabs:

```txt
Command
Order Queue
Dispensing
Inventory Risk
Expiry Risk
Billing Blocks
Graphs
```

Teaching point:

```txt
Dashboard is for overview.
Detailed work happens in dedicated pages like Orders, Inventory, Dispensing.
```

### Step 9: Add Remaining Pages One by One

Build these pages after dashboard and orders are stable:

```txt
PharmacyDispensingPage
PharmacyInventoryPage
PharmacyBatchesPage
PharmacyExpiryAlertsPage
PharmacyPurchasePage
PharmacyReturnsPage
PharmacyBillingPage
PharmacyPatientHistoryPage
PharmacyReportsPage
PharmacyAuditLogPage
PharmacySettingsPage
```

Every list page must have:

```txt
search
filters
10-row pagination
detail action
mobile-safe table
empty state
```

### Step 10: Add Dynamic Detail Route

Create:

```txt
src/app/(app)/pharmacy/orders/[orderId]/page.tsx
```

This route should render:

```tsx
<PharmacyOrderDetailPage orderId={orderId} />
```

Use this page for full order detail:

```txt
patient details
doctor prescription
medicine items
verification status
batch selection
billing status
dispensing history
audit log
```

### Step 11: Add Navigation

Update:

```txt
src/data/navigation.ts
```

Add Pharmacy with children:

```txt
Dashboard
Orders
Dispensing
Inventory
Batches
Expiry Alerts
Purchase
Returns
Billing
Patient History
Reports
Audit Log
Settings
```

Teaching point:

```txt
Navigation does not create a page.
Route file creates the page.
Navigation only creates clickable menu links.
```

### Step 12: Add Search, Filter, and Pagination Rules

Create helper logic in `pharmacy-utils.ts`.

Useful helpers:

```txt
pharmacyOrderSearchText(order)
filterPharmacyOrders(orders, filters)
paginateRows(rows, page, pageSize)
getOrderStatusTone(status)
getPriorityTone(priority)
formatWaitTime(minutes)
```

Pagination rule:

```txt
pageSize = 10
Every table/list should show 10 rows per page.
Board view can show first 10 per column and link users to the paginated worklist.
```

### Step 13: Add API Service Layer

Create API functions in:

```txt
src/features/pharmacy/pharmacy-api.ts
```

Do not call API directly from every component.

Start with:

```txt
getPharmacyDashboard()
getPharmacyOrders(params)
getPharmacyOrder(orderId)
verifyPharmacyOrder(orderId)
holdPharmacyOrder(orderId, payload)
dispensePharmacyOrder(orderId, payload)
getInventory(params)
getBatches(params)
getAuditLogs(params)
```

Teaching point:

```txt
UI asks pharmacy-api.ts for data.
pharmacy-api.ts talks to backend.
This keeps backend changes isolated.
```

### Step 14: Replace Dummy Data With API Gradually

Do not replace all dummy data in one shot.

Recommended migration order:

```txt
1. Orders page
2. Order detail page
3. Dispensing page
4. Inventory page
5. Batch/expiry pages
6. Purchase/returns pages
7. Dashboard aggregates
8. Reports and audit log
```

For every API-connected screen, handle:

```txt
loading state
error state
empty state
pagination from backend
filter query params
success toast
failure toast
```

### Step 15: Add Safety Validations

Before dispensing, validate:

```txt
stock is available
batch is selected
batch is not expired
dispense quantity is not more than available stock
allergy warning is resolved
interaction warning is resolved
billing is cleared if required
controlled drug approval exists if required
```

Teaching point:

```txt
Frontend validation improves UX.
Backend validation is still mandatory.
```

### Step 16: Test Responsiveness

Check:

```txt
desktop
tablet
mobile
long medicine names
long patient names
many filters
empty table
50+ orders
100+ inventory rows
```

Tables should not break layout. Use horizontal scrolling where needed.

### Step 17: Project Setup, Run, Start, and Verification Commands

This step teaches how to run the project locally and how to verify that the module is ready.

#### 17.1 Install Dependencies

When opening the project for the first time, install dependencies:

```txt
npm install
```

Use this when:

```txt
node_modules folder is missing
package-lock.json changed
new package was added
project is newly cloned
```

#### 17.2 Run Project in Development Mode

For daily coding, run:

```txt
npm run dev
```

This starts the Next.js development server.

Default URL:

```txt
http://localhost:3000
```

Pharmacy module URLs will open like this:

```txt
http://localhost:3000/pharmacy
http://localhost:3000/pharmacy/orders
http://localhost:3000/pharmacy/inventory
```

Teaching point:

```txt
npm run dev is for development.
It watches file changes and refreshes the browser automatically.
```

#### 17.3 If Port 3000 Is Busy

Sometimes another server is already using port `3000`.

Then run on another port:

```txt
npm run dev -- -p 3001
```

Open:

```txt
http://localhost:3001
```

Other possible ports:

```txt
npm run dev -- -p 3002
npm run dev -- -p 3003
```

#### 17.4 TypeScript Check

Before handoff, run:

```txt
npm run typecheck
```

This checks TypeScript errors without creating a production build.

Use this after:

```txt
creating new types
adding new props
changing API response shape
renaming fields
moving components
```

#### 17.5 Production Build Check

Run:

```txt
npm run build
```

This checks whether the app can be built for production.

Use this before:

```txt
git push
deployment
handoff to tester
demo to client
```

Teaching point:

```txt
Development server can sometimes run even when production build fails.
So always run npm run build before final handoff.
```

#### 17.6 Start Production Build Locally

After `npm run build`, you can test production mode locally:

```txt
npm run start
```

Default URL:

```txt
http://localhost:3000
```

If port is busy:

```txt
npm run start -- -p 3001
```

Teaching point:

```txt
npm run start does not watch file changes.
It serves the already built production app.
For coding, use npm run dev.
For production testing, use npm run build and npm run start.
```

#### 17.7 Lint Check

If available and configured:

```txt
npm run lint
```

Lint checks code style and React rules.

In some projects, lint may show old issues from other modules. If that happens:

```txt
Check whether the error is from your changed files.
Fix your module errors first.
Do not change unrelated modules unless required.
```

#### 17.8 Common Command Summary

| Command | Use |
| --- | --- |
| `npm install` | Install project dependencies |
| `npm run dev` | Start local development server |
| `npm run dev -- -p 3001` | Start dev server on another port |
| `npm run typecheck` | Check TypeScript errors |
| `npm run build` | Create/check production build |
| `npm run start` | Run built production app locally |
| `npm run lint` | Check lint/style issues |

#### 17.9 Final Manual Testing Checklist

Before handoff, confirm:

```txt
all routes open
navigation links work
filters work
pagination works
modals open and close
mobile layout is usable
typecheck passes
build passes
```

## 20. Teaching Exercise For New Joiners

Use this small exercise in class before asking the team to build the full Pharmacy module.

### Exercise Goal

Create only one page:

```txt
/pharmacy/orders
```

The page should show:

- page header
- search input
- status filter
- 10 dummy pharmacy orders
- table
- pagination bar
- centered detail modal when one order is clicked

### Step-by-Step Practice

1. Create route folder:

```txt
src/app/(app)/pharmacy/orders/page.tsx
```

2. Create feature folder:

```txt
src/features/pharmacy/
```

3. Create type file:

```txt
src/features/pharmacy/pharmacy-types.ts
```

4. Create dummy data:

```txt
src/features/pharmacy/pharmacy-data.ts
```

5. Create UI page:

```txt
src/features/pharmacy/pharmacy-pages.tsx
```

6. Route file should call feature page:

```tsx
import { PharmacyOrdersPage } from "@/features/pharmacy/pharmacy-pages";

export default function Page() {
  return <PharmacyOrdersPage />;
}
```

7. Run:

```txt
npm run typecheck
npm run build
```

## 21. Common Mistakes To Avoid

New developers usually make these mistakes:

- Putting full UI inside `src/app/(app)/pharmacy/page.tsx`.
- Creating one huge file with route, UI, data, and types mixed together.
- Forgetting pagination after 10 rows.
- Forgetting mobile table overflow.
- Creating duplicate filter components on every page.
- Using string values everywhere instead of TypeScript types.
- Calling backend APIs directly inside many components instead of one API file.
- Not handling loading, empty, and error states.
- Not adding the module into `src/data/navigation.ts`.
- Not running `npm run typecheck` before handoff.

## 22. Easy Explanation Script For Tutor

You can explain it like this:

```txt
Suppose we are building Pharmacy.
First we decide URLs.
Every URL gets one route file inside src/app.
But that file is only a door.
The real room is inside src/features/pharmacy.
There we keep screen UI, shared components, dummy data, types, and API functions.
This keeps the project clean when the module becomes large.
```

Then show this:

```txt
URL: /pharmacy/orders
Route file: src/app/(app)/pharmacy/orders/page.tsx
UI file: src/features/pharmacy/pharmacy-pages.tsx
Types file: src/features/pharmacy/pharmacy-types.ts
Data file: src/features/pharmacy/pharmacy-data.ts
API file: src/features/pharmacy/pharmacy-api.ts
```

## 23. Final Checklist

Before considering the module complete:

- All routes load.
- Navigation entry works.
- Every list has search/filter.
- Every list has pagination after 10 rows.
- Mobile layout does not overflow.
- Tables are horizontally scrollable where needed.
- Detail windows are readable.
- Status and priority are visually clear.
- Dummy data covers normal, urgent, delayed, blocked, and completed cases.
- API layer is ready for backend integration.
- Typecheck passes.
- Production build passes.
