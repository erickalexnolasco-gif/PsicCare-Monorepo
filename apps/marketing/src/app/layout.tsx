import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "PsiCare — Software de gestión clínica para psicólogas en México",
    template: "%s | PsiCare",
  },
  description:
    "Gestiona tu consulta psicológica con expedientes digitales, calendario inteligente y plan de intervención. Hecho exclusivamente para psicólogas mexicanas. Empieza gratis.",
  keywords: [
    "software psicólogos México",
    "gestión clínica psicología",
    "expediente electrónico psicólogo",
    "agenda psicóloga",
    "software consulta psicológica",
    "PsiCare",
  ],
  authors: [{ name: "PsiCare" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://psicare.mx",
    title: "PsiCare — Tu consulta, en calma",
    description:
      "Software de gestión clínica diseñado para psicólogas que valoran la presencia, los detalles y el espacio terapéutico.",
    siteName: "PsiCare",
  },
  twitter: {
    card: "summary_large_image",
    title: "PsiCare — Software para psicólogas en México",
    description: "Gestión clínica moderna. Pacientes, calendario, notas y más.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
