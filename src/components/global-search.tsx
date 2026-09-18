"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CarFront,
  FileText,
  LoaderCircle,
  PackageSearch,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

type SearchPayload = {
  products?: Array<{ id:string;name:string;sku:string;original_code:string|null }>;
  customers?: Array<{ id:string;name:string;whatsapp:string|null;phone:string|null;email:string|null }>;
  vehicles?: Array<{ id:string;brand:string|null;model:string|null;year:number|null;model_year:number|null;plate:string|null;customer_name:string }>;
  quotes?: Array<{ id:string;number:number;status:string;total:number;customer_name:string }>;
  orders?: Array<{ id:string;number:number;status:string;payment_status:string;total:number;customer_name:string }>;
};

export function GlobalSearch(){
  const inputRef=useRef<HTMLInputElement>(null);
  const [query,setQuery]=useState("");
  const [payload,setPayload]=useState<SearchPayload>({});
  const [open,setOpen]=useState(false);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    function shortcut(event:KeyboardEvent){
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){
        event.preventDefault();inputRef.current?.focus();setOpen(true);
      }
      if(event.key==="Escape"){setOpen(false);inputRef.current?.blur();}
    }
    window.addEventListener("keydown",shortcut);
    return()=>window.removeEventListener("keydown",shortcut);
  },[]);

  useEffect(()=>{
    const value=query.trim();if(value.length<2)return;
    const controller=new AbortController();
    const timer=window.setTimeout(async()=>{
      setLoading(true);
      try{
        const response=await fetch(`/api/search?q=${encodeURIComponent(value)}`,{signal:controller.signal});
        const data=await response.json();
        if(response.ok){setPayload(data);setOpen(true);}
      }catch(error){if((error as Error).name!=="AbortError")setPayload({});}
      finally{setLoading(false);}
    },180);
    return()=>{controller.abort();window.clearTimeout(timer);};
  },[query]);

  const hasResults=(payload.products?.length??0)+(payload.customers?.length??0)+(payload.vehicles?.length??0)+(payload.quotes?.length??0)+(payload.orders?.length??0)>0;
  const close=()=>setOpen(false);

  return <div className="global-search-v2" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false);}}>
    <div className="search-v2">
      <Search size={17}/>
      <input ref={inputRef} value={query} onFocus={()=>query.trim().length>=2&&setOpen(true)} onChange={event=>{
        const next=event.target.value;setQuery(next);
        if(next.trim().length<2){setPayload({});setOpen(false);}
      }} placeholder="Pesquise por peças, clientes, veículos, orçamentos ou pedidos..." aria-label="Busca global"/>
      {loading?<LoaderCircle size={14} className="search-spin-v2"/>:query?<button type="button" className="search-clear-v2" aria-label="Limpar busca" onClick={()=>{setQuery("");setPayload({});setOpen(false);inputRef.current?.focus();}}><X size={13}/></button>:<kbd>Ctrl K</kbd>}
    </div>
    {open?<div className="global-search-popover-v2">
      {!hasResults&&!loading?<div className="global-search-empty-v2"><Search size={18}/><strong>Nenhum resultado</strong><span>Tente nome, código, placa ou número do documento.</span></div>:<>
        <ResultGroup title="Peças" items={(payload.products??[]).map(item=>({href:`/catalogo/${item.id}`,icon:<PackageSearch size={15}/>,title:item.name,subtitle:[item.sku,item.original_code].filter(Boolean).join(" · ")}))} onSelect={close}/>
        <ResultGroup title="Clientes" items={(payload.customers??[]).map(item=>({href:`/clientes/${item.id}`,icon:<UserRound size={15}/>,title:item.name,subtitle:item.whatsapp||item.phone||item.email||"Sem contato"}))} onSelect={close}/>
        <ResultGroup title="Veículos" items={(payload.vehicles??[]).map(item=>({href:`/veiculos/${item.id}`,icon:<CarFront size={15}/>,title:[item.brand,item.model,item.model_year||item.year].filter(Boolean).join(" "),subtitle:[item.plate,item.customer_name].filter(Boolean).join(" · ")}))} onSelect={close}/>
        <ResultGroup title="Orçamentos" items={(payload.quotes??[]).map(item=>({href:`/orcamentos/${item.id}`,icon:<FileText size={15}/>,title:`Orçamento #${item.number}`,subtitle:`${item.customer_name} · ${item.status}`}))} onSelect={close}/>
        <ResultGroup title="Pedidos" items={(payload.orders??[]).map(item=>({href:`/pedidos/${item.id}`,icon:<ShoppingCart size={15}/>,title:`Pedido #${item.number}`,subtitle:`${item.customer_name} · ${item.status}`}))} onSelect={close}/>
      </>}
    </div>:null}
  </div>;
}

function ResultGroup({title,items,onSelect}:{title:string;items:Array<{href:string;icon:React.ReactNode;title:string;subtitle:string}>;onSelect:()=>void}){
  if(!items.length)return null;
  return <section className="global-search-group-v2"><span>{title}</span>{items.map(item=><Link key={item.href} href={item.href} prefetch={false} onClick={onSelect}><i>{item.icon}</i><div><strong>{item.title}</strong><small>{item.subtitle}</small></div></Link>)}</section>;
}
