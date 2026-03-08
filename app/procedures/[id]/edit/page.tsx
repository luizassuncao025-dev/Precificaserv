"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { PageShell } from "@/components/page-shell";
import { ProcedureForm } from "@/components/procedure-form";
import { getCurrentUserId, getProcedure } from "@/lib/data";
import { ProcedureFormData } from "@/lib/types";

function toFormData(record: Awaited<ReturnType<typeof getProcedure>>): ProcedureFormData | null {
  if (!record) return null;
  return {
    name: record.name,
    category: record.category ?? "",
    notes: record.notes ?? "",
    clinical_hours: Number(record.clinical_hours) || 0,
    tax_rate: Number(record.tax_rate) || 0,
    profit_margin: Number(record.profit_margin) || 0,
    items: record.procedure_items?.length
      ? record.procedure_items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: Number(item.quantity) || 0,
          unit_cost: Number(item.unit_cost) || 0,
        }))
      : [{ name: "", quantity: 0, unit_cost: 0 }],
  };
}

export default function EditProcedurePage() {
  const params = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<ProcedureFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const record = await getProcedure(userId, params.id);
        const formData = toFormData(record);

        if (!formData) {
          setMessage("Precificação não encontrada.");
        } else {
          setInitialData(formData);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Falha ao carregar precificação para edição.");
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) bootstrap();
  }, [params?.id]);

  return (
    <AuthGuard>
      <PageShell>
        {loading ? <div className="glass card">Carregando precificação...</div> : null}
        {message ? <div className="glass card">{message}</div> : null}
        {!loading && initialData && params?.id ? (
          <ProcedureForm mode="edit" procedureId={params.id} initialData={initialData} />
        ) : null}
      </PageShell>
    </AuthGuard>
  );
}
