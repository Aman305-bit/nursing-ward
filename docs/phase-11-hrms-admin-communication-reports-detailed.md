# Phase 11 Detailed Document: HRMS, Administration, Communication, And Reports

## Phase Goal

Build the production-grade UI screens for HRMS, support administration, staff operations, non-clinical service departments, communication, alert management, emergency broadcast, reports, analytics, audit reporting, and custom report builder workflows.

This phase is UI-only and uses static data. It should feel ready for real hospital support operations, but no real payroll calculation engine, biometric device integration, recruitment portal integration, SMS/email/WhatsApp provider integration, push notification provider, emergency broadcast backend, reporting warehouse, BI engine, or report export service is required in this phase.

## Dependency On Previous Phases

Phase 11 must use the foundations from Phases 1 to 10.

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
- User, role, permission, department, branch, and security static data.

Required Phase 3 patterns:

- Patient identity, masking, visitor-patient mapping, privacy rules, and consent indicators where patient context appears.

Required Phase 4 patterns:

- Front-office handoff, reception, queue, appointment, and visitor-adjacent workflow patterns.

Required Phase 5 patterns:

- Doctor and department context for reports, doctor performance, communication recipients, and clinical report placeholders.

Required Phase 6 patterns:

- Ward, bed, ICU, nursing station, emergency, discharge, housekeeping, laundry, security, and bed occupancy context.

Required Phase 7 patterns:

- EMR/EHR timeline and access audit patterns for clinical report references and audit reports.

Required Phase 8 patterns:

- Diagnostic turnaround, critical alert, lab/radiology report context, and department report handoff placeholders.

Required Phase 9 patterns:

- Pharmacy, inventory, OT, instrument, infection, and department support handoff placeholders.

Required Phase 10 patterns:

- Billing, finance, revenue, cash counter, insurance, TPA, ledger, print/export, and report-style placeholder patterns.

Important rule:

All Phase 11 screens must follow the Phase 1 theme and responsive system. Do not create separate HRMS, admin, communication, report, dashboard, complaint, feedback, visitor, housekeeping, laundry, cafeteria, security, or analytics styles outside the shared design system.

## Phase 11 Scope

Phase 11 covers:

- HRMS dashboard.
- Employee management.
- Employee profile.
- Employee onboarding and offboarding placeholders.
- Attendance management.
- Shift management.
- Leave management.
- Payroll placeholder.
- Recruitment management.
- Appraisal management.
- Training management.
- Staff document management.
- Administration dashboard.
- Front office administration.
- Reception management continuation.
- Housekeeping management.
- Laundry management.
- Cafeteria management.
- Visitor management.
- Security desk management.
- Complaint management.
- Feedback management.
- Communication dashboard.
- SMS gateway placeholder.
- Email notification placeholder.
- WhatsApp notification placeholder.
- Push notification placeholder.
- Notification template management.
- Send log and delivery status.
- Alert management.
- Emergency alert system.
- Reports dashboard.
- MIS reports.
- Financial reports.
- Clinical reports.
- Operational reports.
- Doctor performance reports.
- Revenue analytics continuation.
- Bed occupancy analytics.
- Audit reports.
- Custom report builder.
- Scheduled reports placeholder.
- Dashboard analytics.

Phase 11 does not cover:

- Real biometric device integration.
- Real payroll calculation and statutory payroll filing.
- Real recruitment portal integration.
- Real staff appraisal scoring engine.
- Real SMS/email/WhatsApp/push provider integration.
- Real emergency broadcast service.
- Real report warehouse.
- Real analytics engine.
- Real export file generation.
- Real immutable audit archive.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/hrms` | HRMS dashboard | Staff summary, attendance, leave, payroll, recruitment, document alerts. |
| `/hrms/employees` | Employee management | Employee list, profile, role, department, documents, employment status. |
| `/hrms/attendance` | Attendance management | Attendance grid, punch state, correction requests. |
| `/hrms/shifts` | Shift management | Shift roster, department schedule, staff assignment. |
| `/hrms/leaves` | Leave management | Leave request, approval queue, balance, calendar. |
| `/hrms/payroll` | Payroll placeholder | Payroll run list, salary structure, payslip placeholder. |
| `/hrms/recruitment` | Recruitment management | Candidates, interview status, offer stage. |
| `/hrms/appraisals` | Appraisal management | Appraisal cycles, ratings, review status. |
| `/hrms/training` | Training management | Training calendar, participants, completion. |
| `/hrms/documents` | Staff documents | Staff document list, expiry alerts, verification. |
| `/administration` | Administration dashboard | Non-clinical operations summary and pending support tasks. |
| `/administration/front-office` | Front office admin | Desk allocation, reception counters, service request overview. |
| `/administration/reception` | Reception management | Reception counters, desk queue, handoffs, service requests. |
| `/administration/housekeeping` | Housekeeping management | Cleaning tasks, room/ward status, assignment. |
| `/administration/laundry` | Laundry management | Laundry requests, collection, processing, delivery. |
| `/administration/cafeteria` | Cafeteria management | Menu, orders, billing placeholder, delivery status. |
| `/administration/visitors` | Visitor management | Visitor registration, pass, patient/staff mapping. |
| `/administration/security-desk` | Security desk | Gate entry, staff/visitor movement, incident placeholder. |
| `/administration/complaints` | Complaint management | Complaint list, priority, assignment, resolution. |
| `/administration/feedback` | Feedback management | Feedback list, rating, category, response. |
| `/communication` | Communication dashboard | Message volume, failed deliveries, templates, alerts. |
| `/communication/templates` | Notification templates | SMS/email/WhatsApp/push templates and variables. |
| `/communication/sms` | SMS gateway placeholder | SMS provider status, send log, delivery state. |
| `/communication/email` | Email notification placeholder | Email template, send log, delivery state. |
| `/communication/whatsapp` | WhatsApp notification placeholder | WhatsApp templates, send log, consent state. |
| `/communication/push` | Push notification placeholder | Push templates, app audience, delivery state. |
| `/communication/logs` | Communication logs | Unified message log and retry state placeholder. |
| `/communication/alerts` | Alert management | Alert rules, severity, recipients, active state. |
| `/communication/emergency-alerts` | Emergency alert system | Broadcast, recipients, acknowledgement, escalation. |
| `/reports` | Reports dashboard | MIS, financial, clinical, operational, audit, custom reports. |
| `/reports/mis` | MIS reports | Hospital-wide summary reports. |
| `/reports/financial` | Financial reports | Revenue, collection, outstanding, refunds, payer summaries. |
| `/reports/clinical` | Clinical reports | Diagnosis, procedures, visits, outcomes placeholders. |
| `/reports/operational` | Operational reports | Appointments, queue, TAT, occupancy, service volumes. |
| `/reports/doctor-performance` | Doctor performance reports | Consultations, revenue, ratings, follow-ups. |
| `/reports/revenue-analytics` | Revenue analytics | Department, doctor, payer, payment-mode charts. |
| `/reports/bed-occupancy` | Bed occupancy analytics | Ward/ICU occupancy, trends, discharge readiness. |
| `/reports/audit` | Audit reports | User activity, permission changes, sensitive access. |
| `/reports/custom-builder` | Custom report builder | Fields, filters, preview, export placeholder. |
| `/reports/schedules` | Scheduled reports | Report schedule, recipients, delivery channel, next run placeholder. |
| `/reports/dashboard-analytics` | Dashboard analytics | Executive dashboards with role-wise widgets. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/hrms` | HRMS pages | Main HMS app shell from Phase 1. |
| `(app)/administration` | Administration pages | Main HMS app shell from Phase 1. |
| `(app)/communication` | Communication pages | Main HMS app shell from Phase 1. |
| `(app)/reports` | Reports and analytics pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 11 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for staff profile summaries, attendance sheets, shift rosters, leave approvals, payslip placeholders, candidate summaries, appraisal summaries, training attendance, document expiry reports, visitor passes, complaint reports, feedback reports, communication logs, alert reports, MIS reports, financial reports, clinical reports, operational reports, audit reports, and custom report previews.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- HR, attendance, leave, payroll, recruitment, housekeeping, laundry, cafeteria, visitor, security, complaint, feedback, communication, alert, report, and audit statuses must use shared status tokens.
- Never hardcode page-level colors.
- Pending approval, expired document, failed delivery, emergency alert, high priority complaint, unresolved incident, and audit risk states must be readable in all themes.
- Print views should use Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 11 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column staff/task/report cards and full-screen drawers.
- Tablet screens can use two-column forms, roster views, and compact report filters.
- Laptop and desktop screens can use dense tables, split panels, calendars, charts, and detail drawers.
- Wide desktop screens can show worklist, profile/task context, detail panel, and activity/audit side panel together.
- No page-level horizontal scroll.
- Dense attendance, shift, report, communication log, and audit tables may scroll inside their own containers.
- Sticky headers and sticky actions must not cover form fields, roster rows, task rows, alert lists, or report previews.

