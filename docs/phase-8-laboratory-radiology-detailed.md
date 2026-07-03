# Phase 8 Detailed Document: Laboratory And Radiology

## Phase Goal

Build the production-grade UI screens for laboratory and radiology workflows, including LIS management, test master, test packages, sample collection, sample processing, barcode management, analyzer integration placeholders, result entry, pathologist approval, critical alerts, lab department worklists, radiology management, radiology scheduling, PACS integration placeholders, DICOM viewer placeholder, radiology reporting, and modality worklists.

This phase is UI-only and uses static data. It should feel ready for real diagnostic department operations, but no backend LIS/RIS/PACS integration, analyzer device connection, barcode printer integration, DICOM rendering engine, report signing provider, billing engine, or result delivery integration is required in this phase.

## Dependency On Previous Phases

Phase 8 must use the foundations from Phases 1 to 7.

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
- Audit log style for sensitive access.
- Confirmation pattern for high-risk actions.
- User, role, department, doctor, nurse, and hospital static data.

Required Phase 3 patterns:

- Patient search and quick view.
- Patient profile header.
- Patient alert display.
- Patient documents.
- Consent status pattern.
- Patient privacy and masking rules.

Required Phase 4 patterns:

- Appointment/scheduling patterns.
- Calendar and slot selection.
- Queue/token status patterns.
- Front-office handoff pattern.

Required Phase 5 patterns:

- OPD consultation summary.
- Diagnosis, prescription, vitals, and clinical warning patterns.
- Clinical handoff placeholders to lab/radiology.

Required Phase 6 patterns:

- IPD and emergency patient context.
- Inpatient/emergency handoff and escalation patterns.
- Critical patient status.

Required Phase 7 patterns:

- EMR/EHR encounter context.
- Clinical attachment preview.
- Clinical timeline pattern.
- Digital signature placeholder pattern.
- Record access audit and privacy patterns.

Important rule:

All Phase 8 screens must follow the Phase 1 theme and responsive system. Do not create separate laboratory, radiology, PACS, report, barcode, analyzer, table, form, drawer, tab, or status patterns outside the shared design system.

## Phase 8 Scope

Phase 8 covers:

- Laboratory dashboard.
- Laboratory order/worklist management.
- Test master.
- Test package management.
- Sample collection.
- Sample processing.
- Barcode management.
- Analyzer integration placeholder.
- Result entry.
- Pathologist approval.
- Critical lab alerts.
- Histopathology worklist.
- Microbiology worklist.
- Biochemistry worklist.
- Hematology worklist.
- Radiology dashboard.
- Radiology order/worklist management.
- Radiology scheduling.
- Modality calendar.
- PACS integration placeholder.
- DICOM viewer placeholder.
- Radiology reporting.
- Ultrasound worklist.
- CT scan worklist.
- MRI worklist.
- X-Ray worklist.
- Mammography worklist.
- PET scan worklist.
- Diagnostic report print/export placeholders.
- EMR attachment/timeline handoff placeholders.
- Sample chain-of-custody placeholders.
- Diagnostic report version/correction placeholders.
- Radiology safety checklist placeholders.

Phase 8 does not cover:

- Real analyzer integration.
- Real barcode printer integration.
- Real PACS connection.
- Real DICOM image rendering.
- Real RIS/LIS backend.
- Real billing calculation.
- Real report delivery to patient portal.
- Real HL7/FHIR messaging.
- Real digital signature provider.
- Real AI radiology assistant.
- Real specimen storage tracking.
- Real contrast reaction management.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/laboratory` | Laboratory dashboard | Lab orders, sample status, result status, alerts. |
| `/laboratory/orders` | Lab orders | Laboratory order worklist. |
| `/laboratory/tests` | Test master | Test definitions, sample type, ranges, departments. |
| `/laboratory/packages` | Test package management | Lab packages and included tests. |
| `/laboratory/samples` | Sample collection | Collection queue, barcode, collected/pending state. |
| `/laboratory/processing` | Sample processing | Processing board, department routing, analyzer/manual state. |
| `/laboratory/barcodes` | Barcode management | Barcode preview, scan field, reprint placeholder. |
| `/laboratory/analyzers` | Analyzer integration placeholder | Device status, sync logs, import placeholder. |
| `/laboratory/results` | Result entry | Result form, abnormal flags, comments, attachments. |
| `/laboratory/approvals` | Pathologist approval | Approval queue, review drawer, approve/reject. |
| `/laboratory/critical-alerts` | Critical alerts | Critical result list and acknowledgement. |
| `/laboratory/histopathology` | Histopathology | Department worklist and reporting placeholders. |
| `/laboratory/microbiology` | Microbiology | Culture/sensitivity style worklist placeholders. |
| `/laboratory/biochemistry` | Biochemistry | Biochemistry worklist/result placeholders. |
| `/laboratory/hematology` | Hematology | Hematology worklist/result placeholders. |
| `/radiology` | Radiology dashboard | Radiology orders, schedule, modality status. |
| `/radiology/orders` | Radiology orders | Imaging order worklist. |
| `/radiology/schedule` | Radiology scheduling | Modality slots, preparation, calendar. |
| `/radiology/pacs` | PACS placeholder | Study list, image availability, PACS sync state. |
| `/radiology/dicom-viewer` | DICOM viewer placeholder | Viewer layout, series panel, tools placeholder. |
| `/radiology/reports` | Radiology reporting | Report editor, templates, approval status. |
| `/radiology/ultrasound` | Ultrasound | Modality worklist and reports. |
| `/radiology/ct` | CT scan | Modality worklist and reports. |
| `/radiology/mri` | MRI | Modality worklist and reports. |
| `/radiology/x-ray` | X-Ray | Modality worklist and reports. |
| `/radiology/mammography` | Mammography | Modality worklist and reports. |
| `/radiology/pet` | PET scan | Modality worklist and reports. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/laboratory` | Laboratory/LIS pages | Main HMS app shell from Phase 1. |
| `(app)/radiology` | Radiology/RIS/PACS pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 8 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for lab reports, radiology reports, barcode slips, collection lists, and approval summaries.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Order, sample, result, approval, critical alert, modality, PACS, and report statuses must use shared status tokens.
- Never hardcode page-level colors.
- Critical values must be readable in all themes.
- DICOM viewer placeholder must not break dark mode.
- Print views should use Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 8 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column worklist cards and full-screen drawers.
- Tablet screens can use two-column forms and compact worklists.
- Laptop and desktop screens can use table plus detail drawer and split report editor.
- Wide desktop screens can show worklist, patient/order context, and report/result editor together.
- No page-level horizontal scroll.
- Dense result tables, sample tables, modality schedules, and DICOM placeholder panels may scroll inside their own containers.
- Sticky headers and sticky actions must not cover result forms, report editors, or image viewer placeholders.

