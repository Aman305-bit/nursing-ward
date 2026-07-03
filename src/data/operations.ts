import type {
  AssetRecord,
  DispenseItem,
  GrnRecord,
  InstrumentSet,
  OtRoomCleaning,
  OtSurgery,
  PharmacyPrescription,
  PurchaseOrder,
  PurchaseRequest,
  StockAuditRecord,
  StockBatch,
  StockItem,
  StockTransfer,
  SurgicalCount,
  SterilizationCycle,
  VendorRecord,
} from "@/types";

export const mockPharmacyPrescriptions: PharmacyPrescription[] = [
  { id: "pp-001", prescriptionNo: "RX-OPD-5261", patientId: "pat-001", source: "OPD", doctor: "Dr. Kavita Rao", department: "Cardiology", status: "Pending", medicineCount: 2, allergyAlert: "Penicillin allergy, aspirin bleeding risk placeholder", stockStatus: "In stock", priority: "Urgent", createdAt: "Today 10:25" },
  { id: "pp-002", prescriptionNo: "RX-IPD-1188", patientId: "pat-002", source: "IPD", doctor: "Dr. Aman Verma", department: "Orthopedics", status: "Partially dispensed", medicineCount: 3, allergyAlert: "No active allergy", stockStatus: "Low stock", priority: "Routine", createdAt: "Today 12:00" },
  { id: "pp-003", prescriptionNo: "RX-ER-0098", patientId: "pat-004", source: "Emergency", doctor: "Emergency Desk", department: "Emergency", status: "On hold", medicineCount: 2, allergyAlert: "Unknown identity; controlled medicine authorization pending", stockStatus: "Critical stock", priority: "Controlled medicine placeholder", createdAt: "Today 10:42" },
  { id: "pp-004", prescriptionNo: "RX-PED-5198", patientId: "pat-003", source: "OPD", doctor: "Dr. Neha Malik", department: "Pediatrics", status: "Substitution requested placeholder", medicineCount: 1, allergyAlert: "Pediatric dose caution", stockStatus: "Near expiry", priority: "Routine", createdAt: "Yesterday 17:00" },
];

export const mockDispenseItems: DispenseItem[] = [
  { id: "di-001", prescriptionId: "pp-001", medicine: "Aspirin 75 mg", dose: "OD after food", requestedQty: 30, availableQty: 120, batchNo: "ASP-B24", expiryDate: "Dec 2026", dispenseQty: 30, substitutionStatus: "Not required", alerts: ["Bleeding risk placeholder"] },
  { id: "di-002", prescriptionId: "pp-001", medicine: "Atorvastatin 20 mg", dose: "HS", requestedQty: 30, availableQty: 12, batchNo: "ATO-C11", expiryDate: "Aug 2026", dispenseQty: 12, substitutionStatus: "Not required", alerts: ["Partial dispense reason required"] },
  { id: "di-003", prescriptionId: "pp-003", medicine: "Morphine injection placeholder", dose: "Emergency protocol", requestedQty: 2, availableQty: 1, batchNo: "MOR-CTRL", expiryDate: "Jun 2026", dispenseQty: 0, substitutionStatus: "Requested placeholder", alerts: ["Controlled medicine register", "Authorization required"] },
  { id: "di-004", prescriptionId: "pp-004", medicine: "Salbutamol inhaler", dose: "2 puffs SOS", requestedQty: 1, availableQty: 4, batchNo: "SAL-NX1", expiryDate: "Near expiry", dispenseQty: 1, substitutionStatus: "Approved placeholder", alerts: ["Guardian acknowledgement"] },
];

export const mockStockItems: StockItem[] = [
  { id: "si-001", itemCode: "MED-ASP75", name: "Aspirin 75 mg", genericName: "Acetylsalicylic acid", category: "Medicine", unit: "Tablet", stock: 120, reorderLevel: 50, criticalLevel: 20, nearExpiry: 0, expired: 0, status: "In stock" },
  { id: "si-002", itemCode: "MED-ATO20", name: "Atorvastatin 20 mg", genericName: "Atorvastatin", category: "Medicine", unit: "Tablet", stock: 12, reorderLevel: 40, criticalLevel: 15, nearExpiry: 8, expired: 0, status: "Critical stock" },
  { id: "si-003", itemCode: "MED-SALINH", name: "Salbutamol inhaler", genericName: "Salbutamol", category: "Medicine", unit: "Inhaler", stock: 4, reorderLevel: 20, criticalLevel: 6, nearExpiry: 4, expired: 0, status: "Near expiry" },
  { id: "si-004", itemCode: "CONS-SUT2", name: "Suture 2-0", genericName: "Surgical suture", category: "Surgical", unit: "Pack", stock: 46, reorderLevel: 30, criticalLevel: 10, nearExpiry: 0, expired: 2, status: "Quarantined" },
  { id: "si-005", itemCode: "IMP-PLATE", name: "Ortho plate implant", genericName: "Titanium plate", category: "Implant", unit: "Piece", stock: 8, reorderLevel: 5, criticalLevel: 2, nearExpiry: 0, expired: 0, status: "Reserved" },
];

