import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Ruang Firman | COOL Living Sacrifice",
    template: "%s | COOL Living Sacrifice",
  },
  description:
    "Ruang komunitas COOL Living Sacrifice untuk berbagi, menyimpan, dan merenungkan firman Tuhan bersama.",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f7f2",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <QueryProvider>
          <a className="skip-link" href="#main">
            Langsung ke konten
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
