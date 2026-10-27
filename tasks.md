# Implementation Plan: COOL Living Sacrifice — Komsel Firman Sharing

## Overview

Implementasi aplikasi web COOL Living Sacrifice menggunakan Next.js (App Router) + TypeScript sebagai full-stack framework, PostgreSQL sebagai database, Tailwind CSS untuk tampilan responsif, dan React Query untuk manajemen state server. Kepemilikan data dikelola melalui creator token yang disimpan di localStorage tanpa sistem autentikasi penuh.

## Tasks

- [x] 1. Setup proyek dan infrastruktur
  - [x] 1.1 Inisialisasi proyek Next.js dengan TypeScript dan konfigurasi Tailwind CSS
    - Jalankan `create-next-app` dengan flag TypeScript, Tailwind CSS, App Router, dan ESLint
    - Konfigurasi `tsconfig.json` dengan path alias `@/` untuk direktori `src/`
    - Konfigurasi Tailwind CSS dengan breakpoint kustom jika diperlukan (320px, 768px, 1199px, 1920px)
    - Buat struktur direktori: `src/app`, `src/components`, `src/lib`, `src/hooks`, `src/types`, `src/services`, `src/repository`
    - _Persyaratan: 6.1, 6.2, 6.3, 6.4_

  - [x] 1.2 Instal dan konfigurasi dependensi utama
    - Instal TanStack Query (`@tanstack/react-query`), Zod, fast-check, dan driver PostgreSQL (`pg`, `@types/pg`)
    - Instal Jest, React Testing Library (`@testing-library/react`, `@testing-library/user-event`), dan Playwright
    - Konfigurasi Jest dengan `jest.config.mjs` dan setup file untuk React Testing Library
    - Konfigurasi Playwright dengan `playwright.config.ts` untuk viewport 320px, 768px, 1024px, 1199px, dan 1920px
    - Buat `src/lib/queryClient.ts` untuk konfigurasi TanStack Query Provider
    - _Persyaratan: 1.1, 2.2, 5.1_

  - [x] 1.3 Konfigurasi koneksi database PostgreSQL
    - Buat `src/lib/db.ts` dengan connection pool menggunakan `pg.Pool`
    - Baca konfigurasi database dari environment variables (`DATABASE_URL` atau variabel terpisah)
    - Buat `.env.local.example` dengan semua environment variable yang diperlukan
    - Buat `src/lib/db-error.ts` untuk normalisasi error database ke format error aplikasi yang standar
    - _Persyaratan: 1.4, 2.2_

- [x] 2. Database schema, migrasi, dan tipe data
  - [x] 2.1 Buat file migrasi SQL dan TypeScript interfaces
    - Buat `migrations/001_create_sharing_firman.sql` dengan tabel `sharing_firman` sesuai skema di design
    - Tambahkan indeks `idx_sharing_firman_tanggal` dan `idx_sharing_firman_nama_pembagi`
    - Buat `src/types/sharing-firman.ts` dengan semua interface TypeScript: `SharingFirman`, `SharingFirmanWithToken`, `CreateSharingFirmanDTO`, `UpdateSharingFirmanDTO`, `SharingFirmanListItem`, `SharingFirmanQueryParams`
    - Buat `src/lib/migrate.ts` sebagai script runner migrasi yang dapat dijalankan sekali
    - _Persyaratan: 2.2, 3.2, 4.2_

  - [x] 2.2 Buat Zod schemas untuk validasi input
    - Buat `src/lib/validation.ts` dengan Zod schemas untuk `createSharingFirmanSchema` dan `updateSharingFirmanSchema`
    - Validasi semua aturan bisnis: panjang karakter, format tanggal, tanggal tidak boleh di masa depan (zona waktu WIB UTC+7)
    - Buat helper `getJakartaToday()` di `src/lib/date-utils.ts` menggunakan `toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })`
    - Buat helper `truncateToSnippet(text: string, maxLength = 150): string` di `src/lib/text-utils.ts`
    - _Persyaratan: 2.4, 2.5, 3.3_

  - [x]* 2.3 Tulis property test untuk Property 1 (cuplikan ≤ 150 karakter) dan Property 4 (tanggal masa depan ditolak)
    - **Property 1**: Generate `isi_ringkasan` acak berbagai panjang, pastikan hasil `truncateToSnippet` selalu ≤ 150 karakter
    - **Property 4**: Generate tanggal acak di masa depan relatif terhadap tanggal Jakarta hari ini, pastikan validasi Zod selalu menolak
    - Tag komentar: `// Feature: komsel-firman-sharing, Property 1` dan `// Feature: komsel-firman-sharing, Property 4`
    - Konfigurasi minimal 100 iterasi per properti
    - _Persyaratan: 1.1, 2.5_

