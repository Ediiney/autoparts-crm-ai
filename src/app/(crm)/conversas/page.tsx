import Link from "next/link";
import { Avatar, Button, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";\nimport { formatTimeInTimezone } from "@/lib/timezones";
import {
  Bot,
  CarFront,
  FileText,
  MessageCircleMore,
  MoreHorizontal,
  Phone,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";

const statusLabel: Record<string, string> = {
  open: "Aberto",
  waiting_customer: "Aguardando cliente",
  waiting_agent: "Atendimento humano",
  resolved: "Resolvido",
  cancelled: "Cancelado",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? (parts[0][0] + parts.at(-1)![0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function tone(status: string): "neutral" | "success" | "warning" | "danger" | "info" | "purple" {
  if (status === "waiting_customer") return "warning";
  if (status === "waiting_agent") return "purple";
  if (status === "resolved") return "success";
  if (status === "cancelled") return "danger";
  return "info";
}

export default async function ConversasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = await createClient();
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id,customer_id,channel,status,last_message_at,created_at")
    .eq("company_id", company.id)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(40);

  const rows = conversations ?? [];
  const params = await searchParams;
  const activeId = rows.some((item) => item.id === params.id)
    ? params.id!
    : rows[0]?.id;

  const customerIds = [...new Set(rows.map((item) => item.customer_id).filter((id): id is string => Boolean(id)))];
  const { data: customers } = customerIds.length
    ? await supabase.from("customers").select("id,name,phone,whatsapp,email,created_at").eq("company_id", company.id).in("id", customerIds)
    : { data: [] as Array<{ id: string; name: string; phone: string | null; whatsapp: string | null; email: string | null; created_at: string }> };

  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const activeConversation = rows.find((item) => item.id === activeId);
  const activeCustomer = activeConversation?.customer_id
    ? customerMap.get(activeConversation.customer_id)
    : undefined;

  const [{ data: messages }, { data: aiInteraction }, { data: vehicles }] = activeId
    ? await Promise.all([
        supabase.from("conversation_messages").select("id,sender_type,content,created_at").eq("company_id", company.id).eq("conversation_id", activeId).order("created_at", { ascending: true }),
        supabase.from("ai_interactions").select("part_name,vehicle,confidence,decision,missing_fields,created_at").eq("company_id", company.id).eq("conversation_id", activeId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        activeCustomer
          ? supabase.from("customer_vehicles").select("id,brand,model,year,model_year,engine,version,transmission,plate").eq("company_id", company.id).eq("customer_id", activeCustomer.id).order("updated_at", { ascending: false }).limit(1)
          : Promise.resolve({ data: [], error: null }),
      ])
    : [{ data: [] }, { data: null }, { data: [] }];

  const vehicle = vehicles?.[0];
  const aiVehicle =
    aiInteraction?.vehicle && typeof aiInteraction.vehicle === "object" && !Array.isArray(aiInteraction.vehicle)
      ? aiInteraction.vehicle as Record<string, unknown>
      : {};

  return (
    <>
      <div className="page-header">
        <div><div className="eyebrow">Central de atendimento</div><h1>Conversas</h1><p>Inbox unificada com histórico real do CRM e análise da IA.</p></div>
        <div className="page-actions"><Button variant="secondary" icon={<UserRound size={15}/>}>Fila humana</Button></div>
      </div>

      {rows.length ? (
        <div className="inbox-layout">
          <aside className="inbox-sidebar">
            <div className="inbox-sidebar-header">
              <h2>Caixa de entrada</h2>
              <div className="inbox-tabs"><button className="inbox-tab active">Todas {rows.length}</button></div>
            </div>
            <div className="conversation-list">
              {rows.map((conversation)=>{
                const customer = conversation.customer_id ? customerMap.get(conversation.customer_id) : undefined;
                const name = customer?.name ?? "Cliente";
                return (
                  <Link href={`/conversas?id=${conversation.id}`} className={conversation.id===activeId?"conversation-card active":"conversation-card"} key={conversation.id} style={{textDecoration:"none"}}>
                    <Avatar initials={initials(name)} tone={conversation.status==="waiting_agent"?"purple":conversation.status==="waiting_customer"?"amber":"green"}/>
                    <div className="conversation-copy">
                      <div className="conversation-name"><strong>{name}</strong></div>
                      <div className="conversation-message">{statusLabel[conversation.status] ?? conversation.status}</div>
                    </div>
                    <div className="conversation-meta"><time>{formatTimeInTimezone(conversation.last_message_at || conversation.created_at, workspace.timezone)}</time></div>
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="chat-panel">
            <header className="chat-header">
              <div className="chat-contact"><Avatar initials={initials(activeCustomer?.name ?? "Cliente")} tone="green"/><div><strong>{activeCustomer?.name ?? "Cliente"}</strong><span>{activeConversation?.channel ?? "web"} · {statusLabel[activeConversation?.status ?? "open"]}</span></div></div>
              <div className="chat-actions"><button className="icon-button"><Phone size={16}/></button><button className="icon-button"><MoreHorizontal size={17}/></button></div>
            </header>

            <div className="chat-body">
              <div className="chat-day">Histórico do atendimento</div>
              {(messages ?? []).length ? (messages ?? []).map((message)=>(
                <div className={`message-row ${message.sender_type === "customer" ? "customer" : message.sender_type === "agent" ? "agent" : "ai"}`} key={message.id}>
                  <div className="message-bubble">
                    {message.content}
                    <small>{formatTimeInTimezone(message.created_at, workspace.timezone)} · {message.sender_type === "customer" ? "cliente" : message.sender_type === "agent" ? "atendente" : "IA"}</small>
                  </div>
                </div>
              )) : (
                <div className="empty-state"><MessageCircleMore size={28}/><strong>Sem mensagens ainda</strong><p>As mensagens desta conversa aparecerão aqui.</p></div>
              )}

              {aiInteraction ? (
                <div className="ai-note">
                  <Bot size={16}/>
                  <div>
                    <strong>Última análise da IA · {(Number(aiInteraction.confidence) * 100).toFixed(0)}% de confiança</strong>
                    <p>{aiInteraction.part_name || "Peça não identificada"} · decisão: {aiInteraction.decision}{aiInteraction.missing_fields.length ? ` · faltando: ${aiInteraction.missing_fields.join(", ")}` : ""}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="chat-composer">
              <div className="composer-box">
                <textarea disabled placeholder="Envio para WhatsApp será habilitado na etapa de integração do canal."/>
                <div className="composer-actions"><div className="composer-left"><Button variant="ghost" icon={<FileText size={14}/>}>Criar orçamento</Button></div><Button variant="secondary">Canal ainda não conectado</Button></div>
              </div>
            </div>
          </section>

          <aside className="contact-panel">
            <div className="contact-profile"><Avatar initials={initials(activeCustomer?.name ?? "Cliente")} tone="green"/><h3>{activeCustomer?.name ?? "Cliente"}</h3><p>{activeCustomer?.email || "Sem e-mail"}</p><StatusBadge tone={tone(activeConversation?.status ?? "open")}>{statusLabel[activeConversation?.status ?? "open"]}</StatusBadge></div>
            <div className="info-section">
              <div className="info-section-title"><strong>Contato</strong></div>
              <div className="info-row"><span>WhatsApp</span><strong>{activeCustomer?.whatsapp || activeCustomer?.phone || "—"}</strong></div>
              <div className="info-row"><span>Canal</span><strong>{activeConversation?.channel ?? "—"}</strong></div>
            </div>
            <div className="info-section">
              <div className="info-section-title"><strong>Veículo</strong><CarFront size={14}/></div>
              {vehicle ? (
                <div className="vehicle-card"><strong>{[vehicle.brand,vehicle.model,vehicle.version].filter(Boolean).join(" ")}</strong><span>{vehicle.model_year || vehicle.year || "Ano não informado"} · {vehicle.engine || "motor não informado"} · {vehicle.transmission || "câmbio não informado"}</span></div>
              ) : <div className="vehicle-card"><strong>Veículo não cadastrado</strong><span>A IA pode coletar esses dados durante a conversa.</span></div>}
            </div>
            <div className="info-section">
              <div className="info-section-title"><strong>Análise da IA</strong><Sparkles size={14}/></div>
              <div className="ai-analysis">
                <div className="analysis-title"><Bot size={14}/> Última interpretação</div>
                <div className="info-row"><span>Peça</span><strong>{aiInteraction?.part_name || "—"}</strong></div>
                <div className="info-row"><span>Modelo</span><strong>{String(aiVehicle.model ?? vehicle?.model ?? "—")}</strong></div>
                <div className="info-row"><span>Ano</span><strong>{String(aiVehicle.year ?? vehicle?.model_year ?? vehicle?.year ?? "—")}</strong></div>
                <div className="info-row"><span>Confiança</span><strong>{aiInteraction ? `${(Number(aiInteraction.confidence)*100).toFixed(0)}%` : "—"}</strong></div>
                <div className="confidence"><div style={{width:aiInteraction?`${Math.min(100,Number(aiInteraction.confidence)*100)}%`:"0%"}}/></div>
              </div>
            </div>
            <div className="info-section"><Button variant="secondary" icon={<Wrench size={14}/>}>Assumir atendimento</Button></div>
          </aside>
        </div>
      ) : (
        <div className="surface-card empty-state"><MessageCircleMore size={34}/><strong>Nenhuma conversa registrada</strong><p>Quando o primeiro atendimento for criado, ele aparecerá nesta central.</p></div>
      )}
    </>
  );
}
