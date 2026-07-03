# Phase 3 Detailed Document: Patient Management, Registration, And Documents

## Phase Goal

Build the production-grade UI screens for patient registration, patient search, patient profile, visit history, family management, patient documents, consent management, patient portal preview, and ABHA / Health ID integration placeholders.

This phase is UI-only and uses static data. The screens should feel ready for real hospital front-office and clinical usage, but no backend, database, file storage, ABHA API, or document upload integration is required in this phase.

## Dependency On Previous Phases

Phase 3 must use the foundations from Phase 1 and Phase 2.

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
- Admin drawer and settings patterns.
- Audit log style for sensitive patient actions.
- Confirmation pattern for high-risk actions.
- User, role, department, and hospital static data.

Important rule:

All Phase 3 screens must follow the Phase 1 theme and responsive system. Do not introduce separate colors, buttons, tables, forms, drawers, tabs, or layout patterns for patient management.

## Phase 3 Scope

Phase 3 covers:

- Patient registration.
- Quick registration.
- Detailed registration.
- Patient search and patient list.
- Patient profile.
- Patient visit history.
- Family management.
- Patient documents.
- Consent management.
- Patient portal preview.
- ABHA / Health ID integration placeholder.
- Patient alerts and risk flags.
- Duplicate patient detection UI placeholder.
- Patient merge request UI placeholder.
- Emergency/unknown patient registration placeholder.
- Minor/guardian patient handling.
- Patient status lifecycle display.

Phase 3 does not cover:

- Real patient database.
- Real document upload storage.
- Real ABHA API integration.
- Real OTP verification.
- Real patient portal authentication.
- OPD consultation workflow.
- Appointment booking workflow.
- Billing workflow.
- Clinical EMR detail workflow.
- Actual destructive patient merge.
- Actual biometric capture.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/patients` | Patient list/search | Search, filter, and open patient records. |
| `/patients/register` | Patient registration | Quick and detailed patient registration. |
| `/patients/:patientId` | Patient profile | Patient summary with tabs. |
| `/patients/:patientId/visits` | Visit history | OPD, IPD, emergency, diagnostics, pharmacy, and billing visit timeline. |
| `/patients/:patientId/family` | Family management | Manage family members and relationships. |
| `/patients/:patientId/documents` | Patient documents | Document list, preview, verification state. |
| `/patients/:patientId/consents` | Consent management | Consent forms and signed status. |
| `/patients/:patientId/portal` | Patient portal preview | Patient-facing summary preview. |
| `/patients/abha` | ABHA / Health ID | Health ID linking and verification placeholder. |
| `/patients/duplicates` | Duplicate patients | Duplicate detection and merge request placeholder. |
| `/patients/emergency-register` | Emergency registration placeholder | Fast unknown/emergency patient identity capture placeholder. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/patients` | Patient module pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 3 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for printable patient documents.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Patient risk, allergy, emergency, consent, document verification, and duplicate states must use Phase 1 status tokens.
- Never hardcode page-level colors.
- Patient profile, document preview, consent forms, and portal preview must work in every theme.
- Print views should always use the Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 3 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column forms and full-screen patient drawers.
- Tablet screens can use two-column forms and compact split views.
- Laptop and desktop screens can use table plus right-side patient summary drawer.
- Wide desktop screens can use productive split panels, such as patient list plus profile preview.
- No page-level horizontal scroll.
- Dense patient and visit tables may scroll inside their own container.
- Sticky headers and sticky actions must not cover patient forms or document previews.

### Patient Module Page Pattern

Most Phase 3 pages should follow this structure:

- Sticky page header with patient/module context.
- Patient summary strip where patient context exists.
- Search/filter area.
- Tab-based content for complex records.
- Main table, timeline, form, or document grid.
- Right-side detail drawer for quick view/edit.
- Sticky action area for save, print, verify, link, or submit.

Common states:

- Loading skeleton.
- Empty state.
- No search results.
- Validation errors.
- Duplicate warning.
- Unsaved changes warning.
- Save success toast.
- Save failed placeholder.
- Read-only state.
- Access denied state.
- Patient not found state.
- Emergency/unknown patient state.
- Deceased/inactive patient state.
- Minor patient guardian-required state.

