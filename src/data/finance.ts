import type {
  AdvanceRecord,
  BankEntry,
  BillingPackage,
  BillingRecord,
  BillingTariff,
  BillLine,
  CashCounterRecord,
  ClaimRecord,
  ClaimRejection,
  ClaimSettlement,
  CreditBill,
  DiscountRequest,
  ExpenseRecord,
  FinanceLedgerEntry,
  InsuranceCompany,
  InvoiceRecord,
  PatientPolicy,
  PaymentRecord,
  PreauthorizationRecord,
  ReceiptRecord,
  RefundRecord,
  TpaRecord,
} from "@/types";

export const mockBillingRecords: BillingRecord[] = [
  { id: "bill-001", billNo: "BILL-OPD-1001", patientId: "pat-001", visitId: "visit-001", admissionId: "", source: "OPD", department: "Cardiology", payerType: "Self", grossAmount: 5400, discountAmount: 400, taxAmount: 250, netAmount: 5250, paidAmount: 3000, dueAmount: 2250, status: "Partially paid", createdAt: "Today 10:45" },
  { id: "bill-002", billNo: "BILL-IPD-1188", patientId: "pat-002", visitId: "visit-003", admissionId: "adm-001", source: "IPD", department: "Orthopedics", payerType: "Insurance", grossAmount: 84500, discountAmount: 2500, taxAmount: 4100, netAmount: 86100, paidAmount: 15000, dueAmount: 71100, status: "Ready to bill", createdAt: "Today 12:05" },
  { id: "bill-003", billNo: "BILL-ER-0098", patientId: "pat-004", visitId: "visit-004", admissionId: "adm-003", source: "Emergency", department: "Emergency", payerType: "TPA", grossAmount: 32800, discountAmount: 0, taxAmount: 1640, netAmount: 34440, paidAmount: 0, dueAmount: 34440, status: "Pending", createdAt: "Today 10:58" },
  { id: "bill-004", billNo: "BILL-PH-1001", patientId: "pat-001", visitId: "visit-001", admissionId: "", source: "Pharmacy", department: "Pharmacy", payerType: "Self", grossAmount: 1240, discountAmount: 0, taxAmount: 62, netAmount: 1302, paidAmount: 1302, dueAmount: 0, status: "Paid", createdAt: "Today 11:10" },
  { id: "bill-005", billNo: "BILL-OT-2001", patientId: "pat-002", visitId: "visit-003", admissionId: "adm-001", source: "OT", department: "Operation Theatre", payerType: "Package", grossAmount: 37500, discountAmount: 0, taxAmount: 1875, netAmount: 39375, paidAmount: 0, dueAmount: 39375, status: "Overdue", createdAt: "Today 15:20" },
];

export const mockBillLines: BillLine[] = [
  { id: "bl-001", billId: "bill-001", serviceCode: "CONS-CARD", serviceName: "Cardiology consultation", source: "OPD", tariffId: "tar-001", department: "Cardiology", doctor: "Dr. Kavita Rao", quantity: 1, rate: 1200, discountAmount: 0, taxAmount: 60, amount: 1260, status: "Billable" },
  { id: "bl-002", billId: "bill-001", serviceCode: "LAB-LIPID", serviceName: "Lipid profile", source: "Lab", tariffId: "tar-004", department: "Biochemistry", doctor: "Lab worklist", quantity: 1, rate: 900, discountAmount: 0, taxAmount: 45, amount: 945, status: "Billable" },
  { id: "bl-003", billId: "bill-002", serviceCode: "BED-ORTHO", serviceName: "Ortho ward bed", source: "IPD", tariffId: "tar-002", department: "Orthopedics", doctor: "Dr. Aman Verma", quantity: 2, rate: 4500, discountAmount: 500, taxAmount: 425, amount: 8925, status: "Package included" },
  { id: "bl-004", billId: "bill-003", serviceCode: "ER-ICU", serviceName: "Emergency ICU observation", source: "Emergency", tariffId: "tar-003", department: "Emergency", doctor: "Emergency Desk", quantity: 1, rate: 4500, discountAmount: 0, taxAmount: 225, amount: 4725, status: "Approval required" },
  { id: "bl-005", billId: "bill-005", serviceCode: "OT-ROOM", serviceName: "OT room charges", source: "OT", tariffId: "tar-005", department: "Operation Theatre", doctor: "Dr. Aman Verma", quantity: 1, rate: 8000, discountAmount: 0, taxAmount: 400, amount: 8400, status: "Billable" },
];

