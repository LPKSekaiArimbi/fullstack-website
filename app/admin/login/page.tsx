import { Brand } from "@/components/layout";
import { LoginForm } from "@/components/forms";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
export const metadata = { title: "Login admin", robots: { index: false } };
export default async function Page() {
  if (await isAdmin()) redirect("/admin/dashboard");
  return (
    <>
      <header className="adminbar">
        <div className="bar">
          <Brand />
        </div>
      </header>
      <main className="shell">
        <section className="sheet">
          <p className="label">
            <i />
            LPK SEKAI ARIMBI
          </p>
          <LoginForm />
        </section>
      </main>
    </>
  );
}
