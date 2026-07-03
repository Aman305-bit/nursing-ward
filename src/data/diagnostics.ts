import type {
  AnalyzerDevice,
  CriticalLabAlert,
  LabOrder,
  LabPackage,
  LabTest,
  PacsStudy,
  RadiologyOrder,
  RadiologyReport,
  RadiologySafetyChecklist,
  RadiologySchedule,
  SampleCollection,
  SampleCustodyEvent,
} from "@/types";

export const mockLabTests: LabTest[] = [
  { id: "lt-001", name: "Complete Blood Count", code: "CBC", department: "Hematology", sampleType: "Whole blood", method: "Analyzer placeholder", normalRangeStatus: "Age/gender split", price: "₹450", status: "Active", parameters: [{ name: "Hemoglobin", unit: "g/dL", referenceRange: "12-16", criticalLow: "7", criticalHigh: "20" }, { name: "WBC", unit: "10^3/uL", referenceRange: "4-11", criticalLow: "2", criticalHigh: "30" }] },
  { id: "lt-002", name: "Lipid Profile", code: "LIPID", department: "Biochemistry", sampleType: "Serum", method: "Photometry placeholder", normalRangeStatus: "Critical range configured", price: "₹900", status: "Active", parameters: [{ name: "Total Cholesterol", unit: "mg/dL", referenceRange: "<200", criticalLow: "NA", criticalHigh: "400" }, { name: "LDL", unit: "mg/dL", referenceRange: "<100", criticalLow: "NA", criticalHigh: "250" }] },
  { id: "lt-003", name: "Blood Culture", code: "BLCUL", department: "Microbiology", sampleType: "Blood culture bottle", method: "Culture placeholder", normalRangeStatus: "Configured", price: "₹1,800", status: "Review required", parameters: [{ name: "Growth", unit: "Text", referenceRange: "No growth", criticalLow: "NA", criticalHigh: "Positive growth" }] },
  { id: "lt-004", name: "Biopsy Histopathology", code: "HISTO", department: "Histopathology", sampleType: "Tissue", method: "Microscopy placeholder", normalRangeStatus: "Missing range", price: "₹2,400", status: "Active", parameters: [{ name: "Grossing", unit: "Text", referenceRange: "Narrative", criticalLow: "NA", criticalHigh: "NA" }] },
];

export const mockLabPackages: LabPackage[] = [
  { id: "lp-001", name: "Cardiac follow-up panel", code: "PKG-CARD", includedTests: ["CBC", "Lipid Profile"], department: "Multi department", price: "₹1,250", status: "Active", sampleRequirements: "Serum and whole blood; separate barcode labels." },
  { id: "lp-002", name: "Fever workup", code: "PKG-FEV", includedTests: ["CBC", "Blood Culture"], department: "Multi department", price: "₹2,100", status: "Sample conflict placeholder", sampleRequirements: "Culture bottle must be collected before antibiotics." },
  { id: "lp-003", name: "Tissue pathology package", code: "PKG-HISTO", includedTests: ["Biopsy Histopathology"], department: "Histopathology", price: "₹2,400", status: "Active", sampleRequirements: "Formalin container, clinical history required." },
];

export const mockLabOrders: LabOrder[] = [
  { id: "lo-001", orderNo: "LAB-8841", patientId: "pat-001", encounterId: "enc-002", source: "OPD", tests: ["CBC", "Lipid Profile"], department: "Biochemistry", priority: "Routine", status: "Sample pending", sampleStatus: "Pending collection", resultStatus: "Not entered", orderedBy: "Dr. Kavita Rao", orderedAt: "Today 10:05", billingStatus: "OPD billing placeholder" },
  { id: "lo-002", orderNo: "LAB-8844", patientId: "pat-004", encounterId: "enc-004", source: "Emergency", tests: ["CBC"], department: "Hematology", priority: "Critical", status: "Approval pending", sampleStatus: "Processing", resultStatus: "Critical", orderedBy: "Emergency Desk", orderedAt: "Today 10:18", billingStatus: "Emergency billing pending" },
  { id: "lo-003", orderNo: "LAB-8847", patientId: "pat-003", encounterId: "enc-005", source: "IPD", tests: ["Blood Culture"], department: "Microbiology", priority: "Urgent", status: "In processing", sampleStatus: "Received", resultStatus: "Draft", orderedBy: "Dr. Neha Malik", orderedAt: "Yesterday 17:00", billingStatus: "Package billing placeholder" },
  { id: "lo-004", orderNo: "LAB-8850", patientId: "pat-002", encounterId: "enc-003", source: "IPD", tests: ["Biopsy Histopathology"], department: "Histopathology", priority: "Routine", status: "Rejected", sampleStatus: "Hemolyzed/clotted placeholder", resultStatus: "Correction requested", orderedBy: "Dr. Aman Verma", orderedAt: "Today 08:42", billingStatus: "Credit billing placeholder" },
];

