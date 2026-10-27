"use client";
import { ErrorMessage } from "@/components/ErrorMessage";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell detail-page">
      <ErrorMessage
        message="Halaman tidak dapat dimuat. Silakan coba kembali."
        onRetry={reset}
      />
    </div>
  );
}
