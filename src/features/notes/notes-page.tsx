"use client";

/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect */

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  FilePenLine,
  FileText,
  HeartPulse,
  MoreVertical,
  Pill,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Trash2,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NoteCategory =
  | "Nurse Notes"
  | "Medical Notes"
  | "Surgery Notes"
  | "Operative Notes"
  | "Pharmacy Notes"
  | "Allied Health Notes"
  | "Special Instruction Notes";
type NoteStatus = "Signed" | "Draft" | "Pending Review";
type GlucoseUnit = "mg/dL" | "mmol/L";
type PainScale = "NRS" | "CPOT" | "FLACC";
type CpotAirwayStatus = "INTUBATED" | "NOT_INTUBATED";
type PainDomainKey =
  | "cpotFacial"
  | "cpotBody"
  | "cpotMuscle"
  | "cpotDomain4"
  | "flaccFace"
  | "flaccLegs"
  | "flaccActivity"
  | "flaccCry"
  | "flaccConsolability";
type PainAssessment = {
  scale: PainScale;
  airwayStatus?: CpotAirwayStatus;
  scores: Partial<Record<PainDomainKey, number>>;
  total?: number;
  severity?: string;
};
type PainScoreOption = {
  score: number;
  label: string;
  guidance?: string;
};
type NrsPainRange = {
  id: "none" | "mild" | "moderate" | "severe";
  label: string;
  range: string;
  score: number;
  condition: string;
  description: string;
};
type TransplantType =
  | "Kidney transplant"
  | "Liver transplant"
  | "Heart transplant"
  | "Lung transplant"
  | "Bone marrow (stem cell) transplant";
type MedicalNoteSection = "ED Notes" | "Physician Notes";
type MedicalNoteType =
  | "Progress Note"
  | "Procedure Note"
  | "Consultant Notes"
  | "Family Meeting Notes"
  | "Pain Medicine Notes"
  | "Morning Ward Round"
  | "Afternoon Ward Round"
  | "Evening Ward Round"
  | "Operating Notes"
  | "Surgical Notes"
  | "Anesthesia Notes"
  | "End-of-Life Care Notes"
  | "Others";
type PharmacyNoteType = "Medication Review" | "Medication Reconciliation" | "Drug Interaction" | "Dose Adjustment" | "Adverse Drug Reaction" | "Medication Counseling" | "Anticoagulation Review" | "Renal Dose Review";
type AlliedNoteType = "Assessment Notes" | "Family Meeting Notes";
type AdditionalNoteType =
  | "General Progress Note"
  | "Follow-up Note"
  | "Phone Call Note"
  | "Family Meeting Notes"
  | "Handover Note"
  | "Case Management Note"
  | "Morning Round"
  | "Evening Round"
  | "Consultant Notes"
  | "Care Coordination Note"
  | "Patient Education Note";

type PharmacyDocumentation = {
  noteType: PharmacyNoteType;
  medicationPreviousToAdmission: string;
  medicationCurrently: string;
  medicationAtDischarge: string;
  medicationName: string;
  medicationCode: string;
  dose: string;
  doseUnit: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate: string;
  medicationStatus: string;
  reviewReason: string;
  clinicalIndication: string;
  medicationProblem: string;
  interactionSeverity: string;
  relevantAllergy: string;
  relevantLabs: string;
  recommendation: string;
  prescriberResponse: string;
  recommendationOutcome: string;
  followUp: string;
};

type AlliedHealthDocumentation = {
  noteType: AlliedNoteType;
  referralReason: string;
  initialAssessment: string;
  functionalStatus: string;
  identifiedProblems: string;
  intervention: string;
  patientResponse: string;
  goals: string;
  goalProgress: string;
  educationProvided: string;
  followUpPlan: string;
  sessionDateTime: string;
  sessionDuration: string;
  mobilityStatus: string;
  rangeOfMotion: string;
  muscleStrength: string;
  balance: string;
  gait: string;
  transferAbility: string;
  walkingDistance: string;
  assistiveDevice: string;
  painScore: string;
  fallRisk: string;
  exerciseIntervention: string;
  patientTolerance: string;
  nextSessionPlan: string;
  currentWeight: string;
  height: string;
  bmi: string;
  weightChange: string;
  dietaryIntake: string;
  appetite: string;
  nutritionDiagnosis: string;
  calorieRequirement: string;
  proteinRequirement: string;
  nutritionIntervention: string;
  dietRecommendation: string;
  supplementPlan: string;
  monitoringPlan: string;
  supportSystem: string;
  livingArrangement: string;
  financialConcerns: string;
  safeguardingRisk: string;
  psychosocialConcerns: string;
  dischargeBarriers: string;
  communityResources: string;
  referralsMade: string;
  consent: string;
  adlStatus: string;
  cognition: string;
  homeSafety: string;
  equipmentNeeds: string;
  speechStatus: string;
  languageStatus: string;
  swallowingStatus: string;
  aspirationRisk: string;
  mentalStatus: string;
  psychologicalRisk: string;
  psychologyIntervention: string;
  psychologyResponse: string;
  functionalBaseline: string;
  multidisciplinaryGoals: string;
  rehabilitationProgress: string;
};

type AdditionalProgressDocumentation = {
  noteType: AdditionalNoteType;
  reasonForNote: string;
  currentCondition: string;
  changesOrFindings: string;
  actionTaken: string;
  patientResponse: string;
  peopleInformed: string;
  followUpRequired: string;
  followUpDate: string;
  previousPlan: string;
  currentSymptoms: string;
  changeSinceReview: string;
  treatmentCompliance: string;
  relevantResults: string;
  currentAssessment: string;
  nextAction: string;
  escalationRequired: string;
  coordinationReason: string;
  currentCareNeeds: string;
  teamsInvolved: string;
  patientFamilyInvolvement: string;
  discussionSummary: string;
  decisionsMade: string;
  assignedActions: string;
  responsiblePerson: string;
  targetDate: string;
  referralRequired: string;
  dischargeBarriers: string;
  followUpStatus: string;
  educationTopic: string;
  educationProvidedTo: string;
  teachingMethod: string;
  materialLanguage: string;
  informationExplained: string;
  patientUnderstanding: string;
  teachBackResult: string;
  learningBarriers: string;
  interpreterRequired: string;
  questionsRaised: string;
  additionalEducation: string;
  callDirection: string;
  callerRecipient: string;
  relationshipToPatient: string;
  contactNumber: string;
  callDateTime: string;
  identityVerified: string;
  callReason: string;
  clinicalAdvice: string;
  actionAgreed: string;
  urgency: string;
  callOutcome: string;
  patientConsent: string;
  informationShared: string;
  familyConcerns: string;
  handoverFrom: string;
  handoverTo: string;
  handoverDateTime: string;
  situation: string;
  background: string;
  handoverAssessment: string;
  recommendation: string;
  pendingTasks: string;
  safetyConcerns: string;
  escalationCriteria: string;
  acknowledgementReceived: string;
  caseNeeds: string;
  servicesInvolved: string;
  caseBarriers: string;
  resourcePlan: string;
  caseOutcome: string;
  amendmentReason: string;
};

type OperativeDocumentation = {
  surgeonName: string;
  assistantName: string;
  otNurseName: string;
  surgeryName: string;
  duration: string;
  durationHours?: string;
  durationMinutes?: string;
  operativeDate: string;
  operativeFindings: string;
  plan: string;
};

type Note = {
  id: number;
  title: string;
  category: NoteCategory;
  specialty: string;
  author: string;
  date: string;
  status: NoteStatus;
  priority: "High" | "Medium" | "Low";
  content?: string;
  assessment?: string;
  intervention?: string;
  patientResponse?: string;
  safetyRisk?: string;
  communication?: string;
  followUpPlan?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  pulse?: string;
  painScore?: string;
  painAssessment?: PainAssessment;
  temperature?: string;
  respiratoryRate?: string;
  spo2?: string;
  glucose?: string;
  glucoseMmolL?: string;
  glucoseUnit?: GlucoseUnit;
  consciousnessLevel?: string;
  patientPosition?: string;
  signedBy?: string;
  signedAt?: string;
  signatureAttested?: boolean;
  medicalNoteType?: MedicalNoteType;
  customMedicalNoteType?: string;
  transplantType?: TransplantType;
  medicalNoteSection?: MedicalNoteSection;
  subjective?: string;
  objective?: string;
  medicalAssessment?: string;
  plan?: string;
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string;
  practitionerId?: string;
  patientId?: string;
  encounterId?: string;
  serviceDateTime?: string;
  authenticatedSigner?: string;
  amendmentReason?: string;
  pharmacy?: PharmacyDocumentation;
  alliedHealth?: AlliedHealthDocumentation;
  additionalProgress?: AdditionalProgressDocumentation;
  operative?: OperativeDocumentation;
};

type CategoryConfig = {
  id: string;
  label: NoteCategory;
  shortLabel: string;
  description: string;
  count: number;
  icon: typeof Stethoscope;
  accent: string;
  soft: string;
  specialties: string[];
};

type NoteTableActions = {
  onDelete: (note: Note) => void;
  onEdit: (note: Note) => void;
  onStatusChange: (note: Note, status: NoteStatus) => void;
  onView: (note: Note) => void;
};

const medicalOtherSpecialty = "Others";
const medicalSpecialties = [
  "Neurology",
  "Respiratory Medicine",
  "Cardiology",
  "Hepatology",
  "Infectious Diseases",
  "Dermatology",
  "Ophthalmology",
  "Palliative Care",
  "Rehabilitation",
  "Geriatrics",
  "Radiology",
  "General Medicine",
  "Rheumatology",
  "Immunology",
  "Gastroenterology",
  "Reproductive Medicine",
  "Obstetrics & Gynecology",
  "Pediatrics",
  "Endocrinology",
  "Nephrology",
  "Psychiatry",
  "Psychology",
  "Pain Medicine",
  medicalOtherSpecialty,
];
const diagnosisOtherOption = "Others";
const medicalDiagnosisBySpecialty: Record<string, string[]> = {
  Neurology: ["Acute ischemic stroke", "Transient ischemic attack", "Seizure disorder", "Migraine", "Parkinson disease", "Peripheral neuropathy", "Dementia", "Multiple sclerosis"],
  "Respiratory Medicine": ["Bronchial asthma", "COPD exacerbation", "Pneumonia", "Pleural effusion", "Pulmonary embolism", "Interstitial lung disease", "Tuberculosis"],
  Cardiology: ["Hypertension", "Stable angina", "Acute coronary syndrome", "Heart failure", "Atrial fibrillation", "Valvular heart disease", "Cardiomyopathy"],
  Hepatology: ["Acute hepatitis", "Chronic liver disease", "Cirrhosis", "Ascites", "Hepatic encephalopathy", "Portal hypertension"],
  "Infectious Diseases": ["Sepsis", "Dengue fever", "Malaria", "Enteric fever", "Urinary tract infection", "Cellulitis", "COVID-19"],
  Dermatology: ["Eczema", "Psoriasis", "Urticaria", "Cellulitis", "Fungal infection", "Drug rash"],
  Ophthalmology: ["Conjunctivitis", "Cataract", "Glaucoma", "Diabetic retinopathy", "Uveitis"],
  "Palliative Care": ["Cancer pain", "End-of-life care needs", "Dyspnea management", "Symptom control", "Goals of care discussion"],
  Rehabilitation: ["Post-stroke rehabilitation", "Post-operative rehabilitation", "Mobility impairment", "Functional decline", "Deconditioning"],
  Geriatrics: ["Frailty syndrome", "Delirium", "Dementia", "Falls risk", "Polypharmacy", "Functional decline"],
  Radiology: ["Imaging review pending", "Abnormal radiology finding", "No acute imaging abnormality", "Follow-up imaging advised"],
  "General Medicine": ["Fever under evaluation", "Anemia", "Electrolyte imbalance", "Diabetes mellitus", "Hypertension", "Acute kidney injury"],
  Rheumatology: ["Rheumatoid arthritis", "Systemic lupus erythematosus", "Osteoarthritis", "Gout", "Vasculitis"],
  Immunology: ["Allergic reaction", "Immunodeficiency evaluation", "Autoimmune disorder", "Drug hypersensitivity"],
  Gastroenterology: ["Acute gastroenteritis", "GERD", "Peptic ulcer disease", "Inflammatory bowel disease", "GI bleeding", "Pancreatitis"],
  "Reproductive Medicine": ["Infertility evaluation", "PCOS", "Ovulatory dysfunction", "Endometriosis", "Recurrent pregnancy loss"],
  "Obstetrics & Gynecology": ["Antenatal review", "Abnormal uterine bleeding", "Pelvic inflammatory disease", "Ovarian cyst", "Pregnancy-related hypertension"],
  Pediatrics: ["Acute febrile illness", "Bronchiolitis", "Pediatric asthma", "Gastroenteritis", "Seizure episode", "Growth concern"],
  Endocrinology: ["Diabetes mellitus", "Hypothyroidism", "Hyperthyroidism", "Diabetic ketoacidosis", "Adrenal insufficiency"],
  Nephrology: ["Acute kidney injury", "Chronic kidney disease", "Nephrotic syndrome", "Glomerulonephritis", "Electrolyte disorder"],
  Psychiatry: ["Major depressive disorder", "Anxiety disorder", "Bipolar disorder", "Psychosis", "Substance use disorder"],
  Psychology: ["Adjustment disorder", "Anxiety symptoms", "Depressive symptoms", "Stress-related concerns", "Cognitive assessment"],
  "Pain Medicine": ["Acute pain syndrome", "Chronic pain syndrome", "Neuropathic pain", "Cancer pain", "Post-operative pain"],
};
const surgeryOtherSpecialty = "Others";
const surgerySpecialties = [
  "Neurosurgery",
  "Ophthalmology",
  "ENT",
  "Cardiothoracic Surgery",
  "Thoracic Surgery",
  "Hepatobiliary Surgery",
  "General Surgery",
  "Colorectal Surgery",
  "Upper GI Surgery",
  "Lower GI Surgery",
  "Vascular Surgery",
  "Orthopedic Surgery",
  "Interventional Radiology",
  "Gynecology",
  "Transplant Surgery",
  "Plastic and Reconstructive Surgery",
  "Maxillo-facial Surgery",
  "Urology",
  surgeryOtherSpecialty,
];

const cpotDomains: Array<{ key: PainDomainKey; label: string; options: PainScoreOption[] }> = [
  {
    key: "cpotFacial",
    label: "Facial expression",
    options: [
      { score: 0, label: "Relaxed, neutral", guidance: "No muscular tension observed in the face" },
      { score: 1, label: "Tense", guidance: "Frowning, brow lowering, orbit tightening" },
      { score: 2, label: "Grimacing", guidance: "Eyelids tightly closed, mouth open, or teeth clenched" },
    ],
  },
  {
    key: "cpotBody",
    label: "Body movements",
    options: [
      { score: 0, label: "Absence of movements / normal position", guidance: "Does not move at all or remains in normal position" },
      { score: 1, label: "Protection", guidance: "Slow cautious movements; touching/rubbing the pain site; guarding" },
      { score: 2, label: "Restlessness / agitation", guidance: "Pulling tubes, attempting to sit up, thrashing, not following commands, or striking at staff" },
    ],
  },
  {
    key: "cpotMuscle",
    label: "Muscle tension",
    options: [
      { score: 0, label: "Relaxed", guidance: "No resistance to passive movements" },
      { score: 1, label: "Tense, rigid", guidance: "Resistance to passive movements" },
      { score: 2, label: "Very tense or rigid", guidance: "Strong resistance to passive movements; unable to complete them" },
    ],
  },
];

const cpotVentilatorOptions: PainScoreOption[] = [
  { score: 0, label: "Tolerating ventilator / movement", guidance: "Alarms not activated; ventilation easy" },
  { score: 1, label: "Coughing but tolerating", guidance: "Coughing; alarms may activate but stop spontaneously" },
  { score: 2, label: "Fighting ventilator", guidance: "Asynchrony, blocking ventilation, alarms frequently activated" },
];

const cpotVocalizationOptions: PainScoreOption[] = [
  { score: 0, label: "Talking in normal tone or no sound" },
  { score: 1, label: "Sighing, moaning" },
  { score: 2, label: "Crying out, sobbing" },
];

const flaccDomains: Array<{ key: PainDomainKey; label: string; options: PainScoreOption[] }> = [
  {
    key: "flaccFace",
    label: "Face",
    options: [
      { score: 0, label: "No particular expression or smile" },
      { score: 1, label: "Occasional grimace or frown; withdrawn, disinterested" },
      { score: 2, label: "Frequent to constant frown, clenched jaw, quivering chin" },
    ],
  },
  {
    key: "flaccLegs",
    label: "Legs",
    options: [
      { score: 0, label: "Normal position or relaxed" },
      { score: 1, label: "Uneasy, restless, tense" },
      { score: 2, label: "Kicking, or legs drawn up" },
    ],
  },
  {
    key: "flaccActivity",
    label: "Activity",
    options: [
      { score: 0, label: "Lying quietly, normal position, moves easily" },
      { score: 1, label: "Squirming, shifting back and forth, tense" },
      { score: 2, label: "Arched, rigid, or jerking" },
    ],
  },
  {
    key: "flaccCry",
    label: "Cry",
    options: [
      { score: 0, label: "No cry (awake or asleep)" },
      { score: 1, label: "Moans or whimpers; occasional complaint" },
      { score: 2, label: "Crying steadily, screams or sobs; frequent complaints" },
    ],
  },
  {
    key: "flaccConsolability",
    label: "Consolability",
    options: [
      { score: 0, label: "Content, relaxed" },
      { score: 1, label: "Reassured by occasional touching/hugging/talking; distractible" },
      { score: 2, label: "Difficult to console or comfort" },
    ],
  },
];

const nrsPainRanges: NrsPainRange[] = [
  {
    id: "none",
    label: "No pain",
    range: "0",
    score: 0,
    condition: "Comfortable",
    description: "No pain reported at rest or movement.",
  },
  {
    id: "mild",
    label: "Mild pain",
    range: "1-3",
    score: 2,
    condition: "Discomforting but tolerable",
    description: "Pain is present but does not significantly limit activity.",
  },
  {
    id: "moderate",
    label: "Moderate pain",
    range: "4-6",
    score: 5,
    condition: "Distressing and activity-limiting",
    description: "Pain interferes with comfort, sleep, or movement.",
  },
  {
    id: "severe",
    label: "Severe pain",
    range: "7-10",
    score: 8,
    condition: "Intense to unbearable",
    description: "Pain is severe, very intense, or excruciating.",
  },
];

const nrsScalePoints = [
  { score: 0, label: "No pain", expression: "smile", tone: "bg-emerald-500", rangeId: "none" },
  { score: 1, label: "Very mild", expression: "smile", tone: "bg-lime-400", rangeId: "mild" },
  { score: 2, label: "Discomforting", expression: "slight-smile", tone: "bg-lime-400", rangeId: "mild" },
  { score: 3, label: "Tolerable", expression: "neutral", tone: "bg-yellow-300", rangeId: "mild" },
  { score: 4, label: "Distressing", expression: "neutral", tone: "bg-yellow-300", rangeId: "moderate" },
  { score: 5, label: "Very distressing", expression: "concerned", tone: "bg-orange-400", rangeId: "moderate" },
  { score: 6, label: "Intense", expression: "frown", tone: "bg-orange-400", rangeId: "moderate" },
  { score: 7, label: "Very intense", expression: "frown", tone: "bg-red-400", rangeId: "severe" },
  { score: 8, label: "Utterly horrible", expression: "deep-frown", tone: "bg-red-500", rangeId: "severe" },
  { score: 9, label: "Excruciating unbearable", expression: "cry", tone: "bg-red-600", rangeId: "severe" },
  { score: 10, label: "Unimaginable unspeakable", expression: "cry", tone: "bg-red-700", rangeId: "severe" },
] as const;

function getPainSeverity(scale: PainScale, total: number) {
  if (scale === "CPOT") return total >= 3 ? "Significant pain present" : "Acceptable / minimal pain";
  if (total === 0) return scale === "FLACC" ? "Relaxed and comfortable" : "No pain";
  if (total <= 3) return scale === "FLACC" ? "Mild discomfort" : "Mild pain";
  if (total <= 6) return "Moderate pain";
  return scale === "FLACC" ? "Severe discomfort / pain" : "Severe pain";
}

function calculateObservedPainScore(scale: PainScale, scores: PainAssessment["scores"]) {
  const keys =
    scale === "CPOT"
      ? (["cpotFacial", "cpotBody", "cpotMuscle", "cpotDomain4"] as PainDomainKey[])
      : (["flaccFace", "flaccLegs", "flaccActivity", "flaccCry", "flaccConsolability"] as PainDomainKey[]);
  if (!keys.every((key) => scores[key] !== undefined)) return undefined;
  return keys.reduce((total, key) => total + (scores[key] ?? 0), 0);
}

const categories: CategoryConfig[] = [
  {
    id: "medical",
    label: "Medical Notes",
    shortLabel: "Medical",
    description: "Physician notes, consults and evaluations",
    count: 28,
    icon: Stethoscope,
    accent: "text-emerald-600",
    soft: "bg-emerald-50 dark:bg-emerald-950/35",
    specialties: medicalSpecialties,
  },
  {
    id: "surgery",
    label: "Surgery Notes",
    shortLabel: "Surgical",
    description: "Pre-operative, operative and post-operative surgical documentation",
    count: 0,
    icon: Stethoscope,
    accent: "text-rose-600",
    soft: "bg-rose-50 dark:bg-rose-950/35",
    specialties: surgerySpecialties,
  },
  {
    id: "operative",
    label: "Operative Notes",
    shortLabel: "Operative",
    description: "Structured operative team, procedure, findings and post-operative plan",
    count: 0,
    icon: ClipboardList,
    accent: "text-fuchsia-600",
    soft: "bg-fuchsia-50 dark:bg-fuchsia-950/35",
    specialties: surgerySpecialties,
  },
  {
    id: "nurse",
    label: "Nurse Notes",
    shortLabel: "Nurse",
    description: "Nursing assessment, care notes and shift notes",
    count: 32,
    icon: HeartPulse,
    accent: "text-blue-600",
    soft: "bg-blue-50 dark:bg-blue-950/35",
    specialties: ["ICU Nurse", "Ward Nurse", "ED Nurse"],
  },
  {
    id: "pharmacy",
    label: "Pharmacy Notes",
    shortLabel: "Pharmacy",
    description: "Pharmacy care, medication reviews and interventions",
    count: 14,
    icon: Pill,
    accent: "text-violet-600",
    soft: "bg-violet-50 dark:bg-violet-950/35",
    specialties: ["Pharmacy"],
  },
  {
    id: "allied",
    label: "Allied Health Notes",
    shortLabel: "Allied Health",
    description: "Therapy, nutrition, social worker and allied health",
    count: 18,
    icon: UsersRound,
    accent: "text-orange-600",
    soft: "bg-orange-50 dark:bg-orange-950/35",
    specialties: ["Physiotherapy", "Dietitian", "Social Worker", "Occupational Therapy", "Speech Therapy", "Psychology"],
  },
];

const notesCategories = categories;

function getCategoryDisplayLabel(category: string) {
  return category === "Surgery Notes" ? "Surgical Notes" : category;
}

