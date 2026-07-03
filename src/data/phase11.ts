export type Phase11Record = Record<string, string | number | boolean | string[]>;

export const mockEmployees: Phase11Record[] = [
  { id: "emp-001", employeeNo: "EMP-1001", name: "Dr. Kavita Rao", role: "Doctor", department: "Cardiology", status: "Active", onboarding: "Completed", documents: "License expires in 38 days", accessState: "Clinical access active" },
  { id: "emp-002", employeeNo: "EMP-1044", name: "Neha Sharma", role: "Nurse", department: "ICU", status: "On leave", onboarding: "Completed", documents: "BLS renewal due", accessState: "Nursing access active" },
  { id: "emp-003", employeeNo: "EMP-1178", name: "Rohan Mehta", role: "Billing Executive", department: "Billing", status: "Probation", onboarding: "Training pending", documents: "ID proof verified", accessState: "Restricted billing access" },
  { id: "emp-004", employeeNo: "EMP-1202", name: "Aarti Nair", role: "Housekeeping Supervisor", department: "Housekeeping", status: "Active", onboarding: "Completed", documents: "Police verification pending", accessState: "Support access active" },
];

export const mockAttendance: Phase11Record[] = [
  { id: "att-001", staff: "Dr. Kavita Rao", department: "Cardiology", shift: "09:00-17:00", punchIn: "08:54", punchOut: "Pending", status: "Present", correction: "No request" },
  { id: "att-002", staff: "Neha Sharma", department: "ICU", shift: "Night", punchIn: "On leave", punchOut: "On leave", status: "On leave", correction: "Approved" },
  { id: "att-003", staff: "Rohan Mehta", department: "Billing", shift: "10:00-18:00", punchIn: "10:24", punchOut: "Pending", status: "Late", correction: "Correction requested" },
  { id: "att-004", staff: "Aarti Nair", department: "Housekeeping", shift: "07:00-15:00", punchIn: "Absent", punchOut: "Absent", status: "Absent", correction: "Reason required" },
];

export const mockShifts: Phase11Record[] = [
  { id: "shf-001", rosterNo: "RST-ICU-01", department: "ICU", date: "Today", assignedStaff: 14, requiredStaff: 16, gap: 2, status: "Short staffed", approval: "Publish blocked" },
  { id: "shf-002", rosterNo: "RST-OPD-02", department: "OPD", date: "Today", assignedStaff: 22, requiredStaff: 20, gap: 0, status: "Published", approval: "Approved" },
  { id: "shf-003", rosterNo: "RST-HK-03", department: "Housekeeping", date: "Tomorrow", assignedStaff: 9, requiredStaff: 10, gap: 1, status: "Swap requested", approval: "Supervisor review" },
];

export const mockLeaves: Phase11Record[] = [
  { id: "lv-001", requestNo: "LV-901", staff: "Neha Sharma", department: "ICU", leaveType: "Sick leave", days: 2, balance: 7, status: "Approved", approver: "Nursing Head" },
  { id: "lv-002", requestNo: "LV-902", staff: "Rohan Mehta", department: "Billing", leaveType: "Casual leave", days: 1, balance: 0, status: "Balance insufficient", approver: "HR Manager" },
  { id: "lv-003", requestNo: "LV-903", staff: "Aarti Nair", department: "Housekeeping", leaveType: "Emergency leave", days: 3, balance: 5, status: "Requested", approver: "Admin Head" },
];

export const mockPayroll: Phase11Record[] = [
  { id: "payroll-001", runNo: "PAY-MAY-2026", period: "May 2026", employees: 286, grossPlaceholder: 18450000, attendanceLocked: "Pending", status: "Review pending", print: "Payslip preview placeholder" },
  { id: "payroll-002", runNo: "PAY-APR-2026", period: "Apr 2026", employees: 281, grossPlaceholder: 17920000, attendanceLocked: "Locked", status: "Payslip generated placeholder", print: "Payslip print placeholder" },
];

export const mockRecruitment: Phase11Record[] = [
  { id: "rec-001", candidate: "Sahil Verma", opening: "ICU Nurse", department: "ICU", stage: "Interview scheduled", interview: "Tomorrow 11:00", status: "Interview scheduled" },
  { id: "rec-002", candidate: "Farah Ali", opening: "Radiology Technician", department: "Radiology", stage: "Offer", interview: "Completed", status: "Offered" },
  { id: "rec-003", candidate: "Manish Jain", opening: "Cashier", department: "Finance", stage: "Screening", interview: "Pending", status: "Screening" },
];

