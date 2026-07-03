import type { StatusTone } from "@/types";

export type DischargeStatus =
  | "Not planned"
  | "Planned"
  | "Checklist in progress"
  | "Ready for clearance"
  | "Billing pending"
  | "Summary pending"
  | "Discharged"
  | "On hold";

export type DischargeChecklistStatus = "Done" | "Pending" | "Blocked" | "Not required";
export type DischargeChecklistCategory = "Clinical" | "Medication" | "Diagnostics" | "Nursing" | "Billing" | "Summary";
export type DischargeMedicationStatus = "Continue" | "Stop" | "New" | "Changed" | "Hold";
export type DischargeAuditSeverity = "Info" | "Warning" | "Critical";

export type DischargePatientPlan = {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  uhid: string;
  ageGender: string;
  address: string;
  contactNumber: string;
  bed: string;
  ward: string;
  consultant: string;
  admittingConsultant: string;
  department: string;
  specialty: string;
  diagnosis: string;
  dischargeType: "Routine" | "LAMA" | "Transfer" | "Deceased" | "Against advice" | "Day care";
  finalDischargeStatus: "Alive" | "Death";
  status: DischargeStatus;
  admissionDateTime: string;
  dischargeDateTime: string;
  dischargePlannedAt: string;
  expectedDeparture: string;
  orderLock: "Active" | "Not active";
  payer: "Self" | "Insurance" | "TPA" | "Corporate";
  billingStatus: "Pending" | "Cleared" | "Query raised";
  pharmacyStatus: "Pending reconciliation" | "Reconciled" | "Clarification required";
  summaryStatus: "Draft" | "Ready for signature" | "Signed" | "Pending";
  nurseClearance: "Pending" | "Done" | "Education due";
  destination: "Home" | "Another hospital" | "Rehabilitation" | "Expired body handover";
  riskFlags: string[];
  vitals: {
    bp: string;
    pulse: string;
    spo2: string;
    temp: string;
    recordedAt: string;
  };
  clinicalSummary: {
    chiefComplaints: string;
    complaintDuration: string;
    hpi: string;
    briefClinicalHistory: string;
    pastHistory: string;
    medicalHistory: string;
    socialHistory: string;
    allergicHistory: string;
    primaryDiagnosis: string;
    secondaryDiagnosis: string;
    procedure: string;
    clinicalFindings: string[];
    treatmentProvided: string;
    conditionAtDischarge: string[];
  };
  instructions: {
    dischargeNote: string;
    patientInstructions: string;
    diet: string;
    activity: string;
    woundCare: string;
    lifestyle: string;
    warningSigns: string;
  };
  followUp: {
    physician: string;
    department: string;
    date: string;
    time: string;
    mode: "OPD" | "Teleconsultation" | "Emergency return";
  };
  consultantSignature: {
    name: string;
    registrationNumber: string;
    date: string;
  };
};

export type DischargeChecklistItem = {
  id: string;
  planId: string;
  category: DischargeChecklistCategory;
  label: string;
  source: string;
  ownerRole: "Doctor" | "Nurse" | "Pharmacist" | "Billing Executive" | "Lab Technician" | "Radiologist";
  status: DischargeChecklistStatus;
  blocker?: string;
  updatedBy: string;
  updatedAt: string;
};

export type DischargeMedication = {
  id: string;
  planId: string;
  medicine: string;
  source: "MAR" | "Home medication" | "New prescription";
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  status: DischargeMedicationStatus;
  dischargeMedication: boolean;
  instructions: string;
  alert?: string;
};

export type DischargeAuditEvent = {
  id: string;
  planId: string;
  at: string;
  by: string;
  role: string;
  event: string;
  severity: DischargeAuditSeverity;
  note: string;
};

export const dischargeStatusOptions: DischargeStatus[] = [
  "Not planned",
  "Planned",
  "Checklist in progress",
  "Ready for clearance",
  "Billing pending",
  "Summary pending",
  "Discharged",
  "On hold",
];

export const dischargeTemplateOptions = [
  "Routine discharge",
  "Post procedure discharge",
  "Asthma discharge",
  "Renal follow-up discharge",
  "LAMA discharge",
  "Transfer discharge",
];

