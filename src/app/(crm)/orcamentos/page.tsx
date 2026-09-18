import Link from "next/link";
import { ArrowUpRight, CircleDollarSign, FileCheck2, FileClock, FileText, Plus } from "lucide-react";
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
  const draftRows=rows.filter(row=>row.status==="draft");
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
  const pipelineValue=openValue+acceptedValue;
  const conversionBase=sentRows.length+acceptedRows.length;
  const conversion=conversionBase?acceptedRows.length/conversionBase:0;
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const date=new Intl.DateTimeFormat("pt-BR",{
    timeZone:workspace.timezone,day:"2-digit",month:"short",year:"numeric",
  });

  return <div className="commercial-page-v5">
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

    <section className="commercial-overview-v5">
      <div className="commercial-overview-main-v5">
        <span>Pipeline comercial</span>
        <strong>{money.format(pipelineValue)}</strong>
        <p>Valor total entre propostas em negociação e propostas aceitas.</p>
        <div className="commercial-overview-main-footer-v5">
          <div><span>Conversão</span><strong>{(conversion*100).toFixed(1).replace(".",",")}%</strong></div>
          <div><span>Filial</span><strong>{workspace.branch?.name??"Consolidado"}</strong></div>
        </div>
      </div>

      <div className="commercial-overview-stats-v5">
        <Metric icon={<FileText size={17}/>} label="Rascunhos" value={String(draftRows.length)} hint="em preparação"/>
        <Metric icon={<FileClock size={17}/>} label="Enviados" value={String(sentRows.length)} hint={money.format(openValue)}/>
        <Metric icon={<FileCheck2 size={17}/>} label="Aceitos" value={String(acceptedRows.length)} hint={money.format(acceptedValue)}/>
      </div>
    </section>

    <section className="commercial-section-v5">
      <div className="commercial-toolbar-v5">
        <div className="commercial-tabs-v5">
          <Link className={activeTab==="all"?"active":""} href="/orcamentos">Todos <span>{rows.length}</span></Link>
          <Link className={activeTab==="open"?"active":""} href="/orcamentos?status=open">Em aberto <span>{openRows.length}</span></Link>
          <Link className={activeTab==="sent"?"active":""} href="/orcamentos?status=sent">Enviados <span>{sentRows.length}</span></Link>
          <Link className={activeTab==="accepted"?"active":""} href="/orcamentos?status=accepted">Aceitos <span>{acceptedRows.length}</span></Link>
        </div>
        <div className="commercial-toolbar-meta-v5">
          <CircleDollarSign size={14}/>
          <span>{money.format(filtered.reduce((sum,row)=>sum+Number(row.total??0),0))}</span>
        </div>
      </div>

      {filtered.length?<div className="table-v2-wrap commercial-table-v5">
        <table className="table-v2">
          <thead><tr><th>Documento</th><th>Cliente</th><th>Valor</th><th>Etapa</th><th>Criado</th><th>Validade</th><th></th></tr></thead>
          <tbody>{filtered.map(quote=><tr key={quote.id}>
            <td>
              <div className="document-cell-v5">
                <span>ORÇ</span>
                <div><strong>#{String(quote.number).padStart(5,"0")}</strong><small>proposta comercial</small></div>
              </div>
            </td>
            <td><strong>{quote.customer_name||"Cliente avulso"}</strong></td>
            <td className="price-v2">{money.format(Number(quote.total??0))}</td>
            <td><span className={statusClass(quote.status)}>{labels[quote.status]??quote.status}</span></td>
            <td>{date.format(new Date(quote.created_at))}</td>
            <td>{quote.expires_at?date.format(new Date(quote.expires_at)):"Sem prazo"}</td>
            <td><Link className="row-action-v2" prefetch={false} href={`/orcamentos/${quote.id}`}>Abrir <ArrowUpRight size={12}/></Link></td>
          </tr>)}</tbody>
        </table>
      </div>:<div className="empty-v2 commercial-empty-v5">
        <div className="empty-v2-icon"><FileText size={22}/></div>
        <h2>{rows.length?"Nenhum orçamento neste estágio":"Nenhum orçamento ainda"}</h2>
        <p>{rows.length?"Escolha outro estágio comercial.":"Crie a primeira proposta usando os produtos do catálogo."}</p>
        {!rows.length?<Link href="/orcamentos/novo" className="button-v2 primary"><Plus size={14}/> Novo orçamento</Link>:null}
      </div>}
    </section>
  </div>;
}

function Metric({icon,label,value,hint}:{icon:React.ReactNode;label:string;value:string;hint:string}){
  return <div className="commercial-overview-metric-v5"><i>{icon}</i><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>;
}
