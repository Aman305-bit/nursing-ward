import type {
  ClinicalAttachment,
  ClinicalTimelineEvent,
  DigitalSignatureRecord,
  DisclosureRequest,
  EmrEncounter,
  MedicalHistoryItem,
  ProgressNote,
  RecordAccessAudit,
  RecordVersion,
} from "@/types";

export const mockEmrEncounters: EmrEncounter[] = [
  {
    id: "enc-001",
    patientId: "pat-001",
    encounterNo: "OPD-5261",
    encounterType: "OPD",
    department: "Cardiology",
    provider: "Dr. Kavita Rao",
    startedAt: "Today 09:40",
    completedAt: "Today 10:28",
    status: "Completed",
    signatureStatus: "Pending",
    sensitivity: "Sensitive",
    versionState: "Current",
    legalHold: false,
    summary: "Cardiology follow-up with exertional chest discomfort and abnormal BP review.",
    diagnosisSummary: "Stable angina review, hypertension risk.",
    prescriptionSummary: "Aspirin, atorvastatin, repeat lipid profile advice.",
    documentsCount: 4,
    relatedRoute: "/opd/consultation/visit-001",
  },
  {
    id: "enc-002",
    patientId: "pat-001",
    encounterNo: "LAB-8841",
    encounterType: "Lab placeholder",
    department: "Central Laboratory",
    provider: "Lab worklist",
    startedAt: "Today 10:05",
    completedAt: "Pending approval",
    status: "Draft",
    signatureStatus: "Not required",
    sensitivity: "Consent-gated placeholder",
    versionState: "Current",
    legalHold: false,
    summary: "Lipid profile and CBC sample collection placeholder for Phase 8 continuity.",
    diagnosisSummary: "Linked to cardiology follow-up.",
    prescriptionSummary: "No medicines generated from lab placeholder.",
    documentsCount: 1,
    relatedRoute: "/laboratory",
  },
  {
    id: "enc-003",
    patientId: "pat-002",
    encounterNo: "IPD-1188",
    encounterType: "IPD",
    department: "Orthopedics",
    provider: "Dr. Aman Verma",
    startedAt: "Today 08:20",
    completedAt: "Active admission",
    status: "Addendum placeholder",
    signatureStatus: "Signed placeholder",
    sensitivity: "Normal",
    versionState: "Addendum",
    legalHold: false,
    summary: "Post-fracture stabilization admission with pain reassessment and radiology advice.",
    diagnosisSummary: "Fracture follow-up pain, active IPD observation.",
    prescriptionSummary: "Paracetamol and inpatient medication administration tracking.",
    documentsCount: 5,
    relatedRoute: "/ipd/admissions/adm-001",
  },
  {
    id: "enc-004",
    patientId: "pat-004",
    encounterNo: "ER-0098",
    encounterType: "Emergency",
    department: "Emergency",
    provider: "Emergency Desk",
    startedAt: "Today 10:12",
    completedAt: "In casualty",
    status: "Legal hold placeholder",
    signatureStatus: "Pending",
    sensitivity: "Break-glass placeholder",
    versionState: "Current",
    legalHold: true,
    summary: "Unknown emergency arrival with medico-legal and identity-incomplete placeholders.",
    diagnosisSummary: "Unconscious on arrival, critical vitals, ICU transfer placeholder.",
    prescriptionSummary: "IV fluids and emergency stabilization orders.",
    documentsCount: 3,
    relatedRoute: "/emergency/casualty",
  },
  {
    id: "enc-005",
    patientId: "pat-003",
    encounterNo: "OPD-5198",
    encounterType: "Teleconsultation placeholder",
    department: "Pediatrics",
    provider: "Dr. Neha Malik",
    startedAt: "Yesterday 16:10",
    completedAt: "Yesterday 16:42",
    status: "Revised placeholder",
    signatureStatus: "Rejected placeholder",
    sensitivity: "Consent-gated placeholder",
    versionState: "Superseded",
    legalHold: false,
    summary: "Pediatric asthma review with guardian consent and teleconsultation handoff placeholder.",
    diagnosisSummary: "Bronchial asthma review.",
    prescriptionSummary: "Salbutamol inhaler with pediatric dose caution.",
    documentsCount: 6,
    relatedRoute: "/opd/consultation/visit-005",
  },
  {
    id: "enc-006",
    patientId: "pat-002",
    encounterNo: "RAD-3312",
    encounterType: "Radiology placeholder",
    department: "Radiology",
    provider: "Radiology Desk",
    startedAt: "Today 09:58",
    completedAt: "Report draft",
    status: "Superseded placeholder",
    signatureStatus: "Expired certificate placeholder",
    sensitivity: "Restricted",
    versionState: "Previous",
    legalHold: true,
    summary: "X-ray review placeholder linked to orthopedic admission and version governance.",
    diagnosisSummary: "Fracture alignment review.",
    prescriptionSummary: "No prescription from radiology placeholder.",
    documentsCount: 2,
    relatedRoute: "/radiology",
  },
];

