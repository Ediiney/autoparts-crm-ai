import Link from "next/link";
import {
  Filter,
  Grid2X2,
  List,
  Package,
  PackagePlus,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { createClient } from "@/lib/supabase/server";

type Params = {
  q?: string;
  view?: "table" | "cards";
  stock?: "all" | "available" | "low" | "zero";
  source?: string;
};

type CatalogRow = {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  manufacturer: string | null;
  original_code: string | null;
  source: string | null;
  updated_at: string;
  category_name: string | null;
  application_label: string | null;
  price: number | null;
  available_quantity: number | null;
  image_url: string | null;
  image_alt: string | null;
};

type CatalogPayload = {
  count?: number;
  rows?: CatalogRow[];
  sources?: string[];
};

function money(value: number | null | undefined) {
  if (value === null || value === undefined) return "Sem preço";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const params = await searchParams;
  const supabase = await createClient();
  const q = params.q?.trim() || "";
  const view = params.view === "cards" ? "cards" : "table";

  const { data, error } = await supabase.rpc("get_catalog_page", {
    p_branch_id: workspace.branch?.id ?? null,
    p_query: q,
    p_source: params.source?.trim() || undefined,
    p_limit: 80,
  });

  if (error) throw error;

  const payload = (data ?? {}) as unknown as CatalogPayload;
  const rows = payload.rows ?? [];
  const sources = payload.sources ?? [];
  const filtered = rows.filter((product) => {
    const qty = Number(product.available_quantity ?? 0);
    if (params.stock === "available") return qty > 0;
    if (params.stock === "low") return qty > 0 && qty < 8;
    if (params.stock === "zero") return qty <= 0;
    return true;
  });

  return (
    <div className="catalog-v2">
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Catálogo</span>
          <h1>Peças e aplicações</h1>
          <p>Base operacional para busca, compatibilidade, preço e disponibilidade.</p>
        </div>
        <div className="page-heading-v2-actions">
          <Link className="button-v2 secondary" href="/catalogo/importar">
            <Upload size={14} /> Importar
          </Link>
          <Link className="button-v2 primary" href="/catalogo/nova">
            <PackagePlus size={14} /> Nova peça
          </Link>
        </div>
      </div>

      <section className="catalog-toolbar-v2">
        <form className="catalog-search-v2" method="get">
          <Search size={16} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por peça, SKU ou código original"
          />
          <input type="hidden" name="view" value={view} />
          <input type="hidden" name="stock" value={params.stock ?? "all"} />
          <input type="hidden" name="source" value={params.source ?? ""} />
        </form>

        <div className="catalog-filter-v2">
          <Filter size={14} />
          <select
            name="stock"
            defaultValue={params.stock ?? "all"}
            form="catalog-filter-form"
          >
            <option value="all">Todos os estoques</option>
            <option value="available">Disponível</option>
            <option value="low">Estoque baixo</option>
            <option value="zero">Sem estoque</option>
          </select>
        </div>

        <form id="catalog-filter-form" className="catalog-filter-form-v2" method="get">
          <input type="hidden" name="q" value={q} />
          <input type="hidden" name="view" value={view} />
          <select name="source" defaultValue={params.source ?? ""}>
            <option value="">Todas as fontes</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <button className="button-v2 secondary" type="submit">
            <SlidersHorizontal size={14} /> Aplicar
          </button>
        </form>

        <div className="view-toggle-v2">
          <Link
            className={view === "table" ? "active" : ""}
            href={`/catalogo?q=${encodeURIComponent(q)}&stock=${params.stock ?? "all"}&source=${encodeURIComponent(params.source ?? "")}&view=table`}
          >
            <List size={15} />
          </Link>
          <Link
            className={view === "cards" ? "active" : ""}
            href={`/catalogo?q=${encodeURIComponent(q)}&stock=${params.stock ?? "all"}&source=${encodeURIComponent(params.source ?? "")}&view=cards`}
          >
            <Grid2X2 size={15} />
          </Link>
        </div>
      </section>

      <div className="catalog-summary-v2">
        <span><strong>{payload.count ?? 0}</strong> produtos ativos</span>
        <span>{workspace.branch ? `Estoque: ${workspace.branch.name}` : "Estoque consolidado"}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-v2">
          <div className="empty-v2-icon"><Package size={22} /></div>
          <h2>Nenhuma peça encontrada</h2>
          <p>Ajuste os filtros ou cadastre um novo produto.</p>
          <Link href="/catalogo/nova" className="button-v2 primary">
            <PackagePlus size={14} /> Nova peça
          </Link>
        </div>
      ) : view === "cards" ? (
        <div className="catalog-card-grid-v2">
          {filtered.map((product) => {
            const qty = Number(product.available_quantity ?? 0);
            return (
              <Link href={`/catalogo/${product.id}`} className="product-card-v2" key={product.id} prefetch={false}>
                <div className="product-card-v2-media">
                  {product.image_url ? (
                    // Remote catalog media can come from company-managed providers.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.image_alt || product.name} loading="lazy" />
                  ) : (
                    <Package size={26} />
                  )}
                  <span className="product-source-v2">{product.source || "manual"}</span>
                </div>
                <div className="product-card-v2-body">
                  <div className="product-card-v2-code">{product.sku}</div>
                  <h3>{product.name}</h3>
                  <p>{product.application_label || product.category_name || "Aplicação não cadastrada"}</p>
                  <div className="product-card-v2-footer">
                    <strong>{money(product.price)}</strong>
                    <span className={qty <= 0 ? "stock-v2 zero" : qty < 8 ? "stock-v2 low" : "stock-v2"}>
                      {qty} un.
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="table-v2-wrap">
          <table className="table-v2">
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU / original</th>
                <th>Aplicação</th>
                <th>Preço</th>
                <th>Disponível</th>
                <th>Origem</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const qty = Number(product.available_quantity ?? 0);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell-v2">
                        <div className="product-cell-v2-icon"><Package size={16} /></div>
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.category_name || product.brand || product.manufacturer || "Sem categoria"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{product.sku}</strong>
                      <span className="table-v2-muted">{product.original_code || "—"}</span>
                    </td>
                    <td>{product.application_label || "Sem aplicação"}</td>
                    <td className="price-v2">{money(product.price)}</td>
                    <td>
                      <span className={qty <= 0 ? "stock-v2 zero" : qty < 8 ? "stock-v2 low" : "stock-v2"}>
                        {qty} un.
                      </span>
                    </td>
                    <td><span className="source-pill-v2">{product.source || "manual"}</span></td>
                    <td><Link className="row-action-v2" prefetch={false} href={`/catalogo/${product.id}`}>Detalhes</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
