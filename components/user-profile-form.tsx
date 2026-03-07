"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getCurrentUserId, getUserProfile, upsertUserProfile } from "@/lib/data";
import { isValidCpfOrCnpj, isValidPhone } from "@/lib/validators";

type UserProfileFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  onSuccessPath: Route;
};

function isMissingProfileTableError(message: string) {
  return message.includes("public.user_profiles") || message.includes("relation \"user_profiles\"");
}

export function UserProfileForm({ title, description, submitLabel, onSuccessPath }: UserProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    legal_name: "",
    document_number: "",
    contact_phone: "",
  });

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = await getCurrentUserId();
        const profile = await getUserProfile(userId);

        if (profile) {
          setForm({
            legal_name: profile.legal_name,
            document_number: profile.document_number,
            contact_phone: profile.contact_phone,
          });
        } else {
          const supabase = createSupabaseBrowserClient();
          const { data } = await supabase.auth.getUser();
          const metadata = data.user?.user_metadata ?? {};
          setForm((current) => ({
            legal_name: String(metadata.legal_name ?? current.legal_name ?? ""),
            document_number: String(metadata.document_number ?? current.document_number ?? ""),
            contact_phone: String(metadata.contact_phone ?? current.contact_phone ?? ""),
          }));
        }
      } catch (error) {
        const text = error instanceof Error ? error.message : "Não foi possível carregar seus dados.";
        if (isMissingProfileTableError(text)) {
          setAllowSkip(true);
          setMessage("Tabela user_profiles não encontrada no Supabase. Você pode continuar e criar a tabela depois.");
        } else {
          setMessage(text);
        }
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!isValidCpfOrCnpj(form.document_number)) {
      setMessage("CPF ou CNPJ inválido. Confira os números informados.");
      setSaving(false);
      return;
    }

    if (!isValidPhone(form.contact_phone)) {
      setMessage("Telefone inválido. Informe DDD + número.");
      setSaving(false);
      return;
    }

    try {
      const userId = await getCurrentUserId();
      await upsertUserProfile(userId, form);
      router.push(onSuccessPath);
      router.refresh();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Não foi possível salvar seus dados.";
      if (isMissingProfileTableError(text)) {
        setAllowSkip(true);
        setMessage("Tabela user_profiles não encontrada no Supabase. Clique em continuar para usar o sistema e aplique o SQL depois.");
      } else {
        setMessage(text);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="glass card">Carregando cadastro...</div>;
  }

  return (
    <div className="glass card">
      <div className="badge">Cadastro</div>
      <h1 className="heading-lg">{title}</h1>
      <p className="muted">{description}</p>

      <form className="grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
        <div>
          <label className="label">Nome ou Razão Social</label>
          <input
            className="input"
            value={form.legal_name}
            onChange={(e) => setForm((current) => ({ ...current, legal_name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">CPF ou CNPJ</label>
          <input
            className="input"
            value={form.document_number}
            onChange={(e) => setForm((current) => ({ ...current, document_number: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">Telefone de contato</label>
          <input
            className="input"
            value={form.contact_phone}
            onChange={(e) => setForm((current) => ({ ...current, contact_phone: e.target.value }))}
            required
          />
        </div>

        {message ? <div className="badge">{message}</div> : null}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Salvando..." : submitLabel}
        </button>

        {allowSkip ? (
          <button type="button" className="btn btn-secondary" onClick={() => router.push(onSuccessPath)}>
            Continuar sem cadastro
          </button>
        ) : null}
      </form>
    </div>
  );
}
