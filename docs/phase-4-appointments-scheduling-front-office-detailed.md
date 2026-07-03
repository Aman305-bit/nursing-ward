# Phase 4 Detailed Document: Appointments, Scheduling, Queue, And Front Office

## Phase Goal

Build the production-grade UI screens for appointment management, doctor scheduling, calendar management, queue management, token management, follow-up management, teleconsultation placeholders, and front office/reception workflows.

This phase is UI-only and uses static data. It should feel ready for high-volume reception and OPD operations, but no backend, real-time socket, SMS/WhatsApp integration, payment integration, video call integration, or appointment database is required in this phase.

## Dependency On Previous Phases

Phase 4 must use the foundations from Phases 1, 2, and 3.

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
- Confirmation pattern for high-risk actions.
- User, role, department, doctor, and hospital static data.

Required Phase 3 patterns:

- Patient search and quick view.
- Patient profile header.
- Patient alert display.
- Patient visit history summary.
- Consent status pattern.
- Duplicate patient warning.
- Emergency/unknown patient status.

Important rule:

All Phase 4 screens must follow the Phase 1 theme and responsive system. Do not create separate appointment colors, queue layouts, calendar controls, buttons, tables, forms, or drawers outside the shared design system.

## Phase 4 Scope

Phase 4 covers:

- Appointment list and appointment management.
- Appointment booking form.
- Reschedule and cancel appointment flows.
- Doctor scheduling.
- Doctor availability.
- Calendar management.
- Queue management.
- Token management.
- Token display board placeholder.
- Follow-up management.
- Teleconsultation UI placeholder.
- Front office and reception management.
- Patient check-in.
- Walk-in registration handoff.
- Enquiry management placeholder.
- Visitor direction placeholder.
- Appointment conflict detection UI.
- No-show and late-arrival handling UI.
- Appointment reschedule/cancel safety rules.
- Room, counter, and capacity display placeholders.
- Queue priority and waiting-time indicators.

Phase 4 does not cover:

- Real appointment database.
- Real-time queue updates.
- Real video call integration.
- SMS/WhatsApp reminder delivery.
- Payment collection or billing.
- OPD consultation.
- Doctor clinical notes.
- Real patient portal appointment booking.
- Real device token display hardware.
- Real room/counter device integration.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/appointments` | Appointment management | Search, filter, book, reschedule, cancel, and check in appointments. |
| `/appointments/book` | Book appointment | Appointment booking form for existing or new patient handoff. |
| `/appointments/calendar` | Calendar management | Day, week, month, and doctor-wise calendar views. |
| `/appointments/schedules` | Doctor scheduling | Doctor availability, slots, leaves, and schedule templates. |
| `/appointments/queue` | Queue management | OPD queue by department, doctor, counter, and status. |
| `/appointments/tokens` | Token management | Token issue, call, skip, hold, complete, and board preview. |
| `/appointments/follow-ups` | Follow-up management | Due follow-ups, reminders, and follow-up booking. |
| `/appointments/teleconsultation` | Teleconsultation placeholder | Virtual appointment workflow placeholder. |
| `/front-office` | Front office dashboard | Reception work surface for check-in, enquiry, queue, and quick actions. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(app)/appointments` | Appointment and scheduling pages | Main HMS app shell from Phase 1. |
| `(app)/front-office` | Reception/front-office pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 4 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for token slips, appointment lists, and front-office summaries.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Appointment, queue, token, follow-up, and teleconsultation statuses must use shared status tokens.
- Never hardcode page-level colors.
- Calendar events must remain readable in every theme.
- Token board must work in light and dark modes.
- Print views should use Phase 1 print-safe light theme.

### Responsive Requirements

All Phase 4 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone screens use single-column forms and full-screen drawers.
- Tablet screens can use two-column forms and split queue views.
- Laptop and desktop screens can use table plus detail drawer and calendar split views.
- Wide desktop screens can show queue, doctor availability, and appointment detail together.
- No page-level horizontal scroll.
- Dense appointment tables and calendars may scroll inside their own containers.
- Sticky headers and sticky actions must not cover forms, queues, or calendar content.
- Touch targets must be large enough for reception tablets.

