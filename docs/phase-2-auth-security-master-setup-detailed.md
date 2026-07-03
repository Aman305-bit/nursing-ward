# Phase 2 Detailed Document: Authentication, Security, Roles, And Master Setup

## Phase Goal

Build the production-grade UI screens for authentication, role and permission management, user management, department management, hospital master setup, branch future-ready setup, security management, and audit logs.

This phase is still UI-only and uses static data. It should feel ready for backend integration later, but no real authentication, database, or API integration is required in this phase.

## Dependency On Phase 1

All Phase 2 screens must use the Phase 1 foundation.

Required Phase 1 patterns:

- App shell.
- Light, dark, system, and dynamic color theme system.
- Semantic theme tokens.
- Responsive phone, tablet, laptop, desktop, and wide-desktop behavior.
- Sidebar/header navigation.
- Page header pattern.
- Sticky action bar pattern.
- Reusable drawers.
- Reusable tables.
- Reusable forms.
- Global search pattern.
- Notification pattern.
- Role-aware navigation placeholder.
- Static mock data structure.

Important rule:

Every future phase must follow the Phase 1 theme and responsive foundation. Do not create separate colors, layouts, buttons, tables, forms, or drawers for Phase 2.

## Phase 2 Scope

Phase 2 covers:

- Login page.
- Forgot password UI.
- Optional reset password UI placeholder.
- MFA / OTP verification UI placeholder.
- Role and permission management.
- User management.
- Department management.
- Hospital master setup.
- Branch management future-ready UI.
- Security management.
- Session management.
- Device management.
- IP restriction UI.
- Password policy UI.
- Audit log system.

Phase 2 does not cover:

- Real login or token handling.
- Backend permission enforcement.
- Database user creation.
- Email/SMS OTP integration.
- Real audit trail storage.
- Real branch operations.
- Real biometric/device integration.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/login` | Login | Staff login UI. |
| `/forgot-password` | Forgot password | Password recovery UI placeholder. |
| `/reset-password` | Reset password | Reset password UI placeholder. |
| `/verify-otp` | OTP / MFA verification | Second-factor verification UI placeholder. |
| `/admin/roles` | Role management | Create and manage roles. |
| `/admin/permissions` | Permission matrix | Configure module, page, tab, and action permissions. |
| `/admin/users` | User management | Manage staff users and access. |
| `/admin/departments` | Department management | Manage hospital departments. |
| `/admin/hospital-setup` | Hospital master setup | Configure hospital profile and operating settings. |
| `/admin/branches` | Branch management | Future-ready branch list and setup placeholders. |
| `/admin/security` | Security management | Sessions, devices, IP restrictions, password policy. |
| `/admin/audit-logs` | Audit logs | Track user and system activity using static data. |

Recommended route grouping:

| Group | Routes | Layout |
| --- | --- | --- |
| `(auth)` | `/login`, `/forgot-password`, `/reset-password`, `/verify-otp` | Auth layout without main sidebar. |
| `(app)/admin` | Admin and security pages | Main HMS app shell from Phase 1. |

## Shared UI Requirements

### Theme Requirements

All Phase 2 pages must support:

- Light mode.
- Dark mode.
- System mode.
- Dynamic primary color presets.
- Custom primary color.
- Compact and comfortable density.
- Theme persistence.
- Print-safe light mode for printable admin records.

Theme usage rules:

- Use Phase 1 semantic tokens only.
- Do not use hardcoded hex colors in page components.
- Permission states, user status, security risk, and audit severity must use existing status tokens.
- Login page must also support dark mode and dynamic color presets.
- Tables, forms, drawers, menus, tabs, alerts, and charts/placeholders must work in every theme.

### Responsive Requirements

All Phase 2 pages must work across:

- Phone: 320px, 375px, 390px, 414px, 430px.
- Tablet: 768px, 820px, 834px, 1024px portrait.
- Laptop: 1024px, 1280px, 1366px.
- Desktop: 1440px, 1536px, 1600px.
- Wide desktop: 1920px and above.

Responsive rules:

- Phone pages use single-column forms and full-screen drawers.
- Tablet pages can use two-column forms where space allows.
- Laptop and desktop pages use tables, split views, and side drawers.
- Wide desktop pages should use max readable widths or productive split panels.
- No page-level horizontal scroll.
- Dense permission tables may scroll inside their own container.
- Sticky headers and sticky action bars must not cover fields or table rows.

### Admin Page Pattern

Most Phase 2 admin pages should follow this structure:

- Sticky page header.
- Summary cards or compact counters.
- Filter/search bar.
- Main table or settings form.
- Right-side detail drawer.
- Sticky action area for create, save, reset, export, or print actions.

Common states:

- Loading skeleton.
- Empty state.
- No search results.
- Validation errors.
- Unsaved changes warning placeholder.
- Save success toast.
- Save failed placeholder state.
- Disabled/read-only state.
- Access denied state.
- Confirmation required state.
- High-risk action warning state.

### Admin Safety Rules

Phase 2 contains powerful admin/security screens, so the UI must make risky actions clear.

High-risk actions:

- Deactivate role.
- Change permission access.
- Lock/unlock user.
- Force logout user.
- Reset password.
- Block device.
- Remove trusted device.
- Add block IP rule.
- Disable department.
- Change hospital legal/registration data.

Required behavior:

- Use confirmation drawers or inline confirmation steps for high-risk actions.
- Avoid chains of multiple popups.
- Show the affected record name in the confirmation UI.
- Show a short reason field placeholder for permission/security changes.
- Show success and failed states after action.
- Keep audit-log impact visible where useful, such as `This action will be recorded in audit logs`.

### RBAC Model Rules

The permission UI must express access logic clearly, even with static data.

Required concepts:

- Module access.
- Page access.
- Tab access.
- Action access.
- Sensitive access.
- Department scope.
- Read-only access.
- Full access.

Dependency rules:

- If module access is disabled, page, tab, and action access inside that module should appear disabled.
- If view access is disabled, create/edit/delete/approve/export should appear disabled.
- Sensitive permissions should be visually marked and require stronger confirmation.
- System roles should be protected from destructive editing.
- Custom roles can be created, duplicated, edited, activated, and deactivated.

### Protected Route Behavior

Phase 2 should simulate protected routes using static role state.

Required behavior:

- Unauthorized users see the access denied UI inside the app shell.
- Direct navigation to restricted admin routes should show access denied, not a broken page.
- Read-only users can view allowed pages but cannot save changes.
- Disabled actions must explain why they are unavailable through tooltip/help text.

### Privacy And Security Display Rules

Phase 2 should avoid showing sensitive values directly.

Rules:

- Password values are never displayed.
- OTP values are never displayed.
- API keys or secret placeholders are masked if shown.
- IP addresses can be shown in security/audit screens.
- User email and mobile are visible in admin screens but should support masked display patterns later.
- Audit logs should not expose clinical note content, prescriptions, or private medical details.
- Audit before/after values should be summarized or masked for sensitive fields.

## Page 1: Login

### Purpose

Provide a clean staff login experience for hospital users.

### Route

`/login`

### Layout

Use an auth layout separate from the main app shell.

Required layout:

- Hospital logo/name.
- Login form.
- Role hint or staff access note.
- Theme mode toggle.
- Optional language selector placeholder.
- Support/contact text.

Avoid:

- Marketing-style hero section.
- Large decorative graphics.
- Long page content.

### Fields

- Username, email, or mobile.
- Password.
- Remember device checkbox placeholder.

### Actions

- Sign in.
- Forgot password.
- Toggle password visibility.
- Continue to OTP/MFA verification placeholder when required.

### States

- Empty.
- Invalid field.
- Invalid credentials placeholder.
- Loading.
- Account locked placeholder.
- Session expired placeholder.
- MFA required placeholder.
- Password expired placeholder.

### Responsive Behavior

Phone:

- Centered single-column form.
- Full-width inputs and button.
- Theme toggle accessible from top-right or bottom area.

Tablet/Desktop:

- Compact centered auth panel.
- Do not stretch the form too wide.

### Acceptance

- Login works visually in light, dark, and dynamic themes.
- Form is keyboard accessible.
- Password visibility control has accessible label.
- Error messages are clear and compact.

## Page 2: Forgot Password, Reset Password, And OTP/MFA Verification

### Purpose

Provide password recovery and second-factor verification UI placeholders.

### Routes

- `/forgot-password`
- `/reset-password`
- `/verify-otp`

### Forgot Password Fields

- Email, username, or mobile.

### Reset Password Fields

- New password.
- Confirm password.
- OTP/code placeholder.

### OTP/MFA Fields

- OTP/code.
- Delivery method display: SMS, email, authenticator app placeholder.
- Trusted device checkbox placeholder.

### Actions

- Send reset link/code.
- Back to login.
- Reset password.
- Verify code.
- Resend code.
- Change verification method placeholder.

### States

- Code sent.
- Invalid user.
- Expired code placeholder.
- Password mismatch.
- Password strength indicator placeholder.
- Invalid OTP.
- Resend cooldown.
- Too many attempts.

### Acceptance

- Pages reuse auth layout.
- Theme and responsiveness match login page.
- No real email/SMS integration is required.
- OTP/MFA screen is ready for future security integration.

## Page 3: Role Management

### Purpose

Manage hospital roles that control module and action access.

### Route

`/admin/roles`

### Page Header

Title: `Roles & Permissions`

Primary action:

- Create role.

Secondary actions:

- Export placeholder.
- Refresh static data.
- View permission matrix.

### Summary Cards

- Total roles.
- Active roles.
- System roles.
- Custom roles.

### Table Columns

- Role name.
- Role type: system/custom.
- Users assigned.
- Modules allowed.
- Status.
- Last updated.
- Actions.

### Filters

- Search role.
- Role type.
- Status.
- Department scope.

### Role Drawer Tabs

Use a reusable right-side drawer.

Tabs:

- Overview.
- Permissions.
- Assigned users.
- Audit.

Overview fields:

- Role name.
- Description.
- Role type.
- Department scope.
- Status.
- Protected system role indicator.
- Permission risk summary.

Permissions tab:

- Module-level access preview.
- Page-level access preview.
- Action-level access preview.

Assigned users tab:

- User list.
- Department.
- Designation.
- Status.

Audit tab:

- Created by.
- Created date.
- Last updated by.
- Last permission change.

### Actions

- Create role.
- Edit role.
- Duplicate role.
- Activate/deactivate role.
- View permissions.

### Static Roles

Suggested roles:

- Super Admin.
- Hospital Admin.
- Doctor.
- Nurse.
- Receptionist.
- Lab Technician.
- Radiologist.
- Pharmacist.
- Billing Executive.
- HR Manager.
- Management.

### Acceptance

- Role list is scannable.
- Permission summary is visible without opening many popups.
- Drawer works on phone, tablet, and desktop.
- Status colors use Phase 1 theme tokens.
- System roles cannot be accidentally deleted or heavily modified.
- Sensitive roles and permissions are visually marked.

## Page 4: Permission Matrix

### Purpose

Configure role access across modules, pages, tabs, and actions.

### Route

`/admin/permissions`

### Layout

Use a tab-based screen with sticky header and sticky save actions.

Required controls:

- Role selector.
- Module group selector.
- Search permission.
- Expand/collapse all.
- Save changes.
- Reset changes.

### Tabs

- Module access.
- Page access.
- Tab access.
- Action access.
- Sensitive access.

### Permission Levels

- View.
- Create.
- Edit.
- Delete.
- Print.
- Export.
- Approve.
- Reject.
- Cancel.
- Override.

Sensitive access examples:

- View financial data.
- Approve discount.
- View audit logs.
- Manage permissions.
- Manage security settings.
- Access patient clinical history.
- Export patient records.

### Matrix Columns

- Module/page/action name.
- Description.
- View.
- Create.
- Edit.
- Delete.
- Approve.
- Export.
- Status.

### Responsive Behavior

Phone:

- Use grouped accordion/card permissions instead of huge table where possible.
- Sticky bottom save action.

Tablet:

- Use horizontal scroll inside matrix container.

Desktop:

- Use full matrix table with sticky first column and sticky header.

### Acceptance

- Permission matrix is readable.
- Sticky save/reset actions remain visible.
- Unsaved changes state is clearly shown.
- Theme works for selected/disabled/checked states.
- Parent-child permission dependency states are clear.
- Sensitive permission changes require confirmation.

## Page 5: User Management

### Purpose

Manage hospital staff user accounts and role assignments.

### Route

`/admin/users`

### Page Header

Title: `User Management`

Primary action:

- Add user.

Secondary actions:

- Import placeholder.
- Export placeholder.
- Invite user placeholder.

### Summary Cards

- Total users.
- Active users.
- Locked users.
- Pending invites.
- Online sessions.

### Table Columns

- User.
- Employee code.
- Role.
- Department.
- Designation.
- Mobile/email.
- Status.
- Last login.
- Actions.

### Filters

- Search user.
- Role.
- Department.
- Status.
- Last login.

### User Drawer Tabs

- Profile.
- Access.
- Security.
- Activity.

Profile fields:

- Full name.
- Employee code.
- Designation.
- Department.
- Mobile.
- Email.
- Joining date placeholder.
- Status.

Access fields:

- Assigned roles.
- Allowed departments.
- Default landing page.
- Module access summary.

Security fields:

- Reset password action.
- Force logout action.
- Lock/unlock account.
- Two-factor placeholder.
- Trusted device list preview.
- Failed login count.
- Password expiry state.
- Last password change placeholder.

Activity tab:

- Last login.
- Recent actions.
- Failed login attempts.

### Actions

- Add user.
- Edit user.
- Assign role.
- Reset password.
- Lock/unlock.
- Force logout.
- View activity.

### Acceptance

- User table supports quick scanning.
- User create/edit drawer supports validation states.
- Access tab clearly shows role and department mapping.
- Security actions require confirmation pattern, not multiple popup chains.
- Locked, inactive, invited, and active states are visually distinct.
- User security tab is useful without exposing passwords or secrets.

## Page 6: Department Management

### Purpose

Manage hospital departments used across users, doctors, appointments, OPD, IPD, lab, billing, and reports.

### Route

`/admin/departments`

### Summary Cards

- Total departments.
- Clinical departments.
- Support departments.
- Active departments.

### Table Columns

- Department name.
- Code.
- Type.
- Head of department.
- Location/floor.
- Users.
- Status.
- Actions.

### Department Types

- Clinical.
- Diagnostic.
- Administrative.
- Support.
- Finance.
- Store.

### Drawer Tabs

- Overview.
- Staff mapping.
- Operating settings.
- Audit.

Overview fields:

- Department name.
- Code.
- Type.
- Description.
- Floor/location.
- Contact extension.
- Status.

Staff mapping:

- Department head.
- Doctors.
- Nurses.
- Staff users.

Operating settings:

- OPD enabled.
- IPD enabled.
- Billing enabled.
- Lab/radiology enabled.
- Appointment enabled.

### Acceptance

- Department setup is reusable by later phases.
- Department status and module enablement are clear.
- Layout works on tablet and desktop without crowding.

## Page 7: Hospital Master Setup

### Purpose

Configure hospital-level profile and operational master settings.

### Route

`/admin/hospital-setup`

### Layout

Use a tab-based settings page with sticky save action.

Tabs:

- Profile.
- Contact.
- Legal & registration.
- Operations.
- Branding.
- Print settings.
- Audit.

### Profile Tab

Fields:

- Hospital name.
- Short name.
- Hospital type.
- Established year.
- Tagline placeholder.
- Logo upload placeholder.

### Contact Tab

Fields:

- Address line 1.
- Address line 2.
- City.
- State.
- Country.
- PIN code.
- Phone.
- Email.
- Website.

### Legal & Registration Tab

Fields:

- Registration number.
- GST number.
- NABH/NABL placeholder.
- License details placeholder.
- PAN placeholder.

### Operations Tab

Fields:

- Working hours.
- Emergency available.
- Default appointment duration.
- Default currency.
- Time zone.
- Date format.
- Financial year start.

### Branding Tab

Fields:

- Logo placeholder.
- Print header preview.
- Primary theme preset reference.
- Hospital seal placeholder.

Important:

Branding must not override Phase 1 theme tokens directly. It can store hospital branding values that map into the theme system.

### Print Settings Tab

Fields:

- Prescription header.
- Invoice header.
- Lab report header.
- Discharge summary header.
- Footer text.
- Signature placeholder.

### Acceptance

- Settings page is tab-based and low-scroll.
- Sticky save action is always reachable.
- Print preview uses print-safe light theme.
- Branding respects the global theme system.

## Page 8: Branch Management Future-Ready

### Purpose

Prepare the UI for future branch support while current system remains single hospital.

### Route

`/admin/branches`

### Current Phase Behavior

Show branch management as future-ready and disabled/limited where appropriate.

Required content:

- Main hospital branch record.
- Future branch placeholder.
- Branch status.
- Branch address.
- Contact details.
- Department availability preview.

### Table Columns

- Branch name.
- Code.
- City.
- Type.
- Departments.
- Status.
- Actions.

### Drawer Tabs

- Overview.
- Departments.
- Contacts.
- Future settings.

### Acceptance

- UI clearly shows single-hospital mode.
- Future branch capability is visible without confusing current users.
- Disabled future actions are styled accessibly.

## Page 9: Security Management

### Purpose

Centralize UI for security settings, active sessions, device management, IP restrictions, and password policy.

### Route

`/admin/security`

### Layout

Use tabs with security summary cards.

Tabs:

- Overview.
- Sessions.
- Devices.
- IP restrictions.
- Password policy.
- MFA policy.
- Login rules.

### Overview Cards

- Active sessions.
- Failed login attempts.
- Locked accounts.
- Trusted devices.
- Blocked IPs.
- Policy status.
- MFA enabled users.

### Sessions Tab

Columns:

- User.
- Role.
- Device.
- IP address.
- Location placeholder.
- Login time.
- Last activity.
- Status.
- Actions.

Actions:

- Force logout.
- View session detail.

### Devices Tab

Columns:

- Device name.
- User.
- Browser/app.
- Last used.
- Trust status.
- Risk.
- Actions.

Actions:

- Trust device.
- Block device.
- Remove device.

### IP Restrictions Tab

Columns:

- IP address/range.
- Type: allow/block.
- Description.
- Added by.
- Status.
- Actions.

Actions:

- Add IP rule.
- Edit rule.
- Disable rule.

### Password Policy Tab

Fields:

- Minimum password length.
- Require uppercase.
- Require lowercase.
- Require number.
- Require special character.
- Password expiry days.
- Failed attempt lock count.
- Lock duration.
- Password reuse limit.

### MFA Policy Tab

Fields:

- MFA required for admin roles.
- MFA required for security settings.
- MFA required for financial approvals placeholder.
- OTP delivery methods: SMS, email, authenticator app placeholder.
- Trusted device duration.
- Backup code placeholder.
- Failed OTP attempt limit.

States:

- Enabled.
- Disabled.
- Required for sensitive roles.
- Optional for standard users.

### Login Rules Tab

Fields:

- Session timeout.
- Remember device allowed.
- Allow multiple sessions.
- Force password change on first login.
- Login time restriction placeholder.
- Login location warning placeholder.
- New device alert placeholder.

### Acceptance

- Security screens feel serious and clear.
- Risk states use consistent warning/danger tokens.
- High-risk actions use confirmation drawer or confirmation inline step.
- Security settings are responsive and keyboard accessible.
- MFA policy is visible as a future-ready security screen.
- Security values are masked or summarized where needed.

## Page 10: Audit Log System

### Purpose

Provide a searchable and filterable UI for user, role, security, and setup activity.

### Route

`/admin/audit-logs`

### Page Header

Title: `Audit Logs`

Primary action:

- Export placeholder.

Secondary actions:

- Print.
- Refresh.
- Save filter placeholder.

### Summary Cards

- Total events today.
- Security events.
- Permission changes.
- Failed login events.
- Critical events.

### Filters

- Date range.
- User.
- Role.
- Department.
- Module.
- Event type.
- Severity.
- IP address.
- Search text.

### Table Columns

- Time.
- User.
- Role.
- Module.
- Event.
- Target.
- IP address.
- Device.
- Severity.
- Actions.

### Severity Levels

- Info.
- Warning.
- Critical.
- Security.

### Detail Drawer

Sections:

- Event summary.
- Actor details.
- Target details.
- Before/after values placeholder.
- Device/IP details.
- Related events.
- Sensitivity/masking note.

### Audit UI Rules

- Audit logs are read-only.
- Audit rows cannot be edited or deleted.
- Critical/security events should be visually distinct but still use Phase 1 tokens.
- Before/after values should be masked for sensitive fields.
- Related event links can open the same detail drawer with a new selected event.
- Export and print are placeholders, but their buttons should be visible for future workflow.

### Acceptance

- Audit table supports dense data scanning.
- Filters are easy to use and do not create long vertical pages.
- Detail drawer gives enough context without navigation away.
- Print/export placeholders are visible.
- Audit log UI clearly communicates immutability.

## Static Data Requirements

Phase 2 should add or expand static data files.

Recommended data:

- `mockAuthMessages`.
- `mockLoginAttempts`.
- `mockRoles`.
- `mockPermissions`.
- `mockUsers`.
- `mockDepartments`.
- `mockHospitalProfile`.
- `mockBranches`.
- `mockSecuritySessions`.
- `mockDevices`.
- `mockIpRules`.
- `mockPasswordPolicy`.
- `mockMfaPolicy`.
- `mockAuditLogs`.
- `mockAccessDeniedScenarios`.

Common fields:

- `id`.
- `code`.
- `name`.
- `status`.
- `createdAt`.
- `updatedAt`.

User fields:

- `id`.
- `employeeCode`.
- `name`.
- `email`.
- `mobile`.
- `roleIds`.
- `departmentIds`.
- `designation`.
- `status`.
- `lastLoginAt`.
- `locked`.

Role fields:

- `id`.
- `name`.
- `type`.
- `description`.
- `departmentScope`.
- `status`.
- `userCount`.
- `permissionCount`.

Permission fields:

- `id`.
- `module`.
- `page`.
- `tab`.
- `action`.
- `description`.
- `sensitive`.
- `enabled`.

Audit log fields:

- `id`.
- `timestamp`.
- `actorUserId`.
- `actorRole`.
- `module`.
- `eventType`.
- `target`.
- `severity`.
- `ipAddress`.
- `device`.
- `before`.
- `after`.
- `sensitiveFieldsMasked`.

Login attempt fields:

- `id`.
- `username`.
- `timestamp`.
- `ipAddress`.
- `device`.
- `status`.
- `reason`.
- `risk`.

MFA policy fields:

- `requiredForAdmin`.
- `requiredForSecuritySettings`.
- `requiredForFinancialApprovals`.
- `methods`.
- `trustedDeviceDurationDays`.
- `failedAttemptLimit`.

## Role Visibility Rules

Even with static data, Phase 2 should demonstrate access awareness.

Suggested page visibility:

| Role | Access |
| --- | --- |
| Super Admin | All Phase 2 screens. |
| Hospital Admin | Users, departments, hospital setup, audit logs. |
| HR Manager | User list read access, staff profile access placeholder. |
| Management | Audit summaries and hospital setup read-only placeholder. |
| Doctor/Nurse/Receptionist | No admin configuration access, unless route preview shows access denied state. |

Access denied UI:

- Use an inline access denied page inside app shell.
- Explain that permission is required.
- Provide back to dashboard action.
- Do not show technical error content.

## Validation Rules

Use React Hook Form and Zod style validation patterns from Phase 1.

Common validation:

- Required fields.
- Email format.
- Mobile number format placeholder.
- Duplicate code/name placeholder.
- Password confirmation.
- Minimum password rule.
- IP address format placeholder.
- Date range validation.

Validation UI:

- Inline error below field.
- Error summary for long forms.
- Required field indicator.
- Disabled save until required fields are valid where useful.

## Accessibility Requirements

Required:

- All forms have labels.
- All icon buttons have accessible labels.
- Permission matrix checkboxes are keyboard accessible.
- Drawers trap focus correctly and return focus after close.
- Tables have column headers.
- Status is not communicated by color only.
- Confirmation actions are keyboard accessible.
- Error text is linked to fields where possible.

Target:

- WCAG AA contrast in all Phase 1 themes.
- No keyboard traps.
- Search, filters, tabs, drawers, and menus work without mouse.

## Performance Requirements

Even with static data:

- Keep tables efficient and reusable.
- Avoid rendering huge nested permission trees by default.
- Use collapsed groups for large permission sets.
- Lazy render drawer tab content where useful.
- Keep auth pages lightweight.
- Avoid layout shift in admin shell.

## Page State Requirements

Each Phase 2 page should include realistic UI states:

- Default with static data.
- Empty state.
- Search no-result state.
- Loading skeleton.
- Validation error.
- Save success.
- Save failed placeholder.
- Read-only state.
- Access denied state where applicable.

## Phase 2 QA Matrix

Each major Phase 2 page should be checked against the same production criteria.

| Page | Theme | Responsive | Keyboard | Drawer/Modal | Empty/Loading | Access State |
| --- | --- | --- | --- | --- | --- | --- |
| Login | Required | Required | Required | Not needed | Required | Not needed |
| Forgot/reset/OTP | Required | Required | Required | Not needed | Required | Not needed |
| Role management | Required | Required | Required | Required | Required | Required |
| Permission matrix | Required | Required | Required | Required | Required | Required |
| User management | Required | Required | Required | Required | Required | Required |
| Department management | Required | Required | Required | Required | Required | Required |
| Hospital setup | Required | Required | Required | Required | Required | Required |
| Branch management | Required | Required | Required | Required | Required | Required |
| Security management | Required | Required | Required | Required | Required | Required |
| Audit logs | Required | Required | Required | Required | Required | Required |

## Print And Export Placeholder Rules

Phase 2 does not need real export files, but the UI should reserve production-ready actions.

Required:

- Export buttons should be visible where future export is expected.
- Print buttons should use the Phase 1 print-safe light theme.
- Export/print placeholders should show a toast or disabled state explaining that backend integration is pending.
- Audit log and admin setup print previews should hide navigation and actions.
- Sensitive fields should remain masked in print and export previews.

## Implementation Order

1. Confirm Phase 1 theme, responsive shell, and shared components are ready.
2. Build auth layout.
3. Build login, forgot password, reset password, and OTP/MFA placeholder pages.
4. Build admin route group and navigation entries.
5. Build role management page.
6. Build permission matrix page.
7. Build user management page.
8. Build department management page.
9. Build hospital master setup page.
10. Build branch future-ready page.
11. Build security management page.
12. Build audit logs page.
13. Add static data files for Phase 2.
14. Add access denied state.
15. Add confirmation patterns for high-risk admin/security actions.
16. Verify theme support across all Phase 2 screens.
17. Verify responsiveness across phone, tablet, laptop, desktop, and wide desktop.
18. Verify access states, read-only states, and protected-route behavior.
19. Polish keyboard navigation, validation, empty states, loading states, and masked sensitive values.

## Production-Grade Acceptance Checklist

Phase 2 is complete when:

- Auth pages are responsive and themed.
- OTP/MFA placeholder flow is available for future security integration.
- Admin screens use Phase 1 app shell and design system.
- Role management page works with static data.
- Permission matrix is tab-based, readable, and responsive.
- User management supports profile, access, security, and activity drawer tabs.
- Department management is ready for later clinical and operational modules.
- Hospital setup is tab-based with sticky save action.
- Branch page is future-ready without confusing current single-hospital mode.
- Security management covers sessions, devices, IP restrictions, password policy, and login rules.
- Security management includes MFA policy placeholders.
- Audit log page supports filters, table, severity states, and detail drawer.
- Audit logs are read-only and communicate immutability.
- All pages support light, dark, system, dynamic preset, and custom primary color themes.
- No hardcoded page colors bypass Phase 1 tokens.
- All pages work on phone, tablet, laptop, desktop, and wide desktop.
- Tables scroll only inside their containers where required.
- Drawers become full-screen sheets on phone.
- Sticky headers and sticky actions do not cover content.
- Keyboard accessibility is covered for forms, tabs, drawers, filters, and permission controls.
- High-risk actions use confirmation patterns.
- Protected route and access denied behavior is demonstrated using static role state.
- Sensitive values are masked or summarized where required.
- Static data is organized for future API replacement.

## Handoff Notes For Phase 3

Phase 3 can begin after Phase 2 provides:

- Stable admin and security foundation.
- Working role and permission UI patterns.
- User and department static data.
- Hospital profile static data.
- Access denied state.
- Audit log UI pattern.
- Form validation pattern.
- Admin drawer and settings page patterns.

Phase 3 should then focus on patient registration, patient profile management, visit history, family management, patient documents, consent management, patient portal UI, and ABHA / Health ID integration placeholders.
