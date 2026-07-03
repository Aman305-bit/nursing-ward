from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ASSETS = DOCS / "assets" / "db-workflow"
DOCX_PATH = DOCS / "Multi-Developer-Database-Development-Workflow-for-Plasmit-HMS-v2-Full-Module-Coverage.docx"
MD_PATH = DOCS / "multi-developer-database-development-workflow.md"


def rgb(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.replace("#", "")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def color(value: str | tuple[int, int, int]) -> str | tuple[int, int, int]:
    if isinstance(value, tuple):
        return value
    if len(value.replace("#", "")) == 6:
        return rgb(value)
    return value


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    name = "arialbd.ttf" if bold else "arial.ttf"
    for path in [Path("C:/Windows/Fonts") / name, Path("C:/Windows/Fonts/calibri.ttf")]:
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    box: tuple[int, int, int, int],
    size: int = 24,
    fill: str = "334155",
    bold: bool = False,
    align: str = "center",
) -> None:
    x1, y1, x2, y2 = box
    max_width = x2 - x1 - 24
    fnt = font(size, bold)
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        trial = f"{line} {word}".strip()
        bb = draw.textbbox((0, 0), trial, font=fnt)
        if bb[2] - bb[0] <= max_width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    heights = [draw.textbbox((0, 0), ln, font=fnt)[3] for ln in lines]
    total = sum(heights) + max(0, len(lines) - 1) * 8
    y = y1 + max(0, (y2 - y1 - total) // 2)
    for line_text, height in zip(lines, heights):
        bb = draw.textbbox((0, 0), line_text, font=fnt)
        width = bb[2] - bb[0]
        x = x1 + 16 if align == "left" else x1 + (x2 - x1 - width) // 2
        draw.text((x, y), line_text, font=fnt, fill=color(fill))
        y += height + 8


def box(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    title: str,
    body: str = "",
    fill: str = "FFFFFF",
    outline: str = "CBD5E1",
) -> None:
    draw.rounded_rectangle(xy, radius=20, fill=color(fill), outline=color(outline), width=3)
    x1, y1, x2, y2 = xy
    draw_wrapped(draw, title, (x1 + 8, y1 + 12, x2 - 8, y1 + 70), size=25, fill="14325C", bold=True)
    if body:
        draw_wrapped(draw, body, (x1 + 12, y1 + 72, x2 - 12, y2 - 10), size=20, fill="475569")


def arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], fill: str = "2563EB") -> None:
    draw.line([start, end], fill=color(fill), width=5)
    sx, sy = start
    ex, ey = end
    if abs(ex - sx) >= abs(ey - sy):
        direction = 1 if ex >= sx else -1
        pts = [(ex, ey), (ex - direction * 18, ey - 10), (ex - direction * 18, ey + 10)]
    else:
        direction = 1 if ey >= sy else -1
        pts = [(ex, ey), (ex - 10, ey - direction * 18), (ex + 10, ey - direction * 18)]
    draw.polygon(pts, fill=color(fill))


def base(title: str, subtitle: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (1600, 900), rgb("F8FAFC"))
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 1600, 118), fill=rgb("14325C"))
    draw.text((48, 26), title, font=font(42, True), fill=rgb("FFFFFF"))
    draw.text((50, 82), subtitle, font=font(22), fill=rgb("D8E8FF"))
    return img, draw


def save(img: Image.Image, name: str) -> Path:
    ASSETS.mkdir(parents=True, exist_ok=True)
    path = ASSETS / name
    img.save(path, "PNG", quality=95)
    return path


def make_diagrams() -> dict[str, Path]:
    diagrams: dict[str, Path] = {}

    img, draw = base("Multi-Developer Database Workflow", "Feature code and database migrations move together from local development to shared dev.")
    steps = [
        ("Pull latest dev", "start from current schema"),
        ("Feature branch", "module-specific branch"),
        ("Migration file", "unique timestamp version"),
        ("Local DB test", "run clean migration"),
        ("PR review", "module lead + architect"),
        ("CI migration", "apply on clean DB"),
        ("Shared dev DB", "integration testing"),
    ]
    x = 55
    y = 285
    for idx, (title, body) in enumerate(steps):
        box(draw, (x, y, x + 195, y + 145), title, body, fill="FFFFFF")
        if idx < len(steps) - 1:
            arrow(draw, (x + 198, y + 72), (x + 230, y + 72))
        x += 220
    draw_wrapped(draw, "Rule: no direct manual database change. Every schema change must be committed as a migration file with module code.", (100, 650, 1500, 750), size=31, fill="B91C1C", bold=True)
    diagrams["workflow"] = save(img, "01_multi_developer_workflow.png")

    img, draw = base("Flyway Migration Lifecycle", "Timestamp migration versions prevent conflicts when many developers work at the same time.")
    boxes = [
        ((90, 180, 420, 330), "Need DB Change", "new table, column, index or constraint"),
        ((560, 180, 930, 330), "Create Migration", "V202606021030__create_patient_tables.sql"),
        ((1090, 180, 1480, 330), "Run Locally", "local DB and clean DB migration"),
        ((90, 560, 420, 710), "Commit Together", "migration + repository + API code"),
        ((560, 560, 930, 710), "Review and Merge", "check tenant columns, indexes, FKs"),
        ((1090, 560, 1480, 710), "Never Edit Old File", "new change means new migration"),
    ]
    for xy, title, body in boxes:
        box(draw, xy, title, body, fill="EAF4FF" if "Migration" in title else "FFFFFF")
    arrow(draw, (425, 255), (555, 255))
    arrow(draw, (935, 255), (1085, 255))
    arrow(draw, (1240, 335), (1240, 550), fill="0F766E")
    arrow(draw, (1085, 635), (935, 635), fill="0F766E")
    arrow(draw, (555, 635), (425, 635), fill="0F766E")
    diagrams["migration"] = save(img, "02_flyway_migration_lifecycle.png")

    img, draw = base("Inter-Module Dependency Flow", "Ownership is module-wise, but integration points are reviewed centrally.")
    nodes = {
        "Foundation": (705, 160, "tenant, hospital, branch, users"),
        "Patient": (705, 300, "patients and identifiers"),
        "Encounter": (705, 440, "OPD, IPD, ER visit"),
        "Clinical": (320, 580, "notes, vitals, diagnosis"),
        "Lab/Radiology": (705, 580, "orders and results"),
        "Prescription": (1080, 580, "medication order"),
        "Pharmacy": (1080, 725, "stock and dispense"),
        "Billing": (705, 725, "invoice and payment"),
        "FHIR Layer": (320, 725, "resource mapping"),
        "Audit": (1380, 440, "logs and compliance"),
        "IPD / ER / OT": (1380, 580, "admission, emergency, surgery"),
        "Operations": (1380, 725, "HRMS, store, diet, helpdesk"),
    }
    for title, (cx, cy, body) in nodes.items():
        box(draw, (cx - 150, cy - 52, cx + 150, cy + 52), title, body, fill="FFFFFF")
    arrow(draw, (705, 214), (705, 246))
    arrow(draw, (705, 354), (705, 386))
    arrow(draw, (570, 475), (455, 545))
    arrow(draw, (705, 494), (705, 526))
    arrow(draw, (840, 475), (965, 545))
    arrow(draw, (1080, 634), (1080, 670))
    arrow(draw, (705, 634), (705, 670))
    arrow(draw, (565, 620), (455, 700), fill="0F766E")
    arrow(draw, (705, 634), (450, 720), fill="0F766E")
    arrow(draw, (955, 620), (470, 730), fill="0F766E")
    arrow(draw, (855, 440), (1225, 440), fill="64748B")
    arrow(draw, (855, 455), (1225, 560), fill="64748B")
    arrow(draw, (855, 730), (1225, 730), fill="64748B")
    arrow(draw, (1380, 635), (1380, 670), fill="64748B")
    diagrams["dependency"] = save(img, "03_inter_module_dependency_flow.png")

    img, draw = base("Database Review Levels", "High-risk database work needs architect and integration review before merge.")
    levels = [
        ((210, 640, 1390, 755), "Level 1 - Developer Self Review", "naming, tenant columns, indexes, constraints, local migration"),
        ((310, 510, 1290, 625), "Level 2 - Module Lead Review", "module correctness, API compatibility, table ownership"),
        ((420, 380, 1180, 495), "Level 3 - Database Architect Review", "shared tables, cross-module FK, column rename, denormalized tables"),
        ((530, 250, 1070, 365), "Level 4 - Integration Review", "FHIR mapping, HL7 mapping, external identifiers, shared clinical events"),
    ]
    fills = ["F5F7FB", "EAF4FF", "FFF7E6", "E8F7F3"]
    for (xy, title, body), fill_color in zip(levels, fills):
        box(draw, xy, title, body, fill=fill_color)
    diagrams["review"] = save(img, "04_database_review_levels.png")

    img, draw = base("Tenant Isolation Query Rules", "Every repository query must be scoped by JWT-derived TenantContext and BranchContext.")
    box(draw, (80, 210, 420, 440), "JWT / TenantContext", "tenantId\nhospitalId\nallowedBranchIds\nrole", fill="EAF4FF")
    box(draw, (560, 210, 930, 440), "Repository Query", "WHERE tenant_id = :tenantId\nAND hospital_id = :hospitalId\nAND branch_id IN (:branches)", fill="FFF7E6")
    box(draw, (1080, 210, 1500, 440), "Authorized Result", "only allowed branch, hospital and tenant rows", fill="E8F7F3")
    arrow(draw, (425, 325), (555, 325))
    arrow(draw, (935, 325), (1075, 325))
    draw_wrapped(draw, "Frontend branch_id is not trusted. Backend must inject tenant, hospital and branch filters from the authenticated token.", (140, 620, 1460, 735), size=31, fill="B91C1C", bold=True)
    diagrams["tenant"] = save(img, "05_tenant_isolation_query_rules.png")

    img, draw = base("Local DB to Shared Dev Integration", "Develop locally, integrate through reviewed migrations, then test on shared dev database.")
    box(draw, (100, 240, 420, 500), "Developer Local DB", "safe testing\nreset anytime\nno team impact", fill="EAF4FF")
    box(draw, (560, 240, 900, 500), "Pull Request and CI", "clean DB migration\nunit/API tests\nreview checklist", fill="FFF7E6")
    box(draw, (1040, 240, 1420, 500), "Shared Dev DB", "only after merge\nQA and integration tests\nno manual changes", fill="E8F7F3")
    arrow(draw, (425, 370), (555, 370))
    arrow(draw, (905, 370), (1035, 370))
    draw_wrapped(draw, "Recommended: local database per developer. Shared dev database is for integration after PR merge.", (170, 650, 1430, 735), size=32, fill="14325C", bold=True)
    diagrams["local_shared"] = save(img, "06_local_to_shared_dev_db.png")

    return diagrams