export const mockStockBatches: StockBatch[] = [
  { id: "sb-001", itemId: "si-001", batchNo: "ASP-B24", vendorId: "ven-001", receivedAt: "05 May 2026", expiryDate: "Dec 2026", quantity: 200, saleableQuantity: 120, quarantinedQuantity: 0, status: "In stock" },
  { id: "sb-002", itemId: "si-002", batchNo: "ATO-C11", vendorId: "ven-001", receivedAt: "12 Apr 2026", expiryDate: "Aug 2026", quantity: 80, saleableQuantity: 12, quarantinedQuantity: 0, status: "Critical stock" },
  { id: "sb-003", itemId: "si-003", batchNo: "SAL-NX1", vendorId: "ven-002", receivedAt: "20 Mar 2026", expiryDate: "Jun 2026", quantity: 30, saleableQuantity: 4, quarantinedQuantity: 0, status: "Near expiry" },
  { id: "sb-004", itemId: "si-004", batchNo: "SUT-Q19", vendorId: "ven-003", receivedAt: "18 Jan 2026", expiryDate: "Expired", quantity: 60, saleableQuantity: 0, quarantinedQuantity: 14, status: "Expired" },
];

export const mockVendors: VendorRecord[] = [
  { id: "ven-001", vendorName: "Medline Pharma Supply", code: "VEN-PH-001", contact: "purchases@medline.example", category: "Pharmacy", rating: "A placeholder", lastPurchase: "12 Apr 2026", status: "Active" },
  { id: "ven-002", vendorName: "Care Respiratory Devices", code: "VEN-RD-004", contact: "+91 90000 44210", category: "Pharmacy", rating: "B placeholder", lastPurchase: "20 Mar 2026", status: "Review" },
  { id: "ven-003", vendorName: "Sterile Surgical Stores", code: "VEN-SS-009", contact: "store@sterile.example", category: "Surgical", rating: "Hold", lastPurchase: "18 Jan 2026", status: "On hold" },
  { id: "ven-004", vendorName: "Biomedical Assets Co", code: "VEN-EQ-002", contact: "assets@example.com", category: "Equipment", rating: "A placeholder", lastPurchase: "01 May 2026", status: "Active" },
];

export const mockPurchaseRequests: PurchaseRequest[] = [
  { id: "pr-001", requestNo: "PR-2026-101", department: "Pharmacy", items: ["Atorvastatin 20 mg", "Salbutamol inhaler"], requestedBy: "Pharmacist", priority: "Critical", status: "Requested", requestedAt: "Today 11:30" },
  { id: "pr-002", requestNo: "PR-2026-102", department: "OT", items: ["Suture 2-0", "Ortho plate implant"], requestedBy: "OT Coordinator", priority: "Urgent", status: "Approved placeholder", requestedAt: "Today 09:20" },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: "po-001", poNo: "PO-2026-441", vendorId: "ven-001", items: ["Atorvastatin 20 mg x 500"], expectedDate: "24 May 2026", amount: "₹42,000", status: "Ordered" },
  { id: "po-002", poNo: "PO-2026-442", vendorId: "ven-003", items: ["Suture 2-0 x 100"], expectedDate: "26 May 2026", amount: "₹18,500", status: "Partially received" },
];

export const mockStockAudits: StockAuditRecord[] = [
  { id: "aud-001", itemId: "si-002", location: "Pharmacy Store", systemStock: 12, physicalStock: 10, variance: -2, status: "Approval pending", reason: "Dispense counter variance placeholder" },
  { id: "aud-002", itemId: "si-004", location: "Central Store", systemStock: 46, physicalStock: 44, variance: -2, status: "Variance found", reason: "Quarantine inspection pending" },
];

