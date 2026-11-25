import { randomUUID } from "node:crypto";
import { Brand } from "@/components/layout";
import { RegistrationForm } from "@/components/forms";
export const dynamic = "force-dynamic";
export const metadata = { title: "Pendaftaran siswa baru" };
export default function Page() {
  return (
    <>
      <header className="regisBar">
        <div className="bar">
          <Brand />
        </div>
      </header>
      <main className="shell">
        <section className="sheet">
          <p className="label">
            <i />
            CALON SISWA
          </p>
          <RegistrationForm id={randomUUID()} />
        </section>
      </main>
    </>
  );
}
