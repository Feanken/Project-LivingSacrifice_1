"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useSharingFirmanDetail } from "@/hooks/useSharingFirmanDetail";
import { useUpdateSharingFirman } from "@/hooks/useUpdateSharingFirman";
import { useOwnership } from "@/hooks/useOwnership";
import { SharingForm } from "./SharingForm";
import { ErrorMessage } from "./ErrorMessage";
import type { SharingFirmanInput } from "@/types/sharing-firman";
export function EditView({ id }: { id: string }) {
  const { isOwner, ready } = useOwnership(id);
  const query = useSharingFirmanDetail(id);
  const mutation = useUpdateSharingFirman(id);
  const router = useRouter();
  useEffect(() => {
    if (ready && !isOwner) router.replace(`/sharing/${id}?status=forbidden`);
  }, [ready, isOwner, router, id]);
  async function submit(input: SharingFirmanInput) {
    await mutation.mutateAsync(input);
    router.push(`/sharing/${id}?status=updated`);
  }
  return (
    <div className="shell form-page">
      <Link href={`/sharing/${id}`} className="back-link">
        <ArrowLeft size={16} />
        Kembali ke sharing
      </Link>
      <div className="page-heading">
        <p className="eyebrow">RUANG UNTUK MENYEMPURNAKAN</p>
        <h1>
          Perbarui <em>catatan Anda.</em>
        </h1>
        <p>Lengkapi pesan yang ingin Anda bagikan.</p>
      </div>
      {!ready ? (
        <p role="status">Memeriksa akses...</p>
      ) : !isOwner ? (
        <ErrorMessage message="Aksi tidak diizinkan. Anda hanya dapat mengedit dari browser tempat sharing ini dibuat." />
      ) : query.isPending ? (
        <p role="status">Memuat catatan...</p>
      ) : query.error ? (
        <ErrorMessage
          message={query.error.message}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : (
        query.data && (
          <SharingForm
            initialData={query.data}
            onSubmit={submit}
            pending={mutation.isPending || mutation.isSuccess}
            error={mutation.error}
            cancelHref={`/sharing/${id}`}
          />
        )
      )}
    </div>
  );
}