export const mockBillingTariffs: BillingTariff[] = [
  { id: "tar-001", serviceCode: "CONS-CARD", serviceName: "Cardiology consultation", department: "Cardiology", category: "Consultation", baseRate: 1200, payerRate: 1000, taxRule: "GST exempt placeholder", effectiveFrom: "01 Apr 2026", effectiveTo: "31 Mar 2027", overrideApprovalRequired: true, status: "Active" },
  { id: "tar-002", serviceCode: "BED-ORTHO", serviceName: "Ortho ward bed", department: "Orthopedics", category: "Bed charge", baseRate: 4500, payerRate: 4000, taxRule: "GST 5% placeholder", effectiveFrom: "01 Apr 2026", effectiveTo: "31 Mar 2027", overrideApprovalRequired: false, status: "Active" },
  { id: "tar-003", serviceCode: "ER-ICU", serviceName: "Emergency ICU observation", department: "Emergency", category: "Emergency", baseRate: 4500, payerRate: 4300, taxRule: "GST 5% placeholder", effectiveFrom: "01 Apr 2026", effectiveTo: "31 Mar 2027", overrideApprovalRequired: true, status: "Active" },
  { id: "tar-004", serviceCode: "LAB-LIPID", serviceName: "Lipid profile", department: "Biochemistry", category: "Diagnostic", baseRate: 900, payerRate: 850, taxRule: "GST 5% placeholder", effectiveFrom: "01 Apr 2026", effectiveTo: "31 Mar 2027", overrideApprovalRequired: false, status: "Future effective" },
  { id: "tar-005", serviceCode: "OT-ROOM", serviceName: "OT room charges", department: "Operation Theatre", category: "OT", baseRate: 8000, payerRate: 7500, taxRule: "GST 5% placeholder", effectiveFrom: "01 Apr 2026", effectiveTo: "31 Mar 2027", overrideApprovalRequired: true, status: "Active" },
];

export const mockInvoices: InvoiceRecord[] = [
  { id: "inv-001", invoiceNo: "INV-2026-1001", billId: "bill-001", patientId: "pat-001", payerId: "SELF", invoiceDate: "Today", grossAmount: 5400, discountAmount: 400, taxAmount: 250, netAmount: 5250, status: "Partially paid" },
  { id: "inv-002", invoiceNo: "INV-2026-1002", billId: "bill-004", patientId: "pat-001", payerId: "SELF", invoiceDate: "Today", grossAmount: 1240, discountAmount: 0, taxAmount: 62, netAmount: 1302, status: "Paid" },
  { id: "inv-003", invoiceNo: "INV-2026-1003", billId: "bill-002", patientId: "pat-002", payerId: "ins-001", invoiceDate: "Draft", grossAmount: 84500, discountAmount: 2500, taxAmount: 4100, netAmount: 86100, status: "Draft" },
  { id: "inv-004", invoiceNo: "INV-2026-1004", billId: "bill-005", patientId: "pat-002", payerId: "PKG-ORTHO", invoiceDate: "Today", grossAmount: 37500, discountAmount: 0, taxAmount: 1875, netAmount: 39375, status: "Credit note placeholder" },
];

export const mockPayments: PaymentRecord[] = [
  { id: "pay-001", receiptNo: "RCT-2001", invoiceId: "inv-001", patientId: "pat-001", paymentMode: "UPI placeholder", amount: 3000, status: "Received", collectedBy: "Cashier 1", collectedAt: "Today 11:00" },
  { id: "pay-002", receiptNo: "RCT-2002", invoiceId: "inv-002", patientId: "pat-001", paymentMode: "Cash", amount: 1302, status: "Received", collectedBy: "Cashier 1", collectedAt: "Today 11:12" },
  { id: "pay-003", receiptNo: "RCT-2003", invoiceId: "inv-003", patientId: "pat-002", paymentMode: "Advance adjustment", amount: 15000, status: "Split payment", collectedBy: "Billing Executive", collectedAt: "Today 12:20" },
  { id: "pay-004", receiptNo: "RCT-2004", invoiceId: "inv-004", patientId: "pat-002", paymentMode: "Card placeholder", amount: 0, status: "Failed placeholder", collectedBy: "Cashier 2", collectedAt: "Today 15:30" },
];

