import type { RadiologyResultBlock } from "./radiology/types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfResultRow = {
  testName: string;
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: "N" | "H" | "L";
};

export type PdfResultBlock = {
  testName: string;
  department: string;
  sampleCollectedOn: string;
  completedOn: string;
  reportStatus: string;
  barcodeNo: string;
  sampleType: string;
  reportDate: string;
  interpretation?: string;
  rows: PdfResultRow[];
};

type PdfPatient = {
  patientName: string;
  ageGender: string;
  mrn: string;
  doctorName: string;
  sampleCollectionDate: string;
  reportStatus: string;
  reportDate: string;
};

const LOGO_SRC = "/plasmit-sidebar-logo.webp";
const REPORT_HEADER_IMAGE_SRC = "/report-header.png";
const QR_SRC = "https://api.qrserver.com/v1/create-qr-code/?data=HelloWorld&size=100x100";

function normalizeGroup(parameter: string) {
  const p = parameter.toLowerCase();
  if (["hemoglobin", "rbc", "hematocrit", "pcv", "mcv", "mch", "mchc", "rdw"].some((k) => p.includes(k))) return "RBC Parameters";
  if (["wbc", "tlc", "neutrophil", "lymphocyte", "monocyte", "eosinophil", "basophil"].some((k) => p.includes(k))) return "WBC Parameters";
  if (["platelet", "mpv", "pdw", "pct"].some((k) => p.includes(k))) return "Platelet Parameters";
  return "";
}

function isAbnormal(row: PdfResultRow) {
  return row.flag === "H" || row.flag === "L";
}

function rowTone(row: PdfResultRow): [number, number, number] {
  if (row.flag === "H") return [180, 40, 40];
  if (row.flag === "L") return [30, 90, 180];
  return [28, 44, 74];
}

function groupRows(rows: PdfResultRow[]) {
  const grouped = new Map<string, PdfResultRow[]>();
  rows.forEach((row) => {
    const group = normalizeGroup(row.parameter);
    grouped.set(group, [...(grouped.get(group) ?? []), row]);
  });
  return grouped;
}

function renderPageHeader(doc: jsPDF, logoBase64?: string | null, reportTitle = "LABORATORY REPORT", headerImageBase64?: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  const contentWidth = pageWidth - margin * 2;
  const headerTop = 18;
  if (headerImageBase64) {
    doc.addImage(headerImageBase64, "PNG", margin, headerTop - 2, contentWidth, 52);
    return;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(30, 64, 175);
  doc.text(reportTitle, margin + 12, headerTop + 25);
  if (logoBase64) doc.addImage(logoBase64, "PNG", pageWidth - margin - 108, headerTop + 4, 100, 34);
}

function getPatientData(): PdfPatient {
  return {
    patientName: "Meera Joshi",
    ageGender: "42 Years / Female",
    mrn: "UHID-45821",
    doctorName: "Dr. Kavita Rao",
    sampleCollectionDate: "12/05/2021 09:30 AM",
    reportStatus: "Final",
    reportDate: "14/05/2021",
  };
}

async function loadImageAsPngBase64(src: string): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image failed to load"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function addHeader(doc: jsPDF, logoBase64?: string | null, reportTitle = "LABORATORY REPORT", headerImageBase64?: string | null) {
  renderPageHeader(doc, logoBase64, reportTitle, headerImageBase64);
}

