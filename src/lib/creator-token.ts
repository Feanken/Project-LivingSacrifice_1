"use client";
const changed = () => window.dispatchEvent(new Event("cool-ownership"));
export function ensureTokenStorage() {
  try {
    localStorage.setItem("ct_storage_check", "1");
    localStorage.removeItem("ct_storage_check");
  } catch {
    throw new Error(
      "Izinkan penyimpanan browser agar catatan Anda dapat diedit dan dihapus nanti.",
    );
  }
}
export function saveToken(sharingId: string, token: string) {
  localStorage.setItem(`ct_${sharingId}`, token);
  changed();
}
export function getToken(sharingId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`ct_${sharingId}`);
  } catch {
    return null;
  }
}
export function removeToken(sharingId: string) {
  try {
    localStorage.removeItem(`ct_${sharingId}`);
    changed();
  } catch {
    /* Data already deleted; unavailable storage must not block navigation. */
  }
}
