# Phase 7 Detailed Document: EMR / EHR And Clinical Record Continuity

## Phase Goal

Build the production-grade UI screens for electronic medical records, electronic health records, longitudinal medical history, progress notes, clinical attachments, digital signature placeholders, and a unified clinical timeline across OPD, IPD, emergency, diagnostics, pharmacy, and billing events.

This phase is UI-only and uses static data. It should feel ready for real clinical record review and continuity of care, but no backend EMR database, interoperability service, digital signature provider, document storage, FHIR/HL7 integration, or external patient exchange is required in this phase.

## Dependency On Previous Phases

Phase 7 must use the foundations from Phases 1 to 6.

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
- Patient status lifecycle display.

Required Phase 4 patterns:

- Appointment and visit context.
- Queue/teleconsultation placeholder state.
- Front-office handoff state.

Required Phase 5 patterns:

- OPD consultation summary.
- Clinical notes and SOAP.
- Diagnosis and prescription.
- Allergy and clinical warning patterns.
- Vitals trends.
- Clinical templates.
- Consultation print patterns.

Required Phase 6 patterns:

- Admission summary.
- IPD rounds.
- Nursing assessment.
- MAR.
- Intake-output chart.
- Transfer and discharge summary.
- Emergency registration, triage, casualty, trauma, ambulance, and emergency billing placeholders.

Important rule:

All Phase 7 screens must follow the Phase 1 theme and responsive system. Do not create separate EMR colors, timeline styles, document preview patterns, tables, drawers, tabs, or layouts outside the shared design system.

## Phase 7 Scope

Phase 7 covers:

- EMR page: encounter-wise medical records.
- EHR page: lifetime patient health summary.
- Medical history.
- Progress notes.
- Clinical attachments.
- Digital signature placeholder.
- Clinical timeline.
- Encounter summary.
- Longitudinal diagnosis, allergy, medication, procedure, vaccination, vitals, and chronic condition views.
- Record access and privacy indicators.
- Clinical document print/export placeholders.
- Record audit and access history placeholders.
- Record version history placeholders.
- Disclosure/sharing request placeholders.
- Retention/legal hold placeholders.

Phase 7 does not cover:

- Real EMR/EHR backend.
- Real FHIR/HL7 exchange.
- Real ABHA health data exchange.
- Real digital signature provider.
- Real document storage.
- Real cross-hospital data import.
- Real AI summarization.
- Real medico-legal locking.
- Real patient portal sharing.
- Real legal hold enforcement.
- Real disclosure package generation.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/emr` | EMR dashboard | Search and access encounter-wise records. |
| `/emr/patients/:patientId` | Patient EMR | Encounter-wise clinical record view. |
| `/ehr/patients/:patientId` | Patient EHR | Lifetime health summary and longitudinal data. |
| `/emr/patients/:patientId/history` | Medical history | Past illness, surgical, family, social, and medication history. |
| `/emr/patients/:patientId/progress-notes` | Progress notes | OPD/IPD/emergency progress notes. |
| `/emr/patients/:patientId/attachments` | Clinical attachments | Documents, reports, images, scanned notes, and preview. |
| `/emr/patients/:patientId/signatures` | Digital signature placeholder | Signature status, pending signatures, signed documents. |
| `/emr/patients/:patientId/timeline` | Clinical timeline | Chronological patient timeline. |
| `/emr/patients/:patientId/audit` | Record access audit | Sensitive record access and change history placeholder. |
| `/emr/patients/:patientId/versions` | Version history | Record version, addendum, superseded, and legal hold placeholder. |
| `/emr/patients/:patientId/disclosures` | Disclosure requests | Print/export/share request placeholders. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/emr` | EMR record pages | Main HMS app shell from Phase 1. |
| `(app)/ehr` | EHR longitudinal pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 7 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for EMR summaries, EHR summaries, timelines, attachments, and signature status.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Encounter type, timeline category, signature status, privacy sensitivity, and clinical alert states must use shared status tokens.
- Never hardcode page-level colors.
- Timeline and document preview must remain readable in every theme.
- Print views should use Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 7 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column record cards and full-screen drawers.
- Tablet screens can use two-column summaries and timeline/detail split views.
- Laptop and desktop screens can use patient summary, timeline/list, and detail drawer/panel.
- Wide desktop screens can show timeline, encounter detail, and longitudinal summary together.
- No page-level horizontal scroll.
- Dense record tables may scroll inside their own containers.
- Sticky patient headers and sticky actions must not cover timeline or document previews.