const initialNotes: Note[] = [
  { id: 1, title: "Pain Management Note", category: "Nurse Notes", specialty: "ICU", author: "Nurse Mary", date: "26 May 2026, 09:30 AM", status: "Signed", priority: "High" },
  { id: 2, title: "Shift Assessment", category: "Nurse Notes", specialty: "ICU", author: "Nurse Mary", date: "26 May 2026, 06:30 AM", status: "Signed", priority: "Medium" },
  { id: 3, title: "Care Plan Note", category: "Nurse Notes", specialty: "Cardiology", author: "Nurse Anna", date: "25 May 2026, 10:15 PM", status: "Draft", priority: "Low" },
  { id: 4, title: "Progress Note", category: "Medical Notes", medicalNoteSection: "ED Notes", specialty: "Cardiology", author: "Dr. Smith", date: "26 May 2026, 08:15 AM", status: "Signed", priority: "Medium" },
  { id: 5, title: "Consultant Notes", category: "Medical Notes", medicalNoteSection: "Physician Notes", specialty: "Neurology", author: "Dr. William", date: "25 May 2026, 03:20 PM", status: "Signed", priority: "Low" },
  { id: 6, title: "Morning Ward Round", category: "Medical Notes", medicalNoteSection: "Physician Notes", specialty: "Cardiology", author: "Dr. Smith", date: "25 May 2026, 11:00 AM", status: "Draft", priority: "High" },
  { id: 7, title: "Medication Review", category: "Pharmacy Notes", specialty: "General", author: "Pharmacist John", date: "25 May 2026, 04:45 PM", status: "Signed", priority: "Medium" },
  { id: 8, title: "Drug Interaction Note", category: "Pharmacy Notes", specialty: "ICU", author: "Pharmacist John", date: "25 May 2026, 01:20 PM", status: "Pending Review", priority: "High" },
  { id: 9, title: "Medication Counseling", category: "Pharmacy Notes", specialty: "General", author: "Pharmacist Anna", date: "24 May 2026, 10:30 AM", status: "Draft", priority: "Low" },
  { id: 10, title: "Physiotherapy Session", category: "Allied Health Notes", specialty: "Physiotherapy", author: "John PT", date: "25 May 2026, 02:20 PM", status: "Draft", priority: "Low" },
  { id: 11, title: "Dietitian Assessment", category: "Allied Health Notes", specialty: "Dietitian", author: "Dietitian Mary", date: "25 May 2026, 11:40 AM", status: "Signed", priority: "Medium" },
  { id: 12, title: "Social Worker Assessment", category: "Allied Health Notes", specialty: "Social Worker", author: "Social Worker", date: "24 May 2026, 03:30 PM", status: "Signed", priority: "Low" },
  { id: 13, title: "Follow Up Note", category: "Special Instruction Notes", specialty: "Follow Up", author: "Nurse Mary", date: "24 May 2026, 11:10 AM", status: "Draft", priority: "Low" },
  { id: 14, title: "Morning Round", category: "Special Instruction Notes", specialty: "Morning Round", author: "Dr. Anna", date: "24 May 2026, 09:40 AM", status: "Signed", priority: "Medium" },
  { id: 15, title: "Evening Round", category: "Special Instruction Notes", specialty: "Evening Round", author: "Dr. Mary", date: "23 May 2026, 04:20 PM", status: "Signed", priority: "Low" },
  { id: 101, title: "Cardiac Assessment Note", category: "Nurse Notes", specialty: "Cardiac Assessment", author: "Nurse Priya", date: "23 May 2026, 02:15 PM", status: "Signed", priority: "High", content: "Cardiac assessment completed. Rhythm stable, peripheral perfusion adequate and chest discomfort absent at rest." },
  { id: 102, title: "Cardiac Rehabilitation Note", category: "Nurse Notes", specialty: "Cardiac Rehab", author: "Nurse Priya", date: "23 May 2026, 12:30 PM", status: "Draft", priority: "Medium", content: "Patient completed supervised mobilisation and tolerated the planned cardiac rehabilitation activity without distress." },
  { id: 103, title: "Burn Wound Care Note", category: "Nurse Notes", specialty: "Burns", author: "Nurse Mary", date: "22 May 2026, 05:10 PM", status: "Signed", priority: "High", content: "Burn dressing changed using aseptic technique. Wound bed clean with no new signs of infection." },
  { id: 104, title: "Breast Care Nursing Note", category: "Nurse Notes", specialty: "Breast Care", author: "Nurse Anna", date: "22 May 2026, 03:45 PM", status: "Pending Review", priority: "Medium", content: "Post-procedure breast care reviewed. Patient advised on wound observation, support garment use and warning signs." },
  { id: 105, title: "Aged Care Review", category: "Nurse Notes", specialty: "Aged Care", author: "Nurse Mary", date: "22 May 2026, 10:20 AM", status: "Signed", priority: "Medium", content: "Falls risk, skin integrity, hydration and orientation reviewed. Assistance required for transfers and personal care." },
  { id: 106, title: "Respiratory Medical Progress Note", category: "Medical Notes", medicalNoteSection: "ED Notes", specialty: "Respiratory Medicine", author: "Dr. Smith", date: "23 May 2026, 01:40 PM", status: "Signed", priority: "High", content: "Hemodynamically stable. Continue close respiratory monitoring and current supportive management.", medicalNoteType: "Progress Note" },
  { id: 107, title: "Palliative Care Consultant Note", category: "Medical Notes", medicalNoteSection: "Physician Notes", specialty: "Palliative Care", author: "Dr. Mehta", date: "22 May 2026, 04:35 PM", status: "Pending Review", priority: "High", content: "Palliative care review completed. Treatment goals and symptom control discussed with the patient.", medicalNoteType: "Consultant Notes" },
  { id: 108, title: "Cardiology Progress Note", category: "Medical Notes", medicalNoteSection: "Physician Notes", specialty: "Cardiology", author: "Dr. William", date: "22 May 2026, 02:25 PM", status: "Signed", priority: "Medium", content: "Pain and function improving. Continue protected mobilisation and repeat imaging as planned.", medicalNoteType: "Progress Note" },
  { id: 109, title: "Geriatrics Review", category: "Medical Notes", medicalNoteSection: "Physician Notes", specialty: "Geriatrics", author: "Dr. Smith", date: "22 May 2026, 11:50 AM", status: "Draft", priority: "Medium", content: "Medical review completed. Chronic conditions remain stable and medication plan was reconciled.", medicalNoteType: "Progress Note" },
  { id: 110, title: "ED Procedure Note", category: "Medical Notes", medicalNoteSection: "ED Notes", specialty: "Radiology", author: "Dr. Rao", date: "21 May 2026, 08:15 PM", status: "Signed", priority: "High", content: "Emergency assessment completed. Immediate causes of deterioration addressed and patient transferred for ongoing monitoring.", medicalNoteType: "Procedure Note" },
  { id: 111, title: "Cardiology Medication Review", category: "Pharmacy Notes", specialty: "Cardiology", author: "Pharmacist John", date: "23 May 2026, 10:35 AM", status: "Signed", priority: "Medium", content: "Cardiac medicines reviewed for dose, duplication and blood pressure effect. No immediate medication safety issue identified." },
  { id: 112, title: "Oncology Medication Safety Note", category: "Pharmacy Notes", specialty: "Oncology", author: "Pharmacist Anna", date: "22 May 2026, 05:25 PM", status: "Pending Review", priority: "High", content: "Anticancer supportive medicines reviewed against current laboratory results and interaction risks." },
  { id: 113, title: "Renal Dose Review", category: "Pharmacy Notes", specialty: "Renal", author: "Pharmacist John", date: "22 May 2026, 01:15 PM", status: "Signed", priority: "High", content: "Renal function reviewed. Dose adjustment recommended for medicines cleared primarily by the kidneys." },
  { id: 114, title: "Anticoagulation Review", category: "Pharmacy Notes", specialty: "Anticoagulation", author: "Pharmacist Anna", date: "21 May 2026, 04:40 PM", status: "Draft", priority: "High", content: "Anticoagulation indication, bleeding risk and recent monitoring results reviewed. Follow-up level requested." },
  { id: 115, title: "Nutrition Support Pharmacy Note", category: "Pharmacy Notes", specialty: "Nutrition Support", author: "Pharmacist John", date: "21 May 2026, 12:05 PM", status: "Signed", priority: "Medium", content: "Parenteral nutrition ingredients, electrolyte content and infusion compatibility reviewed with the nutrition team." },
  { id: 116, title: "Occupational Therapy Assessment", category: "Allied Health Notes", specialty: "Occupational Therapy", author: "Therapist Neha", date: "23 May 2026, 09:20 AM", status: "Signed", priority: "Medium", content: "Daily living activities and home safety needs assessed. Adaptive equipment recommendations discussed." },
  { id: 117, title: "Speech Therapy Review", category: "Allied Health Notes", specialty: "Speech Therapy", author: "Therapist Riya", date: "22 May 2026, 03:10 PM", status: "Pending Review", priority: "High", content: "Speech clarity and swallow safety reviewed. Modified texture and supervised intake remain recommended." },
  { id: 118, title: "Psychology Session Note", category: "Allied Health Notes", specialty: "Psychology", author: "Dr. Kapoor", date: "22 May 2026, 11:30 AM", status: "Draft", priority: "Medium", content: "Patient discussed treatment-related anxiety. Grounding strategies and short-term coping plan were introduced." },
  { id: 119, title: "Physiotherapy Plan", category: "Allied Health Notes", specialty: "Physiotherapy", author: "Physiotherapist", date: "21 May 2026, 02:50 PM", status: "Signed", priority: "Medium", content: "Mobility and self-care goals reviewed. Activity tolerance continues to improve." },
  { id: 120, title: "General Progress Update", category: "Special Instruction Notes", specialty: "General", author: "Nurse Anna", date: "23 May 2026, 08:45 AM", status: "Signed", priority: "Medium", content: "General condition remains stable. Current care plan continues with routine observations and symptom review." },
  { id: 121, title: "Phone Call Note", category: "Special Instruction Notes", specialty: "Phone Call Note", author: "Nurse Mary", date: "22 May 2026, 06:05 PM", status: "Signed", priority: "Medium", content: "Family member contacted by phone and updated on the current care plan, visiting guidance and next review." },
  { id: 122, title: "Family Meeting Notes", category: "Special Instruction Notes", specialty: "Family Meeting", author: "Nurse Anna", date: "22 May 2026, 02:40 PM", status: "Pending Review", priority: "Medium", content: "Patient consent confirmed and progress discussed with family. Questions about discharge support were addressed." },
  { id: 123, title: "Clinical Handover Note", category: "Special Instruction Notes", specialty: "Handover", author: "Nurse Mary", date: "21 May 2026, 07:00 PM", status: "Signed", priority: "High", content: "Shift handover completed using SBAR. Pending investigations, mobility assistance and escalation criteria communicated." },
  { id: 124, title: "Case Management Note", category: "Special Instruction Notes", specialty: "Case Management", author: "Case Manager", date: "21 May 2026, 01:25 PM", status: "Draft", priority: "Medium", content: "Discharge needs, family support and community service referrals reviewed. Follow-up actions assigned to the care team." },
  { id: 125, title: "Surgical Notes - General Surgery", category: "Surgery Notes", specialty: "General Surgery", author: "Dr. Surgeon", date: "21 May 2026, 11:30 AM", status: "Draft", priority: "High", content: "Post-operative condition, procedure outcome, monitoring instructions and immediate care plan documented.", medicalNoteType: "Surgical Notes" },
];

const medicalNoteTypes: MedicalNoteType[] = [
  "Consultant Notes",
  "Morning Ward Round",
  "Afternoon Ward Round",
  "Evening Ward Round",
  "Surgical Notes",
  "Anesthesia Notes",
  "Pain Medicine Notes",
  "Procedure Note",
  "Progress Note",
  "Family Meeting Notes",
  "Others",
  "End-of-Life Care Notes",
];

const surgeryNoteTypes: MedicalNoteType[] = [
  ...medicalNoteTypes.filter((type) => type !== "Others" && type !== "End-of-Life Care Notes"),
  "Operating Notes",
  "Others",
  "End-of-Life Care Notes",
];

const transplantTypes: TransplantType[] = [
  "Kidney transplant",
  "Liver transplant",
  "Heart transplant",
  "Lung transplant",
  "Bone marrow (stem cell) transplant",
];

const pharmacyNoteTypes: PharmacyNoteType[] = [
  "Medication Review",
  "Medication Reconciliation",
  "Drug Interaction",
  "Dose Adjustment",
  "Adverse Drug Reaction",
  "Medication Counseling",
  "Anticoagulation Review",
  "Renal Dose Review",
];

const alliedNoteTypes: AlliedNoteType[] = ["Assessment Notes", "Family Meeting Notes"];

const additionalNoteTypes: AdditionalNoteType[] = [
  "General Progress Note",
  "Follow-up Note",
  "Phone Call Note",
  "Family Meeting Notes",
  "Handover Note",
  "Case Management Note",
  "Morning Round",
  "Evening Round",
  "Consultant Notes",
];

const emptyPharmacyDocumentation: PharmacyDocumentation = {
  noteType: "Medication Review",
  medicationPreviousToAdmission: "",
  medicationCurrently: "",
  medicationAtDischarge: "",
  medicationName: "",
  medicationCode: "",
  dose: "",
  doseUnit: "",
  route: "",
  frequency: "",
  startDate: "",
  endDate: "",
  medicationStatus: "Active",
  reviewReason: "",
  clinicalIndication: "",
  medicationProblem: "",
  interactionSeverity: "None identified",
  relevantAllergy: "",
  relevantLabs: "",
  recommendation: "",
  prescriberResponse: "",
  recommendationOutcome: "Pending",
  followUp: "",
};

const emptyAlliedHealthDocumentation: AlliedHealthDocumentation = {
  noteType: "Assessment Notes",
  referralReason: "",
  initialAssessment: "",
  functionalStatus: "",
  identifiedProblems: "",
  intervention: "",
  patientResponse: "",
  goals: "",
  goalProgress: "",
  educationProvided: "",
  followUpPlan: "",
  sessionDateTime: "",
  sessionDuration: "",
  mobilityStatus: "",
  rangeOfMotion: "",
  muscleStrength: "",
  balance: "",
  gait: "",
  transferAbility: "",
  walkingDistance: "",
  assistiveDevice: "",
  painScore: "",
  fallRisk: "",
  exerciseIntervention: "",
  patientTolerance: "",
  nextSessionPlan: "",
  currentWeight: "",
  height: "",
  bmi: "",
  weightChange: "",
  dietaryIntake: "",
  appetite: "",
  nutritionDiagnosis: "",
  calorieRequirement: "",
  proteinRequirement: "",
  nutritionIntervention: "",
  dietRecommendation: "",
  supplementPlan: "",
  monitoringPlan: "",
  supportSystem: "",
  livingArrangement: "",
  financialConcerns: "",
  safeguardingRisk: "",
  psychosocialConcerns: "",
  dischargeBarriers: "",
  communityResources: "",
  referralsMade: "",
  consent: "",
  adlStatus: "",
  cognition: "",
  homeSafety: "",
  equipmentNeeds: "",
  speechStatus: "",
  languageStatus: "",
  swallowingStatus: "",
  aspirationRisk: "",
  mentalStatus: "",
  psychologicalRisk: "",
  psychologyIntervention: "",
  psychologyResponse: "",
  functionalBaseline: "",
  multidisciplinaryGoals: "",
  rehabilitationProgress: "",
};

const emptyAdditionalProgressDocumentation: AdditionalProgressDocumentation = {
  noteType: "General Progress Note",
  reasonForNote: "",
  currentCondition: "",
  changesOrFindings: "",
  actionTaken: "",
  patientResponse: "",
  peopleInformed: "",
  followUpRequired: "No",
  followUpDate: "",
  previousPlan: "",
  currentSymptoms: "",
  changeSinceReview: "",
  treatmentCompliance: "",
  relevantResults: "",
  currentAssessment: "",
  nextAction: "",
  escalationRequired: "No",
  coordinationReason: "",
  currentCareNeeds: "",
  teamsInvolved: "",
  patientFamilyInvolvement: "",
  discussionSummary: "",
  decisionsMade: "",
  assignedActions: "",
  responsiblePerson: "",
  targetDate: "",
  referralRequired: "",
  dischargeBarriers: "",
  followUpStatus: "Pending",
  educationTopic: "",
  educationProvidedTo: "",
  teachingMethod: "Verbal explanation",
  materialLanguage: "",
  informationExplained: "",
  patientUnderstanding: "",
  teachBackResult: "",
  learningBarriers: "",
  interpreterRequired: "No",
  questionsRaised: "",
  additionalEducation: "",
  callDirection: "Outgoing",
  callerRecipient: "",
  relationshipToPatient: "",
  contactNumber: "",
  callDateTime: "",
  identityVerified: "No",
  callReason: "",
  clinicalAdvice: "",
  actionAgreed: "",
  urgency: "Routine",
  callOutcome: "Completed",
  patientConsent: "Not recorded",
  informationShared: "",
  familyConcerns: "",
  handoverFrom: "",
  handoverTo: "",
  handoverDateTime: "",
  situation: "",
  background: "",
  handoverAssessment: "",
  recommendation: "",
  pendingTasks: "",
  safetyConcerns: "",
  escalationCriteria: "",
  acknowledgementReceived: "No",
  caseNeeds: "",
  servicesInvolved: "",
  caseBarriers: "",
  resourcePlan: "",
  caseOutcome: "",
  amendmentReason: "",
};

const emptyOperativeDocumentation: OperativeDocumentation = {
  surgeonName: "",
  assistantName: "",
  otNurseName: "",
  surgeryName: "",
  duration: "",
  operativeDate: "",
  operativeFindings: "",
  plan: "",
};

function toDateTimeLocalValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function inferMedicalNoteType(title?: string): MedicalNoteType {
  return medicalNoteTypes.find((type) => title?.toLowerCase().includes(type.toLowerCase())) ?? "Progress Note";
}

function inferAdditionalNoteType(specialty?: string, title?: string): AdditionalNoteType {
  const source = `${specialty ?? ""} ${title ?? ""}`.toLowerCase();
  if (source.includes("morning")) return "Morning Round";
  if (source.includes("evening")) return "Evening Round";
  if (source.includes("consultant")) return "Consultant Notes";
  if (source.includes("phone call")) return "Phone Call Note";
  if (source.includes("family")) return "Family Meeting Notes";
  if (source.includes("handover")) return "Handover Note";
  if (source.includes("case management")) return "Case Management Note";
  if (source.includes("follow up") || source.includes("follow-up")) return "Follow-up Note";
  return "General Progress Note";
}

function convertGlucoseMgDlToMmolL(value: string) {
  const numericValue = Number(value);
  return value && Number.isFinite(numericValue) ? (numericValue / 18.0182).toFixed(1) : "";
}

function convertGlucoseMmolLToMgDl(value: string) {
  const numericValue = Number(value);
  return value && Number.isFinite(numericValue) ? (numericValue * 18.0182).toFixed(0) : "";
}

function normalizeNote(note: Note): Note {
  const legacyCategory = note.category as string;
  const legacyMedicalType = note.medicalNoteType as string | undefined;
  const legacyMedicalSection = note.medicalNoteSection as string | undefined;
  const legacyAlliedType = note.alliedHealth?.noteType as string | undefined;
  const legacyAdditionalType = note.additionalProgress?.noteType as string | undefined;
  let specialty = note.specialty;

  if (legacyCategory === "Nurse Notes") {
    if (specialty === "ICU") specialty = "ICU Nurse";
    else if (!["ICU Nurse", "Ward Nurse", "ED Nurse"].includes(specialty)) specialty = "Ward Nurse";
  } else if (legacyCategory === "Medical Notes" || legacyCategory === "Medical (ED Notes)") {
    const medicalSpecialtyMap: Record<string, string> = {
      ICU: "Respiratory Medicine",
      Oncology: "Palliative Care",
      "Palliative Medicine": "Palliative Care",
      Cardiothoracic: "Cardiology",
      Orthopedics: "Rehabilitation",
      "Emergency Medicine": "Radiology",
      "Others (Free Text)": "Others",
    };
    specialty = medicalSpecialtyMap[specialty] ?? specialty;
  } else if (legacyCategory === "Surgery Notes" || legacyCategory === "Operative Notes") {
    if (specialty === "Others (Free Text)") specialty = "Others";
  } else if (legacyCategory === "Pharmacy Notes") {
    specialty = "Pharmacy";
  } else if (legacyCategory === "Allied Health Notes") {
    if (specialty === "Nutrition") specialty = "Dietitian";
    if (specialty === "Rehabilitation") specialty = "Physiotherapy";
    if (specialty === "Social Work") specialty = "Social Worker";
  } else if (legacyCategory === "Additional Progress Notes" || legacyCategory === "Special Instruction Notes") {
    const additionalSpecialtyMap: Record<string, string> = {
      "Care Coordination": "Consultant Notes",
      "Patient Education": "Morning Round",
      "Family Communication": "Family Meeting",
    };
    specialty = additionalSpecialtyMap[specialty] ?? specialty;
  }

  const medicalNoteType =
    legacyMedicalType === "Discharge Summary" ||
    legacyMedicalType === "Admission History and Physical" ||
    legacyMedicalType === "Consult Note"
      ? "Consultant Notes"
      : legacyMedicalType === "Others (Free Text)"
        ? "Others"
        : legacyCategory === "Medical Notes" && legacyMedicalType === "Operating Notes"
          ? "Procedure Note"
          : note.medicalNoteType ?? (legacyCategory === "Surgery Notes" ? "Surgical Notes" : undefined);
  const alliedHealth = note.alliedHealth
    ? {
        ...note.alliedHealth,
        noteType: (legacyAlliedType === "Family Meeting Notes" ? "Family Meeting Notes" : "Assessment Notes") as AlliedNoteType,
      }
    : undefined;
  const additionalTypeMap: Record<string, AdditionalNoteType> = {
    "Care Coordination Note": "Consultant Notes",
    "Patient Education Note": "Morning Round",
    "Family Communication Note": "Family Meeting Notes",
  };
  const additionalProgress = note.additionalProgress
    ? { ...note.additionalProgress, noteType: additionalTypeMap[legacyAdditionalType ?? ""] ?? note.additionalProgress.noteType }
    : undefined;

  return {
    ...note,
    category:
      legacyCategory === "Medical (ED Notes)"
        ? "Medical Notes"
        : legacyCategory === "Additional Progress Notes"
          ? "Special Instruction Notes"
          : note.category,
    specialty,
    glucoseUnit: note.glucoseUnit ?? (note.glucoseMmolL && !note.glucose ? "mmol/L" : "mg/dL"),
    glucoseMmolL: note.glucoseMmolL ?? (note.glucose ? convertGlucoseMgDlToMmolL(note.glucose) : undefined),
    medicalNoteType,
    medicalNoteSection:
      legacyCategory === "Medical Notes" || legacyCategory === "Medical (ED Notes)"
        ? legacyMedicalSection === "Physical Notes"
          ? "Physician Notes"
          : note.medicalNoteSection ?? "ED Notes"
        : undefined,
    alliedHealth,
    additionalProgress,
  };
}

function ensureUniqueNoteIds(notes: Note[]) {
  const usedIds = new Set<number>();
  let nextId = Math.max(0, ...notes.map((note) => note.id)) + 1;

  return notes.map((note) => {
    if (!usedIds.has(note.id)) {
      usedIds.add(note.id);
      return note;
    }

    while (usedIds.has(nextId)) nextId += 1;
    const noteWithUniqueId = { ...note, id: nextId };
    usedIds.add(nextId);
    nextId += 1;
    return noteWithUniqueId;
  });
}

function buildNoteTitle({
  additionalProgress,
  alliedHealth,
  category,
  medicalNoteType,
  pharmacy,
  specialty,
}: {
  additionalProgress: AdditionalProgressDocumentation;
  alliedHealth: AlliedHealthDocumentation;
  category: NoteCategory;
  medicalNoteType: string;
  pharmacy: PharmacyDocumentation;
  specialty: string;
}) {
  if (category === "Medical Notes") return `${medicalNoteType} - ${specialty}`;
  if (category === "Surgery Notes") return `${medicalNoteType} - ${specialty}`;
  if (category === "Operative Notes") return `Operative Note - ${specialty}`;
  if (category === "Pharmacy Notes") return pharmacy.noteType;
  if (category === "Allied Health Notes") return `${specialty} ${alliedHealth.noteType}`;
  if (category === "Special Instruction Notes") return additionalProgress.noteType;
  return `${specialty} Nursing Note`;
}

function getNoteType(note: Note) {
  if (note.medicalNoteType) {
    return note.medicalNoteType === "Others"
      ? note.customMedicalNoteType || note.medicalNoteType
      : note.medicalNoteType;
  }
  if (note.pharmacy?.noteType) return note.pharmacy.noteType;
  if (note.alliedHealth?.noteType) return note.alliedHealth.noteType;
  if (note.operative) return "Operative Note";
  if (note.category === "Special Instruction Notes" && note.additionalProgress?.noteType) return note.additionalProgress.noteType;
  return note.title;
}

function parseNoteDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getFilterDate(note: Note, dateType: string) {
  if (dateType === "Service Date") {
    return parseNoteDate(
      note.serviceDateTime ??
        note.alliedHealth?.sessionDateTime ??
        note.additionalProgress?.callDateTime ??
        note.additionalProgress?.handoverDateTime,
    );
  }
  return parseNoteDate(note.date);
}

function startOfDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function endOfDate(value: string) {
  return new Date(`${value}T23:59:59.999`);
}

function compareNoteDates(left: Note, right: Note) {
  const leftDate = parseNoteDate(left.serviceDateTime) ?? parseNoteDate(left.date);
  const rightDate = parseNoteDate(right.serviceDateTime) ?? parseNoteDate(right.date);
  return (leftDate?.getTime() ?? 0) - (rightDate?.getTime() ?? 0);
}

function priorityRank(priority: Note["priority"]) {
  return priority === "High" ? 0 : priority === "Medium" ? 1 : 2;
}

