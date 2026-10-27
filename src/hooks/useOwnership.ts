"use client";
import { useSyncExternalStore } from "react";
import { getToken } from "@/lib/creator-token";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cool-ownership", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cool-ownership", callback);
  };
}
export function useOwnership(sharingId: string) {
  const token = useSyncExternalStore(
    subscribe,
    () => getToken(sharingId),
    () => null,
  );
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return { isOwner: !!token, token, ready };
}
