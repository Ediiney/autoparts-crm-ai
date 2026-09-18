"use client";

import { useRouter } from "next/navigation";
import { Check, Send, X } from "lucide-react";
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

  return <div className="quote-status-actions-v2">
    {status==="draft"?<button className="button-v2 primary" disabled={saving} onClick={()=>void setStatus("sent")}><Send size={14}/> Marcar enviado</button>:null}
    {status==="sent"?<><button className="button-v2 primary" disabled={saving} onClick={()=>void setStatus("accepted")}><Check size={14}/> Aceito</button><button className="button-v2 secondary" disabled={saving} onClick={()=>void setStatus("rejected")}><X size={14}/> Recusado</button></>:null}
    {status!=="cancelled"&&status!=="accepted"?<button className="button-v2 secondary" disabled={saving} onClick={()=>void setStatus("cancelled")}>Cancelar</button>:null}
  </div>;
}
