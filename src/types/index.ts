import type { LucideIcon } from "lucide-react";

export type Role =
  | "Super Admin"
  | "Hospital Admin"
  | "Doctor"
  | "Doctor ICU"
  | "Ward Nurse"
  | "Unit Nurse"
  | "Head Nurse"
  | "ICU Bed Coordinator"
  | "Diagnostics Team"
  | "Tele ICU Doctor"
  | "Biomedical Engineer"
  | "ICU Pharmacist"
  | "Quality Audit"
  | "Nurse"
  | "Receptionist"
  | "Lab Technician"
  | "Radiologist"
  | "Pharmacist"
  | "Billing Executive"
  | "HR Manager"
  | "Management";

export type StatusTone = "success" | "warning" | "danger" | "info" | "critical" | "muted";

export type NavigationItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  group: string;
  allowedRoles: Role[];
  status?: "ready" | "planned";
  children?: NavigationChildItem[];
};

export type NavigationChildItem = {
  id: string;
  label: string;
  route: string;
  status?: "ready" | "planned";
  children?: NavigationChildItem[];
};

export type NotificationPriority = "high" | "medium" | "low";
export type NotificationStatus = "unread" | "read" | "acknowledged";

export type NotificationItem = {
  id: string;
  type:
    | "Clinical alert"
    | "Critical lab alert"
    | "Appointment alert"
    | "Billing approval"
    | "Pharmacy stock alert"
    | "Bed management alert"
    | "Security alert"
    | "System message"
    | "Task assignment";
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  module: string;
  patient?: string;
  createdAt: string;
};

export type SearchResult = {
  id: string;
  type: "Patient" | "Doctor" | "Appointment" | "Module" | "Bill" | "Lab report" | "Radiology report" | "Action";
  title: string;
  description: string;
  meta: string;
  route: string;
};

export type UiPreference = {
  version: 1;
  mode: "light" | "dark" | "system";
  colorPreset: "clinical-blue" | "care-green" | "trust-teal" | "emergency-red" | "executive-neutral" | "custom";
  customPrimary?: string;
  density: "comfortable" | "compact";
  sidebar: "expanded" | "collapsed" | "auto";
};

export type AdminStatus = "Active" | "Inactive" | "Locked" | "Invited" | "Draft" | "Future Ready";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type AdminRoleRecord = {
  id: string;
  name: Role;
  type: "System" | "Custom";
  description: string;
  departmentScope: string;
  status: "Active" | "Inactive";
  userCount: number;
  modulesAllowed: number;
  permissionCount: number;
  protected: boolean;
  risk: RiskLevel;
  updatedAt: string;
};

export type PermissionRecord = {
  id: string;
  module: string;
  page: string;
  tab: string;
  action: string;
  description: string;
  sensitive: boolean;
  enabled: boolean;
  dependency: "Module" | "Page" | "Tab" | "Action" | "Sensitive";
};

export type UserRecord = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  mobile: string;
  roleIds: string[];
  departmentIds: string[];
  designation: string;
  status: AdminStatus;
  lastLoginAt: string;
  locked: boolean;
  failedLogins: number;
};

export type DepartmentRecord = {
  id: string;
  code: string;
  name: string;
  type: "Clinical" | "Diagnostic" | "Administrative" | "Support" | "Finance" | "Store";
  head: string;
  location: string;
  users: number;
  status: "Active" | "Inactive";
  enabledWorkflows: string[];
};

export type BranchRecord = {
  id: string;
  code: string;
  name: string;
  city: string;
  type: "Main Hospital" | "Future Branch";
  departments: number;
  status: "Active" | "Future Ready";
};

export type SecuritySession = {
  id: string;
  user: string;
  role: Role;
  device: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  status: "Active" | "Idle" | "Expired";
};

export type TrustedDevice = {
  id: string;
  name: string;
  user: string;
  browser: string;
  lastUsed: string;
  trustStatus: "Trusted" | "Review" | "Blocked";
  risk: RiskLevel;
};

export type IpRule = {
  id: string;
  range: string;
  type: "Allow" | "Block";
  description: string;
  addedBy: string;
  status: "Active" | "Inactive";
};

export type AuditLog = {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  module: string;
  eventType: string;
  target: string;
  severity: "Info" | "Warning" | "Critical" | "Security";
  ipAddress: string;
  device: string;
  before: string;
  after: string;
  sensitiveFieldsMasked: boolean;
};

export type PatientStatus =
  | "Active"
  | "Inactive"
  | "Unknown emergency"
  | "Deceased"
  | "Merged placeholder"
  | "Duplicate review"
  | "Archived placeholder";

export type PatientGender = "Female" | "Male" | "Other" | "Unknown";
export type AbhaStatus = "Not linked" | "Link pending" | "Linked" | "Verification failed" | "Consent required" | "Sync pending";

export type PatientRecord = {
  id: string;
  uhid: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: PatientGender;
  bloodGroup: string;
  mobile: string;
  maskedMobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  status: PatientStatus;
  abhaStatus: AbhaStatus;
  lastVisitAt: string;
  department: string;
  alertFlags: string[];
  identityCompleteness: number;
  isMinor: boolean;
  guardianRequired: boolean;
  maskedIdNumber: string;
  documentStatus: "Verified" | "Pending verification" | "Rejected" | "Expired";
};

