import type {
  AppointmentRecord,
  AppointmentSlot,
  DoctorSchedule,
  FollowUpRecord,
  FrontOfficeWorkItem,
  QueueEntry,
  TeleconsultationRecord,
  TokenRecord,
} from "@/types";

export const mockAppointments: AppointmentRecord[] = [
  { id: "appt-001", appointmentNo: "APT-5261", patientId: "pat-001", department: "Cardiology", doctor: "Dr. Kavita Rao", date: "20 May 2026", startTime: "09:40", endTime: "09:55", visitType: "Follow-up", appointmentType: "Regular", status: "Checked in", priority: "VIP", source: "Reception", reason: "Cardiology review", tokenId: "tok-001", teleconsultation: false, room: "OPD 3", counter: "Counter 2", checkedInAt: "09:28", paymentStatus: "Paid", createdBy: "Reception", createdAt: "Today 08:10" },
  { id: "appt-002", appointmentNo: "APT-5262", patientId: "pat-002", department: "Orthopedics", doctor: "Dr. Aman Verma", date: "20 May 2026", startTime: "10:00", endTime: "10:15", visitType: "New", appointmentType: "Walk-in", status: "Waiting", priority: "Urgent", source: "Walk-in", reason: "Post fracture follow-up", tokenId: "tok-002", teleconsultation: false, room: "OPD 6", counter: "Counter 1", checkedInAt: "09:50", paymentStatus: "Pending", createdBy: "Reception", createdAt: "Today 09:35" },
  { id: "appt-003", appointmentNo: "APT-5263", patientId: "pat-003", department: "Pediatrics", doctor: "Dr. Neha Malik", date: "20 May 2026", startTime: "10:20", endTime: "10:35", visitType: "Review", appointmentType: "Regular", status: "Late", priority: "Routine", source: "Phone", reason: "Asthma review", tokenId: "tok-003", teleconsultation: false, room: "OPD 1", counter: "Counter 3", paymentStatus: "Pending", createdBy: "Reception", createdAt: "Yesterday 17:10" },
  { id: "appt-004", appointmentNo: "APT-5264", patientId: "pat-004", department: "Emergency", doctor: "Emergency Desk", date: "20 May 2026", startTime: "10:12", endTime: "10:27", visitType: "Emergency", appointmentType: "Emergency", status: "In consultation", priority: "Emergency", source: "Ambulance", reason: "Unknown emergency intake", tokenId: "tok-004", teleconsultation: false, room: "ER Bay 2", counter: "Emergency", checkedInAt: "10:12", paymentStatus: "Not required", createdBy: "Emergency desk", createdAt: "Today 10:12" },
  { id: "appt-005", appointmentNo: "APT-5265", patientId: "pat-001", department: "Cardiology", doctor: "Dr. Kavita Rao", date: "20 May 2026", startTime: "16:30", endTime: "16:45", visitType: "Follow-up", appointmentType: "Teleconsultation", status: "Confirmed", priority: "Routine", source: "Follow-up desk", reason: "Teleconsultation review", teleconsultation: true, room: "Virtual Room 1", counter: "Tele desk", paymentStatus: "Package", createdBy: "Front office", createdAt: "Today 09:00" },
  { id: "appt-006", appointmentNo: "APT-5258", patientId: "pat-006", department: "Cardiology", doctor: "Dr. Kavita Rao", date: "20 May 2026", startTime: "08:20", endTime: "08:35", visitType: "Review", appointmentType: "Regular", status: "No-show", priority: "Routine", source: "Phone", reason: "Duplicate review patient missed", teleconsultation: false, room: "OPD 3", counter: "Counter 2", paymentStatus: "Pending", createdBy: "Reception", createdAt: "Yesterday 16:45" },
];

export const mockAppointmentSlots: AppointmentSlot[] = [
  { id: "slot-001", doctor: "Dr. Kavita Rao", department: "Cardiology", date: "20 May 2026", time: "10:45", duration: 15, room: "OPD 3", status: "Available" },
  { id: "slot-002", doctor: "Dr. Kavita Rao", department: "Cardiology", date: "20 May 2026", time: "11:00", duration: 15, room: "OPD 3", status: "Booked" },
  { id: "slot-003", doctor: "Dr. Aman Verma", department: "Orthopedics", date: "20 May 2026", time: "11:15", duration: 15, room: "OPD 6", status: "Overbook allowed" },
  { id: "slot-004", doctor: "Dr. Neha Malik", department: "Pediatrics", date: "20 May 2026", time: "12:00", duration: 20, room: "OPD 1", status: "Doctor unavailable" },
  { id: "slot-005", doctor: "Emergency Desk", department: "Emergency", date: "20 May 2026", time: "Now", duration: 15, room: "ER Bay 2", status: "Available" },
];

