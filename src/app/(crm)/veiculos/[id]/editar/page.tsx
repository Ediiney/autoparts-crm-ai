import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/vehicle-form";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";

export default async function EditarVeiculoPage({params}:{params:Promise<{id:string}>}) {
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const {id}=await params;
  const supabase=await createClient();
  const [{data:vehicle},{data:customers}]=await Promise.all([
    supabase.from("customer_vehicles").select("id,customer_id,brand,model,year,model_year,engine,version,transmission,fuel,plate,chassis,notes").eq("company_id",workspace.company.id).eq("id",id).maybeSingle(),
    supabase.from("customers").select("id,name").eq("company_id",workspace.company.id).eq("active",true).order("name"),
  ]);
  if(!vehicle) notFound();

  return <div>
    <div className="page-heading-v2"><div><span className="overline-v2">Veículos</span><h1>Editar veículo</h1><p>{vehicle.brand} {vehicle.model}</p></div><Link href={`/veiculos/${id}`} className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link></div>
    <VehicleForm initial={{id:vehicle.id,customerId:vehicle.customer_id,brand:vehicle.brand??"",model:vehicle.model??"",year:vehicle.year?.toString()??"",modelYear:vehicle.model_year?.toString()??"",engine:vehicle.engine??"",version:vehicle.version??"",transmission:vehicle.transmission??"",fuel:vehicle.fuel??"",plate:vehicle.plate??"",chassis:vehicle.chassis??"",notes:vehicle.notes??""}} customers={customers??[]}/>
  </div>;
}
