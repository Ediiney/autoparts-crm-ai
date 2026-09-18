import Link from "next/link";
import { Avatar, Button, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { formatTimeInTimezone } from "@/lib/timezones";
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

type ConversationRow = {
  id: string;
  customer_id: string | null;
  channel: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
  customer_name: string;
  customer_phone: string | null;
  customer_whatsapp: string | null;
  customer_email: string | null;
  customer_timezone: string | null;
};

type MessageRow = {
  id: string;
  sender_type: string;
  content: string;
  created_at: string;
};

type AiRow = {
  part_name: string | null;
  vehicle: Record<string, unknown> | null;
  confidence: number;
  decision: string;
  missing_fields: string[];
  created_at: string;
};

type VehicleRow = {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  model_year: number | null;
  engine: string | null;
  version: string | null;
  transmission: string | null;
  plate: string | null;
};

type ConversationsPayload = {
  conversations?: ConversationRow[];
  activeId?: string | null;
  activeConversation?: ConversationRow | null;
  messages?: MessageRow[];
  aiInteraction?: AiRow | null;
  vehicle?: VehicleRow | null;
};

const statusLabel: Record<string, string> = {
  open: "Aberto",
  waiting_customer: "Aguardando cliente",
  waiting_agent: "Atendimento humano",
  resolved: "Resolvido",
  cancelled: "Cancelado",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
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
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_conversations_page", {
    p_branch_id: workspace.branch?.id ?? null,
    p_active_id: params.id || undefined,
    p_limit: 40,
  });

  if (error) throw error;

  const payload = (data ?? {}) as unknown as ConversationsPayload;
  const rows = payload.conversations ?? [];
  const activeId = payload.activeId ?? undefined;
  const activeConversation = payload.activeConversation ?? undefined;
  const messages = payload.messages ?? [];
  const aiInteraction = payload.aiInteraction ?? undefined;
  const vehicle = payload.vehicle ?? undefined;

  const displayTimezone = activeConversation?.customer_timezone || workspace.timezone;
  const aiVehicle =
    aiInteraction?.vehicle &&
    typeof aiInteraction.vehicle === "object" &&
    !Array.isArray(aiInteraction.vehicle)
      ? aiInteraction.vehicle
      : {};

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Atendimento</div>
          <h1>Conversas</h1>
          <p>Inbox da filial com histórico, contexto do cliente e identificação de peças.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={<UserRound size={15} />}>Fila humana</Button>
        </div>
      </div>

      {rows.length ? (
        <div className="inbox-layout">
          <aside className="inbox-sidebar">
            <div className="inbox-sidebar-header">
              <h2>Caixa de entrada</h2>
              <div className="inbox-tabs"><button className="inbox-tab active">Todas {rows.length}</button></div>
            </div>
            <div className="conversation-list">
              {rows.map((conversation) => (
                <Link
                  href={`/conversas?id=${conversation.id}`}
                  className={conversation.id === activeId ? "conversation-card active" : "conversation-card"}
                  key={conversation.id}
                  style={{ textDecoration: "none" }}
                >
                  <Avatar initials={initials(conversation.customer_name || "Cliente")} tone={conversation.status === "waiting_agent" ? "purple" : conversation.status === "waiting_customer" ? "amber" : "green"} />
                  <div className="conversation-copy">
                    <div className="conversation-name"><strong>{conversation.customer_name || "Cliente"}</strong></div>
                    <div className="conversation-message">{statusLabel[conversation.status] ?? conversation.status}</div>
                  </div>
                  <div className="conversation-meta">
                    <time>{formatTimeInTimezone(conversation.last_message_at || conversation.created_at, conversation.customer_timezone || workspace.timezone)}</time>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          <section className="chat-panel">
            <header className="chat-header">
              <div className="chat-contact">
                <Avatar initials={initials(activeConversation?.customer_name ?? "Cliente")} tone="green" />
                <div>
                  <strong>{activeConversation?.customer_name ?? "Cliente"}</strong>
                  <span>{activeConversation?.channel ?? "web"} · {statusLabel[activeConversation?.status ?? "open"]}</span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="icon-button" aria-label="Ligar"><Phone size={16} /></button>
                <button className="icon-button" aria-label="Mais opções"><MoreHorizontal size={17} /></button>
              </div>
            </header>

            <div className="chat-body">
              <div className="chat-day">Horário exibido em {displayTimezone}</div>
              {messages.length ? messages.map((message) => (
                <div className={`message-row ${message.sender_type === "customer" ? "customer" : message.sender_type === "agent" ? "agent" : "ai"}`} key={message.id}>
                  <div className="message-bubble">
                    {message.content}
                    <small>
                      {formatTimeInTimezone(message.created_at, displayTimezone)} · {message.sender_type === "customer" ? "cliente" : message.sender_type === "agent" ? "atendente" : "automação"}
                    </small>
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <MessageCircleMore size={28} /><strong>Sem mensagens ainda</strong>
                  <p>As mensagens desta conversa aparecerão aqui.</p>
                </div>
              )}

              {aiInteraction ? (
                <div className="ai-note">
                  <Bot size={16} />
                  <div>
                    <strong>Última identificação · {(Number(aiInteraction.confidence) * 100).toFixed(0)}% de confiança</strong>
                    <p>
                      {aiInteraction.part_name || "Peça não identificada"} · {aiInteraction.decision}
                      {aiInteraction.missing_fields?.length ? ` · faltando: ${aiInteraction.missing_fields.join(", ")}` : ""}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="chat-composer">
              <div className="composer-box">
                <textarea disabled placeholder="O envio será liberado quando o canal WhatsApp estiver conectado." />
                <div className="composer-actions">
                  <div className="composer-left">
                    <Button variant="ghost" icon={<FileText size={14} />}>Criar orçamento</Button>
                  </div>
                  <Button variant="secondary">Canal não conectado</Button>
                </div>
              </div>
            </div>
          </section>

          <aside className="contact-panel">
            <div className="contact-profile">
              <Avatar initials={initials(activeConversation?.customer_name ?? "Cliente")} tone="green" />
              <h3>{activeConversation?.customer_name ?? "Cliente"}</h3>
              <p>{activeConversation?.customer_email || "Sem e-mail"}</p>
              <StatusBadge tone={tone(activeConversation?.status ?? "open")}>
                {statusLabel[activeConversation?.status ?? "open"]}
              </StatusBadge>
            </div>

            <div className="info-section">
              <div className="info-section-title"><strong>Contato</strong></div>
              <div className="info-row"><span>WhatsApp</span><strong>{activeConversation?.customer_whatsapp || activeConversation?.customer_phone || "—"}</strong></div>
              <div className="info-row"><span>Fuso</span><strong>{displayTimezone}</strong></div>
            </div>

            <div className="info-section">
              <div className="info-section-title"><strong>Veículo</strong><CarFront size={14} /></div>
              {vehicle ? (
                <div className="vehicle-card">
                  <strong>{[vehicle.brand, vehicle.model, vehicle.version].filter(Boolean).join(" ")}</strong>
                  <span>{vehicle.model_year || vehicle.year || "Ano não informado"} · {vehicle.engine || "motor não informado"} · {vehicle.transmission || "câmbio não informado"}</span>
                </div>
              ) : (
                <div className="vehicle-card">
                  <strong>Veículo não cadastrado</strong>
                  <span>Os dados podem ser coletados durante a conversa.</span>
                </div>
              )}
            </div>

            <div className="info-section">
              <div className="info-section-title"><strong>Identificação</strong><Sparkles size={14} /></div>
              <div className="ai-analysis">
                <div className="analysis-title"><Bot size={14} /> Última interpretação</div>
                <div className="info-row"><span>Peça</span><strong>{aiInteraction?.part_name || "—"}</strong></div>
                <div className="info-row"><span>Modelo</span><strong>{String(aiVehicle.model ?? vehicle?.model ?? "—")}</strong></div>
                <div className="info-row"><span>Ano</span><strong>{String(aiVehicle.year ?? vehicle?.model_year ?? vehicle?.year ?? "—")}</strong></div>
                <div className="info-row"><span>Confiança</span><strong>{aiInteraction ? `${(Number(aiInteraction.confidence) * 100).toFixed(0)}%` : "—"}</strong></div>
                <div className="confidence"><div style={{ width: aiInteraction ? `${Math.min(100, Number(aiInteraction.confidence) * 100)}%` : "0%" }} /></div>
              </div>
            </div>

            <div className="info-section">
              <Button variant="secondary" icon={<Wrench size={14} />}>Assumir atendimento</Button>
            </div>
          </aside>
        </div>
      ) : (
        <div className="surface-card empty-state">
          <MessageCircleMore size={34} /><strong>Nenhuma conversa registrada</strong>
          <p>O primeiro atendimento da filial aparecerá aqui.</p>
        </div>
      )}
    </>
  );
}
