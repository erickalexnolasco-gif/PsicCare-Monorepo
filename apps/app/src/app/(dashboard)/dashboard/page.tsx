//apps/app/src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from "react";
import { createClient } from "@psicare/db/server";
import { Calendar as CalIcon, Users, CheckCircle2, Clock, ChevronRight, TrendingUp, Heart } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { formatTime, relativeTime, dayLabel } from "@psicare/ui";

export const dynamic = "force-dynamic";

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (Carga Instantánea)
// ==========================================
export default function DashboardPage() {
  return (
    <>
      <div className="mb-10 fade-up">
        {/* Usamos un Skeleton para el título para que cargue instantáneo */}
        <Suspense fallback={<HeaderSkeleton />}>
          <DashboardHeader />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-soft p-7" data-testid="today-sessions-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Sesiones de hoy</h3>
            <Link href="/calendar" className="btn-ghost text-sm">Ver calendario <ChevronRight size={14} /></Link>
          </div>
          <Suspense fallback={<SessionsListSkeleton />}>
             <TodaySessionsList />
          </Suspense>
        </div>

        <div className="card-soft p-7 flex flex-col" data-testid="next-session-card" style={{ background: "linear-gradient(135deg, rgba(253, 232, 240, 0.8), rgba(249, 212, 212, 0.5))" }}>
          <h3 className="font-display text-2xl mb-4">Próxima sesión</h3>
          <Suspense fallback={<NextSessionSkeleton />}>
            <NextSessionCard />
          </Suspense>
        </div>
      </div>
    </>
  );
}

// ==========================================
// 🧩 COMPONENTES DE DATOS (Se resuelven en paralelo sin bloquear la UI)
// ==========================================

async function DashboardHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psicologa = (await supabase.from("psicologas").select("nombre, timezone").eq("id", user!.id).single()).data;

  // 👇 ARREGLO DEL TIMEZONE: Forzamos la hora en México
  const timeZone = psicologa?.timezone || "America/Mexico_City";
  const mexicoTime = new Date().toLocaleString("en-US", { timeZone });
  const localDate = new Date(mexicoTime);
  const hour = localDate.getHours();

  let greeting = "Buenas noches";
  if (hour >= 5 && hour < 12) greeting = "Buenos días";
  else if (hour >= 12 && hour < 19) greeting = "Buenas tardes";

  const nombreCorto = psicologa!.nombre?.replace(/^Dra?\.?\s*/i, "").split(" ")[0] ?? "";

  return (
    <>
      <p className="text-sm mb-2" style={{ color: "var(--psi-soft)" }}>{dayLabel(localDate)}</p>
      <h1 className="font-display text-5xl" data-testid="dashboard-greeting">
        {greeting}, {nombreCorto} <span className="inline-block">🌸</span>
      </h1>
      <p className="mt-2" style={{ color: "var(--psi-soft)" }}>Aquí está el resumen de tu consulta de hoy.</p>
    </>
  );
}

async function DashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psicologa = (await supabase.from("psicologas").select("organization_id").eq("id", user!.id).single()).data;
  const orgId = psicologa!.organization_id;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

  const [todaySessions, allPatients, pendingTasksRes, weekSessions] = await Promise.all([
    supabase.from("sesiones").select("id", { count: "exact" }).eq("organization_id", orgId).gte("fecha", today.toISOString()).lt("fecha", tomorrow.toISOString()).is("deleted_at", null),
    supabase.from("pacientes").select("id, estado").eq("organization_id", orgId).is("deleted_at", null),
    supabase.from("tasks").select("id", { count: "exact" }).eq("organization_id", orgId).eq("estado", "pendiente"),
    supabase.from("sesiones").select("id", { count: "exact" }).eq("organization_id", orgId).gte("fecha", today.toISOString()).lt("fecha", weekEnd.toISOString()).is("deleted_at", null),
  ]);

  const pacientesActivos = allPatients.data?.filter((p) => p.estado === "activo").length ?? 0;

  return (
    <>
      <StatCard icon={CalIcon} label="Sesiones de hoy" value={todaySessions.count ?? 0} accent="linear-gradient(135deg, #E8A0BF, #D88AAB)" />
      <StatCard icon={Users} label="Pacientes activos" value={pacientesActivos} accent="linear-gradient(135deg, #F4C6A0, #e8a87a)" />
      <StatCard icon={CheckCircle2} label="Tareas pendientes" value={pendingTasksRes.count ?? 0} accent="linear-gradient(135deg, #A8D5A2, #8fc78a)" />
      <StatCard icon={Clock} label="Esta semana" value={weekSessions.count ?? 0} accent="linear-gradient(135deg, #C8A2E8, #b08ad0)" />
    </>
  );
}

