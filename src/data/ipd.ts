import type {
  AdmissionRecord,
  AmbulanceRequest,
  BedRecord,
  EmergencyCase,
  MedicationAdministrationRecord,
  NursingTask,
} from "@/types";

export const mockAdmissions: AdmissionRecord[] = [
  { id: "adm-001", admissionNo: "IPD-1188", patientId: "pat-002", department: "Orthopedics", consultant: "Dr. Aman Verma", admissionType: "Emergency", admittedAt: "Today 08:20", bedId: "bed-002", ward: "Ortho Ward", status: "In ward", diagnosis: "Post fracture stabilization", priority: "Urgent" },
  { id: "adm-002", admissionNo: "IPD-1192", patientId: "pat-001", department: "Cardiology", consultant: "Dr. Kavita Rao", admissionType: "Planned", admittedAt: "Today 11:15", bedId: "bed-004", ward: "Cardiac Ward", status: "Bed assigned", diagnosis: "Observation for chest discomfort", priority: "VIP" },
  { id: "adm-003", admissionNo: "IPD-1194", patientId: "pat-004", department: "Emergency", consultant: "Emergency Desk", admissionType: "Emergency", admittedAt: "Today 10:35", bedId: "bed-icu-001", ward: "ICU", status: "In ICU", diagnosis: "Unknown emergency, stabilization", priority: "Emergency" },
  { id: "adm-004", admissionNo: "IPD-1181", patientId: "pat-003", department: "Pediatrics", consultant: "Dr. Neha Malik", admissionType: "Planned", admittedAt: "Yesterday 16:10", bedId: "bed-006", ward: "Pediatric Ward", status: "Discharge initiated", diagnosis: "Asthma observation", priority: "Routine" },
];

export const mockBeds: BedRecord[] = [
  { id: "bed-001", bedNo: "GW-101", ward: "General Ward", roomNo: "G-10", bedType: "General", status: "Available", isIsolationCapable: false, genderRestriction: "Any", lastStatusChangedAt: "Today 07:20", statusReason: "Clean and available" },
  { id: "bed-002", bedNo: "OW-204", ward: "Ortho Ward", roomNo: "O-20", bedType: "Semi-private", status: "Occupied", patientId: "pat-002", consultant: "Dr. Aman Verma", isIsolationCapable: false, genderRestriction: "Male", lastStatusChangedAt: "Today 08:25", statusReason: "Admission active" },
  { id: "bed-003", bedNo: "GW-112", ward: "General Ward", roomNo: "G-11", bedType: "General", status: "Cleaning", isIsolationCapable: false, genderRestriction: "Any", lastStatusChangedAt: "Today 10:15", statusReason: "Post discharge cleaning" },
  { id: "bed-004", bedNo: "CW-305", ward: "Cardiac Ward", roomNo: "C-30", bedType: "Private", status: "Reserved", patientId: "pat-001", consultant: "Dr. Kavita Rao", isIsolationCapable: false, genderRestriction: "Female", lastStatusChangedAt: "Today 10:50", statusReason: "Reserved for planned admission" },
  { id: "bed-005", bedNo: "ISO-01", ward: "Isolation", roomNo: "I-01", bedType: "Isolation", status: "Isolation", isIsolationCapable: true, genderRestriction: "Any", lastStatusChangedAt: "Today 09:10", statusReason: "Infection control block" },
  { id: "bed-006", bedNo: "PW-014", ward: "Pediatric Ward", roomNo: "P-04", bedType: "General", status: "Occupied", patientId: "pat-003", consultant: "Dr. Neha Malik", isIsolationCapable: false, genderRestriction: "Any", lastStatusChangedAt: "Yesterday 16:20", statusReason: "Pediatric observation" },
  { id: "bed-icu-001", bedNo: "ICU-01", ward: "ICU", roomNo: "ICU-A", bedType: "ICU", status: "Occupied", patientId: "pat-004", consultant: "Emergency Desk", isIsolationCapable: true, genderRestriction: "Any", lastStatusChangedAt: "Today 10:40", statusReason: "Critical emergency transfer" },
  { id: "bed-icu-002", bedNo: "ICU-02", ward: "ICU", roomNo: "ICU-A", bedType: "ICU", status: "Maintenance", isIsolationCapable: true, genderRestriction: "Any", lastStatusChangedAt: "Today 06:30", statusReason: "Monitor service placeholder" },
];

