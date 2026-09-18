export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const PART_ALIASES: Array<[RegExp, string]> = [
  [/\bbandei?ja\b/i, "bandeja de suspensão"],
  [/\bpiv[oô]\b/i, "pivô de suspensão"],
  [/\bhomocin[eé]tica\b/i, "junta homocinética"],
  [/\bterminal(?: de dire[cç][aã]o)?\b/i, "terminal de direção"],
  [/\bbieleta\b/i, "bieleta"],
  [/\bcoxim\b/i, "coxim"],
  [/\bamortecedor\b/i, "amortecedor"],
  [/\btrizeta\b/i, "trizeta"],
  [/\bkit(?: do)? amortecedor\b/i, "kit do amortecedor"],
];

export function detectFallbackPart(message: string) {
  for (const [pattern, canonical] of PART_ALIASES) {
    if (pattern.test(message)) return canonical;
  }

  return undefined;
}