### Record Continuity Pattern

Required:

- Sticky patient header.
- Patient alerts and privacy indicators.
- Encounter context.
- Timeline/list filters.
- Detail drawer or split panel.
- Print/export placeholders.
- Access/audit indicator.
- Sensitive record warning.
- Cross-module record links.

Avoid:

- Long unstructured record pages.
- Hidden patient identity.
- Hidden privacy state.
- Multiple popup dependency.
- Deep nested clinical record menus.
- Full page reloads for record filters or timeline changes.

## Record And Timeline Status Standards

### Encounter Types

- OPD.
- IPD.
- Emergency.
- Teleconsultation placeholder.
- Lab placeholder.
- Radiology placeholder.
- Pharmacy placeholder.
- Billing placeholder.

### Record Statuses

- Draft.
- Completed.
- Signed placeholder.
- Addendum placeholder.
- Revised placeholder.
- Cancelled.
- Archived placeholder.
- Superseded placeholder.
- Legal hold placeholder.

### Attachment Statuses

- Uploaded.
- Verified.
- Pending verification.
- Rejected.
- Expired.
- Archived.

### Signature Statuses

- Not required.
- Pending.
- Signed placeholder.
- Rejected placeholder.
- Expired certificate placeholder.

### Privacy/Sensitivity Levels

- Normal.
- Sensitive.
- Restricted.
- Break-glass placeholder.
- Consent-gated placeholder.

Status rules:

- Status must use text, icon, and token color.
- Sensitive/restricted records must not rely on color only.
- Draft and completed records must be visually distinct.
- Signed placeholder documents must be visibly different from unsigned documents.
- Superseded record versions should remain readable but not treated as current.
- Legal hold records should block archive/download placeholders visually.

## Privacy, Access, And Safety Rules

Phase 7 centralizes patient records, so access and privacy rules must be visible.

Required:

- Patient identity remains visible: name, UHID, age/gender, alerts, status.
- Sensitive record access should show warning placeholder.
- Restricted record view should require reason placeholder.
- Break-glass access is placeholder only and requires confirmation UI.
- Record access should show future audit note.
- Print/export actions should show privacy warning placeholder.
- Internal-only notes should be hidden from patient-facing print/export by default.
- Deleted records are not implemented; archive is placeholder only.
- Addendum/revision must not overwrite original record in UI.
- Version history should show current, previous, addendum, and superseded placeholder states.
- Export/share actions should check consent status placeholder.
- Legal hold should block archive and destructive placeholder actions.
- Disclosure/sharing request should show recipient, purpose, requested records, and approval state.

High-impact actions:

- View restricted record.
- Break-glass access placeholder.
- Print EMR summary.
- Export EMR placeholder.
- Archive attachment placeholder.
- Reject attachment verification.
- Add addendum.
- Mark signature rejected placeholder.
- View previous version.
- Request disclosure/export package placeholder.
- Apply/remove legal hold placeholder.

## Record Versioning And Retention Rules

Phase 7 should prepare for clinical record version governance.

Version states:

- Current.
- Previous.
- Addendum.
- Superseded.
- Archived placeholder.

Required behavior:

- Current version is clearly marked.
- Previous versions are read-only.
- Addendum appears linked below the original record.
- Superseded versions show replacement/current version reference.
- Version comparison placeholder can show changed sections.
- Archive placeholder requires reason and permission.
- Legal hold placeholder blocks archive and deletion-like actions.
- Retention status is visible for documents where applicable.

