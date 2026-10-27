"use client";
import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";
export function DeleteConfirmDialog({
  open,
  title,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  pending?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) {
      el.showModal();
      cancel.current?.focus();
    } else if (!open && el?.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="delete-dialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-top">
          <span className="danger-icon">
            <Trash2 size={23} />
          </span>
          <button
            type="button"
            className="icon-button"
            onClick={onCancel}
            disabled={pending}
            aria-label="Tutup konfirmasi"
          >
            <X size={19} />
          </button>
        </div>
        <h2 id="delete-title">Hapus sharing ini?</h2>
        <p id="delete-description">
          Catatan <strong>“{title}”</strong> akan dihapus secara permanen.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        {error && (
          <p role="alert" className="field-error">
            Penghapusan gagal. {error} Silakan coba kembali.
          </p>
        )}
        <div className="dialog-actions">
          <button
            ref={cancel}
            type="button"
            className="button secondary"
            onClick={onCancel}
            disabled={pending}
          >
            Batal
          </button>
          <button
            type="button"
            className="button danger"
            onClick={onConfirm}
            disabled={pending}
          >
            <Trash2 size={16} />
            {pending ? "Menghapus..." : "Konfirmasi hapus"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
