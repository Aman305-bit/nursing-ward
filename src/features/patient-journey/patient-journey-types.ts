import type { Role, StatusTone } from "@/types";

export type PatientJourneyVisitType = "OPD" | "IPD" | "Emergency" | "Follow-up";
export type PatientJourneyStage =
  | "Registered"
  | "Waiting Doctor"
  | "In Consultation"
  | "Lab Pending"
  | "Radiology Pending"
  | "Report Ready"
  | "Billing Pending"
  | "Pharmacy Pending"
  | "Admission Suggested"
  | "Discharge Pending"
  | "Completed";

export type PatientJourneyPriority = "Normal" | "Urgent" | "Critical" | "VIP" | "Senior Citizen" | "Pediatric" | "Pregnancy" | "Disabled";
export type JourneyStatus = "Normal" | "Approaching delay" | "Delayed" | "Critical";
export type TrackerKey = "emergency" | "ipd" | "icu" | "ot" | "lab" | "radiology" | "pharmacy" | "billing" | "insurance" | "discharge" | "followup";
export type RadiologyModality = "X-Ray" | "CT" | "MRI" | "USG" | "PET" | "Mammography";
export type RadiologyPriority = "Routine" | "Urgent" | "STAT" | "Critical";
export type RadiologySource = "OPD" | "IPD" | "Emergency";
export type RadiologyOrderStatus = "Ordered" | "Payment Pending" | "Scheduled" | "Arrived" | "In Scan" | "Reporting" | "Approval Pending" | "Ready";

export type PatientJourneyRecord = {
  id: string;
  visitId: string;
  token: string;
  patientName: string;
  uhid: string;
  ageGender: string;
  phone: string;
  visitType: PatientJourneyVisitType;
  department: string;
  doctor: string;
  stage: PatientJourneyStage;
  location: string;
  waitingMinutes: number;
  totalMinutes: number;
  priority: PatientJourneyPriority;
  status: JourneyStatus;
  billingStatus: string;
  labStatus: string;
  radiologyStatus: string;
  pharmacyStatus: string;
  insuranceStatus: string;
  dischargeStatus: string;
  chiefComplaint: string;
  vitals: string;
  allergy: string;
  nextAction: string;
  blocker?: string;
  ownerRole: Role;
};

export type JourneyEvent = {
  id: string;
  visitId: string;
  time: string;
  event: string;
  department: string;
  user: string;
  status: "Completed" | "Active" | "Pending" | "Blocked";
  duration: string;
};

export type SmartAlert = {
  id: string;
  type: "Delay Alert" | "Critical Alert" | "Billing Alert" | "Clinical Alert" | "Inventory Alert" | "Insurance Alert" | "Discharge Alert" | "Queue Alert";
  title: string;
  patientId?: string;
  department: string;
  age: string;
  severity: StatusTone;
  action: string;
};

export type BottleneckMetric = {
  id: string;
  department: string;
  delayed: number;
  averageWait: string;
  blocker: string;
  trend: string;
  tone: StatusTone;
};

export type TrackerBoard = {
  key: TrackerKey;
  route: string;
  title: string;
  eyebrow: string;
  description: string;
  columns: string[];
  ownerRoles: Role[];
};

export type RadiologyJourneyOrder = {
  id: string;
  orderNo: string;
  patientName: string;
  uhid: string;
  ageGender: string;
  token: string;
  source: RadiologySource;
  department: string;
  doctor: string;
  modality: RadiologyModality;
  study: string;
  priority: RadiologyPriority;
  status: RadiologyOrderStatus;
  scheduledAt: string;
  waitingMinutes: number;
  tatMinutes: number;
  room: string;
  assignedRadiologist: string;
  billingStatus: "Paid" | "Pending" | "Emergency hold" | "Package" | "Insurance";
  safetyStatus: "Not required" | "Pending" | "Completed" | "Blocked";
  reportStatus: "Not started" | "Draft" | "Approval pending" | "Approved" | "Critical finding";
  blocker?: string;
  nextAction: string;
};

export type SplitWorkflowKey = "emergency" | "ipd" | "icu" | "ot" | "lab" | "radiology" | "pharmacy" | "billing" | "insurance" | "discharge" | "followup";
export type SplitWorkflowPriority = "Routine" | "Urgent" | "STAT" | "Critical";

export type ServiceTokenStatus = "Waiting" | "Called" | "Arrived" | "In Service" | "On Hold" | "Skipped" | "Completed";

export type ServiceToken = {
  id: string;
  tokenNo: string;
  patientName: string;
  uhid: string;
  ageGender: string;
  source: "OPD" | "IPD" | "Emergency" | "Follow-up";
  department: string;
  location: string;
  priority: SplitWorkflowPriority;
  status: ServiceTokenStatus;
  waitingMinutes: number;
  linkedOrderIds: string[];
  nextAction: string;
  blocker?: string;
};

export type ServiceWorkOrder = {
  id: string;
  orderNo: string;
  tokenId?: string;
  patientName: string;
  uhid: string;
  source: "OPD" | "IPD" | "Emergency" | "Follow-up";
  department: string;
  category: string;
  item: string;
  priority: SplitWorkflowPriority;
  status: string;
  owner: string;
  waitingMinutes: number;
  tatMinutes: number;
  billingStatus: string;
  safetyStatus?: string;
  blocker?: string;
  nextAction: string;
};

export type SplitWorkflowConfig = {
  key: SplitWorkflowKey;
  eyebrow: string;
  title: string;
  description: string;
  tokenTitle: string;
  orderTitle: string;
  boardColumns: string[];
  categories: string[];
  showTokens: boolean;
};
