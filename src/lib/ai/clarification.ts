import type { MissingField, PartIntent } from "./types";

const LABELS: Record<MissingField, string> = {
  part_name: "qual peça você procura",
  brand: "a marca do veículo",
  model: "o modelo do veículo",
  year: "o ano do veículo",
  engine: "a motorização",
  version: "a versão",
  side: "o lado da peça (esquerdo ou direito)",
  axle: "se é dianteira ou traseira",
  position: "a posição da peça",
};

const PRIORITY: MissingField[] = [
  "part_name",
  "brand",
  "model",
  "year",
  "engine",
  "side",
  "axle",
  "position",
  "version",
];

export function buildClarification(intent: PartIntent) {
  const missing = PRIORITY.filter((field) => intent.missingFields.includes(field));

  if (missing.length === 0) {
    return "Preciso de mais uma informação para confirmar a aplicação correta.";
  }

  const selected = missing.slice(0, 2).map((field) => LABELS[field]);

  if (selected.length === 1) {
    return `Para confirmar a peça correta, me informe ${selected[0]}.`;
  }

  return `Para confirmar a peça correta, me informe ${selected[0]} e ${selected[1]}.`;
}
