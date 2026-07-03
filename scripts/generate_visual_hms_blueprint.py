from __future__ import annotations

from pathlib import Path
from textwrap import wrap

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
ASSET_DIR = DOCS_DIR / "assets" / "hms-blueprint-v2"
OUTPUT_DOCX = DOCS_DIR / "FHIR-HL7-Ready-Multi-Tenant-HMS-Database-Architecture-Blueprint-v2.0-Visual.docx"
LEGACY_DOCX = DOCS_DIR / "FHIR-HL7-Ready-Multi-Tenant-HMS-Database-Architecture-Blueprint-v1.0.docx"
OUTPUT_MD = DOCS_DIR / "fhir-hl7-multitenant-hms-architecture-blueprint-v2-visual.md"


COLORS = {
    "navy": "14325C",
    "blue": "2563EB",
    "sky": "EAF4FF",
    "green": "0F766E",
    "green_light": "E8F7F3",
    "amber": "B45309",
    "amber_light": "FFF7E6",
    "red": "B91C1C",
    "red_light": "FEECEC",
    "slate": "475569",
    "slate_light": "F5F7FB",
    "border": "CBD5E1",
    "white": "FFFFFF",
}


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.replace("#", "")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def pil_color(color: str | tuple[int, int, int]) -> str | tuple[int, int, int]:
    if isinstance(color, tuple):
        return color
    if len(color.replace("#", "")) == 6:
        return hex_to_rgb(color)
    return color


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    font_name = "arialbd.ttf" if bold else "arial.ttf"
    candidates = [
        Path("C:/Windows/Fonts") / font_name,
        Path("C:/Windows/Fonts/calibri.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def draw_wrapped_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    box: tuple[int, int, int, int],
    font: ImageFont.ImageFont,
    fill: str,
    align: str = "center",
    line_spacing: int = 8,
) -> None:
    x1, y1, x2, y2 = box
    words = text.split()
    lines: list[str] = []
    line = ""
    max_width = x2 - x1 - 24

    for word in words:
        trial = f"{line} {word}".strip()
        bbox = draw.textbbox((0, 0), trial, font=font)
        if bbox[2] - bbox[0] <= max_width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)

    line_heights = []
    for item in lines:
        bbox = draw.textbbox((0, 0), item, font=font)
        line_heights.append(bbox[3] - bbox[1])
    total_height = sum(line_heights) + max(0, len(lines) - 1) * line_spacing
    y = y1 + max(0, (y2 - y1 - total_height) // 2)

    for item, height in zip(lines, line_heights):
        bbox = draw.textbbox((0, 0), item, font=font)
        width = bbox[2] - bbox[0]
        if align == "left":
            x = x1 + 18
        else:
            x = x1 + (x2 - x1 - width) // 2
        draw.text((x, y), item, font=font, fill=pil_color(fill))
        y += height + line_spacing


def rounded_box(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    title: str,
    body: str = "",
    fill: str = "FFFFFF",
    outline: str = "CBD5E1",
    title_color: str = "14325C",
    body_color: str = "475569",
) -> None:
    draw.rounded_rectangle(xy, radius=22, fill=pil_color(fill), outline=pil_color(outline), width=3)
    x1, y1, x2, y2 = xy
    title_font = get_font(30, bold=True)
    body_font = get_font(23)
    draw_wrapped_text(draw, title, (x1 + 8, y1 + 18, x2 - 8, y1 + 88), title_font, title_color)
    if body:
        draw_wrapped_text(draw, body, (x1 + 10, y1 + 92, x2 - 10, y2 - 18), body_font, body_color)


def arrow(
    draw: ImageDraw.ImageDraw,
    start: tuple[int, int],
    end: tuple[int, int],
    color: str = "2563EB",
    width: int = 5,
) -> None:
    draw.line([start, end], fill=pil_color(color), width=width)
    sx, sy = start
    ex, ey = end
    if abs(ex - sx) >= abs(ey - sy):
        direction = 1 if ex >= sx else -1
        points = [(ex, ey), (ex - 18 * direction, ey - 11), (ex - 18 * direction, ey + 11)]
    else:
        direction = 1 if ey >= sy else -1
        points = [(ex, ey), (ex - 11, ey - 18 * direction), (ex + 11, ey - 18 * direction)]
    draw.polygon(points, fill=pil_color(color))


def diagram_base(title: str, subtitle: str = "") -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (1600, 900), hex_to_rgb("F8FAFC"))
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 1600, 116), fill=hex_to_rgb("14325C"))
    draw.text((48, 28), title, font=get_font(42, bold=True), fill=hex_to_rgb("FFFFFF"))
    if subtitle:
        draw.text((50, 80), subtitle, font=get_font(22), fill=hex_to_rgb("D8E8FF"))
    return img, draw


def save_diagram(img: Image.Image, name: str) -> Path:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    path = ASSET_DIR / name
    img.save(path, "PNG", quality=95)
    return path


