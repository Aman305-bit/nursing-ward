# Phase 5 Detailed Document: OPD Clinical Workflow

## Phase Goal

Build the production-grade UI screens for OPD consultation, clinical notes, SOAP notes, diagnosis management, ICD coding, prescription management, procedure management, vaccination management, chronic disease management, allergy management, vitals management, and clinical templates.

This phase is UI-only and uses static data. It should feel ready for a fast doctor-facing OPD workflow, but no real EMR backend, drug database, e-prescription integration, pharmacy integration, lab/radiology ordering, digital signature, or clinical decision engine is required in this phase.

## Dependency On Previous Phases

Phase 5 must use the foundations from Phases 1, 2, 3, and 4.

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
- User, role, department, doctor, and hospital static data.

Required Phase 3 patterns:

- Patient search and quick view.
- Patient profile header.
- Patient alert display.
- Patient visit history summary.
- Document preview drawer.
- Consent status pattern.
- Allergy/risk alert display placeholder.
- Patient status lifecycle display.

Required Phase 4 patterns:

- Appointment detail drawer.
- Queue status pattern.
- Token and appointment context.
- Patient selection pattern inside workflow forms.
- Teleconsultation placeholder state.
- Waiting/checked-in patient worklist.

Important rule:

All Phase 5 screens must follow the Phase 1 theme and responsive system. Do not create separate clinical colors, prescription controls, tables, forms, drawers, tabs, or layouts outside the shared design system.

## Phase 5 Scope

Phase 5 covers:

- OPD consultation workspace.
- Doctor OPD queue/worklist.
- Clinical notes.
- SOAP notes.
- Diagnosis management.
- ICD coding placeholder.
- Prescription management.
- Medicine entry UI.
- Drug interaction alert placeholders.
- Procedure management.
- Vaccination management.
- Chronic disease management.
- Allergy management.
- Vitals management.
- Clinical templates.
- Clinical print preview placeholders.
- Consultation completion workflow.
- Follow-up advice and revisit recommendation.
- Referral advice placeholders.
- Lab/radiology order advice placeholders.
- Consultation revision and addendum placeholders.

Phase 5 does not cover:

- Real EMR/EHR database.
- Real drug database.
- Real ICD API integration.
- Real pharmacy dispense workflow.
- Real lab/radiology order execution.
- Real digital signature.
- Real clinical decision support engine.
- Real voice prescription.
- Real AI assistant.
- IPD clinical workflows.
- Actual controlled-drug compliance workflow.
- Actual e-signature or medico-legal locking.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/opd` | OPD dashboard/worklist | Doctor-facing OPD queue and consultation entry. |
| `/opd/consultation/:visitId` | OPD consultation | Main tab-based consultation workspace. |
| `/opd/notes` | Clinical notes | Notes list and templates placeholder. |
| `/opd/diagnosis` | Diagnosis management | Diagnosis list, ICD placeholder, common diagnosis templates. |
| `/opd/prescriptions` | Prescription management | Prescription drafts, completed prescriptions, print preview. |
| `/opd/procedures` | Procedure management | OPD procedure advice/performed procedure placeholders. |
| `/opd/vitals` | Vitals management | Vitals entry, trends, abnormal indicators. |
| `/opd/allergies` | Allergy management | Allergy records and alert states. |
| `/opd/vaccinations` | Vaccination management | Vaccination schedule and administered/due vaccines. |
| `/opd/chronic-care` | Chronic disease management | Chronic conditions, tracking, and risk markers. |
| `/opd/templates` | Clinical templates | Reusable note, diagnosis, prescription, and advice templates. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/opd` | OPD clinical pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 5 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for prescriptions, clinical summaries, and advice sheets.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Clinical alerts, allergy severity, abnormal vitals, diagnosis status, prescription status, and follow-up states must use shared status tokens.
- Never hardcode page-level colors.
- Prescription print preview must use print-safe light theme.
- Abnormal values must use text, icon, and label, not color only.

### Responsive Requirements