### Diagnostics Workflow Pattern

Required:

- Sticky patient/order header.
- Order source context: OPD, IPD, emergency, external placeholder.
- Patient alerts and clinical warnings.
- Department/modality status.
- Worklist filters.
- Result/report editor.
- Approval state.
- Critical alert state.
- Print/export placeholders.
- EMR attachment/timeline handoff indicator.

Avoid:

- Hidden patient identity.
- Long unstructured result forms.
- Multiple popup dependency.
- Deep nested lab/radiology menus.
- Full page reloads for sample/result/report status changes.
- Report UI that hides critical alerts.

## Diagnostic Status Standards

### Lab Order Statuses

- Ordered.
- Sample pending.
- Sample collected.
- In processing.
- Result pending.
- Result entered.
- Approval pending.
- Approved.
- Rejected.
- Report printed.
- Cancelled.

### Sample Statuses

- Pending collection.
- Collected.
- Recollected.
- Rejected.
- In transit.
- Received.
- Processing.
- Stored.
- Disposed placeholder.
- Lost/damaged placeholder.
- Quantity not sufficient placeholder.
- Hemolyzed/clotted placeholder.

### Result Statuses

- Not entered.
- Draft.
- Abnormal.
- Critical.
- Approval pending.
- Approved.
- Correction requested.
- Corrected placeholder.
- Addendum placeholder.
- Superseded placeholder.

### Radiology Order Statuses

- Ordered.
- Scheduled.
- Patient arrived.
- In progress.
- Image acquired placeholder.
- Reporting pending.
- Report draft.
- Approval pending.
- Approved.
- Report printed.
- Cancelled.

### PACS/DICOM Statuses

- Study pending.
- Image unavailable.
- Image available placeholder.
- PACS sync pending.
- PACS synced placeholder.
- Sync failed placeholder.

Status rules:

- Status must use text, icon, and token color.
- Critical, rejected, correction, and sync-failed states must be visually distinct.
- Approved and printed states must be different.
- Placeholder integrations must be clearly marked.
- Corrected/addendum/superseded reports must show version context.
- Lost, damaged, hemolyzed, clotted, and quantity-not-sufficient sample states must be visually distinct.

## Diagnostic Safety Rules

Phase 8 handles diagnostic results and critical alerts.

Required:

- Patient identity must remain visible: name, UHID, age/gender, allergies/alerts, encounter type.
- Order source must be visible: OPD, IPD, emergency, external placeholder.
- Sample label/barcode must match patient and order context.
- Sample chain-of-custody should show collected, transported, received, processed, stored, and disposed placeholder steps.
- Sample rejection requires reason placeholder.
- Specimen quality issue requires reason placeholder.
- Barcode reprint requires reason placeholder.
- Critical result requires acknowledgement placeholder.
- Critical result should show escalation state when unacknowledged.
- Result correction requires reason placeholder.
- Corrected report must preserve original approved result placeholder.
- Approval/rejection requires reviewer identity placeholder.
- Radiology report approval requires radiologist placeholder.
- Radiology contrast/implant/preparation safety states must be visible before study starts.
- DICOM/PACS viewer is placeholder only and must not imply real image loading.
- Approved reports should become read-only unless correction placeholder is used.
- Report print/export should show privacy warning placeholder.

High-impact actions:

- Reject sample.
- Reprint barcode.
- Approve result.
- Reject result.
- Mark critical alert acknowledged.
- Correct approved result placeholder.
- Add result addendum placeholder.
- Cancel diagnostic order.
- Approve radiology report.
- Reject radiology report.
- Mark PACS sync failed placeholder.

## Diagnostic Chain-Of-Custody Rules

