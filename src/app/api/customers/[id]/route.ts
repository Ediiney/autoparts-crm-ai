import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

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
      name?: string;
      email?: string;
      phone?: string;
      whatsapp?: string;
      document?: string;
      notes?: string;
      timezone?: string | null;
      branchId?: string | null;
      active?: boolean;
      tags?: string[];
    };

    const { data, error } = await supabase
      .from("customers")
      .update({
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.email !== undefined ? { email: body.email.trim().toLowerCase() || null } : {}),
        ...(body.phone !== undefined ? { phone: body.phone.trim() || null } : {}),
        ...(body.whatsapp !== undefined ? { whatsapp: body.whatsapp.trim() || null } : {}),
        ...(body.document !== undefined ? { document: body.document.trim() || null } : {}),
        ...(body.notes !== undefined ? { notes: body.notes.trim() || null } : {}),
        ...(body.timezone !== undefined ? { timezone: body.timezone || null } : {}),
        ...(body.branchId !== undefined ? { branch_id: body.branchId || null } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
        ...(body.tags !== undefined ? { tags: body.tags } : {}),
      })
      .eq("id", id)
      .eq("company_id", workspace.company.id)
      .select("id,name")
      .single();

    if (error) throw error;
    return NextResponse.json({ customer: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar o cliente." },
      { status: 400 },
    );
  }
}
