import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewProductForm } from "./new-product-form";

export default function NewProductPage() {
  return (
    <div>
      <div className="page-heading-v2">
        <div>
          <span className="overline-v2">Catálogo</span>
          <h1>Nova peça</h1>
          <p>Cadastre produto, preço, estoque inicial e aplicação veicular.</p>
        </div>
        <Link href="/catalogo" className="button-v2 secondary"><ArrowLeft size={14}/> Voltar</Link>
      </div>
      <NewProductForm/>
    </div>
  );
}
