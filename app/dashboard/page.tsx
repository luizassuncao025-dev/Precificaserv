"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, ChartColumnBig, Clock3, Sparkles, Target, Wallet } from "lucide-react";
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
    const highest = rows.reduce<ProcedureRecord | null>((best, item) => {
      if (!best || item.suggested_price > best.suggested_price) return item;
      return best;
    }, null);
    const latest = rows[0] ?? null;
    const recent = rows.slice(0, 6);
    const maxRecentPrice = recent.length ? Math.max(...recent.map((item) => Number(item.suggested_price) || 0)) : 0;

    return {
      totalProcedures,
      avgPrice,
      avgMargin,
      highest,
      latest,
      recent,
      maxRecentPrice,
    };
  }, [rows]);

  const spotlight = useMemo(() => {
    if (!rows.length) {
      return {
        title: "Estruture sua primeira precificação",
        description: "Cadastre custos fixos, atualize últimas compras e gere a primeira formação de preço com base real.",
      };
    }

    if (metrics.avgMargin < 30) {
      return {
        title: "Sua margem média merece atenção",
        description: "Revisar imposto, custo direto e tempo clínico pode abrir espaço para um preço final mais saudável.",
      };
    }

    return {
      title: "Sua operação já tem base para crescer com controle",
      description: "Use o histórico para comparar procedimentos, revisar margens e identificar os serviços mais estratégicos.",
    };
  }, [metrics.avgMargin, rows.length]);

  return (
    <AuthGuard>
      <PageShell>
        <div className="grid dashboard-grid" style={{ gap: 24 }}>
          <section className="glass card dashboard-hero-panel">
            <div className="dashboard-hero-grid">
              <div className="dashboard-copy">
                <div className="badge">
                  <Sparkles size={14} /> Painel principal
                </div>
                <h1 className="heading-lg dashboard-title">{getGreeting()}, {userName}.</h1>
                <p className="muted dashboard-lead">
                  Este painel consolida a saúde da sua precificação. Aqui você acompanha valor médio, margem, procedimentos
                  recentes e sinais que ajudam a decidir com mais segurança.
                </p>
                <div className="dashboard-actions" style={{ marginTop: 10 }}>
                  <Link href="/procedures/new" className="btn btn-primary">Nova Precificação <ArrowRight size={16} /></Link>
                  <Link href="/fixed-costs" className="btn btn-secondary">Configurar custos fixos</Link>
                  <Link href="/last-purchases" className="btn btn-secondary">Atualizar últimas compras</Link>
                </div>
              </div>

              <div className="dashboard-focus-card">
                <span className="landing-mini-label">Leitura rápida</span>
                <h2>{spotlight.title}</h2>
                <p className="muted">{spotlight.description}</p>
                <div className="dashboard-focus-grid">
                  <div>
                    <span>Precificações</span>
                    <strong>{metrics.totalProcedures}</strong>
                  </div>
                  <div>
                    <span>Preço médio</span>
                    <strong>{currency(metrics.avgPrice)}</strong>
                  </div>
                  <div>
                    <span>Margem média</span>
                    <strong>{metrics.avgMargin.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {message ? <div className="glass card">{message}</div> : null}

          <section className="dashboard-kpi-grid">
            <div className="stat dashboard-kpi-card accent-gold">
              <div className="dashboard-kpi-head"><BadgeDollarSign size={18} /><span>Preço médio sugerido</span></div>
              <div className="kpi">{currency(metrics.avgPrice)}</div>
              <p className="muted">Média das precificações cadastradas até agora.</p>
            </div>
            <div className="stat dashboard-kpi-card accent-green">
              <div className="dashboard-kpi-head"><Target size={18} /><span>Margem média</span></div>
              <div className="kpi">{metrics.avgMargin.toFixed(1)}%</div>
              <p className="muted">Leitura da margem desejada utilizada nas suas precificações.</p>
            </div>
            <div className="stat dashboard-kpi-card accent-blue">
              <div className="dashboard-kpi-head"><ChartColumnBig size={18} /><span>Maior preço sugerido</span></div>
              <div className="kpi dashboard-kpi-small">{metrics.highest ? currency(metrics.highest.suggested_price) : "-"}</div>
              <p className="muted">{metrics.highest ? metrics.highest.name : "Cadastre precificações para comparar resultados."}</p>
            </div>
            <div className="stat dashboard-kpi-card accent-neutral">
              <div className="dashboard-kpi-head"><Clock3 size={18} /><span>Última atualização</span></div>
              <div className="kpi dashboard-kpi-small">{metrics.latest ? metrics.latest.name : "-"}</div>
              <p className="muted">{metrics.latest ? formatDateTime(metrics.latest.updated_at) : "Ainda sem movimentação registrada."}</p>
            </div>
          </section>

          <section className="dashboard-split-grid">
            <div className="glass card dashboard-chart-card">
              <div className="dashboard-section-head">
                <div>
                  <div className="badge">Visão dos últimos registros</div>
                  <h2 className="heading-lg" style={{ marginTop: 12 }}>Evolução recente de preço sugerido</h2>
                  <p className="muted">Cada barra representa uma das últimas precificações salvas.</p>
                </div>
              </div>

              {loading ? (
                <div className="empty-state" style={{ marginTop: 16 }}>Carregando histórico...</div>
              ) : metrics.recent.length === 0 ? (
                <div className="empty-state" style={{ marginTop: 16 }}>Cadastre a primeira precificação para visualizar este painel.</div>
              ) : (
                <div className="dashboard-bars" style={{ marginTop: 20 }}>
                  {metrics.recent.map((row) => {
                    const ratio = metrics.maxRecentPrice > 0 ? Math.max((row.suggested_price / metrics.maxRecentPrice) * 100, 14) : 14;
                    return (
                      <div key={row.id} className="dashboard-bar-row">
                        <div className="dashboard-bar-copy">
                          <strong>{row.name}</strong>
                          <span>{row.category ?? "Sem categoria"}</span>
                        </div>
                        <div className="dashboard-bar-track">
                          <div className="dashboard-bar-fill" style={{ width: `${ratio}%` }} />
                        </div>
                        <div className="dashboard-bar-value">{currency(row.suggested_price)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass card dashboard-insights-card">
              <div className="badge">Resumo estratégico</div>
              <h2 className="heading-lg" style={{ marginTop: 12 }}>Pontos para acompanhar na rotina</h2>
              <div className="dashboard-insights-list">
                <div className="dashboard-insight-row">
                  <Wallet size={18} />
                  <div>
                    <strong>Base financeira</strong>
                    <p className="muted">Custos fixos bem atualizados elevam a confiança no valor da hora clínica.</p>
                  </div>
                </div>
                <div className="dashboard-insight-row">
                  <ChartColumnBig size={18} />
                  <div>
                    <strong>Comparação entre procedimentos</strong>
                    <p className="muted">O histórico ajuda a identificar quais serviços sustentam melhor a margem desejada.</p>
                  </div>
                </div>
                <div className="dashboard-insight-row">
                  <Clock3 size={18} />
                  <div>
                    <strong>Atualização constante</strong>
                    <p className="muted">Últimas compras atualizadas evitam preço sugerido defasado por custo antigo.</p>
                  </div>
                </div>
              </div>
              <div className="dashboard-secondary-actions">
                <Link href="/history" className="btn btn-secondary">Abrir histórico</Link>
                <Link href="/profile" className="btn btn-secondary">Dados do usuário</Link>
              </div>
            </div>
          </section>

          <div className="glass card">
            <div className="dashboard-section-head">
              <div>
                <div className="badge">Histórico recente</div>
                <h2 className="heading-lg" style={{ marginTop: 12 }}>Últimas precificações</h2>
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
