import { createClient } from "@psicare/db/server";
import { PatientsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psico = (await supabase.from("psicologas").select("organization_id, organizations(plan)").eq("id", user!.id).single()).data as any;

  const { data: patients } = await supabase
    .from("pacientes")
    .select("*")
    .eq("organization_id", psico.organization_id)
    .is("deleted_at", null)
    .order("nombre");

  return <PatientsClient patients={patients ?? []} plan={psico.organizations.plan} />;
}
