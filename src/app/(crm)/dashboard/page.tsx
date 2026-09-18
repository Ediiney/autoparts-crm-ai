import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  FileText,
  MessageCircleMore,
  PackageSearch,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { startOfTodayInTimezone } from "@/lib/timezones";

type DashboardPayload = {
  metrics?: {
    conversations_today?: number;
    ai_today?: number;
    matched_today?: number;
    open_quote_count?: number;
    open_quote_value?: number;
    accepted_count?: number;
    accepted_value?: number;
  };
  recentConversations?: Array<{
    id: string;
    status: string;
    customer_id: string | null;
    customer_name: string;
    last_message_at: string | null;
  }>;
  recentProducts?: Array<{
    id: string;
    sku: string;
    name: string;
    price: number | null;
    available_quantity: number | null;
  }>;
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
}

const statusLabels: Record<string, string> = {
  open: "Em atendimento",
  waiting_customer: "Aguardando cliente",
  waiting_agent: "Fila humana",
  closed: "Encerrada",
};

export default async function DashboardPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const supabase = await createClient();
  const today = startOfTodayInTimezone(workspace.timezone);
  const { data, error } = await supabase.rpc("get_dashboard_summary", {
    p_branch_id: workspace.branch?.id ?? null,
    p_today: today,
  });
  if (error) throw error;

  const summary = (data ?? {}) as DashboardPayload;
  const metrics = summary.metrics ?? {};
  const conversations = Number(metrics.conversations_today ?? 0);
  const ai = Number(metrics.ai_today ?? 0);
  const matched = Number(metrics.matched_today ?? 0);
  const matchRate = ai > 0 ? (matched / ai) * 100 : 0;
  const openQuotes = Number(metrics.open_quote_count ?? 0);
  const openValue = Number(metrics.open_quote_value ?? 0);
  const accepted = Number(metrics.accepted_count ?? 0);
  const acceptedValue = Number(metrics.accepted_value ?? 0);
  const recentConversations = summary.recentConversations ?? [];
  const products = summary.recentProducts ?? [];

  const firstName = (
    (workspace.company.user.user_metadata?.full_name as string | undefined) ||
    workspace.company.user.email?.split("@")[0] ||
    "usuário"
  ).split(" ")[0];

  return (
    <div className="dashboard-v4">
      <section className="dashboard-v4-head">
        <div>
          <span>Visão geral</span>
          <h1>Olá, {firstName}.</h1>
          <p>Veja o que está acontecendo na {workspace.branch?.name ?? workspace.company.name} agora.</p>
        </div>
        <div className="dashboard-v4-actions">
          <Link href="/orcamentos/novo" className="button-v2 secondary"><FileText size={15} /> Novo orçamento</Link>
          <Link href="/conversas" className="button-v2 primary"><Plus size={15} /> Novo atendimento</Link>
        </div>
      </section>

      <section className="dashboard-v4-summary">
        <div className="dashboard-v4-summary-intro">
          <span>Resumo de hoje</span>
          <strong>{money(acceptedValue + openValue)}</strong>
          <small>em oportunidades comerciais acompanhadas</small>
          <Link href="/relatorios">Abrir análise <ArrowRight size={14} /></Link>
        </div>

        <div className="dashboard-v4-kpis">
          <Kpi icon={<MessageCircleMore size={18}/>} label="Atendimentos" value={String(conversations)} hint="conversas hoje" />
          <Kpi icon={<PackageSearch size={18}/>} label="Match de peças" value={`${matchRate.toFixed(1).replace(".", ",")}%`} hint={`${matched} identificações`} />
          <Kpi icon={<FileText size={18}/>} label="Orçamentos abertos" value={String(openQuotes)} hint={money(openValue)} />
          <Kpi icon={<ShoppingCart size={18}/>} label="Aceitos" value={String(accepted)} hint={money(acceptedValue)} />
        </div>
      </section>

      <section className="dashboard-v4-grid">
        <div className="dashboard-v4-column">
          <article className="crm-surface dashboard-v4-panel">
            <header className="dashboard-v4-panel-head">
              <div><span>Atendimento</span><h2>Conversas recentes</h2></div>
              <Link href="/conversas">Ver todas <ArrowUpRight size={14}/></Link>
            </header>

            {recentConversations.length ? (
              <div className="dashboard-v4-list">
                {recentConversations.map((item) => {
                  const name = item.customer_name || "Cliente";
                  return (
                    <Link className="dashboard-v4-list-row" href={`/conversas?id=${item.id}`} prefetch={false} key={item.id}>
                      <div className="dashboard-v4-avatar">{initials(name)}</div>
                      <div><strong>{name}</strong><span>{statusLabels[item.status] ?? item.status.replaceAll("_"," ")}</span></div>
                      <span className={`dashboard-v4-state ${item.status}`}>{statusLabels[item.status] ?? item.status}</span>
                      <ArrowUpRight size={15}/>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-v4-empty">
                <MessageCircleMore size={24}/>
                <strong>Nenhuma conversa hoje</strong>
                <span>Os próximos atendimentos aparecerão aqui.</span>
              </div>
            )}
          </article>

          <article className="crm-surface dashboard-v4-panel">
            <header className="dashboard-v4-panel-head">
              <div><span>Catálogo</span><h2>Produtos atualizados</h2></div>
              <Link href="/catalogo">Abrir catálogo <ArrowUpRight size={14}/></Link>
            </header>

            {products.length ? (
              <div className="dashboard-v4-products">
                {products.map((product) => {
                  const qty = Number(product.available_quantity ?? 0);
                  const price = product.price === null ? null : Number(product.price);
                  return (
                    <Link href={`/catalogo/${product.id}`} prefetch={false} key={product.id}>
                      <div className="dashboard-v4-product-icon"><PackageSearch size={17}/></div>
                      <div><strong>{product.name}</strong><span>{product.sku}</span></div>
                      <div><strong>{price !== null ? money(price) : "Sem preço"}</strong><span className={qty > 0 ? "ok" : ""}>{qty > 0 ? `${qty} un.` : "Sem saldo"}</span></div>
                      <ArrowUpRight size={15}/>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="dashboard-v4-empty">
                <PackageSearch size={24}/>
                <strong>Catálogo vazio</strong>
                <span>Importe o catálogo para começar.</span>
              </div>
            )}
          </article>
        </div>

        <aside className="dashboard-v4-side">
          <article className="crm-surface dashboard-v4-pipeline">
            <header><div><span>Funil</span><h2>Fluxo comercial</h2></div><Sparkles size={18}/></header>
            <Pipeline label="Análises da IA" value={ai} percent={ai ? 100 : 0}/>
            <Pipeline label="Peças identificadas" value={matched} percent={Math.min(matchRate,100)}/>
            <Pipeline label="Orçamentos" value={openQuotes} percent={openQuotes ? 58 : 0}/>
            <Pipeline label="Aceitos" value={accepted} percent={accepted ? 32 : 0}/>
          </article>

          <article className="dashboard-v4-insight">
            <div><Bot size={20}/></div>
            <span>Automação assistida</span>
            <h3>A IA interpreta. Sua base comercial decide.</h3>
            <p>Preço, estoque, SKU e aplicação só aparecem quando existem no catálogo da empresa.</p>
            <Link href="/configuracoes">Configurar automação <ArrowRight size={14}/></Link>
          </article>

          <article className="crm-surface dashboard-v4-total">
            <span>Valor aceito</span>
            <strong>{money(acceptedValue)}</strong>
            <small>{accepted} orçamento{accepted === 1 ? "" : "s"} convertido{accepted === 1 ? "" : "s"}</small>
            <Link href="/pedidos"><CircleDollarSign size={15}/> Ver pedidos</Link>
          </article>
        </aside>
      </section>
    </div>
  );
}

function Kpi({icon,label,value,hint}:{icon:React.ReactNode;label:string;value:string;hint:string}){
  return <div className="dashboard-v4-kpi"><div>{icon}</div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>;
}

function Pipeline({label,value,percent}:{label:string;value:number;percent:number}){
  return <div className="dashboard-v4-pipeline-row"><div><span>{label}</span><strong>{value}</strong></div><i><b style={{width:`${percent}%`}}/></i></div>;
}
