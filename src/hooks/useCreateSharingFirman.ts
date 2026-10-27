"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/client-api";
import { ensureTokenStorage, saveToken } from "@/lib/creator-token";
import type { SharingFirman, SharingFirmanInput } from "@/types/sharing-firman";
export function useCreateSharingFirman() {
  const client = useQueryClient();
  return useMutation({
    gcTime: 0,
    mutationFn: async (input: SharingFirmanInput) => {
      ensureTokenStorage();
      const result = await apiFetch<{
        data: SharingFirman;
        creator_token: string;
      }>("/api/sharing-firman", {
        method: "POST",
        body: JSON.stringify(input),
      });
      try {
        saveToken(result.data.id, result.creator_token);
        return { ...result, ownershipSaved: true };
      } catch {
        return { ...result, ownershipSaved: false };
      }
    },
    onSuccess: async (result) => {
      client.setQueryData(["sharing", "detail", result.data.id], result.data);
      await client.invalidateQueries({ queryKey: ["sharing", "list"] });
    },
  });
}
