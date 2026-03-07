"use client";

import { AuthGuard } from "@/components/auth-guard";
import { PageShell } from "@/components/page-shell";
import { UserProfileForm } from "@/components/user-profile-form";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <PageShell>
        <UserProfileForm
          title="Informações do Usuário"
          description="Atualize nome/razão social, CPF/CNPJ e telefone sempre que precisar."
          submitLabel="Salvar informações"
          onSuccessPath="/dashboard"
        />
      </PageShell>
    </AuthGuard>
  );
}
