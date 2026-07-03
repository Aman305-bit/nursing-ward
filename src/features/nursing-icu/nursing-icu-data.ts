import type { StatusTone } from "@/types";

export type IcuAdmissionSource = "Emergency" | "General ward" | "Post-surgical unit" | "Direct ICU admission";
export type IcuPatientStatus = "Critical" | "Ventilated" | "Stable ICU care" | "Ready for transfer" | "Discharge ordered" | "Death workflow";
export type IcuTaskStatus = "Assigned" | "Accepted" | "Pending" | "In progress" | "Completed" | "Escalated" | "Overdue";
export type IcuPriority = "Critical" | "High" | "Medium" | "Routine";

export type IcuPatient = {
  id: string;
  bedNo: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  diagnosis: string;
  admittingDoctor: string;
  consultingDoctor: string;
  dutyDoctor: string;
  assignedUnitNurse: string;
  assignedWardNurse: string;
  admissionSource: IcuAdmissionSource;
  currentStatus: IcuPatientStatus;
  criticalityScore: number;
  ventilatorStatus: string;
  lastVitalsTime: string;
  pendingTasks: number;
  alerts: string[];
  unit: string;
  admissionTime: string;
};

export type IcuTask = {
  id: string;
  patientId: string;
  bedNo: string;
  patientName: string;
  taskType: string;
  title: string;
  priority: IcuPriority;
  dueTime: string;
  status: IcuTaskStatus;
  createdBy: string;
  assignedTo: string;
  remarks: string;
  source?: string;
  assignedBy?: string;
  assignedByRole?: string;
  assignedToRole?: string;
  assignmentReason?: string;
  originalOwner?: string;
  escalationOwner?: string;
  requiresAcknowledgement?: boolean;
  acknowledgementStatus?: "Pending" | "Accepted" | "Not required";
  assignedAt?: string;
  reassignedBy?: string;
  reassignmentReason?: string;
};

export type IcuVital = {
  id: string;
  patientId: string;
  bedNo: string;
  time: string;
  temperature: string;
  pulse: number;
  bp: string;
  respiratoryRate: number;
  spo2: number;
  oxygenFlow: string;
  gcs: number;
  urineOutput: number;
  painScore: number;
  nurse: string;
  abnormal: boolean;
  note: string;
};

export type IcuIntakeOutput = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  shift: "Day" | "Night";
  kind: "Intake" | "Output";
  category: string;
  component: string;
  quantityMl: number;
  route: string;
  source: "Manual entry" | "Medication administration" | "Blood administration" | "Urine assessment" | "Stool assessment" | "Emesis assessment" | "Drain assessment" | "Infusion pump";
  status: "Auto synced" | "Signed" | "Pending review" | "Corrected";
  intakeType: string;
  intakeMl: number;
  outputType: string;
  outputMl: number;
  balanceMl: number;
  nurse: string;
  capturedAt: string;
  verifiedBy?: string;
  note: string;
};

export type IcuMedication = {
  id: string;
  patientId: string;
  bedNo: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  scheduledTime: string;
  actualTime: string;
  status: "Due" | "Administered" | "Held" | "Skipped" | "Late";
  administeredBy: string;
  doubleVerification: string;
  reason: string;
};

export type IcuInfusion = {
  id: string;
  patientId: string;
  bedNo: string;
  fluidName: string;
  startTime: string;
  rate: string;
  totalVolumeMl: number;
  infusedVolumeMl: number;
  remainingVolumeMl: number;
  pumpNo: string;
  status: "Running" | "Paused" | "Completed" | "Stopped";
  nurse: string;
  alert: string;
};

export type IcuBloodTransfusion = {
  id: string;
  patientId: string;
  bedNo: string;
  bloodGroup: string;
  componentType: string;
  unitNumber: string;
  crossmatchStatus: string;
  startTime: string;
  status: "Requested" | "Issued" | "Running" | "Completed" | "Reaction";
  reactionObserved: string;
  nurse: string;
  doctor: string;
};

export type DoctorInstruction = {
  id: string;
  patientId: string;
  bedNo: string;
  doctor: string;
  instructionType: string;
  instruction: string;
  priority: IcuPriority;
  dueTime: string;
  status: "Pending" | "In progress" | "Completed" | "Escalated";
  assignedNurse: string;
  remarks: string;
};

export type IcuAlert = {
  id: string;
  patientId: string;
  bedNo: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Info";
  message: string;
  source: string;
  status: "Open" | "Acknowledged" | "Resolved";
  createdAt: string;
  owner: string;
};

