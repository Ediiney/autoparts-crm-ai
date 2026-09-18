import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentCompany } from "@/lib/company/current-company";

export async function POST(request: Request) {
  try {
    const company = await getCurrentCompany();
    if (!company) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase } = await requireUser();

    const body = (await request.json()) as {
      name?: string;
      code?: string;
      timezone?: string;
      phone?: string;
      email?: string;
      city?: string;
      state?: string;
      isHeadquarters?: boolean;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da filial é obrigatório." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("branches")
      .insert({
        company_id: company.id,
        name: body.name.trim(),
        code: body.code?.trim().toUpperCase() || null,
        timezone: body.timezone || company.timezone,
        phone: body.phone?.trim() || null,
        email: body.email?.trim().toLowerCase() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim().toUpperCase() || null,
        is_headquarters: Boolean(body.isHeadquarters),
      })
      .select("id,name,code,timezone,city,state,is_headquarters")
      .single();

    if (error) throw error;

    const defaultHours = [
      { day: 0, enabled: false, opens: null, closes: null },
      { day: 1, enabled: true, opens: "08:00", closes: "18:00" },
      { day: 2, enabled: true, opens: "08:00", closes: "18:00" },
      { day: 3, enabled: true, opens: "08:00", closes: "18:00" },
      { day: 4, enabled: true, opens: "08:00", closes: "18:00" },
      { day: 5, enabled: true, opens: "08:00", closes: "18:00" },
      { day: 6, enabled: true, opens: "08:00", closes: "13:00" },
    ];

    const { error: hoursError } = await supabase.from("branch_business_hours").insert(
      defaultHours.map((item) => ({
        company_id: company.id,
        branch_id: data.id,
        day_of_week: item.day,
        enabled: item.enabled,
        opens_at: item.opens,
        closes_at: item.closes,
      })),
    );

    if (hoursError) throw hoursError;
    return NextResponse.json({ branch: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível criar a filial." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const company = await getCurrentCompany();
    if (!company) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase } = await requireUser();

    const body = (await request.json()) as {
      id?: string;
      name?: string;
      code?: string;
      timezone?: string;
      phone?: string;
      email?: string;
      city?: string;
      state?: string;
      active?: boolean;
    };

    if (!body.id) return NextResponse.json({ error: "Filial inválida." }, { status: 400 });

    const { data, error } = await supabase
      .from("branches")
      .update({
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.code !== undefined ? { code: body.code.trim().toUpperCase() || null } : {}),
        ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
        ...(body.phone !== undefined ? { phone: body.phone.trim() || null } : {}),
        ...(body.email !== undefined ? { email: body.email.trim().toLowerCase() || null } : {}),
        ...(body.city !== undefined ? { city: body.city.trim() || null } : {}),
        ...(body.state !== undefined ? { state: body.state.trim().toUpperCase() || null } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      })
      .eq("id", body.id)
      .eq("company_id", company.id)
      .select("id,name,code,timezone,city,state,active,is_headquarters")
      .single();

    if (error) throw error;
    return NextResponse.json({ branch: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar a filial." },
      { status: 400 },
    );
  }
}
