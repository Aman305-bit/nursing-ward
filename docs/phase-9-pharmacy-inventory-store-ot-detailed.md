# Phase 9 Detailed Document: Pharmacy, Inventory, Store, And OT

## Phase Goal

Build the production-grade UI screens for pharmacy management, prescription queue, pharmacy billing placeholders, pharmacy inventory, batch and expiry management, purchase/vendor workflows, stock audit, central and department store workflows, stock transfer, asset placeholders, expiry tracking, OT scheduling, surgery management, anesthesia notes, surgical notes, OT billing placeholders, instrument tracking, sterilization, and infection control.

This phase is UI-only and uses static data. It should feel ready for pharmacy, stock, store, and operation theatre operations, but no backend inventory engine, pharmacy dispense integration, billing engine, barcode scanner integration, purchase accounting, vendor portal, OT device integration, sterilization machine integration, or e-prescription service is required in this phase.

## Dependency On Previous Phases

Phase 9 must use the foundations from Phases 1 to 8.

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
- Audit log style for sensitive changes.
- Confirmation pattern for high-risk actions.
- User, role, department, doctor, nurse, and hospital static data.

Required Phase 3 patterns:

- Patient search and quick view.
- Patient profile header.
- Patient alert display.
- Patient documents and consent states.
- Patient privacy and masking rules.

Required Phase 4 patterns:

- Appointment, calendar, queue, token, and front-office handoff patterns.

Required Phase 5 patterns:

- Prescription UI.
- Allergy and clinical warning patterns.
- Clinical handoff placeholders to pharmacy and billing.

Required Phase 6 patterns:

- IPD admission context.
- MAR state pattern.
- OT-adjacent inpatient/emergency handoff patterns.
- Infection/isolation warning pattern.

Required Phase 7 patterns:

- EMR attachment/timeline handoff.
- Record access audit and privacy patterns.

Required Phase 8 patterns:

- Diagnostic order/report context where OT/pharmacy may reference lab/radiology readiness.
- Report/attachment handoff placeholders.

Important rule:

All Phase 9 screens must follow the Phase 1 theme and responsive system. Do not create separate pharmacy, inventory, store, OT, stock, batch, expiry, instrument, or surgery status styles outside the shared design system.

## Phase 9 Scope

Phase 9 covers:

- Pharmacy dashboard.
- Prescription queue.
- Dispense workflow placeholder.
- Pharmacy billing placeholder.
- Pharmacy inventory store.
- Batch management.
- Expiry management.
- Purchase management.
- Purchase requests.
- Purchase orders.
- Vendor management.
- Drug interaction alert placeholders.
- Stock audit.
- Inventory item master.
- Central store.
- Department store.
- GRN management.
- Stock transfer.
- Asset management placeholder.
- Expiry tracking across pharmacy and stores.
- OT scheduling.
- Surgery management.
- Pre-op checklist.
- Anesthesia notes.
- Surgical notes.
- OT billing placeholders.
- Instrument tracking.
- Sterilization state.
- Infection control.
- OT cleaning status.

Phase 9 does not cover:

- Real pharmacy dispensing backend.
- Real billing/payment engine.
- Real purchase accounting.
- Real vendor portal.
- Real barcode scanner integration.
- Real stock ledger posting.
- Real anesthesia device integration.
- Real sterilization device integration.
- Real OT clinical device integration.
- Real controlled-drug regulatory reporting.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/pharmacy` | Pharmacy dashboard | Prescription queue, stock alerts, sales placeholders, pending dispense. |
| `/pharmacy/prescriptions` | Prescription queue | OPD/IPD prescriptions, dispense workflow placeholder. |
| `/pharmacy/billing` | Pharmacy billing | Medicine invoice placeholder, payment status, print. |
| `/pharmacy/inventory` | Pharmacy inventory | Pharmacy item stock, batch, expiry, reorder. |
| `/pharmacy/batches` | Batch management | Batch list, batch stock, expiry alerts. |
| `/pharmacy/expiry` | Expiry management | Near-expiry, expired, quarantine placeholder. |
| `/pharmacy/purchases` | Purchase management | Purchase requests, purchase orders, supplier status. |
| `/pharmacy/vendors` | Vendor management | Vendor list, contacts, purchase history. |
| `/pharmacy/drug-alerts` | Drug alerts | Drug interaction and allergy placeholders. |
| `/pharmacy/stock-audit` | Stock audit | Physical/system stock variance and approval placeholder. |
| `/inventory` | Inventory dashboard | Central stock, department stock, transfers, audit, expiry. |
| `/inventory/items` | Item master | Item definitions, categories, units, reorder levels. |
| `/inventory/central-store` | Central store | Central store stock and issue workflow. |
| `/inventory/department-store` | Department store | Department stock request, issue, return. |
| `/inventory/grn` | GRN management | Goods receipt note list and verification placeholder. |
| `/inventory/transfers` | Stock transfer | Transfer request, issue, receive, history. |
| `/inventory/assets` | Asset management | Asset list, assignment, maintenance placeholder. |
| `/inventory/vendors` | Store vendors | Vendor list and supply history. |
| `/inventory/audit` | Store stock audit | Store-wise audit, variance, approval placeholder. |
| `/ot` | OT dashboard | OT schedule, surgery list, room status, infection alerts. |
| `/ot/schedule` | OT scheduling | Surgery calendar, OT room, surgeon/anesthesia team. |
| `/ot/surgeries` | Surgery management | Pre-op, intra-op, post-op states. |
| `/ot/anesthesia` | Anesthesia notes | Pre-anesthesia, intra-op, recovery placeholders. |
| `/ot/surgical-notes` | Surgical notes | Procedure notes, implants, complications, instructions. |
| `/ot/billing` | OT billing placeholder | OT charges, consumables, package link. |
| `/ot/instruments` | Instrument tracking | Instrument sets, sterilization, usage history. |
| `/ot/infection-control` | Infection control | Infection checklist, OT cleaning, alerts. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/pharmacy` | Pharmacy pages | Main HMS app shell from Phase 1. |
| `(app)/inventory` | Inventory/store pages | Main HMS app shell from Phase 1. |
| `(app)/ot` | Operation theatre pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 9 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for pharmacy invoices, dispense slips, purchase orders, GRNs, stock transfer forms, audit sheets, OT schedules, surgical notes, and instrument checklists.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Prescription, dispense, stock, batch, expiry, purchase, audit, OT, surgery, instrument, sterilization, and infection statuses must use shared status tokens.
- Never hardcode page-level colors.
- Expired/near-expiry, low stock, critical stock, and infection risk states must be readable in all themes.
- Print views should use Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 9 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column worklist cards and full-screen drawers.
- Tablet screens can use two-column forms and compact stock/OT worklists.
- Laptop and desktop screens can use dense tables, split panels, and detail drawers.
- Wide desktop screens can show worklist, patient/order context, and transaction/detail panel together.
- No page-level horizontal scroll.
- Dense stock, batch, prescription, OT schedule, and instrument tables may scroll inside their own containers.
- Sticky headers and sticky actions must not cover dispense rows, stock forms, audit rows, or OT notes.