All Phase 5 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column forms and full-screen clinical drawers.
- Tablet screens can use two-column clinical sections.
- Laptop and desktop screens can use patient summary, tabbed editor, and right-side context panel.
- Wide desktop screens can show consultation editor, patient history, and prescription context together.
- No page-level horizontal scroll.
- Dense clinical tables may scroll inside their own containers.
- Sticky headers and sticky actions must not cover note editors, prescription rows, or vitals forms.

### Clinical Workflow Pattern

The OPD consultation workspace should prioritize speed and safety.

Required:

- Sticky patient header.
- Visit/appointment context.
- Patient alerts visible at all times.
- Quick vitals summary.
- Last visit summary.
- Tab-based clinical workspace.
- Sticky clinical actions.
- Template picker.
- Draft save state.
- Complete consultation action.
- Print prescription/action sheet.

Avoid:

- Long single-page consultation forms.
- Hidden patient alerts.
- Multiple popup dependency.
- Deep nested clinical menus.
- Full page reloads for tab changes.
- Prescription UI that can hide allergy warnings.

## Clinical Safety Rules

Phase 5 handles clinical information, so safety states must be visible even with static data.

Required:

- Patient identity must remain visible: name, UHID, age/gender, allergies, alert flags.
- Allergy alerts must appear before and during prescription entry.
- Abnormal vitals must be visually marked and labeled.
- Prescription medicine rows must show dose, frequency, duration, route, timing, and instructions.
- High-risk prescription actions require confirmation placeholder.
- Consultation completion should warn if required clinical sections are incomplete.
- Template insertion must not silently overwrite existing notes.
- Editing completed consultation should show read-only or revision placeholder state.
- Print preview must not include internal-only notes unless explicitly selected.

Clinical warning examples:

- Allergy conflict placeholder.
- Duplicate medicine placeholder.
- Drug interaction placeholder.
- High dose placeholder.
- Pregnancy/lactation caution placeholder.
- Pediatric dose caution placeholder.
- Chronic disease caution placeholder.
- Abnormal vitals warning.
- Missing diagnosis warning.
- Missing follow-up advice warning.
- Missing vitals warning for selected visit types.
- Controlled medicine warning placeholder.
- Look-alike/sound-alike medicine warning placeholder.

## Clinical Documentation And Revision Rules

Phase 5 should make clinical record state clear even without backend locking.

Consultation states:

- Not started.
- In progress.
- Draft saved.
- Completed.
- Printed.
- Revised placeholder.
- Addendum placeholder.
- Cancelled visit placeholder.

Required behavior:

- Completed consultations open read-only by default.
- Revision mode requires reason placeholder.
- Addendum does not overwrite original completed notes.
- Print history placeholder should show last printed time.
- Significant edits after completion should show future audit note.
- Doctor handoff to pharmacy, billing, lab, and radiology should be visible as placeholder actions only.

## Clinical Handoff Placeholders

Phase 5 should prepare handoff UI for future phases.

Handoff actions:

- Send prescription to pharmacy placeholder.
- Send procedure to billing placeholder.
- Send lab advice to laboratory placeholder.
- Send radiology advice to radiology placeholder.
- Send follow-up request to appointments placeholder.

Rules:

- Handoff action must show patient, visit, doctor, and target department.
- Handoff action must not claim real order creation in Phase 5.
- Handoff status can show `not sent`, `ready`, `sent placeholder`, or `failed placeholder`.
- Handoff actions should be visible in consultation summary.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All OPD screens. |
| Hospital Admin | Read-only OPD overview and configuration placeholders. |
| Doctor | Full OPD consultation access for assigned patients. |
| Nurse | Vitals entry, patient alerts, limited notes placeholder. |
| Receptionist | View OPD queue and consultation status only. |
| Pharmacist | Read-only prescription queue placeholder. |
| Lab Technician | Read-only clinical order placeholder where shown. |
| Management | Read-only OPD dashboard summary. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view allowed records but cannot save clinical changes.
- Disabled actions should explain required permission.
- Completed consultations can be read-only unless revision mode placeholder is selected.

## Page 1: OPD Dashboard / Doctor Worklist

