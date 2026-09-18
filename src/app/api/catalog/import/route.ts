import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import {
  importNormalizedCatalog,
  type NormalizedCatalogItem,
} from "@/lib/catalog/import-normalized";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyId?: string;
      sourceId?: string;
      fileName?: string;
      items?: NormalizedCatalogItem[];
    };

    if (!body.companyId || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "companyId e items são obrigatórios." },
        { status: 400 },
      );
    }

    if (body.items.length > 500) {
      return NextResponse.json(
        { error: "Envie no máximo 500 itens por lote." },
        { status: 413 },
      );
    }

    const { supabase, user } = await requireUser();
    const result = await importNormalizedCatalog(
      supabase,
      user,
      body.companyId,
      body.sourceId,
      body.fileName,
      body.items,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
