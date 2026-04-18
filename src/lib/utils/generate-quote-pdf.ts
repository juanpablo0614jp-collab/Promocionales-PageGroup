import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCOP } from "./format";

interface QuotePdfData {
  codigo: string;
  fechaSolicitud: Date;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  contacto: string | null;
  notas: string | null;
}

export async function generateQuotePdf(data: QuotePdfData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = page.getWidth();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = 790;
  const gray = rgb(0.4, 0.4, 0.4);
  const black = rgb(0, 0, 0);
  const lightGray = rgb(0.95, 0.95, 0.95);

  // Title
  page.drawText("COTIZACION", {
    x: margin,
    y,
    size: 22,
    font: fontBold,
    color: black,
  });

  const codigoWidth = font.widthOfTextAtSize(data.codigo, 12);
  page.drawText(data.codigo, {
    x: pageWidth - margin - codigoWidth,
    y: y + 4,
    size: 12,
    font,
    color: gray,
  });

  // Separator line
  y -= 12;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Company info
  y -= 20;
  page.drawText("Promocionales Page Group", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: black,
  });
  y -= 14;
  page.drawText("Colombia", {
    x: margin,
    y,
    size: 9,
    font,
    color: gray,
  });

  // Date (right side)
  const fecha = new Date(data.fechaSolicitud);
  const fechaStr = fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const fechaText = `Fecha: ${fechaStr}`;
  const fechaW = font.widthOfTextAtSize(fechaText, 10);
  page.drawText(fechaText, {
    x: pageWidth - margin - fechaW,
    y: y + 14,
    size: 10,
    font,
    color: gray,
  });

  if (data.contacto) {
    const paraText = `Para: ${data.contacto}`;
    const paraW = font.widthOfTextAtSize(paraText, 10);
    page.drawText(paraText, {
      x: pageWidth - margin - paraW,
      y,
      size: 10,
      font,
      color: gray,
    });
  }

  // Description
  y -= 28;
  page.drawText("Descripcion", {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: black,
  });
  y -= 16;

  // Word wrap description
  const descWords = data.descripcion.split(" ");
  let line = "";
  const descLines: string[] = [];
  for (const word of descWords) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, 10) > contentWidth) {
      descLines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) descLines.push(line);

  for (const dl of descLines) {
    page.drawText(dl, { x: margin, y, size: 10, font, color: black });
    y -= 14;
  }

  // Table header
  y -= 10;
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: contentWidth,
    height: 20,
    color: lightGray,
  });
  y += 4;
  const cols = [margin + 5, margin + 200, margin + 300];
  page.drawText("Concepto", {
    x: cols[0],
    y,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText("Cantidad", {
    x: cols[1],
    y,
    size: 9,
    font: fontBold,
    color: gray,
  });
  page.drawText("P. Unitario", {
    x: cols[2],
    y,
    size: 9,
    font: fontBold,
    color: gray,
  });
  const totalLabel = "Total";
  const totalLabelW = fontBold.widthOfTextAtSize(totalLabel, 9);
  page.drawText(totalLabel, {
    x: pageWidth - margin - totalLabelW,
    y,
    size: 9,
    font: fontBold,
    color: gray,
  });

  // Table row
  y -= 22;
  const itemDesc =
    data.descripcion.length > 30
      ? data.descripcion.substring(0, 30) + "..."
      : data.descripcion;
  page.drawText(itemDesc, {
    x: cols[0],
    y,
    size: 10,
    font,
    color: black,
  });
  page.drawText(String(data.cantidad), {
    x: cols[1],
    y,
    size: 10,
    font,
    color: black,
  });
  page.drawText(formatCOP(data.precioUnitario), {
    x: cols[2],
    y,
    size: 10,
    font,
    color: black,
  });
  const totalValStr = formatCOP(data.precioTotal);
  const totalValW = font.widthOfTextAtSize(totalValStr, 10);
  page.drawText(totalValStr, {
    x: pageWidth - margin - totalValW,
    y,
    size: 10,
    font,
    color: black,
  });

  // Total bar
  y -= 16;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 18;
  page.drawText("TOTAL:", {
    x: margin + 300,
    y,
    size: 13,
    font: fontBold,
    color: black,
  });
  const grandTotal = formatCOP(data.precioTotal);
  const grandTotalW = fontBold.widthOfTextAtSize(grandTotal, 13);
  page.drawText(grandTotal, {
    x: pageWidth - margin - grandTotalW,
    y,
    size: 13,
    font: fontBold,
    color: black,
  });

  // Notes
  if (data.notas) {
    y -= 30;
    page.drawText("Notas:", {
      x: margin,
      y,
      size: 9,
      font: fontBold,
      color: gray,
    });
    y -= 14;
    const notasWords = data.notas.split(" ");
    let nLine = "";
    const notasLines: string[] = [];
    for (const word of notasWords) {
      const test = nLine ? `${nLine} ${word}` : word;
      if (font.widthOfTextAtSize(test, 9) > contentWidth) {
        notasLines.push(nLine);
        nLine = word;
      } else {
        nLine = test;
      }
    }
    if (nLine) notasLines.push(nLine);

    for (const nl of notasLines) {
      page.drawText(nl, { x: margin, y, size: 9, font, color: gray });
      y -= 12;
    }
  }

  // Footer
  const footerText =
    "Documento generado automaticamente — Promocionales Page Group";
  const footerW = font.widthOfTextAtSize(footerText, 7);
  page.drawText(footerText, {
    x: (pageWidth - footerW) / 2,
    y: 30,
    size: 7,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Save
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.codigo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
