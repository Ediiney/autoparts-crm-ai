import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const workspace=await getWorkspaceContext();
    if(!workspace)return NextResponse.json({error:"Empresa não encontrada."},{status:404});
    const {id}=await params;const {supabase}=await requireUser();
    const body=await request.json() as {price?:number;cost?:number|null;scope?:string};

    const price=Number(body.price);
    if(!Number.isFinite(price)||price<0)return NextResponse.json({error:"Preço inválido."},{status:400});
    const cost=body.cost===null||body.cost===undefined?undefined:Number(body.cost);
    if(cost!==undefined&&(!Number.isFinite(cost)||cost<0))return NextResponse.json({error:"Custo inválido."},{status:400});

    const {data,error}=await supabase.rpc("set_product_price",{
      p_product_id:id,
      p_branch_id:body.scope==="company"?undefined:(workspace.branch?.id??undefined),
      p_price:price,
      p_cost:cost,
      p_price_type:"retail",
      p_source:"manual",
    });
    if(error)throw error;
    return NextResponse.json({priceId:data,price,cost:cost??null});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível atualizar o preço."},{status:400});
  }
}
