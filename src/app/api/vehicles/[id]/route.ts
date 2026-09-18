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
    const body = (await request.json()) as Record<string, unknown>;

    const { data, error } = await supabase
      .from("customer_vehicles")
      .update({
        ...(typeof body.customerId === "string" ? { customer_id: body.customerId } : {}),
        ...(typeof body.brand === "string" ? { brand: body.brand.trim() || null } : {}),
        ...(typeof body.model === "string" ? { model: body.model.trim() || null } : {}),
        ...(typeof body.year === "number" || body.year === null ? { year: body.year as number | null } : {}),
        ...(typeof body.modelYear === "number" || body.modelYear === null ? { model_year: body.modelYear as number | null } : {}),
        ...(typeof body.engine === "string" ? { engine: body.engine.trim() || null } : {}),
        ...(typeof body.version === "string" ? { version: body.version.trim() || null } : {}),
        ...(typeof body.transmission === "string" ? { transmission: body.transmission.trim() || null } : {}),
        ...(typeof body.fuel === "string" ? { fuel: body.fuel.trim() || null } : {}),
        ...(typeof body.plate === "string" ? { plate: body.plate.trim().toUpperCase() || null } : {}),
        ...(typeof body.chassis === "string" ? { chassis: body.chassis.trim().toUpperCase() || null } : {}),
        ...(typeof body.notes === "string" ? { notes: body.notes.trim() || null } : {}),
      })
      .eq("id", id)
      .eq("company_id", workspace.company.id)
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ vehicle: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar o veículo." },
      { status: 400 },
    );
  }
}
