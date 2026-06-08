//apps/app/src/components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Users, BarChart3, Settings, Sparkles, LogOut, Crown } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

export function Sidebar({ psicologa }: { psicologa: any }) {
  const path = usePathname();
  const isActive = (p: string) => path === p || path?.startsWith(p + "/");

  const plan = psicologa?.organizations?.plan ?? "free";

  const navItem = (href: string, Icon: any, label: string, testid: string) => (
    <Link href={href} className={`nav-item ${isActive(href) ? "active" : ""}`} data-testid={testid}>
      <Icon size={18} /> {label}
    </Link>
  );

  return (
    <aside className="glass-pink h-screen w-64 fixed left-0 top-0 flex flex-col p-5 z-30" data-testid="sidebar">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8A0BF, #D88AAB)", boxShadow: "0 6px 16px rgba(216, 138, 171, 0.35)" }}>
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h1 className="font-display text-2xl leading-none">PsiCare</h1>
          <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "var(--psi-soft)" }}>consulta</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItem("/dashboard", LayoutDashboard, "Dashboard", "nav-dashboard")}
        {navItem("/calendar", Calendar, "Calendario", "nav-calendar")}
        {navItem("/patients", Users, "Pacientes", "nav-patients")}
        {navItem("/stats", BarChart3, "Estadísticas", "nav-stats")}
        {navItem("/settings", Settings, "Ajustes", "nav-settings")}
      </nav>

      {plan === "free" && (
        <Link href="/billing" className="card-soft p-4 mb-3 cursor-pointer hover:scale-[1.02] transition" data-testid="upgrade-card" style={{ background: "linear-gradient(135deg, rgba(232, 160, 191, 0.2), rgba(249, 212, 212, 0.2))" }}>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={14} style={{ color: "#D88AAB" }} />
            <span className="text-xs font-semibold uppercase tracking-wider">Plan Gratis</span>
          </div>
          <p className="text-sm font-medium mb-1">Desbloquea Pro</p>
          <p className="text-xs" style={{ color: "var(--psi-soft)" }}>Pacientes ilimitados desde $99 MXN/mes</p>
        </Link>
      )}

      <div className="border-t pt-4" style={{ borderColor: "rgba(232, 160, 191, 0.2)" }}>
        <div className="flex items-center gap-3 px-2 pb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #E8A0BF, #D88AAB)" }}>
            {psicologa?.nombre?.split(" ")?.[1]?.[0] ?? psicologa?.nombre?.[0] ?? "P"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{psicologa?.nombre}</p>
            <p className="text-xs truncate" style={{ color: "var(--psi-soft)" }}>{psicologa?.email}</p>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit" className="nav-item w-full" data-testid="logout-btn">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
