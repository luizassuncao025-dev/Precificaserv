import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  ChartNoAxesCombined,
  ClipboardList,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

const highlights = [
  {
    title: "Precificação guiada",
    description: "O sistema transforma custos fixos, insumos e tempo clínico em preço sugerido com lógica automática.",
    icon: BadgeDollarSign,
  },
  {
    title: "Operação didática",
    description: "Cada etapa foi desenhada para o profissional preencher menos, entender mais e errar menos.",
    icon: ClipboardList,
  },
  {
    title: "Decisão com margem",
    description: "Você enxerga impacto de imposto, custo direto e margem antes de fechar o valor final.",
    icon: TrendingUp,
  },
];

const steps = [
  {
    eyebrow: "Etapa 1",
    title: "Estruture sua base financeira",
    description: "Cadastre custos fixos mensais e forme a sua hora clínica com uma base confiável para todo o sistema.",
  },
  {
    eyebrow: "Etapa 2",
    title: "Atualize compras e insumos",
    description: "Informe as últimas compras e deixe o custo unitário pronto para abastecer cada nova precificação.",
  },
  {
    eyebrow: "Etapa 3",
    title: "Gere preço com clareza",
    description: "Monte a precificação por procedimento, visualize a formação do preço e exporte um PDF profissional.",
  },
];

const benefits = [
  "Cadastro de custos fixos com base mensal reutilizável",
  "Últimas compras com custo unitário calculado automaticamente",
  "Histórico completo para editar, comparar e exportar relatórios",
  "Experiência responsiva para desktop e celular",
];

