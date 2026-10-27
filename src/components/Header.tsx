"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, ArrowUpRight } from "lucide-react";
import { Brand } from "./Brand";
export function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          href="/"
          className="brand-link"
          aria-label="COOL Living Sacrifice — beranda"
        >
          <Brand />
        </Link>
        <nav aria-label="Navigasi utama" className="desktop-nav">
          <Link
            href="/"
            className={path === "/" ? "nav-link active" : "nav-link"}
          >
            Ruang firman
          </Link>
          <Link href="/sharing/baru" className="button primary">
            <Plus size={17} aria-hidden="true" /> Tulis sharing
          </Link>
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Buka menu navigasi">
            <Menu size={23} aria-hidden="true" />
          </summary>
          <nav aria-label="Navigasi ponsel">
            <Link
              href="/"
              onClick={(e) =>
                e.currentTarget.closest("details")?.removeAttribute("open")
              }
            >
              Ruang firman <ArrowUpRight size={17} />
            </Link>
            <Link
              href="/sharing/baru"
              onClick={(e) =>
                e.currentTarget.closest("details")?.removeAttribute("open")
              }
            >
              Tulis sharing <Plus size={17} />
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