export const mockReceipts: ReceiptRecord[] = [
  { id: "rct-001", receiptNo: "RCT-2001", paymentId: "pay-001", invoiceId: "inv-001", patientId: "pat-001", amount: 3000, printStatus: "Printed", deliveryMode: "Counter print", status: "Received", issuedBy: "Cashier 1", issuedAt: "Today 11:01" },
  { id: "rct-002", receiptNo: "RCT-2002", paymentId: "pay-002", invoiceId: "inv-002", patientId: "pat-001", amount: 1302, printStatus: "Ready to print", deliveryMode: "Email placeholder", status: "Received", issuedBy: "Cashier 1", issuedAt: "Today 11:13" },
  { id: "rct-003", receiptNo: "RCT-2003", paymentId: "pay-003", invoiceId: "inv-003", patientId: "pat-002", amount: 15000, printStatus: "Reprint requires audit", deliveryMode: "Patient portal placeholder", status: "Split payment", issuedBy: "Billing Executive", issuedAt: "Today 12:22" },
  { id: "rct-004", receiptNo: "RCT-2004", paymentId: "pay-004", invoiceId: "inv-004", patientId: "pat-002", amount: 0, printStatus: "Cancelled placeholder", deliveryMode: "WhatsApp placeholder", status: "Failed placeholder", issuedBy: "Cashier 2", issuedAt: "Today 15:31" },
];

export const mockRefunds: RefundRecord[] = [
  { id: "ref-001", refundNo: "RF-301", paymentId: "pay-001", invoiceId: "inv-001", patientId: "pat-001", requestedAmount: 500, eligibleAmount: 400, reason: "Duplicate manual service placeholder", status: "Under review", approvedBy: "Billing Manager placeholder" },
  { id: "ref-002", refundNo: "RF-302", paymentId: "pay-002", invoiceId: "inv-002", patientId: "pat-001", requestedAmount: 250, eligibleAmount: 250, reason: "Medicine return inspection pending", status: "Approved", approvedBy: "Billing Manager placeholder" },
];

export const mockDiscountRequests: DiscountRequest[] = [
  { id: "disc-001", requestNo: "DISC-901", billId: "bill-001", patientId: "pat-001", requestedAmount: 400, reason: "Management approved concession placeholder", approver: "Hospital Admin", status: "Applied" },
  { id: "disc-002", requestNo: "DISC-902", billId: "bill-002", patientId: "pat-002", requestedAmount: 2500, reason: "Package-linked discount approval pending", approver: "Billing Manager placeholder", status: "Requested" },
];

export const mockAdvances: AdvanceRecord[] = [
  { id: "adv-001", advanceNo: "ADV-551", patientId: "pat-002", source: "IPD deposit", amount: 25000, adjustedAmount: 15000, balanceAmount: 10000, status: "Partially adjusted" },
  { id: "adv-002", advanceNo: "ADV-552", patientId: "pat-004", source: "Package deposit", amount: 10000, adjustedAmount: 0, balanceAmount: 10000, status: "On hold" },
];

export const mockCreditBills: CreditBill[] = [
  { id: "cr-001", creditNo: "CR-441", patientId: "pat-002", company: "Metro Corporate Health", invoiceId: "inv-003", outstandingAmount: 71100, agingDays: 0, status: "Open" },
  { id: "cr-002", creditNo: "CR-442", patientId: "pat-004", company: "Emergency TPA placeholder", invoiceId: "inv-004", outstandingAmount: 34440, agingDays: 9, status: "Overdue" },
];