export function NotesPage() {
  const searchParams = useSearchParams();
  const [notes, setNotes] = React.useState<Note[]>(() => initialNotes.map(normalizeNote));
  const [notesLoaded, setNotesLoaded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");
  const [specialty, setSpecialty] = React.useState("All Specialties");
  const [category, setCategory] = React.useState<string>("All Categories");
  const [author, setAuthor] = React.useState("All Authors");
  const [status, setStatus] = React.useState("All Status");
  const [priority, setPriority] = React.useState("All Priorities");
  const [query, setQuery] = React.useState("");
  const [noteType, setNoteType] = React.useState("All Note Types");
  const [signer, setSigner] = React.useState("All Signers");
  const [visitScope, setVisitScope] = React.useState("All Patient Visits");
  const [visitId, setVisitId] = React.useState("");
  const [dateType, setDateType] = React.useState("Created Date");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [followUpFilter, setFollowUpFilter] = React.useState("All Follow-up");
  const [escalationFilter, setEscalationFilter] = React.useState("All Escalation");
  const [noteId, setNoteId] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [newNoteOpen, setNewNoteOpen] = React.useState(false);
  const [newNoteCategory, setNewNoteCategory] = React.useState<NoteCategory>("Nurse Notes");
  const [newMedicalNoteSection, setNewMedicalNoteSection] = React.useState<MedicalNoteSection>("ED Notes");
  const [filterLockedCategory, setFilterLockedCategory] = React.useState<NoteCategory | null>(null);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [viewingNote, setViewingNote] = React.useState<Note | null>(null);
  const activeCategory = categories.find((item) => item.id === activeTab);
  const requestedCategory = searchParams.get("category");
  const requestedSpecialty = searchParams.get("specialty");
  const filtersRequested = searchParams.get("filters") === "open";

  React.useEffect(() => {
    const nextCategory = categories.find((item) => item.id === requestedCategory);
    if (nextCategory) {
      setActiveTab(nextCategory.id);
      setCategory(nextCategory.label);
      setFilterLockedCategory(nextCategory.label);
      setSpecialty(nextCategory.specialties.includes(requestedSpecialty ?? "") ? requestedSpecialty ?? "All Specialties" : "All Specialties");
      return;
    }

    setActiveTab("all");
    setCategory("All Categories");
    setFilterLockedCategory(null);
    setSpecialty("All Specialties");
  }, [requestedCategory, requestedSpecialty]);

  React.useEffect(() => {
    const storageKey = "notes-data";
    const legacyStorageKey = ["notes", 1, "notes"].join("-");
    const savedNotes = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);
    if (savedNotes) {
      try {
        const parsedNotes = (JSON.parse(savedNotes) as Note[])
          .filter((note) => (note.category as string) !== "Discharge Summary")
          .map(normalizeNote);
        const specialtySeeds = initialNotes.filter((note) => note.id >= 101).map(normalizeNote);
        const mergedNotes = ensureUniqueNoteIds([
          ...parsedNotes,
          ...specialtySeeds.filter(
            (seed) =>
              !parsedNotes.some(
                (note) => note.category === seed.category && note.specialty === seed.specialty,
              ),
          ),
        ]);
        setNotes(mergedNotes);
        window.localStorage.setItem(storageKey, JSON.stringify(mergedNotes));
        window.localStorage.removeItem(legacyStorageKey);
      } catch {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(legacyStorageKey);
      }
    }
    setNotesLoaded(true);
  }, []);

  React.useEffect(() => {
    if (notesLoaded) window.localStorage.setItem("notes-data", JSON.stringify(notes));
  }, [notes, notesLoaded]);

  const visibleNotes = notes.filter((note) => note.category !== "Special Instruction Notes");

  const filteredNotes = React.useMemo(
    () =>
      visibleNotes.filter((note) => {
        const searchableText = JSON.stringify(note).toLowerCase();
        const noteDate = getFilterDate(note, dateType);
        const matchesFromDate = !fromDate || (noteDate !== null && noteDate >= startOfDate(fromDate));
        const matchesToDate = !toDate || (noteDate !== null && noteDate <= endOfDate(toDate));
        const matchesVisit =
          visitScope === "All Patient Visits" ||
          (visitScope === "Current Visit" && (!note.encounterId || note.encounterId === "ENC123456789")) ||
          (visitScope === "Specific Visit" && note.encounterId === visitId.trim());
        const followUpRequired = note.additionalProgress?.followUpRequired === "Yes";
        const followUpOverdue = followUpRequired && Boolean(note.additionalProgress?.followUpDate) && endOfDate(note.additionalProgress?.followUpDate ?? "") < new Date();
        const escalationRequired = note.additionalProgress?.escalationRequired === "Yes";
        return (
          searchableText.includes(query.toLowerCase()) &&
          (!noteId.trim() || String(note.id) === noteId.trim()) &&
          (category === "All Categories" || note.category === category) &&
          (specialty === "All Specialties" || note.specialty === specialty) &&
          (author === "All Authors" || note.author === author) &&
          (status === "All Status" || note.status === status) &&
          (priority === "All Priorities" || note.priority === priority) &&
          (noteType === "All Note Types" || getNoteType(note) === noteType) &&
          (signer === "All Signers" || note.signedBy === signer) &&
          matchesVisit &&
          matchesFromDate &&
          matchesToDate &&
          (followUpFilter === "All Follow-up" ||
            (followUpFilter === "Required" && followUpRequired) ||
            (followUpFilter === "Not Required" && !followUpRequired) ||
            (followUpFilter === "Overdue" && followUpOverdue)) &&
          (escalationFilter === "All Escalation" ||
            (escalationFilter === "Required" && escalationRequired) ||
            (escalationFilter === "Not Required" && !escalationRequired))
        );
      }),
    [author, category, dateType, escalationFilter, followUpFilter, fromDate, noteId, noteType, priority, query, signer, specialty, status, toDate, visitId, visitScope, visibleNotes],
  );

  function resetFilters() {
    setCategory(filterLockedCategory ?? activeCategory?.label ?? "All Categories");
    setSpecialty("All Specialties");
    setAuthor("All Authors");
    setStatus("All Status");
    setPriority("All Priorities");
    setQuery("");
    setNoteType("All Note Types");
    setSigner("All Signers");
    setVisitScope("All Patient Visits");
    setVisitId("");
    setDateType("Created Date");
    setFromDate("");
    setToDate("");
    setFollowUpFilter("All Follow-up");
    setEscalationFilter("All Escalation");
    setNoteId("");
  }

  function changeTab(tabId: string) {
    setActiveTab(tabId);
    const nextCategory = categories.find((item) => item.id === tabId);
    if (nextCategory) {
      setCategory(nextCategory.label);
      setFilterLockedCategory(nextCategory.label);
      setSpecialty("All Specialties");
    } else if (tabId === "all") {
      setCategory("All Categories");
      setFilterLockedCategory(null);
      setSpecialty("All Specialties");
    }
  }

  function openNewNote(category?: NoteCategory, medicalNoteSection: MedicalNoteSection = "ED Notes") {
    setEditingNote(null);
    setNewNoteCategory(category ?? "Nurse Notes");
    setNewMedicalNoteSection(medicalNoteSection);
    setNewNoteOpen(true);
  }

  function addNote(note: Omit<Note, "id" | "date">) {
    if (editingNote) {
      setNotes((current) => current.map((item) => (item.id === editingNote.id ? { ...item, ...note } : item)));
      setNewNoteOpen(false);
      setNotice(`${note.title} updated successfully.`);
      setEditingNote(null);
      return;
    }
    const createdNote: Note = {
      ...note,
      id: Math.max(0, ...notes.map((item) => item.id)) + 1,
      date: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    };
    setNotes((current) => [createdNote, ...current]);
    setNewNoteOpen(false);
    setNotice(`${createdNote.title} added successfully.`);
    setActiveTab("all");
  }

  function editNote(note: Note) {
    setEditingNote(note);
    setNewNoteCategory(note.category);
    setNewMedicalNoteSection(note.medicalNoteSection ?? "ED Notes");
    setNewNoteOpen(true);
  }

  function changeNoteStatus(note: Note, nextStatus: NoteStatus) {
    if (nextStatus === "Signed" && !note.signatureAttested) {
      editNote(note);
      setNotice("Complete the electronic signature attestation before signing this note.");
      return;
    }
    setNotes((current) =>
      current.map((item) =>
        item.id === note.id
          ? {
              ...item,
              status: nextStatus,
              ...(nextStatus === "Signed" ? {} : { signatureAttested: false, signedAt: undefined, signedBy: undefined }),
            }
          : item,
      ),
    );
    setNotice(`${note.title} marked as ${nextStatus}.`);
  }

  function deleteNote(note: Note) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    setNotes((current) => current.filter((item) => item.id !== note.id));
    setViewingNote(null);
    setNotice(`${note.title} deleted.`);
  }

  const tableActions = {
    onDelete: deleteNote,
    onEdit: editNote,
    onStatusChange: changeNoteStatus,
    onView: setViewingNote,
  };

  return (
    <div className="notes-select-safe min-w-0 space-y-4 py-4">
      <section className="flex flex-col gap-3 border-b border-border pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">JD</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-lg font-semibold">John Doe</h1>
              <Badge tone="info">Inpatient</Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">MRN: 10000098 &nbsp; | &nbsp; Male &nbsp; | &nbsp; 65 Y &nbsp; | &nbsp; DOB: 12/05/1959</p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-3 divide-x rounded-md border border-border bg-surface">
          <PatientFact label="Allergies" value="Penicillin, Peanuts" tone="text-danger" />
          <PatientFact label="Location" value="ICU - 01, Bed 5" tone="text-blue-600" />
          <PatientFact label="Encounter" value="ENC123456789" tone="text-emerald-600" />
        </div>
      </section>

      {notice ? (
        <div className="flex items-center justify-between rounded-md border border-success/25 bg-success/10 px-3 py-2 text-xs text-success">
          <span>{notice}</span>
          <button aria-label="Dismiss message" className="font-semibold" onClick={() => setNotice("")} type="button">Close</button>
        </div>
      ) : null}

      {activeTab === "all" ? (
        <AllNotesOverview
          actions={tableActions}
          allNotes={visibleNotes}
          author={author}
          category={category}
          dateType={dateType}
          escalationFilter={escalationFilter}
          filtersInitiallyExpanded={filtersRequested}
          followUpFilter={followUpFilter}
          fromDate={fromDate}
          notes={filteredNotes}
          noteId={noteId}
          noteType={noteType}
          priority={priority}
          query={query}
          signer={signer}
          specialty={specialty}
          status={status}
          toDate={toDate}
          visitId={visitId}
          visitScope={visitScope}
          onAuthorChange={setAuthor}
          onCategoryChange={setCategory}
          onDateTypeChange={setDateType}
          onEscalationFilterChange={setEscalationFilter}
          onFollowUpFilterChange={setFollowUpFilter}
          onFromDateChange={setFromDate}
          onNoteIdChange={setNoteId}
          onNoteTypeChange={setNoteType}
          onPriorityChange={setPriority}
          onQueryChange={setQuery}
          onReset={resetFilters}
          onSignerChange={setSigner}
          onSpecialtyChange={setSpecialty}
          onStatusChange={setStatus}
          onToDateChange={setToDate}
          onVisitIdChange={setVisitId}
          onVisitScopeChange={setVisitScope}
          onNewNote={() => openNewNote()}
          onOpenCategory={changeTab}
        />
      ) : (
        <CategoryView
          category={categories.find((item) => item.id === activeTab) ?? categories[0]}
          key={`${activeTab}-${requestedSpecialty ?? ""}`}
          notes={visibleNotes}
          onNewNote={openNewNote}
          onShowAll={() => changeTab("all")}
          specialty={specialty}
          actions={tableActions}
        />
      )}

      <NewNoteModal
        editingNote={editingNote}
        initialCategory={newNoteCategory}
        initialMedicalNoteSection={newMedicalNoteSection}
        onOpenChange={(nextOpen) => {
          setNewNoteOpen(nextOpen);
          if (!nextOpen) setEditingNote(null);
        }}
        onSave={addNote}
        open={newNoteOpen}
      />
      <NoteDetailsModal
        note={viewingNote}
        onDelete={deleteNote}
        onEdit={(note) => {
          setViewingNote(null);
          editNote(note);
        }}
        onOpenChange={(open) => {
          if (!open) setViewingNote(null);
        }}
      />
    </div>
  );
}

function AllNotesOverview({
  actions,
  allNotes,
  author,
  category,
  dateType,
  escalationFilter,
  filtersInitiallyExpanded,
  followUpFilter,
  fromDate,
  notes,
  noteId,
  noteType,
  priority,
  query,
  signer,
  specialty,
  status,
  toDate,
  visitId,
  visitScope,
  onAuthorChange,
  onCategoryChange,
  onDateTypeChange,
  onEscalationFilterChange,
  onFollowUpFilterChange,
  onFromDateChange,
  onNoteIdChange,
  onNoteTypeChange,
  onPriorityChange,
  onQueryChange,
  onReset,
  onSignerChange,
  onSpecialtyChange,
  onStatusChange,
  onToDateChange,
  onVisitIdChange,
  onVisitScopeChange,
  onNewNote,
  onOpenCategory,
}: {
  actions: NoteTableActions;
  allNotes: Note[];
  author: string;
  category: string;
  dateType: string;
  escalationFilter: string;
  filtersInitiallyExpanded: boolean;
  followUpFilter: string;
  fromDate: string;
  notes: Note[];
  noteId: string;
  noteType: string;
  priority: string;
  query: string;
  signer: string;
  specialty: string;
  status: string;
  toDate: string;
  visitId: string;
  visitScope: string;
  onAuthorChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateTypeChange: (value: string) => void;
  onEscalationFilterChange: (value: string) => void;
  onFollowUpFilterChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onNoteIdChange: (value: string) => void;
  onNoteTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onSignerChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onVisitIdChange: (value: string) => void;
  onVisitScopeChange: (value: string) => void;
  onNewNote: () => void;
  onOpenCategory: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] gap-4 overflow-x-auto pb-1">
        {notesCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              className="group flex min-h-36 flex-col rounded-lg border border-border bg-surface p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              key={category.id}
              onClick={() => onOpenCategory(category.id)}
              type="button"
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", category.soft, category.accent)}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 block text-sm font-semibold">{getCategoryDisplayLabel(category.label)}</span>
              <span className={cn("mt-auto flex items-center gap-1 pt-5 text-xs font-semibold", category.accent)}>
                {allNotes.filter((note) => note.category === category.label).length} Notes <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>

      <NotesFilterPanel
        key={filtersInitiallyExpanded ? "filters-open" : "filters-closed"}
        allNotes={allNotes}
        author={author}
        category={category}
        dateType={dateType}
        escalationFilter={escalationFilter}
        followUpFilter={followUpFilter}
        fromDate={fromDate}
        noteId={noteId}
        noteType={noteType}
        priority={priority}
        query={query}
        signer={signer}
        specialty={specialty}
        status={status}
        toDate={toDate}
        visitId={visitId}
        visitScope={visitScope}
        initiallyExpanded={filtersInitiallyExpanded}
        onAuthorChange={onAuthorChange}
        onCategoryChange={onCategoryChange}
        onDateTypeChange={onDateTypeChange}
        onEscalationFilterChange={onEscalationFilterChange}
        onFollowUpFilterChange={onFollowUpFilterChange}
        onFromDateChange={onFromDateChange}
        onNoteIdChange={onNoteIdChange}
        onNoteTypeChange={onNoteTypeChange}
        onPriorityChange={onPriorityChange}
        onQueryChange={onQueryChange}
        onReset={onReset}
        onSignerChange={onSignerChange}
        onSpecialtyChange={onSpecialtyChange}
        onStatusChange={onStatusChange}
        onToDateChange={onToDateChange}
        onVisitIdChange={onVisitIdChange}
        onVisitScopeChange={onVisitScopeChange}
      />

      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Recent Notes</h3>
            <p className="text-xs text-muted-foreground">{notes.length} matching clinical notes</p>
          </div>
          <Button size="sm" onClick={onNewNote}>
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
        <CardContent className="p-0">
          <NotesTable actions={actions} notes={notes.slice(0, 6)} />
        </CardContent>
      </Card>
    </div>
  );
}

function NotesFilterPanel(props: {
  allNotes: Note[];
  author: string;
  category: string;
  dateType: string;
  escalationFilter: string;
  followUpFilter: string;
  fromDate: string;
  noteId: string;
  noteType: string;
  priority: string;
  query: string;
  signer: string;
  specialty: string;
  status: string;
  toDate: string;
  visitId: string;
  visitScope: string;
  initiallyExpanded: boolean;
  onAuthorChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateTypeChange: (value: string) => void;
  onEscalationFilterChange: (value: string) => void;
  onFollowUpFilterChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onNoteIdChange: (value: string) => void;
  onNoteTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onSignerChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onVisitIdChange: (value: string) => void;
  onVisitScopeChange: (value: string) => void;
}) {
  const [searchDraft, setSearchDraft] = React.useState(props.query);
  const [filtersExpanded, setFiltersExpanded] = React.useState(props.initiallyExpanded);
  const allSpecialties = Array.from(new Set(props.allNotes.map((note) => note.specialty)));
  const allAuthors = Array.from(new Set(props.allNotes.map((note) => note.author)));
  const allSigners = Array.from(new Set(props.allNotes.map((note) => note.signedBy).filter((value): value is string => Boolean(value))));
  const allNoteTypes = Array.from(new Set(props.allNotes.map(getNoteType)));

  React.useEffect(() => setSearchDraft(props.query), [props.query]);

  function applySearch(event?: React.FormEvent) {
    event?.preventDefault();
    props.onQueryChange(searchDraft.trim());
  }

  function resetAll() {
    props.onReset();
    setSearchDraft("");
  }

  return (
    <Card>
      <button
        aria-controls="progress-notes-overview-filters"
        aria-expanded={filtersExpanded}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-t-lg px-4 py-3 text-left outline-none transition-colors hover:bg-surface-muted",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          filtersExpanded && "border-b border-border",
        )}
        onClick={() => setFiltersExpanded((current) => !current)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Filter Notes</h3>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", filtersExpanded && "rotate-180")} />
      </button>
      {filtersExpanded ? <CardContent className="space-y-4" id="progress-notes-overview-filters">
        <form className="grid gap-3 lg:grid-cols-[minmax(180px,1.4fr)_120px_repeat(3,minmax(140px,1fr))] xl:grid-cols-[minmax(220px,1.5fr)_120px_repeat(4,minmax(140px,1fr))]" onSubmit={applySearch}>
          <FormField label="Search">
            <Input onChange={(event) => setSearchDraft(event.target.value)} placeholder="Title, diagnosis, medicine..." value={searchDraft} />
          </FormField>
          <FormField label="Note ID">
            <Input onChange={(event) => props.onNoteIdChange(event.target.value)} placeholder="ID" type="number" value={props.noteId} />
          </FormField>
          <FilterSelect label="Category" value={props.category} options={["All Categories", ...notesCategories.map((item) => item.label)]} onChange={props.onCategoryChange} />
          <FilterSelect label="Note type" value={props.noteType} options={["All Note Types", ...allNoteTypes]} onChange={props.onNoteTypeChange} />
          <FilterSelect label="Specialty" value={props.specialty} options={["All Specialties", ...allSpecialties]} onChange={props.onSpecialtyChange} />
          <FilterSelect label="Status" value={props.status} options={["All Status", "Signed", "Draft", "Pending Review"]} onChange={props.onStatusChange} />
        </form>

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(280px,1.35fr)_repeat(5,minmax(130px,1fr))]">
          <FilterRadioGroup label="Priority" name="notes-overview-priority" value={props.priority} options={["All Priorities", "High", "Medium", "Low"]} onChange={props.onPriorityChange} />
          <FilterSelect label="Author" value={props.author} options={["All Authors", ...allAuthors]} onChange={props.onAuthorChange} />
          <FilterSelect label="Signed by" value={props.signer} options={["All Signers", ...allSigners]} onChange={props.onSignerChange} />
          <FilterSelect label="Visit scope" value={props.visitScope} options={["All Patient Visits", "Current Visit", "Specific Visit"]} onChange={props.onVisitScopeChange} />
          <FilterSelect label="Follow-up" value={props.followUpFilter} options={["All Follow-up", "Required", "Not Required", "Overdue"]} onChange={props.onFollowUpFilterChange} />
          <FilterSelect label="Escalation" value={props.escalationFilter} options={["All Escalation", "Required", "Not Required"]} onChange={props.onEscalationFilterChange} />
        </div>

        <div className="grid gap-3 md:grid-cols-[repeat(3,minmax(140px,1fr))_auto_auto]">
          {props.visitScope === "Specific Visit" ? (
            <FormField label="Visit ID">
              <Input onChange={(event) => props.onVisitIdChange(event.target.value)} placeholder="Enter visit ID" value={props.visitId} />
            </FormField>
          ) : null}
          <FilterSelect label="Date type" value={props.dateType} options={["Created Date", "Service Date"]} onChange={props.onDateTypeChange} />
          <FormField label="From">
            <Input onChange={(event) => props.onFromDateChange(event.target.value)} type="date" value={props.fromDate} />
          </FormField>
          <FormField label="To">
            <Input onChange={(event) => props.onToDateChange(event.target.value)} type="date" value={props.toDate} />
          </FormField>
          <Button className="self-end" variant="outline" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button className="self-end" onClick={() => applySearch()}>
            <Search className="h-4 w-4" /> Search
          </Button>
        </div>
      </CardContent> : null}
    </Card>
  );
}

function CategoryView({
  actions,
  category,
  notes,
  onNewNote,
  onShowAll,
  specialty,
}: {
  actions: NoteTableActions;
  category: CategoryConfig;
  notes: Note[];
  onNewNote: (category: NoteCategory, medicalNoteSection?: MedicalNoteSection) => void;
  onShowAll?: () => void;
  specialty: string;
}) {
  const requestedMedicalSection = useSearchParams().get("specialty");
  const [medicalNoteSection, setMedicalNoteSection] = React.useState<MedicalNoteSection>(
    requestedMedicalSection === "Physician Notes" || requestedMedicalSection === "Physical Notes" ? "Physician Notes" : "ED Notes",
  );
  const [medicalSectionChooserOpen, setMedicalSectionChooserOpen] = React.useState(false);

  const categoryNotes = notes.filter((note) => note.category === category.label);
  const sectionNotes =
    category.label === "Medical Notes"
      ? categoryNotes.filter((note) => (note.medicalNoteSection ?? "ED Notes") === medicalNoteSection)
      : categoryNotes;
  const visibleNotes = specialty === "All Specialties" ? sectionNotes : sectionNotes.filter((note) => note.specialty === specialty);
  const Icon = category.icon;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", category.soft, category.accent)}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{getCategoryDisplayLabel(category.label)}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {onShowAll ? (
            <Button size="sm" variant="outline" onClick={onShowAll}>
              All Notes
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={() => {
              if (category.label === "Medical Notes") {
                setMedicalSectionChooserOpen(true);
                return;
              }
              onNewNote(category.label);
            }}
          >
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
      </div>
      <div className="min-h-[420px] min-w-0">
        {category.label === "Medical Notes" ? (
          <div className="grid gap-3 border-b border-border bg-surface-muted/20 p-4 sm:grid-cols-2">
            {([
              {
                icon: HeartPulse,
                section: "ED Notes" as const,
              },
              {
                icon: Stethoscope,
                section: "Physician Notes" as const,
              },
            ]).map(({ icon: SectionIcon, section }) => {
              const sectionCount = categoryNotes.filter(
                (note) => (note.medicalNoteSection ?? "ED Notes") === section,
              ).length;
              const selected = medicalNoteSection === section;
              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                    selected
                      ? "border-primary bg-primary-soft shadow-sm ring-1 ring-primary/15"
                      : "border-border bg-background hover:border-primary/40 hover:bg-surface-muted/40",
                  )}
                  key={section}
                  onClick={() => setMedicalNoteSection(section)}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      selected ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground",
                    )}
                  >
                    <SectionIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm font-semibold", selected && "text-primary")}>{section}</span>
                  </span>
                  <Badge tone={selected ? "info" : "default"}>{sectionCount}</Badge>
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs font-semibold">
            {category.label === "Medical Notes"
              ? medicalNoteSection
              : specialty === "All Specialties"
                ? `All ${category.shortLabel} specialties`
                : specialty}
          </span>
          <span className="text-xs text-muted-foreground">{visibleNotes.length} notes</span>
        </div>
        {visibleNotes.length ? (
          <NotesTable actions={actions} notes={visibleNotes} compact />
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
            <FilePenLine className="h-9 w-9 text-muted-foreground/45" />
            <p className="mt-3 text-sm font-semibold">No notes in {specialty === "All Specialties" ? getCategoryDisplayLabel(category.label) : specialty}</p>
            <p className="mt-1 text-xs text-muted-foreground">Create the first note for this specialty.</p>
          </div>
        )}
      </div>
      {category.label === "Medical Notes" ? (
        <CenterModal
          className="w-[min(94vw,720px)]"
          description="Choose where this medical note should be filed before opening the note form."
          onOpenChange={setMedicalSectionChooserOpen}
          open={medicalSectionChooserOpen}
          title="Select Medical Note Type"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              {
                icon: HeartPulse,
                section: "ED Notes" as const,
              },
              {
                icon: Stethoscope,
                section: "Physician Notes" as const,
              },
            ]).map(({ icon: SectionIcon, section }) => (
              <button
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary/50 hover:bg-primary-soft/40 focus:outline-none focus:ring-2 focus:ring-ring/20"
                key={section}
                onClick={() => {
                  setMedicalNoteSection(section);
                  setMedicalSectionChooserOpen(false);
                  onNewNote("Medical Notes", section);
                }}
                type="button"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <SectionIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{section}</span>
                </span>
              </button>
            ))}
          </div>
        </CenterModal>
      ) : null}
    </Card>
  );
}

