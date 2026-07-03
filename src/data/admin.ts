import type {
  AdminRoleRecord,
  AuditLog,
  BranchRecord,
  DepartmentRecord,
  IpRule,
  PermissionRecord,
  SecuritySession,
  TrustedDevice,
  UserRecord,
} from "@/types";

export const mockAuthMessages = {
  sessionExpired: "Your previous session expired. Sign in again to continue.",
  accountLocked: "Account locked after repeated failed attempts. Contact the security desk.",
  mfaRequired: "Multi-factor verification is required for administrative access.",
  passwordExpired: "Password expired. Reset it before continuing to the HMS workspace.",
};

export const mockRoles: AdminRoleRecord[] = [
  { id: "role-super", name: "Super Admin", type: "System", description: "Complete platform administration with protected access.", departmentScope: "All departments", status: "Active", userCount: 3, modulesAllowed: 24, permissionCount: 148, protected: true, risk: "Critical", updatedAt: "Today 09:20" },
  { id: "role-hadmin", name: "Hospital Admin", type: "System", description: "Hospital operations, setup, users, and non-destructive security controls.", departmentScope: "All departments", status: "Active", userCount: 8, modulesAllowed: 18, permissionCount: 112, protected: true, risk: "High", updatedAt: "Yesterday 18:05" },
  { id: "role-doctor", name: "Doctor", type: "System", description: "Clinical workflow access with protected patient data boundaries.", departmentScope: "Mapped clinical departments", status: "Active", userCount: 64, modulesAllowed: 9, permissionCount: 52, protected: true, risk: "Medium", updatedAt: "18 May 2026" },
  { id: "role-doctor-icu", name: "Doctor ICU", type: "System", description: "ICU doctor workspace for rounds, orders, alerts, escalation, and patient review.", departmentScope: "ICU", status: "Active", userCount: 18, modulesAllowed: 1, permissionCount: 38, protected: true, risk: "High", updatedAt: "Today 12:20" },
  { id: "role-ward-nurse", name: "Ward Nurse", type: "System", description: "Bedside nursing access for vitals, medication, handover, and task execution.", departmentScope: "ICU", status: "Active", userCount: 42, modulesAllowed: 1, permissionCount: 28, protected: true, risk: "Medium", updatedAt: "Today 12:23" },
  { id: "role-unit-nurse", name: "Unit Nurse", type: "System", description: "Unit supervision access for nursing station, alerts, handover, and task review.", departmentScope: "ICU", status: "Active", userCount: 18, modulesAllowed: 1, permissionCount: 31, protected: true, risk: "Medium", updatedAt: "Today 12:24" },
  { id: "role-head-nurse", name: "Head Nurse", type: "System", description: "Head nurse access for shift control, nursing workload, handover, and escalation.", departmentScope: "ICU", status: "Active", userCount: 7, modulesAllowed: 1, permissionCount: 33, protected: true, risk: "High", updatedAt: "Today 12:25" },
  { id: "role-icu-bed-coordinator", name: "ICU Bed Coordinator", type: "System", description: "ICU admission, discharge, bed readiness, and capacity coordination access.", departmentScope: "ICU", status: "Active", userCount: 9, modulesAllowed: 1, permissionCount: 24, protected: true, risk: "Medium", updatedAt: "Today 12:26" },
  { id: "role-diagnostics-team", name: "Diagnostics Team", type: "System", description: "ICU diagnostics access for result review, report upload, and extraction workflow.", departmentScope: "Diagnostics", status: "Active", userCount: 16, modulesAllowed: 1, permissionCount: 22, protected: true, risk: "Medium", updatedAt: "Today 12:27" },
  { id: "role-tele-icu-doctor", name: "Tele ICU Doctor", type: "System", description: "Remote ICU doctor access for consults, escalated cases, and patient review.", departmentScope: "Tele ICU", status: "Active", userCount: 10, modulesAllowed: 1, permissionCount: 30, protected: true, risk: "High", updatedAt: "Today 12:28" },
  { id: "role-biomedical-engineer", name: "Biomedical Engineer", type: "System", description: "Device operations access for monitoring, mapping, connectivity, and signal health.", departmentScope: "Biomedical", status: "Active", userCount: 8, modulesAllowed: 1, permissionCount: 26, protected: true, risk: "Medium", updatedAt: "Today 12:29" },
  { id: "role-icu-pharmacist", name: "ICU Pharmacist", type: "System", description: "ICU medication access for administration status, MAR review, and order support.", departmentScope: "Pharmacy", status: "Active", userCount: 12, modulesAllowed: 1, permissionCount: 25, protected: true, risk: "High", updatedAt: "Today 12:30" },
  { id: "role-quality-audit", name: "Quality Audit", type: "System", description: "ICU quality access for analytics, clinical intelligence, and audit logs.", departmentScope: "Quality", status: "Active", userCount: 5, modulesAllowed: 1, permissionCount: 27, protected: true, risk: "Medium", updatedAt: "Today 12:31" },
  { id: "role-nurse", name: "Nurse", type: "System", description: "Nursing station, vitals, medication, and ward workflow access.", departmentScope: "Mapped wards", status: "Active", userCount: 118, modulesAllowed: 7, permissionCount: 43, protected: true, risk: "Medium", updatedAt: "17 May 2026" },
  { id: "role-reception", name: "Receptionist", type: "Custom", description: "Front office registration, queue, and appointment workflow.", departmentScope: "Front office", status: "Active", userCount: 22, modulesAllowed: 6, permissionCount: 36, protected: false, risk: "Low", updatedAt: "Today 08:15" },
  { id: "role-lab", name: "Lab Technician", type: "Custom", description: "Sample collection and laboratory result entry access.", departmentScope: "Diagnostics", status: "Active", userCount: 16, modulesAllowed: 5, permissionCount: 31, protected: false, risk: "Medium", updatedAt: "16 May 2026" },
  { id: "role-billing", name: "Billing Executive", type: "Custom", description: "OPD/IPD billing, payment, refund request, and package billing.", departmentScope: "Finance", status: "Active", userCount: 14, modulesAllowed: 8, permissionCount: 46, protected: false, risk: "High", updatedAt: "15 May 2026" },
  { id: "role-hr", name: "HR Manager", type: "Custom", description: "Staff profile and HRMS access with restricted security view.", departmentScope: "Administration", status: "Active", userCount: 5, modulesAllowed: 4, permissionCount: 28, protected: false, risk: "Medium", updatedAt: "14 May 2026" },
  { id: "role-management", name: "Management", type: "Custom", description: "Read-only operational, audit, and performance summaries.", departmentScope: "Executive", status: "Active", userCount: 6, modulesAllowed: 10, permissionCount: 34, protected: false, risk: "Medium", updatedAt: "13 May 2026" },
];