## Disclosure And Sharing Placeholder Rules

Phase 7 should reserve UI for future record sharing without performing real sharing.

Disclosure fields:

- Request number.
- Patient.
- Requested by.
- Recipient.
- Purpose.
- Record scope.
- Consent status.
- Approval status.
- Requested date.

Disclosure statuses:

- Draft.
- Consent required.
- Approval pending.
- Approved placeholder.
- Rejected placeholder.
- Shared placeholder.

Rules:

- Export/share requires privacy acknowledgement.
- Consent-gated records require consent status before export/share placeholder.
- Restricted records require reason and permission.
- Disclosure package generation is not implemented in Phase 7.
- Every disclosure action should show future audit note.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All EMR/EHR screens. |
| Hospital Admin | Record overview, audit placeholders, limited clinical read placeholder. |
| Doctor | Full clinical record view for assigned/allowed patients, progress notes, signature placeholders. |
| Nurse | Nursing notes, vitals, MAR summary, progress note read/write placeholder. |
| Receptionist | Limited patient encounter summary and document status. |
| Billing Executive | Billing-related encounter summary placeholder only. |
| Lab Technician | Lab-related attachment/report placeholders only. |
| Radiologist | Radiology-related attachment/report placeholders only. |
| Pharmacist | Prescription and medication summary placeholder only. |
| Management | Read-only aggregate/summary view placeholder. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view allowed records but cannot edit notes or verification states.
- Restricted records show reason-required access placeholder.
- Disabled actions should explain required permission.

## Page 1: EMR Dashboard

### Purpose

Provide a record access entry point for encounter-wise medical records.

### Route

`/emr`

### Page Header

Title: `EMR`

Primary action:

- Search patient record.

Secondary actions:

- Recent records.
- Restricted access requests placeholder.
- Print list placeholder.

### Summary Cards

- Records viewed today.
- Recent OPD records.
- Recent IPD records.
- Emergency records.
- Pending signatures.
- Pending attachment verification.

### Search Filters

- Patient name.
- UHID.
- Encounter number.
- Date range.
- Department.
- Doctor.
- Encounter type.
- Record status.

### Table Columns

- Patient.
- UHID.
- Encounter.
- Encounter type.
- Department.
- Doctor.
- Date.
- Status.
- Signature status.
- Actions.

### Row Actions

- Open EMR.
- Open timeline.
- Print summary placeholder.
- View access audit placeholder.

### Acceptance

- EMR search is fast and scannable.
- Recent and pending record states are visible.
- Restricted access states are visible without exposing sensitive content.

## Page 2: Patient EMR

### Purpose

Show encounter-wise records for a patient.

### Route

`/emr/patients/:patientId`

### Sticky Patient Header

Required:

- Patient name.
- UHID.
- Age/gender.
- Patient status.
- Allergies.
- Critical alerts.
- Privacy/sensitivity indicator.
- Last encounter.

### Tabs

- Encounters.
- OPD.
- IPD.
- Emergency.
- Prescriptions.
- Vitals.
- Diagnosis.
- Procedures.
- Documents.
- Notes.
- Audit.

### Encounter Card Content

- Encounter number.
- Date/time.
- Encounter type.
- Department.
- Provider.
- Diagnosis summary.
- Prescription summary.
- Documents count.
- Signature status.
- Record status.

### Encounter Detail Drawer

Sections:

- Encounter summary.
- Clinical notes.
- Diagnosis.
- Prescription.
- Vitals.
- Procedures.
- Attachments.
- Signature status.
- Related events.

### Actions

- Print encounter summary.
- Add addendum placeholder.
- Open timeline.
- View access audit.
- View version history.

### Acceptance

- Encounter records are easy to compare.
- Patient identity and alerts remain visible.
- Detail drawer avoids navigating away unnecessarily.
- Draft/completed/signed states are clear.
- Version/addendum state is visible where relevant.

## Page 3: Patient EHR

### Purpose

