"use client";

import { useRouter } from "next/navigation";
import { Check, CircleDollarSign, PackageCheck, PackageOpen, X } from "lucide-react";
import { useState } from "react";

export function OrderStatusActions({orderId,status,paymentStatus}:{orderId:string;status:string;paymentStatus:string}){
  const router=useRouter();const [saving,setSaving]=useState(false);
  async function patch(body:Record<string,string>){
    setSaving(true);
    try{
      const r=await fetch(`/api/orders/${orderId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(r.ok)router.refresh();
    }finally{setSaving(false);}
  }
  return <div className="quote-status-actions-v2">
    {status==="confirmed"?<button className="button-v2 primary" disabled={saving} onClick={()=>void patch({status:"picking"})}><PackageOpen size={14}/> Iniciar separação</button>:null}
    {status==="picking"?<button className="button-v2 primary" disabled={saving} onClick={()=>void patch({status:"ready"})}><PackageCheck size={14}/> Marcar pronto</button>:null}
    {status==="ready"?<button className="button-v2 primary" disabled={saving} onClick={()=>void patch({status:"delivered"})}><Check size={14}/> Entregue</button>:null}
    {paymentStatus!=="paid"&&status!=="cancelled"?<button className="button-v2 secondary" disabled={saving} onClick={()=>void patch({paymentStatus:"paid"})}><CircleDollarSign size={14}/> Marcar pago</button>:null}
    {!["delivered","cancelled"].includes(status)?<button className="button-v2 secondary" disabled={saving} onClick={()=>void patch({status:"cancelled"})}><X size={14}/> Cancelar</button>:null}
  </div>;
}
