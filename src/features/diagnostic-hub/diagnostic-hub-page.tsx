"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  Brain,
  CalendarDays,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  Droplet,
  Dna,
  Eye,
  FileCheck2,
  FileArchive,
  FileDown,
  FileImage,
  FileText,
  FlipHorizontal,
  FlaskConical,
  HeartPulse,
  Image as ImageIcon,
  Maximize2,
  Move,
  MoreVertical,
  Printer,
  RotateCcw,
  RotateCw,
  Search,
  ShieldCheck,
  TestTube2,
  TrendingUp,
  UserRound,
  UserCheck,
  Waves,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

const diagnosticHubBaseRoute = "/icu-command-center/diagnostics/hub";

const categories = [
  { label: "All Reports", route: diagnosticHubBaseRoute, key: "all" },
  { label: "Laboratory", route: `${diagnosticHubBaseRoute}/laboratory`, key: "laboratory" },
  { label: "Imaging", route: `${diagnosticHubBaseRoute}/imaging`, key: "imaging" },
  { label: "Pathology", route: `${diagnosticHubBaseRoute}/pathology`, key: "pathology" },
  { label: "Microbiology", route: `${diagnosticHubBaseRoute}/microbiology`, key: "microbiology" },
  { label: "Cardiology", route: `${diagnosticHubBaseRoute}/cardiology`, key: "cardiology" },
  { label: "Pulmonology", route: `${diagnosticHubBaseRoute}/pulmonology`, key: "pulmonology" },
] as const;

const categoryContent = {
  laboratory: {
    title: "Laboratory",
    description: "Clinical chemistry, hematology, and serology worklist with specimen and result readiness.",
    rows: [
      ["LAB-8841", "CBC with Differential", "Blood / EDTA", "Final", "Dr. Sharma", "11:00 AM"],
      ["LAB-8842", "Renal Function Panel", "Serum", "Critical", "Dr. Sharma", "11:25 AM"],
      ["LAB-8843", "Liver Function Test", "Serum", "Final", "Dr. Iyer", "10:15 AM"],
      ["LAB-8844", "Electrolytes", "Serum", "Processing", "Dr. Sharma", "Expected 12:10 PM"],
    ],
  },
  imaging: {
    title: "Imaging",
    description: "Radiology studies, acquisition status, reporting progress, and image availability.",
    rows: [
      ["IMG-2201", "MRI Brain", "MRI / Brain", "Final", "Dr. Mehta", "04:20 PM"],
      ["IMG-2202", "CT Chest", "CT / Chest", "Preliminary", "Dr. Mehta", "Pending"],
      ["IMG-2203", "Portable X-Ray Chest", "X-Ray / Chest", "Images Ready", "Dr. Rao", "12:35 PM"],
      ["IMG-2204", "USG Abdomen", "Ultrasound", "Scheduled", "Dr. Sen", "02:00 PM"],
    ],
  },
  pathology: {
    title: "Pathology",
    description: "Histology and cytology case tracking with grossing, slide, and sign-out readiness.",
    rows: [
      ["PATH-771", "Biopsy - gastric", "Tissue / Formalin", "Grossing", "Dr. Kapoor", "Today"],
      ["PATH-772", "FNAC thyroid", "Cytology smear", "Slides Ready", "Dr. Nair", "Today"],
      ["PATH-773", "Skin punch biopsy", "Tissue block", "Final", "Dr. Kapoor", "Yesterday"],
      ["PATH-774", "Pap smear", "Cytology", "Review", "Dr. Nair", "Today"],
    ],
  },
  microbiology: {
    title: "Microbiology",
    description: "Culture, organism identification, sensitivity status, and infection-alert workflow.",
    rows: [
      ["MIC-552", "Blood Culture", "Blood bottle", "In Progress", "Dr. Sharma", "48 hr incubation"],
      ["MIC-553", "Urine Culture", "Urine", "Positive", "Dr. Iyer", "AST pending"],
      ["MIC-554", "Sputum AFB", "Sputum", "Processing", "Dr. Rao", "Tomorrow"],
      ["MIC-555", "Wound Swab Culture", "Swab", "Final", "Dr. Sharma", "09:45 AM"],
    ],
  },
  cardiology: {
    title: "Cardiology",
    description: "ECG, echo, stress test, and rhythm monitoring reports for cardiac review.",
    rows: [
      ["CARD-331", "12 Lead ECG", "ECG waveform", "Abnormal", "Dr. Sharma", "10:40 AM"],
      ["CARD-332", "2D Echo", "Echo study", "Final", "Dr. Menon", "01:15 PM"],
      ["CARD-333", "Holter Summary", "24 hr monitor", "Reporting", "Dr. Menon", "Pending"],
      ["CARD-334", "TMT", "Stress test", "Scheduled", "Dr. Sharma", "03:30 PM"],
    ],
  },
  pulmonology: {
    title: "Pulmonology",
    description: "PFT, ABG, respiratory cultures, sleep and oxygenation study tracking.",
    rows: [
      ["PUL-441", "ABG", "Arterial blood", "Critical", "Dr. Rao", "11:10 AM"],
      ["PUL-442", "Spirometry", "PFT", "Final", "Dr. Rao", "10:20 AM"],
      ["PUL-443", "Sleep Study Summary", "Monitor data", "Reporting", "Dr. Sen", "Pending"],
      ["PUL-444", "Pleural Fluid Analysis", "Fluid sample", "Processing", "Dr. Sharma", "Expected 02:00 PM"],
    ],
  },
} as const;

type DiagnosticCategoryKey = keyof typeof categoryContent;
type DiagnosticCategoryRow = readonly [id: string, name: string, sample: string, status: string, owner: string, eta: string];
type DiagnosticCategoryStat = readonly [label: string, value: number, helper: string];

function countRows(rows: readonly DiagnosticCategoryRow[], predicate: (row: DiagnosticCategoryRow) => boolean) {
  return rows.filter(predicate).length;
}

function isCompleteStatus(status: string) {
  return ["Final", "Critical", "Images Ready", "Slides Ready", "Positive", "Abnormal"].includes(status);
}

function getDiagnosticStatusTone(status: string): StatusTone {
  if (status === "Critical" || status.includes("Critical")) return "critical";
  if (["Abnormal", "High", "Low", "Positive"].includes(status)) return "warning";
  if (["Final", "Normal", "Images Ready", "Slides Ready", "Ready", "Completed"].includes(status)) return "success";
  if (["Preliminary", "Pending", "Scheduled", "Processing", "Reporting", "Review"].includes(status)) return "warning";
  return "info";
}

function getDiagnosticMetricTone(label: string): StatusTone {
  if (label === "Critical") return "critical";
  if (["Abnormal", "Positive", "Pending", "Reporting", "Sensitivity"].includes(label)) return "warning";
  if (["Resulted", "Images Ready", "Slides Ready", "Reported"].includes(label)) return "success";
  return "info";
}

function isPendingCategoryRow(row: DiagnosticCategoryRow) {
  const status = row[3];
  const eta = row[5];
  return eta === "Pending" || !isCompleteStatus(status);
}

function getCategoryStats(category: DiagnosticCategoryKey, rows: readonly DiagnosticCategoryRow[]): DiagnosticCategoryStat[] {
  switch (category) {
    case "laboratory":
      return [
        ["Collected", rows.length, "Specimens received"],
        ["Resulted", countRows(rows, (row) => ["Final", "Critical"].includes(row[3])), "Reports finalized"],
        ["Critical", countRows(rows, (row) => row[3] === "Critical"), "Needs acknowledgement"],
        ["Pending", countRows(rows, isPendingCategoryRow), "In analyzer queue"],
      ];
    case "imaging":
      return [
        ["Studies", rows.length, "Studies in worklist"],
        ["Images Ready", countRows(rows, (row) => ["Final", "Images Ready"].includes(row[3])), "Available for review"],
        ["Reporting", countRows(rows, (row) => ["Preliminary", "Reporting"].includes(row[3]) || row[5] === "Pending"), "Draft or dictated"],
        ["Critical", countRows(rows, (row) => row[3] === "Critical"), "Urgent finding"],
      ];
    case "pathology":
      return [
        ["Cases", rows.length, "Open accessions"],
        ["Slides Ready", countRows(rows, (row) => row[3] === "Slides Ready"), "Ready for microscopy"],
        ["Reported", countRows(rows, (row) => row[3] === "Final"), "Signed out"],
        ["Pending", countRows(rows, isPendingCategoryRow), "Processing or review"],
      ];
    case "microbiology":
      return [
        ["Cultures", rows.length, "Active samples"],
        ["Positive", countRows(rows, (row) => row[3] === "Positive"), "Organism detected"],
        ["Sensitivity", countRows(rows, (row) => row[5].toLowerCase().includes("ast pending")), "AST pending"],
        ["Critical", countRows(rows, (row) => row[3] === "Critical"), "Escalation needed"],
      ];
    case "cardiology":
      return [
        ["ECG", countRows(rows, (row) => `${row[1]} ${row[2]}`.toLowerCase().includes("ecg")), "Captured today"],
        ["Echo", countRows(rows, (row) => `${row[1]} ${row[2]}`.toLowerCase().includes("echo")), "Studies reported"],
        ["Abnormal", countRows(rows, (row) => ["Abnormal", "Critical"].includes(row[3])), "Needs review"],
        ["Pending", countRows(rows, isPendingCategoryRow), "Awaiting review"],
      ];
    case "pulmonology":
      return [
        ["PFT", countRows(rows, (row) => `${row[1]} ${row[2]}`.toLowerCase().includes("pft") || row[1].toLowerCase().includes("spirometry")), "Completed today"],
        ["ABG", countRows(rows, (row) => row[1].toLowerCase().includes("abg")), "Resulted"],
        ["Abnormal", countRows(rows, (row) => ["Abnormal", "Critical"].includes(row[3])), "Outside range"],
        ["Pending", countRows(rows, isPendingCategoryRow), "Needs repeat/sample"],
      ];
  }
}

