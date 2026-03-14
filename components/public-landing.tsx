import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseMedical,
  Calculator,
  CheckCircle2,
  Clock3,
  Coins,
  FileBarChart2,
  FileClock,
  HeartPulse,
  Landmark,
  Receipt,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
} from "lucide-react";

const signupHref = "/cadastro" as Route;
const loginHref = "/login" as Route;

const problemPoints = [
  "tabela de colegas",
  "sensação de mercado",
  "tentativa e erro",
  "ou simplesmente no que parece justo",
];

const problemResults = [
  "agenda cheia",
  "alta carga de trabalho",
  "e lucro menor do que deveria existir",
];

const mechanismCards = [
  {
    title: "Custos reais consolidados",
    description: "O sistema reúne custos fixos, materiais, tempo clínico e imposto para calcular o preço com base concreta.",
    icon: Landmark,
  },
  {
    title: "Lógica automática de rentabilidade",
    description: "A plataforma entrega a formação do preço e mostra onde estão custo direto, operação, impostos e margem.",
    icon: Calculator,
  },
  {
    title: "Clareza para decidir com segurança",
    description: "Você entende o impacto de cada variável e deixa de depender de achismo para definir valor.",
    icon: Target,
  },
];

const steps = [
  {
    step: "Passo 1",
    title: "Cadastre seus procedimentos",
    detail: "Organize o que você realiza com nome, categoria e tempo clínico.",
    icon: Stethoscope,
  },
  {
    step: "Passo 2",
    title: "Informe os custos do consultório",
    detail: "custos fixos, materiais, impostos e tempo clínico",
    icon: Receipt,
  },
  {
    step: "Passo 3",
    title: "Defina sua margem de lucro",
    detail: "Escolha a margem desejada para transformar o cálculo em decisão estratégica.",
    icon: TrendingUp,
  },
  {
    step: "Passo 4",
    title: "Receba a precificação ideal",
    detail: "Veja o valor sugerido com a composição completa do preço do procedimento.",
    icon: BadgeDollarSign,
  },
];

const factors = [
  { title: "Custos fixos do consultório", icon: Landmark },
  { title: "Custos variáveis de materiais", icon: Coins },
  { title: "Tempo clínico do procedimento", icon: Clock3 },
  { title: "Impostos", icon: Receipt },
  { title: "Margem de lucro desejada", icon: Target },
];

const transformations = [
  "Cada procedimento passa a gerar lucro real",
  "Você ganha clareza financeira sobre o negócio",
  "Fica muito mais fácil tomar decisões estratégicas",
];

const features = [
  { title: "Cadastro de procedimentos", icon: Stethoscope },
  { title: "Cálculo automático de preços", icon: Calculator },
  { title: "Simulação de margens de lucro", icon: TrendingUp },
  { title: "Análise de rentabilidade por procedimento", icon: FileBarChart2 },
  { title: "Histórico de cálculos e ajustes", icon: FileClock },
];

const audience = ["Dentistas", "Médicos", "Biomédicos", "Esteticistas", "Fisioterapeutas", "Clínicas especializadas"];

const results = [
  "Mais clareza financeira",
  "Mais segurança para definir preços",
  "Mais lucro por procedimento",
];

