# Plasmit Global HMS - Complete High-Level and Module-Wise ER Diagram Blueprint

## Executive Summary

This document provides one master high-level ERD and separate module-wise Mermaid `erDiagram` sections for Plasmit HMS.

## Core ERD Rules

- Use plural snake_case table names.
- Every major table has `id BIGINT PK` and audit columns.
- Hospital-level tables use `tenant_id + hospital_id`.
- Branch-level tables use `tenant_id + hospital_id + branch_id`.
- Encounter-level tables use `tenant_id + hospital_id + branch_id + patient_id + encounter_id`.
- Money values use BIGINT minor units such as paise/cents.
- FHIR and HL7 mapping tables are integration layers, not source of truth.

## 1. Master High-Level ER Diagram

Shows the complete high-level relationship from tenant to hospital, branch, patient, encounter, clinical, diagnostics, pharmacy, billing, documents, audit, FHIR and HL7.

```mermaid
erDiagram
    tenants {
        BIGINT id PK
        VARCHAR name
        VARCHAR status
    }
    hospitals {
        BIGINT id PK
        BIGINT tenant_id FK
        VARCHAR name
        VARCHAR status
    }
    branches {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        VARCHAR name
        VARCHAR status
    }
    departments {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        VARCHAR name
    }
    healthcare_services {
        BIGINT id PK
        BIGINT department_id FK
        VARCHAR service_name
    }
    users {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        VARCHAR username
    }
    roles {
        BIGINT id PK
        VARCHAR role_code
        VARCHAR role_name
    }
    permissions {
        BIGINT id PK
        VARCHAR permission_code
    }
    role_permissions {
        BIGINT id PK
        BIGINT role_id FK
        BIGINT permission_id FK
    }
    user_branch_access {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT branch_id FK
    }
    patients {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        VARCHAR mrn
        VARCHAR full_name
    }
    appointments {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        BIGINT patient_id FK
        BIGINT doctor_id FK
    }
    encounters {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        BIGINT patient_id FK
        BIGINT appointment_id FK
    }
    clinical_notes {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT doctor_id FK
    }
    vitals {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        VARCHAR vital_code
    }
    diagnoses {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        VARCHAR diagnosis_code
    }
    prescriptions {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT doctor_id FK
    }
    prescription_items {
        BIGINT id PK
        BIGINT prescription_id FK
        BIGINT medicine_id FK
    }
    lab_orders {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT branch_id FK
    }
    lab_order_items {
        BIGINT id PK
        BIGINT lab_order_id FK
        BIGINT lab_test_id FK
    }
    lab_results {
        BIGINT id PK
        BIGINT lab_order_item_id FK
        BIGINT encounter_id FK
    }
    radiology_orders {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
    }
    radiology_reports {
        BIGINT id PK
        BIGINT radiology_order_id FK
        BIGINT encounter_id FK
    }
    pharmacy_stock {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT medicine_batch_id FK
        INT quantity
    }
    pharmacy_sales {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT patient_id FK
        BIGINT prescription_id FK
    }
    billing_invoices {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT patient_id FK
        BIGINT encounter_id FK
        BIGINT total_amount_minor
    }
    payments {
        BIGINT id PK
        BIGINT invoice_id FK
        BIGINT amount_minor
    }
    documents {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT encounter_id FK
        VARCHAR document_type
    }
    audit_logs {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        VARCHAR entity_name
        BIGINT entity_id
    }
    fhir_resource_mapping {
        BIGINT id PK
        VARCHAR internal_table_name
        BIGINT internal_record_id
        VARCHAR fhir_resource_type
        VARCHAR fhir_resource_id
    }
    hl7_message_log {
        BIGINT id PK
        VARCHAR message_type
        VARCHAR direction
        VARCHAR processing_status
    }

    tenants ||--o{ hospitals : owns
    hospitals ||--o{ branches : has
    hospitals ||--o{ patients : registers
    hospitals ||--o{ departments : defines
    branches ||--o{ departments : contains
    departments ||--o{ healthcare_services : offers
    hospitals ||--o{ users : employs
    users ||--o{ user_branch_access : receives
    branches ||--o{ user_branch_access : grants
    roles ||--o{ role_permissions : maps
    permissions ||--o{ role_permissions : maps
    branches ||--o{ appointments : schedules
    branches ||--o{ encounters : hosts
    patients ||--o{ appointments : books
    patients ||--o{ encounters : visits
    appointments ||--o| encounters : creates
    encounters ||--o{ vitals : records
    encounters ||--o{ diagnoses : records
    encounters ||--o{ clinical_notes : records
    encounters ||--o{ prescriptions : orders
    prescriptions ||--o{ prescription_items : contains
    encounters ||--o{ lab_orders : requests
    lab_orders ||--o{ lab_order_items : contains
    lab_order_items ||--o{ lab_results : produces
    encounters ||--o{ radiology_orders : requests
    radiology_orders ||--o{ radiology_reports : produces
    encounters ||--o{ billing_invoices : bills
    billing_invoices ||--o{ payments : receives
    patients ||--o{ documents : owns
    encounters ||--o{ documents : produces
    branches ||--o{ pharmacy_stock : stores
    patients ||--o{ pharmacy_sales : buys
    users ||--o{ audit_logs : performs
    fhir_resource_mapping }o--|| patients : maps
    fhir_resource_mapping }o--|| encounters : maps
    hl7_message_log ||--o{ fhir_resource_mapping : may_trigger
```

### Relationship Explanation

- Tenant owns hospitals; hospitals own branches and register patients.
- Patient is hospital-level; appointment and encounter are branch-level.
- Encounter is the clinical anchor for vitals, diagnosis, notes, prescriptions, lab, radiology and billing.
- FHIR mapping connects internal records to FHIR resource identifiers.
- HL7 message log stores inbound/outbound integration messages and may create or update internal mapped records.

### FHIR Mapping Summary

- Patient -> Patient
- Encounter -> Encounter
- Vitals/Lab results -> Observation
- Prescription -> MedicationRequest
- Billing invoice/items -> Account/ChargeItem
- Documents -> DocumentReference
- Audit -> AuditEvent

### Tenant / Hospital / Branch Scope

- Hospital-level: patients, departments, users.
- Branch-level: appointments, encounters, lab orders, pharmacy stock, billing invoices.
- Encounter-level: vitals, diagnoses, notes, prescriptions, lab/radiology orders.

### Key Indexes Required

- `idx_patients_tenant_hospital_mrn on patients(tenant_id, hospital_id, mrn)`
- `idx_encounters_branch_patient on encounters(tenant_id, hospital_id, branch_id, patient_id)`
- `idx_billing_branch_date on billing_invoices(tenant_id, hospital_id, branch_id, invoice_date)`

### Developer Notes

- Do not build module tables before foundation tables exist.
- Never query clinical or billing data without tenant and branch filters.
- Do not duplicate patient or encounter concepts in other modules.

## 2. Tenant, Hospital, Branch, User and RBAC ERD

