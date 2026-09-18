import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export async function POST(request: Request) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase } = await requireUser();

    const body = (await request.json()) as {
      customerId?: string;
      brand?: string;
      model?: string;
      year?: number | null;
      modelYear?: number | null;
      engine?: string;
      version?: string;
      transmission?: string;
      fuel?: string;
      plate?: string;
      chassis?: string;
      notes?: string;
    };

    if (!body.customerId || !body.brand?.trim() || !body.model?.trim()) {
      return NextResponse.json({ error: "Cliente, marca e modelo são obrigatórios." }, { status: 400 });
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", body.customerId)
      .eq("company_id", workspace.company.id)
      .maybeSingle();

    if (!customer) return NextResponse.json({ error: "Cliente inválido." }, { status: 400 });

    const { data, error } = await supabase
      .from("customer_vehicles")
      .insert({
        company_id: workspace.company.id,
        customer_id: body.customerId,
        brand: body.brand.trim(),
        model: body.model.trim(),
        year: body.year ?? null,
        model_year: body.modelYear ?? null,
        engine: body.engine?.trim() || null,
        version: body.version?.trim() || null,
        transmission: body.transmission?.trim() || null,
        fuel: body.fuel?.trim() || null,
        plate: body.plate?.trim().toUpperCase() || null,
        chassis: body.chassis?.trim().toUpperCase() || null,
        notes: body.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ vehicle: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível criar o veículo." },
      { status: 400 },
    );
  }
}
