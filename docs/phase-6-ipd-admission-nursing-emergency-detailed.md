# Phase 6 Detailed Document: IPD, Admission, Nursing, And Emergency

## Phase Goal

Build the production-grade UI screens for IPD admission, bed/ward/ICU management, nursing station, doctor rounds, nursing assessment, medication administration, intake-output charting, discharge management, transfer management, package management, emergency registration, triage, casualty/trauma care, ambulance management, and emergency billing placeholders.

This phase is UI-only and uses static data. It should feel ready for real inpatient and emergency operations, but no backend, bed-device integration, pharmacy dispense integration, billing engine, insurance integration, ambulance GPS, real-time socket updates, or clinical decision engine is required in this phase.

## Dependency On Previous Phases

Phase 6 must use the foundations from Phases 1 to 5.

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
- Form validation pattern.
- Confirmation pattern for high-risk actions.
- Audit log style for sensitive changes.
- User, role, department, doctor, nurse, and hospital static data.

Required Phase 3 patterns:

- Patient search and quick view.
- Patient profile header.
- Patient alert display.
- Patient visit history summary.
- Consent status pattern.
- Emergency/unknown patient registration placeholder.
- Patient status lifecycle display.

Required Phase 4 patterns:

- Appointment and queue context.
- Token status pattern.
- Front-office handoff pattern.
- Emergency/walk-in priority display.

Required Phase 5 patterns:

- OPD consultation summary pattern.
- Clinical notes and SOAP patterns.
- Diagnosis and prescription display.
- Allergy and clinical warning patterns.
- Vitals entry and abnormal indicator patterns.
- Procedure advice pattern.
- Clinical handoff placeholders.

Important rule:

All Phase 6 screens must follow the Phase 1 theme and responsive system. Do not create separate IPD, nursing, bed, emergency, or ambulance colors, buttons, forms, tables, drawers, tabs, or layouts outside the shared design system.

## Phase 6 Scope

Phase 6 covers:

- Admission management.
- Admission request and admission form.
- Consultant assignment.
- Bed management.
- Ward management.
- ICU management.
- Nursing station.
- Nursing task board.
- Doctor rounds.
- Nursing assessment.
- Medication administration record (MAR).
- Intake-output chart.
- Discharge management.
- Transfer management.
- IPD package management.
- Emergency registration.
- Triage management.
- Casualty management.
- Trauma management.
- Ambulance management.
- Emergency billing placeholders.
- Inpatient patient header and status lifecycle.
- IPD clinical safety and handoff states.
- Infection/isolation workflow placeholders.
- Patient movement and bed lifecycle placeholders.
- Triage reassessment and escalation placeholders.

Phase 6 does not cover:

- Real bed allocation database.
- Real device integration.
- Real pharmacy dispense workflow.
- Real billing calculation engine.
- Real insurance/TPA processing.
- Real ambulance GPS tracking.
- Real emergency alert broadcast.
- Real clinical decision support.
- Real infection control automation.
- OT workflow.
- LIS/RIS execution.
- Full EMR/EHR longitudinal record.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/ipd` | IPD dashboard | Admission, bed, ward, nursing, and discharge overview. |
| `/ipd/admissions` | Admission management | Admission requests, active admissions, admission form. |
| `/ipd/admissions/:admissionId` | Admission detail | Inpatient patient context, admission tabs, actions. |
| `/ipd/beds` | Bed management | Bed map, availability, occupancy, maintenance, transfer actions. |
| `/ipd/wards` | Ward management | Ward list, occupancy, patients, nursing assignment. |
| `/ipd/icu` | ICU management | ICU bed map, critical patients, device placeholders. |
| `/ipd/nursing-station` | Nursing station | Assigned patients, tasks, medication due, vitals due, alerts. |
| `/ipd/rounds` | Doctor rounds | Round notes, orders, review status. |
| `/ipd/nursing-assessment` | Nursing assessment | Assessment forms, risk scoring, observations. |
| `/ipd/medication-administration` | MAR | Scheduled/done/missed medication administration UI. |
| `/ipd/intake-output` | Intake-output chart | Fluid intake, output, balance summary. |
| `/ipd/transfers` | Transfer management | Bed/ward/ICU transfer request and history. |
| `/ipd/discharge` | Discharge management | Discharge checklist, summary tabs, approval, print. |
| `/ipd/packages` | Package management | IPD package selection and utilization placeholder. |
| `/emergency` | Emergency dashboard | Emergency registration, triage, casualty, ambulance overview. |
| `/emergency/register` | Emergency registration | Rapid/unknown patient emergency registration. |
| `/emergency/triage` | Triage management | Priority, symptoms, vitals, triage queue. |
| `/emergency/casualty` | Casualty management | Emergency case sheet, stabilization, notes. |
| `/emergency/trauma` | Trauma management | Trauma checklist, injury summary, status. |
| `/emergency/ambulance` | Ambulance management | Ambulance request, dispatch, arrival status. |
| `/emergency/billing` | Emergency billing placeholder | Quick charges, invoice placeholder, payment state. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/ipd` | Inpatient pages | Main HMS app shell from Phase 1. |
| `(app)/emergency` | Emergency/casualty pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 6 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for admission forms, discharge summaries, MAR, nursing notes, transfer forms, and emergency case sheets.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Bed, admission, nursing, medication, triage, emergency, transfer, and discharge statuses must use shared status tokens.
- Never hardcode page-level colors.
- Emergency and critical states must be visible in all theme modes.
- Print views should use Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 6 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column forms and full-screen inpatient/emergency drawers.
- Tablet screens can use two-column forms, ward panels, and nursing task cards.
- Laptop and desktop screens can use bed maps, tables, split panels, and side drawers.
- Wide desktop screens can show bed map, patient context, and task/alert panels together.
- No page-level horizontal scroll.
- Dense MAR, bed, and triage tables may scroll inside their own containers.
- Sticky headers and sticky actions must not cover clinical forms, nursing task rows, or bed maps.
- Touch targets must be suitable for nursing tablets.

