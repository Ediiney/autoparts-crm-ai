import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export async function GET(request: Request) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) {
      return NextResponse.json({ products: [], customers: [], vehicles: [], quotes: [] });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("global_search", {
      p_query: query,
      p_branch_id: workspace.branch?.id ?? undefined,
      p_limit: 6,
    });

    if (error) throw error;

    return NextResponse.json(data ?? {
      products: [],
      customers: [],
      vehicles: [],
      quotes: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível pesquisar." },
      { status: 500 },
    );
  }
}
