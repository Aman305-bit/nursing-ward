from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SQL_PATH = ROOT / "database" / "plasmit_hms_fhir_r5_full_schema.sql"
NOTES_PATH = ROOT / "docs" / "plasmit-hms-fhir-r5-full-schema-notes.md"


DB_NAME = "plasmit_hms"


FHIR_SOURCES = [
    "https://hl7.org/fhir/R5/resourcelist.html",
    "https://hl7.org/fhir/R5/resource.html",
    "https://hl7.org/fhir/R5/datatypes.html",
    "https://hl7.org/fhir/R5/references.html",
    "https://hl7.org/fhir/R5/search.html",
    "https://hl7.org/fhir/R5/codesystem.html",
    "https://hl7.org/fhir/R5/valueset.html",
    "https://hl7.org/fhir/R5/conceptmap.html",
    "https://hl7.org/fhir/R5/structuredefinition.html",
    "https://hl7.org/fhir/R5/capabilitystatement.html",
    "https://hl7.org/fhir/R5/implementationguide.html",
    "https://hl7.org/fhir/R5/compartmentdefinition-patient.html",
]


MODULES = [
    "Master Data / Terminology",
    "Foundation / Tenant / Hospital / Branch / RBAC",
    "Patient Registration / MPI",
    "Appointment / Scheduling",
    "Encounter / OPD / Visit / Emergency Visit",
    "Clinical EMR / Doctor Workbench",
    "ICU / Critical Care",
    "Prescription / Medication Orders",
    "Pharmacy / Inventory / Dispensing",
    "Lab / Diagnostics",
    "Radiology / Imaging",
    "Billing / Payment / Insurance / Claims",
    "IPD / Ward / Room / Bed / Nursing / Discharge",
    "Surgery / OT / Anesthesia",
    "Emergency / Ambulance / Transport",
    "Documents / Forms / Questionnaires",
    "Communication / Notification / Task",
    "Audit / Compliance / Consent / Provenance",
    "FHIR R5 Interoperability Layer",
    "HL7 Integration",
    "Reporting / Analytics / AI Command Center",
]


MASTER_TABLES = [
    "gender_master",
    "blood_group_master",
    "country_master",
    "state_master",
    "city_master",
    "department_type_master",
    "encounter_type_master",
    "appointment_status_master",
    "invoice_status_master",
    "payment_mode_master",
    "diagnosis_code_master",
    "loinc_code_master",
    "snomed_code_master",
    "icd10_code_master",
    "rxnorm_code_master",
    "fhir_resource_type_master",
    "hl7_message_type_master",
    "code_system_master",
    "value_set_master",
    "concept_map_master",
    "local_code_systems",
    "local_to_fhir_code_mappings",
    "loinc_mappings",
    "snomed_mappings",
    "icd10_mappings",
    "rxnorm_mappings",
]


OPERATIONAL_GENERIC_TABLES_BY_MODULE = {
    "Patient Registration / MPI": [
        "patient_identifiers",
        "patient_addresses",
        "patient_contacts",
        "patient_emergency_contacts",
        "patient_allergies",
        "patient_insurance",
        "patient_consent_records",
        "patient_documents",
        "master_patient_index",
        "patient_linkages",
    ],
    "Appointment / Scheduling": [
        "schedules",
        "slots",
        "appointment_slots",
        "appointment_participants",
        "appointment_status_history",
        "appointment_reminders",
        "appointment_cancellations",
        "appointment_waitlist",
    ],
    "Encounter / OPD / Visit / Emergency Visit": [
        "encounter_participants",
        "encounter_locations",
        "encounter_status_history",
        "episode_of_care",
        "visit_triage",
        "patient_flags",
        "encounter_tasks",
    ],
    "Clinical EMR / Doctor Workbench": [
        "vitals",
        "diagnoses",
        "problem_lists",
        "clinical_notes",
        "progress_notes",
        "physical_examinations",
        "review_of_systems",
        "family_history",
        "social_history",
        "procedures",
        "care_plans",
        "care_plan_goals",
        "risk_assessments",
        "clinical_impressions",
        "adverse_events",
        "detected_issues",
        "clinical_documents",
        "patient_alerts",
        "clinical_orders",
    ],
    "ICU / Critical Care": [
        "icu_units",
        "icu_beds",
        "icu_admissions",
        "icu_rounds",
        "icu_vitals_charting",
        "icu_intake_output_chart",
        "icu_medication_infusions",
        "icu_ventilator_settings",
        "icu_device_monitoring",
        "icu_nursing_observations",
        "icu_doctor_notes",
        "icu_score_assessments",
        "icu_care_plans",
        "icu_shift_handover",
        "icu_discharge_transfer",
    ],
    "Prescription / Medication Orders": [
        "medicine_master",
        "medicine_categories",
        "medication_knowledge",
        "medication_instructions",
        "medication_statements",
        "medication_administration_records",
        "immunizations",
        "immunization_recommendations",
    ],
    "Pharmacy / Inventory / Dispensing": [
        "medicine_batches",
        "pharmacy_stock",
        "stock_movements",
        "pharmacy_dispense",
        "pharmacy_dispense_items",
        "pharmacy_sale_items",
        "pharmacy_returns",
        "pharmacy_return_items",
        "purchase_orders",
        "purchase_order_items",
        "goods_receipts",
        "goods_receipt_items",
        "inventory_items",
        "inventory_reports",
        "supply_requests",
        "supply_deliveries",
    ],
    "Lab / Diagnostics": [
        "lab_test_master",
        "lab_test_parameters",
        "observation_definitions",
        "specimen_definitions",
        "lab_order_items",
        "lab_samples",
        "lab_results",
        "lab_result_parameters",
        "diagnostic_reports",
        "lab_result_review_history",
        "genomic_studies",
        "molecular_sequences",
    ],
    "Radiology / Imaging": [
        "radiology_test_master",
        "radiology_order_items",
        "imaging_studies",
        "imaging_selections",
        "radiology_reports",
        "radiology_report_review_history",
        "radiology_documents",
    ],
    "Billing / Payment / Insurance / Claims": [
        "patient_accounts",
        "billing_invoice_items",
        "charge_items",
        "charge_item_definitions",
        "payment_allocations",
        "payment_notices",
        "payment_reconciliations",
        "refunds",
        "insurance_plans",
        "insurance_policies",
        "coverage_eligibility_requests",
        "coverage_eligibility_responses",
        "insurance_claims",
        "insurance_claim_items",
        "claim_responses",
        "explanation_of_benefits",
        "claim_documents",
        "claim_status_history",
        "contracts",
    ],
    "IPD / Ward / Room / Bed / Nursing / Discharge": [
        "admissions",
        "wards",
        "rooms",
        "beds",
        "bed_allocations",
        "nursing_notes",
        "nursing_tasks",
        "nursing_care_plans",
        "discharge_plans",
        "discharge_summaries",
        "nutrition_orders",
        "nutrition_intakes",
    ],
    "Surgery / OT / Anesthesia": [
        "operation_theatres",
        "surgery_cases",
        "surgery_team_members",
        "surgery_checklists",
        "anesthesia_records",
        "surgery_notes",
        "post_operation_notes",
        "procedure_devices",
        "body_structures",
    ],
    "Emergency / Ambulance / Transport": [
        "emergency_cases",
        "triage_records",
        "ambulance_requests",
        "ambulance_dispatches",
        "ambulance_tracking",
        "patient_transports",
        "emergency_observations",
    ],
    "Documents / Forms / Questionnaires": [
        "documents",
        "document_versions",
        "document_access_logs",
        "document_signatures",
        "compositions",
        "questionnaires",
        "questionnaire_items",
        "questionnaire_responses",
        "questionnaire_response_items",
        "binary_files",
    ],
    "Communication / Notification / Task": [
        "communications",
        "communication_requests",
        "tasks",
        "task_history",
        "subscriptions",
        "subscription_events",
        "notification_logs",
        "message_headers",
        "bundles",
    ],
    "Audit / Compliance / Consent / Provenance": [
        "audit_logs",
        "user_login_history",
        "patient_record_access_logs",
        "consent_records",
        "break_glass_access_logs",
        "data_export_logs",
        "provenance_records",
        "security_labels",
        "access_permissions",
    ],
}


FHIR_DATATYPE_TABLES = [
    "fhir_identifiers",
    "fhir_human_names",
    "fhir_addresses",
    "fhir_contact_points",
    "fhir_codeable_concepts",
    "fhir_codings",
    "fhir_references",
    "fhir_periods",
    "fhir_quantities",
    "fhir_ranges",
    "fhir_ratios",
    "fhir_attachments",
    "fhir_annotations",
    "fhir_timing",
    "fhir_dosages",
    "fhir_money",
    "fhir_sampled_data",
    "fhir_signatures",
    "fhir_extensions",
    "fhir_meta",
    "fhir_narratives",
    "fhir_resource_tags",
    "fhir_resource_security_labels",
    "fhir_resource_profiles",
]


FHIR_CORE_TABLES = [
    "fhir_resource_mapping",
    "fhir_resource_store",
    "fhir_resource_versions",
    "fhir_resource_references",
    "fhir_search_parameters",
    "fhir_search_index",
    "fhir_profiles",
    "fhir_structure_definitions",
    "fhir_implementation_guides",
    "fhir_capability_statements",
    "fhir_operation_definitions",
    "fhir_compartment_definitions",
    "fhir_code_systems",
    "fhir_value_sets",
    "fhir_concept_maps",
    "fhir_terminology_bindings",
    "fhir_validation_results",
    "fhir_sync_status",
    "fhir_api_audit_log",
    "fhir_resource_element_definitions",
]


HL7_TABLES = [
    "hl7_message_log",
    "hl7_message_error_log",
    "hl7_external_identifier_mapping",
    "hl7_patient_mapping",
    "hl7_order_mapping",
    "hl7_result_mapping",
    "hl7_segment_store",
    "hl7_acknowledgement_log",
]


REPORTING_TABLES = [
    "daily_branch_revenue_summary",
    "daily_patient_visit_summary",
    "doctor_performance_summary",
    "department_collection_summary",
    "lab_test_volume_summary",
    "pharmacy_stock_snapshot",
    "bed_occupancy_summary",
    "patient_journey_summary",
    "icu_critical_alert_summary",
    "emergency_waiting_time_summary",
    "fhir_sync_summary",
    "hl7_message_summary",
]