- [x] 3. Repository layer dan service layer
  - [x] 3.1 Buat repository layer untuk operasi database
    - Buat `src/repository/sharing-firman.repository.ts` dengan fungsi: `findAll(params)`, `findById(id)`, `create(dto)`, `update(id, dto)`, `deleteById(id)`, `findAllPembagiNames()`
    - Implementasikan query `ILIKE` dengan parameterized query (bukan string interpolation) untuk pencarian, escape karakter `%` dan `_`
    - Implementasikan `ORDER BY tanggal_sharing DESC, dibuat_pada DESC` pada `findAll`
    - Hitung `cuplikan` menggunakan `truncateToSnippet` di `findAll`, jangan kembalikan `creator_token` dalam hasil query publik
    - Implementasikan paginasi dengan `LIMIT` dan `OFFSET` berdasarkan `page` dan `limit`
    - _Persyaratan: 1.1, 1.2, 5.1, 5.2_

  - [x] 3.2 Buat service layer dengan logika bisnis kepemilikan
    - Buat `src/services/sharing-firman.service.ts` yang membungkus repository dengan validasi kepemilikan
    - Fungsi `verifyOwnership(id, creatorToken)` yang membaca `creator_token` dari DB dan membandingkan — jika tidak cocok, lempar error dengan kode 403
    - Pastikan model data publik tidak mengandung `creator_token`; hanya service create memberikan token satu kali, terpisah dari model publik
    - _Persyaratan: 3.5, 4.5_

  - [x]* 3.3 Tulis property test untuk Property 9 (operasi non-pemilik ditolak 403) dan Property 10 (penghapusan permanen)
    - **Property 9**: Generate token acak berbeda dari token pemilik, pastikan `verifyOwnership` selalu melempar error 403
    - **Property 10**: Generate sharing acak, simpan, hapus, konfirmasi bahwa `findById` mengembalikan null/tidak ditemukan
    - Tag komentar: `// Feature: komsel-firman-sharing, Property 9` dan `// Feature: komsel-firman-sharing, Property 10`
    - _Persyaratan: 3.5, 4.2, 4.5_

  - [x]* 3.4 Tulis property test untuk Property 3 (round-trip penyimpanan) dan Property 5 (kolom wajib kosong ditolak)
    - **Property 3**: Generate data valid acak, `create` lalu `findById`, pastikan semua field identik (kecuali `id` dan timestamps yang di-generate)
    - **Property 5**: Generate kombinasi kolom wajib kosong/whitespace-only, pastikan validasi Zod selalu menolak dengan menyebut kolom yang bermasalah
    - Tag komentar: `// Feature: komsel-firman-sharing, Property 3` dan `// Feature: komsel-firman-sharing, Property 5`
    - _Persyaratan: 2.2, 2.4, 3.3_

