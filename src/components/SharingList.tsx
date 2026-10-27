import type { SharingFirmanListItem } from "@/types/sharing-firman";
import { SharingCard } from "./SharingCard";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
export function SharingList({
  data,
  loading,
  error,
  filtered,
  onReset,
  onRetry,
}: {
  data: SharingFirmanListItem[];
  loading?: boolean;
  error?: string;
  filtered?: boolean;
  onReset?: () => void;
  onRetry?: () => void;
}) {
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  if (loading)
    return (
      <div
        className="sharing-grid"
        role="status"
        aria-label="Memuat sharing firman"
      >
        {[0, 1, 2].map((n) => (
          <div key={n} className="skeleton-card">
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  if (!data.length) return <EmptyState filtered={filtered} onReset={onReset} />;
  return (
    <div className="sharing-grid">
      {data.map((sharing, index) => (
        <SharingCard key={sharing.id} sharing={sharing} index={index} />
      ))}
    </div>
  );
}
