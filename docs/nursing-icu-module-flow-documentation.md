# Nursing / ICU Module Documentation

## 1. Module Overview

The Nursing / ICU module is designed as a frontend workflow for ICU nursing operations, doctor review, patient monitoring, medication administration, shift handover, supervision, alerts, audit, and reporting.

The module is built around one core idea: every ICU patient should be visible bed-wise, every critical activity should become a trackable task, and every action should have ownership, escalation, and audit visibility.

Current route base:

```text
/nursing-icu
```

Main module files:

```text
src/app/(app)/nursing-icu/*
src/features/nursing-icu/nursing-icu-pages.tsx
src/features/nursing-icu/nursing-icu-data.ts
src/features/nursing-icu/components/nursing-icu-workflow.tsx
src/features/nursing-icu/components/intake-output-workspace.tsx
```

Navigation entry:

```text
src/data/navigation.ts
```

## 2. Primary Objective

The objective of this module is to support ICU floor execution from patient arrival to final transfer/discharge/death workflow.

It covers:

- ICU census and bed status
- Patient arrival and bed allocation
- Nurse assignment and doctor assignment
- Shift handover between outgoing and incoming nurses
- Nurse task creation and assignment accountability
- ICU monitoring chart and vitals charting
- Intake/output and fluid balance tracking
- Medication administration and doctor medication orders
- IV fluid, infusion pump, and blood transfusion workflows
- Doctor rounds and doctor instructions
- Lab, radiology, and pharmacy coordination
- Head nurse supervision and ward nurse activities
- Alerts, escalations, audit logs, and reports

## 3. Key Users / Actors

### Head Nurse

Owns ICU supervision, workload review, documentation completeness, escalation tracking, reassignment, and shift safety.

### Unit Nurse

Handles ICU admission readiness, bed allocation, unit-level patient preparation, initial checklist, and transfer readiness.

### Ward Nurse

Performs bedside execution: vitals, medication, I/O, IV checks, blood transfusion monitoring, nursing notes, tasks, and handover.

### Admitting Doctor

Creates ICU care plan, medication orders, round decisions, transfer/discharge decisions, and major clinical instructions.

### Duty Doctor

Handles urgent review, critical alerts, abnormal vitals, urgent medication decisions, and escalation responses.

### Consulting Doctor

Provides specialty advice, neuro/cardiac/respiratory review, and scenario-specific instructions.

### Pharmacy

Provides medicine availability, dispensing status, shortage handling, alternatives, and return workflow.

### Lab / Radiology

Coordinates sample collection, report status, critical result alerting, and doctor/nurse follow-up.

### Blood Unit

Handles blood unit issue, crossmatch, transfusion status, reaction monitoring, and safety verification.

## 4. High-Level Module Flow

### Step 1: ICU Patient Arrival

Patient enters ICU from Emergency, General Ward, Post-Surgical Unit, or Direct ICU Admission.

The ICU team captures:

- Patient name / MRN
- Admission source
- ICU unit
- Bed number
- Admitting doctor
- Unit nurse
- Ward nurse
- Initial clinical condition
- Arrival checklist

Relevant screen:

```text
Patient Arrival & Bed Allocation
```

### Step 2: Bed Allocation and Patient Board Visibility

After bed allocation, the patient appears in bed-wise ICU board and dashboard matrix.

The team can see:

- Bed number
- Patient name
- Diagnosis
- ICU unit
- Assigned nurse
- Admitting / consulting / duty doctor
- Ventilator status
- Criticality score
- Pending tasks
- Alerts

Relevant screens:

```text
ICU Dashboard
ICU Patient Board
```

### Step 3: Initial Nursing Task Creation

Tasks may be generated from admission checklist, doctor order, monitoring alert, medication schedule, blood transfusion, I/O alert, handover, or manual nursing care.

Every task can track:

- Patient / bed
- Source
- Scenario
- Task type
- Assigned by
- Assigned to
- Assigned roles
- Reason for assignment
- Due date and time
- Repeat frequency
- Acknowledgement requirement
- Escalation owner
- Priority
- Status

Relevant screen:

```text
Nurse Task List
```

### Step 4: Monitoring and Vitals

Ward nurse records vitals and ICU observations. Abnormal values are highlighted and can create alerts/tasks.

The module supports:

- Temperature
- Pulse
- Blood pressure
- Respiratory rate
- SpO2
- Oxygen support
- GCS
- Pain score
- Urine output
- Notes
- Date/time filtering
- Abnormal highlights