FHIR_RESOURCE_TYPES = [
    ("Patient", "Base / Administration"),
    ("Practitioner", "Base / Administration"),
    ("PractitionerRole", "Base / Administration"),
    ("RelatedPerson", "Base / Administration"),
    ("Person", "Base / Administration"),
    ("Group", "Base / Administration"),
    ("Organization", "Base / Administration"),
    ("OrganizationAffiliation", "Base / Administration"),
    ("Location", "Base / Administration"),
    ("HealthcareService", "Base / Administration"),
    ("Endpoint", "Base / Administration"),
    ("Device", "Specialized resources"),
    ("DeviceMetric", "Specialized resources"),
    ("DeviceRequest", "Workflow"),
    ("DeviceUsage", "Specialized resources"),
    ("Appointment", "Workflow"),
    ("AppointmentResponse", "Workflow"),
    ("Schedule", "Workflow"),
    ("Slot", "Workflow"),
    ("Encounter", "Clinical"),
    ("EncounterHistory", "Clinical"),
    ("EpisodeOfCare", "Clinical"),
    ("Flag", "Clinical"),
    ("List", "Clinical"),
    ("AllergyIntolerance", "Clinical"),
    ("AdverseEvent", "Clinical"),
    ("Condition", "Clinical"),
    ("Procedure", "Clinical"),
    ("FamilyMemberHistory", "Clinical"),
    ("ClinicalImpression", "Clinical"),
    ("DetectedIssue", "Clinical"),
    ("Observation", "Diagnostics"),
    ("DiagnosticReport", "Diagnostics"),
    ("Specimen", "Diagnostics"),
    ("ImagingStudy", "Diagnostics"),
    ("ImagingSelection", "Diagnostics"),
    ("Questionnaire", "Clinical Reasoning"),
    ("QuestionnaireResponse", "Clinical Reasoning"),
    ("Medication", "Medications"),
    ("MedicationRequest", "Medications"),
    ("MedicationAdministration", "Medications"),
    ("MedicationDispense", "Medications"),
    ("MedicationStatement", "Medications"),
    ("MedicationKnowledge", "Medication Definition"),
    ("Immunization", "Clinical"),
    ("ImmunizationEvaluation", "Clinical"),
    ("ImmunizationRecommendation", "Clinical"),
    ("CarePlan", "Clinical Reasoning"),
    ("CareTeam", "Clinical"),
    ("Goal", "Clinical Reasoning"),
    ("ServiceRequest", "Workflow"),
    ("NutritionOrder", "Clinical"),
    ("NutritionIntake", "Clinical"),
    ("RiskAssessment", "Clinical Reasoning"),
    ("RequestOrchestration", "Workflow"),
    ("Communication", "Workflow"),
    ("CommunicationRequest", "Workflow"),
    ("Task", "Workflow"),
    ("Transport", "Workflow"),
    ("Coverage", "Financial"),
    ("CoverageEligibilityRequest", "Financial"),
    ("CoverageEligibilityResponse", "Financial"),
    ("Claim", "Financial"),
    ("ClaimResponse", "Financial"),
    ("Invoice", "Financial"),
    ("Account", "Financial"),
    ("ChargeItem", "Financial"),
    ("ChargeItemDefinition", "Financial"),
    ("ExplanationOfBenefit", "Financial"),
    ("PaymentNotice", "Financial"),
    ("PaymentReconciliation", "Financial"),
    ("Contract", "Financial"),
    ("InsurancePlan", "Financial"),
    ("Consent", "Security and Privacy"),
    ("Provenance", "Security and Privacy"),
    ("AuditEvent", "Security and Privacy"),
    ("DocumentReference", "Documents"),
    ("Composition", "Documents"),
    ("Bundle", "Foundation"),
    ("Binary", "Foundation"),
    ("MessageHeader", "Foundation"),
    ("OperationOutcome", "Foundation"),
    ("Parameters", "Foundation"),
    ("Subscription", "Workflow"),
    ("SubscriptionStatus", "Workflow"),
    ("SubscriptionTopic", "Workflow"),
    ("CodeSystem", "Terminology"),
    ("ValueSet", "Terminology"),
    ("ConceptMap", "Terminology"),
    ("NamingSystem", "Terminology"),
    ("StructureDefinition", "Foundation"),
    ("CapabilityStatement", "Foundation"),
    ("ImplementationGuide", "Foundation"),
    ("SearchParameter", "Foundation"),
    ("OperationDefinition", "Foundation"),
    ("CompartmentDefinition", "Foundation"),
    ("StructureMap", "Foundation"),
    ("GraphDefinition", "Foundation"),
    ("Library", "Clinical Reasoning"),
    ("PlanDefinition", "Clinical Reasoning"),
    ("GuidanceResponse", "Clinical Reasoning"),
    ("Measure", "Quality Reporting"),
    ("MeasureReport", "Quality Reporting"),
    ("InventoryItem", "Specialized resources"),
    ("InventoryReport", "Specialized resources"),
    ("SupplyRequest", "Specialized resources"),
    ("SupplyDelivery", "Specialized resources"),
    ("ResearchStudy", "Public Health / Research"),
    ("ResearchSubject", "Public Health / Research"),
    ("ActivityDefinition", "Clinical Reasoning"),
    ("Requirements", "Foundation"),
    ("ObservationDefinition", "Diagnostics"),
    ("SpecimenDefinition", "Diagnostics"),
    ("GenomicStudy", "Diagnostics"),
    ("MolecularSequence", "Diagnostics"),
    ("BodyStructure", "Clinical"),
    ("Permission", "Security and Privacy"),
    ("Linkage", "Base / Administration"),
]


FHIR_ELEMENT_RESOURCES = [
    "Patient",
    "Organization",
    "Location",
    "Practitioner",
    "PractitionerRole",
    "HealthcareService",
    "Appointment",
    "Encounter",
    "Observation",
    "Condition",
    "Procedure",
    "ServiceRequest",
    "DiagnosticReport",
    "Specimen",
    "Medication",
    "MedicationRequest",
    "MedicationAdministration",
    "MedicationDispense",
    "CarePlan",
    "Goal",
    "DocumentReference",
    "Composition",
    "Consent",
    "Provenance",
    "AuditEvent",
    "Claim",
    "Coverage",
    "Invoice",
    "Account",
    "ChargeItem",
    "Task",
    "Communication",
    "Questionnaire",
    "QuestionnaireResponse",
]


COMMON_FHIR_ELEMENTS = [
    ("id", "id", "Logical id of this artifact", "id", "0", "1", 0, 1, None, None, None),
    ("meta", "meta", "Metadata about the resource", "Meta", "0", "1", 0, 1, None, None, None),
    ("implicitRules", "implicitRules", "Rules followed when building the resource", "uri", "0", "1", 1, 1, None, None, None),
    ("language", "language", "Human language of the resource content", "code", "0", "1", 0, 0, "preferred", "http://hl7.org/fhir/ValueSet/languages", None),
    ("text", "text", "Human-readable narrative", "Narrative", "0", "1", 0, 0, None, None, None),
    ("contained", "contained", "Contained inline resources", "Resource", "0", "*", 0, 0, None, None, "Resource"),
    ("extension", "extension", "Additional content defined by implementations", "Extension", "0", "*", 0, 0, None, None, None),
    ("modifierExtension", "modifierExtension", "Extensions that cannot be ignored", "Extension", "0", "*", 1, 0, None, None, None),
    ("identifier", "identifier", "Business identifier", "Identifier", "0", "*", 0, 1, None, None, None),
    ("status", "status", "Lifecycle status", "code", "0", "1", 1, 1, "required", None, None),
    ("category", "category", "Classification or category", "CodeableConcept", "0", "*", 0, 1, "example", None, None),
    ("code", "code", "Clinical or business code", "CodeableConcept", "0", "1", 0, 1, "example", None, None),
    ("subject", "subject", "Who or what the resource is about", "Reference", "0", "1", 0, 1, None, None, "Patient|Group|Device|Location"),
    ("encounter", "encounter", "Encounter context", "Reference", "0", "1", 0, 1, None, None, "Encounter"),
    ("effectiveDateTime", "effectiveDateTime", "Clinically relevant effective date/time", "dateTime", "0", "1", 0, 1, None, None, None),
    ("effectivePeriod", "effectivePeriod", "Clinically relevant effective period", "Period", "0", "1", 0, 1, None, None, None),
    ("performer", "performer", "Actor that performed the event", "Reference", "0", "*", 0, 0, None, None, "Practitioner|PractitionerRole|Organization|Patient|Device"),
    ("participant", "participant", "Participating actor", "BackboneElement", "0", "*", 0, 0, None, None, "Patient|Practitioner|PractitionerRole|RelatedPerson"),
    ("actor", "actor", "Actor reference", "Reference", "0", "1", 0, 0, None, None, "Patient|Practitioner|PractitionerRole|Organization|Device"),
    ("organization", "organization", "Responsible organization", "Reference", "0", "1", 0, 0, None, None, "Organization"),
    ("location", "location", "Location reference", "Reference", "0", "*", 0, 0, None, None, "Location"),
    ("serviceProvider", "serviceProvider", "Service provider organization", "Reference", "0", "1", 0, 0, None, None, "Organization"),
    ("authoredOn", "authoredOn", "Date/time resource was authored", "dateTime", "0", "1", 0, 0, None, None, None),
    ("recordedDate", "recordedDate", "Date/time information was recorded", "dateTime", "0", "1", 0, 0, None, None, None),
    ("issued", "issued", "Date/time resource was issued", "instant", "0", "1", 0, 0, None, None, None),
    ("note", "note", "Text notes", "Annotation", "0", "*", 0, 0, None, None, None),
    ("reason", "reason", "Reason for the event or request", "CodeableReference", "0", "*", 0, 0, "example", None, "Condition|Observation|DiagnosticReport"),
    ("basedOn", "basedOn", "Fulfills request", "Reference", "0", "*", 0, 0, None, None, "CarePlan|ServiceRequest|MedicationRequest"),
    ("partOf", "partOf", "Part of referenced event", "Reference", "0", "*", 0, 0, None, None, "Procedure|Observation|MedicationAdministration"),
    ("supportingInfo", "supportingInfo", "Additional supporting information", "Reference", "0", "*", 0, 0, None, None, "Resource"),
]