export type PatientVisit = {
  id: string;
  patientId: string;
  visitType: "OPD" | "IPD" | "Emergency" | "Lab" | "Radiology" | "Pharmacy" | "Billing";
  department: string;
  provider: string;
  referenceNumber: string;
  status: "Completed" | "Active" | "Pending" | "Cancelled";
  visitedAt: string;
  summary: string;
  amount: string;
};

export type FamilyMember = {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  linkedUhid?: string;
  ageGender: string;
  mobile: string;
  primaryContact: boolean;
  status: "Linked" | "Not linked" | "Emergency contact";
};

export type PatientDocument = {
  id: string;
  patientId: string;
  name: string;
  category: string;
  fileType: "PDF" | "JPG" | "PNG";
  uploadedAt: string;
  uploadedBy: string;
  verificationStatus: "Pending verification" | "Verified" | "Rejected" | "Expired" | "Archived";
  linkedVisitId?: string;
  comments: string;
};

export type ConsentForm = {
  id: string;
  patientId: string;
  type: string;
  version: string;
  status: "Not signed" | "Signed" | "Expired" | "Withdrawn" | "Pending guardian";
  signedBy: string;
  relationship: string;
  signedAt: string;
  expiresAt: string;
  linkedVisitId?: string;
};

export type DuplicatePatientMatch = {
  id: string;
  primaryPatientId: string;
  matchedPatientId: string;
  matchReason: string;
  confidence: number;
  status: "Pending review" | "Merge requested" | "Not duplicate" | "Resolved";
  createdAt: string;
};

export type EmergencyPatient = {
  id: string;
  temporaryId: string;
  approxAge: number;
  gender: PatientGender;
  broughtBy: string;
  contactNumber: string;
  department: string;
  identityMarks: string;
  unknownReason: string;
  status: "Unknown emergency";
};

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Checked in"
  | "Waiting"
  | "In consultation"
  | "Completed"
  | "Rescheduled"
  | "Cancelled"
  | "No-show"
  | "Late"
  | "Follow-up due";

export type QueueStatus = "Waiting" | "Called" | "In consultation" | "On hold" | "Skipped" | "Completed" | "Cancelled";
export type TokenStatus = "Issued" | "Called" | "Serving" | "Skipped" | "Held" | "Completed" | "Expired";
export type OperationalPriority = "Routine" | "Urgent" | "Emergency" | "VIP";
export type DelayLevel = "Normal" | "Approaching delay" | "Delayed" | "Critical delay";

export type AppointmentRecord = {
  id: string;
  appointmentNo: string;
  patientId: string;
  department: string;
  doctor: string;
  date: string;
  startTime: string;
  endTime: string;
  visitType: "New" | "Follow-up" | "Review" | "Emergency";
  appointmentType: "Regular" | "Walk-in" | "Emergency" | "Teleconsultation";
  status: AppointmentStatus;
  priority: OperationalPriority;
  source: string;
  reason: string;
  tokenId?: string;
  teleconsultation: boolean;
  room: string;
  counter: string;
  checkedInAt?: string;
  paymentStatus: "Pending" | "Paid" | "Package" | "Not required";
  createdBy: string;
  createdAt: string;
};

export type DoctorSchedule = {
  id: string;
  doctor: string;
  department: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  room: string;
  maxPatients: number;
  status: "Active" | "Blocked" | "Leave" | "Template";
};

export type AppointmentSlot = {
  id: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  duration: number;
  room: string;
  status: "Available" | "Booked" | "Blocked" | "Overbook allowed" | "Doctor unavailable";
};

export type QueueEntry = {
  id: string;
  appointmentId: string;
  patientId: string;
  tokenNo: string;
  position: number;
  department: string;
  doctor: string;
  status: QueueStatus;
  waitingSince: string;
  priority: OperationalPriority;
  checkedInAt: string;
  calledAt?: string;
  delayLevel: DelayLevel;
  statusReason?: string;
};

export type TokenRecord = {
  id: string;
  tokenNo: string;
  prefix: string;
  patientId: string;
  appointmentId: string;
  department: string;
  doctor: string;
  counter: string;
  status: TokenStatus;
  issuedAt: string;
  calledAt?: string;
  reprintCount: number;
  lastReprintReason?: string;
};

export type FollowUpRecord = {
  id: string;
  patientId: string;
  lastVisitId: string;
  department: string;
  doctor: string;
  dueDate: string;
  reason: string;
  status: "Due today" | "Overdue" | "Scheduled" | "Missed" | "Completed";
  contactAttempts: number;
};

export type TeleconsultationRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  time: string;
  doctor: string;
  department: string;
  consentStatus: "Signed" | "Pending" | "Missing";
  linkStatus: "Link pending" | "Ready to join" | "Waiting online" | "In call placeholder" | "Completed" | "Failed/no-show";
  appointmentStatus: AppointmentStatus;
};

export type FrontOfficeWorkItem = {
  id: string;
  time: string;
  patientId: string;
  purpose: string;
  department: string;
  doctor: string;
  status: AppointmentStatus | QueueStatus | TokenStatus;
  token?: string;
  nextAction: string;
};

export type ConsultationStatus =
  | "Not started"
  | "In progress"
  | "Draft saved"
  | "Completed"
  | "Printed"
  | "Revised placeholder"
  | "Addendum placeholder"
  | "Cancelled visit placeholder";