Show lifetime health summary across all encounters and departments.

### Route

`/ehr/patients/:patientId`

### Summary Sections

- Patient profile summary.
- Active allergies.
- Chronic conditions.
- Major diagnoses.
- Current medications placeholder.
- Past medications placeholder.
- Procedures/surgeries.
- Vaccinations.
- Recent vitals trends.
- Recent lab/radiology placeholders.
- IPD/emergency history.
- Consent and ABHA status placeholders.

### Longitudinal Panels

- Diagnosis timeline.
- Medication timeline.
- Vitals trends.
- Procedure history.
- Vaccination history.
- Admission/emergency history.

### Actions

- Print EHR summary.
- Export placeholder.
- Open clinical timeline.
- Open patient profile.
- Request disclosure package placeholder.

### Acceptance

- EHR summary gives quick lifetime context.
- Active allergies/chronic conditions are hard to miss.
- Longitudinal views remain compact and readable.
- Export/share is consent and privacy-gated as placeholder.

## Page 4: Medical History

### Purpose

Manage and review structured medical history.

### Route

`/emr/patients/:patientId/history`

### History Sections

- Past medical history.
- Surgical history.
- Family history.
- Social history.
- Medication history.
- Allergy history.
- Immunization history.
- Obstetric/gynecologic placeholder where applicable.

### Fields

- Condition/event.
- Date/onset.
- Status.
- Severity.
- Notes.
- Source encounter.
- Verified status.

### Actions

- Add history item.
- Edit item.
- Mark verified placeholder.
- Archive placeholder.
- Copy from encounter placeholder.

### Safety Rules

- Archive requires reason placeholder.
- Verification status is visible.
- Source encounter remains linked.
- Sensitive social history can use restricted access placeholder.

### Acceptance

- History is structured and scannable.
- Verified vs unverified states are clear.
- Sensitive history access is represented.

## Page 5: Progress Notes

### Purpose

Show and manage progress notes across OPD, IPD, emergency, and follow-up contexts.

### Route

`/emr/patients/:patientId/progress-notes`

### Note Types

- OPD note.
- IPD progress note.
- Emergency note.
- Nursing note.
- Doctor round note.
- Addendum.
- Referral note placeholder.

### Table Columns

- Date/time.
- Note type.
- Author.
- Department.
- Encounter.
- Status.
- Signature status.
- Actions.

### Note Drawer

Sections:

- Note summary.
- Full note.
- Author details.
- Linked encounter.
- Addendum history.
- Version history.
- Signature status.
- Access audit placeholder.

### Actions

- Add progress note.
- Add addendum.
- Print note.
- Mark for signature placeholder.

### Safety Rules

- Completed notes open read-only.
- Addendum does not overwrite original note.
- Internal-only notes are marked clearly.
- Printing internal-only note requires warning placeholder.
- Previous versions are read-only.
- Addendum and revision states show reason placeholder.

### Acceptance

- Notes are chronological and filterable.
- Addendum and signature states are clear.
- Internal-only note handling is visible.
- Version history is visible from note detail.

## Page 6: Clinical Attachments

### Purpose

Provide a unified attachment view for documents, images, scanned notes, reports, discharge summaries, consent forms, and clinical files.

### Route

`/emr/patients/:patientId/attachments`

### Attachment Categories

- Identity/document from Phase 3.
- Consent.
- OPD attachment.
- IPD attachment.
- Emergency attachment.
- Lab report placeholder.
- Radiology report placeholder.
- Prescription.
- Discharge summary.
- External document placeholder.

### Table/Grid Fields

- Attachment name.
- Category.
- Source encounter.
- Uploaded by.
- Uploaded date.
- Verification status.
- Signature status.
- Sensitivity.
- Actions.

### Preview Drawer

Sections:

- Preview placeholder.
- Metadata.
- Linked encounter.
- Verification status.
- Signature status.
- Sensitivity.
- Audit history placeholder.

### Actions

