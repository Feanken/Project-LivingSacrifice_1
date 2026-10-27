import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import { randomUUID, createHash } from "node:crypto";

const valid = (patch: Record<string, string> = {}) => ({
  judul: "Setia dalam perkara kecil",
  nama_pembagi: "Fransisco",
  tanggal_sharing: "2025-01-12",
  isi_ringkasan:
    "Kesetiaan dimulai dari hal sederhana.\n\nMari melayani dengan kasih setiap hari.",
  ayat_referensi: "Lukas 16:10",
  ...patch,
});
async function assertLayout(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  if (page.viewportSize()!.width < 768) {
    const tooSmall = await page
      .locator("header, main")
      .locator(
        "button:visible, select:visible, input:visible, summary:visible, a.button:visible, a.back-link:visible",
      )
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width < 44 || rect.height < 44;
          })
          .map((element) => element.outerHTML.slice(0, 160)),
      );
    expect(tooSmall).toEqual([]);
  }
}
test.beforeEach(async ({ context }, info) => {
  const hash = createHash("sha256")
    .update(`${info.project.name}:${info.title}:${Date.now()}`)
    .digest();
  await context.setExtraHTTPHeaders({
    "x-test-ip": `10.${hash[0]}.${hash[1]}.${hash[2]}`,
  });
});
async function create(
  request: APIRequestContext,
  patch: Record<string, string> = {},
) {
  const response = await request.post("/api/sharing-firman", {
    data: valid(patch),
  });
  expect(response.status()).toBe(201);
  return response.json() as Promise<{
    data: { id: string; judul: string };
    creator_token: string;
  }>;
}
test("full CRUD, browser ownership, delete cancellation, and responsive pages", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByText("Belum ada sharing firman yang tercatat"),
  ).toBeVisible();
  await assertLayout(page);
  if (page.viewportSize()!.width < 768) {
    await page.getByLabel("Buka menu navigasi").click();
    await page
      .getByRole("navigation", { name: "Navigasi ponsel" })
      .getByRole("link", { name: "Tulis sharing" })
      .click();
  } else
    await page
      .getByRole("navigation", { name: "Navigasi utama" })
      .getByRole("link", { name: "Tulis sharing" })
      .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Bagikan firman",
  );
  await page.getByRole("button", { name: "Bagikan firman" }).click();
  await expect(page.getByText("Judul wajib diisi")).toBeVisible();
  await page.getByLabel("Judul firman").fill(valid().judul);
  await page.getByLabel("Nama pembagi").fill(valid().nama_pembagi);
  await page.getByLabel("Tanggal sharing").fill(valid().tanggal_sharing);
  await page.getByLabel("Ayat referensi").fill(valid().ayat_referensi);
  await page.getByLabel("Isi ringkasan").fill(valid().isi_ringkasan);
  await assertLayout(page);
  await page.getByRole("button", { name: "Bagikan firman" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Sharing firman berhasil disimpan.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    valid().judul,
  );
  const url = page.url().split("?")[0];
  const id = url.split("/").at(-1)!;
  const token = await page.evaluate(
    (id) => localStorage.getItem(`ct_${id}`),
    id,
  );
  expect(token).toBeTruthy();
  await assertLayout(page);
  const guest = await browser.newContext({ viewport: page.viewportSize()! });
  const guestPage = await guest.newPage();
  await guestPage.goto(url);
  await expect(guestPage.getByRole("heading", { level: 1 })).toHaveText(
    valid().judul,
  );
  await expect(
    guestPage.getByRole("link", { name: "Edit sharing" }),
  ).toHaveCount(0);
  await expect(
    guestPage.getByRole("button", { name: "Hapus", exact: true }),
  ).toHaveCount(0);
  await guestPage.goto(`${url}/edit`);
  await expect(guestPage.getByRole("main").getByRole("alert")).toContainText(
    "Aksi tidak diizinkan",
  );
  await expect(guestPage.getByLabel("Judul firman")).toHaveCount(0);
  await guest.close();
  await page.reload();
  await page.getByRole("link", { name: "Edit sharing" }).click();
  await expect(page.getByLabel("Judul firman")).toHaveValue(valid().judul);
  await page.getByLabel("Judul firman").fill("Setia dan bertumbuh setiap hari");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Setia dan bertumbuh setiap hari",
  );
  await expect(page.locator("time")).toHaveText(
    /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} WIB/,
  );
  await page.getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Setia dan bertumbuh setiap hari",
  );
  await expect(
    page.getByRole("button", { name: "Batal", exact: true }),
  ).toBeFocused();
  await assertLayout(page);
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Hapus", exact: true }).click();
  await page.getByRole("button", { name: "Konfirmasi hapus" }).click();
  await expect(page).toHaveURL("/");
  expect((await page.request.get(`/api/sharing-firman/${id}`)).status()).toBe(
    404,
  );
  await expect(
    page.getByText("Belum ada sharing firman yang tercatat"),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("search, exact author filter, empty results, and reset", async ({
  page,
}) => {
  const records = [];
  try {
    records.push(
      await create(page.request, {
        judul: "Kasih dalam tindakan",
        nama_pembagi: "Lydia",
      }),
    );
    records.push(
      await create(page.request, {
        judul: "Hidup berserah",
        nama_pembagi: "Fransisco",
        isi_ringkasan: "KASIH Tuhan menyertai setiap langkah.",
      }),
    );
    records.push(
      await create(page.request, {
        judul: "Pengharapan baru",
        nama_pembagi: "Lydia",
        isi_ringkasan: "Tetap berharap dalam setiap musim kehidupan.",
      }),
    );
    await page.goto("/");
    await expect(page.locator(".sharing-card")).toHaveCount(3);
    const columns = await page
      .locator(".sharing-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(
      page.viewportSize()!.width < 768
        ? 1
        : page.viewportSize()!.width < 1200
          ? 2
          : 3,
    );
    await page.getByRole("searchbox").fill("kasih");
    await expect(page.locator(".sharing-card")).toHaveCount(2);
    await page.getByRole("combobox").selectOption("Lydia");
    await expect(page.locator(".sharing-card")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "Kasih dalam tindakan" }),
    ).toBeVisible();
    await page.getByRole("searchbox").fill("tidak-ada-hasil-999");
    await expect(
      page.getByText("Belum menemukan yang Anda cari?"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Reset pencarian" }).click();
    await expect(page.locator(".sharing-card")).toHaveCount(3);
    await assertLayout(page);
    await page.screenshot({
      path: `test-results/home-${page.viewportSize()!.width}.png`,
      fullPage: true,
    });
  } finally {
    for (const record of records)
      await page.request.delete(`/api/sharing-firman/${record.data.id}`, {
        data: { creator_token: record.creator_token },
      });
  }
});
test("server API validates requests, protects secrets, and handles missing records", async ({
  page,
}) => {
  const api = page.request;
  const invalid = await api.post("/api/sharing-firman", {
    data: valid({
      judul: " ",
      nama_pembagi: "",
      tanggal_sharing: "2999-01-01",
      isi_ringkasan: " ",
    }),
  });
  expect(invalid.status()).toBe(400);
  expect(Object.keys((await invalid.json()).fields)).toEqual(
    expect.arrayContaining([
      "judul",
      "nama_pembagi",
      "tanggal_sharing",
      "isi_ringkasan",
    ]),
  );
  const malformed = await api.post("/api/sharing-firman", {
    data: "{bad json",
    headers: { "content-type": "application/json" },
  });
  expect(malformed.status()).toBe(400);
  expect((await api.get("/api/sharing-firman?page=-1")).status()).toBe(400);
  expect((await api.get("/api/sharing-firman/not-a-uuid")).status()).toBe(404);
  const record = await create(api, { judul: "100% setia_dan_teguh" });
  try {
    const detail = await api.get(`/api/sharing-firman/${record.data.id}`);
    expect(await detail.text()).not.toContain("creator_token");
    expect(await (await api.get("/api/sharing-firman")).text()).not.toContain(
      record.creator_token,
    );
    expect((await api.get("/api/sharing-firman?q=%25")).status()).toBe(200);
    expect(
      (await (await api.get("/api/sharing-firman?q=%25")).json()).total,
    ).toBe(1);
    for (const method of ["put", "delete"] as const) {
      const response = await api[method](
        `/api/sharing-firman/${record.data.id}`,
        { data: { creator_token: randomUUID(), judul: "" } },
      );
      expect(response.status()).toBe(403);
    }
    const tooLong = await api.put(`/api/sharing-firman/${record.data.id}`, {
      data: {
        creator_token: record.creator_token,
        isi_ringkasan: "a".repeat(5001),
      },
    });
    expect(tooLong.status()).toBe(400);
    const crossOrigin = await api.post("/api/sharing-firman", {
      data: valid(),
      headers: { origin: "https://example.invalid" },
    });
    expect(crossOrigin.status()).toBe(403);
  } finally {
    await api.delete(`/api/sharing-firman/${record.data.id}`, {
      data: { creator_token: record.creator_token },
    });
  }
});
test("network failure shows a retry action and can recover", async ({
  page,
}) => {
  await page.route("**/api/sharing-firman?**", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Data tidak dapat dimuat",
  );
  await assertLayout(page);
  await page.unroute("**/api/sharing-firman?**");
  await page.getByRole("button", { name: "Coba kembali" }).click();
  await expect(
    page.getByText("Belum ada sharing firman yang tercatat"),
  ).toBeVisible();
});

test("pagination, long content, literal HTML, and the summary limit remain usable", async ({
  page,
}) => {
  const records = [];
  try {
    for (let index = 0; index < 10; index++)
      records.push(
        await create(page.request, {
          judul: index === 0 ? "A".repeat(200) : `Catatan halaman ${index}`,
          nama_pembagi: index === 0 ? "B".repeat(255) : "Anggota COOL",
          isi_ringkasan:
            index === 0
              ? '<img src=x onerror="window.__xss=true">' + "a".repeat(4900)
              : "Renungan untuk hari ini.",
          tanggal_sharing: index === 0 ? "2025-01-28" : "2025-01-01",
        }),
      );
    await page.goto("/");
    await expect(page.locator(".sharing-card")).toHaveCount(9);
    await assertLayout(page);
    await page.getByRole("button", { name: "Halaman berikutnya" }).click();
    await expect(page.locator(".sharing-card")).toHaveCount(1);
    await page.getByRole("button", { name: "Halaman sebelumnya" }).click();
    await expect(page.locator(".sharing-card")).toHaveCount(9);
    await page.goto(`/sharing/${records[0].data.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "A".repeat(200),
    );
    await expect(page.locator(".detail-body")).toContainText("<img src=x");
    expect(
      await page.evaluate(
        () => (window as unknown as Record<string, unknown>).__xss,
      ),
    ).toBeUndefined();
    await assertLayout(page);
    await page.goto("/sharing/baru");
    await page.getByLabel("Isi ringkasan").fill("a".repeat(5001));
    await expect(page.getByLabel("Isi ringkasan")).toHaveValue(
      "a".repeat(5000),
    );
    await expect(page.getByText("0 karakter tersisa")).toBeVisible();
    await assertLayout(page);
  } finally {
    for (const record of records)
      await page.request.delete(`/api/sharing-firman/${record.data.id}`, {
        data: { creator_token: record.creator_token },
      });
  }
});
