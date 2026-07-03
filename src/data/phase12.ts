export type Phase12Record = Record<string, string | number | boolean | string[]>;

export const mockIntegrations: Phase12Record[] = [
  { id: "int-001", connector: "ABHA Health ID", source: "Plasmit HMS", target: "ABHA sandbox placeholder", direction: "Bidirectional", environment: "Sandbox", lastSync: "Today 10:18", nextSync: "On demand", credentialExpiry: "18 days", failedReason: "Consent renewal required", status: "Sync pending" },
  { id: "int-002", connector: "PACS DICOM", source: "Radiology", target: "PACS placeholder", direction: "Outbound studies", environment: "Staging", lastSync: "Today 09:42", nextSync: "Every 15 min", credentialExpiry: "Valid 92 days", failedReason: "One study UID mismatch", status: "Failed" },
  { id: "int-003", connector: "LIS Analyzer", source: "Biochemistry analyzer", target: "LIS placeholder", direction: "Inbound results", environment: "Production placeholder", lastSync: "Today 11:04", nextSync: "Live queue", credentialExpiry: "Valid", failedReason: "None", status: "Connected placeholder" },
  { id: "int-004", connector: "ERP Finance", source: "Billing/Inventory", target: "ERP placeholder", direction: "Outbound vouchers", environment: "Staging", lastSync: "Yesterday", nextSync: "Tonight 23:00", credentialExpiry: "Expired", failedReason: "Credential rotation required", status: "Retrying" },
];

export const mockApiApps: Phase12Record[] = [
  { id: "api-001", appName: "Patient Portal App", environment: "Sandbox", maskedKey: "pk_live_****_9H2A", endpoints: 14, usage: "8.4k calls", rateLimit: "Normal", credentialExpiry: "29 days", status: "Active" },
  { id: "api-002", appName: "Insurance Desk Bridge", environment: "Staging", maskedKey: "sk_test_****_7Q1B", endpoints: 6, usage: "Rate limited placeholder", rateLimit: "Rate limited placeholder", credentialExpiry: "7 days", status: "Rate limited placeholder" },
  { id: "api-003", appName: "Legacy Billing Sync", environment: "Disabled", maskedKey: "revoked_****", endpoints: 3, usage: "0 calls", rateLimit: "NA", credentialExpiry: "Revoked", status: "Revoked placeholder" },
];

export const mockWebhookEvents: Phase12Record[] = [
  { id: "wh-001", endpoint: "billing.invoice.created", eventType: "Invoice", deliveryStatus: "Failed", retryCount: 3, failedReason: "Receiver timeout", maskedPayload: "{ invoiceId: ****1001 }", status: "Failed" },
  { id: "wh-002", endpoint: "patient.consent.updated", eventType: "Consent", deliveryStatus: "Delivered", retryCount: 0, failedReason: "None", maskedPayload: "{ patient: PLH**** }", status: "Synced" },
  { id: "wh-003", endpoint: "lab.result.critical", eventType: "Critical alert", deliveryStatus: "Retrying", retryCount: 2, failedReason: "HTTP 503 placeholder", maskedPayload: "{ order: LAB**** }", status: "Retrying" },
];

export const mockPaymentGatewaySync: Phase12Record[] = [
  { id: "pay-001", gateway: "Razorpay placeholder", transactionNo: "PG-****-9081", invoice: "OPD-INV-24881", amount: "INR 2,450", transactionStatus: "Captured placeholder", reconciliationStatus: "Matched", failedReason: "None", lastSync: "Today 11:12", environment: "Sandbox", status: "Synced" },
  { id: "pay-002", gateway: "HDFC SmartHub placeholder", transactionNo: "PG-****-2210", invoice: "IPD-ADV-11904", amount: "INR 25,000", transactionStatus: "Bank timeout", reconciliationStatus: "Pending review", failedReason: "Settlement callback missing", lastSync: "Today 10:35", environment: "Staging", status: "Failed" },
  { id: "pay-003", gateway: "UPI Collect placeholder", transactionNo: "UPI-****-7742", invoice: "PHR-INV-31018", amount: "INR 980", transactionStatus: "Refund queued", reconciliationStatus: "Manual approval", failedReason: "Refund approval placeholder", lastSync: "Today 09:48", environment: "Sandbox", status: "Review pending" },
];