export const mockMedicalHistory: MedicalHistoryItem[] = [
  { id: "hist-001", patientId: "pat-001", section: "Past medical", condition: "Hypertension", onset: "2021", status: "Active", severity: "High", notes: "Requires BP trend visibility in EHR summary.", sourceEncounter: "OPD-5261", verified: true, sensitivity: "Sensitive" },
  { id: "hist-002", patientId: "pat-001", section: "Allergy", condition: "Penicillin allergy", onset: "2020", status: "Verified", severity: "Critical", notes: "Breathing discomfort; visible before prescriptions and exports.", sourceEncounter: "OPD-5261", verified: true, sensitivity: "Sensitive" },
  { id: "hist-003", patientId: "pat-002", section: "Surgical", condition: "Forearm fracture stabilization", onset: "May 2026", status: "Active", severity: "Medium", notes: "Orthopedic follow-up and radiology attachment pending.", sourceEncounter: "IPD-1188", verified: true, sensitivity: "Normal" },
  { id: "hist-004", patientId: "pat-003", section: "Family", condition: "Asthma family tendency", onset: "Childhood", status: "Unverified", severity: "Medium", notes: "Guardian confirmation pending.", sourceEncounter: "OPD-5198", verified: false, sensitivity: "Consent-gated placeholder" },
  { id: "hist-005", patientId: "pat-003", section: "Social", condition: "School exposure to dust", onset: "2026", status: "Unverified", severity: "Low", notes: "Sensitive social history requires reason placeholder.", sourceEncounter: "OPD-5198", verified: false, sensitivity: "Restricted" },
  { id: "hist-006", patientId: "pat-004", section: "Past medical", condition: "Unknown history", onset: "Unknown", status: "Unverified", severity: "Critical", notes: "Emergency identity incomplete, break-glass placeholder only.", sourceEncounter: "ER-0098", verified: false, sensitivity: "Break-glass placeholder" },
];

