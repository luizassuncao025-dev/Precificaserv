import { createSupabaseBrowserClient } from "@/lib/supabase";
import { defaultClinicSettings, defaultFixedCosts } from "@/lib/defaults";
import {
  ClinicSettings,
  FixedCost,
  LastPurchase,
  ProcedureFormData,
  ProcedureRecord,
  UserProfile,
} from "@/lib/types";

function normalizeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toError(error: unknown, fallback: string) {
  if (error instanceof Error) return error;

  if (error && typeof error === "object") {
    const maybe = error as { message?: string; details?: string };
    if (maybe.message) {
      const details = maybe.details ? ` (${maybe.details})` : "";
      return new Error(`${maybe.message}${details}`);
    }
  }

  return new Error(fallback);
}

export async function getCurrentUserId() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Usuario nao autenticado.");
  return data.user.id;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id,legal_name,document_number,contact_phone")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw toError(error, "Falha ao carregar perfil do usuario.");
  return (data as UserProfile | null) ?? null;
}

export async function upsertUserProfile(userId: string, profile: Omit<UserProfile, "user_id">) {
  const supabase = createSupabaseBrowserClient();
  const payload: UserProfile = {
    user_id: userId,
    legal_name: profile.legal_name.trim(),
    document_number: profile.document_number.trim(),
    contact_phone: profile.contact_phone.trim(),
  };

  const { error } = await supabase.from("user_profiles").upsert(payload);
  if (error) {
    if (error.message.includes("relation") && error.message.includes("user_profiles")) {
      throw new Error("Tabela user_profiles nao encontrada. Execute o schema atualizado no Supabase SQL Editor.");
    }
    throw toError(error, "Falha ao salvar perfil do usuario.");
  }
}

export async function loadSettings(userId: string): Promise<{ fixedCosts: FixedCost[]; clinicSettings: ClinicSettings }> {
  const supabase = createSupabaseBrowserClient();

  const [{ data: fixedCostRows, error: fixedError }, { data: clinicRows, error: clinicError }] = await Promise.all([
    supabase.from("fixed_costs").select("id,label,monthly_value").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase.from("clinic_settings").select("worked_days, clinical_hours_per_day").eq("user_id", userId).maybeSingle(),
  ]);

  if (fixedError) throw toError(fixedError, "Falha ao carregar custos fixos.");
  if (clinicError) throw toError(clinicError, "Falha ao carregar configuracoes da clinica.");

  return {
    fixedCosts: fixedCostRows?.length ? (fixedCostRows as FixedCost[]) : defaultFixedCosts,
    clinicSettings: (clinicRows as ClinicSettings | null) ?? defaultClinicSettings,
  };
}

export async function saveSettings(userId: string, fixedCosts: FixedCost[], clinicSettings: ClinicSettings) {
  const supabase = createSupabaseBrowserClient();

  const { error: deleteError } = await supabase.from("fixed_costs").delete().eq("user_id", userId);
  if (deleteError) throw toError(deleteError, "Falha ao atualizar custos fixos.");

  const fixedPayload = fixedCosts
    .filter((item) => item.label.trim().length > 0)
    .map((item) => ({
      user_id: userId,
      label: item.label.trim(),
      monthly_value: normalizeNumber(item.monthly_value),
    }));

  if (fixedPayload.length) {
    const { error: fixedError } = await supabase.from("fixed_costs").insert(fixedPayload);
    if (fixedError) throw toError(fixedError, "Falha ao salvar custos fixos.");
  }

  const { error: settingsError } = await supabase.from("clinic_settings").upsert({
    user_id: userId,
    worked_days: normalizeNumber(clinicSettings.worked_days),
    clinical_hours_per_day: normalizeNumber(clinicSettings.clinical_hours_per_day),
  });

  if (settingsError) throw toError(settingsError, "Falha ao salvar configuracoes da clinica.");
}

export async function loadLastPurchases(userId: string): Promise<LastPurchase[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("last_purchases")
    .select("id,material_name,unit_measure,quantity_total,total_value,unit_cost")
    .eq("user_id", userId)
    .order("material_name", { ascending: true });

  if (error) throw toError(error, "Falha ao carregar ultimas compras.");

  return (data ?? []).map((row) => {
    const quantityTotal = normalizeNumber(row.quantity_total);
    const totalValue = normalizeNumber(row.total_value);
    const unitCostFromCalc = quantityTotal > 0 ? totalValue / quantityTotal : 0;

    return {
      id: row.id,
      material_name: row.material_name,
      unit_measure: row.unit_measure ?? "",
      quantity_total: quantityTotal,
      total_value: totalValue,
      unit_cost: normalizeNumber(row.unit_cost) || unitCostFromCalc,
    };
  }) as LastPurchase[];
}