def create_diagrams() -> dict[str, Path]:
    diagrams: dict[str, Path] = {}

    img, draw = diagram_base(
        "Overall SaaS Architecture",
        "One platform, many hospitals, secure data isolation, FHIR and HL7 ready integration.",
    )
    columns = [
        ((50, 170, 295, 710), "Users and Channels", "Web app\nMobile app\nPatient portal\nDoctor portal"),
        ((360, 170, 605, 710), "Access Layer", "API Gateway\nAuth Service\nJWT Filter\nRBAC"),
        ((670, 170, 980, 710), "Core Services", "Patient\nEncounter\nLab\nPharmacy\nBilling\nReporting"),
        ((1045, 170, 1290, 710), "Data Layer", "Shared DB\nTenant filters\nAudit logs\nSummary DB"),
        ((1355, 170, 1590, 710), "External Systems", "FHIR API\nHL7 Listener\nLIS / RIS\nInsurance"),
    ]
    for xy, title, body in columns:
        rounded_box(draw, xy, title, body, fill="FFFFFF")
    for x in [320, 630, 1005, 1320]:
        arrow(draw, (x, 440), (x + 38, 440))
    draw.text((52, 784), "Board message: default shared SaaS database; enterprise clients can move to dedicated schema/database without redesign.", font=get_font(28, bold=True), fill=hex_to_rgb("14325C"))
    diagrams["overall"] = save_diagram(img, "01_overall_saas_architecture.png")

    img, draw = diagram_base(
        "Tenant to Patient Data Hierarchy",
        "Every operational record should know tenant, hospital, branch and encounter context.",
    )
    levels = [
        ("Tenant / Hospital Group", 720, 165, "owns subscription and enterprise policy"),
        ("Hospital", 720, 275, "clinical and financial operating entity"),
        ("Branch / Facility", 720, 385, "location where care is delivered"),
        ("Department / Service", 720, 495, "OPD, IPD, ER, Lab, Pharmacy, Billing"),
        ("Patient and User Access", 720, 605, "patient records plus authorized staff users"),
        ("Encounter / Visit", 720, 715, "OPD, IPD, emergency, virtual, day-care"),
    ]
    for title, x, y, body in levels:
        rounded_box(draw, (x - 250, y, x + 250, y + 82), title, body, fill="FFFFFF")
    for (_, x, y, _), (_, x2, y2, _) in zip(levels, levels[1:]):
        arrow(draw, (x, y + 84), (x2, y2 - 8), color="0F766E")
    side_boxes = [
        ((80, 355, 350, 485), "Rooms / Beds", "IPD and ward allocation"),
        ((80, 530, 350, 660), "Users / Roles", "doctor, nurse, lab, billing"),
        ((1250, 355, 1530, 485), "FHIR Mapping", "Organization, Location, Patient, Encounter"),
        ((1250, 530, 1530, 660), "Reporting", "branch and hospital dashboards"),
    ]
    for xy, title, body in side_boxes:
        rounded_box(draw, xy, title, body, fill="EAF4FF")
    arrow(draw, (470, 430), (355, 430), color="64748B")
    arrow(draw, (970, 430), (1245, 430), color="64748B")
    diagrams["hierarchy"] = save_diagram(img, "02_tenant_hospital_branch_hierarchy.png")

    img, draw = diagram_base(
        "Data Isolation and Branch Security Model",
        "Frontend branch selector is only UI; backend token and database filters are mandatory.",
    )
    rounded_box(draw, (70, 180, 390, 380), "JWT Claims", "tenantId\nhospitalId\nallowedBranchIds\nrole\nactiveBranchId", fill="EAF4FF")
    rounded_box(draw, (510, 180, 830, 380), "Tenant Context", "API extracts token claims and applies query scope automatically.", fill="E8F7F3")
    rounded_box(draw, (950, 180, 1270, 380), "Database Query", "WHERE tenant_id = ?\nAND hospital_id = ?\nAND branch_id IN (?)", fill="FFF7E6")
    rounded_box(draw, (70, 545, 390, 740), "Allowed Result", "Only authorized branch rows are returned.", fill="E8F7F3")
    rounded_box(draw, (510, 545, 830, 740), "Blocked Result", "Other hospital or branch rows are never returned.", fill="FEECEC")
    rounded_box(draw, (950, 545, 1270, 740), "Audit Trail", "Who accessed what, when, from where, and why.", fill="F5F7FB")
    for x in [405, 845]:
        arrow(draw, (x, 280), (x + 90, 280))
    arrow(draw, (1110, 385), (1110, 535), color="0F766E")
    arrow(draw, (670, 385), (670, 535), color="B91C1C")
    arrow(draw, (390, 642), (500, 642), color="64748B")
    draw.text((80, 800), "Rule: never trust client-side branch selection. Enforce tenant, hospital and branch scope in every backend service.", font=get_font(30, bold=True), fill=hex_to_rgb("B91C1C"))
    diagrams["isolation"] = save_diagram(img, "03_data_isolation_security.png")

    img, draw = diagram_base(
        "FHIR and HL7 Integration Layer",
        "Internal HMS remains normalized; FHIR and HL7 are integration layers, not the only database model.",
    )
    rounded_box(draw, (50, 170, 345, 355), "External Legacy", "HL7 v2 ADT\nORM\nORU\nDFT\nMDM", fill="F5F7FB")
    rounded_box(draw, (50, 525, 345, 710), "Modern Partners", "FHIR REST\nABDM\nInsurance\nExternal EHR", fill="F5F7FB")
    rounded_box(draw, (470, 170, 770, 355), "HL7 Engine", "listener\nparser\nvalidator\nmessage log", fill="FFF7E6")
    rounded_box(draw, (470, 525, 770, 710), "FHIR Gateway", "resource builder\nvalidator\nprofile mapping\naudit", fill="EAF4FF")
    rounded_box(draw, (900, 330, 1230, 535), "Normalized HMS Tables", "patient\nencounter\norders\nresults\nbilling\npharmacy", fill="E8F7F3")
    rounded_box(draw, (1320, 330, 1570, 535), "FHIR Store", "FHIR JSON\nsync status\nmapping table\nAPI audit", fill="FFFFFF")
    arrow(draw, (350, 260), (465, 260), color="B45309")
    arrow(draw, (775, 260), (895, 390), color="B45309")
    arrow(draw, (350, 615), (465, 615), color="2563EB")
    arrow(draw, (775, 615), (895, 480), color="2563EB")
    arrow(draw, (1235, 430), (1315, 430), color="0F766E")
    arrow(draw, (1320, 500), (780, 650), color="64748B")
    diagrams["integration"] = save_diagram(img, "04_fhir_hl7_integration_layer.png")

    img, draw = diagram_base(
        "Patient Journey Command Center",
        "Encounter-centric view across front office, clinical, diagnostics, pharmacy, billing and follow-up.",
    )
    steps = [
        ("Registration", "MPI / MRN"),
        ("Appointment", "slot and queue"),
        ("Encounter", "OPD / IPD / ER"),
        ("Vitals", "observations"),
        ("Consultation", "notes and diagnosis"),
        ("Orders", "lab / radiology"),
        ("Results", "reports"),
        ("Prescription", "medication order"),
        ("Billing", "invoice and payment"),
        ("Discharge", "summary / follow-up"),
    ]
    x = 55
    y = 250
    for idx, (title, body) in enumerate(steps):
        rounded_box(draw, (x, y, x + 220, y + 130), title, body, fill="FFFFFF")
        if idx < len(steps) - 1:
            arrow(draw, (x + 222, y + 65), (x + 275, y + 65), color="2563EB")
        x += 150 if idx in [3, 4, 5] else 0
        x += 250
        if x > 1360:
            x = 200
            y = 555
    draw.text((70, 780), "Command center focus: show patient stage, blocker, next action, responsible department, TAT and risk level.", font=get_font(28, bold=True), fill=hex_to_rgb("14325C"))
    diagrams["journey"] = save_diagram(img, "05_patient_journey_command_center.png")

    img, draw = diagram_base(
        "Operational Workflows",
        "High-volume lab, pharmacy and billing workflows should be queue-based and status-driven.",
    )
    lanes = [
        ("Lab Order to Result", ["Order", "Sample", "Processing", "Result", "Doctor Review"]),
        ("Prescription to Dispense", ["Prescription", "Stock Check", "Batch Select", "Dispense", "Stock Movement"]),
        ("Billing to Payment", ["Charge Capture", "Invoice", "Payment", "Receipt", "Claim / Refund"]),
    ]
    lane_y = [175, 390, 605]
    lane_colors = ["EAF4FF", "E8F7F3", "FFF7E6"]
    for lane_idx, (lane_title, lane_steps) in enumerate(lanes):
        y = lane_y[lane_idx]
        draw.text((55, y + 50), lane_title, font=get_font(28, bold=True), fill=hex_to_rgb("14325C"))
        x = 390
        for idx, step in enumerate(lane_steps):
            rounded_box(draw, (x, y, x + 200, y + 120), step, "", fill=lane_colors[lane_idx])
            if idx < len(lane_steps) - 1:
                arrow(draw, (x + 205, y + 60), (x + 255, y + 60), color="64748B")
            x += 260
    diagrams["workflows"] = save_diagram(img, "06_lab_pharmacy_billing_workflows.png")

    img, draw = diagram_base(
        "Normalized Transaction Core to Reporting and AI",
        "Operational tables stay normalized; dashboards and AI use controlled summary layers.",
    )
    rounded_box(draw, (70, 250, 390, 520), "Normalized Core", "patients\nencounters\norders\nresults\ninvoices\npayments", fill="EAF4FF")
    rounded_box(draw, (510, 250, 830, 520), "Aggregation Jobs", "scheduled jobs\nevent processors\nmaterialized views", fill="FFF7E6")
    rounded_box(draw, (950, 160, 1270, 360), "Summary Tables", "daily visits\nbranch revenue\nbed occupancy\nlab volume", fill="E8F7F3")
    rounded_box(draw, (950, 470, 1270, 700), "Analytics and AI", "dashboards\ncommand center\nrisk scoring\nforecasting", fill="FFFFFF")
    rounded_box(draw, (1345, 300, 1570, 560), "Users", "leadership\nadmins\nclinicians\noperations", fill="F5F7FB")
    arrow(draw, (395, 385), (505, 385), color="2563EB")
    arrow(draw, (835, 350), (945, 260), color="0F766E")
    arrow(draw, (835, 450), (945, 580), color="0F766E")
    arrow(draw, (1275, 265), (1340, 385), color="64748B")
    arrow(draw, (1275, 585), (1340, 460), color="64748B")
    diagrams["reporting"] = save_diagram(img, "07_transaction_reporting_ai_flow.png")

    img, draw = diagram_base(
        "Enterprise Deployment Options",
        "Start with shared SaaS, then upgrade isolation for enterprise or government clients.",
    )
    rounded_box(draw, (80, 210, 460, 565), "Default SaaS", "Shared database\nShared tables\ntenant_id + hospital_id + branch_id\nlowest cost and fastest upgrades", fill="EAF4FF")
    rounded_box(draw, (580, 210, 960, 565), "Enterprise Schema", "Shared server\nseparate schema per hospital\nbetter backup and isolation\nmore migration overhead", fill="E8F7F3")
    rounded_box(draw, (1080, 210, 1480, 565), "Dedicated Deployment", "separate database or cluster\nmaximum isolation\nhigher cost\nbest for government chains", fill="FFF7E6")
    arrow(draw, (465, 385), (575, 385), color="2563EB")
    arrow(draw, (965, 385), (1075, 385), color="2563EB")
    draw.text((90, 725), "Decision rule: shared SaaS for most customers; dedicated schema/database only when contract, regulation or scale requires it.", font=get_font(30, bold=True), fill=hex_to_rgb("14325C"))
    diagrams["deployment"] = save_diagram(img, "08_enterprise_deployment_options.png")

    return diagrams


