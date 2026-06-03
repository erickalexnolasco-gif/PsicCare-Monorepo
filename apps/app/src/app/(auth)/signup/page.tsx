import { SignupForm } from "./form";
import { Heart, Sparkles } from "lucide-react";

export const metadata = { title: "Crear cuenta · PsiCare" };

export default function SignupPage() {
  return (
    <div className="min-h-screen flex" data-testid="signup-page">
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md fade-up">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8A0BF, #D88AAB)", boxShadow: "0 8px 24px rgba(216, 138, 171, 0.4)" }}>
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h1 className="font-display text-3xl leading-none">PsiCare</h1>
              <p className="text-xs tracking-widest uppercase mt-1" style={{ color: "var(--psi-soft)" }}>tu consulta, en calma</p>
            </div>
          </div>
          <h2 className="font-display text-5xl mb-3">Empieza gratis.</h2>
          <p className="mb-10" style={{ color: "var(--psi-soft)" }}>Crea tu cuenta en 30 segundos. Sin tarjeta de crédito.</p>
          <SignupForm />
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FDE8F0 0%, #F9D4D4 100%)" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(232, 160, 191, 0.5), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.6), transparent 50%)" }} />
        <div className="relative z-10 max-w-lg">
          <div className="glass-pink p-8 rounded-3xl mb-8">
            <div className="traffic-lights" style={{ padding: 0, marginBottom: 16 }}><span /><span /><span /></div>
            <div className="flex items-center gap-3 mb-4">
              <Heart size={20} style={{ color: "#D88AAB" }} />
              <span className="font-medium">Tu consulta, organizada</span>
            </div>
            <p className="font-display text-3xl mb-2">Todo en un solo lugar</p>
            <p className="text-sm" style={{ color: "var(--psi-soft)" }}>Pacientes · Calendario · Notas clínicas</p>
            <div className="mt-5 flex gap-2"><span className="badge badge-success">Plan gratuito</span><span className="badge badge-info">Sin tarjeta</span></div>
          </div>
          <h3 className="font-display text-4xl mb-3">Hecho para psicólogas mexicanas.</h3>
          <p className="text-lg leading-relaxed" style={{ color: "var(--psi-soft)" }}>Diseñado con el proceso terapéutico en mente. No como un CRM, sino como un espacio de cuidado.</p>
        </div>
      </div>
    </div>
  );
}