### Operational Workflow Pattern

Required:

- Sticky page header.
- Patient/order context where applicable.
- Stock/store/OT context where applicable.
- Worklist filters.
- Detail drawer or split panel.
- Status-aware actions.
- Approval state.
- Print/export placeholders.
- EMR/audit handoff indicator.

Avoid:

- Hidden patient identity.
- Hidden stock batch/expiry context.
- Long unstructured forms.
- Multiple popup dependency.
- Deep nested operational menus.
- Full page reloads for status changes.

## Status Standards

### Prescription/Dispense Statuses

- Pending.
- Partially dispensed.
- Dispensed.
- On hold.
- Cancelled.
- Substitution requested placeholder.
- Returned placeholder.

### Stock Statuses

- In stock.
- Low stock.
- Critical stock.
- Out of stock.
- Reserved.
- Quarantined.
- Expired.
- Near expiry.

### Purchase Statuses

- Draft.
- Requested.
- Approved placeholder.
- Ordered.
- Partially received.
- Received.
- Cancelled.
- Rejected placeholder.

### Stock Transfer Statuses

- Requested.
- Approved placeholder.
- Issued.
- In transit.
- Received.
- Partially received.
- Rejected.
- Cancelled.

### OT Statuses

- Scheduled.
- Pre-op pending.
- Ready for surgery.
- In surgery.
- Recovery.
- Completed.
- Cancelled.
- Delayed.

### Instrument/Sterilization Statuses

- Available.
- In use.
- Used.
- Cleaning.
- Sterilization pending.
- Sterilized.
- Missing.
- Damaged.
- Quarantined.

Status rules:

- Status must use text, icon, and token color.
- Expiry, critical stock, missing instrument, damaged instrument, infection risk, and surgery delay states must be visually distinct.
- Placeholder integrations must be clearly marked.

## Safety And Governance Rules

Phase 9 touches medicines, consumables, stock, surgery, and infection control.

Required:

- Patient identity must remain visible for prescription, billing, and OT screens.
- Prescription allergy and interaction warnings from Phase 5 must remain visible.
- Batch and expiry must be visible before dispense.
- Out-of-stock and expired stock cannot be dispensed visually.
- Substitute medicine requires reason placeholder.
- Controlled/high-risk medicine warning placeholder must be visible.
- Controlled medicine dispense requires authorization, reason, and register entry placeholder.
- Return-to-stock requires inspection status before quantity becomes saleable.
- Recalled, damaged, expired, or quarantined stock must remain blocked from dispense/issue.
- Stock adjustment requires reason placeholder.
- Stock ledger history must be visible for item, batch, transfer, GRN, return, and adjustment changes.
- Stock audit variance requires approval placeholder.
- Purchase approval and cancellation require reason placeholder.
- GRN, transfer, and issue/receive flows must preserve chain-of-custody placeholders.
- OT patient identity, consent, allergies, diagnosis, and procedure must remain visible.
- OT checklist must show missing consent, pending preparation, infection risk, and instrument readiness.
- WHO-style sign-in, time-out, and sign-out checklist placeholders must be visible in OT workflows.
- Surgical counts for sponge, needle, and instrument items must be represented before surgery completion.
- Implant, consumable, and specimen handoff placeholders must preserve traceability.
- Instrument missing/damaged state requires reason placeholder.
- Sterilization cycle, expiry, and indicator result placeholders must be visible before instrument availability.
- Infection checklist failure requires reason placeholder.
- Completed surgery notes open read-only unless addendum/revision placeholder.

High-impact actions:

- Dispense medicine.
- Substitute medicine.
- Cancel dispense.
- Return medicine.
- Approve controlled medicine dispense placeholder.
- Adjust stock.
- Approve stock variance.
- Issue stock transfer.
- Receive stock transfer.
- Mark returned stock saleable/quarantined.
- Start stock recall/quarantine workflow placeholder.
- Mark batch expired/quarantined.
- Approve purchase order placeholder.
- Cancel purchase order.
- Start surgery.
- Confirm surgical counts.
- Complete surgery.
- Mark instrument missing/damaged.
- Mark sterilization cycle passed/failed.
- Mark OT infection checklist failed.
- Release OT room after cleaning.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All Phase 9 screens. |
| Hospital Admin | Read-only dashboards and operational approval placeholders. |
| Doctor | Prescription status, OT schedule, surgery notes for assigned patients. |
| Nurse | Medication/consumable requests, OT checklist, infection checklist placeholders. |
| Pharmacist | Prescription queue, dispense, pharmacy stock, batch/expiry, pharmacy billing placeholder. |
| Store Manager | Inventory, central store, department store, GRN, stock transfer, stock audit. |
| Purchase Manager | Purchase requests, purchase orders, vendor management. |
| OT Coordinator | OT schedule, room allocation, instruments, infection control. |
| Surgeon | Surgery detail, surgical notes, pre/post-op placeholders. |
| Anesthetist | Anesthesia notes, recovery status placeholders. |
| Billing Executive | Pharmacy/OT billing placeholders. |
| Management | Read-only operational dashboards. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view allowed records but cannot edit or approve.
- Disabled actions should explain required permission.
- Completed/approved records use read-only or revision placeholder states.

