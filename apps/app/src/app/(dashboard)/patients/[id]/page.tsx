import { createClient } from "@psicare/db/server";
import { notFound } from "next/navigation";
import { PatientProfileClient } from "./client";

export const dynamic = "force-dynamic";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: paciente }, { data: tasks }, { data: sesiones }] = await Promise.all([
    supabase.from("pacientes").select("*").eq("id", id).maybeSingle(),
    supabase.from("tasks").select("*").eq("paciente_id", id).order("orden"),
    supabase.from("sesiones").select("*").eq("paciente_id", id).is("deleted_at", null).order("fecha", { ascending: false }),
  ]);
  if (!paciente) notFound();
  return <PatientProfileClient paciente={paciente} initialTasks={tasks ?? []} sesiones={sesiones ?? []} />;
}
