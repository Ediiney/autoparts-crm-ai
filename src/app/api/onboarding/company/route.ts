import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { normalizeText } from "@/lib/ai/normalize";
import { BRAZIL_TIMEZONES } from "@/lib/timezones";

function slugify(name: string) {
  return normalizeText(name).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      document?: string;
      phone?: string;
      email?: string;
      businessType?: "retail" | "distributor";
      timezone?: string;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const timezone = BRAZIL_TIMEZONES.some((item) => item.value === body.timezone)
      ? body.timezone!
      : "America/Sao_Paulo";

    const { supabase, user } = await requireUser();
    const slug = `${slugify(body.name)}-${randomUUID().slice(0, 6)}`;

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        owner_user_id: user.id,
        name: body.name.trim(),
        slug,
        document: body.document?.trim() || null,
        phone: body.phone?.trim() || null,
        email: body.email?.trim().toLowerCase() || null,
        timezone,
        business_type: body.businessType ?? "retail",
      })
      .select("id,name,slug,timezone")
      .single();

    if (companyError) throw companyError;

    const { data: headquarters, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("company_id", company.id)
      .eq("is_headquarters", true)
      .limit(1)
      .maybeSingle();

    if (branchError) throw branchError;

    const { error: memberError } = await supabase.from("company_members").insert({
      company_id: company.id,
      user_id: user.id,
      branch_id: headquarters?.id ?? null,
      role: "owner",
    });
    if (memberError) throw memberError;

    const { error: settingsError } = await supabase.from("company_settings").insert({
      company_id: company.id,
      settings: { businessType: body.businessType ?? "retail" },
    });
    if (settingsError) throw settingsError;

    const { error: warehouseError } = await supabase.from("warehouses").insert({
      company_id: company.id,
      branch_id: headquarters?.id ?? null,
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
