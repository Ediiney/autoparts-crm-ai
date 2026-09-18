import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { normalizeText } from "@/lib/ai/normalize";

type ApplicationInput = {
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

type ProductBody = {
  id?: string;
  referenceId?: string;
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
  application?: ApplicationInput;
};

async function categoryId(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  companyId: string,
  category?: string,
) {
  if (!category?.trim()) return null;
  const normalized = normalizeText(category);

  const { data: existing, error: readError } = await supabase
    .from("product_categories")
    .select("id")
    .eq("company_id", companyId)
    .eq("normalized_name", normalized)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("product_categories")
    .insert({
      company_id: companyId,
      name: category.trim(),
      normalized_name: normalized,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function POST(request: Request) {
  try {
    const workspace = await getWorkspaceContext();
    if (!workspace) {
      return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    }

    const { supabase } = await requireUser();
    const body = (await request.json()) as ProductBody;

    const { data: reference, error: referenceError } = body.referenceId
      ? await supabase
          .from("reference_catalog_items")
          .select("id,provider,external_code,name,category,manufacturer,original_code,application_text,applications")
          .eq("id", body.referenceId)
          .eq("active", true)
          .maybeSingle()
      : { data: null, error: null };

    if (referenceError) throw referenceError;
    if (body.referenceId && !reference) {
      return NextResponse.json({ error: "Referência de catálogo inválida." }, { status: 400 });
    }

    const sku = body.sku?.trim() || reference?.external_code?.trim();
    const name = body.name?.trim() || reference?.name?.trim();

    if (!sku || !name) {
      return NextResponse.json({ error: "SKU e nome são obrigatórios." }, { status: 400 });
    }

    const category = body.category?.trim() || reference?.category || undefined;
    const catId = await categoryId(supabase, workspace.company.id, category);
    const source = reference?.provider || "manual";

    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          company_id: workspace.company.id,
          sku,
          name,
          category_id: catId,
          manufacturer: body.manufacturer?.trim() || reference?.manufacturer || null,
          brand: body.brand?.trim() || reference?.manufacturer || null,
          original_code: body.originalCode?.trim() || reference?.original_code || null,
          barcode: body.barcode?.trim() || null,
          description:
            body.description?.trim() ||
            [reference?.name, reference?.application_text].filter(Boolean).join("\n") ||
            null,
          source,
          source_external_id: reference?.external_code || null,
          active: true,
        },
        { onConflict: "company_id,sku" },
      )
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

      if (workspace.branch?.id) {
        warehouseQuery = warehouseQuery.eq("branch_id", workspace.branch.id);
      }

      const { data: warehouse, error: warehouseError } =
        await warehouseQuery.limit(1).maybeSingle();

      if (warehouseError) throw warehouseError;

      if (warehouse) {
        const { error: stockError } = await supabase
          .from("product_inventory")
          .upsert(
            {
              company_id: workspace.company.id,
              product_id: product.id,
              warehouse_id: warehouse.id,
              quantity: body.stock,
              reserved: 0,
            },
            { onConflict: "product_id,warehouse_id" },
          );

        if (stockError) throw stockError;
      }
    }

    if (reference) {
      const referenceApplications = Array.isArray(reference.applications)
        ? (reference.applications as Array<Record<string, unknown>>)
        : [];

      const { error: deleteError } = await supabase
        .from("vehicle_applications")
        .delete()
        .eq("company_id", workspace.company.id)
        .eq("product_id", product.id)
        .eq("source", reference.provider);

      if (deleteError) throw deleteError;

      const rows = referenceApplications
        .filter(
          (app) =>
            typeof app.brand === "string" &&
            app.brand.trim() &&
            typeof app.model === "string" &&
            app.model.trim(),
        )
        .map((app) => ({
          company_id: workspace.company.id,
          product_id: product.id,
          vehicle_brand: String(app.brand).trim(),
          vehicle_model: String(app.model).trim(),
          year_start: typeof app.yearStart === "number" ? app.yearStart : null,
          year_end: typeof app.yearEnd === "number" ? app.yearEnd : null,
          engine: typeof app.engine === "string" ? app.engine : null,
          version: typeof app.version === "string" ? app.version : null,
          source: reference.provider,
          source_external_id: reference.external_code,
          notes: reference.application_text,
        }));

      if (rows.length) {
        const { error: appError } = await supabase
          .from("vehicle_applications")
          .insert(rows);
        if (appError) throw appError;
      }
    } else {
      const app = body.application;
      const vehicleBrand = app?.brand?.trim();
      const vehicleModel = app?.model?.trim();

      if (app && vehicleBrand && vehicleModel) {
        const { error: appError } = await supabase
          .from("vehicle_applications")
          .insert({
            company_id: workspace.company.id,
            product_id: product.id,
            vehicle_brand: vehicleBrand,
            vehicle_model: vehicleModel,
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
    if (!workspace) {
      return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    }

    const { supabase } = await requireUser();
    const body = (await request.json()) as ProductBody;

    if (!body.id) {
      return NextResponse.json({ error: "Produto inválido." }, { status: 400 });
    }

    const catId =
      body.category !== undefined
        ? await categoryId(supabase, workspace.company.id, body.category)
        : undefined;

    const { data, error } = await supabase
      .from("products")
      .update({
        ...(body.sku !== undefined ? { sku: body.sku.trim() } : {}),
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(catId !== undefined ? { category_id: catId } : {}),
        ...(body.manufacturer !== undefined
          ? { manufacturer: body.manufacturer.trim() || null }
          : {}),
        ...(body.brand !== undefined ? { brand: body.brand.trim() || null } : {}),
        ...(body.originalCode !== undefined
          ? { original_code: body.originalCode.trim() || null }
          : {}),
        ...(body.barcode !== undefined
          ? { barcode: body.barcode.trim() || null }
          : {}),
        ...(body.description !== undefined
          ? { description: body.description.trim() || null }
          : {}),
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