def set_cell_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_border(cell, color: str = "CBD5E1") -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right"):
        tag = f"w:{edge}"
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "4")
        element.set(qn("w:color"), color)


def set_paragraph_font(paragraph, size: int = 10, bold: bool = False, color: str = "334155") -> None:
    for run in paragraph.runs:
        run.font.name = "Aptos"
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = RGBColor(*hex_to_rgb(color))


def add_heading(doc: Document, text: str, level: int = 1) -> None:
    paragraph = doc.add_heading(text, level=level)
    for run in paragraph.runs:
        run.font.name = "Aptos Display"
        run.font.color.rgb = RGBColor(*hex_to_rgb("14325C" if level <= 2 else "2563EB"))
        run.font.bold = True


def add_body(doc: Document, text: str, bold: bool = False) -> None:
    paragraph = doc.add_paragraph()
    run = paragraph.add_run(text)
    run.font.name = "Aptos"
    run.font.size = Pt(10.5)
    run.font.bold = bold
    run.font.color.rgb = RGBColor(*hex_to_rgb("334155"))
    paragraph.paragraph_format.space_after = Pt(4)


def add_bullets(doc: Document, items: list[str], level: int = 0) -> None:
    style = "List Bullet" if level == 0 else "List Bullet 2"
    for item in items:
        paragraph = doc.add_paragraph(style=style)
        paragraph.paragraph_format.space_after = Pt(2)
        run = paragraph.add_run(item)
        run.font.name = "Aptos"
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(*hex_to_rgb("334155"))


def add_callout(doc: Document, title: str, items: list[str], fill: str = "EAF4FF", title_color: str = "14325C") -> None:
    table = doc.add_table(rows=1, cols=1)
    table.alignment = 1
    cell = table.cell(0, 0)
    set_cell_shading(cell, fill)
    set_cell_border(cell, "BBD4F8")
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    title_p = cell.paragraphs[0]
    title_run = title_p.add_run(title)
    title_run.font.name = "Aptos Display"
    title_run.font.size = Pt(12)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(*hex_to_rgb(title_color))
    for item in items:
        p = cell.add_paragraph(style="List Bullet")
        r = p.add_run(item)
        r.font.name = "Aptos"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(*hex_to_rgb("334155"))
    doc.add_paragraph()


def add_table(doc: Document, headers: list[str], rows: list[list[str]], widths: list[float] | None = None) -> None:
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.autofit = True
    for idx, header in enumerate(headers):
        cell = table.cell(0, idx)
        set_cell_shading(cell, "14325C")
        set_cell_border(cell)
        p = cell.paragraphs[0]
        run = p.add_run(header)
        run.font.name = "Aptos"
        run.font.size = Pt(8.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        if widths:
            cell.width = Inches(widths[idx])

    for row_idx, row in enumerate(rows):
        cells = table.add_row().cells
        for idx, value in enumerate(row):
            cell = cells[idx]
            set_cell_border(cell)
            if row_idx % 2 == 0:
                set_cell_shading(cell, "F8FAFC")
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(value)
            run.font.name = "Aptos"
            run.font.size = Pt(8.2)
            run.font.color.rgb = RGBColor(*hex_to_rgb("334155"))
            if widths:
                cell.width = Inches(widths[idx])
    doc.add_paragraph()


def add_picture(doc: Document, path: Path, caption: str) -> None:
    doc.add_picture(str(path), width=Inches(7.1))
    paragraph = doc.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run(caption)
    run.font.name = "Aptos"
    run.font.size = Pt(8.5)
    run.font.italic = True
    run.font.color.rgb = RGBColor(*hex_to_rgb("64748B"))


def add_code_block(doc: Document, code: str) -> None:
    table = doc.add_table(rows=1, cols=1)
    cell = table.cell(0, 0)
    set_cell_shading(cell, "0F172A")
    set_cell_border(cell, "1E293B")
    p = cell.paragraphs[0]
    for line in code.strip().splitlines():
        run = p.add_run(line + "\n")
        run.font.name = "Consolas"
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(*hex_to_rgb("E2E8F0"))
    doc.add_paragraph()


def setup_document() -> Document:
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.55)
    section.bottom_margin = Inches(0.55)
    section.left_margin = Inches(0.65)
    section.right_margin = Inches(0.65)

    styles = doc.styles
    styles["Normal"].font.name = "Aptos"
    styles["Normal"].font.size = Pt(10.5)
    for name in ["Heading 1", "Heading 2", "Heading 3"]:
        styles[name].font.name = "Aptos Display"
        styles[name].font.bold = True
        styles[name].font.color.rgb = RGBColor(*hex_to_rgb("14325C"))

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer.add_run("Plasmit Global HMS | FHIR and HL7 Ready Database Architecture Blueprint | Confidential")
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor(*hex_to_rgb("64748B"))
    return doc