export const mockWards = [
  { id: "ward-001", ward: "General Ward", bedsTotal: 42, occupied: 28, available: 10, cleaning: 3, maintenance: 1, nurseInCharge: "Nisha Thomas", status: "Active" },
  { id: "ward-002", ward: "Ortho Ward", bedsTotal: 28, occupied: 22, available: 4, cleaning: 1, maintenance: 1, nurseInCharge: "Ritu Sharma", status: "High load" },
  { id: "ward-003", ward: "ICU", bedsTotal: 12, occupied: 9, available: 1, cleaning: 0, maintenance: 2, nurseInCharge: "Nisha Thomas", status: "Guarded" },
  { id: "ward-004", ward: "Pediatric Ward", bedsTotal: 18, occupied: 11, available: 5, cleaning: 2, maintenance: 0, nurseInCharge: "Sana Khan", status: "Active" },
];

export const mockNursingTasks: NursingTask[] = [
  { id: "nt-001", admissionId: "adm-001", patientId: "pat-002", bedNo: "OW-204", task: "Pain reassessment", category: "Assessment", dueAt: "Now", status: "Due now", risk: "Medium" },
  { id: "nt-002", admissionId: "adm-003", patientId: "pat-004", bedNo: "ICU-01", task: "Critical vitals", category: "Vitals", dueAt: "Overdue 8 min", status: "Overdue", risk: "Critical" },
  { id: "nt-003", admissionId: "adm-004", patientId: "pat-003", bedNo: "PW-014", task: "Discharge education", category: "Handoff", dueAt: "Today 14:00", status: "Pending", risk: "Low" },
  { id: "nt-004", admissionId: "adm-002", patientId: "pat-001", bedNo: "CW-305", task: "Medication reconciliation", category: "Medication", dueAt: "Today 12:00", status: "Pending", risk: "High" },
];

export const mockMedicationAdministration: MedicationAdministrationRecord[] = [
  { id: "mar-001", admissionId: "adm-001", patientId: "pat-002", medicineName: "Paracetamol", dose: "650 mg", route: "Oral", dueTime: "12:00", status: "Due", administeredBy: "Pending", administeredAt: "Pending", reason: "Pain score high", safetyChecks: ["Patient ID", "Dose", "Route"] },
  { id: "mar-002", admissionId: "adm-003", patientId: "pat-004", medicineName: "IV fluids", dose: "500 ml", route: "IV", dueTime: "Now", status: "Delayed", administeredBy: "Emergency nurse", administeredAt: "Pending", reason: "Line access review", safetyChecks: ["Unknown identity warning", "Critical vitals"] },
  { id: "mar-003", admissionId: "adm-002", patientId: "pat-001", medicineName: "Aspirin", dose: "75 mg", route: "Oral", dueTime: "13:00", status: "Scheduled", administeredBy: "Pending", administeredAt: "Pending", reason: "Cardiac observation", safetyChecks: ["Allergy check", "Bleeding risk"] },
  { id: "mar-004", admissionId: "adm-004", patientId: "pat-003", medicineName: "Nebulization", dose: "2.5 mg", route: "Inhalation", dueTime: "10:00", status: "Administered", administeredBy: "Nisha Thomas", administeredAt: "10:05", reason: "Wheeze", safetyChecks: ["Guardian informed", "Pediatric dose"] },
];

export const mockDoctorRounds = [
  { id: "round-001", admissionId: "adm-001", patientId: "pat-002", bed: "OW-204", consultant: "Dr. Aman Verma", roundTime: "Today 11:20", note: "Pain improved, continue observation.", status: "Reviewed", orders: "Radiology advice placeholder" },
  { id: "round-002", admissionId: "adm-003", patientId: "pat-004", bed: "ICU-01", consultant: "Emergency Desk", roundTime: "Today 10:50", note: "Stabilizing, identity incomplete.", status: "Urgent review", orders: "ICU transfer placeholder" },
  { id: "round-003", admissionId: "adm-004", patientId: "pat-003", bed: "PW-014", consultant: "Dr. Neha Malik", roundTime: "Today 09:30", note: "Discharge can proceed after education.", status: "Discharge ready", orders: "Follow-up advice placeholder" },
];

