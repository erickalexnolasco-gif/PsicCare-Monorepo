//apps/app/src/app/(dashboard)/calendar/page.tsx
import { Suspense } from "react";
import { createClient } from "@psicare/db/server";
import { CalendarClient } from "./client";

export const dynamic = "force-dynamic";

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (Carga Instantánea)
// ==========================================
export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarDataLoader />
    </Suspense>
  );
}

// ==========================================
// 🧩 CREADOR DE DATOS (Espera a Supabase)
// ==========================================
async function CalendarDataLoader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psico = (await supabase.from("psicologas").select("organization_id").eq("id", user!.id).single()).data!;

  const [{ data: sesiones }, { data: pacientes }] = await Promise.all([
    supabase.from("sesiones").select("*").eq("organization_id", psico.organization_id).is("deleted_at", null).order("fecha"),
    supabase.from("pacientes").select("id, nombre, color, modalidad").eq("organization_id", psico.organization_id).is("deleted_at", null).order("nombre"),
  ]);

  // Una vez que llegan los datos, renderizamos tu cliente interactivo intacto
  return <CalendarClient sesiones={sesiones ?? []} pacientes={pacientes ?? []} />;
}

// ==========================================
// 🦴 SKELETON LOADER (El molde vacío del calendario)
// ==========================================
function CalendarSkeleton() {
  const wd = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  
  return (
    <div className="animate-pulse fade-in">
      {/* Skeleton del Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-12 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-16 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton de la Cuadrícula */}
      <div className="card-soft p-6">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {wd.map((d) => (
            <div key={d} className="text-center py-2">
              <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Renderizamos 35 celdas grises vacías simulando el mes */}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl border border-gray-50/50"></div>
          ))}
        </div>
      </div>
    </div>
  );
}