## Patient Safety And Privacy Rules

Patient information is sensitive. Phase 3 must present privacy and safety behavior even with static data.

Required:

- Show UHID clearly on patient-specific pages.
- Highlight critical patient alerts such as allergy, VIP, infection risk, emergency, medico-legal placeholder, or outstanding balance placeholder.
- Mask sensitive identifiers where full display is not needed.
- Use confirmation pattern before archive, deactivate, merge, delete-placeholder, or sensitive consent actions.
- Patient document previews should not expose secrets or real personal documents.
- Patient portal preview should use static demo data only.
- Print views must hide navigation and internal admin controls.
- Future audit logging should be indicated for patient profile edits, document verification, consent changes, and merge requests.
- Patient status must be visible when a patient is active, inactive, deceased, merged placeholder, or unknown/emergency.
- Minor patients must clearly show guardian/consent requirement.
- Deceased patients should be read-only except for authorized administrative updates.
- Unknown emergency patients should be visually distinct and require later identity completion.
- Mobile, email, ID numbers, insurance policy numbers, and ABHA values should support masked display patterns.

Avoid:

- Long vertical patient forms without tabs or grouped sections.
- Multiple popup dependency.
- Deep nested patient menus.
- Full page reloads for tab changes.
- Showing clinical record details beyond Phase 3 scope.

### Patient Status Lifecycle

Phase 3 should display patient lifecycle states without implementing backend workflows.

Statuses:

- Active.
- Inactive.
- Unknown emergency.
- Deceased.
- Merged placeholder.
- Duplicate review.
- Archived placeholder.

Rules:

- Active patients allow normal permitted actions.
- Unknown emergency patients show incomplete identity warning.
- Deceased patients show a clear read-only banner.
- Merged placeholder records show where the active record is located.
- Duplicate review records show possible match warnings.
- Archive/delete actions are placeholders only and require confirmation UI.

### Patient Identity Safety Rules

Patient identity screens must reduce duplicate and wrong-patient risk.

Required identity anchors:

- UHID.
- Full name.
- Age/date of birth.
- Gender.
- Mobile.
- Photo/avatar placeholder.
- Alert flags.

Required UI behavior:

- Keep patient summary visible on patient-specific pages.
- Show warning when editing name, date of birth, gender, mobile, or ID number.
- Show duplicate check result before saving registration.
- Show `Last updated by` and `Last updated at` placeholders on sensitive demographic edits.
- Use confirmation before changing patient status to inactive, deceased, merged placeholder, or archived placeholder.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All patient screens. |
| Hospital Admin | Patient screens and management actions. |
| Receptionist | Register patient, edit demographics, view visits, manage documents, collect consent placeholder. |
| Doctor | View patient profile, visit history, documents, consent status, alerts. |
| Nurse | View patient profile, alerts, documents, visit history. |
| Billing Executive | View patient profile summary and billing-related demographics placeholder. |
| Lab Technician | View patient identity, documents relevant to lab placeholder. |
| Management | Read-only patient analytics/profile preview placeholder. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view records but cannot save changes.
- Disabled actions should explain required permission.

## Page 1: Patient List And Search

### Purpose

Provide a fast patient search and patient list page for reception, doctors, nurses, and billing staff.

### Route

`/patients`

### Page Header

Title: `Patients`

Primary action:

- Register patient.

Secondary actions:

- Advanced search.
- Duplicate patients.
- Export placeholder.
- Print list placeholder.

### Summary Cards

- Total patients.
- Registered today.
- OPD visits today.
- Active IPD patients.
- Pending document verification.
- Duplicate alerts.

### Search Modes

- Basic search.
- Advanced search.
- Recent patients.
- High-priority alerts.

Basic search fields:

- Name.
- UHID.
- Mobile number.
- ABHA / Health ID placeholder.
- Emergency/temporary ID placeholder.

Advanced search fields:

- Age range.
- Gender.
- Department.
- Last visit date.
- Registration date.
- City.
- Blood group.
- Patient status.
- Alert flag.
- Registration type: regular, emergency, unknown.

### Table Columns

- Patient.
- UHID.
- Age/gender.
- Mobile.
- Last visit.
- Department.
- Alerts.
- Document status.
- Status.
- Actions.

### Row Actions

- Open profile.
- Quick view.
- Edit demographics.
- Print patient card placeholder.
- Create appointment placeholder.

### Patient Quick View Drawer

Sections:

- Patient summary.
- Alerts.
- Contact details.
- Last visit.
- Recent documents.
- Quick actions.

### Responsive Behavior

Phone:

- Search stays prominent.
- Patient rows become compact cards.
- Filters open in full-screen filter sheet.
- Quick view drawer becomes full-screen sheet.

Tablet:

- Patient list can stay table format with compact columns.
- Filters can use drawer or inline area.

Desktop:

- Table plus optional right-side quick view.
- Sticky table header.

### Acceptance

- Patient search is fast to use with static data.
- Patient alerts are visible without opening the profile.
- No page-level horizontal scroll.
- Quick view works across devices.
- Unknown/emergency, deceased, inactive, and duplicate-review states are clearly visible.

## Page 2: Patient Registration

### Purpose

Create a low-click registration flow for new patients while supporting detailed demographic capture.

### Route

`/patients/register`

### Layout

Use tab-based registration with sticky action buttons.

Modes:

- Quick registration.
- Detailed registration.

Sticky actions:

- Save patient.
- Save and create visit placeholder.
- Save and book appointment placeholder.
- Cancel.

### Quick Registration Fields

- First name.
- Last name.
- Age or date of birth.
- Gender.
- Mobile number.
- Department placeholder.
- Visit type placeholder.
- Emergency/unknown patient toggle.

### Detailed Registration Tabs

- Basic details.
- Contact details.
- Identity details.
- Guardian / emergency contact.
- Insurance placeholder.
- ABHA / Health ID.
- Preferences.
- Risk & alerts.
- Review.

### Basic Details Fields

- UHID generated placeholder.
- First name.
- Middle name.
- Last name.
- Date of birth.
- Age.
- Gender.
- Blood group.
- Marital status.
- Occupation.
- Nationality.
- Patient category.

### Contact Details Fields

- Mobile.
- Alternate mobile.
- Email.
- Address line 1.
- Address line 2.
- City.
- State.
- Country.
- PIN code.

### Identity Details Fields

- ID type.
- ID number masked.
- ID document upload placeholder.
- Verification status.

### Guardian / Emergency Contact Fields

- Guardian name.
- Relationship.
- Guardian mobile.
- Emergency contact name.
- Emergency contact mobile.
- Emergency relationship.
- Minor patient guardian required indicator.

### Risk & Alerts Fields

- Allergy alert placeholder.
- Infection risk placeholder.
- VIP flag placeholder.
- Communication caution placeholder.
- Medico-legal case placeholder.
- Unknown identity reason placeholder.
- Notes visible to front office placeholder.

### Insurance Placeholder Fields

- Insurance available.
- Insurance provider.
- Policy number masked.
- TPA placeholder.
- Validity date.

### ABHA / Health ID Fields

- ABHA number placeholder.
- ABHA address placeholder.
- Link status.
- Verify action placeholder.
- Consent for ABHA linking checkbox.

### Preferences Fields

- Preferred language.
- Communication preference.
- SMS allowed.
- Email allowed.
- WhatsApp allowed.
- Portal access placeholder.

### Duplicate Detection UI

Show duplicate warning when static data matches:

- Same mobile.
- Same name and date of birth.
- Same ID number.
- Same ABHA placeholder.
- Same emergency temporary ID placeholder.

Duplicate warning actions:

- View possible matches.
- Continue as new.
- Open existing patient.
- Create merge request placeholder.

### Validation Rules