### Inpatient Workflow Pattern

Required:

- Sticky inpatient patient header.
- Admission number and bed/ward context.
- Patient alerts visible at all times.
- Bed/ward/consultant context.
- Tab-based clinical and operational workspace.
- Nursing and doctor task visibility.
- Sticky action buttons for save, transfer, discharge, administer, approve, and print.
- Drawer-based detail views.
- Low-scroll form sections.

Avoid:

- Hidden patient identity.
- Long vertical inpatient forms.
- Deep nested IPD menus.
- Multiple popup chains.
- Full page reloads for bed, ward, or medication state changes.

## IPD And Emergency Status Standards

### Admission Statuses

- Requested.
- Approved.
- Admitted.
- Bed assigned.
- In ward.
- In ICU.
- Transfer pending.
- Discharge initiated.
- Discharge approved.
- Discharged.
- Cancelled.

### Bed Statuses

- Available.
- Occupied.
- Reserved.
- Cleaning.
- Maintenance.
- Blocked.
- Isolation.

### Nursing Task Statuses

- Pending.
- Due now.
- Overdue.
- Completed.
- Missed.
- Cancelled.

### Medication Administration Statuses

- Scheduled.
- Due.
- Administered.
- Missed.
- Held.
- Refused.
- Delayed.

### Triage Statuses

- Red: immediate.
- Orange: very urgent.
- Yellow: urgent.
- Green: standard.
- Black/expectant placeholder.

### Emergency Statuses

- Registered.
- Triage pending.
- In triage.
- In casualty.
- Stabilizing.
- Referred.
- Admitted to IPD.
- Discharged from emergency.
- Deceased placeholder.

Status rules:

- Status must use text, icon, and color/token.
- Emergency priority must not rely on color only.
- Isolation and infection risks must be visible in bed and nursing views.
- Medication missed/held/refused states must be distinct.
- Discharge initiated and discharged states must be visually different.
- Cleaning, maintenance, and blocked beds must never look available.
- Red/orange triage must remain visible after handoff to casualty or IPD.

## Clinical And Operational Safety Rules

Phase 6 handles high-risk inpatient and emergency workflows.

Required:

- Patient identity must remain visible: name, UHID, age/gender, allergies, alerts, admission number, bed, ward.
- Allergy and infection risk must appear before medication administration.
- Medication administration must show patient, medicine, dose, route, time, and allergy context together.
- Medication administration requires confirmation placeholder.
- Missed, held, refused, and delayed medication require reason placeholder.
- Bed transfer requires reason placeholder and target bed validation.
- Bed release after discharge must send bed to cleaning placeholder before available.
- ICU transfer and emergency admission must show high-priority warning.
- Discharge completion requires checklist completion placeholder.
- Triage priority must be visible in every emergency screen.
- Red/orange triage should show reassessment timer placeholder.
- Unknown emergency patients must show incomplete identity warning.
- High-impact actions should show future audit note.

High-impact actions:

- Admit patient.
- Assign bed.
- Transfer bed/ward/ICU.
- Administer medication.
- Hold/miss/refuse medication.
- Start discharge.
- Approve discharge placeholder.
- Discharge patient.
- Change triage priority.
- Mark emergency patient deceased placeholder.
- Cancel admission.

## Inpatient Handoff And Escalation Rules

Phase 6 must show how patient flow moves between teams, even without backend workflows.

Handoff points:

- Admission request to bed assignment.
- Bed assignment to nursing station.
- Nursing station to doctor rounds.
- Doctor rounds to medication/pharmacy placeholder.
- Doctor rounds to lab/radiology advice placeholder.
- Transfer request to bed management.
- Discharge checklist to billing placeholder.
- Emergency registration to triage.
- Triage to casualty.
- Casualty to IPD/ICU/discharge/referral.
- Ambulance arrival to emergency registration.

Escalation indicators:

- Critical patient.
- Medication overdue.
- Vitals overdue.
- Fall risk high.
- Pressure injury risk high.
- Isolation/infection risk.
- Triage reassessment overdue.
- Discharge delayed.
- Bed cleaning delayed.

Rules:

- Every handoff should preserve patient identity and current location.
- Escalations must use text, icon, and status token.
- Escalation acknowledgement is a placeholder and should show future audit note.
- Handoff actions must not claim real downstream order creation in Phase 6.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All Phase 6 screens. |
| Hospital Admin | IPD/emergency overview, setup placeholders, read/update operational states. |
| Doctor | Admission detail, rounds, orders placeholder, discharge summary, emergency case sheet. |
| Nurse | Nursing station, vitals, nursing assessment, MAR, intake-output, patient tasks. |
| Receptionist | Admission request, emergency registration, patient search, front-office handoff. |
| Billing Executive | Package, emergency billing, discharge billing status placeholder. |
| Pharmacist | Read-only medication orders and MAR status placeholder. |
| Management | Read-only occupancy, emergency, and discharge dashboards. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view allowed records but cannot save or change state.
- Disabled actions should explain required permission.
- Medication administration actions are nurse/doctor controlled placeholders.

