import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { normalizeText } from "@/lib/ai/normalize";

type ProductBody = {
  id?: string;
  sku?: string;
  name?: string;
  category?: string;
  manufacturer?: string;
  brand?: string;
  originalCode?: string;
  barcode?: string;
  description?: string;
  price?: number | null;
  stock?: number | null;
  application?: {
    brand?: string;
    model?: string;
    yearStart?: number | null;
    yearEnd?: number | null;
    engine?: string;
    version?: string;
    side?: "left" | "right" | "both" | "center";
    axle?: "front" | "rear" | "both";
    position?: string;
  };
};

async function categoryId(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  companyId: string,
  category?: string,
) {
  if (!category?.trim()) return null;
  const normalized = normalizeText(category);

  const { data: existing } = await supabase
    .from("product_categories")
    .select("id")
    .eq("company_id", companyId)
    .eq("normalized_name", normalized)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("product_categories")
    .insert({ company_id: companyId, name: category.trim(), normalized_name: normalized })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function POST(request: Request) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase } = await requireUser();
    const body = (await request.json()) as ProductBody;

    if (!body.sku?.trim() || !body.name?.trim()) {
      return NextResponse.json({ error: "SKU e nome são obrigatórios." }, { status: 400 });
    }

    const catId = await categoryId(supabase, workspace.company.id, body.category);

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        company_id: workspace.company.id,
        sku: body.sku.trim(),
        name: body.name.trim(),
        category_id: catId,
        manufacturer: body.manufacturer?.trim() || null,
        brand: body.brand?.trim() || null,
        original_code: body.originalCode?.trim() || null,
        barcode: body.barcode?.trim() || null,
        description: body.description?.trim() || null,
        source: "manual",
      })
      .select("id,sku,name")
      .single();

    if (error) throw error;

    if (typeof body.price === "number" && body.price >= 0) {
      const { error: priceError } = await supabase.from("product_prices").insert({
        company_id: workspace.company.id,
        branch_id: workspace.branch?.id ?? null,
        product_id: product.id,
        price_type: "retail",
        price: body.price,
        source: "manual",
      });
      if (priceError) throw priceError;
    }

    if (typeof body.stock === "number" && body.stock >= 0) {
      let warehouseQuery = supabase
        .from("warehouses")
        .select("id")
        .eq("company_id", workspace.company.id)
        .eq("active", true);

      if (workspace.branch?.id) warehouseQuery = warehouseQuery.eq("branch_id", workspace.branch.id);

      const { data: warehouse } = await warehouseQuery.limit(1).maybeSingle();

      if (warehouse) {
        const { error: stockError } = await supabase.from("product_inventory").insert({
          company_id: workspace.company.id,
          product_id: product.id,
          warehouse_id: warehouse.id,
          quantity: body.stock,
          reserved: 0,
        });
        if (stockError) throw stockError;
      }
    }

    if (body.application?.brand?.trim() && body.application.model?.trim()) {
      const app = body.application;
      const { error: appError } = await supabase.from("vehicle_applications").insert({
        company_id: workspace.company.id,
        product_id: product.id,
        vehicle_brand: app.brand.trim(),
        vehicle_model: app.model.trim(),
        year_start: app.yearStart ?? null,
        year_end: app.yearEnd ?? null,
        engine: app.engine?.trim() || null,
        version: app.version?.trim() || null,
        side: app.side || null,
        axle: app.axle || null,
        position: app.position?.trim() || null,
        source: "manual",
      });
      if (appError) throw appError;
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível criar o produto." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    const { supabase } = await requireUser();
    const body = (await request.json()) as ProductBody;

    if (!body.id) return NextResponse.json({ error: "Produto inválido." }, { status: 400 });

    const catId = body.category !== undefined
      ? await categoryId(supabase, workspace.company.id, body.category)
      : undefined;

    const { data, error } = await supabase
      .from("products")
      .update({
        ...(body.sku !== undefined ? { sku: body.sku.trim() } : {}),
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(catId !== undefined ? { category_id: catId } : {}),
        ...(body.manufacturer !== undefined ? { manufacturer: body.manufacturer.trim() || null } : {}),
        ...(body.brand !== undefined ? { brand: body.brand.trim() || null } : {}),
        ...(body.originalCode !== undefined ? { original_code: body.originalCode.trim() || null } : {}),
        ...(body.barcode !== undefined ? { barcode: body.barcode.trim() || null } : {}),
        ...(body.description !== undefined ? { description: body.description.trim() || null } : {}),
      })
      .eq("id", body.id)
      .eq("company_id", workspace.company.id)
      .select("id,sku,name")
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar o produto." },
      { status: 400 },
    );
  }
}