- [x] 4. API Routes (Next.js App Router)
  - [x] 4.1 Implementasikan route `GET` dan `POST /api/sharing-firman`
    - Buat `src/app/api/sharing-firman/route.ts`
    - `GET`: Baca query params `q`, `pembagi`, `page`, `limit`; panggil service; kembalikan format `{ data, total, page, limit }`
    - `POST`: Parse body, validasi dengan Zod schema, generate `creator_token` UUID di server, simpan via service, kembalikan 201 dengan `{ data, creator_token }` satu kali dan header `Cache-Control: no-store`
    - Pastikan semua error mengikuti format JSON standar `{ error: true, message, fields? }`
    - _Persyaratan: 2.2, 2.4, 2.5, 5.1, 5.2_

  - [x] 4.2 Implementasikan route `GET`, `PUT`, dan `DELETE /api/sharing-firman/:id`
    - Buat `src/app/api/sharing-firman/[id]/route.ts`
    - `GET`: Kembalikan detail lengkap (tanpa `creator_token`); 404 jika tidak ditemukan
    - `PUT`: Validasi body dengan Zod, verifikasi kepemilikan via `creator_token` di body, update data, kembalikan data terbaru (tanpa `creator_token`)
    - `DELETE`: Baca `creator_token` dari body, verifikasi kepemilikan, hapus permanen, kembalikan 200
    - _Persyaratan: 1.2, 3.1, 3.2, 3.5, 4.2, 4.5_

  - [x] 4.3 Implementasikan rate limiting middleware untuk `POST /api/sharing-firman`
    - Gunakan `src/lib/rate-limit.ts` di route handler untuk membatasi 10 request per IP per jam secara atomik di PostgreSQL
    - Kembalikan HTTP 429 dengan pesan "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat." saat batas terlampaui
    - _Persyaratan: (keamanan operasional dari design)_

  - [x]* 4.4 Tulis unit tests untuk API routes
    - Uji parser JSON, pemeriksaan origin, normalisasi error, dan response API; uji semua endpoint melalui HTTP dengan database PostgreSQL tertanam terpisah
    - Uji kasus: request valid, kolom wajib kosong, tanggal masa depan, token tidak cocok (403), ID tidak ditemukan (404)
    - _Persyaratan: 2.4, 2.5, 3.3, 3.5, 4.5_

  - [x]* 4.5 Tulis property test untuk Property 6 (hasil pencarian selalu relevan) dan Property 7 (filter nama pembagi eksklusif)
    - **Property 6**: Generate kata kunci dan koleksi sharing acak, pastikan semua hasil mengandung kata kunci di `judul` atau `isi_ringkasan` (case-insensitive) dan tidak ada yang relevan yang terlewat
    - **Property 7**: Generate data dengan berbagai `nama_pembagi`, filter satu nama, pastikan semua hasil memiliki `nama_pembagi` yang sama persis
    - Tag komentar: `// Feature: komsel-firman-sharing, Property 6` dan `// Feature: komsel-firman-sharing, Property 7`
    - _Persyaratan: 5.1, 5.2_

- [x] 5. Checkpoint — Pastikan semua tes lulus
  - Pastikan semua unit test dan property test yang sudah ditulis lulus. Tanyakan kepada pengguna jika ada pertanyaan atau hambatan.

- [x] 6. Komponen UI dasar dan utilitas
  - [x] 6.1 Buat komponen `EmptyState` dan `ErrorMessage`
    - Buat `src/components/EmptyState.tsx`: tampilkan teks "Belum ada sharing firman yang tercatat" dengan styling Tailwind yang responsif
    - Buat `src/components/ErrorMessage.tsx`: tampilkan pesan error dengan tombol coba kembali, terima props `message` dan `onRetry`
    - _Persyaratan: 1.3, 1.4, 4.6_

  - [x] 6.2 Buat komponen `CharacterCounter` dan `DeleteConfirmDialog`
    - Buat `src/components/CharacterCounter.tsx`: terima props `current` dan `max`, tampilkan sisa karakter, warna merah saat ≤ 10% sisa atau saat limit tercapai
    - Buat `src/components/DeleteConfirmDialog.tsx`: dialog modal dengan judul sharing yang akan dihapus, tombol "Hapus" dan "Batal"
    - _Persyaratan: 2.6, 4.1, 4.4_

  - [x] 6.3 Buat komponen `SharingCard` dan `SharingList`
    - Buat `src/components/SharingCard.tsx`: tampilkan judul, nama pembagi, tanggal, dan cuplikan; link ke halaman detail; aksesibel (role, aria-label)
    - Buat `src/components/SharingList.tsx`: render daftar `SharingCard`, tangani state kosong dengan `EmptyState`, error dengan `ErrorMessage`
    - Pastikan card memiliki area sentuh ≥ 44x44px pada mobile viewport
    - _Persyaratan: 1.1, 1.3, 1.4, 6.3_

  - [x]* 6.4 Tulis unit tests untuk komponen UI dasar
    - Test render dan interaksi: `EmptyState` menampilkan teks yang benar, `ErrorMessage` memanggil `onRetry`, `DeleteConfirmDialog` memanggil callback yang tepat, `CharacterCounter` berubah warna saat mendekati limit
    - _Persyaratan: 1.3, 2.6, 4.1_

