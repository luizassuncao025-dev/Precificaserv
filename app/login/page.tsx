"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, HeartPulse, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { AuthGuard } from "@/components/auth-guard";
import { upsertUserProfile } from "@/lib/data";
import { isValidCpfOrCnpj, isValidPhone } from "@/lib/validators";

const ACCESS_COUPON = "dozeroahof";
const homeHref = "/" as Route;

const proofItems = [
  "Preço sugerido com base em custos reais",
  "Formação do preço com imposto, margem e operação",
  "Histórico de precificações para revisar decisões",
];

function isMissingProfileTableError(message: string) {
  return message.includes("public.user_profiles") || message.includes('relation "user_profiles"');
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
      <div className="shell auth-shell">
        <div className="container auth-layout">
          <section className="glass card auth-visual-panel">
            <Link href={homeHref} className="auth-back-link">Voltar para apresentação</Link>
            <div className="badge">
              <Sparkles size={16} /> Motor de Rentabilidade Clínica™
            </div>
            <h1 className="heading-lg auth-title">
              Entre para transformar precificação clínica em clareza, segurança e lucro.
            </h1>
            <p className="muted auth-lead">
              Acesse sua conta para continuar sua gestão ou crie seu acesso para começar a calcular preços com base em custos reais e margem desejada.
            </p>

            <div className="auth-highlight-panel">
              <div className="auth-highlight-card main">
                <span className="landing-mini-label">Visão executiva</span>
                <strong>Preço ideal por procedimento</strong>
                <p>Veja a composição completa do valor sugerido antes de salvar sua decisão.</p>
              </div>
              <div className="auth-mini-metrics">
                <div>
                  <span>Margem protegida</span>
                  <strong>45,0%</strong>
                </div>
                <div>
                  <span>Custo real</span>
                  <strong>R$ 412,70</strong>
                </div>
                <div>
                  <span>Preço sugerido</span>
                  <strong>R$ 1.128,40</strong>
                </div>
              </div>
            </div>

            <div className="auth-proof-list">
              {proofItems.map((item) => (
                <div key={item} className="auth-proof-row">
                  <CheckCircle2 size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="auth-bottom-grid">
              <div className="auth-bottom-card">
                <ShieldCheck size={18} />
                <div>
                  <strong>Dados por usuário</strong>
                  <span>Seu histórico e configurações ficam separados por conta.</span>
                </div>
              </div>
              <div className="auth-bottom-card">
                <TrendingUp size={18} />
                <div>
                  <strong>Decisão com margem</strong>
                  <span>O sistema mostra preço sugerido com lógica de rentabilidade.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="glass card auth-form-panel">
            <div className="auth-brand-row">
              <div className="public-brand-mark small">
                <HeartPulse size={16} />
              </div>
              <div>
                <strong>Precifica Serv Pro</strong>
                <span className="muted">Acesso à plataforma</span>
              </div>
            </div>

            <div className="auth-form-head">
              <h2 className="heading-lg">{mode === "login" ? "Entrar no sistema" : "Criar sua conta"}</h2>
              <p className="muted">
                {mode === "login"
                  ? "Entre para acessar seu painel, histórico e cálculos salvos."
                  : "Cadastre seus dados para iniciar sua estrutura de precificação profissional."}
              </p>
            </div>

            <div className="auth-toggle-grid">
              <button type="button" className={mode === "login" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setMode("login")}>
                Login
              </button>
              <button type="button" className={mode === "register" ? "btn btn-primary" : "btn btn-secondary"} onClick={() => setMode("register")}>
                Cadastro
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid auth-form-grid">
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

              {message ? <div className="badge auth-message" style={{ justifyContent: "center" }}>{message}</div> : null}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
              </button>
            </form>

            {mode === "login" ? (
              <button type="button" className="btn btn-secondary auth-forgot-button" onClick={onForgotPassword}>
                Esqueci minha senha
              </button>
            ) : null}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
