export const BRAZIL_TIMEZONES = [
  { value: "America/Noronha", label: "Fernando de Noronha", offset: "UTC-02:00", region: "Fernando de Noronha (PE)" },
  { value: "America/Sao_Paulo", label: "Brasília / São Paulo", offset: "UTC-03:00", region: "SP, RJ, MG, ES, PR, SC, RS, GO, DF, TO" },
  { value: "America/Bahia", label: "Salvador", offset: "UTC-03:00", region: "Bahia" },
  { value: "America/Belem", label: "Belém", offset: "UTC-03:00", region: "Pará e Amapá" },
  { value: "America/Fortaleza", label: "Fortaleza", offset: "UTC-03:00", region: "CE, MA, PB, PI, RN" },
  { value: "America/Recife", label: "Recife", offset: "UTC-03:00", region: "Pernambuco continental" },
  { value: "America/Maceio", label: "Maceió", offset: "UTC-03:00", region: "Alagoas e Sergipe" },
  { value: "America/Cuiaba", label: "Cuiabá", offset: "UTC-04:00", region: "Mato Grosso" },
  { value: "America/Campo_Grande", label: "Campo Grande", offset: "UTC-04:00", region: "Mato Grosso do Sul" },
  { value: "America/Manaus", label: "Manaus", offset: "UTC-04:00", region: "Amazonas (maior parte)" },
  { value: "America/Porto_Velho", label: "Porto Velho", offset: "UTC-04:00", region: "Rondônia" },
  { value: "America/Boa_Vista", label: "Boa Vista", offset: "UTC-04:00", region: "Roraima" },
  { value: "America/Rio_Branco", label: "Rio Branco", offset: "UTC-05:00", region: "Acre" },
  { value: "America/Eirunepe", label: "Eirunepé", offset: "UTC-05:00", region: "Oeste do Amazonas" },
] as const;

export type BrazilTimezone = (typeof BRAZIL_TIMEZONES)[number]["value"];

export function formatInTimezone(
  value: string | number | Date,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    dateStyle: "short",
    timeStyle: "short",
    ...options,
  }).format(new Date(value));
}

export function timezoneLabel(timeZone: string) {
  const found = BRAZIL_TIMEZONES.find((item) => item.value === timeZone);
  return found ? `${found.label} · ${found.offset}` : timeZone;
}

export function startOfTodayInTimezone(timeZone: string) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const offset = BRAZIL_TIMEZONES.find((item) => item.value === timeZone)?.offset.replace("UTC", "") ?? "-03:00";
  return new Date(`${year}-${month}-${day}T00:00:00${offset}`).toISOString();
}

export function formatTimeInTimezone(value: string | Date, timeZone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
