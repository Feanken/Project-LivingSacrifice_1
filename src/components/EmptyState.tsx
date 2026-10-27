import Link from "next/link";
import { BookOpen, SearchX, Plus } from "lucide-react";
export function EmptyState({
  filtered = false,
  onReset,
}: {
  filtered?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        {filtered ? (
          <SearchX size={30} strokeWidth={1.4} />
        ) : (
          <BookOpen size={32} strokeWidth={1.4} />
        )}
      </span>
      <h3>
        {filtered
          ? "Belum menemukan yang Anda cari?"
          : "Belum ada sharing firman yang tercatat"}
      </h3>
      <p>
        {filtered
          ? "Tidak ada hasil yang ditemukan untuk kata kunci atau filter ini. Coba kata lain atau lihat semua sharing."
          : "Setiap firman punya cerita. Jadilah yang pertama membagikan catatan dan menguatkan satu sama lain."}
      </p>
      {filtered ? (
        <button className="button secondary" onClick={onReset}>
          Reset pencarian
        </button>
      ) : (
        <Link className="button primary" href="/sharing/baru">
          <Plus size={17} />
          Tulis sharing pertama
        </Link>
      )}
    </div>
  );
}
