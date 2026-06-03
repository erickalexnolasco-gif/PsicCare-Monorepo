"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@psicare/db/server";
import { PLANS, canAddPaciente } from "@psicare/billing";
import { emit } from "@psicare/jobs";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: psicologa } = await supabase.from("psicologas").select("*, organizations(*)").eq("id", user.id).single();
  if (!psicologa) throw new Error("Perfil no encontrado");
  return { supabase, user, psicologa: psicologa as any };
}

/* ===== Pacientes ===== */
export async function createPaciente(data: any) {
  const { supabase, user, psicologa } = await getContext();

  // Plan limit check
  const orgPlan = PLANS.find((p) => p.id === psicologa.organizations.plan)!;
  const { count } = await supabase.from("pacientes").select("id", { count: "exact", head: true }).eq("organization_id", psicologa.organization_id).is("deleted_at", null);
  const limit = canAddPaciente(count ?? 0, orgPlan);
  if (!limit.allowed) return { error: limit.reason };

  const { data: paciente, error } = await supabase.from("pacientes").insert({
    ...data,
    organization_id: psicologa.organization_id,
    owner_id: user.id,
  }).select().single();
  if (error) return { error: error.message };
  revalidatePath("/patients");
  return { data: paciente };
}

export async function updatePaciente(id: string, data: any) {
  const { supabase } = await getContext();
  const { error } = await supabase.from("pacientes").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return { ok: true };
}

export async function deletePaciente(id: string) {
  const { supabase } = await getContext();
  // Soft delete
  const { error } = await supabase.from("pacientes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/patients");
  return { ok: true };
}

/* ===== Tasks ===== */
export async function createTask(paciente_id: string, titulo: string) {
  const { supabase, user, psicologa } = await getContext();
  const { count } = await supabase.from("tasks").select("id", { count: "exact", head: true }).eq("paciente_id", paciente_id);
  const { error } = await supabase.from("tasks").insert({
    paciente_id, titulo,
    organization_id: psicologa.organization_id,
    owner_id: user.id,
    orden: count ?? 0,
  });
  if (error) return { error: error.message };
  revalidatePath(`/patients/${paciente_id}`);
  return { ok: true };
}

export async function updateTask(id: string, data: any) {
  const { supabase } = await getContext();
  const { error } = await supabase.from("tasks").update(data).eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteTask(id: string) {
  const { supabase } = await getContext();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function reorderTasks(items: { id: string; orden: number }[]) {
  const { supabase } = await getContext();
  await Promise.all(items.map((i) => supabase.from("tasks").update({ orden: i.orden }).eq("id", i.id)));
  return { ok: true };
}

/* ===== Sesiones ===== */
export async function createSesion(data: any) {
  const { supabase, user, psicologa } = await getContext();
  const { data: sesion, error } = await supabase.from("sesiones").insert({
    ...data,
    organization_id: psicologa.organization_id,
    owner_id: user.id,
  }).select().single();
  if (error) return { error: error.message };

  // Emit event for jobs (recordatorios, gcal sync)
  await emit({ type: "SESSION_CREATED", payload: { sesion_id: sesion!.id, organization_id: psicologa.organization_id } });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { data: sesion };
}

export async function updateSesion(id: string, data: any) {
  const { supabase } = await getContext();
  const { error } = await supabase.from("sesiones").update(data).eq("id", id);
  if (error) return { error: error.message };

  // Update tasks vistas if present
  if (data.tareas_vistas?.length) {
    await Promise.all((data.tareas_vistas as string[]).map((tid) =>
      supabase.from("tasks").update({ estado: "visto", sesion_id: id }).eq("id", tid)
    ));
  }

  await emit({ type: "SESSION_UPDATED", payload: { sesion_id: id } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteSesion(id: string) {
  const { supabase } = await getContext();
  const { error } = await supabase.from("sesiones").update({ deleted_at: new Date().toISOString(), estado: "cancelada" }).eq("id", id);
  if (error) return { error: error.message };
  await emit({ type: "SESSION_CANCELLED", payload: { sesion_id: id } });
  revalidatePath("/calendar");
  return { ok: true };
}

/* ===== Settings ===== */
export async function updatePsicologa(data: any) {
  const { supabase, user } = await getContext();
  const { error } = await supabase.from("psicologas").update(data).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}
