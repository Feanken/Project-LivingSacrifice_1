CREATE TABLE IF NOT EXISTS sharing_firman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul VARCHAR(200) NOT NULL CHECK (char_length(btrim(judul)) > 0),
  nama_pembagi VARCHAR(255) NOT NULL CHECK (char_length(btrim(nama_pembagi)) > 0),
  tanggal_sharing DATE NOT NULL CHECK (tanggal_sharing <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date),
  isi_ringkasan TEXT NOT NULL CHECK (char_length(btrim(isi_ringkasan)) BETWEEN 1 AND 5000),
  ayat_referensi VARCHAR(100),
  creator_token UUID NOT NULL,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sharing_firman_tanggal ON sharing_firman (tanggal_sharing DESC, dibuat_pada DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_sharing_firman_nama_pembagi ON sharing_firman (nama_pembagi);

-- Kuota disimpan di database agar konsisten antar proses / instance aplikasi.
CREATE TABLE IF NOT EXISTS sharing_rate_limits (
  identity_hash TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0)
);
