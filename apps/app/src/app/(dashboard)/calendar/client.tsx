"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/modal";
import { startOfMonth, startOfWeek, addDays, sameDay, monthName, formatTime } from "@psicare/ui";
import { toast } from "sonner";
import { createSesion } from "../actions";

export function CalendarClient({ sesiones, pacientes }: { sesiones: any[]; pacientes: any[] }) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; });
  const [showModal, setShowModal] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date | null>(null);

  const grid = useMemo(() => {
    const ms = startOfMonth(currentMonth);
    const gs = startOfWeek(ms);
    return Array.from({ length: 42 }, (_, i) => addDays(gs, i));
  }, [currentMonth]);

  const byDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const s of sesiones) {
      const d = new Date(s.fecha);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      (map[k] ||= []).push(s);
    }
    return map;
  }, [sesiones]);

  const pacienteById = useMemo(() => Object.fromEntries(pacientes.map((p) => [p.id, p])), [pacientes]);
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const wd = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <>
      <div className="flex items-center justify-between mb-8 fade-up">
        <div>
          <h1 className="font-display text-5xl capitalize" data-testid="calendar-title">{monthName(currentMonth)}</h1>
          <p className="mt-1" style={{ color: "var(--psi-soft)" }}>{sesiones.length} sesiones registradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d); }} className="btn-secondary p-2" data-testid="cal-prev"><ChevronLeft size={16} /></button>
          <button onClick={() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); setCurrentMonth(d); }} className="btn-secondary" data-testid="cal-today">Hoy</button>
          <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d); }} className="btn-secondary p-2" data-testid="cal-next"><ChevronRight size={16} /></button>
          <button onClick={() => { setDefaultDate(null); setShowModal(true); }} className="btn-primary" data-testid="new-session-btn"><Plus size={16} /> Nueva sesión</button>
        </div>
      </div>

      <div className="card-soft p-6" data-testid="calendar-month">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {wd.map((d) => <div key={d} className="text-center text-xs uppercase tracking-wider font-medium py-2" style={{ color: "var(--psi-soft)" }}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {grid.map((d, i) => {
            const isOther = d.getMonth() !== currentMonth.getMonth();
            const isToday = sameDay(d, new Date());
            const ds = byDay[dayKey(d)] || [];
            return (
              <div key={i} className={`cal-cell ${isOther ? "other-month" : ""} ${isToday ? "today" : ""}`} onClick={() => { setDefaultDate(d); setShowModal(true); }} data-testid={`cal-cell-${d.getDate()}`}>
                <span className="text-sm font-medium" style={{ color: isToday ? "#D88AAB" : "var(--psi-text)" }}>{d.getDate()}</span>
                <div className="flex-1 mt-1 overflow-hidden">
                  {ds.slice(0, 3).map((s: any) => {
                    const p = pacienteById[s.paciente_id];
                    return <div key={s.id} className="cal-pill" style={{ background: p?.color || "#E8A0BF" }}>{formatTime(s.fecha)} {p?.nombre?.split(" ")[0]}</div>;
                  })}
                  {ds.length > 3 && <div className="text-[10px] mt-1" style={{ color: "var(--psi-soft)" }}>+{ds.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && <SesionFormModal pacientes={pacientes} defaultDate={defaultDate} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); router.refresh(); }} />}
    </>
  );
}

function SesionFormModal({ pacientes, defaultDate, onClose, onSaved }: any) {
  const [isPending, startTransition] = useTransition();
  const initial = defaultDate ?? new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${initial.getFullYear()}-${pad(initial.getMonth() + 1)}-${pad(initial.getDate())}`;

  const [form, setForm] = useState({
    paciente_id: pacientes[0]?.id ?? "",
    fecha: dateStr,
    hora: "10:00",
    duracion: 50,
    tipo: "presencial" as const,
    notas_previas: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const [y, m, d] = form.fecha.split("-").map(Number);
      const [hh, mm] = form.hora.split(":").map(Number);
      const dt = new Date(y, m - 1, d, hh, mm);
      const res = await createSesion({
        paciente_id: form.paciente_id,
        fecha: dt.toISOString(),
        duracion: form.duracion,
        tipo: form.tipo,
        notas_previas: form.notas_previas,
      });
      if (res.error) toast.error(res.error);
      else { toast.success("Sesión agendada 🌸"); onSaved(); }
    });
  };

  return (
    <Modal open onClose={onClose} title="Nueva sesión" testid="session-modal">
      {pacientes.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: "var(--psi-soft)" }}>
          Primero agrega un paciente desde la sección Pacientes.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4" data-testid="session-form">
          <div>
            <label className="text-sm font-medium block mb-1.5">Paciente</label>
            <select required value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: e.target.value })} className="input-field" data-testid="session-patient">
              {pacientes.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Fecha</label>
              <input type="date" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="input-field" data-testid="session-date" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Hora</label>
              <input type="time" required value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="input-field" data-testid="session-time" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Duración</label>
              <input type="number" min={15} max={180} value={form.duracion} onChange={(e) => setForm({ ...form, duracion: parseInt(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Modalidad</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })} className="input-field">
                <option value="presencial">Presencial</option><option value="online">Online</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Notas previas</label>
            <textarea value={form.notas_previas} onChange={(e) => setForm({ ...form, notas_previas: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center" data-testid="session-save">{isPending ? "Guardando..." : "Agendar"}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
