import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentCompany } from "@/lib/company/current-company";
import type { Json } from "@/types/database";

export async function POST(request:Request) {
  try {
    const company=await getCurrentCompany();
    if(!company) return NextResponse.json({error:"Empresa não encontrada."},{status:404});
    const {supabase}=await requireUser();
    const body=(await request.json()) as {
      provider?:"whatsapp"|"giancar"|"erp"|"email"|"webhook"|"api";
      name?:string;
      branchId?:string|null;
      config?:Record<string,unknown>;
    };

    if(!body.provider||!body.name?.trim()) return NextResponse.json({error:"Integração inválida."},{status:400});

    const {data,error}=await supabase.from("integration_connections").insert({
      company_id:company.id,
      branch_id:body.branchId||null,
      provider:body.provider,
      name:body.name.trim(),
      status:"disconnected",
      config:(body.config??{}) as Json,
    }).select("id,provider,name,status,branch_id,last_sync_at,last_error,active").single();

    if(error) throw error;
    return NextResponse.json({integration:data},{status:201});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Não foi possível criar a integração."},{status:400});
  }
}