### Operational Workflow Pattern

Required:

- Sticky page header.
- Staff/patient/department/context header where applicable.
- Worklist filters.
- Detail drawer or split panel.
- Status-aware actions.
- Approval state.
- Print/export placeholders.
- Audit handoff indicator.

Avoid:

- Hidden staff or patient identity.
- Hidden department/source context.
- Long unstructured forms.
- Multiple popup dependency.
- Deep nested support department menus.
- Full page reloads for status changes.

## Status Standards

### Employee Statuses

- Active.
- Probation.
- On leave.
- Suspended placeholder.
- Resigned.
- Terminated placeholder.
- Inactive.

### Attendance Statuses

- Present.
- Absent.
- Late.
- Half day.
- On leave.
- Holiday.
- Correction requested.
- Correction approved.
- Correction rejected.

### Shift Statuses

- Draft.
- Published.
- Assigned.
- Swap requested.
- Swap approved.
- Short staffed.
- Completed.

### Leave Statuses

- Draft.
- Requested.
- Approved.
- Rejected.
- Cancelled.
- Balance insufficient.

### Payroll Statuses

- Draft.
- Processing placeholder.
- Review pending.
- Approved.
- Payslip generated placeholder.
- On hold.

### Recruitment Statuses

- New.
- Screening.
- Interview scheduled.
- Interviewed.
- Selected.
- Offered.
- Joined.
- Rejected.
- On hold.

### Administration Task Statuses

- Requested.
- Assigned.
- In progress.
- Delayed.
- Completed.
- Reopened.
- Cancelled.

### Visitor/Security Statuses

- Registered.
- Pass printed.
- Checked in.
- Checked out.
- Overstay.
- Blocklisted placeholder.
- Incident reported.

### Communication Statuses

- Draft.
- Scheduled.
- Queued.
- Sent.
- Delivered placeholder.
- Failed.
- Retrying.
- Cancelled.

### Alert Statuses

- Active.
- Triggered.
- Acknowledged.
- Escalated.
- Resolved.
- Disabled.

### Report Statuses

- Ready.
- Generating placeholder.
- No data.
- Export pending.
- Export failed placeholder.
- Restricted.

Status rules:

- Status must use text, icon, and token color.
- Expired staff document, failed communication, emergency alert, complaint overdue, security overstay, payroll hold, and audit risk states must be visually distinct.
- Placeholder integrations must be clearly marked.

## Safety And Governance Rules

Phase 11 touches staff data, visitor access, communication consent, emergency messaging, reports, and audit visibility.

Required:

- Staff identity must remain visible for HRMS screens.
- Patient identity must remain masked and role-aware for visitor, feedback, complaint, report, and communication screens.
- Employee onboarding must show department, role, access, document, and training readiness placeholders.
- Employee offboarding must show handover, document return, final attendance/payroll, and access revocation placeholders.
- Staff documents must show expiry, verification, and restricted access states.
- Clinical staff credential/license expiry must be visually distinct from general document expiry.
- Payroll placeholders must not expose sensitive salary values to unauthorized roles.
- Attendance correction requires reason and approval placeholder.
- Shift change and swap require reason and approval placeholder.
- Leave approval/rejection requires reason placeholder.
- Visitor pass must show host/patient mapping, visit purpose, check-in/out status, and overstay warning.
- Visitor registration must show ID proof placeholder and pass validity.
- Reception handoffs must preserve patient/service request context and owner.
- Security incidents require severity, location, reporter, and action status placeholder.
- Complaint assignment and resolution require owner, priority, due date, and resolution note.
- Feedback response must show category, rating, owner, and response status.
- Communication templates must show audience, channel, consent requirement, and variable preview.
- Communication audience selection must show role, department, patient/staff segment, consent, and exclusion placeholders.
- Quiet-hour/DND and opt-out states must block non-emergency communication visually.
- WhatsApp/SMS/email/push send actions must show integration pending state.
- Emergency broadcast requires confirmation, severity, audience, acknowledgement status, and escalation placeholder.
- Reports must show date range, data source, generated by, generated time, and role restriction state.
- Scheduled report placeholders must show frequency, recipients, delivery channel, next run, and failure state.
- Audit reports must preserve actor, action, module, timestamp, IP/device placeholder, and sensitive access indicator.
- Custom report builder must show restricted fields and role access rules.

High-impact actions:

- Create employee.
- Complete onboarding placeholder.
- Start offboarding placeholder.
- Change employee status.
- Approve attendance correction.
- Publish shift roster.
- Approve shift swap.
- Approve leave.
- Reject leave.
- Approve payroll placeholder.
- Verify staff document.
- Assign reception counter.
- Register visitor.
- Blocklist visitor placeholder.
- Report security incident.
- Resolve complaint.
- Send communication broadcast placeholder.
- Retry failed communication.
- Activate alert rule.
- Trigger emergency alert.
- Acknowledge emergency alert.
- Export report placeholder.
- Schedule report placeholder.
- Save custom report.
- Share dashboard placeholder.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All Phase 11 screens. |
| Hospital Admin | Administration, communication, reports, and approval placeholders. |
| HR Manager | Employee, attendance, shift, leave, payroll, recruitment, appraisal, training, staff documents. |
| HR Executive | Employee records, attendance, leave, recruitment, training, staff documents with restricted payroll view. |
| Payroll Manager | Payroll placeholder, salary structure placeholder, payslip placeholder, attendance/leave summary. |
| Department Head | Department attendance, shift roster, leave approvals, staff reports. |
| Front Office Manager | Front office admin, visitor management, complaints, feedback. |
| Housekeeping Supervisor | Housekeeping tasks and room/ward cleaning status. |
| Laundry Supervisor | Laundry requests, collection, processing, delivery status. |
| Cafeteria Manager | Cafeteria menu, orders, billing placeholder, delivery status. |
| Security Officer | Visitor movement, gate entry, security desk, incident placeholder. |
| Communication Manager | Templates, send logs, alerts, emergency broadcast placeholders. |
| Quality Manager | Complaints, feedback, operational reports, audit reports. |
| Finance Manager | Financial reports, revenue analytics, cash and collection summaries from Phase 10. |
| Doctor | Personal schedule, performance summary, training, limited reports. |
| Nurse | Personal attendance, shift, leave, training, department notices. |
| Management | Read-only dashboard analytics, MIS, financial, operational, doctor performance, audit summaries. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view allowed records but cannot edit or approve.
- Disabled actions should explain required permission.
- Sensitive staff, payroll, patient, and audit data should be masked where required.

## Page 1: HRMS Dashboard

### Purpose

Provide a staff operations dashboard for HR and department managers.

### Route

`/hrms`

### Summary Cards

- Active employees.
- Present today.
- Absent today.
- Late punches.
- Leave approvals pending.
- Shift gaps.
- Payroll review pending.
- Documents expiring.
- Recruitment pipeline.
- Training due.

### Widgets

- Attendance exceptions.
- Leave approval queue.
- Shift gaps by department.
- Document expiry alerts.
- Recruitment stage summary.
- Training completion summary.

### Quick Actions

- Add employee.
- Open attendance.
- Publish shift roster.
- Review leave.
- Open document alerts.
- Print staff summary.

### Acceptance

- HR state is clear at a glance.
- Staff exceptions are visible.
- HR users can reach common workflows with low clicks.

## Page 2: Employee Management

### Purpose

Manage employee list, profile, role, department, employment status, and documents.

### Route

`/hrms/employees`

### Filters

- Department.
- Role.
- Employment type.
- Status.
- Joining date.
- Document expiry.
- Search by name, employee code, mobile.

### Table Columns

