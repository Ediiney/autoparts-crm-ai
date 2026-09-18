"use client";

import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

export function ProductPriceEditor({
  productId,
  price,
  cost,
  source,
}:{
  productId:string;
  price:number|null;
  cost:number|null;
  source:string|null;
}){
  const router=useRouter();
  const [open,setOpen]=useState(false);
  const [value,setValue]=useState(price===null?"":String(Number(price)));
  const [costValue,setCostValue]=useState(cost===null?"":String(Number(cost)));
  const [scope,setScope]=useState<"branch"|"company">("branch");
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const money=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

  async function save(){
    const next=Number(value.replace(",","."));
    if(!Number.isFinite(next)||next<0){setError("Preço inválido");return;}
    setSaving(true);setError("");
    try{
      const response=await fetch(`/api/catalog/products/${productId}/price`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          price:next,
          cost:costValue.trim()===""?null:Number(costValue.replace(",",".")),
          scope,
        })
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Não foi possível salvar.");
      setOpen(false);router.refresh();
    }catch(e){setError(e instanceof Error?e.message:"Erro ao salvar.");}
    finally{setSaving(false);}
  }

  if(!open){
    return <button type="button" className={price===null?"price-cell-v3 empty":"price-cell-v3"} onClick={()=>setOpen(true)}>
      <strong>{price===null?"Definir preço":money.format(Number(price))}</strong>
      <span>{price===null?"não cadastrado":source||"preço vigente"}</span>
      <Pencil size={12}/>
    </button>;
  }

  return <div className="price-editor-v3">
    <div className="price-editor-v3-grid">
      <label><span>Venda</span><input autoFocus inputMode="decimal" value={value} onChange={e=>setValue(e.target.value)}/></label>
      <label><span>Custo</span><input inputMode="decimal" value={costValue} placeholder="Opcional" onChange={e=>setCostValue(e.target.value)}/></label>
      <label><span>Aplicar em</span><select value={scope} onChange={e=>setScope(e.target.value as "branch"|"company")}><option value="branch">Filial atual</option><option value="company">Empresa</option></select></label>
    </div>
    {error?<small className="price-editor-error-v3">{error}</small>:null}
    <div className="price-editor-v3-actions">
      <button type="button" onClick={()=>setOpen(false)} aria-label="Cancelar"><X size={13}/></button>
      <button type="button" disabled={saving} onClick={()=>void save()} aria-label="Salvar"><Check size={13}/></button>
    </div>
  </div>;
}