### Operational Workflow Pattern

Phase 4 screens should prioritize speed.

Required:

- Sticky page header with date, department, doctor, and search/filter context.
- Quick patient search from booking and check-in screens.
- Patient summary strip after patient selection.
- Low-click status actions such as check in, call, skip, hold, complete, reschedule, cancel.
- Drawer-based appointment detail and queue detail.
- Keyboard-friendly search and actions.
- Clear status colors and labels.
- Compact lists with visible next action.

Avoid:

- Long booking pages.
- Deep menus.
- Multiple popup chains.
- Hidden primary actions.
- Full page reloads for status changes.

## Appointment And Queue Status Standards

### Appointment Statuses

- Scheduled.
- Confirmed.
- Checked in.
- Waiting.
- In consultation.
- Completed.
- Rescheduled.
- Cancelled.
- No-show.
- Late.
- Follow-up due.

### Queue Statuses

- Waiting.
- Called.
- In consultation.
- On hold.
- Skipped.
- Completed.
- Cancelled.

### Token Statuses

- Issued.
- Called.
- Serving.
- Skipped.
- Held.
- Completed.
- Expired.

### Teleconsultation Statuses

- Scheduled.
- Link pending.
- Ready to join.
- Waiting online.
- In call placeholder.
- Completed.
- Cancelled.
- Failed/no-show.

Status rules:

- Status must use both text and color/icon.
- Cancelled, no-show, skipped, and expired states must not be confused.
- Emergency/walk-in patients must be visually distinct.
- Patient alerts from Phase 3 must remain visible in appointment and queue views.
- Late and no-show rules must be visually separate from cancelled status.
- Priority and emergency cases must not be hidden in normal waiting lists.

## Operational Safety Rules

Phase 4 changes the patient flow for the day. The UI must make operational consequences visible.

High-impact actions:

- Cancel appointment.
- Reschedule appointment.
- Mark no-show.
- Mark late.
- Override full slot.
- Check in without appointment.
- Skip queue entry.
- Hold queue entry.
- Move queue position.
- Reprint token.
- Complete queue entry.

Required behavior:

- Use confirmation drawer or inline confirmation for high-impact actions.
- Require reason placeholder for cancel, reschedule, no-show, skip, hold, and override.
- Show affected patient, UHID, doctor, department, date, and time inside confirmation.
- Show future audit note for operational changes.
- Avoid multiple popup chains.
- Show success/failure placeholder state after action.

## Waiting Time And Priority Rules

Queue and reception screens should expose waiting pressure clearly.

Required indicators:

- Waiting time.
- Appointment time.
- Check-in time.
- Token issued time.
- Priority: routine, urgent, emergency, VIP placeholder.
- Late arrival indicator.
- Overdue waiting indicator.
- Doctor delay placeholder.

Recommended thresholds:

- Normal waiting.
- Approaching delay.
- Delayed.
- Critical delay.

These thresholds are static placeholders in Phase 4.

## Role Visibility Rules

Suggested static access:

| Role | Access |
| --- | --- |
| Super Admin | All Phase 4 screens. |
| Hospital Admin | Appointment, schedule, queue, token, front-office screens. |
| Receptionist | Book, reschedule, cancel, check in, issue token, manage queue. |
| Doctor | View schedule, appointment list, queue, teleconsultation placeholder, follow-ups. |
| Nurse | View queue, patient status, token status, follow-up list. |
| Billing Executive | View checked-in patients and quick billing placeholder. |
| Management | Read-only appointment, queue, and front-office dashboards. |

Access behavior:

- Unauthorized users see access denied inside the app shell.
- Read-only users can view records but cannot save or change status.
- Disabled actions should explain required permission.

## Page 1: Appointment Management

### Purpose

Provide a central page for managing all appointments across departments and doctors.

### Route

`/appointments`

### Page Header

Title: `Appointments`

Primary action:

- Book appointment.