- Employee code.
- Employee name.
- Role.
- Department.
- Employment type.
- Joining date.
- Contact.
- Document status.
- Status.
- Actions.

### Employee Drawer Tabs

- Profile.
- Employment.
- Department/role.
- Onboarding.
- Offboarding.
- Documents.
- Attendance summary.
- Leave summary.
- Training.
- Audit.

### Actions

- Add employee.
- Edit profile.
- Assign department.
- Mark onboarding complete placeholder.
- Start offboarding placeholder.
- Change status.
- Upload document placeholder.
- Print profile summary.

### Safety Rules

- Employee status change requires reason placeholder.
- Onboarding completion requires mandatory document and training readiness placeholder.
- Offboarding requires handover owner, asset/document return, final payroll status, and access revocation placeholder.
- Sensitive staff details are role-masked.
- Payroll data is hidden unless role permits.

### Acceptance

- Employee list is scannable.
- Profile details are organized in tabs.
- Onboarding and offboarding states are represented.
- Document and status risks are visible.

## Page 3: Attendance Management

### Purpose

Track attendance grid, punch state, exceptions, and correction approvals.

### Route

`/hrms/attendance`

### Views

- Daily attendance.
- Monthly grid.
- Department view.
- Exception view.
- Correction queue.

### Table Columns

- Employee.
- Department.
- Shift.
- Punch source placeholder.
- In time.
- Out time.
- Worked hours.
- Status.
- Exception.
- Actions.

### Actions

- Mark manual attendance placeholder.
- Request correction.
- Approve correction.
- Reject correction.
- Print attendance sheet.

### Safety Rules

- Correction request requires reason.
- Approval/rejection requires approver and reason placeholder.
- Manual attendance must show audit indicator.
- Biometric/device sync is placeholder only and must show failed/missing punch state.

### Acceptance

- Attendance exceptions are easy to find.
- Correction workflow is reason-gated.
- Monthly grid works on tablet/desktop without page-level horizontal scroll.

## Page 4: Shift Management

### Purpose

Create and manage shift rosters, department schedules, staffing gaps, and swap requests.

### Route

`/hrms/shifts`

### Views

- Calendar view.
- Department roster.
- Staff view.
- Gap view.
- Swap request queue.

### Table Columns

- Date.
- Department.
- Shift.
- Required staff.
- Assigned staff.
- Gap.
- Status.
- Actions.

### Actions

- Create shift.
- Assign staff.
- Publish roster.
- Request swap.
- Approve swap.
- Print roster.

### Safety Rules

- Publishing roster requires confirmation placeholder.
- Short-staffed departments must be highlighted.
- Swap approval requires reason placeholder.

### Acceptance

- Roster is readable across devices.
- Shift gaps are visible.
- Published roster has read-only state unless revision placeholder.

## Page 5: Leave Management

### Purpose

Manage leave requests, approval queue, balances, and leave calendar.

### Route

`/hrms/leaves`

### Sections

- Leave request list.
- Approval queue.
- Leave balance.
- Department calendar.
- Leave policy placeholder.

### Table Columns

- Employee.
- Department.
- Leave type.
- From date.
- To date.
- Days.
- Balance.
- Status.
- Actions.

### Actions

- Request leave.
- Approve leave.
- Reject leave.
- Cancel leave.
- Print leave summary.

### Safety Rules

- Leave request requires date range and leave type.
- Insufficient balance must be visible.
- Approval/rejection requires reason placeholder.

### Acceptance

- Leave queue is easy to review.
- Balance and department coverage are visible.
- Approval state is traceable.

## Page 6: Payroll Placeholder

### Purpose

Show payroll run, salary structure, attendance inputs, deductions, approvals, and payslip placeholders.

### Route

`/hrms/payroll`

### Sections

- Payroll run list.
- Salary structure placeholder.
- Attendance and leave input summary.
- Earnings placeholder.
- Deductions placeholder.
- Approval status.
- Payslip preview placeholder.

### Actions

- Create payroll run placeholder.
- Review payroll.
- Approve payroll placeholder.
- Hold payroll.
- Print payslip placeholder.

### Safety Rules

- Payroll is placeholder only in Phase 11.
- Salary values are masked for unauthorized users.
- Approval/hold requires reason placeholder.

### Acceptance

- Payroll workflow is represented without claiming real calculation.
- Sensitive salary data is protected.
- Payslip print placeholder is available.

## Page 7: Recruitment Management

### Purpose

Manage candidates, job openings, interview status, offer stage, and joining handoff placeholders.

### Route

`/hrms/recruitment`

### Views

- Job openings.
- Candidate pipeline.
- Interview calendar.
- Offer queue.
- Joining handoff.

### Table Columns

- Candidate.
- Position.
- Department.
- Stage.
- Interview date.
- Rating placeholder.
- Owner.
- Status.
- Actions.

### Actions

- Add candidate.
- Schedule interview.
- Update stage.
- Mark selected/rejected.
- Create offer placeholder.
- Convert to employee placeholder.

### Safety Rules

- Rejection requires reason placeholder.
- Offer stage is placeholder only.
- Candidate data is restricted to HR roles.

### Acceptance

- Recruitment pipeline is visible.
- Interview and offer states are clear.
- Employee handoff placeholder is available.

## Page 8: Appraisal Management

### Purpose

Represent appraisal cycles, review forms, ratings, manager feedback, and completion status.

### Route

`/hrms/appraisals`

### Sections

- Appraisal cycles.
- Employee review list.
- Self-review placeholder.
- Manager review placeholder.
- Rating summary.
- Finalization status.

### Actions

- Create appraisal cycle.
- Start review.
- Submit review placeholder.
- Finalize rating placeholder.
- Print appraisal summary.

### Safety Rules

- Ratings are restricted by role.
- Finalization requires confirmation placeholder.
- Reopen appraisal requires reason placeholder.

### Acceptance

- Appraisal lifecycle is clear.
- Review status is visible.
- Sensitive ratings are protected.

## Page 9: Training Management

### Purpose

Manage training calendar, participants, attendance, completion, certificates, and training due alerts.

### Route

`/hrms/training`

### Views

- Training calendar.
- Course list.
- Participant list.
- Attendance.
- Completion status.

### Actions

- Create training.
- Assign participants.
- Mark attendance.
- Mark completed.
- Print training attendance.
- Print certificate placeholder.

### Safety Rules

- Mandatory training due state must be visible.
- Completion requires attendance placeholder.
- Certificate is placeholder only.

### Acceptance

- Training schedule is clear.
- Participant progress is visible.
- Completion and certificate placeholders are represented.

## Page 10: Staff Documents

### Purpose

Manage staff documents, expiry alerts, verification, and restricted access.

### Route

`/hrms/documents`

### Filters

- Department.
- Document type.
- Expiry status.
- Verification status.
- Employee search.

### Table Columns

- Employee.
- Document type.
- Document number placeholder.
- Uploaded date.
- Expiry date.
- Verification status.
- Access level.
- Actions.

### Actions

- Upload document placeholder.
- Verify document.
- Reject document.
- Mark renewal required.
- Print expiry report.

### Safety Rules

- Expired/near-expiry documents must be highlighted.
- Verification/rejection requires reason placeholder.
- Restricted documents follow role masking.

### Acceptance

- Document expiry risks are visible.
- Verification workflow is reason-gated.
- Access restrictions are represented.

## Page 11: Administration Dashboard

### Purpose

Provide a non-clinical operations dashboard for support departments.

### Route

`/administration`

### Summary Cards

- Housekeeping tasks pending.
- Laundry requests pending.
- Cafeteria orders pending.
- Visitors inside.
- Security incidents open.
- Complaints overdue.
- Feedback pending response.
- Front office service requests.

### Widgets

- Support task queue.
- Department workload.
- Visitor overstay list.
- Complaint priority list.
- Feedback rating summary.
- Security incident summary.

### Quick Actions

- Create housekeeping task.
- Register visitor.
- Open complaint queue.
- Open feedback queue.
- Report security incident.
- Print admin summary.

### Acceptance

- Support operations are visible at a glance.
- High-risk pending work is not hidden.
- Users can reach support workflows with low clicks.

## Page 12: Front Office And Reception Administration

### Purpose

Manage front-office desk allocation, reception counters, desk queue, service requests, and support handoffs.

### Routes

- `/administration/front-office`
- `/administration/reception`

