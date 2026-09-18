import type { SupabaseClient, User } from "@supabase/supabase-js";
import { buildClarification } from "@/lib/ai/clarification";
import { extractPartIntent } from "@/lib/ai/extract-intent";
import { chooseCandidate, searchCatalog } from "@/lib/catalog/search";
import type { CatalogCandidate } from "@/lib/catalog/types";

type HandleMessageInput = {
  companyId: string;
  branchId?: string;
  customerId?: string;
  conversationId?: string;
  message: string;
};

function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function applicationLabel(candidate: CatalogCandidate) {
  const app = candidate.application;
  if (!app) return "";

  const years =
    app.yearStart || app.yearEnd
      ? ` ${app.yearStart ?? ""}${app.yearEnd && app.yearEnd !== app.yearStart ? ` a ${app.yearEnd}` : ""}`
      : "";

  return [app.brand, app.model, years.trim(), app.engine, app.side, app.axle]
    .filter(Boolean)
    .join(" · ");
}

function multipleMatchQuestion(candidates: CatalogCandidate[]) {
  const apps = candidates.map((item) => item.application).filter(Boolean);
  const engines = new Set(apps.map((item) => item?.engine).filter(Boolean));
  const sides = new Set(apps.map((item) => item?.side).filter(Boolean));
  const axles = new Set(apps.map((item) => item?.axle).filter(Boolean));

  if (engines.size > 1) return "Encontrei mais de uma aplicação. Qual é a motorização do veículo?";
  if (sides.size > 1) return "Encontrei mais de uma aplicação. A peça é do lado esquerdo ou direito?";
  if (axles.size > 1) return "Encontrei mais de uma aplicação. A peça é dianteira ou traseira?";

  return "Encontrei mais de uma aplicação possível. Você consegue informar a versão ou mais detalhes do veículo?";
}

async function ensureConversation(
  supabase: SupabaseClient,
  user: User,
  input: HandleMessageInput,
) {
  if (input.conversationId) return input.conversationId;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      company_id: input.companyId,
      branch_id: input.branchId ?? null,
      customer_id: input.customerId ?? null,
      channel: "web",
      status: "open",
      assigned_to: user.id,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

async function addMessage(
  supabase: SupabaseClient,
  companyId: string,
  conversationId: string,
  senderType: "customer" | "ai" | "agent" | "system",
  content: string,
  userId?: string,
) {
  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({
      company_id: companyId,
      conversation_id: conversationId,
      sender_type: senderType,
      sender_user_id: userId ?? null,
      content,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

async function saveAiInteraction(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
) {
  const { error } = await supabase.from("ai_interactions").insert(values);
  if (error) throw error;
}

function interactionBase(
  input: HandleMessageInput,
  conversationId: string,
  messageId: string,
  rawMessage: string,
) {
  return {
    company_id: input.companyId,
    branch_id: input.branchId ?? null,
    conversation_id: conversationId,
    message_id: messageId,
    raw_message: rawMessage,
  };
}

export async function handleCustomerMessage(
  supabase: SupabaseClient,
  user: User,
  input: HandleMessageInput,
) {
  const started = Date.now();
  const conversationId = await ensureConversation(supabase, user, input);

  const customerMessageId = await addMessage(
    supabase,
    input.companyId,
    conversationId,
    "customer",
    input.message,
  );

  const { data: previousInteraction } = await supabase
    .from("ai_interactions")
    .select("part_name,vehicle")
    .eq("company_id", input.companyId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const intent = await extractPartIntent(input.message, {
    partName: previousInteraction?.part_name ?? undefined,
    vehicle:
      previousInteraction?.vehicle && typeof previousInteraction.vehicle === "object"
        ? previousInteraction.vehicle
        : undefined,
  });

  const commonInteraction = {
    ...interactionBase(input, conversationId, customerMessageId, input.message),
    part_name: intent.partName ?? null,
    normalized_part_name: intent.normalizedPartName ?? null,
    vehicle: intent.vehicle,
    confidence: intent.confidence,
    model: intent.model ?? null,
    prompt_version: "part-intent-v1",
    raw_model_output: intent.rawModelOutput ?? null,
  };

  if (intent.missingFields.length > 0) {
    const reply = buildClarification(intent);

    await addMessage(supabase, input.companyId, conversationId, "ai", reply);
    await saveAiInteraction(supabase, {
      ...commonInteraction,
      missing_fields: intent.missingFields,
      candidate_product_ids: [],
      decision: "clarify",
      latency_ms: Date.now() - started,
    });

    await supabase
      .from("conversations")
      .update({ status: "waiting_customer", last_message_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("company_id", input.companyId);

    return {
      conversationId,
      status: "needs_clarification" as const,
      intent,
      reply,
    };
  }

  const { data: settings } = await supabase
    .from("company_settings")
    .select("minimum_match_confidence")
    .eq("company_id", input.companyId)
    .maybeSingle();

  const candidates = await searchCatalog(supabase, {
    companyId: input.companyId,
    branchId: input.branchId,
    query: intent.partName ?? input.message,
    vehicle: intent.vehicle,
    limit: 12,
  });

  const decision = chooseCandidate(
    candidates,
    Number(settings?.minimum_match_confidence ?? 0.82),
  );

  if (decision.decision === "not_found") {
    const reply =
      "Não encontrei uma aplicação com segurança no catálogo. Vou deixar esta consulta para revisão de um atendente.";

    await addMessage(supabase, input.companyId, conversationId, "ai", reply);
    await saveAiInteraction(supabase, {
      ...commonInteraction,
      missing_fields: [],
      candidate_product_ids: candidates.map((item) => item.productId),
      decision: "not_found",
      latency_ms: Date.now() - started,
    });

    await supabase
      .from("conversations")
      .update({ status: "waiting_agent", last_message_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("company_id", input.companyId);

    return { conversationId, status: "not_found" as const, intent, candidates, reply };
  }

  if (decision.decision === "multiple_matches") {
    const reply = multipleMatchQuestion(decision.candidates);

    await addMessage(supabase, input.companyId, conversationId, "ai", reply);
    await saveAiInteraction(supabase, {
      ...commonInteraction,
      missing_fields: [],
      candidate_product_ids: decision.candidates.map((item) => item.productId),
      decision: "multiple_matches",
      latency_ms: Date.now() - started,
    });

    await supabase
      .from("conversations")
      .update({ status: "waiting_customer", last_message_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("company_id", input.companyId);

    return {
      conversationId,
      status: "multiple_matches" as const,
      intent,
      candidates: decision.candidates,
      reply,
    };
  }

  const item = decision.candidate;
  const priceLine =
    typeof item.price === "number"
      ? `Valor: ${brl(item.price)}.`
      : "A aplicação foi encontrada, mas o preço ainda não está cadastrado.";

  const stockLine =
    typeof item.availableQuantity === "number"
      ? ` Disponibilidade registrada: ${Math.max(0, item.availableQuantity)}.`
      : "";

  const appLine = applicationLabel(item);
  const reply = `${item.name} — código ${item.sku}${appLine ? ` — ${appLine}` : ""}. ${priceLine}${stockLine}`;

  await addMessage(supabase, input.companyId, conversationId, "ai", reply);
  await saveAiInteraction(supabase, {
    ...commonInteraction,
    missing_fields: [],
    candidate_product_ids: [item.productId],
    decision: "matched",
    latency_ms: Date.now() - started,
  });

  await supabase
    .from("conversations")
    .update({ status: "open", last_message_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("company_id", input.companyId);

  return {
    conversationId,
    status: "matched" as const,
    intent,
    product: item,
    reply,
  };
}
