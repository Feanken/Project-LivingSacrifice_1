import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { Database } from "./db";
import { AppError } from "./db-error";

export async function enforceCreateRateLimit(
  db: Database,
  request: Request,
): Promise<void> {
  // Never trust arbitrary forwarded headers unless a known proxy overwrites them.
  const header = process.env.TRUSTED_IP_HEADER;
  const address = header ? request.headers.get(header)?.trim() : null;
  const identity = address && isIP(address) ? address : "shared";
  const hash = createHash("sha256").update(identity).digest("hex");
  await db.query(
    "DELETE FROM sharing_rate_limits WHERE window_start < NOW() - INTERVAL '24 hours'",
  );
  const result = await db.query(
    `INSERT INTO sharing_rate_limits (identity_hash, window_start, request_count) VALUES ($1, NOW(), 1)
    ON CONFLICT (identity_hash) DO UPDATE SET
      window_start = CASE WHEN sharing_rate_limits.window_start <= NOW() - INTERVAL '1 hour' THEN NOW() ELSE sharing_rate_limits.window_start END,
      request_count = CASE WHEN sharing_rate_limits.window_start <= NOW() - INTERVAL '1 hour' THEN 1 ELSE sharing_rate_limits.request_count + 1 END
    WHERE sharing_rate_limits.window_start <= NOW() - INTERVAL '1 hour' OR sharing_rate_limits.request_count < 10
    RETURNING request_count`,
    [hash],
  );
  if (!result.rows.length)
    throw new AppError(
      429,
      "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat.",
    );
}