### Sections

- Reception counter status.
- Reception queue.
- Desk allocation.
- Service request list.
- Front-office staffing.
- Handoff queue.

### Actions

- Assign counter.
- Open/close reception counter placeholder.
- Create service request.
- Reassign request.
- Mark resolved.
- Handoff to billing/doctor/department placeholder.
- Print desk summary.

### Safety Rules

- Reception counter open/close requires assigned staff placeholder.
- Service request owner and due date must be visible.
- Reassignment requires reason placeholder.
- Handoff requires target department, owner, and reason placeholder.
- Patient context follows masking rules.

### Acceptance

- Front-office workload is clear.
- Reception queue, counter, and owner states are visible.
- Handoffs are traceable.

## Page 13: Housekeeping Management

### Purpose

Manage cleaning tasks, room/ward status, assignment, completion, delay, and reopen states.

### Route

`/administration/housekeeping`

### Views

- Task list.
- Ward/room board.
- Staff assignment.
- Delayed tasks.
- Completed tasks.

### Table Columns

- Task number.
- Location.
- Type.
- Priority.
- Assigned staff.
- Due time.
- Status.
- Actions.

### Actions

- Create task.
- Assign staff.
- Start task.
- Mark completed.
- Reopen task.
- Print task sheet.

### Safety Rules

- Cleaning completion requires staff and time placeholder.
- Reopen requires reason placeholder.
- Isolation/infection rooms must show warning from Phase 6/9 patterns.

### Acceptance

- Room and ward cleaning state is clear.
- Delayed/high priority tasks are visible.
- Infection/isolation warnings are preserved.

## Page 14: Laundry Management

### Purpose

Manage laundry requests, collection, processing, delivery, loss/damage placeholder, and department handoff.

### Route

`/administration/laundry`

### Status Flow

- Requested.
- Collected.
- In washing.
- Ready.
- Delivered.
- Lost/damaged placeholder.
- Cancelled.

### Table Columns

- Request number.
- Department/ward.
- Item type.
- Quantity.
- Collected by.
- Due time.
- Status.
- Actions.

### Actions

- Create request.
- Mark collected.
- Mark processing.
- Mark ready.
- Mark delivered.
- Report lost/damaged placeholder.
- Print laundry slip.

### Safety Rules

- Quantity variance requires reason placeholder.
- Lost/damaged state requires reason and owner placeholder.
- Infectious linen warning must be visible where applicable.

### Acceptance

- Laundry lifecycle is visible.
- Quantity and handoff states are clear.
- Exception states are reason-gated.

## Page 15: Cafeteria Management

### Purpose

Manage cafeteria menu, orders, delivery, patient/staff mapping, and billing placeholder.

### Route

`/administration/cafeteria`

### Sections

- Menu setup.
- Order list.
- Patient diet note placeholder.
- Staff order placeholder.
- Delivery status.
- Billing placeholder.

### Actions

- Add menu item.
- Create order.
- Mark preparing.
- Mark delivered.
- Cancel order.
- Print order slip.

### Safety Rules

- Patient diet restriction warning must be visible if patient order is linked.
- Cancellation requires reason placeholder.
- Billing is placeholder only in Phase 11.

### Acceptance

- Orders and menu are easy to scan.
- Patient diet warning placeholder is visible.
- Delivery and billing states are represented.

## Page 16: Visitor Management

### Purpose

Manage visitor registration, pass, patient/staff mapping, check-in/out, and overstay warnings.

### Route

`/administration/visitors`

### Filters

- Date.
- Visitor status.
- Department/ward.
- Patient/staff host.
- Overstay.
- Search by visitor name/mobile/pass number.

### Table Columns

- Pass number.
- Visitor.
- ID proof placeholder.
- Host/patient.
- Purpose.
- Check-in time.
- Expected checkout.
- Pass validity.
- Status.
- Actions.

### Actions

- Register visitor.
- Print pass.
- Check in.
- Check out.
- Extend visit.
- Blocklist placeholder.

### Safety Rules

- Patient identity follows masking rules.
- ID proof and pass validity must be visible.
- Overstay must be visible.
- Blocklist requires reason and permission placeholder.

### Acceptance

- Visitor movement is traceable.
- Pass and host context are visible.
- Overstay and blocklist states are clear.

## Page 17: Security Desk

### Purpose

Track gate entries, staff/visitor movement, incidents, and security action status.

### Route

`/administration/security-desk`

### Sections

- Gate entry log.
- Visitor movement.
- Staff movement placeholder.
- Incident log.
- Open action list.

### Actions

- Add gate entry.
- Report incident.
- Assign action.
- Mark resolved.
- Print security log.

### Safety Rules

- Incident requires severity, location, reporter, and description.
- Resolution requires action note.
- Restricted incidents are role-masked.

### Acceptance

- Security desk can track movement and incidents.
- Open incidents are visible.
- Resolution is traceable.

## Page 18: Complaint Management

### Purpose

Manage complaints, priority, assignment, SLA placeholder, resolution, and reopen states.

### Route

`/administration/complaints`

### Filters

- Date range.
- Category.
- Priority.
- Status.
- Department.
- Owner.
- SLA overdue.

### Table Columns

- Complaint number.
- Source.
- Patient/staff/visitor placeholder.
- Category.
- Priority.
- Owner.
- Due date.
- Status.
- Actions.

### Actions

- Create complaint.
- Assign owner.
- Add note.
- Resolve complaint.
- Reopen complaint.
- Print complaint report.

### Safety Rules

- Resolution requires note.
- Reopen requires reason placeholder.
- Sensitive complaint details are role-masked.

### Acceptance

- Complaint priority and ownership are visible.
- Overdue complaints are easy to find.
- Resolution history is represented.

## Page 19: Feedback Management

### Purpose

Manage feedback ratings, categories, responses, escalation, and analysis placeholders.

### Route

`/administration/feedback`

### Views

- Feedback list.
- Rating summary.
- Category summary.
- Response queue.
- Escalated feedback.

### Actions

- Add feedback.
- Assign response owner.
- Respond placeholder.
- Escalate feedback.
- Close feedback.
- Print feedback report.

### Safety Rules

- Low rating should be highlighted.
- Response/closure requires note placeholder.
- Patient identity follows masking rules.

### Acceptance

- Feedback trends are visible.
- Low ratings and escalations are not hidden.
- Response state is traceable.

## Page 20: Communication Dashboard

### Purpose

Show communication volume, channel status, failed deliveries, templates, alerts, and emergency broadcast state.

### Route

`/communication`

### Summary Cards

- Messages queued.
- Sent today.
- Failed messages.
- Retrying.
- Templates active.
- Alerts active.
- Emergency broadcasts active.
- Consent blocked messages.

### Widgets

- Channel delivery summary.
- Failed delivery queue.
- Template usage.
- Alert rule triggers.
- Emergency acknowledgement summary.

### Quick Actions

- Create template.
- Open send log.
- Retry failed messages.
- Create alert rule.
- Trigger emergency alert.

### Acceptance

- Communication health is clear.
- Failed and consent-blocked messages are visible.
- Emergency alert state is prominent.

## Page 21: Notification Templates

### Purpose

Manage SMS, email, WhatsApp, and push notification templates.

### Route

`/communication/templates`

### Template Fields

- Template name.
- Channel.
- Category.
- Audience.
- Language placeholder.
- Variables.
- Consent required.
- Quiet-hour/DND rule placeholder.
- Approval status placeholder.
- Active state.

### Actions

- Create template.
- Preview template.
- Mark active/inactive.
- Duplicate template.
- Print template summary.

### Safety Rules

- Patient/staff variables must preview safely.
- Consent requirement must be visible.
- Quiet-hour/DND rule must be visible for non-emergency templates.
- Template activation requires confirmation placeholder.

### Acceptance

- Templates are channel-aware.
- Variables and consent state are clear.
- Preview avoids unsafe hidden data.

## Page 22: SMS Gateway Placeholder

### Purpose

Show SMS provider status, send log, delivery state, retry, and failed message placeholders.

### Route

`/communication/sms`

### Sections

- Provider status placeholder.
- SMS send log.
- Failed SMS queue.
- Retry status.
- Template usage.

### Actions

- Send SMS placeholder.
- Retry failed SMS.
- Cancel queued SMS.
- Print SMS log.