def add_cover(doc: Document, diagrams: dict[str, Path]) -> None:
    table = doc.add_table(rows=1, cols=1)
    cell = table.cell(0, 0)
    set_cell_shading(cell, "14325C")
    set_cell_border(cell, "14325C")
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Plasmit Global Hospital Management System")
    run.font.name = "Aptos Display"
    run.font.size = Pt(20)
    run.font.bold = True
    run.font.color.rgb = RGBColor(255, 255, 255)
    p2 = cell.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p2.add_run("FHIR & HL7 Ready Multi-Tenant HMS Database Architecture and Module Blueprint")
    run.font.name = "Aptos Display"
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = RGBColor(*hex_to_rgb("D8E8FF"))

    doc.add_paragraph()
    add_picture(doc, diagrams["overall"], "Visual summary of the recommended SaaS architecture.")

    info_rows = [
        ["Document Version", "2.0 Visual Blueprint"],
        ["Prepared For", "Product, Engineering, Architecture, Compliance and Leadership Teams"],
        ["Prepared By", "Plasmit Engineering Team"],
        ["Document Style", "Board-level summary plus technical implementation blueprint"],
        ["Recommended Model", "Hybrid multi-tenant SaaS: shared tables by default, optional dedicated schema/database for enterprise clients"],
    ]
    add_table(doc, ["Item", "Detail"], info_rows, widths=[1.8, 5.3])
    doc.add_page_break()


def add_toc(doc: Document) -> None:
    add_heading(doc, "Table of Contents", 1)
    items = [
        "1. Executive Summary",
        "2. One-Page Architecture Decision",
        "3. Key Design Goals",
        "4. Multi-Tenant Hospital Scenarios",
        "5. Recommended Data Hierarchy",
        "6. Data Isolation and Security Model",
        "7. FHIR and HL7 Integration Strategy",
        "8. Database Design Strategy",
        "9. Core Foundation Tables",
        "10. Complete Hospital Module Blueprint",
        "11. Module to FHIR Mapping",
        "12. Branch-Level Access Matrix",
        "13. API and Microservices Alignment",
        "14. Reporting, Analytics and AI Readiness",
        "15. Backup, Disaster Recovery and Enterprise Deployment",
        "16. Implementation Roadmap",
        "17. Final Recommendations",
        "18. Appendix",
    ]
    add_bullets(doc, items)
    doc.add_page_break()


