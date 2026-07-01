-- ============================================================
-- pembelian_manual (purchases)
-- ============================================================
create table if not exists public.pembelian_manual (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  kategori text not null,
  item text not null,
  harga numeric(12, 2) not null default 0,
  qty integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.pembelian_manual enable row level security;

drop policy if exists "Allow authenticated read pembelian manual" on public.pembelian_manual;
drop policy if exists "Allow authenticated insert pembelian manual" on public.pembelian_manual;
drop policy if exists "Allow authenticated update pembelian manual" on public.pembelian_manual;
drop policy if exists "Allow authenticated delete pembelian manual" on public.pembelian_manual;
-- Drop old anon policies (migration cleanup)
drop policy if exists "Allow public read pembelian manual" on public.pembelian_manual;
drop policy if exists "Allow public insert pembelian manual" on public.pembelian_manual;
drop policy if exists "Allow public delete pembelian manual" on public.pembelian_manual;

create policy "Allow authenticated read pembelian manual"
on public.pembelian_manual
for select
to authenticated
using (true);

create policy "Allow authenticated insert pembelian manual"
on public.pembelian_manual
for insert
to authenticated
with check (true);

create policy "Allow authenticated update pembelian manual"
on public.pembelian_manual
for update
to authenticated
using (true)
with check (true);

create policy "Allow authenticated delete pembelian manual"
on public.pembelian_manual
for delete
to authenticated
using (true);

-- ============================================================
-- penjualan_manual (sales)
-- ============================================================
create table if not exists public.penjualan_manual (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  item text not null,
  harga numeric(12, 2) not null default 0,
  qty integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.penjualan_manual enable row level security;

drop policy if exists "Allow authenticated read penjualan manual" on public.penjualan_manual;
drop policy if exists "Allow authenticated insert penjualan manual" on public.penjualan_manual;
drop policy if exists "Allow authenticated update penjualan manual" on public.penjualan_manual;
drop policy if exists "Allow authenticated delete penjualan manual" on public.penjualan_manual;
-- Drop old anon policies (migration cleanup)
drop policy if exists "Allow public read penjualan manual" on public.penjualan_manual;
drop policy if exists "Allow public insert penjualan manual" on public.penjualan_manual;
drop policy if exists "Allow public delete penjualan manual" on public.penjualan_manual;

create policy "Allow authenticated read penjualan manual"
on public.penjualan_manual
for select
to authenticated
using (true);

create policy "Allow authenticated insert penjualan manual"
on public.penjualan_manual
for insert
to authenticated
with check (true);

create policy "Allow authenticated update penjualan manual"
on public.penjualan_manual
for update
to authenticated
using (true)
with check (true);

create policy "Allow authenticated delete penjualan manual"
on public.penjualan_manual
for delete
to authenticated
using (true);
