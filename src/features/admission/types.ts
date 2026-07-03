export type AdmissionScreenId =
  | "admin"
  | "reception"
  | "doctor"
  | "admission-desk"
  | "billing"
  | "bed-manager"
  | "nurse-receive"
  | "nurse-care";

export type AdmissionPriority = "Routine" | "Urgent" | "Critical" | "Emergency";

export type AdmissionRequestStatus =
  | "Pending Bed Allotment"
  | "Accepted"
  | "Billing Hold"
  | "Ready for Nursing"
  | "Received"
  | "Care Started";

export type AdmissionScenario = "Old Patient / Re-admission" | "New Patient Admission" | "Emergency Unknown Patient";

export type BillingClearanceStatus = "Pending" | "Cleared" | "Hold";

export type AdmissionBedStatus =
  | "Available"
  | "Occupied"
  | "Reserved"
  | "Cleaning"
  | "Maintenance"
  | "Isolation"
  | "Blocked";

export type AdmissionPatient = {
  id: string;
  name: string;
  uhid: string;
  ageSex: string;
  phone: string;
  status: "Admission request exists" | "Already admitted / Transfer" | "Clear for admission";
};

export type AdmissionRequest = {
  id: string;
  patient: string;
  uhid: string;
  patientId?: string;
  source: string;
  doctor: string;
  type: string;
  ward: string;
  priority: AdmissionPriority;
  status: AdmissionRequestStatus;
  instructions?: string;
  bedNo?: string;
  createdAt?: string;
  admissionTime?: string;
};

export type BillingClearance = {
  id: string;
  patient: string;
  uhid: string;
  requestId?: string;
  holdType: string;
  risk: "Low" | "Medium" | "High";
  estimate: number;
  note: string;
  status?: BillingClearanceStatus;
};

export type AdmissionBed = {
  id: string;
  bedNo: string;
  ward: string;
  floor: string;
  roomType: string;
  nurseStation: string;
  status: AdmissionBedStatus;
  lastUpdated: string;
  tags: string[];
};

export type AdmissionScreenConfig = {
  id: AdmissionScreenId;
  label: string;
  route: string;
  role: string;
  roleSummary: string;
  workspaceTitle: string;
  workspaceDescription: string;
  chips: string[];
  steps: string[];
};

export type NurseReceiveRecord = {
  requestId: string;
  receivedBy: string;
  receivedTime: string;
  checklist: string[];
};

export type NurseCareRecord = {
  requestId: string;
  bloodPressure: string;
  pulse: string;
  temperature: string;
  notes: string;
  startedAt: string;
};

export type AdmissionActivity = {
  id: string;
  title: string;
  detail: string;
  at: string;
};

export type AdmissionStoreState = {
  patients: AdmissionPatient[];
  requests: AdmissionRequest[];
  clearances: BillingClearance[];
  beds: AdmissionBed[];
  selectedPatientId: string | null;
  activeRequestId: string | null;
  selectedScenario: AdmissionScenario | null;
  receiveRecords: NurseReceiveRecord[];
  careRecords: NurseCareRecord[];
  activities: AdmissionActivity[];
};
