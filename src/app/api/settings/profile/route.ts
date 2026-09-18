import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = (await request.json()) as { timezone?: string | null };

    const { data, error } = await supabase
      .from("profiles")
      .update({ timezone: body.timezone || null })
      .eq("id", user.id)
      .select("id,timezone")
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar o fuso pessoal." },
      { status: 400 },
    );
  }
}
