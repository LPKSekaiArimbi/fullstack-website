"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function MobileStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("hero-registration-cta");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio < 0.25),
      { threshold: [0, 0.25] },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="mobile-sticky-cta">
      <span>Siap memulai?</span>
      <Link className="btn navy" href="/pendaftaran">
        Daftar Sekarang
      </Link>
    </div>
  );
}
