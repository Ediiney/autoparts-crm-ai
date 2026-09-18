import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreApplication } from "./match-vehicle";
import type { CatalogCandidate, CatalogSearchInput } from "./types";

type SearchRow = {
  product_id: string;
  sku: string;
  name: string;
  score: number;
};

type ApplicationRow = {
  product_id: string;
  vehicle_brand: string;
  vehicle_model: string;
  year_start: number | null;
  year_end: number | null;
  engine: string | null;
  version: string | null;
  side: string | null;
  axle: string | null;
  position: string | null;
};

type InventoryRow = {
  product_id: string;
  quantity: number;
  reserved: number;
};

export async function searchCatalog(
  supabase: SupabaseClient,
  input: CatalogSearchInput,
): Promise<CatalogCandidate[]> {
  const { data: searchRows, error: searchError } = await supabase.rpc("search_products", {
    p_company_id: input.companyId,
    p_query: input.query,
    p_limit: Math.min(input.limit ?? 12, 50),
  });

  if (searchError) throw searchError;

  const rows = (searchRows ?? []) as SearchRow[];
  if (rows.length === 0) return [];

  const productIds = rows.map((row) => row.product_id);
  const nowIso = new Date().toISOString();

  let pricesQuery = supabase
    .from("product_prices")
    .select("product_id,price,price_type,branch_id,valid_from,valid_to")
    .eq("company_id", input.companyId)
    .in("product_id", productIds)
    .lte("valid_from", nowIso)
    .order("valid_from", { ascending: false });

  if (input.branchId) {
    pricesQuery = pricesQuery.or(`branch_id.eq.${input.branchId},branch_id.is.null`);
  }

  let inventoryQuery = supabase
    .from("product_inventory")
    .select("product_id,quantity,reserved,warehouse:warehouses!inner(branch_id)")
    .eq("company_id", input.companyId)
    .in("product_id", productIds);

  if (input.branchId) {
    inventoryQuery = inventoryQuery.eq("warehouse.branch_id", input.branchId);
  }

  const [applicationsResult, pricesResult, inventoryResult] = await Promise.all([
    supabase
      .from("vehicle_applications")
      .select("product_id,vehicle_brand,vehicle_model,year_start,year_end,engine,version,side,axle,position")
      .eq("company_id", input.companyId)
      .in("product_id", productIds),
    pricesQuery,
    inventoryQuery,
  ]);

  if (applicationsResult.error) throw applicationsResult.error;
  if (pricesResult.error) throw pricesResult.error;
  if (inventoryResult.error) throw inventoryResult.error;

  const applicationsByProduct = new Map<string, ApplicationRow[]>();
  for (const application of (applicationsResult.data ?? []) as ApplicationRow[]) {
    const bucket = applicationsByProduct.get(application.product_id);
    if (bucket) bucket.push(application);
    else applicationsByProduct.set(application.product_id, [application]);
  }

  const priceMap = new Map<string, { price: number; priceType: string }>();
  const pricePriority = new Map<string, number>();

  for (const row of pricesResult.data ?? []) {
    if (row.valid_to && row.valid_to < nowIso) continue;

    const priority = input.branchId
      ? row.branch_id === input.branchId
        ? 2
        : row.branch_id === null
          ? 1
          : 0
      : row.branch_id === null
        ? 2
        : 1;

    if (priority <= (pricePriority.get(row.product_id) ?? -1)) continue;

    pricePriority.set(row.product_id, priority);
    priceMap.set(row.product_id, {
      price: Number(row.price),
      priceType: row.price_type,
    });
  }

  const stockMap = new Map<string, number>();
  for (const row of (inventoryResult.data ?? []) as unknown as InventoryRow[]) {
    const available = Number(row.quantity) - Number(row.reserved);
    stockMap.set(row.product_id, (stockMap.get(row.product_id) ?? 0) + available);
  }

  const candidates = rows.map((row) => {
    const productApps = applicationsByProduct.get(row.product_id) ?? [];
    const scoredApps = productApps
      .map((app) => ({ app, score: scoreApplication(app, input.vehicle) }))
      .sort((a, b) => b.score - a.score);

    const best = scoredApps[0];
    const partScore = Math.max(0, Math.min(1, Number(row.score)));
    const vehicleScore = best?.score ?? 0.35;
    const score = partScore * 0.55 + vehicleScore * 0.45;
    const price = priceMap.get(row.product_id);

    return {
      productId: row.product_id,
      sku: row.sku,
      name: row.name,
      partScore,
      vehicleScore,
      score,
      application: best
        ? {
            brand: best.app.vehicle_brand,
            model: best.app.vehicle_model,
            yearStart: best.app.year_start ?? undefined,
            yearEnd: best.app.year_end ?? undefined,
            engine: best.app.engine ?? undefined,
            version: best.app.version ?? undefined,
            side: best.app.side ?? undefined,
            axle: best.app.axle ?? undefined,
            position: best.app.position ?? undefined,
          }
        : undefined,
      price: price?.price,
      priceType: price?.priceType,
      availableQuantity: stockMap.get(row.product_id),
    };
  });

  return candidates.sort((a, b) => b.score - a.score);
}

export function chooseCandidate(candidates: CatalogCandidate[], minimumScore = 0.82) {
  const first = candidates[0];
  const second = candidates[1];

  if (!first || first.score < minimumScore) {
    return { decision: "not_found" as const };
  }

  if (second && first.score - second.score < 0.06) {
    return { decision: "multiple_matches" as const, candidates: candidates.slice(0, 5) };
  }

  return { decision: "matched" as const, candidate: first };
}
