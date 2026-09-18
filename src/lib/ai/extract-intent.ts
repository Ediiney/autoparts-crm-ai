import OpenAI from "openai";
import { detectFallbackPart, normalizeText } from "./normalize";
import type { MissingField, PartIntent, VehicleIntent } from "./types";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    partName: { type: ["string", "null"] },
    brand: { type: ["string", "null"] },
    model: { type: ["string", "null"] },
    year: { type: ["integer", "null"] },
    engine: { type: ["string", "null"] },
    version: { type: ["string", "null"] },
    transmission: { type: ["string", "null"] },
    fuel: { type: ["string", "null"] },
    side: { type: ["string", "null"], enum: ["left", "right", "both", "center", null] },
    axle: { type: ["string", "null"], enum: ["front", "rear", "both", null] },
    position: { type: ["string", "null"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    missingFields: {
      type: "array",
      items: {
        type: "string",
        enum: ["part_name", "brand", "model", "year", "engine", "version", "side", "axle", "position"],
      },
    },
  },
  required: [
    "partName",
    "brand",
    "model",
    "year",
    "engine",
    "version",
    "transmission",
    "fuel",
    "side",
    "axle",
    "position",
    "confidence",
    "missingFields",
  ],
};

function compactVehicle(parsed: Record<string, unknown>): VehicleIntent {
  const vehicle: VehicleIntent = {};
  const fields = ["brand", "model", "engine", "version", "transmission", "fuel", "position"] as const;

  for (const field of fields) {
    if (typeof parsed[field] === "string" && parsed[field]) {
      vehicle[field] = parsed[field] as never;
    }
  }

  if (typeof parsed.year === "number") vehicle.year = parsed.year;
  if (["left", "right", "both", "center"].includes(String(parsed.side))) {
    vehicle.side = parsed.side as VehicleIntent["side"];
  }
  if (["front", "rear", "both"].includes(String(parsed.axle))) {
    vehicle.axle = parsed.axle as VehicleIntent["axle"];
  }

  return vehicle;
}

function augmentMissingFields(intent: PartIntent): PartIntent {
  const missing = new Set(intent.missingFields);

  if (!intent.partName) missing.add("part_name");

  // Em autopeças, modelo + ano são a base mínima para tentar uma aplicação.
  if (!intent.vehicle.model) missing.add("model");
  if (!intent.vehicle.year) missing.add("year");

  return { ...intent, missingFields: [...missing] };
}

function fallback(message: string): PartIntent {
  const partName = detectFallbackPart(message);
  const yearMatch = message.match(/\b(19\d{2}|20\d{2}|21\d{2})\b/);
  const normalized = normalizeText(message);

  const vehicle: VehicleIntent = {};
  if (yearMatch) vehicle.year = Number(yearMatch[1]);

  if (/\besquerd[ao]\b/.test(normalized)) vehicle.side = "left";
  if (/\bdireit[ao]\b/.test(normalized)) vehicle.side = "right";
  if (/\bdianteir[ao]\b/.test(normalized)) vehicle.axle = "front";
  if (/\btraseir[ao]\b/.test(normalized)) vehicle.axle = "rear";

  const missing: MissingField[] = [];
  if (!partName) missing.push("part_name");
  missing.push("model");
  if (!vehicle.year) missing.push("year");

  return {
    rawMessage: message,
    partName,
    normalizedPartName: partName ? normalizeText(partName) : undefined,
    vehicle,
    confidence: partName ? 0.58 : 0.25,
    missingFields: missing,
    provider: "fallback",
  };
}

export async function extractPartIntent(message: string): Promise<PartIntent> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) return fallback(message);

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model,
      instructions:
        "Você extrai dados de consultas brasileiras de autopeças. Não invente dados do veículo. Corrija apenas erros ortográficos óbvios no nome da peça. Se um dado não foi informado ou não puder ser determinado com segurança, retorne null e inclua o campo em missingFields. Não gere preço, código, estoque ou compatibilidade.",
      input: message,
      text: {
        format: {
          type: "json_schema",
          name: "part_intent",
          strict: true,
          schema,
        },
      },
    } as never);

    const parsed = JSON.parse(response.output_text) as Record<string, unknown>;
    const partName = typeof parsed.partName === "string" ? parsed.partName : undefined;

    return augmentMissingFields({
      rawMessage: message,
      partName,
      normalizedPartName: partName ? normalizeText(partName) : undefined,
      vehicle: compactVehicle(parsed),
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,
      missingFields: Array.isArray(parsed.missingFields)
        ? (parsed.missingFields.filter((item) => typeof item === "string") as MissingField[])
        : [],
      provider: "openai",
      model,
      rawModelOutput: parsed,
    });
  } catch {
    return fallback(message);
  }
}
