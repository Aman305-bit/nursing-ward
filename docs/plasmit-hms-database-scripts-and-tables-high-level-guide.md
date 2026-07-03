# Plasmit HMS Database Scripts and Tables - High-Level Creation Order Guide

## Executive Summary

This document explains what database scripts and tables mean, which script should run first, and which tables should be created first for Plasmit HMS.

- Database name: `plasmit_hms`
- First table: `tenants`
- Recommended migration tool: Flyway
- First script: `create_foundation_tables`

## Database Script Meaning

A database script is a `.sql` file that creates or changes database objects such as database, tables, indexes, seed data, triggers and stored procedures.

## Table Meaning

A table is the actual structure in MySQL where data is stored. Example: `tenants`, `hospitals`, `branches`, `patients`.

## Database Creation SQL

```sql
CREATE DATABASE IF NOT EXISTS plasmit_hms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE plasmit_hms;
```

## High-Level Script Order

| Order | Script Name | Purpose | Main Objects | Note |
| --- | --- | --- | --- | --- |
| 01 | create_database | Creates database/schema | plasmit_hms | Run first in MySQL Workbench or CLI. |
| 02 | create_foundation_tables | Creates SaaS root tables | tenants, hospitals, branches | Must run before every other module. |
| 03 | create_user_role_permission_tables | Creates access control | users, roles, permissions | Required before API security and audit. |
| 04 | create_patient_tables | Creates patient/MPI tables | patients, identifiers, contacts | Patient is hospital-level. |
| 05 | create_appointment_tables | Creates scheduling tables | appointments, slots, queues | Appointment is branch-level. |
| 06 | create_encounter_clinical_tables | Creates clinical care tables | encounters, vitals, diagnoses | Encounter is branch-level clinical anchor. |
| 07 | create_lab_radiology_tables | Creates diagnostics tables | lab_orders, results, radiology_reports | Connects through encounter. |
| 08 | create_pharmacy_tables | Creates medicine and stock tables | medicine_master, batches, stock, sales | Stock is branch-level. |
| 09 | create_billing_tables | Creates revenue cycle tables | invoices, invoice_items, payments | Billing is branch-level. |
| 10 | create_fhir_hl7_tables | Creates integration tables | fhir_resource_mapping, hl7_message_log | Run after core business tables. |
| 11 | create_reporting_summary_tables | Creates dashboard summary tables | daily summaries, snapshots | Generated from transaction tables. |
| 12 | seed_master_data | Loads default master data | statuses, roles, code masters | Use repeatable migration where possible. |

## First Tables to Create

| Order | Table | Purpose | Depends On | Why Important |
| --- | --- | --- | --- | --- |
| 1 | tenants | Root SaaS customer / hospital group | None | First table in the system. |
| 2 | hospitals | Hospital under tenant | tenants.id | One tenant can own many hospitals. |
| 3 | branches | Branch/facility/location under hospital | hospitals.id | One hospital can have many branches. |
| 4 | departments | Hospital/branch departments | hospitals.id, branches.id optional | OPD, IPD, ER, Lab, Pharmacy, Billing. |
| 5 | healthcare_services | Services provided by departments | departments.id | Maps to FHIR HealthcareService. |
| 6 | users | Doctors/staff/admin users | tenants.id, hospitals.id | Users get access using branch permissions. |
| 7 | roles | User role master | tenant_id/hospital_id if custom | Admin, doctor, nurse, lab, pharmacy, billing. |
| 8 | permissions | System permission master | None or tenant_id | Controls actions. |
| 9 | role_permissions | Role-permission mapping | roles.id, permissions.id | RBAC mapping. |
| 10 | user_branch_access | User branch access mapping | users.id, branches.id | Branch isolation starts here. |

## Module-Wise Creation Flow

| Module | Table Flow | Business Meaning |
| --- | --- | --- |
| Foundation | tenants -> hospitals -> branches -> departments -> services | Root hierarchy and setup |
| Access Control | users -> roles -> permissions -> user_branch_access | Login, RBAC and branch access |
| Patient | patients -> identifiers -> addresses -> contacts | Hospital-level patient identity |
| Appointment | slots -> appointments -> queue/status | Branch-level scheduling |
| Encounter/Clinical | encounters -> vitals -> diagnoses -> notes -> prescriptions | Clinical source of truth |
| Diagnostics | lab/radiology orders -> samples/results/reports | Order-to-result workflow |
| Pharmacy | medicine -> batch -> stock -> dispensing/sales | Stock and medicine workflow |
| Billing | invoice -> invoice_items -> payments/refunds/claims | Revenue cycle |
| Integration | FHIR mapping -> HL7 log -> external identifiers | FHIR/HL7 readiness |
| Reporting | summary tables and snapshots | Dashboard performance |

## Flyway Naming Convention

```text
V202606030001__create_foundation_tables.sql
V202606030002__create_user_role_permission_tables.sql
V202606030003__create_patient_tables.sql
V202606030004__create_appointment_tables.sql
V202606030005__create_encounter_clinical_tables.sql
V202606030006__create_lab_radiology_tables.sql
V202606030007__create_pharmacy_tables.sql
V202606030008__create_billing_tables.sql
V202606030009__create_fhir_hl7_tables.sql
R__seed_default_master_data.sql
```

## Final Recommendation

Create `plasmit_hms` first. Then create `tenants` first. After that create `hospitals`, `branches`, `departments`, `healthcare_services`, `users`, `roles`, `permissions`, `role_permissions`, and `user_branch_access`.