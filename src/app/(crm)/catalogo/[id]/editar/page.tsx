import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/company/workspace-context";
import { ProductEditor } from "./product-editor";

export default async function ProductEditPage({params}:{params:Promise<{id:string}>}){
  const workspace=await getWorkspaceContext();
  if(!workspace) return null;
  const {id}=await params;
  const supabase=await createClient();

  const {data:product}=await supabase
    .from("products")
    .select("id,sku,name,brand,manufacturer,original_code,barcode,description,category_id")
    .eq("company_id",workspace.company.id)
    .eq("id",id)
    .maybeSingle();
  if(!product) notFound();

  const [categoryResult,pricesResult,inventoryResult,warehousesResult]=await Promise.all([
    product.category_id?supabase.from("product_categories").select("name").eq("id",product.category_id).maybeSingle():Promise.resolve({data:null}),
    supabase.from("product_prices").select("price,branch_id,valid_from").eq("company_id",workspace.company.id).eq("product_id",id).order("valid_from",{ascending:false}),
    supabase.from("product_inventory").select("warehouse_id,quantity,reserved").eq("company_id",workspace.company.id).eq("product_id",id),
    supabase.from("warehouses").select("id,branch_id").eq("company_id",workspace.company.id).eq("active",true),
  ]);

  const branchId=workspace.branch?.id??null;
  const price=(pricesResult.data??[]).find(item=>item.branch_id===branchId)?.price
    ??(pricesResult.data??[]).find(item=>item.branch_id===null)?.price
    ??null;
  const allowed=new Set((warehousesResult.data??[]).filter(w=>!branchId||w.branch_id===branchId).map(w=>w.id));
  const stock=(inventoryResult.data??[]).filter(r=>allowed.has(r.warehouse_id)).reduce((sum,r)=>sum+Number(r.quantity),0);

  return (
    <div>
      <div className="page-heading-v2">
        <div><span className="overline-v2">Catálogo</span><h1>Editar peça</h1><p>{product.name} · {product.sku}</p></div>
        <Link href={`/catalogo/${id}`} className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link>
      </div>
      <ProductEditor
        product={{
          id:product.id,sku:product.sku,name:product.name,brand:product.brand,
          manufacturer:product.manufacturer,originalCode:product.original_code,
          barcode:product.barcode,description:product.description,
          category:categoryResult.data?.name??"",
          price:price===null?null:Number(price),stock
        }}
      />
    </div>
  );
}
