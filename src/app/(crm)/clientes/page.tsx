import { PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";
import { MoreHorizontal, Plus, Users } from "lucide-react";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? (parts[0][0] + parts.at(-1)![0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default async function ClientesPage(){
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id,name,phone,whatsapp,email,tags,active,updated_at")
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  const rows = customers ?? [];
  const ids = rows.map((customer) => customer.id);

  const [{ data: vehicles }, { data: quotes }] = ids.length
    ? await Promise.all([
        supabase.from("customer_vehicles").select("customer_id,brand,model,year").eq("company_id", company.id).in("customer_id", ids),
        supabase.from("quotes").select("customer_id,total").eq("company_id", company.id).in("customer_id", ids),
      ])
    : [{ data: [] }, { data: [] }];

  const vehicleMap = new Map<string, string>();
  for (const vehicle of vehicles ?? []) {
    if (!vehicleMap.has(vehicle.customer_id)) {
      vehicleMap.set(
        vehicle.customer_id,
        [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" "),
      );
    }
  }

  const quoteMap = new Map<string, number>();
  for (const quote of quotes ?? []) {
    if (!quote.customer_id) continue;
    quoteMap.set(
      quote.customer_id,
      (quoteMap.get(quote.customer_id) ?? 0) + Number(quote.total ?? 0),
    );
  }

  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <PageHeader
        eyebrow="Relacionamento"
        title="Clientes"
        description="Carteira de clientes, histórico de veículos e oportunidades de recompra."
        actions={<Button icon={<Plus size={15}/>}>Novo cliente</Button>}
      />

      <div className="toolbar">
        <div className="toolbar-right"><span className="metric-chip"><Users size={13}/> {rows.length} clientes carregados</span></div>
      </div>

      <Card>
        {rows.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Cliente</th><th>Contato</th><th>Veículo principal</th><th>Total cotado</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((customer)=>(
                  <tr key={customer.id}>
                    <td>
                      <div className="table-main">
                        <Avatar initials={initials(customer.name)} tone="green"/>
                        <div><strong>{customer.name}</strong><span>{customer.email || "Sem e-mail"}</span></div>
                      </div>
                    </td>
                    <td>{customer.whatsapp || customer.phone || "Sem telefone"}</td>
                    <td>{vehicleMap.get(customer.id) || "Nenhum veículo"}</td>
                    <td className="money">{money.format(quoteMap.get(customer.id) ?? 0)}</td>
                    <td><StatusBadge tone={customer.active ? "success" : "neutral"}>{customer.active ? "Ativo" : "Inativo"}</StatusBadge></td>
                    <td><MoreHorizontal size={16} color="#8995a7"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><Users size={28}/><strong>Nenhum cliente cadastrado</strong><p>Os clientes criados manualmente ou identificados nos atendimentos aparecerão aqui.</p></div>
        )}
      </Card>
    </>
  );
}