## Page 1: Pharmacy Dashboard

### Purpose

Provide a high-level pharmacy operations dashboard.

### Route

`/pharmacy`

### Summary Cards

- Pending prescriptions.
- Partially dispensed.
- Dispensed today.
- Low stock.
- Near expiry.
- Expired/quarantined.
- Pending pharmacy bills placeholder.
- Drug alerts.

### Widgets

- Prescription queue.
- Stock alerts.
- Expiry alerts.
- Top moving items placeholder.
- Purchase pending placeholder.
- Returns placeholder.

### Quick Actions

- Open prescription queue.
- Search medicine.
- Add stock placeholder.
- Print dispense list.
- Open expiry dashboard.

### Acceptance

- Pharmacy state is clear.
- Low stock and expiry states are visible.
- Worklist entry points are low-click.

## Page 2: Prescription Queue

### Purpose

Manage OPD/IPD prescriptions and dispense workflow placeholders.

### Route

`/pharmacy/prescriptions`

### Filters

- Date range.
- Source: OPD, IPD, emergency.
- Department.
- Doctor.
- Patient search.
- Status.
- Priority.
- Allergy/interactions.

### Table Columns

- Prescription number.
- Patient.
- UHID.
- Source.
- Doctor.
- Medicines.
- Allergy alert.
- Stock status.
- Dispense status.
- Actions.

### Dispense Drawer

Sections:

- Patient summary.
- Prescription summary.
- Allergy/interactions.
- Medicine rows.
- Batch selection.
- Stock availability.
- Substitute reason placeholder.
- Dispense confirmation.
- Print preview.

### Medicine Row Fields

- Medicine.
- Dose/frequency/duration.
- Requested quantity.
- Available quantity.
- Batch.
- Expiry.
- Dispense quantity.
- Substitution status.
- Alerts.

### Actions

- Dispense.
- Partial dispense.
- Hold.
- Substitute placeholder.
- Cancel dispense placeholder.
- Print dispense slip.

### Safety Rules

- Expired batch cannot be selected visually.
- Allergy/interaction alert requires acknowledgement placeholder.
- Substitute medicine requires reason placeholder.
- Partial dispense requires reason placeholder.
- Controlled/high-risk medicine warning placeholder is visible.

### Acceptance

- Prescription queue is scannable.
- Batch/expiry and stock are visible before dispense.
- Allergy/interactions from Phase 5 are preserved.

## Page 3: Pharmacy Billing Placeholder

### Purpose

Prepare pharmacy invoice and payment status UI.

### Route

`/pharmacy/billing`

### Sections

- Patient/prescription summary.
- Dispensed medicines.
- Invoice draft placeholder.
- Payment status.
- Refund/return placeholder.

### Table Columns

- Medicine.
- Batch.
- Quantity.
- Rate placeholder.
- Discount placeholder.
- Tax placeholder.
- Amount placeholder.

### Actions

- Create invoice placeholder.
- Mark payment pending.
- Print invoice.
- Return medicine placeholder.
- Send to billing module placeholder.

### Safety Rules

- Billing is placeholder only in Phase 9.
- Return medicine must preserve batch and expiry context.
- Returned medicine should not automatically return to saleable stock without verification placeholder.

### Acceptance

- Pharmacy billing placeholder is clear.
- Invoice print uses print-safe light theme.
- Future billing handoff is visible.

## Page 4: Pharmacy Inventory, Batch, And Expiry

### Purpose

Manage pharmacy item stock, batch stock, reorder levels, expiry alerts, and quarantine placeholders.

### Routes

- `/pharmacy/inventory`
- `/pharmacy/batches`
- `/pharmacy/expiry`

### Inventory Table Columns

- Item.
- Generic/name.
- Category.
- Unit.
- Stock.
- Reorder level.
- Critical level.
- Near expiry.
- Expired.
- Status.
- Actions.

### Batch Table Columns

- Item.
- Batch number.
- Vendor.
- Received date.
- Expiry date.
- Quantity.
- Saleable quantity.
- Quarantined quantity.
- Status.
- Actions.

### Expiry Views

- Near expiry.
- Expired.
- Quarantined.
- Return to vendor placeholder.
- Dispose placeholder.

### Actions

- View item.
- View stock ledger.
- Adjust stock placeholder.
- Quarantine batch.
- Mark expired.
- Mark recall placeholder.
- Return to vendor placeholder.
- Print stock card placeholder.

### Safety Rules

- Expired stock cannot be dispensed visually.
- Quarantine requires reason placeholder.
- Stock adjustment requires reason placeholder.
- Recall/quarantine reason, affected batch, and affected stock location must be visible.
- Returned or recalled stock cannot become saleable without inspection placeholder.
- Stock ledger entries are read-only history once created.
- Disposal/return to vendor is placeholder only and requires confirmation.

### Acceptance

- Stock, batch, and expiry states are easy to scan.
- Expired/quarantined stock is visually distinct.
- Stock adjustment is reason-gated.
- Batch-level ledger, recall, and return-to-stock safety states are represented.

## Page 5: Purchase And Vendor Management

### Purpose

Manage purchase requests, purchase orders, supplier status, and vendors.

### Routes

- `/pharmacy/purchases`
- `/pharmacy/vendors`
- `/inventory/vendors`

### Purchase Request Columns

- Request number.
- Department/store.
- Items.
- Requested by.
- Priority.
- Status.
- Requested date.
- Actions.

### Purchase Order Columns

- PO number.
- Vendor.
- Items.
- Expected date.
- Amount placeholder.
- Status.
- Actions.