### Safety Rules

- Real SMS integration is not included.
- Failed delivery reason must be visible.
- Patient communication must respect consent placeholder.

### Acceptance

- SMS state is clear without claiming real integration.
- Failed and retry states are represented.
- Consent-blocked messages are visible.

## Page 23: Email Notification Placeholder

### Purpose

Show email templates, send log, delivery state, bounce placeholder, and retry.

### Route

`/communication/email`

### Actions

- Send email placeholder.
- Retry failed email.
- Cancel queued email.
- Print email log.

### Safety Rules

- Real email integration is not included.
- Email recipient and template must be visible.
- Failed/bounced state requires reason placeholder.

### Acceptance

- Email delivery state is clear.
- Failed/bounced messages are visible.
- Template and recipient context is preserved.

## Page 24: WhatsApp Notification Placeholder

### Purpose

Show WhatsApp template, send log, delivery state, consent, and retry placeholders.

### Route

`/communication/whatsapp`

### Actions

- Send WhatsApp placeholder.
- Retry failed message.
- Cancel queued message.
- Print WhatsApp log.

### Safety Rules

- Real WhatsApp integration is not included.
- Consent and template approval status must be visible.
- Failed delivery reason must be shown.

### Acceptance

- WhatsApp workflow is represented safely.
- Consent and template approval are visible.
- Delivery logs are scannable.

## Page 25: Push Notification Placeholder

### Purpose

Show push notification templates, app audience, delivery state, and device placeholder.

### Route

`/communication/push`

### Actions

- Send push placeholder.
- Schedule push placeholder.
- Retry failed push.
- Print push log.

### Safety Rules

- Real push provider is not included.
- Audience and app role must be visible.
- Failed device delivery is placeholder only.

### Acceptance

- Push notification state is represented.
- Audience targeting is visible.
- Failed state is clear.

## Page 26: Communication Logs

### Purpose

Provide a unified log for SMS, email, WhatsApp, push, alerts, and emergency communications.

### Route

`/communication/logs`

### Filters

- Date range.
- Channel.
- Recipient type.
- Status.
- Template.
- Failed reason.
- Consent blocked.

### Table Columns

- Message ID.
- Channel.
- Recipient.
- Template.
- Sent by.
- Sent at.
- Status.
- Failure reason.
- Actions.

### Actions

- View message.
- Retry message.
- Cancel queued message.
- Print communication log.

### Safety Rules

- Message content is masked for unauthorized users.
- Retry requires permission placeholder.
- Consent-blocked state cannot be bypassed visually.
- Quiet-hour/DND blocked state cannot be bypassed visually except emergency alerts.

### Acceptance

- Communication history is searchable.
- Failed and blocked messages are clear.
- Audit context is visible.

## Page 27: Alert Management

### Purpose

Manage alert rules, recipients, severity, active state, trigger history, and escalation placeholders.

### Route

`/communication/alerts`

### Rule Fields

- Alert name.
- Module.
- Trigger condition placeholder.
- Severity.
- Recipients.
- Escalation rule placeholder.
- Active state.

### Actions

- Create alert rule.
- Activate/deactivate rule.
- Test alert placeholder.
- View trigger history.
- Print alert rules.

### Safety Rules

- High severity alert activation requires confirmation placeholder.
- Deactivation requires reason placeholder.
- Recipients and escalation path must be visible.

### Acceptance

- Alert rules are easy to review.
- Severity and escalation are clear.
- Trigger history is visible.

## Page 28: Emergency Alert System

### Purpose

Provide emergency broadcast UI with audience selection, severity, acknowledgement, and escalation placeholders.

### Route

`/communication/emergency-alerts`

### Sections

- Broadcast composer.
- Audience selector.
- Severity selector.
- Message preview.
- Recipient list.
- Acknowledgement tracker.
- Escalation status.
- Broadcast history.

### Actions

- Create emergency alert.
- Send broadcast placeholder.
- Cancel draft.
- Mark acknowledged.
- Escalate unacknowledged placeholder.
- Print emergency alert summary.

### Safety Rules

- Sending emergency alert requires confirmation.
- Severity and audience must be visible before send.
- Acknowledgement state must be visible.
- Escalation requires reason placeholder.

### Acceptance

- Emergency alert workflow is deliberate and clear.
- Acknowledgements are trackable.
- Escalation state is represented.

## Page 29: Reports Dashboard

### Purpose

Provide a central entry point for MIS, financial, clinical, operational, doctor performance, revenue, occupancy, audit, custom, and dashboard analytics.

### Route

`/reports`

### Summary Cards

- Reports available.
- Reports restricted.
- Exports pending.
- Scheduled reports placeholder.
- Recently generated.
- Custom reports saved.

### Widgets

- Favorite reports.
- Recent report activity.
- Report category list.
- Export queue placeholder.
- Role-based dashboard widgets.

### Quick Actions

- Open MIS report.
- Open financial report.
- Open custom builder.
- View audit report.
- Print report catalog.

### Acceptance

- Report categories are easy to navigate.
- Restricted and export pending states are visible.
- Dashboard avoids deep nested menus.

## Page 30: MIS Reports

### Purpose

Show hospital-wide summary reports for management.

### Route

`/reports/mis`

### Report Types

- Daily hospital summary.
- OPD/IPD summary.
- Department summary.
- Patient volume.
- Admission/discharge summary.
- Collection summary.
- Occupancy summary.

### Actions

- Apply filters.
- Preview report.
- Print report.
- Export placeholder.

### Safety Rules

- MIS data is static placeholder.
- Restricted drill-down follows role access.
- Date range and generated time must be visible.

### Acceptance

- MIS reports are scannable.
- Filters and preview are clear.
- Print/export placeholders are available.

## Page 31: Financial Reports

### Purpose

Show revenue, collection, outstanding, refunds, discount, payer, and cash summaries using Phase 10 patterns.

### Route

`/reports/financial`

### Report Types

- Revenue report.
- Collection report.
- Outstanding report.
- Refund report.
- Discount report.
- Payer report.
- Cash counter report.

### Safety Rules

- Financial report access is role-restricted.
- Patient-level financial details follow masking rules.
- Export is placeholder only.

### Acceptance

- Financial report categories align with Phase 10.
- Totals and filters are clear.
- Restricted data is protected.

## Page 32: Clinical Reports

### Purpose

Show clinical report placeholders for visits, diagnoses, procedures, outcomes, and department activity.

### Route

`/reports/clinical`

### Report Types

- OPD diagnosis summary.
- Procedure summary.
- Visit outcome placeholder.
- Prescription summary placeholder.
- Chronic disease summary placeholder.
- Lab/radiology activity summary.

### Safety Rules

- Clinical data is role-restricted.
- Patient identity is masked where required.
- Reports do not claim clinical analytics engine.

### Acceptance

- Clinical report placeholders are clear.
- Filters support department, doctor, date, and diagnosis.
- Privacy rules are represented.

## Page 33: Operational Reports

### Purpose

Show reports for appointments, queue, turnaround time, bed occupancy, support tasks, and service volumes.

### Route

`/reports/operational`

### Report Types

- Appointment report.
- Queue waiting time report.
- Bed movement report.
- Diagnostic turnaround report.
- Housekeeping task report.
- Complaint SLA report.
- Visitor movement report.

### Acceptance

- Operational bottlenecks are easy to spot.
- Report filters are consistent.
- Support department reports are included.

## Page 34: Doctor Performance Reports

### Purpose

Show doctor activity, consultation count, procedure count, revenue placeholder, ratings, and follow-up metrics.

### Route

`/reports/doctor-performance`

### Metrics

- Consultations.
- Procedures.
- Follow-ups.
- Patient feedback rating.
- Revenue placeholder.
- Average wait time.
- Report turnaround contribution placeholder.

### Safety Rules

- Doctor performance access is role-restricted.
- Revenue metrics reuse Phase 10 placeholder rules.
- Feedback details are masked where needed.

### Acceptance

- Doctor performance is scannable.
- Metrics are clearly placeholder where needed.
- Role restrictions are visible.

## Page 35: Revenue Analytics

### Purpose

Extend Phase 10 revenue views into management analytics dashboards.

### Route

`/reports/revenue-analytics`

### Views

- Department revenue.
- Doctor revenue.
- Service revenue.
- Payer revenue.
- Payment mode revenue.
- Trend placeholder.

