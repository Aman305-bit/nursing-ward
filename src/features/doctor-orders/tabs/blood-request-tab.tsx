"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Droplet, Info, ShieldAlert, UserRound } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import { PatientSummaryBanner } from "./shared/patient-summary-banner";

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={(className ? className + " " : "") + "text-xs font-medium text-muted-foreground"}>
      {children}
    </span>
  );
}

function FieldSelect({ value, onChange, disabled, children }: { value: string; onChange: (value: string) => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="h-9 w-full appearance-none rounded-md border border-input px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-border focus:ring-0 disabled:bg-surface-muted disabled:text-muted-foreground"
    >
      {children}
    </select>
  );
}

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
        checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
      }`}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

const bloodGroups = ["A", "B", "AB", "O"];
const requisitionUnits = ["General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Emergency Department","ICU","Gynecology/Obstetrics", "Surgery", "Oncology", "Nephrology", "Hematology", "Others"];
const consultants = ["Dr. Kavita Rao", "Dr. Amit Sharma", "Dr. Priya Patel"];
const requestingDoctors = ["Dr. Kavita Rao", "Dr. Amit Sharma", "Dr. Priya Patel", "Dr. Rahul Verma", "Dr. Sneha Gupta"];
const requestTypes = ["Routine", "Emergency"] as const;
const productTypes = ["Whole Blood", "Leucoreduced Red Cells", "Packed Red Cells", "Platelets Concentrate", "FFP", "Cryoprecipitate", "Factor VIII", "Plasma", "Cells Separator", "Washed Red Cells", "Others"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentTimeValue() {
  return new Date().toTimeString().slice(0, 5);
}

function toDateTime(date: string, startTime: string, endTime: string, holdTime: string) {
  return `${date} ${startTime || "--:--"} to ${endTime || "--:--"} | Hold ${holdTime || "--:--"}`;
}

function parseDateTime(date: string, time: string) {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isWithin24Hours(date: string, time: string) {
  const dateTime = parseDateTime(date, time);
  return dateTime ? dateTime.getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;
}

function isInPast(date: string, time: string) {
  const dateTime = parseDateTime(date, time);
  return dateTime ? dateTime.getTime() < Date.now() : false;
}

function PreviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

type ProductSelection = { type: string; quantity: string; notes: string };
type ReplacementDonor = { bloodGroup: string; rh: string };

function isOtherProduct(type: string) {
  return type === "Others" || type === "Others/Procedure";
}

interface FormState {
  patientName: string;
  uhid: string;
  admissionNo: string;
  age: string;
  sex: string;
  wardBedNo: string;
  requisitionUnit: string;
  requisitionUnitOther: string;
  consultant: string;
  requestingDoctor: string;
  diagnosis: string;
  indicationType: string;
  indicationForTransfusion: string;
  patientBloodGroup: string;
  patientRh: string;
  groupScreenDate: string;
  wbc: string;
  rbc: string;
  hb: string;
  pcv: string;
  platelets: string;
  pt: string;
  ptt: string;
  otherLabs: string;
  previousTransfusion: string;
  previousTransfusionDetails: string;
  previousReaction: string;
  previousReactionDetails: string;
  pregnancies: string;
  miscarriage: string;
  stillBirth: string;
  erythroblastosis: string;
  antibodiesDetected: string;
  antibodyNames: string;
  bloodGroupSource: string;
  rhGroupSource: string;
  bloodCountsLinked: boolean;
  groupHoldRequested: boolean;
  crossMatchRequested: boolean;
  crossMatchUnits: string;
  productType: string;
  quantity: string;
  selectedProducts: ProductSelection[];
  productDescription: string;
  productDescriptionUnit: string;
  requiredDate: string;
  startTime: string;
  endTime: string;
  holdTime: string;
  requestType: string;
  natureOfEmergency: string;
  replacementDonorDate: string;
  donorsCount: string;
  replacementDonors: ReplacementDonor[];
  consentExplained: boolean;
  doctorSignature: string;
  consentText: string;
}

const initialForm: FormState = {
  patientName: "Meera Joshi",
  uhid: "UHID-45821",
  admissionNo: "ADM-90211",
  age: "54",
  sex: "Female",
  wardBedNo: "Ward 3 / Bed 12",
  requisitionUnit: "General Medicine",
  requisitionUnitOther: "",
  consultant: "Dr. Kavita Rao",
  requestingDoctor: "Dr. Kavita Rao",
  diagnosis: "Upper GI bleed",
  indicationType: "Therapeutic",
  indicationForTransfusion: "",
  patientBloodGroup: "A+",
  patientRh: "Positive",
  groupScreenDate: todayIso(),
  wbc: "12.4",
  rbc: "4.10",
  hb: "8.2",
  pcv: "26",
  platelets: "148",
  pt: "13.2",
  ptt: "31",
  otherLabs: "Ferritin pending",
  previousTransfusion: "No",
  previousTransfusionDetails: "",
  previousReaction: "No",
  previousReactionDetails: "",
  pregnancies: "N/A",
  miscarriage: "N/A",
  stillBirth: "N/A",
  erythroblastosis: "N/A",
  antibodiesDetected: "No",
  antibodyNames: "",
  bloodGroupSource: "lab",
  rhGroupSource: "lab",
  bloodCountsLinked: true,
  groupHoldRequested: false,
  crossMatchRequested: true,
  crossMatchUnits: "2",
  productType: "Packed Red Cells",
  quantity: "2",
  selectedProducts: [{ type: "Packed Red Cells", quantity: "2", notes: "" }],
  productDescription: "",
  productDescriptionUnit: "",
  requiredDate: todayIso(),
  startTime: currentTimeValue(),
  endTime: "",
  holdTime: "",
  requestType: "Routine",
  natureOfEmergency: "",
  replacementDonorDate: "",
  donorsCount: "0",
  replacementDonors: [],
  consentExplained: true,
  doctorSignature: "Dr. Kavita Rao",
  consentText:
    "I have explained the necessity of blood transfusion, informed consent has been taken.",
};

function PreviewDrawer({
  open,
  onOpenChange,
  form,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: typeof initialForm;
}) {
  const router = useRouter();

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Blood Request Preview"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Edit
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* <AlertBanner icon={Info} tone="info" title="Preview mode">
          This shows the filled blood request data before submission.
        </AlertBanner> */}

        <div className="overflow-auto rounded-md border border-border p-3">
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-2 font-medium text-muted-foreground">Patient Name</td><td className="py-2 text-foreground">{form.patientName}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">UHID</td><td className="py-2 text-foreground">{form.uhid}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Admission No.</td><td className="py-2 text-foreground">{form.admissionNo}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Age / Sex</td><td className="py-2 text-foreground">{form.age} / {form.sex}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Ward / Bed</td><td className="py-2 text-foreground">{form.wardBedNo}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Requisitioning Unit</td><td className="py-2 text-foreground">{form.requisitionUnit === "Others" ? form.requisitionUnitOther || "Others" : form.requisitionUnit}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Consultant</td><td className="py-2 text-foreground">{form.consultant}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Requesting Doctor</td><td className="py-2 text-foreground">{form.requestingDoctor}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Diagnosis</td><td className="py-2 text-foreground">{form.diagnosis}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Indication Type</td><td className="py-2 text-foreground">{form.indicationType}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Indication for Transfusion</td><td className="py-2 text-foreground">{form.indicationForTransfusion || '-'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Blood Group (ABO)</td><td className="py-2 text-foreground">{form.patientBloodGroup}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Rh</td><td className="py-2 text-foreground">{form.patientRh}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Group + Screen Date</td><td className="py-2 text-foreground">{form.groupScreenDate}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Start Time</td><td className="py-2 text-foreground">{form.startTime || '--:--'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">End Time</td><td className="py-2 text-foreground">{form.endTime || '--:--'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Hold Time</td><td className="py-2 text-foreground">{form.holdTime || '--:--'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">WBC</td><td className="py-2 text-foreground">{form.wbc}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">RBC</td><td className="py-2 text-foreground">{form.rbc}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Hb</td><td className="py-2 text-foreground">{form.hb}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">PCV</td><td className="py-2 text-foreground">{form.pcv}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Platelets</td><td className="py-2 text-foreground">{form.platelets}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">PT</td><td className="py-2 text-foreground">{form.pt}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">PTT</td><td className="py-2 text-foreground">{form.ptt}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Other Labs</td><td className="py-2 text-foreground">{form.otherLabs || '-'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Previous Transfusion</td><td className="py-2 text-foreground">{form.previousTransfusion}{form.previousTransfusionDetails ? ` — ${form.previousTransfusionDetails}` : ''}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Previous Reaction</td><td className="py-2 text-foreground">{form.previousReaction}{form.previousReactionDetails ? ` — ${form.previousReactionDetails}` : ''}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Pregnancies</td><td className="py-2 text-foreground">{form.pregnancies}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Miscarriage</td><td className="py-2 text-foreground">{form.miscarriage}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Still Birth</td><td className="py-2 text-foreground">{form.stillBirth}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Erythroblastosis</td><td className="py-2 text-foreground">{form.erythroblastosis}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Antibodies Detected</td><td className="py-2 text-foreground">{form.antibodiesDetected}{form.antibodyNames ? ` — ${form.antibodyNames}` : ''}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Blood Group Source / Rh Source</td><td className="py-2 text-foreground">{form.bloodGroupSource} / {form.rhGroupSource}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Counts Linked</td><td className="py-2 text-foreground">{form.bloodCountsLinked ? 'Yes' : 'No'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Group & Hold</td><td className="py-2 text-foreground">{form.groupHoldRequested ? 'Yes' : 'No'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Cross Match</td><td className="py-2 text-foreground">{form.crossMatchRequested ? `Yes (${form.crossMatchUnits || '-' } unit${form.crossMatchUnits === '1' ? '' : 's'})` : 'No'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Request Type</td><td className="py-2 text-foreground">{form.requestType}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Nature of Emergency</td><td className="py-2 text-foreground">{form.natureOfEmergency || '-'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Replacement Donors (count)</td><td className="py-2 text-foreground">{form.donorsCount}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Consent Explained</td><td className="py-2 text-foreground">{form.consentExplained ? 'Yes' : 'No'}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Doctor Signature</td><td className="py-2 text-foreground">{form.doctorSignature}</td></tr>
              <tr className="border-t"><td className="py-2 font-medium text-muted-foreground">Consent Text</td><td className="py-2 text-foreground">{form.consentText || '-'}</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Selected Products (table)</div>
          <div className="overflow-auto rounded-md border border-border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground"><th className="px-2 py-2">Product</th><th className="px-2 py-2">Units</th><th className="px-2 py-2">Notes</th></tr>
              </thead>
              <tbody>
                {Array.isArray(form.selectedProducts) && form.selectedProducts.length ? form.selectedProducts.map((p) => (
                  <tr key={p.type} className="border-t">
                    <td className="px-2 py-1">{isOtherProduct(p.type) ? (form.productDescription || "Other") : p.type}</td>
                    <td className="px-2 py-1">{isOtherProduct(p.type) ? (form.productDescriptionUnit || p.quantity) : p.quantity}</td>
                    <td className="px-2 py-1">{p.notes || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-2 py-1 text-muted-foreground">No products selected</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Replacement Donors</div>
          <div className="overflow-auto rounded-md border border-border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground"><th className="px-2 py-2">Donor</th><th className="px-2 py-2">ABO</th><th className="px-2 py-2">Rh</th></tr>
              </thead>
              <tbody>
                {Array.isArray(form.replacementDonors) && form.replacementDonors.length ? form.replacementDonors.map((d, idx) => (
                  <tr key={idx} className="border-t"><td className="px-2 py-1">Donor {idx + 1}</td><td className="px-2 py-1">{d.bloodGroup}</td><td className="px-2 py-1">{d.rh}</td></tr>
                )) : (
                  <tr><td colSpan={3} className="px-2 py-1 text-muted-foreground">No replacement donors</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export function BloodRequestTab() {
  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [form, setForm] = React.useState(initialForm);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [requestingDoctorOpen, setRequestingDoctorOpen] = React.useState(false);

  const isMale = form.sex === "Male";
  const isSurgery = form.indicationType === "Surgery";
  const isEmergency = form.requestType === "Emergency";
  const requiresOtherDescription = Array.isArray(form.selectedProducts) && form.selectedProducts.some((p) => isOtherProduct(p.type));
  const hasReaction = form.previousReaction === "Yes";
  const isOtherRequisitionUnit = form.requisitionUnit === "Others";
  const hasAntibodies = form.antibodiesDetected === "Yes";
  const canHidePregnancyFields = isMale;
  const showPregnancyDependentFields = form.pregnancies === "Yes";
  const pregnancyOptions = canHidePregnancyFields ? ["N/A"] : ["Yes", "No"];
  const isBloodGroupLabVerified = form.bloodGroupSource === "lab";
  const isRhLabVerified = form.rhGroupSource === "lab";
  const areBloodCountsLinked = form.bloodCountsLinked;
  const showCrossMatchUnits = form.crossMatchRequested;
  const replacementDonorCount = Number(form.donorsCount) || 0;
  const replacementDonors = Array.isArray(form.replacementDonors) ? form.replacementDonors : [];
  const hasReplacementDonors = replacementDonorCount > 0;
  const requiredDateTime = parseDateTime(form.requiredDate, form.startTime);
  const isRoutineLeadTimeWarning = form.requestType === "Routine" && requiredDateTime ? requiredDateTime.getTime() - Date.now() < 24 * 60 * 60 * 1000 : false;
  const productsRef = React.useRef<HTMLDivElement | null>(null);
  const [productsOpen, setProductsOpen] = React.useState(false);
  const filteredRequestingDoctors = React.useMemo(() => {
    const query = form.requestingDoctor.trim().toLowerCase();
    if (query.length < 3) return [];
    return requestingDoctors.filter((doctor) => doctor.toLowerCase().includes(query));
  }, [form.requestingDoctor]);
  const selectedNamesDisplay = React.useMemo(() => {
    if (!Array.isArray(form.selectedProducts) || form.selectedProducts.length === 0) return "";
    const names = form.selectedProducts.map((p) => p.type);
    if (names.length <= 3) return names.join(", ");
    return `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;
  }, [form.selectedProducts]);

  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) setProductsOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  React.useEffect(() => {
    if (isMale) {
      setForm((current) => ({
        ...current,
        pregnancies: "N/A",
        miscarriage: "N/A",
        stillBirth: "N/A",
        erythroblastosis: "N/A",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      pregnancies: current.pregnancies === "N/A" ? "No" : current.pregnancies,
      miscarriage: current.pregnancies === "N/A" ? "No" : current.miscarriage,
      stillBirth: current.pregnancies === "N/A" ? "No" : current.stillBirth,
      erythroblastosis: current.pregnancies === "N/A" ? "No" : current.erythroblastosis,
    }));
  }, [isMale]);

  const validate = () => {
    const nextErrors: string[] = [];

    if (!form.patientName.trim()) nextErrors.push("Patient Name is required.");
    if (!form.uhid.trim()) nextErrors.push("I.D. No. (Hospital ID / UHID) is required.");
    if (!form.admissionNo.trim()) nextErrors.push("I.P. No. (Admission No.) is required.");
    if (!form.requestingDoctor.trim()) nextErrors.push("Name of Requesting Doctor is required.");
    if (!form.consultant.trim()) nextErrors.push("Consultant In-charge is required.");
    if (!form.indicationType.trim()) nextErrors.push("Indication Type must be selected.");
    if (isSurgery && !form.indicationForTransfusion.trim()) nextErrors.push("Indication for Transfusion is required when Surgery is selected.");
    if (hasReaction && !form.previousReactionDetails.trim()) nextErrors.push("Reaction details are required when reaction history is Yes.");
    if (!Array.isArray(form.selectedProducts) || form.selectedProducts.length === 0) nextErrors.push("At least one blood product must be selected.");
    if (Array.isArray(form.selectedProducts)) {
      form.selectedProducts.forEach((p, idx) => {
        if (!Number(p.quantity) || Number(p.quantity) < 1) nextErrors.push(`Quantity for ${p.type || 'product'} must be a whole number >= 1.`);
      });
    }
    if (requiresOtherDescription && !form.productDescription.trim()) nextErrors.push("Others/Procedure description is required when Others/Procedure is selected.");
    if (requiresOtherDescription && (!form.productDescriptionUnit || Number(form.productDescriptionUnit) < 1)) nextErrors.push("Units for Others/Procedure must be provided and be >= 1.");
    if (!form.requiredDate.trim()) nextErrors.push("Required date is required.");
    if (!form.startTime.trim()) nextErrors.push("Start time is required.");
    if (!form.endTime.trim()) nextErrors.push("End time is required.");
    if (!form.holdTime.trim()) nextErrors.push("Hold time is required.");
    if (isOtherRequisitionUnit && !form.requisitionUnitOther.trim()) nextErrors.push("Requisitioning Unit details are required when Other is selected.");
    if (form.groupScreenDate > todayIso()) nextErrors.push("Group + Screen date cannot be in the future.");
    if (replacementDonorCount < 0) nextErrors.push("Number of donors must be zero or greater.");
    if (replacementDonorCount > 0) {
      if (replacementDonors.length !== replacementDonorCount) nextErrors.push("Donor count must match the number of donor entries provided.");
      replacementDonors.forEach((donor, index) => {
        if (!donor.bloodGroup) nextErrors.push(`Donor ${index + 1} blood group is required.`);
        if (!donor.rh) nextErrors.push(`Donor ${index + 1} Rh is required.`);
      });
    }
    if (isEmergency && !form.natureOfEmergency.trim()) nextErrors.push("Nature of Emergency is required for Emergency requests.");
    if (hasAntibodies && !form.antibodyNames.trim()) nextErrors.push("Antibody names are mandatory when antibodies are detected.");
    if (!form.consentExplained) nextErrors.push("Consent for transfusion must be confirmed before submission.");
    if (!form.doctorSignature.trim()) nextErrors.push("Doctor signature is required.");
    if (!form.patientBloodGroup.trim() || !form.patientRh.trim()) nextErrors.push("ABO and Rh blood group must be captured.");
    if (form.crossMatchRequested && (!form.crossMatchUnits.trim() || Number(form.crossMatchUnits) < 1)) nextErrors.push("Cross Match units are required when Cross Match is selected.");

    if (requiredDateTime && !isEmergency && requiredDateTime.getTime() < Date.now()) {
      nextErrors.push("Required date/time cannot be in the past unless Emergency is selected.");
    }
    if (!requiredDateTime && form.requiredDate.trim() && form.startTime.trim()) {
      nextErrors.push("Required date/time values are invalid.");
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const onSubmit = () => {
    if (!validate()) {
      setSubmitted(false);
      return;
    }
    setSubmitted(true);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      
      <Card>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Order Context</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* <label className="space-y-2"><FieldLabel>Requisitioning Unit</FieldLabel>
                  <FieldSelect value={form.requisitionUnit} onChange={(requisitionUnit) => setForm((current) => ({
                    ...current,
                    requisitionUnit,
                    requisitionUnitOther: requisitionUnit === "Others" ? current.requisitionUnitOther : "",
                  }))}>
                    {requisitionUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </FieldSelect>
                </label>
                {isOtherRequisitionUnit ? (
                  <label className="space-y-2 "><FieldLabel>Requisitioning Unit (Other)</FieldLabel>
                    <Input value={form.requisitionUnitOther} onChange={(event) => setForm((current) => ({ ...current, requisitionUnitOther: event.target.value }))} placeholder="Enter other requisition unit" />
                  </label>
                ) : null} */}
                {/* <Input value={form.requisitionUnit} readOnly /></label> */}
                {/* <Input value={form.consultant} onChange={(event) => setForm((current) => ({ ...current, consultant: event.target.value }))} /></label> */}
                <label className="relative space-y-2">
                  <FieldLabel>Name of Requesting Doctor</FieldLabel>
                  <Input
                    value={form.requestingDoctor}
                    placeholder="Type doctor name"
                    onFocus={() => setRequestingDoctorOpen(true)}
                    onBlur={() => window.setTimeout(() => setRequestingDoctorOpen(false), 150)}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, requestingDoctor: event.target.value }));
                      setRequestingDoctorOpen(true);
                    }}
                  />
                  {requestingDoctorOpen && filteredRequestingDoctors.length ? (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-white shadow-lg">
                      {filteredRequestingDoctors.map((doctor) => (
                        <button
                          key={doctor}
                          type="button"
                          className="block w-full border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-muted"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setForm((current) => ({ ...current, requestingDoctor: doctor }));
                            setRequestingDoctorOpen(false);
                          }}
                        >
                          <div className="font-medium text-foreground">{doctor}</div>
                          {/* <div className="text-xs text-muted-foreground">Doctor already in list</div> */}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </label>
                <label className="space-y-2"><FieldLabel>Clinical Diagnosis</FieldLabel><Input value={form.diagnosis} onChange={(event) => setForm((current) => ({ ...current, diagnosis: event.target.value }))} placeholder="Free text or ICD-10 search" /></label>
              </div>
            </section>

            {/* {isSurgery ? <AlertBanner icon={ShieldAlert} tone="warning" title="Surgery selected">The transfusion indication is required for surgery cases and should be documented clearly.</AlertBanner> : null} */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Indication</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel className="mb-0">
                    Indication Type
                  </FieldLabel>
                  <Input value={form.indicationType} onChange={(event) => setForm((current) => ({ ...current, indicationType: event.target.value }))} />

                </div>
              </div>
            </section>    
          </div>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Patient Blood</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <FieldLabel className="mb-0">
                    Any Previous Transfusion
                  </FieldLabel>

                  <Toggle
                    checked={form.previousTransfusion === "Yes"}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        previousTransfusion: checked ? "Yes" : "No",
                        previousTransfusionDetails: checked
                          ? current.previousTransfusionDetails
                          : "",
                      }))
                    }
                    label=""
                  />

                  {/* <span className="text-sm font-medium text-foreground">
                    {form.previousTransfusion === "Yes" ? "Yes" : "No"}
                  </span> */}
                </div>

                {form.previousTransfusion === "Yes" && (
                  <Input
                    value={form.previousTransfusionDetails}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        previousTransfusionDetails: event.target.value,
                      }))
                    }
                    placeholder="Transfusion details"
                  />
                )}
              </div>
              <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FieldLabel className="mb-0">
                  Any Reaction (to previous transfusion)
                </FieldLabel>

                  <Toggle
                    checked={form.previousReaction === "Yes"}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        previousReaction: checked ? "Yes" : "No",
                        previousReactionDetails: checked
                          ? current.previousReactionDetails
                          : "",
                      }))
                    }
                    label=""
                  />
                  {/* <span className="text-sm font-medium text-foreground">
                    {form.previousReaction === "Yes" ? "Yes" : "No"}
                  </span> */}
              </div>

              {hasReaction && (
                <Input
                  value={form.previousReactionDetails}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      previousReactionDetails: event.target.value,
                    }))
                  }
                  placeholder="Reaction details"
                />
              )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <FieldLabel className="mb-0">
                    Antibodies Detected Earlier
                  </FieldLabel>

                  <Toggle
                    checked={form.antibodiesDetected === "Yes"}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        antibodiesDetected: checked ? "Yes" : "No",
                        antibodyNames: checked ? current.antibodyNames : "",
                      }))
                    }
                    label=""
                  />

                  {/* <span className="text-sm font-medium text-foreground">
                    {form.antibodiesDetected === "Yes" ? "Yes" : "No"}
                  </span> */}
                </div>

                {hasAntibodies && (
                  <Input
                    value={form.antibodyNames}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        antibodyNames: event.target.value,
                      }))
                    }
                    placeholder="Antibodies detected"
                  />
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <FieldLabel className="mb-0">
                    Any Pregnancies
                  </FieldLabel>
                    <Toggle
                      checked={form.pregnancies === "Yes"}
                      onChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          pregnancies: checked ? "Yes" : "N/A",
                          miscarriage: checked
                            ? current.miscarriage === "N/A"
                              ? "No"
                              : current.miscarriage
                            : "N/A",
                          stillBirth: checked
                            ? current.stillBirth === "N/A"
                              ? "No"
                              : current.stillBirth
                            : "N/A",
                          erythroblastosis: checked
                            ? current.erythroblastosis === "N/A"
                              ? "No"
                              : current.erythroblastosis
                            : "N/A",
                        }))
                      }
                      disabled={canHidePregnancyFields}
                      label=""
                    />
                </div>
              </div>
              {showPregnancyDependentFields ? (
                <>
                  <div className="space-y-2">
                    <FieldLabel>Any Miscarriage</FieldLabel>
                    <div className="flex flex-wrap gap-3">
                      {["Yes", "No", "N/A"].map((option) => (
                        <label key={option} className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition hover:bg-surface-muted">
                          <input
                            type="radio"
                            name="miscarriage"
                            className="h-4 w-4 accent-primary"
                            value={option}
                            checked={form.miscarriage === option}
                            onChange={(event) => setForm((current) => ({ ...current, miscarriage: event.target.value }))}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Still Birth (history)</FieldLabel>
                    <div className="flex flex-wrap gap-3">
                      {["Yes", "No", "N/A"].map((option) => (
                        <label key={option} className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition hover:bg-surface-muted">
                          <input
                            type="radio"
                            name="stillBirth"
                            className="h-4 w-4 accent-primary"
                            value={option}
                            checked={form.stillBirth === option}
                            onChange={(event) => setForm((current) => ({ ...current, stillBirth: event.target.value }))}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel>Erythroblastosis (history)</FieldLabel>
                    <div className="flex flex-wrap gap-3">
                      {["Yes", "No", "N/A"].map((option) => (
                        <label key={option} className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition hover:bg-surface-muted">
                          <input
                            type="radio"
                            name="erythroblastosis"
                            className="h-4 w-4 accent-primary"
                            value={option}
                            checked={form.erythroblastosis === option}
                            onChange={(event) => setForm((current) => ({ ...current, erythroblastosis: event.target.value }))}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            {/* {hasReaction ? <AlertBanner icon={ShieldAlert} tone="warning" title="Reaction history">If reaction history is Yes, show alert banner and capture this in allergy / alert list.</AlertBanner> : null} */}
            {/* {hasAntibodies ? <AlertBanner icon={ShieldAlert} tone="danger" title="Antibody history">Antibody name becomes mandatory and a notification should be sent to Blood Bank LIS.</AlertBanner> : null} */}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Blood Group & Counts</h3>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <label className="space-y-2"><FieldLabel>Blood Group of Patient - ABO</FieldLabel>
                {/* <FieldSelect value={form.patientBloodGroup} disabled={isBloodGroupLabVerified} onChange={(patientBloodGroup) => setForm((current) => ({ ...current, patientBloodGroup, bloodGroupSource: "manual" }))}>
                  {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                </FieldSelect> */}
                <FieldSelect value={form.patientBloodGroup} onChange={(patientBloodGroup) => setForm((current) => ({ ...current, patientBloodGroup, bloodGroupSource: "manual" }))}>
                  {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                </FieldSelect>
                {/* <div className="text-xs text-muted-foreground">
                  {isBloodGroupLabVerified ? "Auto-filled from verified lab result" : "Manual entry — unverified until lab confirmation"}
                </div> */}
              </label>
              <div className="space-y-2">
                <FieldLabel>Blood Group of Patient - Rh</FieldLabel>
                <input type="text" readOnly value={form.patientRh} className="w-full rounded-md border border-input px-3 py-2 text-sm text-foreground shadow-sm" />
                <div className="flex items-center gap-2">
                  {/* <Toggle
                    disabled={isRhLabVerified}
                    checked={form.patientRh === "Positive"}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        patientRh: checked ? "Positive" : "Negative",
                        rhGroupSource: "manual",
                      }))
                    }
                    label=""
                  />

                  <span className="text-sm font-medium text-foreground">
                    {form.patientRh}
                  </span> */}
                </div>

                {/* <div className="text-xs text-muted-foreground">
                  {isRhLabVerified
                    ? "Auto-filled from verified lab result"
                    : "Manual entry — unverified until lab confirmation"}
                </div> */}
              </div>
              <label className="space-y-2"><FieldLabel>Group + Screen Done On (Date)</FieldLabel><Input type="date" max={todayIso()} value={form.groupScreenDate} onChange={(event) => setForm((current) => ({ ...current, groupScreenDate: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>Hemoglobin (Hb)</FieldLabel><Input readOnly={areBloodCountsLinked} value={form.hb} onChange={(event) => setForm((current) => ({ ...current, hb: event.target.value }))} placeholder="g/dL" /></label>
              {/* <label className="space-y-2"><FieldLabel>WBC</FieldLabel><Input readOnly={areBloodCountsLinked} value={form.wbc} onChange={(event) => setForm((current) => ({ ...current, wbc: event.target.value }))} /></label> */}
              <label className="space-y-2"><FieldLabel>RBC</FieldLabel><Input readOnly={areBloodCountsLinked} value={form.rbc} onChange={(event) => setForm((current) => ({ ...current, rbc: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>PCV / Hematocrit</FieldLabel><Input readOnly={areBloodCountsLinked} value={form.pcv} onChange={(event) => setForm((current) => ({ ...current, pcv: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>Platelet Count</FieldLabel><Input readOnly={areBloodCountsLinked} value={form.platelets} onChange={(event) => setForm((current) => ({ ...current, platelets: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>PT</FieldLabel><Input readOnly={areBloodCountsLinked} value={form.pt} onChange={(event) => setForm((current) => ({ ...current, pt: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>PTT</FieldLabel><Input readOnly={areBloodCountsLinked} value={form.ptt} onChange={(event) => setForm((current) => ({ ...current, ptt: event.target.value }))} /></label>
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>Other Lab Values</FieldLabel>
                <Input value={form.otherLabs} onChange={(event) => setForm((current) => ({ ...current, otherLabs: event.target.value }))} />
                <div className="text-xs text-muted-foreground">
                  {/* {areBloodCountsLinked ? "Values are auto-pulled from latest linked lab result." : "Manual entry allowed when lab-linked values are unavailable."} */}
                </div>
              </label>
              <label className="flex items-center gap-4 px-3 py-2 text-sm text-foreground ">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.groupHoldRequested}
                  onChange={(event) => setForm((current) => ({ ...current, groupHoldRequested: event.target.checked }))}
                />
                <span>Group &amp; Hold</span>
              </label>
              <label className="flex items-center gap-4 px-3 py-2 text-sm text-foreground ">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.crossMatchRequested}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      crossMatchRequested: event.target.checked,
                      crossMatchUnits: event.target.checked ? current.crossMatchUnits || "1" : "",
                    }))
                  }
                />
                <span>Cross Match</span>
              </label>
              {/* <div className="flex flex-wrap gap-3 ">
            </div>  */}
              {showCrossMatchUnits ? (
                <label className="space-y-2">
                  <FieldLabel>Cross Match Units</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    value={form.crossMatchUnits}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        crossMatchUnits: event.target.value.replace(/[^0-9]/g, ""),
                      }))
                    }
                    placeholder="No. of units"
                  />
                </label>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Products Requested</h3>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <FieldLabel>Product Types</FieldLabel>
                <div className="relative" ref={productsRef}>
                  <button type="button" className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm" onClick={() => setProductsOpen((v) => !v)}>
                    <span>{selectedNamesDisplay || "Select products"}</span>
                    <span className="text-xs text-muted-foreground">▾</span>
                  </button>
                  {productsOpen ? (
                    <div className="absolute z-40 mt-1 w-full rounded-md border border-border bg-background p-3 shadow-lg">
                      <div className="space-y-2">
                        {productTypes.map((item) => {
                          const checked = Array.isArray(form.selectedProducts) && form.selectedProducts.find((p) => p.type === item);
                          return (
                            <label key={item} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                checked={Boolean(checked)}
                                onChange={(event) => setForm((current) => {
                                  const existing = Array.isArray(current.selectedProducts) ? [...current.selectedProducts] : [];
                                    if (event.target.checked) {
                                      return { ...current, selectedProducts: [...existing, { type: item, quantity: "1", notes: "" }] };
                                    }
                                    return item === "Others"
                                      ? {
                                          ...current,
                                          selectedProducts: existing.filter((p) => p.type !== item),
                                          productDescription: "",
                                          productDescriptionUnit: "",
                                        }
                                      : { ...current, selectedProducts: existing.filter((p) => p.type !== item) };
                                  })}
                              />
                              <span className="text-sm">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {/* {Array.isArray(form.selectedProducts) && form.selectedProducts.length ? (
                <div className="space-y-2">
                  {form.selectedProducts.map((p) => (
                    <div key={p.type} className="flex items-center gap-3">
                      <div className="w-1/3 text-sm">
                            {isOtherProduct(p.type) ? (
                          <Input placeholder="Others/Procedure Description" value={form.productDescription} onChange={(event) => setForm((current) => ({ ...current, productDescription: event.target.value }))} />
                        ) : (
                          p.type
                        )}
                      </div>
                      <Input type="number" min={1} className="w-24" value={p.quantity} onChange={(event) => setForm((current) => ({ ...current, selectedProducts: (current.selectedProducts || []).map((x) => x.type === p.type ? { ...x, quantity: event.target.value.replace(/[^0-9]/g, "") || "1" } : x) }))} />
                      <Input placeholder="Notes" value={p.notes} onChange={(event) => setForm((current) => ({ ...current, selectedProducts: (current.selectedProducts || []).map((x) => x.type === p.type ? { ...x, notes: event.target.value } : x) }))} />
                    </div>
                  ))}
                </div>
              ) : null} */}
               <div className="grid gap-3 sm:grid-cols-y">
                 <div className="rounded-md border border-border bg-surface-muted p-3 text-sm text-foreground">
                   {Array.isArray(form.selectedProducts) && form.selectedProducts.length ? (
                     <div className="grid gap-3 md:grid-cols-2">
                        {form.selectedProducts.map((p) => (
                          <div key={p.type} className="rounded-md border border-border bg-background p-3">
                            {isOtherProduct(p.type) ? (
                             <div className="grid gap-3 md:grid-cols-[2fr_120px_1fr]">
                                <Input
                                  value={form.productDescription}
                                  onChange={(event) =>
                                    setForm((current) => ({
                                      ...current,
                                      productDescription: event.target.value,
                                    }))
                                  }
                                  placeholder="Others"
                                  className="font-semibold"
                                />

                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="Unit"
                                  value={form.productDescriptionUnit}
                                  onChange={(event) =>
                                    setForm((current) => ({
                                      ...current,
                                      productDescriptionUnit: event.target.value.replace(/[^0-9]/g, ""),
                                    }))
                                  }
                                />

                                <Input
                                  placeholder="Notes"
                                  value={p.notes}
                                  onChange={(event) =>
                                    setForm((current) => ({
                                      ...current,
                                      selectedProducts: (current.selectedProducts || []).map((x) =>
                                        x.type === p.type ? { ...x, notes: event.target.value } : x
                                      ),
                                    }))
                                  }
                                />
                              </div>
                            ) : (
                             <div className="flex items-center gap-3">
                               <div className="w-2/3 text-sm font-medium text-foreground">{p.type}</div>
                               <Input
                                 type="number"
                                 min={1}
                                 className="w-24"
                                 value={p.quantity}
                                 onChange={(event) =>
                                   setForm((current) => ({
                                     ...current,
                                     selectedProducts: (current.selectedProducts || []).map((x) =>
                                       x.type === p.type
                                         ? {
                                             ...x,
                                             quantity: event.target.value.replace(/[^0-9]/g, "") || "1",
                                           }
                                         : x
                                     ),
                                   }))
                                 }
                               />
                               <Input
                                 placeholder="Notes"
                                 value={p.notes}
                                 onChange={(event) =>
                                   setForm((current) => ({
                                     ...current,
                                     selectedProducts: (current.selectedProducts || []).map((x) =>
                                       x.type === p.type ? { ...x, notes: event.target.value } : x
                                     ),
                                   }))
                                 }
                               />
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   ) : null}
                 </div>
                {/* <div className="rounded-md border border-border bg-surface-muted p-3 text-sm text-foreground">
                  <div className="text-xs font-medium text-muted-foreground">Selection summary</div>
                  <div className="mt-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground"><th>Product</th><th className="w-24">Units</th></tr>
                      </thead>
                      <tbody>
                        {Array.isArray(form.selectedProducts) && form.selectedProducts.length ? form.selectedProducts.map((p) => (
                          <tr key={p.type} className="border-t">
                            <td className="py-1">{p.type === "Others/Procedure" ? (form.productDescription || p.type) : p.type}</td>
                            <td className="py-1">{p.type === "Others/Procedure" ? (form.productDescriptionUnit || p.quantity) : p.quantity}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={2} className="py-1 text-muted-foreground">No products selected</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div> */}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Scheduling</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-2"><FieldLabel>Blood/Blood Products Required on (Date)</FieldLabel><Input type="date" value={form.requiredDate} onChange={(event) => setForm((current) => ({ ...current, requiredDate: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>Start Time</FieldLabel><Input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>End Time</FieldLabel><Input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>Hold Time</FieldLabel><Input type="time" value={form.holdTime} onChange={(event) => setForm((current) => ({ ...current, holdTime: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>Type of Request</FieldLabel>
                <FieldSelect value={form.requestType} onChange={(requestType) => setForm((current) => ({ ...current, requestType }))}>
                  {requestTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </FieldSelect>
              </label>
            </div>
            
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Replacement Donors</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-2"><FieldLabel>Replacement Donors Provided On (Date)</FieldLabel><Input type="date" value={form.replacementDonorDate} onChange={(event) => setForm((current) => ({ ...current, replacementDonorDate: event.target.value }))} /></label>
              <label className="space-y-2"><FieldLabel>No. of Donors</FieldLabel><Input type="number" min={0} value={form.donorsCount} onChange={(event) => {
                const nextValue = event.target.value.replace(/[^0-9]/g, "");
                const nextCount = nextValue === "" ? 0 : Number(nextValue);
                setForm((current) => {
                  const existing = Array.isArray(current.replacementDonors) ? current.replacementDonors : [];
                  const nextDonors = Array.from({ length: nextCount }, (_, index) => existing[index] ?? { bloodGroup: "A+", rh: "Positive" });
                  return { ...current, donorsCount: String(nextCount), replacementDonors: nextDonors };
                });
              }} /></label>
            </div>
            {hasReplacementDonors ? (
              <div className="grid gap-4 md:grid-cols-3">
                {replacementDonors.map((donor, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-surface-muted p-3"
                  >
                    <div className="grid gap-3">
                      <label className="space-y-2">
                        <FieldLabel>Donor {index + 1} ABO</FieldLabel>
                        <FieldSelect
                          value={donor.bloodGroup}
                          onChange={(bloodGroup) =>
                            setForm((current) => {
                              const nextDonors = (current.replacementDonors || []).map(
                                (item, donorIndex) =>
                                  donorIndex === index
                                    ? { ...item, bloodGroup }
                                    : item
                              );
                              return { ...current, replacementDonors: nextDonors };
                            })
                          }
                        >
                          {bloodGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </FieldSelect>
                      </label>

                      <div className="flex items-center justify-between">
                        <FieldLabel className="mb-0">
                          Donor {index + 1} Rh
                        </FieldLabel>

                        <div className="flex items-center gap-2">
                          <Toggle
                            checked={donor.rh === "Positive"}
                            onChange={(checked) =>
                              setForm((current) => {
                                const nextDonors = (
                                  current.replacementDonors || []
                                ).map((item, donorIndex) =>
                                  donorIndex === index
                                    ? {
                                        ...item,
                                        rh: checked ? "Positive" : "Negative",
                                      }
                                    : item
                                );

                                return {
                                  ...current,
                                  replacementDonors: nextDonors,
                                };
                              })
                            }
                            label=""
                          />

                          <span className="text-sm font-medium">
                            {donor.rh}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Consent & Sign-off</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex items-center gap-2">
                <Toggle checked={form.consentExplained} onChange={(consentExplained) => setForm((current) => ({ ...current, consentExplained }))} label="" />
                <span className="text-sm font-medium text-foreground">Consent for Transfusion Explained</span>
              </div>
              <label className="space-y-2">
                <FieldLabel>Signature of Doctor</FieldLabel>
                <Input value={form.doctorSignature} onChange={(event) => setForm((current) => ({ ...current, doctorSignature: event.target.value }))} />
              </label>
              {!form.consentExplained ? (
                <label className="space-y-2 lg:col-span-2">
                  <FieldLabel>Consent Text / Notes</FieldLabel>
                  <Input
                    value={form.consentText}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, consentText: event.target.value }))
                    }
                    placeholder="Provide reason when consent has not been explained"
                  />
                </label>
              ) : null}
            </div>
            
            {/* <div className="rounded-md border border-border bg-surface-muted p-3 text-sm text-foreground">
              <div className="text-xs font-medium text-muted-foreground">Date & Time of Signing</div>
              <div className="mt-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                System timestamp on submit
              </div>
            </div> */}
          </section>
        </CardContent>
      </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button type="button" onClick={onSubmit}>
            Submit Request
          </Button>
        </div>

        <PreviewDrawer open={previewOpen} onOpenChange={setPreviewOpen} form={form} />

        {submitted ? (
        <Card className="mt-4 border-success/30 bg-success/10">
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info className="h-4 w-4 text-success" />
              Current Blood Request Status
            </div>
            <p className="text-sm text-muted-foreground">
              Request submitted successfully for Blood Bank approval at {toDateTime(form.requiredDate, form.startTime, form.endTime, form.holdTime)}.
            </p>
            <Badge tone="warning" className="px-3 py-1">
              Pending - Submitted
            </Badge>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
