-- THE ARENA — Supabase schema
-- Run this in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every CREATE uses IF NOT EXISTS.

-- Each row = one team a user follows.
create table if not exists public.followed_teams (
  user_id     uuid     references auth.users(id) on delete cascade,
  sport       text     not null check (sport in ('football','cricket')),
  team_id     integer  not null,
  team_name   text     not null,
  created_at  timestamptz default now(),
  primary key (user_id, sport, team_id)
);

-- Per-user preferences (theme, default sport, etc).
create table if not exists public.user_prefs (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  default_sport  text default 'football',
  theme          text default 'dark',
  updated_at     timestamptz default now()
);

-- Row-Level Security: a user can only see/modify their own rows.
alter table public.followed_teams enable row level security;
alter table public.user_prefs     enable row level security;

drop policy if exists "own follows read"   on public.followed_teams;
drop policy if exists "own follows write"  on public.followed_teams;
drop policy if exists "own prefs read"     on public.user_prefs;
drop policy if exists "own prefs write"    on public.user_prefs;

create policy "own follows read"  on public.followed_teams
  for select using (auth.uid() = user_id);
create policy "own follows write" on public.followed_teams
  for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own prefs read"    on public.user_prefs
  for select using (auth.uid() = user_id);
create policy "own prefs write"   on public.user_prefs
  for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
