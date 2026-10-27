import { z } from "zod";
import { getJakartaToday, isCalendarDate } from "./date-utils";

const requiredText = (label: string, max: number) =>
  z
    .string({ error: `${label} wajib diisi` })
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`);
export const createSharingFirmanSchema = z.object({
  judul: requiredText("Judul", 200),
  nama_pembagi: requiredText("Nama pembagi", 255),
  tanggal_sharing: z
    .string({ error: "Tanggal sharing wajib diisi" })
    .trim()
    .min(1, "Tanggal sharing wajib diisi")
    .refine(isCalendarDate, "Tanggal sharing tidak valid")
    .refine(
      (value) => !isCalendarDate(value) || value <= getJakartaToday(),
      "Tanggal sharing tidak boleh melebihi tanggal hari ini",
    ),
  isi_ringkasan: requiredText("Isi ringkasan", 5000),
  ayat_referensi: z
    .string()
    .trim()
    .max(100, "Ayat referensi maksimal 100 karakter")
    .default(""),
});
export const updateSharingFirmanSchema = createSharingFirmanSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Tidak ada perubahan untuk disimpan",
  });
export const querySchema = z.object({
  q: z
    .string()
    .trim()
    .max(500, "Kata pencarian maksimal 500 karakter")
    .default(""),
  pembagi: z.string().trim().max(255).default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(9),
});
export function validationFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues)
    fields[String(issue.path[0] ?? "form")] ??= issue.message;
  return fields;
}
