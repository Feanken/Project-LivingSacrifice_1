"use client";
import { AlertCircle, RotateCcw } from "lucide-react";
export function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-message" role="alert">
      <AlertCircle size={21} aria-hidden="true" />
      <div>
        <p>{message}</p>
        {onRetry && (
          <button className="button secondary small" onClick={onRetry}>
            <RotateCcw size={15} aria-hidden="true" />
            Coba kembali
          </button>
        )}
      </div>
    </div>
  );
}