### Purpose

Provide a doctor-facing worklist for checked-in patients, waiting patients, teleconsultations, and completed consultations.

### Route

`/opd`

### Page Header

Title: `OPD Worklist`

Primary action:

- Start next consultation.

Secondary actions:

- Refresh static queue.
- View appointment calendar.
- Print worklist placeholder.

### Summary Cards

- Waiting patients.
- In consultation.
- Completed today.
- Follow-ups due.
- Teleconsultations.
- Critical alerts.

### Filters

- Date.
- Department.
- Doctor.
- Queue status.
- Visit type.
- Appointment type.
- Patient search.
- Alert flag.

### Table Columns

- Token.
- Patient.
- UHID.
- Age/gender.
- Appointment time.
- Waiting time.
- Visit type.
- Alerts.
- Vitals status.
- Consultation status.
- Actions.

### Row Actions

- Start consultation.
- Open patient summary.
- View visit history.
- Mark patient not available placeholder.
- Send back to queue placeholder.

### Acceptance

- Doctor can quickly identify next patient.
- Patient alerts and waiting time are visible.
- Worklist reuses Phase 4 queue/appointment context.
- Theme and responsive behavior are consistent.

## Page 2: OPD Consultation Workspace

### Purpose

Provide the main doctor workspace for completing an OPD consultation.

### Route

`/opd/consultation/:visitId`

### Layout

Use a tab-based clinical workspace with sticky patient header and sticky clinical action bar.

Required areas:

- Sticky patient header.
- Visit context strip.
- Main tab workspace.
- Optional right-side patient context panel.
- Sticky actions.

### Patient Header

Required:

- Patient name.
- UHID.
- Age/gender.
- Token.
- Appointment time.
- Allergies.
- Critical alerts.
- Vitals summary.
- Last visit.

### Visit Context Strip

Show:

- Visit number.
- Department.
- Doctor.
- Visit type.
- Appointment source.
- Queue status.
- Consultation status.

### Main Tabs

- Chief complaints.
- History.
- Examination.
- Vitals.
- Diagnosis.
- Prescription.
- Procedures.
- Advice & follow-up.
- Attachments placeholder.
- Summary.

### Sticky Actions

- Save draft.
- Complete consultation.
- Print prescription.
- Print summary.
- Send to billing placeholder.
- Send to pharmacy placeholder.
- Send to lab/radiology placeholder.
- Add addendum placeholder for completed consultations.

### Right-Side Context Panel

Sections:

- Patient alerts.
- Last visit summary.
- Active medicines placeholder.
- Chronic conditions.
- Recent reports placeholder.
- Consent status.
- Appointment/queue context.

### Completion Checklist

Show warning if missing:

- Chief complaint.
- Diagnosis.
- Prescription or no-medicine note.
- Follow-up advice.
- Required vitals placeholder.
- Handoff confirmation for pharmacy/lab/radiology placeholders where selected.

### Acceptance

- Patient identity and alerts are always visible.
- Consultation is tab-based and low-scroll.
- Draft and completed states are clear.
- Sticky actions are always reachable.
- The workspace works on tablet and desktop for doctors.
- Revision and addendum placeholders protect completed consultation content.

## Page 3: Clinical Notes

### Purpose

Capture structured and free-text clinical notes for OPD consultation.

### Route

`/opd/notes`

### Note Sections

- Chief complaints.
- History of present illness.
- Past medical history.
- Surgical history.
- Family history.
- Social history.
- Examination findings.
- Doctor advice.

### Note UI

- Free-text editor placeholder.
- Structured chips for common complaints.
- Template picker.
- Add to note action.
- Clear section confirmation.
- Copy from last visit placeholder.

### Template Safety Rules

- Template insertion should append by default.
- Replace existing content requires confirmation.
- Template source should be visible.
- Edited template content should not update the original template unless explicitly saved as new template.

### Acceptance

- Notes are easy to enter quickly.
- Templates speed up entry without overwriting content accidentally.
- Keyboard use is comfortable.

## Page 4: SOAP Notes