export const mockProgressNotes: ProgressNote[] = [
  { id: "note-001", patientId: "pat-001", encounterId: "enc-001", noteType: "OPD note", author: "Dr. Kavita Rao", department: "Cardiology", createdAt: "Today 10:22", status: "Completed", signatureStatus: "Pending", internalOnly: false, summary: "Chest discomfort improving, advised lipid profile and BP review.", fullNote: "Patient reports exertional chest discomfort for 2 days. Vitals reviewed. Continue medication and review lab reports.", addendumHistory: "No addendum added.", version: "v1 current" },
  { id: "note-002", patientId: "pat-002", encounterId: "enc-003", noteType: "Doctor round note", author: "Dr. Aman Verma", department: "Orthopedics", createdAt: "Today 11:20", status: "Addendum placeholder", signatureStatus: "Signed placeholder", internalOnly: false, summary: "Pain improving, continue observation.", fullNote: "Pain reassessment done. Mobility restricted. Radiology follow-up advised.", addendumHistory: "Addendum added for pain score correction; original note preserved.", version: "v2 addendum" },
  { id: "note-003", patientId: "pat-004", encounterId: "enc-004", noteType: "Emergency note", author: "Emergency Desk", department: "Emergency", createdAt: "Today 10:50", status: "Legal hold placeholder", signatureStatus: "Pending", internalOnly: true, summary: "Critical stabilization and medico-legal note.", fullNote: "Unknown patient, unconscious on arrival. Restricted internal note hidden from patient-facing print by default.", addendumHistory: "Legal hold blocks archive/export placeholders.", version: "v1 legal hold" },
  { id: "note-004", patientId: "pat-003", encounterId: "enc-005", noteType: "Addendum", author: "Dr. Neha Malik", department: "Pediatrics", createdAt: "Yesterday 17:05", status: "Revised placeholder", signatureStatus: "Rejected placeholder", internalOnly: false, summary: "Guardian dose instruction corrected.", fullNote: "Pediatric inhaler instruction revised after guardian discussion.", addendumHistory: "Revision reason captured. Previous version remains read-only.", version: "v3 revised" },
  { id: "note-005", patientId: "pat-002", encounterId: "enc-006", noteType: "Referral note placeholder", author: "Radiology Desk", department: "Radiology", createdAt: "Today 10:30", status: "Superseded placeholder", signatureStatus: "Expired certificate placeholder", internalOnly: true, summary: "Radiology review superseded by current report placeholder.", fullNote: "Certificate expired, cannot sign until provider integration exists.", addendumHistory: "Superseded note linked to current version placeholder.", version: "v1 previous" },
];

export const mockClinicalAttachments: ClinicalAttachment[] = [
  { id: "att-001", patientId: "pat-001", encounterId: "enc-001", name: "Cardiology prescription preview", category: "Prescription", uploadedBy: "Dr. Kavita Rao", uploadedAt: "Today 10:30", verificationStatus: "Verified", signatureStatus: "Pending", sensitivity: "Sensitive", previewAvailable: true, retentionStatus: "7 year retention placeholder", legalHold: false },
  { id: "att-002", patientId: "pat-001", encounterId: "enc-002", name: "CBC sample request", category: "Lab report placeholder", uploadedBy: "Lab worklist", uploadedAt: "Today 10:06", verificationStatus: "Pending verification", signatureStatus: "Not required", sensitivity: "Consent-gated placeholder", previewAvailable: false, retentionStatus: "Pending approval retention", legalHold: false },
  { id: "att-003", patientId: "pat-002", encounterId: "enc-003", name: "IPD admission summary", category: "IPD attachment", uploadedBy: "Nurse station", uploadedAt: "Today 08:45", verificationStatus: "Uploaded", signatureStatus: "Signed placeholder", sensitivity: "Normal", previewAvailable: true, retentionStatus: "Clinical permanent placeholder", legalHold: false },
  { id: "att-004", patientId: "pat-004", encounterId: "enc-004", name: "Emergency intake note", category: "Emergency attachment", uploadedBy: "Emergency Desk", uploadedAt: "Today 10:25", verificationStatus: "Rejected", signatureStatus: "Pending", sensitivity: "Break-glass placeholder", previewAvailable: false, retentionStatus: "Legal hold active", legalHold: true },
  { id: "att-005", patientId: "pat-003", encounterId: "enc-005", name: "Guardian consent scan", category: "Consent", uploadedBy: "Reception", uploadedAt: "Yesterday 16:30", verificationStatus: "Pending verification", signatureStatus: "Rejected placeholder", sensitivity: "Consent-gated placeholder", previewAvailable: true, retentionStatus: "Guardian consent retention", legalHold: false },
  { id: "att-006", patientId: "pat-002", encounterId: "enc-006", name: "Forearm X-ray image set", category: "Radiology report placeholder", uploadedBy: "Radiology Desk", uploadedAt: "Today 10:15", verificationStatus: "Archived", signatureStatus: "Expired certificate placeholder", sensitivity: "Restricted", previewAvailable: false, retentionStatus: "Legal hold blocks archive/download", legalHold: true },
];