export const mockNursingAssessments = [
  { id: "assess-001", admissionId: "adm-001", patientId: "pat-002", assessment: "Fall risk", score: "Medium", status: "Needs review", notes: "Pain and mobility restriction." },
  { id: "assess-002", admissionId: "adm-003", patientId: "pat-004", assessment: "Pressure injury risk", score: "High", status: "Critical", notes: "ICU observation." },
  { id: "assess-003", admissionId: "adm-004", patientId: "pat-003", assessment: "Pediatric discharge readiness", score: "Low", status: "Completed", notes: "Guardian education pending." },
];

export const mockIntakeOutput = [
  { id: "io-001", admissionId: "adm-003", patientId: "pat-004", time: "10:30", type: "Intake", route: "IV", amount: "500 ml", balance: "+500 ml", status: "Active" },
  { id: "io-002", admissionId: "adm-003", patientId: "pat-004", time: "11:00", type: "Output", route: "Urine", amount: "120 ml", balance: "+380 ml", status: "Watch" },
  { id: "io-003", admissionId: "adm-001", patientId: "pat-002", time: "09:00", type: "Intake", route: "Oral", amount: "250 ml", balance: "+250 ml", status: "Normal" },
];

export const mockTransfers = [
  { id: "tr-001", admissionId: "adm-003", patientId: "pat-004", from: "Emergency", to: "ICU-01", type: "Ward to ICU", status: "Completed", reason: "Critical stabilization", requestedBy: "Emergency Desk" },
  { id: "tr-002", admissionId: "adm-001", patientId: "pat-002", from: "OW-204", to: "Private room", type: "Bed to bed", status: "Pending", reason: "Family request", requestedBy: "Reception" },
  { id: "tr-003", admissionId: "adm-002", patientId: "pat-001", from: "Reserved CW-305", to: "Cardiac Ward", type: "Bed assignment", status: "Pending", reason: "Planned admission", requestedBy: "Hospital Admin" },
];

export const mockDischarges = [
  { id: "disc-001", admissionId: "adm-004", patientId: "pat-003", status: "Discharge initiated", checklist: "Nursing clearance pending", billing: "Pending", summary: "Asthma observation discharge summary placeholder" },
  { id: "disc-002", admissionId: "adm-001", patientId: "pat-002", status: "Delayed", checklist: "Radiology review pending", billing: "Estimate pending", summary: "Orthopedic discharge not ready" },
];

export const mockIpdPackages = [
  { id: "pkg-001", admissionId: "adm-001", patientId: "pat-002", packageName: "Ortho stabilization package", status: "Active", utilization: "62%", excluded: "Implant billing placeholder", limitWarning: "No" },
  { id: "pkg-002", admissionId: "adm-003", patientId: "pat-004", packageName: "Emergency ICU observation", status: "Nearing limit", utilization: "91%", excluded: "Ventilator placeholder", limitWarning: "Yes" },
];

export const mockEmergencyCases: EmergencyCase[] = [
  { id: "er-001", caseNo: "ER-0098", patientId: "pat-004", arrivalTime: "Today 10:12", chiefComplaint: "Unconscious on arrival", arrivalMode: "Ambulance", priority: "Red: immediate", status: "In casualty", assignedArea: "ER Bay 2" },
  { id: "er-002", caseNo: "ER-0101", patientId: "pat-002", arrivalTime: "Today 09:35", chiefComplaint: "Severe limb pain", arrivalMode: "Walk-in", priority: "Yellow: urgent", status: "Admitted to IPD", assignedArea: "Ortho Ward" },
  { id: "er-003", caseNo: "ER-0104", patientId: "pat-003", arrivalTime: "Today 11:30", chiefComplaint: "Wheezing", arrivalMode: "Referral", priority: "Orange: very urgent", status: "Triage pending", assignedArea: "Triage 1" },
];

