"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSearch,
  Filter,
  Plus,
  Save,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClassName =
  "min-h-[88px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

type MedicationTabValue = "mar" | "home" | "final";
type DocumentStatus = "Draft" | "Pending Review" | "Finalized";
type MedicineSource = "MAR" | "Previous" | "New";
type MedicineListSource = "MAR" | "Home" | "Final";
type MedicineFilter =
  | "All"
  | "Selected only"
  | "Modified only"
  | "Stopped"
  | "Active"
  | "High-risk"
  | "Antibiotics"
  | "Insulin"
  | "Blood thinner";
type MarStatus = "Active" | "Stopped" | "Completed" | "On Hold";
type HomeDecision = "Continue" | "Stop" | "Restart";
type FinalMedicationStatus = "New" | "Continued" | "Modified" | "Restarted" | "Stopped";
type FoodInstruction = "Before food" | "After food" | "With food" | "No relation to food";
type CatalogAvailability = "Available" | "Low stock" | "Out of stock" | "Restricted";

export type DischargeMedicationPatient = {
  patientName: string;
  mrn: string;
  ipdNo: string;
  age: number;
  gender: string;
  consultant: string;
};

type MedicationRecord = {
  id: string;
  sourceList: MedicineListSource;
  source: MedicineSource | "Patient History" | "Previous Visit" | "Home Medication";
  medicineName: string;
  genericName: string;
  form: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  timing: string;
  foodInstruction: FoodInstruction;
  duration: string;
  quantity: string;
  instructions: string;
  indication: string;
  status: MarStatus | HomeDecision | FinalMedicationStatus;
  finalStatus: FinalMedicationStatus;
  startDate?: string;
  endDate?: string;
  days?: string;
  lastAdministered?: string;
  lastTakenDate?: string;
  highRisk?: boolean;
  categoryTags: string[];
  dischargeSelected: boolean;
  modified: boolean;
  doctorRemarks?: string;
};

type MedicineCatalogItem = {
  id: string;
  medicineName: string;
  genericName: string;
  form: string;
  strength: string;
  route: string;
  defaultDose: string;
  frequency: string;
  timing: string;
  foodInstruction: FoodInstruction;
  defaultDuration: string;
  quantity: string;
  indication: string;
  instructions: string;
  availability: CatalogAvailability;
  stock: string;
  brands: string[];
  alternatives: string[];
  categoryTags: string[];
  highRisk?: boolean;
  note: string;
};

type ConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
};

const filterOptions: MedicineFilter[] = [
  "All",
  "Selected only",
  "Modified only",
  "Stopped",
  "Active",
  "High-risk",
  "Antibiotics",
  "Insulin",
  "Blood thinner",
];

const defaultPatient: DischargeMedicationPatient = {
  patientName: "Rahul Sharma",
  mrn: "MRN-10245",
  ipdNo: "IPD-2026-0098",
  age: 45,
  gender: "Male",
  consultant: "Dr. Amit Kumar",
};

const medicineCatalog: MedicineCatalogItem[] = [
  {
    id: "cat-panto-40",
    medicineName: "Pantoprazole",
    genericName: "Pantoprazole sodium",
    form: "Tablet",
    strength: "40 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "OD",
    timing: "Morning",
    foodInstruction: "Before food",
    defaultDuration: "7 days",
    quantity: "7 tablets",
    indication: "Gastric protection",
    instructions: "Take before breakfast.",
    availability: "Available",
    stock: "184 tablets",
    brands: ["Pantocid", "Pan 40", "Pantop 40"],
    alternatives: ["Rabeprazole 20 mg", "Omeprazole 20 mg"],
    categoryTags: ["Gastro"],
    note: "Common discharge medicine. Generic substitution allowed.",
  },
  {
    id: "cat-para-650",
    medicineName: "Paracetamol",
    genericName: "Acetaminophen",
    form: "Tablet",
    strength: "650 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "TDS",
    timing: "Morning, Afternoon, Night",
    foodInstruction: "After food",
    defaultDuration: "3 days",
    quantity: "9 tablets",
    indication: "Pain or fever",
    instructions: "Use only if pain or fever is present. Do not exceed advised dose.",
    availability: "Available",
    stock: "420 tablets",
    brands: ["Dolo 650", "Calpol 650", "Pacimol"],
    alternatives: ["Paracetamol 500 mg"],
    categoryTags: ["Analgesic"],
    note: "Duplicate check required if old home paracetamol exists.",
  },
  {
    id: "cat-amox-clav",
    medicineName: "Amoxicillin + Clavulanate",
    genericName: "Amoxicillin trihydrate + Potassium clavulanate",
    form: "Tablet",
    strength: "625 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "BD",
    timing: "Morning, Night",
    foodInstruction: "After food",
    defaultDuration: "5 days",
    quantity: "10 tablets",
    indication: "Bacterial infection",
    instructions: "Complete full course. Report rash, loose stool, or breathing difficulty.",
    availability: "Low stock",
    stock: "8 tablets",
    brands: ["Augmentin 625", "Moxikind-CV", "Clavam 625"],
    alternatives: ["Cefixime 200 mg", "Azithromycin 500 mg"],
    categoryTags: ["Antibiotics"],
    note: "Low stock. Pharmacy confirmation recommended before discharge.",
  },
  {
    id: "cat-cefixime-200",
    medicineName: "Cefixime",
    genericName: "Cefixime trihydrate",
    form: "Tablet",
    strength: "200 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "BD",
    timing: "Morning, Night",
    foodInstruction: "After food",
    defaultDuration: "5 days",
    quantity: "10 tablets",
    indication: "Bacterial infection",
    instructions: "Complete full course as advised.",
    availability: "Out of stock",
    stock: "0 tablets",
    brands: ["Taxim-O", "Zifi 200", "Cefolac"],
    alternatives: ["Amoxicillin + Clavulanate 625 mg", "Azithromycin 500 mg"],
    categoryTags: ["Antibiotics"],
    note: "Out of stock. Choose an alternative or prescribe as outside purchase.",
  },
  {
    id: "cat-apixaban-5",
    medicineName: "Apixaban",
    genericName: "Apixaban",
    form: "Tablet",
    strength: "5 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "BD",
    timing: "Morning, Night",
    foodInstruction: "No relation to food",
    defaultDuration: "As advised",
    quantity: "30 tablets",
    indication: "Anticoagulation",
    instructions: "Do not stop without doctor advice. Report bleeding, black stool, or severe headache.",
    availability: "Restricted",
    stock: "Hospital approval required",
    brands: ["Eliquis", "Apigat", "Apixabid"],
    alternatives: ["Rivaroxaban 10 mg", "Warfarin 2 mg"],
    categoryTags: ["High-risk", "Blood thinner"],
    highRisk: true,
    note: "High-risk blood thinner. Requires indication, counselling, and consultant approval.",
  },
  {
    id: "cat-insulin-glargine",
    medicineName: "Insulin Glargine",
    genericName: "Insulin glargine",
    form: "Injection pen",
    strength: "100 IU/ml",
    route: "Subcutaneous",
    defaultDose: "12 units",
    frequency: "HS",
    timing: "Night",
    foodInstruction: "No relation to food",
    defaultDuration: "Continue",
    quantity: "1 pen",
    indication: "Diabetes mellitus",
    instructions: "Check blood glucose before dose. Follow hypoglycemia counselling.",
    availability: "Available",
    stock: "26 pens",
    brands: ["Lantus", "Basalog", "Toujeo"],
    alternatives: ["Insulin Detemir", "Insulin Degludec"],
    categoryTags: ["High-risk", "Insulin"],
    highRisk: true,
    note: "High-risk insulin. Patient education is mandatory.",
  },
  {
    id: "cat-metformin-500",
    medicineName: "Metformin",
    genericName: "Metformin hydrochloride",
    form: "Tablet",
    strength: "500 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "BD",
    timing: "Morning, Night",
    foodInstruction: "After food",
    defaultDuration: "Continue",
    quantity: "30 tablets",
    indication: "Diabetes mellitus",
    instructions: "Take after meals. Hold and contact doctor if vomiting, dehydration, or renal issue occurs.",
    availability: "Available",
    stock: "310 tablets",
    brands: ["Glycomet", "Gluformin", "Metlong"],
    alternatives: ["Metformin SR 500 mg"],
    categoryTags: ["Diabetes"],
    note: "Restart only after renal function review when clinically relevant.",
  },
  {
    id: "cat-amlodipine-5",
    medicineName: "Amlodipine",
    genericName: "Amlodipine besylate",
    form: "Tablet",
    strength: "5 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "OD",
    timing: "Morning",
    foodInstruction: "After food",
    defaultDuration: "Continue",
    quantity: "30 tablets",
    indication: "Hypertension",
    instructions: "Continue daily. Monitor blood pressure as advised.",
    availability: "Available",
    stock: "260 tablets",
    brands: ["Amlong", "Amlopres", "Stamlo"],
    alternatives: ["Telmisartan 40 mg"],
    categoryTags: ["Cardiac"],
    note: "Home medication continuation commonly used at discharge.",
  },
  {
    id: "cat-ondansetron-4",
    medicineName: "Ondansetron",
    genericName: "Ondansetron hydrochloride",
    form: "Tablet",
    strength: "4 mg",
    route: "Oral",
    defaultDose: "1 tablet",
    frequency: "SOS",
    timing: "As needed",
    foodInstruction: "No relation to food",
    defaultDuration: "3 days",
    quantity: "6 tablets",
    indication: "Nausea or vomiting",
    instructions: "Take only if vomiting or nausea occurs.",
    availability: "Available",
    stock: "96 tablets",
    brands: ["Emeset", "Ondem", "Vomikind"],
    alternatives: ["Domperidone 10 mg"],
    categoryTags: ["Antiemetic"],
    note: "PRN medicine. Keep clear instructions for patient.",
  },
];

