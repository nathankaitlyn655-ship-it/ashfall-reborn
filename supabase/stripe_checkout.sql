-- Run in Supabase SQL Editor BEFORE enabling Stripe webhook.
-- This function atomically records a paid checkout and grants each kit once.
create table if not exists public.ashfall_stripe_fulfillments (
  session_id text primary key,
  user_id uuid not null,
  steam_id text not null,
  amount_cents integer not null check (amount_cents > 0),
  fulfilled_at timestamptz not null default now()
);
alter table public.ashfall_stripe_fulfillments enable row level security;
revoke all on public.ashfall_stripe_fulfillments from anon, authenticated;
create or replace function public.fulfill_ashfall_stripe_checkout(
  p_session_id text, p_steam_id text, p_user_id uuid, p_amount_cents integer, p_kits jsonb
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  k text; days_count integer; total integer := 0;
  start_time timestamptz; latest_expiry timestamptz;
begin
  if p_session_id !~ '^cs_' or p_steam_id !~ '^7656119[0-9]{10}$' or p_amount_cents <= 0
    or jsonb_typeof(p_kits) <> 'array' or jsonb_array_length(p_kits) not between 1 and 10 then
    raise exception 'Invalid checkout';
  end if;
  for k in select jsonb_array_elements_text(p_kits) loop
    total := total + case k when 'airdrop' then 799 when 'vip1' then 1000 when 'vip2' then 1500 when 'vip3' then 2000 when 'builder' then 999 else 0 end;
    if k not in ('airdrop','vip1','vip2','vip3','builder') then raise exception 'Invalid kit'; end if;
  end loop;
  if total <> p_amount_cents then raise exception 'Price mismatch'; end if;
  -- Idempotency: concurrent Stripe retries cannot grant the same checkout twice.
  insert into public.ashfall_stripe_fulfillments(session_id,user_id,steam_id,amount_cents)
  values(p_session_id,p_user_id,p_steam_id,p_amount_cents)
  on conflict (session_id) do nothing;
  if not found then return false; end if;
  insert into public.ashfall_players(steam_id) values(p_steam_id) on conflict (steam_id) do nothing;
  -- Serialize renewals for this Steam ID, including concurrent distinct checkout sessions.
  perform 1 from public.ashfall_players where steam_id=p_steam_id for update;
  for k in select jsonb_array_elements_text(p_kits) loop
    days_count := case when k='airdrop' then 14 else 30 end;
    if k='builder' then k := 'vipbuilder'; end if;
    select max(expires_at) into latest_expiry from public.ashfall_subscriptions
      where steam_id=p_steam_id and kit_id=k and status='active' and expires_at > now();
    start_time := greatest(now(), coalesce(latest_expiry, now()));
    insert into public.ashfall_subscriptions(steam_id,kit_id,status,starts_at,expires_at,payment_reference)
      values(p_steam_id,k,'active',start_time,start_time + make_interval(days => days_count),p_session_id);
  end loop;
  return true;
end; $$;
revoke all on function public.fulfill_ashfall_stripe_checkout(text,text,uuid,integer,jsonb) from public, anon, authenticated;
grant execute on function public.fulfill_ashfall_stripe_checkout(text,text,uuid,integer,jsonb) to service_role;
