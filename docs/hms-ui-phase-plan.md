# Plasmit Hospital HMS UI Phase Plan

## Purpose

This document defines the recommended UI delivery phases for the Plasmit Hospital HMS frontend project.

The project is currently UI-only and will use static data. The goal is to build an enterprise-grade, single-hospital, multi-department HMS interface with fast clinical workflows, low navigation complexity, tab-based screens, sticky headers, sticky actions, reusable drawers, responsive grids, and keyboard-friendly interactions.

## Recommended Phase Count

Recommended total: **12 phases**

The phases are ordered from foundation and high-frequency clinical workflows first, then operational, financial, administrative, reporting, integration, mobile, and smart healthcare modules.

## Global UI Rules For All Phases

- Use tab-based screens for complex workflows.
- Use sticky page headers for title, search, filters, and primary context.
- Use sticky action bars/buttons for save, submit, print, approve, discharge, bill, and similar actions.
- Use reusable drawers for quick view, edit, filters, audit details, document preview, and patient summary.
- Avoid long vertical pages by grouping content into tabs, sections, grids, and split panes.
- Avoid deep nested menus and multiple popup dependency.
- Keep screens responsive for desktop, tablet, and mobile.
- Support low-click workflows for reception, doctors, nurses, billing, pharmacy, lab, and radiology teams.
- Design for role-based access visibility, even while using static data.

## Phase 1: UI Foundation, Layout, And Design System

**Goal:** Build the base UI framework used by all modules.

**Pages / Screens Covered**

- Main application shell: sidebar/topbar, role switcher, hospital context, department context.
- Dashboard layout base: stat cards, quick actions, compact grids, charts placeholder.
- Reusable components: tabs, sticky headers, sticky action bar, drawers, tables, filters, forms, empty states, alerts.
- Responsive layout system: desktop, tablet, and mobile behavior.
- Global search UI: search overlay, recent searches, patient/module result preview.
- Notification center UI: alerts, tasks, clinical warnings, unread/read state.

**Short Coverage:** This phase creates the common UI language so all later pages feel consistent and enterprise-ready.

## Phase 2: Authentication, Security, Roles, And Master Setup

**Goal:** Create the access, administration, and setup screens needed before hospital operations begin.

**Pages / Screens Covered**

- Login page: username/password, forgot password, role-based landing behavior.
- Role and permission management: roles, module permissions, action permissions, tab access.
- User management: users, assigned roles, departments, status, reset password action.
- Department management: department list, department profile, active/inactive status.
- Hospital master setup: hospital profile, address, contacts, identifiers, operational settings.
- Branch management future-ready UI: branch list and branch profile placeholders.
- Security management: sessions, device list, IP restriction, password policy UI.
- Audit log system: user activity, module activity, filters, detail drawer.

**Short Coverage:** This phase covers admin control screens and prepares the UI for multi-role workflows.

## Phase 3: Patient Management, Registration, And Documents

**Goal:** Build the core patient identity and record-entry experience.

**Pages / Screens Covered**

- Patient registration: quick registration, detailed registration, ABHA / Health ID fields.
- Patient search and list: filters, recent patients, status indicators, quick actions.
- Patient profile: demographics, contacts, insurance summary, tags, alerts.
- Patient visit history: OPD, IPD, emergency, lab, radiology, pharmacy, billing history.
- Family management: family members, relation mapping, shared contact details.
- Patient documents: upload/list UI, categories, preview drawer, verification state.
- Consent management: consent forms, signed status, digital consent preview.
- Patient portal UI: profile summary, appointments, reports, prescriptions, bills.

**Short Coverage:** This phase establishes the patient record as the center of the HMS UI.

## Phase 4: Appointments, Scheduling, Queue, And Front Office

**Goal:** Create reception and appointment workflows with low-click operations.

**Pages / Screens Covered**

- Appointment management: appointment list, booking form, reschedule, cancel, status update.
- Doctor scheduling: doctor availability, slots, holidays, department-wise schedule.
- Calendar management: day/week/month views, appointment density, doctor filter.
- Queue management: waiting list, in-consultation, completed, skipped, called status.
- Token management: token issue, token board UI, counter-wise token state.
- Follow-up management: follow-up list, due follow-ups, reminder actions.
- Teleconsultation UI: virtual appointment status, call link placeholder, notes area.
- Front office and reception management: patient check-in, enquiry, visitor direction, quick billing link.

