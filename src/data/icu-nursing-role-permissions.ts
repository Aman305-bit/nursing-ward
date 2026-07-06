import type { NavigationChildItem, Role } from "@/types";

export type NursingRoleKey = "HEAD_NURSE" | "UNIT_NURSE" | "WARD_NURSE";

export type NursingRolePermission = {
  role: Extract<Role, "Head Nurse" | "Unit Nurse" | "Ward Nurse">;
  defaultRoute: string;
  routes: string[];
  patientTabs: string[];
  navigation: NavigationChildItem[];
};

function navChild(id: string, label: string, route: string, children?: NavigationChildItem[]): NavigationChildItem {
  return { id, label, route, status: "ready", children };
}

export const nursingRolePermissions: Record<NursingRoleKey, NursingRolePermission> = {
  HEAD_NURSE: {
    role: "Head Nurse",
    defaultRoute: "/icu-command-center/nursing/station",
    routes: [
      "/icu-command-center/nursing/station",
      "/icu-command-center/patients/admissions",
      "/icu-command-center/patients/smart-bed-view",
      "/icu-command-center/patients/discharges",
      "/icu-command-center/notifications-tasks",
      "/icu-command-center/critical-care/escalation-center",
      "/icu-command-center/analytics/clinical",
      "/icu-command-center/analytics/operational",
      "/icu-command-center/administration/audit-logs",
      "/icu-command-center/patients/*",
    ],
    patientTabs: ["overview", "results", "events", "shift-summary"],
    navigation: [
      navChild("head-nurse-nursing", "Nursing Command", "/icu-command-center/nursing/station", [
        navChild("head-nurse-overview", "Nursing Dashboard", "/icu-command-center/nursing/station"),
        navChild("head-nurse-admissions", "New Admission Queue", "/icu-command-center/patients/admissions"),
        navChild("head-nurse-units", "Unit & Staff Availability", "/icu-command-center/patients/smart-bed-view"),
        navChild("head-nurse-handover-review", "Handover Verification", "/icu-command-center/patients/icu-001?tab=shift-summary"),
      ]),
      navChild("head-nurse-control", "Control & Audit", "/icu-command-center/notifications-tasks", [
        navChild("head-nurse-pending", "Pending Critical Items", "/icu-command-center/notifications-tasks"),
        navChild("head-nurse-escalation", "Escalation Oversight", "/icu-command-center/critical-care/escalation-center"),
        navChild("head-nurse-discharges", "Final Review / Closure", "/icu-command-center/patients/discharges"),
      ]),
      navChild("head-nurse-reports", "Reports", "/icu-command-center/analytics/clinical", [
        navChild("head-nurse-quality", "Quality Audit", "/icu-command-center/analytics/clinical"),
        navChild("head-nurse-operations", "Nursing Reports", "/icu-command-center/analytics/operational"),
        navChild("head-nurse-audit", "Audit Logs", "/icu-command-center/administration/audit-logs"),
      ]),
    ],
  },
  UNIT_NURSE: {
    role: "Unit Nurse",
    defaultRoute: "/icu-command-center/nursing/station",
    routes: [
      "/icu-command-center/nursing/station",
      "/icu-command-center/patients/smart-bed-view",
      "/icu-command-center/notifications-tasks",
      "/icu-command-center/critical-care/clinical-alerts",
      "/icu-command-center/critical-care/escalation-center",
      "/icu-command-center/patients/*",
    ],
    patientTabs: ["overview", "monitoring", "results", "events", "shift-summary"],
    navigation: [
      navChild("unit-nurse-unit", "Unit Coordination", "/icu-command-center/nursing/station", [
        navChild("unit-nurse-dashboard", "Unit Nurse Dashboard", "/icu-command-center/nursing/station"),
        navChild("unit-nurse-assigned", "Assigned Patients", "/icu-command-center/patients/smart-bed-view"),
        navChild("unit-nurse-linking", "Bed & Ward Nurse Link", "/icu-command-center/patients/smart-bed-view"),
      ]),
      navChild("unit-nurse-monitoring", "Unit Monitoring", "/icu-command-center/notifications-tasks", [
        navChild("unit-nurse-pending-vitals", "Pending Vitals", "/icu-command-center/notifications-tasks"),
        navChild("unit-nurse-pending-medicine", "Pending Medicines", "/icu-command-center/notifications-tasks"),
        navChild("unit-nurse-pending-orders", "Pending Doctor Orders", "/icu-command-center/notifications-tasks"),
        navChild("unit-nurse-pending-tasks", "Pending Nursing Tasks", "/icu-command-center/notifications-tasks"),
      ]),
      navChild("unit-nurse-escalation", "Issue Review", "/icu-command-center/critical-care/clinical-alerts", [
        navChild("unit-nurse-alerts", "First-Level Review", "/icu-command-center/critical-care/clinical-alerts"),
        navChild("unit-nurse-decision", "Escalation Decision", "/icu-command-center/critical-care/escalation-center"),
        navChild("unit-nurse-tracking", "Escalation Tracking", "/icu-command-center/critical-care/escalation-center"),
        navChild("unit-nurse-handover-review", "Unit Handover Review", "/icu-command-center/patients/icu-001?tab=shift-summary"),
      ]),
    ],
  },
  WARD_NURSE: {
    role: "Ward Nurse",
    defaultRoute: "/icu-command-center/clinical-workspace/patient-overview",
    routes: [
      "/icu-command-center/clinical-workspace/patient-overview",
      "/icu-command-center/nursing/nurse-entry",
      "/icu-command-center/nursing/intake-output",
      "/icu-command-center/nursing/medicine-receive-verify",
      "/icu-command-center/nursing/order",
      "/icu-command-center/nursing/medication-administration",
      "/icu-command-center/nursing/early-warning-score",
      "/icu-command-center/nursing/shift-handover",
      "/icu-command-center/nursing/shift-pending-summary",
      "/icu-command-center/nursing/raise-issue",
      "/icu-command-center/nursing/tasks-assessments",
      "/icu-command-center/patients/*",
    ],
    patientTabs: ["overview", "monitoring", "orders", "events", "shift-summary", "collaborate"],
    navigation: [
      navChild("ward-nurse-assigned", "My Assigned Patients", "/icu-command-center/clinical-workspace/patient-overview"),
      navChild("ward-nurse-documentation", "Bedside Documentation", "/icu-command-center/nursing/nurse-entry", [
        navChild("ward-nurse-entry", "Nurse Entry", "/icu-command-center/nursing/nurse-entry"),
        navChild("ward-nurse-ews", "Early Warning Score", "/icu-command-center/nursing/early-warning-score"),
        navChild("ward-nurse-io", "Intake / Output Update", "/icu-command-center/nursing/intake-output"),
        navChild("ward-nurse-events", "Patient Event Update", "/icu-command-center/patients/icu-001?tab=events"),
      ]),
      navChild("ward-nurse-work", "Nursing Work", "/icu-command-center/nursing/medication-administration", [
        navChild("ward-nurse-medication-receive", "Medicine Receive & Verify", "/icu-command-center/nursing/medicine-receive-verify"),
        navChild("ward-nurse-order", "Order", "/icu-command-center/nursing/order"),
        navChild("ward-nurse-medication", "Medicine Administration", "/icu-command-center/nursing/medication-administration"),
        navChild("ward-nurse-notes", "Nursing Notes", "/icu-command-center/nursing/nursing-notes"),
      ]),
      navChild("ward-nurse-handover", "Handover", "/icu-command-center/nursing/shift-handover", [
        navChild("ward-nurse-submit-handover", "Submit Shift Handover", "/icu-command-center/nursing/shift-handover"),
        navChild("ward-nurse-pending-summary", "Shift Pending Summary", "/icu-command-center/nursing/shift-pending-summary"),
        navChild("ward-nurse-raise-issue", "Raise Issue to Unit Nurse", "/icu-command-center/nursing/raise-issue"),
      ]),
    ],
  },
};