export const mockDigitalSignatures: DigitalSignatureRecord[] = [
  { id: "sig-001", documentId: "att-001", documentName: "Cardiology prescription preview", patientId: "pat-001", encounterId: "enc-001", requestedBy: "Nurse station", signer: "Dr. Kavita Rao", requestedAt: "Today 10:31", status: "Pending", certificateStatus: "Valid placeholder", reason: "Encounter completion requires doctor signature placeholder." },
  { id: "sig-002", documentId: "att-003", documentName: "IPD admission summary", patientId: "pat-002", encounterId: "enc-003", requestedBy: "Hospital Admin", signer: "Dr. Aman Verma", requestedAt: "Today 09:05", status: "Signed placeholder", certificateStatus: "Valid placeholder", reason: "Read-only signed document preview." },
  { id: "sig-003", documentId: "att-005", documentName: "Guardian consent scan", patientId: "pat-003", encounterId: "enc-005", requestedBy: "Reception", signer: "Guardian placeholder", requestedAt: "Yesterday 16:35", status: "Rejected placeholder", certificateStatus: "Pending enrollment placeholder", reason: "Guardian signature mismatch placeholder." },
  { id: "sig-004", documentId: "att-006", documentName: "Forearm X-ray image set", patientId: "pat-002", encounterId: "enc-006", requestedBy: "Radiology Desk", signer: "Radiologist placeholder", requestedAt: "Today 10:16", status: "Expired certificate placeholder", certificateStatus: "Expired placeholder", reason: "Signing disabled until certificate is renewed." },
  { id: "sig-005", documentId: "att-002", documentName: "CBC sample request", patientId: "pat-001", encounterId: "enc-002", requestedBy: "Lab worklist", signer: "Not applicable", requestedAt: "Today 10:06", status: "Not required", certificateStatus: "Not required", reason: "Operational placeholder document." },
];

export const mockClinicalTimeline: ClinicalTimelineEvent[] = [
  { id: "tl-001", patientId: "pat-001", encounterId: "enc-001", eventType: "Registration", title: "Patient checked in", summary: "Cardiology follow-up appointment checked in with VIP and allergy alerts.", occurredAt: "Today 09:40", department: "Front Office", provider: "Reception", status: "Completed", sensitivity: "Normal", versionContext: "Current encounter opened", category: "Operational" },
  { id: "tl-002", patientId: "pat-001", encounterId: "enc-001", eventType: "Vitals", title: "Vitals recorded", summary: "BP 148/92, pulse 94, abnormal flag visible in EHR.", occurredAt: "Today 09:34", department: "Cardiology", provider: "Nurse station", status: "Completed", sensitivity: "Sensitive", versionContext: "Current vitals record", category: "Clinical" },
  { id: "tl-003", patientId: "pat-001", encounterId: "enc-001", eventType: "Prescription", title: "Prescription prepared", summary: "Aspirin and atorvastatin with allergy/drug interaction warnings.", occurredAt: "Today 10:25", department: "Cardiology", provider: "Dr. Kavita Rao", status: "Pending", sensitivity: "Sensitive", versionContext: "Signature pending", category: "Clinical" },
  { id: "tl-004", patientId: "pat-002", encounterId: "enc-003", eventType: "Admission", title: "Orthopedic admission", summary: "Post-fracture stabilization admitted to Ortho Ward.", occurredAt: "Today 08:20", department: "Orthopedics", provider: "Dr. Aman Verma", status: "Addendum placeholder", sensitivity: "Normal", versionContext: "Addendum v2", category: "Clinical" },
  { id: "tl-005", patientId: "pat-002", encounterId: "enc-006", eventType: "Radiology placeholder", title: "X-ray report superseded", summary: "Previous radiology note superseded by current placeholder version.", occurredAt: "Today 10:30", department: "Radiology", provider: "Radiology Desk", status: "Superseded placeholder", sensitivity: "Restricted", versionContext: "Previous version read-only", category: "Governance" },
  { id: "tl-006", patientId: "pat-004", encounterId: "enc-004", eventType: "Emergency registration", title: "Unknown emergency created", summary: "Temporary UHID created with medico-legal and break-glass placeholders.", occurredAt: "Today 10:12", department: "Emergency", provider: "Emergency Desk", status: "Legal hold placeholder", sensitivity: "Break-glass placeholder", versionContext: "Legal hold active", category: "Governance" },
  { id: "tl-007", patientId: "pat-004", encounterId: "enc-004", eventType: "Triage", title: "Red priority triage", summary: "Critical vitals; transfer to ICU placeholder.", occurredAt: "Today 10:25", department: "Emergency", provider: "Triage nurse", status: "Completed", sensitivity: "Break-glass placeholder", versionContext: "Current critical event", category: "Clinical" },
  { id: "tl-008", patientId: "pat-003", encounterId: "enc-005", eventType: "Consent", title: "Guardian consent pending", summary: "Consent-gated EHR export and signature placeholder visible.", occurredAt: "Yesterday 16:30", department: "Pediatrics", provider: "Reception", status: "Pending verification", sensitivity: "Consent-gated placeholder", versionContext: "Consent required", category: "Governance" },
];