def shade(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def border(cell, line_color: str = "CBD5E1") -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ["top", "left", "bottom", "right"]:
        element = borders.find(qn(f"w:{edge}"))
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "4")
        element.set(qn("w:color"), line_color)


def setup_doc() -> Document:
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.55)
    section.bottom_margin = Inches(0.55)
    section.left_margin = Inches(0.6)
    section.right_margin = Inches(0.6)
    doc.styles["Normal"].font.name = "Aptos"
    doc.styles["Normal"].font.size = Pt(10)
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run("Plasmit HMS | Multi-Developer Database Workflow | Confidential")
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor(*rgb("64748B"))
    return doc


def heading(doc: Document, text: str, level: int = 1) -> None:
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.name = "Aptos Display"
        run.font.bold = True
        run.font.color.rgb = RGBColor(*rgb("14325C" if level <= 2 else "2563EB"))


def para(doc: Document, text: str, bold: bool = False) -> None:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    r.font.name = "Aptos"
    r.font.size = Pt(10.3)
    r.font.bold = bold
    r.font.color.rgb = RGBColor(*rgb("334155"))


def bullets(doc: Document, items: list[str]) -> None:
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(item)
        r.font.name = "Aptos"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(*rgb("334155"))


def callout(doc: Document, title: str, items: list[str], fill: str = "EAF4FF", title_color: str = "14325C") -> None:
    table = doc.add_table(rows=1, cols=1)
    cell = table.cell(0, 0)
    shade(cell, fill)
    border(cell, "BBD4F8")
    p = cell.paragraphs[0]
    r = p.add_run(title)
    r.font.name = "Aptos Display"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(*rgb(title_color))
    for item in items:
        bp = cell.add_paragraph(style="List Bullet")
        br = bp.add_run(item)
        br.font.name = "Aptos"
        br.font.size = Pt(9.4)
        br.font.color.rgb = RGBColor(*rgb("334155"))
    doc.add_paragraph()


def table(doc: Document, headers: list[str], rows: list[list[str]]) -> None:
    tbl = doc.add_table(rows=1, cols=len(headers))
    tbl.style = "Table Grid"
    for idx, header in enumerate(headers):
        cell = tbl.cell(0, idx)
        shade(cell, "14325C")
        border(cell)
        r = cell.paragraphs[0].add_run(header)
        r.font.name = "Aptos"
        r.font.size = Pt(8.4)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
    for row_idx, row in enumerate(rows):
        cells = tbl.add_row().cells
        for idx, value in enumerate(row):
            cell = cells[idx]
            border(cell)
            if row_idx % 2 == 0:
                shade(cell, "F8FAFC")
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(value)
            r.font.name = "Aptos"
            r.font.size = Pt(7.6 if len(headers) > 5 else 8.2)
            r.font.color.rgb = RGBColor(*rgb("334155"))
    doc.add_paragraph()


def picture(doc: Document, path: Path, caption: str) -> None:
    doc.add_picture(str(path), width=Inches(7.1))
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(caption)
    r.font.name = "Aptos"
    r.font.size = Pt(8.2)
    r.font.italic = True
    r.font.color.rgb = RGBColor(*rgb("64748B"))


def code(doc: Document, text: str) -> None:
    tbl = doc.add_table(rows=1, cols=1)
    cell = tbl.cell(0, 0)
    shade(cell, "0F172A")
    border(cell, "1E293B")
    p = cell.paragraphs[0]
    for line in text.strip().splitlines():
        r = p.add_run(line + "\n")
        r.font.name = "Consolas"
        r.font.size = Pt(8.2)
        r.font.color.rgb = RGBColor(*rgb("E2E8F0"))
    doc.add_paragraph()


DEVELOPERS = [
    ["Developer A", "SaaS Foundation / Tenant / Hospital / Branch / Department / User / Role / Permission", "tenants, subscriptions, hospitals, branches, departments, healthcare_services, users, roles, permissions, user_branch_access", "All modules", "Foundation and access-control migrations", "Auth, tenant setup, hospital setup, branch setup, RBAC APIs", "Database Architect + Security Lead"],
    ["Developer B", "Patient Registration / MPI / Patient Contacts / Patient Documents / Appointment / Queue", "patients, patient_identifiers, patient_addresses, patient_contacts, patient_documents, appointments, appointment_slots, appointment_queues, appointment_status_history", "Foundation, Clinical, Billing, Lab, Pharmacy", "Patient and appointment migrations", "Registration, MPI search, appointment, queue, patient document APIs", "Foundation + Clinical + FHIR team"],
    ["Developer C", "Complete Clinical Core / OPD / Doctor Workbench / EMR / Vitals / Diagnosis / Allergy / Care Plan / Clinical Orders / Prescription", "doctors, doctor_schedules, encounters, encounter_participants, clinical_notes, emr_documents, vitals, diagnoses, problem_lists, patient_allergies, care_plans, clinical_orders, prescriptions, prescription_items", "Patient, Appointment, Lab, Radiology, Pharmacy, Billing", "Clinical and prescription migrations", "Doctor workbench, OPD, EMR, vitals, diagnosis, allergy, care plan, prescription APIs", "Patient + Diagnostics + Pharmacy + FHIR team"],
    ["Developer D", "Lab / Diagnostics / Sample Collection / Result Entry / Critical Alerts / Radiology / Imaging Reports", "lab_orders, lab_order_items, lab_samples, lab_results, lab_result_flags, diagnostic_reports, radiology_orders, radiology_reports, radiology_images", "Patient, Encounter, Billing, FHIR/HL7", "Lab and radiology migrations", "Lab order, token/queue, sample, result, radiology report APIs", "Clinical + Billing + FHIR/HL7 team"],
    ["Developer E", "Pharmacy / Medicine Master / Batch / Stock / Prescription Dispensing / Sales / Returns", "medicines, medicine_categories, medicine_batches, pharmacy_stock, pharmacy_stock_movements, pharmacy_sales, pharmacy_sale_items, pharmacy_returns, medication_dispenses", "Prescription, Billing, Inventory", "Pharmacy migrations", "Medicine master, stock, low-stock, expiry, dispensing, sales APIs", "Clinical + Billing + FHIR team"],
    ["Developer F", "Billing / Invoicing / Payments / Refunds / Package Billing / Insurance / TPA / Claims", "billing_invoices, billing_invoice_items, billing_packages, payments, payment_allocations, refunds, insurance_policies, insurance_claims, claim_documents, claim_status_history", "Patient, Encounter, Lab, Radiology, Pharmacy, IPD", "Billing, payment and insurance migrations", "Invoice, payment, refund, package, claim, receipt APIs", "Architect + Reporting + Integration team"],
    ["Developer G", "IPD / Admission / Ward / Room / Bed / Nursing / Medication Administration / Discharge Summary", "admissions, admission_transfers, wards, rooms, beds, bed_allocations, nursing_notes, nursing_tasks, medication_administrations, discharge_checklists, discharge_summaries, followups", "Patient, Encounter, Clinical, Billing", "IPD, nursing and discharge migrations", "Admission, transfer, bed, nursing, MAR, discharge, follow-up APIs", "Clinical + Billing + FHIR team"],
    ["Developer H", "Emergency / ER / Triage / Surgery / OT / Ambulance / Blood Bank", "emergency_cases, triage_assessments, emergency_orders, surgeries, operation_theatres, surgery_team, surgery_checklists, anesthesia_records, ambulance_requests, blood_donors, blood_bank_units, blood_transfusions", "Patient, Encounter, Clinical, Billing, Inventory", "Emergency, OT, ambulance and blood bank migrations", "ER queue, triage, OT, surgery, ambulance, blood bank APIs", "Clinical + Billing + Architect"],
    ["Developer I", "FHIR Gateway / HL7 Integration / External System Mapping / Identifier Mapping", "fhir_resource_mapping, fhir_resource_store, fhir_api_audit_log, fhir_sync_status, fhir_code_system_mapping, hl7_message_log, hl7_message_error_log, hl7_mapping, external_identifier_mapping, integration_endpoints", "All clinical, billing, patient and master modules", "FHIR, HL7 and integration migrations", "FHIR API, HL7 inbound/outbound, mapping, replay and partner integration tests", "Architect + Module Owners"],
    ["Developer J", "Reporting / Dashboard / Denormalized Summary Tables / Analytics / AI Patient Journey Command Center", "daily_branch_revenue_summary, daily_patient_visit_summary, department_wise_collection_summary, doctor_performance_summary, lab_test_volume_summary, pharmacy_stock_snapshot, bed_occupancy_summary, patient_journey_summary, ai_alerts", "All modules", "Reporting and analytics migrations", "Dashboard, summary refresh, command center, AI alert data APIs", "Architect + Module Owners + Compliance"],
    ["Developer K", "Audit / Compliance / Consent / Notification / Security Logs / Access Logs", "audit_logs, user_login_history, patient_record_access_logs, consent_records, break_glass_access_logs, notifications, notification_templates, notification_delivery_logs, security_events", "All modules", "Audit, compliance and notification migrations", "Audit, access log, consent, notification, security event APIs", "Security Lead + Compliance + Architect"],
    ["Developer L", "Hospital Operations / HRMS / Staff Attendance / Store Inventory / Procurement / Diet Kitchen / Housekeeping / Maintenance / Helpdesk / Patient Portal / Doctor Portal", "staff_profiles, staff_attendance, staff_shifts, inventory_items, store_stock, stock_requisitions, purchase_orders, purchase_order_items, goods_receipts, vendor_master, diet_orders, kitchen_menus, housekeeping_tasks, maintenance_tickets, helpdesk_tickets, portal_users, portal_sessions", "Foundation, Billing, IPD, Pharmacy, Patient", "Operations, HRMS, inventory, procurement, portal migrations", "Staff attendance, inventory, purchase, diet, housekeeping, maintenance, helpdesk, patient portal and doctor portal APIs", "Hospital Admin + Billing + Security + Architect"],
]


