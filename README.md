# 🎓 Aplikasi SIAKAD Mobile — Praktikum Bab 4, 5, & 6
### Sistem Informasi Akademik Sekolah (React Native + Supabase)

Aplikasi Sistem Informasi Akademik Sekolah (SIAKAD) berbasis **React Native (Expo)** dan **Supabase Backend (PostgreSQL)**. Proyek ini merupakan implementasi terpadu dari materi pembelajaran **Bab 4, Bab 5, dan Bab 6** dalam mata pelajaran Pemrograman Mobile Lanjutan.

---

## 📚 Cakupan Materi Pembelajaran (Bab 4 – 6)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODUL PRAKTIKUM LENGKAP                           │
├──────────────────────┬──────────────────────────┬───────────────────────────┤
│        BAB 4         │          BAB 5           │           BAB 6           │
│  Backend & Database  │ Auth & State Management  │ Advanced Auth, RBAC & RLS │
├──────────────────────┼──────────────────────────┼───────────────────────────┤
│ • Supabase Client    │ • Register & Login Auth  │ • Multi-Role (3 Roles)    │
│ • Schema & CRUD      │ • Persistent Session     │ • Row Level Security(RLS) │
│ • Service Layer API  │ • Zustand Auth Store     │ • Protected Route Guards  │
│ • DB Triggers & Calc │ • Auto Refresh Token     │ • Role-Based Navigation   │
└──────────────────────┴──────────────────────────┴───────────────────────────┘
```

---

### 📘 Bab 4: Integrasi Backend & Database Supabase
Pada bab ini dibangun fondasi komunikasi data antara aplikasi mobile dan database PostgreSQL Supabase:
- **Supabase Client Setup**: Inisialisasi koneksi aman via `src/services/supabaseClient.js`.
- **Clean Architecture Service Layer**: Pemisahan logika bisnis API (`schoolService.js` & `authService.js`).
- **Database Schema & CRUD**: Pengelolaan tabel `profiles`, `grades` (nilai), dan `schedules` (jadwal).
- **PostgreSQL Database Triggers**:
  - `handle_new_user()`: Otomatis membuat data profil saat akun baru terdaftar.
  - `calculate_grade_predicate()`: Otomatis menghitung predikat nilai (A/B/C/D) saat nilai disimpan.
- **Formula Akademik**: Perhitungan Nilai Akhir otomatis:
  $$\text{Nilai Akhir} = (30\% \times \text{Tugas}) + (30\% \times \text{UTS}) + (40\% \times \text{UAS})$$

---

### 🔐 Bab 5: Autentikasi Pengguna & Manajemen Sesi
Pada bab ini diimplementasikan autentikasi lengkap dan persistensi data sesi:
- **Registrasi & Login**: Form autentikasi dengan validasi input yang ketat (`src/utils/validation.js`).
- **Session Lifecycle & Persistent Storage**: Menggunakan `@react-native-async-storage/async-storage` agar status login tidak hilang saat aplikasi ditutup.
- **Global State Management (Zustand)**: Mengelola state `user`, `session`, `role`, dan `profile` secara terpusat di `src/store/useAuthStore.js`.
- **Auto Refresh Token & JWT**: Mengelola daur hidup access token dan refresh token Supabase Auth secara otomatis.

---

### 🛡️ Bab 6: Autentikasi Lanjutan, Role-Based Access Control (RBAC) & Row Level Security (RLS)
Bab ini merupakan tingkat lanjutan keamanan data di sisi backend maupun frontend:
- **3 Tingkatan Hak Akses (Role)**:
  1. 👨‍💼 **Admin**: Memiliki hak penuh untuk mengelola pengguna, mengubah role user lain, memonitor seluruh nilai, dan mengelola jadwal.
  2. 👨‍🏫 **Guru**: Dapat menginput, mengubah, dan menghapus nilai seluruh siswa, serta melihat jadwal mengajar.
  3. 👨‍🎓 **Siswa**: Hanya dapat melihat rapor nilai milik dirinya sendiri dan jadwal kelas.
- **PostgreSQL Row Level Security (RLS)**:
  - Proteksi data di tingkat database (bukan sekadar validasi tampilan frontend).
  - Menggunakan fungsi *Security Definer* (`is_admin()`, `is_teacher_or_admin()`, `get_my_role()`) untuk mencegah *infinite recursion* pada PostgreSQL RLS.
  - Kebijakan RLS memastikan siswa **tidak bisa membaca nilai siswa lain** meskipun mencoba melakukan *query* langsung ke Supabase API.
- **Multi-Role Navigators**:
  - `AppNavigator.jsx` mendeteksi role aktif dan memuat navigator yang sesuai (`AdminNavigator`, `GuruNavigator`, atau `SiswaNavigator`).
- **Route Guard Component & Halaman 403**:
  - Komponen `<RequireRole allowedRoles={['admin', 'guru']}>` untuk memproteksi halaman dari role yang tidak berhak.
  - Halaman informatif `AccessDeniedScreen.jsx` jika terjadi pelanggaran hak akses.

---

## 👥 Fitur Aplikasi Berdasarkan Role

| Fitur | 👨‍💼 Admin | 👨‍🏫 Guru | 👨‍🎓 Siswa |
| :--- | :---: | :---: | :---: |
| **Login & Register Akun** | ✅ | ✅ | ✅ |
| **Edit Profil & Avatar Sendiri** | ✅ | ✅ | ✅ |
| **Lihat Rapor Nilai Pribadi** | - | - | ✅ |
| **Lihat Jadwal Pelajaran (Filter Hari)** | ✅ | ✅ (Jadwal Mengajar) | ✅ (Jadwal Kelas) |
| **Input & Edit Nilai Siswa** | ✅ | ✅ | ❌ *(Diblokir RLS)* |
| **Hapus Data Nilai Siswa** | ✅ | ✅ | ❌ *(Diblokir RLS)* |
| **Lihat Seluruh Rekap Nilai Siswa** | ✅ | ✅ | ❌ *(Diblokir RLS)* |
| **Ubah Role Pengguna (Siswa $\leftrightarrow$ Guru $\leftrightarrow$ Admin)** | ✅ | ❌ | ❌ *(Diblokir RLS)* |
| **Dashboard Statistik Pengguna** | ✅ | ❌ | ❌ |

---

## 📂 Struktur Direktori Proyek

```text
auth-lanjutan-app/
├── supabase_bab6_schema.sql    # Skrip SQL Lengkap (Tabel, Trigger, RLS Policy, Seed Data)
├── App.jsx                     # Root Component & Inisialisasi Auth Store
├── package.json
├── .env.example
├── README.md
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── HeaderBar.jsx       # Header interaktif dengan avatar, badge role, & navigasi
│   │   ├── RoleBadge.jsx       # Label visual penanda role pengguna
│   │   ├── RequireRole.jsx     # Route Guard pembungkus komponen (RBAC)
│   │   ├── GradeCard.jsx       # Kartu nilai siswa dengan rincian predikat
│   │   ├── ScheduleCard.jsx    # Kartu jadwal pelajaran dan ruang kelas
│   │   ├── UserItem.jsx        # Kartu item pengguna & dropdown pengubah role (Admin)
│   │   ├── ToastNotification.jsx
│   │   ├── ErrorBanner.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── index.js
│   ├── constants/              # Design System Tokens
│   │   ├── colors.js           # Palet warna spesifik tiap role (Admin, Guru, Siswa)
│   │   ├── typography.js
│   │   ├── spacing.js
│   │   └── index.js
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.js          # Hook akses status autentikasi & profile
│   │   ├── useSchool.js        # Hook data nilai, jadwal, dan manajemen pengguna
│   │   └── index.js
│   ├── navigation/             # Role-Based Routing
│   │   ├── AppNavigator.jsx    # Root Switcher (Auth / Admin / Guru / Siswa)
│   │   ├── AdminNavigator.jsx  # Stack khusus role Admin
│   │   ├── GuruNavigator.jsx   # Stack khusus role Guru
│   │   ├── SiswaNavigator.jsx  # Stack khusus role Siswa
│   │   └── index.js
│   ├── screens/                # Layar Antarmuka
│   │   ├── LoginScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   ├── ProfileScreen.jsx
│   │   ├── AccessDeniedScreen.jsx # Layar 403 Akses Ditolak
│   │   ├── admin/
│   │   │   ├── AdminDashboardScreen.jsx
│   │   │   └── ManageGradesScreen.jsx
│   │   ├── guru/
│   │   │   ├── GuruDashboardScreen.jsx
│   │   │   ├── GradeInputScreen.jsx
│   │   │   └── GuruScheduleScreen.jsx
│   │   ├── siswa/
│   │   │   ├── SiswaDashboardScreen.jsx
│   │   │   └── SiswaScheduleScreen.jsx
│   │   └── index.js
│   ├── services/               # Clean Services API Layer
│   │   ├── supabaseClient.js   # Konfigurasi Supabase + AsyncStorage
│   │   ├── authService.js      # Endpoint Auth (Login, Register, Logout, Reset)
│   │   ├── schoolService.js    # Endpoint Profiles, Grades, Schedules
│   │   └── index.js
│   ├── store/                  # Global State Management (Zustand)
│   │   ├── useAuthStore.js     # State user, session, role, profile
│   │   └── index.js
│   └── utils/                  # Helper Utilities Murni
│       ├── gradeCalculator.js  # Kalkulasi Nilai Akhir & Konversi Predikat
│       ├── formatDate.js       # Format tanggal Indonesia
│       ├── validation.js       # Validasi form input
│       └── index.js
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Setup Database di Supabase
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard).
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase_bab6_schema.sql` di proyek ini, lalu salin dan jalankan (*Run*) seluruh skrip SQL.
4. Skrip tersebut akan menyiapkan:
   - Tabel `profiles`, `grades`, `schedules`.
   - Function & Trigger untuk registrasi otomatis dan kalkulasi predikat.
   - Aturan keamanan **Row Level Security (RLS)** lengkap.
   - Data awal (*seed data*) jadwal pelajaran.

### 2. Konfigurasi Environment Variable
Salin `.env.example` menjadi `.env` dan masukkan kredensial Supabase Anda:
```env
EXPO_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...anon-key-anda
```

### 3. Instalasi Dependensi & Menjalankan Aplikasi
```bash
# Masuk ke direktori proyek
cd auth-lanjutan-app

