import { redirect } from "next/navigation";
import { createClient } from "@psicare/db/server";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: psicologa } = await supabase
    .from("psicologas")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  // Fallback: if for any reason the trigger didn't create the row, route to setup
  if (!psicologa) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="card-soft p-8 max-w-md text-center">
          <h2 className="font-display text-3xl mb-3">Configurando tu cuenta...</h2>
          <p className="text-sm" style={{ color: "var(--psi-soft)" }}>
            Si esto persiste, asegúrate de haber ejecutado el SQL inicial en Supabase
            (<code>packages/db/migrations/0001_init.sql</code>) que crea el trigger
            <code> on_auth_user_created</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar psicologa={psicologa as any} />
      <main className="ml-64 p-8 min-h-screen" data-testid="main-content">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
