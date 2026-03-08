"use client";

import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { currency, percent } from "@/lib/calculator";
import { getCurrentUserId, getUserProfile } from "@/lib/data";
import { PricingResult, ProcedureFormData } from "@/lib/types";

type PiePart = {
  label: string;
  value: number;
  color: [number, number, number];
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

function drawSimpleTable(doc: jsPDF, startY: number, headers: string[], rows: string[][]) {
  const pageWidth = 182;
  const x = 14;
  const headerH = 8;
  const rowH = 7;
  const colW = pageWidth / headers.length;
  let y = startY;

  doc.setFillColor(236, 245, 241);
  doc.rect(x, y, pageWidth, headerH, "F");

  doc.setFontSize(9);
  doc.setTextColor(28, 46, 39);

  headers.forEach((header, index) => {
    doc.text(header, x + index * colW + 2, y + 5.5);
  });

  y += headerH;

  rows.forEach((row) => {
    if (y > 272) {
      doc.addPage();
      drawHeader(doc);
      y = 36;
      doc.setFillColor(236, 245, 241);
      doc.rect(x, y, pageWidth, headerH, "F");
      headers.forEach((header, index) => {
        doc.text(header, x + index * colW + 2, y + 5.5);
      });
      y += headerH;
    }

    doc.rect(x, y, pageWidth, rowH);
    row.forEach((cell, index) => {
      doc.text((cell || "-").slice(0, 40), x + index * colW + 2, y + 4.8);
    });
    y += rowH;
  });

  return y + 6;
}

function drawPieSlice(doc: jsPDF, cx: number, cy: number, radius: number, startAngle: number, endAngle: number, color: [number, number, number]) {
  const step = Math.max(2, Math.ceil((endAngle - startAngle) / 16));
  doc.setFillColor(color[0], color[1], color[2]);

  for (let angle = startAngle; angle < endAngle; angle += step) {
    const next = Math.min(endAngle, angle + step);
    const x1 = cx + radius * Math.cos((angle * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((angle * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((next * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((next * Math.PI) / 180);
    doc.triangle(cx, cy, x1, y1, x2, y2, "F");
  }
}

function drawPricePieChart(doc: jsPDF, startY: number, pricing: PricingResult) {
  const parts: PiePart[] = [
    { label: "Imposto", value: Math.max(0, pricing.taxCost), color: [248, 113, 113] },
    { label: "Margem", value: Math.max(0, pricing.grossProfitValue), color: [96, 165, 250] },
    { label: "Custo direto", value: Math.max(0, pricing.directCost), color: [16, 185, 129] },
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

  const centerX = 46;
  const centerY = startY + 28;
  const radius = 18;

  let currentAngle = -90;
  for (const part of parts) {
    const sweep = (part.value / total) * 360;
    drawPieSlice(doc, centerX, centerY, radius, currentAngle, currentAngle + sweep, part.color);
    currentAngle += sweep;
  }

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.circle(centerX, centerY, radius);

  doc.setFontSize(9);
  let legendY = startY + 14;
  parts.forEach((part) => {
    doc.setFillColor(part.color[0], part.color[1], part.color[2]);
    doc.rect(78, legendY - 3.5, 4, 4, "F");
    doc.setTextColor(28, 46, 39);
    doc.text(`${part.label}: ${currency(part.value)}`, 85, legendY);
    legendY += 8;
  });

  doc.setFontSize(10);
  doc.text(`Preço sugerido: ${currency(pricing.suggestedPrice)}`, 78, legendY + 4);

  return startY + 44;
}

export function PdfButton({
  data,
  pricing,
  userName,
}: {
  data: ProcedureFormData;
  pricing: PricingResult;
  userName?: string;
}) {
  const onDownload = async () => {
    let profileName = userName || "Profissional";

    if (!userName) {
      try {
        const userId = await getCurrentUserId();
        const profile = await getUserProfile(userId);
        if (profile?.legal_name) profileName = profile.legal_name;
      } catch {
        profileName = "Profissional";
      }
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
    );

    doc.setFontSize(8);
    doc.setTextColor(90, 110, 102);
    doc.text("Documento gerado automaticamente pelo Precifica SaaS", 14, Math.min(287, y + 6));

    doc.save(`${(data.name || "precificacao").toLowerCase().replaceAll(" ", "-")}-precificacao.pdf`);
  };

  return (
    <button type="button" className="btn btn-secondary" onClick={onDownload}>
      <Download size={16} /> Exportar PDF
    </button>
  );
}

