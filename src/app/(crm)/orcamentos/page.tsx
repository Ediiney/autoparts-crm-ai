import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { FileText, Plus } from "lucide-react";

function tone(status: string): "neutral" | "success" | "warning" | "danger" | "info" | "purple" {
  if (status === "accepted") return "success";
  if (status === "sent") return "info";
  if (status === "draft") return "warning";
  if (status === "expired" || status === "rejected" || status === "cancelled") return "danger";
  return "neutral";
}

const labels: Record<string, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  accepted: "Aceito",
  rejected: "Recusado",
  expired: "Expirado",
  cancelled: "Cancelado",
};

export default async function OrcamentosPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const supabase = await createClient();
  const companyId = workspace.company.id;

  let quotesQuery = supabase
    .from("quotes")
    .select("id,number,customer_id,status,total,created_at,expires_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(60);

  if (workspace.branch?.id) {
    quotesQuery = quotesQuery.eq("branch_id", workspace.branch.id);
  }

  const { data: quotes } = await quotesQuery;
  const rows = quotes ?? [];
  const customerIds = [...new Set(
    rows.map((quote) => quote.customer_id).filter((id): id is string => Boolean(id)),
  )];

  const { data: customers } = customerIds.length
    ? await supabase
        .from("customers")
        .select("id,name")
        .eq("company_id", companyId)
        .in("id", customerIds)
    : { data: [] as Array<{ id: string; name: string }> };

  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer.name]));
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const date = new Intl.DateTimeFormat("pt-BR", {
    timeZone: workspace.timezone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <PageHeader
        eyebrow="Comercial"
        title="Orçamentos"
        description={`Propostas da ${workspace.branch?.name ?? "operação"} em ${workspace.timezone}.`}
        actions={<Button icon={<Plus size={15} />}>Novo orçamento</Button>}
      />

      {rows.length ? (
        <div className="quote-grid">
          {rows.map((quote) => (
            <Card className="quote-card" key={quote.id}>
              <div className="quote-top">
                <div><span className="quote-number">#{quote.number}</span><h3>{quote.customer_id ? customerMap.get(quote.customer_id) ?? "Cliente" : "Cliente"}</h3></div>
                <StatusBadge tone={tone(quote.status)}>{labels[quote.status] ?? quote.status}</StatusBadge>
              </div>
              <div className="quote-meta">
                <div><span>Valor</span><strong>{money.format(Number(quote.total ?? 0))}</strong></div>
                <div><span>Validade</span><strong>{quote.expires_at ? date.format(new Date(quote.expires_at)) : "Sem prazo"}</strong></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="time-label">Criado em {date.format(new Date(quote.created_at))}</span>
                <Button variant="secondary" icon={<FileText size={13} />}>Abrir</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><div className="empty-state"><FileText size={30} /><strong>Nenhum orçamento criado</strong><p>As cotações desta filial aparecerão aqui.</p></div></Card>
      )}
    </>
  );
}
