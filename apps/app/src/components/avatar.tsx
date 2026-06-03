import { initials } from "@psicare/ui";

export function Avatar({ name, color = "#E8A0BF", size = 40 }: { name: string; color?: string; size?: number }) {
  return (
    <span
      data-testid="avatar"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        fontSize: size * 0.38,
        boxShadow: `0 4px 12px ${color}40`,
        borderRadius: "50%", color: "white", fontWeight: 600,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {initials(name)}
    </span>
  );
}
