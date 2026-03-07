export function formatBrlInput(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  return normalized.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseBrlInput(value: string) {
  const sanitized = value
    .replace(/\s/g, "")
    .replace(/R\$/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");

  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
}
