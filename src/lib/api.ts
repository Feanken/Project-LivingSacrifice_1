import { NextResponse } from "next/server";
import { getDatabase } from "./db";
import { AppError, normalizeDatabaseError } from "./db-error";
import { SharingFirmanRepository } from "@/repository/sharing-firman.repository";
import { SharingFirmanService } from "@/services/sharing-firman.service";

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function getService() {
  return new SharingFirmanService(
    new SharingFirmanRepository(await getDatabase()),
  );
}
export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  )
    throw new AppError(400, "Format permintaan harus JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, "Isi permintaan tidak valid.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 65536) {
      await reader.cancel();
      throw new AppError(413, "Isi permintaan terlalu besar.");
    }
    chunks.push(value);
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new AppError(400, "Isi permintaan tidak valid.");
  }
}
export function apiError(error: unknown) {
  const normalized = normalizeDatabaseError(error);
  // Log a code, never SQL / connection strings / request bodies / ownership tokens.
  if (normalized.status === 500)
    console.error("[sharing-firman] Database atau server tidak tersedia.");
  const response = json(
    {
      error: true,
      message: normalized.message,
      ...(normalized.fields && { fields: normalized.fields }),
    },
    normalized.status,
  );
  if (normalized.status === 429) response.headers.set("Retry-After", "3600");
  return response;
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  // Next.js can normalize the internal URL to localhost; compare the actual Host
  // received from the browser. Reverse proxies must preserve this Host header.
  let originHost: string;
  try {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    originHost = url.host;
  } catch {
    throw new AppError(403, "Aksi tidak diizinkan.");
  }
  const requestHost = request.headers.get("host") || new URL(request.url).host;
  if (originHost !== requestHost)
    throw new AppError(403, "Aksi tidak diizinkan.");
}
