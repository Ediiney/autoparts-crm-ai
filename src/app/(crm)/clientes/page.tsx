import Link from "next/link";
import { MoreHorizontal, Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  timezone: string | null;
  active: boolean;
  vehicle_count: number;
  quote_total: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? (parts[0][0] + parts.at(-1)![0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default async function ClientesPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_customers_page", {
    p_branch_id: workspace.branch?.id ?? null,
    p_limit: 100,
  });

  if (error) throw error;

  const rows = ((data ?? []) as unknown as CustomerRow[]);
  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div>
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Relacionamento</span>
          <h1>Clientes</h1>
          <p>Carteira, contatos, fusos e histórico comercial.</p>
        </div>
        <Link href="/clientes/novo" className="button-v2 primary">
          <Plus size={14} /> Novo cliente
        </Link>
      </div>

      {rows.length ? (
        <div className="table-v2-wrap">
          <table className="table-v2">
            <thead>
              <tr>
                <th>Cliente</th><th>Contato</th><th>Veículos</th><th>Total cotado</th>
                <th>Fuso</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="product-cell-v2">
                      <div className="customer-avatar-v2">{initials(customer.name)}</div>
                      <div><strong>{customer.name}</strong><span>{customer.email || "Sem e-mail"}</span></div>
                    </div>
                  </td>
                  <td>{customer.whatsapp || customer.phone || "—"}</td>
                  <td>{Number(customer.vehicle_count ?? 0)}</td>
                  <td className="price-v2">{money.format(Number(customer.quote_total ?? 0))}</td>
                  <td>{customer.timezone || "Herdado"}</td>
                  <td>
                    <span className={customer.active ? "stock-v2" : "stock-v2 zero"}>
                      {customer.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <Link className="row-action-v2" href={`/clientes/${customer.id}`}>
                      Abrir <MoreHorizontal size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-v2">
          <div className="empty-v2-icon"><Users size={22} /></div>
          <h2>Nenhum cliente</h2>
          <p>Cadastre o primeiro cliente para iniciar a carteira.</p>
          <Link href="/clientes/novo" className="button-v2 primary">
            <Plus size={14} /> Novo cliente
          </Link>
        </div>
      )}
    </div>
  );
}
