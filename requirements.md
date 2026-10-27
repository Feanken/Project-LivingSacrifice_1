# Requirements Document

## Introduction

Website **COOL Living Sacrifice** adalah platform digital untuk komunitas COOL Living Sacrifice gereja yang memungkinkan anggota untuk mencatat, berbagi, dan mengelola ringkasan sharing firman Tuhan. Website ini bertujuan membantu anggota komsel mengingat kembali firman yang sudah dibagikan, serta memperkuat komunitas rohani melalui dokumentasi yang terorganisir.

## Glossary

- **COOL**: Community of Love yaitu Kelompok Sel — kelompok kecil anggota jemaat gereja yang bertemu secara rutin untuk bersekutu dan belajar firman Tuhan bersama.
- **Firman**: Pesan atau pengajaran rohani yang bersumber dari Alkitab yang dibagikan dalam pertemuan komsel.
- **Sharing_Firman**: Ringkasan atau catatan dari pesan rohani yang dibagikan oleh seorang anggota komsel dalam suatu pertemuan.
- **Anggota**: Orang yang terdaftar dan aktif dalam suatu kelompok COOL.
- **Pemimpin_COOL**: Anggota yang berperan memimpin dan mengelola sebuah kelompok COOL
- **Website**: Aplikasi web yang menjadi platform utama Komsel Firman Sharing.
- **Pengguna**: Setiap orang yang mengakses Website, baik Anggota maupun Pemimpin_COOL.
- **Sistem**: Keseluruhan aplikasi Website Komsel Firman Sharing.

## Requirements

### Requirement 1: Melihat Daftar Sharing Firman

**User Story:** Sebagai Anggota komsel, saya ingin melihat daftar semua ringkasan sharing firman, agar saya dapat mengingat kembali firman yang telah dibagikan dalam pertemuan komsel.

#### Acceptance Criteria

1. WHEN Pengguna membuka halaman utama Website, THE Sistem SHALL menampilkan daftar Sharing_Firman yang telah tersimpan secara berurutan dari yang terbaru berdasarkan tanggal_sharing menurun, beserta informasi nama pembagi, judul firman, tanggal sharing, dan cuplikan ringkasan maksimal 150 karakter.
2. WHEN Pengguna memilih salah satu Sharing_Firman dari daftar, THE Sistem SHALL menampilkan halaman detail yang memuat seluruh isi ringkasan firman tersebut.
3. IF daftar Sharing_Firman kosong, THEN THE Sistem SHALL menampilkan teks "Belum ada sharing firman yang tercatat" di halaman utama.
4. IF Sistem gagal memuat daftar Sharing_Firman, THEN THE Sistem SHALL menampilkan pesan kesalahan yang menyatakan bahwa data tidak dapat dimuat dan menyarankan Pengguna untuk mencoba kembali.

---

### Requirement 2: Menambahkan Sharing Firman Baru

**User Story:** Sebagai Anggota komsel, saya ingin menambahkan ringkasan sharing firman yang baru, agar catatan firman yang saya bagikan dapat disimpan dan dilihat oleh anggota lain.

#### Acceptance Criteria

1. WHEN Pengguna mengakses formulir tambah Sharing_Firman, THE Sistem SHALL menampilkan formulir dengan kolom wajib: nama pembagi (maks. 255 karakter), judul firman (maks. 200 karakter), tanggal sharing, dan isi ringkasan (maks. 5000 karakter); serta kolom opsional: ayat referensi (maks. 100 karakter).
2. WHEN Pengguna mengisi seluruh kolom wajib dengan data yang valid dan mengirimkan formulir, THE Sistem SHALL menyimpan Sharing_Firman baru dan menampilkan pesan konfirmasi bahwa data berhasil disimpan.
3. WHEN Sharing_Firman baru berhasil disimpan, THE Sistem SHALL mengarahkan Pengguna ke halaman detail Sharing_Firman yang baru dibuat.
4. IF Pengguna mengirimkan formulir dengan kolom wajib yang kosong, THEN THE Sistem SHALL menampilkan pesan kesalahan yang menunjukkan kolom mana saja yang belum diisi dan tidak menyimpan data.
5. IF Pengguna memasukkan tanggal sharing yang melebihi tanggal hari ini, THEN THE Sistem SHALL menampilkan pesan kesalahan yang menyatakan bahwa tanggal sharing tidak boleh melebihi tanggal hari ini.
6. THE Sistem SHALL menerapkan batas keras 5000 karakter pada kolom isi ringkasan dengan mencegah pengetikan karakter tambahan setelah batas tercapai, serta menampilkan penghitung karakter yang tersisa secara real-time.

---

### Requirement 3: Mengedit Sharing Firman

**User Story:** Sebagai Anggota COOL saya ingin mengedit ringkasan sharing firman yang sudah saya tambahkan, agar saya dapat memperbaiki kesalahan atau menambahkan informasi yang kurang.

#### Acceptance Criteria

