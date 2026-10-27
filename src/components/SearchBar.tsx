"use client";
import { Search, X } from "lucide-react";
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="search-input">
      <Search size={19} aria-hidden="true" />
      <label className="sr-only" htmlFor="search">
        Cari sharing firman
      </label>
      <input
        id="search"
        type="search"
        placeholder="Cari judul atau isi firman..."
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 500))}
        maxLength={500}
        autoComplete="off"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Kosongkan pencarian"
          className="icon-button"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}