export const mockDischargePlans: DischargePatientPlan[] = [
  {
    id: "disc-plan-001",
    admissionId: "adm-004",
    patientId: "pat-003",
    patientName: "Aisha Khan",
    uhid: "PLH-240221",
    ageGender: "12 / Female",
    address: "Flat 304, Green Park Society, Pune",
    contactNumber: "+91 98765 24021",
    bed: "PW-014",
    ward: "Pediatric Ward",
    consultant: "Dr. Neha Malik",
    admittingConsultant: "Dr. Neha Malik",
    department: "Pediatrics",
    specialty: "Pediatric respiratory care",
    diagnosis: "Acute asthma observation",
    dischargeType: "Routine",
    finalDischargeStatus: "Alive",
    status: "Checklist in progress",
    admissionDateTime: "27 May 2026, 06:45 PM",
    dischargeDateTime: "28 May 2026, 04:00 PM",
    dischargePlannedAt: "28 May 2026, 10:30 AM",
    expectedDeparture: "28 May 2026, 04:00 PM",
    orderLock: "Active",
    payer: "Self",
    billingStatus: "Pending",
    pharmacyStatus: "Pending reconciliation",
    summaryStatus: "Draft",
    nurseClearance: "Education due",
    destination: "Home",
    riskFlags: ["Minor guardian consent", "Asthma action plan"],
    vitals: { bp: "104/68", pulse: "92/min", spo2: "98%", temp: "36.8 C", recordedAt: "Today 09:45" },
    clinicalSummary: {
      chiefComplaints: "Wheeze, cough, and shortness of breath.",
      complaintDuration: "1 day, worsened over 6 hours before admission.",
      hpi: "Admitted for wheeze and shortness of breath observation after OPD review.",
      briefClinicalHistory: "Child presented with acute wheeze after seasonal exposure and required nebulization observation.",
      pastHistory: "Known episodic wheeze with seasonal allergic rhinitis.",
      medicalHistory: "No major surgery. No known drug allergy documented.",
      socialHistory: "Lives with parents. No household smoking exposure reported.",
      allergicHistory: "Seasonal allergy history present. No known drug allergy documented.",
      primaryDiagnosis: "Bronchial asthma with acute exacerbation, improving",
      secondaryDiagnosis: "Seasonal allergic rhinitis",
      procedure: "Nebulization and observation, no invasive procedure",
      clinicalFindings: ["Bilateral mild wheeze improved after nebulization; no respiratory distress at discharge review."],
      treatmentProvided: "Nebulization, inhaler education, spacer technique counselling, and observation vitals monitoring.",
      conditionAtDischarge: ["Hemodynamically stable", "Afebrile/stable symptoms", "Ambulatory"],
    },
    instructions: {
      dischargeNote: "Clinically stable for discharge after medication reconciliation, guardian counselling, and final billing clearance.",
      patientInstructions: "Continue inhaler as advised. Use spacer. Return immediately if breathing difficulty, bluish lips, drowsiness, or poor oral intake occurs.",
      diet: "Regular age-appropriate diet. Maintain hydration.",
      activity: "Avoid exertion for 48 hours. Resume school after pediatric review if asymptomatic.",
      woundCare: "Not applicable.",
      lifestyle: "Avoid smoke, dust exposure, and known asthma triggers. Keep rescue inhaler available.",
      warningSigns: "Breathlessness at rest, persistent wheeze, SpO2 below advised threshold, fever, poor response to inhaler.",
    },
    followUp: { physician: "Dr. Neha Malik", department: "Pediatrics", date: "31 May 2026", time: "11:30 AM", mode: "OPD" },
    consultantSignature: { name: "Dr. Neha Malik", registrationNumber: "MMC-PAED-20451", date: "28 May 2026" },
  },
  {
    id: "disc-plan-002",
    admissionId: "adm-003",
    patientId: "pat-002",
    patientName: "Arjun Kapoor",
    uhid: "PLH-240076",
    ageGender: "58 / Male",
    address: "B-17, Kalyani Nagar, Pune",
    contactNumber: "+91 98765 40076",
    bed: "OW-204",
    ward: "Ortho Ward",
    consultant: "Dr. Aman Verma",
    admittingConsultant: "Dr. Aman Verma",
    department: "Orthopedics",
    specialty: "Orthopedic trauma",
    diagnosis: "Post fracture stabilization",
    dischargeType: "Routine",
    finalDischargeStatus: "Alive",
    status: "Ready for clearance",
    admissionDateTime: "27 May 2026, 01:10 PM",
    dischargeDateTime: "29 May 2026, 10:00 AM",
    dischargePlannedAt: "28 May 2026, 11:00 AM",
    expectedDeparture: "29 May 2026, 10:00 AM",
    orderLock: "Active",
    payer: "Insurance",
    billingStatus: "Query raised",
    pharmacyStatus: "Reconciled",
    summaryStatus: "Ready for signature",
    nurseClearance: "Done",
    destination: "Home",
    riskFlags: ["Outstanding balance", "Physiotherapy follow-up"],
    vitals: { bp: "132/82", pulse: "84/min", spo2: "97%", temp: "37.0 C", recordedAt: "Today 10:10" },
    clinicalSummary: {
      chiefComplaints: "Pain and swelling in forearm after fall.",
      complaintDuration: "Same day presentation, approximately 3 hours before admission.",
      hpi: "Admitted following orthopedic trauma stabilization and pain management.",
      briefClinicalHistory: "Patient presented after fall with suspected forearm fracture and was admitted for reduction, immobilization, pain control, and neurovascular observation.",
      pastHistory: "Known hypertension on treatment.",
      medicalHistory: "No diabetes. No known drug allergy recorded.",
      socialHistory: "Independent daily activity before admission. No alcohol or smoking risk documented in this record.",
      allergicHistory: "No known drug allergy recorded.",
      primaryDiagnosis: "Closed fracture, post stabilization",
      secondaryDiagnosis: "Hypertension under treatment",
      procedure: "Closed reduction and immobilization",
      clinicalFindings: ["Cast intact, distal pulse palpable, finger movement and sensation preserved."],
      treatmentProvided: "Analgesics, limb elevation, closed reduction, immobilization, physiotherapy and device handover education.",
      conditionAtDischarge: ["Hemodynamically stable", "Afebrile/stable symptoms", "Ambulatory with support"],
    },
    instructions: {
      dischargeNote: "Discharge after insurance query closure and doctor signature.",
      patientInstructions: "Keep limb elevated. Do not wet cast. Take analgesics after food. Report numbness, severe swelling, or uncontrolled pain.",
      diet: "High-protein diet with adequate fluids unless restricted.",
      activity: "Non-weight-bearing mobilization with walker until ortho review.",
      woundCare: "Keep cast/dressing dry. Do not insert objects inside cast. Return if cast becomes tight or wet.",
      lifestyle: "Fall-prevention measures at home, assisted walking, and blood pressure medicine compliance.",
      warningSigns: "Increasing pain, finger discoloration, fever, cast tightness, chest pain, or breathlessness.",
    },
    followUp: { physician: "Dr. Aman Verma", department: "Orthopedics", date: "03 Jun 2026", time: "09:15 AM", mode: "OPD" },
    consultantSignature: { name: "Dr. Aman Verma", registrationNumber: "MMC-ORTH-11782", date: "29 May 2026" },
  },
  {
    id: "disc-plan-003",
    admissionId: "adm-009",
    patientId: "pat-004",
    patientName: "Unknown Emergency",
    uhid: "TMP-ER-0098",
    ageGender: "35 / Unknown",
    address: "Identity pending",
    contactNumber: "Attendant contact pending",
    bed: "ICU-01",
    ward: "ICU",
    consultant: "Emergency Team",
    admittingConsultant: "Emergency Team",
    department: "Emergency",
    specialty: "Emergency stabilization",
    diagnosis: "Observation after emergency stabilization",
    dischargeType: "Transfer",
    finalDischargeStatus: "Alive",
    status: "On hold",
    admissionDateTime: "28 May 2026, 09:58 AM",
    dischargeDateTime: "Pending receiving facility acceptance",
    dischargePlannedAt: "Pending",
    expectedDeparture: "Pending",
    orderLock: "Not active",
    payer: "Self",
    billingStatus: "Pending",
    pharmacyStatus: "Clarification required",
    summaryStatus: "Pending",
    nurseClearance: "Pending",
    destination: "Another hospital",
    riskFlags: ["Identity pending", "Transfer documents pending"],
    vitals: { bp: "118/76", pulse: "96/min", spo2: "96%", temp: "37.1 C", recordedAt: "Today 10:55" },
    clinicalSummary: {
      chiefComplaints: "Emergency presentation with incomplete history.",
      complaintDuration: "Unknown duration at arrival.",
      hpi: "Unknown emergency patient stabilized and kept under observation.",
      briefClinicalHistory: "Patient brought to emergency with incomplete identity details, stabilized, and planned for monitored referral after documentation completion.",
      pastHistory: "Not available at admission.",
      medicalHistory: "Medication and allergy history pending confirmation.",
      socialHistory: "Not available due to emergency presentation and identity pending.",
      allergicHistory: "Allergy history pending confirmation.",
      primaryDiagnosis: "Post emergency stabilization",
      secondaryDiagnosis: "Identity unknown",
      procedure: "Emergency stabilization and monitoring",
      clinicalFindings: ["Airway patent, vitals stable after emergency stabilization, ongoing observation advised."],
      treatmentProvided: "Primary survey, IV access, monitoring, supportive therapy, and transfer-readiness review.",
      conditionAtDischarge: ["Hemodynamically stable", "Afebrile/stable symptoms", "Stretcher transfer"],
    },
    instructions: {
      dischargeNote: "Transfer discharge cannot proceed until identity, consent, and transfer summary are completed.",
      patientInstructions: "Transfer handover instructions pending receiving facility confirmation.",
      diet: "As per receiving facility.",
      activity: "Stretcher transfer with nursing handover.",
      woundCare: "Maintain IV site and monitoring leads as per transfer protocol.",
      lifestyle: "Not applicable during emergency transfer.",
      warningSigns: "Deterioration during transfer, fall risk, altered sensorium.",
    },
    followUp: { physician: "Emergency Team", department: "Emergency", date: "Pending", time: "Pending", mode: "Emergency return" },
    consultantSignature: { name: "Emergency Team", registrationNumber: "ER-TEAM-ON-DUTY", date: "Pending" },
  },
];

