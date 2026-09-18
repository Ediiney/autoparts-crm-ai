import Link from "next/link";
import { MoreHorizontal, Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? (parts[0][0] + parts.at(-1)![0]).toUpperCase() : name.slice(0,2).toUpperCase();
}

export default async function ClientesPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("id,name,phone,whatsapp,email,timezone,active,branch_id,updated_at")
    .eq("company_id", workspace.company.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (workspace.branch?.id) {
    query = query.or(`branch_id.eq.${workspace.branch.id},branch_id.is.null`);
  }

  const { data: customers } = await query;
  const rows = customers ?? [];
  const ids = rows.map(c=>c.id);

  const [{ data: vehicles }, { data: quotes }] = ids.length
    ? await Promise.all([
        supabase.from("customer_vehicles").select("customer_id,id").eq("company_id",workspace.company.id).in("customer_id",ids),
        supabase.from("quotes").select("customer_id,total").eq("company_id",workspace.company.id).in("customer_id",ids),
      ])
    : [{data:[]},{data:[]}];

  const vehicleCount = new Map<string,number>();
  for (const item of vehicles ?? []) vehicleCount.set(item.customer_id,(vehicleCount.get(item.customer_id)??0)+1);
  const quoteTotal = new Map<string,number>();
  for (const quote of quotes ?? []) if (quote.customer_id) quoteTotal.set(quote.customer_id,(quoteTotal.get(quote.customer_id)??0)+Number(quote.total));
  const money = new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

  return (
    <div>
      <div className="page-heading-v2">
        <div><span className="overline-v2">Relacionamento</span><h1>Clientes</h1><p>Carteira, contatos, fusos e histórico comercial.</p></div>
        <Link href="/clientes/novo" className="button-v2 primary"><Plus size={14}/> Novo cliente</Link>
      </div>

      {rows.length ? (
        <div className="table-v2-wrap">
          <table className="table-v2">
            <thead><tr><th>Cliente</th><th>Contato</th><th>Veículos</th><th>Total cotado</th><th>Fuso</th><th>Status</th><th></th></tr></thead>
            <tbody>{rows.map(customer=>(
              <tr key={customer.id}>
                <td><div className="product-cell-v2"><div className="customer-avatar-v2">{initials(customer.name)}</div><div><strong>{customer.name}</strong><span>{customer.email||"Sem e-mail"}</span></div></div></td>
                <td>{customer.whatsapp||customer.phone||"—"}</td>
                <td>{vehicleCount.get(customer.id)??0}</td>
                <td className="price-v2">{money.format(quoteTotal.get(customer.id)??0)}</td>
                <td>{customer.timezone||"Herdado"}</td>
                <td><span className={customer.active?"stock-v2":"stock-v2 zero"}>{customer.active?"Ativo":"Inativo"}</span></td>
                <td><Link className="row-action-v2" href={`/clientes/${customer.id}`}>Abrir <MoreHorizontal size={12}/></Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="empty-v2"><div className="empty-v2-icon"><Users size={22}/></div><h2>Nenhum cliente</h2><p>Cadastre o primeiro cliente para iniciar a carteira.</p><Link href="/clientes/novo" className="button-v2 primary"><Plus size={14}/> Novo cliente</Link></div>
      )}
    </div>
  );
}