- [x] 7. Komponen pencarian, filter, dan form
  - [x] 7.1 Buat komponen `SearchBar` dan `FilterDropdown`
    - Buat `src/components/SearchBar.tsx`: input pencarian dengan debounce 300ms menggunakan custom hook `useDebounce`; clear button saat ada isi
    - Buat `src/components/FilterDropdown.tsx`: dropdown pilih nama pembagi; opsi diambil dari API (list unik nama pembagi); tampilkan opsi "Semua Pembagi" sebagai default
    - Buat `src/hooks/useDebounce.ts`
    - _Persyaratan: 5.1, 5.2, 5.4_

  - [x] 7.2 Buat komponen `SharingForm` yang dapat digunakan ulang untuk tambah dan edit
    - Buat `src/components/SharingForm.tsx`: terima props `initialData?` (untuk mode edit) dan `onSubmit`
    - Integrasikan `CharacterCounter` untuk field `isi_ringkasan` dengan `maxLength={5000}`
    - Implementasikan hard limit karakter dengan `maxLength` attribute dan event handler untuk mencegah input setelah 5000 karakter
    - Tampilkan pesan validasi inline di bawah setiap field yang bermasalah
    - _Persyaratan: 2.1, 2.4, 2.5, 2.6, 3.1, 3.3_

  - [x]* 7.3 Tulis unit tests untuk `SearchBar`, `FilterDropdown`, dan `SharingForm`
    - Test debounce di `SearchBar`, test pemilihan filter di `FilterDropdown`, test validasi inline di `SharingForm`
    - _Persyaratan: 2.4, 5.1, 5.2_

- [x] 8. Custom hooks dan mekanisme creator_token
  - [x] 8.1 Buat hooks TanStack Query untuk semua operasi data
    - Buat `src/hooks/useSharingFirmanList.ts`: query dengan params pencarian/filter; invalidate cache setelah mutasi
    - Buat `src/hooks/useSharingFirmanDetail.ts`: query detail berdasarkan `id`
    - Buat `src/hooks/useCreateSharingFirman.ts`: mutation POST; simpan `creator_token` ke localStorage setelah sukses
    - Buat `src/hooks/useUpdateSharingFirman.ts`: mutation PUT; baca `creator_token` dari localStorage, kirim di body
    - Buat `src/hooks/useDeleteSharingFirman.ts`: mutation DELETE; baca `creator_token` dari localStorage, kirim di body
    - _Persyaratan: 2.2, 3.1, 3.2, 4.2_

  - [x] 8.2 Implementasikan mekanisme creator_token di localStorage
    - Buat `src/lib/creator-token.ts` dengan fungsi: `saveToken(sharingId, token)`, `getToken(sharingId): string | null`, `removeToken(sharingId)`, dan `ensureTokenStorage()`; token hanya dibuat server
    - Token di-generate di server (`crypto.randomUUID()` di API route), dikirim kembali ke client hanya saat POST sukses (satu kali), lalu disimpan ke localStorage dengan key `ct_${sharingId}`
    - Buat hook `useOwnership(sharingId)` yang mengembalikan `{ isOwner: boolean, token: string | null }` berdasarkan keberadaan token di localStorage
    - UI hanya menampilkan tombol edit/hapus jika `isOwner === true`
    - _Persyaratan: 3.5, 4.5_

  - [x]* 8.3 Tulis property test untuk Property 2 (urutan daftar selalu menurun) dan Property 8 (reset pencarian mengembalikan daftar penuh)
    - **Property 2**: Generate daftar sharing dengan tanggal acak, pastikan urutan selalu menurun berdasarkan `tanggal_sharing` (tiebreaker: `dibuat_pada` menurun)
    - **Property 8**: Generate filter/kata kunci acak, terapkan lalu reset, pastikan hasil identik dengan daftar tanpa filter terurut menurun
    - Tag komentar: `// Feature: komsel-firman-sharing, Property 2` dan `// Feature: komsel-firman-sharing, Property 8`
    - _Persyaratan: 1.1, 5.4_