### Vendor Table Columns

- Vendor name.
- Code.
- Contact.
- Category.
- Rating placeholder.
- Last purchase.
- Status.
- Actions.

### Actions

- Create purchase request.
- Approve request placeholder.
- Create purchase order.
- Cancel PO placeholder.
- View vendor.
- Print PO.

### Safety Rules

- Approval/cancellation requires reason placeholder.
- Vendor inactive state blocks new PO visually.
- Purchase amount is placeholder until finance phase.

### Acceptance

- Purchase and vendor workflows are clear.
- PO print placeholder is available.
- Vendor state is visible.

## Page 6: Drug Alerts

### Purpose

Show drug interaction, allergy, duplicate therapy, and stock safety placeholders.

### Route

`/pharmacy/drug-alerts`

### Alert Types

- Allergy conflict.
- Drug interaction.
- Duplicate therapy.
- High-risk medicine.
- Controlled medicine.
- Pediatric caution.
- Pregnancy/lactation caution.
- Chronic disease caution.
- Expired/near-expiry stock warning.

### Table Columns

- Alert time.
- Patient.
- Prescription.
- Medicine.
- Alert type.
- Severity.
- Acknowledgement status.
- Actions.

### Actions

- Acknowledge placeholder.
- Open prescription.
- Notify doctor placeholder.

### Acceptance

- Alerts are hard to miss.
- Acknowledgement state is visible.
- Does not claim real drug database integration.

## Page 7: Stock Audit

### Purpose

Support stock audit, physical vs system stock variance, and approval placeholder.

### Routes

- `/pharmacy/stock-audit`
- `/inventory/audit`

### Table Columns

- Audit number.
- Store.
- Item.
- Batch.
- System stock.
- Physical stock.
- Variance.
- Reason.
- Approval status.
- Actions.

### Actions

- Start audit.
- Enter physical stock.
- Submit variance.
- Approve variance placeholder.
- Reject variance placeholder.
- Print audit sheet.

### Safety Rules

- Variance requires reason placeholder.
- Approval/rejection requires authorized user placeholder.
- Audit records are read-only after approval placeholder.

### Acceptance

- Variances are easy to identify.
- Approval state is clear.
- Print audit sheet placeholder is available.

## Page 8: Inventory Dashboard And Item Master

### Purpose

Manage central inventory item definitions and stock overview.

### Routes

- `/inventory`
- `/inventory/items`

### Dashboard Cards

- Total items.
- Low stock items.
- Out-of-stock items.
- Near expiry items.
- Pending transfers.
- Pending GRNs.
- Audit variances.

### Item Master Fields

- Item name.
- Item code.
- Category.
- Unit of measure.
- Stock type.
- Reorder level.
- Critical level.
- Default vendor.
- Tax placeholder.
- Status.

### Actions

- Add item.
- Edit item.
- Deactivate item.
- Print item list.

### Safety Rules

- Deactivate item requires reason placeholder.
- Item code duplicate warning placeholder is visible.
- Tax and price fields are placeholders until finance phase.

### Acceptance

- Item master supports pharmacy and store items.
- Stock threshold fields are clear.
- Low-stock dashboard is useful.

## Page 9: Central Store And Department Store

### Purpose

Manage central store stock, department stock, issue, request, return, and consumption placeholders.

### Routes

- `/inventory/central-store`
- `/inventory/department-store`

### Store Views

- Central stock.
- Department stock.
- Requests.
- Issues.
- Returns.
- Consumption placeholder.

### Table Columns

- Item.
- Store/department.
- Batch.
- Available stock.
- Requested quantity.
- Issued quantity.
- Returned quantity.
- Status.
- Actions.

### Actions

- Create request.
- Approve request placeholder.
- Issue stock.
- Receive stock.
- Return stock.
- Print issue slip.

### Safety Rules

- Issue quantity cannot exceed available stock visually.
- Return requires condition status placeholder.
- Department stock should show minimum stock alert placeholder.

### Acceptance

- Central and department stores share consistent patterns.
- Issue/return states are visible.
- Stock context is not hidden.

## Page 10: GRN Management

### Purpose

Manage goods receipt note list, received quantities, batch creation, and verification placeholder.

### Route

`/inventory/grn`

### Table Columns

- GRN number.
- PO number.
- Vendor.
- Received date.
- Items.
- Verification status.
- Invoice placeholder.
- Actions.

### GRN Drawer Sections

- Vendor/PO summary.
- Received items.
- Batch details.
- Expiry dates.
- Quantity verification.
- Short/extra quantity variance.
- Rejection/damage notes.
- Quality check placeholder.
- Approval placeholder.

### Actions

- Create GRN.
- Verify quantities.
- Reject damaged items placeholder.
- Mark item short/extra placeholder.
- Move damaged item to quarantine placeholder.
- Create batch.
- Print GRN.

### Safety Rules

- Batch and expiry are required for batch-managed items.
- Damaged/rejected items require reason placeholder.
- Short, excess, damaged, or rejected quantity variance requires reason placeholder.
- Damaged or rejected goods cannot be moved to saleable stock.
- GRN approval posts stock only as placeholder.
- GRN approval should show future stock ledger entry preview.

### Acceptance

- GRN workflow is clear.
- Batch creation context is visible.
- Damaged/rejected items are represented.
- Quantity variance and quality check states are represented.

## Page 11: Stock Transfer

### Purpose

Manage stock transfer requests, issue, receive, and transfer history.

### Route

`/inventory/transfers`

### Table Columns

- Transfer number.
- From store.
- To store.
- Items.
- Requested by.
- Status.
- Requested date.
- Actions.

### Transfer Drawer Sections

- Transfer summary.
- Item lines.
- Batch selection.
- Issue confirmation.
- Receive confirmation.
- Variance notes.
- Chain-of-custody status.
- Status history.

### Actions

- Create transfer.
- Approve placeholder.
- Issue stock.
- Receive stock.
- Mark partial receive.
- Reject transfer.
- Print transfer note.