Secondary actions:

- Calendar view.
- Queue view.
- Export placeholder.
- Print appointment list placeholder.

### Summary Cards

- Appointments today.
- Confirmed.
- Checked in.
- Waiting.
- Completed.
- Cancelled/no-show.
- Teleconsultations.

### Filters

- Date.
- Date range.
- Department.
- Doctor.
- Appointment status.
- Visit type.
- Patient search.
- Token status.
- Teleconsultation only.

### Table Columns

- Time.
- Token.
- Patient.
- UHID.
- Age/gender.
- Department.
- Doctor.
- Visit type.
- Status.
- Payment status placeholder.
- Actions.

### Row Actions

- View detail.
- Check in.
- Reschedule.
- Cancel.
- Issue token.
- Print slip.
- Mark late.
- Mark no-show.
- Start teleconsultation placeholder.

### Appointment Detail Drawer

Tabs:

- Summary.
- Patient.
- Appointment.
- Queue.
- Communication.
- Audit.

Summary:

- Appointment number.
- Date/time.
- Status.
- Department.
- Doctor.
- Patient alerts.

Patient:

- Patient summary from Phase 3.
- Contact details.
- Visit history summary.
- Consent status.

Appointment:

- Visit type.
- Reason.
- Source.
- Priority.
- Notes.

Queue:

- Token number.
- Queue status.
- Counter/room.
- Estimated waiting time placeholder.

Communication:

- Reminder status placeholder.
- SMS/WhatsApp/email log placeholder.

Audit:

- Created by.
- Rescheduled by.
- Cancelled by.
- Status history.

### Reschedule Rules

- Reschedule requires reason placeholder.
- Original appointment time remains visible in drawer history.
- New doctor/date/slot must pass conflict check.
- Reschedule should show whether token/queue status needs reset.
- Patient notification placeholder should be visible.

### Cancel And No-Show Rules

- Cancel requires reason placeholder.
- No-show requires confirmation.
- Cancellation after check-in should warn about queue/token impact.
- Cancelled appointments should not appear in active queue.
- No-show appointments remain visible in history and reports.

### Acceptance

- Appointment list is easy to scan.
- Common actions are low-click.
- Patient alerts are visible.
- Detail drawer works across devices.
- Theme and status states work in all modes.
- Reschedule, cancel, late, and no-show states are clearly represented.

## Page 2: Appointment Booking

### Purpose

Create a fast appointment booking flow for reception and front office.

### Route

`/appointments/book`

### Layout

Use a step-based or tab-based form with sticky actions.

Recommended steps:

- Patient.
- Visit details.
- Doctor & slot.
- Confirmation.

Sticky actions:

- Save appointment.
- Save and check in.
- Save and issue token.
- Cancel.

### Patient Step

Fields/actions:

- Search existing patient.
- Open patient quick view.
- Register new patient shortcut.
- Emergency/unknown patient shortcut.
- Patient summary strip.
- Duplicate warning from Phase 3 when relevant.

### Visit Details Step

Fields:

- Department.
- Visit type.
- Appointment type: regular, walk-in, emergency, teleconsultation.
- Priority.
- Reason for visit.
- Referral source placeholder.
- Notes.

### Doctor & Slot Step

Fields:

- Doctor.
- Date.
- Available slot.
- Duration.
- Room/counter placeholder.

Slot states:

- Available.
- Booked.
- Blocked.
- Overbook allowed placeholder.
- Doctor unavailable.
- Leave/holiday.

### Confirmation Step

Show:

- Patient summary.
- Appointment summary.
- Token preview placeholder.
- Reminder preference placeholder.
- Consent requirement for teleconsultation placeholder.

### Conflict Detection UI

Show warnings for:

- Patient already has appointment same day.
- Doctor slot already booked.
- Doctor unavailable.
- Appointment overlaps blocked time.
- Teleconsultation consent missing.
- Room/counter capacity reached.
- Patient has active queue entry.
- Patient has unresolved duplicate warning.

Actions:

- Choose another slot.
- Continue with override placeholder.
- Cancel booking.
- Add to waitlist placeholder.

### Validation Rules

- Patient required.
- Department required.
- Doctor required.
- Date and slot required.
- Visit type required.
- Teleconsultation requires consent placeholder.
- Override requires reason placeholder.

### Responsive Behavior

Phone:

- Single-column stepper.
- Slot list becomes cards.
- Sticky bottom actions.

Tablet/Desktop:

- Patient search and slot selection can use split layout.
- Calendar/slot grid can sit beside booking summary.

### Acceptance

- Booking can be completed with low clicks.
- Slot conflicts are visible.
- Patient context remains visible.
- Sticky actions are always reachable.

## Page 3: Doctor Scheduling

### Purpose

Manage doctor availability, slots, leaves, blocked times, and schedule templates.

### Route

`/appointments/schedules`

### Page Header

Title: `Doctor Scheduling`

Primary action:

- Add schedule.

Secondary actions:

- Apply template.
- Block time.
- Print schedule placeholder.

### Tabs

- Schedules.
- Availability.
- Leaves & blocks.
- Templates.
- Rooms.
- Capacity.

### Schedule Table Columns

- Doctor.
- Department.
- Day.
- Start time.
- End time.
- Slot duration.
- Room.
- Max patients.
- Status.
- Actions.

### Availability View

Show:

- Doctor-wise availability.
- Department-wise availability.
- Today schedule.
- Upcoming unavailable dates.

### Leaves & Blocks

Fields:

- Doctor.
- Date/date range.
- Start/end time.
- Reason.
- Block type: leave, meeting, surgery, emergency, holiday.
- Affected appointments count placeholder.
- Suggested reschedule action placeholder.

### Templates

Fields:

- Template name.
- Department.
- Days.
- Time range.
- Slot duration.
- Max patients.
- Default room.

### Rooms And Capacity

Fields:

- Room/counter name.
- Department.
- Doctor assignment.
- Capacity per slot.
- Current load placeholder.
- Active/inactive status.
- Equipment/room note placeholder.

Capacity warnings:

- Room already assigned.
- Counter unavailable.
- Capacity exceeded.
- Doctor-room mismatch.

### Acceptance

- Schedule setup supports recurring-looking static data.
- Blocked/unavailable times are clear.
- Affected appointment warning is visible.
- Future real scheduling rules are prepared.
- Room and capacity constraints are visible as placeholders.

## Page 4: Calendar Management

### Purpose

Show appointments in calendar format for reception, doctors, and management.

### Route

`/appointments/calendar`

### Views

- Day.
- Week.
- Month.
- Doctor.
- Department.
- Room.

### Calendar Controls

- Date picker.
- Today.
- Previous/next.
- Department filter.
- Doctor filter.
- Status filter.
- View switcher.
- Time scale selector placeholder.
- Show cancelled/no-show toggle.

### Event Card Content

- Time.
- Patient name.
- UHID.
- Doctor.
- Status.
- Visit type.
- Alert icon when patient has alert.

### Event Detail Drawer

Use appointment detail drawer from Page 1.

### Responsive Behavior

Phone:

- Calendar defaults to agenda/day list.
- Month view can show compact dots and count.
- Event drawer becomes full-screen.

Tablet/Desktop:

- Day/week/month views available.
- Calendar content scrolls inside calendar area.

### Acceptance

- Calendar is readable in all themes.
- Events do not overlap in confusing ways.
- Agenda fallback works on phone.
- Patient alerts are visible.
- Dense calendars remain usable through agenda or list fallback.

## Page 5: Queue Management

### Purpose

Manage OPD queue flow from check-in to consultation completion.

### Route

`/appointments/queue`

### Page Header

Title: `Queue Management`

Primary action:

- Call next.

Secondary actions:

- Issue token.
- Queue board.
- Refresh static data.

### Queue Views

- By department.
- By doctor.
- By room.
- By status.
- Waiting only.

### Queue Columns

