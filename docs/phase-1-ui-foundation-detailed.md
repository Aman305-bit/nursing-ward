# Phase 1 Detailed Document: UI Foundation, Layout, And Design System

## Phase Goal

Build the production-grade UI foundation for Plasmit Hospital HMS.

This phase does not implement hospital business modules in detail. It creates the application shell, responsive layout system, reusable UI patterns, static data structure, and core navigation surfaces that every future module will use.

The final result of Phase 1 should feel like a real enterprise HMS frontend even with static data.

## Product Direction

Plasmit Hospital is a single-hospital, multi-department HMS with multi-role workflows. The UI must support fast clinical and operational work with low scrolling, low clicks, tab-based screens, sticky headers, sticky actions, reusable drawers, compact grids, and responsive behavior across desktop, laptop, tablet, and mobile.

## Phase 1 Scope

Phase 1 covers:

- Application shell.
- Main navigation.
- Header and context controls.
- Responsive layout foundation.
- Dashboard base page.
- Global search UI.
- Notification center UI.
- Reusable components.
- Static mock data foundation.
- Theme and design tokens.
- Light mode, dark mode, and dynamic color theme options.
- Recommended production UI libraries.
- Accessibility and keyboard interaction rules.
- Production-grade responsive behavior.

Phase 1 does not cover:

- Real authentication backend.
- API integration.
- Database integration.
- Real-time socket integration.
- Full module-level business workflows.
- Detailed patient, OPD, IPD, billing, lab, pharmacy, or HRMS pages.

## Recommended Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Redirect / landing | Redirect to dashboard or login placeholder. |
| `/dashboard` | Dashboard | Role-based hospital overview and quick actions. |
| `/search` | Global search page or overlay state | Search patients, doctors, modules, invoices, reports using static data. |
| `/notifications` | Notification center | Alerts, tasks, clinical warnings, approvals, and system messages. |
| `/settings/ui` | UI settings placeholder | Light/dark mode, dynamic color presets, density, language, and layout preference placeholder. |
| `/components-preview` | Internal UI preview | Optional development-only page for testing reusable components. |

If the project uses route groups, Phase 1 can use:

| Route Group | Purpose |
| --- | --- |
| `(auth)` | Login/auth pages in later phases. |
| `(app)` | Main HMS authenticated layout. |
| `(dev)` | Component preview and internal testing pages. |

## Layout Requirements

### Main App Shell

The shell is the base layout for all authenticated HMS pages.

Required sections:

- Left sidebar navigation on desktop.
- Collapsible sidebar on laptop/tablet.
- Bottom navigation or drawer navigation on mobile.
- Top header with hospital context, department context, search, notifications, and user profile.
- Main content area with responsive padding.
- Sticky page header inside content area.
- Optional right-side drawer layer for quick view and edit flows.

Desktop behavior:

- Sidebar remains visible.
- Header remains sticky.
- Main content uses available width.
- Tables and split views should not force full-page horizontal scrolling.

Tablet behavior:

- Sidebar can collapse to icons or open as an overlay drawer.
- Header remains sticky with compact controls.
- Dense tables should switch to horizontal scroll inside table container only.

Mobile behavior:

- Sidebar becomes menu drawer or bottom navigation.
- Header becomes compact.
- Search opens full-screen overlay.
- Drawers become full-screen sheets.
- Sticky actions remain reachable at bottom.
- Content uses stacked sections, tabs, accordions, or compact cards instead of long tables where useful.

### Page Header Pattern

Every module page in later phases should use the same header pattern.

Required header content:

- Page title.
- Short page context or breadcrumb.
- Primary action button.
- Secondary actions as icon buttons or compact menu.
- Search or filter controls where needed.
- Status chips or summary counters when useful.

Sticky behavior:

- Page header should stay visible while scrolling the module content.
- On small screens, title and actions should wrap cleanly without overlap.
- Primary action should remain accessible even when page content is long.

### Sticky Action Bar Pattern

Use for pages with forms, approvals, or important workflow actions.

Examples:

- Save.
- Submit.
- Cancel.
- Print.
- Approve.
- Reject.
- Create bill.
- Start consultation.
- Complete task.

Desktop behavior:

- Sticky action bar can be at top-right in page header or bottom of form area.

Mobile behavior:

- Sticky action bar should sit at bottom with safe-area spacing.
- Primary action should be thumb-friendly.
- Secondary actions can move into a menu.

## Navigation Requirements

### Primary Navigation Groups

Phase 1 should prepare navigation groups for all future modules, but only dashboard/search/notifications need working page content now.

Recommended groups:

- Dashboard.
- Front Office.
- Patient.
- Appointment.
- OPD.
- IPD.
- Emergency.
- EMR / EHR.
- Laboratory.
- Radiology.
- Pharmacy.
- OT.
- Billing & Finance.
- Insurance & TPA.
- Inventory & Store.
- HRMS.
- Administration.
- Reports & Analytics.
- Communication.
- Integrations.
- Security & Compliance.
- Mobile & Remote.
- AI & Smart Healthcare.
- Settings.

Navigation rules:

- Avoid deep nested menus.
- Maximum navigation depth should be 2 levels.
- Frequently used items should be visible or searchable.
- Search should allow quick navigation to any module.
- Current page and group must be clearly highlighted.
- Collapsed sidebar should show icons with tooltips.

### Role-Aware Navigation Placeholder

Even with static data, the shell should support role-based navigation visibility.

Suggested static roles:

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

In Phase 1, role switching can be a UI-only control. Selecting a role should update visible quick actions and dashboard cards using static data.

## Dashboard Requirements

### Dashboard Goal

The dashboard should show a realistic hospital operations overview without becoming a marketing landing page.

It should feel like a work surface for hospital staff.

### Dashboard Sections

Required sections:

- Hospital overview summary.
- Today summary cards.
- Department activity.
- Queue and appointment snapshot.
- Bed occupancy snapshot.
- Revenue snapshot placeholder.
- Critical alerts.
- Pending approvals/tasks.
- Quick actions.
- Recent activity.

Recommended summary cards:

- Total OPD visits today.
- New registrations.
- Appointments today.
- Waiting patients.
- Active IPD patients.
- Available beds.
- Lab orders pending.
- Pharmacy pending dispense.
- Revenue today.
- Critical alerts.

Recommended dashboard widgets:

- OPD queue by department.
- Appointment timeline.
- Bed occupancy by ward.
- Lab/radiology pending worklist.
- Billing collection summary.
- Alerts and notifications.
- Doctor availability.
- Recent patient activity.

Dashboard responsive behavior:

- Desktop: 12-column grid.
- Laptop: 8 to 12-column adaptive grid.
- Tablet: 6-column or 2-column layout.
- Mobile: single-column stacked layout with compact cards.
- Charts should resize without cropping labels.
- Cards must have consistent height where placed in the same row.

## Global Search Requirements

### Search Goal

Allow users to quickly find patients, doctors, modules, appointments, invoices, lab reports, and actions.

### Search UI

Required behavior:

- Search input in top header.
- Keyboard shortcut placeholder: `/` or `Ctrl+K`.
- Search opens overlay or command palette.
- Search results grouped by type.
- Recent searches.
- Popular actions.
- Empty state.
- Loading state.
- No result state.

Search result groups:

- Patients.
- Doctors.
- Appointments.
- Modules.
- Bills.
- Lab reports.
- Radiology reports.
- Actions.

Static data examples:

- Patient: name, UHID, age, gender, phone, last visit.
- Doctor: name, department, availability.
- Module: module name, route, category.
- Bill: invoice number, patient, amount, status.
- Report: report number, test/modality, status.

Keyboard behavior:

- Focus search from shortcut.
- Arrow keys move through results.
- Enter selects result.
- Escape closes overlay.

## Notification Center Requirements

### Notification Goal

Show operational alerts and clinical/system tasks in one place.

### Notification Types

Required notification categories:

- Clinical alert.
- Critical lab alert.
- Appointment alert.
- Billing approval.
- Pharmacy stock alert.
- Bed management alert.
- Security alert.
- System message.
- Task assignment.

Required states:

- Unread.
- Read.
- Acknowledged.
- High priority.
- Medium priority.
- Low priority.

Notification UI:

- Notification icon in header with unread count.
- Dropdown preview for recent alerts.
- Full notification center page.
- Filter by type, priority, date, status.
- Detail drawer for selected notification.
- Mark as read action.
- Acknowledge action placeholder.

Responsive behavior:

- Desktop: dropdown plus full page.
- Tablet: larger popover or drawer.
- Mobile: full-screen notification page/sheet.

## Reusable Component Requirements

### Core Components

Phase 1 should create or define these reusable components:

- App shell.
- Sidebar.
- Header.
- Breadcrumb.
- Page header.
- Sticky action bar.
- Tabs.
- Drawer.
- Modal only for critical confirmation.
- Data table.
- Filter bar.
- Search input.
- Select/dropdown.
- Date picker placeholder.
- Form field wrapper.
- Text input.
- Textarea.
- Checkbox.
- Radio group.
- Toggle.
- Button.
- Icon button.
- Badge/chip.
- Status pill.
- Avatar.
- Stat card.
- Chart card placeholder.
- Empty state.
- Loading skeleton.
- Alert banner.
- Toast placeholder.
- Pagination.
- Stepper placeholder.