export const mockBillingPackages: BillingPackage[] = [
  { id: "pkg-bill-001", packageNo: "PKG-BILL-1188", patientId: "pat-002", admissionId: "adm-001", packageName: "Ortho stabilization package", limitAmount: 90000, utilizedAmount: 86100, overageAmount: 0, status: "Partially utilized" },
  { id: "pkg-bill-002", packageNo: "PKG-BILL-0098", patientId: "pat-004", admissionId: "adm-003", packageName: "Emergency ICU observation", limitAmount: 30000, utilizedAmount: 34440, overageAmount: 4440, status: "Over limit" },
];

export const mockFinanceLedgers: FinanceLedgerEntry[] = [
  { id: "led-001", ledgerNo: "LED-PAT-001", ledgerType: "Patient", party: "Meera Joshi", debit: 5250, credit: 3000, balance: 2250, status: "Posted placeholder", postedAt: "Today 11:05" },
  { id: "led-002", ledgerNo: "LED-INS-001", ledgerType: "Payer", party: "Apex Health Insurance", debit: 71100, credit: 0, balance: 71100, status: "Draft", postedAt: "Pending claim" },
  { id: "led-003", ledgerNo: "LED-CASH-001", ledgerType: "Cash counter", party: "Counter 1", debit: 0, credit: 4302, balance: 4302, status: "Reconciled placeholder", postedAt: "Today 18:00" },
];

export const mockExpenses: ExpenseRecord[] = [
  { id: "exp-001", expenseNo: "EXP-771", category: "Vendor payment", vendorId: "ven-001", amount: 42000, approvalStatus: "Pending approval", paymentStatus: "Pending", requestedAt: "Today 14:30" },
  { id: "exp-002", expenseNo: "EXP-772", category: "OT maintenance", vendorId: "ven-004", amount: 18500, approvalStatus: "Approved", paymentStatus: "Received", requestedAt: "Yesterday" },
];

export const mockCashCounters: CashCounterRecord[] = [
  { id: "cash-001", counterNo: "CNT-1", cashier: "Cashier 1", openedAt: "Today 08:00", closedAt: "Open", openingBalance: 5000, cashCollected: 4302, refundPaid: 0, handoverAmount: 9302, variance: 0, status: "Open" },
  { id: "cash-002", counterNo: "CNT-2", cashier: "Cashier 2", openedAt: "Today 08:00", closedAt: "Today 17:20", openingBalance: 5000, cashCollected: 0, refundPaid: 250, handoverAmount: 4700, variance: -50, status: "Variance" },
];

export const mockBankEntries: BankEntry[] = [
  { id: "bank-001", bankRef: "UPI-8891", paymentId: "pay-001", amount: 3000, bankDate: "Today", matchStatus: "Matched", notes: "Auto match placeholder" },
  { id: "bank-002", bankRef: "CARD-0044", paymentId: "pay-004", amount: 0, bankDate: "Today", matchStatus: "Unmatched", notes: "Failed card payment placeholder" },
];

export const mockInsuranceCompanies: InsuranceCompany[] = [
  { id: "ins-001", name: "Apex Health Insurance", code: "INS-APX", contractStatus: "Active", tariff: "Apex 2026 payer tariff", contact: "claims@apex.example" },
  { id: "ins-002", name: "CareShield Insurance", code: "INS-CARE", contractStatus: "Expiring", tariff: "CareShield negotiated tariff", contact: "support@careshield.example" },
];

export const mockTpas: TpaRecord[] = [
  { id: "tpa-001", name: "MediAssist TPA placeholder", code: "TPA-MA", linkedInsurers: ["ins-001"], contractStatus: "Active", contact: "preauth@mediassist.example" },
  { id: "tpa-002", name: "HealthBridge TPA", code: "TPA-HB", linkedInsurers: ["ins-002"], contractStatus: "Blocked placeholder", contact: "claims@healthbridge.example" },
];

