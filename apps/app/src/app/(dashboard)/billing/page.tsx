//apps/app/src/app/(dashboard)/billing/page.tsx
import { Suspense } from "react";
import { PLANS } from "@psicare/types";
import { createClient } from "@psicare/db/server";
import { Check, Crown, Sparkles } from "lucide-react";
import { BillingClient } from "./client";

export const dynamic = "force-dynamic";

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (Carga Instantánea)
// ==========================================
export default function BillingPage() {
  return (
    <>
      <div className="mb-10 fade-up text-center">
        <Crown size={32} style={{ color: "#D88AAB" }} className="mx-auto mb-4" />
        <h1 className="font-display text-5xl mb-3" data-testid="billing-title">Planes PsiCare</h1>
        <p className="max-w-xl mx-auto" style={{ color: "var(--psi-soft)" }}>Elige el plan que se adapta a tu consulta. Cancela cuando quieras, sin contratos.</p>
      </div>

      <Suspense fallback={<BillingSkeleton />}>
        <BillingDataLoader />
      </Suspense>

      <div className="text-center mt-10 max-w-xl mx-auto card-soft p-6" style={{ background: "rgba(255, 255, 255, 0.5)" }}>
        <p className="text-sm" style={{ color: "var(--psi-soft)" }}>
          💳 Pagos seguros con <strong>Mercado Pago</strong>. Aceptamos tarjeta, OXXO, SPEI y más. <br />
          🔒 Tus datos clínicos están cifrados y protegidos con multi-tenancy y RLS.
        </p>
      </div>
    </>
  );
}

// ==========================================
// 🧩 CREADOR DE DATOS (Espera a Supabase)
// ==========================================
async function BillingDataLoader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psico = (await supabase.from("psicologas").select("*, organizations(*)").eq("id", user!.id).single()).data as any;
  const currentPlan = psico.organizations.plan;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {PLANS.map((plan) => (
        <div key={plan.id} className={`card-soft p-8 relative ${plan.id === "pro" ? "ring-2 ring-[#E8A0BF]" : ""}`} data-testid={`plan-${plan.id}`}>
          {plan.id === "pro" && (
            <span className="absolute top-4 right-4 badge badge-info flex items-center gap-1"><Sparkles size={12} /> Más popular</span>
          )}
          <h3 className="font-display text-3xl mb-2">{plan.nombre}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-5xl">${plan.precio_mensual_mxn}</span>
            <span style={{ color: "var(--psi-soft)" }}>MXN/mes</span>
          </div>
          
          {plan.precio_anual_mxn > 0 && (
            <p className="text-sm mb-6" style={{ color: "var(--psi-soft)" }}>
              o <strong>${plan.precio_anual_mxn} MXN/año</strong> · ahorra ${plan.precio_mensual_mxn * 12 - plan.precio_anual_mxn} MXN
            </p>
          )}
          {plan.precio_anual_mxn === 0 && <p className="text-sm mb-6" style={{ color: "var(--psi-soft)" }}>Sin compromisos, para siempre.</p>}

          <ul className="space-y-3 mb-8">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check size={16} style={{ color: "#5a8a55", marginTop: 2 }} /> <span>{f}</span>
              </li>
            ))}
          </ul>

          {currentPlan === plan.id ? (
            <button disabled className="btn-secondary w-full justify-center opacity-70" data-testid={`current-${plan.id}`}>Tu plan actual</button>
          ) : plan.id === "pro" ? (
            <BillingClient organizationId={psico.organization_id} />
          ) : (
            <button disabled className="btn-secondary w-full justify-center">Gratis para siempre</button>
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 🦴 SKELETON LOADER
// ==========================================
function BillingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-pulse fade-in">
      {[1, 2].map((i) => (
        <div key={i} className="card-soft p-8">
          <div className="h-8 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-12 bg-gray-200 rounded w-40 mb-6"></div>
          
          <div className="space-y-4 mb-8">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded-full shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>

          <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
        </div>
      ))}
    </div>
  );
}