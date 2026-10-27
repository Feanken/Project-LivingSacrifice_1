import type { FieldErrors } from "@/types/sharing-firman";
export class ClientApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public fields?: FieldErrors,
  ) {
    super(message);
  }
}
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ClientApiError(
      "Data tidak dapat dimuat. Periksa koneksi Anda dan silakan coba kembali.",
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new ClientApiError(
      body?.message || "Data tidak dapat dimuat. Silakan coba kembali.",
      response.status,
      body?.fields,
    );
  return body as T;
}
