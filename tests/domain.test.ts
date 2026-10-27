import { randomUUID } from "node:crypto";
import fc from "fast-check";
import { createEmbeddedDatabase, type Database } from "@/lib/db";
import { SharingFirmanRepository } from "@/repository/sharing-firman.repository";
import { SharingFirmanService } from "@/services/sharing-firman.service";
import {
  createSharingFirmanSchema,
  updateSharingFirmanSchema,
} from "@/lib/validation";
import { getJakartaToday, formatDateTime } from "@/lib/date-utils";
import { truncateToSnippet } from "@/lib/text-utils";
import { enforceCreateRateLimit } from "@/lib/rate-limit";
import type { SharingFirmanInput } from "@/types/sharing-firman";

let db: Database;
let repo: SharingFirmanRepository;
let service: SharingFirmanService;
const valid = (
  patch: Partial<SharingFirmanInput> = {},
): SharingFirmanInput => ({
  judul: "Hidup dalam kasih",
  nama_pembagi: "Fransisco",
  tanggal_sharing: "2025-01-01",
  isi_ringkasan: "Mengasihi sesama dalam keseharian.",
  ayat_referensi: "Roma 12:1",
  ...patch,
});
beforeAll(async () => {
  db = await createEmbeddedDatabase();
  repo = new SharingFirmanRepository(db);
  service = new SharingFirmanService(repo);
});
afterAll(async () => {
  await db?.close();
});
beforeEach(async () => {
  await db.query("TRUNCATE sharing_firman, sharing_rate_limits");
});
const clear = () => db.query("TRUNCATE sharing_firman");

// Feature: komsel-firman-sharing, Property 1: cuplikan maksimal 150 karakter
test("snippets preserve Unicode and never exceed 150 characters", () => {
  fc.assert(
    fc.property(
      fc.array(fc.constantFrom("a", " ", "🙏", "é", "火", "\n"), {
        maxLength: 1000,
      }),
      (chars) => {
        const result = truncateToSnippet(chars.join(""));
        expect(Array.from(result)).toEqual(chars.slice(0, 150));
      },
    ),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 2: urutan tanggal menurun
test("database sorts newest sharing first, including creation-time tiebreaker", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.integer({ min: 1, max: 28 }), { minLength: 1, maxLength: 8 }),
      async (days) => {
        await clear();
        for (const day of days)
          await service.create(
            valid({
              tanggal_sharing: `2025-01-${String(day).padStart(2, "0")}`,
            }),
          );
        const result = await repo.findAll({ limit: 100 });
        for (let i = 1; i < result.data.length; i++) {
          const a = result.data[i - 1],
            b = result.data[i];
          expect(a.tanggal_sharing >= b.tanggal_sharing).toBe(true);
          if (a.tanggal_sharing === b.tanggal_sharing)
            expect(a.dibuat_pada >= b.dibuat_pada).toBe(true);
        }
      },
    ),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 3: round-trip penyimpanan
test("valid data round-trips without exposing ownership tokens", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 120 }),
      async (text) => {
        const input = valid({
          judul: `Firman ${text}`.trim(),
          isi_ringkasan: `Renungan ${text}`.trim(),
        });
        const created = await service.create(input);
        expect(await service.detail(created.data.id)).toMatchObject(input);
        expect(created.data).not.toHaveProperty("creator_token");
        expect(
          (await repo.findAll()).data.every((row) => !("creator_token" in row)),
        ).toBe(true);
        await service.delete(created.data.id, created.creator_token);
      },
    ),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 4: tanggal masa depan ditolak
