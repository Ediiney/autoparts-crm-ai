"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, PackageSearch, Plus, Save, ShoppingCart, Trash2 } from "lucide-react";

type Customer={id:string;name:string;whatsapp:string|null;phone:string|null;email:string|null};
type Product={
  id:string;sku:string;name:string;original_code:string|null;source:string|null;
  price:number|null;cost:number|null;price_source:string|null;available:number|null;
  application_label:string|null;
};
type Line={key:string;productId:string;quantity:number;unitPrice:number|null;discount:number};

export function OrderBuilder({customers,products}:{customers:Customer[];products:Product[]}){
  const router=useRouter();
  const [customerId,setCustomerId]=useState("");
  const [deliveryType,setDeliveryType]=useState("pickup");
  const [paymentMethod,setPaymentMethod]=useState("");
  const [deliveryAddress,setDeliveryAddress]=useState("");
  const [shipping,setShipping]=useState(0);
  const [notes,setNotes]=useState("");
  const [lines,setLines]=useState<Line[]>([]);
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState<{type:"success"|"error";text:string}|null>(null);

  const productMap=useMemo(()=>new Map(products.map(p=>[p.id,p])),[products]);
  const subtotal=lines.reduce((s,l)=>s+l.quantity*(l.unitPrice??0),0);
  const discount=lines.reduce((s,l)=>s+l.discount,0);
  const total=Math.max(0,subtotal-discount+shipping);
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
  const missingPrice=lines.some(l=>l.unitPrice===null||l.unitPrice<=0);

  function addLine(){
    const p=products[0];if(!p)return;
    setLines(v=>[...v,{key:crypto.randomUUID(),productId:p.id,quantity:1,unitPrice:p.price===null?null:Number(p.price),discount:0}]);
  }
  function patch(key:string,next:Partial<Line>){setLines(v=>v.map(l=>l.key===key?{...l,...next}:l));}
  function choose(key:string,id:string){const p=productMap.get(id);patch(key,{productId:id,unitPrice:p?.price===null||p?.price===undefined?null:Number(p.price),discount:0});}

  async function save(){
    if(!lines.length){setNotice({type:"error",text:"Adicione pelo menos um item."});return;}
    if(missingPrice){setNotice({type:"error",text:"Informe o preço de todos os itens."});return;}
    setSaving(true);setNotice(null);
    try{
      const response=await fetch("/api/orders",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          customerId:customerId||undefined,deliveryType,paymentMethod:paymentMethod||undefined,
          deliveryAddress:deliveryType==="pickup"?undefined:deliveryAddress,shipping,notes,
          items:lines.map(l=>({productId:l.productId,quantity:l.quantity,unitPrice:l.unitPrice,discount:l.discount}))
        })
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Não foi possível criar o pedido.");
      setNotice({type:"success",text:"Pedido criado."});
      window.setTimeout(()=>router.push(`/pedidos/${data.order.id}`),250);
    }catch(error){
      setNotice({type:"error",text:error instanceof Error?error.message:"Falha ao criar pedido."});
    }finally{setSaving(false);}
  }

  return <div className="commercial-builder-v3">
    <section className="panel-v2 commercial-card-v3">
      <div className="panel-v2-title"><div><h2>Dados do pedido</h2><p>Cliente, retirada/entrega e forma de pagamento.</p></div></div>
      <div className="form-v2-grid">
        <label className="field-v2"><span>Cliente</span><select value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Cliente avulso</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="field-v2"><span>Forma de entrega</span><select value={deliveryType} onChange={e=>setDeliveryType(e.target.value)}><option value="pickup">Retirada</option><option value="delivery">Entrega local</option><option value="carrier">Transportadora</option></select></label>
        <label className="field-v2"><span>Pagamento</span><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option value="">Não informado</option><option value="pix">PIX</option><option value="cash">Dinheiro</option><option value="credit_card">Cartão de crédito</option><option value="debit_card">Cartão de débito</option><option value="bank_slip">Boleto</option><option value="transfer">Transferência</option></select></label>
        <label className="field-v2"><span>Frete</span><div className="money-input-v3"><span>R$</span><input type="number" min="0" step="0.01" value={shipping} onChange={e=>setShipping(Number(e.target.value))}/></div></label>
        {deliveryType!=="pickup"?<label className="field-v2 wide"><span>Endereço / instrução de entrega</span><input value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} placeholder="Rua, número, bairro, referência..."/></label>:null}
        <label className="field-v2 wide"><span>Observações</span><textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observações internas ou do pedido..."/></label>
      </div>
    </section>

    <section className="panel-v2 commercial-card-v3">
      <div className="panel-v2-title quote-builder-title-v2">
        <div><h2>Produtos</h2><p>Preço da filial é sugerido; o vendedor pode alterar antes de confirmar.</p></div>
        <button className="button-v2 secondary" type="button" onClick={addLine}><Plus size={14}/> Adicionar produto</button>
      </div>
      {lines.length?<div className="commercial-lines-v3">{lines.map(line=>{
        const p=productMap.get(line.productId);const noPrice=line.unitPrice===null||line.unitPrice<=0;
        return <article className={noPrice?"commercial-line-v3 price-missing":"commercial-line-v3"} key={line.key}>
          <div className="commercial-product-v3">
            <label><span>Produto</span><select value={line.productId} onChange={e=>choose(line.key,e.target.value)}>{products.map(x=><option key={x.id} value={x.id}>{x.sku} · {x.name}</option>)}</select></label>
            <div className="commercial-product-meta-v3"><span><PackageSearch size={12}/>{p?.application_label||p?.original_code||"Sem aplicação"}</span><span>Disponível: <strong>{Number(p?.available??0)} un.</strong></span></div>
          </div>
          <label><span>Qtd.</span><input type="number" min=".001" step=".001" value={line.quantity} onChange={e=>patch(line.key,{quantity:Number(e.target.value)})}/></label>
          <label className={noPrice?"price-input-v3 missing":"price-input-v3"}><span>Preço unitário</span><div className="money-input-v3"><span>R$</span><input type="number" min="0" step=".01" value={line.unitPrice??""} placeholder="Definir" onChange={e=>patch(line.key,{unitPrice:e.target.value===""?null:Number(e.target.value)})}/></div>{noPrice?<small><AlertTriangle size={10}/> preço pendente</small>:<small><Check size={10}/> preço definido</small>}</label>
          <label><span>Desconto</span><div className="money-input-v3"><span>R$</span><input type="number" min="0" step=".01" value={line.discount} onChange={e=>patch(line.key,{discount:Number(e.target.value)})}/></div></label>
          <div className="commercial-line-total-v3"><span>Total</span><strong>{money.format(Math.max(0,line.quantity*(line.unitPrice??0)-line.discount))}</strong></div>
          <button className="row-delete-v2" type="button" aria-label="Remover" onClick={()=>setLines(v=>v.filter(x=>x.key!==line.key))}><Trash2 size={14}/></button>
        </article>;
      })}</div>:<div className="commercial-empty-v3"><ShoppingCart size={24}/><strong>Nenhum produto no pedido</strong><span>Adicione as peças para montar a venda.</span></div>}
    </section>

    <section className="commercial-total-v3">
      <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
      <div><span>Desconto</span><strong>- {money.format(discount)}</strong></div>
      <div><span>Frete</span><strong>{money.format(shipping)}</strong></div>
      <div className="grand"><span>Total do pedido</span><strong>{money.format(total)}</strong></div>
    </section>
    {notice?<div className={`notice-v2 ${notice.type}`}>{notice.type==="success"?<Check size={14}/>:null}{notice.text}</div>:null}
    <div className="product-form-v2-footer"><button className="button-v2 primary commercial-save-v3" type="button" disabled={saving||!lines.length} onClick={()=>void save()}><Save size={14}/>{saving?"Criando...":"Confirmar pedido"}</button></div>
  </div>;
}
