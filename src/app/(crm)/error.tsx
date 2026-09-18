"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function CrmError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CRM route error", error);
  }, [error]);

  return (
    <div className="route-error-v2">
      <div className="route-error-v2-icon"><AlertTriangle size={20} /></div>
      <h2>Não foi possível carregar esta área</h2>
      <p>Tente novamente. Se o problema continuar, o identificador técnico pode ser usado nos logs do deploy.</p>
      {error.digest ? <code>{error.digest}</code> : null}
      <button className="button-v2 primary" type="button" onClick={reset}>
        <RotateCcw size={14} /> Tentar novamente
      </button>
    </div>
  );
}
