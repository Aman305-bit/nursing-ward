import {
  Activity,
  Ambulance,
  Archive,
  BedDouble,
  Bell,
  CalendarClock,
  ClipboardList,
  DoorOpen,
  FileCheck2,
  FilePenLine,
  Droplets,
  HeartPulse,
  IdCard,
  LayoutDashboard,
  Package,
  ScanSearch,
  Search,
  Settings,
  Stethoscope,
  Syringe,
} from "lucide-react";

import type { NavigationChildItem, NavigationItem, Role } from "@/types";
import { getNursingRoleNavigation } from "@/data/icu-nursing-role-permissions";

export const roles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Doctor",
  "Doctor ICU",
  "Ward Nurse",
  "Unit Nurse",
  "Head Nurse",
  "ICU Bed Coordinator",
  "Diagnostics Team",
  "Tele ICU Doctor",
  "Biomedical Engineer",
  "ICU Pharmacist",
  "Quality Audit",
  "Nurse",
  "Receptionist",
  "Lab Technician",
  "Radiologist",
  "Pharmacist",
  "Billing Executive",
  "HR Manager",
  "Management",
];

const icuPersonaRoles: Role[] = [
  "Doctor ICU",
  "Ward Nurse",
  "Unit Nurse",
  "Head Nurse",
  "ICU Bed Coordinator",
  "Diagnostics Team",
  "Tele ICU Doctor",
  "Biomedical Engineer",
  "ICU Pharmacist",
  "Quality Audit",
];

export const icuCommandSwitcherRoles: Role[] = ["Hospital Admin", ...icuPersonaRoles];

const allRoles = roles.filter((role) => !icuPersonaRoles.includes(role));

const icuCommandAllowedRoles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  ...icuPersonaRoles,
];

function navChild(id: string, label: string, route: string, children?: NavigationChildItem[]): NavigationChildItem {
  return { id, label, route, status: "ready", children };
}

function icuPersonaIcon(label: string) {
  if (label === "Patients" || label === "Patient Review") return IdCard;
  if (label === "Critical Care" || label === "Clinical Intelligence") return HeartPulse;
  if (label === "Clinical Workspace") return FilePenLine;
  if (label === "Nursing") return ClipboardList;
  if (label === "Diagnostics") return ScanSearch;
  if (label === "Tele ICU") return Activity;
  if (label === "Device Operations") return Package;
  if (label === "Analytics") return LayoutDashboard;
  if (label === "Administration") return Settings;
  return HeartPulse;
}

function icuPersonaItem(role: Role, child: NavigationChildItem): NavigationItem {
  return {
    id: `icu-persona-${child.id}`,
    label: child.label,
    icon: icuPersonaIcon(child.label),
    route: child.route,
    group: "ICU",
    allowedRoles: [role],
    status: child.status,
    children: child.children,
  };
}