function addPatientSection(doc: jsPDF, patient: PdfPatient) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  const contentWidth = pageWidth - margin * 2;
  const startY = 74;
  doc.setDrawColor(210);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, startY, contentWidth, 78, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text("Patient Information", margin + 10, startY + 15);
  doc.setDrawColor(230);
  doc.line(margin, startY + 22, pageWidth - margin, startY + 22);

  const leftX = margin + 10;
  const rightX = margin + contentWidth / 2 + 10;
  const labelW = 88;
  const left: Array<[string, string]> = [["Patient Name", patient.patientName], ["MRN", patient.mrn], ["Age / Gender", patient.ageGender], ["Doctor Name", patient.doctorName]];
  const right: Array<[string, string]> = [["Sample Collection", patient.sampleCollectionDate], ["Report Date", patient.reportDate], ["Report Status", patient.reportStatus], ["", ""]];
  doc.setFontSize(8);
  left.forEach(([label, value], index) => {
    const y = startY + 35 + index * 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(`${label}:`, leftX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20);
    doc.text(String(value || "-"), leftX + labelW, y);
  });
  right.forEach(([label, value], index) => {
    if (!label) return;
    const y = startY + 35 + index * 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);
    doc.text(`${label}:`, rightX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20);
    doc.text(String(value || "-"), rightX + labelW, y);
  });
}

async function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;
  const footerTop = pageHeight - 104;
  const footerWidth = pageWidth - margin * 2;
  const footerPadding = 18;
  const contentX = margin + 66;
  const contactY = footerTop + 42;
  doc.setFillColor(245, 249, 255);
  doc.roundedRect(margin, footerTop - 8, footerWidth, 82, 4, 4, "F");
  doc.setDrawColor(190, 205, 230);
  doc.roundedRect(margin, footerTop - 8, footerWidth, 82, 4, 4);
  const qrBase64 = await loadImageAsPngBase64(QR_SRC);
  if (qrBase64) doc.addImage(qrBase64, "PNG", margin + 6, footerTop + 4, 42, 42);
  doc.setFont("times", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("Booking Centre :-", margin + 66, footerTop + 12);
  doc.setFont("times", "normal");
  doc.text(" PlasmIT Hospital", margin + 130, footerTop + 12);
  doc.setFont("times", "bold");
  doc.text("Processing Lab :-", margin + 66, footerTop + 26);
  doc.setFont("times", "normal");
  doc.text(" PlasmIT Pty Ltd, Level 17, Tower 4, 727 Collins Street, Docklands, Victoria - 3008 Australia", margin + 130, footerTop + 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Authorized Signatory", pageWidth - margin - 10, footerTop + 10, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.text("____________________", pageWidth - margin - 10, footerTop + 20, { align: "right" });
  doc.text("Dr. Kavita Rao", pageWidth - margin - 10, footerTop + 30, { align: "right" });
  doc.text("MD Pathology", pageWidth - margin - 10, footerTop + 39, { align: "right" });
  doc.text("Reg. No: MMC12345", pageWidth - margin - 10, footerTop + 48, { align: "right" });
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(8);
  doc.textWithLink("+61 431 770 499", contentX, contactY + 6, { url: "tel:+61431770499" });
  doc.setTextColor(30, 64, 130);
  doc.textWithLink(" info@plasmitvector.com", contentX + 114, contactY + 6, { url: "info@plasmitvector.com" });
  doc.setTextColor(30, 64, 175);
  doc.textWithLink("www.plasmitvector.com", contentX + 269, contactY + 6, { url: "https://www.plasmitvector.com/" });
  doc.setFontSize(6.5);
  doc.setTextColor(70, 87, 110);
  doc.text("All Lab results are subject to clinical interpretation by qualified medical professional and this report is not subject to use for any medico-legal purpose.", margin + footerPadding + 50, footerTop + 66, { maxWidth: footerWidth - 100 });
  doc.setFontSize(7);
  doc.setTextColor(90, 105, 130);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin - 6, pageHeight - 8, { align: "right" });
}

