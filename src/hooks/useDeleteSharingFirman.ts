"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { getToken, removeToken } from "@/lib/creator-token";
export function useDeleteSharingFirman(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const creator_token = getToken(id);
      if (!creator_token)
        throw new ClientApiError("Aksi tidak diizinkan.", 403);
      await apiFetch(`/api/sharing-firman/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ creator_token }),
      });
    },
    onSuccess: async () => {
      removeToken(id);
      client.removeQueries({ queryKey: ["sharing", "detail", id] });
      await client.invalidateQueries({ queryKey: ["sharing", "list"] });
    },
  });
}