- First name required.
- Gender required.
- Age or date of birth required.
- Mobile format placeholder.
- Email format.
- PIN code format placeholder.
- ABHA format placeholder.
- Required consent checkbox for ABHA link action.

### Responsive Behavior

Phone:

- Single-column form.
- Tabs become scrollable.
- Sticky bottom save action.
- Duplicate warning appears above sticky action.

Tablet:

- Two-column sections where possible.
- Drawers become large sheets.

Desktop:

- Two or three-column form sections.
- Review tab can show full registration summary.

### Acceptance

- Quick registration can be completed with minimal fields.
- Detailed registration is organized and low-scroll.
- Duplicate detection UI is clear.
- Emergency/unknown registration path is available as a placeholder.
- Minor/guardian required state is clear.
- Sticky actions are always reachable.
- Theme and validation states work in all modes.

## Page 3: Patient Profile

### Purpose

Provide the central patient record view used by reception, doctors, nurses, billing, and diagnostics staff.

### Route

`/patients/:patientId`

### Patient Header

Required:

- Patient name.
- UHID.
- Age/gender.
- Mobile.
- Patient photo/avatar placeholder.
- Alerts.
- Status.
- Last visit.
- ABHA link status.
- Identity completeness.
- Guardian requirement when minor.
- Deceased/inactive/merged banner when applicable.

Primary actions:

- Edit profile.
- Print patient card.
- New visit placeholder.

Secondary actions:

- Add alert.
- Add document.
- Add consent.
- More actions.

### Profile Tabs

- Overview.
- Demographics.
- Contacts.
- Alerts.
- Documents.
- Consents.
- Visit summary.
- Audit.

### Overview Tab

Sections:

- Patient summary.
- Contact summary.
- Current alerts.
- Last visit summary.
- Upcoming appointment placeholder.
- Pending tasks.
- Document status.
- Consent status.

### Demographics Tab

Fields:

- Name.
- Date of birth.
- Age.
- Gender.
- Blood group.
- Marital status.
- Occupation.
- Nationality.
- Category.

### Contacts Tab

Fields:

- Mobile.
- Alternate mobile.
- Email.
- Address.
- Guardian.
- Emergency contact.

### Alerts Tab

Alert types:

- Allergy.
- High risk.
- Infection control.
- VIP.
- Medico-legal placeholder.
- Billing caution placeholder.
- Communication preference.
- Unknown identity.
- Deceased/inactive status.

Alert fields:

- Type.
- Severity.
- Message.
- Active status.
- Created by.
- Created date.
- Requires acknowledgement.

### Audit Tab

Show static activity:

- Profile created.
- Demographics updated.
- Document uploaded.
- Consent signed.
- ABHA link attempted.
- Sensitive identity field edited.
- Patient status changed.

### Responsive Behavior

Phone:

- Patient header collapses into compact summary.
- Tabs are horizontally scrollable.
- Actions move into sticky bottom bar or more menu.

Tablet/Desktop:

- Patient header stays sticky.
- Summary cards and tabs use grid layout.

### Acceptance

- Patient identity is always clear.
- Alerts are hard to miss.
- Profile does not become one long vertical page.
- Tabs preserve patient context.
- Status banners prevent wrong-patient and inactive/deceased record mistakes.

## Page 4: Visit History

### Purpose

Show patient encounter history across hospital departments using static records.

### Route

`/patients/:patientId/visits`

### Tabs

- All visits.
- OPD.
- IPD.
- Emergency.
- Lab.
- Radiology.
- Pharmacy.
- Billing.

### Timeline View

Each visit card should show:

- Date/time.
- Visit type.
- Department.
- Doctor/provider.
- Status.
- Summary.
- Linked documents/reports placeholder.

### Table View Columns

- Visit date.
- Visit type.
- Department.
- Doctor/provider.
- Reference number.
- Status.
- Amount placeholder.
- Actions.

### Filters

- Date range.
- Visit type.
- Department.
- Doctor.
- Status.

### Actions

- View visit summary.
- Print visit summary placeholder.
- Open related document.

### Acceptance

- Timeline is easy to scan.
- Table view is available for dense review.
- Clinical details remain summary-level because OPD/IPD details are future phases.