OWNERSHIP = [
    ["Super Admin / SaaS Admin", "tenant_, subscription_", "Developer A", "tenants, subscription_plans, tenant_subscriptions, tenant_settings", "None", "Organization", "Architect"],
    ["Tenant / Hospital Group Admin", "tenant_, hospital_", "Developer A", "tenants, hospitals, hospital_groups, tenant_admin_users", "SaaS foundation", "Organization", "Architect"],
    ["Hospital Setup", "hospital_", "Developer A", "hospitals, healthcare_services, hospital_settings, hospital_documents", "Tenant", "Organization, HealthcareService, DocumentReference", "Architect + Compliance"],
    ["Branch / Facility Management", "branch_, location_", "Developer A", "branches, branch_locations, counters, branch_settings", "Hospital", "Location", "Architect"],
    ["Department Management", "department_, service_", "Developer A", "departments, department_services, service_catalog", "Hospital, Branch", "HealthcareService", "Architect"],
    ["User / Role / Permission", "user_, role_, permission_", "Developer A", "users, roles, permissions, role_permissions, user_branch_access, practitioner_roles", "Hospital, Branch", "Practitioner, PractitionerRole", "Security Lead"],
    ["Patient Registration / MPI", "patient_", "Developer B", "patients, patient_identifiers, patient_addresses, patient_contacts, patient_merge_history", "Foundation", "Patient, RelatedPerson", "Foundation + FHIR team"],
    ["Patient Documents", "patient_document_, document_", "Developer B", "patient_documents, documents, document_versions, document_access_logs", "Patient, Encounter", "DocumentReference", "Clinical + FHIR team"],
    ["Patient Portal", "portal_", "Developer L", "portal_users, portal_sessions, portal_patient_links, portal_document_access", "Patient, Auth, Documents", "Patient, DocumentReference", "Security + Patient team"],
    ["Doctor Portal", "doctor_portal_", "Developer L", "doctor_portal_profiles, doctor_portal_sessions, doctor_task_views", "Doctor, Clinical, Appointment", "Practitioner, Encounter", "Security + Clinical team"],
    ["Appointment Scheduling", "appointment_", "Developer B", "appointments, appointment_slots, appointment_queues, appointment_status_history, appointment_reminders", "Patient, Users, Branch", "Appointment", "Foundation + Notification team"],
    ["Encounter / Visit", "encounter_", "Developer C", "encounters, encounter_participants, encounter_status_history, encounter_locations", "Patient, Appointment, Branch, Doctor", "Encounter", "Patient + Clinical team"],
    ["OPD Management", "opd_", "Developer C", "opd_visits, opd_queue, doctor_consultations, consultation_status_history", "Patient, Appointment, Encounter", "Encounter, Observation, Condition", "Patient + FHIR team"],
    ["Doctor Workbench", "doctor_, clinical_", "Developer C", "doctor_schedules, doctor_tasks, clinical_orders, doctor_review_queue", "Encounter, Lab, Radiology, Prescription", "PractitionerRole, ServiceRequest", "Clinical Lead"],
    ["Clinical Notes / EMR", "clinical_, emr_", "Developer C", "clinical_notes, emr_documents, progress_notes, procedure_notes, discharge_clinical_notes", "Encounter, Doctor", "DocumentReference, Composition", "FHIR team"],
    ["Vitals and Observation", "vital_, observation_", "Developer C", "vitals, observation_records, nursing_observations, growth_charts", "Encounter, Nursing", "Observation", "Clinical + FHIR team"],
    ["Diagnosis / Problem List", "diagnosis_, problem_", "Developer C", "diagnoses, problem_lists, diagnosis_status_history", "Encounter, Doctor", "Condition", "Clinical + FHIR team"],
    ["Allergy / Immunization / Care Plan", "allergy_, immunization_, care_plan_", "Developer C", "patient_allergies, immunizations, care_plans, care_plan_goals", "Patient, Encounter", "AllergyIntolerance, Immunization, CarePlan", "FHIR team"],
    ["Prescription / Medication Order", "prescription_, medication_order_", "Developer C", "prescriptions, prescription_items, medication_orders, medication_order_status_history", "Encounter, Pharmacy", "MedicationRequest", "Pharmacy + FHIR team"],
    ["Nursing Module", "nursing_", "Developer G", "nursing_notes, nursing_tasks, nursing_handover, medication_administrations, fluid_balance_records", "IPD, Encounter, Clinical", "Observation, MedicationAdministration", "Clinical + FHIR team"],
    ["IPD / Admission Management", "admission_, ipd_", "Developer G", "admissions, admission_transfers, ipd_rounds, ipd_care_team", "Patient, Encounter, Ward", "Encounter", "Clinical + Billing"],
    ["Ward / Room / Bed Management", "ward_, room_, bed_", "Developer G", "wards, rooms, beds, bed_allocations, bed_transfer_history", "Branch, IPD", "Location", "Hospital Admin"],
    ["Discharge Summary", "discharge_", "Developer G", "discharge_checklists, discharge_summaries, discharge_medications, followups", "IPD, Clinical, Billing", "DocumentReference, CarePlan", "Clinical + Billing + FHIR"],
    ["Lab / Diagnostics", "lab_", "Developer D", "lab_orders, lab_order_items, lab_samples, lab_results, lab_result_flags, diagnostic_reports", "Encounter, Billing", "ServiceRequest, Observation, DiagnosticReport", "FHIR/HL7 team"],
    ["Radiology / Imaging", "radiology_", "Developer D", "radiology_orders, radiology_reports, radiology_images, radiology_report_reviews", "Encounter, Billing", "ServiceRequest, DiagnosticReport, ImagingStudy", "FHIR/HL7 team"],
    ["Pharmacy Master / Inventory", "medicine_, pharmacy_stock_", "Developer E", "medicines, medicine_categories, medicine_batches, pharmacy_stock, pharmacy_stock_movements", "Hospital, Branch, Store", "Medication", "Inventory + FHIR team"],
    ["Pharmacy Sales / Dispensing", "pharmacy_sale_, medication_dispense_", "Developer E", "pharmacy_sales, pharmacy_sale_items, pharmacy_returns, medication_dispenses", "Prescription, Billing, Stock", "MedicationDispense", "Billing + FHIR team"],
    ["Billing / Invoicing", "billing_", "Developer F", "billing_invoices, billing_invoice_items, billing_packages, charge_master, patient_accounts", "Patient, Encounter, Services", "Account, ChargeItem", "Architect + Reporting"],
    ["Payment / Refunds", "payment_, refund_", "Developer F", "payments, payment_allocations, refunds, receipt_print_logs", "Billing", "ExplanationOfBenefit", "Finance Lead"],
    ["Insurance / TPA / Claims", "insurance_, claim_", "Developer F", "insurance_policies, insurance_claims, claim_documents, claim_status_history, tpa_master", "Billing, Patient", "Coverage, Claim, ExplanationOfBenefit", "Architect + Integration"],
    ["Emergency / ER", "emergency_, triage_", "Developer H", "emergency_cases, triage_assessments, emergency_orders, emergency_transfer_logs", "Patient, Encounter, Billing", "Encounter, Observation, ServiceRequest", "Clinical + Billing"],
    ["OT / Surgery Management", "surgery_, ot_", "Developer H", "surgeries, operation_theatres, surgery_team, surgery_checklists, anesthesia_records", "Encounter, Billing, Inventory", "Procedure", "Clinical + Architect"],
    ["Ambulance", "ambulance_", "Developer H", "ambulances, ambulance_requests, ambulance_trips, ambulance_staff_assignments", "Patient, Emergency, Billing", "Encounter, Location", "Operations + Billing"],
    ["Blood Bank", "blood_", "Developer H", "blood_donors, blood_bank_units, blood_requests, blood_transfusions, blood_screening_results", "Patient, Lab, Billing", "Observation, Procedure", "Clinical + Compliance"],
    ["Staff Attendance / HRMS", "staff_, attendance_", "Developer L", "staff_profiles, staff_attendance, staff_shifts, leave_requests, payroll_references", "Users, Branch", "Practitioner", "HR + Security"],
    ["Inventory / Store", "inventory_, store_", "Developer L", "inventory_items, store_stock, stock_requisitions, stock_issues, stock_adjustments", "Branch, Pharmacy, Surgery", "N/A", "Hospital Admin + Finance"],
    ["Procurement / Purchase", "purchase_, vendor_", "Developer L", "vendor_master, purchase_orders, purchase_order_items, goods_receipts, supplier_invoices", "Inventory, Billing", "N/A", "Finance + Store"],
    ["Diet / Kitchen", "diet_, kitchen_", "Developer L", "diet_orders, diet_plans, kitchen_menus, meal_delivery_logs", "IPD, Patient", "NutritionOrder", "Clinical + Operations"],
    ["Housekeeping", "housekeeping_", "Developer L", "housekeeping_tasks, cleaning_schedules, bed_cleaning_logs", "Ward, Bed, Branch", "N/A", "Operations"],
    ["Maintenance", "maintenance_", "Developer L", "maintenance_tickets, asset_maintenance_logs, equipment_downtime_logs", "Inventory, Branch", "Device", "Operations + Biomedical"],
    ["Helpdesk / Support", "helpdesk_", "Developer L", "helpdesk_tickets, support_categories, ticket_comments, ticket_sla_logs", "Users, Branch", "N/A", "Operations"],
    ["Notification System", "notification_", "Developer K", "notifications, notification_templates, notification_delivery_logs, notification_preferences", "All modules", "Communication", "Security + Module Owners"],
    ["Audit / Compliance / Consent", "audit_, consent_, access_", "Developer K", "audit_logs, user_login_history, patient_record_access_logs, consent_records, break_glass_access_logs, security_events", "All modules", "AuditEvent, Consent", "Compliance + Security"],
    ["FHIR API Layer", "fhir_", "Developer I", "fhir_resource_mapping, fhir_resource_store, fhir_api_audit_log, fhir_sync_status, fhir_code_system_mapping", "All mapped modules", "All mapped resources", "Architect + Module Owners"],
    ["HL7 Integration", "hl7_", "Developer I", "hl7_message_log, hl7_message_error_log, hl7_mapping, hl7_ack_log, integration_endpoints", "Patient, Lab, Radiology, Billing", "N/A", "Integration Lead"],
    ["Reporting / Dashboard", "summary_, report_", "Developer J", "daily_branch_revenue_summary, daily_patient_visit_summary, department_wise_collection_summary, doctor_performance_summary, lab_test_volume_summary, bed_occupancy_summary", "All modules", "N/A", "Architect + Module Owners"],
    ["AI Patient Journey Command Center", "ai_, journey_", "Developer J", "patient_journey_summary, ai_alerts, operational_risk_scores, journey_stage_events", "Patient, Encounter, Lab, Pharmacy, Billing, Discharge", "N/A", "Clinical + Compliance + Architect"],
]


