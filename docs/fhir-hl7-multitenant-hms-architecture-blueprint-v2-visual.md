# FHIR & HL7 Ready Multi-Tenant HMS Database Architecture Blueprint - Visual v2

This is the source companion for the Word blueprint. The Word file contains formatted pages, tables and generated PNG diagrams.

## Final Recommendation

- Default: shared database + shared tables.
- Isolation: tenant_id + hospital_id + branch_id on every transaction table.
- Enterprise: optional dedicated schema or database.
- FHIR: interoperability layer, not a blind database copy.
- HL7: listener, parser, validator, message log and normalized table mapping.
- Reporting: denormalized summary tables for dashboards and AI.

## Diagram Assets

- overall: `docs/assets/hms-blueprint-v2/01_overall_saas_architecture.png`
- hierarchy: `docs/assets/hms-blueprint-v2/02_tenant_hospital_branch_hierarchy.png`
- isolation: `docs/assets/hms-blueprint-v2/03_data_isolation_security.png`
- integration: `docs/assets/hms-blueprint-v2/04_fhir_hl7_integration_layer.png`
- journey: `docs/assets/hms-blueprint-v2/05_patient_journey_command_center.png`
- workflows: `docs/assets/hms-blueprint-v2/06_lab_pharmacy_billing_workflows.png`
- reporting: `docs/assets/hms-blueprint-v2/07_transaction_reporting_ai_flow.png`
- deployment: `docs/assets/hms-blueprint-v2/08_enterprise_deployment_options.png`

## Main Sections

1. Executive Summary
2. One-Page Architecture Decision
3. Multi-Tenant Hospital Scenarios
4. Recommended Data Hierarchy
5. Data Isolation and Security
6. FHIR and HL7 Integration
7. Database Design Strategy
8. Core Foundation Tables
9. Complete Hospital Module Blueprint
10. Branch-Level Access Matrix
11. Roadmap and Final Recommendations