## Page 1: IPD Dashboard

### Purpose

Provide a high-level inpatient operations overview for hospital staff.

### Route

`/ipd`

### Summary Cards

- Active admissions.
- Available beds.
- Occupied beds.
- ICU patients.
- Discharges today.
- Transfers pending.
- Medication due.
- Nursing tasks overdue.

### Dashboard Widgets

- Bed occupancy by ward.
- ICU occupancy.
- Admission requests.
- Discharge queue.
- Nursing task summary.
- Medication due summary.
- Critical patient alerts.
- Transfer requests.

### Quick Actions

- New admission.
- Assign bed.
- Open nursing station.
- Open bed map.
- Start discharge.
- Transfer patient.

### Acceptance

- IPD state is clear at a glance.
- Critical and overdue states are visible.
- Dashboard works on desktop and tablet.
- Theme and responsive behavior match Phase 1.

## Page 2: Admission Management

### Purpose

Manage admission requests, admission forms, consultant assignment, and active admissions.

### Route

`/ipd/admissions`

### Page Header

Title: `Admission Management`

Primary action:

- New admission.

Secondary actions:

- Bed availability.
- Print admission list placeholder.
- Export placeholder.

### Summary Cards

- Admission requests.
- Admitted today.
- Bed pending.
- ICU requests.
- Discharge pending.

### Table Columns

- Admission number.
- Patient.
- UHID.
- Age/gender.
- Admission type.
- Department.
- Consultant.
- Bed/ward.
- Status.
- Actions.

### Admission Form Tabs

- Patient.
- Admission details.
- Consultant.
- Bed request.
- Consent.
- Payer/package placeholder.
- Review.

### Admission Details Fields

- Admission type: planned, emergency, transfer, day care placeholder.
- Department.
- Provisional diagnosis.
- Admission reason.
- Admission date/time.
- Referring doctor placeholder.
- Priority.

### Consultant Fields

- Primary consultant.
- Secondary consultant placeholder.
- Admitting doctor.
- Nursing unit.

### Bed Request Fields

- Ward preference.
- Bed type.
- ICU required.
- Isolation required.
- Attendant allowed placeholder.

### Consent Fields

- Admission consent status.
- Financial consent placeholder.
- Guardian consent placeholder.
- High-risk consent placeholder.

### Actions

- Create admission request.
- Approve admission placeholder.
- Assign consultant.
- Assign bed.
- Cancel admission.
- Print admission form.

### Safety Rules

- Emergency admissions can proceed with incomplete identity placeholder.
- Bed assignment requires bed availability.
- Isolation requirement should filter beds visually.
- Cancelling admission requires reason placeholder.

### Acceptance

- Admission flow is tab-based and low-scroll.
- Patient context is visible.
- Bed request and consultant assignment are clear.
- Admission statuses are distinct.

## Page 3: Admission Detail

### Purpose

Provide a central inpatient workspace for a single admitted patient.

### Route

`/ipd/admissions/:admissionId`

### Sticky Inpatient Header

Required:

- Patient name.
- UHID.
- Age/gender.
- Admission number.
- Bed.
- Ward/ICU.
- Consultant.
- Allergies.
- Infection/isolation flag.
- Admission status.

### Tabs

- Overview.
- Orders placeholder.
- Rounds.
- Nursing.
- MAR.
- Vitals.
- Intake-output.
- Procedures.
- Documents.
- Billing/package placeholder.
- Transfers.
- Discharge.
- Audit.

### Overview Sections

- Admission summary.
- Bed/ward summary.
- Diagnosis summary.
- Consultant team.
- Critical alerts.
- Active medication due.
- Nursing tasks.
- Recent rounds.
- Discharge readiness.

### Sticky Actions

- Save.
- Transfer.
- Start discharge.
- Print summary.
- Send to billing placeholder.
- Add note.

### Acceptance

- Inpatient identity and bed context are always clear.
- Tabs avoid long vertical pages.
- Nursing, MAR, rounds, transfer, and discharge states are visible.

## Page 4: Bed, Ward, And ICU Management

### Purpose

Manage bed availability, occupancy, ward status, ICU status, cleaning, maintenance, and transfers.

### Routes

- `/ipd/beds`
- `/ipd/wards`
- `/ipd/icu`

### Bed Map Views

- All beds.
- Ward-wise.
- ICU.
- Isolation.
- Available only.
- Cleaning/maintenance.

### Bed Card Content

- Bed number.
- Ward/room.
- Bed type.
- Status.
- Patient if occupied.
- Consultant.
- Alerts.
- Since time.

### Bed Filters

- Ward.
- Bed type.
- Status.
- Isolation.
- Gender restriction placeholder.
- ICU only.

### Bed Actions

- Assign bed.
- Reserve bed.
- Transfer patient.
- Mark cleaning.
- Mark maintenance.
- Release bed.
- Mark available after cleaning.
- Block bed for isolation placeholder.

### Bed Lifecycle Rules

- Available beds can be assigned or reserved.
- Reserved beds show reservation reason and expiry placeholder.
- Occupied beds show patient identity and alerts.
- Discharged patient bed moves to cleaning placeholder.
- Cleaning bed moves to available after cleaning completion placeholder.
- Maintenance bed requires maintenance reason placeholder.
- Blocked/isolation bed requires reason placeholder.
- Gender restriction and isolation capability warnings must be visible.