Defines SaaS hierarchy, branch access and role-permission model.

```mermaid
erDiagram
    tenants {
        BIGINT id PK
        VARCHAR name
        VARCHAR status
    }
    hospitals {
        BIGINT id PK
        BIGINT tenant_id FK
        VARCHAR name
        VARCHAR status
    }
    branches {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        VARCHAR name
        VARCHAR location_code
    }
    departments {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        VARCHAR name
    }
    healthcare_services {
        BIGINT id PK
        BIGINT department_id FK
        VARCHAR service_code
        VARCHAR service_name
    }
    users {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        VARCHAR username
        VARCHAR user_type
    }
    roles {
        BIGINT id PK
        VARCHAR role_code
        VARCHAR role_name
    }
    permissions {
        BIGINT id PK
        VARCHAR permission_code
        VARCHAR permission_name
    }
    role_permissions {
        BIGINT id PK
        BIGINT role_id FK
        BIGINT permission_id FK
    }
    user_branch_access {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT branch_id FK
        BIGINT role_id FK
    }

    tenants ||--o{ hospitals : owns
    hospitals ||--o{ branches : has
    hospitals ||--o{ departments : defines
    branches ||--o{ departments : contains
    departments ||--o{ healthcare_services : offers
    hospitals ||--o{ users : employs
    users ||--o{ user_branch_access : gets_access
    branches ||--o{ user_branch_access : grants_access
    roles ||--o{ user_branch_access : assigned_as
    roles ||--o{ role_permissions : has
    permissions ||--o{ role_permissions : included_in
```

### Relationship Explanation

- User can access multiple branches through user_branch_access.
- Role has many permissions through role_permissions.
- Hospital has many branches; branch may have departments and services.

### FHIR Mapping Summary

- Hospital/Tenant -> Organization
- Branch -> Location
- Department/Service -> HealthcareService
- User -> Practitioner
- user_branch_access -> PractitionerRole

### Tenant / Hospital / Branch Scope

- Foundation tables are tenant/hospital scoped.
- branches are branch scope roots.
- user_branch_access controls branch-level authorization.

### Key Indexes Required

- `idx_branches_hospital on branches(tenant_id, hospital_id)`
- `idx_user_branch_access_user on user_branch_access(user_id, branch_id)`
- `idx_role_permissions_role on role_permissions(role_id, permission_id)`

### Developer Notes

- Backend must derive allowed branch IDs from token/user_branch_access.
- Do not trust frontend branch selector for authorization.

## 3. Patient Registration / MPI ERD

Defines hospital-level patient identity and related demographic, consent, insurance and access records.

```mermaid
erDiagram
    patients {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        VARCHAR mrn
        VARCHAR full_name
        DATE date_of_birth
        VARCHAR gender_code
    }
    patient_identifiers {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR identifier_type
        VARCHAR identifier_value
    }
    patient_addresses {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR address_type
        VARCHAR city
        VARCHAR state
    }
    patient_contacts {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR contact_type
        VARCHAR phone
    }
    patient_allergies {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR allergen_code
        VARCHAR severity
    }
    patient_insurance {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR policy_no
        VARCHAR payer_name
    }
    patient_documents {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR document_type
        VARCHAR file_url
    }
    patient_consent_records {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR consent_type
        VARCHAR status
    }
    patient_record_access_logs {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT accessed_by FK
        DATETIME accessed_at
    }

    patients ||--o{ patient_identifiers : has
    patients ||--o{ patient_addresses : has
    patients ||--o{ patient_contacts : has
    patients ||--o{ patient_allergies : has
    patients ||--o{ patient_insurance : has
    patients ||--o{ patient_documents : owns
    patients ||--o{ patient_consent_records : grants
    patients ||--o{ patient_record_access_logs : accessed
```

### Relationship Explanation

- Patients own identifiers, addresses, contacts, allergies, insurance, documents, consent and access logs.
- Patient is hospital-level by default, so branch activity starts with appointment/encounter.

### FHIR Mapping Summary

- patients -> Patient
- patient_identifiers -> Patient.identifier
- patient_addresses -> Patient.address
- patient_contacts -> Patient.contact / RelatedPerson
- patient_allergies -> AllergyIntolerance
- patient_documents -> DocumentReference
- patient_consent_records -> Consent

### Tenant / Hospital / Branch Scope

- Hospital-level: patients and demographic tables use tenant_id + hospital_id.
- Access logs may include branch_id when access happens from a branch context.

### Key Indexes Required

- `idx_patients_tenant_hospital_mrn on patients(tenant_id, hospital_id, mrn)`
- `idx_patient_identifiers_value on patient_identifiers(identifier_type, identifier_value)`
- `idx_patient_access_patient_date on patient_record_access_logs(patient_id, accessed_at)`

### Developer Notes

- Do not create separate patient tables for OPD/IPD/lab/pharmacy.
- Duplicate detection should use MRN, mobile, DOB and identifiers.

## 4. Appointment and Encounter ERD

Shows scheduling, appointment lifecycle and conversion to encounter.

```mermaid
erDiagram
    appointment_slots {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT doctor_id FK
        DATETIME slot_start
        DATETIME slot_end
    }
    appointments {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        BIGINT patient_id FK
        BIGINT doctor_id FK
        BIGINT slot_id FK
        VARCHAR status
    }
    appointment_status_history {
        BIGINT id PK
        BIGINT appointment_id FK
        VARCHAR old_status
        VARCHAR new_status
    }
    appointment_reminders {
        BIGINT id PK
        BIGINT appointment_id FK
        VARCHAR reminder_channel
        DATETIME sent_at
    }
    appointment_cancellations {
        BIGINT id PK
        BIGINT appointment_id FK
        VARCHAR reason
        BIGINT cancelled_by FK
    }
    encounters {
        BIGINT id PK
        BIGINT appointment_id FK
        BIGINT patient_id FK
        BIGINT branch_id FK
        VARCHAR encounter_type
        VARCHAR status
    }
    encounter_participants {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT user_id FK
        VARCHAR participant_role
    }
    encounter_status_history {
        BIGINT id PK
        BIGINT encounter_id FK
        VARCHAR old_status
        VARCHAR new_status
    }

    appointment_slots ||--o{ appointments : books
    appointments ||--o{ appointment_status_history : tracks
    appointments ||--o{ appointment_reminders : sends
    appointments ||--o| appointment_cancellations : may_cancel
    appointments ||--o| encounters : creates
    encounters ||--o{ encounter_participants : includes
    encounters ||--o{ encounter_status_history : tracks
```

### Relationship Explanation

- Appointments are branch-level scheduling records.
- Appointment may create exactly one encounter, but walk-in encounters can exist without appointment.
- Encounter participants store doctor/nurse/staff involvement.

### FHIR Mapping Summary

- appointments -> Appointment
- encounters -> Encounter
- participants -> Patient / Practitioner / Location through Encounter.participant

### Tenant / Hospital / Branch Scope

