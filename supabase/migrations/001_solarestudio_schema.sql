create extension if not exists pgcrypto;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2),
  duration text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  phone text not null,
  service_id uuid references public.services(id) on delete set null,
  preferred_date date,
  preferred_time text,
  status text not null default 'novo' check (status in ('novo', 'confirmado', 'realizado', 'cancelado')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  text text not null,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Josy Leao Solare',
  whatsapp text not null default '5591986302070',
  instagram text not null default 'https://www.instagram.com/josyleaosolare/',
  address text not null default 'Av. Alcindo Cacela, 1474 - Nazare - Belem/PA',
  logo_url text,
  hero_image_url text
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null unique,
  history text,
  last_procedure text,
  notes text,
  sessions_count integer not null default 0,
  bonus_balance integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  start_time text not null,
  end_time text not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.gallery enable row level security;
alter table public.appointments enable row level security;
alter table public.testimonials enable row level security;
alter table public.settings enable row level security;
alter table public.clients enable row level security;
alter table public.time_blocks enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.services to anon, authenticated;
grant select on public.gallery to anon, authenticated;
grant select on public.testimonials to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant insert on public.appointments to anon;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.gallery to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;
grant select, insert, update, delete on public.settings to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.time_blocks to authenticated;

create policy "Public can read active services" on public.services for select using (active = true);
create policy "Public can read active gallery" on public.gallery for select using (active = true);
create policy "Public can read active testimonials" on public.testimonials for select using (active = true);
create policy "Public can read settings" on public.settings for select using (true);
create policy "Public can create appointments" on public.appointments for insert with check (true);

create policy "Authenticated manage services" on public.services for all to authenticated using (true) with check (true);
create policy "Authenticated manage gallery" on public.gallery for all to authenticated using (true) with check (true);
create policy "Authenticated manage appointments" on public.appointments for all to authenticated using (true) with check (true);
create policy "Authenticated manage testimonials" on public.testimonials for all to authenticated using (true) with check (true);
create policy "Authenticated manage settings" on public.settings for all to authenticated using (true) with check (true);
create policy "Authenticated manage clients" on public.clients for all to authenticated using (true) with check (true);
create policy "Authenticated manage time blocks" on public.time_blocks for all to authenticated using (true) with check (true);

insert into public.settings (business_name, whatsapp, instagram, address, logo_url, hero_image_url)
select 'Josy Leao Solare', '5591986302070', 'https://www.instagram.com/josyleaosolare/', 'Av. Alcindo Cacela, 1474 - Nazare - Belem/PA', '/brand/josy-logo-official.webp', '/brand/glow-01.jpg'
where not exists (select 1 from public.settings);

insert into storage.buckets (id, name, public)
values ('josy-media', 'josy-media', true)
on conflict (id) do update set public = true;

create policy "Public reads josy media" on storage.objects
for select using (bucket_id = 'josy-media');

create policy "Authenticated uploads josy media" on storage.objects
for insert to authenticated with check (bucket_id = 'josy-media');

create policy "Authenticated updates josy media" on storage.objects
for update to authenticated using (bucket_id = 'josy-media') with check (bucket_id = 'josy-media');

create policy "Authenticated deletes josy media" on storage.objects
for delete to authenticated using (bucket_id = 'josy-media');
