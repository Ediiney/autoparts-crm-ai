import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany } from "@/lib/company/current-company";
import { CarFront, MoreHorizontal, Plus } from "lucide-react";

export default async function VeiculosPage(){
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from("customer_vehicles")
    .select("id,customer_id,brand,model,year,model_year,engine,version,transmission,plate")
    .eq("company_id", company.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  const rows = vehicles ?? [];
  const customerIds = [...new Set(rows.map((vehicle) => vehicle.customer_id))];
  const { data: customers } = customerIds.length
    ? await supabase.from("customers").select("id,name").eq("company_id", company.id).in("id", customerIds)
    : { data: [] as Array<{ id: string; name: string }> };

  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer.name]));

  return (
    <>
      <PageHeader
        eyebrow="Garagem"
        title="Veículos"
        description="Veículos vinculados aos clientes para acelerar futuras consultas."
        actions={<Button icon={<Plus size={15}/>}>Adicionar veículo</Button>}
      />

      <Card>
        {rows.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Veículo</th><th>Ano</th><th>Motor</th><th>Câmbio</th><th>Cliente</th><th>Placa</th><th></th></tr></thead>
              <tbody>
                {rows.map((vehicle)=>(
                  <tr key={vehicle.id}>
                    <td><div className="table-main"><div className="avatar avatar-slate"><CarFront size={16}/></div><div><strong>{[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Veículo"}</strong><span>{vehicle.version || "Versão não informada"}</span></div></div></td>
                    <td>{vehicle.model_year || vehicle.year || "—"}</td>
                    <td>{vehicle.engine || "—"}</td>
                    <td>{vehicle.transmission || "—"}</td>
                    <td>{customerMap.get(vehicle.customer_id) || "Cliente"}</td>
                    <td><StatusBadge tone={vehicle.plate ? "info" : "neutral"}>{vehicle.plate || "Sem placa"}</StatusBadge></td>
                    <td><MoreHorizontal size={16} color="#8995a7"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><CarFront size={28}/><strong>Nenhum veículo cadastrado</strong><p>Cadastre o primeiro veículo ou deixe o CRM armazená-lo durante um atendimento.</p></div>
        )}
      </Card>
    </>
  );
}