def build_document(diagrams: dict[str, Path]) -> Document:
    doc = setup_document()
    add_cover(doc, diagrams)
    add_toc(doc)

    add_heading(doc, "1. Executive Summary", 1)
    add_callout(
        doc,
        "Board-level conclusion",
        [
            "Use a hybrid multi-tenant database architecture.",
            "Default SaaS customers should use shared database and shared tables.",
            "Every transaction row must contain tenant_id, hospital_id and branch_id.",
            "Large enterprise or government customers can receive dedicated schema or database.",
            "FHIR and HL7 should be integration layers on top of the normalized HMS database.",
        ],
        fill="EAF4FF",
    )
    add_bullets(
        doc,
        [
            "Healthcare SaaS must protect patient, billing and clinical data across many unrelated hospitals.",
            "Branch-level control is mandatory because the same hospital can operate multiple branches, wards, labs and pharmacies.",
            "The internal database should remain normalized for operational correctness.",
            "Reporting, dashboards and AI should use denormalized summary tables, not heavy live transactional queries.",
            "HL7 v2 is required for legacy HIS, LIS, RIS, analyzers and equipment integrations.",
            "FHIR is required for modern REST/JSON interoperability with external EHR, insurance, national health networks and partner systems.",
        ],
    )

    add_heading(doc, "2. One-Page Architecture Decision", 1)
    add_picture(doc, diagrams["overall"], "The platform architecture in one visual.")
    add_table(
        doc,
        ["Decision Area", "Recommended Choice", "Why It Matters"],
        [
            ["Default SaaS database", "Shared database + shared tables", "Lowest cost, fastest rollout, easier upgrades and centralized reporting."],
            ["Isolation columns", "tenant_id, hospital_id, branch_id", "Prevents hospital and branch data mixing when enforced by backend queries."],
            ["Enterprise option", "Dedicated schema/database", "Supports compliance-heavy, large hospital chain and government deployments."],
            ["Clinical model", "Encounter-centric", "OPD, IPD, ER, virtual and day-care workflows connect through Encounter."],
            ["FHIR strategy", "Mapping/API layer", "Expose interoperable resources without copying FHIR blindly as all database tables."],
            ["HL7 strategy", "Integration engine flow", "Listener, parser, validator, message log, normalized table mapping and outbound events."],
            ["Reporting", "Summary tables and jobs", "Dashboards remain fast and do not overload transactional tables."],
        ],
    )

    add_heading(doc, "3. Key Design Goals", 1)
    add_table(
        doc,
        ["Goal", "Point-wise Requirement"],
        [
            ["Global scalability", "Support clinics, single hospitals, hospital groups, enterprise chains and government deployments."],
            ["Multi-tenant SaaS readiness", "One SaaS platform can host many unrelated hospitals safely."],
            ["Hospital-wise isolation", "One hospital must never see another hospital's operational, clinical or financial data."],
            ["Branch-wise isolation", "Users must see only authorized branch data unless explicit cross-branch permission exists."],
            ["FHIR readiness", "Expose Patient, Encounter, Observation, ServiceRequest, DiagnosticReport, MedicationRequest and billing resources."],
            ["HL7 readiness", "Support ADT, ORM, ORU, SIU, DFT and MDM flows for legacy systems and equipment."],
            ["Auditability", "Every clinical, financial, integration and access action should be traceable."],
            ["AI readiness", "Create trusted summary layers for command center, predictions and operational insights."],
        ],
    )

    add_heading(doc, "4. Multi-Tenant Hospital Scenarios", 1)
    add_table(
        doc,
        ["Scenario", "Example", "Recommended Database Approach", "When to Use"],
        [
            ["Single hospital, single branch", "Small hospital", "Shared tables with one hospital_id and one branch_id", "Default SaaS onboarding."],
            ["Single hospital, multiple branches", "City hospital with 3 locations", "Shared tables with branch_id filters", "Most practical branch model."],
            ["Hospital group, multiple hospitals", "Group owns multiple hospitals", "Shared tables under one tenant_id and multiple hospital_id values", "Group-level dashboards and governance."],
            ["Many unrelated SaaS hospitals", "Cloud platform serving many clients", "Shared database and shared tables", "Default product scale model."],
            ["Enterprise separate schema", "Large private hospital", "Shared server, separate schema per hospital", "Contract requires stronger logical isolation."],
            ["Enterprise separate database", "Government hospital chain", "Dedicated database or cluster", "Maximum isolation, legal or national deployment needs."],
            ["Patient visits multiple branches", "Same patient visits two branches", "Patient hospital-level, encounters branch-level", "Clinical continuity within same hospital."],
            ["Platform super admin", "Support and subscription team", "Access SaaS metadata only by default", "No clinical access unless audited break-glass approval exists."],
        ],
    )
    add_callout(
        doc,
        "Important design rule",
        [
            "Patient identity can be hospital-level or tenant-level depending on business policy.",
            "Encounter, orders, invoices, pharmacy stock and lab work are always branch-level operational records.",
            "Cross-branch visibility must be permission-driven, not UI-driven.",
        ],
        fill="FFF7E6",
        title_color="B45309",
    )

    add_heading(doc, "5. Recommended Data Hierarchy", 1)
    add_picture(doc, diagrams["hierarchy"], "Recommended tenant to encounter hierarchy.")
    add_bullets(
        doc,
        [
            "Tenant represents a hospital group, SaaS customer or enterprise organization.",
            "Hospital represents the legal and operational healthcare institution.",
            "Branch or facility represents the physical care location.",
            "Department represents services such as OPD, IPD, ER, Lab, Radiology, Pharmacy and Billing.",
            "Patient is the person receiving care.",
            "Encounter is the care event that connects clinical, diagnostic, medication, billing and discharge workflows.",
        ],
    )

    add_heading(doc, "6. Data Isolation and Security Model", 1)
    add_picture(doc, diagrams["isolation"], "Mandatory backend-enforced tenant, hospital and branch isolation.")
    add_heading(doc, "JWT Claims Example", 2)
    add_code_block(
        doc,
        """
{
  "userId": 101,
  "tenantId": 1,
  "hospitalId": 10,
  "allowedBranchIds": [100, 101],
  "activeBranchId": 100,
  "role": "HOSPITAL_ADMIN"
}
""",
    )
    add_heading(doc, "Mandatory Query Pattern", 2)
    add_code_block(
        doc,
        """
WHERE tenant_id = :tenantId
  AND hospital_id = :hospitalId
  AND branch_id IN (:allowedBranchIds)
  AND is_deleted = 0
""",
    )
    add_bullets(
        doc,
        [
            "Frontend branch selector must not be trusted for security.",
            "Backend JWT filter should create TenantContext and BranchContext.",
            "Every service method and SQL query should apply the context.",
            "Clinical data access should be audited separately from operational metadata access.",
            "Emergency break-glass access must be time-bound, reason-based and heavily audited.",
        ],
    )

    add_heading(doc, "7. FHIR and HL7 Integration Strategy", 1)
    add_picture(doc, diagrams["integration"], "Integration layer keeps HL7 and FHIR separate from the internal operational model.")
    add_table(
        doc,
        ["Integration", "Best Use", "Key Flow", "Database Support"],
        [
            ["HL7 v2", "Legacy HIS, LIS, RIS, analyzers, machines", "Listener -> parser -> validator -> message log -> internal tables", "hl7_message_log, hl7_message_segments, integration_error_log"],
            ["FHIR", "Modern REST/JSON APIs, external EHR, insurance, national health networks", "Internal tables -> mapper -> resource builder -> validator -> FHIR API", "fhir_resource_mapping, fhir_resource_store, fhir_api_audit_log"],
            ["Internal HMS", "Daily hospital operations", "Normalized transaction tables", "patients, encounters, orders, results, invoices, payments"],
        ],
    )
    add_heading(doc, "Core FHIR Resource Mapping", 2)
    add_table(
        doc,
        ["HMS Concept", "Internal Table", "FHIR Resource", "Purpose"],
        [
            ["Tenant or hospital", "tenants, hospitals", "Organization", "Represent healthcare organization."],
            ["Branch or facility", "branches", "Location", "Represent branch, facility, ward, room or bed."],
            ["Doctor or clinician", "users, doctors", "Practitioner", "Represent clinical professional."],
            ["Doctor branch role", "practitioner_roles", "PractitionerRole", "Represent role in a branch or department."],
            ["Patient", "patients", "Patient", "Person receiving care."],
            ["Appointment", "appointments", "Appointment", "Scheduling and visit planning."],
            ["Visit or admission", "encounters", "Encounter", "OPD, IPD, ER, virtual or day-care care event."],
            ["Vitals or lab value", "vitals, lab_results", "Observation", "Measurements, vital signs, lab values and clinical observations."],
            ["Lab or radiology order", "lab_orders, radiology_orders", "ServiceRequest", "Diagnostic and procedure order request."],
            ["Diagnostic report", "diagnostic_reports", "DiagnosticReport", "Structured result/report output."],
            ["Prescription", "prescriptions", "MedicationRequest", "Medication order or prescription."],
            ["Medicine master", "medicines", "Medication", "Medication catalog and reference."],
            ["Document", "documents", "DocumentReference", "Reports, notes, scans, PDFs and uploaded files."],
            ["Billing charge", "billing_invoice_items", "ChargeItem", "Clinical or billing charge item."],
            ["Insurance claim", "insurance_claims", "Claim", "Insurance claim submission."],
            ["Audit", "audit_logs", "AuditEvent", "Trace data access and changes."],
        ],
    )

    add_heading(doc, "8. Database Design Strategy", 1)
    add_picture(doc, diagrams["reporting"], "Normalized operational database feeds denormalized dashboards and AI summaries.")
    add_table(
        doc,
        ["Layer", "Use For", "Examples", "Design Notes"],
        [
            ["Normalized transaction core", "Real-time operations", "patients, encounters, prescriptions, lab_orders, invoices", "Strong foreign keys, clean updates, less duplication, better FHIR mapping."],
            ["Denormalized reporting layer", "Dashboards and command center", "daily_branch_revenue_summary, bed_occupancy_summary", "Updated by scheduled jobs or events; do not overload core tables."],
            ["FHIR resource store", "External interoperability", "fhir_resource_store, fhir_sync_status", "Store generated/received FHIR payloads and mapping references."],
            ["Audit and integration logs", "Compliance and traceability", "audit_logs, fhir_api_audit_log, hl7_message_log", "Never delete important compliance logs without retention policy."],
        ],
    )
    add_heading(doc, "Normalized Transaction Examples", 2)
    add_bullets(
        doc,
        [
            "patients, patient_identifiers, patient_addresses",
            "encounters, encounter_diagnoses, vitals, clinical_notes",
            "prescriptions, prescription_items, medication_administration",
            "lab_orders, lab_order_items, specimens, lab_results",
            "billing_invoices, billing_invoice_items, payments, refunds",
            "medicine_batches, pharmacy_stock, pharmacy_sales, stock_movements",
        ],
    )
    add_heading(doc, "Denormalized Summary Examples", 2)
    add_bullets(
        doc,
        [
            "daily_branch_revenue_summary",
            "daily_patient_visit_summary",
            "department_wise_collection_summary",
            "doctor_performance_summary",
            "pharmacy_stock_snapshot",
            "lab_test_volume_summary",
            "bed_occupancy_summary",
            "patient_journey_summary",
        ],
    )

    add_heading(doc, "9. Core Foundation Tables", 1)
    add_table(
        doc,
        ["Domain", "Main Tables", "Isolation Columns", "FHIR Mapping"],
        [
            ["SaaS and organization", "tenants, hospitals, branches, departments, healthcare_services", "tenant_id, hospital_id, branch_id where applicable", "Organization, Location, HealthcareService"],
            ["Users and access", "users, roles, permissions, user_branch_access, audit_logs", "tenant_id, hospital_id, branch_id", "Practitioner, PractitionerRole, AuditEvent"],
            ["Patient and visit", "patients, patient_identifiers, patient_addresses, appointments, encounters", "tenant_id, hospital_id, branch_id on operational rows", "Patient, Appointment, Encounter"],
            ["Clinical core", "vitals, diagnoses, clinical_notes, allergies, care_plans, procedures", "tenant_id, hospital_id, branch_id, encounter_id", "Observation, Condition, AllergyIntolerance, CarePlan, Procedure"],
            ["Diagnostics", "lab_orders, lab_order_items, lab_results, radiology_orders, radiology_reports", "tenant_id, hospital_id, branch_id", "ServiceRequest, Observation, DiagnosticReport"],
            ["Pharmacy", "medicines, medicine_batches, pharmacy_stock, prescriptions, prescription_items, pharmacy_sales", "tenant_id, hospital_id, branch_id", "Medication, MedicationRequest, MedicationDispense"],
            ["Billing and insurance", "billing_invoices, billing_invoice_items, payments, refunds, insurance_claims", "tenant_id, hospital_id, branch_id", "Account, ChargeItem, Claim, ExplanationOfBenefit"],
            ["Documents and integration", "documents, fhir_resource_store, fhir_resource_mapping, hl7_message_log", "tenant_id, hospital_id, branch_id", "DocumentReference, AuditEvent"],
        ],
    )

    add_heading(doc, "10. Complete Hospital Module Blueprint", 1)
    module_rows = [
        ["Super Admin / SaaS Admin", "Subscription, tenant onboarding, product settings", "Platform owner", "tenants, subscriptions, plans", "Organization", "No clinical access by default."],
        ["Tenant / Hospital Group Admin", "Group settings and cross-hospital governance", "Group admin", "tenants, hospitals, users", "Organization", "Can see hospitals under tenant only."],
        ["Hospital Setup", "Hospital profile, services, compliance setup", "Hospital admin", "hospitals, healthcare_services", "Organization, HealthcareService", "Hospital-level master setup."],
        ["Branch Management", "Branch profile, locations, counters, units", "Hospital admin, branch admin", "branches, locations", "Location", "Branch data isolation starts here."],
        ["User, Role, Permission", "RBAC and branch access", "Admin, compliance", "users, roles, permissions, user_branch_access", "PractitionerRole", "Least privilege by role and branch."],
        ["Patient Registration / MPI", "MRN, demographics, identifiers", "Reception", "patients, patient_identifiers", "Patient", "Patient can be hospital or tenant-level by policy."],
        ["Appointment Scheduling", "Slots, queues, reminders", "Reception, doctor", "appointments, queues", "Appointment", "Branch and department specific."],
        ["OPD / IPD / Emergency", "Visit, admission and ER tracking", "Doctor, nurse, front office", "encounters, admissions", "Encounter", "Encounter is branch-level."],
        ["Nursing and Vitals", "Vitals, nursing notes, medication administration", "Nurse", "vitals, nursing_notes", "Observation", "Clinical access must be audited."],
        ["Doctor Workbench / EMR", "Consultation, notes, diagnosis, orders", "Doctor", "clinical_notes, diagnoses, orders", "Condition, ServiceRequest", "Assigned patient/encounter access."],
        ["Prescription", "Medication order and dosage", "Doctor, pharmacist", "prescriptions, prescription_items", "MedicationRequest", "Must link to encounter."],
        ["Pharmacy Inventory", "Stock, batch, expiry, low stock", "Pharmacist", "medicine_batches, pharmacy_stock", "Medication", "Branch pharmacy stock only."],
        ["Pharmacy Sales / Dispensing", "Issue medicines and stock movement", "Pharmacist, billing", "pharmacy_sales, stock_movements", "MedicationDispense", "Prescription-linked dispensing preferred."],
        ["Lab / Diagnostics", "Orders, sample, results, critical alerts", "Lab technician, doctor", "lab_orders, lab_results", "ServiceRequest, Observation", "Queue-based high-volume workflow."],
        ["Radiology / Imaging", "Imaging orders and reports", "Radiologist, technician", "radiology_orders, radiology_reports", "ServiceRequest, DiagnosticReport", "Report and image reference storage."],
        ["OT / Surgery", "Surgery schedule, procedure record", "Surgeon, OT staff", "surgery_cases, procedures", "Procedure", "Consent and audit required."],
        ["Ward / Room / Bed", "Bed occupancy and transfers", "Nurse, admin", "wards, rooms, beds, bed_allocations", "Location, Encounter", "Branch facility scope."],
        ["Billing and Payments", "Invoices, payments, refunds", "Billing user", "billing_invoices, payments, refunds", "Account, ChargeItem", "Financial access by role."],
        ["Insurance and Claims", "TPA, claim submission, claim status", "Billing, insurance desk", "insurance_claims, claim_items", "Claim, ExplanationOfBenefit", "PHI and financial controls."],
        ["Discharge Summary", "Final summary, checklist, follow-up", "Doctor, nurse, billing", "discharge_summaries, documents", "DocumentReference", "Requires clinical and billing clearance."],
        ["Documents and Reports", "Upload and retrieve PDFs/scans", "All clinical teams", "documents, document_versions", "DocumentReference", "Versioning and access logs."],
        ["Patient Portal", "Appointments, reports, bills", "Patient", "portal_users, documents", "Patient, DocumentReference", "Consent and identity verification."],
        ["Audit and Compliance", "Access logs, change logs, break-glass", "Auditor", "audit_logs, access_logs", "AuditEvent", "Immutable or retention-safe logs."],
        ["HL7 Integration", "Legacy inbound/outbound messages", "Integration team", "hl7_message_log", "N/A", "Full message traceability."],
        ["FHIR API Layer", "FHIR REST API and mapping", "Integration team", "fhir_resource_store", "FHIR resources", "Profile validation and API audit."],
        ["Analytics and AI Command Center", "Dashboards, alerts, predictions", "Leadership, operations", "summary tables", "N/A", "Use de-identified or scoped data."],
    ]
    add_table(
        doc,
        ["Module", "Purpose", "Key Users", "Main Tables", "FHIR", "Security / Branch Behavior"],
        module_rows,
    )

    add_heading(doc, "11. Module to FHIR Mapping", 1)
    add_table(
        doc,
        ["HMS Module", "Main Internal Tables", "Primary FHIR Resources", "Integration Purpose"],
        [
            ["Appointment", "appointments", "Appointment", "Expose schedules and booking status."],
            ["OPD / IPD / Emergency", "encounters, admissions", "Encounter", "Represent every visit or admission."],
            ["Vitals", "vitals", "Observation", "Expose vital signs and measurements."],
            ["Diagnosis", "diagnoses", "Condition", "Expose diagnosis/problem list."],
            ["Lab", "lab_orders, lab_results", "ServiceRequest, Observation, DiagnosticReport", "Order diagnostics and publish results."],
            ["Radiology", "radiology_orders, radiology_reports", "ServiceRequest, DiagnosticReport, DocumentReference", "Order imaging and publish reports."],
            ["Prescription", "prescriptions, prescription_items", "MedicationRequest", "Expose medication orders."],
            ["Pharmacy", "medicines, pharmacy_sales", "Medication, MedicationDispense", "Medicine catalog and dispensing."],
            ["Billing", "billing_invoices, payments, claims", "Account, ChargeItem, Claim, ExplanationOfBenefit", "Billing and payer integration."],
            ["Documents", "documents", "DocumentReference", "Reports, PDFs, scans and clinical notes."],
            ["Audit", "audit_logs", "AuditEvent", "System and clinical audit trail."],
        ],
    )

    add_heading(doc, "12. Patient Journey Command Center", 1)
    add_picture(doc, diagrams["journey"], "Point-wise patient journey from registration to follow-up.")
    add_bullets(
        doc,
        [
            "The command center should show current stage, waiting time, blocker, next action and responsible department.",
            "Every stage should connect to encounter_id and branch_id.",
            "Lab, radiology, pharmacy and billing should use queue and status models for high volume.",
            "Alerts should highlight discharge blockers, critical lab values, payment delays and pending doctor review.",
        ],
    )
    add_picture(doc, diagrams["workflows"], "Queue-based operational flows for lab, pharmacy and billing.")

    add_heading(doc, "13. Branch-Level Access Matrix", 1)
    add_table(
        doc,
        ["Role", "Tenant Data", "Hospital Data", "Branch Data", "Clinical Data", "Billing Data", "Reports", "Settings"],
        [
            ["Platform Super Admin", "Subscription/support", "Limited metadata", "No by default", "No by default", "No by default", "Platform reports", "Platform settings"],
            ["Tenant Admin", "All tenant", "All hospitals under tenant", "All authorized", "Policy controlled", "Policy controlled", "Tenant reports", "Tenant settings"],
            ["Hospital Admin", "Own tenant only", "Own hospital", "All hospital branches", "Admin-level allowed", "Allowed", "Hospital reports", "Hospital settings"],
            ["Branch Admin", "No", "Own hospital metadata", "Own branch", "Operational view", "Branch financial", "Branch reports", "Branch settings"],
            ["Doctor", "No", "No", "Assigned branches", "Assigned patients/encounters", "Limited or no", "Clinical reports", "No"],
            ["Nurse", "No", "No", "Assigned branch/ward", "Assigned ward patients", "No", "Nursing reports", "No"],
            ["Receptionist", "No", "No", "Own branch", "Limited demographics", "Limited", "Queue reports", "No"],
            ["Lab Technician", "No", "No", "Own branch lab", "Order/result scope", "No", "Lab reports", "No"],
            ["Pharmacist", "No", "No", "Own branch pharmacy", "Prescription view", "Sales scope", "Stock reports", "No"],
            ["Billing User", "No", "No", "Own branch billing", "Minimal clinical context", "Allowed", "Collection reports", "No"],
        ],
    )

    add_heading(doc, "14. API and Microservices Alignment", 1)
    add_bullets(
        doc,
        [
            "Backend services should use Spring Boot microservices or modular services with a shared TenantContext pattern.",
            "Each service must validate JWT, role permissions and branch permissions before running database queries.",
            "Critical workflows must use transactions: billing, pharmacy stock movement, lab order, discharge, insurance claim and refunds.",
            "NamedParameterJdbcTemplate/JDBC can be used if the backend follows a no-JPA approach.",
            "Every service should emit structured logs and audit events for sensitive operations.",
        ],
    )
    add_table(
        doc,
        ["Service", "Primary Responsibility", "High-Risk Operations"],
        [
            ["Auth Service", "Login, JWT, roles, permissions", "Token generation, branch claims."],
            ["Hospital Service", "Tenant, hospital, branch setup", "Branch activation/deactivation."],
            ["Patient Service", "Patient registration and identifiers", "Duplicate patient merge."],
            ["Encounter Service", "OPD, IPD, ER visit lifecycle", "Admission, transfer, discharge."],
            ["Lab Service", "Lab order, sample, result", "Critical result reporting."],
            ["Pharmacy Service", "Prescription, stock, dispensing", "Batch stock deduction."],
            ["Billing Service", "Invoices, payments, refunds", "Payment posting and refund reversal."],
            ["FHIR Gateway Service", "FHIR mapping and API", "External PHI exchange."],
            ["HL7 Integration Service", "HL7 listener/parser/message log", "Inbound/outbound message replay."],
            ["Reporting Service", "Summary tables and dashboards", "Large report generation."],
            ["Audit Service", "Audit log and access log", "Break-glass and sensitive access tracking."],
        ],
    )

    add_heading(doc, "15. Reporting, Analytics and AI Readiness", 1)
    add_bullets(
        doc,
        [
            "Do not run heavy dashboards directly from normalized transaction tables.",
            "Use scheduled aggregation jobs, event-based aggregation or materialized views where supported.",
            "Create branch-wise, hospital-wise and tenant-wise summary tables.",
            "For AI, use scoped, audited, optionally de-identified datasets.",
            "Command center should focus on operational action, not only charts.",
        ],
    )
    add_table(
        doc,
        ["Dashboard", "Summary Table Example", "Business Question"],
        [
            ["Daily OPD", "daily_patient_visit_summary", "How many patients visited each branch and department today?"],
            ["IPD occupancy", "bed_occupancy_summary", "Which branches have bed pressure?"],
            ["Revenue", "daily_branch_revenue_summary", "Which branch and department generated revenue?"],
            ["Lab volume", "lab_test_volume_summary", "Where are sample/result delays happening?"],
            ["Pharmacy", "pharmacy_stock_snapshot", "Which medicines are low stock or near expiry?"],
            ["Discharge TAT", "patient_journey_summary", "Where are discharge blockers occurring?"],
        ],
    )

    add_heading(doc, "16. Backup, Disaster Recovery and Enterprise Deployment", 1)
    add_picture(doc, diagrams["deployment"], "Deployment options from shared SaaS to dedicated enterprise database.")
    add_bullets(
        doc,
        [
            "Shared SaaS database should have full backups, point-in-time recovery and tested restore procedures.",
            "Hospital-wise logical backup should be supported for enterprise support and migration needs.",
            "Branch-wise restore is difficult in shared tables and should be handled carefully with audit review.",
            "FHIR and HL7 message logs should support replay for integration recovery.",
            "Audit logs should follow retention policy and should not be silently deleted.",
        ],
    )

    add_heading(doc, "17. Implementation Roadmap", 1)
    add_table(
        doc,
        ["Phase", "Name", "Scope", "Success Output"],
        [
            ["1", "Foundation", "Tenant, hospital, branch, users, roles, patients, appointments", "Secure multi-tenant base ready."],
            ["2", "Clinical Core", "Encounter, vitals, diagnosis, notes, prescription", "Doctor and nursing workflows operational."],
            ["3", "Revenue Cycle", "Billing, payments, refunds, insurance", "Financial workflow controlled and auditable."],
            ["4", "Diagnostics and Pharmacy", "Lab, radiology, medicine inventory, dispensing", "Order-to-result and prescription-to-dispense ready."],
            ["5", "FHIR and HL7 Layer", "FHIR mapper/API, HL7 listener/parser/logs", "Interoperability with external systems."],
            ["6", "Advanced Operations", "IPD, emergency, surgery, discharge, housekeeping, ambulance", "End-to-end hospital operations."],
            ["7", "Analytics and AI", "Summary tables, dashboards, patient journey command center", "Leadership and operations intelligence."],
        ],
    )

    add_heading(doc, "18. Final Recommendations", 1)
    add_callout(
        doc,
        "Architecture recommendations",
        [
            "Default architecture should be shared database and shared tables.",
            "Every transaction table must contain tenant_id, hospital_id and branch_id.",
            "Patient should generally be hospital-level; encounter should be branch-level.",
            "Use normalized tables for correctness and audit.",
            "Use denormalized summaries for dashboards and reports.",
            "FHIR should be an interoperability layer, not the only database structure.",
            "Maintain HL7 message logs for traceability and replay.",
            "Never trust frontend for tenant or branch isolation.",
            "Backend must enforce data access using JWT claims, TenantContext and BranchContext.",
            "Use dedicated schema/database only for enterprise, government or compliance-heavy contracts.",
        ],
        fill="E8F7F3",
        title_color="0F766E",
    )

    add_heading(doc, "19. Appendix", 1)
    add_heading(doc, "Database Naming Convention", 2)
    add_bullets(
        doc,
        [
            "Use snake_case table and column names.",
            "Use id as primary key and UUID/public identifier where external reference is required.",
            "Use tenant_id, hospital_id and branch_id consistently.",
            "Use created_at, created_by, updated_at, updated_by and is_deleted on operational tables.",
            "Use status fields with controlled values and lookup/reference tables where appropriate.",
        ],
    )
    add_heading(doc, "Indexing Examples", 2)
    add_code_block(
        doc,
        """
CREATE INDEX idx_patient_tenant_hospital
  ON patients (tenant_id, hospital_id, mrn);

CREATE INDEX idx_encounter_branch_date
  ON encounters (tenant_id, hospital_id, branch_id, start_time);

CREATE INDEX idx_invoice_branch_date
  ON billing_invoices (tenant_id, hospital_id, branch_id, invoice_date);

CREATE INDEX idx_lab_order_status
  ON lab_orders (tenant_id, hospital_id, branch_id, status, ordered_at);
""",
    )
    add_heading(doc, "FHIR Glossary", 2)
    add_table(
        doc,
        ["FHIR Resource", "Meaning in HMS"],
        [
            ["Patient", "Person receiving care."],
            ["Encounter", "Visit/admission/emergency/virtual care event."],
            ["Observation", "Vitals, lab values and clinical measurements."],
            ["ServiceRequest", "Lab, radiology, procedure or diagnostic order."],
            ["DiagnosticReport", "Diagnostic report output."],
            ["MedicationRequest", "Prescription or medication order."],
            ["MedicationDispense", "Medicine dispensing event."],
            ["DocumentReference", "PDF, scan, report, note or uploaded document."],
            ["AuditEvent", "Security and compliance trace event."],
        ],
    )
    add_heading(doc, "HL7 Message Glossary", 2)
    add_table(
        doc,
        ["HL7 Message", "Meaning"],
        [
            ["ADT", "Admission, discharge and transfer events."],
            ["ORM", "Order message, commonly used for lab/radiology orders."],
            ["ORU", "Observation/result message."],
            ["SIU", "Scheduling message."],
            ["DFT", "Financial transaction message."],
            ["MDM", "Medical document management message."],
        ],
    )

    return doc


