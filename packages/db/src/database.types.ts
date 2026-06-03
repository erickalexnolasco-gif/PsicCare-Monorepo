// Hand-crafted types matching /app/v2/packages/db/migrations/0001_init.sql
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
          created_at: string; updated_at: string;
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
        Row: { id: string; organization_id: string; owner_id: string; paciente_id: string; nombre: string; storage_path: string; mime: string | null; size_bytes: number | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["archivos"]["Row"]> & { organization_id: string; owner_id: string; paciente_id: string; nombre: string; storage_path: string };
        Update: Partial<Database["public"]["Tables"]["archivos"]["Row"]>;
        Relationships: [];
      };
      audit_log: {
        Row: { id: string; organization_id: string; actor_id: string | null; entity: string; entity_id: string | null; action: string; diff: Json | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["audit_log"]["Row"]> & { organization_id: string; entity: string; action: string };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: { id: string; organization_id: string; subscription_id: string | null; monto_mxn: number; estado: string; mp_payment_id: string | null; metadata: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & { organization_id: string; monto_mxn: number; estado: string };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
