import { PageHeader } from "@/components/page-header";
import { Button, Card, StatusBadge } from "@/components/ui";
import { FileText, Filter, Plus, Search } from "lucide-react";

const quotes = [
  ["#1048","João Silva","Honda Civic 2008","R$ 329,90","Hoje, 10:44","Rascunho","warning"],
  ["#1047","Rafael Freitas","Hyundai HB20 2019","R$ 980,50","Hoje, 09:56","Enviado","info"],
  ["#1046","Marcos Oficina","Chevrolet Onix 2020","R$ 1.842,00","Ontem, 16:21","Aceito","success"],
  ["#1045","Auto Mecânica Sul","VW Polo 2019","R$ 712,40","Ontem, 14:08","Enviado","info"],
  ["#1044","Carlos Lima","Toyota Corolla 2015","R$ 459,00","17 set, 18:32","Expirado","danger"],
  ["#1043","Bruno Alves","Honda Fit 2012","R$ 559,80","17 set, 12:15","Aceito","success"],
] as const;

export default function OrcamentosPage(){
  return (
    <>
      <PageHeader eyebrow="Comercial" title="Orçamentos" description="Acompanhe propostas criadas a partir dos atendimentos e conversões." actions={<Button icon={<Plus size={15}/>}>Novo orçamento</Button>}/>
      <div className="toolbar"><div className="toolbar-left"><div className="input-shell"><Search size={15}/><input placeholder="Buscar orçamento ou cliente..."/></div><button className="filter-button"><Filter size={14}/> Status</button></div></div>
      <div className="quote-grid">
        {quotes.map(([num,name,vehicle,total,date,status,tone])=>(
          <Card className="quote-card" key={num}>
            <div className="quote-top"><div><span className="quote-number">{num}</span><h3>{name}</h3></div><StatusBadge tone={tone}>{status}</StatusBadge></div>
            <div className="quote-meta"><div><span>Veículo</span><strong>{vehicle}</strong></div><div><span>Valor</span><strong>{total}</strong></div></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span className="time-label">{date}</span><Button variant="secondary" icon={<FileText size={13}/>}>Abrir</Button></div>
          </Card>
        ))}
      </div>
    </>
  );
}