## Page 5: Family Management

### Purpose

Manage family relationships for patient records and future family-based billing/history workflows.

### Route

`/patients/:patientId/family`

### Summary Cards

- Family members.
- Primary contact.
- Shared address.
- Linked patient records.

### Table Columns

- Name.
- Relationship.
- UHID if existing patient.
- Age/gender.
- Mobile.
- Primary contact.
- Status.
- Actions.

### Drawer Fields

- Member name.
- Relationship.
- Existing patient link placeholder.
- Mobile.
- Email.
- Address same as patient.
- Primary contact checkbox.
- Emergency contact checkbox.

### Actions

- Add family member.
- Link existing patient.
- Edit relationship.
- Remove relationship placeholder.

### Acceptance

- Family members can be shown as linked or non-linked records.
- Primary contact is clear.
- Removing a family relationship uses confirmation pattern.

## Page 6: Patient Documents

### Purpose

Manage patient documents with preview and verification states.

### Route

`/patients/:patientId/documents`

### Page Header Actions

- Add document.
- Verify selected placeholder.
- Print document list placeholder.

### Document Categories

- Identity proof.
- Address proof.
- Insurance.
- Consent.
- Clinical attachment.
- Lab report.
- Radiology report.
- Discharge summary placeholder.
- Other.

### Document Upload Placeholder Rules

- Accepted file types placeholder: PDF, JPG, PNG.
- Maximum file size placeholder.
- Document category is required.
- Linked visit is optional.
- Verification comments are required when rejecting.
- Expiry date is required for expirable documents where applicable.
- File preview must show unavailable state when preview is not supported.
- Uploaded files are static placeholders only in Phase 3.

### Document Table/Grid Fields

- Document name.
- Category.
- Uploaded date.
- Uploaded by.
- Verification status.
- Linked visit.
- File type placeholder.
- Actions.

### Document Statuses

- Pending verification.
- Verified.
- Rejected.
- Expired.
- Archived.

### Preview Drawer

Sections:

- Document preview placeholder.
- Metadata.
- Verification status.
- Comments.
- Linked patient/visit.
- Audit trail placeholder.

### Actions

- Add document.
- Preview.
- Verify.
- Reject.
- Replace placeholder.
- Archive placeholder.
- Download placeholder.

### Responsive Behavior

Phone:

- Use document cards.
- Preview opens full-screen.
- Upload action opens full-screen form placeholder.

Desktop:

- Use table/grid with side preview drawer.

### Acceptance

- Document states are clear.
- Preview drawer is reusable for future clinical attachments.
- Sensitive document handling uses confirmation for archive/reject.
- Upload constraints and unsupported preview states are represented.

## Page 7: Consent Management

### Purpose

Manage consent forms and signed status for patient workflows.

### Route

`/patients/:patientId/consents`

### Consent Types

- General treatment consent.
- Data sharing consent.
- ABHA linking consent.
- Teleconsultation consent.
- Procedure consent placeholder.
- Insurance consent placeholder.
- Minor/guardian consent placeholder.
- Emergency treatment consent placeholder.

### Table Columns

- Consent type.
- Version.
- Status.
- Signed by.
- Relationship.
- Signed date.
- Expiry date.
- Actions.

### Consent Statuses

- Not signed.
- Signed.
- Expired.
- Withdrawn.
- Pending guardian.

### Consent Detail Drawer

Sections:

- Consent summary.
- Consent text preview placeholder.
- Signature status.
- Guardian details.
- Linked visit/procedure placeholder.
- Audit trail.

### Actions

- Create consent.
- Mark signed placeholder.
- Withdraw consent placeholder.
- Print consent.
- View signed copy placeholder.
- Renew consent placeholder.

### Acceptance

- Consent status is visible on patient profile.
- Withdraw and expiry states are clearly different.
- Consent print uses print-safe light theme.
- Future digital signature integration is prepared but not implemented.
- Guardian/minor and emergency consent states are represented.

## Page 8: Patient Portal Preview

