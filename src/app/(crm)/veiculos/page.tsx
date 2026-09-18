import Link from "next/link";
import { CarFront, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function VeiculosPage() {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const supabase=await createClient();

  let customersQuery=supabase.from("customers").select("id,name,branch_id").eq("company_id",workspace.company.id).eq("active",true);
  if(workspace.branch?.id) customersQuery=customersQuery.or(`branch_id.eq.${workspace.branch.id},branch_id.is.null`);
  const {data:customers}=await customersQuery;
  const customerIds=(customers??[]).map(c=>c.id);
  const customerMap=new Map((customers??[]).map(c=>[c.id,c.name]));

  const {data:vehicles}=customerIds.length
    ? await supabase.from("customer_vehicles").select("id,customer_id,brand,model,year,model_year,engine,version,transmission,plate,updated_at").eq("company_id",workspace.company.id).in("customer_id",customerIds).order("updated_at",{ascending:false})
    : {data:[]};
  const rows=vehicles??[];

  return <div>
    <div className="page-heading-v2"><div><span className="overline-v2">Garagem</span><h1>Veículos</h1><p>Veículos vinculados à carteira da filial.</p></div><Link href="/veiculos/novo" className="button-v2 primary"><Plus size={14}/> Adicionar veículo</Link></div>
    {rows.length?<div className="table-v2-wrap"><table className="table-v2">
      <thead><tr><th>Veículo</th><th>Ano</th><th>Motor</th><th>Câmbio</th><th>Cliente</th><th>Placa</th><th></th></tr></thead>
      <tbody>{rows.map(v=><tr key={v.id}>
        <td><div className="product-cell-v2"><div className="product-cell-v2-icon"><CarFront size={16}/></div><div><strong>{v.brand} {v.model}</strong><span>{v.version||"Versão não informada"}</span></div></div></td>
        <td>{v.model_year||v.year||"—"}</td><td>{v.engine||"—"}</td><td>{v.transmission||"—"}</td><td>{customerMap.get(v.customer_id)||"Cliente"}</td><td>{v.plate||"—"}</td><td><Link className="row-action-v2" href={`/veiculos/${v.id}`}>Detalhes</Link></td>
      </tr>)}</tbody>
    </table></div>:<div className="empty-v2"><div className="empty-v2-icon"><CarFront size={22}/></div><h2>Nenhum veículo</h2><p>Adicione um veículo para acelerar as consultas de compatibilidade.</p><Link href="/veiculos/novo" className="button-v2 primary"><Plus size={14}/> Adicionar veículo</Link></div>}
  </div>;
}
