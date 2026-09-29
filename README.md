<div align="center">

  # 🚀 ShareRoom — Temporary Room Chat & Digital Kas Wallet Platform

  <p align="center">
    A modern, feature-rich web application built with <b>Laravel 11</b>, <b>Inertia.js v3</b>, <b>React 19</b>, <b>TypeScript</b>, <b>Tailwind CSS</b>, and <b>Midtrans Payment Gateway</b>.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 11" />
    <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Inertia.js-v3-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-v3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Midtrans-Sandbox-0070BA?style=for-the-badge&logo=paypal&logoColor=white" alt="Midtrans Gateway" />
  </p>
</div>

---

## 📖 Ringkasan Aplikasi (About Project)

**ShareRoom** adalah platform manajemen room obrolan sementara dan dompet kas digital bersama. Pengguna dapat membuat room instan dengan masa aktif (durasi) tertentu, membagikan kode unik unik room ke rekan tim/teman, serta mengelola dompet kas digital room yang terintegrasi dengan **Midtrans Payment Gateway (Sandbox)**.

Aplikasi ini dilengkapi dengan sistem peran pengguna (*Owner*, *Bendahara*, *Member*), manajemen voucher promo diskon, notifikasi tindakan berbentuk SweetAlert2, serta **Dashboard Governance Admin** untuk memantau room, membekukan saldo dengan notifikasi alasan, serta mempublikasikan pengumuman resmi global menggunakan *Quick Templates*.

---

## ✨ Fitur-Fitur Utama (Key Features)

### 🏠 1. Manajemen Room & Gelembung Chat
- **Pembuatan Room Instan**: Pengguna menentukan nama room dan durasi masa aktif room (misal: 1 jam, 1 hari, 7 hari).
- **Auto-Generate Kode Unik**: Menghasilkan kode unik yang dapat langsung disalin dan dibagikan ke berbagai platform.
- **Gelembung Chat & Countdown Timer**: Antarmuka chat interaktif dengan indikator timer waktu tersisa room secara real-time.
- **Manajemen Peran Member**:
  - **Owner**: Memiliki hak penuh untuk mengelola room, menunjuk **Bendahara (Financial Manager)**, serta melakukan *kick member*.
  - **Bendahara (Treasurer)**: Hak khusus pengelola transaksi dan saldo keuangan kas room.
  - **Member**: Dapat berpartisipasi dalam obrolan, keluar dari room (*leave room*), serta menghapus riwayat room jika sudah tidak terhubung.

### 💳 2. Dompet Digital Kas Room & Payment Gateway
- **Inisialisasi Saldo Rp 0**: Setiap room baru memiliki saldo kas terpisah yang berawal dari Rp 0.
- **Integrasi Midtrans Payment Gateway (Sandbox)**: Simulasi top-up saldo kas room menggunakan Midtrans Snap API.
- **Pilihan Nominal Cepat**: Pilihan cepat nominal top-up (Rp 10.000, Rp 20.000, Rp 50.000) atau input manual min. Rp 10.000.
- **Sistem Kode Promo (Voucher Diskon)**: Fitur diskon persentase (%) atau potongan harga tetap (Rp) yang dibuat oleh Admin. User mendapatkan nilai top-up penuh dengan biaya pembayaran yang sudah terpotong diskon.

### 🛡️ 3. Dashboard Governance Admin
- **Manajemen Room**: Memantau total room aktif dan pengguna tanpa mengakses isi chat pribadi.
- **Suntik Saldo Manual (Top-Up Admin)**: Admin dapat menambahkan dana ke kas room jika diperlukan.
- **Pembekuan Saldo Kas (Freeze Wallet)**: Admin dapat membekukan dompet kas room beserta **Alasan Pembekuan Wajib**. Notifikasi alasan pembekuan akan tampil secara transparan kepada seluruh member di dalam room.
- **Manajemen Kode Promo**: Admin dapat membuat, mengaktifkan/menonaktifkan, menentukan minimal top-up, serta mengatur masa berlaku kode promo.

### 📢 4. Pusat Pengumuman Global & Quick Templates Admin
- **Timeline Pengumuman User (`/announcements`)**: Halaman khusus pemberitahuan resmi dari Admin lengkap dengan badge kategori (*Update*, *Promo*, *Maintenance*, *Warning*) dan penanda sematan (📌 *Pinned*).
- **Quick Template Chips Admin**: Admin dapat mempublikasikan pengumuman secara instan menggunakan template cepat:
  - 📢 **Perawatan Sistem (Maintenance Scheduled)**
  - 🚀 **Rilis Fitur Baru (New Release)**
  - 🎁 **Event & Promo Top Up Spesial**
  - ⚠️ **Himbauan Keamanan & Privasi Akun**

