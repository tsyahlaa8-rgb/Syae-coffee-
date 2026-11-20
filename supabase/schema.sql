-- ============================================================
-- Syaé Coffee — Skema Database Supabase (PostgreSQL)
-- Jalankan file ini di Supabase SQL Editor saat siap menyambungkan.
-- ============================================================

-- 1. Tabel Profil Pengguna (Pembeli & Pemilik)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('pembeli', 'pemilik')) default 'pembeli',
  phone text,
  created_at timestamptz default now()
);

-- 2. Tabel Menu Kopi
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  category text not null check (category in ('Signature', 'Kopi Susu', 'Kopi Hitam', 'Manual Brew')),
  description text not null,
  price integer not null check (price >= 0),
  image_url text not null,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  serving_options text[] not null default array['Dingin', 'Panas'],
  created_at timestamptz default now()
);

-- 3. Tabel Pesanan
create table if not exists public.orders (
  id text primary key,
  order_code text unique not null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  order_type text not null check (order_type in ('Ambil di Kasir', 'Makan di Tempat')),
  table_number text,
  payment_method text not null check (payment_method in ('QRIS', 'Tunai di Kasir')),
  status text not null check (status in ('Menunggu', 'Diproses', 'Siap Diambil', 'Selesai')) default 'Menunggu',
  subtotal integer not null,
  total_amount integer not null,
  notes text,
  created_at timestamptz default now()
);

-- 4. Tabel Detail Item Pesanan
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  menu_item_id text not null references public.menu_items(id),
  menu_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  temperature text not null check (temperature in ('Dingin', 'Panas')),
  sugar_level text not null check (sugar_level in ('Normal', 'Sedikit Gula', 'Tanpa Gula')),
  item_note text
);

-- Aktifkan Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