const marMedicationData: MedicationRecord[] = [
  {
    id: "mar-001",
    sourceList: "MAR",
    source: "MAR",
    medicineName: "Pantoprazole",
    genericName: "Pantoprazole sodium",
    form: "Tablet",
    strength: "40 mg",
    dose: "1 tablet",
    route: "Oral",
    frequency: "OD",
    timing: "Morning",
    foodInstruction: "Before food",
    duration: "7 days",
    quantity: "7 tablets",
    instructions: "Take before breakfast.",
    indication: "Gastric protection",
    status: "Active",
    finalStatus: "Continued",
    startDate: "24 May 2026",
    endDate: "28 May 2026",
    days: "5",
    lastAdministered: "28 May 2026, 07:30 AM",
    categoryTags: ["Gastro"],
    dischargeSelected: true,
    modified: false,
  },
  {
    id: "mar-002",
    sourceList: "MAR",
    source: "MAR",
    medicineName: "Paracetamol",
    genericName: "Acetaminophen",
    form: "Tablet",
    strength: "650 mg",
    dose: "1 tablet",
    route: "Oral",
    frequency: "TDS",
    timing: "Morning, Afternoon, Night",
    foodInstruction: "After food",
    duration: "3 days",
    quantity: "9 tablets",
    instructions: "Use only if pain or fever is present.",
    indication: "Pain control",
    status: "Active",
    finalStatus: "Continued",
    startDate: "25 May 2026",
    endDate: "28 May 2026",
    days: "4",
    lastAdministered: "28 May 2026, 02:00 PM",
    categoryTags: ["Analgesic"],
    dischargeSelected: true,
    modified: false,
  },
  {
    id: "mar-003",
    sourceList: "MAR",
    source: "MAR",
    medicineName: "Insulin Glargine",
    genericName: "Insulin glargine",
    form: "Injection",
    strength: "100 IU/ml",
    dose: "12 units",
    route: "Subcutaneous",
    frequency: "HS",
    timing: "Night",
    foodInstruction: "No relation to food",
    duration: "Continue",
    quantity: "1 pen",
    instructions: "Check blood glucose before dose.",
    indication: "Diabetes mellitus",
    status: "Active",
    finalStatus: "Continued",
    startDate: "24 May 2026",
    endDate: "Continue",
    days: "Continue",
    lastAdministered: "27 May 2026, 10:00 PM",
    highRisk: true,
    categoryTags: ["High-risk", "Insulin"],
    dischargeSelected: true,
    modified: false,
  },
  {
    id: "mar-004",
    sourceList: "MAR",
    source: "MAR",
    medicineName: "Ceftriaxone",
    genericName: "Ceftriaxone sodium",
    form: "Injection",
    strength: "1 g",
    dose: "1 g",
    route: "IV",
    frequency: "BD",
    timing: "Morning, Evening",
    foodInstruction: "No relation to food",
    duration: "Completed",
    quantity: "0",
    instructions: "Course completed during admission.",
    indication: "Antibiotic cover",
    status: "Completed",
    finalStatus: "Stopped",
    startDate: "24 May 2026",
    endDate: "28 May 2026",
    days: "5",
    lastAdministered: "28 May 2026, 08:00 AM",
    categoryTags: ["Antibiotics"],
    dischargeSelected: false,
    modified: false,
  },
  {
    id: "mar-005",
    sourceList: "MAR",
    source: "MAR",
    medicineName: "Enoxaparin",
    genericName: "Enoxaparin sodium",
    form: "Injection",
    strength: "40 mg",
    dose: "40 mg",
    route: "Subcutaneous",
    frequency: "OD",
    timing: "Evening",
    foodInstruction: "No relation to food",
    duration: "Stop",
    quantity: "0",
    instructions: "Stop at discharge unless consultant restarts.",
    indication: "DVT prophylaxis",
    status: "On Hold",
    finalStatus: "Stopped",
    startDate: "24 May 2026",
    endDate: "On hold",
    days: "4",
    lastAdministered: "27 May 2026, 06:00 PM",
    highRisk: true,
    categoryTags: ["High-risk", "Blood thinner"],
    dischargeSelected: false,
    modified: false,
  },
];

const homeMedicationData: MedicationRecord[] = [
  {
    id: "home-001",
    sourceList: "Home",
    source: "Home Medication",
    medicineName: "Amlodipine",
    genericName: "Amlodipine besylate",
    form: "Tablet",
    strength: "5 mg",
    dose: "1 tablet",
    route: "Oral",
    frequency: "OD",
    timing: "Morning",
    foodInstruction: "After food",
    duration: "Continue",
    quantity: "30 tablets",
    instructions: "Continue home blood pressure medicine.",
    indication: "Hypertension",
    status: "Continue",
    finalStatus: "Continued",
    lastTakenDate: "23 May 2026",
    categoryTags: ["Cardiac"],
    dischargeSelected: true,
    modified: false,
  },
  {
    id: "home-002",
    sourceList: "Home",
    source: "Previous Visit",
    medicineName: "Paracetamol",
    genericName: "Acetaminophen",
    form: "Tablet",
    strength: "500 mg",
    dose: "1 tablet",
    route: "Oral",
    frequency: "SOS",
    timing: "As needed",
    foodInstruction: "After food",
    duration: "Stop",
    quantity: "0",
    instructions: "Do not continue old paracetamol strength.",
    indication: "Pain or fever",
    status: "Stop",
    finalStatus: "Stopped",
    lastTakenDate: "20 May 2026",
    categoryTags: ["Analgesic"],
    dischargeSelected: false,
    modified: false,
  },
  {
    id: "home-003",
    sourceList: "Home",
    source: "Patient History",
    medicineName: "Metformin",
    genericName: "Metformin hydrochloride",
    form: "Tablet",
    strength: "500 mg",
    dose: "1 tablet",
    route: "Oral",
    frequency: "BD",
    timing: "Morning, Night",
    foodInstruction: "After food",
    duration: "Continue",
    quantity: "30 tablets",
    instructions: "Restart after food if renal function remains stable.",
    indication: "Diabetes mellitus",
    status: "Restart",
    finalStatus: "Restarted",
    lastTakenDate: "23 May 2026",
    categoryTags: ["Diabetes"],
    dischargeSelected: true,
    modified: true,
    doctorRemarks: "Restarted at discharge after review.",
  },
];

