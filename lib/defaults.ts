import { ClinicSettings, FixedCost, ProcedureFormData } from "@/lib/types";

export const defaultFixedCosts: FixedCost[] = [
  { label: "Aluguel", monthly_value: 0 },
  { label: "Condomínio", monthly_value: 0 },
  { label: "Energia elétrica", monthly_value: 0 },
  { label: "Água", monthly_value: 0 },
  { label: "Internet", monthly_value: 0 },
  { label: "Telefone/WhatsApp Business", monthly_value: 100 },
  { label: "Software odontológico", monthly_value: 0 },
  { label: "Contabilidade", monthly_value: 850 },
  { label: "Pró-labore", monthly_value: 4000 },
  { label: "Recepcionista", monthly_value: 0 },
  { label: "Material de limpeza", monthly_value: 250 },
  { label: "Marketing/tráfego pago", monthly_value: 1500 },
  { label: "Manutenção de equipamentos", monthly_value: 650 },
  { label: "Esterilização", monthly_value: 300 },
  { label: "Insumos gerais (luvas, máscaras, gaze etc.)", monthly_value: 650 },
];

export const defaultClinicSettings: ClinicSettings = {
  worked_days: 22,
  clinical_hours_per_day: 8,
};

export const defaultProcedure: ProcedureFormData = {
  name: "Harmonização",
  category: "Estética",
  notes: "",
  clinical_hours: 4,
  tax_rate: 27.5,
  profit_margin: 45,
  items: [
    { name: "Resina composta", quantity: 0, unit_cost: 0 },
    { name: "Ácido condicionador", quantity: 0, unit_cost: 0 },
    { name: "Adesivo", quantity: 0, unit_cost: 0 },
    { name: "Anestésico", quantity: 0, unit_cost: 0 },
    { name: "Sugador", quantity: 0, unit_cost: 0 },
    { name: "Broca descartável", quantity: 0, unit_cost: 0 },
    { name: "Luvas", quantity: 0, unit_cost: 0 },
    { name: "Máscara", quantity: 0, unit_cost: 0 },
    { name: "Gaze", quantity: 0, unit_cost: 0 },
    { name: "Esterilização", quantity: 0, unit_cost: 0 },
    { name: "Taxa de cartão (aproximada)", quantity: 0, unit_cost: 0 },
  ],
};