# Install dependencies (jika belum)
npm install

# Jalankan Expo Development Server
npx expo start
```
- Tekan **`w`** untuk menjalankan di Web Browser.
- Atau buka aplikasi **Expo Go** pada smartphone Anda dan scan QR Code di terminal.

---

## 🏆 Checklist Ketercapaian Modul

- [x] **Bab 4 (Backend Supabase & CRUD)**:
  - [x] Koneksi Supabase Client dengan environment variable.
  - [x] CRUD Data Nilai & Jadwal melalui Clean Service Layer.
  - [x] Database Trigger untuk data pengguna dan predikat nilai.
- [x] **Bab 5 (Autentikasi & Sesi Pengguna)**:
  - [x] Registrasi & Login dengan validasi form.
  - [x] Persistent session dengan `AsyncStorage`.
  - [x] Global State Management via Zustand (`useAuthStore`).
- [x] **Bab 6 (Advanced Auth, RBAC & RLS)**:
  - [x] Multi-Role Navigation (Admin / Guru / Siswa).
  - [x] Proteksi Row Level Security (RLS) PostgreSQL anti-recursion.
  - [x] Route Guard `<RequireRole>` dan Layar *Access Denied*.
  - [x] Fitur Admin untuk mengelola role seluruh user secara real-time.
