# Phase 10 Detailed Document: Billing, Finance, Insurance, And TPA

## Phase Goal

Build the production-grade UI screens for hospital billing, invoice management, payments, refunds, discounts, advances, credit billing, package billing, finance placeholders, GST placeholders, ledgers, expenses, revenue views, cash counter, bank reconciliation, insurance management, TPA management, preauthorization, claim processing, claim settlement, package mapping, and claim rejection management.

This phase is UI-only and uses static data. It should feel ready for hospital revenue operations, but no real payment gateway, accounting ledger posting, GST filing, bank feed integration, insurer portal integration, TPA API, claim submission engine, settlement reconciliation engine, or statutory reporting integration is required in this phase.

## Dependency On Previous Phases

Phase 10 must use the foundations from Phases 1 to 9.

Required Phase 1 patterns:

- App shell.
- Light, dark, system, and dynamic color theme system.
- Semantic theme tokens.
- Phone, tablet, laptop, desktop, and wide-desktop responsive behavior.
- Sidebar/header navigation.
- Page header pattern.
- Sticky action bar pattern.
- Reusable drawers.
- Reusable tables.
- Reusable forms.
- Global search pattern.
- Notification pattern.
- Static mock data structure.

Required Phase 2 patterns:

- Role-aware navigation and access denied state.
- Audit log style for sensitive actions.
- Confirmation pattern for high-risk actions.
- User, role, department, doctor, nurse, billing, finance, and hospital static data.

Required Phase 3 patterns:

- Patient search and quick view.
- Patient profile header.
- Patient identity, demographics, insurance placeholder, and consent states.
- Patient privacy and masking rules.

Required Phase 4 patterns:

- Appointment, visit, queue, token, and front-office billing handoff patterns.

Required Phase 5 patterns:

- OPD consultation, prescription, procedure, and billing handoff placeholders.

Required Phase 6 patterns:

- IPD admission, bed, package, emergency billing, discharge billing, and billing clearance placeholders.

Required Phase 7 patterns:

- EMR/EHR encounter context.
- Clinical attachment/timeline handoff.
- Record access audit and privacy patterns.

Required Phase 8 patterns:

- Lab/radiology order and billing status placeholders.
- Diagnostic report/attachment handoff for insurance claim documents.

Required Phase 9 patterns:

- Pharmacy billing placeholder.
- OT billing placeholder.
- Pharmacy dispense, batch, and return context.
- OT surgery, implant, consumable, and package handoff context.
- Stock/purchase/vendor placeholders where finance pages need reference context.

Important rule:

All Phase 10 screens must follow the Phase 1 theme and responsive system. Do not create separate billing, finance, insurance, TPA, invoice, payment, claim, GST, cash counter, or ledger styles outside the shared design system.

## Phase 10 Scope

Phase 10 covers:

- Billing dashboard.
- Pending bill worklist.
- Billing tariff and charge master placeholders.
- OPD billing.
- IPD billing.
- Emergency billing continuation from Phase 6.
- Pharmacy billing continuation from Phase 9.
- OT billing continuation from Phase 9.
- Invoice management.
- Payment management.
- Receipt management.
- Refund management.
- Discount approval.
- Advance collection.
- Credit billing.
- Package billing.
- Insurance billing.
- TPA billing.
- GST management placeholder.
- Financial accounting placeholder.
- Ledger management.
- Expense management.
- Revenue management.
- Cash counter.
- Bank reconciliation placeholder.
- Insurance company management.
- Patient policy mapping.
- TPA management.
- Preauthorization.
- Claim processing.
- Claim settlement.
- Insurance package mapping.
- Claim rejection and resubmission management.

Phase 10 does not cover:

- Real payment gateway processing.
- Real cash drawer device integration.
- Real accounting ledger posting.
- Real GST return filing.
- Real bank statement import.
- Real insurance or TPA portal submission.
- Real claim adjudication.
- Real settlement auto-reconciliation.
- Real statutory finance reports.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/billing` | Billing dashboard | Billing summary, pending bills, collections, discounts, refunds, outstanding. |
| `/billing/worklist` | Billing worklist | Pending OPD/IPD/emergency/pharmacy/OT bills. |
| `/billing/tariffs` | Billing tariff and charge master | Service rates, payer tariffs, package rates, override rules. |
| `/billing/opd` | OPD billing | OPD service charges, consultation, procedure, lab, radiology, pharmacy handoff. |
| `/billing/ipd` | IPD billing | Admission charges, bed, nursing, procedures, diagnostics, pharmacy, package, discharge bill. |
| `/billing/invoices` | Invoice management | Invoice list, detail, finalize, cancel, revise, print. |
| `/billing/payments` | Payment management | Cash/card/UPI/bank/split payment placeholders and receipts. |
| `/billing/refunds` | Refund management | Refund request, approval, refund detail, receipt reversal placeholder. |
| `/billing/discounts` | Discount approval | Discount requests, approval queue, reason capture, audit trail. |
| `/billing/advances` | Advance collection | Patient advance, deposit, adjustment, refund placeholder. |
| `/billing/credit` | Credit billing | Company credit, patient credit, outstanding, follow-up placeholder. |
| `/billing/packages` | Package billing | Package assignment, utilization, inclusions, exclusions, overage. |
| `/billing/insurance` | Insurance billing | Insurance payer bill, eligible amount, patient payable, claim handoff. |
| `/billing/tpa` | TPA billing | TPA payer bill, approval status, claim handoff. |
| `/finance` | Finance dashboard | Revenue, collections, expenses, receivables, cash counter, bank status. |
| `/finance/gst` | GST management | Tax summary, invoice tax fields, GST report placeholder. |
| `/finance/accounts` | Financial accounting | Account summary, journal/voucher placeholders. |
| `/finance/ledgers` | Ledger management | Patient, payer, vendor, and company ledger placeholders. |
| `/finance/expenses` | Expense management | Expense entries, category, approval, payment status. |
| `/finance/revenue` | Revenue management | Department, doctor, payer, service, and payment-mode revenue. |
| `/finance/cash-counter` | Cash counter | Counter open/close, collection, handover, day summary. |
| `/finance/bank-reconciliation` | Bank reconciliation | Bank entries, matched/unmatched state placeholder. |
| `/insurance` | Insurance dashboard | Preauth, claims, settlements, rejections, payer aging. |
| `/insurance/companies` | Insurance management | Insurance company list, contracts, policy metadata. |
| `/insurance/tpa` | TPA management | TPA list, contracts, contact details, payer mapping. |
| `/insurance/policies` | Patient policy mapping | Patient policy, coverage, limits, validity, documents. |
| `/insurance/preauth` | Preauthorization | Preauth request, document checklist, approval status. |
| `/insurance/claims` | Claim processing | Claim queue, submission, review, rejection, resubmission. |
| `/insurance/settlements` | Claim settlement | Settlement list, received amount, deductions, shortfall. |
| `/insurance/package-mapping` | Insurance package mapping | Insurer/TPA package mapping and service inclusion. |
| `/insurance/rejections` | Rejection management | Rejected claims, reason, correction, resubmission action. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/billing` | Billing pages | Main HMS app shell from Phase 1. |
| `(app)/finance` | Finance pages | Main HMS app shell from Phase 1. |
| `(app)/insurance` | Insurance and TPA pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 10 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for invoices, receipts, refund notes, discount approval summaries, advance receipts, package summaries, payer bills, GST summaries, ledgers, cash counter reports, preauthorization forms, claim forms, settlement summaries, and rejection letters.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Bill, invoice, payment, refund, discount, claim, settlement, cash counter, reconciliation, and approval statuses must use shared status tokens.
- Never hardcode page-level colors.
- Paid, unpaid, partial, overdue, rejected, cancelled, refunded, under approval, claim rejected, and settlement shortfall states must be readable in all themes.
- Print views should use Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 10 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column bill/claim cards and full-screen drawers.
- Tablet screens can use two-column payment, claim, and approval forms.
- Laptop and desktop screens can use dense tables, split panels, invoice preview, and detail drawers.
- Wide desktop screens can show worklist, patient/payer context, invoice detail, and payment/claim activity together.
- No page-level horizontal scroll.
- Dense invoice, ledger, claim, settlement, and revenue tables may scroll inside their own containers.
- Sticky headers and sticky actions must not cover bill rows, payment forms, approval forms, or claim document lists.

