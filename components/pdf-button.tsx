"use client";

import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { currency, percent } from "@/lib/calculator";
import { getCurrentUserId, getUserProfile } from "@/lib/data";
import { PricingResult, ProcedureFormData } from "@/lib/types";

type PiePart = {
  label: string;
  value: number;
  color: string;
};

type DownloadPdfInput = {
  data: ProcedureFormData;
  pricing: PricingResult;
  userName?: string;
};

function drawHeader(doc: jsPDF) {
  doc.setFillColor(11, 50, 44);
  doc.rect(0, 0, 210, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text("Precifica SaaS", 14, 14);
  doc.setFontSize(9);
  doc.text("Relatório de Precificação", 14, 20);

  doc.setDrawColor(103, 232, 179);
  doc.setLineWidth(0.5);
  doc.line(14, 29, 196, 29);

  doc.setTextColor(28, 46, 39);
}

function drawTableHeader(doc: jsPDF, y: number, headers: string[], colWidths: number[]) {
  const x = 14;
  const headerH = 8;

  doc.setFillColor(236, 245, 241);
  doc.rect(x, y, 182, headerH, "F");
  doc.setFontSize(9);

  let currentX = x;
  headers.forEach((header, i) => {
    doc.text(header, currentX + 2, y + 5.5);
    currentX += colWidths[i];
  });

  return y + headerH;
}

function drawSimpleTable(doc: jsPDF, startY: number, headers: string[], rows: string[][], colWidths?: number[]) {
  const widths = colWidths && colWidths.length === headers.length
    ? colWidths
    : new Array(headers.length).fill(182 / headers.length);

  const x = 14;
  let y = drawTableHeader(doc, startY, headers, widths);

  rows.forEach((row) => {
    const wrapped = row.map((cell, i) => doc.splitTextToSize(String(cell || "-"), Math.max(8, widths[i] - 4)) as string[]);
    const lines = Math.max(...wrapped.map((w) => w.length));
    const rowH = Math.max(7, lines * 4.5 + 2);

    if (y + rowH > 278) {
      doc.addPage();
      drawHeader(doc);
      y = drawTableHeader(doc, 36, headers, widths);
    }

    doc.rect(x, y, 182, rowH);

    let currentX = x;
    wrapped.forEach((cellLines, i) => {
      doc.text(cellLines, currentX + 2, y + 4.5);
      currentX += widths[i];
    });

    y += rowH;
  });

  return y + 6;
}

function drawPricePieChart(doc: jsPDF, startY: number, pricing: PricingResult) {
  const parts: PiePart[] = [
    { label: "Imposto", value: Math.max(0, pricing.taxCost), color: "#ef4444" },
    { label: "Margem", value: Math.max(0, pricing.grossProfitValue), color: "#3b82f6" },
    { label: "Custo direto", value: Math.max(0, pricing.directCost), color: "#10b981" },
  ];

  const total = parts.reduce((sum, part) => sum + part.value, 0);

  doc.setFontSize(11);
  doc.setTextColor(28, 46, 39);
  doc.text("Formação de preço (gráfico)", 14, startY);

  if (total <= 0) {
    doc.setFontSize(9);
    doc.text("Sem dados suficientes para gerar o gráfico de pizza.", 14, startY + 8);
    return startY + 16;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 520;
  canvas.height = 280;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    doc.setFontSize(9);
    doc.text("Não foi possível renderizar o gráfico.", 14, startY + 8);
    return startY + 16;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = 140;
  const cy = 140;
  const radius = 100;
  let currentAngle = -Math.PI / 2;

  parts.forEach((part) => {
    const slice = (part.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, currentAngle, currentAngle + slice);
    ctx.closePath();
    ctx.fillStyle = part.color;
    ctx.fill();
    currentAngle += slice;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.font = "700 18px Arial";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Preço", 114, 132);
  ctx.font = "700 16px Arial";
  ctx.fillText(currency(pricing.suggestedPrice), 88, 154);

  let legendY = 70;
  parts.forEach((part) => {
    ctx.fillStyle = part.color;
    ctx.fillRect(280, legendY, 14, 14);
    ctx.fillStyle = "#0f172a";
    ctx.font = "600 16px Arial";
    ctx.fillText(`${part.label}: ${currency(part.value)}`, 304, legendY + 12);
    legendY += 40;
  });

  doc.addImage(canvas.toDataURL("image/png"), "PNG", 14, startY + 6, 182, 58);

  return startY + 70;
}

export async function downloadProcedurePdf({ data, pricing, userName }: DownloadPdfInput) {
  let profileName = userName || "Profissional";

  try {
    const userId = await getCurrentUserId();
    const profile = await getUserProfile(userId);
    if (profile?.legal_name) profileName = profile.legal_name;
  } catch {
    profileName = userName || "Profissional";
  }

  const doc = new jsPDF();
  drawHeader(doc);

  let y = 38;

  doc.setFontSize(11);
  doc.text("Dados gerais", 14, y);
  y += 4;

  y = drawSimpleTable(
    doc,
    y,
    ["Usuário", "Procedimento", "Categoria", "Tempo clínico"],
    [[profileName, data.name || "Não informado", data.category || "Não informada", `${data.clinical_hours} h`]],
    [58, 52, 34, 38],
  );

  doc.setFontSize(11);
  doc.text("Formação de preço", 14, y);
  y += 4;

  y = drawSimpleTable(
    doc,
    y,
    ["Imposto", "Margem", "Custo direto", "Preço sugerido"],
    [[percent(data.tax_rate), percent(data.profit_margin), currency(pricing.directCost), currency(pricing.suggestedPrice)]],
  );

  y = drawPricePieChart(doc, y, pricing);

  doc.setFontSize(11);
  doc.text("Resumo financeiro", 14, y);
  y += 4;

  y = drawSimpleTable(
    doc,
    y,
    ["Custo operacional", "Subtotal", "Impostos", "Lucro bruto"],
    [[currency(pricing.operationalCost), currency(pricing.subtotalCost), currency(pricing.taxCost), currency(pricing.grossProfitValue)]],
  );

  doc.setFontSize(11);
  doc.text("Tabela de insumos", 14, y);
  y += 4;

  const itemRows = data.items
    .filter((item) => item.name.trim().length > 0)
    .map((item) => [
      item.name,
      String(item.quantity),
      currency(item.unit_cost),
      currency(item.quantity * item.unit_cost),
    ]);

  y = drawSimpleTable(
    doc,
    y,
    ["Insumo", "Quantidade", "Custo unitário", "Total"],
    itemRows.length ? itemRows : [["Sem insumos informados", "-", "-", "-"]],
    [74, 30, 38, 40],
  );

  doc.setFontSize(8);
  doc.setTextColor(90, 110, 102);
  doc.text("Documento gerado automaticamente pelo Precifica SaaS", 14, Math.min(287, y + 6));

  doc.save(`${(data.name || "precificacao").toLowerCase().replaceAll(" ", "-")}-precificacao.pdf`);
}

export function PdfButton({ data, pricing, userName }: DownloadPdfInput) {
  const onDownload = async () => {
    await downloadProcedurePdf({ data, pricing, userName });
  };

  return (
    <button type="button" className="btn btn-secondary" onClick={onDownload}>
      <Download size={16} /> Exportar PDF
    </button>
  );
}
