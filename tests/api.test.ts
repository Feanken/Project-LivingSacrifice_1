import { readBody, requireSameOrigin, apiError } from "@/lib/api";
import { AppError } from "@/lib/db-error";

test("same-origin protection uses browser Host when the internal URL is normalized", () => {
  const request = new Request("http://localhost:3100/api/sharing-firman", {
    headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" },
  });
  expect(() => requireSameOrigin(request)).not.toThrow();
  for (const origin of [
    "https://example.invalid",
    "null",
    "file://localhost",
  ]) {
    expect(() =>
      requireSameOrigin(
        new Request(request.url, {
          headers: { host: "127.0.0.1:3100", origin },
        }),
      ),
    ).toThrow(AppError);
  }
});
test("JSON body parsing rejects malformed, non-object, and oversized requests", async () => {
  const request = (body: string) =>
    new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
  await expect(readBody(request('{"judul":"Kasih"}'))).resolves.toEqual({
    judul: "Kasih",
  });
  await expect(readBody(request("{bad"))).rejects.toMatchObject({
    status: 400,
  });
  await expect(readBody(request("[]"))).rejects.toMatchObject({ status: 400 });
  await expect(readBody(request("null"))).rejects.toMatchObject({
    status: 400,
  });
  await expect(
    readBody(request(JSON.stringify({ text: "a".repeat(65536) }))),
  ).rejects.toMatchObject({ status: 413 });
});
test("API errors return consistent safe responses and never include internal details", async () => {
  const limit = apiError(new AppError(429, "Terlalu banyak permintaan"));
  expect(limit.status).toBe(429);
  expect(limit.headers.get("retry-after")).toBe("3600");
  expect(limit.headers.get("cache-control")).toBe("no-store");
  const log = jest.spyOn(console, "error").mockImplementation(() => undefined);
  const failure = apiError(new Error("secret database connection string"));
  expect(failure.status).toBe(500);
  expect(await failure.text()).not.toContain("secret");
  log.mockRestore();
});