def esc(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def json_expr(value: dict | list) -> str:
    return f"CAST({esc(json.dumps(value, separators=(',', ':')))} AS JSON)"


def title_from_table(table_name: str) -> str:
    return table_name.replace("_", " ").title()


def table_comment(title: str) -> str:
    line = "=" * 92
    return f"\n-- {line}\n-- {title}\n-- {line}\n"


def engine() -> str:
    return "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"


def master_table_ddl(table_name: str) -> str:
    return f"""CREATE TABLE IF NOT EXISTS {table_name} (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  standard_system VARCHAR(160) NULL,
  standard_code VARCHAR(100) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  data_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_{table_name}_code (code),
  KEY idx_{table_name}_status (status),
  KEY idx_{table_name}_created_at (created_at)
) {engine()};"""


def generic_operational_table_ddl(table_name: str) -> str:
    return f"""CREATE TABLE IF NOT EXISTS {table_name} (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  patient_id BIGINT NULL,
  encounter_id BIGINT NULL,
  user_id BIGINT NULL,
  department_id BIGINT NULL,
  code VARCHAR(80) NULL,
  name VARCHAR(180) NULL,
  description TEXT NULL,
  business_key VARCHAR(120) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  priority VARCHAR(30) NULL,
  order_no VARCHAR(80) NULL,
  invoice_no VARCHAR(80) NULL,
  amount_minor BIGINT NULL,
  event_date DATE NULL,
  event_time TIME NULL,
  event_at DATETIME NULL,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  notes TEXT NULL,
  data_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_{table_name}_tenant_hospital (tenant_id, hospital_id),
  KEY idx_{table_name}_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_{table_name}_patient (patient_id),
  KEY idx_{table_name}_encounter (encounter_id),
  KEY idx_{table_name}_order_date (event_date),
  KEY idx_{table_name}_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""


def fhir_datatype_table_ddl(table_name: str) -> str:
    return f"""CREATE TABLE IF NOT EXISTS {table_name} (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  resource_type VARCHAR(80) NULL,
  resource_id VARCHAR(120) NULL,
  element_path VARCHAR(240) NULL,
  system_url VARCHAR(255) NULL,
  code VARCHAR(120) NULL,
  display_text VARCHAR(255) NULL,
  value_text TEXT NULL,
  value_number DECIMAL(18,6) NULL,
  value_date DATETIME NULL,
  unit VARCHAR(80) NULL,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  payload_json JSON NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_{table_name}_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_{table_name}_resource (resource_type, resource_id),
  KEY idx_{table_name}_system_code (system_url, code),
  KEY idx_{table_name}_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""


def reporting_table_ddl(table_name: str) -> str:
    return f"""CREATE TABLE IF NOT EXISTS {table_name} (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  report_date DATE NOT NULL,
  dimension_key VARCHAR(120) NULL,
  dimension_name VARCHAR(180) NULL,
  metric_count BIGINT NOT NULL DEFAULT 0,
  metric_amount_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  summary_json JSON NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_{table_name}_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_{table_name}_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""


def custom_ddls() -> dict[str, str]:
    ddls = {}
    ddls["tenants"] = f"""CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_code VARCHAR(60) NOT NULL,
  tenant_name VARCHAR(180) NOT NULL,
  legal_name VARCHAR(220) NULL,
  subscription_plan VARCHAR(80) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  contact_email VARCHAR(160) NULL,
  contact_phone VARCHAR(40) NULL,
  data_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_tenants_code (tenant_code),
  KEY idx_tenants_status (status)
) {engine()};"""
    ddls["hospitals"] = f"""CREATE TABLE IF NOT EXISTS hospitals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_code VARCHAR(60) NOT NULL,
  hospital_name VARCHAR(180) NOT NULL,
  legal_name VARCHAR(220) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  contact_email VARCHAR(160) NULL,
  contact_phone VARCHAR(40) NULL,
  address_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_hospitals_tenant_code (tenant_id, hospital_code),
  KEY idx_hospitals_tenant_status (tenant_id, status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
) {engine()};"""
    ddls["branches"] = f"""CREATE TABLE IF NOT EXISTS branches (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_code VARCHAR(60) NOT NULL,
  branch_name VARCHAR(180) NOT NULL,
  branch_type VARCHAR(80) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  contact_email VARCHAR(160) NULL,
  contact_phone VARCHAR(40) NULL,
  address_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_branches_hospital_code (hospital_id, branch_code),
  KEY idx_branches_tenant_hospital (tenant_id, hospital_id),
  KEY idx_branches_status (status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT
) {engine()};"""
    ddls["departments"] = f"""CREATE TABLE IF NOT EXISTS departments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  department_code VARCHAR(60) NOT NULL,
  department_name VARCHAR(180) NOT NULL,
  department_type VARCHAR(80) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_departments_tenant_hospital (tenant_id, hospital_id),
  KEY idx_departments_branch (branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""
    ddls["healthcare_services"] = f"""CREATE TABLE IF NOT EXISTS healthcare_services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  department_id BIGINT NULL,
  service_code VARCHAR(60) NOT NULL,
  service_name VARCHAR(180) NOT NULL,
  service_category VARCHAR(80) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_healthcare_services_branch (tenant_id, hospital_id, branch_id),
  KEY idx_healthcare_services_department (department_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) {engine()};"""
    ddls["roles"] = f"""CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NULL,
  role_code VARCHAR(80) NOT NULL,
  role_name VARCHAR(160) NOT NULL,
  role_scope VARCHAR(40) NOT NULL DEFAULT 'HOSPITAL',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_roles_tenant_code (tenant_id, role_code),
  KEY idx_roles_hospital (hospital_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
) {engine()};"""
    ddls["permissions"] = f"""CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  permission_code VARCHAR(120) NOT NULL,
  permission_name VARCHAR(180) NOT NULL,
  module_name VARCHAR(120) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_permissions_code (permission_code),
  KEY idx_permissions_module (module_name)
) {engine()};"""
    ddls["role_permissions"] = f"""CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_role_permissions_pair (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE RESTRICT
) {engine()};"""
    ddls["users"] = f"""CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  primary_branch_id BIGINT NULL,
  role_id BIGINT NULL,
  department_id BIGINT NULL,
  employee_code VARCHAR(80) NOT NULL,
  full_name VARCHAR(180) NOT NULL,
  user_type VARCHAR(60) NOT NULL,
  email VARCHAR(160) NULL,
  phone VARCHAR(40) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_users_hospital_employee (hospital_id, employee_code),
  KEY idx_users_tenant_hospital (tenant_id, hospital_id),
  KEY idx_users_branch_role (primary_branch_id, role_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (primary_branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) {engine()};"""
    ddls["user_branch_access"] = f"""CREATE TABLE IF NOT EXISTS user_branch_access (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  access_level VARCHAR(40) NOT NULL DEFAULT 'STANDARD',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_user_branch_access (user_id, branch_id),
  KEY idx_user_branch_tenant (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
) {engine()};"""
    ddls["user_department_access"] = generic_operational_table_ddl("user_department_access")
    ddls["audit_user_sessions"] = generic_operational_table_ddl("audit_user_sessions")
    ddls["patients"] = f"""CREATE TABLE IF NOT EXISTS patients (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  mrn VARCHAR(80) NOT NULL,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NULL,
  gender_code VARCHAR(30) NULL,
  date_of_birth DATE NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(160) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  data_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_patients_hospital_mrn (tenant_id, hospital_id, mrn),
  KEY idx_patients_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patients_name (first_name, last_name),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT
) {engine()};"""
    ddls["appointments"] = f"""CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT NULL,
  appointment_no VARCHAR(80) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type VARCHAR(60) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'BOOKED',
  reason TEXT NULL,
  data_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_appointments_no (tenant_id, hospital_id, appointment_no),
  KEY idx_appointments_branch_date (tenant_id, hospital_id, branch_id, appointment_date, status),
  KEY idx_appointments_patient (patient_id),
  KEY idx_appointments_doctor (doctor_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
) {engine()};"""
    ddls["encounters"] = f"""CREATE TABLE IF NOT EXISTS encounters (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  appointment_id BIGINT NULL,
  encounter_no VARCHAR(80) NOT NULL,
  encounter_type VARCHAR(60) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
  reason TEXT NULL,
  data_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_encounters_no (tenant_id, hospital_id, encounter_no),
  KEY idx_encounters_branch_patient (tenant_id, hospital_id, branch_id, patient_id),
  KEY idx_encounters_start_time (start_time),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) {engine()};"""
    ddls["prescriptions"] = generic_operational_table_ddl("prescriptions")
    ddls["prescription_items"] = generic_operational_table_ddl("prescription_items")
    ddls["pharmacy_sales"] = generic_operational_table_ddl("pharmacy_sales")
    ddls["lab_orders"] = generic_operational_table_ddl("lab_orders")
    ddls["radiology_orders"] = generic_operational_table_ddl("radiology_orders")
    ddls["billing_invoices"] = generic_operational_table_ddl("billing_invoices")
    ddls["payments"] = generic_operational_table_ddl("payments")
    return ddls


def fhir_resource_types_ddl() -> str:
    return f"""CREATE TABLE IF NOT EXISTS fhir_resource_types (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  resource_name VARCHAR(100) NOT NULL,
  resource_category VARCHAR(120) NOT NULL,
  fhir_version VARCHAR(20) NOT NULL DEFAULT 'R5',
  is_supported TINYINT NOT NULL DEFAULT 1,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fhir_resource_types_name_version (resource_name, fhir_version),
  KEY idx_fhir_resource_types_category (resource_category)
) {engine()};"""


def fhir_core_ddls() -> dict[str, str]:
    ddls = {"fhir_resource_types": fhir_resource_types_ddl()}
    ddls["fhir_resource_mapping"] = f"""CREATE TABLE IF NOT EXISTS fhir_resource_mapping (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  internal_table_name VARCHAR(120) NOT NULL,
  internal_record_id BIGINT NOT NULL,
  internal_business_key VARCHAR(160) NULL,
  fhir_resource_type VARCHAR(80) NOT NULL,
  fhir_resource_id VARCHAR(120) NOT NULL,
  fhir_version VARCHAR(20) NOT NULL DEFAULT 'R5',
  profile_url VARCHAR(255) NULL,
  sync_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  last_synced_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fhir_mapping_internal (tenant_id, hospital_id, internal_table_name, internal_record_id, fhir_resource_type),
  KEY idx_fhir_mapping_resource (fhir_resource_type, fhir_resource_id),
  KEY idx_fhir_mapping_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""
    ddls["fhir_resource_store"] = f"""CREATE TABLE IF NOT EXISTS fhir_resource_store (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  resource_type VARCHAR(80) NOT NULL,
  resource_id VARCHAR(120) NOT NULL,
  version_id VARCHAR(80) NOT NULL DEFAULT '1',
  profile_url VARCHAR(255) NULL,
  resource_json JSON NOT NULL,
  resource_hash VARCHAR(128) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CURRENT',
  last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fhir_store_resource_version (tenant_id, hospital_id, resource_type, resource_id, version_id),
  KEY idx_fhir_store_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_store_resource (resource_type, resource_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""
    ddls["fhir_resource_versions"] = f"""CREATE TABLE IF NOT EXISTS fhir_resource_versions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  resource_type VARCHAR(80) NOT NULL,
  resource_id VARCHAR(120) NOT NULL,
  version_id VARCHAR(80) NOT NULL,
  operation VARCHAR(30) NOT NULL,
  resource_json JSON NOT NULL,
  changed_by BIGINT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fhir_versions_resource (tenant_id, hospital_id, resource_type, resource_id, version_id),
  KEY idx_fhir_versions_changed_at (changed_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""
    ddls["fhir_resource_references"] = f"""CREATE TABLE IF NOT EXISTS fhir_resource_references (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  source_resource_type VARCHAR(80) NOT NULL,
  source_resource_id VARCHAR(120) NOT NULL,
  source_element_path VARCHAR(240) NOT NULL,
  target_resource_type VARCHAR(80) NOT NULL,
  target_resource_id VARCHAR(120) NOT NULL,
  reference_value VARCHAR(255) NOT NULL,
  display_text VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fhir_refs_source (source_resource_type, source_resource_id),
  KEY idx_fhir_refs_target (target_resource_type, target_resource_id),
  KEY idx_fhir_refs_reference_value (reference_value),
  KEY idx_fhir_refs_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""
    ddls["fhir_search_parameters"] = f"""CREATE TABLE IF NOT EXISTS fhir_search_parameters (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  resource_type VARCHAR(80) NOT NULL,
  parameter_name VARCHAR(120) NOT NULL,
  parameter_type VARCHAR(40) NOT NULL,
  expression VARCHAR(500) NULL,
  xpath VARCHAR(500) NULL,
  target_resource_type VARCHAR(120) NULL,
  comparator VARCHAR(120) NULL,
  modifier VARCHAR(120) NULL,
  chain_supported TINYINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fhir_search_param (resource_type, parameter_name),
  KEY idx_fhir_search_param_type (parameter_type)
) {engine()};"""
    ddls["fhir_search_index"] = f"""CREATE TABLE IF NOT EXISTS fhir_search_index (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  resource_type VARCHAR(80) NOT NULL,
  resource_id VARCHAR(120) NOT NULL,
  parameter_name VARCHAR(120) NOT NULL,
  parameter_type VARCHAR(40) NOT NULL,
  string_value VARCHAR(500) NULL,
  token_system VARCHAR(255) NULL,
  token_code VARCHAR(160) NULL,
  reference_value VARCHAR(255) NULL,
  date_value DATETIME NULL,
  number_value DECIMAL(18,6) NULL,
  quantity_value DECIMAL(18,6) NULL,
  uri_value VARCHAR(500) NULL,
  indexed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fhir_index_resource (resource_type, resource_id),
  KEY idx_fhir_index_token (token_system, token_code),
  KEY idx_fhir_index_reference (reference_value),
  KEY idx_fhir_index_branch_param (tenant_id, hospital_id, branch_id, parameter_name),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""
    ddls["fhir_resource_element_definitions"] = f"""CREATE TABLE IF NOT EXISTS fhir_resource_element_definitions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  resource_type VARCHAR(80) NOT NULL,
  element_path VARCHAR(240) NOT NULL,
  element_name VARCHAR(120) NOT NULL,
  short_description VARCHAR(500) NULL,
  data_type VARCHAR(120) NULL,
  min_cardinality VARCHAR(20) NOT NULL DEFAULT '0',
  max_cardinality VARCHAR(20) NOT NULL DEFAULT '1',
  is_modifier TINYINT NOT NULL DEFAULT 0,
  is_summary TINYINT NOT NULL DEFAULT 0,
  binding_strength VARCHAR(40) NULL,
  value_set_url VARCHAR(255) NULL,
  reference_target_types VARCHAR(500) NULL,
  comments TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fhir_element_path (resource_type, element_path),
  KEY idx_fhir_element_resource (resource_type),
  KEY idx_fhir_element_data_type (data_type)
) {engine()};"""
    generic_core_names = set(FHIR_CORE_TABLES) - set(ddls)
    for table_name in sorted(generic_core_names):
        ddls[table_name] = f"""CREATE TABLE IF NOT EXISTS {table_name} (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NULL,
  hospital_id BIGINT NULL,
  branch_id BIGINT NULL,
  resource_type VARCHAR(80) NULL,
  resource_id VARCHAR(120) NULL,
  canonical_url VARCHAR(500) NULL,
  version VARCHAR(80) NULL,
  name VARCHAR(180) NULL,
  title VARCHAR(240) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  system_url VARCHAR(255) NULL,
  code VARCHAR(160) NULL,
  display_text VARCHAR(255) NULL,
  payload_json JSON NULL,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_{table_name}_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_{table_name}_resource (resource_type, resource_id),
  KEY idx_{table_name}_canonical (canonical_url),
  KEY idx_{table_name}_system_code (system_url, code)
) {engine()};"""
    return ddls


def hl7_table_ddls() -> dict[str, str]:
    ddls = {}
    ddls["hl7_message_log"] = f"""CREATE TABLE IF NOT EXISTS hl7_message_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  direction VARCHAR(20) NOT NULL,
  message_type VARCHAR(20) NOT NULL,
  trigger_event VARCHAR(20) NULL,
  external_system VARCHAR(120) NOT NULL,
  message_control_id VARCHAR(120) NOT NULL,
  raw_message LONGTEXT NOT NULL,
  parsed_payload_json JSON NULL,
  processing_status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_hl7_message_control (external_system, message_control_id),
  KEY idx_hl7_message_branch (tenant_id, hospital_id, branch_id),
  KEY idx_hl7_message_type_status (message_type, processing_status),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) {engine()};"""
    ddls["hl7_message_error_log"] = f"""CREATE TABLE IF NOT EXISTS hl7_message_error_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hl7_message_id BIGINT NOT NULL,
  error_code VARCHAR(80) NULL,
  error_message TEXT NOT NULL,
  segment_name VARCHAR(20) NULL,
  field_position VARCHAR(40) NULL,
  error_payload_json JSON NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_hl7_error_message (hl7_message_id),
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE RESTRICT
) {engine()};"""
    for table_name in set(HL7_TABLES) - {"hl7_message_log", "hl7_message_error_log"}:
        ddls[table_name] = f"""CREATE TABLE IF NOT EXISTS {table_name} (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  hospital_id BIGINT NOT NULL,
  branch_id BIGINT NULL,
  hl7_message_id BIGINT NULL,
  external_system VARCHAR(120) NOT NULL,
  external_identifier VARCHAR(160) NOT NULL,
  internal_table_name VARCHAR(120) NULL,
  internal_record_id BIGINT NULL,
  segment_name VARCHAR(20) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_{table_name}_external (external_system, external_identifier),
  KEY idx_{table_name}_internal (internal_table_name, internal_record_id),
  KEY idx_{table_name}_message (hl7_message_id),
  KEY idx_{table_name}_tenant_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE SET NULL
) {engine()};"""
    return ddls


def insert_master_table(table_name: str) -> str:
    rows = [
        (1, f"{table_name.upper()}_001", f"Primary {title_from_table(table_name)}", "Primary master value", "LOCAL", "001", "ACTIVE", {"example": 1, "table": table_name}),
        (2, f"{table_name.upper()}_002", f"Secondary {title_from_table(table_name)}", "Secondary master value", "LOCAL", "002", "ACTIVE", {"example": 2, "table": table_name}),
    ]
    values = ",\n".join(
        f"({id_}, {esc(code)}, {esc(name)}, {esc(desc)}, {esc(system)}, {esc(std_code)}, {esc(status)}, {json_expr(data)})"
        for id_, code, name, desc, system, std_code, status, data in rows
    )
    return f"""INSERT INTO {table_name} (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
{values}
ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = CURRENT_TIMESTAMP;"""


def insert_generic_operational(table_name: str) -> str:
    rows = [
        (1, 1, 1, 1, 1, 1, 1, 1, f"{table_name.upper()}-001", f"Sample {title_from_table(table_name)} 1", "ACTIVE", "NORMAL", "ORD-001", "INV-001", 125000, "2026-06-01", "09:30:00", "2026-06-01 09:30:00", {"sample": 1, "table": table_name}),
        (2, 2, 2, 2, 2, 2, 2, 2, f"{table_name.upper()}-002", f"Sample {title_from_table(table_name)} 2", "ACTIVE", "HIGH", "ORD-002", "INV-002", 245000, "2026-06-02", "10:45:00", "2026-06-02 10:45:00", {"sample": 2, "table": table_name}),
    ]
    values = ",\n".join(
        f"({id_}, {tenant}, {hospital}, {branch}, {patient}, {encounter}, {user}, 1, {esc(code)}, {esc(name)}, "
        f"{esc(f'Dummy {title_from_table(table_name)} record')}, {esc(code)}, {esc(status)}, {esc(priority)}, "
        f"{esc(order_no)}, {esc(invoice_no)}, {amount}, {esc(event_date)}, {esc(event_time)}, {esc(event_at)}, "
        f"{esc(event_at)}, {esc(event_at)}, {esc('Seed data for integration testing')}, {json_expr(data)}, {user}, {user})"
        for id_, tenant, hospital, branch, patient, encounter, user, _dept, code, name, status, priority, order_no, invoice_no, amount, event_date, event_time, event_at, data in rows
    )
    return f"""INSERT INTO {table_name} (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
{values}
ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = CURRENT_TIMESTAMP;"""


def insert_fhir_datatype(table_name: str) -> str:
    rows = [
        (1, 1, 1, 1, "Patient", "patient-1", f"Patient.{table_name.replace('fhir_', '')}", "http://terminology.hl7.org", "example-1", "FHIR datatype sample 1", {"table": table_name, "sample": 1}),
        (2, 2, 2, 2, "Encounter", "encounter-2", f"Encounter.{table_name.replace('fhir_', '')}", "http://terminology.hl7.org", "example-2", "FHIR datatype sample 2", {"table": table_name, "sample": 2}),
    ]
    values = ",\n".join(
        f"({id_}, {tenant}, {hospital}, {branch}, {esc(resource_type)}, {esc(resource_id)}, {esc(path)}, {esc(system)}, "
        f"{esc(code)}, {esc(display)}, {esc(display)}, {id_ * 10}.500000, '2026-06-0{id_} 09:00:00', {esc('mg')}, "
        f"'2026-06-0{id_} 09:00:00', '2026-06-0{id_} 10:00:00', {json_expr(payload)}, 'ACTIVE', {id_}, {id_})"
        for id_, tenant, hospital, branch, resource_type, resource_id, path, system, code, display, payload in rows
    )
    return f"""INSERT INTO {table_name} (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
{values}
ON DUPLICATE KEY UPDATE display_text = VALUES(display_text), updated_at = CURRENT_TIMESTAMP;"""


def insert_reporting(table_name: str) -> str:
    rows = [
        (1, 1, 1, 1, "2026-06-01", "MAIN", "Main Campus", 42, 1250000, {"trend": "stable", "sample": 1}),
        (2, 2, 2, 2, "2026-06-02", "SOUTH", "South Branch", 57, 2450000, {"trend": "up", "sample": 2}),
    ]
    values = ",\n".join(
        f"({id_}, {tenant}, {hospital}, {branch}, {esc(report_date)}, {esc(key)}, {esc(name)}, {count}, {amount}, 'ACTIVE', {json_expr(data)})"
        for id_, tenant, hospital, branch, report_date, key, name, count, amount, data in rows
    )
    return f"""INSERT INTO {table_name} (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
{values}
ON DUPLICATE KEY UPDATE metric_count = VALUES(metric_count), updated_at = CURRENT_TIMESTAMP;"""


def core_inserts() -> dict[str, str]:
    inserts = {}
    inserts["tenants"] = f"""INSERT INTO tenants (id, tenant_code, tenant_name, legal_name, subscription_plan, status, contact_email, contact_phone, data_json)
VALUES
(1, 'PLASMIT', 'Plasmit Healthcare Group', 'Plasmit Healthcare Group Pvt Ltd', 'ENTERPRISE', 'ACTIVE', 'admin@plasmit.example', '+91-9000000001', {json_expr({'fhir': 'Organization', 'sample': 1})}),
(2, 'CITYCARE', 'CityCare Hospital Network', 'CityCare Hospital Network Ltd', 'GROWTH', 'ACTIVE', 'admin@citycare.example', '+91-9000000002', {json_expr({'fhir': 'Organization', 'sample': 2})})
ON DUPLICATE KEY UPDATE tenant_name = VALUES(tenant_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["hospitals"] = f"""INSERT INTO hospitals (id, tenant_id, hospital_code, hospital_name, legal_name, status, contact_email, contact_phone, address_json)
VALUES
(1, 1, 'PLH', 'Plasmit Hospital', 'Plasmit Hospital Main Entity', 'ACTIVE', 'hospital@plasmit.example', '+91-9111111111', {json_expr({'city': 'Gurugram', 'country': 'IN'})}),
(2, 2, 'CCH', 'CityCare Hospital', 'CityCare Hospital Main Entity', 'ACTIVE', 'hospital@citycare.example', '+91-9222222222', {json_expr({'city': 'Delhi', 'country': 'IN'})})
ON DUPLICATE KEY UPDATE hospital_name = VALUES(hospital_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["branches"] = f"""INSERT INTO branches (id, tenant_id, hospital_id, branch_code, branch_name, branch_type, status, contact_email, contact_phone, address_json)
VALUES
(1, 1, 1, 'MAIN', 'Main Campus', 'MULTI_SPECIALTY', 'ACTIVE', 'main@plasmit.example', '+91-9333333333', {json_expr({'city': 'Gurugram', 'line': 'Sector 44'})}),
(2, 2, 2, 'SOUTH', 'South Branch', 'MULTI_SPECIALTY', 'ACTIVE', 'south@citycare.example', '+91-9444444444', {json_expr({'city': 'Delhi', 'line': 'Saket'})})
ON DUPLICATE KEY UPDATE branch_name = VALUES(branch_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["departments"] = f"""INSERT INTO departments (id, tenant_id, hospital_id, branch_id, department_code, department_name, department_type, status, created_by, updated_by)
VALUES
(1, 1, 1, 1, 'CARD', 'Cardiology', 'CLINICAL', 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'PATH', 'Pathology', 'DIAGNOSTIC', 'ACTIVE', 2, 2)
ON DUPLICATE KEY UPDATE department_name = VALUES(department_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["healthcare_services"] = f"""INSERT INTO healthcare_services (id, tenant_id, hospital_id, branch_id, department_id, service_code, service_name, service_category, status, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 'OPD-CONSULT', 'OPD Consultation', 'CONSULTATION', 'ACTIVE', 1, 1),
(2, 2, 2, 2, 2, 'CBC-LAB', 'Complete Blood Count', 'LAB', 'ACTIVE', 2, 2)
ON DUPLICATE KEY UPDATE service_name = VALUES(service_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["roles"] = f"""INSERT INTO roles (id, tenant_id, hospital_id, role_code, role_name, role_scope, status, created_by, updated_by)
VALUES
(1, 1, 1, 'DOCTOR', 'Doctor', 'HOSPITAL', 'ACTIVE', 1, 1),
(2, 2, 2, 'NURSE', 'Nurse', 'HOSPITAL', 'ACTIVE', 2, 2),
(3, 1, 1, 'LAB_TECH', 'Lab Technician', 'HOSPITAL', 'ACTIVE', 1, 1),
(4, 1, 1, 'PHARMACIST', 'Pharmacist', 'HOSPITAL', 'ACTIVE', 1, 1),
(5, 1, 1, 'BILLING_USER', 'Billing User', 'HOSPITAL', 'ACTIVE', 1, 1)
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["permissions"] = f"""INSERT INTO permissions (id, permission_code, permission_name, module_name, status)
VALUES
(1, 'PATIENT_READ', 'Read patient data', 'Patient', 'ACTIVE'),
(2, 'ENCOUNTER_WRITE', 'Create and update encounters', 'Encounter', 'ACTIVE')
ON DUPLICATE KEY UPDATE permission_name = VALUES(permission_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["role_permissions"] = """INSERT INTO role_permissions (id, role_id, permission_id, status, created_by)
VALUES
(1, 1, 1, 'ACTIVE', 1),
(2, 1, 2, 'ACTIVE', 1)
ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP;"""
    user_rows = [
        (1, 1, 1, 1, 1, 1, "DOC-001", "Dr. Aisha Mehta", "DOCTOR", "aisha.mehta@plasmit.example", "+91-955550001"),
        (2, 2, 2, 2, 1, 2, "DOC-002", "Dr. Rahul Sen", "DOCTOR", "rahul.sen@citycare.example", "+91-955550002"),
        (3, 1, 1, 1, 2, 1, "NUR-001", "Nurse Kavita Rao", "NURSE", "kavita.rao@plasmit.example", "+91-955550003"),
        (4, 2, 2, 2, 2, 2, "NUR-002", "Nurse Neha Singh", "NURSE", "neha.singh@citycare.example", "+91-955550004"),
        (5, 1, 1, 1, 3, 2, "LAB-001", "Imran Lab Tech", "LAB_TECHNICIAN", "imran.lab@plasmit.example", "+91-955550005"),
        (6, 2, 2, 2, 3, 2, "LAB-002", "Priya Lab Tech", "LAB_TECHNICIAN", "priya.lab@citycare.example", "+91-955550006"),
        (7, 1, 1, 1, 4, 1, "PHA-001", "Arjun Pharmacist", "PHARMACIST", "arjun.pharmacy@plasmit.example", "+91-955550007"),
        (8, 2, 2, 2, 4, 1, "PHA-002", "Ritu Pharmacist", "PHARMACIST", "ritu.pharmacy@citycare.example", "+91-955550008"),
        (9, 1, 1, 1, 5, 1, "BIL-001", "Sana Billing", "BILLING_USER", "sana.billing@plasmit.example", "+91-955550009"),
        (10, 2, 2, 2, 5, 2, "BIL-002", "Mohan Billing", "BILLING_USER", "mohan.billing@citycare.example", "+91-955550010"),
    ]
    values = ",\n".join(
        f"({id_}, {tenant}, {hospital}, {branch}, {role}, {dept}, {esc(code)}, {esc(name)}, {esc(user_type)}, {esc(email)}, {esc(phone)}, 'ACTIVE', 1, 1)"
        for id_, tenant, hospital, branch, role, dept, code, name, user_type, email, phone in user_rows
    )
    inserts["users"] = f"""INSERT INTO users (
  id, tenant_id, hospital_id, primary_branch_id, role_id, department_id, employee_code, full_name,
  user_type, email, phone, status, created_by, updated_by
)
VALUES
{values}
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["user_branch_access"] = """INSERT INTO user_branch_access (id, tenant_id, hospital_id, user_id, branch_id, access_level, status, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 'FULL', 'ACTIVE', 1, 1),
(2, 2, 2, 2, 2, 'FULL', 'ACTIVE', 2, 2)
ON DUPLICATE KEY UPDATE access_level = VALUES(access_level), updated_at = CURRENT_TIMESTAMP;"""
    inserts["patients"] = f"""INSERT INTO patients (id, tenant_id, hospital_id, mrn, first_name, last_name, gender_code, date_of_birth, phone, email, status, data_json, created_by, updated_by)
VALUES
(1, 1, 1, 'PLH-000001', 'Aman', 'Kumar', 'male', '1994-08-15', '+91-966660001', 'aman.patient@example.com', 'ACTIVE', {json_expr({'fhir': 'Patient', 'sample': 1})}, 1, 1),
(2, 2, 2, 'CCH-000001', 'Sara', 'Khan', 'female', '1988-03-20', '+91-966660002', 'sara.patient@example.com', 'ACTIVE', {json_expr({'fhir': 'Patient', 'sample': 2})}, 2, 2)
ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), updated_at = CURRENT_TIMESTAMP;"""
    inserts["appointments"] = f"""INSERT INTO appointments (id, tenant_id, hospital_id, branch_id, patient_id, doctor_id, appointment_no, appointment_date, appointment_time, appointment_type, status, reason, data_json, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 1, 'APT-PLH-001', '2026-06-03', '10:00:00', 'OPD', 'BOOKED', 'Cardiology consultation', {json_expr({'fhir': 'Appointment', 'sample': 1})}, 1, 1),
(2, 2, 2, 2, 2, 2, 'APT-CCH-001', '2026-06-03', '11:30:00', 'OPD', 'BOOKED', 'Diagnostic review', {json_expr({'fhir': 'Appointment', 'sample': 2})}, 2, 2)
ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP;"""
    inserts["encounters"] = f"""INSERT INTO encounters (id, tenant_id, hospital_id, branch_id, patient_id, appointment_id, encounter_no, encounter_type, start_time, end_time, status, reason, data_json, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 1, 'ENC-PLH-001', 'OPD', '2026-06-03 10:05:00', NULL, 'IN_PROGRESS', 'Cardiology consultation', {json_expr({'fhir': 'Encounter', 'sample': 1})}, 1, 1),
(2, 2, 2, 2, 2, 2, 'ENC-CCH-001', 'OPD', '2026-06-03 11:35:00', NULL, 'IN_PROGRESS', 'Diagnostic review', {json_expr({'fhir': 'Encounter', 'sample': 2})}, 2, 2)
ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP;"""
    return inserts


def insert_fhir_resource_types() -> str:
    values = ",\n".join(
        f"({i}, {esc(name)}, {esc(category)}, 'R5', 1, 'ACTIVE', {esc('FHIR R5 resource metadata for interoperability mapping')})"
        for i, (name, category) in enumerate(FHIR_RESOURCE_TYPES, start=1)
    )
    return f"""INSERT INTO fhir_resource_types (id, resource_name, resource_category, fhir_version, is_supported, status, description)
VALUES
{values}
ON DUPLICATE KEY UPDATE resource_category = VALUES(resource_category), updated_at = CURRENT_TIMESTAMP;"""


def insert_fhir_core_generic(table_name: str) -> str:
    rows = [
        (1, 1, 1, 1, "Patient", "patient-1", "http://plasmit.example/fhir/Profile/Patient", "1.0.0", "Plasmit Patient Profile", "ACTIVE", "http://terminology.hl7.org", "active", "Active"),
        (2, 2, 2, 2, "Encounter", "encounter-2", "http://plasmit.example/fhir/Profile/Encounter", "1.0.0", "Plasmit Encounter Profile", "ACTIVE", "http://terminology.hl7.org", "in-progress", "In Progress"),
    ]
    values = ",\n".join(
        f"({id_}, {tenant}, {hospital}, {branch}, {esc(resource_type)}, {esc(resource_id)}, {esc(canonical)}, {esc(version)}, "
        f"{esc(name)}, {esc(name)}, {esc(status)}, {esc(system)}, {esc(code)}, {esc(display)}, {json_expr({'table': table_name, 'sample': id_})}, {id_}, {id_})"
        for id_, tenant, hospital, branch, resource_type, resource_id, canonical, version, name, status, system, code, display in rows
    )
    return f"""INSERT INTO {table_name} (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
{values}
ON DUPLICATE KEY UPDATE title = VALUES(title), updated_at = CURRENT_TIMESTAMP;"""


def insert_fhir_resource_mapping() -> str:
    return f"""INSERT INTO fhir_resource_mapping (
  id, tenant_id, hospital_id, branch_id, internal_table_name, internal_record_id, internal_business_key,
  fhir_resource_type, fhir_resource_id, fhir_version, profile_url, sync_status, last_synced_at
)
VALUES
(1, 1, 1, 1, 'patients', 1, 'PLH-000001', 'Patient', 'patient-1', 'R5', 'http://plasmit.example/fhir/Profile/Patient', 'SYNCED', '2026-06-03 12:00:00'),
(2, 2, 2, 2, 'encounters', 2, 'ENC-CCH-001', 'Encounter', 'encounter-2', 'R5', 'http://plasmit.example/fhir/Profile/Encounter', 'PENDING', NULL)
ON DUPLICATE KEY UPDATE sync_status = VALUES(sync_status), updated_at = CURRENT_TIMESTAMP;"""


def insert_fhir_resource_store() -> str:
    return f"""INSERT INTO fhir_resource_store (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, version_id, profile_url,
  resource_json, resource_hash, status, last_updated
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', '1', 'http://plasmit.example/fhir/Profile/Patient', {json_expr({'resourceType': 'Patient', 'id': 'patient-1', 'active': True})}, 'hash-patient-1', 'CURRENT', '2026-06-03 12:00:00'),
(2, 2, 2, 2, 'Encounter', 'encounter-2', '1', 'http://plasmit.example/fhir/Profile/Encounter', {json_expr({'resourceType': 'Encounter', 'id': 'encounter-2', 'status': 'in-progress'})}, 'hash-encounter-2', 'CURRENT', '2026-06-03 12:05:00')
ON DUPLICATE KEY UPDATE resource_hash = VALUES(resource_hash), updated_at = CURRENT_TIMESTAMP;"""


def insert_fhir_resource_versions() -> str:
    return f"""INSERT INTO fhir_resource_versions (id, tenant_id, hospital_id, branch_id, resource_type, resource_id, version_id, operation, resource_json, changed_by)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', '1', 'CREATE', {json_expr({'resourceType': 'Patient', 'id': 'patient-1'})}, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', '1', 'CREATE', {json_expr({'resourceType': 'Encounter', 'id': 'encounter-2'})}, 2)
ON DUPLICATE KEY UPDATE operation = VALUES(operation);"""


def insert_fhir_resource_references() -> str:
    return """INSERT INTO fhir_resource_references (
  id, tenant_id, hospital_id, branch_id, source_resource_type, source_resource_id, source_element_path,
  target_resource_type, target_resource_id, reference_value, display_text
)
VALUES
(1, 1, 1, 1, 'Encounter', 'encounter-1', 'Encounter.subject', 'Patient', 'patient-1', 'Patient/patient-1', 'Aman Kumar'),
(2, 2, 2, 2, 'DiagnosticReport', 'report-2', 'DiagnosticReport.subject', 'Patient', 'patient-2', 'Patient/patient-2', 'Sara Khan')
ON DUPLICATE KEY UPDATE display_text = VALUES(display_text);"""


def insert_fhir_search_parameters() -> str:
    rows = [
        (1, "Patient", "identifier", "token", "Patient.identifier", None, None, None, "missing", 0, "ACTIVE"),
        (2, "Patient", "name", "string", "Patient.name", None, None, None, "contains", 0, "ACTIVE"),
        (3, "Encounter", "patient", "reference", "Encounter.subject.where(resolve() is Patient)", None, "Patient", None, "chain", 1, "ACTIVE"),
        (4, "Observation", "code", "token", "Observation.code", None, None, None, "text", 0, "ACTIVE"),
        (5, "DiagnosticReport", "subject", "reference", "DiagnosticReport.subject", None, "Patient", None, "chain", 1, "ACTIVE"),
        (6, "MedicationRequest", "encounter", "reference", "MedicationRequest.encounter", None, "Encounter", None, "chain", 1, "ACTIVE"),
    ]
    values = ",\n".join(
        f"({id_}, {esc(resource)}, {esc(param)}, {esc(param_type)}, {esc(expr)}, {esc(xpath)}, {esc(target)}, {esc(comp)}, {esc(mod)}, {chain}, {esc(status)})"
        for id_, resource, param, param_type, expr, xpath, target, comp, mod, chain, status in rows
    )
    return f"""INSERT INTO fhir_search_parameters (
  id, resource_type, parameter_name, parameter_type, expression, xpath, target_resource_type,
  comparator, modifier, chain_supported, status
)
VALUES
{values}
ON DUPLICATE KEY UPDATE expression = VALUES(expression), updated_at = CURRENT_TIMESTAMP;"""


def insert_fhir_search_index() -> str:
    return """INSERT INTO fhir_search_index (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, parameter_name, parameter_type,
  string_value, token_system, token_code, reference_value, date_value, number_value, quantity_value, uri_value
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'identifier', 'token', 'PLH-000001', 'http://plasmit.example/mrn', 'PLH-000001', NULL, NULL, NULL, NULL, NULL),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'patient', 'reference', NULL, NULL, NULL, 'Patient/patient-2', '2026-06-03 11:35:00', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE string_value = VALUES(string_value);"""


def insert_fhir_elements() -> str:
    values = []
    row_id = 1
    for resource in FHIR_ELEMENT_RESOURCES:
        for suffix, name, short, data_type, min_card, max_card, is_modifier, is_summary, binding, value_set, targets in COMMON_FHIR_ELEMENTS:
            values.append(
                f"({row_id}, {esc(resource)}, {esc(f'{resource}.{suffix}')}, {esc(name)}, {esc(short)}, "
                f"{esc(data_type)}, {esc(min_card)}, {esc(max_card)}, {is_modifier}, {is_summary}, "
                f"{esc(binding)}, {esc(value_set)}, {esc(targets)}, {esc('Generated from official FHIR R5 common resource pattern for HMS interoperability mapping')})"
            )
            row_id += 1
    chunks = []
    for start in range(0, len(values), 250):
        chunk_values = ",\n".join(values[start : start + 250])
        chunks.append(
            f"""INSERT INTO fhir_resource_element_definitions (
  id, resource_type, element_path, element_name, short_description, data_type, min_cardinality,
  max_cardinality, is_modifier, is_summary, binding_strength, value_set_url, reference_target_types, comments
)
VALUES
{chunk_values}
ON DUPLICATE KEY UPDATE short_description = VALUES(short_description), updated_at = CURRENT_TIMESTAMP;"""
        )
    return "\n\n".join(chunks)


def insert_hl7_message_log() -> str:
    raw1 = "MSH|^~\\&|EXT_HIS|EXT|PLASMIT|PLH|202606031200||ADT^A01|MSG001|P|2.5\rPID|1||PLH-000001||KUMAR^AMAN"
    raw2 = "MSH|^~\\&|EXT_LIS|EXT|CITYCARE|CCH|202606031205||ORU^R01|MSG002|P|2.5\rPID|1||CCH-000001||KHAN^SARA"
    return f"""INSERT INTO hl7_message_log (
  id, tenant_id, hospital_id, branch_id, direction, message_type, trigger_event, external_system,
  message_control_id, raw_message, parsed_payload_json, processing_status, received_at, processed_at
)
VALUES
(1, 1, 1, 1, 'INBOUND', 'ADT', 'A01', 'EXT_HIS', 'MSG001', {esc(raw1)}, {json_expr({'messageType': 'ADT', 'trigger': 'A01', 'patient': 'PLH-000001'})}, 'PROCESSED', '2026-06-03 12:00:00', '2026-06-03 12:00:05'),
(2, 2, 2, 2, 'INBOUND', 'ORU', 'R01', 'EXT_LIS', 'MSG002', {esc(raw2)}, {json_expr({'messageType': 'ORU', 'trigger': 'R01', 'patient': 'CCH-000001'})}, 'RECEIVED', '2026-06-03 12:05:00', NULL)
ON DUPLICATE KEY UPDATE processing_status = VALUES(processing_status), updated_at = CURRENT_TIMESTAMP;"""


def insert_hl7_error_log() -> str:
    return f"""INSERT INTO hl7_message_error_log (id, hl7_message_id, error_code, error_message, segment_name, field_position, error_payload_json, status)
VALUES
(1, 1, 'WARN001', 'Optional PV1 segment missing in sample message', 'PV1', '1', {json_expr({'severity': 'warning'})}, 'CLOSED'),
(2, 2, 'INFO001', 'Message queued for lab result mapping', 'OBX', '5', {json_expr({'severity': 'info'})}, 'OPEN')
ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP;"""


def insert_hl7_generic(table_name: str) -> str:
    rows = [
        (1, 1, 1, 1, 1, "EXT_HIS", "EXT-001", "patients", 1, "PID", "ACTIVE", {"table": table_name, "sample": 1}),
        (2, 2, 2, 2, 2, "EXT_LIS", "EXT-002", "lab_results", 2, "OBX", "ACTIVE", {"table": table_name, "sample": 2}),
    ]
    values = ",\n".join(
        f"({id_}, {tenant}, {hospital}, {branch}, {message}, {esc(system)}, {esc(external_id)}, {esc(internal_table)}, "
        f"{internal_id}, {esc(segment)}, {esc(status)}, {json_expr(payload)})"
        for id_, tenant, hospital, branch, message, system, external_id, internal_table, internal_id, segment, status, payload in rows
    )
    return f"""INSERT INTO {table_name} (
  id, tenant_id, hospital_id, branch_id, hl7_message_id, external_system, external_identifier,
  internal_table_name, internal_record_id, segment_name, status, payload_json
)
VALUES
{values}
ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP;"""


def header_comment(table_count: int, insert_count: int) -> str:
    sources = "\n".join(f"   - {url}" for url in FHIR_SOURCES)
    return f"""/*
Plasmit Global Hospital Management System
FHIR R5 aware, HL7 ready, multi-tenant MySQL database schema

Database placeholder:
  CREATE DATABASE IF NOT EXISTS {DB_NAME};
  USE {DB_NAME};

Official FHIR R5 references reviewed for this script:
{sources}

Design principle:
  Layer 1 is normalized HMS operational data and remains the source of truth.
  Layer 2 is the FHIR interoperability layer for generated JSON, mappings,
  resource metadata, element definitions, search parameters, datatype fragments,
  validation results, sync status, and API audit.

Script coverage summary:
  Modules covered: {len(MODULES)}
  Tables created: {table_count}
  Seed rows generated: {insert_count}

UML-style module relationship:
  Tenant -> Hospital -> Branch -> Department -> User
  Hospital -> Patient -> Appointment -> Encounter
  Encounter -> Clinical / Lab / Radiology / Prescription / Billing / Documents
  Prescription -> Pharmacy Dispense / Sales / Stock Movement
  HMS records -> FHIR Resource Mapping -> FHIR Resource Store -> FHIR API
  External HIS/LIS/RIS -> HL7 Message Log -> Parser Mapping -> HMS Tables

Master HMS ER diagram:
```mermaid
erDiagram
  tenants ||--o{{ hospitals : owns
  hospitals ||--o{{ branches : has
  hospitals ||--o{{ patients : registers
  branches ||--o{{ appointments : schedules
  patients ||--o{{ appointments : books
  appointments ||--o| encounters : creates
  patients ||--o{{ encounters : attends
  branches ||--o{{ encounters : hosts
  encounters ||--o{{ vitals : records
  encounters ||--o{{ diagnoses : has
  encounters ||--o{{ clinical_notes : documents
  encounters ||--o{{ lab_orders : orders
  lab_orders ||--o{{ lab_order_items : contains
  lab_order_items ||--o{{ lab_results : produces
  encounters ||--o{{ prescriptions : orders
  prescriptions ||--o{{ prescription_items : contains
  encounters ||--o{{ billing_invoices : bills
  billing_invoices ||--o{{ payments : receives
  patients ||--o{{ documents : owns
```

FHIR interoperability ER diagram:
```mermaid
erDiagram
  fhir_resource_types ||--o{{ fhir_resource_store : classifies
  fhir_resource_store ||--o{{ fhir_resource_versions : versions
  fhir_resource_store ||--o{{ fhir_resource_references : links
  fhir_resource_mapping }}o--|| fhir_resource_store : maps
  fhir_search_parameters ||--o{{ fhir_search_index : drives
  fhir_profiles ||--o{{ fhir_structure_definitions : constrains
  fhir_code_systems ||--o{{ fhir_value_sets : supplies
  fhir_code_systems ||--o{{ fhir_concept_maps : maps
```

HL7 integration ER diagram:
```mermaid
erDiagram
  hl7_message_log ||--o{{ hl7_message_error_log : records
  hl7_message_log ||--o{{ hl7_segment_store : stores
  hl7_message_log ||--o{{ hl7_acknowledgement_log : acknowledges
  hl7_message_log ||--o{{ hl7_patient_mapping : maps_patient
  hl7_message_log ||--o{{ hl7_order_mapping : maps_order
  hl7_message_log ||--o{{ hl7_result_mapping : maps_result
```

Relationship matrix:
  Parent table          Child table             Relationship      Notes
  tenants               hospitals               1:N               Tenant owns hospitals
  hospitals             branches                1:N               Hospital has branches/facilities
  hospitals             patients                1:N               Patient is hospital-level
  branches              appointments            1:N               Appointment is branch-level
  appointments          encounters              0/1:1             Appointment may become encounter
  encounters            clinical/lab/rx/billing 1:N               Encounter is clinical anchor
  prescriptions         prescription_items      1:N               Medication orders
  lab_orders            lab_order_items         1:N               Ordered tests
  lab_order_items        lab_results            1:N               Result observations
  fhir_resource_store   fhir_search_index       1:N               Searchable extracted params
  hl7_message_log       hl7_*_mapping           1:N               Legacy message traceability

Important operational assumptions:
  - Run this script on a clean database or a database where these tables do not
    already exist with conflicting columns.
  - Hard foreign keys are used for tenant, hospital, branch and selected
    foundation relationships. Cross-microservice clinical relationships are
    indexed logical references where strict FK coupling may block independent
    deployments.
  - No cascade delete is used for clinical, billing, document, FHIR, HL7, audit,
    or patient data.
  - Money is stored in minor units as BIGINT.
*/
"""


def database_preamble() -> str:
    return f"""CREATE DATABASE IF NOT EXISTS {DB_NAME}
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE {DB_NAME};

SET NAMES utf8mb4;
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ZERO_DATE,NO_ZERO_IN_DATE,NO_ENGINE_SUBSTITUTION';
"""


def validation_queries() -> str:
    return """
-- ============================================================================================
-- FINAL VALIDATION QUERIES
-- ============================================================================================

SELECT 'tenants' AS entity_name, COUNT(*) AS total_count FROM tenants;
SELECT 'hospitals' AS entity_name, COUNT(*) AS total_count FROM hospitals;
SELECT 'branches' AS entity_name, COUNT(*) AS total_count FROM branches;
SELECT 'patients' AS entity_name, COUNT(*) AS total_count FROM patients;
SELECT 'encounters' AS entity_name, COUNT(*) AS total_count FROM encounters;
SELECT 'fhir_resources' AS entity_name, COUNT(*) AS total_count FROM fhir_resource_store;
SELECT 'hl7_messages' AS entity_name, COUNT(*) AS total_count FROM hl7_message_log;

SELECT 'total_tables_in_current_database' AS metric_name, COUNT(*) AS total_count
FROM information_schema.tables
WHERE table_schema = DATABASE();

SELECT
  p.mrn,
  CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')) AS patient_name,
  e.encounter_no,
  lo.order_no AS lab_order_no,
  bi.invoice_no AS invoice_no,
  bi.amount_minor AS invoice_amount_minor
FROM patients p
JOIN encounters e
  ON e.tenant_id = p.tenant_id
 AND e.hospital_id = p.hospital_id
 AND e.patient_id = p.id
LEFT JOIN lab_orders lo
  ON lo.tenant_id = e.tenant_id
 AND lo.hospital_id = e.hospital_id
 AND lo.branch_id = e.branch_id
 AND lo.encounter_id = e.id
LEFT JOIN billing_invoices bi
  ON bi.tenant_id = e.tenant_id
 AND bi.hospital_id = e.hospital_id
 AND bi.branch_id = e.branch_id
 AND bi.encounter_id = e.id
WHERE p.tenant_id = 1
  AND p.hospital_id = 1
  AND e.branch_id = 1
  AND p.is_deleted = 0;

SELECT
  appointment_no,
  patient_id,
  branch_id,
  status
FROM appointments
WHERE tenant_id = 1
  AND hospital_id = 1
  AND branch_id IN (1)
  AND is_deleted = 0;
"""


def build_schema() -> tuple[str, dict[str, int]]:
    ddls: dict[str, str] = {}
    custom = custom_ddls()

    for table in MASTER_TABLES:
        ddls[table] = master_table_ddl(table)

    foundation_order = [
        "tenants",
        "hospitals",
        "branches",
        "departments",
        "healthcare_services",
        "roles",
        "permissions",
        "role_permissions",
        "users",
        "user_branch_access",
        "user_department_access",
        "audit_user_sessions",
    ]
    for table in foundation_order:
        ddls[table] = custom.get(table, generic_operational_table_ddl(table))

    ddls["patients"] = custom["patients"]
    ddls["appointments"] = custom["appointments"]
    ddls["encounters"] = custom["encounters"]

    for module_tables in OPERATIONAL_GENERIC_TABLES_BY_MODULE.values():
        for table in module_tables:
            if table not in ddls:
                ddls[table] = custom.get(table, generic_operational_table_ddl(table))

    for table in ["prescriptions", "prescription_items", "pharmacy_sales", "lab_orders", "radiology_orders", "billing_invoices", "payments"]:
        ddls[table] = custom.get(table, generic_operational_table_ddl(table))

    fhir_ddls = fhir_core_ddls()
    ddls["fhir_resource_types"] = fhir_ddls["fhir_resource_types"]
    for table in FHIR_CORE_TABLES:
        if table not in ddls:
            ddls[table] = fhir_ddls[table]
    for table in FHIR_DATATYPE_TABLES:
        ddls[table] = fhir_datatype_table_ddl(table)
    for table, ddl in hl7_table_ddls().items():
        ddls[table] = ddl
    for table in REPORTING_TABLES:
        ddls[table] = reporting_table_ddl(table)

    table_order: list[str] = []
    table_order.extend(MASTER_TABLES)
    table_order.extend(foundation_order)
    table_order.extend(["patients"])
    table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE["Patient Registration / MPI"])
    table_order.extend(["appointments"])
    table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE["Appointment / Scheduling"])
    table_order.extend(["encounters"])
    for module_name in [
        "Encounter / OPD / Visit / Emergency Visit",
        "Clinical EMR / Doctor Workbench",
        "ICU / Critical Care",
        "Prescription / Medication Orders",
    ]:
        table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE[module_name])
    table_order.extend(["prescriptions", "prescription_items"])
    for module_name in [
        "Pharmacy / Inventory / Dispensing",
    ]:
        table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE[module_name])
    table_order.extend(["pharmacy_sales"])
    table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE["Lab / Diagnostics"])
    table_order.extend(["lab_orders"])
    table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE["Radiology / Imaging"])
    table_order.extend(["radiology_orders"])
    table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE["Billing / Payment / Insurance / Claims"])
    table_order.extend(["billing_invoices", "payments"])
    for module_name in [
        "IPD / Ward / Room / Bed / Nursing / Discharge",
        "Surgery / OT / Anesthesia",
        "Emergency / Ambulance / Transport",
        "Documents / Forms / Questionnaires",
        "Communication / Notification / Task",
        "Audit / Compliance / Consent / Provenance",
    ]:
        table_order.extend(OPERATIONAL_GENERIC_TABLES_BY_MODULE[module_name])
    table_order.extend(["fhir_resource_types"])
    table_order.extend(FHIR_CORE_TABLES)
    table_order.extend(FHIR_DATATYPE_TABLES)
    table_order.extend(HL7_TABLES)
    table_order.extend(REPORTING_TABLES)

    seen: set[str] = set()
    ordered_tables = []
    for table in table_order:
        if table in ddls and table not in seen:
            ordered_tables.append(table)
            seen.add(table)
    for table in ddls:
        if table not in seen:
            ordered_tables.append(table)
            seen.add(table)

    inserts: dict[str, str] = {}
    for table in MASTER_TABLES:
        inserts[table] = insert_master_table(table)
    inserts.update(core_inserts())
    for table in ordered_tables:
        if table in inserts:
            continue
        if table == "fhir_resource_types":
            inserts[table] = insert_fhir_resource_types()
        elif table == "fhir_resource_mapping":
            inserts[table] = insert_fhir_resource_mapping()
        elif table == "fhir_resource_store":
            inserts[table] = insert_fhir_resource_store()
        elif table == "fhir_resource_versions":
            inserts[table] = insert_fhir_resource_versions()
        elif table == "fhir_resource_references":
            inserts[table] = insert_fhir_resource_references()
        elif table == "fhir_search_parameters":
            inserts[table] = insert_fhir_search_parameters()
        elif table == "fhir_search_index":
            inserts[table] = insert_fhir_search_index()
        elif table == "fhir_resource_element_definitions":
            inserts[table] = insert_fhir_elements()
        elif table in FHIR_DATATYPE_TABLES:
            inserts[table] = insert_fhir_datatype(table)
        elif table in FHIR_CORE_TABLES:
            inserts[table] = insert_fhir_core_generic(table)
        elif table == "hl7_message_log":
            inserts[table] = insert_hl7_message_log()
        elif table == "hl7_message_error_log":
            inserts[table] = insert_hl7_error_log()
        elif table in HL7_TABLES:
            inserts[table] = insert_hl7_generic(table)
        elif table in REPORTING_TABLES:
            inserts[table] = insert_reporting(table)
        elif table in MASTER_TABLES:
            inserts[table] = insert_master_table(table)
        else:
            inserts[table] = insert_generic_operational(table)

    insert_count = 0
    for table, sql in inserts.items():
        if table == "fhir_resource_types":
            insert_count += len(FHIR_RESOURCE_TYPES)
        elif table == "fhir_resource_element_definitions":
            insert_count += len(FHIR_ELEMENT_RESOURCES) * len(COMMON_FHIR_ELEMENTS)
        elif table == "roles":
            insert_count += 5
        elif table == "users":
            insert_count += 10
        elif table == "fhir_search_parameters":
            insert_count += 6
        else:
            insert_count += 2

    sections: list[str] = [header_comment(len(ordered_tables), insert_count), database_preamble()]
    sections.append(table_comment("TABLE CREATION - DEPENDENCY SAFE ORDER"))
    current_group = None
    for table in ordered_tables:
        group = find_group(table)
        if group != current_group:
            current_group = group
            sections.append(table_comment(group))
        sections.append(ddls[table])

    sections.append(table_comment("DUMMY DATA INSERTS - DEPENDENCY SAFE ORDER"))
    current_group = None
    for table in ordered_tables:
        group = find_group(table)
        if group != current_group:
            current_group = group
            sections.append(table_comment(f"Seed data: {group}"))
        sections.append(inserts[table])

    sections.append(validation_queries())
    sections.append(
        f"\n-- Completed Plasmit HMS FHIR R5 schema. Modules covered: {len(MODULES)}. "
        f"Tables created: {len(ordered_tables)}. Seed rows generated: {insert_count}.\n"
    )

    sql = "\n\n".join(sections)
    sql = sql.replace("INSERT INTO ", "INSERT IGNORE INTO ")
    sql = re.sub(r"\nON DUPLICATE KEY UPDATE[\s\S]*?;", ";", sql)

    return sql, {
        "modules": len(MODULES),
        "tables": len(ordered_tables),
        "seed_rows": insert_count,
    }


def find_group(table: str) -> str:
    if table in MASTER_TABLES:
        return "01 Master Data / Terminology"
    if table in {
        "tenants",
        "hospitals",
        "branches",
        "departments",
        "healthcare_services",
        "roles",
        "permissions",
        "role_permissions",
        "users",
        "user_branch_access",
        "user_department_access",
        "audit_user_sessions",
    }:
        return "02 Foundation / RBAC"
    if table == "patients" or table in OPERATIONAL_GENERIC_TABLES_BY_MODULE["Patient Registration / MPI"]:
        return "03 Patient Registration / MPI"
    if table == "appointments" or table in OPERATIONAL_GENERIC_TABLES_BY_MODULE["Appointment / Scheduling"]:
        return "04 Appointment / Scheduling"
    if table == "encounters" or table in OPERATIONAL_GENERIC_TABLES_BY_MODULE["Encounter / OPD / Visit / Emergency Visit"]:
        return "05 Encounter / OPD / Emergency"
    for idx, name in enumerate(
        [
            "Clinical EMR / Doctor Workbench",
            "ICU / Critical Care",
            "Prescription / Medication Orders",
            "Pharmacy / Inventory / Dispensing",
            "Lab / Diagnostics",
            "Radiology / Imaging",
            "Billing / Payment / Insurance / Claims",
            "IPD / Ward / Room / Bed / Nursing / Discharge",
            "Surgery / OT / Anesthesia",
            "Emergency / Ambulance / Transport",
            "Documents / Forms / Questionnaires",
            "Communication / Notification / Task",
            "Audit / Compliance / Consent / Provenance",
        ],
        start=6,
    ):
        if table in OPERATIONAL_GENERIC_TABLES_BY_MODULE[name]:
            return f"{idx:02d} {name}"
    if table in {"prescriptions", "prescription_items"}:
        return "08 Prescription / Medication Orders"
    if table == "pharmacy_sales":
        return "09 Pharmacy / Inventory / Dispensing"
    if table == "lab_orders":
        return "10 Lab / Diagnostics"
    if table == "radiology_orders":
        return "11 Radiology / Imaging"
    if table in {"billing_invoices", "payments"}:
        return "12 Billing / Payment / Insurance / Claims"
    if table == "fhir_resource_types" or table in FHIR_CORE_TABLES or table in FHIR_DATATYPE_TABLES:
        return "19 FHIR R5 Interoperability Layer"
    if table in HL7_TABLES:
        return "20 HL7 Integration"
    if table in REPORTING_TABLES:
        return "21 Reporting / Analytics / AI Command Center"
    return "99 Other"


def notes_content(stats: dict[str, int]) -> str:
    sources = "\n".join(f"- {url}" for url in FHIR_SOURCES)
    optional_files = "\n".join(
        [
            "- 01_master_data.sql",
            "- 02_foundation.sql",
            "- 03_patient.sql",
            "- 04_appointment_encounter.sql",
            "- 05_clinical_icu.sql",
            "- 06_medication_pharmacy.sql",
            "- 07_lab_radiology.sql",
            "- 08_billing_insurance.sql",
            "- 09_ipd_surgery_emergency.sql",
            "- 10_documents_audit.sql",
            "- 11_fhir_core.sql",
            "- 12_hl7_integration.sql",
            "- 13_reporting.sql",
            "- 14_dummy_data.sql",
        ]
    )
    return f"""# Plasmit HMS FHIR R5 Full MySQL Schema Notes

## Output

- SQL script: `database/plasmit_hms_fhir_r5_full_schema.sql`
- Modules covered: {stats['modules']}
- Tables created: {stats['tables']}
- Seed rows generated: {stats['seed_rows']}

## Official FHIR R5 References Used

{sources}

## Architecture

This schema intentionally uses two layers:

1. **Operational HMS layer**: normalized hospital tables for patient, encounter, clinical, ICU, lab, radiology, pharmacy, billing, IPD, surgery, emergency, documents, audit, reporting, and master data.
2. **FHIR interoperability layer**: resource metadata, resource JSON store, mapping, versions, references, search parameters, search index, profiles, code systems, value sets, concept maps, datatype fragments, validation, sync, and API audit.

The operational tables remain the source of truth. FHIR tables are for import/export, validation, partner APIs, external EHR interoperability, and traceability.

## Optional Split File Structure

{optional_files}

## How To Run In MySQL Workbench

1. Open MySQL Workbench.
2. Connect to your local MySQL server.
3. Open `database/plasmit_hms_fhir_r5_full_schema.sql`.
4. Confirm the database name near the top: `plasmit_hms`.
5. Click the lightning execute button.
6. Review the validation SELECT results at the end.

## Assumptions

- Run on a clean database or on a database where these tables do not already exist with conflicting columns.
- Tenant and hospital isolation is mandatory on major operational tables.
- Branch-level operational records include `branch_id`.
- Encounter-level clinical records include `patient_id` and `encounter_id`.
- Money is stored as minor units in `BIGINT`.
- No cascade delete is used for patient, clinical, billing, document, FHIR, HL7, and audit data.
- Cross-microservice clinical relationships are kept as indexed logical references where hard foreign keys would make independent deployments risky.

## Future Extension Notes

- Add Flyway timestamp migration files from this baseline.
- Add service-specific migration ownership for Spring Boot microservices.
- Add generated FHIR JSON validation using a FHIR R5 validator service.
- Add terminology synchronization for LOINC, SNOMED CT, ICD-10, and RxNorm.
- Add event-based denormalized summary refresh jobs for reporting tables.
"""


def main() -> None:
    SQL_PATH.parent.mkdir(parents=True, exist_ok=True)
    NOTES_PATH.parent.mkdir(parents=True, exist_ok=True)
    sql, stats = build_schema()
    SQL_PATH.write_text(sql, encoding="utf-8")
    NOTES_PATH.write_text(notes_content(stats), encoding="utf-8")
    print(json.dumps({"sql": str(SQL_PATH), "notes": str(NOTES_PATH), **stats}, indent=2))


if __name__ == "__main__":
    main()
