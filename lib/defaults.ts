import { ClinicSettings, FixedCost, ProcedureFormData } from "@/lib/types";

export const defaultFixedCosts: FixedCost[] = [];

export const defaultClinicSettings: ClinicSettings = {
  worked_days: 22,
  clinical_hours_per_day: 8,
};

export const defaultProcedure: ProcedureFormData = {
  name: "",
  category: "",
  notes: "",
  clinical_hours: 0,
  tax_rate: 0,
  profit_margin: 0,
  items: [{ name: "", quantity: 0, unit_cost: 0 }],
};