export const mockMessageProviderSync: Phase12Record[] = [
  { id: "msg-001", channel: "SMS", provider: "Gupshup placeholder", templateSync: "Appointment reminder approved", deliveryLog: "1,284 delivered today", consentRule: "Transactional allowed", dndRule: "DND bypass disabled", failedReason: "None", retryQueue: 0, status: "Active" },
  { id: "msg-002", channel: "SMS", provider: "Textlocal placeholder", templateSync: "OTP fallback pending", deliveryLog: "42 failed", consentRule: "OTP only", dndRule: "Respect DND", failedReason: "DLT template mismatch", retryQueue: 42, status: "Failed" },
  { id: "msg-003", channel: "WhatsApp", provider: "Meta Cloud API placeholder", templateSync: "Discharge follow-up approved", deliveryLog: "438 delivered today", consentRule: "Opt-in required", dndRule: "Consent gate active", failedReason: "None", retryQueue: 0, status: "Active" },
  { id: "msg-004", channel: "WhatsApp", provider: "Interakt placeholder", templateSync: "Lab report template review", deliveryLog: "18 failed", consentRule: "Marketing disabled", dndRule: "Emergency only", failedReason: "Patient consent withdrawn", retryQueue: 18, status: "Restricted" },
];

export const mockInteropMappings: Phase12Record[] = [
  { id: "map-001", interface: "HL7 ADT", messageOrResource: "ADT^A01", direction: "Inbound", mapping: "Patient/admission", lastMessage: "Today 10:12", errorState: "None", status: "Synced" },
  { id: "map-002", interface: "HL7 ORU", messageOrResource: "ORU^R01", direction: "Inbound", mapping: "Lab result", lastMessage: "Today 10:52", errorState: "OBX segment mismatch", status: "Failed" },
  { id: "map-003", interface: "FHIR Patient", messageOrResource: "Patient", direction: "Bidirectional", mapping: "Demographics", lastMessage: "Today 09:44", errorState: "Consent required", status: "Sync pending" },
  { id: "map-004", interface: "FHIR Observation", messageOrResource: "Observation", direction: "Outbound", mapping: "Vitals/lab", lastMessage: "Yesterday", errorState: "Mapping review pending", status: "Configured placeholder" },
];

export const mockAbhaSync: Phase12Record[] = [
  { id: "abha-001", patient: "Meera J. / PLH-220908", healthId: "meera****@abdm", consent: "Active", verification: "Verified placeholder", linkedState: "Linked", lastSync: "Today 09:20", status: "Synced" },
  { id: "abha-002", patient: "Ravi K. / PLH-221114", healthId: "Not linked", consent: "Renewal required", verification: "Pending", linkedState: "Unlinked", lastSync: "Never", status: "Sync pending" },
  { id: "abha-003", patient: "Sana K. / PLH-210076", healthId: "sana****@abdm", consent: "Withdrawn", verification: "Blocked", linkedState: "Restricted", lastSync: "Blocked", status: "Restricted" },
];

export const mockSecurityEvents: Phase12Record[] = [
  { id: "sec-001", actor: "Rohit Bansal", role: "Billing Executive", module: "Billing", action: "Refund export attempted", ipDevice: "10.0.4.18 / Chrome", severity: "Risk flagged", timestamp: "Today 11:16", sensitiveAccess: "Yes", status: "Risk flagged" },
  { id: "sec-002", actor: "Hospital Admin", role: "Hospital Admin", module: "Admin", action: "Permission matrix reviewed", ipDevice: "10.0.1.4 / Edge", severity: "Normal", timestamp: "Today 09:45", sensitiveAccess: "No", status: "Resolved" },
  { id: "sec-003", actor: "Unknown", role: "NA", module: "Login", action: "Blocked IP attempt", ipDevice: "203.0.113.42 / Unknown", severity: "Blocked", timestamp: "Today 08:12", sensitiveAccess: "Attempt", status: "Blocked" },
];

