import Link from "next/link";
import { BookOpen, BriefcaseBusiness, Landmark } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { HeroCarousel } from "@/components/hero-carousel";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";
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
      <main className="home-main">
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
              Persiapkan diri untuk bekerja di Jepang melalui pembelajaran
              bahasa, budaya kerja, dan latihan seleksi di Majalengka.
            </p>
            <div className="actions">
              <Button asChild>
                <Link id="hero-registration-cta" href="/pendaftaran">
                  Daftar Sekarang
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="#program">Lihat Program</a>
              </Button>
            </div>
            <p className="hero-note">
              Siapkan data diri dan dokumen sebelum mengisi formulir.
            </p>
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
            <p className="program-lead">
              Kenali tiga fokus pembelajaran untuk mempersiapkan langkahmu.
            </p>
            <div className="cards">
              {programs.map(({ Icon, title, body }, index) => (
                <article key={title} className="program-card">
                  <div className="program-card-heading">
                    <span className="program-card-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="program-card-index">
                      Fokus 0{index + 1}
                    </span>
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="registration-steps"
          aria-labelledby="registration-steps-title"
        >
          <div className="wrap">
            <p className="label">
              <i />
              ALUR PENDAFTARAN
            </p>
            <h2 id="registration-steps-title">Siapkan pendaftaranmu</h2>
            <p className="steps-lead">
              Ikuti langkah berikut agar proses pengisian formulir lebih lancar.
            </p>
            <ol className="steps-list">
              <li>
                <span className="step-number">01</span>
                <div>
                  <h3>Siapkan data dan dokumen</h3>
                  <p>
                    Periksa data diri dan berkas yang diminta pada formulir
                    pendaftaran.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number">02</span>
                <div>
                  <h3>Isi formulir online</h3>
                  <p>
                    Lengkapi informasi calon siswa dan unggah dokumen yang
                    diperlukan.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number">03</span>
                <div>
                  <h3>Simpan kode pendaftaran</h3>
                  <p>
                    Catat kode yang ditampilkan setelah formulir berhasil
                    dikirim.
                  </p>
                </div>
              </li>
            </ol>
            <Button asChild className="steps-cta">
              <Link href="/pendaftaran">Mulai Pendaftaran</Link>
            </Button>
          </div>
        </section>
        <section className="wrap about" id="tentang">
          <div className="about-copy">
            <p className="label">
              <i />
              TENTANG KAMI
            </p>
            <h2>
              Dari Majalengka,
              <br />
              menuju Jepang.
            </h2>
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
          <figure className="about-photo">
            <img
              src="/dokumentasi.jpeg"
              // alt="Ilustrasi kelas bahasa Jepang dengan pengajar menulis di papan"
              width="960"
              height="717"
              loading="lazy"
              decoding="async"
            />
            {/* <figcaption>
              <span>Foto ilustrasi, bukan dokumentasi kegiatan LPK Sekai Arimbi.</span>
              <span>
                "Japanese course" oleh{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Japanese_course.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rexdanato / Wikimedia Commons
                </a>
                {" · "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-SA 4.0
                </a>
                {" · ditampilkan dengan pemotongan ringan"}
              </span>
            </figcaption>*/}
          </figure>
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
      <MobileStickyCta />
      <Footer />
    </>
  );
}
