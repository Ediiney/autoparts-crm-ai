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

type PreparedItem = {
  index: number;
  item: NormalizedCatalogItem;
  sku: string;
  name: string;
  source: string;
  categoryKey?: string;
};

type ImportRow = {
  company_id: string;
  import_id: string;
  row_number: number;
  status: "processed" | "error";
  raw_payload: NormalizedCatalogItem;
  normalized_payload?: {
    sku: string;
    name: string;
    normalizedName: string;
  };
  error_message?: string;
};

function validateItem(item: NormalizedCatalogItem) {
  if (!item.sku?.trim() || !item.name?.trim()) {
    return "SKU e nome são obrigatórios.";
  }

  for (const [label, value] of [
    ["preço", item.price],
    ["custo", item.cost],
    ["estoque", item.stock],
  ] as const) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      return `${label} precisa ser um número maior ou igual a zero.`;
    }
  }

  for (const application of item.applications ?? []) {
    if (!application.brand?.trim() || !application.model?.trim()) {
      return "Marca e modelo são obrigatórios nas aplicações veiculares.";
    }

    if (
      application.yearStart !== undefined &&
      (application.yearStart < 1900 || application.yearStart > 2200)
    ) {
      return "Ano inicial da aplicação é inválido.";
    }

    if (
      application.yearEnd !== undefined &&
      (application.yearEnd < 1900 || application.yearEnd > 2200)
    ) {
      return "Ano final da aplicação é inválido.";
    }

    if (
      application.yearStart !== undefined &&
      application.yearEnd !== undefined &&
      application.yearStart > application.yearEnd
    ) {
      return "Ano inicial não pode ser maior que o ano final.";
    }
  }

  return null;
}