- Queue position.
- Token.
- Patient.
- UHID.
- Appointment time.
- Waiting time.
- Department.
- Doctor.
- Status.
- Alerts.
- Actions.
- Priority.
- Delay indicator.

### Queue Actions

- Call.
- Hold.
- Skip.
- Move up/down placeholder.
- Start consultation placeholder.
- Complete.
- Cancel.
- Transfer to another doctor placeholder.

### Queue Detail Drawer

Sections:

- Patient summary.
- Appointment summary.
- Token summary.
- Waiting history.
- Notes.
- Status history.

### Queue Safety Rules

- Emergency/walk-in priority must be visible.
- Skipping patient requires reason placeholder.
- Holding patient requires reason placeholder.
- Moving queue position requires reason placeholder.
- Cancelling queue entry requires confirmation.
- Starting consultation is placeholder for Phase 5.
- Queue changes should show future audit note.
- Queue should show static waiting-time thresholds.
- Call next should respect priority order placeholder.

### Responsive Behavior

Phone:

- Queue rows become action cards.
- Call/hold/skip actions remain visible.

Desktop:

- Queue table and detail panel can be side-by-side.

### Acceptance

- Reception can see who is waiting and what to do next.
- Queue status changes are clear.
- Patient alerts remain visible.
- No real-time integration is claimed.
- Priority, late, delayed, and emergency states are visible.

## Page 6: Token Management

### Purpose

Issue and manage patient tokens for queue workflow.

### Route

`/appointments/tokens`

### Page Sections

- Token issue.
- Token list.
- Counter/room status.
- Token board preview.

### Token Issue Fields

- Patient.
- Appointment.
- Department.
- Doctor.
- Counter/room.
- Priority.
- Token prefix.
- Token number generated placeholder.
- Duplicate token warning placeholder.

### Token Table Columns

- Token.
- Patient.
- UHID.
- Department.
- Doctor.
- Counter/room.
- Status.
- Issued time.
- Called time.
- Actions.

### Token Board Preview

Show:

- Current token.
- Next tokens.
- Counter/room.
- Doctor.
- Department.
- Status.

### Actions

- Issue token.
- Reprint token.
- Call token.
- Skip token.
- Hold token.
- Complete token.
- Cancel token placeholder.

### Token Safety Rules

- Duplicate active token for same patient should show warning.
- Reprint token requires reason placeholder.
- Cancel token requires confirmation.
- Skipped and held tokens must remain visible.
- Expired tokens should not appear as active queue tokens.
- Token board preview must not claim real-time display integration.

### Print Rules

- Token slip uses print-safe light theme.
- Slip includes token, patient name, UHID, department, doctor, date/time.
- Internal controls hidden in print.

### Acceptance

- Token flow is clear and low-click.
- Token board is readable from distance in desktop layout.
- Token statuses are distinct.
- Print placeholder is present.
- Duplicate and reprint safeguards are represented.

## Page 7: Follow-Up Management

### Purpose

Manage due follow-ups and help staff schedule return visits.

### Route

`/appointments/follow-ups`

### Summary Cards

- Follow-ups due today.
- Overdue.
- Scheduled.
- Missed.
- Completed.

### Table Columns

- Patient.
- UHID.
- Follow-up due date.
- Department.
- Doctor.
- Reason.
- Last visit.
- Status.
- Actions.

### Filters

- Due date.
- Department.
- Doctor.
- Status.
- Patient search.

### Actions

- Book follow-up.
- Mark contacted placeholder.
- Mark missed.
- Open patient.
- Send reminder placeholder.
- Snooze follow-up placeholder.

### Follow-Up Drawer

Sections:

- Patient summary.
- Last visit summary.
- Follow-up reason.
- Suggested doctor/date placeholder.
- Contact attempts.
- Reminder log placeholder.
- Next contact date placeholder.

### Acceptance

- Due and overdue follow-ups are easy to identify.
- Booking follow-up reuses appointment booking pattern.
- Reminder actions are clearly placeholders.
- Contact attempt and snooze states are represented.

## Page 8: Teleconsultation Placeholder

### Purpose