### Purpose

Provide a structured SOAP note layout for doctors who prefer SOAP workflow.

### Route

Can be a tab inside consultation or route: `/opd/notes?mode=soap`

### SOAP Sections

- Subjective.
- Objective.
- Assessment.
- Plan.

### SOAP Fields

Subjective:

- Chief complaints.
- Symptoms.
- Patient history.

Objective:

- Vitals.
- Examination findings.
- Reports reviewed placeholder.

Assessment:

- Diagnosis.
- Severity.
- Clinical impression.

Plan:

- Prescription.
- Procedures.
- Advice.
- Follow-up.
- Referrals placeholder.

### Acceptance

- SOAP view uses same clinical data patterns.
- Switching note modes does not lose draft content.
- SOAP sections remain readable on tablet and desktop.

## Page 5: Diagnosis Management And ICD Coding

### Purpose

Capture diagnosis and prepare UI for future ICD coding.

### Route

`/opd/diagnosis`

### Diagnosis Fields

- Diagnosis name.
- ICD code placeholder.
- Diagnosis type: provisional, final, differential.
- Primary/secondary.
- Severity.
- Onset date placeholder.
- Notes.

### Diagnosis Table Columns

- Diagnosis.
- ICD code.
- Type.
- Primary.
- Severity.
- Status.
- Actions.

### ICD UI

- Search ICD placeholder.
- Common diagnosis list.
- Specialty-wise diagnosis templates.
- Recently used diagnoses.
- No-code available placeholder.

### Actions

- Add diagnosis.
- Mark primary.
- Edit diagnosis.
- Remove diagnosis.
- Add to template placeholder.

### Safety Rules

- At least one diagnosis is recommended before completing consultation.
- Removing primary diagnosis requires confirmation if prescription exists.
- Diagnosis changes after completion should show revision placeholder.

### Acceptance

- Diagnosis entry is fast.
- ICD placeholder is clear and does not claim live coding integration.
- Primary diagnosis is visually clear.

## Page 6: Prescription Management

### Purpose

Create and preview OPD prescriptions using static medicine data.

### Route

`/opd/prescriptions`

### Prescription Sections

- Medicine entry.
- Current prescription.
- Allergy/interactions.
- Instructions.
- Print preview.
- Past prescriptions placeholder.

### Medicine Entry Fields

- Medicine name.
- Generic name placeholder.
- Strength.
- Form.
- Route.
- Dose.
- Dose unit.
- Frequency.
- Timing.
- Duration.
- Duration unit.
- Quantity.
- Instructions.
- Substitute allowed placeholder.
- Start date placeholder.
- Stop date placeholder.

### Prescription Table Columns

- Medicine.
- Dose.
- Frequency.
- Duration.
- Timing.
- Route.
- Quantity.
- Instructions.
- Alerts.
- Actions.

### Prescription Actions

- Add medicine.
- Edit medicine.
- Remove medicine.
- Duplicate row.
- Add from template.
- Add common medicine.
- Save prescription.
- Print prescription.

### Alert Placeholders

- Allergy conflict.
- Duplicate medicine.
- Drug interaction.
- High dose.
- Low dose placeholder.
- Pediatric caution.
- Pregnancy caution.
- Chronic disease caution.
- Stock availability placeholder.
- Look-alike/sound-alike medicine warning.
- Controlled medicine warning.

### Prescription Print Preview

Show:

- Hospital header.
- Patient details.
- Doctor details.
- Diagnosis.
- Medicines.
- Advice.
- Follow-up.
- Signature placeholder.

Print rules:

- Use print-safe light theme.
- Hide internal alerts unless selected for print.
- Show allergy note if clinically relevant.
- Do not print draft watermark as final.

### Safety Rules

- Allergy conflict requires acknowledgement placeholder.
- Removing medicine after completion requires revision placeholder.
- Empty prescription allowed only with `No medicines prescribed` note.
- Duplicate medicine warning should be visible before save.
- Medicine rows must show dose unit and duration unit.
- High-risk alert acknowledgement requires reason placeholder.
- Prescription template insertion must re-run allergy and interaction placeholders.
- Patient age, pregnancy/lactation placeholder, and chronic conditions should be visible near medicine alerts when relevant.
- Completed prescription changes use revision/addendum placeholder.

