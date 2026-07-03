# Plasmit HMS FHIR R5 Full MySQL Schema Notes

## Output

- SQL script: `database/plasmit_hms_fhir_r5_full_schema.sql`
- Modules covered: 21
- Tables created: 290
- Seed rows generated: 1729

## Official FHIR R5 References Used

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

## Architecture

This schema intentionally uses two layers:

1. **Operational HMS layer**: normalized hospital tables for patient, encounter, clinical, ICU, lab, radiology, pharmacy, billing, IPD, surgery, emergency, documents, audit, reporting, and master data.
2. **FHIR interoperability layer**: resource metadata, resource JSON store, mapping, versions, references, search parameters, search index, profiles, code systems, value sets, concept maps, datatype fragments, validation, sync, and API audit.

The operational tables remain the source of truth. FHIR tables are for import/export, validation, partner APIs, external EHR interoperability, and traceability.

## Optional Split File Structure

- 01_master_data.sql
- 02_foundation.sql
- 03_patient.sql
- 04_appointment_encounter.sql
- 05_clinical_icu.sql
- 06_medication_pharmacy.sql
- 07_lab_radiology.sql
- 08_billing_insurance.sql
- 09_ipd_surgery_emergency.sql
- 10_documents_audit.sql
- 11_fhir_core.sql
- 12_hl7_integration.sql
- 13_reporting.sql
- 14_dummy_data.sql

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