export const mockDischargeChecklist: DischargeChecklistItem[] = [
  { id: "dc-c-001", planId: "disc-plan-001", category: "Medication", label: "Medication reconciliation completed", source: "MAR", ownerRole: "Pharmacist", status: "Pending", updatedBy: "Pharmacy", updatedAt: "Today 10:05" },
  { id: "dc-c-002", planId: "disc-plan-001", category: "Diagnostics", label: "Lab reports reviewed", source: "Lab results", ownerRole: "Doctor", status: "Done", updatedBy: "Dr. Neha Malik", updatedAt: "Today 09:50" },
  { id: "dc-c-003", planId: "disc-plan-001", category: "Diagnostics", label: "Radiology reports reviewed", source: "Radiology", ownerRole: "Doctor", status: "Not required", updatedBy: "Dr. Neha Malik", updatedAt: "Today 09:52" },
  { id: "dc-c-004", planId: "disc-plan-001", category: "Clinical", label: "Clinical notes and care plan closed", source: "Progress notes", ownerRole: "Doctor", status: "Done", updatedBy: "Dr. Neha Malik", updatedAt: "Today 09:58" },
  { id: "dc-c-005", planId: "disc-plan-001", category: "Nursing", label: "LDA/LDT and devices checked", source: "Nursing flowsheet", ownerRole: "Nurse", status: "Done", updatedBy: "Ward Nurse", updatedAt: "Today 10:12" },
  { id: "dc-c-006", planId: "disc-plan-001", category: "Nursing", label: "Patient education and guardian counselling", source: "Education note", ownerRole: "Nurse", status: "Pending", updatedBy: "Ward Nurse", updatedAt: "Today 10:15" },
  { id: "dc-c-007", planId: "disc-plan-001", category: "Billing", label: "Final bill and payment clearance", source: "Billing", ownerRole: "Billing Executive", status: "Pending", updatedBy: "Billing desk", updatedAt: "Today 10:18" },
  { id: "dc-c-008", planId: "disc-plan-001", category: "Summary", label: "Discharge summary generated and signed", source: "Discharge summary", ownerRole: "Doctor", status: "Pending", updatedBy: "Doctor desk", updatedAt: "Today 10:20" },
  { id: "dc-c-009", planId: "disc-plan-002", category: "Medication", label: "Medication reconciliation completed", source: "MAR", ownerRole: "Pharmacist", status: "Done", updatedBy: "Pharmacy", updatedAt: "Today 09:35" },
  { id: "dc-c-010", planId: "disc-plan-002", category: "Diagnostics", label: "Lab reports reviewed", source: "Lab results", ownerRole: "Doctor", status: "Done", updatedBy: "Dr. Aman Verma", updatedAt: "Today 09:40" },
  { id: "dc-c-011", planId: "disc-plan-002", category: "Diagnostics", label: "Radiology reports reviewed", source: "Radiology", ownerRole: "Doctor", status: "Done", updatedBy: "Dr. Aman Verma", updatedAt: "Today 09:42" },
  { id: "dc-c-012", planId: "disc-plan-002", category: "Clinical", label: "Procedure notes completed", source: "Procedure note", ownerRole: "Doctor", status: "Done", updatedBy: "Dr. Aman Verma", updatedAt: "Today 09:45" },
  { id: "dc-c-013", planId: "disc-plan-002", category: "Nursing", label: "Mobility education and device handover", source: "Nursing note", ownerRole: "Nurse", status: "Done", updatedBy: "Ortho Nurse", updatedAt: "Today 10:00" },
  { id: "dc-c-014", planId: "disc-plan-002", category: "Billing", label: "Insurance query resolved", source: "Billing", ownerRole: "Billing Executive", status: "Blocked", blocker: "TPA approval pending for implant item.", updatedBy: "Billing desk", updatedAt: "Today 10:22" },
  { id: "dc-c-015", planId: "disc-plan-002", category: "Summary", label: "Discharge summary generated and signed", source: "Discharge summary", ownerRole: "Doctor", status: "Pending", updatedBy: "Doctor desk", updatedAt: "Today 10:25" },
  { id: "dc-c-016", planId: "disc-plan-003", category: "Clinical", label: "Transfer note completed", source: "Progress notes", ownerRole: "Doctor", status: "Blocked", blocker: "Receiving facility not confirmed.", updatedBy: "Emergency Team", updatedAt: "Today 10:40" },
  { id: "dc-c-017", planId: "disc-plan-003", category: "Nursing", label: "Identity and consent confirmation", source: "Registration", ownerRole: "Nurse", status: "Blocked", blocker: "Identity pending.", updatedBy: "ER Nurse", updatedAt: "Today 10:45" },
  { id: "dc-c-018", planId: "disc-plan-003", category: "Billing", label: "Emergency bill clearance", source: "Billing", ownerRole: "Billing Executive", status: "Pending", updatedBy: "Billing desk", updatedAt: "Today 10:48" },
];

