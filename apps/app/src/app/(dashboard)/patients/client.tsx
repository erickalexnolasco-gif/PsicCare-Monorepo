//apps/app/src/app/(dashboard)/patients/client.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Search, Crown } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Modal } from "@/components/modal";
import { toast } from "sonner";
import { createPaciente } from "../actions";
import { useRouter } from "next/navigation";

const colors = ["#E8A0BF", "#F4C6A0", "#A8D5A2", "#C8A2E8", "#A2C8E8", "#E8C5A0", "#D5A8C5"];

export function PatientsClient({ patients, plan }: { patients: any[]; plan: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = patients.filter((p) => {
    if (filter !== "todos" && p.estado !== filter) return false;
    if (query && !p.nombre.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8 fade-up">
        <div>
          <h1 className="font-display text-5xl" data-testid="patients-title">Pacientes</h1>
          <p className="mt-1" style={{ color: "var(--psi-soft)" }}>
            {patients.length} en total, {patients.filter(p => p.estado === "activo").length} activos
            {plan === "free" && <span className="badge badge-info ml-3"><Crown size={12} /> Plan Gratis · máx 1</span>}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" data-testid="add-patient-btn">
          <Plus size={16} /> Agregar paciente
        </button>
      </div>

      <div className="card-soft p-5 mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--psi-soft)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="input-field !pl-11" data-testid="patient-search" />
        </div>
        <div className="tab-list">
          {["todos", "activo", "pausa", "alta"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`tab-item capitalize ${filter === f ? "active" : ""}`} data-testid={`filter-${f}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => (
          <Link key={p.id} href={`/patients/${p.id}`} className="card-soft p-6 fade-up" data-testid={`patient-card-${i}`}>
            <div className="flex items-start gap-4 mb-4">
              <Avatar name={p.nombre} color={p.color} size={56} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-lg leading-tight">{p.nombre}</p>
                <p className="text-xs mt-1" style={{ color: "var(--psi-soft)" }}>{p.edad ? `${p.edad} años · ` : ""}{p.modalidad}</p>
              </div>
              <span className={`badge ${p.estado === "activo" ? "badge-success" : p.estado === "pausa" ? "badge-pending" : "badge-info"} capitalize`}>{p.estado}</span>
            </div>
            <p className="text-sm line-clamp-2 min-h-[2.5rem]" style={{ color: "var(--psi-soft)" }}>{p.motivo_consulta || "Sin motivo de consulta."}</p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center" data-testid="empty-patients">
            <p className="font-display text-3xl mb-2">Sin pacientes 🌷</p>
            <p className="text-sm mb-6" style={{ color: "var(--psi-soft)" }}>Agrega tu primer paciente para comenzar.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto"><Plus size={16} /> Nuevo paciente</button>
          </div>
        )}
      </div>

      {showModal && <PatientFormModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); router.refresh(); }} />}
    </>
  );
}

function PatientFormModal({ patient, onClose, onSaved }: { patient?: any; onClose: () => void; onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    nombre: patient?.nombre ?? "", edad: patient?.edad ?? "",
    telefono: patient?.telefono ?? "", email: patient?.email ?? "",
    modalidad: patient?.modalidad ?? "presencial", estado: patient?.estado ?? "activo",
    color: patient?.color ?? colors[0],
    motivo_consulta: patient?.motivo_consulta ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload: any = { ...form };
      payload.edad = payload.edad ? parseInt(payload.edad) : null;
      const res = await createPaciente(payload);
      if (res.error) toast.error(res.error);
      else { toast.success("Paciente agregado 🌸"); onSaved(); }
    });
  };

  return (
    <Modal open onClose={onClose} title="Nuevo paciente" testid="patient-modal">
      <form onSubmit={submit} className="space-y-4" data-testid="patient-form">
        <div>
          <label className="text-sm font-medium block mb-1.5">Nombre completo</label>
          <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" data-testid="patient-nombre" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Edad</label>
            <input type="number" value={form.edad} onChange={(e) => setForm({ ...form, edad: e.target.value as any })} className="input-field" data-testid="patient-edad" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Teléfono</label>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Modalidad</label>
            <select value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value })} className="input-field">
              <option value="presencial">Presencial</option><option value="online">Online</option><option value="mixta">Mixta</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Estado</label>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="input-field">
              <option value="activo">Activo</option><option value="pausa">En pausa</option><option value="alta">Alta</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Color identificador</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                className="w-9 h-9 rounded-full transition-all"
                style={{ background: c, border: form.color === c ? "3px solid white" : "3px solid transparent", boxShadow: form.color === c ? `0 0 0 2px ${c}` : "0 2px 6px rgba(0,0,0,0.08)" }} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Motivo de consulta</label>
          <textarea value={form.motivo_consulta} onChange={(e) => setForm({ ...form, motivo_consulta: e.target.value })} className="input-field" rows={3} />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center" data-testid="patient-save">{isPending ? "Guardando..." : "Crear paciente"}</button>
        </div>
      </form>
    </Modal>
  );
}
