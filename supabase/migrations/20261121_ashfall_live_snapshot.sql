-- One authoritative heartbeat for the NEW Ashfall VPS, written only by the
-- website server's service-role client. The public website never writes here.
create table if not exists public.ashfall_live_snapshot (
  id text primary key check (id = 'ashfall'),
  player_count integer not null default 0 check (player_count >= 0 and player_count <= 500),
  max_players integer not null default 200 check (max_players >= 1 and max_players <= 500),
  online_players jsonb not null default '[]'::jsonb,
  leaderboards jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ashfall_live_snapshot enable row level security;
-- Intentionally no anon/authenticated policies: reads and writes go through
-- authenticated server-side Next.js endpoints with the Supabase service role.