export const icuPatients: IcuPatient[] = [
  {
    id: "icu-001",
    bedNo: "ICU-A01",
    patientName: "Aisha Khan",
    mrn: "PLH-240221",
    ageGender: "12/F",
    diagnosis: "Septic shock with respiratory distress",
    admittingDoctor: "Dr. Sameer Mehta",
    consultingDoctor: "Dr. Kavita Rao",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Emergency",
    currentStatus: "Critical",
    criticalityScore: 9,
    ventilatorStatus: "NIV support",
    lastVitalsTime: "10 min ago",
    pendingTasks: 7,
    alerts: ["SpO2 low", "Medication overdue", "Critical lab pending"],
    unit: "Pediatric ICU",
    admissionTime: "Today 08:10",
  },
  {
    id: "icu-002",
    bedNo: "ICU-A02",
    patientName: "Rohan Das",
    mrn: "PLH-240338",
    ageGender: "54/M",
    diagnosis: "Post CABG monitoring",
    admittingDoctor: "Dr. Neha Malik",
    consultingDoctor: "Dr. Ritu Anand",
    dutyDoctor: "Dr. Mohan Singh",
    assignedUnitNurse: "Unit Nurse Meera",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Post-surgical unit",
    currentStatus: "Ventilated",
    criticalityScore: 8,
    ventilatorStatus: "Invasive ventilation",
    lastVitalsTime: "5 min ago",
    pendingTasks: 5,
    alerts: ["Ventilator check due", "ABG result due"],
    unit: "Cardiothoracic ICU",
    admissionTime: "Today 06:45",
  },
  {
    id: "icu-003",
    bedNo: "ICU-B03",
    patientName: "Meera Sharma",
    mrn: "PLH-240447",
    ageGender: "68/F",
    diagnosis: "Stroke observation with low GCS",
    admittingDoctor: "Dr. Imran Shah",
    consultingDoctor: "Dr. Ritu Anand",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "General ward",
    currentStatus: "Stable ICU care",
    criticalityScore: 6,
    ventilatorStatus: "Oxygen mask",
    lastVitalsTime: "25 min ago",
    pendingTasks: 3,
    alerts: ["Neuro observation due"],
    unit: "Neuro ICU",
    admissionTime: "Yesterday 22:30",
  },
  {
    id: "icu-004",
    bedNo: "ICU-B04",
    patientName: "Kabir Ali",
    mrn: "PLH-240552",
    ageGender: "39/M",
    diagnosis: "DKA with electrolyte imbalance",
    admittingDoctor: "Dr. Sameer Mehta",
    consultingDoctor: "Dr. Mohan Singh",
    dutyDoctor: "Dr. Neha Malik",
    assignedUnitNurse: "Unit Nurse Meera",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Direct ICU admission",
    currentStatus: "Ready for transfer",
    criticalityScore: 3,
    ventilatorStatus: "Room air",
    lastVitalsTime: "40 min ago",
    pendingTasks: 2,
    alerts: ["Transfer clearance pending"],
    unit: "General ICU",
    admissionTime: "Yesterday 14:00",
  },
  {
    id: "icu-005",
    bedNo: "ICU-T05",
    patientName: "Ananya Roy",
    mrn: "PLH-240681",
    ageGender: "45/F",
    diagnosis: "Post renal transplant immunosuppression monitoring",
    admittingDoctor: "Dr. Kavita Rao",
    consultingDoctor: "Dr. Sameer Mehta",
    dutyDoctor: "Dr. Mohan Singh",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Post-surgical unit",
    currentStatus: "Stable ICU care",
    criticalityScore: 5,
    ventilatorStatus: "Room air",
    lastVitalsTime: "15 min ago",
    pendingTasks: 4,
    alerts: ["Tacrolimus level pending", "Strict intake output"],
    unit: "Transplant ICU",
    admissionTime: "Today 05:50",
  },
  {
    id: "icu-006",
    bedNo: "ICU-R06",
    patientName: "Irfan Qureshi",
    mrn: "PLH-240702",
    ageGender: "61/M",
    diagnosis: "COPD exacerbation with acute respiratory failure",
    admittingDoctor: "Dr. Sameer Mehta",
    consultingDoctor: "Dr. Ritu Anand",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Meera",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Emergency",
    currentStatus: "Ventilated",
    criticalityScore: 8,
    ventilatorStatus: "NIV support",
    lastVitalsTime: "8 min ago",
    pendingTasks: 6,
    alerts: ["ABG repeat due", "High CO2 watch"],
    unit: "Respiratory ICU",
    admissionTime: "Today 07:25",
  },
  {
    id: "icu-007",
    bedNo: "ICU-G07",
    patientName: "Sana Ali",
    mrn: "PLH-240801",
    ageGender: "36/F",
    diagnosis: "Pneumonia with sepsis observation",
    admittingDoctor: "Dr. Sameer Mehta",
    consultingDoctor: "Dr. Ritu Anand",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Emergency",
    currentStatus: "Stable ICU care",
    criticalityScore: 6,
    ventilatorStatus: "Oxygen mask",
    lastVitalsTime: "12 min ago",
    pendingTasks: 3,
    alerts: ["Repeat vitals due"],
    unit: "General ICU",
    admissionTime: "Today 09:20",
  },
  {
    id: "icu-008",
    bedNo: "ICU-M08",
    patientName: "Dev Mehta",
    mrn: "PLH-240815",
    ageGender: "42/M",
    diagnosis: "Acute pancreatitis with fluid watch",
    admittingDoctor: "Dr. Kavita Rao",
    consultingDoctor: "Dr. Sameer Mehta",
    dutyDoctor: "Dr. Neha Malik",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "General ward",
    currentStatus: "Stable ICU care",
    criticalityScore: 5,
    ventilatorStatus: "Room air",
    lastVitalsTime: "18 min ago",
    pendingTasks: 2,
    alerts: ["Strict intake output"],
    unit: "Medical ICU",
    admissionTime: "Yesterday 18:30",
  },
  {
    id: "icu-009",
    bedNo: "ICU-N09",
    patientName: "Lata Kumari",
    mrn: "PLH-240827",
    ageGender: "59/F",
    diagnosis: "DKA recovery with electrolyte correction",
    admittingDoctor: "Dr. Mohan Singh",
    consultingDoctor: "Dr. Neha Malik",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Emergency",
    currentStatus: "Stable ICU care",
    criticalityScore: 4,
    ventilatorStatus: "Room air",
    lastVitalsTime: "25 min ago",
    pendingTasks: 2,
    alerts: ["Potassium review due"],
    unit: "Medical ICU",
    admissionTime: "Today 03:40",
  },
  {
    id: "icu-010",
    bedNo: "ICU-S10",
    patientName: "Omar Farooq",
    mrn: "PLH-240833",
    ageGender: "66/M",
    diagnosis: "Post laparotomy monitoring",
    admittingDoctor: "Dr. Neha Malik",
    consultingDoctor: "Dr. Imran Shah",
    dutyDoctor: "Dr. Mohan Singh",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Post-surgical unit",
    currentStatus: "Stable ICU care",
    criticalityScore: 5,
    ventilatorStatus: "Nasal cannula",
    lastVitalsTime: "20 min ago",
    pendingTasks: 4,
    alerts: ["Drain output review"],
    unit: "Surgical ICU",
    admissionTime: "Yesterday 21:10",
  },
  {
    id: "icu-011",
    bedNo: "ICU-C11",
    patientName: "Priya Nair",
    mrn: "PLH-240846",
    ageGender: "31/F",
    diagnosis: "Post seizure observation",
    admittingDoctor: "Dr. Imran Shah",
    consultingDoctor: "Dr. Ritu Anand",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Emergency",
    currentStatus: "Stable ICU care",
    criticalityScore: 4,
    ventilatorStatus: "Room air",
    lastVitalsTime: "16 min ago",
    pendingTasks: 2,
    alerts: ["Neuro check due"],
    unit: "Neuro ICU",
    admissionTime: "Today 10:05",
  },
  {
    id: "icu-012",
    bedNo: "ICU-D12",
    patientName: "Harsh Verma",
    mrn: "PLH-240852",
    ageGender: "48/M",
    diagnosis: "GI bleed observation after transfusion",
    admittingDoctor: "Dr. Sameer Mehta",
    consultingDoctor: "Dr. Kavita Rao",
    dutyDoctor: "Dr. Neha Malik",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Emergency",
    currentStatus: "Stable ICU care",
    criticalityScore: 6,
    ventilatorStatus: "Room air",
    lastVitalsTime: "9 min ago",
    pendingTasks: 3,
    alerts: ["Hb repeat due"],
    unit: "General ICU",
    admissionTime: "Today 11:15",
  },
];

