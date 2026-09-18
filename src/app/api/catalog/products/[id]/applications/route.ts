import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try{
    const workspace=await getWorkspaceContext();
    if(!workspace) return NextResponse.json({error:"Empresa não encontrada."},{status:404});
    const {id}=await params;
    const {supabase}=await requireUser();
    const body=(await request.json()) as {
      brand?:string;model?:string;yearStart?:number|null;yearEnd?:number|null;
      engine?:string;version?:string;side?:string|null;axle?:string|null;position?:string;
    };
    if(!body.brand?.trim()||!body.model?.trim()) return NextResponse.json({error:"Montadora e modelo são obrigatórios."},{status:400});

    const {data,error}=await supabase.from("vehicle_applications").insert({
      company_id:workspace.company.id,
      product_id:id,
      vehicle_brand:body.brand.trim(),
      vehicle_model:body.model.trim(),
      year_start:body.yearStart??null,
      year_end:body.yearEnd??null,
      engine:body.engine?.trim()||null,
      version:body.version?.trim()||null,
      side:body.side||null,
      axle:body.axle||null,
      position:body.position?.trim()||null,
      source:"manual",
    }).select("id").single();
    if(error) throw error;
    return NextResponse.json({application:data},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível criar a aplicação."},{status:400});
  }
}
