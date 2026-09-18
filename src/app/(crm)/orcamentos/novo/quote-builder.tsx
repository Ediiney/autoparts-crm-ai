"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Plus, Save, Trash2 } from "lucide-react";

type Customer={id:string;name:string};
type Product={id:string;sku:string;name:string;price:number|null};
type Line={key:string;productId:string;quantity:number;unitPrice:number;discount:number};

export function QuoteBuilder({companyId,customers,products}:{companyId:string;customers:Customer[];products:Product[]}){
  const router=useRouter();
  const [customerId,setCustomerId]=useState("");
  const [notes,setNotes]=useState("");
  const [expiresAt,setExpiresAt]=useState("");
  const [lines,setLines]=useState<Line[]>([]);
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState<{type:"success"|"error";text:string}|null>(null);

  const productMap=useMemo(()=>new Map(products.map(p=>[p.id,p])),[products]);
  const subtotal=lines.reduce((sum,line)=>sum+line.quantity*line.unitPrice,0);
  const discount=lines.reduce((sum,line)=>sum+line.discount,0);
  const total=Math.max(0,subtotal-discount);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

  function addLine(){
    const first=products.find(p=>p.price!==null)??products[0];
    if(!first)return;
    setLines(current=>[...current,{key:crypto.randomUUID(),productId:first.id,quantity:1,unitPrice:first.price??0,discount:0}]);
  }
  function updateLine(key:string,patch:Partial<Line>){setLines(current=>current.map(line=>line.key===key?{...line,...patch}:line));}
  function chooseProduct(key:string,id:string){const p=productMap.get(id);updateLine(key,{productId:id,unitPrice:p?.price??0});}

  async function save(){
    if(!lines.length){setNotice({type:"error",text:"Adicione pelo menos um item."});return;}
    setSaving(true);setNotice(null);
    try{
      const response=await fetch("/api/quotes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        companyId,customerId:customerId||undefined,notes,expiresAt:expiresAt?new Date(`${expiresAt}T23:59:59`).toISOString():null,
        items:lines.map(line=>({productId:line.productId,quantity:line.quantity,unitPrice:line.unitPrice,discount:line.discount}))
      })});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"Não foi possível criar o orçamento.");
      setNotice({type:"success",text:"Orçamento criado."});
      window.setTimeout(()=>router.push(`/orcamentos/${payload.quote.id}`),300);
    }catch(error){setNotice({type:"error",text:error instanceof Error?error.message:"Erro ao salvar."});}
    finally{setSaving(false);}
  }

  return <div className="quote-builder-v2">
    <section className="panel-v2">
      <div className="panel-v2-title"><div><h2>Cliente e validade</h2><p>Dados comerciais da proposta.</p></div></div>
      <div className="form-v2-grid">
        <label className="field-v2"><span>Cliente</span><select value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Cliente avulso</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="field-v2"><span>Validade</span><input type="date" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)}/></label>
        <label className="field-v2 wide"><span>Observações</span><textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
      </div>
    </section>

    <section className="panel-v2">
      <div className="panel-v2-title quote-builder-title-v2"><div><h2>Itens</h2><p>Preço inicial carregado da filial; pode ser ajustado na proposta.</p></div><button className="button-v2 secondary" type="button" onClick={addLine}><Plus size={14}/> Adicionar item</button></div>
      {lines.length?<div className="quote-lines-v2">{lines.map(line=>{
        const product=productMap.get(line.productId);
        const lineTotal=Math.max(0,line.quantity*line.unitPrice-line.discount);
        return <div className="quote-line-v2" key={line.key}>
          <label><span>Produto</span><select value={line.productId} onChange={e=>chooseProduct(line.key,e.target.value)}>{products.map(p=><option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}</select></label>
          <label><span>Qtd.</span><input type="number" min="0.001" step="0.001" value={line.quantity} onChange={e=>updateLine(line.key,{quantity:Number(e.target.value)})}/></label>
          <label><span>Unitário</span><input type="number" min="0" step="0.01" value={line.unitPrice} onChange={e=>updateLine(line.key,{unitPrice:Number(e.target.value)})}/></label>
          <label><span>Desconto</span><input type="number" min="0" step="0.01" value={line.discount} onChange={e=>updateLine(line.key,{discount:Number(e.target.value)})}/></label>
          <div className="quote-line-total-v2"><span>Total</span><strong>{money.format(lineTotal)}</strong><small>{product?.name}</small></div>
          <button className="row-delete-v2" type="button" onClick={()=>setLines(current=>current.filter(item=>item.key!==line.key))}><Trash2 size={14}/></button>
        </div>;
      })}</div>:<div className="empty-line-v2">Adicione produtos para montar a proposta.</div>}
    </section>

    <section className="quote-total-v2">
      <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
      <div><span>Desconto</span><strong>- {money.format(discount)}</strong></div>
      <div className="grand"><span>Total</span><strong>{money.format(total)}</strong></div>
    </section>

    {notice?<div className={`notice-v2 ${notice.type}`}>{notice.type==="success"?<Check size={14}/>:null}{notice.text}</div>:null}
    <div className="product-form-v2-footer"><button className="button-v2 primary" type="button" onClick={()=>void save()} disabled={saving}><Save size={14}/>{saving?"Criando...":"Criar orçamento"}</button></div>
  </div>;
}