export const mockSampleCollections: SampleCollection[] = [
  { id: "sc-001", orderId: "lo-001", barcode: "BC-8841-SER", sampleType: "Serum", container: "Red top tube", status: "Pending collection", collectedBy: "Pending", collectedAt: "Pending", rejectionReason: "", qualityIssue: "", custodyStatus: "Ordered > label printed", reprintCount: 0, lastReprintReason: "None" },
  { id: "sc-002", orderId: "lo-002", barcode: "BC-8844-WB", sampleType: "Whole blood", container: "EDTA tube", status: "Processing", collectedBy: "Emergency nurse", collectedAt: "Today 10:21", rejectionReason: "", qualityIssue: "Critical value escalation", custodyStatus: "Ordered > printed > collected > received > processing", reprintCount: 1, lastReprintReason: "Smudged emergency label" },
  { id: "sc-003", orderId: "lo-003", barcode: "BC-8847-CUL", sampleType: "Blood culture bottle", container: "Aerobic bottle", status: "Received", collectedBy: "Nisha Thomas", collectedAt: "Yesterday 17:15", rejectionReason: "", qualityIssue: "Incubation pending", custodyStatus: "Ordered > collected > in transit > received", reprintCount: 0, lastReprintReason: "None" },
  { id: "sc-004", orderId: "lo-004", barcode: "BC-8850-TIS", sampleType: "Tissue", container: "Formalin container", status: "Hemolyzed/clotted placeholder", collectedBy: "OT nurse placeholder", collectedAt: "Today 09:05", rejectionReason: "Container mismatch placeholder", qualityIssue: "Specimen quality issue", custodyStatus: "Missing receiving step warning", reprintCount: 2, lastReprintReason: "Damaged label placeholder" },
];

export const mockSampleCustodyEvents: SampleCustodyEvent[] = [
  { id: "cust-001", sampleId: "sc-001", orderId: "lo-001", eventType: "Ordered", location: "OPD", user: "Dr. Kavita Rao", timestamp: "Today 10:05", notes: "Collection pending" },
  { id: "cust-002", sampleId: "sc-002", orderId: "lo-002", eventType: "Collected", location: "Emergency bay", user: "Emergency nurse", timestamp: "Today 10:21", notes: "Emergency label reprint recorded" },
  { id: "cust-003", sampleId: "sc-002", orderId: "lo-002", eventType: "Processing", location: "Hematology bench", user: "Lab Technician", timestamp: "Today 10:34", notes: "Critical flag visible" },
  { id: "cust-004", sampleId: "sc-004", orderId: "lo-004", eventType: "Quality issue", location: "Histopathology receiving", user: "Lab Technician", timestamp: "Today 09:20", notes: "Reason required before rejection/recollection" },
];

export const mockAnalyzers: AnalyzerDevice[] = [
  { id: "an-001", name: "Hematology Analyzer H-500", department: "Hematology", connectionStatus: "Online placeholder", lastSync: "Today 10:40", pendingResults: 3, errorCount: 0, status: "Active" },
  { id: "an-002", name: "Biochemistry Analyzer B-220", department: "Biochemistry", connectionStatus: "Sync failed placeholder", lastSync: "Today 09:55", pendingResults: 7, errorCount: 2, status: "Review" },
  { id: "an-003", name: "Culture Incubator M-12", department: "Microbiology", connectionStatus: "Offline", lastSync: "Yesterday 23:40", pendingResults: 4, errorCount: 1, status: "Active" },
];