Relevant screens:

```text
ICU Monitoring Chart
Vitals Charting
Nurse Review
```

### Step 5: Intake / Output and Fluid Balance

Fluid tracking combines manual entry and auto-synced entries from medication, blood administration, infusion pump, urine assessment, drain assessment, emesis, stool, and feeding.

The chart supports:

- Intake total
- Output total
- Net balance
- Day shift / night shift / 24-hour view
- Custom date/time/hour filtering
- Graph view
- Quick add through modal
- Pending verification and alerts

Relevant screen:

```text
Intake / Output Chart
```

### Step 6: Medication and Infusion Execution

Doctor can create medication orders through pharmacy formulary and safety checks. Nurse can administer, hold, skip, mark late, or document high-risk double verification.

Medication scenarios include:

- Pharmacy availability
- Department formulary match
- Allergy conflict
- Duplicate active medication
- High-alert medicine
- Restricted medicine
- PRN indication requirement
- Continuous infusion protocol
- Renal dose review
- Pediatric dose check
- NPO route warning

Relevant screens:

```text
Medication Administration
IV Fluid & Infusion Management
Pharmacy Requests
```

### Step 7: Blood Transfusion

Blood transfusion workflow tracks issue, compatibility, start status, 15-minute vitals, reaction monitoring, completion, and doctor/blood-unit escalation.

Relevant screen:

```text
Blood Transfusion
```

### Step 8: Doctor Rounds and Instructions

Doctor reviews patient condition, latest vitals, alerts, ventilation, infection, hemodynamics, medication, nutrition, family update, and disposition.

Round decision can be:

- Continue ICU care
- Transfer ready
- Step-down / ward transfer
- Surgery / procedure preparation
- Discharge planning
- Critical escalation

Doctor instructions are converted into nurse-trackable actions.

Relevant screens:

```text
Doctor Rounds
Doctor Instructions
Duty Doctor Monitoring
```

### Step 9: Lab / Radiology / Pharmacy Coordination

The module tracks order status, pending reports, critical alerts, sample collection, report follow-up, and department coordination.

Relevant screens:

```text
Lab Orders & Results
Radiology Orders & Reports
Pharmacy Requests
```

### Step 10: Shift Handover

Outgoing nurse hands over patient status and pending activities to incoming nurse.

Handover captures:

- Shift type
- Outgoing nurse
- Incoming nurse
- Current issues
- Pending tests
- Pending medications
- Risks
- To-do items
- Acknowledgement status

Relevant screen:

```text
Shift Handover
```

### Step 11: Supervision and Escalation

Head nurse reviews workload, overdue tasks, critical alerts, documentation gaps, ward nurse activities, and patient-wise nursing safety.

Relevant screens:

```text
Head Nurse Console
Ward Nurse Shift Activities
ICU Alerts
```

### Step 12: Outcome Workflow

When patient condition changes, ICU outcome workflow handles transfer, discharge, or death process.

It supports:

- Transfer to ward
- Transfer to step-down unit
- Transfer to OT / surgery
- ICU discharge
- Death workflow
- Clearance and summary generation

Relevant screen:

```text
Transfer / Discharge / Death Workflow
```

### Step 13: Audit and Reporting

Every important activity is expected to appear in logs and reports for review.

Relevant screens:

```text
Nursing Notes
Audit & Activity Logs
Reports
```

## 5. Navigation Groups and Screen Purpose

## Command Group

### ICU Dashboard

Purpose:

Provides one command view for ICU census, bed occupancy, critical patients, ventilator patients, medication due, open alerts, transfer-ready patients, and current shift summary.

Main use:

- Quickly identify critical patients
- Search patient / bed / diagnosis
- Filter by risk and ICU unit
- Navigate to Bed Board, ICU Monitor, Vitals, Medication, Lab, I/O, Rounds, and Tasks
- View matrix-style ICU status similar to hospital command dashboard

### ICU Patient Board

Purpose:

Shows bed-wise ICU patients with clinical context and quick actions.

Main use:

- See all ICU patients by bed
- Select patient
- View diagnosis, doctor, nurse, current status, ventilator status, alerts, and pending tasks
- Start monitoring, medication, notes, transfer, or discharge action

### ICU Alerts

Purpose:

Central list of active ICU alerts.

Main use:

- Track abnormal vitals
- Track medication overdue alerts
- Track blood transfusion alerts
- Track transfer clearance alerts
- Acknowledge, resolve, or escalate

