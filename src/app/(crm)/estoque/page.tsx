import Link from "next/link";
import { Boxes, PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type InventoryPayload = {
  metrics?: {
    total_available?: number;
    low_stock?: number;
    out_of_stock?: number;
    estimated_value?: number;
  };
  rows?: Array<{
    product_id: string;
    sku: string;
    name: string;
    quantity: number;
    reserved: number;
    available: number;
    price: number | null;
  }>;
};

export default async function EstoquePage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_inventory_page", {
    p_branch_id: workspace.branch?.id ?? null,
    p_limit: 500,
  });

  if (error) throw error;

  const payload = (data ?? {}) as unknown as InventoryPayload;
  const rows = payload.rows ?? [];
  const metrics = payload.metrics ?? {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Operação</span>
          <h1>Estoque</h1>
          <p>Saldo da {workspace.branch?.name ?? "operação"} com reservas e valor estimado.</p>
        </div>
        <Link prefetch={false} href="/catalogo" className="button-v2 secondary">
          <PackageSearch size={14} /> Abrir catálogo
        </Link>
      </div>

      <div className="metric-grid-v2">
        <Metric label="Disponível" value={String(Number(metrics.total_available ?? 0))} sub="unidades líquidas" />
        <Metric label="Estoque baixo" value={String(Number(metrics.low_stock ?? 0))} sub="menos de 8 unidades" />
        <Metric label="Esgotados" value={String(Number(metrics.out_of_stock ?? 0))} sub="sem saldo disponível" />
        <Metric label="Valor estimado" value={money.format(Number(metrics.estimated_value ?? 0))} sub="preço vigente da filial" />
      </div>

      {rows.length ? (
        <div className="table-v2-wrap">
          <table className="table-v2">
            <thead>
              <tr><th>Produto</th><th>SKU</th><th>Físico</th><th>Reservado</th><th>Disponível</th><th>Preço</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const available = Number(row.available ?? 0);
                return (
                  <tr key={row.product_id}>
                    <td>
                      <div className="product-cell-v2">
                        <div className="product-cell-v2-icon"><Boxes size={16} /></div>
                        <div><strong>{row.name}</strong><span>{workspace.branch?.name ?? "Consolidado"}</span></div>
                      </div>
                    </td>
                    <td><strong>{row.sku}</strong></td>
                    <td>{Number(row.quantity ?? 0)}</td>
                    <td>{Number(row.reserved ?? 0)}</td>
                    <td><span className={available <= 0 ? "stock-v2 zero" : available < 8 ? "stock-v2 low" : "stock-v2"}>{available} un.</span></td>
                    <td className="price-v2">{row.price !== null && row.price !== undefined ? money.format(Number(row.price)) : "Sem preço"}</td>
                    <td>{available <= 0 ? "Esgotado" : available < 8 ? "Baixo" : "Normal"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-v2">
          <div className="empty-v2-icon"><Boxes size={22} /></div>
          <h2>Sem saldo cadastrado</h2>
          <p>Inclua estoque nos produtos da filial para acompanhar a disponibilidade.</p>
          <Link prefetch={false} href="/catalogo" className="button-v2 primary">Abrir catálogo</Link>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="metric-v2">
      <div className="metric-v2-icon"><Boxes size={16} /></div>
      <div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>
    </div>
  );
}
