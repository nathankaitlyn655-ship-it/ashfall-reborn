-- The VIP subscription entitlement is server-managed only.
-- Never write VIP status from a public client or from the success redirect.
create table if not exists public.ashfall_vip_memberships (
  stripe_subscription_id text primary key,
  user_id uuid not null,
  steam_id text not null check (steam_id ~ '^7656119[0-9]{10}$'),
  stripe_customer_id text not null,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists ashfall_vip_steam_status_idx
  on public.ashfall_vip_memberships (steam_id, status);
create index if not exists ashfall_vip_user_status_idx
  on public.ashfall_vip_memberships (user_id, status);
alter table public.ashfall_vip_memberships enable row level security;
-- No client policies: access is via server-side service-role API after auth.
