import Link from "next/link";
import { ArrowUpRight, Sprout } from "lucide-react";
export function Hero() {
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span /> RUANG UNTUK BERTUMBUH BERSAMA
        </p>
        <h1 id="hero-title">
          Firman yang dibagikan,
          <br /> <em>hidup yang dikuatkan.</em>
        </h1>
        <p className="hero-description">
          Sebuah ruang untuk menyimpan, merenungkan, dan menghidupi firman
          Tuhan. Karena setiap sharing bisa menjadi berkat bagi sesama.
        </p>
        <Link href="/sharing/baru" className="text-link">
          Bagikan apa yang Anda pelajari{" "}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
        <div className="hero-footnote">
          <Sprout size={17} aria-hidden="true" />
          Satu komunitas. Banyak cerita. Satu kasih.
        </div>
      </div>
      <aside className="verse-card" aria-label="Ayat komunitas">
        <div className="verse-card-top">
          <BookIllustration />
          <span className="verse-label">DASAR PERSEKUTUAN KITA</span>
        </div>
        <blockquote>
          “Persembahkanlah tubuhmu sebagai persembahan yang hidup, yang kudus
          dan yang berkenan kepada Allah.”
        </blockquote>
        <div className="verse-bottom">
          <span className="verse-line" />
          <cite>Roma 12:1</cite>
          <span className="verse-edition">TB</span>
        </div>
      </aside>
    </section>
  );
}
function BookIllustration() {
  return (
    <svg
      className="book-illustration"
      viewBox="0 0 220 112"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M110 88C80 71 48 78 23 83L27 36C58 29 83 33 110 48C136 31 163 30 192 36L197 83C164 77 142 73 110 88Z"
        fill="#f6f4e9"
        stroke="#6c7c61"
        strokeWidth="1.4"
      />
      <path
        d="M110 48V88M27 36L22 30C51 23 81 29 110 43C137 27 164 25 194 30L192 36M22 30L17 81L23 83M194 30L202 80L197 83"
        stroke="#6c7c61"
        strokeWidth="1.2"
      />
      <path
        d="M39 45C62 41 81 47 96 53M38 54C61 51 80 56 96 62M38 64C60 60 80 65 96 72M125 53C145 42 163 43 180 45M125 62C146 52 164 52 180 54M125 72C144 61 162 62 181 64"
        stroke="#b7bba1"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M155 38C158 22 173 13 184 5M168 24C170 15 165 11 160 10C159 17 162 22 168 24ZM178 13C186 16 192 12 194 7C186 5 180 8 178 13ZM158 34C151 29 151 22 154 18C161 23 162 29 158 34Z"
        stroke="#718168"
        strokeWidth="1.2"
        fill="#d5ddc6"
      />
      <path
        d="M48 17V25M44 21H52M204 43V51M200 47H208"
        stroke="#99a087"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="11" r="1.6" fill="#a3ac92" />
    </svg>
  );
}
