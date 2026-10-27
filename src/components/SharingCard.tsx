import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import type { SharingFirmanListItem } from "@/types/sharing-firman";
export function SharingCard({
  sharing,
  index = 0,
}: {
  sharing: SharingFirmanListItem;
  index?: number;
}) {
  const initials = Array.from(
    sharing.nama_pembagi
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => Array.from(s)[0])
      .join("")
      .toUpperCase(),
  )
    .slice(0, 2)
    .join("");
  return (
    <article className={`sharing-card card-tone-${index % 3}`}>
      <Link
        href={`/sharing/${sharing.id}`}
        aria-label={`Baca ${sharing.judul}`}
        className="card-link"
      >
        <div className="card-top">
          <span className="card-category">
            <span /> CATATAN FIRMAN
          </span>
          <ArrowUpRight size={19} className="card-arrow" aria-hidden="true" />
        </div>
        <h3>{sharing.judul}</h3>
        {sharing.ayat_referensi && (
          <p className="card-verse">
            <BookOpen size={14} aria-hidden="true" />
            {sharing.ayat_referensi}
          </p>
        )}
        <p className="card-snippet">{sharing.cuplikan}</p>
        <div className="card-footer">
          <span className="author">
            <span className="avatar" aria-hidden="true">
              {initials}
            </span>
            <span>{sharing.nama_pembagi}</span>
          </span>
          <span className="card-date">
            <CalendarDays size={13} aria-hidden="true" />
            {formatDate(sharing.tanggal_sharing)}
          </span>
        </div>
      </Link>
    </article>
  );
}
