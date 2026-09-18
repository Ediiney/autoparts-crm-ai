import { BarChart3, Bot, CircleDollarSign, MessageSquareText, SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function RelatoriosPage() {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const supabase=await createClient();
  const companyId=workspace.company.id;
  const branchId=workspace.branch?.id;

  let aiQuery=supabase.from("ai_interactions").select("decision,confidence,missing_fields,part_name,raw_message,created_at").eq("company_id",companyId).order("created_at",{ascending:false}).limit(500);
  let conversationsQuery=supabase.from("conversations").select("id,status,created_at").eq("company_id",companyId).order("created_at",{ascending:false}).limit(500);
  let quotesQuery=supabase.from("quotes").select("id,status,total,created_at").eq("company_id",companyId).order("created_at",{ascending:false}).limit(500);

  if(branchId) {
    aiQuery=aiQuery.eq("branch_id",branchId);
    conversationsQuery=conversationsQuery.eq("branch_id",branchId);
    quotesQuery=quotesQuery.eq("branch_id",branchId);
  }

  const [{data:ai},{data:conversations},{data:quotes}]=await Promise.all([aiQuery,conversationsQuery,quotesQuery]);
  const interactions=ai??[];
  const quoteRows=quotes??[];
  const matched=interactions.filter(item=>item.decision==="matched");
  const confidence=matched.length?matched.reduce((sum,item)=>sum+Number(item.confidence),0)/matched.length:0;
  const accepted=quoteRows.filter(item=>item.status==="accepted");
  const acceptedValue=accepted.reduce((sum,item)=>sum+Number(item.total),0);
  const conversion=quoteRows.length?accepted.length/quoteRows.length:0;
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

  const missing=new Map<string,number>();
  for(const item of interactions) {
    for(const field of item.missing_fields??[]) missing.set(field,(missing.get(field)??0)+1);
  }
  const missingRows=[...missing.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxMissing=missingRows[0]?.[1]??1;

  const noMatch=new Map<string,number>();
  for(const item of interactions.filter(row=>row.decision==="not_found")) {
    const key=item.part_name?.trim()||item.raw_message.trim();
    if(key) noMatch.set(key,(noMatch.get(key)??0)+1);
  }
  const noMatchRows=[...noMatch.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);

  return <div>
    <div className="page-heading-v2"><div><span className="overline-v2">Inteligência operacional</span><h1>Relatórios</h1><p>Indicadores reais da atividade recente da {workspace.branch?.name??"empresa"}.</p></div></div>

    <div className="metric-grid-v2">
      <Metric icon={<Bot size={16}/>} label="Confiança média" value={`${(confidence*100).toFixed(1).replace(".",",")}%`} sub={`${matched.length} matches`}/>
      <Metric icon={<MessageSquareText size={16}/>} label="Conversas" value={String(conversations?.length??0)} sub="amostra recente"/>
      <Metric icon={<BarChart3 size={16}/>} label="Conversão" value={`${(conversion*100).toFixed(1).replace(".",",")}%`} sub={`${accepted.length} aceitos`}/>
      <Metric icon={<CircleDollarSign size={16}/>} label="Valor aceito" value={money.format(acceptedValue)} sub="orçamentos aceitos"/>
    </div>

    <div className="report-grid-v2">
      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Dados que mais faltam</h2><p>Campos que geram perguntas complementares.</p></div></div>
        {missingRows.length?<div className="report-bars-v2">{missingRows.map(([field,count])=><div key={field}><div><span>{field.replaceAll("_"," ")}</span><strong>{count}</strong></div><i><b style={{width:`${Math.max(8,(count/maxMissing)*100)}%`}}/></i></div>)}</div>:<div className="empty-line-v2">Ainda não há perguntas complementares suficientes.</div>}
      </section>
      <section className="panel-v2">
        <div className="panel-v2-title"><SearchX size={16}/><div><h2>Consultas sem resultado</h2><p>Oportunidades para enriquecer o catálogo.</p></div></div>
        {noMatchRows.length?<div className="report-list-v2">{noMatchRows.map(([name,count],index)=><div key={name}><i>{index+1}</i><div><strong>{name}</strong><span>{count} busca{count>1?"s":""} sem match</span></div></div>)}</div>:<div className="empty-line-v2">Nenhuma consulta sem resultado na amostra recente.</div>}
      </section>
    </div>
  </div>;
}

function Metric({icon,label,value,sub}:{icon:React.ReactNode;label:string;value:string;sub:string}) {
  return <div className="metric-v2"><div className="metric-v2-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>;
}
