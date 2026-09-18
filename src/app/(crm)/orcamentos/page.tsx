import Link from "next/link";
import { CircleDollarSign, FileCheck2, FileClock, FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type QuoteRow={
  id:string;number:number;customer_id:string|null;customer_name:string;status:string;
  total:number;created_at:string;expires_at:string|null;
};

const labels:Record<string,string>={
  draft:"Rascunho",sent:"Enviado",accepted:"Aceito",rejected:"Recusado",
  expired:"Expirado",cancelled:"Cancelado",
};

function statusClass(status:string){
  if(status==="accepted")return "commerce-status-v3 success";
  if(status==="rejected"||status==="cancelled"||status==="expired")return "commerce-status-v3 danger";
  if(status==="sent")return "commerce-status-v3 info";
  return "commerce-status-v3 neutral";
}

export default async function OrcamentosPage({
  searchParams,
}:{
  searchParams:Promise<{status?:string}>;
}){
  const workspace=await getWorkspaceContext();
  if(!workspace)return null;

  const params=await searchParams;
  const activeTab=params.status??"all";
  const supabase=await createClient();
  const {data,error}=await supabase.rpc("get_quotes_page",{
    p_branch_id:workspace.branch?.id??undefined,
    p_limit:120,
  });
  if(error)throw error;

  const rows=((data??[]) as unknown as QuoteRow[]);
  const openRows=rows.filter(row=>["draft","sent"].includes(row.status));
  const sentRows=rows.filter(row=>row.status==="sent");
  const acceptedRows=rows.filter(row=>row.status==="accepted");
  const filtered=activeTab==="open"
    ? openRows
    : activeTab==="sent"
      ? sentRows
      : activeTab==="accepted"
        ? acceptedRows
        : rows;

  const openValue=openRows.reduce((sum,row)=>sum+Number(row.total??0),0);
  const acceptedValue=acceptedRows.reduce((sum,row)=>sum+Number(row.total??0),0);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const date=new Intl.DateTimeFormat("pt-BR",{
    timeZone:workspace.timezone,day:"2-digit",month:"short",year:"numeric",
  });

  return <div>
    <div className="page-heading-v2">
      <div>
        <span className="overline-v2">Comercial</span>
        <h1>Orçamentos</h1>
        <p>Propostas, negociação e conversão em pedidos da {workspace.branch?.name??"operação"}.</p>
      </div>
      <div className="page-heading-v2-actions">
        <Link href="/pedidos" className="button-v2 secondary">Ver pedidos</Link>
        <Link href="/orcamentos/novo" className="button-v2 primary"><Plus size={14}/> Novo orçamento</Link>
      </div>
    </div>

    <div className="commerce-metrics-v3">
      <div><span><FileText size={14}/> Em aberto</span><strong>{openRows.length}</strong><small>{money.format(openValue)}</small></div>
      <div><span><FileClock size={14}/> Enviados</span><strong>{sentRows.length}</strong><small>aguardando decisão</small></div>
      <div><span><FileCheck2 size={14}/> Aceitos</span><strong>{acceptedRows.length}</strong><small>prontos para pedido</small></div>
      <div><span><CircleDollarSign size={14}/> Valor aceito</span><strong className="commerce-money-v3">{money.format(acceptedValue)}</strong><small>vendas aprovadas</small></div>
    </div>

    <div className="commercial-tabs-v3">
      <Link className={activeTab==="all"?"active":""} href="/orcamentos">Todos <span>{rows.length}</span></Link>
      <Link className={activeTab==="open"?"active":""} href="/orcamentos?status=open">Em aberto <span>{openRows.length}</span></Link>
      <Link className={activeTab==="sent"?"active":""} href="/orcamentos?status=sent">Enviados <span>{sentRows.length}</span></Link>
      <Link className={activeTab==="accepted"?"active":""} href="/orcamentos?status=accepted">Aceitos <span>{acceptedRows.length}</span></Link>
    </div>

    {filtered.length?<div className="table-v2-wrap commerce-table-v3">
      <table className="table-v2">
        <thead><tr><th>Orçamento</th><th>Cliente</th><th>Total</th><th>Status</th><th>Criado</th><th>Validade</th><th></th></tr></thead>
        <tbody>{filtered.map(quote=><tr key={quote.id}>
          <td><div className="order-number-v3"><span>#{String(quote.number).padStart(5,"0")}</span><small>proposta comercial</small></div></td>
          <td><strong>{quote.customer_name||"Cliente avulso"}</strong></td>
          <td className="price-v2">{money.format(Number(quote.total??0))}</td>
          <td><span className={statusClass(quote.status)}>{labels[quote.status]??quote.status}</span></td>
          <td>{date.format(new Date(quote.created_at))}</td>
          <td>{quote.expires_at?date.format(new Date(quote.expires_at)):"Sem prazo"}</td>
          <td><Link className="row-action-v2" prefetch={false} href={`/orcamentos/${quote.id}`}>Abrir</Link></td>
        </tr>)}</tbody>
      </table>
    </div>:<div className="empty-v2">
      <div className="empty-v2-icon"><FileText size={22}/></div>
      <h2>{rows.length?"Nenhum orçamento neste filtro":"Nenhum orçamento ainda"}</h2>
      <p>{rows.length?"Escolha outro estágio comercial.":"Crie a primeira proposta usando produtos do catálogo."}</p>
      {!rows.length?<Link href="/orcamentos/novo" className="button-v2 primary"><Plus size={14}/> Novo orçamento</Link>:null}
    </div>}
  </div>;
}