def write_markdown_summary(diagrams: dict[str, Path]) -> None:
    lines = [
        "# FHIR & HL7 Ready Multi-Tenant HMS Database Architecture Blueprint - Visual v2",
        "",
        "This is the source companion for the Word blueprint. The Word file contains formatted pages, tables and generated PNG diagrams.",
        "",
        "## Final Recommendation",
        "",
        "- Default: shared database + shared tables.",
        "- Isolation: tenant_id + hospital_id + branch_id on every transaction table.",
        "- Enterprise: optional dedicated schema or database.",
        "- FHIR: interoperability layer, not a blind database copy.",
        "- HL7: listener, parser, validator, message log and normalized table mapping.",
        "- Reporting: denormalized summary tables for dashboards and AI.",
        "",
        "## Diagram Assets",
        "",
    ]
    for name, path in diagrams.items():
        rel = path.relative_to(ROOT).as_posix()
        lines.append(f"- {name}: `{rel}`")
    lines.extend(
        [
            "",
            "## Main Sections",
            "",
            "1. Executive Summary",
            "2. One-Page Architecture Decision",
            "3. Multi-Tenant Hospital Scenarios",
            "4. Recommended Data Hierarchy",
            "5. Data Isolation and Security",
            "6. FHIR and HL7 Integration",
            "7. Database Design Strategy",
            "8. Core Foundation Tables",
            "9. Complete Hospital Module Blueprint",
            "10. Branch-Level Access Matrix",
            "11. Roadmap and Final Recommendations",
        ]
    )
    OUTPUT_MD.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    diagrams = create_diagrams()
    doc = build_document(diagrams)
    doc.save(OUTPUT_DOCX)
    doc.save(LEGACY_DOCX)
    write_markdown_summary(diagrams)
    print(f"created: {OUTPUT_DOCX}")
    print(f"updated: {LEGACY_DOCX}")
    print(f"created: {OUTPUT_MD}")
    print(f"diagrams: {len(diagrams)}")


if __name__ == "__main__":
    main()
