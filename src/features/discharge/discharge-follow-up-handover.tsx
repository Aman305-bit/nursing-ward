"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  Send,
  ShieldCheck,
  Stethoscope,
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
import type { DischargeChecklistItem, DischargePatientPlan } from "@/features/discharge/discharge-data";

const inputClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";
const textareaClassName =
  "min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

type FollowUpMode = "OPD" | "Teleconsultation" | "Emergency" | "Home Visit";
type FollowUpDestination = "Home" | "Referral Hospital" | "Rehab" | "ICU Transfer";
type VisitType = "First Follow-up" | "Review" | "Dressing" | "Suture Removal" | "Report Review";
type Priority = "Routine" | "Urgent" | "Critical";
type ChecklistStatus = "Pending" | "Completed";
type HandoverStatus = "Pending" | "Completed" | "Blocked";
type ReminderChannel = "SMS" | "WhatsApp" | "Email" | "Patient App Notification";
type ReminderTime = "24 hours before" | "2 hours before" | "Custom";

type AppointmentState = {
  physician: string;
  department: string;
  date: string;
  time: string;
  mode: FollowUpMode;
  destination: FollowUpDestination;
  visitType: VisitType;
  priority: Priority;
  location: string;
  contact: string;
};

type RequiredItem = {
  id: string;
  label: string;
  status: ChecklistStatus;
  note: string;
};

type HandoverItem = {
  id: string;
  label: string;
  owner: "Nurse" | "Billing" | "Pharmacy" | "Doctor";
  status: HandoverStatus;
  updatedAt: string;
};

type HandoverGroup = {
  id: string;
  title: string;
  items: HandoverItem[];
};

type BlockerChip = {
  id: string;
  label: string;
  status: ChecklistStatus;
  target: string;
  handoverGroupId?: string;
};

const requiredBeforeFollowUp: RequiredItem[] = [
  { id: "req-summary", label: "Bring discharge summary", status: "Pending", note: "" },
  { id: "req-labs", label: "Bring all lab reports", status: "Pending", note: "" },
  { id: "req-cbc", label: "CBC test before visit", status: "Pending", note: "Complete within 24 hours before OPD visit." },
  { id: "req-xray", label: "X-Ray before review", status: "Pending", note: "" },
  { id: "req-fasting", label: "Fasting required", status: "Pending", note: "Only if blood sugar or lipid test is planned." },
  { id: "req-meds", label: "Continue medicines till follow-up", status: "Pending", note: "" },
  { id: "req-tpa", label: "Bring insurance/TPA documents if required", status: "Pending", note: "" },
];

const redFlagSymptoms = [
  "High fever",
  "Breathing difficulty",
  "Chest pain",
  "Severe bleeding",
  "Loss of consciousness",
  "Wound swelling or pus",
  "Repeated vomiting",
  "Severe weakness",
];

const instructionSuggestions = [
  "Review after 7 days",
  "Bring reports",
  "Continue medication",
  "Visit emergency if symptoms worsen",
  "Dressing required",
  "Suture removal required",
  "Teleconsultation allowed",
];

const reminderChannels: ReminderChannel[] = ["SMS", "WhatsApp", "Email", "Patient App Notification"];

const departmentOptions = ["Pediatrics", "Orthopedics", "General Medicine", "Cardiology", "Nephrology", "Surgery", "Emergency"];

const physicianOptionsByDepartment: Record<string, string[]> = {
  Pediatrics: ["Dr. Neha Malik", "Dr. Kavita Rao", "Dr. Saurabh Sen"],
  Orthopedics: ["Dr. Aman Verma", "Dr. Rohan Batra", "Dr. Meera Iyer"],
  "General Medicine": ["Dr. Amit Kumar", "Dr. Pooja Mehta", "Dr. Imran Shah"],
  Cardiology: ["Dr. Ritesh Nair", "Dr. Sonia Kapoor"],
  Nephrology: ["Dr. Mohan Ahluvia", "Dr. Farah Khan"],
  Surgery: ["Dr. Nitin Arora", "Dr. Charu Sinha"],
  Emergency: ["Emergency Team", "Dr. Rakesh Sharma"],
};