export const nursingPersonaRoles = Object.values(nursingRolePermissions).map((permission) => permission.role);

export function getNursingRolePermission(role: Role): NursingRolePermission | undefined {
  return Object.values(nursingRolePermissions).find((permission) => permission.role === role);
}

export function getNursingRoleNavigation(role: Role): NavigationChildItem[] | undefined {
  return getNursingRolePermission(role)?.navigation;
}

export function getDefaultNursingIcuRoute(role: Role): string {
  return getNursingRolePermission(role)?.defaultRoute ?? "/icu-command-center";
}

export function isNursingPersonaRole(role: Role): boolean {
  return Boolean(getNursingRolePermission(role));
}

export function canAccessNursingIcuRoute(role: Role, pathname: string, tab?: string | null): boolean {
  const permission = getNursingRolePermission(role);
  if (!permission || !pathname.startsWith("/icu-command-center")) {
    return true;
  }

  const normalizedPath = pathname.replace(/\/$/, "");
  const routeAllowed = permission.routes.some((route) => {
    if (route === "/icu-command-center/patients/*") {
      return /^\/icu-command-center\/patients\/icu-[^/]+$/.test(normalizedPath);
    }
    if (route.endsWith("/*")) {
      return normalizedPath.startsWith(route.slice(0, -2));
    }
    return normalizedPath === route.replace(/\/$/, "");
  });

  if (!routeAllowed) {
    return false;
  }

  if (/^\/icu-command-center\/patients\/icu-[^/]+$/.test(normalizedPath)) {
    return permission.patientTabs.includes(tab || "overview");
  }

  return true;
}
