import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireUser();
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const { data, error } = await supabase.rpc("search_reference_catalog", {
      p_query: query,
      p_provider: "giancar",
      p_limit: 12,
    });

    if (error) throw error;

    const results = (data ?? []).map((item: Record<string, unknown>) => ({
      id: item.id,
      provider: item.provider,
      code: item.external_code,
      name: item.name,
      category: item.category,
      manufacturer: item.manufacturer,
      originalCode: item.original_code,
      applicationText: item.application_text,
      applications: item.applications,
      sourceUrl: item.source_url,
      score: item.score,
    }));

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 500 },
    );
  }
}
