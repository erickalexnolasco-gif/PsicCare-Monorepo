# 🌸 PsiCare

SaaS de gestión clínica para psicólogas en México.  
Monorepo con Turborepo · Next.js 14 · TypeScript · Supabase · Tailwind CSS

---

## Apps

| App | Puerto | Descripción |
|-----|--------|-------------|
| `apps/app` | 3000 | Web app principal (dashboard, pacientes, calendario) |
| `apps/marketing` | 3001 | Landing page pública con SEO |

## Packages

| Package | Descripción |
|---------|-------------|
| `@psicare/db` | Supabase client (browser + server + middleware) |
| `@psicare/types` | Schemas Zod + TypeScript types (fuente de verdad) |
| `@psicare/ui` | Utilidades compartidas (cn, formatDate, helpers) |
| `@psicare/billing` | Feature flags y lógica de planes |
| `@psicare/jobs` | Stub para background jobs (Trigger.dev futuro) |

---

## Requisitos

- Node.js >= 18.17
- Yarn 1.22.x
- Cuenta en [Supabase](https://supabase.com) (gratis)

---

## Setup en 5 pasos

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/psicare.git
cd psicare
yarn install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
# Editar .env.local con tus keys de Supabase
```

### 3. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar `Project URL` y `anon key` a `.env.local`
3. En **SQL Editor** → ejecutar `packages/db/migrations/0001_init.sql`
4. En **Storage** → crear bucket `expedientes` (privado)

### 4. Correr en desarrollo

```bash
yarn dev:app        # http://localhost:3000
yarn dev:marketing  # http://localhost:3001
```

### 5. Crear tu cuenta

- Ir a http://localhost:3000/signup
- El trigger de Supabase crea automáticamente: organización + perfil + suscripción free

---

## GitHub Codespaces

Este repo incluye `.devcontainer/devcontainer.json`. Al abrir en Codespaces:

1. El entorno se configura automáticamente
2. `yarn install` corre solo
3. El puerto 3000 se abre en el navegador
4. Solo necesitas configurar `.env.local` con tus keys de Supabase

---

## Estructura

```
psicare/
├── apps/
│   ├── app/          ← Next.js 14 App Router (web app)
│   └── marketing/    ← Next.js (landing pública)
├── packages/
│   ├── db/           ← Supabase clients
│   ├── types/        ← Zod schemas + TS types
│   ├── ui/           ← Utilidades compartidas
│   ├── billing/      ← Lógica de planes
│   └── jobs/         ← Stub de background jobs
├── .devcontainer/    ← GitHub Codespaces config
├── turbo.json
└── package.json
```

---

## Deploy

### Web App → Vercel

```bash
# En Vercel Dashboard:
# Root Directory: apps/app
# Build Command: cd ../.. && yarn build --filter=@psicare/app
# Install Command: yarn install
# Agregar todas las variables de .env.local
```

### Marketing → Vercel

```bash
# Root Directory: apps/marketing
# Build Command: cd ../.. && yarn build --filter=@psicare/marketing
```

---

## Tecnologías

- **Framework**: Next.js 14 (App Router, Server Actions, Server Components)
- **Auth + DB**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Estilos**: Tailwind CSS + CSS variables personalizadas
- **Estado**: TanStack Query
- **Formularios**: React Hook Form + Zod
- **Monorepo**: Turborepo + Yarn Workspaces
- **Tipado**: TypeScript strict

---

*Hecho con 🌸 en México*