- Branch-level: appointments and encounters require tenant_id + hospital_id + branch_id.
- Encounter-level children must carry patient_id and encounter_id.

### Key Indexes Required

- `idx_appointments_branch_date on appointments(tenant_id, hospital_id, branch_id, appointment_date, status)`
- `idx_encounters_patient_branch on encounters(tenant_id, hospital_id, branch_id, patient_id)`

### Developer Notes

- Use status history tables instead of overwriting lifecycle trace.
- Appointment cancellation should not hard delete appointment.

## 5. Clinical EMR ERD

Defines encounter-centric clinical documentation and observation model.

```mermaid
erDiagram
    encounters {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT branch_id FK
        VARCHAR status
    }
    vitals {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        VARCHAR vital_code
        DECIMAL value_number
    }
    diagnoses {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        VARCHAR diagnosis_code
        VARCHAR diagnosis_type
    }
    clinical_notes {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT doctor_id FK
        TEXT note_text
    }
    procedures {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        VARCHAR procedure_code
    }
    care_plans {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        VARCHAR care_plan_status
    }
    clinical_documents {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        VARCHAR document_type
    }

    encounters ||--o{ vitals : records
    encounters ||--o{ diagnoses : records
    encounters ||--o{ clinical_notes : documents
    encounters ||--o{ procedures : performs
    encounters ||--o{ care_plans : plans
    encounters ||--o{ clinical_documents : attaches
```

### Relationship Explanation

- All clinical records are children of encounters.
- Clinical records should not float only under patient without encounter unless explicitly marked longitudinal.

### FHIR Mapping Summary

- vitals -> Observation
- diagnoses -> Condition
- procedures -> Procedure
- care_plans -> CarePlan
- clinical_documents -> DocumentReference

### Tenant / Hospital / Branch Scope

- Encounter-level: tenant_id + hospital_id + branch_id + patient_id + encounter_id.

### Key Indexes Required

- `idx_vitals_encounter_time on vitals(encounter_id, created_at)`
- `idx_diagnoses_patient_code on diagnoses(patient_id, diagnosis_code)`
- `idx_clinical_notes_encounter on clinical_notes(encounter_id, created_at)`

### Developer Notes

- Clinical note edits should create audit trail or document version.
- Use controlled code systems for diagnosis/procedure where possible.

## 6. Prescription and Pharmacy Dispensing ERD

Connects prescriptions, medicine catalog, branch stock, dispensing and sales.

```mermaid
erDiagram
    prescriptions {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT doctor_id FK
        VARCHAR status
    }
    prescription_items {
        BIGINT id PK
        BIGINT prescription_id FK
        BIGINT medicine_id FK
        VARCHAR dose
        VARCHAR frequency
    }
    medicine_categories {
        BIGINT id PK
        VARCHAR category_name
    }
    medicine_master {
        BIGINT id PK
        BIGINT category_id FK
        VARCHAR medicine_code
        VARCHAR medicine_name
    }
    medicine_batches {
        BIGINT id PK
        BIGINT medicine_id FK
        VARCHAR batch_no
        DATE expiry_date
    }
    pharmacy_stock {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT medicine_batch_id FK
        INT quantity
    }
    pharmacy_dispense {
        BIGINT id PK
        BIGINT prescription_id FK
        BIGINT patient_id FK
        BIGINT branch_id FK
        VARCHAR status
    }
    pharmacy_dispense_items {
        BIGINT id PK
        BIGINT dispense_id FK
        BIGINT prescription_item_id FK
        BIGINT medicine_batch_id FK
        INT quantity
    }
    pharmacy_sales {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT patient_id FK
        BIGINT prescription_id FK
        BIGINT total_amount_minor
    }
    pharmacy_sale_items {
        BIGINT id PK
        BIGINT sale_id FK
        BIGINT medicine_batch_id FK
        INT quantity
        BIGINT amount_minor
    }
    stock_movements {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT medicine_batch_id FK
        VARCHAR movement_type
        INT quantity
    }

    prescriptions ||--o{ prescription_items : contains
    medicine_categories ||--o{ medicine_master : groups
    medicine_master ||--o{ prescription_items : prescribed
    medicine_master ||--o{ medicine_batches : has
    medicine_batches ||--o{ pharmacy_stock : stocked
    prescriptions ||--o{ pharmacy_dispense : dispensed_as
    pharmacy_dispense ||--o{ pharmacy_dispense_items : contains
    prescription_items ||--o{ pharmacy_dispense_items : fulfilled_by
    medicine_batches ||--o{ pharmacy_dispense_items : issued_from
    pharmacy_sales ||--o{ pharmacy_sale_items : contains
    medicine_batches ||--o{ pharmacy_sale_items : sold_from
    medicine_batches ||--o{ stock_movements : moves
```

### Relationship Explanation

- Prescription creates medication request; dispense fulfills prescription items.
- Medicine batch drives stock, sale and dispense traceability.
- Stock movement must be written for every stock change.

### FHIR Mapping Summary

- prescriptions -> MedicationRequest
- medicine_master -> Medication
- pharmacy_dispense -> MedicationDispense
- IPD medication administration -> MedicationAdministration when used.

### Tenant / Hospital / Branch Scope

- medicine_master can be hospital-level.
- pharmacy_stock, sales and dispense are branch-level.

### Key Indexes Required

- `idx_pharmacy_stock_branch_batch on pharmacy_stock(branch_id, medicine_batch_id)`
- `idx_batches_expiry on medicine_batches(medicine_id, expiry_date)`
- `idx_stock_movements_branch_date on stock_movements(branch_id, created_at)`

### Developer Notes

- Money uses BIGINT minor units, never FLOAT/DOUBLE.
- Do not update stock without stock_movements entry.

## 7. Lab / Diagnostics ERD

Shows lab catalog, order, sample, result, parameters and diagnostic report.

```mermaid
erDiagram
    lab_test_master {
        BIGINT id PK
        VARCHAR test_code
        VARCHAR test_name
    }
    lab_test_parameters {
        BIGINT id PK
        BIGINT lab_test_id FK
        VARCHAR parameter_code
        VARCHAR unit
    }
    lab_orders {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT branch_id FK
        VARCHAR status
    }
    lab_order_items {
        BIGINT id PK
        BIGINT lab_order_id FK
        BIGINT lab_test_id FK
        VARCHAR status
    }
    lab_samples {
        BIGINT id PK
        BIGINT lab_order_item_id FK
        VARCHAR sample_no
        VARCHAR sample_status
    }
    lab_results {
        BIGINT id PK
        BIGINT lab_order_item_id FK
        BIGINT encounter_id FK
        VARCHAR result_status
    }
    lab_result_parameters {
        BIGINT id PK
        BIGINT lab_result_id FK
        BIGINT parameter_id FK
        VARCHAR result_value
        VARCHAR abnormal_flag
    }
    diagnostic_reports {
        BIGINT id PK
        BIGINT lab_result_id FK
        BIGINT patient_id FK
        VARCHAR report_status
    }
    lab_result_review_history {
        BIGINT id PK
        BIGINT lab_result_id FK
        BIGINT reviewed_by FK
        VARCHAR review_status
    }

    lab_test_master ||--o{ lab_test_parameters : defines
    lab_orders ||--o{ lab_order_items : contains
    lab_test_master ||--o{ lab_order_items : selected
    lab_order_items ||--o{ lab_samples : collects
    lab_order_items ||--o{ lab_results : produces
    lab_results ||--o{ lab_result_parameters : contains
    lab_test_parameters ||--o{ lab_result_parameters : measured_as
    lab_results ||--o{ diagnostic_reports : publishes
    lab_results ||--o{ lab_result_review_history : reviewed
```