## Admission Group

### Patient Arrival & Bed Allocation

Purpose:

Handles the first ICU entry workflow.

Main use:

- Capture admission source
- Assign ICU unit
- Assign bed
- Assign unit nurse and ward nurse
- Assign admitting doctor
- Capture initial condition
- Generate admission record

### Shift Handover

Purpose:

Formal handover from one nurse to another.

Main use:

- Define outgoing nurse and incoming nurse
- Capture patient issues
- Capture pending tests and pending medicines
- Capture risk points and to-do items
- Generate handover draft
- Incoming nurse acknowledges handover

### Nurse Task List

Purpose:

Central task board for all nursing execution.

Main use:

- Search and filter tasks
- Create scenario-based nursing tasks
- Assign task from doctor/system/head nurse/manual source
- Track acknowledgement
- Track priority, due time, repeat frequency, and escalation
- Update status from assigned to completed/escalated

## Monitoring Group

### ICU Monitoring Chart

Purpose:

24-hour ICU clinical chart.

Main use:

- View vitals trend
- View GCS, oxygen support, ventilator status
- View urine output and medication cues
- Review abnormal values and audit cues
- Use date/time/hour filtering for focused review

### Vitals Charting

Purpose:

Capture fresh bedside vital observations.

Main use:

- Record temperature, pulse, BP, RR, SpO2
- Record oxygen support
- Record GCS and pain score
- Add nurse note
- Highlight abnormal readings

### Nurse Review

Purpose:

Review nurse-entered records.

Main use:

- Filter vitals by date/time
- Review abnormal entries
- Edit or delete observation records
- Validate documentation quality

### Intake / Output Chart

Purpose:

Tracks fluid balance across shift and 24-hour windows.

Main use:

- Add intake/output entry through modal
- View intake, output, and net balance
- Filter by patient, date, time, hour, shift, and category
- View full-width intake/output chart
- Identify low urine output, positive balance, drain output rise, and pending verification

## Medication Group

### Medication Administration

Purpose:

Combined doctor order and nurse eMAR workflow.

Main use:

- Doctor searches available pharmacy formulary
- Doctor creates medication order with dose, route, frequency, schedule, indication, and instructions
- System checks safety scenarios
- Nurse sees due/administered/held/skipped/late doses
- Nurse performs administration action with note and double verification

### IV Fluid & Infusion Management

Purpose:

Tracks running infusions and pump status.

Main use:

- View fluid name, start time, rate, total volume, infused volume, remaining volume
- Track pump number
- Pause/resume/stop/complete workflow
- Identify pump/line/rate issues

### Blood Transfusion

Purpose:

Tracks blood product administration safety.

Main use:

- View blood group, component, unit number, compatibility
- Track requested/issued/running/completed/reaction status
- Record reaction observation
- Link nurse and doctor owner

## Doctor Group

### Doctor Rounds

Purpose:

Doctor assessment, care plan, and round decision workspace.

Main use:

- Select ICU patient
- Review round queue
- Review latest vitals and alerts
- Create assessment and system-wise plan
- Select disposition decision
- Generate scenario-based care notes
- Support continuing ICU care, transfer, discharge, surgery, or escalation decision

### Doctor Instructions

Purpose:

Tracks doctor instructions assigned to nursing team.

Main use:

- See admitting/consulting/duty doctor instruction
- Track due time and priority
- Assign to nurse
- Update pending/in-progress/completed/escalated status

### Duty Doctor Monitoring

Purpose:

Duty doctor view for urgent ICU monitoring.

Main use:

- Review critical alerts
- Review abnormal vitals
- Respond to nurse escalation
- Review urgent lab/radiology/medication concerns

## Coordination Group

### Lab Orders & Results

Purpose:

Tracks ICU lab order lifecycle.

Main use:

- Track sample collection
- Track result availability
- Highlight critical result
- Trigger doctor review and nurse follow-up

### Radiology Orders & Reports

Purpose:

Tracks ICU imaging workflow.

Main use:

- Track portable X-ray, CT, ultrasound, echo, etc.
- Track report availability
- Highlight critical imaging result
- Coordinate follow-up

### Pharmacy Requests

Purpose:

Tracks medicine request and dispense status.

Main use:

- Check available/pending/shortage status
- Follow up pending medicines
- Receive medicine
- Return unused medicine

## Supervision Group

