//packages/types/src/index.ts
import { z } from "zod";

/* ===== Auth & Organization ===== */
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  slug: z.string(),
  plan: z.enum(["free", "pro"]).default("free"),
  created_at: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const PsicologaSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  email: z.string().email(),
  nombre: z.string().min(2, "Nombre requerido"),
  cedula: z.string().optional().nullable(),
  foto_url: z.string().url().optional().nullable(),
  duracion_default: z.number().int().min(15).max(180).default(50),
  horario_inicio: z.string().default("09:00"),
  horario_fin: z.string().default("19:00"),
  timezone: z.string().default("America/Mexico_City"),
});
export type Psicologa = z.infer<typeof PsicologaSchema>;

/* ===== Pacientes ===== */
export const PacienteSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  nombre: z.string().min(2, "Nombre requerido"),
  edad: z.number().int().min(0).max(150).optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  modalidad: z.enum(["presencial", "online", "mixta"]).default("presencial"),
  estado: z.enum(["activo", "pausa", "alta"]).default("activo"),
  color: z.string().default("#E8A0BF"),
  motivo_consulta: z.string().default(""),
  notas_generales: z.string().default(""),
  // 👇 CAMBIO APLICADO: Forzamos formato YYYY-MM-DD para la base de datos
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato debe ser YYYY-MM-DD").optional().nullable(),
  direccion: z.string().optional().nullable(),
  contacto_emergencia: z.string().optional().nullable(),
  fecha_inicio: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});
export type Paciente = z.infer<typeof PacienteSchema>;

export const PacienteCreateSchema = PacienteSchema.pick({
  nombre: true, edad: true, telefono: true, email: true,
  modalidad: true, estado: true, color: true, motivo_consulta: true,
  notas_generales: true, fecha_nacimiento: true, direccion: true, contacto_emergencia: true,
}).partial({ edad: true, telefono: true, email: true, notas_generales: true, fecha_nacimiento: true, direccion: true, contacto_emergencia: true });
export type PacienteCreate = z.infer<typeof PacienteCreateSchema>;

/* ===== Sesiones / Citas ===== */
export const SesionSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  paciente_id: z.string().uuid(),
  // 👇 CAMBIO APLICADO: Obligamos a que la fecha incluya Timezone (ISO)
  fecha: z.string().datetime(), 
  duracion: z.number().int().min(15).max(180).default(50),
  tipo: z.enum(["presencial", "online"]).default("presencial"),
  estado: z.enum(["programada", "completada", "cancelada", "no_asistio"]).default("programada"),
  notas_previas: z.string().default(""),
  notas_sesion: z.string().default(""),
  estado_animo: z.number().int().min(1).max(5).nullable(),
  proxima_sesion: z.string().default(""),
  google_event_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});
export type Sesion = z.infer<typeof SesionSchema>;

export const SesionCreateSchema = z.object({
  paciente_id: z.string().uuid("Selecciona un paciente"),
  fecha: z.string().datetime({ message: "Debe ser una fecha válida con hora" }),
  duracion: z.number().int().min(15).max(180).default(50),
  tipo: z.enum(["presencial", "online"]).default("presencial"),
  notas_previas: z.string().optional().default(""),
});
export type SesionCreate = z.infer<typeof SesionCreateSchema>;

/* ===== Plan de Intervención (Tasks + Subtareas JSONB) ===== */
export const SubtareaSchema = z.object({
  id: z.string(), // ID autogenerado en frontend (ej. crypto.randomUUID)
  titulo: z.string().min(1, "La tarea no puede estar vacía"),
  completado: z.boolean().default(false),
  vista_en_sesion_id: z.string().uuid().nullable().optional(),
});
export type Subtarea = z.infer<typeof SubtareaSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  paciente_id: z.string().uuid(),
  titulo: z.string().min(1),
  descripcion: z.string().default(""),
  notas: z.string().default(""),
  estado: z.enum(["pendiente", "visto"]).default("pendiente"),
  orden: z.number().int().default(0),
  sesion_id: z.string().uuid().nullable(),
  // 👇 CAMBIO APLICADO: Arreglo de subtareas listo para guardarse como JSONB
  subtareas: z.array(SubtareaSchema).default([]), 
  created_at: z.string(),
  updated_at: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;

/* ===== Archivos (Nuevo Esquema Unificado) ===== */
export const ArchivoSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  paciente_id: z.string().uuid(),
  nombre: z.string().min(1),
  tipo: z.enum(["consentimiento", "evaluacion", "reporte", "otro"]).default("otro"),
  storage_path: z.string().min(1),
  mime: z.string().optional().nullable(),
  size_bytes: z.number().optional().nullable(),
  created_at: z.string(),
});
export type Archivo = z.infer<typeof ArchivoSchema>;

/* ===== Recordatorios ===== */
export const RecordatorioSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  sesion_id: z.string().uuid(),
  canal: z.enum(["whatsapp", "email", "sms"]),
  programado_para: z.string(),
  enviado_en: z.string().nullable(),
  estado: z.enum(["pendiente", "enviado", "fallido"]).default("pendiente"),
  mensaje: z.string().default(""),
  created_at: z.string(),
});
export type Recordatorio = z.infer<typeof RecordatorioSchema>;

/* ===== Billing ===== */
export const PlanSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precio_mensual_mxn: z.number(),
  precio_anual_mxn: z.number(),
  max_pacientes: z.number().nullable(), // null = ilimitado
  features: z.array(z.string()),
});
export type Plan = z.infer<typeof PlanSchema>;

export const PLANS: Plan[] = [
  {
    id: "free",
    nombre: "Gratis",
    precio_mensual_mxn: 0,
    precio_anual_mxn: 0,
    max_pacientes: 3,
    features: ["1 paciente", "Calendario básico", "Plan de intervención"],
  },
  {
    id: "pro",
    nombre: "Pro",
    precio_mensual_mxn: 149,
    precio_anual_mxn: 1499,
    max_pacientes: null,
    features: [
      "Pacientes ilimitados",
      "Calendario completo + Google Calendar sync",
      "Recordatorios WhatsApp automáticos",
      "Notas y plantillas SOAP",
      "Estadísticas avanzadas",
      "Exportar expediente PDF",
      "Soporte prioritario",
    ],
  },
];

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  plan_id: z.string(),
  estado: z.enum(["activa", "cancelada", "pago_pendiente", "expirada"]),
  ciclo: z.enum(["mensual", "anual"]),
  mp_subscription_id: z.string().nullable(),
  fecha_inicio: z.string(),
  fecha_fin: z.string().nullable(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;