Phase 8 should prepare UI for future specimen and report traceability.

Sample custody steps:

- Ordered.
- Label printed.
- Collected.
- In transit.
- Received.
- Processing.
- Result entered.
- Approved.
- Stored.
- Disposed placeholder.

Required behavior:

- Each custody step shows user, time, location placeholder, and status.
- Missing custody step should show warning placeholder.
- Recollection creates linked sample record placeholder.
- Reprint barcode creates audit event placeholder.
- Sample rejection and recollection preserve original barcode/order context.

## Diagnostic Report Version Rules

Approved diagnostic reports should be treated as controlled records.

Version states:

- Draft.
- Approved.
- Corrected.
- Addendum.
- Superseded.
- Printed.

Required behavior:

- Approved reports open read-only by default.
- Correction requires reason placeholder.
- Addendum does not overwrite original approved report.
- Superseded report links to current version placeholder.
- Print preview shows report version status.
- EMR timeline receives approved/corrected/addendum placeholder event.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All Phase 8 screens. |
| Hospital Admin | Read-only dashboards and operational states. |
| Doctor | Order status, approved reports, critical alerts for own patients. |
| Nurse | Sample status and patient preparation placeholders. |
| Lab Technician | Sample collection, processing, result entry draft. |
| Pathologist | Result review, approval, correction request. |
| Radiology Technician | Scheduling, modality worklist, image acquisition placeholder. |
| Radiologist | Radiology reporting, approval, correction request. |
| Receptionist | Patient arrival and schedule status placeholder. |
| Billing Executive | Diagnostic billing status placeholder only. |
| Management | Read-only diagnostics dashboard. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view allowed reports but cannot edit or approve.
- Disabled actions should explain required permission.
- Approved/corrected reports use read-only or correction placeholder states.

## Page 1: Laboratory Dashboard

### Purpose

Provide a high-level operational dashboard for laboratory orders, samples, results, approvals, and critical alerts.

### Route

`/laboratory`

### Summary Cards

- Orders today.
- Samples pending.
- Samples collected.
- Results pending.
- Approval pending.
- Critical alerts.
- Rejected samples.
- Average turnaround placeholder.

### Widgets

- Order status by department.
- Sample collection queue.
- Processing queue.
- Approval queue.
- Critical alerts.
- Analyzer sync placeholder.
- Department worklists.

### Quick Actions

- Collect sample.
- Enter result.
- Open approvals.
- Print collection list placeholder.
- View critical alerts.

### Acceptance

- Lab operational state is clear.
- Critical alerts are visible.
- Worklist entry points are low-click.

## Page 2: Lab Orders

### Purpose

Show laboratory orders from OPD, IPD, emergency, and external placeholders.

### Route

`/laboratory/orders`

### Filters

- Date range.
- Order source.
- Department.
- Test.
- Status.
- Patient search.
- Priority.
- Critical only.

### Table Columns

- Order number.
- Patient.
- UHID.
- Source.
- Test/package.
- Department.
- Priority.
- Sample status.
- Result status.
- Ordered by.
- Actions.

### Order Detail Drawer

Sections:

- Patient summary.
- Order summary.
- Tests.
- Sample requirements.
- Billing status placeholder.
- Result status.
- Audit/status history.

### Actions

- Collect sample.
- Print barcode.
- Cancel order placeholder.
- View result.
- Open EMR timeline.

### Acceptance

- Orders are easy to search and filter.
- Patient and source context are visible.
- Actions are status-aware.

## Page 3: Test Master

### Purpose

Manage test definitions, departments, sample requirements, normal ranges, and report settings placeholders.

### Route

`/laboratory/tests`

### Table Columns

- Test name.
- Code.
- Department.
- Sample type.
- Method placeholder.
- Normal range status.
- Price placeholder.
- Status.
- Actions.

### Test Form Tabs

- Basic.
- Sample.
- Result parameters.
- Reference ranges.
- Report settings.
- Billing placeholder.
- Audit.

### Reference Range Fields

- Parameter.
- Unit.
- Gender.
- Age range.
- Low.
- High.
- Critical low.
- Critical high.

### Acceptance

- Test setup is structured.
- Reference range UI supports age/gender ranges.
- Billing value is placeholder only.

## Page 4: Test Package Management

### Purpose

Manage test packages and included tests.

### Route

`/laboratory/packages`

### Table Columns

- Package name.
- Code.
- Included tests.
- Department.
- Price placeholder.
- Status.
- Actions.

### Package Drawer

Sections:

- Package summary.
- Included tests.
- Sample requirements.
- Report grouping placeholder.
- Billing placeholder.

### Acceptance

- Included tests are clear.
- Sample requirement conflicts are visible as placeholders.
- Package pricing is placeholder only.

## Page 5: Sample Collection

### Purpose

Manage collection queue, barcode labels, collected/pending states, and sample handoff.

### Route

`/laboratory/samples`

### Queue Columns

- Collection time.
- Patient.
- UHID.
- Order number.
- Test/package.
- Sample type.
- Priority.
- Barcode.
- Status.
- Actions.

### Collection Drawer

Sections:

- Patient summary.
- Order summary.
- Sample type.
- Collection container placeholder.
- Barcode preview.
- Collector.
- Collection time.
- Notes.
- Chain-of-custody preview.

