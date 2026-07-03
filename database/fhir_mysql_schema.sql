-- FHIR-style MySQL database schema for hospital/clinical systems
-- Target: MySQL 8.0+
-- Design: relational core columns + raw_json JSON column for full FHIR resource payload
-- Generated for Plasmit Clinical project documentation.

CREATE DATABASE IF NOT EXISTS fhir_hms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fhir_hms;

SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =========================================================
-- 1. Generic FHIR resource and audit tables
-- =========================================================

CREATE TABLE IF NOT EXISTS fhir_resource (
  id CHAR(36) NOT NULL PRIMARY KEY,
  resource_type VARCHAR(80) NOT NULL,
  fhir_id VARCHAR(100) NULL,
  version_id VARCHAR(80) NULL,
  last_updated DATETIME NULL,
  profile_url VARCHAR(255) NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fhir_resource_type_fhir_id (resource_type, fhir_id),
  KEY idx_fhir_resource_type (resource_type),
  KEY idx_fhir_resource_updated (last_updated)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_audit_event (
  id CHAR(36) NOT NULL PRIMARY KEY,
  resource_type VARCHAR(80) NOT NULL,
  resource_id CHAR(36) NULL,
  action VARCHAR(40) NOT NULL,
  outcome VARCHAR(40) NOT NULL DEFAULT 'success',
  user_name VARCHAR(150) NULL,
  role_name VARCHAR(150) NULL,
  source_ip VARCHAR(80) NULL,
  old_json JSON NULL,
  new_json JSON NULL,
  action_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_resource (resource_type, resource_id),
  KEY idx_audit_action_at (action_at),
  KEY idx_audit_user (user_name)
) ENGINE=InnoDB;

-- =========================================================
-- 2. Administration and master resources
-- =========================================================

CREATE TABLE IF NOT EXISTS fhir_organization (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  identifier VARCHAR(100) NULL,
  name VARCHAR(255) NOT NULL,
  type_code VARCHAR(80) NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(150) NULL,
  address_text VARCHAR(500) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_org_identifier (identifier),
  KEY idx_org_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_location (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  organization_id CHAR(36) NULL,
  identifier VARCHAR(100) NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(40) NULL,
  mode VARCHAR(40) NULL,
  type_code VARCHAR(80) NULL,
  ward VARCHAR(100) NULL,
  bed_no VARCHAR(80) NULL,
  address_text VARCHAR(500) NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_location_organization FOREIGN KEY (organization_id) REFERENCES fhir_organization(id),
  KEY idx_location_org (organization_id),
  KEY idx_location_name (name),
  KEY idx_location_ward_bed (ward, bed_no)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_practitioner (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  identifier VARCHAR(100) NULL,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(40) NULL,
  birth_date DATE NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(150) NULL,
  qualification VARCHAR(255) NULL,
  specialty VARCHAR(150) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_practitioner_identifier (identifier),
  KEY idx_practitioner_name (name),
  KEY idx_practitioner_specialty (specialty)
) ENGINE=InnoDB;

-- =========================================================
-- 3. Patient and visit resources
-- =========================================================

CREATE TABLE IF NOT EXISTS fhir_patient (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  identifier VARCHAR(100) NULL,
  mrn VARCHAR(100) NULL,
  abha_id VARCHAR(100) NULL,
  name VARCHAR(255) NOT NULL,
  gender VARCHAR(40) NULL,
  birth_date DATE NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(150) NULL,
  address_text VARCHAR(500) NULL,
  marital_status VARCHAR(80) NULL,
  deceased BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_patient_identifier (identifier),
  KEY idx_patient_mrn (mrn),
  KEY idx_patient_abha (abha_id),
  KEY idx_patient_phone (phone),
  KEY idx_patient_name (name),
  FULLTEXT KEY ft_patient_name_phone_identifier (name, phone, identifier)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_patient_identifier (
  id CHAR(36) NOT NULL PRIMARY KEY,
  patient_id CHAR(36) NOT NULL,
  system_url VARCHAR(255) NULL,
  identifier_value VARCHAR(150) NOT NULL,
  identifier_type VARCHAR(80) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patient_identifier_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id) ON DELETE CASCADE,
  UNIQUE KEY uk_patient_identifier_system_value (system_url, identifier_value),
  KEY idx_patient_identifier_patient (patient_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_appointment (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  practitioner_id CHAR(36) NULL,
  location_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  appointment_type VARCHAR(100) NULL,
  reason_text VARCHAR(500) NULL,
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_appointment_practitioner FOREIGN KEY (practitioner_id) REFERENCES fhir_practitioner(id),
  CONSTRAINT fk_appointment_location FOREIGN KEY (location_id) REFERENCES fhir_location(id),
  KEY idx_appointment_patient (patient_id),
  KEY idx_appointment_practitioner (practitioner_id),
  KEY idx_appointment_status_time (status, start_time),
  KEY idx_appointment_location (location_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_encounter (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  practitioner_id CHAR(36) NULL,
  organization_id CHAR(36) NULL,
  location_id CHAR(36) NULL,
  appointment_id CHAR(36) NULL,
  class_code VARCHAR(80) NULL,
  type_code VARCHAR(120) NULL,
  status VARCHAR(60) NOT NULL,
  priority VARCHAR(60) NULL,
  reason_text VARCHAR(500) NULL,
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_encounter_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_encounter_practitioner FOREIGN KEY (practitioner_id) REFERENCES fhir_practitioner(id),
  CONSTRAINT fk_encounter_organization FOREIGN KEY (organization_id) REFERENCES fhir_organization(id),
  CONSTRAINT fk_encounter_location FOREIGN KEY (location_id) REFERENCES fhir_location(id),
  CONSTRAINT fk_encounter_appointment FOREIGN KEY (appointment_id) REFERENCES fhir_appointment(id),
  KEY idx_encounter_patient (patient_id),
  KEY idx_encounter_status (status),
  KEY idx_encounter_class_status (class_code, status),
  KEY idx_encounter_start_time (start_time),
  KEY idx_encounter_location (location_id)
) ENGINE=InnoDB;

-- =========================================================
-- 4. Clinical resources
-- =========================================================

CREATE TABLE IF NOT EXISTS fhir_condition (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  recorder_id CHAR(36) NULL,
  clinical_status VARCHAR(80) NULL,
  verification_status VARCHAR(80) NULL,
  category VARCHAR(120) NULL,
  code VARCHAR(120) NULL,
  display VARCHAR(255) NULL,
  onset_datetime DATETIME NULL,
  abatement_datetime DATETIME NULL,
  note_text TEXT NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_condition_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_condition_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_condition_recorder FOREIGN KEY (recorder_id) REFERENCES fhir_practitioner(id),
  KEY idx_condition_patient (patient_id),
  KEY idx_condition_encounter (encounter_id),
  KEY idx_condition_code (code),
  KEY idx_condition_status (clinical_status, verification_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_allergy_intolerance (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  recorder_id CHAR(36) NULL,
  clinical_status VARCHAR(80) NULL,
  verification_status VARCHAR(80) NULL,
  category VARCHAR(80) NULL,
  criticality VARCHAR(80) NULL,
  code VARCHAR(120) NULL,
  display VARCHAR(255) NULL,
  reaction_text VARCHAR(500) NULL,
  recorded_date DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_allergy_recorder FOREIGN KEY (recorder_id) REFERENCES fhir_practitioner(id),
  KEY idx_allergy_patient (patient_id),
  KEY idx_allergy_code (code),
  KEY idx_allergy_criticality (criticality)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_observation (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  performer_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  category VARCHAR(120) NULL,
  code VARCHAR(120) NOT NULL,
  display VARCHAR(255) NULL,
  value_string VARCHAR(500) NULL,
  value_decimal DECIMAL(18,6) NULL,
  unit VARCHAR(80) NULL,
  reference_range_low DECIMAL(18,6) NULL,
  reference_range_high DECIMAL(18,6) NULL,
  interpretation VARCHAR(80) NULL,
  effective_time DATETIME NULL,
  issued_at DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_observation_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_observation_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_observation_performer FOREIGN KEY (performer_id) REFERENCES fhir_practitioner(id),
  KEY idx_observation_patient (patient_id),
  KEY idx_observation_encounter (encounter_id),
  KEY idx_observation_code_time (code, effective_time),
  KEY idx_observation_category (category),
  KEY idx_observation_interpretation (interpretation)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_service_request (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  requester_id CHAR(36) NULL,
  performer_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  intent VARCHAR(60) NOT NULL,
  priority VARCHAR(60) NULL,
  category VARCHAR(120) NULL,
  code VARCHAR(120) NOT NULL,
  display VARCHAR(255) NULL,
  authored_on DATETIME NULL,
  reason_text VARCHAR(500) NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_request_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_service_request_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_service_request_requester FOREIGN KEY (requester_id) REFERENCES fhir_practitioner(id),
  CONSTRAINT fk_service_request_performer FOREIGN KEY (performer_id) REFERENCES fhir_practitioner(id),
  KEY idx_service_request_patient (patient_id),
  KEY idx_service_request_encounter (encounter_id),
  KEY idx_service_request_status (status),
  KEY idx_service_request_code (code),
  KEY idx_service_request_authored (authored_on)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_specimen (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  service_request_id CHAR(36) NULL,
  type_code VARCHAR(120) NULL,
  type_display VARCHAR(255) NULL,
  accession_identifier VARCHAR(120) NULL,
  status VARCHAR(60) NULL,
  collected_at DATETIME NULL,
  received_at DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_specimen_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_specimen_service_request FOREIGN KEY (service_request_id) REFERENCES fhir_service_request(id),
  KEY idx_specimen_patient (patient_id),
  KEY idx_specimen_service_request (service_request_id),
  KEY idx_specimen_accession (accession_identifier),
  KEY idx_specimen_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_diagnostic_report (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  service_request_id CHAR(36) NULL,
  specimen_id CHAR(36) NULL,
  performer_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  category VARCHAR(120) NULL,
  code VARCHAR(120) NOT NULL,
  display VARCHAR(255) NULL,
  conclusion TEXT NULL,
  effective_time DATETIME NULL,
  issued_at DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_diagnostic_report_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_diagnostic_report_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_diagnostic_report_service_request FOREIGN KEY (service_request_id) REFERENCES fhir_service_request(id),
  CONSTRAINT fk_diagnostic_report_specimen FOREIGN KEY (specimen_id) REFERENCES fhir_specimen(id),
  CONSTRAINT fk_diagnostic_report_performer FOREIGN KEY (performer_id) REFERENCES fhir_practitioner(id),
  KEY idx_diagnostic_report_patient (patient_id),
  KEY idx_diagnostic_report_encounter (encounter_id),
  KEY idx_diagnostic_report_status (status),
  KEY idx_diagnostic_report_code (code),
  KEY idx_diagnostic_report_issued (issued_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_diagnostic_report_result (
  diagnostic_report_id CHAR(36) NOT NULL,
  observation_id CHAR(36) NOT NULL,
  sequence_no INT NOT NULL DEFAULT 1,
  PRIMARY KEY (diagnostic_report_id, observation_id),
  CONSTRAINT fk_report_result_report FOREIGN KEY (diagnostic_report_id) REFERENCES fhir_diagnostic_report(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_result_observation FOREIGN KEY (observation_id) REFERENCES fhir_observation(id) ON DELETE CASCADE,
  KEY idx_report_result_observation (observation_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_procedure (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  performer_id CHAR(36) NULL,
  service_request_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  category VARCHAR(120) NULL,
  code VARCHAR(120) NOT NULL,
  display VARCHAR(255) NULL,
  performed_start DATETIME NULL,
  performed_end DATETIME NULL,
  outcome_text VARCHAR(500) NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_procedure_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_procedure_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_procedure_performer FOREIGN KEY (performer_id) REFERENCES fhir_practitioner(id),
  CONSTRAINT fk_procedure_service_request FOREIGN KEY (service_request_id) REFERENCES fhir_service_request(id),
  KEY idx_procedure_patient (patient_id),
  KEY idx_procedure_encounter (encounter_id),
  KEY idx_procedure_status (status),
  KEY idx_procedure_code (code)
) ENGINE=InnoDB;

-- =========================================================
-- 5. Medication resources
-- =========================================================

CREATE TABLE IF NOT EXISTS fhir_medication (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  code VARCHAR(120) NULL,
  display VARCHAR(255) NOT NULL,
  form_code VARCHAR(80) NULL,
  strength VARCHAR(120) NULL,
  manufacturer VARCHAR(255) NULL,
  batch_no VARCHAR(120) NULL,
  expiry_date DATE NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_medication_code (code),
  KEY idx_medication_display (display),
  KEY idx_medication_batch (batch_no),
  KEY idx_medication_expiry (expiry_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_medication_request (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  requester_id CHAR(36) NULL,
  medication_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  intent VARCHAR(60) NOT NULL,
  priority VARCHAR(60) NULL,
  dosage_instruction TEXT NULL,
  authored_on DATETIME NULL,
  reason_text VARCHAR(500) NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_med_request_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_med_request_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_med_request_requester FOREIGN KEY (requester_id) REFERENCES fhir_practitioner(id),
  CONSTRAINT fk_med_request_medication FOREIGN KEY (medication_id) REFERENCES fhir_medication(id),
  KEY idx_med_request_patient (patient_id),
  KEY idx_med_request_encounter (encounter_id),
  KEY idx_med_request_status (status),
  KEY idx_med_request_authored (authored_on)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_medication_dispense (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  medication_request_id CHAR(36) NULL,
  medication_id CHAR(36) NULL,
  performer_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  quantity DECIMAL(18,3) NULL,
  unit VARCHAR(80) NULL,
  when_prepared DATETIME NULL,
  when_handed_over DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_med_dispense_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_med_dispense_request FOREIGN KEY (medication_request_id) REFERENCES fhir_medication_request(id),
  CONSTRAINT fk_med_dispense_medication FOREIGN KEY (medication_id) REFERENCES fhir_medication(id),
  CONSTRAINT fk_med_dispense_performer FOREIGN KEY (performer_id) REFERENCES fhir_practitioner(id),
  KEY idx_med_dispense_patient (patient_id),
  KEY idx_med_dispense_request (medication_request_id),
  KEY idx_med_dispense_status (status),
  KEY idx_med_dispense_handover (when_handed_over)
) ENGINE=InnoDB;

-- =========================================================
-- 6. Document, coverage, and claim resources
-- =========================================================

CREATE TABLE IF NOT EXISTS fhir_document_reference (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  author_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  doc_status VARCHAR(60) NULL,
  type_code VARCHAR(120) NULL,
  type_display VARCHAR(255) NULL,
  file_name VARCHAR(255) NULL,
  file_url VARCHAR(500) NULL,
  content_type VARCHAR(120) NULL,
  created_doc_at DATETIME NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_doc_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_doc_author FOREIGN KEY (author_id) REFERENCES fhir_practitioner(id),
  KEY idx_doc_patient (patient_id),
  KEY idx_doc_encounter (encounter_id),
  KEY idx_doc_status (status),
  KEY idx_doc_type (type_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_coverage (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  payor_organization_id CHAR(36) NULL,
  identifier VARCHAR(120) NULL,
  status VARCHAR(60) NOT NULL,
  type_code VARCHAR(120) NULL,
  subscriber_name VARCHAR(255) NULL,
  policy_no VARCHAR(120) NULL,
  period_start DATE NULL,
  period_end DATE NULL,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_coverage_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_coverage_payor FOREIGN KEY (payor_organization_id) REFERENCES fhir_organization(id),
  KEY idx_coverage_patient (patient_id),
  KEY idx_coverage_identifier (identifier),
  KEY idx_coverage_policy (policy_no),
  KEY idx_coverage_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_claim (
  id CHAR(36) NOT NULL PRIMARY KEY,
  fhir_id VARCHAR(100) NULL UNIQUE,
  patient_id CHAR(36) NOT NULL,
  encounter_id CHAR(36) NULL,
  coverage_id CHAR(36) NULL,
  provider_id CHAR(36) NULL,
  status VARCHAR(60) NOT NULL,
  type_code VARCHAR(120) NULL,
  use_code VARCHAR(80) NULL,
  billable_period_start DATE NULL,
  billable_period_end DATE NULL,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  currency VARCHAR(20) NOT NULL DEFAULT 'INR',
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_claim_patient FOREIGN KEY (patient_id) REFERENCES fhir_patient(id),
  CONSTRAINT fk_claim_encounter FOREIGN KEY (encounter_id) REFERENCES fhir_encounter(id),
  CONSTRAINT fk_claim_coverage FOREIGN KEY (coverage_id) REFERENCES fhir_coverage(id),
  CONSTRAINT fk_claim_provider FOREIGN KEY (provider_id) REFERENCES fhir_organization(id),
  KEY idx_claim_patient (patient_id),
  KEY idx_claim_encounter (encounter_id),
  KEY idx_claim_status (status),
  KEY idx_claim_period (billable_period_start, billable_period_end)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fhir_claim_item (
  id CHAR(36) NOT NULL PRIMARY KEY,
  claim_id CHAR(36) NOT NULL,
  sequence_no INT NOT NULL,
  product_or_service_code VARCHAR(120) NOT NULL,
  product_or_service_display VARCHAR(255) NULL,
  quantity DECIMAL(18,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(18,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  raw_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_claim_item_claim FOREIGN KEY (claim_id) REFERENCES fhir_claim(id) ON DELETE CASCADE,
  KEY idx_claim_item_claim (claim_id),
  KEY idx_claim_item_service (product_or_service_code)
) ENGINE=InnoDB;

-- =========================================================
-- 7. UUID helper triggers
-- =========================================================

DELIMITER $$

DROP TRIGGER IF EXISTS trg_resource_bi$$
DROP TRIGGER IF EXISTS trg_audit_bi$$
DROP TRIGGER IF EXISTS trg_organization_bi$$
DROP TRIGGER IF EXISTS trg_location_bi$$
DROP TRIGGER IF EXISTS trg_practitioner_bi$$
DROP TRIGGER IF EXISTS trg_patient_bi$$
DROP TRIGGER IF EXISTS trg_patient_identifier_bi$$
DROP TRIGGER IF EXISTS trg_appointment_bi$$
DROP TRIGGER IF EXISTS trg_encounter_bi$$
DROP TRIGGER IF EXISTS trg_condition_bi$$
DROP TRIGGER IF EXISTS trg_allergy_bi$$
DROP TRIGGER IF EXISTS trg_observation_bi$$
DROP TRIGGER IF EXISTS trg_service_request_bi$$
DROP TRIGGER IF EXISTS trg_specimen_bi$$
DROP TRIGGER IF EXISTS trg_diagnostic_report_bi$$
DROP TRIGGER IF EXISTS trg_procedure_bi$$
DROP TRIGGER IF EXISTS trg_medication_bi$$
DROP TRIGGER IF EXISTS trg_med_request_bi$$
DROP TRIGGER IF EXISTS trg_med_dispense_bi$$
DROP TRIGGER IF EXISTS trg_doc_reference_bi$$
DROP TRIGGER IF EXISTS trg_coverage_bi$$
DROP TRIGGER IF EXISTS trg_claim_bi$$
DROP TRIGGER IF EXISTS trg_claim_item_bi$$
DROP TRIGGER IF EXISTS trg_patient_ai$$
DROP TRIGGER IF EXISTS trg_patient_au$$
DROP TRIGGER IF EXISTS trg_encounter_ai$$
DROP TRIGGER IF EXISTS trg_encounter_au$$
DROP TRIGGER IF EXISTS trg_observation_ai$$
DROP TRIGGER IF EXISTS trg_med_request_ai$$
DROP TRIGGER IF EXISTS trg_diagnostic_report_ai$$

CREATE TRIGGER trg_resource_bi BEFORE INSERT ON fhir_resource
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_audit_bi BEFORE INSERT ON fhir_audit_event
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_organization_bi BEFORE INSERT ON fhir_organization
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_location_bi BEFORE INSERT ON fhir_location
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_practitioner_bi BEFORE INSERT ON fhir_practitioner
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_patient_bi BEFORE INSERT ON fhir_patient
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_patient_identifier_bi BEFORE INSERT ON fhir_patient_identifier
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_appointment_bi BEFORE INSERT ON fhir_appointment
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_encounter_bi BEFORE INSERT ON fhir_encounter
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_condition_bi BEFORE INSERT ON fhir_condition
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_allergy_bi BEFORE INSERT ON fhir_allergy_intolerance
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_observation_bi BEFORE INSERT ON fhir_observation
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_service_request_bi BEFORE INSERT ON fhir_service_request
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_specimen_bi BEFORE INSERT ON fhir_specimen
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_diagnostic_report_bi BEFORE INSERT ON fhir_diagnostic_report
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_procedure_bi BEFORE INSERT ON fhir_procedure
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_medication_bi BEFORE INSERT ON fhir_medication
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_med_request_bi BEFORE INSERT ON fhir_medication_request
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_med_dispense_bi BEFORE INSERT ON fhir_medication_dispense
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_doc_reference_bi BEFORE INSERT ON fhir_document_reference
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_coverage_bi BEFORE INSERT ON fhir_coverage
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_claim_bi BEFORE INSERT ON fhir_claim
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
END$$

CREATE TRIGGER trg_claim_item_bi BEFORE INSERT ON fhir_claim_item
FOR EACH ROW BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN SET NEW.id = UUID(); END IF;
  SET NEW.net_amount = NEW.quantity * NEW.unit_price;
END$$

-- =========================================================
-- 8. Audit triggers for key resources
-- =========================================================

CREATE TRIGGER trg_patient_ai AFTER INSERT ON fhir_patient
FOR EACH ROW BEGIN
  INSERT INTO fhir_audit_event (resource_type, resource_id, action, user_name, new_json)
  VALUES ('Patient', NEW.id, 'INSERT', COALESCE(@app_user, CURRENT_USER()), NEW.raw_json);
END$$

CREATE TRIGGER trg_patient_au AFTER UPDATE ON fhir_patient
FOR EACH ROW BEGIN
  INSERT INTO fhir_audit_event (resource_type, resource_id, action, user_name, old_json, new_json)
  VALUES ('Patient', NEW.id, 'UPDATE', COALESCE(@app_user, CURRENT_USER()), OLD.raw_json, NEW.raw_json);
END$$

CREATE TRIGGER trg_encounter_ai AFTER INSERT ON fhir_encounter
FOR EACH ROW BEGIN
  INSERT INTO fhir_audit_event (resource_type, resource_id, action, user_name, new_json)
  VALUES ('Encounter', NEW.id, 'INSERT', COALESCE(@app_user, CURRENT_USER()), NEW.raw_json);
END$$

CREATE TRIGGER trg_encounter_au AFTER UPDATE ON fhir_encounter
FOR EACH ROW BEGIN
  INSERT INTO fhir_audit_event (resource_type, resource_id, action, user_name, old_json, new_json)
  VALUES ('Encounter', NEW.id, 'UPDATE', COALESCE(@app_user, CURRENT_USER()), OLD.raw_json, NEW.raw_json);
END$$

CREATE TRIGGER trg_observation_ai AFTER INSERT ON fhir_observation
FOR EACH ROW BEGIN
  INSERT INTO fhir_audit_event (resource_type, resource_id, action, user_name, new_json)
  VALUES ('Observation', NEW.id, 'INSERT', COALESCE(@app_user, CURRENT_USER()), NEW.raw_json);
END$$

CREATE TRIGGER trg_med_request_ai AFTER INSERT ON fhir_medication_request
FOR EACH ROW BEGIN
  INSERT INTO fhir_audit_event (resource_type, resource_id, action, user_name, new_json)
  VALUES ('MedicationRequest', NEW.id, 'INSERT', COALESCE(@app_user, CURRENT_USER()), NEW.raw_json);
END$$

CREATE TRIGGER trg_diagnostic_report_ai AFTER INSERT ON fhir_diagnostic_report
FOR EACH ROW BEGIN
  INSERT INTO fhir_audit_event (resource_type, resource_id, action, user_name, new_json)
  VALUES ('DiagnosticReport', NEW.id, 'INSERT', COALESCE(@app_user, CURRENT_USER()), NEW.raw_json);
END$$

-- =========================================================
-- 9. Stored procedures
-- =========================================================

DROP PROCEDURE IF EXISTS sp_upsert_patient$$
DROP PROCEDURE IF EXISTS sp_create_encounter$$
DROP PROCEDURE IF EXISTS sp_close_encounter$$
DROP PROCEDURE IF EXISTS sp_record_observation$$
DROP PROCEDURE IF EXISTS sp_create_service_request$$
DROP PROCEDURE IF EXISTS sp_create_diagnostic_report$$
DROP PROCEDURE IF EXISTS sp_prescribe_medication$$
DROP PROCEDURE IF EXISTS sp_search_patient$$
DROP PROCEDURE IF EXISTS sp_get_patient_summary$$
DROP PROCEDURE IF EXISTS sp_get_patient_timeline$$

CREATE PROCEDURE sp_upsert_patient (
  IN p_fhir_id VARCHAR(100),
  IN p_identifier VARCHAR(100),
  IN p_name VARCHAR(255),
  IN p_gender VARCHAR(40),
  IN p_birth_date DATE,
  IN p_phone VARCHAR(40),
  IN p_raw_json JSON,
  IN p_user VARCHAR(150),
  OUT o_patient_id CHAR(36)
)
BEGIN
  SET @app_user = p_user;

  SELECT id INTO o_patient_id
  FROM fhir_patient
  WHERE (p_fhir_id IS NOT NULL AND fhir_id = p_fhir_id)
     OR (p_identifier IS NOT NULL AND identifier = p_identifier)
  LIMIT 1;

  IF o_patient_id IS NULL THEN
    SET o_patient_id = UUID();
    INSERT INTO fhir_patient (id, fhir_id, identifier, name, gender, birth_date, phone, raw_json)
    VALUES (o_patient_id, p_fhir_id, p_identifier, p_name, p_gender, p_birth_date, p_phone, p_raw_json);
  ELSE
    UPDATE fhir_patient
    SET name = p_name,
        gender = p_gender,
        birth_date = p_birth_date,
        phone = p_phone,
        raw_json = p_raw_json
    WHERE id = o_patient_id;
  END IF;

  SET @app_user = NULL;
END$$

CREATE PROCEDURE sp_create_encounter (
  IN p_patient_id CHAR(36),
  IN p_practitioner_id CHAR(36),
  IN p_location_id CHAR(36),
  IN p_class_code VARCHAR(80),
  IN p_type_code VARCHAR(120),
  IN p_status VARCHAR(60),
  IN p_reason_text VARCHAR(500),
  IN p_start_time DATETIME,
  IN p_raw_json JSON,
  IN p_user VARCHAR(150),
  OUT o_encounter_id CHAR(36)
)
BEGIN
  SET @app_user = p_user;
  SET o_encounter_id = UUID();

  INSERT INTO fhir_encounter (
    id, patient_id, practitioner_id, location_id, class_code, type_code,
    status, reason_text, start_time, raw_json
  )
  VALUES (
    o_encounter_id, p_patient_id, p_practitioner_id, p_location_id, p_class_code, p_type_code,
    p_status, p_reason_text, p_start_time, p_raw_json
  );

  SET @app_user = NULL;
END$$

CREATE PROCEDURE sp_close_encounter (
  IN p_encounter_id CHAR(36),
  IN p_end_time DATETIME,
  IN p_user VARCHAR(150)
)
BEGIN
  SET @app_user = p_user;
  UPDATE fhir_encounter
  SET status = 'finished',
      end_time = p_end_time
  WHERE id = p_encounter_id;
  SET @app_user = NULL;
END$$

CREATE PROCEDURE sp_record_observation (
  IN p_patient_id CHAR(36),
  IN p_encounter_id CHAR(36),
  IN p_performer_id CHAR(36),
  IN p_category VARCHAR(120),
  IN p_code VARCHAR(120),
  IN p_display VARCHAR(255),
  IN p_value_string VARCHAR(500),
  IN p_value_decimal DECIMAL(18,6),
  IN p_unit VARCHAR(80),
  IN p_interpretation VARCHAR(80),
  IN p_effective_time DATETIME,
  IN p_raw_json JSON,
  IN p_user VARCHAR(150),
  OUT o_observation_id CHAR(36)
)
BEGIN
  SET @app_user = p_user;
  SET o_observation_id = UUID();

  INSERT INTO fhir_observation (
    id, patient_id, encounter_id, performer_id, status, category, code, display,
    value_string, value_decimal, unit, interpretation, effective_time, raw_json
  )
  VALUES (
    o_observation_id, p_patient_id, p_encounter_id, p_performer_id, 'final', p_category, p_code, p_display,
    p_value_string, p_value_decimal, p_unit, p_interpretation, p_effective_time, p_raw_json
  );

  SET @app_user = NULL;
END$$

CREATE PROCEDURE sp_create_service_request (
  IN p_patient_id CHAR(36),
  IN p_encounter_id CHAR(36),
  IN p_requester_id CHAR(36),
  IN p_category VARCHAR(120),
  IN p_code VARCHAR(120),
  IN p_display VARCHAR(255),
  IN p_priority VARCHAR(60),
  IN p_reason_text VARCHAR(500),
  IN p_raw_json JSON,
  IN p_user VARCHAR(150),
  OUT o_service_request_id CHAR(36)
)
BEGIN
  SET @app_user = p_user;
  SET o_service_request_id = UUID();

  INSERT INTO fhir_service_request (
    id, patient_id, encounter_id, requester_id, status, intent, priority,
    category, code, display, authored_on, reason_text, raw_json
  )
  VALUES (
    o_service_request_id, p_patient_id, p_encounter_id, p_requester_id, 'active', 'order', p_priority,
    p_category, p_code, p_display, NOW(), p_reason_text, p_raw_json
  );

  SET @app_user = NULL;
END$$

CREATE PROCEDURE sp_create_diagnostic_report (
  IN p_patient_id CHAR(36),
  IN p_encounter_id CHAR(36),
  IN p_service_request_id CHAR(36),
  IN p_specimen_id CHAR(36),
  IN p_performer_id CHAR(36),
  IN p_code VARCHAR(120),
  IN p_display VARCHAR(255),
  IN p_conclusion TEXT,
  IN p_raw_json JSON,
  IN p_user VARCHAR(150),
  OUT o_report_id CHAR(36)
)
BEGIN
  SET @app_user = p_user;
  SET o_report_id = UUID();

  INSERT INTO fhir_diagnostic_report (
    id, patient_id, encounter_id, service_request_id, specimen_id,
    performer_id, status, category, code, display, conclusion, issued_at, raw_json
  )
  VALUES (
    o_report_id, p_patient_id, p_encounter_id, p_service_request_id, p_specimen_id,
    p_performer_id, 'final', 'laboratory', p_code, p_display, p_conclusion, NOW(), p_raw_json
  );

  SET @app_user = NULL;
END$$

CREATE PROCEDURE sp_prescribe_medication (
  IN p_patient_id CHAR(36),
  IN p_encounter_id CHAR(36),
  IN p_requester_id CHAR(36),
  IN p_medication_id CHAR(36),
  IN p_priority VARCHAR(60),
  IN p_dosage_instruction TEXT,
  IN p_reason_text VARCHAR(500),
  IN p_raw_json JSON,
  IN p_user VARCHAR(150),
  OUT o_medication_request_id CHAR(36)
)
BEGIN
  SET @app_user = p_user;
  SET o_medication_request_id = UUID();

  INSERT INTO fhir_medication_request (
    id, patient_id, encounter_id, requester_id, medication_id,
    status, intent, priority, dosage_instruction, authored_on, reason_text, raw_json
  )
  VALUES (
    o_medication_request_id, p_patient_id, p_encounter_id, p_requester_id, p_medication_id,
    'active', 'order', p_priority, p_dosage_instruction, NOW(), p_reason_text, p_raw_json
  );

  SET @app_user = NULL;
END$$

CREATE PROCEDURE sp_search_patient (
  IN p_query VARCHAR(255)
)
BEGIN
  SELECT
    id,
    fhir_id,
    identifier,
    mrn,
    abha_id,
    name,
    gender,
    birth_date,
    phone,
    active
  FROM fhir_patient
  WHERE p_query IS NULL
     OR p_query = ''
     OR name LIKE CONCAT('%', p_query, '%')
     OR phone LIKE CONCAT('%', p_query, '%')
     OR identifier LIKE CONCAT('%', p_query, '%')
     OR mrn LIKE CONCAT('%', p_query, '%')
     OR abha_id LIKE CONCAT('%', p_query, '%')
  ORDER BY updated_at DESC
  LIMIT 50;
END$$

CREATE PROCEDURE sp_get_patient_summary (
  IN p_patient_id CHAR(36)
)
BEGIN
  SELECT * FROM fhir_patient WHERE id = p_patient_id;

  SELECT *
  FROM fhir_encounter
  WHERE patient_id = p_patient_id
  ORDER BY start_time DESC
  LIMIT 10;

  SELECT *
  FROM fhir_observation
  WHERE patient_id = p_patient_id
  ORDER BY effective_time DESC
  LIMIT 20;

  SELECT *
  FROM fhir_medication_request
  WHERE patient_id = p_patient_id
  ORDER BY authored_on DESC
  LIMIT 20;
END$$

CREATE PROCEDURE sp_get_patient_timeline (
  IN p_patient_id CHAR(36)
)
BEGIN
  SELECT 'Encounter' AS event_type, id AS event_id, status AS event_status, start_time AS event_time, reason_text AS event_text
  FROM fhir_encounter
  WHERE patient_id = p_patient_id

  UNION ALL

  SELECT 'Observation' AS event_type, id AS event_id, status AS event_status, effective_time AS event_time, display AS event_text
  FROM fhir_observation
  WHERE patient_id = p_patient_id

  UNION ALL

  SELECT 'MedicationRequest' AS event_type, id AS event_id, status AS event_status, authored_on AS event_time, dosage_instruction AS event_text
  FROM fhir_medication_request
  WHERE patient_id = p_patient_id

  UNION ALL

  SELECT 'DiagnosticReport' AS event_type, id AS event_id, status AS event_status, issued_at AS event_time, display AS event_text
  FROM fhir_diagnostic_report
  WHERE patient_id = p_patient_id

  ORDER BY event_time DESC
  LIMIT 200;
END$$

DELIMITER ;

-- =========================================================
-- 10. Useful views
-- =========================================================

CREATE OR REPLACE VIEW vw_patient_current_encounters AS
SELECT
  e.id AS encounter_id,
  p.id AS patient_id,
  p.identifier,
  p.name AS patient_name,
  p.gender,
  p.birth_date,
  e.class_code,
  e.status,
  e.priority,
  e.start_time,
  pr.name AS practitioner_name,
  l.name AS location_name,
  l.ward,
  l.bed_no
FROM fhir_encounter e
JOIN fhir_patient p ON p.id = e.patient_id
LEFT JOIN fhir_practitioner pr ON pr.id = e.practitioner_id
LEFT JOIN fhir_location l ON l.id = e.location_id
WHERE e.status NOT IN ('finished', 'cancelled', 'entered-in-error');

CREATE OR REPLACE VIEW vw_patient_latest_vitals AS
SELECT
  o.patient_id,
  p.name AS patient_name,
  o.code,
  o.display,
  o.value_string,
  o.value_decimal,
  o.unit,
  o.interpretation,
  o.effective_time
FROM fhir_observation o
JOIN fhir_patient p ON p.id = o.patient_id
WHERE o.category IN ('vital-signs', 'vitals');

-- End of script