function FilterView(props: {
  actions: NoteTableActions;
  allNotes: Note[];
  author: string;
  category: string;
  dateType: string;
  escalationFilter: string;
  followUpFilter: string;
  fromDate: string;
  lockedCategory?: string;
  notes: Note[];
  noteId: string;
  noteType: string;
  priority: string;
  query: string;
  signer: string;
  specialty: string;
  status: string;
  toDate: string;
  visitId: string;
  visitScope: string;
  onAuthorChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateTypeChange: (value: string) => void;
  onEscalationFilterChange: (value: string) => void;
  onFollowUpFilterChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onNoteIdChange: (value: string) => void;
  onNoteTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onSignerChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onVisitIdChange: (value: string) => void;
  onVisitScopeChange: (value: string) => void;
}) {
  const [searchDraft, setSearchDraft] = React.useState(props.query);
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState("Newest first");
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const allSpecialties = Array.from(new Set(props.allNotes.map((note) => note.specialty)));
  const allAuthors = Array.from(new Set(props.allNotes.map((note) => note.author)));
  const allSigners = Array.from(new Set(props.allNotes.map((note) => note.signedBy).filter((value): value is string => Boolean(value))));
  const allNoteTypes = Array.from(new Set(props.allNotes.map(getNoteType)));
  const sortedNotes = React.useMemo(
    () =>
      [...props.notes].sort((left, right) => {
        if (sortOrder === "Oldest first") return compareNoteDates(left, right);
        if (sortOrder === "Priority") return priorityRank(left.priority) - priorityRank(right.priority);
        if (sortOrder === "Author") return left.author.localeCompare(right.author);
        if (sortOrder === "Note title") return left.title.localeCompare(right.title);
        return compareNoteDates(right, left);
      }),
    [props.notes, sortOrder],
  );
  const totalPages = Math.max(1, Math.ceil(sortedNotes.length / pageSize));
  const visibleNotes = sortedNotes.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => setSearchDraft(props.query), [props.query]);
  React.useEffect(() => setPage(1), [props.notes, pageSize, sortOrder]);
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function applySearch(event?: React.FormEvent) {
    event?.preventDefault();
    props.onQueryChange(searchDraft.trim());
    setPage(1);
  }

  function resetAll() {
    props.onReset();
    setSearchDraft("");
    setSortOrder("Newest first");
    setPageSize(10);
    setPage(1);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="h-fit">
        <button
          aria-controls="progress-notes-list-filters"
          aria-expanded={filtersExpanded}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-t-lg px-4 py-3 text-left outline-none transition-colors hover:bg-surface-muted",
            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            filtersExpanded && "border-b border-border",
          )}
          onClick={() => setFiltersExpanded((current) => !current)}
          type="button"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Filter Notes</h3>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", filtersExpanded && "rotate-180")} />
        </button>
        {filtersExpanded ? <CardContent className="space-y-4" id="progress-notes-list-filters">
          <form className="space-y-2" onSubmit={applySearch}>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Search</div>
            <Input onChange={(event) => setSearchDraft(event.target.value)} placeholder="Title, diagnosis, medicine, content..." value={searchDraft} />
            <Input onChange={(event) => props.onNoteIdChange(event.target.value)} placeholder="Specific note ID" type="number" value={props.noteId} />
          </form>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Document</div>
            {props.lockedCategory ? (
              <ReadOnlyFilterValue label="Category" value={getCategoryDisplayLabel(props.lockedCategory)} />
            ) : (
              <FilterSelect
                label="Category"
                value={getCategoryDisplayLabel(props.category)}
                options={["All Categories", ...notesCategories.map((item) => getCategoryDisplayLabel(item.label))]}
                onChange={(value) => props.onCategoryChange(value === "Surgical Notes" ? "Surgery Notes" : value)}
              />
            )}
            <FilterSelect label="Note type" value={props.noteType} options={["All Note Types", ...allNoteTypes]} onChange={props.onNoteTypeChange} />
            <FilterSelect label="Specialty" value={props.specialty} options={["All Specialties", ...allSpecialties]} onChange={props.onSpecialtyChange} />
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Visit</div>
            <FilterSelect label="Visit scope" value={props.visitScope} options={["All Patient Visits", "Current Visit", "Specific Visit"]} onChange={props.onVisitScopeChange} />
            {props.visitScope === "Specific Visit" ? (
              <FormField label="Visit ID">
                <Input onChange={(event) => props.onVisitIdChange(event.target.value)} placeholder="Enter visit ID" value={props.visitId} />
              </FormField>
            ) : null}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Workflow</div>
            <FilterSelect label="Author" value={props.author} options={["All Authors", ...allAuthors]} onChange={props.onAuthorChange} />
            <FilterSelect label="Signed by" value={props.signer} options={["All Signers", ...allSigners]} onChange={props.onSignerChange} />
            <div className="grid gap-3 sm:grid-cols-2">
              <FilterSelect label="Status" value={props.status} options={["All Status", "Signed", "Draft", "Pending Review"]} onChange={props.onStatusChange} />
              <FilterRadioGroup label="Priority" name="notes-filter-priority" value={props.priority} options={["All Priorities", "High", "Medium", "Low"]} onChange={props.onPriorityChange} />
              <FilterSelect label="Follow-up" value={props.followUpFilter} options={["All Follow-up", "Required", "Not Required", "Overdue"]} onChange={props.onFollowUpFilterChange} />
              <FilterSelect label="Escalation" value={props.escalationFilter} options={["All Escalation", "Required", "Not Required"]} onChange={props.onEscalationFilterChange} />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Date</div>
            <FilterSelect label="Date type" value={props.dateType} options={["Created Date", "Service Date"]} onChange={props.onDateTypeChange} />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="From">
                <Input onChange={(event) => props.onFromDateChange(event.target.value)} type="date" value={props.fromDate} />
              </FormField>
              <FormField label="To">
                <Input onChange={(event) => props.onToDateChange(event.target.value)} type="date" value={props.toDate} />
              </FormField>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button className="flex-1" variant="outline" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button className="flex-1" onClick={() => applySearch()}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent> : null}
      </Card>

      <Card className="min-w-0">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Filtered Notes</h3>
            <p className="text-xs text-muted-foreground">{props.notes.length} matching clinical notes</p>
          </div>
          <div className="grid w-full grid-cols-[minmax(150px,1fr)_92px] gap-3 lg:w-auto">
            <FilterSelect className="min-w-0" label="Sort" value={sortOrder} options={["Newest first", "Oldest first", "Priority", "Author", "Note title"]} onChange={setSortOrder} />
            <FilterSelect className="min-w-0" label="Per page" value={String(pageSize)} options={["10", "25", "50", "100"]} onChange={(value) => setPageSize(Number(value))} />
          </div>
        </div>
        {props.notes.length ? (
          <>
            <NotesTable actions={props.actions} notes={visibleNotes} compact />
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
              <span className="text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedNotes.length)} of {sortedNotes.length}
              </span>
              <div className="flex items-center gap-2">
                <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)} size="sm" variant="outline">Previous</Button>
                <span>Page {page} of {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} size="sm" variant="outline">Next</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Search className="h-8 w-8" />
            </span>
            <p className="mt-4 text-sm font-semibold">No matching notes found</p>
            <p className="mt-1 text-xs text-muted-foreground">Adjust or reset the filters to see more results.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function NewNoteModal({
  editingNote,
  initialCategory,
  initialMedicalNoteSection,
  onOpenChange,
  onSave,
  open,
}: {
  editingNote: Note | null;
  initialCategory: NoteCategory;
  initialMedicalNoteSection: MedicalNoteSection;
  onOpenChange: (open: boolean) => void;
  onSave: (note: Omit<Note, "id" | "date">) => void;
  open: boolean;
}) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<NoteCategory>(initialCategory);
  const [specialty, setSpecialty] = React.useState(categories[0].specialties[0]);
  const [customMedicalSpecialty, setCustomMedicalSpecialty] = React.useState("");
  const [customSpecialtyPopupOpen, setCustomSpecialtyPopupOpen] = React.useState(false);
  const [author, setAuthor] = React.useState("Nurse Mary");
  const [priority, setPriority] = React.useState<Note["priority"]>("Medium");
  const [content, setContent] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [showSigning, setShowSigning] = React.useState(false);
  const [assessment, setAssessment] = React.useState("");
  const [intervention, setIntervention] = React.useState("");
  const [patientResponse, setPatientResponse] = React.useState("");
  const [safetyRisk, setSafetyRisk] = React.useState("");
  const [communication, setCommunication] = React.useState("");
  const [followUpPlan, setFollowUpPlan] = React.useState("");
  const [bloodPressureSystolic, setBloodPressureSystolic] = React.useState("");
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = React.useState("");
  const [pulse, setPulse] = React.useState("");
  const [painScore, setPainScore] = React.useState("");
  const [painScale, setPainScale] = React.useState<PainScale>("NRS");
  const [cpotAirwayStatus, setCpotAirwayStatus] = React.useState<CpotAirwayStatus>("INTUBATED");
  const [painDomainScores, setPainDomainScores] = React.useState<PainAssessment["scores"]>({});
  const [temperature, setTemperature] = React.useState("");
  const [respiratoryRate, setRespiratoryRate] = React.useState("");
  const [spo2, setSpo2] = React.useState("");
  const [glucose, setGlucose] = React.useState("");
  const [glucoseUnit, setGlucoseUnit] = React.useState<GlucoseUnit>("mg/dL");
  const [consciousnessLevel, setConsciousnessLevel] = React.useState("");
  const [patientPosition, setPatientPosition] = React.useState("");
  const [signedBy, setSignedBy] = React.useState("");
  const [signatureAttested, setSignatureAttested] = React.useState(false);
  const [medicalNoteType, setMedicalNoteType] = React.useState<MedicalNoteType>("Progress Note");
  const [customMedicalNoteType, setCustomMedicalNoteType] = React.useState("");
  const [customNoteTypePopupOpen, setCustomNoteTypePopupOpen] = React.useState(false);
  const [transplantType, setTransplantType] = React.useState<TransplantType | "">("");
  const [transplantPopupOpen, setTransplantPopupOpen] = React.useState(false);
  const [medicalNoteSection, setMedicalNoteSection] = React.useState<MedicalNoteSection>(initialMedicalNoteSection);
  const [subjective, setSubjective] = React.useState("");
  const [objective, setObjective] = React.useState("");
  const [medicalAssessment, setMedicalAssessment] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [primaryDiagnosis, setPrimaryDiagnosis] = React.useState("");
  const [secondaryDiagnoses, setSecondaryDiagnoses] = React.useState("");
  const [customPrimaryDiagnosis, setCustomPrimaryDiagnosis] = React.useState("");
  const [customSecondaryDiagnosis, setCustomSecondaryDiagnosis] = React.useState("");
  const [primaryDiagnosisPopupOpen, setPrimaryDiagnosisPopupOpen] = React.useState(false);
  const [secondaryDiagnosisPopupOpen, setSecondaryDiagnosisPopupOpen] = React.useState(false);
  const [practitionerId, setPractitionerId] = React.useState("");
  const [patientId, setPatientId] = React.useState("10000098");
  const [encounterId, setEncounterId] = React.useState("ENC123456789");
  const [serviceDateTime, setServiceDateTime] = React.useState(toDateTimeLocalValue());
  const [authenticatedSigner, setAuthenticatedSigner] = React.useState("");
  const [amendmentReason, setAmendmentReason] = React.useState("");
  const [pharmacy, setPharmacy] = React.useState<PharmacyDocumentation>(emptyPharmacyDocumentation);
  const [alliedHealth, setAlliedHealth] = React.useState<AlliedHealthDocumentation>(emptyAlliedHealthDocumentation);
  const [additionalProgress, setAdditionalProgress] = React.useState<AdditionalProgressDocumentation>(emptyAdditionalProgressDocumentation);
  const [specialInstructionEnabled, setSpecialInstructionEnabled] = React.useState(false);
  const [operative, setOperative] = React.useState<OperativeDocumentation>(emptyOperativeDocumentation);
  const selectedCategory = categories.find((item) => item.label === category) ?? categories[0];
  const isNurseNote = category === "Nurse Notes";
  const isMedicalNote = category === "Medical Notes";
  const isSurgeryNote = category === "Surgery Notes";
  const isOperativeNote = category === "Operative Notes";
  const isPharmacyNote = category === "Pharmacy Notes";
  const isAlliedHealthNote = category === "Allied Health Notes";
  const isAdditionalProgressNote = category === "Special Instruction Notes";
  const shouldSaveSpecialInstruction = isAdditionalProgressNote || specialInstructionEnabled;
  const hasSharedClinicalNoteType = isMedicalNote || isSurgeryNote;
  const hasSurgerySpecialty = isSurgeryNote || isOperativeNote;
  const hasCustomSpecialty = isMedicalNote || hasSurgerySpecialty;
  const specialtyError = `Please enter the ${hasSurgerySpecialty ? "surgery" : "medical"} specialty.`;
  const noteTypeError = `Please enter the ${isSurgeryNote ? "surgery" : "medical"} note type.`;
  const contentError = isNurseNote
    ? "Nursing note is required."
    : isPharmacyNote
      ? "Pharmacy note is required."
      : "Clinical note is required.";
  const hasPatientVisitContext = isMedicalNote || isSurgeryNote || isOperativeNote || isPharmacyNote || isAlliedHealthNote || shouldSaveSpecialInstruction;
  const isAmendment = isMedicalNote && editingNote?.status === "Signed";
  const diagnosisOptions = React.useMemo(() => {
    const baseOptions = medicalDiagnosisBySpecialty[specialty] ?? medicalDiagnosisBySpecialty["General Medicine"];
    return [...baseOptions, diagnosisOtherOption];
  }, [specialty]);
  const observedPainTotal = painScale === "NRS" ? undefined : calculateObservedPainScore(painScale, painDomainScores);
  const savedPainScore = painScale === "NRS" ? painScore : observedPainTotal?.toString() ?? "";
  const painSeverity =
    painScale === "NRS"
      ? painScore !== "" && Number(painScore) >= 0 && Number(painScore) <= 10
        ? getPainSeverity("NRS", Number(painScore))
        : undefined
      : observedPainTotal !== undefined
        ? getPainSeverity(painScale, observedPainTotal)
        : undefined;

  React.useEffect(() => {
    if (!open) return;
    const nextCategory = categories.find((item) => item.label === initialCategory) ?? categories[0];
    const defaultAuthor =
      nextCategory.label === "Medical Notes" || nextCategory.label === "Surgery Notes" || nextCategory.label === "Operative Notes"
        ? "Dr. Smith"
        : nextCategory.label === "Pharmacy Notes"
          ? "Pharmacist John"
          : nextCategory.label === "Allied Health Notes"
            ? "Allied Health Clinician"
            : nextCategory.label === "Special Instruction Notes"
              ? "Care Team Clinician"
              : "Nurse Mary";
    setTitle(editingNote?.title ?? "");
    setCategory(nextCategory.label);
    const savedSpecialty = editingNote?.specialty ?? nextCategory.specialties[0];
    const isCustomMedicalSpecialty = nextCategory.label === "Medical Notes" && !medicalSpecialties.includes(savedSpecialty);
    const isCustomSurgerySpecialty =
      (nextCategory.label === "Surgery Notes" || nextCategory.label === "Operative Notes") &&
      !surgerySpecialties.includes(savedSpecialty);
    setSpecialty(
      isCustomMedicalSpecialty
        ? medicalOtherSpecialty
        : isCustomSurgerySpecialty
          ? surgeryOtherSpecialty
          : savedSpecialty,
    );
    setCustomMedicalSpecialty(isCustomMedicalSpecialty || isCustomSurgerySpecialty ? savedSpecialty : "");
    setCustomSpecialtyPopupOpen(false);
    setAuthor(editingNote?.author ?? defaultAuthor);
    setPriority(editingNote?.priority ?? "Medium");
    setContent(editingNote?.content ?? "");
    setFormError("");
    setShowSigning(false);
    setAssessment(editingNote?.assessment ?? "");
    setIntervention(editingNote?.intervention ?? "");
    setPatientResponse(editingNote?.patientResponse ?? "");
    setSafetyRisk(editingNote?.safetyRisk ?? "");
    setCommunication(editingNote?.communication ?? "");
    setFollowUpPlan(editingNote?.followUpPlan ?? "");
    setBloodPressureSystolic(editingNote?.bloodPressureSystolic ?? "");
    setBloodPressureDiastolic(editingNote?.bloodPressureDiastolic ?? "");
    setPulse(editingNote?.pulse ?? "");
    setPainScore(editingNote?.painScore ?? "");
    setPainScale(editingNote?.painAssessment?.scale ?? "NRS");
    setCpotAirwayStatus(editingNote?.painAssessment?.airwayStatus ?? "INTUBATED");
    setPainDomainScores(editingNote?.painAssessment?.scores ?? {});
    setTemperature(editingNote?.temperature ?? "");
    setRespiratoryRate(editingNote?.respiratoryRate ?? "");
    setSpo2(editingNote?.spo2 ?? "");
    const savedGlucoseUnit = editingNote?.glucoseUnit ?? (editingNote?.glucoseMmolL && !editingNote?.glucose ? "mmol/L" : "mg/dL");
    setGlucoseUnit(savedGlucoseUnit);
    setGlucose(savedGlucoseUnit === "mmol/L" ? editingNote?.glucoseMmolL ?? "" : editingNote?.glucose ?? "");
    setConsciousnessLevel(editingNote?.consciousnessLevel ?? "");
    setPatientPosition(editingNote?.patientPosition ?? "");
    setSignedBy(editingNote?.signedBy ?? editingNote?.author ?? defaultAuthor);
    setSignatureAttested(false);
    setMedicalNoteType(editingNote?.medicalNoteType ?? inferMedicalNoteType(editingNote?.title));
    setCustomMedicalNoteType(editingNote?.customMedicalNoteType ?? "");
    setCustomNoteTypePopupOpen(false);
    setTransplantType(editingNote?.transplantType ?? "");
    setTransplantPopupOpen(false);
    setMedicalNoteSection(editingNote?.medicalNoteSection ?? initialMedicalNoteSection);
    setSubjective(editingNote?.subjective ?? "");
    setObjective(editingNote?.objective ?? "");
    setMedicalAssessment(editingNote?.medicalAssessment ?? "");
    setPlan(editingNote?.plan ?? "");
    const savedDiagnosisOptions = medicalDiagnosisBySpecialty[savedSpecialty] ?? medicalDiagnosisBySpecialty["General Medicine"];
    const savedPrimaryDiagnosis = editingNote?.primaryDiagnosis ?? "";
    const savedSecondaryDiagnosis = editingNote?.secondaryDiagnoses ?? "";
    const customPrimary = Boolean(savedPrimaryDiagnosis) && !savedDiagnosisOptions.includes(savedPrimaryDiagnosis);
    const customSecondary = Boolean(savedSecondaryDiagnosis) && !savedDiagnosisOptions.includes(savedSecondaryDiagnosis);
    setPrimaryDiagnosis(customPrimary ? diagnosisOtherOption : savedPrimaryDiagnosis);
    setSecondaryDiagnoses(customSecondary ? diagnosisOtherOption : savedSecondaryDiagnosis);
    setCustomPrimaryDiagnosis(customPrimary ? savedPrimaryDiagnosis : "");
    setCustomSecondaryDiagnosis(customSecondary ? savedSecondaryDiagnosis : "");
    setPrimaryDiagnosisPopupOpen(false);
    setSecondaryDiagnosisPopupOpen(false);
    setPractitionerId(editingNote?.practitionerId ?? "");
    setPatientId(editingNote?.patientId ?? "10000098");
    setEncounterId(editingNote?.encounterId ?? "ENC123456789");
    setServiceDateTime(editingNote?.serviceDateTime ?? toDateTimeLocalValue());
    setAuthenticatedSigner(editingNote?.authenticatedSigner ?? editingNote?.signedBy ?? editingNote?.author ?? defaultAuthor);
    setAmendmentReason("");
    setPharmacy({ ...emptyPharmacyDocumentation, ...editingNote?.pharmacy });
    setAlliedHealth({
      ...emptyAlliedHealthDocumentation,
      sessionDateTime: editingNote?.alliedHealth?.sessionDateTime ?? toDateTimeLocalValue(),
      ...editingNote?.alliedHealth,
    });
    setAdditionalProgress({
      ...emptyAdditionalProgressDocumentation,
      noteType: editingNote?.additionalProgress?.noteType ?? inferAdditionalNoteType(editingNote?.specialty, editingNote?.title),
      callDateTime: editingNote?.additionalProgress?.callDateTime ?? toDateTimeLocalValue(),
      handoverDateTime: editingNote?.additionalProgress?.handoverDateTime ?? toDateTimeLocalValue(),
      ...editingNote?.additionalProgress,
      amendmentReason: "",
    });
    setSpecialInstructionEnabled(Boolean(editingNote?.additionalProgress) || nextCategory.label === "Special Instruction Notes");
    setOperative({
      ...emptyOperativeDocumentation,
      operativeDate: editingNote?.operative?.operativeDate ?? toDateTimeLocalValue().slice(0, 10),
      surgeonName: editingNote?.operative?.surgeonName ?? editingNote?.author ?? defaultAuthor,
      ...editingNote?.operative,
      duration:
        editingNote?.operative?.duration ??
        [
          editingNote?.operative?.durationHours ? `${editingNote.operative.durationHours} hour(s)` : "",
          editingNote?.operative?.durationMinutes ? `${editingNote.operative.durationMinutes} minute(s)` : "",
        ].filter(Boolean).join(" "),
    });
  }, [editingNote, initialCategory, initialMedicalNoteSection, open]);

  function changeSpecialty(value: string) {
    setSpecialty(value);
    setCustomSpecialtyPopupOpen(value === "Others");
    if (value === "Transplant Surgery") {
      setTransplantPopupOpen(true);
    } else {
      setTransplantType("");
      setTransplantPopupOpen(false);
    }
    if (
      (category === "Medical Notes" && value !== medicalOtherSpecialty) ||
      ((category === "Surgery Notes" || category === "Operative Notes") && value !== surgeryOtherSpecialty)
    ) {
      setCustomMedicalSpecialty("");
    }
    if (category === "Special Instruction Notes") {
      setAdditionalProgress((current) => ({ ...current, noteType: inferAdditionalNoteType(value) }));
    }
    if (category === "Medical Notes") {
      setPrimaryDiagnosis("");
      setSecondaryDiagnoses("");
      setCustomPrimaryDiagnosis("");
      setCustomSecondaryDiagnosis("");
      setPrimaryDiagnosisPopupOpen(false);
      setSecondaryDiagnosisPopupOpen(false);
    }
  }

  function updatePharmacy<K extends keyof PharmacyDocumentation>(field: K, value: PharmacyDocumentation[K]) {
    setPharmacy((current) => ({ ...current, [field]: value }));
  }

  function updateAlliedHealth<K extends keyof AlliedHealthDocumentation>(field: K, value: AlliedHealthDocumentation[K]) {
    setAlliedHealth((current) => ({ ...current, [field]: value }));
  }

  function updateAdditionalProgress<K extends keyof AdditionalProgressDocumentation>(field: K, value: AdditionalProgressDocumentation[K]) {
    setAdditionalProgress((current) => ({ ...current, [field]: value }));
    if (field === "noteType") {
      const specialtyByType: Record<AdditionalNoteType, string> = {
        "General Progress Note": "General",
        "Follow-up Note": "Follow Up",
        "Care Coordination Note": "Care Coordination",
        "Patient Education Note": "Patient Education",
        "Phone Call Note": "Phone Call Note",
        "Family Meeting Notes": "Family Meeting",
        "Handover Note": "Handover",
        "Case Management Note": "Case Management",
        "Morning Round": "Morning Round",
        "Evening Round": "Evening Round",
        "Consultant Notes": "Consultant Notes",
      };
      if (category === "Special Instruction Notes") setSpecialty(specialtyByType[value as AdditionalNoteType]);
    }
  }

  function updateOperative<K extends keyof OperativeDocumentation>(field: K, value: OperativeDocumentation[K]) {
    setOperative((current) => ({ ...current, [field]: value }));
  }

  function submitNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasCustomSpecialty && specialty === "Others" && !customMedicalSpecialty.trim()) {
      setFormError(specialtyError);
      return;
    }
    if (hasSharedClinicalNoteType && medicalNoteType === "Others" && !customMedicalNoteType.trim()) {
      setFormError(noteTypeError);
      return;
    }
    if (isSurgeryNote && specialty === "Transplant Surgery" && !transplantType) {
      setFormError("Please select the transplant type.");
      return;
    }
    if (isOperativeNote && !operative.surgeonName.trim()) {
      setFormError("Surgeon name is required.");
      return;
    }
    if (isOperativeNote && !operative.surgeryName.trim()) {
      setFormError("Name of surgery is required.");
      return;
    }
    if (!isOperativeNote && !content.trim()) {
      setFormError(contentError);
      return;
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const isSigned = submitter?.value === "sign";
    if (isSigned && !signatureAttested) return;

    const nextStatus: NoteStatus = isSigned ? "Signed" : "Draft";
    const savedSpecialty =
      hasCustomSpecialty && specialty === "Others" ? customMedicalSpecialty.trim() : specialty;
    const savedMedicalNoteType =
      hasSharedClinicalNoteType && medicalNoteType === "Others"
        ? customMedicalNoteType.trim()
        : medicalNoteType;
    const generatedTitle = buildNoteTitle({
      additionalProgress,
      alliedHealth,
      category,
      medicalNoteType: savedMedicalNoteType,
      pharmacy,
      specialty: savedSpecialty,
    });

    onSave({
      author: isOperativeNote
          ? operative.surgeonName.trim()
          : author.trim(),
      assessment: isNurseNote ? assessment.trim() : undefined,
      bloodPressureDiastolic: isNurseNote ? bloodPressureDiastolic : undefined,
      bloodPressureSystolic: isNurseNote ? bloodPressureSystolic : undefined,
      category,
      content: isOperativeNote ? undefined : content.trim(),
      communication: isNurseNote ? communication.trim() : undefined,
      followUpPlan: isNurseNote ? followUpPlan.trim() : undefined,
      intervention: isNurseNote ? intervention.trim() : undefined,
      painScore: isNurseNote ? savedPainScore : undefined,
      painAssessment: isNurseNote
        ? {
            scale: painScale,
            airwayStatus: painScale === "CPOT" ? cpotAirwayStatus : undefined,
            scores: painScale === "NRS" ? {} : painDomainScores,
            total: savedPainScore === "" ? undefined : Number(savedPainScore),
            severity: painSeverity,
          }
        : undefined,
      temperature: isNurseNote ? temperature : undefined,
      respiratoryRate: isNurseNote ? respiratoryRate : undefined,
      spo2: isNurseNote ? spo2 : undefined,
      glucose: isNurseNote && glucoseUnit === "mg/dL" ? glucose : undefined,
      glucoseMmolL: isNurseNote && glucoseUnit === "mmol/L" ? glucose : undefined,
      glucoseUnit: isNurseNote ? glucoseUnit : undefined,
      consciousnessLevel: isNurseNote ? consciousnessLevel : undefined,
      patientPosition: isNurseNote ? patientPosition.trim() : undefined,
      patientResponse: isNurseNote ? patientResponse.trim() : undefined,
      amendmentReason: isMedicalNote && isAmendment ? amendmentReason.trim() : undefined,
      additionalProgress: shouldSaveSpecialInstruction ? additionalProgress : undefined,
      alliedHealth: isAlliedHealthNote ? { ...alliedHealth, sessionDateTime: serviceDateTime } : undefined,
      operative: isOperativeNote ? operative : undefined,
      authenticatedSigner: hasPatientVisitContext ? authenticatedSigner.trim() : undefined,
      encounterId: hasPatientVisitContext ? encounterId.trim() : undefined,
      medicalAssessment: isMedicalNote ? medicalAssessment.trim() : undefined,
      medicalNoteType: hasSharedClinicalNoteType ? medicalNoteType : undefined,
      customMedicalNoteType:
        hasSharedClinicalNoteType && medicalNoteType === "Others" ? customMedicalNoteType.trim() : undefined,
      transplantType: isSurgeryNote && savedSpecialty === "Transplant Surgery" && transplantType ? transplantType : undefined,
      medicalNoteSection: isMedicalNote ? medicalNoteSection : undefined,
      objective: isMedicalNote ? objective.trim() : undefined,
      patientId: hasPatientVisitContext ? patientId.trim() : undefined,
      plan: isMedicalNote ? plan.trim() : undefined,
      practitionerId: undefined,
      primaryDiagnosis: isMedicalNote ? (primaryDiagnosis === diagnosisOtherOption ? customPrimaryDiagnosis : primaryDiagnosis).trim() : undefined,
      priority,
      pharmacy: isPharmacyNote ? pharmacy : undefined,
      pulse: isNurseNote ? pulse : undefined,
      safetyRisk: isNurseNote ? safetyRisk.trim() : undefined,
      secondaryDiagnoses: isMedicalNote ? (secondaryDiagnoses === diagnosisOtherOption ? customSecondaryDiagnosis : secondaryDiagnoses).trim() : undefined,
      serviceDateTime: isOperativeNote
          ? operative.operativeDate || undefined
          : serviceDateTime || undefined,
      signatureAttested: isSigned ? signatureAttested : false,
      signedAt: isSigned && signatureAttested ? new Date().toISOString() : undefined,
      signedBy: isSigned && signatureAttested ? (hasPatientVisitContext ? authenticatedSigner.trim() : signedBy.trim()) : undefined,
      specialty: savedSpecialty,
      status: nextStatus,
      subjective: isMedicalNote ? subjective.trim() : undefined,
      title: title.trim() || (isOperativeNote ? `Operative Note - ${operative.surgeryName.trim()}` : generatedTitle),
    });
  }

  return (
    <CenterModal
      className="w-[min(94vw,860px)]"
      onOpenChange={onOpenChange}
      open={open}
      scrollToTopOnOpen
      title={
        isPharmacyNote
          ? `${editingNote ? "Edit " : ""}Pharmacy Note`
          : `${editingNote ? "Edit" : "New"} ${category.replace(/ Notes$/, " Note")}`
      }
    >
      <form className="notes-select-safe min-w-0 space-y-3" noValidate onSubmit={submitNote}>
        {hasPatientVisitContext ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-border bg-surface-muted/30 px-3 py-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Patient</span>
              <span className="ml-2 font-semibold">John Doe</span>
              <span className="ml-2 text-muted-foreground">#{patientId}</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Visit</span>
              <span className="ml-2 font-semibold">{encounterId}</span>
            </div>
          </div>
        ) : null}

        <div className="grid items-start gap-3 sm:grid-cols-2">
          {!isOperativeNote ? <FormField label="Author">
            <Input onChange={(event) => setAuthor(event.target.value)} placeholder="Enter author name" value={author} />
          </FormField> : null}
          <PriorityRadioGroup onChange={setPriority} value={priority} />
          {!isAdditionalProgressNote && !isPharmacyNote ? (
            <FormField label="Specialty">
              {isSurgeryNote ? (
                <SurgerySpecialtyField
                  customValue={customMedicalSpecialty}
                  error={formError === "Please select the transplant type." || formError === specialtyError}
                  open={transplantPopupOpen}
                  otherOpen={customSpecialtyPopupOpen}
                  onOpenChange={setTransplantPopupOpen}
                  onOtherOpenChange={setCustomSpecialtyPopupOpen}
                  onCustomValueChange={(value) => {
                    setCustomMedicalSpecialty(value);
                    if (formError === specialtyError) setFormError("");
                  }}
                  onSpecialtyChange={changeSpecialty}
                  onTransplantChange={(value) => {
                    setTransplantType(value);
                    setTransplantPopupOpen(false);
                    if (formError === "Please select the transplant type.") setFormError("");
                  }}
                  specialty={specialty}
                  transplantType={transplantType}
                />
              ) : (
                <SelectWithOtherPopup
                  error={formError === specialtyError}
                  onChange={changeSpecialty}
                  onCustomValueChange={(value) => {
                    setCustomMedicalSpecialty(value);
                    if (formError === specialtyError) setFormError("");
                  }}
                  onOpenChange={setCustomSpecialtyPopupOpen}
                  open={customSpecialtyPopupOpen}
                  options={selectedCategory.specialties}
                  placeholder={`Enter ${hasSurgerySpecialty ? "surgery" : "medical"} specialty`}
                  value={specialty}
                  customValue={customMedicalSpecialty}
                />
              )}
              {formError === "Please select the transplant type." || formError === specialtyError ? (
                <span className="mt-1.5 block text-xs font-medium text-destructive">{formError}</span>
              ) : null}
            </FormField>
          ) : null}
          {!isOperativeNote ? (
            <div className={cn((isAdditionalProgressNote || isPharmacyNote) && "sm:col-span-2")}>
              <FormField label="Date and time">
                <Input onChange={(event) => setServiceDateTime(event.target.value)} type="datetime-local" value={serviceDateTime} />
              </FormField>
            </div>
          ) : null}
        </div>

        {isOperativeNote ? (
          <>
            <FormSection description="Record the operative team, procedure and duration." title="Operation Details">
              <div className="grid items-start gap-3 sm:grid-cols-2">
                <FormField label="Surgeon Name">
                  <Input
                    onChange={(event) => {
                      updateOperative("surgeonName", event.target.value);
                      if (formError === "Surgeon name is required.") setFormError("");
                    }}
                    placeholder="Enter surgeon name"
                    value={operative.surgeonName}
                  />
                  {formError === "Surgeon name is required." ? (
                    <span className="mt-1.5 block text-xs font-medium text-destructive">{formError}</span>
                  ) : null}
                </FormField>
                <FormField label="Assistant Name">
                  <Input onChange={(event) => updateOperative("assistantName", event.target.value)} placeholder="Enter assistant name" value={operative.assistantName} />
                </FormField>
                <FormField label="OT Nurse Name">
                  <Input onChange={(event) => updateOperative("otNurseName", event.target.value)} placeholder="Enter OT nurse name" value={operative.otNurseName} />
                </FormField>
                <FormField label="Name of Surgery">
                  <Input
                    onChange={(event) => {
                      updateOperative("surgeryName", event.target.value);
                      if (formError === "Name of surgery is required.") setFormError("");
                    }}
                    placeholder="Enter procedure or surgery name"
                    value={operative.surgeryName}
                  />
                  {formError === "Name of surgery is required." ? (
                    <span className="mt-1.5 block text-xs font-medium text-destructive">{formError}</span>
                  ) : null}
                </FormField>
                <FormField label="Duration (Hours / Minutes)">
                  <Input onChange={(event) => updateOperative("duration", event.target.value)} placeholder="e.g. 2 hours 30 minutes" value={operative.duration} />
                </FormField>
                <FormField label="Date">
                  <Input onChange={(event) => updateOperative("operativeDate", event.target.value)} type="date" value={operative.operativeDate} />
                </FormField>
              </div>
            </FormSection>
            <section className="rounded-lg border border-border bg-surface-muted/25 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ClinicalTextArea label="Operative Findings" onChange={(value) => updateOperative("operativeFindings", value)} placeholder="Enter operative findings..." value={operative.operativeFindings} />
                <ClinicalTextArea label="Plan" onChange={(value) => updateOperative("plan", value)} placeholder="Enter post-operative plan..." value={operative.plan} />
              </div>
            </section>
          </>
        ) : null}

        {isNurseNote ? (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <FormField label="Temperature">
                <Input min="25" max="50" step="0.1" onChange={(event) => setTemperature(event.target.value)} placeholder="36.8 °C" type="number" value={temperature} />
              </FormField>
              <FormField label="Respiratory Rate">
                <Input min="1" max="100" onChange={(event) => setRespiratoryRate(event.target.value)} placeholder="16 breaths/min" type="number" value={respiratoryRate} />
              </FormField>
              <FormField label="SpO₂">
                <Input min="0" max="100" onChange={(event) => setSpo2(event.target.value)} placeholder="98%" type="number" value={spo2} />
              </FormField>
              <FormField label="Glucose">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-md border border-input bg-background shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                  <Input
                    className="min-w-0 rounded-none border-0 shadow-none focus:border-0 focus:ring-0"
                    min="0"
                    step={glucoseUnit === "mmol/L" ? "0.1" : "1"}
                    onChange={(event) => setGlucose(event.target.value)}
                    placeholder={glucoseUnit === "mmol/L" ? "e.g. 6.0" : "e.g. 108"}
                    type="number"
                    value={glucose}
                  />
                  <div className="flex h-9 items-stretch border-l border-input" role="radiogroup" aria-label="Glucose unit">
                    {(["mg/dL", "mmol/L"] as GlucoseUnit[]).map((unit) => (
                      <label
                        className={cn(
                          "flex cursor-pointer items-center justify-center px-2.5 text-xs font-semibold transition",
                          unit !== "mg/dL" && "border-l border-input",
                          glucoseUnit === unit
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                        )}
                        key={unit}
                      >
                        <input
                          checked={glucoseUnit === unit}
                          className="sr-only"
                          name="glucoseUnit"
                          onChange={() => {
                            setGlucoseUnit(unit);
                            setGlucose("");
                          }}
                          type="radio"
                          value={unit}
                        />
                        {unit}
                      </label>
                    ))}
                  </div>
                </div>
              </FormField>
              <FormField label="Consciousness Level">
                <SearchableSelect
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => setConsciousnessLevel(event.target.value)}
                  value={consciousnessLevel}
                >
                  <option value="">Select level</option>
                  <option>Alert</option>
                  <option>Responds to Voice</option>
                  <option>Responds to Pain</option>
                  <option>Unresponsive</option>
                </SearchableSelect>
              </FormField>
              <FormField label="Patient Position">
                <Input onChange={(event) => setPatientPosition(event.target.value)} placeholder="e.g. Supine, sitting, lateral" value={patientPosition} />
              </FormField>
              <FormField label="Pulse">
                <Input min="20" max="250" onChange={(event) => setPulse(event.target.value)} placeholder="72" type="number" value={pulse} />
              </FormField>
              <FormField label="BP systolic">
                <Input min="40" max="300" onChange={(event) => setBloodPressureSystolic(event.target.value)} placeholder="120" type="number" value={bloodPressureSystolic} />
              </FormField>
              <FormField label="BP diastolic">
                <Input min="20" max="200" onChange={(event) => setBloodPressureDiastolic(event.target.value)} placeholder="80" type="number" value={bloodPressureDiastolic} />
              </FormField>
              <div className="sm:col-span-2">
                <PainAssessmentFields
                  airwayStatus={cpotAirwayStatus}
                  domainScores={painDomainScores}
                  nrsScore={painScore}
                  onAirwayStatusChange={(value) => {
                    setCpotAirwayStatus(value);
                    setPainDomainScores((current) => ({ ...current, cpotDomain4: undefined }));
                  }}
                  onDomainScoreChange={(key, value) => setPainDomainScores((current) => ({ ...current, [key]: value }))}
                  onNrsScoreChange={setPainScore}
                  onScaleChange={(value) => {
                    setPainScale(value);
                    setPainScore("");
                    setPainDomainScores({});
                  }}
                  scale={painScale}
                  severity={painSeverity}
                  total={painScale === "NRS" ? (painScore === "" ? undefined : Number(painScore)) : observedPainTotal}
                />
              </div>
            </div>
        ) : null}

        {hasSharedClinicalNoteType ? (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Note type">
                  <SelectWithOtherPopup
                    customValue={customMedicalNoteType}
                    error={formError === noteTypeError}
                    onChange={(value) => {
                      const nextType = value as MedicalNoteType;
                      setMedicalNoteType(nextType);
                      setCustomNoteTypePopupOpen(nextType === "Others");
                      if (nextType !== "Others") setCustomMedicalNoteType("");
                      if (formError === noteTypeError) setFormError("");
                    }}
                    onCustomValueChange={(value) => {
                      setCustomMedicalNoteType(value);
                      if (formError === noteTypeError) setFormError("");
                    }}
                    onOpenChange={setCustomNoteTypePopupOpen}
                    open={customNoteTypePopupOpen}
                    options={isSurgeryNote ? surgeryNoteTypes : medicalNoteTypes}
                    placeholder={`Enter ${isSurgeryNote ? "surgery" : "medical"} note type`}
                    value={medicalNoteType}
                  />
                </FormField>
              </div>
              {isMedicalNote ? <FormField label="Primary diagnosis">
                <SelectWithOtherPopup
                  customValue={customPrimaryDiagnosis}
                  error={false}
                  onChange={(value) => {
                    setPrimaryDiagnosis(value);
                    setPrimaryDiagnosisPopupOpen(value === diagnosisOtherOption);
                    if (value !== diagnosisOtherOption) setCustomPrimaryDiagnosis("");
                  }}
                  onCustomValueChange={setCustomPrimaryDiagnosis}
                  onOpenChange={setPrimaryDiagnosisPopupOpen}
                  open={primaryDiagnosisPopupOpen}
                  options={diagnosisOptions}
                  placeholder="Enter primary diagnosis"
                  value={primaryDiagnosis}
                />
              </FormField> : null}
              {isMedicalNote ? <FormField label="Secondary diagnosis">
                <SelectWithOtherPopup
                  customValue={customSecondaryDiagnosis}
                  error={false}
                  onChange={(value) => {
                    setSecondaryDiagnoses(value);
                    setSecondaryDiagnosisPopupOpen(value === diagnosisOtherOption);
                    if (value !== diagnosisOtherOption) setCustomSecondaryDiagnosis("");
                  }}
                  onCustomValueChange={setCustomSecondaryDiagnosis}
                  onOpenChange={setSecondaryDiagnosisPopupOpen}
                  open={secondaryDiagnosisPopupOpen}
                  options={diagnosisOptions}
                  placeholder="Enter secondary diagnosis"
                  value={secondaryDiagnoses}
                />
              </FormField> : null}
            </div>
        ) : null}

        {isPharmacyNote ? (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Note type">
                <SearchableSelect
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updatePharmacy("noteType", event.target.value as PharmacyNoteType)}
                  value={pharmacy.noteType}
                >
                  {pharmacyNoteTypes.map((item) => <option key={item}>{item}</option>)}
                </SearchableSelect>
                </FormField>
              </div>
              <ClinicalTextArea
                label="Past Medicine"
                onChange={(value) => updatePharmacy("medicationPreviousToAdmission", value)}
                placeholder="Medicines the patient was taking previously..."
                value={pharmacy.medicationPreviousToAdmission}
              />
              <ClinicalTextArea
                label="Medication Currently"
                onChange={(value) => updatePharmacy("medicationCurrently", value)}
                placeholder="Medicines currently being administered..."
                value={pharmacy.medicationCurrently}
              />
              <div className="sm:col-span-2">
                <ClinicalTextArea
                  label="Medication at Discharge"
                  onChange={(value) => updatePharmacy("medicationAtDischarge", value)}
                  placeholder="Medicines planned or prescribed at discharge..."
                  value={pharmacy.medicationAtDischarge}
                />
              </div>
            </div>
        ) : null}

        {isAlliedHealthNote ? (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <FormField label="Note type">
                <SearchableSelect
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updateAlliedHealth("noteType", event.target.value as AlliedNoteType)}
                  value={alliedHealth.noteType}
                >
                  {alliedNoteTypes.map((item) => <option key={item}>{item}</option>)}
                </SearchableSelect>
              </FormField>
              <FormField label="Duration (Hours / Minutes)">
                <Input
                  onChange={(event) => updateAlliedHealth("sessionDuration", event.target.value)}
                  placeholder="e.g. 1 hour 30 minutes"
                  type="text"
                  value={alliedHealth.sessionDuration}
                />
              </FormField>
              <div className="sm:col-span-2">
                <ClinicalTextArea
                  label="Plan"
                  onChange={(value) => updateAlliedHealth("followUpPlan", value)}
                  placeholder="Enter assessment plan, actions and follow-up..."
                  value={alliedHealth.followUpPlan}
                />
              </div>
            </div>
        ) : null}

        {!isAdditionalProgressNote ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/5">
            <input
              checked={specialInstructionEnabled}
              className="h-4 w-4 rounded border-input"
              onChange={(event) => setSpecialInstructionEnabled(event.target.checked)}
              type="checkbox"
            />
            <span>Special Instruction Note</span>
          </label>
        ) : null}

        {shouldSaveSpecialInstruction ? (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
            <div className="mb-3 text-sm font-semibold text-foreground">Special Instruction Note</div>
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <FormField label="Special instruction type">
                <SearchableSelect
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updateAdditionalProgress("noteType", event.target.value as AdditionalNoteType)}
                  value={additionalProgress.noteType}
                >
                  {additionalNoteTypes.map((item) => <option key={item}>{item}</option>)}
                </SearchableSelect>
              </FormField>
              <FormField label="Follow-up">
                <SearchableSelect
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updateAdditionalProgress("followUpRequired", event.target.value)}
                  value={additionalProgress.followUpRequired}
                >
                  <option>No</option>
                  <option>Yes</option>
                </SearchableSelect>
              </FormField>
              {additionalProgress.followUpRequired === "Yes" ? (
                <div className="sm:col-span-2">
                  <FormField label="Follow-up date">
                    <Input onChange={(event) => updateAdditionalProgress("followUpDate", event.target.value)} type="date" value={additionalProgress.followUpDate} />
                  </FormField>
                </div>
              ) : null}
            </div>
            </div>
        ) : null}

        {!isOperativeNote ? (
        <FormField label={isNurseNote ? "Nursing note" : isPharmacyNote ? "Pharmacy note" : "Clinical note"}>
          <textarea
            autoFocus
            className={cn(
              "min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20",
              formError === contentError ? "border-destructive focus:border-destructive" : "border-input focus:border-ring",
            )}
            onChange={(event) => {
              setContent(event.target.value);
              if (formError === contentError) setFormError("");
            }}
            placeholder="Assessment, action taken, patient response and next plan..."
            value={content}
          />
          {formError === contentError ? <span className="mt-1.5 block text-xs font-medium text-destructive">{formError}</span> : null}
        </FormField>
        ) : null}

        {isMedicalNote ? (
          <FormField label="Treatment Plan">
            <textarea
              className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              onChange={(event) => setPlan(event.target.value)}
              placeholder="Enter treatment plan, medicines, investigations and follow-up..."
              value={plan}
            />
          </FormField>
        ) : null}

        {showSigning ? (
          <div className="grid gap-3 rounded-md border border-warning/35 bg-warning/5 p-3 sm:grid-cols-2">
            <div>
              <FormField label="Signed by">
                <Input
                  onChange={(event) => hasPatientVisitContext ? setAuthenticatedSigner(event.target.value) : setSignedBy(event.target.value)}
                  placeholder="Authenticated clinician name"
                  value={hasPatientVisitContext ? authenticatedSigner : signedBy}
                />
              </FormField>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-warning/30 bg-background px-3 py-2 text-xs">
              <input
                checked={signatureAttested}
                className="h-4 w-4 rounded border-input"
                onChange={(event) => setSignatureAttested(event.target.checked)}
                type="checkbox"
              />
              <span>I reviewed this note and confirm it is accurate.</span>
            </label>
          </div>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t border-border bg-surface px-1 pt-3">
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">Cancel</Button>
          <Button name="saveAction" type="submit" value="draft" variant="outline">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          {showSigning ? (
            <Button disabled={!signatureAttested} name="saveAction" type="submit" value="sign">
              <CheckCheck className="h-4 w-4" />
              Sign & Save
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (hasCustomSpecialty && specialty === "Others" && !customMedicalSpecialty.trim()) {
                  setFormError(specialtyError);
                  return;
                }
                if (hasSharedClinicalNoteType && medicalNoteType === "Others" && !customMedicalNoteType.trim()) {
                  setFormError(noteTypeError);
                  return;
                }
                if (isSurgeryNote && specialty === "Transplant Surgery" && !transplantType) {
                  setFormError("Please select the transplant type.");
                  return;
                }
                if (isOperativeNote && !operative.surgeonName.trim()) {
                  setFormError("Surgeon name is required.");
                  return;
                }
                if (isOperativeNote && !operative.surgeryName.trim()) {
                  setFormError("Name of surgery is required.");
                  return;
                }
                if (!isOperativeNote && !content.trim()) {
                  setFormError(contentError);
                  return;
                }
                setShowSigning(true);
              }}
              type="button"
            >
              <CheckCheck className="h-4 w-4" />
              Sign & Save
            </Button>
          )}
        </div>
      </form>
    </CenterModal>
  );
}

