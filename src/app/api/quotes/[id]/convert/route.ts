import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const workspace=await getWorkspaceContext();if(!workspace)return NextResponse.json({error:"Empresa não encontrada."},{status:404});
    const {id}=await params;const {supabase}=await requireUser();
    const body=await request.json().catch(()=>({})) as {deliveryType?:string;paymentMethod?:string;deliveryAddress?:string;notes?:string};
    const {data:orderId,error}=await supabase.rpc("convert_quote_to_order",{
      p_quote_id:id,
      p_delivery_type:body.deliveryType||"pickup",
      p_payment_method:body.paymentMethod||undefined,
      p_delivery_address:body.deliveryAddress||undefined,
      p_notes:body.notes||undefined,
    });
    if(error)throw error;
    const {data:order,error:readError}=await supabase.from("orders").select("id,number,status,total").eq("company_id",workspace.company.id).eq("id",orderId).single();
    if(readError)throw readError;
    return NextResponse.json({order},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível gerar o pedido."},{status:400});
  }
}
