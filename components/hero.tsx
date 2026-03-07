import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <div className="shell">
      <div className="container grid" style={{ gap: 32 }}>
        <div className="glass card hero-surface" style={{ padding: 32, overflow: "hidden", position: "relative" }}>
          <div className="badge"><Sparkles size={16} /> Plataforma de precificação profissional</div>
          <div className="grid grid-2" style={{ alignItems: "center", marginTop: 24 }}>
            <div>
              <h1 className="heading-xl">Converta custo em lucro com segurança.</h1>
              <p className="muted" style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 680 }}>
                O Precifica SaaS organiza custos fixos, compras de insumos e tempo clínico para gerar precificações
                estratégicas, proteger margem e aumentar a previsibilidade de caixa.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                <Link href="/login" className="btn btn-primary">Login <ArrowRight size={16} /></Link>
                <Link href="/login?mode=register" className="btn btn-secondary">Realizar cadastro</Link>
                <a href="#features" className="btn btn-secondary">Ver recursos</a>
              </div>
            </div>
            <div className="grid grid-2">
              <div className="stat">
                <ShieldCheck size={20} />
                <p className="heading-lg" style={{ marginBottom: 0 }}>Dados por usuário</p>
                <p className="muted">Cada clínica tem área própria com histórico e configurações individuais.</p>
              </div>
              <div className="stat">
                <TrendingUp size={20} />
                <p className="heading-lg" style={{ marginBottom: 0 }}>Margem protegida</p>
                <p className="muted">Formação de preço com imposto, margem e custo operacional automáticos.</p>
              </div>
              <div className="stat">
                <p className="heading-lg" style={{ marginBottom: 0 }}>Didático e rápido</p>
                <p className="muted">Fluxo guiado para preencher menos e calcular mais.</p>
              </div>
              <div className="stat">
                <p className="heading-lg" style={{ marginBottom: 0 }}>PDF profissional</p>
                <p className="muted">Gere relatórios de precificação para consulta e apresentação.</p>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="glass card feature-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="badge">Ver recursos</div>
              <h2 className="heading-lg" style={{ marginTop: 12 }}>O que o sistema faz por você</h2>
              <p className="muted">Controle financeiro, inteligência de precificação e previsibilidade em uma experiência única.</p>
            </div>
          </div>

          <div className="grid grid-3" style={{ marginTop: 18 }}>
            <div className="stat feature-card">
              <h3>Cadastro inteligente</h3>
              <p className="muted">Entrada validada de CPF/CNPJ, telefone e perfil da clínica para personalizar o sistema.</p>
            </div>
            <div className="stat feature-card">
              <h3>Custos fixos centralizados</h3>
              <p className="muted">Defina a base mensal uma vez e utilize em todas as novas precificações automaticamente.</p>
            </div>
            <div className="stat feature-card">
              <h3>Últimas compras com cálculo</h3>
              <p className="muted">Informe quantidade e valor total, e o custo unitário é calculado na hora.</p>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 18 }}>
            <div className="panel-preview">
              <Image src="/feature-dashboard.svg" alt="Painel gráfico de precificação" width={1200} height={720} />
            </div>
            <div className="panel-preview">
              <Image src="/feature-analytics.svg" alt="Painel analítico de custos" width={1200} height={720} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