async function TodaySessionsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psicologa = (await supabase.from("psicologas").select("organization_id").eq("id", user!.id).single()).data;
  
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: sessions } = await supabase
    .from("sesiones")
    .select("*, paciente:pacientes(*)")
    .eq("organization_id", psicologa!.organization_id)
    .gte("fecha", today.toISOString())
    .lt("fecha", tomorrow.toISOString())
    .is("deleted_at", null)
    .order("fecha");

  if (!sessions?.length) {
    return (
      <div className="py-12 text-center fade-in">
        <p className="font-display text-2xl mb-2">Un día tranquilo 🌷</p>
        <p className="text-sm" style={{ color: "var(--psi-soft)" }}>No tienes sesiones agendadas para hoy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 fade-in">
      {sessions.map((s: any) => (
        <Link key={s.id} href={`/patients/${s.paciente_id}`} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/60" style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(232, 160, 191, 0.12)" }}>
          <div className="text-center" style={{ minWidth: 60 }}>
            <p className="font-display text-2xl">{formatTime(s.fecha)}</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--psi-soft)" }}>{s.duracion}min</p>
          </div>
          <div className="w-px self-stretch" style={{ background: "rgba(232, 160, 191, 0.2)" }} />
          <Avatar name={s.paciente?.nombre ?? "?"} color={s.paciente?.color} size={42} />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{s.paciente?.nombre}</p>
            <p className="text-xs truncate" style={{ color: "var(--psi-soft)" }}>{s.paciente?.motivo_consulta || "Sin notas de motivo"}</p>
          </div>
          <span className={`badge ${s.tipo === "online" ? "badge-info" : "badge-pending"}`}>{s.tipo}</span>
        </Link>
      ))}
    </div>
  );
}

async function NextSessionCard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psicologa = (await supabase.from("psicologas").select("organization_id").eq("id", user!.id).single()).data;

  const { data: nextSession } = await supabase
    .from("sesiones")
    .select("*, paciente:pacientes(*)")
    .eq("organization_id", psicologa!.organization_id)
    .gte("fecha", new Date().toISOString())
    .eq("estado", "programada")
    .is("deleted_at", null)
    .order("fecha")
    .limit(1)
    .maybeSingle();

  if (!nextSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center fade-in">
        <Heart size={32} style={{ color: "#D88AAB", opacity: 0.4 }} />
        <p className="text-sm mt-3" style={{ color: "var(--psi-soft)" }}>No tienes sesiones próximas.</p>
        <Link href="/calendar" className="btn-secondary mt-4 text-sm">Agendar una</Link>
      </div>
    );
  }

  const sessionData = nextSession as any;
  return (
    <div className="flex-1 flex flex-col fade-in">
      <div className="flex items-center gap-3 mb-5">
        <Avatar name={sessionData.paciente?.nombre ?? "?"} color={sessionData.paciente?.color} size={56} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-lg">{sessionData.paciente?.nombre}</p>
          <p className="text-xs font-medium" style={{ color: "#D88AAB" }}>{relativeTime(sessionData.fecha)}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm flex-1">
        <Row label="Hora" value={formatTime(sessionData.fecha)} />
        <Row label="Duración" value={`${sessionData.duracion} min`} />
        <Row label="Modalidad" value={<span className={`badge ${sessionData.tipo === "online" ? "badge-info" : "badge-pending"}`}>{sessionData.tipo}</span>} />
      </div>
      <Link href={`/patients/${sessionData.paciente_id}`} className="btn-primary w-full justify-center mt-4">Ver expediente</Link>
    </div>
  );
}

// ==========================================
// 🦴 SKELETON LOADERS (Pantallas de carga grises)
// ==========================================

function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
      <div className="h-12 bg-gray-200 rounded w-64 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
         <div key={i} className="card-soft p-6 animate-pulse">
            <div className="w-11 h-11 bg-gray-200 rounded-2xl mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
         </div>
      ))}
    </>
  );
}

function SessionsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
      ))}
    </div>
  );
}

function NextSessionSkeleton() {
  return (
    <div className="flex-1 flex flex-col animate-pulse">
      <div className="flex gap-3 mb-5">
        <div className="w-14 h-14 bg-white/50 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-white/50 rounded w-32 mb-2"></div>
          <div className="h-3 bg-white/50 rounded w-20"></div>
        </div>
      </div>
      <div className="space-y-2 flex-1">
         <div className="h-8 bg-white/40 rounded w-full"></div>
         <div className="h-8 bg-white/40 rounded w-full"></div>
      </div>
      <div className="h-10 bg-white/60 rounded w-full mt-4"></div>
    </div>
  );
}

// ==========================================
// 🛠️ UTILS
// ==========================================

function StatCard({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="card-soft p-6 fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: accent, boxShadow: `0 6px 14px rgba(0,0,0,0.05)` }}>
          <Icon className="text-white" size={20} />
        </div>
        <TrendingUp size={14} style={{ color: "var(--psi-soft)", opacity: 0.5 }} />
      </div>
      <p className="text-sm mb-1" style={{ color: "var(--psi-soft)" }}>{label}</p>
      <p className="font-display text-4xl">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "rgba(232, 160, 191, 0.15)" }}>
      <span style={{ color: "var(--psi-soft)" }}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}