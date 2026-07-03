import type {
  AllergyRecord,
  ClinicalTemplate,
  ConsultationRecord,
  DiagnosisRecord,
  OpdWorklistItem,
  PrescriptionMedicine,
  VitalRecord,
} from "@/types";

export const mockOpdWorklist: OpdWorklistItem[] = [
  { id: "opd-wl-001", visitId: "visit-001", patientId: "pat-001", appointmentId: "appt-001", tokenNo: "C-018", appointmentTime: "09:40", waitingTime: "34 min", visitType: "Follow-up", queueStatus: "Called", vitalsStatus: "Abnormal", consultationStatus: "In progress", doctor: "Dr. Kavita Rao", department: "Cardiology" },
  { id: "opd-wl-002", visitId: "visit-003", patientId: "pat-002", appointmentId: "appt-002", tokenNo: "O-014", appointmentTime: "10:00", waitingTime: "26 min", visitType: "New", queueStatus: "Waiting", vitalsStatus: "Recorded", consultationStatus: "Not started", doctor: "Dr. Aman Verma", department: "Orthopedics" },
  { id: "opd-wl-003", visitId: "visit-005", patientId: "pat-003", appointmentId: "appt-003", tokenNo: "P-007", appointmentTime: "10:20", waitingTime: "18 min", visitType: "Review", queueStatus: "On hold", vitalsStatus: "Missing", consultationStatus: "Draft saved", doctor: "Dr. Neha Malik", department: "Pediatrics" },
  { id: "opd-wl-004", visitId: "visit-004", patientId: "pat-004", appointmentId: "appt-004", tokenNo: "ER-001", appointmentTime: "10:12", waitingTime: "0 min", visitType: "Emergency", queueStatus: "In consultation", vitalsStatus: "Critical", consultationStatus: "In progress", doctor: "Emergency Desk", department: "Emergency" },
];

export const mockConsultations: ConsultationRecord[] = [
  { id: "cons-opd-001", visitId: "visit-001", patientId: "pat-001", appointmentId: "appt-001", doctor: "Dr. Kavita Rao", department: "Cardiology", status: "In progress", startedAt: "10:04", chiefComplaint: "Chest discomfort on exertion for 2 days.", diagnosisIds: ["dx-001"], prescriptionId: "rx-001", followUpDate: "27 May 2026", handoffStatuses: { pharmacy: "ready", billing: "not sent", lab: "ready", radiology: "not sent" }, notes: "Follow-up cardiology review. Patient stable, advised repeat lipid profile." },
  { id: "cons-opd-002", visitId: "visit-005", patientId: "pat-003", appointmentId: "appt-003", doctor: "Dr. Neha Malik", department: "Pediatrics", status: "Draft saved", startedAt: "10:35", chiefComplaint: "Wheezing episodes at night.", diagnosisIds: ["dx-003"], prescriptionId: "rx-002", followUpDate: "03 Jun 2026", handoffStatuses: { pharmacy: "not sent", billing: "not sent", lab: "not sent", radiology: "not sent" }, notes: "Guardian consent pending. Pediatric dose caution visible." },
  { id: "cons-opd-003", visitId: "visit-003", patientId: "pat-002", appointmentId: "appt-002", doctor: "Dr. Aman Verma", department: "Orthopedics", status: "Completed", startedAt: "09:20", completedAt: "09:38", printedAt: "09:40", chiefComplaint: "Post fracture pain and swelling.", diagnosisIds: ["dx-002"], prescriptionId: "rx-003", followUpDate: "28 May 2026", handoffStatuses: { pharmacy: "sent placeholder", billing: "ready", lab: "not sent", radiology: "ready" }, notes: "Completed consultation opens read-only with revision placeholder." },
];

export const mockDiagnoses: DiagnosisRecord[] = [
  { id: "dx-001", patientId: "pat-001", visitId: "visit-001", diagnosis: "Stable angina review", icdCode: "I20.9", type: "Provisional", primary: true, severity: "Moderate", status: "Active", notes: "ICD coding placeholder, not live-coded." },
  { id: "dx-002", patientId: "pat-002", visitId: "visit-003", diagnosis: "Fracture follow-up pain", icdCode: "S52.9", type: "Final", primary: true, severity: "Moderate", status: "Active", notes: "Radiology advice placeholder." },
  { id: "dx-003", patientId: "pat-003", visitId: "visit-005", diagnosis: "Bronchial asthma review", icdCode: "J45.9", type: "Final", primary: true, severity: "Mild", status: "Active", notes: "Pediatric chronic condition caution." },
];

