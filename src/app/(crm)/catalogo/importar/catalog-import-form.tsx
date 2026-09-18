"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  PackageSearch,
  UploadCloud,
} from "lucide-react";
import { Button, Card, StatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/page-header";

type Application = {
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
};

type ImportItem = {
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
  applications?: Application[];
};

type Preview = {
  fileName: string;
  items: ImportItem[];
  errors: string[];
};

const headerAliases: Record<string, string> = {
  sku: "sku",
  codigo: "sku",
  código: "sku",
  cod: "sku",
  code: "sku",
  nome: "name",
  name: "name",
  produto: "name",
  descricao: "description",
  descrição: "description",
  description: "description",
  categoria: "category",
  category: "category",
  fabricante: "manufacturer",
  manufacturer: "manufacturer",
  marca: "brand",
  brand: "brand",
  codigo_original: "originalCode",
  código_original: "originalCode",
  original_code: "originalCode",
  originalcode: "originalCode",
  barcode: "barcode",
  codigo_barras: "barcode",
  preco: "price",
  preço: "price",
  price: "price",
  custo: "cost",
  cost: "cost",
  estoque: "stock",
  stock: "stock",
  marca_veiculo: "vehicleBrand",
  vehicle_brand: "vehicleBrand",
  montadora: "vehicleBrand",
  modelo: "vehicleModel",
  modelo_veiculo: "vehicleModel",
  vehicle_model: "vehicleModel",
  ano_inicio: "yearStart",
  year_start: "yearStart",
  ano_fim: "yearEnd",
  year_end: "yearEnd",
  motor: "engine",
  engine: "engine",
  versao: "version",
  versão: "version",
  version: "version",
  cambio: "transmission",
  câmbio: "transmission",
  transmission: "transmission",
  combustivel: "fuel",
  combustível: "fuel",
  fuel: "fuel",
  lado: "side",
  side: "side",
  eixo: "axle",
  axle: "axle",
  posicao: "position",
  posição: "position",
  position: "position",
  observacao: "notes",
  observação: "notes",
  notes: "notes",
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function toNumber(value?: string) {
  if (!value?.trim()) return undefined;
  const normalized = value
    .trim()
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toYear(value?: string) {
  const n = toNumber(value);
  if (!n) return undefined;
  const year = Math.trunc(n);
  return year >= 1900 && year <= 2200 ? year : undefined;
}

function normalizeSide(value?: string): Application["side"] {
  const v = value?.trim().toLowerCase();
  if (!v) return undefined;
  if (["esquerdo", "esquerda", "left", "le"].includes(v)) return "left";
  if (["direito", "direita", "right", "ld"].includes(v)) return "right";
  if (["ambos", "both"].includes(v)) return "both";
  if (["centro", "central", "center"].includes(v)) return "center";
  return undefined;
}

function normalizeAxle(value?: string): Application["axle"] {
  const v = value?.trim().toLowerCase();
  if (!v) return undefined;
  if (["dianteiro", "dianteira", "front"].includes(v)) return "front";
  if (["traseiro", "traseira", "rear"].includes(v)) return "rear";
  if (["ambos", "both"].includes(v)) return "both";
  return undefined;
}

function parseDelimited(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === delimiter && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

function rowsToItems(rows: Record<string, string>[]) {
  const errors: string[] = [];
  const bySku = new Map<string, ImportItem>();

  rows.forEach((raw, index) => {
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      const canonical = headerAliases[normalizeHeader(key)] ?? normalizeHeader(key);
      mapped[canonical] = value;
    }

    const sku = mapped.sku?.trim();
    const name = mapped.name?.trim() || mapped.description?.trim();

    if (!sku || !name) {
      errors.push(`Linha ${index + 2}: SKU/código e nome são obrigatórios.`);
      return;
    }

    let item = bySku.get(sku);
    if (!item) {
      item = {
        sku,
        name,
        category: mapped.category?.trim() || undefined,
        manufacturer: mapped.manufacturer?.trim() || undefined,
        brand: mapped.brand?.trim() || undefined,
        originalCode: mapped.originalCode?.trim() || undefined,
        barcode: mapped.barcode?.trim() || undefined,
        description: mapped.description?.trim() || undefined,
        price: toNumber(mapped.price),
        cost: toNumber(mapped.cost),
        stock: toNumber(mapped.stock),
        source: "file-import",
        applications: [],
      };
      bySku.set(sku, item);
    }

    const vehicleBrand = mapped.vehicleBrand?.trim();
    const vehicleModel = mapped.vehicleModel?.trim();

    if (vehicleBrand && vehicleModel) {
      item.applications ??= [];
      item.applications.push({
        brand: vehicleBrand,
        model: vehicleModel,
        yearStart: toYear(mapped.yearStart),
        yearEnd: toYear(mapped.yearEnd),
        engine: mapped.engine?.trim() || undefined,
        version: mapped.version?.trim() || undefined,
        transmission: mapped.transmission?.trim() || undefined,
        fuel: mapped.fuel?.trim() || undefined,
        side: normalizeSide(mapped.side),
        axle: normalizeAxle(mapped.axle),
        position: mapped.position?.trim() || undefined,
        notes: mapped.notes?.trim() || undefined,
      });
    }
  });

  return { items: [...bySku.values()], errors };
}

function parseCsv(text: string) {
  const delimiter = detectDelimiter(text);
  const data = parseDelimited(text, delimiter);
  if (data.length < 2) return { items: [], errors: ["O arquivo CSV não possui linhas de dados."] };

  const headers = data[0].map((header) => header.trim());
  const rows = data.slice(1).map((values) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });

  return rowsToItems(rows);
}

function parseJson(text: string) {
  const parsed = JSON.parse(text) as unknown;
  if (!Array.isArray(parsed)) {
    return { items: [], errors: ["O JSON deve conter um array de produtos."] };
  }

  const rows = parsed.filter((item): item is Record<string, string> => {
    return Boolean(item) && typeof item === "object" && !Array.isArray(item);
  }).map((item) => Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key, value == null ? "" : String(value)]),
  ));

  return rowsToItems(rows);
}

