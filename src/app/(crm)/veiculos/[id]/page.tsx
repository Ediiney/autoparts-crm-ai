import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CarFront, Pencil, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function VeiculoDetailPage({params}:{params:Promise<{id:string}>}) {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const {id}=await params;
  const supabase=await createClient();
  const {data:vehicle}=await supabase.from("customer_vehicles").select("id,customer_id,brand,model,year,model_year,engine,version,transmission,fuel,plate,chassis,notes,created_at").eq("company_id",workspace.company.id).eq("id",id).maybeSingle();
  if(!vehicle) notFound();
  const {data:customer}=await supabase.from("customers").select("id,name,whatsapp,phone").eq("company_id",workspace.company.id).eq("id",vehicle.customer_id).maybeSingle();

  return <div>
    <div className="detail-breadcrumb-v2"><Link href="/veiculos"><ArrowLeft size={14}/> Veículos</Link><span>/</span><span>{vehicle.brand} {vehicle.model}</span></div>
    <div className="product-detail-v2-head"><div className="product-detail-v2-identity"><div className="product-detail-v2-media"><CarFront size={30}/></div><div><span className="overline-v2">Veículo</span><h1>{vehicle.brand} {vehicle.model}</h1><div className="detail-tags-v2"><span>{vehicle.model_year||vehicle.year||"Ano não informado"}</span>{vehicle.plate?<span>{vehicle.plate}</span>:null}{vehicle.engine?<span>{vehicle.engine}</span>:null}</div></div></div><Link href={`/veiculos/${id}/editar`} className="button-v2 secondary"><Pencil size={14}/> Editar</Link></div>

    <div className="detail-grid-v2">
      <section className="panel-v2"><div className="panel-v2-title"><div><h2>Dados técnicos</h2><p>Identificação do veículo.</p></div></div><div className="definition-grid-v2">
        <Def label="Marca" value={vehicle.brand}/><Def label="Modelo" value={vehicle.model}/><Def label="Versão" value={vehicle.version}/><Def label="Motor" value={vehicle.engine}/><Def label="Câmbio" value={vehicle.transmission}/><Def label="Combustível" value={vehicle.fuel}/><Def label="Placa" value={vehicle.plate}/><Def label="Chassi" value={vehicle.chassis}/>
      </div></section>
      <section className="panel-v2"><div className="panel-v2-title"><div><h2>Proprietário / cliente</h2><p>Vínculo no CRM.</p></div></div>{customer?<Link className="owner-card-v2" href={`/clientes/${customer.id}`}><div className="metric-v2-icon"><UserRound size={16}/></div><div><strong>{customer.name}</strong><span>{customer.whatsapp||customer.phone||"Sem telefone"}</span></div></Link>:<div className="empty-line-v2">Cliente não encontrado.</div>}{vehicle.notes?<div className="description-v2"><span>Observações</span><p>{vehicle.notes}</p></div>:null}</section>
    </div>
  </div>;
}
function Def({label,value}:{label:string;value:string|null}){return <div className="definition-v2"><span>{label}</span><strong>{value||"—"}</strong></div>}
