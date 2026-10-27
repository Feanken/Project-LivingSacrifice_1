import {
  apiError,
  getService,
  json,
  readBody,
  requireSameOrigin,
} from "@/lib/api";
import { getDatabase } from "@/lib/db";
import { enforceCreateRateLimit } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    return json(await (await getService()).list(params));
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readBody(request);
    await enforceCreateRateLimit(await getDatabase(), request);
    return json(await (await getService()).create(body), 201);
  } catch (error) {
    return apiError(error);
  }
}