### Safety Rules

- Issue requires available stock.
- Receive variance requires reason placeholder.
- Batch identity must be preserved.
- Issued quantity, received quantity, and damaged/missing quantity must be visible together.
- Transfer handoff requires issuer, receiver, date/time, and status placeholder.
- Rejection/cancellation requires reason placeholder.

### Acceptance

- Transfer source and destination are visible.
- Batch and quantity variance states are clear.
- Transfer history is visible.
- Issue-to-receive chain of custody is visible.

## Page 12: Asset Management Placeholder

### Purpose

Provide basic asset list, department assignment, and maintenance status placeholders.

### Route

`/inventory/assets`

### Table Columns

- Asset.
- Asset code.
- Category.
- Department.
- Assigned to.
- Maintenance status.
- Last service.
- Status.
- Actions.

### Actions

- Add asset placeholder.
- Assign department.
- Mark maintenance.
- Print asset list.

### Acceptance

- Asset state is visible.
- Maintenance status is clear.
- This remains a placeholder for future asset workflow.

## Page 13: OT Dashboard

### Purpose

Provide operation theatre operational overview.

### Route

`/ot`

### Summary Cards

- Surgeries today.
- OT rooms available.
- In surgery.
- Delayed surgeries.
- Instrument pending.
- Infection checklist pending.
- Recovery patients.

### Widgets

- OT schedule.
- Room status.
- Surgery queue.
- Instrument readiness.
- Cleaning status.
- Infection alerts.

### Quick Actions

- Schedule surgery.
- Open surgery list.
- Open instruments.
- Open infection checklist.

### Acceptance

- OT state is visible at a glance.
- Delays, instruments, and infection alerts are visible.

## Page 14: OT Scheduling

### Purpose

Schedule surgeries, OT rooms, surgeon/anesthesia teams, and preparation state.

### Route

`/ot/schedule`

### Calendar Views

- Day.
- Week.
- OT room.
- Surgeon.
- Anesthesia team.

### Scheduling Fields

- Patient.
- Admission/visit.
- Procedure.
- Surgeon.
- Anesthetist.
- OT room.
- Date/time.
- Estimated duration.
- Priority.
- Consent status.
- Pre-op checklist status.
- Instrument set status.

### Safety Rules

- Consent and pre-op status must be visible before scheduling/start.
- OT room conflict requires warning placeholder.
- Emergency surgery override requires reason placeholder.
- Infection/isolation patient flag must be visible.

### Acceptance

- OT schedule is readable.
- Room/team conflicts are clear.
- Patient readiness is visible.

## Page 15: Surgery Management

### Purpose

Manage case list, pre-op, intra-op, post-op, and recovery states.

### Route

`/ot/surgeries`

### Surgery Statuses

- Scheduled.
- Pre-op pending.
- Ready.
- In surgery.
- Surgery completed.
- Recovery.
- Cancelled.
- Delayed.

### Table Columns

- Time.
- Patient.
- Procedure.
- Surgeon.
- Anesthetist.
- OT room.
- Status.
- Consent.
- Instruments.
- Actions.

### Surgery Detail Tabs

- Patient.
- Pre-op checklist.
- Anesthesia.
- Sign-in/time-out/sign-out checklist.
- Intra-op.
- Surgical notes.
- Instruments.
- Surgical counts.
- Implants/consumables.
- Specimen handoff.
- Recovery.
- Billing placeholder.
- Audit.

### Actions

- Start pre-op.
- Mark ready.
- Start surgery.
- Confirm time-out checklist.
- Record surgical counts.
- Complete surgery.
- Move to recovery.
- Cancel surgery placeholder.

### Safety Rules

- Start surgery requires readiness checklist placeholder.
- Time-out checklist must show patient, procedure, site/side, consent, anesthesia readiness, and instrument readiness.
- Sponge, needle, and instrument count mismatch requires reason/escalation placeholder.
- Implant and consumable usage should preserve item, batch, and quantity placeholder.
- Cancellation/delay requires reason placeholder.
- Completed surgery opens read-only unless addendum/revision placeholder.

### Acceptance

- Surgery state is easy to track.
- Readiness blockers are visible.
- OT checklist, counts, implant/consumable traceability, and specimen handoff are represented.
- Detail tabs avoid long vertical pages.

## Page 16: Anesthesia Notes

### Purpose

Capture pre-anesthesia, intra-op anesthesia notes, and recovery status placeholders.

### Route

`/ot/anesthesia`

### Sections

- Pre-anesthesia checkup.
- Airway assessment placeholder.
- ASA grade placeholder.
- Allergy/medication history.
- Anesthesia plan.
- Intra-op monitoring placeholder.
- Anesthesia medicines placeholder.
- Recovery status.

### Actions

- Save note.
- Mark fit for anesthesia placeholder.
- Add intra-op note.
- Mark recovery complete placeholder.
- Print anesthesia note.

### Safety Rules

- Allergy and critical alerts remain visible.
- Fit-for-anesthesia status required before start-surgery placeholder.
- Completed notes use revision/addendum placeholder.

### Acceptance

- Anesthesia workflow is structured.
- Pre-op and recovery states are visible.
- Print note placeholder is available.

## Page 17: Surgical Notes

### Purpose

Capture surgical notes, implants, complications, post-op instructions, and addendum placeholders.

### Route

`/ot/surgical-notes`

### Sections

- Procedure performed.
- Indication.
- Findings.
- Surgical steps.
- Implants/consumables.
- Implant/consumable batch and quantity placeholder.
- Blood loss placeholder.
- Complications.
- Specimen sent to lab placeholder.
- Specimen label/handoff placeholder.
- Post-op instructions.
- Follow-up plan.

### Actions

- Save draft.
- Complete note.
- Add addendum placeholder.
- Print surgical note.
- Send specimen to lab placeholder.

### Safety Rules

