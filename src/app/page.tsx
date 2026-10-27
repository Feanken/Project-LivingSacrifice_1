"use client";
import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { FilterDropdown } from "@/components/FilterDropdown";
import { SharingList } from "@/components/SharingList";
import { useDebounce } from "@/hooks/useDebounce";
import { useSharingFirmanList } from "@/hooks/useSharingFirmanList";
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [pembagi, setPembagi] = useState("");
  const [page, setPage] = useState(1);
  const stableParams = useDebounce(
    JSON.stringify({ q: search.trim(), pembagi, page }),
    300,
  );
  const params = JSON.parse(stableParams) as {
    q: string;
    pembagi: string;
    page: number;
  };
  const query = useSharingFirmanList({ ...params, limit: 9 });
  const filtered = !!(search.trim() || pembagi);
  const reset = () => {
    setSearch("");
    setPembagi("");
    setPage(1);
  };
  const pages = Math.max(1, Math.ceil((query.data?.total ?? 0) / 9));
  return (
    <>
      <Hero />
      <section className="library shell" aria-labelledby="library-title">
        <div className="library-heading">
          <div>
            <p className="eyebrow">DARI HATI, UNTUK SESAMA</p>
            <h2 id="library-title">
              Catatan firman{" "}
              <span className="count-badge">{query.data?.total ?? "—"}</span>
            </h2>
          </div>
          <p className="sort-note">
            <ArrowDownWideNarrow size={15} aria-hidden="true" />
            Terbaru lebih dahulu
          </p>
        </div>
        <div className="library-toolbar">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
          <FilterDropdown
            names={query.data?.pembagi ?? []}
            value={pembagi}
            onChange={(value) => {
              setPembagi(value);
              setPage(1);
            }}
          />
        </div>
        {filtered && (
          <div className="filter-summary">
            <span>
              Hasil{" "}
              {search.trim() && (
                <>
                  untuk <strong>“{search.trim()}”</strong>{" "}
                </>
              )}
              {pembagi && (
                <>
                  dari <strong>{pembagi}</strong>
                </>
              )}
            </span>
            <button className="reset-button" onClick={reset}>
              Reset filter
              <X size={14} />
            </button>
          </div>
        )}
        <div
          aria-busy={query.isFetching}
          className={query.isPlaceholderData ? "results updating" : "results"}
        >
          <SharingList
            data={query.data?.data ?? []}
            loading={query.isPending}
            error={query.error?.message}
            filtered={filtered}
            onReset={reset}
            onRetry={() => {
              void query.refetch();
            }}
          />
        </div>
        <div className="library-bottom">
          <p aria-live="polite">
            {query.isFetching
              ? "Memuat catatan..."
              : query.data &&
                `${query.data.total} sharing ${filtered ? "ditemukan" : "untuk direnungkan bersama"}`}
          </p>
          {pages > 1 && (
            <nav className="pagination" aria-label="Halaman sharing">
              <button
                className="icon-button"
                aria-label="Halaman sebelumnya"
                disabled={page <= 1 || query.isPlaceholderData}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                {page} / {pages}
              </span>
              <button
                className="icon-button"
                aria-label="Halaman berikutnya"
                disabled={page >= pages || query.isPlaceholderData}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </div>
      </section>
      <section className="community-note shell">
        <span className="note-sprout">✳</span>
        <p>
          Firman-Nya tidak berhenti di pertemuan.
          <br />
          <strong>Mari membawanya dalam keseharian.</strong>
        </p>
        <span className="community-signature">Living Sacrifice</span>
      </section>
    </>
  );
}
