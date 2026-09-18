import { PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, StatusBadge } from "@/components/ui";
import { Filter, MoreHorizontal, Plus, Search, Users } from "lucide-react";

const clients=[
  ["JS","João Silva","(11) 99999-1248","Honda Civic 2008","4 consultas","R$ 629,80","green","Ativo"],
  ["MO","Marcos Oliveira","(11) 98821-8451","Chevrolet Onix 2020","8 consultas","R$ 1.842,00","blue","Oficina"],
  ["CL","Carlos Lima","(11) 97734-2110","Toyota Corolla 2015","2 consultas","R$ 459,00","purple","Ativo"],
  ["RF","Rafael Freitas","(11) 96632-1877","Hyundai HB20 2019","5 consultas","R$ 980,50","amber","Ativo"],
  ["AM","Auto Mecânica Sul","(11) 3555-1029","6 veículos","19 consultas","R$ 5.312,90","slate","Oficina"],
];

export default function ClientesPage(){
  return (
    <>
      <PageHeader eyebrow="Relacionamento" title="Clientes" description="Carteira de clientes, histórico de veículos e oportunidades de recompra." actions={<Button icon={<Plus size={15}/>}>Novo cliente</Button>}/>
      <div className="toolbar">
        <div className="toolbar-left"><div className="input-shell"><Search size={15}/><input placeholder="Buscar por nome, telefone ou veículo..."/></div><button className="filter-button"><Filter size={14}/> Filtros</button></div>
        <div className="toolbar-right"><span className="metric-chip"><Users size={13}/> 248 clientes</span></div>
      </div>
      <Card>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Cliente</th><th>Contato</th><th>Veículo principal</th><th>Histórico</th><th>Total cotado</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {clients.map(([i,name,phone,vehicle,history,total,tone,status])=>(
                <tr key={name}>
                  <td><div className="table-main"><Avatar initials={i} tone={tone}/><div><strong>{name}</strong><span>Último contato hoje</span></div></div></td>
                  <td>{phone}</td><td>{vehicle}</td><td>{history}</td><td className="money">{total}</td>
                  <td><StatusBadge tone={status==="Oficina"?"info":"success"}>{status}</StatusBadge></td><td><MoreHorizontal size={16} color="#8995a7"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