export const icuTasks: IcuTask[] = [
  { id: "task-001", patientId: "icu-001", bedNo: "ICU-A01", patientName: "Aisha Khan", taskType: "Medication administration", title: "Meropenem IV due", priority: "Critical", dueTime: "Now", status: "Overdue", createdBy: "System MAR", assignedTo: "Ward Nurse Kavita", remarks: "High-risk antibiotic timing" },
  { id: "task-002", patientId: "icu-001", bedNo: "ICU-A01", patientName: "Aisha Khan", taskType: "Vitals monitoring", title: "Repeat vitals after oxygen adjustment", priority: "High", dueTime: "10 min", status: "Pending", createdBy: "Duty Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Escalate if SpO2 < 92" },
  { id: "task-003", patientId: "icu-002", bedNo: "ICU-A02", patientName: "Rohan Das", taskType: "Blood transfusion monitoring", title: "Record 15-min transfusion vitals", priority: "High", dueTime: "15 min", status: "In progress", createdBy: "Blood Unit", assignedTo: "Ward Nurse Kavita", remarks: "Watch reaction" },
  { id: "task-004", patientId: "icu-003", bedNo: "ICU-B03", patientName: "Meera Sharma", taskType: "Doctor instruction follow-up", title: "Neuro checks every hour", priority: "Medium", dueTime: "30 min", status: "Pending", createdBy: "Consulting Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Document GCS" },
  { id: "task-005", patientId: "icu-004", bedNo: "ICU-B04", patientName: "Kabir Ali", taskType: "Transfer clearance", title: "Nurse transfer checklist", priority: "Routine", dueTime: "Today", status: "Pending", createdBy: "Admitting Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Ward bed requested" },
  { id: "task-006", patientId: "icu-005", bedNo: "ICU-T05", patientName: "Ananya Roy", taskType: "Transplant monitoring", title: "Check tacrolimus level and urine trend", priority: "High", dueTime: "30 min", status: "Pending", createdBy: "Transplant ICU protocol", assignedTo: "Ward Nurse Kavita", remarks: "Immunosuppression and renal output watch" },
  { id: "task-007", patientId: "icu-006", bedNo: "ICU-R06", patientName: "Irfan Qureshi", taskType: "Respiratory monitoring", title: "Repeat ABG after NIV adjustment", priority: "Critical", dueTime: "Now", status: "Assigned", createdBy: "Duty Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Escalate if CO2 remains high or SpO2 below target" },
  { id: "task-008", patientId: "icu-007", bedNo: "ICU-G07", patientName: "Sana Ali", taskType: "Vitals monitoring", title: "Repeat sepsis vitals", priority: "High", dueTime: "20 min", status: "Pending", createdBy: "Duty Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Record BP, SpO2, urine output" },
  { id: "task-009", patientId: "icu-008", bedNo: "ICU-M08", patientName: "Dev Mehta", taskType: "Intake output", title: "Update fluid balance", priority: "Medium", dueTime: "30 min", status: "Assigned", createdBy: "Unit Nurse Priya", assignedTo: "Ward Nurse Kavita", remarks: "Pancreatitis fluid watch" },
  { id: "task-010", patientId: "icu-009", bedNo: "ICU-N09", patientName: "Lata Kumari", taskType: "Result follow-up", title: "Check electrolyte repeat", priority: "High", dueTime: "45 min", status: "Pending", createdBy: "Duty Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Potassium replacement plan" },
  { id: "task-011", patientId: "icu-010", bedNo: "ICU-S10", patientName: "Omar Farooq", taskType: "Drain monitoring", title: "Record abdominal drain output", priority: "Medium", dueTime: "1 hr", status: "Pending", createdBy: "Surgical ICU protocol", assignedTo: "Ward Nurse Kavita", remarks: "Escalate if output rises" },
  { id: "task-012", patientId: "icu-011", bedNo: "ICU-C11", patientName: "Priya Nair", taskType: "Neurology observation", title: "Document GCS and seizure watch", priority: "Medium", dueTime: "30 min", status: "Assigned", createdBy: "Consulting Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Notify if GCS drops" },
  { id: "task-013", patientId: "icu-012", bedNo: "ICU-D12", patientName: "Harsh Verma", taskType: "Transfusion follow-up", title: "Send repeat Hb sample", priority: "High", dueTime: "Now", status: "Pending", createdBy: "Duty Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Post transfusion check" },
];