### Actions

- Mark collected.
- Print barcode.
- Reprint barcode.
- Reject sample.
- Mark recollection needed.
- Mark sample quality issue placeholder.

### Safety Rules

- Patient and order must be visible with barcode.
- Barcode reprint requires reason placeholder.
- Sample rejection requires reason placeholder.
- Quality issue requires reason placeholder.
- Recollection should create visible status.
- Chain-of-custody step should be added after collection placeholder.

### Acceptance

- Collection workflow is fast.
- Barcode label preview is clear.
- Rejection/recollection states are represented.
- Chain-of-custody and specimen quality states are represented.

## Page 6: Sample Processing

### Purpose

Track received samples, processing status, analyzer/manual routing, and department queues.

### Route

`/laboratory/processing`

### Processing Board Columns

- Barcode.
- Patient.
- Sample type.
- Department.
- Test.
- Received time.
- Processing status.
- Analyzer/manual.
- TAT status.
- Actions.
- Custody status.

### Processing Statuses

- Received.
- Processing.
- Analyzer pending.
- Manual processing.
- Result pending.
- Delayed.
- Rejected.
- Quality issue.
- Recollection required.

### Actions

- Mark received.
- Start processing.
- Route to analyzer placeholder.
- Mark manual result.
- Reject sample.
- Mark quality issue placeholder.

### Acceptance

- Processing board is scannable.
- Department routing is visible.
- TAT/delay placeholder is clear.
- Chain-of-custody and quality issue states are visible.

## Page 7: Barcode Management

### Purpose

Provide barcode scan, preview, print, reprint, and status UI.

### Route

`/laboratory/barcodes`

### Sections

- Scan field.
- Barcode preview.
- Recent scans.
- Reprint queue.
- Failed scan placeholder.
- Chain-of-custody lookup.

### Barcode Fields

- Barcode number.
- Order number.
- Patient.
- Sample type.
- Test/package.
- Collection time.
- Status.
- Reprint count.
- Last reprint reason.

### Actions

- Scan barcode placeholder.
- Print barcode.
- Reprint barcode.
- Mark damaged placeholder.

### Acceptance

- Barcode UI is keyboard-friendly.
- Reprint reason placeholder is present.
- Barcode does not claim real printer integration.
- Barcode lookup shows order/patient/sample chain context.

## Page 8: Analyzer Integration Placeholder

### Purpose

Prepare UI for future LIS analyzer/device integration.

### Route

`/laboratory/analyzers`

### Device Table Columns

- Analyzer.
- Department.
- Connection status.
- Last sync.
- Pending results.
- Error count.
- Status.
- Actions.

### Device Detail Drawer

Sections:

- Device summary.
- Sync status.
- Import log placeholder.
- Error log placeholder.
- Mapped tests placeholder.

### Actions

- Sync placeholder.
- Import results placeholder.
- View errors.
- Disable device placeholder.

### Safety Rules

- Clearly mark device integration as placeholder.
- Imported result cannot auto-approve in Phase 8.
- Failed import states are visible.

### Acceptance

- Analyzer status is understandable.
- Sync/import placeholders are not mistaken for live integration.

## Page 9: Result Entry

### Purpose

Enter lab results, abnormal flags, comments, attachments, and draft state.

### Route

`/laboratory/results`

### Result Entry Layout

- Sticky patient/order header.
- Test parameter table.
- Comments.
- Attachment placeholder.
- Critical flag panel.
- Previous approved result/version panel.
- Save draft/submit for approval actions.

### Parameter Columns

- Parameter.
- Result value.
- Unit.
- Reference range.
- Flag.
- Previous value placeholder.
- Comment.

### Result Flags

- Normal.
- Low.
- High.
- Critical low.
- Critical high.
- Abnormal.

### Actions

- Save draft.
- Submit for approval.
- Mark critical placeholder.
- Attach file placeholder.
- Print draft placeholder.
- Add correction placeholder.
- Add addendum placeholder.

### Safety Rules

- Critical result requires acknowledgement flow after approval placeholder.
- Result outside reference range should flag automatically in UI placeholder.
- Correction after approval requires reason placeholder.
- Addendum after approval requires reason placeholder.
- Original approved result remains visible during correction placeholder.

### Acceptance

- Result entry is fast and structured.
- Abnormal/critical values are visible.
- Reference ranges and units are clear.
- Correction/addendum/version context is represented.

## Page 10: Pathologist Approval

### Purpose

Review and approve/reject lab results.

### Route

`/laboratory/approvals`

### Approval Queue Columns

- Order number.
- Patient.
- Test/package.
- Department.
- Result status.
- Critical flag.
- Submitted by.
- Submitted time.
- Actions.

### Review Drawer

Sections:

- Patient summary.
- Result values.
- Abnormal/critical flags.
- Previous results placeholder.
- Attachments.
- Comments.
- Approval action.

### Actions

- Approve.
- Reject.
- Request correction.
- Print report placeholder.
- Add addendum placeholder.

### Safety Rules

- Approve action requires reviewer identity placeholder.
- Reject/correction requires reason placeholder.
- Critical result approval should trigger critical alert placeholder.
- Approved result becomes read-only unless correction placeholder.
- Correction/addendum keeps original result visible.

### Acceptance

