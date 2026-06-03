-- PsiCare — schema PostgreSQL completo para Supabase
-- Multi-tenant con organization_id + owner_id
-- Row Level Security en todas las tablas
-- Soft deletes + audit log + updated_at triggers

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Get current user's organization
create or replace function public.current_org_id() returns uuid as $$
  select organization_id from public.psicologas where id = auth.uid()
$$ language sql security definer stable;

-- ============================================================
-- ORGANIZATIONS (tenant)
-- ============================================================
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- PSICOLOGAS (extends auth.users)
-- ============================================================
create table if not exists public.psicologas (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  nombre text not null,
  cedula text,
  foto_url text,
  duracion_default integer not null default 50,
  horario_inicio text not null default '09:00',
  horario_fin text not null default '19:00',
  timezone text not null default 'America/Mexico_City',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger psicologas_updated_at before update on public.psicologas for each row execute function public.set_updated_at();

-- ============================================================
-- PACIENTES
-- ============================================================
create table if not exists public.pacientes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.psicologas(id) on delete cascade,
  nombre text not null,
  edad integer,
  telefono text,
  email text,
  modalidad text not null default 'presencial' check (modalidad in ('presencial','online','mixta')),
  estado text not null default 'activo' check (estado in ('activo','pausa','alta')),
  color text not null default '#E8A0BF',
  motivo_consulta text not null default '',
  notas_generales text not null default '',
  fecha_nacimiento text,
  direccion text,
  contacto_emergencia text,
  fecha_inicio timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists pacientes_org_idx on public.pacientes(organization_id) where deleted_at is null;
create index if not exists pacientes_owner_idx on public.pacientes(owner_id) where deleted_at is null;
create trigger pacientes_updated_at before update on public.pacientes for each row execute function public.set_updated_at();

-- ============================================================
-- SESIONES
-- ============================================================
create table if not exists public.sesiones (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.psicologas(id) on delete cascade,
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  fecha timestamptz not null,
  duracion integer not null default 50,
  tipo text not null default 'presencial' check (tipo in ('presencial','online')),
  estado text not null default 'programada' check (estado in ('programada','completada','cancelada','no_asistio')),
  notas_previas text not null default '',
  notas_sesion text not null default '',
  estado_animo integer check (estado_animo between 1 and 5),
  proxima_sesion text not null default '',
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists sesiones_org_fecha_idx on public.sesiones(organization_id, fecha) where deleted_at is null;
create index if not exists sesiones_paciente_idx on public.sesiones(paciente_id) where deleted_at is null;
create trigger sesiones_updated_at before update on public.sesiones for each row execute function public.set_updated_at();

-- ============================================================
-- TASKS (Plan de Intervención)
-- ============================================================
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.psicologas(id) on delete cascade,
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  titulo text not null,
  descripcion text not null default '',
  notas text not null default '',
  estado text not null default 'pendiente' check (estado in ('pendiente','visto')),
  orden integer not null default 0,
  sesion_id uuid references public.sesiones(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_paciente_idx on public.tasks(paciente_id, orden);
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();

-- ============================================================
-- RECORDATORIOS (jobs queue para WhatsApp/email)
-- ============================================================
create table if not exists public.recordatorios (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sesion_id uuid not null references public.sesiones(id) on delete cascade,
  canal text not null check (canal in ('whatsapp','email','sms')),
  programado_para timestamptz not null,
  enviado_en timestamptz,
  estado text not null default 'pendiente' check (estado in ('pendiente','enviado','fallido')),
  mensaje text not null default '',
  intentos integer not null default 0,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists recordatorios_pendientes_idx on public.recordatorios(estado, programado_para) where estado = 'pendiente';

-- ============================================================
-- ARCHIVOS (expediente)
-- ============================================================
create table if not exists public.archivos (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.psicologas(id) on delete cascade,
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  nombre text not null,
  storage_path text not null,
  mime text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BILLING
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id text not null,
  estado text not null check (estado in ('activa','cancelada','pago_pendiente','expirada')),
  ciclo text not null check (ciclo in ('mensual','anual')),
  mp_subscription_id text,
  fecha_inicio timestamptz not null default now(),
  fecha_fin timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  monto_mxn integer not null,
  estado text not null,
  mp_payment_id text unique,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- AUDIT LOG (trazabilidad clínica)
-- ============================================================
create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null,
  actor_id uuid,
  entity text not null,
  entity_id uuid,
  action text not null,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_org_idx on public.audit_log(organization_id, created_at desc);

-- ============================================================
-- RLS POLICIES — tenant isolation
-- ============================================================
alter table public.organizations enable row level security;
alter table public.psicologas enable row level security;
alter table public.pacientes enable row level security;
alter table public.sesiones enable row level security;
alter table public.tasks enable row level security;
alter table public.recordatorios enable row level security;
alter table public.archivos enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.audit_log enable row level security;

-- Organizations
create policy "org_self_read" on public.organizations for select
  using (id = public.current_org_id());

-- Psicologas
create policy "psico_self_read" on public.psicologas for select
  using (organization_id = public.current_org_id());
create policy "psico_self_update" on public.psicologas for update
  using (id = auth.uid());
create policy "psico_self_insert" on public.psicologas for insert
  with check (id = auth.uid());

-- Pacientes
create policy "pacientes_org_select" on public.pacientes for select
  using (organization_id = public.current_org_id() and deleted_at is null);
create policy "pacientes_org_insert" on public.pacientes for insert
  with check (organization_id = public.current_org_id() and owner_id = auth.uid());
create policy "pacientes_org_update" on public.pacientes for update
  using (organization_id = public.current_org_id());
create policy "pacientes_org_delete" on public.pacientes for delete
  using (organization_id = public.current_org_id());

-- Sesiones
create policy "sesiones_org_select" on public.sesiones for select
  using (organization_id = public.current_org_id() and deleted_at is null);
create policy "sesiones_org_insert" on public.sesiones for insert
  with check (organization_id = public.current_org_id() and owner_id = auth.uid());
create policy "sesiones_org_update" on public.sesiones for update
  using (organization_id = public.current_org_id());
create policy "sesiones_org_delete" on public.sesiones for delete
  using (organization_id = public.current_org_id());

-- Tasks
create policy "tasks_org_select" on public.tasks for select
  using (organization_id = public.current_org_id());
create policy "tasks_org_insert" on public.tasks for insert
  with check (organization_id = public.current_org_id() and owner_id = auth.uid());
create policy "tasks_org_update" on public.tasks for update
  using (organization_id = public.current_org_id());
create policy "tasks_org_delete" on public.tasks for delete
  using (organization_id = public.current_org_id());

-- Recordatorios
create policy "rec_org_all" on public.recordatorios for all
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- Archivos
create policy "archivos_org_all" on public.archivos for all
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- Subscriptions / Payments (read-only para el cliente; service_role escribe)
create policy "sub_org_select" on public.subscriptions for select
  using (organization_id = public.current_org_id());
create policy "pay_org_select" on public.payments for select
  using (organization_id = public.current_org_id());

-- Audit log
create policy "audit_org_select" on public.audit_log for select
  using (organization_id = public.current_org_id());

-- ============================================================
-- AUTO-PROVISION on signup
-- Trigger que crea organization + psicologa al registrarse un user
-- ============================================================
create or replace function public.handle_new_user() returns trigger as $$
declare
  new_org_id uuid;
  nombre_meta text;
begin
  nombre_meta := coalesce(new.raw_user_meta_data->>'nombre', new.email);
  insert into public.organizations (name, slug)
    values (nombre_meta, lower(replace(nombre_meta, ' ', '-')) || '-' || substring(new.id::text, 1, 8))
    returning id into new_org_id;
  insert into public.psicologas (id, organization_id, email, nombre)
    values (new.id, new_org_id, new.email, nombre_meta);
  insert into public.subscriptions (organization_id, plan_id, estado, ciclo)
    values (new_org_id, 'free', 'activa', 'mensual');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- STORAGE BUCKET (run manually in Supabase Dashboard)
-- ============================================================
-- 1. Storage > New bucket > "expedientes" (private)
-- 2. Policy: authenticated can SELECT/INSERT/DELETE where path starts with their org_id
