-- ─────────────────────────────────────────────────────────────────────────────
-- SkipIt — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type app_source_enum as enum (
  'uber_eats',
  'doordash',
  'instacart',
  'roadie',
  'other'
);

create type report_type_enum as enum (
  'delay',
  'order_issue',
  'road_issue',
  'closed',
  'mismatch',
  'safety'
);

create type issue_tag_enum as enum (
  'order_not_ready',
  'order_not_found',
  'store_closed',
  'long_wait',
  'oversized_item',
  'assembled_item',
  'cannot_fit_vehicle',
  'duplicate_drivers',
  'unsafe',
  'dog',
  'dark_area',
  'hard_access'
);

create type report_status_enum as enum (
  'verified',
  'likely',
  'unverified'
);

-- ─── REPORTS TABLE ───────────────────────────────────────────────────────────

create table if not exists reports (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  location_name   text not null,
  lat             float,
  lng             float,
  app_source      app_source_enum not null,
  report_type     report_type_enum not null,
  wait_time       integer,                          -- minutes
  issue_tags      issue_tag_enum[] not null default '{}',
  description     text,
  audio_url       text,
  status          report_status_enum not null default 'unverified',
  expires_at      timestamptz not null              -- created_at + 8 hours
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Fast lookup of non-expired reports (primary query pattern)
create index idx_reports_expires_at
  on reports (expires_at desc);

-- Filter by type
create index idx_reports_report_type
  on reports (report_type);

-- Geo queries (when map view is added later)
create index idx_reports_lat_lng
  on reports (lat, lng)
  where lat is not null and lng is not null;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- Anonymous users can read all active reports and insert new ones.
-- No delete/update allowed from client.

alter table reports enable row level security;

-- Anyone can read active (non-expired) reports
create policy "Public read active reports"
  on reports
  for select
  using (expires_at > now());

-- Anyone can insert a report (anonymous MVP, no auth required)
create policy "Public insert reports"
  on reports
  for insert
  with check (true);

-- ─── AUTO-EXPIRE CLEANUP (optional cron) ─────────────────────────────────────
-- Supabase supports pg_cron if you want to auto-delete old rows.
-- Uncomment once pg_cron extension is enabled in your project:
--
-- select cron.schedule(
--   'delete-expired-reports',
--   '0 * * * *',              -- every hour
--   $$
--     delete from reports where expires_at < now() - interval '1 hour';
--   $$
-- );

-- ─── SAMPLE DATA (optional — delete before prod) ──────────────────────────────

insert into reports (
  location_name, lat, lng, app_source, report_type,
  wait_time, issue_tags, description, status, expires_at
) values
(
  'Chipotle Kapolei',
  21.3355, -158.0536,
  'doordash', 'delay',
  25,
  array['order_not_ready', 'long_wait']::issue_tag_enum[],
  'Kitchen way behind, 3 other drivers waiting.',
  'likely',
  now() + interval '6 hours'
),
(
  'Starbucks Ala Moana',
  21.2876, -157.8432,
  'uber_eats', 'closed',
  null,
  array['store_closed']::issue_tag_enum[],
  'App shows open but doors are locked.',
  'verified',Í
  now() + interval '3 hours'
),
(
  'McDonald''s Pearl City',
  21.3972, -157.9726,
  'doordash', 'order_issue',
  15,
  array['duplicate_drivers', 'order_not_found']::issue_tag_enum[],
  null,
  'unverified',
  now() + interval '7 hours'
),
(
  'Costco Iwilei',
  21.3150, -157.8721,
  'instacart', 'mismatch',
  null,
  array['oversized_item', 'cannot_fit_vehicle']::issue_tag_enum[],
  'Water pallet order — doesn''t fit standard sedan.',
  'likely',
  now() + interval '5 hours'
),
(
  'Domino''s Kaimuki',
  21.2834, -157.7934,
  'uber_eats', 'safety',
  null,
  array['dark_area', 'hard_access']::issue_tag_enum[],
  'No lighting in back alley, gate code changed.',
  'unverified',
  now() + interval '2 hours'
);
