"use client";

import { AuthGuard } from "@/components/auth-guard";
import { UserProfileForm } from "@/components/user-profile-form";

export default function OnboardingPage() {
  return (
    <AuthGuard requireProfile={false}>
      <div className="shell">
        <div className="container" style={{ maxWidth: 700 }}>
          <UserProfileForm
            title="Complete seu cadastro para iniciar"
            description="Esses dados permitem personalizar sua experiência e montar uma saudação com o nome da sua clínica." 
            submitLabel="Concluir primeiro acesso"
            onSuccessPath="/dashboard"
          />
        </div>
      </div>
    </AuthGuard>
  );
}


