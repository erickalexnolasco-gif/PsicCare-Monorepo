"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "../actions";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      data-testid="signup-form"
      action={(fd) => startTransition(async () => {
        const res = await signUp(fd);
        if (res?.error) { setError(res.error); toast.error(res.error); }
      })}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-medium block mb-2">Tu nombre</label>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--psi-soft)" }} />
          <input name="nombre" type="text" required placeholder="Dra. Sofía García" className="input-field !pl-11" data-testid="signup-nombre" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">Correo profesional</label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--psi-soft)" }} />
          <input name="email" type="email" required placeholder="tu@correo.com" className="input-field !pl-11" data-testid="signup-email" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">Contraseña</label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--psi-soft)" }} />
          <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className="input-field !pl-11" data-testid="signup-password" />
        </div>
      </div>
      {error && <p className="text-sm" style={{ color: "#a85555" }} data-testid="signup-error">{error}</p>}
      <button type="submit" disabled={isPending} className="btn-primary w-full justify-center py-3" data-testid="signup-submit">
        {isPending ? "Creando cuenta..." : "Crear cuenta gratis"}
      </button>
      <div className="text-center text-sm pt-2" style={{ color: "var(--psi-soft)" }}>
        ¿Ya tienes cuenta? <Link href="/login" className="font-medium" style={{ color: "#D88AAB" }}>Inicia sesión</Link>
      </div>
    </form>
  );
}
