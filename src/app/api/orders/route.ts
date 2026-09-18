import { NextResponse } from "next/server";
import type { Json } from "@/types/database";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

type Item={productId:string;quantity:number;unitPrice:number;discount?:number};

export async function POST(request:Request){
  try{
    const workspace=await getWorkspaceContext();
    if(!workspace||!workspace.branch)return NextResponse.json({error:"Filial não encontrada."},{status:400});
    const {supabase}=await requireUser();
    const body=await request.json() as {
      customerId?:string;items?:Item[];shipping?:number;deliveryType?:string;
      paymentMethod?:string;deliveryAddress?:string;notes?:string;
    };
    if(!body.items?.length)return NextResponse.json({error:"Adicione ao menos um item."},{status:400});
    const invalid=body.items.some(i=>!i.productId||!Number.isFinite(i.quantity)||i.quantity<=0||!Number.isFinite(i.unitPrice)||i.unitPrice<=0||(i.discount??0)<0);
    if(invalid)return NextResponse.json({error:"Há itens sem preço ou quantidade válida."},{status:400});

    const items=body.items.map(i=>({
      product_id:i.productId,quantity:i.quantity,unit_price:i.unitPrice,discount:Math.max(0,i.discount??0)
    })) as unknown as Json;

    const {data:id,error}=await supabase.rpc("create_order",{
      p_branch_id:workspace.branch.id,
      p_customer_id:body.customerId||undefined,
      p_items:items,
      p_shipping:Math.max(0,Number(body.shipping??0)),
      p_delivery_type:body.deliveryType||"pickup",
      p_payment_method:body.paymentMethod||undefined,
      p_delivery_address:body.deliveryAddress||undefined,
      p_notes:body.notes?.trim()||undefined,
    });
    if(error)throw error;
    const {data:order,error:readError}=await supabase.from("orders").select("id,number,status,total").eq("company_id",workspace.company.id).eq("id",id).single();
    if(readError)throw readError;
    return NextResponse.json({order},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível criar o pedido."},{status:400});
  }
}