- Preview.
- Verify placeholder.
- Reject placeholder.
- Archive placeholder.
- Print.
- Download placeholder.
- Request disclosure placeholder.

### Safety Rules

- Unsupported preview state must be clear.
- Sensitive attachment preview requires reason placeholder.
- Reject/archive requires reason placeholder.
- Download/export shows privacy warning placeholder.
- Legal hold blocks archive/download placeholders visually.
- Retention status is visible where applicable.

### Acceptance

- Attachments are easy to filter and preview.
- Verification, signature, and sensitivity states are visible.
- Preview drawer is responsive.
- Retention/legal hold and disclosure states are represented.

## Page 7: Digital Signature Placeholder

### Purpose

Prepare UI for future digital signature workflows.

### Route

`/emr/patients/:patientId/signatures`

### Signature Worklists

- Pending signature.
- Signed placeholder.
- Rejected placeholder.
- Expired certificate placeholder.
- Signature not required.

### Table Columns

- Document.
- Encounter.
- Requested by.
- Signer.
- Requested date.
- Signature status.
- Certificate status placeholder.
- Actions.

### Actions

- Request signature placeholder.
- Sign placeholder.
- Reject signature placeholder.
- View signed document placeholder.
- Print signature status.

### Safety Rules

- Signing does not perform real digital signature in Phase 7.
- Reject signature requires reason placeholder.
- Signed placeholder document becomes read-only.
- Certificate expired state blocks sign action visually.
- Signature audit placeholder is visible.

### Acceptance

- Signature states are clear.
- Pending signature worklist is useful.
- UI does not claim real signing integration.

## Page 8: Clinical Timeline

### Purpose

Show a chronological timeline of patient clinical and operational events.

### Route

`/emr/patients/:patientId/timeline`

### Timeline Event Types

- Registration.
- Appointment.
- OPD visit.
- Prescription.
- Vitals.
- Diagnosis.
- Procedure.
- Vaccination.
- Admission.
- Transfer.
- Nursing note.
- MAR.
- Intake-output.
- Doctor round.
- Emergency registration.
- Triage.
- Casualty/trauma.
- Ambulance.
- Discharge.
- Lab placeholder.
- Radiology placeholder.
- Pharmacy placeholder.
- Billing placeholder.
- Consent.
- Document upload.
- Signature placeholder.

### Timeline Filters

- Date range.
- Event type.
- Department.
- Provider.
- Encounter.
- Clinical only.
- Operational only.
- Sensitive events.

### Timeline Item Content

- Date/time.
- Event type.
- Title.
- Summary.
- Department/provider.
- Status.
- Linked encounter.
- Actions.

### Detail Drawer

Sections:

- Event summary.
- Linked encounter.
- Clinical details placeholder.
- Related documents.
- Audit/access note.
- Version/disclosure context where applicable.

### Responsive Behavior

Phone:

- Timeline becomes compact vertical cards.
- Filters open in full-screen sheet.
- Detail drawer becomes full-screen.

Desktop:

- Timeline, filters, and detail panel can be visible together.

### Acceptance

- Timeline is chronological and easy to scan.
- Filters work with static data.
- Event details preserve patient context.
- Sensitive events are marked.
- Version, addendum, disclosure, and legal hold events are represented.

## Page 9: Record Access Audit

### Purpose

Show who accessed or changed sensitive clinical records.

### Route

`/emr/patients/:patientId/audit`

### Summary Cards

- Access events today.
- Restricted access events.
- Print/export events.
- Addendum/revision events.
- Signature events.
- Disclosure events.
- Legal hold events.

### Filters

- Date range.
- User.
- Role.
- Event type.
- Record type.
- Sensitivity.
- IP/device placeholder.

### Table Columns

- Time.
- User.
- Role.
- Action.
- Record.
- Reason.
- Sensitivity.
- IP/device.
- Actions.
- Outcome.

### Detail Drawer

Sections:

- Access summary.
- User details.
- Record details.
- Reason.
- Before/after placeholder.
- Related event.