### Acceptance

- Prescription entry is fast and clear.
- Medicine rows do not wrap into unreadable layouts.
- Allergy and interaction warnings are visible.
- Print preview is production-style even with static data.
- Dose units, duration units, and warning acknowledgement states are represented.

## Page 7: Procedure Management

### Purpose

Capture advised or performed OPD procedures.

### Route

`/opd/procedures`

### Procedure Fields

- Procedure name.
- Procedure type: advised, performed, referred.
- Department.
- Date.
- Priority.
- Notes.
- Charge link placeholder.
- Consent required placeholder.

### Procedure Table Columns

- Procedure.
- Type.
- Department.
- Date.
- Priority.
- Status.
- Actions.

### Actions

- Add procedure.
- Mark performed placeholder.
- Send to billing placeholder.
- Print advice placeholder.
- Refer to department placeholder.

### Acceptance

- Procedure advice is clear.
- Performed vs advised states are distinct.
- Billing link is visible as placeholder only.
- Consent and referral placeholders are visible where relevant.

## Page 8: Vitals Management

### Purpose

Capture and review patient vitals during OPD workflow.

### Route

`/opd/vitals`

### Vitals Fields

- Temperature with unit: Celsius/Fahrenheit placeholder.
- Pulse with unit: bpm.
- Blood pressure with unit: mmHg.
- Respiratory rate with unit: breaths/min.
- SpO2 with unit: percentage.
- Height with unit: cm.
- Weight with unit: kg.
- BMI.
- Pain score.
- Blood sugar with unit: mg/dL placeholder.

### Vitals Table Columns

- Date/time.
- Recorded by.
- Temperature.
- Pulse.
- BP.
- SpO2.
- Weight.
- BMI.
- Status.
- Actions.

### Trend View

Show:

- BP trend placeholder.
- Weight/BMI trend placeholder.
- Temperature trend placeholder.
- Abnormal values list.

### Abnormal Indicators

- Low.
- High.
- Critical.
- Missing.

### Reference Range Rules

- Show age-aware reference range placeholder where useful.
- Show unit beside every numeric value.
- Mark manually entered vs imported placeholder values.
- Abnormal values require text label and icon.
- Critical values should be visible in patient header.

### Acceptance

- Vitals entry is quick.
- Abnormal vitals are visible in patient header and consultation workspace.
- Trends are readable in light and dark modes.
- Units and reference range placeholders are clear.

## Page 9: Allergy Management

### Purpose

Maintain allergy records that affect clinical and prescription workflows.

### Route

`/opd/allergies`

### Allergy Fields

- Allergen.
- Allergy type: drug, food, environmental, other.
- Reaction.
- Severity.
- Onset date placeholder.
- Status.
- Notes.

### Allergy Table Columns

- Allergen.
- Type.
- Reaction.
- Severity.
- Status.
- Last updated.
- Actions.

### Severity Levels

- Mild.
- Moderate.
- Severe.
- Critical.

### Safety Rules

- Severe and critical allergies must be visible in patient header.
- Inactivating allergy requires confirmation.
- Prescription screen must surface allergy conflict placeholder.

### Acceptance

- Allergy list is clear and hard to miss.
- Severity is not color-only.
- Prescription integration placeholder is visible.

## Page 10: Vaccination Management

### Purpose

Show vaccination schedule, administered vaccines, and due vaccines.

### Route

`/opd/vaccinations`

### Vaccination Fields

- Vaccine name.
- Dose number.
- Due date.
- Administered date.
- Batch placeholder.
- Expiry placeholder.
- Site placeholder.
- Status.
- Notes.
- Adverse reaction placeholder.

### Statuses

- Due.
- Overdue.
- Administered.
- Deferred.
- Contraindicated placeholder.

### Actions

- Mark administered placeholder.
- Defer vaccine placeholder.
- Print schedule placeholder.
- Record adverse event placeholder.

