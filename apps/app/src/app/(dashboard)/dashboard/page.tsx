import { createClient } from "@psicare/db/server";
import { Calendar as CalIcon, Users, CheckCircle2, Clock, ChevronRight, TrendingUp, Heart } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { formatTime, relativeTime, dayLabel } from "@psicare/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psicologa = (await supabase.from("psicologas").select("*").eq("id", user!.id).single()).data;

  const orgId = psicologa!.organization_id;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

  const [todaySessions, allPatients, pendingTasksRes, nextSession, weekSessions] = await Promise.all([
    supabase.from("sesiones").select("*, paciente:pacientes(*)").eq("organization_id", orgId).gte("fecha", today.toISOString()).lt("fecha", tomorrow.toISOString()).is("deleted_at", null).order("fecha"),
    supabase.from("pacientes").select("id, estado").eq("organization_id", orgId).is("deleted_at", null),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("estado", "pendiente"),
    supabase.from("sesiones").select("*, paciente:pacientes(*)").eq("organization_id", orgId).gte("fecha", new Date().toISOString()).eq("estado", "programada").is("deleted_at", null).order("fecha").limit(1).maybeSingle(),
    supabase.from("sesiones").select("id", { count: "exact", head: true }).eq("organization_id", orgId).gte("fecha", today.toISOString()).lt("fecha", weekEnd.toISOString()).is("deleted_at", null),
  ]);

  const stats = {
    sesiones_hoy: todaySessions.data?.length ?? 0,
    pacientes_activos: allPatients.data?.filter((p) => p.estado === "activo").length ?? 0,
    tareas_pendientes: pendingTasksRes.count ?? 0,
    sesiones_semana: weekSessions.count ?? 0,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };
  const nombreCorto = psicologa!.nombre?.replace(/^Dra?\.?\s*/i, "").split(" ")[0] ?? "";

  return (
    <>
      <div className="mb-10 fade-up">
        <p className="text-sm mb-2" style={{ color: "var(--psi-soft)" }}>{dayLabel(new Date())}</p>
        <h1 className="font-display text-5xl" data-testid="dashboard-greeting">
          {greeting()}, {nombreCorto} <span className="inline-block">🌸</span>
        </h1>
        <p className="mt-2" style={{ color: "var(--psi-soft)" }}>Aquí está el resumen de tu consulta de hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={CalIcon} label="Sesiones de hoy" value={stats.sesiones_hoy} accent="linear-gradient(135deg, #E8A0BF, #D88AAB)" testid="stat-sesiones-hoy" />
        <StatCard icon={Users} label="Pacientes activos" value={stats.pacientes_activos} accent="linear-gradient(135deg, #F4C6A0, #e8a87a)" testid="stat-pacientes" />
        <StatCard icon={CheckCircle2} label="Tareas pendientes" value={stats.tareas_pendientes} accent="linear-gradient(135deg, #A8D5A2, #8fc78a)" testid="stat-tareas" />
        <StatCard icon={Clock} label="Esta semana" value={stats.sesiones_semana} accent="linear-gradient(135deg, #C8A2E8, #b08ad0)" testid="stat-semana" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-soft p-7" data-testid="today-sessions-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Sesiones de hoy</h3>
            <Link href="/calendar" className="btn-ghost text-sm">Ver calendario <ChevronRight size={14} /></Link>
          </div>
          {!todaySessions.data?.length ? (
            <div className="py-12 text-center">
              <p className="font-display text-2xl mb-2">Un día tranquilo 🌷</p>
              <p className="text-sm" style={{ color: "var(--psi-soft)" }}>No tienes sesiones agendadas para hoy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.data.map((s: any, i: number) => (
                <Link key={s.id} href={`/patients/${s.paciente_id}`} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/60" style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid rgba(232, 160, 191, 0.12)" }} data-testid={`today-session-${i}`}>
                  <div className="text-center" style={{ minWidth: 60 }}>
                    <p className="font-display text-2xl">{formatTime(s.fecha)}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--psi-soft)" }}>{s.duracion}min</p>
                  </div>
                  <div className="w-px self-stretch" style={{ background: "rgba(232, 160, 191, 0.2)" }} />
                  <Avatar name={s.paciente?.nombre ?? "?"} color={s.paciente?.color} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{s.paciente?.nombre}</p>
                    <p className="text-xs" style={{ color: "var(--psi-soft)" }}>{(s.paciente?.motivo_consulta ?? "").slice(0, 60)}...</p>
                  </div>
                  <span className={`badge ${s.tipo === "online" ? "badge-info" : "badge-pending"}`}>{s.tipo}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-soft p-7 flex flex-col" data-testid="next-session-card" style={{ background: "linear-gradient(135deg, rgba(253, 232, 240, 0.8), rgba(249, 212, 212, 0.5))" }}>
          <h3 className="font-display text-2xl mb-4">Próxima sesión</h3>
          {nextSession.data ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <Avatar name={(nextSession.data as any).paciente?.nombre ?? "?"} color={(nextSession.data as any).paciente?.color} size={56} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg">{(nextSession.data as any).paciente?.nombre}</p>
                  <p className="text-xs font-medium" style={{ color: "#D88AAB" }}>{relativeTime((nextSession.data as any).fecha)}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm flex-1">
                <Row label="Hora" value={formatTime((nextSession.data as any).fecha)} />
                <Row label="Duración" value={`${(nextSession.data as any).duracion} min`} />
                <Row label="Modalidad" value={<span className={`badge ${(nextSession.data as any).tipo === "online" ? "badge-info" : "badge-pending"}`}>{(nextSession.data as any).tipo}</span>} />
              </div>
              <Link href={`/patients/${(nextSession.data as any).paciente_id}`} className="btn-primary w-full justify-center mt-4">Ver expediente</Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Heart size={32} style={{ color: "#D88AAB", opacity: 0.4 }} />
              <p className="text-sm mt-3" style={{ color: "var(--psi-soft)" }}>No tienes sesiones próximas.</p>
              <Link href="/calendar" className="btn-secondary mt-4 text-sm">Agendar una</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, accent, testid }: any) {
  return (
    <div className="card-soft p-6 fade-up" data-testid={testid}>
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