- Approval queue is scannable.
- Critical values are hard to miss.
- Approval/rejection states are clear.
- Corrected/addendum report states are represented.

## Page 11: Critical Alerts

### Purpose

Manage critical lab result alerts and acknowledgement.

### Route

`/laboratory/critical-alerts`

### Table Columns

- Alert time.
- Patient.
- UHID.
- Test.
- Parameter.
- Critical value.
- Doctor/department.
- Notification status placeholder.
- Acknowledgement status.
- Actions.

### Actions

- Acknowledge.
- Notify doctor placeholder.
- Open result.
- Open patient EMR.
- Escalate placeholder.

### Safety Rules

- Critical alert acknowledgement requires user and time placeholder.
- Notification delivery is placeholder only.
- Unacknowledged critical alerts remain visible.
- Escalation state should appear when alert remains unacknowledged.
- Acknowledgement should show receiver/contact placeholder.

### Acceptance

- Critical alerts are prominent.
- Acknowledgement state is clear.
- EMR handoff is available.
- Escalation and contact placeholders are represented.

## Page 12: Laboratory Department Worklists

### Purpose

Provide department-specific worklists for histopathology, microbiology, biochemistry, and hematology.

### Routes

- `/laboratory/histopathology`
- `/laboratory/microbiology`
- `/laboratory/biochemistry`
- `/laboratory/hematology`

### Shared Columns

- Order number.
- Patient.
- Sample.
- Test.
- Status.
- Priority.
- Assigned staff.
- TAT status.
- Actions.

### Department-Specific Placeholders

Histopathology:

- Specimen type.
- Grossing placeholder.
- Slide preparation placeholder.
- Microscopy placeholder.

Microbiology:

- Culture status.
- Organism placeholder.
- Sensitivity placeholder.
- Incubation status.

Biochemistry:

- Analyzer/manual status.
- Parameter group.
- Critical chemistry flags.

Hematology:

- CBC parameters placeholder.
- Smear review placeholder.
- Critical hematology flags.

### Acceptance

- Department worklists have shared structure.
- Department-specific fields are represented.
- TAT and critical states are visible.

## Page 13: Radiology Dashboard

### Purpose

Provide radiology operational overview for orders, scheduling, modality worklists, PACS status, reporting, and approvals.

### Route

`/radiology`

### Summary Cards

- Orders today.
- Scheduled studies.
- Patient arrived.
- Reporting pending.
- Approval pending.
- PACS sync failed.
- Critical findings placeholder.

### Widgets

- Modality status.
- Schedule timeline.
- Reporting queue.
- PACS sync state.
- Critical findings placeholder.
- Department workload.

### Quick Actions

- Schedule study.
- Open worklist.
- Open reporting.
- Open PACS placeholder.

### Acceptance

- Radiology operational state is clear.
- Modality and reporting queues are visible.
- PACS placeholder state is clear.

## Page 14: Radiology Orders

### Purpose

Manage imaging orders and modality worklists.

### Route

`/radiology/orders`

### Table Columns

- Order number.
- Patient.
- UHID.
- Source.
- Modality.
- Study.
- Priority.
- Schedule status.
- Report status.
- PACS status.
- Actions.

### Actions

- Schedule.
- Mark arrived.
- Start study placeholder.
- Open report.
- Open PACS placeholder.
- Cancel order placeholder.

### Acceptance

- Orders are scannable.
- Modality/PACS/report statuses are visible.
- Placeholder integration is clear.

## Page 15: Radiology Scheduling

### Purpose

Schedule radiology studies by modality, room, preparation, and slot.

### Route

`/radiology/schedule`

### Views

- Day.
- Week.
- Modality.
- Room.
- Technician.

### Scheduling Fields

- Patient.
- Order.
- Modality.
- Study.
- Date/time.
- Room.
- Technician.
- Preparation required.
- Contrast required placeholder.
- Consent required placeholder.
- Safety checklist required placeholder.

### Preparation States

- Not required.
- Pending.
- Completed.
- Failed/prep incomplete.
- Consent pending.
- Safety checklist pending.

### Radiology Safety Checklist

Common checklist items:

- Patient identity confirmed.
- Pregnancy status placeholder where applicable.
- Contrast allergy checked.
- Renal function checked placeholder for contrast studies.
- Implant/device screening placeholder for MRI.
- Consent completed where required.
- Preparation completed.
- Previous study available placeholder.

### Safety Rules

- Contrast/consent/preparation states must be visible.
- Scheduling conflict requires warning placeholder.
- Emergency priority can override slot placeholder with reason.
- Safety checklist must be visible before study start placeholder.

### Acceptance

- Modality calendar is readable.
- Preparation and consent states are visible.
- Emergency override is represented safely.
- Safety checklist states are represented.

## Page 16: PACS Integration Placeholder

### Purpose

Prepare UI for future PACS integration and study/image availability.

### Route

`/radiology/pacs`

### Study Table Columns

- Study UID placeholder.
- Patient.
- Modality.
- Study.
- Study date.
- Image status.
- PACS sync status.
- Report status.
- Actions.

### Actions

- Open viewer placeholder.
- Retry sync placeholder.
- Link study placeholder.
- View sync log.
- Mark image unavailable placeholder.

### Safety Rules