export function DischargeMedicationPage({
  patient = defaultPatient,
  readOnly = false,
}: {
  patient?: DischargeMedicationPatient;
  readOnly?: boolean;
}) {
  const [documentStatus, setDocumentStatus] = React.useState<DocumentStatus>("Draft");
  const [activeTab, setActiveTab] = React.useState<MedicationTabValue>("mar");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<MedicineFilter>("All");
  const [marMedications, setMarMedications] = React.useState<MedicationRecord[]>(marMedicationData);
  const [homeMedications, setHomeMedications] = React.useState<MedicationRecord[]>(homeMedicationData);
  const [finalMedications, setFinalMedications] = React.useState<MedicationRecord[]>(() =>
    [...marMedicationData, ...homeMedicationData].filter((medication) => medication.dischargeSelected).map(toFinalMedication),
  );
  const [modifyMedication, setModifyMedication] = React.useState<MedicationRecord | null>(null);
  const [detailMedication, setDetailMedication] = React.useState<MedicationRecord | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState<ConfirmState | null>(null);
  const [invalidIds, setInvalidIds] = React.useState<Set<string>>(new Set());
  const [validationMessage, setValidationMessage] = React.useState("");

  const finalSourceIds = React.useMemo(() => new Set(finalMedications.map((medication) => medication.id)), [finalMedications]);

  const filteredMar = React.useMemo(
    () => filterMedicationList(marMedications, search, filter, finalSourceIds),
    [filter, finalSourceIds, marMedications, search],
  );
  const filteredHome = React.useMemo(
    () => filterMedicationList(homeMedications, search, filter, finalSourceIds),
    [filter, finalSourceIds, homeMedications, search],
  );
  const filteredFinal = React.useMemo(
    () => filterMedicationList(finalMedications, search, filter, finalSourceIds),
    [filter, finalMedications, finalSourceIds, search],
  );

  const updateMedicationSource = (updatedMedication: MedicationRecord) => {
    if (updatedMedication.sourceList === "MAR") {
      setMarMedications((current) => current.map((medication) => (medication.id === updatedMedication.id ? updatedMedication : medication)));
    }
    if (updatedMedication.sourceList === "Home") {
      setHomeMedications((current) => current.map((medication) => (medication.id === updatedMedication.id ? updatedMedication : medication)));
    }
  };

  const upsertFinalMedication = (medication: MedicationRecord) => {
    const finalMedication = toFinalMedication({ ...medication, dischargeSelected: true });
    setFinalMedications((current) => {
      const exists = current.some((row) => row.id === finalMedication.id);
      return exists ? current.map((row) => (row.id === finalMedication.id ? finalMedication : row)) : [finalMedication, ...current];
    });
    if (medication.sourceList !== "Final") {
      updateMedicationSource({ ...medication, dischargeSelected: true });
    }
    setValidationMessage("");
    setInvalidIds((current) => {
      const next = new Set(current);
      next.delete(finalMedication.id);
      return next;
    });
  };

  const requestRemoveFinalMedication = (medication: MedicationRecord) => {
    setConfirmDialog({
      title: "Remove discharge medication",
      description: "Are you sure you want to remove this medicine from discharge medications?",
      confirmLabel: "Remove medicine",
      tone: "danger",
      onConfirm: () => removeFinalMedication(medication),
    });
  };

  const removeFinalMedication = (medication: MedicationRecord) => {
    setFinalMedications((current) => current.filter((row) => row.id !== medication.id));
    setMarMedications((current) => current.map((row) => (row.id === medication.id ? { ...row, dischargeSelected: false } : row)));
    setHomeMedications((current) => current.map((row) => (row.id === medication.id ? { ...row, dischargeSelected: false } : row)));
    setInvalidIds((current) => {
      const next = new Set(current);
      next.delete(medication.id);
      return next;
    });
    toast.success("Medicine removed from final discharge list");
  };

  const handleSelectionToggle = (medication: MedicationRecord) => {
    if (finalSourceIds.has(medication.id)) {
      requestRemoveFinalMedication(medication);
      return;
    }
    upsertFinalMedication(medication);
    toast.success("Medicine selected for discharge");
  };

  const handleHomeDecisionChange = (medication: MedicationRecord, status: HomeDecision) => {
    const finalStatus: FinalMedicationStatus = status === "Restart" ? "Restarted" : status === "Stop" ? "Stopped" : "Continued";
    const nextMedication = {
      ...medication,
      status,
      finalStatus,
      modified: true,
      duration: status === "Stop" ? "Stop" : medication.duration,
      quantity: status === "Stop" ? "0" : medication.quantity,
    };
    updateMedicationSource(nextMedication);
    if (finalSourceIds.has(medication.id)) {
      upsertFinalMedication(nextMedication);
    }
  };

  const handleModifySave = (updatedMedication: MedicationRecord) => {
    const nextMedication = { ...updatedMedication, modified: true };
    if (nextMedication.sourceList === "Final") {
      setFinalMedications((current) => current.map((medication) => (medication.id === nextMedication.id ? nextMedication : medication)));
    } else {
      updateMedicationSource(nextMedication);
      if (finalSourceIds.has(nextMedication.id)) {
        upsertFinalMedication(nextMedication);
      }
    }
    setModifyMedication(null);
    toast.success("Medication changes saved");
  };

  const handleModifySaveAndMark = (updatedMedication: MedicationRecord) => {
    const nextMedication = { ...updatedMedication, dischargeSelected: true, modified: true };
    if (nextMedication.sourceList === "Final") {
      setFinalMedications((current) => current.map((medication) => (medication.id === nextMedication.id ? nextMedication : medication)));
    } else {
      updateMedicationSource(nextMedication);
      upsertFinalMedication(nextMedication);
    }
    setModifyMedication(null);
    toast.success("Medication saved and selected for discharge");
  };

  const handleAddMedication = (medication: MedicationRecord) => {
    setFinalMedications((current) => [toFinalMedication(medication), ...current]);
    setAddOpen(false);
    setActiveTab("final");
    toast.success("New discharge medication added");
  };

  const validateMedicationList = () => {
    if (!finalMedications.length) {
      setConfirmDialog({
        title: "No discharge medicine selected",
        description: "No discharge medications prescribed. Do you want to continue?",
        confirmLabel: "Confirm no medicines",
        onConfirm: () => {
          setInvalidIds(new Set());
          setValidationMessage("");
          toast.success("Validated with no discharge medicines");
        },
      });
      return false;
    }

    const invalid = finalMedications.filter((medication) => getMedicationValidationIssues(medication).length > 0);
    const nextInvalidIds = new Set(invalid.map((medication) => medication.id));
    setInvalidIds(nextInvalidIds);

    if (invalid.length) {
      setValidationMessage(`${invalid.length} discharge medicine${invalid.length > 1 ? "s have" : " has"} missing mandatory fields.`);
      setActiveTab("final");
      toast.error("Please fix missing medication fields before finalizing");
      return false;
    }

    setValidationMessage("");
    toast.success("Medication list validated");
    return true;
  };

  const handleFinalize = () => {
    if (!finalMedications.length) {
      setConfirmDialog({
        title: "No discharge medicine selected",
        description: "No discharge medications prescribed. Do you want to continue?",
        confirmLabel: "Finalize without medicines",
        onConfirm: () => {
          setInvalidIds(new Set());
          setValidationMessage("");
          setDocumentStatus("Finalized");
          toast.success("Medication reconciliation finalized without discharge medicines");
        },
      });
      return;
    }

    if (!validateMedicationList()) return;
    setDocumentStatus("Finalized");
    toast.success("Discharge medication reconciliation finalized");
  };

  return (
    <div className="space-y-4">
      <MedicationTopActionBar
        patient={patient}
        status={documentStatus}
        readOnly={readOnly}
        onSave={() => {
          setDocumentStatus("Pending Review");
          toast.success("Medication reconciliation draft saved");
        }}
        onValidate={validateMedicationList}
        onPreview={() => setPreviewOpen(true)}
        onFinalize={handleFinalize}
      />

      <MedicationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        marMedications={filteredMar}
        homeMedications={filteredHome}
        finalMedications={filteredFinal}
        selectedIds={finalSourceIds}
        invalidIds={invalidIds}
        validationMessage={validationMessage}
        readOnly={readOnly || documentStatus === "Finalized"}
        onToggle={handleSelectionToggle}
        onModify={setModifyMedication}
        onViewDetails={setDetailMedication}
        onRemove={requestRemoveFinalMedication}
        onHomeDecisionChange={handleHomeDecisionChange}
        onAddNew={() => setAddOpen(true)}
      />

      <MedicationModifyModal
        medication={modifyMedication}
        open={Boolean(modifyMedication)}
        existingMedications={finalMedications}
        readOnly={readOnly || documentStatus === "Finalized"}
        onClose={() => setModifyMedication(null)}
        onSave={handleModifySave}
        onSaveAndMark={handleModifySaveAndMark}
      />
      <AddMedicationModal
        open={addOpen}
        existingMedications={finalMedications}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddMedication}
        readOnly={readOnly || documentStatus === "Finalized"}
      />
      <MedicationDetailModal medication={detailMedication} open={Boolean(detailMedication)} onClose={() => setDetailMedication(null)} />
      <MedicationPreviewModal patient={patient} medications={finalMedications} open={previewOpen} onClose={() => setPreviewOpen(false)} />
      <ConfirmDialog state={confirmDialog} onClose={() => setConfirmDialog(null)} />
    </div>
  );
}