export type OpdWorklistItem = {
  id: string;
  visitId: string;
  patientId: string;
  appointmentId: string;
  tokenNo: string;
  appointmentTime: string;
  waitingTime: string;
  visitType: "New" | "Follow-up" | "Review" | "Emergency" | "Teleconsultation";
  queueStatus: QueueStatus;
  vitalsStatus: "Recorded" | "Missing" | "Abnormal" | "Critical";
  consultationStatus: ConsultationStatus;
  doctor: string;
  department: string;
};

export type ConsultationRecord = {
  id: string;
  visitId: string;
  patientId: string;
  appointmentId: string;
  doctor: string;
  department: string;
  status: ConsultationStatus;
  startedAt: string;
  completedAt?: string;
  printedAt?: string;
  chiefComplaint: string;
  diagnosisIds: string[];
  prescriptionId: string;
  followUpDate: string;
  handoffStatuses: Record<string, "not sent" | "ready" | "sent placeholder" | "failed placeholder">;
  notes: string;
};

export type DiagnosisRecord = {
  id: string;
  patientId: string;
  visitId: string;
  diagnosis: string;
  icdCode: string;
  type: "Provisional" | "Final" | "Differential";
  primary: boolean;
  severity: "Mild" | "Moderate" | "Severe";
  status: "Active" | "Resolved" | "Ruled out";
  notes: string;
};

export type PrescriptionMedicine = {
  id: string;
  prescriptionId: string;
  medicineName: string;
  genericName: string;
  strength: string;
  form: string;
  route: string;
  dose: string;
  doseUnit: string;
  frequency: string;
  timing: string;
  duration: number;
  durationUnit: string;
  quantity: number;
  instructions: string;
  alerts: string[];
};

export type VitalRecord = {
  id: string;
  patientId: string;
  visitId: string;
  recordedAt: string;
  recordedBy: string;
  temperature: string;
  pulse: string;
  bloodPressure: string;
  respiratoryRate: string;
  spo2: string;
  height: string;
  weight: string;
  bmi: string;
  painScore: string;
  status: "Normal" | "Abnormal" | "Critical" | "Missing";
  source: "Manual" | "Imported placeholder";
};

export type AllergyRecord = {
  id: string;
  patientId: string;
  allergen: string;
  type: "Drug" | "Food" | "Environmental" | "Other";
  reaction: string;
  severity: "Mild" | "Moderate" | "Severe" | "Critical";
  status: "Active" | "Inactive";
  notes: string;
  updatedAt: string;
};

export type ClinicalTemplate = {
  id: string;
  name: string;
  type: "Clinical note" | "SOAP note" | "Diagnosis" | "Prescription" | "Procedure advice" | "Follow-up advice" | "Patient instruction";
  specialty: string;
  scope: "Doctor" | "Department" | "Global";
  tags: string[];
  content: string;
  status: "Active" | "Inactive";
  updatedAt: string;
};

export type AdmissionStatus =
  | "Requested"
  | "Approved"
  | "Admitted"
  | "Bed assigned"
  | "In ward"
  | "In ICU"
  | "Transfer pending"
  | "Discharge initiated"
  | "Discharge approved"
  | "Discharged"
  | "Cancelled";

export type BedStatus = "Available" | "Occupied" | "Reserved" | "Cleaning" | "Maintenance" | "Blocked" | "Isolation";
export type NursingTaskStatus = "Pending" | "Due now" | "Overdue" | "Completed" | "Missed" | "Cancelled";
export type MedicationAdministrationStatus = "Scheduled" | "Due" | "Administered" | "Missed" | "Held" | "Refused" | "Delayed";
export type TriagePriority = "Red: immediate" | "Orange: very urgent" | "Yellow: urgent" | "Green: standard" | "Black/expectant placeholder";
export type EmergencyStatus =
  | "Registered"
  | "Triage pending"
  | "In triage"
  | "In casualty"
  | "Stabilizing"
  | "Referred"
  | "Admitted to IPD"
  | "Discharged from emergency"
  | "Deceased placeholder";

export type AdmissionRecord = {
  id: string;
  admissionNo: string;
  patientId: string;
  department: string;
  consultant: string;
  admissionType: "Planned" | "Emergency" | "Transfer" | "Day care placeholder";
  admittedAt: string;
  bedId: string;
  ward: string;
  status: AdmissionStatus;
  diagnosis: string;
  priority: OperationalPriority;
};

export type BedRecord = {
  id: string;
  bedNo: string;
  ward: string;
  roomNo: string;
  bedType: "General" | "Semi-private" | "Private" | "ICU" | "Isolation";
  status: BedStatus;
  patientId?: string;
  consultant?: string;
  isIsolationCapable: boolean;
  genderRestriction: "Any" | "Male" | "Female";
  lastStatusChangedAt: string;
  statusReason: string;
};

export type NursingTask = {
  id: string;
  admissionId: string;
  patientId: string;
  bedNo: string;
  task: string;
  category: "Medication" | "Vitals" | "Assessment" | "Handoff" | "Safety";
  dueAt: string;
  status: NursingTaskStatus;
  risk: RiskLevel;
};

export type MedicationAdministrationRecord = {
  id: string;
  patientId: string;
  admissionId: string;
  medicineName: string;
  dose: string;
  route: string;
  dueTime: string;
  status: MedicationAdministrationStatus;
  administeredBy: string;
  administeredAt: string;
  reason: string;
  safetyChecks: string[];
};

