"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { PageShell } from "@/components/page-shell";
import { currency } from "@/lib/calculator";
import { formatBrlInput, parseBrlInput } from "@/lib/brl";
import { getCurrentUserId, loadSettings, saveSettings } from "@/lib/data";
import { ClinicSettings, FixedCost } from "@/lib/types";

export default function FixedCostsPage() {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({ worked_days: 22, clinical_hours_per_day: 8 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const data = await loadSettings(userId);
        setFixedCosts(data.fixedCosts);
        setClinicSettings(data.clinicSettings);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Falha ao carregar custos fixos.");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const totals = useMemo(() => {
    const totalFixedCosts = fixedCosts.reduce((sum, row) => sum + (Number(row.monthly_value) || 0), 0);
    const monthlyHours = (Number(clinicSettings.worked_days) || 0) * (Number(clinicSettings.clinical_hours_per_day) || 0);
    const hourly = monthlyHours > 0 ? totalFixedCosts / monthlyHours : 0;
    return { totalFixedCosts, monthlyHours, hourly };
  }, [clinicSettings, fixedCosts]);

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const userId = await getCurrentUserId();
      await saveSettings(userId, fixedCosts, clinicSettings);
      setMessage("Custos fixos salvos com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar os custos fixos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="glass card">Carregando custos fixos...</div>
        </PageShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="grid" style={{ gap: 24 }}>
          <div className="glass card">
            <div className="badge">Base da precificação</div>
            <h1 className="heading-lg">Custos Fixos Gerais</h1>
            <p className="muted">Custo fixo é todo gasto que não muda conforme o volume de produção ou vendas da empresa.</p>
            <p className="muted">Informe apenas os custos reais da sua operação para que todas as novas precificações usem a mesma base de cálculo automaticamente.</p>
            <p className="muted" style={{ marginTop: 8 }}>
              Exemplos: pró-labore, aluguel, condomínio, energia elétrica, água, internet, telefone, contabilidade,
              manutenção de equipamentos, recepção, esterilização, marketing e software.
            </p>
          </div>

          {message ? <div className="glass card">{message}</div> : null}

          <section className="glass card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 className="heading-lg">Lista de custos fixos</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFixedCosts((rows) => [...rows, { label: "", monthly_value: 0 }])}
              >
                <Plus size={16} /> Adicionar custo
              </button>
            </div>

            <div className="grid" style={{ marginTop: 16 }}>
              {fixedCosts.length === 0 ? (
                <div className="empty-state">
                  Nenhum custo fixo informado ainda. Clique em <strong>Adicionar custo</strong> para começar.
                </div>
              ) : null}

              {fixedCosts.map((cost, index) => (
                <div key={cost.id ?? `cost-${index}`} className="grid grid-2">
                  <input
                    className="input"
                    placeholder="Ex.: Aluguel"
                    value={cost.label}
                    onChange={(e) =>
                      setFixedCosts((rows) => rows.map((row, idx) => (idx === index ? { ...row, label: e.target.value } : row)))
                    }
                  />
                  <div style={{ display: "flex", gap: 12 }}>
                    <input
                      className="input"
                      type="text"
                      inputMode="decimal"
                      value={formatBrlInput(cost.monthly_value)}
                      onChange={(e) =>
                        setFixedCosts((rows) =>
                          rows.map((row, idx) => (idx === index ? { ...row, monthly_value: parseBrlInput(e.target.value) } : row)),
                        )
                      }
                    />
                    <button type="button" className="btn btn-danger" onClick={() => setFixedCosts((rows) => rows.filter((_, idx) => idx !== index))}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass card">
            <h2 className="heading-lg">Parâmetros de hora clínica</h2>
            <div className="grid grid-2" style={{ marginTop: 16 }}>
              <div>
                <label className="label">Dias trabalhados no mês</label>
                <input
                  className="input"
                  type="number"
                  value={clinicSettings.worked_days}
                  onChange={(e) => setClinicSettings((current) => ({ ...current, worked_days: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="label">Horas clínicas por dia</label>
                <input
                  className="input"
                  type="number"
                  value={clinicSettings.clinical_hours_per_day}
                  onChange={(e) => setClinicSettings((current) => ({ ...current, clinical_hours_per_day: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-3" style={{ marginTop: 20 }}>
              <div className="stat"><div className="muted">Custos fixos</div><div className="kpi">{currency(totals.totalFixedCosts)}</div></div>
              <div className="stat"><div className="muted">Horas clínicas mensais</div><div className="kpi">{totals.monthlyHours}</div></div>
              <div className="stat"><div className="muted">Hora clínica</div><div className="kpi">{currency(totals.hourly)}</div></div>
            </div>
          </section>

          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar custos fixos"}
          </button>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
