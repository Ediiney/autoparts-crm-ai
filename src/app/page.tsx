import Link from "next/link";
import { ArrowRight, Boxes, CarFront, Check, FileText, MessageSquareText, PackageSearch, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const company = user ? await getCurrentCompany() : null;

  const primaryHref = user ? (company ? "/dashboard" : "/onboarding") : "/cadastro";
  const primaryLabel = user ? (company ? "Abrir painel" : "Continuar configuração") : "Criar conta";

  return (
    <main className="marketing-page">
      <header className="marketing-header">
        <Link href="/" className="marketing-brand">
          <span className="marketing-brand-mark"><CarFront size={20}/></span>
          <span><strong>AutoParts</strong><small>CRM</small></span>
        </Link>
        <nav className="marketing-nav">
          <a href="#produto">Produto</a>
          <a href="#fluxo">Fluxo</a>
          <a href="#seguranca">Segurança</a>
        </nav>
        <div className="marketing-actions">
          {!user ? <Link href="/login" className="button-v2 secondary">Entrar</Link> : null}
          <Link href={primaryHref} className="button-v2 primary">{primaryLabel}<ArrowRight size={14}/></Link>
        </div>
      </header>

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <span className="marketing-pill"><Sparkles size={13}/> CRM para operações de autopeças</span>
          <h1>Atendimento, catálogo e venda em uma única operação.</h1>
          <p>Identifique a peça certa, confirme o veículo, consulte preço e estoque da filial e transforme a conversa em orçamento sem inventar informações.</p>
          <div className="marketing-hero-actions">
            <Link href={primaryHref} className="button-v2 primary large">{primaryLabel}<ArrowRight size={15}/></Link>
            {!user ? <Link href="/login" className="button-v2 secondary large">Já tenho acesso</Link> : null}
          </div>
          <div className="marketing-proof">
            <span><Check size={13}/> Multi-filial</span>
            <span><Check size={13}/> Fusos do Brasil</span>
            <span><Check size={13}/> RLS por empresa</span>
          </div>
        </div>

        <div className="marketing-product-preview">
          <div className="preview-topbar">
            <span><i/> AutoParts CRM</span>
            <span>Matriz · Brasília / São Paulo</span>
          </div>
          <div className="preview-body">
            <aside className="preview-sidebar">
              <div className="preview-logo"/>
              {Array.from({length:7}).map((_,index)=><span key={index} className={index===0?"active":""}/>)}
            </aside>
            <div className="preview-content">
              <div className="preview-heading"><div><span/><strong/></div><button/></div>
              <div className="preview-metrics">
                {Array.from({length:4}).map((_,index)=><div key={index}><span/><strong/><small/></div>)}
              </div>
              <div className="preview-grid">
                <div className="preview-panel wide">
                  <div className="preview-panel-head"/>{Array.from({length:4}).map((_,index)=><div className="preview-row" key={index}><i/><span/><small/></div>)}
                </div>
                <div className="preview-panel"><div className="preview-panel-head"/>{Array.from({length:4}).map((_,index)=><div className="preview-bar" key={index}><span/><i style={{width:`${80-index*13}%`}}/></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="produto" className="marketing-section">
        <div className="marketing-section-head"><span>Produto</span><h2>Feito para o fluxo real de uma autopeças.</h2><p>Do primeiro “quanto custa?” até o orçamento final, cada etapa fica registrada e rastreável.</p></div>
        <div className="marketing-feature-grid">
          <Feature icon={<MessageSquareText size={19}/>} title="Conversas centralizadas" text="Histórico do cliente, contexto do veículo e revisão humana no mesmo atendimento."/>
          <Feature icon={<PackageSearch size={19}/>} title="Catálogo inteligente" text="SKU, código original, aplicações, aliases e compatibilidades pesquisáveis."/>
          <Feature icon={<Boxes size={19}/>} title="Preço e estoque por filial" text="A resposta comercial usa a filial ativa, com fallback somente quando há preço geral cadastrado."/>
          <Feature icon={<FileText size={19}/>} title="Orçamentos operacionais" text="Cliente, itens, quantidade, desconto, validade e ciclo comercial completo."/>
        </div>
      </section>

      <section id="fluxo" className="marketing-flow">
        <div className="marketing-section-head"><span>Fluxo</span><h2>O sistema pergunta somente o que falta.</h2></div>
        <div className="flow-steps">
          <FlowStep number="01" title="Entende o pedido" text="“Bandeja do Civic” vira intenção de peça e veículo."/>
          <FlowStep number="02" title="Refina a aplicação" text="Ano, motor, lado ou versão só são solicitados quando diferenciam candidatos."/>
          <FlowStep number="03" title="Confirma no catálogo" text="Compatibilidade, SKU, preço e estoque são lidos da base da empresa."/>
          <FlowStep number="04" title="Vira operação" text="A conversa pode seguir para orçamento, atendimento humano e histórico do cliente."/>
        </div>
      </section>

      <section id="seguranca" className="marketing-security">
        <div><ShieldCheck size={24}/><span>Segurança por padrão</span><h2>Sem preço inventado. Sem estoque inventado. Sem acesso cruzado entre empresas.</h2></div>
        <p>O modelo interpreta linguagem natural, mas as informações comerciais e de compatibilidade dependem do banco. A aplicação usa autenticação Supabase e isolamento por empresa via RLS.</p>
      </section>

      <section className="marketing-cta">
        <div><span>Pronto para configurar sua operação?</span><h2>Comece pela empresa e conecte catálogo, equipe e canais depois.</h2></div>
        <Link href={primaryHref} className="button-v2 primary large">{primaryLabel}<ArrowRight size={15}/></Link>
      </section>

      <footer className="marketing-footer"><span>AutoParts CRM</span><span>Operação de autopeças, centralizada.</span></footer>
    </main>
  );
}

function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <article className="marketing-feature"><div>{icon}</div><h3>{title}</h3><p>{text}</p></article>;
}
function FlowStep({number,title,text}:{number:string;title:string;text:string}) {
  return <article><span>{number}</span><h3>{title}</h3><p>{text}</p></article>;
}
