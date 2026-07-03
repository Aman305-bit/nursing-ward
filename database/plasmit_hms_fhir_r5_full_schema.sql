/*
Plasmit Global Hospital Management System
FHIR R5 aware, HL7 ready, multi-tenant MySQL database schema

Database placeholder:
  CREATE DATABASE IF NOT EXISTS plasmit_hms;
  USE plasmit_hms;

Official FHIR R5 references reviewed for this script:
   - https://hl7.org/fhir/R5/resourcelist.html
   - https://hl7.org/fhir/R5/resource.html
   - https://hl7.org/fhir/R5/datatypes.html
   - https://hl7.org/fhir/R5/references.html
   - https://hl7.org/fhir/R5/search.html
   - https://hl7.org/fhir/R5/codesystem.html
   - https://hl7.org/fhir/R5/valueset.html
   - https://hl7.org/fhir/R5/conceptmap.html
   - https://hl7.org/fhir/R5/structuredefinition.html
   - https://hl7.org/fhir/R5/capabilitystatement.html
   - https://hl7.org/fhir/R5/implementationguide.html
   - https://hl7.org/fhir/R5/compartmentdefinition-patient.html

Design principle:
  Layer 1 is normalized HMS operational data and remains the source of truth.
  Layer 2 is the FHIR interoperability layer for generated JSON, mappings,
  resource metadata, element definitions, search parameters, datatype fragments,
  validation results, sync status, and API audit.

Script coverage summary:
  Modules covered: 21
  Tables created: 290
  Seed rows generated: 1729

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
  tenants ||--o{ hospitals : owns
  hospitals ||--o{ branches : has
  hospitals ||--o{ patients : registers
  branches ||--o{ appointments : schedules
  patients ||--o{ appointments : books
  appointments ||--o| encounters : creates
  patients ||--o{ encounters : attends
  branches ||--o{ encounters : hosts
  encounters ||--o{ vitals : records
  encounters ||--o{ diagnoses : has
  encounters ||--o{ clinical_notes : documents
  encounters ||--o{ lab_orders : orders
  lab_orders ||--o{ lab_order_items : contains
  lab_order_items ||--o{ lab_results : produces
  encounters ||--o{ prescriptions : orders
  prescriptions ||--o{ prescription_items : contains
  encounters ||--o{ billing_invoices : bills
  billing_invoices ||--o{ payments : receives
  patients ||--o{ documents : owns
```

FHIR interoperability ER diagram:
```mermaid
erDiagram
  fhir_resource_types ||--o{ fhir_resource_store : classifies
  fhir_resource_store ||--o{ fhir_resource_versions : versions
  fhir_resource_store ||--o{ fhir_resource_references : links
  fhir_resource_mapping }o--|| fhir_resource_store : maps
  fhir_search_parameters ||--o{ fhir_search_index : drives
  fhir_profiles ||--o{ fhir_structure_definitions : constrains
  fhir_code_systems ||--o{ fhir_value_sets : supplies
  fhir_code_systems ||--o{ fhir_concept_maps : maps
```

HL7 integration ER diagram:
```mermaid
erDiagram
  hl7_message_log ||--o{ hl7_message_error_log : records
  hl7_message_log ||--o{ hl7_segment_store : stores
  hl7_message_log ||--o{ hl7_acknowledgement_log : acknowledges
  hl7_message_log ||--o{ hl7_patient_mapping : maps_patient
  hl7_message_log ||--o{ hl7_order_mapping : maps_order
  hl7_message_log ||--o{ hl7_result_mapping : maps_result
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


CREATE DATABASE IF NOT EXISTS plasmit_hms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE plasmit_hms;

SET NAMES utf8mb4;
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ZERO_DATE,NO_ZERO_IN_DATE,NO_ENGINE_SUBSTITUTION';



-- ============================================================================================
-- TABLE CREATION - DEPENDENCY SAFE ORDER
-- ============================================================================================



-- ============================================================================================
-- 01 Master Data / Terminology
-- ============================================================================================


CREATE TABLE IF NOT EXISTS gender_master (
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
  UNIQUE KEY uk_gender_master_code (code),
  KEY idx_gender_master_status (status),
  KEY idx_gender_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blood_group_master (
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
  UNIQUE KEY uk_blood_group_master_code (code),
  KEY idx_blood_group_master_status (status),
  KEY idx_blood_group_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS country_master (
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
  UNIQUE KEY uk_country_master_code (code),
  KEY idx_country_master_status (status),
  KEY idx_country_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS state_master (
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
  UNIQUE KEY uk_state_master_code (code),
  KEY idx_state_master_status (status),
  KEY idx_state_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS city_master (
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
  UNIQUE KEY uk_city_master_code (code),
  KEY idx_city_master_status (status),
  KEY idx_city_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS department_type_master (
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
  UNIQUE KEY uk_department_type_master_code (code),
  KEY idx_department_type_master_status (status),
  KEY idx_department_type_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS encounter_type_master (
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
  UNIQUE KEY uk_encounter_type_master_code (code),
  KEY idx_encounter_type_master_status (status),
  KEY idx_encounter_type_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_status_master (
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
  UNIQUE KEY uk_appointment_status_master_code (code),
  KEY idx_appointment_status_master_status (status),
  KEY idx_appointment_status_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_status_master (
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
  UNIQUE KEY uk_invoice_status_master_code (code),
  KEY idx_invoice_status_master_status (status),
  KEY idx_invoice_status_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_mode_master (
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
  UNIQUE KEY uk_payment_mode_master_code (code),
  KEY idx_payment_mode_master_status (status),
  KEY idx_payment_mode_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnosis_code_master (
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
  UNIQUE KEY uk_diagnosis_code_master_code (code),
  KEY idx_diagnosis_code_master_status (status),
  KEY idx_diagnosis_code_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loinc_code_master (
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
  UNIQUE KEY uk_loinc_code_master_code (code),
  KEY idx_loinc_code_master_status (status),
  KEY idx_loinc_code_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snomed_code_master (
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
  UNIQUE KEY uk_snomed_code_master_code (code),
  KEY idx_snomed_code_master_status (status),
  KEY idx_snomed_code_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icd10_code_master (
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
  UNIQUE KEY uk_icd10_code_master_code (code),
  KEY idx_icd10_code_master_status (status),
  KEY idx_icd10_code_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rxnorm_code_master (
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
  UNIQUE KEY uk_rxnorm_code_master_code (code),
  KEY idx_rxnorm_code_master_status (status),
  KEY idx_rxnorm_code_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_type_master (
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
  UNIQUE KEY uk_fhir_resource_type_master_code (code),
  KEY idx_fhir_resource_type_master_status (status),
  KEY idx_fhir_resource_type_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_message_type_master (
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
  UNIQUE KEY uk_hl7_message_type_master_code (code),
  KEY idx_hl7_message_type_master_status (status),
  KEY idx_hl7_message_type_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS code_system_master (
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
  UNIQUE KEY uk_code_system_master_code (code),
  KEY idx_code_system_master_status (status),
  KEY idx_code_system_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS value_set_master (
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
  UNIQUE KEY uk_value_set_master_code (code),
  KEY idx_value_set_master_status (status),
  KEY idx_value_set_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS concept_map_master (
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
  UNIQUE KEY uk_concept_map_master_code (code),
  KEY idx_concept_map_master_status (status),
  KEY idx_concept_map_master_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS local_code_systems (
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
  UNIQUE KEY uk_local_code_systems_code (code),
  KEY idx_local_code_systems_status (status),
  KEY idx_local_code_systems_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS local_to_fhir_code_mappings (
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
  UNIQUE KEY uk_local_to_fhir_code_mappings_code (code),
  KEY idx_local_to_fhir_code_mappings_status (status),
  KEY idx_local_to_fhir_code_mappings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loinc_mappings (
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
  UNIQUE KEY uk_loinc_mappings_code (code),
  KEY idx_loinc_mappings_status (status),
  KEY idx_loinc_mappings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS snomed_mappings (
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
  UNIQUE KEY uk_snomed_mappings_code (code),
  KEY idx_snomed_mappings_status (status),
  KEY idx_snomed_mappings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icd10_mappings (
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
  UNIQUE KEY uk_icd10_mappings_code (code),
  KEY idx_icd10_mappings_status (status),
  KEY idx_icd10_mappings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rxnorm_mappings (
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
  UNIQUE KEY uk_rxnorm_mappings_code (code),
  KEY idx_rxnorm_mappings_status (status),
  KEY idx_rxnorm_mappings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 02 Foundation / RBAC
-- ============================================================================================


CREATE TABLE IF NOT EXISTS tenants (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hospitals (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS healthcare_services (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_branch_access (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_department_access (
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
  KEY idx_user_department_access_tenant_hospital (tenant_id, hospital_id),
  KEY idx_user_department_access_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_user_department_access_patient (patient_id),
  KEY idx_user_department_access_encounter (encounter_id),
  KEY idx_user_department_access_order_date (event_date),
  KEY idx_user_department_access_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_user_sessions (
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
  KEY idx_audit_user_sessions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_audit_user_sessions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_audit_user_sessions_patient (patient_id),
  KEY idx_audit_user_sessions_encounter (encounter_id),
  KEY idx_audit_user_sessions_order_date (event_date),
  KEY idx_audit_user_sessions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 03 Patient Registration / MPI
-- ============================================================================================


CREATE TABLE IF NOT EXISTS patients (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_identifiers (
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
  KEY idx_patient_identifiers_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_identifiers_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_identifiers_patient (patient_id),
  KEY idx_patient_identifiers_encounter (encounter_id),
  KEY idx_patient_identifiers_order_date (event_date),
  KEY idx_patient_identifiers_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_addresses (
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
  KEY idx_patient_addresses_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_addresses_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_addresses_patient (patient_id),
  KEY idx_patient_addresses_encounter (encounter_id),
  KEY idx_patient_addresses_order_date (event_date),
  KEY idx_patient_addresses_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_contacts (
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
  KEY idx_patient_contacts_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_contacts_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_contacts_patient (patient_id),
  KEY idx_patient_contacts_encounter (encounter_id),
  KEY idx_patient_contacts_order_date (event_date),
  KEY idx_patient_contacts_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_emergency_contacts (
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
  KEY idx_patient_emergency_contacts_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_emergency_contacts_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_emergency_contacts_patient (patient_id),
  KEY idx_patient_emergency_contacts_encounter (encounter_id),
  KEY idx_patient_emergency_contacts_order_date (event_date),
  KEY idx_patient_emergency_contacts_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_allergies (
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
  KEY idx_patient_allergies_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_allergies_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_allergies_patient (patient_id),
  KEY idx_patient_allergies_encounter (encounter_id),
  KEY idx_patient_allergies_order_date (event_date),
  KEY idx_patient_allergies_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_insurance (
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
  KEY idx_patient_insurance_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_insurance_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_insurance_patient (patient_id),
  KEY idx_patient_insurance_encounter (encounter_id),
  KEY idx_patient_insurance_order_date (event_date),
  KEY idx_patient_insurance_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_consent_records (
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
  KEY idx_patient_consent_records_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_consent_records_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_consent_records_patient (patient_id),
  KEY idx_patient_consent_records_encounter (encounter_id),
  KEY idx_patient_consent_records_order_date (event_date),
  KEY idx_patient_consent_records_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_documents (
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
  KEY idx_patient_documents_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_documents_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_documents_patient (patient_id),
  KEY idx_patient_documents_encounter (encounter_id),
  KEY idx_patient_documents_order_date (event_date),
  KEY idx_patient_documents_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS master_patient_index (
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
  KEY idx_master_patient_index_tenant_hospital (tenant_id, hospital_id),
  KEY idx_master_patient_index_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_master_patient_index_patient (patient_id),
  KEY idx_master_patient_index_encounter (encounter_id),
  KEY idx_master_patient_index_order_date (event_date),
  KEY idx_master_patient_index_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_linkages (
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
  KEY idx_patient_linkages_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_linkages_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_linkages_patient (patient_id),
  KEY idx_patient_linkages_encounter (encounter_id),
  KEY idx_patient_linkages_order_date (event_date),
  KEY idx_patient_linkages_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 04 Appointment / Scheduling
-- ============================================================================================


CREATE TABLE IF NOT EXISTS appointments (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS schedules (
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
  KEY idx_schedules_tenant_hospital (tenant_id, hospital_id),
  KEY idx_schedules_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_schedules_patient (patient_id),
  KEY idx_schedules_encounter (encounter_id),
  KEY idx_schedules_order_date (event_date),
  KEY idx_schedules_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS slots (
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
  KEY idx_slots_tenant_hospital (tenant_id, hospital_id),
  KEY idx_slots_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_slots_patient (patient_id),
  KEY idx_slots_encounter (encounter_id),
  KEY idx_slots_order_date (event_date),
  KEY idx_slots_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_slots (
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
  KEY idx_appointment_slots_tenant_hospital (tenant_id, hospital_id),
  KEY idx_appointment_slots_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_appointment_slots_patient (patient_id),
  KEY idx_appointment_slots_encounter (encounter_id),
  KEY idx_appointment_slots_order_date (event_date),
  KEY idx_appointment_slots_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_participants (
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
  KEY idx_appointment_participants_tenant_hospital (tenant_id, hospital_id),
  KEY idx_appointment_participants_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_appointment_participants_patient (patient_id),
  KEY idx_appointment_participants_encounter (encounter_id),
  KEY idx_appointment_participants_order_date (event_date),
  KEY idx_appointment_participants_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_status_history (
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
  KEY idx_appointment_status_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_appointment_status_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_appointment_status_history_patient (patient_id),
  KEY idx_appointment_status_history_encounter (encounter_id),
  KEY idx_appointment_status_history_order_date (event_date),
  KEY idx_appointment_status_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_reminders (
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
  KEY idx_appointment_reminders_tenant_hospital (tenant_id, hospital_id),
  KEY idx_appointment_reminders_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_appointment_reminders_patient (patient_id),
  KEY idx_appointment_reminders_encounter (encounter_id),
  KEY idx_appointment_reminders_order_date (event_date),
  KEY idx_appointment_reminders_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_cancellations (
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
  KEY idx_appointment_cancellations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_appointment_cancellations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_appointment_cancellations_patient (patient_id),
  KEY idx_appointment_cancellations_encounter (encounter_id),
  KEY idx_appointment_cancellations_order_date (event_date),
  KEY idx_appointment_cancellations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointment_waitlist (
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
  KEY idx_appointment_waitlist_tenant_hospital (tenant_id, hospital_id),
  KEY idx_appointment_waitlist_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_appointment_waitlist_patient (patient_id),
  KEY idx_appointment_waitlist_encounter (encounter_id),
  KEY idx_appointment_waitlist_order_date (event_date),
  KEY idx_appointment_waitlist_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 05 Encounter / OPD / Emergency
-- ============================================================================================


CREATE TABLE IF NOT EXISTS encounters (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS encounter_participants (
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
  KEY idx_encounter_participants_tenant_hospital (tenant_id, hospital_id),
  KEY idx_encounter_participants_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_encounter_participants_patient (patient_id),
  KEY idx_encounter_participants_encounter (encounter_id),
  KEY idx_encounter_participants_order_date (event_date),
  KEY idx_encounter_participants_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS encounter_locations (
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
  KEY idx_encounter_locations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_encounter_locations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_encounter_locations_patient (patient_id),
  KEY idx_encounter_locations_encounter (encounter_id),
  KEY idx_encounter_locations_order_date (event_date),
  KEY idx_encounter_locations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS encounter_status_history (
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
  KEY idx_encounter_status_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_encounter_status_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_encounter_status_history_patient (patient_id),
  KEY idx_encounter_status_history_encounter (encounter_id),
  KEY idx_encounter_status_history_order_date (event_date),
  KEY idx_encounter_status_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS episode_of_care (
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
  KEY idx_episode_of_care_tenant_hospital (tenant_id, hospital_id),
  KEY idx_episode_of_care_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_episode_of_care_patient (patient_id),
  KEY idx_episode_of_care_encounter (encounter_id),
  KEY idx_episode_of_care_order_date (event_date),
  KEY idx_episode_of_care_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS visit_triage (
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
  KEY idx_visit_triage_tenant_hospital (tenant_id, hospital_id),
  KEY idx_visit_triage_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_visit_triage_patient (patient_id),
  KEY idx_visit_triage_encounter (encounter_id),
  KEY idx_visit_triage_order_date (event_date),
  KEY idx_visit_triage_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_flags (
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
  KEY idx_patient_flags_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_flags_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_flags_patient (patient_id),
  KEY idx_patient_flags_encounter (encounter_id),
  KEY idx_patient_flags_order_date (event_date),
  KEY idx_patient_flags_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS encounter_tasks (
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
  KEY idx_encounter_tasks_tenant_hospital (tenant_id, hospital_id),
  KEY idx_encounter_tasks_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_encounter_tasks_patient (patient_id),
  KEY idx_encounter_tasks_encounter (encounter_id),
  KEY idx_encounter_tasks_order_date (event_date),
  KEY idx_encounter_tasks_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 06 Clinical EMR / Doctor Workbench
-- ============================================================================================


CREATE TABLE IF NOT EXISTS vitals (
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
  KEY idx_vitals_tenant_hospital (tenant_id, hospital_id),
  KEY idx_vitals_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_vitals_patient (patient_id),
  KEY idx_vitals_encounter (encounter_id),
  KEY idx_vitals_order_date (event_date),
  KEY idx_vitals_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnoses (
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
  KEY idx_diagnoses_tenant_hospital (tenant_id, hospital_id),
  KEY idx_diagnoses_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_diagnoses_patient (patient_id),
  KEY idx_diagnoses_encounter (encounter_id),
  KEY idx_diagnoses_order_date (event_date),
  KEY idx_diagnoses_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS problem_lists (
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
  KEY idx_problem_lists_tenant_hospital (tenant_id, hospital_id),
  KEY idx_problem_lists_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_problem_lists_patient (patient_id),
  KEY idx_problem_lists_encounter (encounter_id),
  KEY idx_problem_lists_order_date (event_date),
  KEY idx_problem_lists_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinical_notes (
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
  KEY idx_clinical_notes_tenant_hospital (tenant_id, hospital_id),
  KEY idx_clinical_notes_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_clinical_notes_patient (patient_id),
  KEY idx_clinical_notes_encounter (encounter_id),
  KEY idx_clinical_notes_order_date (event_date),
  KEY idx_clinical_notes_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS progress_notes (
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
  KEY idx_progress_notes_tenant_hospital (tenant_id, hospital_id),
  KEY idx_progress_notes_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_progress_notes_patient (patient_id),
  KEY idx_progress_notes_encounter (encounter_id),
  KEY idx_progress_notes_order_date (event_date),
  KEY idx_progress_notes_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS physical_examinations (
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
  KEY idx_physical_examinations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_physical_examinations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_physical_examinations_patient (patient_id),
  KEY idx_physical_examinations_encounter (encounter_id),
  KEY idx_physical_examinations_order_date (event_date),
  KEY idx_physical_examinations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_of_systems (
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
  KEY idx_review_of_systems_tenant_hospital (tenant_id, hospital_id),
  KEY idx_review_of_systems_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_review_of_systems_patient (patient_id),
  KEY idx_review_of_systems_encounter (encounter_id),
  KEY idx_review_of_systems_order_date (event_date),
  KEY idx_review_of_systems_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS family_history (
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
  KEY idx_family_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_family_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_family_history_patient (patient_id),
  KEY idx_family_history_encounter (encounter_id),
  KEY idx_family_history_order_date (event_date),
  KEY idx_family_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_history (
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
  KEY idx_social_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_social_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_social_history_patient (patient_id),
  KEY idx_social_history_encounter (encounter_id),
  KEY idx_social_history_order_date (event_date),
  KEY idx_social_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS procedures (
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
  KEY idx_procedures_tenant_hospital (tenant_id, hospital_id),
  KEY idx_procedures_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_procedures_patient (patient_id),
  KEY idx_procedures_encounter (encounter_id),
  KEY idx_procedures_order_date (event_date),
  KEY idx_procedures_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_plans (
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
  KEY idx_care_plans_tenant_hospital (tenant_id, hospital_id),
  KEY idx_care_plans_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_care_plans_patient (patient_id),
  KEY idx_care_plans_encounter (encounter_id),
  KEY idx_care_plans_order_date (event_date),
  KEY idx_care_plans_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS care_plan_goals (
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
  KEY idx_care_plan_goals_tenant_hospital (tenant_id, hospital_id),
  KEY idx_care_plan_goals_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_care_plan_goals_patient (patient_id),
  KEY idx_care_plan_goals_encounter (encounter_id),
  KEY idx_care_plan_goals_order_date (event_date),
  KEY idx_care_plan_goals_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS risk_assessments (
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
  KEY idx_risk_assessments_tenant_hospital (tenant_id, hospital_id),
  KEY idx_risk_assessments_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_risk_assessments_patient (patient_id),
  KEY idx_risk_assessments_encounter (encounter_id),
  KEY idx_risk_assessments_order_date (event_date),
  KEY idx_risk_assessments_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinical_impressions (
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
  KEY idx_clinical_impressions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_clinical_impressions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_clinical_impressions_patient (patient_id),
  KEY idx_clinical_impressions_encounter (encounter_id),
  KEY idx_clinical_impressions_order_date (event_date),
  KEY idx_clinical_impressions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS adverse_events (
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
  KEY idx_adverse_events_tenant_hospital (tenant_id, hospital_id),
  KEY idx_adverse_events_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_adverse_events_patient (patient_id),
  KEY idx_adverse_events_encounter (encounter_id),
  KEY idx_adverse_events_order_date (event_date),
  KEY idx_adverse_events_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detected_issues (
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
  KEY idx_detected_issues_tenant_hospital (tenant_id, hospital_id),
  KEY idx_detected_issues_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_detected_issues_patient (patient_id),
  KEY idx_detected_issues_encounter (encounter_id),
  KEY idx_detected_issues_order_date (event_date),
  KEY idx_detected_issues_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinical_documents (
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
  KEY idx_clinical_documents_tenant_hospital (tenant_id, hospital_id),
  KEY idx_clinical_documents_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_clinical_documents_patient (patient_id),
  KEY idx_clinical_documents_encounter (encounter_id),
  KEY idx_clinical_documents_order_date (event_date),
  KEY idx_clinical_documents_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_alerts (
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
  KEY idx_patient_alerts_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_alerts_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_alerts_patient (patient_id),
  KEY idx_patient_alerts_encounter (encounter_id),
  KEY idx_patient_alerts_order_date (event_date),
  KEY idx_patient_alerts_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clinical_orders (
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
  KEY idx_clinical_orders_tenant_hospital (tenant_id, hospital_id),
  KEY idx_clinical_orders_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_clinical_orders_patient (patient_id),
  KEY idx_clinical_orders_encounter (encounter_id),
  KEY idx_clinical_orders_order_date (event_date),
  KEY idx_clinical_orders_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 07 ICU / Critical Care
-- ============================================================================================


CREATE TABLE IF NOT EXISTS icu_units (
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
  KEY idx_icu_units_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_units_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_units_patient (patient_id),
  KEY idx_icu_units_encounter (encounter_id),
  KEY idx_icu_units_order_date (event_date),
  KEY idx_icu_units_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_beds (
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
  KEY idx_icu_beds_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_beds_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_beds_patient (patient_id),
  KEY idx_icu_beds_encounter (encounter_id),
  KEY idx_icu_beds_order_date (event_date),
  KEY idx_icu_beds_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_admissions (
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
  KEY idx_icu_admissions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_admissions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_admissions_patient (patient_id),
  KEY idx_icu_admissions_encounter (encounter_id),
  KEY idx_icu_admissions_order_date (event_date),
  KEY idx_icu_admissions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_rounds (
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
  KEY idx_icu_rounds_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_rounds_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_rounds_patient (patient_id),
  KEY idx_icu_rounds_encounter (encounter_id),
  KEY idx_icu_rounds_order_date (event_date),
  KEY idx_icu_rounds_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_vitals_charting (
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
  KEY idx_icu_vitals_charting_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_vitals_charting_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_vitals_charting_patient (patient_id),
  KEY idx_icu_vitals_charting_encounter (encounter_id),
  KEY idx_icu_vitals_charting_order_date (event_date),
  KEY idx_icu_vitals_charting_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_intake_output_chart (
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
  KEY idx_icu_intake_output_chart_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_intake_output_chart_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_intake_output_chart_patient (patient_id),
  KEY idx_icu_intake_output_chart_encounter (encounter_id),
  KEY idx_icu_intake_output_chart_order_date (event_date),
  KEY idx_icu_intake_output_chart_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_medication_infusions (
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
  KEY idx_icu_medication_infusions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_medication_infusions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_medication_infusions_patient (patient_id),
  KEY idx_icu_medication_infusions_encounter (encounter_id),
  KEY idx_icu_medication_infusions_order_date (event_date),
  KEY idx_icu_medication_infusions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_ventilator_settings (
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
  KEY idx_icu_ventilator_settings_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_ventilator_settings_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_ventilator_settings_patient (patient_id),
  KEY idx_icu_ventilator_settings_encounter (encounter_id),
  KEY idx_icu_ventilator_settings_order_date (event_date),
  KEY idx_icu_ventilator_settings_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_device_monitoring (
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
  KEY idx_icu_device_monitoring_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_device_monitoring_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_device_monitoring_patient (patient_id),
  KEY idx_icu_device_monitoring_encounter (encounter_id),
  KEY idx_icu_device_monitoring_order_date (event_date),
  KEY idx_icu_device_monitoring_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_nursing_observations (
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
  KEY idx_icu_nursing_observations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_nursing_observations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_nursing_observations_patient (patient_id),
  KEY idx_icu_nursing_observations_encounter (encounter_id),
  KEY idx_icu_nursing_observations_order_date (event_date),
  KEY idx_icu_nursing_observations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_doctor_notes (
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
  KEY idx_icu_doctor_notes_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_doctor_notes_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_doctor_notes_patient (patient_id),
  KEY idx_icu_doctor_notes_encounter (encounter_id),
  KEY idx_icu_doctor_notes_order_date (event_date),
  KEY idx_icu_doctor_notes_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_score_assessments (
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
  KEY idx_icu_score_assessments_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_score_assessments_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_score_assessments_patient (patient_id),
  KEY idx_icu_score_assessments_encounter (encounter_id),
  KEY idx_icu_score_assessments_order_date (event_date),
  KEY idx_icu_score_assessments_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_care_plans (
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
  KEY idx_icu_care_plans_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_care_plans_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_care_plans_patient (patient_id),
  KEY idx_icu_care_plans_encounter (encounter_id),
  KEY idx_icu_care_plans_order_date (event_date),
  KEY idx_icu_care_plans_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_shift_handover (
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
  KEY idx_icu_shift_handover_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_shift_handover_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_shift_handover_patient (patient_id),
  KEY idx_icu_shift_handover_encounter (encounter_id),
  KEY idx_icu_shift_handover_order_date (event_date),
  KEY idx_icu_shift_handover_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_discharge_transfer (
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
  KEY idx_icu_discharge_transfer_tenant_hospital (tenant_id, hospital_id),
  KEY idx_icu_discharge_transfer_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_icu_discharge_transfer_patient (patient_id),
  KEY idx_icu_discharge_transfer_encounter (encounter_id),
  KEY idx_icu_discharge_transfer_order_date (event_date),
  KEY idx_icu_discharge_transfer_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 08 Prescription / Medication Orders
-- ============================================================================================


CREATE TABLE IF NOT EXISTS medicine_master (
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
  KEY idx_medicine_master_tenant_hospital (tenant_id, hospital_id),
  KEY idx_medicine_master_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_medicine_master_patient (patient_id),
  KEY idx_medicine_master_encounter (encounter_id),
  KEY idx_medicine_master_order_date (event_date),
  KEY idx_medicine_master_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medicine_categories (
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
  KEY idx_medicine_categories_tenant_hospital (tenant_id, hospital_id),
  KEY idx_medicine_categories_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_medicine_categories_patient (patient_id),
  KEY idx_medicine_categories_encounter (encounter_id),
  KEY idx_medicine_categories_order_date (event_date),
  KEY idx_medicine_categories_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medication_knowledge (
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
  KEY idx_medication_knowledge_tenant_hospital (tenant_id, hospital_id),
  KEY idx_medication_knowledge_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_medication_knowledge_patient (patient_id),
  KEY idx_medication_knowledge_encounter (encounter_id),
  KEY idx_medication_knowledge_order_date (event_date),
  KEY idx_medication_knowledge_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medication_instructions (
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
  KEY idx_medication_instructions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_medication_instructions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_medication_instructions_patient (patient_id),
  KEY idx_medication_instructions_encounter (encounter_id),
  KEY idx_medication_instructions_order_date (event_date),
  KEY idx_medication_instructions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medication_statements (
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
  KEY idx_medication_statements_tenant_hospital (tenant_id, hospital_id),
  KEY idx_medication_statements_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_medication_statements_patient (patient_id),
  KEY idx_medication_statements_encounter (encounter_id),
  KEY idx_medication_statements_order_date (event_date),
  KEY idx_medication_statements_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medication_administration_records (
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
  KEY idx_medication_administration_records_tenant_hospital (tenant_id, hospital_id),
  KEY idx_medication_administration_records_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_medication_administration_records_patient (patient_id),
  KEY idx_medication_administration_records_encounter (encounter_id),
  KEY idx_medication_administration_records_order_date (event_date),
  KEY idx_medication_administration_records_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS immunizations (
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
  KEY idx_immunizations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_immunizations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_immunizations_patient (patient_id),
  KEY idx_immunizations_encounter (encounter_id),
  KEY idx_immunizations_order_date (event_date),
  KEY idx_immunizations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS immunization_recommendations (
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
  KEY idx_immunization_recommendations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_immunization_recommendations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_immunization_recommendations_patient (patient_id),
  KEY idx_immunization_recommendations_encounter (encounter_id),
  KEY idx_immunization_recommendations_order_date (event_date),
  KEY idx_immunization_recommendations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prescriptions (
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
  KEY idx_prescriptions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_prescriptions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_prescriptions_patient (patient_id),
  KEY idx_prescriptions_encounter (encounter_id),
  KEY idx_prescriptions_order_date (event_date),
  KEY idx_prescriptions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prescription_items (
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
  KEY idx_prescription_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_prescription_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_prescription_items_patient (patient_id),
  KEY idx_prescription_items_encounter (encounter_id),
  KEY idx_prescription_items_order_date (event_date),
  KEY idx_prescription_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 09 Pharmacy / Inventory / Dispensing
-- ============================================================================================


CREATE TABLE IF NOT EXISTS medicine_batches (
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
  KEY idx_medicine_batches_tenant_hospital (tenant_id, hospital_id),
  KEY idx_medicine_batches_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_medicine_batches_patient (patient_id),
  KEY idx_medicine_batches_encounter (encounter_id),
  KEY idx_medicine_batches_order_date (event_date),
  KEY idx_medicine_batches_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_stock (
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
  KEY idx_pharmacy_stock_tenant_hospital (tenant_id, hospital_id),
  KEY idx_pharmacy_stock_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_pharmacy_stock_patient (patient_id),
  KEY idx_pharmacy_stock_encounter (encounter_id),
  KEY idx_pharmacy_stock_order_date (event_date),
  KEY idx_pharmacy_stock_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_movements (
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
  KEY idx_stock_movements_tenant_hospital (tenant_id, hospital_id),
  KEY idx_stock_movements_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_stock_movements_patient (patient_id),
  KEY idx_stock_movements_encounter (encounter_id),
  KEY idx_stock_movements_order_date (event_date),
  KEY idx_stock_movements_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_dispense (
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
  KEY idx_pharmacy_dispense_tenant_hospital (tenant_id, hospital_id),
  KEY idx_pharmacy_dispense_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_pharmacy_dispense_patient (patient_id),
  KEY idx_pharmacy_dispense_encounter (encounter_id),
  KEY idx_pharmacy_dispense_order_date (event_date),
  KEY idx_pharmacy_dispense_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_dispense_items (
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
  KEY idx_pharmacy_dispense_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_pharmacy_dispense_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_pharmacy_dispense_items_patient (patient_id),
  KEY idx_pharmacy_dispense_items_encounter (encounter_id),
  KEY idx_pharmacy_dispense_items_order_date (event_date),
  KEY idx_pharmacy_dispense_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_sale_items (
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
  KEY idx_pharmacy_sale_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_pharmacy_sale_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_pharmacy_sale_items_patient (patient_id),
  KEY idx_pharmacy_sale_items_encounter (encounter_id),
  KEY idx_pharmacy_sale_items_order_date (event_date),
  KEY idx_pharmacy_sale_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_returns (
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
  KEY idx_pharmacy_returns_tenant_hospital (tenant_id, hospital_id),
  KEY idx_pharmacy_returns_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_pharmacy_returns_patient (patient_id),
  KEY idx_pharmacy_returns_encounter (encounter_id),
  KEY idx_pharmacy_returns_order_date (event_date),
  KEY idx_pharmacy_returns_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_return_items (
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
  KEY idx_pharmacy_return_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_pharmacy_return_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_pharmacy_return_items_patient (patient_id),
  KEY idx_pharmacy_return_items_encounter (encounter_id),
  KEY idx_pharmacy_return_items_order_date (event_date),
  KEY idx_pharmacy_return_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_orders (
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
  KEY idx_purchase_orders_tenant_hospital (tenant_id, hospital_id),
  KEY idx_purchase_orders_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_purchase_orders_patient (patient_id),
  KEY idx_purchase_orders_encounter (encounter_id),
  KEY idx_purchase_orders_order_date (event_date),
  KEY idx_purchase_orders_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_order_items (
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
  KEY idx_purchase_order_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_purchase_order_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_purchase_order_items_patient (patient_id),
  KEY idx_purchase_order_items_encounter (encounter_id),
  KEY idx_purchase_order_items_order_date (event_date),
  KEY idx_purchase_order_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS goods_receipts (
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
  KEY idx_goods_receipts_tenant_hospital (tenant_id, hospital_id),
  KEY idx_goods_receipts_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_goods_receipts_patient (patient_id),
  KEY idx_goods_receipts_encounter (encounter_id),
  KEY idx_goods_receipts_order_date (event_date),
  KEY idx_goods_receipts_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS goods_receipt_items (
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
  KEY idx_goods_receipt_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_goods_receipt_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_goods_receipt_items_patient (patient_id),
  KEY idx_goods_receipt_items_encounter (encounter_id),
  KEY idx_goods_receipt_items_order_date (event_date),
  KEY idx_goods_receipt_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_items (
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
  KEY idx_inventory_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_inventory_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_inventory_items_patient (patient_id),
  KEY idx_inventory_items_encounter (encounter_id),
  KEY idx_inventory_items_order_date (event_date),
  KEY idx_inventory_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_reports (
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
  KEY idx_inventory_reports_tenant_hospital (tenant_id, hospital_id),
  KEY idx_inventory_reports_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_inventory_reports_patient (patient_id),
  KEY idx_inventory_reports_encounter (encounter_id),
  KEY idx_inventory_reports_order_date (event_date),
  KEY idx_inventory_reports_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supply_requests (
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
  KEY idx_supply_requests_tenant_hospital (tenant_id, hospital_id),
  KEY idx_supply_requests_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_supply_requests_patient (patient_id),
  KEY idx_supply_requests_encounter (encounter_id),
  KEY idx_supply_requests_order_date (event_date),
  KEY idx_supply_requests_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supply_deliveries (
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
  KEY idx_supply_deliveries_tenant_hospital (tenant_id, hospital_id),
  KEY idx_supply_deliveries_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_supply_deliveries_patient (patient_id),
  KEY idx_supply_deliveries_encounter (encounter_id),
  KEY idx_supply_deliveries_order_date (event_date),
  KEY idx_supply_deliveries_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_sales (
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
  KEY idx_pharmacy_sales_tenant_hospital (tenant_id, hospital_id),
  KEY idx_pharmacy_sales_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_pharmacy_sales_patient (patient_id),
  KEY idx_pharmacy_sales_encounter (encounter_id),
  KEY idx_pharmacy_sales_order_date (event_date),
  KEY idx_pharmacy_sales_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 10 Lab / Diagnostics
-- ============================================================================================


CREATE TABLE IF NOT EXISTS lab_test_master (
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
  KEY idx_lab_test_master_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_test_master_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_test_master_patient (patient_id),
  KEY idx_lab_test_master_encounter (encounter_id),
  KEY idx_lab_test_master_order_date (event_date),
  KEY idx_lab_test_master_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_test_parameters (
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
  KEY idx_lab_test_parameters_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_test_parameters_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_test_parameters_patient (patient_id),
  KEY idx_lab_test_parameters_encounter (encounter_id),
  KEY idx_lab_test_parameters_order_date (event_date),
  KEY idx_lab_test_parameters_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS observation_definitions (
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
  KEY idx_observation_definitions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_observation_definitions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_observation_definitions_patient (patient_id),
  KEY idx_observation_definitions_encounter (encounter_id),
  KEY idx_observation_definitions_order_date (event_date),
  KEY idx_observation_definitions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS specimen_definitions (
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
  KEY idx_specimen_definitions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_specimen_definitions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_specimen_definitions_patient (patient_id),
  KEY idx_specimen_definitions_encounter (encounter_id),
  KEY idx_specimen_definitions_order_date (event_date),
  KEY idx_specimen_definitions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_order_items (
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
  KEY idx_lab_order_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_order_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_order_items_patient (patient_id),
  KEY idx_lab_order_items_encounter (encounter_id),
  KEY idx_lab_order_items_order_date (event_date),
  KEY idx_lab_order_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_samples (
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
  KEY idx_lab_samples_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_samples_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_samples_patient (patient_id),
  KEY idx_lab_samples_encounter (encounter_id),
  KEY idx_lab_samples_order_date (event_date),
  KEY idx_lab_samples_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_results (
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
  KEY idx_lab_results_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_results_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_results_patient (patient_id),
  KEY idx_lab_results_encounter (encounter_id),
  KEY idx_lab_results_order_date (event_date),
  KEY idx_lab_results_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_result_parameters (
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
  KEY idx_lab_result_parameters_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_result_parameters_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_result_parameters_patient (patient_id),
  KEY idx_lab_result_parameters_encounter (encounter_id),
  KEY idx_lab_result_parameters_order_date (event_date),
  KEY idx_lab_result_parameters_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnostic_reports (
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
  KEY idx_diagnostic_reports_tenant_hospital (tenant_id, hospital_id),
  KEY idx_diagnostic_reports_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_diagnostic_reports_patient (patient_id),
  KEY idx_diagnostic_reports_encounter (encounter_id),
  KEY idx_diagnostic_reports_order_date (event_date),
  KEY idx_diagnostic_reports_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_result_review_history (
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
  KEY idx_lab_result_review_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_result_review_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_result_review_history_patient (patient_id),
  KEY idx_lab_result_review_history_encounter (encounter_id),
  KEY idx_lab_result_review_history_order_date (event_date),
  KEY idx_lab_result_review_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS genomic_studies (
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
  KEY idx_genomic_studies_tenant_hospital (tenant_id, hospital_id),
  KEY idx_genomic_studies_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_genomic_studies_patient (patient_id),
  KEY idx_genomic_studies_encounter (encounter_id),
  KEY idx_genomic_studies_order_date (event_date),
  KEY idx_genomic_studies_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS molecular_sequences (
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
  KEY idx_molecular_sequences_tenant_hospital (tenant_id, hospital_id),
  KEY idx_molecular_sequences_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_molecular_sequences_patient (patient_id),
  KEY idx_molecular_sequences_encounter (encounter_id),
  KEY idx_molecular_sequences_order_date (event_date),
  KEY idx_molecular_sequences_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_orders (
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
  KEY idx_lab_orders_tenant_hospital (tenant_id, hospital_id),
  KEY idx_lab_orders_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_lab_orders_patient (patient_id),
  KEY idx_lab_orders_encounter (encounter_id),
  KEY idx_lab_orders_order_date (event_date),
  KEY idx_lab_orders_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 11 Radiology / Imaging
-- ============================================================================================


CREATE TABLE IF NOT EXISTS radiology_test_master (
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
  KEY idx_radiology_test_master_tenant_hospital (tenant_id, hospital_id),
  KEY idx_radiology_test_master_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_radiology_test_master_patient (patient_id),
  KEY idx_radiology_test_master_encounter (encounter_id),
  KEY idx_radiology_test_master_order_date (event_date),
  KEY idx_radiology_test_master_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radiology_order_items (
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
  KEY idx_radiology_order_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_radiology_order_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_radiology_order_items_patient (patient_id),
  KEY idx_radiology_order_items_encounter (encounter_id),
  KEY idx_radiology_order_items_order_date (event_date),
  KEY idx_radiology_order_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imaging_studies (
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
  KEY idx_imaging_studies_tenant_hospital (tenant_id, hospital_id),
  KEY idx_imaging_studies_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_imaging_studies_patient (patient_id),
  KEY idx_imaging_studies_encounter (encounter_id),
  KEY idx_imaging_studies_order_date (event_date),
  KEY idx_imaging_studies_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS imaging_selections (
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
  KEY idx_imaging_selections_tenant_hospital (tenant_id, hospital_id),
  KEY idx_imaging_selections_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_imaging_selections_patient (patient_id),
  KEY idx_imaging_selections_encounter (encounter_id),
  KEY idx_imaging_selections_order_date (event_date),
  KEY idx_imaging_selections_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radiology_reports (
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
  KEY idx_radiology_reports_tenant_hospital (tenant_id, hospital_id),
  KEY idx_radiology_reports_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_radiology_reports_patient (patient_id),
  KEY idx_radiology_reports_encounter (encounter_id),
  KEY idx_radiology_reports_order_date (event_date),
  KEY idx_radiology_reports_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radiology_report_review_history (
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
  KEY idx_radiology_report_review_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_radiology_report_review_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_radiology_report_review_history_patient (patient_id),
  KEY idx_radiology_report_review_history_encounter (encounter_id),
  KEY idx_radiology_report_review_history_order_date (event_date),
  KEY idx_radiology_report_review_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radiology_documents (
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
  KEY idx_radiology_documents_tenant_hospital (tenant_id, hospital_id),
  KEY idx_radiology_documents_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_radiology_documents_patient (patient_id),
  KEY idx_radiology_documents_encounter (encounter_id),
  KEY idx_radiology_documents_order_date (event_date),
  KEY idx_radiology_documents_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS radiology_orders (
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
  KEY idx_radiology_orders_tenant_hospital (tenant_id, hospital_id),
  KEY idx_radiology_orders_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_radiology_orders_patient (patient_id),
  KEY idx_radiology_orders_encounter (encounter_id),
  KEY idx_radiology_orders_order_date (event_date),
  KEY idx_radiology_orders_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 12 Billing / Payment / Insurance / Claims
-- ============================================================================================


CREATE TABLE IF NOT EXISTS patient_accounts (
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
  KEY idx_patient_accounts_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_accounts_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_accounts_patient (patient_id),
  KEY idx_patient_accounts_encounter (encounter_id),
  KEY idx_patient_accounts_order_date (event_date),
  KEY idx_patient_accounts_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_invoice_items (
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
  KEY idx_billing_invoice_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_billing_invoice_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_billing_invoice_items_patient (patient_id),
  KEY idx_billing_invoice_items_encounter (encounter_id),
  KEY idx_billing_invoice_items_order_date (event_date),
  KEY idx_billing_invoice_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS charge_items (
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
  KEY idx_charge_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_charge_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_charge_items_patient (patient_id),
  KEY idx_charge_items_encounter (encounter_id),
  KEY idx_charge_items_order_date (event_date),
  KEY idx_charge_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS charge_item_definitions (
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
  KEY idx_charge_item_definitions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_charge_item_definitions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_charge_item_definitions_patient (patient_id),
  KEY idx_charge_item_definitions_encounter (encounter_id),
  KEY idx_charge_item_definitions_order_date (event_date),
  KEY idx_charge_item_definitions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_allocations (
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
  KEY idx_payment_allocations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_payment_allocations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_payment_allocations_patient (patient_id),
  KEY idx_payment_allocations_encounter (encounter_id),
  KEY idx_payment_allocations_order_date (event_date),
  KEY idx_payment_allocations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_notices (
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
  KEY idx_payment_notices_tenant_hospital (tenant_id, hospital_id),
  KEY idx_payment_notices_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_payment_notices_patient (patient_id),
  KEY idx_payment_notices_encounter (encounter_id),
  KEY idx_payment_notices_order_date (event_date),
  KEY idx_payment_notices_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_reconciliations (
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
  KEY idx_payment_reconciliations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_payment_reconciliations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_payment_reconciliations_patient (patient_id),
  KEY idx_payment_reconciliations_encounter (encounter_id),
  KEY idx_payment_reconciliations_order_date (event_date),
  KEY idx_payment_reconciliations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refunds (
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
  KEY idx_refunds_tenant_hospital (tenant_id, hospital_id),
  KEY idx_refunds_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_refunds_patient (patient_id),
  KEY idx_refunds_encounter (encounter_id),
  KEY idx_refunds_order_date (event_date),
  KEY idx_refunds_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insurance_plans (
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
  KEY idx_insurance_plans_tenant_hospital (tenant_id, hospital_id),
  KEY idx_insurance_plans_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_insurance_plans_patient (patient_id),
  KEY idx_insurance_plans_encounter (encounter_id),
  KEY idx_insurance_plans_order_date (event_date),
  KEY idx_insurance_plans_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insurance_policies (
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
  KEY idx_insurance_policies_tenant_hospital (tenant_id, hospital_id),
  KEY idx_insurance_policies_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_insurance_policies_patient (patient_id),
  KEY idx_insurance_policies_encounter (encounter_id),
  KEY idx_insurance_policies_order_date (event_date),
  KEY idx_insurance_policies_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coverage_eligibility_requests (
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
  KEY idx_coverage_eligibility_requests_tenant_hospital (tenant_id, hospital_id),
  KEY idx_coverage_eligibility_requests_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_coverage_eligibility_requests_patient (patient_id),
  KEY idx_coverage_eligibility_requests_encounter (encounter_id),
  KEY idx_coverage_eligibility_requests_order_date (event_date),
  KEY idx_coverage_eligibility_requests_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coverage_eligibility_responses (
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
  KEY idx_coverage_eligibility_responses_tenant_hospital (tenant_id, hospital_id),
  KEY idx_coverage_eligibility_responses_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_coverage_eligibility_responses_patient (patient_id),
  KEY idx_coverage_eligibility_responses_encounter (encounter_id),
  KEY idx_coverage_eligibility_responses_order_date (event_date),
  KEY idx_coverage_eligibility_responses_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insurance_claims (
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
  KEY idx_insurance_claims_tenant_hospital (tenant_id, hospital_id),
  KEY idx_insurance_claims_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_insurance_claims_patient (patient_id),
  KEY idx_insurance_claims_encounter (encounter_id),
  KEY idx_insurance_claims_order_date (event_date),
  KEY idx_insurance_claims_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insurance_claim_items (
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
  KEY idx_insurance_claim_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_insurance_claim_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_insurance_claim_items_patient (patient_id),
  KEY idx_insurance_claim_items_encounter (encounter_id),
  KEY idx_insurance_claim_items_order_date (event_date),
  KEY idx_insurance_claim_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS claim_responses (
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
  KEY idx_claim_responses_tenant_hospital (tenant_id, hospital_id),
  KEY idx_claim_responses_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_claim_responses_patient (patient_id),
  KEY idx_claim_responses_encounter (encounter_id),
  KEY idx_claim_responses_order_date (event_date),
  KEY idx_claim_responses_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS explanation_of_benefits (
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
  KEY idx_explanation_of_benefits_tenant_hospital (tenant_id, hospital_id),
  KEY idx_explanation_of_benefits_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_explanation_of_benefits_patient (patient_id),
  KEY idx_explanation_of_benefits_encounter (encounter_id),
  KEY idx_explanation_of_benefits_order_date (event_date),
  KEY idx_explanation_of_benefits_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS claim_documents (
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
  KEY idx_claim_documents_tenant_hospital (tenant_id, hospital_id),
  KEY idx_claim_documents_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_claim_documents_patient (patient_id),
  KEY idx_claim_documents_encounter (encounter_id),
  KEY idx_claim_documents_order_date (event_date),
  KEY idx_claim_documents_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS claim_status_history (
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
  KEY idx_claim_status_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_claim_status_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_claim_status_history_patient (patient_id),
  KEY idx_claim_status_history_encounter (encounter_id),
  KEY idx_claim_status_history_order_date (event_date),
  KEY idx_claim_status_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contracts (
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
  KEY idx_contracts_tenant_hospital (tenant_id, hospital_id),
  KEY idx_contracts_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_contracts_patient (patient_id),
  KEY idx_contracts_encounter (encounter_id),
  KEY idx_contracts_order_date (event_date),
  KEY idx_contracts_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_invoices (
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
  KEY idx_billing_invoices_tenant_hospital (tenant_id, hospital_id),
  KEY idx_billing_invoices_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_billing_invoices_patient (patient_id),
  KEY idx_billing_invoices_encounter (encounter_id),
  KEY idx_billing_invoices_order_date (event_date),
  KEY idx_billing_invoices_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
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
  KEY idx_payments_tenant_hospital (tenant_id, hospital_id),
  KEY idx_payments_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_payments_patient (patient_id),
  KEY idx_payments_encounter (encounter_id),
  KEY idx_payments_order_date (event_date),
  KEY idx_payments_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 13 IPD / Ward / Room / Bed / Nursing / Discharge
-- ============================================================================================


CREATE TABLE IF NOT EXISTS admissions (
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
  KEY idx_admissions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_admissions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_admissions_patient (patient_id),
  KEY idx_admissions_encounter (encounter_id),
  KEY idx_admissions_order_date (event_date),
  KEY idx_admissions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wards (
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
  KEY idx_wards_tenant_hospital (tenant_id, hospital_id),
  KEY idx_wards_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_wards_patient (patient_id),
  KEY idx_wards_encounter (encounter_id),
  KEY idx_wards_order_date (event_date),
  KEY idx_wards_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rooms (
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
  KEY idx_rooms_tenant_hospital (tenant_id, hospital_id),
  KEY idx_rooms_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_rooms_patient (patient_id),
  KEY idx_rooms_encounter (encounter_id),
  KEY idx_rooms_order_date (event_date),
  KEY idx_rooms_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS beds (
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
  KEY idx_beds_tenant_hospital (tenant_id, hospital_id),
  KEY idx_beds_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_beds_patient (patient_id),
  KEY idx_beds_encounter (encounter_id),
  KEY idx_beds_order_date (event_date),
  KEY idx_beds_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bed_allocations (
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
  KEY idx_bed_allocations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_bed_allocations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_bed_allocations_patient (patient_id),
  KEY idx_bed_allocations_encounter (encounter_id),
  KEY idx_bed_allocations_order_date (event_date),
  KEY idx_bed_allocations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nursing_notes (
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
  KEY idx_nursing_notes_tenant_hospital (tenant_id, hospital_id),
  KEY idx_nursing_notes_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_nursing_notes_patient (patient_id),
  KEY idx_nursing_notes_encounter (encounter_id),
  KEY idx_nursing_notes_order_date (event_date),
  KEY idx_nursing_notes_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nursing_tasks (
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
  KEY idx_nursing_tasks_tenant_hospital (tenant_id, hospital_id),
  KEY idx_nursing_tasks_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_nursing_tasks_patient (patient_id),
  KEY idx_nursing_tasks_encounter (encounter_id),
  KEY idx_nursing_tasks_order_date (event_date),
  KEY idx_nursing_tasks_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nursing_care_plans (
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
  KEY idx_nursing_care_plans_tenant_hospital (tenant_id, hospital_id),
  KEY idx_nursing_care_plans_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_nursing_care_plans_patient (patient_id),
  KEY idx_nursing_care_plans_encounter (encounter_id),
  KEY idx_nursing_care_plans_order_date (event_date),
  KEY idx_nursing_care_plans_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discharge_plans (
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
  KEY idx_discharge_plans_tenant_hospital (tenant_id, hospital_id),
  KEY idx_discharge_plans_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_discharge_plans_patient (patient_id),
  KEY idx_discharge_plans_encounter (encounter_id),
  KEY idx_discharge_plans_order_date (event_date),
  KEY idx_discharge_plans_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discharge_summaries (
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
  KEY idx_discharge_summaries_tenant_hospital (tenant_id, hospital_id),
  KEY idx_discharge_summaries_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_discharge_summaries_patient (patient_id),
  KEY idx_discharge_summaries_encounter (encounter_id),
  KEY idx_discharge_summaries_order_date (event_date),
  KEY idx_discharge_summaries_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nutrition_orders (
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
  KEY idx_nutrition_orders_tenant_hospital (tenant_id, hospital_id),
  KEY idx_nutrition_orders_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_nutrition_orders_patient (patient_id),
  KEY idx_nutrition_orders_encounter (encounter_id),
  KEY idx_nutrition_orders_order_date (event_date),
  KEY idx_nutrition_orders_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nutrition_intakes (
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
  KEY idx_nutrition_intakes_tenant_hospital (tenant_id, hospital_id),
  KEY idx_nutrition_intakes_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_nutrition_intakes_patient (patient_id),
  KEY idx_nutrition_intakes_encounter (encounter_id),
  KEY idx_nutrition_intakes_order_date (event_date),
  KEY idx_nutrition_intakes_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 14 Surgery / OT / Anesthesia
-- ============================================================================================


CREATE TABLE IF NOT EXISTS operation_theatres (
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
  KEY idx_operation_theatres_tenant_hospital (tenant_id, hospital_id),
  KEY idx_operation_theatres_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_operation_theatres_patient (patient_id),
  KEY idx_operation_theatres_encounter (encounter_id),
  KEY idx_operation_theatres_order_date (event_date),
  KEY idx_operation_theatres_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS surgery_cases (
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
  KEY idx_surgery_cases_tenant_hospital (tenant_id, hospital_id),
  KEY idx_surgery_cases_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_surgery_cases_patient (patient_id),
  KEY idx_surgery_cases_encounter (encounter_id),
  KEY idx_surgery_cases_order_date (event_date),
  KEY idx_surgery_cases_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS surgery_team_members (
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
  KEY idx_surgery_team_members_tenant_hospital (tenant_id, hospital_id),
  KEY idx_surgery_team_members_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_surgery_team_members_patient (patient_id),
  KEY idx_surgery_team_members_encounter (encounter_id),
  KEY idx_surgery_team_members_order_date (event_date),
  KEY idx_surgery_team_members_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS surgery_checklists (
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
  KEY idx_surgery_checklists_tenant_hospital (tenant_id, hospital_id),
  KEY idx_surgery_checklists_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_surgery_checklists_patient (patient_id),
  KEY idx_surgery_checklists_encounter (encounter_id),
  KEY idx_surgery_checklists_order_date (event_date),
  KEY idx_surgery_checklists_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS anesthesia_records (
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
  KEY idx_anesthesia_records_tenant_hospital (tenant_id, hospital_id),
  KEY idx_anesthesia_records_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_anesthesia_records_patient (patient_id),
  KEY idx_anesthesia_records_encounter (encounter_id),
  KEY idx_anesthesia_records_order_date (event_date),
  KEY idx_anesthesia_records_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS surgery_notes (
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
  KEY idx_surgery_notes_tenant_hospital (tenant_id, hospital_id),
  KEY idx_surgery_notes_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_surgery_notes_patient (patient_id),
  KEY idx_surgery_notes_encounter (encounter_id),
  KEY idx_surgery_notes_order_date (event_date),
  KEY idx_surgery_notes_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_operation_notes (
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
  KEY idx_post_operation_notes_tenant_hospital (tenant_id, hospital_id),
  KEY idx_post_operation_notes_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_post_operation_notes_patient (patient_id),
  KEY idx_post_operation_notes_encounter (encounter_id),
  KEY idx_post_operation_notes_order_date (event_date),
  KEY idx_post_operation_notes_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS procedure_devices (
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
  KEY idx_procedure_devices_tenant_hospital (tenant_id, hospital_id),
  KEY idx_procedure_devices_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_procedure_devices_patient (patient_id),
  KEY idx_procedure_devices_encounter (encounter_id),
  KEY idx_procedure_devices_order_date (event_date),
  KEY idx_procedure_devices_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS body_structures (
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
  KEY idx_body_structures_tenant_hospital (tenant_id, hospital_id),
  KEY idx_body_structures_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_body_structures_patient (patient_id),
  KEY idx_body_structures_encounter (encounter_id),
  KEY idx_body_structures_order_date (event_date),
  KEY idx_body_structures_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 15 Emergency / Ambulance / Transport
-- ============================================================================================


CREATE TABLE IF NOT EXISTS emergency_cases (
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
  KEY idx_emergency_cases_tenant_hospital (tenant_id, hospital_id),
  KEY idx_emergency_cases_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_emergency_cases_patient (patient_id),
  KEY idx_emergency_cases_encounter (encounter_id),
  KEY idx_emergency_cases_order_date (event_date),
  KEY idx_emergency_cases_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS triage_records (
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
  KEY idx_triage_records_tenant_hospital (tenant_id, hospital_id),
  KEY idx_triage_records_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_triage_records_patient (patient_id),
  KEY idx_triage_records_encounter (encounter_id),
  KEY idx_triage_records_order_date (event_date),
  KEY idx_triage_records_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ambulance_requests (
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
  KEY idx_ambulance_requests_tenant_hospital (tenant_id, hospital_id),
  KEY idx_ambulance_requests_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_ambulance_requests_patient (patient_id),
  KEY idx_ambulance_requests_encounter (encounter_id),
  KEY idx_ambulance_requests_order_date (event_date),
  KEY idx_ambulance_requests_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ambulance_dispatches (
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
  KEY idx_ambulance_dispatches_tenant_hospital (tenant_id, hospital_id),
  KEY idx_ambulance_dispatches_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_ambulance_dispatches_patient (patient_id),
  KEY idx_ambulance_dispatches_encounter (encounter_id),
  KEY idx_ambulance_dispatches_order_date (event_date),
  KEY idx_ambulance_dispatches_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ambulance_tracking (
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
  KEY idx_ambulance_tracking_tenant_hospital (tenant_id, hospital_id),
  KEY idx_ambulance_tracking_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_ambulance_tracking_patient (patient_id),
  KEY idx_ambulance_tracking_encounter (encounter_id),
  KEY idx_ambulance_tracking_order_date (event_date),
  KEY idx_ambulance_tracking_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_transports (
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
  KEY idx_patient_transports_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_transports_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_transports_patient (patient_id),
  KEY idx_patient_transports_encounter (encounter_id),
  KEY idx_patient_transports_order_date (event_date),
  KEY idx_patient_transports_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS emergency_observations (
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
  KEY idx_emergency_observations_tenant_hospital (tenant_id, hospital_id),
  KEY idx_emergency_observations_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_emergency_observations_patient (patient_id),
  KEY idx_emergency_observations_encounter (encounter_id),
  KEY idx_emergency_observations_order_date (event_date),
  KEY idx_emergency_observations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 16 Documents / Forms / Questionnaires
-- ============================================================================================


CREATE TABLE IF NOT EXISTS documents (
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
  KEY idx_documents_tenant_hospital (tenant_id, hospital_id),
  KEY idx_documents_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_documents_patient (patient_id),
  KEY idx_documents_encounter (encounter_id),
  KEY idx_documents_order_date (event_date),
  KEY idx_documents_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_versions (
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
  KEY idx_document_versions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_document_versions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_document_versions_patient (patient_id),
  KEY idx_document_versions_encounter (encounter_id),
  KEY idx_document_versions_order_date (event_date),
  KEY idx_document_versions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_access_logs (
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
  KEY idx_document_access_logs_tenant_hospital (tenant_id, hospital_id),
  KEY idx_document_access_logs_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_document_access_logs_patient (patient_id),
  KEY idx_document_access_logs_encounter (encounter_id),
  KEY idx_document_access_logs_order_date (event_date),
  KEY idx_document_access_logs_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_signatures (
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
  KEY idx_document_signatures_tenant_hospital (tenant_id, hospital_id),
  KEY idx_document_signatures_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_document_signatures_patient (patient_id),
  KEY idx_document_signatures_encounter (encounter_id),
  KEY idx_document_signatures_order_date (event_date),
  KEY idx_document_signatures_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS compositions (
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
  KEY idx_compositions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_compositions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_compositions_patient (patient_id),
  KEY idx_compositions_encounter (encounter_id),
  KEY idx_compositions_order_date (event_date),
  KEY idx_compositions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questionnaires (
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
  KEY idx_questionnaires_tenant_hospital (tenant_id, hospital_id),
  KEY idx_questionnaires_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_questionnaires_patient (patient_id),
  KEY idx_questionnaires_encounter (encounter_id),
  KEY idx_questionnaires_order_date (event_date),
  KEY idx_questionnaires_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questionnaire_items (
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
  KEY idx_questionnaire_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_questionnaire_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_questionnaire_items_patient (patient_id),
  KEY idx_questionnaire_items_encounter (encounter_id),
  KEY idx_questionnaire_items_order_date (event_date),
  KEY idx_questionnaire_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questionnaire_responses (
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
  KEY idx_questionnaire_responses_tenant_hospital (tenant_id, hospital_id),
  KEY idx_questionnaire_responses_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_questionnaire_responses_patient (patient_id),
  KEY idx_questionnaire_responses_encounter (encounter_id),
  KEY idx_questionnaire_responses_order_date (event_date),
  KEY idx_questionnaire_responses_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS questionnaire_response_items (
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
  KEY idx_questionnaire_response_items_tenant_hospital (tenant_id, hospital_id),
  KEY idx_questionnaire_response_items_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_questionnaire_response_items_patient (patient_id),
  KEY idx_questionnaire_response_items_encounter (encounter_id),
  KEY idx_questionnaire_response_items_order_date (event_date),
  KEY idx_questionnaire_response_items_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS binary_files (
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
  KEY idx_binary_files_tenant_hospital (tenant_id, hospital_id),
  KEY idx_binary_files_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_binary_files_patient (patient_id),
  KEY idx_binary_files_encounter (encounter_id),
  KEY idx_binary_files_order_date (event_date),
  KEY idx_binary_files_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 17 Communication / Notification / Task
-- ============================================================================================


CREATE TABLE IF NOT EXISTS communications (
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
  KEY idx_communications_tenant_hospital (tenant_id, hospital_id),
  KEY idx_communications_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_communications_patient (patient_id),
  KEY idx_communications_encounter (encounter_id),
  KEY idx_communications_order_date (event_date),
  KEY idx_communications_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communication_requests (
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
  KEY idx_communication_requests_tenant_hospital (tenant_id, hospital_id),
  KEY idx_communication_requests_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_communication_requests_patient (patient_id),
  KEY idx_communication_requests_encounter (encounter_id),
  KEY idx_communication_requests_order_date (event_date),
  KEY idx_communication_requests_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tasks (
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
  KEY idx_tasks_tenant_hospital (tenant_id, hospital_id),
  KEY idx_tasks_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_tasks_patient (patient_id),
  KEY idx_tasks_encounter (encounter_id),
  KEY idx_tasks_order_date (event_date),
  KEY idx_tasks_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS task_history (
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
  KEY idx_task_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_task_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_task_history_patient (patient_id),
  KEY idx_task_history_encounter (encounter_id),
  KEY idx_task_history_order_date (event_date),
  KEY idx_task_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
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
  KEY idx_subscriptions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_subscriptions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_subscriptions_patient (patient_id),
  KEY idx_subscriptions_encounter (encounter_id),
  KEY idx_subscriptions_order_date (event_date),
  KEY idx_subscriptions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscription_events (
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
  KEY idx_subscription_events_tenant_hospital (tenant_id, hospital_id),
  KEY idx_subscription_events_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_subscription_events_patient (patient_id),
  KEY idx_subscription_events_encounter (encounter_id),
  KEY idx_subscription_events_order_date (event_date),
  KEY idx_subscription_events_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_logs (
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
  KEY idx_notification_logs_tenant_hospital (tenant_id, hospital_id),
  KEY idx_notification_logs_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_notification_logs_patient (patient_id),
  KEY idx_notification_logs_encounter (encounter_id),
  KEY idx_notification_logs_order_date (event_date),
  KEY idx_notification_logs_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_headers (
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
  KEY idx_message_headers_tenant_hospital (tenant_id, hospital_id),
  KEY idx_message_headers_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_message_headers_patient (patient_id),
  KEY idx_message_headers_encounter (encounter_id),
  KEY idx_message_headers_order_date (event_date),
  KEY idx_message_headers_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bundles (
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
  KEY idx_bundles_tenant_hospital (tenant_id, hospital_id),
  KEY idx_bundles_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_bundles_patient (patient_id),
  KEY idx_bundles_encounter (encounter_id),
  KEY idx_bundles_order_date (event_date),
  KEY idx_bundles_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 18 Audit / Compliance / Consent / Provenance
-- ============================================================================================


CREATE TABLE IF NOT EXISTS audit_logs (
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
  KEY idx_audit_logs_tenant_hospital (tenant_id, hospital_id),
  KEY idx_audit_logs_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_audit_logs_patient (patient_id),
  KEY idx_audit_logs_encounter (encounter_id),
  KEY idx_audit_logs_order_date (event_date),
  KEY idx_audit_logs_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_login_history (
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
  KEY idx_user_login_history_tenant_hospital (tenant_id, hospital_id),
  KEY idx_user_login_history_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_user_login_history_patient (patient_id),
  KEY idx_user_login_history_encounter (encounter_id),
  KEY idx_user_login_history_order_date (event_date),
  KEY idx_user_login_history_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_record_access_logs (
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
  KEY idx_patient_record_access_logs_tenant_hospital (tenant_id, hospital_id),
  KEY idx_patient_record_access_logs_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_patient_record_access_logs_patient (patient_id),
  KEY idx_patient_record_access_logs_encounter (encounter_id),
  KEY idx_patient_record_access_logs_order_date (event_date),
  KEY idx_patient_record_access_logs_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS consent_records (
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
  KEY idx_consent_records_tenant_hospital (tenant_id, hospital_id),
  KEY idx_consent_records_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_consent_records_patient (patient_id),
  KEY idx_consent_records_encounter (encounter_id),
  KEY idx_consent_records_order_date (event_date),
  KEY idx_consent_records_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS break_glass_access_logs (
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
  KEY idx_break_glass_access_logs_tenant_hospital (tenant_id, hospital_id),
  KEY idx_break_glass_access_logs_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_break_glass_access_logs_patient (patient_id),
  KEY idx_break_glass_access_logs_encounter (encounter_id),
  KEY idx_break_glass_access_logs_order_date (event_date),
  KEY idx_break_glass_access_logs_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS data_export_logs (
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
  KEY idx_data_export_logs_tenant_hospital (tenant_id, hospital_id),
  KEY idx_data_export_logs_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_data_export_logs_patient (patient_id),
  KEY idx_data_export_logs_encounter (encounter_id),
  KEY idx_data_export_logs_order_date (event_date),
  KEY idx_data_export_logs_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS provenance_records (
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
  KEY idx_provenance_records_tenant_hospital (tenant_id, hospital_id),
  KEY idx_provenance_records_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_provenance_records_patient (patient_id),
  KEY idx_provenance_records_encounter (encounter_id),
  KEY idx_provenance_records_order_date (event_date),
  KEY idx_provenance_records_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS security_labels (
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
  KEY idx_security_labels_tenant_hospital (tenant_id, hospital_id),
  KEY idx_security_labels_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_security_labels_patient (patient_id),
  KEY idx_security_labels_encounter (encounter_id),
  KEY idx_security_labels_order_date (event_date),
  KEY idx_security_labels_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS access_permissions (
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
  KEY idx_access_permissions_tenant_hospital (tenant_id, hospital_id),
  KEY idx_access_permissions_branch_status (tenant_id, hospital_id, branch_id, status),
  KEY idx_access_permissions_patient (patient_id),
  KEY idx_access_permissions_encounter (encounter_id),
  KEY idx_access_permissions_order_date (event_date),
  KEY idx_access_permissions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 19 FHIR R5 Interoperability Layer
-- ============================================================================================


CREATE TABLE IF NOT EXISTS fhir_resource_types (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_mapping (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_store (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_versions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_references (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_search_parameters (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_search_index (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_profiles (
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
  KEY idx_fhir_profiles_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_profiles_resource (resource_type, resource_id),
  KEY idx_fhir_profiles_canonical (canonical_url),
  KEY idx_fhir_profiles_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_structure_definitions (
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
  KEY idx_fhir_structure_definitions_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_structure_definitions_resource (resource_type, resource_id),
  KEY idx_fhir_structure_definitions_canonical (canonical_url),
  KEY idx_fhir_structure_definitions_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_implementation_guides (
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
  KEY idx_fhir_implementation_guides_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_implementation_guides_resource (resource_type, resource_id),
  KEY idx_fhir_implementation_guides_canonical (canonical_url),
  KEY idx_fhir_implementation_guides_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_capability_statements (
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
  KEY idx_fhir_capability_statements_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_capability_statements_resource (resource_type, resource_id),
  KEY idx_fhir_capability_statements_canonical (canonical_url),
  KEY idx_fhir_capability_statements_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_operation_definitions (
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
  KEY idx_fhir_operation_definitions_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_operation_definitions_resource (resource_type, resource_id),
  KEY idx_fhir_operation_definitions_canonical (canonical_url),
  KEY idx_fhir_operation_definitions_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_compartment_definitions (
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
  KEY idx_fhir_compartment_definitions_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_compartment_definitions_resource (resource_type, resource_id),
  KEY idx_fhir_compartment_definitions_canonical (canonical_url),
  KEY idx_fhir_compartment_definitions_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_code_systems (
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
  KEY idx_fhir_code_systems_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_code_systems_resource (resource_type, resource_id),
  KEY idx_fhir_code_systems_canonical (canonical_url),
  KEY idx_fhir_code_systems_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_value_sets (
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
  KEY idx_fhir_value_sets_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_value_sets_resource (resource_type, resource_id),
  KEY idx_fhir_value_sets_canonical (canonical_url),
  KEY idx_fhir_value_sets_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_concept_maps (
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
  KEY idx_fhir_concept_maps_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_concept_maps_resource (resource_type, resource_id),
  KEY idx_fhir_concept_maps_canonical (canonical_url),
  KEY idx_fhir_concept_maps_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_terminology_bindings (
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
  KEY idx_fhir_terminology_bindings_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_terminology_bindings_resource (resource_type, resource_id),
  KEY idx_fhir_terminology_bindings_canonical (canonical_url),
  KEY idx_fhir_terminology_bindings_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_validation_results (
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
  KEY idx_fhir_validation_results_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_validation_results_resource (resource_type, resource_id),
  KEY idx_fhir_validation_results_canonical (canonical_url),
  KEY idx_fhir_validation_results_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_sync_status (
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
  KEY idx_fhir_sync_status_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_sync_status_resource (resource_type, resource_id),
  KEY idx_fhir_sync_status_canonical (canonical_url),
  KEY idx_fhir_sync_status_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_api_audit_log (
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
  KEY idx_fhir_api_audit_log_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_api_audit_log_resource (resource_type, resource_id),
  KEY idx_fhir_api_audit_log_canonical (canonical_url),
  KEY idx_fhir_api_audit_log_system_code (system_url, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_element_definitions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_identifiers (
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
  KEY idx_fhir_identifiers_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_identifiers_resource (resource_type, resource_id),
  KEY idx_fhir_identifiers_system_code (system_url, code),
  KEY idx_fhir_identifiers_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_human_names (
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
  KEY idx_fhir_human_names_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_human_names_resource (resource_type, resource_id),
  KEY idx_fhir_human_names_system_code (system_url, code),
  KEY idx_fhir_human_names_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_addresses (
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
  KEY idx_fhir_addresses_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_addresses_resource (resource_type, resource_id),
  KEY idx_fhir_addresses_system_code (system_url, code),
  KEY idx_fhir_addresses_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_contact_points (
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
  KEY idx_fhir_contact_points_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_contact_points_resource (resource_type, resource_id),
  KEY idx_fhir_contact_points_system_code (system_url, code),
  KEY idx_fhir_contact_points_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_codeable_concepts (
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
  KEY idx_fhir_codeable_concepts_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_codeable_concepts_resource (resource_type, resource_id),
  KEY idx_fhir_codeable_concepts_system_code (system_url, code),
  KEY idx_fhir_codeable_concepts_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_codings (
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
  KEY idx_fhir_codings_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_codings_resource (resource_type, resource_id),
  KEY idx_fhir_codings_system_code (system_url, code),
  KEY idx_fhir_codings_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_references (
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
  KEY idx_fhir_references_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_references_resource (resource_type, resource_id),
  KEY idx_fhir_references_system_code (system_url, code),
  KEY idx_fhir_references_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_periods (
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
  KEY idx_fhir_periods_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_periods_resource (resource_type, resource_id),
  KEY idx_fhir_periods_system_code (system_url, code),
  KEY idx_fhir_periods_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_quantities (
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
  KEY idx_fhir_quantities_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_quantities_resource (resource_type, resource_id),
  KEY idx_fhir_quantities_system_code (system_url, code),
  KEY idx_fhir_quantities_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_ranges (
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
  KEY idx_fhir_ranges_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_ranges_resource (resource_type, resource_id),
  KEY idx_fhir_ranges_system_code (system_url, code),
  KEY idx_fhir_ranges_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_ratios (
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
  KEY idx_fhir_ratios_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_ratios_resource (resource_type, resource_id),
  KEY idx_fhir_ratios_system_code (system_url, code),
  KEY idx_fhir_ratios_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_attachments (
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
  KEY idx_fhir_attachments_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_attachments_resource (resource_type, resource_id),
  KEY idx_fhir_attachments_system_code (system_url, code),
  KEY idx_fhir_attachments_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_annotations (
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
  KEY idx_fhir_annotations_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_annotations_resource (resource_type, resource_id),
  KEY idx_fhir_annotations_system_code (system_url, code),
  KEY idx_fhir_annotations_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_timing (
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
  KEY idx_fhir_timing_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_timing_resource (resource_type, resource_id),
  KEY idx_fhir_timing_system_code (system_url, code),
  KEY idx_fhir_timing_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_dosages (
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
  KEY idx_fhir_dosages_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_dosages_resource (resource_type, resource_id),
  KEY idx_fhir_dosages_system_code (system_url, code),
  KEY idx_fhir_dosages_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_money (
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
  KEY idx_fhir_money_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_money_resource (resource_type, resource_id),
  KEY idx_fhir_money_system_code (system_url, code),
  KEY idx_fhir_money_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_sampled_data (
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
  KEY idx_fhir_sampled_data_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_sampled_data_resource (resource_type, resource_id),
  KEY idx_fhir_sampled_data_system_code (system_url, code),
  KEY idx_fhir_sampled_data_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_signatures (
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
  KEY idx_fhir_signatures_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_signatures_resource (resource_type, resource_id),
  KEY idx_fhir_signatures_system_code (system_url, code),
  KEY idx_fhir_signatures_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_extensions (
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
  KEY idx_fhir_extensions_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_extensions_resource (resource_type, resource_id),
  KEY idx_fhir_extensions_system_code (system_url, code),
  KEY idx_fhir_extensions_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_meta (
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
  KEY idx_fhir_meta_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_meta_resource (resource_type, resource_id),
  KEY idx_fhir_meta_system_code (system_url, code),
  KEY idx_fhir_meta_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_narratives (
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
  KEY idx_fhir_narratives_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_narratives_resource (resource_type, resource_id),
  KEY idx_fhir_narratives_system_code (system_url, code),
  KEY idx_fhir_narratives_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_tags (
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
  KEY idx_fhir_resource_tags_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_resource_tags_resource (resource_type, resource_id),
  KEY idx_fhir_resource_tags_system_code (system_url, code),
  KEY idx_fhir_resource_tags_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_security_labels (
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
  KEY idx_fhir_resource_security_labels_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_resource_security_labels_resource (resource_type, resource_id),
  KEY idx_fhir_resource_security_labels_system_code (system_url, code),
  KEY idx_fhir_resource_security_labels_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_resource_profiles (
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
  KEY idx_fhir_resource_profiles_tenant_branch (tenant_id, hospital_id, branch_id),
  KEY idx_fhir_resource_profiles_resource (resource_type, resource_id),
  KEY idx_fhir_resource_profiles_system_code (system_url, code),
  KEY idx_fhir_resource_profiles_created_at (created_at),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 20 HL7 Integration
-- ============================================================================================


CREATE TABLE IF NOT EXISTS hl7_message_log (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_message_error_log (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_external_identifier_mapping (
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
  KEY idx_hl7_external_identifier_mapping_external (external_system, external_identifier),
  KEY idx_hl7_external_identifier_mapping_internal (internal_table_name, internal_record_id),
  KEY idx_hl7_external_identifier_mapping_message (hl7_message_id),
  KEY idx_hl7_external_identifier_mapping_tenant_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_patient_mapping (
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
  KEY idx_hl7_patient_mapping_external (external_system, external_identifier),
  KEY idx_hl7_patient_mapping_internal (internal_table_name, internal_record_id),
  KEY idx_hl7_patient_mapping_message (hl7_message_id),
  KEY idx_hl7_patient_mapping_tenant_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_order_mapping (
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
  KEY idx_hl7_order_mapping_external (external_system, external_identifier),
  KEY idx_hl7_order_mapping_internal (internal_table_name, internal_record_id),
  KEY idx_hl7_order_mapping_message (hl7_message_id),
  KEY idx_hl7_order_mapping_tenant_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_result_mapping (
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
  KEY idx_hl7_result_mapping_external (external_system, external_identifier),
  KEY idx_hl7_result_mapping_internal (internal_table_name, internal_record_id),
  KEY idx_hl7_result_mapping_message (hl7_message_id),
  KEY idx_hl7_result_mapping_tenant_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_segment_store (
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
  KEY idx_hl7_segment_store_external (external_system, external_identifier),
  KEY idx_hl7_segment_store_internal (internal_table_name, internal_record_id),
  KEY idx_hl7_segment_store_message (hl7_message_id),
  KEY idx_hl7_segment_store_tenant_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_acknowledgement_log (
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
  KEY idx_hl7_acknowledgement_log_external (external_system, external_identifier),
  KEY idx_hl7_acknowledgement_log_internal (internal_table_name, internal_record_id),
  KEY idx_hl7_acknowledgement_log_message (hl7_message_id),
  KEY idx_hl7_acknowledgement_log_tenant_branch (tenant_id, hospital_id, branch_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (hl7_message_id) REFERENCES hl7_message_log(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- 21 Reporting / Analytics / AI Command Center
-- ============================================================================================


CREATE TABLE IF NOT EXISTS daily_branch_revenue_summary (
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
  KEY idx_daily_branch_revenue_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_daily_branch_revenue_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_patient_visit_summary (
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
  KEY idx_daily_patient_visit_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_daily_patient_visit_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctor_performance_summary (
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
  KEY idx_doctor_performance_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_doctor_performance_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS department_collection_summary (
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
  KEY idx_department_collection_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_department_collection_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lab_test_volume_summary (
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
  KEY idx_lab_test_volume_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_lab_test_volume_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_stock_snapshot (
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
  KEY idx_pharmacy_stock_snapshot_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_pharmacy_stock_snapshot_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bed_occupancy_summary (
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
  KEY idx_bed_occupancy_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_bed_occupancy_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_journey_summary (
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
  KEY idx_patient_journey_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_patient_journey_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS icu_critical_alert_summary (
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
  KEY idx_icu_critical_alert_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_icu_critical_alert_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS emergency_waiting_time_summary (
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
  KEY idx_emergency_waiting_time_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_emergency_waiting_time_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fhir_sync_summary (
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
  KEY idx_fhir_sync_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_fhir_sync_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hl7_message_summary (
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
  KEY idx_hl7_message_summary_branch_date (tenant_id, hospital_id, branch_id, report_date),
  KEY idx_hl7_message_summary_dimension (dimension_key),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE RESTRICT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================================
-- DUMMY DATA INSERTS - DEPENDENCY SAFE ORDER
-- ============================================================================================



-- ============================================================================================
-- Seed data: 01 Master Data / Terminology
-- ============================================================================================


INSERT IGNORE INTO gender_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'GENDER_MASTER_001', 'Primary Gender Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"gender_master"}' AS JSON)),
(2, 'GENDER_MASTER_002', 'Secondary Gender Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"gender_master"}' AS JSON));

INSERT IGNORE INTO blood_group_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'BLOOD_GROUP_MASTER_001', 'Primary Blood Group Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"blood_group_master"}' AS JSON)),
(2, 'BLOOD_GROUP_MASTER_002', 'Secondary Blood Group Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"blood_group_master"}' AS JSON));

INSERT IGNORE INTO country_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'COUNTRY_MASTER_001', 'Primary Country Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"country_master"}' AS JSON)),
(2, 'COUNTRY_MASTER_002', 'Secondary Country Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"country_master"}' AS JSON));

INSERT IGNORE INTO state_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'STATE_MASTER_001', 'Primary State Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"state_master"}' AS JSON)),
(2, 'STATE_MASTER_002', 'Secondary State Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"state_master"}' AS JSON));

INSERT IGNORE INTO city_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'CITY_MASTER_001', 'Primary City Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"city_master"}' AS JSON)),
(2, 'CITY_MASTER_002', 'Secondary City Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"city_master"}' AS JSON));

INSERT IGNORE INTO department_type_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'DEPARTMENT_TYPE_MASTER_001', 'Primary Department Type Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"department_type_master"}' AS JSON)),
(2, 'DEPARTMENT_TYPE_MASTER_002', 'Secondary Department Type Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"department_type_master"}' AS JSON));

INSERT IGNORE INTO encounter_type_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'ENCOUNTER_TYPE_MASTER_001', 'Primary Encounter Type Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"encounter_type_master"}' AS JSON)),
(2, 'ENCOUNTER_TYPE_MASTER_002', 'Secondary Encounter Type Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"encounter_type_master"}' AS JSON));

INSERT IGNORE INTO appointment_status_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'APPOINTMENT_STATUS_MASTER_001', 'Primary Appointment Status Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"appointment_status_master"}' AS JSON)),
(2, 'APPOINTMENT_STATUS_MASTER_002', 'Secondary Appointment Status Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"appointment_status_master"}' AS JSON));

INSERT IGNORE INTO invoice_status_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'INVOICE_STATUS_MASTER_001', 'Primary Invoice Status Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"invoice_status_master"}' AS JSON)),
(2, 'INVOICE_STATUS_MASTER_002', 'Secondary Invoice Status Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"invoice_status_master"}' AS JSON));

INSERT IGNORE INTO payment_mode_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'PAYMENT_MODE_MASTER_001', 'Primary Payment Mode Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"payment_mode_master"}' AS JSON)),
(2, 'PAYMENT_MODE_MASTER_002', 'Secondary Payment Mode Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"payment_mode_master"}' AS JSON));

INSERT IGNORE INTO diagnosis_code_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'DIAGNOSIS_CODE_MASTER_001', 'Primary Diagnosis Code Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"diagnosis_code_master"}' AS JSON)),
(2, 'DIAGNOSIS_CODE_MASTER_002', 'Secondary Diagnosis Code Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"diagnosis_code_master"}' AS JSON));

INSERT IGNORE INTO loinc_code_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'LOINC_CODE_MASTER_001', 'Primary Loinc Code Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"loinc_code_master"}' AS JSON)),
(2, 'LOINC_CODE_MASTER_002', 'Secondary Loinc Code Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"loinc_code_master"}' AS JSON));

INSERT IGNORE INTO snomed_code_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'SNOMED_CODE_MASTER_001', 'Primary Snomed Code Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"snomed_code_master"}' AS JSON)),
(2, 'SNOMED_CODE_MASTER_002', 'Secondary Snomed Code Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"snomed_code_master"}' AS JSON));

INSERT IGNORE INTO icd10_code_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'ICD10_CODE_MASTER_001', 'Primary Icd10 Code Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"icd10_code_master"}' AS JSON)),
(2, 'ICD10_CODE_MASTER_002', 'Secondary Icd10 Code Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"icd10_code_master"}' AS JSON));

INSERT IGNORE INTO rxnorm_code_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'RXNORM_CODE_MASTER_001', 'Primary Rxnorm Code Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"rxnorm_code_master"}' AS JSON)),
(2, 'RXNORM_CODE_MASTER_002', 'Secondary Rxnorm Code Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"rxnorm_code_master"}' AS JSON));

INSERT IGNORE INTO fhir_resource_type_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'FHIR_RESOURCE_TYPE_MASTER_001', 'Primary Fhir Resource Type Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"fhir_resource_type_master"}' AS JSON)),
(2, 'FHIR_RESOURCE_TYPE_MASTER_002', 'Secondary Fhir Resource Type Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"fhir_resource_type_master"}' AS JSON));

INSERT IGNORE INTO hl7_message_type_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'HL7_MESSAGE_TYPE_MASTER_001', 'Primary Hl7 Message Type Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"hl7_message_type_master"}' AS JSON)),
(2, 'HL7_MESSAGE_TYPE_MASTER_002', 'Secondary Hl7 Message Type Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"hl7_message_type_master"}' AS JSON));

INSERT IGNORE INTO code_system_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'CODE_SYSTEM_MASTER_001', 'Primary Code System Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"code_system_master"}' AS JSON)),
(2, 'CODE_SYSTEM_MASTER_002', 'Secondary Code System Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"code_system_master"}' AS JSON));

INSERT IGNORE INTO value_set_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'VALUE_SET_MASTER_001', 'Primary Value Set Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"value_set_master"}' AS JSON)),
(2, 'VALUE_SET_MASTER_002', 'Secondary Value Set Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"value_set_master"}' AS JSON));

INSERT IGNORE INTO concept_map_master (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'CONCEPT_MAP_MASTER_001', 'Primary Concept Map Master', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"concept_map_master"}' AS JSON)),
(2, 'CONCEPT_MAP_MASTER_002', 'Secondary Concept Map Master', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"concept_map_master"}' AS JSON));

INSERT IGNORE INTO local_code_systems (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'LOCAL_CODE_SYSTEMS_001', 'Primary Local Code Systems', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"local_code_systems"}' AS JSON)),
(2, 'LOCAL_CODE_SYSTEMS_002', 'Secondary Local Code Systems', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"local_code_systems"}' AS JSON));

INSERT IGNORE INTO local_to_fhir_code_mappings (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'LOCAL_TO_FHIR_CODE_MAPPINGS_001', 'Primary Local To Fhir Code Mappings', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"local_to_fhir_code_mappings"}' AS JSON)),
(2, 'LOCAL_TO_FHIR_CODE_MAPPINGS_002', 'Secondary Local To Fhir Code Mappings', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"local_to_fhir_code_mappings"}' AS JSON));

INSERT IGNORE INTO loinc_mappings (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'LOINC_MAPPINGS_001', 'Primary Loinc Mappings', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"loinc_mappings"}' AS JSON)),
(2, 'LOINC_MAPPINGS_002', 'Secondary Loinc Mappings', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"loinc_mappings"}' AS JSON));

INSERT IGNORE INTO snomed_mappings (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'SNOMED_MAPPINGS_001', 'Primary Snomed Mappings', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"snomed_mappings"}' AS JSON)),
(2, 'SNOMED_MAPPINGS_002', 'Secondary Snomed Mappings', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"snomed_mappings"}' AS JSON));

INSERT IGNORE INTO icd10_mappings (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'ICD10_MAPPINGS_001', 'Primary Icd10 Mappings', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"icd10_mappings"}' AS JSON)),
(2, 'ICD10_MAPPINGS_002', 'Secondary Icd10 Mappings', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"icd10_mappings"}' AS JSON));

INSERT IGNORE INTO rxnorm_mappings (id, code, name, description, standard_system, standard_code, status, data_json)
VALUES
(1, 'RXNORM_MAPPINGS_001', 'Primary Rxnorm Mappings', 'Primary master value', 'LOCAL', '001', 'ACTIVE', CAST('{"example":1,"table":"rxnorm_mappings"}' AS JSON)),
(2, 'RXNORM_MAPPINGS_002', 'Secondary Rxnorm Mappings', 'Secondary master value', 'LOCAL', '002', 'ACTIVE', CAST('{"example":2,"table":"rxnorm_mappings"}' AS JSON));


-- ============================================================================================
-- Seed data: 02 Foundation / RBAC
-- ============================================================================================


INSERT IGNORE INTO tenants (id, tenant_code, tenant_name, legal_name, subscription_plan, status, contact_email, contact_phone, data_json)
VALUES
(1, 'PLASMIT', 'Plasmit Healthcare Group', 'Plasmit Healthcare Group Pvt Ltd', 'ENTERPRISE', 'ACTIVE', 'admin@plasmit.example', '+91-9000000001', CAST('{"fhir":"Organization","sample":1}' AS JSON)),
(2, 'CITYCARE', 'CityCare Hospital Network', 'CityCare Hospital Network Ltd', 'GROWTH', 'ACTIVE', 'admin@citycare.example', '+91-9000000002', CAST('{"fhir":"Organization","sample":2}' AS JSON));

INSERT IGNORE INTO hospitals (id, tenant_id, hospital_code, hospital_name, legal_name, status, contact_email, contact_phone, address_json)
VALUES
(1, 1, 'PLH', 'Plasmit Hospital', 'Plasmit Hospital Main Entity', 'ACTIVE', 'hospital@plasmit.example', '+91-9111111111', CAST('{"city":"Gurugram","country":"IN"}' AS JSON)),
(2, 2, 'CCH', 'CityCare Hospital', 'CityCare Hospital Main Entity', 'ACTIVE', 'hospital@citycare.example', '+91-9222222222', CAST('{"city":"Delhi","country":"IN"}' AS JSON));

INSERT IGNORE INTO branches (id, tenant_id, hospital_id, branch_code, branch_name, branch_type, status, contact_email, contact_phone, address_json)
VALUES
(1, 1, 1, 'MAIN', 'Main Campus', 'MULTI_SPECIALTY', 'ACTIVE', 'main@plasmit.example', '+91-9333333333', CAST('{"city":"Gurugram","line":"Sector 44"}' AS JSON)),
(2, 2, 2, 'SOUTH', 'South Branch', 'MULTI_SPECIALTY', 'ACTIVE', 'south@citycare.example', '+91-9444444444', CAST('{"city":"Delhi","line":"Saket"}' AS JSON));

INSERT IGNORE INTO departments (id, tenant_id, hospital_id, branch_id, department_code, department_name, department_type, status, created_by, updated_by)
VALUES
(1, 1, 1, 1, 'CARD', 'Cardiology', 'CLINICAL', 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'PATH', 'Pathology', 'DIAGNOSTIC', 'ACTIVE', 2, 2);

INSERT IGNORE INTO healthcare_services (id, tenant_id, hospital_id, branch_id, department_id, service_code, service_name, service_category, status, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 'OPD-CONSULT', 'OPD Consultation', 'CONSULTATION', 'ACTIVE', 1, 1),
(2, 2, 2, 2, 2, 'CBC-LAB', 'Complete Blood Count', 'LAB', 'ACTIVE', 2, 2);

INSERT IGNORE INTO roles (id, tenant_id, hospital_id, role_code, role_name, role_scope, status, created_by, updated_by)
VALUES
(1, 1, 1, 'DOCTOR', 'Doctor', 'HOSPITAL', 'ACTIVE', 1, 1),
(2, 2, 2, 'NURSE', 'Nurse', 'HOSPITAL', 'ACTIVE', 2, 2),
(3, 1, 1, 'LAB_TECH', 'Lab Technician', 'HOSPITAL', 'ACTIVE', 1, 1),
(4, 1, 1, 'PHARMACIST', 'Pharmacist', 'HOSPITAL', 'ACTIVE', 1, 1),
(5, 1, 1, 'BILLING_USER', 'Billing User', 'HOSPITAL', 'ACTIVE', 1, 1);

INSERT IGNORE INTO permissions (id, permission_code, permission_name, module_name, status)
VALUES
(1, 'PATIENT_READ', 'Read patient data', 'Patient', 'ACTIVE'),
(2, 'ENCOUNTER_WRITE', 'Create and update encounters', 'Encounter', 'ACTIVE');

INSERT IGNORE INTO role_permissions (id, role_id, permission_id, status, created_by)
VALUES
(1, 1, 1, 'ACTIVE', 1),
(2, 1, 2, 'ACTIVE', 1);

INSERT IGNORE INTO users (
  id, tenant_id, hospital_id, primary_branch_id, role_id, department_id, employee_code, full_name,
  user_type, email, phone, status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 'DOC-001', 'Dr. Aisha Mehta', 'DOCTOR', 'aisha.mehta@plasmit.example', '+91-955550001', 'ACTIVE', 1, 1),
(2, 2, 2, 2, 1, 2, 'DOC-002', 'Dr. Rahul Sen', 'DOCTOR', 'rahul.sen@citycare.example', '+91-955550002', 'ACTIVE', 1, 1),
(3, 1, 1, 1, 2, 1, 'NUR-001', 'Nurse Kavita Rao', 'NURSE', 'kavita.rao@plasmit.example', '+91-955550003', 'ACTIVE', 1, 1),
(4, 2, 2, 2, 2, 2, 'NUR-002', 'Nurse Neha Singh', 'NURSE', 'neha.singh@citycare.example', '+91-955550004', 'ACTIVE', 1, 1),
(5, 1, 1, 1, 3, 2, 'LAB-001', 'Imran Lab Tech', 'LAB_TECHNICIAN', 'imran.lab@plasmit.example', '+91-955550005', 'ACTIVE', 1, 1),
(6, 2, 2, 2, 3, 2, 'LAB-002', 'Priya Lab Tech', 'LAB_TECHNICIAN', 'priya.lab@citycare.example', '+91-955550006', 'ACTIVE', 1, 1),
(7, 1, 1, 1, 4, 1, 'PHA-001', 'Arjun Pharmacist', 'PHARMACIST', 'arjun.pharmacy@plasmit.example', '+91-955550007', 'ACTIVE', 1, 1),
(8, 2, 2, 2, 4, 1, 'PHA-002', 'Ritu Pharmacist', 'PHARMACIST', 'ritu.pharmacy@citycare.example', '+91-955550008', 'ACTIVE', 1, 1),
(9, 1, 1, 1, 5, 1, 'BIL-001', 'Sana Billing', 'BILLING_USER', 'sana.billing@plasmit.example', '+91-955550009', 'ACTIVE', 1, 1),
(10, 2, 2, 2, 5, 2, 'BIL-002', 'Mohan Billing', 'BILLING_USER', 'mohan.billing@citycare.example', '+91-955550010', 'ACTIVE', 1, 1);

INSERT IGNORE INTO user_branch_access (id, tenant_id, hospital_id, user_id, branch_id, access_level, status, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 'FULL', 'ACTIVE', 1, 1),
(2, 2, 2, 2, 2, 'FULL', 'ACTIVE', 2, 2);

INSERT IGNORE INTO user_department_access (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'USER_DEPARTMENT_ACCESS-001', 'Sample User Department Access 1', 'Dummy User Department Access record', 'USER_DEPARTMENT_ACCESS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"user_department_access"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'USER_DEPARTMENT_ACCESS-002', 'Sample User Department Access 2', 'Dummy User Department Access record', 'USER_DEPARTMENT_ACCESS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"user_department_access"}' AS JSON), 2, 2);

INSERT IGNORE INTO audit_user_sessions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'AUDIT_USER_SESSIONS-001', 'Sample Audit User Sessions 1', 'Dummy Audit User Sessions record', 'AUDIT_USER_SESSIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"audit_user_sessions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'AUDIT_USER_SESSIONS-002', 'Sample Audit User Sessions 2', 'Dummy Audit User Sessions record', 'AUDIT_USER_SESSIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"audit_user_sessions"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 03 Patient Registration / MPI
-- ============================================================================================


INSERT IGNORE INTO patients (id, tenant_id, hospital_id, mrn, first_name, last_name, gender_code, date_of_birth, phone, email, status, data_json, created_by, updated_by)
VALUES
(1, 1, 1, 'PLH-000001', 'Aman', 'Kumar', 'male', '1994-08-15', '+91-966660001', 'aman.patient@example.com', 'ACTIVE', CAST('{"fhir":"Patient","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 'CCH-000001', 'Sara', 'Khan', 'female', '1988-03-20', '+91-966660002', 'sara.patient@example.com', 'ACTIVE', CAST('{"fhir":"Patient","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_identifiers (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_IDENTIFIERS-001', 'Sample Patient Identifiers 1', 'Dummy Patient Identifiers record', 'PATIENT_IDENTIFIERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_identifiers"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_IDENTIFIERS-002', 'Sample Patient Identifiers 2', 'Dummy Patient Identifiers record', 'PATIENT_IDENTIFIERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_identifiers"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_addresses (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_ADDRESSES-001', 'Sample Patient Addresses 1', 'Dummy Patient Addresses record', 'PATIENT_ADDRESSES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_addresses"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_ADDRESSES-002', 'Sample Patient Addresses 2', 'Dummy Patient Addresses record', 'PATIENT_ADDRESSES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_addresses"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_contacts (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_CONTACTS-001', 'Sample Patient Contacts 1', 'Dummy Patient Contacts record', 'PATIENT_CONTACTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_contacts"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_CONTACTS-002', 'Sample Patient Contacts 2', 'Dummy Patient Contacts record', 'PATIENT_CONTACTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_contacts"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_emergency_contacts (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_EMERGENCY_CONTACTS-001', 'Sample Patient Emergency Contacts 1', 'Dummy Patient Emergency Contacts record', 'PATIENT_EMERGENCY_CONTACTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_emergency_contacts"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_EMERGENCY_CONTACTS-002', 'Sample Patient Emergency Contacts 2', 'Dummy Patient Emergency Contacts record', 'PATIENT_EMERGENCY_CONTACTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_emergency_contacts"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_allergies (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_ALLERGIES-001', 'Sample Patient Allergies 1', 'Dummy Patient Allergies record', 'PATIENT_ALLERGIES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_allergies"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_ALLERGIES-002', 'Sample Patient Allergies 2', 'Dummy Patient Allergies record', 'PATIENT_ALLERGIES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_allergies"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_insurance (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_INSURANCE-001', 'Sample Patient Insurance 1', 'Dummy Patient Insurance record', 'PATIENT_INSURANCE-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_insurance"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_INSURANCE-002', 'Sample Patient Insurance 2', 'Dummy Patient Insurance record', 'PATIENT_INSURANCE-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_insurance"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_consent_records (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_CONSENT_RECORDS-001', 'Sample Patient Consent Records 1', 'Dummy Patient Consent Records record', 'PATIENT_CONSENT_RECORDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_consent_records"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_CONSENT_RECORDS-002', 'Sample Patient Consent Records 2', 'Dummy Patient Consent Records record', 'PATIENT_CONSENT_RECORDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_consent_records"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_documents (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_DOCUMENTS-001', 'Sample Patient Documents 1', 'Dummy Patient Documents record', 'PATIENT_DOCUMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_documents"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_DOCUMENTS-002', 'Sample Patient Documents 2', 'Dummy Patient Documents record', 'PATIENT_DOCUMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_documents"}' AS JSON), 2, 2);

INSERT IGNORE INTO master_patient_index (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MASTER_PATIENT_INDEX-001', 'Sample Master Patient Index 1', 'Dummy Master Patient Index record', 'MASTER_PATIENT_INDEX-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"master_patient_index"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MASTER_PATIENT_INDEX-002', 'Sample Master Patient Index 2', 'Dummy Master Patient Index record', 'MASTER_PATIENT_INDEX-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"master_patient_index"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_linkages (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_LINKAGES-001', 'Sample Patient Linkages 1', 'Dummy Patient Linkages record', 'PATIENT_LINKAGES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_linkages"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_LINKAGES-002', 'Sample Patient Linkages 2', 'Dummy Patient Linkages record', 'PATIENT_LINKAGES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_linkages"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 04 Appointment / Scheduling
-- ============================================================================================


INSERT IGNORE INTO appointments (id, tenant_id, hospital_id, branch_id, patient_id, doctor_id, appointment_no, appointment_date, appointment_time, appointment_type, status, reason, data_json, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 1, 'APT-PLH-001', '2026-06-03', '10:00:00', 'OPD', 'BOOKED', 'Cardiology consultation', CAST('{"fhir":"Appointment","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 'APT-CCH-001', '2026-06-03', '11:30:00', 'OPD', 'BOOKED', 'Diagnostic review', CAST('{"fhir":"Appointment","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO schedules (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SCHEDULES-001', 'Sample Schedules 1', 'Dummy Schedules record', 'SCHEDULES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"schedules"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SCHEDULES-002', 'Sample Schedules 2', 'Dummy Schedules record', 'SCHEDULES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"schedules"}' AS JSON), 2, 2);

INSERT IGNORE INTO slots (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SLOTS-001', 'Sample Slots 1', 'Dummy Slots record', 'SLOTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"slots"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SLOTS-002', 'Sample Slots 2', 'Dummy Slots record', 'SLOTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"slots"}' AS JSON), 2, 2);

INSERT IGNORE INTO appointment_slots (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'APPOINTMENT_SLOTS-001', 'Sample Appointment Slots 1', 'Dummy Appointment Slots record', 'APPOINTMENT_SLOTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"appointment_slots"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'APPOINTMENT_SLOTS-002', 'Sample Appointment Slots 2', 'Dummy Appointment Slots record', 'APPOINTMENT_SLOTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"appointment_slots"}' AS JSON), 2, 2);

INSERT IGNORE INTO appointment_participants (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'APPOINTMENT_PARTICIPANTS-001', 'Sample Appointment Participants 1', 'Dummy Appointment Participants record', 'APPOINTMENT_PARTICIPANTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"appointment_participants"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'APPOINTMENT_PARTICIPANTS-002', 'Sample Appointment Participants 2', 'Dummy Appointment Participants record', 'APPOINTMENT_PARTICIPANTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"appointment_participants"}' AS JSON), 2, 2);

INSERT IGNORE INTO appointment_status_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'APPOINTMENT_STATUS_HISTORY-001', 'Sample Appointment Status History 1', 'Dummy Appointment Status History record', 'APPOINTMENT_STATUS_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"appointment_status_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'APPOINTMENT_STATUS_HISTORY-002', 'Sample Appointment Status History 2', 'Dummy Appointment Status History record', 'APPOINTMENT_STATUS_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"appointment_status_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO appointment_reminders (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'APPOINTMENT_REMINDERS-001', 'Sample Appointment Reminders 1', 'Dummy Appointment Reminders record', 'APPOINTMENT_REMINDERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"appointment_reminders"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'APPOINTMENT_REMINDERS-002', 'Sample Appointment Reminders 2', 'Dummy Appointment Reminders record', 'APPOINTMENT_REMINDERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"appointment_reminders"}' AS JSON), 2, 2);

INSERT IGNORE INTO appointment_cancellations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'APPOINTMENT_CANCELLATIONS-001', 'Sample Appointment Cancellations 1', 'Dummy Appointment Cancellations record', 'APPOINTMENT_CANCELLATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"appointment_cancellations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'APPOINTMENT_CANCELLATIONS-002', 'Sample Appointment Cancellations 2', 'Dummy Appointment Cancellations record', 'APPOINTMENT_CANCELLATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"appointment_cancellations"}' AS JSON), 2, 2);

INSERT IGNORE INTO appointment_waitlist (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'APPOINTMENT_WAITLIST-001', 'Sample Appointment Waitlist 1', 'Dummy Appointment Waitlist record', 'APPOINTMENT_WAITLIST-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"appointment_waitlist"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'APPOINTMENT_WAITLIST-002', 'Sample Appointment Waitlist 2', 'Dummy Appointment Waitlist record', 'APPOINTMENT_WAITLIST-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"appointment_waitlist"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 05 Encounter / OPD / Emergency
-- ============================================================================================


INSERT IGNORE INTO encounters (id, tenant_id, hospital_id, branch_id, patient_id, appointment_id, encounter_no, encounter_type, start_time, end_time, status, reason, data_json, created_by, updated_by)
VALUES
(1, 1, 1, 1, 1, 1, 'ENC-PLH-001', 'OPD', '2026-06-03 10:05:00', NULL, 'IN_PROGRESS', 'Cardiology consultation', CAST('{"fhir":"Encounter","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 'ENC-CCH-001', 'OPD', '2026-06-03 11:35:00', NULL, 'IN_PROGRESS', 'Diagnostic review', CAST('{"fhir":"Encounter","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO encounter_participants (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ENCOUNTER_PARTICIPANTS-001', 'Sample Encounter Participants 1', 'Dummy Encounter Participants record', 'ENCOUNTER_PARTICIPANTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"encounter_participants"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ENCOUNTER_PARTICIPANTS-002', 'Sample Encounter Participants 2', 'Dummy Encounter Participants record', 'ENCOUNTER_PARTICIPANTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"encounter_participants"}' AS JSON), 2, 2);

INSERT IGNORE INTO encounter_locations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ENCOUNTER_LOCATIONS-001', 'Sample Encounter Locations 1', 'Dummy Encounter Locations record', 'ENCOUNTER_LOCATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"encounter_locations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ENCOUNTER_LOCATIONS-002', 'Sample Encounter Locations 2', 'Dummy Encounter Locations record', 'ENCOUNTER_LOCATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"encounter_locations"}' AS JSON), 2, 2);

INSERT IGNORE INTO encounter_status_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ENCOUNTER_STATUS_HISTORY-001', 'Sample Encounter Status History 1', 'Dummy Encounter Status History record', 'ENCOUNTER_STATUS_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"encounter_status_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ENCOUNTER_STATUS_HISTORY-002', 'Sample Encounter Status History 2', 'Dummy Encounter Status History record', 'ENCOUNTER_STATUS_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"encounter_status_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO episode_of_care (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'EPISODE_OF_CARE-001', 'Sample Episode Of Care 1', 'Dummy Episode Of Care record', 'EPISODE_OF_CARE-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"episode_of_care"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'EPISODE_OF_CARE-002', 'Sample Episode Of Care 2', 'Dummy Episode Of Care record', 'EPISODE_OF_CARE-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"episode_of_care"}' AS JSON), 2, 2);

INSERT IGNORE INTO visit_triage (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'VISIT_TRIAGE-001', 'Sample Visit Triage 1', 'Dummy Visit Triage record', 'VISIT_TRIAGE-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"visit_triage"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'VISIT_TRIAGE-002', 'Sample Visit Triage 2', 'Dummy Visit Triage record', 'VISIT_TRIAGE-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"visit_triage"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_flags (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_FLAGS-001', 'Sample Patient Flags 1', 'Dummy Patient Flags record', 'PATIENT_FLAGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_flags"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_FLAGS-002', 'Sample Patient Flags 2', 'Dummy Patient Flags record', 'PATIENT_FLAGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_flags"}' AS JSON), 2, 2);

INSERT IGNORE INTO encounter_tasks (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ENCOUNTER_TASKS-001', 'Sample Encounter Tasks 1', 'Dummy Encounter Tasks record', 'ENCOUNTER_TASKS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"encounter_tasks"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ENCOUNTER_TASKS-002', 'Sample Encounter Tasks 2', 'Dummy Encounter Tasks record', 'ENCOUNTER_TASKS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"encounter_tasks"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 06 Clinical EMR / Doctor Workbench
-- ============================================================================================


INSERT IGNORE INTO vitals (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'VITALS-001', 'Sample Vitals 1', 'Dummy Vitals record', 'VITALS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"vitals"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'VITALS-002', 'Sample Vitals 2', 'Dummy Vitals record', 'VITALS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"vitals"}' AS JSON), 2, 2);

INSERT IGNORE INTO diagnoses (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DIAGNOSES-001', 'Sample Diagnoses 1', 'Dummy Diagnoses record', 'DIAGNOSES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"diagnoses"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DIAGNOSES-002', 'Sample Diagnoses 2', 'Dummy Diagnoses record', 'DIAGNOSES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"diagnoses"}' AS JSON), 2, 2);

INSERT IGNORE INTO problem_lists (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PROBLEM_LISTS-001', 'Sample Problem Lists 1', 'Dummy Problem Lists record', 'PROBLEM_LISTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"problem_lists"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PROBLEM_LISTS-002', 'Sample Problem Lists 2', 'Dummy Problem Lists record', 'PROBLEM_LISTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"problem_lists"}' AS JSON), 2, 2);

INSERT IGNORE INTO clinical_notes (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CLINICAL_NOTES-001', 'Sample Clinical Notes 1', 'Dummy Clinical Notes record', 'CLINICAL_NOTES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"clinical_notes"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CLINICAL_NOTES-002', 'Sample Clinical Notes 2', 'Dummy Clinical Notes record', 'CLINICAL_NOTES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"clinical_notes"}' AS JSON), 2, 2);

INSERT IGNORE INTO progress_notes (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PROGRESS_NOTES-001', 'Sample Progress Notes 1', 'Dummy Progress Notes record', 'PROGRESS_NOTES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"progress_notes"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PROGRESS_NOTES-002', 'Sample Progress Notes 2', 'Dummy Progress Notes record', 'PROGRESS_NOTES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"progress_notes"}' AS JSON), 2, 2);

INSERT IGNORE INTO physical_examinations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHYSICAL_EXAMINATIONS-001', 'Sample Physical Examinations 1', 'Dummy Physical Examinations record', 'PHYSICAL_EXAMINATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"physical_examinations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHYSICAL_EXAMINATIONS-002', 'Sample Physical Examinations 2', 'Dummy Physical Examinations record', 'PHYSICAL_EXAMINATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"physical_examinations"}' AS JSON), 2, 2);

INSERT IGNORE INTO review_of_systems (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'REVIEW_OF_SYSTEMS-001', 'Sample Review Of Systems 1', 'Dummy Review Of Systems record', 'REVIEW_OF_SYSTEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"review_of_systems"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'REVIEW_OF_SYSTEMS-002', 'Sample Review Of Systems 2', 'Dummy Review Of Systems record', 'REVIEW_OF_SYSTEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"review_of_systems"}' AS JSON), 2, 2);

INSERT IGNORE INTO family_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'FAMILY_HISTORY-001', 'Sample Family History 1', 'Dummy Family History record', 'FAMILY_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"family_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'FAMILY_HISTORY-002', 'Sample Family History 2', 'Dummy Family History record', 'FAMILY_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"family_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO social_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SOCIAL_HISTORY-001', 'Sample Social History 1', 'Dummy Social History record', 'SOCIAL_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"social_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SOCIAL_HISTORY-002', 'Sample Social History 2', 'Dummy Social History record', 'SOCIAL_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"social_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO procedures (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PROCEDURES-001', 'Sample Procedures 1', 'Dummy Procedures record', 'PROCEDURES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"procedures"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PROCEDURES-002', 'Sample Procedures 2', 'Dummy Procedures record', 'PROCEDURES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"procedures"}' AS JSON), 2, 2);

INSERT IGNORE INTO care_plans (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CARE_PLANS-001', 'Sample Care Plans 1', 'Dummy Care Plans record', 'CARE_PLANS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"care_plans"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CARE_PLANS-002', 'Sample Care Plans 2', 'Dummy Care Plans record', 'CARE_PLANS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"care_plans"}' AS JSON), 2, 2);

INSERT IGNORE INTO care_plan_goals (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CARE_PLAN_GOALS-001', 'Sample Care Plan Goals 1', 'Dummy Care Plan Goals record', 'CARE_PLAN_GOALS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"care_plan_goals"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CARE_PLAN_GOALS-002', 'Sample Care Plan Goals 2', 'Dummy Care Plan Goals record', 'CARE_PLAN_GOALS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"care_plan_goals"}' AS JSON), 2, 2);

INSERT IGNORE INTO risk_assessments (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'RISK_ASSESSMENTS-001', 'Sample Risk Assessments 1', 'Dummy Risk Assessments record', 'RISK_ASSESSMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"risk_assessments"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'RISK_ASSESSMENTS-002', 'Sample Risk Assessments 2', 'Dummy Risk Assessments record', 'RISK_ASSESSMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"risk_assessments"}' AS JSON), 2, 2);

INSERT IGNORE INTO clinical_impressions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CLINICAL_IMPRESSIONS-001', 'Sample Clinical Impressions 1', 'Dummy Clinical Impressions record', 'CLINICAL_IMPRESSIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"clinical_impressions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CLINICAL_IMPRESSIONS-002', 'Sample Clinical Impressions 2', 'Dummy Clinical Impressions record', 'CLINICAL_IMPRESSIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"clinical_impressions"}' AS JSON), 2, 2);

INSERT IGNORE INTO adverse_events (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ADVERSE_EVENTS-001', 'Sample Adverse Events 1', 'Dummy Adverse Events record', 'ADVERSE_EVENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"adverse_events"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ADVERSE_EVENTS-002', 'Sample Adverse Events 2', 'Dummy Adverse Events record', 'ADVERSE_EVENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"adverse_events"}' AS JSON), 2, 2);

INSERT IGNORE INTO detected_issues (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DETECTED_ISSUES-001', 'Sample Detected Issues 1', 'Dummy Detected Issues record', 'DETECTED_ISSUES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"detected_issues"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DETECTED_ISSUES-002', 'Sample Detected Issues 2', 'Dummy Detected Issues record', 'DETECTED_ISSUES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"detected_issues"}' AS JSON), 2, 2);

INSERT IGNORE INTO clinical_documents (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CLINICAL_DOCUMENTS-001', 'Sample Clinical Documents 1', 'Dummy Clinical Documents record', 'CLINICAL_DOCUMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"clinical_documents"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CLINICAL_DOCUMENTS-002', 'Sample Clinical Documents 2', 'Dummy Clinical Documents record', 'CLINICAL_DOCUMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"clinical_documents"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_alerts (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_ALERTS-001', 'Sample Patient Alerts 1', 'Dummy Patient Alerts record', 'PATIENT_ALERTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_alerts"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_ALERTS-002', 'Sample Patient Alerts 2', 'Dummy Patient Alerts record', 'PATIENT_ALERTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_alerts"}' AS JSON), 2, 2);

INSERT IGNORE INTO clinical_orders (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CLINICAL_ORDERS-001', 'Sample Clinical Orders 1', 'Dummy Clinical Orders record', 'CLINICAL_ORDERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"clinical_orders"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CLINICAL_ORDERS-002', 'Sample Clinical Orders 2', 'Dummy Clinical Orders record', 'CLINICAL_ORDERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"clinical_orders"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 07 ICU / Critical Care
-- ============================================================================================


INSERT IGNORE INTO icu_units (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_UNITS-001', 'Sample Icu Units 1', 'Dummy Icu Units record', 'ICU_UNITS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_units"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_UNITS-002', 'Sample Icu Units 2', 'Dummy Icu Units record', 'ICU_UNITS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_units"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_beds (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_BEDS-001', 'Sample Icu Beds 1', 'Dummy Icu Beds record', 'ICU_BEDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_beds"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_BEDS-002', 'Sample Icu Beds 2', 'Dummy Icu Beds record', 'ICU_BEDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_beds"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_admissions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_ADMISSIONS-001', 'Sample Icu Admissions 1', 'Dummy Icu Admissions record', 'ICU_ADMISSIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_admissions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_ADMISSIONS-002', 'Sample Icu Admissions 2', 'Dummy Icu Admissions record', 'ICU_ADMISSIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_admissions"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_rounds (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_ROUNDS-001', 'Sample Icu Rounds 1', 'Dummy Icu Rounds record', 'ICU_ROUNDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_rounds"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_ROUNDS-002', 'Sample Icu Rounds 2', 'Dummy Icu Rounds record', 'ICU_ROUNDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_rounds"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_vitals_charting (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_VITALS_CHARTING-001', 'Sample Icu Vitals Charting 1', 'Dummy Icu Vitals Charting record', 'ICU_VITALS_CHARTING-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_vitals_charting"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_VITALS_CHARTING-002', 'Sample Icu Vitals Charting 2', 'Dummy Icu Vitals Charting record', 'ICU_VITALS_CHARTING-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_vitals_charting"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_intake_output_chart (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_INTAKE_OUTPUT_CHART-001', 'Sample Icu Intake Output Chart 1', 'Dummy Icu Intake Output Chart record', 'ICU_INTAKE_OUTPUT_CHART-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_intake_output_chart"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_INTAKE_OUTPUT_CHART-002', 'Sample Icu Intake Output Chart 2', 'Dummy Icu Intake Output Chart record', 'ICU_INTAKE_OUTPUT_CHART-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_intake_output_chart"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_medication_infusions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_MEDICATION_INFUSIONS-001', 'Sample Icu Medication Infusions 1', 'Dummy Icu Medication Infusions record', 'ICU_MEDICATION_INFUSIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_medication_infusions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_MEDICATION_INFUSIONS-002', 'Sample Icu Medication Infusions 2', 'Dummy Icu Medication Infusions record', 'ICU_MEDICATION_INFUSIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_medication_infusions"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_ventilator_settings (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_VENTILATOR_SETTINGS-001', 'Sample Icu Ventilator Settings 1', 'Dummy Icu Ventilator Settings record', 'ICU_VENTILATOR_SETTINGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_ventilator_settings"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_VENTILATOR_SETTINGS-002', 'Sample Icu Ventilator Settings 2', 'Dummy Icu Ventilator Settings record', 'ICU_VENTILATOR_SETTINGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_ventilator_settings"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_device_monitoring (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_DEVICE_MONITORING-001', 'Sample Icu Device Monitoring 1', 'Dummy Icu Device Monitoring record', 'ICU_DEVICE_MONITORING-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_device_monitoring"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_DEVICE_MONITORING-002', 'Sample Icu Device Monitoring 2', 'Dummy Icu Device Monitoring record', 'ICU_DEVICE_MONITORING-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_device_monitoring"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_nursing_observations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_NURSING_OBSERVATIONS-001', 'Sample Icu Nursing Observations 1', 'Dummy Icu Nursing Observations record', 'ICU_NURSING_OBSERVATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_nursing_observations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_NURSING_OBSERVATIONS-002', 'Sample Icu Nursing Observations 2', 'Dummy Icu Nursing Observations record', 'ICU_NURSING_OBSERVATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_nursing_observations"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_doctor_notes (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_DOCTOR_NOTES-001', 'Sample Icu Doctor Notes 1', 'Dummy Icu Doctor Notes record', 'ICU_DOCTOR_NOTES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_doctor_notes"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_DOCTOR_NOTES-002', 'Sample Icu Doctor Notes 2', 'Dummy Icu Doctor Notes record', 'ICU_DOCTOR_NOTES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_doctor_notes"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_score_assessments (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_SCORE_ASSESSMENTS-001', 'Sample Icu Score Assessments 1', 'Dummy Icu Score Assessments record', 'ICU_SCORE_ASSESSMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_score_assessments"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_SCORE_ASSESSMENTS-002', 'Sample Icu Score Assessments 2', 'Dummy Icu Score Assessments record', 'ICU_SCORE_ASSESSMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_score_assessments"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_care_plans (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_CARE_PLANS-001', 'Sample Icu Care Plans 1', 'Dummy Icu Care Plans record', 'ICU_CARE_PLANS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_care_plans"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_CARE_PLANS-002', 'Sample Icu Care Plans 2', 'Dummy Icu Care Plans record', 'ICU_CARE_PLANS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_care_plans"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_shift_handover (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_SHIFT_HANDOVER-001', 'Sample Icu Shift Handover 1', 'Dummy Icu Shift Handover record', 'ICU_SHIFT_HANDOVER-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_shift_handover"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_SHIFT_HANDOVER-002', 'Sample Icu Shift Handover 2', 'Dummy Icu Shift Handover record', 'ICU_SHIFT_HANDOVER-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_shift_handover"}' AS JSON), 2, 2);

INSERT IGNORE INTO icu_discharge_transfer (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ICU_DISCHARGE_TRANSFER-001', 'Sample Icu Discharge Transfer 1', 'Dummy Icu Discharge Transfer record', 'ICU_DISCHARGE_TRANSFER-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"icu_discharge_transfer"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ICU_DISCHARGE_TRANSFER-002', 'Sample Icu Discharge Transfer 2', 'Dummy Icu Discharge Transfer record', 'ICU_DISCHARGE_TRANSFER-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"icu_discharge_transfer"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 08 Prescription / Medication Orders
-- ============================================================================================


INSERT IGNORE INTO medicine_master (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MEDICINE_MASTER-001', 'Sample Medicine Master 1', 'Dummy Medicine Master record', 'MEDICINE_MASTER-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"medicine_master"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MEDICINE_MASTER-002', 'Sample Medicine Master 2', 'Dummy Medicine Master record', 'MEDICINE_MASTER-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"medicine_master"}' AS JSON), 2, 2);

INSERT IGNORE INTO medicine_categories (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MEDICINE_CATEGORIES-001', 'Sample Medicine Categories 1', 'Dummy Medicine Categories record', 'MEDICINE_CATEGORIES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"medicine_categories"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MEDICINE_CATEGORIES-002', 'Sample Medicine Categories 2', 'Dummy Medicine Categories record', 'MEDICINE_CATEGORIES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"medicine_categories"}' AS JSON), 2, 2);

INSERT IGNORE INTO medication_knowledge (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MEDICATION_KNOWLEDGE-001', 'Sample Medication Knowledge 1', 'Dummy Medication Knowledge record', 'MEDICATION_KNOWLEDGE-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"medication_knowledge"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MEDICATION_KNOWLEDGE-002', 'Sample Medication Knowledge 2', 'Dummy Medication Knowledge record', 'MEDICATION_KNOWLEDGE-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"medication_knowledge"}' AS JSON), 2, 2);

INSERT IGNORE INTO medication_instructions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MEDICATION_INSTRUCTIONS-001', 'Sample Medication Instructions 1', 'Dummy Medication Instructions record', 'MEDICATION_INSTRUCTIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"medication_instructions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MEDICATION_INSTRUCTIONS-002', 'Sample Medication Instructions 2', 'Dummy Medication Instructions record', 'MEDICATION_INSTRUCTIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"medication_instructions"}' AS JSON), 2, 2);

INSERT IGNORE INTO medication_statements (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MEDICATION_STATEMENTS-001', 'Sample Medication Statements 1', 'Dummy Medication Statements record', 'MEDICATION_STATEMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"medication_statements"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MEDICATION_STATEMENTS-002', 'Sample Medication Statements 2', 'Dummy Medication Statements record', 'MEDICATION_STATEMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"medication_statements"}' AS JSON), 2, 2);

INSERT IGNORE INTO medication_administration_records (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MEDICATION_ADMINISTRATION_RECORDS-001', 'Sample Medication Administration Records 1', 'Dummy Medication Administration Records record', 'MEDICATION_ADMINISTRATION_RECORDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"medication_administration_records"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MEDICATION_ADMINISTRATION_RECORDS-002', 'Sample Medication Administration Records 2', 'Dummy Medication Administration Records record', 'MEDICATION_ADMINISTRATION_RECORDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"medication_administration_records"}' AS JSON), 2, 2);

INSERT IGNORE INTO immunizations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'IMMUNIZATIONS-001', 'Sample Immunizations 1', 'Dummy Immunizations record', 'IMMUNIZATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"immunizations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'IMMUNIZATIONS-002', 'Sample Immunizations 2', 'Dummy Immunizations record', 'IMMUNIZATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"immunizations"}' AS JSON), 2, 2);

INSERT IGNORE INTO immunization_recommendations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'IMMUNIZATION_RECOMMENDATIONS-001', 'Sample Immunization Recommendations 1', 'Dummy Immunization Recommendations record', 'IMMUNIZATION_RECOMMENDATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"immunization_recommendations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'IMMUNIZATION_RECOMMENDATIONS-002', 'Sample Immunization Recommendations 2', 'Dummy Immunization Recommendations record', 'IMMUNIZATION_RECOMMENDATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"immunization_recommendations"}' AS JSON), 2, 2);

INSERT IGNORE INTO prescriptions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PRESCRIPTIONS-001', 'Sample Prescriptions 1', 'Dummy Prescriptions record', 'PRESCRIPTIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"prescriptions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PRESCRIPTIONS-002', 'Sample Prescriptions 2', 'Dummy Prescriptions record', 'PRESCRIPTIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"prescriptions"}' AS JSON), 2, 2);

INSERT IGNORE INTO prescription_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PRESCRIPTION_ITEMS-001', 'Sample Prescription Items 1', 'Dummy Prescription Items record', 'PRESCRIPTION_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"prescription_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PRESCRIPTION_ITEMS-002', 'Sample Prescription Items 2', 'Dummy Prescription Items record', 'PRESCRIPTION_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"prescription_items"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 09 Pharmacy / Inventory / Dispensing
-- ============================================================================================


INSERT IGNORE INTO medicine_batches (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MEDICINE_BATCHES-001', 'Sample Medicine Batches 1', 'Dummy Medicine Batches record', 'MEDICINE_BATCHES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"medicine_batches"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MEDICINE_BATCHES-002', 'Sample Medicine Batches 2', 'Dummy Medicine Batches record', 'MEDICINE_BATCHES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"medicine_batches"}' AS JSON), 2, 2);

INSERT IGNORE INTO pharmacy_stock (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHARMACY_STOCK-001', 'Sample Pharmacy Stock 1', 'Dummy Pharmacy Stock record', 'PHARMACY_STOCK-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"pharmacy_stock"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHARMACY_STOCK-002', 'Sample Pharmacy Stock 2', 'Dummy Pharmacy Stock record', 'PHARMACY_STOCK-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"pharmacy_stock"}' AS JSON), 2, 2);

INSERT IGNORE INTO stock_movements (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'STOCK_MOVEMENTS-001', 'Sample Stock Movements 1', 'Dummy Stock Movements record', 'STOCK_MOVEMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"stock_movements"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'STOCK_MOVEMENTS-002', 'Sample Stock Movements 2', 'Dummy Stock Movements record', 'STOCK_MOVEMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"stock_movements"}' AS JSON), 2, 2);

INSERT IGNORE INTO pharmacy_dispense (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHARMACY_DISPENSE-001', 'Sample Pharmacy Dispense 1', 'Dummy Pharmacy Dispense record', 'PHARMACY_DISPENSE-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"pharmacy_dispense"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHARMACY_DISPENSE-002', 'Sample Pharmacy Dispense 2', 'Dummy Pharmacy Dispense record', 'PHARMACY_DISPENSE-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"pharmacy_dispense"}' AS JSON), 2, 2);

INSERT IGNORE INTO pharmacy_dispense_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHARMACY_DISPENSE_ITEMS-001', 'Sample Pharmacy Dispense Items 1', 'Dummy Pharmacy Dispense Items record', 'PHARMACY_DISPENSE_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"pharmacy_dispense_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHARMACY_DISPENSE_ITEMS-002', 'Sample Pharmacy Dispense Items 2', 'Dummy Pharmacy Dispense Items record', 'PHARMACY_DISPENSE_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"pharmacy_dispense_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO pharmacy_sale_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHARMACY_SALE_ITEMS-001', 'Sample Pharmacy Sale Items 1', 'Dummy Pharmacy Sale Items record', 'PHARMACY_SALE_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"pharmacy_sale_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHARMACY_SALE_ITEMS-002', 'Sample Pharmacy Sale Items 2', 'Dummy Pharmacy Sale Items record', 'PHARMACY_SALE_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"pharmacy_sale_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO pharmacy_returns (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHARMACY_RETURNS-001', 'Sample Pharmacy Returns 1', 'Dummy Pharmacy Returns record', 'PHARMACY_RETURNS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"pharmacy_returns"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHARMACY_RETURNS-002', 'Sample Pharmacy Returns 2', 'Dummy Pharmacy Returns record', 'PHARMACY_RETURNS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"pharmacy_returns"}' AS JSON), 2, 2);

INSERT IGNORE INTO pharmacy_return_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHARMACY_RETURN_ITEMS-001', 'Sample Pharmacy Return Items 1', 'Dummy Pharmacy Return Items record', 'PHARMACY_RETURN_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"pharmacy_return_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHARMACY_RETURN_ITEMS-002', 'Sample Pharmacy Return Items 2', 'Dummy Pharmacy Return Items record', 'PHARMACY_RETURN_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"pharmacy_return_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO purchase_orders (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PURCHASE_ORDERS-001', 'Sample Purchase Orders 1', 'Dummy Purchase Orders record', 'PURCHASE_ORDERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"purchase_orders"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PURCHASE_ORDERS-002', 'Sample Purchase Orders 2', 'Dummy Purchase Orders record', 'PURCHASE_ORDERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"purchase_orders"}' AS JSON), 2, 2);

INSERT IGNORE INTO purchase_order_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PURCHASE_ORDER_ITEMS-001', 'Sample Purchase Order Items 1', 'Dummy Purchase Order Items record', 'PURCHASE_ORDER_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"purchase_order_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PURCHASE_ORDER_ITEMS-002', 'Sample Purchase Order Items 2', 'Dummy Purchase Order Items record', 'PURCHASE_ORDER_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"purchase_order_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO goods_receipts (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'GOODS_RECEIPTS-001', 'Sample Goods Receipts 1', 'Dummy Goods Receipts record', 'GOODS_RECEIPTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"goods_receipts"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'GOODS_RECEIPTS-002', 'Sample Goods Receipts 2', 'Dummy Goods Receipts record', 'GOODS_RECEIPTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"goods_receipts"}' AS JSON), 2, 2);

INSERT IGNORE INTO goods_receipt_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'GOODS_RECEIPT_ITEMS-001', 'Sample Goods Receipt Items 1', 'Dummy Goods Receipt Items record', 'GOODS_RECEIPT_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"goods_receipt_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'GOODS_RECEIPT_ITEMS-002', 'Sample Goods Receipt Items 2', 'Dummy Goods Receipt Items record', 'GOODS_RECEIPT_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"goods_receipt_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO inventory_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'INVENTORY_ITEMS-001', 'Sample Inventory Items 1', 'Dummy Inventory Items record', 'INVENTORY_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"inventory_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'INVENTORY_ITEMS-002', 'Sample Inventory Items 2', 'Dummy Inventory Items record', 'INVENTORY_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"inventory_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO inventory_reports (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'INVENTORY_REPORTS-001', 'Sample Inventory Reports 1', 'Dummy Inventory Reports record', 'INVENTORY_REPORTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"inventory_reports"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'INVENTORY_REPORTS-002', 'Sample Inventory Reports 2', 'Dummy Inventory Reports record', 'INVENTORY_REPORTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"inventory_reports"}' AS JSON), 2, 2);

INSERT IGNORE INTO supply_requests (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SUPPLY_REQUESTS-001', 'Sample Supply Requests 1', 'Dummy Supply Requests record', 'SUPPLY_REQUESTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"supply_requests"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SUPPLY_REQUESTS-002', 'Sample Supply Requests 2', 'Dummy Supply Requests record', 'SUPPLY_REQUESTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"supply_requests"}' AS JSON), 2, 2);

INSERT IGNORE INTO supply_deliveries (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SUPPLY_DELIVERIES-001', 'Sample Supply Deliveries 1', 'Dummy Supply Deliveries record', 'SUPPLY_DELIVERIES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"supply_deliveries"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SUPPLY_DELIVERIES-002', 'Sample Supply Deliveries 2', 'Dummy Supply Deliveries record', 'SUPPLY_DELIVERIES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"supply_deliveries"}' AS JSON), 2, 2);

INSERT IGNORE INTO pharmacy_sales (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PHARMACY_SALES-001', 'Sample Pharmacy Sales 1', 'Dummy Pharmacy Sales record', 'PHARMACY_SALES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"pharmacy_sales"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PHARMACY_SALES-002', 'Sample Pharmacy Sales 2', 'Dummy Pharmacy Sales record', 'PHARMACY_SALES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"pharmacy_sales"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 10 Lab / Diagnostics
-- ============================================================================================


INSERT IGNORE INTO lab_test_master (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_TEST_MASTER-001', 'Sample Lab Test Master 1', 'Dummy Lab Test Master record', 'LAB_TEST_MASTER-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_test_master"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_TEST_MASTER-002', 'Sample Lab Test Master 2', 'Dummy Lab Test Master record', 'LAB_TEST_MASTER-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_test_master"}' AS JSON), 2, 2);

INSERT IGNORE INTO lab_test_parameters (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_TEST_PARAMETERS-001', 'Sample Lab Test Parameters 1', 'Dummy Lab Test Parameters record', 'LAB_TEST_PARAMETERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_test_parameters"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_TEST_PARAMETERS-002', 'Sample Lab Test Parameters 2', 'Dummy Lab Test Parameters record', 'LAB_TEST_PARAMETERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_test_parameters"}' AS JSON), 2, 2);

INSERT IGNORE INTO observation_definitions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'OBSERVATION_DEFINITIONS-001', 'Sample Observation Definitions 1', 'Dummy Observation Definitions record', 'OBSERVATION_DEFINITIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"observation_definitions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'OBSERVATION_DEFINITIONS-002', 'Sample Observation Definitions 2', 'Dummy Observation Definitions record', 'OBSERVATION_DEFINITIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"observation_definitions"}' AS JSON), 2, 2);

INSERT IGNORE INTO specimen_definitions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SPECIMEN_DEFINITIONS-001', 'Sample Specimen Definitions 1', 'Dummy Specimen Definitions record', 'SPECIMEN_DEFINITIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"specimen_definitions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SPECIMEN_DEFINITIONS-002', 'Sample Specimen Definitions 2', 'Dummy Specimen Definitions record', 'SPECIMEN_DEFINITIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"specimen_definitions"}' AS JSON), 2, 2);

INSERT IGNORE INTO lab_order_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_ORDER_ITEMS-001', 'Sample Lab Order Items 1', 'Dummy Lab Order Items record', 'LAB_ORDER_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_order_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_ORDER_ITEMS-002', 'Sample Lab Order Items 2', 'Dummy Lab Order Items record', 'LAB_ORDER_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_order_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO lab_samples (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_SAMPLES-001', 'Sample Lab Samples 1', 'Dummy Lab Samples record', 'LAB_SAMPLES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_samples"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_SAMPLES-002', 'Sample Lab Samples 2', 'Dummy Lab Samples record', 'LAB_SAMPLES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_samples"}' AS JSON), 2, 2);

INSERT IGNORE INTO lab_results (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_RESULTS-001', 'Sample Lab Results 1', 'Dummy Lab Results record', 'LAB_RESULTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_results"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_RESULTS-002', 'Sample Lab Results 2', 'Dummy Lab Results record', 'LAB_RESULTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_results"}' AS JSON), 2, 2);

INSERT IGNORE INTO lab_result_parameters (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_RESULT_PARAMETERS-001', 'Sample Lab Result Parameters 1', 'Dummy Lab Result Parameters record', 'LAB_RESULT_PARAMETERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_result_parameters"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_RESULT_PARAMETERS-002', 'Sample Lab Result Parameters 2', 'Dummy Lab Result Parameters record', 'LAB_RESULT_PARAMETERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_result_parameters"}' AS JSON), 2, 2);

INSERT IGNORE INTO diagnostic_reports (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DIAGNOSTIC_REPORTS-001', 'Sample Diagnostic Reports 1', 'Dummy Diagnostic Reports record', 'DIAGNOSTIC_REPORTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"diagnostic_reports"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DIAGNOSTIC_REPORTS-002', 'Sample Diagnostic Reports 2', 'Dummy Diagnostic Reports record', 'DIAGNOSTIC_REPORTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"diagnostic_reports"}' AS JSON), 2, 2);

INSERT IGNORE INTO lab_result_review_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_RESULT_REVIEW_HISTORY-001', 'Sample Lab Result Review History 1', 'Dummy Lab Result Review History record', 'LAB_RESULT_REVIEW_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_result_review_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_RESULT_REVIEW_HISTORY-002', 'Sample Lab Result Review History 2', 'Dummy Lab Result Review History record', 'LAB_RESULT_REVIEW_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_result_review_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO genomic_studies (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'GENOMIC_STUDIES-001', 'Sample Genomic Studies 1', 'Dummy Genomic Studies record', 'GENOMIC_STUDIES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"genomic_studies"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'GENOMIC_STUDIES-002', 'Sample Genomic Studies 2', 'Dummy Genomic Studies record', 'GENOMIC_STUDIES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"genomic_studies"}' AS JSON), 2, 2);

INSERT IGNORE INTO molecular_sequences (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MOLECULAR_SEQUENCES-001', 'Sample Molecular Sequences 1', 'Dummy Molecular Sequences record', 'MOLECULAR_SEQUENCES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"molecular_sequences"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MOLECULAR_SEQUENCES-002', 'Sample Molecular Sequences 2', 'Dummy Molecular Sequences record', 'MOLECULAR_SEQUENCES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"molecular_sequences"}' AS JSON), 2, 2);

INSERT IGNORE INTO lab_orders (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'LAB_ORDERS-001', 'Sample Lab Orders 1', 'Dummy Lab Orders record', 'LAB_ORDERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"lab_orders"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'LAB_ORDERS-002', 'Sample Lab Orders 2', 'Dummy Lab Orders record', 'LAB_ORDERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"lab_orders"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 11 Radiology / Imaging
-- ============================================================================================


INSERT IGNORE INTO radiology_test_master (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'RADIOLOGY_TEST_MASTER-001', 'Sample Radiology Test Master 1', 'Dummy Radiology Test Master record', 'RADIOLOGY_TEST_MASTER-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"radiology_test_master"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'RADIOLOGY_TEST_MASTER-002', 'Sample Radiology Test Master 2', 'Dummy Radiology Test Master record', 'RADIOLOGY_TEST_MASTER-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"radiology_test_master"}' AS JSON), 2, 2);

INSERT IGNORE INTO radiology_order_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'RADIOLOGY_ORDER_ITEMS-001', 'Sample Radiology Order Items 1', 'Dummy Radiology Order Items record', 'RADIOLOGY_ORDER_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"radiology_order_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'RADIOLOGY_ORDER_ITEMS-002', 'Sample Radiology Order Items 2', 'Dummy Radiology Order Items record', 'RADIOLOGY_ORDER_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"radiology_order_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO imaging_studies (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'IMAGING_STUDIES-001', 'Sample Imaging Studies 1', 'Dummy Imaging Studies record', 'IMAGING_STUDIES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"imaging_studies"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'IMAGING_STUDIES-002', 'Sample Imaging Studies 2', 'Dummy Imaging Studies record', 'IMAGING_STUDIES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"imaging_studies"}' AS JSON), 2, 2);

INSERT IGNORE INTO imaging_selections (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'IMAGING_SELECTIONS-001', 'Sample Imaging Selections 1', 'Dummy Imaging Selections record', 'IMAGING_SELECTIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"imaging_selections"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'IMAGING_SELECTIONS-002', 'Sample Imaging Selections 2', 'Dummy Imaging Selections record', 'IMAGING_SELECTIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"imaging_selections"}' AS JSON), 2, 2);

INSERT IGNORE INTO radiology_reports (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'RADIOLOGY_REPORTS-001', 'Sample Radiology Reports 1', 'Dummy Radiology Reports record', 'RADIOLOGY_REPORTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"radiology_reports"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'RADIOLOGY_REPORTS-002', 'Sample Radiology Reports 2', 'Dummy Radiology Reports record', 'RADIOLOGY_REPORTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"radiology_reports"}' AS JSON), 2, 2);

INSERT IGNORE INTO radiology_report_review_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'RADIOLOGY_REPORT_REVIEW_HISTORY-001', 'Sample Radiology Report Review History 1', 'Dummy Radiology Report Review History record', 'RADIOLOGY_REPORT_REVIEW_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"radiology_report_review_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'RADIOLOGY_REPORT_REVIEW_HISTORY-002', 'Sample Radiology Report Review History 2', 'Dummy Radiology Report Review History record', 'RADIOLOGY_REPORT_REVIEW_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"radiology_report_review_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO radiology_documents (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'RADIOLOGY_DOCUMENTS-001', 'Sample Radiology Documents 1', 'Dummy Radiology Documents record', 'RADIOLOGY_DOCUMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"radiology_documents"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'RADIOLOGY_DOCUMENTS-002', 'Sample Radiology Documents 2', 'Dummy Radiology Documents record', 'RADIOLOGY_DOCUMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"radiology_documents"}' AS JSON), 2, 2);

INSERT IGNORE INTO radiology_orders (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'RADIOLOGY_ORDERS-001', 'Sample Radiology Orders 1', 'Dummy Radiology Orders record', 'RADIOLOGY_ORDERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"radiology_orders"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'RADIOLOGY_ORDERS-002', 'Sample Radiology Orders 2', 'Dummy Radiology Orders record', 'RADIOLOGY_ORDERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"radiology_orders"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 12 Billing / Payment / Insurance / Claims
-- ============================================================================================


INSERT IGNORE INTO patient_accounts (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_ACCOUNTS-001', 'Sample Patient Accounts 1', 'Dummy Patient Accounts record', 'PATIENT_ACCOUNTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_accounts"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_ACCOUNTS-002', 'Sample Patient Accounts 2', 'Dummy Patient Accounts record', 'PATIENT_ACCOUNTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_accounts"}' AS JSON), 2, 2);

INSERT IGNORE INTO billing_invoice_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BILLING_INVOICE_ITEMS-001', 'Sample Billing Invoice Items 1', 'Dummy Billing Invoice Items record', 'BILLING_INVOICE_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"billing_invoice_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BILLING_INVOICE_ITEMS-002', 'Sample Billing Invoice Items 2', 'Dummy Billing Invoice Items record', 'BILLING_INVOICE_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"billing_invoice_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO charge_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CHARGE_ITEMS-001', 'Sample Charge Items 1', 'Dummy Charge Items record', 'CHARGE_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"charge_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CHARGE_ITEMS-002', 'Sample Charge Items 2', 'Dummy Charge Items record', 'CHARGE_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"charge_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO charge_item_definitions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CHARGE_ITEM_DEFINITIONS-001', 'Sample Charge Item Definitions 1', 'Dummy Charge Item Definitions record', 'CHARGE_ITEM_DEFINITIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"charge_item_definitions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CHARGE_ITEM_DEFINITIONS-002', 'Sample Charge Item Definitions 2', 'Dummy Charge Item Definitions record', 'CHARGE_ITEM_DEFINITIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"charge_item_definitions"}' AS JSON), 2, 2);

INSERT IGNORE INTO payment_allocations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PAYMENT_ALLOCATIONS-001', 'Sample Payment Allocations 1', 'Dummy Payment Allocations record', 'PAYMENT_ALLOCATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"payment_allocations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PAYMENT_ALLOCATIONS-002', 'Sample Payment Allocations 2', 'Dummy Payment Allocations record', 'PAYMENT_ALLOCATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"payment_allocations"}' AS JSON), 2, 2);

INSERT IGNORE INTO payment_notices (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PAYMENT_NOTICES-001', 'Sample Payment Notices 1', 'Dummy Payment Notices record', 'PAYMENT_NOTICES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"payment_notices"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PAYMENT_NOTICES-002', 'Sample Payment Notices 2', 'Dummy Payment Notices record', 'PAYMENT_NOTICES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"payment_notices"}' AS JSON), 2, 2);

INSERT IGNORE INTO payment_reconciliations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PAYMENT_RECONCILIATIONS-001', 'Sample Payment Reconciliations 1', 'Dummy Payment Reconciliations record', 'PAYMENT_RECONCILIATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"payment_reconciliations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PAYMENT_RECONCILIATIONS-002', 'Sample Payment Reconciliations 2', 'Dummy Payment Reconciliations record', 'PAYMENT_RECONCILIATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"payment_reconciliations"}' AS JSON), 2, 2);

INSERT IGNORE INTO refunds (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'REFUNDS-001', 'Sample Refunds 1', 'Dummy Refunds record', 'REFUNDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"refunds"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'REFUNDS-002', 'Sample Refunds 2', 'Dummy Refunds record', 'REFUNDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"refunds"}' AS JSON), 2, 2);

INSERT IGNORE INTO insurance_plans (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'INSURANCE_PLANS-001', 'Sample Insurance Plans 1', 'Dummy Insurance Plans record', 'INSURANCE_PLANS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"insurance_plans"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'INSURANCE_PLANS-002', 'Sample Insurance Plans 2', 'Dummy Insurance Plans record', 'INSURANCE_PLANS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"insurance_plans"}' AS JSON), 2, 2);

INSERT IGNORE INTO insurance_policies (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'INSURANCE_POLICIES-001', 'Sample Insurance Policies 1', 'Dummy Insurance Policies record', 'INSURANCE_POLICIES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"insurance_policies"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'INSURANCE_POLICIES-002', 'Sample Insurance Policies 2', 'Dummy Insurance Policies record', 'INSURANCE_POLICIES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"insurance_policies"}' AS JSON), 2, 2);

INSERT IGNORE INTO coverage_eligibility_requests (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'COVERAGE_ELIGIBILITY_REQUESTS-001', 'Sample Coverage Eligibility Requests 1', 'Dummy Coverage Eligibility Requests record', 'COVERAGE_ELIGIBILITY_REQUESTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"coverage_eligibility_requests"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'COVERAGE_ELIGIBILITY_REQUESTS-002', 'Sample Coverage Eligibility Requests 2', 'Dummy Coverage Eligibility Requests record', 'COVERAGE_ELIGIBILITY_REQUESTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"coverage_eligibility_requests"}' AS JSON), 2, 2);

INSERT IGNORE INTO coverage_eligibility_responses (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'COVERAGE_ELIGIBILITY_RESPONSES-001', 'Sample Coverage Eligibility Responses 1', 'Dummy Coverage Eligibility Responses record', 'COVERAGE_ELIGIBILITY_RESPONSES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"coverage_eligibility_responses"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'COVERAGE_ELIGIBILITY_RESPONSES-002', 'Sample Coverage Eligibility Responses 2', 'Dummy Coverage Eligibility Responses record', 'COVERAGE_ELIGIBILITY_RESPONSES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"coverage_eligibility_responses"}' AS JSON), 2, 2);

INSERT IGNORE INTO insurance_claims (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'INSURANCE_CLAIMS-001', 'Sample Insurance Claims 1', 'Dummy Insurance Claims record', 'INSURANCE_CLAIMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"insurance_claims"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'INSURANCE_CLAIMS-002', 'Sample Insurance Claims 2', 'Dummy Insurance Claims record', 'INSURANCE_CLAIMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"insurance_claims"}' AS JSON), 2, 2);

INSERT IGNORE INTO insurance_claim_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'INSURANCE_CLAIM_ITEMS-001', 'Sample Insurance Claim Items 1', 'Dummy Insurance Claim Items record', 'INSURANCE_CLAIM_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"insurance_claim_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'INSURANCE_CLAIM_ITEMS-002', 'Sample Insurance Claim Items 2', 'Dummy Insurance Claim Items record', 'INSURANCE_CLAIM_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"insurance_claim_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO claim_responses (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CLAIM_RESPONSES-001', 'Sample Claim Responses 1', 'Dummy Claim Responses record', 'CLAIM_RESPONSES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"claim_responses"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CLAIM_RESPONSES-002', 'Sample Claim Responses 2', 'Dummy Claim Responses record', 'CLAIM_RESPONSES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"claim_responses"}' AS JSON), 2, 2);

INSERT IGNORE INTO explanation_of_benefits (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'EXPLANATION_OF_BENEFITS-001', 'Sample Explanation Of Benefits 1', 'Dummy Explanation Of Benefits record', 'EXPLANATION_OF_BENEFITS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"explanation_of_benefits"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'EXPLANATION_OF_BENEFITS-002', 'Sample Explanation Of Benefits 2', 'Dummy Explanation Of Benefits record', 'EXPLANATION_OF_BENEFITS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"explanation_of_benefits"}' AS JSON), 2, 2);

INSERT IGNORE INTO claim_documents (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CLAIM_DOCUMENTS-001', 'Sample Claim Documents 1', 'Dummy Claim Documents record', 'CLAIM_DOCUMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"claim_documents"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CLAIM_DOCUMENTS-002', 'Sample Claim Documents 2', 'Dummy Claim Documents record', 'CLAIM_DOCUMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"claim_documents"}' AS JSON), 2, 2);

INSERT IGNORE INTO claim_status_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CLAIM_STATUS_HISTORY-001', 'Sample Claim Status History 1', 'Dummy Claim Status History record', 'CLAIM_STATUS_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"claim_status_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CLAIM_STATUS_HISTORY-002', 'Sample Claim Status History 2', 'Dummy Claim Status History record', 'CLAIM_STATUS_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"claim_status_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO contracts (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CONTRACTS-001', 'Sample Contracts 1', 'Dummy Contracts record', 'CONTRACTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"contracts"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CONTRACTS-002', 'Sample Contracts 2', 'Dummy Contracts record', 'CONTRACTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"contracts"}' AS JSON), 2, 2);

INSERT IGNORE INTO billing_invoices (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BILLING_INVOICES-001', 'Sample Billing Invoices 1', 'Dummy Billing Invoices record', 'BILLING_INVOICES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"billing_invoices"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BILLING_INVOICES-002', 'Sample Billing Invoices 2', 'Dummy Billing Invoices record', 'BILLING_INVOICES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"billing_invoices"}' AS JSON), 2, 2);

INSERT IGNORE INTO payments (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PAYMENTS-001', 'Sample Payments 1', 'Dummy Payments record', 'PAYMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"payments"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PAYMENTS-002', 'Sample Payments 2', 'Dummy Payments record', 'PAYMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"payments"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 13 IPD / Ward / Room / Bed / Nursing / Discharge
-- ============================================================================================


INSERT IGNORE INTO admissions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ADMISSIONS-001', 'Sample Admissions 1', 'Dummy Admissions record', 'ADMISSIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"admissions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ADMISSIONS-002', 'Sample Admissions 2', 'Dummy Admissions record', 'ADMISSIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"admissions"}' AS JSON), 2, 2);

INSERT IGNORE INTO wards (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'WARDS-001', 'Sample Wards 1', 'Dummy Wards record', 'WARDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"wards"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'WARDS-002', 'Sample Wards 2', 'Dummy Wards record', 'WARDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"wards"}' AS JSON), 2, 2);

INSERT IGNORE INTO rooms (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ROOMS-001', 'Sample Rooms 1', 'Dummy Rooms record', 'ROOMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"rooms"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ROOMS-002', 'Sample Rooms 2', 'Dummy Rooms record', 'ROOMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"rooms"}' AS JSON), 2, 2);

INSERT IGNORE INTO beds (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BEDS-001', 'Sample Beds 1', 'Dummy Beds record', 'BEDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"beds"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BEDS-002', 'Sample Beds 2', 'Dummy Beds record', 'BEDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"beds"}' AS JSON), 2, 2);

INSERT IGNORE INTO bed_allocations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BED_ALLOCATIONS-001', 'Sample Bed Allocations 1', 'Dummy Bed Allocations record', 'BED_ALLOCATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"bed_allocations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BED_ALLOCATIONS-002', 'Sample Bed Allocations 2', 'Dummy Bed Allocations record', 'BED_ALLOCATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"bed_allocations"}' AS JSON), 2, 2);

INSERT IGNORE INTO nursing_notes (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'NURSING_NOTES-001', 'Sample Nursing Notes 1', 'Dummy Nursing Notes record', 'NURSING_NOTES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"nursing_notes"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'NURSING_NOTES-002', 'Sample Nursing Notes 2', 'Dummy Nursing Notes record', 'NURSING_NOTES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"nursing_notes"}' AS JSON), 2, 2);

INSERT IGNORE INTO nursing_tasks (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'NURSING_TASKS-001', 'Sample Nursing Tasks 1', 'Dummy Nursing Tasks record', 'NURSING_TASKS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"nursing_tasks"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'NURSING_TASKS-002', 'Sample Nursing Tasks 2', 'Dummy Nursing Tasks record', 'NURSING_TASKS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"nursing_tasks"}' AS JSON), 2, 2);

INSERT IGNORE INTO nursing_care_plans (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'NURSING_CARE_PLANS-001', 'Sample Nursing Care Plans 1', 'Dummy Nursing Care Plans record', 'NURSING_CARE_PLANS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"nursing_care_plans"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'NURSING_CARE_PLANS-002', 'Sample Nursing Care Plans 2', 'Dummy Nursing Care Plans record', 'NURSING_CARE_PLANS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"nursing_care_plans"}' AS JSON), 2, 2);

INSERT IGNORE INTO discharge_plans (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DISCHARGE_PLANS-001', 'Sample Discharge Plans 1', 'Dummy Discharge Plans record', 'DISCHARGE_PLANS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"discharge_plans"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DISCHARGE_PLANS-002', 'Sample Discharge Plans 2', 'Dummy Discharge Plans record', 'DISCHARGE_PLANS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"discharge_plans"}' AS JSON), 2, 2);

INSERT IGNORE INTO discharge_summaries (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DISCHARGE_SUMMARIES-001', 'Sample Discharge Summaries 1', 'Dummy Discharge Summaries record', 'DISCHARGE_SUMMARIES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"discharge_summaries"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DISCHARGE_SUMMARIES-002', 'Sample Discharge Summaries 2', 'Dummy Discharge Summaries record', 'DISCHARGE_SUMMARIES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"discharge_summaries"}' AS JSON), 2, 2);

INSERT IGNORE INTO nutrition_orders (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'NUTRITION_ORDERS-001', 'Sample Nutrition Orders 1', 'Dummy Nutrition Orders record', 'NUTRITION_ORDERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"nutrition_orders"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'NUTRITION_ORDERS-002', 'Sample Nutrition Orders 2', 'Dummy Nutrition Orders record', 'NUTRITION_ORDERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"nutrition_orders"}' AS JSON), 2, 2);

INSERT IGNORE INTO nutrition_intakes (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'NUTRITION_INTAKES-001', 'Sample Nutrition Intakes 1', 'Dummy Nutrition Intakes record', 'NUTRITION_INTAKES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"nutrition_intakes"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'NUTRITION_INTAKES-002', 'Sample Nutrition Intakes 2', 'Dummy Nutrition Intakes record', 'NUTRITION_INTAKES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"nutrition_intakes"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 14 Surgery / OT / Anesthesia
-- ============================================================================================


INSERT IGNORE INTO operation_theatres (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'OPERATION_THEATRES-001', 'Sample Operation Theatres 1', 'Dummy Operation Theatres record', 'OPERATION_THEATRES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"operation_theatres"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'OPERATION_THEATRES-002', 'Sample Operation Theatres 2', 'Dummy Operation Theatres record', 'OPERATION_THEATRES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"operation_theatres"}' AS JSON), 2, 2);

INSERT IGNORE INTO surgery_cases (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SURGERY_CASES-001', 'Sample Surgery Cases 1', 'Dummy Surgery Cases record', 'SURGERY_CASES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"surgery_cases"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SURGERY_CASES-002', 'Sample Surgery Cases 2', 'Dummy Surgery Cases record', 'SURGERY_CASES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"surgery_cases"}' AS JSON), 2, 2);

INSERT IGNORE INTO surgery_team_members (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SURGERY_TEAM_MEMBERS-001', 'Sample Surgery Team Members 1', 'Dummy Surgery Team Members record', 'SURGERY_TEAM_MEMBERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"surgery_team_members"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SURGERY_TEAM_MEMBERS-002', 'Sample Surgery Team Members 2', 'Dummy Surgery Team Members record', 'SURGERY_TEAM_MEMBERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"surgery_team_members"}' AS JSON), 2, 2);

INSERT IGNORE INTO surgery_checklists (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SURGERY_CHECKLISTS-001', 'Sample Surgery Checklists 1', 'Dummy Surgery Checklists record', 'SURGERY_CHECKLISTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"surgery_checklists"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SURGERY_CHECKLISTS-002', 'Sample Surgery Checklists 2', 'Dummy Surgery Checklists record', 'SURGERY_CHECKLISTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"surgery_checklists"}' AS JSON), 2, 2);

INSERT IGNORE INTO anesthesia_records (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ANESTHESIA_RECORDS-001', 'Sample Anesthesia Records 1', 'Dummy Anesthesia Records record', 'ANESTHESIA_RECORDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"anesthesia_records"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ANESTHESIA_RECORDS-002', 'Sample Anesthesia Records 2', 'Dummy Anesthesia Records record', 'ANESTHESIA_RECORDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"anesthesia_records"}' AS JSON), 2, 2);

INSERT IGNORE INTO surgery_notes (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SURGERY_NOTES-001', 'Sample Surgery Notes 1', 'Dummy Surgery Notes record', 'SURGERY_NOTES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"surgery_notes"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SURGERY_NOTES-002', 'Sample Surgery Notes 2', 'Dummy Surgery Notes record', 'SURGERY_NOTES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"surgery_notes"}' AS JSON), 2, 2);

INSERT IGNORE INTO post_operation_notes (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'POST_OPERATION_NOTES-001', 'Sample Post Operation Notes 1', 'Dummy Post Operation Notes record', 'POST_OPERATION_NOTES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"post_operation_notes"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'POST_OPERATION_NOTES-002', 'Sample Post Operation Notes 2', 'Dummy Post Operation Notes record', 'POST_OPERATION_NOTES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"post_operation_notes"}' AS JSON), 2, 2);

INSERT IGNORE INTO procedure_devices (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PROCEDURE_DEVICES-001', 'Sample Procedure Devices 1', 'Dummy Procedure Devices record', 'PROCEDURE_DEVICES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"procedure_devices"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PROCEDURE_DEVICES-002', 'Sample Procedure Devices 2', 'Dummy Procedure Devices record', 'PROCEDURE_DEVICES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"procedure_devices"}' AS JSON), 2, 2);

INSERT IGNORE INTO body_structures (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BODY_STRUCTURES-001', 'Sample Body Structures 1', 'Dummy Body Structures record', 'BODY_STRUCTURES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"body_structures"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BODY_STRUCTURES-002', 'Sample Body Structures 2', 'Dummy Body Structures record', 'BODY_STRUCTURES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"body_structures"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 15 Emergency / Ambulance / Transport
-- ============================================================================================


INSERT IGNORE INTO emergency_cases (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'EMERGENCY_CASES-001', 'Sample Emergency Cases 1', 'Dummy Emergency Cases record', 'EMERGENCY_CASES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"emergency_cases"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'EMERGENCY_CASES-002', 'Sample Emergency Cases 2', 'Dummy Emergency Cases record', 'EMERGENCY_CASES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"emergency_cases"}' AS JSON), 2, 2);

INSERT IGNORE INTO triage_records (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'TRIAGE_RECORDS-001', 'Sample Triage Records 1', 'Dummy Triage Records record', 'TRIAGE_RECORDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"triage_records"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'TRIAGE_RECORDS-002', 'Sample Triage Records 2', 'Dummy Triage Records record', 'TRIAGE_RECORDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"triage_records"}' AS JSON), 2, 2);

INSERT IGNORE INTO ambulance_requests (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'AMBULANCE_REQUESTS-001', 'Sample Ambulance Requests 1', 'Dummy Ambulance Requests record', 'AMBULANCE_REQUESTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"ambulance_requests"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'AMBULANCE_REQUESTS-002', 'Sample Ambulance Requests 2', 'Dummy Ambulance Requests record', 'AMBULANCE_REQUESTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"ambulance_requests"}' AS JSON), 2, 2);

INSERT IGNORE INTO ambulance_dispatches (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'AMBULANCE_DISPATCHES-001', 'Sample Ambulance Dispatches 1', 'Dummy Ambulance Dispatches record', 'AMBULANCE_DISPATCHES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"ambulance_dispatches"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'AMBULANCE_DISPATCHES-002', 'Sample Ambulance Dispatches 2', 'Dummy Ambulance Dispatches record', 'AMBULANCE_DISPATCHES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"ambulance_dispatches"}' AS JSON), 2, 2);

INSERT IGNORE INTO ambulance_tracking (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'AMBULANCE_TRACKING-001', 'Sample Ambulance Tracking 1', 'Dummy Ambulance Tracking record', 'AMBULANCE_TRACKING-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"ambulance_tracking"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'AMBULANCE_TRACKING-002', 'Sample Ambulance Tracking 2', 'Dummy Ambulance Tracking record', 'AMBULANCE_TRACKING-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"ambulance_tracking"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_transports (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_TRANSPORTS-001', 'Sample Patient Transports 1', 'Dummy Patient Transports record', 'PATIENT_TRANSPORTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_transports"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_TRANSPORTS-002', 'Sample Patient Transports 2', 'Dummy Patient Transports record', 'PATIENT_TRANSPORTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_transports"}' AS JSON), 2, 2);

INSERT IGNORE INTO emergency_observations (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'EMERGENCY_OBSERVATIONS-001', 'Sample Emergency Observations 1', 'Dummy Emergency Observations record', 'EMERGENCY_OBSERVATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"emergency_observations"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'EMERGENCY_OBSERVATIONS-002', 'Sample Emergency Observations 2', 'Dummy Emergency Observations record', 'EMERGENCY_OBSERVATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"emergency_observations"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 16 Documents / Forms / Questionnaires
-- ============================================================================================


INSERT IGNORE INTO documents (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DOCUMENTS-001', 'Sample Documents 1', 'Dummy Documents record', 'DOCUMENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"documents"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DOCUMENTS-002', 'Sample Documents 2', 'Dummy Documents record', 'DOCUMENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"documents"}' AS JSON), 2, 2);

INSERT IGNORE INTO document_versions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DOCUMENT_VERSIONS-001', 'Sample Document Versions 1', 'Dummy Document Versions record', 'DOCUMENT_VERSIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"document_versions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DOCUMENT_VERSIONS-002', 'Sample Document Versions 2', 'Dummy Document Versions record', 'DOCUMENT_VERSIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"document_versions"}' AS JSON), 2, 2);

INSERT IGNORE INTO document_access_logs (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DOCUMENT_ACCESS_LOGS-001', 'Sample Document Access Logs 1', 'Dummy Document Access Logs record', 'DOCUMENT_ACCESS_LOGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"document_access_logs"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DOCUMENT_ACCESS_LOGS-002', 'Sample Document Access Logs 2', 'Dummy Document Access Logs record', 'DOCUMENT_ACCESS_LOGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"document_access_logs"}' AS JSON), 2, 2);

INSERT IGNORE INTO document_signatures (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DOCUMENT_SIGNATURES-001', 'Sample Document Signatures 1', 'Dummy Document Signatures record', 'DOCUMENT_SIGNATURES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"document_signatures"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DOCUMENT_SIGNATURES-002', 'Sample Document Signatures 2', 'Dummy Document Signatures record', 'DOCUMENT_SIGNATURES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"document_signatures"}' AS JSON), 2, 2);

INSERT IGNORE INTO compositions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'COMPOSITIONS-001', 'Sample Compositions 1', 'Dummy Compositions record', 'COMPOSITIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"compositions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'COMPOSITIONS-002', 'Sample Compositions 2', 'Dummy Compositions record', 'COMPOSITIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"compositions"}' AS JSON), 2, 2);

INSERT IGNORE INTO questionnaires (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'QUESTIONNAIRES-001', 'Sample Questionnaires 1', 'Dummy Questionnaires record', 'QUESTIONNAIRES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"questionnaires"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'QUESTIONNAIRES-002', 'Sample Questionnaires 2', 'Dummy Questionnaires record', 'QUESTIONNAIRES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"questionnaires"}' AS JSON), 2, 2);

INSERT IGNORE INTO questionnaire_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'QUESTIONNAIRE_ITEMS-001', 'Sample Questionnaire Items 1', 'Dummy Questionnaire Items record', 'QUESTIONNAIRE_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"questionnaire_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'QUESTIONNAIRE_ITEMS-002', 'Sample Questionnaire Items 2', 'Dummy Questionnaire Items record', 'QUESTIONNAIRE_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"questionnaire_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO questionnaire_responses (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'QUESTIONNAIRE_RESPONSES-001', 'Sample Questionnaire Responses 1', 'Dummy Questionnaire Responses record', 'QUESTIONNAIRE_RESPONSES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"questionnaire_responses"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'QUESTIONNAIRE_RESPONSES-002', 'Sample Questionnaire Responses 2', 'Dummy Questionnaire Responses record', 'QUESTIONNAIRE_RESPONSES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"questionnaire_responses"}' AS JSON), 2, 2);

INSERT IGNORE INTO questionnaire_response_items (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'QUESTIONNAIRE_RESPONSE_ITEMS-001', 'Sample Questionnaire Response Items 1', 'Dummy Questionnaire Response Items record', 'QUESTIONNAIRE_RESPONSE_ITEMS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"questionnaire_response_items"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'QUESTIONNAIRE_RESPONSE_ITEMS-002', 'Sample Questionnaire Response Items 2', 'Dummy Questionnaire Response Items record', 'QUESTIONNAIRE_RESPONSE_ITEMS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"questionnaire_response_items"}' AS JSON), 2, 2);

INSERT IGNORE INTO binary_files (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BINARY_FILES-001', 'Sample Binary Files 1', 'Dummy Binary Files record', 'BINARY_FILES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"binary_files"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BINARY_FILES-002', 'Sample Binary Files 2', 'Dummy Binary Files record', 'BINARY_FILES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"binary_files"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 17 Communication / Notification / Task
-- ============================================================================================


INSERT IGNORE INTO communications (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'COMMUNICATIONS-001', 'Sample Communications 1', 'Dummy Communications record', 'COMMUNICATIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"communications"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'COMMUNICATIONS-002', 'Sample Communications 2', 'Dummy Communications record', 'COMMUNICATIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"communications"}' AS JSON), 2, 2);

INSERT IGNORE INTO communication_requests (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'COMMUNICATION_REQUESTS-001', 'Sample Communication Requests 1', 'Dummy Communication Requests record', 'COMMUNICATION_REQUESTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"communication_requests"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'COMMUNICATION_REQUESTS-002', 'Sample Communication Requests 2', 'Dummy Communication Requests record', 'COMMUNICATION_REQUESTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"communication_requests"}' AS JSON), 2, 2);

INSERT IGNORE INTO tasks (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'TASKS-001', 'Sample Tasks 1', 'Dummy Tasks record', 'TASKS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"tasks"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'TASKS-002', 'Sample Tasks 2', 'Dummy Tasks record', 'TASKS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"tasks"}' AS JSON), 2, 2);

INSERT IGNORE INTO task_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'TASK_HISTORY-001', 'Sample Task History 1', 'Dummy Task History record', 'TASK_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"task_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'TASK_HISTORY-002', 'Sample Task History 2', 'Dummy Task History record', 'TASK_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"task_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO subscriptions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SUBSCRIPTIONS-001', 'Sample Subscriptions 1', 'Dummy Subscriptions record', 'SUBSCRIPTIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"subscriptions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SUBSCRIPTIONS-002', 'Sample Subscriptions 2', 'Dummy Subscriptions record', 'SUBSCRIPTIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"subscriptions"}' AS JSON), 2, 2);

INSERT IGNORE INTO subscription_events (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SUBSCRIPTION_EVENTS-001', 'Sample Subscription Events 1', 'Dummy Subscription Events record', 'SUBSCRIPTION_EVENTS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"subscription_events"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SUBSCRIPTION_EVENTS-002', 'Sample Subscription Events 2', 'Dummy Subscription Events record', 'SUBSCRIPTION_EVENTS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"subscription_events"}' AS JSON), 2, 2);

INSERT IGNORE INTO notification_logs (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'NOTIFICATION_LOGS-001', 'Sample Notification Logs 1', 'Dummy Notification Logs record', 'NOTIFICATION_LOGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"notification_logs"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'NOTIFICATION_LOGS-002', 'Sample Notification Logs 2', 'Dummy Notification Logs record', 'NOTIFICATION_LOGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"notification_logs"}' AS JSON), 2, 2);

INSERT IGNORE INTO message_headers (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'MESSAGE_HEADERS-001', 'Sample Message Headers 1', 'Dummy Message Headers record', 'MESSAGE_HEADERS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"message_headers"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'MESSAGE_HEADERS-002', 'Sample Message Headers 2', 'Dummy Message Headers record', 'MESSAGE_HEADERS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"message_headers"}' AS JSON), 2, 2);

INSERT IGNORE INTO bundles (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BUNDLES-001', 'Sample Bundles 1', 'Dummy Bundles record', 'BUNDLES-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"bundles"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BUNDLES-002', 'Sample Bundles 2', 'Dummy Bundles record', 'BUNDLES-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"bundles"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 18 Audit / Compliance / Consent / Provenance
-- ============================================================================================


INSERT IGNORE INTO audit_logs (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'AUDIT_LOGS-001', 'Sample Audit Logs 1', 'Dummy Audit Logs record', 'AUDIT_LOGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"audit_logs"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'AUDIT_LOGS-002', 'Sample Audit Logs 2', 'Dummy Audit Logs record', 'AUDIT_LOGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"audit_logs"}' AS JSON), 2, 2);

INSERT IGNORE INTO user_login_history (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'USER_LOGIN_HISTORY-001', 'Sample User Login History 1', 'Dummy User Login History record', 'USER_LOGIN_HISTORY-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"user_login_history"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'USER_LOGIN_HISTORY-002', 'Sample User Login History 2', 'Dummy User Login History record', 'USER_LOGIN_HISTORY-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"user_login_history"}' AS JSON), 2, 2);

INSERT IGNORE INTO patient_record_access_logs (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PATIENT_RECORD_ACCESS_LOGS-001', 'Sample Patient Record Access Logs 1', 'Dummy Patient Record Access Logs record', 'PATIENT_RECORD_ACCESS_LOGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"patient_record_access_logs"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PATIENT_RECORD_ACCESS_LOGS-002', 'Sample Patient Record Access Logs 2', 'Dummy Patient Record Access Logs record', 'PATIENT_RECORD_ACCESS_LOGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"patient_record_access_logs"}' AS JSON), 2, 2);

INSERT IGNORE INTO consent_records (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'CONSENT_RECORDS-001', 'Sample Consent Records 1', 'Dummy Consent Records record', 'CONSENT_RECORDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"consent_records"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'CONSENT_RECORDS-002', 'Sample Consent Records 2', 'Dummy Consent Records record', 'CONSENT_RECORDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"consent_records"}' AS JSON), 2, 2);

INSERT IGNORE INTO break_glass_access_logs (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'BREAK_GLASS_ACCESS_LOGS-001', 'Sample Break Glass Access Logs 1', 'Dummy Break Glass Access Logs record', 'BREAK_GLASS_ACCESS_LOGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"break_glass_access_logs"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'BREAK_GLASS_ACCESS_LOGS-002', 'Sample Break Glass Access Logs 2', 'Dummy Break Glass Access Logs record', 'BREAK_GLASS_ACCESS_LOGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"break_glass_access_logs"}' AS JSON), 2, 2);

INSERT IGNORE INTO data_export_logs (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'DATA_EXPORT_LOGS-001', 'Sample Data Export Logs 1', 'Dummy Data Export Logs record', 'DATA_EXPORT_LOGS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"data_export_logs"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'DATA_EXPORT_LOGS-002', 'Sample Data Export Logs 2', 'Dummy Data Export Logs record', 'DATA_EXPORT_LOGS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"data_export_logs"}' AS JSON), 2, 2);

INSERT IGNORE INTO provenance_records (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'PROVENANCE_RECORDS-001', 'Sample Provenance Records 1', 'Dummy Provenance Records record', 'PROVENANCE_RECORDS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"provenance_records"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'PROVENANCE_RECORDS-002', 'Sample Provenance Records 2', 'Dummy Provenance Records record', 'PROVENANCE_RECORDS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"provenance_records"}' AS JSON), 2, 2);

INSERT IGNORE INTO security_labels (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'SECURITY_LABELS-001', 'Sample Security Labels 1', 'Dummy Security Labels record', 'SECURITY_LABELS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"security_labels"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'SECURITY_LABELS-002', 'Sample Security Labels 2', 'Dummy Security Labels record', 'SECURITY_LABELS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"security_labels"}' AS JSON), 2, 2);

INSERT IGNORE INTO access_permissions (
  id, tenant_id, hospital_id, branch_id, patient_id, encounter_id, user_id, department_id,
  code, name, description, business_key, status, priority, order_no, invoice_no, amount_minor,
  event_date, event_time, event_at, start_at, end_at, notes, data_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 'ACCESS_PERMISSIONS-001', 'Sample Access Permissions 1', 'Dummy Access Permissions record', 'ACCESS_PERMISSIONS-001', 'ACTIVE', 'NORMAL', 'ORD-001', 'INV-001', 125000, '2026-06-01', '09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', '2026-06-01 09:30:00', 'Seed data for integration testing', CAST('{"sample":1,"table":"access_permissions"}' AS JSON), 1, 1),
(2, 2, 2, 2, 2, 2, 2, 1, 'ACCESS_PERMISSIONS-002', 'Sample Access Permissions 2', 'Dummy Access Permissions record', 'ACCESS_PERMISSIONS-002', 'ACTIVE', 'HIGH', 'ORD-002', 'INV-002', 245000, '2026-06-02', '10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', '2026-06-02 10:45:00', 'Seed data for integration testing', CAST('{"sample":2,"table":"access_permissions"}' AS JSON), 2, 2);


-- ============================================================================================
-- Seed data: 19 FHIR R5 Interoperability Layer
-- ============================================================================================


INSERT IGNORE INTO fhir_resource_types (id, resource_name, resource_category, fhir_version, is_supported, status, description)
VALUES
(1, 'Patient', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(2, 'Practitioner', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(3, 'PractitionerRole', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(4, 'RelatedPerson', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(5, 'Person', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(6, 'Group', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(7, 'Organization', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(8, 'OrganizationAffiliation', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(9, 'Location', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(10, 'HealthcareService', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(11, 'Endpoint', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(12, 'Device', 'Specialized resources', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(13, 'DeviceMetric', 'Specialized resources', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(14, 'DeviceRequest', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(15, 'DeviceUsage', 'Specialized resources', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(16, 'Appointment', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(17, 'AppointmentResponse', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(18, 'Schedule', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(19, 'Slot', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(20, 'Encounter', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(21, 'EncounterHistory', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(22, 'EpisodeOfCare', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(23, 'Flag', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(24, 'List', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(25, 'AllergyIntolerance', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(26, 'AdverseEvent', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(27, 'Condition', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(28, 'Procedure', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(29, 'FamilyMemberHistory', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(30, 'ClinicalImpression', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(31, 'DetectedIssue', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(32, 'Observation', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(33, 'DiagnosticReport', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(34, 'Specimen', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(35, 'ImagingStudy', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(36, 'ImagingSelection', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(37, 'Questionnaire', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(38, 'QuestionnaireResponse', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(39, 'Medication', 'Medications', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(40, 'MedicationRequest', 'Medications', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(41, 'MedicationAdministration', 'Medications', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(42, 'MedicationDispense', 'Medications', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(43, 'MedicationStatement', 'Medications', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(44, 'MedicationKnowledge', 'Medication Definition', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(45, 'Immunization', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(46, 'ImmunizationEvaluation', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(47, 'ImmunizationRecommendation', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(48, 'CarePlan', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(49, 'CareTeam', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(50, 'Goal', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(51, 'ServiceRequest', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(52, 'NutritionOrder', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(53, 'NutritionIntake', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(54, 'RiskAssessment', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(55, 'RequestOrchestration', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(56, 'Communication', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(57, 'CommunicationRequest', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(58, 'Task', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(59, 'Transport', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(60, 'Coverage', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(61, 'CoverageEligibilityRequest', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(62, 'CoverageEligibilityResponse', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(63, 'Claim', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(64, 'ClaimResponse', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(65, 'Invoice', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(66, 'Account', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(67, 'ChargeItem', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(68, 'ChargeItemDefinition', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(69, 'ExplanationOfBenefit', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(70, 'PaymentNotice', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(71, 'PaymentReconciliation', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(72, 'Contract', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(73, 'InsurancePlan', 'Financial', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(74, 'Consent', 'Security and Privacy', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(75, 'Provenance', 'Security and Privacy', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(76, 'AuditEvent', 'Security and Privacy', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(77, 'DocumentReference', 'Documents', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(78, 'Composition', 'Documents', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(79, 'Bundle', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(80, 'Binary', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(81, 'MessageHeader', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(82, 'OperationOutcome', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(83, 'Parameters', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(84, 'Subscription', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(85, 'SubscriptionStatus', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(86, 'SubscriptionTopic', 'Workflow', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(87, 'CodeSystem', 'Terminology', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(88, 'ValueSet', 'Terminology', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(89, 'ConceptMap', 'Terminology', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(90, 'NamingSystem', 'Terminology', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(91, 'StructureDefinition', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(92, 'CapabilityStatement', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(93, 'ImplementationGuide', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(94, 'SearchParameter', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(95, 'OperationDefinition', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(96, 'CompartmentDefinition', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(97, 'StructureMap', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(98, 'GraphDefinition', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(99, 'Library', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(100, 'PlanDefinition', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(101, 'GuidanceResponse', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(102, 'Measure', 'Quality Reporting', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(103, 'MeasureReport', 'Quality Reporting', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(104, 'InventoryItem', 'Specialized resources', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(105, 'InventoryReport', 'Specialized resources', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(106, 'SupplyRequest', 'Specialized resources', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(107, 'SupplyDelivery', 'Specialized resources', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(108, 'ResearchStudy', 'Public Health / Research', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(109, 'ResearchSubject', 'Public Health / Research', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(110, 'ActivityDefinition', 'Clinical Reasoning', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(111, 'Requirements', 'Foundation', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(112, 'ObservationDefinition', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(113, 'SpecimenDefinition', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(114, 'GenomicStudy', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(115, 'MolecularSequence', 'Diagnostics', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(116, 'BodyStructure', 'Clinical', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(117, 'Permission', 'Security and Privacy', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping'),
(118, 'Linkage', 'Base / Administration', 'R5', 1, 'ACTIVE', 'FHIR R5 resource metadata for interoperability mapping');

INSERT IGNORE INTO fhir_resource_mapping (
  id, tenant_id, hospital_id, branch_id, internal_table_name, internal_record_id, internal_business_key,
  fhir_resource_type, fhir_resource_id, fhir_version, profile_url, sync_status, last_synced_at
)
VALUES
(1, 1, 1, 1, 'patients', 1, 'PLH-000001', 'Patient', 'patient-1', 'R5', 'http://plasmit.example/fhir/Profile/Patient', 'SYNCED', '2026-06-03 12:00:00'),
(2, 2, 2, 2, 'encounters', 2, 'ENC-CCH-001', 'Encounter', 'encounter-2', 'R5', 'http://plasmit.example/fhir/Profile/Encounter', 'PENDING', NULL);

INSERT IGNORE INTO fhir_resource_store (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, version_id, profile_url,
  resource_json, resource_hash, status, last_updated
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', '1', 'http://plasmit.example/fhir/Profile/Patient', CAST('{"resourceType":"Patient","id":"patient-1","active":true}' AS JSON), 'hash-patient-1', 'CURRENT', '2026-06-03 12:00:00'),
(2, 2, 2, 2, 'Encounter', 'encounter-2', '1', 'http://plasmit.example/fhir/Profile/Encounter', CAST('{"resourceType":"Encounter","id":"encounter-2","status":"in-progress"}' AS JSON), 'hash-encounter-2', 'CURRENT', '2026-06-03 12:05:00');

INSERT IGNORE INTO fhir_resource_versions (id, tenant_id, hospital_id, branch_id, resource_type, resource_id, version_id, operation, resource_json, changed_by)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', '1', 'CREATE', CAST('{"resourceType":"Patient","id":"patient-1"}' AS JSON), 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', '1', 'CREATE', CAST('{"resourceType":"Encounter","id":"encounter-2"}' AS JSON), 2);

INSERT IGNORE INTO fhir_resource_references (
  id, tenant_id, hospital_id, branch_id, source_resource_type, source_resource_id, source_element_path,
  target_resource_type, target_resource_id, reference_value, display_text
)
VALUES
(1, 1, 1, 1, 'Encounter', 'encounter-1', 'Encounter.subject', 'Patient', 'patient-1', 'Patient/patient-1', 'Aman Kumar'),
(2, 2, 2, 2, 'DiagnosticReport', 'report-2', 'DiagnosticReport.subject', 'Patient', 'patient-2', 'Patient/patient-2', 'Sara Khan');

INSERT IGNORE INTO fhir_search_parameters (
  id, resource_type, parameter_name, parameter_type, expression, xpath, target_resource_type,
  comparator, modifier, chain_supported, status
)
VALUES
(1, 'Patient', 'identifier', 'token', 'Patient.identifier', NULL, NULL, NULL, 'missing', 0, 'ACTIVE'),
(2, 'Patient', 'name', 'string', 'Patient.name', NULL, NULL, NULL, 'contains', 0, 'ACTIVE'),
(3, 'Encounter', 'patient', 'reference', 'Encounter.subject.where(resolve() is Patient)', NULL, 'Patient', NULL, 'chain', 1, 'ACTIVE'),
(4, 'Observation', 'code', 'token', 'Observation.code', NULL, NULL, NULL, 'text', 0, 'ACTIVE'),
(5, 'DiagnosticReport', 'subject', 'reference', 'DiagnosticReport.subject', NULL, 'Patient', NULL, 'chain', 1, 'ACTIVE'),
(6, 'MedicationRequest', 'encounter', 'reference', 'MedicationRequest.encounter', NULL, 'Encounter', NULL, 'chain', 1, 'ACTIVE');

INSERT IGNORE INTO fhir_search_index (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, parameter_name, parameter_type,
  string_value, token_system, token_code, reference_value, date_value, number_value, quantity_value, uri_value
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'identifier', 'token', 'PLH-000001', 'http://plasmit.example/mrn', 'PLH-000001', NULL, NULL, NULL, NULL, NULL),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'patient', 'reference', NULL, NULL, NULL, 'Patient/patient-2', '2026-06-03 11:35:00', NULL, NULL, NULL);

INSERT IGNORE INTO fhir_profiles (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_profiles","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_profiles","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_structure_definitions (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_structure_definitions","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_structure_definitions","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_implementation_guides (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_implementation_guides","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_implementation_guides","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_capability_statements (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_capability_statements","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_capability_statements","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_operation_definitions (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_operation_definitions","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_operation_definitions","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_compartment_definitions (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_compartment_definitions","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_compartment_definitions","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_code_systems (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_code_systems","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_code_systems","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_value_sets (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_value_sets","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_value_sets","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_concept_maps (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_concept_maps","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_concept_maps","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_terminology_bindings (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_terminology_bindings","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_terminology_bindings","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_validation_results (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_validation_results","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_validation_results","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_sync_status (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_sync_status","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_sync_status","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_api_audit_log (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, canonical_url, version,
  name, title, status, system_url, code, display_text, payload_json, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'http://plasmit.example/fhir/Profile/Patient', '1.0.0', 'Plasmit Patient Profile', 'Plasmit Patient Profile', 'ACTIVE', 'http://terminology.hl7.org', 'active', 'Active', CAST('{"table":"fhir_api_audit_log","sample":1}' AS JSON), 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'http://plasmit.example/fhir/Profile/Encounter', '1.0.0', 'Plasmit Encounter Profile', 'Plasmit Encounter Profile', 'ACTIVE', 'http://terminology.hl7.org', 'in-progress', 'In Progress', CAST('{"table":"fhir_api_audit_log","sample":2}' AS JSON), 2, 2);

INSERT IGNORE INTO fhir_resource_element_definitions (
  id, resource_type, element_path, element_name, short_description, data_type, min_cardinality,
  max_cardinality, is_modifier, is_summary, binding_strength, value_set_url, reference_target_types, comments
)
VALUES
(1, 'Patient', 'Patient.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(2, 'Patient', 'Patient.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(3, 'Patient', 'Patient.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(4, 'Patient', 'Patient.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(5, 'Patient', 'Patient.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(6, 'Patient', 'Patient.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(7, 'Patient', 'Patient.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(8, 'Patient', 'Patient.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(9, 'Patient', 'Patient.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(10, 'Patient', 'Patient.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(11, 'Patient', 'Patient.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(12, 'Patient', 'Patient.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(13, 'Patient', 'Patient.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(14, 'Patient', 'Patient.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(15, 'Patient', 'Patient.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(16, 'Patient', 'Patient.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(17, 'Patient', 'Patient.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(18, 'Patient', 'Patient.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(19, 'Patient', 'Patient.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(20, 'Patient', 'Patient.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(21, 'Patient', 'Patient.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(22, 'Patient', 'Patient.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(23, 'Patient', 'Patient.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(24, 'Patient', 'Patient.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(25, 'Patient', 'Patient.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(26, 'Patient', 'Patient.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(27, 'Patient', 'Patient.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(28, 'Patient', 'Patient.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(29, 'Patient', 'Patient.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(30, 'Patient', 'Patient.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(31, 'Organization', 'Organization.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(32, 'Organization', 'Organization.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(33, 'Organization', 'Organization.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(34, 'Organization', 'Organization.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(35, 'Organization', 'Organization.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(36, 'Organization', 'Organization.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(37, 'Organization', 'Organization.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(38, 'Organization', 'Organization.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(39, 'Organization', 'Organization.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(40, 'Organization', 'Organization.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(41, 'Organization', 'Organization.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(42, 'Organization', 'Organization.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(43, 'Organization', 'Organization.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(44, 'Organization', 'Organization.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(45, 'Organization', 'Organization.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(46, 'Organization', 'Organization.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(47, 'Organization', 'Organization.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(48, 'Organization', 'Organization.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(49, 'Organization', 'Organization.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(50, 'Organization', 'Organization.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(51, 'Organization', 'Organization.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(52, 'Organization', 'Organization.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(53, 'Organization', 'Organization.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(54, 'Organization', 'Organization.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(55, 'Organization', 'Organization.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(56, 'Organization', 'Organization.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(57, 'Organization', 'Organization.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(58, 'Organization', 'Organization.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(59, 'Organization', 'Organization.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(60, 'Organization', 'Organization.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(61, 'Location', 'Location.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(62, 'Location', 'Location.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(63, 'Location', 'Location.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(64, 'Location', 'Location.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(65, 'Location', 'Location.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(66, 'Location', 'Location.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(67, 'Location', 'Location.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(68, 'Location', 'Location.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(69, 'Location', 'Location.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(70, 'Location', 'Location.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(71, 'Location', 'Location.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(72, 'Location', 'Location.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(73, 'Location', 'Location.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(74, 'Location', 'Location.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(75, 'Location', 'Location.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(76, 'Location', 'Location.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(77, 'Location', 'Location.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(78, 'Location', 'Location.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(79, 'Location', 'Location.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(80, 'Location', 'Location.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(81, 'Location', 'Location.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(82, 'Location', 'Location.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(83, 'Location', 'Location.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(84, 'Location', 'Location.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(85, 'Location', 'Location.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(86, 'Location', 'Location.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(87, 'Location', 'Location.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(88, 'Location', 'Location.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(89, 'Location', 'Location.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(90, 'Location', 'Location.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(91, 'Practitioner', 'Practitioner.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(92, 'Practitioner', 'Practitioner.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(93, 'Practitioner', 'Practitioner.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(94, 'Practitioner', 'Practitioner.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(95, 'Practitioner', 'Practitioner.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(96, 'Practitioner', 'Practitioner.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(97, 'Practitioner', 'Practitioner.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(98, 'Practitioner', 'Practitioner.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(99, 'Practitioner', 'Practitioner.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(100, 'Practitioner', 'Practitioner.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(101, 'Practitioner', 'Practitioner.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(102, 'Practitioner', 'Practitioner.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(103, 'Practitioner', 'Practitioner.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(104, 'Practitioner', 'Practitioner.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(105, 'Practitioner', 'Practitioner.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(106, 'Practitioner', 'Practitioner.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(107, 'Practitioner', 'Practitioner.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(108, 'Practitioner', 'Practitioner.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(109, 'Practitioner', 'Practitioner.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(110, 'Practitioner', 'Practitioner.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(111, 'Practitioner', 'Practitioner.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(112, 'Practitioner', 'Practitioner.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(113, 'Practitioner', 'Practitioner.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(114, 'Practitioner', 'Practitioner.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(115, 'Practitioner', 'Practitioner.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(116, 'Practitioner', 'Practitioner.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(117, 'Practitioner', 'Practitioner.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(118, 'Practitioner', 'Practitioner.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(119, 'Practitioner', 'Practitioner.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(120, 'Practitioner', 'Practitioner.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(121, 'PractitionerRole', 'PractitionerRole.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(122, 'PractitionerRole', 'PractitionerRole.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(123, 'PractitionerRole', 'PractitionerRole.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(124, 'PractitionerRole', 'PractitionerRole.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(125, 'PractitionerRole', 'PractitionerRole.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(126, 'PractitionerRole', 'PractitionerRole.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(127, 'PractitionerRole', 'PractitionerRole.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(128, 'PractitionerRole', 'PractitionerRole.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(129, 'PractitionerRole', 'PractitionerRole.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(130, 'PractitionerRole', 'PractitionerRole.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(131, 'PractitionerRole', 'PractitionerRole.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(132, 'PractitionerRole', 'PractitionerRole.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(133, 'PractitionerRole', 'PractitionerRole.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(134, 'PractitionerRole', 'PractitionerRole.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(135, 'PractitionerRole', 'PractitionerRole.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(136, 'PractitionerRole', 'PractitionerRole.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(137, 'PractitionerRole', 'PractitionerRole.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(138, 'PractitionerRole', 'PractitionerRole.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(139, 'PractitionerRole', 'PractitionerRole.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(140, 'PractitionerRole', 'PractitionerRole.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(141, 'PractitionerRole', 'PractitionerRole.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(142, 'PractitionerRole', 'PractitionerRole.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(143, 'PractitionerRole', 'PractitionerRole.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(144, 'PractitionerRole', 'PractitionerRole.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(145, 'PractitionerRole', 'PractitionerRole.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(146, 'PractitionerRole', 'PractitionerRole.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(147, 'PractitionerRole', 'PractitionerRole.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(148, 'PractitionerRole', 'PractitionerRole.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(149, 'PractitionerRole', 'PractitionerRole.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(150, 'PractitionerRole', 'PractitionerRole.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(151, 'HealthcareService', 'HealthcareService.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(152, 'HealthcareService', 'HealthcareService.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(153, 'HealthcareService', 'HealthcareService.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(154, 'HealthcareService', 'HealthcareService.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(155, 'HealthcareService', 'HealthcareService.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(156, 'HealthcareService', 'HealthcareService.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(157, 'HealthcareService', 'HealthcareService.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(158, 'HealthcareService', 'HealthcareService.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(159, 'HealthcareService', 'HealthcareService.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(160, 'HealthcareService', 'HealthcareService.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(161, 'HealthcareService', 'HealthcareService.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(162, 'HealthcareService', 'HealthcareService.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(163, 'HealthcareService', 'HealthcareService.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(164, 'HealthcareService', 'HealthcareService.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(165, 'HealthcareService', 'HealthcareService.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(166, 'HealthcareService', 'HealthcareService.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(167, 'HealthcareService', 'HealthcareService.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(168, 'HealthcareService', 'HealthcareService.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(169, 'HealthcareService', 'HealthcareService.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(170, 'HealthcareService', 'HealthcareService.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(171, 'HealthcareService', 'HealthcareService.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(172, 'HealthcareService', 'HealthcareService.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(173, 'HealthcareService', 'HealthcareService.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(174, 'HealthcareService', 'HealthcareService.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(175, 'HealthcareService', 'HealthcareService.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(176, 'HealthcareService', 'HealthcareService.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(177, 'HealthcareService', 'HealthcareService.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(178, 'HealthcareService', 'HealthcareService.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(179, 'HealthcareService', 'HealthcareService.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(180, 'HealthcareService', 'HealthcareService.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(181, 'Appointment', 'Appointment.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(182, 'Appointment', 'Appointment.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(183, 'Appointment', 'Appointment.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(184, 'Appointment', 'Appointment.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(185, 'Appointment', 'Appointment.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(186, 'Appointment', 'Appointment.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(187, 'Appointment', 'Appointment.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(188, 'Appointment', 'Appointment.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(189, 'Appointment', 'Appointment.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(190, 'Appointment', 'Appointment.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(191, 'Appointment', 'Appointment.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(192, 'Appointment', 'Appointment.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(193, 'Appointment', 'Appointment.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(194, 'Appointment', 'Appointment.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(195, 'Appointment', 'Appointment.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(196, 'Appointment', 'Appointment.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(197, 'Appointment', 'Appointment.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(198, 'Appointment', 'Appointment.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(199, 'Appointment', 'Appointment.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(200, 'Appointment', 'Appointment.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(201, 'Appointment', 'Appointment.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(202, 'Appointment', 'Appointment.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(203, 'Appointment', 'Appointment.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(204, 'Appointment', 'Appointment.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(205, 'Appointment', 'Appointment.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(206, 'Appointment', 'Appointment.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(207, 'Appointment', 'Appointment.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(208, 'Appointment', 'Appointment.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(209, 'Appointment', 'Appointment.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(210, 'Appointment', 'Appointment.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(211, 'Encounter', 'Encounter.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(212, 'Encounter', 'Encounter.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(213, 'Encounter', 'Encounter.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(214, 'Encounter', 'Encounter.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(215, 'Encounter', 'Encounter.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(216, 'Encounter', 'Encounter.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(217, 'Encounter', 'Encounter.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(218, 'Encounter', 'Encounter.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(219, 'Encounter', 'Encounter.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(220, 'Encounter', 'Encounter.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(221, 'Encounter', 'Encounter.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(222, 'Encounter', 'Encounter.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(223, 'Encounter', 'Encounter.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(224, 'Encounter', 'Encounter.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(225, 'Encounter', 'Encounter.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(226, 'Encounter', 'Encounter.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(227, 'Encounter', 'Encounter.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(228, 'Encounter', 'Encounter.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(229, 'Encounter', 'Encounter.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(230, 'Encounter', 'Encounter.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(231, 'Encounter', 'Encounter.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(232, 'Encounter', 'Encounter.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(233, 'Encounter', 'Encounter.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(234, 'Encounter', 'Encounter.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(235, 'Encounter', 'Encounter.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(236, 'Encounter', 'Encounter.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(237, 'Encounter', 'Encounter.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(238, 'Encounter', 'Encounter.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(239, 'Encounter', 'Encounter.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(240, 'Encounter', 'Encounter.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(241, 'Observation', 'Observation.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(242, 'Observation', 'Observation.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(243, 'Observation', 'Observation.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(244, 'Observation', 'Observation.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(245, 'Observation', 'Observation.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(246, 'Observation', 'Observation.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(247, 'Observation', 'Observation.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(248, 'Observation', 'Observation.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(249, 'Observation', 'Observation.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(250, 'Observation', 'Observation.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping');

INSERT IGNORE INTO fhir_resource_element_definitions (
  id, resource_type, element_path, element_name, short_description, data_type, min_cardinality,
  max_cardinality, is_modifier, is_summary, binding_strength, value_set_url, reference_target_types, comments
)
VALUES
(251, 'Observation', 'Observation.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(252, 'Observation', 'Observation.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(253, 'Observation', 'Observation.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(254, 'Observation', 'Observation.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(255, 'Observation', 'Observation.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(256, 'Observation', 'Observation.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(257, 'Observation', 'Observation.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(258, 'Observation', 'Observation.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(259, 'Observation', 'Observation.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(260, 'Observation', 'Observation.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(261, 'Observation', 'Observation.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(262, 'Observation', 'Observation.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(263, 'Observation', 'Observation.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(264, 'Observation', 'Observation.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(265, 'Observation', 'Observation.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(266, 'Observation', 'Observation.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(267, 'Observation', 'Observation.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(268, 'Observation', 'Observation.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(269, 'Observation', 'Observation.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(270, 'Observation', 'Observation.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(271, 'Condition', 'Condition.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(272, 'Condition', 'Condition.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(273, 'Condition', 'Condition.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(274, 'Condition', 'Condition.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(275, 'Condition', 'Condition.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(276, 'Condition', 'Condition.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(277, 'Condition', 'Condition.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(278, 'Condition', 'Condition.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(279, 'Condition', 'Condition.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(280, 'Condition', 'Condition.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(281, 'Condition', 'Condition.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(282, 'Condition', 'Condition.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(283, 'Condition', 'Condition.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(284, 'Condition', 'Condition.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(285, 'Condition', 'Condition.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(286, 'Condition', 'Condition.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(287, 'Condition', 'Condition.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(288, 'Condition', 'Condition.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(289, 'Condition', 'Condition.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(290, 'Condition', 'Condition.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(291, 'Condition', 'Condition.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(292, 'Condition', 'Condition.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(293, 'Condition', 'Condition.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(294, 'Condition', 'Condition.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(295, 'Condition', 'Condition.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(296, 'Condition', 'Condition.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(297, 'Condition', 'Condition.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(298, 'Condition', 'Condition.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(299, 'Condition', 'Condition.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(300, 'Condition', 'Condition.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(301, 'Procedure', 'Procedure.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(302, 'Procedure', 'Procedure.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(303, 'Procedure', 'Procedure.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(304, 'Procedure', 'Procedure.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(305, 'Procedure', 'Procedure.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(306, 'Procedure', 'Procedure.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(307, 'Procedure', 'Procedure.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(308, 'Procedure', 'Procedure.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(309, 'Procedure', 'Procedure.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(310, 'Procedure', 'Procedure.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(311, 'Procedure', 'Procedure.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(312, 'Procedure', 'Procedure.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(313, 'Procedure', 'Procedure.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(314, 'Procedure', 'Procedure.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(315, 'Procedure', 'Procedure.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(316, 'Procedure', 'Procedure.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(317, 'Procedure', 'Procedure.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(318, 'Procedure', 'Procedure.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(319, 'Procedure', 'Procedure.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(320, 'Procedure', 'Procedure.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(321, 'Procedure', 'Procedure.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(322, 'Procedure', 'Procedure.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(323, 'Procedure', 'Procedure.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(324, 'Procedure', 'Procedure.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(325, 'Procedure', 'Procedure.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(326, 'Procedure', 'Procedure.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(327, 'Procedure', 'Procedure.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(328, 'Procedure', 'Procedure.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(329, 'Procedure', 'Procedure.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(330, 'Procedure', 'Procedure.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(331, 'ServiceRequest', 'ServiceRequest.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(332, 'ServiceRequest', 'ServiceRequest.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(333, 'ServiceRequest', 'ServiceRequest.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(334, 'ServiceRequest', 'ServiceRequest.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(335, 'ServiceRequest', 'ServiceRequest.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(336, 'ServiceRequest', 'ServiceRequest.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(337, 'ServiceRequest', 'ServiceRequest.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(338, 'ServiceRequest', 'ServiceRequest.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(339, 'ServiceRequest', 'ServiceRequest.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(340, 'ServiceRequest', 'ServiceRequest.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(341, 'ServiceRequest', 'ServiceRequest.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(342, 'ServiceRequest', 'ServiceRequest.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(343, 'ServiceRequest', 'ServiceRequest.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(344, 'ServiceRequest', 'ServiceRequest.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(345, 'ServiceRequest', 'ServiceRequest.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(346, 'ServiceRequest', 'ServiceRequest.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(347, 'ServiceRequest', 'ServiceRequest.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(348, 'ServiceRequest', 'ServiceRequest.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(349, 'ServiceRequest', 'ServiceRequest.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(350, 'ServiceRequest', 'ServiceRequest.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(351, 'ServiceRequest', 'ServiceRequest.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(352, 'ServiceRequest', 'ServiceRequest.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(353, 'ServiceRequest', 'ServiceRequest.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(354, 'ServiceRequest', 'ServiceRequest.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(355, 'ServiceRequest', 'ServiceRequest.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(356, 'ServiceRequest', 'ServiceRequest.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(357, 'ServiceRequest', 'ServiceRequest.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(358, 'ServiceRequest', 'ServiceRequest.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(359, 'ServiceRequest', 'ServiceRequest.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(360, 'ServiceRequest', 'ServiceRequest.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(361, 'DiagnosticReport', 'DiagnosticReport.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(362, 'DiagnosticReport', 'DiagnosticReport.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(363, 'DiagnosticReport', 'DiagnosticReport.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(364, 'DiagnosticReport', 'DiagnosticReport.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(365, 'DiagnosticReport', 'DiagnosticReport.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(366, 'DiagnosticReport', 'DiagnosticReport.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(367, 'DiagnosticReport', 'DiagnosticReport.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(368, 'DiagnosticReport', 'DiagnosticReport.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(369, 'DiagnosticReport', 'DiagnosticReport.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(370, 'DiagnosticReport', 'DiagnosticReport.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(371, 'DiagnosticReport', 'DiagnosticReport.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(372, 'DiagnosticReport', 'DiagnosticReport.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(373, 'DiagnosticReport', 'DiagnosticReport.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(374, 'DiagnosticReport', 'DiagnosticReport.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(375, 'DiagnosticReport', 'DiagnosticReport.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(376, 'DiagnosticReport', 'DiagnosticReport.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(377, 'DiagnosticReport', 'DiagnosticReport.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(378, 'DiagnosticReport', 'DiagnosticReport.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(379, 'DiagnosticReport', 'DiagnosticReport.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(380, 'DiagnosticReport', 'DiagnosticReport.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(381, 'DiagnosticReport', 'DiagnosticReport.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(382, 'DiagnosticReport', 'DiagnosticReport.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(383, 'DiagnosticReport', 'DiagnosticReport.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(384, 'DiagnosticReport', 'DiagnosticReport.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(385, 'DiagnosticReport', 'DiagnosticReport.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(386, 'DiagnosticReport', 'DiagnosticReport.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(387, 'DiagnosticReport', 'DiagnosticReport.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(388, 'DiagnosticReport', 'DiagnosticReport.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(389, 'DiagnosticReport', 'DiagnosticReport.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(390, 'DiagnosticReport', 'DiagnosticReport.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(391, 'Specimen', 'Specimen.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(392, 'Specimen', 'Specimen.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(393, 'Specimen', 'Specimen.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(394, 'Specimen', 'Specimen.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(395, 'Specimen', 'Specimen.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(396, 'Specimen', 'Specimen.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(397, 'Specimen', 'Specimen.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(398, 'Specimen', 'Specimen.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(399, 'Specimen', 'Specimen.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(400, 'Specimen', 'Specimen.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(401, 'Specimen', 'Specimen.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(402, 'Specimen', 'Specimen.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(403, 'Specimen', 'Specimen.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(404, 'Specimen', 'Specimen.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(405, 'Specimen', 'Specimen.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(406, 'Specimen', 'Specimen.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(407, 'Specimen', 'Specimen.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(408, 'Specimen', 'Specimen.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(409, 'Specimen', 'Specimen.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(410, 'Specimen', 'Specimen.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(411, 'Specimen', 'Specimen.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(412, 'Specimen', 'Specimen.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(413, 'Specimen', 'Specimen.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(414, 'Specimen', 'Specimen.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(415, 'Specimen', 'Specimen.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(416, 'Specimen', 'Specimen.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(417, 'Specimen', 'Specimen.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(418, 'Specimen', 'Specimen.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(419, 'Specimen', 'Specimen.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(420, 'Specimen', 'Specimen.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(421, 'Medication', 'Medication.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(422, 'Medication', 'Medication.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(423, 'Medication', 'Medication.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(424, 'Medication', 'Medication.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(425, 'Medication', 'Medication.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(426, 'Medication', 'Medication.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(427, 'Medication', 'Medication.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(428, 'Medication', 'Medication.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(429, 'Medication', 'Medication.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(430, 'Medication', 'Medication.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(431, 'Medication', 'Medication.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(432, 'Medication', 'Medication.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(433, 'Medication', 'Medication.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(434, 'Medication', 'Medication.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(435, 'Medication', 'Medication.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(436, 'Medication', 'Medication.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(437, 'Medication', 'Medication.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(438, 'Medication', 'Medication.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(439, 'Medication', 'Medication.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(440, 'Medication', 'Medication.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(441, 'Medication', 'Medication.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(442, 'Medication', 'Medication.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(443, 'Medication', 'Medication.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(444, 'Medication', 'Medication.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(445, 'Medication', 'Medication.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(446, 'Medication', 'Medication.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(447, 'Medication', 'Medication.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(448, 'Medication', 'Medication.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(449, 'Medication', 'Medication.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(450, 'Medication', 'Medication.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(451, 'MedicationRequest', 'MedicationRequest.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(452, 'MedicationRequest', 'MedicationRequest.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(453, 'MedicationRequest', 'MedicationRequest.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(454, 'MedicationRequest', 'MedicationRequest.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(455, 'MedicationRequest', 'MedicationRequest.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(456, 'MedicationRequest', 'MedicationRequest.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(457, 'MedicationRequest', 'MedicationRequest.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(458, 'MedicationRequest', 'MedicationRequest.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(459, 'MedicationRequest', 'MedicationRequest.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(460, 'MedicationRequest', 'MedicationRequest.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(461, 'MedicationRequest', 'MedicationRequest.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(462, 'MedicationRequest', 'MedicationRequest.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(463, 'MedicationRequest', 'MedicationRequest.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(464, 'MedicationRequest', 'MedicationRequest.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(465, 'MedicationRequest', 'MedicationRequest.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(466, 'MedicationRequest', 'MedicationRequest.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(467, 'MedicationRequest', 'MedicationRequest.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(468, 'MedicationRequest', 'MedicationRequest.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(469, 'MedicationRequest', 'MedicationRequest.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(470, 'MedicationRequest', 'MedicationRequest.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(471, 'MedicationRequest', 'MedicationRequest.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(472, 'MedicationRequest', 'MedicationRequest.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(473, 'MedicationRequest', 'MedicationRequest.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(474, 'MedicationRequest', 'MedicationRequest.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(475, 'MedicationRequest', 'MedicationRequest.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(476, 'MedicationRequest', 'MedicationRequest.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(477, 'MedicationRequest', 'MedicationRequest.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(478, 'MedicationRequest', 'MedicationRequest.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(479, 'MedicationRequest', 'MedicationRequest.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(480, 'MedicationRequest', 'MedicationRequest.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(481, 'MedicationAdministration', 'MedicationAdministration.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(482, 'MedicationAdministration', 'MedicationAdministration.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(483, 'MedicationAdministration', 'MedicationAdministration.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(484, 'MedicationAdministration', 'MedicationAdministration.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(485, 'MedicationAdministration', 'MedicationAdministration.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(486, 'MedicationAdministration', 'MedicationAdministration.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(487, 'MedicationAdministration', 'MedicationAdministration.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(488, 'MedicationAdministration', 'MedicationAdministration.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(489, 'MedicationAdministration', 'MedicationAdministration.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(490, 'MedicationAdministration', 'MedicationAdministration.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(491, 'MedicationAdministration', 'MedicationAdministration.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(492, 'MedicationAdministration', 'MedicationAdministration.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(493, 'MedicationAdministration', 'MedicationAdministration.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(494, 'MedicationAdministration', 'MedicationAdministration.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(495, 'MedicationAdministration', 'MedicationAdministration.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(496, 'MedicationAdministration', 'MedicationAdministration.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(497, 'MedicationAdministration', 'MedicationAdministration.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(498, 'MedicationAdministration', 'MedicationAdministration.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(499, 'MedicationAdministration', 'MedicationAdministration.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(500, 'MedicationAdministration', 'MedicationAdministration.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping');

INSERT IGNORE INTO fhir_resource_element_definitions (
  id, resource_type, element_path, element_name, short_description, data_type, min_cardinality,
  max_cardinality, is_modifier, is_summary, binding_strength, value_set_url, reference_target_types, comments
)
VALUES
(501, 'MedicationAdministration', 'MedicationAdministration.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(502, 'MedicationAdministration', 'MedicationAdministration.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(503, 'MedicationAdministration', 'MedicationAdministration.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(504, 'MedicationAdministration', 'MedicationAdministration.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(505, 'MedicationAdministration', 'MedicationAdministration.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(506, 'MedicationAdministration', 'MedicationAdministration.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(507, 'MedicationAdministration', 'MedicationAdministration.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(508, 'MedicationAdministration', 'MedicationAdministration.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(509, 'MedicationAdministration', 'MedicationAdministration.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(510, 'MedicationAdministration', 'MedicationAdministration.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(511, 'MedicationDispense', 'MedicationDispense.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(512, 'MedicationDispense', 'MedicationDispense.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(513, 'MedicationDispense', 'MedicationDispense.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(514, 'MedicationDispense', 'MedicationDispense.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(515, 'MedicationDispense', 'MedicationDispense.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(516, 'MedicationDispense', 'MedicationDispense.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(517, 'MedicationDispense', 'MedicationDispense.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(518, 'MedicationDispense', 'MedicationDispense.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(519, 'MedicationDispense', 'MedicationDispense.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(520, 'MedicationDispense', 'MedicationDispense.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(521, 'MedicationDispense', 'MedicationDispense.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(522, 'MedicationDispense', 'MedicationDispense.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(523, 'MedicationDispense', 'MedicationDispense.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(524, 'MedicationDispense', 'MedicationDispense.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(525, 'MedicationDispense', 'MedicationDispense.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(526, 'MedicationDispense', 'MedicationDispense.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(527, 'MedicationDispense', 'MedicationDispense.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(528, 'MedicationDispense', 'MedicationDispense.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(529, 'MedicationDispense', 'MedicationDispense.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(530, 'MedicationDispense', 'MedicationDispense.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(531, 'MedicationDispense', 'MedicationDispense.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(532, 'MedicationDispense', 'MedicationDispense.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(533, 'MedicationDispense', 'MedicationDispense.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(534, 'MedicationDispense', 'MedicationDispense.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(535, 'MedicationDispense', 'MedicationDispense.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(536, 'MedicationDispense', 'MedicationDispense.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(537, 'MedicationDispense', 'MedicationDispense.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(538, 'MedicationDispense', 'MedicationDispense.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(539, 'MedicationDispense', 'MedicationDispense.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(540, 'MedicationDispense', 'MedicationDispense.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(541, 'CarePlan', 'CarePlan.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(542, 'CarePlan', 'CarePlan.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(543, 'CarePlan', 'CarePlan.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(544, 'CarePlan', 'CarePlan.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(545, 'CarePlan', 'CarePlan.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(546, 'CarePlan', 'CarePlan.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(547, 'CarePlan', 'CarePlan.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(548, 'CarePlan', 'CarePlan.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(549, 'CarePlan', 'CarePlan.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(550, 'CarePlan', 'CarePlan.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(551, 'CarePlan', 'CarePlan.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(552, 'CarePlan', 'CarePlan.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(553, 'CarePlan', 'CarePlan.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(554, 'CarePlan', 'CarePlan.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(555, 'CarePlan', 'CarePlan.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(556, 'CarePlan', 'CarePlan.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(557, 'CarePlan', 'CarePlan.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(558, 'CarePlan', 'CarePlan.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(559, 'CarePlan', 'CarePlan.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(560, 'CarePlan', 'CarePlan.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(561, 'CarePlan', 'CarePlan.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(562, 'CarePlan', 'CarePlan.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(563, 'CarePlan', 'CarePlan.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(564, 'CarePlan', 'CarePlan.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(565, 'CarePlan', 'CarePlan.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(566, 'CarePlan', 'CarePlan.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(567, 'CarePlan', 'CarePlan.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(568, 'CarePlan', 'CarePlan.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(569, 'CarePlan', 'CarePlan.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(570, 'CarePlan', 'CarePlan.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(571, 'Goal', 'Goal.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(572, 'Goal', 'Goal.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(573, 'Goal', 'Goal.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(574, 'Goal', 'Goal.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(575, 'Goal', 'Goal.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(576, 'Goal', 'Goal.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(577, 'Goal', 'Goal.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(578, 'Goal', 'Goal.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(579, 'Goal', 'Goal.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(580, 'Goal', 'Goal.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(581, 'Goal', 'Goal.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(582, 'Goal', 'Goal.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(583, 'Goal', 'Goal.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(584, 'Goal', 'Goal.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(585, 'Goal', 'Goal.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(586, 'Goal', 'Goal.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(587, 'Goal', 'Goal.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(588, 'Goal', 'Goal.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(589, 'Goal', 'Goal.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(590, 'Goal', 'Goal.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(591, 'Goal', 'Goal.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(592, 'Goal', 'Goal.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(593, 'Goal', 'Goal.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(594, 'Goal', 'Goal.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(595, 'Goal', 'Goal.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(596, 'Goal', 'Goal.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(597, 'Goal', 'Goal.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(598, 'Goal', 'Goal.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(599, 'Goal', 'Goal.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(600, 'Goal', 'Goal.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(601, 'DocumentReference', 'DocumentReference.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(602, 'DocumentReference', 'DocumentReference.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(603, 'DocumentReference', 'DocumentReference.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(604, 'DocumentReference', 'DocumentReference.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(605, 'DocumentReference', 'DocumentReference.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(606, 'DocumentReference', 'DocumentReference.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(607, 'DocumentReference', 'DocumentReference.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(608, 'DocumentReference', 'DocumentReference.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(609, 'DocumentReference', 'DocumentReference.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(610, 'DocumentReference', 'DocumentReference.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(611, 'DocumentReference', 'DocumentReference.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(612, 'DocumentReference', 'DocumentReference.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(613, 'DocumentReference', 'DocumentReference.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(614, 'DocumentReference', 'DocumentReference.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(615, 'DocumentReference', 'DocumentReference.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(616, 'DocumentReference', 'DocumentReference.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(617, 'DocumentReference', 'DocumentReference.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(618, 'DocumentReference', 'DocumentReference.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(619, 'DocumentReference', 'DocumentReference.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(620, 'DocumentReference', 'DocumentReference.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(621, 'DocumentReference', 'DocumentReference.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(622, 'DocumentReference', 'DocumentReference.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(623, 'DocumentReference', 'DocumentReference.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(624, 'DocumentReference', 'DocumentReference.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(625, 'DocumentReference', 'DocumentReference.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(626, 'DocumentReference', 'DocumentReference.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(627, 'DocumentReference', 'DocumentReference.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(628, 'DocumentReference', 'DocumentReference.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(629, 'DocumentReference', 'DocumentReference.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(630, 'DocumentReference', 'DocumentReference.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(631, 'Composition', 'Composition.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(632, 'Composition', 'Composition.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(633, 'Composition', 'Composition.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(634, 'Composition', 'Composition.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(635, 'Composition', 'Composition.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(636, 'Composition', 'Composition.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(637, 'Composition', 'Composition.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(638, 'Composition', 'Composition.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(639, 'Composition', 'Composition.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(640, 'Composition', 'Composition.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(641, 'Composition', 'Composition.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(642, 'Composition', 'Composition.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(643, 'Composition', 'Composition.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(644, 'Composition', 'Composition.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(645, 'Composition', 'Composition.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(646, 'Composition', 'Composition.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(647, 'Composition', 'Composition.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(648, 'Composition', 'Composition.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(649, 'Composition', 'Composition.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(650, 'Composition', 'Composition.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(651, 'Composition', 'Composition.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(652, 'Composition', 'Composition.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(653, 'Composition', 'Composition.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(654, 'Composition', 'Composition.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(655, 'Composition', 'Composition.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(656, 'Composition', 'Composition.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(657, 'Composition', 'Composition.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(658, 'Composition', 'Composition.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(659, 'Composition', 'Composition.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(660, 'Composition', 'Composition.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(661, 'Consent', 'Consent.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(662, 'Consent', 'Consent.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(663, 'Consent', 'Consent.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(664, 'Consent', 'Consent.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(665, 'Consent', 'Consent.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(666, 'Consent', 'Consent.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(667, 'Consent', 'Consent.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(668, 'Consent', 'Consent.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(669, 'Consent', 'Consent.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(670, 'Consent', 'Consent.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(671, 'Consent', 'Consent.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(672, 'Consent', 'Consent.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(673, 'Consent', 'Consent.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(674, 'Consent', 'Consent.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(675, 'Consent', 'Consent.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(676, 'Consent', 'Consent.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(677, 'Consent', 'Consent.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(678, 'Consent', 'Consent.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(679, 'Consent', 'Consent.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(680, 'Consent', 'Consent.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(681, 'Consent', 'Consent.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(682, 'Consent', 'Consent.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(683, 'Consent', 'Consent.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(684, 'Consent', 'Consent.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(685, 'Consent', 'Consent.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(686, 'Consent', 'Consent.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(687, 'Consent', 'Consent.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(688, 'Consent', 'Consent.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(689, 'Consent', 'Consent.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(690, 'Consent', 'Consent.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(691, 'Provenance', 'Provenance.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(692, 'Provenance', 'Provenance.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(693, 'Provenance', 'Provenance.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(694, 'Provenance', 'Provenance.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(695, 'Provenance', 'Provenance.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(696, 'Provenance', 'Provenance.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(697, 'Provenance', 'Provenance.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(698, 'Provenance', 'Provenance.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(699, 'Provenance', 'Provenance.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(700, 'Provenance', 'Provenance.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(701, 'Provenance', 'Provenance.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(702, 'Provenance', 'Provenance.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(703, 'Provenance', 'Provenance.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(704, 'Provenance', 'Provenance.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(705, 'Provenance', 'Provenance.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(706, 'Provenance', 'Provenance.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(707, 'Provenance', 'Provenance.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(708, 'Provenance', 'Provenance.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(709, 'Provenance', 'Provenance.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(710, 'Provenance', 'Provenance.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(711, 'Provenance', 'Provenance.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(712, 'Provenance', 'Provenance.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(713, 'Provenance', 'Provenance.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(714, 'Provenance', 'Provenance.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(715, 'Provenance', 'Provenance.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(716, 'Provenance', 'Provenance.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(717, 'Provenance', 'Provenance.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(718, 'Provenance', 'Provenance.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(719, 'Provenance', 'Provenance.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(720, 'Provenance', 'Provenance.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(721, 'AuditEvent', 'AuditEvent.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(722, 'AuditEvent', 'AuditEvent.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(723, 'AuditEvent', 'AuditEvent.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(724, 'AuditEvent', 'AuditEvent.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(725, 'AuditEvent', 'AuditEvent.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(726, 'AuditEvent', 'AuditEvent.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(727, 'AuditEvent', 'AuditEvent.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(728, 'AuditEvent', 'AuditEvent.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(729, 'AuditEvent', 'AuditEvent.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(730, 'AuditEvent', 'AuditEvent.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(731, 'AuditEvent', 'AuditEvent.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(732, 'AuditEvent', 'AuditEvent.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(733, 'AuditEvent', 'AuditEvent.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(734, 'AuditEvent', 'AuditEvent.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(735, 'AuditEvent', 'AuditEvent.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(736, 'AuditEvent', 'AuditEvent.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(737, 'AuditEvent', 'AuditEvent.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(738, 'AuditEvent', 'AuditEvent.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(739, 'AuditEvent', 'AuditEvent.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(740, 'AuditEvent', 'AuditEvent.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(741, 'AuditEvent', 'AuditEvent.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(742, 'AuditEvent', 'AuditEvent.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(743, 'AuditEvent', 'AuditEvent.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(744, 'AuditEvent', 'AuditEvent.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(745, 'AuditEvent', 'AuditEvent.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(746, 'AuditEvent', 'AuditEvent.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(747, 'AuditEvent', 'AuditEvent.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(748, 'AuditEvent', 'AuditEvent.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(749, 'AuditEvent', 'AuditEvent.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(750, 'AuditEvent', 'AuditEvent.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping');

INSERT IGNORE INTO fhir_resource_element_definitions (
  id, resource_type, element_path, element_name, short_description, data_type, min_cardinality,
  max_cardinality, is_modifier, is_summary, binding_strength, value_set_url, reference_target_types, comments
)
VALUES
(751, 'Claim', 'Claim.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(752, 'Claim', 'Claim.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(753, 'Claim', 'Claim.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(754, 'Claim', 'Claim.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(755, 'Claim', 'Claim.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(756, 'Claim', 'Claim.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(757, 'Claim', 'Claim.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(758, 'Claim', 'Claim.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(759, 'Claim', 'Claim.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(760, 'Claim', 'Claim.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(761, 'Claim', 'Claim.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(762, 'Claim', 'Claim.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(763, 'Claim', 'Claim.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(764, 'Claim', 'Claim.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(765, 'Claim', 'Claim.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(766, 'Claim', 'Claim.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(767, 'Claim', 'Claim.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(768, 'Claim', 'Claim.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(769, 'Claim', 'Claim.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(770, 'Claim', 'Claim.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(771, 'Claim', 'Claim.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(772, 'Claim', 'Claim.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(773, 'Claim', 'Claim.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(774, 'Claim', 'Claim.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(775, 'Claim', 'Claim.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(776, 'Claim', 'Claim.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(777, 'Claim', 'Claim.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(778, 'Claim', 'Claim.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(779, 'Claim', 'Claim.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(780, 'Claim', 'Claim.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(781, 'Coverage', 'Coverage.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(782, 'Coverage', 'Coverage.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(783, 'Coverage', 'Coverage.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(784, 'Coverage', 'Coverage.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(785, 'Coverage', 'Coverage.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(786, 'Coverage', 'Coverage.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(787, 'Coverage', 'Coverage.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(788, 'Coverage', 'Coverage.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(789, 'Coverage', 'Coverage.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(790, 'Coverage', 'Coverage.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(791, 'Coverage', 'Coverage.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(792, 'Coverage', 'Coverage.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(793, 'Coverage', 'Coverage.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(794, 'Coverage', 'Coverage.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(795, 'Coverage', 'Coverage.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(796, 'Coverage', 'Coverage.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(797, 'Coverage', 'Coverage.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(798, 'Coverage', 'Coverage.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(799, 'Coverage', 'Coverage.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(800, 'Coverage', 'Coverage.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(801, 'Coverage', 'Coverage.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(802, 'Coverage', 'Coverage.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(803, 'Coverage', 'Coverage.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(804, 'Coverage', 'Coverage.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(805, 'Coverage', 'Coverage.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(806, 'Coverage', 'Coverage.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(807, 'Coverage', 'Coverage.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(808, 'Coverage', 'Coverage.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(809, 'Coverage', 'Coverage.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(810, 'Coverage', 'Coverage.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(811, 'Invoice', 'Invoice.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(812, 'Invoice', 'Invoice.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(813, 'Invoice', 'Invoice.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(814, 'Invoice', 'Invoice.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(815, 'Invoice', 'Invoice.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(816, 'Invoice', 'Invoice.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(817, 'Invoice', 'Invoice.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(818, 'Invoice', 'Invoice.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(819, 'Invoice', 'Invoice.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(820, 'Invoice', 'Invoice.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(821, 'Invoice', 'Invoice.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(822, 'Invoice', 'Invoice.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(823, 'Invoice', 'Invoice.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(824, 'Invoice', 'Invoice.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(825, 'Invoice', 'Invoice.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(826, 'Invoice', 'Invoice.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(827, 'Invoice', 'Invoice.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(828, 'Invoice', 'Invoice.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(829, 'Invoice', 'Invoice.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(830, 'Invoice', 'Invoice.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(831, 'Invoice', 'Invoice.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(832, 'Invoice', 'Invoice.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(833, 'Invoice', 'Invoice.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(834, 'Invoice', 'Invoice.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(835, 'Invoice', 'Invoice.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(836, 'Invoice', 'Invoice.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(837, 'Invoice', 'Invoice.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(838, 'Invoice', 'Invoice.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(839, 'Invoice', 'Invoice.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(840, 'Invoice', 'Invoice.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(841, 'Account', 'Account.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(842, 'Account', 'Account.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(843, 'Account', 'Account.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(844, 'Account', 'Account.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(845, 'Account', 'Account.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(846, 'Account', 'Account.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(847, 'Account', 'Account.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(848, 'Account', 'Account.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(849, 'Account', 'Account.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(850, 'Account', 'Account.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(851, 'Account', 'Account.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(852, 'Account', 'Account.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(853, 'Account', 'Account.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(854, 'Account', 'Account.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(855, 'Account', 'Account.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(856, 'Account', 'Account.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(857, 'Account', 'Account.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(858, 'Account', 'Account.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(859, 'Account', 'Account.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(860, 'Account', 'Account.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(861, 'Account', 'Account.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(862, 'Account', 'Account.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(863, 'Account', 'Account.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(864, 'Account', 'Account.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(865, 'Account', 'Account.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(866, 'Account', 'Account.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(867, 'Account', 'Account.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(868, 'Account', 'Account.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(869, 'Account', 'Account.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(870, 'Account', 'Account.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(871, 'ChargeItem', 'ChargeItem.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(872, 'ChargeItem', 'ChargeItem.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(873, 'ChargeItem', 'ChargeItem.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(874, 'ChargeItem', 'ChargeItem.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(875, 'ChargeItem', 'ChargeItem.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(876, 'ChargeItem', 'ChargeItem.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(877, 'ChargeItem', 'ChargeItem.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(878, 'ChargeItem', 'ChargeItem.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(879, 'ChargeItem', 'ChargeItem.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(880, 'ChargeItem', 'ChargeItem.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(881, 'ChargeItem', 'ChargeItem.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(882, 'ChargeItem', 'ChargeItem.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(883, 'ChargeItem', 'ChargeItem.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(884, 'ChargeItem', 'ChargeItem.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(885, 'ChargeItem', 'ChargeItem.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(886, 'ChargeItem', 'ChargeItem.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(887, 'ChargeItem', 'ChargeItem.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(888, 'ChargeItem', 'ChargeItem.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(889, 'ChargeItem', 'ChargeItem.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(890, 'ChargeItem', 'ChargeItem.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(891, 'ChargeItem', 'ChargeItem.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(892, 'ChargeItem', 'ChargeItem.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(893, 'ChargeItem', 'ChargeItem.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(894, 'ChargeItem', 'ChargeItem.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(895, 'ChargeItem', 'ChargeItem.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(896, 'ChargeItem', 'ChargeItem.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(897, 'ChargeItem', 'ChargeItem.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(898, 'ChargeItem', 'ChargeItem.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(899, 'ChargeItem', 'ChargeItem.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(900, 'ChargeItem', 'ChargeItem.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(901, 'Task', 'Task.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(902, 'Task', 'Task.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(903, 'Task', 'Task.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(904, 'Task', 'Task.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(905, 'Task', 'Task.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(906, 'Task', 'Task.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(907, 'Task', 'Task.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(908, 'Task', 'Task.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(909, 'Task', 'Task.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(910, 'Task', 'Task.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(911, 'Task', 'Task.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(912, 'Task', 'Task.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(913, 'Task', 'Task.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(914, 'Task', 'Task.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(915, 'Task', 'Task.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(916, 'Task', 'Task.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(917, 'Task', 'Task.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(918, 'Task', 'Task.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(919, 'Task', 'Task.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(920, 'Task', 'Task.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(921, 'Task', 'Task.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(922, 'Task', 'Task.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(923, 'Task', 'Task.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(924, 'Task', 'Task.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(925, 'Task', 'Task.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(926, 'Task', 'Task.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(927, 'Task', 'Task.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(928, 'Task', 'Task.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(929, 'Task', 'Task.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(930, 'Task', 'Task.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(931, 'Communication', 'Communication.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(932, 'Communication', 'Communication.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(933, 'Communication', 'Communication.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(934, 'Communication', 'Communication.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(935, 'Communication', 'Communication.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(936, 'Communication', 'Communication.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(937, 'Communication', 'Communication.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(938, 'Communication', 'Communication.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(939, 'Communication', 'Communication.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(940, 'Communication', 'Communication.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(941, 'Communication', 'Communication.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(942, 'Communication', 'Communication.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(943, 'Communication', 'Communication.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(944, 'Communication', 'Communication.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(945, 'Communication', 'Communication.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(946, 'Communication', 'Communication.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(947, 'Communication', 'Communication.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(948, 'Communication', 'Communication.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(949, 'Communication', 'Communication.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(950, 'Communication', 'Communication.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(951, 'Communication', 'Communication.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(952, 'Communication', 'Communication.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(953, 'Communication', 'Communication.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(954, 'Communication', 'Communication.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(955, 'Communication', 'Communication.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(956, 'Communication', 'Communication.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(957, 'Communication', 'Communication.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(958, 'Communication', 'Communication.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(959, 'Communication', 'Communication.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(960, 'Communication', 'Communication.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(961, 'Questionnaire', 'Questionnaire.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(962, 'Questionnaire', 'Questionnaire.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(963, 'Questionnaire', 'Questionnaire.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(964, 'Questionnaire', 'Questionnaire.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(965, 'Questionnaire', 'Questionnaire.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(966, 'Questionnaire', 'Questionnaire.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(967, 'Questionnaire', 'Questionnaire.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(968, 'Questionnaire', 'Questionnaire.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(969, 'Questionnaire', 'Questionnaire.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(970, 'Questionnaire', 'Questionnaire.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(971, 'Questionnaire', 'Questionnaire.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(972, 'Questionnaire', 'Questionnaire.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(973, 'Questionnaire', 'Questionnaire.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(974, 'Questionnaire', 'Questionnaire.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(975, 'Questionnaire', 'Questionnaire.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(976, 'Questionnaire', 'Questionnaire.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(977, 'Questionnaire', 'Questionnaire.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(978, 'Questionnaire', 'Questionnaire.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(979, 'Questionnaire', 'Questionnaire.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(980, 'Questionnaire', 'Questionnaire.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(981, 'Questionnaire', 'Questionnaire.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(982, 'Questionnaire', 'Questionnaire.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(983, 'Questionnaire', 'Questionnaire.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(984, 'Questionnaire', 'Questionnaire.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(985, 'Questionnaire', 'Questionnaire.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(986, 'Questionnaire', 'Questionnaire.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(987, 'Questionnaire', 'Questionnaire.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(988, 'Questionnaire', 'Questionnaire.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(989, 'Questionnaire', 'Questionnaire.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(990, 'Questionnaire', 'Questionnaire.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(991, 'QuestionnaireResponse', 'QuestionnaireResponse.id', 'id', 'Logical id of this artifact', 'id', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(992, 'QuestionnaireResponse', 'QuestionnaireResponse.meta', 'meta', 'Metadata about the resource', 'Meta', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(993, 'QuestionnaireResponse', 'QuestionnaireResponse.implicitRules', 'implicitRules', 'Rules followed when building the resource', 'uri', '0', '1', 1, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(994, 'QuestionnaireResponse', 'QuestionnaireResponse.language', 'language', 'Human language of the resource content', 'code', '0', '1', 0, 0, 'preferred', 'http://hl7.org/fhir/ValueSet/languages', NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(995, 'QuestionnaireResponse', 'QuestionnaireResponse.text', 'text', 'Human-readable narrative', 'Narrative', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(996, 'QuestionnaireResponse', 'QuestionnaireResponse.contained', 'contained', 'Contained inline resources', 'Resource', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(997, 'QuestionnaireResponse', 'QuestionnaireResponse.extension', 'extension', 'Additional content defined by implementations', 'Extension', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(998, 'QuestionnaireResponse', 'QuestionnaireResponse.modifierExtension', 'modifierExtension', 'Extensions that cannot be ignored', 'Extension', '0', '*', 1, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(999, 'QuestionnaireResponse', 'QuestionnaireResponse.identifier', 'identifier', 'Business identifier', 'Identifier', '0', '*', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1000, 'QuestionnaireResponse', 'QuestionnaireResponse.status', 'status', 'Lifecycle status', 'code', '0', '1', 1, 1, 'required', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping');

INSERT IGNORE INTO fhir_resource_element_definitions (
  id, resource_type, element_path, element_name, short_description, data_type, min_cardinality,
  max_cardinality, is_modifier, is_summary, binding_strength, value_set_url, reference_target_types, comments
)
VALUES
(1001, 'QuestionnaireResponse', 'QuestionnaireResponse.category', 'category', 'Classification or category', 'CodeableConcept', '0', '*', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1002, 'QuestionnaireResponse', 'QuestionnaireResponse.code', 'code', 'Clinical or business code', 'CodeableConcept', '0', '1', 0, 1, 'example', NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1003, 'QuestionnaireResponse', 'QuestionnaireResponse.subject', 'subject', 'Who or what the resource is about', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Patient|Group|Device|Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1004, 'QuestionnaireResponse', 'QuestionnaireResponse.encounter', 'encounter', 'Encounter context', 'Reference', '0', '1', 0, 1, NULL, NULL, 'Encounter', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1005, 'QuestionnaireResponse', 'QuestionnaireResponse.effectiveDateTime', 'effectiveDateTime', 'Clinically relevant effective date/time', 'dateTime', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1006, 'QuestionnaireResponse', 'QuestionnaireResponse.effectivePeriod', 'effectivePeriod', 'Clinically relevant effective period', 'Period', '0', '1', 0, 1, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1007, 'QuestionnaireResponse', 'QuestionnaireResponse.performer', 'performer', 'Actor that performed the event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Practitioner|PractitionerRole|Organization|Patient|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1008, 'QuestionnaireResponse', 'QuestionnaireResponse.participant', 'participant', 'Participating actor', 'BackboneElement', '0', '*', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|RelatedPerson', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1009, 'QuestionnaireResponse', 'QuestionnaireResponse.actor', 'actor', 'Actor reference', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Patient|Practitioner|PractitionerRole|Organization|Device', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1010, 'QuestionnaireResponse', 'QuestionnaireResponse.organization', 'organization', 'Responsible organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1011, 'QuestionnaireResponse', 'QuestionnaireResponse.location', 'location', 'Location reference', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Location', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1012, 'QuestionnaireResponse', 'QuestionnaireResponse.serviceProvider', 'serviceProvider', 'Service provider organization', 'Reference', '0', '1', 0, 0, NULL, NULL, 'Organization', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1013, 'QuestionnaireResponse', 'QuestionnaireResponse.authoredOn', 'authoredOn', 'Date/time resource was authored', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1014, 'QuestionnaireResponse', 'QuestionnaireResponse.recordedDate', 'recordedDate', 'Date/time information was recorded', 'dateTime', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1015, 'QuestionnaireResponse', 'QuestionnaireResponse.issued', 'issued', 'Date/time resource was issued', 'instant', '0', '1', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1016, 'QuestionnaireResponse', 'QuestionnaireResponse.note', 'note', 'Text notes', 'Annotation', '0', '*', 0, 0, NULL, NULL, NULL, 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1017, 'QuestionnaireResponse', 'QuestionnaireResponse.reason', 'reason', 'Reason for the event or request', 'CodeableReference', '0', '*', 0, 0, 'example', NULL, 'Condition|Observation|DiagnosticReport', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1018, 'QuestionnaireResponse', 'QuestionnaireResponse.basedOn', 'basedOn', 'Fulfills request', 'Reference', '0', '*', 0, 0, NULL, NULL, 'CarePlan|ServiceRequest|MedicationRequest', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1019, 'QuestionnaireResponse', 'QuestionnaireResponse.partOf', 'partOf', 'Part of referenced event', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Procedure|Observation|MedicationAdministration', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping'),
(1020, 'QuestionnaireResponse', 'QuestionnaireResponse.supportingInfo', 'supportingInfo', 'Additional supporting information', 'Reference', '0', '*', 0, 0, NULL, NULL, 'Resource', 'Generated from official FHIR R5 common resource pattern for HMS interoperability mapping');

INSERT IGNORE INTO fhir_identifiers (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.identifiers', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_identifiers","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.identifiers', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_identifiers","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_human_names (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.human_names', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_human_names","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.human_names', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_human_names","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_addresses (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.addresses', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_addresses","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.addresses', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_addresses","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_contact_points (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.contact_points', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_contact_points","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.contact_points', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_contact_points","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_codeable_concepts (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.codeable_concepts', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_codeable_concepts","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.codeable_concepts', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_codeable_concepts","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_codings (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.codings', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_codings","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.codings', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_codings","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_references (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.references', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_references","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.references', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_references","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_periods (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.periods', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_periods","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.periods', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_periods","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_quantities (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.quantities', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_quantities","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.quantities', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_quantities","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_ranges (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.ranges', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_ranges","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.ranges', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_ranges","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_ratios (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.ratios', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_ratios","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.ratios', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_ratios","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_attachments (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.attachments', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_attachments","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.attachments', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_attachments","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_annotations (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.annotations', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_annotations","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.annotations', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_annotations","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_timing (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.timing', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_timing","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.timing', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_timing","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_dosages (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.dosages', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_dosages","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.dosages', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_dosages","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_money (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.money', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_money","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.money', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_money","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_sampled_data (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.sampled_data', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_sampled_data","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.sampled_data', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_sampled_data","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_signatures (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.signatures', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_signatures","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.signatures', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_signatures","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_extensions (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.extensions', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_extensions","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.extensions', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_extensions","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_meta (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.meta', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_meta","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.meta', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_meta","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_narratives (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.narratives', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_narratives","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.narratives', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_narratives","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_resource_tags (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.resource_tags', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_resource_tags","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.resource_tags', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_resource_tags","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_resource_security_labels (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.resource_security_labels', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_resource_security_labels","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.resource_security_labels', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_resource_security_labels","sample":2}' AS JSON), 'ACTIVE', 2, 2);

INSERT IGNORE INTO fhir_resource_profiles (
  id, tenant_id, hospital_id, branch_id, resource_type, resource_id, element_path, system_url,
  code, display_text, value_text, value_number, value_date, unit, start_at, end_at, payload_json,
  status, created_by, updated_by
)
VALUES
(1, 1, 1, 1, 'Patient', 'patient-1', 'Patient.resource_profiles', 'http://terminology.hl7.org', 'example-1', 'FHIR datatype sample 1', 'FHIR datatype sample 1', 10.500000, '2026-06-01 09:00:00', 'mg', '2026-06-01 09:00:00', '2026-06-01 10:00:00', CAST('{"table":"fhir_resource_profiles","sample":1}' AS JSON), 'ACTIVE', 1, 1),
(2, 2, 2, 2, 'Encounter', 'encounter-2', 'Encounter.resource_profiles', 'http://terminology.hl7.org', 'example-2', 'FHIR datatype sample 2', 'FHIR datatype sample 2', 20.500000, '2026-06-02 09:00:00', 'mg', '2026-06-02 09:00:00', '2026-06-02 10:00:00', CAST('{"table":"fhir_resource_profiles","sample":2}' AS JSON), 'ACTIVE', 2, 2);


-- ============================================================================================
-- Seed data: 20 HL7 Integration
-- ============================================================================================


INSERT IGNORE INTO hl7_message_log (
  id, tenant_id, hospital_id, branch_id, direction, message_type, trigger_event, external_system,
  message_control_id, raw_message, parsed_payload_json, processing_status, received_at, processed_at
)
VALUES
(1, 1, 1, 1, 'INBOUND', 'ADT', 'A01', 'EXT_HIS', 'MSG001', 'MSH|^~\\&|EXT_HIS|EXT|PLASMIT|PLH|202606031200||ADT^A01|MSG001|P|2.5PID|1||PLH-000001||KUMAR^AMAN', CAST('{"messageType":"ADT","trigger":"A01","patient":"PLH-000001"}' AS JSON), 'PROCESSED', '2026-06-03 12:00:00', '2026-06-03 12:00:05'),
(2, 2, 2, 2, 'INBOUND', 'ORU', 'R01', 'EXT_LIS', 'MSG002', 'MSH|^~\\&|EXT_LIS|EXT|CITYCARE|CCH|202606031205||ORU^R01|MSG002|P|2.5PID|1||CCH-000001||KHAN^SARA', CAST('{"messageType":"ORU","trigger":"R01","patient":"CCH-000001"}' AS JSON), 'RECEIVED', '2026-06-03 12:05:00', NULL);

INSERT IGNORE INTO hl7_message_error_log (id, hl7_message_id, error_code, error_message, segment_name, field_position, error_payload_json, status)
VALUES
(1, 1, 'WARN001', 'Optional PV1 segment missing in sample message', 'PV1', '1', CAST('{"severity":"warning"}' AS JSON), 'CLOSED'),
(2, 2, 'INFO001', 'Message queued for lab result mapping', 'OBX', '5', CAST('{"severity":"info"}' AS JSON), 'OPEN');

INSERT IGNORE INTO hl7_external_identifier_mapping (
  id, tenant_id, hospital_id, branch_id, hl7_message_id, external_system, external_identifier,
  internal_table_name, internal_record_id, segment_name, status, payload_json
)
VALUES
(1, 1, 1, 1, 1, 'EXT_HIS', 'EXT-001', 'patients', 1, 'PID', 'ACTIVE', CAST('{"table":"hl7_external_identifier_mapping","sample":1}' AS JSON)),
(2, 2, 2, 2, 2, 'EXT_LIS', 'EXT-002', 'lab_results', 2, 'OBX', 'ACTIVE', CAST('{"table":"hl7_external_identifier_mapping","sample":2}' AS JSON));

INSERT IGNORE INTO hl7_patient_mapping (
  id, tenant_id, hospital_id, branch_id, hl7_message_id, external_system, external_identifier,
  internal_table_name, internal_record_id, segment_name, status, payload_json
)
VALUES
(1, 1, 1, 1, 1, 'EXT_HIS', 'EXT-001', 'patients', 1, 'PID', 'ACTIVE', CAST('{"table":"hl7_patient_mapping","sample":1}' AS JSON)),
(2, 2, 2, 2, 2, 'EXT_LIS', 'EXT-002', 'lab_results', 2, 'OBX', 'ACTIVE', CAST('{"table":"hl7_patient_mapping","sample":2}' AS JSON));

INSERT IGNORE INTO hl7_order_mapping (
  id, tenant_id, hospital_id, branch_id, hl7_message_id, external_system, external_identifier,
  internal_table_name, internal_record_id, segment_name, status, payload_json
)
VALUES
(1, 1, 1, 1, 1, 'EXT_HIS', 'EXT-001', 'patients', 1, 'PID', 'ACTIVE', CAST('{"table":"hl7_order_mapping","sample":1}' AS JSON)),
(2, 2, 2, 2, 2, 'EXT_LIS', 'EXT-002', 'lab_results', 2, 'OBX', 'ACTIVE', CAST('{"table":"hl7_order_mapping","sample":2}' AS JSON));

INSERT IGNORE INTO hl7_result_mapping (
  id, tenant_id, hospital_id, branch_id, hl7_message_id, external_system, external_identifier,
  internal_table_name, internal_record_id, segment_name, status, payload_json
)
VALUES
(1, 1, 1, 1, 1, 'EXT_HIS', 'EXT-001', 'patients', 1, 'PID', 'ACTIVE', CAST('{"table":"hl7_result_mapping","sample":1}' AS JSON)),
(2, 2, 2, 2, 2, 'EXT_LIS', 'EXT-002', 'lab_results', 2, 'OBX', 'ACTIVE', CAST('{"table":"hl7_result_mapping","sample":2}' AS JSON));

INSERT IGNORE INTO hl7_segment_store (
  id, tenant_id, hospital_id, branch_id, hl7_message_id, external_system, external_identifier,
  internal_table_name, internal_record_id, segment_name, status, payload_json
)
VALUES
(1, 1, 1, 1, 1, 'EXT_HIS', 'EXT-001', 'patients', 1, 'PID', 'ACTIVE', CAST('{"table":"hl7_segment_store","sample":1}' AS JSON)),
(2, 2, 2, 2, 2, 'EXT_LIS', 'EXT-002', 'lab_results', 2, 'OBX', 'ACTIVE', CAST('{"table":"hl7_segment_store","sample":2}' AS JSON));

INSERT IGNORE INTO hl7_acknowledgement_log (
  id, tenant_id, hospital_id, branch_id, hl7_message_id, external_system, external_identifier,
  internal_table_name, internal_record_id, segment_name, status, payload_json
)
VALUES
(1, 1, 1, 1, 1, 'EXT_HIS', 'EXT-001', 'patients', 1, 'PID', 'ACTIVE', CAST('{"table":"hl7_acknowledgement_log","sample":1}' AS JSON)),
(2, 2, 2, 2, 2, 'EXT_LIS', 'EXT-002', 'lab_results', 2, 'OBX', 'ACTIVE', CAST('{"table":"hl7_acknowledgement_log","sample":2}' AS JSON));


-- ============================================================================================
-- Seed data: 21 Reporting / Analytics / AI Command Center
-- ============================================================================================


INSERT IGNORE INTO daily_branch_revenue_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO daily_patient_visit_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO doctor_performance_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO department_collection_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO lab_test_volume_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO pharmacy_stock_snapshot (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO bed_occupancy_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO patient_journey_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO icu_critical_alert_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO emergency_waiting_time_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO fhir_sync_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));

INSERT IGNORE INTO hl7_message_summary (
  id, tenant_id, hospital_id, branch_id, report_date, dimension_key, dimension_name,
  metric_count, metric_amount_minor, status, summary_json
)
VALUES
(1, 1, 1, 1, '2026-06-01', 'MAIN', 'Main Campus', 42, 1250000, 'ACTIVE', CAST('{"trend":"stable","sample":1}' AS JSON)),
(2, 2, 2, 2, '2026-06-02', 'SOUTH', 'South Branch', 57, 2450000, 'ACTIVE', CAST('{"trend":"up","sample":2}' AS JSON));


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



-- Completed Plasmit HMS FHIR R5 schema. Modules covered: 21. Tables created: 290. Seed rows generated: 1729.