export const mockAppraisals: Phase11Record[] = [
  { id: "apr-001", cycle: "FY26 Midyear", staff: "Dr. Kavita Rao", department: "Cardiology", selfReview: "Submitted", managerReview: "Pending", rating: "4.5 placeholder", status: "Review pending" },
  { id: "apr-002", cycle: "FY26 Midyear", staff: "Neha Sharma", department: "ICU", selfReview: "Draft", managerReview: "Not started", rating: "Restricted", status: "Draft" },
];

export const mockTraining: Phase11Record[] = [
  { id: "trn-001", training: "BLS renewal", audience: "Clinical staff", dueDate: "27 May 2026", participants: 42, completion: "71%", status: "Due" },
  { id: "trn-002", training: "Data privacy refresh", audience: "All staff", dueDate: "31 May 2026", participants: 286, completion: "88%", status: "In progress" },
  { id: "trn-003", training: "Fire drill", audience: "Support teams", dueDate: "Completed", participants: 64, completion: "100%", status: "Completed" },
];

export const mockStaffDocuments: Phase11Record[] = [
  { id: "doc-001", staff: "Dr. Kavita Rao", document: "Medical council license", expiry: "28 Jun 2026", verification: "Verified", risk: "Expiring", status: "Renewal required" },
  { id: "doc-002", staff: "Aarti Nair", document: "Police verification", expiry: "Pending", verification: "Pending", risk: "Restricted access", status: "Verification pending" },
  { id: "doc-003", staff: "Neha Sharma", document: "BLS certificate", expiry: "25 May 2026", verification: "Verified", risk: "Credential expiry", status: "Expiring" },
];

export const mockSupportTasks: Phase11Record[] = [
  { id: "adm-001", taskNo: "HK-448", service: "Housekeeping", location: "ICU isolation room", owner: "Aarti Nair", priority: "High", due: "Today 14:30", status: "Delayed" },
  { id: "adm-002", taskNo: "LD-102", service: "Laundry", location: "Ward 5", owner: "Laundry desk", priority: "Medium", due: "Today 16:00", status: "In progress" },
  { id: "adm-003", taskNo: "CF-221", service: "Cafeteria", location: "Room 412", owner: "Diet kitchen", priority: "Diet warning", due: "Today 13:15", status: "Assigned" },
  { id: "adm-004", taskNo: "SEC-019", service: "Security", location: "Main gate", owner: "Security desk", priority: "Critical", due: "Now", status: "Incident reported" },
];

export const mockFrontOfficeAdmin: Phase11Record[] = [
  { id: "fo-001", counter: "Reception 1", owner: "Priya Desk", queue: 9, handoffs: 3, openClose: "Open", status: "Assigned" },
  { id: "fo-002", counter: "Billing desk", owner: "Rohan Mehta", queue: 6, handoffs: 4, openClose: "Open", status: "In progress" },
  { id: "fo-003", counter: "Help desk", owner: "Unassigned", queue: 4, handoffs: 1, openClose: "Closed", status: "Requested" },
];

export const mockHousekeeping: Phase11Record[] = [
  { id: "hk-001", taskNo: "HK-448", roomWard: "ICU isolation room", assignment: "Aarti Nair", infectionFlag: "Isolation warning", due: "Today 14:30", status: "Delayed" },
  { id: "hk-002", taskNo: "HK-449", roomWard: "Ward 3 bed 12", assignment: "Team B", infectionFlag: "Standard", due: "Today 15:00", status: "In progress" },
  { id: "hk-003", taskNo: "HK-450", roomWard: "OT recovery", assignment: "Team A", infectionFlag: "Post procedure", due: "Done", status: "Completed" },
];

export const mockLaundry: Phase11Record[] = [
  { id: "lau-001", requestNo: "LD-102", department: "Ward 5", linenType: "Patient linen", quantity: 38, warning: "Standard", status: "Processing" },
  { id: "lau-002", requestNo: "LD-103", department: "ICU", linenType: "Infectious linen", quantity: 12, warning: "Infectious linen warning", status: "In progress" },
  { id: "lau-003", requestNo: "LD-104", department: "OT", linenType: "Surgical drapes", quantity: 6, warning: "Damaged item review", status: "Reopened" },
];

