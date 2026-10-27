import type { Database } from "@/lib/db";
import { escapeLike, truncateToSnippet } from "@/lib/text-utils";
import type {
  CreateSharingFirmanDTO,
  SharingFirman,
  SharingFirmanInput,
  SharingFirmanListItem,
  SharingFirmanQueryParams,
} from "@/types/sharing-firman";

type Row = SharingFirman & Record<string, unknown>;
// Explicit public projection prevents ownership tokens from reaching list/detail responses.
const columns = `id, judul, nama_pembagi, to_char(tanggal_sharing, 'YYYY-MM-DD') AS tanggal_sharing,
  isi_ringkasan, COALESCE(ayat_referensi, '') AS ayat_referensi, dibuat_pada, diperbarui_pada`;
function publicRow(row: Row): SharingFirman {
  return {
    id: row.id,
    judul: row.judul,
    nama_pembagi: row.nama_pembagi,
    tanggal_sharing: row.tanggal_sharing,
    isi_ringkasan: row.isi_ringkasan,
    ayat_referensi: row.ayat_referensi,
    dibuat_pada: new Date(row.dibuat_pada).toISOString(),
    diperbarui_pada: new Date(row.diperbarui_pada).toISOString(),
  };
}
export class SharingFirmanRepository {
  constructor(private db: Database) {}
  async findAll({
    q = "",
    pembagi = "",
    page = 1,
    limit = 9,
  }: SharingFirmanQueryParams = {}) {
    const params: unknown[] = [];
    const conditions: string[] = [];
    if (q.trim()) {
      params.push(`%${escapeLike(q.trim())}%`);
      conditions.push(
        `(judul ILIKE $${params.length} OR isi_ringkasan ILIKE $${params.length})`,
      );
    }
    if (pembagi) {
      params.push(pembagi);
      conditions.push(`nama_pembagi = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [records, count] = await Promise.all([
      this.db.query<Row>(
        `SELECT ${columns} FROM sharing_firman ${where} ORDER BY tanggal_sharing DESC, dibuat_pada DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, (page - 1) * limit],
      ),
      this.db.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM sharing_firman ${where}`,
        params,
      ),
    ]);
    const data: SharingFirmanListItem[] = records.rows.map((row) => {
      const { isi_ringkasan, ...item } = publicRow(row);
      return { ...item, cuplikan: truncateToSnippet(isi_ringkasan) };
    });
    return { data, total: Number(count.rows[0].total), page, limit };
  }
  async findById(id: string): Promise<SharingFirman | null> {
    const result = await this.db.query<Row>(
      `SELECT ${columns} FROM sharing_firman WHERE id = $1`,
      [id],
    );
    return result.rows[0] ? publicRow(result.rows[0]) : null;
  }
  async findOwnership(id: string): Promise<string | null> {
    const result = await this.db.query<{ creator_token: string }>(
      "SELECT creator_token FROM sharing_firman WHERE id = $1",
      [id],
    );
    return result.rows[0]?.creator_token ?? null;
  }
  async create(dto: CreateSharingFirmanDTO): Promise<SharingFirman> {
    const result = await this.db.query<Row>(
      `INSERT INTO sharing_firman (judul, nama_pembagi, tanggal_sharing, isi_ringkasan, ayat_referensi, creator_token)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${columns}`,
      [
        dto.judul,
        dto.nama_pembagi,
        dto.tanggal_sharing,
        dto.isi_ringkasan,
        dto.ayat_referensi,
        dto.creator_token,
      ],
    );
    return publicRow(result.rows[0]);
  }
  async update(
    id: string,
    dto: SharingFirmanInput,
    token: string,
  ): Promise<SharingFirman | null> {
    const result = await this.db.query<Row>(
      `UPDATE sharing_firman SET judul = $2, nama_pembagi = $3, tanggal_sharing = $4,
      isi_ringkasan = $5, ayat_referensi = $6, diperbarui_pada = clock_timestamp()
      WHERE id = $1 AND creator_token = $7 RETURNING ${columns}`,
      [
        id,
        dto.judul,
        dto.nama_pembagi,
        dto.tanggal_sharing,
        dto.isi_ringkasan,
        dto.ayat_referensi,
        token,
      ],
    );
    return result.rows[0] ? publicRow(result.rows[0]) : null;
  }
  async deleteById(id: string, token: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      "DELETE FROM sharing_firman WHERE id = $1 AND creator_token = $2 RETURNING id",
      [id, token],
    );
    return result.rows.length > 0;
  }
  async findAllPembagiNames(): Promise<string[]> {
    const result = await this.db.query<{ nama_pembagi: string }>(
      "SELECT DISTINCT nama_pembagi FROM sharing_firman ORDER BY nama_pembagi",
    );
    return result.rows.map((row) => row.nama_pembagi);
  }
}