### Data Table Standard

All module tables should follow the same standard.

Required table features:

- Sticky table header.
- Column labels.
- Row actions.
- Bulk selection placeholder.
- Status pills.
- Empty state.
- Loading skeleton.
- Pagination.
- Sort indicator placeholder.
- Filter summary.
- Horizontal scroll inside table wrapper when needed.

Mobile table behavior:

- For simple lists, convert rows to compact cards.
- For dense clinical/finance tables, allow horizontal scroll inside the table wrapper.
- Important row actions should remain visible.

### Drawer Standard

Drawers are preferred over multiple popups.

Drawer types:

- Detail drawer.
- Create/edit drawer.
- Filter drawer.
- Audit drawer.
- Preview drawer.

Desktop behavior:

- Right drawer width: 420px to 720px depending on content.
- Drawer should not hide the main navigation.

Mobile behavior:

- Drawer becomes full-screen sheet.
- Header and close action remain sticky.
- Footer actions remain sticky.

## Design System Requirements

### Recommended UI Libraries

Use a small, high-quality library stack and keep one design system source of truth.

Recommended core stack:

| Need | Recommended Library | Why |
| --- | --- | --- |
| Styling system | Tailwind CSS | Fast responsive styling, design tokens, dark mode support, utility consistency. |
| Component foundation | shadcn/ui | Production-friendly component patterns built on Tailwind and Radix primitives. |
| Accessible primitives | Radix UI | Strong base for dialogs, dropdowns, popovers, tabs, select, and focus management. |
| Icons | lucide-react | Clean medical/admin-friendly icon style with consistent stroke icons. |
| Tables | TanStack Table | Best fit for complex HMS tables with sorting, filtering, pagination, column control, and custom UI. |
| Forms | React Hook Form | Good for large forms, low re-render patterns, and clinical/admin form workflows. |
| Validation | Zod | TypeScript-first schemas for form validation and future API validation. |
| Charts | Recharts | Practical dashboard charts for revenue, occupancy, queue, and department summaries. |
| Theme mode | next-themes | Light, dark, and system theme handling for Next.js. |
| Dates | date-fns | Date formatting and scheduling utilities for appointments, visits, and logs. |
| Toasts | Sonner or shadcn/ui toast pattern | Compact success/error feedback without blocking workflows. |
| Command search | cmdk through shadcn/ui Command | Global search and command palette behavior. |
| Class utilities | clsx, tailwind-merge, class-variance-authority | Clean variant handling for reusable components. |

Library rules:

- Do not mix multiple full UI kits such as MUI, Ant Design, Chakra, Mantine, and shadcn/ui in the same foundation.
- Use shadcn/ui plus Radix primitives as the main component base.
- Use Tailwind tokens and CSS variables for all colors, spacing, radius, and theme values.
- Use TanStack Table for reusable HMS data grids instead of custom table logic for every page.
- Use React Hook Form and Zod for forms that will later connect to APIs.
- Use lucide-react for app icons, navigation icons, and action icons.
- Use chart components only where data visualization is needed; avoid heavy chart usage in simple cards.
- Keep all library wrappers inside local reusable components so future changes are easier.

### Visual Style

The UI should feel:

- Professional.
- Clinical.
- Clean.
- Compact.
- Trustworthy.
- Fast to scan.
- Built for repeated daily use.

Avoid:

- Decorative hero sections.
- Marketing-style layouts.
- Long vertical pages.
- Excessive gradients.
- Oversized cards.
- Deep shadows.
- Weak contrast.
- Inconsistent spacing.

### Color Tokens

Recommended token categories:

- Background.
- Surface.
- Surface muted.
- Surface elevated.
- Surface overlay.
- Border.
- Border strong.
- Text primary.
- Text secondary.
- Text muted.
- Text inverse.
- Primary action.
- Primary action foreground.
- Secondary action.
- Secondary action foreground.
- Success.
- Success foreground.
- Warning.
- Warning foreground.
- Danger.
- Danger foreground.
- Info.
- Info foreground.
- Critical.
- Critical foreground.
- Input background.
- Input border.
- Input placeholder.
- Focus ring.
- Disabled background.
- Disabled text.
- Sidebar background.
- Sidebar foreground.
- Sidebar active background.
- Sidebar active foreground.
- Header background.
- Header border.
- Table header background.
- Table row hover.
- Drawer background.
- Modal overlay.
- Chart palette.
- Tooltip background.
- Tooltip foreground.
- Popover background.
- Popover foreground.
- Ring offset.
- Shadow color.
- Scrollbar thumb.
- Scrollbar track.

Status color use:

- Success: completed, paid, available, approved.
- Warning: pending, waiting, due soon.
- Danger: critical, overdue, rejected, emergency.
- Info: scheduled, in progress, assigned.
- Muted: inactive, cancelled, archived.

