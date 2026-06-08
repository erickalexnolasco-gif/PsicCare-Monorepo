"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { signIn, signInWithGoogle } from "../actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  return (
    <div className="space-y-4">
      {/* Botón Google */}
      <button
        onClick={() => startGoogleTransition(async () => {
          const res = await signInWithGoogle();
          if (res?.error) { setError(res.error); toast.error(res.error); }
        })}
        disabled={isGooglePending}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border font-medium text-sm transition-all hover:bg-gray-50"
        style={{ borderColor: "var(--psi-border)" }}
      >
        {isGooglePending ? "Redirigiendo..." : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar sesión con Google
          </>
        )}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--psi-border)" }} />
        <span className="text-xs" style={{ color: "var(--psi-soft)" }}>o con correo</span>
        <div className="flex-1 h-px" style={{ background: "var(--psi-border)" }} />
      </div>

      {/* Formulario email/password */}
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
            <input name="email" type="email" required defaultValue="" placeholder="tu@correo.com" className="input-field !pl-11" data-testid="login-email" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Contraseña</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--psi-soft)" }} />
            <input name="password" type="password" required placeholder="••••••••" className="input-field !pl-11" data-testid="login-password" />
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
    </div>
  );
}