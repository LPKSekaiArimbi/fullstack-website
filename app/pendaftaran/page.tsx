import { randomUUID } from "node:crypto";
import { Header, Footer } from "@/components/layout";
import { RegistrationForm } from "@/components/forms";
export const dynamic = "force-dynamic";
export const metadata = { title: "Pendaftaran siswa baru" };
export default function Page() {
  return (
    <>
      <Header />
      <main className="shell">
        <section className="sheet">
          <p className="label">
            <i />
            CALON SISWA
          </p>
          <RegistrationForm id={randomUUID()} />
        </section>
      </main>
      <Footer />
    </>
  );
}
