import { loadEnvConfig } from "@next/env";
import { randomUUID } from "node:crypto";
import { getDatabase } from "../src/lib/db";
import { SharingFirmanRepository } from "../src/repository/sharing-firman.repository";

loadEnvConfig(process.cwd());
async function seed() {
  const db = await getDatabase();
  try {
    const repo = new SharingFirmanRepository(db);
    if ((await repo.findAll()).total > 0) {
      console.log(
        "Database sudah berisi catatan. Data contoh tidak ditambahkan.",
      );
      return;
    }
    const samples = [
      {
        judul: "Setia dalam perkara kecil",
        nama_pembagi: "Contoh — Lydia",
        tanggal_sharing: "2025-01-19",
        ayat_referensi: "Lukas 16:10",
        isi_ringkasan:
          "Kesetiaan bertumbuh lewat hal-hal kecil yang kita lakukan setiap hari. Melayani dengan tulus, menepati janji, dan hadir bagi sesama adalah bagian dari hidup yang dipersembahkan kepada Tuhan.\n\nMari memulai dari satu tindakan sederhana: hadir dan mendengarkan seseorang yang membutuhkan teman.",
      },
      {
        judul: "Kasih yang menjadi tindakan",
        nama_pembagi: "Contoh — Daniel",
        tanggal_sharing: "2025-01-12",
        ayat_referensi: "1 Yohanes 3:18",
        isi_ringkasan:
          "Kasih menjadi nyata ketika kita memberi ruang bagi kebutuhan orang lain. Kadang bentuknya sesederhana mengirim kabar, berbagi waktu, atau membantu tanpa menunggu diminta.\n\nRenungan minggu ini: siapa yang dapat kita kuatkan lewat tindakan kecil?",
      },
      {
        judul: "Bertumbuh di setiap musim",
        nama_pembagi: "Contoh — Maria",
        tanggal_sharing: "2025-01-05",
        ayat_referensi: "Pengkhotbah 3:1",
        isi_ringkasan:
          "Setiap musim kehidupan membawa pelajaran yang berbeda. Dalam sukacita kita belajar bersyukur; dalam penantian kita belajar percaya.\n\nBerjalan bersama komunitas menolong kita mengingat bahwa kita tidak harus menjalani setiap musim sendirian.",
      },
    ];
    for (const sample of samples)
      await repo.create({ ...sample, creator_token: randomUUID() });
    console.log(
      "Tiga catatan contoh ditambahkan. Ini data demonstrasi; kepemilikannya tidak terhubung ke browser.",
    );
  } finally {
    await db.close();
  }
}
seed().catch(() => {
  console.error(
    "Gagal menambahkan contoh. Pastikan database telah dimigrasikan.",
  );
  process.exitCode = 1;
});
