//apps/app/src/app/(dashboard)/settings/client.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePsicologa } from "../actions";

export function SettingsClient({ psicologa }: { psicologa: any }) {
  const [form, setForm] = useState(psicologa);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updatePsicologa({
        nombre: form.nombre, cedula: form.cedula,
        duracion_default: parseInt(form.duracion_default),
        horario_inicio: form.horario_inicio, horario_fin: form.horario_fin,
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Ajustes guardados 🌸");
    });
  };

  return (
    <>
      <div className="mb-8 fade-up">
        <h1 className="font-display text-5xl" data-testid="settings-title">Ajustes</h1>
        <p className="mt-1" style={{ color: "var(--psi-soft)" }}>Configura tu perfil y preferencias</p>
      </div>

      <form onSubmit={submit} className="max-w-3xl space-y-6" data-testid="settings-form">
        <div className="card-soft p-7">
          <h3 className="font-display text-2xl mb-5">Perfil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Nombre completo</label>
              <input value={form.nombre || ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" data-testid="set-nombre" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input value={form.email || ""} disabled className="input-field opacity-60" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Cédula profesional</label>
              <input value={form.cedula || ""} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className="input-field" data-testid="set-cedula" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Duración default (min)</label>
              <input type="number" value={form.duracion_default || 50} onChange={(e) => setForm({ ...form, duracion_default: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card-soft p-7">
          <h3 className="font-display text-2xl mb-5">Horario de atención</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Desde</label>
              <input type="time" value={form.horario_inicio || "09:00"} onChange={(e) => setForm({ ...form, horario_inicio: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Hasta</label>
              <input type="time" value={form.horario_fin || "19:00"} onChange={(e) => setForm({ ...form, horario_fin: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary" data-testid="save-settings">{isPending ? "Guardando..." : "Guardar cambios"}</button>
      </form>
    </>
  );
}
