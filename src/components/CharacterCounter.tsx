export function CharacterCounter({
  current,
  max,
  id,
}: {
  current: number;
  max: number;
  id?: string;
}) {
  const remaining = Math.max(0, max - current);
  return (
    <span
      id={id}
      className={`character-counter${remaining <= max * 0.1 ? " near-limit" : ""}`}
      aria-live="polite"
    >
      {remaining.toLocaleString("id-ID")} karakter tersisa
    </span>
  );
}
