// apps/app/src/app/(dashboard)/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@psicare/db/server";
import { PLANS, canAddPaciente } from "@psicare/billing";
import { emit } from "@psicare/jobs";

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: psicologa } = await supabase
    .from("psicologas")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();
  if (!psicologa) throw new Error("Perfil no encontrado");
  return { supabase, user, psicologa: psicologa as any };
}

/* ===== Pacientes ===== */
export async function createPaciente(data: any) {
  const { supabase, user, psicologa } = await getContext();

  // Plan limit check — con guard explícito
  const orgPlan = PLANS.find((p) => p.id === psicologa.organizations?.plan);
  if (!orgPlan) return { error: "Plan no encontrado" };

  const { count } = await supabase
    .from("pacientes")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", psicologa.organization_id)
    .is("deleted_at", null);

  const limit = canAddPaciente(count ?? 0, orgPlan);
  if (!limit.allowed) return { error: limit.reason };

  const { data: paciente, error } = await supabase
    .from("pacientes")
    .insert({
      nombre: data.nombre,
      edad: data.edad ?? null,
      telefono: data.telefono || null,
      email: data.email || null,
      modalidad: data.modalidad ?? "presencial",
      estado: data.estado ?? "activo",
      color: data.color ?? "#E8A0BF",
      motivo_consulta: data.motivo_consulta ?? "",
      notas_generales: data.notas_generales ?? "",
      fecha_nacimiento: data.fecha_nacimiento || null,
      direccion: data.direccion || null,
      contacto_emergencia: data.contacto_emergencia || null,
      organization_id: psicologa.organization_id,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/patients");
  return { data: paciente };
}

export async function updatePaciente(id: string, data: any) {
  const { supabase } = await getContext();
  const { error } = await supabase
    .from("pacientes")
    .update({
      nombre: data.nombre,
      edad: data.edad ?? null,
      telefono: data.telefono || null,
      email: data.email || null,
      modalidad: data.modalidad,
      estado: data.estado,
      color: data.color,
      motivo_consulta: data.motivo_consulta ?? "",
      notas_generales: data.notas_generales ?? "",
      fecha_nacimiento: data.fecha_nacimiento || null,
      direccion: data.direccion || null,
      contacto_emergencia: data.contacto_emergencia || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return { ok: true };
}

export async function deletePaciente(id: string) {
  const { supabase } = await getContext();
  const now = new Date().toISOString();

  // Soft-delete las sesiones futuras del paciente también
  await supabase
    .from("sesiones")
    .update({ deleted_at: now, estado: "cancelada" })
    .eq("paciente_id", id)
    .gte("fecha", now)
    .is("deleted_at", null);

  // Soft-delete el paciente
  const { error } = await supabase
    .from("pacientes")
    .update({ deleted_at: now })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/patients");
  revalidatePath("/calendar");
  return { ok: true };
}

/* ===== Tasks ===== */
export async function createTask(paciente_id: string, titulo: string) {
  const { supabase, user, psicologa } = await getContext();
  if (!titulo.trim()) return { error: "El título no puede estar vacío" };

  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("paciente_id", paciente_id);

  const { error } = await supabase.from("tasks").insert({
    paciente_id,
    titulo: titulo.trim(),
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
  // Upsert batch en lugar de N updates individuales
  const { error } = await supabase.from("tasks").upsert(
    items.map((i) => ({ id: i.id, orden: i.orden })),
    { onConflict: "id" }
  );
  if (error) return { error: error.message };
  return { ok: true };
}

/* ===== Sesiones ===== */
export async function createSesion(data: any) {
  const { supabase, user, psicologa } = await getContext();

  // Validación básica
  if (!data.paciente_id) return { error: "Selecciona un paciente" };
  if (!data.fecha) return { error: "La fecha es requerida" };

  // Verificar que la fecha sea válida
  const fechaDate = new Date(data.fecha);
  if (isNaN(fechaDate.getTime())) return { error: "Fecha inválida" };

  const { data: sesion, error } = await supabase
    .from("sesiones")
    .insert({
      paciente_id: data.paciente_id,
      fecha: data.fecha,
      duracion: data.duracion ?? 50,
      tipo: data.tipo ?? "presencial",
      notas_previas: data.notas_previas ?? "",
      organization_id: psicologa.organization_id,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await emit({
    type: "SESSION_CREATED",
    payload: {
      sesion_id: sesion!.id,
      organization_id: psicologa.organization_id,
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { data: sesion };
}

export async function updateSesion(id: string, data: any) {
  const { supabase } = await getContext();

  const { error } = await supabase
    .from("sesiones")
    .update({
      estado: data.estado,
      notas_sesion: data.notas_sesion ?? "",
      estado_animo: data.estado_animo ?? null,
      proxima_sesion: data.proxima_sesion ?? "",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Marcar tareas como vistas si se seleccionaron
  if (data.tareas_vistas?.length) {
    await Promise.all(
      (data.tareas_vistas as string[]).map((tid) =>
        supabase
          .from("tasks")
          .update({ estado: "visto", sesion_id: id })
          .eq("id", tid)
      )
    );
  }

  await emit({ type: "SESSION_UPDATED", payload: { sesion_id: id } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteSesion(id: string) {
  const { supabase } = await getContext();
  const { error } = await supabase
    .from("sesiones")
    .update({ deleted_at: new Date().toISOString(), estado: "cancelada" })
    .eq("id", id);
  if (error) return { error: error.message };
  await emit({ type: "SESSION_CANCELLED", payload: { sesion_id: id } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}

/* ===== Settings ===== */
export async function updatePsicologa(data: any) {
  const { supabase, user } = await getContext();
  const { error } = await supabase
    .from("psicologas")
    .update({
      nombre: data.nombre,
      cedula: data.cedula || null,
      duracion_default: data.duracion_default,
      horario_inicio: data.horario_inicio,
      horario_fin: data.horario_fin,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}