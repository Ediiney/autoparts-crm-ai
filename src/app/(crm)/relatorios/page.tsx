import { PageHeader } from "@/components/page-header";
import { Card, StatusBadge } from "@/components/ui";
import { Bot, CircleDollarSign, MessageCircleMore, PackageSearch } from "lucide-react";

export default function RelatoriosPage(){
  return (
    <>
      <PageHeader eyebrow="Inteligência operacional" title="Relatórios" description="Indicadores de atendimento, IA, catálogo e vendas."/>
      <div className="stats-grid">
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon"><Bot size={18}/></div><StatusBadge tone="success">+4,1%</StatusBadge></div><div className="stat-value">92,6%</div><div className="stat-label">Confiança média da IA</div><div className="sparkline">{[48,55,50,65,68,73,77,80,87,91].map((h,i)=><span key={i} className={i>6?"active":""} style={{height:`${h}%`}}/>)}</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon blue"><MessageCircleMore size={18}/></div></div><div className="stat-value">348</div><div className="stat-label">Conversas no mês</div><div className="stat-foot"><span className="trend-up">+21%</span> vs. mês anterior</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon amber"><PackageSearch size={18}/></div></div><div className="stat-value">1.126</div><div className="stat-label">Consultas de peças</div><div className="stat-foot">874 com match direto</div></Card>
        <Card className="stat-card"><div className="stat-top"><div className="stat-icon purple"><CircleDollarSign size={18}/></div></div><div className="stat-value">31,8%</div><div className="stat-label">Conversão em venda</div><div className="stat-foot"><span className="trend-up">+6,3%</span> no período</div></Card>
      </div>
      <div className="dashboard-grid">
        <Card><div className="card-header"><div><h2 className="card-title">Motivos de perguntas complementares</h2><p className="card-subtitle">Dados que mais faltam nas consultas.</p></div></div><div className="pipeline"><div className="pipeline-row"><span className="pipeline-label">Ano do veículo</span><div className="pipeline-track"><div className="pipeline-fill" style={{width:"92%"}}/></div><strong className="pipeline-count">38%</strong></div><div className="pipeline-row"><span className="pipeline-label">Lado da peça</span><div className="pipeline-track"><div className="pipeline-fill blue" style={{width:"71%"}}/></div><strong className="pipeline-count">29%</strong></div><div className="pipeline-row"><span className="pipeline-label">Motorização</span><div className="pipeline-track"><div className="pipeline-fill amber" style={{width:"46%"}}/></div><strong className="pipeline-count">19%</strong></div><div className="pipeline-row"><span className="pipeline-label">Versão</span><div className="pipeline-track"><div className="pipeline-fill purple" style={{width:"34%"}}/></div><strong className="pipeline-count">14%</strong></div></div></Card>
        <Card><div className="card-header"><div><h2 className="card-title">Consultas sem resultado</h2><p className="card-subtitle">Oportunidades para enriquecer o catálogo.</p></div></div><div className="simple-list">{["Tensor correia Cruze 2018","Coxim câmbio Sentra 2014","Kit batente Renegade 2020","Terminal axial City 2016"].map((x,i)=><div className="simple-row" key={x}><div className="avatar avatar-slate">{i+1}</div><div className="activity-copy"><strong>{x}</strong><span>{7-i} buscas sem match</span></div></div>)}</div></Card>
      </div>
    </>
  );
}