**Short Coverage:** This phase focuses on fast reception workflow and appointment visibility.

## Phase 5: OPD Clinical Workflow

**Goal:** Build doctor-facing OPD screens for consultation and prescription.

**Pages / Screens Covered**

- OPD consultation: patient header, visit context, tabs for notes, diagnosis, prescription, procedures.
- Clinical notes: complaints, history, examination, advice, follow-up.
- SOAP notes: subjective, objective, assessment, plan tab layout.
- Diagnosis management: diagnosis list, primary/secondary diagnosis, ICD coding.
- Prescription management: medicine entry, dosage, frequency, duration, instructions, print preview.
- Procedure management: recommended/performed procedures, charges link placeholder.
- Vaccination management: vaccination schedule, administered vaccines, due vaccines.
- Chronic disease management: condition tracking, long-term notes, risk markers.
- Allergy management: allergy list, severity, reaction, alert display.
- Vitals management: vitals entry, trends, abnormal indicators.
- Clinical templates: reusable templates for notes, diagnosis, prescriptions.

**Short Coverage:** This phase creates the high-speed OPD doctor workspace with tabs and sticky actions.

## Phase 6: IPD, Admission, Nursing, And Emergency

**Goal:** Cover inpatient, nursing, bed, ICU, discharge, and emergency workflows.

**Pages / Screens Covered**

- Admission management: admission request, admission form, consultant assignment.
- Bed, ward, and ICU management: bed map, availability, occupancy, transfer action.
- Nursing station: assigned patients, tasks, medication due, vitals due, alerts.
- Doctor rounds: round notes, plan updates, orders, review status.
- Nursing assessment: assessment forms, risk scoring UI, observations.
- Medication administration: MAR view, scheduled/done/missed medicine state.
- Intake output chart: fluid intake, output, balance summary.
- Transfer management: bed/ward/ICU transfer request and history.
- Discharge management: discharge checklist, summary tabs, approval and print action.
- Package management: IPD package selection, included/excluded services.
- Emergency registration: rapid registration, unknown patient support, emergency tag.
- Triage management: priority level, vitals, symptoms, triage queue.
- Casualty and trauma management: emergency case sheet, trauma notes, stabilization status.
- Ambulance management: ambulance request, arrival status, driver/vehicle info.
- Emergency billing: quick charges, emergency invoice, payment status.

**Short Coverage:** This phase builds the hospital's critical care and inpatient operation screens.

## Phase 7: EMR / EHR And Clinical Record Continuity

**Goal:** Create longitudinal clinical record screens across departments.

**Pages / Screens Covered**

- EMR page: encounter-wise medical records, clinical documents, prescriptions, reports.
- EHR page: lifetime patient health summary, chronic history, allergies, procedures.
- Medical history: past illness, surgical history, family history, social history.
- Progress notes: inpatient and outpatient timeline notes.
- Clinical attachments: uploaded clinical files, images, reports, scanned notes.
- Digital signature UI: signature status, signed by, pending signature list.
- Clinical timeline: chronological view of visits, tests, prescriptions, admissions, bills.

**Short Coverage:** This phase connects patient information into a unified clinical timeline.

## Phase 8: Laboratory And Radiology

**Goal:** Build diagnostic department workflows for LIS and radiology.

**Pages / Screens Covered**

- Laboratory management: lab dashboard, order list, sample status, result status.
- Test master: test list, departments, sample type, normal ranges, pricing placeholder.
- Test package management: package list, included tests, active/inactive state.
- Sample collection: collection queue, barcode label UI, collected/pending state.
- Sample processing: processing board, machine/manual status, department routing.
- Barcode management: barcode preview, reprint action, scan field UI.
- Analyzer integration UI: connected devices, sync status, result import placeholder.
- Result entry: result form, abnormal flags, comments, attachment.
- Pathologist approval: approval queue, review drawer, approve/reject action.
- Critical alerts: critical result list, notification status, acknowledgement.
- Histopathology, microbiology, biochemistry, hematology: department-specific worklists.
- Radiology management: radiology dashboard, order list, modality status.
- Radiology scheduling: slot booking, modality calendar, patient preparation state.
- PACS integration UI: study list, image availability, PACS link placeholder.
- DICOM viewer placeholder: image viewer layout, series panel, tools placeholder.
- Radiology reporting: report editor UI, template picker, approval status.
- Ultrasound, CT, MRI, X-Ray, mammography, PET scan pages: modality worklists and report states.