export const mockGrns: GrnRecord[] = [
  { id: "grn-001", grnNo: "GRN-7710", poId: "po-002", vendorId: "ven-003", receivedAt: "Today 08:40", items: ["Suture 2-0 x 60"], qualityStatus: "Damaged", ledgerStatus: "Variance hold" },
  { id: "grn-002", grnNo: "GRN-7711", poId: "po-001", vendorId: "ven-001", receivedAt: "Expected 24 May", items: ["Atorvastatin 20 mg x 500"], qualityStatus: "Pending QC", ledgerStatus: "Pending posting" },
];

export const mockStockTransfers: StockTransfer[] = [
  { id: "st-001", transferNo: "TR-2210", fromLocation: "Central Store", toLocation: "Pharmacy", items: ["Atorvastatin 20 mg x 100"], requestedBy: "Pharmacist", status: "In transit", custody: "Requested > approved > issued", variance: "None" },
  { id: "st-002", transferNo: "TR-2214", fromLocation: "Central Store", toLocation: "OT Store", items: ["Suture 2-0 x 20"], requestedBy: "OT Coordinator", status: "Partially received", custody: "Issue received with shortage placeholder", variance: "2 packs short" },
];

export const mockAssets: AssetRecord[] = [
  { id: "as-001", assetCode: "AS-INF-001", name: "Infusion pump", category: "Biomedical", assignedTo: "ICU", location: "ICU-01", maintenanceStatus: "Due", status: "Assigned" },
  { id: "as-002", assetCode: "AS-OTL-004", name: "OT light", category: "OT equipment", assignedTo: "OT Room 2", location: "OT", maintenanceStatus: "Active", status: "Assigned" },
];

export const mockSurgeries: OtSurgery[] = [
  { id: "sg-001", patientId: "pat-002", admissionId: "adm-001", procedure: "Forearm fixation review", surgeon: "Dr. Aman Verma", anesthetist: "Dr. Iyer", otRoom: "OT-2", scheduledAt: "Today 14:00", status: "Scheduled", consentStatus: "Signed", instrumentStatus: "Sterilized", checklistStatus: "Pending", surgicalCountStatus: "Pending" },
  { id: "sg-002", patientId: "pat-004", admissionId: "adm-003", procedure: "Emergency wound exploration placeholder", surgeon: "Emergency surgeon", anesthetist: "Dr. Iyer", otRoom: "OT-E", scheduledAt: "Today 12:30", status: "Delayed", consentStatus: "Missing", instrumentStatus: "Sterilization pending", checklistStatus: "Pending", surgicalCountStatus: "Pending" },
  { id: "sg-003", patientId: "pat-003", admissionId: "adm-004", procedure: "Pediatric bronchoscopy placeholder", surgeon: "Dr. Neha Malik", anesthetist: "Dr. Rao", otRoom: "OT-1", scheduledAt: "Yesterday 18:10", status: "Completed", consentStatus: "Pending guardian", instrumentStatus: "Used", checklistStatus: "Complete", surgicalCountStatus: "Mismatch" },
];

export const mockSurgicalCounts: SurgicalCount[] = [
  { id: "cnt-001", surgeryId: "sg-001", countType: "Sponge", expectedCount: 20, actualCount: 20, status: "Matched", verifiedBy: "Scrub nurse", verifiedAt: "Pending final" },
  { id: "cnt-002", surgeryId: "sg-003", countType: "Needle", expectedCount: 8, actualCount: 7, status: "Mismatch", verifiedBy: "Scrub nurse", verifiedAt: "Yesterday 19:05" },
  { id: "cnt-003", surgeryId: "sg-002", countType: "Instrument", expectedCount: 34, actualCount: 0, status: "Pending", verifiedBy: "Pending", verifiedAt: "Pending" },
];

