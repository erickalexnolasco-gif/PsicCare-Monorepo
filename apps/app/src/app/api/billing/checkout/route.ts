import { NextResponse } from "next/server";
import { createClient } from "@psicare/db/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();

  // Mercado Pago no configurado aún — mostrar mensaje informativo
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({
      error: "Mercado Pago no configurado. Agrega MP_ACCESS_TOKEN en tus variables de entorno.",
      info: "Ver SETUP.md para instrucciones de configuración.",
    }, { status: 503 });
  }

  // TODO: implementar Mercado Pago cuando esté listo
  return NextResponse.json({ error: "Mercado Pago pendiente de configuración" }, { status: 503 });
}