### Operational Workflow Pattern

Required:

- Sticky page header.
- Patient/visit/admission context where applicable.
- Payer/company/TPA context where applicable.
- Worklist filters.
- Detail drawer or split panel.
- Status-aware actions.
- Approval state.
- Print/export placeholders.
- Audit handoff indicator.

Avoid:

- Hidden patient identity.
- Hidden bill source context.
- Long unstructured invoice forms.
- Multiple popup dependency.
- Deep nested finance menus.
- Full page reloads for status changes.

## Status Standards

### Bill Statuses

- Draft.
- Pending.
- Ready to bill.
- Finalized.
- Partially paid.
- Paid.
- Overdue.
- Cancelled.
- Revised.
- Write-off requested placeholder.

### Invoice Statuses

- Draft.
- Issued.
- Printed.
- Partially paid.
- Paid.
- Cancelled.
- Revised.
- Credit note placeholder.

### Payment Statuses

- Pending.
- Received.
- Split payment.
- Failed placeholder.
- Reversed placeholder.
- Refunded.

### Refund Statuses

- Requested.
- Under review.
- Approved.
- Rejected.
- Paid.
- Cancelled.

### Discount Statuses

- Requested.
- Approved.
- Rejected.
- Expired.
- Applied.

### Advance Statuses

- Available.
- Partially adjusted.
- Fully adjusted.
- Refunded.
- On hold.

### Credit Statuses

- Open.
- Partially settled.
- Settled.
- Overdue.
- Disputed.
- Write-off requested placeholder.

### Package Billing Statuses

- Assigned.
- Active.
- Utilized.
- Partially utilized.
- Over limit.
- Exclusion pending.
- Closed.

### Insurance/TPA Statuses

- Eligible.
- Eligibility pending.
- Preauthorization required.
- Preauthorization submitted.
- Preauthorization approved.
- Preauthorization rejected.
- Claim draft.
- Claim submitted.
- Under review.
- Query raised.
- Rejected.
- Resubmitted.
- Settled.
- Short settled.

### Finance Statuses

- Draft.
- Posted placeholder.
- Pending approval.
- Approved.
- Rejected.
- Matched.
- Unmatched.
- Reconciled placeholder.

Status rules:

- Status must use text, icon, and token color.
- Overdue, rejected, cancelled, refund pending, discount approval pending, claim query, and settlement shortfall states must be visually distinct.
- Placeholder integrations must be clearly marked.

## Safety And Governance Rules

Phase 10 touches patient money, refunds, approvals, payer claims, cash, and finance visibility.

Required:

- Patient identity must remain visible for OPD, IPD, pharmacy, OT, insurance, and TPA billing screens.
- Visit/admission/source context must remain visible for every bill line.
- Bill line source must show OPD, IPD, emergency, lab, radiology, pharmacy, OT, package, or manual placeholder.
- Tariff/rate source must be visible for system and manual bill lines.
- Payer tariff, package rate, tax rule, and effective date must be visible where applicable.
- Price override requires reason and permission placeholder.
- Manual bill line requires service category, rate, quantity, and reason placeholder.
- Discount requires reason, approver, approval status, and audit trail placeholder.
- Refund requires original payment, eligible amount, approval, reason, and receipt reversal placeholder.
- Advance adjustment must show source advance and remaining balance.
- Invoice cancellation/revision requires reason placeholder.
- Package inclusion, exclusion, limit, and overage must be visible.
- Insurance eligibility, policy validity, coverage limit, and document status must be visible.
- TPA payer, approval number, approved amount, patient payable, and shortfall must be visible.
- Claim rejection and resubmission require reason and correction checklist placeholder.
- Cash counter close requires opening balance, collected amount, handover amount, variance, and cashier confirmation placeholder.
- Bank reconciliation matching must not hide unmatched entries.
- Finance, cash, refund, discount, and claim actions must show audit trail placeholder.

High-impact actions:

- Finalize bill.
- Create/update tariff placeholder.
- Override tariff/rate.
- Cancel invoice.
- Revise invoice.
- Collect payment.
- Reverse payment placeholder.
- Request refund.
- Approve refund.
- Reject refund.
- Request discount.
- Approve discount.
- Reject discount.
- Adjust advance.
- Mark credit bill settled.
- Assign package.
- Close package.
- Submit preauthorization.
- Mark preauthorization approved/rejected.
- Submit claim.
- Resubmit claim.
- Mark claim settled.
- Mark settlement shortfall.
- Open cash counter.
- Close cash counter.
- Approve expense.
- Mark bank entry matched.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All Phase 10 screens. |
| Hospital Admin | Read-only dashboards and operational approval placeholders. |
| Billing Executive | Billing dashboard, OPD/IPD billing, invoices, payments, receipts, advances, package billing. |
| Billing Manager | Billing approvals, discounts, refunds, credit billing, invoice revision/cancellation. |
| Cashier | Cash counter, payment collection, receipt print, day close. |
| Finance Manager | Finance dashboard, GST, accounting, ledgers, expenses, revenue, bank reconciliation. |
| Insurance Desk | Insurance billing, policies, preauthorization, claim processing, rejections. |
| TPA Coordinator | TPA billing, preauth, claims, settlements, package mapping. |
| Doctor | Read-only charge context and package/claim clinical document status for assigned patients. |
| Nurse | Read-only billing clearance and package status for assigned IPD patients. |
| Pharmacist | Pharmacy bill handoff and payment status only. |
| OT Coordinator | OT billing handoff and package/approval status only. |
| Management | Read-only billing, revenue, receivable, claim, and cash summaries. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view allowed records but cannot edit or approve.
- Disabled actions should explain required permission.
- Finalized/approved records use read-only or revision placeholder states.

## Page 1: Billing Dashboard

### Purpose

Provide a high-level billing operations dashboard.

### Route

`/billing`

### Summary Cards

- Pending bills.
- Bills finalized today.
- Collections today.
- Partial payments.
- Refund requests.
- Discount approvals pending.
- Advances available.
- Credit outstanding.
- Insurance/TPA pending.
- Overdue bills.

### Widgets

- Pending billing worklist.
- Collection by payment mode.
- Revenue by department placeholder.
- Refund queue.
- Discount queue.
- Credit outstanding list.
- Insurance claim pending list.
- Cash counter status.

