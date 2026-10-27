import { randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { AppError } from "@/lib/db-error";
import {
  createSharingFirmanSchema,
  querySchema,
  updateSharingFirmanSchema,
  validationFields,
} from "@/lib/validation";
import type { SharingFirmanRepository } from "@/repository/sharing-firman.repository";

const validId = (id: string) => {
  if (!z.uuid().safeParse(id).success)
    throw new AppError(404, "Sharing firman tidak ditemukan");
};
export class SharingFirmanService {
  constructor(private repository: SharingFirmanRepository) {}
  async list(params: unknown) {
    const parsed = querySchema.safeParse(params);
    if (!parsed.success)
      throw new AppError(
        400,
        "Parameter pencarian tidak valid",
        validationFields(parsed.error),
      );
    const [result, pembagi] = await Promise.all([
      this.repository.findAll(parsed.data),
      this.repository.findAllPembagiNames(),
    ]);
    return { ...result, pembagi };
  }
  async detail(id: string) {
    validId(id);
    const data = await this.repository.findById(id);
    if (!data) throw new AppError(404, "Sharing firman tidak ditemukan");
    return data;
  }
  async create(body: unknown) {
    const parsed = createSharingFirmanSchema.safeParse(body);
    if (!parsed.success)
      throw new AppError(
        400,
        "Periksa kembali kolom yang belum sesuai.",
        validationFields(parsed.error),
      );
    const creator_token = randomUUID();
    const data = await this.repository.create({
      ...parsed.data,
      creator_token,
    });
    return { data, creator_token }; // Secret is delivered exactly once, only on creation.
  }
  async verifyOwnership(id: string, creatorToken: unknown): Promise<string> {
    validId(id);
    const stored = await this.repository.findOwnership(id);
    if (!stored) throw new AppError(404, "Sharing firman tidak ditemukan");
    if (
      typeof creatorToken !== "string" ||
      !z.uuid().safeParse(creatorToken).success ||
      !timingSafeEqual(
        Buffer.from(stored.toLowerCase()),
        Buffer.from(creatorToken.toLowerCase()),
      )
    ) {
      throw new AppError(
        403,
        "Aksi tidak diizinkan. Gunakan browser tempat sharing ini dibuat.",
      );
    }
    return stored;
  }
  async update(id: string, body: Record<string, unknown>) {
    // Authorize before validating edits: untrusted users never receive an editable form contract.
    const token = await this.verifyOwnership(id, body.creator_token);
    const parsed = updateSharingFirmanSchema.safeParse(body);
    if (!parsed.success)
      throw new AppError(
        400,
        "Periksa kembali kolom yang belum sesuai.",
        validationFields(parsed.error),
      );
    const existing = await this.detail(id);
    const result = await this.repository.update(
      id,
      { ...existing, ...parsed.data },
      token,
    );
    if (!result) throw new AppError(404, "Sharing firman tidak ditemukan");
    return result;
  }
  async delete(id: string, token: unknown) {
    const verified = await this.verifyOwnership(id, token);
    if (!(await this.repository.deleteById(id, verified)))
      throw new AppError(404, "Sharing firman tidak ditemukan");
  }
}
