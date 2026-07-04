import type { LaboratoryOrderHistory, LaboratoryPriority, LaboratoryResultBlock, LaboratorySummaryRow, LaboratoryTest } from "./types";

export const LaboratorySubTabs = ["Laboratory", "Radiology", "Medications", "Nursing orders", "Diet", "IV solutions", "Rehab", "Order history"] as const;

export const visitProblems = ["Diabetes Type 2", "Hypertension", "Fatigue"];

export const specimenSources = ["Blood", "Urine", "Stool", "CSF", "Sputum", "Wound swab", "Pleural Fluid", "Ascitic Fluid", "Biopsy"];

export const priorities: LaboratoryPriority[] = ["Routine", "Urgent", "STAT", "ASAP"];

export const testList: LaboratoryTest[] = [
  { 
  id: "arthritis-profile", 
  name: "ARTHRITIS PROFILE", 
  description: "Inflammatory and autoimmune test bundle",
  department: "Serology"
},

{ 
  id: "blood-exam", 
  name: "BLOOD EXAM", 
  description: "General blood screening set",
  department: "Hematology"
},

{ 
  id: "cbc", 
  name: "CBC", 
  description: "Complete blood count", 
  code: "58410-2",
  department: "Hematology"
},

{ 
  id: "diabetic-profile", 
  name: "DIABETIC PROFILE", 
  description: "Diabetes monitoring bundle",
  department: "Biochemistry"
},

{ 
  id: "electrolytes", 
  name: "ELECTROLYTES", 
  description: "Sodium, potassium, chloride, bicarbonate",
  department: "Biochemistry"
},

{ 
  id: "hemogram", 
  name: "HEMOGRAM", 
  description: "CBC with indices and differential",
  department: "Hematology"
},

{ 
  id: "hematology", 
  name: "HEMATOLOGY", 
  description: "Blood cell and coagulation studies",
  department: "Hematology"
},

{ 
  id: "kft", 
  name: "KFT", 
  description: "Kidney function test", 
  code: "24362-6",
  department: "Biochemistry"
},

{ 
  id: "lft", 
  name: "LFT", 
  description: "Liver function test", 
  code: "24323-8",
  department: "Biochemistry"
},

{
  id: "lipid-profile",
  name: "LIPID PROFILE",
  description: "Cholesterol and lipoprotein panel",
  department: "Biochemistry",
  children: [
    "HDL",
    "LDL",
    "VLDL",
    "TOTAL CHOL",
    "HDL/LDL RATIO",
    "TOTAL CHOL/HDL"
  ],
}
];

export const groupedTests = [
  { id: "diabetic", name: "Diabetic profile", department: "Biochemistry" },
  { id: "arthritis", name: "Arthritis profile", department: "Serology" },
  { id: "renal", name: "Renal profile", department: "Biochemistry" },
  { id: "cardiac", name: "Cardiac panel", department: "Biochemistry" },
  { id: "liver", name: "Liver panel", department: "Biochemistry" },
  { id: "anemia", name: "Anemia panel", department: "Hematology" },
  { id: "preop", name: "Pre-op panel", department: "Biochemistry" },
  { id: "hormone", name: "Hormone panel", department: "Biochemistry" },
];

export const previousTestOrders: LaboratoryOrderHistory[] = [
  { id: "hist-cbc", label: "CBC (12 Apr)", selectedTestIds: ["cbc"], selectedGroupIds: [] },
  { id: "hist-lft", label: "LFT (02 Mar)", selectedTestIds: ["lft"], selectedGroupIds: ["liver"] },
  { id: "hist-kft", label: "KFT (02 Mar)", selectedTestIds: ["kft"], selectedGroupIds: ["renal"] },
];

const today = new Date();
const orderDateTime = `${today.toISOString().slice(0, 10)} ${today.toTimeString().slice(0, 5)}`;

export const summaryRows: LaboratorySummaryRow[] = [
  { id: "sum-cbc", name: "CBC", loinc: "58410-2", cpt: "85027", department: "Hematology", specimen: "Blood", priority: "Routine", status: "Ordered", orderedBy: "Dr. Kavita Rao", orderDateTime },
  { id: "sum-kft", name: "KFT", loinc: "24362-6", cpt: "80048", department: "Biochemistry", specimen: "Blood", priority: "Routine", status: "Sample Collected", orderedBy: "Dr. Kavita Rao", orderDateTime },
  { id: "sum-renal", name: "Renal profile", loinc: "24362-6", cpt: "80053", department: "Biochemistry", specimen: "Blood", priority: "Urgent", status: "Received", orderedBy: "Dr. Kavita Rao", orderDateTime },
  { id: "sum-lft", name: "LFT", loinc: "24323-8", cpt: "80076", department: "Biochemistry", specimen: "Blood", priority: "STAT", status: "Processing", orderedBy: "Dr. Kavita Rao", orderDateTime },
];

export const resultBlocks: LaboratoryResultBlock[] = [
  {
    id: "result-cbc",
    name: "CBC - complete blood count",
    specialty: "Hematology",
    specimen: "Blood",
    rows: [
      { parameter: "Hemoglobin", result: "9.8", unit: "g/dL", referenceRange: "12.0 - 16.0", flag: "L" },
      { parameter: "WBC", result: "7.2", unit: "x10^3/uL", referenceRange: "4.5 - 11.0", flag: "H" },
      { parameter: "Platelets", result: "240", unit: "x10^3/uL", referenceRange: "150 - 400", flag: "H" },
      { parameter: "RBC", result: "3.4", unit: "x10^6/uL", referenceRange: "4.2 - 5.4", flag: "L" },
      { parameter: "Hematocrit (PCV)", result: "30.2", unit: "%", referenceRange: "36 - 48", flag: "L" },
    ],
  },
  {
    id: "result-kft",
    name: "KFT - kidney function test",
    specialty: "Biochemistry",
    specimen: "Blood",
    rows: [
      { parameter: "Serum creatinine", result: "2.1", unit: "mg/dL", referenceRange: "0.6 - 1.2", flag: "H" },
      { parameter: "Blood urea nitrogen", result: "38", unit: "mg/dL", referenceRange: "7 - 25", flag: "H" },
      { parameter: "Uric acid", result: "5.4", unit: "mg/dL", referenceRange: "3.4 - 7.0", flag: "N" },
      { parameter: "eGFR", result: "42", unit: "mL/min", referenceRange: "> 60", flag: "L" },
    ],
  },
];

export const diagnosisTypes = ["Primary", "Secondary", "Differential"];