export async function saveLastPurchases(userId: string, purchases: LastPurchase[]) {
  const supabase = createSupabaseBrowserClient();

  const { error: deleteError } = await supabase.from("last_purchases").delete().eq("user_id", userId);
  if (deleteError) throw toError(deleteError, "Falha ao atualizar ultimas compras.");

  const payload = purchases
    .filter((row) => row.material_name.trim().length > 0)
    .map((row) => {
      const quantityTotal = normalizeNumber(row.quantity_total);
      const totalValue = normalizeNumber(row.total_value);
      const unitCost = quantityTotal > 0 ? totalValue / quantityTotal : normalizeNumber(row.unit_cost);

      return {
        user_id: userId,
        material_name: row.material_name.trim(),
        unit_measure: row.unit_measure.trim(),
        quantity_total: quantityTotal,
        total_value: totalValue,
        unit_cost: unitCost,
      };
    });

  if (!payload.length) return;

  const { error } = await supabase.from("last_purchases").insert(payload);
  if (error) throw toError(error, "Falha ao salvar ultimas compras.");
}

export async function createProcedure(
  userId: string,
  input: ProcedureFormData & {
    directCost: number;
    operationalCost: number;
    subtotalCost: number;
    suggestedPrice: number;
  },
) {
  const supabase = createSupabaseBrowserClient();

  const { data: procedure, error } = await supabase
    .from("procedures")
    .insert({
      user_id: userId,
      name: input.name,
      category: input.category,
      notes: input.notes,
      clinical_hours: input.clinical_hours,
      tax_rate: input.tax_rate,
      profit_margin: input.profit_margin,
      direct_cost: input.directCost,
      operational_cost: input.operationalCost,
      subtotal_cost: input.subtotalCost,
      suggested_price: input.suggestedPrice,
    })
    .select("id")
    .single();

  if (error || !procedure) throw toError(error, "Nao foi possivel criar o procedimento.");

  const itemPayload = input.items.map((item) => ({
    user_id: userId,
    procedure_id: procedure.id,
    name: item.name,
    quantity: normalizeNumber(item.quantity),
    unit_cost: normalizeNumber(item.unit_cost),
  }));

  if (itemPayload.length) {
    const { error: itemError } = await supabase.from("procedure_items").insert(itemPayload);
    if (itemError) throw toError(itemError, "Falha ao salvar itens do procedimento.");
  }

  const { error: historyError } = await supabase.from("pricing_history").insert({
    user_id: userId,
    procedure_id: procedure.id,
    procedure_name: input.name,
    suggested_price: input.suggestedPrice,
    subtotal_cost: input.subtotalCost,
    tax_rate: input.tax_rate,
    profit_margin: input.profit_margin,
  });

  if (historyError) throw toError(historyError, "Falha ao salvar historico de precificacao.");

  return procedure.id as string;
}

export async function updateProcedure(
  userId: string,
  procedureId: string,
  input: ProcedureFormData & {
    directCost: number;
    operationalCost: number;
    subtotalCost: number;
    suggestedPrice: number;
  },
) {
  const supabase = createSupabaseBrowserClient();

  const { error: procedureError } = await supabase
    .from("procedures")
    .update({
      name: input.name,
      category: input.category,
      notes: input.notes,
      clinical_hours: input.clinical_hours,
      tax_rate: input.tax_rate,
      profit_margin: input.profit_margin,
      direct_cost: input.directCost,
      operational_cost: input.operationalCost,
      subtotal_cost: input.subtotalCost,
      suggested_price: input.suggestedPrice,
    })
    .eq("user_id", userId)
    .eq("id", procedureId);

  if (procedureError) throw toError(procedureError, "Falha ao atualizar procedimento.");

  const { error: deleteError } = await supabase.from("procedure_items").delete().eq("user_id", userId).eq("procedure_id", procedureId);
  if (deleteError) throw toError(deleteError, "Falha ao atualizar itens do procedimento.");

  const itemPayload = input.items.map((item) => ({
    user_id: userId,
    procedure_id: procedureId,
    name: item.name,
    quantity: normalizeNumber(item.quantity),
    unit_cost: normalizeNumber(item.unit_cost),
  }));

  if (itemPayload.length) {
    const { error: itemError } = await supabase.from("procedure_items").insert(itemPayload);
    if (itemError) throw toError(itemError, "Falha ao salvar itens atualizados.");
  }
}

export async function listProcedures(userId: string): Promise<ProcedureRecord[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw toError(error, "Falha ao carregar procedimentos.");
  return (data ?? []) as ProcedureRecord[];
}

export async function getProcedure(userId: string, procedureId: string): Promise<ProcedureRecord | null> {
  const supabase = createSupabaseBrowserClient();

  const { data: procedure, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("user_id", userId)
    .eq("id", procedureId)
    .maybeSingle();

  if (error) throw toError(error, "Falha ao carregar procedimento.");
  if (!procedure) return null;

  const { data: items, error: itemsError } = await supabase
    .from("procedure_items")
    .select("id,name,quantity,unit_cost")
    .eq("procedure_id", procedureId)
    .order("created_at", { ascending: true });

  if (itemsError) throw toError(itemsError, "Falha ao carregar itens do procedimento.");

  return { ...procedure, procedure_items: items ?? [] } as ProcedureRecord;
}
