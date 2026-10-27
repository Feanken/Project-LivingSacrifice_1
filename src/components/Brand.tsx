import { BookOpen } from "lucide-react";
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <BookOpen size={23} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <span>
        <strong>
          COOL <span>Living Sacrifice</span>
        </strong>
        <small>COMMUNITY OF LOVE</small>
      </span>
    </span>
  );
}