export const icuVitals: IcuVital[] = [
  { id: "vit-a01-0000", patientId: "icu-001", bedNo: "ICU-A01", time: "00:00", temperature: "38.9", pulse: 138, bp: "82/50", respiratoryRate: 34, spo2: 88, oxygenFlow: "10 L/min NRBM", gcs: 11, urineOutput: 18, painScore: 7, nurse: "Night Nurse Leena", abnormal: true, note: "Overnight sepsis watch with high oxygen need" },
  { id: "vit-a01-0200", patientId: "icu-001", bedNo: "ICU-A01", time: "02:00", temperature: "38.8", pulse: 136, bp: "84/52", respiratoryRate: 33, spo2: 89, oxygenFlow: "10 L/min NRBM", gcs: 11, urineOutput: 20, painScore: 7, nurse: "Night Nurse Leena", abnormal: true, note: "Fluid bolus response under review" },
  { id: "vit-a01-0400", patientId: "icu-001", bedNo: "ICU-A01", time: "04:00", temperature: "38.7", pulse: 134, bp: "86/54", respiratoryRate: 32, spo2: 90, oxygenFlow: "10 L/min NRBM", gcs: 12, urineOutput: 21, painScore: 6, nurse: "Night Nurse Leena", abnormal: true, note: "BP slowly improving after fluids" },
  { id: "vit-a01-0600", patientId: "icu-001", bedNo: "ICU-A01", time: "06:00", temperature: "38.6", pulse: 132, bp: "88/56", respiratoryRate: 32, spo2: 91, oxygenFlow: "10 L/min NRBM", gcs: 12, urineOutput: 22, painScore: 6, nurse: "Ward Nurse Kavita", abnormal: true, note: "Morning handover sepsis criteria active" },
  { id: "vit-001", patientId: "icu-001", bedNo: "ICU-A01", time: "08:00", temperature: "38.6", pulse: 132, bp: "86/54", respiratoryRate: 32, spo2: 90, oxygenFlow: "10 L/min NRBM", gcs: 12, urineOutput: 20, painScore: 6, nurse: "Ward Nurse Kavita", abnormal: true, note: "Sepsis alert criteria met" },
  { id: "vit-002", patientId: "icu-001", bedNo: "ICU-A01", time: "09:00", temperature: "38.4", pulse: 126, bp: "92/58", respiratoryRate: 30, spo2: 93, oxygenFlow: "NIV", gcs: 13, urineOutput: 25, painScore: 5, nurse: "Ward Nurse Kavita", abnormal: true, note: "Improving after fluids" },
  { id: "vit-a01-1000", patientId: "icu-001", bedNo: "ICU-A01", time: "10:00", temperature: "38.2", pulse: 122, bp: "96/60", respiratoryRate: 29, spo2: 94, oxygenFlow: "NIV", gcs: 13, urineOutput: 30, painScore: 5, nurse: "Ward Nurse Kavita", abnormal: true, note: "Oxygenation improving on NIV" },
  { id: "vit-a01-1200", patientId: "icu-001", bedNo: "ICU-A01", time: "12:00", temperature: "37.9", pulse: 116, bp: "102/64", respiratoryRate: 27, spo2: 95, oxygenFlow: "8 L/min simple mask", gcs: 13, urineOutput: 35, painScore: 4, nurse: "Ward Nurse Kavita", abnormal: true, note: "Stepped down from NIV after review" },
  { id: "vit-a01-1400", patientId: "icu-001", bedNo: "ICU-A01", time: "14:00", temperature: "37.6", pulse: 110, bp: "108/66", respiratoryRate: 25, spo2: 96, oxygenFlow: "6 L/min simple mask", gcs: 14, urineOutput: 42, painScore: 4, nurse: "Ward Nurse Kavita", abnormal: false, note: "Perfusion and urine output improving" },
  { id: "vit-a01-1600", patientId: "icu-001", bedNo: "ICU-A01", time: "16:00", temperature: "37.4", pulse: 104, bp: "112/70", respiratoryRate: 23, spo2: 97, oxygenFlow: "4 L/min nasal cannula", gcs: 14, urineOutput: 48, painScore: 3, nurse: "Ward Nurse Kavita", abnormal: false, note: "Stable trend after afternoon review" },
  { id: "vit-a01-1800", patientId: "icu-001", bedNo: "ICU-A01", time: "18:00", temperature: "37.2", pulse: 100, bp: "116/72", respiratoryRate: 22, spo2: 97, oxygenFlow: "3 L/min nasal cannula", gcs: 14, urineOutput: 52, painScore: 3, nurse: "Night Nurse Leena", abnormal: false, note: "Evening handover stable on low-flow oxygen" },
  { id: "vit-a01-2000", patientId: "icu-001", bedNo: "ICU-A01", time: "20:00", temperature: "37.1", pulse: 96, bp: "118/74", respiratoryRate: 21, spo2: 98, oxygenFlow: "2 L/min nasal cannula", gcs: 15, urineOutput: 55, painScore: 2, nurse: "Night Nurse Leena", abnormal: false, note: "Night observation improving" },
  { id: "vit-a01-2200", patientId: "icu-001", bedNo: "ICU-A01", time: "22:00", temperature: "37.0", pulse: 92, bp: "120/76", respiratoryRate: 20, spo2: 98, oxygenFlow: "2 L/min nasal cannula", gcs: 15, urineOutput: 58, painScore: 2, nurse: "Night Nurse Leena", abnormal: false, note: "Stable overnight plan continued" },
  { id: "vit-a01-2300", patientId: "icu-001", bedNo: "ICU-A01", time: "23:00", temperature: "36.9", pulse: 90, bp: "122/78", respiratoryRate: 20, spo2: 98, oxygenFlow: "2 L/min nasal cannula", gcs: 15, urineOutput: 60, painScore: 1, nurse: "Night Nurse Leena", abnormal: false, note: "Late night vitals stable" },
  { id: "vit-003", patientId: "icu-002", bedNo: "ICU-A02", time: "09:00", temperature: "36.8", pulse: 98, bp: "118/72", respiratoryRate: 18, spo2: 98, oxygenFlow: "Ventilator FiO2 40%", gcs: 10, urineOutput: 60, painScore: 2, nurse: "Ward Nurse Kavita", abnormal: false, note: "Post-op stable" },
  { id: "vit-004", patientId: "icu-003", bedNo: "ICU-B03", time: "09:30", temperature: "37.1", pulse: 88, bp: "140/86", respiratoryRate: 20, spo2: 96, oxygenFlow: "Simple mask", gcs: 11, urineOutput: 45, painScore: 3, nurse: "Ward Nurse Kavita", abnormal: true, note: "Neuro watch" },
  { id: "vit-005", patientId: "icu-005", bedNo: "ICU-T05", time: "10:15", temperature: "37.3", pulse: 92, bp: "124/78", respiratoryRate: 18, spo2: 98, oxygenFlow: "Room air", gcs: 15, urineOutput: 85, painScore: 3, nurse: "Ward Nurse Kavita", abnormal: false, note: "Post transplant renal output adequate; tacrolimus report awaited" },
  { id: "vit-006", patientId: "icu-006", bedNo: "ICU-R06", time: "10:20", temperature: "37.8", pulse: 118, bp: "138/84", respiratoryRate: 30, spo2: 91, oxygenFlow: "NIV FiO2 45%", gcs: 14, urineOutput: 38, painScore: 4, nurse: "Ward Nurse Kavita", abnormal: true, note: "Respiratory distress; ABG repeat due after NIV adjustment" },
  { id: "vit-007", patientId: "icu-007", bedNo: "ICU-G07", time: "10:30", temperature: "38.1", pulse: 112, bp: "104/66", respiratoryRate: 26, spo2: 94, oxygenFlow: "5 L/min oxygen mask", gcs: 15, urineOutput: 40, painScore: 3, nurse: "Ward Nurse Kavita", abnormal: true, note: "Sepsis observation with oxygen support" },
  { id: "vit-008", patientId: "icu-008", bedNo: "ICU-M08", time: "10:35", temperature: "37.4", pulse: 104, bp: "110/70", respiratoryRate: 22, spo2: 97, oxygenFlow: "Room air", gcs: 15, urineOutput: 55, painScore: 5, nurse: "Ward Nurse Kavita", abnormal: false, note: "Fluid balance under observation" },
  { id: "vit-009", patientId: "icu-009", bedNo: "ICU-N09", time: "10:40", temperature: "36.9", pulse: 96, bp: "118/76", respiratoryRate: 20, spo2: 98, oxygenFlow: "Room air", gcs: 15, urineOutput: 70, painScore: 2, nurse: "Ward Nurse Kavita", abnormal: false, note: "DKA recovery trend stable" },
  { id: "vit-010", patientId: "icu-010", bedNo: "ICU-S10", time: "10:45", temperature: "37.2", pulse: 102, bp: "116/72", respiratoryRate: 21, spo2: 96, oxygenFlow: "2 L/min nasal cannula", gcs: 14, urineOutput: 45, painScore: 4, nurse: "Ward Nurse Kavita", abnormal: false, note: "Post-op drain and pain watch" },
  { id: "vit-011", patientId: "icu-011", bedNo: "ICU-C11", time: "10:50", temperature: "37.0", pulse: 90, bp: "126/78", respiratoryRate: 18, spo2: 99, oxygenFlow: "Room air", gcs: 14, urineOutput: 65, painScore: 2, nurse: "Ward Nurse Kavita", abnormal: false, note: "No seizure activity after admission" },
  { id: "vit-012", patientId: "icu-012", bedNo: "ICU-D12", time: "10:55", temperature: "37.5", pulse: 108, bp: "108/68", respiratoryRate: 22, spo2: 97, oxygenFlow: "Room air", gcs: 15, urineOutput: 50, painScore: 3, nurse: "Ward Nurse Kavita", abnormal: true, note: "Post transfusion Hb repeat pending" },
];

