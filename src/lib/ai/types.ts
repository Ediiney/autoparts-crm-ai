export type VehicleIntent = {
  brand?: string;
  model?: string;
  year?: number;
  engine?: string;
  version?: string;
  transmission?: string;
  fuel?: string;
  side?: "left" | "right" | "both" | "center";
  axle?: "front" | "rear" | "both";
  position?: string;
};

export type MissingField =
  | "part_name"
  | "brand"
  | "model"
  | "year"
  | "engine"
  | "version"
  | "side"
  | "axle"
  | "position";

export type PartIntent = {
  rawMessage: string;
  partName?: string;
  normalizedPartName?: string;
  vehicle: VehicleIntent;
  confidence: number;
  missingFields: MissingField[];
  provider: "openai" | "fallback";
  model?: string;
  rawModelOutput?: unknown;
};
