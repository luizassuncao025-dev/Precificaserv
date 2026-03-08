"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { AuthGuard } from "@/components/auth-guard";
import { upsertUserProfile } from "@/lib/data";
import { isValidCpfOrCnpj, isValidPhone } from "@/lib/validators";

const ACCESS_COUPON = "dozeroahof";

function isMissingProfileTableError(message: string) {
  return message.includes("public.user_profiles") || message.includes("relation \"user_profiles\"");
}

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [legalName, setLegalName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [accessCoupon, setAccessCoupon] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "register") {
      setMode("register");
    }
  }, []);

  const onForgotPassword = async () => {
    if (!email) {
      setMessage("Informe seu e-mail para recuperar a senha.");
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setMessage("Enviamos um link de recuperação de senha para o seu e-mail.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível solicitar a recuperação de senha.");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "register") {
        if (!isValidCpfOrCnpj(documentNumber)) {
          setMessage("CPF ou CNPJ inválido.");
          setLoading(false);
          return;
        }

        if (!isValidPhone(contactPhone)) {
          setMessage("Telefone inválido. Informe DDD + número.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setMessage("A senha precisa ter no mínimo 6 caracteres.");
          setLoading(false);
          return;
        }

        if (accessCoupon.trim().toLowerCase() !== ACCESS_COUPON) {
          setMessage("Cupom de acesso inválido.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              legal_name: legalName,
              document_number: documentNumber,
              contact_phone: contactPhone,
              access_coupon: accessCoupon.trim().toLowerCase(),
            },
          },
        });

        if (error) throw error;

        if (data.user && data.session) {
          try {
            await upsertUserProfile(data.user.id, {
              legal_name: legalName,
              document_number: documentNumber,
              contact_phone: contactPhone,
            });
          } catch (profileError) {
            const profileMessage = profileError instanceof Error ? profileError.message : "";
            if (!isMissingProfileTableError(profileMessage)) {
              throw profileError;
            }
          }

          router.push("/dashboard");
          return;
        }

        setMessage("Cadastro realizado. Confirme seu e-mail e depois faça login.");
        setMode("login");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requireProfile={false}>
      <div className="shell">
        <div className="container" style={{ maxWidth: 620 }}>
          <div className="glass card">
            <div className="badge">Precifica Serv Pro</div>
            <h1 className="heading-lg">Acesse sua conta ou realize seu cadastro</h1>
            <p className="muted">Cadastro com dados completos para personalizar a plataforma desde o primeiro acesso.</p>

            <div className="grid grid-2" style={{ marginTop: 20 }}>
              <button type="button" className={mode === "login" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setMode("login")}>
                Login
              </button>
              <button type="button" className={mode === "register" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setMode("register")}>
                Realizar cadastro
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid" style={{ marginTop: 24 }}>
              {mode === "register" ? (
                <>
                  <div>
                    <label className="label">Nome ou Razão Social</label>
                    <input className="input" value={legalName} onChange={(e) => setLegalName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">CPF ou CNPJ</label>
                    <input className="input" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Telefone</label>
                    <input className="input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Cupom de acesso</label>
                    <input className="input" value={accessCoupon} onChange={(e) => setAccessCoupon(e.target.value)} required />
                  </div>
                </>
              ) : null}

              <div>
                <label className="label">E-mail</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div>
                <label className="label">Senha</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {message ? <div className="badge" style={{ justifyContent: "center" }}>{message}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
              </button>
            </form>

            {mode === "login" ? (
              <button type="button" className="btn btn-secondary" style={{ width: "100%", marginTop: 12 }} onClick={onForgotPassword}>
                Esqueci minha senha
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
