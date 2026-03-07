"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { formatDateTime } from "@/components/format";
import { PageShell } from "@/components/page-shell";
import { currency } from "@/lib/calculator";
import { getCurrentUserId, getUserProfile, listProcedures } from "@/lib/data";
import { ProcedureRecord } from "@/lib/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const [rows, setRows] = useState<ProcedureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("Profissional");

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const [procedures, profile] = await Promise.all([listProcedures(userId), getUserProfile(userId)]);
        setRows(procedures);
        if (profile?.legal_name) setUserName(profile.legal_name);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Falha ao carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const metrics = useMemo(() => {
    const totalProcedures = rows.length;
    const avgPrice = totalProcedures ? rows.reduce((acc, item) => acc + item.suggested_price, 0) / totalProcedures : 0;
    const avgMargin = totalProcedures ? rows.reduce((acc, item) => acc + item.profit_margin, 0) / totalProcedures : 0;
    return {
      totalProcedures,
      avgPrice,
      avgMargin,
      latest: rows[0],
    };
  }, [rows]);

  return (
    <AuthGuard>
      <PageShell>
        <div className="grid dashboard-grid" style={{ gap: 24 }}>
          <div className="glass card hero-surface">
            <div className="badge">Painel principal</div>
            <h1 className="heading-lg">{getGreeting()}, {userName}.</h1>
            <p className="muted" style={{ fontSize: 18 }}>
              Este sistema transforma custos em estratégia: você descobre o preço ideal de cada procedimento,
              protege sua margem e aumenta a previsibilidade de lucro com decisões baseadas em dados.
            </p>
            <div className="dashboard-actions" style={{ marginTop: 10 }}>
              <Link href="/procedures/new" className="btn btn-primary">Nova Precificação <ArrowRight size={16} /></Link>
              <Link href="/fixed-costs" className="btn btn-secondary">Configurar custos fixos</Link>
              <Link href="/last-purchases" className="btn btn-secondary">Atualizar últimas compras</Link>
            </div>
          </div>

          {message ? <div className="glass card">{message}</div> : null}

          <div className="grid grid-4">
            <div className="stat"><div className="muted">Precificações cadastradas</div><div className="kpi">{metrics.totalProcedures}</div></div>
            <div className="stat"><div className="muted">Preço médio</div><div className="kpi">{currency(metrics.avgPrice)}</div></div>
            <div className="stat"><div className="muted">Margem média</div><div className="kpi">{metrics.avgMargin.toFixed(1)}%</div></div>
            <div className="stat"><div className="muted">Última precificação</div><div className="kpi" style={{ fontSize: 22 }}>{metrics.latest?.name ?? "-"}</div></div>
          </div>

          <div className="glass card">
            <div className="dashboard-section-head">
              <div>
                <h2 className="heading-lg">Últimas precificações</h2>
                <p className="muted">Reabra, compare e refine seus procedimentos em poucos cliques.</p>
              </div>
              <Link href="/procedures/new" className="btn btn-primary">Precificação: Novo Procedimento <ArrowRight size={16} /></Link>
            </div>

            {loading ? (
              <div className="empty-state" style={{ marginTop: 16 }}>Carregando histórico...</div>
            ) : rows.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 16 }}>Ainda não existem precificações salvas.</div>
            ) : (
              <div className="table-wrap dashboard-table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Procedimento</th>
                      <th>Categoria</th>
                      <th>Preço sugerido</th>
                      <th>Atualizado em</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.category ?? "-"}</td>
                        <td>{currency(row.suggested_price)}</td>
                        <td>{formatDateTime(row.updated_at)}</td>
                        <td><Link href={`/procedures/${row.id}`} className="btn btn-secondary">Abrir</Link></td>
                      </tr>
                    ))}
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
