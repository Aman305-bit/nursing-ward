import type {
  AdmissionBed,
  AdmissionBedStatus,
  AdmissionPatient,
  AdmissionRequest,
  AdmissionScreenConfig,
  AdmissionScreenId,
  BillingClearance,
} from "@/features/admission/types";

export const admissionScreens: AdmissionScreenConfig[] = [
  {
    id: "reception",
    label: "Reception",
    route: "/admission/reception",
    role: "Reception",
    roleSummary: "Patient lookup and registration",
    workspaceTitle: "Reception Admission Workspace",
    workspaceDescription:
      "Search patient, start new registration, handle old patient re-admission, and create emergency temporary registration.",
    chips: ["Patient lookup", "New UHID", "Re-admission", "Emergency temp ID"],
    steps: ["1. Patient Lookup"],
  },
  {
    id: "doctor",
    label: "Doctor",
    route: "/admission/doctor",
    role: "Doctor",
    roleSummary: "Clinical admission order",
    workspaceTitle: "Doctor Admission Workspace",
    workspaceDescription:
      "Review patient context and create the clinical admission order with source, diagnosis intent, ward preference, and priority.",
    chips: ["Admission order", "Clinical priority", "Ward request", "Doctor notes"],
    steps: ["1. Admission Order"],
  },
  {
    id: "admission-desk",
    label: "Admission Desk",
    route: "/admission/admission-desk",
    role: "Admission Desk",
    roleSummary: "Request verification queue",
    workspaceTitle: "Admission Desk Workspace",
    workspaceDescription:
      "Validate admission requests, review pending or accepted queue, and send clean requests forward for bed allotment.",
    chips: ["Request queue", "Verification", "Pending filter", "Accepted filter"],
    steps: ["1. Requests"],
  },
  {
    id: "bed-manager",
    label: "Bed Manager",
    route: "/admission/bed-manager",
    role: "Bed Manager",
    roleSummary: "Bed allotment and transfer",
    workspaceTitle: "Bed Manager Workspace",
    workspaceDescription:
      "Manage bed availability, reservations, cleaning, maintenance, isolation needs, transfers, and final bed allotment.",
    chips: ["100-bed view", "Ward filter", "Bed status", "Transfer"],
    steps: ["1. Bed Manager"],
  },
  {
    id: "nurse-receive",
    label: "Nurse Receive",
    route: "/admission/nurse-receive",
    role: "Nurse",
    roleSummary: "Receive patient and start care",
    workspaceTitle: "Nursing Admission Workspace",
    workspaceDescription:
      "Receive the patient on ward, verify identity, verify order and bed, record arrival details, and confirm handover.",
    chips: ["Receive patient", "Checklist", "Vitals", "Care start"],
    steps: ["1. Receive Patient", "2. Patient Care"],
  },
  {
    id: "nurse-care",
    label: "Nurse Care",
    route: "/admission/nurse-care",
    role: "Nurse",
    roleSummary: "Initial vitals and care notes",
    workspaceTitle: "Nursing Admission Workspace",
    workspaceDescription:
      "Record initial vitals, add care notes, and start the inpatient care plan after patient receive confirmation.",
    chips: ["Receive patient", "Checklist", "Vitals", "Care start"],
    steps: ["1. Receive Patient", "2. Patient Care"],
  },
  {
    id: "billing",
    label: "Billing",
    route: "/admission/billing",
    role: "Billing",
    roleSummary: "Insurance and payment clearance",
    workspaceTitle: "Billing Admission Workspace",
    workspaceDescription:
      "Review insurance status, billing holds, payment risk, and approvals before bed confirmation or final admission.",
    chips: ["Insurance hold", "Pre-auth", "Self pay", "Clearance"],
    steps: ["1. Billing"],
  },
  {
    id: "admin",
    label: "Admin",
    route: "/admission",
    role: "Admin",
    roleSummary: "Full admission workflow",
    workspaceTitle: "Admin Admission Workspace",
    workspaceDescription:
      "Full admission workflow monitoring with access to every step, exception, status, and operational handoff.",
    chips: ["Full workflow", "All roles", "Exceptions", "Monitoring"],
    steps: [
      "1. Patient Lookup",
      "2. Admission Order",
      "3. Requests",
      "4. Billing",
      "5. Bed Manager",
      "6. Receive Patient",
      "7. Patient Care",
    ],
  },
];

export const admissionScreenMap = admissionScreens.reduce(
  (screenMap, screen) => {
    screenMap[screen.id] = screen;
    return screenMap;
  },
  {} as Record<AdmissionScreenId, AdmissionScreenConfig>,
);

export const lookupPatients: AdmissionPatient[] = [
  {
    id: "pat-001",
    name: "Raju Agarwal",
    uhid: "UHID-20491",
    ageSex: "18/M",
    phone: "+91 98765 20491",
    status: "Admission request exists",
  },
  {
    id: "pat-002",
    name: "Shyamala",
    uhid: "UHID-20492",
    ageSex: "36/F",
    phone: "+91 98765 20492",
    status: "Admission request exists",
  },
  {
    id: "pat-003",
    name: "Meera Iyer",
    uhid: "UHID-20493",
    ageSex: "52/F",
    phone: "+91 98765 20493",
    status: "Admission request exists",
  },
  {
    id: "pat-004",
    name: "Amit Verma",
    uhid: "UHID-19882",
    ageSex: "42/M",
    phone: "+91 98765 19882",
    status: "Already admitted / Transfer",
  },
  {
    id: "pat-005",
    name: "Neha Singh",
    uhid: "UHID-20018",
    ageSex: "34/F",
    phone: "+91 98765 20018",
    status: "Already admitted / Transfer",
  },
];

