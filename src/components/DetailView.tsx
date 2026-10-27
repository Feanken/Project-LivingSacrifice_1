"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { useSharingFirmanDetail } from "@/hooks/useSharingFirmanDetail";
import { useOwnership } from "@/hooks/useOwnership";
import { useDeleteSharingFirman } from "@/hooks/useDeleteSharingFirman";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { ErrorMessage } from "./ErrorMessage";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
export function DetailView({ id }: { id: string }) {
  const query = useSharingFirmanDetail(id);
  const { isOwner } = useOwnership(id);
  const mutation = useDeleteSharingFirman(id);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  const status = useSearchParams().get("status");
  const remove = async () => {
    try {
      await mutation.mutateAsync();
      router.push("/");
    } catch {
      /* Dialog shows retryable error. */
    }
  };
  return (
    <div className="shell detail-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Kembali ke ruang firman
      </Link>
      {status === "forbidden" && (
        <ErrorMessage message="Aksi tidak diizinkan. Anda hanya dapat mengedit dari browser tempat sharing ini dibuat." />
      )}
      {status && ["created", "updated"].includes(status) && (
        <p className="success-message" role="status">
          <CheckCircle2 size={18} />
          Sharing firman berhasil{" "}
          {status === "created" ? "disimpan" : "diperbarui"}.
        </p>
      )}
      {query.isPending ? (
        <div className="detail-skeleton" role="status">
          Memuat sharing firman...
        </div>
      ) : query.error ? (
        <ErrorMessage
          message={query.error.message}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : (
        query.data && (
          <article className="detail-article">
            <div className="detail-header">
              <p className="eyebrow">
                <span /> CATATAN FIRMAN
              </p>
              <h1>{query.data.judul}</h1>
              <div className="detail-meta">
                <span>
                  <UserRound size={16} />
                  {query.data.nama_pembagi}
                </span>
                <span>
                  <CalendarDays size={16} />
                  {formatDate(query.data.tanggal_sharing)}
                </span>
              </div>
            </div>
            {query.data.ayat_referensi && (
              <div className="detail-reference">
                <BookOpen size={20} aria-hidden="true" />
                <div>
                  <span>AYAT REFERENSI</span>
                  <p>{query.data.ayat_referensi}</p>
                </div>
              </div>
            )}
            <div className="detail-body">{query.data.isi_ringkasan}</div>
            <div className="detail-end-mark">✳</div>
            <div className="detail-bottom">
              <p>
                Terakhir diperbarui
                <br />
                <time dateTime={query.data.diperbarui_pada}>
                  {formatDateTime(query.data.diperbarui_pada)} WIB
                </time>
              </p>
              {isOwner && (
                <div className="owner-actions">
                  <Link
                    href={`/sharing/${id}/edit`}
                    className="button secondary"
                  >
                    <Pencil size={15} />
                    Edit sharing
                  </Link>
                  <button
                    type="button"
                    className="button text-danger"
                    onClick={() => {
                      mutation.reset();
                      setConfirm(true);
                    }}
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </div>
              )}
            </div>
            {isOwner && (
              <p className="detail-owner-note">
                Catatan ini milik Anda. Akses edit dan hapus tersimpan di
                browser ini.
              </p>
            )}
            <DeleteConfirmDialog
              open={confirm}
              title={query.data.judul}
              pending={mutation.isPending}
              error={mutation.error?.message}
              onConfirm={() => {
                void remove();
              }}
              onCancel={() => setConfirm(false)}
            />
          </article>
        )
      )}
    </div>
  );
}
