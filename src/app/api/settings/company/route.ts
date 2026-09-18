import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentCompany } from "@/lib/company/current-company";

export async function PATCH(request: Request) {
  try {
    const company = await getCurrentCompany();
    if (!company) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });

    const { supabase } = await requireUser();
    const body = (await request.json()) as {
      name?: string;
      legalName?: string;
      document?: string;
      phone?: string;
      email?: string;
      timezone?: string;
      businessType?: "retail" | "distributor" | "wholesale" | "mixed";
    };

    const payload = {
      name: body.name?.trim() || company.name,
      legal_name: body.legalName?.trim() || null,
      document: body.document?.trim() || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim().toLowerCase() || null,
      timezone: body.timezone || company.timezone,
      business_type: body.businessType || company.business_type,
    };

    const { data, error } = await supabase
      .from("companies")
      .update(payload)
      .eq("id", company.id)
      .select("id,name,legal_name,document,phone,email,timezone,business_type")
      .single();

    if (error) throw error;
    return NextResponse.json({ company: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar a empresa." },
      { status: 400 },
    );
  }
}
