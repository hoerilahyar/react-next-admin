# Next.js Auth + Dashboard Boilerplate

Boilerplate minimal menggunakan **Next.js App Router** dengan halaman:

- `/login` — halaman login
- `/register` — halaman register
- `/dashboard` — halaman dashboard (dilindungi, hanya bisa diakses setelah login)
  - `/dashboard/analytics`
  - `/dashboard/settings`

## Cara Menjalankan

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buka `http://localhost:3000` — otomatis diarahkan ke `/login`.

## Konfigurasi API

Base URL backend diatur lewat environment variable di `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Ganti sesuai alamat backend Anda. Prefix `NEXT_PUBLIC_` wajib ada karena
variable ini dipakai di sisi client (browser), bukan cuma server.

Semua pemanggilan API dipusatkan lewat `lib/api.js` (fungsi `apiFetch`),
yang otomatis:
- Menambahkan `NEXT_PUBLIC_API_BASE_URL` di depan setiap path
- Menyisipkan header `Authorization: Bearer <access_token>` bila token tersedia
- **Auto-refresh token**: kalau server balas `401` (access token expired),
  otomatis memanggil `POST /auth/refresh` menggunakan `refresh_token` yang
  tersimpan, menyimpan token baru, lalu mengulang request aslinya sekali.
  Kalau `/auth/refresh` juga gagal (refresh token ikut expired/invalid),
  semua token dihapus dan user diarahkan paksa ke `/login`.
- Beberapa request yang kena `401` secara bersamaan tidak akan memicu
  beberapa kali panggilan refresh — semuanya menunggu satu proses refresh
  yang sama (dedupe via shared promise).
- **Roles/permissions ikut sinkron otomatis**: setiap kali access token
  di-refresh, `user` (termasuk `roles` & `permissions`) dari response
  `/auth/refresh` disimpan ulang ke `localStorage` DAN di-broadcast lewat
  event `auth:session-refreshed` yang didengarkan oleh `AuthProvider`
  (`lib/auth-context.js`) untuk meng-update React state. Jadi kalau role
  user diubah di backend, perubahan itu otomatis kepakai di frontend
  paling lambat satu siklus refresh (≤ `expires_in` detik) — **tanpa perlu
  logout/login manual** — asalkan endpoint `/auth/refresh` di backend
  memang mengambil ulang role/permission terbaru dari database, bukan
  sekadar re-sign klaim lama.
- Response backend diasumsikan berbentuk `{ success, message, data }` —
  `apiFetch` otomatis mengembalikan isi `data` saja ke pemanggil.

Endpoint yang dipakai:
- `POST /auth/login` — body `{ email, password }`
- `POST /auth/register` — body `{ name, email, password }` (sesuaikan bila belum ada di backend)
- `POST /auth/refresh` — body `{ refresh_token }`
- `POST /auth/logout`
- `GET /me` — dipanggil otomatis setiap kali app dibuka/direload untuk
  memvalidasi access_token ke server dan mengambil roles/permissions
  terbaru (respons diasumsikan `{ success, message, data: {...user} }`,
  sesuaikan bila struktur `data`-nya beda). Bisa juga diaktifkan sebagai
  polling berkala lewat `ME_POLL_INTERVAL_MS` di `lib/auth-context.js`
  kalau ingin perubahan role kepakai lebih cepat dari siklus refresh token.

Response `/auth/login` dan `/auth/refresh` diasumsikan:
```json
{
  "success": true,
  "message": "...",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": { "id": 1, "name": "...", "roles": [...], "permissions": [...] }
  }
}
```

## Struktur Folder

```
app/
  (auth)/
    login/page.js
    register/page.js
  dashboard/
    layout.js        <- proteksi route + sidebar + navbar
    page.js           <- overview
    analytics/page.js
    settings/page.js
  layout.js           <- root layout (bungkus AuthProvider)
  page.js              <- redirect ke /login
components/
  Sidebar.js
  Navbar.js
  ProtectedRoute.js
lib/
  auth-context.js      <- state auth (mock, pakai localStorage)
styles/
  globals.css          <- styling minimal, siap ditimpa
```

## Auth (Mock)

`lib/auth-context.js` berisi context auth sederhana yang menyimpan session
di `localStorage`. Ini **hanya untuk development/demo**. Sebelum production,
ganti fungsi `login`, `register`, dan `logout` di file tersebut dengan
integrasi API/auth provider asli (misalnya REST API, NextAuth.js, Firebase
Auth, Supabase, dsb).

## Cara Mengintegrasikan Template ThemeForest

1. **Copy asset statis** template (CSS, gambar, font, ikon) ke folder `public/`.
2. Jika template menyediakan file CSS biasa (bukan komponen React), import
   di `app/layout.js` di bawah `globals.css`, atau langsung di halaman terkait.
3. **Ganti markup** di dalam:
   - `app/(auth)/login/page.js` dan `app/(auth)/register/page.js` dengan
     markup form login/register dari template — pertahankan `onSubmit`,
     `name`, `value`, dan `onChange` pada setiap input agar logic tetap jalan.
   - `components/Sidebar.js` dan `components/Navbar.js` dengan markup
     sidebar/topbar dari template — pertahankan `<Link href>` untuk navigasi
     dan tombol logout yang memanggil `logout()` dari `useAuth()`.
   - `app/dashboard/page.js` dan sub-halaman lain dengan widget/kartu
     statistik dari template.
4. Jika template berbasis komponen React siap pakai, cukup import
   komponennya langsung ke dalam page/layout terkait.
5. Hapus class CSS placeholder di `styles/globals.css` secara bertahap
   seiring style dari template mengambil alih.

## Menambah Halaman Dashboard Baru

Buat folder baru di dalam `app/dashboard/`, misalnya `app/dashboard/users/page.js`.
Karena sudah dibungkus oleh `app/dashboard/layout.js`, halaman baru otomatis
mendapat sidebar, navbar, dan proteksi login tanpa perlu setup ulang.
