import Link from "next/link";
import { Sparkles, Check, Calendar, Users, MessageCircle, Heart, Shield, Smartphone } from "lucide-react";
import { PLANS } from "@psicare/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function Home() {
  return (
    <main style={{ background: "radial-gradient(circle at 0% 0%, rgba(232, 160, 191, 0.15), transparent 50%), radial-gradient(circle at 100% 100%, rgba(249, 212, 212, 0.25), transparent 50%), #FFF6F6", backgroundAttachment: "fixed", minHeight: "100vh" }}>
      {/* Header */}
      <header className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8A0BF, #D88AAB)", boxShadow: "0 6px 16px rgba(216, 138, 171, 0.35)" }}>
            <Sparkles className="text-white" size={20} />
          </div>
          <span className="font-display text-2xl">PsiCare</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#features" className="hover:opacity-70">Funciones</a>
          <a href="#pricing" className="hover:opacity-70">Precios</a>
          <a href="#faq" className="hover:opacity-70">FAQ</a>
          <Link href={`${APP_URL}/login`} className="hover:opacity-70">Iniciar sesión</Link>
          <Link href={`${APP_URL}/signup`} className="px-5 py-2 rounded-xl font-medium text-white" style={{ background: "linear-gradient(135deg, #E8A0BF, #D88AAB)", boxShadow: "0 4px 14px rgba(216, 138, 171, 0.35)" }}>Empieza gratis</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-20 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-medium mb-6" style={{ background: "rgba(232, 160, 191, 0.15)", color: "#D88AAB" }}>🌸 Hecho para psicólogas mexicanas</span>
        <h1 className="font-display text-6xl md:text-7xl leading-[1.05] mb-6">
          Tu consulta,<br /><em style={{ color: "#D88AAB" }}>en calma.</em>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "#9B7B87" }}>
          PsiCare es el software de gestión clínica diseñado para psicólogas que valoran la presencia, los detalles y el espacio terapéutico.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`${APP_URL}/signup`} className="px-7 py-3.5 rounded-2xl font-medium text-white" style={{ background: "linear-gradient(135deg, #E8A0BF, #D88AAB)", boxShadow: "0 6px 20px rgba(216, 138, 171, 0.4)" }}>Empieza gratis · sin tarjeta</Link>
          <a href="#features" className="px-7 py-3.5 rounded-2xl font-medium" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(232, 160, 191, 0.25)" }}>Ver funciones</a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="font-display text-5xl text-center mb-3">Todo lo que necesitas</h2>
        <p className="text-center mb-16" style={{ color: "#9B7B87" }}>Sin la complejidad de los sistemas hospitalarios.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <Feature Icon={Users} title="Expediente clínico" body="Datos, motivo de consulta, plan de intervención con checkboxes, historial completo." />
          <Feature Icon={Calendar} title="Calendario inteligente" body="Vista mensual, semanal y diaria. Color-coding por paciente. Sincronización Google Calendar (Pro)." />
          <Feature Icon={MessageCircle} title="Recordatorios WhatsApp" body="Confirmación automática de sesiones a tus pacientes. Reduce inasistencias (Pro)." />
          <Feature Icon={Heart} title="Estado de ánimo" body="Registra cómo llega el paciente a cada sesión. Visualiza progresos a lo largo del tiempo." />
          <Feature Icon={Shield} title="100% seguro" body="Cifrado end-to-end, multi-tenant con RLS, cumplimiento NOM-024 listo." />
          <Feature Icon={Smartphone} title="Web · Escritorio · Móvil" body="Disponible en tu computadora, MacBook y celular. Widgets nativos en iOS y Android." />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-8 py-20">
        <h2 className="font-display text-5xl text-center mb-3">Precios honestos</h2>
        <p className="text-center mb-16" style={{ color: "#9B7B87" }}>Empieza gratis. Crece cuando estés lista.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((p) => (
            <div key={p.id} className="p-8 rounded-3xl" style={{ background: p.id === "pro" ? "linear-gradient(135deg, rgba(253,232,240,0.9), rgba(249,212,212,0.7))" : "rgba(255,255,255,0.7)", border: "1px solid rgba(232,160,191,0.25)", boxShadow: "0 8px 32px rgba(200, 100, 130, 0.08)" }}>
              <h3 className="font-display text-3xl mb-2">{p.nombre}</h3>
              <div className="mb-6">
                <span className="font-display text-5xl">${p.precio_mensual_mxn}</span>
                <span style={{ color: "#9B7B87" }}> MXN/mes</span>
                {p.precio_anual_mxn > 0 && <p className="text-sm mt-1" style={{ color: "#9B7B87" }}>o ${p.precio_anual_mxn}/año (ahorra ${p.precio_mensual_mxn * 12 - p.precio_anual_mxn})</p>}
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => <li key={f} className="flex gap-2 items-start text-sm"><Check size={16} style={{ color: "#5a8a55", marginTop: 2 }} /> {f}</li>)}
              </ul>
              <Link href={`${APP_URL}/signup`} className="w-full text-center block px-5 py-3 rounded-2xl font-medium" style={{ background: p.id === "pro" ? "linear-gradient(135deg, #E8A0BF, #D88AAB)" : "rgba(255,255,255,0.7)", color: p.id === "pro" ? "white" : "#3D2B35", border: p.id === "pro" ? "none" : "1px solid rgba(232,160,191,0.3)" }}>
                {p.id === "pro" ? "Empieza con Pro" : "Empieza gratis"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-8 py-20">
        <h2 className="font-display text-5xl text-center mb-12">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {[
            ["¿Mis pacientes acceden a la app?", "No. PsiCare es uso exclusivo de la psicóloga. Los pacientes solo reciben recordatorios por WhatsApp si así lo configuras."],
            ["¿Cumple con normativa mexicana?", "Sí, diseñado considerando la NOM-024-SSA3-2012 y la Ley Federal de Protección de Datos Personales. Multi-tenant con Row Level Security."],
            ["¿Puedo cancelar cuando quiera?", "Sí, sin contratos. Cancelas desde tu cuenta y mantienes acceso hasta el final del periodo pagado."],
            ["¿Funciona offline?", "La app de escritorio (Tauri) y móvil (React Native) tienen modo offline parcial. La web requiere conexión."],
            ["¿Aceptan pagos en pesos mexicanos?", "Sí, todos los precios son en MXN y procesamos pagos con Mercado Pago (tarjeta, OXXO, SPEI)."],
          ].map(([q, a]) => (
            <details key={q} className="p-6 rounded-2xl cursor-pointer" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(232,160,191,0.18)" }}>
              <summary className="font-medium">{q}</summary>
              <p className="mt-3 text-sm" style={{ color: "#9B7B87" }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-8 py-10 text-center text-sm" style={{ color: "#9B7B87" }}>
        © 2026 PsiCare · Hecho con 🌸 en México
      </footer>
    </main>
  );
}

function Feature({ Icon, title, body }: { Icon: any; title: string; body: string }) {
  return (
    <div className="p-7 rounded-3xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(232,160,191,0.18)" }}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #E8A0BF, #D88AAB)" }}>
        <Icon className="text-white" size={20} />
      </div>
      <h3 className="font-display text-2xl mb-2">{title}</h3>
      <p className="text-sm" style={{ color: "#9B7B87" }}>{body}</p>
    </div>
  );
}
