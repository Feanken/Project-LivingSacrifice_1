import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDatabase } from "./db";

loadEnvConfig(process.cwd());
async function migrate() {
  const db = await getDatabase();
  try {
    await db.exec(
      await readFile(
        path.join(process.cwd(), "migrations/001_create_sharing_firman.sql"),
        "utf8",
      ),
    );
    console.log("Migrasi database berhasil.");
  } finally {
    await db.close();
  }
}
migrate().catch(() => {
  console.error("Migrasi gagal. Periksa koneksi dan konfigurasi database.");
  process.exitCode = 1;
});