export function CatalogImportForm({
  companyId,
  sourceId,
  sourceName,
  sourceUrl,
}: {
  companyId: string;
  sourceId?: string;
  sourceName?: string;
  sourceUrl?: string | null;
}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ total: number; inserted: number; updated: number; errors: number } | null>(null);

  const applicationsCount = useMemo(
    () => preview?.items.reduce((sum, item) => sum + (item.applications?.length ?? 0), 0) ?? 0,
    [preview],
  );

  async function onFile(file: File) {
    setResult(null);
    setProgress("");
    const text = await file.text();

    try {
      const parsed = file.name.toLowerCase().endsWith(".json")
        ? parseJson(text)
        : parseCsv(text);
      setPreview({ fileName: file.name, ...parsed });
    } catch (error) {
      setPreview({
        fileName: file.name,
        items: [],
        errors: [error instanceof Error ? error.message : "Arquivo inválido."],
      });
    }
  }

  async function importData() {
    if (!preview?.items.length) return;
    setLoading(true);
    setResult(null);

    const batches: ImportItem[][] = [];
    for (let index = 0; index < preview.items.length; index += 200) {
      batches.push(preview.items.slice(index, index + 200));
    }

    let total = 0;
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    try {
      for (let index = 0; index < batches.length; index += 1) {
        setProgress(`Importando lote ${index + 1} de ${batches.length}...`);
        const response = await fetch("/api/catalog/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            sourceId,
            fileName: preview.fileName,
            items: batches[index],
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Falha na importação.");
        }

        total += Number(payload.total ?? 0);
        inserted += Number(payload.inserted ?? 0);
        updated += Number(payload.updated ?? 0);
        errors += Number(payload.errors ?? 0);
      }

      setResult({ total, inserted, updated, errors });
      setProgress("Importação concluída.");
    } catch (error) {
      setProgress(error instanceof Error ? error.message : "Falha na importação.");
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const csv = [
      "sku;nome;categoria;codigo_original;preco;estoque;marca_veiculo;modelo_veiculo;ano_inicio;ano_fim;motor;versao;lado;eixo",
      "GIA-0001;Bandeja de suspensão;Suspensão;ABC123;329,90;10;Honda;Civic;2007;2011;1.8;;esquerda;dianteiro",
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelo-importacao-autoparts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Importar catálogo"
        description="Carregue CSV ou JSON. Produtos repetidos por SKU são agrupados e suas aplicações veiculares são preservadas."
        actions={<Link href="/catalogo" className="button secondary"><ArrowLeft size={15}/>Voltar ao catálogo</Link>}
      />

      <div className="import-grid">
        <Card className="import-panel">
          <div className="import-title"><UploadCloud size={20}/><div><h2>Arquivo de produtos</h2><p>Use CSV separado por vírgula ou ponto e vírgula, ou um array JSON.</p></div></div>

          <label className="dropzone">
            <UploadCloud size={30}/>
            <strong>Selecione um arquivo</strong>
            <span>.csv ou .json</span>
            <input
              type="file"
              accept=".csv,.json,text/csv,application/json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onFile(file);
              }}
            />
          </label>

          <div className="import-help">
            <button type="button" className="button ghost" onClick={downloadTemplate}><FileSpreadsheet size={14}/>Baixar modelo CSV</button>
            {sourceName ? (
              <div className="source-hint">
                <PackageSearch size={14}/>
                <div><strong>Fonte configurada: {sourceName}</strong>{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">Abrir fonte</a> : null}</div>
              </div>
            ) : null}
          </div>

          {preview ? (
            <div className="import-summary">
              <div className="import-file"><FileJson size={18}/><div><strong>{preview.fileName}</strong><span>{preview.items.length} produtos · {applicationsCount} aplicações</span></div></div>
              {preview.errors.length ? (
                <div className="import-errors"><AlertCircle size={16}/><div><strong>{preview.errors.length} avisos</strong>{preview.errors.slice(0,5).map((error)=><span key={error}>{error}</span>)}</div></div>
              ) : (
                <div className="import-ready"><CheckCircle2 size={16}/><span>Arquivo pronto para importação.</span></div>
              )}
            </div>
          ) : null}

          {progress ? <div className={result ? "auth-message success" : "auth-message"}>{progress}</div> : null}

          {result ? (
            <div className="import-result-grid">
              <div><span>Total</span><strong>{result.total}</strong></div>
              <div><span>Novos</span><strong>{result.inserted}</strong></div>
              <div><span>Atualizados</span><strong>{result.updated}</strong></div>
              <div><span>Erros</span><strong>{result.errors}</strong></div>
            </div>
          ) : null}

          <div className="import-actions">
            <Button variant="secondary">Validar novamente</Button>
            <button className="button primary" type="button" disabled={loading || !preview?.items.length} onClick={()=>void importData()}>
              {loading ? "Importando..." : `Importar ${preview?.items.length ?? 0} produtos`}
            </button>
          </div>
        </Card>

        <Card className="import-panel">
          <div className="import-title"><FileSpreadsheet size={20}/><div><h2>Campos reconhecidos</h2><p>Os títulos podem estar em português ou inglês.</p></div></div>
          <div className="field-groups">
            <div><strong>Produto</strong><span>SKU/código, nome, categoria, fabricante, marca, código original, código de barras, descrição.</span></div>
            <div><strong>Comercial</strong><span>Preço, custo e estoque.</span></div>
            <div><strong>Aplicação</strong><span>Marca do veículo, modelo, ano inicial/final, motor, versão, câmbio, combustível, lado, eixo e posição.</span></div>
          </div>
          <div className="import-policy"><StatusBadge tone="success">Regra de segurança</StatusBadge><p>Se preço ou estoque não vierem no arquivo, o sistema não cria valores fictícios. A IA continuará informando apenas o que existe na base.</p></div>
        </Card>
      </div>
    </>
  );
}