### Acceptance

- Due and overdue vaccines are visible.
- Administered history is clear.
- Contraindication state is represented.
- Batch, expiry, and adverse event placeholders are represented.

## Page 11: Chronic Disease Management

### Purpose

Track chronic conditions and risk markers relevant to OPD care.

### Route

`/opd/chronic-care`

### Conditions

- Diabetes.
- Hypertension.
- Asthma/COPD.
- Cardiac disease.
- Kidney disease.
- Thyroid disease.
- Other chronic condition.

### Fields

- Condition.
- Diagnosed date.
- Severity/control status.
- Current medicines placeholder.
- Risk markers.
- Last review date.
- Next review date.
- Notes.

### Risk Markers

- Controlled.
- Uncontrolled.
- Needs review.
- High risk.
- Complication risk placeholder.
- Medication adherence issue placeholder.
- Lifestyle advice required placeholder.

### Acceptance

- Chronic conditions are visible in consultation context.
- Follow-up and risk markers are clear.
- Prescription caution placeholder can reference chronic conditions.
- Chronic condition review dates can drive follow-up advice placeholder.

## Page 12: Clinical Templates

### Purpose

Manage reusable templates for notes, SOAP, diagnosis, prescription, procedures, advice, and follow-up.

### Route

`/opd/templates`

### Template Types

- Clinical note.
- SOAP note.
- Diagnosis.
- Prescription.
- Procedure advice.
- Follow-up advice.
- Patient instruction.

### Template Fields

- Template name.
- Specialty.
- Doctor/global scope.
- Tags.
- Content.
- Status.

### Table Columns

- Template name.
- Type.
- Specialty.
- Scope.
- Last updated.
- Status.
- Actions.

### Actions

- Create template.
- Edit template.
- Duplicate template.
- Insert into consultation.
- Deactivate template.

### Safety Rules

- Global templates require admin/doctor owner placeholder permission.
- Inserting a prescription template must still show allergy/interaction warnings.
- Deactivating template should not remove it from old consultations.

### Acceptance

- Templates are easy to find and use.
- Scope and ownership are clear.
- Template usage respects clinical safety rules.

## Static Data Requirements

Phase 5 should add or expand static data files.

Recommended data:

- `mockOpdWorklist`.
- `mockConsultations`.
- `mockClinicalNotes`.
- `mockSoapNotes`.
- `mockDiagnoses`.
- `mockIcdCodes`.
- `mockPrescriptionMedicines`.
- `mockPrescriptions`.
- `mockDrugAlerts`.
- `mockProcedures`.
- `mockVitals`.
- `mockAllergies`.
- `mockVaccinations`.
- `mockChronicConditions`.
- `mockClinicalTemplates`.
- `mockConsultationAuditEvents`.
- `mockClinicalHandoffs`.
- `mockReferenceRanges`.
- `mockPrescriptionPrintHistory`.

Consultation fields:

- `id`.
- `visitId`.
- `patientId`.
- `appointmentId`.
- `doctorId`.
- `departmentId`.
- `status`.
- `startedAt`.
- `completedAt`.
- `printedAt`.
- `revisionReason`.
- `addendum`.
- `chiefComplaint`.
- `diagnosisIds`.
- `prescriptionId`.
- `followUpDate`.
- `handoffStatuses`.
- `notes`.

Prescription medicine fields:

- `id`.
- `medicineName`.
- `genericName`.
- `strength`.
- `form`.
- `route`.
- `dose`.
- `doseUnit`.
- `frequency`.
- `timing`.
- `duration`.
- `durationUnit`.
- `quantity`.
- `instructions`.
- `alerts`.

Vitals fields:

- `id`.
- `patientId`.
- `visitId`.
- `recordedAt`.
- `recordedBy`.
- `temperature`.
- `pulse`.
- `bloodPressure`.
- `respiratoryRate`.
- `spo2`.
- `height`.
- `weight`.
- `bmi`.
- `painScore`.
- `status`.
- `unitSystem`.
- `referenceRange`.
- `source`.

