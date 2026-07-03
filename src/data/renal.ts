export type RenalStatus = "Stable" | "AKI watch" | "Fluid overload" | "Critical" | "Dialysis review";
export type RenalAlertSeverity = "Info" | "Warning" | "Critical";
export type RenalEntryStatus = "Entered" | "Pending review" | "Corrected placeholder" | "Signed";

export type RenalPatientChart = {
  id: string;
  patientId: string;
  admissionId: string;
  bedNo: string;
  ward: string;
  consultant: string;
  nephrologist: string;
  windowLabel: string;
  shiftLabel: string;
  weightKg: number;
  fluidRestrictionMl: number;
  renalStatus: RenalStatus;
  catheterStatus: string;
  dialysisStatus: string;
  lastReviewedAt: string;
  cumulativeBalanceMl: number;
  targetBalanceMl: number;
  riskFlags: string[];
};

export type RenalIntakeEntry = {
  id: string;
  patientId: string;
  timeRange: string;
  ivFluidsMl: number;
  oralIntakeMl: number;
  medicationsFlushMl: number;
  bloodProductsMl: number;
  enteredBy: string;
  status: RenalEntryStatus;
};

export type RenalOutputEntry = {
  id: string;
  patientId: string;
  timeRange: string;
  urineOutputMl: number;
  drainsOutputMl: number;
  stoolOtherMl: number;
  insensibleLossMl: number;
  enteredBy: string;
  status: RenalEntryStatus;
};

export type RenalHourlyUrine = {
  id: string;
  patientId: string;
  timeRange: string;
  perHourMl: number;
  runningTotalMl: number;
  mlPerKgHr: number;
  status: "Adequate" | "Watch" | "Low";
};

export type RenalDrainRecord = {
  id: string;
  patientId: string;
  drainName: string;
  site: string;
  deviceStatus: "Active" | "Clamp trial" | "Removed placeholder";
  currentShiftMl: number;
  total24HrMl: number;
  character: string;
  lastCheckedAt: string;
  concern: "None" | "High output" | "Blockage watch" | "Infection watch";
};

export type RenalLabRecord = {
  id: string;
  patientId: string;
  collectedAt: string;
  creatinine: string;
  urea: string;
  sodium: string;
  potassium: string;
  egfr: string;
  urineProtein: string;
  flag: "Normal" | "Watch" | "Critical";
  trend: "Improving" | "Stable" | "Worsening";
};

export type RenalAlert = {
  id: string;
  patientId: string;
  severity: RenalAlertSeverity;
  title: string;
  metric: string;
  threshold: string;
  owner: string;
  status: "Open" | "Acknowledged" | "Escalated";
};

export type RenalOrder = {
  id: string;
  patientId: string;
  order: string;
  target: string;
  orderedBy: string;
  orderedAt: string;
  status: "Active" | "Pending sign" | "Completed";
};

export type DialysisSession = {
  id: string;
  patientId: string;
  sessionNo: string;
  modality: "Hemodialysis" | "CRRT placeholder" | "SLED placeholder";
  scheduledAt: string;
  accessSite: string;
  ufTargetMl: number;
  ufRemovedMl: number;
  preWeightKg: number;
  postWeightKg: number;
  status: "Scheduled" | "In progress" | "Completed" | "Billing pending";
};

