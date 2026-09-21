# Si BAGUS — Frontend (untuk GitHub + Vercel)

Frontend ini dibuat agar kamera/QR/lokasi berjalan normal — halaman berjalan
sebagai website biasa di domain Vercel, bukan di dalam sandbox iframe Apps
Script yang sering memblokir izin kamera.

Data tetap tersimpan di Google Sheets yang sama. Apps Script sekarang hanya
berfungsi sebagai **API backend** (dipanggil lewat `fetch()`), bukan lagi
yang merender halaman.

## 1. Deploy ulang Code.gs sebagai API

1. Buka project Apps Script Anda, ganti seluruh isi `Code.gs` dengan versi
   terbaru yang sudah berisi `doPost()` (file `Code.gs` yang dikirim di chat).
2. Deploy > Manage deployments > buat **versi baru** (atau New deployment).
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Salin URL yang berakhiran `/exec`. Ini adalah `APPS_SCRIPT_URL` Anda.

## 2. Isi URL API di frontend

Buka `gas-shim.js`, ganti baris ini:

```js
var APPS_SCRIPT_URL = "PASTE_URL_EXEC_APPS_SCRIPT_ANDA_DI_SINI";
```

dengan URL `/exec` dari langkah 1.

## 3. Upload ke GitHub

```bash
git init
git add .
git commit -m "Si BAGUS frontend"
git branch -M main
git remote add origin https://github.com/USERNAME/si-bagus.git
git push -u origin main
```

## 4. Deploy ke Vercel

1. Buka https://vercel.com, klik **Add New > Project**.
2. Pilih repo GitHub yang barusan dibuat.
3. Framework preset: pilih **Other** (ini situs statis, tidak perlu build step).
4. Klik **Deploy**.
5. Setelah selesai, Anda dapat 2 halaman:
   - `https://nama-project.vercel.app/` → halaman siswa (scan QR/wajah/lokasi)
   - `https://nama-project.vercel.app/admin` → panel admin

## 5. Uji coba

- Buka halaman siswa di HP, coba **Scan Barcode** dan **Absen Sekarang**
  (kamera). Karena sekarang halaman berjalan langsung di domain Vercel
  (bukan iframe Apps Script), browser akan menampilkan prompt izin kamera
  yang normal — klik Allow.
- Buka `/admin`, login pakai PIN admin (default `123456` kalau baru setup),
  lalu klik **Setup Sheet** kalau sheet belum pernah di-setup.

## Jika ada error CORS di console browser

Google Apps Script Web App biasanya sudah bisa diakses cross-origin untuk
request seperti ini, tapi jika muncul error CORS:
- Pastikan deployment diakses lewat URL `/exec` (bukan `/dev`).
- Pastikan "Who has access" = **Anyone** (bukan "Anyone with Google account").
- Pastikan `Content-Type` request tetap `text/plain;charset=utf-8` (sudah
  diatur di `gas-shim.js`) — mengubahnya ke `application/json` akan memicu
  CORS preflight yang tidak bisa dijawab Apps Script.

## Catatan keamanan

Fungsi yang mengubah data (`updateSettings`, `addStudent`, `deleteStudent`,
`registerFace`, `updateStudentContact`, `setupSpreadsheet`, `getStudentList`)
sekarang mewajibkan PIN admin yang valid dikirim dan diverifikasi **di sisi
server** (bukan cuma dicek di browser seperti sebelumnya). PIN disimpan di
`sessionStorage` browser setelah login — cukup aman untuk skala sekolah,
tapi bukan pengganti sistem autentikasi penuh (mis. OAuth) jika ke depan
butuh keamanan lebih ketat.
