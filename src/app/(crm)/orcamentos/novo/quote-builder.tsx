"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, Check, CircleDollarSign, PackageSearch, Plus, Save, Trash2 } from "lucide-react";

type Customer={id:string;name:string;whatsapp:string|null;phone:string|null;email:string|null};
type Product={
  id:string;sku:string;name:string;original_code:string|null;source:string|null;
  price:number|null;cost:number|null;price_source:string|null;available:number|null;
  application_label:string|null;
};
type Line={key:string;productId:string;quantity:number;unitPrice:number|null;discount:number};

export function QuoteBuilder({companyId,customers,products}:{companyId:string;customers:Customer[];products:Product[]}){
  const router=useRouter();
  const [customerId,setCustomerId]=useState("");
  const [notes,setNotes]=useState("");
  const [expiresAt,setExpiresAt]=useState("");
  const [lines,setLines]=useState<Line[]>([]);
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState<{type:"success"|"error";text:string}|null>(null);

  const productMap=useMemo(()=>new Map(products.map(p=>[p.id,p])),[products]);
  const subtotal=lines.reduce((sum,line)=>sum+line.quantity*(line.unitPrice??0),0);
  const discount=lines.reduce((sum,line)=>sum+line.discount,0);
  const total=Math.max(0,subtotal-discount);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const missingPrice=lines.some(line=>line.unitPrice===null||line.unitPrice<=0);

  function addLine(){
    const first=products[0];
    if(!first)return;
    setLines(current=>[...current,{
      key:crypto.randomUUID(),
      productId:first.id,
      quantity:1,
      unitPrice:first.price===null?null:Number(first.price),
      discount:0,
    }]);
  }

  function updateLine(key:string,patch:Partial<Line>){
    setLines(current=>current.map(line=>line.key===key?{...line,...patch}:line));
  }

  function chooseProduct(key:string,id:string){
    const p=productMap.get(id);
    updateLine(key,{productId:id,unitPrice:p?.price===null||p?.price===undefined?null:Number(p.price),discount:0});
  }

  async function save(){
    if(!lines.length){setNotice({type:"error",text:"Adicione pelo menos um item."});return;}
    if(missingPrice){setNotice({type:"error",text:"Informe o preço de todos os itens antes de criar o orçamento."});return;}
    setSaving(true);setNotice(null);

    try{
      const response=await fetch("/api/quotes",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          companyId,
          customerId:customerId||undefined,
          notes,
          expiresAt:expiresAt?new Date(`${expiresAt}T23:59:59`).toISOString():null,
          items:lines.map(line=>({
            productId:line.productId,
            quantity:line.quantity,
            unitPrice:line.unitPrice,
            discount:line.discount,
          }))
        })
      });

      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||"Não foi possível criar o orçamento.");
      setNotice({type:"success",text:"Orçamento criado com sucesso."});
      window.setTimeout(()=>router.push(`/orcamentos/${payload.quote.id}`),250);
    }catch(error){
      setNotice({type:"error",text:error instanceof Error?error.message:"Erro ao salvar."});
    }finally{
      setSaving(false);
    }
  }

  return <div className="commercial-builder-v3">
    <section className="panel-v2 commercial-card-v3">
      <div className="panel-v2-title">
        <div><h2>Dados da proposta</h2><p>Cliente, validade e observações comerciais.</p></div>
      </div>
      <div className="form-v2-grid">
        <label className="field-v2">
          <span>Cliente</span>
          <select value={customerId} onChange={e=>setCustomerId(e.target.value)}>
            <option value="">Cliente avulso</option>
            {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="field-v2">
          <span>Validade</span>
          <input type="date" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)}/>
        </label>
        <label className="field-v2 wide">
          <span>Observações</span>
          <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Condições, prazo, observações para o cliente..."/>
        </label>
      </div>
    </section>

    <section className="panel-v2 commercial-card-v3">
      <div className="panel-v2-title quote-builder-title-v2">
        <div>
          <h2>Itens do orçamento</h2>
          <p>O preço vigente entra automaticamente quando existe. O valor desta proposta continua editável.</p>
        </div>
        <button className="button-v2 secondary" type="button" onClick={addLine}>
          <Plus size={14}/> Adicionar item
        </button>
      </div>

      {lines.length?<div className="commercial-lines-v3">{lines.map(line=>{
        const product=productMap.get(line.productId);
        const lineTotal=Math.max(0,line.quantity*(line.unitPrice??0)-line.discount);
        const noPrice=line.unitPrice===null||line.unitPrice<=0;

        return <article className={noPrice?"commercial-line-v3 price-missing":"commercial-line-v3"} key={line.key}>
          <div className="commercial-product-v3">
            <label>
              <span>Produto</span>
              <select value={line.productId} onChange={e=>chooseProduct(line.key,e.target.value)}>
                {products.map(p=><option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
              </select>
            </label>
            <div className="commercial-product-meta-v3">
              <span><PackageSearch size={12}/>{product?.application_label||product?.original_code||"Aplicação não informada"}</span>
              <span>Estoque: <strong>{Number(product?.available??0)} un.</strong></span>
              <span>Origem: <strong>{product?.source||"manual"}</strong></span>
            </div>
          </div>

          <label><span>Qtd.</span><input type="number" min="0.001" step="0.001" value={line.quantity} onChange={e=>updateLine(line.key,{quantity:Number(e.target.value)})}/></label>
          <label className={noPrice?"price-input-v3 missing":"price-input-v3"}>
            <span>Preço unitário</span>
            <div className="money-input-v3"><span>R$</span><input type="number" min="0" step="0.01" value={line.unitPrice??""} placeholder="Definir" onChange={e=>updateLine(line.key,{unitPrice:e.target.value===""?null:Number(e.target.value)})}/></div>
            {noPrice?<small><AlertTriangle size={10}/> preço pendente</small>:<small><Check size={10}/> {product?.price_source||"preço da proposta"}</small>}
          </label>
          <label><span>Desconto</span><div className="money-input-v3"><span>R$</span><input type="number" min="0" step="0.01" value={line.discount} onChange={e=>updateLine(line.key,{discount:Number(e.target.value)})}/></div></label>

          <div className="commercial-line-total-v3"><span>Total</span><strong>{money.format(lineTotal)}</strong></div>
          <button className="row-delete-v2" type="button" aria-label="Remover item" onClick={()=>setLines(current=>current.filter(item=>item.key!==line.key))}><Trash2 size={14}/></button>
        </article>;
      })}</div>:<div className="commercial-empty-v3">
        <CircleDollarSign size={24}/>
        <strong>Adicione o primeiro item</strong>
        <span>Produtos com preço cadastrado entram automaticamente; os demais pedem um valor antes de salvar.</span>
      </div>}
    </section>

    <section className="commercial-total-v3">
      <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
      <div><span>Desconto</span><strong>- {money.format(discount)}</strong></div>
      <div className="grand"><span>Total da proposta</span><strong>{money.format(total)}</strong></div>
    </section>

    {notice?<div className={`notice-v2 ${notice.type}`}>{notice.type==="success"?<Check size={14}/>:null}{notice.text}</div>:null}
    <div className="product-form-v2-footer">
      <button className="button-v2 primary commercial-save-v3" type="button" onClick={()=>void save()} disabled={saving||!lines.length}>
        <Save size={14}/>{saving?"Criando...":"Criar orçamento"}
      </button>
    </div>
  </div>;
}
