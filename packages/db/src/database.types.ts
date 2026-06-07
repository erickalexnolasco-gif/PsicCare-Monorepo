//packages/db/src/database.types.ts
// Hand-crafted types matching /packages/db/migrations/0001_init.sql
// In production: `yarn db:types` to auto-generate from your Supabase project.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; slug: string; plan: "free" | "pro"; created_at: string };
        Insert: { id?: string; name: string; slug: string; plan?: "free" | "pro"; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      
      // 👇 AGREGADO: Tabla 'plans' que estaba en el SQL pero no en tus tipos
      plans: {
        Row: { id: string; nombre: "free" | "pro"; display_name: string; precio_centavos: number; intervalo_billing: "monthly" | "yearly"; limite_pacientes: number | null; features: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["plans"]["Row"]> & { nombre: "free" | "pro"; display_name: string };
        Update: Partial<Database["public"]["Tables"]["plans"]["Row"]>;
        Relationships: [];
      };

      psicologas: {
        Row: {
          id: string; organization_id: string; email: string; nombre: string;
          cedula: string | null; foto_url: string | null;
          duracion_default: number; horario_inicio: string; horario_fin: string; timezone: string;
          created_at: string; updated_at: string;
        };
        Insert: {
          id: string; organization_id: string; email: string; nombre: string;
          cedula?: string | null; foto_url?: string | null;
          duracion_default?: number; horario_inicio?: string; horario_fin?: string; timezone?: string;
        };
        Update: Partial<Database["public"]["Tables"]["psicologas"]["Insert"]>;
        Relationships: [];
      };

      pacientes: {
        Row: {
          id: string; organization_id: string; owner_id: string;
          nombre: string; edad: number | null; telefono: string | null; email: string | null;
          modalidad: "presencial" | "online" | "mixta";
          estado: "activo" | "pausa" | "alta";
          color: string; motivo_consulta: string; notas_generales: string;
          fecha_nacimiento: string | null; direccion: string | null; contacto_emergencia: string | null;
          fecha_inicio: string; created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["pacientes"]["Row"]> & { nombre: string; organization_id: string; owner_id: string };
        Update: Partial<Database["public"]["Tables"]["pacientes"]["Row"]>;
        Relationships: [];
      };

      sesiones: {
        Row: {
          id: string; organization_id: string; owner_id: string; paciente_id: string;
          fecha: string; duracion: number;
          tipo: "presencial" | "online";
          estado: "programada" | "completada" | "cancelada" | "no_asistio";
          notas_previas: string; notas_sesion: string;
          estado_animo: number | null; proxima_sesion: string;
          google_event_id: string | null;
          created_at: string; updated_at: string; deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["sesiones"]["Row"]> & { paciente_id: string; fecha: string; organization_id: string; owner_id: string };
        Update: Partial<Database["public"]["Tables"]["sesiones"]["Row"]>;
        Relationships: [];
      };

      tasks: {
        Row: {
          id: string; organization_id: string; owner_id: string; paciente_id: string;
          titulo: string; descripcion: string; notas: string;
          estado: "pendiente" | "visto"; orden: number;
          sesion_id: string | null;
          subtareas: Json; // 👇 AGREGADO: Nuestra magia JSONB
          created_at: string; updated_at: string; 
          deleted_at: string | null; // 👇 AGREGADO: Para Soft Deletes que pusimos en SQL
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & { titulo: string; paciente_id: string; organization_id: string; owner_id: string };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };

      subscriptions: {
        Row: { id: string; organization_id: string; plan_id: string; estado: string; ciclo: string; mp_subscription_id: string | null; fecha_inicio: string; fecha_fin: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & { organization_id: string; plan_id: string; estado: string; ciclo: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };

      recordatorios: {
        Row: { id: string; organization_id: string; sesion_id: string; canal: string; programado_para: string; enviado_en: string | null; estado: string; mensaje: string; intentos: number; error: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["recordatorios"]["Row"]> & { organization_id: string; sesion_id: string; canal: string; programado_para: string };
        Update: Partial<Database["public"]["Tables"]["recordatorios"]["Row"]>;
        Relationships: [];
      };

      archivos: {
        Row: { 
          id: string; organization_id: string; owner_id: string; paciente_id: string; 
          nombre: string; 
          tipo: "consentimiento" | "evaluacion" | "reporte" | "otro"; // 👇 AGREGADO: Faltaba el tipo unificado
          storage_path: string; mime: string | null; size_bytes: number | null; created_at: string 
        };
        Insert: Partial<Database["public"]["Tables"]["archivos"]["Row"]> & { organization_id: string; owner_id: string; paciente_id: string; nombre: string; storage_path: string };
        Update: Partial<Database["public"]["Tables"]["archivos"]["Row"]>;
        Relationships: [];
      };

      // 👇 ACTUALIZADO: Renombrado a audit_logs (en plural) y con las columnas en español para coincidir con SQL
      audit_logs: {
        Row: { id: string; organization_id: string; actor_id: string | null; accion: string; entidad: string; entidad_id: string | null; metadata: Json | null; ip: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & { organization_id: string; accion: string; entidad: string };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
        Relationships: [];
      };

      payments: {
        Row: { id: string; organization_id: string; subscription_id: string | null; monto_mxn: number; estado: string; mp_payment_id: string | null; metadata: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & { organization_id: string; monto_mxn: number; estado: string };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };

      // 👇 AGREGADO: Stub de Google Calendar que estaba en SQL pero no en TypeScript
      google_calendar_tokens: {
        Row: { id: string; psicologa_id: string; access_token: string; refresh_token: string; expires_at: string; scope: string; calendar_id: string; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["google_calendar_tokens"]["Row"]> & { psicologa_id: string; access_token: string; refresh_token: string; expires_at: string; scope: string };
        Update: Partial<Database["public"]["Tables"]["google_calendar_tokens"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}