function MedicationTopActionBar({
  patient,
  status,
  readOnly,
  onSave,
  onValidate,
  onPreview,
  onFinalize,
}: {
  patient: DischargeMedicationPatient;
  status: DocumentStatus;
  readOnly: boolean;
  onSave: () => void;
  onValidate: () => void;
  onPreview: () => void;
  onFinalize: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Discharge Medication Reconciliation</CardTitle>
              <StatusBadge status={status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Review inpatient, previous, and home medications before finalizing discharge medicines.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge tone="info">{patient.patientName}</Badge>
              <Badge tone="muted">{patient.mrn}</Badge>
              <Badge tone="muted">{patient.ipdNo}</Badge>
              <Badge tone="muted">{patient.age} / {patient.gender}</Badge>
              <Badge tone="muted">{patient.consultant}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onSave} disabled={readOnly || status === "Finalized"}>
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={onValidate}>
              <ClipboardCheck className="h-4 w-4" />
              Validate
            </Button>
            <Button variant="outline" onClick={onPreview}>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button onClick={onFinalize} disabled={readOnly || status === "Finalized"}>
              <CheckCircle2 className="h-4 w-4" />
              Finalize
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MedicationTabs({
  activeTab,
  onTabChange,
  search,
  onSearch,
  filter,
  onFilter,
  marMedications,
  homeMedications,
  finalMedications,
  selectedIds,
  invalidIds,
  validationMessage,
  readOnly,
  onToggle,
  onModify,
  onViewDetails,
  onRemove,
  onHomeDecisionChange,
  onAddNew,
}: {
  activeTab: MedicationTabValue;
  onTabChange: (value: MedicationTabValue) => void;
  search: string;
  onSearch: (value: string) => void;
  filter: MedicineFilter;
  onFilter: (value: MedicineFilter) => void;
  marMedications: MedicationRecord[];
  homeMedications: MedicationRecord[];
  finalMedications: MedicationRecord[];
  selectedIds: Set<string>;
  invalidIds: Set<string>;
  validationMessage: string;
  readOnly: boolean;
  onToggle: (medication: MedicationRecord) => void;
  onModify: (medication: MedicationRecord) => void;
  onViewDetails: (medication: MedicationRecord) => void;
  onRemove: (medication: MedicationRecord) => void;
  onHomeDecisionChange: (medication: MedicationRecord, status: HomeDecision) => void;
  onAddNew: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-3 lg:flex-row lg:items-start">
        <div>
          <CardTitle>Medication workbench</CardTitle>
          <CardDescription>MAR, home medication, and final discharge medicine list in one workflow</CardDescription>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_190px] lg:min-w-[520px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search medicine or generic name..." />
          </label>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select className={cn(inputClassName, "pl-9")} value={filter} onChange={(event) => onFilter(event.target.value as MedicineFilter)} aria-label="Medication filter">
              {filterOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as MedicationTabValue)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="mar">MAR Medications</TabsTrigger>
            <TabsTrigger value="home">Previous / Home Medications</TabsTrigger>
            <TabsTrigger value="final">Final Discharge Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="mar">
            <MedicationTable
              mode="mar"
              medications={marMedications}
              selectedIds={selectedIds}
              invalidIds={invalidIds}
              readOnly={readOnly}
              onToggle={onToggle}
              onModify={onModify}
              onViewDetails={onViewDetails}
            />
          </TabsContent>

          <TabsContent value="home">
            <MedicationTable
              mode="home"
              medications={homeMedications}
              selectedIds={selectedIds}
              invalidIds={invalidIds}
              readOnly={readOnly}
              onToggle={onToggle}
              onModify={onModify}
              onViewDetails={onViewDetails}
              onHomeDecisionChange={onHomeDecisionChange}
            />
          </TabsContent>

          <TabsContent value="final" className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Final discharge medication list</div>
                <div className="text-xs text-muted-foreground">These medicines will appear in the patient discharge summary and PDF preview.</div>
              </div>
              <Button onClick={onAddNew} disabled={readOnly}>
                <Plus className="h-4 w-4" />
                Add New Discharge Medication
              </Button>
            </div>
            {validationMessage ? <ValidationMessage message={validationMessage} /> : null}
            <MedicationTable
              mode="final"
              medications={finalMedications}
              selectedIds={selectedIds}
              invalidIds={invalidIds}
              readOnly={readOnly}
              onToggle={onToggle}
              onModify={onModify}
              onViewDetails={onViewDetails}
              onRemove={onRemove}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MedicationTable({
  mode,
  medications,
  selectedIds,
  invalidIds,
  readOnly,
  onToggle,
  onModify,
  onViewDetails,
  onRemove,
  onHomeDecisionChange,
}: {
  mode: MedicationTabValue;
  medications: MedicationRecord[];
  selectedIds: Set<string>;
  invalidIds: Set<string>;
  readOnly: boolean;
  onToggle: (medication: MedicationRecord) => void;
  onModify: (medication: MedicationRecord) => void;
  onViewDetails: (medication: MedicationRecord) => void;
  onRemove?: (medication: MedicationRecord) => void;
  onHomeDecisionChange?: (medication: MedicationRecord, status: HomeDecision) => void;
}) {
  if (!medications.length) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border bg-surface-muted text-center">
        <div>
          <FileSearch className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="mt-2 text-sm font-semibold text-foreground">No medicines found</div>
          <div className="mt-1 text-xs text-muted-foreground">Try another search term or filter.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-surface-muted text-[11px] uppercase tracking-wide text-muted-foreground">
            {mode === "final" ? (
              <tr>
                <th className="px-3 py-2">Medicine</th>
                <th className="px-3 py-2">Form</th>
                <th className="px-3 py-2">Dose / Route</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Timing / Food</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Instructions</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            ) : mode === "home" ? (
              <tr>
                <th className="px-3 py-2">Select</th>
                <th className="px-3 py-2">Medicine</th>
                <th className="px-3 py-2">Form / Strength</th>
                <th className="px-3 py-2">Dose / Route</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Last taken</th>
                <th className="px-3 py-2">Decision</th>
                <th className="px-3 py-2">Instructions</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            ) : (
              <tr>
                <th className="px-3 py-2">Select</th>
                <th className="px-3 py-2">Medicine</th>
                <th className="px-3 py-2">Form / Strength</th>
                <th className="px-3 py-2">Dose / Route</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Timing</th>
                <th className="px-3 py-2">Start / End</th>
                <th className="px-3 py-2">Days</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Last administered</th>
                <th className="px-3 py-2">Instructions</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            )}
          </thead>
          <tbody>
            {medications.map((medication) => (
              <MedicationRow
                key={medication.id}
                mode={mode}
                medication={medication}
                selected={selectedIds.has(medication.id)}
                invalid={invalidIds.has(medication.id)}
                readOnly={readOnly}
                onToggle={onToggle}
                onModify={onModify}
                onViewDetails={onViewDetails}
                onRemove={onRemove}
                onHomeDecisionChange={onHomeDecisionChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {medications.map((medication) => (
          <MedicationCard
            key={medication.id}
            mode={mode}
            medication={medication}
            selected={selectedIds.has(medication.id)}
            invalid={invalidIds.has(medication.id)}
            readOnly={readOnly}
            onToggle={onToggle}
            onModify={onModify}
            onViewDetails={onViewDetails}
            onRemove={onRemove}
            onHomeDecisionChange={onHomeDecisionChange}
          />
        ))}
      </div>
    </div>
  );
}

function MedicationRow({
  mode,
  medication,
  selected,
  invalid,
  readOnly,
  onToggle,
  onModify,
  onViewDetails,
  onRemove,
  onHomeDecisionChange,
}: {
  mode: MedicationTabValue;
  medication: MedicationRecord;
  selected: boolean;
  invalid: boolean;
  readOnly: boolean;
  onToggle: (medication: MedicationRecord) => void;
  onModify: (medication: MedicationRecord) => void;
  onViewDetails: (medication: MedicationRecord) => void;
  onRemove?: (medication: MedicationRecord) => void;
  onHomeDecisionChange?: (medication: MedicationRecord, status: HomeDecision) => void;
}) {
  const rowClassName = cn(
    "border-t border-border align-top hover:bg-surface-muted/60",
    selected && mode !== "final" && "bg-success/5",
    invalid && "bg-danger/5 ring-1 ring-inset ring-danger/50",
  );

  if (mode === "final") {
    return (
      <tr className={rowClassName}>
        <td className="px-3 py-3">
          <MedicationName medication={medication} />
          {invalid ? <ValidationMessage message={getMedicationValidationIssues(medication).join(", ")} compact /> : null}
        </td>
        <td className="px-3 py-3 text-muted-foreground">{medication.form} / {medication.strength}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.dose} | {medication.route}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.frequency}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.timing} | {medication.foodInstruction}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.duration}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.quantity}</td>
        <td className="px-3 py-3"><Badge tone="muted">{medication.source}</Badge></td>
        <td className="px-3 py-3"><StatusBadge status={medication.finalStatus} /></td>
        <td className="max-w-[240px] px-3 py-3 text-xs text-muted-foreground">{medication.instructions}</td>
        <td className="px-3 py-3 text-right">
          <RowActions medication={medication} readOnly={readOnly} onModify={onModify} onViewDetails={onViewDetails} onRemove={onRemove} finalMode />
        </td>
      </tr>
    );
  }

  if (mode === "home") {
    return (
      <tr className={rowClassName}>
        <td className="px-3 py-3">
          <SelectionCheckbox selected={selected} readOnly={readOnly} onToggle={() => onToggle(medication)} />
        </td>
        <td className="px-3 py-3">
          <MedicationName medication={medication} selected={selected} />
        </td>
        <td className="px-3 py-3 text-muted-foreground">{medication.form} / {medication.strength}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.dose} | {medication.route}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.frequency}</td>
        <td className="px-3 py-3 text-muted-foreground">{medication.duration}</td>
        <td className="px-3 py-3"><Badge tone="muted">{medication.source}</Badge></td>
        <td className="px-3 py-3 text-muted-foreground">{medication.lastTakenDate}</td>
        <td className="px-3 py-3">
          <select
            className={cn(inputClassName, "h-8 min-w-[120px]")}
            value={medication.status}
            disabled={readOnly}
            onChange={(event) => onHomeDecisionChange?.(medication, event.target.value as HomeDecision)}
          >
            <option>Continue</option>
            <option>Stop</option>
            <option>Restart</option>
          </select>
        </td>
        <td className="max-w-[240px] px-3 py-3 text-xs text-muted-foreground">{medication.instructions}</td>
        <td className="px-3 py-3 text-right">
          <RowActions medication={medication} readOnly={readOnly} onModify={onModify} onViewDetails={onViewDetails} />
        </td>
      </tr>
    );
  }

  return (
    <tr className={rowClassName}>
      <td className="px-3 py-3">
        <SelectionCheckbox selected={selected} readOnly={readOnly} onToggle={() => onToggle(medication)} />
      </td>
      <td className="px-3 py-3">
        <MedicationName medication={medication} selected={selected} />
      </td>
      <td className="px-3 py-3 text-muted-foreground">{medication.form} / {medication.strength}</td>
      <td className="px-3 py-3 text-muted-foreground">{medication.dose} | {medication.route}</td>
      <td className="px-3 py-3 text-muted-foreground">{medication.frequency}</td>
      <td className="px-3 py-3 text-muted-foreground">{medication.timing}</td>
      <td className="px-3 py-3 text-muted-foreground">{medication.startDate} - {medication.endDate}</td>
      <td className="px-3 py-3 text-muted-foreground">{medication.days}</td>
      <td className="px-3 py-3"><StatusBadge status={medication.status} /></td>
      <td className="px-3 py-3 text-muted-foreground">{medication.lastAdministered}</td>
      <td className="max-w-[240px] px-3 py-3 text-xs text-muted-foreground">{medication.instructions}</td>
      <td className="px-3 py-3 text-right">
        <RowActions medication={medication} readOnly={readOnly} onModify={onModify} onViewDetails={onViewDetails} />
      </td>
    </tr>
  );
}

