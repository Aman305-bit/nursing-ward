import type { RadiologyGroup, RadiologyPriority, RadiologyResultBlock, RadiologySummaryRow, RadiologyTest } from "./types";

export const radiologyTestList: RadiologyTest[] = [
  { id: "ct-spine-head", name: "CT Spine Head", description: "Cervical spine head protocol", modality: "CT", category: "CT Scan", code: "28566-8", specifications: ["Left", "Right", "Upper", "Lower", "Lateral"] },
  { id: "ct-head", name: "CT Head", description: "Non-contrast head CT", modality: "CT", category: "CT Scan", code: "24725-4", specifications: ["Contrast", "Non-contrast"] },
  { id: "ct-chest", name: "CT Chest W/O contrast", description: "Chest CT without contrast", modality: "CT", category: "CT Scan", code: "29252-4", specifications: ["Axial", "Coronal", "Sagittal"] },
  { id: "usg-abdomen", name: "USG Abdomen", description: "Ultrasound abdomen", modality: "Ultrasound", category: "Ultrasound", code: "41806-1", specifications: ["Upper", "Lower", "Full Abdomen"] },
  { id: "mri-brain", name: "MRI Brain", description: "MRI brain with protocol", modality: "MRI", category: "MRI", code: "70551", specifications: ["With contrast", "Without contrast"] },
  { id: "xray-chest", name: "Chest X-Ray", description: "PA view chest radiograph", modality: "X-Ray", category: "X-Ray", code: "71045", specifications: ["PA", "Lateral"] },
];

export const radiologyTestGroups: RadiologyGroup[] = [
  { id: "ct-scan", name: "CT Scan", modality: "CT", tests: ["ct-head", "ct-brain", "ct-chest", "ct-spine-head"] },
  { id: "ultrasound", name: "Ultrasound", modality: "Ultrasound", tests: ["usg-abdomen"] },
  { id: "mri", name: "MRI", modality: "MRI", tests: ["mri-brain"] },
  { id: "xray", name: "X-Ray", modality: "X-Ray", tests: ["xray-chest"] },
];

export const radiologyPriorities: RadiologyPriority[] = ["Routine", "Urgent", "STAT", "ASAP"];

const today = new Date();
const orderDateTime = `${today.toISOString().slice(0, 10)} ${today.toTimeString().slice(0, 5)}`;

export const radiologySummaryRows: RadiologySummaryRow[] = [
  { id: "rad-xray", selectedTests: "Chest X-Ray", loincCode: "71045", category: "X-Ray", specification: "PA View", priority: "Routine", status: "Ordered", orderDateTime },
  { id: "rad-ct", selectedTests: "CT Brain", loincCode: "24725-4", category: "CT Scan", specification: "Without Contrast", priority: "Urgent", status: "Scheduled", orderDateTime },
  { id: "rad-usg", selectedTests: "USG Abdomen", loincCode: "41806-1", category: "Ultrasound", specification: "Whole Abdomen", priority: "STAT", status: "Completed", orderDateTime },
];

export const radiologyResultBlocks: RadiologyResultBlock[] = [
  {
    id: "rad-xray-result",
    selectedTests: "Chest X-Ray",
    loincCode: "71045",
    category: "X-Ray",
    specification: "PA View",
    priority: "Routine",
    reportDate: "14/05/2021",
    radiologist: "Dr. Kavita Rao",
    findings: "Lungs are clear. No focal consolidation or pleural effusion.",
    impression: "Normal chest radiograph.",
    rows: [
      { parameter: "Lungs", result: "Clear", unit: "-", referenceRange: "Clear" },
      { parameter: "Cardiomediastinal silhouette", result: "Normal", unit: "-", referenceRange: "Normal" },
    ],
  },
  {
    id: "rad-ct-result",
    selectedTests: "CT Brain",
    loincCode: "24725-4",
    category: "CT Scan",
    specification: "Without Contrast",
    priority: "Urgent",
    reportDate: "14/05/2021",
    radiologist: "Dr. Kavita Rao",
    findings: "No acute intracranial hemorrhage or midline shift.",
    impression: "No acute CT brain abnormality.",
    rows: [
      { parameter: "Hemorrhage", result: "Absent", unit: "-", referenceRange: "Absent" },
      { parameter: "Midline shift", result: "Absent", unit: "mm", referenceRange: "0" },
    ],
  },
];
