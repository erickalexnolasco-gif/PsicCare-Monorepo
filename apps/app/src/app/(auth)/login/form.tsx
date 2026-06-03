"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "../actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      data-testid="login-form"
      action={(fd) => startTransition(async () => {
        const res = await signIn(fd);
        if (res?.error) { setError(res.error); toast.error(res.error); }
      })}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-medium block mb-2">Correo</label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--psi-soft)" }} />
          <input name="email" type="email" required defaultValue="" placeholder="tu@correo.com" className="input-field pl-11" data-testid="login-email" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">Contraseña</label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--psi-soft)" }} />
          <input name="password" type="password" required placeholder="••••••••" className="input-field pl-11" data-testid="login-password" />
        </div>
      </div>
      {error && <p className="text-sm" style={{ color: "#a85555" }} data-testid="login-error">{error}</p>}
      <button type="submit" disabled={isPending} className="btn-primary w-full justify-center py-3" data-testid="login-submit">
        {isPending ? "Entrando..." : "Iniciar sesión"}
      </button>
      <div className="text-center text-sm pt-2" style={{ color: "var(--psi-soft)" }}>
        ¿No tienes cuenta? <Link href="/signup" className="font-medium" style={{ color: "#D88AAB" }} data-testid="link-signup">Crea una en 30 segundos</Link>
      </div>
    </form>
  );
}
