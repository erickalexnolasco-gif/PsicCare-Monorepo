//apps/app/src/app/(dashboard)/billing/client.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export function BillingClient({ organizationId }: { organizationId: string }) {
  const [ciclo, setCiclo] = useState<"mensual" | "anual">("mensual");
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    startTransition(async () => {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_id: organizationId, plan_id: "pro", ciclo }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error(data.error ?? "Error al iniciar checkout");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="tab-list">
        <button onClick={() => setCiclo("mensual")} className={`tab-item flex-1 ${ciclo === "mensual" ? "active" : ""}`} data-testid="ciclo-mensual">Mensual · $99</button>
        <button onClick={() => setCiclo("anual")} className={`tab-item flex-1 ${ciclo === "anual" ? "active" : ""}`} data-testid="ciclo-anual">Anual · $999 (ahorra 16%)</button>
      </div>
      <button onClick={handleUpgrade} disabled={isPending} className="btn-primary w-full justify-center" data-testid="upgrade-btn">
        {isPending ? "Conectando con Mercado Pago..." : "Actualizar a Pro 🌸"}
      </button>
    </div>
  );
}
