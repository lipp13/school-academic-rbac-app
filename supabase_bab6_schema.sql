-- ==============================================================================
-- SKRIP SQL SUPABASE: BAB 6 — AUTHENTICATION LANJUTAN & ROLE-BASED ACCESS CONTROL
-- Modul: Sistem Informasi Akademik Sekolah (Admin, Guru, Siswa)
-- Solusi: SECURITY DEFINER Helper Functions (Mencegah Infinite Recursion RLS)
-- ==============================================================================

-- 1. TABEL PROFILES (Pengguna & Role)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text not null default 'siswa' check (role in ('admin', 'guru', 'siswa')),
  avatar_url text,
  bio text,
  phone text,
  nis_nip text,
  class_name text default 'XII RPL 1',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pastikan kolom lengkap jika tabel sudah ada sebelumnya
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    alter table public.profiles add column role text not null default 'siswa' check (role in ('admin', 'guru', 'siswa'));
  end if;
  
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'nis_nip'
  ) then
    alter table public.profiles add column nis_nip text;
  end if;

  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'class_name'
  ) then
    alter table public.profiles add column class_name text default 'XII RPL 1';
  end if;
end $$;


-- 2. TRIGGER OTOMATIS: auth.users -> public.profiles
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url, bio, class_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'siswa'),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    coalesce(new.raw_user_meta_data->>'bio', 'Pengguna Aplikasi Sekolah'),
    coalesce(new.raw_user_meta_data->>'class_name', 'XII RPL 1')
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    role = coalesce(excluded.role, profiles.role);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. TABEL GRADES (Nilai Siswa)
-- ------------------------------------------------------------------------------
create table if not exists public.grades (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_name text,
  teacher_id uuid references public.profiles(id) on delete set null,
  teacher_name text,
  subject text not null,
  class_name text not null default 'XII RPL 1',
  tugas numeric(5,2) default 0,
  uts numeric(5,2) default 0,
  uas numeric(5,2) default 0,
  nilai_akhir numeric(5,2) generated always as (round((tugas * 0.3) + (uts * 0.3) + (uas * 0.4), 2)) stored,
  predikat text,
  catatan text,
  semester text default 'Ganjil 2026/2027',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function public.calculate_grade_predicate()
returns trigger as $$
declare
  calculated_score numeric;
begin
  calculated_score := round((new.tugas * 0.3) + (new.uts * 0.3) + (new.uas * 0.4), 2);
  
  if calculated_score >= 88 then
    new.predikat := 'A (Sangat Baik)';
  elsif calculated_score >= 78 then
    new.predikat := 'B (Baik)';
  elsif calculated_score >= 68 then
    new.predikat := 'C (Cukup)';
  else
    new.predikat := 'D (Perlu Perbaikan)';
  end if;

  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_grade_before_save on public.grades;
create trigger on_grade_before_save
  before insert or update on public.grades
  for each row execute procedure public.calculate_grade_predicate();


-- 4. TABEL SCHEDULES (Jadwal Pelajaran)
-- ------------------------------------------------------------------------------
create table if not exists public.schedules (
  id uuid default gen_random_uuid() primary key,
  day text not null check (day in ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')),
  time_start text not null,
  time_end text not null,
  subject text not null,
  class_name text not null default 'XII RPL 1',
  teacher_name text not null,
  room text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==============================================================================
-- 5. SECURITY DEFINER HELPER FUNCTIONS (ANTI INFINITE RECURSION)
-- Fungsi ini berjalan dengan hak akses penuh PostgreSQL sehingga membaca role
-- tanpa memicu RLS loop pada tabel profiles.
-- ==============================================================================
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

create or replace function public.is_teacher_or_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('guru', 'admin')
  );
$$ language sql stable security definer set search_path = public;


-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES YANG BERSIH & AMAN
-- ==============================================================================

-- A. AKTIFKAN RLS PADA SELURUH TABEL
alter table public.profiles enable row level security;
alter table public.grades enable row level security;
alter table public.schedules enable row level security;


-- B. BERSIHKAN POLICY LAMA PADA PROFILES
drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

-- 1. Semua pengguna terautentikasi dapat membaca data profil
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (true);

-- 2. Pengguna bisa insert profil sendiri
create policy "profiles_insert"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 3. Pengguna bisa update profilnya sendiri
create policy "profiles_update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Admin memiliki akses penuh (menggunakan fungsi is_admin() bebas recursion)
create policy "profiles_admin_manage"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- C. BERSIHKAN & BUAT ULANG POLICY PADA GRADES (NILAI)
drop policy if exists "grades_student_select_own" on public.grades;
drop policy if exists "grades_select_policy" on public.grades;
drop policy if exists "grades_guru_insert" on public.grades;
drop policy if exists "grades_insert_policy" on public.grades;
drop policy if exists "grades_guru_update" on public.grades;
drop policy if exists "grades_update_policy" on public.grades;
drop policy if exists "grades_teacher_admin_delete" on public.grades;
drop policy if exists "grades_delete_policy" on public.grades;

-- 1. SELECT: Siswa membaca nilai miliknya, Guru & Admin membaca semua
create policy "grades_select"
  on public.grades for select
  to authenticated
  using (
    auth.uid() = student_id
    or public.is_teacher_or_admin()
  );

-- 2. INSERT: Guru & Admin
create policy "grades_insert"
  on public.grades for insert
  to authenticated
  with check (public.is_teacher_or_admin());

-- 3. UPDATE: Guru & Admin
create policy "grades_update"
  on public.grades for update
  to authenticated
  using (public.is_teacher_or_admin())
  with check (public.is_teacher_or_admin());

-- 4. DELETE: Guru & Admin
create policy "grades_delete"
  on public.grades for delete
  to authenticated
  using (public.is_teacher_or_admin());


-- D. BERSIHKAN & BUAT ULANG POLICY PADA SCHEDULES (JADWAL)
drop policy if exists "schedules_select_all" on public.schedules;
drop policy if exists "schedules_manage_guru_admin" on public.schedules;

-- 1. SELECT: Semua pengguna
create policy "schedules_select"
  on public.schedules for select
  to authenticated
  using (true);

-- 2. ALL: Guru & Admin
create policy "schedules_manage"
  on public.schedules for all
  to authenticated
  using (public.is_teacher_or_admin())
  with check (public.is_teacher_or_admin());


-- ==============================================================================
-- 7. DATA CONTOH (SEED DATA) JADWAL PELAJARAN
-- ==============================================================================
insert into public.schedules (day, time_start, time_end, subject, class_name, teacher_name, room)
values
  ('Senin', '07:30', '09:00', 'Pemrograman Mobile (React Native)', 'XII RPL 1', 'Pak Budi Hartono, S.Kom', 'Lab Komputer 3'),
  ('Senin', '09:15', '11:30', 'Basis Data & SQL Supabase', 'XII RPL 1', 'Ibu Siti Rahma, M.Kom', 'Lab Komputer 1'),
  ('Selasa', '07:30', '09:45', 'Clean Architecture & Best Practices', 'XII RPL 1', 'Pak Budi Hartono, S.Kom', 'Lab Komputer 3'),
  ('Selasa', '10:00', '11:30', 'Bahasa Inggris Teknologi', 'XII RPL 1', 'Ibu Maya Anggraini, S.Pd', 'Ruang 12'),
  ('Rabu', '07:30', '09:00', 'State Management & Zustand', 'XII RPL 1', 'Pak Alif Alfathar, S.T', 'Lab Komputer 2'),
  ('Rabu', '09:15', '11:30', 'UI/UX Design & Prototyping', 'XII RPL 1', 'Ibu Dian Safitri, M.Ds', 'Lab Multimedia'),
  ('Kamis', '07:30', '09:45', 'Keamanan Aplikasi Mobile & RLS', 'XII RPL 1', 'Pak Alif Alfathar, S.T', 'Lab Komputer 2'),
  ('Kamis', '10:00', '11:30', 'Kewirausahaan & Produk Digital', 'XII RPL 1', 'Pak Hendra Wijaya, M.M', 'Ruang 14'),
  ('Jumat', '07:30', '09:00', 'Code Review & Testing Proyek', 'XII RPL 1', 'Tim Pengajar RPL', 'Lab Komputer 3'),
  ('Jumat', '09:15', '10:45', 'Bimbingan Karir & Portfolio', 'XII RPL 1', 'Ibu Rina Wulandari, S.Psi', 'Ruang BK')
on conflict do nothing;
