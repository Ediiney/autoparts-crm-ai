import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentCompany } from "@/lib/company/current-company";

export async function PATCH(request: Request) {
  try {
    const company = await getCurrentCompany();
    if (!company) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase } = await requireUser();
    const body = (await request.json()) as {
      enabled?: boolean;
      autoReply?: boolean;
      minimumConfidence?: number;
    };

    const { data, error } = await supabase
      .from("company_settings")
      .update({
        ...(body.enabled !== undefined ? { ai_enabled: body.enabled } : {}),
        ...(body.autoReply !== undefined ? { ai_auto_reply: body.autoReply } : {}),
        ...(body.minimumConfidence !== undefined
          ? { minimum_match_confidence: Math.max(0, Math.min(1, body.minimumConfidence)) }
          : {}),
      })
      .eq("company_id", company.id)
      .select("company_id,ai_enabled,ai_auto_reply,minimum_match_confidence")
      .single();

    if (error) throw error;
    return NextResponse.json({ settings: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar a automação." },
      { status: 400 },
    );
  }
}
