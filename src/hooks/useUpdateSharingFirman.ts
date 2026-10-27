"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { getToken } from "@/lib/creator-token";
import type { SharingFirman, SharingFirmanInput } from "@/types/sharing-firman";
export function useUpdateSharingFirman(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: SharingFirmanInput) => {
      const creator_token = getToken(id);
      if (!creator_token)
        throw new ClientApiError("Aksi tidak diizinkan.", 403);
      return (
        await apiFetch<{ data: SharingFirman }>(`/api/sharing-firman/${id}`, {
          method: "PUT",
          body: JSON.stringify({ ...input, creator_token }),
        })
      ).data;
    },
    onSuccess: async (data) => {
      client.setQueryData(["sharing", "detail", id], data);
      await client.invalidateQueries({ queryKey: ["sharing", "list"] });
    },
  });
}
