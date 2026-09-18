import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const workspace=await getWorkspaceContext();
    if(!workspace) return NextResponse.json({error:"Empresa não encontrada."},{status:404});
    const {id}=await params;
    const {supabase}=await requireUser();
    const body=(await request.json()) as {price?:number|null;stock?:number|null};

    const {data:product}=await supabase
      .from("products")
      .select("id")
      .eq("company_id",workspace.company.id)
      .eq("id",id)
      .maybeSingle();
    if(!product) return NextResponse.json({error:"Produto não encontrado."},{status:404});

    if(typeof body.price==="number"&&body.price>=0){
      const {error}=await supabase.from("product_prices").insert({
        company_id:workspace.company.id,
        branch_id:workspace.branch?.id??null,
        product_id:id,
        price_type:"retail",
        price:body.price,
        source:"manual",
      });
      if(error) throw error;
    }

    if(typeof body.stock==="number"&&body.stock>=0){
      let query=supabase
        .from("warehouses")
        .select("id")
        .eq("company_id",workspace.company.id)
        .eq("active",true);
      if(workspace.branch?.id) query=query.eq("branch_id",workspace.branch.id);
      const {data:warehouse}=await query.limit(1).maybeSingle();
      if(!warehouse) throw new Error("Nenhum estoque ativo encontrado para a filial atual.");

      const {error}=await supabase.from("product_inventory").upsert({
        company_id:workspace.company.id,
        product_id:id,
        warehouse_id:warehouse.id,
        quantity:body.stock,
        reserved:0,
      },{onConflict:"product_id,warehouse_id"});
      if(error) throw error;
    }

    return NextResponse.json({ok:true});
  } catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível atualizar preço/estoque."},{status:400});
  }
}