export type EmergencyCase = {
  id: string;
  caseNo: string;
  patientId: string;
  arrivalTime: string;
  chiefComplaint: string;
  arrivalMode: "Walk-in" | "Ambulance" | "Referral" | "Police";
  priority: TriagePriority;
  status: EmergencyStatus;
  assignedArea: string;
};

export type AmbulanceRequest = {
  id: string;
  requestNo: string;
  callerName: string;
  patientId?: string;
  pickupLocation: string;
  destination: string;
  ambulanceNo: string;
  driverName: string;
  status: "Requested" | "Assigned" | "Dispatched" | "Picked up" | "Arriving" | "Arrived" | "Cancelled";
  eta: string;
  delayReason?: string;
};

export type EncounterType =
  | "OPD"
  | "IPD"
  | "Emergency"
  | "Teleconsultation placeholder"
  | "Lab placeholder"
  | "Radiology placeholder"
  | "Pharmacy placeholder"
  | "Billing placeholder";

export type ClinicalRecordStatus =
  | "Draft"
  | "Completed"
  | "Signed placeholder"
  | "Addendum placeholder"
  | "Revised placeholder"
  | "Cancelled"
  | "Archived placeholder"
  | "Superseded placeholder"
  | "Legal hold placeholder";

export type ClinicalAttachmentStatus = "Uploaded" | "Verified" | "Pending verification" | "Rejected" | "Expired" | "Archived";
export type DigitalSignatureStatus = "Not required" | "Pending" | "Signed placeholder" | "Rejected placeholder" | "Expired certificate placeholder";
export type SensitivityLevel = "Normal" | "Sensitive" | "Restricted" | "Break-glass placeholder" | "Consent-gated placeholder";
export type RecordVersionState = "Current" | "Previous" | "Addendum" | "Superseded" | "Archived placeholder";
export type DisclosureStatus = "Draft" | "Consent required" | "Approval pending" | "Approved placeholder" | "Rejected placeholder" | "Shared placeholder";

export type EmrEncounter = {
  id: string;
  patientId: string;
  encounterNo: string;
  encounterType: EncounterType;
  department: string;
  provider: string;
  startedAt: string;
  completedAt: string;
  status: ClinicalRecordStatus;
  signatureStatus: DigitalSignatureStatus;
  sensitivity: SensitivityLevel;
  versionState: RecordVersionState;
  legalHold: boolean;
  summary: string;
  diagnosisSummary: string;
  prescriptionSummary: string;
  documentsCount: number;
  relatedRoute: string;
};

export type MedicalHistoryItem = {
  id: string;
  patientId: string;
  section: "Past medical" | "Surgical" | "Family" | "Social" | "Medication" | "Allergy" | "Immunization" | "Obstetric/Gynecology placeholder";
  condition: string;
  onset: string;
  status: "Active" | "Resolved" | "Verified" | "Unverified" | "Archived placeholder";
  severity: "Low" | "Medium" | "High" | "Critical";
  notes: string;
  sourceEncounter: string;
  verified: boolean;
  sensitivity: SensitivityLevel;
};

export type ProgressNote = {
  id: string;
  patientId: string;
  encounterId: string;
  noteType: "OPD note" | "IPD progress note" | "Emergency note" | "Nursing note" | "Doctor round note" | "Addendum" | "Referral note placeholder";
  author: string;
  department: string;
  createdAt: string;
  status: ClinicalRecordStatus;
  signatureStatus: DigitalSignatureStatus;
  internalOnly: boolean;
  summary: string;
  fullNote: string;
  addendumHistory: string;
  version: string;
};

export type ClinicalAttachment = {
  id: string;
  patientId: string;
  encounterId: string;
  name: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  verificationStatus: ClinicalAttachmentStatus;
  signatureStatus: DigitalSignatureStatus;
  sensitivity: SensitivityLevel;
  previewAvailable: boolean;
  retentionStatus: string;
  legalHold: boolean;
};

export type DigitalSignatureRecord = {
  id: string;
  documentId: string;
  documentName: string;
  patientId: string;
  encounterId: string;
  requestedBy: string;
  signer: string;
  requestedAt: string;
  status: DigitalSignatureStatus;
  certificateStatus: "Valid placeholder" | "Expired placeholder" | "Not required" | "Pending enrollment placeholder";
  reason: string;
};

export type ClinicalTimelineEvent = {
  id: string;
  patientId: string;
  encounterId?: string;
  eventType: string;
  title: string;
  summary: string;
  occurredAt: string;
  department: string;
  provider: string;
  status: ClinicalRecordStatus | ClinicalAttachmentStatus | DigitalSignatureStatus | string;
  sensitivity: SensitivityLevel;
  versionContext: string;
  category: "Clinical" | "Operational" | "Governance";
};

export type RecordAccessAudit = {
  id: string;
  patientId: string;
  recordId: string;
  recordType: string;
  user: string;
  role: Role;
  action: string;
  reason: string;
  sensitivity: SensitivityLevel;
  ipAddress: string;
  device: string;
  timestamp: string;
  outcome: "Allowed" | "Denied placeholder" | "Reason required placeholder" | "Masked";
};

export type RecordVersion = {
  id: string;
  patientId: string;
  recordId: string;
  recordName: string;
  recordType: string;
  encounterId: string;
  version: string;
  state: RecordVersionState;
  author: string;
  updatedAt: string;
  reason: string;
  currentVersionId: string;
  legalHold: boolean;
};

