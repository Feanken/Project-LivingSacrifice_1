import { Heart } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer shell">
      <p>
        COOL Living Sacrifice<span className="footer-dot">·</span> Bertumbuh
        bersama dalam firman.
      </p>
      <span>
        Dibagikan dengan kasih <Heart size={13} aria-hidden="true" />
      </span>
    </footer>
  );
}
