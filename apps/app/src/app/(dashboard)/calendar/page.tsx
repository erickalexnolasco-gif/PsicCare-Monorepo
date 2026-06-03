import { createClient } from "@psicare/db/server";
import { CalendarClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psico = (await supabase.from("psicologas").select("organization_id").eq("id", user!.id).single()).data!;

  const [{ data: sesiones }, { data: pacientes }] = await Promise.all([
    supabase.from("sesiones").select("*").eq("organization_id", psico.organization_id).is("deleted_at", null).order("fecha"),
    supabase.from("pacientes").select("id, nombre, color, modalidad").eq("organization_id", psico.organization_id).is("deleted_at", null).order("nombre"),
  ]);

  return <CalendarClient sesiones={sesiones ?? []} pacientes={pacientes ?? []} />;
}