Prepare UI for future teleconsultation appointments.

### Route

`/appointments/teleconsultation`

### Page Sections

- Teleconsultation list.
- Ready to join.
- Waiting online.
- Completed calls.
- Failed/no-show.

### Table Columns

- Time.
- Patient.
- UHID.
- Doctor.
- Department.
- Consent status.
- Link status.
- Appointment status.
- Actions.

### Actions

- Generate link placeholder.
- Copy link placeholder.
- Join call placeholder.
- Mark completed.
- Mark no-show.
- Open patient.

### Teleconsultation Detail Drawer

Sections:

- Appointment summary.
- Patient summary.
- Consent status.
- Link status.
- Pre-call checklist.
- Notes placeholder.
- Network/device readiness placeholder.

### Safety Rules

- Teleconsultation consent status must be visible.
- Join call does not start real video in Phase 4.
- Link actions show placeholder state.
- Failed/no-show states are distinct.
- Patient identity must be visible before join action.
- Missing consent blocks join action visually.

### Acceptance

- Clearly marked as future integration placeholder.
- Consent requirement is visible.
- Doctor and receptionist workflows are represented.
- Link and join actions cannot be mistaken for real integration.

## Page 9: Front Office Dashboard

### Purpose

Provide a reception work surface for daily front-office operations.

### Route

`/front-office`

### Sections

- Quick patient search.
- Today's appointments.
- Walk-ins.
- Check-ins.
- Queue snapshot.
- Token snapshot.
- Enquiries placeholder.
- Visitor direction placeholder.
- Pending actions.
- Quick links.

### Quick Actions

- Register patient.
- Book appointment.
- Check in patient.
- Issue token.
- Print token.
- Open queue.
- Create enquiry placeholder.
- Send to billing placeholder.
- Mark late/no-show.
- Open emergency registration.

### Reception Worklist Columns

- Time.
- Patient.
- Purpose.
- Department.
- Doctor.
- Status.
- Token.
- Next action.

### Enquiry Placeholder Fields

- Name.
- Mobile.
- Enquiry type.
- Department.
- Notes.
- Follow-up date.

### Visitor Direction Placeholder

- Visitor name.
- Patient/department.
- Purpose.
- Destination.
- Pass required placeholder.

### Front Office Handoff Rules

- Patient check-in can hand off to queue/token.
- Walk-in can hand off to appointment booking.
- Emergency/unknown patient can hand off to Phase 3 emergency registration.
- Checked-in patient can hand off to billing placeholder.
- Every handoff should preserve patient context.
- Handoff actions should be visible in the worklist next action column.

### Acceptance

- Reception can perform common actions from one screen.
- Low-click workflow is preserved.
- Patient search and appointment status are prominent.
- Works well on reception desktop and tablet.
- Handoffs between patient, appointment, queue, token, and billing placeholder are clear.

## Static Data Requirements

Phase 4 should add or expand static data files.

Recommended data:

- `mockAppointments`.
- `mockAppointmentSlots`.
- `mockDoctorSchedules`.
- `mockDoctorAvailability`.
- `mockScheduleTemplates`.
- `mockQueueEntries`.
- `mockTokens`.
- `mockTokenBoard`.
- `mockFollowUps`.
- `mockTeleconsultations`.
- `mockFrontOfficeWorklist`.
- `mockEnquiries`.
- `mockVisitorDirections`.
- `mockAppointmentAuditEvents`.
- `mockRooms`.
- `mockCounters`.
- `mockQueueDelayThresholds`.
- `mockAppointmentConflicts`.

Appointment fields:

- `id`.
- `appointmentNo`.
- `patientId`.
- `uhid`.
- `departmentId`.
- `doctorId`.
- `date`.
- `startTime`.
- `endTime`.
- `visitType`.
- `appointmentType`.
- `status`.
- `priority`.
- `source`.
- `reason`.
- `tokenId`.
- `teleconsultation`.
- `roomId`.
- `counterId`.
- `checkedInAt`.
- `cancelReason`.
- `rescheduleReason`.
- `noShowReason`.
- `createdBy`.
- `createdAt`.