async function loadCategoryMap(
  supabase: SupabaseClient,
  companyId: string,
  prepared: PreparedItem[],
) {
  const categories = new Map<string, string>();

  for (const { item } of prepared) {
    if (!item.category?.trim()) continue;
    categories.set(normalizeText(item.category), item.category.trim());
  }

  if (categories.size === 0) return new Map<string, string>();

  const keys = [...categories.keys()];
  const { data: existing, error: readError } = await supabase
    .from("product_categories")
    .select("id,normalized_name")
    .eq("company_id", companyId)
    .in("normalized_name", keys);

  if (readError) throw readError;

  const categoryMap = new Map(
    (existing ?? []).map((row) => [row.normalized_name as string, row.id as string]),
  );

  const missing = keys.filter((key) => !categoryMap.has(key));

  if (missing.length) {
    const { error: insertError } = await supabase.from("product_categories").upsert(
      missing.map((key) => ({
        company_id: companyId,
        name: categories.get(key) ?? key,
        normalized_name: key,
        active: true,
      })),
      {
        onConflict: "company_id,normalized_name",
        ignoreDuplicates: true,
      },
    );

    if (insertError) throw insertError;

    const { data: refreshed, error: refreshError } = await supabase
      .from("product_categories")
      .select("id,normalized_name")
      .eq("company_id", companyId)
      .in("normalized_name", keys);

    if (refreshError) throw refreshError;

    for (const row of refreshed ?? []) {
      categoryMap.set(row.normalized_name as string, row.id as string);
    }
  }

  return categoryMap;
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

  const importRows: ImportRow[] = [];
  const prepared: PreparedItem[] = [];
  const seenSkus = new Set<string>();

  items.forEach((item, index) => {
    const validationError = validateItem(item);
    const sku = item.sku?.trim() ?? "";
    const name = item.name?.trim() ?? "";

    if (validationError) {
      importRows.push({
        company_id: companyId,
        import_id: importJob.id,
        row_number: index + 1,
        status: "error",
        raw_payload: item,
        error_message: validationError,
      });
      return;
    }

    if (seenSkus.has(sku)) {
      importRows.push({
        company_id: companyId,
        import_id: importJob.id,
        row_number: index + 1,
        status: "error",
        raw_payload: item,
        error_message: "SKU duplicado dentro do mesmo lote.",
      });
      return;
    }

    seenSkus.add(sku);
    prepared.push({
      index,
      item,
      sku,
      name,
      source: item.source?.trim() || "import",
      categoryKey: item.category?.trim() ? normalizeText(item.category) : undefined,
    });
  });

  try {
    const [{ data: mainWarehouse }, categoryMap] = await Promise.all([
      supabase
        .from("warehouses")
        .select("id")
        .eq("company_id", companyId)
        .eq("code", "MAIN")
        .eq("active", true)
        .maybeSingle(),
      loadCategoryMap(supabase, companyId, prepared),
    ]);

    const skus = prepared.map((entry) => entry.sku);
    const { data: existingProducts, error: existingError } = skus.length
      ? await supabase
          .from("products")
          .select("id,sku")
          .eq("company_id", companyId)
          .in("sku", skus)
      : { data: [], error: null };

    if (existingError) throw existingError;

    const existingSkuSet = new Set(
      (existingProducts ?? []).map((product) => product.sku as string),
    );

    let productMap = new Map<string, string>();

    if (prepared.length) {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .upsert(
          prepared.map(({ item, sku, name, source, categoryKey }) => ({
            company_id: companyId,
            sku,
            name,
            category_id: categoryKey ? categoryMap.get(categoryKey) ?? null : null,
            manufacturer: item.manufacturer?.trim() || null,
            brand: item.brand?.trim() || null,
            original_code: item.originalCode?.trim() || null,
            barcode: item.barcode?.trim() || null,
            description: item.description?.trim() || null,
            source,
            source_external_id: item.sourceExternalId?.trim() || null,
            active: true,
          })),
          { onConflict: "company_id,sku" },
        )
        .select("id,sku");

      if (productsError) throw productsError;

      productMap = new Map(
        (products ?? []).map((product) => [product.sku as string, product.id as string]),
      );
    }

    const applications = [];
    const priceRows = [];
    const inventoryRows = [];
    const applicationDeletes = new Map<string, string[]>();

    for (const entry of prepared) {
      const productId = productMap.get(entry.sku);
      if (!productId) throw new Error(`Produto ${entry.sku} não retornou ID após o upsert.`);

      if (entry.item.applications) {
        const bucket = applicationDeletes.get(entry.source);
        if (bucket) bucket.push(productId);
        else applicationDeletes.set(entry.source, [productId]);

        for (const app of entry.item.applications) {
          applications.push({
            company_id: companyId,
            product_id: productId,
            vehicle_brand: app.brand.trim(),
            vehicle_model: app.model.trim(),
            year_start: app.yearStart ?? null,
            year_end: app.yearEnd ?? null,
            engine: app.engine?.trim() || null,
            version: app.version?.trim() || null,
            transmission: app.transmission?.trim() || null,
            fuel: app.fuel?.trim() || null,
            side: app.side ?? null,
            axle: app.axle ?? null,
            position: app.position?.trim() || null,
            notes: app.notes?.trim() || null,
            source: entry.source,
            source_external_id: entry.item.sourceExternalId?.trim() || null,
          });
        }
      }

      if (typeof entry.item.price === "number") {
        priceRows.push({
          company_id: companyId,
          product_id: productId,
          price_type: "retail",
          price: entry.item.price,
          cost: entry.item.cost ?? null,
          source: entry.source,
        });
      }

      if (typeof entry.item.stock === "number" && mainWarehouse) {
        inventoryRows.push({
          company_id: companyId,
          product_id: productId,
          warehouse_id: mainWarehouse.id,
          quantity: entry.item.stock,
          reserved: 0,
        });
      }

      importRows.push({
        company_id: companyId,
        import_id: importJob.id,
        row_number: entry.index + 1,
        status: "processed",
        raw_payload: entry.item,
        normalized_payload: {
          sku: entry.sku,
          name: entry.name,
          normalizedName: normalizeText(entry.name),
        },
      });
    }

    for (const [source, productIds] of applicationDeletes) {
      const { error } = await supabase
        .from("vehicle_applications")
        .delete()
        .eq("company_id", companyId)
        .eq("source", source)
        .in("product_id", productIds);

      if (error) throw error;
    }

    const operations = [];

    if (applications.length) {
      operations.push(supabase.from("vehicle_applications").insert(applications));
    }

    if (priceRows.length) {
      operations.push(supabase.from("product_prices").insert(priceRows));
    }

    if (inventoryRows.length) {
      operations.push(
        supabase
          .from("product_inventory")
          .upsert(inventoryRows, { onConflict: "product_id,warehouse_id" }),
      );
    }

    if (importRows.length) {
      operations.push(supabase.from("catalog_import_rows").insert(importRows));
    }

    const operationResults = await Promise.all(operations);
    for (const operation of operationResults) {
      if (operation.error) throw operation.error;
    }

    const errors = importRows.filter((row) => row.status === "error").length;
    const inserted = prepared.filter((entry) => !existingSkuSet.has(entry.sku)).length;
    const updated = prepared.length - inserted;
    const status =
      errors === 0 ? "completed" : errors === items.length ? "failed" : "partial";

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";

    await supabase
      .from("catalog_imports")
      .update({
        status: "failed",
        processed_rows: 0,
        error_rows: items.length,
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", importJob.id)
      .eq("company_id", companyId);

    throw error;
  }
}
