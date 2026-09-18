import Link from "next/link";\nimport { PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";\nimport { startOfTodayInTimezone } from "@/lib/timezones";
import {
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  FileText,
  MessageCircleMore,
  PackageSearch,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CL";
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts.at(-1)![0]).toUpperCase();
}

export default async function DashboardPage(){
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = await createClient();
  const companyId = company.id;
  const today = todayStartIso();

  let conversationsTodayQuery = supabase.from("conversations").select("id", { count: "exact", head: true }).eq("company_id", companyId).gte("created_at", today);
  let aiTodayQuery = supabase.from("ai_interactions").select("id", { count: "exact", head: true }).eq("company_id", companyId).gte("created_at", today);
  let aiMatchedQuery = supabase.from("ai_interactions").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("decision", "matched").gte("created_at", today);
  let quotesOpenQuery = supabase.from("quotes").select("id,total,status").eq("company_id", companyId).in("status", ["draft", "sent"]);
  let quotesAcceptedQuery = supabase.from("quotes").select("id,total,status").eq("company_id", companyId).eq("status", "accepted").gte("created_at", today);
  let recentConversationsQuery = supabase.from("conversations").select("id,status,last_message_at,customer_id").eq("company_id", companyId).order("last_message_at", { ascending: false, nullsFirst: false }).limit(4);

  if (branchId) {
    conversationsTodayQuery = conversationsTodayQuery.eq("branch_id", branchId);
    aiTodayQuery = aiTodayQuery.eq("branch_id", branchId);
    aiMatchedQuery = aiMatchedQuery.eq("branch_id", branchId);
    quotesOpenQuery = quotesOpenQuery.eq("branch_id", branchId);
    quotesAcceptedQuery = quotesAcceptedQuery.eq("branch_id", branchId);
    recentConversationsQuery = recentConversationsQuery.eq("branch_id", branchId);
  }

  const [
    conversationsToday,
    aiToday,
    aiMatchedToday,
    quotesOpenResult,
    quotesAcceptedResult,
    recentConversationsResult,
    recentProductsResult,
  ] = await Promise.all([
    conversationsTodayQuery,
    aiTodayQuery,
    aiMatchedQuery,
    quotesOpenQuery,
    quotesAcceptedQuery,
    recentConversationsQuery,
    supabase.from("products").select("id,sku,name").eq("company_id", companyId).eq("active", true).order("created_at", { ascending: false }).limit(4),
  ]);

  const conversationsCount = conversationsToday.count ?? 0;
  const aiCount = aiToday.count ?? 0;
  const matchedCount = aiMatchedToday.count ?? 0;
  const matchRate = aiCount > 0 ? (matchedCount / aiCount) * 100 : 0;
  const openQuotes = quotesOpenResult.data ?? [];
  const acceptedQuotes = quotesAcceptedResult.data ?? [];
  const openQuoteValue = openQuotes.reduce((sum, item) => sum + Number(item.total ?? 0), 0);
  const acceptedValue = acceptedQuotes.reduce((sum, item) => sum + Number(item.total ?? 0), 0);

  const recentConversations = recentConversationsResult.data ?? [];
  const customerIds = recentConversations.map((item) => item.customer_id).filter((id): id is string => Boolean(id));
  const { data: customers } = customerIds.length
    ? await supabase.from("customers").select("id,name").eq("company_id", companyId).in("id", customerIds)
    : { data: [] as Array<{ id: string; name: string }> };
  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer.name]));

  const products = recentProductsResult.data ?? [];
  const productIds = products.map((product) => product.id);
  const [priceResult, stockResult] = productIds.length
    ? await Promise.all([
        supabase.from("product_prices").select("product_id,price,valid_from").eq("company_id", companyId).in("product_id", productIds).order("valid_from", { ascending: false }),
        supabase.from("product_inventory").select("product_id,quantity,reserved").eq("company_id", companyId).in("product_id", productIds),
      ])
    : [{ data: [] }, { data: [] }];

  const prices = new Map<string, number>();
  for (const row of priceResult.data ?? []) {
    if (!prices.has(row.product_id)) prices.set(row.product_id, Number(row.price));
  }

  const stock = new Map<string, number>();
  for (const row of stockResult.data ?? []) {
    stock.set(
      row.product_id,
      (stock.get(row.product_id) ?? 0) + Number(row.quantity) - Number(row.reserved),
    );
  }

  const firstName =
    ((company.user.user_metadata?.full_name as string | undefined) ||
      company.user.email?.split("@")[0] ||
      "usuário").split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title={`Olá, ${firstName}`}
        description={`Acompanhe ${workspace.branch?.name ?? company.name} no fuso ${workspace.timezone}.`}
        actions={<><Button variant="secondary" icon={<FileText size={15}/>}>Novo orçamento</Button><Button icon={<Plus size={15}/>}>Novo atendimento</Button></>}
      />

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon"><MessageCircleMore size={18}/></div><StatusBadge tone="success">Hoje</StatusBadge></div>
          <div className="stat-value">{conversationsCount}</div><div className="stat-label">Atendimentos hoje</div>
          <div className="stat-foot">Conversas registradas no CRM</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon blue"><PackageSearch size={18}/></div><StatusBadge tone="info">{aiCount} análises</StatusBadge></div>
          <div className="stat-value">{matchRate.toFixed(1).replace(".", ",")}%</div><div className="stat-label">Peças identificadas</div>
          <div className="stat-foot">{matchedCount} consultas com match confiável</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon amber"><FileText size={18}/></div><StatusBadge tone="warning">{openQuotes.length} abertos</StatusBadge></div>
          <div className="stat-value">{brl(openQuoteValue)}</div><div className="stat-label">Em orçamentos</div>
          <div className="stat-foot">Rascunhos e propostas enviadas</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon purple"><CircleDollarSign size={18}/></div><StatusBadge tone="purple">{acceptedQuotes.length} aceitos</StatusBadge></div>
          <div className="stat-value">{brl(acceptedValue)}</div><div className="stat-label">Vendas convertidas hoje</div>
          <div className="stat-foot">Orçamentos marcados como aceitos</div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <Card>
            <div className="card-header"><div><h2 className="card-title">Atendimentos recentes</h2><p className="card-subtitle">Conversas mais recentes da sua operação.</p></div><Link className="card-link" href="/conversas">Ver inbox</Link></div>
            {recentConversations.length ? (
              <div className="activity-list">
                {recentConversations.map((item) => {
                  const name = item.customer_id ? customerMap.get(item.customer_id) ?? "Cliente" : "Cliente";
                  const tone = item.status === "waiting_agent" ? "purple" : item.status === "waiting_customer" ? "amber" : "green";
                  return (
                    <div className="activity-row" key={item.id}>
                      <Avatar initials={initials(name)} tone={tone}/>
                      <div className="activity-copy"><strong>{name}</strong><span>Status: {item.status.replaceAll("_", " ")}</span></div>
                      <StatusBadge tone={tone==="green"?"success":tone==="amber"?"warning":"purple"}>{item.status}</StatusBadge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state"><MessageCircleMore size={28}/><strong>Nenhum atendimento ainda</strong><p>As próximas conversas aparecerão aqui assim que forem registradas.</p></div>
            )}
          </Card>

          <Card>
            <div className="card-header"><div><h2 className="card-title">Catálogo recente</h2><p className="card-subtitle">Últimos produtos ativos cadastrados.</p></div><Link className="card-link" href="/catalogo">Abrir catálogo</Link></div>
            {products.length ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Peça</th><th>Código</th><th>Preço</th><th>Estoque</th><th></th></tr></thead>
                  <tbody>
                    {products.map((product)=>(
                      <tr key={product.id}>
                        <td><div className="table-main"><div className="avatar avatar-slate"><PackageSearch size={15}/></div><div><strong>{product.name}</strong><span>Produto ativo</span></div></div></td>
                        <td>{product.sku}</td>
                        <td className="money">{prices.has(product.id) ? brl(prices.get(product.id)!) : "Sem preço"}</td>
                        <td className={(stock.get(product.id) ?? 0) > 0 ? "stock-good" : "stock-zero"}>{stock.has(product.id) ? `${stock.get(product.id)} un.` : "Sem saldo"}</td>
                        <td><ArrowUpRight size={15} color="#8390a3"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><PackageSearch size={28}/><strong>Catálogo vazio</strong><p>Importe o catálogo ou cadastre sua primeira peça para começar.</p></div>
            )}
          </Card>
        </div>

        <div className="dashboard-stack">
          <Card>
            <div className="card-header"><div><h2 className="card-title">Funil atual</h2><p className="card-subtitle">Resumo simples dos atendimentos de hoje.</p></div><span className="metric-chip"><Users size={13}/> {conversationsCount} total</span></div>
            <div className="pipeline">
              <div className="pipeline-row"><span className="pipeline-label">Análises da IA</span><div className="pipeline-track"><div className="pipeline-fill" style={{width:aiCount ? "100%" : "0%"}}/></div><strong className="pipeline-count">{aiCount}</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Matches</span><div className="pipeline-track"><div className="pipeline-fill blue" style={{width:`${Math.min(matchRate,100)}%`}}/></div><strong className="pipeline-count">{matchedCount}</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Orçamentos abertos</span><div className="pipeline-track"><div className="pipeline-fill amber" style={{width:openQuotes.length ? "65%" : "0%"}}/></div><strong className="pipeline-count">{openQuotes.length}</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Aceitos hoje</span><div className="pipeline-track"><div className="pipeline-fill purple" style={{width:acceptedQuotes.length ? "42%" : "0%"}}/></div><strong className="pipeline-count">{acceptedQuotes.length}</strong></div>
            </div>
          </Card>

          <Card className="card-pad">
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div className="stat-icon"><Sparkles size={18}/></div>
              <div><h2 className="card-title">Inteligência do catálogo</h2><p className="card-subtitle">A IA só apresenta SKU, preço, estoque e aplicação quando esses dados existem no banco.</p></div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20}}><span className="stat-foot"><Bot size={12}/> Taxa de match hoje</span><strong style={{fontSize:14}}>{matchRate.toFixed(1).replace(".", ",")}%</strong></div>
          </Card>
        </div>
      </div>
    </>
  );
}