function PainAssessmentFields({
  airwayStatus,
  domainScores,
  nrsScore,
  onAirwayStatusChange,
  onDomainScoreChange,
  onNrsScoreChange,
  onScaleChange,
  scale,
  severity,
  total,
}: {
  airwayStatus: CpotAirwayStatus;
  domainScores: PainAssessment["scores"];
  nrsScore: string;
  onAirwayStatusChange: (value: CpotAirwayStatus) => void;
  onDomainScoreChange: (key: PainDomainKey, value: number | undefined) => void;
  onNrsScoreChange: (value: string) => void;
  onScaleChange: (value: PainScale) => void;
  scale: PainScale;
  severity?: string;
  total?: number;
}) {
  const maxScore = scale === "CPOT" ? 8 : 10;
  const domain4Options = airwayStatus === "INTUBATED" ? cpotVentilatorOptions : cpotVocalizationOptions;
  const selectedNrsTotal = nrsScore === "" ? undefined : Number(nrsScore);
  const selectedNrsSeverity =
    selectedNrsTotal !== undefined && Number.isFinite(selectedNrsTotal)
      ? getPainSeverity("NRS", selectedNrsTotal)
      : undefined;

  return (
    <div className="rounded-lg border border-border bg-surface-muted/40 p-3 sm:p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold">Pain Assessment</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {([
          ["NRS", "NRS", "Conscious / verbal patient"],
          ["CPOT", "CPOT", "Non-verbal / ventilated adult"],
          ["FLACC", "FLACC", "Infant, child or non-verbal patient"],
        ] as Array<[PainScale, string, string]>).map(([value, label, help]) => (
          <label
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-md border bg-background p-3 transition",
              scale === value ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/50",
            )}
            key={value}
          >
            <input
              checked={scale === value}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              name="pain-scale"
              onChange={() => onScaleChange(value)}
              type="radio"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block text-xs leading-4 text-muted-foreground">{help}</span>
            </span>
          </label>
        ))}
      </div>

      {scale === "NRS" ? (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold">Pain Score (0-10)</div>
            <div className="text-xs font-semibold text-muted-foreground">
              {selectedNrsTotal !== undefined && Number.isFinite(selectedNrsTotal) ? `Selected score: ${selectedNrsTotal}/10` : "Select a score"}
            </div>
          </div>
          <div className="grid grid-cols-11 gap-1">
            {nrsScalePoints.map((point) => (
              <button
                aria-label={`${point.score} ${point.label}`}
                className="flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-1.5 outline-none transition hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring/25"
                key={point.score}
                onClick={() => onNrsScoreChange(String(point.score))}
                title={point.label}
                type="button"
              >
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-900/25 shadow-sm",
                    point.tone,
                    selectedNrsTotal === point.score && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}
                >
                  <NrsFace expression={point.expression} />
                </span>
                <span className="text-xs font-semibold text-foreground">{point.score}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 max-w-[220px]">
            <div className="rounded-md border border-border bg-surface-muted px-3 py-2">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Severity</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    selectedNrsSeverity === "No pain" && "bg-success",
                    selectedNrsSeverity === "Mild pain" && "bg-emerald-400",
                    selectedNrsSeverity === "Moderate pain" && "bg-warning",
                    selectedNrsSeverity === "Severe pain" && "bg-danger",
                    !selectedNrsSeverity && "bg-muted-foreground/40",
                  )}
                />
                {selectedNrsSeverity ?? "Not selected"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {scale === "CPOT" ? (
        <div className="mt-4 space-y-4">
          <div className="text-sm font-semibold">CPOT Assessment</div>
          <FormField label="Airway status">
            <SearchableSelect
              className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              onChange={(event) => onAirwayStatusChange(event.target.value as CpotAirwayStatus)}
              value={airwayStatus}
            >
              <option value="INTUBATED">Intubated</option>
              <option value="NOT_INTUBATED">Extubated / non-ventilated</option>
            </SearchableSelect>
          </FormField>
          <CpotAssessmentTable
            airwayStatus={airwayStatus}
            domain4Options={domain4Options}
            domainScores={domainScores}
            onDomainScoreChange={onDomainScoreChange}
            severity={severity}
            total={total}
          />
        </div>
      ) : null}

      {scale === "FLACC" ? (
        <div className="mt-4 space-y-4">
          <FlaccAssessmentTable domainScores={domainScores} onDomainScoreChange={onDomainScoreChange} severity={severity} total={total} />
        </div>
      ) : null}

      {scale !== "CPOT" ? (
        <div className="mt-4 flex flex-col gap-2 rounded-md border border-primary/20 bg-primary-soft px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Total Score</span>
          <span className="text-sm font-semibold text-primary">
            {total !== undefined && Number.isFinite(total)
              ? `${total}/${maxScore}${severity ? ` - ${severity}` : ""}`
              : scale === "NRS"
                ? "Enter a score"
                : "Complete all domains"}
          </span>
        </div>
      ) : null}
      {scale === "FLACC" ? null : null}

    </div>
  );
}

function NrsFace({ expression }: { expression: (typeof nrsScalePoints)[number]["expression"] }) {
  const mouthClass =
    expression === "smile"
      ? "h-3 w-5 rounded-b-full border-b-2 border-slate-800"
      : expression === "slight-smile"
        ? "h-2 w-5 rounded-b-full border-b-2 border-slate-800"
        : expression === "neutral"
          ? "h-0 w-5 border-b-2 border-slate-800"
          : expression === "concerned"
            ? "h-2 w-5 rounded-t-full border-t-2 border-slate-800"
            : "h-3 w-5 rounded-t-full border-t-2 border-slate-800";

  return (
    <span aria-hidden="true" className="absolute inset-0">
      <span className="absolute left-[9px] top-[10px] h-1.5 w-1.5 rounded-full bg-slate-800" />
      <span className="absolute right-[9px] top-[10px] h-1.5 w-1.5 rounded-full bg-slate-800" />
      {expression === "cry" ? (
        <>
          <span className="absolute left-[8px] top-[16px] h-2 w-1 rounded-full bg-sky-300" />
          <span className="absolute right-[8px] top-[16px] h-2 w-1 rounded-full bg-sky-300" />
        </>
      ) : null}
      <span className={cn("absolute left-1/2 top-[21px] -translate-x-1/2", mouthClass)} />
    </span>
  );
}

function CpotAssessmentTable({
  airwayStatus,
  domain4Options,
  domainScores,
  onDomainScoreChange,
  severity,
  total,
}: {
  airwayStatus: CpotAirwayStatus;
  domain4Options: PainScoreOption[];
  domainScores: PainAssessment["scores"];
  onDomainScoreChange: (key: PainDomainKey, value: number | undefined) => void;
  severity?: string;
  total?: number;
}) {
  const rows = [
    ...cpotDomains,
    {
      key: "cpotDomain4" as PainDomainKey,
      label: airwayStatus === "INTUBATED" ? "Ventilator Compliance" : "Vocalization",
      options: domain4Options,
    },
  ];
  const significantPain = total !== undefined && total >= 3;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="grid gap-3 border-b border-border bg-primary-soft/45 px-4 py-3 text-xs font-bold uppercase text-muted-foreground md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_260px]">
        <div>CPOT Components</div>
        <div>Observation</div>
        <div>Score</div>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => {
          const selectedScore = domainScores[row.key];
          const meta = cpotComponentMeta(row.key, row.label);
          return (
            <div className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_260px] md:items-center" key={row.key}>
              <div className="flex items-center gap-3">
                <PainComponentIcon name={meta.icon} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">{row.label}</div>
                  <div className="text-xs text-muted-foreground">{meta.description}</div>
                </div>
              </div>
              <SearchableSelect
                className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onDomainScoreChange(row.key, event.target.value === "" ? undefined : Number(event.target.value))}
                value={selectedScore ?? ""}
              >
                <option value="">Select observation</option>
                {row.options.map((option) => (
                  <option key={`${row.key}-${option.score}`} value={option.score}>
                    {option.label}
                  </option>
                ))}
              </SearchableSelect>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((score) => (
                  <button
                    className={cn(
                      "h-9 rounded-md border text-sm font-bold transition hover:border-primary hover:bg-primary-soft",
                      selectedScore === score ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background text-muted-foreground",
                    )}
                    key={`${row.key}-${score}`}
                    onClick={() => onDomainScoreChange(row.key, score)}
                    type="button"
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 border-t border-border bg-surface-muted/35 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-lg border border-primary/20 bg-background p-4">
          <div className="text-xs font-bold uppercase text-muted-foreground">Total Score</div>
          <div className="mt-2 text-center text-3xl font-black text-primary">{total ?? 0} / 8</div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-background p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,1fr)] md:items-center">
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Severity</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <span className={cn("h-2.5 w-2.5 rounded-full", significantPain ? "bg-danger" : "bg-success")} />
                {total !== undefined ? severity : "Complete all domains"}
              </div>
            </div>
            <div className="space-y-2 border-border text-xs font-semibold text-foreground md:border-l md:pl-4">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" />0-2 Acceptable / Minimal Pain</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-danger" />3-8 Significant Pain Present</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cpotComponentMeta(key: PainDomainKey, label: string) {
  if (key === "cpotFacial") return { icon: "face", description: "Facial movements" };
  if (key === "cpotBody") return { icon: "walk", description: "Upper limb movements" };
  if (key === "cpotMuscle") return { icon: "muscle", description: "Muscle tension" };
  if (label === "Vocalization") return { icon: "voice", description: "Extubated / non-ventilated patient" };
  return { icon: "lungs", description: "Tolerance of ventilator" };
}

function FlaccAssessmentTable({
  domainScores,
  onDomainScoreChange,
  severity,
  total,
}: {
  domainScores: PainAssessment["scores"];
  onDomainScoreChange: (key: PainDomainKey, value: number | undefined) => void;
  severity?: string;
  total?: number;
}) {
  const severePain = total !== undefined && total >= 7;
  const moderatePain = total !== undefined && total >= 4 && total <= 6;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="grid gap-3 border-b border-border bg-primary-soft/45 px-4 py-3 text-xs font-bold uppercase text-muted-foreground md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_260px]">
        <div>FLACC Components</div>
        <div>Observation</div>
        <div>Score</div>
      </div>
      <div className="divide-y divide-border">
        {flaccDomains.map((row) => {
          const selectedScore = domainScores[row.key];
          const meta = flaccComponentMeta(row.key);
          return (
            <div className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_260px] md:items-center" key={row.key}>
              <div className="flex items-center gap-3">
                <PainComponentIcon name={meta.icon} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">{row.label}</div>
                  <div className="text-xs text-muted-foreground">{meta.description}</div>
                </div>
              </div>
              <SearchableSelect
                className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onDomainScoreChange(row.key, event.target.value === "" ? undefined : Number(event.target.value))}
                value={selectedScore ?? ""}
              >
                <option value="">Select observation</option>
                {row.options.map((option) => (
                  <option key={`${row.key}-${option.score}`} value={option.score}>
                    {option.label}
                  </option>
                ))}
              </SearchableSelect>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((score) => (
                  <button
                    className={cn(
                      "h-9 rounded-md border text-sm font-bold transition hover:border-primary hover:bg-primary-soft",
                      selectedScore === score ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background text-muted-foreground",
                    )}
                    key={`${row.key}-${score}`}
                    onClick={() => onDomainScoreChange(row.key, score)}
                    type="button"
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 border-t border-border bg-surface-muted/35 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-lg border border-primary/20 bg-background p-4">
          <div className="text-xs font-bold uppercase text-muted-foreground">Total Score</div>
          <div className="mt-2 text-center text-3xl font-black text-primary">{total ?? 0} / 10</div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-background p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,1fr)] md:items-center">
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Severity</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <span className={cn("h-2.5 w-2.5 rounded-full", severePain ? "bg-danger" : moderatePain ? "bg-warning" : "bg-success")} />
                {total !== undefined ? severity : "Complete all domains"}
              </div>
            </div>
            <div className="space-y-2 border-border text-xs font-semibold text-foreground md:border-l md:pl-4">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" />0 Relaxed and comfortable</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" />1-3 Mild discomfort</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-warning" />4-6 Moderate pain</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-danger" />7-10 Severe discomfort / pain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function flaccComponentMeta(key: PainDomainKey) {
  if (key === "flaccFace") return { icon: "face", description: "Facial expression" };
  if (key === "flaccLegs") return { icon: "legs", description: "Position of legs" };
  if (key === "flaccActivity") return { icon: "activity", description: "Movement of body" };
  if (key === "flaccCry") return { icon: "cry", description: "Vocalization" };
  return { icon: "comfort", description: "Ease of comforting" };
}

function PainComponentIcon({ name }: { name: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
      {name === "face" ? <FaceMiniIcon /> : null}
      {name === "walk" ? <BodyMovementIcon /> : null}
      {name === "muscle" ? <MuscleMiniIcon /> : null}
      {name === "lungs" ? <LungsMiniIcon /> : null}
      {name === "voice" ? <VoiceMiniIcon /> : null}
      {name === "legs" ? <LegsMiniIcon /> : null}
      {name === "activity" ? <ActivityMiniIcon /> : null}
      {name === "cry" ? <CryMiniIcon /> : null}
      {name === "comfort" ? <ComfortMiniIcon /> : null}
    </div>
  );
}

function FaceMiniIcon() {
  return (
    <span className="relative h-5 w-5 rounded-full border-2 border-current">
      <span className="absolute left-[4px] top-[5px] h-1 w-1 rounded-full bg-current" />
      <span className="absolute right-[4px] top-[5px] h-1 w-1 rounded-full bg-current" />
      <span className="absolute left-1/2 top-[12px] h-1.5 w-2.5 -translate-x-1/2 rounded-b-full border-b-2 border-current" />
    </span>
  );
}

function BodyMovementIcon() {
  return (
    <span className="relative h-6 w-5">
      <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute left-[8px] top-[7px] h-8 w-1 origin-top rotate-[18deg] rounded-full bg-current" />
      <span className="absolute left-[4px] top-[10px] h-1 w-4 -rotate-[28deg] rounded-full bg-current" />
      <span className="absolute left-[7px] top-[15px] h-1 w-4 rotate-[36deg] rounded-full bg-current" />
    </span>
  );
}

function MuscleMiniIcon() {
  return (
    <span className="relative h-6 w-6">
      <span className="absolute bottom-1 left-1 h-3 w-4 rounded-full border-2 border-current" />
      <span className="absolute bottom-2 right-0 h-2 w-3 rounded-full bg-current" />
      <span className="absolute left-2 top-1 h-4 w-1 rotate-[-25deg] rounded-full bg-current" />
    </span>
  );
}

function LungsMiniIcon() {
  return (
    <span className="relative h-6 w-6">
      <span className="absolute left-[11px] top-1 h-5 w-1 rounded-full bg-current" />
      <span className="absolute left-1 top-2 h-4 w-2.5 rounded-full border-2 border-current" />
      <span className="absolute right-1 top-2 h-4 w-2.5 rounded-full border-2 border-current" />
    </span>
  );
}

function VoiceMiniIcon() {
  return (
    <span className="relative h-6 w-6">
      <span className="absolute left-1 top-2 h-3 w-2 rounded-sm bg-current" />
      <span className="absolute left-3 top-[7px] h-4 w-4 rounded-full border-2 border-current border-l-0" />
      <span className="absolute left-[15px] top-[3px] h-5 w-5 rounded-full border-2 border-current border-l-0 opacity-50" />
    </span>
  );
}

function LegsMiniIcon() {
  return (
    <span className="relative h-6 w-6">
      <span className="absolute left-2 top-1 h-5 w-1.5 rounded-full bg-current" />
      <span className="absolute right-2 top-1 h-5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

function ActivityMiniIcon() {
  return (
    <span className="relative h-6 w-6">
      <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute left-[11px] top-[7px] h-4 w-1 rounded-full bg-current" />
      <span className="absolute left-[4px] top-[10px] h-1 w-5 rounded-full bg-current" />
      <span className="absolute left-[6px] top-[18px] h-1 w-4 rounded-full bg-current" />
    </span>
  );
}

function CryMiniIcon() {
  return (
    <span className="relative h-5 w-5 rounded-full border-2 border-current">
      <span className="absolute left-[4px] top-[5px] h-1 w-1 rounded-full bg-current" />
      <span className="absolute right-[4px] top-[5px] h-1 w-1 rounded-full bg-current" />
      <span className="absolute left-[4px] top-[9px] h-2 w-1 rounded-full bg-sky-300" />
      <span className="absolute right-[4px] top-[9px] h-2 w-1 rounded-full bg-sky-300" />
      <span className="absolute left-1/2 top-[13px] h-1.5 w-2.5 -translate-x-1/2 rounded-t-full border-t-2 border-current" />
    </span>
  );
}

function ComfortMiniIcon() {
  return (
    <span className="relative h-6 w-6">
      <span className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute bottom-1 left-1/2 h-3 w-5 -translate-x-1/2 rounded-t-full bg-current" />
      <span className="absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-current opacity-50" />
    </span>
  );
}

function PainDomainSelect({
  domainKey,
  label,
  onChange,
  options,
  value,
}: {
  domainKey: PainDomainKey;
  label: string;
  onChange: (key: PainDomainKey, value: number | undefined) => void;
  options: PainScoreOption[];
  value?: number;
}) {
  const selectedOption = options.find((option) => option.score === value);

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_96px] md:items-center">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <SearchableSelect
          className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          onChange={(event) => onChange(domainKey, event.target.value === "" ? undefined : Number(event.target.value))}
          value={value ?? ""}
        >
          <option value="">Select observation</option>
          {options.map((option) => (
            <option key={`${domainKey}-${option.score}`} value={option.score}>
              {option.label}
            </option>
          ))}
        </SearchableSelect>
        <div className="rounded-md bg-primary-soft px-3 py-2 text-sm font-semibold text-primary">
          Score = {value ?? "-"}
        </div>
      </div>
      {selectedOption?.guidance ? <span className="mt-2 block text-xs leading-4 text-muted-foreground">{selectedOption.guidance}</span> : null}
    </div>
  );
}

function NrsPainScaleModal({
  currentScore,
  onApply,
  onOpenChange,
  open,
}: {
  currentScore?: number;
  onApply: (score: number) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const initialRange = nrsPainRanges.find((range) => scoreInNrsRange(currentScore, range)) ?? nrsPainRanges[1];
  const [selectedRangeId, setSelectedRangeId] = React.useState<NrsPainRange["id"]>(initialRange.id);
  const [selectedScore, setSelectedScore] = React.useState(currentScore ?? initialRange.score);

  React.useEffect(() => {
    if (!open) return;
    const nextRange = nrsPainRanges.find((range) => scoreInNrsRange(currentScore, range)) ?? nrsPainRanges[1];
    setSelectedRangeId(nextRange.id);
    setSelectedScore(currentScore ?? nextRange.score);
  }, [currentScore, open]);

  const selectedRange = nrsPainRanges.find((range) => range.id === selectedRangeId) ?? nrsPainRanges[1];
  const selectedPoint = nrsScalePoints.find((point) => point.score === selectedScore);

  function selectRange(range: NrsPainRange) {
    setSelectedRangeId(range.id);
    setSelectedScore(range.score);
  }

  function selectScore(score: number) {
    const nextRange = nrsPainRanges.find((range) => scoreInNrsRange(score, range));
    setSelectedScore(score);
    if (nextRange) setSelectedRangeId(nextRange.id);
  }

  return (
    <CenterModal
      className="w-[min(94vw,900px)]"
      description="Select patient condition, pain range, and severity to calculate the NRS pain score."
      onOpenChange={onOpenChange}
      open={open}
      title="NRS Pain Scale"
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          {nrsPainRanges.map((range) => (
            <button
              className={cn(
                "rounded-lg border bg-background p-3 text-left transition hover:border-primary/70",
                selectedRangeId === range.id ? "border-primary ring-2 ring-primary/15" : "border-border",
              )}
              key={range.id}
              onClick={() => selectRange(range)}
              type="button"
            >
              <div className="text-sm font-semibold text-foreground">{range.label}</div>
              <div className="mt-1 text-xs font-semibold text-primary">Range {range.range}</div>
              <div className="mt-2 text-xs leading-5 text-muted-foreground">{range.condition}</div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Scaling</div>
              <div className="text-xs text-muted-foreground">Choose an exact score from 0 to 10.</div>
            </div>
            <div className="rounded-md bg-primary-soft px-3 py-1.5 text-sm font-semibold text-primary">
              Calculated score: {selectedScore}/10
            </div>
          </div>
          <div className="grid grid-cols-11 gap-1">
            {nrsScalePoints.map((point) => (
              <button
                aria-label={`${point.score} ${point.label}`}
                className={cn(
                  "flex h-10 items-center justify-center rounded-md border text-sm font-bold transition hover:border-primary hover:bg-primary-soft",
                  selectedScore === point.score ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground",
                )}
                key={point.score}
                onClick={() => selectScore(point.score)}
                title={point.label}
                type="button"
              >
                {point.score}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <div>0: No pain</div>
            <div>1-3: Mild pain</div>
            <div>4-6: Moderate pain</div>
            <div className="sm:col-span-3">7-10: Severe pain</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="text-sm font-semibold">Patient Condition</div>
            <div className="mt-2 text-sm text-muted-foreground">{selectedRange.condition}</div>
            <div className="mt-3 text-xs leading-5 text-muted-foreground">{selectedRange.description}</div>
            {selectedPoint ? <div className="mt-3 text-xs font-semibold text-primary">Scale marker: {selectedPoint.label}</div> : null}
          </div>
          <div className="rounded-lg border border-primary/25 bg-primary-soft p-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Severity</div>
            <div className="mt-1 text-xl font-bold text-primary">{getPainSeverity("NRS", selectedScore)}</div>
            <div className="mt-2 text-xs text-muted-foreground">Range {selectedRange.range}</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(selectedScore);
              onOpenChange(false);
            }}
          >
            Apply Score
          </Button>
        </div>
      </div>
    </CenterModal>
  );
}

function scoreInNrsRange(score: number | undefined, range: NrsPainRange) {
  if (score === undefined || !Number.isFinite(score)) return false;
  if (range.id === "none") return score === 0;
  if (range.id === "mild") return score >= 1 && score <= 3;
  if (range.id === "moderate") return score >= 4 && score <= 6;
  return score >= 7 && score <= 10;
}

function FormField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function PriorityRadioGroup({
  onChange,
  value,
}: {
  onChange: (priority: Note["priority"]) => void;
  value: Note["priority"];
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold text-foreground">Priority</legend>
      <div className="grid h-9 grid-cols-3 overflow-hidden rounded-md border border-input bg-background shadow-sm">
        {(["Low", "Medium", "High"] as Note["priority"][]).map((item) => (
          <label
            className={cn(
              "flex min-w-0 cursor-pointer items-center justify-center gap-1.5 border-l border-input px-2 text-xs font-semibold transition first:border-l-0",
              value === item
                ? "bg-primary-soft text-primary"
                : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
            key={item}
          >
            <input
              checked={value === item}
              className="h-3.5 w-3.5 shrink-0 accent-[var(--primary)]"
              name="priority"
              onChange={() => onChange(item)}
              type="radio"
              value={item}
            />
            <span className="whitespace-nowrap">{item}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectWithOtherPopup({
  customValue,
  error,
  onChange,
  onCustomValueChange,
  onOpenChange,
  open,
  options,
  placeholder,
  value,
}: {
  customValue: string;
  error: boolean;
  onChange: (value: string) => void;
  onCustomValueChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  options: readonly string[];
  placeholder: string;
  value: string;
}) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [popupWidth, setPopupWidth] = React.useState(280);

  React.useEffect(() => {
    if (!open) return;

    function updateWidth() {
      const width = anchorRef.current?.getBoundingClientRect().width;
      if (width) setPopupWidth(Math.min(width, window.innerWidth - 24));
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [open]);

  return (
    <Popover.Root onOpenChange={onOpenChange} open={open && value === "Others"}>
      <Popover.Anchor asChild>
        <div ref={anchorRef}>
          <SearchableSelect
            className={cn(
              "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20",
              error ? "border-destructive focus:border-destructive" : "border-input focus:border-ring",
            )}
            onChange={(event) => onChange(event.target.value)}
            value={value}
          >
            <option value="">Select option</option>
            {options.map((item) => <option key={item}>{item}</option>)}
          </SearchableSelect>
          {value === "Others" && customValue ? (
            <button
              className="mt-2 flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary-soft px-3 text-left text-sm font-semibold text-primary outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
              onClick={() => onOpenChange(true)}
              type="button"
            >
              <span className="min-w-0 truncate">{customValue}</span>
              <FilePenLine className="h-4 w-4 shrink-0" />
            </button>
          ) : null}
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          avoidCollisions
          collisionPadding={{ bottom: 12, left: 12, right: 12, top: 12 }}
          className="z-[90] max-w-[calc(100vw-24px)] rounded-md border border-border bg-surface p-3 shadow-soft"
          sideOffset={4}
          sticky="always"
          style={{ width: popupWidth }}
        >
          <CustomValuePopupContent
            onChange={onCustomValueChange}
            onDone={() => onOpenChange(false)}
            placeholder={placeholder}
            value={customValue}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function CustomValuePopupContent({
  onChange,
  onDone,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  onDone: () => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground">Enter custom value</div>
      <Input
        autoFocus
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (value.trim()) onDone();
          }
        }}
        placeholder={placeholder}
        value={value}
      />
      <div className="flex justify-end">
        <Button disabled={!value.trim()} onClick={onDone} size="sm" type="button">Done</Button>
      </div>
    </div>
  );
}

function SurgerySpecialtyField({
  customValue,
  error,
  open,
  otherOpen,
  onCustomValueChange,
  onOpenChange,
  onOtherOpenChange,
  onSpecialtyChange,
  onTransplantChange,
  specialty,
  transplantType,
}: {
  customValue: string;
  error: boolean;
  open: boolean;
  otherOpen: boolean;
  onCustomValueChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onOtherOpenChange: (open: boolean) => void;
  onSpecialtyChange: (specialty: string) => void;
  onTransplantChange: (transplantType: TransplantType) => void;
  specialty: string;
  transplantType: TransplantType | "";
}) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [popupWidth, setPopupWidth] = React.useState(280);
  const popupOpen = specialty === "Transplant Surgery" ? open : specialty === "Others" ? otherOpen : false;

  React.useEffect(() => {
    if (!popupOpen) return;

    function updateWidth() {
      const width = anchorRef.current?.getBoundingClientRect().width;
      if (width) setPopupWidth(Math.min(width, window.innerWidth - 24));
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [popupOpen]);

  return (
    <Popover.Root
      onOpenChange={(nextOpen) => {
        if (specialty === "Transplant Surgery") onOpenChange(nextOpen);
        if (specialty === "Others") onOtherOpenChange(nextOpen);
      }}
      open={popupOpen}
    >
      <Popover.Anchor asChild>
        <div ref={anchorRef}>
          <SearchableSelect
            className={cn(
              "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20",
              error ? "border-destructive focus:border-destructive" : "border-input focus:border-ring",
            )}
            onChange={(event) => onSpecialtyChange(event.target.value)}
            value={specialty}
          >
            {surgerySpecialties.map((item) => <option key={item}>{item}</option>)}
          </SearchableSelect>
          {specialty === "Transplant Surgery" && transplantType ? (
            <button
              className="mt-2 flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary-soft px-3 text-left text-sm font-semibold text-primary outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
              onClick={() => onOpenChange(true)}
              type="button"
            >
              <span className="min-w-0 truncate">{transplantType}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
          ) : null}
          {specialty === "Others" && customValue ? (
            <button
              className="mt-2 flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-primary/40 bg-primary-soft px-3 text-left text-sm font-semibold text-primary outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
              onClick={() => onOtherOpenChange(true)}
              type="button"
            >
              <span className="min-w-0 truncate">{customValue}</span>
              <FilePenLine className="h-4 w-4 shrink-0" />
            </button>
          ) : null}
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          avoidCollisions
          collisionPadding={{ bottom: 12, left: 12, right: 12, top: 12 }}
          className="z-[90] max-h-[min(360px,var(--radix-popover-content-available-height))] max-w-[calc(100vw-24px)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-md border border-border bg-surface p-1 shadow-soft"
          sideOffset={4}
          sticky="always"
          style={{ width: popupWidth }}
        >
          {specialty === "Transplant Surgery" ? (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Select transplant type</div>
              {transplantTypes.map((type) => (
                <button
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-3 py-2.5 text-left text-sm outline-none hover:bg-surface-muted focus-visible:bg-surface-muted",
                    transplantType === type && "bg-primary-soft font-semibold text-primary",
                  )}
                  key={type}
                  onClick={() => onTransplantChange(type)}
                  type="button"
                >
                  <span className="min-w-0 flex-1 break-words whitespace-normal">{type}</span>
                  {transplantType === type ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              ))}
            </>
          ) : (
            <CustomValuePopupContent
              onChange={onCustomValueChange}
              onDone={() => onOtherOpenChange(false)}
              placeholder="Enter surgery specialty"
              value={customValue}
            />
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function FormSection({
  children,
  description,
  title,
  tone = "default",
}: {
  children: React.ReactNode;
  description: string;
  title: string;
  tone?: "default" | "warning";
}) {
  return (
    <section className={cn("rounded-lg border p-4", tone === "warning" ? "border-warning/35 bg-warning/5" : "border-border bg-surface-muted/25")}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ClinicalTextArea({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  return (
    <FormField label={label}>
      <textarea
        className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </FormField>
  );
}

function AlliedSpecialtyFields({
  data,
  specialty,
  onChange,
}: {
  data: AlliedHealthDocumentation;
  specialty: string;
  onChange: <K extends keyof AlliedHealthDocumentation>(field: K, value: AlliedHealthDocumentation[K]) => void;
}) {
  if (specialty === "Physiotherapy") {
    return (
      <FormSection description="Record mobility, safety and treatment response for the physiotherapy session." title="Physiotherapy assessment">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ClinicalTextArea label="Mobility status" onChange={(value) => onChange("mobilityStatus", value)} placeholder="Bed mobility, standing and walking..." required value={data.mobilityStatus} />
          <ClinicalTextArea label="Range of motion" onChange={(value) => onChange("rangeOfMotion", value)} placeholder="Joint movement findings..." required value={data.rangeOfMotion} />
          <ClinicalTextArea label="Muscle strength" onChange={(value) => onChange("muscleStrength", value)} placeholder="Strength grading and limitations..." required value={data.muscleStrength} />
          <ClinicalTextArea label="Balance" onChange={(value) => onChange("balance", value)} placeholder="Sitting and standing balance..." required value={data.balance} />
          <ClinicalTextArea label="Gait" onChange={(value) => onChange("gait", value)} placeholder="Gait pattern and assistance..." required value={data.gait} />
          <ClinicalTextArea label="Transfer ability" onChange={(value) => onChange("transferAbility", value)} placeholder="Bed, chair and toilet transfers..." required value={data.transferAbility} />
          <FormField label="Walking distance">
            <Input onChange={(event) => onChange("walkingDistance", event.target.value)} placeholder="e.g. 20 metres" value={data.walkingDistance} />
          </FormField>
          <FormField label="Assistive device">
            <Input onChange={(event) => onChange("assistiveDevice", event.target.value)} placeholder="Walker, cane, wheelchair..." value={data.assistiveDevice} />
          </FormField>
          <FormField label="Pain score (0-10)">
            <Input max="10" min="0" onChange={(event) => onChange("painScore", event.target.value)} type="number" value={data.painScore} />
          </FormField>
          <ClinicalTextArea label="Fall risk" onChange={(value) => onChange("fallRisk", value)} placeholder="Risk factors and precautions..." required value={data.fallRisk} />
          <ClinicalTextArea label="Exercise / intervention" onChange={(value) => onChange("exerciseIntervention", value)} placeholder="Exercises and therapy delivered..." required value={data.exerciseIntervention} />
          <ClinicalTextArea label="Patient tolerance" onChange={(value) => onChange("patientTolerance", value)} placeholder="Tolerance and response to treatment..." required value={data.patientTolerance} />
          <ClinicalTextArea label="Next-session plan" onChange={(value) => onChange("nextSessionPlan", value)} placeholder="Planned progression and frequency..." required value={data.nextSessionPlan} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Nutrition") {
    return (
      <FormSection description="Record nutrition measurements, diagnosis, requirements and nutrition plan." title="Nutrition assessment">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Current weight (kg)">
            <Input min="0" onChange={(event) => onChange("currentWeight", event.target.value)} step="0.1" type="number" value={data.currentWeight} />
          </FormField>
          <FormField label="Height (cm)">
            <Input min="0" onChange={(event) => onChange("height", event.target.value)} step="0.1" type="number" value={data.height} />
          </FormField>
          <FormField label="BMI">
            <Input min="0" onChange={(event) => onChange("bmi", event.target.value)} step="0.1" type="number" value={data.bmi} />
          </FormField>
          <ClinicalTextArea label="Weight change" onChange={(value) => onChange("weightChange", value)} placeholder="Recent gain/loss and timeframe..." required value={data.weightChange} />
          <ClinicalTextArea label="Dietary intake" onChange={(value) => onChange("dietaryIntake", value)} placeholder="Usual and current intake..." required value={data.dietaryIntake} />
          <ClinicalTextArea label="Appetite" onChange={(value) => onChange("appetite", value)} placeholder="Appetite and factors affecting intake..." required value={data.appetite} />
          <ClinicalTextArea label="Nutrition diagnosis" onChange={(value) => onChange("nutritionDiagnosis", value)} placeholder="Nutrition problem and contributing factors..." required value={data.nutritionDiagnosis} />
          <FormField label="Calorie requirement">
            <Input onChange={(event) => onChange("calorieRequirement", event.target.value)} placeholder="kcal/day" value={data.calorieRequirement} />
          </FormField>
          <FormField label="Protein requirement">
            <Input onChange={(event) => onChange("proteinRequirement", event.target.value)} placeholder="g/day" value={data.proteinRequirement} />
          </FormField>
          <ClinicalTextArea label="Nutrition intervention" onChange={(value) => onChange("nutritionIntervention", value)} placeholder="Nutrition support and intervention..." required value={data.nutritionIntervention} />
          <ClinicalTextArea label="Diet recommendation" onChange={(value) => onChange("dietRecommendation", value)} placeholder="Diet type and modifications..." required value={data.dietRecommendation} />
          <ClinicalTextArea label="Supplement / feed plan" onChange={(value) => onChange("supplementPlan", value)} placeholder="Supplements, enteral or parenteral plan..." value={data.supplementPlan} />
          <ClinicalTextArea label="Monitoring plan" onChange={(value) => onChange("monitoringPlan", value)} placeholder="Weight, intake, labs and reassessment..." required value={data.monitoringPlan} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Social Worker") {
    return (
      <FormSection description="Record psychosocial needs, discharge barriers, consent and community support." title="Social work assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Family / support system" onChange={(value) => onChange("supportSystem", value)} placeholder="Family, caregivers and available support..." required value={data.supportSystem} />
          <ClinicalTextArea label="Living arrangement" onChange={(value) => onChange("livingArrangement", value)} placeholder="Current accommodation and safety..." required value={data.livingArrangement} />
          <ClinicalTextArea label="Financial concerns" onChange={(value) => onChange("financialConcerns", value)} placeholder="Financial, insurance or employment concerns..." value={data.financialConcerns} />
          <ClinicalTextArea label="Safeguarding risk" onChange={(value) => onChange("safeguardingRisk", value)} placeholder="Abuse, neglect, exploitation or immediate risk..." required value={data.safeguardingRisk} />
          <ClinicalTextArea label="Psychosocial concerns" onChange={(value) => onChange("psychosocialConcerns", value)} placeholder="Emotional, social and coping concerns..." required value={data.psychosocialConcerns} />
          <ClinicalTextArea label="Discharge barriers" onChange={(value) => onChange("dischargeBarriers", value)} placeholder="Barriers to safe discharge..." required value={data.dischargeBarriers} />
          <ClinicalTextArea label="Community resources" onChange={(value) => onChange("communityResources", value)} placeholder="Services and resources discussed..." value={data.communityResources} />
          <ClinicalTextArea label="Referrals made" onChange={(value) => onChange("referralsMade", value)} placeholder="Agencies, services or professionals referred to..." value={data.referralsMade} />
          <ClinicalTextArea label="Patient / family consent" onChange={(value) => onChange("consent", value)} placeholder="Consent and preferences documented..." required value={data.consent} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Occupational Therapy") {
    return (
      <FormSection description="Record daily living function, cognition, home safety and equipment needs." title="Occupational therapy assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Activities of daily living" onChange={(value) => onChange("adlStatus", value)} placeholder="Dressing, bathing, feeding and toileting..." required value={data.adlStatus} />
          <ClinicalTextArea label="Cognition" onChange={(value) => onChange("cognition", value)} placeholder="Attention, memory, planning and safety awareness..." required value={data.cognition} />
          <ClinicalTextArea label="Home safety" onChange={(value) => onChange("homeSafety", value)} placeholder="Environmental risks and recommended changes..." required value={data.homeSafety} />
          <ClinicalTextArea label="Equipment needs" onChange={(value) => onChange("equipmentNeeds", value)} placeholder="Adaptive equipment and training required..." required value={data.equipmentNeeds} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Speech Therapy") {
    return (
      <FormSection description="Record speech, language, swallowing and aspiration findings." title="Speech therapy assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Speech status" onChange={(value) => onChange("speechStatus", value)} placeholder="Articulation, voice and fluency..." required value={data.speechStatus} />
          <ClinicalTextArea label="Language status" onChange={(value) => onChange("languageStatus", value)} placeholder="Comprehension and expression..." required value={data.languageStatus} />
          <ClinicalTextArea label="Swallowing status" onChange={(value) => onChange("swallowingStatus", value)} placeholder="Swallow assessment and diet texture..." required value={data.swallowingStatus} />
          <ClinicalTextArea label="Aspiration risk" onChange={(value) => onChange("aspirationRisk", value)} placeholder="Risk level, signs and precautions..." required value={data.aspirationRisk} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Psychology") {
    return (
      <FormSection description="Record mental status, risk, intervention and response." title="Psychology assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Mental status" onChange={(value) => onChange("mentalStatus", value)} placeholder="Appearance, mood, thought, cognition and insight..." required value={data.mentalStatus} />
          <ClinicalTextArea label="Risk assessment" onChange={(value) => onChange("psychologicalRisk", value)} placeholder="Self-harm, suicide, violence or vulnerability risk..." required value={data.psychologicalRisk} />
          <ClinicalTextArea label="Psychological intervention" onChange={(value) => onChange("psychologyIntervention", value)} placeholder="Therapeutic intervention delivered..." required value={data.psychologyIntervention} />
          <ClinicalTextArea label="Response to intervention" onChange={(value) => onChange("psychologyResponse", value)} placeholder="Engagement and clinical response..." required value={data.psychologyResponse} />
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection description="Record baseline function, multidisciplinary goals and rehabilitation progress." title="Rehabilitation assessment">
      <div className="grid gap-4 sm:grid-cols-2">
        <ClinicalTextArea label="Functional baseline" onChange={(value) => onChange("functionalBaseline", value)} placeholder="Pre-morbid and current functional baseline..." required value={data.functionalBaseline} />
        <ClinicalTextArea label="Multidisciplinary goals" onChange={(value) => onChange("multidisciplinaryGoals", value)} placeholder="Shared rehabilitation goals..." required value={data.multidisciplinaryGoals} />
        <ClinicalTextArea label="Rehabilitation progress" onChange={(value) => onChange("rehabilitationProgress", value)} placeholder="Progress, barriers and readiness for discharge..." required value={data.rehabilitationProgress} />
      </div>
    </FormSection>
  );
}

function AdditionalProgressFields({
  data,
  isAmendment,
  onChange,
}: {
  data: AdditionalProgressDocumentation;
  isAmendment: boolean;
  onChange: <K extends keyof AdditionalProgressDocumentation>(field: K, value: AdditionalProgressDocumentation[K]) => void;
}) {
  return (
    <>
      <FormSection description="Add structured context only when the main clinical note needs more detail." title="Progress note details">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Reason for note" onChange={(value) => onChange("reasonForNote", value)} placeholder="Why this update is being documented..." value={data.reasonForNote} />
          <ClinicalTextArea label="Current patient condition" onChange={(value) => onChange("currentCondition", value)} placeholder="Current clinical or care status..." value={data.currentCondition} />
          <ClinicalTextArea label="Action taken" onChange={(value) => onChange("actionTaken", value)} placeholder="Action, support or communication completed..." value={data.actionTaken} />
          <ClinicalTextArea label="People informed / involved" onChange={(value) => onChange("peopleInformed", value)} placeholder="Patient, family and care team members involved..." value={data.peopleInformed} />
        </div>
      </FormSection>

      {data.noteType === "General Progress Note" ? (
        <FormSection description="Record a general patient update that does not fit another specific note type." title="General progress update">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="New findings or changes" onChange={(value) => onChange("changesOrFindings", value)} placeholder="Changes since the previous update..." required value={data.changesOrFindings} />
            <ClinicalTextArea label="Patient response" onChange={(value) => onChange("patientResponse", value)} placeholder="Response after the action or intervention..." required value={data.patientResponse} />
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Follow-up Note" ? (
        <FormSection description="Compare the patient's current status with the previous assessment or plan." title="Follow-up review">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="Previous plan / reference" onChange={(value) => onChange("previousPlan", value)} placeholder="Previous treatment or review plan..." required value={data.previousPlan} />
            <ClinicalTextArea label="Current symptoms" onChange={(value) => onChange("currentSymptoms", value)} placeholder="Symptoms reported at follow-up..." required value={data.currentSymptoms} />
            <ClinicalTextArea label="Change since last review" onChange={(value) => onChange("changeSinceReview", value)} placeholder="Improved, unchanged or worsened..." required value={data.changeSinceReview} />
            <ClinicalTextArea label="Treatment compliance" onChange={(value) => onChange("treatmentCompliance", value)} placeholder="Medicine, therapy or advice adherence..." required value={data.treatmentCompliance} />
            <ClinicalTextArea label="Relevant results" onChange={(value) => onChange("relevantResults", value)} placeholder="Relevant observations, tests or measurements..." value={data.relevantResults} />
            <ClinicalTextArea label="Current assessment" onChange={(value) => onChange("currentAssessment", value)} placeholder="Assessment based on this follow-up..." required value={data.currentAssessment} />
            <ClinicalTextArea label="Next action" onChange={(value) => onChange("nextAction", value)} placeholder="Treatment, monitoring or appointment plan..." required value={data.nextAction} />
            <FormField label="Escalation required">
              <SearchableSelect
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("escalationRequired", event.target.value)}
                value={data.escalationRequired}
              >
                <option>No</option>
                <option>Yes</option>
              </SearchableSelect>
            </FormField>
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Care Coordination Note" ? (
        <FormSection description="Document decisions, ownership and services needed across the care team." title="Care coordination">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="Coordination reason" onChange={(value) => onChange("coordinationReason", value)} placeholder="Why coordination is required..." required value={data.coordinationReason} />
            <ClinicalTextArea label="Current care needs" onChange={(value) => onChange("currentCareNeeds", value)} placeholder="Clinical, functional and social care needs..." required value={data.currentCareNeeds} />
            <ClinicalTextArea label="Teams / professionals involved" onChange={(value) => onChange("teamsInvolved", value)} placeholder="Teams and named professionals involved..." required value={data.teamsInvolved} />
            <ClinicalTextArea label="Patient / family involvement" onChange={(value) => onChange("patientFamilyInvolvement", value)} placeholder="Preferences, participation and agreement..." required value={data.patientFamilyInvolvement} />
            <ClinicalTextArea label="Discussion summary" onChange={(value) => onChange("discussionSummary", value)} placeholder="Key points discussed..." required value={data.discussionSummary} />
            <ClinicalTextArea label="Decisions made" onChange={(value) => onChange("decisionsMade", value)} placeholder="Agreed care decisions..." required value={data.decisionsMade} />
            <ClinicalTextArea label="Actions assigned" onChange={(value) => onChange("assignedActions", value)} placeholder="Tasks and actions assigned..." required value={data.assignedActions} />
            <FormField label="Responsible person">
              <Input onChange={(event) => onChange("responsiblePerson", event.target.value)} placeholder="Person or team responsible" required value={data.responsiblePerson} />
            </FormField>
            <FormField label="Target date">
              <Input onChange={(event) => onChange("targetDate", event.target.value)} required type="date" value={data.targetDate} />
            </FormField>
            <ClinicalTextArea label="Referral / service required" onChange={(value) => onChange("referralRequired", value)} placeholder="Referral, equipment or external service needed..." value={data.referralRequired} />
            <ClinicalTextArea label="Discharge barriers" onChange={(value) => onChange("dischargeBarriers", value)} placeholder="Barriers affecting safe discharge..." value={data.dischargeBarriers} />
            <FormField label="Follow-up status">
              <SearchableSelect
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("followUpStatus", event.target.value)}
                value={data.followUpStatus}
              >
                <option>Pending</option>
                <option>In progress</option>
                <option>Completed</option>
                <option>Blocked</option>
              </SearchableSelect>
            </FormField>
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Patient Education Note" ? (
        <FormSection description="Record what was taught and confirm the patient or caregiver understood it." title="Patient education">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Education topic">
              <Input onChange={(event) => onChange("educationTopic", event.target.value)} placeholder="Medicine, wound care, diet..." required value={data.educationTopic} />
            </FormField>
            <FormField label="Education provided to">
              <Input onChange={(event) => onChange("educationProvidedTo", event.target.value)} placeholder="Patient, caregiver or family member" required value={data.educationProvidedTo} />
            </FormField>
            <FormField label="Teaching method">
              <SearchableSelect
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("teachingMethod", event.target.value)}
                value={data.teachingMethod}
              >
                <option>Verbal explanation</option>
                <option>Demonstration</option>
                <option>Written material</option>
                <option>Video</option>
                <option>Interpreter-assisted</option>
                <option>Teach-back</option>
              </SearchableSelect>
            </FormField>
            <FormField label="Material / language used">
              <Input onChange={(event) => onChange("materialLanguage", event.target.value)} placeholder="Material and preferred language" value={data.materialLanguage} />
            </FormField>
            <ClinicalTextArea label="Information explained" onChange={(value) => onChange("informationExplained", value)} placeholder="Key instructions and safety information..." required value={data.informationExplained} />
            <ClinicalTextArea label="Patient understanding" onChange={(value) => onChange("patientUnderstanding", value)} placeholder="Level of understanding demonstrated..." required value={data.patientUnderstanding} />
            <ClinicalTextArea label="Teach-back result" onChange={(value) => onChange("teachBackResult", value)} placeholder="What the patient repeated or demonstrated..." required value={data.teachBackResult} />
            <ClinicalTextArea label="Barriers to learning" onChange={(value) => onChange("learningBarriers", value)} placeholder="Language, hearing, cognition, distress..." value={data.learningBarriers} />
            <FormField label="Interpreter required">
              <SearchableSelect
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("interpreterRequired", event.target.value)}
                value={data.interpreterRequired}
              >
                <option>No</option>
                <option>Yes</option>
              </SearchableSelect>
            </FormField>
            <ClinicalTextArea label="Questions raised" onChange={(value) => onChange("questionsRaised", value)} placeholder="Patient or caregiver questions..." value={data.questionsRaised} />
            <ClinicalTextArea label="Additional education required" onChange={(value) => onChange("additionalEducation", value)} placeholder="Further teaching or reinforcement required..." value={data.additionalEducation} />
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Phone Call Note" ? (
        <CommunicationFields data={data} onChange={onChange} />
      ) : null}

      {data.noteType === "Family Meeting Notes" ? (
        <>
          <CommunicationFields data={data} onChange={onChange} />
          <FormSection description="Confirm consent and record the discussion and decisions made with the family." title="Family meeting">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Patient consent to share information">
                <SearchableSelect
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => onChange("patientConsent", event.target.value)}
                  value={data.patientConsent}
                >
                  <option>Not recorded</option>
                  <option>Confirmed</option>
                  <option>Not required</option>
                  <option>Declined</option>
                </SearchableSelect>
              </FormField>
              <ClinicalTextArea label="Information shared" onChange={(value) => onChange("informationShared", value)} placeholder="Clinical or care information shared..." required value={data.informationShared} />
              <ClinicalTextArea label="Family questions / concerns" onChange={(value) => onChange("familyConcerns", value)} placeholder="Questions, concerns and decisions..." required value={data.familyConcerns} />
            </div>
          </FormSection>
        </>
      ) : null}

      {data.noteType === "Handover Note" ? (
        <FormSection description="Use SBAR to transfer important information safely to the next clinician or team." title="Clinical handover">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Handover from">
              <Input onChange={(event) => onChange("handoverFrom", event.target.value)} required value={data.handoverFrom} />
            </FormField>
            <FormField label="Handover to">
              <Input onChange={(event) => onChange("handoverTo", event.target.value)} required value={data.handoverTo} />
            </FormField>
            <FormField label="Handover date and time">
              <Input onChange={(event) => onChange("handoverDateTime", event.target.value)} required type="datetime-local" value={data.handoverDateTime} />
            </FormField>
            <FormField label="Acknowledgement received">
              <SearchableSelect
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("acknowledgementReceived", event.target.value)}
                value={data.acknowledgementReceived}
              >
                <option>No</option>
                <option>Yes</option>
              </SearchableSelect>
            </FormField>
            <ClinicalTextArea label="Situation" onChange={(value) => onChange("situation", value)} placeholder="Immediate issue and current situation..." required value={data.situation} />
            <ClinicalTextArea label="Background" onChange={(value) => onChange("background", value)} placeholder="Relevant history and treatment..." required value={data.background} />
            <ClinicalTextArea label="Assessment" onChange={(value) => onChange("handoverAssessment", value)} placeholder="Current assessment and risks..." required value={data.handoverAssessment} />
            <ClinicalTextArea label="Recommendation" onChange={(value) => onChange("recommendation", value)} placeholder="Required monitoring and next actions..." required value={data.recommendation} />
            <ClinicalTextArea label="Pending tasks" onChange={(value) => onChange("pendingTasks", value)} placeholder="Outstanding tests, referrals or treatment..." required value={data.pendingTasks} />
            <ClinicalTextArea label="Safety concerns" onChange={(value) => onChange("safetyConcerns", value)} placeholder="Immediate safety concerns and precautions..." required value={data.safetyConcerns} />
            <ClinicalTextArea label="Escalation criteria" onChange={(value) => onChange("escalationCriteria", value)} placeholder="When and whom to contact..." required value={data.escalationCriteria} />
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Case Management Note" ? (
        <FormSection description="Document case needs, services, barriers, resources and agreed outcomes." title="Case management">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="Case needs" onChange={(value) => onChange("caseNeeds", value)} placeholder="Clinical, social and discharge needs..." required value={data.caseNeeds} />
            <ClinicalTextArea label="Services involved" onChange={(value) => onChange("servicesInvolved", value)} placeholder="Hospital and community services involved..." required value={data.servicesInvolved} />
            <ClinicalTextArea label="Barriers" onChange={(value) => onChange("caseBarriers", value)} placeholder="Barriers affecting the care plan..." required value={data.caseBarriers} />
            <ClinicalTextArea label="Resource plan" onChange={(value) => onChange("resourcePlan", value)} placeholder="Resources, referrals and funding plan..." required value={data.resourcePlan} />
            <ClinicalTextArea label="Case outcome / next step" onChange={(value) => onChange("caseOutcome", value)} placeholder="Agreed outcome and next case-management step..." required value={data.caseOutcome} />
          </div>
        </FormSection>
      ) : null}

      {isAmendment ? (
        <FormSection description="Explain why this previously signed note is being corrected or updated." title="Amendment" tone="warning">
          <ClinicalTextArea label="Amendment reason" onChange={(value) => onChange("amendmentReason", value)} placeholder="Reason for correcting or adding information..." required value={data.amendmentReason} />
        </FormSection>
      ) : null}
    </>
  );
}

function CommunicationFields({
  data,
  onChange,
}: {
  data: AdditionalProgressDocumentation;
  onChange: <K extends keyof AdditionalProgressDocumentation>(field: K, value: AdditionalProgressDocumentation[K]) => void;
}) {
  return (
    <FormSection description="Record who was contacted, identity checks, advice given and the outcome." title="Telephone communication">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Call direction">
          <SearchableSelect
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("callDirection", event.target.value)}
            value={data.callDirection}
          >
            <option>Incoming</option>
            <option>Outgoing</option>
          </SearchableSelect>
        </FormField>
        <FormField label="Call date and time">
          <Input onChange={(event) => onChange("callDateTime", event.target.value)} required type="datetime-local" value={data.callDateTime} />
        </FormField>
        <FormField label="Caller / recipient">
          <Input onChange={(event) => onChange("callerRecipient", event.target.value)} placeholder="Name of person contacted" required value={data.callerRecipient} />
        </FormField>
        <FormField label="Relationship to patient">
          <Input onChange={(event) => onChange("relationshipToPatient", event.target.value)} placeholder="Patient, spouse, caregiver..." required value={data.relationshipToPatient} />
        </FormField>
        <FormField label="Contact number">
          <Input onChange={(event) => onChange("contactNumber", event.target.value)} placeholder="Prefer masked number" value={data.contactNumber} />
        </FormField>
        <FormField label="Identity verified">
          <SearchableSelect
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("identityVerified", event.target.value)}
            value={data.identityVerified}
          >
            <option>No</option>
            <option>Yes</option>
          </SearchableSelect>
        </FormField>
        <ClinicalTextArea label="Reason for call" onChange={(value) => onChange("callReason", value)} placeholder="Reason for the communication..." required value={data.callReason} />
        <ClinicalTextArea label="Discussion summary" onChange={(value) => onChange("discussionSummary", value)} placeholder="Important details discussed..." required value={data.discussionSummary} />
        <ClinicalTextArea label="Clinical advice provided" onChange={(value) => onChange("clinicalAdvice", value)} placeholder="Advice, warning signs and instructions..." required value={data.clinicalAdvice} />
        <ClinicalTextArea label="Action agreed" onChange={(value) => onChange("actionAgreed", value)} placeholder="Agreed action and responsibility..." required value={data.actionAgreed} />
        <FormField label="Urgency">
          <SearchableSelect
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("urgency", event.target.value)}
            value={data.urgency}
          >
            <option>Routine</option>
            <option>Urgent</option>
            <option>Immediate</option>
          </SearchableSelect>
        </FormField>
        <FormField label="Call outcome">
          <SearchableSelect
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("callOutcome", event.target.value)}
            value={data.callOutcome}
          >
            <option>Completed</option>
            <option>No answer</option>
            <option>Voicemail left</option>
            <option>Call disconnected</option>
            <option>Follow-up required</option>
            <option>Escalated</option>
          </SearchableSelect>
        </FormField>
        <FormField label="Escalation required">
          <SearchableSelect
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("escalationRequired", event.target.value)}
            value={data.escalationRequired}
          >
            <option>No</option>
            <option>Yes</option>
          </SearchableSelect>
        </FormField>
      </div>
    </FormSection>
  );
}

function NoteDetailsModal({
  note,
  onDelete,
  onEdit,
  onOpenChange,
}: {
  note: Note | null;
  onDelete: (note: Note) => void;
  onEdit: (note: Note) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <CenterModal
      className="w-[min(94vw,880px)]"
      description={note ? `${getCategoryDisplayLabel(note.category)} / ${note.specialty}` : undefined}
      onOpenChange={onOpenChange}
      open={Boolean(note)}
      title={note?.title ?? "Note Details"}
    >
      {note ? (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-md border border-border bg-surface-muted/45 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailField label="Author" value={note.author} />
            <DetailField label="Date & Time" value={note.date} />
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground">Status</div>
              <div className="mt-1"><StatusLabel status={note.status} /></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground">Priority</div>
              <div className="mt-1 text-xs"><PriorityLabel priority={note.priority} /></div>
            </div>
          </div>
          {note.category === "Medical Notes" ? (
            <>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground">Medical Document Context</h4>
                <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailField label="Medical Note Type" value={getNoteType(note)} />
                  <DetailField label="Medical Notes Tab" value={note.medicalNoteSection ?? "ED Notes"} />
                  <DetailField label="Date & Time" value={formatServiceDateTime(note.serviceDateTime)} />
                  <DetailField label="Patient ID" value={note.patientId || "Not linked"} />
                  <DetailField label="Encounter ID" value={note.encounterId || "Not linked"} />
                  <DetailField label="Authenticated Signer" value={note.authenticatedSigner || note.signedBy || "Not authenticated"} />
                  <DetailField label="FHIR Document Target" value="DocumentReference" />
                  <DetailField label="Diagnosis Target" value="Condition" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground">Diagnoses</h4>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <NarrativeField label="Primary Diagnosis" value={note.primaryDiagnosis} />
                  <NarrativeField label="Secondary Diagnoses" value={note.secondaryDiagnoses} />
                </div>
              </div>
              {hasStructuredMedicalNote(note) ? (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground">Structured Medical Documentation</h4>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <NarrativeField label="Subjective" value={note.subjective} />
                    <NarrativeField label="Objective" value={note.objective} />
                    <NarrativeField label="Assessment" value={note.medicalAssessment} />
                    <NarrativeField label="Treatment Plan" value={note.plan} />
                  </div>
                </div>
              ) : null}
              {note.amendmentReason ? (
                <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
                  <div className="text-[11px] font-semibold text-warning">Amendment Reason</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm leading-5">{note.amendmentReason}</div>
                </div>
              ) : null}
            </>
          ) : null}
          {note.category === "Surgery Notes" ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground">Surgery Document Context</h4>
              <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailField label="Surgery Note Type" value={getNoteType(note)} />
                <DetailField label="Specialty" value={note.specialty} />
                {note.specialty === "Transplant Surgery" ? (
                  <DetailField label="Transplant Type" value={note.transplantType || "Not recorded"} />
                ) : null}
                <DetailField label="Date & Time" value={formatServiceDateTime(note.serviceDateTime)} />
                <DetailField label="Authenticated Signer" value={note.authenticatedSigner || note.signedBy || "Not authenticated"} />
              </div>
            </div>
          ) : null}
          {note.category === "Operative Notes" && note.operative ? <OperativeNoteDetails note={note} /> : null}
          {note.category === "Pharmacy Notes" && note.pharmacy ? <PharmacyNoteDetails note={note} /> : null}
          {note.category === "Allied Health Notes" && note.alliedHealth ? <AlliedHealthNoteDetails note={note} /> : null}
          {note.additionalProgress ? <AdditionalProgressNoteDetails note={note} /> : null}
          {hasStructuredObservations(note) ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground">Structured Observations</h4>
              <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailField label="Pulse" value={note.pulse ? `${note.pulse} beats/min` : "Not recorded"} />
                <DetailField label="Blood Pressure" value={formatBloodPressure(note)} />
                <DetailField label="Pain Score" value={formatPainAssessment(note)} />
                <DetailField label="Temperature" value={note.temperature ? `${note.temperature} °C` : "Not recorded"} />
                <DetailField label="Respiratory Rate" value={note.respiratoryRate ? `${note.respiratoryRate} breaths/min` : "Not recorded"} />
                <DetailField label="SpO₂" value={note.spo2 ? `${note.spo2}%` : "Not recorded"} />
                <DetailField
                  label="Glucose"
                  value={
                    note.glucoseUnit === "mmol/L"
                      ? note.glucoseMmolL
                        ? `${note.glucoseMmolL} mmol/L`
                        : "Not recorded"
                      : note.glucose
                        ? `${note.glucose} mg/dL`
                        : note.glucoseMmolL
                          ? `${note.glucoseMmolL} mmol/L`
                          : "Not recorded"
                  }
                />
                <DetailField label="Consciousness Level" value={note.consciousnessLevel || "Not recorded"} />
                <DetailField label="Patient Position" value={note.patientPosition || "Not recorded"} />
                <DetailField label="FHIR target" value="Observation" />
              </div>
              {note.painAssessment && note.painAssessment.scale !== "NRS" ? <PainAssessmentDetails assessment={note.painAssessment} /> : null}
            </div>
          ) : null}
          {hasStructuredNursingNote(note) ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground">Structured Nursing Documentation</h4>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <NarrativeField label="Assessment" value={note.assessment} />
                <NarrativeField label="Intervention" value={note.intervention} />
                <NarrativeField label="Patient Response" value={note.patientResponse} />
                <NarrativeField label="Safety / Risk" value={note.safetyRisk} />
                <NarrativeField label="Communication" value={note.communication} />
                <NarrativeField label="Follow-up Plan" value={note.followUpPlan} />
              </div>
            </div>
          ) : null}
          {note.content || (!hasStructuredNursingNote(note) && !hasStructuredObservations(note) && !hasStructuredMedicalNote(note) && !note.pharmacy && !note.alliedHealth && !note.additionalProgress && !note.operative) ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground">
                {hasStructuredNursingNote(note) || hasStructuredMedicalNote(note) || note.pharmacy || note.alliedHealth || note.additionalProgress || note.operative
                  ? "Additional Narrative"
                  : note.category === "Nurse Notes"
                    ? "Nursing Note"
                    : "Clinical Note"}
              </h4>
              <div className="mt-2 min-h-28 whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm leading-6">
                {note.content || "No clinical narrative was added to this demo note."}
              </div>
            </div>
          ) : null}
          <SignatureSummary note={note} />
          <div className="flex justify-between gap-2 border-t border-border pt-4">
            <Button onClick={() => onDelete(note)} type="button" variant="danger">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button onClick={() => onEdit(note)} type="button">
              <FilePenLine className="h-4 w-4" /> Edit Note
            </Button>
          </div>
        </div>
      ) : null}
    </CenterModal>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-xs font-medium">{value}</div>
    </div>
  );
}

function NarrativeField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm leading-5">{value || "Not recorded"}</div>
    </div>
  );
}

function PainAssessmentDetails({ assessment }: { assessment: PainAssessment }) {
  const domains =
    assessment.scale === "CPOT"
      ? [
          ...cpotDomains,
          {
            key: "cpotDomain4" as PainDomainKey,
            label: assessment.airwayStatus === "INTUBATED" ? "Ventilator compliance" : "Vocalization",
            options: assessment.airwayStatus === "INTUBATED" ? cpotVentilatorOptions : cpotVocalizationOptions,
          },
        ]
      : flaccDomains;

  return (
    <div className="mt-3 rounded-md border border-border bg-background p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-xs font-semibold">{assessment.scale} observations</h5>
        <span className="text-xs font-semibold text-primary">
          {assessment.total !== undefined ? `${assessment.total}/${assessment.scale === "CPOT" ? 8 : 10}` : "Incomplete"}
          {assessment.severity ? ` - ${assessment.severity}` : ""}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {domains.map((domain) => {
          const score = assessment.scores[domain.key];
          const option = domain.options.find((item) => item.score === score);
          return (
            <div className="rounded border border-border bg-surface-muted/40 p-2.5" key={domain.key}>
              <div className="text-[11px] font-semibold text-muted-foreground">{domain.label}</div>
              <div className="mt-1 text-xs font-medium">
                {option ? `${option.score} - ${option.label}` : "Not recorded"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PatientVisitDetails({ note }: { note: Note }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground">Patient and Visit Details</h4>
      <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailField label="Patient ID" value={note.patientId || "Not linked"} />
        <DetailField label="Visit ID" value={note.encounterId || "Not linked"} />
        <DetailField label="Signing Clinician" value={note.authenticatedSigner || note.signedBy || "Not authenticated"} />
      </div>
    </div>
  );
}

function OperativeNoteDetails({ note }: { note: Note }) {
  const operative = note.operative;
  if (!operative) return null;

  const duration =
    operative.duration ||
    [
      operative.durationHours ? `${operative.durationHours} hour(s)` : "",
      operative.durationMinutes ? `${operative.durationMinutes} minute(s)` : "",
    ].filter(Boolean).join(" ") ||
    "Not recorded";

  return (
    <>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Operation Details</h4>
        <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Specialty" value={note.specialty} />
          <DetailField label="Surgeon Name" value={operative.surgeonName || "Not recorded"} />
          <DetailField label="Assistant Name" value={operative.assistantName || "Not recorded"} />
          <DetailField label="OT Nurse Name" value={operative.otNurseName || "Not recorded"} />
          <DetailField label="Name of Surgery" value={operative.surgeryName || "Not recorded"} />
          <DetailField label="Duration" value={duration} />
          <DetailField label="Date" value={formatServiceDateTime(operative.operativeDate)} />
          <DetailField label="Authenticated Signer" value={note.authenticatedSigner || note.signedBy || "Not authenticated"} />
        </div>
      </div>
      <div>
        <div className="grid gap-3 sm:grid-cols-2">
          <NarrativeField label="Operative Findings" value={operative.operativeFindings} />
          <NarrativeField label="Plan" value={operative.plan} />
        </div>
      </div>
    </>
  );
}

function PharmacyNoteDetails({ note }: { note: Note }) {
  const pharmacy = note.pharmacy;
  if (!pharmacy) return null;
  return (
    <>
      <PatientVisitDetails note={note} />
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Medication Reconciliation</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <NarrativeField label="Past Medicine" value={pharmacy.medicationPreviousToAdmission} />
          <NarrativeField label="Medication Currently" value={pharmacy.medicationCurrently} />
          <NarrativeField label="Medication at Discharge" value={pharmacy.medicationAtDischarge} />
        </div>
        <div className="mt-3 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Note Type" value={pharmacy.noteType} />
          <DetailField label="Medication" value={pharmacy.medicationName || "Not recorded"} />
          <DetailField label="Medication Code" value={pharmacy.medicationCode || "Not recorded"} />
          <DetailField label="Status" value={pharmacy.medicationStatus} />
          <DetailField label="Dose" value={[pharmacy.dose, pharmacy.doseUnit].filter(Boolean).join(" ") || "Not recorded"} />
          <DetailField label="Route" value={pharmacy.route || "Not recorded"} />
          <DetailField label="Frequency" value={pharmacy.frequency || "Not recorded"} />
          <DetailField label="Treatment Period" value={`${pharmacy.startDate || "Not set"} to ${pharmacy.endDate || "Ongoing"}`} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Medication Review and Intervention</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <NarrativeField label="Review Reason" value={pharmacy.reviewReason} />
          <NarrativeField label="Clinical Indication" value={pharmacy.clinicalIndication} />
          <NarrativeField label="Medication Problem" value={pharmacy.medicationProblem} />
          <NarrativeField label="Interaction / Issue Severity" value={pharmacy.interactionSeverity} />
          <NarrativeField label="Relevant Allergies" value={pharmacy.relevantAllergy} />
          <NarrativeField label="Relevant Labs / Observations" value={pharmacy.relevantLabs} />
          <NarrativeField label="Pharmacist Recommendation" value={pharmacy.recommendation} />
          <NarrativeField label="Prescriber Response" value={pharmacy.prescriberResponse} />
          <NarrativeField label="Recommendation Outcome" value={pharmacy.recommendationOutcome} />
          <NarrativeField label="Outcome / Follow-up" value={pharmacy.followUp} />
        </div>
      </div>
    </>
  );
}

function AlliedHealthNoteDetails({ note }: { note: Note }) {
  const allied = note.alliedHealth;
  if (!allied) return null;
  const specialtyDetails = getAlliedSpecialtyDetails(note.specialty, allied);
  return (
    <>
      <PatientVisitDetails note={note} />
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Session Details</h4>
        <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Note Type" value={allied.noteType} />
          <DetailField label="Specialty" value={note.specialty} />
          <DetailField label="Date & Time" value={formatServiceDateTime(allied.sessionDateTime)} />
          <DetailField label="Duration" value={allied.sessionDuration || "Not recorded"} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Allied Health Documentation</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <NarrativeField label="Referral / Reason for Review" value={allied.referralReason} />
          <NarrativeField label="Initial Assessment" value={allied.initialAssessment} />
          <NarrativeField label="Functional Status" value={allied.functionalStatus} />
          <NarrativeField label="Identified Problems" value={allied.identifiedProblems} />
          <NarrativeField label="Intervention Delivered" value={allied.intervention} />
          <NarrativeField label="Patient Response" value={allied.patientResponse} />
          <NarrativeField label="Goals" value={allied.goals} />
          <NarrativeField label="Progress Toward Goals" value={allied.goalProgress} />
          <NarrativeField label="Education Provided" value={allied.educationProvided} />
          <NarrativeField label="Plan" value={allied.followUpPlan} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">{note.specialty} Assessment</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {specialtyDetails.map((item) => <NarrativeField key={item.label} label={item.label} value={item.value} />)}
        </div>
      </div>
    </>
  );
}

function AdditionalProgressNoteDetails({ note }: { note: Note }) {
  const data = note.additionalProgress;
  if (!data) return null;
  const typeDetails = getAdditionalProgressDetails(data);
  return (
    <>
      <PatientVisitDetails note={note} />
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Special Instruction Details</h4>
        <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Note Type" value={data.noteType} />
          <DetailField label="Date & Time" value={formatServiceDateTime(note.serviceDateTime)} />
          <DetailField label="Follow-up Required" value={data.followUpRequired} />
          <DetailField label="Follow-up Date" value={data.followUpDate || "Not scheduled"} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Current Update</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <NarrativeField label="Reason for Note" value={data.reasonForNote} />
          <NarrativeField label="Current Patient Condition" value={data.currentCondition} />
          <NarrativeField label="Action Taken" value={data.actionTaken} />
          <NarrativeField label="People Informed / Involved" value={data.peopleInformed} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">{data.noteType}</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {typeDetails.map((item) => <NarrativeField key={item.label} label={item.label} value={item.value} />)}
        </div>
      </div>
      {data.amendmentReason ? (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
          <div className="text-[11px] font-semibold text-warning">Amendment Reason</div>
          <div className="mt-1 whitespace-pre-wrap text-sm leading-5">{data.amendmentReason}</div>
        </div>
      ) : null}
    </>
  );
}

function getAdditionalProgressDetails(data: AdditionalProgressDocumentation) {
  if (data.noteType === "General Progress Note") {
    return [
      { label: "New Findings or Changes", value: data.changesOrFindings },
      { label: "Patient Response", value: data.patientResponse },
    ];
  }
  if (data.noteType === "Follow-up Note") {
    return [
      { label: "Previous Plan / Reference", value: data.previousPlan },
      { label: "Current Symptoms", value: data.currentSymptoms },
      { label: "Change Since Last Review", value: data.changeSinceReview },
      { label: "Treatment Compliance", value: data.treatmentCompliance },
      { label: "Relevant Results", value: data.relevantResults },
      { label: "Current Assessment", value: data.currentAssessment },
      { label: "Next Action", value: data.nextAction },
      { label: "Escalation Required", value: data.escalationRequired },
    ];
  }
  if (data.noteType === "Care Coordination Note") {
    return [
      { label: "Coordination Reason", value: data.coordinationReason },
      { label: "Current Care Needs", value: data.currentCareNeeds },
      { label: "Teams / Professionals Involved", value: data.teamsInvolved },
      { label: "Patient / Family Involvement", value: data.patientFamilyInvolvement },
      { label: "Discussion Summary", value: data.discussionSummary },
      { label: "Decisions Made", value: data.decisionsMade },
      { label: "Actions Assigned", value: data.assignedActions },
      { label: "Responsible Person", value: data.responsiblePerson },
      { label: "Target Date", value: data.targetDate },
      { label: "Referral / Service Required", value: data.referralRequired },
      { label: "Discharge Barriers", value: data.dischargeBarriers },
      { label: "Follow-up Status", value: data.followUpStatus },
    ];
  }
  if (data.noteType === "Patient Education Note") {
    return [
      { label: "Education Topic", value: data.educationTopic },
      { label: "Education Provided To", value: data.educationProvidedTo },
      { label: "Teaching Method", value: data.teachingMethod },
      { label: "Material / Language Used", value: data.materialLanguage },
      { label: "Information Explained", value: data.informationExplained },
      { label: "Patient Understanding", value: data.patientUnderstanding },
      { label: "Teach-back Result", value: data.teachBackResult },
      { label: "Barriers to Learning", value: data.learningBarriers },
      { label: "Interpreter Required", value: data.interpreterRequired },
      { label: "Questions Raised", value: data.questionsRaised },
      { label: "Additional Education Required", value: data.additionalEducation },
    ];
  }
  if (data.noteType === "Phone Call Note" || data.noteType === "Family Meeting Notes") {
    const communicationDetails = [
      { label: "Call Direction", value: data.callDirection },
      { label: "Call Date & Time", value: formatServiceDateTime(data.callDateTime) },
      { label: "Caller / Recipient", value: data.callerRecipient },
      { label: "Relationship to Patient", value: data.relationshipToPatient },
      { label: "Contact Number", value: data.contactNumber },
      { label: "Identity Verified", value: data.identityVerified },
      { label: "Reason for Call", value: data.callReason },
      { label: "Discussion Summary", value: data.discussionSummary },
      { label: "Clinical Advice Provided", value: data.clinicalAdvice },
      { label: "Action Agreed", value: data.actionAgreed },
      { label: "Urgency", value: data.urgency },
      { label: "Call Outcome", value: data.callOutcome },
      { label: "Escalation Required", value: data.escalationRequired },
    ];
    if (data.noteType === "Family Meeting Notes") {
      communicationDetails.push(
        { label: "Patient Consent", value: data.patientConsent },
        { label: "Information Shared", value: data.informationShared },
        { label: "Family Questions / Concerns", value: data.familyConcerns },
      );
    }
    return communicationDetails;
  }
  if (data.noteType === "Handover Note") {
    return [
      { label: "Handover From", value: data.handoverFrom },
      { label: "Handover To", value: data.handoverTo },
      { label: "Handover Date & Time", value: formatServiceDateTime(data.handoverDateTime) },
      { label: "Situation", value: data.situation },
      { label: "Background", value: data.background },
      { label: "Assessment", value: data.handoverAssessment },
      { label: "Recommendation", value: data.recommendation },
      { label: "Pending Tasks", value: data.pendingTasks },
      { label: "Safety Concerns", value: data.safetyConcerns },
      { label: "Escalation Criteria", value: data.escalationCriteria },
      { label: "Acknowledgement Received", value: data.acknowledgementReceived },
    ];
  }
  return [
    { label: "Case Needs", value: data.caseNeeds },
    { label: "Services Involved", value: data.servicesInvolved },
    { label: "Barriers", value: data.caseBarriers },
    { label: "Resource Plan", value: data.resourcePlan },
    { label: "Case Outcome / Next Step", value: data.caseOutcome },
  ];
}

function getAlliedSpecialtyDetails(specialty: string, data: AlliedHealthDocumentation) {
  if (specialty === "Physiotherapy") {
    return [
      { label: "Mobility Status", value: data.mobilityStatus },
      { label: "Range of Motion", value: data.rangeOfMotion },
      { label: "Muscle Strength", value: data.muscleStrength },
      { label: "Balance", value: data.balance },
      { label: "Gait", value: data.gait },
      { label: "Transfer Ability", value: data.transferAbility },
      { label: "Walking Distance", value: data.walkingDistance },
      { label: "Assistive Device", value: data.assistiveDevice },
      { label: "Pain Score", value: data.painScore ? `${data.painScore}/10` : "" },
      { label: "Fall Risk", value: data.fallRisk },
      { label: "Exercise / Intervention", value: data.exerciseIntervention },
      { label: "Patient Tolerance", value: data.patientTolerance },
      { label: "Next-session Plan", value: data.nextSessionPlan },
    ];
  }
  if (specialty === "Dietitian") {
    return [
      { label: "Current Weight", value: data.currentWeight ? `${data.currentWeight} kg` : "" },
      { label: "Height", value: data.height ? `${data.height} cm` : "" },
      { label: "BMI", value: data.bmi },
      { label: "Weight Change", value: data.weightChange },
      { label: "Dietary Intake", value: data.dietaryIntake },
      { label: "Appetite", value: data.appetite },
      { label: "Nutrition Diagnosis", value: data.nutritionDiagnosis },
      { label: "Calorie Requirement", value: data.calorieRequirement },
      { label: "Protein Requirement", value: data.proteinRequirement },
      { label: "Nutrition Intervention", value: data.nutritionIntervention },
      { label: "Diet Recommendation", value: data.dietRecommendation },
      { label: "Supplement / Feed Plan", value: data.supplementPlan },
      { label: "Monitoring Plan", value: data.monitoringPlan },
    ];
  }
  if (specialty === "Social Worker") {
    return [
      { label: "Family / Support System", value: data.supportSystem },
      { label: "Living Arrangement", value: data.livingArrangement },
      { label: "Financial Concerns", value: data.financialConcerns },
      { label: "Safeguarding Risk", value: data.safeguardingRisk },
      { label: "Psychosocial Concerns", value: data.psychosocialConcerns },
      { label: "Discharge Barriers", value: data.dischargeBarriers },
      { label: "Community Resources", value: data.communityResources },
      { label: "Referrals Made", value: data.referralsMade },
      { label: "Patient / Family Consent", value: data.consent },
    ];
  }
  if (specialty === "Occupational Therapy") {
    return [
      { label: "Activities of Daily Living", value: data.adlStatus },
      { label: "Cognition", value: data.cognition },
      { label: "Home Safety", value: data.homeSafety },
      { label: "Equipment Needs", value: data.equipmentNeeds },
    ];
  }
  if (specialty === "Speech Therapy") {
    return [
      { label: "Speech Status", value: data.speechStatus },
      { label: "Language Status", value: data.languageStatus },
      { label: "Swallowing Status", value: data.swallowingStatus },
      { label: "Aspiration Risk", value: data.aspirationRisk },
    ];
  }
  if (specialty === "Psychology") {
    return [
      { label: "Mental Status", value: data.mentalStatus },
      { label: "Risk Assessment", value: data.psychologicalRisk },
      { label: "Psychological Intervention", value: data.psychologyIntervention },
      { label: "Response to Intervention", value: data.psychologyResponse },
    ];
  }
  return [
    { label: "Functional Baseline", value: data.functionalBaseline },
    { label: "Multidisciplinary Goals", value: data.multidisciplinaryGoals },
    { label: "Rehabilitation Progress", value: data.rehabilitationProgress },
  ];
}

function SignatureSummary({ note }: { note: Note }) {
  if (note.status !== "Signed") return null;
  const signedAt = note.signedAt ? new Date(note.signedAt).toLocaleString("en-GB") : "";
  return (
    <div className={cn("rounded-md border p-3", note.signatureAttested ? "border-success/30 bg-success/10" : "border-warning/30 bg-warning/10")}>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <ShieldCheck className="h-4 w-4" />
        {note.signatureAttested ? "Electronically signed" : "Signature attestation missing"}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {note.signatureAttested
          ? `Signed by ${note.signedBy} on ${signedAt}.`
          : "This legacy/demo note is marked Signed but has no verified signer attestation."}
      </p>
    </div>
  );
}

function hasStructuredNursingNote(note: Note) {
  return Boolean(note.assessment || note.intervention || note.patientResponse || note.safetyRisk || note.communication || note.followUpPlan);
}

function hasStructuredMedicalNote(note: Note) {
  return Boolean(note.subjective || note.objective || note.medicalAssessment || note.plan);
}

function hasStructuredObservations(note: Note) {
  return Boolean(
    note.bloodPressureSystolic ||
      note.bloodPressureDiastolic ||
      note.pulse ||
      note.painScore ||
      note.painAssessment ||
      note.temperature ||
      note.respiratoryRate ||
      note.spo2 ||
      note.glucose ||
      note.glucoseMmolL ||
      note.consciousnessLevel ||
      note.patientPosition,
  );
}

function formatBloodPressure(note: Note) {
  if (!note.bloodPressureSystolic && !note.bloodPressureDiastolic) return "Not recorded";
  return `${note.bloodPressureSystolic || "--"}/${note.bloodPressureDiastolic || "--"} mmHg`;
}

function formatPainAssessment(note: Note) {
  if (!note.painScore) return "Not recorded";
  const scale = note.painAssessment?.scale ?? "NRS";
  const maxScore = scale === "CPOT" ? 8 : 10;
  const severity = note.painAssessment?.severity ?? getPainSeverity(scale, Number(note.painScore));
  return `${scale} ${note.painScore}/${maxScore}${severity ? ` - ${severity}` : ""}`;
}

function formatServiceDateTime(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-GB");
}

function NotesTable({ actions, notes: rows, compact = false }: { actions: NoteTableActions; notes: Note[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse text-xs">
        <thead className="bg-surface-muted/70 text-muted-foreground">
          <tr>
            {["Note Title", "Category", "Specialty", "Author", "Date & Time", "Status", "Priority", "Actions"].map((heading) => (
              <th className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold" key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((note) => (
            <tr className="transition hover:bg-surface-muted/50" key={note.id}>
              <td className="border-b border-border px-3 py-2.5 font-medium">{note.title}</td>
              <td className="border-b border-border px-3 py-2.5 text-muted-foreground">{getCategoryDisplayLabel(note.category)}</td>
              <td className="border-b border-border px-3 py-2.5">{note.specialty}</td>
              <td className="border-b border-border px-3 py-2.5">{note.author}</td>
              <td className="whitespace-nowrap border-b border-border px-3 py-2.5 text-muted-foreground">{note.date}</td>
              <td className="border-b border-border px-3 py-2.5"><StatusLabel status={note.status} /></td>
              <td className="border-b border-border px-3 py-2.5"><PriorityLabel priority={note.priority} /></td>
              <td className="border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`View ${note.title}`}
                    className="rounded p-1.5 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                    onClick={() => actions.onView(note)}
                    type="button"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <NoteActionsMenu actions={actions} note={note} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!compact && rows.length > 5 ? (
        <div className="flex justify-end border-t border-border px-4 py-2">
          <button className="flex items-center gap-1 text-xs font-semibold text-primary" type="button">View All Notes <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      ) : null}
    </div>
  );
}

function NoteActionsMenu({ actions, note }: { actions: NoteTableActions; note: Note }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={`More actions for ${note.title}`}
          className="rounded p-1.5 text-muted-foreground outline-none hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          collisionPadding={12}
          className="z-[80] max-w-[calc(100vw-24px)] min-w-44 rounded-md border border-border bg-surface p-1 text-xs shadow-soft"
          sideOffset={4}
        >
          <ActionMenuItem icon={Eye} label="View details" onSelect={() => actions.onView(note)} />
          <ActionMenuItem icon={FilePenLine} label="Edit note" onSelect={() => actions.onEdit(note)} />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <ActionMenuItem icon={CheckCheck} label="Mark signed" onSelect={() => actions.onStatusChange(note, "Signed")} />
          <ActionMenuItem icon={Clock3} label="Send for review" onSelect={() => actions.onStatusChange(note, "Pending Review")} />
          <ActionMenuItem icon={FileText} label="Save as draft" onSelect={() => actions.onStatusChange(note, "Draft")} />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <ActionMenuItem danger icon={Trash2} label="Delete note" onSelect={() => actions.onDelete(note)} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ActionMenuItem({
  danger = false,
  icon: Icon,
  label,
  onSelect,
}: {
  danger?: boolean;
  icon: typeof Eye;
  label: string;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded px-2 py-2 outline-none data-[highlighted]:bg-surface-muted",
        danger ? "text-danger" : "text-foreground",
      )}
      onSelect={onSelect}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </DropdownMenu.Item>
  );
}

function PatientFact({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0 px-2 py-2 sm:px-4">
      <div className="text-[9px] font-semibold uppercase text-muted-foreground sm:text-[10px]">{label}</div>
      <div className={cn("mt-0.5 truncate text-[11px] font-semibold sm:text-xs", tone)}>{value}</div>
    </div>
  );
}


type SearchableSelectOption = {
  disabled: boolean;
  label: string;
  value: string;
};

function getSearchableSelectOptions(children: React.ReactNode): SearchableSelectOption[] {
  const options: SearchableSelectOption[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<{ children?: React.ReactNode; disabled?: boolean; value?: string | number }>(child)) return;
    if (child.type === React.Fragment) {
      options.push(...getSearchableSelectOptions(child.props.children));
      return;
    }
    if (child.type !== "option") return;

    const label = React.Children.toArray(child.props.children).join("");
    options.push({
      disabled: Boolean(child.props.disabled),
      label,
      value: String(child.props.value ?? label),
    });
  });

  return options;
}

function SearchableCombobox({
  className,
  disabled,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  className?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  value: string;
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(selectedLabel);
  const normalizedQuery = query.trim().toLowerCase();
  const filterQuery = normalizedQuery === selectedLabel.trim().toLowerCase() ? "" : normalizedQuery;
  const filteredOptions = options.filter(
    (option) => !option.disabled && (!filterQuery || option.label.toLowerCase().includes(filterQuery)),
  );

  React.useEffect(() => {
    if (!open) setQuery(selectedLabel);
  }, [open, selectedLabel]);

  function choose(option: SearchableSelectOption) {
    setQuery(option.label);
    onValueChange(option.value);
    setOpen(false);
  }

  return (
    <Popover.Root
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery(selectedLabel);
      }}
      open={open}
    >
      <Popover.Anchor asChild>
        <div className="relative min-w-0">
          <input
            className={cn(className, "pr-9")}
            disabled={disabled}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onClick={() => setOpen(true)}
            onFocus={(event) => {
              event.currentTarget.select();
              setOpen(true);
            }}
            placeholder={placeholder}
            value={query}
          />
          <button
            aria-label="Open options"
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground"
            disabled={disabled}
            onClick={() => setOpen((current) => !current)}
            tabIndex={-1}
            type="button"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          className="z-[9999] max-h-64 min-w-[var(--radix-popover-trigger-width)] overflow-y-auto rounded-lg border-2 border-primary/25 bg-white p-1.5 text-foreground shadow-[0_16px_40px_rgba(15,23,42,0.24)] ring-1 ring-black/5 dark:bg-slate-950"
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          sideOffset={4}
        >
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm text-foreground outline-none transition hover:bg-primary-soft hover:text-primary focus:bg-primary-soft focus:text-primary",
                  option.value === value && "bg-primary-soft font-semibold text-primary",
                )}
                key={option.value}
                onClick={() => choose(option)}
                type="button"
              >
                <span>{option.label}</span>
                {option.value === value ? <Check className="h-4 w-4" /> : null}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No matching option</div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function SearchableSelect({
  children,
  className,
  disabled,
  onChange,
  value,
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  const options = getSearchableSelectOptions(children);

  return (
    <SearchableCombobox
      className={className}
      disabled={disabled}
      onValueChange={(nextValue) =>
        onChange?.({
          currentTarget: { value: nextValue },
          target: { value: nextValue },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
      options={options}
      value={String(value ?? "")}
    />
  );
}

function FilterSelect({
  className,
  label,
  value,
  options,
  onChange,
}: {
  className?: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn("block min-w-0 max-w-full", className)}>
      <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <SearchableCombobox
        className="h-9 w-full min-w-0 max-w-full truncate rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        onValueChange={onChange}
        options={options.map((option) => ({ disabled: false, label: option, value: option }))}
        placeholder={`Type or select ${label.toLowerCase()}`}
        value={value}
      />
    </label>
  );
}

function ReadOnlyFilterValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <div className="flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-surface-muted px-3 text-xs font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function FilterRadioGroup({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</legend>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
        {options.map((option) => (
          <label
            className={cn(
              "flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs transition",
              value === option ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-surface-muted",
            )}
            key={option}
          >
            <input
              checked={value === option}
              className="h-3.5 w-3.5 accent-primary"
              name={name}
              onChange={() => onChange(option)}
              type="radio"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function StatusLabel({ status }: { status: NoteStatus }) {
  const styles = {
    Signed: "text-success",
    Draft: "text-blue-600",
    "Pending Review": "text-warning",
  };
  const Icon = status === "Signed" ? CheckCircle2 : status === "Draft" ? FilePenLine : Clock3;
  return <span className={cn("inline-flex items-center gap-1 font-semibold", styles[status])}><Icon className="h-3.5 w-3.5" />{status}</span>;
}

function PriorityLabel({ priority }: { priority: Note["priority"] }) {
  return <span className={cn("font-semibold", priority === "High" ? "text-danger" : priority === "Medium" ? "text-warning" : "text-success")}>{priority}</span>;
}