export function PublicLanding() {
  return (
    <div className="shell public-shell">
      <header className="public-header-wrap">
        <div className="container">
          <div className="glass public-header">
            <div className="public-brand">
              <div className="public-brand-mark">
                <HeartPulse size={18} />
              </div>
              <div>
                <strong>Precifica Serv Pro</strong>
                <span>Motor de Rentabilidade Clínica™</span>
              </div>
            </div>

            <nav className="public-header-nav">
              <a href="#como-funciona">Como funciona</a>
              <a href="#beneficios">Benefícios</a>
              <a href="#funcionalidades">Funcionalidades</a>
            </nav>

            <div className="public-header-actions">
              <Link href={loginHref} className="btn btn-secondary">Entrar</Link>
              <Link href={signupHref} className="btn btn-primary">Criar conta</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container public-landing-stack">
        <section className="glass card public-hero-section">
          <div className="public-hero-grid">
            <div className="public-hero-copy">
              <div className="badge">
                <Sparkles size={16} /> Motor de Rentabilidade Clínica™
              </div>
              <h1 className="heading-xl public-hero-title">
                Seu consultório pode estar trabalhando muito… e lucrando menos do que deveria.
              </h1>
              <p className="public-hero-subtitle">
                Descubra quanto realmente deveria cobrar pelos seus procedimentos usando o primeiro sistema de precificação clínica baseado em custos reais, tempo clínico e margem de lucro.
              </p>
              <p className="muted public-hero-support">
                O motor de precificação que transforma seu consultório em um negócio lucrativo.
              </p>

              <div className="public-hero-actions">
                <Link href={signupHref} className="btn btn-primary">
                  Calcular meus preços agora <ArrowRight size={16} />
                </Link>
                <a href="#como-funciona" className="btn btn-secondary">
                  Ver como funciona
                </a>
              </div>

              <div className="public-proof-row">
                <div className="public-proof-card">
                  <span>Margem</span>
                  <strong>45,0%</strong>
                </div>
                <div className="public-proof-card">
                  <span>Custo direto</span>
                  <strong>R$ 186,40</strong>
                </div>
                <div className="public-proof-card">
                  <span>Preço sugerido</span>
                  <strong>R$ 729,11</strong>
                </div>
              </div>
            </div>

            <div className="public-hero-visual">
              <div className="public-mockup-shell glass">
                <div className="public-mockup-topbar">
                  <span className="public-dot amber" />
                  <span className="public-dot green" />
                  <span className="public-dot blue" />
                  <div className="public-mockup-title">Dashboard do Motor de Rentabilidade Clínica™</div>
                </div>

                <div className="public-mockup-grid">
                  <div className="public-mockup-panel primary">
                    <span className="landing-mini-label">Preço sugerido</span>
                    <strong>R$ 1.284,70</strong>
                    <p>Valor calculado com custos reais, tempo clínico, impostos e margem desejada.</p>
                  </div>

                  <div className="public-mockup-mini-row">
                    <div className="public-mockup-mini-card">
                      <span>Custo operacional</span>
                      <strong>R$ 146,90</strong>
                    </div>
                    <div className="public-mockup-mini-card">
                      <span>Impostos</span>
                      <strong>R$ 192,11</strong>
                    </div>
                    <div className="public-mockup-mini-card">
                      <span>Lucro bruto</span>
                      <strong>R$ 428,62</strong>
                    </div>
                  </div>

                  <div className="public-mockup-chart-card">
                    <div className="public-chart-head">
                      <span className="landing-mini-label">Composição do preço</span>
                      <strong>Harmonização facial</strong>
                    </div>
                    <div className="public-chart-area">
                      <div className="public-chart-donut" />
                      <div className="public-chart-legend">
                        <div><span className="legend-chip chip-red" /> Impostos</div>
                        <div><span className="legend-chip chip-blue" /> Margem</div>
                        <div><span className="legend-chip chip-green" /> Custo direto</div>
                        <div><span className="legend-chip chip-gold" /> Operação</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass card public-section-block public-problem-section">
          <div className="public-section-head narrow">
            <div className="badge">O problema</div>
            <h2 className="heading-lg">O erro silencioso que acontece em milhares de consultórios</h2>
          </div>
          <div className="public-problem-grid">
            <div className="public-problem-copy">
              <p>
                Existe um erro silencioso que acontece em milhares de consultórios.
              </p>
              <p>Os preços dos procedimentos são definidos com base em:</p>
              <div className="public-list-grid compact">
                {problemPoints.map((item) => (
                  <div key={item} className="public-list-card">{item}</div>
                ))}
              </div>
              <p>
                O problema é que isso quase nunca reflete o custo real do procedimento.
              </p>
            </div>
            <div className="public-problem-impact">
              <div className="public-impact-card">
                <span className="landing-mini-label">Resultado</span>
                <h3>Você trabalha mais do que deveria para lucrar menos do que poderia.</h3>
                <div className="public-list-grid stacked">
                  {problemResults.map((item) => (
                    <div key={item} className="public-benefit-line">
                      <CheckCircle2 size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass card public-section-block public-mechanism-section">
          <div className="public-section-head narrow">
            <div className="badge">A solução</div>
            <h2 className="heading-lg">Apresentando o Motor de Rentabilidade Clínica™</h2>
            <p className="muted public-section-copy">
              Foi exatamente para resolver isso que criamos a plataforma. Um sistema que analisa todos os fatores financeiros do seu consultório e calcula automaticamente o valor ideal de cada procedimento. Sem achismo. Sem tentativa e erro. Baseado em números reais.
            </p>
          </div>
          <div className="public-feature-grid three-up">
            {mechanismCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="stat public-feature-card">
                  <div className="public-icon-box"><Icon size={18} /></div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="como-funciona" className="glass card public-section-block">
          <div className="public-section-head narrow">
            <div className="badge">Como funciona</div>
            <h2 className="heading-lg">Como funciona</h2>
          </div>
          <div className="public-step-grid">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="public-step-card">
                  <div className="public-step-top">
                    <span className="landing-mini-label">{item.step}</span>
                    <div className="public-icon-box"><Icon size={18} /></div>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="glass card public-section-block">
          <div className="public-section-head narrow">
            <div className="badge">Precisão do cálculo</div>
            <h2 className="heading-lg">O que o sistema considera para calcular o preço ideal</h2>
          </div>
          <div className="public-feature-grid five-up">
            {factors.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="public-factor-card">
                  <div className="public-icon-box compact"><Icon size={16} /></div>
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section id="beneficios" className="glass card public-section-block public-impact-section">
          <div className="public-section-head narrow">
            <div className="badge">Transformação</div>
            <h2 className="heading-lg">O que muda quando a precificação é feita corretamente</h2>
          </div>
          <div className="public-impact-layout">
            <div className="public-impact-side">
              {transformations.map((item) => (
                <div key={item} className="public-benefit-line strong">
                  <CheckCircle2 size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="public-impact-summary">
              <p>
                Na prática, você deixa de apenas atender pacientes e passa a administrar um negócio de saúde lucrativo.
              </p>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="glass card public-section-block">
          <div className="public-section-head narrow">
            <div className="badge">Produto</div>
            <h2 className="heading-lg">O que a plataforma entrega</h2>
          </div>
          <div className="public-feature-grid three-up">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="stat public-feature-card">
                  <div className="public-icon-box"><Icon size={18} /></div>
                  <h3>{item.title}</h3>
                </article>
              );
            })}
          </div>
        </section>

        <section className="glass card public-section-block">
          <div className="public-section-head narrow">
            <div className="badge">Público-alvo</div>
            <h2 className="heading-lg">Para quem é o sistema</h2>
            <p className="muted public-section-copy">
              Profissionais da saúde que querem profissionalizar a gestão financeira do consultório.
            </p>
          </div>
          <div className="public-audience-grid">
            {audience.map((item) => (
              <div key={item} className="public-audience-card">
                <BriefcaseMedical size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="public-audience-footnote">
            Se você realiza procedimentos clínicos e cobra por eles, esse sistema foi feito para você.
          </p>
        </section>

        <section className="glass card public-section-block public-result-section">
          <div className="public-section-head narrow">
            <div className="badge">Resultado final</div>
            <h2 className="heading-lg">O resultado é simples</h2>
          </div>
          <div className="public-list-grid stacked wider">
            {results.map((item) => (
              <div key={item} className="public-benefit-line strong">
                <CheckCircle2 size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="public-result-closing">
            Porque um consultório saudável começa com uma precificação inteligente.
          </p>
        </section>

        <section className="glass card public-final-cta">
          <div className="public-section-head narrow centered">
            <div className="badge">Comece agora</div>
            <h2 className="heading-lg">Descubra agora quanto você realmente deveria cobrar pelos seus procedimentos.</h2>
          </div>
          <div className="public-final-actions">
            <Link href={signupHref} className="btn btn-primary">
              Criar minha conta <ArrowRight size={16} />
            </Link>
            <Link href={loginHref} className="btn btn-secondary">Entrar no sistema</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