### Ward Management Columns

- Ward.
- Beds total.
- Occupied.
- Available.
- Cleaning.
- Maintenance.
- Nurse in charge.
- Status.

### ICU Management Additions

- Critical patients.
- Ventilator placeholder.
- Monitor placeholder.
- Isolation status.
- Nurse ratio placeholder.

### Safety Rules

- Occupied bed cannot be reassigned.
- Maintenance/cleaning bed cannot be assigned.
- Isolation requirement should warn if bed is not isolation-capable.
- Transfer requires source and target bed visibility.
- Bed status change requires reason placeholder except normal clean-to-available.

### Acceptance

- Bed availability is easy to scan.
- ICU and isolation states are visible.
- Bed map works on desktop and tablet.
- Phone view uses compact bed cards.
- Bed lifecycle states are represented safely.

## Page 5: Nursing Station

### Purpose

Provide nurses with assigned patient list, due tasks, medication due, vitals due, alerts, and handoff notes.

### Route

`/ipd/nursing-station`

### Summary Cards

- Assigned patients.
- Medication due.
- Vitals due.
- Tasks overdue.
- Critical alerts.
- New orders placeholder.

### Patient Task Columns

- Bed.
- Patient.
- UHID.
- Consultant.
- Alerts.
- Medication due.
- Vitals due.
- Nursing tasks.
- Status.
- Actions.

### Task Board Sections

- Due now.
- Overdue.
- Upcoming.
- Completed.
- Missed.

### Actions

- Open patient.
- Record vitals.
- Administer medication.
- Add nursing note.
- Complete task.
- Handoff note.

### Safety Rules

- Critical alerts remain visible.
- Overdue medication and vitals are highlighted with text/icon.
- Task completion requires responsible staff placeholder.
- Handoff notes should not overwrite previous notes.
- Fall risk, pressure injury risk, and isolation flags are visible in assigned patient rows.
- New doctor order placeholder should create nursing task placeholder.

### Acceptance

- Nurse can see next required action quickly.
- Medication/vitals due states are clear.
- Works well on tablet.
- Handoff and escalation indicators are visible.

## Page 6: Doctor Rounds

### Purpose

Capture doctor round notes, review status, orders placeholder, and plan updates.

### Route

`/ipd/rounds`

### Round Fields

- Patient.
- Bed/ward.
- Round date/time.
- Doctor.
- Clinical status.
- Notes.
- Plan.
- Orders placeholder.
- Follow-up review time.

### Round Tabs

- Today rounds.
- Pending reviews.
- Completed rounds.
- Critical patients.

### Table Columns

- Bed.
- Patient.
- Consultant.
- Last round.
- Next review.
- Status.
- Alerts.
- Actions.

### Actions

- Add round note.
- Update plan.
- Add order placeholder.
- Print round summary placeholder.

### Safety Rules

- Critical patients should stay visible.
- Editing completed round note requires revision reason placeholder.
- Orders are placeholders only in Phase 6.

### Acceptance

- Rounds workflow is fast and doctor-friendly.
- Next review status is visible.
- Round notes are revision-safe placeholders.

## Page 7: Nursing Assessment

### Purpose

Capture structured nursing assessment, risk scores, observations, and care planning placeholders.

### Route

`/ipd/nursing-assessment`

### Assessment Sections

- Initial assessment.
- Pain assessment.
- Fall risk.
- Pressure sore risk.
- Nutrition screening.
- Mobility.
- Mental status.
- Device/tube lines placeholder.
- Care plan placeholder.

### Risk Scores

- Fall risk.
- Pressure injury risk.
- Pain score.
- Nutrition risk.
- Infection risk placeholder.

### Actions

- Save assessment.
- Mark reviewed.
- Print assessment placeholder.

### Safety Rules

- High-risk score should create visible nursing alert placeholder.
- Missing required assessment sections should show warning.
- Completed assessments are read-only unless revision placeholder.

### Acceptance

- Assessment forms are grouped and low-scroll.
- Risk scores are visible in nursing station.
- Tablet workflow is comfortable.

## Page 8: Medication Administration Record

### Purpose

Provide a MAR UI for scheduled, due, administered, missed, held, refused, and delayed medications.

### Route

`/ipd/medication-administration`

### MAR Views

- Due now.
- By patient.
- By time.
- Administered.
- Missed/held/refused.

### MAR Columns

- Time.
- Bed.
- Patient.
- Medicine.
- Dose.
- Dose unit.
- Route.
- Frequency.
- Status.
- Due time.
- Administered by.
- Actions.

### Medication Actions

- Administer.
- Hold.
- Mark missed.
- Mark refused.
- Delay.
- View prescription.

### Medication Safety Checks

Display the medication administration safety checks as UI labels:

- Right patient.
- Right medicine.
- Right dose.
- Right route.
- Right time.
- Allergy checked.
- Infection/isolation precautions checked where applicable.

### Administration Drawer

Sections:

- Patient summary.
- Allergies.
- Medicine details.
- Due time.
- Safety checks.
- Administration confirmation.
- Reason field for hold/missed/refused/delay.
- Notes.

### Safety Rules

- Allergy alert visible before administer action.
- Dose, route, time, and patient identity must be visible together.
- Administer action requires confirmation placeholder.
- Hold/missed/refused/delay require reason.
- Late administration should show warning.
- Barcode scan is not implemented, but a future scan placeholder can be shown.
- Double-check placeholder should appear for high-risk medication.

### Acceptance