- [x] 9. Halaman-halaman Next.js (App Router)
  - [x] 9.1 Buat halaman utama (daftar sharing firman) di `/`
    - Buat `src/app/page.tsx`: gunakan `useSharingFirmanList` dengan params dari state `SearchBar` dan `FilterDropdown`
    - Tampilkan `SharingList`, `SearchBar`, `FilterDropdown` dalam layout responsif
    - Layout: satu kolom di mobile (<768px), dua kolom di tablet (768px–1199px), multi-kolom di desktop (≥1200px)
    - Tangani state loading, error (`ErrorMessage`), dan kosong (`EmptyState`)
    - _Persyaratan: 1.1, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.4_

  - [x] 9.2 Buat halaman detail sharing firman di `/sharing/[id]`
    - Buat `src/app/sharing/[id]/page.tsx`: gunakan `useSharingFirmanDetail`, tampilkan semua field termasuk `diperbarui_pada` dalam format `dd/mm/yyyy HH:mm`
    - Tampilkan tombol "Edit" dan "Hapus" hanya jika `isOwner === true` (berdasarkan `useOwnership`)
    - Integrasikan `DeleteConfirmDialog` dengan `useDeleteSharingFirman`; redirect ke `/` setelah hapus berhasil
    - _Persyaratan: 1.2, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 9.3 Buat halaman tambah sharing firman di `/sharing/baru`
    - Buat `src/app/sharing/baru/page.tsx`: render `SharingForm` tanpa `initialData`
    - Gunakan `useCreateSharingFirman`; setelah sukses simpan token ke localStorage dan redirect ke `/sharing/[id]` baru
    - Tampilkan pesan konfirmasi sukses (toast atau pesan inline) sebelum/saat redirect
    - _Persyaratan: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 9.4 Buat halaman edit sharing firman di `/sharing/[id]/edit`
    - Buat `src/app/sharing/[id]/edit/page.tsx`: fetch data dengan `useSharingFirmanDetail`, render `SharingForm` dengan `initialData`
    - Jika `isOwner === false`, tampilkan pesan kesalahan dan redirect ke halaman detail tanpa menampilkan form
    - Gunakan `useUpdateSharingFirman`; setelah sukses redirect ke `/sharing/[id]`
    - _Persyaratan: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Checkpoint — Pastikan semua tes lulus
  - Pastikan semua unit test dan property test lulus. Verifikasi tampilan di breakpoint 320px dan 768px (dapat menggunakan browser DevTools). Tanyakan kepada pengguna jika ada pertanyaan.

- [x] 11. Penyelesaian responsivitas dan aksesibilitas
  - [x] 11.1 Implementasikan responsivitas penuh dan ukuran area sentuh minimum
    - Periksa semua halaman di breakpoint 320px, 768px, 1199px, 1920px — pastikan tidak ada overflow horizontal
    - Tambahkan class Tailwind `min-h-[44px] min-w-[44px]` pada semua tombol aksi dan elemen interaktif di mobile
    - Navigasi mobile: menu hamburger atau bottom navigation yang dapat diakses dengan satu interaksi sentuh
    - _Persyaratan: 6.1, 6.2, 6.3, 6.4_

  - [x] 11.2 Tambahkan atribut aksesibilitas pada komponen interaktif
    - Pastikan semua form input memiliki `<label>` yang terhubung dengan `htmlFor`/`id`
    - Tambahkan `aria-label`, `aria-describedby`, `role` yang tepat pada dialog, tombol, dan komponen pencarian
    - Pastikan urutan tab logis di semua halaman
    - _Persyaratan: 6.1, 6.2, 6.3_