Schedule fields:

- `id`.
- `doctorId`.
- `departmentId`.
- `dayOfWeek`.
- `startTime`.
- `endTime`.
- `slotDuration`.
- `room`.
- `maxPatients`.
- `status`.

Queue fields:

- `id`.
- `appointmentId`.
- `patientId`.
- `tokenNo`.
- `position`.
- `departmentId`.
- `doctorId`.
- `status`.
- `waitingSince`.
- `priority`.
- `checkedInAt`.
- `calledAt`.
- `delayLevel`.
- `statusReason`.

Token fields:

- `id`.
- `tokenNo`.
- `prefix`.
- `patientId`.
- `appointmentId`.
- `departmentId`.
- `doctorId`.
- `counter`.
- `status`.
- `issuedAt`.
- `calledAt`.
- `reprintCount`.
- `lastReprintReason`.

Follow-up fields:

- `id`.
- `patientId`.
- `lastVisitId`.
- `departmentId`.
- `doctorId`.
- `dueDate`.
- `reason`.
- `status`.
- `contactAttempts`.

Room/counter fields:

- `id`.
- `name`.
- `departmentId`.
- `type`.
- `capacity`.
- `status`.
- `assignedDoctorId`.

Conflict fields:

- `id`.
- `type`.
- `severity`.
- `message`.
- `affectedAppointmentId`.
- `requiresOverrideReason`.

## Validation Rules

Use React Hook Form and Zod style validation patterns from previous phases.

Common validation:

- Patient required.
- Department required.
- Doctor required.
- Appointment date required.
- Slot required.
- Visit type required.
- Cancel reason required.
- Reschedule reason required.
- Skip queue reason required.
- Hold queue reason required.
- Move queue reason required.
- No-show reason required.
- Reprint token reason required.
- Override reason required.
- Teleconsultation consent required.
- Follow-up due date required.
- Room/counter required where configured.

Validation UI:

- Inline field error.
- Error summary for long forms.
- Conflict warning panel.
- Disabled save where required fields are missing.
- Confirmation step for cancel, skip, override, and no-show.

## Accessibility Requirements

Required:

- Forms have labels.
- Calendar events are keyboard reachable.
- Queue actions are keyboard accessible.
- Token board has readable text and sufficient contrast.
- Status is not color-only.
- Drawers trap focus and return focus after close.
- Error text is linked to fields where possible.
- Appointment conflict warnings are announced clearly where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Patient search, filters, tabs, drawers, calendar controls, and queue actions work without mouse.

## Performance Requirements

Even with static data:

- Keep appointment tables efficient and reusable.
- Avoid rendering all detail drawers by default.
- Lazy render calendar event details where useful.
- Keep queue views stable to avoid layout shift.
- Token board should not jump when token changes.
- Use skeletons for loading-looking states.
- Avoid heavy calendar libraries unless a chosen library is already accepted by the project.

## Page State Requirements

Each Phase 4 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Validation error.
- Appointment conflict warning.
- Doctor unavailable state.
- Slot full state.
- Room/counter unavailable state.
- Overbook override state.
- No-show state.
- Late arrival state.
- Cancelled state.
- Queue empty state.
- Token expired state.
- Duplicate token warning state.
- Teleconsultation link pending state.
- Access denied state.
- Read-only state.

## Phase 4 QA Matrix

| Page | Theme | Responsive | Keyboard | Drawer/Sheet | Empty/Loading | Access State | Print |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Appointment management | Required | Required | Required | Required | Required | Required | Required |
| Appointment booking | Required | Required | Required | Required | Required | Required | Not needed |
| Doctor scheduling | Required | Required | Required | Required | Required | Required | Required |
| Calendar management | Required | Required | Required | Required | Required | Required | Not needed |
| Queue management | Required | Required | Required | Required | Required | Required | Not needed |
| Token management | Required | Required | Required | Required | Required | Required | Required |
| Follow-up management | Required | Required | Required | Required | Required | Required | Required |
| Teleconsultation placeholder | Required | Required | Required | Required | Required | Required | Not needed |
| Front office dashboard | Required | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 4 does not need real export files, but UI should reserve production actions.

