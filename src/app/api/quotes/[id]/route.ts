import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

const allowed = new Set(["draft","sent","accepted","rejected","expired","cancelled"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { id } = await params;
    const { supabase } = await requireUser();
    const body = (await request.json()) as {
      status?: string;
      notes?: string;
      expiresAt?: string | null;
    };

    if (body.status && !allowed.has(body.status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("quotes")
      .update({
        ...(body.status ? { status: body.status } : {}),
        ...(body.notes !== undefined ? { notes: body.notes.trim() || null } : {}),
        ...(body.expiresAt !== undefined ? { expires_at: body.expiresAt || null } : {}),
      })
      .eq("id", id)
      .eq("company_id", workspace.company.id)
      .select("id,number,status,total")
      .single();

    if (error) throw error;
    return NextResponse.json({ quote: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar o orçamento." },
      { status: 400 },
    );
  }
}
