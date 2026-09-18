import type { VehicleIntent } from "@/lib/ai/types";

export type CatalogCandidate = {
  productId: string;
  sku: string;
  name: string;
  partScore: number;
  vehicleScore: number;
  score: number;
  application?: {
    brand: string;
    model: string;
    yearStart?: number;
    yearEnd?: number;
    engine?: string;
    version?: string;
    side?: string;
    axle?: string;
    position?: string;
  };
  price?: number;
  priceType?: string;
  availableQuantity?: number;
};

export type CatalogSearchInput = {
  companyId: string;
  query: string;
  vehicle: VehicleIntent;
  limit?: number;
};