Required:

- Print appointment list placeholder.
- Print appointment slip placeholder.
- Print token slip placeholder.
- Print doctor schedule placeholder.
- Print follow-up list placeholder.
- Export appointment list placeholder.
- Export schedule placeholder.
- Export actions show disabled state or toast explaining backend integration is pending.
- Print uses Phase 1 print-safe light theme.
- Navigation and internal controls are hidden in print preview.
- Patient sensitive identifiers remain masked where required.

## Operational Metrics Placeholders

Phase 4 should prepare dashboard and list metrics for future operational reporting.

Recommended metrics:

- Average waiting time.
- Longest waiting patient.
- Queue count by doctor.
- Queue count by department.
- No-show count.
- Late arrival count.
- Cancelled appointments.
- Rescheduled appointments.
- Token reprint count.
- Follow-up overdue count.
- Teleconsultation no-show count.

These metrics use static data in Phase 4 and later feed reports/analytics phases.

## Implementation Order

1. Confirm Phase 1 theme/responsive foundation and Phase 2/3 shared patterns are ready.
2. Add appointment and front-office navigation entries.
3. Add Phase 4 static data files.
4. Build appointment management page and detail drawer.
5. Build appointment booking page.
6. Build conflict detection UI.
7. Build doctor scheduling page.
8. Build calendar management page.
9. Build queue management page.
10. Build token management and token board preview.
11. Build follow-up management page.
12. Build teleconsultation placeholder page.
13. Build front office dashboard.
14. Add room/counter and capacity placeholders.
15. Add waiting-time and priority indicators.
16. Add role visibility and access denied states.
17. Verify light, dark, system, dynamic preset, and custom color themes.
18. Verify phone, tablet, laptop, desktop, and wide-desktop responsiveness.
19. Polish validation, keyboard behavior, loading states, empty states, print-safe views, queue action confirmations, and handoff flows.

## Production-Grade Acceptance Checklist

Phase 4 is complete when:

- Appointment management works with static data.
- Appointment booking supports patient selection, visit details, doctor/slot selection, and confirmation.
- Conflict detection UI is present.
- Doctor scheduling supports availability, leaves, blocked times, templates, and rooms.
- Room/counter and capacity placeholders are represented.
- Calendar supports day, week, month, doctor, department, and room views.
- Queue management supports waiting, call, hold, skip, complete, and cancel placeholder actions.
- Queue priority, waiting-time, and delay indicators are visible.
- Token management supports issue, call, skip, hold, complete, print, and board preview.
- Token duplicate, reprint, cancel, and expired states are represented.
- Follow-up management supports due, overdue, scheduled, missed, and completed states.
- Teleconsultation page clearly communicates future integration.
- Front office dashboard supports common reception actions in low-click layout.
- Front office handoffs preserve patient context.
- All pages support Phase 1 theme modes and dynamic colors.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Drawers become full-screen sheets on phone.
- Sticky headers and sticky actions do not cover content.
- Patient alerts from Phase 3 are visible where patient context exists.
- Role visibility and access denied states are demonstrated.
- Keyboard accessibility is covered for forms, search, filters, tabs, drawers, calendar controls, and queue actions.
- Static data is organized for future API and real-time replacement.

## Handoff Notes For Phase 5

Phase 5 can begin after Phase 4 provides:

- Appointment static data.
- Doctor schedule and availability static data.
- Queue and token static data.
- Patient selection pattern inside workflow forms.
- Appointment detail drawer.
- Calendar and slot selection pattern.
- Queue status pattern.
- Token issue and token board pattern.
- Teleconsultation placeholder state pattern.

Phase 5 should then focus on OPD consultation, clinical notes, SOAP notes, diagnosis management, ICD coding, prescription management, procedure management, vaccination management, chronic disease management, allergy management, vitals management, and clinical templates.