const clinicLocationByDepartment: Record<string, string> = {
  Pediatrics: "Pediatrics OPD, Room 204",
  Orthopedics: "Ortho OPD, Room 112",
  "General Medicine": "Medicine OPD, Room 101",
  Cardiology: "Cardiology OPD, Room 304",
  Nephrology: "Nephrology OPD, Room 308",
  Surgery: "Surgery OPD, Room 210",
  Emergency: "Emergency review desk",
};

export function DischargeFollowUpHandoverPage({
  plan,
  checklist,
  readOnly,
  onFollowUpChange,
}: {
  plan: DischargePatientPlan;
  checklist: DischargeChecklistItem[];
  readOnly: boolean;
  onFollowUpChange: (field: keyof DischargePatientPlan["followUp"], value: string) => void;
}) {
  const initialDepartment = departmentOptions.includes(plan.followUp.department) ? plan.followUp.department : "General Medicine";
  const initialPhysicians = getPhysicianOptions(initialDepartment);
  const [appointment, setAppointment] = React.useState<AppointmentState>(() => ({
    physician: initialPhysicians.includes(plan.followUp.physician) ? plan.followUp.physician : initialPhysicians[0],
    department: initialDepartment,
    date: plan.followUp.date || "31 May 2026",
    time: plan.followUp.time || "11:30 AM",
    mode: mapPlanMode(plan.followUp.mode),
    destination: mapDestination(plan.destination),
    visitType: "First Follow-up",
    priority: "Routine",
    location: clinicLocationByDepartment[initialDepartment] ?? "Medicine OPD, Room 101",
    contact: "+91 20 4000 1100",
  }));
  const [requiredItems, setRequiredItems] = React.useState<RequiredItem[]>(requiredBeforeFollowUp);
  const [doctorNotes, setDoctorNotes] = React.useState(
    plan.instructions.patientInstructions || "Continue medicines as prescribed. Bring discharge summary and reports during follow-up.",
  );
  const [handoverGroups, setHandoverGroups] = React.useState<HandoverGroup[]>(() => createHandoverGroups(plan));
  const [reminderChannelsSelected, setReminderChannelsSelected] = React.useState<Set<ReminderChannel>>(() => new Set(["SMS", "WhatsApp"]));
  const [reminderTime, setReminderTime] = React.useState<ReminderTime>("24 hours before");
  const [customReminder, setCustomReminder] = React.useState("");
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [activeHandoverGroupId, setActiveHandoverGroupId] = React.useState("nurse");

  const blockerChips = React.useMemo(() => createBlockerChips(plan, checklist, handoverGroups), [checklist, handoverGroups, plan]);
  const pendingBlockers = blockerChips.filter((blocker) => blocker.status === "Pending");
  const handoverComplete = handoverGroups.every((group) => group.items.every((item) => item.status === "Completed"));

  const updateAppointment = (field: keyof AppointmentState, value: string) => {
    if (field === "department") {
      const physicians = getPhysicianOptions(value);
      const physician = physicians.includes(appointment.physician) ? appointment.physician : physicians[0];
      const nextAppointment = {
        ...appointment,
        department: value,
        physician,
        location: clinicLocationByDepartment[value] ?? appointment.location,
      };
      setAppointment(nextAppointment);
      onFollowUpChange("department", value);
      onFollowUpChange("physician", physician);
      return;
    }

    const nextAppointment = { ...appointment, [field]: value };
    setAppointment(nextAppointment);

    if (field === "physician") onFollowUpChange("physician", value);
    if (field === "date") onFollowUpChange("date", value);
    if (field === "time") onFollowUpChange("time", value);
    if (field === "mode") onFollowUpChange("mode", mapModeForPlan(value as FollowUpMode));
  };

  const toggleRequiredItem = (itemId: string) => {
    setRequiredItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, status: item.status === "Completed" ? "Pending" : "Completed" } : item)),
    );
  };

  const appendSuggestion = (suggestion: string) => {
    const separator = doctorNotes.trim() ? "\n" : "";
    setDoctorNotes(`${doctorNotes}${separator}${suggestion}.`);
  };

  const markHandoverDone = (groupId: string, itemId: string) => {
    const nextGroups = handoverGroups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            items: group.items.map((item) =>
              item.id === itemId ? { ...item, status: "Completed" as HandoverStatus, updatedAt: "Now" } : item,
            ),
          }
        : group,
    );
    setHandoverGroups(nextGroups);
    if (nextGroups.every((group) => group.items.every((item) => item.status === "Completed"))) {
      toast.success("All patient handover items completed");
    }
  };

  const toggleReminderChannel = (channel: ReminderChannel) => {
    const nextChannels = new Set(reminderChannelsSelected);
    if (nextChannels.has(channel)) nextChannels.delete(channel);
    else nextChannels.add(channel);
    setReminderChannelsSelected(nextChannels);
  };

  const scrollToSection = (sectionId: string, handoverGroupId?: string) => {
    if (handoverGroupId) setActiveHandoverGroupId(handoverGroupId);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const validateFinalDischarge = () => {
    const errors = getFollowUpValidationErrors(appointment, doctorNotes, redFlagSymptoms, handoverComplete);
    setValidationErrors(errors);

    if (errors.length) {
      toast.error("Follow-up and handover validation needs attention");
      return false;
    }
    if (pendingBlockers.length) {
      toast.warning(`${pendingBlockers.length} discharge blocker${pendingBlockers.length > 1 ? "s are" : " is"} still pending`);
      return false;
    }

    toast.success("Follow-up, reminders, and patient handover are ready for final discharge");
    return true;
  };

  return (
    <div className="space-y-4">
      <DischargeBlockerChips blockers={blockerChips} onClick={scrollToSection} onValidate={validateFinalDischarge} />

      {validationErrors.length ? (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="flex items-start gap-3 p-3 text-sm text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Final discharge validation pending</div>
              <div className="mt-1 text-xs">{validationErrors.join(" | ")}</div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <FollowUpAppointmentCard
            appointment={appointment}
            readOnly={readOnly}
            onChange={updateAppointment}
            onPreview={() => setPreviewOpen(true)}
          />
          <RequiredBeforeFollowUpCard
            items={requiredItems}
            readOnly={readOnly}
            onToggle={toggleRequiredItem}
          />
          <DoctorInstructionsCard notes={doctorNotes} readOnly={readOnly} onChange={setDoctorNotes} onSuggestion={appendSuggestion} />
          <RedFlagSymptomsCard />
          <FollowUpReminderCard
            channels={reminderChannelsSelected}
            reminderTime={reminderTime}
            customReminder={customReminder}
            readOnly={readOnly}
            onToggleChannel={toggleReminderChannel}
            onReminderTimeChange={setReminderTime}
            onCustomReminderChange={setCustomReminder}
          />
          <PatientCopyPreviewCard appointment={appointment} notes={doctorNotes} onPreview={() => setPreviewOpen(true)} />
        </div>

        <PatientHandoverPanel
          groups={handoverGroups}
          activeGroupId={activeHandoverGroupId}
          readOnly={readOnly}
          onGroupChange={setActiveHandoverGroupId}
          onMarkDone={markHandoverDone}
          onValidate={validateFinalDischarge}
        />
      </div>

      <PatientFollowUpPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        plan={plan}
        appointment={appointment}
        requiredItems={requiredItems}
        doctorNotes={doctorNotes}
      />
    </div>
  );
}

function DischargeBlockerChips({
  blockers,
  onClick,
  onValidate,
}: {
  blockers: BlockerChip[];
  onClick: (sectionId: string, handoverGroupId?: string) => void;
  onValidate: () => void;
}) {
  const pendingCount = blockers.filter((blocker) => blocker.status === "Pending").length;
  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-3 xl:flex-row xl:items-center">
        <div>
          <CardTitle>Discharge blockers</CardTitle>
          <CardDescription>Click any status chip to jump to the related follow-up or handover section</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={pendingCount ? "warning" : "success"}>{pendingCount ? `${pendingCount} pending` : "Ready"}</Badge>
          <Button size="sm" variant="outline" onClick={onValidate}>
            <ShieldCheck className="h-4 w-4" />
            Validate final discharge
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {blockers.map((blocker) => (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow-sm",
              blocker.status === "Completed"
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning",
            )}
            onClick={() => onClick(blocker.target, blocker.handoverGroupId)}
            key={blocker.id}
          >
            <span>{blocker.label}</span>
            <Badge tone={blocker.status === "Completed" ? "success" : "warning"}>{blocker.status}</Badge>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function FollowUpAppointmentCard({
  appointment,
  readOnly,
  onChange,
  onPreview,
}: {
  appointment: AppointmentState;
  readOnly: boolean;
  onChange: (field: keyof AppointmentState, value: string) => void;
  onPreview: () => void;
}) {
  return (
    <Card id="followup-appointment">
      <CardHeader className="flex-col items-stretch gap-3 xl:flex-row xl:items-start">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-info" />
            Follow-up Appointment
          </CardTitle>
          <CardDescription>Appointment, visit priority, clinic location, and patient contact details</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => toast.success("Appointment booking queued")} disabled={readOnly}>
            <CalendarCheck className="h-4 w-4" />
            Book Appointment
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info("Follow-up slip print preview opened")}>
            <Printer className="h-4 w-4" />
            Print Follow-up Slip
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Reminder queued for selected channels")}>
            <Send className="h-4 w-4" />
            Send Reminder
          </Button>
          <Button size="sm" variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FieldSelect label="Department / Specialty" value={appointment.department} options={departmentOptions} disabled={readOnly} onChange={(value) => onChange("department", value)} />
        <FieldSelect label="Follow-up physician" value={appointment.physician} options={getPhysicianOptions(appointment.department)} disabled={readOnly} onChange={(value) => onChange("physician", value)} />
        <FieldInput label="Follow-up date" value={appointment.date} disabled={readOnly} onChange={(value) => onChange("date", value)} />
        <FieldInput label="Follow-up time" value={appointment.time} disabled={readOnly} onChange={(value) => onChange("time", value)} />
        <FieldSelect label="Mode" value={appointment.mode} options={["OPD", "Teleconsultation", "Emergency", "Home Visit"]} disabled={readOnly} onChange={(value) => onChange("mode", value)} />
        <FieldSelect label="Destination" value={appointment.destination} options={["Home", "Referral Hospital", "Rehab", "ICU Transfer"]} disabled={readOnly} onChange={(value) => onChange("destination", value)} />
        <FieldSelect label="Visit type" value={appointment.visitType} options={["First Follow-up", "Review", "Dressing", "Suture Removal", "Report Review"]} disabled={readOnly} onChange={(value) => onChange("visitType", value)} />
        <FieldSelect label="Priority" value={appointment.priority} options={["Routine", "Urgent", "Critical"]} disabled={readOnly} onChange={(value) => onChange("priority", value)} />
        <FieldInput label="OPD room / Clinic location" value={appointment.location} disabled={readOnly} onChange={(value) => onChange("location", value)} />
        <FieldInput label="Contact number" value={appointment.contact} disabled={readOnly} onChange={(value) => onChange("contact", value)} />
        <div className="rounded-lg border border-border bg-surface-muted p-3 sm:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Stethoscope className="h-4 w-4" />
            Follow-up readiness
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={appointment.priority} />
            <Badge tone="info">{appointment.mode}</Badge>
            <Badge tone="muted">{appointment.visitType}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RequiredBeforeFollowUpCard({
  items,
  readOnly,
  onToggle,
}: {
  items: RequiredItem[];
  readOnly: boolean;
  onToggle: (itemId: string) => void;
}) {
  const completed = items.filter((item) => item.status === "Completed").length;
  return (
    <Card id="required-before-followup">
      <details>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 border-b border-border px-[var(--density-card-header-x)] py-[var(--density-card-header-y)]">
          <div>
            <CardTitle>Required Before Follow-up</CardTitle>
            <CardDescription>Compact patient-facing checklist for reports, tests, medicines, and documents</CardDescription>
          </div>
          <Badge tone={completed === items.length ? "success" : "warning"}>{completed}/{items.length} completed</Badge>
        </summary>
        <CardContent className="grid gap-2 lg:grid-cols-2">
          {items.map((item) => (
            <div className="rounded-lg border border-border bg-background p-3" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex min-w-0 items-start gap-3 text-sm font-medium text-foreground">
                  <input
                    className="mt-1 h-4 w-4 rounded border-border accent-primary"
                    type="checkbox"
                    checked={item.status === "Completed"}
                    disabled={readOnly}
                    onChange={() => onToggle(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
                <StatusBadge status={item.status} />
              </div>
              {item.note ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{item.note}</div> : null}
            </div>
          ))}
        </CardContent>
      </details>
    </Card>
  );
}

function DoctorInstructionsCard({
  notes,
  readOnly,
  onChange,
  onSuggestion,
}: {
  notes: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  onSuggestion: (value: string) => void;
}) {
  return (
    <Card id="doctor-followup-instructions">
      <CardHeader>
        <div>
          <CardTitle>Doctor Follow-up Instructions</CardTitle>
          <CardDescription>Clear advice for patient, attendant, and OPD review team</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea className={textareaClassName} value={notes} disabled={readOnly} onChange={(event) => onChange(event.target.value)} />
        <div className="flex flex-wrap gap-2">
          {instructionSuggestions.map((suggestion) => (
            <button
              type="button"
              className="rounded-full border border-info/30 bg-info/10 px-3 py-1.5 text-xs font-medium text-info transition hover:bg-info/15 disabled:opacity-50"
              disabled={readOnly}
              onClick={() => onSuggestion(suggestion)}
              key={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RedFlagSymptomsCard() {
  return (
    <Card id="red-flag-symptoms" className="border-danger/30 bg-danger/5">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" />
            Visit Emergency Immediately If
          </CardTitle>
          <CardDescription>Red flag symptoms explained in patient-friendly language</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {redFlagSymptoms.map((symptom, index) => (
          <div
            className={cn(
              "rounded-lg border p-3 text-sm font-medium",
              index < 4 ? "border-danger/30 bg-danger/10 text-danger" : "border-warning/30 bg-warning/10 text-warning",
            )}
            key={symptom}
          >
            {symptom}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FollowUpReminderCard({
  channels,
  reminderTime,
  customReminder,
  readOnly,
  onToggleChannel,
  onReminderTimeChange,
  onCustomReminderChange,
}: {
  channels: Set<ReminderChannel>;
  reminderTime: ReminderTime;
  customReminder: string;
  readOnly: boolean;
  onToggleChannel: (channel: ReminderChannel) => void;
  onReminderTimeChange: (value: ReminderTime) => void;
  onCustomReminderChange: (value: string) => void;
}) {
  return (
    <Card id="followup-reminder">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-info" />
            Follow-up Reminder
          </CardTitle>
          <CardDescription>Reminder channel and timing preference for patient communication</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {reminderChannels.map((channel) => (
            <label className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm" key={channel}>
              <input
                className="h-4 w-4 rounded border-border accent-primary"
                type="checkbox"
                checked={channels.has(channel)}
                disabled={readOnly}
                onChange={() => onToggleChannel(channel)}
              />
              <ReminderIcon channel={channel} />
              <span>{channel}</span>
            </label>
          ))}
        </div>
        <div className="space-y-2">
          <FieldSelect
            label="Reminder time"
            value={reminderTime}
            options={["24 hours before", "2 hours before", "Custom"]}
            disabled={readOnly}
            onChange={(value) => onReminderTimeChange(value as ReminderTime)}
          />
          {reminderTime === "Custom" ? (
            <Input value={customReminder} disabled={readOnly} onChange={(event) => onCustomReminderChange(event.target.value)} placeholder="Example: 4 hours before" />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function PatientCopyPreviewCard({
  appointment,
  notes,
  onPreview,
}: {
  appointment: AppointmentState;
  notes: string;
  onPreview: () => void;
}) {
  return (
    <Card id="patient-copy-preview">
      <CardHeader className="flex-col items-stretch gap-3 xl:flex-row xl:items-start">
        <div>
          <CardTitle>Patient Copy Preview</CardTitle>
          <CardDescription>Simple language preview for patient and attendant handover</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info("Print preview is UI only in this frontend demo")}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Share UI action queued")}>
            <Send className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
          Your follow-up appointment is scheduled with <span className="font-semibold text-foreground">{appointment.physician}</span> in{" "}
          <span className="font-semibold text-foreground">{appointment.department}</span> on{" "}
          <span className="font-semibold text-foreground">{appointment.date}</span> at{" "}
          <span className="font-semibold text-foreground">{appointment.time}</span>. Please bring your discharge summary and latest reports.
          Visit emergency immediately if fever, breathing difficulty, chest pain, bleeding, or severe weakness occurs.
          <div className="mt-3 text-xs">{notes}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientHandoverPanel({
  groups,
  activeGroupId,
  readOnly,
  onGroupChange,
  onMarkDone,
  onValidate,
}: {
  groups: HandoverGroup[];
  activeGroupId: string;
  readOnly: boolean;
  onGroupChange: (groupId: string) => void;
  onMarkDone: (groupId: string, itemId: string) => void;
  onValidate: () => void;
}) {
  const total = groups.reduce((count, group) => count + group.items.length, 0);
  const completed = groups.reduce((count, group) => count + group.items.filter((item) => item.status === "Completed").length, 0);

  return (
    <Card id="patient-handover-checklist" className="h-fit 2xl:sticky 2xl:top-[88px]">
      <CardHeader>
        <div>
          <CardTitle>Patient Handover Checklist</CardTitle>
          <CardDescription>Nurse, billing, pharmacy, and summary clearance before exit</CardDescription>
        </div>
        <Badge tone={completed === total ? "success" : "warning"}>{completed}/{total}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={activeGroupId} onValueChange={onGroupChange}>
          <TabsList className="grid grid-cols-2 lg:grid-cols-4">
            {groups.map((group) => (
              <TabsTrigger value={group.id} key={group.id} className="h-auto py-2">
                <span className="flex flex-col items-start leading-tight">
                  <span>{getShortGroupTitle(group.title)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {group.items.filter((item) => item.status === "Completed").length}/{group.items.length}
                  </span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {groups.map((group) => (
            <TabsContent value={group.id} key={group.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-3">
                <div className="text-sm font-semibold text-foreground">{group.title}</div>
                <Badge tone={group.items.every((item) => item.status === "Completed") ? "success" : group.items.some((item) => item.status === "Blocked") ? "danger" : "warning"}>
                  {group.items.filter((item) => item.status === "Completed").length}/{group.items.length}
                </Badge>
              </div>
              {group.items.map((item) => (
                <div className="rounded-md border border-border bg-surface-muted p-2" key={item.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{item.owner} | Updated {item.updatedAt}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.info(`${item.label} details opened`)}>
                      View Details
                    </Button>
                    <Button size="sm" disabled={readOnly || item.status === "Completed"} onClick={() => onMarkDone(group.id, item.id)}>
                      {item.status === "Blocked" ? "Resolve" : "Mark Done"}
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
        <Button className="w-full" onClick={onValidate}>
          <ClipboardCheck className="h-4 w-4" />
          Validate Handover
        </Button>
      </CardContent>
    </Card>
  );
}

function PatientFollowUpPreviewModal({
  open,
  onClose,
  plan,
  appointment,
  requiredItems,
  doctorNotes,
}: {
  open: boolean;
  onClose: () => void;
  plan: DischargePatientPlan;
  appointment: AppointmentState;
  requiredItems: RequiredItem[];
  doctorNotes: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(94vw,820px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">Patient Follow-up Instructions Preview</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Patient-friendly copy for discharge handover, print, or share.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close preview">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-surface-muted p-4">
            <div className="mx-auto max-w-[720px] rounded-lg border border-border bg-white p-6 text-slate-950 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <div className="text-lg font-bold">Follow-up Instructions</div>
                <div className="mt-1 text-sm text-slate-600">{plan.patientName} | {plan.uhid} | {plan.ward}</div>
              </div>
              <div className="mt-4 text-sm leading-6 text-slate-700">
                Your follow-up appointment is scheduled with <b>{appointment.physician}</b> in <b>{appointment.department}</b> on{" "}
                <b>{appointment.date}</b> at <b>{appointment.time}</b>.
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <PreviewLine label="Mode" value={appointment.mode} />
                <PreviewLine label="Visit type" value={appointment.visitType} />
                <PreviewLine label="Location" value={appointment.location} />
                <PreviewLine label="Contact" value={appointment.contact} />
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="font-semibold">Please bring</div>
                <ul className="mt-2 list-inside list-disc space-y-1 text-slate-700">
                  {requiredItems.slice(0, 5).map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <div className="font-semibold">Visit emergency immediately if</div>
                <div className="mt-1">{redFlagSymptoms.join(", ")}.</div>
              </div>
              <div className="mt-4 text-sm leading-6 text-slate-700">{doctorNotes}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3">
            <Button variant="outline" onClick={() => toast.info("Print preview is UI only in this frontend demo")}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={() => toast.success("Share UI action queued")}>
              <Send className="h-4 w-4" />
              Share
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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

function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}

function ReminderIcon({ channel }: { channel: ReminderChannel }) {
  if (channel === "WhatsApp") return <MessageCircle className="h-4 w-4 text-success" />;
  if (channel === "Email") return <Mail className="h-4 w-4 text-info" />;
  if (channel === "Patient App Notification") return <Bell className="h-4 w-4 text-warning" />;
  return <Phone className="h-4 w-4 text-info" />;
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 p-2">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-slate-800">{value}</div>
    </div>
  );
}

function getShortGroupTitle(title: string) {
  return title.replace(/^[A-D]\.\s*/, "").replace(" Clearance", "");
}

function createHandoverGroups(plan: DischargePatientPlan): HandoverGroup[] {
  return [
    {
      id: "nurse",
      title: "A. Nurse Clearance",
      items: [
        { id: "nurse-vitals", label: "Vitals stable", owner: "Nurse", status: plan.nurseClearance === "Done" ? "Completed" : "Pending", updatedAt: "Today 10:10" },
        { id: "nurse-iv", label: "IV cannula removed", owner: "Nurse", status: "Pending", updatedAt: "Today 10:12" },
        { id: "nurse-dressing", label: "Wound dressing explained", owner: "Nurse", status: "Pending", updatedAt: "Today 10:14" },
        { id: "nurse-education", label: "Patient education completed", owner: "Nurse", status: plan.nurseClearance === "Done" ? "Completed" : "Pending", updatedAt: "Today 10:15" },
      ],
    },
    {
      id: "billing",
      title: "B. Billing Clearance",
      items: [
        { id: "billing-bill", label: "Final bill generated", owner: "Billing", status: plan.billingStatus === "Cleared" ? "Completed" : "Pending", updatedAt: "Today 10:18" },
        { id: "billing-payment", label: "Payment completed", owner: "Billing", status: plan.billingStatus === "Query raised" ? "Blocked" : plan.billingStatus === "Cleared" ? "Completed" : "Pending", updatedAt: "Today 10:20" },
        { id: "billing-tpa", label: "TPA approval received", owner: "Billing", status: plan.payer === "TPA" || plan.payer === "Insurance" ? "Pending" : "Completed", updatedAt: "Today 10:22" },
      ],
    },
    {
      id: "pharmacy",
      title: "C. Pharmacy Clearance",
      items: [
        { id: "pharmacy-issued", label: "Discharge medicines issued", owner: "Pharmacy", status: plan.pharmacyStatus === "Reconciled" ? "Completed" : "Pending", updatedAt: "Today 10:24" },
        { id: "pharmacy-counselling", label: "Medicine counselling completed", owner: "Pharmacy", status: "Pending", updatedAt: "Today 10:25" },
        { id: "pharmacy-risk", label: "High-risk medicine explained", owner: "Pharmacy", status: plan.riskFlags.length ? "Pending" : "Completed", updatedAt: "Today 10:26" },
      ],
    },
    {
      id: "summary",
      title: "D. Summary Clearance",
      items: [
        { id: "summary-generated", label: "Discharge summary generated", owner: "Doctor", status: plan.summaryStatus === "Draft" ? "Pending" : "Completed", updatedAt: "Today 10:28" },
        { id: "summary-signed", label: "Doctor signed", owner: "Doctor", status: plan.summaryStatus === "Signed" ? "Completed" : "Pending", updatedAt: "Today 10:30" },
        { id: "summary-ack", label: "Patient/attendant acknowledgement taken", owner: "Nurse", status: "Pending", updatedAt: "Today 10:32" },
      ],
    },
  ];
}

function createBlockerChips(plan: DischargePatientPlan, checklist: DischargeChecklistItem[], handoverGroups: HandoverGroup[]): BlockerChip[] {
  const nurseDone = handoverGroupDone(handoverGroups, "nurse");
  const billingDone = handoverGroupDone(handoverGroups, "billing") || checklistCategoryDone(checklist, "Billing") || plan.billingStatus === "Cleared";
  const pharmacyDone = handoverGroupDone(handoverGroups, "pharmacy") || plan.pharmacyStatus === "Reconciled";
  const summaryDone = handoverGroupDone(handoverGroups, "summary") || checklistCategoryDone(checklist, "Summary") || plan.summaryStatus === "Signed";
  const medicationDone = checklistCategoryDone(checklist, "Medication") || pharmacyDone;
  const educationDone =
    nurseDone || checklist.some((item) => item.label.toLowerCase().includes("education") && item.status === "Done") || plan.nurseClearance === "Done";

  return [
    { id: "block-med", label: "Medication reconciliation completed", status: medicationDone ? "Completed" : "Pending", target: "patient-handover-checklist", handoverGroupId: "pharmacy" },
    { id: "block-education", label: "Patient education and guardian counselling", status: educationDone ? "Completed" : "Pending", target: "patient-handover-checklist", handoverGroupId: "nurse" },
    { id: "block-billing", label: "Final bill and payment clearance", status: billingDone ? "Completed" : "Pending", target: "patient-handover-checklist", handoverGroupId: "billing" },
    { id: "block-summary", label: "Discharge summary generated and signed", status: summaryDone ? "Completed" : "Pending", target: "patient-handover-checklist", handoverGroupId: "summary" },
    { id: "block-pharmacy", label: "Pharmacy handover completed", status: pharmacyDone ? "Completed" : "Pending", target: "patient-handover-checklist", handoverGroupId: "pharmacy" },
  ];
}

function handoverGroupDone(groups: HandoverGroup[], groupId: string) {
  const group = groups.find((item) => item.id === groupId);
  return Boolean(group && group.items.every((item) => item.status === "Completed"));
}

function checklistCategoryDone(checklist: DischargeChecklistItem[], category: DischargeChecklistItem["category"]) {
  const rows = checklist.filter((item) => item.category === category && item.status !== "Not required");
  return rows.length > 0 && rows.every((item) => item.status === "Done");
}

function getFollowUpValidationErrors(appointment: AppointmentState, doctorNotes: string, symptoms: string[], handoverComplete: boolean) {
  const errors: string[] = [];
  if (!appointment.physician.trim()) errors.push("Follow-up physician required");
  if (!appointment.department.trim()) errors.push("Department required");
  if (!appointment.date.trim()) errors.push("Date required");
  if (!appointment.time.trim()) errors.push("Time required");
  if (!appointment.mode.trim()) errors.push("Mode required");
  if (!appointment.destination.trim()) errors.push("Destination required");
  if (!doctorNotes.trim()) errors.push("Doctor instructions required");
  if (!symptoms.length) errors.push("Red flag instructions required");
  if (!handoverComplete) errors.push("Handover checklist must be completed");
  return errors;
}

function mapPlanMode(mode: DischargePatientPlan["followUp"]["mode"]): FollowUpMode {
  if (mode === "Teleconsultation") return "Teleconsultation";
  if (mode === "Emergency return") return "Emergency";
  return "OPD";
}

function mapModeForPlan(mode: FollowUpMode): DischargePatientPlan["followUp"]["mode"] {
  if (mode === "Teleconsultation") return "Teleconsultation";
  if (mode === "Emergency") return "Emergency return";
  return "OPD";
}

function mapDestination(destination: DischargePatientPlan["destination"]): FollowUpDestination {
  if (destination === "Another hospital") return "Referral Hospital";
  if (destination === "Rehabilitation") return "Rehab";
  return "Home";
}

function getPhysicianOptions(department: string) {
  return physicianOptionsByDepartment[department] ?? physicianOptionsByDepartment["General Medicine"];
}

function statusTone(status: string): StatusTone {
  if (["Completed", "Routine", "Home", "OPD"].includes(status)) return "success";
  if (["Pending", "Urgent", "Teleconsultation", "Home Visit"].includes(status)) return "warning";
  if (["Blocked", "Critical", "Emergency", "ICU Transfer"].includes(status)) return "danger";
  if (["Referral Hospital", "Rehab", "First Follow-up", "Review"].includes(status)) return "info";
  return "muted";
}