export const mockAccessReviews: Phase12Record[] = [
  { id: "acr-001", roleName: "Billing Executive", sensitivePermissions: "Refund, discount, export", reviewer: "Hospital Admin", lastChange: "Today 10:20", risk: "Warning", status: "Review pending" },
  { id: "acr-002", roleName: "Doctor", sensitivePermissions: "Clinical record, CDS review", reviewer: "Medical Director", lastChange: "Yesterday", risk: "Normal", status: "Resolved" },
  { id: "acr-003", roleName: "Super Admin", sensitivePermissions: "All modules", reviewer: "Board sign-off", lastChange: "7 days ago", risk: "Risk flagged", status: "Review pending" },
];

export const mockAuthPolicies: Phase12Record[] = [
  { id: "auth-001", policy: "MFA for privileged users", currentState: "Enabled placeholder", gap: "2 admins not enrolled", owner: "IT", due: "Today", status: "Warning" },
  { id: "auth-002", policy: "Password rotation", currentState: "90 days", gap: "No gap", owner: "Security", due: "Reviewed", status: "Resolved" },
  { id: "auth-003", policy: "Session timeout", currentState: "30 minutes", gap: "Mobile exception review", owner: "IT", due: "Tomorrow", status: "Review pending" },
];

export const mockSessions: Phase12Record[] = [
  { id: "ses-001", user: "Hospital Admin", device: "Chrome Windows", ip: "10.0.1.4", location: "Main campus", lastActivity: "Now", risk: "Normal", status: "Normal" },
  { id: "ses-002", user: "Billing Executive", device: "Unknown browser", ip: "10.0.4.18", location: "External VPN", lastActivity: "4 min ago", risk: "Suspicious", status: "Risk flagged" },
  { id: "ses-003", user: "Former staff", device: "Mobile", ip: "Blocked", location: "Unknown", lastActivity: "Denied", risk: "Blocked", status: "Force logout pending" },
];

export const mockDevices: Phase12Record[] = [
  { id: "dev-001", device: "Nurse station tablet", owner: "ICU", deviceId: "tab-****-22", trust: "Trusted", lastSeen: "Today", risk: "Normal", status: "Normal" },
  { id: "dev-002", device: "Unknown Android", owner: "Unclaimed", deviceId: "and-****-91", trust: "Untrusted", lastSeen: "Today 07:50", risk: "Risk flagged", status: "Blocked" },
];

export const mockIpRules: Phase12Record[] = [
  { id: "ipr-001", ruleName: "Main campus allowlist", ipRange: "10.0.0.0/16", action: "Allow", attempts: 1824, owner: "IT", lastAttempt: "Now", reason: "Hospital network", status: "Active" },
  { id: "ipr-002", ruleName: "Unknown overseas block", ipRange: "203.0.113.42", action: "Block", attempts: 9, owner: "Security", lastAttempt: "Today 08:12", reason: "Failed privileged login attempts", status: "Blocked" },
  { id: "ipr-003", ruleName: "Vendor VPN temporary access", ipRange: "198.51.100.18", action: "Time boxed allow", attempts: 14, owner: "Hospital Admin", lastAttempt: "Yesterday", reason: "ERP support window expires tonight", status: "Review pending" },
];

