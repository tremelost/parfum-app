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

drop policy if exists "Allow public read pembelian manual" on public.pembelian_manual;
drop policy if exists "Allow public insert pembelian manual" on public.pembelian_manual;
drop policy if exists "Allow public delete pembelian manual" on public.pembelian_manual;

create policy "Allow public read pembelian manual"
on public.pembelian_manual
for select
to anon
using (true);

create policy "Allow public insert pembelian manual"
on public.pembelian_manual
for insert
to anon
with check (true);

create policy "Allow public delete pembelian manual"
on public.pembelian_manual
for delete
to anon
using (true);
