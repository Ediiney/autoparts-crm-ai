"use client";

import { useState } from "react";
import { Check, Plus, Save } from "lucide-react";

type Product={
  id:string;sku:string;name:string;brand:string|null;manufacturer:string|null;
  originalCode:string|null;barcode:string|null;description:string|null;category:string;
  price:number|null;stock:number;
};

export function ProductEditor({product:initial}:{product:Product}){
  const [product,setProduct]=useState(initial);
  const [price,setPrice]=useState(initial.price?.toString()??"");
  const [stock,setStock]=useState(initial.stock.toString());
  const [notice,setNotice]=useState<{type:"success"|"error";text:string}|null>(null);
  const [saving,setSaving]=useState(false);

  async function json(path:string,method:string,body:unknown){
    const response=await fetch(path,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const payload=await response.json();
    if(!response.ok) throw new Error(payload.error||"Falha ao salvar.");
    return payload;
  }

  async function saveBase(){
    setSaving(true);setNotice(null);
    try{
      await json("/api/catalog/products","PATCH",{
        id:product.id,sku:product.sku,name:product.name,category:product.category,
        manufacturer:product.manufacturer,brand:product.brand,originalCode:product.originalCode,
        barcode:product.barcode,description:product.description
      });
      await json(`/api/catalog/products/${product.id}/commercial`,"PATCH",{
        price:price===""?null:Number(price.replace(",",".")),
        stock:stock===""?null:Number(stock.replace(",","."))
      });
      setNotice({type:"success",text:"Produto atualizado com sucesso."});
    }catch(error){
      setNotice({type:"error",text:error instanceof Error?error.message:"Erro ao salvar."});
    }finally{setSaving(false);}
  }

  async function addApplication(form:HTMLFormElement){
    const data=new FormData(form);
    try{
      await json(`/api/catalog/products/${product.id}/applications`,"POST",{
        brand:data.get("brand"),model:data.get("model"),
        yearStart:data.get("yearStart")?Number(data.get("yearStart")):null,
        yearEnd:data.get("yearEnd")?Number(data.get("yearEnd")):null,
        engine:data.get("engine"),version:data.get("version"),side:data.get("side")||null,axle:data.get("axle")||null
      });
      setNotice({type:"success",text:"Aplicação adicionada."});form.reset();
    }catch(error){setNotice({type:"error",text:error instanceof Error?error.message:"Erro."});}
  }

  async function addAlias(form:HTMLFormElement){
    const data=new FormData(form);
    try{
      await json(`/api/catalog/products/${product.id}/aliases`,"POST",{alias:data.get("alias")});
      setNotice({type:"success",text:"Alias adicionado."});form.reset();
    }catch(error){setNotice({type:"error",text:error instanceof Error?error.message:"Erro."});}
  }

  return (
    <div className="product-form-v2">
      {notice?<div className={`notice-v2 ${notice.type}`}>{notice.type==="success"?<Check size={14}/>:null}{notice.text}</div>:null}
      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Produto</h2><p>Dados comerciais e de identificação.</p></div></div>
        <div className="form-v2-grid">
          <label className="field-v2"><span>SKU</span><input value={product.sku} onChange={e=>setProduct({...product,sku:e.target.value})}/></label>
          <label className="field-v2"><span>Nome</span><input value={product.name} onChange={e=>setProduct({...product,name:e.target.value})}/></label>
          <label className="field-v2"><span>Categoria</span><input value={product.category} onChange={e=>setProduct({...product,category:e.target.value})}/></label>
          <label className="field-v2"><span>Fabricante</span><input value={product.manufacturer??""} onChange={e=>setProduct({...product,manufacturer:e.target.value})}/></label>
          <label className="field-v2"><span>Marca</span><input value={product.brand??""} onChange={e=>setProduct({...product,brand:e.target.value})}/></label>
          <label className="field-v2"><span>Código original</span><input value={product.originalCode??""} onChange={e=>setProduct({...product,originalCode:e.target.value})}/></label>
          <label className="field-v2"><span>Código de barras</span><input value={product.barcode??""} onChange={e=>setProduct({...product,barcode:e.target.value})}/></label>
          <label className="field-v2 wide"><span>Descrição</span><textarea rows={3} value={product.description??""} onChange={e=>setProduct({...product,description:e.target.value})}/></label>
        </div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Comercial da filial atual</h2><p>Novo preço cria histórico; estoque atualiza o saldo da filial.</p></div></div>
        <div className="form-v2-grid">
          <label className="field-v2"><span>Preço</span><input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal"/></label>
          <label className="field-v2"><span>Estoque físico</span><input value={stock} onChange={e=>setStock(e.target.value)} inputMode="decimal"/></label>
        </div>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Adicionar aplicação</h2><p>Compatibilidade adicional.</p></div></div>
        <form className="form-v2-grid" onSubmit={e=>{e.preventDefault();void addApplication(e.currentTarget);}}>
          <label className="field-v2"><span>Montadora</span><input name="brand" required/></label>
          <label className="field-v2"><span>Modelo</span><input name="model" required/></label>
          <label className="field-v2"><span>Ano inicial</span><input name="yearStart" inputMode="numeric"/></label>
          <label className="field-v2"><span>Ano final</span><input name="yearEnd" inputMode="numeric"/></label>
          <label className="field-v2"><span>Motor</span><input name="engine"/></label>
          <label className="field-v2"><span>Versão</span><input name="version"/></label>
          <label className="field-v2"><span>Lado</span><select name="side"><option value="">—</option><option value="left">Esquerdo</option><option value="right">Direito</option><option value="both">Ambos</option></select></label>
          <label className="field-v2"><span>Eixo</span><select name="axle"><option value="">—</option><option value="front">Dianteiro</option><option value="rear">Traseiro</option><option value="both">Ambos</option></select></label>
          <div className="form-v2-actions wide"><button className="button-v2 secondary"><Plus size={14}/> Adicionar aplicação</button></div>
        </form>
      </section>

      <section className="panel-v2">
        <div className="panel-v2-title"><div><h2>Adicionar alias</h2><p>Ex.: bandeija, braço oscilante, bandeja suspensão.</p></div></div>
        <form className="inline-form-v2" onSubmit={e=>{e.preventDefault();void addAlias(e.currentTarget);}}>
          <input name="alias" required placeholder="Novo termo de busca"/>
          <button className="button-v2 secondary"><Plus size={14}/> Adicionar</button>
        </form>
      </section>

      <div className="product-form-v2-footer"><button className="button-v2 primary" onClick={()=>void saveBase()} disabled={saving}><Save size={14}/>{saving?"Salvando...":"Salvar alterações"}</button></div>
    </div>
  );
}
