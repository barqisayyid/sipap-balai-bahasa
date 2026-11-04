# SIPAP — Sistem Informasi Penjadwalan & Agenda Pimpinan
**Balai Bahasa Provinsi Sumatera Barat**

SIPAP adalah aplikasi berbasis *Progressive Web App* (PWA) *mobile-first* yang dirancang untuk mengelola dan memantau agenda kedinasan Kepala Balai secara terpusat, mencegah jadwal bentrok (*conflict detection*), serta mendistribusikan notifikasi kedinasan otomatis multi-kanal melalui WhatsApp Gateway (Fonnte).

---

## 🏛️ Fitur Utama

1. **Dasbor Pimpinan & Jam Digital WIB:**
   - Jam digital *real-time* dengan format zona waktu Waktu Indonesia Barat (WIB).
   - Kartu ringkasan agenda hari ini dan agenda terdekat.
   - Pusat notifikasi interaktif pada ikon lonceng header (menampilkan agenda pending).

2. **Manajemen Agenda Lengkap (CRUD):**
   - **Tambah Agenda:** Validasi 5 kolom wajib (perihal, tanggal, jam mulai, jam selesai, tempat) beserta data pendukung (pakaian dinas, pendamping, tautan Google Maps, berkas surat).
   - **Deteksi Bentrok Jadwal:** Peringatan otomatis *real-time* jika waktu agenda bertabrakan dengan kegiatan lain.
   - **Ubah & Hapus Agenda:** Operator dan Super Admin dapat merevisi jadwal serta menghapus agenda yang salah dengan konfirmasi aman (*soft delete*).
   - **Pencarian Cepat (*Live Search*):** Kotak pencarian multi-kolom instan di halaman daftar agenda.

3. **Notifikasi WhatsApp Multi-Kanal Berjenjang:**
   - **Pimpinan:** Menerima notifikasi instan dengan tombol **Konfirmasi Cepat Tanpa Login** (`HADIR` / `DISPOSISIKAN`).
   - **Ajudan / Pemantau:** Menerima tembusan koordinasi teknis, eskalasi H-1 (pukul 18.30 WIB), dan peringatan darurat H-1 jam.
   - **Operator & Super Admin:** Menerima tembusan koordinasi rincian pakaian dinas, nama pendamping, dan tautan dokumen di SIPAP.
   - **Rekap Pagi:** Rekapitulasi agenda hari berjalan otomatis dikirimkan setiap pukul 06.30 WIB.

4. **Aksi Cepat & Berkas Kalender:**
   - **Salin Info Agenda:** Salin ringkasan format WhatsApp dalam 1 ketukan.
   - **Ekspor Kalender (.ics):** Unduh berkas `.ics` standar yang kompatibel dengan Google Calendar, Apple Calendar, dan Outlook.
   - **Unggah Berkas Surat:** Penyimpanan dokumen surat masuk terproteksi (*Signed URL*).

5. **Manajemen Pengguna (Super Admin):**
   - Kelola pengguna berdasarkan peran (*Pimpinan, Super Admin, Pemantau, Operator*).
   - Pengiriman otomatis pesan sambutan dan info akun baru ke WhatsApp pengguna.
   - Proteksi *anti-self-lockout* agar akun admin sendiri tidak terkunci.

---

## 🛠️ Tumpukan Teknologi (*Tech Stack*)

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Bahasa:** TypeScript & Tailwind CSS
- **Basis Data & Autentikasi:** [Supabase](https://supabase.com/) (PostgreSQL 15, Auth, Storage)
- **WhatsApp Gateway:** [Fonnte API](https://fonnte.com/)
- **Hosting & Cron:** Vercel / GitHub Actions / Serverless Cron

---

## ⚙️ Variabel Lingkungan (`.env.local`)

Salin berkas konfigurasi lingkungan berikut ke `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# WhatsApp Gateway (Fonnte)
FONNTE_TOKEN=your_fonnte_token_here

# Domain Aplikasi
APP_URL=https://sipap-balai-bahasa.vercel.app

# Keamanan Cron Trigger
CRON_SECRET=your_random_secure_cron_token_here

# Web Push Notification (Opsional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@balaibahasasumbar.kemdikbud.go.id
```

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev

# 3. Jalankan pengujian lint
npm run lint

# 4. Bangun versi produksi
npm run build
```

Buka peramban di `http://localhost:3000`.

---

## ⏰ Konfigurasi Otomatisasi Jadwal (Cron Scheduler)

Sistem pengingat berjalan melalui pemanggilan endpoint `/api/cron/reminder`. Terdapat 3 opsi pengaktifan otomatis:

### Opsi 1: Vercel Cron (`vercel.json`)
Berkas [`vercel.json`](file:///vercel.json) telah dikonfigurasi untuk memicu rekap pagi harian pukul 06.30 WIB (23.30 UTC):
```json
{
  "crons": [
    {
      "path": "/api/cron/reminder",
      "schedule": "30 23 * * *"
    }
  ]
}
```
*Catatan: Pada paket Vercel Pro, jadwal dapat diset ke `"*/10 * * * *"` untuk evaluasi setiap 10 menit.*

### Opsi 2: GitHub Actions (100% Gratis & Otomatis)
Berkas workflow [`.github/workflows/cron.yml`](file:///.github/workflows/cron.yml) telah disediakan untuk memicu endpoint setiap 15 menit secara gratis melalui server GitHub. Cukup masukkan `APP_URL` dan `CRON_SECRET` ke menu **Settings > Secrets and variables > Actions** di repositori GitHub Anda.

### Opsi 3: cron-job.org / Supabase pg_cron
Daftarkan URL:
`https://<domain-anda>/api/cron/reminder`
Tambahkan HTTP Header:
`Authorization: Bearer <CRON_SECRET>`
Atur frekuensi pengulangan setiap 5 atau 10 menit.
