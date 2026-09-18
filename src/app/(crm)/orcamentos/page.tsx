import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type QuoteRow = {
  id: string;
  number: number;
  customer_id: string | null;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
  expires_at: string | null;
};

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
  const { data, error } = await supabase.rpc("get_quotes_page", {
    p_branch_id: workspace.branch?.id ?? null,
    p_limit: 80,
  });

  if (error) throw error;

  const rows = ((data ?? []) as unknown as QuoteRow[]);
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const date = new Intl.DateTimeFormat("pt-BR", {
    timeZone: workspace.timezone,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Comercial</span>
          <h1>Orçamentos</h1>
          <p>Propostas da {workspace.branch?.name ?? "operação"} e seu estágio comercial.</p>
        </div>
        <Link href="/orcamentos/novo" className="button-v2 primary">
          <Plus size={14} /> Novo orçamento
        </Link>
      </div>

      {rows.length ? (
        <div className="table-v2-wrap">
          <table className="table-v2">
            <thead>
              <tr><th>Número</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Criado</th><th>Validade</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((quote) => (
                <tr key={quote.id}>
                  <td><strong>#{quote.number}</strong></td>
                  <td>{quote.customer_name || "Cliente avulso"}</td>
                  <td className="price-v2">{money.format(Number(quote.total ?? 0))}</td>
                  <td>
                    <span className={
                      quote.status === "accepted"
                        ? "stock-v2"
                        : quote.status === "rejected" || quote.status === "cancelled"
                          ? "status-danger-v2"
                          : "source-pill-v2"
                    }>
                      {labels[quote.status] ?? quote.status}
                    </span>
                  </td>
                  <td>{date.format(new Date(quote.created_at))}</td>
                  <td>{quote.expires_at ? date.format(new Date(quote.expires_at)) : "—"}</td>
                  <td><Link className="row-action-v2" href={`/orcamentos/${quote.id}`}>Abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-v2">
          <div className="empty-v2-icon"><FileText size={22} /></div>
          <h2>Nenhum orçamento</h2>
          <p>Crie uma proposta vinculada a um cliente e produtos do catálogo.</p>
          <Link href="/orcamentos/novo" className="button-v2 primary">
            <Plus size={14} /> Novo orçamento
          </Link>
        </div>
      )}
    </div>
  );
}
