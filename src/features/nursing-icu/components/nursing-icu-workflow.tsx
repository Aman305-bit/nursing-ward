"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BedDouble,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Copy,
  FileText,
  FileSignature,
  Filter,
  HeartPulse,
  ListChecks,
  LockKeyhole,
  MonitorDot,
  MoreHorizontal,
  Pill,
  Search,
  Save,
  ShieldAlert,
  Syringe,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import { NativeSelect } from "@/features/admin/admin-shared";
import {
  icuAlerts,
  icuPatients,
  icuTasks,
  icuVitals,
  infusionRows,
  intakeOutputRows,
  medicationRows,
  reportRows,
  toneForPriority,
  toneForStatus,
  type IcuAlert,
  type IcuMedication,
  type IcuPatient,
  type IcuTask,
} from "../nursing-icu-data";

type WorkflowAlertStatus = "New" | "Acknowledged" | "Assigned" | "Resolved" | "Closed";
type WorkflowMedicationStatus = IcuMedication["status"] | "Missed" | "Upcoming" | "Refused" | "Running" | "Paused" | "Stopped";
type MedicationNurseAction = "Administered" | "Held" | "Skipped" | "Missed" | "Refused" | "Running" | "Paused" | "Stopped" | "Verify";
type DoctorOrderStatusAction = "Hold" | "Discontinue";
type DoctorOrderAmendPayload = {
  changeAreas: string[];
  reason: string;
  effectiveDate: string;
  effectiveTime: string;
  note: string;
};
type MedicationOrderType = "Scheduled" | "STAT" | "PRN" | "Continuous" | "One-time";
type PharmacyStatus = "Available" | "Pending dispense" | "Low stock" | "Out of stock" | "Restricted" | "Shortage" | "Substitution requested";
type MedicationOrderStatus = "Draft" | "Active" | "Held by doctor" | "Discontinued";
type MedicationDepartment = "ICU" | "Emergency" | "Cardiology" | "Neurology" | "Pediatrics" | "Surgery" | "Anesthesia";
type FormularyAvailability = "Available" | "Low stock" | "Out of stock" | "Restricted";

type WorkflowAlert = Omit<IcuAlert, "status"> & {
  status: WorkflowAlertStatus;
  assignedTo: string;
  timeline: string[];
};

type MedicationDoseRow = Omit<IcuMedication, "status" | "doubleVerification"> & {
  orderId: string;
  orderType: MedicationOrderType;
  status: WorkflowMedicationStatus;
  scheduledDate: string;
  shift: "Morning" | "Evening" | "Night";
  doctor: string;
  indication: string;
  instructions: string;
  highRisk: boolean;
  doubleVerification: "Not required" | "Pending" | "Verified";
  pharmacyStatus: PharmacyStatus;
  orderStatus: MedicationOrderStatus;
  auditTrail: string[];
};

type DoctorMedicationOrder = {
  id: string;
  patientId: string;
  bedNo: string;
  department?: MedicationDepartment;
  formularyId?: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  orderType: MedicationOrderType;
  scheduleTimes: string[];
  doctor: string;
  indication: string;
  instructions: string;
  priority: "Routine" | "High" | "STAT";
  highRisk: boolean;
  doubleVerificationRequired: boolean;
  pharmacyStatus: PharmacyStatus;
  pharmacyLocation?: string;
  stockStatus?: FormularyAvailability;
  scenarioNotes?: string[];
  alternativeMeds?: string[];
  startDate?: string;
  startTime?: string;
  duration?: string;
  maxDailyDose?: string;
  minInterval?: string;
  reviewDate?: string;
  titrationTarget?: string;
  minRate?: string;
  maxRate?: string;
  monitoringFrequency?: string;
  approvalReason?: string;
  signedAt?: string;
  version?: number;
  statusReason?: string;
  followUpPlan?: string;
  actionTimeline?: string[];
  status: MedicationOrderStatus;
};

type MedicationOrderDraft = {
  patientId: string;
  department: MedicationDepartment;
  formularyId: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  orderType: MedicationOrderType;
  scheduleTimes: string;
  doctor: string;
  indication: string;
  instructions: string;
  highRisk: boolean;
  doubleVerificationRequired: boolean;
  pharmacyStatus: PharmacyStatus;
  startDate: string;
  startTime: string;
  duration: string;
  maxDailyDose: string;
  minInterval: string;
  reviewDate: string;
  titrationTarget: string;
  minRate: string;
  maxRate: string;
  monitoringFrequency: string;
  approvalReason: string;
};

type FormularyMedicine = {
  id: string;
  name: string;
  genericName: string;
  departments: MedicationDepartment[];
  defaultDose: string;
  route: string;
  frequency: string;
  orderType: MedicationOrderType;
  scheduleTimes: string;
  indication: string;
  instructions: string;
  pharmacyLocation: string;
  stockQty: number;
  stockUnit: string;
  availability: FormularyAvailability;
  highRisk: boolean;
  doubleVerificationRequired: boolean;
  restricted: boolean;
  alternatives: string[];
  safetyFlags: string[];
  renalDoseNote?: string;
  pediatricDoseNote?: string;
  npoWarning?: string;
};

type PatientMedicationProfile = {
  patientId: string;
  weightKg: number;
  allergies: string[];
  renalStatus: "Normal" | "Dose adjustment" | "Watch";
  liverStatus: "Normal" | "Watch";
  feedingStatus: "Oral allowed" | "NPO" | "NG feeds";
  ageGroup: "Pediatric" | "Adult" | "Geriatric";
};

type MedicationScenario = {
  id: string;
  title: string;
  detail: string;
  tone: StatusTone;
  blocking?: boolean;
};
type MedicationEmarQueue = "Due Now" | "Administered" | "Held / Skipped" | "Infusions" | "PRN" | "History";
const MEDICATION_READY_STORAGE_KEY = "plasmit-nursing-ready-medications";

type AdmissionDraft = {
  patientId: string;
  patientName: string;
  mrn: string;
  icuAdmissionNo: string;
  ageGender: string;
  source: string;
  currentLocation: string;
  patientStatus: string;
  sourceDetail: string;
  handoverBy: string;
  diagnosis: string;
  condition: string;
  recoveryStatus: string;
  pendingInvestigations: string;
  plannedCareTreatment: string;
  bedNo: string;
  unit: string;
  nurse: string;
  doctor: string;
  admittingConsultant: string;
  admittingTeam: string;
  acceptanceStatus: string;
  ventilator: string;
  devices: string;
  medication: string;
  pastMedication: string;
  currentMedication: string;
  allergy: string;
  highAlertMedications: string;
  otherRelevantInformation: string;
  procedures: string;
  handedOver: string;
  takenOverBy: string;
  signatureConfirmation: string;
  nursingNotes: string;
  risk: string;
  isolation: string;
  readiness: string;
  notes: string;
};

const admissionSteps = ["Patient", "Patient Status", "Bed & Device", "Medication", "Review"];
const admissionSourceOptions = ["Emergency", "Emergency direct ICU", "General ward", "Post-surgical unit", "HDU step-up", "External hospital transfer", "Direct ICU admission"];
const admittingTeamOptions = ["ER + ICU rapid admit unit", "General ICU admitting unit", "Medical ICU admitting unit", "Cardiothoracic ICU admitting unit", "Pediatric ICU admitting unit", "Neuro ICU admitting unit", "Transplant ICU admitting unit", "Respiratory ICU admitting unit", "Surgical ICU admitting unit", "Isolation ICU admitting unit", "External transfer receive unit"];
const admittingConsultantOptions = ["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma", "Dr. Kavita Rao", "Dr. Ritu Anand", "Dr. Mohan Singh"];
const admissionRequiredFields: Array<keyof AdmissionDraft> = [
  "patientId",
  "patientName",
  "mrn",
  "icuAdmissionNo",
  "ageGender",
  "source",
  "currentLocation",
  "patientStatus",
  "sourceDetail",
  "handoverBy",
  "diagnosis",
  "condition",
  "recoveryStatus",
  "bedNo",
  "unit",
  "nurse",
  "doctor",
  "admittingConsultant",
  "admittingTeam",
  "ventilator",
  "devices",
  "medication",
  "risk",
  "isolation",
  "readiness",
];
const allNurses = Array.from(new Set(icuPatients.flatMap((patient) => [patient.assignedUnitNurse, patient.assignedWardNurse])));

type AdmissionPatientState = "ICU request pending" | "Already admitted" | "ER stabilization" | "Emergency direct ICU" | "Ward deterioration" | "Post-op recovery" | "External transfer accepted" | "Planned ICU";

type AdmissionPatientCandidate = {
  id: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  source: string;
  currentLocation: string;
  patientStatus: AdmissionPatientState;
  diagnosis: string;
  condition: string;
  unit: string;
  bedNo: string;
  nurse: string;
  doctor: string;
  admittingTeam: string;
  ventilator: string;
  devices: string;
  medication: string;
  risk: string;
  isolation: string;
  sourceDetail: string;
  handoverBy: string;
  acceptanceStatus: string;
  notes: string;
  allergy?: string;
  duplicateBlock?: boolean;
};

type EmergencyAdmissionQuickDraft = {
  patientName: string;
  ageGender: string;
  mobile: string;
  relativeName: string;
  diagnosis: string;
  allergy: string;
};

type IcuAdmissionBedOption = {
  bedNo: string;
  unit: string;
  status: "Available" | "Cleaning" | "Occupied" | "Transfer pending" | "Isolation available" | "Reserved";
  capability: string;
  note: string;
};

type AdmissionSourceScenario = {
  title: string;
  detailLabel: string;
  handoverLabel: string;
  readinessFocus: string[];
  risks: string[];
};

const admissionPatientCandidates: AdmissionPatientCandidate[] = [
  ...icuPatients.map((patient) => ({
    id: patient.id,
    patientName: patient.patientName,
    mrn: patient.mrn,
    ageGender: patient.ageGender,
    source: patient.admissionSource,
    currentLocation: `${patient.bedNo} | ${patient.unit}`,
    patientStatus: "Already admitted" as const,
    diagnosis: patient.diagnosis,
    condition: patient.currentStatus,
    unit: patient.unit,
    bedNo: patient.bedNo,
    nurse: patient.assignedUnitNurse,
    doctor: patient.admittingDoctor,
    admittingTeam: "Existing ICU care team",
    ventilator: patient.ventilatorStatus,
    devices: "Monitor, oxygen, infusion pump mapped",
    medication: "Continue active ICU medication plan",
    risk: patient.criticalityScore >= 8 ? "Critical" : "High",
    isolation: patient.alerts.some((alert) => alert.toLowerCase().includes("infection")) ? "Contact precaution" : "No",
    sourceDetail: `Current ICU admission active since ${patient.admissionTime}`,
    handoverBy: patient.assignedWardNurse,
    acceptanceStatus: "Accepted",
    notes: "Duplicate ICU admission should be blocked; open current admission or transfer workflow.",
    duplicateBlock: true,
  })),
  {
    id: "admit-er-direct-001",
    patientName: "Samar Ali",
    mrn: "PLH-ER-260608-0098",
    ageGender: "34/M",
    source: "Emergency direct ICU",
    currentLocation: "Emergency triage red zone",
    patientStatus: "Emergency direct ICU",
    diagnosis: "Acute respiratory failure requiring immediate ICU bed",
    condition: "Critical",
    unit: "Medical ICU",
    bedNo: "ICU-C05",
    nurse: "Unit Nurse Priya",
    doctor: "Dr. Sameer Mehta",
    admittingTeam: "ER + ICU rapid admit team",
    ventilator: "Invasive ventilation",
    devices: "Monitor, ventilator, suction, infusion pump, emergency trolley",
    medication: "Rapid sequence medication, vasopressor readiness, antibiotic stat dose",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "Emergency red-zone patient bypassing ward/admission queue for direct ICU receive.",
    handoverBy: "ER Duty Doctor + ER Nurse Ritu",
    acceptanceStatus: "Accepted",
    notes: "Direct ICU admit: bed, ventilator, suction, and rapid response team must be ready before physical transfer.",
  },
  {
    id: "admit-er-001",
    patientName: "Farhan Sheikh",
    mrn: "PLH-ER-260608-0012",
    ageGender: "47/M",
    source: "Emergency",
    currentLocation: "ER Bay 2",
    patientStatus: "ER stabilization",
    diagnosis: "Septic shock with escalating oxygen requirement",
    condition: "Critical",
    unit: "Medical ICU",
    bedNo: "ICU-C05",
    nurse: "Unit Nurse Priya",
    doctor: "Dr. Sameer Mehta",
    admittingTeam: "ER + ICU rapid admit team",
    ventilator: "NIV support",
    devices: "Monitor, oxygen, suction, infusion pump",
    medication: "Antibiotics, IV fluids, vasopressor readiness",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "ER stabilization complete; MAP support and oxygen escalation documented.",
    handoverBy: "ER Nurse Ritu",
    acceptanceStatus: "Accepted",
    notes: "Receive in Medical ICU with sepsis bundle and hourly urine output.",
  },
  {
    id: "admit-ward-001",
    patientName: "Nisha Verma",
    mrn: "PLH-IPD-260608-0041",
    ageGender: "63/F",
    source: "General ward",
    currentLocation: "Medical Ward W-12",
    patientStatus: "Ward deterioration",
    diagnosis: "Pneumonia with SpO2 drop and hypotension",
    condition: "Critical",
    unit: "Medical ICU",
    bedNo: "ICU-C06",
    nurse: "Unit Nurse Sana",
    doctor: "Dr. Aman Verma",
    admittingTeam: "Medical ICU admitting team",
    ventilator: "Oxygen mask",
    devices: "Monitor, oxygen, suction",
    medication: "Antibiotic escalation, nebulization, fluids review",
    risk: "High",
    isolation: "Contact precaution",
    sourceDetail: "Ward escalation after persistent SpO2 below target despite oxygen support.",
    handoverBy: "Ward Nurse Kavita",
    acceptanceStatus: "Accepted",
    notes: "Ward-to-ICU step-up; review ABG and repeat vitals on arrival.",
  },
  {
    id: "admit-ot-001",
    patientName: "Dev Malhotra",
    mrn: "PLH-OT-260608-0029",
    ageGender: "58/M",
    source: "Post-surgical unit",
    currentLocation: "OT Recovery 1",
    patientStatus: "Post-op recovery",
    diagnosis: "Post laparotomy monitoring with vasopressor watch",
    condition: "Ventilated",
    unit: "Surgical ICU",
    bedNo: "ICU-S02",
    nurse: "Unit Nurse Meera",
    doctor: "Dr. Neha Malik",
    admittingTeam: "Surgical ICU admitting team",
    ventilator: "Invasive ventilation",
    devices: "Monitor, ventilator, infusion pump, drain chart",
    medication: "Analgesia, antibiotics, vasopressor infusion",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "Anesthesia handover pending: airway, blood loss, drain, and vasopressor plan.",
    handoverBy: "OT Nurse Sanjana",
    acceptanceStatus: "Pending ICU doctor acceptance",
    notes: "Keep ventilator and pump ready before transfer from OT recovery.",
  },
  {
    id: "admit-external-001",
    patientName: "Reema Joshi",
    mrn: "PLH-EXT-260608-0007",
    ageGender: "39/F",
    source: "External hospital transfer",
    currentLocation: "Ambulance ETA 25 min",
    patientStatus: "External transfer accepted",
    diagnosis: "Acute stroke observation with low GCS",
    condition: "Critical",
    unit: "Neuro ICU",
    bedNo: "ICU-N03",
    nurse: "Unit Nurse Sana",
    doctor: "Dr. Imran Shah",
    admittingTeam: "Neuro ICU admitting team",
    ventilator: "Oxygen mask",
    devices: "Monitor, oxygen, suction, neuro observation chart",
    medication: "Mannitol availability check, seizure precautions",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "Referral accepted by neuro ICU; transfer note and imaging CD expected.",
    handoverBy: "Referring hospital coordinator",
    acceptanceStatus: "Accepted",
    notes: "Prepare neuro ICU receive and document external transfer handover.",
  },
];

const icuAdmissionBedOptions: IcuAdmissionBedOption[] = [
  { bedNo: "ICU-C05", unit: "Medical ICU", status: "Available", capability: "Monitor + oxygen + suction", note: "Ready for ER/ward ICU admission." },
  { bedNo: "ICU-C06", unit: "Medical ICU", status: "Cleaning", capability: "Monitor + oxygen", note: "Housekeeping clearance pending." },
  { bedNo: "ICU-A01", unit: "Pediatric ICU", status: "Occupied", capability: "NIV support", note: "Aisha Khan currently admitted." },
  { bedNo: "ICU-B04", unit: "General ICU", status: "Transfer pending", capability: "Monitor-only bed", note: "Transfer checklist not complete." },
  { bedNo: "ICU-G01", unit: "General ICU", status: "Available", capability: "Monitor + oxygen + suction", note: "Ready for general ICU admission." },
  { bedNo: "ICU-P07", unit: "Pediatric ICU", status: "Available", capability: "Pediatric monitor + oxygen + suction", note: "Ready for pediatric ICU admission." },
  { bedNo: "ICU-N03", unit: "Neuro ICU", status: "Available", capability: "Neuro monitor + oxygen", note: "Ready for stroke/neuro observation." },
  { bedNo: "ICU-T05", unit: "Transplant ICU", status: "Occupied", capability: "Transplant monitor + strict I/O + pump", note: "Ananya Roy currently admitted." },
  { bedNo: "ICU-T07", unit: "Transplant ICU", status: "Available", capability: "Renal output chart + infusion pump + isolation-ready", note: "Ready for post-transplant observation." },
  { bedNo: "ICU-R06", unit: "Respiratory ICU", status: "Occupied", capability: "NIV + ABG watch + suction", note: "Irfan Qureshi currently admitted." },
  { bedNo: "ICU-R08", unit: "Respiratory ICU", status: "Available", capability: "NIV/oxygen + suction + respiratory monitor", note: "Ready for COPD/asthma/respiratory failure admission." },
  { bedNo: "ICU-S02", unit: "Surgical ICU", status: "Reserved", capability: "Ventilator + pump + drain chart", note: "Reserved until doctor acceptance is completed." },
  { bedNo: "ICU-ISO1", unit: "Isolation ICU", status: "Isolation available", capability: "Negative pressure + PPE station", note: "Use for contact/airborne isolation." },
];

const admissionReadinessItems = [
  "Patient ID band verified",
  "Allergy band / alert checked",
  "Bedside monitor ready",
  "Oxygen and suction ready",
  "Ventilator / NIV readiness checked",
  "Infusion pump and emergency drugs ready",
  "Initial vitals planned",
  "Handover note received",
];

const admissionSourceScenarios: Record<string, AdmissionSourceScenario> = {
  Emergency: {
    title: "ER to ICU",
    detailLabel: "ER stabilization summary",
    handoverLabel: "ER handover by",
    readinessFocus: ["oxygen/suction", "vasopressor readiness", "sepsis/shock bundle", "initial vitals"],
    risks: ["unstable vitals", "unknown allergy", "pending labs", "family consent in progress"],
  },
  "Emergency direct ICU": {
    title: "Emergency direct ICU admission",
    detailLabel: "Direct ICU emergency reason",
    handoverLabel: "ER rapid handover by",
    readinessFocus: ["ICU bed before paperwork", "ventilator/suction ready", "rapid response team", "stat medication and consent"],
    risks: ["unstable airway", "identity pending", "no ward handover", "family consent after stabilization"],
  },
  "General ward": {
    title: "Ward to ICU step-up",
    detailLabel: "Deterioration reason",
    handoverLabel: "Ward handover by",
    readinessFocus: ["transfer checklist", "ward medication reconciliation", "repeat vitals", "doctor escalation note"],
    risks: ["SpO2 drop", "BP low", "GCS change", "delayed transport"],
  },
  "Post-surgical unit": {
    title: "OT/Post-op to ICU",
    detailLabel: "Surgery/anesthesia handover",
    handoverLabel: "OT handover by",
    readinessFocus: ["ventilator", "drain chart", "blood loss note", "analgesia/vasopressor plan"],
    risks: ["airway risk", "bleeding", "post-op shock", "anesthesia note pending"],
  },
  "HDU step-up": {
    title: "HDU to ICU",
    detailLabel: "HDU escalation reason",
    handoverLabel: "HDU handover by",
    readinessFocus: ["oxygen escalation", "vasopressor need", "monitor continuity", "repeat ABG"],
    risks: ["increasing oxygen demand", "renal watch", "fluid overload", "line access issue"],
  },
  "External hospital transfer": {
    title: "External hospital transfer",
    detailLabel: "Referral / ambulance summary",
    handoverLabel: "Transfer handover by",
    readinessFocus: ["acceptance note", "ambulance ETA", "outside reports", "receive team alert"],
    risks: ["identity mismatch", "missing imaging", "ventilator during transfer", "bed hold time"],
  },
  "Direct ICU admission": {
    title: "Planned/direct ICU admission",
    detailLabel: "Planned ICU indication",
    handoverLabel: "Admission coordinator",
    readinessFocus: ["bed reservation", "insurance/consent", "doctor order", "nurse receive checklist"],
    risks: ["billing hold", "late arrival", "bed reservation expiry", "procedure timing"],
  },
};
const admissionHandoverOptions: Record<string, string[]> = {
  Emergency: ["ER Nurse Ritu", "ER Duty Doctor + ER Nurse Ritu", "ER Charge Nurse Pooja", "Emergency Desk Coordinator"],
  "Emergency direct ICU": ["ER Duty Doctor + ER Nurse Ritu", "ER Charge Nurse Pooja + ICU Doctor", "Code Blue Team Lead", "Emergency Desk Coordinator"],
  "General ward": ["Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Doctor + Ward Nurse", "Floor Coordinator"],
  "Post-surgical unit": ["OT Nurse Sanjana", "Anesthetist + OT Nurse", "Recovery Nurse Lead", "Surgical Team Coordinator"],
  "HDU step-up": ["HDU Nurse Lead", "HDU Duty Doctor + Nurse", "Step-up Coordinator", "Respiratory Therapist"],
  "External hospital transfer": ["Referring hospital coordinator", "Ambulance paramedic", "External hospital duty doctor", "Transfer desk coordinator"],
  "Direct ICU admission": ["Admission coordinator", "ICU duty doctor", "Billing + admission desk", "Consultant secretary"],
};
const alertStatusFlow: WorkflowAlertStatus[] = ["New", "Acknowledged", "Assigned", "Resolved", "Closed"];
const medicationDepartments: MedicationDepartment[] = ["ICU", "Emergency", "Cardiology", "Neurology", "Pediatrics", "Surgery", "Anesthesia"];
const medicationShiftOptions = ["All shifts", "Morning", "Evening", "Night"] as const;

type NurseTaskSource =
  | "Doctor order"
  | "Medication / eMAR"
  | "Vitals / monitoring"
  | "Intake / output"
  | "IV / infusion"
  | "Blood transfusion"
  | "Lab / radiology"
  | "Shift handover"
  | "Admission / transfer"
  | "Head nurse supervision"
  | "Manual nursing care";

type NurseTaskScenario = {
  id: string;
  source: NurseTaskSource;
  taskType: string;
  title: string;
  priority: IcuTask["priority"];
  dueTime: string;
  repeat: string;
  escalation: string;
  remarks: string;
  contextLabel: string;
  contextOptions: string[];
};

type NurseTaskDraft = {
  patientId: string;
  source: NurseTaskSource;
  scenarioId: string;
  taskType: string;
  title: string;
  priority: IcuTask["priority"];
  assignedBy: string;
  assignedByRole: string;
  assignedTo: string;
  assignedToRole: string;
  assignmentReason: string;
  dueDate: string;
  dueTime: string;
  repeat: string;
  escalation: string;
  escalationOwner: string;
  requiresAcknowledgement: boolean;
  context: string;
  notes: string;
};

type TaskBoardTab = "dashboard" | "create" | "assessments";
type TaskActionState = { task: IcuTask; nextStatus: IcuTask["status"] } | null;
type AssessmentStatus = "Draft" | "Completed" | "Needs follow-up" | "Escalated";
type NursingAssessmentType =
  | "Neuro assessment"
  | "Respiratory assessment"
  | "Pain assessment"
  | "Skin / pressure risk"
  | "Fall risk"
  | "Line / device assessment"
  | "Nutrition assessment"
  | "Infection assessment"
  | "Transfer readiness";

type NursingAssessmentRecord = {
  id: string;
  patientId: string;
  patientLabel: string;
  bedNo: string;
  type: NursingAssessmentType;
  score: string;
  risk: IcuTask["priority"];
  status: AssessmentStatus;
  findings: string;
  intervention: string;
  followUp: string;
  nurse: string;
  createdAt: string;
};

const nursingAssessmentTypes: NursingAssessmentType[] = [
  "Neuro assessment",
  "Respiratory assessment",
  "Pain assessment",
  "Skin / pressure risk",
  "Fall risk",
  "Line / device assessment",
  "Nutrition assessment",
  "Infection assessment",
  "Transfer readiness",
];
const defaultTaskBoardTab: TaskBoardTab = "dashboard";

function normalizeTaskBoardTab(tab?: string | null): TaskBoardTab {
  if (tab === "create" || tab === "assessments") return tab;
  return defaultTaskBoardTab;
}

const nurseTaskScenarios: NurseTaskScenario[] = [
  { id: "doctor-repeat-vitals", source: "Doctor order", taskType: "Vitals monitoring", title: "Repeat vitals as per doctor instruction", priority: "High", dueTime: "Next 15 min", repeat: "Every 15 min until stable", escalation: "Escalate to duty doctor if BP, SpO2, GCS, or pulse worsens", remarks: "Doctor instruction follow-up", contextLabel: "Doctor instruction", contextOptions: ["Repeat vitals every 15 minutes", "Hourly neuro checks", "Prepare transfer after review", "Keep NPO and inform surgeon"] },
  { id: "doctor-result-followup", source: "Doctor order", taskType: "Result review follow-up", title: "Follow up pending report and inform doctor", priority: "High", dueTime: "Next 30 min", repeat: "One time", escalation: "Escalate if result is delayed or critical", remarks: "Pending report follow-up", contextLabel: "Pending result", contextOptions: ["ABG report", "CBC report", "Electrolyte report", "Portable X-ray report"] },
  { id: "medication-due", source: "Medication / eMAR", taskType: "Medication administration", title: "Administer due medication", priority: "High", dueTime: "Now", repeat: "As per MAR schedule", escalation: "Escalate if medicine unavailable or patient condition changes", remarks: "Medication due from eMAR", contextLabel: "Medicine", contextOptions: ["Meropenem IV", "Noradrenaline infusion", "Mannitol IV", "Pantoprazole IV"] },
  { id: "medication-verify", source: "Medication / eMAR", taskType: "High-risk double verification", title: "Complete high-risk medicine double verification", priority: "Critical", dueTime: "Now", repeat: "Before administration", escalation: "Escalate to head nurse if second verifier unavailable", remarks: "High-risk medicine safety check", contextLabel: "Verification item", contextOptions: ["Vasopressor infusion", "Insulin infusion", "Pediatric antibiotic dose", "Blood product medication"] },
  { id: "vitals-abnormal", source: "Vitals / monitoring", taskType: "Abnormal vitals escalation", title: "Recheck abnormal vitals and escalate if persistent", priority: "Critical", dueTime: "Now", repeat: "Every 15 min until stable", escalation: "Escalate immediately if SpO2 < 92, MAP < 65, GCS drop, or pulse > 130", remarks: "Triggered from abnormal monitoring values", contextLabel: "Abnormal parameter", contextOptions: ["SpO2 low", "BP low", "Pulse high", "GCS drop", "Fever spike"] },
  { id: "vitals-routine", source: "Vitals / monitoring", taskType: "Routine vitals charting", title: "Record scheduled vitals", priority: "Medium", dueTime: "Next 1 hour", repeat: "Hourly", escalation: "Escalate if any parameter crosses threshold", remarks: "Scheduled ICU monitoring", contextLabel: "Vitals set", contextOptions: ["Full vitals", "GCS and neuro vitals", "Pain score", "Blood sugar"] },
  { id: "io-urine", source: "Intake / output", taskType: "Urine output review", title: "Check and document urine output", priority: "High", dueTime: "Next 1 hour", repeat: "Hourly", escalation: "Escalate if urine output < 0.5 ml/kg/hr or sudden drop", remarks: "Fluid balance and renal watch", contextLabel: "I/O item", contextOptions: ["Foley urine output", "External catheter output", "Urinal output", "Low urine review"] },
  { id: "io-drain", source: "Intake / output", taskType: "Drain monitoring", title: "Record drain output and character", priority: "Medium", dueTime: "Next 2 hours", repeat: "Every 2 hours", escalation: "Escalate if sudden increase, fresh blood, or blockage", remarks: "Drain output monitoring", contextLabel: "Drain", contextOptions: ["Chest drain", "Surgical drain", "NG aspirate", "Wound soakage"] },
  { id: "infusion-pump", source: "IV / infusion", taskType: "Infusion pump check", title: "Check infusion pump, line patency, and rate", priority: "High", dueTime: "Next 30 min", repeat: "Hourly", escalation: "Escalate if pump alarm, infiltration, wrong rate, or drug interruption", remarks: "Infusion safety check", contextLabel: "Infusion", contextOptions: ["Noradrenaline infusion", "Maintenance IV fluid", "Antibiotic infusion", "Insulin infusion"] },
  { id: "blood-15min", source: "Blood transfusion", taskType: "Blood transfusion monitoring", title: "Record transfusion vitals and reaction check", priority: "Critical", dueTime: "Next 15 min", repeat: "15 min, 30 min, hourly, completion", escalation: "Stop transfusion and inform doctor if reaction suspected", remarks: "Blood safety monitoring", contextLabel: "Blood component", contextOptions: ["PRBC unit", "FFP unit", "Platelet unit", "Transfusion completion vitals"] },
  { id: "lab-sample", source: "Lab / radiology", taskType: "Lab sample collection", title: "Collect sample and update dispatch status", priority: "Medium", dueTime: "Next 30 min", repeat: "One time", escalation: "Escalate if sample cannot be collected or transport delayed", remarks: "Lab coordination", contextLabel: "Investigation", contextOptions: ["ABG", "CBC", "Electrolytes", "Blood culture", "Troponin"] },
  { id: "radiology-portable", source: "Lab / radiology", taskType: "Radiology coordination", title: "Coordinate portable imaging and report follow-up", priority: "Medium", dueTime: "Next 1 hour", repeat: "One time", escalation: "Escalate if portable team delayed or report critical", remarks: "Radiology coordination", contextLabel: "Imaging", contextOptions: ["Portable chest X-ray", "CT brain", "Ultrasound abdomen", "Echo"] },
  { id: "handover-carry", source: "Shift handover", taskType: "Shift handover task", title: "Carry forward pending handover task", priority: "High", dueTime: "Start of shift", repeat: "Until completed", escalation: "Escalate to head nurse if pending beyond current shift", remarks: "Carried forward from previous nurse", contextLabel: "Handover item", contextOptions: ["Pending medication", "Pending ABG report", "Pending family update", "Pending transfer checklist"] },
  { id: "admission-check", source: "Admission / transfer", taskType: "Admission checklist", title: "Complete ICU admission checklist", priority: "High", dueTime: "Next 30 min", repeat: "One time", escalation: "Escalate if bed/device/doctor assignment incomplete", remarks: "Admission readiness", contextLabel: "Checklist", contextOptions: ["Bedside monitor ready", "Oxygen and suction ready", "Initial vitals", "Allergy and ID band"] },
  { id: "transfer-clearance", source: "Admission / transfer", taskType: "Transfer clearance", title: "Prepare transfer checklist and nursing handover", priority: "Routine", dueTime: "Today", repeat: "One time", escalation: "Escalate if ward bed, transport, pharmacy, or documents pending", remarks: "Transfer readiness", contextLabel: "Transfer item", contextOptions: ["Ward transfer", "Step-down transfer", "OT transfer", "Discharge lounge"] },
  { id: "head-docs", source: "Head nurse supervision", taskType: "Documentation completion", title: "Complete missing nursing documentation", priority: "Medium", dueTime: "Before shift end", repeat: "End of shift", escalation: "Escalate if documentation remains incomplete at handover", remarks: "Head nurse supervision", contextLabel: "Documentation", contextOptions: ["Vitals chart missing", "I/O chart missing", "Medication note missing", "Handover note pending"] },
  { id: "head-workload", source: "Head nurse supervision", taskType: "Workload reassignment", title: "Review workload and reassign unsafe task load", priority: "High", dueTime: "Now", repeat: "As needed", escalation: "Head nurse to reassign or add support nurse", remarks: "Workload safety", contextLabel: "Workload issue", contextOptions: ["Too many critical tasks", "Overdue medication queue", "Multiple ventilated patients", "Break coverage"] },
  { id: "manual-care", source: "Manual nursing care", taskType: "Nursing care", title: "Complete routine nursing care task", priority: "Routine", dueTime: "Next 2 hours", repeat: "Per care plan", escalation: "Escalate if patient refuses or condition prevents care", remarks: "Manual nursing task", contextLabel: "Care item", contextOptions: ["Oral care", "Repositioning", "Back care", "Hygiene care", "Family update"] },
  { id: "manual-device", source: "Manual nursing care", taskType: "Device / line care", title: "Check device, dressing, and line safety", priority: "Medium", dueTime: "Next 2 hours", repeat: "Per shift", escalation: "Escalate if redness, leak, dislodgement, blockage, or infection signs", remarks: "Device and line care", contextLabel: "Device", contextOptions: ["Central line dressing", "Foley catheter care", "ET tube tie check", "NG tube position"] },
];

const deviceRows = [
  { id: "dev-001", bedNo: "ICU-A01", patientName: "Aisha Khan", monitor: "Online", ventilator: "NIV connected", infusionPump: "Online", lastData: "1 min ago", signal: "Good" },
  { id: "dev-002", bedNo: "ICU-A02", patientName: "Rohan Das", monitor: "Online", ventilator: "Invasive connected", infusionPump: "Online", lastData: "40 sec ago", signal: "Good" },
  { id: "dev-003", bedNo: "ICU-B03", patientName: "Meera Sharma", monitor: "Delayed", ventilator: "Oxygen mask", infusionPump: "Offline", lastData: "12 min ago", signal: "Delayed" },
  { id: "dev-004", bedNo: "ICU-B04", patientName: "Kabir Ali", monitor: "Online", ventilator: "Room air", infusionPump: "Not mapped", lastData: "3 min ago", signal: "Review" },
];

function compactDateStamp(date = new Date()) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function admissionSequence(date = new Date()) {
  return String(date.getTime()).slice(-4).padStart(4, "0");
}

function generateIcuMrn(source: string, date = new Date()) {
  const prefixMap: Record<string, string> = {
    Emergency: "PLH-ER",
    "Emergency direct ICU": "PLH-ERD",
    "General ward": "PLH-IPD",
    "Post-surgical unit": "PLH-OT",
    "HDU step-up": "PLH-HDU",
    "External hospital transfer": "PLH-EXT",
    "Direct ICU admission": "PLH-ICU",
    "Unknown emergency patient": "TEMP-ICU",
  };
  return `${prefixMap[source] ?? "PLH-ICU"}-${compactDateStamp(date)}-${admissionSequence(date)}`;
}

function generateIcuAdmissionNo(date = new Date()) {
  return `ICU-ADM-${compactDateStamp(date)}-${admissionSequence(date)}`;
}

function generatedAdmissionIdentity(source: string) {
  const date = new Date();
  return {
    mrn: generateIcuMrn(source, date),
    icuAdmissionNo: generateIcuAdmissionNo(date),
  };
}

function createEmergencyAdmissionQuickDraft(patientName = ""): EmergencyAdmissionQuickDraft {
  return {
    patientName,
    ageGender: "",
    mobile: "",
    relativeName: "",
    diagnosis: "",
    allergy: "",
  };
}

function admissionDefaultPastMedication(candidate?: AdmissionPatientCandidate) {
  if (!candidate) return "Not documented";
  if (candidate.diagnosis.toLowerCase().includes("cabg")) return "Aspirin, statin, beta blocker as per cardiac history";
  if (candidate.diagnosis.toLowerCase().includes("transplant")) return "Pre-transplant immunosuppression and renal medicines";
  if (candidate.diagnosis.toLowerCase().includes("copd")) return "Inhaler therapy and steroid course history";
  if (candidate.diagnosis.toLowerCase().includes("dka")) return "Insulin and electrolyte replacement history";
  return "Previous medication history to be verified with attendant / prior chart";
}

function admissionDefaultHighAlertMedication(candidate?: AdmissionPatientCandidate) {
  const text = `${candidate?.diagnosis ?? ""} ${candidate?.medication ?? ""}`.toLowerCase();
  if (text.includes("vasopressor") || text.includes("shock")) return "Noradrenaline / vasopressor double verification required";
  if (text.includes("insulin") || text.includes("dka")) return "Insulin infusion and potassium replacement double verification";
  if (text.includes("transplant") || text.includes("tacrolimus")) return "Tacrolimus and immunosuppression timing watch";
  if (text.includes("mannitol") || text.includes("stroke")) return "Mannitol / hyperosmolar therapy watch";
  return "None currently identified";
}

function admissionDefaultOtherRelevantInformation(candidate?: AdmissionPatientCandidate) {
  if (!candidate) return "";
  return `${candidate.source} arrival from ${candidate.currentLocation}. ${candidate.sourceDetail}`;
}

function admissionDefaultProcedures(candidate?: AdmissionPatientCandidate) {
  const text = `${candidate?.diagnosis ?? ""} ${candidate?.source ?? ""}`.toLowerCase();
  if (text.includes("cabg") || text.includes("post-surgical")) return "Post-operative lines/drains and surgical handover to be verified";
  if (text.includes("emergency")) return "Emergency stabilization procedures and airway/line status to be documented";
  if (text.includes("stroke")) return "Neuro imaging / airway protection procedure status to be reviewed";
  return "No procedure documented at admission";
}

function admissionDefaultPendingInvestigations(candidate?: AdmissionPatientCandidate) {
  const text = `${candidate?.diagnosis ?? ""} ${candidate?.sourceDetail ?? ""}`.toLowerCase();
  if (text.includes("septic") || text.includes("shock")) return "ABG, lactate, blood culture, CBC, renal function";
  if (text.includes("cabg") || text.includes("post-surgical")) return "ABG, electrolytes, chest X-ray, drain output review";
  if (text.includes("stroke") || text.includes("gcs")) return "CT/MRI review, electrolytes, coagulation profile, neuro observation chart";
  if (text.includes("transplant")) return "Tacrolimus level, renal function, urine trend, infection markers";
  if (text.includes("respiratory") || text.includes("copd")) return "ABG, chest X-ray, electrolytes, sputum culture if indicated";
  return "Pending investigation list to be updated after admission review";
}

function admissionDefaultPlannedCare(candidate?: AdmissionPatientCandidate) {
  const text = `${candidate?.diagnosis ?? ""} ${candidate?.condition ?? ""}`.toLowerCase();
  if (text.includes("septic") || text.includes("shock")) return "Sepsis bundle, strict vitals, fluid/vasopressor review, antibiotic timing";
  if (text.includes("cabg")) return "Post-operative monitoring, ventilation/ABG review, drain and transfusion watch";
  if (text.includes("stroke")) return "Neuro checks, aspiration precautions, BP/GCS monitoring, imaging follow-up";
  if (text.includes("transplant")) return "Protective care, immunosuppression timing, renal output and infection surveillance";
  if (text.includes("respiratory") || text.includes("copd")) return "NIV/oxygen support, ABG follow-up, bronchodilator and escalation readiness";
  return "ICU monitoring, nursing care plan, medication reconciliation, and consultant review";
}

function createEmptyAdmissionDraft(): AdmissionDraft {
  const source = "Emergency";
  const identity = generatedAdmissionIdentity(source);
  return {
    patientId: "",
    patientName: "",
    mrn: "",
    icuAdmissionNo: identity.icuAdmissionNo,
    ageGender: "",
    source,
    currentLocation: "",
    patientStatus: "ICU request pending",
    sourceDetail: "",
    handoverBy: getAdmissionHandoverOptions(source)[0],
    diagnosis: "",
    condition: "Critical",
    recoveryStatus: "Other",
    pendingInvestigations: "",
    plannedCareTreatment: "",
    bedNo: "ICU-C05",
    unit: "Medical ICU",
    nurse: "Unit Nurse Priya",
    doctor: "Dr. Sameer Mehta",
    admittingConsultant: "Dr. Sameer Mehta",
    admittingTeam: normalizeAdmittingUnit(getAdmittingTeamDefault(source, "Medical ICU")),
    acceptanceStatus: "Pending ICU doctor acceptance",
    ventilator: "NIV support",
    devices: "Monitor, infusion pump",
    medication: "",
    pastMedication: "",
    currentMedication: "",
    allergy: "",
    highAlertMedications: "",
    otherRelevantInformation: "",
    procedures: "",
    handedOver: "ER nurse / source unit team",
    takenOverBy: "Unit Nurse Priya",
    signatureConfirmation: "Pending bedside confirmation",
    nursingNotes: "",
    risk: "High",
    isolation: "No",
    readiness: admissionReadinessItems.slice(0, 4).join("|"),
    notes: "",
  };
}

function createEmergencyAdmissionCandidate(form: EmergencyAdmissionQuickDraft, index: number): AdmissionPatientCandidate {
  const identity = generatedAdmissionIdentity("Emergency direct ICU");
  const contactNote = [form.mobile.trim(), form.relativeName.trim()].filter(Boolean).join(" | ");

  return {
    id: `emergency-icu-${Date.now()}-${index + 1}`,
    patientName: form.patientName.trim(),
    mrn: identity.mrn,
    ageGender: form.ageGender.trim(),
    source: "Emergency direct ICU",
    currentLocation: "Emergency triage red zone",
    patientStatus: "Emergency direct ICU",
    diagnosis: form.diagnosis.trim(),
    condition: "Critical",
    unit: "Medical ICU",
    bedNo: "ICU-C05",
    nurse: "Unit Nurse Priya",
    doctor: "Dr. Sameer Mehta",
    admittingTeam: "ER + ICU rapid admit unit",
    ventilator: "NIV support",
    devices: "Monitor, oxygen, suction",
    medication: "",
    risk: "Critical",
    isolation: "No",
    sourceDetail: contactNote || "Emergency direct ICU admission",
    handoverBy: "ER nurse / source unit team",
    acceptanceStatus: "Pending ICU doctor acceptance",
    notes: contactNote,
    allergy: form.allergy.trim(),
  };
}

function getAdmissionCandidate(patientId: string) {
  return admissionPatientCandidates.find((patient) => patient.id === patientId);
}

function applyAdmissionCandidate(candidate: AdmissionPatientCandidate): AdmissionDraft {
  return {
    patientId: candidate.id,
    patientName: candidate.patientName,
    mrn: candidate.mrn,
    icuAdmissionNo: generatedAdmissionIdentity(candidate.source).icuAdmissionNo,
    ageGender: candidate.ageGender,
    source: candidate.source,
    currentLocation: candidate.currentLocation,
    patientStatus: candidate.patientStatus,
    sourceDetail: candidate.sourceDetail,
    handoverBy: candidate.handoverBy,
    diagnosis: candidate.diagnosis,
    condition: candidate.condition,
    recoveryStatus: candidate.condition === "Ready for transfer" ? "Revived" : candidate.condition === "Stable ICU care" ? "Reviving" : "Other",
    pendingInvestigations: admissionDefaultPendingInvestigations(candidate),
    plannedCareTreatment: admissionDefaultPlannedCare(candidate),
    bedNo: candidate.bedNo,
    unit: candidate.unit,
    nurse: candidate.nurse,
    doctor: candidate.doctor,
    admittingConsultant: candidate.doctor,
    admittingTeam: normalizeAdmittingUnit(candidate.admittingTeam),
    acceptanceStatus: candidate.acceptanceStatus,
    ventilator: candidate.ventilator,
    devices: candidate.devices,
    medication: candidate.medication,
    pastMedication: admissionDefaultPastMedication(candidate),
    currentMedication: candidate.medication,
    allergy: candidate.allergy ?? "",
    highAlertMedications: admissionDefaultHighAlertMedication(candidate),
    otherRelevantInformation: admissionDefaultOtherRelevantInformation(candidate),
    procedures: admissionDefaultProcedures(candidate),
    handedOver: candidate.handoverBy,
    takenOverBy: candidate.nurse,
    signatureConfirmation: candidate.duplicateBlock ? "Blocked until active admission reviewed" : "Pending bedside confirmation",
    nursingNotes: candidate.notes,
    risk: candidate.risk,
    isolation: candidate.isolation,
    readiness: candidate.duplicateBlock ? "" : admissionReadinessItems.slice(0, 4).join("|"),
    notes: candidate.notes,
  };
}

function getAdmissionBed(bedNo: string) {
  return icuAdmissionBedOptions.find((bed) => bed.bedNo === bedNo);
}

function isAdmissionBedAssignable(bed: IcuAdmissionBedOption) {
  return bed.status === "Available" || bed.status === "Isolation available";
}

function getAssignableAdmissionBedsForUnit(unit: string) {
  return icuAdmissionBedOptions.filter((bed) => bed.unit === unit && isAdmissionBedAssignable(bed));
}

function getAdmissionScenario(source: string) {
  return admissionSourceScenarios[source] ?? admissionSourceScenarios.Emergency;
}

function getAdmissionHandoverOptions(source: string, current?: string) {
  return Array.from(new Set([current, ...(admissionHandoverOptions[source] ?? admissionHandoverOptions.Emergency)].filter(Boolean) as string[]));
}

function getAdmittingTeamDefault(source: string, unit?: string) {
  if (source === "Emergency direct ICU" || source === "Emergency") return "ER + ICU rapid admit unit";
  if (source === "External hospital transfer") return "External transfer receive unit";
  if (unit === "General ICU") return "General ICU admitting unit";
  if (unit === "Cardiothoracic ICU") return "Cardiothoracic ICU admitting unit";
  if (unit === "Pediatric ICU") return "Pediatric ICU admitting unit";
  if (unit === "Neuro ICU") return "Neuro ICU admitting unit";
  if (unit === "Transplant ICU") return "Transplant ICU admitting unit";
  if (unit === "Respiratory ICU") return "Respiratory ICU admitting unit";
  if (unit === "Surgical ICU") return "Surgical ICU admitting unit";
  if (unit === "Isolation ICU") return "Isolation ICU admitting unit";
  return "Medical ICU admitting unit";
}

function normalizeAdmittingUnit(value?: string) {
  if (!value) return "Medical ICU admitting unit";
  return value.replace("rapid admit team", "rapid admit unit").replace("receive team", "receive unit").replace("admitting team", "admitting unit");
}

function getReadinessValues(readiness: string) {
  return readiness.split("|").map((item) => item.trim()).filter(Boolean);
}

function readinessComplete(readiness: string) {
  const selected = getReadinessValues(readiness);
  return selected.length >= admissionReadinessItems.length;
}

function getAdmissionBlockReason(draft: AdmissionDraft, created: Array<AdmissionDraft & { id: string; status: string }>) {
  const candidate = getAdmissionCandidate(draft.patientId);
  const bed = getAdmissionBed(draft.bedNo);
  const missingRequired = admissionRequiredFields.some((key) => key !== "readiness" && !draft[key]);

  if (candidate?.duplicateBlock || draft.patientStatus === "Already admitted") return "Patient already has an active ICU admission. Use current admission or transfer workflow.";
  if (missingRequired) return "Complete all required ICU admission fields before admitting.";
  if (created.some((record) => record.mrn === draft.mrn)) return "This MRN already has an admission created in this session.";
  if (!bed) return "Select a valid ICU bed.";
  if (bed.status !== "Available" && bed.status !== "Isolation available") return `${bed.bedNo} is ${bed.status.toLowerCase()}. Select an available bed.`;
  if (draft.isolation !== "No" && bed.status !== "Isolation available") return "Isolation precaution selected. Use an isolation-capable bed or update isolation requirement.";
  if (!readinessComplete(draft.readiness)) return "Complete all ICU readiness checklist items before admitting.";
  return "";
}

function admissionCandidateLabel(patientId: string) {
  const patient = getAdmissionCandidate(patientId);
  if (!patient) return patientId;
  return `${patient.patientName} | ${patient.mrn} | ${patient.currentLocation}`;
}

function admissionBedLabel(bedNo: string) {
  const bed = getAdmissionBed(bedNo);
  if (!bed) return bedNo;
  return `${bed.bedNo} | ${bed.unit} | ${bed.status} | ${bed.capability}`;
}

function admissionBedTone(status?: IcuAdmissionBedOption["status"]): StatusTone {
  if (status === "Available" || status === "Isolation available") return "success";
  if (status === "Cleaning" || status === "Transfer pending" || status === "Reserved") return "warning";
  if (status === "Occupied") return "danger";
  return "muted";
}

function admissionPatientTone(status?: AdmissionPatientState): StatusTone {
  if (status === "Already admitted") return "danger";
  if (status === "Emergency direct ICU") return "critical";
  if (status === "External transfer accepted" || status === "ICU request pending") return "info";
  if (status === "ER stabilization" || status === "Ward deterioration" || status === "Post-op recovery") return "warning";
  return "success";
}

const patientMedicationProfiles: PatientMedicationProfile[] = [
  { patientId: "icu-001", weightKg: 32, allergies: ["Piperacillin/Tazobactam"], renalStatus: "Watch", liverStatus: "Normal", feedingStatus: "NG feeds", ageGroup: "Pediatric" },
  { patientId: "icu-002", weightKg: 76, allergies: ["Heparin"], renalStatus: "Normal", liverStatus: "Watch", feedingStatus: "NPO", ageGroup: "Adult" },
  { patientId: "icu-003", weightKg: 61, allergies: ["Mannitol"], renalStatus: "Dose adjustment", liverStatus: "Normal", feedingStatus: "NG feeds", ageGroup: "Geriatric" },
  { patientId: "icu-004", weightKg: 68, allergies: [], renalStatus: "Normal", liverStatus: "Normal", feedingStatus: "Oral allowed", ageGroup: "Adult" },
];

const pharmacyFormulary: FormularyMedicine[] = [
  {
    id: "med-meropenem",
    name: "Meropenem",
    genericName: "Meropenem",
    departments: ["ICU", "Emergency", "Surgery", "Pediatrics"],
    defaultDose: "1 g",
    route: "IV",
    frequency: "q8h",
    orderType: "Scheduled",
    scheduleTimes: "08:00, 16:00, 00:00",
    indication: "Severe sepsis / hospital-acquired infection",
    instructions: "Restricted antibiotic. Capture indication and review after culture report.",
    pharmacyLocation: "ICU Pharmacy",
    stockQty: 12,
    stockUnit: "vials",
    availability: "Restricted",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: true,
    alternatives: ["Ceftriaxone", "Piperacillin/Tazobactam"],
    safetyFlags: ["Restricted antibiotic", "Culture review required"],
    renalDoseNote: "Review dose if renal function worsens.",
    pediatricDoseNote: "Confirm pediatric weight-based dose.",
  },
  {
    id: "med-noradrenaline",
    name: "Noradrenaline",
    genericName: "Norepinephrine",
    departments: ["ICU", "Emergency", "Anesthesia"],
    defaultDose: "Titrate 0.05 mcg/kg/min",
    route: "Infusion",
    frequency: "Continuous",
    orderType: "Continuous",
    scheduleTimes: "Running",
    indication: "MAP support / shock",
    instructions: "Use infusion pump. Enter MAP target, max rate, and central/peripheral line plan.",
    pharmacyLocation: "ICU High-alert Bin",
    stockQty: 8,
    stockUnit: "ampoules",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Dobutamine", "Adrenaline"],
    safetyFlags: ["High-alert vasopressor", "Pump required", "Double verification"],
  },
  {
    id: "med-insulin-regular",
    name: "Insulin regular",
    genericName: "Human regular insulin",
    departments: ["ICU", "Emergency", "Pediatrics", "Surgery"],
    defaultDose: "Sliding scale",
    route: "SC",
    frequency: "Before meals",
    orderType: "Scheduled",
    scheduleTimes: "12:00, 18:00",
    indication: "Hyperglycemia protocol",
    instructions: "Check blood sugar before administration. Double verify dose.",
    pharmacyLocation: "ICU Refrigerator",
    stockQty: 22,
    stockUnit: "vials",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Insulin infusion protocol"],
    safetyFlags: ["High-alert insulin", "Blood sugar mandatory", "Double verification"],
    pediatricDoseNote: "Use pediatric sliding scale for weight under 40 kg.",
  },
  {
    id: "med-paracetamol",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    departments: ["ICU", "Emergency", "Pediatrics", "Surgery"],
    defaultDose: "650 mg",
    route: "Oral/NG",
    frequency: "SOS fever",
    orderType: "PRN",
    scheduleTimes: "PRN",
    indication: "Fever or pain",
    instructions: "Document temperature or pain score. Keep daily max dose in note.",
    pharmacyLocation: "Main Pharmacy",
    stockQty: 140,
    stockUnit: "tablets",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["IV Paracetamol"],
    safetyFlags: ["PRN indication mandatory"],
    npoWarning: "Patient is NPO; consider IV route.",
  },
  {
    id: "med-pantoprazole",
    name: "Pantoprazole",
    genericName: "Pantoprazole",
    departments: ["ICU", "Surgery", "Emergency"],
    defaultDose: "40 mg",
    route: "IV",
    frequency: "OD",
    orderType: "Scheduled",
    scheduleTimes: "09:00",
    indication: "Stress ulcer prophylaxis",
    instructions: "Administer once daily before feeds.",
    pharmacyLocation: "ICU Pharmacy",
    stockQty: 55,
    stockUnit: "vials",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Omeprazole"],
    safetyFlags: ["Routine prophylaxis"],
  },
  {
    id: "med-mannitol",
    name: "Mannitol",
    genericName: "Mannitol",
    departments: ["ICU", "Neurology", "Emergency"],
    defaultDose: "100 ml",
    route: "IV",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: "11:00, 23:00",
    indication: "Raised ICP watch",
    instructions: "Check urine output and serum osmolality before dose.",
    pharmacyLocation: "Neuro ICU Pharmacy",
    stockQty: 0,
    stockUnit: "bottles",
    availability: "Out of stock",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Hypertonic saline"],
    safetyFlags: ["Osmolality review", "Urine output check"],
    renalDoseNote: "Avoid or review urgently in renal impairment.",
  },
  {
    id: "med-heparin",
    name: "Heparin",
    genericName: "Unfractionated heparin",
    departments: ["ICU", "Cardiology", "Surgery"],
    defaultDose: "5000 units",
    route: "SC",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: "10:00, 22:00",
    indication: "DVT prophylaxis",
    instructions: "Check platelet count, bleeding risk, and allergy before first dose.",
    pharmacyLocation: "Cardiothoracic ICU Pharmacy",
    stockQty: 18,
    stockUnit: "vials",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Enoxaparin"],
    safetyFlags: ["High-alert anticoagulant", "Platelet count review"],
  },
  {
    id: "med-levetiracetam",
    name: "Levetiracetam",
    genericName: "Levetiracetam",
    departments: ["ICU", "Neurology", "Emergency", "Pediatrics"],
    defaultDose: "500 mg",
    route: "IV",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: "09:00, 21:00",
    indication: "Seizure prophylaxis",
    instructions: "Review renal dosing and seizure chart.",
    pharmacyLocation: "Neuro ICU Pharmacy",
    stockQty: 6,
    stockUnit: "vials",
    availability: "Low stock",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Phenytoin"],
    safetyFlags: ["Low stock", "Renal dose review"],
    renalDoseNote: "Dose adjustment required in renal impairment.",
  },
  {
    id: "med-potassium-chloride",
    name: "Potassium chloride concentrate",
    genericName: "Potassium chloride",
    departments: ["ICU", "Emergency", "Cardiology", "Anesthesia"],
    defaultDose: "20 mEq diluted",
    route: "Infusion",
    frequency: "As per potassium protocol",
    orderType: "Scheduled",
    scheduleTimes: "Now",
    indication: "Hypokalemia correction",
    instructions: "Never administer undiluted. Pump and double verification required.",
    pharmacyLocation: "High-alert Locked Cabinet",
    stockQty: 5,
    stockUnit: "ampoules",
    availability: "Restricted",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: true,
    alternatives: ["Oral potassium"],
    safetyFlags: ["High-alert electrolyte", "Dilution mandatory", "Pump required"],
    renalDoseNote: "Review dose if urine output is low or renal impairment exists.",
  },
  {
    id: "med-propofol",
    name: "Propofol",
    genericName: "Propofol",
    departments: ["ICU", "Anesthesia", "Surgery"],
    defaultDose: "Titrate 5-50 mcg/kg/min",
    route: "Infusion",
    frequency: "Continuous",
    orderType: "Continuous",
    scheduleTimes: "Running",
    indication: "Sedation",
    instructions: "Record sedation target, triglyceride monitoring, and airway plan.",
    pharmacyLocation: "Anesthesia Drug Trolley",
    stockQty: 7,
    stockUnit: "vials",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Midazolam"],
    safetyFlags: ["Sedation infusion", "Airway monitoring"],
  },
  {
    id: "med-midazolam",
    name: "Midazolam",
    genericName: "Midazolam",
    departments: ["ICU", "Emergency", "Anesthesia", "Pediatrics"],
    defaultDose: "1 mg",
    route: "IV",
    frequency: "PRN agitation",
    orderType: "PRN",
    scheduleTimes: "PRN",
    indication: "Agitation / procedural sedation",
    instructions: "Document sedation score and respiratory monitoring.",
    pharmacyLocation: "Controlled Drug Cabinet",
    stockQty: 3,
    stockUnit: "ampoules",
    availability: "Low stock",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: true,
    alternatives: ["Dexmedetomidine"],
    safetyFlags: ["Controlled drug", "Respiratory monitoring", "Low stock"],
  },
  {
    id: "med-furosemide",
    name: "Furosemide",
    genericName: "Furosemide",
    departments: ["ICU", "Cardiology", "Emergency"],
    defaultDose: "20 mg",
    route: "IV",
    frequency: "OD",
    orderType: "Scheduled",
    scheduleTimes: "10:00",
    indication: "Fluid overload",
    instructions: "Review BP, potassium, and urine output before dose.",
    pharmacyLocation: "ICU Pharmacy",
    stockQty: 28,
    stockUnit: "ampoules",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Torsemide"],
    safetyFlags: ["Electrolyte review"],
    renalDoseNote: "Monitor response and electrolytes in renal dysfunction.",
  },
  {
    id: "med-ceftriaxone",
    name: "Ceftriaxone",
    genericName: "Ceftriaxone",
    departments: ["Emergency", "Surgery", "Pediatrics", "ICU"],
    defaultDose: "1 g",
    route: "IV",
    frequency: "BD",
    orderType: "Scheduled",
    scheduleTimes: "08:00, 20:00",
    indication: "Bacterial infection",
    instructions: "Review culture and allergy history before first dose.",
    pharmacyLocation: "Main Pharmacy",
    stockQty: 34,
    stockUnit: "vials",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Meropenem"],
    safetyFlags: ["Antibiotic review"],
    pediatricDoseNote: "Use pediatric dose by weight.",
  },
];

const initialDoctorMedicationOrders: DoctorMedicationOrder[] = [
  {
    id: "ord-001",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Meropenem",
    dose: "1 g",
    route: "IV",
    frequency: "q8h",
    orderType: "Scheduled",
    scheduleTimes: ["08:00", "16:00", "00:00"],
    doctor: "Dr. Sameer Mehta",
    indication: "Septic shock",
    instructions: "Administer after identity check. Escalate if dose is delayed beyond 30 minutes.",
    priority: "High",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Pending dispense",
    status: "Active",
  },
  {
    id: "ord-002",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Noradrenaline",
    dose: "Titrate 0.05 mcg/kg/min",
    route: "Infusion",
    frequency: "Continuous",
    orderType: "Continuous",
    scheduleTimes: ["Running"],
    doctor: "Dr. Sameer Mehta",
    indication: "MAP support",
    instructions: "Titrate as per MAP target. Pump and double verification required.",
    priority: "STAT",
    highRisk: true,
    doubleVerificationRequired: true,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-003",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Insulin regular",
    dose: "Sliding scale",
    route: "SC",
    frequency: "Before meals",
    orderType: "Scheduled",
    scheduleTimes: ["12:00", "18:00"],
    doctor: "Dr. Aman Verma",
    indication: "Hyperglycemia protocol",
    instructions: "Check blood sugar before administration. Double verify dose.",
    priority: "High",
    highRisk: true,
    doubleVerificationRequired: true,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-004",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Paracetamol",
    dose: "650 mg",
    route: "Oral/NG",
    frequency: "SOS fever",
    orderType: "PRN",
    scheduleTimes: ["PRN"],
    doctor: "Dr. Sameer Mehta",
    indication: "Fever or pain",
    instructions: "Administer if temp > 38 C or pain score > 5. Capture reason.",
    priority: "Routine",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-005",
    patientId: "icu-002",
    bedNo: "ICU-A02",
    medication: "Pantoprazole",
    dose: "40 mg",
    route: "IV",
    frequency: "OD",
    orderType: "Scheduled",
    scheduleTimes: ["09:00"],
    doctor: "Dr. Neha Malik",
    indication: "Stress ulcer prophylaxis",
    instructions: "Administer once daily before feeds.",
    priority: "Routine",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-006",
    patientId: "icu-003",
    bedNo: "ICU-B03",
    medication: "Mannitol",
    dose: "100 ml",
    route: "IV",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: ["11:00", "23:00"],
    doctor: "Dr. Imran Shah",
    indication: "Raised ICP watch",
    instructions: "Check urine output and serum osmolality before dose.",
    priority: "High",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Shortage",
    status: "Active",
  },
];

function buildSeedMedicationOrders() {
  const seededOrders = [...initialDoctorMedicationOrders];
  const existingKeys = new Set(seededOrders.map((order) => `${order.patientId}:${order.medication.toLowerCase()}`));

  medicationRows.forEach((medication) => {
    const key = `${medication.patientId}:${medication.medication.toLowerCase()}`;
    if (existingKeys.has(key)) return;

    const patient = icuPatients.find((item) => item.id === medication.patientId);
    const continuous = medication.frequency.toLowerCase().includes("continuous") || medication.scheduledTime === "Running";
    const highRisk = medication.doubleVerification !== "Not required";
    const pharmacyPending = /pharmacy|dispense/i.test(medication.reason);
    seededOrders.push({
      id: `source-${medication.id}`,
      patientId: medication.patientId,
      bedNo: medication.bedNo,
      medication: medication.medication,
      dose: medication.dose,
      route: medication.route,
      frequency: medication.frequency,
      orderType: continuous ? "Continuous" : "Scheduled",
      scheduleTimes: [medication.scheduledTime],
      doctor: patient?.admittingDoctor ?? patient?.dutyDoctor ?? "ICU Duty Doctor",
      indication: medication.reason,
      instructions: medication.reason || "Administer as per ICU medication order.",
      priority: medication.status === "Late" || highRisk ? "High" : "Routine",
      highRisk,
      doubleVerificationRequired: highRisk,
      pharmacyStatus: pharmacyPending ? "Pending dispense" : "Available",
      status: "Active",
    });
    existingKeys.add(key);
  });

  return seededOrders;
}

const seededDoctorMedicationOrders = buildSeedMedicationOrders();

function deriveDoseStatus(order: DoctorMedicationOrder, scheduledTime: string, index: number): WorkflowMedicationStatus {
  if (order.status === "Held by doctor") return "Held";
  if (order.status === "Discontinued") return "Stopped";
  if (order.id === "ord-003" && scheduledTime === "12:00") return "Administered";
  if (order.id === "ord-003" && scheduledTime === "18:00") return "Held";
  if (order.orderType === "Continuous") return "Running";
  if (order.orderType === "PRN") return "Upcoming";
  if (order.orderType === "STAT") return index === 0 ? "Due" : "Upcoming";
  if (scheduledTime === "08:00" || scheduledTime === "09:00") return index % 2 === 0 ? "Late" : "Administered";
  if (scheduledTime === "00:00" || scheduledTime === "23:00") return "Upcoming";
  return "Due";
}

function buildMedicationDoseRows(orders: DoctorMedicationOrder[]): MedicationDoseRow[] {
  return orders.flatMap((order) => {
    const times = order.scheduleTimes.length ? order.scheduleTimes : ["Now"];
    return times.map((time, index) => {
      const status = deriveDoseStatus(order, time, index);
      const scheduledDate = time === "00:00" ? "2026-06-09" : "2026-06-08";
      return {
        id: `${order.id}-dose-${index + 1}`,
        orderId: order.id,
        patientId: order.patientId,
        bedNo: order.bedNo,
        medication: order.medication,
        dose: order.dose,
        route: order.route,
        frequency: order.frequency,
        scheduledTime: time,
        scheduledDate,
        shift: medicationShiftForTime(time),
        actualTime: status === "Administered" ? time : "-",
        status,
        administeredBy: status === "Administered" ? "Ward Nurse Arjun" : "-",
        reason: order.indication,
        orderType: order.orderType,
        doctor: order.doctor,
        indication: order.indication,
        instructions: order.instructions,
        highRisk: order.highRisk,
        doubleVerification: order.doubleVerificationRequired
          ? ["Administered", "Held", "Skipped", "Missed", "Refused", "Stopped"].includes(status)
            ? "Verified"
            : "Pending"
          : "Not required",
        pharmacyStatus: order.pharmacyStatus,
        orderStatus: order.status,
        auditTrail: [
          `Order created by ${order.doctor}`,
          `${time}: ${status}`,
          status === "Administered" ? "Dose documented in nurse eMAR" : "",
          status === "Held" ? "Dose held with clinical reason documented" : "",
        ].filter(Boolean),
      };
    });
  });
}

function readReadyMedicationIds() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MEDICATION_READY_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function saveReadyMedicationIds(ids: Iterable<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEDICATION_READY_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
}

function persistReadyMedication(dose: MedicationDoseRow) {
  const ids = readReadyMedicationIds();
  ids.add(dose.id);
  ids.add(dose.orderId);
  saveReadyMedicationIds(ids);
}

function applyReadyMedicationState(doses: MedicationDoseRow[]) {
  const readyIds = readReadyMedicationIds();
  if (!readyIds.size) return doses;
  return doses.map((dose) => {
    if (!readyIds.has(dose.id) && !readyIds.has(dose.orderId)) return dose;
    return {
      ...dose,
      pharmacyStatus: "Available" as PharmacyStatus,
      doubleVerification: dose.highRisk ? "Verified" as const : dose.doubleVerification,
      auditTrail: dose.auditTrail.some((entry) => entry.includes("Medicine received and verified"))
        ? dose.auditTrail
        : ["Now: Medicine received and verified for nurse administration", ...dose.auditTrail],
    };
  });
}

function medicationShiftForTime(time: string): MedicationDoseRow["shift"] {
  const hour = Number.parseInt(time.slice(0, 2), 10);
  if (Number.isNaN(hour)) return "Morning";
  if (hour >= 6 && hour < 14) return "Morning";
  if (hour >= 14 && hour < 22) return "Evening";
  return "Night";
}

export function PatientBoardWorkspace(props: { patients: IcuPatient[]; compact?: boolean }) {
  return (
    <React.Suspense fallback={<PatientBoardLoading compact={props.compact} />}>
      <PatientBoardWorkspaceInner {...props} />
    </React.Suspense>
  );
}

function PatientBoardWorkspaceInner({ patients, compact }: { patients: IcuPatient[]; compact?: boolean }) {
  const searchParams = useSearchParams();
  const requestedPatientId = searchParams.get("patient");
  const requestedView = searchParams.get("view");
  const [query, setQuery] = React.useState("");
  const [risk, setRisk] = React.useState("All risk");
  const [nurse, setNurse] = React.useState("All nurses");
  const [view, setView] = React.useState<"Board" | "Smart Bed">(requestedView === "smart-bed" ? "Smart Bed" : "Board");
  const [selectedId, setSelectedId] = React.useState(requestedPatientId ?? patients[0]?.id ?? icuPatients[0]?.id ?? "");

  const visiblePatients = React.useMemo(() => {
    return patients.filter((patient) => {
      const searchable = `${patient.patientName} ${patient.mrn} ${patient.bedNo} ${patient.diagnosis} ${patient.assignedWardNurse}`.toLowerCase();
      const matchesRisk =
        risk === "All risk"
        || (risk === "Critical score" && patient.criticalityScore >= 8)
        || (risk === "Ventilator" && patient.ventilatorStatus !== "Room air")
        || (risk === "Pending tasks" && patient.pendingTasks > 0)
        || patient.currentStatus === risk;
      const matchesNurse = nurse === "All nurses" || patient.assignedWardNurse === nurse || patient.assignedUnitNurse === nurse;
      return searchable.includes(query.toLowerCase()) && matchesRisk && matchesNurse;
    });
  }, [nurse, patients, query, risk]);

  const selectedPatient = visiblePatients.find((patient) => patient.id === selectedId) ?? visiblePatients[0] ?? patients[0];

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>ICU Patient Board</CardTitle>
            <CardDescription>Bed-wise census with alert and task pressure.</CardDescription>
          </div>
          <Badge tone="info">{visiblePatients.length} active</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {visiblePatients.slice(0, 4).map((patient) => (
            <PatientMiniCard key={patient.id} patient={patient} active={patient.id === selectedPatient?.id} onSelect={() => setSelectedId(patient.id)} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 xl:grid-cols-[1fr_170px_180px_180px] xl:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Patient search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Name, MRN, bed, diagnosis..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </label>
          <NativeSelect label="Risk filter" value={risk} onChange={setRisk} options={["All risk", "Critical score", "Ventilator", "Pending tasks", "Critical", "Ready for transfer"]} />
          <NativeSelect label="Nurse filter" value={nurse} onChange={setNurse} options={["All nurses", ...allNurses]} />
          <div className="grid grid-cols-2 gap-2">
            {(["Board", "Smart Bed"] as const).map((item) => (
              <Button key={item} variant={view === item ? "default" : "outline"} onClick={() => setView(item)}>
                {item === "Board" ? <BedDouble className="h-4 w-4" /> : <MonitorDot className="h-4 w-4" />}
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Bed Board</CardTitle>
              <CardDescription>Search, filter, select, and open patient cockpit.</CardDescription>
            </div>
            <Badge tone="info">{visiblePatients.length} beds</Badge>
          </CardHeader>
          <CardContent className="grid gap-3">
            {visiblePatients.map((patient) => (
              <PatientMiniCard key={patient.id} patient={patient} active={patient.id === selectedPatient?.id} onSelect={() => setSelectedId(patient.id)} />
            ))}
            {!visiblePatients.length ? <EmptyPanel title="No patient matched" detail="Change search or filters." /> : null}
          </CardContent>
        </Card>

        {view === "Board" ? <PatientActionWorkspace patient={selectedPatient} /> : <SmartBedView patient={selectedPatient} />}
      </div>
    </div>
  );
}

function PatientBoardLoading({ compact }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>ICU Patient Board</CardTitle>
          <CardDescription>Loading selected patient context...</CardDescription>
        </div>
      </CardHeader>
      <CardContent className={compact ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        {[0, 1, 2].map((item) => (
          <div className="h-24 animate-pulse rounded-md border border-border bg-surface-muted" key={item} />
        ))}
      </CardContent>
    </Card>
  );
}

export function AdmissionWizardWorkspace() {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<AdmissionDraft>(() => createEmptyAdmissionDraft());
  const [created, setCreated] = React.useState<Array<AdmissionDraft & { id: string; status: string }>>([]);
  const [localAdmissionCandidates, setLocalAdmissionCandidates] = React.useState<AdmissionPatientCandidate[]>([]);
  const [patientQuery, setPatientQuery] = React.useState("");
  const [showEmergencyCreate, setShowEmergencyCreate] = React.useState(false);
  const [emergencyDraft, setEmergencyDraft] = React.useState<EmergencyAdmissionQuickDraft>(() => createEmergencyAdmissionQuickDraft());

  const admissionCandidateRows = React.useMemo(() => [...localAdmissionCandidates, ...admissionPatientCandidates], [localAdmissionCandidates]);
  const findAdmissionCandidate = React.useCallback(
    (patientId: string) => admissionCandidateRows.find((patient) => patient.id === patientId),
    [admissionCandidateRows],
  );

  const updateDraft = (key: keyof AdmissionDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const updateAdmissionPatient = (patientId: string) => {
    const candidate = findAdmissionCandidate(patientId);
    if (!candidate) return;
    setDraft(applyAdmissionCandidate(candidate));
    setPatientQuery(candidate.patientName);
    setShowEmergencyCreate(false);
  };
  const updateEmergencyDraft = (key: keyof EmergencyAdmissionQuickDraft, value: string) => {
    setEmergencyDraft((current) => ({ ...current, [key]: value }));
  };
  const openEmergencyCreate = () => {
    setEmergencyDraft((current) => ({
      ...current,
      patientName: current.patientName || patientQuery.trim(),
    }));
    setShowEmergencyCreate(true);
  };
  const createEmergencyAdmission = () => {
    if (!emergencyDraft.patientName.trim() || !emergencyDraft.ageGender.trim() || !emergencyDraft.diagnosis.trim()) {
      toast.error("Patient name, age/sex, and diagnosis are required.");
      return;
    }
    const candidate = createEmergencyAdmissionCandidate(emergencyDraft, localAdmissionCandidates.length);
    setLocalAdmissionCandidates((current) => [candidate, ...current]);
    setDraft(applyAdmissionCandidate(candidate));
    setPatientQuery(candidate.patientName);
    setEmergencyDraft(createEmergencyAdmissionQuickDraft());
    setShowEmergencyCreate(false);
    toast.success(`${candidate.patientName} added for ICU admission`);
  };
  const updateAdmissionSource = (source: string) => {
    setDraft((current) => ({
      ...current,
      source,
      icuAdmissionNo: current.icuAdmissionNo || generatedAdmissionIdentity(source).icuAdmissionNo,
      sourceDetail: current.source === source ? current.sourceDetail : "",
      handoverBy: current.source === source ? current.handoverBy : getAdmissionHandoverOptions(source)[0],
      admittingTeam: getAdmittingTeamDefault(source, current.unit),
    }));
  };
  const updateAdmissionUnit = (unit: string) => {
    const nextBed = getAssignableAdmissionBedsForUnit(unit)[0];
    setDraft((current) => ({
      ...current,
      unit,
      bedNo: nextBed?.bedNo ?? "",
      admittingTeam: getAdmittingTeamDefault(current.source, unit),
    }));
  };
  const resetDraft = () => {
    setDraft(createEmptyAdmissionDraft());
    setPatientQuery("");
    setShowEmergencyCreate(false);
    setEmergencyDraft(createEmergencyAdmissionQuickDraft());
  };
  const toggleReadiness = (item: string) => {
    setDraft((current) => {
      const selected = getReadinessValues(current.readiness);
      const next = selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item];
      return { ...current, readiness: next.join("|") };
    });
  };
  const filteredPatientCandidates = React.useMemo(() => {
    const query = patientQuery.trim().toLowerCase();
    if (!query) return [];
    return admissionCandidateRows.filter((patient) => {
      const text = `${patient.patientName} ${patient.mrn} ${patient.currentLocation} ${patient.patientStatus} ${patient.source} ${patient.diagnosis}`.toLowerCase();
      return text.includes(query);
    });
  }, [admissionCandidateRows, patientQuery]);
  const availableAdmissionBeds = React.useMemo(() => getAssignableAdmissionBedsForUnit(draft.unit), [draft.unit]);
  const availableAdmissionBedOptions = React.useMemo(() => availableAdmissionBeds.map((bed) => bed.bedNo), [availableAdmissionBeds]);
  const selectedBed = getAdmissionBed(draft.bedNo);
  const selectedReadiness = getReadinessValues(draft.readiness);
  const admissionBlockReason = getAdmissionBlockReason(draft, created);
  const completenessBase = admissionRequiredFields.filter((key) => key !== "readiness").filter((key) => Boolean(draft[key])).length;
  const completeness = Math.round(((completenessBase + (readinessComplete(draft.readiness) ? 1 : 0)) / admissionRequiredFields.length) * 100);

  React.useEffect(() => {
    if (availableAdmissionBedOptions.includes(draft.bedNo)) return;
    const nextBedNo = availableAdmissionBedOptions[0] ?? "";
    setDraft((current) => current.bedNo === nextBedNo ? current : { ...current, bedNo: nextBedNo });
  }, [availableAdmissionBedOptions, draft.bedNo]);

  const saveAdmission = () => {
    if (admissionBlockReason) {
      toast.error(admissionBlockReason);
      return;
    }
    const record = { ...draft, id: `icu-adm-${created.length + 1}`, status: "Bed assigned" };
    setCreated((current) => [record, ...current]);
    toast.success(`${draft.patientName || "ICU patient"} admission wizard completed`);
    setStep(0);
    resetDraft();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>ICU Admission Wizard</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {admissionSteps.map((item, index) => (
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-md border border-border p-3 text-left transition hover:bg-surface-muted",
                index === step ? "border-primary bg-primary/5" : "bg-background",
              )}
              key={item}
              type="button"
              onClick={() => setStep(index)}
            >
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold", index <= step ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground")}>
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{item}</span>
                <span className="block text-xs text-muted-foreground">{index < step ? "Complete" : index === step ? "Active" : "Pending"}</span>
              </span>
            </button>
          ))}
          <MetricTile label="Completion" value={`${completeness}%`} tone={completeness > 80 ? "success" : "warning"} icon={ClipboardCheck} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{admissionSteps[step]}</CardTitle>
          </div>
          <Badge tone={toneForStatus(step === admissionSteps.length - 1 ? "Ready" : "In progress")}>{step === admissionSteps.length - 1 ? "Review" : "In progress"}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <FormGrid>
              <TextField label="Search patient / MRN / location" value={patientQuery} onChange={setPatientQuery} placeholder="Search patient name, MRN, ER, ward, OT, external transfer..." wide />
              {patientQuery.trim() ? (
                <AdmissionPatientSearchRows
                  rows={filteredPatientCandidates}
                  searchedText={patientQuery}
                  selectedPatientId={draft.patientId}
                  onCreate={openEmergencyCreate}
                  onSelect={updateAdmissionPatient}
                />
              ) : null}
              {showEmergencyCreate ? (
                <EmergencyAdmissionCreatePanel
                  draft={emergencyDraft}
                  onCancel={() => setShowEmergencyCreate(false)}
                  onChange={updateEmergencyDraft}
                  onCreate={createEmergencyAdmission}
                />
              ) : null}
              <SelectField label="Admission origin" value={draft.source} onChange={updateAdmissionSource} options={admissionSourceOptions} />
              <ReadOnlyField label="Selected patient" value={draft.patientName && draft.mrn ? `${draft.patientName} | ${draft.mrn}` : ""} />
              <ReadOnlyField label="ICU Admission No" value={draft.icuAdmissionNo} />
              <ReadOnlyField label="Age / gender" value={draft.ageGender} />
              <ReadOnlyField label="Location" value={draft.currentLocation} />
              <ReadOnlyField label="Current status" value={draft.patientStatus} />
            </FormGrid>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              <AdmissionFormSection title="Clinical Status" description="Current admission condition, recovery direction, risk, and isolation requirement.">
                <TextField label="Diagnosis" value={draft.diagnosis} onChange={(value) => updateDraft("diagnosis", value)} placeholder="Primary ICU diagnosis" />
                <SelectField label="Clinical status" value={draft.condition} onChange={(value) => updateDraft("condition", value)} options={["Critical", "Ill", "Ventilated", "Stable ICU care", "Ready for transfer"]} />
                <SelectField label="Patient status" value={draft.recoveryStatus} onChange={(value) => updateDraft("recoveryStatus", value)} options={["Reviving", "Revived", "Other"]} />
                <SelectField label="Risk level" value={draft.risk} onChange={(value) => updateDraft("risk", value)} options={["Critical", "High", "Medium", "Routine"]} />
                <SelectField label="Isolation required" value={draft.isolation} onChange={(value) => updateDraft("isolation", value)} options={["No", "Yes", "Contact precaution", "Airborne precaution"]} />
                <SelectField label={getAdmissionScenario(draft.source).handoverLabel} value={draft.handoverBy} onChange={(value) => updateDraft("handoverBy", value)} options={getAdmissionHandoverOptions(draft.source, draft.handoverBy)} />
              </AdmissionFormSection>

              <AdmissionFormSection title="Investigations & Plan" description="Pending reports and immediate ICU care plan.">
                <TextAreaField half label="Pending Investigations" value={draft.pendingInvestigations} onChange={(value) => updateDraft("pendingInvestigations", value)} placeholder="Lab, radiology, cultures, ABG, pending reports..." />
                <TextAreaField half label="Planned Care / Treatment" value={draft.plannedCareTreatment} onChange={(value) => updateDraft("plannedCareTreatment", value)} placeholder="ICU plan, treatment goal, monitoring plan, escalation plan..." />
                <TextField label={getAdmissionScenario(draft.source).detailLabel} value={draft.sourceDetail} onChange={(value) => updateDraft("sourceDetail", value)} placeholder="Admission source context..." wide />
              </AdmissionFormSection>
            </div>
          ) : null}

          {step === 2 ? (
            <FormGrid>
              <SelectField label="ICU unit" value={draft.unit} onChange={updateAdmissionUnit} options={["General ICU", "Medical ICU", "Cardiothoracic ICU", "Pediatric ICU", "Neuro ICU", "Transplant ICU", "Respiratory ICU", "Surgical ICU", "Isolation ICU"]} />
              <SelectField
                label="Available bed"
                value={draft.bedNo}
                onChange={(value) => updateDraft("bedNo", value)}
                options={availableAdmissionBedOptions.length ? availableAdmissionBedOptions : [""]}
                renderOption={(bedNo) => bedNo ? admissionBedLabel(bedNo) : `No available bed in ${draft.unit}`}
              />
              <SelectField label="Ventilator / oxygen" value={draft.ventilator} onChange={(value) => updateDraft("ventilator", value)} options={["Room air", "Oxygen mask", "NIV support", "Invasive ventilation", "Weaning trial"]} />
              <TextField label="Devices" value={draft.devices} onChange={(value) => updateDraft("devices", value)} placeholder="Monitor, pump, ventilator..." />
              <SelectField label="Unit nurse" value={draft.nurse} onChange={(value) => updateDraft("nurse", value)} options={["Unit Nurse Priya", "Unit Nurse Meera", "Unit Nurse Sana"]} />
              <SelectField label="Admitting doctor" value={draft.doctor} onChange={(value) => updateDraft("doctor", value)} options={["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma"]} />
              <SelectField label="Admitting consultant" value={draft.admittingConsultant} onChange={(value) => updateDraft("admittingConsultant", value)} options={admittingConsultantOptions} />
              <SelectField label="Admitting unit" value={draft.admittingTeam} onChange={(value) => updateDraft("admittingTeam", value)} options={admittingTeamOptions} />
              <AdmissionReadinessChecklist selected={selectedReadiness} onToggle={toggleReadiness} />
            </FormGrid>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <AdmissionFormSection title="Medication Reconciliation" description="Past, current, and high-alert medicines captured before ICU receive.">
                <TextAreaField half label="Past Medication" value={draft.pastMedication} onChange={(value) => updateDraft("pastMedication", value)} placeholder="Home medicines, previous hospital medicines, stopped medicines..." />
                <TextAreaField half label="Current Medication" value={draft.currentMedication} onChange={(value) => {
                  updateDraft("currentMedication", value);
                  updateDraft("medication", value);
                }} placeholder="Antibiotics, infusions, emergency medicines, active ICU medicines..." />
                <TextAreaField half label="Allergy" value={draft.allergy} onChange={(value) => updateDraft("allergy", value)} placeholder="Drug, food, latex, contrast, or no known allergy..." />
                <TextAreaField half label="High-Alert Medications" value={draft.highAlertMedications} onChange={(value) => updateDraft("highAlertMedications", value)} placeholder="Insulin, vasopressor, anticoagulant, concentrated electrolytes, narcotics..." />
                <TextAreaField half label="Other Relevant Information" value={draft.otherRelevantInformation} onChange={(value) => updateDraft("otherRelevantInformation", value)} placeholder="Allergy, implants, NPO, infection risk, family instruction, consent context..." />
              </AdmissionFormSection>

              <AdmissionFormSection title="Procedures & Handover" description="Procedure context, nurse handover route, confirmation, and bedside nursing note.">
                <TextAreaField half label="Procedures" value={draft.procedures} onChange={(value) => updateDraft("procedures", value)} placeholder="Lines, intubation, catheter, drain, surgery/procedure context..." />
                <TextAreaField half label="Nursing Notes" value={draft.nursingNotes} onChange={(value) => {
                  updateDraft("nursingNotes", value);
                  updateDraft("notes", value);
                }} placeholder="Arrival condition, device status, safety checks, pending task, immediate nursing plan..." />
                <SelectField label="Handed Over" value={draft.handedOver} onChange={(value) => updateDraft("handedOver", value)} options={getAdmissionHandoverOptions(draft.source, draft.handedOver)} />
                <SelectField label="Taken Over By" value={draft.takenOverBy} onChange={(value) => updateDraft("takenOverBy", value)} options={allNurses} />
                <SelectField label="Signature / Confirmation" value={draft.signatureConfirmation} onChange={(value) => updateDraft("signatureConfirmation", value)} options={["Pending bedside confirmation", "Verbal handover accepted", "Digital signature captured", "Paper signature pending", "Received with exceptions"]} />
              </AdmissionFormSection>
            </div>
          ) : null}

          {step === 4 ? <AdmissionReview draft={draft} blockReason={admissionBlockReason} bed={selectedBed} /> : null}

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={resetDraft}>Reset</Button>
              {step < admissionSteps.length - 1 ? (
                <Button onClick={() => setStep((current) => Math.min(admissionSteps.length - 1, current + 1))}>Next <ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <Button disabled={Boolean(admissionBlockReason)} onClick={saveAdmission}><Check className="h-4 w-4" />Admit patient</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {created.length ? (
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Created Admissions</CardTitle>
              <CardDescription>Frontend workflow records created in this session.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {created.map((record) => (
              <div className="rounded-md border border-border bg-background p-3" key={record.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{record.patientName || "Unnamed patient"}</p>
                    <p className="text-xs text-muted-foreground">{record.mrn} | {record.icuAdmissionNo}</p>
                    <p className="text-xs text-muted-foreground">{record.bedNo} | {record.unit} | {record.source}</p>
                    <p className="text-xs text-muted-foreground">{record.admittingTeam}</p>
                  </div>
                  <StatusPill tone="success">{record.status}</StatusPill>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

const clinicalHandoffShiftOptions = [
  "K - Morning (07:00-15:00)",
  "Y - Evening (15:00-23:00)",
  "X - Night (23:00-07:00)",
  "Emergency / temporary handoff",
];

const clinicalHandoffPairs: Record<string, { outgoingNurse: string; incomingNurse: string }> = {
  "K - Morning (07:00-15:00)": { outgoingNurse: "Night Nurse Leena", incomingNurse: "Ward Nurse Kavita" },
  "Y - Evening (15:00-23:00)": { outgoingNurse: "Ward Nurse Kavita", incomingNurse: "Ward Nurse Arjun" },
  "X - Night (23:00-07:00)": { outgoingNurse: "Ward Nurse Arjun", incomingNurse: "Night Nurse Leena" },
  "Emergency / temporary handoff": { outgoingNurse: "Unit Nurse Priya", incomingNurse: "Ward Nurse Neha" },
};

type NursingClinicalHandoffDraft = {
  patientId: string;
  handoffDate: string;
  shift: string;
  criticalInformation: string;
  allergies: string;
  pendingInvestigations: string;
  pendingReports: string;
  highAlertMedications: string;
  pendingMedications: string;
  otherMedicationInfo: string;
  proceduresDone: string;
  proceduresPlanned: string;
  consultantReferral: string;
  handedOverBy: string;
  takenOverBy: string;
  signatureConfirmation: string;
  unitLeaveCriticalInfo: string;
  unitLeaveHandedOverBy: string;
  unitLeaveTakenOverBy: string;
  returnCriticalInfo: string;
  returnHandedOverBy: string;
  returnTakenOverBy: string;
};

type ClinicalHandoffRecord = NursingClinicalHandoffDraft & {
  id: string;
  status: "Draft" | "Signed" | "Acknowledged";
};

export function ShiftHandoverWorkspace() {
  const firstPatient = icuPatients[0];
  const nurseOptions = React.useMemo(
    () => Array.from(new Set([
      "Ward Nurse Kavita",
      "Ward Nurse Arjun",
      "Ward Nurse Neha",
      "Night Nurse Leena",
      "Unit Nurse Priya",
      "Unit Nurse Meera",
      "Head Nurse Sana",
      ...icuPatients.flatMap((patient) => [patient.assignedWardNurse, patient.assignedUnitNurse]),
    ])),
    [],
  );
  const [draft, setDraft] = React.useState<NursingClinicalHandoffDraft>(() => buildClinicalHandoffDraft(firstPatient, "K - Morning (07:00-15:00)"));
  const selectedPatient = icuPatients.find((patient) => patient.id === draft.patientId) ?? firstPatient;
  const [records, setRecords] = React.useState<ClinicalHandoffRecord[]>(() => [
    {
      ...buildClinicalHandoffDraft(icuPatients[0], "Y - Evening (15:00-23:00)"),
      id: "nch-001",
      status: "Signed",
      signatureConfirmation: "Digital signature captured",
    },
    {
      ...buildClinicalHandoffDraft(icuPatients[1], "X - Night (23:00-07:00)"),
      id: "nch-002",
      status: "Acknowledged",
      signatureConfirmation: "Received with exceptions",
    },
  ]);

  const updateDraft = (key: keyof NursingClinicalHandoffDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updatePatient = (patientId: string) => {
    const patient = icuPatients.find((item) => item.id === patientId) ?? firstPatient;
    setDraft((current) => ({
      ...buildClinicalHandoffDraft(patient, current.shift),
      handoffDate: current.handoffDate,
      shift: current.shift,
    }));
  };

  const updateShift = (shift: string) => {
    const pair = clinicalHandoffPairs[shift] ?? clinicalHandoffPairs["K - Morning (07:00-15:00)"];
    setDraft((current) => ({
      ...current,
      shift,
      handedOverBy: pair.outgoingNurse,
      takenOverBy: pair.incomingNurse,
      unitLeaveHandedOverBy: pair.outgoingNurse,
      unitLeaveTakenOverBy: pair.incomingNurse,
      returnHandedOverBy: pair.incomingNurse,
      returnTakenOverBy: pair.outgoingNurse,
    }));
  };

  const saveDraft = () => {
    setRecords((current) => [{ ...draft, id: `nch-${current.length + 1}`, status: "Draft" }, ...current]);
    toast.success("Nursing clinical handoff draft saved");
  };

  const signHandoff = () => {
    if (draft.handedOverBy === draft.takenOverBy) {
      toast.error("Handed over aur taken over nurse same nahi ho sakte");
      return;
    }
    setRecords((current) => [{ ...draft, id: `nch-${current.length + 1}`, status: "Signed" }, ...current]);
    toast.success("Nursing clinical handoff signed");
  };

  const resetDraft = () => {
    setDraft(buildClinicalHandoffDraft(selectedPatient, draft.shift));
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-3 p-3 lg:grid-cols-[minmax(260px,1fr)_minmax(220px,0.85fr)_160px_minmax(320px,1.25fr)] lg:items-end">
          <SelectField
            label="Patient / bed"
            value={draft.patientId}
            onChange={updatePatient}
            options={icuPatients.map((patient) => patient.id)}
            renderOption={(id) => {
              const patient = icuPatients.find((item) => item.id === id);
              return patient ? `${patient.bedNo} - ${patient.patientName}` : id;
            }}
          />
          <SelectField label="Shift" value={draft.shift} onChange={updateShift} options={clinicalHandoffShiftOptions} />
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Date</span>
            <Input type="date" value={draft.handoffDate} onChange={(event) => updateDraft("handoffDate", event.target.value)} />
          </label>
          <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
            <p className="font-semibold text-foreground">{selectedPatient?.bedNo} - {selectedPatient?.patientName}</p>
            <p>{selectedPatient?.mrn} | {selectedPatient?.ageGender} | {selectedPatient?.unit}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <div>
              <CardTitle>Clinical Handoff Sheet</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <ClinicalHandoffSection
                icon={AlertTriangle}
                tone="critical"
                title="Critical Information"
              >
                <TextAreaField label="Critical information" value={draft.criticalInformation} onChange={(value) => updateDraft("criticalInformation", value)} placeholder="Airway, sepsis, bleeding, isolation, escalation trigger..." />
              </ClinicalHandoffSection>
              <ClinicalHandoffSection
                icon={ShieldAlert}
                tone="warning"
                title="Food / Drug Allergies"
              >
                <TextAreaField label="Food / drug allergies" value={draft.allergies} onChange={(value) => updateDraft("allergies", value)} placeholder="Known allergy, suspected reaction, allergy unknown..." />
              </ClinicalHandoffSection>
            </div>

            <ClinicalHandoffSection
              icon={FileText}
              tone="info"
              title="Investigations"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <TextAreaField half label="Any pending / planned" value={draft.pendingInvestigations} onChange={(value) => updateDraft("pendingInvestigations", value)} placeholder="ABG repeat, cultures, echo, CT, bedside USG..." />
                <TextAreaField half label="Pending reports for collection" value={draft.pendingReports} onChange={(value) => updateDraft("pendingReports", value)} placeholder="Lab/radiology reports pending..." />
              </div>
            </ClinicalHandoffSection>

            <ClinicalHandoffSection
              icon={Pill}
              tone="danger"
              title="Medicine"
            >
              <div className="grid gap-3 lg:grid-cols-3">
                <TextAreaField half label="High-alert medications" value={draft.highAlertMedications} onChange={(value) => updateDraft("highAlertMedications", value)} placeholder="Noradrenaline, insulin, KCl, heparin..." />
                <TextAreaField half label="Pending medication" value={draft.pendingMedications} onChange={(value) => updateDraft("pendingMedications", value)} placeholder="Due, late, held, pharmacy pending..." />
                <TextAreaField half label="Other relevant information" value={draft.otherMedicationInfo} onChange={(value) => updateDraft("otherMedicationInfo", value)} placeholder="Double verification, infusion rate, monitoring..." />
              </div>
            </ClinicalHandoffSection>

            <div className="grid gap-3 lg:grid-cols-2">
              <ClinicalHandoffSection
                icon={ClipboardCheck}
                tone="success"
                title="Procedure"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <TextAreaField half label="Done" value={draft.proceduresDone} onChange={(value) => updateDraft("proceduresDone", value)} placeholder="Line, dressing, transfusion, drain care..." />
                  <TextAreaField half label="Planned further" value={draft.proceduresPlanned} onChange={(value) => updateDraft("proceduresPlanned", value)} placeholder="Procedure planned next shift..." />
                </div>
              </ClinicalHandoffSection>
              <ClinicalHandoffSection
                icon={FileSignature}
                tone="info"
                title="New Consultant Referral"
              >
                <TextAreaField label="Referral details" value={draft.consultantReferral} onChange={(value) => updateDraft("consultantReferral", value)} placeholder="Specialty, reason, pending response..." />
              </ClinicalHandoffSection>
            </div>

            <ClinicalHandoffSection
              icon={CheckCircle2}
              tone="success"
              title="Handover Confirmation"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <SelectField label="Handed over by" value={draft.handedOverBy} onChange={(value) => updateDraft("handedOverBy", value)} options={nurseOptions} />
                <SelectField label="Taken over by" value={draft.takenOverBy} onChange={(value) => updateDraft("takenOverBy", value)} options={nurseOptions} />
                <SelectField label="Signature / confirmation" value={draft.signatureConfirmation} onChange={(value) => updateDraft("signatureConfirmation", value)} options={["Pending bedside confirmation", "Verbal handover accepted", "Digital signature captured", "Paper signature pending", "Received with exceptions"]} />
              </div>
            </ClinicalHandoffSection>

            <ClinicalHandoffSection
              icon={Clock}
              tone="warning"
              title="Nurse Leaving Unit Hand-Off"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <TextAreaField half label="Critical information" value={draft.unitLeaveCriticalInfo} onChange={(value) => updateDraft("unitLeaveCriticalInfo", value)} placeholder="Immediate bedside risk while nurse is away..." />
                <SelectField label="Handed over by" value={draft.unitLeaveHandedOverBy} onChange={(value) => updateDraft("unitLeaveHandedOverBy", value)} options={nurseOptions} />
                <SelectField label="Taken over by" value={draft.unitLeaveTakenOverBy} onChange={(value) => updateDraft("unitLeaveTakenOverBy", value)} options={nurseOptions} />
              </div>
            </ClinicalHandoffSection>

            <ClinicalHandoffSection
              icon={ArrowRight}
              tone="info"
              title="On Return Handover"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <TextAreaField half label="Critical information" value={draft.returnCriticalInfo} onChange={(value) => updateDraft("returnCriticalInfo", value)} placeholder="What changed while away..." />
                <SelectField label="Handed over by" value={draft.returnHandedOverBy} onChange={(value) => updateDraft("returnHandedOverBy", value)} options={nurseOptions} />
                <SelectField label="Taken over by" value={draft.returnTakenOverBy} onChange={(value) => updateDraft("returnTakenOverBy", value)} options={nurseOptions} />
              </div>
            </ClinicalHandoffSection>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={resetDraft}>Reset</Button>
              <Button variant="outline" onClick={saveDraft}><Save className="h-4 w-4" />Save draft</Button>
              <Button onClick={signHandoff}><ClipboardCheck className="h-4 w-4" />Sign handoff</Button>
            </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Clinical Handoff Queue</CardTitle>
          </div>
          <Badge tone="info">{records.length} records</Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
                <th className="rounded-l-md px-3 py-3">Patient</th>
                <th className="px-3 py-3">Shift / date</th>
                <th className="px-3 py-3">Critical info</th>
                <th className="px-3 py-3">Pending work</th>
                <th className="px-3 py-3">Nurse route</th>
                <th className="rounded-r-md px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const patient = icuPatients.find((item) => item.id === record.patientId);
                return (
                  <tr className="border-b border-border" key={record.id}>
                    <td className="px-3 py-3 align-top">
                      <p className="font-semibold text-foreground">{patient?.bedNo} - {patient?.patientName}</p>
                      <p className="text-xs text-muted-foreground">{patient?.mrn} | {patient?.unit}</p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-semibold text-foreground">{record.shift}</p>
                      <p className="text-xs text-muted-foreground">{record.handoffDate}</p>
                    </td>
                    <td className="max-w-[280px] px-3 py-3 align-top text-xs text-muted-foreground">{record.criticalInformation}</td>
                    <td className="max-w-[260px] px-3 py-3 align-top text-xs text-muted-foreground">{record.pendingInvestigations || record.pendingMedications}</td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{record.handedOverBy}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">{record.takenOverBy}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <StatusPill tone={toneForStatus(record.status)}>{record.status}</StatusPill>
                        {record.status !== "Acknowledged" ? (
                          <Button size="sm" variant="outline" onClick={() => {
                            setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status: "Acknowledged" } : item));
                            toast.success(`${record.takenOverBy} acknowledged clinical handoff`);
                          }}>
                            <CheckCircle2 className="h-4 w-4" />Acknowledge
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function buildClinicalHandoffDraft(patient?: IcuPatient, shift = "K - Morning (07:00-15:00)"): NursingClinicalHandoffDraft {
  const pair = clinicalHandoffPairs[shift] ?? clinicalHandoffPairs["K - Morning (07:00-15:00)"];
  const patientId = patient?.id ?? icuPatients[0]?.id ?? "";
  const alerts = icuAlerts.filter((row) => row.patientId === patientId && row.status !== "Resolved");
  const meds = medicationRows.filter((row) => row.patientId === patientId);
  const highAlertMeds = meds.filter((row) => row.doubleVerification !== "Not required" || row.route.toLowerCase().includes("infusion"));
  const pendingMeds = meds.filter((row) => ["Due", "Late", "Held"].includes(row.status));
  const tasks = icuTasks.filter((row) => row.patientId === patientId && row.status !== "Completed");
  const ioBalance = intakeOutputRows.filter((row) => row.patientId === patientId).reduce((sum, row) => sum + row.balanceMl, 0);

  return {
    patientId,
    handoffDate: "2026-06-16",
    shift,
    criticalInformation: [
      patient ? `${patient.currentStatus}: ${patient.diagnosis}` : "",
      alerts.length ? alerts.map((alert) => `${alert.type} - ${alert.message}`).join("; ") : "",
      ioBalance > 500 ? `Positive fluid balance ${formatHandoverMl(ioBalance)}` : "",
    ].filter(Boolean).join(" | ") || "No critical information captured.",
    allergies: clinicalHandoffAllergyText(patient),
    pendingInvestigations: pendingHandoffInvestigations(patient, tasks, alerts),
    pendingReports: alerts.some((alert) => alert.type.toLowerCase().includes("lab") || alert.source.toLowerCase().includes("lab"))
      ? "Lab report pending collection and doctor review."
      : "No pending report collection captured.",
    highAlertMedications: highAlertMeds.length
      ? highAlertMeds.map((med) => `${med.medication} ${med.dose} ${med.route} (${med.doubleVerification})`).join("; ")
      : "No high-alert medication running.",
    pendingMedications: pendingMeds.length
      ? pendingMeds.map((med) => `${med.medication} ${med.dose} ${med.status} at ${med.scheduledTime}`).join("; ")
      : "No pending medication captured.",
    otherMedicationInfo: meds.length
      ? meds.map((med) => `${med.medication}: ${med.reason}`).slice(0, 3).join("; ")
      : "Medication chart reviewed; no active medication row captured.",
    proceduresDone: patient?.ventilatorStatus?.toLowerCase().includes("vent")
      ? "Airway/ventilator checks completed and documented."
      : "Routine line, drain, and bedside safety checks completed.",
    proceduresPlanned: tasks.length ? tasks.slice(0, 3).map((task) => task.title).join("; ") : "No planned procedure captured.",
    consultantReferral: clinicalHandoffReferralText(patient, alerts),
    handedOverBy: pair.outgoingNurse,
    takenOverBy: pair.incomingNurse,
    signatureConfirmation: "Pending bedside confirmation",
    unitLeaveCriticalInfo: "Use if assigned nurse leaves unit: verify airway, monitor alarms, infusion/pump, and urgent pending medication.",
    unitLeaveHandedOverBy: pair.outgoingNurse,
    unitLeaveTakenOverBy: pair.incomingNurse,
    returnCriticalInfo: "On return: document any change in vitals, medication, I/O, device alarm, or doctor instruction.",
    returnHandedOverBy: pair.incomingNurse,
    returnTakenOverBy: pair.outgoingNurse,
  };
}

function ClinicalHandoffSection({
  children,
  description,
  icon: Icon,
  title,
  tone,
}: {
  children: React.ReactNode;
  description?: string;
  icon: typeof Activity;
  title: string;
  tone: StatusTone;
}) {
  return (
    <section className={cn("rounded-md border bg-background p-3", toneBorderClass(tone))}>
      <div className="mb-3 flex items-start gap-3">
        <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md", toneClass(tone))}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function calculateClinicalHandoffCompletion(draft: NursingClinicalHandoffDraft) {
  const requiredFields: Array<keyof NursingClinicalHandoffDraft> = [
    "criticalInformation",
    "allergies",
    "pendingInvestigations",
    "pendingReports",
    "highAlertMedications",
    "pendingMedications",
    "proceduresDone",
    "proceduresPlanned",
    "handedOverBy",
    "takenOverBy",
    "signatureConfirmation",
  ];
  const completed = requiredFields.filter((field) => Boolean(draft[field]?.trim())).length;
  return Math.round((completed / requiredFields.length) * 100);
}

function patientPendingMedicationCount(patientId?: string) {
  if (!patientId) return 0;
  return medicationRows.filter((row) => row.patientId === patientId && ["Due", "Late", "Held"].includes(row.status)).length;
}

function clinicalHandoffAllergyText(patient?: IcuPatient) {
  if (!patient) return "Allergy status unknown.";
  if (patient.id === "icu-001") return "Drug allergy watch: Piperacillin/Tazobactam. Food allergy not reported.";
  if (patient.id === "icu-002") return "No known drug allergy. Blood product reaction watch active.";
  if (patient.id === "icu-003") return "Sedation sensitivity watch; allergy not documented.";
  return "No known food or drug allergy documented.";
}

function pendingHandoffInvestigations(patient: IcuPatient | undefined, tasks: IcuTask[], alerts: IcuAlert[]) {
  if (!patient) return "No patient selected.";
  const investigationAlerts = alerts.filter((alert) => /lab|abg|report|radiology|ct|culture/i.test(`${alert.type} ${alert.message} ${alert.source}`));
  const investigationTasks = tasks.filter((task) => /lab|abg|report|radiology|ct|culture|investigation/i.test(`${task.taskType} ${task.title} ${task.remarks}`));
  const items = [
    ...investigationAlerts.map((alert) => `${alert.type}: ${alert.message}`),
    ...investigationTasks.map((task) => `${task.title} (${task.dueTime})`),
  ];
  return items.length ? Array.from(new Set(items)).slice(0, 4).join("; ") : "No pending / planned investigation captured.";
}

function clinicalHandoffReferralText(patient: IcuPatient | undefined, alerts: IcuAlert[]) {
  if (!patient) return "No referral captured.";
  if (alerts.some((alert) => alert.severity === "Critical" || alert.severity === "High")) return `${patient.dutyDoctor} to review high-risk alert before next shift.`;
  if (patient.unit === "Transplant ICU") return "Transplant team review pending for immunosuppression and renal output.";
  if (patient.unit === "Respiratory ICU") return "Respiratory therapist/consultant review for NIV response.";
  return "No new consultant referral captured.";
}

export function buildWholeShiftSummary(patient: IcuPatient, nurse: string, shift: string) {
  const patientVitals = icuVitals.filter((row) => row.patientId === patient.id && row.nurse === nurse);
  const fallbackVitals = patientVitals.length ? patientVitals : icuVitals.filter((row) => row.patientId === patient.id);
  const meds = medicationRows.filter((row) => row.patientId === patient.id);
  const nurseMeds = meds.filter((row) => row.administeredBy === nurse || row.status === "Due" || row.status === "Late");
  const ioRows = intakeOutputRows.filter((row) => row.patientId === patient.id && row.nurse === nurse);
  const fallbackIoRows = ioRows.length ? ioRows : intakeOutputRows.filter((row) => row.patientId === patient.id);
  const tasks = icuTasks.filter((row) => row.patientId === patient.id && row.assignedTo === nurse);
  const patientAlerts = icuAlerts.filter((row) => row.patientId === patient.id && row.status !== "Resolved");
  const infusions = infusionRows.filter((row) => row.patientId === patient.id && row.nurse === nurse);
  const intakeTotal = fallbackIoRows.reduce((sum, row) => sum + row.intakeMl, 0);
  const outputTotal = fallbackIoRows.reduce((sum, row) => sum + row.outputMl, 0);
  const balance = intakeTotal - outputTotal;
  const abnormalVitals = fallbackVitals.filter((row) => row.abnormal);
  const dueMeds = meds.filter((row) => row.status === "Due" || row.status === "Late" || row.status === "Held");
  const pendingTasks = tasks.filter((row) => row.status !== "Completed");
  const completedTasks = tasks.filter((row) => row.status === "Completed");
  const pendingIo = fallbackIoRows.filter((row) => row.status === "Pending review");
  const lowUrine = fallbackIoRows.filter((row) => row.kind === "Output" && row.category.toLowerCase().includes("urine") && row.quantityMl < 30);

  const completed = [
    `${fallbackVitals.length} vitals / monitoring entries reviewed`,
    `${nurseMeds.filter((row) => row.status === "Administered").length} medication administration row(s) completed`,
    `${fallbackIoRows.length} intake/output row(s) documented, net balance ${formatHandoverMl(balance)}`,
    `${infusions.filter((row) => row.status === "Running").length} running infusion(s) checked`,
    `${completedTasks.length} assigned task(s) completed`,
  ].filter((item) => !item.startsWith("0 medication") && !item.startsWith("0 running") && !item.startsWith("0 assigned"));

  const pending = [
    ...dueMeds.map((row) => `${row.medication} ${row.status.toLowerCase()} at ${row.scheduledTime}`),
    ...pendingTasks.map((row) => `${row.title} - ${row.dueTime}`),
    ...pendingIo.map((row) => `${row.category} entry at ${row.time} pending review`),
    ...patientAlerts.map((row) => `${row.type}: ${row.message}`),
  ];

  const critical = [
    ...abnormalVitals.map((row) => `${row.time} vitals: ${row.note}`),
    ...lowUrine.map((row) => `${row.time} low urine output ${row.quantityMl} ml`),
    ...(balance > 500 ? [`Positive fluid balance ${formatHandoverMl(balance)}`] : []),
    ...patientAlerts.filter((row) => row.severity === "Critical" || row.severity === "High").map((row) => `${row.severity} alert: ${row.message}`),
  ];

  return {
    patientLabel: `${patient.bedNo} - ${patient.patientName}`,
    nurse,
    shift,
    metrics: [
      { label: "Vitals", value: fallbackVitals.length, detail: abnormalVitals.length ? `${abnormalVitals.length} abnormal` : "No abnormal entry", tone: abnormalVitals.length ? "danger" as StatusTone : "success" as StatusTone },
      { label: "Medication", value: nurseMeds.length, detail: dueMeds.length ? `${dueMeds.length} pending/due` : "No pending medicine", tone: dueMeds.length ? "warning" as StatusTone : "success" as StatusTone },
      { label: "I/O balance", value: formatHandoverMl(balance), detail: `${intakeTotal} ml in / ${outputTotal} ml out`, tone: balance > 500 || lowUrine.length ? "warning" as StatusTone : "success" as StatusTone },
      { label: "Open items", value: pending.length, detail: `${patientAlerts.length} alert(s), ${pendingTasks.length} task(s)`, tone: pending.length ? "warning" as StatusTone : "success" as StatusTone },
    ],
    completed: completed.length ? completed : ["Routine shift care documented for selected patient"],
    pending: pending.length ? pending.slice(0, 6) : ["No pending item captured for next shift"],
    critical: critical.length ? Array.from(new Set(critical)).slice(0, 6) : ["No critical watch item captured"],
    suggested: {
      issues: critical.length ? Array.from(new Set(critical)).slice(0, 3).join(" | ") : `${patient.currentStatus}; continue routine ICU observation.`,
      pendingTests: patientAlerts.some((alert) => alert.type.toLowerCase().includes("lab")) ? "Critical/pending lab alert requires follow-up." : "No pending test captured in shift summary.",
      pendingMeds: dueMeds.length ? dueMeds.map((row) => `${row.medication} ${row.status.toLowerCase()} at ${row.scheduledTime}`).join(" | ") : "No pending medication captured.",
      risks: [abnormalVitals.length ? "Abnormal vitals watch" : "", lowUrine.length ? "Low urine output watch" : "", balance > 500 ? "Positive balance watch" : "", patientAlerts.length ? "Open alert follow-up" : ""].filter(Boolean).join(" | ") || "No active escalation risk captured.",
      todos: pending.length ? pending.slice(0, 5).join(" | ") : "Continue scheduled monitoring and routine ICU care.",
    },
  };
}

function formatHandoverMl(value: number) {
  return `${value > 0 ? "+" : ""}${value} ml`;
}

function toneBorderClass(tone: StatusTone) {
  if (tone === "danger" || tone === "critical") return "border-danger/30";
  if (tone === "warning") return "border-warning/30";
  if (tone === "success") return "border-success/30";
  return "border-info/30";
}

export function NursingTaskBoardWorkspace() {
  const searchParams = useSearchParams();
  const requestedTaskTab = normalizeTaskBoardTab(searchParams.get("taskTab"));
  const requestedPatientId = searchParams.get("patientId") ?? undefined;
  const focusedPatient = requestedPatientId ? icuPatients.find((patient) => patient.id === requestedPatientId) : undefined;
  const focusedPatientLabel = focusedPatient ? taskPatientLabel(focusedPatient) : undefined;
  const [tasks, setTasks] = React.useState<IcuTask[]>(icuTasks);
  const [query, setQuery] = React.useState("");
  const [owner, setOwner] = React.useState("All nurses");
  const [source, setSource] = React.useState("All sources");
  const [patientFilter, setPatientFilter] = React.useState(focusedPatientLabel ?? "All patients");
  const [unitFilter, setUnitFilter] = React.useState("All ICU units");
  const [priorityFilter, setPriorityFilter] = React.useState("All priority");
  const [statusFilter, setStatusFilter] = React.useState("Open tasks");
  const [activeAction, setActiveAction] = React.useState<TaskActionState>(null);
  const [assessmentRecords, setAssessmentRecords] = React.useState<NursingAssessmentRecord[]>(() => buildInitialAssessmentRecords());
  const sourceOptions = React.useMemo(() => ["All sources", ...Array.from(new Set([...tasks.map((task) => task.source ?? task.createdBy), ...nurseTaskScenarios.map((scenario) => scenario.source)]))], [tasks]);
  const taskOwnerOptions = React.useMemo(() => ["All nurses", ...Array.from(new Set([...allNurses, ...tasks.map((task) => task.assignedTo)]))], [tasks]);
  const patientOptions = React.useMemo(() => ["All patients", ...icuPatients.map((patient) => taskPatientLabel(patient))], []);
  const unitOptions = React.useMemo(() => ["All ICU units", ...Array.from(new Set(icuPatients.map((patient) => patient.unit)))], []);

  const visibleTasks = tasks.filter((task) => {
    const patient = icuPatients.find((item) => item.id === task.patientId);
    const taskSource = task.source ?? task.createdBy;
    const searchable = `${task.patientName} ${task.bedNo} ${task.title} ${task.remarks} ${task.createdBy} ${task.assignedBy ?? ""} ${task.assignedTo} ${taskSource} ${task.taskType} ${task.assignmentReason ?? ""}`.toLowerCase();
    return searchable.includes(query.toLowerCase())
      && (!focusedPatient || task.patientId === focusedPatient.id)
      && (owner === "All nurses" || task.assignedTo === owner)
      && (source === "All sources" || taskSource === source)
      && (patientFilter === "All patients" || taskPatientLabel(patient) === patientFilter)
      && (unitFilter === "All ICU units" || patient?.unit === unitFilter)
      && (priorityFilter === "All priority" || task.priority === priorityFilter)
      && (statusFilter === "All status"
        || (statusFilter === "Open tasks" && task.status !== "Completed")
        || (statusFilter === "Due / attention" && ["Overdue", "Escalated"].includes(task.status))
        || task.status === statusFilter);
  });

  const changeStatus = (taskId: string, status: IcuTask["status"], note?: string) => {
    setTasks((rows) => rows.map((task) => task.id === taskId ? {
      ...task,
      status,
      acknowledgementStatus: status === "Accepted" ? "Accepted" : task.acknowledgementStatus,
      remarks: note ? `${task.remarks} | ${status}: ${note}` : task.remarks,
    } : task));
    toast.success(`Task marked ${status}`);
  };

  const createTask = (draft: NurseTaskDraft) => {
    const patient = icuPatients.find((row) => row.id === draft.patientId);
    if (!patient || !draft.title.trim() || !draft.assignedTo.trim()) {
      toast.error("Patient, task title, and assigned nurse are required.");
      return;
    }
    const dueTime = formatNurseTaskDueTime(draft);
    const remarks = [
      draft.context ? `${getNurseTaskScenario(draft.scenarioId)?.contextLabel ?? "Context"}: ${draft.context}` : "",
      draft.repeat ? `Repeat: ${draft.repeat}` : "",
      draft.assignmentReason ? `Assigned reason: ${draft.assignmentReason}` : "",
      draft.escalation ? `Escalation: ${draft.escalation}` : "",
      draft.notes,
    ].filter(Boolean).join(" | ");

    const newTask: IcuTask = {
      id: `task-${Date.now()}`,
      patientId: patient.id,
      bedNo: patient.bedNo,
      patientName: patient.patientName,
      taskType: draft.taskType,
      title: draft.title.trim(),
      priority: draft.priority,
      dueTime,
      status: draft.requiresAcknowledgement ? "Assigned" : "Pending",
      createdBy: draft.assignedBy,
      assignedTo: draft.assignedTo,
      remarks: remarks || "Task created from nursing task center",
      source: draft.source,
      assignedBy: draft.assignedBy,
      assignedByRole: draft.assignedByRole,
      assignedToRole: draft.assignedToRole,
      assignmentReason: draft.assignmentReason,
      originalOwner: draft.assignedTo,
      escalationOwner: draft.escalationOwner,
      requiresAcknowledgement: draft.requiresAcknowledgement,
      acknowledgementStatus: draft.requiresAcknowledgement ? "Pending" : "Not required",
      assignedAt: "Now",
    };

    setTasks((current) => [newTask, ...current]);
    setOwner("All nurses");
    setSource("All sources");
    toast.success(`${newTask.title} created for ${newTask.bedNo}`);
  };

  const createAssessmentTask = (task: IcuTask) => {
    setTasks((current) => [task, ...current]);
    toast.success(`Follow-up task created for ${task.bedNo}`);
  };

  const resetFilters = () => {
    setQuery("");
    setOwner("All nurses");
    setSource("All sources");
    setPatientFilter(focusedPatientLabel ?? "All patients");
    setUnitFilter("All ICU units");
    setPriorityFilter("All priority");
    setStatusFilter("Open tasks");
  };

  React.useEffect(() => {
    if (focusedPatientLabel) {
      setPatientFilter(focusedPatientLabel);
    }
  }, [focusedPatientLabel]);

  return (
    <div className="space-y-4">
      <details className="group overflow-hidden rounded-md border border-border bg-surface shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">Tasks & assessments summary</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {(focusedPatientLabel ?? patientFilter)} | {unitFilter} | {priorityFilter} | {visibleTasks.length} visible
            </span>
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-border">
          <div className="grid gap-2 bg-surface-muted p-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricTile label="Total tasks" value={visibleTasks.length} tone="info" icon={ListChecks} />
            <MetricTile label="Due / attention" value={visibleTasks.filter((task) => task.status === "Overdue" || task.status === "Escalated").length} tone="critical" icon={AlertTriangle} />
            <MetricTile label="In progress" value={visibleTasks.filter((task) => task.status === "In progress").length} tone="warning" icon={Clock} />
            <MetricTile label="Accepted" value={visibleTasks.filter((task) => task.status === "Accepted").length} tone="info" icon={Check} />
            <MetricTile label="Completed" value={visibleTasks.filter((task) => task.status === "Completed").length} tone="success" icon={CheckCircle2} />
          </div>
          <div className="grid gap-3 border-t border-border p-4 lg:grid-cols-[minmax(260px,1fr)_180px_180px_170px_170px_180px_170px_110px] lg:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Search tasks</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Patient, bed, task, source..." value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
            </label>
            <NativeSelect
              label="Patient"
              value={focusedPatientLabel ?? patientFilter}
              onChange={focusedPatientLabel ? () => undefined : setPatientFilter}
              options={focusedPatientLabel ? [focusedPatientLabel] : patientOptions}
            />
            <NativeSelect label="ICU unit" value={unitFilter} onChange={setUnitFilter} options={unitOptions} />
            <NativeSelect label="Priority" value={priorityFilter} onChange={setPriorityFilter} options={["All priority", "Critical", "High", "Medium", "Routine"]} />
            <NativeSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["Open tasks", "Due / attention", "All status", "Assigned", "Accepted", "Pending", "In progress", "Overdue", "Escalated", "Completed"]} />
            <NativeSelect label="Assigned nurse" value={owner} onChange={setOwner} options={taskOwnerOptions} />
            <NativeSelect label="Source" value={source} onChange={setSource} options={sourceOptions} />
            <Button className="h-10" variant="outline" onClick={resetFilters}><Filter className="h-4 w-4" />Reset</Button>
          </div>
        </div>
      </details>

      <Tabs key={`${requestedTaskTab}-${requestedPatientId ?? "all"}`} defaultValue={requestedTaskTab} className="space-y-4">
        <div className="rounded-sm border border-border bg-surface px-3 py-2 shadow-sm">
          <TabsList className="flex h-auto flex-wrap gap-2 bg-surface-muted p-1">
            <TabsTrigger className="min-h-9 px-4" value="dashboard">Task Dashboard</TabsTrigger>
            <TabsTrigger className="min-h-9 px-4" value="create">Create Task</TabsTrigger>
            <TabsTrigger className="min-h-9 px-4" value="assessments">Assessments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-0 space-y-4" value="dashboard">
          <TaskDashboardTable
            assessments={assessmentRecords}
            tasks={visibleTasks}
            onOpenAction={(task, nextStatus) => setActiveAction({ task, nextStatus })}
          />
        </TabsContent>

        <TabsContent className="mt-0" value="create">
          <CreateNurseTaskPanel onCreateTask={createTask} />
        </TabsContent>

        <TabsContent className="mt-0" value="assessments">
          <NursingAssessmentWorkspace key={requestedPatientId ?? "assessment-default"} initialPatientId={requestedPatientId} records={assessmentRecords} onRecordsChange={setAssessmentRecords} onCreateFollowUpTask={createAssessmentTask} />
        </TabsContent>
      </Tabs>

      <TaskActionDialog
        action={activeAction}
        onConfirm={(task, nextStatus, note) => {
          changeStatus(task.id, nextStatus, note);
          setActiveAction(null);
        }}
        onOpenChange={(open) => !open && setActiveAction(null)}
      />
    </div>
  );
}

function TaskDashboardTable({
  assessments,
  tasks,
  onOpenAction,
}: {
  assessments: NursingAssessmentRecord[];
  tasks: IcuTask[];
  onOpenAction: (task: IcuTask, nextStatus: IcuTask["status"]) => void;
}) {
  const rows = buildTaskMatrixGroups(tasks, assessments);
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const rowSignature = rows.map((row) => row.patientId).join("|");
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = rows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(currentPage * pageSize, rows.length);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [assessmentPreview, setAssessmentPreview] = React.useState<NursingAssessmentRecord | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [rowSignature]);

  return (
    <>
      <div className="overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">Task command matrix</p>
          </div>
        </div>
        <div className="max-h-[660px] overflow-auto">
          <table className="w-full min-w-[1420px] border-collapse bg-white text-sm">
            <thead className="sticky top-0 z-20">
              <tr className="border-b border-slate-300 bg-white text-[11px] uppercase text-sky-700">
                <th className="sticky left-0 z-40 min-w-[230px] bg-white px-3 py-3 text-left">Patient</th>
                <th className="min-w-[140px] px-3 py-3 text-center">Assessment</th>
                <th className="min-w-[140px] px-3 py-3 text-center">Due task</th>
                <th className="min-w-[140px] px-3 py-3 text-center">Medication</th>
                <th className="min-w-[140px] px-3 py-3 text-center">Monitoring</th>
                <th className="min-w-[140px] px-3 py-3 text-center">I/O</th>
                <th className="min-w-[140px] px-3 py-3 text-center">Lab / Rad</th>
                <th className="min-w-[140px] px-3 py-3 text-center">Handover</th>
                <th className="min-w-[200px] px-4 py-3 text-left">Owner</th>
                <th className="min-w-[250px] px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const topTask = row.topTask;
                const assessmentItem = taskMatrixAssessmentItem(row.assessment);
                const dueItem = taskMatrixTaskItem(topTask, "No open task", "Patient task queue clear");
                const medicationItem = taskMatrixSourceItem(row, ["Medication / eMAR"], ["medication", "medicine", "drug", "emAR"]);
                const monitoringItem = taskMatrixSourceItem(row, ["Vitals / monitoring"], ["vital", "monitor", "spo2", "gcs", "pain"]);
                const ioItem = taskMatrixSourceItem(row, ["Intake / output"], ["urine", "output", "intake", "fluid", "drain"]);
                const labItem = taskMatrixSourceItem(row, ["Lab / radiology"], ["lab", "radiology", "report", "sample", "x-ray", "ct"]);
                const handoverItem = taskMatrixSourceItem(row, ["Shift handover"], ["handover", "carry"]);
                return (
                  <tr className="border-b border-slate-200 last:border-b-0 hover:bg-sky-50/40" key={row.patientId}>
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 align-middle shadow-[8px_0_14px_-15px_rgba(15,23,42,0.45)]">
                      <TaskMatrixPatientCell row={row} />
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <TaskMatrixCell
                        detail={assessmentItem.detail}
                        href={!row.assessment ? taskMatrixAssessmentHref(row.patientId) : undefined}
                        icon={ClipboardCheck}
                        title={assessmentItem.title}
                        tone={assessmentItem.tone}
                        onClick={row.assessment ? () => setAssessmentPreview(row.assessment ?? null) : undefined}
                      />
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <TaskMatrixCell
                        detail={dueItem.detail}
                        icon={ListChecks}
                        title={dueItem.title}
                        tone={dueItem.tone}
                        onClick={() => openTaskMatrixItem(dueItem, onOpenAction)}
                      />
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <TaskMatrixCell
                        detail={medicationItem.detail}
                        href={taskMatrixPatientDetailHref(row.patientId, "orders")}
                        icon={Pill}
                        title={medicationItem.title}
                        tone={medicationItem.tone}
                      />
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <TaskMatrixCell
                        detail={monitoringItem.detail}
                        href={taskMatrixPatientDetailHref(row.patientId, "monitoring", "24h-chart")}
                        icon={HeartPulse}
                        title={monitoringItem.title}
                        tone={monitoringItem.tone}
                      />
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <TaskMatrixCell
                        detail={ioItem.detail}
                        href={taskMatrixPatientDetailHref(row.patientId, "monitoring", "intake-output")}
                        icon={Syringe}
                        title={ioItem.title}
                        tone={ioItem.tone}
                      />
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <TaskMatrixCell
                        detail={labItem.detail}
                        href={taskMatrixPatientDetailHref(row.patientId, "results", undefined, taskMatrixResultQuery(labItem.task))}
                        icon={FileText}
                        title={labItem.title}
                        tone={labItem.tone}
                      />
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <TaskMatrixCell
                        detail={handoverItem.detail}
                        href={taskMatrixPatientDetailHref(row.patientId, "shift-summary")}
                        icon={ArrowRight}
                        title={handoverItem.title}
                        tone={handoverItem.tone}
                      />
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <p className="text-sm font-bold text-slate-950">{topTask?.assignedTo ?? row.patient?.assignedWardNurse ?? "Ward Nurse"}</p>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <TaskMatrixActionButtons task={topTask} bedNo={row.bedNo} onOpenAction={onOpenAction} />
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={10}>No task rows matched the selected filters.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {rows.length ? (
          <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">Showing {pageStart}-{pageEnd} of {rows.length}</span>
            <div className="flex items-center gap-2">
              <Button
                disabled={currentPage <= 1}
                size="sm"
                variant="outline"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                disabled={currentPage >= totalPages}
                size="sm"
                variant="outline"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <TaskAssessmentPreviewDialog assessment={assessmentPreview} onOpenChange={(open) => !open && setAssessmentPreview(null)} />
    </>
  );
}

type TaskMatrixItem = {
  task?: IcuTask;
  title: string;
  detail: string;
  tone: StatusTone;
};

type TaskMatrixGroup = {
  patient?: IcuPatient;
  patientId: string;
  bedNo: string;
  patientName: string;
  unit: string;
  mrn: string;
  tasks: IcuTask[];
  topTask?: IcuTask;
  assessment?: NursingAssessmentRecord;
};

function TaskMatrixPatientCell({ row }: { row: TaskMatrixGroup }) {
  const tone = row.topTask ? taskMatrixToneFromTask(row.topTask) : taskMatrixToneFromAssessment(row.assessment);
  return (
    <Link className="block min-h-16 w-full rounded-md border border-transparent bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm" href={taskMatrixPatientDetailHref(row.patientId, "overview")}>
      <p className={cn("truncate text-sm font-bold", taskMatrixTextClass(tone))}>{row.patientName}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-700">{row.bedNo} | {row.unit}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{row.mrn}</p>
    </Link>
  );
}

function TaskMatrixCell({
  detail,
  href,
  icon: Icon,
  onClick,
  title,
  tone,
}: {
  detail: string;
  href?: string;
  icon: React.ElementType;
  onClick?: () => void;
  title: string;
  tone: StatusTone;
}) {
  const content = (
      <span className="flex min-h-14 w-full min-w-24 flex-col items-center justify-center">
        <span className={cn("inline-flex h-9 min-w-24 items-center justify-center gap-1 rounded-full px-3 text-xs font-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.28)]", taskMatrixSolidClass(tone))}>
          <Icon className="h-3.5 w-3.5" />
          {title}
        </span>
      </span>
  );

  if (href) {
    return (
      <Link className="inline-flex w-full justify-center" href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className="inline-flex w-full justify-center"
      type="button"
      onClick={onClick}
    >
      {content}
    </button>
  );
}

function taskMatrixPatientDetailHref(patientId: string, tab: "overview" | "monitoring" | "results" | "orders" | "events" | "shift-summary", subtab?: "24h-chart" | "intake-output" | "device-snapshot", extraQuery = "") {
  const subtabQuery = tab === "monitoring" && subtab ? `&subtab=${subtab}` : "";
  const normalizedExtra = extraQuery ? `&${extraQuery.replace(/^\?/, "").replace(/^&/, "")}` : "";
  return `/icu-command-center/patients/${patientId}?tab=${tab}${subtabQuery}${normalizedExtra}`;
}

function taskMatrixAssessmentHref(patientId: string) {
  return `/icu-command-center/nursing/tasks-assessments?taskTab=assessments&patientId=${patientId}`;
}

function taskMatrixResultQuery(task?: IcuTask) {
  const haystack = `${task?.source ?? ""} ${task?.taskType ?? ""} ${task?.title ?? ""} ${task?.remarks ?? ""}`.toLowerCase();
  if (haystack.includes("radiology") || haystack.includes("x-ray") || haystack.includes("ct") || haystack.includes("ultrasound")) return "type=radiology";
  return "type=pathology";
}

function TaskAssessmentPreviewDialog({ assessment, onOpenChange }: { assessment: NursingAssessmentRecord | null; onOpenChange: (open: boolean) => void }) {
  const patient = assessment ? icuPatients.find((row) => row.id === assessment.patientId) : undefined;

  return (
    <Dialog.Root open={Boolean(assessment)} onOpenChange={onOpenChange}>
      {assessment ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-border bg-surface shadow-soft outline-none">
            <div className="border-b border-border bg-sky-700 px-4 py-3 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Title className="text-base font-semibold">{assessment.type}</Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-sky-50">
                    {assessment.bedNo} - {assessment.patientLabel} | {assessment.createdAt} | {assessment.nurse}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <Button className="border-white/30 bg-white/10 text-white hover:bg-white/20" size="sm" variant="outline">Close</Button>
                </Dialog.Close>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <MetricTile label="Score / level" value={assessment.score} tone={assessment.risk === "Critical" ? "critical" : assessment.risk === "High" ? "danger" : assessment.risk === "Medium" ? "warning" : "info"} icon={ClipboardCheck} />
                <MetricTile label="Risk" value={assessment.risk} tone={toneForPriority(assessment.risk)} icon={AlertTriangle} />
                <MetricTile label="Status" value={assessment.status} tone={taskMatrixToneFromAssessment(assessment)} icon={CheckCircle2} />
              </div>
              <InfoPanel title="Patient context" rows={[
                ["Patient", patient ? `${patient.bedNo} - ${patient.patientName}` : assessment.patientLabel],
                ["MRN", patient?.mrn ?? "-"],
                ["Unit", patient?.unit ?? "-"],
                ["Diagnosis", patient?.diagnosis ?? "-"],
              ]} />
              <div className="grid gap-3 md:grid-cols-2">
                <InfoPanel title="Assessment findings" rows={[["Findings", assessment.findings], ["Follow-up", assessment.followUp]]} />
                <InfoPanel title="Nursing intervention" rows={[["Intervention", assessment.intervention], ["Recorded by", assessment.nurse]]} />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface-muted px-4 py-3">
              <Dialog.Close asChild>
                <Button variant="outline">Close</Button>
              </Dialog.Close>
              <Button variant="outline" asChild>
                <Link href={taskMatrixPatientDetailHref(assessment.patientId, "overview")}>Open patient</Link>
              </Button>
              <Button asChild>
                <Link href={taskMatrixAssessmentHref(assessment.patientId)}>Open assessment form</Link>
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

function TaskMatrixActionButtons({
  bedNo,
  onOpenAction,
  task,
}: {
  bedNo: string;
  onOpenAction: (task: IcuTask, nextStatus: IcuTask["status"]) => void;
  task?: IcuTask;
}) {
  if (!task) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <Button className="h-9 px-2 text-xs" disabled size="sm" variant="outline">Start</Button>
        <Button className="h-9 px-2 text-xs" disabled size="sm" variant="outline">Done</Button>
        <Button className="h-9 px-2 text-xs" disabled size="sm" variant="outline">Escalate</Button>
      </div>
    );
  }

  const firstStatus = task.requiresAcknowledgement && (task.acknowledgementStatus ?? "Pending") !== "Accepted" ? "Accepted" : "In progress";
  const firstLabel = firstStatus === "Accepted" ? "Accept" : "Start";
  const isClosed = task.status === "Completed";

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        className="h-9 px-2 text-xs"
        disabled={isClosed || (firstStatus === "In progress" && task.status === "In progress")}
        size="sm"
        variant="outline"
        onClick={() => onOpenAction(task, firstStatus)}
      >
        {firstLabel}
      </Button>
      <Button
        className="h-9 px-2 text-xs"
        disabled={isClosed}
        size="sm"
        onClick={() => onOpenAction(task, "Completed")}
      >
        Done
      </Button>
      <Button
        className="h-9 px-2 text-xs"
        disabled={isClosed || task.status === "Escalated"}
        size="sm"
        variant="danger"
        onClick={() => onOpenAction(task, "Escalated")}
      >
        Escalate
      </Button>
    </div>
  );
}

function buildTaskMatrixGroups(tasks: IcuTask[], assessments: NursingAssessmentRecord[]): TaskMatrixGroup[] {
  const byPatient = new Map<string, IcuTask[]>();
  tasks.forEach((task) => {
    const current = byPatient.get(task.patientId) ?? [];
    current.push(task);
    byPatient.set(task.patientId, current);
  });

  return Array.from(byPatient.entries()).map(([patientId, patientTasks]) => {
    const patient = icuPatients.find((row) => row.id === patientId);
    const sortedTasks = patientTasks.slice().sort((left, right) => taskMatrixRank(right) - taskMatrixRank(left));
    return {
      patient,
      patientId,
      bedNo: patient?.bedNo ?? sortedTasks[0]?.bedNo ?? "-",
      patientName: patient?.patientName ?? sortedTasks[0]?.patientName ?? "-",
      unit: patient?.unit ?? "-",
      mrn: patient?.mrn ?? "-",
      tasks: sortedTasks,
      topTask: sortedTasks[0],
      assessment: assessments.find((record) => record.patientId === patientId),
    };
  }).sort((left, right) => taskMatrixRank(right.topTask) - taskMatrixRank(left.topTask));
}

function taskMatrixAssessmentItem(assessment?: NursingAssessmentRecord): TaskMatrixItem {
  if (!assessment) return { title: "Not saved", detail: "Assessment pending", tone: "muted" };
  return {
    title: assessment.type.replace(" assessment", ""),
    detail: `${assessment.score} | ${assessment.status}`,
    tone: taskMatrixToneFromAssessment(assessment),
  };
}

function taskMatrixTaskItem(task: IcuTask | undefined, title: string, detail: string): TaskMatrixItem {
  if (!task) return { title, detail, tone: "success" };
  return {
    task,
    title: task.status === "Completed" ? "Completed" : task.dueTime,
    detail: task.title,
    tone: taskMatrixToneFromTask(task),
  };
}

function taskMatrixSourceItem(group: TaskMatrixGroup, sources: string[], keywords: string[]): TaskMatrixItem {
  const task = group.tasks.find((row) => {
    const source = row.source ?? row.createdBy;
    const haystack = `${source} ${row.taskType} ${row.title} ${row.remarks}`.toLowerCase();
    return sources.includes(source) || keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
  });
  return taskMatrixTaskItem(task, "Clear", "No pending item");
}

function openTaskMatrixItem(item: TaskMatrixItem, onOpenAction: (task: IcuTask, nextStatus: IcuTask["status"]) => void) {
  if (!item.task) {
    toast.info(item.detail);
    return;
  }
  if (item.task.status === "Completed") {
    toast.success(`${item.task.bedNo}: ${item.task.title} already completed`);
    return;
  }
  onOpenAction(item.task, nextTaskAction(item.task));
}

function nextTaskAction(task: IcuTask): IcuTask["status"] {
  const needsAck = task.requiresAcknowledgement && (task.acknowledgementStatus ?? "Pending") !== "Accepted";
  if (needsAck) return "Accepted";
  if (task.status === "Assigned" || task.status === "Pending") return "In progress";
  if (task.status === "Overdue") return "Escalated";
  return "Completed";
}

function taskMatrixRank(task?: IcuTask) {
  if (!task) return 0;
  const priorityScore: Record<IcuTask["priority"], number> = { Critical: 80, High: 60, Medium: 35, Routine: 15 };
  const statusScore: Record<IcuTask["status"], number> = {
    Overdue: 45,
    Escalated: 40,
    Assigned: 30,
    Pending: 25,
    Accepted: 20,
    "In progress": 18,
    Completed: 0,
  };
  return priorityScore[task.priority] + statusScore[task.status];
}

function taskMatrixToneFromTask(task: IcuTask): StatusTone {
  if (task.status === "Overdue" || task.priority === "Critical") return "critical";
  if (task.status === "Escalated" || task.priority === "High") return "danger";
  if (task.status === "Completed") return "success";
  if (task.status === "In progress" || task.status === "Accepted") return "info";
  if (task.priority === "Medium" || task.status === "Assigned" || task.status === "Pending") return "warning";
  return "info";
}

function taskMatrixToneFromAssessment(assessment?: NursingAssessmentRecord): StatusTone {
  if (!assessment) return "muted";
  if (assessment.status === "Escalated" || assessment.risk === "Critical") return "critical";
  if (assessment.risk === "High") return "danger";
  if (assessment.status === "Completed") return "success";
  if (assessment.status === "Needs follow-up" || assessment.risk === "Medium") return "warning";
  return "info";
}

function taskMatrixSolidClass(tone: StatusTone) {
  if (tone === "critical" || tone === "danger") return "bg-red-600";
  if (tone === "warning") return "bg-orange-500";
  if (tone === "success") return "bg-green-700";
  if (tone === "muted") return "bg-zinc-700";
  return "bg-sky-600";
}

function taskMatrixPillClass(tone: StatusTone) {
  if (tone === "critical" || tone === "danger") return "border-red-500 bg-red-50 text-red-700";
  if (tone === "warning") return "border-orange-400 bg-orange-50 text-orange-700";
  if (tone === "success") return "border-green-500 bg-green-50 text-green-700";
  if (tone === "muted") return "border-zinc-400 bg-zinc-50 text-zinc-700";
  return "border-sky-400 bg-sky-50 text-sky-700";
}

function taskMatrixDotClass(tone: StatusTone) {
  if (tone === "critical" || tone === "danger") return "bg-danger";
  if (tone === "warning") return "bg-warning";
  if (tone === "success") return "bg-success";
  if (tone === "muted") return "bg-muted-foreground";
  return "bg-info";
}

function taskMatrixTextClass(tone: StatusTone) {
  if (tone === "critical" || tone === "danger") return "text-red-700";
  if (tone === "warning") return "text-orange-700";
  if (tone === "success") return "text-green-700";
  if (tone === "muted") return "text-slate-700";
  return "text-sky-700";
}

function TaskActionDialog({
  action,
  onConfirm,
  onOpenChange,
}: {
  action: TaskActionState;
  onConfirm: (task: IcuTask, nextStatus: IcuTask["status"], note: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={Boolean(action)} onOpenChange={onOpenChange}>
      {action ? <TaskActionDialogContent key={`${action.task.id}-${action.nextStatus}`} action={action} onConfirm={onConfirm} /> : null}
    </Dialog.Root>
  );
}

function TaskActionDialogContent({
  action,
  onConfirm,
}: {
  action: Exclude<TaskActionState, null>;
  onConfirm: (task: IcuTask, nextStatus: IcuTask["status"], note: string) => void;
}) {
  const task = action.task;
  const nextStatus = action.nextStatus;
  const [reason, setReason] = React.useState(taskActionReasons(nextStatus)[0] ?? "");
  const [nextReview, setNextReview] = React.useState(nextStatus === "Completed" ? "No further review" : "Next 30 min");
  const [note, setNote] = React.useState(nextStatus === "Escalated" ? "Escalated with current patient context and pending action." : "");
  const [identityChecked, setIdentityChecked] = React.useState(true);
  const [handoverChecked, setHandoverChecked] = React.useState(false);
  const canConfirm = Boolean(reason && identityChecked);

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-border bg-surface shadow-soft outline-none">
        <div className="border-b border-border bg-sky-700 px-4 py-3 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-base font-semibold">{taskActionTitle(nextStatus)}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-sky-50">{task.bedNo} - {task.patientName} | Current: {task.status}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button className="border-white/30 bg-white/10 text-white hover:bg-white/20" size="sm" variant="outline">Close</Button>
            </Dialog.Close>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={toneForPriority(task.priority)}>{task.priority}</Badge>
              <Badge tone="info">{task.source ?? task.createdBy}</Badge>
              <Badge tone={nextStatus === "Escalated" ? "danger" : nextStatus === "Completed" ? "success" : "warning"}>{nextStatus}</Badge>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{task.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{task.remarks}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField label="Action reason" value={reason} onChange={setReason} options={taskActionReasons(nextStatus)} />
            <SelectField label="Next review" value={nextReview} onChange={setNextReview} options={["No further review", "Next 15 min", "Next 30 min", "Next 1 hour", "Before shift handover", "Doctor review required"]} />
            <InfoPanel title="Assignment" rows={[
              ["Assigned by", task.assignedBy ?? task.createdBy],
              ["Assigned to", task.assignedTo],
              ["Escalation owner", task.escalationOwner ?? "Duty Doctor"],
            ]} />
            <InfoPanel title="Timing" rows={[
              ["Due time", task.dueTime],
              ["Assigned at", task.assignedAt ?? "Shift start"],
              ["Acknowledgement", task.acknowledgementStatus ?? "Not required"],
            ]} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <input checked={identityChecked} className="h-4 w-4 rounded border-border" type="checkbox" onChange={(event) => setIdentityChecked(event.target.checked)} />
              <span className="font-medium text-foreground">Patient context reviewed</span>
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <input checked={handoverChecked} className="h-4 w-4 rounded border-border" type="checkbox" onChange={(event) => setHandoverChecked(event.target.checked)} />
              <span className="font-medium text-foreground">Carry forward to handover if pending</span>
            </label>
          </div>
          <TextAreaField label="Action note" value={note} onChange={setNote} placeholder="Capture condition, communication, result, blocker, or completion evidence..." />
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface-muted px-4 py-3">
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button disabled={!canConfirm} onClick={() => onConfirm(task, nextStatus, [reason, nextReview, handoverChecked ? "Carry forward to handover" : "", note].filter(Boolean).join(" | "))}>
            <CheckCircle2 className="h-4 w-4" />Confirm {nextStatus}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

function NursingAssessmentWorkspace({
  initialPatientId,
  onCreateFollowUpTask,
  onRecordsChange,
  records,
}: {
  initialPatientId?: string;
  onCreateFollowUpTask: (task: IcuTask) => void;
  onRecordsChange: React.Dispatch<React.SetStateAction<NursingAssessmentRecord[]>>;
  records: NursingAssessmentRecord[];
}) {
  const initialPatient = icuPatients.find((patient) => patient.id === initialPatientId) ?? icuPatients[0];
  const initialTemplate = initialPatient ? assessmentTemplate("Neuro assessment", initialPatient) : null;
  const [patientId, setPatientId] = React.useState(initialPatient?.id ?? "");
  const [assessmentType, setAssessmentType] = React.useState<NursingAssessmentType>("Neuro assessment");
  const [score, setScore] = React.useState(initialTemplate?.score ?? "Moderate");
  const [risk, setRisk] = React.useState<IcuTask["priority"]>(initialTemplate?.risk ?? "Medium");
  const [status, setStatus] = React.useState<AssessmentStatus>(initialTemplate?.status ?? "Needs follow-up");
  const [findings, setFindings] = React.useState(initialTemplate?.findings ?? "");
  const [intervention, setIntervention] = React.useState(initialTemplate?.intervention ?? "");
  const [followUp, setFollowUp] = React.useState(initialTemplate?.followUp ?? "Reassess in 1 hour");
  const [createTask, setCreateTask] = React.useState(initialTemplate?.status !== "Completed");
  const patient = icuPatients.find((row) => row.id === patientId) ?? icuPatients[0];
  const latestVital = icuVitals.filter((row) => row.patientId === patient?.id).at(-1);

  const applyTemplate = (nextType: NursingAssessmentType, nextPatientId = patientId) => {
    const nextPatient = icuPatients.find((row) => row.id === nextPatientId) ?? icuPatients[0];
    if (!nextPatient) return;
    const template = assessmentTemplate(nextType, nextPatient);
    setAssessmentType(nextType);
    setPatientId(nextPatientId);
    setScore(template.score);
    setRisk(template.risk);
    setStatus(template.status);
    setFindings(template.findings);
    setIntervention(template.intervention);
    setFollowUp(template.followUp);
    setCreateTask(template.status !== "Completed");
  };

  const saveAssessment = () => {
    if (!patient) return;
    const record: NursingAssessmentRecord = {
      id: `assess-${Date.now()}`,
      patientId: patient.id,
      patientLabel: patient.patientName,
      bedNo: patient.bedNo,
      type: assessmentType,
      score,
      risk,
      status,
      findings,
      intervention,
      followUp,
      nurse: patient.assignedWardNurse,
      createdAt: "Just now",
    };
    onRecordsChange((current) => [record, ...current]);
    if (createTask && status !== "Completed") {
      onCreateFollowUpTask({
        id: `task-assess-${Date.now()}`,
        patientId: patient.id,
        bedNo: patient.bedNo,
        patientName: patient.patientName,
        taskType: `${assessmentType} follow-up`,
        title: `${assessmentType}: ${followUp}`,
        priority: risk,
        dueTime: followUp,
        status: "Assigned",
        createdBy: "Nursing assessment",
        assignedTo: patient.assignedWardNurse,
        remarks: `${findings} | Intervention: ${intervention}`,
        source: "Nursing assessment",
        assignedBy: patient.assignedWardNurse,
        assignedByRole: "Ward Nurse",
        assignedToRole: "Ward Nurse",
        assignmentReason: "Assessment needs follow-up",
        escalationOwner: patient.dutyDoctor,
        requiresAcknowledgement: true,
        acknowledgementStatus: "Pending",
        assignedAt: "Just now",
      });
    }
    toast.success(`${assessmentType} saved for ${patient.bedNo}`);
  };

  const patientRecords = records.filter((record) => record.patientId === patient?.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <SelectField label="Patient / bed" value={patientId} onChange={(value) => applyTemplate(assessmentType, value)} options={icuPatients.map((row) => row.id)} renderOption={(id) => {
              const row = icuPatients.find((item) => item.id === id);
              return row ? `${row.bedNo} - ${row.patientName}` : id;
            }} />
            <SelectField label="Assessment type" value={assessmentType} onChange={(value) => applyTemplate(value as NursingAssessmentType)} options={nursingAssessmentTypes} />
            <SelectField label="Risk" value={risk} onChange={(value) => setRisk(value as IcuTask["priority"])} options={["Critical", "High", "Medium", "Routine"]} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={risk === "Critical" ? "critical" : risk === "High" ? "danger" : risk === "Medium" ? "warning" : "info"}>{risk}</Badge>
            <Badge tone="muted">{status}</Badge>
            <Badge tone="info">{assessmentType}</Badge>
          </div>
          <div className="grid gap-3 rounded-md border border-border bg-surface-muted p-3 md:grid-cols-3">
            <InfoLine label="Diagnosis" value={patient?.diagnosis ?? "-"} />
            <InfoLine label="Latest vitals" value={latestVital ? `SpO2 ${latestVital.spo2}%, BP ${latestVital.bp}` : patient?.lastVitalsTime ?? "-"} />
            <InfoLine label="Assigned nurse" value={patient?.assignedWardNurse ?? "-"} />
          </div>
          <FormGrid>
            <SelectField label="Score / level" value={score} onChange={setScore} options={assessmentScoreOptions(assessmentType)} />
            <SelectField label="Assessment status" value={status} onChange={(value) => setStatus(value as AssessmentStatus)} options={["Draft", "Completed", "Needs follow-up", "Escalated"]} />
            <TextAreaField label="Assessment findings" value={findings} onChange={setFindings} placeholder="Assessment findings..." />
            <TextAreaField label="Nursing intervention" value={intervention} onChange={setIntervention} placeholder="Intervention, education, escalation, device care..." />
            <TextField label="Follow-up / reassessment" value={followUp} onChange={setFollowUp} placeholder="Reassess in 1 hour" wide />
          </FormGrid>
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <input checked={createTask} className="h-4 w-4 rounded border-border" type="checkbox" onChange={(event) => setCreateTask(event.target.checked)} />
              <span className="font-medium text-foreground">Create follow-up task</span>
            </label>
            <Button onClick={saveAssessment}><Save className="h-4 w-4" />Save assessment</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessment history</CardTitle>
          <Badge tone="info">{patientRecords.length}</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 xl:grid-cols-2">
          {patientRecords.map((record) => (
            <div className={cn("rounded-md border p-3", toneBorderClass(record.risk === "Critical" ? "critical" : record.risk === "High" ? "danger" : record.risk === "Medium" ? "warning" : "info"))} key={record.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{record.type}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{record.createdAt} | {record.nurse}</p>
                </div>
                <StatusPill tone={record.status === "Escalated" ? "danger" : record.status === "Completed" ? "success" : "warning"}>{record.status}</StatusPill>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{record.findings}</p>
              <p className="mt-2 text-xs font-semibold text-foreground">Follow-up: {record.followUp}</p>
            </div>
          ))}
          {!patientRecords.length ? <EmptyPanel title="No assessment records" detail="Save an assessment to create patient history." /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function taskPatientLabel(patient?: IcuPatient) {
  return patient ? `${patient.bedNo} - ${patient.patientName}` : "";
}

function taskActionTitle(status: IcuTask["status"]) {
  if (status === "Accepted") return "Accept task";
  if (status === "In progress") return "Start task";
  if (status === "Completed") return "Complete task";
  if (status === "Escalated") return "Escalate task";
  return `Mark ${status}`;
}

function taskActionReasons(status: IcuTask["status"]) {
  if (status === "Accepted") return ["Patient context reviewed", "Received from handover", "Doctor order acknowledged", "Assigned workload accepted"];
  if (status === "In progress") return ["Started bedside action", "Patient assessment started", "Sample / report follow-up started", "Medication / device check started"];
  if (status === "Completed") return ["Completed as ordered", "Vitals / assessment documented", "Medication action completed", "Report followed up and informed", "Checklist completed"];
  if (status === "Escalated") return ["Patient condition changed", "Task overdue", "Medicine / report unavailable", "Device or line issue", "Need doctor review", "Need head nurse support"];
  return ["Status updated"];
}

function assessmentTemplate(type: NursingAssessmentType, patient: IcuPatient): Pick<NursingAssessmentRecord, "score" | "risk" | "status" | "findings" | "intervention" | "followUp"> {
  const latest = icuVitals.filter((row) => row.patientId === patient.id).at(-1);
  if (type === "Respiratory assessment") {
    const risk: IcuTask["priority"] = (latest?.spo2 ?? 96) < 92 || /vent|niv/i.test(patient.ventilatorStatus) ? "High" : "Medium";
    return { score: patient.ventilatorStatus, risk, status: "Needs follow-up", findings: `Respiratory status reviewed. SpO2 ${latest?.spo2 ?? "-"}%, support: ${patient.ventilatorStatus}.`, intervention: "Check oxygen interface, suction readiness, respiratory effort, and escalation need.", followUp: "Reassess in 30 min" };
  }
  if (type === "Neuro assessment") {
    const risk: IcuTask["priority"] = (latest?.gcs ?? 15) < 13 ? "High" : "Medium";
    return { score: `GCS ${latest?.gcs ?? "not recorded"}`, risk, status: risk === "High" ? "Needs follow-up" : "Completed", findings: `Neuro status reviewed for ${patient.diagnosis}.`, intervention: "Document GCS, pupils, limb response, aspiration precaution, and report change.", followUp: "Hourly neuro check" };
  }
  if (type === "Pain assessment") {
    const risk: IcuTask["priority"] = (latest?.painScore ?? 0) >= 6 ? "High" : "Medium";
    return { score: `Pain ${latest?.painScore ?? "-"}/10`, risk, status: risk === "High" ? "Needs follow-up" : "Completed", findings: "Pain score and comfort reviewed.", intervention: "Positioning, prescribed analgesia follow-up, and reassessment after intervention.", followUp: "Reassess in 1 hour" };
  }
  if (type === "Skin / pressure risk") return { score: "Moderate risk", risk: "Medium", status: "Needs follow-up", findings: "Pressure area and device-contact points reviewed.", intervention: "Repositioning, skin care, pressure area protection, and documentation.", followUp: "Reassess per shift" };
  if (type === "Fall risk") return { score: "High fall risk", risk: "High", status: "Needs follow-up", findings: "Mobility, sedation, tubes, and call-bell access reviewed.", intervention: "Fall precautions, side rails, family/nurse instruction, and close observation.", followUp: "Review every shift" };
  if (type === "Line / device assessment") return { score: "Line/device watch", risk: "Medium", status: "Needs follow-up", findings: "Central/peripheral line, Foley, NG/ET, monitor, and pump safety reviewed.", intervention: "Check patency, dressing, alarms, securement, and infection signs.", followUp: "Reassess in 2 hours" };
  if (type === "Nutrition assessment") return { score: patient.currentStatus === "Ventilated" ? "Enteral risk" : "Routine", risk: "Medium", status: "Needs follow-up", findings: "Feeding route, aspiration risk, glucose, and tolerance reviewed.", intervention: "Follow diet/NG/oral order, aspiration precautions, and intake documentation.", followUp: "Review next feed" };
  if (type === "Infection assessment") return { score: patient.diagnosis.toLowerCase().includes("sepsis") ? "High infection watch" : "Routine", risk: patient.diagnosis.toLowerCase().includes("sepsis") ? "High" : "Medium", status: "Needs follow-up", findings: "Temperature, culture/report status, antibiotics, and line sites reviewed.", intervention: "Follow antibiotic timing, culture/report follow-up, line care, and fever watch.", followUp: "Reassess in 1 hour" };
  return { score: patient.currentStatus, risk: patient.currentStatus === "Ready for transfer" ? "Routine" : "Medium", status: patient.currentStatus === "Ready for transfer" ? "Completed" : "Needs follow-up", findings: "Transfer readiness reviewed: vitals, oxygen/device need, documents, medication, and handover.", intervention: "Complete transfer checklist and confirm receiving unit readiness.", followUp: "Before transfer" };
}

function assessmentScoreOptions(type: NursingAssessmentType) {
  if (type === "Pain assessment") return ["0/10", "1-3 mild", "4-6 moderate", "7-10 severe"];
  if (type === "Neuro assessment") return ["GCS 15", "GCS 13-14", "GCS 9-12", "GCS <= 8"];
  if (type === "Respiratory assessment") return ["Room air", "Oxygen mask", "NIV support", "Invasive ventilation", "Weaning trial"];
  if (type === "Skin / pressure risk") return ["Low risk", "Moderate risk", "High risk", "Existing pressure injury"];
  if (type === "Fall risk") return ["Low fall risk", "Moderate fall risk", "High fall risk"];
  if (type === "Line / device assessment") return ["All secure", "Dressing due", "Alarm / mapping issue", "Infection / dislodgement risk"];
  if (type === "Nutrition assessment") return ["Oral allowed", "NG feed", "NPO", "TPN / parenteral nutrition"];
  if (type === "Infection assessment") return ["Routine", "Fever watch", "Culture pending", "Sepsis watch"];
  return ["Ready", "Needs checklist", "Needs doctor review", "Not ready"];
}

function buildInitialAssessmentRecords(): NursingAssessmentRecord[] {
  return icuPatients.slice(0, 4).map((patient, index) => {
    const type = nursingAssessmentTypes[index % nursingAssessmentTypes.length];
    const template = assessmentTemplate(type, patient);
    return {
      id: `assess-initial-${patient.id}`,
      patientId: patient.id,
      patientLabel: patient.patientName,
      bedNo: patient.bedNo,
      type,
      nurse: patient.assignedWardNurse,
      createdAt: `${8 + index}:30`,
      ...template,
    };
  });
}

function CreateNurseTaskPanel({ onCreateTask }: { onCreateTask: (draft: NurseTaskDraft) => void }) {
  const [draft, setDraft] = React.useState<NurseTaskDraft>(() => createDefaultNurseTaskDraft());
  const selectedPatient = icuPatients.find((patient) => patient.id === draft.patientId) ?? icuPatients[0];
  const selectedScenario = getNurseTaskScenario(draft.scenarioId) ?? nurseTaskScenarios[0];
  const sourceScenarios = nurseTaskScenarios.filter((scenario) => scenario.source === draft.source);
  const patientOptions = icuPatients.map((patient) => patient.id);
  const nurseOptions = Array.from(new Set([...allNurses, "Night Nurse Leena", "Ward Nurse Neha", "Head Nurse Sana"]));

  const applyScenario = (scenario: NurseTaskScenario) => {
    const assignment = getTaskAssignmentDefaults(scenario.source, selectedPatient, scenario);
    setDraft((current) => ({
      ...current,
      scenarioId: scenario.id,
      source: scenario.source,
      taskType: scenario.taskType,
      title: scenario.title,
      priority: scenario.priority,
      dueTime: scenario.dueTime,
      repeat: scenario.repeat,
      escalation: scenario.escalation,
      assignedBy: assignment.assignedBy,
      assignedByRole: assignment.assignedByRole,
      assignedToRole: assignment.assignedToRole,
      assignmentReason: assignment.assignmentReason,
      escalationOwner: assignment.escalationOwner,
      requiresAcknowledgement: assignment.requiresAcknowledgement,
      context: scenario.contextOptions[0] ?? "",
      notes: scenario.remarks,
    }));
  };

  const updateSource = (source: string) => {
    const nextScenario = nurseTaskScenarios.find((scenario) => scenario.source === source) ?? nurseTaskScenarios[0];
    applyScenario(nextScenario);
  };

  const updatePatient = (patientId: string) => {
    const patient = icuPatients.find((row) => row.id === patientId);
    const assignment = getTaskAssignmentDefaults(draft.source, patient, selectedScenario);
    setDraft((current) => ({
      ...current,
      patientId,
      assignedBy: assignment.assignedBy,
      assignedByRole: assignment.assignedByRole,
      assignedTo: patient?.assignedWardNurse ?? current.assignedTo,
      assignedToRole: assignment.assignedToRole,
      assignmentReason: assignment.assignmentReason,
      escalationOwner: assignment.escalationOwner,
      requiresAcknowledgement: assignment.requiresAcknowledgement,
    }));
  };

  const saveTask = () => {
    if (!draft.title.trim()) {
      toast.error("Task title is required.");
      return;
    }
    onCreateTask(draft);
    setDraft(createDefaultNurseTaskDraft());
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <SelectField label="Patient / bed" value={draft.patientId} onChange={updatePatient} options={patientOptions} renderOption={(id) => {
            const patient = icuPatients.find((item) => item.id === id);
            return patient ? `${patient.bedNo} - ${patient.patientName}` : id;
          }} />
          <SelectField label="Task source" value={draft.source} onChange={updateSource} options={Array.from(new Set(nurseTaskScenarios.map((scenario) => scenario.source)))} />
          <SelectField label="Scenario" value={draft.scenarioId} onChange={(scenarioId) => {
            const scenario = getNurseTaskScenario(scenarioId);
            if (scenario) applyScenario(scenario);
          }} options={sourceScenarios.map((scenario) => scenario.id)} renderOption={(id) => getNurseTaskScenario(id)?.taskType ?? id} />
        </div>

        <div className="grid gap-3 rounded-md border border-border bg-surface-muted p-3 md:grid-cols-2">
          <InfoLine label="Selected patient" value={`${selectedPatient?.bedNo ?? "-"} - ${selectedPatient?.patientName ?? "-"}`} />
          <InfoLine label="Default nurse" value={selectedPatient?.assignedWardNurse ?? "-"} />
        </div>

        <FormGrid>
          <TextField label="Task title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} placeholder="Task title" wide />
          <SelectField label="Priority" value={draft.priority} onChange={(value) => setDraft((current) => ({ ...current, priority: value as IcuTask["priority"] }))} options={["Critical", "High", "Medium", "Routine"]} />
          <SelectField label="Assigned nurse" value={draft.assignedTo} onChange={(value) => setDraft((current) => ({ ...current, assignedTo: value }))} options={nurseOptions} />
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Due date</span>
            <Input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
          </label>
          <TextField label="Due time" value={draft.dueTime} onChange={(value) => setDraft((current) => ({ ...current, dueTime: value }))} placeholder="Now / Next 15 min / 14:30" />
          <SelectField label={selectedScenario.contextLabel} value={draft.context} onChange={(value) => setDraft((current) => ({ ...current, context: value }))} options={selectedScenario.contextOptions} />
          <SelectField label="Repeat" value={draft.repeat} onChange={(value) => setDraft((current) => ({ ...current, repeat: value }))} options={Array.from(new Set([draft.repeat, "One time", "Hourly", "Every 15 min until stable", "Every 2 hours", "Per shift", "Before shift end", "Until completed"]))} />
          <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
            <input
              checked={draft.requiresAcknowledgement}
              className="h-4 w-4 rounded border-border"
              type="checkbox"
              onChange={(event) => setDraft((current) => ({ ...current, requiresAcknowledgement: event.target.checked }))}
            />
            <span className="font-medium text-foreground">Requires nurse acknowledgement</span>
          </label>
          <TextAreaField label="Escalation rule" value={draft.escalation} onChange={(value) => setDraft((current) => ({ ...current, escalation: value }))} placeholder="Escalation rule..." />
          <TextAreaField label="Task notes" value={draft.notes} onChange={(value) => setDraft((current) => ({ ...current, notes: value }))} placeholder="Nursing notes, safety instruction, carry-forward detail..." />
        </FormGrid>

        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{draft.source}</Badge>
            <Badge tone="muted">{draft.assignedBy} {" -> "} {draft.assignedTo}</Badge>
            <Badge tone={toneForPriority(draft.priority)}>{draft.priority}</Badge>
            <Badge tone="muted">{formatNurseTaskDueTime(draft)}</Badge>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setDraft(createDefaultNurseTaskDraft())}>Reset</Button>
            <Button onClick={saveTask}><ClipboardCheck className="h-4 w-4" />Create task</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function createDefaultNurseTaskDraft(): NurseTaskDraft {
  const scenario = nurseTaskScenarios[0];
  const patient = icuPatients[0];
  const assignment = getTaskAssignmentDefaults(scenario.source, patient, scenario);
  return {
    patientId: patient?.id ?? "",
    source: scenario.source,
    scenarioId: scenario.id,
    taskType: scenario.taskType,
    title: scenario.title,
    priority: scenario.priority,
    assignedBy: assignment.assignedBy,
    assignedByRole: assignment.assignedByRole,
    assignedTo: patient?.assignedWardNurse ?? allNurses[0] ?? "",
    assignedToRole: assignment.assignedToRole,
    assignmentReason: assignment.assignmentReason,
    dueDate: "2026-06-06",
    dueTime: scenario.dueTime,
    repeat: scenario.repeat,
    escalation: scenario.escalation,
    escalationOwner: assignment.escalationOwner,
    requiresAcknowledgement: assignment.requiresAcknowledgement,
    context: scenario.contextOptions[0] ?? "",
    notes: scenario.remarks,
  };
}

function getNurseTaskScenario(scenarioId: string) {
  return nurseTaskScenarios.find((scenario) => scenario.id === scenarioId);
}

function formatNurseTaskDueTime(draft: NurseTaskDraft) {
  const cleanTime = draft.dueTime.trim();
  if (!cleanTime) return draft.dueDate || "Today";
  if (cleanTime.toLowerCase() === "now" || cleanTime.toLowerCase().startsWith("next") || cleanTime.toLowerCase().includes("shift")) return cleanTime;
  return draft.dueDate ? `${draft.dueDate} ${cleanTime}` : cleanTime;
}

function getTaskAssignmentDefaults(source: NurseTaskSource, patient?: IcuPatient, scenario?: NurseTaskScenario) {
  const assignedToRole = source === "Head nurse supervision" ? "Unit Nurse" : "Ward Nurse";
  const base = {
    assignedBy: patient?.assignedWardNurse ?? "Ward Nurse Current",
    assignedByRole: "Ward Nurse",
    assignedToRole,
    assignmentReason: scenario?.remarks ?? "Nursing task assignment",
    escalationOwner: source === "Head nurse supervision" ? "Head Nurse Sana" : "Duty Doctor",
    requiresAcknowledgement: source !== "Manual nursing care",
  };

  if (source === "Doctor order") {
    return { ...base, assignedBy: patient?.admittingDoctor ?? "Duty Doctor", assignedByRole: "Doctor", assignmentReason: "Doctor instruction assigned to nursing team", escalationOwner: patient?.dutyDoctor ?? "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "Medication / eMAR") {
    return { ...base, assignedBy: "System MAR", assignedByRole: "System", assignmentReason: "Medication schedule or medicine safety event", escalationOwner: "Duty Doctor + Head Nurse", requiresAcknowledgement: true };
  }
  if (source === "Vitals / monitoring") {
    return { ...base, assignedBy: "Monitoring System", assignedByRole: "System", assignmentReason: "Monitoring threshold or scheduled vitals requirement", escalationOwner: "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "Intake / output") {
    return { ...base, assignedBy: "Fluid Balance Chart", assignedByRole: "System", assignmentReason: "Fluid balance, urine, drain, or output follow-up", escalationOwner: "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "IV / infusion") {
    return { ...base, assignedBy: "Infusion Pump", assignedByRole: "System", assignmentReason: "Infusion pump, rate, line, or drug continuity check", escalationOwner: "Unit Nurse", requiresAcknowledgement: true };
  }
  if (source === "Blood transfusion") {
    return { ...base, assignedBy: "Blood Unit", assignedByRole: "Blood Unit", assignmentReason: "Blood product monitoring and reaction safety", escalationOwner: "Duty Doctor + Blood Unit", requiresAcknowledgement: true };
  }
  if (source === "Lab / radiology") {
    return { ...base, assignedBy: "Lab / Radiology Department", assignedByRole: "Lab", assignmentReason: "Sample, imaging, or report coordination", escalationOwner: "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "Shift handover") {
    return { ...base, assignedBy: "Outgoing Nurse", assignedByRole: "Ward Nurse", assignmentReason: "Pending task carried forward from previous shift", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: true };
  }
  if (source === "Admission / transfer") {
    return { ...base, assignedBy: patient?.assignedUnitNurse ?? "Unit Nurse Priya", assignedByRole: "Unit Nurse", assignmentReason: "Admission, transfer, or clearance workflow", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: true };
  }
  if (source === "Head nurse supervision") {
    return { ...base, assignedBy: "Head Nurse Sana", assignedByRole: "Head Nurse", assignmentReason: "Supervision, workload, documentation, or audit follow-up", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: true };
  }
  return { ...base, assignmentReason: "Self-created nursing care task", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: false };
}

function createMedicationOrderDraft(): MedicationOrderDraft {
  return {
    patientId: icuPatients[0]?.id ?? "",
    department: "ICU",
    formularyId: "",
    medication: "",
    dose: "",
    route: "IV",
    frequency: "q8h",
    orderType: "Scheduled",
    scheduleTimes: "08:00, 16:00, 00:00",
    doctor: "Dr. Sameer Mehta",
    indication: "",
    instructions: "",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Available",
    startDate: "2026-06-08",
    startTime: "12:00",
    duration: "5 days",
    maxDailyDose: "",
    minInterval: "",
    reviewDate: "2026-06-10",
    titrationTarget: "",
    minRate: "",
    maxRate: "",
    monitoringFrequency: "",
    approvalReason: "",
  };
}

type DoctorEntryOrderCategory = "Medication" | "Investigation" | "Imaging" | "Procedure" | "Nursing Care" | "Diet / Fluid" | "Ventilation";
type DoctorEntryOrderStatus = "Draft" | "Signed" | "Acknowledged" | "Completed" | "Held";
type DoctorEntryOrderPriority = "Routine" | "High" | "STAT";

type DoctorEntryDraft = {
  patientId: string;
  category: DoctorEntryOrderCategory;
  orderName: string;
  doseOrDetail: string;
  route: string;
  frequency: string;
  timing: string;
  assignedTo: string;
  priority: DoctorEntryOrderPriority;
  doctor: string;
  instruction: string;
};

type DoctorEntryOrder = DoctorEntryDraft & {
  id: string;
  bedNo: string;
  patientName: string;
  orderText: string;
  status: DoctorEntryOrderStatus;
  createdAt: string;
};

const doctorEntryCategoryOptions: DoctorEntryOrderCategory[] = ["Medication", "Investigation", "Imaging", "Procedure", "Nursing Care", "Diet / Fluid", "Ventilation"];

const doctorEntryAssignments = [
  "Ward Nurse Kavita",
  "Ward Nurse Arjun",
  "Unit Nurse Priya",
  "Pharmacy",
  "Diagnostics",
  "Radiology",
  "Respiratory Therapist",
];

const doctorEntryTemplates: Record<DoctorEntryOrderCategory, Array<Pick<DoctorEntryDraft, "orderName" | "doseOrDetail" | "route" | "frequency" | "timing" | "assignedTo" | "priority" | "instruction">>> = {
  Medication: [
    { orderName: "Meropenem", doseOrDetail: "1 g", route: "IV", frequency: "q8h", timing: "08:00, 16:00, 00:00", assignedTo: "Ward Nurse Kavita", priority: "High", instruction: "Administer after pharmacy dispense and allergy check." },
    { orderName: "Noradrenaline", doseOrDetail: "0.05 mcg/kg/min", route: "Infusion", frequency: "Continuous", timing: "Now", assignedTo: "Ward Nurse Kavita", priority: "STAT", instruction: "Titrate to MAP target and document pump check." },
    { orderName: "Insulin regular", doseOrDetail: "Sliding scale", route: "SC", frequency: "Before meals", timing: "12:00, 18:00", assignedTo: "Ward Nurse Kavita", priority: "High", instruction: "Check blood sugar before administration and double verify dose." },
    { orderName: "Pantoprazole", doseOrDetail: "40 mg", route: "IV", frequency: "OD", timing: "09:00", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Administer once daily before feeds." },
    { orderName: "Paracetamol", doseOrDetail: "650 mg", route: "Oral/NG", frequency: "SOS fever", timing: "PRN", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Administer if temperature is above 38 C or pain score is above 5." },
    { orderName: "Furosemide", doseOrDetail: "20 mg", route: "IV", frequency: "OD", timing: "10:00", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Review BP, potassium, and urine output before dose." },
    { orderName: "Enoxaparin", doseOrDetail: "40 mg", route: "SC", frequency: "OD", timing: "20:00", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Hold for bleeding, low platelets, or procedure plan." },
    { orderName: "Levetiracetam", doseOrDetail: "500 mg", route: "IV", frequency: "BD", timing: "08:00, 20:00", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Monitor seizure activity and sedation." },
    { orderName: "Salbutamol nebulization", doseOrDetail: "2.5 mg", route: "Nebulization", frequency: "q6h", timing: "06:00, 12:00, 18:00, 00:00", assignedTo: "Respiratory Therapist", priority: "Routine", instruction: "Record wheeze, SpO2, and heart rate response." },
    { orderName: "Potassium chloride correction", doseOrDetail: "20 mEq", route: "IV infusion", frequency: "Once", timing: "Now", assignedTo: "Ward Nurse Kavita", priority: "High", instruction: "Administer only with pump and ECG monitoring as per protocol." },
    { orderName: "Vancomycin", doseOrDetail: "1 g", route: "IV", frequency: "BD", timing: "10:00, 22:00", assignedTo: "Ward Nurse Arjun", priority: "High", instruction: "Send trough level before fourth dose if continued." },
    { orderName: "Propofol", doseOrDetail: "10-50 mcg/kg/min", route: "Infusion", frequency: "Continuous", timing: "Now", assignedTo: "Ward Nurse Kavita", priority: "STAT", instruction: "Target ordered sedation score and monitor BP closely." },
  ],
  Investigation: [
    { orderName: "ABG with lactate", doseOrDetail: "Arterial sample", route: "Lab", frequency: "Once", timing: "Now", assignedTo: "Diagnostics", priority: "STAT", instruction: "Inform duty doctor immediately if lactate is rising." },
    { orderName: "CBC, CRP, electrolytes", doseOrDetail: "Blood sample", route: "Lab", frequency: "Daily", timing: "06:00", assignedTo: "Diagnostics", priority: "Routine", instruction: "Attach report to patient results." },
    { orderName: "Renal function test", doseOrDetail: "Urea, creatinine, electrolytes", route: "Lab", frequency: "Daily", timing: "06:00", assignedTo: "Diagnostics", priority: "Routine", instruction: "Flag rising creatinine or potassium abnormality." },
    { orderName: "Liver function test", doseOrDetail: "Bilirubin, AST, ALT, ALP, albumin", route: "Lab", frequency: "Once", timing: "Morning sample", assignedTo: "Diagnostics", priority: "Routine", instruction: "Review before hepatotoxic medication continuation." },
    { orderName: "Coagulation profile", doseOrDetail: "PT/INR, APTT, D-dimer, fibrinogen", route: "Lab", frequency: "Once", timing: "Now", assignedTo: "Diagnostics", priority: "High", instruction: "Escalate abnormal INR or bleeding risk." },
    { orderName: "Blood culture", doseOrDetail: "Two sets from separate sites", route: "Lab", frequency: "Once", timing: "Before antibiotic dose", assignedTo: "Diagnostics", priority: "High", instruction: "Collect before new antibiotic if clinically possible." },
    { orderName: "Urine routine and culture", doseOrDetail: "Catheter sample", route: "Lab", frequency: "Once", timing: "Today", assignedTo: "Diagnostics", priority: "Routine", instruction: "Use aseptic sample collection technique." },
    { orderName: "Procalcitonin", doseOrDetail: "Serum", route: "Lab", frequency: "Once", timing: "Morning sample", assignedTo: "Diagnostics", priority: "High", instruction: "Trend with sepsis plan and antibiotic review." },
    { orderName: "Troponin I", doseOrDetail: "Serum", route: "Lab", frequency: "Once", timing: "Now", assignedTo: "Diagnostics", priority: "STAT", instruction: "Notify duty doctor if positive or rising." },
    { orderName: "Blood sugar monitoring", doseOrDetail: "Capillary glucose", route: "Bedside", frequency: "q6h", timing: "06:00, 12:00, 18:00, 00:00", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Follow insulin correction order if value is out of range." },
  ],
  Imaging: [
    { orderName: "Portable chest X-ray", doseOrDetail: "AP view", route: "Portable", frequency: "Once", timing: "Today", assignedTo: "Radiology", priority: "High", instruction: "Confirm line position and lung fields." },
    { orderName: "CT brain", doseOrDetail: "Non-contrast", route: "Transport", frequency: "Once", timing: "After stabilization", assignedTo: "Radiology", priority: "High", instruction: "Move only with monitor and oxygen support." },
    { orderName: "USG abdomen", doseOrDetail: "Bedside ultrasound", route: "Portable", frequency: "Once", timing: "Today", assignedTo: "Radiology", priority: "Routine", instruction: "Assess free fluid, hepatobiliary, and renal status." },
    { orderName: "Echocardiography", doseOrDetail: "Bedside 2D echo", route: "Portable", frequency: "Once", timing: "Today", assignedTo: "Radiology", priority: "High", instruction: "Assess LV function, RV strain, and volume status." },
    { orderName: "CT chest", doseOrDetail: "HRCT / contrast as advised", route: "Transport", frequency: "Once", timing: "After renal review", assignedTo: "Radiology", priority: "High", instruction: "Check creatinine and transport readiness before scan." },
    { orderName: "Doppler lower limb", doseOrDetail: "Venous Doppler", route: "Portable", frequency: "Once", timing: "Today", assignedTo: "Radiology", priority: "Routine", instruction: "Evaluate suspected DVT before anticoagulation decision." },
    { orderName: "X-ray abdomen", doseOrDetail: "Erect/supine view", route: "Portable", frequency: "Once", timing: "Today", assignedTo: "Radiology", priority: "Routine", instruction: "Review bowel gas pattern and tube position." },
    { orderName: "CT abdomen", doseOrDetail: "Contrast protocol", route: "Transport", frequency: "Once", timing: "After stabilization", assignedTo: "Radiology", priority: "High", instruction: "Confirm renal function and hemodynamic stability." },
  ],
  Procedure: [
    { orderName: "Central line review", doseOrDetail: "Right IJ line", route: "Bedside", frequency: "Once", timing: "Next round", assignedTo: "Unit Nurse Priya", priority: "Routine", instruction: "Keep sterile tray and consent status ready." },
    { orderName: "Tracheostomy planning", doseOrDetail: "Airway procedure", route: "OT / bedside", frequency: "Once", timing: "After family consent", assignedTo: "Unit Nurse Priya", priority: "High", instruction: "Coordinate anesthesia, consent, and ventilator readiness." },
    { orderName: "Arterial line insertion", doseOrDetail: "Radial artery", route: "Bedside", frequency: "Once", timing: "Now", assignedTo: "Unit Nurse Priya", priority: "High", instruction: "Prepare sterile set, pressure bag, and waveform monitoring." },
    { orderName: "Urinary catheter insertion", doseOrDetail: "Foley catheter", route: "Bedside", frequency: "Once", timing: "Now", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Use aseptic technique and record urine output hourly." },
    { orderName: "Pleural tap", doseOrDetail: "Diagnostic/therapeutic", route: "Bedside", frequency: "Once", timing: "After consent", assignedTo: "Unit Nurse Priya", priority: "High", instruction: "Keep ultrasound, sterile tray, and sample bottles ready." },
    { orderName: "Dialysis catheter care", doseOrDetail: "Dressing and patency check", route: "Bedside", frequency: "Once", timing: "Before dialysis", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Check dressing, bleeding, infection, and line patency." },
    { orderName: "Wound dressing", doseOrDetail: "Surgical wound", route: "Bedside", frequency: "OD", timing: "Morning", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Document wound status, soakage, and discharge." },
    { orderName: "Drain removal review", doseOrDetail: "Abdominal drain", route: "Bedside", frequency: "Once", timing: "Next round", assignedTo: "Unit Nurse Priya", priority: "Routine", instruction: "Record last 24-hour output before review." },
  ],
  "Nursing Care": [
    { orderName: "Repeat vitals", doseOrDetail: "BP, SpO2, pulse", route: "Bedside", frequency: "Every 15 minutes", timing: "For 1 hour", assignedTo: "Ward Nurse Kavita", priority: "High", instruction: "Escalate if BP remains below target." },
    { orderName: "Neuro observation", doseOrDetail: "GCS and pupils", route: "Bedside", frequency: "Hourly", timing: "Next 6 hours", assignedTo: "Ward Nurse Arjun", priority: "High", instruction: "Call duty doctor for drop in GCS." },
    { orderName: "Strict intake/output", doseOrDetail: "All sources", route: "Bedside chart", frequency: "Hourly", timing: "Current shift", assignedTo: "Ward Nurse Kavita", priority: "High", instruction: "Inform if urine output falls below 0.5 ml/kg/hr." },
    { orderName: "Pressure sore prevention", doseOrDetail: "Two-hourly position change", route: "Bedside", frequency: "q2h", timing: "All shifts", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Document position change and skin condition." },
    { orderName: "Oral care", doseOrDetail: "Ventilator oral care", route: "Bedside", frequency: "q4h", timing: "All shifts", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Use VAP prevention bundle documentation." },
    { orderName: "Line site check", doseOrDetail: "Central line and arterial line", route: "Bedside", frequency: "Every shift", timing: "Each shift", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Report redness, discharge, loose dressing, or line issue." },
    { orderName: "Pain score monitoring", doseOrDetail: "NRS / behavioral pain score", route: "Bedside", frequency: "q4h", timing: "All shifts", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Escalate uncontrolled pain after analgesia." },
    { orderName: "Fall prevention", doseOrDetail: "High-risk precautions", route: "Bedside", frequency: "Continuous", timing: "All shifts", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Maintain side rails, call bell, and supervised mobilization." },
  ],
  "Diet / Fluid": [
    { orderName: "Fluid restriction", doseOrDetail: "1500 ml/day", route: "I/O chart", frequency: "24 hours", timing: "From now", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Record oral, IV, tube feed, urine, and drains." },
    { orderName: "Enteral feed", doseOrDetail: "50 ml/hr", route: "NG tube", frequency: "Continuous", timing: "Start 14:00", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Hold if vomiting, high aspirate, or desaturation." },
    { orderName: "NPO", doseOrDetail: "Nil per oral", route: "Diet order", frequency: "Until review", timing: "Now", assignedTo: "Ward Nurse Kavita", priority: "High", instruction: "Hold oral feeds and medications unless doctor allows NG route." },
    { orderName: "Normal saline", doseOrDetail: "100 ml/hr", route: "IV", frequency: "Continuous", timing: "Now", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Review fluid balance and edema every shift." },
    { orderName: "Ringer lactate bolus", doseOrDetail: "500 ml", route: "IV", frequency: "Once", timing: "Now", assignedTo: "Ward Nurse Kavita", priority: "STAT", instruction: "Recheck BP, pulse, SpO2, and urine output after bolus." },
    { orderName: "Dextrose saline", doseOrDetail: "75 ml/hr", route: "IV", frequency: "Continuous", timing: "Now", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Monitor blood sugar and sodium." },
    { orderName: "Tube feed advancement", doseOrDetail: "Increase by 20 ml/hr", route: "NG tube", frequency: "q6h", timing: "If tolerated", assignedTo: "Ward Nurse Kavita", priority: "Routine", instruction: "Hold escalation if vomiting, distension, or high aspirate." },
    { orderName: "Free water flush", doseOrDetail: "30 ml", route: "NG tube", frequency: "q4h", timing: "All shifts", assignedTo: "Ward Nurse Arjun", priority: "Routine", instruction: "Document flush volume in intake chart." },
  ],
  Ventilation: [
    { orderName: "NIV support", doseOrDetail: "IPAP/EPAP as tolerated", route: "Mask", frequency: "Continuous", timing: "Now", assignedTo: "Respiratory Therapist", priority: "STAT", instruction: "Repeat ABG after setting change." },
    { orderName: "Weaning trial", doseOrDetail: "Spontaneous breathing trial", route: "Ventilator", frequency: "Once", timing: "Morning round", assignedTo: "Respiratory Therapist", priority: "High", instruction: "Stop trial if distress or hemodynamic instability occurs." },
    { orderName: "Invasive ventilation", doseOrDetail: "Volume control mode", route: "ET tube", frequency: "Continuous", timing: "Now", assignedTo: "Respiratory Therapist", priority: "STAT", instruction: "Document mode, VT, RR, FiO2, PEEP, and pressures." },
    { orderName: "Oxygen mask", doseOrDetail: "5 L/min", route: "Face mask", frequency: "Continuous", timing: "Now", assignedTo: "Ward Nurse Kavita", priority: "High", instruction: "Target SpO2 as ordered and escalate if requirement increases." },
    { orderName: "HFNC", doseOrDetail: "Flow 40 L/min, FiO2 50%", route: "High-flow nasal cannula", frequency: "Continuous", timing: "Now", assignedTo: "Respiratory Therapist", priority: "High", instruction: "Record flow, FiO2, SpO2, and work of breathing." },
    { orderName: "Suctioning", doseOrDetail: "Closed suction", route: "ET / tracheostomy", frequency: "PRN", timing: "As needed", assignedTo: "Respiratory Therapist", priority: "Routine", instruction: "Use sterile technique and pre-oxygenate if required." },
    { orderName: "PEEP adjustment", doseOrDetail: "Increase by 2 cmH2O", route: "Ventilator", frequency: "Once", timing: "Now", assignedTo: "Respiratory Therapist", priority: "High", instruction: "Repeat SpO2 and ABG review after adjustment." },
    { orderName: "Extubation readiness", doseOrDetail: "Cuff leak and SBT review", route: "Ventilator", frequency: "Once", timing: "Morning round", assignedTo: "Respiratory Therapist", priority: "High", instruction: "Keep reintubation equipment ready before trial." },
  ],
};

const initialDoctorEntryOrders: DoctorEntryOrder[] = [
  {
    id: "doctor-entry-001",
    patientId: "icu-001",
    patientName: "Aisha Khan",
    bedNo: "ICU-A01",
    category: "Investigation",
    orderName: "ABG with lactate",
    doseOrDetail: "Arterial sample",
    route: "Lab",
    frequency: "Once",
    timing: "Now",
    assignedTo: "Diagnostics",
    priority: "STAT",
    doctor: "Dr. Sameer Mehta",
    instruction: "Inform duty doctor immediately if lactate is rising.",
    orderText: "ABG with lactate",
    status: "Signed",
    createdAt: "Today 08:20",
  },
  {
    id: "doctor-entry-002",
    patientId: "icu-001",
    patientName: "Aisha Khan",
    bedNo: "ICU-A01",
    category: "Medication",
    orderName: "Meropenem",
    doseOrDetail: "1 g",
    route: "IV",
    frequency: "q8h",
    timing: "08:00, 16:00, 00:00",
    assignedTo: "Ward Nurse Kavita",
    priority: "High",
    doctor: "Dr. Sameer Mehta",
    instruction: "Administer after pharmacy dispense and allergy check.",
    orderText: "Meropenem 1 g IV q8h",
    status: "Acknowledged",
    createdAt: "Today 08:15",
  },
  {
    id: "doctor-entry-005",
    patientId: "icu-001",
    patientName: "Aisha Khan",
    bedNo: "ICU-A01",
    category: "Ventilation",
    orderName: "NIV support",
    doseOrDetail: "IPAP/EPAP as tolerated",
    route: "Mask",
    frequency: "Continuous",
    timing: "Now",
    assignedTo: "Respiratory Therapist",
    priority: "STAT",
    doctor: "Dr. Sameer Mehta",
    instruction: "Repeat ABG after setting change.",
    orderText: "NIV support - IPAP/EPAP as tolerated",
    status: "Signed",
    createdAt: "Today 08:30",
  },
  {
    id: "doctor-entry-006",
    patientId: "icu-001",
    patientName: "Aisha Khan",
    bedNo: "ICU-A01",
    category: "Nursing Care",
    orderName: "Strict intake/output",
    doseOrDetail: "All sources",
    route: "Bedside chart",
    frequency: "Hourly",
    timing: "Current shift",
    assignedTo: "Ward Nurse Kavita",
    priority: "High",
    doctor: "Dr. Sameer Mehta",
    instruction: "Inform if urine output falls below 0.5 ml/kg/hr.",
    orderText: "Strict intake/output - All sources",
    status: "Acknowledged",
    createdAt: "Today 08:35",
  },
  {
    id: "doctor-entry-007",
    patientId: "icu-001",
    patientName: "Aisha Khan",
    bedNo: "ICU-A01",
    category: "Diet / Fluid",
    orderName: "Ringer lactate bolus",
    doseOrDetail: "500 ml",
    route: "IV",
    frequency: "Once",
    timing: "Now",
    assignedTo: "Ward Nurse Kavita",
    priority: "STAT",
    doctor: "Dr. Sameer Mehta",
    instruction: "Recheck BP, pulse, SpO2, and urine output after bolus.",
    orderText: "Ringer lactate bolus | 500 ml | IV",
    status: "Completed",
    createdAt: "Today 08:40",
  },
  {
    id: "doctor-entry-008",
    patientId: "icu-001",
    patientName: "Aisha Khan",
    bedNo: "ICU-A01",
    category: "Imaging",
    orderName: "Portable chest X-ray",
    doseOrDetail: "AP view",
    route: "Portable",
    frequency: "Once",
    timing: "Today",
    assignedTo: "Radiology",
    priority: "High",
    doctor: "Dr. Sameer Mehta",
    instruction: "Confirm line position and lung fields.",
    orderText: "Portable chest X-ray - AP view",
    status: "Signed",
    createdAt: "Today 08:45",
  },
  {
    id: "doctor-entry-009",
    patientId: "icu-001",
    patientName: "Aisha Khan",
    bedNo: "ICU-A01",
    category: "Procedure",
    orderName: "Arterial line insertion",
    doseOrDetail: "Radial artery",
    route: "Bedside",
    frequency: "Once",
    timing: "Now",
    assignedTo: "Unit Nurse Priya",
    priority: "High",
    doctor: "Dr. Sameer Mehta",
    instruction: "Prepare sterile set, pressure bag, and waveform monitoring.",
    orderText: "Arterial line insertion - Radial artery",
    status: "Draft",
    createdAt: "Today 08:50",
  },
  {
    id: "doctor-entry-003",
    patientId: "icu-002",
    patientName: "Rohan Das",
    bedNo: "ICU-A02",
    category: "Imaging",
    orderName: "Portable chest X-ray",
    doseOrDetail: "AP view",
    route: "Portable",
    frequency: "Once",
    timing: "Today",
    assignedTo: "Radiology",
    priority: "High",
    doctor: "Dr. Neha Malik",
    instruction: "Review line position and lower-zone infiltrates.",
    orderText: "Portable chest X-ray",
    status: "Completed",
    createdAt: "Today 07:50",
  },
  {
    id: "doctor-entry-004",
    patientId: "icu-003",
    patientName: "Meera Sharma",
    bedNo: "ICU-B03",
    category: "Nursing Care",
    orderName: "Neuro observation",
    doseOrDetail: "GCS and pupils",
    route: "Bedside",
    frequency: "Hourly",
    timing: "Next 6 hours",
    assignedTo: "Ward Nurse Arjun",
    priority: "High",
    doctor: "Dr. Aman Verma",
    instruction: "Call duty doctor for drop in GCS.",
    orderText: "Neuro observation - GCS and pupils",
    status: "Signed",
    createdAt: "Today 09:10",
  },
];

function createDoctorEntryDraft(category: DoctorEntryOrderCategory = "Medication", patientId = icuPatients[0]?.id ?? ""): DoctorEntryDraft {
  const patient = icuPatients.find((item) => item.id === patientId) ?? icuPatients[0];
  const template = doctorEntryTemplates[category][0];
  return {
    patientId: patient?.id ?? "",
    category,
    orderName: template.orderName,
    doseOrDetail: template.doseOrDetail,
    route: template.route,
    frequency: template.frequency,
    timing: template.timing,
    assignedTo: template.assignedTo,
    priority: template.priority,
    doctor: patient?.admittingDoctor ?? patient?.dutyDoctor ?? "Dr. Sameer Mehta",
    instruction: template.instruction,
  };
}

function composeDoctorEntryOrderText(draft: DoctorEntryDraft) {
  if (draft.category === "Medication") {
    return [draft.orderName, draft.doseOrDetail, draft.route, draft.frequency].filter(Boolean).join(" ");
  }
  if (draft.category === "Diet / Fluid") {
    return [draft.orderName, draft.doseOrDetail, draft.route].filter(Boolean).join(" | ");
  }
  return [draft.orderName, draft.doseOrDetail].filter(Boolean).join(" - ");
}

function doctorEntryStatusTone(status: DoctorEntryOrderStatus): StatusTone {
  if (status === "Completed" || status === "Acknowledged") return "success";
  if (status === "Signed") return "info";
  if (status === "Held") return "warning";
  return "muted";
}

function doctorEntryPrimaryLabel(category: DoctorEntryOrderCategory) {
  if (category === "Medication") return "Medicine";
  if (category === "Investigation") return "Test / panel";
  if (category === "Imaging") return "Imaging order";
  if (category === "Procedure") return "Procedure";
  if (category === "Nursing Care") return "Care instruction";
  if (category === "Diet / Fluid") return "Diet / fluid order";
  return "Ventilation order";
}

function doctorEntryDetailLabel(category: DoctorEntryOrderCategory) {
  if (category === "Medication") return "Dose / strength";
  if (category === "Investigation") return "Specimen / sample";
  if (category === "Imaging") return "View / protocol";
  if (category === "Procedure") return "Procedure detail";
  if (category === "Nursing Care") return "Observation detail";
  if (category === "Diet / Fluid") return "Amount / rate";
  return "Setting / parameter";
}

export function MedicationTimelineWorkspace() {
  const searchParams = useSearchParams();
  const queryUnit = searchParams.get("unit")?.trim() ?? "";
  const queryFocus = searchParams.get("focus")?.trim() ?? "";
  const requestedPatientId = searchParams.get("patientId") ?? "";
  const focusedPatient = requestedPatientId ? icuPatients.find((patient) => patient.id === requestedPatientId) : undefined;
  const [orders, setOrders] = React.useState<DoctorMedicationOrder[]>(seededDoctorMedicationOrders);
  const [doses, setDoses] = React.useState<MedicationDoseRow[]>(() => buildMedicationDoseRows(seededDoctorMedicationOrders));
  const [patientId, setPatientId] = React.useState(focusedPatient?.id ?? "All patients");
  const [unitFilter, setUnitFilter] = React.useState(queryUnit || "All ICU units");
  const [medicationDate, setMedicationDate] = React.useState("2026-06-08");
  const [shift, setShift] = React.useState<(typeof medicationShiftOptions)[number]>("All shifts");
  const [query, setQuery] = React.useState("");
  const [emarQueue, setEmarQueue] = React.useState<MedicationEmarQueue>("Due Now");
  const [selectedDoseId, setSelectedDoseId] = React.useState<string | null>(null);
  const [pendingDoseAction, setPendingDoseAction] = React.useState<{ doseId: string; action: MedicationNurseAction } | null>(null);
  const [pendingOrderAction, setPendingOrderAction] = React.useState<{ orderId: string; action: DoctorOrderStatusAction } | null>(null);
  const [pendingAmendOrderId, setPendingAmendOrderId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<MedicationOrderDraft>(() => createMedicationOrderDraft());

  React.useEffect(() => {
    setDoses((current) => applyReadyMedicationState(current));
  }, []);

  React.useEffect(() => {
    if (queryUnit) {
      setUnitFilter(queryUnit);
      setPatientId(focusedPatient?.id ?? "All patients");
      setSelectedDoseId(null);
      setQuery("");
    }
  }, [focusedPatient?.id, queryUnit]);

  React.useEffect(() => {
    if (focusedPatient) {
      setPatientId(focusedPatient.id);
      setSelectedDoseId(null);
      setQuery("");
    }
  }, [focusedPatient?.id]);

  React.useEffect(() => {
    if (queryFocus === "medication") {
      setEmarQueue("Due Now");
    }
  }, [queryFocus]);

  const visibleDoses = doses.filter((row) => {
    const patient = icuPatients.find((item) => item.id === row.patientId);
    const searchable = `${patient?.patientName ?? ""} ${row.bedNo} ${row.medication} ${row.reason} ${row.doctor} ${row.indication} ${row.scheduledDate} ${row.shift}`.toLowerCase();
    return searchable.includes(query.toLowerCase())
      && (!focusedPatient || row.patientId === focusedPatient.id)
      && (unitFilter === "All ICU units" || patient?.unit === unitFilter)
      && (patientId === "All patients" || row.patientId === patientId)
      && (!medicationDate || row.scheduledDate === medicationDate)
      && (shift === "All shifts" || row.shift === shift);
  }).sort((left, right) => {
    const focusRank = medicationExecutiveFocusRank(right, queryFocus) - medicationExecutiveFocusRank(left, queryFocus);
    return focusRank || medicationChartSortValue(left).localeCompare(medicationChartSortValue(right));
  });

  const emarDoses = React.useMemo(() => visibleDoses.filter((dose) => medicationDoseMatchesEmarQueue(dose, emarQueue)), [emarQueue, visibleDoses]);
  const selectedDose = emarDoses.find((dose) => dose.id === selectedDoseId) ?? emarDoses[0];
  const dueCount = visibleDoses.filter((dose) => isMedicationDueStatus(dose.status)).length;
  const administeredCount = visibleDoses.filter((dose) => dose.status === "Administered").length;
  const heldSkippedCount = visibleDoses.filter((dose) => ["Held", "Skipped", "Missed", "Refused"].includes(dose.status)).length;
  const highRiskCount = visibleDoses.filter((dose) => dose.highRisk && dose.orderStatus === "Active").length;
  const pharmacyIssueCount = visibleDoses.filter((dose) => dose.pharmacyStatus !== "Available" && dose.orderStatus === "Active").length;
  const selectedFormularyMedicine = getSelectedFormularyMedicine(draft);
  const doctorOrderScenarios = getDoctorOrderScenarios(draft, orders);
  const hasBlockingDoctorScenario = doctorOrderScenarios.some((scenario) => scenario.blocking);
  const selectedFilterPatient = patientId === "All patients" ? undefined : icuPatients.find((patient) => patient.id === patientId);
  const medicationFilterSummary = [
    selectedFilterPatient ? `${selectedFilterPatient.bedNo} - ${selectedFilterPatient.patientName}` : "All patients",
    medicationDate || "All dates",
    shift,
    unitFilter,
  ].join(" | ");
  const emarQueueCounts: Record<MedicationEmarQueue, number> = {
    "Due Now": dueCount,
    "Administered": administeredCount,
    "Held / Skipped": heldSkippedCount,
    "Infusions": visibleDoses.filter((dose) => dose.orderType === "Continuous" || dose.status === "Running" || ["Paused", "Stopped"].includes(dose.status)).length,
    "PRN": visibleDoses.filter((dose) => dose.orderType === "PRN").length,
    "History": visibleDoses.filter((dose) => ["Administered", "Held", "Skipped", "Missed", "Refused", "Paused", "Stopped"].includes(dose.status)).length,
  };
  const updateDoseStatus = (
    doseId: string,
    nextStatus: WorkflowMedicationStatus,
    note: string,
    details?: { actualTime?: string; administeredBy?: string },
  ) => {
    const targetDose = doses.find((dose) => dose.id === doseId);
    if (!targetDose) return;
    if (nextStatus === "Administered" && targetDose.pharmacyStatus !== "Available") {
      toast.error("Pharmacy clearance pending. Mark medicine received first.");
      setSelectedDoseId(doseId);
      return;
    }
    if (nextStatus === "Administered" && targetDose.doubleVerification === "Pending") {
      toast.error("High-risk medicine needs double verification before administration.");
      setSelectedDoseId(doseId);
      return;
    }

    setDoses((current) => current.map((dose) => {
      if (dose.id !== doseId) return dose;
      const prnReassessment = nextStatus === "Administered" && dose.orderType === "PRN"
        ? ["PRN reassessment due in 30 minutes"]
        : [];
      return {
        ...dose,
        status: nextStatus,
        actualTime: nextStatus === "Administered" || nextStatus === "Running" ? details?.actualTime || "Now" : dose.actualTime,
        administeredBy: nextStatus === "Administered" || nextStatus === "Running" ? details?.administeredBy || "Ward Nurse Current" : dose.administeredBy,
        reason: ["Held", "Skipped", "Missed", "Refused"].includes(nextStatus) ? note : dose.reason,
        auditTrail: [...prnReassessment, `Now: ${nextStatus} - ${note}`, ...dose.auditTrail],
      };
    }));
    setSelectedDoseId(doseId);
    toast.success(`${targetDose.medication} marked ${nextStatus}`);
    if (nextStatus === "Administered" && targetDose.orderType === "PRN") {
      toast.info("PRN effectiveness reassessment is due in 30 minutes.");
    }
    if (nextStatus === "Missed") {
      toast.warning("Missed dose added to the head nurse and doctor follow-up queue.");
    }
  };

  const verifyDose = (doseId: string, verifier: string, note: string) => {
    const targetDose = doses.find((dose) => dose.id === doseId);
    if (!targetDose) return;
    setDoses((current) => current.map((dose) => dose.id === doseId ? {
      ...dose,
      doubleVerification: "Verified",
      auditTrail: [`Now: Double verification completed by ${verifier} - ${note}`, ...dose.auditTrail],
    } : dose));
    setSelectedDoseId(doseId);
    toast.success(`${targetDose.medication} double verified`);
  };

  const requestDoseAction = (doseId: string, action: MedicationNurseAction) => {
    setSelectedDoseId(doseId);
    setPendingDoseAction({ doseId, action });
  };

  const markPharmacyAvailable = (orderId: string) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;
    const targetDose = doses.find((dose) => dose.orderId === orderId);
    if (targetDose) persistReadyMedication(targetDose);
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, pharmacyStatus: "Available" } : order));
    setDoses((current) => current.map((dose) => dose.orderId === orderId ? {
      ...dose,
      pharmacyStatus: "Available",
      doubleVerification: dose.highRisk ? "Verified" : dose.doubleVerification,
      auditTrail: ["Now: Medicine received and verified", ...dose.auditTrail],
    } : dose));
    toast.success(`${targetOrder.medication} ready for administration`);
  };

  const changeOrderStatus = (orderId: string, nextStatus: MedicationOrderStatus, details?: { reason: string; note: string; followUpPlan: string; effectiveTime: string }) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;
    const statusNote = details
      ? `${details.reason} | Effective: ${details.effectiveTime}${details.followUpPlan ? ` | Plan: ${details.followUpPlan}` : ""}${details.note ? ` | Note: ${details.note}` : ""}`
      : nextStatus === "Active" ? "Doctor resumed order" : `Doctor order ${nextStatus}`;
    setOrders((current) => current.map((order) => order.id === orderId ? {
      ...order,
      status: nextStatus,
      statusReason: nextStatus === "Active" ? undefined : details?.reason ?? order.statusReason,
      followUpPlan: nextStatus === "Active" ? undefined : details?.followUpPlan ?? order.followUpPlan,
      actionTimeline: [`Now: ${nextStatus} - ${statusNote}`, ...(order.actionTimeline ?? [])],
    } : order));
    setDoses((current) => current.map((dose) => {
      if (dose.orderId !== orderId) return dose;
      const resumedStatus = dose.orderType === "Continuous" ? "Running" : dose.status === "Held" || dose.status === "Stopped" ? "Due" : dose.status;
      return {
        ...dose,
        orderStatus: nextStatus,
        status: nextStatus === "Held by doctor" ? "Held" : nextStatus === "Discontinued" ? "Stopped" : resumedStatus,
        reason: nextStatus === "Held by doctor" || nextStatus === "Discontinued" ? statusNote : dose.reason,
        auditTrail: [`Now: Doctor order ${nextStatus} - ${statusNote}`, ...dose.auditTrail],
      };
    }));
    toast.success(`${targetOrder.medication} order moved to ${nextStatus}`);
  };

  const requestDoctorOrderAction = (orderId: string, action: DoctorOrderStatusAction) => {
    setPendingOrderAction({ orderId, action });
  };

  const addDoctorOrder = (targetStatus: "Draft" | "Active") => {
    const patient = icuPatients.find((item) => item.id === draft.patientId);
    if (!patient || !draft.medication.trim() || !draft.dose.trim()) {
      toast.error("Patient, medicine, and dose are required.");
      return;
    }
    const blockingScenario = getDoctorOrderScenarios(draft, orders).find((scenario) => scenario.blocking);
    if (targetStatus === "Active" && blockingScenario) {
      toast.error(blockingScenario.title);
      return;
    }

    const scheduleTimes = parseMedicationSchedule(draft.scheduleTimes, draft.orderType);
    const priority: DoctorMedicationOrder["priority"] = draft.orderType === "STAT" ? "STAT" : draft.highRisk ? "High" : "Routine";
    const newOrder: DoctorMedicationOrder = {
      id: `ord-new-${Date.now()}`,
      patientId: patient.id,
      bedNo: patient.bedNo,
      department: draft.department,
      formularyId: selectedFormularyMedicine?.id,
      medication: draft.medication.trim(),
      dose: draft.dose.trim(),
      route: draft.route,
      frequency: draft.frequency,
      orderType: draft.orderType,
      scheduleTimes,
      doctor: draft.doctor,
      indication: draft.indication.trim() || "Doctor medication order",
      instructions: draft.instructions.trim() || "Follow eMAR safety checks before administration.",
      priority,
      highRisk: draft.highRisk,
      doubleVerificationRequired: draft.doubleVerificationRequired || draft.highRisk,
      pharmacyStatus: draft.pharmacyStatus,
      pharmacyLocation: selectedFormularyMedicine?.pharmacyLocation,
      stockStatus: selectedFormularyMedicine?.availability,
      scenarioNotes: doctorOrderScenarios.map((scenario) => scenario.title),
      alternativeMeds: selectedFormularyMedicine?.alternatives,
      startDate: draft.startDate,
      startTime: draft.startTime,
      duration: draft.duration,
      maxDailyDose: draft.maxDailyDose,
      minInterval: draft.minInterval,
      reviewDate: draft.reviewDate,
      titrationTarget: draft.titrationTarget,
      minRate: draft.minRate,
      maxRate: draft.maxRate,
      monitoringFrequency: draft.monitoringFrequency,
      approvalReason: draft.approvalReason,
      signedAt: targetStatus === "Active" ? "Now" : undefined,
      version: 1,
      status: targetStatus,
    };
    setOrders((current) => [newOrder, ...current]);
    if (targetStatus === "Active") {
      const newDoses = buildMedicationDoseRows([newOrder]);
      setDoses((current) => [...newDoses, ...current]);
      setSelectedDoseId(newDoses[0]?.id ?? null);
    }
    setDraft((current) => ({
      ...current,
      medication: "",
      dose: "",
      formularyId: "",
      indication: "",
      instructions: "",
      highRisk: false,
      doubleVerificationRequired: false,
      pharmacyStatus: "Available",
      maxDailyDose: "",
      minInterval: "",
      titrationTarget: "",
      minRate: "",
      maxRate: "",
      monitoringFrequency: "",
      approvalReason: "",
    }));
    toast.success(targetStatus === "Draft"
      ? `${newOrder.medication} saved as draft`
      : `${newOrder.medication} signed and sent to Nurse eMAR`);
  };

  const signDraftOrder = (orderId: string) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder || targetOrder.status !== "Draft") return;
    const draftForReview: MedicationOrderDraft = {
      patientId: targetOrder.patientId,
      department: targetOrder.department ?? "ICU",
      formularyId: targetOrder.formularyId ?? "",
      medication: targetOrder.medication,
      dose: targetOrder.dose,
      route: targetOrder.route,
      frequency: targetOrder.frequency,
      orderType: targetOrder.orderType,
      scheduleTimes: targetOrder.scheduleTimes.join(", "),
      doctor: targetOrder.doctor,
      indication: targetOrder.indication,
      instructions: targetOrder.instructions,
      highRisk: targetOrder.highRisk,
      doubleVerificationRequired: targetOrder.doubleVerificationRequired,
      pharmacyStatus: targetOrder.pharmacyStatus,
      startDate: targetOrder.startDate ?? "2026-06-08",
      startTime: targetOrder.startTime ?? "12:00",
      duration: targetOrder.duration ?? "",
      maxDailyDose: targetOrder.maxDailyDose ?? "",
      minInterval: targetOrder.minInterval ?? "",
      reviewDate: targetOrder.reviewDate ?? "",
      titrationTarget: targetOrder.titrationTarget ?? "",
      minRate: targetOrder.minRate ?? "",
      maxRate: targetOrder.maxRate ?? "",
      monitoringFrequency: targetOrder.monitoringFrequency ?? "",
      approvalReason: targetOrder.approvalReason ?? "",
    };
    const blocker = getDoctorOrderScenarios(draftForReview, orders.filter((order) => order.id !== orderId)).find((scenario) => scenario.blocking);
    if (blocker) {
      setDraft(draftForReview);
      toast.error(`${blocker.title}. Draft loaded for correction.`);
      return;
    }
    const signedOrder = { ...targetOrder, status: "Active" as const, signedAt: "Now" };
    setOrders((current) => current.map((order) => order.id === orderId ? signedOrder : order));
    const newDoses = buildMedicationDoseRows([signedOrder]);
    setDoses((current) => [...newDoses, ...current]);
    setSelectedDoseId(newDoses[0]?.id ?? null);
    toast.success(`${targetOrder.medication} signed and sent to Nurse eMAR`);
  };

  const copyOrderToDraft = (orderId: string, amend: DoctorOrderAmendPayload) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    const amendmentNote = [
      `Amendment reason: ${amend.reason}`,
      amend.changeAreas.length ? `Planned change: ${amend.changeAreas.join(", ")}` : "",
      `Effective from ${amend.effectiveDate} ${amend.effectiveTime}`,
      amend.note ? `Doctor note: ${amend.note}` : "",
      `Based on original order ${order.id}${order.version ? ` v${order.version}` : ""}`,
    ].filter(Boolean).join("\n");
    setDraft({
      patientId: order.patientId,
      department: order.department ?? "ICU",
      formularyId: order.formularyId ?? "",
      medication: order.medication,
      dose: order.dose,
      route: order.route,
      frequency: order.frequency,
      orderType: order.orderType,
      scheduleTimes: order.scheduleTimes.join(", "),
      doctor: order.doctor,
      indication: order.indication,
      instructions: `${order.instructions}${order.instructions ? "\n\n" : ""}${amendmentNote}`,
      highRisk: order.highRisk,
      doubleVerificationRequired: order.doubleVerificationRequired,
      pharmacyStatus: order.pharmacyStatus,
      startDate: amend.effectiveDate,
      startTime: amend.effectiveTime,
      duration: order.duration ?? "",
      maxDailyDose: order.maxDailyDose ?? "",
      minInterval: order.minInterval ?? "",
      reviewDate: order.reviewDate ?? "",
      titrationTarget: order.titrationTarget ?? "",
      minRate: order.minRate ?? "",
      maxRate: order.maxRate ?? "",
      monitoringFrequency: order.monitoringFrequency ?? "",
      approvalReason: order.approvalReason ?? "",
    });
    toast.success(`${order.medication} amendment loaded as editable draft`);
  };

  return (
    <div className="space-y-4">
      <details className="group overflow-hidden rounded-md border border-border bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">Medication controls</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{medicationFilterSummary}</span>
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-3 border-t border-border p-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_220px_180px_220px_auto] xl:items-end">
          <label className="space-y-1 text-sm md:col-span-2 xl:col-span-1">
            <span className="font-medium text-foreground">Patient</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={focusedPatient?.id ?? patientId}
              onChange={(event) => {
                if (!focusedPatient) setPatientId(event.target.value);
              }}
            >
              {focusedPatient ? null : <option value="All patients">All patients</option>}
              {(focusedPatient ? [focusedPatient] : icuPatients).map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Medication date</span>
            <Input type="date" value={medicationDate} onChange={(event) => setMedicationDate(event.target.value)} />
          </label>
          <MedicationLabeledSelect label="Shift" value={shift} onChange={(value) => setShift(value as (typeof medicationShiftOptions)[number])} options={[...medicationShiftOptions]} />
          <div className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Search</span>
            <label className="space-y-1 text-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Medicine, patient, bed, doctor..." value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
            </label>
          </div>
          <Button className="w-full" variant="outline" onClick={() => {
            setQuery("");
            setUnitFilter(queryUnit || "All ICU units");
            setPatientId(focusedPatient?.id ?? "All patients");
            setMedicationDate("2026-06-08");
            setShift("All shifts");
            setEmarQueue("Due Now");
          }}><Filter className="h-4 w-4" />Reset</Button>
        </div>
      </details>

      <div className="space-y-4">
        <div className="flex gap-1 overflow-x-auto rounded-md border border-border bg-surface-muted p-1">
          {(Object.keys(emarQueueCounts) as MedicationEmarQueue[]).map((item) => (
            <button
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
                emarQueue === item
                  ? "bg-white text-primary shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
              )}
              key={item}
              type="button"
              onClick={() => {
                setEmarQueue(item);
                setSelectedDoseId(null);
              }}
            >
              {item}
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                emarQueue === item ? "bg-primary/10 text-primary" : "bg-white text-muted-foreground",
              )}>{emarQueueCounts[item]}</span>
            </button>
          ))}
        </div>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-white">
            <div className="min-w-0">
              <CardTitle>Medication administration</CardTitle>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Badge tone="warning">{dueCount} due/late</Badge>
              <Badge tone="critical">{highRiskCount} verify</Badge>
              <Badge tone="info">{pharmacyIssueCount} pharmacy</Badge>
              <Badge tone="info">{emarDoses.length} dose(s)</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MedicationChartTable
              doses={emarDoses}
              selectedDoseId={selectedDose?.id}
              onMarkPharmacyAvailable={markPharmacyAvailable}
              onRequestAction={requestDoseAction}
              onSelectDose={setSelectedDoseId}
            />
          </CardContent>
        </Card>
      </div>
      <MedicationActionDialog
        key={pendingDoseAction ? `${pendingDoseAction.doseId}-${pendingDoseAction.action}` : "medication-action-closed"}
        action={pendingDoseAction?.action ?? null}
        dose={doses.find((dose) => dose.id === pendingDoseAction?.doseId)}
        open={Boolean(pendingDoseAction)}
        onOpenChange={(open) => {
          if (!open) setPendingDoseAction(null);
        }}
        onConfirm={(payload) => {
          if (!pendingDoseAction) return;
          if (pendingDoseAction.action === "Verify") {
            verifyDose(pendingDoseAction.doseId, payload.verifier, payload.note);
          } else {
            updateDoseStatus(
              pendingDoseAction.doseId,
              pendingDoseAction.action,
              payload.note,
              { actualTime: payload.actualTime, administeredBy: payload.administeredBy },
            );
          }
          setPendingDoseAction(null);
        }}
      />
      <DoctorOrderStatusActionDialog
        key={pendingOrderAction ? `${pendingOrderAction.orderId}-${pendingOrderAction.action}` : "doctor-order-action-closed"}
        action={pendingOrderAction?.action ?? null}
        open={Boolean(pendingOrderAction)}
        order={orders.find((order) => order.id === pendingOrderAction?.orderId)}
        onOpenChange={(open) => {
          if (!open) setPendingOrderAction(null);
        }}
        onConfirm={(payload) => {
          if (!pendingOrderAction) return;
          changeOrderStatus(
            pendingOrderAction.orderId,
            pendingOrderAction.action === "Hold" ? "Held by doctor" : "Discontinued",
            payload,
          );
          setPendingOrderAction(null);
        }}
      />
      <DoctorOrderAmendDialog
        key={pendingAmendOrderId ?? "doctor-order-amend-closed"}
        open={Boolean(pendingAmendOrderId)}
        order={orders.find((order) => order.id === pendingAmendOrderId)}
        onOpenChange={(open) => {
          if (!open) setPendingAmendOrderId(null);
        }}
        onConfirm={(payload) => {
          if (!pendingAmendOrderId) return;
          copyOrderToDraft(pendingAmendOrderId, payload);
          setPendingAmendOrderId(null);
        }}
      />
    </div>
  );
}

export function MedicineReceiveVerifyWorkspace() {
  const searchParams = useSearchParams();
  const queryPatientId = searchParams.get("patientId") ?? "";
  const [doses, setDoses] = React.useState<MedicationDoseRow[]>(() => applyReadyMedicationState(buildMedicationDoseRows(seededDoctorMedicationOrders)));
  const [patientId, setPatientId] = React.useState(queryPatientId && icuPatients.some((patient) => patient.id === queryPatientId) ? queryPatientId : "All patients");
  const [query, setQuery] = React.useState("");
  const [queue, setQueue] = React.useState<"Pending" | "Ready" | "All">("Pending");

  React.useEffect(() => {
    setDoses((current) => applyReadyMedicationState(current));
  }, []);

  React.useEffect(() => {
    if (queryPatientId && icuPatients.some((patient) => patient.id === queryPatientId)) {
      setPatientId(queryPatientId);
    }
  }, [queryPatientId]);

  const queueRows = doses.filter((dose) => {
    const patient = icuPatients.find((item) => item.id === dose.patientId);
    const ready = dose.pharmacyStatus === "Available" && (!dose.highRisk || dose.doubleVerification === "Verified");
    const searchable = `${patient?.patientName ?? ""} ${dose.bedNo} ${dose.medication} ${dose.dose} ${dose.route} ${dose.doctor}`.toLowerCase();
    return searchable.includes(query.toLowerCase())
      && (patientId === "All patients" || dose.patientId === patientId)
      && dose.orderStatus === "Active"
      && (queue === "All" || (queue === "Pending" ? !ready : ready));
  }).sort((left, right) => {
    const leftReady = left.pharmacyStatus === "Available" && (!left.highRisk || left.doubleVerification === "Verified");
    const rightReady = right.pharmacyStatus === "Available" && (!right.highRisk || right.doubleVerification === "Verified");
    return Number(leftReady) - Number(rightReady) || medicationChartSortValue(left).localeCompare(medicationChartSortValue(right));
  });

  const pendingCount = doses.filter((dose) => dose.orderStatus === "Active" && (dose.pharmacyStatus !== "Available" || (dose.highRisk && dose.doubleVerification === "Pending"))).length;
  const readyCount = doses.filter((dose) => dose.orderStatus === "Active" && dose.pharmacyStatus === "Available" && (!dose.highRisk || dose.doubleVerification === "Verified")).length;

  const receiveAndVerify = (doseId: string) => {
    const target = doses.find((dose) => dose.id === doseId);
    if (!target) return;
    persistReadyMedication(target);
    setDoses((current) => current.map((dose) => dose.id === doseId || dose.orderId === target.orderId ? {
      ...dose,
      pharmacyStatus: "Available",
      doubleVerification: dose.highRisk ? "Verified" : dose.doubleVerification,
      auditTrail: ["Now: Medicine received and verified for administration", ...dose.auditTrail],
    } : dose));
    toast.success(`${target.medication} added to administration queue`);
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-white">
          <div>
            <CardTitle>Medicine Receive & Verify</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warning">{pendingCount} pending</Badge>
            <Badge tone="success">{readyCount} ready</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_220px_180px_auto] md:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Search medicine</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Patient, bed, medicine, doctor..." value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Patient</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
              >
                <option value="All patients">All patients</option>
                {icuPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>
                ))}
              </select>
            </label>
            <NativeSelect label="Queue" value={queue} onChange={(value) => setQueue(value as typeof queue)} options={["Pending", "Ready", "All"]} />
            <Button variant="outline" onClick={() => {
              setQuery("");
              setPatientId(queryPatientId || "All patients");
              setQueue("Pending");
            }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-white">
          <CardTitle>Receive queue</CardTitle>
          <Badge tone="info">{queueRows.length} medicine(s)</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Patient / Bed</th>
                  <th className="px-4 py-3 text-left font-semibold">Medicine</th>
                  <th className="px-4 py-3 text-left font-semibold">Dose / Route</th>
                  <th className="px-4 py-3 text-left font-semibold">Due Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Pharmacy</th>
                  <th className="px-4 py-3 text-left font-semibold">Verification</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {queueRows.map((dose) => {
                  const patient = icuPatients.find((item) => item.id === dose.patientId);
                  const ready = dose.pharmacyStatus === "Available" && (!dose.highRisk || dose.doubleVerification === "Verified");
                  return (
                    <tr className="hover:bg-slate-50/70" key={dose.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{patient?.patientName}</p>
                        <p className="text-xs text-muted-foreground">{dose.bedNo} | {patient?.unit}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{dose.medication}</p>
                        <p className="text-xs text-muted-foreground">{dose.indication}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{dose.dose}</p>
                        <p className="text-xs text-muted-foreground">{dose.route} | {dose.frequency}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{dose.scheduledTime}</p>
                        <p className="text-xs text-muted-foreground">{dose.shift}</p>
                      </td>
                      <td className="px-4 py-4"><StatusPill tone={pharmacyStatusTone(dose.pharmacyStatus)}>{dose.pharmacyStatus}</StatusPill></td>
                      <td className="px-4 py-4"><StatusPill tone={dose.doubleVerification === "Verified" ? "success" : dose.doubleVerification === "Pending" ? "warning" : "info"}>{dose.doubleVerification}</StatusPill></td>
                      <td className="px-4 py-4 text-right">
                        {ready ? (
                          <StatusPill tone="success">Ready for administration</StatusPill>
                        ) : (
                          <Button size="sm" onClick={() => receiveAndVerify(dose.id)}>
                            <Check className="h-4 w-4" />
                            Receive & verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!queueRows.length ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={7}>No medicine in this queue.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DoctorOrderEntryWorkspace() {
  const searchParams = useSearchParams();
  const queryPatientId = searchParams.get("patientId") ?? "";
  const initialPatientId = icuPatients.some((patient) => patient.id === queryPatientId) ? queryPatientId : (icuPatients[0]?.id ?? "");
  const [selectedPatientId, setSelectedPatientId] = React.useState(initialPatientId);
  const [category, setCategory] = React.useState<DoctorEntryOrderCategory>("Medication");
  const [draft, setDraft] = React.useState<DoctorEntryDraft>(() => createDoctorEntryDraft("Medication"));
  const [orders, setOrders] = React.useState<DoctorEntryOrder[]>(initialDoctorEntryOrders);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"All status" | DoctorEntryOrderStatus>("All status");
  const [categoryFilter, setCategoryFilter] = React.useState<"All categories" | DoctorEntryOrderCategory>("All categories");
  const [newOrderOpen, setNewOrderOpen] = React.useState(true);
  const [templateQuery, setTemplateQuery] = React.useState("");
  const selectedPatient = icuPatients.find((patient) => patient.id === selectedPatientId) ?? icuPatients[0];
  const selectedPatientOrders = orders.filter((order) => order.patientId === selectedPatientId);
  const visibleTemplates = doctorEntryTemplates[category].filter((template) => {
    const searchable = `${template.orderName} ${template.doseOrDetail} ${template.route} ${template.frequency} ${template.timing} ${template.assignedTo} ${template.instruction}`.toLowerCase();
    return searchable.includes(templateQuery.toLowerCase());
  });
  const visibleOrders = selectedPatientOrders.filter((order) => {
    const searchable = `${order.orderText} ${order.category} ${order.assignedTo} ${order.doctor} ${order.instruction}`.toLowerCase();
    return searchable.includes(query.toLowerCase())
      && (statusFilter === "All status" || order.status === statusFilter)
      && (categoryFilter === "All categories" || order.category === categoryFilter);
  });

  const syncPatient = (patientId: string) => {
    const patient = icuPatients.find((item) => item.id === patientId) ?? icuPatients[0];
    setSelectedPatientId(patient?.id ?? "");
    setDraft((current) => ({
      ...current,
      patientId: patient?.id ?? "",
      doctor: patient?.admittingDoctor ?? patient?.dutyDoctor ?? current.doctor,
    }));
  };

  React.useEffect(() => {
    if (queryPatientId && queryPatientId !== selectedPatientId && icuPatients.some((patient) => patient.id === queryPatientId)) {
      syncPatient(queryPatientId);
    }
  }, [queryPatientId, selectedPatientId]);

  const syncCategory = (nextCategory: DoctorEntryOrderCategory) => {
    setCategory(nextCategory);
    setTemplateQuery("");
    setDraft(createDoctorEntryDraft(nextCategory, selectedPatientId));
  };

  const applyTemplate = (template: (typeof doctorEntryTemplates)[DoctorEntryOrderCategory][number]) => {
    setDraft((current) => ({
      ...current,
      ...template,
      category,
      patientId: selectedPatientId,
      doctor: selectedPatient?.admittingDoctor ?? selectedPatient?.dutyDoctor ?? current.doctor,
    }));
  };

  const saveOrder = (status: "Draft" | "Signed") => {
    if (!selectedPatient || !draft.orderName.trim()) {
      toast.error("Patient and order are required.");
      return;
    }
    const newOrder: DoctorEntryOrder = {
      ...draft,
      id: `doctor-entry-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.patientName,
      bedNo: selectedPatient.bedNo,
      category,
      orderText: composeDoctorEntryOrderText({ ...draft, category }),
      status,
      createdAt: "Now",
    };
    setOrders((current) => [newOrder, ...current]);
    setDraft(createDoctorEntryDraft(category, selectedPatient.id));
    toast.success(status === "Draft" ? "Order saved as draft" : "Order signed and sent");
  };

  const updateOrderStatus = (orderId: string, status: DoctorEntryOrderStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    setOrders((current) => current.map((item) => item.id === orderId ? { ...item, status } : item));
    toast.success(`${order.orderText} moved to ${status}`);
  };

  const nextAction = (order: DoctorEntryOrder) => {
    if (order.status === "Draft") return { label: "Sign", status: "Signed" as DoctorEntryOrderStatus };
    if (order.status === "Signed") return { label: "Acknowledge", status: "Acknowledged" as DoctorEntryOrderStatus };
    if (order.status === "Acknowledged") return { label: "Complete", status: "Completed" as DoctorEntryOrderStatus };
    return null;
  };

  return (
    <div className="space-y-4">
      {selectedPatient ? (
        <section className="overflow-x-auto rounded-lg border border-[#dcd8ff] bg-gradient-to-r from-[#7064EC] via-[#6878E8] to-[#6888E8] px-4 py-3 text-white shadow-sm">
          <div className="flex min-w-max items-center gap-8 text-sm font-bold">
            <span className="text-base">{selectedPatient.patientName}</span>
            <span>MR: {selectedPatient.mrn}</span>
            <span>Age/Sex: {selectedPatient.ageGender}</span>
            <span>Bed: {selectedPatient.bedNo}</span>
            <span>Unit: {selectedPatient.unit}</span>
            <span>Doctor: {selectedPatient.admittingDoctor}</span>
            <span>Nurse: {selectedPatient.assignedWardNurse}</span>
          </div>
        </section>
      ) : null}

      <Card className="overflow-hidden">
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(260px,1fr)_220px_180px] lg:items-end">
          <div className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Patient / bed</span>
            <div className="flex h-10 items-center justify-between rounded-md border border-input bg-surface-muted px-3 text-sm">
              <span className="truncate font-semibold text-foreground">{selectedPatient?.bedNo} - {selectedPatient?.patientName}</span>
              <LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Doctor</span>
            <div className="flex h-10 items-center justify-between rounded-md border border-input bg-surface-muted px-3 text-sm">
              <span className="truncate font-semibold text-foreground">{draft.doctor}</span>
              <LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
          <SelectField label="Send to" value={draft.assignedTo} onChange={(value) => setDraft((current) => ({ ...current, assignedTo: value }))} options={doctorEntryAssignments} />
        </CardContent>
      </Card>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface-muted p-1">
        {doctorEntryCategoryOptions.map((item) => (
          <button
            className={cn(
              "h-10 shrink-0 rounded-md px-4 text-sm font-semibold transition",
              category === item ? "bg-white text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
            )}
            key={item}
            type="button"
            onClick={() => syncCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-white">
            <CardTitle>New order</CardTitle>
            <div className="flex items-center gap-2">
              <Button aria-label="Toggle new order" size="sm" variant="ghost" onClick={() => setNewOrderOpen((open) => !open)}>
                <ChevronDown className={cn("h-4 w-4 transition-transform", newOrderOpen ? "rotate-180" : "")} />
              </Button>
            </div>
          </CardHeader>
          {newOrderOpen ? (
            <CardContent className="grid gap-4 p-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
              <div className="rounded-md border border-border bg-surface-muted p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Order library</p>
                  <Badge tone="info">{visibleTemplates.length}</Badge>
                </div>
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="bg-white pl-9" placeholder="Search order..." value={templateQuery} onChange={(event) => setTemplateQuery(event.target.value)} />
                </div>
                <div className="mt-3 max-h-[330px] space-y-2 overflow-y-auto pr-1">
                  {visibleTemplates.map((template) => {
                    const selected = draft.orderName === template.orderName && draft.doseOrDetail === template.doseOrDetail;
                    return (
                      <button
                        className={cn(
                          "w-full rounded-md border bg-white px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-primary/5",
                          selected ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border",
                        )}
                        key={`${category}-${template.orderName}-${template.doseOrDetail}`}
                        type="button"
                        onClick={() => applyTemplate(template)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {composeDoctorEntryOrderText({ ...createDoctorEntryDraft(category, selectedPatientId), ...template, category })}
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{template.instruction}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{template.timing}</span>
                          <span>{template.assignedTo}</span>
                        </div>
                      </button>
                    );
                  })}
                  {!visibleTemplates.length ? <EmptyPanel title="No order found" detail="Change search." /> : null}
                </div>
              </div>

              <div className="rounded-md border border-border bg-white p-4">
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                  <TextField label={doctorEntryPrimaryLabel(category)} value={draft.orderName} onChange={(value) => setDraft((current) => ({ ...current, orderName: value }))} />
                  <TextField label={doctorEntryDetailLabel(category)} value={draft.doseOrDetail} onChange={(value) => setDraft((current) => ({ ...current, doseOrDetail: value }))} />
                  <TextField label="Route / mode" value={draft.route} onChange={(value) => setDraft((current) => ({ ...current, route: value }))} />
                  <TextField label="Frequency" value={draft.frequency} onChange={(value) => setDraft((current) => ({ ...current, frequency: value }))} />
                  <TextField label="Timing" value={draft.timing} onChange={(value) => setDraft((current) => ({ ...current, timing: value }))} />
                  <SelectField label="Assigned to" value={draft.assignedTo} onChange={(value) => setDraft((current) => ({ ...current, assignedTo: value }))} options={doctorEntryAssignments} />
                </div>
                <div className="mt-3 space-y-3">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">Instruction</span>
                    <textarea
                      className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                      value={draft.instruction}
                      onChange={(event) => setDraft((current) => ({ ...current, instruction: event.target.value }))}
                    />
                  </label>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={() => saveOrder("Draft")}><Save className="h-4 w-4" />Save draft</Button>
                    <Button onClick={() => saveOrder("Signed")}><FileSignature className="h-4 w-4" />Sign & send</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          ) : null}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-white">
            <CardTitle>Patient orders</CardTitle>
            <Badge tone="info">{visibleOrders.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(240px,1fr)_180px_190px_auto] lg:items-end">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Search order</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Order, assignee, doctor..." value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
              </label>
              <SelectField label="Category" value={categoryFilter} onChange={(value) => setCategoryFilter(value as "All categories" | DoctorEntryOrderCategory)} options={["All categories", ...doctorEntryCategoryOptions]} />
              <SelectField label="Status" value={statusFilter} onChange={(value) => setStatusFilter(value as "All status" | DoctorEntryOrderStatus)} options={["All status", "Draft", "Signed", "Acknowledged", "Completed", "Held"]} />
              <Button variant="outline" onClick={() => {
                setQuery("");
                setStatusFilter("All status");
                setCategoryFilter("All categories");
              }}>Reset</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-primary">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Timing</th>
                    <th className="px-4 py-3">Assigned to</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleOrders.map((order) => {
                    const action = nextAction(order);
                    return (
                      <tr className="align-middle hover:bg-surface-muted/60" key={order.id}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-foreground">{order.orderText}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{order.instruction}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge tone="info">{order.category}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-foreground">{order.timing}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{order.createdAt}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-foreground">{order.assignedTo}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{order.doctor}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusPill tone={doctorEntryStatusTone(order.status)}>{order.status}</StatusPill>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {action ? (
                              <Button size="sm" variant={action.status === "Completed" ? "default" : "outline"} onClick={() => updateOrderStatus(order.id, action.status)}>
                                {action.label}
                              </Button>
                            ) : null}
                            {order.status !== "Completed" && order.status !== "Held" ? (
                              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "Held")}>Hold</Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!visibleOrders.length ? <div className="p-4"><EmptyPanel title="No orders found" detail="Change search or filters." /></div> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LegacyDoctorMedicationComposerWorkspace() {
  const [orders, setOrders] = React.useState<DoctorMedicationOrder[]>(seededDoctorMedicationOrders);
  const [, setDoses] = React.useState<MedicationDoseRow[]>(() => buildMedicationDoseRows(seededDoctorMedicationOrders));
  const [pendingOrderAction, setPendingOrderAction] = React.useState<{ orderId: string; action: DoctorOrderStatusAction } | null>(null);
  const [pendingAmendOrderId, setPendingAmendOrderId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<MedicationOrderDraft>(() => createMedicationOrderDraft());
  const selectedFormularyMedicine = getSelectedFormularyMedicine(draft);
  const doctorOrderScenarios = getDoctorOrderScenarios(draft, orders);
  const hasBlockingDoctorScenario = doctorOrderScenarios.some((scenario) => scenario.blocking);

  const changeOrderStatus = (orderId: string, nextStatus: MedicationOrderStatus, details?: { reason: string; note: string; followUpPlan: string; effectiveTime: string }) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;
    const statusNote = details
      ? `${details.reason} | Effective: ${details.effectiveTime}${details.followUpPlan ? ` | Plan: ${details.followUpPlan}` : ""}${details.note ? ` | Note: ${details.note}` : ""}`
      : nextStatus === "Active" ? "Doctor resumed order" : `Doctor order ${nextStatus}`;
    setOrders((current) => current.map((order) => order.id === orderId ? {
      ...order,
      status: nextStatus,
      statusReason: nextStatus === "Active" ? undefined : details?.reason ?? order.statusReason,
      followUpPlan: nextStatus === "Active" ? undefined : details?.followUpPlan ?? order.followUpPlan,
      actionTimeline: [`Now: ${nextStatus} - ${statusNote}`, ...(order.actionTimeline ?? [])],
    } : order));
    setDoses((current) => current.map((dose) => {
      if (dose.orderId !== orderId) return dose;
      const resumedStatus = dose.orderType === "Continuous" ? "Running" : dose.status === "Held" || dose.status === "Stopped" ? "Due" : dose.status;
      return {
        ...dose,
        orderStatus: nextStatus,
        status: nextStatus === "Held by doctor" ? "Held" : nextStatus === "Discontinued" ? "Stopped" : resumedStatus,
        reason: nextStatus === "Held by doctor" || nextStatus === "Discontinued" ? statusNote : dose.reason,
        auditTrail: [`Now: Doctor order ${nextStatus} - ${statusNote}`, ...dose.auditTrail],
      };
    }));
    toast.success(`${targetOrder.medication} order moved to ${nextStatus}`);
  };

  const requestDoctorOrderAction = (orderId: string, action: DoctorOrderStatusAction) => {
    setPendingOrderAction({ orderId, action });
  };

  const addDoctorOrder = (targetStatus: "Draft" | "Active") => {
    const patient = icuPatients.find((item) => item.id === draft.patientId);
    if (!patient || !draft.medication.trim() || !draft.dose.trim()) {
      toast.error("Patient, medicine, and dose are required.");
      return;
    }
    const blockingScenario = getDoctorOrderScenarios(draft, orders).find((scenario) => scenario.blocking);
    if (targetStatus === "Active" && blockingScenario) {
      toast.error(blockingScenario.title);
      return;
    }

    const scheduleTimes = parseMedicationSchedule(draft.scheduleTimes, draft.orderType);
    const priority: DoctorMedicationOrder["priority"] = draft.orderType === "STAT" ? "STAT" : draft.highRisk ? "High" : "Routine";
    const newOrder: DoctorMedicationOrder = {
      id: `ord-new-${Date.now()}`,
      patientId: patient.id,
      bedNo: patient.bedNo,
      department: draft.department,
      formularyId: selectedFormularyMedicine?.id,
      medication: draft.medication.trim(),
      dose: draft.dose.trim(),
      route: draft.route,
      frequency: draft.frequency,
      orderType: draft.orderType,
      scheduleTimes,
      doctor: draft.doctor,
      indication: draft.indication.trim() || "Doctor medication order",
      instructions: draft.instructions.trim() || "Follow eMAR safety checks before administration.",
      priority,
      highRisk: draft.highRisk,
      doubleVerificationRequired: draft.doubleVerificationRequired || draft.highRisk,
      pharmacyStatus: draft.pharmacyStatus,
      pharmacyLocation: selectedFormularyMedicine?.pharmacyLocation,
      stockStatus: selectedFormularyMedicine?.availability,
      scenarioNotes: doctorOrderScenarios.map((scenario) => scenario.title),
      alternativeMeds: selectedFormularyMedicine?.alternatives,
      startDate: draft.startDate,
      startTime: draft.startTime,
      duration: draft.duration,
      maxDailyDose: draft.maxDailyDose,
      minInterval: draft.minInterval,
      reviewDate: draft.reviewDate,
      titrationTarget: draft.titrationTarget,
      minRate: draft.minRate,
      maxRate: draft.maxRate,
      monitoringFrequency: draft.monitoringFrequency,
      approvalReason: draft.approvalReason,
      signedAt: targetStatus === "Active" ? "Now" : undefined,
      version: 1,
      status: targetStatus,
    };
    setOrders((current) => [newOrder, ...current]);
    if (targetStatus === "Active") {
      const newDoses = buildMedicationDoseRows([newOrder]);
      setDoses((current) => [...newDoses, ...current]);
    }
    setDraft((current) => ({
      ...current,
      medication: "",
      dose: "",
      formularyId: "",
      indication: "",
      instructions: "",
      highRisk: false,
      doubleVerificationRequired: false,
      pharmacyStatus: "Available",
      maxDailyDose: "",
      minInterval: "",
      titrationTarget: "",
      minRate: "",
      maxRate: "",
      monitoringFrequency: "",
      approvalReason: "",
    }));
    toast.success(targetStatus === "Draft"
      ? `${newOrder.medication} saved as draft`
      : `${newOrder.medication} signed and sent to Nurse eMAR`);
  };

  const signDraftOrder = (orderId: string) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder || targetOrder.status !== "Draft") return;
    const draftForReview: MedicationOrderDraft = {
      patientId: targetOrder.patientId,
      department: targetOrder.department ?? "ICU",
      formularyId: targetOrder.formularyId ?? "",
      medication: targetOrder.medication,
      dose: targetOrder.dose,
      route: targetOrder.route,
      frequency: targetOrder.frequency,
      orderType: targetOrder.orderType,
      scheduleTimes: targetOrder.scheduleTimes.join(", "),
      doctor: targetOrder.doctor,
      indication: targetOrder.indication,
      instructions: targetOrder.instructions,
      highRisk: targetOrder.highRisk,
      doubleVerificationRequired: targetOrder.doubleVerificationRequired,
      pharmacyStatus: targetOrder.pharmacyStatus,
      startDate: targetOrder.startDate ?? "2026-06-08",
      startTime: targetOrder.startTime ?? "12:00",
      duration: targetOrder.duration ?? "",
      maxDailyDose: targetOrder.maxDailyDose ?? "",
      minInterval: targetOrder.minInterval ?? "",
      reviewDate: targetOrder.reviewDate ?? "",
      titrationTarget: targetOrder.titrationTarget ?? "",
      minRate: targetOrder.minRate ?? "",
      maxRate: targetOrder.maxRate ?? "",
      monitoringFrequency: targetOrder.monitoringFrequency ?? "",
      approvalReason: targetOrder.approvalReason ?? "",
    };
    const blocker = getDoctorOrderScenarios(draftForReview, orders.filter((order) => order.id !== orderId)).find((scenario) => scenario.blocking);
    if (blocker) {
      setDraft(draftForReview);
      toast.error(`${blocker.title}. Draft loaded for correction.`);
      return;
    }
    const signedOrder = { ...targetOrder, status: "Active" as const, signedAt: "Now" };
    setOrders((current) => current.map((order) => order.id === orderId ? signedOrder : order));
    const newDoses = buildMedicationDoseRows([signedOrder]);
    setDoses((current) => [...newDoses, ...current]);
    toast.success(`${targetOrder.medication} signed and sent to Nurse eMAR`);
  };

  const copyOrderToDraft = (orderId: string, amend: DoctorOrderAmendPayload) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    const amendmentNote = [
      `Amendment reason: ${amend.reason}`,
      amend.changeAreas.length ? `Planned change: ${amend.changeAreas.join(", ")}` : "",
      `Effective from ${amend.effectiveDate} ${amend.effectiveTime}`,
      amend.note ? `Doctor note: ${amend.note}` : "",
      `Based on original order ${order.id}${order.version ? ` v${order.version}` : ""}`,
    ].filter(Boolean).join("\n");
    setDraft({
      patientId: order.patientId,
      department: order.department ?? "ICU",
      formularyId: order.formularyId ?? "",
      medication: order.medication,
      dose: order.dose,
      route: order.route,
      frequency: order.frequency,
      orderType: order.orderType,
      scheduleTimes: order.scheduleTimes.join(", "),
      doctor: order.doctor,
      indication: order.indication,
      instructions: `${order.instructions}${order.instructions ? "\n\n" : ""}${amendmentNote}`,
      highRisk: order.highRisk,
      doubleVerificationRequired: order.doubleVerificationRequired,
      pharmacyStatus: order.pharmacyStatus,
      startDate: amend.effectiveDate,
      startTime: amend.effectiveTime,
      duration: order.duration ?? "",
      maxDailyDose: order.maxDailyDose ?? "",
      minInterval: order.minInterval ?? "",
      reviewDate: order.reviewDate ?? "",
      titrationTarget: order.titrationTarget ?? "",
      minRate: order.minRate ?? "",
      maxRate: order.maxRate ?? "",
      monitoringFrequency: order.monitoringFrequency ?? "",
      approvalReason: order.approvalReason ?? "",
    });
    toast.success(`${order.medication} amendment loaded as editable draft`);
  };

  return (
    <div className="space-y-4">
      <MedicationOrderComposer
        draft={draft}
        hasBlockingScenario={hasBlockingDoctorScenario}
        orders={orders}
        scenarios={doctorOrderScenarios}
        selectedMedicine={selectedFormularyMedicine}
        onCopyOrder={(orderId) => setPendingAmendOrderId(orderId)}
        onDraftChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
        onHoldOrder={(orderId) => requestDoctorOrderAction(orderId, "Hold")}
        onResumeOrder={(orderId) => changeOrderStatus(orderId, "Active")}
        onSaveDraft={() => addDoctorOrder("Draft")}
        onSignDraft={signDraftOrder}
        onSignOrder={() => addDoctorOrder("Active")}
        onStopOrder={(orderId) => requestDoctorOrderAction(orderId, "Discontinue")}
      />

      <DoctorOrderStatusActionDialog
        key={pendingOrderAction ? `${pendingOrderAction.orderId}-${pendingOrderAction.action}` : "doctor-order-entry-action-closed"}
        action={pendingOrderAction?.action ?? null}
        open={Boolean(pendingOrderAction)}
        order={orders.find((order) => order.id === pendingOrderAction?.orderId)}
        onOpenChange={(open) => {
          if (!open) setPendingOrderAction(null);
        }}
        onConfirm={(payload) => {
          if (!pendingOrderAction) return;
          changeOrderStatus(
            pendingOrderAction.orderId,
            pendingOrderAction.action === "Hold" ? "Held by doctor" : "Discontinued",
            payload,
          );
          setPendingOrderAction(null);
        }}
      />
      <DoctorOrderAmendDialog
        key={pendingAmendOrderId ?? "doctor-order-entry-amend-closed"}
        open={Boolean(pendingAmendOrderId)}
        order={orders.find((order) => order.id === pendingAmendOrderId)}
        onOpenChange={(open) => {
          if (!open) setPendingAmendOrderId(null);
        }}
        onConfirm={(payload) => {
          if (!pendingAmendOrderId) return;
          copyOrderToDraft(pendingAmendOrderId, payload);
          setPendingAmendOrderId(null);
        }}
      />
    </div>
  );
}

function MedicationPatientStrip({
  activeDoseCount,
  dueCount,
  highRiskCount,
  patient,
  pharmacyIssueCount,
  unitFilter,
}: {
  activeDoseCount: number;
  dueCount: number;
  highRiskCount: number;
  patient?: IcuPatient;
  pharmacyIssueCount: number;
  unitFilter: string;
}) {
  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-[#dcd8ff] bg-gradient-to-r from-[#7064EC] via-[#6878E8] to-[#6888E8] px-4 py-3 text-white shadow-sm">
      <div className="flex min-w-max items-center gap-6 text-sm font-semibold">
        <span className="text-base font-bold">{patient?.patientName ?? "All ICU patients"}</span>
        <span>{patient ? `MR: ${patient.mrn}` : unitFilter}</span>
        <span>{patient ? `Age/Sex: ${patient.ageGender}` : `${activeDoseCount} active dose(s)`}</span>
        <span>{patient ? `Bed: ${patient.bedNo}` : `${dueCount} due / late`}</span>
        <span>{patient ? `Unit: ${patient.unit}` : `${highRiskCount} high-alert`}</span>
        <span>{patient ? `Doctor: ${patient.dutyDoctor}` : `${pharmacyIssueCount} pharmacy issue(s)`}</span>
        <span>{patient ? `Nurse: ${patient.assignedWardNurse}` : "Nurse eMAR"}</span>
      </div>
    </div>
  );
}

function MedicationLabeledSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function MedicationOrderComposer({
  draft,
  hasBlockingScenario,
  onDraftChange,
  onSaveDraft,
  onSignOrder,
  onCopyOrder,
  onHoldOrder,
  onResumeOrder,
  onSignDraft,
  onStopOrder,
  orders,
  scenarios,
  selectedMedicine,
}: {
  draft: MedicationOrderDraft;
  hasBlockingScenario: boolean;
  onDraftChange: (draft: Partial<MedicationOrderDraft>) => void;
  onSaveDraft: () => void;
  onSignOrder: () => void;
  onCopyOrder: (orderId: string) => void;
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
  onSignDraft: (orderId: string) => void;
  onStopOrder: (orderId: string) => void;
  orders: DoctorMedicationOrder[];
  scenarios: MedicationScenario[];
  selectedMedicine?: FormularyMedicine;
}) {
  const [formularyQuery, setFormularyQuery] = React.useState("");
  const [orderSearch, setOrderSearch] = React.useState("");
  const [orderStatusFilter, setOrderStatusFilter] = React.useState<"All" | MedicationOrderStatus>("All");
  const [ordersOpen, setOrdersOpen] = React.useState(false);
  const [availableOnly, setAvailableOnly] = React.useState(true);
  const selectedPatient = icuPatients.find((patient) => patient.id === draft.patientId);
  const patientProfile = getPatientMedicationProfile(draft.patientId);
  const patientOrdersForPatient = orders.filter((order) => order.patientId === draft.patientId);
  const activeOrdersForPatient = patientOrdersForPatient.filter((order) => order.status === "Active");
  const visiblePatientOrders = patientOrdersForPatient.filter((order) => {
    const searchable = `${order.medication} ${order.indication} ${order.doctor} ${order.orderType} ${order.pharmacyStatus}`.toLowerCase();
    return searchable.includes(orderSearch.toLowerCase())
      && (orderStatusFilter === "All" || order.status === orderStatusFilter);
  });
  const draftOrderCount = patientOrdersForPatient.filter((order) => order.status === "Draft").length;
  const heldOrderCount = patientOrdersForPatient.filter((order) => order.status === "Held by doctor").length;
  const formularyResults = getFormularySearchResults(draft.department, formularyQuery, availableOnly);

  const selectMedicine = (medicine: FormularyMedicine) => {
    onDraftChange({
      formularyId: medicine.id,
      medication: medicine.name,
      dose: medicine.defaultDose,
      route: medicine.route,
      frequency: medicine.frequency,
      orderType: medicine.orderType,
      scheduleTimes: medicine.scheduleTimes,
      indication: medicine.indication,
      instructions: medicine.instructions,
      highRisk: medicine.highRisk,
      doubleVerificationRequired: medicine.doubleVerificationRequired,
      pharmacyStatus: pharmacyStatusFromAvailability(medicine.availability),
      maxDailyDose: medicine.orderType === "PRN" ? "As per prescribed daily limit" : "",
      minInterval: medicine.orderType === "PRN" ? "6 hours" : "",
      titrationTarget: medicine.orderType === "Continuous" ? "Clinical target as ordered" : "",
      minRate: medicine.orderType === "Continuous" ? "Starting rate" : "",
      maxRate: medicine.orderType === "Continuous" ? "Maximum safe rate" : "",
      monitoringFrequency: medicine.orderType === "Continuous" ? "Every 15 minutes until stable" : "",
      approvalReason: medicine.restricted ? medicine.indication : "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-background p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(240px,0.85fr)_minmax(0,1.25fr)_230px] xl:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Patient / bed</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={draft.patientId}
              onChange={(event) => onDraftChange({ patientId: event.target.value })}
            >
              {icuPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>
              ))}
            </select>
          </label>

          <div className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Department</span>
            <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
              {medicationDepartments.map((department) => (
                <Button
                  className="h-10 justify-center px-2 text-xs"
                  key={department}
                  size="sm"
                  variant={draft.department === department ? "default" : "outline"}
                  onClick={() => onDraftChange({
                    department,
                    formularyId: "",
                    medication: "",
                    dose: "",
                    indication: "",
                    instructions: "",
                    highRisk: false,
                    doubleVerificationRequired: false,
                    pharmacyStatus: "Available",
                  })}
                >
                  {department}
                </Button>
              ))}
            </div>
          </div>

          <SelectField label="Doctor" value={draft.doctor} onChange={(value) => onDraftChange({ doctor: value })} options={["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma"]} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MedicationContextTile label="Diagnosis" value={selectedPatient?.diagnosis ?? "-"} />
          <MedicationContextTile label="Weight" value={`${patientProfile.weightKg} kg`} />
          <MedicationContextTile label="Allergy" value={patientProfile.allergies.length ? patientProfile.allergies.join(", ") : "None"} tone={patientProfile.allergies.length ? "warning" : "success"} />
          <MedicationContextTile label="Renal / feeding" value={`${patientProfile.renalStatus} / ${patientProfile.feedingStatus}`} tone={patientProfile.renalStatus === "Normal" && patientProfile.feedingStatus !== "NPO" ? "success" : "warning"} />
          <MedicationContextTile label="Active meds" value={`${activeOrdersForPatient.length}`} tone={activeOrdersForPatient.length ? "info" : "success"} />
          <button
            className="min-h-20 rounded-md border border-primary/30 bg-primary/5 p-3 text-left transition hover:border-primary hover:bg-primary/10"
            type="button"
            onClick={() => setOrdersOpen(true)}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-medium text-primary">Patient orders</span>
              <Badge tone="info">{patientOrdersForPatient.length}</Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
              Active {activeOrdersForPatient.length} | Draft {draftOrderCount} | Held {heldOrderCount}
            </p>
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Medicine catalog</p>
            </div>
            <Badge tone="info">{formularyResults.length}</Badge>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search medicine, indication, safety flag..." value={formularyQuery} onChange={(event) => setFormularyQuery(event.target.value)} />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-sky-100 bg-sky-50/60 p-3 text-xs font-semibold text-slate-700">
              <span>Stocked medicines first</span>
              <input checked={availableOnly} className="h-4 w-4" type="checkbox" onChange={(event) => setAvailableOnly(event.target.checked)} />
            </label>
          </div>
          <div className="mt-4 max-h-[590px] space-y-2 overflow-y-auto pr-1">
            {formularyResults.map((medicine) => (
              <button
                className={cn(
                  "w-full rounded-md border border-slate-200 bg-white p-3 text-left transition hover:border-sky-300 hover:bg-sky-50/70",
                  draft.formularyId === medicine.id ? "border-sky-400 bg-sky-50" : "",
                )}
                key={medicine.id}
                type="button"
                onClick={() => selectMedicine(medicine)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{medicine.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{medicine.genericName}</p>
                  </div>
                  <StatusPill tone={formularyAvailabilityTone(medicine.availability)}>{medicine.availability}</StatusPill>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>{medicine.defaultDose}</span>
                  <span>{medicine.route}</span>
                  <span>{medicine.stockQty} {medicine.stockUnit}</span>
                  <span>{medicine.pharmacyLocation}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {medicine.highRisk ? <Badge tone="critical">High risk</Badge> : null}
                  {medicine.restricted ? <Badge tone="warning">Restricted</Badge> : null}
                  {medicine.safetyFlags.slice(0, 2).map((flag) => <Badge key={flag} tone="info">{flag}</Badge>)}
                </div>
              </button>
            ))}
            {!formularyResults.length ? <EmptyPanel title="No medicine found" detail="Change department, search, or stocked filter." /> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-base font-semibold text-foreground">{selectedMedicine ? selectedMedicine.name : "Select medicine from catalog"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedMedicine ? `${selectedMedicine.pharmacyLocation} | ${selectedMedicine.stockQty} ${selectedMedicine.stockUnit} | ${selectedMedicine.departments.join(", ")}` : "Choose a medicine to prefill prescription details and safety checks."}
                </p>
                {selectedMedicine?.alternatives.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">Alternatives: {selectedMedicine.alternatives.join(", ")}</p>
                ) : null}
              </div>
              {selectedMedicine ? <StatusPill tone={formularyAvailabilityTone(selectedMedicine.availability)}>{selectedMedicine.availability}</StatusPill> : <Badge tone="warning">No medicine</Badge>}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SelectField
                label="Order type"
                value={draft.orderType}
                onChange={(value) => {
                  const nextType = value as MedicationOrderType;
                  onDraftChange({
                    orderType: nextType,
                    scheduleTimes: nextType === "Continuous" ? "Running" : nextType === "PRN" ? "PRN" : nextType === "STAT" || nextType === "One-time" ? "Now" : draft.scheduleTimes,
                  });
                }}
                options={["Scheduled", "STAT", "PRN", "Continuous", "One-time"]}
              />
              <SelectField label="Pharmacy" value={draft.pharmacyStatus} onChange={(value) => onDraftChange({ pharmacyStatus: value as PharmacyStatus })} options={["Available", "Pending dispense", "Low stock", "Out of stock", "Restricted", "Shortage", "Substitution requested"]} />
              <TextField label="Medicine" value={draft.medication} onChange={(value) => onDraftChange({ medication: value, formularyId: "" })} placeholder="Select from catalog" />
              <TextField label="Dose" value={draft.dose} onChange={(value) => onDraftChange({ dose: value })} placeholder="1 g / sliding scale..." />
              <SelectField label="Route" value={draft.route} onChange={(value) => onDraftChange({ route: value })} options={["IV", "Infusion", "Oral/NG", "SC", "IM", "Nebulization"]} />
              <TextField label="Frequency" value={draft.frequency} onChange={(value) => onDraftChange({ frequency: value })} placeholder="q8h / OD / continuous" />
              {draft.orderType === "Scheduled" ? <TextField label="Schedule times" value={draft.scheduleTimes} onChange={(value) => onDraftChange({ scheduleTimes: value })} placeholder="08:00, 16:00, 00:00" /> : null}
              {draft.orderType === "STAT" || draft.orderType === "One-time" ? <TextField label="Administration time" value={draft.startTime} onChange={(value) => onDraftChange({ startTime: value, scheduleTimes: value || "Now" })} placeholder="Now / 14:30" /> : null}
              <TextField label="Indication" value={draft.indication} onChange={(value) => onDraftChange({ indication: value })} placeholder="Sepsis / fever / MAP support" />
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Start date</span>
                <Input type="date" value={draft.startDate} onChange={(event) => onDraftChange({ startDate: event.target.value })} />
              </label>
              {draft.orderType === "Scheduled" ? <TextField label="Duration" value={draft.duration} onChange={(value) => onDraftChange({ duration: value })} placeholder="5 days / until review" /> : null}
              {draft.orderType === "PRN" ? (
                <>
                  <TextField label="Minimum interval" value={draft.minInterval} onChange={(value) => onDraftChange({ minInterval: value })} placeholder="6 hours" />
                  <TextField label="Maximum daily dose" value={draft.maxDailyDose} onChange={(value) => onDraftChange({ maxDailyDose: value })} placeholder="3 doses / 4 g per day" />
                </>
              ) : null}
              {draft.orderType === "Continuous" ? (
                <>
                  <TextField label="Titration target" value={draft.titrationTarget} onChange={(value) => onDraftChange({ titrationTarget: value })} placeholder="MAP 65-75 / RASS -2" />
                  <TextField label="Starting / minimum rate" value={draft.minRate} onChange={(value) => onDraftChange({ minRate: value })} placeholder="0.05 mcg/kg/min" />
                  <TextField label="Maximum rate" value={draft.maxRate} onChange={(value) => onDraftChange({ maxRate: value })} placeholder="0.5 mcg/kg/min" />
                  <TextField label="Monitoring frequency" value={draft.monitoringFrequency} onChange={(value) => onDraftChange({ monitoringFrequency: value })} placeholder="Every 15 min until stable" />
                </>
              ) : null}
              {selectedMedicine?.restricted ? (
                <>
                  <TextField label="Approval / stewardship reason" value={draft.approvalReason} onChange={(value) => onDraftChange({ approvalReason: value })} placeholder="Clinical justification / approval" />
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">Review date</span>
                    <Input type="date" value={draft.reviewDate} min={draft.startDate || undefined} onChange={(event) => onDraftChange({ reviewDate: event.target.value })} />
                  </label>
                </>
              ) : null}
              <label className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-surface p-3 text-sm">
                <input
                  checked={draft.highRisk}
                  className="h-4 w-4 shrink-0"
                  type="checkbox"
                  onChange={(event) => onDraftChange({ highRisk: event.target.checked, doubleVerificationRequired: event.target.checked || draft.doubleVerificationRequired })}
                />
                <span className="font-medium text-foreground">High-risk medicine</span>
              </label>
              <label className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-surface p-3 text-sm">
                <input
                  checked={draft.doubleVerificationRequired}
                  className="h-4 w-4 shrink-0"
                  type="checkbox"
                  onChange={(event) => onDraftChange({ doubleVerificationRequired: event.target.checked })}
                />
                <span className="font-medium text-foreground">Double verification</span>
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="font-medium text-foreground">Instructions</span>
                <textarea
                  className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Safety checks, vitals/lab conditions, infusion instruction..."
                  value={draft.instructions}
                  onChange={(event) => onDraftChange({ instructions: event.target.value })}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                {hasBlockingScenario ? "Draft can be saved, but blocking checks must be resolved before signing." : "Safety review passed. Signed order will create Nurse eMAR doses."}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={onSaveDraft}><Save className="h-4 w-4" />Save draft</Button>
                <Button className="sm:min-w-40" disabled={hasBlockingScenario} onClick={onSignOrder}><FileSignature className="h-4 w-4" />Sign & submit</Button>
              </div>
            </div>
          </div>
          <MedicationScenarioPanel scenarios={scenarios} />
        </div>
      </div>
      <MedicationPatientOrdersDialog
        open={ordersOpen}
        onOpenChange={setOrdersOpen}
        orders={visiblePatientOrders}
        orderSearch={orderSearch}
        onOrderSearch={setOrderSearch}
        orderStatusFilter={orderStatusFilter}
        onOrderStatusFilter={setOrderStatusFilter}
        patient={selectedPatient}
        totalOrders={patientOrdersForPatient.length}
        onCopyOrder={(orderId) => {
          onCopyOrder(orderId);
          setOrdersOpen(false);
        }}
        onHoldOrder={onHoldOrder}
        onResumeOrder={onResumeOrder}
        onSignDraft={onSignDraft}
        onStopOrder={onStopOrder}
      />
    </div>
  );
}

function MedicationContextTile({ label, value, tone = "info" }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="min-h-20 rounded-md border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", toneDotClass(tone))} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MedicationScenarioPanel({ scenarios }: { scenarios: MedicationScenario[] }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Scenario checks</p>
        <Badge tone={scenarios.some((scenario) => scenario.blocking) ? "danger" : "success"}>{scenarios.length} checks</Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {scenarios.map((scenario) => (
          <div className={cn("rounded-md border p-3", scenario.blocking ? "border-danger/30 bg-danger/5" : "border-border bg-surface")} key={scenario.id}>
            <div className="flex items-start gap-2">
              <span className={cn("mt-0.5 rounded-md p-1", toneClass(scenario.tone))}>
                {scenario.blocking ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{scenario.detail}</p>
              </div>
            </div>
          </div>
        ))}
        {!scenarios.length ? <EmptyPanel title="No scenario available" detail="Select a patient and medicine from formulary." /> : null}
      </div>
    </div>
  );
}

function MedicationPatientOrdersDialog({
  open,
  onOpenChange,
  orders,
  orderSearch,
  onOrderSearch,
  orderStatusFilter,
  onOrderStatusFilter,
  patient,
  totalOrders,
  onCopyOrder,
  onHoldOrder,
  onResumeOrder,
  onSignDraft,
  onStopOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: DoctorMedicationOrder[];
  orderSearch: string;
  onOrderSearch: (value: string) => void;
  orderStatusFilter: "All" | MedicationOrderStatus;
  onOrderStatusFilter: (value: "All" | MedicationOrderStatus) => void;
  patient?: IcuPatient;
  totalOrders: number;
  onCopyOrder: (orderId: string) => void;
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
  onSignDraft: (orderId: string) => void;
  onStopOrder: (orderId: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(780px,90dvh)] w-[min(980px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">Patient Orders</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patient ? `${patient.bedNo} - ${patient.patientName}` : "Selected ICU patient"} | {totalOrders} medication order(s)
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close patient orders" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="border-b border-border p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-end">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Search order</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Medicine, indication, doctor, type, pharmacy..." value={orderSearch} onChange={(event) => onOrderSearch(event.target.value)} />
                </div>
              </label>
              <Button className="w-full lg:w-auto" variant="outline" onClick={() => {
                onOrderSearch("");
                onOrderStatusFilter("All");
              }}>
                <Filter className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="mt-3 flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
              {(["All", "Active", "Draft", "Held by doctor", "Discontinued"] as const).map((item) => (
                <button
                  className={cn("h-8 shrink-0 rounded px-3 text-xs font-medium", orderStatusFilter === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  key={item}
                  type="button"
                  onClick={() => onOrderStatusFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-4">
            <MedicationDoctorOrdersPanel
              orders={orders}
              onCopyOrder={onCopyOrder}
              onHoldOrder={onHoldOrder}
              onResumeOrder={onResumeOrder}
              onSignDraft={onSignDraft}
              onStopOrder={onStopOrder}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DoctorOrderAmendDialog({
  open,
  order,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  order?: DoctorMedicationOrder;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: DoctorOrderAmendPayload) => void;
}) {
  const [reason, setReason] = React.useState("Select reason");
  const [effectiveDate, setEffectiveDate] = React.useState("2026-06-09");
  const [effectiveTime, setEffectiveTime] = React.useState("Now");
  const [note, setNote] = React.useState("");
  const [changeAreas, setChangeAreas] = React.useState<Record<string, boolean>>({});
  const areas = ["Dose", "Route", "Frequency", "Schedule", "Duration", "Instructions", "Pharmacy / substitute", "Safety checks"];
  const selectedAreas = areas.filter((area) => changeAreas[area]);
  const canConfirm = Boolean(order)
    && reason !== "Select reason"
    && selectedAreas.length > 0
    && Boolean(effectiveDate)
    && Boolean(effectiveTime)
    && (reason !== "Other" || Boolean(note.trim()));

  if (!order) return null;

  const submit = () => {
    if (!canConfirm) {
      toast.error("Select change area, reason and effective time before creating amended draft.");
      return;
    }
    onConfirm({
      changeAreas: selectedAreas,
      reason,
      effectiveDate,
      effectiveTime,
      note,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] flex max-h-[90dvh] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">Copy / Amend Order</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Original order remains unchanged. A new editable draft will be created.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close copy amend" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <MedicationContextItem label="Medicine" value={`${order.medication} ${order.dose}`} />
              <MedicationContextItem label="Route / frequency" value={`${order.route} | ${order.frequency}`} />
              <MedicationContextItem label="Schedule" value={order.scheduleTimes.join(", ")} />
              <MedicationContextItem label="Status" value={order.status} />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">What needs amendment?</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {areas.map((area) => (
                  <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm" key={area}>
                    <input
                      checked={Boolean(changeAreas[area])}
                      className="h-4 w-4 rounded border-border"
                      type="checkbox"
                      onChange={(event) => setChangeAreas((current) => ({ ...current, [area]: event.target.checked }))}
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NativeSelect
                label="Amendment reason"
                value={reason}
                onChange={setReason}
                options={[
                  "Select reason",
                  "Dose adjustment after review",
                  "Route change",
                  "Frequency / timing change",
                  "Clinical condition changed",
                  "Renal / hepatic adjustment",
                  "Pharmacy substitution",
                  "Duplicate therapy correction",
                  "Stewardship / antibiotic review",
                  "Other",
                ]}
              />
              <NativeSelect label="Effective time" value={effectiveTime} onChange={setEffectiveTime} options={["Now", "Next dose", "Next shift", "After review", "Custom noted below"]} />
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Effective date</span>
                <Input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
              </label>
              <TextField label="Doctor note" value={note} onChange={setNote} placeholder="What exactly should be changed and why?" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">{selectedAreas.length ? `${selectedAreas.length} amendment area(s) selected` : "Select amendment area before continuing"}</p>
            <div className="flex gap-2">
              <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
              <Button disabled={!canConfirm} onClick={submit}>
                <Copy className="h-4 w-4" />
                Create amended draft
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DoctorOrderStatusActionDialog({
  action,
  open,
  order,
  onOpenChange,
  onConfirm,
}: {
  action: DoctorOrderStatusAction | null;
  open: boolean;
  order?: DoctorMedicationOrder;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { reason: string; note: string; followUpPlan: string; effectiveTime: string }) => void;
}) {
  const [reason, setReason] = React.useState("Select reason");
  const [effectiveTime, setEffectiveTime] = React.useState("Now");
  const [reviewDate, setReviewDate] = React.useState("2026-06-09");
  const [reviewTime, setReviewTime] = React.useState("18:00");
  const [followUpPlan, setFollowUpPlan] = React.useState("");
  const [note, setNote] = React.useState("");
  const [checks, setChecks] = React.useState<Record<string, boolean>>({});

  if (!action || !order) return null;

  const isHold = action === "Hold";
  const reasonOptions = doctorOrderActionReasons(action);
  const checkLabels = doctorOrderActionChecks(action);
  const allChecksComplete = checkLabels.every((label) => checks[label]);
  const reasonMissing = !reason || reason === "Select reason";
  const noteMissing = reason === "Other" && !note.trim();
  const reviewMissing = isHold && (!reviewDate || !reviewTime);
  const planMissing = !isHold && !followUpPlan.trim();
  const canConfirm = allChecksComplete && !reasonMissing && !noteMissing && !reviewMissing && !planMissing;

  const submit = () => {
    if (!canConfirm) {
      toast.error("Reason, plan and confirmation checks are required.");
      return;
    }
    onConfirm({
      reason,
      note,
      followUpPlan: isHold ? `Review on ${reviewDate} ${reviewTime}${followUpPlan ? `; ${followUpPlan}` : ""}` : followUpPlan,
      effectiveTime,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] flex max-h-[90dvh] w-[min(720px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">Doctor {isHold ? "hold" : "discontinue"} reason</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {order.bedNo} | {order.medication} {order.dose} | {order.frequency}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close doctor order action" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <MedicationContextItem label="Order type" value={order.orderType} />
              <MedicationContextItem label="Route" value={order.route} />
              <MedicationContextItem label="Doctor" value={order.doctor} />
              <MedicationContextItem label="Status" value={order.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NativeSelect label="Reason node" value={reason} onChange={setReason} options={["Select reason", ...reasonOptions]} />
              <NativeSelect label="Effective time" value={effectiveTime} onChange={setEffectiveTime} options={["Now", "Next dose", "After current dose", "End of shift", "Custom noted below"]} />
              {isHold ? (
                <>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">Review date</span>
                    <Input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">Review time</span>
                    <Input type="time" value={reviewTime} onChange={(event) => setReviewTime(event.target.value)} />
                  </label>
                </>
              ) : (
                <TextField label="Replacement / follow-up plan" value={followUpPlan} onChange={setFollowUpPlan} placeholder="Alternative medicine, stop all future doses, pharmacy return, nurse instruction..." wide />
              )}
              {isHold ? <TextField label="Additional plan" value={followUpPlan} onChange={setFollowUpPlan} placeholder="Recheck labs, wait for doctor review, restart criteria..." wide /> : null}
            </div>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Doctor note</span>
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Clinical reason, nurse/pharmacy instruction, adverse effect, lab/vitals context..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>

            <div>
              <p className="text-sm font-semibold text-foreground">Confirmation checks</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {checkLabels.map((label) => (
                  <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm" key={label}>
                    <input
                      checked={Boolean(checks[label])}
                      className="h-4 w-4 rounded border-border"
                      type="checkbox"
                      onChange={(event) => setChecks((current) => ({ ...current, [label]: event.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">{allChecksComplete ? "Checks complete" : `${checkLabels.filter((label) => checks[label]).length}/${checkLabels.length} checks complete`}</p>
            <div className="flex gap-2">
              <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
              <Button disabled={!canConfirm} onClick={submit}>
                <Check className="h-4 w-4" />
                Confirm {isHold ? "hold" : "discontinue"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedicationChartTable({
  doses,
  selectedDoseId,
  onSelectDose,
  onRequestAction,
  onMarkPharmacyAvailable,
}: {
  doses: MedicationDoseRow[];
  selectedDoseId?: string;
  onSelectDose: (doseId: string) => void;
  onRequestAction: (doseId: string, action: MedicationNurseAction) => void;
  onMarkPharmacyAvailable: (orderId: string) => void;
}) {
  const orderedDoses = doses;
  const [openActionDoseId, setOpenActionDoseId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOpenActionDoseId(null);
  }, [doses]);

  if (!orderedDoses.length) {
    return <EmptyPanel title="No medicine found" detail="No dose is available for the current selection." />;
  }

  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="w-24 px-4 py-3">Time</th>
              <th className="min-w-[190px] px-4 py-3">Patient</th>
              <th className="min-w-[230px] px-4 py-3">Medicine</th>
              <th className="w-32 px-4 py-3">Dose / route</th>
              <th className="w-28 px-4 py-3">Frequency</th>
              <th className="w-44 px-4 py-3">Status</th>
              <th className="w-24 px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orderedDoses.map((dose) => {
              const patient = icuPatients.find((item) => item.id === dose.patientId);
              const selected = selectedDoseId === dose.id;
              return (
                <tr className={cn("transition hover:bg-slate-50/80", selected ? "bg-slate-50 ring-1 ring-inset ring-slate-200" : "bg-white")} key={dose.id}>
                  <td className="px-4 py-4 align-top">
                    <button className="text-left" type="button" onClick={() => onSelectDose(dose.id)}>
                      <span className="block font-semibold text-slate-950">{dose.scheduledTime}</span>
                      <span className="text-xs text-slate-500">{dose.shift}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <button className="text-left" type="button" onClick={() => onSelectDose(dose.id)}>
                      <span className="block font-semibold text-slate-950">{dose.bedNo} - {patient?.patientName ?? "Patient"}</span>
                      <span className="line-clamp-1 text-xs text-slate-500">{patient?.unit ?? dose.reason}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <button className="text-left" type="button" onClick={() => onSelectDose(dose.id)}>
                      <span className="block font-semibold text-slate-950">{dose.medication}</span>
                      <span className="line-clamp-1 text-xs text-slate-500">{dose.indication}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span className="block font-medium text-slate-950">{dose.dose}</span>
                    <span className="text-xs text-slate-500">{dose.route}</span>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-700">{dose.frequency}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1.5">
                      <Badge tone={medicationStatusTone(dose.status)}>{dose.status}</Badge>
                      {dose.highRisk ? <p className="text-xs text-slate-500">Double check: {dose.doubleVerification}</p> : null}
                      {dose.pharmacyStatus !== "Available" ? <p className="text-xs text-slate-500">Pharmacy: {dose.pharmacyStatus}</p> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <MedicationActionCell
                      dose={dose}
                      open={openActionDoseId === dose.id}
                      onMarkPharmacyAvailable={onMarkPharmacyAvailable}
                      onOpenChange={(open) => setOpenActionDoseId(open ? dose.id : null)}
                      onRequestAction={onRequestAction}
                      onSelectDose={onSelectDose}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type MedicationTableAction = {
  action: MedicationNurseAction;
  label: string;
  variant?: "default" | "outline";
};

function MedicationActionCell({
  dose,
  open,
  onRequestAction,
  onMarkPharmacyAvailable,
  onOpenChange,
  onSelectDose,
}: {
  dose: MedicationDoseRow;
  open: boolean;
  onRequestAction: (doseId: string, action: MedicationNurseAction) => void;
  onMarkPharmacyAvailable: (orderId: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelectDose: (doseId: string) => void;
}) {
  const actions = medicationTableActions(dose);
  const runAction = (action: MedicationTableAction["action"]) => {
    onSelectDose(dose.id);
    onRequestAction(dose.id, action);
  };

  if (!actions.length) {
    return <span className="text-xs font-semibold text-muted-foreground">Completed</span>;
  }

  return (
    <div className="relative flex min-w-[88px] justify-end">
      <button
        aria-expanded={open}
        aria-label="Medication actions"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-primary",
          open ? "border-sky-200 bg-sky-50 text-primary" : "",
        )}
        type="button"
        onClick={() => onOpenChange(!open)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-30 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
          {actions.map((item) => (
            <button
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              key={`${dose.id}-${item.action}`}
              type="button"
              onClick={() => {
                onOpenChange(false);
                runAction(item.action);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function medicationTableActions(dose: MedicationDoseRow): MedicationTableAction[] {
  const isClosed = ["Administered", "Skipped", "Missed", "Refused", "Stopped", "Paused"].includes(dose.status);
  const canAct = dose.orderStatus === "Active" && !isClosed;
  if (!canAct) return [];
  return [
    { action: "Administered", label: "Administer" },
    { action: "Held", label: "Hold", variant: "outline" },
    { action: "Skipped", label: "Skip", variant: "outline" },
  ];
}

function medicationChartSortValue(dose: MedicationDoseRow) {
  const typeRank = dose.orderType === "STAT" ? "0" : dose.status === "Running" ? "1" : dose.orderType === "PRN" ? "8" : "4";
  return `${typeRank}-${dose.scheduledTime}-${dose.medication}`;
}

function medicationExecutiveFocusRank(dose: MedicationDoseRow, focus: string) {
  const dueRank = isMedicationDueStatus(dose.status) ? 80 : dose.status === "Running" ? 60 : ["Held", "Missed", "Stopped"].includes(dose.status) ? 50 : 0;
  const highRiskRank = dose.highRisk ? 35 : 0;
  const pharmacyRank = dose.pharmacyStatus !== "Available" ? 30 : 0;
  const statRank = dose.orderType === "STAT" ? 25 : 0;
  if (focus === "medication") return dueRank + highRiskRank + pharmacyRank + statRank;
  return dueRank + highRiskRank;
}

function MedicationDoseCard({
  dose,
  selected,
  compact,
  onSelect,
  onRequestAction,
  onMarkPharmacyAvailable,
}: {
  dose: MedicationDoseRow;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
  onRequestAction: (action: MedicationNurseAction) => void;
  onMarkPharmacyAvailable: () => void;
}) {
  const patient = icuPatients.find((item) => item.id === dose.patientId);
  const isContinuous = dose.orderType === "Continuous";
  const needsPharmacy = dose.pharmacyStatus !== "Available";
  const needsVerification = dose.doubleVerification === "Pending";
  const isClosed = ["Administered", "Skipped", "Missed", "Refused", "Stopped"].includes(dose.status);
  const canAct = dose.orderStatus === "Active" && !isClosed;

  return (
    <div className={cn("rounded-md border bg-background p-3 transition", selected ? "border-primary bg-primary/5" : "border-border")}>
      <button className="w-full text-left" type="button" onClick={onSelect}>
        <div className={cn("grid gap-3", compact ? "lg:grid-cols-[150px_1fr]" : "lg:grid-cols-[160px_1fr_auto] lg:items-start")}>
          <div>
            <p className="text-sm font-semibold text-foreground">{dose.scheduledTime} · {dose.shift}</p>
            <p className="text-xs text-muted-foreground">{dose.scheduledDate}</p>
            <p className="text-xs text-muted-foreground">{dose.bedNo} | {patient?.patientName}</p>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{dose.medication} {dose.dose}</p>
              <StatusPill tone={medicationStatusTone(dose.status)}>{dose.status}</StatusPill>
              <Badge tone={orderTypeTone(dose.orderType)}>{dose.orderType}</Badge>
              {dose.highRisk ? <Badge tone="critical">High risk</Badge> : null}
              {needsVerification ? <Badge tone="warning">Verify pending</Badge> : null}
              {needsPharmacy ? <Badge tone={pharmacyStatusTone(dose.pharmacyStatus)}>{dose.pharmacyStatus}</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{dose.route} | {dose.frequency} | {dose.indication}</p>
            {!compact ? <p className="mt-1 text-xs text-muted-foreground">{dose.instructions}</p> : null}
          </div>
          {!compact ? (
            <div className="hidden text-right text-xs text-muted-foreground lg:block">
              <p>{dose.doctor}</p>
              <p>Actual: {dose.actualTime}</p>
              {dose.administeredBy !== "-" ? <p>{dose.administeredBy}</p> : null}
            </div>
          ) : null}
        </div>
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        {needsPharmacy && canAct ? (
          <Button size="sm" variant="outline" onClick={onMarkPharmacyAvailable}><Syringe className="h-4 w-4" />Mark received</Button>
        ) : null}
        {needsVerification && canAct ? (
          <Button size="sm" variant="outline" onClick={() => onRequestAction("Verify")}><ShieldAlert className="h-4 w-4" />Verify</Button>
        ) : null}
        {isContinuous && canAct ? (
          <>
            {dose.status !== "Running" ? <Button size="sm" onClick={() => onRequestAction("Running")}><Activity className="h-4 w-4" />Start</Button> : null}
            {dose.status === "Running" ? <Button size="sm" variant="outline" onClick={() => onRequestAction("Paused")}>Pause</Button> : null}
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Stopped")}>Stop</Button>
          </>
        ) : !isContinuous && canAct ? (
          <>
          <Button size="sm" onClick={() => onRequestAction("Administered")}><Check className="h-4 w-4" />Administer</Button>
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Held")}>Hold</Button>
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Skipped")}>Skip</Button>
            {dose.status === "Late" ? <Button size="sm" variant="outline" onClick={() => onRequestAction("Missed")}>Mark missed</Button> : null}
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Refused")}>Refuse</Button>
          </>
        ) : null}
        {!canAct ? <span className="self-center text-xs text-muted-foreground">No further nursing action required.</span> : null}
      </div>
    </div>
  );
}

function MedicationActionDialog({
  action,
  dose,
  open,
  onOpenChange,
  onConfirm,
}: {
  action: MedicationNurseAction | null;
  dose?: MedicationDoseRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { note: string; actualTime: string; administeredBy: string; verifier: string }) => void;
}) {
  const patient = icuPatients.find((item) => item.id === dose?.patientId);
  const initialClock = dose?.scheduledTime.match(/^\d{2}:\d{2}$/)?.[0] ?? "12:00";
  const [actualTime, setActualTime] = React.useState(initialClock);
  const [administeredBy, setAdministeredBy] = React.useState("Ward Nurse Current");
  const [verifier, setVerifier] = React.useState(allNurses.find((nurse) => nurse !== dose?.administeredBy) ?? "Head Nurse Sana");
  const [reason, setReason] = React.useState("");
  const [reviewTime, setReviewTime] = React.useState("");
  const [clinicalDetail, setClinicalDetail] = React.useState("");
  const [checks, setChecks] = React.useState<Record<string, boolean>>({});

  if (!dose || !action) return null;

  const isVerification = action === "Verify";
  const isAdministration = action === "Administered" || action === "Running";
  const requiresReason = ["Held", "Skipped", "Missed", "Refused", "Paused", "Stopped"].includes(action);
  const reasonOptions = medicationActionReasons(action);
  const checkLabels = medicationActionChecks(action, dose);
  const allChecksComplete = checkLabels.every((label) => checks[label]);
  const pharmacyBlocked = isAdministration && dose.pharmacyStatus !== "Available";
  const verificationBlocked = isAdministration && dose.doubleVerification === "Pending";
  const inactiveOrder = dose.orderStatus !== "Active";
  const prnAssessmentMissing = action === "Administered" && dose.orderType === "PRN" && !clinicalDetail.trim();
  const infusionDetailMissing = action === "Running" && !clinicalDetail.trim();
  const reasonMissing = requiresReason && (!reason.trim() || reason === "Select reason");
  const otherReasonMissing = reason === "Other" && !clinicalDetail.trim();
  const reviewTimeMissing = (action === "Held" || action === "Paused") && !reviewTime;
  const actualTimeMissing = !isVerification && !actualTime;
  const verifierMissing = isVerification && !verifier.trim();
  const canConfirm = allChecksComplete
    && !pharmacyBlocked
    && !verificationBlocked
    && !inactiveOrder
    && !prnAssessmentMissing
    && !infusionDetailMissing
    && !reasonMissing
    && !otherReasonMissing
    && !reviewTimeMissing
    && !actualTimeMissing
    && !verifierMissing;

  const confirmAction = () => {
    if (!canConfirm) {
      toast.error("Complete all required medication safety fields.");
      return;
    }
    const noteParts = [
      isVerification ? `Independent verification by ${verifier}` : medicationActionDefaultNote(action),
      reason ? `Reason: ${reason}` : "",
      clinicalDetail ? `${dose.orderType === "PRN" ? "Assessment" : action === "Running" ? "Infusion setup" : "Clinical detail"}: ${clinicalDetail}` : "",
      reviewTime ? `Review at ${reviewTime}` : "",
      !isVerification ? `Action time: ${actualTime}` : "",
      `Safety checks: ${checkLabels.join(", ")}`,
    ].filter(Boolean);
    onConfirm({
      note: noteParts.join(" | "),
      actualTime,
      administeredBy,
      verifier,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">{medicationActionLabel(action)}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {dose.bedNo} - {patient?.patientName} | {dose.medication} {dose.dose} | {dose.route}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close medication action" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <MedicationContextItem label="Schedule" value={`${dose.scheduledDate} ${dose.scheduledTime}`} />
              <MedicationContextItem label="Order" value={`${dose.orderType} | ${dose.frequency}`} />
              <MedicationContextItem label="Pharmacy" value={dose.pharmacyStatus} />
              <MedicationContextItem label="Verification" value={dose.doubleVerification} />
            </div>

            {pharmacyBlocked || verificationBlocked || inactiveOrder ? (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
                {inactiveOrder ? "Doctor order is not active. " : ""}
                {pharmacyBlocked ? "Medicine must be received from pharmacy. " : ""}
                {verificationBlocked ? "Complete independent double verification before administration." : ""}
              </div>
            ) : null}

            <div>
              <p className="text-sm font-semibold text-foreground">Required safety checks</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {checkLabels.map((label) => (
                  <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm" key={label}>
                    <input
                      checked={Boolean(checks[label])}
                      className="h-4 w-4 rounded border-border"
                      type="checkbox"
                      onChange={(event) => setChecks((current) => ({ ...current, [label]: event.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {isVerification ? (
              <NativeSelect label="Independent verifier" value={verifier} onChange={setVerifier} options={Array.from(new Set([...allNurses, "Head Nurse Sana"]))} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <NativeSelect label="Administering nurse" value={administeredBy} onChange={setAdministeredBy} options={Array.from(new Set(["Ward Nurse Current", ...allNurses]))} />
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-foreground">Actual time</span>
                  <Input type="time" value={actualTime} onChange={(event) => setActualTime(event.target.value)} />
                </label>
              </div>
            )}

            {requiresReason ? (
              <NativeSelect label={`${medicationActionLabel(action)} reason`} value={reason} onChange={setReason} options={["Select reason", ...reasonOptions]} />
            ) : null}

            {action === "Held" || action === "Paused" ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Review / reassessment time</span>
                <Input type="time" value={reviewTime} onChange={(event) => setReviewTime(event.target.value)} />
              </label>
            ) : null}

            {action === "Administered" && dose.orderType === "PRN" ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">PRN indication and pre-assessment</span>
                <textarea
                  className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Pain score, temperature, symptom, or clinical trigger..."
                  value={clinicalDetail}
                  onChange={(event) => setClinicalDetail(event.target.value)}
                />
              </label>
            ) : null}

            {action === "Running" ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Infusion setup</span>
                <textarea
                  className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Pump ID, concentration, rate, line and target..."
                  value={clinicalDetail}
                  onChange={(event) => setClinicalDetail(event.target.value)}
                />
              </label>
            ) : null}

            {!isVerification && action !== "Running" && !(action === "Administered" && dose.orderType === "PRN") ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Clinical note</span>
                <textarea
                  className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Vitals/lab review, patient response, doctor communication, or additional note..."
                  value={clinicalDetail}
                  onChange={(event) => setClinicalDetail(event.target.value)}
                />
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">{allChecksComplete ? "Safety checklist complete" : `${checkLabels.filter((label) => checks[label]).length}/${checkLabels.length} safety checks complete`}</p>
            <div className="flex gap-2">
              <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
              <Button disabled={!canConfirm} onClick={confirmAction}>
                <Check className="h-4 w-4" />
                Confirm {medicationActionLabel(action).toLowerCase()}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedicationContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function medicationActionLabel(action: MedicationNurseAction) {
  if (action === "Administered") return "Administer medicine";
  if (action === "Running") return "Start infusion";
  if (action === "Paused") return "Pause infusion";
  if (action === "Stopped") return "Stop infusion";
  if (action === "Verify") return "Double verification";
  return action;
}

function medicationActionDefaultNote(action: MedicationNurseAction) {
  if (action === "Administered") return "Dose administered after medication safety verification";
  if (action === "Running") return "Infusion started as prescribed";
  if (action === "Paused") return "Infusion paused after clinical review";
  if (action === "Stopped") return "Infusion stopped with reason documented";
  if (action === "Held") return "Dose held with clinical reason documented";
  if (action === "Skipped") return "Dose skipped with reason documented";
  if (action === "Missed") return "Missed dose documented and escalated";
  if (action === "Refused") return "Patient or family refusal documented";
  return "Independent double verification completed";
}

function medicationActionReasons(action: MedicationNurseAction) {
  if (action === "Held") return ["Clinical condition changed", "Required vital or lab not met", "Doctor instructed hold", "Patient NPO", "Other"];
  if (action === "Skipped") return ["Medicine unavailable", "Procedure or transfer in progress", "Dose no longer applicable", "Documentation correction", "Other"];
  if (action === "Missed") return ["Dose identified after allowed window", "Medicine unavailable beyond due time", "Patient unavailable", "Clinical emergency delayed administration", "Other"];
  if (action === "Refused") return ["Patient refused", "Family refused on patient behalf", "Unable to administer safely", "Other"];
  if (action === "Paused") return ["Clinical reassessment", "Line or pump issue", "Procedure or transport", "Doctor instruction", "Other"];
  if (action === "Stopped") return ["Infusion completed", "Doctor discontinued", "Adverse reaction suspected", "Line complication", "Other"];
  return [];
}

function medicationActionChecks(action: MedicationNurseAction, dose: MedicationDoseRow) {
  if (action === "Verify") return ["Medicine and dose independently matched", "Dose calculation independently checked", "Route, concentration, and pump settings checked"];
  if (action === "Administered" || action === "Running") {
    return [
      "Right patient confirmed",
      "Right medicine confirmed",
      "Right dose confirmed",
      "Right route confirmed",
      "Right time confirmed",
      "Allergy status reviewed",
      dose.highRisk ? "High-risk precautions reviewed" : "Required vitals and labs reviewed",
    ];
  }
  return ["Patient condition reviewed", "Doctor order status reviewed", "Escalation or communication requirement reviewed"];
}

function doctorOrderActionReasons(action: DoctorOrderStatusAction) {
  if (action === "Hold") {
    return [
      "Clinical condition changed",
      "Vitals unstable for administration",
      "Required lab value pending",
      "Renal / hepatic dose review pending",
      "Possible adverse reaction",
      "Procedure / transfer in progress",
      "Duplicate order needs review",
      "Pharmacy substitution pending",
      "Other",
    ];
  }
  return [
    "Treatment completed",
    "Medicine no longer indicated",
    "Adverse reaction / allergy suspected",
    "Duplicate or overlapping therapy",
    "Changed to alternative medicine",
    "Renal / hepatic safety concern",
    "Patient transferred / discharged",
    "End-of-life / comfort care decision",
    "Other",
  ];
}

function doctorOrderActionChecks(action: DoctorOrderStatusAction) {
  if (action === "Hold") {
    return [
      "Patient condition and latest vitals reviewed",
      "Nurse to be notified before next scheduled dose",
      "Pharmacy impact reviewed",
      "Review time documented",
    ];
  }
  return [
    "All future doses will be stopped",
    "Nurse and pharmacy communication required",
    "Replacement or follow-up plan documented",
    "Medication reconciliation impact reviewed",
  ];
}

function MedicationDoctorOrdersPanel({
  orders,
  onCopyOrder,
  onHoldOrder,
  onResumeOrder,
  onSignDraft,
  onStopOrder,
}: {
  orders: DoctorMedicationOrder[];
  onCopyOrder: (orderId: string) => void;
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
  onSignDraft: (orderId: string) => void;
  onStopOrder: (orderId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const patient = icuPatients.find((item) => item.id === order.patientId);
        const formularyMedicine = getFormularyMedicineForOrder(order);
        const stockStatus = order.stockStatus ?? formularyMedicine?.availability;
        const pharmacyLocation = order.pharmacyLocation ?? formularyMedicine?.pharmacyLocation ?? "Pharmacy";
        const alternatives = order.alternativeMeds ?? formularyMedicine?.alternatives ?? [];
        const scenarioNotes = order.scenarioNotes ?? formularyMedicine?.safetyFlags ?? [];
        return (
          <div className="rounded-md border border-border bg-surface p-3" key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{order.medication} {order.dose}</p>
                <p className="mt-1 text-xs text-muted-foreground">{order.bedNo} | {patient?.patientName} | {order.doctor}</p>
              </div>
              <StatusPill tone={medicationOrderStatusTone(order.status)}>{order.status}</StatusPill>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {order.department ? <Badge tone="info">{order.department}</Badge> : null}
              <Badge tone={orderTypeTone(order.orderType)}>{order.orderType}</Badge>
              <Badge tone={pharmacyStatusTone(order.pharmacyStatus)}>{order.pharmacyStatus}</Badge>
              {stockStatus ? <Badge tone={formularyAvailabilityTone(stockStatus)}>{stockStatus}</Badge> : null}
              {order.highRisk ? <Badge tone="critical">High risk</Badge> : null}
              {order.doubleVerificationRequired ? <Badge tone="warning">Double verify</Badge> : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{order.frequency} | {order.scheduleTimes.join(", ")} | {order.indication}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start: {order.startDate ?? "Not set"} {order.startTime ?? ""}{order.duration ? ` | Duration: ${order.duration}` : ""}
              {order.reviewDate ? ` | Review: ${order.reviewDate}` : ""}
            </p>
            {order.orderType === "PRN" ? <p className="mt-1 text-xs text-muted-foreground">PRN: minimum {order.minInterval || "not set"} | maximum {order.maxDailyDose || "not set"}</p> : null}
            {order.orderType === "Continuous" ? <p className="mt-1 text-xs text-muted-foreground">Target: {order.titrationTarget || "not set"} | Range: {order.minRate || "-"} to {order.maxRate || "-"}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">Pharmacy: {pharmacyLocation}{alternatives.length ? ` | Alternatives: ${alternatives.join(", ")}` : ""}</p>
            {order.statusReason ? (
              <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-2 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Latest doctor reason: {order.statusReason}</p>
                {order.followUpPlan ? <p className="mt-1">{order.followUpPlan}</p> : null}
              </div>
            ) : null}
            {order.actionTimeline?.length ? (
              <div className="mt-2 space-y-1">
                {order.actionTimeline.slice(0, 2).map((item) => (
                  <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={item}>{item}</div>
                ))}
              </div>
            ) : null}
            {scenarioNotes.length ? (
              <div className="mt-3 grid gap-2">
                {scenarioNotes.slice(0, 2).map((note) => (
                  <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={note}>{note}</div>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {order.status === "Draft" ? (
                <Button size="sm" onClick={() => onSignDraft(order.id)}><FileSignature className="h-4 w-4" />Review & sign</Button>
              ) : order.status === "Held by doctor" ? (
                <Button size="sm" variant="outline" onClick={() => onResumeOrder(order.id)}>Resume</Button>
              ) : order.status === "Active" ? (
                <Button size="sm" variant="outline" onClick={() => onHoldOrder(order.id)}>Doctor hold</Button>
              ) : null}
              <Button size="sm" variant="outline" onClick={() => onCopyOrder(order.id)}><Copy className="h-4 w-4" />Copy / amend</Button>
              {order.status !== "Draft" ? <Button size="sm" variant="outline" onClick={() => onStopOrder(order.id)} disabled={order.status === "Discontinued"}>Discontinue</Button> : null}
            </div>
          </div>
        );
      })}
      {!orders.length ? <EmptyPanel title="No doctor order" detail="Add or search a medication order." /> : null}
    </div>
  );
}

export function AlertsEscalationWorkspace() {
  const [rows, setRows] = React.useState<WorkflowAlert[]>(() => icuAlerts.map((alert) => ({
    ...alert,
    status: alert.status === "Open" ? "New" : alert.status,
    assignedTo: alert.owner,
    timeline: [`${alert.createdAt}: ${alert.message}`],
  })));
  const [status, setStatus] = React.useState<"All status" | WorkflowAlertStatus>("All status");
  const [severity, setSeverity] = React.useState("All severity");
  const [source, setSource] = React.useState("All sources");
  const [owner, setOwner] = React.useState("All owners");
  const [patient, setPatient] = React.useState("All patients");
  const [timeWindow, setTimeWindow] = React.useState("All time");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(rows[0]?.id ?? "");
  const [actionOwner, setActionOwner] = React.useState(rows[0]?.assignedTo ?? "Duty Doctor");
  const [actionNote, setActionNote] = React.useState("Clinical context reviewed. Owner informed and next action documented.");

  const sourceOptions = React.useMemo(() => ["All sources", ...Array.from(new Set(rows.map((row) => row.source)))], [rows]);
  const ownerOptions = React.useMemo(() => ["All owners", ...Array.from(new Set(rows.map((row) => row.assignedTo)))], [rows]);
  const patientOptions = React.useMemo(() => ["All patients", ...icuPatients.map((item) => alertPatientOption(item))], []);

  const visibleRows = rows.filter((row) => {
    const rowPatient = icuPatients.find((item) => item.id === row.patientId);
    const search = query.trim().toLowerCase();
    const searchMatch = !search
      || row.bedNo.toLowerCase().includes(search)
      || row.type.toLowerCase().includes(search)
      || row.source.toLowerCase().includes(search)
      || row.message.toLowerCase().includes(search)
      || row.assignedTo.toLowerCase().includes(search)
      || rowPatient?.patientName.toLowerCase().includes(search)
      || rowPatient?.mrn.toLowerCase().includes(search);
    const patientMatch = patient === "All patients" || (rowPatient ? alertPatientOption(rowPatient) === patient : false);
    const timeMatch = timeWindow === "All time" || alertInTimeWindow(row.createdAt, timeWindow);
    return searchMatch
      && patientMatch
      && timeMatch
      && (status === "All status" || row.status === status)
      && (severity === "All severity" || row.severity === severity)
      && (source === "All sources" || row.source === source)
      && (owner === "All owners" || row.assignedTo === owner);
  }).sort(alertQueueSort);
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const rowSignature = visibleRows.map((row) => row.id).join("|");
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = visibleRows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(currentPage * pageSize, visibleRows.length);
  const pageRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedAlert = rows.find((row) => row.id === selectedId) ?? visibleRows[0] ?? rows[0];
  const selectedPatient = selectedAlert ? icuPatients.find((item) => item.id === selectedAlert.patientId) : undefined;
  const selectedVital = selectedAlert ? icuVitals.find((item) => item.patientId === selectedAlert.patientId) : undefined;
  const selectedMedicationRisk = selectedAlert ? medicationRows.filter((item) => item.patientId === selectedAlert.patientId && ["Due", "Late"].includes(item.status)) : [];
  const selectedOpenTasks = selectedAlert ? icuTasks.filter((item) => item.patientId === selectedAlert.patientId && item.status !== "Completed") : [];
  const selectedSla = selectedAlert ? alertSlaState(selectedAlert) : null;

  React.useEffect(() => {
    setPage(1);
  }, [rowSignature]);

  const changeAlert = (alertId: string, nextStatus: WorkflowAlertStatus, note = actionNote) => {
    setRows((current) => current.map((row) => {
      if (row.id !== alertId) return row;
      const assignedTo = nextStatus === "Assigned" ? actionOwner : row.assignedTo;
      return {
        ...row,
        status: nextStatus,
        assignedTo,
        timeline: [`Now: ${nextStatus}${nextStatus === "Assigned" ? ` to ${assignedTo}` : ""}. ${note}`, ...row.timeline],
      };
    }));
    toast.success(`Alert moved to ${nextStatus}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricTile label="Critical open" value={rows.filter((row) => row.severity === "Critical" && !["Resolved", "Closed"].includes(row.status)).length} tone="critical" icon={ShieldAlert} />
        <MetricTile label="Unacknowledged" value={rows.filter((row) => row.status === "New").length} tone="danger" icon={AlertTriangle} />
        <MetricTile label="SLA breached" value={rows.filter((row) => alertSlaState(row).breached && !["Resolved", "Closed"].includes(row.status)).length} tone="critical" icon={Clock} />
        <MetricTile label="Assigned" value={rows.filter((row) => row.status === "Assigned").length} tone="warning" icon={ArrowRight} />
        <MetricTile label="Resolved" value={rows.filter((row) => ["Resolved", "Closed"].includes(row.status)).length} tone="success" icon={CheckCircle2} />
        <MetricTile label="Repeated" value={alertRepeatedCount(rows)} tone="info" icon={AlertCircle} />
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_repeat(5,minmax(150px,1fr))_auto] xl:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Search alert</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Patient, bed, MRN, source, message..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </span>
          </label>
          <NativeSelect label="Patient" value={patient} onChange={setPatient} options={patientOptions} />
          <NativeSelect label="Alert status" value={status} onChange={(value) => setStatus(value as "All status" | WorkflowAlertStatus)} options={["All status", ...alertStatusFlow]} />
          <NativeSelect label="Severity" value={severity} onChange={setSeverity} options={["All severity", "Critical", "High", "Medium", "Info"]} />
          <NativeSelect label="Source" value={source} onChange={setSource} options={sourceOptions} />
          <NativeSelect label="Owner" value={owner} onChange={setOwner} options={ownerOptions} />
          <NativeSelect label="Time" value={timeWindow} onChange={setTimeWindow} options={["All time", "Last 15 min", "Last 30 min", "Last 1 hour", "Older than 1 hour"]} />
          <Button variant="outline" onClick={() => {
            setQuery("");
            setPatient("All patients");
            setStatus("All status");
            setSeverity("All severity");
            setSource("All sources");
            setOwner("All owners");
            setTimeWindow("All time");
          }}><Filter className="h-4 w-4" />Reset</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Alert Queue</CardTitle>
              <CardDescription>Critical alerts stay on top. Filter by source, owner, status, patient, and time.</CardDescription>
            </div>
            <Badge tone={visibleRows.length ? "info" : "warning"}>{visibleRows.length} visible</Badge>
          </CardHeader>
          <CardContent className="max-h-[680px] space-y-3 overflow-y-auto">
            {pageRows.map((row) => {
              const rowPatient = icuPatients.find((item) => item.id === row.patientId);
              const sla = alertSlaState(row);
              return (
                <button
                  className={cn(
                    "w-full rounded-md border bg-background p-3 text-left transition hover:bg-surface-muted",
                    row.severity === "Critical" && !["Resolved", "Closed"].includes(row.status) ? "border-critical/40 bg-critical/5" : "border-border",
                    selectedAlert?.id === row.id ? "border-primary bg-primary/5" : "",
                  )}
                  key={row.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(row.id);
                    setActionOwner(row.assignedTo);
                    setActionNote(alertDefaultActionNote(row));
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{row.bedNo} - {rowPatient?.patientName}</p>
                      <p className="text-xs text-muted-foreground">{rowPatient?.mrn} | {row.type}</p>
                    </div>
                    <Badge tone={toneForPriority(row.severity === "Info" ? "Routine" : row.severity)}>{row.severity}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{row.message}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone={alertStatusTone(row.status)}>{row.status}</StatusPill>
                    <Badge tone={sla.breached ? "critical" : sla.tone}>{sla.label}</Badge>
                    <Badge tone="info">{row.source}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{row.assignedTo}</span>
                    <span>{row.createdAt}</span>
                  </div>
                </button>
              );
            })}
            {!visibleRows.length ? <EmptyPanel title="No alert matched" detail="Change search, status, severity, source, owner, patient, or time filter." /> : null}
          </CardContent>
          {visibleRows.length ? (
            <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">Showing {pageStart}-{pageEnd} of {visibleRows.length}</span>
              <div className="flex items-center gap-2">
                <Button disabled={currentPage <= 1} size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
                <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 font-bold text-foreground">{currentPage} / {totalPages}</span>
                <Button disabled={currentPage >= totalPages} size="sm" variant="outline" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Clinical Alert Detail</CardTitle>
              <CardDescription>Patient context, SLA, owner, action note, and audit timeline.</CardDescription>
            </div>
            {selectedAlert ? <StatusPill tone={alertStatusTone(selectedAlert.status)}>{selectedAlert.status}</StatusPill> : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAlert ? (
              <>
                <div className="rounded-md border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={toneForPriority(selectedAlert.severity === "Info" ? "Routine" : selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                    <Badge tone="info">{selectedAlert.assignedTo}</Badge>
                    {selectedSla ? <Badge tone={selectedSla.breached ? "critical" : selectedSla.tone}>{selectedSla.label}</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{selectedAlert.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedAlert.source} | {selectedAlert.createdAt} | {selectedPatient?.bedNo} {selectedPatient?.patientName}</p>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <InfoPanel title="Patient Context" rows={[
                    ["Patient", selectedPatient ? `${selectedPatient.patientName} (${selectedPatient.ageGender})` : "-"],
                    ["MRN", selectedPatient?.mrn ?? "-"],
                    ["Diagnosis", selectedPatient?.diagnosis ?? "-"],
                    ["Unit / doctor", selectedPatient ? `${selectedPatient.unit} / ${selectedPatient.dutyDoctor}` : "-"],
                    ["Latest vitals", selectedVital ? `SpO2 ${selectedVital.spo2}%, BP ${selectedVital.bp}, Pulse ${selectedVital.pulse}` : "No latest vital"],
                  ]} />
                  <InfoPanel title="Related Work" rows={[
                    ["Due / late meds", selectedMedicationRisk.length ? selectedMedicationRisk.map((item) => item.medication).join(", ") : "None"],
                    ["Open tasks", `${selectedOpenTasks.length}`],
                    ["Source", selectedAlert.source],
                    ["Owner", selectedAlert.assignedTo],
                    ["Repeat risk", alertRepeatedForPatient(rows, selectedAlert.patientId) > 1 ? `${alertRepeatedForPatient(rows, selectedAlert.patientId)} alerts for patient` : "No repeat pattern"],
                  ]} />
                </div>

                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">Action workspace</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <NativeSelect label="Responsible owner" value={actionOwner} onChange={setActionOwner} options={uniqueWorkflowOptions([selectedAlert.assignedTo, "Duty Doctor", "Head Nurse Sana", "Ward Nurse", "Unit Nurse", "Pharmacy", "Biomedical Raj", "Respiratory Therapist", "Lab / Radiology"])} />
                    <NativeSelect label="Escalation route" value={selectedAlert.severity === "Critical" ? "Immediate doctor escalation" : "Routine owner follow-up"} onChange={() => undefined} options={["Immediate doctor escalation", "Head nurse review", "Routine owner follow-up", "Pharmacy follow-up", "Biomedical follow-up", "Lab / radiology follow-up"]} />
                  </div>
                  <label className="mt-3 block space-y-1 text-sm">
                    <span className="font-medium text-foreground">Action / resolution note</span>
                    <textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={actionNote} onChange={(event) => setActionNote(event.target.value)} />
                  </label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                    <Button size="sm" onClick={() => changeAlert(selectedAlert.id, "Acknowledged")} disabled={selectedAlert.status !== "New"}><Check className="h-4 w-4" />Ack</Button>
                    <Button size="sm" variant="outline" onClick={() => changeAlert(selectedAlert.id, "Assigned")} disabled={!["New", "Acknowledged"].includes(selectedAlert.status)}>Assign</Button>
                    <Button size="sm" variant="outline" onClick={() => recordAlertActivity(selectedAlert.id, "Task created from alert", actionNote, setRows)}><ClipboardCheck className="h-4 w-4" />Task</Button>
                    <Button size="sm" variant="outline" onClick={() => recordAlertActivity(selectedAlert.id, `${actionOwner} notified`, actionNote, setRows)}>Notify</Button>
                    <Button size="sm" variant="outline" onClick={() => changeAlert(selectedAlert.id, "Resolved")} disabled={["Resolved", "Closed"].includes(selectedAlert.status)}>Resolve</Button>
                    <Button size="sm" variant="outline" onClick={() => changeAlert(selectedAlert.id, "Closed")} disabled={selectedAlert.status !== "Resolved"}>Close</Button>
                  </div>
                </div>

                {selectedPatient ? (
                  <Button variant="outline" asChild>
                    <Link href={`/icu-command-center/patients/${selectedPatient.id}?tab=overview`}>
                      Open patient overview
                    </Link>
                  </Button>
                ) : null}

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Timeline</p>
                  {selectedAlert.timeline.map((item, index) => (
                    <div className="flex gap-2 rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={`${item}-${index}`}>
                      <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyPanel title="No alert selected" detail="Select an alert from queue." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function alertPatientOption(patient: IcuPatient) {
  return `${patient.bedNo} - ${patient.patientName}`;
}

function alertElapsedMinutes(value: string) {
  const amount = Number(value.match(/\d+/)?.[0] ?? "0");
  const lower = value.toLowerCase();
  if (lower.includes("hr") || lower.includes("hour")) return amount * 60;
  return amount;
}

function alertInTimeWindow(createdAt: string, window: string) {
  const minutes = alertElapsedMinutes(createdAt);
  if (window === "Last 15 min") return minutes <= 15;
  if (window === "Last 30 min") return minutes <= 30;
  if (window === "Last 1 hour") return minutes <= 60;
  if (window === "Older than 1 hour") return minutes > 60;
  return true;
}

function alertSeverityRank(severity: IcuAlert["severity"]) {
  if (severity === "Critical") return 0;
  if (severity === "High") return 1;
  if (severity === "Medium") return 2;
  return 3;
}

function alertStatusRank(status: WorkflowAlertStatus) {
  if (status === "New") return 0;
  if (status === "Acknowledged") return 1;
  if (status === "Assigned") return 2;
  if (status === "Resolved") return 3;
  return 4;
}

function alertQueueSort(a: WorkflowAlert, b: WorkflowAlert) {
  const aDone = ["Resolved", "Closed"].includes(a.status);
  const bDone = ["Resolved", "Closed"].includes(b.status);
  if (aDone !== bDone) return aDone ? 1 : -1;
  const severity = alertSeverityRank(a.severity) - alertSeverityRank(b.severity);
  if (severity) return severity;
  const status = alertStatusRank(a.status) - alertStatusRank(b.status);
  if (status) return status;
  return alertElapsedMinutes(b.createdAt) - alertElapsedMinutes(a.createdAt);
}

function alertSlaMinutes(severity: IcuAlert["severity"]) {
  if (severity === "Critical") return 10;
  if (severity === "High") return 20;
  if (severity === "Medium") return 45;
  return 120;
}

function alertSlaState(alert: WorkflowAlert): { label: string; breached: boolean; tone: StatusTone } {
  if (alert.status === "Closed") return { label: "Closed", breached: false, tone: "success" };
  if (alert.status === "Resolved") return { label: "Resolved", breached: false, tone: "success" };
  const elapsed = alertElapsedMinutes(alert.createdAt);
  const sla = alertSlaMinutes(alert.severity);
  const remaining = sla - elapsed;
  if (remaining < 0) return { label: `${Math.abs(remaining)} min breached`, breached: true, tone: "critical" };
  if (remaining <= 5) return { label: `${remaining} min left`, breached: false, tone: "warning" };
  return { label: `${remaining} min left`, breached: false, tone: "success" };
}

function alertRepeatedForPatient(rows: WorkflowAlert[], patientId: string) {
  return rows.filter((row) => row.patientId === patientId && !["Resolved", "Closed"].includes(row.status)).length;
}

function alertRepeatedCount(rows: WorkflowAlert[]) {
  const patientCounts = rows.reduce<Record<string, number>>((acc, row) => {
    if (["Resolved", "Closed"].includes(row.status)) return acc;
    acc[row.patientId] = (acc[row.patientId] ?? 0) + 1;
    return acc;
  }, {});
  return Object.values(patientCounts).filter((count) => count > 1).length;
}

function alertDefaultActionNote(alert: WorkflowAlert) {
  if (alert.severity === "Critical") return `Critical alert reviewed. ${alert.assignedTo} to act immediately and document clinical response.`;
  if (alert.status === "Resolved") return "Clinical response completed. Ready for closure after verification.";
  return `${alert.type} reviewed. Owner to update action taken and next review time.`;
}

function uniqueWorkflowOptions(options: string[]) {
  return Array.from(new Set(options.filter(Boolean)));
}

function recordAlertActivity(
  alertId: string,
  label: string,
  note: string,
  setRows: React.Dispatch<React.SetStateAction<WorkflowAlert[]>>,
) {
  setRows((current) => current.map((row) => (
    row.id === alertId
      ? { ...row, timeline: [`Now: ${label}. ${note}`, ...row.timeline] }
      : row
  )));
  toast.success(label);
}

export function WorkflowReportsWorkspace() {
  const medicationCompliance = Math.round((medicationRows.filter((row) => row.status === "Administered").length / medicationRows.length) * 100);
  const taskCompletion = Math.round((icuTasks.filter((task) => task.status === "Completed").length / icuTasks.length) * 100);
  const alertClosure = Math.round((icuAlerts.filter((alert) => alert.status === "Resolved").length / icuAlerts.length) * 100);
  const chartRows = [
    { name: "Medication", value: medicationCompliance },
    { name: "Tasks", value: taskCompletion },
    { name: "Alerts", value: alertClosure },
    { name: "Handover", value: 72 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Med compliance" value={`${medicationCompliance}%`} tone={medicationCompliance > 80 ? "success" : "warning"} icon={Pill} />
        <MetricTile label="Task completion" value={`${taskCompletion}%`} tone={taskCompletion > 80 ? "success" : "warning"} icon={ListChecks} />
        <MetricTile label="Alert closure" value={`${alertClosure}%`} tone={alertClosure > 80 ? "success" : "danger"} icon={AlertCircle} />
        <MetricTile label="Signal issues" value={deviceRows.filter((row) => row.signal !== "Good").length} tone="warning" icon={MonitorDot} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Workflow Compliance</CardTitle>
              <CardDescription>Current ICU nursing workflow completion snapshot.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartRows.map((row) => (
              <div className="space-y-2" key={row.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{row.name}</span>
                  <span className="text-muted-foreground">{row.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
                  <div className={cn("h-full rounded-full", row.value >= 80 ? "bg-success" : row.value >= 60 ? "bg-warning" : "bg-danger")} style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Device Signal Health</CardTitle>
              <CardDescription>Bed-wise monitor, ventilator, and pump connectivity.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {deviceRows.map((device) => (
              <div className="rounded-md border border-border bg-background p-3" key={device.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{device.bedNo} - {device.patientName}</p>
                    <p className="text-xs text-muted-foreground">Last data: {device.lastData}</p>
                  </div>
                  <StatusPill tone={device.signal === "Good" ? "success" : "warning"}>{device.signal}</StatusPill>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  <span>Monitor: {device.monitor}</span>
                  <span>Ventilator: {device.ventilator}</span>
                  <span>Infusion pump: {device.infusionPump}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Operational Reports</CardTitle>
            <CardDescription>Occupancy, compliance, transfusion, fluid balance, and follow-up reports.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr className="border-t border-border" key={row.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.report}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.scope}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.count}</td>
                  <td className="px-4 py-3"><StatusPill tone={toneForStatus(row.status)}>{row.status}</StatusPill></td>
                  <td className="px-4 py-3 text-muted-foreground">{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientMiniCard({ patient, active, onSelect }: { patient: IcuPatient; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={cn(
        "w-full rounded-md border border-border bg-background p-3 text-left transition hover:bg-surface-muted",
        active ? "border-primary bg-primary/5" : "",
      )}
      type="button"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{patient.bedNo} - {patient.patientName}</p>
          <p className="text-xs text-muted-foreground">{patient.mrn} | {patient.ageGender}</p>
        </div>
        <Badge tone={patient.criticalityScore >= 8 ? "critical" : "warning"}>Score {patient.criticalityScore}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{patient.diagnosis}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        <StatusPill tone={toneForStatus(patient.currentStatus)}>{patient.currentStatus}</StatusPill>
        <Badge tone={patient.pendingTasks ? "warning" : "success"}>{patient.pendingTasks} tasks</Badge>
      </div>
    </button>
  );
}

function PatientActionWorkspace({ patient }: { patient?: IcuPatient }) {
  const [note, setNote] = React.useState("");

  if (!patient) return <EmptyPanel title="No patient selected" detail="Select a patient from the bed board." />;

  const vitals = icuVitals.filter((row) => row.patientId === patient.id);
  const tasks = icuTasks.filter((row) => row.patientId === patient.id);
  const meds = medicationRows.filter((row) => row.patientId === patient.id);
  const alerts = icuAlerts.filter((row) => row.patientId === patient.id);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{patient.patientName}</CardTitle>
          <CardDescription>{patient.bedNo} | {patient.unit} | {patient.admissionSource}</CardDescription>
        </div>
        <StatusPill tone={toneForStatus(patient.currentStatus)}>{patient.currentStatus}</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Vitals rows" value={vitals.length} tone={vitals.some((row) => row.abnormal) ? "danger" : "success"} icon={HeartPulse} />
          <MetricTile label="Open tasks" value={tasks.filter((row) => row.status !== "Completed").length} tone="warning" icon={ListChecks} />
          <MetricTile label="Due meds" value={meds.filter((row) => ["Due", "Late"].includes(row.status)).length} tone="danger" icon={Pill} />
          <MetricTile label="Alerts" value={alerts.length} tone={alerts.some((row) => row.severity === "Critical") ? "critical" : "warning"} icon={AlertTriangle} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <InfoPanel title="Clinical Snapshot" rows={[
            ["Diagnosis", patient.diagnosis],
            ["Ventilator", patient.ventilatorStatus],
            ["Doctor", patient.admittingDoctor],
            ["Ward nurse", patient.assignedWardNurse],
          ]} />
          <InfoPanel title="Device Snapshot" rows={[
            ["Monitor", deviceRows.find((row) => row.bedNo === patient.bedNo)?.monitor ?? "Not mapped"],
            ["Ventilator", deviceRows.find((row) => row.bedNo === patient.bedNo)?.ventilator ?? patient.ventilatorStatus],
            ["Pump", deviceRows.find((row) => row.bedNo === patient.bedNo)?.infusionPump ?? "Not mapped"],
            ["Last data", deviceRows.find((row) => row.bedNo === patient.bedNo)?.lastData ?? "Pending"],
          ]} />
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">Quick nursing note</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="Add observation, action, or handover note..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => toast.success("Monitoring action opened")}>Monitor</Button>
          <Button variant="outline" onClick={() => toast.success("Medication timeline opened")}>Medication</Button>
          <Button onClick={() => {
            toast.success("Nursing note saved");
            setNote("");
          }}><FileText className="h-4 w-4" />Save note</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SmartBedView({ patient }: { patient?: IcuPatient }) {
  const [section, setSection] = React.useState("Nurse Entry");

  if (!patient) return <EmptyPanel title="No patient selected" detail="Select a patient from the bed board." />;

  const vitals = icuVitals.filter((row) => row.patientId === patient.id);
  const trendRows = vitals.length ? vitals : icuVitals;
  const meds = medicationRows.filter((row) => row.patientId === patient.id);
  const tasks = icuTasks.filter((row) => row.patientId === patient.id);
  const alerts = icuAlerts.filter((row) => row.patientId === patient.id);
  const fluids = infusionRows.filter((row) => row.patientId === patient.id);
  const ioRows = intakeOutputRows.filter((row) => row.patientId === patient.id);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Smart Bed View</CardTitle>
          <CardDescription>{patient.bedNo} | {patient.patientName} | {patient.diagnosis}</CardDescription>
        </div>
        <Badge tone={patient.criticalityScore >= 8 ? "critical" : "warning"}>Risk {patient.criticalityScore}/10</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="SpO2" value={`${vitals[0]?.spo2 ?? 96}%`} tone={(vitals[0]?.spo2 ?? 96) < 92 ? "critical" : "success"} icon={HeartPulse} />
          <MetricTile label="BP" value={vitals[0]?.bp ?? "118/76"} tone={vitals.some((row) => row.abnormal) ? "danger" : "success"} icon={Activity} />
          <MetricTile label="Ventilator" value={patient.ventilatorStatus} tone={patient.ventilatorStatus === "Room air" ? "success" : "warning"} icon={MonitorDot} />
          <MetricTile label="Urine" value={`${vitals[0]?.urineOutput ?? 45} ml/hr`} tone={(vitals[0]?.urineOutput ?? 45) < 30 ? "danger" : "success"} icon={Syringe} />
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
          {["Nurse Entry", "Medication", "Alerts", "Tasks", "Timeline"].map((item) => (
            <button
              className={cn("h-8 shrink-0 rounded px-3 text-xs font-medium transition", section === item ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              key={item}
              type="button"
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {section === "Nurse Entry" ? (
          <div className="space-y-4 rounded-md border border-border bg-background p-3">
            {[
              { label: "Pulse", key: "pulse" as const, max: 150, color: "bg-danger" },
              { label: "SpO2", key: "spo2" as const, max: 100, color: "bg-info" },
            ].map((metric) => (
              <div className="space-y-2" key={metric.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{metric.label}</span>
                  <span className="text-muted-foreground">Latest {trendRows.at(-1)?.[metric.key]}</span>
                </div>
                <div className="grid grid-cols-4 items-end gap-2">
                  {trendRows.slice(0, 4).map((row) => (
                    <div className="flex h-24 flex-col items-center justify-end gap-1" key={`${metric.key}-${row.id}`}>
                      <span className="text-[11px] text-muted-foreground">{row[metric.key]}</span>
                      <div className={`w-full rounded-t ${metric.color}`} style={{ height: `${Math.max(10, Math.min(100, (row[metric.key] / metric.max) * 100))}%` }} />
                      <span className="text-[11px] text-muted-foreground">{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {section === "Medication" ? <SimpleRows rows={meds.map((row) => [`${row.scheduledTime} ${row.medication}`, `${row.dose} | ${row.status}`])} empty="No medication rows." /> : null}
        {section === "Alerts" ? <SimpleRows rows={alerts.map((row) => [`${row.type} - ${row.severity}`, row.message])} empty="No alert rows." /> : null}
        {section === "Tasks" ? <SimpleRows rows={tasks.map((row) => [`${row.title}`, `${row.status} | ${row.dueTime}`])} empty="No task rows." /> : null}
        {section === "Timeline" ? (
          <SimpleRows
            rows={[
              [`Admission`, `${patient.admissionTime} from ${patient.admissionSource}`],
              ...vitals.map((row) => [`Vitals ${row.time}`, row.note]),
              ...fluids.map((row) => [`Infusion ${row.startTime}`, `${row.fluidName} ${row.status}`]),
              ...ioRows.map((row) => [`I/O ${row.time}`, `${row.intakeMl} ml in / ${row.outputMl} ml out`]),
            ]}
            empty="No timeline rows."
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function AdmissionCandidatePanel({ candidate, blockReason }: { candidate?: AdmissionPatientCandidate; blockReason: string }) {
  if (!candidate) return <EmptyPanel title="No patient selected" detail="Search and select patient/MRN to load ICU admission context." />;

  return (
    <div className="rounded-md border border-border bg-background p-3 md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{candidate.patientName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{candidate.mrn} | {candidate.ageGender} | {candidate.currentLocation}</p>
          <p className="mt-1 text-xs text-muted-foreground">{candidate.diagnosis}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={admissionPatientTone(candidate.patientStatus)}>{candidate.patientStatus}</Badge>
          <Badge tone={candidate.duplicateBlock ? "danger" : "success"}>{candidate.duplicateBlock ? "Duplicate blocked" : "Eligible"}</Badge>
        </div>
      </div>
      {blockReason ? (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs font-medium text-warning">{blockReason}</div>
      ) : (
        <div className="mt-3 rounded-md border border-success/30 bg-success/10 p-2 text-xs font-medium text-success">Patient can proceed after bed, doctor acceptance, and readiness checks.</div>
      )}
    </div>
  );
}

function AdmissionSourceScenarioPanel({ source }: { source: string }) {
  const scenario = getAdmissionScenario(source);

  return (
    <div className="grid gap-3 md:col-span-2 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-background p-3">
        <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">Readiness focus for this admission source.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {scenario.readinessFocus.map((item) => <Badge key={item} tone="info">{item}</Badge>)}
        </div>
      </div>
      <div className="rounded-md border border-border bg-background p-3">
        <p className="text-sm font-semibold text-foreground">Scenario risks</p>
        <div className="mt-3 space-y-2">
          {scenario.risks.map((risk) => (
            <div className="flex items-center gap-2 text-xs text-muted-foreground" key={risk}>
              <AlertCircle className="h-3.5 w-3.5 text-warning" />
              <span>{risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdmissionBedPanel({ bed }: { bed?: IcuAdmissionBedOption }) {
  if (!bed) return <EmptyPanel title="No ICU bed selected" detail="Select bed to verify availability and capability." />;

  return (
    <div className="rounded-md border border-border bg-background p-3 md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{bed.bedNo} | {bed.unit}</p>
          <p className="mt-1 text-xs text-muted-foreground">{bed.capability}</p>
          <p className="mt-1 text-xs text-muted-foreground">{bed.note}</p>
        </div>
        <Badge tone={admissionBedTone(bed.status)}>{bed.status}</Badge>
      </div>
    </div>
  );
}

function AdmissionReadinessChecklist({ selected, onToggle }: { selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 md:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">ICU receive readiness checklist</p>
          <p className="mt-1 text-xs text-muted-foreground">All checks must be complete before final admission.</p>
        </div>
        <Badge tone={selected.length === admissionReadinessItems.length ? "success" : "warning"}>{selected.length}/{admissionReadinessItems.length}</Badge>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {admissionReadinessItems.map((item) => {
          const checked = selected.includes(item);
          return (
            <label className={cn("flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm", checked ? "border-success/40 bg-success/10 text-success" : "border-border bg-surface-muted text-muted-foreground")} key={item}>
              <input checked={checked} className="h-4 w-4" type="checkbox" onChange={() => onToggle(item)} />
              <span>{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function AdmissionPatientSearchRows({
  rows,
  searchedText,
  selectedPatientId,
  onCreate,
  onSelect,
}: {
  rows: AdmissionPatientCandidate[];
  searchedText: string;
  selectedPatientId: string;
  onCreate: () => void;
  onSelect: (patientId: string) => void;
}) {
  if (!rows.length) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-surface p-4 text-sm md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-foreground">No matching patient found</p>
          <p className="mt-1 text-xs text-muted-foreground">{searchedText.trim()}</p>
        </div>
        <Button type="button" onClick={onCreate}>Create Emergency ICU Admission</Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background md:col-span-2">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2">
        <p className="text-xs font-semibold text-muted-foreground">{rows.length} match(es)</p>
        <Button type="button" variant="outline" onClick={onCreate}>Create Emergency ICU Admission</Button>
      </div>
      <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(160px,0.8fr)_120px] gap-3 border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Patient</span>
        <span>Location</span>
        <span>Status</span>
        <span className="text-right">Select</span>
      </div>
      <div className="max-h-72 overflow-auto">
        {rows.map((patient) => {
          const selected = patient.id === selectedPatientId;
          return (
            <button
              className={cn(
                "grid w-full grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(160px,0.8fr)_120px] gap-3 border-b border-border px-3 py-3 text-left text-sm last:border-b-0 hover:bg-primary/5",
                selected ? "bg-primary/5" : "bg-background",
              )}
              key={patient.id}
              type="button"
              onClick={() => onSelect(patient.id)}
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-foreground">{patient.patientName}</span>
                <span className="block truncate text-xs text-muted-foreground">{patient.mrn} | {patient.ageGender}</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">{patient.currentLocation}</span>
                <span className="block truncate text-xs text-muted-foreground">{patient.source}</span>
              </span>
              <span className="flex items-center">
                <StatusPill tone={admissionPatientTone(patient.patientStatus)}>{patient.patientStatus}</StatusPill>
              </span>
              <span className="flex justify-end">
                <span className={cn("rounded-md border px-3 py-1 text-xs font-semibold", selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}>
                  {selected ? "Selected" : "Select"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmergencyAdmissionCreatePanel({
  draft,
  onCancel,
  onChange,
  onCreate,
}: {
  draft: EmergencyAdmissionQuickDraft;
  onCancel: () => void;
  onChange: (key: keyof EmergencyAdmissionQuickDraft, value: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 md:col-span-2">
      <div className="mb-3 flex flex-col gap-2 border-b border-primary/20 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">Create Emergency ICU Admission</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={onCreate}>Create & Select</Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Patient name" value={draft.patientName} onChange={(value) => onChange("patientName", value)} placeholder="Patient name" />
        <TextField label="Age / sex" value={draft.ageGender} onChange={(value) => onChange("ageGender", value)} placeholder="45/M" />
        <TextField label="Mobile" value={draft.mobile} onChange={(value) => onChange("mobile", value)} placeholder="Mobile number" />
        <TextField label="Relative / attendant" value={draft.relativeName} onChange={(value) => onChange("relativeName", value)} placeholder="Relative name" />
        <TextAreaField half label="Diagnosis / reason" value={draft.diagnosis} onChange={(value) => onChange("diagnosis", value)} placeholder="Reason for direct ICU admission" />
        <TextAreaField half label="Allergy" value={draft.allergy} onChange={(value) => onChange("allergy", value)} placeholder="Known allergy or no known allergy" />
      </div>
    </div>
  );
}

function AdmissionReview({ draft, blockReason, bed }: { draft: AdmissionDraft; blockReason: string; bed?: IcuAdmissionBedOption }) {
  const readiness = getReadinessValues(draft.readiness);
  return (
    <div className="space-y-3">
      {blockReason ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 p-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-danger" />
            <div>
              <p className="text-sm font-semibold text-danger">Admission blocked</p>
              <p className="mt-1 text-xs text-danger">{blockReason}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-success/30 bg-success/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
            <div>
              <p className="text-sm font-semibold text-success">Ready for ICU admission</p>
              <p className="mt-1 text-xs text-success">Patient, status, bed, consultant, and receive checklist are complete.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <InfoPanel title="Patient" rows={[
          ["Patient", draft.patientName],
          ["MRN / UHID", draft.mrn],
          ["Age / gender", draft.ageGender],
          ["Location", draft.currentLocation],
          ["Status", draft.patientStatus],
        ]} />
        <InfoPanel title="Admission" rows={[
          ["ICU admission no", draft.icuAdmissionNo],
          ["Admission origin", draft.source],
          ["Source detail", draft.sourceDetail],
          ["Handover by", draft.handoverBy],
          ["Admitting consultant", draft.admittingConsultant],
        ]} />
        <InfoPanel title="Bed & device" rows={[
          ["Unit", draft.unit],
          ["Bed", draft.bedNo],
          ["Bed status", bed?.status ?? "-"],
          ["Admitting unit", draft.admittingTeam],
          ["Ventilator / oxygen", draft.ventilator],
          ["Devices", draft.devices],
        ]} />
        <InfoPanel title="Clinical" rows={[
          ["Diagnosis", draft.diagnosis],
          ["Clinical status", draft.condition],
          ["Patient status", draft.recoveryStatus],
          ["Pending investigations", draft.pendingInvestigations],
          ["Planned care / treatment", draft.plannedCareTreatment],
          ["Risk", draft.risk],
          ["Isolation", draft.isolation],
          ["Current medication", draft.currentMedication],
          ["Allergy", draft.allergy],
          ["High-alert medications", draft.highAlertMedications],
        ]} />
        <InfoPanel title="Medication history" rows={[
          ["Past medication", draft.pastMedication],
          ["Other information", draft.otherRelevantInformation],
          ["Procedures", draft.procedures],
        ]} />
        <InfoPanel title="Handover & nursing" rows={[
          ["Handed over", draft.handedOver],
          ["Taken over by", draft.takenOverBy],
          ["Signature / confirmation", draft.signatureConfirmation],
          ["Nursing notes", draft.nursingNotes],
        ]} />
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Receive checklist</p>
          <Badge tone={readiness.length === admissionReadinessItems.length ? "success" : "warning"}>{readiness.length}/{admissionReadinessItems.length}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {admissionReadinessItems.map((item) => <Badge key={item} tone={readiness.includes(item) ? "success" : "muted"}>{item}</Badge>)}
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, tone, icon: Icon }: { label: string; value: React.ReactNode; tone: StatusTone; icon: typeof Activity }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("rounded-md p-1.5", toneClass(tone))}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-2 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => <InfoLine key={label} label={label} value={value} />)}
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function SimpleRows({ rows, empty }: { rows: string[][]; empty: string }) {
  if (!rows.length) return <EmptyPanel title={empty} detail="No matching workflow data." />;
  return (
    <div className="space-y-2">
      {rows.map(([title, detail], index) => (
        <div className="rounded-md border border-border bg-background p-3" key={`${title}-${index}`}>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface-muted p-6 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function AdmissionFormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 shadow-sm">
      <div className="mb-3 border-b border-border pb-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <label className={cn("space-y-1 text-sm", wide ? "md:col-span-2" : "")}>
      <span className="font-medium text-foreground">{label}</span>
      <Input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="flex h-10 w-full items-center rounded-md border border-input bg-surface-muted px-3 text-sm font-semibold text-foreground">
        {value || "-"}
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  half,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  half?: boolean;
}) {
  return (
    <label className={cn("space-y-1 text-sm", half ? "" : "md:col-span-2")}>
      <span className="font-medium text-foreground">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  renderOption,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  renderOption?: (value: string) => string;
  wide?: boolean;
}) {
  return (
    <label className={cn("min-w-0 space-y-1 text-sm", wide ? "md:col-span-2" : "")}>
      <span className="font-medium text-foreground">{label}</span>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{renderOption ? renderOption(option) : option}</option>
        ))}
      </select>
    </label>
  );
}

function toneClass(tone: StatusTone) {
  if (tone === "success") return "bg-success/10 text-success";
  if (tone === "warning") return "bg-warning/10 text-warning";
  if (tone === "danger") return "bg-danger/10 text-danger";
  if (tone === "critical") return "bg-critical/10 text-critical";
  if (tone === "info") return "bg-info/10 text-info";
  return "bg-muted text-muted-foreground";
}

function toneDotClass(tone: StatusTone) {
  if (tone === "success") return "bg-success";
  if (tone === "warning") return "bg-warning";
  if (tone === "danger") return "bg-danger";
  if (tone === "critical") return "bg-critical";
  if (tone === "info") return "bg-info";
  return "bg-muted-foreground";
}

function getPatientMedicationProfile(patientId: string) {
  return patientMedicationProfiles.find((profile) => profile.patientId === patientId) ?? {
    patientId,
    weightKg: 70,
    allergies: [],
    renalStatus: "Normal",
    liverStatus: "Normal",
    feedingStatus: "Oral allowed",
    ageGroup: "Adult",
  } satisfies PatientMedicationProfile;
}

function getSelectedFormularyMedicine(draft: MedicationOrderDraft) {
  const normalizedMedicine = draft.medication.trim().toLowerCase();
  return pharmacyFormulary.find((medicine) => medicine.id === draft.formularyId)
    ?? pharmacyFormulary.find((medicine) => medicine.name.toLowerCase() === normalizedMedicine || medicine.genericName.toLowerCase() === normalizedMedicine);
}

function getFormularyMedicineForOrder(order: DoctorMedicationOrder) {
  const normalizedMedicine = order.medication.trim().toLowerCase();
  return pharmacyFormulary.find((medicine) => medicine.id === order.formularyId)
    ?? pharmacyFormulary.find((medicine) => medicine.name.toLowerCase() === normalizedMedicine || medicine.genericName.toLowerCase() === normalizedMedicine);
}

function getFormularySearchResults(department: MedicationDepartment, query: string, availableOnly: boolean) {
  const normalizedQuery = query.trim().toLowerCase();
  return pharmacyFormulary.filter((medicine) => {
    const searchable = `${medicine.name} ${medicine.genericName} ${medicine.indication} ${medicine.safetyFlags.join(" ")} ${medicine.alternatives.join(" ")}`.toLowerCase();
    const matchesDepartment = medicine.departments.includes(department);
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesAvailability = !availableOnly || medicine.availability !== "Out of stock";
    return matchesDepartment && matchesQuery && matchesAvailability;
  });
}

function pharmacyStatusFromAvailability(availability: FormularyAvailability): PharmacyStatus {
  if (availability === "Low stock") return "Low stock";
  if (availability === "Out of stock") return "Out of stock";
  if (availability === "Restricted") return "Restricted";
  return "Available";
}

function getDoctorOrderScenarios(draft: MedicationOrderDraft, orders: DoctorMedicationOrder[]): MedicationScenario[] {
  const scenarios: MedicationScenario[] = [];
  const selectedMedicine = getSelectedFormularyMedicine(draft);
  const patient = icuPatients.find((item) => item.id === draft.patientId);
  const profile = getPatientMedicationProfile(draft.patientId);
  const activeDuplicate = orders.find((order) => {
    return order.patientId === draft.patientId
      && order.status === "Active"
      && draft.medication.trim()
      && order.medication.toLowerCase() === draft.medication.trim().toLowerCase();
  });

  scenarios.push({
    id: "patient-context",
    title: patient ? `${patient.bedNo} patient context loaded` : "Patient context missing",
    detail: patient ? `${patient.patientName}, ${profile.weightKg} kg, ${profile.renalStatus} renal status, ${profile.feedingStatus}.` : "Select patient before prescribing.",
    tone: patient ? "info" : "danger",
    blocking: !patient,
  });

  if (!selectedMedicine) {
    scenarios.push({
      id: "formulary-required",
      title: "Select medicine from pharmacy formulary",
      detail: "Doctor order should come from department formulary so stock, restriction, and alternatives can be checked.",
      tone: "danger",
      blocking: true,
    });
    return scenarios;
  }

  scenarios.push({
    id: "pharmacy-stock",
    title: `${selectedMedicine.availability} in ${selectedMedicine.pharmacyLocation}`,
    detail: `${selectedMedicine.stockQty} ${selectedMedicine.stockUnit} available. Alternatives: ${selectedMedicine.alternatives.join(", ") || "Not listed"}.`,
    tone: formularyAvailabilityTone(selectedMedicine.availability),
    blocking: selectedMedicine.availability === "Out of stock",
  });

  if (selectedMedicine.departments.includes(draft.department)) {
    scenarios.push({
      id: "department-match",
      title: `${draft.department} formulary match`,
      detail: `${selectedMedicine.name} is mapped to ${selectedMedicine.departments.join(", ")}.`,
      tone: "success",
    });
  } else {
    scenarios.push({
      id: "department-mismatch",
      title: "Department mismatch",
      detail: `${selectedMedicine.name} is not mapped to ${draft.department}. Select another department or medicine.`,
      tone: "danger",
      blocking: true,
    });
  }

  const allergyMatch = profile.allergies.find((allergy) => {
    const allergyText = allergy.toLowerCase();
    return selectedMedicine.name.toLowerCase().includes(allergyText)
      || selectedMedicine.genericName.toLowerCase().includes(allergyText)
      || selectedMedicine.alternatives.some((alternative) => alternative.toLowerCase().includes(allergyText));
  });
  if (allergyMatch) {
    scenarios.push({
      id: "allergy-block",
      title: `Allergy conflict: ${allergyMatch}`,
      detail: "Order is blocked until allergy is reviewed and a safer alternative is selected.",
      tone: "critical",
      blocking: true,
    });
  } else {
    scenarios.push({
      id: "allergy-clear",
      title: "No recorded allergy conflict",
      detail: profile.allergies.length ? `Recorded allergies checked: ${profile.allergies.join(", ")}.` : "No allergy recorded for this patient.",
      tone: "success",
    });
  }

  if (activeDuplicate) {
    scenarios.push({
      id: "duplicate-order",
      title: "Duplicate active medication",
      detail: `${activeDuplicate.medication} is already active for this patient. Modify/hold existing order before adding another exact order.`,
      tone: "danger",
      blocking: true,
    });
  }

  if (selectedMedicine.highRisk || draft.highRisk) {
    scenarios.push({
      id: "high-alert",
      title: "High-alert medicine",
      detail: "Double verification and nursing safety check will be required before administration.",
      tone: "critical",
    });
  }

  if (selectedMedicine.restricted) {
    const restrictedReady = Boolean(draft.indication.trim() && draft.approvalReason.trim() && draft.reviewDate);
    scenarios.push({
      id: "restricted-med",
      title: "Restricted medicine",
      detail: restrictedReady
        ? `Approval reason and review date ${draft.reviewDate} captured.`
        : "Indication, approval reason, and review date are required for stewardship/audit.",
      tone: restrictedReady ? "success" : "danger",
      blocking: !restrictedReady,
    });
  }

  if (!draft.startDate) {
    scenarios.push({
      id: "start-date",
      title: "Start date required",
      detail: "Select when this prescription becomes clinically active.",
      tone: "danger",
      blocking: true,
    });
  }

  if (draft.orderType === "Scheduled" && (!draft.scheduleTimes.trim() || !draft.duration.trim())) {
    scenarios.push({
      id: "scheduled-plan",
      title: "Scheduled plan incomplete",
      detail: "Scheduled orders require administration times and planned duration or review point.",
      tone: "danger",
      blocking: true,
    });
  }

  if (draft.orderType === "PRN" && (!draft.indication.trim() || !draft.minInterval.trim() || !draft.maxDailyDose.trim())) {
    scenarios.push({
      id: "prn-indication",
      title: "PRN limits incomplete",
      detail: "PRN orders require a trigger/indication, minimum interval, and maximum daily dose.",
      tone: "danger",
      blocking: true,
    });
  }

  if (draft.orderType === "Continuous") {
    const infusionReady = Boolean(draft.titrationTarget.trim() && draft.minRate.trim() && draft.maxRate.trim() && draft.monitoringFrequency.trim());
    scenarios.push({
      id: "infusion-protocol",
      title: "Continuous infusion protocol",
      detail: infusionReady
        ? `${draft.titrationTarget}; range ${draft.minRate} to ${draft.maxRate}; monitor ${draft.monitoringFrequency}.`
        : "Capture titration target, starting/minimum rate, maximum rate, and monitoring frequency.",
      tone: infusionReady ? "success" : "danger",
      blocking: !infusionReady,
    });
  }

  if ((draft.orderType === "STAT" || draft.orderType === "One-time") && !draft.startTime.trim()) {
    scenarios.push({
      id: "single-dose-time",
      title: "Administration deadline required",
      detail: `${draft.orderType} orders require an exact administration time or Now instruction.`,
      tone: "danger",
      blocking: true,
    });
  }

  if ((selectedMedicine.highRisk || draft.highRisk) && !draft.doubleVerificationRequired) {
    scenarios.push({
      id: "double-verification",
      title: "Double verification required",
      detail: "High-risk medicine cannot be signed without independent nurse verification.",
      tone: "danger",
      blocking: true,
    });
  }

  if (profile.renalStatus !== "Normal" && selectedMedicine.renalDoseNote) {
    scenarios.push({
      id: "renal-dose",
      title: "Renal dose review",
      detail: selectedMedicine.renalDoseNote,
      tone: "warning",
    });
  }

  if (profile.ageGroup === "Pediatric" && selectedMedicine.pediatricDoseNote) {
    scenarios.push({
      id: "pediatric-dose",
      title: "Pediatric dose check",
      detail: selectedMedicine.pediatricDoseNote,
      tone: "warning",
    });
  }

  if (profile.feedingStatus === "NPO" && draft.route === "Oral/NG") {
    scenarios.push({
      id: "npo-route",
      title: "Route warning",
      detail: selectedMedicine.npoWarning ?? "Patient is NPO; consider IV route or document why oral/NG is acceptable.",
      tone: "warning",
    });
  }

  return scenarios;
}

function formularyAvailabilityTone(availability: FormularyAvailability): StatusTone {
  if (availability === "Available") return "success";
  if (availability === "Low stock" || availability === "Restricted") return "warning";
  return "danger";
}

function parseMedicationSchedule(value: string, orderType: MedicationOrderType) {
  const parsed = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (parsed.length) return parsed;
  if (orderType === "Continuous") return ["Running"];
  if (orderType === "PRN") return ["PRN"];
  if (orderType === "STAT") return ["Now"];
  return ["08:00"];
}

function medicationDoseMatchesEmarQueue(dose: MedicationDoseRow, queue: MedicationEmarQueue) {
  if (queue === "Due Now") {
    return isMedicationDueStatus(dose.status)
      || dose.orderType === "STAT"
      || dose.doubleVerification === "Pending"
      || dose.pharmacyStatus !== "Available";
  }
  if (queue === "Administered") return dose.status === "Administered";
  if (queue === "Held / Skipped") return ["Held", "Skipped", "Missed", "Refused"].includes(dose.status);
  if (queue === "Infusions") return dose.orderType === "Continuous" || dose.status === "Running" || ["Paused", "Stopped"].includes(dose.status);
  if (queue === "PRN") return dose.orderType === "PRN";
  return ["Administered", "Held", "Skipped", "Missed", "Refused", "Paused", "Stopped"].includes(dose.status);
}

function isMedicationDueStatus(status: WorkflowMedicationStatus) {
  return ["Due", "Late", "Missed"].includes(status);
}

function isPriorityMedicationDose(dose: MedicationDoseRow) {
  return isMedicationDueStatus(dose.status)
    || dose.orderType === "STAT"
    || dose.status === "Running"
    || dose.highRisk
    || dose.pharmacyStatus !== "Available"
    || dose.doubleVerification === "Pending";
}

function medicationStatusTone(status: WorkflowMedicationStatus): StatusTone {
  if (status === "Missed") return "critical";
  if (status === "Late" || status === "Refused" || status === "Stopped") return "danger";
  if (status === "Due" || status === "Held" || status === "Skipped" || status === "Paused") return "warning";
  if (status === "Administered" || status === "Running") return "success";
  return "info";
}

function orderTypeTone(orderType: MedicationOrderType): StatusTone {
  if (orderType === "STAT") return "critical";
  if (orderType === "Continuous") return "warning";
  if (orderType === "PRN") return "info";
  return "success";
}

function pharmacyStatusTone(status: PharmacyStatus): StatusTone {
  if (status === "Available") return "success";
  if (status === "Shortage" || status === "Out of stock") return "danger";
  if (status === "Substitution requested" || status === "Low stock" || status === "Restricted") return "warning";
  return "info";
}

function medicationOrderStatusTone(status: MedicationOrderStatus): StatusTone {
  if (status === "Active") return "success";
  if (status === "Draft") return "info";
  if (status === "Held by doctor") return "warning";
  return "danger";
}

function alertStatusTone(status: WorkflowAlertStatus): StatusTone {
  if (status === "New") return "critical";
  if (status === "Acknowledged" || status === "Assigned") return "warning";
  if (status === "Resolved" || status === "Closed") return "success";
  return "info";
}
