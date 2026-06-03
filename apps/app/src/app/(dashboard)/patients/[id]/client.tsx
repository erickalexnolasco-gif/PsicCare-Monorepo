"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, GripVertical, Edit3, CheckCircle2, CalendarClock, Sparkles } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Modal } from "@/components/modal";
import { formatDate, formatDateTime } from "@psicare/ui";
import { toast } from "sonner";
import { createTask, updateTask, deleteTask, reorderTasks, deletePaciente, updateSesion } from "../../actions";

const TABS = [
  { key: "datos", label: "Datos" },
  { key: "motivo", label: "Motivo" },
  { key: "plan", label: "Plan de intervención" },
  { key: "historial", label: "Historial" },
];

export function PatientProfileClient({ paciente, initialTasks, sesiones }: any) {
  const router = useRouter();
  const [tab, setTab] = useState("datos");
  const [tasks, setTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [editingSesion, setEditingSesion] = useState<any>(null);
  const [, startTransition] = useTransition();

  const refresh = () => router.refresh();

  const pendingCount = tasks.filter((t: any) => t.estado === "pendiente").length;
  const doneCount = tasks.filter((t: any) => t.estado === "visto").length;

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      await createTask(paciente.id, newTitle.trim());
      setNewTitle("");
      toast.success("Objetivo agregado");
      refresh();
    });
  };

  const toggle = (t: any) => {
    const next = t.estado === "pendiente" ? "visto" : "pendiente";
    setTasks(tasks.map((x: any) => x.id === t.id ? { ...x, estado: next } : x));
    startTransition(async () => { await updateTask(t.id, { estado: next }); });
  };

  const remove = (id: string) => {
    setTasks(tasks.filter((x: any) => x.id !== id));
    startTransition(async () => { await deleteTask(id); });
  };

  const onDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...tasks];
    const [m] = next.splice(dragIdx, 1);
    next.splice(i, 0, m);
    setTasks(next);
    setDragIdx(null);
    startTransition(async () => { await reorderTasks(next.map((t: any, idx: number) => ({ id: t.id, orden: idx }))); });
  };

  const handleDeletePatient = () => {
    if (!confirm("¿Eliminar paciente?")) return;
    startTransition(async () => {
      await deletePaciente(paciente.id);
      toast.success("Paciente eliminado");
      router.push("/patients");
    });
  };

  return (
    <>
      <Link href="/patients" className="btn-ghost mb-4" data-testid="back-btn"><ArrowLeft size={16} /> Pacientes</Link>

      <div className="card-soft p-7 mb-6 fade-up" data-testid="patient-header">
        <div className="flex items-start gap-5">
          <Avatar name={paciente.nombre} color={paciente.color} size={80} />
          <div className="flex-1">
            <h1 className="font-display text-4xl mb-1" data-testid="patient-name">{paciente.nombre}</h1>
            <div className="flex items-center gap-3 flex-wrap text-sm" style={{ color: "var(--psi-soft)" }}>
              {paciente.edad && <><span>{paciente.edad} años</span><span>·</span></>}
              <span className="capitalize">{paciente.modalidad}</span><span>·</span>
              <span className={`badge ${paciente.estado === "activo" ? "badge-success" : paciente.estado === "pausa" ? "badge-pending" : "badge-info"} capitalize`}>{paciente.estado}</span>
              <span>·</span><span>Desde {formatDate(paciente.fecha_inicio)}</span>
            </div>
          </div>
          <button onClick={handleDeletePatient} className="btn-ghost" style={{ color: "#a85555" }} data-testid="delete-patient-btn"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="tab-list mb-6 max-w-lg">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`tab-item flex-1 ${tab === t.key ? "active" : ""}`} data-testid={`tab-${t.key}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "datos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card-soft p-6">
            <h3 className="font-display text-2xl mb-4">Contacto</h3>
            <DetailRow label="Teléfono" value={paciente.telefono} />
            <DetailRow label="Email" value={paciente.email} />
            <DetailRow label="Dirección" value={paciente.direccion} />
          </div>
          <div className="card-soft p-6">
            <h3 className="font-display text-2xl mb-4">Generales</h3>
            <DetailRow label="Fecha de nacimiento" value={paciente.fecha_nacimiento} />
            <DetailRow label="Inicio" value={formatDate(paciente.fecha_inicio)} />
            <DetailRow label="Sesiones totales" value={sesiones.length} />
          </div>
        </div>
      )}

      {tab === "motivo" && (
        <div className="card-soft p-7" data-testid="motivo-content">
          <h3 className="font-display text-2xl mb-4">Motivo de consulta</h3>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{paciente.motivo_consulta || "Sin motivo registrado."}</p>
        </div>
      )}

      {tab === "plan" && (
        <div className="card-soft p-7" data-testid="plan-content">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-2xl">Plan de intervención</h3>
            <div className="flex gap-2 text-sm"><span className="badge badge-pending">{pendingCount} pendientes</span><span className="badge badge-success">{doneCount} vistos</span></div>
          </div>
          <p className="text-sm mb-5" style={{ color: "var(--psi-soft)" }}>Objetivos terapéuticos. Marca cuando los trabajes con el paciente.</p>

          <div className="space-y-2 mb-4">
            {tasks.map((t: any, i: number) => (
              <div key={t.id} draggable onDragStart={() => setDragIdx(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)}
                className="flex items-start gap-3 p-4 rounded-2xl group transition-all"
                style={{ background: t.estado === "visto" ? "rgba(168, 213, 162, 0.12)" : "rgba(255,255,255,0.6)", border: `1px solid ${t.estado === "visto" ? "rgba(168, 213, 162, 0.3)" : "rgba(232, 160, 191, 0.18)"}` }}
                data-testid={`task-${i}`}
              >
                <GripVertical size={16} style={{ color: "var(--psi-soft)", opacity: 0.3 }} className="cursor-grab mt-1" />
                <input type="checkbox" checked={t.estado === "visto"} onChange={() => toggle(t)} className="psi-checkbox mt-0.5" data-testid={`task-check-${i}`} />
                <div className="flex-1">
                  <p className="font-medium" style={{ textDecoration: t.estado === "visto" ? "line-through" : "none", opacity: t.estado === "visto" ? 0.6 : 1 }}>{t.titulo}</p>
                  {t.notas && <p className="text-sm mt-1" style={{ color: "var(--psi-soft)" }}>{t.notas}</p>}
                </div>
                <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 btn-ghost" data-testid={`task-delete-${i}`}><Trash2 size={14} style={{ color: "#a85555" }} /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTask()} placeholder="Nuevo objetivo..." className="input-field flex-1" data-testid="new-task-input" />
            <button onClick={handleAddTask} className="btn-primary" data-testid="add-task-btn"><Plus size={14} /> Agregar</button>
          </div>
        </div>
      )}

      {tab === "historial" && (
        <div className="card-soft p-7" data-testid="historial-content">
          <h3 className="font-display text-2xl mb-5">Historial de sesiones</h3>
          <div className="space-y-3">
            {sesiones.length === 0 && <p className="text-sm text-center py-8" style={{ color: "var(--psi-soft)" }}>Sin sesiones aún.</p>}
            {sesiones.map((s: any, i: number) => (
              <div key={s.id} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(232, 160, 191, 0.15)" }} data-testid={`session-row-${i}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.estado === "completada" ? "rgba(168, 213, 162, 0.25)" : "rgba(232, 160, 191, 0.2)" }}>
                      {s.estado === "completada" ? <CheckCircle2 size={18} style={{ color: "#5a8a55" }} /> : <CalendarClock size={18} style={{ color: "#D88AAB" }} />}
                    </div>
                    <div>
                      <p className="font-medium">{formatDateTime(s.fecha)}</p>
                      <p className="text-xs" style={{ color: "var(--psi-soft)" }}>{s.duracion} min · {s.tipo} · <span className="capitalize">{s.estado}</span></p>
                    </div>
                  </div>
                  <button onClick={() => setEditingSesion(s)} className="btn-ghost text-xs" data-testid={`session-edit-${i}`}>Notas</button>
                </div>
                {s.notas_sesion && <p className="text-sm mt-3 pl-14 whitespace-pre-wrap" style={{ color: "var(--psi-soft)" }}>{s.notas_sesion.slice(0, 200)}{s.notas_sesion.length > 200 ? "..." : ""}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {editingSesion && <SessionNotesModal sesion={editingSesion} tasks={tasks} onClose={() => setEditingSesion(null)} onSaved={() => { setEditingSesion(null); refresh(); }} />}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-2.5 text-sm border-b last:border-0" style={{ borderColor: "rgba(232, 160, 191, 0.15)" }}>
      <span style={{ color: "var(--psi-soft)" }}>{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}

const MOODS = [{ v: 1, e: "😢" }, { v: 2, e: "😟" }, { v: 3, e: "😐" }, { v: 4, e: "🙂" }, { v: 5, e: "😊" }];

function SessionNotesModal({ sesion, tasks, onClose, onSaved }: any) {
  const [, startTransition] = useTransition();
  const [form, setForm] = useState({
    estado: sesion.estado,
    notas_sesion: sesion.notas_sesion || "",
    estado_animo: sesion.estado_animo as number | null,
    proxima_sesion: sesion.proxima_sesion || "",
    tareas_vistas: [] as string[],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateSesion(sesion.id, form);
      if (res?.error) toast.error(res.error);
      else { toast.success("Sesión guardada 🌸"); onSaved(); }
    });
  };

  return (
    <Modal open onClose={onClose} title="Notas de sesión" testid="session-notes-modal">
      <p className="text-sm mb-4" style={{ color: "var(--psi-soft)" }}>{formatDateTime(sesion.fecha)} · {sesion.duracion} min</p>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="text-sm font-medium block mb-2">Estado</label>
          <div className="flex gap-2">
            {["programada", "completada", "cancelada"].map((e) => (
              <button type="button" key={e} onClick={() => setForm({ ...form, estado: e as any })} className="btn-secondary capitalize" style={{ background: form.estado === e ? "linear-gradient(135deg, #E8A0BF, #D88AAB)" : undefined, color: form.estado === e ? "white" : undefined }}>{e}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Estado de ánimo</label>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button type="button" key={m.v} onClick={() => setForm({ ...form, estado_animo: m.v })}
                className="flex-1 py-3 rounded-xl text-2xl transition-all"
                style={{ background: form.estado_animo === m.v ? "linear-gradient(135deg, rgba(232,160,191,0.3), rgba(249,212,212,0.3))" : "rgba(255,255,255,0.5)", border: form.estado_animo === m.v ? "2px solid #E8A0BF" : "1px solid rgba(232,160,191,0.15)" }}
                data-testid={`mood-${m.v}`}>{m.e}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Notas</label>
          <textarea value={form.notas_sesion} onChange={(e) => setForm({ ...form, notas_sesion: e.target.value })} className="input-field" rows={6} data-testid="notes-textarea" />
        </div>
        {tasks.length > 0 && (
          <div>
            <label className="text-sm font-medium block mb-2 flex items-center gap-2"><Sparkles size={14} style={{ color: "#D88AAB" }} /> Temas del plan vistos</label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto p-2 rounded-xl" style={{ background: "rgba(253, 232, 240, 0.4)" }}>
              {tasks.map((t: any) => (
                <label key={t.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-white/60">
                  <input type="checkbox" className="psi-checkbox" style={{ width: 18, height: 18 }}
                    checked={form.tareas_vistas.includes(t.id)}
                    onChange={() => setForm({ ...form, tareas_vistas: form.tareas_vistas.includes(t.id) ? form.tareas_vistas.filter((x) => x !== t.id) : [...form.tareas_vistas, t.id] })} />
                  <span className="text-sm">{t.titulo}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button type="submit" className="btn-primary flex-1 justify-center" data-testid="save-notes-btn">Guardar</button>
        </div>
      </form>
    </Modal>
  );
}
