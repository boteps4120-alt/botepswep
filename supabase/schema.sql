create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  full_name text,
  birth_date date,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  phone text,
  address text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  poomsae text,
  instructor text,
  description text,
  difficulty text,
  duration_seconds integer default 0,
  thumbnail_url text,
  gumlet_video_id text,
  is_premium boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.course_chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  starts_at_seconds integer not null default 0,
  cue text,
  sort_order integer not null default 0
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive', 'active', 'past_due', 'canceled', 'expired')),
  provider text check (provider in ('toss', 'stripe', 'manual')),
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.watch_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  last_position_seconds integer not null default 0,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, full_name, birth_date, gender, phone, address)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'address', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(public.profiles.display_name, excluded.display_name),
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      birth_date = coalesce(public.profiles.birth_date, excluded.birth_date),
      gender = coalesce(public.profiles.gender, excluded.gender),
      phone = coalesce(public.profiles.phone, excluded.phone),
      address = coalesce(public.profiles.address, excluded.address),
      updated_at = now();

  insert into public.subscriptions (user_id, status, provider)
  values (new.id, 'inactive', 'manual')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_chapters enable row level security;
alter table public.subscriptions enable row level security;
alter table public.watch_progress enable row level security;
alter table public.bookmarks enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
drop policy if exists "Profiles are readable by owner or admin" on public.profiles;
create policy "Profiles are readable by owner or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Profiles are editable by admin" on public.profiles;
create policy "Profiles are editable by admin" on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Courses are readable by everyone" on public.courses;
create policy "Courses are readable by everyone" on public.courses
  for select using (true);

drop policy if exists "Courses are manageable by admin" on public.courses;
create policy "Courses are manageable by admin" on public.courses
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Course chapters are readable by everyone" on public.course_chapters;
create policy "Course chapters are readable by everyone" on public.course_chapters
  for select using (true);

drop policy if exists "Course chapters are manageable by admin" on public.course_chapters;
create policy "Course chapters are manageable by admin" on public.course_chapters
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Subscriptions are readable by owner" on public.subscriptions;
drop policy if exists "Subscriptions are readable by owner or admin" on public.subscriptions;
create policy "Subscriptions are readable by owner or admin" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Subscriptions are manageable by admin" on public.subscriptions;
create policy "Subscriptions are manageable by admin" on public.subscriptions
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Watch progress is readable by owner" on public.watch_progress;
drop policy if exists "Watch progress is readable by owner or admin" on public.watch_progress;
create policy "Watch progress is readable by owner or admin" on public.watch_progress
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Watch progress is writable by owner" on public.watch_progress;
create policy "Watch progress is writable by owner" on public.watch_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "Watch progress is updatable by owner" on public.watch_progress;
create policy "Watch progress is updatable by owner" on public.watch_progress
  for update using (auth.uid() = user_id);

drop policy if exists "Bookmarks are readable by owner" on public.bookmarks;
drop policy if exists "Bookmarks are readable by owner or admin" on public.bookmarks;
create policy "Bookmarks are readable by owner or admin" on public.bookmarks
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Bookmarks are writable by owner" on public.bookmarks;
create policy "Bookmarks are writable by owner" on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "Bookmarks are removable by owner" on public.bookmarks;
create policy "Bookmarks are removable by owner" on public.bookmarks
  for delete using (auth.uid() = user_id);
