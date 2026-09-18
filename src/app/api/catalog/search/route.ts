import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { searchCatalog } from "@/lib/catalog/search";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyId?: string;
      query?: string;
      vehicle?: Record<string, unknown>;
      limit?: number;
    };

    if (!body.companyId || !body.query?.trim()) {
      return NextResponse.json(
        { error: "companyId e query são obrigatórios." },
        { status: 400 },
      );
    }

    const { supabase } = await requireUser();
    const candidates = await searchCatalog(supabase, {
      companyId: body.companyId,
      query: body.query.trim(),
      vehicle: body.vehicle ?? {},
      limit: body.limit,
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