export const mockDoctorSchedules: DoctorSchedule[] = [
  { id: "sch-001", doctor: "Dr. Kavita Rao", department: "Cardiology", dayOfWeek: "Mon-Sat", startTime: "09:00", endTime: "13:00", slotDuration: 15, room: "OPD 3", maxPatients: 24, status: "Active" },
  { id: "sch-002", doctor: "Dr. Aman Verma", department: "Orthopedics", dayOfWeek: "Mon-Fri", startTime: "10:00", endTime: "15:00", slotDuration: 15, room: "OPD 6", maxPatients: 28, status: "Active" },
  { id: "sch-003", doctor: "Dr. Neha Malik", department: "Pediatrics", dayOfWeek: "Wed", startTime: "12:00", endTime: "14:00", slotDuration: 20, room: "OPD 1", maxPatients: 8, status: "Blocked" },
  { id: "sch-004", doctor: "Emergency Desk", department: "Emergency", dayOfWeek: "Daily", startTime: "00:00", endTime: "23:59", slotDuration: 15, room: "ER Bay 2", maxPatients: 80, status: "Active" },
];

export const mockQueueEntries: QueueEntry[] = [
  { id: "queue-001", appointmentId: "appt-001", patientId: "pat-001", tokenNo: "C-018", position: 1, department: "Cardiology", doctor: "Dr. Kavita Rao", status: "Called", waitingSince: "09:28", priority: "VIP", checkedInAt: "09:28", calledAt: "10:02", delayLevel: "Approaching delay" },
  { id: "queue-002", appointmentId: "appt-002", patientId: "pat-002", tokenNo: "O-014", position: 2, department: "Orthopedics", doctor: "Dr. Aman Verma", status: "Waiting", waitingSince: "09:50", priority: "Urgent", checkedInAt: "09:50", delayLevel: "Delayed" },
  { id: "queue-003", appointmentId: "appt-004", patientId: "pat-004", tokenNo: "ER-001", position: 0, department: "Emergency", doctor: "Emergency Desk", status: "In consultation", waitingSince: "10:12", priority: "Emergency", checkedInAt: "10:12", calledAt: "10:13", delayLevel: "Critical delay" },
  { id: "queue-004", appointmentId: "appt-003", patientId: "pat-003", tokenNo: "P-007", position: 3, department: "Pediatrics", doctor: "Dr. Neha Malik", status: "On hold", waitingSince: "10:30", priority: "Routine", checkedInAt: "10:30", delayLevel: "Normal", statusReason: "Guardian consent pending" },
];

export const mockTokens: TokenRecord[] = [
  { id: "tok-001", tokenNo: "C-018", prefix: "C", patientId: "pat-001", appointmentId: "appt-001", department: "Cardiology", doctor: "Dr. Kavita Rao", counter: "Counter 2", status: "Called", issuedAt: "09:29", calledAt: "10:02", reprintCount: 0 },
  { id: "tok-002", tokenNo: "O-014", prefix: "O", patientId: "pat-002", appointmentId: "appt-002", department: "Orthopedics", doctor: "Dr. Aman Verma", counter: "Counter 1", status: "Issued", issuedAt: "09:51", reprintCount: 1, lastReprintReason: "Patient misplaced slip" },
  { id: "tok-003", tokenNo: "P-007", prefix: "P", patientId: "pat-003", appointmentId: "appt-003", department: "Pediatrics", doctor: "Dr. Neha Malik", counter: "Counter 3", status: "Held", issuedAt: "10:30", reprintCount: 0 },
  { id: "tok-004", tokenNo: "ER-001", prefix: "ER", patientId: "pat-004", appointmentId: "appt-004", department: "Emergency", doctor: "Emergency Desk", counter: "Emergency", status: "Serving", issuedAt: "10:12", calledAt: "10:13", reprintCount: 0 },
  { id: "tok-005", tokenNo: "C-011", prefix: "C", patientId: "pat-006", appointmentId: "appt-006", department: "Cardiology", doctor: "Dr. Kavita Rao", counter: "Counter 2", status: "Expired", issuedAt: "08:21", reprintCount: 0 },
];

export const mockFollowUps: FollowUpRecord[] = [
  { id: "fu-001", patientId: "pat-001", lastVisitId: "visit-001", department: "Cardiology", doctor: "Dr. Kavita Rao", dueDate: "Today", reason: "Medication review", status: "Due today", contactAttempts: 1 },
  { id: "fu-002", patientId: "pat-002", lastVisitId: "visit-003", department: "Orthopedics", doctor: "Dr. Aman Verma", dueDate: "18 May 2026", reason: "Post-discharge review", status: "Overdue", contactAttempts: 3 },
  { id: "fu-003", patientId: "pat-003", lastVisitId: "visit-005", department: "Pediatrics", doctor: "Dr. Neha Malik", dueDate: "22 May 2026", reason: "Asthma review", status: "Scheduled", contactAttempts: 0 },
  { id: "fu-004", patientId: "pat-006", lastVisitId: "visit-001", department: "Cardiology", doctor: "Dr. Kavita Rao", dueDate: "Yesterday", reason: "Duplicate identity review", status: "Missed", contactAttempts: 2 },
];

