import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { startOfTodayInTimezone } from "@/lib/timezones";
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

function brl(value: number) {
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
  const conversationsCount = Number(metrics.conversations_today ?? 0);
  const aiCount = Number(metrics.ai_today ?? 0);
  const matchedCount = Number(metrics.matched_today ?? 0);
  const matchRate = aiCount > 0 ? (matchedCount / aiCount) * 100 : 0;
  const openQuoteCount = Number(metrics.open_quote_count ?? 0);
  const openQuoteValue = Number(metrics.open_quote_value ?? 0);
  const acceptedCount = Number(metrics.accepted_count ?? 0);
  const acceptedValue = Number(metrics.accepted_value ?? 0);
  const recentConversations = summary.recentConversations ?? [];
  const products = summary.recentProducts ?? [];

  const firstName = (
    (workspace.company.user.user_metadata?.full_name as string | undefined) ||
    workspace.company.user.email?.split("@")[0] ||
    "usuário"
  ).split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title={`Olá, ${firstName}`}
        description={`Acompanhe ${workspace.branch?.name ?? workspace.company.name} no fuso ${workspace.timezone}.`}
        actions={
          <>
            <Button variant="secondary" icon={<FileText size={15} />}>Novo orçamento</Button>
            <Button icon={<Plus size={15} />}>Novo atendimento</Button>
          </>
        }
      />

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon"><MessageCircleMore size={18} /></div><StatusBadge tone="success">Hoje</StatusBadge></div>
          <div className="stat-value">{conversationsCount}</div>
          <div className="stat-label">Atendimentos hoje</div>
          <div className="stat-foot">Conversas da filial selecionada</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon blue"><PackageSearch size={18} /></div><StatusBadge tone="info">{aiCount} análises</StatusBadge></div>
          <div className="stat-value">{matchRate.toFixed(1).replace(".", ",")}%</div>
          <div className="stat-label">Peças identificadas</div>
          <div className="stat-foot">{matchedCount} matches confiáveis</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon amber"><FileText size={18} /></div><StatusBadge tone="warning">{openQuoteCount} abertos</StatusBadge></div>
          <div className="stat-value">{brl(openQuoteValue)}</div>
          <div className="stat-label">Em orçamentos</div>
          <div className="stat-foot">Rascunhos e propostas enviadas</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon purple"><CircleDollarSign size={18} /></div><StatusBadge tone="purple">{acceptedCount} aceitos</StatusBadge></div>
          <div className="stat-value">{brl(acceptedValue)}</div>
          <div className="stat-label">Convertido hoje</div>
          <div className="stat-foot">Orçamentos aceitos no período local</div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <Card>
            <div className="card-header">
              <div><h2 className="card-title">Atendimentos recentes</h2><p className="card-subtitle">Conversas mais recentes da filial.</p></div>
              <Link className="card-link" href="/conversas">Ver inbox</Link>
            </div>
            {recentConversations.length ? (
              <div className="activity-list">
                {recentConversations.map((item) => {
                  const name = item.customer_name || "Cliente";
                  const avatarTone = item.status === "waiting_agent" ? "purple" : item.status === "waiting_customer" ? "amber" : "green";
                  const badgeTone = avatarTone === "green" ? "success" : avatarTone === "amber" ? "warning" : "purple";
                  return (
                    <div className="activity-row" key={item.id}>
                      <Avatar initials={initials(name)} tone={avatarTone} />
                      <div className="activity-copy">
                        <strong>{name}</strong>
                        <span>{item.status.replaceAll("_", " ")}</span>
                      </div>
                      <StatusBadge tone={badgeTone}>{item.status}</StatusBadge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state"><MessageCircleMore size={28} /><strong>Nenhum atendimento ainda</strong><p>As próximas conversas aparecerão aqui.</p></div>
            )}
          </Card>

          <Card>
            <div className="card-header">
              <div><h2 className="card-title">Catálogo recente</h2><p className="card-subtitle">Produtos atualizados recentemente.</p></div>
              <Link className="card-link" href="/catalogo">Abrir catálogo</Link>
            </div>
            {products.length ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Peça</th><th>Código</th><th>Preço</th><th>Estoque</th><th></th></tr></thead>
                  <tbody>
                    {products.map((product) => {
                      const qty = Number(product.available_quantity ?? 0);
                      const price = product.price === null ? null : Number(product.price);
                      return (
                        <tr key={product.id}>
                          <td><div className="table-main"><div className="avatar avatar-slate"><PackageSearch size={15} /></div><div><strong>{product.name}</strong><span>Produto ativo</span></div></div></td>
                          <td>{product.sku}</td>
                          <td className="money">{price !== null ? brl(price) : "Sem preço"}</td>
                          <td className={qty > 0 ? "stock-good" : "stock-zero"}>{qty > 0 ? `${qty} un.` : "Sem saldo"}</td>
                          <td><Link href={`/catalogo/${product.id}`} prefetch={false} aria-label={`Abrir ${product.name}`}><ArrowUpRight size={15} color="#8390a3" /></Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><PackageSearch size={28} /><strong>Catálogo vazio</strong><p>Importe o catálogo ou cadastre sua primeira peça.</p></div>
            )}
          </Card>
        </div>

        <div className="dashboard-stack">
          <Card>
            <div className="card-header"><div><h2 className="card-title">Funil atual</h2><p className="card-subtitle">Resumo da filial no dia local.</p></div><span className="metric-chip"><Users size={13} /> {conversationsCount} total</span></div>
            <div className="pipeline">
              <div className="pipeline-row"><span className="pipeline-label">Análises</span><div className="pipeline-track"><div className="pipeline-fill" style={{ width: aiCount ? "100%" : "0%" }} /></div><strong className="pipeline-count">{aiCount}</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Matches</span><div className="pipeline-track"><div className="pipeline-fill blue" style={{ width: `${Math.min(matchRate, 100)}%` }} /></div><strong className="pipeline-count">{matchedCount}</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Orçamentos</span><div className="pipeline-track"><div className="pipeline-fill amber" style={{ width: openQuoteCount ? "65%" : "0%" }} /></div><strong className="pipeline-count">{openQuoteCount}</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Aceitos</span><div className="pipeline-track"><div className="pipeline-fill purple" style={{ width: acceptedCount ? "42%" : "0%" }} /></div><strong className="pipeline-count">{acceptedCount}</strong></div>
            </div>
          </Card>

          <Card className="card-pad">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div className="stat-icon"><Sparkles size={18} /></div>
              <div><h2 className="card-title">Automação assistida</h2><p className="card-subtitle">SKU, preço, estoque e compatibilidade só aparecem quando existem no banco.</p></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}><span className="stat-foot"><Bot size={12} /> Taxa de match</span><strong style={{ fontSize: 14 }}>{matchRate.toFixed(1).replace(".", ",")}%</strong></div>
          </Card>
        </div>
      </div>
    </>
  );
}