- MAR is safe and scannable.
- Medication states are distinct.
- Nurse can work from tablet without hidden actions.
- Medication safety checks are visible before administration.

## Page 9: Intake-Output Chart

### Purpose

Track intake, output, and fluid balance for admitted patients.

### Route

`/ipd/intake-output`

### Intake Fields

- Oral intake.
- IV fluids.
- Tube feeding placeholder.
- Blood products placeholder.
- Other intake.

### Output Fields

- Urine.
- Drain.
- Vomit.
- Stool placeholder.
- Other output.

### Chart Columns

- Time.
- Intake type.
- Intake amount.
- Output type.
- Output amount.
- Balance.
- Recorded by.
- Notes.

### Summary

- Total intake.
- Total output.
- Net balance.
- Shift balance.
- 24-hour balance.
- Running balance.

### Safety Rules

- Units must be visible: ml.
- Negative/positive balance should be labeled.
- Critical imbalance placeholder should show warning.
- Intake-output entries require time and recorder placeholder.

### Acceptance

- Intake-output is easy to record.
- Balance summary is clear.
- Print summary placeholder is available.

## Page 10: Transfer Management

### Purpose

Manage transfer requests between beds, wards, ICU, and departments.

### Route

`/ipd/transfers`

### Transfer Types

- Bed to bed.
- Ward to ward.
- Ward to ICU.
- ICU to ward.
- Department transfer placeholder.

### Transfer Fields

- Patient.
- Current bed/ward.
- Target bed/ward.
- Transfer reason.
- Priority.
- Requested by.
- Approved by placeholder.
- Transfer time.
- Transport mode placeholder.
- Handoff nurse placeholder.

### Table Columns

- Request number.
- Patient.
- From.
- To.
- Reason.
- Priority.
- Status.
- Requested at.
- Actions.

### Statuses

- Requested.
- Approved.
- In transfer.
- Completed.
- Cancelled.
- Rejected placeholder.

### Safety Rules

- Target bed must be available.
- ICU transfer should show high-priority warning.
- Cancel/reject requires reason placeholder.
- Transfer history remains visible in admission detail.
- Isolation and gender restriction compatibility should be checked visually.
- Transfer completion should update source bed to cleaning placeholder.

### Acceptance

- Transfer workflow is clear.
- Source and target beds are visible together.
- Transfer state is easy to track.
- Patient movement handoff is represented.

## Page 11: Discharge Management

### Purpose

Manage discharge readiness, checklist, summary tabs, approval placeholder, and print actions.

### Route

`/ipd/discharge`

### Discharge Tabs

- Discharge queue.
- Checklist.
- Summary.
- Medicines.
- Advice.
- Billing clearance placeholder.
- Approval.
- Print.
- Delay reasons.

### Checklist Items

- Doctor discharge order placeholder.
- Nursing clearance.
- Medication reconciliation placeholder.
- Pending reports placeholder.
- Billing clearance placeholder.
- Consent/document completion.
- Bed release readiness.

### Summary Sections

- Admission summary.
- Diagnosis.
- Treatment course.
- Procedures.
- Medicines on discharge.
- Follow-up advice.
- Warning signs.
- Emergency contact instructions.

### Statuses

- Not started.
- Initiated.
- Checklist pending.
- Billing pending.
- Approval pending.
- Approved.
- Printed.
- Discharged.
- Discharge delayed.
- Left against medical advice placeholder.
- Deceased discharge placeholder.

### Actions

- Start discharge.
- Save summary.
- Request approval placeholder.
- Approve discharge placeholder.
- Print discharge summary.
- Mark discharged.
- Mark delayed placeholder.
- Mark LAMA placeholder.

### Safety Rules

- Mark discharged requires checklist completion placeholder.
- Billing pending state must be visible.
- Discharge medicines should surface allergy warning placeholder.
- Bed release happens after discharge placeholder.
- LAMA/deceased discharge placeholders require confirmation and reason.
- Discharge delay reason should be visible in queue.

### Acceptance

- Discharge workflow is tab-based.
- Checklist and billing state are visible.
- Print summary uses print-safe light theme.
- Delayed, LAMA, and deceased discharge placeholders are represented safely.

## Page 12: IPD Package Management

### Purpose

Show package selection, package utilization, included/excluded services, and billing link placeholders.

### Route

`/ipd/packages`

### Package Fields

- Package name.
- Package type.
- Start date.
- End date.
- Included services.
- Excluded services.
- Utilization status.
- Billing link placeholder.

### Summary Cards

- Active packages.
- Utilization.
- Excluded charges.
- Package nearing limit placeholder.

### Actions

- Assign package.
- Change package placeholder.
- View utilization.
- Send to billing placeholder.

### Acceptance

- Package status is easy to understand.
- Billing integration is clearly placeholder.
- Included/excluded services are visible.

## Page 13: Emergency Dashboard And Registration

### Purpose

Provide emergency overview and rapid patient registration for emergency/casualty workflows.

### Routes

- `/emergency`
- `/emergency/register`

### Dashboard Cards

- Emergency patients today.
- Triage pending.
- Red/orange priority.
- In casualty.
- Ambulance incoming.
- Admitted to IPD.

### Emergency Registration Fields

- Known/unknown patient toggle.
- Patient search.
- Temporary emergency ID.
- Approximate age.
- Gender.
- Brought by.
- Contact number if available.
- Chief complaint.
- Emergency tag.
- Arrival mode.
- Arrival time.

### Actions