export type DisclosureRequest = {
  id: string;
  requestNo: string;
  patientId: string;
  recipient: string;
  purpose: string;
  recordScope: string;
  consentStatus: "Available" | "Consent required" | "Withdrawn placeholder" | "Not applicable";
  approvalStatus: DisclosureStatus;
  requestedBy: string;
  requestedAt: string;
  reason: string;
};

export type LabOrderStatus =
  | "Ordered"
  | "Sample pending"
  | "Sample collected"
  | "In processing"
  | "Result pending"
  | "Result entered"
  | "Approval pending"
  | "Approved"
  | "Rejected"
  | "Report printed"
  | "Cancelled";

export type SampleStatus =
  | "Pending collection"
  | "Collected"
  | "Recollected"
  | "Rejected"
  | "In transit"
  | "Received"
  | "Processing"
  | "Stored"
  | "Disposed placeholder"
  | "Lost/damaged placeholder"
  | "Quantity not sufficient placeholder"
  | "Hemolyzed/clotted placeholder";

export type DiagnosticResultStatus =
  | "Not entered"
  | "Draft"
  | "Abnormal"
  | "Critical"
  | "Approval pending"
  | "Approved"
  | "Correction requested"
  | "Corrected placeholder"
  | "Addendum placeholder"
  | "Superseded placeholder";

export type DiagnosticPriority = "Routine" | "Urgent" | "Emergency" | "Critical" | "STAT placeholder";
export type LabDepartment = "Biochemistry" | "Hematology" | "Microbiology" | "Histopathology";

export type LabOrder = {
  id: string;
  orderNo: string;
  patientId: string;
  encounterId: string;
  source: "OPD" | "IPD" | "Emergency" | "External placeholder";
  tests: string[];
  department: LabDepartment;
  priority: DiagnosticPriority;
  status: LabOrderStatus;
  sampleStatus: SampleStatus;
  resultStatus: DiagnosticResultStatus;
  orderedBy: string;
  orderedAt: string;
  billingStatus: string;
};

export type LabTest = {
  id: string;
  name: string;
  code: string;
  department: LabDepartment;
  sampleType: string;
  method: string;
  normalRangeStatus: "Configured" | "Age/gender split" | "Missing range" | "Critical range configured";
  price: string;
  status: "Active" | "Inactive" | "Review required";
  parameters: Array<{
    name: string;
    unit: string;
    referenceRange: string;
    criticalLow: string;
    criticalHigh: string;
  }>;
};

export type LabPackage = {
  id: string;
  name: string;
  code: string;
  includedTests: string[];
  department: "Multi department" | LabDepartment;
  price: string;
  status: "Active" | "Inactive" | "Sample conflict placeholder";
  sampleRequirements: string;
};

export type SampleCollection = {
  id: string;
  orderId: string;
  barcode: string;
  sampleType: string;
  container: string;
  status: SampleStatus;
  collectedBy: string;
  collectedAt: string;
  rejectionReason: string;
  qualityIssue: string;
  custodyStatus: string;
  reprintCount: number;
  lastReprintReason: string;
};

export type AnalyzerDevice = {
  id: string;
  name: string;
  department: LabDepartment;
  connectionStatus: "Online placeholder" | "Offline" | "Sync failed placeholder" | "Maintenance";
  lastSync: string;
  pendingResults: number;
  errorCount: number;
  status: "Active" | "Disabled placeholder" | "Review";
};

export type LabResult = {
  id: string;
  orderId: string;
  testId: string;
  parameters: Array<{
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: "Normal" | "Low" | "High" | "Critical low" | "Critical high" | "Abnormal";
    previousValue: string;
    comment: string;
  }>;
  status: DiagnosticResultStatus;
  critical: boolean;
  enteredBy: string;
  approvedBy: string;
  approvedAt: string;
  version: string;
  correctionReason: string;
  addendum: string;
};

export type CriticalLabAlert = {
  id: string;
  orderId: string;
  patientId: string;
  test: string;
  parameter: string;
  value: string;
  escalation: "Unacknowledged" | "Acknowledged placeholder" | "Escalated" | "Closed placeholder";
  assignedTo: string;
  createdAt: string;
  acknowledgedAt: string;
};

export type SampleCustodyEvent = {
  id: string;
  sampleId: string;
  orderId: string;
  eventType: string;
  location: string;
  user: string;
  timestamp: string;
  notes: string;
};

export type RadiologyOrderStatus =
  | "Ordered"
  | "Scheduled"
  | "Patient arrived"
  | "In progress"
  | "Image acquired placeholder"
  | "Reporting pending"
  | "Report draft"
  | "Approval pending"
  | "Approved"
  | "Report printed"
  | "Cancelled";

export type PacsStatus = "Study pending" | "Image unavailable" | "Image available placeholder" | "PACS sync pending" | "PACS synced placeholder" | "Sync failed placeholder";
export type RadiologyModality = "Ultrasound" | "CT" | "MRI" | "X-Ray" | "Mammography" | "PET";
export type RadiologyPrepStatus = "Not required" | "Pending" | "Completed" | "Failed/prep incomplete" | "Consent pending" | "Safety checklist pending";

export type RadiologyOrder = {
  id: string;
  orderNo: string;
  patientId: string;
  encounterId: string;
  source: "OPD" | "IPD" | "Emergency" | "External placeholder";
  modality: RadiologyModality;
  study: string;
  priority: DiagnosticPriority;
  scheduleStatus: RadiologyOrderStatus;
  pacsStatus: PacsStatus;
  reportStatus: DiagnosticResultStatus | "Report draft" | "Report printed";
  safetyChecklistStatus: RadiologyPrepStatus;
  orderedBy: string;
  orderedAt: string;
};

