import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

const labels: Record<string,string>={draft:"Rascunho",sent:"Enviado",accepted:"Aceito",rejected:"Recusado",expired:"Expirado",cancelled:"Cancelado"};

export default async function OrcamentosPage(){
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const supabase=await createClient();
  let query=supabase.from("quotes").select("id,number,customer_id,status,total,created_at,expires_at").eq("company_id",workspace.company.id).order("created_at",{ascending:false}).limit(80);
  if(workspace.branch?.id) query=query.eq("branch_id",workspace.branch.id);
  const {data:quotes}=await query;
  const rows=quotes??[];
  const customerIds=[...new Set(rows.map(q=>q.customer_id).filter((id):id is string=>Boolean(id)))];
  const {data:customers}=customerIds.length
    ? await supabase.from("customers").select("id,name").eq("company_id",workspace.company.id).in("id",customerIds)
    : {data:[] as Array<{id:string;name:string}>};
  const customerMap=new Map((customers??[]).map(c=>[c.id,c.name]));
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const date=new Intl.DateTimeFormat("pt-BR",{timeZone:workspace.timezone,day:"2-digit",month:"short",year:"numeric"});

  return <div>
    <div className="page-heading-v2">
      <div><span className="overline-v2">Comercial</span><h1>Orçamentos</h1><p>Propostas da {workspace.branch?.name??"operação"} e seu estágio comercial.</p></div>
      <Link href="/orcamentos/novo" className="button-v2 primary"><Plus size={14}/> Novo orçamento</Link>
    </div>

    {rows.length?<div className="table-v2-wrap"><table className="table-v2">
      <thead><tr><th>Número</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Criado</th><th>Validade</th><th></th></tr></thead>
      <tbody>{rows.map(q=><tr key={q.id}>
        <td><strong>#{q.number}</strong></td>
        <td>{q.customer_id?customerMap.get(q.customer_id)??"Cliente":"Cliente avulso"}</td>
        <td className="price-v2">{money.format(Number(q.total))}</td>
        <td><span className={q.status==="accepted"?"stock-v2":q.status==="rejected"||q.status==="cancelled"?"status-danger-v2":"source-pill-v2"}>{labels[q.status]??q.status}</span></td>
        <td>{date.format(new Date(q.created_at))}</td>
        <td>{q.expires_at?date.format(new Date(q.expires_at)):"—"}</td>
        <td><Link className="row-action-v2" href={`/orcamentos/${q.id}`}>Abrir</Link></td>
      </tr>)}</tbody>
    </table></div>:<div className="empty-v2"><div className="empty-v2-icon"><FileText size={22}/></div><h2>Nenhum orçamento</h2><p>Crie uma proposta vinculada a um cliente e produtos do catálogo.</p><Link href="/orcamentos/novo" className="button-v2 primary"><Plus size={14}/> Novo orçamento</Link></div>}
  </div>;
}