def build_doc(diagrams: dict[str, Path]) -> Document:
    doc = setup_doc()

    # Cover
    cover = doc.add_table(rows=1, cols=1)
    cell = cover.cell(0, 0)
    shade(cell, "14325C")
    border(cell, "14325C")
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Multi-Developer Database Development Workflow")
    r.font.name = "Aptos Display"
    r.font.size = Pt(22)
    r.font.bold = True
    r.font.color.rgb = RGBColor(255, 255, 255)
    p2 = cell.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run("for Plasmit Hospital Management System")
    r2.font.name = "Aptos Display"
    r2.font.size = Pt(16)
    r2.font.bold = True
    r2.font.color.rgb = RGBColor(*rgb("D8E8FF"))
    doc.add_paragraph()
    picture(doc, diagrams["workflow"], "End-to-end workflow for multiple database developers.")
    table(
        doc,
        ["Prepared For", "Technology Stack", "Recommended Tool", "Document Purpose"],
        [["Backend, database, integration and QA teams", "Spring Boot, Java 17, MySQL, JDBC/NamedParameterJdbcTemplate", "Flyway", "Allow 8-12 developers to build database and backend modules without conflicts"]],
    )
    doc.add_page_break()

    heading(doc, "Table of Contents", 1)
    bullets(
        doc,
        [
            "1. Executive Summary",
            "2. Core Rules for All Developers",
            "3. Team Distribution Model",
            "4. Database Ownership Matrix",
            "5. Recommended Table Prefix Strategy",
            "6. Standard Columns for Every Table",
            "7. Migration File Workflow",
            "8. Migration Folder Structure",
            "9. Git Branching Strategy",
            "10. Commit Message Convention",
            "11. Pull Request Checklist",
            "12. Database Review Process",
            "13. Conflict Prevention Rules",
            "14. Local Development Database Strategy",
            "15. Seed Data Strategy",
            "16. Tenant Isolation Rules",
            "17. FHIR and HL7 Responsibility Distribution",
            "18. Inter-Module Dependency Flow",
            "19. Developer Daily Workflow",
            "20. Integration Testing Workflow",
            "21. Database Documentation Process",
            "22. Example Module Distribution Plan",
            "23. Definition of Done",
            "24. Anti-Patterns to Avoid",
            "25. Final Recommended Workflow Summary",
        ],
    )
    doc.add_page_break()

    heading(doc, "1. Executive Summary", 1)
    para(doc, "This workflow defines how multiple backend and database developers should work together while building the Plasmit Hospital Management System database. The platform uses Spring Boot microservices, MySQL, Java 17, JDBC or NamedParameterJdbcTemplate, Flyway migrations, and strict multi-tenant isolation using tenant_id, hospital_id and branch_id.")
    callout(
        doc,
        "Why this workflow is mandatory",
        [
            "Without migration control, developers can overwrite each other's schema changes.",
            "Without ownership, two teams may create duplicate tables for the same business concept.",
            "Without tenant filters, one hospital or branch can accidentally see another hospital's data.",
            "Without review, FHIR, HL7, reporting and audit mappings become inconsistent.",
            "Migration versioning creates a reliable history of schema changes and makes deployment repeatable.",
        ],
        fill="EAF4FF",
    )
    picture(doc, diagrams["workflow"], "Recommended multi-developer database workflow.")

    heading(doc, "2. Core Rules for All Developers", 1)
    bullets(
        doc,
        [
            "Never directly alter the shared database manually.",
            "Every table, column, index, trigger or constraint change must go through a migration file.",
            "Every major table must include tenant_id, hospital_id and branch_id where applicable.",
            "Every table must include audit columns: created_by, updated_by, created_at, updated_at, is_deleted.",
            "Every query must filter by tenant_id, hospital_id and branch_id where applicable.",
            "Every module developer owns only their assigned module tables.",
            "Shared master tables require database architect approval.",
            "Do not duplicate existing tables or create random naming.",
            "Do not remove or rename columns without migration and review approval.",
            "Do not add FHIR or HL7 mapping randomly without integration team review.",
            "Never edit an already merged Flyway migration.",
            "Every migration must be committed with related repository, service and API code.",
        ],
    )

    heading(doc, "3. Team Distribution Model", 1)
    callout(
        doc,
        "Coverage update",
        [
            "Developer C now owns the full clinical core: OPD, doctor workbench, EMR, vitals, diagnosis, allergy, care plan, clinical orders and prescription.",
            "Developer L has been added for hospital operations modules: HRMS, staff attendance, store, procurement, diet, housekeeping, maintenance, helpdesk and portals.",
            "The ownership matrix below covers clinical, operational, financial, integration, reporting and compliance modules.",
        ],
        fill="FFF7E6",
        title_color="B45309",
    )
    table(doc, ["Developer", "Owned Modules", "Owned Tables", "Dependent Modules", "Migration Ownership", "API Testing Responsibility", "Review Dependency"], DEVELOPERS)

    heading(doc, "4. Database Ownership Matrix", 1)
    table(doc, ["Module", "Table Prefix", "Owner", "Primary Tables", "Shared Dependencies", "FHIR Resources", "Review Required From"], OWNERSHIP)

    heading(doc, "5. Recommended Table Prefix Strategy", 1)
    table(
        doc,
        ["Area", "Recommended Names"],
        [
            ["SaaS/foundation", "tenants, subscription_plans, tenant_subscriptions, hospitals, branches, departments, healthcare_services"],
            ["Security/access", "users, roles, permissions, role_permissions, user_branch_access, practitioner_roles"],
            ["Patient/MPI", "patients, patient_identifiers, patient_addresses, patient_contacts, patient_merge_history"],
            ["Portals", "portal_users, portal_sessions, portal_patient_links, doctor_portal_profiles"],
            ["Appointment/queue", "appointments, appointment_slots, appointment_queues, appointment_status_history"],
            ["Encounter/visit", "encounters, encounter_participants, encounter_status_history, encounter_locations"],
            ["OPD/doctor workbench", "opd_visits, opd_queue, doctor_consultations, doctor_tasks, clinical_orders"],
            ["Clinical/EMR", "clinical_notes, emr_documents, progress_notes, diagnoses, problem_lists, vitals, observation_records"],
            ["Allergy/care plan", "patient_allergies, immunizations, care_plans, care_plan_goals"],
            ["Prescription", "prescriptions, prescription_items, medication_orders, medication_order_status_history"],
            ["Nursing", "nursing_notes, nursing_tasks, nursing_handover, medication_administrations, fluid_balance_records"],
            ["Lab/diagnostics", "lab_orders, lab_order_items, lab_samples, lab_results, lab_result_flags, diagnostic_reports"],
            ["Radiology/imaging", "radiology_orders, radiology_reports, radiology_images, radiology_report_reviews"],
            ["Pharmacy", "medicines, medicine_categories, medicine_batches, pharmacy_stock, pharmacy_stock_movements, pharmacy_sales, pharmacy_sale_items"],
            ["Billing", "billing_invoices, billing_invoice_items, billing_packages, charge_master, patient_accounts"],
            ["Payment/refund", "payments, payment_allocations, refunds, receipt_print_logs"],
            ["Insurance/TPA", "insurance_policies, insurance_claims, claim_documents, claim_status_history, tpa_master"],
            ["IPD/ward/bed", "admissions, admission_transfers, wards, rooms, beds, bed_allocations, bed_transfer_history"],
            ["Discharge/follow-up", "discharge_checklists, discharge_summaries, discharge_medications, followups"],
            ["Emergency/ER", "emergency_cases, triage_assessments, emergency_orders, emergency_transfer_logs"],
            ["Surgery/OT", "surgeries, operation_theatres, surgery_team, surgery_checklists, anesthesia_records"],
            ["Ambulance", "ambulances, ambulance_requests, ambulance_trips, ambulance_staff_assignments"],
            ["Blood bank", "blood_donors, blood_bank_units, blood_requests, blood_transfusions, blood_screening_results"],
            ["HRMS/attendance", "staff_profiles, staff_attendance, staff_shifts, leave_requests"],
            ["Inventory/store", "inventory_items, store_stock, stock_requisitions, stock_issues, stock_adjustments"],
            ["Procurement/purchase", "vendor_master, purchase_orders, purchase_order_items, goods_receipts, supplier_invoices"],
            ["Diet/kitchen", "diet_orders, diet_plans, kitchen_menus, meal_delivery_logs"],
            ["Housekeeping", "housekeeping_tasks, cleaning_schedules, bed_cleaning_logs"],
            ["Maintenance", "maintenance_tickets, asset_maintenance_logs, equipment_downtime_logs"],
            ["Helpdesk/support", "helpdesk_tickets, support_categories, ticket_comments, ticket_sla_logs"],
            ["Notification", "notifications, notification_templates, notification_delivery_logs, notification_preferences"],
            ["Documents/reports", "documents, document_versions, document_access_logs"],
            ["FHIR", "fhir_resource_mapping, fhir_resource_store, fhir_api_audit_log, fhir_sync_status, fhir_code_system_mapping"],
            ["HL7", "hl7_message_log, hl7_message_error_log, hl7_mapping, hl7_ack_log, integration_endpoints"],
            ["Reporting/dashboard", "daily_branch_revenue_summary, daily_patient_visit_summary, department_wise_collection_summary, doctor_performance_summary"],
            ["AI command center", "patient_journey_summary, ai_alerts, operational_risk_scores, journey_stage_events"],
            ["Audit/compliance", "audit_logs, user_login_history, patient_record_access_logs, consent_records, break_glass_access_logs, security_events"],
        ],
    )
    bullets(doc, ["Use plural table names.", "Use snake_case only.", "Avoid unnecessary prefixes where table names are already clear.", "Do not create alternate names for existing concepts."])

    heading(doc, "6. Standard Columns for Every Table", 1)
    table(
        doc,
        ["Table Type", "Standard Columns"],
        [
            ["Master tables", "id, tenant_id, hospital_id, branch_id nullable if hospital-level, code, name, status, created_by, updated_by, created_at, updated_at, is_deleted"],
            ["Transaction tables", "id, tenant_id, hospital_id, branch_id, patient_id nullable, encounter_id nullable, transaction_no/order_no/invoice_no, status, created_by, updated_by, created_at, updated_at, is_deleted"],
            ["Audit tables", "id, tenant_id, hospital_id, branch_id, entity_name, entity_id, action, old_value_json, new_value_json, performed_by, performed_at, ip_address, user_agent"],
        ],
    )

    heading(doc, "7. Migration File Workflow", 1)
    picture(doc, diagrams["migration"], "Flyway migration lifecycle.")
    callout(
        doc,
        "Recommended migration tool: Flyway",
        [
            "Flyway is simple, SQL-first, easy for JDBC projects, and practical for Spring Boot services.",
            "A migration tool is mandatory because database structure must be versioned like code.",
            "Direct manual DB changes are not allowed because they are not repeatable, reviewable or deployable.",
            "Every schema change must be committed with the related module code.",
        ],
        fill="E8F7F3",
        title_color="0F766E",
    )
    table(
        doc,
        ["Style", "Example", "Recommendation"],
        [
            ["Sequential version", "V001__create_foundation_tables.sql", "Good for initial planning but conflict-prone with many developers."],
            ["Timestamp version", "V202606021030__create_patient_tables.sql", "Recommended for parallel development."],
            ["Repeatable seed", "R__seed_default_roles_permissions.sql", "Use for controlled master/reference seed data."],
        ],
    )
    bullets(
        doc,
        [
            "Every developer must create a unique migration version using current timestamp.",
            "Never edit an already merged migration file.",
            "If a change is needed after merge, create a new migration file.",
            "Migration files must be small and module-specific.",
            "Seed data must be separate from schema migration.",
            "Rollback plan must be mentioned in the PR description.",
            "Always test migration on a clean database before PR.",
        ],
    )

    heading(doc, "8. Migration Folder Structure", 1)
    code(
        doc,
        """
src/main/resources/db/migration/
  V202606020900__create_foundation_tables.sql
  V202606021000__create_patient_tables.sql
  V202606021100__create_appointment_tables.sql

auth-service/src/main/resources/db/migration/
hospital-service/src/main/resources/db/migration/
patient-service/src/main/resources/db/migration/
appointment-service/src/main/resources/db/migration/
lab-service/src/main/resources/db/migration/
billing-service/src/main/resources/db/migration/
pharmacy-service/src/main/resources/db/migration/
fhir-gateway-service/src/main/resources/db/migration/
hl7-integration-service/src/main/resources/db/migration/
""",
    )
    bullets(doc, ["Each microservice owns its migration folder.", "Shared foundation schema should be owned by foundation or hospital service.", "Cross-service tables should be avoided unless architect-approved."])

    heading(doc, "9. Git Branching Strategy", 1)
    table(
        doc,
        ["Branch Type", "Example"],
        [
            ["Feature", "feature/db-patient-schema, feature/db-lab-orders, feature/db-billing-invoice, feature/db-fhir-mapping"],
            ["Fix", "fix/db-patient-index, fix/db-appointment-tenant-filter"],
            ["Hotfix", "hotfix/db-payment-constraint"],
        ],
    )
    table(
        doc,
        ["Step", "Developer Workflow"],
        [
            ["1", "Pull latest dev branch."],
            ["2", "Create feature branch."],
            ["3", "Create unique Flyway migration file."],
            ["4", "Run migration locally."],
            ["5", "Add repository, service and API code."],
            ["6", "Test using Postman."],
            ["7", "Commit code and migration together."],
            ["8", "Push branch."],
            ["9", "Create pull request to dev."],
            ["10", "Review and merge."],
            ["11", "Team pulls latest dev and runs migrations locally."],
        ],
    )

    heading(doc, "10. Commit Message Convention", 1)
    code(
        doc,
        """
feat(db): add patient registration tables
feat(db): add lab order and result tables
fix(db): add missing tenant index on billing invoices
refactor(db): rename lab sample status column
chore(db): add seed data for appointment statuses
""",
    )

    heading(doc, "11. Pull Request Checklist", 1)
    table(
        doc,
        ["Checklist Item", "Required"],
        [[item, "Yes"] for item in [
            "Migration file added",
            "Migration file has unique timestamp version",
            "Local migration tested",
            "No direct DB manual change",
            "All major tables have tenant_id, hospital_id and branch_id",
            "Audit columns added",
            "Indexes added",
            "Foreign keys reviewed",
            "Soft delete column added",
            "Status columns standardized",
            "Sample data separated from schema migration",
            "API query has tenant filtering",
            "Postman tests passed",
            "FHIR mapping updated if applicable",
            "HL7 mapping updated if applicable",
            "No duplicate table created",
            "No existing migration edited",
            "Rollback notes added",
        ]],
    )

    heading(doc, "12. Database Review Process", 1)
    picture(doc, diagrams["review"], "Four database review levels.")
    table(
        doc,
        ["Review Level", "Owner", "Checks"],
        [
            ["Level 1", "Module Developer", "Naming, columns, tenant isolation, indexes, constraints, migration run."],
            ["Level 2", "Module Lead", "Module correctness, API compatibility, table ownership."],
            ["Level 3", "Database Architect", "Shared tables, column rename, cross-module FK, multi-tenant logic, large index, denormalized table."],
            ["Level 4", "Integration Review", "FHIR resource mapping, HL7 message storage, external system mapping, shared identifiers."],
        ],
    )

    heading(doc, "13. Conflict Prevention Rules", 1)
    table(
        doc,
        ["Common Conflict", "Prevention"],
        [
            ["Two developers create same migration version", "Use timestamp-based migration versions."],
            ["Two developers create same table", "Use ownership matrix before starting work."],
            ["One developer changes shared table", "Require architect approval."],
            ["Column name mismatch", "Use naming convention and review checklist."],
            ["Missing tenant filters", "Repository review and multi-tenant tests."],
            ["Broken foreign key", "Integration testing on clean DB."],
            ["Heavy reporting query", "Use denormalized summary table."],
            ["Migration works locally but fails in dev", "Always test on clean DB before PR."],
        ],
    )

    heading(doc, "14. Local Development Database Strategy", 1)
    picture(doc, diagrams["local_shared"], "Recommended local-to-shared DB workflow.")
    table(
        doc,
        ["Option", "Recommendation", "Pros", "Cons"],
        [
            ["Local DB per developer", "Recommended", "No conflict, easy reset, safe testing", "Each developer must keep migrations updated."],
            ["Shared dev DB", "Use after PR merge only", "Good for integration and QA", "Can break others if direct changes happen."],
        ],
    )

    heading(doc, "15. Seed Data Strategy", 1)
    bullets(
        doc,
        [
            "Master seed data should be separate from schema migration.",
            "Do not insert random test data in schema migration.",
            "Use Flyway repeatable migrations for controlled master data.",
            "Seed data should be reviewed because it affects all developers and environments.",
        ],
    )
    code(
        doc,
        """
R__seed_global_master_data.sql
R__seed_fhir_code_systems.sql
R__seed_default_roles_permissions.sql
""",
    )
    table(
        doc,
        ["Seed Area", "Examples"],
        [
            ["Common master", "gender_master, blood_group_master"],
            ["Workflow master", "appointment_status_master, encounter_type_master"],
            ["Integration master", "fhir_resource_type_master, hl7_message_type_master"],
            ["Security seed", "default_roles, default_permissions"],
        ],
    )

    heading(doc, "16. Tenant Isolation Rules", 1)
    picture(doc, diagrams["tenant"], "Tenant and branch isolation must happen in backend repository queries.")
    bullets(
        doc,
        [
            "All patient, clinical, billing, pharmacy and lab records must have tenant_id, hospital_id and branch_id.",
            "branch_id is mandatory for branch-level operations.",
            "Patient can be hospital-level.",
            "Encounter must be branch-level.",
            "Billing must be branch-level.",
            "Lab order must be branch-level.",
            "Pharmacy stock must be branch-level.",
            "No query should fetch data without tenant filters.",
        ],
    )
    code(
        doc,
        """
SELECT *
FROM patients
WHERE tenant_id = :tenantId
  AND hospital_id = :hospitalId
  AND is_deleted = 0;

SELECT *
FROM appointments
WHERE tenant_id = :tenantId
  AND hospital_id = :hospitalId
  AND branch_id IN (:allowedBranchIds)
  AND is_deleted = 0;
""",
    )

    heading(doc, "17. FHIR and HL7 Responsibility Distribution", 1)
    table(
        doc,
        ["FHIR/HL7 Team Owns", "Module Developers Must Provide"],
        [
            ["fhir_resource_mapping", "Internal table name"],
            ["fhir_resource_store", "Internal record ID"],
            ["fhir_api_audit_log", "Business identifier"],
            ["hl7_message_log", "FHIR resource mapping requirement"],
            ["hl7_mapping", "Event triggers for create/update/status change"],
            ["external_identifier_mapping", "External system identifier rules"],
        ],
    )
    table(
        doc,
        ["Module", "Must Inform FHIR/HL7 Team"],
        [
            ["Patient", "patients -> Patient, patient_allergies -> AllergyIntolerance, patient_documents -> DocumentReference"],
            ["Lab", "lab_orders -> ServiceRequest, lab_results -> Observation, diagnostic_reports -> DiagnosticReport"],
            ["Pharmacy", "prescriptions -> MedicationRequest, medicines -> Medication, pharmacy_dispense -> MedicationDispense"],
            ["Billing", "billing_invoices -> Account, invoice items -> ChargeItem, claims -> Claim"],
        ],
    )

    heading(doc, "18. Inter-Module Dependency Flow", 1)
    picture(doc, diagrams["dependency"], "Module dependency flow.")

    heading(doc, "19. Developer Daily Workflow", 1)
    table(
        doc,
        ["Time", "Actions"],
        [
            ["Morning", "Pull latest dev; run migrations locally; check conflicts; confirm assigned module tables."],
            ["During development", "Create feature branch; add migration file; run app locally; test API; add indexes; add tenant filters; add audit events."],
            ["Before PR", "Run clean DB migration; run module APIs; verify tenant isolation; verify branch isolation; update documentation; add PR checklist."],
            ["After merge", "Pull dev; run migration; resolve conflicts early; notify team if shared table changed."],
        ],
    )

    heading(doc, "20. Integration Testing Workflow", 1)
    table(
        doc,
        ["Test Type", "Scenario"],
        [
            ["Clean database migration", "All migrations run from empty database."],
            ["Module API test", "Postman collection passes for module endpoints."],
            ["Multi-tenant test", "Hospital A cannot see Hospital B patient."],
            ["Multi-branch test", "Branch A receptionist cannot see Branch B appointment."],
            ["Role test", "Hospital admin can see all branches; branch user sees only own branch."],
            ["Encounter test", "Patient visit creates encounter correctly."],
            ["FHIR mapping test", "Lab result maps to Observation; prescription maps to MedicationRequest."],
            ["HL7 message test", "Inbound ORU or ADT message is logged, parsed and mapped."],
            ["Reporting test", "Summary table refresh works after transaction data changes."],
            ["Performance test", "Large table query uses correct composite index."],
        ],
    )

    heading(doc, "21. Database Documentation Process", 1)
    bullets(
        doc,
        [
            "Every module developer must update table list.",
            "Every new column should have a short description.",
            "FHIR mapping must be documented for mapped clinical, patient and billing tables.",
            "API mapping should describe which endpoints use the table.",
            "Index list and dependency list must be maintained.",
        ],
    )
    code(
        doc,
        """
docs/database/schema-overview.md
docs/database/module-table-ownership.md
docs/database/fhir-mapping.md
docs/database/hl7-mapping.md
docs/database/migration-history.md
""",
    )

    heading(doc, "22. Example Module Distribution Plan", 1)
    table(
        doc,
        ["Sprint", "Developer Assignments"],
        [
            ["Sprint 1", "Developer A: tenant, hospital, branch, department, users, roles and permissions. Developer B: patient/MPI, patient contacts, appointment slots and queues. Developer C: encounter base, OPD queue, doctor workbench skeleton, vitals and diagnosis base. Developer I: FHIR base mapping tables. Developer K: audit log and consent foundation."],
            ["Sprint 2", "Developer C: full clinical EMR, notes, problem list, allergy, care plan, clinical orders and prescription. Developer D: lab order, sample, result and radiology report tables. Developer E: medicine master, batch, pharmacy stock and dispensing. Developer F: billing invoice, payment, refund and insurance claim base. Developer G: IPD admission, ward, bed and nursing tasks."],
            ["Sprint 3", "Developer G: discharge summary, follow-up, medication administration and nursing handover. Developer H: emergency, triage, OT, surgery, ambulance and blood bank. Developer L: staff attendance, HRMS, inventory store, procurement, diet, housekeeping, maintenance, helpdesk and portals. Developer I: HL7 inbound/outbound logs and external identifier mapping. Developer J: reporting summary tables and patient journey command center."],
            ["Sprint 4", "Developer J: analytics, AI alerts and operational risk summaries. Developer K: notification templates, delivery logs, break-glass access logs and patient record access logs. All module owners: FHIR/HL7 mapping review, tenant isolation test, branch isolation test, clean DB migration test and final integration hardening."],
        ],
    )

    heading(doc, "23. Definition of Done for Database Work", 1)
    bullets(
        doc,
        [
            "Migration file created.",
            "Migration runs on clean database.",
            "Table follows naming convention.",
            "Tenant columns added.",
            "Audit columns added.",
            "Required indexes added.",
            "Repository queries have tenant filters.",
            "API tested.",
            "Postman collection updated.",
            "FHIR mapping documented if applicable.",
            "HL7 mapping documented if applicable.",
            "PR reviewed and merged.",
        ],
    )

    heading(doc, "24. Anti-Patterns to Avoid", 1)
    bullets(
        doc,
        [
            "Manual database changes.",
            "Editing old migration after merge.",
            "Creating table without tenant_id.",
            "Creating table without indexes.",
            "Using random status values.",
            "Using varchar for money.",
            "Storing amount in floating type.",
            "Duplicating patient data in every module.",
            "Directly using frontend branch_id without backend validation.",
            "Building dashboards from heavy transactional queries.",
            "Mixing FHIR JSON as the main transactional table.",
            "Ignoring audit logs.",
            "Creating foreign keys without understanding module ownership.",
        ],
    )

    heading(doc, "25. Final Recommended Workflow Summary", 1)
    callout(
        doc,
        "Implementation recommendation",
        [
            "Use local database per developer.",
            "Use Flyway timestamp migration files.",
            "Use module ownership matrix before creating or changing tables.",
            "Use shared dev database only after PR merge.",
            "Never make manual database changes.",
            "Use tenant_id, hospital_id and branch_id isolation in all tables and queries.",
            "Use normalized transactional tables and denormalized reporting tables.",
            "FHIR and HL7 should be handled by a dedicated integration team.",
            "Database architect reviews shared tables and cross-module changes.",
            "PR checklist is mandatory for every database change.",
        ],
        fill="E8F7F3",
        title_color="0F766E",
    )
    return doc


