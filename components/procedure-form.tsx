"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, RefreshCcw, Sparkles, Trash2 } from "lucide-react";
import { calculatePricing, currency, percent } from "@/lib/calculator";
import {
  createProcedure,
  getCurrentUserId,
  getUserProfile,
  loadLastPurchases,
  loadSettings,
  updateProcedure,
} from "@/lib/data";
import { defaultClinicSettings, defaultFixedCosts, defaultProcedure } from "@/lib/defaults";
import { ClinicSettings, FixedCost, LastPurchase, ProcedureFormData, ProcedureItem } from "@/lib/types";
import { PdfButton } from "@/components/pdf-button";

type ProcedureFormProps = {
  mode?: "create" | "edit";
  procedureId?: string;
  initialData?: ProcedureFormData;
};

function findPurchaseByName(name: string, rows: LastPurchase[]) {
  return rows.find((row) => row.material_name === name);
}

function applyLastPurchaseToItems(items: ProcedureItem[], rows: LastPurchase[]) {
  return items.map((item) => {
    const match = findPurchaseByName(item.name, rows);
    return match ? { ...item, unit_cost: Number(match.unit_cost) || 0 } : item;
  });
}

export function ProcedureForm({ mode = "create", procedureId, initialData }: ProcedureFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProcedureFormData>(initialData ?? defaultProcedure);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(defaultFixedCosts);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(defaultClinicSettings);
  const [lastPurchases, setLastPurchases] = useState<LastPurchase[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const [settingsData, purchasesData, profile] = await Promise.all([
          loadSettings(userId),
          loadLastPurchases(userId),
          getUserProfile(userId),
        ]);

        setFixedCosts(settingsData.fixedCosts);
        setClinicSettings(settingsData.clinicSettings);
        setLastPurchases(purchasesData);
        setUserName(profile?.legal_name ?? "");

        setForm((current) => ({ ...current, items: applyLastPurchaseToItems(current.items, purchasesData) }));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar dados iniciais.");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  const pricing = useMemo(
    () =>
      calculatePricing({
        fixedCosts,
        clinicSettings,
        items: form.items,
        clinicalHours: form.clinical_hours,
        taxRate: form.tax_rate,
        profitMargin: form.profit_margin,
      }),
    [fixedCosts, clinicSettings, form],
  );

  const selectedItems = useMemo(
    () => form.items.filter((item) => item.name.trim().length > 0),
    [form.items],
  );

  const addMaterial = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, { name: "", quantity: 0, unit_cost: 0 }],
    }));
  };

  const syncCostsWithLastPurchase = () => {
    setForm((current) => ({
      ...current,
      items: applyLastPurchaseToItems(current.items, lastPurchases),
    }));
    setMessage("Custos unitários atualizados com base em Últimas Compras.");
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");

    if (!lastPurchases.length) {
      setMessage("Cadastre insumos em Últimas Compras antes de salvar a precificação.");
      setSaving(false);
      return;
    }

    const hasInvalidItem = form.items.some((item) => !item.name || !findPurchaseByName(item.name, lastPurchases));
    if (hasInvalidItem) {
      setMessage("Todos os insumos devem ser selecionados a partir da lista de Últimas Compras.");
      setSaving(false);
      return;
    }

    try {
      const userId = await getCurrentUserId();
      const payload = {
        ...form,
        directCost: pricing.directCost,
        operationalCost: pricing.operationalCost,
        subtotalCost: pricing.subtotalCost,
        suggestedPrice: pricing.suggestedPrice,
      };

      if (mode === "edit" && procedureId) {
        await updateProcedure(userId, procedureId, payload);
        setMessage("Precificação atualizada com sucesso.");
        router.push(`/procedures/${procedureId}`);
      } else {
        const createdId = await createProcedure(userId, payload);
        setMessage("Precificação salva com sucesso.");
        router.push(`/procedures/${createdId}`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao salvar precificação.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="glass card">Carregando estrutura do app...</div>;
  }

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="glass card procedure-hero-panel">
        <div className="procedure-hero-grid">
          <div className="procedure-copy">
            <div className="badge"><Sparkles size={14} /> {mode === "edit" ? "Editar precificação" : "Nova precificação"}</div>
            <h1 className="heading-lg procedure-title">Construa a precificação com clareza e deixe o sistema calcular o resto.</h1>
            <p className="muted procedure-lead">
              Preencha os dados essenciais do procedimento, selecione insumos a partir de Últimas Compras e acompanhe a formação do preço em tempo real.
            </p>
            <div className="procedure-actions-row">
              <PdfButton data={form} pricing={pricing} userName={userName} />
              <button type="button" className="btn btn-secondary" onClick={syncCostsWithLastPurchase}>
                <RefreshCcw size={16} /> Aplicar Última Compra
              </button>
              <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
                {saving ? "Salvando..." : mode === "edit" ? "Salvar alterações" : "Salvar precificação"}
              </button>
            </div>
            <div className="procedure-shortcuts">
              <Link href="/procedures/new" className="btn btn-secondary">Nova estrutura</Link>
              <Link href="/fixed-costs" className="btn btn-secondary">Ir para Custos Fixos</Link>
              <Link href="/last-purchases" className="btn btn-secondary">Ir para Últimas Compras</Link>
            </div>
            {message ? <div className="badge procedure-message">{message}</div> : null}
          </div>

          <aside className="procedure-summary-card">
            <span className="landing-mini-label">Leitura da precificação</span>
            <h2>{form.name || "Procedimento em construção"}</h2>
            <p className="muted">{form.category || "Defina categoria, tempo clínico e insumos para consolidar o valor sugerido."}</p>

            <div className="procedure-price-emphasis">
              <span>Preço sugerido</span>
              <strong>{currency(pricing.suggestedPrice)}</strong>
            </div>

            <div className="procedure-summary-metrics">
              <div>
                <span>Custo direto</span>
                <strong>{currency(pricing.directCost)}</strong>
              </div>
              <div>
                <span>Custo operacional</span>
                <strong>{currency(pricing.operationalCost)}</strong>
              </div>
              <div>
                <span>Impostos</span>
                <strong>{currency(pricing.taxCost)}</strong>
              </div>
              <div>
                <span>Margem</span>
                <strong>{percent(form.profit_margin)}</strong>
              </div>
            </div>

            <div className="procedure-summary-note">
              <ArrowRight size={16} /> {selectedItems.length} insumo(s) selecionado(s) a partir de Últimas Compras.
            </div>
          </aside>
        </div>
      </section>

      <section className="glass card procedure-step-card">
        <div className="procedure-step-head">
          <div>
            <div className="badge">Etapa 1</div>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>Base de custos do negócio</h2>
            <p className="muted">Esta base vem de Custos Fixos e sustenta automaticamente o valor da sua hora clínica.</p>
          </div>
        </div>
        <div className="grid grid-3" style={{ marginTop: 20 }}>
          <div className="stat procedure-stat-card"><div className="muted">Custos fixos</div><div className="kpi">{currency(pricing.totalFixedCosts)}</div></div>
          <div className="stat procedure-stat-card"><div className="muted">Horas clínicas mensais</div><div className="kpi">{pricing.monthlyClinicalHours}</div></div>
          <div className="stat procedure-stat-card"><div className="muted">Hora clínica</div><div className="kpi">{currency(pricing.costPerClinicalHour)}</div></div>
        </div>
      </section>

      <section className="glass card procedure-step-card">
        <div className="procedure-step-head">
          <div>
            <div className="badge">Etapa 2</div>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>Dados do procedimento</h2>
            <p className="muted">Defina a estrutura principal do serviço para que o cálculo reflita a realidade da execução.</p>
          </div>
        </div>
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <div>
            <label className="label">Nome do procedimento</label>
            <input className="input" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Categoria</label>
            <input className="input" value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))} />
          </div>
          <div>
            <label className="label">Tempo clínico (horas)</label>
            <input className="input" type="number" step="0.1" value={form.clinical_hours} onChange={(e) => setForm((current) => ({ ...current, clinical_hours: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">Alíquota de imposto (%)</label>
            <input className="input" type="number" step="0.1" value={form.tax_rate} onChange={(e) => setForm((current) => ({ ...current, tax_rate: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">Margem de lucro (%)</label>
            <input className="input" type="number" step="0.1" value={form.profit_margin} onChange={(e) => setForm((current) => ({ ...current, profit_margin: Number(e.target.value) }))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Observações</label>
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} />
          </div>
        </div>
      </section>

      <section className="glass card procedure-step-card">
        <div className="procedure-step-head procedure-step-inline">
          <div>
            <div className="badge">Etapa 3</div>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>Insumos do procedimento</h2>
            <p className="muted">Selecione apenas insumos cadastrados em Últimas Compras para manter o custo unitário consistente.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={addMaterial}><Plus size={16} /> Adicionar item</button>
        </div>

        <div className="procedure-table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Unidade</th>
                <th>Quantidade usada</th>
                <th>Custo unitário</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, index) => {
                const purchase = findPurchaseByName(item.name, lastPurchases);
                return (
                  <tr key={`item-${index}`}>
                    <td>
                      <select
                        className="input"
                        value={item.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          const match = findPurchaseByName(newName, lastPurchases);
                          setForm((current) => ({
                            ...current,
                            items: current.items.map((row, idx) =>
                              idx === index
                                ? {
                                    ...row,
                                    name: newName,
                                    unit_cost: match ? Number(match.unit_cost) || 0 : 0,
                                  }
                                : row,
                            ),
                          }));
                        }}
                      >
                        <option value="">Selecione um insumo</option>
                        {lastPurchases.map((row) => (
                          <option key={row.id ?? row.material_name} value={row.material_name}>{row.material_name}</option>
                        ))}
                      </select>
                    </td>
                    <td>{purchase?.unit_measure || "-"}</td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            items: current.items.map((row, idx) => (idx === index ? { ...row, quantity: Number(e.target.value) } : row)),
                          }))
                        }
                      />
                    </td>
                    <td>{currency(item.unit_cost)}</td>
                    <td>{currency(item.quantity * item.unit_cost)}</td>
                    <td>
                      <button type="button" className="btn btn-danger" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, idx) => idx !== index) }))}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass card procedure-step-card procedure-result-card">
        <div className="procedure-step-head">
          <div>
            <div className="badge">Etapa 4</div>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>Formação do preço</h2>
            <p className="muted">Acompanhe abaixo a composição final do valor sugerido para validar se a estratégia está coerente.</p>
          </div>
        </div>
        <div className="procedure-result-grid">
          <div className="stat procedure-result-highlight">
            <div className="muted">Preço sugerido</div>
            <div className="kpi">{currency(pricing.suggestedPrice)}</div>
            <p className="muted">Valor final considerando custo direto, operação, imposto e margem desejada.</p>
          </div>
          <div className="grid grid-2 procedure-result-metrics">
            <div className="stat"><div className="muted">Custo direto</div><div className="kpi">{currency(pricing.directCost)}</div></div>
            <div className="stat"><div className="muted">Custo operacional</div><div className="kpi">{currency(pricing.operationalCost)}</div></div>
            <div className="stat"><div className="muted">Subtotal</div><div className="kpi">{currency(pricing.subtotalCost)}</div></div>
            <div className="stat"><div className="muted">Impostos</div><div className="kpi">{currency(pricing.taxCost)}</div></div>
            <div className="stat"><div className="muted">Margem desejada</div><div className="kpi">{percent(form.profit_margin)}</div></div>
            <div className="stat"><div className="muted">Lucro bruto</div><div className="kpi">{currency(pricing.grossProfitValue)}</div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