export const mockTeleconsultations: TeleconsultationRecord[] = [
  { id: "tele-001", appointmentId: "appt-005", patientId: "pat-001", time: "16:30", doctor: "Dr. Kavita Rao", department: "Cardiology", consentStatus: "Signed", linkStatus: "Ready to join", appointmentStatus: "Confirmed" },
  { id: "tele-002", appointmentId: "appt-003", patientId: "pat-003", time: "17:00", doctor: "Dr. Neha Malik", department: "Pediatrics", consentStatus: "Pending", linkStatus: "Link pending", appointmentStatus: "Scheduled" },
  { id: "tele-003", appointmentId: "appt-006", patientId: "pat-006", time: "08:20", doctor: "Dr. Kavita Rao", department: "Cardiology", consentStatus: "Missing", linkStatus: "Failed/no-show", appointmentStatus: "No-show" },
];

export const mockFrontOfficeWorklist: FrontOfficeWorkItem[] = [
  { id: "fo-001", time: "09:40", patientId: "pat-001", purpose: "Cardiology follow-up", department: "Cardiology", doctor: "Dr. Kavita Rao", status: "Checked in", token: "C-018", nextAction: "Call patient" },
  { id: "fo-002", time: "10:00", patientId: "pat-002", purpose: "Walk-in appointment", department: "Orthopedics", doctor: "Dr. Aman Verma", status: "Waiting", token: "O-014", nextAction: "Collect payment" },
  { id: "fo-003", time: "10:12", patientId: "pat-004", purpose: "Emergency intake", department: "Emergency", doctor: "Emergency Desk", status: "In consultation", token: "ER-001", nextAction: "Complete identity later" },
  { id: "fo-004", time: "10:20", patientId: "pat-003", purpose: "Pediatric review", department: "Pediatrics", doctor: "Dr. Neha Malik", status: "Late", token: "P-007", nextAction: "Guardian consent" },
];

export const mockAppointmentConflicts = [
  { id: "conf-001", type: "Patient same-day appointment", severity: "Warning", message: "Meera Joshi already has one Cardiology visit today.", affectedAppointmentId: "appt-001", requiresOverrideReason: true },
  { id: "conf-002", type: "Slot booked", severity: "Critical", message: "Dr. Kavita Rao 11:00 slot is already booked.", affectedAppointmentId: "appt-001", requiresOverrideReason: true },
  { id: "conf-003", type: "Teleconsultation consent", severity: "Warning", message: "Guardian consent is pending for minor teleconsultation.", affectedAppointmentId: "appt-003", requiresOverrideReason: false },
];

export const mockRooms = [
  { id: "room-001", name: "OPD 3", department: "Cardiology", type: "Consultation room", capacity: 1, status: "Active", assignedDoctor: "Dr. Kavita Rao" },
  { id: "room-002", name: "OPD 6", department: "Orthopedics", type: "Consultation room", capacity: 1, status: "Active", assignedDoctor: "Dr. Aman Verma" },
  { id: "room-003", name: "ER Bay 2", department: "Emergency", type: "Emergency bay", capacity: 4, status: "High load", assignedDoctor: "Emergency Desk" },
];

export const mockCounters = [
  { id: "counter-001", name: "Counter 1", department: "Front Office", type: "Registration", capacity: 30, status: "Active" },
  { id: "counter-002", name: "Counter 2", department: "Cardiology", type: "Token issue", capacity: 20, status: "Active" },
  { id: "counter-003", name: "Tele desk", department: "Virtual Care", type: "Teleconsultation", capacity: 12, status: "Active" },
];

export const mockEnquiries = [
  { id: "enq-001", name: "Priya Menon", mobile: "+91 98222 40001", type: "Doctor availability", department: "Cardiology", followUpDate: "Today 15:00" },
  { id: "enq-002", name: "Ravi Kulkarni", mobile: "+91 98100 77331", type: "Package information", department: "Orthopedics", followUpDate: "Tomorrow" },
];

export const mockVisitorDirections = [
  { id: "vis-001", visitor: "Sana Khan", patientOrDepartment: "Pediatrics", purpose: "Guardian consent", destination: "OPD 1", passRequired: true },
  { id: "vis-002", visitor: "Insurance desk", patientOrDepartment: "Billing", purpose: "TPA handoff", destination: "Finance counter", passRequired: false },
];
