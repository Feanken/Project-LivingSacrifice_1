"use client";
import { UsersRound, ChevronDown } from "lucide-react";
export function FilterDropdown({
  names,
  value,
  onChange,
}: {
  names: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="filter-input">
      <UsersRound size={18} aria-hidden="true" />
      <label htmlFor="pembagi" className="sr-only">
        Filter nama pembagi
      </label>
      <select
        id="pembagi"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Semua pembagi</option>
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <ChevronDown size={16} aria-hidden="true" />
    </div>
  );
}