export const mockRecordAccessAudit: RecordAccessAudit[] = [
  { id: "audit-001", patientId: "pat-001", recordId: "enc-001", recordType: "Encounter", user: "Dr. Kavita Rao", role: "Doctor", action: "Viewed EMR", reason: "Active consultation", sensitivity: "Sensitive", ipAddress: "10.20.1.42", device: "Desktop OPD-03", timestamp: "Today 10:02", outcome: "Allowed" },
  { id: "audit-002", patientId: "pat-004", recordId: "enc-004", recordType: "Emergency note", user: "Emergency Desk", role: "Doctor", action: "Break-glass view placeholder", reason: "Critical stabilization", sensitivity: "Break-glass placeholder", ipAddress: "10.30.4.12", device: "ER workstation", timestamp: "Today 10:15", outcome: "Reason required placeholder" },
  { id: "audit-003", patientId: "pat-002", recordId: "att-006", recordType: "Radiology attachment", user: "Radiology Desk", role: "Radiologist", action: "Viewed previous version", reason: "Report correction", sensitivity: "Restricted", ipAddress: "10.40.6.22", device: "Radiology terminal", timestamp: "Today 10:32", outcome: "Masked" },
  { id: "audit-004", patientId: "pat-003", recordId: "disc-003", recordType: "Disclosure request", user: "Reception", role: "Receptionist", action: "Export package requested", reason: "Guardian request", sensitivity: "Consent-gated placeholder", ipAddress: "10.20.2.31", device: "Front desk", timestamp: "Yesterday 17:10", outcome: "Denied placeholder" },
  { id: "audit-005", patientId: "pat-001", recordId: "sig-001", recordType: "Signature", user: "Nurse station", role: "Nurse", action: "Requested signature", reason: "Encounter completion", sensitivity: "Sensitive", ipAddress: "10.20.1.55", device: "Nurse station", timestamp: "Today 10:31", outcome: "Allowed" },
];