export const mockRenalCharts: RenalPatientChart[] = [
  {
    id: "renal-001",
    patientId: "pat-002",
    admissionId: "adm-001",
    bedNo: "OW-204",
    ward: "Ortho Ward",
    consultant: "Dr. Aman Verma",
    nephrologist: "Dr. Mohan Ahluvia",
    windowLabel: "24 May 2026, 10:30 AM - 25 May 2026, 10:30 AM",
    shiftLabel: "Morning shift",
    weightKg: 72,
    fluidRestrictionMl: 1800,
    renalStatus: "AKI watch",
    catheterStatus: "Foley active, day 2",
    dialysisStatus: "Not on dialysis",
    lastReviewedAt: "Today 10:30",
    cumulativeBalanceMl: 3250,
    targetBalanceMl: 500,
    riskFlags: ["Positive balance", "Creatinine watch", "Foley active"],
  },
  {
    id: "renal-002",
    patientId: "pat-004",
    admissionId: "adm-003",
    bedNo: "ICU-01",
    ward: "ICU",
    consultant: "Emergency Desk",
    nephrologist: "Dr. Ritu Menon",
    windowLabel: "25 May 2026, 06:00 AM - 26 May 2026, 06:00 AM",
    shiftLabel: "ICU continuous charting",
    weightKg: 68,
    fluidRestrictionMl: 1500,
    renalStatus: "Critical",
    catheterStatus: "Foley active, hourly watch",
    dialysisStatus: "Dialysis review",
    lastReviewedAt: "Today 10:55",
    cumulativeBalanceMl: 4120,
    targetBalanceMl: 0,
    riskFlags: ["Low UOP", "Fluid overload", "Dialysis review"],
  },
  {
    id: "renal-003",
    patientId: "pat-001",
    admissionId: "adm-002",
    bedNo: "CW-305",
    ward: "Cardiac Ward",
    consultant: "Dr. Kavita Rao",
    nephrologist: "Not assigned",
    windowLabel: "25 May 2026, 08:00 AM - 26 May 2026, 08:00 AM",
    shiftLabel: "Observation",
    weightKg: 64,
    fluidRestrictionMl: 2200,
    renalStatus: "Stable",
    catheterStatus: "No catheter",
    dialysisStatus: "Not required",
    lastReviewedAt: "Today 11:10",
    cumulativeBalanceMl: 240,
    targetBalanceMl: 750,
    riskFlags: ["Cardiac observation"],
  },
];

