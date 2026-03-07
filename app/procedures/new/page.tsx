"use client";

import { AuthGuard } from "@/components/auth-guard";
import { PageShell } from "@/components/page-shell";
import { ProcedureForm } from "@/components/procedure-form";

export default function NewProcedurePage() {
  return (
    <AuthGuard>
      <PageShell>
        <ProcedureForm />
      </PageShell>
    </AuthGuard>
  );
}