### Purpose

Show a patient-facing preview of what patient portal data may look like in future phases.

### Route

`/patients/:patientId/portal`

### Sections

- Profile summary.
- Appointments placeholder.
- Visit summary.
- Documents.
- Lab reports placeholder.
- Radiology reports placeholder.
- Prescriptions placeholder.
- Bills placeholder.
- Consent status.

### Rules

- This is an internal preview only.
- No real patient login is required.
- Do not expose internal admin/audit details.
- Use patient-friendly labels.

### Acceptance

- Portal preview is clearly marked as preview/internal.
- Uses same theme and responsive foundation.
- Does not include staff-only actions.

## Page 9: ABHA / Health ID Placeholder

### Purpose

Prepare UI for future ABHA / Health ID linking and verification.

### Route

`/patients/abha`

### Page Sections

- ABHA link search.
- Patient match preview.
- Link status dashboard.
- Verification history placeholder.
- Consent requirement.
- Sync log placeholder.

### Fields

- Patient UHID.
- Patient name.
- Mobile.
- ABHA number placeholder.
- ABHA address placeholder.
- Consent status.
- Verification status.

### ABHA Safety Rules

- ABHA actions must show integration placeholder text.
- Consent required state must block link action visually.
- Failed verification should show retry and help text placeholders.
- ABHA number/address should support masked display.
- Sync log must not imply real external exchange in Phase 3.

### Statuses

- Not linked.
- Link pending.
- Linked.
- Verification failed.
- Consent required.
- Sync pending.

### Actions

- Search patient.
- Link ABHA placeholder.
- Verify placeholder.
- Unlink placeholder.
- View sync log.

### Acceptance

- Clearly marked as placeholder for future integration.
- Requires consent state before link action.
- Does not claim real ABHA verification is happening.
- Masked ABHA display pattern is included.

## Page 10: Duplicate Patients And Merge Request Placeholder

### Purpose

Show possible duplicate patient records and prepare UI for future merge workflow.

### Route

`/patients/duplicates`

### Summary Cards

- Possible duplicates.
- High confidence matches.
- Pending merge requests.
- Resolved duplicates.

### Table Columns

- Primary patient.
- Possible match.
- Match reason.
- Confidence.
- Last updated.
- Status.
- Actions.

### Match Reasons

- Same mobile.
- Same name and DOB.
- Same ID number.
- Same ABHA placeholder.
- Similar name and address.

### Detail Drawer

Sections:

- Side-by-side patient comparison.
- Matching fields.
- Conflicting fields.
- Visit counts.
- Document counts.
- Recommended action placeholder.

### Actions

- Open primary patient.
- Open possible match.
- Mark not duplicate.
- Create merge request placeholder.

### Safety Rules

- No actual merge happens in Phase 3.
- Merge request action must show confirmation.
- The UI must explain that merge affects patient identity and records.
- Side-by-side comparison must highlight conflicting identity fields.
- Merge request requires reason placeholder.
- Merge request should show future audit impact.
- Mark not duplicate should require a short reason placeholder.

### Acceptance

- Duplicate records are easy to compare.
- Risk of merge is clearly communicated.
- No destructive merge behavior is implemented.
- Merge request and not-duplicate actions are confirmation-based.

## Page 11: Emergency / Unknown Patient Registration Placeholder

### Purpose

Prepare UI for fast patient identity capture when the patient is unknown or emergency registration is required.

### Route

`/patients/emergency-register`

### Required Fields

- Temporary patient ID placeholder.
- Approximate age.
- Gender.
- Brought by.
- Contact number if available.
- Emergency department placeholder.
- Identification marks placeholder.
- Unknown identity reason.
- Initial alert flags.

### Actions

- Create emergency patient.
- Convert to regular patient placeholder.
- Link to existing patient placeholder.
- Print temporary patient band/card placeholder.

### Safety Rules

- Emergency patient records must show `Unknown emergency` status.
- UI must clearly indicate identity is incomplete.
- Later conversion to regular patient must use duplicate check.
- Link to existing patient must show confirmation.