export const mockBackups: Phase12Record[] = [
  { id: "bkp-001", backupSet: "Daily app data snapshot", schedule: "Daily 02:00", storage: "Encrypted placeholder", lastRun: "Today 02:04", restoreState: "Not requested", rpo: "24h", status: "Completed" },
  { id: "bkp-002", backupSet: "Document archive", schedule: "Hourly", storage: "Warm storage placeholder", lastRun: "Failed at 10:00", restoreState: "Not requested", rpo: "1h", status: "Failed" },
  { id: "bkp-003", backupSet: "DR drill", schedule: "Monthly", storage: "DR site placeholder", lastRun: "15 May 2026", restoreState: "Restore requested placeholder", rpo: "4h", status: "Drill pending" },
];

export const mockDisasterRecovery: Phase12Record[] = [
  { id: "dr-001", drillName: "Monthly restore drill", recoveryArea: "App data snapshot", rpo: "4h placeholder", rto: "2h placeholder", lastDrill: "15 May 2026", gap: "Restore evidence upload pending", signOff: "IT Manager", status: "Drill pending" },
  { id: "dr-002", drillName: "Document archive failover", recoveryArea: "Patient documents", rpo: "24h placeholder", rto: "6h placeholder", lastDrill: "10 May 2026", gap: "No blocker", signOff: "Compliance", status: "Drill completed" },
  { id: "dr-003", drillName: "Critical billing continuity", recoveryArea: "Cash counter and invoices", rpo: "1h placeholder", rto: "90m placeholder", lastDrill: "Scheduled tomorrow", gap: "Manual receipt runbook review", signOff: "Finance", status: "Review pending" },
];

export const mockConsents: Phase12Record[] = [
  { id: "con-001", patient: "Meera J. / PLH-220908", consentType: "ABHA linking", source: "Patient registration", expiry: "20 May 2027", restriction: "None", status: "Active" },
  { id: "con-002", patient: "Sana K. / PLH-210076", consentType: "WhatsApp communication", source: "Mobile app", expiry: "Withdrawn today", restriction: "Block non-emergency", status: "Withdrawn" },
  { id: "con-003", patient: "Ravi K. / PLH-221114", consentType: "Remote monitoring", source: "IPD discharge", expiry: "In 6 days", restriction: "Renewal needed", status: "Expiring soon" },
];

export const mockEncryptionCoverage: Phase12Record[] = [
  { id: "enc-001", dataCategory: "Patient demographics", encryptionState: "Encrypted at rest", keyAlias: "hms-patient-key-****", rotationDue: "18 days", coverage: "100%", gap: "None", secretsExposure: "Masked", status: "Active" },
  { id: "enc-002", dataCategory: "Clinical attachments", encryptionState: "Encrypted placeholder", keyAlias: "hms-doc-key-****", rotationDue: "Today", coverage: "96%", gap: "Legacy scan bucket review", secretsExposure: "Masked", status: "Review pending" },
  { id: "enc-003", dataCategory: "Integration credentials", encryptionState: "Vault placeholder", keyAlias: "hms-int-key-****", rotationDue: "Expired", coverage: "Partial", gap: "ERP credential rotation required", secretsExposure: "Never displayed", status: "Risk flagged" },
];

export const mockCompliance: Phase12Record[] = [
  { id: "cmp-001", checklist: "Privacy policy review", owner: "Compliance officer", evidence: "Policy doc placeholder", dueDate: "Today", gap: "Legal hold section pending", readiness: "Gap", status: "Warning" },
  { id: "cmp-002", checklist: "Encryption coverage", owner: "IT", evidence: "Key report placeholder", dueDate: "Reviewed", gap: "Rotation due", readiness: "Partial", status: "Review pending" },
  { id: "cmp-003", checklist: "Release sign-off", owner: "Hospital Admin", evidence: "Final QA report", dueDate: "Before release", gap: "Accessibility check pending", readiness: "Blocked", status: "Blocked" },
];