export type RadiologySchedule = {
  id: string;
  orderId: string;
  dateTime: string;
  room: string;
  technician: string;
  preparation: RadiologyPrepStatus;
  contrastRequired: "Yes" | "No" | "Conditional placeholder";
  consentRequired: "Yes" | "No" | "Pending";
  safetyChecklist: RadiologyPrepStatus;
};

export type PacsStudy = {
  id: string;
  studyUid: string;
  orderId: string;
  patientId: string;
  modality: RadiologyModality;
  study: string;
  studyDate: string;
  imageStatus: PacsStatus;
  syncStatus: PacsStatus;
  reportStatus: DiagnosticResultStatus | "Report draft" | "Report printed";
};

export type RadiologyReport = {
  id: string;
  orderId: string;
  studyId: string;
  radiologist: string;
  status: DiagnosticResultStatus | "Report draft" | "Report printed";
  findings: string;
  impression: string;
  criticalFinding: boolean;
  approvedAt: string;
  addendum: string;
  version: string;
  correctionReason: string;
  supersededBy: string;
};

export type RadiologySafetyChecklist = {
  id: string;
  orderId: string;
  modality: RadiologyModality;
  items: Array<{ label: string; status: "Done" | "Pending" | "Blocked placeholder" }>;
  status: RadiologyPrepStatus;
  completedBy: string;
  completedAt: string;
};

export type PrescriptionDispenseStatus =
  | "Pending"
  | "Partially dispensed"
  | "Dispensed"
  | "On hold"
  | "Cancelled"
  | "Substitution requested placeholder"
  | "Returned placeholder";

export type StockStatus = "In stock" | "Low stock" | "Critical stock" | "Out of stock" | "Reserved" | "Quarantined" | "Expired" | "Near expiry";
export type PurchaseStatus = "Draft" | "Requested" | "Approved placeholder" | "Ordered" | "Partially received" | "Received" | "Cancelled" | "Rejected placeholder";
export type StockTransferStatus = "Requested" | "Approved placeholder" | "Issued" | "In transit" | "Received" | "Partially received" | "Rejected" | "Cancelled";
export type OtStatus = "Scheduled" | "Pre-op pending" | "Ready for surgery" | "In surgery" | "Recovery" | "Completed" | "Cancelled" | "Delayed";
export type InstrumentStatus = "Available" | "In use" | "Used" | "Cleaning" | "Sterilization pending" | "Sterilized" | "Missing" | "Damaged" | "Quarantined";

export type PharmacyPrescription = {
  id: string;
  prescriptionNo: string;
  patientId: string;
  source: "OPD" | "IPD" | "Emergency";
  doctor: string;
  department: string;
  status: PrescriptionDispenseStatus;
  medicineCount: number;
  allergyAlert: string;
  stockStatus: StockStatus;
  priority: "Routine" | "Urgent" | "Emergency" | "Controlled medicine placeholder";
  createdAt: string;
};

export type DispenseItem = {
  id: string;
  prescriptionId: string;
  medicine: string;
  dose: string;
  requestedQty: number;
  availableQty: number;
  batchNo: string;
  expiryDate: string;
  dispenseQty: number;
  substitutionStatus: "Not required" | "Requested placeholder" | "Approved placeholder" | "Rejected placeholder";
  alerts: string[];
};

export type StockItem = {
  id: string;
  itemCode: string;
  name: string;
  genericName: string;
  category: "Medicine" | "Consumable" | "Surgical" | "Implant" | "Asset placeholder";
  unit: string;
  stock: number;
  reorderLevel: number;
  criticalLevel: number;
  nearExpiry: number;
  expired: number;
  status: StockStatus;
};

export type StockBatch = {
  id: string;
  itemId: string;
  batchNo: string;
  vendorId: string;
  receivedAt: string;
  expiryDate: string;
  quantity: number;
  saleableQuantity: number;
  quarantinedQuantity: number;
  status: StockStatus;
};

export type PurchaseRequest = {
  id: string;
  requestNo: string;
  department: string;
  items: string[];
  requestedBy: string;
  priority: "Routine" | "Urgent" | "Critical";
  status: PurchaseStatus;
  requestedAt: string;
};

export type PurchaseOrder = {
  id: string;
  poNo: string;
  vendorId: string;
  items: string[];
  expectedDate: string;
  amount: string;
  status: PurchaseStatus;
};

export type VendorRecord = {
  id: string;
  vendorName: string;
  code: string;
  contact: string;
  category: "Pharmacy" | "Store" | "Surgical" | "Equipment";
  rating: string;
  lastPurchase: string;
  status: "Active" | "On hold" | "Blacklisted placeholder" | "Review";
};

export type StockAuditRecord = {
  id: string;
  itemId: string;
  location: string;
  systemStock: number;
  physicalStock: number;
  variance: number;
  status: "Pending count" | "Variance found" | "Approval pending" | "Approved placeholder" | "Rejected placeholder";
  reason: string;
};

export type GrnRecord = {
  id: string;
  grnNo: string;
  poId: string;
  vendorId: string;
  receivedAt: string;
  items: string[];
  qualityStatus: "Pending QC" | "Accepted" | "Damaged" | "Rejected placeholder" | "Short received" | "Extra received placeholder";
  ledgerStatus: "Pending posting" | "Posted placeholder" | "Variance hold";
};