- Completed note opens read-only unless addendum placeholder.
- Specimen sent to lab should create lab handoff placeholder.
- Specimen handoff should show label, collector, receiving department, and time placeholder.
- Implant/consumable use should link to OT billing/stock placeholder.
- Implant and consumable rows should preserve batch, expiry, and source store placeholder.

### Acceptance

- Surgical note is structured and printable.
- Addendum and lab handoff placeholders are visible.
- Consumable, implant, and specimen traceability is visible.

## Page 18: OT Billing Placeholder

### Purpose

Prepare OT charges, consumables, implants, package links, and billing handoff placeholders.

### Route

`/ot/billing`

### Sections

- Surgery summary.
- OT room charges placeholder.
- Surgeon/anesthesia charges placeholder.
- Consumables.
- Implants.
- Package link.
- Billing status.

### Actions

- Add charge placeholder.
- Send to billing.
- Print OT billing summary.

### Safety Rules

- Billing is placeholder only in Phase 9.
- Consumables/implants should preserve batch/stock context.
- Package inclusion/exclusion should be visible.

### Acceptance

- OT billing handoff is clear.
- Consumables and implants are visible.
- Future billing integration is prepared.

## Page 19: Instrument Tracking

### Purpose

Track instrument sets, sterilization state, usage history, missing/damaged status, and OT allocation.

### Route

`/ot/instruments`

### Table Columns

- Instrument set.
- Code.
- Sterilization status.
- Sterilization cycle.
- Sterilization expiry.
- Current location.
- Assigned surgery.
- Last used.
- Missing items.
- Damaged items.
- Actions.

### Actions

- Assign to surgery.
- Mark used.
- Send for cleaning.
- Mark packed.
- Mark sterilized.
- Mark sterilization failed.
- Mark missing/damaged.
- Print checklist.

### Safety Rules

- Instrument readiness required before surgery start placeholder.
- Missing/damaged status requires reason placeholder.
- Sterilization status must be visible.
- Instrument lifecycle should show used, cleaning, packed, sterilized, available, and quarantined states.
- Sterilization cycle number, expiry, and indicator result placeholders must be visible.
- Failed sterilization keeps instrument set unavailable.
- Used instruments cannot be reassigned until cleaning/sterilization placeholder.

### Acceptance

- Instrument readiness is clear.
- Sterilization chain is represented.
- Missing/damaged states are visible.
- Sterilization lifecycle and failed-cycle states are represented.

## Page 20: Infection Control

### Purpose

Manage infection checklist, OT cleaning status, sterilization alerts, and room readiness.

### Route

`/ot/infection-control`

### Sections

- OT room cleaning status.
- Infection checklist.
- Sterilization status.
- Isolation patient warning.
- Post-surgery cleaning.
- Room release checklist.
- Infection alert log.

### Statuses

- Clean.
- Cleaning due.
- Cleaning in progress.
- Ready.
- Failed checklist.
- Blocked.

### Actions

- Start cleaning.
- Mark clean.
- Fail checklist.
- Block room.
- Release room.
- Print infection checklist.

### Safety Rules

- Failed checklist requires reason placeholder.
- Blocked room cannot be scheduled visually.
- Isolation/infection risk patient should trigger warning.
- Release room requires cleaning completion placeholder.
- Release room requires failed items resolved or override reason placeholder.
- Cleaning status should show responsible staff and completion time placeholder.

### Acceptance

- Room readiness is clear.
- Infection alerts are visible.
- Cleaning workflow is represented safely.
- Block, fail, resolve, and release states are clear.

## Static Data Requirements

Phase 9 should add or expand static data files.

Recommended data:

- `mockPharmacyDashboard`.
- `mockPrescriptionQueue`.
- `mockDispenseItems`.
- `mockPharmacyBills`.
- `mockPharmacyInventory`.
- `mockBatches`.
- `mockExpiryItems`.
- `mockControlledMedicineRegister`.
- `mockMedicineReturns`.
- `mockStockLedger`.
- `mockStockRecalls`.
- `mockPurchaseRequests`.
- `mockPurchaseOrders`.
- `mockVendors`.
- `mockDrugAlerts`.
- `mockStockAudits`.
- `mockInventoryItems`.
- `mockCentralStoreStock`.
- `mockDepartmentStoreStock`.
- `mockGrns`.
- `mockStockTransfers`.
- `mockAssets`.
- `mockOtSchedule`.
- `mockSurgeries`.
- `mockAnesthesiaNotes`.
- `mockSurgicalNotes`.
- `mockOtBilling`.
- `mockOtImplantConsumables`.
- `mockSurgicalCounts`.
- `mockSpecimenHandoffs`.
- `mockInstrumentSets`.
- `mockSterilizationEvents`.
- `mockSterilizationCycles`.
- `mockOtRoomCleaning`.
- `mockInfectionControlLogs`.
- `mockPhase9AuditEvents`.

Prescription queue fields:

- `id`.
- `prescriptionNo`.
- `patientId`.
- `source`.
- `doctorId`.
- `status`.
- `medicineCount`.
- `allergyAlert`.
- `stockStatus`.
- `createdAt`.

Stock item fields:

- `id`.
- `itemCode`.
- `name`.
- `category`.
- `unit`.
- `stock`.
- `reorderLevel`.
- `criticalLevel`.
- `status`.

Batch fields:

- `id`.
- `itemId`.
- `batchNo`.
- `vendorId`.
- `receivedAt`.
- `expiryDate`.
- `quantity`.
- `saleableQuantity`.
- `quarantinedQuantity`.
- `status`.

Stock ledger fields:

- `id`.
- `itemId`.
- `batchId`.
- `sourceType`.
- `sourceId`.
- `locationId`.
- `transactionType`.
- `quantityIn`.
- `quantityOut`.
- `balanceAfter`.
- `reason`.
- `performedBy`.
- `performedAt`.

OT surgery fields:

- `id`.
- `patientId`.
- `admissionId`.
- `procedure`.
- `surgeonId`.
- `anesthetistId`.
- `otRoom`.
- `scheduledAt`.
- `status`.
- `consentStatus`.
- `instrumentStatus`.
- `checklistStatus`.
- `surgicalCountStatus`.

Surgical count fields:

- `id`.
- `surgeryId`.
- `countType`.
- `expectedCount`.
- `actualCount`.
- `status`.
- `verifiedBy`.
- `verifiedAt`.

Instrument fields:

- `id`.
- `setCode`.
- `name`.
- `sterilizationStatus`.
- `sterilizationCycleId`.
- `sterilizationExpiryAt`.
- `currentLocation`.
- `assignedSurgeryId`.
- `missingItems`.
- `damagedItems`.
- `status`.

Sterilization cycle fields:

- `id`.
- `cycleNo`.
- `machinePlaceholder`.
- `startedAt`.
- `completedAt`.
- `indicatorResult`.
- `status`.
- `failedReason`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Patient required for prescription/OT workflows.
- Batch required for dispense.
- Expiry date required for batch-managed items.
- Dispense quantity required and cannot exceed available quantity visually.
- Substitute reason required.
- Partial dispense reason required.
- Controlled medicine authorization and reason required.
- Return-to-stock inspection status required.
- Stock recall/quarantine reason required.
- Stock adjustment reason required.
- Stock ledger transaction reason required for manual corrections.
- Quarantine/disposal/return reason required.
- Purchase approval/cancellation reason required.
- GRN damaged/rejected reason required.
- Transfer variance reason required.
- OT patient/procedure/surgeon/room/time required.
- Consent/pre-op/instrument readiness required before start-surgery placeholder.
- Sign-in/time-out/sign-out checklist completion required before completion state.
- Surgical count completion required before complete-surgery placeholder.
- Surgical count mismatch requires escalation reason placeholder.
- Implant/consumable source stock required when item is selected.
- Specimen handoff label and receiving department required when specimen is marked sent.
- Surgery delay/cancellation reason required.
- Missing/damaged instrument reason required.
- Sterilization cycle and indicator result required before instrument is available.
- Infection checklist failure reason required.
- OT room release requires cleaning completion or override reason placeholder.

Validation UI:

- Inline field error.
- Stock/expiry warning panel.
- Allergy/drug alert panel.
- OT readiness checklist warning.
- Disabled action where required fields are missing.
- Confirmation for high-impact actions.

## Accessibility Requirements

Required:

- Worklists have clear table headers.
- Status is not color-only.
- Stock and expiry warnings have text labels.
- Dispense rows are keyboard navigable.
- OT schedule and instrument rows are keyboard accessible.
- Drawers trap focus and return focus after close.
- Print/export warnings are screen-reader readable.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, filters, tabs, drawers, stock tables, prescription rows, OT schedule, and instrument checklists work without mouse.

## Performance Requirements

Even with static data:

- Worklists should render efficiently.
- Do not load all detail drawers by default.
- Lazy render large stock/audit/OT details where useful.
- Keep patient/order header stable to avoid layout shift.
- Use skeletons for loading-looking states.
- Dense stock tables should use internal scroll areas.

## Page State Requirements

Each Phase 9 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Prescription pending state.
- Partial dispense state.
- Allergy/drug interaction warning state.
- Controlled medicine authorization pending state.
- Low/critical/out-of-stock state.
- Expired/near-expiry/quarantined state.
- Stock recall state.
- Return-to-stock inspection pending state.
- Purchase approval pending state.
- Stock variance state.
- GRN damaged/rejected state.
- Transfer in transit/partial receive state.
- Transfer variance/chain-of-custody state.
- OT scheduled/in-surgery/recovery state.
- OT delayed/cancelled state.
- OT checklist incomplete state.
- Surgical count mismatch state.
- Specimen handoff pending state.
- Instrument missing/damaged state.
- Sterilization pending state.
- Sterilization failed/expired state.
- Infection checklist failed state.
- Room cleaning/release pending state.
- Access denied state.
- Read-only state.

## Phase 9 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pharmacy dashboard | Required | Required | Required | Required | Required | Required | Required |
| Prescription queue | Required | Required | Required | Required | Required | Required | Required |
| Pharmacy billing | Required | Required | Required | Required | Required | Required | Required |
| Pharmacy inventory/batch/expiry | Required | Required | Required | Required | Required | Required | Required |
| Purchase/vendor management | Required | Required | Required | Required | Required | Required | Required |
| Drug alerts | Required | Required | Required | Required | Required | Required | Required |
| Stock audit | Required | Required | Required | Required | Required | Required | Required |
| Inventory dashboard/item master | Required | Required | Required | Required | Required | Required | Required |
| Central/department store | Required | Required | Required | Required | Required | Required | Required |
| GRN management | Required | Required | Required | Required | Required | Required | Required |
| Stock transfer | Required | Required | Required | Required | Required | Required | Required |
| Asset management | Required | Required | Required | Required | Required | Required | Required |
| OT dashboard | Required | Required | Required | Required | Required | Required | Required |
| OT scheduling | Required | Required | Required | Required | Required | Required | Required |
| Surgery management | Required | Required | Required | Required | Required | Required | Required |
| Anesthesia notes | Required | Required | Required | Required | Required | Required | Required |
| Surgical notes | Required | Required | Required | Required | Required | Required | Required |
| OT billing | Required | Required | Required | Required | Required | Required | Required |
| Instrument tracking | Required | Required | Required | Required | Required | Required | Required |
| Infection control | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 9 does not need real export files, but UI should reserve production actions.

Required:

- Print dispense slip placeholder.
- Print pharmacy invoice placeholder.
- Print stock card placeholder.
- Print purchase order placeholder.
- Print GRN placeholder.
- Print stock transfer note placeholder.
- Print stock audit sheet placeholder.
- Print OT schedule placeholder.
- Print anesthesia note placeholder.
- Print surgical note placeholder.
- Print instrument checklist placeholder.
- Print infection checklist placeholder.
- Export inventory list placeholder.
- Export batch/expiry list placeholder.
- Export purchase list placeholder.
- Export stock audit placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Sensitive identifiers remain masked where required.