Allergy fields:

- `id`.
- `patientId`.
- `allergen`.
- `type`.
- `reaction`.
- `severity`.
- `status`.
- `notes`.
- `updatedAt`.

Template fields:

- `id`.
- `name`.
- `type`.
- `specialty`.
- `scope`.
- `tags`.
- `content`.
- `status`.
- `updatedAt`.

Clinical handoff fields:

- `id`.
- `consultationId`.
- `patientId`.
- `targetDepartment`.
- `handoffType`.
- `status`.
- `createdAt`.
- `createdBy`.

Reference range fields:

- `id`.
- `vitalName`.
- `ageGroup`.
- `unit`.
- `low`.
- `high`.
- `criticalLow`.
- `criticalHigh`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Patient and visit required.
- Chief complaint recommended before completion.
- Diagnosis recommended before completion.
- Medicine name required when adding prescription row.
- Dose, frequency, duration, and route required for medicine rows.
- Dose unit and duration unit required for medicine rows.
- Follow-up date cannot be before consultation date.
- Allergy severity required.
- Vitals numeric format validation.
- Vitals unit required for numeric values.
- Template name and type required.
- Revision reason required when editing completed consultation placeholder.
- Addendum text required for addendum placeholder.
- Handoff target required when sending to pharmacy, lab, radiology, or billing placeholder.
- Confirmation required for high-risk prescription alert acknowledgement.

Validation UI:

- Inline field error.
- Completion checklist warning.
- Clinical warning panel.
- Disabled complete action where required fields are missing.
- Confirmation for overwrite, remove, revision, and high-risk alert acknowledgement.

## Accessibility Requirements

Required:

- Forms have labels.
- Clinical tabs are keyboard accessible.
- Medicine rows are keyboard navigable.
- Alerts are not color-only.
- Drawers trap focus and return focus after close.
- Prescription print preview has readable headings.
- Abnormal vitals include text labels.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, filters, tabs, drawers, note editors, and prescription rows work without mouse.

## Performance Requirements

Even with static data:

- Keep consultation workspace stable and fast.
- Avoid rendering all tab content at once when heavy.
- Keep patient header stable to avoid layout shift.
- Use drawer previews for history and templates.
- Keep prescription rows responsive and compact.
- Use skeletons for loading-looking states.
- Avoid heavy editor libraries unless already accepted by the project.

## Page State Requirements

Each Phase 5 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Draft consultation state.
- Completed consultation read-only state.
- Revision placeholder state.
- Validation error.
- Clinical warning.
- Allergy conflict warning.
- Drug interaction warning.
- Abnormal vitals warning.
- Critical vitals warning.
- Missing diagnosis warning.
- Missing follow-up warning.
- Missing handoff target warning.
- Prescription empty state.
- Template insert confirmation state.
- Addendum state.
- Print history state.
- Access denied state.
- Read-only state.

## Phase 5 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OPD worklist | Required | Required | Required | Required | Required | Required | Required |
| OPD consultation | Required | Required | Required | Required | Required | Required | Required |
| Clinical notes | Required | Required | Required | Required | Required | Required | Not needed |
| SOAP notes | Required | Required | Required | Required | Required | Required | Not needed |
| Diagnosis/ICD | Required | Required | Required | Required | Required | Required | Not needed |
| Prescription | Required | Required | Required | Required | Required | Required | Required |
| Procedures | Required | Required | Required | Required | Required | Required | Required |
| Vitals | Required | Required | Required | Required | Required | Required | Required |
| Allergies | Required | Required | Required | Required | Required | Required | Not needed |
| Vaccinations | Required | Required | Required | Required | Required | Required | Required |
| Chronic care | Required | Required | Required | Required | Required | Required | Not needed |
| Clinical templates | Required | Required | Required | Required | Required | Required | Not needed |

## Print And Export Placeholder Rules

Phase 5 does not need real export files, but UI should reserve production actions.

Required:

- Print prescription placeholder.
- Print consultation summary placeholder.
- Print vitals summary placeholder.
- Print vaccination schedule placeholder.
- Print procedure advice placeholder.
- Export clinical notes placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Sensitive identifiers remain masked where required.
- Draft documents should show draft watermark.
- Completed documents should show print timestamp placeholder.
- Addendum should print separately or clearly marked below original summary.
- Prescription print should avoid internal-only warning text unless selected.

## Clinical Metrics Placeholders

Phase 5 should prepare static clinical workflow metrics for future dashboards.

Recommended metrics:

- Consultations completed today.
- Average consultation time.
- Draft consultations.
- Completed consultations.
- Prescriptions printed.
- Allergy warnings acknowledged.
- Drug interaction warnings shown.
- Patients with abnormal vitals.
- Follow-ups advised.
- Referrals advised.
- Lab/radiology advice count placeholder.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3/4 shared patterns are ready.
2. Add OPD navigation entries and route placeholders.
3. Add Phase 5 static data files.
4. Build OPD worklist page.
5. Build OPD consultation workspace and sticky patient header.
6. Build clinical notes and SOAP notes sections.
7. Build diagnosis and ICD placeholder UI.
8. Build prescription management and print preview.
9. Add allergy/drug interaction warning placeholders.
10. Build procedure management.
11. Build vitals management and abnormal indicators.
12. Build allergy management.
13. Build vaccination management.
14. Build chronic disease management.
15. Build clinical templates.
16. Add consultation completion checklist.
17. Add revision/addendum placeholders.
18. Add clinical handoff placeholders for pharmacy, billing, lab, and radiology.
19. Add role visibility and access denied states.
20. Verify light, dark, system, dynamic preset, and custom color themes.
21. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
22. Polish validation, keyboard behavior, loading states, empty states, print-safe views, and clinical safety warnings.

## Production-Grade Acceptance Checklist

Phase 5 is complete when:

- OPD worklist works with static appointment/queue data.
- OPD consultation workspace has sticky patient context and tab-based clinical workflow.
- Clinical notes and SOAP notes support templates and draft state.
- Diagnosis management supports primary/secondary diagnosis and ICD placeholder.
- Prescription management supports medicine entry, alerts, templates, and print preview.
- Prescription management shows dose units, duration units, warning acknowledgement, and revision placeholders.
- Allergy warnings are visible in consultation and prescription contexts.
- Vitals management supports entry, trends, and abnormal indicators.
- Vitals management shows units, reference range placeholders, and critical value states.
- Procedure management supports advised/performed states and billing placeholder.
- Procedure management supports consent and referral placeholders.
- Vaccination management supports due, overdue, administered, deferred, and contraindicated states.
- Vaccination management includes batch, expiry, and adverse event placeholders.
- Chronic disease management supports condition tracking and risk markers.
- Clinical templates support note, diagnosis, prescription, procedure, advice, and follow-up use.
- Consultation completion checklist is present.
- Completed consultation read-only/revision placeholder state is represented.
- Addendum and print history placeholders are represented.
- Clinical handoff placeholders for pharmacy, billing, lab, and radiology are represented.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky headers and sticky actions do not cover content.
- Patient alerts from Phase 3 remain visible in clinical context.
- Appointment/queue context from Phase 4 is preserved.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, note editors, and prescription rows.
- Static data is organized for future EMR, pharmacy, LIS, RIS, billing, and AI integrations.

## Handoff Notes For Phase 6

Phase 6 can begin after Phase 5 provides:

- OPD consultation static data.
- Clinical note and SOAP patterns.
- Diagnosis and ICD placeholder patterns.
- Prescription UI and print preview.
- Allergy and clinical warning patterns.
- Vitals entry and abnormal indicator patterns.
- Procedure advice pattern.
- Vaccination and chronic disease tracking patterns.
- Clinical template pattern.
- Consultation completion pattern.

Phase 6 should then focus on IPD/admission management, bed management, ward management, ICU management, nursing station, doctor rounds, nursing assessment, medication administration, intake output chart, discharge management, transfer management, package management, emergency registration, triage, casualty, trauma, ambulance management, and emergency billing placeholders.
