import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { normalizeText } from "@/lib/ai/normalize";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try{
    const workspace=await getWorkspaceContext();
    if(!workspace) return NextResponse.json({error:"Empresa não encontrada."},{status:404});
    const {id}=await params;
    const {supabase}=await requireUser();
    const {alias}=(await request.json()) as {alias?:string};
    if(!alias?.trim()) return NextResponse.json({error:"Alias é obrigatório."},{status:400});

    const {data,error}=await supabase.from("product_aliases").insert({
      company_id:workspace.company.id,
      product_id:id,
      alias:alias.trim(),
      normalized_alias:normalizeText(alias),
      source:"manual",
    }).select("id,alias").single();
    if(error) throw error;
    return NextResponse.json({alias:data},{status:201});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível criar o alias."},{status:400});
  }
}
