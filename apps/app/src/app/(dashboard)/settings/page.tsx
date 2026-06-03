import { createClient } from "@psicare/db/server";
import { SettingsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: psico } = await supabase.from("psicologas").select("*").eq("id", user!.id).single();
  return <SettingsClient psicologa={psico!} />;
}