export const mockLabResults = [
  { id: "lr-001", orderId: "lo-002", testId: "lt-001", parameters: [{ parameter: "Hemoglobin", value: "6.8", unit: "g/dL", referenceRange: "12-16", flag: "Critical low", previousValue: "Unknown", comment: "Critical result requires acknowledgement." }, { parameter: "WBC", value: "18.2", unit: "10^3/uL", referenceRange: "4-11", flag: "High", previousValue: "NA", comment: "Emergency infection marker placeholder." }], status: "Critical", critical: true, enteredBy: "Lab Technician", approvedBy: "Pathologist placeholder", approvedAt: "Pending", version: "v1 draft", correctionReason: "", addendum: "" },
  { id: "lr-002", orderId: "lo-001", testId: "lt-002", parameters: [{ parameter: "Total Cholesterol", value: "242", unit: "mg/dL", referenceRange: "<200", flag: "High", previousValue: "228", comment: "Review with cardiology." }, { parameter: "LDL", value: "162", unit: "mg/dL", referenceRange: "<100", flag: "High", previousValue: "150", comment: "Draft value." }], status: "Draft", critical: false, enteredBy: "Biochemistry tech", approvedBy: "Pending", approvedAt: "Pending", version: "v1 draft", correctionReason: "", addendum: "" },
  { id: "lr-003", orderId: "lo-004", testId: "lt-004", parameters: [{ parameter: "Grossing", value: "Specimen inadequate", unit: "Text", referenceRange: "Narrative", flag: "Abnormal", previousValue: "NA", comment: "Correction requested; original preserved." }], status: "Correction requested", critical: false, enteredBy: "Histopathology tech", approvedBy: "Dr. Pathak", approvedAt: "Today 10:30", version: "v2 correction", correctionReason: "Specimen container mismatch", addendum: "Addendum placeholder after corrected specimen." },
];

export const mockCriticalLabAlerts: CriticalLabAlert[] = [
  { id: "cla-001", orderId: "lo-002", patientId: "pat-004", test: "CBC", parameter: "Hemoglobin", value: "6.8 g/dL", escalation: "Escalated", assignedTo: "Emergency Desk", createdAt: "Today 10:43", acknowledgedAt: "Pending" },
  { id: "cla-002", orderId: "lo-003", patientId: "pat-003", test: "Blood Culture", parameter: "Growth", value: "Positive placeholder", escalation: "Unacknowledged", assignedTo: "Dr. Neha Malik", createdAt: "Today 09:15", acknowledgedAt: "Pending" },
];

export const mockRadiologyOrders: RadiologyOrder[] = [
  { id: "ro-001", orderNo: "RAD-3312", patientId: "pat-002", encounterId: "enc-006", source: "IPD", modality: "X-Ray", study: "Right forearm AP/Lateral", priority: "Urgent", scheduleStatus: "Image acquired placeholder", pacsStatus: "PACS sync pending", reportStatus: "Approval pending", safetyChecklistStatus: "Completed", orderedBy: "Dr. Aman Verma", orderedAt: "Today 09:50" },
  { id: "ro-002", orderNo: "RAD-3318", patientId: "pat-004", encounterId: "enc-004", source: "Emergency", modality: "CT", study: "CT brain plain", priority: "Emergency", scheduleStatus: "In progress", pacsStatus: "Image available placeholder", reportStatus: "Report draft", safetyChecklistStatus: "Safety checklist pending", orderedBy: "Emergency Desk", orderedAt: "Today 10:28" },
  { id: "ro-003", orderNo: "RAD-3320", patientId: "pat-001", encounterId: "enc-001", source: "OPD", modality: "Ultrasound", study: "Abdomen screening", priority: "Routine", scheduleStatus: "Scheduled", pacsStatus: "Study pending", reportStatus: "Not entered", safetyChecklistStatus: "Consent pending", orderedBy: "Dr. Kavita Rao", orderedAt: "Today 10:38" },
  { id: "ro-004", orderNo: "RAD-3324", patientId: "pat-003", encounterId: "enc-005", source: "External placeholder", modality: "MRI", study: "MRI chest placeholder", priority: "Routine", scheduleStatus: "Scheduled", pacsStatus: "Sync failed placeholder", reportStatus: "Correction requested", safetyChecklistStatus: "Pending", orderedBy: "External referral", orderedAt: "Yesterday 18:00" },
  { id: "ro-005", orderNo: "RAD-3327", patientId: "pat-001", encounterId: "enc-001", source: "OPD", modality: "Mammography", study: "Screening mammography", priority: "Routine", scheduleStatus: "Ordered", pacsStatus: "Image unavailable", reportStatus: "Not entered", safetyChecklistStatus: "Pending", orderedBy: "Dr. Kavita Rao", orderedAt: "Today 11:05" },
  { id: "ro-006", orderNo: "RAD-3330", patientId: "pat-002", encounterId: "enc-003", source: "IPD", modality: "PET", study: "PET staging placeholder", priority: "STAT placeholder", scheduleStatus: "Reporting pending", pacsStatus: "PACS synced placeholder", reportStatus: "Addendum placeholder", safetyChecklistStatus: "Completed", orderedBy: "Dr. Aman Verma", orderedAt: "Today 11:15" },
];

