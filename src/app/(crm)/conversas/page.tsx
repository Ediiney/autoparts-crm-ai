import { Avatar, Button, StatusBadge } from "@/components/ui";
import { Bot, CarFront, FileText, MoreHorizontal, Paperclip, Phone, Send, Sparkles, UserRound, Wrench } from "lucide-react";

const conversations=[
  ["JS","João Silva","Quanto está a bandeja do Civic?","10:42","2","green"],
  ["MO","Marcos Oficina","É o Onix 2020, motor 1.0.","10:35","","blue"],
  ["CL","Carlos Lima","Tem homocinética Corolla 2015?","10:18","1","purple"],
  ["RF","Rafael Freitas","Pode mandar o orçamento.","09:54","","amber"],
  ["AM","Auto Mecânica Sul","Preciso de 4 bieletas do Polo.","09:37","","slate"],
];

export default function ConversasPage(){
  return (
    <>
      <div className="page-header">
        <div><div className="eyebrow">Central de atendimento</div><h1>Conversas</h1><p>Inbox unificada com IA, clientes e atendentes humanos.</p></div>
        <div className="page-actions"><Button variant="secondary" icon={<UserRound size={15}/>}>Fila humana</Button><Button icon={<Send size={15}/>}>Novo atendimento</Button></div>
      </div>

      <div className="inbox-layout">
        <aside className="inbox-sidebar">
          <div className="inbox-sidebar-header">
            <h2>Caixa de entrada</h2>
            <div className="inbox-tabs"><button className="inbox-tab active">Todas 24</button><button className="inbox-tab">IA 9</button><button className="inbox-tab">Humanas 4</button></div>
          </div>
          <div className="conversation-list">
            {conversations.map(([initials,name,message,time,unread,tone],idx)=>(
              <div className={idx===0?"conversation-card active":"conversation-card"} key={name}>
                <Avatar initials={initials} tone={tone}/>
                <div className="conversation-copy">
                  <div className="conversation-name"><strong>{name}</strong>{idx===0?<StatusBadge tone="warning">Aguardando</StatusBadge>:null}</div>
                  <div className="conversation-message">{message}</div>
                </div>
                <div className="conversation-meta"><time>{time}</time>{unread?<span className="unread">{unread}</span>:null}</div>
              </div>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          <header className="chat-header">
            <div className="chat-contact"><Avatar initials="JS" tone="green"/><div><strong>João Silva</strong><span>WhatsApp · online há 2 min</span></div></div>
            <div className="chat-actions"><button className="icon-button"><Phone size={16}/></button><button className="icon-button"><MoreHorizontal size={17}/></button></div>
          </header>

          <div className="chat-body">
            <div className="chat-day">Hoje, 10:37</div>
            <div className="message-row customer"><div className="message-bubble">Bom dia! Quanto está a bandeja do Civic?<small>10:37</small></div></div>
            <div className="ai-note"><Sparkles size={16}/><div><strong>IA identificou uma intenção de compra</strong><p>Peça provável: bandeja de suspensão · Veículo: Honda Civic · Dados faltantes: ano e lado.</p></div></div>
            <div className="message-row ai"><div className="message-bubble">Bom dia! Para eu localizar a bandeja correta, qual é o ano do seu Civic? Se souber, me diga também se é lado esquerdo ou direito.<small>10:37 · IA</small></div></div>
            <div className="message-row customer"><div className="message-bubble">É 2008.<small>10:40</small></div></div>
            <div className="message-row ai"><div className="message-bubble">Perfeito. Encontrei duas aplicações para o Civic 2008. Você precisa da bandeja esquerda ou direita?<small>10:40 · IA</small></div></div>
            <div className="message-row customer"><div className="message-bubble">Esquerda.<small>10:42</small></div></div>
            <div className="ai-note"><Bot size={16}/><div><strong>Match encontrado com 94% de confiança</strong><p>Bandeja de suspensão · GIA-4721 · Civic 2007–2011 · dianteira esquerda · R$ 329,90 · 18 em estoque.</p></div></div>
            <div className="message-row ai"><div className="message-bubble">Encontrei: Bandeja de suspensão dianteira esquerda, código GIA-4721, compatível com Honda Civic 2007 a 2011. Valor: <strong>R$ 329,90</strong>. Temos disponibilidade em estoque.<small>10:42 · IA</small></div></div>
          </div>

          <div className="chat-composer">
            <div className="composer-box">
              <textarea placeholder="Digite uma mensagem..."/>
              <div className="composer-actions"><div className="composer-left"><button className="icon-button"><Paperclip size={15}/></button><Button variant="ghost" icon={<FileText size={14}/>}>Orçamento</Button></div><Button icon={<Send size={14}/>}>Enviar</Button></div>
            </div>
          </div>
        </section>

        <aside className="contact-panel">
          <div className="contact-profile"><Avatar initials="JS" tone="green"/><h3>João Silva</h3><p>Cliente desde set/2026</p><StatusBadge tone="success">Cliente ativo</StatusBadge></div>
          <div className="info-section">
            <div className="info-section-title"><strong>Contato</strong></div>
            <div className="info-row"><span>WhatsApp</span><strong>(11) 99999-1248</strong></div>
            <div className="info-row"><span>E-mail</span><strong>joao@email.com</strong></div>
          </div>
          <div className="info-section">
            <div className="info-section-title"><strong>Veículo</strong><CarFront size={14}/></div>
            <div className="vehicle-card"><strong>Honda Civic LXS</strong><span>2008 · 1.8 Flex · Manual</span><div style={{marginTop:7}}><StatusBadge tone="neutral">Sem placa cadastrada</StatusBadge></div></div>
          </div>
          <div className="info-section">
            <div className="info-section-title"><strong>Análise da IA</strong><Sparkles size={14}/></div>
            <div className="ai-analysis"><div className="analysis-title"><Bot size={14}/> Compatibilidade provável</div><div className="info-row"><span>Peça</span><strong>Bandeja</strong></div><div className="info-row"><span>Lado</span><strong>Esquerdo</strong></div><div className="info-row"><span>Confiança</span><strong>94%</strong></div><div className="confidence"><div/></div></div>
          </div>
          <div className="info-section"><Button variant="secondary" icon={<Wrench size={14}/>}>Assumir atendimento</Button></div>
        </aside>
      </div>
    </>
  );
}