export const mockPermissions: PermissionRecord[] = [
  { id: "perm-users-view", module: "Administration", page: "User Management", tab: "Profile", action: "View", description: "View staff users and profile summaries.", sensitive: false, enabled: true, dependency: "Page" },
  { id: "perm-users-edit", module: "Administration", page: "User Management", tab: "Profile", action: "Edit", description: "Update staff profile and role mapping.", sensitive: true, enabled: true, dependency: "Action" },
  { id: "perm-users-lock", module: "Administration", page: "User Management", tab: "Security", action: "Lock", description: "Lock or unlock staff account access.", sensitive: true, enabled: true, dependency: "Sensitive" },
  { id: "perm-roles-manage", module: "Administration", page: "Roles & Permissions", tab: "Permissions", action: "Approve", description: "Approve role permission changes.", sensitive: true, enabled: true, dependency: "Sensitive" },
  { id: "perm-audit-view", module: "Security", page: "Audit Logs", tab: "Events", action: "View", description: "View immutable security and admin event logs.", sensitive: true, enabled: true, dependency: "Page" },
  { id: "perm-audit-export", module: "Security", page: "Audit Logs", tab: "Events", action: "Export", description: "Export masked audit log records.", sensitive: true, enabled: false, dependency: "Action" },
  { id: "perm-security-sessions", module: "Security", page: "Security Management", tab: "Sessions", action: "Cancel", description: "Force logout active staff sessions.", sensitive: true, enabled: true, dependency: "Sensitive" },
  { id: "perm-setup-legal", module: "Master Setup", page: "Hospital Setup", tab: "Legal", action: "Edit", description: "Edit hospital registration and compliance fields.", sensitive: true, enabled: false, dependency: "Tab" },
  { id: "perm-dept-create", module: "Master Setup", page: "Departments", tab: "Overview", action: "Create", description: "Create and activate departments.", sensitive: false, enabled: true, dependency: "Action" },
  { id: "perm-branch-view", module: "Master Setup", page: "Branches", tab: "Overview", action: "View", description: "View current and future branch records.", sensitive: false, enabled: true, dependency: "Module" },
];