export const intakeOutputRows: IcuIntakeOutput[] = [
  { id: "io-001", patientId: "icu-001", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "IV", component: "Normal saline bolus", quantityMl: 250, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 250, outputType: "", outputMl: 0, balanceMl: 250, nurse: "Ward Nurse Kavita", capturedAt: "06:05", verifiedBy: "Unit Nurse Priya", note: "Pump PUMP-11 started during sepsis bundle" },
  { id: "io-002", patientId: "icu-001", date: "2026-06-06", time: "07:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 22, route: "Urinary catheter", source: "Urine assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 22, balanceMl: -22, nurse: "Ward Nurse Kavita", capturedAt: "07:05", note: "Low urine output; doctor informed" },
  { id: "io-003", patientId: "icu-001", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Intake", category: "Medicine", component: "Meropenem diluent", quantityMl: 100, route: "IV", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 100, outputType: "", outputMl: 0, balanceMl: 100, nurse: "Ward Nurse Kavita", capturedAt: "08:58", verifiedBy: "Ward Nurse Kavita", note: "Reflected from eMAR administration" },
  { id: "io-004", patientId: "icu-001", date: "2026-06-06", time: "09:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 28, route: "Urinary catheter", source: "Urine assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 28, balanceMl: -28, nurse: "Ward Nurse Kavita", capturedAt: "09:03", note: "Second low-output hour" },
  { id: "io-005", patientId: "icu-001", date: "2026-06-06", time: "10:00", shift: "Day", kind: "Intake", category: "NG Tube", component: "Enteral feed", quantityMl: 120, route: "NG tube", source: "Manual entry", status: "Signed", intakeType: "NG Tube", intakeMl: 120, outputType: "", outputMl: 0, balanceMl: 120, nurse: "Ward Nurse Kavita", capturedAt: "10:08", verifiedBy: "Unit Nurse Priya", note: "Feed tolerated" },
  { id: "io-006", patientId: "icu-001", date: "2026-06-06", time: "11:00", shift: "Day", kind: "Output", category: "Other Output", component: "Regurgitated feed", quantityMl: 60, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Other Output", outputMl: 60, balanceMl: -60, nurse: "Ward Nurse Kavita", capturedAt: "11:15", note: "Small feed loss after feed; aspiration watch" },
  { id: "io-007", patientId: "icu-001", date: "2026-06-05", time: "18:00", shift: "Night", kind: "Intake", category: "IV", component: "Maintenance fluid", quantityMl: 500, route: "IV", source: "Infusion pump", status: "Signed", intakeType: "IV fluids", intakeMl: 500, outputType: "", outputMl: 0, balanceMl: 500, nurse: "Night Nurse Leena", capturedAt: "18:10", verifiedBy: "Unit Nurse Priya", note: "Previous night maintenance" },
  { id: "io-008", patientId: "icu-001", date: "2026-06-05", time: "20:00", shift: "Night", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 110, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 110, balanceMl: -110, nurse: "Night Nurse Leena", capturedAt: "20:05", note: "Previous day output" },
  { id: "io-009", patientId: "icu-002", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "IV", component: "Balanced crystalloid", quantityMl: 200, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 200, outputType: "", outputMl: 0, balanceMl: 200, nurse: "Ward Nurse Arjun", capturedAt: "06:10", verifiedBy: "Unit Nurse Meera", note: "Post CABG maintenance" },
  { id: "io-010", patientId: "icu-002", date: "2026-06-06", time: "07:00", shift: "Day", kind: "Output", category: "Pleural Space", component: "Pleural chest drain right", quantityMl: 90, route: "Pleural drain", source: "Drain assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Pleural Space", outputMl: 90, balanceMl: -90, nurse: "Ward Nurse Arjun", capturedAt: "07:02", note: "Serosanguinous; surgeon review threshold 250 ml/shift" },
  { id: "io-011", patientId: "icu-002", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Intake", category: "Blood products", component: "Packed RBC", quantityMl: 250, route: "Blood transfusion", source: "Blood administration", status: "Auto synced", intakeType: "Blood products", intakeMl: 250, outputType: "", outputMl: 0, balanceMl: 250, nurse: "Ward Nurse Arjun", capturedAt: "08:45", verifiedBy: "Dr. Neha Malik", note: "Blood unit reflected from transfusion workflow" },
  { id: "io-012", patientId: "icu-002", date: "2026-06-06", time: "09:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 120, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 120, balanceMl: -120, nurse: "Ward Nurse Arjun", capturedAt: "09:05", note: "Adequate urine output" },
  { id: "io-013", patientId: "icu-002", date: "2026-06-06", time: "10:00", shift: "Day", kind: "Output", category: "Mediastinum", component: "Mediastinal chest drain", quantityMl: 110, route: "Mediastinal drain", source: "Drain assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "Mediastinum", outputMl: 110, balanceMl: -110, nurse: "Ward Nurse Arjun", capturedAt: "10:06", note: "Shift mediastinal drain total rising" },
  { id: "io-014", patientId: "icu-003", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "P.O", component: "Water sips", quantityMl: 80, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "P.O", intakeMl: 80, outputType: "", outputMl: 0, balanceMl: 80, nurse: "Ward Nurse Kavita", capturedAt: "06:25", verifiedBy: "Unit Nurse Priya", note: "Swallow screen passed for sips" },
  { id: "io-015", patientId: "icu-003", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Output", category: "Urine output", component: "External catheter", quantityMl: 70, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 70, balanceMl: -70, nurse: "Ward Nurse Kavita", capturedAt: "08:02", note: "Stable output" },
  { id: "io-016", patientId: "icu-003", date: "2026-06-06", time: "10:00", shift: "Day", kind: "Output", category: "Stool output", component: "Loose stool", quantityMl: 150, route: "Stool chart", source: "Stool assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Stool", outputMl: 150, balanceMl: -150, nurse: "Ward Nurse Kavita", capturedAt: "10:20", note: "Documented from stool assessment" },
  { id: "io-017", patientId: "icu-004", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "Oral supplements", component: "Protein supplement", quantityMl: 180, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "Oral supplements", intakeMl: 180, outputType: "", outputMl: 0, balanceMl: 180, nurse: "Ward Nurse Arjun", capturedAt: "06:40", verifiedBy: "Unit Nurse Meera", note: "Transfer-ready nutrition" },
  { id: "io-018", patientId: "icu-004", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Output", category: "Urine output", component: "Urinal", quantityMl: 160, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 160, balanceMl: -160, nurse: "Ward Nurse Arjun", capturedAt: "08:10", note: "Good output" },
  { id: "io-019", patientId: "icu-001", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Intake", category: "Fluid", component: "Ringer lactate", quantityMl: 150, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 150, outputType: "", outputMl: 0, balanceMl: 150, nurse: "Ward Nurse Kavita", capturedAt: "12:02", verifiedBy: "Unit Nurse Priya", note: "Maintenance fluid after bolus review" },
  { id: "io-020", patientId: "icu-001", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 35, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 35, balanceMl: -35, nurse: "Ward Nurse Kavita", capturedAt: "12:04", note: "Urine improving after fluid review" },
  { id: "io-021", patientId: "icu-001", date: "2026-06-06", time: "13:00", shift: "Day", kind: "Intake", category: "Medicine", component: "Paracetamol IV diluent", quantityMl: 100, route: "IV", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 100, outputType: "", outputMl: 0, balanceMl: 100, nurse: "Ward Nurse Kavita", capturedAt: "13:12", verifiedBy: "Ward Nurse Kavita", note: "Auto-added from medication administration" },
  { id: "io-022", patientId: "icu-001", date: "2026-06-06", time: "13:00", shift: "Day", kind: "Output", category: "Drain output", component: "Central line site dressing loss", quantityMl: 15, route: "Dressing estimate", source: "Drain assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Drain output", outputMl: 15, balanceMl: -15, nurse: "Ward Nurse Kavita", capturedAt: "13:20", note: "Minimal serous soakage documented" },
  { id: "io-023", patientId: "icu-001", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Intake", category: "Oral", component: "Ice chips", quantityMl: 40, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "Oral", intakeMl: 40, outputType: "", outputMl: 0, balanceMl: 40, nurse: "Ward Nurse Kavita", capturedAt: "14:10", verifiedBy: "Unit Nurse Priya", note: "Allowed after aspiration risk review" },
  { id: "io-024", patientId: "icu-001", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 42, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 42, balanceMl: -42, nurse: "Ward Nurse Kavita", capturedAt: "14:04", note: "Meets hourly target" },
  { id: "io-025", patientId: "icu-001", date: "2026-06-06", time: "15:00", shift: "Day", kind: "Intake", category: "NG Tube", component: "Enteral feed", quantityMl: 120, route: "NG tube", source: "Manual entry", status: "Pending review", intakeType: "NG Tube", intakeMl: 120, outputType: "", outputMl: 0, balanceMl: 120, nurse: "Ward Nurse Kavita", capturedAt: "15:05", note: "Feed restarted at lower rate" },
  { id: "io-026", patientId: "icu-001", date: "2026-06-06", time: "15:00", shift: "Day", kind: "Output", category: "Gastric wash", component: "NG aspirate", quantityMl: 55, route: "NG tube", source: "Drain assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "NG aspirate", outputMl: 55, balanceMl: -55, nurse: "Ward Nurse Kavita", capturedAt: "15:30", note: "Aspirate checked before feed escalation" },
  { id: "io-027", patientId: "icu-001", date: "2026-06-06", time: "16:00", shift: "Day", kind: "Intake", category: "Blood products", component: "FFP unit", quantityMl: 220, route: "Blood transfusion", source: "Blood administration", status: "Auto synced", intakeType: "Blood products", intakeMl: 220, outputType: "", outputMl: 0, balanceMl: 220, nurse: "Ward Nurse Kavita", capturedAt: "16:25", verifiedBy: "Dr. Sameer Mehta", note: "FFP reflected from blood administration workflow" },
  { id: "io-028", patientId: "icu-001", date: "2026-06-06", time: "16:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 48, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 48, balanceMl: -48, nurse: "Ward Nurse Kavita", capturedAt: "16:03", note: "Output maintained" },
  { id: "io-029", patientId: "icu-001", date: "2026-06-06", time: "17:00", shift: "Day", kind: "Output", category: "Est. Blood loss", component: "Line removal loss", quantityMl: 20, route: "Procedure estimate", source: "Manual entry", status: "Corrected", intakeType: "", intakeMl: 0, outputType: "Estimated blood loss", outputMl: 20, balanceMl: -20, nurse: "Ward Nurse Kavita", capturedAt: "17:15", verifiedBy: "Unit Nurse Priya", note: "Corrected after procedure note review" },
  { id: "io-030", patientId: "icu-001", date: "2026-06-06", time: "18:00", shift: "Night", kind: "Intake", category: "IV", component: "Dextrose saline", quantityMl: 250, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 250, outputType: "", outputMl: 0, balanceMl: 250, nurse: "Night Nurse Leena", capturedAt: "18:05", verifiedBy: "Unit Nurse Priya", note: "Night shift maintenance started" },
  { id: "io-031", patientId: "icu-001", date: "2026-06-06", time: "19:00", shift: "Night", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 52, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 52, balanceMl: -52, nurse: "Night Nurse Leena", capturedAt: "19:02", note: "Night urine output stable" },
  { id: "io-032", patientId: "icu-001", date: "2026-06-06", time: "21:00", shift: "Night", kind: "Intake", category: "Medicine", component: "Piperacillin/Tazobactam diluent", quantityMl: 100, route: "IV", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 100, outputType: "", outputMl: 0, balanceMl: 100, nurse: "Night Nurse Leena", capturedAt: "21:03", verifiedBy: "Night Nurse Leena", note: "Night antibiotic dose reflected from eMAR" },
  { id: "io-033", patientId: "icu-001", date: "2026-06-06", time: "23:00", shift: "Night", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 60, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 60, balanceMl: -60, nurse: "Night Nurse Leena", capturedAt: "23:02", note: "Stable overnight trend" },
  { id: "io-034", patientId: "icu-001", date: "2026-06-05", time: "06:00", shift: "Day", kind: "Intake", category: "P.O", component: "ORS sip plan", quantityMl: 180, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "P.O", intakeMl: 180, outputType: "", outputMl: 0, balanceMl: 180, nurse: "Ward Nurse Kavita", capturedAt: "06:30", verifiedBy: "Unit Nurse Priya", note: "Previous day oral intake baseline" },
  { id: "io-035", patientId: "icu-001", date: "2026-06-05", time: "12:00", shift: "Day", kind: "Output", category: "Stool output", component: "Liquid stool", quantityMl: 120, route: "Stool chart", source: "Stool assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Stool", outputMl: 120, balanceMl: -120, nurse: "Ward Nurse Kavita", capturedAt: "12:18", note: "Previous day stool output" },
  { id: "io-036", patientId: "icu-001", date: "2026-06-04", time: "08:00", shift: "Day", kind: "Intake", category: "IV", component: "Normal saline", quantityMl: 300, route: "IV", source: "Infusion pump", status: "Signed", intakeType: "IV fluids", intakeMl: 300, outputType: "", outputMl: 0, balanceMl: 300, nurse: "Ward Nurse Kavita", capturedAt: "08:12", verifiedBy: "Unit Nurse Priya", note: "Cumulative previous intake record" },
  { id: "io-037", patientId: "icu-001", date: "2026-06-04", time: "10:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 95, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 95, balanceMl: -95, nurse: "Ward Nurse Kavita", capturedAt: "10:05", note: "Cumulative previous output record" },
  { id: "io-038", patientId: "icu-002", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Intake", category: "Medicine", component: "Noradrenaline carrier", quantityMl: 30, route: "Infusion", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 30, outputType: "", outputMl: 0, balanceMl: 30, nurse: "Ward Nurse Arjun", capturedAt: "12:00", verifiedBy: "Dr. Neha Malik", note: "Vasopressor carrier volume" },
  { id: "io-039", patientId: "icu-002", date: "2026-06-06", time: "13:00", shift: "Day", kind: "Intake", category: "NTG Pump", component: "NTG infusion pump", quantityMl: 20, route: "Infusion pump", source: "Infusion pump", status: "Auto synced", intakeType: "NTG Pump", intakeMl: 20, outputType: "", outputMl: 0, balanceMl: 20, nurse: "Ward Nurse Arjun", capturedAt: "13:00", verifiedBy: "Dr. Neha Malik", note: "NTG pump carrier volume captured from infusion pump" },
  { id: "io-047", patientId: "icu-002", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Output", category: "Pleural Space", component: "Pleural chest drain right", quantityMl: 80, route: "Pleural drain", source: "Drain assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Pleural Space", outputMl: 80, balanceMl: -80, nurse: "Ward Nurse Arjun", capturedAt: "14:04", note: "Pleural drain trend slowing" },
  { id: "io-040", patientId: "icu-003", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Intake", category: "Oral supplements", component: "Thickened juice", quantityMl: 120, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "Oral supplements", intakeMl: 120, outputType: "", outputMl: 0, balanceMl: 120, nurse: "Ward Nurse Kavita", capturedAt: "12:45", verifiedBy: "Unit Nurse Priya", note: "Neuro swallow-safe supplement" },
  { id: "io-041", patientId: "icu-003", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Output", category: "Urine output", component: "External catheter", quantityMl: 85, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 85, balanceMl: -85, nurse: "Ward Nurse Kavita", capturedAt: "14:03", note: "Stable neuro ICU output" },
  { id: "io-042", patientId: "icu-004", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Output", category: "Urine output", component: "Urinal", quantityMl: 180, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 180, balanceMl: -180, nurse: "Ward Nurse Arjun", capturedAt: "12:12", note: "Transfer readiness output recorded" },
  { id: "io-043", patientId: "icu-005", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Intake", category: "IV", component: "Balanced crystalloid", quantityMl: 120, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 120, outputType: "", outputMl: 0, balanceMl: 120, nurse: "Ward Nurse Neha", capturedAt: "08:05", verifiedBy: "Unit Nurse Priya", note: "Transplant fluid target reviewed with renal output" },
  { id: "io-044", patientId: "icu-005", date: "2026-06-06", time: "09:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 85, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 85, balanceMl: -85, nurse: "Ward Nurse Neha", capturedAt: "09:03", note: "Post transplant urine output adequate" },
  { id: "io-045", patientId: "icu-006", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Intake", category: "IV Medication Dilution", component: "Nebulization medication carrier", quantityMl: 30, route: "Nebulization", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 30, outputType: "", outputMl: 0, balanceMl: 30, nurse: "Ward Nurse Arjun", capturedAt: "08:18", verifiedBy: "Unit Nurse Meera", note: "Respiratory ICU bronchodilator support" },
  { id: "io-046", patientId: "icu-006", date: "2026-06-06", time: "10:00", shift: "Day", kind: "Output", category: "Sputum", component: "Airway secretion estimate", quantityMl: 35, route: "Suction", source: "Manual entry", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "Other output", outputMl: 35, balanceMl: -35, nurse: "Ward Nurse Arjun", capturedAt: "10:12", note: "Thick secretion; suction frequency reviewed" },
];

export const medicationRows: IcuMedication[] = [
  { id: "mar-001", patientId: "icu-001", bedNo: "ICU-A01", medication: "Meropenem", dose: "1 g", route: "IV", frequency: "8 hourly", scheduledTime: "09:00", actualTime: "-", status: "Late", administeredBy: "Ward Nurse Kavita", doubleVerification: "Required", reason: "Awaiting pharmacy dispense" },
  { id: "mar-006", patientId: "icu-001", bedNo: "ICU-A01", medication: "Paracetamol", dose: "500 mg", route: "IV", frequency: "8 hourly", scheduledTime: "14:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Fever control plan" },
  { id: "mar-007", patientId: "icu-001", bedNo: "ICU-A01", medication: "Meropenem", dose: "1 g", route: "IV", frequency: "8 hourly", scheduledTime: "22:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Required", reason: "Night antibiotic dose" },
  { id: "mar-002", patientId: "icu-002", bedNo: "ICU-A02", medication: "Noradrenaline", dose: "Titrate", route: "Infusion", frequency: "Continuous", scheduledTime: "Running", actualTime: "08:15", status: "Administered", administeredBy: "Ward Nurse Arjun", doubleVerification: "Dr. Neha Malik", reason: "Vasopressor support" },
  { id: "mar-008", patientId: "icu-002", bedNo: "ICU-A02", medication: "Aspirin", dose: "75 mg", route: "Oral", frequency: "OD", scheduledTime: "14:00", actualTime: "14:05", status: "Administered", administeredBy: "Ward Nurse Arjun", doubleVerification: "Not required", reason: "Post CABG antiplatelet plan" },
  { id: "mar-009", patientId: "icu-002", bedNo: "ICU-A02", medication: "Cefuroxime", dose: "1.5 g", route: "IV", frequency: "12 hourly", scheduledTime: "20:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Post operative antibiotic cover" },
  { id: "mar-003", patientId: "icu-003", bedNo: "ICU-B03", medication: "Mannitol", dose: "100 ml", route: "IV", frequency: "12 hourly", scheduledTime: "11:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Required", reason: "Neuro order" },
  { id: "mar-010", patientId: "icu-003", bedNo: "ICU-B03", medication: "Levetiracetam", dose: "500 mg", route: "IV", frequency: "12 hourly", scheduledTime: "18:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Seizure prophylaxis" },
  { id: "mar-011", patientId: "icu-003", bedNo: "ICU-B03", medication: "Mannitol", dose: "100 ml", route: "IV", frequency: "12 hourly", scheduledTime: "23:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Required", reason: "Night neuro order" },
  { id: "mar-004", patientId: "icu-005", bedNo: "ICU-T05", medication: "Tacrolimus", dose: "1 mg", route: "Oral", frequency: "12 hourly", scheduledTime: "10:00", actualTime: "-", status: "Due", administeredBy: "Ward Nurse Neha", doubleVerification: "Transplant protocol", reason: "Post transplant immunosuppression" },
  { id: "mar-012", patientId: "icu-005", bedNo: "ICU-T05", medication: "Mycophenolate", dose: "500 mg", route: "Oral", frequency: "BD", scheduledTime: "18:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Transplant protocol", reason: "Evening immunosuppression dose" },
  { id: "mar-013", patientId: "icu-005", bedNo: "ICU-T05", medication: "Tacrolimus", dose: "1 mg", route: "Oral", frequency: "12 hourly", scheduledTime: "22:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Transplant protocol", reason: "Night trough-linked dose" },
  { id: "mar-005", patientId: "icu-006", bedNo: "ICU-R06", medication: "Nebulized Salbutamol", dose: "2.5 mg", route: "Nebulization", frequency: "4 hourly", scheduledTime: "10:30", actualTime: "-", status: "Due", administeredBy: "Ward Nurse Kavita", doubleVerification: "Not required", reason: "COPD exacerbation bronchodilator plan" },
  { id: "mar-014", patientId: "icu-006", bedNo: "ICU-R06", medication: "Hydrocortisone", dose: "100 mg", route: "IV", frequency: "8 hourly", scheduledTime: "14:30", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Respiratory ICU steroid plan" },
  { id: "mar-015", patientId: "icu-006", bedNo: "ICU-R06", medication: "Nebulized Salbutamol", dose: "2.5 mg", route: "Nebulization", frequency: "4 hourly", scheduledTime: "21:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Night bronchodilator dose" },
  { id: "mar-016", patientId: "icu-007", bedNo: "ICU-G07", medication: "Piperacillin/Tazobactam", dose: "4.5 g", route: "IV", frequency: "8 hourly", scheduledTime: "12:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Required", reason: "Sepsis antibiotic dose" },
  { id: "mar-017", patientId: "icu-008", bedNo: "ICU-M08", medication: "Pantoprazole", dose: "40 mg", route: "IV", frequency: "OD", scheduledTime: "13:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Stress ulcer prophylaxis" },
  { id: "mar-018", patientId: "icu-009", bedNo: "ICU-N09", medication: "Potassium chloride", dose: "20 mEq", route: "IV", frequency: "Once", scheduledTime: "12:30", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Required", reason: "Electrolyte correction" },
  { id: "mar-019", patientId: "icu-010", bedNo: "ICU-S10", medication: "Paracetamol", dose: "1 g", route: "IV", frequency: "8 hourly", scheduledTime: "14:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Post operative pain control" },
  { id: "mar-020", patientId: "icu-011", bedNo: "ICU-C11", medication: "Levetiracetam", dose: "500 mg", route: "IV", frequency: "12 hourly", scheduledTime: "18:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Not required", reason: "Seizure prophylaxis" },
  { id: "mar-021", patientId: "icu-012", bedNo: "ICU-D12", medication: "Tranexamic acid", dose: "1 g", route: "IV", frequency: "Once", scheduledTime: "Now", actualTime: "-", status: "Late", administeredBy: "-", doubleVerification: "Required", reason: "Bleeding control plan" },
];

export const infusionRows: IcuInfusion[] = [
  { id: "iv-001", patientId: "icu-001", bedNo: "ICU-A01", fluidName: "Normal saline", startTime: "08:10", rate: "100 ml/hr", totalVolumeMl: 1000, infusedVolumeMl: 320, remainingVolumeMl: 680, pumpNo: "PUMP-11", status: "Running", nurse: "Ward Nurse Kavita", alert: "Balance positive" },
  { id: "iv-002", patientId: "icu-002", bedNo: "ICU-A02", fluidName: "Noradrenaline infusion", startTime: "07:45", rate: "6 ml/hr", totalVolumeMl: 50, infusedVolumeMl: 18, remainingVolumeMl: 32, pumpNo: "PUMP-07", status: "Running", nurse: "Ward Nurse Arjun", alert: "Double verified" },
  { id: "iv-003", patientId: "icu-005", bedNo: "ICU-T05", fluidName: "Renal transplant maintenance fluid", startTime: "06:30", rate: "75 ml/hr", totalVolumeMl: 1000, infusedVolumeMl: 260, remainingVolumeMl: 740, pumpNo: "PUMP-15", status: "Running", nurse: "Ward Nurse Neha", alert: "Strict renal balance" },
  { id: "iv-004", patientId: "icu-006", bedNo: "ICU-R06", fluidName: "Steroid infusion carrier", startTime: "08:30", rate: "40 ml/hr", totalVolumeMl: 500, infusedVolumeMl: 90, remainingVolumeMl: 410, pumpNo: "PUMP-18", status: "Running", nurse: "Ward Nurse Arjun", alert: "Respiratory support active" },
];

export const transfusionRows: IcuBloodTransfusion[] = [
  { id: "bt-001", patientId: "icu-002", bedNo: "ICU-A02", bloodGroup: "B+", componentType: "PRBC", unitNumber: "BU-24056", crossmatchStatus: "Compatible", startTime: "09:05", status: "Running", reactionObserved: "No", nurse: "Ward Nurse Arjun", doctor: "Dr. Neha Malik" },
  { id: "bt-002", patientId: "icu-001", bedNo: "ICU-A01", bloodGroup: "O+", componentType: "FFP", unitNumber: "BU-24057", crossmatchStatus: "Issued", startTime: "Pending", status: "Issued", reactionObserved: "No", nurse: "Ward Nurse Kavita", doctor: "Dr. Sameer Mehta" },
];

export const doctorInstructions: DoctorInstruction[] = [
  { id: "ins-001", patientId: "icu-001", bedNo: "ICU-A01", doctor: "Dr. Sameer Mehta", instructionType: "Monitoring", instruction: "Repeat vitals every 15 minutes until BP stabilizes", priority: "Critical", dueTime: "Now", status: "Pending", assignedNurse: "Ward Nurse Kavita", remarks: "Escalate to duty doctor if MAP < 65" },
  { id: "ins-002", patientId: "icu-002", bedNo: "ICU-A02", doctor: "Dr. Neha Malik", instructionType: "Result review", instruction: "Review ABG and ventilator settings", priority: "High", dueTime: "20 min", status: "In progress", assignedNurse: "Ward Nurse Arjun", remarks: "ABG sent" },
  { id: "ins-003", patientId: "icu-004", bedNo: "ICU-B04", doctor: "Dr. Sameer Mehta", instructionType: "Transfer", instruction: "Prepare transfer to medical ward", priority: "Routine", dueTime: "Today", status: "Pending", assignedNurse: "Unit Nurse Meera", remarks: "Need pharmacy and billing clearance" },
  { id: "ins-004", patientId: "icu-005", bedNo: "ICU-T05", doctor: "Dr. Kavita Rao", instructionType: "Transplant review", instruction: "Track urine output hourly and follow tacrolimus level", priority: "High", dueTime: "30 min", status: "Pending", assignedNurse: "Ward Nurse Neha", remarks: "Inform transplant team if urine output drops" },
  { id: "ins-005", patientId: "icu-006", bedNo: "ICU-R06", doctor: "Dr. Sameer Mehta", instructionType: "Respiratory review", instruction: "Repeat ABG after NIV setting change", priority: "Critical", dueTime: "Now", status: "In progress", assignedNurse: "Ward Nurse Arjun", remarks: "Prepare intubation readiness if NIV fails" },
];

export const icuAlerts: IcuAlert[] = [
  { id: "alert-001", patientId: "icu-001", bedNo: "ICU-A01", type: "Abnormal vitals", severity: "Critical", message: "SpO2 90%, BP 86/54, pulse 132", source: "Vitals Chart", status: "Open", createdAt: "10 min ago", owner: "Duty Doctor" },
  { id: "alert-002", patientId: "icu-001", bedNo: "ICU-A01", type: "Medication overdue", severity: "High", message: "Meropenem IV overdue by 25 minutes", source: "MAR", status: "Acknowledged", createdAt: "25 min ago", owner: "Ward Nurse" },
  { id: "alert-003", patientId: "icu-002", bedNo: "ICU-A02", type: "Blood transfusion", severity: "Medium", message: "15-minute transfusion vitals due", source: "Blood Unit", status: "Open", createdAt: "5 min ago", owner: "Ward Nurse" },
  { id: "alert-004", patientId: "icu-004", bedNo: "ICU-B04", type: "Transfer clearance", severity: "Info", message: "Nurse transfer checklist pending", source: "Transfer Order", status: "Open", createdAt: "1 hr ago", owner: "Unit Nurse" },
  { id: "alert-005", patientId: "icu-005", bedNo: "ICU-T05", type: "Transplant drug level", severity: "Medium", message: "Tacrolimus level pending before next dose", source: "Transplant protocol", status: "Open", createdAt: "18 min ago", owner: "Transplant nurse" },
  { id: "alert-006", patientId: "icu-006", bedNo: "ICU-R06", type: "Respiratory deterioration", severity: "High", message: "SpO2 91% on NIV; ABG repeat due", source: "Respiratory ICU monitor", status: "Open", createdAt: "8 min ago", owner: "Duty Doctor" },
];

export const activityLogs = [
  { id: "log-001", event: "ICU_ADMISSION_CREATED", actor: "Unit Nurse Priya", patient: "Aisha Khan", detail: "Emergency arrival and ICU-A01 bed allocation started", time: "08:10", ip: "10.20.1.11" },
  { id: "log-002", event: "VITALS_RECORDED", actor: "Ward Nurse Kavita", patient: "Aisha Khan", detail: "Abnormal vitals generated critical alert", time: "09:00", ip: "10.20.1.18" },
  { id: "log-003", event: "BLOOD_TRANSFUSION_STARTED", actor: "Ward Nurse Arjun", patient: "Rohan Das", detail: "PRBC BU-24056 started after verification", time: "09:05", ip: "10.20.1.21" },
  { id: "log-004", event: "DOCTOR_INSTRUCTION_CREATED", actor: "Dr. Sameer Mehta", patient: "Aisha Khan", detail: "Repeat vitals every 15 minutes", time: "09:12", ip: "10.20.1.35" },
];

export const reportRows = [
  { id: "rep-001", report: "ICU occupancy report", scope: "Medical ICU", count: "4 active / 6 beds", status: "Ready", owner: "Head Nurse" },
  { id: "rep-002", report: "Medication administration compliance", scope: "Current shift", count: "86%", status: "Needs attention", owner: "Head Nurse" },
  { id: "rep-003", report: "Blood transfusion report", scope: "Today", count: "2 units issued", status: "Ready", owner: "Blood Unit" },
  { id: "rep-004", report: "Intake/output balance", scope: "Last 24 hours", count: "1 positive balance alert", status: "Review", owner: "Duty Doctor" },
  { id: "rep-005", report: "Transplant ICU renal output", scope: "Transplant ICU", count: "1 active transplant watch", status: "Ready", owner: "Transplant Team" },
  { id: "rep-006", report: "Respiratory ICU NIV watch", scope: "Respiratory ICU", count: "1 NIV patient", status: "Review", owner: "Respiratory Team" },
];

export function toneForPriority(priority: IcuPriority): StatusTone {
  if (priority === "Critical") return "critical";
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warning";
  return "info";
}

export function toneForStatus(status: string): StatusTone {
  const lower = status.toLowerCase();
  if (lower.includes("critical") || lower.includes("overdue") || lower.includes("reaction") || lower.includes("death")) return "critical";
  if (lower.includes("ventilated") || lower.includes("late") || lower.includes("open") || lower.includes("escalated")) return "danger";
  if (lower.includes("pending") || lower.includes("running") || lower.includes("issued") || lower.includes("in progress")) return "warning";
  if (lower.includes("completed") || lower.includes("administered") || lower.includes("resolved") || lower.includes("ready")) return "success";
  return "info";
}
