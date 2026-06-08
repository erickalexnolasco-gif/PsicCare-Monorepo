//apps/app/src/app/(dashboard)/patients/page.tsx
import { Suspense } from "react";
import { createClient } from "@psicare/db/server";
import { PatientsClient } from "./client";

export const dynamic = "force-dynamic";

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (Carga Instantánea)
// ==========================================
export default function PatientsPage() {
  return (
    <Suspense fallback={<PatientsSkeleton />}>
      <PatientsDataLoader />
    </Suspense>
  );
}

// ==========================================
// 🧩 CREADOR DE DATOS (Espera a Supabase)
// ==========================================
async function PatientsDataLoader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psico = (await supabase.from("psicologas").select("organization_id, organizations(plan)").eq("id", user!.id).single()).data as any;

  const { data: patients } = await supabase
    .from("pacientes")
    .select("*")
    .eq("organization_id", psico.organization_id)
    .is("deleted_at", null)
    .order("nombre");

  // Una vez que llegan los datos, renderizamos tu cliente interactivo
  return <PatientsClient patients={patients ?? []} plan={psico.organizations?.plan ?? "free"} />;
}

// ==========================================
// 🦴 SKELETON LOADER (El molde vacío de los pacientes)
// ==========================================
function PatientsSkeleton() {
  return (
    <div className="animate-pulse fade-in">
      {/* 1. Encabezado Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-12 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
      </div>

      {/* 2. Buscador y Filtros Skeleton */}
      <div className="card-soft p-5 mb-6 flex items-center gap-4">
        <div className="h-10 bg-gray-100 rounded-lg flex-1 border border-gray-200/50"></div>
        <div className="flex gap-2 hidden sm:flex">
          <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* 3. Cuadrícula de Tarjetas Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Renderizamos 6 tarjetas vacías simulando tu diseño */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-soft p-6">
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar circular */}
              <div className="w-14 h-14 rounded-full bg-gray-200"></div>
              {/* Nombre y Edad */}
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              {/* Badge de estado */}
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            {/* Motivo de consulta (2 líneas de texto) */}
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}