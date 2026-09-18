import { NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { createClient } from "@/lib/supabase/server";

export const preferredRegion = "gru1";

type SmartSearchRow = {
  source_type: "company" | "reference";
  id: string;
  product_id: string | null;
  provider: string | null;
  code: string;
  name: string;
  original_code: string | null;
  application_text: string | null;
  manufacturer: string | null;
  price: number | null;
  available_quantity: number | null;
  score: number;
};

export async function GET(request: Request) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) return NextResponse.json({ results: [] });

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("search_catalog_unified", {
      p_company_id: workspace.company.id,
      p_query: query,
      p_branch_id: workspace.branch?.id ?? null,
      p_limit: 10,
    });
    if (error) throw error;

    const results = ((data ?? []) as SmartSearchRow[]).map((item) => ({
      sourceType: item.source_type,
      id: item.id,
      productId: item.product_id,
      provider: item.provider,
      code: item.code,
      name: item.name,
      originalCode: item.original_code,
      applicationText: item.application_text,
      manufacturer: item.manufacturer,
      price: item.price === null ? null : Number(item.price),
      availableQuantity: item.available_quantity === null ? null : Number(item.available_quantity),
      score: Number(item.score),
    }));

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível consultar o catálogo." },
      { status: 500 },
    );
  }
}