### Theme System

Phase 1 must include theme support because all future modules will depend on the same visual tokens.

Required theme modes:

- Light mode.
- Dark mode.
- System mode placeholder, where the UI can follow the device preference.

Required dynamic color options:

- Primary brand color selector.
- Preset color themes.
- Status colors remain consistent across all themes.
- Preview before apply.
- Reset to default theme.

Recommended preset themes:

- Clinical Blue.
- Care Green.
- Trust Teal.
- Emergency Red accent.
- Executive Neutral.

Theme behavior:

- Theme changes should update the whole app shell immediately.
- Theme state can use static client-side state in Phase 1.
- Future-ready storage can be planned for local storage or user profile settings.
- Theme should be token-based, not hardcoded inside individual components.
- Light and dark modes must preserve readable contrast.
- Dynamic primary color must update buttons, active navigation, focus rings, links, selected tabs, and important highlights.
- Status colors for success, warning, danger, info, and critical should not become confusing when the primary color changes.

Theme settings UI:

- Add theme controls to `/settings/ui` or a settings drawer.
- Include light, dark, and system segmented control.
- Include color preset swatches.
- Include custom primary color input or picker placeholder.
- Include density selector placeholder.
- Include layout preference placeholder, such as sidebar expanded/collapsed.

Theme acceptance:

- Light mode is polished and production-ready.
- Dark mode is polished and production-ready.
- Dynamic color presets change the app consistently.
- Text contrast remains readable in every mode.
- Tables, forms, drawers, alerts, charts, and dashboard cards work in both light and dark modes.
- Focus states remain visible in all themes.
- No component uses one-off colors that ignore the theme tokens.

### Production Theme Architecture

Theme implementation should be treated as a core platform feature, not a page-level setting.

Required architecture:

- Use CSS variables for all theme tokens.
- Map Tailwind utilities to CSS variables.
- Keep theme token names semantic, not color-name based. Use names like `background`, `surface`, `primary`, `primary-foreground`, `danger`, and `border`.
- Define light and dark values for every token.
- Define token layers: primitive palette, semantic alias tokens, and component-level usage.
- Keep component variants connected to tokens through class variants, not hardcoded hex values.
- Use `next-themes` for light, dark, and system mode.
- Prevent theme flash during initial page load.
- Use `color-scheme` so native browser controls match the active light or dark theme.
- Set browser theme color metadata where supported so mobile browser chrome looks correct.
- Avoid hydration mismatch by rendering theme-sensitive UI only after theme state is mounted when needed.
- Support safe fallback to default theme when saved theme data is missing or invalid.
- Store selected mode and dynamic primary color in client-side persistence for Phase 1.
- Prepare future migration to user-profile preferences from backend.
- Version the saved theme preference shape so future changes can migrate cleanly.

Recommended file responsibility:

- Theme provider: app-level theme mode and persistence.
- Theme tokens: global CSS variables for light/dark and color presets.
- Theme config: preset list, labels, swatches, and default values.
- Theme utilities: color validation, contrast helpers, and dynamic token generation.
- Theme settings UI: user-facing controls for mode, preset, custom color, density, and reset.
- Theme test samples: one preview area that renders representative components under the active theme.

Dynamic color rules:

- Custom color input must validate hex color values.
- Generated foreground text color must be readable on the selected primary color.
- Primary color should generate related states for hover, active, soft background, border, and focus ring.
- Prefer perceptual color handling such as OKLCH/HSL conversion for generated hover, active, and soft tones.
- Dynamic color changes must not alter clinical status meanings.
- Danger, warning, success, info, and critical colors should remain stable enough for staff recognition.
- If a custom color fails contrast rules, show a warning and prevent apply or auto-adjust the foreground token.
- Custom colors should be tested against both light and dark surfaces before applying.

Chart theme rules:

- Define chart color tokens separately from status colors.
- Provide at least 6 chart series colors for dashboards.
- Chart labels, grid lines, legends, and tooltips must use theme tokens.
- Chart colors must remain distinguishable in light and dark modes.
- Do not use danger/warning colors for normal chart series unless the data is actually alert-related.

Print and document theme rules:

- Print output should always use a clean light theme.
- Hide navigation, theme controls, and non-document actions in print.
- Preserve readable table borders and text in printed dashboard/report samples.
- Future prescriptions, invoices, discharge summaries, and lab reports should inherit print-safe tokens.

Component theme coverage:

- App shell.
- Sidebar.
- Header.
- Buttons.
- Icon buttons.
- Inputs.
- Selects.
- Checkboxes.
- Radio groups.
- Toggles.
- Tabs.
- Tables.
- Pagination.
- Drawers.
- Popovers.
- Dropdown menus.
- Command search.
- Notification center.
- Cards.
- Badges.
- Status pills.
- Alerts.
- Toasts.
- Charts.
- Empty states.
- Loading skeletons.
- Scrollbars where customized.

Theme interaction states:

- Default.
- Hover.
- Active.
- Selected.
- Focus visible.
- Disabled.
- Loading.
- Error.
- Warning.
- Success.
- Read-only.

### Theme Settings Page Requirements

The `/settings/ui` page should include a production-ready theme control area.

Required controls:

- Theme mode segmented control: light, dark, system.
- Preset swatches with selected state.
- Custom primary color picker or hex input.
- Live preview panel showing buttons, table row, alert, card, input, tab, and chart sample.
- Apply action.
- Cancel/revert action.
- Reset to default action.
- Density selector: comfortable and compact.
- Sidebar behavior selector: expanded, collapsed, auto.

Required behavior:

- Preview changes before final apply.
- Persist applied settings.
- Persist a versioned preference object, including mode, preset ID, custom primary color, density, and layout preference.
- Reset restores default mode, preset, density, and layout preference.
- Invalid custom color shows inline validation.
- Theme changes should not require page reload.
- Theme changes should not break active route or current drawer/search state.
- Theme controls remain usable by keyboard and screen reader.
- Settings UI clearly distinguishes previewed changes from applied changes.

Recommended persisted shape:

```ts
type UiPreference = {
  version: 1
  mode: "light" | "dark" | "system"
  colorPreset: "clinical-blue" | "care-green" | "trust-teal" | "emergency-red" | "executive-neutral" | "custom"
  customPrimary?: string
  density: "comfortable" | "compact"
  sidebar: "expanded" | "collapsed" | "auto"
}
```

### Theme Accessibility And QA

Theme QA must be included in Phase 1 acceptance because later clinical modules will reuse the same tokens.

Required checks:

- Text contrast meets WCAG AA for normal and large text.
- Primary buttons have readable foreground text in every preset.
- Focus ring is visible on light and dark backgrounds.
- Error, warning, success, info, and critical states remain distinguishable without relying only on color.
- Disabled states are clearly disabled but still readable where text is required.
- Charts have readable labels and distinguishable series colors in both modes.
- Skeleton loading states are visible but not visually noisy.
- Modal and drawer overlays are readable and do not lose depth in dark mode.
- Browser default form autofill styling does not create unreadable fields.
- Print view uses a clean light theme suitable for hospital documents.
- Reduced-motion preference is respected for theme transitions and UI animations.
- Windows high contrast / forced-colors mode does not make controls unusable.
- System mode updates when the OS theme changes.
- Theme persistence works after refresh and across routes.
- Invalid saved theme values safely fall back to defaults.
- Mobile browser address bar color does not clash with the active theme where supported.

Theme testing matrix:

| Test Area | Light Mode | Dark Mode | System Mode | Dynamic Preset | Custom Color | Print |
| --- | --- | --- | --- | --- | --- | --- |
| App shell | Required | Required | Required | Required | Required | Not needed |
| Dashboard | Required | Required | Required | Required | Required | Required |
| Search overlay | Required | Required | Required | Required | Required | Not needed |
| Notification center | Required | Required | Required | Required | Required | Not needed |
| Table component | Required | Required | Required | Required | Required | Required |
| Form component | Required | Required | Required | Required | Required | Required |
| Drawer component | Required | Required | Required | Required | Required | Not needed |
| Alert/status components | Required | Required | Required | Required | Required | Required |
| Chart samples | Required | Required | Required | Required | Required | Required |
| Browser autofill | Required | Required | Required | Required | Required | Not needed |
| Forced-colors mode | Required | Required | Required | Required | Required | Not needed |

### Typography

Typography should prioritize scan speed.

Recommended rules:

- Use clear heading hierarchy.
- Keep dashboard and module text compact.
- Avoid oversized headings inside operational screens.
- Keep button labels short.
- Keep table text readable at small sizes.
- Do not scale font size directly with viewport width.

### Spacing And Density

Support density modes as future-ready UI:

- Comfortable.
- Compact.

Phase 1 can implement one default density and prepare the token structure for density switching.

Recommended default:

- Compact enough for hospital workflows.
- Large enough for touch on tablet/mobile.
- Minimum mobile tap target: 44px height.

## Static Data Foundation

Phase 1 should introduce organized static data so later phases can reuse it.

Recommended data files:

- `mockRoles`.
- `mockUsers`.
- `mockDepartments`.
- `mockDoctors`.
- `mockPatients`.
- `mockAppointments`.
- `mockDashboardStats`.
- `mockNotifications`.
- `mockNavigation`.
- `mockRecentActivity`.
- `mockThemePresets`.

