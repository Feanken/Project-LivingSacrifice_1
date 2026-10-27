import Link from "next/link";
import { BookOpen } from "lucide-react";
export default function NotFound() {
  return (
    <div className="shell empty-state">
      <BookOpen size={40} />
      <p className="eyebrow">404</p>
      <h1>Halaman tidak ditemukan</h1>
      <p>Mari kembali ke ruang firman dan temukan catatan lainnya.</p>
      <Link className="button primary" href="/">
        Kembali ke ruang firman
      </Link>
    </div>
  );
}
