//packages/billing/src/index.ts
import { PLANS, type Plan } from "@psicare/types";

export { PLANS };
export type { Plan };

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function canAddPaciente(
  currentCount: number,
  plan: Plan
): { allowed: boolean; reason?: string } {
  if (plan.max_pacientes === null) return { allowed: true };
  if (currentCount >= plan.max_pacientes) {
    return {
      allowed: false,
      reason: `Tu plan ${plan.nombre} permite máximo ${plan.max_pacientes} paciente${plan.max_pacientes === 1 ? "" : "s"}. Actualiza a Pro para pacientes ilimitados.`,
    };
  }
  return { allowed: true };
}

export function hasFeature(
  plan: Plan,
  feature: "whatsapp_reminders" | "google_calendar_sync" | "export_pdf" | "stats_advanced"
): boolean {
  return plan.id === "pro";
}
