import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export async function POST(request: Request) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase, user } = await requireUser();

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      whatsapp?: string;
      document?: string;
      notes?: string;
      timezone?: string | null;
      branchId?: string | null;
      tags?: string[];
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        company_id: workspace.company.id,
        branch_id: body.branchId || workspace.branch?.id || null,
        name: body.name.trim(),
        email: body.email?.trim().toLowerCase() || null,
        phone: body.phone?.trim() || null,
        whatsapp: body.whatsapp?.trim() || null,
        document: body.document?.trim() || null,
        notes: body.notes?.trim() || null,
        timezone: body.timezone || null,
        tags: body.tags ?? [],
        created_by: user.id,
      })
      .select("id,name")
      .single();

    if (error) throw error;
    return NextResponse.json({ customer: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível criar o cliente." },
      { status: 400 },
    );
  }
}
