//apps/app/src/app/(dashboard)/patients/[id]/page.tsx
import { Suspense } from "react";
import { createClient } from "@psicare/db/server";
import { notFound } from "next/navigation";
import { PatientProfileClient } from "./client";

export const dynamic = "force-dynamic";

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (Carga Instantánea)
// ==========================================
export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<PatientSkeleton />}>
      <PatientDataLoader id={id} />
    </Suspense>
  );
}

// ==========================================
// 🧩 CREADOR DE DATOS (Espera a Supabase)
// ==========================================
async function PatientDataLoader({ id }: { id: string }) {
  const supabase = await createClient();
  
  const [{ data: paciente }, { data: tasks }, { data: sesiones }] = await Promise.all([
    supabase.from("pacientes").select("*").eq("id", id).maybeSingle(),
    supabase.from("tasks").select("*").eq("paciente_id", id).order("orden"),
    supabase.from("sesiones").select("*").eq("paciente_id", id).is("deleted_at", null).order("fecha", { ascending: false }),
  ]);
  
  if (!paciente) notFound();
  
  return <PatientProfileClient paciente={paciente} initialTasks={tasks ?? []} sesiones={sesiones ?? []} />;
}

// ==========================================
// 🦴 SKELETON LOADER (El molde vacío del expediente)
// ==========================================
function PatientSkeleton() {
  return (
    <div className="animate-pulse fade-in">
      {/* Botón de regresar */}
      <div className="h-5 w-24 bg-gray-200 rounded mb-6"></div>

      {/* Encabezado del Paciente */}
      <div className="card-soft p-7 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gray-200 rounded-full shrink-0"></div>
          {/* Info principal */}
          <div className="flex-1 mt-1">
            <div className="h-10 bg-gray-200 rounded w-64 mb-3"></div>
            <div className="flex gap-3">
              <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              <div className="h-5 bg-gray-200 rounded-full w-20"></div>
              <div className="h-5 bg-gray-200 rounded-full w-24"></div>
            </div>
          </div>
          {/* Botón de borrar */}
          <div className="w-8 h-8 bg-gray-100 rounded shrink-0"></div>
        </div>
      </div>

      {/* Pestañas (Tabs) */}
      <div className="flex gap-2 max-w-lg mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-gray-200 rounded-xl flex-1"></div>
        ))}
      </div>

      {/* Contenido (Simulando la pestaña de 'Datos') */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map(i => (
          <div key={i} className="card-soft p-6">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}