export const mockCafeteria: Phase11Record[] = [
  { id: "caf-001", orderNo: "CAF-501", requester: "Room 412", diet: "Diabetic diet warning", items: "Low sugar meal", billing: "IPD billing placeholder", status: "Assigned" },
  { id: "caf-002", orderNo: "CAF-502", requester: "Staff cafeteria", diet: "Standard", items: "Lunch tray", billing: "Payroll deduction placeholder", status: "Completed" },
  { id: "caf-003", orderNo: "CAF-503", requester: "Room 215", diet: "NPO alert", items: "Order blocked", billing: "Cancelled", status: "Cancelled" },
];

export const mockVisitors: Phase11Record[] = [
  { id: "vis-001", passNo: "VP-901", visitor: "Sana Khan", mapping: "Patient M.J. / Guardian", purpose: "Consent", validTill: "Today 18:00", idProof: "Captured placeholder", status: "Checked in" },
  { id: "vis-002", passNo: "VP-902", visitor: "Amit Lal", mapping: "Staff meeting", purpose: "Vendor discussion", validTill: "Expired 25m", idProof: "Captured placeholder", status: "Overstay" },
  { id: "vis-003", passNo: "VP-903", visitor: "Blocked sample", mapping: "Security watchlist", purpose: "Restricted", validTill: "NA", idProof: "Flagged", status: "Blocklisted placeholder" },
];

export const mockSecurityDesk: Phase11Record[] = [
  { id: "sec-001", logNo: "SEC-019", location: "Main gate", actor: "Visitor VP-902", severity: "High", actionOwner: "Security desk", status: "Incident reported" },
  { id: "sec-002", logNo: "SEC-020", location: "Basement", actor: "Staff movement", severity: "Low", actionOwner: "Guard 2", status: "Checked out" },
];

export const mockComplaints: Phase11Record[] = [
  { id: "cmp-001", complaintNo: "CMP-1001", source: "Patient M.J.", category: "Billing wait", priority: "High", owner: "Quality desk", due: "Today 17:00", status: "Delayed" },
  { id: "cmp-002", complaintNo: "CMP-1002", source: "Visitor masked", category: "Cleanliness", priority: "Medium", owner: "Admin desk", due: "Tomorrow", status: "Assigned" },
  { id: "cmp-003", complaintNo: "CMP-1003", source: "Staff", category: "Cafeteria", priority: "Low", owner: "Cafeteria manager", due: "Closed", status: "Completed" },
];

export const mockFeedback: Phase11Record[] = [
  { id: "fb-001", feedbackNo: "FB-771", source: "Patient masked", category: "Doctor experience", rating: 5, owner: "Quality desk", response: "Thank-you queued", status: "Resolved" },
  { id: "fb-002", feedbackNo: "FB-772", source: "Visitor masked", category: "Queue delay", rating: 2, owner: "Reception lead", response: "Escalation pending", status: "Escalated" },
];

export const mockCommunicationTemplates: Phase11Record[] = [
  { id: "tpl-001", template: "Appointment reminder", channel: "SMS", audience: "Patients with consent", variables: ["patient", "doctor", "time"], quietHour: "Blocks non-emergency", status: "Active" },
  { id: "tpl-002", template: "Staff shift alert", channel: "Push", audience: "Staff department", variables: ["staff", "shift", "location"], quietHour: "Allowed", status: "Active" },
  { id: "tpl-003", template: "Claim document query", channel: "WhatsApp", audience: "Patients with opt-in", variables: ["claim", "document"], quietHour: "Blocks non-emergency", status: "Draft" },
];

export const mockCommunicationLogs: Phase11Record[] = [
  { id: "log-001", logNo: "COM-8801", channel: "SMS", recipient: "Patient masked", audience: "Appointment", consent: "Allowed", delivery: "Delivered placeholder", status: "Delivered placeholder" },
  { id: "log-002", logNo: "COM-8802", channel: "WhatsApp", recipient: "Patient masked", audience: "Claim query", consent: "Opt-out blocked", delivery: "Not sent", status: "Failed" },
  { id: "log-003", logNo: "COM-8803", channel: "Email", recipient: "Staff", audience: "Training due", consent: "Internal", delivery: "Retry pending", status: "Retrying" },
  { id: "log-004", logNo: "COM-8804", channel: "Push", recipient: "Nurses ICU", audience: "Shift gap", consent: "Internal", delivery: "Queued", status: "Queued" },
];