### Safety Rules

- Audit records are read-only.
- Sensitive values are masked where needed.
- Break-glass placeholder access is visually distinct.
- Export audit placeholder requires permission.
- Audit rows cannot be edited, archived, or deleted.
- Audit detail can show before/after placeholder with sensitive values masked.
- Disclosure, legal hold, version access, and print/export events are included.

### Acceptance

- Access audit is scannable.
- Restricted/break-glass states are visible.
- Audit data is immutable in UI.
- Disclosure and version governance events are visible.

## Page 10: Version History

### Purpose

Show record version history, addendums, superseded versions, and legal hold placeholders.

### Route

`/emr/patients/:patientId/versions`

### Filters

- Record type.
- Encounter.
- Date range.
- Author.
- Version state.
- Legal hold.

### Table Columns

- Record.
- Record type.
- Encounter.
- Version.
- State.
- Author.
- Updated date.
- Reason.
- Legal hold.
- Actions.

### Actions

- View version.
- Compare placeholder.
- Open current version.
- Add addendum placeholder.
- Apply legal hold placeholder.

### Safety Rules

- Previous versions are read-only.
- Compare is placeholder only.
- Legal hold action requires reason placeholder.
- Superseded version links to current version.

### Acceptance

- Version lineage is clear.
- Addendum and superseded states are easy to understand.
- Legal hold placeholder blocks archive actions visually.

## Page 11: Disclosure Requests

### Purpose

Prepare UI for future print/export/share request governance.

### Route

`/emr/patients/:patientId/disclosures`

### Summary Cards

- Draft requests.
- Consent required.
- Approval pending.
- Approved placeholder.
- Rejected placeholder.

### Table Columns

- Request number.
- Recipient.
- Purpose.
- Record scope.
- Consent status.
- Approval status.
- Requested by.
- Requested date.
- Actions.

### Actions

- Create request.
- Add records placeholder.
- Mark consent received placeholder.
- Request approval placeholder.
- Reject request placeholder.
- Generate package placeholder.

### Safety Rules

- Consent-gated records block package generation visually.
- Restricted records require reason and permission.
- Generate package does not create real export in Phase 7.
- Rejected requests require reason placeholder.

### Acceptance

- Disclosure workflow is clearly placeholder.
- Consent and approval states are visible.
- Package generation is not mistaken for real export.

## Static Data Requirements

Phase 7 should add or expand static data files.

Recommended data:

- `mockEmrEncounters`.
- `mockEhrSummary`.
- `mockMedicalHistory`.
- `mockProgressNotes`.
- `mockClinicalAttachments`.
- `mockDigitalSignatures`.
- `mockClinicalTimeline`.
- `mockRecordAccessAudit`.
- `mockRecordPrivacyRules`.
- `mockAddendums`.
- `mockLongitudinalDiagnoses`.
- `mockLongitudinalMedications`.
- `mockLongitudinalVitals`.
- `mockLongitudinalProcedures`.
- `mockRecordVersions`.
- `mockDisclosureRequests`.
- `mockLegalHolds`.
- `mockRetentionPolicies`.

Encounter fields:

- `id`.
- `patientId`.
- `encounterNo`.
- `encounterType`.
- `departmentId`.
- `providerId`.
- `startedAt`.
- `completedAt`.
- `status`.
- `signatureStatus`.
- `sensitivity`.
- `versionState`.
- `legalHold`.
- `summary`.

Timeline event fields:

- `id`.
- `patientId`.
- `encounterId`.
- `eventType`.
- `title`.
- `summary`.
- `occurredAt`.
- `departmentId`.
- `providerId`.
- `status`.
- `sensitivity`.
- `versionContext`.

Attachment fields:

- `id`.
- `patientId`.
- `encounterId`.
- `name`.
- `category`.
- `uploadedBy`.
- `uploadedAt`.
- `verificationStatus`.
- `signatureStatus`.
- `sensitivity`.
- `previewAvailable`.
- `retentionStatus`.
- `legalHold`.