export const mockDepartments: DepartmentRecord[] = [
  { id: "dept-card", code: "CARD", name: "Cardiology", type: "Clinical", head: "Dr. Kavita Rao", location: "Tower A, Floor 3", users: 42, status: "Active", enabledWorkflows: ["OPD", "IPD", "Billing", "Appointment"] },
  { id: "dept-emrg", code: "EMRG", name: "Emergency", type: "Clinical", head: "Dr. Aman Verma", location: "Ground Floor", users: 58, status: "Active", enabledWorkflows: ["Emergency", "Billing", "Ambulance"] },
  { id: "dept-lab", code: "LAB", name: "Central Laboratory", type: "Diagnostic", head: "Dr. Neha Malik", location: "Tower B, Floor 1", users: 34, status: "Active", enabledWorkflows: ["LIS", "Billing", "Reports"] },
  { id: "dept-rad", code: "RAD", name: "Radiology", type: "Diagnostic", head: "Dr. Sameer Khan", location: "Tower B, Floor 2", users: 27, status: "Active", enabledWorkflows: ["RIS", "PACS", "Billing"] },
  { id: "dept-fin", code: "FIN", name: "Billing & Finance", type: "Finance", head: "Meera Sinha", location: "Admin Block", users: 19, status: "Active", enabledWorkflows: ["OPD Billing", "IPD Billing", "Insurance"] },
  { id: "dept-store", code: "STORE", name: "Central Store", type: "Store", head: "Rakesh Yadav", location: "Basement", users: 12, status: "Inactive", enabledWorkflows: ["Purchase", "GRN", "Stock Audit"] },
];

export const mockUsers: UserRecord[] = [
  { id: "user-001", employeeCode: "EMP-1001", name: "Ananya Sharma", email: "ananya.sharma@plasmit.care", mobile: "+91 98765 43120", roleIds: ["role-hadmin"], departmentIds: ["dept-fin"], designation: "Hospital Administrator", status: "Active", lastLoginAt: "Today 10:42", locked: false, failedLogins: 0 },
  { id: "user-002", employeeCode: "EMP-1044", name: "Dr. Kavita Rao", email: "kavita.rao@plasmit.care", mobile: "+91 98990 12001", roleIds: ["role-doctor", "role-doctor-icu"], departmentIds: ["dept-card"], designation: "Senior Consultant", status: "Active", lastLoginAt: "Today 09:58", locked: false, failedLogins: 1 },
  { id: "user-003", employeeCode: "EMP-1188", name: "Nisha Thomas", email: "nisha.thomas@plasmit.care", mobile: "+91 98220 55218", roleIds: ["role-nurse"], departmentIds: ["dept-emrg"], designation: "Nursing Supervisor", status: "Active", lastLoginAt: "Today 08:36", locked: false, failedLogins: 0 },
  { id: "user-004", employeeCode: "EMP-1210", name: "Rohit Bansal", email: "rohit.bansal@plasmit.care", mobile: "+91 98111 76890", roleIds: ["role-billing"], departmentIds: ["dept-fin"], designation: "Billing Executive", status: "Locked", lastLoginAt: "Yesterday 20:10", locked: true, failedLogins: 5 },
  { id: "user-005", employeeCode: "EMP-1302", name: "Farah Ali", email: "farah.ali@plasmit.care", mobile: "+91 98001 44512", roleIds: ["role-lab"], departmentIds: ["dept-lab"], designation: "Lab Technician", status: "Invited", lastLoginAt: "Invite pending", locked: false, failedLogins: 0 },
  { id: "user-006", employeeCode: "EMP-1407", name: "Mohan Iyer", email: "mohan.iyer@plasmit.care", mobile: "+91 98988 22112", roleIds: ["role-management"], departmentIds: ["dept-fin"], designation: "Operations Director", status: "Active", lastLoginAt: "Today 07:45", locked: false, failedLogins: 0 },
];

export const mockHospitalProfile = {
  name: "Plasmit Multispeciality Hospital",
  shortName: "Plasmit HMS",
  type: "Single hospital, multi-department",
  establishedYear: "2018",
  registrationNumber: "MH-HOS-2018-7721",
  gst: "27AAECP4821F1Z8",
  address: "Sector 18 Medical District, Pune, Maharashtra 411045",
  phone: "+91 20 4000 2211",
  email: "operations@plasmit.care",
  website: "https://plasmit.care",
  workingHours: "24x7 emergency, OPD 08:00-20:00",
  timezone: "Asia/Kolkata",
  currency: "INR",
};

export const mockBranches: BranchRecord[] = [
  { id: "branch-main", code: "PLM-MAIN", name: "Plasmit Main Hospital", city: "Pune", type: "Main Hospital", departments: 18, status: "Active" },
  { id: "branch-north", code: "PLM-NORTH", name: "North City Branch Placeholder", city: "Future", type: "Future Branch", departments: 0, status: "Future Ready" },
];