export const mockInstrumentSets: InstrumentSet[] = [
  { id: "ins-001", setCode: "OT-ORTHO-A", name: "Ortho major set", sterilizationStatus: "Sterilized", sterilizationCycleId: "cy-001", sterilizationExpiryAt: "Today 23:59", currentLocation: "OT sterile store", assignedSurgeryId: "sg-001", missingItems: 0, damagedItems: 0, status: "Available" },
  { id: "ins-002", setCode: "OT-EMG-B", name: "Emergency minor set", sterilizationStatus: "Sterilization pending", sterilizationCycleId: "cy-002", sterilizationExpiryAt: "Pending", currentLocation: "CSSD", assignedSurgeryId: "sg-002", missingItems: 0, damagedItems: 1, status: "Damaged" },
  { id: "ins-003", setCode: "OT-PED-C", name: "Pediatric scope set", sterilizationStatus: "Used", sterilizationCycleId: "cy-003", sterilizationExpiryAt: "Expired", currentLocation: "Cleaning", assignedSurgeryId: "sg-003", missingItems: 1, damagedItems: 0, status: "Missing" },
];

export const mockSterilizationCycles: SterilizationCycle[] = [
  { id: "cy-001", cycleNo: "CSSD-8891", machinePlaceholder: "Autoclave A", startedAt: "Today 07:30", completedAt: "Today 08:15", indicatorResult: "Passed placeholder", status: "Sterilized", failedReason: "" },
  { id: "cy-002", cycleNo: "CSSD-8892", machinePlaceholder: "Autoclave B", startedAt: "Today 09:10", completedAt: "Pending", indicatorResult: "Pending", status: "Sterilization pending", failedReason: "" },
  { id: "cy-003", cycleNo: "CSSD-8880", machinePlaceholder: "Autoclave A", startedAt: "Yesterday 15:00", completedAt: "Yesterday 15:45", indicatorResult: "Failed", status: "Quarantined", failedReason: "Chemical indicator failed placeholder" },
];

export const mockOtRoomCleaning: OtRoomCleaning[] = [
  { id: "clean-001", room: "OT-1", status: "Cleaning due", responsibleStaff: "Housekeeping OT", completedAt: "Pending after previous case", infectionRisk: "Respiratory caution", releaseStatus: "Pending" },
  { id: "clean-002", room: "OT-2", status: "Ready", responsibleStaff: "Housekeeping OT", completedAt: "Today 09:30", infectionRisk: "None", releaseStatus: "Ready" },
  { id: "clean-003", room: "OT-E", status: "Failed checklist", responsibleStaff: "Infection control nurse", completedAt: "Today 10:45", infectionRisk: "Unknown emergency isolation risk", releaseStatus: "Override required" },
];

export const mockDrugAlerts = [
  { id: "da-001", patientId: "pat-001", prescriptionId: "pp-001", alertType: "Allergy", severity: "Critical", message: "Penicillin allergy from clinical record remains visible before dispense.", acknowledgement: "Required" },
  { id: "da-002", patientId: "pat-004", prescriptionId: "pp-003", alertType: "Controlled medicine", severity: "Critical", message: "Controlled medicine authorization and register entry placeholder required.", acknowledgement: "Required" },
  { id: "da-003", patientId: "pat-003", prescriptionId: "pp-004", alertType: "Near expiry", severity: "Warning", message: "Selected inhaler batch is near expiry; acknowledgement placeholder.", acknowledgement: "Recommended" },
];

export const mockPharmacyBills = [
  { id: "pb-001", billNo: "PH-BILL-1001", prescriptionId: "pp-001", patientId: "pat-001", amount: "₹1,240", paymentStatus: "Invoice draft placeholder", returnStatus: "None" },
  { id: "pb-002", billNo: "PH-BILL-1002", prescriptionId: "pp-002", patientId: "pat-002", amount: "₹780", paymentStatus: "Payment pending", returnStatus: "Inspection pending placeholder" },
];

export const mockOtBilling = [
  { id: "otb-001", surgeryId: "sg-001", roomCharges: "₹8,000", surgeonCharges: "₹12,000", anesthesiaCharges: "₹5,500", consumables: "Suture 2-0, implant plate", packageLink: "Ortho package placeholder", billingStatus: "Draft" },
  { id: "otb-002", surgeryId: "sg-002", roomCharges: "₹10,000", surgeonCharges: "Emergency placeholder", anesthesiaCharges: "Pending", consumables: "Emergency minor set", packageLink: "Emergency billing placeholder", billingStatus: "Pending" },
];

export function getStockItemById(itemId: string) {
  return mockStockItems.find((item) => item.id === itemId);
}

export function getVendorById(vendorId: string) {
  return mockVendors.find((vendor) => vendor.id === vendorId);
}

export function getSurgeryById(surgeryId: string) {
  return mockSurgeries.find((surgery) => surgery.id === surgeryId);
}