export const mockRecordVersions: RecordVersion[] = [
  { id: "ver-001", patientId: "pat-001", recordId: "note-001", recordName: "Cardiology OPD note", recordType: "Progress note", encounterId: "enc-001", version: "v1", state: "Current", author: "Dr. Kavita Rao", updatedAt: "Today 10:22", reason: "Original completed note", currentVersionId: "ver-001", legalHold: false },
  { id: "ver-002", patientId: "pat-002", recordId: "note-002", recordName: "Orthopedic round note", recordType: "Progress note", encounterId: "enc-003", version: "v2", state: "Addendum", author: "Dr. Aman Verma", updatedAt: "Today 11:25", reason: "Pain score corrected with addendum", currentVersionId: "ver-002", legalHold: false },
  { id: "ver-003", patientId: "pat-002", recordId: "note-005", recordName: "Radiology review note", recordType: "Radiology placeholder", encounterId: "enc-006", version: "v1", state: "Superseded", author: "Radiology Desk", updatedAt: "Today 10:30", reason: "Superseded by current report placeholder", currentVersionId: "ver-004", legalHold: true },
  { id: "ver-004", patientId: "pat-004", recordId: "note-003", recordName: "Emergency medico-legal note", recordType: "Emergency note", encounterId: "enc-004", version: "v1", state: "Current", author: "Emergency Desk", updatedAt: "Today 10:50", reason: "Legal hold applied", currentVersionId: "ver-004", legalHold: true },
  { id: "ver-005", patientId: "pat-003", recordId: "note-004", recordName: "Pediatric teleconsult addendum", recordType: "Addendum", encounterId: "enc-005", version: "v3", state: "Previous", author: "Dr. Neha Malik", updatedAt: "Yesterday 17:05", reason: "Guardian instruction revised", currentVersionId: "ver-006", legalHold: false },
];

export const mockDisclosureRequests: DisclosureRequest[] = [
  { id: "disc-001", requestNo: "DSC-2026-014", patientId: "pat-001", recipient: "Insurance TPA placeholder", purpose: "Claim review", recordScope: "OPD summary, prescription, lab request", consentStatus: "Available", approvalStatus: "Approval pending", requestedBy: "Billing Executive", requestedAt: "Today 10:45", reason: "Package generation is disabled in Phase 7." },
  { id: "disc-002", requestNo: "DSC-2026-015", patientId: "pat-002", recipient: "Orthopedic referral clinic", purpose: "Referral continuity", recordScope: "IPD summary and radiology placeholder", consentStatus: "Consent required", approvalStatus: "Consent required", requestedBy: "Dr. Aman Verma", requestedAt: "Today 11:40", reason: "Restricted radiology attachment requires reason and approval." },
  { id: "disc-003", requestNo: "DSC-2026-016", patientId: "pat-003", recipient: "Guardian email placeholder", purpose: "School medical certificate", recordScope: "EHR summary and vaccination history", consentStatus: "Consent required", approvalStatus: "Rejected placeholder", requestedBy: "Reception", requestedAt: "Yesterday 17:10", reason: "Guardian consent mismatch." },
  { id: "disc-004", requestNo: "DSC-2026-017", patientId: "pat-004", recipient: "Police medico-legal desk placeholder", purpose: "Medico-legal request", recordScope: "Emergency record only", consentStatus: "Not applicable", approvalStatus: "Approved placeholder", requestedBy: "Emergency Desk", requestedAt: "Today 10:55", reason: "Legal hold blocks destructive or casual export actions." },
];

export const mockRetentionPolicies = [
  { id: "ret-001", recordType: "Prescription", retention: "7 years", archiveAllowed: "After retention and signature complete" },
  { id: "ret-002", recordType: "Emergency medico-legal", retention: "Permanent placeholder", archiveAllowed: "Blocked during legal hold" },
  { id: "ret-003", recordType: "Consent", retention: "Linked to active consent lifecycle", archiveAllowed: "Requires reason" },
];

export function getEmrEncountersByPatient(patientId: string) {
  return mockEmrEncounters.filter((encounter) => encounter.patientId === patientId);
}

export function getEmrEncounterById(encounterId: string) {
  return mockEmrEncounters.find((encounter) => encounter.id === encounterId);
}