export type StockTransfer = {
  id: string;
  transferNo: string;
  fromLocation: string;
  toLocation: string;
  items: string[];
  requestedBy: string;
  status: StockTransferStatus;
  custody: string;
  variance: string;
};

export type AssetRecord = {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  assignedTo: string;
  location: string;
  maintenanceStatus: "Active" | "Due" | "Under maintenance" | "Retired placeholder";
  status: "Assigned" | "Available" | "Service hold" | "Lost placeholder";
};

export type OtSurgery = {
  id: string;
  patientId: string;
  admissionId: string;
  procedure: string;
  surgeon: string;
  anesthetist: string;
  otRoom: string;
  scheduledAt: string;
  status: OtStatus;
  consentStatus: "Signed" | "Missing" | "Pending guardian" | "Expired placeholder";
  instrumentStatus: InstrumentStatus;
  checklistStatus: "Pending" | "Sign-in complete" | "Time-out complete" | "Sign-out pending" | "Complete";
  surgicalCountStatus: "Pending" | "Matched" | "Mismatch" | "Escalated placeholder";
};

export type SurgicalCount = {
  id: string;
  surgeryId: string;
  countType: "Sponge" | "Needle" | "Instrument";
  expectedCount: number;
  actualCount: number;
  status: "Pending" | "Matched" | "Mismatch" | "Escalated placeholder";
  verifiedBy: string;
  verifiedAt: string;
};

export type InstrumentSet = {
  id: string;
  setCode: string;
  name: string;
  sterilizationStatus: InstrumentStatus;
  sterilizationCycleId: string;
  sterilizationExpiryAt: string;
  currentLocation: string;
  assignedSurgeryId: string;
  missingItems: number;
  damagedItems: number;
  status: InstrumentStatus;
};

export type SterilizationCycle = {
  id: string;
  cycleNo: string;
  machinePlaceholder: string;
  startedAt: string;
  completedAt: string;
  indicatorResult: "Passed placeholder" | "Failed" | "Pending";
  status: InstrumentStatus;
  failedReason: string;
};

export type OtRoomCleaning = {
  id: string;
  room: string;
  status: "Clean" | "Cleaning due" | "Cleaning in progress" | "Ready" | "Failed checklist" | "Blocked";
  responsibleStaff: string;
  completedAt: string;
  infectionRisk: string;
  releaseStatus: "Ready" | "Override required" | "Blocked" | "Pending";
};

export type BillStatus = "Draft" | "Pending" | "Ready to bill" | "Finalized" | "Partially paid" | "Paid" | "Overdue" | "Cancelled" | "Revised" | "Write-off requested placeholder";
export type InvoiceStatus = "Draft" | "Issued" | "Printed" | "Partially paid" | "Paid" | "Cancelled" | "Revised" | "Credit note placeholder";
export type PaymentStatus = "Pending" | "Received" | "Split payment" | "Failed placeholder" | "Reversed placeholder" | "Refunded";
export type RefundStatus = "Requested" | "Under review" | "Approved" | "Rejected" | "Paid" | "Cancelled";
export type DiscountStatus = "Requested" | "Approved" | "Rejected" | "Expired" | "Applied";
export type AdvanceStatus = "Available" | "Partially adjusted" | "Fully adjusted" | "Refunded" | "On hold";
export type CreditStatus = "Open" | "Partially settled" | "Settled" | "Overdue" | "Disputed" | "Write-off requested placeholder";
export type PackageBillingStatus = "Assigned" | "Active" | "Utilized" | "Partially utilized" | "Over limit" | "Exclusion pending" | "Closed";
export type InsuranceTpaStatus =
  | "Eligible"
  | "Eligibility pending"
  | "Preauthorization required"
  | "Preauthorization submitted"
  | "Preauthorization approved"
  | "Preauthorization rejected"
  | "Claim draft"
  | "Claim submitted"
  | "Under review"
  | "Query raised"
  | "Rejected"
  | "Resubmitted"
  | "Settled"
  | "Short settled";
export type FinanceStatus = "Draft" | "Posted placeholder" | "Pending approval" | "Approved" | "Rejected" | "Matched" | "Unmatched" | "Reconciled placeholder";

export type BillingRecord = {
  id: string;
  billNo: string;
  patientId: string;
  visitId: string;
  admissionId: string;
  source: "OPD" | "IPD" | "Emergency" | "Lab" | "Radiology" | "Pharmacy" | "OT" | "Package" | "Manual placeholder";
  department: string;
  payerType: "Self" | "Insurance" | "TPA" | "Corporate credit" | "Package";
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: BillStatus;
  createdAt: string;
};

export type BillLine = {
  id: string;
  billId: string;
  serviceCode: string;
  serviceName: string;
  source: BillingRecord["source"];
  tariffId: string;
  department: string;
  doctor: string;
  quantity: number;
  rate: number;
  discountAmount: number;
  taxAmount: number;
  amount: number;
  status: "Billable" | "Non-payable" | "Package included" | "Approval required" | "Cancelled";
};

export type BillingTariff = {
  id: string;
  serviceCode: string;
  serviceName: string;
  department: string;
  category: string;
  baseRate: number;
  payerRate: number;
  taxRule: string;
  effectiveFrom: string;
  effectiveTo: string;
  overrideApprovalRequired: boolean;
  status: "Active" | "Inactive" | "Future effective" | "Expired";
};