- Clearly mark PACS as placeholder.
- Image available does not load real DICOM in Phase 8.
- Sync failed requires visible error state.
- Linking/unlinking study requires reason placeholder.

### Acceptance

- PACS study state is understandable.
- Viewer and sync actions are clearly placeholders.
- Study linking and sync-failure states are represented.

## Page 17: DICOM Viewer Placeholder

### Purpose

Show a realistic DICOM viewer layout placeholder without real DICOM rendering.

### Route

`/radiology/dicom-viewer`

### Viewer Layout

- Study header.
- Patient/study summary.
- Series panel.
- Main image viewport placeholder.
- Tool panel.
- Report side panel placeholder.

### Viewer Tools Placeholder

- Zoom.
- Pan.
- Window/level.
- Measure.
- Rotate.
- Invert.
- Series selector.
- Compare placeholder.

### Safety Rules

- Clearly show viewer is placeholder.
- No diagnostic image is displayed in Phase 8.
- Patient/study identity remains visible.
- Tool buttons should be disabled or placeholder-labeled.

### Acceptance

- Viewer layout is realistic.
- Dark mode works well.
- Placeholder state cannot be mistaken for real DICOM.

## Page 18: Radiology Reporting

### Purpose

Create radiology reports with templates, findings, impression, approval, and print preview.

### Route

`/radiology/reports`

### Report Sections

- Patient/study header.
- Clinical indication.
- Technique.
- Safety checklist summary.
- Findings.
- Impression.
- Recommendations.
- Template picker.
- Prior study comparison placeholder.
- Critical finding panel.
- Approval.
- Print preview.

### Report Statuses

- Draft.
- Submitted.
- Correction requested.
- Approval pending.
- Approved.
- Printed.
- Addendum placeholder.
- Corrected placeholder.
- Superseded placeholder.

### Actions

- Save draft.
- Submit for approval.
- Approve report.
- Request correction.
- Add addendum placeholder.
- Print report.
- Mark critical finding placeholder.

### Safety Rules

- Approved reports are read-only unless addendum/correction placeholder.
- Critical finding should trigger alert placeholder.
- Correction/addendum requires reason placeholder.
- Template insertion should not overwrite existing report without confirmation.
- Original approved report remains visible during correction/addendum placeholder.
- Critical finding acknowledgement/escalation state should be visible.

### Acceptance

- Report editor is usable and low-scroll.
- Template and approval states are clear.
- Print preview is production-style.
- Report version and critical finding states are represented.

## Page 19: Radiology Modality Worklists

### Purpose

Provide modality-specific worklists and reporting states for ultrasound, CT, MRI, X-Ray, mammography, and PET.

### Routes

- `/radiology/ultrasound`
- `/radiology/ct`
- `/radiology/mri`
- `/radiology/x-ray`
- `/radiology/mammography`
- `/radiology/pet`

### Shared Columns

- Time.
- Patient.
- UHID.
- Study.
- Source.
- Priority.
- Preparation/consent.
- PACS status.
- Report status.
- Actions.

### Modality-Specific Placeholders

Ultrasound:

- Probe/preparation placeholder.
- Obstetric consent placeholder where applicable.

CT:

- Contrast requirement placeholder.
- Renal function check placeholder.
- Contrast allergy check placeholder.

MRI:

- Implant safety checklist placeholder.
- Claustrophobia/sedation placeholder.
- MRI safety questionnaire placeholder.

X-Ray:

- Body part.
- Portable X-Ray placeholder.

Mammography:

- Screening/diagnostic type.
- Prior comparison placeholder.

PET:

- Radiotracer placeholder.
- Uptake time placeholder.

### Acceptance

- Modality worklists share a common pattern.
- Modality-specific safety fields are visible.
- Report and PACS states are clear.
- Safety checklist states are visible before start-study placeholder.

## Static Data Requirements

Phase 8 should add or expand static data files.

Recommended data:

- `mockLabOrders`.
- `mockLabTests`.
- `mockLabPackages`.
- `mockSampleCollections`.
- `mockSampleProcessing`.
- `mockBarcodes`.
- `mockAnalyzers`.
- `mockLabResults`.
- `mockLabApprovals`.
- `mockCriticalLabAlerts`.
- `mockLabDepartmentWorklists`.
- `mockRadiologyOrders`.
- `mockRadiologySchedules`.
- `mockPacsStudies`.
- `mockDicomViewerStudies`.
- `mockRadiologyReports`.
- `mockRadiologyModalities`.
- `mockDiagnosticAuditEvents`.
- `mockSampleCustodyEvents`.
- `mockSpecimenQualityIssues`.
- `mockDiagnosticReportVersions`.
- `mockRadiologySafetyChecklists`.
- `mockCriticalAlertEscalations`.

Lab order fields:

- `id`.
- `orderNo`.
- `patientId`.
- `encounterId`.
- `source`.
- `tests`.
- `priority`.
- `status`.
- `sampleStatus`.
- `resultStatus`.
- `orderedBy`.
- `orderedAt`.

Sample fields:

- `id`.
- `orderId`.
- `barcode`.
- `sampleType`.
- `container`.
- `status`.
- `collectedBy`.
- `collectedAt`.
- `rejectionReason`.
- `qualityIssue`.
- `custodyStatus`.
- `reprintCount`.