function renderResultTable(doc: jsPDF, rows: PdfResultRow[], startY: number, groupName?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  autoTable(doc, {
    startY,
    margin: { left: margin, right: margin, bottom: 118 },
    tableWidth: pageWidth - margin * 2,
    head: [[groupName ?? "Parameter", "Value", "Unit", "Reference Range"]],
    body: rows.map((row) => [row.parameter || "-", row.value || "-", row.unit || "-", row.referenceRange || "-"]),
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 4, textColor: 20, lineColor: 210, lineWidth: 0.3, overflow: "linebreak", valign: "middle" },
    headStyles: { fillColor: [235, 238, 242], textColor: 20, fontStyle: "bold", halign: "center" },
    bodyStyles: { fillColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: { 0: { cellWidth: 235 }, 1: { cellWidth: 90, halign: "center" }, 2: { cellWidth: 85, halign: "center" }, 3: { cellWidth: 130, halign: "center" } },
    didParseCell: (data) => {
      if (data.section === "body") {
        const row = rows[data.row.index];
        if (row && isAbnormal(row)) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = rowTone(row);
        }
      }
    },
    pageBreak: "auto",
    rowPageBreak: "auto",
  });
}

async function addPageFrame(doc: jsPDF, patient: PdfPatient, logoBase64?: string | null, reportTitle?: string, headerImageBase64?: string | null) {
  addHeader(doc, logoBase64, reportTitle ?? "LABORATORY REPORT", headerImageBase64);
  addPatientSection(doc, patient);
}

export async function downloadLaboratoryPdf(blocks: PdfResultBlock[], filename: string, reportTitle?: string) {
  const patient = getPatientData();
  const logoBase64 = await loadImageAsPngBase64(LOGO_SRC);
  const headerBase64 = await loadImageAsPngBase64(REPORT_HEADER_IMAGE_SRC);
  const inferredTitle = filename.toLowerCase().includes("pathology") ? "PATHOLOGY REPORT" : reportTitle ?? "LABORATORY REPORT";
  const isPathologyLike = inferredTitle.toUpperCase().includes("PATHOLOGY") || inferredTitle.toUpperCase().includes("LABORATORY");
  if (!blocks?.length) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  for (const [index, block] of blocks.entries()) {
    if (index > 0) doc.addPage();
    await addPageFrame(doc, patient, logoBase64, inferredTitle, headerBase64);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(block.testName, 28, 182);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Department: ${block.department || "-"}`, 28, 196);
    doc.text(`Sample Type: ${block.sampleType || "-"}`, 550, 196, { align: "right" });

    renderResultTable(doc, block.rows, 208);

    const interpretation = block.interpretation?.trim();
    if (interpretation) {
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = Math.max(((doc as any).lastAutoTable?.finalY ?? 212) + 10, 212);
      if (y > pageHeight - 140) {
        doc.addPage();
        await addPageFrame(doc, patient, logoBase64, inferredTitle, headerBase64);
        y = 182;
      }
      const lines = doc.splitTextToSize(interpretation, 520);
      const boxHeight = Math.min(70, lines.length * 9 + 26);
      doc.setDrawColor(215);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(28, y, doc.internal.pageSize.getWidth() - 56, boxHeight, 3, 3, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(20);
      doc.text("Interpretation", 36, y + 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(lines.slice(0, 5), 36, y + 28);
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    await addFooter(doc, i, totalPages);
  }
  doc.save(filename);
}

export async function downloadRadiologyPdf(blocks: RadiologyResultBlock[], filename: string) {
  const reportBlocks: PdfResultBlock[] = blocks.map((block, index) => ({
    testName: block.selectedTests,
    department: block.category || "Radiology",
    sampleCollectedOn: "12/05/2021 09:30 AM",
    completedOn: block.reportDate ?? "14/05/2021",
    reportStatus: "Final",
    barcodeNo: `RAD-${index + 1}`,
    sampleType: block.specification || "Imaging",
    reportDate: block.reportDate ?? "14/05/2021",
    interpretation: [block.findings?.trim(), block.impression?.trim()].filter(Boolean).join("\n\n") || undefined,
    rows: block.rows.map((row) => ({ testName: block.selectedTests, parameter: row.parameter, value: row.result, unit: row.unit, referenceRange: row.referenceRange, flag: "N" })),
  }));
  await downloadLaboratoryPdf(reportBlocks, filename, "RADIOLOGY REPORT");
}


