"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { getJakartaToday } from "@/lib/date-utils";
import { createSharingFirmanSchema, validationFields } from "@/lib/validation";
import { ClientApiError } from "@/lib/client-api";
import type { FieldErrors, SharingFirmanInput } from "@/types/sharing-firman";
import { CharacterCounter } from "./CharacterCounter";

export function SharingForm({
  initialData,
  onSubmit,
  pending = false,
  error,
  cancelHref = "/",
}: {
  initialData?: SharingFirmanInput;
  onSubmit: (input: SharingFirmanInput) => Promise<unknown>;
  pending?: boolean;
  error?: Error | null;
  cancelHref?: string;
}) {
  const [values, setValues] = useState<SharingFirmanInput>(
    () =>
      initialData ?? {
        judul: "",
        nama_pembagi: "",
        tanggal_sharing: getJakartaToday(),
        isi_ringkasan: "",
        ayat_referensi: "",
      },
  );
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const fields = {
    ...(error instanceof ClientApiError ? error.fields : {}),
    ...localErrors,
  };
  const update = (key: keyof SharingFirmanInput, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setLocalErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = createSharingFirmanSchema.safeParse(values);
    if (!result.success) {
      const next = validationFields(result.error);
      setLocalErrors(next);
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    setLocalErrors({});
    await onSubmit(result.data).catch(() => {
      /* Mutation state renders the error without losing the form. */
    });
  }
  const inputProps = (key: keyof SharingFirmanInput) => ({
    id: key,
    name: key,
    value: values[key],
    disabled: pending,
    "aria-invalid": !!fields[key],
    "aria-describedby": fields[key] ? `${key}-error` : undefined,
  });
  const fieldError = (key: keyof SharingFirmanInput) =>
    fields[key] && (
      <p id={`${key}-error`} className="field-error">
        {fields[key]}
      </p>
    );
  return (
    <form
      onSubmit={submit}
      noValidate
      className="sharing-form"
      aria-label={initialData ? "Edit sharing firman" : "Tulis sharing firman"}
    >
      <div className="form-section-head">
        <span className="section-number">01</span>
        <div>
          <h2>Tentang sharing Anda</h2>
          <p>Mulai dari judul dan siapa yang membagikan firman.</p>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="judul">
          Judul firman <span>*</span>
        </label>
        <input
          {...inputProps("judul")}
          onChange={(e) => update("judul", e.target.value)}
          maxLength={200}
          required
          placeholder="Misalnya: Setia dalam perkara kecil"
          autoComplete="off"
        />
        {fieldError("judul")}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="nama_pembagi">
            Nama pembagi <span>*</span>
          </label>
          <input
            {...inputProps("nama_pembagi")}
            onChange={(e) => update("nama_pembagi", e.target.value)}
            maxLength={255}
            required
            placeholder="Nama Anda"
            autoComplete="name"
          />
          {fieldError("nama_pembagi")}
        </div>
        <div className="form-field">
          <label htmlFor="tanggal_sharing">
            Tanggal sharing <span>*</span>
          </label>
          <input
            {...inputProps("tanggal_sharing")}
            onChange={(e) => update("tanggal_sharing", e.target.value)}
            type="date"
            max={getJakartaToday()}
            min="0001-01-01"
            required
          />
          {fieldError("tanggal_sharing")}
        </div>
      </div>
      <div className="form-divider" />
      <div className="form-section-head">
        <span className="section-number">02</span>
        <div>
          <h2>Firman yang menguatkan</h2>
          <p>Tuliskan hal yang Anda pelajari dan ingin diingat bersama.</p>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="ayat_referensi">
          Ayat referensi <small>Opsional</small>
        </label>
        <input
          {...inputProps("ayat_referensi")}
          onChange={(e) => update("ayat_referensi", e.target.value)}
          maxLength={100}
          placeholder="Misalnya: Lukas 16:10"
        />
        {fieldError("ayat_referensi")}
      </div>
      <div className="form-field">
        <label htmlFor="isi_ringkasan">
          Isi ringkasan <span>*</span>
        </label>
        <textarea
          {...inputProps("isi_ringkasan")}
          aria-describedby={[
            "summary-hint",
            "summary-counter",
            fields.isi_ringkasan ? "isi_ringkasan-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onChange={(e) =>
            update("isi_ringkasan", e.target.value.slice(0, 5000))
          }
          maxLength={5000}
          required
          rows={11}
          placeholder="Apa pesan utama firman ini? Bagikan juga bagaimana firman ini berbicara dalam kehidupan Anda..."
        />
        <div className="textarea-meta">
          <span id="summary-hint">Tulis dengan kata-kata Anda sendiri.</span>
          <CharacterCounter
            id="summary-counter"
            current={values.isi_ringkasan.length}
            max={5000}
          />
        </div>
        {fieldError("isi_ringkasan")}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error.message}
        </p>
      )}
      <p className="ownership-note">
        <LockKeyhole size={16} aria-hidden="true" />
        <span>
          Anda dapat mengedit dan menghapus sharing dari browser ini. Simpan
          data browser agar akses tersebut tetap tersedia.
        </span>
      </p>
      <div className="form-actions">
        <Link
          href={cancelHref}
          className="button secondary"
          aria-disabled={pending}
          onClick={(e) => {
            if (pending) e.preventDefault();
          }}
        >
          Batal
        </Link>
        <button type="submit" className="button primary" disabled={pending}>
          {pending
            ? "Menyimpan..."
            : initialData
              ? "Simpan perubahan"
              : "Bagikan firman"}
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