export const mockRetentionIncidents: Phase12Record[] = [
  { id: "ret-001", policy: "OPD records retention", archiveState: "Archive placeholder", legalHold: "No", incident: "None", owner: "Compliance", resolution: "Reviewed", status: "Resolved" },
  { id: "ret-002", policy: "Visitor logs", archiveState: "Review due", legalHold: "No", incident: "Data minimization check", owner: "Security", resolution: "Pending", status: "Review pending" },
  { id: "ret-003", policy: "Privacy incident", archiveState: "Locked", legalHold: "Yes", incident: "Wrong recipient communication placeholder", owner: "Compliance", resolution: "Open", status: "Risk flagged" },
];

export const mockMobileViews: Phase12Record[] = [
  { id: "mob-001", roleView: "Doctor", primaryTasks: "OPD queue, rounds, prescription review", offlineState: "Pending sync placeholder", pushPermission: "Allowed", restrictedActions: 2, status: "Pending sync placeholder" },
  { id: "mob-002", roleView: "Nurse", primaryTasks: "Vitals, MAR, nursing notes", offlineState: "Available", pushPermission: "Allowed", restrictedActions: 1, status: "Available" },
  { id: "mob-003", roleView: "Patient", primaryTasks: "Appointments, reports, bills, profile", offlineState: "Restricted own data", pushPermission: "Blocked", restrictedActions: 4, status: "Restricted" },
  { id: "mob-004", roleView: "Management", primaryTasks: "Revenue, occupancy, alerts", offlineState: "Read-only", pushPermission: "Allowed", restrictedActions: 3, status: "Available" },
];

export const mockMobileRoleTasks: Phase12Record[] = [
  { id: "mrt-001", roleView: "Doctor", section: "OPD queue", task: "Review waiting patients", context: "12 assigned, 2 critical flags", permission: "Write notes, approve prescription", offlineConflict: "Draft note sync pending", pushPermission: "Allowed", status: "Pending sync placeholder" },
  { id: "mrt-002", roleView: "Doctor", section: "Rounds", task: "Approve IPD round summary", context: "ICU bed 4 escalation", permission: "Doctor approval required", offlineConflict: "No conflict", pushPermission: "Allowed", status: "Needs review" },
  { id: "mrt-003", roleView: "Nurse", section: "Task list", task: "Record vitals and MAR", context: "Ward B, 18 due tasks", permission: "Nursing station write", offlineConflict: "2 vitals awaiting sync", pushPermission: "Allowed", status: "Review pending" },
  { id: "mrt-004", roleView: "Nurse", section: "Escalation", task: "Acknowledge threshold alert", context: "Remote SpO2 low", permission: "Escalate to doctor", offlineConflict: "Online required", pushPermission: "Allowed", status: "Escalated" },
  { id: "mrt-005", roleView: "Patient", section: "Appointments", task: "View booking and teleconsult", context: "Follow-up tomorrow", permission: "Own data only", offlineConflict: "Read-only cache", pushPermission: "Blocked", status: "Restricted" },
  { id: "mrt-006", roleView: "Patient", section: "Reports and bills", task: "View masked reports and dues", context: "2 reports, INR 1,250 due", permission: "Payment placeholder", offlineConflict: "Download disabled offline", pushPermission: "Blocked", status: "Available" },
  { id: "mrt-007", roleView: "Management", section: "Executive dashboard", task: "Review revenue and occupancy", context: "OPD/IPD/claims summary", permission: "Read-only drill-down", offlineConflict: "Cached snapshot", pushPermission: "Allowed", status: "Available" },
  { id: "mrt-008", roleView: "Management", section: "Alerts", task: "Acknowledge operational blocker", context: "TPA claim aging and bed wait", permission: "Sign-off placeholder", offlineConflict: "Online approval required", pushPermission: "Allowed", status: "Action pending" },
];

