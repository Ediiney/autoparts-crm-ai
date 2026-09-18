"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Check, MapPin, Store, Truck } from "lucide-react";
import { BRAZIL_TIMEZONES } from "@/lib/timezones";

export function OnboardingForm({defaultEmail=""}:{defaultEmail?:string}) {
  const router=useRouter();
  const [name,setName]=useState("");
  const [document,setDocument]=useState("");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState(defaultEmail);
  const [timezone,setTimezone]=useState("America/Sao_Paulo");
  const [businessType,setBusinessType]=useState<"retail"|"distributor">("retail");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function submit(event:React.FormEvent) {
    event.preventDefault();
    setError("");

    const cnpj=document.replace(/\D/g,"");
    const whatsapp=phone.replace(/\D/g,"");

    if(!name.trim()) return setError("Informe o nome da empresa.");
    if(cnpj && cnpj.length!==14) return setError("Informe um CNPJ com 14 dígitos ou deixe o campo vazio.");
    if(whatsapp && (whatsapp.length<10||whatsapp.length>13)) return setError("Informe um WhatsApp válido com DDD.");

    setLoading(true);
    try {
      const response=await fetch("/api/onboarding/company",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,document:cnpj,phone:whatsapp,email,businessType,timezone}),
      });
      const result=await response.json();
      if(!response.ok) {
        setError(result.error??"Não foi possível criar a empresa.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="setup-v2-form" onSubmit={submit}>
      <div className="setup-v2-section">
        <div className="setup-v2-section-head"><span><Building2 size={16}/></span><div><strong>Identificação</strong><small>Dados principais do negócio.</small></div></div>
        <div className="setup-v2-grid">
          <label className="wide"><span>Nome da empresa *</span><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Auto Peças Central"/></label>
          <label><span>CNPJ</span><input inputMode="numeric" value={document} onChange={e=>setDocument(e.target.value)} placeholder="00.000.000/0001-00"/></label>
          <label><span>WhatsApp comercial</span><input inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(65) 99999-9999"/></label>
          <label className="wide"><span>E-mail comercial</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vendas@empresa.com.br"/></label>
        </div>
      </div>

      <div className="setup-v2-section">
        <div className="setup-v2-section-head"><span><MapPin size={16}/></span><div><strong>Localização operacional</strong><small>Define horários e relatórios da Matriz.</small></div></div>
        <label className="setup-v2-timezone"><span>Fuso horário da Matriz</span><select value={timezone} onChange={e=>setTimezone(e.target.value)}>{BRAZIL_TIMEZONES.map(item=><option key={item.value} value={item.value}>{item.label} · {item.offset} · {item.region}</option>)}</select></label>
      </div>

      <div className="setup-v2-section">
        <div className="setup-v2-section-head"><span><Store size={16}/></span><div><strong>Modelo de operação</strong><small>Isso ajusta a configuração inicial.</small></div></div>
        <div className="setup-v2-choice-grid">
          <button type="button" className={businessType==="retail"?"selected":""} onClick={()=>setBusinessType("retail")}>
            <i><Store size={17}/></i><div><strong>Loja de autopeças</strong><span>Venda direta para consumidores e oficinas.</span></div>{businessType==="retail"?<b><Check size={12}/></b>:null}
          </button>
          <button type="button" className={businessType==="distributor"?"selected":""} onClick={()=>setBusinessType("distributor")}>
            <i><Truck size={17}/></i><div><strong>Distribuidora</strong><span>Atacado, filiais, equipes e vendedores.</span></div>{businessType==="distributor"?<b><Check size={12}/></b>:null}
          </button>
        </div>
      </div>

      {error?<div className="auth-v2-message error">{error}</div>:null}
      <div className="setup-v2-footer">
        <div><strong>Próximo passo</strong><span>Você entrará direto no painel para importar catálogo e cadastrar clientes.</span></div>
        <button className="button-v2 primary large" disabled={loading}>{loading?"Criando operação...":"Criar empresa"}{!loading?<ArrowRight size={14}/>:null}</button>
      </div>
    </form>
  );
}
