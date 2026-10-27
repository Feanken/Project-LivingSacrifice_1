import {
  apiError,
  getService,
  json,
  readBody,
  requireSameOrigin,
} from "@/lib/api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    return json({
      data: await (await getService()).detail((await context.params).id),
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function PUT(request: Request, context: Context) {
  try {
    requireSameOrigin(request);
    const body = await readBody(request);
    return json({
      data: await (await getService()).update((await context.params).id, body),
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    requireSameOrigin(request);
    const body = await readBody(request);
    await (
      await getService()
    ).delete((await context.params).id, body.creator_token);
    return json({ message: "Sharing firman berhasil dihapus." });
  } catch (error) {
    return apiError(error);
  }
}