**Short Coverage:** This phase covers test ordering visibility, sample workflow, reporting, and modality-based diagnostic UI.

## Phase 9: Pharmacy, Inventory, Store, And OT

**Goal:** Cover medicine, stock, purchase, store, and operation theatre workflows.

**Pages / Screens Covered**

- Pharmacy management: pharmacy dashboard, sales, pending prescriptions, stock alerts.
- Prescription queue: OPD/IPD prescription list, dispense workflow, substitution UI.
- Pharmacy billing: medicine invoice, payment status, print action.
- Pharmacy inventory store: item list, category, stock level, reorder level.
- Batch and expiry management: batch list, expiry alerts, near-expiry filters.
- Purchase management: purchase request, purchase order, supplier status.
- Vendor management: vendor list, contact, purchase history.
- Drug interaction alerts: interaction warning UI inside prescription/dispense flow.
- Stock audit: physical stock, system stock, variance, approval state.
- Inventory management: central item master, stock dashboard.
- Central store and department store: store-wise stock, request, issue, return.
- GRN management: goods receipt note list, received quantities, pending verification.
- Stock transfer: transfer request, issue, receive, transfer history.
- Asset management: asset list, department assignment, maintenance status.
- Expiry tracking: expiry dashboard across pharmacy and store.
- OT scheduling: surgery calendar, OT room allocation, surgeon/anesthesia team.
- Surgery management: case list, pre-op, intra-op, post-op state.
- Anesthesia notes: pre-anesthesia checkup, intra-op notes, recovery status.
- Surgical notes: procedure notes, implants, complications, post-op instructions.
- OT billing: OT charges, consumables, package link.
- Instrument tracking: instrument sets, sterilization state, usage history.
- Infection control: infection checklist, OT cleaning status, alerts.

**Short Coverage:** This phase combines stock-heavy workflows and OT operations because both need precise lists, status boards, and sticky actions.

## Phase 10: Billing, Finance, Insurance, And TPA

**Goal:** Build hospital revenue, billing, accounting, and claim-management UI.

**Pages / Screens Covered**

- Billing management: billing dashboard, pending bills, quick invoice creation.
- OPD billing and IPD billing: service charges, medicines, lab, radiology, packages.
- Invoice management: invoice list, invoice detail, print, cancel, revise.
- Payment management: cash/card/UPI/bank payment UI, split payments, receipts.
- Refund management: refund requests, approval status, refund detail.
- Discount approval: discount request queue, approval drawer, reason capture.
- Advance collection: patient advance, deposit history, adjustment.
- Credit billing: credit patients, company credit, outstanding.
- Package billing: package assignment, package utilization, exclusions.
- Insurance billing and TPA billing: payer details, claim bill, approval status.
- GST management: tax summary, GST invoice fields, tax report placeholder.
- Financial accounting: account summary, journal placeholder, vouchers.
- Ledger management: patient ledger, vendor ledger, payer ledger.
- Expense management: expense list, category, approval status.
- Revenue management: department revenue, doctor revenue, payment mode summary.
- Cash counter: counter opening/closing, cash handover, day summary.
- Bank reconciliation: bank entries, matched/unmatched state.
- Insurance management: insurance companies, policy info, patient insurance mapping.
- TPA management: TPA list, contracts, contact details.
- Preauthorization: preauth request, documents, approval status.
- Claim processing: claim queue, submitted/under review/rejected/settled.
- Claim settlement: settlement list, payment received, deductions.
- Insurance package mapping: insurer package list, mapped services.
- Rejection management: rejected claims, reason, resubmission action.

**Short Coverage:** This phase covers all money movement and payer workflows with approval-friendly screens.

## Phase 11: HRMS, Administration, Communication, And Reports

**Goal:** Build support department UI, staff workflows, communication screens, and reporting dashboards.

**Pages / Screens Covered**