export const mockTriageQueue = [
  { id: "tri-001", emergencyCaseId: "er-001", patientId: "pat-004", arrivalTime: "10:12", priority: "Red: immediate", vitals: "BP 90/58, SpO2 91%", symptoms: "Unconscious", status: "Reassessment overdue", reassessmentDueAt: "10:25" },
  { id: "tri-002", emergencyCaseId: "er-003", patientId: "pat-003", arrivalTime: "11:30", priority: "Orange: very urgent", vitals: "SpO2 94%", symptoms: "Wheezing", status: "Waiting triage", reassessmentDueAt: "11:40" },
  { id: "tri-003", emergencyCaseId: "er-002", patientId: "pat-002", arrivalTime: "09:35", priority: "Yellow: urgent", vitals: "Pain 8/10", symptoms: "Fracture pain", status: "Sent to IPD", reassessmentDueAt: "Completed" },
];

export const mockCasualtyCases = [
  { id: "cas-001", emergencyCaseId: "er-001", patientId: "pat-004", triage: "Red: immediate", assessment: "Airway and circulation stabilization", treatment: "IV fluids placeholder", stabilization: "Stabilizing", disposition: "Transfer to ICU" },
  { id: "cas-002", emergencyCaseId: "er-003", patientId: "pat-003", triage: "Orange: very urgent", assessment: "Respiratory distress review", treatment: "Nebulization placeholder", stabilization: "Observation", disposition: "Pediatric review" },
];

export const mockTraumaCases = [
  { id: "trauma-001", emergencyCaseId: "er-001", mechanism: "Road traffic accident placeholder", regions: "Head, left forearm", gcs: "E3 V3 M5", bleeding: "Controlled", immobilization: "C-collar placeholder", status: "Trauma team alerted" },
  { id: "trauma-002", emergencyCaseId: "er-002", mechanism: "Fall injury", regions: "Right forearm", gcs: "15", bleeding: "None", immobilization: "Splint placeholder", status: "Orthopedic handoff" },
];

export const mockAmbulanceRequests: AmbulanceRequest[] = [
  { id: "amb-001", requestNo: "AMB-4410", callerName: "Highway patrol", patientId: "pat-004", pickupLocation: "Mumbai-Pune highway", destination: "Plasmit Emergency", ambulanceNo: "MH-12-4410", driverName: "Ramesh Patil", status: "Arrived", eta: "Arrived 10:12" },
  { id: "amb-002", requestNo: "AMB-4416", callerName: "Priya Menon", pickupLocation: "Baner Road", destination: "Plasmit Emergency", ambulanceNo: "MH-12-4420", driverName: "Suresh Yadav", status: "Dispatched", eta: "18 min", delayReason: "Traffic placeholder" },
];

export const mockEmergencyCharges = [
  { id: "ec-001", emergencyCaseId: "er-001", patientId: "pat-004", service: "Emergency registration", qty: 1, rate: "₹500", status: "Charges pending" },
  { id: "ec-002", emergencyCaseId: "er-001", patientId: "pat-004", service: "ICU observation placeholder", qty: 1, rate: "₹4,500", status: "Invoice draft" },
  { id: "ec-003", emergencyCaseId: "er-002", patientId: "pat-002", service: "Emergency consult", qty: 1, rate: "₹1,200", status: "Sent to billing module" },
];

export const mockInfectionIsolationFlags = [
  { id: "iso-001", patientId: "pat-004", type: "Unknown infectious risk", severity: "High", status: "Active", startedAt: "Today 10:20", notes: "Isolation-capable bed preferred." },
  { id: "iso-002", patientId: "pat-003", type: "Respiratory caution", severity: "Medium", status: "Watch", startedAt: "Yesterday", notes: "Pediatric respiratory symptoms." },
];

export function getAdmissionById(admissionId: string) {
  return mockAdmissions.find((admission) => admission.id === admissionId);
}