### Relationship Explanation

- Lab order belongs to encounter and branch.
- Lab order items represent tests; parameters define expected result values.
- Diagnostic report is generated from reviewed results.

### FHIR Mapping Summary

- lab_orders -> ServiceRequest
- lab_samples -> Specimen
- lab_results/result parameters -> Observation
- diagnostic_reports -> DiagnosticReport

### Tenant / Hospital / Branch Scope

- lab_orders, samples, results and reports are branch and encounter-level.

### Key Indexes Required

- `idx_lab_orders_branch_status on lab_orders(tenant_id, hospital_id, branch_id, status, created_at)`
- `idx_lab_results_order_item on lab_results(lab_order_item_id, result_status)`
- `idx_lab_samples_sample_no on lab_samples(sample_no)`

### Developer Notes

- Do not store final report only as PDF; keep structured result rows.
- Critical values should trigger audit/notification workflow.

## 8. Radiology ERD

Shows radiology order, order items, reports, imaging studies and review history.

```mermaid
erDiagram
    radiology_test_master {
        BIGINT id PK
        VARCHAR test_code
        VARCHAR test_name
    }
    radiology_orders {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT branch_id FK
        VARCHAR status
    }
    radiology_order_items {
        BIGINT id PK
        BIGINT radiology_order_id FK
        BIGINT radiology_test_id FK
        VARCHAR status
    }
    radiology_reports {
        BIGINT id PK
        BIGINT radiology_order_item_id FK
        BIGINT encounter_id FK
        VARCHAR report_status
    }
    imaging_studies {
        BIGINT id PK
        BIGINT radiology_report_id FK
        VARCHAR accession_no
        VARCHAR study_uid
    }
    radiology_report_review_history {
        BIGINT id PK
        BIGINT radiology_report_id FK
        BIGINT reviewed_by FK
        VARCHAR review_status
    }

    radiology_orders ||--o{ radiology_order_items : contains
    radiology_test_master ||--o{ radiology_order_items : selected
    radiology_order_items ||--o{ radiology_reports : produces
    radiology_reports ||--o{ imaging_studies : references
    radiology_reports ||--o{ radiology_report_review_history : reviewed
```

### Relationship Explanation

- Radiology order belongs to encounter and branch.
- Radiology reports are generated from order items and may link imaging studies.

### FHIR Mapping Summary

- radiology_orders -> ServiceRequest
- radiology_reports -> DiagnosticReport
- imaging_studies -> ImagingStudy
- report documents -> DocumentReference

### Tenant / Hospital / Branch Scope

- Radiology orders and reports are branch-level and encounter-level.

### Key Indexes Required

- `idx_radiology_orders_branch_status on radiology_orders(tenant_id, hospital_id, branch_id, status, created_at)`
- `idx_imaging_study_uid on imaging_studies(study_uid)`

### Developer Notes

- Keep DICOM/image references separate from report text.
- Report review should be tracked in history table.

## 9. Billing, Payment and Insurance ERD

Shows invoices, invoice items, payments, allocations, refunds and claims.

```mermaid
erDiagram
    billing_invoices {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT encounter_id FK
        BIGINT branch_id FK
        BIGINT total_amount_minor
        VARCHAR status
    }
    billing_invoice_items {
        BIGINT id PK
        BIGINT invoice_id FK
        VARCHAR charge_code
        BIGINT amount_minor
    }
    payments {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT amount_minor
        VARCHAR payment_mode
    }
    payment_allocations {
        BIGINT id PK
        BIGINT payment_id FK
        BIGINT invoice_id FK
        BIGINT allocated_amount_minor
    }
    refunds {
        BIGINT id PK
        BIGINT invoice_id FK
        BIGINT amount_minor
        VARCHAR status
    }
    insurance_policies {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR policy_no
        VARCHAR payer_name
    }
    insurance_claims {
        BIGINT id PK
        BIGINT invoice_id FK
        BIGINT patient_id FK
        VARCHAR claim_no
        VARCHAR status
    }
    insurance_claim_items {
        BIGINT id PK
        BIGINT claim_id FK
        BIGINT invoice_item_id FK
        BIGINT claim_amount_minor
    }
    claim_documents {
        BIGINT id PK
        BIGINT claim_id FK
        BIGINT document_id FK
    }
    claim_status_history {
        BIGINT id PK
        BIGINT claim_id FK
        VARCHAR old_status
        VARCHAR new_status
    }

    billing_invoices ||--o{ billing_invoice_items : contains
    billing_invoices ||--o{ payment_allocations : receives
    payments ||--o{ payment_allocations : allocated
    billing_invoices ||--o{ refunds : may_refund
    billing_invoices ||--o{ insurance_claims : may_claim
    insurance_claims ||--o{ insurance_claim_items : contains
    insurance_claims ||--o{ claim_documents : attaches
    insurance_claims ||--o{ claim_status_history : tracks
    insurance_policies }o--|| insurance_claims : supports
```

### Relationship Explanation

- Invoice belongs to patient, encounter and branch.
- Payments can be allocated to one or more invoices using payment_allocations.
- Claims are linked to invoices and claim items map to invoice items.

### FHIR Mapping Summary

- billing account -> Account
- invoice item/charges -> ChargeItem
- insurance claim -> Claim
- claim/payment explanation -> ExplanationOfBenefit

### Tenant / Hospital / Branch Scope

- Billing, payments, refunds and claims are branch-level financial transactions.

### Key Indexes Required

- `idx_invoices_branch_date on billing_invoices(tenant_id, hospital_id, branch_id, invoice_date, status)`
- `idx_payment_allocations_invoice on payment_allocations(invoice_id, payment_id)`
- `idx_claims_invoice_status on insurance_claims(invoice_id, status)`

### Developer Notes

- Money columns use BIGINT minor units.
- Do not cascade delete invoices or payment records.

## 10. IPD, Ward, Room and Bed ERD

Defines admission, bed hierarchy, nursing and discharge relationships.