- Register emergency patient.
- Send to triage.
- Admit to IPD placeholder.
- Print emergency card placeholder.

### Safety Rules

- Unknown emergency patient must show incomplete identity warning.
- Emergency registration should be very low-click.
- Duplicate check placeholder should appear when identity is known.

### Acceptance

- Emergency registration can be completed fast.
- Unknown patient state is clear.
- Triage handoff is visible.

## Page 14: Triage Management

### Purpose

Capture triage priority, vitals, symptoms, and triage queue state.

### Route

`/emergency/triage`

### Triage Fields

- Patient.
- Arrival time.
- Chief complaint.
- Vitals.
- Pain score.
- Consciousness level placeholder.
- Priority level.
- Triage notes.
- Assigned area.
- Reassessment due time.
- Escalation reason placeholder.

### Triage Queue Columns

- Arrival time.
- Patient.
- Temporary ID/UHID.
- Age/gender.
- Priority.
- Waiting time.
- Symptoms.
- Status.
- Actions.

### Actions

- Start triage.
- Assign priority.
- Reassess triage.
- Escalate priority.
- Send to casualty.
- Admit to IPD placeholder.
- Mark left without being seen placeholder.

### Safety Rules

- Priority change requires reason placeholder.
- Red/orange priority must remain visible.
- Triage waiting time should be visible.
- Unknown patient identity warning remains visible.
- Reassessment overdue should show warning.
- Left without being seen requires reason placeholder.

### Acceptance

- Triage queue is scannable.
- Priority is text/icon/color-coded.
- Emergency handoff is clear.
- Reassessment and escalation states are represented.

## Page 15: Casualty And Trauma Management

### Purpose

Provide emergency case sheet, casualty notes, trauma checklist, stabilization status, and handoff placeholders.

### Routes

- `/emergency/casualty`
- `/emergency/trauma`

### Casualty Sections

- Patient summary.
- Triage summary.
- Chief complaint.
- Emergency vitals.
- Assessment.
- Treatment given placeholder.
- Procedures placeholder.
- Orders placeholder.
- Stabilization status.
- Disposition.

### Trauma Sections

- Mechanism of injury.
- Injury region checklist.
- Glasgow Coma Scale placeholder.
- Bleeding status.
- Immobilization placeholder.
- Trauma team placeholder.
- Imaging advice placeholder.
- Surgery/OT referral placeholder.

### Disposition Options

- Discharge from emergency.
- Admit to IPD.
- Transfer to ICU.
- Refer to another facility placeholder.
- Deceased placeholder.
- Observation placeholder.

### Safety Rules

- Triage priority remains visible.
- Stabilization status must be clear.
- Deceased placeholder requires confirmation and reason.
- Disposition action requires confirmation placeholder.
- Transfer to ICU/IPD should preserve triage and casualty context.
- Referral to another facility requires reason and destination placeholder.

### Acceptance

- Emergency case sheet is fast and structured.
- Trauma checklist is clear.
- Disposition handoff is visible.
- Stabilization and observation states are represented.

## Page 16: Ambulance Management

### Purpose

Manage ambulance request, dispatch, arrival status, driver/vehicle info, and incoming patient handoff placeholders.

### Route

`/emergency/ambulance`

### Summary Cards

- Available ambulances.
- On trip.
- Incoming patients.
- Delayed arrivals.

### Table Columns

- Request number.
- Patient/caller.
- Pickup location.
- Destination.
- Ambulance.
- Driver.
- Status.
- ETA placeholder.
- Actions.

### Statuses

- Requested.
- Assigned.
- Dispatched.
- Picked up.
- Arriving.
- Arrived.
- Cancelled.

### Actions

- Create request.
- Assign ambulance.
- Mark dispatched.
- Mark arrived.
- Send to emergency registration.
- Cancel request placeholder.

### Safety Rules

- No real GPS tracking in Phase 6.
- ETA is static placeholder.
- Arrival handoff should preserve patient/caller context.
- Cancellation requires reason placeholder.
- Incoming emergency handoff should preserve ambulance request and caller details.

### Acceptance

- Ambulance flow is visible.
- Incoming patient handoff is clear.
- Static placeholder status is not mistaken for real GPS.
- Cancellation and delayed arrival states are represented.

## Page 17: Emergency Billing Placeholder

### Purpose

Provide quick emergency charge capture and billing status placeholder.

### Route

`/emergency/billing`

### Sections

- Patient/emergency case summary.
- Quick charges.
- Package/advance placeholder.
- Payment status.
- Invoice placeholder.

### Quick Charge Fields

- Service.
- Quantity.
- Rate placeholder.
- Emergency flag.
- Notes.

### Statuses

- Charges pending.
- Invoice draft.
- Payment pending.
- Paid placeholder.
- Sent to billing module.

### Actions

- Add charge.
- Create invoice placeholder.
- Send to billing.
- Print emergency bill placeholder.

### Safety Rules

- Billing is placeholder only in Phase 6.
- Clinical care status must not be blocked by placeholder billing UI.
- Emergency billing should link back to emergency case.

### Acceptance

- Emergency billing placeholder is clear.
- Quick charges are easy to scan.
- Future billing integration is prepared.

## Static Data Requirements

Phase 6 should add or expand static data files.

Recommended data:

- `mockAdmissions`.
- `mockAdmissionRequests`.
- `mockBeds`.
- `mockWards`.
- `mockIcuBeds`.
- `mockNursingTasks`.
- `mockDoctorRounds`.
- `mockNursingAssessments`.
- `mockMedicationAdministration`.
- `mockIntakeOutput`.
- `mockTransfers`.
- `mockDischarges`.
- `mockIpdPackages`.
- `mockEmergencyCases`.
- `mockTriageQueue`.
- `mockCasualtyCases`.
- `mockTraumaCases`.
- `mockAmbulanceRequests`.
- `mockEmergencyCharges`.
- `mockIpdAuditEvents`.
- `mockBedStatusHistory`.
- `mockInfectionIsolationFlags`.
- `mockMedicationSafetyChecks`.
- `mockTriageReassessments`.
- `mockPatientHandoffs`.

Admission fields:

- `id`.
- `admissionNo`.
- `patientId`.
- `uhid`.
- `departmentId`.
- `consultantId`.
- `admissionType`.
- `admittedAt`.
- `bedId`.
- `wardId`.
- `status`.
- `diagnosis`.
- `priority`.

Bed fields:

- `id`.
- `bedNo`.
- `wardId`.
- `roomNo`.
- `bedType`.
- `status`.
- `patientId`.
- `isIsolationCapable`.
- `genderRestriction`.
- `lastStatusChangedAt`.
- `statusReason`.
- `cleaningDueAt`.
- `reservedUntil`.

MAR fields:

- `id`.
- `patientId`.
- `admissionId`.
- `medicineName`.
- `dose`.
- `doseUnit`.
- `route`.
- `dueTime`.
- `status`.
- `administeredBy`.
- `administeredAt`.
- `reason`.
- `safetyChecks`.

Triage fields:

- `id`.
- `emergencyCaseId`.
- `patientId`.
- `priority`.
- `chiefComplaint`.
- `vitals`.
- `painScore`.
- `triageNotes`.
- `status`.
- `triagedAt`.
- `reassessmentDueAt`.
- `escalationReason`.

Ambulance fields:

- `id`.
- `requestNo`.
- `callerName`.
- `patientId`.
- `pickupLocation`.
- `destination`.
- `ambulanceNo`.
- `driverName`.
- `status`.
- `eta`.
- `delayReason`.

Patient handoff fields:

- `id`.
- `patientId`.
- `fromArea`.
- `toArea`.
- `handoffType`.
- `status`.
- `createdBy`.
- `createdAt`.

Isolation flag fields:

- `id`.
- `patientId`.
- `type`.
- `severity`.
- `status`.
- `startedAt`.
- `notes`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Patient required for planned admission.
- Temporary ID required for unknown emergency patient.
- Admission type required.
- Department and consultant required.
- Bed required before final bed assignment.
- Transfer reason required.
- Medication hold/missed/refused reason required.
- Medication safety check acknowledgement required.
- Discharge checklist required before discharge.
- Discharge delay/LAMA/deceased reason required where applicable.
- Triage priority required.
- Triage vitals required placeholder.
- Triage reassessment reason required when priority changes.
- Emergency disposition reason required.
- Ambulance request pickup location required.
- Ambulance cancellation reason required.
- Emergency charge service required.

Validation UI:

- Inline field error.
- Checklist warning.
- Clinical safety warning panel.
- Disabled complete action where required fields are missing.
- Confirmation for high-impact actions.

## Accessibility Requirements

Required:

- Forms have labels.
- Bed cards have readable status text.
- Triage priority is not color-only.
- Medication rows are keyboard navigable.
- MAR actions are keyboard accessible.
- Drawers trap focus and return focus after close.
- Critical alerts include text labels.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, filters, tabs, drawers, bed maps, nursing tasks, and MAR rows work without mouse.

## Performance Requirements

Even with static data:

- Keep bed maps responsive and lightweight.
- Avoid rendering all patient detail drawers by default.
- Lazy render heavy tabs where useful.
- Keep nursing task board stable to avoid layout shift.
- MAR rows should remain compact and readable.
- Use skeletons for loading-looking states.
- Avoid heavy charting or timeline libraries unless already accepted by the project.

## Page State Requirements

Each Phase 6 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Admission requested state.
- Bed unavailable state.
- Transfer pending state.
- Medication due state.
- Medication missed/held/refused state.
- Medication safety check state.
- Discharge checklist pending state.
- Discharge delayed/LAMA/deceased placeholder state.
- Emergency unknown patient state.
- Triage priority state.
- Triage reassessment overdue state.
- Ambulance delayed state.
- Bed cleaning/maintenance/blocked state.
- Access denied state.
- Read-only state.

## Phase 6 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IPD dashboard | Required | Required | Required | Required | Required | Required | Required |
| Admission management | Required | Required | Required | Required | Required | Required | Required |
| Admission detail | Required | Required | Required | Required | Required | Required | Required |
| Bed/ward/ICU management | Required | Required | Required | Required | Required | Required | Required |
| Nursing station | Required | Required | Required | Required | Required | Required | Required |
| Doctor rounds | Required | Required | Required | Required | Required | Required | Required |
| Nursing assessment | Required | Required | Required | Required | Required | Required | Required |
| MAR | Required | Required | Required | Required | Required | Required | Required |
| Intake-output | Required | Required | Required | Required | Required | Required | Required |
| Transfer management | Required | Required | Required | Required | Required | Required | Required |
| Discharge management | Required | Required | Required | Required | Required | Required | Required |
| Package management | Required | Required | Required | Required | Required | Required | Required |
| Emergency registration | Required | Required | Required | Required | Required | Required | Required |
| Triage management | Required | Required | Required | Required | Required | Required | Required |
| Casualty/trauma | Required | Required | Required | Required | Required | Required | Required |
| Ambulance management | Required | Required | Required | Required | Required | Required | Not needed |
| Emergency billing | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 6 does not need real export files, but UI should reserve production actions.

