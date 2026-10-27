"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/client-api";
import type { SharingFirman } from "@/types/sharing-firman";
export function useSharingFirmanDetail(id: string) {
  return useQuery({
    queryKey: ["sharing", "detail", id],
    queryFn: async () =>
      (await apiFetch<{ data: SharingFirman }>(`/api/sharing-firman/${id}`))
        .data,
  });
}
