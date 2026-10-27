"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/client-api";
import type {
  SharingFirmanListResponse,
  SharingFirmanQueryParams,
} from "@/types/sharing-firman";
export function useSharingFirmanList(params: SharingFirmanQueryParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== "") query.set(key, String(value));
  return useQuery({
    queryKey: ["sharing", "list", params],
    queryFn: () =>
      apiFetch<SharingFirmanListResponse>(`/api/sharing-firman?${query}`),
    placeholderData: keepPreviousData,
  });
}
