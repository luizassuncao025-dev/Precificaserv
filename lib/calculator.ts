import { ClinicSettings, FixedCost, PricingResult, ProcedureItem } from "@/lib/types";

const round = (value: number) => Number.isFinite(value) ? Number(value.toFixed(2)) : 0;

export function sumFixedCosts(costs: FixedCost[]) {
  return round(costs.reduce((total, item) => total + (Number(item.monthly_value) || 0), 0));
}

export function sumDirectCost(items: ProcedureItem[]) {
  return round(items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitCost = Number(item.unit_cost) || 0;
    return total + quantity * unitCost;
  }, 0));
}

export function calculatePricing(params: {
  fixedCosts: FixedCost[];
  clinicSettings: ClinicSettings;
  items: ProcedureItem[];
  clinicalHours: number;
  taxRate: number;
  profitMargin: number;
}): PricingResult {
  const totalFixedCosts = sumFixedCosts(params.fixedCosts);
  const monthlyClinicalHours = round((Number(params.clinicSettings.worked_days) || 0) * (Number(params.clinicSettings.clinical_hours_per_day) || 0));
  const costPerClinicalHour = monthlyClinicalHours > 0 ? round(totalFixedCosts / monthlyClinicalHours) : 0;
  const directCost = sumDirectCost(params.items);
  const operationalCost = round((Number(params.clinicalHours) || 0) * costPerClinicalHour);
  const subtotalCost = round(directCost + operationalCost);
  const taxRateDecimal = (Number(params.taxRate) || 0) / 100;
  const marginDecimal = (Number(params.profitMargin) || 0) / 100;
  const taxedRevenue = taxRateDecimal < 1 ? subtotalCost / (1 - taxRateDecimal) : 0;
  const taxCost = round(taxedRevenue - subtotalCost);
  const suggestedPrice = taxRateDecimal < 1 && marginDecimal < 1
    ? round(subtotalCost / (1 - taxRateDecimal) / (1 - marginDecimal))
    : 0;
  const grossProfitValue = round(suggestedPrice - subtotalCost - taxCost);

  return {
    totalFixedCosts,
    monthlyClinicalHours,
    costPerClinicalHour,
    directCost,
    operationalCost,
    subtotalCost,
    taxCost,
    suggestedPrice,
    grossProfitValue,
  };
}

export function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

export function percent(value: number) {
  return `${(value || 0).toFixed(1)}%`;
}
