# Laporan: Detail Kategori & Grafik Interaktif

Dua penambahan pada halaman Laporan (`/laporan`), mengikuti filter periode yang sudah ada (rentang tanggal atau bulan-tahun) dan opsi grouping (per kategori/kamar atau per nama barang).

## 1. Klik baris kategori untuk detail

- Baris pada tabel "Pembelian & nilai buku per kategori" menjadi bisa diklik (kursor pointer + highlight hover).
- Klik membuka panel detail (dialog di desktop, drawer di layar kecil) berisi:
  - Ringkasan grup: jumlah unit, total pembelian, akumulasi depresiasi, nilai buku.
  - Daftar item di grup tersebut: nama barang, lokasi (kamar/fasilitas), kondisi, qty, harga satuan, total, tanggal beli, vendor, garansi, depresiasi, nilai buku.
  - Daftar transaksi pembelian dalam periode terpilih, diurutkan berdasarkan tanggal beli (terbaru dulu), dengan subtotal.
- Detail hanya memakai baris yang lolos filter periode saat ini, jadi angkanya konsisten dengan ringkasan.
- Kolom pada tabel detail bisa diurutkan (klik header), dan ada tombol ekspor grup ini saja ke Excel/PDF memakai susunan kolom yang aktif.

## 2. Grafik interaktif

Ditempatkan di atas tabel kategori, dengan tab pemilih tampilan:

- **Per kategori/item**: bar chart bertumpuk/berdampingan untuk Nilai Pembelian, Akumulasi Depresiasi, dan Nilai Buku per grup (mengikuti toggle grouping yang sudah ada). Menampilkan top-N grup (default 10) dengan opsi "tampilkan semua".
- **Tren periode**: line/area chart nilai pembelian per bulan sepanjang rentang yang dipilih.
- Interaksi: tooltip berformat Rupiah, legend yang bisa diklik untuk menyembunyikan seri, dan klik pada bar membuka panel detail grup yang sama seperti poin 1.
- Grafik responsif dan mengikuti token warna tema (emas/ivory), bukan warna hardcoded.
- Jika belum ada data pembelian pada periode terpilih, grafik menampilkan pesan kosong yang informatif, bukan chart kosong.

## Catatan teknis

- Grafik memakai `recharts` lewat wrapper `src/components/ui/chart.tsx` yang sudah tersedia — tanpa dependensi baru.
- Agregasi memakai `summarizeByCategory` yang sudah ada di `src/lib/report-columns.ts`; ditambah helper baru untuk (a) memfilter baris per grup dan (b) menghitung tren pembelian per bulan.
- Komponen baru: `src/components/ReportCharts.tsx` dan `src/components/CategoryDetailDialog.tsx`; `src/routes/laporan.tsx` menyimpan state grup terpilih.
- Ekspor per grup memakai `exportExcel`/`exportPdf` yang sudah ada dengan subset baris.
- Tidak ada perubahan skema database.

## Di luar cakupan

Nilai rupiah tetap Rp 0 sampai harga dan tanggal pembelian diisi pada form barang — grafik dan detail akan langsung terisi begitu data pembelian ada.