### Quick Actions

- Create OPD bill.
- Create IPD bill.
- Collect payment.
- Print invoice.
- Record advance.
- Open refund queue.

### Acceptance

- Billing state is clear at a glance.
- Pending money actions are visible.
- User can reach common billing workflows with low clicks.

## Page 2: Billing Worklist

### Purpose

Show all pending billing items across departments.

### Route

`/billing/worklist`

### Filters

- Date range.
- Source: OPD, IPD, emergency, lab, radiology, pharmacy, OT.
- Department.
- Doctor.
- Patient search.
- Payer type.
- Status.
- Priority.
- Billing executive.

### Table Columns

- Bill reference.
- Patient.
- UHID.
- Source.
- Visit/admission.
- Department.
- Amount placeholder.
- Payer type.
- Status.
- Actions.

### Actions

- Open bill.
- Create invoice.
- Collect payment.
- Send approval request placeholder.
- Print estimate.

### Safety Rules

- Patient identity and bill source must be visible.
- Cross-department bill lines must show source context.
- Insurance/TPA bills must show payer and approval state.

### Acceptance

- Worklist is scannable.
- Billing source and patient context are not hidden.
- High-priority pending items are visible.

## Page 3: Billing Tariff And Charge Master

### Purpose

Represent service rates, payer tariffs, package rates, effective dates, and override rule placeholders.

### Route

`/billing/tariffs`

### Sections

- Service charge master.
- Department-wise rates.
- Doctor/consultation rates placeholder.
- Payer tariff placeholder.
- Package rate placeholder.
- Tax rule placeholder.
- Effective date and expiry.
- Override approval rule placeholder.

### Table Columns

- Service code.
- Service name.
- Department.
- Category.
- Base rate.
- Payer rate placeholder.
- Tax rule.
- Effective from.
- Effective to.
- Status.
- Actions.

### Actions

- Add tariff placeholder.
- Edit tariff placeholder.
- Mark inactive.
- View rate history.
- Print tariff summary placeholder.

### Safety Rules

- Rate change requires reason placeholder.
- Effective date must be visible before rate is applied.
- Inactive tariff cannot be selected visually for new bill lines.
- Override rule should explain required approval placeholder.

### Acceptance

- Charge source is clear for billing users.
- Payer/package rate placeholders are represented.
- Rate history and effective dates are visible.

## Page 4: OPD Billing

### Purpose

Create and manage OPD bills from consultation, procedure, diagnostic, pharmacy, and manual charge placeholders.

### Route

`/billing/opd`

### Sections

- Patient/visit summary.
- Consultation charges.
- Procedure charges.
- Lab/radiology charges.
- Pharmacy handoff.
- Manual service line placeholder.
- Discount request.
- Payment summary.
- Invoice preview.

### Bill Line Columns

- Service.
- Source.
- Department.
- Doctor.
- Quantity.
- Rate placeholder.
- Discount.
- Tax placeholder.
- Amount.
- Status.

### Actions

- Add service line.
- Apply discount request.
- Finalize bill.
- Collect payment.
- Print invoice.
- Send to insurance placeholder.

### Safety Rules

- Manual line requires reason placeholder.
- Price override requires approval placeholder.
- Finalize bill requires patient and visit context.
- Discount cannot be applied without approval placeholder.

### Acceptance

- OPD bill can be reviewed without long scrolling.
- Service source and amount are clear.
- Invoice preview is available.

## Page 5: IPD Billing

### Purpose

Manage admission-level billing for bed, nursing, doctor rounds, procedures, diagnostics, pharmacy, OT, packages, advance, insurance, and discharge clearance.

### Route

`/billing/ipd`

### Sections

- Patient/admission summary.
- Bed and ward charges.
- Doctor/nursing charges.
- Procedures.
- Diagnostics.
- Pharmacy charges.
- OT charges.
- Package utilization.
- Advances.
- Insurance/TPA approval.
- Discharge bill summary.

### Tabs

- Charges.
- Package.
- Advances.
- Payments.
- Insurance/TPA.
- Discounts.
- Refunds.
- Discharge clearance.
- Audit.

### Actions

- Generate interim bill.
- Add manual charge placeholder.
- Request discount.
- Adjust advance.
- Create final bill.
- Mark billing clearance placeholder.
- Print bill summary.

### Safety Rules

- Admission status and bed context must remain visible.
- Package inclusions/exclusions must be visible before final bill.
- Discharge clearance requires bill/payment/claim status placeholder.
- Final bill revision requires reason placeholder.

### Acceptance

- IPD bill supports complex charge categories.
- Package, insurance, advance, and discharge clearance states are visible.
- Detail tabs avoid long vertical pages.

## Page 6: Invoice Management

### Purpose

Manage invoices, invoice detail, print, cancellation, revision, and credit note placeholders.

### Route

`/billing/invoices`

### Filters

- Date range.
- Invoice status.
- Patient search.
- Payer type.
- Source.
- Payment status.
- Created by.

### Table Columns

- Invoice number.
- Patient/payer.
- UHID.
- Source.
- Invoice date.
- Gross amount.
- Discount.
- Tax.
- Net amount.
- Paid amount.
- Status.
- Actions.

### Invoice Detail Sections

- Invoice header.
- Patient/payer details.
- Line items.
- Discount and tax summary.
- Payment summary.
- Refund/revision history.
- Print preview.
- Audit trail.

### Actions

- View invoice.
- Print invoice.
- Cancel invoice placeholder.
- Revise invoice placeholder.
- Create credit note placeholder.
- Send invoice placeholder.

### Safety Rules

- Cancel/revise requires reason placeholder.
- Paid invoices require refund/credit note path for reversal placeholder.
- Invoice number is read-only once issued.

### Acceptance

- Invoice list and detail are clear.
- Cancellation/revision states are controlled.
- Print preview uses print-safe light theme.

## Page 7: Payment Management

### Purpose

Collect and track patient/payer payments.

### Route

`/billing/payments`

### Payment Methods

- Cash.
- Card placeholder.
- UPI placeholder.
- Bank transfer placeholder.
- Cheque placeholder.
- Wallet placeholder.
- Split payment.
- Credit adjustment.
- Advance adjustment.

### Sections

- Bill/invoice summary.
- Due amount.
- Payment method selector.
- Split payment rows.
- Receipt preview.
- Payment history.
- Failed/reversed payment placeholder.

### Actions

- Collect payment.
- Add split row.
- Apply advance.
- Print receipt.
- Reverse payment placeholder.

### Safety Rules

- Payment amount cannot exceed due amount unless advance collection path is selected.
- Split payment total must match collected amount.
- Payment reversal requires reason and permission placeholder.
- Receipt number is read-only after collection.

### Acceptance

- Payment collection is low-click.
- Split payment and receipt preview are clear.
- Payment reversal is reason-gated.

## Page 8: Refund Management

### Purpose

Manage refund requests, approvals, and refund payment placeholders.

### Route

`/billing/refunds`

### Filters

- Date range.
- Refund status.
- Patient search.
- Source invoice.
- Payment mode.
- Requested by.

### Table Columns

- Refund number.
- Patient.
- UHID.
- Invoice/payment.
- Requested amount.
- Eligible amount.
- Reason.
- Status.
- Actions.

### Refund Drawer Sections

