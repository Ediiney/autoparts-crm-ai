import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CarFront, FileText, MessageSquareText, Pencil, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function ClienteDetailPage({params}:{params:Promise<{id:string}>}) {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id,name,email,phone,whatsapp,document,notes,timezone,active,branch_id,created_at")
    .eq("company_id",workspace.company.id).eq("id",id).maybeSingle();
  if (!customer) notFound();

  const [{data:vehicles},{data:quotes},{data:conversations}] = await Promise.all([
    supabase.from("customer_vehicles").select("id,brand,model,year,model_year,engine,plate").eq("company_id",workspace.company.id).eq("customer_id",id).order("updated_at",{ascending:false}),
    supabase.from("quotes").select("id,number,status,total,created_at").eq("company_id",workspace.company.id).eq("customer_id",id).order("created_at",{ascending:false}).limit(8),
    supabase.from("conversations").select("id,status,channel,last_message_at").eq("company_id",workspace.company.id).eq("customer_id",id).order("last_message_at",{ascending:false}).limit(8),
  ]);

  const money = new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const total=(quotes??[]).reduce((sum,q)=>sum+Number(q.total),0);

  return (
    <div>
      <div className="detail-breadcrumb-v2"><Link href="/clientes"><ArrowLeft size={14}/> Clientes</Link><span>/</span><span>{customer.name}</span></div>
      <div className="product-detail-v2-head">
        <div className="product-detail-v2-identity"><div className="product-detail-v2-media"><UserRound size={28}/></div><div><span className="overline-v2">Cliente</span><h1>{customer.name}</h1><div className="detail-tags-v2"><span>{customer.whatsapp||customer.phone||"Sem telefone"}</span><span>{customer.timezone||"Fuso herdado"}</span></div></div></div>
        <Link href={`/clientes/${id}/editar`} className="button-v2 secondary"><Pencil size={14}/> Editar</Link>
      </div>

      <div className="detail-metrics-v2">
        <Metric icon={<CarFront size={17}/>} label="Veículos" value={String(vehicles?.length??0)} sub="Cadastrados"/>
        <Metric icon={<FileText size={17}/>} label="Cotado" value={money.format(total)} sub={`${quotes?.length??0} orçamentos`}/>
        <Metric icon={<MessageSquareText size={17}/>} label="Conversas" value={String(conversations?.length??0)} sub="Histórico recente"/>
        <Metric icon={<UserRound size={17}/>} label="Status" value={customer.active?"Ativo":"Inativo"} sub={customer.email||"Sem e-mail"}/>
      </div>

      <div className="detail-grid-v2">
        <section className="panel-v2"><div className="panel-v2-title"><div><h2>Contato</h2><p>Informações do cliente.</p></div></div><div className="definition-grid-v2">
          <Def label="E-mail" value={customer.email}/><Def label="Telefone" value={customer.phone}/><Def label="WhatsApp" value={customer.whatsapp}/><Def label="Documento" value={customer.document}/>
        </div>{customer.notes?<div className="description-v2"><span>Observações</span><p>{customer.notes}</p></div>:null}</section>
        <section className="panel-v2"><div className="panel-v2-title"><div><h2>Veículos</h2><p>Garagem vinculada.</p></div></div>
          <div className="mini-table-v2">{(vehicles??[]).length?(vehicles??[]).map(v=><Link className="mini-table-v2-row" href={`/veiculos/${v.id}`} key={v.id}><div><strong>{v.brand} {v.model}</strong><span>{v.engine||"Motor não informado"}</span></div><span>{v.model_year||v.year||"—"}</span><span>{v.plate||"Sem placa"}</span></Link>):<div className="empty-line-v2">Nenhum veículo.</div>}</div>
        </section>
      </div>
    </div>
  );
}
function Metric({icon,label,value,sub}:{icon:React.ReactNode;label:string;value:string;sub:string}){return <div className="metric-v2"><div className="metric-v2-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>}
function Def({label,value}:{label:string;value:string|null}){return <div className="definition-v2"><span>{label}</span><strong>{value||"—"}</strong></div>}