```mermaid
erDiagram
    admissions {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT patient_id FK
        BIGINT branch_id FK
        VARCHAR admission_status
    }
    wards {
        BIGINT id PK
        BIGINT branch_id FK
        VARCHAR ward_name
    }
    rooms {
        BIGINT id PK
        BIGINT ward_id FK
        VARCHAR room_no
    }
    beds {
        BIGINT id PK
        BIGINT room_id FK
        VARCHAR bed_no
        VARCHAR bed_status
    }
    bed_allocations {
        BIGINT id PK
        BIGINT admission_id FK
        BIGINT bed_id FK
        DATETIME allocated_at
    }
    nursing_notes {
        BIGINT id PK
        BIGINT admission_id FK
        BIGINT nurse_id FK
        TEXT note_text
    }
    nursing_tasks {
        BIGINT id PK
        BIGINT admission_id FK
        VARCHAR task_type
        VARCHAR status
    }
    discharge_plans {
        BIGINT id PK
        BIGINT admission_id FK
        VARCHAR plan_status
    }
    discharge_summaries {
        BIGINT id PK
        BIGINT admission_id FK
        BIGINT document_id FK
        VARCHAR status
    }

    admissions ||--o{ bed_allocations : assigns
    wards ||--o{ rooms : contains
    rooms ||--o{ beds : contains
    beds ||--o{ bed_allocations : allocated_to
    admissions ||--o{ nursing_notes : records
    admissions ||--o{ nursing_tasks : assigns
    admissions ||--o{ discharge_plans : plans
    admissions ||--o{ discharge_summaries : summarizes
```

### Relationship Explanation

- Encounter may create admission.
- Branch has wards; wards have rooms; rooms have beds.
- Admission can have multiple bed allocations over time.

### FHIR Mapping Summary

- admission/visit -> Encounter
- ward/room/bed -> Location
- nursing notes/discharge summary -> DocumentReference
- discharge summary -> Composition + DocumentReference

### Tenant / Hospital / Branch Scope

- IPD tables are branch-level and admission/encounter-level.

### Key Indexes Required

- `idx_admissions_branch_status on admissions(branch_id, admission_status)`
- `idx_bed_allocations_admission on bed_allocations(admission_id, allocated_at)`
- `idx_beds_room_status on beds(room_id, bed_status)`

### Developer Notes

- Bed allocation history must be retained.
- Do not overwrite discharge summaries without version/audit.

## 11. Surgery / OT ERD

Shows operation theatre, surgery case, team, checklists, anesthesia and notes.

```mermaid
erDiagram
    operation_theatres {
        BIGINT id PK
        BIGINT branch_id FK
        VARCHAR theatre_name
        VARCHAR status
    }
    surgery_cases {
        BIGINT id PK
        BIGINT encounter_id FK
        BIGINT operation_theatre_id FK
        VARCHAR surgery_status
    }
    surgery_team_members {
        BIGINT id PK
        BIGINT surgery_case_id FK
        BIGINT user_id FK
        VARCHAR role
    }
    surgery_checklists {
        BIGINT id PK
        BIGINT surgery_case_id FK
        VARCHAR checklist_type
        VARCHAR status
    }
    anesthesia_records {
        BIGINT id PK
        BIGINT surgery_case_id FK
        VARCHAR anesthesia_type
    }
    surgery_notes {
        BIGINT id PK
        BIGINT surgery_case_id FK
        TEXT note_text
    }
    post_operation_notes {
        BIGINT id PK
        BIGINT surgery_case_id FK
        TEXT note_text
    }

    operation_theatres ||--o{ surgery_cases : hosts
    surgery_cases ||--o{ surgery_team_members : includes
    surgery_cases ||--o{ surgery_checklists : verifies
    surgery_cases ||--o{ anesthesia_records : records
    surgery_cases ||--o{ surgery_notes : documents
    surgery_cases ||--o{ post_operation_notes : follows_up
```

### Relationship Explanation

- Surgery case belongs to encounter and operation theatre.
- Team, checklist, anesthesia and notes belong to surgery case.

### FHIR Mapping Summary

- surgery_cases -> Procedure
- operation_theatres -> Location
- anesthesia_records -> Observation
- surgery_notes -> DocumentReference

### Tenant / Hospital / Branch Scope

- Surgery and OT tables are branch-level and encounter-level.

### Key Indexes Required

- `idx_surgery_cases_encounter on surgery_cases(encounter_id, surgery_status)`
- `idx_ot_branch_status on operation_theatres(branch_id, status)`

### Developer Notes

- Surgery checklist should be auditable.
- OT booking conflicts should be prevented at service layer and indexed by theatre/time.

## 12. Documents and Audit ERD

Defines document versioning, access logs, audit logs, consent and break-glass tracking.

```mermaid
erDiagram
    documents {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT encounter_id FK
        VARCHAR document_type
        VARCHAR status
    }
    document_versions {
        BIGINT id PK
        BIGINT document_id FK
        INT version_no
        VARCHAR file_url
    }
    document_access_logs {
        BIGINT id PK
        BIGINT document_id FK
        BIGINT accessed_by FK
        DATETIME accessed_at
    }
    document_signatures {
        BIGINT id PK
        BIGINT document_id FK
        BIGINT signed_by FK
        DATETIME signed_at
    }
    audit_logs {
        BIGINT id PK
        VARCHAR entity_name
        BIGINT entity_id
        VARCHAR action
    }
    user_login_history {
        BIGINT id PK
        BIGINT user_id FK
        DATETIME login_at
    }
    patient_record_access_logs {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT accessed_by FK
        DATETIME accessed_at
    }
    consent_records {
        BIGINT id PK
        BIGINT patient_id FK
        VARCHAR consent_type
        VARCHAR status
    }
    break_glass_access_logs {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT user_id FK
        VARCHAR reason
    }
    data_export_logs {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT exported_by FK
        DATETIME exported_at
    }

    documents ||--o{ document_versions : versions
    documents ||--o{ document_access_logs : accessed
    documents ||--o{ document_signatures : signed
    documents ||--o{ audit_logs : audited
    patient_record_access_logs ||--o{ audit_logs : contributes
    consent_records ||--o{ audit_logs : audited
    break_glass_access_logs ||--o{ audit_logs : audited
    data_export_logs ||--o{ audit_logs : audited
```

### Relationship Explanation

- Documents support versioning, access logs and signatures.
- Audit records are created for critical access and changes.
- Break-glass access is tracked separately.

### FHIR Mapping Summary

- documents -> DocumentReference
- audit_logs -> AuditEvent
- consent_records -> Consent
- change tracking -> Provenance

### Tenant / Hospital / Branch Scope

- Documents can be patient-level or encounter-level.
- Audit logs include tenant_id/hospital_id/branch_id where applicable.

### Key Indexes Required

- `idx_documents_patient_encounter on documents(patient_id, encounter_id)`
- `idx_audit_entity on audit_logs(entity_name, entity_id)`
- `idx_patient_access_logs on patient_record_access_logs(patient_id, accessed_at)`

### Developer Notes

- Do not delete audit logs in normal application flow.
- Document signatures should be immutable after signing.

## 13. FHIR Mapping ERD

Defines FHIR resource mapping, resource store, API audit, sync and terminology mapping.

