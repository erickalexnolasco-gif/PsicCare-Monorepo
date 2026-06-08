//apps/app/src/app/(dashboard)/settings/page.tsx
import { Suspense } from "react";
import { createClient } from "@psicare/db/server";
import { SettingsClient } from "./client";

export const dynamic = "force-dynamic";

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (Carga Instantánea)
// ==========================================
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsDataLoader />
    </Suspense>
  );
}

// ==========================================
// 🧩 CREADOR DE DATOS (Espera a Supabase)
// ==========================================
async function SettingsDataLoader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: psico } = await supabase.from("psicologas").select("*").eq("id", user!.id).single();
  
  return <SettingsClient psicologa={psico!} />;
}

// ==========================================
// 🦴 SKELETON LOADER (El molde vacío de los ajustes)
// ==========================================
function SettingsSkeleton() {
  return (
    <div className="animate-pulse fade-in">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="h-12 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Tarjeta de Perfil */}
        <div className="card-soft p-7">
          <div className="h-8 bg-gray-200 rounded w-24 mb-5"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-11 bg-gray-100 border border-gray-200/50 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tarjeta de Horario */}
        <div className="card-soft p-7">
          <div className="h-8 bg-gray-200 rounded w-48 mb-5"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-11 bg-gray-100 border border-gray-200/50 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de Guardar */}
        <div className="h-11 bg-gray-200 rounded-xl w-40"></div>
      </div>
    </div>
  );
}