export type InvoiceRecord = {
  id: string;
  invoiceNo: string;
  billId: string;
  patientId: string;
  payerId: string;
  invoiceDate: string;
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  status: InvoiceStatus;
};

export type PaymentRecord = {
  id: string;
  receiptNo: string;
  invoiceId: string;
  patientId: string;
  paymentMode: "Cash" | "Card placeholder" | "UPI placeholder" | "Bank transfer placeholder" | "Cheque placeholder" | "Advance adjustment";
  amount: number;
  status: PaymentStatus;
  collectedBy: string;
  collectedAt: string;
};

export type ReceiptRecord = {
  id: string;
  receiptNo: string;
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  printStatus: "Ready to print" | "Printed" | "Reprint requires audit" | "Cancelled placeholder";
  deliveryMode: "Counter print" | "Email placeholder" | "WhatsApp placeholder" | "Patient portal placeholder";
  status: PaymentStatus;
  issuedBy: string;
  issuedAt: string;
};

export type RefundRecord = {
  id: string;
  refundNo: string;
  paymentId: string;
  invoiceId: string;
  patientId: string;
  requestedAmount: number;
  eligibleAmount: number;
  reason: string;
  status: RefundStatus;
  approvedBy: string;
};

export type DiscountRequest = {
  id: string;
  requestNo: string;
  billId: string;
  patientId: string;
  requestedAmount: number;
  reason: string;
  approver: string;
  status: DiscountStatus;
};

export type AdvanceRecord = {
  id: string;
  advanceNo: string;
  patientId: string;
  source: "IPD deposit" | "OPD advance" | "Package deposit" | "Corporate deposit placeholder";
  amount: number;
  adjustedAmount: number;
  balanceAmount: number;
  status: AdvanceStatus;
};

export type CreditBill = {
  id: string;
  creditNo: string;
  patientId: string;
  company: string;
  invoiceId: string;
  outstandingAmount: number;
  agingDays: number;
  status: CreditStatus;
};

export type BillingPackage = {
  id: string;
  packageNo: string;
  patientId: string;
  admissionId: string;
  packageName: string;
  limitAmount: number;
  utilizedAmount: number;
  overageAmount: number;
  status: PackageBillingStatus;
};

export type FinanceLedgerEntry = {
  id: string;
  ledgerNo: string;
  ledgerType: "Patient" | "Payer" | "Vendor" | "Company" | "Cash counter";
  party: string;
  debit: number;
  credit: number;
  balance: number;
  status: FinanceStatus;
  postedAt: string;
};

export type ExpenseRecord = {
  id: string;
  expenseNo: string;
  category: string;
  vendorId: string;
  amount: number;
  approvalStatus: FinanceStatus;
  paymentStatus: PaymentStatus;
  requestedAt: string;
};

export type CashCounterRecord = {
  id: string;
  counterNo: string;
  cashier: string;
  openedAt: string;
  closedAt: string;
  openingBalance: number;
  cashCollected: number;
  refundPaid: number;
  handoverAmount: number;
  variance: number;
  status: "Open" | "Closed" | "Variance" | "Handover pending";
};

export type BankEntry = {
  id: string;
  bankRef: string;
  paymentId: string;
  amount: number;
  bankDate: string;
  matchStatus: FinanceStatus;
  notes: string;
};

export type InsuranceCompany = {
  id: string;
  name: string;
  code: string;
  contractStatus: "Active" | "Expiring" | "Inactive" | "Blocked placeholder";
  tariff: string;
  contact: string;
};

export type TpaRecord = {
  id: string;
  name: string;
  code: string;
  linkedInsurers: string[];
  contractStatus: "Active" | "Expiring" | "Inactive" | "Blocked placeholder";
  contact: string;
};

export type PatientPolicy = {
  id: string;
  patientId: string;
  insuranceCompanyId: string;
  tpaId: string;
  policyNo: string;
  policyHolder: string;
  validFrom: string;
  validTo: string;
  coverageLimit: number;
  coPayPercent: number;
  documentStatus: "Verified" | "Pending" | "Rejected" | "Expired";
  status: InsuranceTpaStatus;
};

export type PreauthorizationRecord = {
  id: string;
  preauthNo: string;
  patientId: string;
  admissionId: string;
  policyId: string;
  requestedAmount: number;
  approvedAmount: number;
  queryStatus: "No query" | "Query raised" | "Responded placeholder";
  documentStatus: "Complete" | "Missing" | "Pending review" | "Rejected";
  status: InsuranceTpaStatus;
};

export type ClaimRecord = {
  id: string;
  claimNo: string;
  patientId: string;
  invoiceId: string;
  preauthId: string;
  payerId: string;
  claimAmount: number;
  submittedAmount: number;
  approvedAmount: number;
  status: InsuranceTpaStatus;
  agingDays: number;
};

export type ClaimSettlement = {
  id: string;
  settlementNo: string;
  claimId: string;
  approvedAmount: number;
  receivedAmount: number;
  deductionAmount: number;
  shortfallAmount: number;
  reason: string;
  status: InsuranceTpaStatus;
};

export type ClaimRejection = {
  id: string;
  claimId: string;
  rejectionReason: string;
  correctionChecklist: string[];
  resubmissionStatus: InsuranceTpaStatus;
  closedAt: string;
};