- Patient and invoice summary.
- Original payment details.
- Refund eligibility.
- Reason.
- Approval status.
- Refund payment placeholder.
- Audit trail.

### Actions

- Request refund.
- Approve refund.
- Reject refund.
- Mark refund paid placeholder.
- Print refund note.

### Safety Rules

- Refund cannot exceed eligible paid amount visually.
- Refund approval requires reason and approver placeholder.
- Refund paid state should link back to original payment placeholder.

### Acceptance

- Refund queue is easy to review.
- Approval and payment states are separated.
- Original payment context is preserved.

## Page 9: Discount Approval

### Purpose

Manage bill discount requests and approvals.

### Route

`/billing/discounts`

### Filters

- Date range.
- Status.
- Department.
- Patient search.
- Requested by.
- Approval level.

### Table Columns

- Request number.
- Patient.
- Bill/invoice.
- Requested amount/percent.
- Reason.
- Requested by.
- Status.
- Actions.

### Approval Drawer Sections

- Patient/bill summary.
- Requested discount.
- Existing discount.
- Reason and notes.
- Approval level placeholder.
- Audit trail.

### Actions

- Request discount.
- Approve discount.
- Reject discount.
- Apply approved discount.

### Safety Rules

- Discount request requires reason.
- Approval amount must not exceed configured static limit placeholder.
- Approved discount should show who approved and when.

### Acceptance

- Discount queue is transparent.
- Approval state is visible before discount application.
- Audit trail is represented.

## Page 10: Advance Collection

### Purpose

Manage patient advances, deposits, adjustments, and refunds.

### Route

`/billing/advances`

### Sections

- Patient summary.
- Advance balance.
- Deposit history.
- Adjustment history.
- Refund history.
- Receipt preview.

### Actions

- Collect advance.
- Adjust against bill.
- Put advance on hold placeholder.
- Refund advance placeholder.
- Print advance receipt.

### Safety Rules

- Advance collection requires patient context.
- Adjustment must show target invoice/bill.
- Advance refund requires approval placeholder.
- Held advance cannot be adjusted visually.

### Acceptance

- Advance balance is always visible.
- Deposits and adjustments are easy to trace.
- Receipt printing is available.

## Page 11: Credit Billing

### Purpose

Manage patient credit, company credit, corporate billing, outstanding, and settlement placeholders.

### Route

`/billing/credit`

### Filters

- Payer type.
- Company.
- Patient search.
- Aging bucket.
- Status.
- Due date.

### Table Columns

- Credit bill number.
- Patient/company.
- UHID.
- Invoice.
- Credit amount.
- Outstanding amount.
- Due date.
- Aging.
- Status.
- Actions.

### Actions

- Create credit bill placeholder.
- Record settlement.
- Mark disputed.
- Request write-off placeholder.
- Print statement.

### Safety Rules

- Credit conversion requires permission placeholder.
- Settlement cannot exceed outstanding amount visually.
- Write-off requires approval and reason placeholder.

### Acceptance

- Outstanding and aging are visible.
- Patient/company credit separation is clear.
- Settlement state is represented.

## Page 12: Package Billing

### Purpose

Assign and track packages, utilization, inclusions, exclusions, and overage.

### Route

`/billing/packages`

### Sections

- Patient/admission summary.
- Package selection.
- Included services.
- Excluded services.
- Utilization summary.
- Overage charges.
- Package closure.

### Table Columns

- Package.
- Start date.
- End date.
- Included amount.
- Utilized amount.
- Balance.
- Overage.
- Status.
- Actions.

### Actions

- Assign package.
- Add exclusion placeholder.
- Review utilization.
- Close package.
- Print package summary.

### Safety Rules

- Package assignment requires admission/visit context.
- Exclusions and overage must be visible before final bill.
- Package closure requires reason placeholder if balance remains.

### Acceptance

- Package coverage is easy to understand.
- Inclusion/exclusion states are visible.
- Overage can be reviewed before final bill.

## Page 13: Insurance And TPA Billing

### Purpose

Prepare payer bills for insurance and TPA workflows.

### Routes

- `/billing/insurance`
- `/billing/tpa`

### Sections

- Patient policy summary.
- Payer/TPA summary.
- Eligible bill lines.
- Non-payable bill lines.
- Patient payable.
- Approved amount.
- Shortfall.
- Claim handoff.

### Actions

- Create payer bill.
- Mark non-payable placeholder.
- Send to preauthorization.
- Send to claim queue.
- Print payer bill.

### Safety Rules

- Policy validity and payer type must be visible.
- Non-payable items require reason placeholder.
- Patient payable and payer payable must be visually separated.
- Claim handoff should preserve invoice and document context.

### Acceptance

- Insurance and TPA bill split is clear.
- Payable/non-payable lines are visible.
- Claim handoff is prepared.

## Page 14: Finance Dashboard

### Purpose

Provide a finance operations dashboard for revenue, receivables, expenses, cash, bank, GST, and claim settlement placeholders.

### Route

`/finance`

### Summary Cards

- Total revenue.
- Collections today.
- Outstanding receivables.
- Insurance/TPA receivables.
- Expenses pending approval.
- Cash counter variance.
- Bank unmatched entries.
- GST/tax summary placeholder.
- Settlement shortfall.

### Widgets

- Revenue trend placeholder.
- Collection by payment mode.
- Receivable aging.
- Expense approval queue.
- Cash counter status.
- Bank reconciliation exceptions.
- Payer settlement summary.

### Quick Actions

- Open cash counter.
- View ledger.
- Review expenses.
- Open revenue summary.
- Open bank reconciliation.
- Print finance summary.

### Safety Rules

- Finance dashboard uses static data only.
- Restricted users see only allowed finance summaries.
- Patient-level drill-down follows masking and role access rules.

### Acceptance

- Finance state is clear at a glance.
- Cash, bank, receivable, expense, and revenue signals are visible.
- Management can reach finance review pages with low clicks.

## Page 15: GST Management

### Purpose

Show GST/tax invoice fields and tax summary placeholders.

### Route

`/finance/gst`

### Sections

- GST dashboard.
- Tax summary by date.
- Invoice tax fields.
- HSN/SAC placeholder.
- GST report placeholder.
- Tax correction placeholder.

### Table Columns

- Invoice number.
- Patient/payer.
- GSTIN placeholder.
- Taxable amount.
- Tax amount.
- Total amount.
- Status.
- Actions.

### Actions

- View GST summary.
- Print tax invoice.
- Export GST report placeholder.
- Mark correction placeholder.

### Safety Rules

- GST filing is placeholder only.
- Tax correction requires reason placeholder.
- GST report export should show backend pending state.

### Acceptance

- GST data is presented clearly.
- Tax invoice print is available.
- Placeholder status is explicit.

## Page 16: Financial Accounting

### Purpose

Show accounting summary, journal, voucher, and posting placeholders.

### Route

`/finance/accounts`

### Sections

- Account summary.
- Journal placeholder.
- Voucher placeholder.
- Receivable summary.
- Payable summary.
- Posting status.

### Actions

- View journal placeholder.
- Create voucher placeholder.
- Approve voucher placeholder.
- Print account summary.

### Safety Rules

- Accounting posting is placeholder only.
- Voucher approval requires reason placeholder.
- Posted records are read-only unless reversal placeholder.

### Acceptance

- Finance placeholder does not claim real accounting integration.
- Summary and voucher states are clear.
- Approval state is represented.

