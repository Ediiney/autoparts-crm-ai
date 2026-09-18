import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { normalizeText } from "@/lib/ai/normalize";

function slugify(name: string) {
  return normalizeText(name).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "name é obrigatório." }, { status: 400 });
    }

    const { supabase, user } = await requireUser();
    const slug = `${slugify(body.name)}-${randomUUID().slice(0, 6)}`;

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        owner_user_id: user.id,
        name: body.name.trim(),
        slug,
      })
      .select("id,name,slug")
      .single();

    if (companyError) throw companyError;

    const { error: memberError } = await supabase.from("company_members").insert({
      company_id: company.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) throw memberError;

    const { error: settingsError } = await supabase.from("company_settings").insert({
      company_id: company.id,
    });
    if (settingsError) throw settingsError;

    const { error: warehouseError } = await supabase.from("warehouses").insert({
      company_id: company.id,
      name: "Estoque principal",
      code: "MAIN",
    });
    if (warehouseError) throw warehouseError;

    const { error: sourceError } = await supabase.from("catalog_sources").insert({
      company_id: company.id,
      name: "Giancar - Catálogo",
      provider: "giancar",
      source_url: "https://www.giancar.com.br/catalogo",
      source_type: "catalog",
    });
    if (sourceError) throw sourceError;

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