```mermaid
erDiagram
    fhir_resource_mapping {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        VARCHAR internal_table_name
        BIGINT internal_record_id
        VARCHAR fhir_resource_type
        VARCHAR fhir_resource_id
    }
    fhir_resource_store {
        BIGINT id PK
        BIGINT mapping_id FK
        VARCHAR resource_type
        JSON resource_json
    }
    fhir_api_audit_log {
        BIGINT id PK
        BIGINT tenant_id FK
        VARCHAR request_method
        VARCHAR resource_type
        INT status_code
    }
    fhir_sync_status {
        BIGINT id PK
        BIGINT mapping_id FK
        VARCHAR target_system
        VARCHAR sync_status
    }
    fhir_profile_registry {
        BIGINT id PK
        VARCHAR resource_type
        VARCHAR profile_url
        VARCHAR fhir_version
    }
    fhir_code_system_mapping {
        BIGINT id PK
        VARCHAR internal_code
        VARCHAR standard_system
        VARCHAR standard_code
    }
    fhir_value_set_mapping {
        BIGINT id PK
        VARCHAR value_set_url
        VARCHAR internal_value
        VARCHAR fhir_value
    }

    fhir_resource_mapping ||--o{ fhir_resource_store : stores
    fhir_resource_mapping ||--o{ fhir_sync_status : syncs
    fhir_profile_registry ||--o{ fhir_resource_mapping : validates
    fhir_code_system_mapping ||--o{ fhir_resource_mapping : codes
    fhir_value_set_mapping ||--o{ fhir_resource_mapping : values
    fhir_api_audit_log }o--|| fhir_resource_mapping : audits
```

### Relationship Explanation

- FHIR mapping connects internal table name + internal record ID to FHIR resource type + resource ID.
- FHIR store can hold generated JSON if needed.
- API audit logs every external FHIR API request.

### FHIR Mapping Summary

- Supports Patient, Encounter, Observation, Condition, ServiceRequest, DiagnosticReport, MedicationRequest, MedicationDispense, Account, Claim, DocumentReference, AuditEvent and more.

### Tenant / Hospital / Branch Scope

- FHIR mapping includes tenant_id/hospital_id and branch_id where relevant.

### Key Indexes Required

- `idx_fhir_internal_record on fhir_resource_mapping(internal_table_name, internal_record_id)`
- `idx_fhir_resource_id on fhir_resource_mapping(fhir_resource_type, fhir_resource_id)`
- `idx_fhir_sync_status on fhir_sync_status(mapping_id, target_system, sync_status)`

### Developer Notes

- FHIR tables are not source of truth; normalized HMS tables are source of truth.
- Terminology mapping should be reviewed by integration/clinical standards team.

## 14. HL7 Integration ERD

Defines inbound/outbound HL7 message logging and external identifier mapping.

```mermaid
erDiagram
    hl7_message_log {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        VARCHAR message_type
        VARCHAR direction
        VARCHAR processing_status
    }
    hl7_message_error_log {
        BIGINT id PK
        BIGINT message_id FK
        VARCHAR error_code
        TEXT error_message
    }
    hl7_external_identifier_mapping {
        BIGINT id PK
        VARCHAR external_system
        VARCHAR external_id
        VARCHAR internal_table_name
        BIGINT internal_record_id
    }
    hl7_patient_mapping {
        BIGINT id PK
        BIGINT message_id FK
        VARCHAR external_patient_id
        BIGINT patient_id FK
    }
    hl7_order_mapping {
        BIGINT id PK
        BIGINT message_id FK
        VARCHAR external_order_id
        BIGINT internal_order_id
        VARCHAR order_table
    }
    hl7_result_mapping {
        BIGINT id PK
        BIGINT message_id FK
        VARCHAR external_result_id
        BIGINT internal_result_id
        VARCHAR result_table
    }

    hl7_message_log ||--o{ hl7_message_error_log : errors
    hl7_message_log ||--o{ hl7_patient_mapping : maps_patient
    hl7_message_log ||--o{ hl7_order_mapping : maps_order
    hl7_message_log ||--o{ hl7_result_mapping : maps_result
    hl7_external_identifier_mapping }o--|| hl7_patient_mapping : may_reference
    hl7_external_identifier_mapping }o--|| hl7_order_mapping : may_reference
    hl7_external_identifier_mapping }o--|| hl7_result_mapping : may_reference
```

### Relationship Explanation

- HL7 message log stores inbound/outbound ADT, ORM, ORU, SIU, DFT and MDM messages.
- Mapping tables connect external patient/order/result IDs to internal records.
- Error log belongs to message log.

### FHIR Mapping Summary

- HL7 is not FHIR, but HL7 events can create/update internal records that later map to FHIR resources.

### Tenant / Hospital / Branch Scope

- HL7 tables include tenant/hospital/branch context when known from message routing.

### Key Indexes Required

- `idx_hl7_message_type_status on hl7_message_log(message_type, direction, processing_status)`
- `idx_hl7_external_identifier on hl7_external_identifier_mapping(external_system, external_id)`
- `idx_hl7_patient_mapping on hl7_patient_mapping(external_patient_id, patient_id)`

### Developer Notes

- Never drop raw message logs without retention policy.
- Message replay should be idempotent using message control ID.

## 15. Reporting / Analytics ERD

Defines denormalized summaries used by dashboards, reports and AI command center.

```mermaid
erDiagram
    daily_branch_revenue_summary {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        DATE summary_date
        BIGINT revenue_amount_minor
    }
    daily_patient_visit_summary {
        BIGINT id PK
        BIGINT tenant_id FK
        BIGINT hospital_id FK
        BIGINT branch_id FK
        DATE summary_date
        INT visit_count
    }
    doctor_performance_summary {
        BIGINT id PK
        BIGINT doctor_id FK
        DATE summary_date
        INT encounter_count
    }
    department_collection_summary {
        BIGINT id PK
        BIGINT department_id FK
        DATE summary_date
        BIGINT collection_amount_minor
    }
    lab_test_volume_summary {
        BIGINT id PK
        BIGINT branch_id FK
        DATE summary_date
        INT test_count
    }
    pharmacy_stock_snapshot {
        BIGINT id PK
        BIGINT branch_id FK
        BIGINT medicine_id FK
        DATE snapshot_date
        INT quantity
    }
    bed_occupancy_summary {
        BIGINT id PK
        BIGINT branch_id FK
        DATE summary_date
        INT occupied_beds
    }
    patient_journey_summary {
        BIGINT id PK
        BIGINT patient_id FK
        BIGINT encounter_id FK
        VARCHAR current_stage
        VARCHAR risk_level
    }

    daily_branch_revenue_summary }o--|| billing_invoices : generated_from
    daily_patient_visit_summary }o--|| encounters : generated_from
    doctor_performance_summary }o--|| encounters : generated_from
    department_collection_summary }o--|| billing_invoice_items : generated_from
    lab_test_volume_summary }o--|| lab_orders : generated_from
    pharmacy_stock_snapshot }o--|| pharmacy_stock : generated_from
    bed_occupancy_summary }o--|| bed_allocations : generated_from
    patient_journey_summary }o--|| encounters : generated_from
```

