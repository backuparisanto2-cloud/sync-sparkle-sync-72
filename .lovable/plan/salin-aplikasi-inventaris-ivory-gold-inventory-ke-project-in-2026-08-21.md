# Salin aplikasi Inventaris (ivory-gold-inventory) ke project ini

Repo `backuparisanto2-cloud/ivory-gold-inventory` sudah dikonfirmasi publik dan isinya adalah project Lovable TanStack Start dengan backend Supabase: aplikasi inventaris kost (halaman utama, daftar kamar, detail kamar, fasilitas, foto barang + nota).

## Soal two-way sync

Sync dua arah tidak bisa diaktifkan dari chat, dan Lovable belum bisa meng-import repo GitHub yang sudah ada. Yang bisa dilakukan: saya salin kode repo itu ke project ini, lalu Anda hubungkan project ini ke GitHub lewat menu Plus (+) → GitHub → Connect project. Itu membuat repo baru yang tersinkron dua arah. Repo lama tetap ada sebagai sumber.

## Yang akan dibangun

1. **Aktifkan Lovable Cloud** (database, storage, auth) — dibutuhkan karena aplikasi memakai tabel inventaris dan bucket foto.
2. **Jalankan migrasi database** dari repo (3 file migrasi): tabel inventaris/kamar/foto, grant, RLS policy, dan storage bucket untuk foto & nota.
3. **Salin kode aplikasi**:
   - Halaman: beranda (ringkasan), daftar kamar, detail kamar per nomor, fasilitas.
   - Komponen: AppShell, kartu barang, badge kondisi, dialog tambah/edit barang, uploader foto, lightbox, signed image.
   - Library: logika inventaris, kompresi gambar, payload item, laporan rekap.
   - Komponen UI shadcn yang dipakai + styling/tema dari `src/styles.css`.
   - Aset publik: ikon aplikasi, favicon, manifest PWA.
4. **Sesuaikan integrasi Supabase** ke kredensial Cloud project ini (client, client.server, auth middleware, types) — tidak menyalin `.env` lama.
5. **Metadata halaman**: title/description/OG per route sesuai aplikasi inventaris.

## Catatan teknis

- Migrasi disalin apa adanya dari `supabase/migrations/*` repo, dijalankan berurutan; tabel publik akan dicek punya GRANT + RLS.
- Data isi (barang, foto) tidak ikut — hanya struktur. Kalau butuh data lama, itu perlu export/import terpisah dari project sumber.
- `src/routeTree.gen.ts` tidak disalin; digenerate ulang otomatis.
- Setelah salin, saya cek build bersih dan preview membuka halaman inventaris (bukan placeholder).
