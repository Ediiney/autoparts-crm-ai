import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { Boxes, Filter, PackageSearch, Search, Upload } from "lucide-react";

const rows=[
  ["GIA-4721","Bandeja de suspensão Civic","18","2","16","R$ 329,90","Normal"],
  ["GIA-1828","Pivô de suspensão Onix","7","1","6","R$ 189,90","Baixo"],
  ["GIA-8330","Junta homocinética Corolla","4","1","3","R$ 459,00","Baixo"],
  ["GIA-2901","Bieleta dianteira Polo","31","3","28","R$ 84,50","Normal"],
  ["GIA-9027","Terminal de direção HB20","0","0","0","R$ 119,00","Esgotado"],
];

export default function EstoquePage(){
  return (
    <>
      <PageHeader eyebrow="Operação" title="Estoque" description="Disponibilidade por produto e saldo reservado em orçamentos." actions={<Button variant="secondary" icon={<Upload size={15}/>}>Atualizar estoque</Button>}/>
      <div className="stats-grid">
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon"><Boxes size={18}/></div></div><div className="stat-value">8.214</div><div className="stat-label">Unidades disponíveis</div><div className="stat-foot">Em 6.842 SKUs ativos</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon amber"><PackageSearch size={18}/></div></div><div className="stat-value">42</div><div className="stat-label">Itens com estoque baixo</div><div className="stat-foot">Abaixo do mínimo configurado</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon purple"><Boxes size={18}/></div></div><div className="stat-value">19</div><div className="stat-label">Itens esgotados</div><div className="stat-foot">Precisam de reposição</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon blue"><Boxes size={18}/></div></div><div className="stat-value">R$ 184k</div><div className="stat-label">Valor estimado</div><div className="stat-foot">Com base no preço de venda</div></Card>
      </div>
      <div className="toolbar"><div className="toolbar-left"><div className="input-shell"><Search size={15}/><input placeholder="Buscar SKU ou peça..."/></div><button className="filter-button"><Filter size={14}/> Status</button></div></div>
      <Card>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>SKU</th><th>Produto</th><th>Físico</th><th>Reservado</th><th>Disponível</th><th>Preço</th><th>Status</th></tr></thead><tbody>
          {rows.map(([sku,name,total,reserved,available,price,status])=><tr key={sku}><td>{sku}</td><td><strong>{name}</strong></td><td>{total}</td><td>{reserved}</td><td className={available==="0"?"stock-zero":Number(available)<8?"stock-low":"stock-good"}>{available}</td><td className="money">{price}</td><td><StatusBadge tone={status==="Normal"?"success":status==="Baixo"?"warning":"danger"}>{status}</StatusBadge></td></tr>)}
        </tbody></table></div>
      </Card>
    </>
  );
}