export const mockDischargeMedications: DischargeMedication[] = [
  { id: "dc-m-001", planId: "disc-plan-001", medicine: "Salbutamol inhaler", source: "New prescription", dose: "2 puffs", route: "Inhalation", frequency: "SOS", duration: "7 days", status: "New", dischargeMedication: true, instructions: "Use with spacer during wheeze." },
  { id: "dc-m-002", planId: "disc-plan-001", medicine: "Levocetirizine", source: "MAR", dose: "5 mg", route: "Oral", frequency: "Night", duration: "5 days", status: "Continue", dischargeMedication: true, instructions: "Take after dinner." },
  { id: "dc-m-003", planId: "disc-plan-001", medicine: "Nebulization salbutamol", source: "MAR", dose: "2.5 mg", route: "Nebulization", frequency: "Q6H", duration: "Stop", status: "Stop", dischargeMedication: false, instructions: "Stopped at discharge." },
  { id: "dc-m-004", planId: "disc-plan-002", medicine: "Paracetamol", source: "MAR", dose: "650 mg", route: "Oral", frequency: "TDS", duration: "3 days", status: "Continue", dischargeMedication: true, instructions: "Take after food." },
  { id: "dc-m-005", planId: "disc-plan-002", medicine: "Pantoprazole", source: "MAR", dose: "40 mg", route: "Oral", frequency: "OD", duration: "5 days", status: "Continue", dischargeMedication: true, instructions: "Morning before food." },
  { id: "dc-m-006", planId: "disc-plan-002", medicine: "Amlodipine", source: "Home medication", dose: "5 mg", route: "Oral", frequency: "OD", duration: "Continue", status: "Continue", dischargeMedication: true, instructions: "Continue home blood pressure medicine.", alert: "Home medication verified." },
  { id: "dc-m-007", planId: "disc-plan-003", medicine: "IV fluids", source: "MAR", dose: "As ordered", route: "IV", frequency: "Continuous", duration: "Transfer dependent", status: "Hold", dischargeMedication: false, instructions: "Reassess before transfer.", alert: "Clarification required." },
];

