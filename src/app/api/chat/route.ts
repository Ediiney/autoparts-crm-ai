import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleCustomerMessage } from "@/lib/workflow/handle-message";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyId?: string;
      customerId?: string;
      conversationId?: string;
      message?: string;
    };

    if (!body.companyId || !body.message?.trim()) {
      return NextResponse.json(
        { error: "companyId e message são obrigatórios." },
        { status: 400 },
      );
    }

    const { supabase, user } = await requireUser();
    const result = await handleCustomerMessage(supabase, user, {
      companyId: body.companyId,
      customerId: body.customerId,
      conversationId: body.conversationId,
      message: body.message.trim(),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