- [x] 12. Integration tests (Playwright)
  - [x]* 12.1 Tulis integration tests alur CRUD lengkap
    - Test tambah sharing baru → lihat di daftar → buka detail → edit → verifikasi perubahan → hapus → tidak ada di daftar
    - Gunakan database PostgreSQL tertanam terpisah di `.data/e2e-*` (tidak memakai `DATABASE_URL` aplikasi)
    - _Persyaratan: 2.2, 2.3, 3.2, 4.2, 4.3_

  - [x]* 12.2 Tulis integration tests responsivitas dan aksesibilitas
    - Uji layout di viewport 320px, 768px, 1024px, 1920px — pastikan tidak ada overflow horizontal dan konten tidak terpotong
    - Uji ukuran area sentuh tombol aksi di viewport mobile (≥ 44x44px)
    - Uji tampilan pesan kesalahan saat API tidak dapat dijangkau (mock network error)
    - _Persyaratan: 6.1, 6.2, 6.3, 6.4_

- [x] 13. Checkpoint akhir — Pastikan semua tes lulus
  - Jalankan seluruh test suite (`jest`, `playwright`). Pastikan semua tes lulus dan tidak ada regresi. Tanyakan kepada pengguna jika ada pertanyaan sebelum menyelesaikan implementasi.

## Hasil Implementasi — 27 Oktober 2026

- Implementasi wajib dan opsional di atas selesai di workspace ini.
- Build produksi Next.js berhasil dengan Webpack; pemeriksaan TypeScript lulus.
- Jest: 24 tes lulus, termasuk 10 properti dengan masing-masing 100 variasi input.
- Playwright: 25 tes lulus pada viewport 320, 768, 1024, 1199, dan 1920 px.
- Migrasi dan seed berhasil pada database PostgreSQL tertanam yang terpisah; seed tidak menggandakan data yang sudah ada.
- Screenshot desktop dan ponsel diperiksa; overflow, jumlah kolom, dan ukuran area sentuh juga diuji otomatis.
- Koneksi ke layanan PostgreSQL eksternal dan deployment hosting belum dijalankan. Konfigurasi serta langkah penggunaan tersedia di `README.md`.

## Notes

- Tugas yang ditandai dengan `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap tugas merujuk pada persyaratan spesifik untuk keterlacakan
- Checkpoint memastikan validasi bertahap selama pengembangan
- Property tests memvalidasi properti kebenaran universal (10 properties dari design)
- Unit tests memvalidasi contoh spesifik dan kasus tepi
- `creator_token` hanya dikirim sekali ke client saat POST sukses, terpisah dari data publik, lalu disimpan di localStorage. GET dan PUT tidak pernah mengembalikan token.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "3.1"] },
    { "id": 4, "tasks": ["3.2", "4.1"] },
    { "id": 5, "tasks": ["3.3", "3.4", "4.2"] },
    { "id": 6, "tasks": ["4.3", "4.4", "4.5"] },
    { "id": 7, "tasks": ["6.1", "6.2"] },
    { "id": 8, "tasks": ["6.3", "7.1", "7.2", "8.2"] },
    { "id": 9, "tasks": ["6.4", "7.3", "8.1"] },
    { "id": 10, "tasks": ["8.3", "9.1"] },
    { "id": 11, "tasks": ["9.2", "9.3", "9.4"] },
    { "id": 12, "tasks": ["11.1", "11.2"] },
    { "id": 13, "tasks": ["12.1", "12.2"] }
  ]
}
```
