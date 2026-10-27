"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Feather } from "lucide-react";
import { SharingForm } from "@/components/SharingForm";
import { useCreateSharingFirman } from "@/hooks/useCreateSharingFirman";
import { saveToken } from "@/lib/creator-token";
import type { SharingFirmanInput } from "@/types/sharing-firman";
export default function CreatePage() {
  const mutation = useCreateSharingFirman();
  const router = useRouter();
  const [storageError, setStorageError] = useState("");
  const submit = async (input: SharingFirmanInput) => {
    const result = await mutation.mutateAsync(input);
    if (result.ownershipSaved)
      router.push(`/sharing/${result.data.id}?status=created`);
  };
  function retryStorage() {
    if (!mutation.data) return;
    try {
      saveToken(mutation.data.data.id, mutation.data.creator_token);
      router.push(`/sharing/${mutation.data.data.id}?status=created`);
    } catch {
      setStorageError(
        "Penyimpanan browser masih tidak tersedia. Izinkan penyimpanan lalu coba kembali.",
      );
    }
  }
  return (
    <div className="shell form-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Kembali ke ruang firman
      </Link>
      <div className="page-heading">
        <p className="eyebrow">
          <Feather size={15} /> SEBUAH CATATAN, SEBUAH BERKAT
        </p>
        <h1>
          Bagikan firman,
          <br />
          <em>kuatkan sesama.</em>
        </h1>
        <p>
          Tidak harus panjang atau sempurna. Mulailah dari pesan yang menyentuh
          hati Anda.
        </p>
      </div>
      {mutation.data && !mutation.data.ownershipSaved ? (
        <div className="form-panel">
          <h2>Sharing berhasil disimpan</h2>
          <p role="alert">
            Akses edit belum dapat disimpan di browser ini. Izinkan penyimpanan
            browser, lalu tekan tombol di bawah. Catatan Anda sudah tersimpan.
          </p>
          <button className="button primary" onClick={retryStorage}>
            Simpan akses di browser ini
          </button>
          {storageError && (
            <p className="field-error" role="alert">
              {storageError}
            </p>
          )}
          <p>
            <Link
              className="back-link"
              href={`/sharing/${mutation.data.data.id}`}
            >
              Lihat sharing tanpa akses edit
            </Link>
          </p>
        </div>
      ) : (
        <SharingForm
          onSubmit={submit}
          pending={mutation.isPending || !!mutation.data?.ownershipSaved}
          error={mutation.error}
        />
      )}
    </div>
  );
}
