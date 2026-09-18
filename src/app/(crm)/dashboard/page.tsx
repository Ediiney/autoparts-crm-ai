import { PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, StatusBadge } from "@/components/ui";
import {
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  FileText,
  MessageCircleMore,
  PackageSearch,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

const activities = [
  ["JS","João Silva","Cotação de bandeja Civic 2008","Aguardando lado","amber","2 min"],
  ["MO","Marcos Oficina","Pivô Onix 2020 localizado","R$ 189,90","green","8 min"],
  ["CL","Carlos Lima","Homocinética Corolla 2015","Atendimento humano","purple","17 min"],
  ["RF","Rafael Freitas","Amortecedor dianteiro HB20","Orçamento enviado","blue","24 min"],
];

const products = [
  ["Bandeja de suspensão","Honda Civic 2007–2011","GIA-4721","R$ 329,90","18 un."],
  ["Pivô de suspensão","Chevrolet Onix 2020+","GIA-1828","R$ 189,90","7 un."],
  ["Junta homocinética","Toyota Corolla 2015–2019","GIA-8330","R$ 459,00","4 un."],
  ["Bieleta dianteira","VW Polo 2018+","GIA-2901","R$ 84,50","31 un."],
];

export default function DashboardPage(){
  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Bom dia, Ediney"
        description="Acompanhe atendimento, consultas de peças e oportunidades de venda em tempo real."
        actions={<><Button variant="secondary" icon={<FileText size={15}/>}>Novo orçamento</Button><Button icon={<Plus size={15}/>}>Novo atendimento</Button></>}
      />

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon"><MessageCircleMore size={18}/></div><StatusBadge tone="success">+12%</StatusBadge></div>
          <div className="stat-value">24</div><div className="stat-label">Atendimentos hoje</div>
          <div className="stat-foot"><span className="trend-up">+3</span> em relação a ontem</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon blue"><PackageSearch size={18}/></div><StatusBadge tone="info">58 buscas</StatusBadge></div>
          <div className="stat-value">91,4%</div><div className="stat-label">Peças identificadas</div>
          <div className="stat-foot">53 consultas com match confiável</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon amber"><FileText size={18}/></div><StatusBadge tone="warning">12 abertos</StatusBadge></div>
          <div className="stat-value">R$ 8,4k</div><div className="stat-label">Em orçamentos</div>
          <div className="stat-foot"><span className="trend-up">+18%</span> nesta semana</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-top"><div className="stat-icon purple"><CircleDollarSign size={18}/></div><StatusBadge tone="purple">32%</StatusBadge></div>
          <div className="stat-value">R$ 2,7k</div><div className="stat-label">Vendas convertidas</div>
          <div className="stat-foot">8 orçamentos aceitos</div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <Card>
            <div className="card-header"><div><h2 className="card-title">Atendimentos recentes</h2><p className="card-subtitle">Conversas que merecem sua atenção agora.</p></div><a className="card-link" href="/conversas">Ver inbox</a></div>
            <div className="activity-list">
              {activities.map(([i,name,desc,status,tone,time])=>(
                <div className="activity-row" key={name}>
                  <Avatar initials={i} tone={tone}/>
                  <div className="activity-copy"><strong>{name}</strong><span>{desc}</span></div>
                  <StatusBadge tone={tone==="green"?"success":tone==="amber"?"warning":tone==="purple"?"purple":"info"}>{status}</StatusBadge>
                  <span className="time-label">{time}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="card-header"><div><h2 className="card-title">Peças mais consultadas</h2><p className="card-subtitle">Produtos com maior intenção de compra nos últimos 7 dias.</p></div><a className="card-link" href="/catalogo">Abrir catálogo</a></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Peça</th><th>Código</th><th>Preço</th><th>Estoque</th><th></th></tr></thead>
                <tbody>
                  {products.map(([name,app,sku,price,stock])=>(
                    <tr key={sku}>
                      <td><div className="table-main"><div className="avatar avatar-slate"><PackageSearch size={15}/></div><div><strong>{name}</strong><span>{app}</span></div></div></td>
                      <td>{sku}</td><td className="money">{price}</td><td className="stock-good">{stock}</td>
                      <td><ArrowUpRight size={15} color="#8390a3"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="dashboard-stack">
          <Card>
            <div className="card-header"><div><h2 className="card-title">Funil de atendimento</h2><p className="card-subtitle">Status das conversas de hoje.</p></div><span className="metric-chip"><Users size={13}/> 24 total</span></div>
            <div className="pipeline">
              <div className="pipeline-row"><span className="pipeline-label">IA atendendo</span><div className="pipeline-track"><div className="pipeline-fill" style={{width:"86%"}}/></div><strong className="pipeline-count">9</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Aguardando cliente</span><div className="pipeline-track"><div className="pipeline-fill amber" style={{width:"67%"}}/></div><strong className="pipeline-count">7</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Atendimento humano</span><div className="pipeline-track"><div className="pipeline-fill purple" style={{width:"38%"}}/></div><strong className="pipeline-count">4</strong></div>
              <div className="pipeline-row"><span className="pipeline-label">Orçamento enviado</span><div className="pipeline-track"><div className="pipeline-fill blue" style={{width:"44%"}}/></div><strong className="pipeline-count">4</strong></div>
            </div>
          </Card>

          <Card className="card-pad">
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div className="stat-icon"><Sparkles size={18}/></div>
              <div><h2 className="card-title">Inteligência do catálogo</h2><p className="card-subtitle">A IA pediu complemento em 7 consultas hoje, evitando sugerir peças incompatíveis.</p></div>
            </div>
            <div className="sparkline">{[34,48,42,61,55,70,88,78,94,86,100,92].map((h,i)=><span key={i} className={i>8?"active":""} style={{height:`${h}%`}}/>)}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}><span className="stat-foot"><Bot size={12}/> Confiança média</span><strong style={{fontSize:14}}>92,6%</strong></div>
          </Card>
        </div>
      </div>
    </>
  );
}
