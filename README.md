# COOL Living Sacrifice — Ruang Firman

Aplikasi komunitas untuk mencatat, membaca, mencari, dan membagikan ringkasan firman. Dibangun dari `requirements.md`, `design.md`, dan `tasks.md` dengan Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Zod, dan PostgreSQL.

## Coba di komputer ini

Memerlukan Node.js 20.9 atau lebih baru. Dependensi sudah dipasang di workspace ini. Untuk checkout baru, jalankan `npm ci` terlebih dahulu.

```powershell
npm run dev:local
```

Buka [http://127.0.0.1:3000](http://127.0.0.1:3000). Mode ini memakai **PGlite**, mesin PostgreSQL tertanam yang menjalankan SQL yang sama tanpa instalasi layanan database. Catatan tersimpan di `.data/postgres` dan tetap ada setelah server dimatikan. Hanya jalankan satu proses yang mengakses folder database tersebut. Mode ini khusus pengembangan dan ditolak saat `NODE_ENV=production`.

Database awal kosong. Untuk mencoba CRUD, pilih **Tulis sharing**, isi formulir, lalu simpan. Tombol edit/hapus muncul pada browser yang membuat catatan. Data contoh bersifat opsional; hentikan server lokal terlebih dahulu, lalu jalankan:

```powershell
$env:DATABASE_MODE = "embedded"
npm run db:seed
Remove-Item Env:DATABASE_MODE
npm run dev:local
```

Seed hanya berjalan jika database kosong dan menandai nama pembagi sebagai contoh. Catatan contoh tidak memiliki akses edit dari browser.

## Gunakan PostgreSQL

Siapkan database PostgreSQL, atau jalankan layanan lokal melalui Docker:

```powershell
docker compose up -d
Copy-Item .env.local.example .env.local
npm run db:migrate
npm run dev
```

Sesuaikan `DATABASE_URL` di `.env.local` jika memakai database sendiri. Migrasi awal bersifat idempoten. Tidak ada perubahan skema otomatis di database utama.

Untuk penggunaan produksi:

1. Atur `DATABASE_URL` pada layanan hosting Node.js dan jalankan `npm run db:migrate` dari environment dengan akses database.
2. Gunakan koneksi TLS terverifikasi sesuai pengaturan penyedia database (`DATABASE_SSL=verify-full`, atau parameter TLS yang disyaratkan penyedia).
3. Jalankan `npm ci`, `npm run build`, lalu `npm start`. Gunakan reverse proxy HTTPS yang mempertahankan header `Host` asli.
4. Atur `TRUSTED_IP_HEADER` hanya ke header IP yang **ditimpa** oleh reverse proxy tepercaya, misalnya `x-real-ip`. Tanpa pengaturan ini, seluruh pengguna berbagi satu kuota aman 10 permintaan POST per jam; header IP dari pengunjung tidak dipercaya begitu saja.

`npm start` mendengarkan pada `127.0.0.1`; atur hostname saat menjalankan Next.js di container atau layanan yang membutuhkan binding lain. Build memakai opsi resmi `--webpack` karena Turbopack build mengalami kegagalan proses pada lingkungan Windows ini. Frontend dan API tetap menggunakan Next.js.

## Fitur

- Daftar terbaru berdasarkan tanggal sharing, waktu pembuatan, lalu ID; cuplikan maksimal 150 karakter Unicode.
- Tambah dan edit dengan validasi per kolom; batas ringkasan 5.000 karakter dan penghitung langsung.
- Detail lengkap, ayat referensi, serta waktu pembaruan dalam WIB.
- Pencarian judul/isi tanpa membedakan huruf besar dan kecil, debounce 300 ms, dan filter nama pembagi yang cocok persis.
- Paginasi sembilan catatan per halaman, serta kondisi kosong, memuat, gagal, dan coba kembali.
- Hapus permanen dengan dialog konfirmasi, fokus awal pada Batal, Escape, dan penguncian fokus native.
- Tata letak satu kolom di ponsel, dua di tablet, tiga di desktop; menu ponsel dan area sentuh minimal 44 × 44 px.

## Kepemilikan dan kontrak API

Tidak ada akun/login, sesuai SDD. Server membuat token UUID untuk setiap catatan. **Hanya respons POST sukses** yang mengembalikan token tersebut, terpisah dari data publik:

```json
{ "data": { "id": "uuid", "judul": "..." }, "creator_token": "uuid-rahasia" }
```

Browser menyimpannya sebagai `ct_<id>` di localStorage, kemudian mengirimkannya pada PUT/DELETE. GET dan PUT tidak pernah mengembalikan token. Menghapus data browser atau berganti perangkat menghilangkan akses edit/hapus, sesuai batasan SDD. Jangan membagikan token kepada orang lain.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/sharing-firman?q=&pembagi=&page=1&limit=9` | `{ data, total, page, limit, pembagi }`; nama pembagi berasal dari seluruh catatan |
| GET | `/api/sharing-firman/:id` | `{ data }`, atau 404 |
| POST | `/api/sharing-firman` | Input lengkap; 201 dengan data publik dan token satu kali |
| PUT | `/api/sharing-firman/:id` | Kolom yang diubah + `creator_token`; `{ data }` |
| DELETE | `/api/sharing-firman/:id` | `{ creator_token }`; pesan konfirmasi |

Semua request mutasi menggunakan JSON. Error berbentuk `{ error: true, message, fields? }`. Input tanggal wajib `YYYY-MM-DD` dan tidak boleh melewati hari ini di Asia/Jakarta. Judul maksimal 200, nama 255, ayat 100, dan ringkasan 5.000 karakter. Teks dirender sebagai teks biasa, bukan HTML. SQL memakai parameter dan meng-escape wildcard pencarian. Batas POST 10 per jam disimpan secara atomik di PostgreSQL sehingga berlaku lintas instance. Respons API memakai `Cache-Control: no-store`, termasuk respons token.

## Struktur

```text
src/app/          Halaman Next.js dan API routes
src/components/   Komponen tampilan dan formulir
src/hooks/        TanStack Query, debounce, dan kepemilikan
src/lib/          Database, migrasi, validasi, tanggal, dan keamanan API
src/repository/   Kueri PostgreSQL dan proyeksi data publik
src/services/     Aturan bisnis dan verifikasi kepemilikan
src/types/        Kontrak data TypeScript
migrations/       Skema database
tests/            Unit, properti, dan pengujian browser
```

## Pemeriksaan

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Jest menguji validasi, penyimpanan, kepemilikan, keamanan API, pembatasan permintaan, dan komponen. Kesepuluh properti desain masing-masing menjalankan sedikitnya 100 variasi input pada mesin PostgreSQL sungguhan melalui PGlite, bukan mock penyimpanan.

Playwright menguji CRUD, penyimpanan token setelah reload, browser tanpa kepemilikan, pembatalan hapus, pencarian/filter/reset, API, paginasi, konten panjang, batas ringkasan, kegagalan jaringan, overflow, jumlah kolom, dan ukuran tombol pada viewport 320, 768, 1024, 1199, dan 1920 px. Tes memakai database tertanam terpisah di `.data/e2e-*`, tidak menyentuh database aplikasi atau `DATABASE_URL`. Hentikan `npm run dev` sebelum menjalankan E2E karena Next.js membatasi satu dev server per checkout.

Pada Windows, tes otomatis menggunakan Edge yang terpasang. Pada sistem lain, pasang browser dengan `npx playwright install chromium`. `PLAYWRIGHT_CHANNEL` dapat digunakan untuk memilih channel browser. Screenshot dan trace kegagalan berada di `test-results/`; laporan lengkap di `playwright-report/`.

Pengujian otomatis di workspace ini menggunakan PGlite. Koneksi jaringan ke PostgreSQL eksternal dan deployment hosting memerlukan environment tujuan dan belum diperiksa di sini.

## Penyelarasan SDD

- Batas judul diseragamkan menjadi 200 karakter pada tambah/edit, sesuai desain database.
- Token dibuat server dan diberikan satu kali pada POST; field token tidak menjadi bagian dari model publik.
- Tanggal database dan aplikasi memakai acuan kalender Asia/Jakarta.
- Mode database tertanam ditambahkan untuk pengembangan lokal; produksi tetap memakai PostgreSQL melalui `pg.Pool`.
- Paginasi default sembilan catatan agar sesuai grid tiga kolom.

Rujukan framework: [Next.js App Router](https://nextjs.org/docs/app), [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), dan [penyimpanan PGlite](https://pglite.dev/docs/filesystems).