### 🎨 5. Tampilan Dual-Layout & Mode Gelap/Terang
- **Sistem Navigasi Berbasis Role**:
  - **Regular User Layout**: Navigasi **Floating Top Navbar** melayang di atas tengah dengan efek *Glassmorphism* (`rounded-2xl`) & *Hamburger Mobile Drawer*.
  - **Admin Layout**: Navigasi **Collapsible Vertical Sidebar** di sebelah kiri untuk fleksibilitas dan skalabilitas menu manajemen admin di masa depan.
- **Theme Switcher**: Segmented control 3 mode (**☀️ Terang | 🌙 Gelap | 🖥️ Auto**) yang responsif di seluruh tampilan aplikasi.
- **SweetAlert2 Feedback Popups**: Notifikasi pop-up interaktif untuk setiap hasil tindakan CRUD, konfirmasi hapus, atau kelayakan transaksi.

---

## 🛠️ Teknologi & Stack (Tech Stack)

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Backend Framework** | [Laravel 11.x](https://laravel.com) | Framework PHP modern dengan struktur bersih & performa tinggi. |
| **Frontend Bridge** | [Inertia.js v3](https://inertiajs.com) | Monolith modern tanpa perlu membangun API REST terpisah. |
| **Frontend Library** | [React 19](https://react.dev) | UI declarative berbasis komponen React modern. |
| **Type Safety** | [TypeScript](https://www.typescriptlang.org) | Pengetikan statis penuh di seluruh komponen frontend. |
| **Styling & CSS** | [Tailwind CSS v3](https://tailwindcss.com) | Utility-first CSS dengan variabel CSS design system. |
| **Payment Gateway** | [Midtrans Snap API](https://midtrans.com) | Payment gateway sandbox untuk simulasi transaksi top-up. |
| **Icons & Alerts** | [Lucide React](https://lucide.dev) & [SweetAlert2](https://sweetalert2.github.io) | Ikonik modern & pop-up umpan balik pengguna interaktif. |

---

## 📂 Struktur Direktori Proyek (Project Structure)

```text
share_room/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/              # Admin Room, User, Promo, & Announcement Controllers
│   │   │   ├── AnnouncementController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── TopUpController.php
│   │   │   └── UserRoomController.php
│   │   └── Middleware/             # EnsureUserIsAdmin & HandleAppearance Middlewares
│   └── Models/                     # Room, RoomMember, RoomMessage, PromoCode, GlobalAnnouncement
├── database/
│   ├── migrations/                 # Migrasi Skema Tabel MySQL
│   └── seeders/                    # Sample Seeder Admin & Initial Data
├── resources/
│   ├── js/
│   │   ├── components/             # AppHeader (Floating Navbar), AppSidebar, SweetAlert Helper
│   │   ├── layouts/                # AppLayout, AppHeaderLayout, AppSidebarLayout
│   │   ├── pages/                  # Dashboard, Rooms, Admin Panel, Announcements
│   │   └── types/                  # TypeScript Types Definitions
│   └── css/                        # Tailwind CSS Entry Point
└── routes/
    └── web.php                     # Route Definitions & Protection Groups
```

---

## ⚡ Petunjuk Instalasi & Cara Menjalankan (Installation Guide)

### 1. Prasyarat Sistem (Prerequisites)
Pastikan komputer Anda telah terinstal:
- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x & **npm**
- **MySQL Database Server**

### 2. Langkah-Langkah Instalasi

```bash
# 1. Clone repository ini
git clone https://github.com/username/share_room.git
cd share_room

# 2. Install dependensi PHP (Composer)
composer install

# 3. Install dependensi Frontend (NPM)
npm install

# 4. Salin file lingkungan .env
cp .env.example .env

# 5. Generate Application Key
php artisan key:generate
```

### 3. Konfigurasi Lingkungan (`.env`)

Buka file `.env` lalu sesuaikan konfigurasi database Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shared-room
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Migrasi Database & Run Project

```bash
# Jalankan migrasi database beserta data awal (Seeder)
php artisan migrate --seed

# Kompilasi aset frontend (Development Server)
npm run dev

# Di terminal terpisah, jalankan server Laravel
php artisan serve
```

Aplikasi dapat diakses melalui browser di: `http://127.0.0.1:8000`.

---

## 🧪 Perintah Pengujian & Verifikasi (Verification Commands)

```bash
# Pengecekan Type Safety TypeScript
npm run types:check

# Kompilasi Production Bundle Asset
npm run build
```

---

## 📝 Lisensi (License)

Proyek **ShareRoom** dirilis di bawah lisensi [MIT License](LICENSE). Bebas digunakan dan dikembangkan kembali.

<div align="center">
  <p>Dikembangkan dengan ❤️ menggunakan <b>Laravel 11</b> & <b>React Inertia</b></p>
</div>
