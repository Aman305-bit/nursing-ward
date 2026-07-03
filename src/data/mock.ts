import type { NotificationItem, Role, SearchResult, StatusTone } from "@/types";

export const hospitalContext = {
  name: "Plasmit Hospital",
  code: "PLH-HQ",
  branch: "Main Campus",
  department: "Multi Department",
  shift: "Day operations",
};

export const departments = [
  "Emergency",
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Radiology",
  "Laboratory",
  "Pharmacy",
  "Billing",
  "Administration",
];

export const users = [
  { id: "usr-1", name: "Ananya Sharma", role: "Hospital Admin" as Role, department: "Administration", status: "Active" },
  { id: "usr-2", name: "Dr. Rohan Mehta", role: "Doctor" as Role, department: "Cardiology", status: "Active" },
  { id: "usr-3", name: "Neha Singh", role: "Nurse" as Role, department: "ICU", status: "Active" },
];

export const dashboardStats = [
  { id: "opd", label: "OPD visits", value: 186, change: "+12%", tone: "info" as StatusTone, context: "Today across 9 departments" },
  { id: "registrations", label: "New registrations", value: 42, change: "+6", tone: "success" as StatusTone, context: "Front office queue stable" },
  { id: "appointments", label: "Appointments", value: 128, change: "84 checked in", tone: "info" as StatusTone, context: "18 waiting for doctor" },
  { id: "waiting", label: "Waiting patients", value: 27, change: "-9", tone: "warning" as StatusTone, context: "Avg wait 18 min" },
  { id: "ipd", label: "Active IPD", value: 94, change: "76% occ.", tone: "info" as StatusTone, context: "12 discharge planned" },
  { id: "beds", label: "Available beds", value: 31, change: "6 ICU", tone: "success" as StatusTone, context: "Critical care guarded" },
  { id: "lab", label: "Lab pending", value: 58, change: "11 critical", tone: "warning" as StatusTone, context: "TAT risk in biochemistry" },
  { id: "pharmacy", label: "Rx dispense", value: 36, change: "5 partial", tone: "warning" as StatusTone, context: "2 low-stock alerts" },
  { id: "revenue", label: "Revenue today", value: 784000, change: "+8.4%", tone: "success" as StatusTone, context: "Static finance placeholder" },
  { id: "alerts", label: "Critical alerts", value: 7, change: "3 new", tone: "critical" as StatusTone, context: "Requires acknowledgement" },
];

export const departmentActivity = [
  { department: "Emergency", queue: 14, appointments: 0, doctors: 4, status: "High load", tone: "critical" as StatusTone },
  { department: "General Medicine", queue: 21, appointments: 48, doctors: 8, status: "Stable", tone: "info" as StatusTone },
  { department: "Cardiology", queue: 9, appointments: 22, doctors: 5, status: "On track", tone: "success" as StatusTone },
  { department: "Orthopedics", queue: 17, appointments: 31, doctors: 6, status: "Waiting", tone: "warning" as StatusTone },
  { department: "Pediatrics", queue: 12, appointments: 27, doctors: 5, status: "Stable", tone: "info" as StatusTone },
];

export const appointmentTimeline = [
  { time: "09:00", label: "OPD peak", count: 42 },
  { time: "11:00", label: "Diagnostics rush", count: 35 },
  { time: "13:00", label: "Billing queue", count: 18 },
  { time: "15:00", label: "Follow-ups", count: 28 },
  { time: "17:00", label: "Evening review", count: 21 },
];

export const bedOccupancy = [
  { ward: "General", occupied: 42, total: 58 },
  { ward: "ICU", occupied: 18, total: 24 },
  { ward: "NICU", occupied: 7, total: 10 },
  { ward: "Surgical", occupied: 27, total: 32 },
];

export const recentActivity = [
  { id: "act-1", title: "Critical potassium result acknowledged", meta: "Laboratory • 6 min ago", tone: "critical" as StatusTone },
  { id: "act-2", title: "IPD discharge bill moved to review", meta: "Billing • 14 min ago", tone: "warning" as StatusTone },
  { id: "act-3", title: "Emergency trauma patient shifted to OT", meta: "Emergency • 21 min ago", tone: "info" as StatusTone },
  { id: "act-4", title: "Cardiology queue cleared below threshold", meta: "OPD • 32 min ago", tone: "success" as StatusTone },
];

export const notifications: NotificationItem[] = [
  {
    id: "not-1",
    type: "Critical lab alert",
    title: "Critical potassium result",
    message: "UHID PLH-240118 needs immediate doctor acknowledgement.",
    priority: "high",
    status: "unread",
    module: "Laboratory",
    patient: "Meera Joshi",
    createdAt: "2026-05-20T09:40:00+05:30",
  },
  {
    id: "not-2",
    type: "Bed management alert",
    title: "ICU occupancy above threshold",
    message: "ICU occupancy is at 75%; review planned discharges.",
    priority: "medium",
    status: "unread",
    module: "IPD",
    createdAt: "2026-05-20T09:25:00+05:30",
  },
  {
    id: "not-3",
    type: "Billing approval",
    title: "Discount approval pending",
    message: "Three billing discount requests need manager action.",
    priority: "medium",
    status: "read",
    module: "Billing",
    createdAt: "2026-05-20T08:55:00+05:30",
  },
  {
    id: "not-4",
    type: "Pharmacy stock alert",
    title: "Antibiotic batch near reorder",
    message: "Ceftriaxone 1g stock is below reorder threshold.",
    priority: "high",
    status: "unread",
    module: "Pharmacy",
    createdAt: "2026-05-20T08:42:00+05:30",
  },
  {
    id: "not-5",
    type: "Task assignment",
    title: "OT readiness checklist",
    message: "Surgery case OT-1042 requires instrument readiness review.",
    priority: "low",
    status: "acknowledged",
    module: "OT",
    createdAt: "2026-05-20T08:15:00+05:30",
  },
];

export const searchResults: SearchResult[] = [
  { id: "p-1", type: "Patient", title: "Meera Joshi", description: "UHID PLH-240118 • 42/F • Cardiology", meta: "Last visit today", route: "/patients" },
  { id: "p-2", type: "Patient", title: "Arjun Kapoor", description: "UHID PLH-240076 • 58/M • Orthopedics", meta: "IPD active", route: "/patients" },
  { id: "d-1", type: "Doctor", title: "Dr. Rohan Mehta", description: "Cardiology consultant", meta: "Available 10:30 AM", route: "/opd" },
  { id: "m-1", type: "Module", title: "OPD Consultation", description: "Clinical notes, diagnosis, prescription", meta: "Clinical", route: "/opd" },
  { id: "r-1", type: "Radiology report", title: "RAD-4412", description: "CT Brain plain", meta: "Draft report", route: "/radiology" },
  { id: "a-1", type: "Action", title: "Create appointment", description: "Open appointment scheduling", meta: "Shortcut", route: "/appointments" },
];
