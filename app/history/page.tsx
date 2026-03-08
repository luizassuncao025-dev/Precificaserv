"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { formatDateTime } from "@/components/format";
import { PageShell } from "@/components/page-shell";
import { currency, percent } from "@/lib/calculator";
import { deleteProcedure, getCurrentUserId, getProcedure, listProcedures } from "@/lib/data";
import { ProcedureRecord } from "@/lib/types";

export default function HistoryPage() {
  const [rows, setRows] = useState<ProcedureRecord[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsById, setDetailsById] = useState<Record<string, ProcedureRecord>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const procedures = await listProcedures(userId);
        setRows(procedures);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Falha ao carregar histórico.");
      }
    }
    bootstrap();
  }, []);

  const filtered = useMemo(
    () => rows.filter((row) => `${row.name} ${row.category ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [rows, query],
  );

  const onToggleDetails = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    if (detailsById[id]) return;

    try {
      setLoadingDetailsId(id);
      const userId = await getCurrentUserId();
      const details = await getProcedure(userId, id);
      if (details) {
        setDetailsById((current) => ({ ...current, [id]: details }));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao carregar detalhes.");
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm("Deseja realmente excluir esta precificação?");
    if (!confirmed) return;

    try {
      const userId = await getCurrentUserId();
      await deleteProcedure(userId, id);
      setRows((current) => current.filter((row) => row.id !== id));
      setDetailsById((current) => {
        const copy = { ...current };
        delete copy[id];
        return copy;
      });
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao excluir precificação.");
    }
  };

  return (
    <AuthGuard>
      <PageShell>
        <div className="grid" style={{ gap: 24 }}>
          <div className="glass card">
            <div className="badge">Histórico de precificações</div>
            <h1 className="heading-lg">Todos os procedimentos salvos</h1>
            <input className="input" placeholder="Buscar por nome ou categoria" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginTop: 16 }} />
          </div>

          {message ? <div className="glass card">{message}</div> : null}

          <div className="glass card">
            {filtered.length === 0 ? (
              <div className="empty-state">Nenhuma precificação encontrada.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Procedimento</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Tempo clínico</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const expanded = expandedId === row.id;
                      const details = detailsById[row.id];

                      return (
                        <Fragment key={row.id}>
                          <tr>
                            <td>{row.name}</td>
                            <td>{row.category ?? "-"}</td>
                            <td>{currency(row.suggested_price)}</td>
                            <td>{row.clinical_hours} h</td>
                            <td>{formatDateTime(row.updated_at)}</td>
                            <td>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => onToggleDetails(row.id)}>
                                  {expanded ? "Fechar" : "Detalhes"}
                                </button>
                                <Link href={`/procedures/${row.id}/edit`} className="btn btn-secondary">Editar</Link>
                                <button type="button" className="btn btn-danger" onClick={() => onDelete(row.id)}>Excluir</button>
                              </div>
                            </td>
                          </tr>

                          {expanded ? (
                            <tr>
                              <td colSpan={6}>
                                {loadingDetailsId === row.id ? (
                                  <div className="empty-state">Carregando detalhes...</div>
                                ) : details ? (
                                  <div className="grid" style={{ gap: 12 }}>
                                    <div className="grid grid-4">
                                      <div className="stat"><div className="muted">Custo direto</div><div className="kpi">{currency(details.direct_cost)}</div></div>
                                      <div className="stat"><div className="muted">Custo operacional</div><div className="kpi">{currency(details.operational_cost)}</div></div>
                                      <div className="stat"><div className="muted">Imposto</div><div className="kpi">{percent(details.tax_rate)}</div></div>
                                      <div className="stat"><div className="muted">Margem</div><div className="kpi">{percent(details.profit_margin)}</div></div>
                                    </div>

                                    <div className="table-wrap">
                                      <table>
                                        <thead>
                                          <tr>
                                            <th>Insumo</th>
                                            <th>Quantidade</th>
                                            <th>Custo unitário</th>
                                            <th>Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(details.procedure_items ?? []).map((item) => (
                                            <tr key={item.id ?? `${item.name}-${item.quantity}`}>
                                              <td>{item.name}</td>
                                              <td>{item.quantity}</td>
                                              <td>{currency(item.unit_cost)}</td>
                                              <td>{currency(Number(item.quantity) * Number(item.unit_cost))}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="empty-state">Detalhes não encontrados.</div>
                                )}
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
