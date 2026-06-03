import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PsiCare — Tu consulta en calma",
  description: "Gestión clínica para psicólogas. Pacientes, calendario, plan de intervención y notas — con estética macOS y calidez rosa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" toastOptions={{ style: { background: "linear-gradient(135deg, #E8A0BF, #D88AAB)", color: "white", border: "none" } }} />
      </body>
    </html>
  );
}