export const mockRadiologySchedules: RadiologySchedule[] = [
  { id: "rs-001", orderId: "ro-001", dateTime: "Today 10:15", room: "X-Ray 1", technician: "Rakesh Tech", preparation: "Completed", contrastRequired: "No", consentRequired: "No", safetyChecklist: "Completed" },
  { id: "rs-002", orderId: "ro-002", dateTime: "Today 10:35", room: "CT 1", technician: "Emergency CT Tech", preparation: "Safety checklist pending", contrastRequired: "Conditional placeholder", consentRequired: "Pending", safetyChecklist: "Safety checklist pending" },
  { id: "rs-003", orderId: "ro-003", dateTime: "Today 15:00", room: "USG 2", technician: "Priya USG", preparation: "Consent pending", contrastRequired: "No", consentRequired: "Yes", safetyChecklist: "Pending" },
  { id: "rs-004", orderId: "ro-004", dateTime: "Tomorrow 09:30", room: "MRI 1", technician: "MRI Tech", preparation: "Pending", contrastRequired: "Conditional placeholder", consentRequired: "Yes", safetyChecklist: "Pending" },
];

export const mockPacsStudies: PacsStudy[] = [
  { id: "ps-001", studyUid: "1.2.840.PACS.3312", orderId: "ro-001", patientId: "pat-002", modality: "X-Ray", study: "Right forearm AP/Lateral", studyDate: "Today 10:16", imageStatus: "Image available placeholder", syncStatus: "PACS sync pending", reportStatus: "Approval pending" },
  { id: "ps-002", studyUid: "1.2.840.PACS.3318", orderId: "ro-002", patientId: "pat-004", modality: "CT", study: "CT brain plain", studyDate: "Today 10:36", imageStatus: "Image available placeholder", syncStatus: "PACS synced placeholder", reportStatus: "Report draft" },
  { id: "ps-003", studyUid: "1.2.840.PACS.3324", orderId: "ro-004", patientId: "pat-003", modality: "MRI", study: "MRI chest placeholder", studyDate: "Pending", imageStatus: "Image unavailable", syncStatus: "Sync failed placeholder", reportStatus: "Correction requested" },
];

export const mockRadiologyReports: RadiologyReport[] = [
  { id: "rr-001", orderId: "ro-001", studyId: "ps-001", radiologist: "Dr. Raina Shah", status: "Approval pending", findings: "Alignment improved; fracture line visible. PACS image is placeholder only.", impression: "Healing fracture, correlate clinically.", criticalFinding: false, approvedAt: "Pending", addendum: "", version: "v1 draft", correctionReason: "", supersededBy: "" },
  { id: "rr-002", orderId: "ro-002", studyId: "ps-002", radiologist: "Dr. Raina Shah", status: "Report draft", findings: "No real DICOM rendered. Emergency CT draft placeholder with critical review panel.", impression: "Emergency report draft; clinical correlation required.", criticalFinding: true, approvedAt: "Pending", addendum: "", version: "v1 draft", correctionReason: "", supersededBy: "" },
  { id: "rr-003", orderId: "ro-004", studyId: "ps-003", radiologist: "Dr. Raina Shah", status: "Correction requested", findings: "MRI safety questionnaire incomplete.", impression: "Correction requested before approval.", criticalFinding: false, approvedAt: "Yesterday 18:40", addendum: "Addendum placeholder preserves original report.", version: "v2 correction", correctionReason: "Safety checklist missing", supersededBy: "rr-004 placeholder" },
];

export const mockRadiologySafetyChecklists: RadiologySafetyChecklist[] = [
  { id: "rsc-001", orderId: "ro-001", modality: "X-Ray", status: "Completed", completedBy: "Rakesh Tech", completedAt: "Today 10:12", items: [{ label: "Patient identity confirmed", status: "Done" }, { label: "Pregnancy status placeholder", status: "Done" }, { label: "Previous study available placeholder", status: "Done" }] },
  { id: "rsc-002", orderId: "ro-002", modality: "CT", status: "Safety checklist pending", completedBy: "Pending", completedAt: "Pending", items: [{ label: "Patient identity confirmed", status: "Done" }, { label: "Contrast allergy checked", status: "Pending" }, { label: "Renal function checked placeholder", status: "Blocked placeholder" }] },
  { id: "rsc-003", orderId: "ro-004", modality: "MRI", status: "Pending", completedBy: "Pending", completedAt: "Pending", items: [{ label: "Implant/device screening placeholder", status: "Pending" }, { label: "Claustrophobia/sedation placeholder", status: "Pending" }, { label: "MRI safety questionnaire placeholder", status: "Blocked placeholder" }] },
];

export function getLabOrderById(orderId: string) {
  return mockLabOrders.find((order) => order.id === orderId);
}

export function getRadiologyOrderById(orderId: string) {
  return mockRadiologyOrders.find((order) => order.id === orderId);
}