export const mockPrescriptionMedicines: PrescriptionMedicine[] = [
  { id: "med-001", prescriptionId: "rx-001", medicineName: "Aspirin", genericName: "Acetylsalicylic acid", strength: "75 mg", form: "Tablet", route: "Oral", dose: "1", doseUnit: "tablet", frequency: "OD", timing: "After food", duration: 30, durationUnit: "days", quantity: 30, instructions: "Continue unless bleeding symptoms occur.", alerts: ["Drug interaction placeholder", "Chronic disease caution"] },
  { id: "med-002", prescriptionId: "rx-001", medicineName: "Atorvastatin", genericName: "Atorvastatin", strength: "20 mg", form: "Tablet", route: "Oral", dose: "1", doseUnit: "tablet", frequency: "HS", timing: "Night", duration: 30, durationUnit: "days", quantity: 30, instructions: "Review liver profile if symptoms.", alerts: ["High dose placeholder"] },
  { id: "med-003", prescriptionId: "rx-002", medicineName: "Salbutamol inhaler", genericName: "Salbutamol", strength: "100 mcg", form: "Inhaler", route: "Inhalation", dose: "2", doseUnit: "puffs", frequency: "SOS", timing: "As needed", duration: 14, durationUnit: "days", quantity: 1, instructions: "Use with spacer. Guardian supervision required.", alerts: ["Pediatric caution"] },
  { id: "med-004", prescriptionId: "rx-003", medicineName: "Paracetamol", genericName: "Acetaminophen", strength: "650 mg", form: "Tablet", route: "Oral", dose: "1", doseUnit: "tablet", frequency: "TID", timing: "After food", duration: 5, durationUnit: "days", quantity: 15, instructions: "Do not exceed recommended dose.", alerts: ["Duplicate medicine placeholder"] },
];

export const mockVitals: VitalRecord[] = [
  { id: "vit-001", patientId: "pat-001", visitId: "visit-001", recordedAt: "Today 09:34", recordedBy: "Nurse station", temperature: "98.6 F", pulse: "94 bpm", bloodPressure: "148/92 mmHg", respiratoryRate: "18/min", spo2: "97%", height: "162 cm", weight: "72 kg", bmi: "27.4", painScore: "2/10", status: "Abnormal", source: "Manual" },
  { id: "vit-002", patientId: "pat-002", visitId: "visit-003", recordedAt: "Today 09:52", recordedBy: "Nurse station", temperature: "99.1 F", pulse: "86 bpm", bloodPressure: "126/78 mmHg", respiratoryRate: "16/min", spo2: "98%", height: "174 cm", weight: "81 kg", bmi: "26.8", painScore: "6/10", status: "Normal", source: "Manual" },
  { id: "vit-003", patientId: "pat-004", visitId: "visit-004", recordedAt: "Today 10:13", recordedBy: "Emergency desk", temperature: "101.8 F", pulse: "122 bpm", bloodPressure: "90/58 mmHg", respiratoryRate: "28/min", spo2: "91%", height: "Unknown", weight: "Unknown", bmi: "Missing", painScore: "Unknown", status: "Critical", source: "Manual" },
];

export const mockAllergies: AllergyRecord[] = [
  { id: "alg-001", patientId: "pat-001", allergen: "Penicillin", type: "Drug", reaction: "Rash and breathing discomfort", severity: "Severe", status: "Active", notes: "Prescription conflict warning must remain visible.", updatedAt: "Today 09:10" },
  { id: "alg-002", patientId: "pat-003", allergen: "Dust", type: "Environmental", reaction: "Wheezing", severity: "Moderate", status: "Active", notes: "Asthma trigger.", updatedAt: "Yesterday 16:15" },
  { id: "alg-003", patientId: "pat-002", allergen: "None reported", type: "Other", reaction: "Not applicable", severity: "Mild", status: "Inactive", notes: "No active allergy.", updatedAt: "18 May 2026" },
];

export const mockProcedures = [
  { id: "proc-001", patientId: "pat-001", procedure: "ECG advice", type: "Advised", department: "Cardiology", date: "Today", priority: "Routine", status: "Ready for billing", consent: "Not required" },
  { id: "proc-002", patientId: "pat-002", procedure: "POP slab review", type: "Performed", department: "Orthopedics", date: "Today", priority: "Urgent", status: "Performed placeholder", consent: "Required" },
  { id: "proc-003", patientId: "pat-003", procedure: "Nebulization advice", type: "Advised", department: "Pediatrics", date: "Today", priority: "Routine", status: "Advised", consent: "Guardian required" },
];

