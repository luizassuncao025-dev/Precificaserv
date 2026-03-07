create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  legal_name text not null default '',
  document_number text not null default '',
  contact_phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clinic_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  worked_days numeric not null default 22,
  clinical_hours_per_day numeric not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  monthly_value numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  notes text,
  clinical_hours numeric not null default 0,
  tax_rate numeric not null default 0,
  profit_margin numeric not null default 0,
  direct_cost numeric not null default 0,
  operational_cost numeric not null default 0,
  subtotal_cost numeric not null default 0,
  suggested_price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procedure_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  name text not null,
  quantity numeric not null default 0,
  unit_cost numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.last_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_name text not null,
  unit_measure text not null default 'un',
  quantity_total numeric not null default 0,
  total_value numeric not null default 0,
  unit_cost numeric not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, material_name)
);

alter table public.last_purchases add column if not exists quantity_total numeric not null default 0;
alter table public.last_purchases add column if not exists total_value numeric not null default 0;
alter table public.last_purchases add column if not exists unit_measure text not null default 'un';

create table if not exists public.pricing_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  procedure_name text not null,
  suggested_price numeric not null default 0,
  subtotal_cost numeric not null default 0,
  tax_rate numeric not null default 0,
  profit_margin numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.clinic_settings enable row level security;
alter table public.fixed_costs enable row level security;
alter table public.procedures enable row level security;
alter table public.procedure_items enable row level security;
alter table public.last_purchases enable row level security;
alter table public.pricing_history enable row level security;

drop policy if exists "user_profiles_owner" on public.user_profiles;
drop policy if exists "clinic_settings_owner" on public.clinic_settings;
drop policy if exists "fixed_costs_owner" on public.fixed_costs;
drop policy if exists "procedures_owner" on public.procedures;
drop policy if exists "procedure_items_owner" on public.procedure_items;
drop policy if exists "last_purchases_owner" on public.last_purchases;
drop policy if exists "pricing_history_owner" on public.pricing_history;

create policy "user_profiles_owner" on public.user_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "clinic_settings_owner" on public.clinic_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "fixed_costs_owner" on public.fixed_costs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "procedures_owner" on public.procedures for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "procedure_items_owner" on public.procedure_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "last_purchases_owner" on public.last_purchases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pricing_history_owner" on public.pricing_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profiles_updated_at on public.user_profiles;
drop trigger if exists clinic_settings_updated_at on public.clinic_settings;
drop trigger if exists procedures_updated_at on public.procedures;

create trigger user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.handle_updated_at();

create trigger clinic_settings_updated_at
before update on public.clinic_settings
for each row execute function public.handle_updated_at();

create trigger procedures_updated_at
before update on public.procedures
for each row execute function public.handle_updated_at();
