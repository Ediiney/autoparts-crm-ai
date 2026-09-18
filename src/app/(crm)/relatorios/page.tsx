import { BarChart3, Bot, CircleDollarSign, MessageSquareText, SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type ReportsPayload = {
  metrics?: {
    confidence?: number;
    matched_count?: number;
    conversation_count?: number;
    quote_count?: number;
    accepted_count?: number;
    accepted_value?: number;
  };
  missingFields?: Array<{ field: string; count: number }>;
  noMatch?: Array<{ name: string; count: number }>;
};

export default async function RelatoriosPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_reports_summary", {
    p_branch_id: workspace.branch?.id ?? null,
    p_limit: 500,
  });

  if (error) throw error;

  const summary = (data ?? {}) as ReportsPayload;
  const metrics = summary.metrics ?? {};
  const confidence = Number(metrics.confidence ?? 0);
  const matchedCount = Number(metrics.matched_count ?? 0);
  const conversationCount = Number(metrics.conversation_count ?? 0);
  const quoteCount = Number(metrics.quote_count ?? 0);
  const acceptedCount = Number(metrics.accepted_count ?? 0);
  const acceptedValue = Number(metrics.accepted_value ?? 0);
  const conversion = quoteCount > 0 ? acceptedCount / quoteCount : 0;
  const missingRows = summary.missingFields ?? [];
  const noMatchRows = summary.noMatch ?? [];
  const maxMissing = missingRows[0]?.count ?? 1;
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Inteligência operacional</span>
          <h1>Relatórios</h1>
          <p>Indicadores agregados no banco da {workspace.branch?.name ?? "empresa"}, sem transportar centenas de registros para a página.</p>
        </div>
      </div>

      <div className="metric-grid-v2">
        <Metric icon={<Bot size={16}/>} label="Confiança média" value={`${(confidence*100).toFixed(1).replace(".",",")}%`} sub={`${matchedCount} matches`}/>
        <Metric icon={<MessageSquareText size={16}/>} label="Conversas" value={String(conversationCount)} sub="amostra recente"/>
        <Metric icon={<BarChart3 size={16}/>} label="Conversão" value={`${(conversion*100).toFixed(1).replace(".",",")}%`} sub={`${acceptedCount} aceitos`}/>
        <Metric icon={<CircleDollarSign size={16}/>} label="Valor aceito" value={money.format(acceptedValue)} sub="orçamentos aceitos"/>
      </div>

      <div className="report-grid-v2">
        <section className="panel-v2">
          <div className="panel-v2-title"><div><h2>Dados que mais faltam</h2><p>Campos que geram perguntas complementares.</p></div></div>
          {missingRows.length ? (
            <div className="report-bars-v2">
              {missingRows.map(({field,count}) => (
                <div key={field}>
                  <div><span>{field.replaceAll("_"," ")}</span><strong>{count}</strong></div>
                  <i><b style={{width:`${Math.max(8,(count/maxMissing)*100)}%`}}/></i>
                </div>
              ))}
            </div>
          ) : <div className="empty-line-v2">Ainda não há perguntas complementares suficientes.</div>}
        </section>

        <section className="panel-v2">
          <div className="panel-v2-title"><SearchX size={16}/><div><h2>Consultas sem resultado</h2><p>Oportunidades para enriquecer o catálogo.</p></div></div>
          {noMatchRows.length ? (
            <div className="report-list-v2">
              {noMatchRows.map(({name,count},index) => (
                <div key={name}><i>{index+1}</i><div><strong>{name}</strong><span>{count} busca{count>1?"s":""} sem match</span></div></div>
              ))}
            </div>
          ) : <div className="empty-line-v2">Nenhuma consulta sem resultado na amostra recente.</div>}
        </section>
      </div>
    </div>
  );
}

function Metric({icon,label,value,sub}:{icon:React.ReactNode;label:string;value:string;sub:string}) {
  return <div className="metric-v2"><div className="metric-v2-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>;
}