export const mockPatientPolicies: PatientPolicy[] = [
  { id: "pol-001", patientId: "pat-002", insuranceCompanyId: "ins-001", tpaId: "tpa-001", policyNo: "POL-APX-8821", policyHolder: "Arjun Kapoor", validFrom: "01 Jan 2026", validTo: "31 Dec 2026", coverageLimit: 300000, coPayPercent: 10, documentStatus: "Verified", status: "Eligible" },
  { id: "pol-002", patientId: "pat-004", insuranceCompanyId: "ins-002", tpaId: "tpa-002", policyNo: "Unknown emergency placeholder", policyHolder: "Unknown", validFrom: "Pending", validTo: "Pending", coverageLimit: 0, coPayPercent: 0, documentStatus: "Pending", status: "Eligibility pending" },
];

export const mockPreauthorizations: PreauthorizationRecord[] = [
  { id: "pre-001", preauthNo: "PA-6610", patientId: "pat-002", admissionId: "adm-001", policyId: "pol-001", requestedAmount: 90000, approvedAmount: 75000, queryStatus: "No query", documentStatus: "Complete", status: "Preauthorization approved" },
  { id: "pre-002", preauthNo: "PA-6611", patientId: "pat-004", admissionId: "adm-003", policyId: "pol-002", requestedAmount: 45000, approvedAmount: 0, queryStatus: "Query raised", documentStatus: "Missing", status: "Preauthorization submitted" },
];

export const mockClaims: ClaimRecord[] = [
  { id: "clm-001", claimNo: "CLM-7710", patientId: "pat-002", invoiceId: "inv-003", preauthId: "pre-001", payerId: "ins-001", claimAmount: 86100, submittedAmount: 82000, approvedAmount: 75000, status: "Claim submitted", agingDays: 1 },
  { id: "clm-002", claimNo: "CLM-7711", patientId: "pat-004", invoiceId: "inv-004", preauthId: "pre-002", payerId: "tpa-002", claimAmount: 34440, submittedAmount: 30000, approvedAmount: 0, status: "Rejected", agingDays: 6 },
];

export const mockClaimSettlements: ClaimSettlement[] = [
  { id: "set-001", settlementNo: "SET-2201", claimId: "clm-001", approvedAmount: 75000, receivedAmount: 70000, deductionAmount: 5000, shortfallAmount: 5000, reason: "Non-payable implant line placeholder", status: "Short settled" },
  { id: "set-002", settlementNo: "SET-2202", claimId: "clm-002", approvedAmount: 0, receivedAmount: 0, deductionAmount: 30000, shortfallAmount: 30000, reason: "Documents missing", status: "Rejected" },
];

export const mockClaimRejections: ClaimRejection[] = [
  { id: "rej-001", claimId: "clm-002", rejectionReason: "Policy eligibility and identity documents missing", correctionChecklist: ["Upload ID proof", "Attach emergency summary", "Respond to TPA query"], resubmissionStatus: "Query raised", closedAt: "Open" },
  { id: "rej-002", claimId: "clm-001", rejectionReason: "Implant invoice clarification", correctionChecklist: ["Attach implant batch invoice", "Map package exclusion"], resubmissionStatus: "Resubmitted", closedAt: "Pending settlement" },
];

export const mockGstSummaries = [
  { id: "gst-001", taxRule: "GST 5% placeholder", taxableAmount: 102500, taxAmount: 5125, invoices: 4, status: "Draft" },
  { id: "gst-002", taxRule: "GST exempt placeholder", taxableAmount: 5800, taxAmount: 0, invoices: 2, status: "Posted placeholder" },
];

export const mockRevenueSummaries = [
  { id: "rev-001", dimension: "Department", name: "Orthopedics", revenue: 86100, collections: 15000, outstanding: 71100 },
  { id: "rev-002", dimension: "Payment mode", name: "UPI", revenue: 3000, collections: 3000, outstanding: 0 },
  { id: "rev-003", dimension: "Payer", name: "Insurance", revenue: 86100, collections: 0, outstanding: 86100 },
];

export function getBillById(billId: string) {
  return mockBillingRecords.find((bill) => bill.id === billId);
}

export function getInvoiceById(invoiceId: string) {
  return mockInvoices.find((invoice) => invoice.id === invoiceId);
}

export function getPolicyById(policyId: string) {
  return mockPatientPolicies.find((policy) => policy.id === policyId);
}
