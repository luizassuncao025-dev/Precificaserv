"use client";

import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { currency, percent } from "@/lib/calculator";
import { getCurrentUserId, getUserProfile } from "@/lib/data";
import { PricingResult, ProcedureFormData } from "@/lib/types";

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
      doc.text((cell || "-").slice(0, 32), x + index * colW + 2, y + 4.8);
    });
    y += rowH;
  });

  return y + 6;
}

function drawInsumosChart(doc: jsPDF, data: ProcedureFormData, startY: number) {
  const totals = data.items
    .map((item) => ({ name: item.name || "Insumo", value: item.quantity * item.unit_cost }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  doc.setFontSize(10);
  doc.setTextColor(28, 46, 39);
  doc.text("Gráfico: participação dos insumos no custo direto", 14, startY);

  if (!totals.length) {
    doc.text("Sem dados suficientes para gerar o gráfico.", 14, startY + 8);
    return;
  }

  const maxValue = totals[0].value;
  const xBase = 14;
  const barX = 76;
  const width = 100;

  totals.forEach((item, index) => {
    const y = startY + 10 + index * 9;
    const ratio = maxValue > 0 ? item.value / maxValue : 0;
    const barWidth = ratio * width;

    doc.setFontSize(9);
    doc.text(item.name.slice(0, 22), xBase, y + 4);

    doc.setFillColor(232, 236, 234);
    doc.rect(barX, y, width, 5, "F");

    doc.setFillColor(103, 232, 179);
    doc.rect(barX, y, barWidth, 5, "F");

    doc.text(currency(item.value), barX + width + 3, y + 4);
  });
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
    doc.text("Parâmetros e resultado", 14, y);
    y += 4;

    y = drawSimpleTable(
      doc,
      y,
      ["Imposto", "Margem", "Custo direto", "Preço sugerido"],
      [[percent(data.tax_rate), percent(data.profit_margin), currency(pricing.directCost), currency(pricing.suggestedPrice)]],
    );

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

    const itemRows = data.items.map((item) => [
      item.name || "Insumo",
      String(item.quantity),
      currency(item.unit_cost),
      currency(item.quantity * item.unit_cost),
    ]);

    y = drawSimpleTable(doc, y, ["Insumo", "Quantidade", "Custo unitário", "Total"], itemRows);

    if (y > 240) {
      doc.addPage();
      drawHeader(doc);
      y = 40;
    }

    drawInsumosChart(doc, data, y);

    doc.setFontSize(8);
    doc.setTextColor(90, 110, 102);
    doc.text("Documento gerado automaticamente pelo Precifica SaaS", 14, 287);

    doc.save(`${(data.name || "precificacao").toLowerCase().replaceAll(" ", "-")}-precificacao.pdf`);
  };

  return (
    <button type="button" className="btn btn-secondary" onClick={onDownload}>
      <Download size={16} /> Exportar PDF
    </button>
  );
}