Required:

- Print admission form placeholder.
- Print bed occupancy list placeholder.
- Print nursing task list placeholder.
- Print MAR placeholder.
- Print intake-output chart placeholder.
- Print transfer form placeholder.
- Print discharge summary placeholder.
- Print emergency case sheet placeholder.
- Print triage sheet placeholder.
- Print ambulance request placeholder.
- Print emergency bill placeholder.
- Export occupancy list placeholder.
- Export discharge queue placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Sensitive identifiers remain masked where required.

## Operational Metrics Placeholders

Recommended metrics:

- Bed occupancy percentage.
- ICU occupancy percentage.
- Average length of stay placeholder.
- Admissions today.
- Discharges today.
- Transfers pending.
- Medication overdue count.
- Nursing task overdue count.
- Triage waiting time.
- Emergency red/orange count.
- Ambulance delayed count.
- Discharge billing pending count.
- Bed cleaning delay count.
- Triage reassessment overdue count.
- Medication safety check acknowledgement count.
- Isolation patient count.

These metrics use static data in Phase 6 and later feed reports/analytics phases.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3/4/5 shared patterns are ready.
2. Add IPD and emergency navigation entries.
3. Add Phase 6 static data files.
4. Build IPD dashboard.
5. Build admission management and admission form.
6. Build admission detail workspace and sticky inpatient header.
7. Build bed, ward, and ICU management.
8. Build nursing station and nursing task board.
9. Build doctor rounds.
10. Build nursing assessment.
11. Build MAR.
12. Build intake-output chart.
13. Build transfer management.
14. Build discharge management.
15. Build IPD package management.
16. Build emergency dashboard and registration.
17. Build triage management.
18. Build casualty and trauma management.
19. Build ambulance management.
20. Build emergency billing placeholder.
21. Add infection/isolation flags and patient handoff placeholders.
22. Add bed lifecycle and medication safety check placeholders.
23. Add triage reassessment and escalation placeholders.
24. Add role visibility and access denied states.
25. Verify light, dark, system, dynamic preset, and custom color themes.
26. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
27. Polish validation, keyboard behavior, loading states, empty states, print-safe views, and high-impact action confirmations.

## Production-Grade Acceptance Checklist

Phase 6 is complete when:

- IPD dashboard works with static admission, bed, nursing, medication, transfer, and discharge data.
- Admission management supports requests, admission form, consultant assignment, bed request, and consent placeholders.
- Admission detail has sticky inpatient patient context and tab-based workspace.
- Bed, ward, and ICU management show availability, occupancy, cleaning, maintenance, isolation, and transfer actions.
- Bed lifecycle safely represents reserved, occupied, discharge-to-cleaning, cleaning-to-available, maintenance, blocked, and isolation states.
- Nursing station supports assigned patients, medication due, vitals due, overdue tasks, and handoff notes.
- Nursing station shows fall risk, pressure injury risk, infection/isolation flags, and escalation indicators.
- Doctor rounds support round notes, plan updates, review status, and revision placeholders.
- Nursing assessment supports grouped assessment forms and risk scoring placeholders.
- MAR supports scheduled, due, administered, missed, held, refused, and delayed states.
- MAR shows medication safety checks before administration.
- Intake-output chart supports intake, output, balance, and print placeholder.
- Transfer management supports bed/ward/ICU transfers with source/target visibility.
- Transfer management preserves patient movement handoff and updates source bed lifecycle placeholder.
- Discharge management supports checklist, summary tabs, billing placeholder, approval placeholder, and print.
- Discharge management represents delayed, LAMA, and deceased discharge placeholders safely.
- IPD package management supports package assignment and utilization placeholders.
- Emergency registration supports known and unknown patient flows.
- Triage management supports priority, vitals, symptoms, and queue state.
- Triage management supports reassessment and escalation placeholders.
- Casualty and trauma management support emergency case sheet, trauma checklist, stabilization, and disposition.
- Casualty and trauma management preserve triage context through disposition handoff.
- Ambulance management supports request, assignment, dispatch, arrival, and handoff placeholders.
- Ambulance management supports cancellation and delayed arrival placeholders.
- Emergency billing placeholder supports quick charges and future billing handoff.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky headers and sticky actions do not cover content.
- Patient alerts from Phase 3 remain visible in inpatient and emergency context.
- Clinical warning patterns from Phase 5 are reused where relevant.
- Infection/isolation and handoff states are visible where relevant.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, bed maps, nursing tasks, MAR rows, and emergency actions.
- Static data is organized for future IPD, pharmacy, billing, lab/radiology, emergency, and analytics integrations.

## Handoff Notes For Phase 7

Phase 7 can begin after Phase 6 provides:

- Admission static data.
- Bed, ward, and ICU static data.
- Inpatient patient header pattern.
- Nursing station and task pattern.
- MAR state pattern.
- Intake-output chart pattern.
- Transfer and discharge workflow patterns.
- Emergency registration and triage patterns.
- Casualty/trauma case sheet pattern.
- Ambulance and emergency billing placeholders.

Phase 7 should then focus on EMR/EHR continuity, longitudinal medical history, progress notes, clinical attachments, digital signature placeholders, and clinical timeline across OPD, IPD, emergency, lab, radiology, pharmacy, and billing events.