Result fields:

- `id`.
- `orderId`.
- `testId`.
- `parameters`.
- `status`.
- `critical`.
- `enteredBy`.
- `approvedBy`.
- `approvedAt`.
- `version`.
- `correctionReason`.
- `addendum`.

Radiology order fields:

- `id`.
- `orderNo`.
- `patientId`.
- `encounterId`.
- `source`.
- `modality`.
- `study`.
- `priority`.
- `scheduleStatus`.
- `pacsStatus`.
- `reportStatus`.
- `safetyChecklistStatus`.

Radiology report fields:

- `id`.
- `orderId`.
- `studyId`.
- `radiologistId`.
- `status`.
- `findings`.
- `impression`.
- `criticalFinding`.
- `approvedAt`.
- `addendum`.
- `version`.
- `correctionReason`.
- `supersededBy`.

Sample custody event fields:

- `id`.
- `sampleId`.
- `orderId`.
- `eventType`.
- `location`.
- `userId`.
- `timestamp`.
- `notes`.

Radiology safety checklist fields:

- `id`.
- `orderId`.
- `modality`.
- `items`.
- `status`.
- `completedBy`.
- `completedAt`.

Critical alert escalation fields:

- `id`.
- `alertId`.
- `level`.
- `assignedTo`.
- `status`.
- `createdAt`.
- `acknowledgedAt`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Patient required.
- Order required.
- Test/sample type required.
- Barcode required for collection placeholder.
- Sample rejection reason required.
- Specimen quality issue reason required.
- Barcode reprint reason required.
- Study link/unlink reason required.
- Result value required for entered parameters.
- Critical alert acknowledgement required.
- Critical alert escalation reason required.
- Approval/rejection reason required where applicable.
- Radiology scheduling date/time required.
- Contrast/consent/preparation state required where applicable.
- Radiology safety checklist required before start-study placeholder.
- Report findings or impression required before approval placeholder.
- Addendum/correction reason required.

Validation UI:

- Inline field error.
- Critical warning panel.
- Sample mismatch warning.
- Chain-of-custody warning.
- Approval confirmation.
- Safety checklist warning.
- Disabled approve action where required fields are missing.
- Confirmation for critical alert, correction, rejection, and cancellation.

## Accessibility Requirements

Required:

- Worklists have clear table headers.
- Barcode scan input is keyboard-friendly.
- Critical values are not color-only.
- Result parameter rows are keyboard navigable.
- Radiology report editor is keyboard accessible.
- DICOM viewer placeholder tool buttons have labels.
- Drawers trap focus and return focus after close.
- Print/export warnings are screen-reader readable.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, filters, tabs, drawers, result entry, report editor, calendar controls, and viewer placeholder controls work without mouse.

## Performance Requirements

Even with static data:

- Worklists should render efficiently.
- Do not load all detail drawers by default.
- Lazy render heavy report/preview panels where useful.
- DICOM viewer placeholder should be lightweight.
- Keep patient/order header stable to avoid layout shift.
- Use skeletons for loading-looking states.
- Dense result tables should use internal scroll areas.

## Page State Requirements

Each Phase 8 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Sample pending state.
- Sample rejected state.
- Specimen quality issue state.
- Chain-of-custody missing step state.
- Barcode damaged/reprint state.
- Analyzer sync failed state.
- Result draft state.
- Critical result state.
- Critical alert escalated state.
- Approval pending state.
- Correction requested state.
- Corrected/addendum/superseded report state.
- Approved read-only state.
- PACS image unavailable state.
- PACS sync failed state.
- Radiology safety checklist pending state.
- DICOM viewer placeholder state.
- Report draft state.
- Critical finding state.
- Access denied state.
- Read-only state.

## Phase 8 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Laboratory dashboard | Required | Required | Required | Required | Required | Required | Required |
| Lab orders | Required | Required | Required | Required | Required | Required | Required |
| Test master | Required | Required | Required | Required | Required | Required | Required |
| Test packages | Required | Required | Required | Required | Required | Required | Required |
| Sample collection | Required | Required | Required | Required | Required | Required | Required |
| Sample processing | Required | Required | Required | Required | Required | Required | Required |
| Barcode management | Required | Required | Required | Required | Required | Required | Required |
| Analyzer placeholder | Required | Required | Required | Required | Required | Required | Not needed |
| Result entry | Required | Required | Required | Required | Required | Required | Required |
| Pathologist approval | Required | Required | Required | Required | Required | Required | Required |
| Critical alerts | Required | Required | Required | Required | Required | Required | Required |
| Lab department worklists | Required | Required | Required | Required | Required | Required | Required |
| Radiology dashboard | Required | Required | Required | Required | Required | Required | Required |
| Radiology orders | Required | Required | Required | Required | Required | Required | Required |
| Radiology scheduling | Required | Required | Required | Required | Required | Required | Required |
| PACS placeholder | Required | Required | Required | Required | Required | Required | Not needed |
| DICOM viewer placeholder | Required | Required | Required | Required | Required | Required | Not needed |
| Radiology reporting | Required | Required | Required | Required | Required | Required | Required |
| Modality worklists | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 8 does not need real export files, but UI should reserve production actions.

Required:

- Print sample collection list placeholder.
- Print barcode placeholder.
- Print lab report placeholder.
- Print critical alert list placeholder.
- Print radiology schedule placeholder.
- Print radiology report placeholder.
- Export lab order list placeholder.
- Export result list placeholder.
- Export radiology worklist placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Sensitive identifiers remain masked where required.
- Draft reports show draft watermark.
- Approved reports show approval/signature placeholder.
- Corrected/addendum reports show version label.
- Critical reports show critical finding/value label where appropriate.

## Diagnostic Metrics Placeholders

Recommended metrics:

- Lab orders today.
- Sample pending count.
- Sample rejection count.
- Result pending count.
- Approval pending count.
- Critical alert count.
- Critical escalation count.
- Average lab turnaround placeholder.
- Specimen quality issue count.
- Barcode reprint count.
- Analyzer sync failure count.
- Radiology orders today.
- Modality utilization placeholder.
- Reporting pending count.
- PACS sync failure count.
- Critical finding count.
- Radiology safety checklist pending count.

These metrics use static data in Phase 8 and later feed reports/analytics phases.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3/4/5/6/7 shared patterns are ready.
2. Add laboratory and radiology navigation entries.
3. Add Phase 8 static data files.
4. Build laboratory dashboard.
5. Build lab orders page.
6. Build test master page.
7. Build test package page.
8. Build sample collection and barcode preview.
9. Build sample processing board.
10. Build barcode management.
11. Build analyzer integration placeholder.
12. Build result entry page.
13. Build pathologist approval page.
14. Build critical alerts page.
15. Build lab department worklists.
16. Add sample chain-of-custody and specimen quality states.
17. Build radiology dashboard.
18. Build radiology orders page.
19. Build radiology scheduling page.
20. Add radiology safety checklist placeholders.
21. Build PACS integration placeholder.
22. Build DICOM viewer placeholder.
23. Build radiology reporting page.
24. Build modality worklists.
25. Add diagnostic report version/correction/addendum states.
26. Add EMR attachment/timeline handoff placeholders.
27. Add role visibility and access denied states.
28. Verify light, dark, system, dynamic preset, and custom color themes.
29. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
30. Polish validation, keyboard behavior, loading states, empty states, print-safe views, and diagnostic safety warnings.

## Production-Grade Acceptance Checklist

Phase 8 is complete when:

- Laboratory dashboard shows orders, samples, results, approvals, critical alerts, and analyzer placeholder state.
- Lab orders page supports patient/source/test/status filters and order detail drawer.
- Test master supports sample type, parameters, reference ranges, report settings, and billing placeholder.
- Test packages show included tests and sample requirement placeholders.
- Sample collection supports collection queue, barcode preview, reprint reason, rejection, and recollection states.
- Sample collection supports chain-of-custody and specimen quality issue placeholders.
- Sample processing supports department routing, analyzer/manual state, TAT delay, and rejection.
- Barcode management supports scan, preview, recent scans, reprint, and damaged placeholder.
- Analyzer page clearly communicates placeholder integration and failed import states.
- Result entry supports parameter values, units, reference ranges, abnormal/critical flags, draft, and submit states.
- Result entry supports correction/addendum/version context.
- Pathologist approval supports review, approve, reject, correction request, and critical alert trigger placeholders.
- Critical alerts support acknowledgement and EMR handoff.
- Critical alerts support escalation and contact placeholders.
- Lab department worklists support histopathology, microbiology, biochemistry, and hematology placeholders.
- Radiology dashboard shows orders, schedules, reporting queue, PACS state, and critical findings placeholder.
- Radiology orders show modality, schedule, PACS, and report states.
- Radiology scheduling supports modality calendar, preparation, consent, contrast, and emergency override placeholders.
- Radiology scheduling supports safety checklist states.
- PACS page clearly communicates study/image/sync placeholder states.
- DICOM viewer placeholder is realistic but cannot be mistaken for real DICOM rendering.
- Radiology reporting supports templates, findings, impression, approval, addendum, correction, and print preview.
- Radiology reporting supports version, superseded, and critical finding states.
- Modality worklists support ultrasound, CT, MRI, X-Ray, mammography, and PET-specific placeholders.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky patient/order headers and sticky actions do not cover content.
- Patient alerts from Phase 3 remain visible in diagnostic context.
- Clinical warning patterns from Phase 5 and EMR/timeline handoff from Phase 7 are reused where relevant.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, result tables, barcode input, report editor, schedule, and viewer placeholder controls.
- Static data is organized for future LIS, RIS, PACS, analyzer, barcode printer, EMR, billing, patient portal, HL7/FHIR, and analytics integrations.

## Handoff Notes For Phase 9

Phase 9 can begin after Phase 8 provides:

- Diagnostic order static data.
- Lab sample lifecycle pattern.
- Barcode preview/reprint pattern.
- Result entry and approval pattern.
- Critical alert pattern.
- Lab department worklist pattern.
- Radiology schedule and modality worklist pattern.
- PACS/DICOM placeholder pattern.
- Radiology report and approval pattern.
- Diagnostic EMR attachment/timeline handoff pattern.

Phase 9 should then focus on pharmacy, inventory, central store, department store, purchase, vendor, batch, expiry, stock audit, and operation theatre workflows.
