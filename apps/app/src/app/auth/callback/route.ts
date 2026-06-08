//apps/app/src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@psicare/db/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // Si venimos de un lugar específico, Next lo guarda aquí. Si no, al dashboard.
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    
    // Aquí ocurre la magia: cambiamos el código de Google por Cookies de sesión reales
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Error intercambiando código:", error.message);
    }
  }

  // Si algo falla o no hay código, lo mandamos al login con un error
  return NextResponse.redirect(`${origin}/login?error=OauthError`);
}