function MedicationCard({
  mode,
  medication,
  selected,
  invalid,
  readOnly,
  onToggle,
  onModify,
  onViewDetails,
  onRemove,
  onHomeDecisionChange,
}: {
  mode: MedicationTabValue;
  medication: MedicationRecord;
  selected: boolean;
  invalid: boolean;
  readOnly: boolean;
  onToggle: (medication: MedicationRecord) => void;
  onModify: (medication: MedicationRecord) => void;
  onViewDetails: (medication: MedicationRecord) => void;
  onRemove?: (medication: MedicationRecord) => void;
  onHomeDecisionChange?: (medication: MedicationRecord, status: HomeDecision) => void;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-background p-3 shadow-sm", selected && "border-success/40 bg-success/5", invalid && "border-danger/60 bg-danger/5")}>
      <div className="flex items-start justify-between gap-3">
        <MedicationName medication={medication} selected={selected} />
        {mode !== "final" ? <SelectionCheckbox selected={selected} readOnly={readOnly} onToggle={() => onToggle(medication)} /> : <StatusBadge status={medication.finalStatus} />}
      </div>
      {invalid ? <ValidationMessage message={getMedicationValidationIssues(medication).join(", ")} compact /> : null}
      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <MobileMetric label="Form" value={`${medication.form} / ${medication.strength}`} />
        <MobileMetric label="Dose" value={`${medication.dose} | ${medication.route}`} />
        <MobileMetric label="Frequency" value={medication.frequency} />
        <MobileMetric label="Timing" value={`${medication.timing} | ${medication.foodInstruction}`} />
        <MobileMetric label="Duration" value={medication.duration} />
        <MobileMetric label="Source" value={String(medication.source)} />
      </div>
      {mode === "home" ? (
        <label className="mt-3 block space-y-1 text-xs">
          <span className="font-medium text-foreground">Continue / Stop / Restart</span>
          <select className={inputClassName} value={medication.status} disabled={readOnly} onChange={(event) => onHomeDecisionChange?.(medication, event.target.value as HomeDecision)}>
            <option>Continue</option>
            <option>Stop</option>
            <option>Restart</option>
          </select>
        </label>
      ) : null}
      <div className="mt-3 text-xs text-muted-foreground">{medication.instructions}</div>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <RowActions medication={medication} readOnly={readOnly} onModify={onModify} onViewDetails={onViewDetails} onRemove={onRemove} finalMode={mode === "final"} />
      </div>
    </div>
  );
}