### Acceptance

- Emergency registration can be done with minimal identity fields.
- Unknown patient status is visually distinct.
- Conversion/link placeholders are present but do not perform real merge.

## Static Data Requirements

Phase 3 should add or expand static data files.

Recommended data:

- `mockPatients`.
- `mockPatientContacts`.
- `mockPatientAlerts`.
- `mockPatientVisits`.
- `mockFamilyMembers`.
- `mockPatientDocuments`.
- `mockConsentForms`.
- `mockPatientPortalPreview`.
- `mockAbhaLinks`.
- `mockDuplicatePatients`.
- `mockPatientAuditEvents`.
- `mockEmergencyPatients`.
- `mockPatientStatusHistory`.

Patient fields:

- `id`.
- `uhid`.
- `firstName`.
- `middleName`.
- `lastName`.
- `dateOfBirth`.
- `age`.
- `gender`.
- `bloodGroup`.
- `mobile`.
- `email`.
- `address`.
- `city`.
- `state`.
- `pinCode`.
- `status`.
- `abhaStatus`.
- `lastVisitAt`.
- `alertFlags`.
- `identityCompleteness`.
- `isMinor`.
- `guardianRequired`.
- `maskedMobile`.
- `maskedIdNumber`.

Document fields:

- `id`.
- `patientId`.
- `name`.
- `category`.
- `fileType`.
- `uploadedAt`.
- `uploadedBy`.
- `verificationStatus`.
- `linkedVisitId`.
- `comments`.

Consent fields:

- `id`.
- `patientId`.
- `type`.
- `version`.
- `status`.
- `signedBy`.
- `relationship`.
- `signedAt`.
- `expiresAt`.
- `linkedVisitId`.

Visit fields:

- `id`.
- `patientId`.
- `visitType`.
- `department`.
- `provider`.
- `referenceNumber`.
- `status`.
- `visitedAt`.
- `summary`.

Duplicate match fields:

- `id`.
- `primaryPatientId`.
- `matchedPatientId`.
- `matchReason`.
- `confidence`.
- `status`.
- `createdAt`.

Emergency patient fields:

- `id`.
- `temporaryId`.
- `approxAge`.
- `gender`.
- `broughtBy`.
- `contactNumber`.
- `department`.
- `identityMarks`.
- `unknownReason`.
- `status`.

Patient status history fields:

- `id`.
- `patientId`.
- `fromStatus`.
- `toStatus`.
- `reason`.
- `changedBy`.
- `changedAt`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from Phase 1 and Phase 2.

Common validation:

- Required first name.
- Required gender.
- Required date of birth or age.
- Mobile number format placeholder.
- Email format.
- PIN code format placeholder.
- Duplicate UHID prevention placeholder.
- ABHA format placeholder.
- Document category required.
- Consent type required.
- Guardian required for minor consent placeholder.
- Reason required for status change placeholder.
- Reason required for merge request or mark not duplicate.
- Emergency registration requires approximate age, gender, and unknown reason.

Validation UI:

- Inline field error.
- Error summary for long forms.
- Required field indicator.
- Duplicate warning panel.
- Disabled save where required fields are missing.

## Accessibility Requirements

Required:

- Forms have labels.
- Icon buttons have accessible labels.
- Patient alerts are not color-only.
- Tabs are keyboard accessible.
- Drawers trap focus correctly and return focus after close.
- Tables have clear column headers.
- Document preview has accessible title and metadata.
- Consent action confirmations are keyboard accessible.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, filters, tabs, drawers, and menus work without mouse.
- Patient summary and critical alerts are announced clearly for assistive technologies where possible.
- Document preview unavailable state has readable fallback text.

## Performance Requirements

Even with static data:

- Keep patient list efficient and reusable.
- Avoid rendering all patient details inside list rows.
- Lazy render tab content where useful.
- Use drawer previews instead of navigating for every quick view.
- Keep patient profile header stable to avoid layout shift.
- Use skeletons for loading-looking states.
- Keep document preview placeholders lightweight.

## Page State Requirements