1. WHEN Pengguna yang merupakan pembuat Sharing_Firman memilih opsi edit, THE Sistem SHALL menampilkan formulir edit yang sudah terisi dengan data Sharing_Firman yang ada, mencakup kolom: judul, tanggal, nama pembagi, ayat referensi, dan isi ringkasan.
2. WHEN Pengguna menyimpan perubahan dengan seluruh kolom wajib terisi dan judul tidak melebihi 200 karakter serta isi ringkasan tidak melebihi 5000 karakter, THE Sistem SHALL memperbarui data Sharing_Firman dan menampilkan halaman detail dengan data terbaru.
3. IF Pengguna menyimpan perubahan dengan kolom wajib (judul, tanggal, nama pembagi, isi ringkasan) yang kosong, THEN THE Sistem SHALL menampilkan pesan kesalahan yang menunjukkan kolom mana saja yang belum diisi dan tidak memperbarui data.
4. WHEN Sharing_Firman berhasil diperbarui, THE Sistem SHALL mencatat dan menampilkan waktu terakhir diperbarui dalam format dd/mm/yyyy HH:mm pada halaman detail.
5. IF Pengguna yang bukan pembuat Sharing_Firman mencoba mengakses formulir edit, THEN THE Sistem SHALL menampilkan pesan kesalahan bahwa aksi tidak diizinkan dan tidak menampilkan formulir edit.

---

### Requirement 4: Menghapus Sharing Firman

**User Story:** Sebagai Anggota COOL, saya ingin menghapus ringkasan sharing firman yang sudah tidak relevan, agar daftar sharing firman tetap terorganisir.

#### Acceptance Criteria

1. WHEN Pengguna yang merupakan pembuat Sharing_Firman memilih opsi hapus, THE Sistem SHALL menampilkan dialog konfirmasi yang mencantumkan judul Sharing_Firman yang akan dihapus dan dua pilihan: konfirmasi hapus dan batalkan.
2. WHEN Pengguna mengkonfirmasi penghapusan, THE Sistem SHALL menghapus Sharing_Firman secara permanen dari sistem.
3. WHEN Sharing_Firman berhasil dihapus, THE Sistem SHALL mengarahkan Pengguna kembali ke halaman daftar.
4. WHEN Pengguna membatalkan konfirmasi penghapusan, THE Sistem SHALL menutup dialog konfirmasi dan tidak melakukan perubahan apapun pada data.
5. THE Sistem SHALL menyembunyikan opsi hapus dari tampilan Pengguna yang bukan pembuat Sharing_Firman, sehingga dialog konfirmasi tidak pernah ditampilkan kepada mereka.
6. IF Sistem gagal menghapus Sharing_Firman karena kesalahan teknis, THEN THE Sistem SHALL menampilkan pesan kesalahan yang menyatakan bahwa penghapusan gagal dan menyarankan Pengguna untuk mencoba kembali.

---

### Requirement 5: Mencari dan Memfilter Sharing Firman

**User Story:** Sebagai Anggota COOL, saya ingin mencari dan memfilter sharing firman berdasarkan kata kunci atau nama pembagi, agar saya dapat dengan mudah menemukan firman tertentu.

#### Acceptance Criteria

1. WHEN Pengguna memasukkan kata kunci minimal 1 karakter pada kolom pencarian, THE Sistem SHALL menampilkan daftar Sharing_Firman yang judulnya atau isi ringkasannya mengandung kata kunci tersebut secara case-insensitive.
2. WHEN Pengguna memilih nama Anggota sebagai filter, THE Sistem SHALL menampilkan hanya Sharing_Firman yang dibagikan oleh Anggota yang dipilih.
3. IF pencarian atau filter tidak menghasilkan Sharing_Firman yang cocok, THEN THE Sistem SHALL menampilkan pesan yang menyatakan tidak ada hasil yang ditemukan untuk kata kunci atau filter yang digunakan.
4. WHEN Pengguna mengosongkan kolom pencarian dan menghapus semua filter, THE Sistem SHALL menampilkan kembali seluruh daftar Sharing_Firman diurutkan dari yang terbaru berdasarkan tanggal sharing menurun.

---

### Requirement 6: Tampilan Responsif

**User Story:** Sebagai Anggota COOL, saya ingin mengakses website ini dari perangkat apapun (ponsel, tablet, atau komputer), agar saya dapat melihat dan mengelola sharing firman kapan saja dan di mana saja.

#### Acceptance Criteria

1. THE Sistem SHALL menampilkan antarmuka tanpa overflow horizontal dan tanpa konten yang terpotong pada seluruh lebar layar mulai dari 320px hingga 1920px.
2. WHEN Pengguna mengakses Website dari perangkat dengan lebar layar kurang dari 768px, THE Sistem SHALL menampilkan tata letak satu kolom dengan menu navigasi yang dapat diakses melalui satu interaksi sentuh.
3. IF lebar layar perangkat kurang dari 768px, THEN THE Sistem SHALL memastikan seluruh tombol aksi dan elemen interaktif memiliki ukuran area sentuh minimal 44x44 piksel.
4. WHEN Pengguna mengakses Website dari perangkat dengan lebar layar antara 768px dan 1199px, THE Sistem SHALL menampilkan tata letak dua kolom dengan seluruh konten dan navigasi tetap dapat diakses tanpa scroll horizontal.