## Page 17: Ledger Management

### Purpose

Show patient, payer, company, and vendor ledger placeholders.

### Route

`/finance/ledgers`

### Ledger Types

- Patient ledger.
- Insurance payer ledger.
- TPA ledger.
- Company credit ledger.
- Vendor ledger placeholder.
- Cash counter ledger placeholder.

### Table Columns

- Date.
- Reference.
- Description.
- Debit placeholder.
- Credit placeholder.
- Balance.
- Status.
- Actions.

### Actions

- View ledger.
- Filter by date.
- Print ledger.
- Export ledger placeholder.

### Safety Rules

- Ledger entries are read-only history.
- Adjustments require separate correction/reversal placeholder.
- Patient-sensitive ledger details must follow masking rules.

### Acceptance

- Ledger history is easy to scan.
- Balance and reference are clear.
- Print/export placeholders are available.

## Page 18: Expense Management

### Purpose

Track expense entries, approvals, payment state, and category summaries.

### Route

`/finance/expenses`

### Filters

- Date range.
- Category.
- Department.
- Vendor.
- Status.
- Payment mode.

### Table Columns

- Expense number.
- Category.
- Department.
- Vendor/payee.
- Amount.
- Payment mode.
- Approval status.
- Payment status.
- Actions.

### Actions

- Add expense.
- Approve expense.
- Reject expense.
- Mark paid placeholder.
- Print voucher placeholder.

### Safety Rules

- Expense approval requires permission placeholder.
- Rejection requires reason placeholder.
- Paid expense becomes read-only unless reversal placeholder.

### Acceptance

- Expense list and approvals are clear.
- Payment state is visible.
- Voucher print placeholder exists.

## Page 19: Revenue Management

### Purpose

Show revenue analytics placeholders for billing and management teams.

### Route

`/finance/revenue`

### Views

- Department revenue.
- Doctor revenue.
- Service revenue.
- Payer revenue.
- Payment mode summary.
- OPD/IPD revenue split.
- Collection vs outstanding.

### Filters

- Date range.
- Department.
- Doctor.
- Source.
- Payer type.
- Payment mode.

### Actions

- View revenue breakdown.
- Print revenue summary.
- Export revenue placeholder.

### Safety Rules

- Revenue analytics are static placeholders.
- Restricted users see only allowed summaries.
- Patient-level drill-down follows privacy rules.

### Acceptance

- Revenue views are scannable.
- Filters are useful for management review.
- Export placeholder is explicit.

## Page 20: Cash Counter

### Purpose

Manage cashier counter opening, collections, handover, variance, and close.

### Route

`/finance/cash-counter`

### Sections

- Counter status.
- Opening balance.
- Current collections.
- Payment mode breakdown.
- Refund paid placeholder.
- Cash handover.
- Variance.
- Day close summary.

### Actions

- Open counter.
- Record cash collection.
- Record handover.
- Close counter.
- Print day close report.

### Safety Rules

- Counter cannot close if unresolved variance exists without reason placeholder.
- Opening and closing balance require cashier confirmation.
- Handover amount must be visible.
- Closed counter is read-only unless manager reopening placeholder.

### Acceptance

- Cashier can understand current counter state quickly.
- Close process is reason-gated.
- Day close print is available.

## Page 21: Bank Reconciliation

### Purpose

Represent bank entry matching and reconciliation placeholders.

### Route

`/finance/bank-reconciliation`

### Sections

- Bank entries placeholder.
- System payments.
- Matched entries.
- Unmatched entries.
- Reconciliation summary.
- Exception notes.

### Actions

- Mark matched placeholder.
- Mark unmatched.
- Add reconciliation note.
- Print reconciliation summary.

### Safety Rules

- Bank integration is placeholder only.
- Manual match requires reason placeholder.
- Unmatched entries remain visible.

### Acceptance

- Matched and unmatched states are clear.
- Reconciliation placeholder is honest.
- Summary print is available.

## Page 22: Insurance Dashboard

### Purpose

Provide an insurance and TPA operations dashboard for preauthorization, claims, settlements, rejections, payer aging, and document readiness.

### Route

`/insurance`

### Summary Cards

- Preauthorization pending.
- Preauthorization query raised.
- Claims draft.
- Claims submitted.
- Claims rejected.
- Settlements pending.
- Short settlements.
- Rejection resubmissions pending.
- Policy documents incomplete.

### Widgets

- Preauthorization queue.
- Claim aging.
- Rejection reason summary.
- Settlement shortfall summary.
- Payer/TPA performance placeholder.
- Document checklist exceptions.

### Quick Actions

- Create preauthorization.
- Open claim queue.
- Review rejected claims.
- Open settlement list.
- Map patient policy.
- Print insurance summary.

### Safety Rules

- Insurance dashboard uses static data only.
- Patient and policy details follow masking rules.
- Claim, preauth, and settlement drill-downs must preserve payer context.

### Acceptance

- Insurance and TPA status is clear at a glance.
- Query, rejection, and shortfall risks are visible.
- Users can reach preauth, claims, settlement, and rejection pages with low clicks.

## Page 23: Insurance Management

### Purpose

Manage insurance companies, contracts, policy metadata, and patient policy mapping.

### Routes

- `/insurance/companies`
- `/insurance/policies`

### Insurance Company Columns

- Company name.
- Code.
- Contact.
- Contract status.
- Cashless available.
- Valid from/to.
- Actions.

### Policy Mapping Fields

- Patient.
- Policy number.
- Insurance company.
- TPA.
- Policy holder.
- Validity.
- Coverage limit.
- Co-pay placeholder.
- Document status.

### Actions

- Add insurance company.
- Edit contract placeholder.
- Map patient policy.
- Upload policy document placeholder.
- Mark policy inactive.

### Safety Rules

- Expired policy cannot be selected visually for active claim.
- Policy document status must be visible.
- Coverage amount is placeholder until claim validation phase.

### Acceptance

- Insurance company and policy state is clear.
- Patient policy mapping supports claim workflows.
- Expired/inactive states are visible.

## Page 24: TPA Management

### Purpose

Manage TPA organizations, contracts, contacts, and payer mapping.

### Route

`/insurance/tpa`

### Table Columns

- TPA name.
- Code.
- Linked insurers.
- Contact person.
- Contact number.
- Contract status.
- SLA placeholder.
- Actions.

### Actions

- Add TPA.
- Link insurance company.
- View contract placeholder.
- Mark inactive.

### Safety Rules

- Inactive TPA cannot be selected visually for new preauthorization.
- Contract expiry must be visible.
- Linked insurer mismatch should show warning placeholder.

### Acceptance

- TPA data is easy to maintain.
- Contract and linkage states are visible.
- Inactive states are blocked visually.

## Page 25: Preauthorization

### Purpose

Manage preauthorization requests, clinical documents, approval status, and query placeholders.

### Route

`/insurance/preauth`

### Filters

- Date range.
- Status.
- Insurance company.
- TPA.
- Patient search.
- Admission.
- Query pending.

### Table Columns

- Preauth number.
- Patient.
- UHID.
- Admission/visit.
- Payer.
- Requested amount.
- Approved amount.
- Status.
- Actions.

### Preauth Drawer Sections