export const mockSecuritySessions: SecuritySession[] = [
  { id: "sess-001", user: "Ananya Sharma", role: "Hospital Admin", device: "Chrome on Windows", ipAddress: "103.88.45.12", location: "Pune, IN", loginTime: "Today 08:55", lastActivity: "2 min ago", status: "Active" },
  { id: "sess-002", user: "Dr. Kavita Rao", role: "Doctor", device: "Safari on iPad", ipAddress: "103.88.45.18", location: "Pune, IN", loginTime: "Today 09:10", lastActivity: "9 min ago", status: "Active" },
  { id: "sess-003", user: "Rohit Bansal", role: "Billing Executive", device: "Chrome on Android", ipAddress: "45.112.19.4", location: "Review", loginTime: "Yesterday 19:44", lastActivity: "Expired", status: "Expired" },
];

export const mockDevices: TrustedDevice[] = [
  { id: "dev-001", name: "Admin workstation 04", user: "Ananya Sharma", browser: "Chrome 125", lastUsed: "Today 10:42", trustStatus: "Trusted", risk: "Low" },
  { id: "dev-002", name: "Emergency iPad 02", user: "Nisha Thomas", browser: "Safari iPadOS", lastUsed: "Today 08:36", trustStatus: "Trusted", risk: "Low" },
  { id: "dev-003", name: "Unknown Android", user: "Rohit Bansal", browser: "Chrome Mobile", lastUsed: "Yesterday 20:10", trustStatus: "Review", risk: "High" },
];

export const mockIpRules: IpRule[] = [
  { id: "ip-001", range: "103.88.45.0/24", type: "Allow", description: "Hospital network and admin office", addedBy: "Super Admin", status: "Active" },
  { id: "ip-002", range: "45.112.19.4", type: "Block", description: "Suspicious repeated failed login source", addedBy: "Security Desk", status: "Active" },
  { id: "ip-003", range: "10.20.0.0/16", type: "Allow", description: "Internal device VLAN placeholder", addedBy: "Hospital Admin", status: "Inactive" },
];

export const mockPasswordPolicy = {
  minLength: 12,
  uppercase: true,
  lowercase: true,
  number: true,
  special: true,
  expiryDays: 60,
  failedAttemptLockCount: 5,
  lockDuration: "30 minutes",
  reuseLimit: 5,
};

export const mockMfaPolicy = {
  requiredForAdmin: true,
  requiredForSecuritySettings: true,
  requiredForFinancialApprovals: true,
  methods: ["SMS", "Email", "Authenticator app"],
  trustedDeviceDurationDays: 14,
  failedAttemptLimit: 5,
};

export const mockAuditLogs: AuditLog[] = [
  { id: "audit-001", timestamp: "Today 10:48", actorUserId: "user-001", actorName: "Ananya Sharma", actorRole: "Hospital Admin", module: "User Management", eventType: "Account unlocked", target: "Rohit Bansal", severity: "Security", ipAddress: "103.88.45.12", device: "Chrome on Windows", before: "Status: Locked", after: "Status: Active, reason captured", sensitiveFieldsMasked: true },
  { id: "audit-002", timestamp: "Today 09:30", actorUserId: "user-001", actorName: "Ananya Sharma", actorRole: "Hospital Admin", module: "Roles & Permissions", eventType: "Permission change requested", target: "Billing Executive", severity: "Critical", ipAddress: "103.88.45.12", device: "Chrome on Windows", before: "Discount approve: masked", after: "Discount approve: pending approval", sensitiveFieldsMasked: true },
  { id: "audit-003", timestamp: "Today 08:12", actorUserId: "system", actorName: "Security monitor", actorRole: "Super Admin", module: "Security", eventType: "Failed login threshold", target: "EMP-1210", severity: "Warning", ipAddress: "45.112.19.4", device: "Chrome Mobile", before: "Attempts: 4", after: "Attempts: 5, account locked", sensitiveFieldsMasked: true },
  { id: "audit-004", timestamp: "Yesterday 17:25", actorUserId: "user-006", actorName: "Mohan Iyer", actorRole: "Management", module: "Audit Logs", eventType: "Read-only audit viewed", target: "Security events", severity: "Info", ipAddress: "103.88.45.22", device: "Edge on Windows", before: "No data changed", after: "No data changed", sensitiveFieldsMasked: true },
];

export const mockAccessDeniedScenarios = [
  "Doctor trying to open permission matrix",
  "Receptionist trying to edit security policy",
  "Management opening hospital setup in read-only mode",
];
