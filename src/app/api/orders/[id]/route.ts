import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

const statuses=new Set(["draft","confirmed","picking","ready","delivered","cancelled"]);
const paymentStatuses=new Set(["pending","partial","paid","refunded","cancelled"]);

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const workspace=await getWorkspaceContext();if(!workspace)return NextResponse.json({error:"Empresa não encontrada."},{status:404});
    const {id}=await params;const {supabase}=await requireUser();
    const body=await request.json() as {status?:string;paymentStatus?:string;notes?:string};

    if(body.status&&!statuses.has(body.status))return NextResponse.json({error:"Status inválido."},{status:400});
    if(body.paymentStatus&&!paymentStatuses.has(body.paymentStatus))return NextResponse.json({error:"Status de pagamento inválido."},{status:400});

    const now=new Date().toISOString();
    const {data,error}=await supabase.from("orders").update({
      ...(body.status?{status:body.status}:{}),
      ...(body.paymentStatus?{payment_status:body.paymentStatus}:{}),
      ...(body.notes!==undefined?{notes:body.notes.trim()||null}:{}),
      ...(body.status==="delivered"?{delivered_at:now}:{}),
    }).eq("company_id",workspace.company.id).eq("id",id).select("id,number,status,payment_status,total").single();

    if(error)throw error;
    return NextResponse.json({order:data});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível atualizar o pedido."},{status:400});
  }
}