function MedicationName({ medication, selected }: { medication: MedicationRecord; selected?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-foreground">{medication.medicineName}</span>
        {medication.highRisk ? <Badge tone="danger">High-risk</Badge> : null}
        {selected ? <Badge tone="success" className="border-success bg-transparent">Selected for Discharge</Badge> : null}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{medication.genericName} | {medication.indication}</div>
    </div>
  );
}

function SelectionCheckbox({ selected, readOnly, onToggle }: { selected: boolean; readOnly: boolean; onToggle: () => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <input className="h-4 w-4 rounded border-border accent-primary" type="checkbox" checked={selected} disabled={readOnly} onChange={onToggle} />
      Include
    </label>
  );
}

function RowActions({
  medication,
  readOnly,
  onModify,
  onViewDetails,
  onRemove,
  finalMode,
}: {
  medication: MedicationRecord;
  readOnly: boolean;
  onModify: (medication: MedicationRecord) => void;
  onViewDetails: (medication: MedicationRecord) => void;
  onRemove?: (medication: MedicationRecord) => void;
  finalMode?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button size="sm" variant="outline" onClick={() => onViewDetails(medication)}>
        <Eye className="h-3.5 w-3.5" />
        View
      </Button>
      <Button size="sm" variant="outline" disabled={readOnly} onClick={() => onModify(medication)}>
        Modify
      </Button>
      {finalMode ? (
        <Button size="sm" variant="danger" disabled={readOnly} onClick={() => onRemove?.(medication)}>
          Remove
        </Button>
      ) : null}
    </div>
  );
}

