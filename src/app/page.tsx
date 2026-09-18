import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CarFront,
  Check,
  FileText,
  MessageSquareText,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { getCurrentPrincipal } from "@/lib/auth/current-principal";
import { getCurrentCompany } from "@/lib/company/current-company";
import styles from "./page.module.css";

export default async function HomePage() {
  const principal = await getCurrentPrincipal();
  const company = principal ? await getCurrentCompany() : null;
  const primaryHref = principal ? (company ? "/dashboard" : "/onboarding") : "/cadastro";
  const primaryLabel = principal ? (company ? "Abrir workspace" : "Continuar configuração") : "Começar agora";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span><CarFront size={19}/></span>
          <strong>AutoParts</strong>
          <small>CRM</small>
        </Link>
        <nav>
          <a href="#produto">Produto</a>
          <a href="#fluxo">Como funciona</a>
          <a href="#seguranca">Segurança</a>
        </nav>
        <div className={styles.headerActions}>
          {!principal ? <Link href="/login">Entrar</Link> : null}
          <Link href={primaryHref} className={styles.headerCta}>{primaryLabel}<ArrowRight size={14}/></Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Sparkles size={13}/> CRM para lojas e distribuidores de autopeças</span>
          <h1>Venda a peça certa.<br/><em>Sem perder tempo.</em></h1>
          <p>Atendimento, veículo, catálogo, preço, estoque, orçamento e pedido em um único workspace.</p>
          <div className={styles.heroActions}>
            <Link href={primaryHref} className={styles.primaryCta}>{primaryLabel}<ArrowRight size={15}/></Link>
            {!principal ? <Link href="/login" className={styles.secondaryCta}>Já tenho acesso</Link> : null}
          </div>
          <div className={styles.trust}>
            <span><Check size={13}/> Multi-filial</span>
            <span><Check size={13}/> Fusos do Brasil</span>
            <span><Check size={13}/> Dados comerciais reais</span>
          </div>
        </div>

        <div className={styles.product}>
          <div className={styles.productGlow}/>
          <div className={styles.appFrame}>
            <aside className={styles.previewSidebar}>
              <span className={styles.previewLogo}><CarFront size={15}/></span>
              {[0,1,2,3,4,5].map(i=><i key={i} className={i===0?styles.active:""}/>)}
            </aside>
            <div className={styles.previewMain}>
              <div className={styles.previewTopbar}>
                <div><small>Visão geral</small><strong>Operação de hoje</strong></div>
                <button><Search size={12}/> Buscar</button>
              </div>
              <div className={styles.previewStats}>
                <PreviewStat label="Atendimentos" value="24"/>
                <PreviewStat label="Match" value="92%"/>
                <PreviewStat label="Orçamentos" value="12"/>
                <PreviewStat label="Pedidos" value="8"/>
              </div>
              <div className={styles.previewGrid}>
                <article>
                  <div className={styles.previewTitle}><MessageSquareText size={13}/> Atendimento em andamento</div>
                  <div className={styles.previewChatCustomer}>Preciso da bandeja do Civic 2008.</div>
                  <div className={styles.previewChatAgent}>Localizei duas aplicações. Qual é o lado da peça?</div>
                  <div className={styles.previewChatCustomer}>Lado esquerdo.</div>
                  <div className={styles.previewMatch}><PackageSearch size={14}/><div><strong>Aplicação confirmada</strong><span>SKU + preço + estoque</span></div></div>
                </article>
                <article>
                  <div className={styles.previewTitle}><ShoppingCart size={13}/> Comercial</div>
                  <div className={styles.previewProduct}><span>Bandeja Civic</span><strong>10 un.</strong></div>
                  <div className={styles.previewProduct}><span>Preço vigente</span><strong>R$ 329,90</strong></div>
                  <div className={styles.previewQuote}><FileText size={13}/><span>Orçamento pronto</span><strong>R$ 329,90</strong></div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="produto" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span>Um workspace para a operação inteira</span>
          <h2>Menos troca de tela.<br/>Mais contexto para vender.</h2>
        </div>
        <div className={styles.featureGrid}>
          <Feature icon={<MessageSquareText/>} title="Atendimento" text="Conversa e histórico do cliente no mesmo lugar."/>
          <Feature icon={<PackageSearch/>} title="Catálogo" text="Busca por nome, SKU, OEM e aplicação veicular."/>
          <Feature icon={<Boxes/>} title="Estoque" text="Saldo e disponibilidade por filial."/>
          <Feature icon={<FileText/>} title="Orçamentos" text="Preço negociado, validade e conversão em pedido."/>
          <Feature icon={<ShoppingCart/>} title="Pedidos" text="Venda direta ou originada de um orçamento."/>
          <Feature icon={<BarChart3/>} title="Gestão" text="Métricas de atendimento, catálogo e conversão."/>
        </div>
      </section>

      <section id="fluxo" className={styles.workflow}>
        <div>
          <span>Como funciona</span>
          <h2>Da pergunta do cliente ao pedido.</h2>
          <p>A automação interpreta a conversa, mas preço, estoque e aplicação vêm da base da empresa.</p>
        </div>
        <ol>
          <li><i>01</i><div><strong>Entender</strong><span>Identifica peça e contexto do veículo.</span></div></li>
          <li><i>02</i><div><strong>Validar</strong><span>Pergunta somente o que falta para diferenciar a aplicação.</span></div></li>
          <li><i>03</i><div><strong>Cotar</strong><span>Busca preço e disponibilidade da filial.</span></div></li>
          <li><i>04</i><div><strong>Vender</strong><span>Gera orçamento ou pedido com os valores negociados.</span></div></li>
        </ol>
      </section>

      <section id="seguranca" className={styles.security}>
        <div><ShieldCheck size={24}/></div>
        <section><span>Segurança operacional</span><h2>Dados separados por empresa e filial.</h2><p>Autenticação, RLS e isolamento multi-tenant fazem parte da estrutura da plataforma.</p></section>
        <Link href={primaryHref}>{primaryLabel}<ArrowRight size={14}/></Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.brand}><span><CarFront size={17}/></span><strong>AutoParts</strong><small>CRM</small></div>
        <span>Atendimento e operação para autopeças.</span>
      </footer>
    </main>
  );
}

function PreviewStat({label,value}:{label:string;value:string}){return <div><span>{label}</span><strong>{value}</strong></div>;}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <article><div>{icon}</div><h3>{title}</h3><p>{text}</p></article>;}