const icuPersonaNavigation: Partial<Record<Role, NavigationChildItem[]>> = {
  "Doctor ICU": [
    navChild("doctor-icu-critical-care", "Critical Care", "/icu-command-center/critical-care/clinical-alerts", [
      navChild("doctor-icu-clinical-alerts", "Clinical Alerts", "/icu-command-center/critical-care/clinical-alerts"),
      navChild("doctor-icu-round-2", "ICU Round", "/icu-command-center/critical-care/icu-round-2"),
      navChild("doctor-icu-escalation", "Escalation Center", "/icu-command-center/critical-care/escalation-center"),
    ]),
    navChild("doctor-icu-clinical-workspace", "Clinical Workspace", "/icu-command-center/clinical-workspace/progress-notes", [
      navChild("doctor-icu-progress-notes", "Progress Notes", "/icu-command-center/clinical-workspace/progress-notes"),
      navChild("doctor-icu-family-communication", "Family Communication", "/icu-command-center/clinical-workspace/family-communication"),
    ]),
    navChild("doctor-icu-patient-review", "Patient Review", "/icu-command-center/patients/icu-001?tab=monitoring", [
      navChild("doctor-icu-monitoring", "Monitoring", "/icu-command-center/patients/icu-001?tab=monitoring"),
      navChild("doctor-icu-results", "Results", "/icu-command-center/patients/icu-001?tab=results"),
      navChild("doctor-icu-vital-graph", "Vital Graph", "/icu-command-center/patients/icu-001?tab=graph"),
    ]),
  ],
  "Ward Nurse": getNursingRoleNavigation("Ward Nurse")!,
  "Unit Nurse": getNursingRoleNavigation("Unit Nurse")!,
  "Head Nurse": getNursingRoleNavigation("Head Nurse")!,
  "ICU Bed Coordinator": [
    navChild("bed-coordinator-command", "Command", "/icu-command-center", [
      navChild("bed-coordinator-command-center", "Command Center", "/icu-command-center"),
    ]),
    navChild("bed-coordinator-patients", "Patients", "/icu-command-center/patients/search", [
      navChild("bed-coordinator-patient-search", "Patient Search", "/icu-command-center/patients/search"),
      navChild("bed-coordinator-smart-bed", "Smart Bed View", "/icu-command-center/patients/smart-bed-view"),
      navChild("bed-coordinator-admissions", "Admissions", "/icu-command-center/patients/admissions"),
      navChild("bed-coordinator-discharges", "Discharges", "/icu-command-center/patients/discharges"),
    ]),
    navChild("bed-coordinator-critical-care", "Critical Care", "/icu-command-center/critical-care/operations", [
      navChild("bed-coordinator-operations", "ICU Operations", "/icu-command-center/critical-care/operations"),
    ]),
  ],
  "Diagnostics Team": [
    navChild("diagnostics-team-diagnostics", "Diagnostics", "/icu-command-center/diagnostics/hub", [
      navChild("diagnostics-team-hub", "Diagnostics Hub", "/icu-command-center/diagnostics/hub"),
      navChild("diagnostics-team-upload", "Report Upload & Extract", "/icu-command-center/diagnostics/investigation-entry"),
    ]),
    navChild("diagnostics-team-patient-review", "Patient Review", "/icu-command-center/patients/icu-001?tab=results", [
      navChild("diagnostics-team-results", "Results", "/icu-command-center/patients/icu-001?tab=results"),
    ]),
  ],
  "Tele ICU Doctor": [
    navChild("tele-doctor-tele-icu", "Tele ICU", "/icu-command-center/tele-icu/remote-command-center", [
      navChild("tele-doctor-remote-command", "Remote Command Center", "/icu-command-center/tele-icu/remote-command-center"),
      navChild("tele-doctor-consults", "Remote Consultations", "/icu-command-center/tele-icu/remote-consultations"),
      navChild("tele-doctor-escalated", "Escalated Cases", "/icu-command-center/tele-icu/escalated-cases"),
    ]),
    navChild("tele-doctor-patient-review", "Patient Review", "/icu-command-center/patients/icu-001?tab=monitoring", [
      navChild("tele-doctor-monitoring", "Monitoring", "/icu-command-center/patients/icu-001?tab=monitoring"),
      navChild("tele-doctor-results", "Results", "/icu-command-center/patients/icu-001?tab=results"),
      navChild("tele-doctor-vital-graph", "Vital Graph", "/icu-command-center/patients/icu-001?tab=graph"),
    ]),
    navChild("tele-doctor-critical-care", "Critical Care", "/icu-command-center/critical-care/escalation-center", [
      navChild("tele-doctor-alerts", "Clinical Alerts", "/icu-command-center/critical-care/clinical-alerts"),
      navChild("tele-doctor-escalation", "Escalation Center", "/icu-command-center/critical-care/escalation-center"),
    ]),
  ],
  "Biomedical Engineer": [
    navChild("biomed-critical-care", "Critical Care", "/icu-command-center/critical-care/device-monitoring", [
      navChild("biomed-device-monitoring", "Device Monitoring", "/icu-command-center/critical-care/device-monitoring"),
    ]),
    navChild("biomed-devices", "Device Operations", "/icu-command-center/device-operations/edge-device-management", [
      navChild("biomed-edge-devices", "Edge Device Management", "/icu-command-center/device-operations/edge-device-management"),
      navChild("biomed-device-mapping", "Device Mapping", "/icu-command-center/device-operations/device-mapping"),
      navChild("biomed-connectivity", "Connectivity Dashboard", "/icu-command-center/device-operations/connectivity-dashboard"),
      navChild("biomed-signal-health", "Signal Health", "/icu-command-center/device-operations/signal-health"),
    ]),
    navChild("biomed-analytics", "Analytics", "/icu-command-center/analytics/device", [
      navChild("biomed-device-analytics", "Device Analytics", "/icu-command-center/analytics/device"),
    ]),
  ],
  "ICU Pharmacist": [
    navChild("icu-pharmacist-command", "Command", "/icu-command-center/notifications-tasks", [
      navChild("icu-pharmacist-notifications", "Notifications & Tasks", "/icu-command-center/notifications-tasks"),
    ]),
    navChild("icu-pharmacist-nursing", "Nursing", "/icu-command-center/nursing/medication-administration", [
      navChild("icu-pharmacist-medication", "Medication Administration", "/icu-command-center/nursing/medication-administration"),
      navChild("icu-pharmacist-med-chart", "Patient Medication Chart", "/icu-command-center/nursing/patient-medication"),
    ]),
    navChild("icu-pharmacist-clinical", "Clinical Workspace", "/icu-command-center/clinical-workspace/orders-care-plans", [
      navChild("icu-pharmacist-orders-care", "Orders & Care Plans", "/icu-command-center/clinical-workspace/orders-care-plans"),
    ]),
    navChild("icu-pharmacist-patient-review", "Patient Review", "/icu-command-center/patients/icu-001?tab=orders", [
      navChild("icu-pharmacist-med-orders", "Medication & Orders", "/icu-command-center/patients/icu-001?tab=orders"),
    ]),
  ],
  "Quality Audit": [
    navChild("quality-command", "Command", "/icu-command-center/executive-dashboard", [
      navChild("quality-executive", "Executive Dashboard", "/icu-command-center/executive-dashboard"),
    ]),
    navChild("quality-intelligence", "Clinical Intelligence", "/icu-command-center/clinical-intelligence/patient-risk-center", [
      navChild("quality-risk", "Patient Risk Center", "/icu-command-center/clinical-intelligence/patient-risk-center"),
      navChild("quality-ews", "Early Warning Scores", "/icu-command-center/clinical-intelligence/early-warning-scores"),
    ]),
    navChild("quality-analytics", "Analytics", "/icu-command-center/analytics/clinical", [
      navChild("quality-operational", "Operational Analytics", "/icu-command-center/analytics/operational"),
      navChild("quality-clinical", "Clinical Analytics", "/icu-command-center/analytics/clinical"),
      navChild("quality-pilot", "Pilot Outcome Dashboard", "/icu-command-center/analytics/pilot-outcome"),
      navChild("quality-adoption", "Adoption Analytics", "/icu-command-center/analytics/adoption"),
    ]),
    navChild("quality-administration", "Administration", "/icu-command-center/administration/audit-logs", [
      navChild("quality-audit-logs", "Audit Logs", "/icu-command-center/administration/audit-logs"),
    ]),
  ],
};

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, route: "/dashboard", group: "Command", allowedRoles: allRoles, status: "ready" },
  { id: "search", label: "Global Search", icon: Search, route: "/search", group: "Command", allowedRoles: allRoles, status: "ready" },
  { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications", group: "Command", allowedRoles: allRoles, status: "ready" },
  {
    id: "patient-journey",
    label: "Patient Journey",
    icon: Activity,
    route: "/patient-journey",
    group: "Command",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Lab Technician", "Radiologist", "Pharmacist", "Billing Executive", "Management"],
    status: "ready",
    children: [
      { id: "patient-journey-dashboard", label: "Dashboard", route: "/patient-journey", status: "ready" },
      { id: "patient-journey-live-board", label: "Live Board", route: "/patient-journey/live-board", status: "ready" },
      { id: "patient-journey-queue", label: "Queue", route: "/patient-journey/queue", status: "ready" },
      { id: "patient-journey-emergency", label: "Emergency Desk", route: "/patient-journey/emergency-desk", status: "ready" },
      { id: "patient-journey-ipd", label: "IPD Tracker", route: "/patient-journey/ipd-tracker", status: "ready" },
      { id: "patient-journey-icu", label: "ICU Command", route: "/patient-journey/icu-command", status: "ready" },
      { id: "patient-journey-ot", label: "OT Tracker", route: "/patient-journey/ot-tracker", status: "ready" },
      { id: "patient-journey-lab", label: "Lab Tracker", route: "/patient-journey/lab-tracker", status: "ready" },
      { id: "patient-journey-radiology", label: "Radiology Tracker", route: "/patient-journey/radiology-tracker", status: "ready" },
      { id: "patient-journey-pharmacy", label: "Pharmacy Tracker", route: "/patient-journey/pharmacy-tracker", status: "ready" },
      { id: "patient-journey-billing", label: "Billing Tracker", route: "/patient-journey/billing-tracker", status: "ready" },
      { id: "patient-journey-insurance", label: "Insurance Tracker", route: "/patient-journey/insurance-tracker", status: "ready" },
      { id: "patient-journey-discharge", label: "Discharge Tracker", route: "/patient-journey/discharge-tracker", status: "ready" },
      { id: "patient-journey-followup", label: "Follow-up Tracker", route: "/patient-journey/follow-up-tracker", status: "ready" },
      { id: "patient-journey-alerts", label: "Alerts", route: "/patient-journey/alerts", status: "ready" },
      { id: "patient-journey-bottlenecks", label: "Bottlenecks", route: "/patient-journey/bottlenecks", status: "ready" },
      { id: "patient-journey-settings", label: "Settings", route: "/patient-journey/settings", status: "ready" },
    ],
  },
  {
    id: "bundle",
    label: "Bundle",
    icon: Package,
    route: "/bundle",
    group: "Bundle",
    allowedRoles: allRoles,
    status: "ready",
    children: [
      { id: "bundle-overview", label: "Overview", route: "/bundle", status: "ready" },
      { id: "bundle-buttons", label: "Buttons", route: "/bundle/buttons", status: "ready" },
      { id: "bundle-forms", label: "Forms", route: "/bundle/forms", status: "ready" },
      { id: "bundle-inputs", label: "Inputs", route: "/bundle/inputs", status: "ready" },
      { id: "bundle-cards", label: "Cards", route: "/bundle/cards", status: "ready" },
      { id: "bundle-tables", label: "Tables", route: "/bundle/tables", status: "ready" },
      { id: "bundle-modals", label: "Modals", route: "/bundle/modals", status: "ready" },
      { id: "bundle-tabs", label: "Tabs", route: "/bundle/tabs", status: "ready" },
      { id: "bundle-badges", label: "Badges & Status", route: "/bundle/badges", status: "ready" },
      { id: "bundle-alerts", label: "Alerts & Toasts", route: "/bundle/alerts", status: "ready" },
      { id: "bundle-dropdowns", label: "Dropdowns", route: "/bundle/dropdowns", status: "ready" },
      { id: "bundle-date-time", label: "Date & Time Pickers", route: "/bundle/date-time", status: "ready" },
      { id: "bundle-search-filters", label: "Search & Filters", route: "/bundle/search-filters", status: "ready" },
      { id: "bundle-charts", label: "Charts & Graphs", route: "/bundle/charts", status: "ready" },
      { id: "bundle-dashboard-widgets", label: "Dashboard Widgets", route: "/bundle/dashboard-widgets", status: "ready" },
      { id: "bundle-patient-components", label: "Patient UI Components", route: "/bundle/patient-components", status: "ready" },
      { id: "bundle-hospital-components", label: "Hospital UI Components", route: "/bundle/hospital-components", status: "ready" },
      { id: "bundle-billing-components", label: "Billing UI Components", route: "/bundle/billing-components", status: "ready" },
      { id: "bundle-pharmacy-components", label: "Pharmacy UI Components", route: "/bundle/pharmacy-components", status: "ready" },
      { id: "bundle-lab-components", label: "Lab/Diagnostics UI Components", route: "/bundle/lab-components", status: "ready" },
      { id: "bundle-empty-loaders", label: "Empty States & Loaders", route: "/bundle/empty-loaders", status: "ready" },
      { id: "bundle-timeline", label: "Timeline & Activity Logs", route: "/bundle/timeline", status: "ready" },
      { id: "bundle-file-upload", label: "File Upload Components", route: "/bundle/file-upload", status: "ready" },
      { id: "bundle-stepper", label: "Stepper / Wizard Forms", route: "/bundle/stepper", status: "ready" },
      { id: "bundle-settings-ui", label: "Settings UI", route: "/bundle/settings-ui", status: "ready" },
      { id: "bundle-typography-icons", label: "Typography & Icons", route: "/bundle/typography-icons", status: "ready" },
    ],
  },
  { id: "patients", label: "Patient", icon: IdCard, route: "/patients", group: "Clinical", allowedRoles: allRoles, status: "ready" },
  {
    id: "notes",
    label: "Notes",
    icon: FilePenLine,
    route: "/notes/all-notes",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Management"],
    status: "ready",
    children: [
      { id: "notes-all", label: "All Notes", route: "/notes/all-notes", status: "ready" },
      { id: "notes-medical", label: "Medical Notes", route: "/notes/all-notes?category=medical", status: "ready" },
      { id: "notes-surgery", label: "Surgery Notes", route: "/notes/all-notes?category=surgery", status: "ready" },
      { id: "notes-operative", label: "Operative Notes", route: "/notes/all-notes?category=operative", status: "ready" },
      { id: "notes-nurse", label: "Nurse Notes", route: "/notes/all-notes?category=nurse", status: "ready" },
      { id: "notes-pharmacy", label: "Pharmacy Notes", route: "/notes/all-notes?category=pharmacy", status: "ready" },
      { id: "notes-allied", label: "Allied Health Notes", route: "/notes/all-notes?category=allied", status: "ready" },
    ],
  },
  { id: "appointments", label: "Appointment", icon: CalendarClock, route: "/appointments", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Receptionist", "Doctor", "Nurse", "Billing Executive", "Management"], status: "ready" },
  {
    id: "admission",
    label: "Admission",
    icon: DoorOpen,
    route: "/admission",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Management"],
    status: "ready",
    children: [
      { id: "admission-admin", label: "Admin Overview", route: "/admission", status: "ready" },
      { id: "admission-reception", label: "Reception", route: "/admission/reception", status: "ready" },
      { id: "admission-doctor", label: "Doctor Order", route: "/admission/doctor", status: "ready" },
      { id: "admission-desk", label: "Admission Desk", route: "/admission/admission-desk", status: "ready" },
      { id: "admission-billing", label: "Billing Clearance", route: "/admission/billing", status: "ready" },
      { id: "admission-bed-manager", label: "Bed Manager", route: "/admission/bed-manager", status: "ready" },
      { id: "admission-nurse-receive", label: "Nurse Receive", route: "/admission/nurse-receive", status: "ready" },
      { id: "admission-nurse-care", label: "Nurse Care", route: "/admission/nurse-care", status: "ready" },
    ],
  },
  { id: "opd", label: "OPD", icon: Stethoscope, route: "/opd", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Technician", "Management"], status: "ready" },
  { id: "ipd", label: "IPD", icon: BedDouble, route: "/ipd", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Pharmacist", "Management"], status: "ready" },
  {
    id: "icu-command-center",
    label: "ICU Command Center",
    icon: HeartPulse,
    route: "/icu-command-center",
    group: "Clinical",
    allowedRoles: icuCommandAllowedRoles,
    status: "ready",
    children: [
      {
        id: "icu-command-group-command",
        label: "Command",
        route: "/icu-command-center",
        status: "ready",
        children: [
          { id: "icu-command-home", label: "Command Center", route: "/icu-command-center", status: "ready" },
          { id: "icu-command-executive", label: "Executive Dashboard", route: "/icu-command-center/executive-dashboard", status: "ready" },
          { id: "icu-command-notifications", label: "Notifications & Tasks", route: "/icu-command-center/notifications-tasks", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-patients",
        label: "Patients",
        route: "/icu-command-center/patients/search",
        status: "ready",
        children: [
          { id: "icu-command-patient-search", label: "Patient Search", route: "/icu-command-center/patients/search", status: "ready" },
          { id: "icu-command-smart-bed", label: "Smart Bed View", route: "/icu-command-center/patients/smart-bed-view", status: "ready" },
          { id: "icu-command-admissions", label: "Admissions", route: "/icu-command-center/patients/admissions", status: "ready" },
          { id: "icu-command-discharges", label: "Discharges", route: "/icu-command-center/patients/discharges", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-critical-care",
        label: "Critical Care",
        route: "/icu-command-center/critical-care/operations",
        status: "ready",
        children: [
          { id: "icu-command-operations", label: "ICU Operations", route: "/icu-command-center/critical-care/operations", status: "ready" },
          { id: "icu-command-device-monitoring", label: "Device Monitoring", route: "/icu-command-center/critical-care/device-monitoring", status: "ready" },
          { id: "icu-command-alerts", label: "Clinical Alerts", route: "/icu-command-center/critical-care/clinical-alerts", status: "ready" },
          { id: "icu-command-rounds", label: "ICU Rounds", route: "/icu-command-center/critical-care/rounds", status: "ready" },
          { id: "icu-command-round-2", label: "ICU Round", route: "/icu-command-center/critical-care/icu-round-2", status: "ready" },
          { id: "icu-command-escalation", label: "Escalation Center", route: "/icu-command-center/critical-care/escalation-center", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-clinical-workspace",
        label: "Clinical Workspace",
        route: "/icu-command-center/clinical-workspace/patient-overview",
        status: "ready",
        children: [
          { id: "icu-command-patient-overview", label: "Patient Overview", route: "/icu-command-center/clinical-workspace/patient-overview", status: "ready" },
          { id: "icu-command-progress-notes", label: "Progress Notes", route: "/icu-command-center/clinical-workspace/progress-notes", status: "ready" },
          { id: "icu-command-orders-care", label: "Orders & Care Plans", route: "/icu-command-center/clinical-workspace/orders-care-plans", status: "ready" },
          { id: "icu-command-family-communication", label: "Family Communication", route: "/icu-command-center/clinical-workspace/family-communication", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-nursing",
        label: "Nursing",
        route: "/icu-command-center/nursing/station",
        status: "ready",
        children: [
          { id: "icu-command-nursing-station", label: "Nursing Station", route: "/icu-command-center/nursing/station", status: "ready" },
          { id: "icu-command-nurse-entry", label: "Nurse Entry", route: "/icu-command-center/nursing/nurse-entry", status: "ready" },
          { id: "icu-command-medication", label: "Medication Administration", route: "/icu-command-center/nursing/medication-administration", status: "ready" },
          { id: "icu-command-patient-medication-chart", label: "Patient Medication Chart", route: "/icu-command-center/nursing/patient-medication", status: "ready" },
          { id: "icu-command-nursing-ews", label: "Early Warning Score", route: "/icu-command-center/nursing/early-warning-score", status: "ready" },
          { id: "icu-command-handover", label: "Shift Handover", route: "/icu-command-center/nursing/shift-handover", status: "ready" },
          { id: "icu-command-tasks", label: "Tasks & Assessments", route: "/icu-command-center/nursing/tasks-assessments", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-diagnostics",
        label: "Diagnostics",
        route: "/icu-command-center/diagnostics/hub",
        status: "ready",
        children: [
          { id: "icu-command-diagnostics", label: "Diagnostics Hub", route: "/icu-command-center/diagnostics/hub", status: "ready" },
          { id: "icu-command-investigation-entry", label: "Report Upload & Extract", route: "/icu-command-center/diagnostics/investigation-entry", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-tele-icu",
        label: "Tele ICU",
        route: "/icu-command-center/tele-icu/remote-command-center",
        status: "ready",
        children: [
          { id: "icu-command-remote-center", label: "Remote Command Center", route: "/icu-command-center/tele-icu/remote-command-center", status: "ready" },
          { id: "icu-command-remote-consults", label: "Remote Consultations", route: "/icu-command-center/tele-icu/remote-consultations", status: "ready" },
          { id: "icu-command-escalated-cases", label: "Escalated Cases", route: "/icu-command-center/tele-icu/escalated-cases", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-device-operations",
        label: "Device Operations",
        route: "/icu-command-center/device-operations/edge-device-management",
        status: "ready",
        children: [
          { id: "icu-command-edge-devices", label: "Edge Device Management", route: "/icu-command-center/device-operations/edge-device-management", status: "ready" },
          { id: "icu-command-device-mapping", label: "Device Mapping", route: "/icu-command-center/device-operations/device-mapping", status: "ready" },
          { id: "icu-command-connectivity", label: "Connectivity Dashboard", route: "/icu-command-center/device-operations/connectivity-dashboard", status: "ready" },
          { id: "icu-command-signal-health", label: "Signal Health", route: "/icu-command-center/device-operations/signal-health", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-clinical-intelligence",
        label: "Clinical Intelligence",
        route: "/icu-command-center/clinical-intelligence/patient-risk-center",
        status: "ready",
        children: [
          { id: "icu-command-patient-risk", label: "Patient Risk Center", route: "/icu-command-center/clinical-intelligence/patient-risk-center", status: "ready" },
          { id: "icu-command-ews", label: "Early Warning Scores", route: "/icu-command-center/clinical-intelligence/early-warning-scores", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-analytics",
        label: "Analytics",
        route: "/icu-command-center/analytics/operational",
        status: "ready",
        children: [
          { id: "icu-command-operational-analytics", label: "Operational Analytics", route: "/icu-command-center/analytics/operational", status: "ready" },
          { id: "icu-command-clinical-analytics", label: "Clinical Analytics", route: "/icu-command-center/analytics/clinical", status: "ready" },
          { id: "icu-command-device-analytics", label: "Device Analytics", route: "/icu-command-center/analytics/device", status: "ready" },
          { id: "icu-command-pilot-outcome", label: "Pilot Outcome Dashboard", route: "/icu-command-center/analytics/pilot-outcome", status: "ready" },
          { id: "icu-command-adoption", label: "Adoption Analytics", route: "/icu-command-center/analytics/adoption", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-administration",
        label: "Administration",
        route: "/icu-command-center/administration/users-roles",
        status: "ready",
        children: [
          { id: "icu-command-users-roles", label: "Users & Roles", route: "/icu-command-center/administration/users-roles", status: "ready" },
          { id: "icu-command-configuration", label: "Configuration", route: "/icu-command-center/administration/configuration", status: "ready" },
          { id: "icu-command-audit", label: "Audit Logs", route: "/icu-command-center/administration/audit-logs", status: "ready" },
        ],
      },
    ],
  },
  {
    id: "nursing-icu",
    label: "Nursing / ICU",
    icon: HeartPulse,
    route: "/nursing-icu",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Lab Technician", "Radiologist", "Pharmacist", "Billing Executive", "Management"],
    status: "ready",
    children: [
      { id: "nursing-icu-dashboard", label: "ICU Dashboard", route: "/nursing-icu", status: "ready" },
      { id: "nursing-icu-patient-board", label: "ICU Patient Board", route: "/nursing-icu/patient-board", status: "ready" },
      { id: "nursing-icu-arrival", label: "Patient Arrival & Bed Allocation", route: "/nursing-icu/arrival-bed-allocation", status: "ready" },
      { id: "nursing-icu-handover", label: "Shift Handover", route: "/nursing-icu/shift-handover", status: "ready" },
      { id: "nursing-icu-tasks", label: "Nurse Task List", route: "/nursing-icu/tasks", status: "ready" },
      { id: "nursing-icu-monitoring", label: "ICU Monitoring Chart", route: "/nursing-icu/monitoring-chart", status: "ready" },
      { id: "nursing-icu-vitals", label: "Nurse Entry", route: "/nursing-icu/vitals", status: "ready" },
      { id: "nursing-icu-nurse-review", label: "Nurse Review", route: "/nursing-icu/nurse-review", status: "ready" },
      { id: "nursing-icu-intake-output", label: "Intake / Output Chart", route: "/nursing-icu/intake-output", status: "ready" },
      { id: "nursing-icu-medication", label: "Medication Administration", route: "/nursing-icu/medication-administration", status: "ready" },
      { id: "nursing-icu-iv-fluids", label: "IV Fluid & Infusion Management", route: "/nursing-icu/iv-fluids", status: "ready" },
      { id: "nursing-icu-blood", label: "Blood Transfusion", route: "/nursing-icu/blood-transfusion", status: "ready" },
      { id: "nursing-icu-rounds", label: "Doctor Rounds", route: "/nursing-icu/doctor-rounds", status: "ready" },
      { id: "nursing-icu-instructions", label: "Doctor Instructions", route: "/nursing-icu/doctor-instructions", status: "ready" },
      { id: "nursing-icu-lab", label: "Lab Orders & Results", route: "/nursing-icu/lab-results", status: "ready" },
      { id: "nursing-icu-radiology", label: "Radiology Orders & Reports", route: "/nursing-icu/radiology-reports", status: "ready" },
      { id: "nursing-icu-pharmacy", label: "Pharmacy Requests", route: "/nursing-icu/pharmacy-requests", status: "ready" },
      { id: "nursing-icu-head-nurse", label: "Head Nurse Console", route: "/nursing-icu/head-nurse-console", status: "ready" },
      { id: "nursing-icu-ward-nurse", label: "Ward Nurse Shift Activities", route: "/nursing-icu/ward-nurse-activities", status: "ready" },
      { id: "nursing-icu-duty-doctor", label: "Duty Doctor Monitoring", route: "/nursing-icu/duty-doctor-monitoring", status: "ready" },
      { id: "nursing-icu-alerts", label: "ICU Alerts", route: "/nursing-icu/alerts", status: "ready" },
      { id: "nursing-icu-transfer", label: "Transfer / Discharge / Death Workflow", route: "/nursing-icu/transfer-discharge", status: "ready" },
      { id: "nursing-icu-notes", label: "Nursing Notes", route: "/nursing-icu/nursing-notes", status: "ready" },
      { id: "nursing-icu-audit", label: "Audit & Activity Logs", route: "/nursing-icu/audit-logs", status: "ready" },
      { id: "nursing-icu-reports", label: "Reports", route: "/nursing-icu/reports", status: "ready" },
    ],
  },
  { id: "discharge", label: "Discharge", icon: FileCheck2, route: "/discharge", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Pharmacist", "Billing Executive", "Management"], status: "ready" },
  { id: "emergency", label: "Emergency", icon: Ambulance, route: "/emergency", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Management"], status: "ready" },
  { id: "emr", label: "EMR / EHR", icon: ClipboardList, route: "/emr", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Lab Technician", "Radiologist", "Pharmacist", "Management"], status: "ready" },
  { id: "rapid-review", label: "Rapid Review", icon: Activity, route: "/rapid-review", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Management"], status: "ready" },
  {
    id: "renal",
    label: "Renal",
    icon: Droplets,
    route: "/renal",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Lab Technician", "Billing Executive", "Management"],
    status: "ready",
    children: [
      { id: "renal-overview", label: "Overview", route: "/renal", status: "ready" },
      { id: "renal-patients", label: "Patient Charts", route: "/renal/patients", status: "ready" },
      { id: "renal-fluid-balance", label: "Fluid Balance", route: "/renal/fluid-balance", status: "ready" },
      { id: "renal-drains", label: "Drains & Devices", route: "/renal/drains", status: "ready" },
      { id: "renal-labs", label: "Renal Labs", route: "/renal/labs", status: "ready" },
      { id: "renal-reports", label: "Reports", route: "/renal/reports", status: "ready" },
    ],
  },
  { id: "ot", label: "OT", icon: Syringe, route: "/ot", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Billing Executive", "Management"], status: "ready" },
  { id: "radiology", label: "Radiology", icon: ScanSearch, route: "/radiology", group: "Radiology", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Radiologist", "Billing Executive", "Management"], status: "ready" },
  { id: "settings", label: "UI Settings", icon: Settings, route: "/settings/ui", group: "Command", allowedRoles: allRoles, status: "ready" },
  { id: "preview", label: "Components Preview", icon: Archive, route: "/components-preview", group: "Command", allowedRoles: ["Super Admin", "Hospital Admin"], status: "ready" },
];

export function getNavigationItemsForRole(role: Role): NavigationItem[] {
  const visibleItems = navigationItems.filter((item) => item.allowedRoles.includes(role));
  const icuPersonaChildren = icuPersonaNavigation[role];

  if (!icuPersonaChildren) {
    return visibleItems;
  }

  return icuPersonaChildren.map((child) => icuPersonaItem(role, child));
}

export const dashboardQuickActions = [
  { id: "register", label: "Register patient", icon: IdCard, route: "/patients/register" },
  { id: "consult", label: "Start OPD", icon: Stethoscope, route: "/opd" },
  { id: "admit", label: "Admit patient", icon: BedDouble, route: "/ipd" },
  { id: "emergency", label: "Emergency desk", icon: Ambulance, route: "/emergency" },
  { id: "radiology", label: "Radiology worklist", icon: ScanSearch, route: "/radiology" },
];
