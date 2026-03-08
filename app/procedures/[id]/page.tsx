"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { PageShell } from "@/components/page-shell";
import { currency, percent } from "@/lib/calculator";
import { getCurrentUserId, getProcedure } from "@/lib/data";
import { ProcedureRecord } from "@/lib/types";

export default function ProcedureDetailsPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<ProcedureRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const data = await getProcedure(userId, params.id);
        if (!data) {
          setMessage("Precificação não encontrada.");
        } else {
          setRecord(data);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Falha ao carregar detalhes.");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) bootstrap();
  }, [params?.id]);

  const totalItems = useMemo(
    () => (record?.procedure_items ?? []).reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_cost), 0),
    [record],
  );

  return (
    <AuthGuard>
      <PageShell>
        <div className="grid" style={{ gap: 24 }}>
          <div className="glass card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div className="badge">Detalhes da precificação</div>
                <h1 className="heading-lg" style={{ marginTop: 12 }}>{record?.name ?? "Procedimento"}</h1>
                <p className="muted">{record?.category ?? "Sem categoria"}</p>
              </div>
              {params?.id ? <Link href={`/procedures/${params.id}/edit`} className="btn btn-primary">Editar</Link> : null}
            </div>
          </div>

          {loading ? <div className="glass card">Carregando...</div> : null}
          {message ? <div className="glass card">{message}</div> : null}

          {record ? (
            <>
              <div className="glass card">
                <h2 className="heading-lg">Formação de preço</h2>
                <div className="grid grid-2" style={{ marginTop: 16 }}>
                  <div className="stat"><div className="muted">Custo direto</div><div className="kpi">{currency(record.direct_cost)}</div></div>
                  <div className="stat"><div className="muted">Custo operacional</div><div className="kpi">{currency(record.operational_cost)}</div></div>
                  <div className="stat"><div className="muted">Subtotal</div><div className="kpi">{currency(record.subtotal_cost)}</div></div>
                  <div className="stat"><div className="muted">Preço sugerido</div><div className="kpi">{currency(record.suggested_price)}</div></div>
                  <div className="stat"><div className="muted">Imposto</div><div className="kpi">{percent(record.tax_rate)}</div></div>
                  <div className="stat"><div className="muted">Margem</div><div className="kpi">{percent(record.profit_margin)}</div></div>
                </div>
              </div>

              <div className="glass card">
                <h2 className="heading-lg">Insumos</h2>
                <p className="muted">Total de insumos: {currency(totalItems)}</p>
                <div className="table-wrap" style={{ marginTop: 12 }}>
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
                      {(record.procedure_items ?? []).map((item) => (
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
            </>
          ) : null}
        </div>
      </PageShell>
    </AuthGuard>
  );
}