- Patient/admission summary.
- Policy summary.
- Diagnosis/procedure summary.
- Estimated bill.
- Document checklist.
- Query notes.
- Approval details.
- Audit trail.

### Actions

- Create preauth.
- Attach document placeholder.
- Submit preauth.
- Mark approved placeholder.
- Mark rejected placeholder.
- Respond to query placeholder.
- Print preauth form.

### Safety Rules

- Policy validity must be visible.
- Required documents must show complete/incomplete state.
- Rejection/query requires reason placeholder.
- Approved amount and patient payable must be visible.

### Acceptance

- Preauth queue is scannable.
- Document checklist is clear.
- Approval/rejection/query states are represented.

## Page 26: Claim Processing

### Purpose

Manage claim draft, submission, query, rejection, and resubmission placeholders.

### Route

`/insurance/claims`

### Filters

- Date range.
- Claim status.
- Insurance company.
- TPA.
- Patient search.
- Claim type.
- Query/rejection reason.

### Table Columns

- Claim number.
- Patient.
- UHID.
- Payer.
- Invoice.
- Claim amount.
- Submitted amount.
- Status.
- Aging.
- Actions.

### Claim Drawer Sections

- Patient/payer summary.
- Invoice and bill lines.
- Preauthorization link.
- Document checklist.
- Claim amount summary.
- Query/rejection notes.
- Submission history.
- Audit trail.

### Actions

- Create claim draft.
- Validate documents placeholder.
- Submit claim.
- Respond to query placeholder.
- Resubmit claim.
- Mark rejected placeholder.
- Move to settlement placeholder.

### Safety Rules

- Claim submission requires required document checklist complete placeholder.
- Submitted amount cannot exceed eligible amount visually.
- Query/rejection response requires correction note.
- Resubmission must preserve prior rejection history.

### Acceptance

- Claim lifecycle is clear.
- Document and amount validation states are visible.
- Rejection and resubmission are traceable.

## Page 27: Claim Settlement

### Purpose

Track claim settlement, payment received, deductions, short settlement, and patient/company balance.

### Route

`/insurance/settlements`

### Filters

- Settlement date range.
- Payer.
- TPA.
- Status.
- Short settlement.
- Patient search.

### Table Columns

- Settlement number.
- Claim number.
- Patient.
- Payer.
- Claim amount.
- Approved amount.
- Received amount.
- Deduction.
- Shortfall.
- Status.
- Actions.

### Settlement Drawer Sections

- Claim summary.
- Approved amount.
- Received amount.
- Deductions.
- Shortfall.
- Patient payable adjustment placeholder.
- Ledger impact placeholder.
- Audit trail.

### Actions

- Record settlement placeholder.
- Mark short settled.
- Add deduction reason.
- Print settlement summary.
- Send to ledger placeholder.

### Safety Rules

- Received amount cannot exceed approved amount visually without overpayment note placeholder.
- Deduction/shortfall requires reason placeholder.
- Settlement should link to claim and invoice.
- Ledger impact is placeholder only.

### Acceptance

- Settlement and shortfall are easy to review.
- Deduction reasons are visible.
- Claim and invoice links are preserved.

## Page 28: Insurance Package Mapping

### Purpose

Map insurer/TPA packages to hospital packages and service inclusions.

### Route

`/insurance/package-mapping`

### Table Columns

- Mapping code.
- Insurance company/TPA.
- Hospital package.
- Payer package.
- Included services.
- Excluded services.
- Validity.
- Status.
- Actions.

### Actions

- Create mapping.
- Edit inclusion/exclusion placeholder.
- Mark inactive.
- Print mapping summary.

### Safety Rules

- Inactive mapping cannot be selected visually.
- Exclusions must be visible during package billing.
- Mapping changes require reason placeholder.

### Acceptance

- Package mapping is clear.
- Inclusions and exclusions are visible.
- Billing and preauth workflows can reference mapping.

## Page 29: Rejection Management

### Purpose

Manage rejected preauthorizations and claims with correction and resubmission placeholders.

### Route

`/insurance/rejections`

### Filters

- Date range.
- Rejection type.
- Payer.
- Reason category.
- Resubmission status.
- Patient search.

### Table Columns

- Rejection number.
- Patient.
- Claim/preauth.
- Payer.
- Reason category.
- Rejected amount.
- Correction status.
- Resubmission status.
- Actions.

### Actions

- Open rejection.
- Add correction note.
- Attach corrected document placeholder.
- Resubmit.
- Mark closed.

### Safety Rules

- Rejection reason must remain visible.
- Resubmission requires correction note.
- Closed rejection is read-only unless reopen placeholder.

### Acceptance

- Rejections are not lost inside claim pages.
- Correction and resubmission state is visible.
- Rejection history is traceable.

## Static Data Requirements

Phase 10 should add or expand static data files.

Recommended data:

- `mockBillingDashboard`.
- `mockBillingWorklist`.
- `mockBillingTariffs`.
- `mockOpdBills`.
- `mockIpdBills`.
- `mockBillLines`.
- `mockInvoices`.
- `mockPayments`.
- `mockReceipts`.
- `mockRefunds`.
- `mockDiscountRequests`.
- `mockAdvances`.
- `mockCreditBills`.
- `mockPackages`.
- `mockPackageUtilization`.
- `mockInsuranceBills`.
- `mockTpaBills`.
- `mockGstSummaries`.
- `mockFinanceDashboard`.
- `mockAccountSummaries`.
- `mockVouchers`.
- `mockLedgers`.
- `mockExpenses`.
- `mockRevenueSummaries`.
- `mockCashCounters`.
- `mockCashHandover`.
- `mockBankEntries`.
- `mockInsuranceCompanies`.
- `mockInsuranceDashboard`.
- `mockPatientPolicies`.
- `mockTpas`.
- `mockPreauthorizations`.
- `mockClaims`.
- `mockClaimDocuments`.
- `mockClaimSettlements`.
- `mockInsurancePackageMappings`.
- `mockClaimRejections`.
- `mockPhase10AuditEvents`.

Bill fields:

- `id`.
- `billNo`.
- `patientId`.
- `visitId`.
- `admissionId`.
- `source`.
- `payerType`.
- `grossAmount`.
- `discountAmount`.
- `taxAmount`.
- `netAmount`.
- `paidAmount`.
- `dueAmount`.
- `status`.
- `createdAt`.

Bill line fields:

- `id`.
- `billId`.
- `serviceCode`.
- `serviceName`.
- `source`.
- `tariffId`.
- `departmentId`.
- `doctorId`.
- `quantity`.
- `rate`.
- `discountAmount`.
- `taxAmount`.
- `amount`.
- `status`.

Tariff fields:

- `id`.
- `serviceCode`.
- `serviceName`.
- `departmentId`.
- `category`.
- `baseRate`.
- `payerRate`.
- `taxRuleId`.
- `effectiveFrom`.
- `effectiveTo`.
- `overrideApprovalRequired`.
- `status`.

Invoice fields:

- `id`.
- `invoiceNo`.
- `billId`.
- `patientId`.
- `payerId`.
- `invoiceDate`.
- `grossAmount`.
- `discountAmount`.
- `taxAmount`.
- `netAmount`.
- `status`.

Payment fields:

- `id`.
- `receiptNo`.
- `invoiceId`.
- `patientId`.
- `paymentMode`.
- `amount`.
- `status`.
- `collectedBy`.
- `collectedAt`.