- Employee management: employee list, profile, documents, department assignment.
- Attendance management: attendance grid, punch status, corrections.
- Shift management: shift roster, department-wise schedule.
- Leave management: leave request, approval queue, balance.
- Payroll management: payroll list, salary structure UI, payslip placeholder.
- Recruitment management: candidates, interview status, offer stage.
- Appraisal management: appraisal cycle, ratings, review status.
- Training management: training calendar, attendance, completion.
- Staff documents: document list, expiry alerts, verification.
- Housekeeping management: task list, room/ward cleaning status.
- Laundry management: laundry request, collection, delivery status.
- Cafeteria management: orders, billing placeholder, menu setup.
- Visitor management: visitor registration, pass, patient mapping.
- Security desk management: gate entry, staff/visitor movement.
- Complaint management: complaint list, priority, assignment, resolution.
- Feedback management: feedback list, rating, category, response.
- SMS gateway, email, WhatsApp, push notifications: template list, send log, status.
- Alert management: alert rules, recipients, severity, active state.
- Emergency alert system: emergency broadcast UI, recipients, acknowledgement.
- MIS reports: hospital-wide summary reports.
- Financial reports: revenue, collection, outstanding, refunds.
- Clinical reports: diagnosis, procedures, visits, outcomes placeholders.
- Operational reports: appointments, queue, bed occupancy, turnaround time.
- Doctor performance reports: consultations, revenue, ratings, follow-ups.
- Revenue analytics: charts, filters, department and doctor breakdown.
- Bed occupancy analytics: ward/ICU occupancy, trends.
- Audit reports: user activity, permission changes, sensitive access.
- Custom report builder: fields, filters, preview, export action.
- Dashboard analytics: executive dashboards with role-wise widgets.

**Short Coverage:** This phase covers people operations, non-clinical departments, messaging, alerts, and reporting.

## Phase 12: Integrations, Compliance, Mobile, AI, And Final Optimization

**Goal:** Add future-ready integration screens, compliance screens, mobile role views, AI placeholders, and final UI hardening.

**Pages / Screens Covered**

- API management: API keys, endpoint list, usage status, logs placeholder.
- HL7 and FHIR integration: integration list, mapping status, message log UI.
- ABHA integration: Health ID linking, verification status, sync log.
- Payment gateway integration: gateway settings, transaction status.
- SMS API and WhatsApp API integration: provider settings, delivery logs.
- PACS integration: connection settings, study sync status.
- LIS device integration: analyzer/device list, sync status, error log.
- ERP integration: accounting/store sync placeholder.
- Audit trail: consolidated audit history with filters and detail drawer.
- Access control: permission review, sensitive module access.
- Session management: active sessions, force logout action.
- Device management: trusted devices, blocked devices.
- IP restriction: allowed/blocked IP list.
- Activity monitoring: live activity table, risk flags.
- Backup management: backup list, schedule UI, restore placeholder.
- Disaster recovery: recovery status, drill log, RPO/RTO placeholders.
- Consent tracking: patient consent audit, expiry/withdrawn state.
- Data encryption UI: encryption status, key rotation placeholder.
- Compliance management: compliance checklist, policy documents, audit readiness.
- Doctor mobile app UI: doctor dashboard, rounds, OPD queue, prescription.
- Nurse mobile app UI: task list, vitals, MAR, nursing notes.
- Patient mobile app UI: appointments, reports, prescriptions, bills.
- Management mobile app UI: executive dashboard, revenue, occupancy, alerts.
- Remote monitoring: monitored patients, vitals feed placeholder, alerts.
- AI clinical assistant: suggestion panel, prompt history, doctor approval state.
- Voice prescription: voice capture placeholder, transcript, medicine extraction review.
- AI radiology assistance: findings suggestion panel and review status.
- Predictive analytics: risk cards, forecast charts, model confidence placeholder.
- Smart alerts and clinical decision support: alert rules, suggested actions, override reason.

**Short Coverage:** This phase prepares the UI for integrations, compliance expectations, mobile surfaces, and smart healthcare features.

## Suggested Build Priority

1. Phase 1 to Phase 5 should be built first because they define the shell, admin access, patient registration, appointments, and OPD workflow.
2. Phase 6 to Phase 10 should follow because they cover inpatient care, diagnostics, pharmacy, OT, billing, and insurance.
3. Phase 11 and Phase 12 should come last because they depend on stable core workflows and can reuse most UI patterns.

## Notes For The Next Detailed Phase Document

The next document should define each phase in more detail with:

- Page list and route names.
- Component breakdown.
- Tab structure per page.
- Static data model per module.
- Table columns and filters.
- Drawer behavior.
- Sticky actions.
- Responsive behavior.
- User roles per screen.
- Empty, loading, success, warning, and error states.
- Acceptance checklist per page.