## Operational Metrics Placeholders

Recommended metrics:

- Pending prescriptions.
- Dispensed prescriptions today.
- Partial dispense count.
- Low stock count.
- Out-of-stock count.
- Near-expiry count.
- Expired/quarantined batch count.
- Controlled medicine pending authorization count.
- Returned stock inspection pending count.
- Active recall/quarantine count.
- Stock variance count.
- Pending PO count.
- Pending GRN count.
- Transfers pending.
- Transfer variance count.
- Surgeries today.
- OT utilization placeholder.
- Delayed surgeries.
- Surgical count mismatch count.
- Specimen handoff pending count.
- Instrument missing/damaged count.
- Sterilization failed/expired count.
- Infection checklist failed count.

These metrics use static data in Phase 9 and later feed reports/analytics phases.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3/4/5/6/7/8 shared patterns are ready.
2. Add pharmacy, inventory, and OT navigation entries.
3. Add Phase 9 static data files.
4. Build pharmacy dashboard.
5. Build prescription queue and dispense drawer.
6. Build pharmacy billing placeholder.
7. Build pharmacy inventory, batch, expiry, recall, return, and stock ledger pages/states.
8. Build purchase and vendor management.
9. Build drug alerts page.
10. Build stock audit.
11. Build inventory dashboard and item master.
12. Build central store and department store.
13. Build GRN management.
14. Build stock transfer.
15. Build asset management placeholder.
16. Build OT dashboard.
17. Build OT scheduling.
18. Build surgery management.
19. Build anesthesia notes.
20. Build surgical notes, surgical count, implant/consumable, and specimen handoff placeholders.
21. Build OT billing placeholder.
22. Build instrument tracking and sterilization lifecycle.
23. Build infection control and OT room release workflow.
24. Add EMR/audit/timeline handoff placeholders.
25. Add role visibility and access denied states.
26. Verify light, dark, system, dynamic preset, and custom color themes.
27. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
28. Polish validation, keyboard behavior, loading states, empty states, print-safe views, and safety warnings.

## Production-Grade Acceptance Checklist

Phase 9 is complete when:

- Pharmacy dashboard shows prescription queue, stock alerts, expiry alerts, and billing placeholders.
- Prescription queue supports OPD/IPD/emergency prescriptions, dispense drawer, batch selection, allergy/drug alerts, partial dispense, substitution, and print.
- Controlled/high-risk medicine dispense shows warning, authorization, reason, and register placeholders.
- Pharmacy billing placeholder supports medicine invoice, payment status, return placeholder, and billing handoff.
- Pharmacy inventory supports item stock, batch, expiry, reorder, critical stock, quarantine, recall, return inspection, stock ledger, and disposal placeholders.
- Purchase and vendor management supports purchase requests, purchase orders, supplier state, print, and approval placeholders.
- Drug alerts show allergy, interaction, duplicate therapy, high-risk, controlled medicine, and expiry warnings.
- Stock audit supports physical/system variance, reason, approval, and print placeholders.
- Inventory item master supports central pharmacy/store item definitions and stock thresholds.
- Central and department stores support stock requests, issues, returns, consumption placeholders, and minimum stock alerts.
- GRN management supports received quantities, batch creation, expiry, short/extra/damaged/rejected items, quality check, ledger preview, and print.
- Stock transfer supports request, issue, receive, partial receive, reject, variance, chain of custody, and history.
- Asset management placeholder supports assignment and maintenance state.
- OT dashboard shows surgery, room, instrument, cleaning, and infection states.
- OT scheduling supports room/team calendar, patient readiness, consent, pre-op, instruments, and emergency override placeholders.
- Surgery management supports pre-op, sign-in/time-out/sign-out, intra-op, surgical counts, implant/consumable traceability, specimen handoff, post-op, recovery, cancellation/delay, and read-only completed state.
- Anesthesia notes support pre-anesthesia, plan, intra-op, recovery, and print placeholders.
- Surgical notes support procedure, findings, implants/consumables with stock context, complications, specimen-to-lab placeholder, post-op instructions, addendum, and print.
- OT billing placeholder supports room charges, surgeon/anesthesia charges, consumables, implants, package link, and billing handoff.
- Instrument tracking supports assignment, usage, cleaning, packing, sterilization cycle, sterilization expiry, failed cycle, missing/damaged, and checklist print.
- Infection control supports OT cleaning, failed checklist, blocked/released room, override reason, isolation warning, and infection alert log.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky patient/order/store/OT headers and sticky actions do not cover content.
- Patient alerts from Phase 3 and clinical warning patterns from Phase 5 remain visible where relevant.
- IPD/emergency context from Phase 6 and diagnostics handoff from Phase 8 are reused where relevant.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, stock tables, prescription rows, OT schedules, and instrument checklists.
- Static data is organized for future pharmacy, billing, inventory, purchase, vendor, OT, sterilization, EMR, and analytics integrations.

## Handoff Notes For Phase 10

Phase 10 can begin after Phase 9 provides:

- Pharmacy prescription queue static data.
- Dispense and batch selection pattern.
- Drug alert pattern.
- Pharmacy inventory/batch/expiry pattern.
- Purchase/vendor/GRN/stock transfer patterns.
- Stock audit and variance pattern.
- OT schedule and surgery state pattern.
- Anesthesia and surgical note patterns.
- Instrument and sterilization state pattern.
- Infection control pattern.
- Pharmacy/OT billing placeholder handoff pattern.

Phase 10 should then focus on billing, finance, insurance, and TPA workflows: billing management, OPD/IPD billing, invoices, payments, refunds, discounts, advance collection, credit billing, package billing, insurance/TPA billing, GST placeholders, ledgers, expenses, revenue, cash counter, bank reconciliation, preauthorization, claims, settlements, package mapping, and rejection management.
