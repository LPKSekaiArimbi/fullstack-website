import "./globals.css";
import type { Metadata } from "next";
import { NavigationGuard } from "@/components/navigation-guard";
export const metadata: Metadata = {
  title: { default: "LPK Sekai Arimbi", template: "%s | LPK Sekai Arimbi" },
  description:
    "Pelatihan bahasa Jepang dan persiapan kerja di Jepang dari Majalengka.",
  icons: { icon: "/logo.png" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <NavigationGuard />
        {children}
      </body>
    </html>
  );
}