function MedicationModifyModal({
  medication,
  open,
  existingMedications,
  readOnly,
  onClose,
  onSave,
  onSaveAndMark,
}: {
  medication: MedicationRecord | null;
  open: boolean;
  existingMedications: MedicationRecord[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (medication: MedicationRecord) => void;
  onSaveAndMark: (medication: MedicationRecord) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(94vw,900px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <ModalHeader title="Modify Medication Order" description="Review the original order, then update discharge-safe fields." onClose={onClose} />
          {medication ? (
            <MedicationModifyModalBody
              key={medication.id}
              medication={medication}
              existingMedications={existingMedications}
              readOnly={readOnly}
              onClose={onClose}
              onSave={onSave}
              onSaveAndMark={onSaveAndMark}
            />
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedicationModifyModalBody({
  medication,
  existingMedications,
  readOnly,
  onClose,
  onSave,
  onSaveAndMark,
}: {
  medication: MedicationRecord;
  existingMedications: MedicationRecord[];
  readOnly: boolean;
  onClose: () => void;
  onSave: (medication: MedicationRecord) => void;
  onSaveAndMark: (medication: MedicationRecord) => void;
}) {
  const [draft, setDraft] = React.useState<MedicationRecord>(medication);
  const [catalogSearch, setCatalogSearch] = React.useState(`${medication.medicineName} ${medication.strength}`);
  const catalogResults = React.useMemo(() => searchMedicineCatalog(catalogSearch), [catalogSearch]);
  const duplicate = isDuplicateMedicine(draft, existingMedications);
  const selectCatalogItem = (item: MedicineCatalogItem) => {
    setDraft(mergeCatalogItemIntoMedication(draft, item));
    setCatalogSearch(`${item.medicineName} ${item.strength}`);
    toast.success(`${item.medicineName} selected for modification`);
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="rounded-lg border border-border bg-surface-muted p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original medicine details</div>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <DetailChip label="Medicine" value={medication.medicineName} />
            <DetailChip label="Dose" value={`${medication.dose} ${medication.route}`} />
            <DetailChip label="Frequency" value={medication.frequency} />
            <DetailChip label="Source" value={String(medication.source)} />
          </div>
        </div>
        <div className="mt-4">
          <MedicineSearchPanel
            query={catalogSearch}
            results={catalogResults}
            existingMedications={existingMedications}
            readOnly={readOnly}
            onQueryChange={setCatalogSearch}
            onSelect={selectCatalogItem}
            onUseManual={() => {
              const manualName = catalogSearch.trim();
              if (!manualName) return;
              setDraft({
                ...draft,
                medicineName: manualName,
                finalStatus: "Modified",
                modified: true,
                doctorRemarks: "Modified manually as non-formulary / outside purchase candidate.",
              });
            }}
          />
        </div>
        {duplicate ? (
          <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">
            Possible duplicate: {draft.medicineName} / {draft.genericName} already exists in final discharge medicines. Confirm strength and final intent before saving.
          </div>
        ) : null}
        <MedicationEditorFields medication={draft} onChange={setDraft} readOnly={readOnly} />
      </div>
      <div className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="outline" disabled={readOnly} onClick={() => onSave(draft)}>Save Changes</Button>
        <Button disabled={readOnly} onClick={() => onSaveAndMark(draft)}>Save & Mark as Discharge Medication</Button>
      </div>
    </>
  );
}

function AddMedicationModal({
  open,
  existingMedications,
  readOnly,
  onClose,
  onAdd,
}: {
  open: boolean;
  existingMedications: MedicationRecord[];
  readOnly: boolean;
  onClose: () => void;
  onAdd: (medication: MedicationRecord) => void;
}) {
  const [draft, setDraft] = React.useState<MedicationRecord>(() => createBlankMedication());
  const [catalogSearch, setCatalogSearch] = React.useState("");
  const catalogResults = React.useMemo(() => searchMedicineCatalog(catalogSearch), [catalogSearch]);
  const issues = getMedicationValidationIssues(draft);
  const duplicate = isDuplicateMedicine(draft, existingMedications);

  const handleClose = () => {
    setDraft(createBlankMedication());
    setCatalogSearch("");
    onClose();
  };
  const selectCatalogItem = (item: MedicineCatalogItem) => {
    setDraft(catalogItemToMedication(item));
    setCatalogSearch(`${item.medicineName} ${item.strength}`);
    toast.success(`${item.medicineName} selected from formulary`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(94vw,900px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <ModalHeader title="Add New Discharge Medication" description="Manually add a new medicine to the final discharge prescription." onClose={handleClose} />
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <MedicineSearchPanel
              query={catalogSearch}
              results={catalogResults}
              existingMedications={existingMedications}
              readOnly={readOnly}
              onQueryChange={setCatalogSearch}
              onSelect={selectCatalogItem}
              onUseManual={() => {
                const manualName = catalogSearch.trim();
                if (!manualName) return;
                setDraft({
                  ...createBlankMedication(),
                  medicineName: manualName,
                  instructions: "Non-formulary medicine. Verify availability and dispensing source before discharge.",
                  doctorRemarks: "Added manually as non-formulary / outside purchase candidate.",
                });
              }}
            />
            {duplicate ? (
              <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs text-warning">
                Possible duplicate: {draft.medicineName} / {draft.genericName} already exists in final discharge medicines. Confirm strength and intent before adding.
              </div>
            ) : null}
            <MedicationEditorFields medication={draft} onChange={setDraft} readOnly={readOnly} />
            {issues.length ? <ValidationMessage message={`Missing: ${issues.join(", ")}`} /> : null}
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              disabled={readOnly || issues.length > 0}
              onClick={() => {
                onAdd(draft);
                setDraft(createBlankMedication());
                setCatalogSearch("");
              }}
            >
              Add Medication
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedicineSearchPanel({
  query,
  results,
  existingMedications,
  readOnly,
  onQueryChange,
  onSelect,
  onUseManual,
}: {
  query: string;
  results: MedicineCatalogItem[];
  existingMedications: MedicationRecord[];
  readOnly: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (item: MedicineCatalogItem) => void;
  onUseManual: () => void;
}) {
  const normalizedQuery = query.trim();
  const hasSearch = normalizedQuery.length >= 2;

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">Medicine formulary search</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Search by brand, molecule, generic name, strength, category, or alternative. Availability is static dummy data for frontend review.
          </div>
        </div>
        <Badge tone="info">{results.length} matches</Badge>
      </div>

      <label className="relative mt-3 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          disabled={readOnly}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search medicine, generic, brand, antibiotic, insulin..."
        />
      </label>

      {hasSearch ? (
        <div className="mt-3 grid gap-2">
          {results.length ? (
            results.map((item) => {
              const duplicate = medicineCatalogItemIsDuplicate(item, existingMedications);
              const unavailable = item.availability === "Out of stock";
              return (
                <div className="rounded-lg border border-border bg-background p-3" key={item.id}>
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-foreground">{item.medicineName}</div>
                        <Badge tone={availabilityTone(item.availability)}>{item.availability}</Badge>
                        {item.highRisk ? <Badge tone="danger">High-risk</Badge> : null}
                        {duplicate ? <Badge tone="warning">Possible duplicate</Badge> : null}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Generic: {item.genericName} | {item.form} {item.strength} | {item.route} | Stock: {item.stock}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.brands.map((brand) => (
                          <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] text-muted-foreground" key={brand}>
                            {brand}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-xs leading-5 text-muted-foreground">{item.note}</div>
                      {item.alternatives.length ? (
                        <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
                          <span className="font-medium text-muted-foreground">Alternatives:</span>
                          {item.alternatives.map((alternative) => (
                            <button
                              type="button"
                              className="rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-info"
                              disabled={readOnly}
                              onClick={() => onQueryChange(alternative)}
                              key={alternative}
                            >
                              {alternative}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <Button size="sm" variant={unavailable ? "outline" : "default"} disabled={readOnly || unavailable} onClick={() => onSelect(item)}>
                      {unavailable ? "Not available" : item.availability === "Restricted" ? "Select with approval" : "Select"}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              <div className="font-semibold">Medicine not found in hospital formulary</div>
              <div className="mt-1 text-xs">
                You can still add it as a non-formulary / outside purchase medicine, but pharmacy availability should be verified.
              </div>
              <Button className="mt-3" size="sm" variant="outline" disabled={readOnly} onClick={onUseManual}>
                Use as manual non-formulary medicine
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="rounded-md border border-border bg-background p-2">Example: Dolo, Acetaminophen, Paracetamol</div>
          <div className="rounded-md border border-border bg-background p-2">Scenario: low stock, out of stock, restricted</div>
          <div className="rounded-md border border-border bg-background p-2">Generic, brands, and alternatives are shown together</div>
        </div>
      )}
    </div>
  );
}

function MedicationEditorFields({
  medication,
  onChange,
  readOnly,
}: {
  medication: MedicationRecord;
  onChange: (medication: MedicationRecord) => void;
  readOnly: boolean;
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <FieldInput label="Medicine name" value={medication.medicineName} disabled={readOnly} onChange={(value) => onChange({ ...medication, medicineName: value })} />
      <FieldInput label="Generic name" value={medication.genericName} disabled={readOnly} onChange={(value) => onChange({ ...medication, genericName: value })} />
      <FieldInput label="Form" value={medication.form} disabled={readOnly} onChange={(value) => onChange({ ...medication, form: value })} />
      <FieldInput label="Strength" value={medication.strength} disabled={readOnly} onChange={(value) => onChange({ ...medication, strength: value })} />
      <FieldInput label="Dose" value={medication.dose} disabled={readOnly} onChange={(value) => onChange({ ...medication, dose: value })} />
      <FieldInput label="Route" value={medication.route} disabled={readOnly} onChange={(value) => onChange({ ...medication, route: value })} />
      <FieldInput label="Frequency" value={medication.frequency} disabled={readOnly} onChange={(value) => onChange({ ...medication, frequency: value })} />
      <FieldInput label="Timing" value={medication.timing} disabled={readOnly} onChange={(value) => onChange({ ...medication, timing: value })} />
      <FieldSelect
        label="Food instruction"
        value={medication.foodInstruction}
        options={["Before food", "After food", "With food", "No relation to food"]}
        disabled={readOnly}
        onChange={(value) => onChange({ ...medication, foodInstruction: value as FoodInstruction })}
      />
      <FieldInput label="Duration / No. of days" value={medication.duration} disabled={readOnly} onChange={(value) => onChange({ ...medication, duration: value })} />
      <FieldInput label="Quantity" value={medication.quantity} disabled={readOnly} onChange={(value) => onChange({ ...medication, quantity: value })} />
      <FieldInput label="Indication" value={medication.indication} disabled={readOnly} onChange={(value) => onChange({ ...medication, indication: value })} />
      <FieldSelect
        label="Status"
        value={medication.finalStatus}
        options={["Continued", "Modified", "Stopped", "Restarted", "New"]}
        disabled={readOnly}
        onChange={(value) => onChange({ ...medication, finalStatus: value as FinalMedicationStatus, status: value as FinalMedicationStatus })}
      />
      <label className="space-y-1 text-sm sm:col-span-2">
        <span className="font-medium text-foreground">Instructions</span>
        <textarea className={textareaClassName} value={medication.instructions} disabled={readOnly} onChange={(event) => onChange({ ...medication, instructions: event.target.value })} />
      </label>
      <label className="space-y-1 text-sm xl:col-span-3">
        <span className="font-medium text-foreground">Doctor remarks</span>
        <textarea className={textareaClassName} value={medication.doctorRemarks ?? ""} disabled={readOnly} onChange={(event) => onChange({ ...medication, doctorRemarks: event.target.value })} />
      </label>
    </div>
  );
}

function ValidationMessage({ message, compact }: { message: string; compact?: boolean }) {
  return (
    <div className={cn("mt-2 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 p-2 text-xs text-danger", compact && "border-0 bg-transparent p-0")}>
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}

function ConfirmDialog({ state, onClose }: { state: ConfirmState | null; onClose: () => void }) {
  return (
    <Dialog.Root open={Boolean(state)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-4 shadow-soft outline-none">
          {state ? (
            <>
              <Dialog.Title className="text-sm font-semibold text-foreground">{state.title}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">{state.description}</Dialog.Description>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  variant={state.tone === "danger" ? "danger" : "default"}
                  onClick={() => {
                    state.onConfirm();
                    onClose();
                  }}
                >
                  {state.confirmLabel}
                </Button>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedicationPreviewModal({
  patient,
  medications,
  open,
  onClose,
}: {
  patient: DischargeMedicationPatient;
  medications: MedicationRecord[];
  open: boolean;
  onClose: () => void;
}) {
  const groups: FinalMedicationStatus[] = ["New", "Continued", "Modified", "Restarted", "Stopped"];
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(94vw,860px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <ModalHeader title="Discharge Medication Preview" description={`${patient.patientName} | ${patient.mrn} | ${patient.ipdNo}`} onClose={onClose} />
          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-base font-bold text-foreground">Patient-friendly medicine list</div>
                  <div className="mt-1 text-xs text-muted-foreground">Give this format to the patient or attendant after doctor approval.</div>
                </div>
                <Badge tone="info">{medications.length} medicines</Badge>
              </div>
              <div className="mt-4 space-y-4">
                {groups.map((group) => (
                  <PreviewMedicationGroup key={group} title={`${group} Medicines`} medications={medications.filter((medication) => medication.finalStatus === group)} />
                ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PreviewMedicationGroup({ title, medications }: { title: string; medications: MedicationRecord[] }) {
  if (!medications.length) return null;
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-info" />
        {title}
      </div>
      <div className="grid gap-2">
        {medications.map((medication) => (
          <div className="rounded-lg border border-border bg-surface-muted p-3" key={medication.id}>
            <div className="font-semibold text-foreground">
              Medicine: {medication.medicineName} {medication.strength} {medication.form}
            </div>
            <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div>Dose: {medication.dose}</div>
              <div>When: {medication.timing} {medication.foodInstruction.toLowerCase()}</div>
              <div>Duration: {medication.duration}</div>
              <div>Instructions: {medication.instructions}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MedicationDetailModal({ medication, open, onClose }: { medication: MedicationRecord | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,680px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface shadow-soft outline-none">
          {medication ? (
            <>
              <ModalHeader title="Medication Details" description={`${medication.medicineName} | ${medication.genericName}`} onClose={onClose} />
              <div className="grid gap-2 p-4 text-sm sm:grid-cols-2">
                <DetailChip label="Form / strength" value={`${medication.form} / ${medication.strength}`} />
                <DetailChip label="Dose / route" value={`${medication.dose} | ${medication.route}`} />
                <DetailChip label="Frequency" value={medication.frequency} />
                <DetailChip label="Timing" value={medication.timing} />
                <DetailChip label="Food instruction" value={medication.foodInstruction} />
                <DetailChip label="Duration" value={medication.duration} />
                <DetailChip label="Indication" value={medication.indication} />
                <DetailChip label="Source" value={String(medication.source)} />
                <div className="rounded-lg border border-border bg-background p-3 sm:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Instructions</div>
                  <div className="mt-1 text-foreground">{medication.instructions}</div>
                </div>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModalHeader({ title, description, onClose }: { title: string; description: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
      <div>
        <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
        <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description>
      </div>
      <Dialog.Close asChild>
        <Button size="icon" variant="ghost" aria-label="Close modal" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </Dialog.Close>
    </div>
  );
}

function FieldInput({ label, value, disabled, onChange }: { label: string; value: string; disabled: boolean; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <Input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <select className={inputClassName} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value || "-"}</div>
    </div>
  );
}

function MobileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-2">
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}

function toFinalMedication(medication: MedicationRecord): MedicationRecord {
  return {
    ...medication,
    sourceList: "Final",
    source: medication.sourceList === "Home" ? "Previous" : medication.sourceList === "MAR" ? "MAR" : medication.source,
    dischargeSelected: true,
    status: medication.finalStatus,
  };
}

function catalogItemToMedication(item: MedicineCatalogItem): MedicationRecord {
  return {
    id: `new-${item.id}-${Date.now()}`,
    sourceList: "Final",
    source: "New",
    medicineName: item.medicineName,
    genericName: item.genericName,
    form: item.form,
    strength: item.strength,
    dose: item.defaultDose,
    route: item.route,
    frequency: item.frequency,
    timing: item.timing,
    foodInstruction: item.foodInstruction,
    duration: item.defaultDuration,
    quantity: item.quantity,
    instructions: item.instructions,
    indication: item.indication,
    status: "New",
    finalStatus: "New",
    highRisk: item.highRisk,
    categoryTags: item.categoryTags,
    dischargeSelected: true,
    modified: false,
    doctorRemarks:
      item.availability === "Restricted"
        ? "Restricted formulary medicine. Consultant/pharmacy approval required."
        : item.availability === "Low stock"
          ? "Low stock medicine. Pharmacy dispensing confirmation required."
          : "",
  };
}

function mergeCatalogItemIntoMedication(base: MedicationRecord, item: MedicineCatalogItem): MedicationRecord {
  return {
    ...base,
    medicineName: item.medicineName,
    genericName: item.genericName,
    form: item.form,
    strength: item.strength,
    dose: item.defaultDose,
    route: item.route,
    frequency: item.frequency,
    timing: item.timing,
    foodInstruction: item.foodInstruction,
    duration: item.defaultDuration,
    quantity: item.quantity,
    instructions: item.instructions,
    indication: item.indication,
    highRisk: item.highRisk,
    categoryTags: item.categoryTags,
    finalStatus: "Modified",
    modified: true,
    doctorRemarks:
      item.availability === "Restricted"
        ? "Modified to restricted formulary medicine. Consultant/pharmacy approval required."
        : item.availability === "Low stock"
          ? "Modified to low stock medicine. Pharmacy dispensing confirmation required."
          : base.doctorRemarks,
  };
}

function createBlankMedication(): MedicationRecord {
  return {
    id: `new-${Date.now()}`,
    sourceList: "Final",
    source: "New",
    medicineName: "",
    genericName: "",
    form: "Tablet",
    strength: "",
    dose: "",
    route: "Oral",
    frequency: "",
    timing: "Morning",
    foodInstruction: "After food",
    duration: "",
    quantity: "",
    instructions: "",
    indication: "",
    status: "New",
    finalStatus: "New",
    categoryTags: [],
    dischargeSelected: true,
    modified: false,
  };
}

function searchMedicineCatalog(search: string) {
  const query = search.trim().toLowerCase();
  if (query.length < 2) return medicineCatalog.slice(0, 4);

  return medicineCatalog
    .map((item) => ({ item, score: medicineCatalogScore(item, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

function medicineCatalogScore(item: MedicineCatalogItem, query: string) {
  const haystack = [
    item.medicineName,
    item.genericName,
    item.form,
    item.strength,
    item.indication,
    item.availability,
    item.note,
    ...item.brands,
    ...item.alternatives,
    ...item.categoryTags,
  ]
    .join(" ")
    .toLowerCase();

  if (!haystack.includes(query)) return 0;
  if (item.medicineName.toLowerCase().startsWith(query)) return 5;
  if (item.genericName.toLowerCase().startsWith(query)) return 4;
  if (item.brands.some((brand) => brand.toLowerCase().startsWith(query))) return 3;
  return 1;
}

function medicineCatalogItemIsDuplicate(item: MedicineCatalogItem, medications: MedicationRecord[]) {
  const normalizedGeneric = normalizeMedicineName(item.genericName);
  const normalizedMedicine = normalizeMedicineName(item.medicineName);
  return medications.some((medication) => {
    const medicationName = normalizeMedicineName(medication.medicineName);
    const genericName = normalizeMedicineName(medication.genericName);
    return medicationName === normalizedMedicine || genericName === normalizedGeneric || genericName === normalizedMedicine;
  });
}

function isDuplicateMedicine(medicine: MedicationRecord, medications: MedicationRecord[]) {
  if (!medicine.medicineName.trim() && !medicine.genericName.trim()) return false;
  return medications.some((medication) => {
    if (medication.id === medicine.id) return false;
    const sameMedicine = normalizeMedicineName(medication.medicineName) === normalizeMedicineName(medicine.medicineName);
    const sameGeneric = Boolean(medicine.genericName) && normalizeMedicineName(medication.genericName) === normalizeMedicineName(medicine.genericName);
    return sameMedicine || sameGeneric;
  });
}

function normalizeMedicineName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function availabilityTone(availability: CatalogAvailability): StatusTone {
  if (availability === "Available") return "success";
  if (availability === "Low stock") return "warning";
  if (availability === "Restricted") return "critical";
  return "danger";
}

function filterMedicationList(medications: MedicationRecord[], search: string, filter: MedicineFilter, selectedIds: Set<string>) {
  const query = search.trim().toLowerCase();
  return medications.filter((medication) => {
    const matchesSearch =
      !query ||
      [medication.medicineName, medication.genericName, medication.indication, medication.source, medication.status]
        .join(" ")
        .toLowerCase()
        .includes(query);

    if (!matchesSearch) return false;
    if (filter === "All") return true;
    if (filter === "Selected only") return selectedIds.has(medication.id) || medication.sourceList === "Final";
    if (filter === "Modified only") return medication.modified || medication.finalStatus === "Modified";
    if (filter === "Stopped") return medication.status === "Stopped" || medication.status === "Stop" || medication.finalStatus === "Stopped";
    if (filter === "Active") return medication.status === "Active" || medication.status === "Continue" || medication.finalStatus === "Continued";
    return medication.categoryTags.some((tag) => tag.toLowerCase() === filter.toLowerCase()) || Boolean(filter === "High-risk" && medication.highRisk);
  });
}

function getMedicationValidationIssues(medication: MedicationRecord) {
  const requiredFields: Array<[keyof MedicationRecord, string]> = [
    ["medicineName", "Medicine name required"],
    ["dose", "Dose required"],
    ["route", "Route required"],
    ["frequency", "Frequency required"],
    ["duration", "Duration required"],
    ["instructions", "Instructions required"],
  ];
  return requiredFields.filter(([field]) => !String(medication[field] ?? "").trim()).map(([, label]) => label);
}

function statusTone(status: string): StatusTone {
  if (["Continued", "Active", "Continue", "Finalized"].includes(status)) return "success";
  if (["New", "Pending Review", "Draft"].includes(status)) return "info";
  if (["Modified", "On Hold", "Hold"].includes(status)) return "warning";
  if (["Stopped", "Stop"].includes(status)) return "danger";
  if (["Restarted"].includes(status)) return "critical";
  return "muted";
}
