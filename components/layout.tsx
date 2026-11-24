import Link from "next/link";
import { Button } from "@/components/ui/button";
export function Brand() {
  return (
    <Link className="brand" href="/">
      <img src="/logo.png" alt="" />
      <span>
        LPK Sekai Arimbi<small>LEMBAGA PELATIHAN KERJA</small>
      </span>
    </Link>
  );
}
export function Header() {
  return (
    <header>
      <div className="bar">
        <Brand />
        <nav aria-label="Navigasi utama">
          <Link href="/">Beranda</Link>
          <a href="/#program">Program</a>
          <a href="/#tentang">Tentang Kami</a>
          <a href="/#kontak">Kontak</a>
        </nav>
        <Button asChild>
          <Link href="/pendaftaran">Daftar Sekarang</Link>
        </Button>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="wrap">
      <b>LPK Sekai Arimbi</b>
      <span>Majalengka, Jawa Barat</span>
      <Link className="admin-link" href="/admin/login">
        Login admin
      </Link>
    </footer>
  );
}
