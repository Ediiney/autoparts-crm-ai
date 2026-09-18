import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeText } from "@/lib/ai/normalize";

export type NormalizedCatalogItem = {
  sku: string;
  name: string;
  category?: string;
  manufacturer?: string;
  brand?: string;
  originalCode?: string;
  barcode?: string;
  description?: string;
  source?: string;
  sourceExternalId?: string;
  price?: number;
  cost?: number;
  stock?: number;
  applications?: Array<{
    brand: string;
    model: string;
    yearStart?: number;
    yearEnd?: number;
    engine?: string;
    version?: string;
    transmission?: string;
    fuel?: string;
    side?: "left" | "right" | "both" | "center";
    axle?: "front" | "rear" | "both";
    position?: string;
    notes?: string;
  }>;
};

async function getCategoryId(
  supabase: SupabaseClient,
  companyId: string,
  category?: string,
) {
  if (!category) return null;

  const normalized = normalizeText(category);
  const { data: existing, error: readError } = await supabase
    .from("product_categories")
    .select("id")
    .eq("company_id", companyId)
    .eq("normalized_name", normalized)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from("product_categories")
    .insert({
      company_id: companyId,
      name: category,
      normalized_name: normalized,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function importNormalizedCatalog(
  supabase: SupabaseClient,
  user: { id: string },
  companyId: string,
  sourceId: string | undefined,
  fileName: string | undefined,
  items: NormalizedCatalogItem[],
) {
  const { data: importJob, error: importError } = await supabase
    .from("catalog_imports")
    .insert({
      company_id: companyId,
      source_id: sourceId ?? null,
      status: "processing",
      file_name: fileName ?? null,
      total_rows: items.length,
      started_at: new Date().toISOString(),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (importError) throw importError;

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  const { data: mainWarehouse } = await supabase
    .from("warehouses")
    .select("id")
    .eq("company_id", companyId)
    .eq("code", "MAIN")
    .maybeSingle();

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    try {
      if (!item.sku?.trim() || !item.name?.trim()) {
        throw new Error("SKU e nome são obrigatórios.");
      }

      const categoryId = await getCategoryId(supabase, companyId, item.category);

      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("company_id", companyId)
        .eq("sku", item.sku.trim())
        .maybeSingle();

      const { data: product, error: productError } = await supabase
        .from("products")
        .upsert(
          {
            company_id: companyId,
            sku: item.sku.trim(),
            name: item.name.trim(),
            category_id: categoryId,
            manufacturer: item.manufacturer ?? null,
            brand: item.brand ?? null,
            original_code: item.originalCode ?? null,
            barcode: item.barcode ?? null,
            description: item.description ?? null,
            source: item.source ?? "import",
            source_external_id: item.sourceExternalId ?? null,
            active: true,
          },
          { onConflict: "company_id,sku" },
        )
        .select("id")
        .single();

      if (productError) throw productError;
      if (existing) updated += 1;
      else inserted += 1;

      if (item.applications) {
        const { error: deleteAppsError } = await supabase
          .from("vehicle_applications")
          .delete()
          .eq("company_id", companyId)
          .eq("product_id", product.id)
          .eq("source", item.source ?? "import");

        if (deleteAppsError) throw deleteAppsError;

        if (item.applications.length > 0) {
          const { error: appError } = await supabase.from("vehicle_applications").insert(
            item.applications.map((app) => ({
              company_id: companyId,
              product_id: product.id,
              vehicle_brand: app.brand,
              vehicle_model: app.model,
              year_start: app.yearStart ?? null,
              year_end: app.yearEnd ?? null,
              engine: app.engine ?? null,
              version: app.version ?? null,
              transmission: app.transmission ?? null,
              fuel: app.fuel ?? null,
              side: app.side ?? null,
              axle: app.axle ?? null,
              position: app.position ?? null,
              notes: app.notes ?? null,
              source: item.source ?? "import",
              source_external_id: item.sourceExternalId ?? null,
            })),
          );

          if (appError) throw appError;
        }
      }

      if (typeof item.price === "number") {
        const { error: priceError } = await supabase.from("product_prices").insert({
          company_id: companyId,
          product_id: product.id,
          price_type: "retail",
          price: item.price,
          cost: item.cost ?? null,
          source: item.source ?? "import",
        });
        if (priceError) throw priceError;
      }

      if (typeof item.stock === "number" && mainWarehouse) {
        const { error: stockError } = await supabase.from("product_inventory").upsert(
          {
            company_id: companyId,
            product_id: product.id,
            warehouse_id: mainWarehouse.id,
            quantity: Math.max(0, item.stock),
            reserved: 0,
          },
          { onConflict: "product_id,warehouse_id" },
        );
        if (stockError) throw stockError;
      }

      await supabase.from("catalog_import_rows").insert({
        company_id: companyId,
        import_id: importJob.id,
        row_number: index + 1,
        status: "processed",
        raw_payload: item,
        normalized_payload: {
          sku: item.sku.trim(),
          name: item.name.trim(),
          normalizedName: normalizeText(item.name),
        },
      });
    } catch (error) {
      errors += 1;
      await supabase.from("catalog_import_rows").insert({
        company_id: companyId,
        import_id: importJob.id,
        row_number: index + 1,
        status: "error",
        raw_payload: item,
        error_message: error instanceof Error ? error.message : "Erro inesperado.",
      });
    }
  }

  const status = errors === 0 ? "completed" : errors === items.length ? "failed" : "partial";

  const { error: finishError } = await supabase
    .from("catalog_imports")
    .update({
      status,
      processed_rows: items.length,
      inserted_rows: inserted,
      updated_rows: updated,
      error_rows: errors,
      finished_at: new Date().toISOString(),
    })
    .eq("id", importJob.id)
    .eq("company_id", companyId);

  if (finishError) throw finishError;

  return {
    importId: importJob.id as string,
    status,
    total: items.length,
    inserted,
    updated,
    errors,
  };
}