def make_markdown(diagrams: dict[str, Path]) -> str:
    def md_table(headers: list[str], rows: list[list[str]]) -> list[str]:
        output = [
            "| " + " | ".join(headers) + " |",
            "| " + " | ".join(["---"] * len(headers)) + " |",
        ]
        for row in rows:
            safe = [cell.replace("\n", "<br>").replace("|", "/") for cell in row]
            output.append("| " + " | ".join(safe) + " |")
        return output

    dependency_mermaid = """
graph TD
A[Foundation] --> B[Patient]
A --> C[Users and Roles]
B --> D[Appointment]
B --> E[Encounter]
E --> F[Clinical Notes]
E --> G[Lab]
E --> H[Radiology]
E --> I[Prescription]
E --> R[IPD / Nursing / Discharge]
E --> S[Emergency / OT / Surgery]
I --> J[Pharmacy]
E --> K[Billing]
K --> L[Payments]
K --> M[Insurance]
B --> N[Documents]
R --> T[Ward / Bed]
S --> U[Ambulance / Blood Bank]
V[Hospital Operations] --> W[HRMS / Attendance]
V --> X[Store / Procurement]
V --> Y[Diet / Housekeeping / Maintenance / Helpdesk]
F --> O[FHIR Layer]
G --> O
H --> O
I --> O
J --> O
K --> O
R --> O
S --> O
P[HL7 Layer] --> G
P --> H
P --> B
Q[Audit] --> A
Q --> B
Q --> E
Q --> K
Q --> V
""".strip()

    lines: list[str] = [
        "# Multi-Developer Database Development Workflow for Plasmit Hospital Management System",
        "",
        "**Project context:** Spring Boot microservices, Java 17, MySQL, JDBC/NamedParameterJdbcTemplate, Flyway, GitHub/GitLab workflow, Postman API testing, multi-tenant isolation using `tenant_id`, `hospital_id` and `branch_id`.",
        "",
        "## 1. Executive Summary",
        "",
        "This workflow explains how 8-12 developers can build database and backend modules at the same time without conflicts, duplicate tables, broken migrations or tenant isolation mistakes.",
        "",
        "Without a workflow, common problems appear quickly: two developers create the same migration version, two modules create duplicate patient/order tables, shared tables are changed without review, queries miss tenant filters, and FHIR/HL7 mappings become inconsistent.",
        "",
        "The recommended approach is:",
        "",
        "- Use Flyway as the default migration tool.",
        "- Use timestamp-based migration files for parallel development.",
        "- Use local database per developer.",
        "- Apply migrations to shared dev database only after PR merge.",
        "- Commit migration files together with service, repository and API code.",
        "- Enforce `tenant_id`, `hospital_id` and `branch_id` in tables and queries.",
        "- Assign clear module and table ownership.",
        "- Require architect review for shared tables, cross-module foreign keys, denormalized tables and FHIR/HL7 mapping tables.",
        "",
        "![Workflow](assets/db-workflow/01_multi_developer_workflow.png)",
        "",
        "## 2. Core Rules for All Developers",
        "",
        "- Never directly alter the shared database manually.",
        "- Every table change must go through a migration file.",
        "- Every major table must include `tenant_id`, `hospital_id` and `branch_id` where applicable.",
        "- Every table must include audit columns.",
        "- Every query must filter by tenant, hospital and branch where applicable.",
        "- Every module developer owns only assigned module tables.",
        "- Shared master tables need database architect approval.",
        "- Do not duplicate existing tables.",
        "- Do not create random naming.",
        "- Do not remove or rename columns without migration review.",
        "- Do not add FHIR/HL7 mapping randomly without integration team review.",
        "- Never edit an already merged migration file.",
        "",
        "## 3. Team Distribution Model",
        "",
        "> Coverage update: Developer C owns the full clinical core: OPD, doctor workbench, EMR, vitals, diagnosis, allergy, care plan, clinical orders and prescription. Developer L has been added for HRMS, store, procurement, diet, housekeeping, maintenance, helpdesk and portals.",
        "",
    ]
    lines.extend(md_table(["Developer", "Owned Modules", "Owned Tables", "Dependent Modules", "Migration Ownership", "API Testing Responsibility", "Review Dependency"], DEVELOPERS))

    lines.extend([
        "",
        "## 4. Database Ownership Matrix",
        "",
    ])
    lines.extend(md_table(["Module", "Table Prefix", "Owner", "Primary Tables", "Shared Dependencies", "FHIR Resources", "Review Required From"], OWNERSHIP))

    lines.extend([
        "",
        "## 5. Recommended Table Prefix Strategy",
        "",
    ])
    lines.extend(md_table(
        ["Area", "Recommended Table Names"],
        [
            ["SaaS/foundation", "tenants, subscription_plans, tenant_subscriptions, hospitals, branches, departments, healthcare_services"],
            ["Security/access", "users, roles, permissions, role_permissions, user_branch_access, practitioner_roles"],
            ["Patient/MPI", "patients, patient_identifiers, patient_addresses, patient_contacts, patient_merge_history"],
            ["Portals", "portal_users, portal_sessions, portal_patient_links, doctor_portal_profiles"],
            ["Appointment/queue", "appointments, appointment_slots, appointment_queues, appointment_status_history"],
            ["Encounter/visit", "encounters, encounter_participants, encounter_status_history, encounter_locations"],
            ["OPD/doctor workbench", "opd_visits, opd_queue, doctor_consultations, doctor_tasks, clinical_orders"],
            ["Clinical/EMR", "clinical_notes, emr_documents, progress_notes, diagnoses, problem_lists, vitals, observation_records"],
            ["Allergy/care plan", "patient_allergies, immunizations, care_plans, care_plan_goals"],
            ["Prescription", "prescriptions, prescription_items, medication_orders, medication_order_status_history"],
            ["Nursing", "nursing_notes, nursing_tasks, nursing_handover, medication_administrations, fluid_balance_records"],
            ["Lab/diagnostics", "lab_orders, lab_order_items, lab_samples, lab_results, lab_result_flags, diagnostic_reports"],
            ["Radiology/imaging", "radiology_orders, radiology_reports, radiology_images, radiology_report_reviews"],
            ["Pharmacy", "medicines, medicine_categories, medicine_batches, pharmacy_stock, pharmacy_stock_movements, pharmacy_sales, pharmacy_sale_items"],
            ["Billing", "billing_invoices, billing_invoice_items, billing_packages, charge_master, patient_accounts"],
            ["Payment/refund", "payments, payment_allocations, refunds, receipt_print_logs"],
            ["Insurance/TPA", "insurance_policies, insurance_claims, claim_documents, claim_status_history, tpa_master"],
            ["IPD/ward/bed", "admissions, admission_transfers, wards, rooms, beds, bed_allocations, bed_transfer_history"],
            ["Discharge/follow-up", "discharge_checklists, discharge_summaries, discharge_medications, followups"],
            ["Emergency/ER", "emergency_cases, triage_assessments, emergency_orders, emergency_transfer_logs"],
            ["Surgery/OT", "surgeries, operation_theatres, surgery_team, surgery_checklists, anesthesia_records"],
            ["Ambulance", "ambulances, ambulance_requests, ambulance_trips, ambulance_staff_assignments"],
            ["Blood bank", "blood_donors, blood_bank_units, blood_requests, blood_transfusions, blood_screening_results"],
            ["HRMS/attendance", "staff_profiles, staff_attendance, staff_shifts, leave_requests"],
            ["Inventory/store", "inventory_items, store_stock, stock_requisitions, stock_issues, stock_adjustments"],
            ["Procurement/purchase", "vendor_master, purchase_orders, purchase_order_items, goods_receipts, supplier_invoices"],
            ["Diet/kitchen", "diet_orders, diet_plans, kitchen_menus, meal_delivery_logs"],
            ["Housekeeping", "housekeeping_tasks, cleaning_schedules, bed_cleaning_logs"],
            ["Maintenance", "maintenance_tickets, asset_maintenance_logs, equipment_downtime_logs"],
            ["Helpdesk/support", "helpdesk_tickets, support_categories, ticket_comments, ticket_sla_logs"],
            ["Notification", "notifications, notification_templates, notification_delivery_logs, notification_preferences"],
            ["Documents/reports", "documents, document_versions, document_access_logs"],
            ["FHIR", "fhir_resource_mapping, fhir_resource_store, fhir_api_audit_log, fhir_sync_status, fhir_code_system_mapping"],
            ["HL7", "hl7_message_log, hl7_message_error_log, hl7_mapping, hl7_ack_log, integration_endpoints"],
            ["Reporting/dashboard", "daily_branch_revenue_summary, daily_patient_visit_summary, department_wise_collection_summary, doctor_performance_summary"],
            ["AI command center", "patient_journey_summary, ai_alerts, operational_risk_scores, journey_stage_events"],
            ["Audit/compliance", "audit_logs, user_login_history, patient_record_access_logs, consent_records, break_glass_access_logs, security_events"],
        ],
    ))

    lines.extend([
        "",
        "Rules:",
        "",
        "- Use plural table names.",
        "- Use `snake_case` only.",
        "- Avoid unnecessary prefixes where names are already clear.",
        "- Do not create alternate names for existing business concepts.",
        "",
        "## 6. Standard Columns for Every Table",
        "",
    ])
    lines.extend(md_table(
        ["Table Type", "Standard Columns"],
        [
            ["Master tables", "id, tenant_id, hospital_id, branch_id nullable if hospital-level, code, name, status, created_by, updated_by, created_at, updated_at, is_deleted"],
            ["Transaction tables", "id, tenant_id, hospital_id, branch_id, patient_id nullable, encounter_id nullable, transaction_no/order_no/invoice_no, status, created_by, updated_by, created_at, updated_at, is_deleted"],
            ["Audit tables", "id, tenant_id, hospital_id, branch_id, entity_name, entity_id, action, old_value_json, new_value_json, performed_by, performed_at, ip_address, user_agent"],
        ],
    ))

    lines.extend([
        "",
        "## 7. Migration File Workflow",
        "",
        "![Migration Lifecycle](assets/db-workflow/02_flyway_migration_lifecycle.png)",
        "",
        "Flyway is recommended because it is SQL-first, simple for Spring Boot JDBC projects and easy for teams to review.",
        "",
        "Migration tool rules:",
        "",
        "- Direct manual DB changes are not allowed.",
        "- Every schema change must be versioned.",
        "- Migration file must be committed with the related module code.",
        "- Use timestamp versions to prevent multi-developer conflicts.",
        "- Never edit a merged migration.",
        "- If a merged migration needs change, create a new migration.",
        "- Keep migration files small and module-specific.",
        "- Keep seed data separate from schema migration.",
        "- Add rollback notes in the PR description.",
        "",
        "Example migration names:",
        "",
        "```text",
        "V202606021030__create_patient_tables.sql",
        "V202606021045__create_lab_order_tables.sql",
        "V202606021100__create_billing_invoice_tables.sql",
        "R__seed_default_roles_permissions.sql",
        "```",
        "",
        "## 8. Migration Folder Structure",
        "",
        "```text",
        "src/main/resources/db/migration/",
        "  V202606020900__create_foundation_tables.sql",
        "  V202606021000__create_patient_tables.sql",
        "  V202606021100__create_appointment_tables.sql",
        "",
        "auth-service/src/main/resources/db/migration/",
        "hospital-service/src/main/resources/db/migration/",
        "patient-service/src/main/resources/db/migration/",
        "appointment-service/src/main/resources/db/migration/",
        "lab-service/src/main/resources/db/migration/",
        "billing-service/src/main/resources/db/migration/",
        "pharmacy-service/src/main/resources/db/migration/",
        "fhir-gateway-service/src/main/resources/db/migration/",
        "hl7-integration-service/src/main/resources/db/migration/",
        "```",
        "",
        "- Each microservice owns its migration folder.",
        "- Shared foundation schema should be owned by foundation/hospital service.",
        "- Cross-service tables should be avoided unless architect-approved.",
        "",
        "## 9. Git Branching Strategy",
        "",
    ])
    lines.extend(md_table(
        ["Branch Type", "Example"],
        [
            ["Feature", "feature/db-patient-schema, feature/db-lab-orders, feature/db-billing-invoice, feature/db-fhir-mapping"],
            ["Fix", "fix/db-patient-index, fix/db-appointment-tenant-filter"],
            ["Hotfix", "hotfix/db-payment-constraint"],
        ],
    ))
    lines.extend([
        "",
        "Developer workflow:",
        "",
        "1. Pull latest dev branch.",
        "2. Create feature branch.",
        "3. Create migration file.",
        "4. Run migration locally.",
        "5. Add repository/service/API code.",
        "6. Test using Postman.",
        "7. Commit code and migration together.",
        "8. Push branch.",
        "9. Create pull request to dev.",
        "10. Review and merge.",
        "11. Team pulls latest dev and migrates local DB.",
        "",
        "## 10. Commit Message Convention",
        "",
        "```text",
        "feat(db): add patient registration tables",
        "feat(db): add lab order and result tables",
        "fix(db): add missing tenant index on billing invoices",
        "refactor(db): rename lab sample status column",
        "chore(db): add seed data for appointment statuses",
        "```",
        "",
        "## 11. Pull Request Checklist",
        "",
        "- Migration file added",
        "- Migration file has unique version",
        "- Local migration tested",
        "- No direct DB manual change",
        "- All major tables have `tenant_id`, `hospital_id`, `branch_id`",
        "- Audit columns added",
        "- Indexes added",
        "- Foreign keys reviewed",
        "- Soft delete column added",
        "- Status columns standardized",
        "- Sample data separated",
        "- API query has tenant filtering",
        "- Postman tests passed",
        "- FHIR mapping updated if applicable",
        "- HL7 mapping updated if applicable",
        "- No duplicate table created",
        "- No existing migration edited",
        "- Rollback notes added",
        "",
        "## 12. Database Review Process",
        "",
        "![Review Levels](assets/db-workflow/04_database_review_levels.png)",
        "",
    ])
    lines.extend(md_table(
        ["Review Level", "Owner", "Checks"],
        [
            ["Level 1", "Module Developer", "Naming, columns, tenant isolation, indexes, constraints, migration run"],
            ["Level 2", "Module Lead", "Module correctness, API compatibility, table ownership"],
            ["Level 3", "Database Architect", "New shared table, column rename, cross-module FK, multi-tenant logic, large index, denormalized table"],
            ["Level 4", "Integration Review", "FHIR resource mapping, HL7 message storage, external system mapping, shared identifiers"],
        ],
    ))

    lines.extend([
        "",
        "## 13. Conflict Prevention Rules",
        "",
    ])
    lines.extend(md_table(
        ["Common Conflict", "Solution"],
        [
            ["Two developers create same migration version", "Use timestamp versioning"],
            ["Two developers create same table", "Use table ownership matrix"],
            ["One developer changes shared table", "Require architect approval"],
            ["Column name mismatch", "Use naming convention"],
            ["Missing tenant filters", "PR checklist and repository review"],
            ["Broken foreign key", "Integration testing"],
            ["Heavy reporting query", "Use denormalized summary table"],
            ["Migration works locally but fails in dev", "Always test on clean DB"],
        ],
    ))

    lines.extend([
        "",
        "## 14. Local Development Database Strategy",
        "",
        "![Local to Shared Dev](assets/db-workflow/06_local_to_shared_dev_db.png)",
        "",
        "- Recommended: local DB per developer.",
        "- Shared dev DB should be used only after PR merge.",
        "- CI/CD should apply migrations to shared dev DB.",
        "- QA should test on shared dev DB.",
        "",
        "## 15. Seed Data Strategy",
        "",
        "- Master seed data should be separate from schema migration.",
        "- Do not insert random test data in schema migration.",
        "- Use repeatable migrations for master/reference data.",
        "",
        "```text",
        "R__seed_global_master_data.sql",
        "R__seed_fhir_code_systems.sql",
        "R__seed_default_roles_permissions.sql",
        "```",
        "",
        "Seed data examples: gender_master, blood_group_master, appointment_status_master, encounter_type_master, fhir_resource_type_master, hl7_message_type_master, default_roles, default_permissions.",
        "",
        "## 16. Tenant Isolation Rules",
        "",
        "![Tenant Isolation](assets/db-workflow/05_tenant_isolation_query_rules.png)",
        "",
        "- All patient, clinical, billing, pharmacy and lab records must have tenant_id, hospital_id and branch_id.",
        "- branch_id is mandatory for branch-level operations.",
        "- Patient can be hospital-level.",
        "- Encounter must be branch-level.",
        "- Billing must be branch-level.",
        "- Lab order must be branch-level.",
        "- Pharmacy stock must be branch-level.",
        "- No query should fetch data without tenant filters.",
        "",
        "```sql",
        "SELECT *",
        "FROM patients",
        "WHERE tenant_id = :tenantId",
        "  AND hospital_id = :hospitalId",
        "  AND is_deleted = 0;",
        "",
        "SELECT *",
        "FROM appointments",
        "WHERE tenant_id = :tenantId",
        "  AND hospital_id = :hospitalId",
        "  AND branch_id IN (:allowedBranchIds)",
        "  AND is_deleted = 0;",
        "```",
        "",
        "## 17. FHIR and HL7 Responsibility Distribution",
        "",
    ])
    lines.extend(md_table(
        ["FHIR/HL7 Team Owns", "Module Developers Must Provide"],
        [
            ["fhir_resource_mapping", "Internal table name"],
            ["fhir_resource_store", "Internal record ID"],
            ["fhir_api_audit_log", "Business identifier"],
            ["hl7_message_log", "FHIR resource mapping requirement"],
            ["hl7_mapping", "Event triggers"],
            ["external_identifier_mapping", "External identifier rules"],
        ],
    ))
    lines.extend(md_table(
        ["Module", "FHIR/HL7 Mapping Responsibility"],
        [
            ["Patient", "patients -> Patient, patient_allergies -> AllergyIntolerance, patient_documents -> DocumentReference"],
            ["Lab", "lab_orders -> ServiceRequest, lab_results -> Observation, diagnostic_reports -> DiagnosticReport"],
            ["Pharmacy", "prescriptions -> MedicationRequest, medicines -> Medication, pharmacy_dispense -> MedicationDispense"],
            ["Billing", "billing_invoices -> Account, invoice items -> ChargeItem, claims -> Claim"],
        ],
    ))

    lines.extend([
        "",
        "## 18. Inter-Module Dependency Flow",
        "",
        "![Dependency Flow](assets/db-workflow/03_inter_module_dependency_flow.png)",
        "",
        "```mermaid",
        dependency_mermaid,
        "```",
        "",
        "## 19. Developer Daily Workflow",
        "",
    ])
    lines.extend(md_table(
        ["Time", "Actions"],
        [
            ["Morning", "Pull latest dev; run migrations locally; check migration conflicts; confirm assigned module tables"],
            ["During development", "Create feature branch; add migration file; run app locally; test API; add indexes; add tenant filters; add audit events"],
            ["Before PR", "Run clean DB migration; run module APIs; verify tenant isolation; verify branch isolation; update document if new table added; add PR checklist"],
            ["After merge", "Pull dev; run migration; resolve conflicts early; notify team if shared table changed"],
        ],
    ))

    lines.extend([
        "",
        "## 20. Integration Testing Workflow",
        "",
    ])
    lines.extend(md_table(
        ["Test Type", "Scenario"],
        [
            ["Clean database migration test", "All migrations run from empty database"],
            ["Module API test", "Postman collection passes for module endpoints"],
            ["Multi-tenant test", "Hospital A cannot see Hospital B patient"],
            ["Multi-branch test", "Branch A receptionist cannot see Branch B appointment"],
            ["Role test", "Hospital admin can see all branches; tenant admin can see all hospitals under tenant"],
            ["Encounter test", "Patient visit creates encounter correctly"],
            ["FHIR mapping test", "Lab result maps to Observation; Prescription maps to MedicationRequest"],
            ["HL7 message test", "Inbound message is logged, parsed and mapped"],
            ["Reporting summary test", "Summary table refresh works after transaction changes"],
            ["Performance check", "Large table query uses correct composite index"],
        ],
    ))

    lines.extend([
        "",
        "## 21. Database Documentation Process",
        "",
        "Every module developer must update:",
        "",
        "- Table list",
        "- Column description",
        "- FHIR mapping",
        "- API mapping",
        "- Index list",
        "- Dependency list",
        "",
        "Suggested documentation files:",
        "",
        "```text",
        "docs/database/schema-overview.md",
        "docs/database/module-table-ownership.md",
        "docs/database/fhir-mapping.md",
        "docs/database/hl7-mapping.md",
        "docs/database/migration-history.md",
        "```",
        "",
        "## 22. Example Module Distribution Plan",
        "",
    ])
    lines.extend(md_table(
        ["Sprint", "Developer Assignments"],
        [
            ["Sprint 1", "Developer A: tenant, hospital, branch, department, users, roles and permissions. Developer B: patient/MPI, patient contacts, appointment slots and queues. Developer C: encounter base, OPD queue, doctor workbench skeleton, vitals and diagnosis base. Developer I: FHIR base mapping tables. Developer K: audit log and consent foundation."],
            ["Sprint 2", "Developer C: full clinical EMR, notes, problem list, allergy, care plan, clinical orders and prescription. Developer D: lab order, sample, result and radiology report tables. Developer E: medicine master, batch, pharmacy stock and dispensing. Developer F: billing invoice, payment, refund and insurance claim base. Developer G: IPD admission, ward, bed and nursing tasks."],
            ["Sprint 3", "Developer G: discharge summary, follow-up, medication administration and nursing handover. Developer H: emergency, triage, OT, surgery, ambulance and blood bank. Developer L: staff attendance, HRMS, inventory store, procurement, diet, housekeeping, maintenance, helpdesk and portals. Developer I: HL7 inbound/outbound logs and external identifier mapping. Developer J: reporting summary tables and patient journey command center."],
            ["Sprint 4", "Developer J: analytics, AI alerts and operational risk summaries. Developer K: notification templates, delivery logs, break-glass access logs and patient record access logs. All module owners: FHIR/HL7 mapping review, tenant isolation test, branch isolation test, clean DB migration test and final integration hardening."],
        ],
    ))

    lines.extend([
        "",
        "## 23. Definition of Done for Database Work",
        "",
        "- Migration file created",
        "- Migration runs on clean DB",
        "- Table follows naming convention",
        "- Tenant columns added",
        "- Audit columns added",
        "- Required indexes added",
        "- Repository queries have tenant filters",
        "- API tested",
        "- Postman collection updated",
        "- FHIR mapping documented if applicable",
        "- HL7 mapping documented if applicable",
        "- PR reviewed and merged",
        "",
        "## 24. Anti-Patterns to Avoid",
        "",
        "- Manual database changes",
        "- Editing old migration after merge",
        "- Creating table without tenant_id",
        "- Creating table without indexes",
        "- Using random status values",
        "- Using varchar for money",
        "- Storing amount in floating type",
        "- Duplicating patient data in every module",
        "- Directly using frontend branch_id without backend validation",
        "- Building dashboard from heavy transactional queries",
        "- Mixing FHIR JSON as main transactional table",
        "- Ignoring audit logs",
        "- Creating foreign keys without understanding module ownership",
        "",
        "## 25. Final Recommended Workflow Summary",
        "",
        "- Use local DB per developer.",
        "- Use Flyway timestamp migration.",
        "- Use module ownership matrix.",
        "- Use shared dev DB only after PR merge.",
        "- Never make manual DB changes.",
        "- Use tenant/hospital/branch isolation in all tables and queries.",
        "- Use normalized transactional tables.",
        "- Use denormalized reporting tables.",
        "- FHIR/HL7 handled by dedicated integration team.",
        "- Architect reviews shared tables and cross-module changes.",
        "- PR checklist mandatory.",
    ])

    return "\n".join(lines)


def main() -> None:
    DOCS.mkdir(parents=True, exist_ok=True)
    diagrams = make_diagrams()
    doc = build_doc(diagrams)
    doc.save(DOCX_PATH)
    MD_PATH.write_text(make_markdown(diagrams), encoding="utf-8")
    print(f"created: {DOCX_PATH}")
    print(f"created: {MD_PATH}")
    print(f"diagrams: {len(diagrams)}")


if __name__ == "__main__":
    main()