function notifyAction(title: string, description: string) {
  toast.info(title, { description });
}

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function createPdfBlob(title: string, lines: string[]) {
  const contentLines = [title, "", ...lines].slice(0, 36);
  const stream = [
    "BT",
    "/F1 18 Tf",
    "50 790 Td",
    `(${escapePdfText(contentLines[0] ?? title)}) Tj`,
    "/F1 10 Tf",
    ...contentLines.slice(1).map((line) => `0 -18 Td (${escapePdfText(line)}) Tj`),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadPdf(title: string, fileName: string, lines: string[]) {
  downloadBlob(createPdfBlob(title, lines), fileName);
  toast.success("PDF downloaded", { description: `${title} PDF ready.` });
}

function printDiagnosticPage() {
  window.print();
}

function downloadDiagnosticReport(report: { id: string; name: string; category: string; status: string; issued?: string }) {
  const issued = report.issued ?? "Pending";
  downloadPdf("Plasmit Hospital HMS - Diagnostic Report", `${report.id.toLowerCase()}-${report.name.toLowerCase().replaceAll(" ", "-")}.pdf`, [
    `Report ID: ${report.id}`,
    `Report Name: ${report.name}`,
    `Category: ${report.category}`,
    `Status: ${report.status}`,
    `Issued: ${issued}`,
    "Patient: Rahul Verma",
    "Encounter: IPD-2026-789",
    "Issued through Diagnostic Hub.",
  ]);
}

const reports = [
  { id: "DR-2026-0128", name: "Complete Blood Count", category: "Laboratory", status: "Final", collected: "12 Jun 2026 09:30 AM", issued: "12 Jun 2026 11:00 AM", orderedBy: "Dr. Sharma", tone: "success" },
  { id: "DR-2026-0127", name: "Liver Function Test", category: "Laboratory", status: "Final", collected: "11 Jun 2026 08:45 AM", issued: "11 Jun 2026 10:15 AM", orderedBy: "Dr. Sharma", tone: "success" },
  { id: "DR-2026-0126", name: "MRI Brain", category: "Imaging", status: "Final", collected: "10 Jun 2026 02:30 PM", issued: "10 Jun 2026 04:20 PM", orderedBy: "Dr. Mehta", tone: "success" },
  { id: "DR-2026-0125", name: "CT Chest", category: "Imaging", status: "Preliminary", collected: "10 Jun 2026 01:00 PM", issued: "Pending", orderedBy: "Dr. Mehta", tone: "warning" },
  { id: "DR-2026-0124", name: "Blood Culture", category: "Microbiology", status: "In Progress", collected: "10 Jun 2026 09:00 AM", issued: "Pending", orderedBy: "Dr. Sharma", tone: "info" },
] as const;

const alerts = [
  { test: "Hemoglobin", value: "6.8 g/dL", flag: "Critical Low", date: "12 Jun 2026", tone: "danger" },
  { test: "Potassium", value: "6.2 mmol/L", flag: "Critical High", date: "12 Jun 2026", tone: "danger" },
  { test: "Creatinine", value: "2.8 mg/dL", flag: "Abnormal High", date: "12 Jun 2026", tone: "warning" },
  { test: "WBC Count", value: "2,500 /uL", flag: "Abnormal Low", date: "12 Jun 2026", tone: "warning" },
] as const;

type DiagnosticReport = (typeof reports)[number];
type DiagnosticAlert = (typeof alerts)[number];
type DiagnosticMetricCard = {
  label: string;
  value: number;
  helper: string;
  icon: typeof FileText;
  tone: StatusTone;
};

function isPendingReport(report: DiagnosticReport) {
  return report.issued === "Pending" || !["Final", "Critical"].includes(report.status);
}

function getDiagnosticMetrics(sourceReports: readonly DiagnosticReport[], sourceAlerts: readonly DiagnosticAlert[]) {
  const finalReports = sourceReports.filter((report) => report.status === "Final").length;
  const preliminaryReports = sourceReports.filter((report) => report.status === "Preliminary").length;
  const pendingReports = sourceReports.filter(isPendingReport).length;
  const criticalResults = sourceAlerts.length;

  const metricCards: DiagnosticMetricCard[] = [
    { label: "Total Reports", value: sourceReports.length, helper: "Across this encounter", icon: FileText, tone: "info" },
    { label: "Final Reports", value: finalReports, helper: "Ready for review", icon: ClipboardCheck, tone: "success" },
    { label: "Preliminary", value: preliminaryReports, helper: "Awaiting sign-off", icon: TestTube2, tone: "warning" },
    { label: "Critical Results", value: criticalResults, helper: "Needs attention", icon: AlertTriangle, tone: "critical" },
    { label: "Pending", value: pendingReports, helper: "Collection or result due", icon: CalendarDays, tone: "muted" },
  ];

  const summaryRows = [
    ["Reports this encounter", sourceReports.length],
    ["Final reports", finalReports],
    ["Preliminary reports", preliminaryReports],
    ["Pending reports", pendingReports],
    ["Critical results", criticalResults],
  ] as const;

  return { criticalResults, metricCards, summaryRows };
}

const labReportGroups = [
  {
    title: "RBC Parameters",
    rows: [
      { test: "Hemoglobin", method: "Cyanide free spectrophotometry.", value: "13.6", unit: "g/dL", range: "13.0 - 17.0" },
      { test: "RBC Count", method: "Electrical impedance", value: "4.6", unit: "10^6/uL", range: "4.5 - 5.5" },
      { test: "PCV", method: "Calculated", value: "40.1", unit: "%", range: "40 - 50" },
      { test: "MCV", method: "Calculated", value: "86.8", unit: "fl", range: "83 - 101" },
      { test: "MCH", method: "Calculated", value: "29.5", unit: "pg", range: "27 - 32" },
      { test: "MCHC", method: "Calculated", value: "34", unit: "g/dL", range: "31.5 - 34.5" },
      { test: "RDW (CV)", method: "Calculated", value: "13.1", unit: "%", range: "11.6 - 14.0" },
      { test: "RDW-SD", method: "Calculated", value: "28.5", unit: "fl", range: "35.1 - 43.9", abnormal: true },
    ],
  },
  {
    title: "WBC Parameters",
    rows: [
      { test: "TLC", method: "Electrical impedance and microscopy", value: "6.8", unit: "10^3/uL", range: "4 - 10" },
    ],
  },
  {
    title: "Differential Leucocyte Count",
    rows: [
      { test: "Neutrophils", method: "Flow-cytometry DHSS", value: "64", unit: "%", range: "40 - 80" },
      { test: "Lymphocytes", method: "Flow-cytometry DHSS", value: "25", unit: "%", range: "20 - 40" },
      { test: "Monocytes", method: "Flow-cytometry DHSS", value: "9", unit: "%", range: "2 - 10" },
      { test: "Eosinophils", method: "Flow-cytometry DHSS", value: "2", unit: "%", range: "0 - 6" },
      { test: "Basophils", method: "Flow-cytometry DHSS", value: "0", unit: "%", range: "0 - 1" },
    ],
  },
  {
    title: "Absolute Leukocyte Counts",
    rows: [
      { test: "Neutrophils.", method: "Calculated", value: "4.35", unit: "10^3/uL", range: "2 - 7" },
      { test: "Lymphocytes.", method: "Calculated", value: "1.7", unit: "10^3/uL", range: "1 - 3" },
      { test: "Monocytes.", method: "Calculated", value: "0.61", unit: "10^3/uL", range: "0.2 - 1.0" },
      { test: "Eosinophils.", method: "Calculated", value: "0.14", unit: "10^3/uL", range: "0.02 - 0.5" },
      { test: "Basophils.", method: "Calculated", value: "0", unit: "10^3/uL", range: "0.02 - 0.5", abnormal: true },
    ],
  },
] as const;

const resultRows: readonly { test: string; result: string; unit: string; range: string; status: string; tone: StatusTone }[] = [];

const diagnosticTrendParameters = {
  Hemoglobin: { unit: "g/dL", normalRange: "13.0 - 17.0 g/dL", values: [12.2, 11.9, 11.8, 11.5, 11.4, 11.2, 11.1, 10.9] },
  WBC: { unit: "/uL", normalRange: "4,000 - 11,000 /uL", values: [7600, 8200, 8800, 9100, 9700, 10200, 9600, 8900] },
  Platelets: { unit: "Lakh/uL", normalRange: "1.50 - 4.50 Lakh/uL", values: [2.4, 2.35, 2.5, 2.65, 2.58, 2.7, 2.62, 2.55] },
  Creatinine: { unit: "mg/dL", normalRange: "0.6 - 1.2 mg/dL", values: [1.0, 1.2, 1.3, 1.5, 1.85, 1.95, 2.2, 2.7] },
  Sodium: { unit: "mmol/L", normalRange: "135 - 145 mmol/L", values: [138, 136, 137, 139, 138, 140, 137, 136] },
  Potassium: { unit: "mmol/L", normalRange: "3.5 - 5.0 mmol/L", values: [4.2, 4.5, 4.8, 5.1, 5.4, 5.8, 6.0, 5.6] },
  "Blood Sugar": { unit: "mg/dL", normalRange: "70 - 140 mg/dL", values: [118, 142, 156, 164, 148, 172, 188, 176] },
  HbA1c: { unit: "%", normalRange: "< 5.7%", values: [7.1, 7.1, 7.2, 7.3, 7.4, 7.4, 7.5, 7.6] },
  CRP: { unit: "mg/L", normalRange: "< 10 mg/L", values: [8, 12, 18, 24, 31, 28, 22, 16] },
  "LFT Parameters": { unit: "index", normalRange: "0 - 45 index", values: [42, 48, 54, 61, 58, 64, 69, 63] },
  "KFT Parameters": { unit: "index", normalRange: "0 - 50 index", values: [36, 40, 48, 56, 68, 72, 78, 82] },
} as const;

type DiagnosticTrendParameter = keyof typeof diagnosticTrendParameters;
type DiagnosticTrendRange = "30" | "14" | "custom";

const trendDates = ["14 May", "18 May", "22 May", "26 May", "30 May", "03 Jun", "07 Jun", "11 Jun"] as const;
const trendDateValues = ["2026-05-14", "2026-05-18", "2026-05-22", "2026-05-26", "2026-05-30", "2026-06-03", "2026-06-07", "2026-06-11"] as const;

const imagingStudies = [
  {
    id: "mri-brain",
    title: "MRI Brain",
    shortLabel: "MRI",
    reportId: "DR-2026-0126",
    category: "Imaging",
    status: "Final",
    modality: "MRI",
    bodyPart: "Brain",
    imageSrc: "/diagnostic-demo/mri-brain-demo.png",
    orderedBy: "Dr. Mehta",
    radiologist: "Dr. Mehta",
    studyDate: "10 Jun 2026 02:30 PM",
    issuedOn: "10 Jun 2026 04:20 PM",
    seriesLabel: "Axial T2",
    seriesCount: "5 / 12",
    windowWidth: "1200",
    windowLevel: "600",
    procedure: "MRI Brain with axial T2, FLAIR, DWI, ADC and sagittal T1 sequences.",
    clinicalIndication: "Headache with intermittent dizziness. Evaluate for acute infarct, mass lesion, or demyelinating process.",
    technique: "Multiplanar, multisequence MRI brain study performed without contrast. Images reviewed in standard brain and soft tissue windows.",
    findings: "No acute diffusion restriction. Ventricular system is normal in size and configuration. No midline shift, mass effect, hemorrhage, or extra-axial collection. Mild nonspecific periventricular white matter signal changes are noted.",
    impression: "No acute intracranial abnormality. Mild chronic microvascular ischemic changes.",
    recommendation: "Clinical correlation advised. Follow-up imaging only if symptoms progress or new neurological deficit develops.",
  },
  {
    id: "ct-chest",
    title: "CT Chest",
    shortLabel: "CT",
    reportId: "DR-2026-0125",
    category: "Imaging",
    status: "Preliminary",
    modality: "CT",
    bodyPart: "Chest",
    imageSrc: "/diagnostic-demo/ct-chest-demo.png",
    orderedBy: "Dr. Mehta",
    radiologist: "Dr. Rao",
    studyDate: "10 Jun 2026 01:00 PM",
    issuedOn: "Pending",
    seriesLabel: "Axial Lung Window",
    seriesCount: "18 / 42",
    windowWidth: "1500",
    windowLevel: "-600",
    procedure: "CT Chest axial acquisition with lung and mediastinal window review.",
    clinicalIndication: "Shortness of breath with persistent cough. Evaluate lung parenchyma, airway, pleura, and mediastinum.",
    technique: "Non-contrast CT chest images acquired in axial plane with multiplanar review available for reporting.",
    findings: "Both lungs are expanded. No large pleural effusion or pneumothorax is seen on the available series. Central airways are patent. Mediastinal structures are visualized on axial sections.",
    impression: "Preliminary CT chest review available. No large acute thoracic finding on the available image set.",
    recommendation: "Final radiologist sign-off pending. Correlate with symptoms and laboratory findings.",
  },
  {
    id: "xray-chest",
    title: "Chest X-ray",
    shortLabel: "X-ray",
    reportId: "DR-2026-0123",
    category: "Imaging",
    status: "Final",
    modality: "X-Ray",
    bodyPart: "Chest",
    imageSrc: "/diagnostic-demo/xray-chest-demo.png",
    orderedBy: "Dr. Sharma",
    radiologist: "Dr. Sen",
    studyDate: "09 Jun 2026 09:15 AM",
    issuedOn: "09 Jun 2026 09:45 AM",
    seriesLabel: "PA View",
    seriesCount: "1 / 1",
    windowWidth: "Radiograph",
    windowLevel: "Auto",
    procedure: "Chest radiograph, frontal projection.",
    clinicalIndication: "Baseline chest assessment with respiratory symptoms.",
    technique: "Single frontal chest radiograph obtained with standard exposure. Image reviewed on diagnostic display.",
    findings: "Cardiomediastinal silhouette is not enlarged. No focal air-space opacity, pleural effusion, or pneumothorax is identified.",
    impression: "No acute cardiopulmonary abnormality on the available X-ray.",
    recommendation: "Clinical correlation advised. Repeat imaging if symptoms progress.",
  },
] as const;

type ImagingStudy = (typeof imagingStudies)[number];
type ImagingView = {
  id: string;
  label: string;
  description: string;
  rotation: number;
  flip: boolean;
  scaleX?: number;
  scaleY?: number;
  seriesNumber?: number;
  sliceCount?: number;
  emphasis?: string;
  filter?: string;
};

function escapeSvgText(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function imagingReferenceImageSrc(study: ImagingStudy) {
  const title = escapeSvgText(study.title);
  const reportId = escapeSvgText(study.reportId);
  const label = escapeSvgText(`${study.modality} ${study.bodyPart}`);
  const svg = study.modality === "X-Ray"
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800" role="img" aria-label="${title}">
        <defs>
          <radialGradient id="xrayGlow" cx="50%" cy="44%" r="58%"><stop offset="0" stop-color="#dbeafe"/><stop offset="0.42" stop-color="#64748b"/><stop offset="1" stop-color="#020617"/></radialGradient>
          <filter id="softBlur"><feGaussianBlur stdDeviation="1.2"/></filter>
        </defs>
        <rect width="640" height="800" fill="#020617"/>
        <rect x="42" y="38" width="556" height="724" rx="28" fill="url(#xrayGlow)" opacity="0.92"/>
        <ellipse cx="242" cy="352" rx="110" ry="210" fill="#0f172a" opacity="0.72" filter="url(#softBlur)"/>
        <ellipse cx="398" cy="352" rx="110" ry="210" fill="#0f172a" opacity="0.72" filter="url(#softBlur)"/>
        <path d="M320 130 C302 230 302 500 320 636" fill="none" stroke="#e2e8f0" stroke-width="28" stroke-linecap="round" opacity="0.66"/>
        <path d="M320 190 C250 210 190 250 145 306 M320 235 C250 252 184 302 132 370 M320 285 C244 310 185 366 145 438 M320 338 C256 370 214 430 188 498" fill="none" stroke="#dbeafe" stroke-width="14" opacity="0.38"/>
        <path d="M320 190 C390 210 450 250 495 306 M320 235 C390 252 456 302 508 370 M320 285 C396 310 455 366 495 438 M320 338 C384 370 426 430 452 498" fill="none" stroke="#dbeafe" stroke-width="14" opacity="0.38"/>
        <circle cx="320" cy="586" r="62" fill="#e2e8f0" opacity="0.35"/>
        <text x="70" y="88" fill="#e2e8f0" font-family="Arial" font-size="22" font-weight="700">${title}</text>
        <text x="70" y="120" fill="#94a3b8" font-family="Arial" font-size="15">${reportId} - ${label}</text>
        <text x="560" y="746" fill="#e2e8f0" font-family="Arial" font-size="18" text-anchor="end">R</text>
      </svg>`
    : study.modality === "CT"
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" role="img" aria-label="${title}">
          <defs>
            <radialGradient id="ctBody" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f8fafc"/><stop offset="0.55" stop-color="#64748b"/><stop offset="1" stop-color="#0f172a"/></radialGradient>
            <radialGradient id="ctAir" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#020617"/><stop offset="1" stop-color="#111827"/></radialGradient>
          </defs>
          <rect width="720" height="720" fill="#030712"/>
          <circle cx="360" cy="360" r="284" fill="url(#ctBody)" opacity="0.96"/>
          <ellipse cx="250" cy="360" rx="122" ry="175" fill="url(#ctAir)" opacity="0.9"/>
          <ellipse cx="470" cy="360" rx="122" ry="175" fill="url(#ctAir)" opacity="0.9"/>
          <circle cx="360" cy="350" r="76" fill="#d1d5db" opacity="0.65"/>
          <circle cx="360" cy="350" r="38" fill="#111827" opacity="0.7"/>
          <path d="M150 260 C238 188 482 188 570 260 M140 460 C238 535 482 535 580 460" fill="none" stroke="#e5e7eb" stroke-width="18" opacity="0.38"/>
          <path d="M170 210 C100 320 108 418 180 520 M550 210 C620 320 612 418 540 520" fill="none" stroke="#e5e7eb" stroke-width="16" opacity="0.36"/>
          <text x="56" y="74" fill="#e5e7eb" font-family="Arial" font-size="24" font-weight="700">${title}</text>
          <text x="56" y="106" fill="#9ca3af" font-family="Arial" font-size="15">${reportId} - ${label}</text>
          <text x="360" y="666" fill="#d1d5db" font-family="Arial" font-size="14" text-anchor="middle">AXIAL LUNG WINDOW</text>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" role="img" aria-label="${title}">
          <defs>
            <radialGradient id="mriBrain" cx="50%" cy="46%" r="48%"><stop offset="0" stop-color="#f8fafc"/><stop offset="0.48" stop-color="#94a3b8"/><stop offset="1" stop-color="#111827"/></radialGradient>
            <radialGradient id="mriVentricle" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#020617"/><stop offset="1" stop-color="#475569"/></radialGradient>
          </defs>
          <rect width="720" height="720" fill="#020617"/>
          <ellipse cx="360" cy="360" rx="242" ry="286" fill="url(#mriBrain)" opacity="0.96"/>
          <ellipse cx="360" cy="360" rx="204" ry="238" fill="none" stroke="#e2e8f0" stroke-width="10" opacity="0.25"/>
          <path d="M360 120 C332 205 332 280 360 342 C388 280 388 205 360 120Z" fill="#e2e8f0" opacity="0.23"/>
          <path d="M312 325 C260 358 252 420 304 462 C335 486 344 426 360 386 C330 382 318 358 312 325Z" fill="url(#mriVentricle)" opacity="0.78"/>
          <path d="M408 325 C460 358 468 420 416 462 C385 486 376 426 360 386 C390 382 402 358 408 325Z" fill="url(#mriVentricle)" opacity="0.78"/>
          <path d="M218 326 C260 230 460 230 502 326 M222 448 C278 544 442 544 498 448" fill="none" stroke="#f8fafc" stroke-width="12" opacity="0.18"/>
          <circle cx="360" cy="360" r="298" fill="none" stroke="#64748b" stroke-width="18" opacity="0.38"/>
          <text x="56" y="74" fill="#e5e7eb" font-family="Arial" font-size="24" font-weight="700">${title}</text>
          <text x="56" y="106" fill="#94a3b8" font-family="Arial" font-size="15">${reportId} - ${label}</text>
          <text x="360" y="666" fill="#cbd5e1" font-family="Arial" font-size="14" text-anchor="middle">AXIAL T2</text>
        </svg>`;

  return study.imageSrc || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getImagingViews(study: ImagingStudy): ImagingView[] {
  if (study.modality === "X-Ray") {
    return [
      { id: "pa", label: "Front", description: "PA view", rotation: 0, flip: false },
      { id: "ap", label: "Rear", description: "AP mirror", rotation: 0, flip: true },
      { id: "left-lat", label: "Left", description: "Left lateral view", rotation: -4, flip: false, scaleX: 0.82, scaleY: 1.04 },
      { id: "right-lat", label: "Right", description: "Right lateral view", rotation: 4, flip: true, scaleX: 0.82, scaleY: 1.04 },
    ];
  }

  if (study.modality === "CT") {
    return [
      { id: "axial", label: "Axial", description: "Top slice", rotation: 0, flip: false },
      { id: "coronal", label: "Front", description: "Coronal view", rotation: 90, flip: false, scaleX: 0.78, scaleY: 1.06 },
      { id: "sagittal-l", label: "Left", description: "Left sagittal", rotation: 90, flip: true, scaleX: 0.72, scaleY: 1.06 },
      { id: "sagittal-r", label: "Right", description: "Right sagittal", rotation: -90, flip: false, scaleX: 0.72, scaleY: 1.06 },
    ];
  }

  return [
    { id: "t1wi", label: "T1WI", description: "Anatomic detail", rotation: 0, flip: false, seriesNumber: 1, sliceCount: 24, emphasis: "Anatomic detail and structural assessment", filter: "grayscale(1) brightness(0.9) contrast(1.15)" },
    { id: "t2wi", label: "T2WI", description: "Fluid and edema", rotation: 0, flip: false, seriesNumber: 2, sliceCount: 24, emphasis: "Fluid signal, swelling, and edema assessment", filter: "grayscale(1) brightness(1.08) contrast(1.28)" },
    { id: "flair", label: "FLAIR", description: "Lesion conspicuity", rotation: 0, flip: false, seriesNumber: 3, sliceCount: 24, emphasis: "Parenchymal lesion and abnormal signal evaluation", filter: "grayscale(1) brightness(0.82) contrast(1.45)" },
    { id: "dwi", label: "DWI", description: "Diffusion restriction", rotation: 0, flip: false, seriesNumber: 4, sliceCount: 24, emphasis: "Acute infarct and diffusion restriction assessment", filter: "grayscale(1) brightness(0.72) contrast(1.7)" },
  ];
}

function MetricCard({ item }: { item: DiagnosticMetricCard }) {
  const Icon = item.icon;
  return (
    <Card
      className={cn(
        "min-h-[88px] sm:min-h-[104px]",
        item.tone === "critical" && "border-critical/45 bg-critical/5 ring-1 ring-critical/10",
        item.tone === "warning" && "border-warning/35 bg-warning/5",
        item.tone === "success" && "border-success/30 bg-success/5",
        item.tone === "info" && "border-info/25 bg-info/5",
      )}
    >
      <CardContent className="flex items-center gap-2 p-3 sm:gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12",
            item.tone === "success" && "bg-success/10 text-success",
            item.tone === "warning" && "bg-warning/10 text-warning",
            item.tone === "danger" && "bg-danger/10 text-danger",
            item.tone === "critical" && "bg-critical text-critical-foreground shadow-sm",
            item.tone === "info" && "bg-info/10 text-info",
            item.tone === "muted" && "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{item.label}</div>
          <div className="mt-0.5 text-xl font-bold text-foreground sm:mt-1 sm:text-2xl">{item.value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border pb-1">
      {categories.map((category) => {
        const active = pathname === category.route;
        return (
          <Link
            className={cn(
              "min-h-10 shrink-0 border-b-2 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground",
              active ? "border-primary text-primary" : "border-transparent",
            )}
            href={category.route}
            key={category.key}
          >
            {category.label}
          </Link>
        );
      })}
    </div>
  );
}

function ImagingViewer({ study }: { study: ImagingStudy }) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const views = React.useMemo(() => getImagingViews(study), [study]);
  const [activeViewId, setActiveViewId] = React.useState(views[0]?.id ?? "axial");
  const [fullscreen, setFullscreen] = React.useState(false);
  const [panMode, setPanMode] = React.useState(false);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [ww, setWw] = React.useState(study.modality === "CT" ? 1500 : 1200);
  const [wl, setWl] = React.useState(study.modality === "CT" ? -600 : 600);
  const dragStart = React.useRef<{ pointerId: number; x: number; y: number; panX: number; panY: number } | null>(null);
  const activeView = views.find((view) => view.id === activeViewId) ?? views[0];
  const brightness = Math.max(0.62, Math.min(1.55, 1 + (wl - 600) / 900));
  const contrast = Math.max(0.72, Math.min(1.75, 1200 / ww));
  const viewRotation = activeView?.rotation ?? 0;
  const viewFlip = activeView?.flip ?? false;
  const viewScaleX = activeView?.scaleX ?? 1;
  const viewScaleY = activeView?.scaleY ?? 1;
  const isMri = study.modality === "MRI";
  const currentSeriesLabel = isMri ? activeView?.label : study.seriesLabel;
  const currentSeriesCount = isMri && activeView?.sliceCount ? `${activeView.sliceCount}` : study.seriesCount;
  const sequenceFilter = activeView?.filter ?? "";

  function resetView() {
    setZoom(1);
    setRotation(0);
    setFlipped(false);
    setPanMode(false);
    setPan({ x: 0, y: 0 });
    setWw(study.modality === "CT" ? 1500 : 1200);
    setWl(study.modality === "CT" ? -600 : 600);
  }

  React.useEffect(() => {
    setActiveViewId(getImagingViews(study)[0]?.id ?? "axial");
    resetView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [study.id]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!panMode) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    setPan({
      x: start.panX + event.clientX - start.x,
      y: start.panY + event.clientY - start.y,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart.current?.pointerId !== event.pointerId) return;
    dragStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-black text-white", fullscreen && "fixed inset-4 z-[120] shadow-2xl")}>
      <div className="flex min-h-11 items-center gap-3 overflow-hidden whitespace-nowrap border-b border-white/10 bg-[#050506] px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold">
          <span className="min-w-[104px] shrink truncate">{study.shortLabel} - {currentSeriesLabel}</span>
          <span className="shrink-0 rounded border border-white/15 px-2 py-0.5 text-xs font-medium text-white/60">{isMri ? "Series" : "View"}: {activeView?.label}</span>
          <span className="hidden shrink-0 rounded border border-white/15 px-2 py-0.5 text-xs font-medium text-white/60 min-[1180px]:inline">WL = brightness</span>
          <span className="hidden shrink-0 rounded border border-white/15 px-2 py-0.5 text-xs font-medium text-white/60 min-[1180px]:inline">WW = contrast</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-white/15">
            <ViewerToolButton label="Zoom -" title="Zoom Out" onClick={() => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(1))))} icon={ZoomOut} />
            <ViewerToolButton label="Zoom +" title="Zoom In" onClick={() => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(1))))} icon={ZoomIn} />
            <ViewerToolButton active={panMode} label="Pan" title="Pan/Move Image" onClick={() => setPanMode((value) => !value)} icon={Move} />
            <ViewerToolButton label="Reset" title="Reset View" onClick={resetView} icon={RotateCcw} />
            <ViewerToolButton label="Rotate" title="Rotate Image" onClick={() => setRotation((value) => value + 90)} icon={RotateCw} />
            <ViewerToolButton active={flipped} label="Flip" title="Flip Image" onClick={() => setFlipped((value) => !value)} icon={FlipHorizontal} />
            <ViewerToolButton active={fullscreen} label="Full" title="Fullscreen View" onClick={() => setFullscreen((value) => !value)} icon={Maximize2} />
          </div>
          <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-white/15">
            <span className="shrink-0 px-2 text-[11px] font-semibold text-white/60">WW {ww}</span>
            <ViewerValueButton label="-" title="Decrease WW - higher contrast" onClick={() => setWw((value) => Math.max(600, value - 100))} />
            <ViewerValueButton label="+" title="Increase WW - softer contrast" onClick={() => setWw((value) => Math.min(1800, value + 100))} />
          </div>
          <div className="flex shrink-0 items-center overflow-hidden rounded-md border border-white/15">
            <span className="shrink-0 px-2 text-[11px] font-semibold text-white/60">WL {wl}</span>
            <ViewerValueButton label="-" title="Decrease WL - darker" onClick={() => setWl((value) => Math.max(250, value - 50))} />
            <ViewerValueButton label="+" title="Increase WL - brighter" onClick={() => setWl((value) => Math.min(950, value + 50))} />
          </div>
        </div>
      </div>

      <div className={cn("grid min-h-[460px] gap-3 p-3", isMri ? "grid-cols-[130px_minmax(0,1fr)]" : "grid-cols-[86px_minmax(0,1fr)]", fullscreen && "min-h-[calc(100dvh-112px)]")}>
        <div className="space-y-2 overflow-y-auto pr-1">
          {views.map((view) => (
            <button
              aria-label={`Open ${view.label} ${isMri ? "series" : "view"}`}
              className={cn(
                "relative w-full rounded-md border bg-white/5 p-1 text-left transition hover:border-primary/80",
                isMri ? "grid min-h-[72px] grid-cols-[52px_minmax(0,1fr)] items-center gap-2" : "h-20",
                activeViewId === view.id ? "border-primary ring-1 ring-primary" : "border-white/15",
              )}
              key={view.id}
              onClick={() => setActiveViewId(view.id)}
              type="button"
            >
              <span className={cn("relative block overflow-hidden rounded bg-black", isMri ? "h-14" : "h-full")}>
                <img
                  alt=""
                  className="h-full w-full object-contain opacity-85"
                  src={imagingReferenceImageSrc(study)}
                  style={{
                    filter: view.filter,
                    transform: `rotate(${view.rotation}deg) ${view.flip ? "scaleX(-1)" : ""} scale(${view.scaleX ?? 1}, ${view.scaleY ?? 1})`,
                  }}
                />
              </span>
              {isMri ? (
                <span className="min-w-0 text-[11px] leading-4 text-white/70">
                  <span className="block text-white/55">Series {view.seriesNumber}</span>
                  <span className="block font-bold text-white">{view.label}</span>
                  <span className="block">{view.sliceCount}</span>
                </span>
              ) : (
                <span className="absolute inset-x-1 bottom-1 rounded bg-black/60 px-1 py-0.5 text-[10px] font-bold text-white">{view.label}</span>
              )}
            </button>
          ))}
        </div>

        <div
          className={cn("relative flex min-h-0 items-center justify-center overflow-hidden rounded-md bg-black", panMode ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="absolute left-3 top-3 z-10 text-xs text-white/70">{study.title} - {activeView?.description}</div>
          <div className="absolute left-3 top-9 z-10 text-xs text-white/55">WW: {ww} | WL: {wl} | Zoom: {Math.round(zoom * 100)}%</div>
          <div className="absolute bottom-4 left-3 z-10 max-w-[240px] text-xs leading-5 text-white/60">WW: {ww}<br />WL: {wl}<br />{isMri ? "Sequence" : "View"}: {activeView?.label}<br />Series: {currentSeriesCount}{activeView?.emphasis ? <><br />Purpose: {activeView.emphasis}</> : null}</div>
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 text-xs text-white/65">A</div>
          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-xs text-white/65">P</div>
          <div className="absolute left-[20%] top-1/2 z-10 -translate-y-1/2 text-xs text-white/65">R</div>
          <div className="absolute right-[20%] top-1/2 z-10 -translate-y-1/2 text-xs text-white/65">L</div>
          <div className="absolute bottom-12 right-12 z-10 h-px w-16 bg-white/55">
            <span className="absolute -top-5 right-0 text-xs text-white/65">5 cm</span>
            <span className="absolute -right-1 -top-16 h-16 w-px bg-white/55" />
            <span className="absolute -right-1 -top-16 h-px w-2 bg-white/55" />
            <span className="absolute -right-1 -top-1 h-px w-2 bg-white/55" />
          </div>
          <img
            alt={`${study.title} scan`}
            className={cn(
              "relative max-h-[360px] max-w-full rounded-md border border-white/20 object-contain shadow-[0_0_80px_rgba(180,195,210,0.16)] transition-transform duration-200 sm:max-h-[460px]",
              study.modality === "X-Ray" ? "aspect-[4/5]" : "aspect-square",
            )}
            src={imagingReferenceImageSrc(study)}
            style={{
              filter: `${sequenceFilter} brightness(${brightness}) contrast(${contrast})`,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation + viewRotation}deg) ${flipped !== viewFlip ? "scaleX(-1)" : ""} scale(${viewScaleX}, ${viewScaleY})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ViewerToolButton({
  label,
  title,
  icon: Icon,
  onClick,
  active,
}: {
  label: string;
  title: string;
  icon: typeof ZoomIn;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      aria-label={title}
      className={cn(
        "flex h-8 items-center gap-1 border-r border-white/15 px-2 text-[11px] font-semibold text-white/70 transition last:border-r-0 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30",
        active && "bg-white/15 text-white",
      )}
      onClick={onClick}
      title={title}
      type="button"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function ViewerValueButton({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return (
    <button
      aria-label={title}
      className="flex h-8 min-w-8 items-center justify-center border-l border-white/15 px-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
      onClick={onClick}
      title={title}
      type="button"
    >
      {label}
    </button>
  );
}

export function DiagnosticHubPage() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [criticalReviewOpen, setCriticalReviewOpen] = React.useState(false);
  const [searchDraft, setSearchDraft] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const diagnosticMetrics = React.useMemo(() => getDiagnosticMetrics(reports, alerts), []);
  const filteredReports = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return reports;
    return reports.filter((report) => [report.id, report.name, report.category, report.status, report.orderedBy, report.collected, report.issued].some((field) => field.toLowerCase().includes(query)));
  }, [searchQuery]);

  return (
    <div className="space-y-4 pt-4">
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(240px,1.1fr)_repeat(3,minmax(180px,0.75fr))_auto] lg:items-center">
          <div className="col-span-2 flex items-center gap-3 lg:col-span-1">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <div className="text-base font-bold text-foreground">Rahul Verma</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">MRN: MRN123456 • 45 Y • Male</div>
              <div className="text-xs text-muted-foreground">Phone: 9876543210</div>
            </div>
          </div>
          <InfoBlock label="Encounter" value="IPD-2026-789" helper="Admitted on 08 Jun 2026" />
          <InfoBlock label="Location" value="ICU - 2" helper="Bed 12" />
          <InfoBlock label="Attending Doctor" value="Dr. Sharma" helper="Cardiology" />
          <Button
            asChild
            className="justify-self-end lg:col-span-1"
            size="sm"
            variant="outline"
          >
            <Link href="/patient-details">Patient Summary</Link>
          </Button>
        </CardContent>
      </Card>

      <DiagnosticHeader
        title="Diagnostic Hub"
        description="One encounter workspace for reports, result status, critical alerts, imaging review, and clinical trend context."
        actions={
          <>
            <Button onClick={() => setSearchOpen((current) => !current)} variant="outline">
              <Search className="h-4 w-4" />Search reports
            </Button>
            <Button onClick={() => setCriticalReviewOpen((current) => !current)}>
              <ShieldCheck className="h-4 w-4" />Review critical
            </Button>
          </>
        }
      />

      {searchOpen ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Search Reports</CardTitle>
            </div>
            <Badge tone="info">{filteredReports.length} matches</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm text-muted-foreground focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <Search className="h-4 w-4" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
                  onChange={(event) => setSearchDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSearchQuery(searchDraft);
                  }}
                  placeholder="CBC, MRI, DR-2026-0128, Dr. Sharma"
                  value={searchDraft}
                />
              </label>
              <Button onClick={() => { setSearchQuery(searchDraft); toast.success("Search applied", { description: "Recent Reports updated with matching records." }); }}>Apply search</Button>
              <Button onClick={() => { setSearchDraft(""); setSearchQuery(""); setSearchOpen(false); }} variant="outline">Clear search</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {criticalReviewOpen ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Critical Review Queue</CardTitle>
            </div>
            <StatusPill tone="critical">{diagnosticMetrics.criticalResults} open</StatusPill>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {alerts.map((alert) => (
              <div className={cn("rounded-xl border p-3", alert.tone === "danger" ? "border-critical/40 bg-critical/5" : "border-warning/35 bg-warning/5")} key={alert.test}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{alert.test} {alert.value}</div>
                    <div className={cn("mt-1 text-xs font-medium", alert.tone === "danger" ? "text-danger" : "text-warning")}>{alert.flag} • {alert.date}</div>
                  </div>
                  <Button
                    onClick={() => toast.success("Acknowledged", { description: `${alert.test} marked reviewed in the current worklist.` })}
                    size="sm"
                    variant="outline"
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <CategoryTabs />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="grid w-full max-w-[calc(100vw-1.5rem)] grid-cols-2 gap-2 sm:max-w-none sm:gap-3 xl:grid-cols-5">
            {diagnosticMetrics.metricCards.map((item) => <MetricCard item={item} key={item.label} />)}
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Reports</CardTitle>
              </div>
              <Badge tone="info">{filteredReports.length} selected</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border md:hidden">
                {filteredReports.map((report) => (
                  <div className="space-y-2 p-3" key={report.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-primary">{report.id}</div>
                        <div className="mt-0.5 text-sm font-semibold text-foreground">{report.name}</div>
                      </div>
                      <StatusPill tone={report.tone as StatusTone}>{report.status}</StatusPill>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <div><span className="text-muted-foreground">Category: </span><span className="font-medium text-foreground">{report.category}</span></div>
                      <div><span className="text-muted-foreground">Ordered by: </span><span className="font-medium text-foreground">{report.orderedBy}</span></div>
                      <div><span className="text-muted-foreground">Collected: </span><span className="font-medium text-foreground">{report.collected}</span></div>
                      <div><span className="text-muted-foreground">Issued: </span><span className="font-medium text-foreground">{report.issued}</span></div>
                    </div>
                    <div className="flex justify-end gap-1">
                      <Button aria-label="View report" asChild size="icon" variant="ghost">
                        <Link href={report.category === "Imaging" ? `${diagnosticHubBaseRoute}/imaging-report-view` : `${diagnosticHubBaseRoute}/report-details`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button aria-label="Download report" onClick={() => downloadDiagnosticReport(report)} size="icon" variant="ghost"><ArrowDownToLine className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {!filteredReports.length ? <div className="px-4 py-8 text-center text-sm text-muted-foreground">No reports match this search.</div> : null}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-[#f7f7fb] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {["Report ID", "Test Name", "Category", "Status", "Collected On", "Issued On", "Ordered By", "Actions"].map((heading) => (
                        <th className="border-b border-border px-4 py-3" key={heading}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr className="border-b border-border/70 last:border-0 hover:bg-surface-muted/80" key={report.id}>
                        <td className="px-4 py-3 font-semibold text-primary">{report.id}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{report.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{report.category}</td>
                        <td className="px-4 py-3"><StatusPill tone={report.tone as StatusTone}>{report.status}</StatusPill></td>
                        <td className="px-4 py-3 text-muted-foreground">{report.collected}</td>
                        <td className="px-4 py-3 text-muted-foreground">{report.issued}</td>
                        <td className="px-4 py-3 text-muted-foreground">{report.orderedBy}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button aria-label="View report" asChild size="icon" variant="ghost">
                              <Link href={report.category === "Imaging" ? `${diagnosticHubBaseRoute}/imaging-report-view` : `${diagnosticHubBaseRoute}/report-details`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              aria-label="Download report"
                              onClick={() => downloadDiagnosticReport(report)}
                              size="icon"
                              variant="ghost"
                            >
                              <ArrowDownToLine className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredReports.length ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={8}>No reports match this search.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-2 xl:block xl:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Alerts</CardTitle>
              <Button
                onClick={() => setCriticalReviewOpen(true)}
                size="sm"
                variant="ghost"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-1.5 p-2 sm:space-y-2 sm:p-[var(--density-card-padding)]">
              {alerts.map((alert) => (
                <div className={cn("flex items-center justify-between gap-1 rounded-lg border px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2", alert.tone === "danger" ? "border-critical/40 bg-critical/5" : "border-warning/35 bg-warning/5")} key={alert.test}>
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4", alert.tone === "danger" ? "text-danger" : "text-warning")} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">{alert.test} {alert.value}</div>
                      <div className={cn("text-xs font-medium", alert.tone === "danger" ? "text-danger" : "text-warning")}>{alert.flag}</div>
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{alert.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2 p-2 text-xs sm:p-[var(--density-card-padding)] sm:text-sm">
              {diagnosticMetrics.summaryRows.map(([label, value]) => (
                <div className="flex justify-between gap-3" key={label}>
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 text-xs text-muted-foreground">Last updated: 12 Jun 2026 11:20 AM</div>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  );
}

export function DiagnosticCategoryPage({ category }: { category: DiagnosticCategoryKey }) {
  const content = categoryContent[category];
  const categoryStats = React.useMemo(() => getCategoryStats(category, content.rows), [category, content.rows]);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchDraft, setSearchDraft] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const reviewRows = React.useMemo(() => content.rows.filter(isPendingCategoryRow), [content.rows]);
  const filteredRows = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return content.rows;
    return content.rows.filter((row) => row.some((field) => field.toLowerCase().includes(query)));
  }, [content.rows, searchQuery]);

  return (
    <div className="space-y-4 pt-4">
      <PatientContextCard />
      <DiagnosticHeader
        title={content.title}
        description={content.description}
        actions={
          <>
            <Button
              onClick={() => setSearchOpen((current) => !current)}
              variant="outline"
            >
              <Search className="h-4 w-4" />Search
            </Button>
            <Button onClick={() => setReviewOpen((current) => !current)}>
              <ClipboardCheck className="h-4 w-4" />Review queue
            </Button>
          </>
        }
      />
      <CategoryTabs />

      {searchOpen ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Search {content.title}</CardTitle>
            </div>
            <Badge tone="info">{filteredRows.length} matches</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm text-muted-foreground focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <Search className="h-4 w-4" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
                  onChange={(event) => setSearchDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSearchQuery(searchDraft);
                  }}
                  placeholder="Order, test, owner, status..."
                  value={searchDraft}
                />
              </label>
              <Button onClick={() => { setSearchQuery(searchDraft); toast.success("Search applied", { description: `${content.title} worklist updated.` }); }}>Apply search</Button>
              <Button onClick={() => { setSearchDraft(""); setSearchQuery(""); setSearchOpen(false); }} variant="outline">Clear search</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {reviewOpen ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{content.title} Review Queue</CardTitle>
            </div>
            <StatusPill tone={reviewRows.length ? "warning" : "success"}>{reviewRows.length} open</StatusPill>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {(reviewRows.length ? reviewRows : content.rows.filter((row) => row[3] === "Final").slice(0, 2)).map(([id, name, sample, status, owner, eta]) => (
              <div
                className={cn(
                  "rounded-lg border p-3",
                  getDiagnosticStatusTone(status) === "critical" && "border-critical/45 bg-critical/5",
                  getDiagnosticStatusTone(status) === "warning" && "border-warning/35 bg-warning/5",
                  getDiagnosticStatusTone(status) === "success" && "border-success/30 bg-success/5",
                  getDiagnosticStatusTone(status) === "info" && "border-info/25 bg-info/5",
                )}
                key={id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{id} - {sample} - {owner}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusPill tone={getDiagnosticStatusTone(status)}>{status}</StatusPill>
                      <Badge tone={eta === "Pending" ? "warning" : "muted"}>{eta}</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => toast.success("Marked for review", { description: `${id} added to the current review list.` })}
                    size="sm"
                    variant="outline"
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {categoryStats.map(([label, value, helper]) => (
          <Card
            className={cn(
              "min-h-[96px]",
              getDiagnosticMetricTone(label) === "critical" && "border-critical/45 bg-critical/5 ring-1 ring-critical/10",
              getDiagnosticMetricTone(label) === "warning" && "border-warning/35 bg-warning/5",
              getDiagnosticMetricTone(label) === "success" && "border-success/30 bg-success/5",
              getDiagnosticMetricTone(label) === "info" && "border-info/25 bg-info/5",
            )}
            key={label}
          >
            <CardContent>
              <div className="text-xs font-medium text-muted-foreground">{label}</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{content.title} Worklist</CardTitle>
            </div>
            <Badge tone="info">{filteredRows.length} records</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead className="bg-[#f7f7fb] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["Order ID", "Test / Study", "Sample / Modality", "Status", "Owner", "ETA / Issued", "Actions"].map((heading) => (
                      <th className="border-b border-border px-4 py-3" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(([id, name, sample, status, owner, eta]) => {
                    const tone = getDiagnosticStatusTone(status);
                    return (
                      <tr className="border-b border-border/70 last:border-0 hover:bg-surface-muted/80" key={id}>
                        <td className="px-4 py-3 font-semibold text-primary">{id}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{sample}</td>
                        <td className="px-4 py-3"><StatusPill tone={tone as StatusTone}>{status}</StatusPill></td>
                        <td className="px-4 py-3 text-muted-foreground">{owner}</td>
                        <td className="px-4 py-3 text-muted-foreground">{eta}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button aria-label="View" asChild size="icon" variant="ghost">
                              <Link href={category === "imaging" ? `${diagnosticHubBaseRoute}/imaging-report-view` : `${diagnosticHubBaseRoute}/report-details`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              aria-label="Download"
                              onClick={() => downloadDiagnosticReport({ id, name, category: content.title, status, issued: eta })}
                              size="icon"
                              variant="ghost"
                            >
                              <ArrowDownToLine className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredRows.length ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={7}>No worklist records match this search.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 xl:block xl:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Checks</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2 p-2 text-xs sm:p-[var(--density-card-padding)] sm:text-sm">
              {["Order linked to encounter", "Patient context verified", "Sample or study captured", "Result ready for clinical review"].map((item, index) => (
                <div className="flex items-center gap-2" key={item}>
                  <span className={cn("h-2.5 w-2.5 rounded-full", index < 3 ? "bg-success" : "bg-warning")} />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Focus</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2 p-2 text-xs text-muted-foreground sm:p-[var(--density-card-padding)] sm:text-sm">
              <p><span className="sm:hidden">Review critical and pending results.</span><span className="hidden sm:inline">Prioritize critical flags, unsigned reports, pending specimens or studies, and results that changed since the previous encounter.</span></p>
              <Button
                className="w-full"
                onClick={() => {
                  setReviewOpen(true);
                  toast.success("Review list opened", { description: `${content.title} review queue is visible above the worklist.` });
                }}
                variant="outline"
              >
                <span className="sm:hidden">Open list</span><span className="hidden sm:inline">Open review list</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export function DiagnosticReportDetailsPage() {
  return (
    <div className="max-w-full space-y-3 overflow-x-hidden pt-3 md:space-y-4 md:pt-4">
      <div className="flex max-w-full flex-col gap-2 overflow-x-hidden lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground md:mb-2 md:gap-2 md:text-sm">
            <Link className="hover:text-primary" href={diagnosticHubBaseRoute}>Reports</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Report Details</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Diagnostic Report Details</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={printDiagnosticPage} variant="outline">
            <Printer className="h-4 w-4" />Print
          </Button>
          <Button
            onClick={() => downloadDiagnosticReport(reports[0])}
            variant="outline"
          >
            <Download className="h-4 w-4" />Download
          </Button>
          <Button aria-label="More report actions" size="icon" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ReportDetailsDashboard />
      {false ? <Card className="hidden">
        <CardHeader>
          <div>
            <CardTitle>Complete Blood Count</CardTitle>
          </div>
          <StatusPill tone="success">Final</StatusPill>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <span><strong className="text-foreground">Report ID:</strong> DR-2026-0128</span>
            <span><strong className="text-foreground">Category:</strong> Laboratory</span>
            <span><strong className="text-foreground">Collected:</strong> 12 Jun 2026 09:30 AM</span>
            <span><strong className="text-foreground">Issued:</strong> 12 Jun 2026 11:00 AM</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f7f7fb] text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  {["Test", "Result", "Unit", "Reference Range", "Status"].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {resultRows.map((row) => (
                  <tr className="border-t border-border/70" key={row.test}>
                    <td className="px-4 py-3 font-medium">{row.test}</td>
                    <td className={cn("px-4 py-3 font-semibold", row.tone === "danger" && "text-danger")}>{row.result}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.unit}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.range}</td>
                    <td className="px-4 py-3"><StatusPill tone={row.tone as StatusTone}>{row.status}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> : null}
    </div>
  );
}

function GroupedLabReportCard() {
  const totalTests = labReportGroups.reduce((total, group) => total + group.rows.length, 0);
  const flaggedTests = labReportGroups.reduce((total, group) => total + group.rows.filter((row) => "abnormal" in row && row.abnormal).length, 0);

  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Complete Blood Count (CBC)</CardTitle>
        </div>
        <StatusPill tone="success">Final</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <ReportMeta label="Report ID" value="DR-2026-0128" />
          <ReportMeta label="Sample" value="Whole blood EDTA" />
          <ReportMeta label="Collected" value="12 Jun 2026 09:30 AM" />
          <ReportMeta label="Issued" value="12 Jun 2026 11:00 AM" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <div className="text-xs font-medium text-muted-foreground">Groups</div>
            <div className="mt-1 text-xl font-bold text-foreground">{labReportGroups.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <div className="text-xs font-medium text-muted-foreground">Parameters</div>
            <div className="mt-1 text-xl font-bold text-foreground">{totalTests}</div>
          </div>
          <div className="rounded-lg border border-border bg-danger/5 p-3">
            <div className="text-xs font-medium text-danger">Flagged</div>
            <div className="mt-1 text-xl font-bold text-danger">{flaggedTests}</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <div className="grid min-w-[760px] grid-cols-[minmax(240px,1.8fr)_120px_120px_minmax(160px,1fr)_120px] bg-[#f7f7fb] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div>Test Description</div>
            <div className="text-right">Value(s)</div>
            <div className="text-right">Unit(s)</div>
            <div className="text-right">Reference Range</div>
            <div className="text-right">Status</div>
          </div>
          <div>
            <div className="min-w-[760px]">
              {labReportGroups.map((group) => (
                <div key={group.title}>
                  <div className="border-t border-border bg-primary-soft px-4 py-2 text-sm font-bold text-primary">{group.title}</div>
                  {group.rows.map((row) => {
                    const abnormal = "abnormal" in row && row.abnormal;
                    return (
                      <div className="grid grid-cols-[minmax(240px,1.8fr)_120px_120px_minmax(160px,1fr)_120px] border-t border-border/70 px-4 py-3 text-sm hover:bg-surface-muted/80" key={`${group.title}-${row.test}`}>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{row.test}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{row.method}</div>
                        </div>
                        <div className={cn("text-right font-semibold text-foreground", abnormal && "text-danger")}>{row.value}</div>
                        <div className="text-right text-muted-foreground">{row.unit}</div>
                        <div className="text-right text-muted-foreground">{row.range}</div>
                        <div className="text-right">
                          <StatusPill tone={abnormal ? "danger" : "success"}>{abnormal ? "Review" : "Normal"}</StatusPill>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

void GroupedLabReportCard;

const reportDetailCategoryGroups = [
  { label: "Hematology", icon: Droplet, tone: "text-primary", items: ["CBC", "ESR", "Coagulation", "Peripheral Smear"] },
  { label: "Biochemistry", icon: FlaskConical, tone: "text-success", items: ["Liver Function Test", "Renal Function Test", "Electrolytes", "Lipid Profile", "Diabetes Profile"] },
  { label: "Microbiology", icon: TestTube2, tone: "text-success", items: ["Blood Culture", "Urine Culture", "Sputum Culture", "Organism Identification", "Antibiotic Sensitivity"] },
  { label: "Histopathology", icon: Activity, tone: "text-warning", items: ["Clinical History", "Gross Findings", "Microscopic Findings", "Diagnosis", "Pathologist Notes"] },
  { label: "Cytology", icon: ClipboardCheck, tone: "text-info", items: ["Sample Details", "Findings", "Diagnosis"] },
  { label: "Molecular Diagnostics", icon: Dna, tone: "text-primary", items: ["Test Details", "Marker Results"] },
  { label: "Radiology", icon: ImageIcon, tone: "text-info", items: ["Clinical Indication", "Technique", "Findings", "Impression", "Images"] },
  { label: "Cardiology", icon: HeartPulse, tone: "text-danger", items: ["ECG", "Echo", "Holter", "Stress Test"] },
  { label: "Pulmonary Diagnostics", icon: Waves, tone: "text-info", items: ["Spirometry", "PFT", "ABG"] },
  { label: "Neurology Diagnostics", icon: Brain, tone: "text-primary", items: ["EEG", "EMG", "NCS"] },
] as const;

const hematologyFindingGroups = [
  {
    title: "Complete Blood Count (CBC)",
    rows: [
      { test: "Hemoglobin", result: "13.6", unit: "g/dL", range: "13.0 - 17.0", status: "Normal", tone: "success", observation: "Within adult male range" },
      { test: "Total Leucocyte Count (TLC)", result: "6.8", unit: "10^3/uL", range: "4.0 - 10.0", status: "Normal", tone: "success", observation: "No leukocytosis" },
      { test: "Platelet Count", result: "211", unit: "10^3/uL", range: "150 - 410", status: "Normal", tone: "success", observation: "Adequate platelet count" },
    ],
  },
  {
    title: "ESR (Erythrocyte Sedimentation Rate)",
    rows: [
      { test: "ESR", result: "32", unit: "mm/hr", range: "0 - 20", status: "High", tone: "danger", observation: "Inflammatory marker raised" },
    ],
  },
  {
    title: "Coagulation / Mentzer Index",
    rows: [
      { test: "Mentzer Index", result: "18.87", unit: "%", range: "> 13", status: "Normal", tone: "success", observation: "Review with RBC indices" },
    ],
  },
] as const;

function ReportDetailsDashboard() {
  const [activeCategory, setActiveCategory] = React.useState<(typeof reportDetailCategoryGroups)[number]["label"]>("Hematology");
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const selectedCategory = reportDetailCategoryGroups.find((group) => group.label === activeCategory) ?? reportDetailCategoryGroups[0];

  return (
    <div className="max-w-full space-y-3 overflow-x-hidden md:space-y-4">
      <ReportDetailIdentityPanel />
      <ReportDetailAlertBanner onToggleSummary={() => setSummaryOpen((current) => !current)} summaryOpen={summaryOpen} />
      {summaryOpen ? <ReportHealthSummary /> : null}
      <ReportDetailAttachmentsCompact />
      <section className="grid max-w-full gap-3 overflow-x-hidden md:gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <ReportDetailGroupList activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
        <main className="min-w-0 max-w-full space-y-3 overflow-x-hidden md:space-y-4">
          <ReportDetailActiveCategory category={selectedCategory} key={activeCategory} />
        </main>
      </section>
    </div>
  );
}

function ReportDetailIdentityPanel() {
  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardContent className="p-3 md:p-[var(--density-card-padding)]">
        <div className="grid gap-2 lg:grid-cols-3 lg:gap-5">
          <ReportDetailInfoGroup title="Report Header" rows={[["Report Name", "Complete Blood Count"], ["Report Category", "Laboratory"], ["Visit Type", "IPD"]]} />
          <ReportDetailInfoGroup rows={[["Sample Type", "Blood / EDTA"], ["Collection Date", "12 Jun 2026, 09:30 AM"], ["Encounter ID", "IPD-2026-789"]]} />
          <ReportDetailInfoGroup rows={[["Report Date", "12 Jun 2026, 11:00 AM"], ["Ordered By", "Dr. Sharma"], ["Verified By", "Dr. Sharma"]]} status="Final Report" />
        </div>
      </CardContent>
    </Card>
  );
}

function ReportDetailInfoGroup({ rows, status, title }: { rows: readonly (readonly [string, string])[]; status?: string; title?: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2 border-t border-border pt-3 text-xs sm:text-sm lg:block lg:space-y-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
      {title ? <div className="col-span-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</div> : null}
      {rows.map(([label, value]) => (
        <div className="min-w-0" key={label}>
          <div className="text-xs font-semibold text-muted-foreground">{label}</div>
          <div className="mt-0.5 break-words font-medium text-foreground">{value}</div>
        </div>
      ))}
      {status ? <div className="col-span-2"><StatusPill tone="success">{status}</StatusPill></div> : null}
    </div>
  );
}

function ReportDetailAlertBanner({ onToggleSummary, summaryOpen }: { onToggleSummary: () => void; summaryOpen: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-critical/45 bg-critical/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between md:rounded-xl md:px-4 md:py-3">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-critical text-critical-foreground md:h-10 md:w-10">
          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-critical">Critical Findings / Alerts</div>
          <div className="text-sm font-semibold text-foreground md:text-base">Abnormal Results Found (3)</div>
        </div>
        <Badge tone="danger">ESR HIGH</Badge>
        <Badge tone="danger">SGPT HIGH</Badge>
        <Badge tone="danger">CRP HIGH</Badge>
      </div>
      <Button onClick={onToggleSummary} variant="ghost">
        {summaryOpen ? "Hide Health Summary" : "View Health Summary"} <ArrowDownToLine className={cn("h-4 w-4 transition", summaryOpen ? "rotate-180" : "-rotate-90")} />
      </Button>
    </div>
  );
}

function ReportHealthSummary() {
  const summary = [
    { label: "Blood Counts", value: "ESR 32 mm/hr", status: "Please watchout", tone: "danger" },
    { label: "Liver Profile", value: "SGPT / ALT 52.5 U/L", status: "Please watchout", tone: "danger" },
    { label: "Inflammation Marker", value: "CRP 32.87 mg/L", status: "Please watchout", tone: "danger" },
    { label: "Anemia Studies", value: "CBC indices stable", status: "Looks good", tone: "success" },
  ] as const;

  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Health Summary</CardTitle>
        </div>
        <Badge tone="warning">3 watchouts</Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 p-3 md:gap-3 md:p-[var(--density-card-padding)] xl:grid-cols-4">
        {summary.map((item) => (
          <div className={cn("rounded-lg border p-3", item.tone === "danger" ? "border-danger/25 bg-danger/5" : "border-success/25 bg-success/5")} key={item.label}>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.label}</div>
            <div className="mt-2 text-sm font-semibold text-foreground">{item.value}</div>
            <div className="mt-2">
              <StatusPill tone={item.tone as StatusTone}>{item.status}</StatusPill>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReportDetailAttachmentsCompact() {
  const attachments = [
    { label: "Report PDF", size: "1.2 MB", icon: FileText, tone: "danger" },
    { label: "Diagnostic Images", size: "3 files", icon: FileImage, tone: "info" },
    { label: "Referral Slip", size: "312 KB", icon: FileCheck2, tone: "success" },
  ] as const;

  function downloadReportAttachment(label: string) {
    const baseLines = [
      "Patient: Rahul Verma",
      "MRN: MRN123456",
      "Encounter: IPD-2026-789",
      "Report: Complete Blood Count",
      "Status: Final Report",
      "Report Date: 12 Jun 2026, 11:00 AM",
    ];

    if (label === "Report PDF") {
      downloadPdf("Diagnostic Report Details", "diagnostic-report-details.pdf", [
        ...baseLines,
        "",
        "Critical Findings:",
        "ESR: 32 mm/hr - High",
        "SGPT / ALT: 52.5 U/L - High",
        "CRP: 32.87 mg/L - High",
        "",
        "CBC:",
        "Hemoglobin: 13.6 g/dL",
        "TLC: 6.8 10^3/uL",
        "Platelet Count: 211 10^3/uL",
      ]);
      return;
    }

    if (label === "Diagnostic Images") {
      downloadPdf("Diagnostic Images Summary", "diagnostic-images-summary.pdf", [
        ...baseLines,
        "",
        "Media included in report:",
        "Microscopy Images",
        "CT Images",
        "MRI Images",
        "X-Ray Images",
        "",
        "Image binaries are linked in the diagnostic media archive.",
      ]);
      return;
    }

    downloadPdf("Referral Slip", "referral-slip.pdf", [
      ...baseLines,
      "",
      "Ordered By: Dr. Sharma",
      "Booking Centre: ICU - 2 / Bed 12",
      "Sample Type: Blood / EDTA",
      "Collection Date: 12 Jun 2026, 09:30 AM",
    ]);
  }

  return (
    <Card>
      <CardContent className="grid gap-2 p-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-center md:gap-3 md:p-[var(--density-card-padding)]">
        <div className="hidden md:block">
          <div className="text-sm font-semibold text-foreground">Attachments & Media</div>
        </div>
        <div className="grid min-w-0 grid-cols-3 gap-2">
          {attachments.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className="flex min-h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface-muted px-2 py-2 text-left transition hover:border-primary/40 hover:bg-primary-soft md:min-h-12 md:gap-3 md:px-3"
                key={item.label}
                onClick={() => downloadReportAttachment(item.label)}
                type="button"
              >
                <span className={cn("hidden h-8 w-8 shrink-0 items-center justify-center rounded-md sm:flex", item.tone === "danger" && "bg-danger/10 text-danger", item.tone === "info" && "bg-info/10 text-info", item.tone === "success" && "bg-success/10 text-success")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-foreground md:text-sm">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">{item.size}</span>
                </span>
                <Download className="h-4 w-4 shrink-0 text-primary" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportDetailGroupList({
  activeCategory,
  onSelectCategory,
}: {
  activeCategory: (typeof reportDetailCategoryGroups)[number]["label"];
  onSelectCategory: (category: (typeof reportDetailCategoryGroups)[number]["label"]) => void;
}) {
  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardHeader className="hidden xl:flex">
        <div>
          <CardTitle>Report Groups</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-px bg-border p-0 xl:block xl:bg-transparent">
        {reportDetailCategoryGroups.map((group) => {
          const Icon = group.icon;
          const active = group.label === activeCategory;
          return (
            <button
              className={cn(
                "w-full min-w-0 bg-white px-2.5 py-2 text-left text-xs transition hover:bg-surface-muted xl:border-b xl:border-border xl:px-4 xl:py-3 xl:text-sm xl:last:border-0",
                active && "bg-primary text-primary-foreground hover:bg-primary",
              )}
              key={group.label}
              onClick={() => onSelectCategory(group.label)}
              type="button"
            >
              <div className="flex min-h-7 items-center gap-1.5 xl:min-h-8 xl:gap-3">
                <Icon className={cn("h-4 w-4 shrink-0 xl:h-5 xl:w-5", active ? "text-primary-foreground" : group.tone)} />
                <span className="min-w-0 flex-1 truncate font-semibold">{group.label}</span>
                <ChevronRight className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-muted-foreground")} />
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function getReportDetailFindingGroups(category: (typeof reportDetailCategoryGroups)[number]["label"]) {
  if (category === "Hematology") return hematologyFindingGroups;

  const groupsByCategory = {
    Biochemistry: [
      {
        title: "Liver Function Test",
        rows: [
          { test: "SGPT / ALT", result: "52.5", unit: "U/L", range: "Up to 41", status: "High", tone: "danger", observation: "Mild transaminitis; correlate clinically" },
          { test: "SGOT / AST", result: "35.4", unit: "U/L", range: "Up to 40", status: "Normal", tone: "success", observation: "Within reference range" },
          { test: "Bilirubin Total", result: "0.56", unit: "mg/dL", range: "0 - 1.2", status: "Normal", tone: "success", observation: "No hyperbilirubinemia" },
        ],
      },
      {
        title: "Renal Function / Electrolytes",
        rows: [
          { test: "Creatinine", result: "0.9", unit: "mg/dL", range: "0.6 - 1.2", status: "Normal", tone: "success", observation: "Renal marker stable" },
          { test: "Sodium", result: "138", unit: "mmol/L", range: "135 - 145", status: "Normal", tone: "success", observation: "Electrolyte balance maintained" },
        ],
      },
    ],
    Microbiology: [
      {
        title: "Culture & Organism Identification",
        rows: [
          { test: "Blood Culture", result: "No growth", unit: "-", range: "No growth", status: "Final", tone: "success", observation: "No organism isolated" },
          { test: "Urine Culture", result: "Sterile", unit: "-", range: "Sterile", status: "Final", tone: "success", observation: "No significant bacteriuria" },
          { test: "Antibiotic Sensitivity", result: "No AST trigger", unit: "-", range: "As applicable", status: "Final", tone: "success", observation: "No organism requiring sensitivity panel" },
        ],
      },
    ],
    Histopathology: [
      {
        title: "Histopathology Review",
        rows: [
          { test: "Clinical History", result: "Fever workup", unit: "-", range: "Clinical notes", status: "Final", tone: "success", observation: "History captured" },
          { test: "Gross Findings", result: "No tissue specimen", unit: "-", range: "-", status: "Final", tone: "success", observation: "No histology specimen registered for this encounter" },
          { test: "Pathologist Notes", result: "No histology order", unit: "-", range: "-", status: "Final", tone: "success", observation: "Histopathology review not active for this encounter" },
        ],
      },
    ],
    Cytology: [
      {
        title: "Cytology Details",
        rows: [
          { test: "Sample Details", result: "No cytology specimen", unit: "-", range: "-", status: "Final", tone: "success", observation: "No cytology specimen registered for this encounter" },
          { test: "Findings", result: "No active cytology", unit: "-", range: "-", status: "Final", tone: "success", observation: "Review when specimen is received" },
          { test: "Diagnosis", result: "No active diagnosis", unit: "-", range: "-", status: "Final", tone: "success", observation: "No cytology diagnosis issued" },
        ],
      },
    ],
    "Molecular Diagnostics": [
      {
        title: "Marker Results",
        rows: [
          { test: "Test Details", result: "No molecular panel", unit: "-", range: "-", status: "Final", tone: "success", observation: "Molecular panel not active for this encounter" },
          { test: "Marker Result", result: "Not detected", unit: "-", range: "Not detected", status: "Normal", tone: "success", observation: "No marker flag in current report" },
        ],
      },
    ],
    Radiology: [
      {
        title: "Radiology Report",
        rows: [
          { test: "Clinical Indication", result: "Fever evaluation", unit: "-", range: "Clinical note", status: "Final", tone: "success", observation: "No acute imaging concern recorded" },
          { test: "Technique", result: "Digital imaging", unit: "-", range: "Protocol", status: "Final", tone: "success", observation: "Images linked in attachments" },
          { test: "Impression", result: "No acute abnormality", unit: "-", range: "Clinical correlation", status: "Normal", tone: "success", observation: "Review if symptoms persist" },
        ],
      },
    ],
    Cardiology: [
      {
        title: "Cardiology Diagnostics",
        rows: [
          { test: "ECG", result: "Sinus rhythm", unit: "-", range: "Normal rhythm", status: "Normal", tone: "success", observation: "No acute ECG flag" },
          { test: "Echo", result: "No active echo order", unit: "-", range: "-", status: "Final", tone: "success", observation: "Cardiac imaging order not active" },
          { test: "Stress Test", result: "No active order", unit: "-", range: "-", status: "Final", tone: "success", observation: "No stress-test request for this encounter" },
        ],
      },
    ],
    "Pulmonary Diagnostics": [
      {
        title: "Pulmonary Diagnostics",
        rows: [
          { test: "Spirometry", result: "No active order", unit: "-", range: "-", status: "Final", tone: "success", observation: "No PFT record for this encounter" },
          { test: "PFT", result: "Not available", unit: "-", range: "-", status: "Final", tone: "success", observation: "Can be added for respiratory symptoms" },
          { test: "ABG", result: "No active ABG order", unit: "-", range: "-", status: "Final", tone: "success", observation: "No ABG request linked to this report" },
        ],
      },
    ],
    "Neurology Diagnostics": [
      {
        title: "Neurology Diagnostics",
        rows: [
          { test: "EEG", result: "No active order", unit: "-", range: "-", status: "Final", tone: "success", observation: "No EEG request for this encounter" },
          { test: "EMG / NCS", result: "Not available", unit: "-", range: "-", status: "Final", tone: "success", observation: "Neurology tests remain grouped here" },
        ],
      },
    ],
  } satisfies Record<Exclude<(typeof reportDetailCategoryGroups)[number]["label"], "Hematology">, readonly {
    title: string;
    rows: readonly { test: string; result: string; unit: string; range: string; status: string; tone: string; observation: string }[];
  }[]>;

  return groupsByCategory[category];
}

function ReportDetailActiveCategory({ category }: { category: (typeof reportDetailCategoryGroups)[number] }) {
  const Icon = category.icon;
  const findingGroups = getReportDetailFindingGroups(category.label);
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Card className="min-w-0 max-w-full overflow-hidden">
      <CardHeader className="items-center gap-2 px-3 py-2 md:px-[var(--density-card-header-x)] md:py-[var(--density-card-header-y)]">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger md:h-11 md:w-11 md:rounded-xl">
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">{category.label}</CardTitle>
          </div>
        </div>
        <Button className="shrink-0 px-2 md:px-3" onClick={() => setCollapsed((current) => !current)} size="sm" variant="outline">
          <span className="hidden md:inline">{collapsed ? "Expand All" : "Collapse All"}</span>
          <ChevronUp className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-3 md:space-y-4 md:p-[var(--density-card-padding)]">
        {collapsed ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center text-sm font-medium text-muted-foreground">
            {findingGroups.length} finding groups collapsed.
          </div>
        ) : findingGroups.map((group) => <ReportDetailFindingGroup group={group} key={group.title} />)}
      </CardContent>
    </Card>
  );
}

function ReportDetailFindingGroup({
  group,
}: {
  group: {
    title: string;
    rows: readonly { test: string; result: string; unit: string; range: string; status: string; tone: string; observation: string }[];
  };
}) {
  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border md:rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted px-3 py-2 md:px-4 md:py-3">
        <div className="text-sm font-bold text-primary md:text-base">{group.title}</div>
        <ChevronUp className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="hidden grid-cols-[1.2fr_0.65fr_0.55fr_0.9fr_0.65fr_1.25fr] gap-3 border-b border-border bg-[#f7f7fb] px-4 py-3 text-xs font-semibold text-muted-foreground lg:grid">
          {["Test Name", "Result", "Unit", "Reference Range", "Status", "Observation"].map((heading) => <div key={heading}>{heading}</div>)}
        </div>
        {group.rows.map((row) => (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-border/70 px-3 py-2 text-xs last:border-0 hover:bg-surface-muted/70 sm:text-sm lg:grid-cols-[1.2fr_0.65fr_0.55fr_0.9fr_0.65fr_1.25fr] lg:gap-3 lg:px-4 lg:py-3" key={row.test}>
            <ReportResultCell label="Test Name" value={row.test} strong wrapperClassName="col-span-2 lg:col-span-1" />
            <ReportResultCell label="Result" value={row.result} className={row.tone === "danger" ? "text-danger" : "text-foreground"} strong />
            <ReportResultCell label="Unit" value={row.unit} />
            <ReportResultCell label="Reference Range" value={row.range} />
            <div className="min-w-0">
              <div className="mb-1 text-xs font-semibold text-muted-foreground lg:hidden">Status</div>
              <StatusPill tone={row.tone as StatusTone}>{row.status}</StatusPill>
            </div>
            <ReportResultCell label="Observation" value={row.observation} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportResultCell({ label, value, strong, className, wrapperClassName }: { label: string; value: string; strong?: boolean; className?: string; wrapperClassName?: string }) {
  return (
    <div className={cn("min-w-0", wrapperClassName)}>
      <div className="mb-1 text-xs font-semibold text-muted-foreground lg:hidden">{label}</div>
      <div className={cn("break-words text-muted-foreground", strong && "font-semibold text-foreground", className)}>{value}</div>
    </div>
  );
}

function ReportDetailAttachmentsPanel() {
  const attachments = [
    { label: "Report PDF", size: "1.2 MB", icon: FileText, tone: "danger" },
    { label: "Diagnostic Images", size: "3 files", icon: FileImage, tone: "info" },
    { label: "Referral Slip", size: "312 KB", icon: FileCheck2, tone: "success" },
  ] as const;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Attachments & Media</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {attachments.map((item) => {
            const Icon = item.icon;
            return (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3" key={item.label}>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", item.tone === "danger" && "bg-danger/10 text-danger", item.tone === "info" && "bg-info/10 text-info", item.tone === "success" && "bg-success/10 text-success")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.size}</div>
                </div>
                <Button
                  aria-label={`Download ${item.label}`}
                  onClick={() => toast.success(`${item.label} ready`, { description: "Attachment download started." })}
                  size="icon"
                  variant="ghost"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full"
          onClick={() => downloadPdf("Diagnostic Attachments Bundle", "diagnostic-attachments-bundle.pdf", [
            "Patient: Rahul Verma",
            "MRN: MRN123456",
            "Encounter: IPD-2026-789",
            "Report: Complete Blood Count",
            "",
            "Included PDFs:",
            "1. Report PDF",
            "2. Diagnostic Images Summary",
            "3. Referral Slip",
            "",
            "Critical Flags: ESR HIGH, SGPT HIGH, CRP HIGH",
          ])}
          variant="outline"
        >
          View All Attachments <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ReportDetailAuditTimeline() {
  const steps = [
    ["Ordered", "12 Jun 2026, 09:15 AM"],
    ["Sample Collected", "12 Jun 2026, 09:30 AM"],
    ["Processing", "12 Jun 2026, 10:10 AM"],
    ["Validated", "12 Jun 2026, 10:45 AM"],
    ["Verified", "12 Jun 2026, 10:55 AM"],
    ["Final Report Released", "12 Jun 2026, 11:00 AM"],
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Progress</CardTitle>
        <Badge tone="success">Complete</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map(([label, time], index) => (
            <div className="flex gap-3 rounded-lg border border-border bg-surface-muted p-3" key={label}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-sm font-bold text-success">
                {index + 1}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

void ReportDetailAttachmentsPanel;
void ReportDetailAuditTimeline;

export function DiagnosticImagingReportPage() {
  const [activeTab, setActiveTab] = React.useState<"report" | "images" | "clinical" | "attachments" | "history">("images");
  const [selectedStudyId, setSelectedStudyId] = React.useState<ImagingStudy["id"]>("mri-brain");
  const selectedStudy = imagingStudies.find((study) => study.id === selectedStudyId) ?? imagingStudies[0];
  const tabs = [
    { id: "report", label: "Report", icon: FileText },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "clinical", label: "Clinical Impression", icon: ClipboardList },
    { id: "attachments", label: "Attachments", icon: FileArchive },
    { id: "history", label: "History", icon: UserCheck },
  ] as const;

  return (
    <div className="diagnostic-print-area space-y-4 pt-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-white px-4 py-4 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Button asChild size="icon" variant="ghost" aria-label="Back to diagnostic hub">
                <Link href={diagnosticHubBaseRoute}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <span>Diagnostics Hub</span>
              <span>/</span>
              <span className="text-foreground">Imaging Report</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{selectedStudy.title}</h1>
              <StatusPill tone={selectedStudy.status === "Final" ? "success" : "warning"}>{selectedStudy.status}</StatusPill>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" data-print-hidden="true">
            <Button onClick={() => downloadImagingReportPdf(selectedStudy)} variant="outline">
              <Download className="h-4 w-4" />Download Report
            </Button>
            <Button onClick={printDiagnosticPage} variant="outline">
              <Printer className="h-4 w-4" />Print
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:gap-3 xl:grid-cols-5">
          <ReportMeta label="Report ID" value={selectedStudy.reportId} />
          <ReportMeta label="Category" value={selectedStudy.category} />
          <ReportMeta label="Status" value={selectedStudy.status} tone={selectedStudy.status === "Final" ? "success" : "warning"} />
          <ReportMeta label="Study Date" value={selectedStudy.studyDate} />
          <ReportMeta label="Issued On" value={selectedStudy.issuedOn} />
        </div>
      </div>

      <Card data-print-hidden="true">
        <CardHeader>
          <div>
            <CardTitle>Switch Imaging Report</CardTitle>
          </div>
          <Badge tone="info">{imagingStudies.length} studies</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 md:gap-3">
          {imagingStudies.map((study) => (
            <button
              className={cn(
                "flex min-h-11 items-center justify-center rounded-lg border border-border bg-white p-2 text-center text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary-soft/30 focus:outline-none focus:ring-2 focus:ring-primary/20 md:block md:p-3 md:text-left",
                selectedStudy.id === study.id && "border-primary bg-primary-soft shadow-[0_0_0_1px_hsl(var(--primary))]",
              )}
              key={study.id}
              onClick={() => {
                setSelectedStudyId(study.id);
                setActiveTab("images");
              }}
              type="button"
            >
              <span className="md:hidden">{study.shortLabel}</span>
              <div className="hidden items-start justify-between gap-2 md:flex">
                <div>
                  <div className="text-sm font-bold text-foreground">{study.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{study.reportId} - {study.modality} / {study.bodyPart}</div>
                </div>
                <StatusPill tone={study.status === "Final" ? "success" : "warning"}>{study.status}</StatusPill>
              </div>
              <div className="mt-3 hidden aspect-[4/3] overflow-hidden rounded-md bg-black md:block">
                <img alt={`${study.title} thumbnail`} className="h-full w-full object-contain" src={imagingReferenceImageSrc(study)} />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-2" role="tablist" aria-label="Imaging report sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  aria-selected={activeTab === tab.id}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-semibold text-muted-foreground transition hover:text-foreground",
                    activeTab === tab.id ? "border-primary text-primary" : "border-transparent",
                  )}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-4 p-3 sm:p-4">
            {activeTab === "images" ? (
              <>
                <ImagingViewer study={selectedStudy} />
                <StudyInformation study={selectedStudy} />
              </>
            ) : null}
            {activeTab === "report" ? <ImagingReportTab study={selectedStudy} /> : null}
            {activeTab === "clinical" ? <ClinicalImpressionTab study={selectedStudy} /> : null}
            {activeTab === "attachments" ? <AttachmentsTab study={selectedStudy} /> : null}
            {activeTab === "history" ? <HistoryTab study={selectedStudy} /> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportMeta({ label, value, tone }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-muted px-2 py-2 sm:px-3">
      <div className="text-[11px] font-semibold text-muted-foreground sm:text-xs">{label}</div>
      <div className={cn("mt-0.5 break-words text-xs font-bold text-foreground sm:mt-1 sm:text-sm", tone === "success" && "text-success")}>{value}</div>
    </div>
  );
}

function downloadImagingReportPdf(study: ImagingStudy) {
  downloadPdf(`${study.title} ${study.status} Report`, `${study.reportId.toLowerCase()}-${study.title.toLowerCase().replaceAll(" ", "-")}-report.pdf`, [
    `Report ID: ${study.reportId}`,
    "Patient: Rahul Verma",
    "Encounter: IPD-2026-789",
    `Category: ${study.category}`,
    `Status: ${study.status}`,
    `Study Date: ${study.studyDate}`,
    `Issued On: ${study.issuedOn}`,
    `Radiologist: ${study.radiologist}`,
    `Procedure: ${study.procedure}`,
    `Clinical Indication: ${study.clinicalIndication}`,
    `Findings: ${study.findings}`,
    `Impression: ${study.impression}`,
    `Recommendation: ${study.recommendation}`,
  ]);
}

function StudyInformation({ study }: { study: ImagingStudy }) {
  const studyRows = [
    ["Study Name", study.title],
    ["Modality", study.modality],
    ["Body Part", study.bodyPart],
    ["Ordering Doctor", study.orderedBy],
    ["Study Date", study.studyDate],
    ["Report Date", study.issuedOn],
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Study Information</CardTitle>
          </div>
          <StatusPill tone={study.status === "Final" ? "success" : "warning"}>{study.status}</StatusPill>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {studyRows.map(([label, value]) => <ReportMeta key={label} label={label} value={value} />)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Image Information</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoLine label="Current series" value={study.seriesCount} />
          <InfoLine label="Window width" value={study.windowWidth} />
          <InfoLine label="Window level" value={study.windowLevel} />
          <InfoLine label="Report status" value={study.status} />
        </CardContent>
      </Card>
    </section>
  );
}

function ImagingReportTab({ study }: { study: ImagingStudy }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Radiology Report</CardTitle>
          </div>
          <StatusPill tone={study.status === "Final" ? "success" : "warning"}>{study.status}</StatusPill>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReportSection title="Procedure">{study.procedure}</ReportSection>
          <ReportSection title="Clinical Indication">{study.clinicalIndication}</ReportSection>
          <ReportSection title="Technique">{study.technique}</ReportSection>
          <ReportSection title="Findings">{study.findings}</ReportSection>
          <ReportSection title="Impression">{study.impression}</ReportSection>
          <ReportSection title="Recommendation">{study.recommendation}</ReportSection>
        </CardContent>
      </Card>
      <ReportSummaryCard study={study} />
    </section>
  );
}

function ClinicalImpressionTab({ study }: { study: ImagingStudy }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Summary</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          {study.clinicalIndication}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Final Impression</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusPill tone={study.status === "Final" ? "success" : "warning"}>{study.status} diagnostic impression</StatusPill>
          <p className="text-sm leading-6 text-muted-foreground">{study.impression}</p>
        </CardContent>
      </Card>
    </section>
  );
}

function AttachmentsTab({ study }: { study: ImagingStudy }) {
  const attachments = [
    {
      name: "PDF Report",
      type: "PDF",
      size: "248 KB",
      icon: FileDown,
      fileName: `${study.reportId.toLowerCase()}-${study.title.toLowerCase().replaceAll(" ", "-")}-report.pdf`,
      previewTitle: `${study.title} ${study.status} Report`,
      previewLines: [
        `Report ID: ${study.reportId}`,
        `Status: ${study.status}`,
        `Procedure: ${study.title}`,
        `Findings: ${study.findings}`,
        `Impression: ${study.impression}`,
        `Recommendation: ${study.recommendation}`,
      ],
    },
    {
      name: "Supporting Documents",
      type: "DOC",
      size: "1.2 MB",
      icon: FileText,
      fileName: `${study.reportId.toLowerCase()}-supporting-documents.pdf`,
      previewTitle: "Supporting Clinical Documents",
      previewLines: [
        `Clinical indication: ${study.clinicalIndication}`,
        `Ordering doctor: ${study.orderedBy}`,
        "Patient: Rahul Verma",
        `Study date: ${study.studyDate}`,
        `Notes: Prior clinical summary and ${study.modality} request are attached.`,
      ],
    },
    {
      name: study.modality === "X-Ray" ? "Radiograph Image" : "DICOM Files",
      type: study.modality === "X-Ray" ? "IMAGE" : "DICOM",
      size: study.modality === "X-Ray" ? "14 MB" : "86 MB",
      icon: FileArchive,
      fileName: `${study.reportId.toLowerCase()}-${study.modality.toLowerCase()}-image-manifest.pdf`,
      previewTitle: `${study.modality} Image Manifest`,
      previewLines: [
        `Study UID: 1.2.840.113619.2.55.3.604688433.${study.reportId.replaceAll("-", "")}`,
        `Modality: ${study.modality}`,
        `Body part: ${study.bodyPart}`,
        `Current series: ${study.seriesCount}`,
        `Image reference: ${study.modality} series available`,
        "Use the source PACS study for diagnostic interpretation.",
      ],
    },
  ];
  const [selected, setSelected] = React.useState(attachments[0]);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    setSelected(attachments[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [study.id]);

  function downloadAttachment(item: (typeof attachments)[number]) {
    downloadPdf("Plasmit Hospital HMS - Imaging Attachment", item.fileName, [
      `Attachment: ${item.name}`,
      `Type: ${item.type}`,
      `Size: ${item.size}`,
      "",
      ...item.previewLines,
    ]);
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
        {attachments.map((item) => {
          const Icon = item.icon;
          const active = selected.name === item.name;
          return (
            <Card className={cn("transition", active && "border-primary shadow-[0_0_0_1px_hsl(var(--primary))]")} key={item.name}>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.type} - {item.size}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => {
                      setSelected(item);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAttachment(item)}>
                    <Download className="h-4 w-4" />Download
                  </Button>
                  <Button size="sm" variant="ghost" onClick={printDiagnosticPage}>
                    <Printer className="h-4 w-4" />Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{selected.previewTitle}</CardTitle>
          </div>
          <StatusPill tone="success">Ready</StatusPill>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImagingAttachmentPreview selected={selected} study={study} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={printDiagnosticPage}>
              <Printer className="h-4 w-4" />Print Preview
            </Button>
            <Button onClick={() => downloadAttachment(selected)}>
              <Download className="h-4 w-4" />Download {selected.type}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CenterModal
        className="w-[min(94vw,760px)]"
        description={`${selected.name} for ${study.title} report ${study.reportId}.`}
        onOpenChange={setPreviewOpen}
        open={previewOpen}
        title={selected.previewTitle}
      >
        <div className="space-y-4">
          <ImagingAttachmentPreview selected={selected} study={study} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={printDiagnosticPage}>
              <Printer className="h-4 w-4" />Print Preview
            </Button>
            <Button onClick={() => downloadAttachment(selected)}>
              <Download className="h-4 w-4" />Download {selected.type}
            </Button>
          </div>
        </div>
      </CenterModal>
    </section>
  );
}

function ImagingAttachmentPreview({
  selected,
  study,
}: {
  selected: { name: string; type: string; previewLines: readonly string[] };
  study: ImagingStudy;
}) {
  const showImage = selected.type === "IMAGE" || selected.type === "DICOM";

  return (
    <div className="min-h-[320px] rounded-lg border border-border bg-white p-4 shadow-inner">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div>
          <div className="text-sm font-bold text-foreground">Plasmit Hospital</div>
          <div className="text-xs text-muted-foreground">Diagnostic Imaging Attachment</div>
        </div>
        <Badge tone="info">{selected.type}</Badge>
      </div>
      {showImage ? (
        <div className="mb-4 overflow-hidden rounded-lg border border-slate-800 bg-black p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-white/70">
            <span>{study.title} - {study.seriesLabel}</span>
            <span>{study.reportId}</span>
          </div>
          <div className="flex min-h-[300px] items-center justify-center rounded bg-black">
            <img
              alt={`${study.title} attachment preview`}
              className={cn("max-h-[420px] w-full object-contain", study.modality === "X-Ray" ? "aspect-[4/5]" : "aspect-square")}
              src={imagingReferenceImageSrc(study)}
            />
          </div>
        </div>
      ) : null}
      <div className="space-y-3">
        {selected.previewLines.map((line) => (
          <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground" key={line}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ study }: { study: ImagingStudy }) {
  const timeline = [
    ["Created By", `Radiology Tech - ${study.studyDate}`],
    ["Modified By", `${study.radiologist} - ${study.issuedOn === "Pending" ? "Draft pending" : study.issuedOn}`],
    ["Verified By", study.status === "Final" ? `Senior Radiologist - ${study.issuedOn}` : "Pending verification"],
    ["Approved By", study.status === "Final" ? `${study.radiologist} - ${study.issuedOn}` : "Pending approval"],
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Report Ownership</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {timeline.map(([label, value]) => <InfoLine key={label} label={label} value={value} />)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Audit Timeline</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {["Study acquired", "Images uploaded", "Report drafted", "Report verified", "Final report approved"].map((item, index) => (
            <div className="flex gap-3 rounded-md border border-border bg-surface-muted p-3" key={item}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">{index + 1}</div>
              <div>
                <div className="text-sm font-semibold text-foreground">{item}</div>
                <div className="text-xs text-muted-foreground">{study.studyDate} - audit event captured</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function ReportSummaryCard({ study }: { study: ImagingStudy }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Metadata</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <InfoLine label="Study Name" value={study.title} />
        <InfoLine label="Report ID" value={study.reportId} />
        <InfoLine label="Category" value={study.category} />
        <InfoLine label="Radiologist" value={study.radiologist} />
        <InfoLine label="Status" value={study.status} />
        <Button className="mt-2 w-full" onClick={() => downloadImagingReportPdf(study)}>
          <ArrowDownToLine className="h-4 w-4" />Download PDF
        </Button>
      </CardContent>
    </Card>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="mb-1 text-xs font-bold uppercase text-muted-foreground">{title}</div>
      <p className="text-sm leading-6 text-foreground">{children}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/70 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

function LegacyDiagnosticImagingReportPage() {
  return (
    <div className="space-y-4 pt-4">
      <DiagnosticHeader
        title="Imaging Report View"
        description="Image review workspace with study context, series preview, and impression area."
        actions={
          <Button
            onClick={() => notifyAction("Imaging export prepared", "MRI Brain report and image reference summary are ready for export.")}
            variant="outline"
          >
            <ArrowDownToLine className="h-4 w-4" />Download
          </Button>
        }
      />
      <PatientContextCard />
      <Card>
        <CardHeader>
          <div>
            <CardTitle>MRI Brain</CardTitle>
          </div>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <ImagingViewer study={imagingStudies[0]} />
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <span><strong className="text-foreground">Study:</strong> MRI Brain</span>
            <span><strong className="text-foreground">Status:</strong> Final</span>
            <span><strong className="text-foreground">Radiologist:</strong> Dr. Mehta</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

void LegacyDiagnosticImagingReportPage;

export function DiagnosticTrendsPage() {
  const [range, setRange] = React.useState<DiagnosticTrendRange>("30");
  const [customStartDate, setCustomStartDate] = React.useState("2026-05-14");
  const [customEndDate, setCustomEndDate] = React.useState("2026-06-11");
  const [parameter, setParameter] = React.useState<DiagnosticTrendParameter>("Creatinine");
  const [comparisonParameters, setComparisonParameters] = React.useState<DiagnosticTrendParameter[]>(["Hemoglobin", "Potassium"]);
  const [chartZoom, setChartZoom] = React.useState(1);
  const [chartPan, setChartPan] = React.useState(0);
  const [chartFullscreen, setChartFullscreen] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const selectedParameter = diagnosticTrendParameters[parameter];
  const comparisonKeys = comparisonParameters.filter((item) => item !== parameter).slice(0, 3);
  const trend = trendDates.map((date, index) => ({
    date,
    dateValue: trendDateValues[index],
    value: selectedParameter.values[index],
    compare0: comparisonKeys[0] ? diagnosticTrendParameters[comparisonKeys[0]].values[index] : undefined,
    compare1: comparisonKeys[1] ? diagnosticTrendParameters[comparisonKeys[1]].values[index] : undefined,
    compare2: comparisonKeys[2] ? diagnosticTrendParameters[comparisonKeys[2]].values[index] : undefined,
  }));
  const rangedTrend =
    range === "14"
      ? trend.slice(-4)
      : range === "custom"
        ? trend.filter((item) => item.dateValue >= customStartDate && item.dateValue <= customEndDate)
        : trend;
  const plottedTrend = rangedTrend.length ? rangedTrend : trend.slice(-1);
  const visiblePoints = chartZoom === 1 ? plottedTrend.length : chartZoom === 1.5 ? Math.max(4, Math.ceil(plottedTrend.length * 0.75)) : Math.max(3, Math.ceil(plottedTrend.length * 0.5));
  const maxPan = Math.max(0, plottedTrend.length - visiblePoints);
  const safePan = Math.min(chartPan, maxPan);
  const filteredTrend = plottedTrend.slice(safePan, safePan + visiblePoints);
  const latest = filteredTrend.at(-1)?.value ?? 0;
  const previous = filteredTrend.at(-2)?.value ?? latest;
  const change = Number((latest - previous).toFixed(2));
  const percentageChange = previous ? Number(((change / previous) * 100).toFixed(1)) : 0;
  const trendDirection = change > 0 ? "Increasing" : change < 0 ? "Decreasing" : "Stable";
  const latestValue = `${latest} ${selectedParameter.unit}`;
  const previousValue = `${previous} ${selectedParameter.unit}`;
  const changeValue = `${change > 0 ? "+" : ""}${change} ${selectedParameter.unit}`;
  const comparisonColors = ["#12b76a", "#f79009", "#7c3aed"];

  function toggleComparison(item: DiagnosticTrendParameter) {
    if (item === parameter) return;
    setComparisonParameters((current) => {
      if (current.includes(item)) return current.filter((value) => value !== item);
      return [...current, item].slice(-3);
    });
  }

  function changeZoom(nextZoom: number) {
    setChartZoom(nextZoom);
    setChartPan(0);
  }

  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setChartFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="space-y-4 pt-4">
      <DiagnosticHeader
        title="Trends & Charts"
        description="Diagnostic parameter movement with latest value, previous value, and change summary."
        actions={
          <Button
            onClick={() => {
              setApplied(true);
              setChartPan(0);
              toast.success("Trend filter applied", { description: range === "custom" ? `${parameter} trend filtered from ${customStartDate} to ${customEndDate}.` : `${parameter} trend filtered to the latest ${range} days.` });
            }}
            variant="outline"
          >
            <TrendingUp className="h-4 w-4" />Apply filter
          </Button>
        }
      />
      <PatientContextCard />
      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto] md:items-end">
          <label className="space-y-1 text-sm font-semibold text-foreground">
            <span>Parameter</span>
            <select
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/25"
              onChange={(event) => setParameter(event.target.value as DiagnosticTrendParameter)}
              value={parameter}
            >
              {Object.keys(diagnosticTrendParameters).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-foreground">
            <span>Date Range</span>
            <select
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/25"
              onChange={(event) => {
                setRange(event.target.value as DiagnosticTrendRange);
                setChartPan(0);
              }}
              value={range}
            >
              <option value="30">Last 30 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </label>
          {range === "custom" ? (
            <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold text-foreground">
                <span>Start Date</span>
                <input
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/25"
                  max={customEndDate}
                  min={trendDateValues[0]}
                  onChange={(event) => {
                    setCustomStartDate(event.target.value);
                    setChartPan(0);
                  }}
                  type="date"
                  value={customStartDate}
                />
              </label>
              <label className="space-y-1 text-sm font-semibold text-foreground">
                <span>End Date</span>
                <input
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/25"
                  max={trendDateValues[trendDateValues.length - 1]}
                  min={customStartDate}
                  onChange={(event) => {
                    setCustomEndDate(event.target.value);
                    setChartPan(0);
                  }}
                  type="date"
                  value={customEndDate}
                />
              </label>
            </div>
          ) : null}
          <Button
            onClick={() => {
              setApplied(false);
              setRange("30");
              setCustomStartDate("2026-05-14");
              setCustomEndDate("2026-06-11");
              setParameter("Creatinine");
              setComparisonParameters(["Hemoglobin", "Potassium"]);
              setChartZoom(1);
              setChartPan(0);
              setChartFullscreen(false);
            }}
            variant="outline"
          >
            Reset
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-foreground">Multiple Parameter Comparison</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => changeZoom(chartZoom === 2 ? 1 : chartZoom + 0.5)}>
                <ZoomIn className="h-4 w-4" />Zoom {chartZoom}x
              </Button>
              <Button size="sm" variant="outline" onClick={() => changeZoom(Math.max(1, chartZoom - 0.5))}>
                <ZoomOut className="h-4 w-4" />Zoom Out
              </Button>
              <Button size="sm" variant="outline" disabled={safePan <= 0} onClick={() => setChartPan((value) => Math.max(0, value - 1))}>
                Pan Left
              </Button>
              <Button size="sm" variant="outline" disabled={safePan >= maxPan} onClick={() => setChartPan((value) => Math.min(maxPan, value + 1))}>
                Pan Right
              </Button>
              <Button size="sm" variant={chartFullscreen ? "default" : "outline"} onClick={() => setChartFullscreen((value) => !value)}>
                <Maximize2 className="h-4 w-4" />Fullscreen Chart
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(diagnosticTrendParameters) as DiagnosticTrendParameter[]).map((item) => (
              <button
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold transition",
                  item === parameter
                    ? "border-primary bg-primary text-primary-foreground"
                    : comparisonKeys.includes(item)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white text-muted-foreground hover:text-foreground",
                )}
                disabled={item === parameter}
                key={item}
                onClick={() => toggleComparison(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      {applied ? (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 text-sm">
            <StatusPill tone="info">Applied</StatusPill>
            <span className="font-medium text-foreground">{parameter}</span>
            <span className="text-muted-foreground">
              {range === "custom" ? `filtered from ${customStartDate} to ${customEndDate}` : `filtered to latest ${range} days`} with {filteredTrend.length} plotted points.
            </span>
          </CardContent>
        </Card>
      ) : null}
      <Card className={cn(chartFullscreen && "fixed inset-4 z-[120] overflow-auto bg-white shadow-2xl")}>
        <CardHeader>
          <div>
            <CardTitle>{parameter} Trend</CardTitle>
          </div>
          {chartFullscreen ? (
            <Button size="sm" variant="outline" onClick={() => setChartFullscreen(false)}>
              <Maximize2 className="h-4 w-4" />Exit Fullscreen
            </Button>
          ) : (
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[360px] rounded-xl border border-border p-3">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={filteredTrend} margin={{ left: -12, right: 16, top: 12, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line dataKey="value" name={`${parameter} (${selectedParameter.unit})`} stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                {comparisonKeys.map((item, index) => (
                  <Line
                    dataKey={`compare${index}`}
                    dot={{ r: 2 }}
                    key={item}
                    name={`${item} (${diagnosticTrendParameters[item].unit})`}
                    stroke={comparisonColors[index]}
                    strokeDasharray="5 4"
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <TrendStat label="Latest" value={latestValue} tone="danger" icon={Droplet} />
            <TrendStat label="Previous" value={previousValue} tone="warning" icon={FlaskConical} />
            <TrendStat label="Change" value={changeValue} tone="danger" icon={HeartPulse} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <TrendStat label="Percentage Change" value={`${percentageChange > 0 ? "+" : ""}${percentageChange}%`} tone={percentageChange === 0 ? "info" : percentageChange > 0 ? "warning" : "success"} icon={TrendingUp} />
            <TrendStat label="Trend Direction" value={trendDirection} tone={trendDirection === "Stable" ? "info" : trendDirection === "Increasing" ? "warning" : "success"} icon={Activity} />
            <TrendStat label="Normal Range" value={selectedParameter.normalRange} tone="info" icon={ClipboardCheck} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type DiagnosticEntryOrder = {
  id: string;
  patient: string;
  mrn: string;
  bed: string;
  order: string;
  category: string;
  specimen: string;
  priority: "Routine" | "Urgent" | "Critical";
  orderedBy: string;
  status: "Sample received" | "Processing" | "Draft pending" | "Critical validation";
  collectedAt: string;
};

type DiagnosticEntryField = {
  group: string;
  test: string;
  unit: string;
  reference: string;
};

type DiagnosticEntryResultRow = {
  group: string;
  test: string;
  value: string;
  unit: string;
  reference: string;
  flag: "Normal" | "High" | "Low" | "Critical" | "Pending";
  confidence: number;
  status: "Extracted" | "Needs review" | "Not found";
  source: string;
  accepted: boolean;
};

const diagnosticEntryOrders: DiagnosticEntryOrder[] = [
  { id: "REQ-ICU-8841", patient: "Aisha Khan", mrn: "PLH-240221", bed: "ICU-A01", order: "CBC + CRP + ABG", category: "Laboratory", specimen: "Blood / EDTA + ABG syringe", priority: "Critical", orderedBy: "Dr. Sameer Mehta", status: "Critical validation", collectedAt: "Today 09:10" },
  { id: "REQ-ICU-8842", patient: "Rohan Das", mrn: "PLH-240338", bed: "ICU-A02", order: "Renal panel + Electrolytes", category: "Laboratory", specimen: "Serum", priority: "Urgent", orderedBy: "Dr. Neha Malik", status: "Sample received", collectedAt: "Today 10:05" },
  { id: "REQ-ICU-8843", patient: "Meera Sharma", mrn: "PLH-240418", bed: "ICU-B03", order: "Blood culture x2", category: "Microbiology", specimen: "Blood culture bottle", priority: "Urgent", orderedBy: "Dr. Imran Shah", status: "Processing", collectedAt: "Today 08:40" },
  { id: "REQ-ICU-8844", patient: "Kabir Ali", mrn: "PLH-240512", bed: "ICU-B04", order: "Portable X-Ray Chest", category: "Imaging", specimen: "Digital image", priority: "Routine", orderedBy: "Dr. Aman Verma", status: "Draft pending", collectedAt: "Today 11:20" },
];

const diagnosticInvestigationChartFields: DiagnosticEntryField[] = [
  { group: "Patient profile", test: "Height / Weight", unit: "cm / kg", reference: "Patient baseline" },
  { group: "Hematology", test: "Hb / Hct", unit: "g/dL / %", reference: "Hb 12-16, Hct 36-46" },
  { group: "Hematology", test: "TLC / ANC", unit: "/cumm", reference: "TLC 4,000-11,000" },
  { group: "Hematology", test: "Platelet count", unit: "lakh/cumm", reference: "1.5-4.5 lakh" },
  { group: "Renal / Electrolytes", test: "Urea / Creatinine", unit: "mg/dL", reference: "Cr 0.6-1.2" },
  { group: "Renal / Electrolytes", test: "Na+ / K+", unit: "mmol/L", reference: "Na 135-145, K 3.5-5.0" },
  { group: "Renal / Electrolytes", test: "Ca2+ / PO4 / Mg", unit: "mmol/L / mg/dL", reference: "Ionized Ca 1.12-1.32" },
  { group: "Liver / Protein", test: "TB / DB / IB", unit: "mg/dL", reference: "TB <1.2" },
  { group: "Liver / Protein", test: "AST / ALT", unit: "U/L", reference: "<40" },
  { group: "Liver / Protein", test: "ALP", unit: "U/L", reference: "44-147" },
  { group: "Liver / Protein", test: "T. protein / Albumin", unit: "g/dL", reference: "Alb 3.5-5.0" },
  { group: "Coagulation", test: "PT / INR", unit: "sec / ratio", reference: "INR 0.8-1.2" },
  { group: "Coagulation", test: "APTT / D-Dimer / Fibrinogen", unit: "sec / ng/mL / mg/dL", reference: "D-dimer <500" },
  { group: "Infection / Inflammation", test: "Procalcitonin", unit: "ng/mL", reference: "<0.5" },
  { group: "Infection / Inflammation", test: "CRP", unit: "mg/L", reference: "<10" },
  { group: "Infection / Inflammation", test: "Ferritin", unit: "ng/mL", reference: "30-400" },
  { group: "Infection / Inflammation", test: "LDH", unit: "U/L", reference: "140-280" },
  { group: "ABG / Lactate", test: "pH / PaO2 / PaCO2 / HCO3", unit: "ABG", reference: "pH 7.35-7.45" },
  { group: "ABG / Lactate", test: "Lactate", unit: "mmol/L", reference: "<2.0" },
  { group: "Cultures", test: "Blood culture", unit: "", reference: "No growth" },
  { group: "Cultures", test: "Other culture", unit: "", reference: "As clinically indicated" },
];

export function DiagnosticInvestigationEntryPage() {
  const [selectedOrderId, setSelectedOrderId] = React.useState(diagnosticEntryOrders[0].id);
  const [reportStatus, setReportStatus] = React.useState("Awaiting upload");
  const [reportType, setReportType] = React.useState("Auto detect");
  const [uploadedFileName, setUploadedFileName] = React.useState("");
  const [extractedText, setExtractedText] = React.useState("");
  const [resultRows, setResultRows] = React.useState<DiagnosticEntryResultRow[]>(() => buildDiagnosticPendingRows());
  const selectedOrder = diagnosticEntryOrders.find((order) => order.id === selectedOrderId) ?? diagnosticEntryOrders[0];
  const criticalRows = resultRows.filter((row) => row.flag === "Critical").length;
  const extractedRows = resultRows.filter((row) => row.status === "Extracted").length;
  const reviewRows = resultRows.filter((row) => row.status === "Needs review" || row.confidence < 80).length;
  const acceptedRows = resultRows.filter((row) => row.accepted).length;

  React.useEffect(() => {
    setUploadedFileName("");
    setExtractedText("");
    setReportStatus("Awaiting upload");
    setResultRows(buildDiagnosticPendingRows());
  }, [selectedOrderId]);

  function handleReportUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setReportStatus("Extraction review");

    const applyExtraction = (text?: string) => {
      const sampleText = text?.trim() || buildDiagnosticMockOcrText(selectedOrder, file.name);
      setExtractedText(sampleText);
      setResultRows(buildDiagnosticExtractedRows(selectedOrder, sampleText, file.name));
      toast.success("Report values extracted", { description: "Review confidence and accept values before finalizing." });
    };

    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => applyExtraction(String(reader.result ?? ""));
      reader.onerror = () => applyExtraction();
      reader.readAsText(file);
      return;
    }

    applyExtraction();
  }

  function acceptRow(test: string) {
    setResultRows((current) => current.map((row) => row.test === test ? { ...row, accepted: true, status: row.status === "Not found" ? "Needs review" : row.status } : row));
  }

  function acceptAllExtracted() {
    setResultRows((current) => current.map((row) => row.status === "Extracted" || row.status === "Needs review" ? { ...row, accepted: true } : row));
    toast.success("Extracted values accepted");
  }

  function saveEntry(action: "draft" | "final" | "critical") {
    if (action === "draft") {
      setReportStatus("Extraction review");
      toast.success("Extraction draft saved");
      return;
    }
    if (action === "critical") {
      toast.success("Critical value call logged");
      return;
    }
    if (!uploadedFileName) {
      toast.error("Upload report first");
      return;
    }
    setReportStatus("Final");
    toast.success("Diagnostic report finalized");
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-hidden pt-4">
      <details className="group min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">Report controls</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {selectedOrder.bed} | {selectedOrder.patient} | {reportStatus}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <div className="min-w-0 space-y-4 border-t border-border p-4">
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.2fr)_190px_190px_auto] xl:items-end">
            <label className="min-w-0 space-y-1 text-sm">
              <span className="font-semibold text-foreground">Patient / order</span>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)}>
                {diagnosticEntryOrders.map((order) => (
                  <option key={order.id} value={order.id}>{order.bed} | {order.patient} | {order.order}</option>
                ))}
              </select>
            </label>
            <EntrySelect label="Report status" value={reportStatus} onChange={setReportStatus} options={["Awaiting upload", "Extraction review", "Draft", "Preliminary", "Final", "Amended"]} />
            <EntrySelect label="Report type" value={reportType} onChange={setReportType} options={["Auto detect", "CBC", "RFT / Electrolytes", "LFT", "Coagulation", "ABG / Lactate", "Inflammatory markers", "Culture report"]} />
            <Button asChild variant="outline">
              <Link href={diagnosticHubBaseRoute}><ArrowLeft className="h-4 w-4" />Hub</Link>
            </Button>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <EntryMetric label="Extracted fields" value={`${extractedRows}/${resultRows.length}`} helper="Chart fields" icon={FileText} tone="info" />
            <EntryMetric label="Needs review" value={reviewRows} helper="Confidence" icon={AlertTriangle} tone={reviewRows ? "warning" : "success"} />
            <EntryMetric label="Critical values" value={criticalRows} helper="Call log" icon={FlaskConical} tone={criticalRows ? "danger" : "success"} />
            <EntryMetric label="Accepted" value={acceptedRows} helper={selectedOrder.id} icon={CheckCircle2} tone={acceptedRows ? "success" : "warning"} />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={acceptAllExtracted} variant="outline" disabled={!uploadedFileName}><CheckCircle2 className="h-4 w-4" />Accept extracted</Button>
            <Button onClick={() => saveEntry("draft")} variant="outline"><ClipboardCheck className="h-4 w-4" />Save draft</Button>
            <Button onClick={() => saveEntry("final")} disabled={!uploadedFileName}><FileCheck2 className="h-4 w-4" />Finalize</Button>
          </div>
        </div>
      </details>

      <div className="grid min-w-0 max-w-full gap-4">
        <Card className="min-w-0 max-w-full overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Upload & Extraction Review</CardTitle>
            </div>
            <StatusPill tone={diagnosticEntryStatusTone(selectedOrder.status)}>{selectedOrder.status}</StatusPill>
          </CardHeader>
          <CardContent className="min-w-0 max-w-full space-y-4 overflow-hidden">
            <div className="grid min-w-0 max-w-full gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <ReadonlyEntry label="Patient" value={`${selectedOrder.patient} (${selectedOrder.mrn})`} />
              <ReadonlyEntry label="Bed / category" value={`${selectedOrder.bed} / ${selectedOrder.category}`} />
              <ReadonlyEntry label="Specimen" value={selectedOrder.specimen} />
              <ReadonlyEntry label="Ordered by" value={selectedOrder.orderedBy} />
              <ReadonlyEntry label="Order ID" value={selectedOrder.id} />
              <ReadonlyEntry label="Collected at" value={selectedOrder.collectedAt} />
            </div>

            <div className="grid min-w-0 max-w-full gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <label className="flex min-h-48 min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 p-5 text-center transition hover:border-sky-500 hover:bg-sky-100">
                <FileArchive className="h-10 w-10 text-sky-600" />
                <span className="mt-3 text-base font-black text-slate-950">{uploadedFileName || "Upload report file"}</span>
                <input className="sr-only" type="file" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={handleReportUpload} />
              </label>
              <div className="min-w-0 rounded-xl border border-border bg-surface-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-foreground">Report text</p>
                  </div>
                  <StatusPill tone={uploadedFileName ? "success" : "warning"}>{uploadedFileName ? "Ready" : "Waiting"}</StatusPill>
                </div>
                <pre className="mt-3 max-h-36 max-w-full overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-white p-3 text-xs leading-5 text-slate-700">
                  {extractedText || "No report uploaded."}
                </pre>
              </div>
            </div>

            <div className="relative max-h-[55vh] w-full max-w-full overflow-auto rounded-lg border border-border">
              <table className="w-full min-w-[1180px] border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-surface-muted text-[11px] uppercase text-muted-foreground">
                  <tr>
                    {["Group", "Investigation", "Extracted value", "Unit", "Reference range", "Flag", "Confidence", "Source", "Verify"].map((header) => (
                      <th className="border-b border-r border-border px-3 py-2 text-left last:border-r-0" key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map((row) => (
                    <tr className={cn("border-b border-border last:border-0", row.status === "Not found" ? "bg-slate-50 text-slate-500" : row.confidence < 80 ? "bg-amber-50/60" : "")} key={row.test}>
                      <td className="border-r border-border px-3 py-2 text-xs font-bold uppercase text-slate-500">{row.group}</td>
                      <td className="border-r border-border px-3 py-2 font-bold text-foreground">{row.test}</td>
                      <td className="border-r border-border px-3 py-2 font-black text-slate-950">{row.value || "-"}</td>
                      <td className="border-r border-border px-3 py-2 text-xs text-muted-foreground">{row.unit || "-"}</td>
                      <td className="border-r border-border px-3 py-2 text-xs text-muted-foreground">{row.reference}</td>
                      <td className="border-r border-border px-3 py-2"><StatusPill tone={diagnosticEntryFlagTone(row.flag)}>{row.flag}</StatusPill></td>
                      <td className="border-r border-border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div className={cn("h-full rounded-full", row.confidence >= 90 ? "bg-emerald-500" : row.confidence >= 75 ? "bg-amber-500" : "bg-slate-400")} style={{ width: `${row.confidence}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{row.confidence}%</span>
                        </div>
                      </td>
                      <td className="border-r border-border px-3 py-2 text-xs text-muted-foreground">{row.source}</td>
                      <td className="px-3 py-2">
                        <Button size="sm" variant={row.accepted ? "outline" : "default"} disabled={row.status === "Not found"} onClick={() => acceptRow(row.test)}>
                          {row.accepted ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                          {row.accepted ? "Accepted" : "Accept"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button onClick={() => saveEntry("critical")} variant="outline"><AlertTriangle className="h-4 w-4" />Log critical call</Button>
              <Button onClick={() => saveEntry("draft")} variant="outline"><ClipboardCheck className="h-4 w-4" />Save draft</Button>
              <Button onClick={() => saveEntry("final")} disabled={!uploadedFileName}><FileCheck2 className="h-4 w-4" />Finalize report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function buildDiagnosticPendingRows(): DiagnosticEntryResultRow[] {
  return diagnosticInvestigationChartFields.map((field) => ({
    ...field,
    value: "",
    flag: "Pending",
    confidence: 0,
    status: "Not found",
    source: "Awaiting upload",
    accepted: false,
  }));
}

function buildDiagnosticExtractedRows(order: DiagnosticEntryOrder, sourceText: string, fileName: string): DiagnosticEntryResultRow[] {
  const extractedMap = diagnosticExtractionTemplate(order);
  const normalizedText = sourceText.toLowerCase();
  return diagnosticInvestigationChartFields.map((field) => {
    const extracted = extractedMap[field.test];
    const detectedInText = normalizedText.includes(field.test.toLowerCase().split(" / ")[0].replace("+", ""));
    if (!extracted) {
      return {
        ...field,
        value: "",
        flag: "Pending",
        confidence: 0,
        status: "Not found",
        source: "Not present in report",
        accepted: false,
      };
    }

    const confidence = Math.min(99, extracted.confidence + (detectedInText ? 2 : 0));
    return {
      ...field,
      value: extracted.value,
      flag: extracted.flag,
      confidence,
      status: confidence >= 80 ? "Extracted" : "Needs review",
      source: `${fileName} | ${extracted.source}`,
      accepted: confidence >= 90,
    };
  });
}

function diagnosticExtractionTemplate(order: DiagnosticEntryOrder): Record<string, { value: string; flag: DiagnosticEntryResultRow["flag"]; confidence: number; source: string }> {
  if (order.id === "REQ-ICU-8842") {
    return {
      "Height / Weight": { value: "168 / 76", flag: "Normal", confidence: 89, source: "patient header" },
      "Urea / Creatinine": { value: "58 / 1.7", flag: "High", confidence: 96, source: "renal panel row" },
      "Na+ / K+": { value: "136 / 3.2", flag: "Low", confidence: 95, source: "electrolyte row" },
      "Ca2+ / PO4 / Mg": { value: "1.08 / 4.4 / 1.8", flag: "Low", confidence: 83, source: "electrolyte add-on" },
      "Lactate": { value: "2.6", flag: "High", confidence: 78, source: "ABG addendum" },
    };
  }

  if (order.id === "REQ-ICU-8843") {
    return {
      "Height / Weight": { value: "156 / 61", flag: "Normal", confidence: 86, source: "patient header" },
      "TLC / ANC": { value: "16,800 / 13,100", flag: "High", confidence: 84, source: "CBC carry-forward" },
      "Procalcitonin": { value: "5.8", flag: "Critical", confidence: 92, source: "sepsis marker" },
      "CRP": { value: "126", flag: "High", confidence: 96, source: "inflammation panel" },
      "Blood culture": { value: "Blood culture x2 sent; incubation", flag: "Pending", confidence: 97, source: "microbiology section" },
      "Other culture": { value: "ET culture sent", flag: "Pending", confidence: 90, source: "microbiology section" },
    };
  }

  if (order.id === "REQ-ICU-8844") {
    return {
      "Height / Weight": { value: "170 / 68", flag: "Normal", confidence: 75, source: "patient header" },
      "Other culture": { value: "Not applicable; imaging report", flag: "Pending", confidence: 72, source: "radiology report type" },
    };
  }

  return {
    "Height / Weight": { value: "132 / 32", flag: "Normal", confidence: 91, source: "patient header" },
    "Hb / Hct": { value: "10.8 / 32", flag: "Low", confidence: 96, source: "CBC row" },
    "TLC / ANC": { value: "18,500 / 14,200", flag: "High", confidence: 94, source: "CBC differential" },
    "Platelet count": { value: "2.1", flag: "Normal", confidence: 97, source: "CBC platelet row" },
    "Urea / Creatinine": { value: "42 / 1.1", flag: "Normal", confidence: 80, source: "biochemistry add-on" },
    "Na+ / K+": { value: "136 / 3.8", flag: "Normal", confidence: 89, source: "electrolytes" },
    "CRP": { value: "126", flag: "High", confidence: 98, source: "CRP row" },
    "pH / PaO2 / PaCO2 / HCO3": { value: "7.28 / 68 / 48 / 18", flag: "Critical", confidence: 93, source: "ABG report" },
    "Lactate": { value: "4.2", flag: "Critical", confidence: 95, source: "ABG lactate" },
  };
}

function buildDiagnosticMockOcrText(order: DiagnosticEntryOrder, fileName: string) {
  const template = diagnosticExtractionTemplate(order);
  const lines = [
    `Source file: ${fileName}`,
    `Patient: ${order.patient} | ${order.mrn} | ${order.bed}`,
    `Order: ${order.order}`,
    `Specimen: ${order.specimen}`,
    ...Object.entries(template).map(([test, value]) => `${test}: ${value.value} ${value.flag}`),
  ];
  return lines.join("\n");
}

function diagnosticEntryFlagTone(flag: DiagnosticEntryResultRow["flag"]): StatusTone {
  if (flag === "Critical") return "danger";
  if (flag === "High" || flag === "Low") return "warning";
  if (flag === "Normal") return "success";
  return "info";
}

function EntryMetric({ label, value, helper, icon: Icon, tone }: { label: string; value: React.ReactNode; helper: string; icon: typeof Activity; tone: StatusTone }) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-muted-foreground">{label}</div>
          <div className="mt-1 truncate text-xl font-black text-foreground">{value}</div>
          <StatusPill tone={tone}>{helper}</StatusPill>
        </div>
      </CardContent>
    </Card>
  );
}

function ReadonlyEntry({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface-muted px-3 py-2">
      <div className="text-[11px] font-black uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function EntrySelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="min-w-0 space-y-1 text-sm">
      <span className="font-semibold text-foreground">{label}</span>
      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function diagnosticEntryPriorityTone(priority: DiagnosticEntryOrder["priority"]): StatusTone {
  if (priority === "Critical") return "danger";
  if (priority === "Urgent") return "warning";
  return "info";
}

function diagnosticEntryStatusTone(status: DiagnosticEntryOrder["status"]): StatusTone {
  if (status === "Critical validation") return "danger";
  if (status === "Sample received") return "success";
  if (status === "Processing") return "warning";
  return "info";
}

function DiagnosticHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white px-4 py-4 shadow-soft md:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

function PatientContextCard() {
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(240px,1.1fr)_repeat(3,minmax(180px,0.75fr))_auto] lg:items-center">
        <div className="col-span-2 flex items-center gap-3 lg:col-span-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground">Rahul Verma</div>
            <div className="mt-1 text-xs font-medium text-muted-foreground">MRN: MRN123456 • 45 Y • Male</div>
            <div className="text-xs text-muted-foreground">Phone: 9876543210</div>
          </div>
        </div>
        <InfoBlock label="Encounter" value="IPD-2026-789" helper="Admitted on 08 Jun 2026" />
        <InfoBlock label="Location" value="ICU - 2" helper="Bed 12" />
        <InfoBlock label="Attending Doctor" value="Dr. Sharma" helper="Cardiology" />
        <Button
          asChild
          className="justify-self-end lg:col-span-1"
          size="sm"
          variant="outline"
        >
          <Link href="/patient-details">Patient Summary</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoBlock({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="border-border lg:border-l lg:pl-5">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function TrendStat({ label, value, tone, icon: Icon }: { label: string; value: string; tone: StatusTone; icon: typeof Brain }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <StatusPill tone={tone}>{value}</StatusPill>
    </div>
  );
}
