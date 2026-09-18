import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { CarFront, Filter, MoreHorizontal, Plus, Search } from "lucide-react";

const vehicles=[
  ["Honda","Civic LXS","2008","1.8 Flex","Manual","João Silva","12 peças compatíveis"],
  ["Chevrolet","Onix LT","2020","1.0 Turbo","Automático","Marcos Oliveira","28 peças compatíveis"],
  ["Toyota","Corolla XEi","2015","2.0 Flex","CVT","Carlos Lima","17 peças compatíveis"],
  ["Hyundai","HB20 Comfort","2019","1.0","Manual","Rafael Freitas","21 peças compatíveis"],
  ["Volkswagen","Polo MSI","2019","1.6","Automático","Auto Mecânica Sul","33 peças compatíveis"],
];

export default function VeiculosPage(){
  return (
    <>
      <PageHeader eyebrow="Garagem" title="Veículos" description="Base de veículos vinculados aos clientes para acelerar futuras consultas." actions={<Button icon={<Plus size={15}/>}>Adicionar veículo</Button>}/>
      <div className="toolbar"><div className="toolbar-left"><div className="input-shell"><Search size={15}/><input placeholder="Buscar marca, modelo, placa ou cliente..."/></div><button className="filter-button"><Filter size={14}/> Filtros</button></div></div>
      <Card>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Veículo</th><th>Ano</th><th>Motor</th><th>Câmbio</th><th>Cliente</th><th>Catálogo</th><th></th></tr></thead>
            <tbody>
              {vehicles.map(([brand,model,year,engine,trans,client,compat])=>(
                <tr key={model}>
                  <td><div className="table-main"><div className="avatar avatar-slate"><CarFront size={16}/></div><div><strong>{brand} {model}</strong><span>Veículo cadastrado</span></div></div></td>
                  <td>{year}</td><td>{engine}</td><td>{trans}</td><td>{client}</td><td><StatusBadge tone="success">{compat}</StatusBadge></td><td><MoreHorizontal size={16} color="#8995a7"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