export const mockRemoteMonitoring: Phase12Record[] = [
  { id: "rm-001", patient: "Ravi K. / PLH-221114", device: "BP cuff placeholder", feedStatus: "Live placeholder", lastReading: "132/84, HR 82", threshold: "Normal", escalation: "None", status: "Available" },
  { id: "rm-002", patient: "Meera J. / PLH-220908", device: "Pulse ox placeholder", feedStatus: "Stale 42 min", lastReading: "SpO2 91%", threshold: "Low oxygen alert", escalation: "Nurse callback", status: "Escalated" },
  { id: "rm-003", patient: "Sana K. / PLH-210076", device: "Glucometer placeholder", feedStatus: "Offline", lastReading: "Yesterday", threshold: "Consent renewal", escalation: "Blocked", status: "Offline placeholder" },
];

export const mockAiItems: Phase12Record[] = [
  { id: "ai-001", surface: "Clinical assistant", patientContext: "Meera J. OPD", suggestion: "Consider reviewing lipid trend", confidence: "72% placeholder", modelVersion: "clinical-assist-v0", dataFreshness: "Today", reviewer: "Doctor", status: "Needs review" },
  { id: "ai-002", surface: "Voice prescription", patientContext: "OPD note", suggestion: "Transcript extracted 2 medicines", confidence: "86% placeholder", modelVersion: "voice-rx-v0", dataFreshness: "Live transcript", reviewer: "Doctor", status: "Draft" },
  { id: "ai-003", surface: "Radiology AI", patientContext: "CT chest study", suggestion: "Finding suggestion pending radiologist review", confidence: "64% placeholder", modelVersion: "rad-assist-v0", dataFreshness: "Study received today", reviewer: "Radiologist", status: "Suggested" },
  { id: "ai-004", surface: "Smart alerts", patientContext: "ICU bed 4", suggestion: "Sepsis risk escalation placeholder", confidence: "78% placeholder", modelVersion: "risk-v0", dataFreshness: "Vitals 15 min old", reviewer: "Nurse/Doctor", status: "Escalated" },
  { id: "ai-005", surface: "CDS", patientContext: "Prescription review", suggestion: "Allergy and interaction review", confidence: "Rule-based placeholder", modelVersion: "cds-rules-v0", dataFreshness: "Medication list current", reviewer: "Doctor", status: "Overridden" },
];

export const mockQaChecks: Phase12Record[] = [
  { id: "qa-001", area: "Responsive QA", coverage: "Phone/tablet/desktop/wide", finding: "No page-level horizontal scroll", owner: "Frontend", due: "Before release", residualRisk: "Low", status: "Passed" },
  { id: "qa-002", area: "Accessibility QA", coverage: "Keyboard, focus, contrast, labels", finding: "Screen-reader pass pending", owner: "QA", due: "Before release", residualRisk: "Medium", status: "In progress" },
  { id: "qa-003", area: "Performance QA", coverage: "Tables, drawers, skeletons, bundle placeholder", finding: "Large table virtualization future ticket", owner: "Frontend", due: "Waiver review", residualRisk: "Medium", status: "Waived placeholder" },
  { id: "qa-004", area: "Print/export QA", coverage: "Masking, print-safe layouts", finding: "Export backend pending", owner: "Product", due: "Future phase", residualRisk: "Known placeholder", status: "Passed" },
  { id: "qa-005", area: "Release readiness", coverage: "Blockers, sign-off, route coverage", finding: "Final sign-off pending", owner: "Hospital Admin", due: "Release gate", residualRisk: "Pending", status: "Blocked" },
];

export const mockQaResponsive: Phase12Record[] = [
  { id: "qar-001", deviceClass: "Phone", breakpoint: "320-430px", check: "Single-column cards, full-screen drawer, sticky actions", finding: "No page-level horizontal scroll", owner: "Frontend", residualRisk: "Low", status: "Passed" },
  { id: "qar-002", deviceClass: "Tablet", breakpoint: "768-1024px portrait", check: "Two-column panels and compact tables", finding: "Dense tables scroll inside container", owner: "Frontend", residualRisk: "Low", status: "Passed" },
  { id: "qar-003", deviceClass: "Wide desktop", breakpoint: "1440-1920px", check: "Dashboard grids, drawer width, context panels", finding: "No sticky overlap detected", owner: "QA", residualRisk: "Low", status: "Passed" },
];