Recommended common fields:

- `id`.
- `code`.
- `name`.
- `status`.
- `createdAt`.
- `updatedAt`.

Patient example fields:

- UHID.
- Name.
- Age.
- Gender.
- Phone.
- Department.
- Last visit.
- Alert flags.

Notification example fields:

- ID.
- Type.
- Title.
- Message.
- Priority.
- Status.
- Related module.
- Related patient.
- Created time.

Navigation item example fields:

- ID.
- Label.
- Icon.
- Route.
- Group.
- Allowed roles.
- Status.

## Accessibility Requirements

Required:

- Keyboard navigation for menus, tabs, drawers, and search.
- Visible focus states.
- Proper button labels.
- Icon buttons must have accessible labels.
- Forms must have labels.
- Tables must have clear column headers.
- Color should not be the only way to communicate status.
- Dialog/drawer close controls must be keyboard accessible.
- Escape should close overlays where appropriate.

Target:

- WCAG AA contrast for text and important UI states.
- No keyboard traps.
- All primary workflows usable without a mouse.

## Responsiveness Requirements

### Breakpoint Strategy

Recommended breakpoints:

| Device | Width Range | Layout Behavior |
| --- | --- | --- |
| Mobile small | 320px to 374px | Single column, compact header, full-screen drawers. |
| Mobile large | 375px to 767px | Single column, bottom actions, drawer sheets. |
| Tablet | 768px to 1023px | Two-column where possible, collapsible sidebar. |
| Laptop | 1024px to 1439px | Sidebar visible/collapsible, compact dashboard grid. |
| Desktop | 1440px and above | Full sidebar, wide grid, split panels. |

### Device-Specific Responsive Behavior

Phase 1 must define how the same HMS foundation behaves on every major device size.

#### Phone

Target widths:

- 320px.
- 375px.
- 390px.
- 414px.
- 430px.

Required behavior:

- Use single-column layout.
- Replace desktop sidebar with mobile menu drawer or bottom navigation.
- Keep header compact with menu, title/context, search, notification, and profile access.
- Search opens as full-screen command/search sheet.
- Drawers become full-screen sheets.
- Sticky action buttons move to the bottom with safe-area spacing.
- Dashboard cards stack vertically with compact spacing.
- Tables should become card lists when possible.
- Dense tables may scroll horizontally only inside the table container.
- Tabs should become horizontally scrollable or compact segmented controls.
- Filters should open inside a filter drawer/sheet.
- Primary actions must stay thumb-friendly.
- Text, buttons, status chips, and icons must not overlap.

Phone acceptance:

- No page-level horizontal scroll.
- User can navigate to dashboard, search, notifications, settings, and all navigation groups.
- Sticky bottom actions do not cover content.
- All controls are usable with touch.
- Header remains readable on 320px width.

#### Tablet

Target widths:

- 768px.
- 820px.
- 834px.
- 1024px portrait.

Required behavior:

- Use two-column layouts where useful.
- Sidebar can be collapsed to icons or opened as overlay.
- Header remains sticky and can show more controls than phone.
- Dashboard uses 2-column or 3-column card layout depending on width.
- Tables can remain table format with internal horizontal scroll for dense data.
- Drawers use medium-width side drawer in landscape and full-screen/large sheet in portrait when needed.
- Filter controls may appear inline for simple pages and in drawers for complex pages.
- Touch targets remain at least 44px high.

Tablet acceptance:

- Sidebar state is clear and usable.
- Dashboard does not feel like stretched mobile UI.
- Forms can use two columns where space allows.
- Drawers, popovers, and dropdowns do not overflow the viewport.

#### Laptop

Target widths:

- 1024px.
- 1280px.
- 1366px.

Required behavior:

- Sidebar should be visible or collapsible.
- Header can show hospital context, department selector, search, notifications, and profile.
- Dashboard uses compact multi-column grid.
- Tables use full table layout.
- Drawers open from the right without hiding primary navigation.
- Split views can be used for dashboard/worklist plus detail preview.
- Sticky page headers and action bars remain visible.

Laptop acceptance:

- Common hospital workflows fit without excessive scrolling.
- Main content width remains comfortable.
- Table actions and filters stay easy to scan.
- No layout shift when sidebar collapses or expands.

#### Desktop

Target widths:

- 1440px.
- 1536px.
- 1600px.

Required behavior:

- Full sidebar is visible by default.
- Dashboard uses 12-column layout.
- Work surfaces can use split panels.
- Tables, filters, and summary widgets should fit comfortably.
- Drawers can use 420px to 720px width depending on content.
- Sticky headers should keep context visible during workflow.

Desktop acceptance:

