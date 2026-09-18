import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { Filter, PackageSearch, Plus, Search, Upload } from "lucide-react";

const products=[
  ["Bandeja de suspensão","Honda Civic 2007–2011 · dianteira esquerda","GIA-4721","R$ 329,90","18","Giancar"],
  ["Pivô de suspensão","Chevrolet Onix 2020+ · dianteiro","GIA-1828","R$ 189,90","7","Giancar"],
  ["Junta homocinética","Toyota Corolla 2015–2019","GIA-8330","R$ 459,00","4","Giancar"],
  ["Bieleta dianteira","Volkswagen Polo 2018+","GIA-2901","R$ 84,50","31","Giancar"],
  ["Coxim do motor","Honda Fit 2009–2014","GIA-5582","R$ 279,90","6","Giancar"],
  ["Terminal de direção","Hyundai HB20 2013–2019","GIA-9027","R$ 119,00","0","Giancar"],
];

export default function CatalogoPage(){
  return (
    <>
      <PageHeader eyebrow="Base de conhecimento" title="Catálogo de peças" description="Produtos, códigos, aplicações veiculares, preços e aliases usados pela IA." actions={<><Button variant="secondary" icon={<Upload size={15}/>}>Importar catálogo</Button><Button icon={<Plus size={15}/>}>Nova peça</Button></>}/>
      <div className="toolbar">
        <div className="toolbar-left"><div className="input-shell"><Search size={15}/><input placeholder="Buscar peça, SKU, código original ou aplicação..."/></div><button className="filter-button"><Filter size={14}/> Aplicação</button></div>
        <div className="toolbar-right"><StatusBadge tone="success">6.842 produtos ativos</StatusBadge></div>
      </div>
      <div className="catalog-grid">
        {products.map(([name,app,sku,price,stock,source])=>(
          <Card className="product-card" key={sku}>
            <div className="product-thumb"><PackageSearch/></div>
            <div className="product-meta"><StatusBadge tone="info">{source}</StatusBadge><span className="quote-number">{sku}</span></div>
            <div><h3>{name}</h3><p>{app}</p></div>
            <div className="product-bottom"><div><div className="product-price">{price}</div><div className={stock==="0"?"product-stock stock-zero":"product-stock stock-good"}>{stock==="0"?"Sem estoque":`${stock} unidades disponíveis`}</div></div><Button variant="secondary">Detalhes</Button></div>
          </Card>
        ))}
      </div>
    </>
  );
}
