"use client";

import { useRouter } from "next/navigation";
import { Check, Send, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

export function QuoteStatusActions({quoteId,status}:{quoteId:string;status:string}){
  const router=useRouter();
  const [saving,setSaving]=useState(false);

  async function setStatus(next:string){
    setSaving(true);
    try{
      const response=await fetch(`/api/quotes/${quoteId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})});
      if(response.ok)router.refresh();
    }finally{setSaving(false);}
  }

  async function convert(){
    setSaving(true);
    try{
      const response=await fetch(`/api/quotes/${quoteId}/convert`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({deliveryType:"pickup"})});
      const payload=await response.json();
      if(response.ok&&payload.order?.id)router.push(`/pedidos/${payload.order.id}`);
    }finally{setSaving(false);}
  }

  return <div className="quote-status-actions-v2">
    {status==="draft"?<button className="button-v2 primary" disabled={saving} onClick={()=>void setStatus("sent")}><Send size={14}/> Marcar enviado</button>:null}
    {status==="sent"?<button className="button-v2 secondary" disabled={saving} onClick={()=>void setStatus("accepted")}><Check size={14}/> Marcar aceito</button>:null}
    {["sent","accepted"].includes(status)?<button className="button-v2 primary" disabled={saving} onClick={()=>void convert()}><ShoppingCart size={14}/> Gerar pedido</button>:null}
    {status==="sent"?<button className="button-v2 secondary" disabled={saving} onClick={()=>void setStatus("rejected")}><X size={14}/> Recusado</button>:null}
    {!["cancelled","accepted","rejected"].includes(status)?<button className="button-v2 tertiary" disabled={saving} onClick={()=>void setStatus("cancelled")}>Cancelar</button>:null}
  </div>;
}