### Acceptance

- Revenue charts are readable in all themes.
- Filters match Phase 10 revenue patterns.
- Export placeholder is explicit.

## Page 36: Bed Occupancy Analytics

### Purpose

Show ward/ICU occupancy, bed availability, discharge readiness, trends, and utilization placeholders.

### Route

`/reports/bed-occupancy`

### Views

- Current occupancy.
- Ward occupancy.
- ICU occupancy.
- Discharge pending.
- Bed turnover placeholder.
- Occupancy trend.

### Safety Rules

- Patient identity is masked unless permitted.
- Occupancy data reuses Phase 6 bed/ward patterns.
- Trend is static placeholder.

### Acceptance

- Bed utilization is clear.
- Ward/ICU breakdown is visible.
- Discharge readiness signal is represented.

## Page 37: Audit Reports

### Purpose

Show user activity, permission changes, sensitive access, report exports, and high-risk action logs.

### Route

`/reports/audit`

### Filters

- Date range.
- User.
- Role.
- Module.
- Action.
- Severity.
- Sensitive access.

### Table Columns

- Time.
- User.
- Role.
- Module.
- Action.
- Entity.
- IP/device placeholder.
- Severity.
- Actions.

### Actions

- View audit detail.
- Print audit report.
- Export audit placeholder.

### Safety Rules

- Audit logs are read-only.
- Sensitive audit details are role-restricted.
- Export requires reason placeholder.

### Acceptance

- Audit report is searchable.
- Sensitive access is visible.
- Read-only behavior is clear.

## Page 38: Custom Report Builder

### Purpose

Allow users to select fields, filters, grouping, sorting, preview, and export placeholder for custom reports.

### Route

`/reports/custom-builder`

### Sections

- Report name.
- Data source selector.
- Field picker.
- Filter builder.
- Grouping/sorting.
- Preview table.
- Save/share placeholder.
- Export placeholder.

### Actions

- Create report.
- Add field.
- Add filter.
- Preview report.
- Save report.
- Share report placeholder.
- Export placeholder.

### Safety Rules

- Restricted fields must be disabled or masked.
- Sharing requires role selection placeholder.
- Export requires permission and reason placeholder.

### Acceptance

- Builder is keyboard friendly.
- Preview updates without full page reload.
- Restricted fields are clear.

## Page 39: Scheduled Reports

### Purpose

Represent scheduled report setup, recipients, delivery channel, next run, and failure placeholders.

### Route

`/reports/schedules`

### Sections

- Schedule list.
- Report selector.
- Frequency.
- Recipient list.
- Delivery channel.
- Last run.
- Next run.
- Failure state.

### Actions

- Create schedule placeholder.
- Pause schedule.
- Resume schedule.
- Run now placeholder.
- Print schedule summary.

### Safety Rules

- Scheduled exports are placeholder only.
- Restricted reports require role-aware recipient validation placeholder.
- Schedule failure reason must be visible.
- Pausing/resuming schedule requires permission placeholder.

### Acceptance

- Scheduled report setup is represented without claiming real delivery.
- Recipient and access restrictions are visible.
- Next run and failure states are clear.

## Page 40: Dashboard Analytics

### Purpose

Provide executive dashboards with role-wise widgets, saved views, and static analytics cards.

### Route

`/reports/dashboard-analytics`

### Widgets

- Hospital overview.
- Patient volume.
- Revenue summary.
- Bed occupancy.
- OPD/IPD trends.
- Doctor performance.
- Claims and receivables.
- Complaints and feedback.
- Staff attendance.
- Communication failures.

### Actions

- Change dashboard view.
- Save view placeholder.
- Print dashboard.
- Export dashboard placeholder.

### Safety Rules

- Role-based widgets must respect access rules.
- Restricted widgets show locked/restricted state.
- Export is placeholder only.

### Acceptance

- Dashboard is useful without deep navigation.
- Widgets are role-aware.
- Charts remain readable in all themes.

## Static Data Requirements

Phase 11 should add or expand static data files.

Recommended data:

- `mockHrmsDashboard`.
- `mockEmployees`.
- `mockEmployeeProfiles`.
- `mockEmployeeDocuments`.
- `mockAttendanceRecords`.
- `mockAttendanceCorrections`.
- `mockShiftRosters`.
- `mockShiftSwapRequests`.
- `mockLeaveRequests`.
- `mockLeaveBalances`.
- `mockPayrollRuns`.
- `mockSalaryStructures`.
- `mockRecruitmentJobs`.
- `mockRecruitmentCandidates`.
- `mockAppraisalCycles`.
- `mockAppraisalReviews`.
- `mockTrainingCourses`.
- `mockTrainingAttendance`.
- `mockAdministrationDashboard`.
- `mockFrontOfficeServiceRequests`.
- `mockReceptionCounters`.
- `mockReceptionQueue`.
- `mockHousekeepingTasks`.
- `mockLaundryRequests`.
- `mockCafeteriaMenu`.
- `mockCafeteriaOrders`.
- `mockVisitors`.
- `mockSecurityEntries`.
- `mockSecurityIncidents`.
- `mockComplaints`.
- `mockFeedback`.
- `mockCommunicationDashboard`.
- `mockNotificationTemplates`.
- `mockSmsLogs`.
- `mockEmailLogs`.
- `mockWhatsAppLogs`.
- `mockPushLogs`.
- `mockCommunicationLogs`.
- `mockAlertRules`.
- `mockAlertEvents`.
- `mockEmergencyAlerts`.
- `mockReportsDashboard`.
- `mockMisReports`.
- `mockFinancialReports`.
- `mockClinicalReports`.
- `mockOperationalReports`.
- `mockDoctorPerformanceReports`.
- `mockRevenueAnalytics`.
- `mockBedOccupancyAnalytics`.
- `mockAuditReports`.
- `mockCustomReports`.
- `mockScheduledReports`.
- `mockDashboardAnalytics`.
- `mockPhase11AuditEvents`.

Employee fields:

- `id`.
- `employeeCode`.
- `name`.
- `roleId`.
- `departmentId`.
- `employmentType`.
- `joiningDate`.
- `mobile`.
- `email`.
- `status`.
- `onboardingStatus`.
- `offboardingStatus`.
- `documentStatus`.

Attendance fields:

- `id`.
- `employeeId`.
- `date`.
- `shiftId`.
- `inTime`.
- `outTime`.
- `workedHours`.
- `status`.
- `exception`.
- `correctionStatus`.

Shift fields:

- `id`.
- `departmentId`.
- `date`.
- `shiftName`.
- `startTime`.
- `endTime`.
- `requiredStaff`.
- `assignedEmployeeIds`.
- `status`.

Leave fields:

- `id`.
- `employeeId`.
- `leaveType`.
- `fromDate`.
- `toDate`.
- `days`.
- `balanceBefore`.
- `reason`.
- `status`.
- `approvedBy`.

Support task fields:

- `id`.
- `taskNo`.
- `module`.
- `location`.
- `priority`.
- `assignedTo`.
- `dueAt`.
- `status`.
- `createdAt`.

Visitor fields:

- `id`.
- `passNo`.
- `visitorName`.
- `mobile`.
- `idProofType`.
- `idProofMasked`.
- `hostType`.
- `hostId`.
- `purpose`.
- `checkInAt`.
- `expectedCheckOutAt`.
- `checkOutAt`.
- `passValidUntil`.
- `status`.

Communication log fields:

- `id`.
- `channel`.
- `recipientType`.
- `recipientId`.
- `templateId`.
- `status`.
- `failureReason`.
- `consentRequired`.
- `quietHourBlocked`.
- `sentBy`.
- `sentAt`.

Report fields:

- `id`.
- `reportCode`.
- `name`.
- `category`.
- `description`.
- `restricted`.
- `lastGeneratedAt`.
- `status`.

Scheduled report fields:

- `id`.
- `reportId`.
- `frequency`.
- `recipientRoleIds`.
- `deliveryChannel`.
- `lastRunAt`.
- `nextRunAt`.
- `failureReason`.
- `status`.

Audit report fields:

- `id`.
- `timestamp`.
- `userId`.
- `roleId`.
- `module`.
- `action`.
- `entityType`.
- `entityId`.
- `ipAddressPlaceholder`.
- `devicePlaceholder`.
- `severity`.
- `sensitiveAccess`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Employee code, name, role, department, and joining date required.
- Employee status change reason required.
- Onboarding completion requires mandatory document and training readiness placeholder.
- Offboarding requires handover owner, asset/document return, final payroll status, and access revocation placeholder.
- Attendance correction reason required.
- Attendance correction approval/rejection reason required.
- Shift date, department, start time, end time, and required staff required.
- Shift publish confirmation required.
- Shift swap reason and approval reason required.
- Leave type, date range, and reason required.
- Leave approval/rejection reason required.
- Payroll approval/hold reason required.
- Candidate name, position, stage, and owner required.
- Candidate rejection reason required.
- Appraisal finalization confirmation required.
- Training course, date, participant list, and owner required.
- Staff document type, employee, and expiry date required where applicable.
- Reception handoff requires target department, owner, and reason placeholder.
- Visitor name, mobile, ID proof placeholder, purpose, host, and expected checkout required.
- Visitor blocklist reason required.
- Security incident severity, location, reporter, and description required.
- Complaint category, priority, owner, due date, and description required.
- Complaint resolution/reopen reason required.
- Feedback rating, category, and source required.
- Communication template name, channel, audience, and body required.
- Non-emergency communication requires consent/quiet-hour rule state.
- Communication retry requires permission placeholder.
- Alert rule name, module, severity, recipients, and active state required.
- Emergency alert severity, audience, message, and confirmation required.
- Report date range required.
- Custom report name, data source, at least one field, and role access required.
- Scheduled report requires report, frequency, recipients, delivery channel, and next run placeholder.
- Report export reason required for restricted reports.

Validation UI:

- Inline field error.
- Approval warning panel.
- Staff/patient privacy warning.
- Communication consent warning.
- Emergency alert confirmation panel.
- Report restricted-field warning.
- Disabled action where required fields are missing.
- Confirmation for high-impact actions.

## Accessibility Requirements

Required:

- Worklists have clear table headers.
- Status is not color-only.
- Expiry, failed communication, emergency, overdue, and restricted states have text labels.
- Attendance grid and shift roster are keyboard navigable.
- Report filters and custom builder controls are keyboard accessible.
- Drawers trap focus and return focus after close.
- Print/export warnings are screen-reader readable.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Staff search, patient/visitor search, filters, tabs, drawers, roster grids, support task rows, communication logs, alert rules, report previews, and custom report builder work without mouse.

## Performance Requirements

Even with static data:

- Worklists should render efficiently.
- Do not load all employee, attendance, communication, report, or audit details by default.
- Lazy render large detail drawers where useful.
- Keep staff/patient/report header stable to avoid layout shift.
- Use skeletons for loading-looking states.
- Dense attendance, shift, communication, audit, and report tables should use internal scroll areas.
- Charts should use responsive containers with stable heights.

## Page State Requirements

Each Phase 11 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Employee active/inactive/suspended placeholder state.
- Employee onboarding/offboarding pending state.
- Document expired/near-expiry state.
- Attendance correction pending/approved/rejected state.
- Shift short-staffed/swap-requested state.
- Leave pending/approved/rejected/insufficient balance state.
- Payroll review/hold state.
- Candidate interview/offer/rejected state.
- Appraisal review/finalized state.
- Training due/completed state.
- Housekeeping delayed/reopened state.
- Laundry lost/damaged state.
- Cafeteria diet warning state.
- Visitor checked-in/overstay/blocklisted state.
- Reception queue waiting/handoff state.
- Security incident open/resolved state.
- Complaint overdue/resolved/reopened state.
- Feedback low-rating/escalated state.
- Communication queued/sent/failed/retrying/consent-blocked state.
- Communication quiet-hour/DND blocked state.
- Alert active/triggered/escalated/resolved state.
- Emergency alert active/acknowledged/escalated state.
- Report ready/no-data/restricted/export-pending state.
- Custom report restricted-field state.
- Scheduled report paused/failed/next-run state.
- Access denied state.
- Read-only state.

## Phase 11 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HRMS dashboard | Required | Required | Required | Required | Required | Required | Required |
| Employee management | Required | Required | Required | Required | Required | Required | Required |
| Attendance management | Required | Required | Required | Required | Required | Required | Required |
| Shift management | Required | Required | Required | Required | Required | Required | Required |
| Leave management | Required | Required | Required | Required | Required | Required | Required |
| Payroll placeholder | Required | Required | Required | Required | Required | Required | Required |
| Recruitment management | Required | Required | Required | Required | Required | Required | Required |
| Appraisal management | Required | Required | Required | Required | Required | Required | Required |
| Training management | Required | Required | Required | Required | Required | Required | Required |
| Staff documents | Required | Required | Required | Required | Required | Required | Required |
| Administration dashboard | Required | Required | Required | Required | Required | Required | Required |
| Front office and reception administration | Required | Required | Required | Required | Required | Required | Required |
| Housekeeping management | Required | Required | Required | Required | Required | Required | Required |
| Laundry management | Required | Required | Required | Required | Required | Required | Required |
| Cafeteria management | Required | Required | Required | Required | Required | Required | Required |
| Visitor management | Required | Required | Required | Required | Required | Required | Required |
| Security desk | Required | Required | Required | Required | Required | Required | Required |
| Complaint management | Required | Required | Required | Required | Required | Required | Required |
| Feedback management | Required | Required | Required | Required | Required | Required | Required |
| Communication dashboard | Required | Required | Required | Required | Required | Required | Required |
| Notification templates | Required | Required | Required | Required | Required | Required | Required |
| SMS gateway placeholder | Required | Required | Required | Required | Required | Required | Required |
| Email notification placeholder | Required | Required | Required | Required | Required | Required | Required |
| WhatsApp notification placeholder | Required | Required | Required | Required | Required | Required | Required |
| Push notification placeholder | Required | Required | Required | Required | Required | Required | Required |
| Communication logs | Required | Required | Required | Required | Required | Required | Required |
| Alert management | Required | Required | Required | Required | Required | Required | Required |
| Emergency alert system | Required | Required | Required | Required | Required | Required | Required |
| Reports dashboard | Required | Required | Required | Required | Required | Required | Required |
| MIS reports | Required | Required | Required | Required | Required | Required | Required |
| Financial reports | Required | Required | Required | Required | Required | Required | Required |
| Clinical reports | Required | Required | Required | Required | Required | Required | Required |
| Operational reports | Required | Required | Required | Required | Required | Required | Required |
| Doctor performance reports | Required | Required | Required | Required | Required | Required | Required |
| Revenue analytics | Required | Required | Required | Required | Required | Required | Required |
| Bed occupancy analytics | Required | Required | Required | Required | Required | Required | Required |
| Audit reports | Required | Required | Required | Required | Required | Required | Required |
| Custom report builder | Required | Required | Required | Required | Required | Required | Required |
| Scheduled reports | Required | Required | Required | Required | Required | Required | Required |
| Dashboard analytics | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 11 does not need real export files, but UI should reserve production actions.

Required:

- Print employee profile summary placeholder.
- Print attendance sheet placeholder.
- Print shift roster placeholder.
- Print leave summary placeholder.
- Print payslip placeholder.
- Print candidate summary placeholder.
- Print appraisal summary placeholder.
- Print training attendance placeholder.
- Print staff document expiry report placeholder.
- Print front office desk summary placeholder.
- Print reception queue summary placeholder.
- Print housekeeping task sheet placeholder.
- Print laundry slip placeholder.
- Print cafeteria order slip placeholder.
- Print visitor pass placeholder.
- Print security log placeholder.
- Print complaint report placeholder.
- Print feedback report placeholder.
- Print communication log placeholder.
- Print alert rule summary placeholder.
- Print emergency alert summary placeholder.
- Print MIS report placeholder.
- Print financial report placeholder.
- Print clinical report placeholder.
- Print operational report placeholder.
- Print doctor performance report placeholder.
- Print revenue analytics placeholder.
- Print bed occupancy analytics placeholder.
- Print audit report placeholder.
- Print custom report preview placeholder.
- Print scheduled report summary placeholder.
- Print dashboard analytics placeholder.
- Export attendance placeholder.
- Export staff list placeholder.
- Export communication logs placeholder.
- Export report placeholder.
- Export custom report placeholder.
- Export scheduled report placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Sensitive identifiers remain masked where required.