### Relationship Explanation

- Reporting tables are generated from transactional source tables.
- They are not source of truth.
- They are used for dashboards, reports and AI command center.

### FHIR Mapping Summary

- Reporting tables usually do not map directly to FHIR resources.

### Tenant / Hospital / Branch Scope

- Summary tables must retain tenant_id/hospital_id/branch_id according to reporting level.

### Key Indexes Required

- `idx_daily_revenue_branch_date on daily_branch_revenue_summary(branch_id, summary_date)`
- `idx_visit_summary_branch_date on daily_patient_visit_summary(branch_id, summary_date)`
- `idx_patient_journey_encounter on patient_journey_summary(patient_id, encounter_id)`

### Developer Notes

- Do not write business transactions directly into summary tables.
- Refresh summaries through scheduled jobs or events.

## A. Table Relationship Matrix

| Parent Table | Child Table | Relationship | Parent Key | Child Foreign Key | Module | FHIR Resource | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tenants | hospitals | 1:N | tenants.id | hospitals.tenant_id | Foundation | Organization | Tenant owns hospitals. |
| hospitals | branches | 1:N | hospitals.id | branches.hospital_id | Foundation | Location | Hospital has branches. |
| hospitals | patients | 1:N | hospitals.id | patients.hospital_id | Patient | Patient | Patient is hospital-level. |
| branches | appointments | 1:N | branches.id | appointments.branch_id | Appointment | Appointment | Appointment is branch-level. |
| patients | appointments | 1:N | patients.id | appointments.patient_id | Appointment | Appointment | Patient books appointments. |
| appointments | encounters | 0/1:1 | appointments.id | encounters.appointment_id | Encounter | Encounter | Appointment may create encounter. |
| patients | encounters | 1:N | patients.id | encounters.patient_id | Encounter | Encounter | Patient has visits. |
| branches | encounters | 1:N | branches.id | encounters.branch_id | Encounter | Encounter | Encounter is branch-level. |
| encounters | vitals | 1:N | encounters.id | vitals.encounter_id | Clinical | Observation | Vitals are encounter observations. |
| encounters | diagnoses | 1:N | encounters.id | diagnoses.encounter_id | Clinical | Condition | Diagnosis belongs to encounter. |
| encounters | clinical_notes | 1:N | encounters.id | clinical_notes.encounter_id | Clinical | DocumentReference | Notes belong to encounter. |
| encounters | prescriptions | 1:N | encounters.id | prescriptions.encounter_id | Prescription | MedicationRequest | Medication orders. |
| prescriptions | prescription_items | 1:N | prescriptions.id | prescription_items.prescription_id | Prescription | MedicationRequest | Prescription items. |
| medicine_master | prescription_items | 1:N | medicine_master.id | prescription_items.medicine_id | Prescription | Medication | Medicine selected in prescription. |
| encounters | lab_orders | 1:N | encounters.id | lab_orders.encounter_id | Lab | ServiceRequest | Encounter requests lab. |
| lab_orders | lab_order_items | 1:N | lab_orders.id | lab_order_items.lab_order_id | Lab | ServiceRequest | Lab order has tests. |
| lab_order_items | lab_results | 1:N | lab_order_items.id | lab_results.lab_order_item_id | Lab | Observation | Test item produces results. |
| encounters | radiology_orders | 1:N | encounters.id | radiology_orders.encounter_id | Radiology | ServiceRequest | Encounter requests imaging. |
| radiology_orders | radiology_reports | 1:N | radiology_orders.id | radiology_reports.radiology_order_id | Radiology | DiagnosticReport | Imaging order produces report. |
| medicine_master | medicine_batches | 1:N | medicine_master.id | medicine_batches.medicine_id | Pharmacy | Medication | Medicine has batches. |
| medicine_batches | pharmacy_stock | 1:N | medicine_batches.id | pharmacy_stock.medicine_batch_id | Pharmacy | Internal | Batch stock per branch. |
| pharmacy_sales | pharmacy_sale_items | 1:N | pharmacy_sales.id | pharmacy_sale_items.sale_id | Pharmacy | MedicationDispense | Sale has line items. |
| encounters | billing_invoices | 1:N | encounters.id | billing_invoices.encounter_id | Billing | Account | Encounter generates invoices. |
| billing_invoices | billing_invoice_items | 1:N | billing_invoices.id | billing_invoice_items.invoice_id | Billing | ChargeItem | Invoice has charges. |
| billing_invoices | payment_allocations | 1:N | billing_invoices.id | payment_allocations.invoice_id | Billing | ExplanationOfBenefit | Payment allocated to invoice. |
| payments | payment_allocations | 1:N | payments.id | payment_allocations.payment_id | Billing | PaymentReconciliation | One payment covers invoices. |
| encounters | admissions | 0/1:N | encounters.id | admissions.encounter_id | IPD | Encounter | Encounter may create admission. |
| wards | rooms | 1:N | wards.id | rooms.ward_id | IPD | Location | Ward has rooms. |
| rooms | beds | 1:N | rooms.id | beds.room_id | IPD | Location | Room has beds. |
| admissions | bed_allocations | 1:N | admissions.id | bed_allocations.admission_id | IPD | Encounter.location | Admission has bed history. |
| operation_theatres | surgery_cases | 1:N | operation_theatres.id | surgery_cases.operation_theatre_id | Surgery | Location/Procedure | OT hosts surgery. |
| surgery_cases | surgery_team_members | 1:N | surgery_cases.id | surgery_team_members.surgery_case_id | Surgery | PractitionerRole | Surgery team. |
| patients | documents | 1:N | patients.id | documents.patient_id | Documents | DocumentReference | Patient documents. |
| encounters | documents | 1:N | encounters.id | documents.encounter_id | Documents | DocumentReference | Encounter documents. |
| documents | document_versions | 1:N | documents.id | document_versions.document_id | Documents | DocumentReference | Version history. |
| documents | document_access_logs | 1:N | documents.id | document_access_logs.document_id | Audit | AuditEvent | Document access. |
| patients | patient_record_access_logs | 1:N | patients.id | patient_record_access_logs.patient_id | Audit | AuditEvent | Patient access logs. |
| fhir_resource_mapping | fhir_resource_store | 1:N | fhir_resource_mapping.id | fhir_resource_store.mapping_id | FHIR | All | FHIR JSON store. |
| hl7_message_log | hl7_message_error_log | 1:N | hl7_message_log.id | hl7_message_error_log.message_id | HL7 | HL7 v2 | HL7 errors. |

## B. Module-Wise Table Ownership Matrix

