import { createClient } from "@psicare/db/server";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const psico = (await supabase.from("psicologas").select("organization_id").eq("id", user!.id).single()).data!;
  const orgId = psico.organization_id;

  const [{ data: patients }, { data: sesiones }] = await Promise.all([
    supabase.from("pacientes").select("id, modalidad").eq("organization_id", orgId).is("deleted_at", null),
    supabase.from("sesiones").select("estado, fecha").eq("organization_id", orgId).is("deleted_at", null),
  ]);

  const totalCompletadas = sesiones?.filter((s: any) => s.estado === "completada").length ?? 0;
  const totalProgramadas = sesiones?.filter((s: any) => s.estado === "programada").length ?? 0;
  const totalCanceladas = sesiones?.filter((s: any) => s.estado === "cancelada").length ?? 0;
  const modCount: Record<string, number> = { presencial: 0, online: 0, mixta: 0 };
  patients?.forEach((p: any) => { modCount[p.modalidad] = (modCount[p.modalidad] || 0) + 1; });

  // Monthly chart (last 6 months)
  const months: { mes: string; sesiones: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = sesiones?.filter((s: any) => {
      const sd = new Date(s.fecha);
      return s.estado === "completada" && sd >= d && sd < next;
    }).length ?? 0;
    months.push({ mes: d.toLocaleDateString("es-MX", { month: "short" }), sesiones: count });
  }
  const max = Math.max(...months.map((m) => m.sesiones), 1);

  return (
    <>
      <div className="mb-8 fade-up">
        <h1 className="font-display text-5xl" data-testid="stats-title">Estadísticas</h1>
        <p className="mt-1" style={{ color: "var(--psi-soft)" }}>Tu consulta en números</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard label="Total pacientes" value={patients?.length ?? 0} color="#E8A0BF" />
        <MetricCard label="Completadas" value={totalCompletadas} color="#A8D5A2" />
        <MetricCard label="Programadas" value={totalProgramadas} color="#F4C6A0" />
        <MetricCard label="Canceladas" value={totalCanceladas} color="#EF9A9A" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-soft p-7" data-testid="monthly-chart">
          <h3 className="font-display text-2xl mb-5">Sesiones por mes</h3>
          <div className="flex items-end gap-4 h-56">
            {months.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-medium">{m.sesiones}</span>
                <div className="w-full rounded-t-xl transition-all" style={{ height: `${(m.sesiones / max) * 100}%`, minHeight: 4, background: "linear-gradient(180deg, #E8A0BF, #D88AAB)" }} />
                <span className="text-xs capitalize" style={{ color: "var(--psi-soft)" }}>{m.mes}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-soft p-7" data-testid="modality-chart">
          <h3 className="font-display text-2xl mb-5">Por modalidad</h3>
          <div className="space-y-3">
            {Object.entries(modCount).map(([k, v]) => {
              const pct = (patients?.length ?? 0) > 0 ? (v / (patients!.length)) * 100 : 0;
              const color = k === "presencial" ? "#E8A0BF" : k === "online" ? "#A2C8E8" : "#C8A2E8";
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1.5"><span className="capitalize">{k}</span><span style={{ color: "var(--psi-soft)" }}>{v}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(232, 160, 191, 0.12)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function MetricCard({ label, value, color }: any) {
  return (
    <div className="card-soft p-6 fade-up">
      <div className="w-11 h-11 rounded-2xl mb-3" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 6px 14px ${color}40` }} />
      <p className="text-sm" style={{ color: "var(--psi-soft)" }}>{label}</p>
      <p className="font-display text-4xl mt-1">{value}</p>
    </div>
  );
}