- UI is dense but not crowded.
- No oversized marketing-style sections.
- Important actions are visible without hunting.
- Dashboard shows multiple operational widgets without long scrolling.

#### Wide Desktop

Target widths:

- 1920px and above.

Required behavior:

- Content should use a maximum readable width where full stretch would hurt scanning.
- Operational dashboards may use wider grids only when the data benefits from it.
- Tables can use wider columns but should not become visually sparse.
- Optional right-side panels can show details, activity, or alerts.
- Avoid leaving the interface feeling empty on wide monitors.

Wide desktop acceptance:

- Dashboard feels intentionally arranged, not stretched.
- Tables remain readable.
- Split layouts use space productively.
- Critical actions and alerts remain near the working area.

### Device Testing Targets

Phase 1 should be checked against:

- 320px mobile.
- 375px mobile.
- 414px mobile.
- 768px tablet.
- 820px tablet.
- 1024px laptop.
- 1366px desktop.
- 1440px desktop.
- 1536px desktop.
- 1920px wide desktop.

### Responsive Acceptance Rules

- No horizontal page scrolling.
- Tables may scroll only inside their own container.
- Sticky headers must not cover content.
- Sticky bottom actions must not cover form fields.
- Text must not overlap icons or buttons.
- Sidebar/drawer must be usable on touch devices.
- Search overlay must fit mobile viewport.
- Notification dropdown must not overflow outside the screen.
- Dashboard cards must remain readable at all supported widths.
- Navigation must be reachable on every device.
- Drawers, popovers, dropdowns, and command search must stay inside the viewport.
- Touch targets must be large enough on phone and tablet.
- Tables must preserve important actions on small screens.
- Forms should switch between one-column and two-column layouts based on available width.
- Dashboard widgets should reflow without changing content meaning.
- Safe-area spacing should be respected on mobile devices.
- Orientation changes should not break shell, drawer, table, or sticky action layouts.

## Performance Requirements

Even with static data, Phase 1 should prepare for production performance.

Required:

- Avoid unnecessary large client components.
- Keep static data separated from UI components.
- Use reusable layout primitives.
- Avoid heavy chart libraries unless actually needed.
- Use lazy loading for large overlays or preview-only pages where appropriate.
- Keep initial dashboard lightweight.

Target:

- Fast route transitions.
- No visible layout shift in shell/header/sidebar.
- Skeletons for loading-looking states.
- Stable card/table dimensions.

## Page-Level Detail

### 1. App Shell

Purpose:

The app shell provides the base experience for all hospital users.

Must include:

- Sidebar navigation.
- Top header.
- Hospital name and logo area.
- Department selector.
- Role switcher placeholder.
- Global search trigger.
- Notification trigger.
- User menu.
- Responsive main content area.

Primary interactions:

- Collapse/expand sidebar.
- Open mobile menu.
- Switch role using static roles.
- Open search overlay.
- Open notification preview.
- Open profile menu.

Acceptance:

- Shell works at all target screen sizes.
- Navigation active state is visible.
- Header does not overlap content.
- Mobile menu is easy to open and close.

### 2. Dashboard

Purpose:

Show a concise operational summary for hospital staff and management.

Must include:

- Today stats.
- Queue snapshot.
- Appointment snapshot.
- Bed occupancy summary.
- Lab/radiology pending summary.
- Revenue placeholder.
- Critical alerts.
- Pending tasks.
- Recent activity.
- Quick actions.

Primary interactions:

- Change role and see dashboard emphasis change.
- Open quick action drawer placeholder.
- Click stat card and navigate to placeholder route or filtered state.
- Filter dashboard by department placeholder.

Acceptance:

- Dashboard uses compact grid layout.
- No long vertical content on desktop.
- Mobile layout remains readable.
- Charts/placeholders do not break responsive layout.

### 3. Global Search

Purpose:

Provide fast access to records, modules, and actions.

Must include:

- Header search trigger.
- Search overlay.
- Grouped results.
- Recent searches.
- Empty and no-result states.
- Keyboard navigation behavior.

Primary interactions:

- Open search with click.
- Open search with keyboard shortcut.
- Type query.
- Navigate results.
- Select result.
- Close search.

Acceptance:

- Search opens quickly.
- Search is usable on mobile.
- Results are grouped clearly.
- Keyboard interaction is predictable.

### 4. Notification Center

Purpose:

Show alerts and tasks from across the hospital.

Must include:

- Header notification icon.
- Unread count.
- Preview dropdown.
- Full notification center page.
- Filters.
- Notification detail drawer.
- Mark read action.
- Acknowledge placeholder.

Primary interactions:

- Open notification preview.
- Open full notification page.
- Filter by type/status/priority.
- Open notification detail.
- Mark as read.