| Module | Tables | Owner Team | Shared Dependencies | FHIR Mapping | Review Required |
| --- | --- | --- | --- | --- | --- |
| Foundation/RBAC | tenants, hospitals, branches, departments, healthcare_services, users, roles, permissions, role_permissions, user_branch_access | Foundation Team | None | Organization, Location, PractitionerRole | Database Architect |
| Patient/MPI | patients, identifiers, addresses, contacts, allergies, insurance, documents, consent | Patient Team | hospitals, users | Patient, AllergyIntolerance, Consent | FHIR Team |
| Appointment/Encounter | appointments, slots, status history, encounters, participants | Front Office + Clinical Team | patients, users, branches | Appointment, Encounter | Patient + FHIR Team |
| Clinical EMR | vitals, diagnoses, notes, procedures, care_plans, clinical_documents | Clinical Team | encounters, patients, users | Observation, Condition, Procedure, CarePlan | FHIR Team |
| Prescription/Pharmacy | prescriptions, prescription_items, medicine_master, batches, stock, dispense, sales, movements | Pharmacy Team | encounters, billing, branches | MedicationRequest, Medication, MedicationDispense | Clinical + Billing |
| Lab/Radiology | lab/radiology orders, items, samples, results, reports, imaging | Diagnostics Team | encounters, patients, billing | ServiceRequest, Observation, DiagnosticReport | FHIR/HL7 Team |
| Billing/Insurance | invoices, invoice_items, payments, allocations, refunds, policies, claims | Billing Team | patients, encounters, services | Account, ChargeItem, Claim | Finance + Architect |
| IPD/Surgery | admissions, wards, rooms, beds, nursing, discharge, surgery, OT | IPD/Surgery Team | encounters, branches, billing | Encounter, Location, Procedure | Clinical + Billing |
| Documents/Audit | documents, versions, access logs, signatures, audit logs, consent, break glass | Compliance Team | patients, encounters, users | DocumentReference, AuditEvent, Consent | Security + Compliance |
| FHIR/HL7 | fhir_resource_mapping, fhir_store, fhir_audit, hl7_message_log, mapping tables | Integration Team | all modules | All mapped resources | Architect + Module Owners |
| Reporting/Analytics | daily summaries, snapshots, patient_journey_summary | Reporting Team | transaction tables | N/A | Architect + Module Owners |

## C. Foreign Key Rule Matrix

| Table | FK Column | References Table | Cascade Rule | Index Required | Reason |
| --- | --- | --- | --- | --- | --- |
| hospitals | tenant_id | tenants.id | NO CASCADE DELETE | Yes | Tenant owns hospital; deletion should be controlled. |
| branches | hospital_id | hospitals.id | NO CASCADE DELETE | Yes | Branch records are operationally critical. |
| patients | hospital_id | hospitals.id | NO CASCADE DELETE | Yes | Patient records must not be cascade deleted. |
| appointments | patient_id | patients.id | NO CASCADE DELETE | Yes | Appointments belong to patient. |
| appointments | branch_id | branches.id | NO CASCADE DELETE | Yes | Appointments are branch-level. |
| encounters | patient_id | patients.id | NO CASCADE DELETE | Yes | Encounter is patient clinical record. |
| encounters | branch_id | branches.id | NO CASCADE DELETE | Yes | Encounter is branch-level. |
| vitals | encounter_id | encounters.id | NO CASCADE DELETE | Yes | Clinical record must be retained. |
| diagnoses | encounter_id | encounters.id | NO CASCADE DELETE | Yes | Clinical record must be retained. |
| prescriptions | encounter_id | encounters.id | NO CASCADE DELETE | Yes | Medication order traceability. |
| lab_orders | encounter_id | encounters.id | NO CASCADE DELETE | Yes | Diagnostic order traceability. |
| billing_invoices | encounter_id | encounters.id | NO CASCADE DELETE | Yes | Financial audit. |
| payments | branch_id | branches.id | NO CASCADE DELETE | Yes | Financial transaction scope. |
| documents | patient_id | patients.id | NO CASCADE DELETE | Yes | Document traceability. |
| audit_logs | performed_by | users.id | NO CASCADE DELETE | Yes | Audit must survive user deactivation. |

## D. Index Recommendation Table

| Table | Index Name | Columns | Purpose |
| --- | --- | --- | --- |
| patients | idx_patients_tenant_hospital_mrn | tenant_id, hospital_id, mrn | Fast MRN lookup under hospital. |
| patient_identifiers | idx_patient_identifiers_value | identifier_type, identifier_value | Patient search by external/government identifiers. |
| appointments | idx_appointments_branch_date_status | tenant_id, hospital_id, branch_id, appointment_date, status | Queue and schedule search. |
| encounters | idx_encounters_branch_patient | tenant_id, hospital_id, branch_id, patient_id | Patient visit lookup. |
| vitals | idx_vitals_encounter_time | encounter_id, created_at | Clinical timeline. |
| diagnoses | idx_diagnoses_patient_code | patient_id, diagnosis_code | Problem history. |
| lab_orders | idx_lab_orders_branch_status | tenant_id, hospital_id, branch_id, status, ordered_at | Lab queue. |
| lab_results | idx_lab_results_order_item | lab_order_item_id, result_status | Result lookup. |
| radiology_orders | idx_radiology_orders_branch_status | tenant_id, hospital_id, branch_id, status, ordered_at | Radiology queue. |
| pharmacy_stock | idx_pharmacy_stock_branch_batch | branch_id, medicine_batch_id | Stock lookup. |
| stock_movements | idx_stock_movements_branch_date | branch_id, created_at | Stock audit. |
| billing_invoices | idx_billing_invoices_branch_date | tenant_id, hospital_id, branch_id, invoice_date, status | Billing dashboard. |
| payment_allocations | idx_payment_allocations_invoice | invoice_id, payment_id | Payment allocation lookup. |
| documents | idx_documents_patient_encounter | patient_id, encounter_id | Document list. |
| audit_logs | idx_audit_entity | entity_name, entity_id, created_at | Audit lookup. |
| fhir_resource_mapping | idx_fhir_internal_record | internal_table_name, internal_record_id | Internal to FHIR mapping. |
| hl7_message_log | idx_hl7_message_type_status | message_type, direction, processing_status | HL7 processing queue. |

## E. ERD Validation Checklist

- No duplicate business entity tables.
- All tenant-scoped tables have tenant_id.
- All branch operations have branch_id.
- Patient connects to encounters.
- Encounter connects to clinical, lab, pharmacy and billing.
- FHIR mapping exists for healthcare data.
- HL7 message logging exists.
- Audit tables exist.
- Reporting tables are clearly denormalized.
- Migration naming follows Flyway timestamp convention.
- Money values use BIGINT minor units, not FLOAT/DOUBLE.
- No cascade delete on patient, encounter, clinical, billing or audit records.

## Final Recommendation

Create foundation and RBAC tables first. Create patient tables before appointment and encounter. Create encounter before clinical, diagnostics, prescription, pharmacy and billing. Create FHIR/HL7 integration tables after core transactional tables. Create denormalized reporting tables last.