Signature fields:

- `id`.
- `documentId`.
- `patientId`.
- `encounterId`.
- `requestedBy`.
- `signerId`.
- `requestedAt`.
- `status`.
- `certificateStatus`.
- `reason`.

Audit fields:

- `id`.
- `patientId`.
- `recordId`.
- `recordType`.
- `userId`.
- `role`.
- `action`.
- `reason`.
- `sensitivity`.
- `ipAddress`.
- `device`.
- `timestamp`.
- `outcome`.

Record version fields:

- `id`.
- `patientId`.
- `recordId`.
- `recordType`.
- `version`.
- `state`.
- `authorId`.
- `updatedAt`.
- `reason`.
- `currentVersionId`.
- `legalHold`.

Disclosure request fields:

- `id`.
- `requestNo`.
- `patientId`.
- `recipient`.
- `purpose`.
- `recordScope`.
- `consentStatus`.
- `approvalStatus`.
- `requestedBy`.
- `requestedAt`.
- `reason`.

Legal hold fields:

- `id`.
- `patientId`.
- `recordId`.
- `recordType`.
- `reason`.
- `appliedBy`.
- `appliedAt`.
- `status`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Patient required.
- Encounter required for encounter-linked notes.
- Addendum reason required.
- Restricted record access reason required.
- Break-glass reason required.
- Attachment reject/archive reason required.
- Signature rejection reason required.
- Print/export privacy acknowledgement required.
- Legal hold reason required.
- Disclosure request recipient and purpose required.
- Disclosure rejection reason required.
- Consent acknowledgement required for consent-gated disclosure placeholder.
- Date range validation.

Validation UI:

- Inline field error.
- Privacy warning panel.
- Restricted access confirmation.
- Disabled action where reason is missing.
- Confirmation for print/export/archive/restricted access.
- Legal hold warning panel.
- Disclosure consent warning panel.

## Accessibility Requirements

Required:

- Timeline events are keyboard reachable.
- Record filters are keyboard accessible.
- Attachment preview has readable fallback text.
- Sensitive/restricted states are not color-only.
- Drawers trap focus and return focus after close.
- Tables have clear column headers.
- Print/export warnings are screen-reader readable.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, filters, tabs, drawers, timeline, attachment preview, and audit tables work without mouse.

## Performance Requirements

Even with static data:

- Timeline should render efficiently.
- Do not load all detail drawers by default.
- Lazy render large attachment previews.
- Keep patient header stable to avoid layout shift.
- Use skeletons for loading-looking states.
- Avoid heavy timeline libraries unless already accepted by the project.
- Dense longitudinal views should use tabs and internal scroll areas.

## Page State Requirements

Each Phase 7 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Restricted record state.
- Break-glass confirmation state.
- Print/export privacy warning state.
- Unsupported attachment preview state.
- Pending signature state.
- Signed read-only state.
- Addendum state.
- Archived attachment placeholder state.
- Legal hold state.
- Version compare placeholder state.
- Disclosure consent required state.
- Disclosure approval pending state.
- Access denied state.
- Read-only state.

## Phase 7 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EMR dashboard | Required | Required | Required | Required | Required | Required | Required |
| Patient EMR | Required | Required | Required | Required | Required | Required | Required |
| Patient EHR | Required | Required | Required | Required | Required | Required | Required |
| Medical history | Required | Required | Required | Required | Required | Required | Required |
| Progress notes | Required | Required | Required | Required | Required | Required | Required |
| Clinical attachments | Required | Required | Required | Required | Required | Required | Required |
| Digital signatures | Required | Required | Required | Required | Required | Required | Required |
| Clinical timeline | Required | Required | Required | Required | Required | Required | Required |
| Record access audit | Required | Required | Required | Required | Required | Required | Required |
| Version history | Required | Required | Required | Required | Required | Required | Required |
| Disclosure requests | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 7 does not need real export files, but UI should reserve production actions.

Required:

- Print EMR summary placeholder.
- Print EHR summary placeholder.
- Print encounter summary placeholder.
- Print timeline placeholder.
- Print medical history placeholder.
- Print progress note placeholder.
- Print attachment metadata placeholder.
- Export EMR placeholder.
- Export audit placeholder.
- Disclosure package placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Sensitive identifiers remain masked where required.
- Internal-only notes are hidden by default.
- Print/export requires privacy acknowledgement placeholder.
- Consent-gated exports require consent state placeholder.
- Legal hold records are blocked from archive/export package placeholders.

## Clinical Continuity Metrics Placeholders

Recommended metrics:

- EMR records viewed today.
- EHR summaries printed.
- Pending signatures.
- Pending attachment verification.
- Restricted access attempts.
- Break-glass placeholder events.
- Addendums added.
- Version history views.
- Legal hold placeholders.
- Disclosure requests by status.
- Timeline events by type.
- Clinical attachments by category.
- Longitudinal active diagnoses.
- Active medication count.

These metrics use static data in Phase 7 and later feed reports/analytics phases.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3/4/5/6 shared patterns are ready.
2. Add EMR/EHR navigation entries.
3. Add Phase 7 static data files.
4. Build EMR dashboard.
5. Build patient EMR page.
6. Build patient EHR page.
7. Build medical history page.
8. Build progress notes page.
9. Build clinical attachments page and preview drawer.
10. Build digital signature placeholder page.
11. Build clinical timeline page.
12. Build record access audit page.
13. Build version history page.
14. Build disclosure request placeholder page.
15. Add privacy/restricted access states.
16. Add legal hold and retention placeholders.
17. Add print/export privacy acknowledgement placeholders.
18. Add role visibility and access denied states.
19. Verify light, dark, system, dynamic preset, and custom color themes.
20. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
21. Polish validation, keyboard behavior, loading states, empty states, print-safe views, and privacy warnings.

## Production-Grade Acceptance Checklist

Phase 7 is complete when:

- EMR dashboard supports patient/encounter search with static data.
- Patient EMR shows encounter-wise records with tabs and detail drawer.
- Patient EHR shows lifetime health summary and longitudinal panels.
- Medical history supports structured history sections and verified/unverified states.
- Progress notes support OPD, IPD, emergency, nursing, round, addendum, and referral placeholders.
- Clinical attachments support categories, preview, verification, signature, sensitivity, and archive placeholders.
- Digital signature page supports pending, signed, rejected, expired certificate, and not-required states.
- Clinical timeline shows chronological cross-module events.
- Record access audit supports restricted/break-glass, print/export, addendum, and signature events.
- Version history supports current, previous, addendum, superseded, archived placeholder, and legal hold states.
- Disclosure requests support consent, approval, recipient, purpose, and package-generation placeholders.
- Retention/legal hold states are represented.
- Privacy, restricted access, and print/export warning states are represented.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky patient headers and sticky actions do not cover content.
- Patient alerts from Phase 3 remain visible in EMR/EHR context.
- Clinical warning patterns from Phase 5 and inpatient/emergency context from Phase 6 are reused where relevant.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, timeline, attachments, and audit tables.
- Static data is organized for future EMR backend, document storage, digital signature, FHIR/HL7, ABHA, analytics, and patient portal integrations.

## Handoff Notes For Phase 8

Phase 8 can begin after Phase 7 provides:

- EMR encounter static data.
- EHR summary static data.
- Clinical timeline pattern.
- Clinical attachment preview pattern.
- Digital signature placeholder pattern.
- Progress note/addendum pattern.
- Medical history pattern.
- Record access audit pattern.
- Privacy/restricted access pattern.

Phase 8 should then focus on laboratory and radiology workflows: laboratory management, test master, test packages, sample collection, sample processing, barcode management, analyzer integration placeholders, result entry, pathologist approval, critical alerts, lab departments, radiology scheduling, PACS integration placeholder, DICOM viewer placeholder, radiology reporting, and modality worklists.
