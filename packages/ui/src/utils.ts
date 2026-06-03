import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const initials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  !iso ? "" : new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", ...opts });

export const formatTime = (iso: string) =>
  !iso ? "" : new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

export const formatDateTime = (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`;

export const relativeTime = (iso: string) => {
  if (!iso) return "";
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(diffMin) < 60) return diffMin === 0 ? "ahora" : diffMin > 0 ? `en ${diffMin} min` : `hace ${-diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return diffH > 0 ? `en ${diffH} h` : `hace ${-diffH} h`;
  const diffD = Math.round(diffH / 24);
  return diffD > 0 ? `en ${diffD} días` : `hace ${-diffD} días`;
};

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() + ((day === 0 ? -6 : 1) - day));
  x.setHours(0, 0, 0, 0);
  return x;
};
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const monthName = (d: Date) => d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
export const dayLabel = (d: Date) => d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