### Head Nurse Console

Purpose:

Head nurse supervision and control view.

Main use:

- Review ICU workload
- Review nurse-wise tasks
- Identify overdue work
- Reassign unsafe workload
- Track documentation completeness
- Review escalation and shift safety

### Ward Nurse Shift Activities

Purpose:

Ward nurse execution checklist.

Main use:

- See assigned patient activities
- Track vitals, medication, I/O, IV, blood, notes, and handover
- Complete shift checklist
- Identify pending bedside care

## Outcome Group

### Transfer / Discharge / Death Workflow

Purpose:

Handles ICU exit and outcome decisions.

Main use:

- Prepare transfer checklist
- Prepare ICU discharge
- Capture destination
- Capture clearance status
- Generate summary
- Manage death workflow when required

### Nursing Notes

Purpose:

Structured nursing documentation.

Main use:

- Add shift note
- Add critical event note
- Add medication note
- Add transfusion note
- Add I/O note
- Add doctor instruction follow-up note

## Audit Group

### Audit & Activity Logs

Purpose:

Audit trail for important actions.

Main use:

- Track event type
- Track actor
- Track patient
- Track details
- Track time and IP
- Support compliance review

### Reports

Purpose:

Management and operational reporting.

Main use:

- ICU occupancy report
- Nurse workload report
- Medication compliance report
- Missed/late medication report
- Abnormal vitals report
- Blood transfusion report
- I/O balance report
- Handover report
- Discharge/transfer report

## 6. Nurse Task Creation Scenarios

The Nurse Task List is the most important operational bridge in the module. It converts clinical events into owned tasks.

Task sources include:

- Doctor order
- Medication / eMAR
- Vitals / monitor
- Intake / output
- IV / infusion
- Blood transfusion
- Lab / radiology
- Shift handover
- Admission / transfer
- Head nurse supervision
- Manual nursing care

Common task scenarios:

### Doctor Order

Example:

```text
Repeat vitals every 15 minutes until stable
```

Assigned by:

```text
Admitting Doctor / Duty Doctor
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Duty Doctor
```

### Medication / eMAR

Example:

```text
Administer due medication, handle skipped/held/late medication, double verify high-alert medicine
```

Assigned by:

```text
System MAR
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Duty Doctor + Head Nurse
```

### Vitals / Monitor

Example:

```text
Repeat abnormal vitals, document GCS, escalate low SpO2 or unstable BP
```

Assigned by:

```text
Monitoring System
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Duty Doctor
```

### Intake / Output

Example:

```text
Check low urine output or rising drain output
```

Assigned by:

```text
Fluid Balance Chart
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Duty Doctor
```

### IV / Infusion

Example:

```text
Check pump alarm, line patency, wrong rate, or drug interruption
```

Assigned by:

```text
Infusion Pump
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Unit Nurse
```

### Blood Transfusion

Example:

```text
Record 15-minute transfusion vitals and reaction check
```

Assigned by:

```text
Blood Unit
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Duty Doctor + Blood Unit
```

### Lab / Radiology

Example:

```text
Collect ABG sample, follow up portable X-ray report, inform doctor for critical result
```

Assigned by:

```text
Lab / Radiology Department
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Duty Doctor
```

### Shift Handover

Example:

```text
Carry forward pending medication, ABG report, family update, or transfer checklist
```

Assigned by:

```text
Outgoing Nurse
```

Assigned to:

```text
Incoming Nurse
```

Escalation:

```text
Head Nurse
```

### Admission / Transfer

Example:

```text
Complete ICU admission checklist or prepare transfer checklist
```

Assigned by:

```text
Unit Nurse
```

Assigned to:

```text
Ward Nurse
```

Escalation:

```text
Head Nurse
```

### Head Nurse Supervision

Example:

```text
Complete missing documentation or reassign unsafe workload
```

Assigned by:

```text
Head Nurse
```

Assigned to:

```text
Ward Nurse / Unit Nurse
```

Escalation:

```text
Head Nurse
```

### Manual Nursing Care

Example:

```text
Oral care, repositioning, back care, device care, central line dressing, Foley care
```

Assigned by:

```text
Ward Nurse
```

Assigned to:

```text
Self / another nurse
```

Escalation:

```text
Head Nurse if not completed
```

## 7. Medication Workflow Detail

Medication Administration has two major sides:

### Doctor Side

Doctor creates medication order using:

- Patient / bed
- Department
- Doctor
- Medicine catalog
- Pharmacy availability
- Dose
- Route
- Frequency
- Schedule time
- Indication
- Instructions
- High-risk flag
- Double verification flag

Safety checks:

- Pharmacy stock available or blocked
- Department formulary match
- Allergy conflict
- Duplicate active medication
- High-alert medicine
- Restricted medicine
- PRN indication required
- Continuous infusion protocol
- Renal dose adjustment
- Pediatric dose check
- NPO/route warning

### Nurse Side

Nurse sees eMAR doses and performs:

- Administer
- Hold
- Skip
- Mark late
- Add nursing action note
- Complete double verification
- Update audit trail

Medication status examples:

```text
Due
Administered
Held
Skipped
Late
```

## 8. Doctor Rounds Workflow Detail

Doctor Rounds is used for clinical decision-making.

Round review includes:

- Patient status
- Diagnosis
- Latest vitals
- Open alerts
- Ventilator/oxygen status
- Lab/radiology review
- Medication review
- Intake/output review
- Infection/sepsis review
- Hemodynamic plan
- Respiratory/ventilator plan
- Nutrition plan
- Lines/devices plan
- Family update
- Disposition decision

Disposition decision affects the note pattern and workflow expectation.

Example decisions:

- Continue ICU care
- Transfer to ward
- Step-down care
- Surgery/procedure preparation
- Discharge planning
- Critical escalation

## 9. Intake / Output Workflow Detail

Intake/output chart is designed for ICU fluid balance.

Input sources:

- Oral
- IV fluids
- Medication diluent
- Blood products
- NG tube feeds
- Oral supplements
- Infusion pump

Output sources:

- Urine
- Drain output
- Stool
- Vomit/emesis
- NG aspirate
- Estimated blood loss
- Procedure loss

Important alerts:

- Low urine output
- Positive balance
- Rising drain output
- Pending verification

## 10. Alert and Escalation Logic

Alerts can come from:

- Vitals chart
- Medication administration
- Blood transfusion
- Transfer order
- I/O chart
- Lab/radiology result
- Device/ventilator/pump monitoring
- Documentation gaps

Alert status:

```text
Open
Acknowledged
Resolved
```

Alert owner examples:

- Duty Doctor
- Ward Nurse
- Unit Nurse
- Head Nurse
- Blood Unit
- Pharmacy
- Lab / Radiology

## 11. Data Used in Current Frontend Demo

The current frontend has dummy data for:

- ICU patients
- ICU tasks
- ICU vitals
- Intake/output entries
- Medication rows
- Infusion rows
- Blood transfusion rows
- Doctor instructions
- ICU alerts
- Activity logs
- Reports

This is frontend-only data and can later be replaced by backend APIs.

## 12. Presentation Talking Points

Use this simple presentation flow:

1. Start with ICU Dashboard to show command-level visibility.
2. Open ICU Patient Board to show bed-wise patient tracking.
3. Open Patient Arrival & Bed Allocation to explain admission into ICU.
4. Open Nurse Task List to show how every work item is assigned and tracked.
5. Open Monitoring Chart and Vitals to show bedside charting.
6. Open Intake / Output to show fluid balance and custom filtering.
7. Open Medication Administration to show doctor prescription and nurse eMAR execution.
8. Open Doctor Rounds to show care plan and disposition decision.
9. Open Shift Handover to show nurse-to-nurse continuity.
10. Open Head Nurse Console to show supervision and workload control.
11. Open Alerts to show escalation management.
12. Open Audit Logs and Reports to show compliance and management review.

## 13. Future Backend Integration Points

For production integration, this module should connect with:

- Patient admission API
- Bed management API
- Nurse roster and shift API
- Doctor order API
- eMAR / medication API
- Pharmacy inventory API
- Lab order/result API
- Radiology order/report API
- Blood bank API
- Device integration API for monitor/pump/ventilator
- Notification/escalation API
- Audit logging API
- Reporting API

## 14. Summary

The Nursing / ICU module provides a complete frontend workflow for ICU operations. It begins from patient arrival and bed allocation, continues through monitoring, medication, I/O, doctor rounds, shift handover, supervision, alerts, and ends with transfer/discharge/death workflow, audit logs, and reports.

The strongest part of the module is the task accountability flow: each task has source, scenario, assigned by, assigned to, reason, acknowledgement, due time, priority, and escalation owner. This makes the workflow presentation-ready and suitable for production-grade backend integration later.