export const mockDischargeAudit: DischargeAuditEvent[] = [
  { id: "dc-a-001", planId: "disc-plan-001", at: "Today 09:30", by: "Dr. Neha Malik", role: "Doctor", event: "Plan for discharge activated", severity: "Info", note: "Further routine orders locked for this admission." },
  { id: "dc-a-002", planId: "disc-plan-001", at: "Today 09:52", by: "Dr. Neha Malik", role: "Doctor", event: "Diagnostics reviewed", severity: "Info", note: "Lab reports clear for discharge." },
  { id: "dc-a-003", planId: "disc-plan-001", at: "Today 10:18", by: "Billing desk", role: "Billing Executive", event: "Billing pending", severity: "Warning", note: "Final bill preparation in progress." },
  { id: "dc-a-004", planId: "disc-plan-002", at: "Today 09:20", by: "Dr. Aman Verma", role: "Doctor", event: "Discharge summary drafted", severity: "Info", note: "Awaiting final signature after billing query." },
  { id: "dc-a-005", planId: "disc-plan-002", at: "Today 10:22", by: "Billing desk", role: "Billing Executive", event: "Insurance query raised", severity: "Warning", note: "TPA approval pending for implant item." },
  { id: "dc-a-006", planId: "disc-plan-003", at: "Today 10:40", by: "Emergency Team", role: "Doctor", event: "Transfer discharge blocked", severity: "Critical", note: "Receiving facility confirmation missing." },
];

