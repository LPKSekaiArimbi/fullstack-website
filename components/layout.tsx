import Link from "next/link";
import { HeaderNavigation } from "@/components/header-navigation";
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
        <HeaderNavigation />
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