Refund fields:

- `id`.
- `refundNo`.
- `paymentId`.
- `invoiceId`.
- `patientId`.
- `requestedAmount`.
- `eligibleAmount`.
- `reason`.
- `status`.
- `approvedBy`.

Policy fields:

- `id`.
- `patientId`.
- `insuranceCompanyId`.
- `tpaId`.
- `policyNo`.
- `policyHolder`.
- `validFrom`.
- `validTo`.
- `coverageLimit`.
- `coPayPercent`.
- `documentStatus`.
- `status`.

Preauthorization fields:

- `id`.
- `preauthNo`.
- `patientId`.
- `admissionId`.
- `policyId`.
- `requestedAmount`.
- `approvedAmount`.
- `queryStatus`.
- `documentStatus`.
- `status`.

Claim fields:

- `id`.
- `claimNo`.
- `patientId`.
- `invoiceId`.
- `preauthId`.
- `payerId`.
- `claimAmount`.
- `submittedAmount`.
- `approvedAmount`.
- `status`.
- `agingDays`.

Settlement fields:

- `id`.
- `settlementNo`.
- `claimId`.
- `approvedAmount`.
- `receivedAmount`.
- `deductionAmount`.
- `shortfallAmount`.
- `reason`.
- `status`.

Cash counter fields:

- `id`.
- `counterNo`.
- `cashierId`.
- `openedAt`.
- `closedAt`.
- `openingBalance`.
- `cashCollected`.
- `refundPaid`.
- `handoverAmount`.
- `variance`.
- `status`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Patient required for OPD/IPD/pharmacy/OT billing workflows.
- Visit or admission required depending on bill source.
- Bill line service, quantity, rate, and source required.
- Tariff effective date required.
- Tariff change reason required.
- Inactive tariff cannot be selected visually for new bill lines.
- Manual bill line reason required.
- Price override reason and permission placeholder required.
- Discount request amount/percent and reason required.
- Discount approval/rejection reason required.
- Invoice cancellation/revision reason required.
- Payment amount required and cannot exceed due amount visually.
- Split payment total must match collected amount.
- Refund requires original payment, eligible amount, and reason.
- Refund amount cannot exceed eligible amount visually.
- Advance adjustment requires target bill/invoice.
- Credit settlement cannot exceed outstanding amount visually.
- Package assignment requires visit/admission and package.
- Package exclusion/overage reason required.
- Insurance policy validity required for active payer bill.
- Preauthorization requires policy, estimated amount, and document checklist state.
- Claim submission requires invoice, payer, eligible amount, and document checklist state.
- Claim resubmission requires correction note.
- Settlement deduction/shortfall reason required.
- Cash counter close requires variance reason if mismatch exists.
- Bank reconciliation manual match requires reason placeholder.
- Expense approval/rejection reason required.

Validation UI:

- Inline field error.
- Amount mismatch warning panel.
- Patient/payer context warning.
- Approval warning panel.
- Claim document checklist warning.
- Cash counter variance warning.
- Disabled action where required fields are missing.
- Confirmation for high-impact actions.

## Accessibility Requirements

Required:

- Worklists have clear table headers.
- Amounts and statuses are not color-only.
- Overdue/rejected/refund/discount/claim warnings have text labels.
- Invoice lines are keyboard navigable.
- Payment method controls are keyboard accessible.
- Drawers trap focus and return focus after close.
- Print/export warnings are screen-reader readable.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, payer search, filters, tabs, drawers, bill tables, payment rows, approval queues, claim document lists, and cash counter actions work without mouse.

## Performance Requirements

Even with static data:

- Worklists should render efficiently.
- Do not load all invoice, ledger, claim, or settlement details by default.
- Lazy render large detail drawers where useful.
- Keep patient/bill/payer header stable to avoid layout shift.
- Use skeletons for loading-looking states.
- Dense billing, ledger, claim, settlement, and revenue tables should use internal scroll areas.

## Page State Requirements

Each Phase 10 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Draft bill state.
- Pending bill state.
- Tariff inactive/effective-date state.
- Finalized bill state.
- Partially paid state.
- Paid state.
- Overdue state.
- Invoice cancelled/revised state.
- Payment failed/reversed placeholder state.
- Refund requested/approved/rejected/paid state.
- Discount requested/approved/rejected state.
- Advance available/adjusted/refunded state.
- Credit overdue/disputed state.
- Package active/over-limit/closed state.
- Insurance eligibility pending state.
- Preauthorization submitted/query/approved/rejected state.
- Claim draft/submitted/query/rejected/resubmitted/settled state.
- Settlement shortfall state.
- Finance dashboard restricted-summary state.
- Cash counter open/close/variance state.
- Bank matched/unmatched state.
- Expense pending/approved/rejected state.
- Insurance dashboard query/rejection/shortfall risk state.
- Access denied state.
- Read-only state.

## Phase 10 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Billing dashboard | Required | Required | Required | Required | Required | Required | Required |
| Billing worklist | Required | Required | Required | Required | Required | Required | Required |
| Billing tariff and charge master | Required | Required | Required | Required | Required | Required | Required |
| OPD billing | Required | Required | Required | Required | Required | Required | Required |
| IPD billing | Required | Required | Required | Required | Required | Required | Required |
| Invoice management | Required | Required | Required | Required | Required | Required | Required |
| Payment management | Required | Required | Required | Required | Required | Required | Required |
| Refund management | Required | Required | Required | Required | Required | Required | Required |
| Discount approval | Required | Required | Required | Required | Required | Required | Required |
| Advance collection | Required | Required | Required | Required | Required | Required | Required |
| Credit billing | Required | Required | Required | Required | Required | Required | Required |
| Package billing | Required | Required | Required | Required | Required | Required | Required |
| Insurance/TPA billing | Required | Required | Required | Required | Required | Required | Required |
| Finance dashboard | Required | Required | Required | Required | Required | Required | Required |
| GST management | Required | Required | Required | Required | Required | Required | Required |
| Financial accounting | Required | Required | Required | Required | Required | Required | Required |
| Ledger management | Required | Required | Required | Required | Required | Required | Required |
| Expense management | Required | Required | Required | Required | Required | Required | Required |
| Revenue management | Required | Required | Required | Required | Required | Required | Required |
| Cash counter | Required | Required | Required | Required | Required | Required | Required |
| Bank reconciliation | Required | Required | Required | Required | Required | Required | Required |
| Insurance dashboard | Required | Required | Required | Required | Required | Required | Required |
| Insurance management | Required | Required | Required | Required | Required | Required | Required |
| TPA management | Required | Required | Required | Required | Required | Required | Required |
| Preauthorization | Required | Required | Required | Required | Required | Required | Required |
| Claim processing | Required | Required | Required | Required | Required | Required | Required |
| Claim settlement | Required | Required | Required | Required | Required | Required | Required |
| Package mapping | Required | Required | Required | Required | Required | Required | Required |
| Rejection management | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 10 does not need real export files, but UI should reserve production actions.

Required:

- Print bill estimate placeholder.
- Print OPD invoice placeholder.
- Print IPD interim bill placeholder.
- Print IPD final bill placeholder.
- Print receipt placeholder.
- Print refund note placeholder.
- Print discount approval summary placeholder.
- Print advance receipt placeholder.
- Print credit statement placeholder.
- Print package summary placeholder.
- Print payer bill placeholder.
- Print GST invoice placeholder.
- Print ledger placeholder.
- Print expense voucher placeholder.
- Print revenue summary placeholder.
- Print cash counter close report placeholder.
- Print bank reconciliation summary placeholder.
- Print preauthorization form placeholder.
- Print claim form placeholder.
- Print settlement summary placeholder.
- Print rejection letter placeholder.
- Export invoice list placeholder.
- Export collection report placeholder.
- Export ledger placeholder.
- Export claim list placeholder.
- Export settlement list placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Sensitive identifiers remain masked where required.

## Operational Metrics Placeholders

Recommended metrics:

- Pending bills.
- Bills finalized today.
- Collection today.
- Cash collection.
- UPI/card/bank collection placeholders.
- Partial payments.
- Outstanding amount.
- Overdue amount.
- Refund requests pending.
- Discounts pending approval.
- Advances collected.
- Advances adjusted.
- Credit outstanding.
- Package overage count.
- Insurance eligibility pending.
- Preauthorization pending.
- Claim submitted.
- Claim query raised.
- Claim rejected.
- Claim settled.
- Settlement shortfall.
- Cash counter variance.
- Bank unmatched count.
- Expense pending approval.
- Department revenue.
- Doctor revenue.
- Payer revenue.

These metrics use static data in Phase 10 and later feed reports/analytics phases.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3/4/5/6/7/8/9 shared patterns are ready.
2. Add billing, finance, insurance, and TPA navigation entries.
3. Add Phase 10 static data files.
4. Build billing dashboard.
5. Build billing worklist.
6. Build billing tariff and charge master placeholders.
7. Build OPD billing.
8. Build IPD billing.
9. Build invoice management.
10. Build payment management.
11. Build refund management.
12. Build discount approval.
13. Build advance collection.
14. Build credit billing.
15. Build package billing.
16. Build insurance and TPA billing.
17. Build finance dashboard.
18. Build GST management placeholder.
19. Build financial accounting placeholder.
20. Build ledger management.
21. Build expense management.
22. Build revenue management.
23. Build cash counter.
24. Build bank reconciliation placeholder.
25. Build insurance dashboard.
26. Build insurance company and patient policy management.
27. Build TPA management.
28. Build preauthorization.
29. Build claim processing.
30. Build claim settlement.
31. Build insurance package mapping.
32. Build rejection management.
33. Add audit/timeline handoff placeholders.
34. Add role visibility and access denied states.
35. Verify light, dark, system, dynamic preset, and custom color themes.
36. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
37. Polish validation, keyboard behavior, loading states, empty states, print-safe views, and approval warnings.

## Production-Grade Acceptance Checklist

Phase 10 is complete when:

- Billing dashboard shows pending bills, collections, refunds, discounts, advances, credit, insurance, and cash counter status.
- Billing worklist supports OPD, IPD, emergency, lab, radiology, pharmacy, OT, package, insurance, and TPA bill sources.
- Billing tariff and charge master supports service rates, payer rates, tax rules, effective dates, inactive states, override approval rules, and rate history.
- OPD billing supports consultation, procedure, diagnostic, pharmacy, manual charge, discount, payment, invoice, and insurance handoff placeholders.
- IPD billing supports bed, ward, doctor, nursing, diagnostics, pharmacy, OT, package, advance, insurance, discharge bill, and clearance placeholders.
- Invoice management supports list, detail, print, cancellation, revision, credit note placeholder, and audit.
- Payment management supports cash/card/UPI/bank/cheque/wallet placeholders, split payment, advance adjustment, receipt, and reversal placeholder.
- Refund management supports request, approval, rejection, paid state, refund note, and original payment link.
- Discount approval supports request queue, reason, approval/rejection, applied state, and audit.
- Advance collection supports deposit, adjustment, hold, refund placeholder, balance, and receipt.
- Credit billing supports patient/company credit, aging, settlement, dispute, write-off placeholder, and statement print.
- Package billing supports assignment, inclusions, exclusions, utilization, overage, closure, and package summary print.
- Insurance and TPA billing support payer split, non-payable lines, patient payable, approved amount, shortfall, and claim handoff.
- Finance dashboard shows revenue, collections, receivables, expenses, cash counter, bank exceptions, GST/tax summary, and settlement shortfall placeholders.
- GST management supports tax fields, tax summary, tax invoice print, correction placeholder, and export placeholder.
- Financial accounting placeholder supports account summary, journal/voucher placeholders, approval, and read-only posted state.
- Ledger management supports patient, payer, company, vendor, and cash counter ledger placeholders.
- Expense management supports expense list, approval, rejection, payment status, and voucher print.
- Revenue management supports department, doctor, service, payer, payment-mode, OPD/IPD, and collection/outstanding views.
- Cash counter supports opening balance, collections, handover, refund paid, variance, close, and day close print.
- Bank reconciliation supports bank entries, system payments, matched/unmatched state, notes, and summary print.
- Insurance dashboard shows preauthorization, claims, settlements, rejections, document exceptions, payer aging, and shortfall risks.
- Insurance management supports insurance companies, patient policy mapping, policy validity, coverage, co-pay, and document status.
- TPA management supports TPA list, insurer links, contract state, contact details, and inactive blocking.
- Preauthorization supports patient/admission, policy, estimate, documents, query, approval, rejection, and print.
- Claim processing supports draft, document validation, submission, query, rejection, resubmission, and settlement handoff.
- Claim settlement supports received amount, deductions, shortfall, patient payable adjustment placeholder, ledger impact placeholder, and print.
- Insurance package mapping supports payer/hospital package mapping, inclusions, exclusions, validity, and inactive state.
- Rejection management supports rejected claims/preauths, reason, correction note, corrected document placeholder, resubmission, and close state.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky patient/bill/payer headers and sticky actions do not cover content.
- Patient privacy, masking, access denied, and audit patterns from earlier phases are reused.
- Pharmacy/OT billing handoffs from Phase 9 are represented without claiming real billing integration.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, bill rows, invoice lines, payment rows, approval queues, claim documents, and cash counter actions.
- Static data is organized for future real billing, finance, insurance, TPA, accounting, payment gateway, GST, and analytics integrations.

## Handoff Notes For Phase 11

Phase 11 can begin after Phase 10 provides:

- Billing dashboard and worklist patterns.
- Billing tariff/rate-card pattern.
- OPD/IPD invoice and payment state patterns.
- Refund, discount, advance, credit, and package billing patterns.
- Insurance/TPA payer split pattern.
- Preauthorization, claim, settlement, and rejection patterns.
- Finance dashboard, cash counter, ledger, expense, revenue, GST, and bank reconciliation placeholder patterns.
- Insurance dashboard pattern.
- Print/export placeholder patterns for finance documents.
- Role-aware access for billing, finance, cashier, insurance, TPA, and management users.

Phase 11 should then focus on HRMS, administration, communication, and reports: employee management, attendance, shifts, leave, payroll placeholders, recruitment, appraisal, training, staff documents, front office administration, housekeeping, laundry, cafeteria, visitor management, security desk, complaints, feedback, SMS/email/WhatsApp/push notification placeholders, MIS reports, financial reports, clinical reports, operational reports, doctor performance reports, revenue analytics, bed occupancy analytics, audit reports, and custom report builder.