test("create and update reject every future date in Jakarta", () => {
  const today = new Date(`${getJakartaToday()}T00:00:00Z`);
  fc.assert(
    fc.property(fc.integer({ min: 1, max: 10000 }), (days) => {
      const date = new Date(today.getTime() + days * 86400000)
        .toISOString()
        .slice(0, 10);
      expect(
        createSharingFirmanSchema.safeParse(valid({ tanggal_sharing: date }))
          .success,
      ).toBe(false);
      expect(
        updateSharingFirmanSchema.safeParse({ tanggal_sharing: date }).success,
      ).toBe(false);
    }),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 5: kolom wajib whitespace ditolak
test("every blank required field reports its name", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.constantFrom(
        "judul",
        "nama_pembagi",
        "tanggal_sharing",
        "isi_ringkasan",
      ),
      fc.array(fc.constantFrom(" ", "\n", "\t"), { maxLength: 20 }),
      async (field, spaces) => {
        await expect(
          service.create(valid({ [field]: spaces.join("") })),
        ).rejects.toMatchObject({
          status: 400,
          fields: { [field]: expect.any(String) },
        });
      },
    ),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 6: pencarian selalu relevan
test("search treats SQL wildcard and special characters as literal text", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.constantFrom("a", "B", "%", "_", "\\", "'", "火"), {
        minLength: 1,
        maxLength: 8,
      }),
      async (chars) => {
        await clear();
        const q = chars.join("");
        const inputs = [
          valid({ judul: `Pesan ${q}` }),
          valid({
            judul: "Bukan hasil",
            isi_ringkasan: `Isi ${q.toLowerCase()}`,
          }),
          valid({ judul: "Berjalan bersama", isi_ringkasan: "Tetap setia." }),
        ];
        for (const input of inputs) await service.create(input);
        const expected = inputs.filter(
          (row) =>
            row.judul.toLowerCase().includes(q.toLowerCase()) ||
            row.isi_ringkasan.toLowerCase().includes(q.toLowerCase()),
        );
        const result = await repo.findAll({ q });
        expect(result.total).toBe(expected.length);
        expect(result.data.map((row) => row.judul).sort()).toEqual(
          expected.map((row) => row.judul).sort(),
        );
      },
    ),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 7: filter pembagi eksklusif
test("author filtering matches exactly", async () => {
  await fc.assert(
    fc.asyncProperty(fc.string({ maxLength: 40 }), async (name) => {
      await clear();
      const author = `Anggota ${name}`.trim();
      await service.create(valid({ nama_pembagi: author }));
      await service.create(valid({ nama_pembagi: `${author} lain` }));
      const result = await repo.findAll({ pembagi: author });
      expect(result.total).toBe(1);
      expect(result.data[0].nama_pembagi).toBe(author);
    }),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 8: reset mengembalikan daftar penuh
test("resetting filters returns the same complete ordered list", async () => {
  await service.create(valid());
  await service.create(
    valid({
      judul: "Setia",
      nama_pembagi: "Lydia",
      tanggal_sharing: "2025-02-01",
    }),
  );
  const baseline = await repo.findAll();
  await fc.assert(
    fc.asyncProperty(fc.string({ maxLength: 30 }), async (q) => {
      await repo.findAll({ q, pembagi: "Lydia" });
      expect(await repo.findAll({ q: "", pembagi: "" })).toEqual(baseline);
    }),
    { numRuns: 100 },
  );
});
// Feature: komsel-firman-sharing, Property 9: non-pemilik ditolak 403
test("wrong tokens cannot edit or delete, regardless of invalid edit content", async () => {
  const owner = await service.create(valid());
  await fc.assert(
    fc.asyncProperty(fc.uuid(), async (token) => {
      fc.pre(token !== owner.creator_token);
      await expect(
        service.update(owner.data.id, { creator_token: token, judul: "" }),
      ).rejects.toMatchObject({ status: 403 });
      await expect(service.delete(owner.data.id, token)).rejects.toMatchObject({
        status: 403,
      });
    }),
    { numRuns: 100 },
  );
  expect(await service.detail(owner.data.id)).toEqual(owner.data);
});
// Feature: komsel-firman-sharing, Property 10: penghapusan permanen
test("deleted records always return 404", async () => {
  await fc.assert(
    fc.asyncProperty(fc.string({ maxLength: 60 }), async (text) => {
      const record = await service.create(valid({ judul: `Catatan ${text}` }));
      await service.delete(record.data.id, record.creator_token);
      await expect(service.detail(record.data.id)).rejects.toMatchObject({
        status: 404,
      });
    }),
    { numRuns: 100 },
  );
});

test("updates trim inputs, update timestamps, and protect the token", async () => {
  const record = await service.create(valid());
  const updated = await service.update(record.data.id, {
    creator_token: record.creator_token,
    judul: "  Judul baru  ",
  });
  expect(updated.judul).toBe("Judul baru");
  expect(updated.diperbarui_pada >= record.data.diperbarui_pada).toBe(true);
  expect(updated).not.toHaveProperty("creator_token");
  await expect(
    service.update(record.data.id, {
      creator_token: record.creator_token,
      isi_ringkasan: "a".repeat(5001),
    }),
  ).rejects.toMatchObject({ status: 400 });
});
test("server rejects invalid dates, missing secrets and out-of-range pagination", async () => {
  expect(
    createSharingFirmanSchema.safeParse(
      valid({ tanggal_sharing: "2025-02-30" }),
    ).success,
  ).toBe(false);
  expect(
    createSharingFirmanSchema.safeParse(valid({ judul: "a".repeat(201) }))
      .success,
  ).toBe(false);
  await expect(service.list({ page: -1 })).rejects.toMatchObject({
    status: 400,
  });
  await expect(service.list({ limit: 1000 })).rejects.toMatchObject({
    status: 400,
  });
  await expect(service.detail(randomUUID())).rejects.toMatchObject({
    status: 404,
  });
  const record = await service.create(valid());
  await expect(service.delete(record.data.id, undefined)).rejects.toMatchObject(
    { status: 403 },
  );
});
test("Jakarta date and updated-time formatting are consistent at UTC midnight boundaries", () => {
  expect(getJakartaToday(new Date("2026-10-26T17:01:00Z"))).toBe("2026-10-27");
  expect(formatDateTime("2026-10-26T17:01:00Z")).toBe("27/10/2026 00:01");
});
test("persistent atomic rate limit allows ten requests and rejects concurrent excess", async () => {
  const request = new Request("http://localhost/api/sharing-firman");
  const outcomes = await Promise.allSettled(
    Array.from({ length: 12 }, () => enforceCreateRateLimit(db, request)),
  );
  expect(
    outcomes.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(10);
  for (const outcome of outcomes)
    if (outcome.status === "rejected")
      expect(outcome.reason).toMatchObject({ status: 429 });
  await db.query(
    "UPDATE sharing_rate_limits SET window_start = NOW() - INTERVAL '2 hours'",
  );
  await expect(enforceCreateRateLimit(db, request)).resolves.toBeUndefined();
});
