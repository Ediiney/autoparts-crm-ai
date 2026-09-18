import type { VehicleIntent } from "@/lib/ai/types";
import { normalizeText } from "@/lib/ai/normalize";

type Application = {
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

function containsNormalized(source?: string | null, wanted?: string) {
  if (!wanted) return true;
  if (!source) return false;
  const a = normalizeText(source);
  const b = normalizeText(wanted);
  return a.includes(b) || b.includes(a);
}

export function scoreApplication(app: Application, vehicle: VehicleIntent) {
  let points = 0;
  let possible = 0;

  if (vehicle.brand) {
    possible += 20;
    if (containsNormalized(app.vehicle_brand, vehicle.brand)) points += 20;
  }

  if (vehicle.model) {
    possible += 35;
    if (containsNormalized(app.vehicle_model, vehicle.model)) points += 35;
  }

  if (vehicle.year) {
    possible += 20;
    const start = app.year_start ?? 1900;
    const end = app.year_end ?? 2200;
    if (vehicle.year >= start && vehicle.year <= end) points += 20;
  }

  if (vehicle.engine) {
    possible += 10;
    if (containsNormalized(app.engine, vehicle.engine)) points += 10;
  }

  if (vehicle.version) {
    possible += 5;
    if (containsNormalized(app.version, vehicle.version)) points += 5;
  }

  if (vehicle.side) {
    possible += 5;
    if (!app.side || app.side === "both" || app.side === vehicle.side) points += 5;
  }

  if (vehicle.axle) {
    possible += 5;
    if (!app.axle || app.axle === "both" || app.axle === vehicle.axle) points += 5;
  }

  if (possible === 0) return 0.5;
  return points / possible;
}
