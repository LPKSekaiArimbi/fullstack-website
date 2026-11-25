import Link from "next/link";
import { BookOpen, BriefcaseBusiness, Landmark } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { HeroCarousel } from "@/components/hero-carousel";
import { Button } from "@/components/ui/button";
const programs = [
  {
    Icon: BookOpen,
    title: "Bahasa Jepang",
    body: "Mulai dari hiragana dan katakana hingga latihan percakapan sehari-hari.",
  },
  {
    Icon: Landmark,
    title: "Budaya Kerja Jepang",
    body: "Kenali etika, kedisiplinan, dan cara berkomunikasi di lingkungan kerja Jepang.",
  },
  {
    Icon: BriefcaseBusiness,
    title: "Persiapan Seleksi",
    body: "Latih perkenalan diri, simulasi wawancara atau mensetsu, dan soal psikotes.",
  },
];
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero wrap">
          <div className="intro">
            <p className="label">
              <i />
              LPK SEKAI ARIMBI
            </p>
            <h1>
              Mulai langkahmu
              <br />
              ke <em>Jepang.</em>
            </h1>
            <p className="lead">
              Belajar bahasa Jepang, kenali budaya kerjanya, dan persiapkan diri
              untuk seleksi kerja bersama LPK Sekai Arimbi di Majalengka.
            </p>
            <div className="actions">
              <Button asChild>
                <Link href="/pendaftaran">Isi Formulir Pendaftaran</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="#program">Lihat Program</a>
              </Button>
            </div>
          </div>
          <HeroCarousel />
        </section>
        <section className="program" id="program">
          <div className="wrap">
            <p className="label">
              <i />
              PROGRAM PELATIHAN
            </p>
            <h2>Bekal menuju Jepang</h2>
            <div className="cards">
              {programs.map(({ Icon, title, body }) => (
                <article key={title}>
                  <Icon />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="wrap about" id="tentang">
          <div>
            <p className="label">
              <i />
              TENTANG KAMI
            </p>
            <h2>
              Dari Majalengka,
              <br />
              menuju Jepang.
            </h2>
          </div>
          <div>
            <p>
              LPK Sekai Arimbi adalah lembaga pelatihan kerja di Majalengka,
              Jawa Barat, bagi calon siswa yang ingin mempersiapkan diri untuk
              bekerja di Jepang.
            </p>
            <p>
              Isi formulir calon siswa secara online dan simpan nomor
              pendaftaranmu setelah formulir terkirim.
            </p>
          </div>
        </section>
        <section id="kontak">
          <div className="wrap contact">
            <div>
              <p className="label">
                <i />
                HUBUNGI KAMI
              </p>
              <h2>Ada pertanyaan tentang pelatihan?</h2>
              <p>Tanyakan jadwal, biaya, atau kegiatan belajar.</p>
            </div>
            <div>
              <a className="btn gold" href="https://wa.me/6285287155627">
                Tanya tentang pelatihan
              </a>
              <a className="email" href="mailto:lpksekaiarimbi@gmail.com">
                lpksekaiarimbi@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
