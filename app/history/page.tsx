"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth-guard";
import { formatDateTime } from "@/components/format";
import { PageShell } from "@/components/page-shell";
import { currency } from "@/lib/calculator";
import { getCurrentUserId, listProcedures } from "@/lib/data";
import { ProcedureRecord } from "@/lib/types";

export default function HistoryPage() {
  const [rows, setRows] = useState<ProcedureRecord[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function bootstrap() {
      const userId = await getCurrentUserId();
      const procedures = await listProcedures(userId);
      setRows(procedures);
    }
    bootstrap();
  }, []);

  const filtered = useMemo(
    () => rows.filter((row) => `${row.name} ${row.category ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [rows, query],
  );

  return (
    <AuthGuard>
      <PageShell>
        <div className="grid" style={{ gap: 24 }}>
          <div className="glass card">
            <div className="badge">Histórico de precificações</div>
            <h1 className="heading-lg">Todos os procedimentos salvos</h1>
            <input className="input" placeholder="Buscar por nome ou categoria" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginTop: 16 }} />
          </div>

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
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.category ?? "-"}</td>
                        <td>{currency(row.suggested_price)}</td>
                        <td>{row.clinical_hours} h</td>
                        <td>{formatDateTime(row.updated_at)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <Link href={`/procedures/${row.id}`} className="btn btn-secondary">Detalhes</Link>
                            <Link href={`/procedures/${row.id}/edit`} className="btn btn-secondary">Editar</Link>
                          </div>
                        </td>
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