Each Phase 3 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Validation error.
- Duplicate warning.
- Save success.
- Save failed placeholder.
- Read-only state.
- Access denied state.
- Patient not found state.
- Document preview unavailable state.
- Consent expired state.
- Unknown emergency patient state.
- Deceased/inactive read-only state.
- Merge request confirmation state.
- Unsupported document preview state.

## Phase 3 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Patient list/search | Required | Required | Required | Required | Required | Required | Required |
| Patient registration | Required | Required | Required | Required | Required | Required | Not needed |
| Patient profile | Required | Required | Required | Required | Required | Required | Required |
| Visit history | Required | Required | Required | Required | Required | Required | Required |
| Family management | Required | Required | Required | Required | Required | Required | Not needed |
| Patient documents | Required | Required | Required | Required | Required | Required | Required |
| Consent management | Required | Required | Required | Required | Required | Required | Required |
| Patient portal preview | Required | Required | Required | Not needed | Required | Required | Required |
| ABHA placeholder | Required | Required | Required | Required | Required | Required | Not needed |
| Duplicate patients | Required | Required | Required | Required | Required | Required | Not needed |
| Emergency registration | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 3 does not need real export files, but UI should reserve production actions.

Required:

- Print patient card placeholder.
- Print patient summary placeholder.
- Print consent placeholder.
- Print document list placeholder.
- Export patient list placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and staff-only controls are hidden in print preview.
- Sensitive identifiers remain masked where required.
- Emergency temporary patient card placeholder uses print-safe light theme.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2 role/access patterns are ready.
2. Add patient navigation entries and route placeholders.
3. Add Phase 3 static data files.
4. Build patient list/search page.
5. Build patient quick view drawer.
6. Build patient registration page with quick and detailed modes.
7. Build duplicate warning UI inside registration.
8. Build patient profile page and sticky patient header.
9. Build visit history page.
10. Build family management page.
11. Build patient documents page and preview drawer.
12. Build consent management page.
13. Build patient portal preview.
14. Build ABHA / Health ID placeholder page.
15. Build duplicate patients page and merge request placeholder.
16. Build emergency/unknown patient registration placeholder.
17. Add patient status lifecycle UI.
18. Add role visibility and access denied states.
19. Verify light, dark, system, dynamic preset, and custom color themes.
20. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
21. Polish validation, keyboard behavior, loading states, empty states, masking, and print-safe views.

## Production-Grade Acceptance Checklist

Phase 3 is complete when:

- Patient list/search works with static data.
- Patient registration supports quick and detailed modes.
- Duplicate patient warning UI is present.
- Patient profile has sticky patient context and tab-based sections.
- Visit history shows timeline and table views.
- Family management supports linked and non-linked family records.
- Patient documents support categories, statuses, preview drawer, and verification placeholders.
- Consent management supports consent types, statuses, print placeholder, and withdrawal placeholder.
- Patient portal preview is clearly internal and patient-friendly.
- ABHA / Health ID placeholder clearly communicates future integration.
- Duplicate patients page supports comparison and merge request placeholder.
- Emergency/unknown patient registration placeholder is available.
- Patient lifecycle states are represented: active, inactive, unknown emergency, deceased, merged placeholder, duplicate review, and archived placeholder.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky headers and sticky actions do not cover content.
- Patient privacy and safety display rules are followed.
- Sensitive identifiers support masked display patterns.
- Minor/guardian, emergency, deceased, inactive, and duplicate-review states are clear.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, and consent actions.
- Static data is organized for future API replacement.

## Handoff Notes For Phase 4

Phase 4 can begin after Phase 3 provides:

- Patient static data.
- Patient search and quick view patterns.
- Patient profile header pattern.
- Patient alert display pattern.
- Patient visit history summary pattern.
- Document preview drawer.
- Consent status pattern.
- ABHA placeholder state pattern.
- Duplicate patient warning pattern.

Phase 4 should then focus on appointment management, doctor scheduling, queue management, token management, teleconsultation placeholder, follow-up management, calendar management, and front office/reception workflows.
