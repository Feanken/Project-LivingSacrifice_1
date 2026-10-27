export function truncateToSnippet(text: string, maxLength = 150): string {
  return Array.from(text).slice(0, maxLength).join("");
}
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
