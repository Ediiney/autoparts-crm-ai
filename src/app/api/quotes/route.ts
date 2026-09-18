import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type QuoteItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  discount?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyId?: string;
      customerId?: string;
      conversationId?: string;
      notes?: string;
      expiresAt?: string | null;
      items?: QuoteItemInput[];
    };

    if (!body.companyId || !body.items?.length) {
      return NextResponse.json({ error: "Empresa e itens são obrigatórios." }, { status: 400 });
    }

    const invalid = body.items.some(
      (item) =>
        !item.productId ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0 ||
        (item.discount ?? 0) < 0,
    );
    if (invalid) return NextResponse.json({ error: "Itens inválidos." }, { status: 400 });

    const companyId = body.companyId;
    const workspace = await getWorkspaceContext();
    const { supabase, user } = await requireUser();

    if (!workspace || workspace.company.id !== companyId) {
      return NextResponse.json({ error: "Empresa inválida." }, { status: 403 });
    }

    if (body.customerId) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("company_id", companyId)
        .eq("id", body.customerId)
        .maybeSingle();
      if (!customer) return NextResponse.json({ error: "Cliente inválido." }, { status: 400 });
    }

    const productIds = [...new Set(body.items.map((item) => item.productId))];
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id,name,active")
      .eq("company_id", companyId)
      .in("id", productIds);
    if (productError) throw productError;
    if ((products ?? []).filter((product) => product.active).length !== productIds.length) {
      return NextResponse.json({ error: "Há produtos inválidos ou inativos no orçamento." }, { status: 400 });
    }

    const names = new Map((products ?? []).map((product) => [product.id, product.name]));
    const subtotal = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = body.items.reduce((sum, item) => sum + Math.max(0, item.discount ?? 0), 0);
    const total = Math.max(0, subtotal - discount);

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        company_id: companyId,
        branch_id: workspace.branch?.id ?? null,
        customer_id: body.customerId ?? null,
        conversation_id: body.conversationId ?? null,
        status: "draft",
        subtotal,
        discount,
        total,
        notes: body.notes?.trim() || null,
        expires_at: body.expiresAt || null,
        created_by: user.id,
      })
      .select("id,number,status,subtotal,discount,total")
      .single();
    if (quoteError) throw quoteError;

    const { error: itemsError } = await supabase.from("quote_items").insert(
      body.items.map((item) => {
        const itemDiscount = Math.max(0, item.discount ?? 0);
        return {
          company_id: companyId,
          quote_id: quote.id,
          product_id: item.productId,
          description: item.description ?? names.get(item.productId) ?? "Autopeça",
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: itemDiscount,
          total: Math.max(0, item.quantity * item.unitPrice - itemDiscount),
        };
      }),
    );
    if (itemsError) throw itemsError;

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
