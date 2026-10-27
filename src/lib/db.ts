import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface Database {
  exec(sql: string): Promise<void>;
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
  close(): Promise<void>;
}
const globalDb = globalThis as unknown as { coolDatabase?: Promise<Database> };
export async function createEmbeddedDatabase(
  dataDir?: string,
): Promise<Database> {
  if (dataDir) await mkdir(dataDir, { recursive: true });
  const pg = new PGlite(dataDir);
  await pg.waitReady;
  const db: Database = {
    exec: async (sql) => {
      await pg.exec(sql);
    },
    query: async <T extends Record<string, unknown>>(
      sql: string,
      params?: unknown[],
    ) => pg.query<T>(sql, params),
    close: () => pg.close(),
  };
  try {
    await pg.exec(
      await readFile(
        path.join(process.cwd(), "migrations/001_create_sharing_firman.sql"),
        "utf8",
      ),
    );
  } catch (error) {
    await pg.close();
    throw error;
  }
  return db;
}
export function getDatabase(): Promise<Database> {
  globalDb.coolDatabase ??= (async () => {
    if (process.env.DATABASE_MODE === "embedded") {
      if (process.env.NODE_ENV === "production")
        throw new Error("Gunakan DATABASE_URL PostgreSQL untuk production.");
      return createEmbeddedDatabase(
        path.resolve(process.env.EMBEDDED_DATABASE_PATH || ".data/postgres"),
      );
    }
    if (!process.env.DATABASE_URL)
      throw new Error("DATABASE_URL belum diatur.");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      ssl:
        process.env.DATABASE_SSL === "verify-full"
          ? { rejectUnauthorized: true }
          : undefined,
      options: "-c timezone=Asia/Jakarta",
    });
    pool.on("error", () =>
      console.error("[database] Koneksi PostgreSQL tidak tersedia."),
    );
    return {
      exec: async (sql: string) => {
        await pool.query(sql);
      },
      query: (sql: string, params?: unknown[]) => pool.query(sql, params),
      close: () => pool.end(),
    } as Database;
  })().catch((error) => {
    globalDb.coolDatabase = undefined;
    throw error;
  });
  return globalDb.coolDatabase;
}
