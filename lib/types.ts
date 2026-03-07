export type FixedCost = {
  id?: string;
  label: string;
  monthly_value: number;
};

export type ProcedureItem = {
  id?: string;
  name: string;
  quantity: number;
  unit_cost: number;
};

export type LastPurchase = {
  id?: string;
  material_name: string;
  unit_measure: string;
  quantity_total: number;
  total_value: number;
  unit_cost: number;
};

export type UserProfile = {
  user_id: string;
  legal_name: string;
  document_number: string;
  contact_phone: string;
};

export type ProcedureFormData = {
  name: string;
  category: string;
  notes: string;
  clinical_hours: number;
  tax_rate: number;
  profit_margin: number;
  items: ProcedureItem[];
};

export type ClinicSettings = {
  worked_days: number;
  clinical_hours_per_day: number;
};

export type PricingResult = {
  totalFixedCosts: number;
  monthlyClinicalHours: number;
  costPerClinicalHour: number;
  directCost: number;
  operationalCost: number;
  subtotalCost: number;
  taxCost: number;
  suggestedPrice: number;
  grossProfitValue: number;
};

export type ProcedureRecord = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  notes: string | null;
  clinical_hours: number;
  tax_rate: number;
  profit_margin: number;
  suggested_price: number;
  subtotal_cost: number;
  direct_cost: number;
  operational_cost: number;
  created_at: string;
  updated_at: string;
  procedure_items?: ProcedureItem[];
};

export type DashboardMetrics = {
  totalProcedures: number;
  avgPrice: number;
  avgMargin: number;
  lastProcedureName: string;
};
