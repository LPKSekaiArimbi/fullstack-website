"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeaderNavigation() {
  const [open, setOpen] = useState(false);
  const toggleButton = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={toggleButton}
        className="menu-toggle"
        type="button"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            close();
            toggleButton.current?.focus();
          }
        }}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <div
        className={`header-navigation${open ? " is-open" : ""}`}
        id="primary-navigation"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            close();
            toggleButton.current?.focus();
          }
        }}
      >
        <nav aria-label="Navigasi utama">
          <Link href="/" onClick={close}>
            Beranda
          </Link>
          <a href="/#program" onClick={close}>
            Program
          </a>
          <a href="/#tentang" onClick={close}>
            Tentang Kami
          </a>
          <a href="/#kontak" onClick={close}>
            Kontak
          </a>
        </nav>
        <Button asChild>
          <Link href="/pendaftaran" onClick={close}>
            Daftar Sekarang
          </Link>
        </Button>
      </div>
    </>
  );
}