## Operational Metrics Placeholders

Recommended metrics:

- Active employees.
- Present today.
- Absent today.
- Late punches.
- Leave pending.
- Shift gaps.
- Payroll review pending.
- Documents expiring.
- Onboarding/offboarding pending.
- Candidates in pipeline.
- Training due.
- Housekeeping pending.
- Laundry pending.
- Cafeteria orders pending.
- Visitors inside.
- Reception queue waiting.
- Visitor overstays.
- Security incidents open.
- Complaints overdue.
- Feedback average rating.
- Messages sent today.
- Failed communications.
- Consent-blocked communications.
- Quiet-hour/DND blocked communications.
- Active alert rules.
- Emergency acknowledgements pending.
- MIS reports generated.
- Restricted reports accessed.
- Export pending.
- Scheduled reports failed.
- Audit risk events.
- Custom reports saved.

These metrics use static data in Phase 11 and later feed final analytics and compliance phases.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3/4/5/6/7/8/9/10 shared patterns are ready.
2. Add HRMS, administration, communication, and reports navigation entries.
3. Add Phase 11 static data files.
4. Build HRMS dashboard.
5. Build employee management.
6. Build attendance management.
7. Build shift management.
8. Build leave management.
9. Build payroll placeholder.
10. Build recruitment management.
11. Build appraisal management.
12. Build training management.
13. Build staff documents.
14. Build administration dashboard.
15. Build front office and reception administration.
16. Build housekeeping management.
17. Build laundry management.
18. Build cafeteria management.
19. Build visitor management.
20. Build security desk.
21. Build complaint management.
22. Build feedback management.
23. Build communication dashboard.
24. Build notification templates.
25. Build SMS gateway placeholder.
26. Build email notification placeholder.
27. Build WhatsApp notification placeholder.
28. Build push notification placeholder.
29. Build communication logs.
30. Build alert management.
31. Build emergency alert system.
32. Build reports dashboard.
33. Build MIS reports.
34. Build financial reports.
35. Build clinical reports.
36. Build operational reports.
37. Build doctor performance reports.
38. Build revenue analytics.
39. Build bed occupancy analytics.
40. Build audit reports.
41. Build custom report builder.
42. Build scheduled reports placeholder.
43. Build dashboard analytics.
44. Add audit/timeline handoff placeholders.
45. Add role visibility and access denied states.
46. Verify light, dark, system, dynamic preset, and custom color themes.
47. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
48. Polish validation, keyboard behavior, loading states, empty states, print-safe views, charts, and report restrictions.

## Production-Grade Acceptance Checklist

Phase 11 is complete when:

- HRMS dashboard shows attendance, leave, shift, payroll, document, recruitment, and training exceptions.
- Employee management supports list, profile, employment, department/role, onboarding, offboarding, documents, attendance summary, leave summary, training, audit, and status change placeholders.
- Attendance management supports daily/monthly/department views, exceptions, correction requests, approval/rejection, and print.
- Shift management supports roster, department schedule, staffing gaps, swap requests, published state, and print.
- Leave management supports request, approval, rejection, balance, department calendar, and print.
- Payroll placeholder supports payroll run, salary structure, attendance inputs, deductions, approval, hold, and payslip preview without claiming real calculation.
- Recruitment supports job openings, candidate pipeline, interview scheduling, offer placeholder, rejection reason, and employee conversion placeholder.
- Appraisal supports cycles, self/manager review placeholders, ratings, finalization, and print.
- Training supports calendar, participants, attendance, completion, due alerts, and certificate placeholder.
- Staff documents support expiry alerts, verification, rejection, renewal required, restricted access, and expiry report.
- Administration dashboard shows housekeeping, laundry, cafeteria, visitors, security, complaints, feedback, and front-office task states.
- Front office and reception administration supports desk/counter allocation, reception queue, service requests, reassignment, resolution, handoff queue, and counter open/close placeholders.
- Housekeeping supports task list, ward/room board, assignment, delayed state, infection/isolation warnings, completion, reopen, and print.
- Laundry supports request, collection, processing, delivery, lost/damaged state, infectious linen warning, and print.
- Cafeteria supports menu, orders, patient diet warning placeholder, delivery, cancellation, billing placeholder, and print.
- Visitor management supports registration, ID proof placeholder, pass validity, pass print, patient/staff mapping, check-in/out, overstay, extension, and blocklist placeholder.
- Security desk supports gate entry, visitor/staff movement, incidents, action assignment, resolution, and print.
- Complaint management supports complaint queue, priority, owner, due date, SLA overdue, notes, resolution, reopen, and print.
- Feedback management supports ratings, categories, response queue, escalation, closure, and print.
- Communication dashboard shows queued, sent, failed, retrying, consent-blocked, template, alert, and emergency states.
- Notification templates support SMS/email/WhatsApp/push channels, variables, consent requirement, quiet-hour/DND rule, preview, active/inactive state, and print.
- SMS, email, WhatsApp, and push pages show provider placeholder, send log, failed delivery, retry, cancel, consent, and print states.
- Communication logs support unified channel history, filters, failed reason, consent blocked state, retry, cancel, and masking.
- Alert management supports rules, severity, recipients, escalation, activation/deactivation, test placeholder, trigger history, and print.
- Emergency alert system supports broadcast, audience, severity, preview, acknowledgement, escalation, history, confirmation, and print.
- Reports dashboard provides low-click access to MIS, financial, clinical, operational, doctor performance, revenue, bed occupancy, audit, custom builder, and dashboard analytics.
- MIS reports support hospital, OPD/IPD, department, patient volume, admission/discharge, collection, and occupancy summaries.
- Financial reports reuse Phase 10 patterns for revenue, collection, outstanding, refunds, discounts, payer, and cash counter summaries.
- Clinical reports support diagnosis, procedure, visits, outcomes, prescription, chronic disease, and diagnostic activity placeholders with privacy.
- Operational reports support appointments, queue wait time, bed movement, diagnostic TAT, housekeeping, complaints, and visitor movement.
- Doctor performance reports support consultations, procedures, follow-ups, feedback, revenue placeholder, wait time, and role restrictions.
- Revenue analytics and bed occupancy analytics are readable, filterable, theme-safe, and explicit as static placeholders.
- Audit reports support actor, role, module, action, entity, timestamp, IP/device placeholder, severity, sensitive access, and read-only detail.
- Custom report builder supports data source, field picker, filters, grouping, sorting, preview, restricted fields, save/share, and export placeholder.
- Scheduled reports support report selection, frequency, recipients, delivery channel, next run, paused state, failed state, and access validation placeholder.
- Dashboard analytics supports role-wise widgets, saved view placeholder, print, export placeholder, and restricted widget states.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky staff/patient/department/report headers and sticky actions do not cover content.
- Patient privacy, masking, access denied, audit, print/export, and report restrictions from earlier phases are reused.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, rosters, attendance grids, task lists, communication logs, alert rules, report previews, and custom report builder.
- Static data is organized for future HRMS, payroll, biometric, administration, communication provider, alerting, reporting, BI, compliance, and analytics integrations.

## Handoff Notes For Phase 12

Phase 12 can begin after Phase 11 provides:

- HRMS staff, attendance, shift, leave, payroll placeholder, recruitment, appraisal, training, and document patterns.
- Administration support task patterns for front office, housekeeping, laundry, cafeteria, visitors, security, complaints, and feedback.
- Communication template, channel log, failed delivery, consent, quiet-hour/DND, alert rule, and emergency broadcast patterns.
- Reports dashboard, MIS, financial, clinical, operational, doctor performance, revenue, occupancy, audit, custom builder, and dashboard analytics patterns.
- Role-aware access, masking, print/export, and audit patterns across support operations and reports.

Phase 12 should then focus on integrations, compliance, mobile, AI, and final optimization: API management, HL7/FHIR, ABHA, payment gateway, SMS/WhatsApp API, PACS, LIS device, ERP, security/compliance hardening, audit trail consolidation, access control, session/device/IP management, activity monitoring, backup/disaster recovery, consent tracking, data encryption, mobile role views, remote monitoring, AI clinical assistant placeholders, voice prescription placeholders, AI radiology assistance placeholders, predictive analytics, smart alerts, clinical decision support, and final responsive/performance/accessibility QA.
