import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentCompany } from "@/lib/company/current-company";

type Hour = {
  dayOfWeek: number;
  enabled: boolean;
  opensAt?: string | null;
  closesAt?: string | null;
  breakStartsAt?: string | null;
  breakEndsAt?: string | null;
};

export async function PUT(request: Request) {
  try {
    const company = await getCurrentCompany();
    if (!company) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase } = await requireUser();
    const body = (await request.json()) as { branchId?: string; hours?: Hour[] };

    if (!body.branchId || !Array.isArray(body.hours)) {
      return NextResponse.json({ error: "Filial e horários são obrigatórios." }, { status: 400 });
    }

    const { data: branch } = await supabase
      .from("branches")
      .select("id")
      .eq("id", body.branchId)
      .eq("company_id", company.id)
      .maybeSingle();

    if (!branch) return NextResponse.json({ error: "Filial inválida." }, { status: 400 });

    const rows = body.hours.map((hour) => ({
      company_id: company.id,
      branch_id: body.branchId!,
      day_of_week: hour.dayOfWeek,
      enabled: hour.enabled,
      opens_at: hour.enabled ? hour.opensAt || "08:00" : null,
      closes_at: hour.enabled ? hour.closesAt || "18:00" : null,
      break_starts_at: hour.breakStartsAt || null,
      break_ends_at: hour.breakEndsAt || null,
    }));

    const { error } = await supabase
      .from("branch_business_hours")
      .upsert(rows, { onConflict: "branch_id,day_of_week" });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar os horários." },
      { status: 400 },
    );
  }
}