export function Hero() {
  return (
    <div className="shell">
      <div className="container landing-stack">
        <section className="glass card landing-hero">
          <div className="landing-hero-grid">
            <div className="landing-copy">
              <div className="badge">
                <Sparkles size={16} /> Plataforma de precificação profissional em nuvem
              </div>
              <h1 className="heading-xl landing-title">
                Pare de precificar no escuro e transforme custo em decisão estratégica.
              </h1>
              <p className="muted landing-lead">
                O Precifica Serv Pro organiza custos fixos, compras, insumos e tempo produtivo para entregar uma
                formação de preço clara, segura e pronta para apoiar seu lucro com mais previsibilidade.
              </p>

              <div className="landing-actions">
                <Link href="/login" className="btn btn-primary">
                  Entrar no sistema <ArrowRight size={16} />
                </Link>
                <Link href="/login?mode=register" className="btn btn-secondary">
                  Criar acesso
                </Link>
                <a href="#recursos" className="btn btn-secondary">
                  Ver recursos
                </a>
              </div>

              <div className="landing-proof-strip">
                <div className="landing-proof-item">
                  <ShieldCheck size={18} />
                  <span>Dados separados por usuário</span>
                </div>
                <div className="landing-proof-item">
                  <FileSpreadsheet size={18} />
                  <span>PDF profissional com formação de preço</span>
                </div>
                <div className="landing-proof-item">
                  <ChartNoAxesCombined size={18} />
                  <span>Indicadores para acompanhar margem e evolução</span>
                </div>
              </div>
            </div>

            <div className="landing-visual-wrap">
              <div className="landing-visual-card glass">
                <div className="landing-visual-head">
                  <div>
                    <span className="landing-mini-label">Visão executiva</span>
                    <h2>Centro de decisão da operação</h2>
                  </div>
                  <div className="landing-mini-chip">
                    <Stethoscope size={14} /> Procedimentos
                  </div>
                </div>

                <div className="landing-stat-band">
                  <div>
                    <span>Preço médio</span>
                    <strong>R$ 1.420,80</strong>
                  </div>
                  <div>
                    <span>Margem protegida</span>
                    <strong>46,3%</strong>
                  </div>
                  <div>
                    <span>Insumos atualizados</span>
                    <strong>128 itens</strong>
                  </div>
                </div>

                <div className="landing-price-panel">
                  <div className="landing-price-summary">
                    <span className="landing-mini-label">Formação de preço</span>
                    <h3>Harmonização facial</h3>
                    <p>
                      O sistema mostra a composição do valor final e ajuda você a defender o preço com segurança.
                    </p>
                  </div>

                  <div className="landing-price-grid">
                    <div className="landing-price-card direct">
                      <span>Custo direto</span>
                      <strong>R$ 186,40</strong>
                    </div>
                    <div className="landing-price-card operational">
                      <span>Custo operacional</span>
                      <strong>R$ 92,10</strong>
                    </div>
                    <div className="landing-price-card taxes">
                      <span>Impostos</span>
                      <strong>R$ 109,52</strong>
                    </div>
                    <div className="landing-price-card margin">
                      <span>Margem desejada</span>
                      <strong>45,0%</strong>
                    </div>
                  </div>

                  <div className="landing-suggested-price">
                    <span>Preço sugerido</span>
                    <strong>R$ 729,11</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-metrics">
          <div className="glass card landing-metric-card">
            <span>Mais previsibilidade</span>
            <strong>Custos organizados em uma base única</strong>
            <p className="muted">O valor da hora clínica passa a refletir a realidade do seu negócio.</p>
          </div>
          <div className="glass card landing-metric-card">
            <span>Mais controle</span>
            <strong>Compras e insumos conectados ao cálculo</strong>
            <p className="muted">Você reduz retrabalho e evita precificar com custos desatualizados.</p>
          </div>
          <div className="glass card landing-metric-card">
            <span>Mais segurança</span>
            <strong>Preço sugerido com leitura profissional</strong>
            <p className="muted">Margem, imposto e custos aparecem de forma clara para apoiar a decisão.</p>
          </div>
        </section>

        <section className="glass card feature-section" id="recursos">
          <div className="landing-section-head">
            <div>
              <div className="badge">Recursos principais</div>
              <h2 className="heading-lg" style={{ marginTop: 12 }}>
                Uma experiência pensada para o profissional entender o cálculo e agir com confiança.
              </h2>
              <p className="muted landing-section-copy">
                O sistema não entrega apenas números. Ele organiza a operação, melhora a leitura financeira e ajuda você
                a sustentar preços com mais consistência.
              </p>
            </div>
          </div>

          <div className="landing-highlight-grid">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="stat feature-card landing-highlight-card">
                  <div className="landing-icon-badge">
                    <Icon size={18} />
                  </div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="landing-panels">
            <div className="panel-preview landing-panel-card">
              <div className="landing-panel-copy">
                <span className="landing-mini-label">Painel executivo</span>
                <h3>Indicadores para acompanhar preço, margem e evolução da operação</h3>
              </div>
              <Image src="/feature-dashboard.svg" alt="Painel gráfico de precificação" width={1200} height={720} />
            </div>
            <div className="panel-preview landing-panel-card">
              <div className="landing-panel-copy">
                <span className="landing-mini-label">Análise visual</span>
                <h3>Gráficos e blocos visuais para entender rapidamente a composição dos resultados</h3>
              </div>
              <Image src="/feature-analytics.svg" alt="Painel analítico de custos" width={1200} height={720} />
            </div>
          </div>
        </section>

        <section className="landing-split-grid">
          <div className="glass card landing-steps-card">
            <div className="badge">Como funciona</div>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>
              Um fluxo claro para sair do cadastro inicial e chegar ao preço sugerido com consistência.
            </h2>
            <div className="landing-steps-list">
              {steps.map((step) => (
                <div key={step.title} className="landing-step-item">
                  <span className="landing-step-eyebrow">{step.eyebrow}</span>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass card landing-benefits-card">
            <div className="badge">Por que isso gera valor</div>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>
              Quando a precificação fica didática, a gestão deixa de ser improviso.
            </h2>
            <p className="muted landing-section-copy">
              O Precifica Serv Pro foi estruturado para profissionais que querem uma rotina mais organizada, mais
              profissional e com melhor defesa do preço final.
            </p>
            <div className="landing-benefits-list">
              {benefits.map((benefit) => (
                <div key={benefit} className="landing-benefit-row">
                  <ShieldCheck size={18} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="landing-cta-block">
              <p>
                Entre no sistema e comece a montar uma base mais sólida para a formação de preço dos seus serviços.
              </p>
              <div className="landing-actions">
                <Link href="/login" className="btn btn-primary">
                  Acessar plataforma <ArrowRight size={16} />
                </Link>
                <Link href="/login?mode=register" className="btn btn-secondary">
                  Solicitar acesso
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