export const mockQaAccessibility: Phase12Record[] = [
  { id: "qaa-001", area: "Keyboard", check: "Filters, drawer, action bar, table buttons", finding: "Focusable controls visible", owner: "QA", residualRisk: "Manual screen-reader pass pending", status: "In progress" },
  { id: "qaa-002", area: "Contrast", check: "Status tokens in light/dark/dynamic theme", finding: "Critical, danger, warning, success readable", owner: "Design", residualRisk: "Low", status: "Passed" },
  { id: "qaa-003", area: "Labels", check: "Inputs, selects, buttons, icon actions", finding: "Visible labels or accessible text present", owner: "Frontend", residualRisk: "Low", status: "Passed" },
];

export const mockQaPerformance: Phase12Record[] = [
  { id: "qap-001", surface: "Large tables", check: "Contained overflow, sticky table header, pagination placeholder", finding: "Stable table dimensions", owner: "Frontend", residualRisk: "Virtualization future ticket", status: "Waived placeholder" },
  { id: "qap-002", surface: "Drawers", check: "Lazy detail content and print preview", finding: "Drawer opens without layout shift", owner: "Frontend", residualRisk: "Low", status: "Passed" },
  { id: "qap-003", surface: "Skeletons", check: "Reusable table skeleton available for async migration", finding: "Shared DataTable loading state implemented", owner: "Frontend", residualRisk: "Low", status: "Passed" },
];

export const mockQaCrossBrowser: Phase12Record[] = [
  { id: "qab-001", browser: "Chromium", device: "Desktop and Android viewport", check: "Sticky headers, drawer, overflow tables", finding: "No clipping in smoke pass", owner: "QA", residualRisk: "Low", status: "Passed" },
  { id: "qab-002", browser: "Safari placeholder", device: "iPhone/iPad viewport", check: "Touch targets, sticky action bar, safe viewport", finding: "Manual device lab pass pending", owner: "QA", residualRisk: "Medium", status: "In progress" },
  { id: "qab-003", browser: "Edge", device: "Windows desktop", check: "Print preview, select controls, focus rings", finding: "No known blocker", owner: "IT", residualRisk: "Low", status: "Passed" },
];

export const mockQaPrintExport: Phase12Record[] = [
  { id: "qae-001", report: "Audit and integration logs", printSafeLayout: "Light surface with masked payload", hiddenControls: "Navigation/actions hidden placeholder", exportState: "Backend pending", owner: "Product", status: "Passed" },
  { id: "qae-002", report: "Encryption and DR reports", printSafeLayout: "Key aliases masked", hiddenControls: "Rotate/restore disabled", exportState: "Placeholder only", owner: "Compliance", status: "Review pending" },
  { id: "qae-003", report: "Final sign-off", printSafeLayout: "Release metadata reserved", hiddenControls: "Draft controls hidden", exportState: "PDF export future", owner: "Hospital Admin", status: "Passed" },
];

export const mockQaReleaseReadiness: Phase12Record[] = [
  { id: "qag-001", gate: "Route coverage", requirement: "All Phase 12 routes render under app shell", evidence: "47 route smoke pass", owner: "Frontend", blocker: "None", status: "Passed" },
  { id: "qag-002", gate: "Accessibility sign-off", requirement: "Keyboard, contrast, labels, screen reader review", evidence: "Manual screen-reader pass pending", owner: "QA", blocker: "Pending sign-off", status: "Blocked" },
  { id: "qag-003", gate: "Release owner approval", requirement: "Hospital admin and compliance final review", evidence: "Sign-off placeholder reserved", owner: "Hospital Admin", blocker: "Business approval", status: "Action pending" },
];
