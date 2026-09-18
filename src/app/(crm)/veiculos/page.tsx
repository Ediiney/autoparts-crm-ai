import Link from "next/link";
import { CarFront, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type VehicleRow = {
  id: string;
  customer_id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  model_year: number | null;
  engine: string | null;
  version: string | null;
  transmission: string | null;
  plate: string | null;
  customer_name: string;
};

export default async function VeiculosPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_vehicles_page", {
    p_branch_id: workspace.branch?.id ?? null,
    p_limit: 200,
  });

  if (error) throw error;

  const rows = ((data ?? []) as unknown as VehicleRow[]);

  return (
    <div>
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Garagem</span>
          <h1>Veículos</h1>
          <p>Veículos vinculados à carteira da filial.</p>
        </div>
        <Link prefetch={false} href="/veiculos/novo" className="button-v2 primary">
          <Plus size={14} /> Adicionar veículo
        </Link>
      </div>

      {rows.length ? (
        <div className="table-v2-wrap">
          <table className="table-v2">
            <thead>
              <tr><th>Veículo</th><th>Ano</th><th>Motor</th><th>Câmbio</th><th>Cliente</th><th>Placa</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="product-cell-v2">
                      <div className="product-cell-v2-icon"><CarFront size={16} /></div>
                      <div>
                        <strong>{[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Veículo"}</strong>
                        <span>{vehicle.version || "Versão não informada"}</span>
                      </div>
                    </div>
                  </td>
                  <td>{vehicle.model_year || vehicle.year || "—"}</td>
                  <td>{vehicle.engine || "—"}</td>
                  <td>{vehicle.transmission || "—"}</td>
                  <td>{vehicle.customer_name || "Cliente"}</td>
                  <td>{vehicle.plate || "—"}</td>
                  <td><Link prefetch={false} className="row-action-v2" href={`/veiculos/${vehicle.id}`}>Detalhes</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-v2">
          <div className="empty-v2-icon"><CarFront size={22} /></div>
          <h2>Nenhum veículo</h2>
          <p>Adicione um veículo para acelerar as consultas de compatibilidade.</p>
          <Link prefetch={false} href="/veiculos/novo" className="button-v2 primary">
            <Plus size={14} /> Adicionar veículo
          </Link>
        </div>
      )}
    </div>
  );
}
