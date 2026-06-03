# Setup Detallado — PsiCare

## Supabase

### 1. Crear proyecto
1. Ve a https://supabase.com/dashboard → **New project**
2. Nombre: `psicare-prod` (o el que quieras)
3. Región: **South America (São Paulo)** — más cercana a México
4. Guarda la contraseña de la base de datos en un lugar seguro

### 2. Obtener credenciales
1. Ve a **Settings → API**
2. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (**nunca al frontend**)

### 3. Ejecutar migraciones
1. Ve a **SQL Editor** → **New query**
2. Pega el contenido de `packages/db/migrations/0001_init.sql`
3. Haz click en **Run**

Esto crea:
- Tablas: `organizations`, `psicologas`, `pacientes`, `sesiones`, `tasks`, `recordatorios`, `archivos`, `subscriptions`, `payments`, `audit_log`
- Trigger `on_auth_user_created` → crea automáticamente organización + perfil + suscripción free al registrarse
- RLS (Row Level Security) en todas las tablas
- Índices de rendimiento

### 4. Crear bucket de Storage
1. Ve a **Storage** → **New bucket**
2. Nombre: `expedientes`
3. Public bucket: **NO** (privado)
4. Click **Save**

### 5. Configurar Auth
1. Ve a **Auth → URL Configuration**
2. Site URL: `http://localhost:3000` (cambiar a producción después)
3. Redirect URLs: agregar `http://localhost:3000/**`

---

## .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3001
```

---

## Verificar que funciona

Después del setup, ir a http://localhost:3000/signup y crear una cuenta.

Si ves "Configurando tu cuenta..." y no redirige, significa que el trigger no se ejecutó correctamente. Verifica:
1. Que corriste el SQL completo de `0001_init.sql`
2. Que no hay errores en **Database → Functions** (`handle_new_user`)

---

## Generar types de Supabase (opcional pero recomendado)

Cuando tu schema esté estable:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Generar types
SUPABASE_PROJECT_REF=tu_project_ref yarn db:types
```

Esto reemplaza `packages/db/src/database.types.ts` con types generados automáticamente de tu schema real.