export const mockVaccinations = [
  { id: "vac-001", patientId: "pat-003", vaccine: "Influenza", dose: "Annual", dueDate: "Today", administeredDate: "Pending", batch: "Future batch", expiry: "Future expiry", site: "Left arm", status: "Due", notes: "Guardian consent required." },
  { id: "vac-002", patientId: "pat-003", vaccine: "Tdap", dose: "Booster", dueDate: "18 May 2026", administeredDate: "Pending", batch: "Future batch", expiry: "Future expiry", site: "Right arm", status: "Overdue", notes: "Show overdue state." },
  { id: "vac-003", patientId: "pat-001", vaccine: "COVID booster", dose: "Booster", dueDate: "Completed", administeredDate: "10 Jan 2026", batch: "BT-221", expiry: "Dec 2026", site: "Left arm", status: "Administered", notes: "No adverse event." },
];

export const mockChronicConditions = [
  { id: "chr-001", patientId: "pat-001", condition: "Hypertension", diagnosedDate: "2021", severity: "Needs review", medicines: "Amlodipine placeholder", riskMarkers: ["High BP", "Cardiac risk"], lastReview: "Today", nextReview: "27 May 2026" },
  { id: "chr-002", patientId: "pat-003", condition: "Asthma", diagnosedDate: "2023", severity: "Controlled", medicines: "Inhaler placeholder", riskMarkers: ["Pediatric caution", "Dust trigger"], lastReview: "Yesterday", nextReview: "03 Jun 2026" },
  { id: "chr-003", patientId: "pat-002", condition: "Post fracture care", diagnosedDate: "2026", severity: "Needs review", medicines: "Analgesic placeholder", riskMarkers: ["Pain score high"], lastReview: "Today", nextReview: "28 May 2026" },
];

export const mockClinicalTemplates: ClinicalTemplate[] = [
  { id: "tpl-001", name: "Cardiology follow-up note", type: "Clinical note", specialty: "Cardiology", scope: "Department", tags: ["follow-up", "bp"], content: "Symptoms reviewed, vitals checked, medication adherence discussed.", status: "Active", updatedAt: "Today" },
  { id: "tpl-002", name: "Asthma SOAP review", type: "SOAP note", specialty: "Pediatrics", scope: "Doctor", tags: ["asthma", "pediatric"], content: "S: Wheeze history. O: SpO2 and chest exam. A: Asthma review. P: Inhaler advice.", status: "Active", updatedAt: "Yesterday" },
  { id: "tpl-003", name: "Common analgesic prescription", type: "Prescription", specialty: "Orthopedics", scope: "Global", tags: ["pain", "opd"], content: "Paracetamol with dose, frequency, and duration placeholders. Warnings re-run on insert.", status: "Active", updatedAt: "18 May 2026" },
  { id: "tpl-004", name: "Follow-up advice", type: "Follow-up advice", specialty: "General", scope: "Global", tags: ["follow-up"], content: "Return if symptoms worsen. Follow-up in 7 days.", status: "Active", updatedAt: "17 May 2026" },
];

export const mockDrugAlerts = [
  { id: "drug-001", patientId: "pat-001", alert: "Penicillin allergy conflict placeholder", severity: "Critical", acknowledgement: "Required" },
  { id: "drug-002", patientId: "pat-001", alert: "Aspirin and bleeding risk placeholder", severity: "Warning", acknowledgement: "Recommended" },
  { id: "drug-003", patientId: "pat-003", alert: "Pediatric dose caution placeholder", severity: "Warning", acknowledgement: "Required" },
];

export const mockClinicalHandoffs = [
  { id: "handoff-001", consultationId: "cons-opd-001", patientId: "pat-001", targetDepartment: "Pharmacy", handoffType: "Prescription", status: "ready", createdAt: "Today 10:20", createdBy: "Dr. Kavita Rao" },
  { id: "handoff-002", consultationId: "cons-opd-001", patientId: "pat-001", targetDepartment: "Laboratory", handoffType: "Lab advice", status: "ready", createdAt: "Today 10:21", createdBy: "Dr. Kavita Rao" },
  { id: "handoff-003", consultationId: "cons-opd-003", patientId: "pat-002", targetDepartment: "Billing", handoffType: "Procedure charge", status: "sent placeholder", createdAt: "Today 09:38", createdBy: "Dr. Aman Verma" },
];

export const mockPrescriptionPrintHistory = [
  { id: "print-001", consultationId: "cons-opd-003", printedAt: "Today 09:40", printedBy: "Dr. Aman Verma", type: "Prescription" },
];

export function getConsultationByVisit(visitId: string) {
  return mockConsultations.find((consultation) => consultation.visitId === visitId);
}