export function getDischargeTone(status: DischargeStatus | DischargeChecklistStatus | string): StatusTone {
  if (["Discharged", "Done", "Cleared", "Signed", "Reconciled", "Ready for clearance", "Alive"].includes(status)) return "success";
  if (["Planned", "Checklist in progress", "Billing pending", "Summary pending", "Pending", "Education due"].includes(status)) return "warning";
  if (["Blocked", "On hold", "Query raised", "Clarification required", "Death"].includes(status)) return "danger";
  if (["Not required", "Not planned"].includes(status)) return "muted";
  return "info";
}

export function getChecklistProgress(items: DischargeChecklistItem[]) {
  const applicable = items.filter((item) => item.status !== "Not required");
  const done = applicable.filter((item) => item.status === "Done").length;
  return {
    done,
    total: applicable.length,
    percent: applicable.length ? Math.round((done / applicable.length) * 100) : 0,
  };
}

export function getOpenDischargeBlockers(items: DischargeChecklistItem[]) {
  return items.filter((item) => item.status === "Blocked" || item.status === "Pending");
}

export function dischargeSearchText(plan: DischargePatientPlan) {
  return [
    plan.patientName,
    plan.uhid,
    plan.admissionId,
    plan.address,
    plan.contactNumber,
    plan.bed,
    plan.ward,
    plan.consultant,
    plan.admittingConsultant,
    plan.department,
    plan.specialty,
    plan.diagnosis,
    plan.clinicalSummary.chiefComplaints,
    plan.clinicalSummary.socialHistory,
    plan.clinicalSummary.allergicHistory,
    plan.clinicalSummary.clinicalFindings.join(" "),
    plan.clinicalSummary.primaryDiagnosis,
    plan.clinicalSummary.secondaryDiagnosis,
    plan.admissionDateTime,
    plan.dischargeDateTime,
    plan.status,
    plan.billingStatus,
  ]
    .join(" ")
    .toLowerCase();
}
