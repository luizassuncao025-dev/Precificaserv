"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { PageShell } from "@/components/page-shell";
import { currency } from "@/lib/calculator";
import { formatBrlInput, parseBrlInput } from "@/lib/brl";
import { getCurrentUserId, loadLastPurchases, saveLastPurchases } from "@/lib/data";
import { LastPurchase } from "@/lib/types";

function toUnitCost(row: LastPurchase) {
  return row.quantity_total > 0 ? row.total_value / row.quantity_total : 0;
}

export default function LastPurchasesPage() {
  const [rows, setRows] = useState<LastPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const loaded = await loadLastPurchases(userId);
        setRows(loaded);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar as últimas compras.");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const addRow = () => {
    setRows((current) => [
      ...current,
      { material_name: "", unit_measure: "un", quantity_total: 0, total_value: 0, unit_cost: 0 },
    ]);
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const userId = await getCurrentUserId();
      await saveLastPurchases(userId, rows.map((row) => ({ ...row, unit_cost: toUnitCost(row) })));
      setMessage("Últimas compras salvas com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar as últimas compras.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="glass card">Carregando últimas compras...</div>
        </PageShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="grid" style={{ gap: 24 }}>
          <div className="glass card">
            <div className="badge">Base de insumos</div>
            <h1 className="heading-lg">Últimas Compras</h1>
            <p className="muted">Cadastre aqui suas aquisições de insumos. O custo unitário será calculado automaticamente por quantidade total e valor total.</p>
            <p className="muted">Lembrete: confira sempre o fator de conversão do insumo (ex.: caixa, ml, unidade) antes de usar na precificação.</p>
          </div>

          {message ? <div className="glass card">{message}</div> : null}

          <section className="glass card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h2 className="heading-lg">Cadastro de compras</h2>
              <button type="button" className="btn btn-secondary" onClick={addRow}>
                <Plus size={16} /> Nova compra
              </button>
            </div>

            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Nome do produto</th>
                    <th>Unidade</th>
                    <th>Quantidade total</th>
                    <th>Valor total (R$)</th>
                    <th>Custo unitário</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6}><div className="empty-state">Nenhuma compra cadastrada ainda.</div></td>
                    </tr>
                  ) : (
                    rows.map((row, index) => {
                      const unitCost = toUnitCost(row);
                      return (
                        <tr key={row.id ?? `purchase-${index}`}>
                          <td>
                            <input
                              className="input"
                              value={row.material_name}
                              onChange={(e) =>
                                setRows((current) => current.map((item, idx) => (idx === index ? { ...item, material_name: e.target.value } : item)))
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              value={row.unit_measure}
                              onChange={(e) =>
                                setRows((current) => current.map((item, idx) => (idx === index ? { ...item, unit_measure: e.target.value } : item)))
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              type="number"
                              step="0.01"
                              value={row.quantity_total}
                              onChange={(e) =>
                                setRows((current) => current.map((item, idx) => (idx === index ? { ...item, quantity_total: Number(e.target.value) } : item)))
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              type="text"
                              inputMode="decimal"
                              value={formatBrlInput(row.total_value)}
                              onChange={(e) =>
                                setRows((current) => current.map((item, idx) => (idx === index ? { ...item, total_value: parseBrlInput(e.target.value) } : item)))
                              }
                            />
                          </td>
                          <td>
                            <div className="stat" style={{ padding: 10 }}>{currency(unitCost)}</div>
                          </td>
                          <td>
                            <button type="button" className="btn btn-danger" onClick={() => setRows((current) => current.filter((_, idx) => idx !== index))}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar últimas compras"}
          </button>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
