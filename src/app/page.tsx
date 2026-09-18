import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CarFront,
  Check,
  FileText,
  MessageSquareText,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";
import { getCurrentCompany } from "@/lib/company/current-company";
import styles from "./page.module.css";

export default async function HomePage() {
  const principal = await getCurrentPrincipal();
  const company = principal ? await getCurrentCompany() : null;

  const primaryHref = principal ? (company ? "/dashboard" : "/onboarding") : "/cadastro";
  const primaryLabel = principal
    ? company
      ? "Abrir workspace"
      : "Continuar configuração"
    : "Começar agora";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}><CarFront size={20} /></span>
            <span className={styles.brandCopy}>
              <strong>AutoParts</strong>
              <small>CRM</small>
            </span>
          </Link>

          <nav className={styles.nav}>
            <a href="#produto">Produto</a>
            <a href="#operacao">Operação</a>
            <a href="#seguranca">Segurança</a>
          </nav>

          <div className={styles.headerActions}>
            {!principal ? <Link href="/login" className={styles.ghostButton}>Entrar</Link> : null}
            <Link href={primaryHref} className={styles.headerCta}>
              {primaryLabel}<ArrowRight size={14} />
            </Link>
          </div>
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={13} /> Operação de autopeças, conectada</span>
            <h1>Transforme uma pergunta em uma venda sem perder o contexto.</h1>
            <p>
              Atendimento, veículo, catálogo, preço, estoque e orçamento trabalham juntos.
              A IA interpreta a conversa, mas a resposta comercial vem da sua base.
            </p>

            <div className={styles.heroActions}>
              <Link href={primaryHref} className={styles.primaryButton}>
                {primaryLabel}<ArrowRight size={15} />
              </Link>
              {!principal ? <Link href="/login" className={styles.secondaryButton}>Já tenho acesso</Link> : null}
            </div>

            <div className={styles.trustRow}>
              <span><Check size={13} /> Multi-filial</span>
              <span><Check size={13} /> Fusos brasileiros</span>
              <span><Check size={13} /> Preço e estoque reais</span>
            </div>
          </div>

          <div className={styles.productStage}>
            <div className={styles.stageGlow} />
            <div className={styles.window}>
              <div className={styles.windowTop}>
                <div><i /><i /><i /></div>
                <span>AutoParts CRM · Matriz</span>
                <small>online</small>
              </div>

              <div className={styles.windowBody}>
                <aside className={styles.miniSidebar}>
                  <div className={styles.miniLogo}><CarFront size={14} /></div>
                  {[0,1,2,3,4,5].map((item) => <span key={item} className={item === 0 ? styles.activeMiniNav : ""} />)}
                </aside>

                <div className={styles.miniContent}>
                  <div className={styles.miniTop}>
                    <div>
                      <small>Visão geral</small>
                      <strong>Operação de hoje</strong>
                    </div>
                    <button><Search size={12} /> Buscar</button>
                  </div>

                  <div className={styles.miniMetrics}>
                    <MiniMetric label="Atendimentos" value="24" />
                    <MiniMetric label="Matches" value="92%" />
                    <MiniMetric label="Orçamentos" value="12" />
                    <MiniMetric label="Conversão" value="31%" />
                  </div>

                  <div className={styles.miniGrid}>
                    <div className={styles.conversationCard}>
                      <div className={styles.cardTitle}><MessageSquareText size={13} /> Conversa em andamento</div>
                      <div className={styles.customerBubble}>Preciso da bandeja do Civic.</div>
                      <div className={styles.aiBubble}>Qual é o ano do veículo e o lado da peça?</div>
                      <div className={styles.customerBubble}>2008, lado esquerdo.</div>
                      <div className={styles.matchResult}>
                        <PackageSearch size={14} />
                        <div><strong>Aplicação localizada</strong><span>Catálogo → preço → estoque</span></div>
                      </div>
                    </div>

                    <div className={styles.inventoryCard}>
                      <div className={styles.cardTitle}><Boxes size={13} /> Disponibilidade</div>
                      <div className={styles.productLine}><span>Bandeja Civic</span><strong>10 un.</strong></div>
                      <div className={styles.productLine}><span>Pivô Onix</span><strong>7 un.</strong></div>
                      <div className={styles.productLine}><span>Homocinética</span><strong>4 un.</strong></div>
                      <div className={styles.quoteMini}><FileText size={13} /><span>Orçamento pronto</span><strong>R$ 329,90</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <span>CRM</span><i />
          <span>Catálogo</span><i />
          <span>Estoque</span><i />
          <span>Atendimento</span><i />
          <span>Orçamentos</span>
        </div>
      </section>

      <section id="produto" className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>Produto</span>
          <h2>Menos abas. Mais contexto comercial.</h2>
          <p>Cada módulo compartilha a mesma empresa, filial, cliente e veículo.</p>
        </div>

        <div className={styles.features}>
          <Feature icon={<MessageSquareText size={19} />} title="Inbox operacional" text="Conversa, veículo e histórico comercial no mesmo atendimento." />
          <Feature icon={<PackageSearch size={19} />} title="Catálogo inteligente" text="Busca por nome, código, aliases e aplicações veiculares." />
          <Feature icon={<Boxes size={19} />} title="Estoque por filial" text="Saldo e preço respeitam o workspace selecionado." />
          <Feature icon={<FileText size={19} />} title="Orçamento rastreável" text="Do rascunho ao aceite com snapshot de preço e itens." />
        </div>
      </section>

      <section id="operacao" className={styles.operation}>
        <div className={styles.operationCopy}>
          <span>Fluxo de atendimento</span>
          <h2>A IA não decide o que não sabe.</h2>
          <p>Ela identifica o pedido, encontra candidatos e pergunta apenas o atributo necessário para diferenciar a aplicação correta.</p>
        </div>
        <div className={styles.steps}>
          <Step number="01" title="Entende" text="Peça, veículo e contexto da mensagem." />
          <Step number="02" title="Refina" text="Ano, motor, lado ou versão quando necessário." />
          <Step number="03" title="Confirma" text="SKU, compatibilidade, preço e estoque no banco." />
          <Step number="04" title="Converte" text="Atendimento humano ou orçamento." />
        </div>
      </section>

      <section id="seguranca" className={styles.security}>
        <div className={styles.securityIcon}><ShieldCheck size={24} /></div>
        <div>
          <span>Segurança operacional</span>
          <h2>Dados comerciais vêm da base. Acesso respeita empresa e filial.</h2>
        </div>
        <p>Autenticação Supabase, políticas RLS e isolamento multi-tenant fazem parte da arquitetura desde o início.</p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.brand}>
          <span className={styles.brandMark}><CarFront size={18} /></span>
          <span className={styles.brandCopy}><strong>AutoParts</strong><small>CRM</small></span>
        </div>
        <span>Atendimento e operação para autopeças.</span>
      </footer>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong><i /></div>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className={styles.feature}><div>{icon}</div><h3>{title}</h3><p>{text}</p></article>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <article><span>{number}</span><h3>{title}</h3><p>{text}</p></article>;
}