export const mockAlertRules: Phase11Record[] = [
  { id: "alr-001", rule: "ICU shift gap", module: "HRMS", severity: "High", recipients: "Nursing head, HR", trigger: "Staffing below safe threshold", status: "Triggered" },
  { id: "alr-002", rule: "Failed claim message", module: "Communication", severity: "Medium", recipients: "Insurance desk", trigger: "Delivery failed twice", status: "Active" },
  { id: "alr-003", rule: "Visitor overstay", module: "Security", severity: "High", recipients: "Security desk", trigger: "Pass expired > 15m", status: "Escalated" },
];

export const mockEmergencyAlerts: Phase11Record[] = [
  { id: "emg-001", alertNo: "EA-101", severity: "Critical", audience: "All floor marshals", message: "Mock fire drill acknowledgement", acknowledged: "74%", escalation: "Pending floors 4 and 5", status: "Triggered" },
  { id: "emg-002", alertNo: "EA-102", severity: "High", audience: "Security and admin", message: "Main gate incident placeholder", acknowledged: "100%", escalation: "Resolved", status: "Resolved" },
];

export const mockReports: Phase11Record[] = [
  { id: "rep-001", report: "Daily MIS summary", source: "HMS static warehouse", dateRange: "Today", generatedBy: "Hospital Admin", generatedAt: "Today 16:00", status: "Ready" },
  { id: "rep-002", report: "Financial collection", source: "Phase 10 billing", dateRange: "This month", generatedBy: "Management", generatedAt: "Pending", status: "Export pending" },
  { id: "rep-003", report: "Clinical diagnosis trend", source: "EMR placeholder", dateRange: "Last 30 days", generatedBy: "Doctor", generatedAt: "Restricted", status: "Restricted" },
  { id: "rep-004", report: "Audit sensitive access", source: "Audit logs", dateRange: "Last 7 days", generatedBy: "Super Admin", generatedAt: "Today 15:20", status: "Ready" },
];

export const mockReportBuilderFields: Phase11Record[] = [
  { id: "fld-001", dataSource: "Billing", field: "Net amount", restricted: false, grouping: "Department", sort: "Descending", preview: "Shown" },
  { id: "fld-002", dataSource: "Patient", field: "Mobile number", restricted: true, grouping: "Masked", sort: "Disabled", preview: "Restricted field" },
  { id: "fld-003", dataSource: "HRMS", field: "Payroll placeholder", restricted: true, grouping: "Role access", sort: "Disabled", preview: "Restricted field" },
];

export const mockScheduledReports: Phase11Record[] = [
  { id: "sch-001", schedule: "Daily MIS to management", frequency: "Daily 18:00", recipients: "Management", channel: "Email placeholder", nextRun: "Today 18:00", status: "Ready" },
  { id: "sch-002", schedule: "Weekly financial report", frequency: "Monday 09:00", recipients: "Finance + management", channel: "Email placeholder", nextRun: "Failed last run", status: "Export failed placeholder" },
  { id: "sch-003", schedule: "Audit risk digest", frequency: "Daily 08:30", recipients: "Super Admin", channel: "Email placeholder", nextRun: "Tomorrow", status: "Restricted" },
];

export const phase11Datasets = {
  employees: mockEmployees,
  attendance: mockAttendance,
  shifts: mockShifts,
  leaves: mockLeaves,
  payroll: mockPayroll,
  recruitment: mockRecruitment,
  appraisals: mockAppraisals,
  training: mockTraining,
  documents: mockStaffDocuments,
  frontOffice: mockFrontOfficeAdmin,
  housekeeping: mockHousekeeping,
  laundry: mockLaundry,
  cafeteria: mockCafeteria,
  visitors: mockVisitors,
  security: mockSecurityDesk,
  complaints: mockComplaints,
  feedback: mockFeedback,
  templates: mockCommunicationTemplates,
  logs: mockCommunicationLogs,
  alerts: mockAlertRules,
  emergencyAlerts: mockEmergencyAlerts,
  reports: mockReports,
  builder: mockReportBuilderFields,
  schedules: mockScheduledReports,
};