export const mockRenalIntakeEntries: RenalIntakeEntry[] = [
  { id: "rin-001", patientId: "pat-002", timeRange: "10:30 AM - 11:30 AM", ivFluidsMl: 200, oralIntakeMl: 60, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Nisha Thomas", status: "Signed" },
  { id: "rin-002", patientId: "pat-002", timeRange: "11:30 AM - 12:30 PM", ivFluidsMl: 200, oralIntakeMl: 50, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Nisha Thomas", status: "Signed" },
  { id: "rin-003", patientId: "pat-002", timeRange: "12:30 PM - 01:30 PM", ivFluidsMl: 150, oralIntakeMl: 70, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Nisha Thomas", status: "Signed" },
  { id: "rin-004", patientId: "pat-002", timeRange: "01:30 PM - 02:30 PM", ivFluidsMl: 200, oralIntakeMl: 60, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rin-005", patientId: "pat-002", timeRange: "02:30 PM - 03:30 PM", ivFluidsMl: 200, oralIntakeMl: 70, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rin-006", patientId: "pat-002", timeRange: "03:30 PM - 04:30 PM", ivFluidsMl: 200, oralIntakeMl: 70, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rin-007", patientId: "pat-002", timeRange: "04:30 PM - 05:30 PM", ivFluidsMl: 200, oralIntakeMl: 70, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rin-008", patientId: "pat-002", timeRange: "05:30 PM - 06:30 PM", ivFluidsMl: 200, oralIntakeMl: 70, medicationsFlushMl: 30, bloodProductsMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rin-009", patientId: "pat-002", timeRange: "06:30 PM - 07:30 PM", ivFluidsMl: 200, oralIntakeMl: 60, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rin-010", patientId: "pat-002", timeRange: "07:30 PM - 08:30 PM", ivFluidsMl: 200, oralIntakeMl: 60, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rin-011", patientId: "pat-002", timeRange: "08:30 PM - 09:30 PM", ivFluidsMl: 200, oralIntakeMl: 60, medicationsFlushMl: 20, bloodProductsMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rin-012", patientId: "pat-002", timeRange: "09:30 PM - 10:30 PM", ivFluidsMl: 300, oralIntakeMl: 150, medicationsFlushMl: 30, bloodProductsMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rin-013", patientId: "pat-004", timeRange: "06:00 AM - 07:00 AM", ivFluidsMl: 300, oralIntakeMl: 0, medicationsFlushMl: 40, bloodProductsMl: 0, enteredBy: "ICU nurse", status: "Entered" },
  { id: "rin-014", patientId: "pat-004", timeRange: "07:00 AM - 08:00 AM", ivFluidsMl: 250, oralIntakeMl: 0, medicationsFlushMl: 30, bloodProductsMl: 0, enteredBy: "ICU nurse", status: "Entered" },
  { id: "rin-015", patientId: "pat-004", timeRange: "08:00 AM - 09:00 AM", ivFluidsMl: 250, oralIntakeMl: 0, medicationsFlushMl: 30, bloodProductsMl: 350, enteredBy: "ICU nurse", status: "Pending review" },
  { id: "rin-016", patientId: "pat-001", timeRange: "08:00 AM - 09:00 AM", ivFluidsMl: 100, oralIntakeMl: 220, medicationsFlushMl: 0, bloodProductsMl: 0, enteredBy: "Cardiac nurse", status: "Signed" },
  { id: "rin-017", patientId: "pat-001", timeRange: "09:00 AM - 10:00 AM", ivFluidsMl: 100, oralIntakeMl: 180, medicationsFlushMl: 10, bloodProductsMl: 0, enteredBy: "Cardiac nurse", status: "Signed" },
];

export const mockRenalOutputEntries: RenalOutputEntry[] = [
  { id: "rout-001", patientId: "pat-002", timeRange: "10:30 AM - 11:30 AM", urineOutputMl: 160, drainsOutputMl: 40, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Nisha Thomas", status: "Signed" },
  { id: "rout-002", patientId: "pat-002", timeRange: "11:30 AM - 12:30 PM", urineOutputMl: 120, drainsOutputMl: 50, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Nisha Thomas", status: "Signed" },
  { id: "rout-003", patientId: "pat-002", timeRange: "12:30 PM - 01:30 PM", urineOutputMl: 130, drainsOutputMl: 40, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Nisha Thomas", status: "Signed" },
  { id: "rout-004", patientId: "pat-002", timeRange: "01:30 PM - 02:30 PM", urineOutputMl: 140, drainsOutputMl: 60, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rout-005", patientId: "pat-002", timeRange: "02:30 PM - 03:30 PM", urineOutputMl: 155, drainsOutputMl: 70, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rout-006", patientId: "pat-002", timeRange: "03:30 PM - 04:30 PM", urineOutputMl: 160, drainsOutputMl: 80, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rout-007", patientId: "pat-002", timeRange: "04:30 PM - 05:30 PM", urineOutputMl: 165, drainsOutputMl: 90, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rout-008", patientId: "pat-002", timeRange: "05:30 PM - 06:30 PM", urineOutputMl: 170, drainsOutputMl: 100, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Ritu Sharma", status: "Entered" },
  { id: "rout-009", patientId: "pat-002", timeRange: "06:30 PM - 07:30 PM", urineOutputMl: 160, drainsOutputMl: 120, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rout-010", patientId: "pat-002", timeRange: "07:30 PM - 08:30 PM", urineOutputMl: 160, drainsOutputMl: 130, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rout-011", patientId: "pat-002", timeRange: "08:30 PM - 09:30 PM", urineOutputMl: 155, drainsOutputMl: 170, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rout-012", patientId: "pat-002", timeRange: "09:30 PM - 10:30 PM", urineOutputMl: 175, drainsOutputMl: 200, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Night nurse", status: "Pending review" },
  { id: "rout-013", patientId: "pat-004", timeRange: "06:00 AM - 07:00 AM", urineOutputMl: 25, drainsOutputMl: 120, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "ICU nurse", status: "Entered" },
  { id: "rout-014", patientId: "pat-004", timeRange: "07:00 AM - 08:00 AM", urineOutputMl: 20, drainsOutputMl: 135, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "ICU nurse", status: "Entered" },
  { id: "rout-015", patientId: "pat-004", timeRange: "08:00 AM - 09:00 AM", urineOutputMl: 18, drainsOutputMl: 150, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "ICU nurse", status: "Pending review" },
  { id: "rout-016", patientId: "pat-001", timeRange: "08:00 AM - 09:00 AM", urineOutputMl: 210, drainsOutputMl: 0, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Cardiac nurse", status: "Signed" },
  { id: "rout-017", patientId: "pat-001", timeRange: "09:00 AM - 10:00 AM", urineOutputMl: 190, drainsOutputMl: 0, stoolOtherMl: 0, insensibleLossMl: 0, enteredBy: "Cardiac nurse", status: "Signed" },
];

export const mockRenalHourlyUrine: RenalHourlyUrine[] = [
  { id: "ru-001", patientId: "pat-002", timeRange: "10:30 PM - 11:30 PM", perHourMl: 80, runningTotalMl: 80, mlPerKgHr: 1.1, status: "Adequate" },
  { id: "ru-002", patientId: "pat-002", timeRange: "11:30 PM - 12:30 AM", perHourMl: 70, runningTotalMl: 150, mlPerKgHr: 1, status: "Adequate" },
  { id: "ru-003", patientId: "pat-002", timeRange: "12:30 AM - 01:30 AM", perHourMl: 60, runningTotalMl: 210, mlPerKgHr: 0.8, status: "Adequate" },
  { id: "ru-004", patientId: "pat-002", timeRange: "01:30 AM - 02:30 AM", perHourMl: 50, runningTotalMl: 260, mlPerKgHr: 0.7, status: "Watch" },
  { id: "ru-005", patientId: "pat-002", timeRange: "02:30 AM - 03:30 AM", perHourMl: 60, runningTotalMl: 320, mlPerKgHr: 0.8, status: "Adequate" },
  { id: "ru-006", patientId: "pat-002", timeRange: "03:30 AM - 04:30 AM", perHourMl: 70, runningTotalMl: 390, mlPerKgHr: 1, status: "Adequate" },
  { id: "ru-007", patientId: "pat-002", timeRange: "04:30 AM - 05:30 AM", perHourMl: 80, runningTotalMl: 470, mlPerKgHr: 1.1, status: "Adequate" },
  { id: "ru-008", patientId: "pat-002", timeRange: "05:30 AM - 06:30 AM", perHourMl: 90, runningTotalMl: 560, mlPerKgHr: 1.3, status: "Adequate" },
  { id: "ru-009", patientId: "pat-002", timeRange: "06:30 AM - 07:30 AM", perHourMl: 100, runningTotalMl: 660, mlPerKgHr: 1.4, status: "Adequate" },
  { id: "ru-010", patientId: "pat-002", timeRange: "07:30 AM - 08:30 AM", perHourMl: 80, runningTotalMl: 740, mlPerKgHr: 1.1, status: "Adequate" },
  { id: "ru-011", patientId: "pat-002", timeRange: "08:30 AM - 09:30 AM", perHourMl: 60, runningTotalMl: 800, mlPerKgHr: 0.8, status: "Adequate" },
  { id: "ru-012", patientId: "pat-002", timeRange: "09:30 AM - 10:30 AM", perHourMl: 40, runningTotalMl: 840, mlPerKgHr: 0.6, status: "Watch" },
  { id: "ru-013", patientId: "pat-004", timeRange: "06:00 AM - 07:00 AM", perHourMl: 25, runningTotalMl: 25, mlPerKgHr: 0.4, status: "Low" },
  { id: "ru-014", patientId: "pat-004", timeRange: "07:00 AM - 08:00 AM", perHourMl: 20, runningTotalMl: 45, mlPerKgHr: 0.3, status: "Low" },
  { id: "ru-015", patientId: "pat-004", timeRange: "08:00 AM - 09:00 AM", perHourMl: 18, runningTotalMl: 63, mlPerKgHr: 0.3, status: "Low" },
];

export const mockRenalDrains: RenalDrainRecord[] = [
  { id: "rd-001", patientId: "pat-002", drainName: "Abdominal drain right", site: "Right lower abdomen", deviceStatus: "Active", currentShiftMl: 280, total24HrMl: 280, character: "Serous", lastCheckedAt: "Today 10:20", concern: "None" },
  { id: "rd-002", patientId: "pat-002", drainName: "Abdominal drain left", site: "Left lower abdomen", deviceStatus: "Active", currentShiftMl: 180, total24HrMl: 180, character: "Serosanguinous", lastCheckedAt: "Today 10:20", concern: "None" },
  { id: "rd-003", patientId: "pat-002", drainName: "Chest drain right", site: "Right chest", deviceStatus: "Active", currentShiftMl: 300, total24HrMl: 300, character: "Serous", lastCheckedAt: "Today 09:50", concern: "High output" },
  { id: "rd-004", patientId: "pat-002", drainName: "Chest drain left", site: "Left chest", deviceStatus: "Clamp trial", currentShiftMl: 150, total24HrMl: 150, character: "Clear", lastCheckedAt: "Today 09:40", concern: "Blockage watch" },
  { id: "rd-005", patientId: "pat-002", drainName: "NG tube output", site: "NG tube", deviceStatus: "Active", currentShiftMl: 120, total24HrMl: 120, character: "Bilious", lastCheckedAt: "Today 09:30", concern: "None" },
  { id: "rd-006", patientId: "pat-002", drainName: "Gastrostomy output", site: "Gastrostomy", deviceStatus: "Active", currentShiftMl: 80, total24HrMl: 80, character: "Clear", lastCheckedAt: "Today 09:15", concern: "None" },
  { id: "rd-007", patientId: "pat-002", drainName: "Flexi seal", site: "Rectal tube", deviceStatus: "Active", currentShiftMl: 70, total24HrMl: 70, character: "Liquid stool", lastCheckedAt: "Today 09:10", concern: "None" },
  { id: "rd-008", patientId: "pat-002", drainName: "Pericardial drain", site: "Pericardial", deviceStatus: "Removed placeholder", currentShiftMl: 0, total24HrMl: 0, character: "Nil", lastCheckedAt: "Yesterday 18:00", concern: "None" },
  { id: "rd-009", patientId: "pat-004", drainName: "NG tube output", site: "NG tube", deviceStatus: "Active", currentShiftMl: 210, total24HrMl: 480, character: "Coffee-ground watch", lastCheckedAt: "Today 10:45", concern: "High output" },
  { id: "rd-010", patientId: "pat-004", drainName: "Chest drain", site: "Right chest", deviceStatus: "Active", currentShiftMl: 195, total24HrMl: 430, character: "Serosanguinous", lastCheckedAt: "Today 10:50", concern: "Infection watch" },
];

export const mockRenalLabs: RenalLabRecord[] = [
  { id: "rlab-001", patientId: "pat-002", collectedAt: "Today 06:00", creatinine: "1.8 mg/dl", urea: "58 mg/dl", sodium: "136 mmol/L", potassium: "4.9 mmol/L", egfr: "48", urineProtein: "Trace", flag: "Watch", trend: "Stable" },
  { id: "rlab-005", patientId: "pat-002", collectedAt: "Today 12:00", creatinine: "1.9 mg/dl", urea: "62 mg/dl", sodium: "135 mmol/L", potassium: "5.1 mmol/L", egfr: "46", urineProtein: "+", flag: "Watch", trend: "Worsening" },
  { id: "rlab-006", patientId: "pat-002", collectedAt: "Yesterday 18:00", creatinine: "1.7 mg/dl", urea: "55 mg/dl", sodium: "136 mmol/L", potassium: "4.8 mmol/L", egfr: "51", urineProtein: "Trace", flag: "Watch", trend: "Stable" },
  { id: "rlab-002", patientId: "pat-002", collectedAt: "Yesterday 06:00", creatinine: "1.6 mg/dl", urea: "52 mg/dl", sodium: "137 mmol/L", potassium: "4.7 mmol/L", egfr: "54", urineProtein: "Trace", flag: "Watch", trend: "Worsening" },
  { id: "rlab-003", patientId: "pat-004", collectedAt: "Today 10:40", creatinine: "3.2 mg/dl", urea: "96 mg/dl", sodium: "132 mmol/L", potassium: "6.1 mmol/L", egfr: "22", urineProtein: "++", flag: "Critical", trend: "Worsening" },
  { id: "rlab-004", patientId: "pat-001", collectedAt: "Today 08:30", creatinine: "0.9 mg/dl", urea: "28 mg/dl", sodium: "139 mmol/L", potassium: "4.2 mmol/L", egfr: "92", urineProtein: "Nil", flag: "Normal", trend: "Stable" },
];

export const mockRenalAlerts: RenalAlert[] = [
  { id: "ralert-001", patientId: "pat-002", severity: "Warning", title: "Positive balance above target", metric: "+560 ml in 24h", threshold: "Target +500 ml", owner: "Doctor", status: "Open" },
  { id: "ralert-002", patientId: "pat-002", severity: "Warning", title: "Chest drain high output", metric: "300 ml", threshold: "Review >250 ml", owner: "Nurse", status: "Acknowledged" },
  { id: "ralert-003", patientId: "pat-004", severity: "Critical", title: "Low urine output", metric: "0.3 ml/kg/hr", threshold: "<0.5 ml/kg/hr", owner: "ICU Doctor", status: "Escalated" },
  { id: "ralert-004", patientId: "pat-004", severity: "Critical", title: "Potassium critical", metric: "6.1 mmol/L", threshold: ">6.0 mmol/L", owner: "Doctor", status: "Open" },
  { id: "ralert-005", patientId: "pat-001", severity: "Info", title: "Renal status stable", metric: "Creatinine 0.9", threshold: "Within range", owner: "Nurse", status: "Acknowledged" },
];

export const mockRenalOrders: RenalOrder[] = [
  { id: "rord-001", patientId: "pat-002", order: "Fluid restriction", target: "1800 ml / 24h", orderedBy: "Dr. Mohan Ahluvia", orderedAt: "Today 08:45", status: "Active" },
  { id: "rord-002", patientId: "pat-002", order: "Hourly urine output", target: "Escalate if <40 ml/hr", orderedBy: "Dr. Aman Verma", orderedAt: "Today 09:00", status: "Active" },
  { id: "rord-005", patientId: "pat-002", order: "Repeat RFT + electrolytes", target: "Next sample at 18:00", orderedBy: "Dr. Mohan Ahluvia", orderedAt: "Today 12:10", status: "Pending sign" },
  { id: "rord-006", patientId: "pat-002", order: "Strict intake source tagging", target: "Separate IV, oral, flush, blood products", orderedBy: "Dr. Aman Verma", orderedAt: "Today 12:20", status: "Active" },
  { id: "rord-007", patientId: "pat-002", order: "Potassium watch", target: "Notify if K+ >= 5.5 mmol/L", orderedBy: "Dr. Mohan Ahluvia", orderedAt: "Today 12:25", status: "Active" },
  { id: "rord-003", patientId: "pat-004", order: "Dialysis review", target: "Nephrology bedside review", orderedBy: "Emergency Desk", orderedAt: "Today 10:52", status: "Pending sign" },
  { id: "rord-004", patientId: "pat-004", order: "Hyperkalemia protocol", target: "Repeat potassium after intervention", orderedBy: "Dr. Ritu Menon", orderedAt: "Today 10:56", status: "Active" },
];

export const mockDialysisSessions: DialysisSession[] = [
  { id: "dia-001", patientId: "pat-004", sessionNo: "DIA-2026-041", modality: "Hemodialysis", scheduledAt: "Today 13:00", accessSite: "Right IJ catheter", ufTargetMl: 1800, ufRemovedMl: 0, preWeightKg: 68.2, postWeightKg: 0, status: "Scheduled" },
  { id: "dia-002", patientId: "pat-002", sessionNo: "DIA-2026-039", modality: "SLED placeholder", scheduledAt: "Yesterday 19:00", accessSite: "Not applicable", ufTargetMl: 0, ufRemovedMl: 0, preWeightKg: 72, postWeightKg: 72, status: "Billing pending" },
];

export const mockRenalBalanceTrend = [
  { time: "10:30", intake: 280, output: 200, balance: 80 },
  { time: "12:30", intake: 550, output: 370, balance: 180 },
  { time: "14:30", intake: 1060, output: 770, balance: 290 },
  { time: "16:30", intake: 1640, output: 1255, balance: 385 },
  { time: "18:30", intake: 2210, output: 1805, balance: 405 },
  { time: "20:30", intake: 2770, output: 2370, balance: 400 },
  { time: "22:30", intake: 3560, output: 3000, balance: 560 },
];

export function getRenalChartByPatient(patientId: string) {
  return mockRenalCharts.find((chart) => chart.patientId === patientId);
}

export function getRenalIntakeByPatient(patientId: string) {
  return mockRenalIntakeEntries.filter((entry) => entry.patientId === patientId);
}

export function getRenalOutputByPatient(patientId: string) {
  return mockRenalOutputEntries.filter((entry) => entry.patientId === patientId);
}

export function getRenalHourlyUrineByPatient(patientId: string) {
  return mockRenalHourlyUrine.filter((entry) => entry.patientId === patientId);
}

export function getRenalDrainsByPatient(patientId: string) {
  return mockRenalDrains.filter((drain) => drain.patientId === patientId);
}

export function getRenalLabsByPatient(patientId: string) {
  return mockRenalLabs.filter((lab) => lab.patientId === patientId);
}

export function getRenalAlertsByPatient(patientId: string) {
  return mockRenalAlerts.filter((alert) => alert.patientId === patientId);
}

export function getRenalOrdersByPatient(patientId: string) {
  return mockRenalOrders.filter((order) => order.patientId === patientId);
}

export function getDialysisSessionsByPatient(patientId: string) {
  return mockDialysisSessions.filter((session) => session.patientId === patientId);
}

export function totalIntake(entry: Pick<RenalIntakeEntry, "ivFluidsMl" | "oralIntakeMl" | "medicationsFlushMl" | "bloodProductsMl">) {
  return entry.ivFluidsMl + entry.oralIntakeMl + entry.medicationsFlushMl + entry.bloodProductsMl;
}

export function totalOutput(entry: Pick<RenalOutputEntry, "urineOutputMl" | "drainsOutputMl" | "stoolOtherMl" | "insensibleLossMl">) {
  return entry.urineOutputMl + entry.drainsOutputMl + entry.stoolOtherMl + entry.insensibleLossMl;
}

export function sumValues<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((sum, row) => sum + getValue(row), 0);
}

export function getRenalBalanceRows(patientId: string) {
  const intakeRows = getRenalIntakeByPatient(patientId);
  const outputRows = getRenalOutputByPatient(patientId);
  return intakeRows.map((intake, index) => {
    const output = outputRows[index];
    const intakeTotal = totalIntake(intake);
    const outputTotal = output ? totalOutput(output) : 0;
    return {
      id: `${intake.id}-${output?.id ?? "missing"}`,
      timeRange: intake.timeRange,
      ivFluidsMl: intake.ivFluidsMl,
      oralIntakeMl: intake.oralIntakeMl,
      medicationsFlushMl: intake.medicationsFlushMl,
      bloodProductsMl: intake.bloodProductsMl,
      totalIntakeMl: intakeTotal,
      urineOutputMl: output?.urineOutputMl ?? 0,
      drainsOutputMl: output?.drainsOutputMl ?? 0,
      stoolOtherMl: output?.stoolOtherMl ?? 0,
      totalOutputMl: outputTotal,
      balanceMl: intakeTotal - outputTotal,
    };
  });
}