Acceptance:

- High-priority alerts are visually clear.
- Mobile notification UI is full-screen friendly.
- Detail drawer does not break layout.

### 5. Components Preview

Purpose:

Provide an internal page to verify design system components before using them across phases.

Must include:

- Buttons.
- Icon buttons.
- Inputs.
- Selects.
- Tabs.
- Table.
- Drawer.
- Cards.
- Badges.
- Alerts.
- Empty states.
- Loading states.

Acceptance:

- Components show normal, hover, disabled, loading, success, warning, and danger states where relevant.
- Components remain responsive.
- Component spacing and typography are consistent.

## Component Acceptance Checklist

- Buttons have clear hierarchy: primary, secondary, outline, ghost, danger.
- Icon buttons have accessible labels.
- Tabs support active, inactive, disabled, and overflow states.
- Drawers support desktop side drawer and mobile full-screen sheet.
- Tables support sticky header and responsive behavior.
- Forms support labels, helper text, error text, and disabled state.
- Status pills are visually consistent.
- Empty states are useful but compact.
- Loading skeletons preserve layout dimensions.
- Toast/alert patterns do not cover primary workflow controls.

## Production-Grade Quality Checklist

Phase 1 is complete when:

- Application shell is implemented and responsive.
- Dashboard page is implemented with realistic static data.
- Global search UI works with static grouped results.
- Notification center works with static notifications.
- Recommended UI library stack is installed and used consistently.
- Light mode, dark mode, and dynamic theme color options are available.
- Theme system uses semantic CSS variables and Tailwind token mapping.
- Theme does not flash incorrectly during initial load.
- Theme settings are persisted locally and can be reset to defaults.
- Theme preference uses a versioned shape for future migration.
- Custom primary colors are validated for contrast before apply.
- System mode follows OS preference changes.
- Browser native controls, autofill, and mobile browser chrome match the active theme where supported.
- Print output uses a clean light theme.
- Theme QA passes for app shell, dashboard, search, notifications, tables, forms, drawers, alerts, and charts.
- Reusable component patterns are ready for future modules.
- Navigation structure supports all planned HMS modules.
- Role switcher placeholder updates UI state.
- Sticky headers and sticky actions are implemented correctly.
- Drawers work on desktop, tablet, and mobile.
- UI has no visible overlap at target device widths.
- Phone, tablet, laptop, desktop, and wide-desktop layouts are explicitly verified.
- Navigation, search, notifications, drawers, tables, forms, dashboard cards, and sticky actions work on every device category.
- No full-page reload is required for navigation.
- No deep nested menus are introduced.
- Static data is organized and reusable.
- Accessibility basics are covered.
- Layout feels compact, clinical, and enterprise-grade.

## Suggested Implementation Order

1. Create design tokens and global layout rules.
2. Build theme provider with light mode, dark mode, system mode, dynamic presets, persistence, and no-flash handling.
3. Build app shell, sidebar, header, and responsive navigation.
4. Build reusable page header, tabs, drawer, table, buttons, inputs, badges, cards, alerts, theme settings controls, and preview components.
5. Add static mock data foundation.
6. Build dashboard page.
7. Build global search overlay.
8. Build notification center.
9. Build components preview page.
10. Verify responsiveness across target screen sizes.
11. Verify theme quality across light, dark, presets, and custom primary color.
12. Polish spacing, states, accessibility, and keyboard behavior.

## Phase 1 Deliverables

- Production-grade app shell.
- Responsive dashboard.
- Global search UI.
- Notification center UI.
- Reusable UI component foundation.
- UI library foundation using Tailwind CSS, shadcn/ui, Radix UI, lucide-react, TanStack Table, React Hook Form, Zod, Recharts, and next-themes.
- Light/dark/system theme system with dynamic color presets.
- Theme settings page with mode, color preset, custom color, density, preview, apply, cancel, and reset controls.
- Semantic token system for shell, components, states, charts, tables, drawers, and alerts.
- Enterprise theme hardening for no-flash loading, persistence migration, browser native controls, print, forced-colors mode, and chart palettes.
- Static mock data foundation.
- Role-aware navigation placeholder.
- Responsive testing pass for all target devices.
- Device-specific responsive behavior for phone, tablet, laptop, desktop, and wide desktop.
- Internal component preview page.

## Handoff Notes For Phase 2

Phase 2 can begin after Phase 1 provides:

- Stable app shell.
- Role-aware navigation structure.
- Page header pattern.
- Form components.
- Table components.
- Drawer components.
- Static role/user/department data.
- Security/admin route placeholders.

Phase 2 should then focus on authentication, role and permission management, user management, department management, hospital master setup, branch future-ready UI, security management, and audit logs.