export const admissionRequests: AdmissionRequest[] = [
  {
    id: "req-001",
    patient: "Raju Agarwal",
    uhid: "UHID-20491",
    source: "Emergency",
    doctor: "Dr. Mohan Ahluvia",
    type: "Regular",
    ward: "ICU",
    priority: "Urgent",
    status: "Pending Bed Allotment",
    admissionTime: "20 May, 04:31 PM",
  },
  {
    id: "req-002",
    patient: "Meera Iyer",
    uhid: "UHID-20493",
    source: "OPD",
    doctor: "Dr. Neha Rao",
    type: "Observation",
    ward: "General Ward",
    priority: "Critical",
    status: "Pending Bed Allotment",
    admissionTime: "20 May, 05:05 PM",
  },
  {
    id: "req-003",
    patient: "Shyamala",
    uhid: "UHID-20492",
    source: "OPD",
    doctor: "Dr. Kamal Sen",
    type: "Regular",
    ward: "Private Ward",
    priority: "Routine",
    status: "Accepted",
    admissionTime: "20 May, 05:40 PM",
  },
];

export const billingClearances: BillingClearance[] = [
  {
    id: "bill-001",
    patient: "Meera Iyer",
    uhid: "UHID-20493",
    holdType: "Pre-auth Pending",
    risk: "High",
    estimate: 42000,
    note: "Insurance pre-auth required before ICU/private bed confirmation.",
  },
  {
    id: "bill-002",
    patient: "Pooja Das",
    uhid: "UHID-20496",
    holdType: "Insurance Hold",
    risk: "Medium",
    estimate: 18500,
    note: "Observation admission allowed, but billing desk approval is required.",
  },
  {
    id: "bill-003",
    patient: "Lata Sharma",
    uhid: "UHID-19421",
    holdType: "Self Pay",
    risk: "Low",
    estimate: 12000,
    note: "Collect updated billing details for re-admission.",
  },
];

const wards = [
  { key: "ICU", prefix: "ICU", floor: "1st Floor", roomType: "Critical Care Bed", station: "Station A" },
  { key: "General Ward", prefix: "GW", floor: "2nd Floor", roomType: "General Bed", station: "Station B" },
  { key: "Private Ward", prefix: "PW", floor: "3rd Floor", roomType: "Private Room", station: "Station C" },
  { key: "Emergency", prefix: "ER", floor: "Ground Floor", roomType: "Emergency Bed", station: "ER Desk" },
  { key: "Pediatric", prefix: "PED", floor: "2nd Floor", roomType: "Pediatric Bed", station: "Station P" },
];

const statusPattern: AdmissionBedStatus[] = [
  "Available",
  "Occupied",
  "Available",
  "Cleaning",
  "Reserved",
  "Available",
  "Maintenance",
  "Occupied",
  "Isolation",
  "Blocked",
];

const wardCounters: Record<string, number> = {};

export const admissionBeds: AdmissionBed[] = Array.from({ length: 100 }, (_, index) => {
  const ward = wards[index % wards.length];
  wardCounters[ward.key] = (wardCounters[ward.key] ?? 0) + 1;
  const localNo = String(wardCounters[ward.key]).padStart(3, "0");
  const status = statusPattern[index % statusPattern.length];
  return {
    id: `bed-${index + 1}`,
    bedNo: `${ward.prefix}-${localNo}`,
    ward: ward.key,
    floor: ward.floor,
    roomType: ward.roomType,
    nurseStation: ward.station,
    status,
    lastUpdated: `${9 + (index % 4)}:${String((index * 7) % 60).padStart(2, "0")} AM`,
    tags: [
      ward.key === "ICU" ? "Acuity match" : "Ward match",
      index % 3 === 0 ? "Gender compatible" : "No restriction",
      status === "Isolation" ? "Isolation protocol" : "Ready checklist",
    ],
  };
});

export const nurseReceiveChecklist = [
  "Patient identity verified",
  "Admission order verified",
  "Bed and ward confirmed",
];

export const admissionWorkflowCards = [
  { title: "Patient Lookup", owner: "Reception", route: "/admission/reception", status: "Start here" },
  { title: "Admission Order", owner: "Doctor", route: "/admission/doctor", status: "Clinical input" },
  { title: "Requests", owner: "Admission Desk", route: "/admission/admission-desk", status: "Verification" },
  { title: "Billing", owner: "Billing", route: "/admission/billing", status: "Clearance" },
  { title: "Bed Manager", owner: "Bed Manager", route: "/admission/bed-manager", status: "Allotment" },
  { title: "Receive Patient", owner: "Nurse", route: "/admission/nurse-receive", status: "Handover" },
  { title: "Patient Care", owner: "Nurse", route: "/admission/nurse-care", status: "Care start" },
];
