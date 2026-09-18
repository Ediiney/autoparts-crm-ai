import { PageHeader } from "@/components/page-header";
import { Button, Card } from "@/components/ui";
import { Save } from "lucide-react";

export default function ConfiguracoesPage(){
  return (
    <>
      <PageHeader eyebrow="Administração" title="Configurações" description="Empresa, IA, catálogo e regras de atendimento." actions={<Button icon={<Save size={15}/>}>Salvar alterações</Button>}/>
      <div className="settings-grid">
        <Card className="settings-nav"><button className="active">Empresa</button><button>Inteligência artificial</button><button>Catálogo</button><button>Atendimento</button><button>Usuários e acessos</button><button>Integrações</button></Card>
        <Card className="settings-panel">
          <h2>Dados da empresa</h2><p>Informações usadas no CRM, propostas e comunicações com clientes.</p>
          <div className="form-grid">
            <div className="form-field"><label>Nome da empresa</label><input defaultValue="Auto Peças Exemplo"/></div>
            <div className="form-field"><label>CNPJ</label><input placeholder="00.000.000/0001-00"/></div>
            <div className="form-field"><label>WhatsApp</label><input defaultValue="(11) 99999-0000"/></div>
            <div className="form-field"><label>E-mail comercial</label><input defaultValue="vendas@autopecas.com.br"/></div>
            <div className="form-field"><label>Moeda</label><select defaultValue="BRL"><option value="BRL">BRL — Real brasileiro</option></select></div>
            <div className="form-field"><label>Fuso horário</label><select defaultValue="sp"><option value="sp">America/Sao_Paulo</option></select></div>
            <div className="form-field full"><label>Mensagem comercial padrão</label><textarea rows={4} defaultValue="Olá! Localizamos a peça solicitada. Seguem abaixo os dados de aplicação, valor e disponibilidade."/></div>
          </div>

          <div style={{marginTop:28}}><h2>Automação da IA</h2><p>Controle quando a inteligência artificial pode responder automaticamente.</p>
            <div className="setting-row"><div className="setting-copy"><strong>IA habilitada</strong><span>Permite interpretação das mensagens e busca no catálogo.</span></div><button className="toggle on" aria-label="IA habilitada"/></div>
            <div className="setting-row"><div className="setting-copy"><strong>Resposta automática</strong><span>Envia respostas sem aprovação humana quando a confiança for suficiente.</span></div><button className="toggle" aria-label="Resposta automática"/></div>
            <div className="setting-row"><div className="setting-copy"><strong>Confiança mínima</strong><span>Match abaixo desse limite é enviado para revisão humana.</span></div><strong style={{fontSize:12}}>85%</strong></div>
          </div>
        </Card>
      </div>
    </>
  );
}
