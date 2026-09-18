import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { normalizeText } from "@/lib/ai/normalize";
import { BRAZIL_TIMEZONES } from "@/lib/timezones";

function slugify(name:string) {
  return normalizeText(name).replace(/\s+/g,"-").replace(/^-|-$/g,"");
}

export async function POST(request:Request) {
  try {
    const body=(await request.json()) as {
      name?:string;
      document?:string;
      phone?:string;
      email?:string;
      businessType?:"retail"|"distributor";
      timezone?:string;
    };

    if(!body.name?.trim()) return NextResponse.json({error:"Nome é obrigatório."},{status:400});

    const timezone=BRAZIL_TIMEZONES.some(item=>item.value===body.timezone)
      ? body.timezone!
      : "America/Sao_Paulo";

    const {supabase,user}=await requireUser();

    const {data:existingMembership}=await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id",user.id)
      .eq("active",true)
      .limit(1)
      .maybeSingle();

    if(existingMembership) {
      const {data:existingCompany}=await supabase
        .from("companies")
        .select("id,name,slug,timezone")
        .eq("id",existingMembership.company_id)
        .maybeSingle();
      if(existingCompany) return NextResponse.json({company:existingCompany,reused:true},{status:200});
    }

    const {data:ownedCompany}=await supabase
      .from("companies")
      .select("id,name,slug,timezone")
      .eq("owner_user_id",user.id)
      .order("created_at",{ascending:false})
      .limit(1)
      .maybeSingle();

    let company=ownedCompany;

    if(!company) {
      const slug=`${slugify(body.name)}-${randomUUID().slice(0,6)}`;
      const {data,error}=await supabase
        .from("companies")
        .insert({
          owner_user_id:user.id,
          name:body.name.trim(),
          slug,
          document:body.document?.trim()||null,
          phone:body.phone?.trim()||null,
          email:body.email?.trim().toLowerCase()||null,
          timezone,
          business_type:body.businessType??"retail",
        })
        .select("id,name,slug,timezone")
        .single();
      if(error) throw error;
      company=data;
    }

    const {error:memberError}=await supabase.from("company_members").upsert({
      company_id:company.id,
      user_id:user.id,
      role:"owner",
      active:true,
    },{onConflict:"company_id,user_id"});
    if(memberError) throw memberError;

    const {error:updateCompanyError}=await supabase
      .from("companies")
      .update({
        name:body.name.trim(),
        document:body.document?.trim()||null,
        phone:body.phone?.trim()||null,
        email:body.email?.trim().toLowerCase()||null,
        timezone,
        business_type:body.businessType??"retail",
      })
      .eq("id",company.id);
    if(updateCompanyError) throw updateCompanyError;

    const branchResult=await supabase
      .from("branches")
      .select("id")
      .eq("company_id",company.id)
      .eq("is_headquarters",true)
      .limit(1)
      .maybeSingle();
    if(branchResult.error) throw branchResult.error;
    let headquarters=branchResult.data;

    if(!headquarters) {
      const created=await supabase
        .from("branches")
        .insert({
          company_id:company.id,
          name:"Matriz",
          code:"MATRIZ",
          timezone,
          is_headquarters:true,
        })
        .select("id")
        .single();
      if(created.error) throw created.error;
      headquarters=created.data;
    }

    const {error:memberBranchError}=await supabase
      .from("company_members")
      .update({branch_id:headquarters.id})
      .eq("company_id",company.id)
      .eq("user_id",user.id);
    if(memberBranchError) throw memberBranchError;

    const defaultHours=[
      {day_of_week:0,enabled:false,opens_at:null,closes_at:null},
      {day_of_week:1,enabled:true,opens_at:"08:00",closes_at:"18:00"},
      {day_of_week:2,enabled:true,opens_at:"08:00",closes_at:"18:00"},
      {day_of_week:3,enabled:true,opens_at:"08:00",closes_at:"18:00"},
      {day_of_week:4,enabled:true,opens_at:"08:00",closes_at:"18:00"},
      {day_of_week:5,enabled:true,opens_at:"08:00",closes_at:"18:00"},
      {day_of_week:6,enabled:true,opens_at:"08:00",closes_at:"13:00"},
    ];

    const {error:hoursError}=await supabase.from("branch_business_hours").upsert(
      defaultHours.map(hour=>({
        company_id:company.id,
        branch_id:headquarters!.id,
        ...hour,
      })),
      {onConflict:"branch_id,day_of_week"},
    );
    if(hoursError) throw hoursError;

    const {error:settingsError}=await supabase.from("company_settings").upsert({
      company_id:company.id,
      settings:{businessType:body.businessType??"retail"},
    },{onConflict:"company_id"});
    if(settingsError) throw settingsError;

    const {error:warehouseError}=await supabase.from("warehouses").upsert({
      company_id:company.id,
      branch_id:headquarters.id,
      name:"Estoque principal",
      code:"MAIN",
      active:true,
    },{onConflict:"company_id,code"});
    if(warehouseError) throw warehouseError;

    const {data:catalogSource}=await supabase
      .from("catalog_sources")
      .select("id")
      .eq("company_id",company.id)
      .eq("provider","giancar")
      .limit(1)
      .maybeSingle();

    if(!catalogSource) {
      const {error:sourceError}=await supabase.from("catalog_sources").insert({
        company_id:company.id,
        name:"Giancar - Catálogo",
        provider:"giancar",
        source_url:"https://www.giancar.com.br/catalogo",
        source_type:"catalog",
      });
      if(sourceError) throw sourceError;
    }

    return NextResponse.json({company:{...company,name:body.name.trim(),timezone}},{status:201});
  } catch(error) {
    const message=error instanceof Error?error.message:"Erro inesperado.";
    const status=message==="UNAUTHORIZED"?401:400;
    return NextResponse.json({error:message},{status});
  }
}
