-- Review existing player_profiles schema before running. Requires unique steam_id_public.
-- Existing player_profiles must permit inserts with these columns (or have defaults).
CREATE UNIQUE INDEX IF NOT EXISTS ashfall_player_profiles_steam_unique ON public.player_profiles (steam_id_public);
CREATE OR REPLACE FUNCTION public.ashfall_add_stats(p_steam_id text, p_name text, p_kills integer, p_deaths integer, p_minutes integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.player_profiles (steam_id_public, username, display_name, kills, deaths, raids, playtime_minutes)
  VALUES (p_steam_id, p_name, p_name, p_kills, p_deaths, 0, p_minutes)
  ON CONFLICT (steam_id_public) DO UPDATE SET
    kills = COALESCE(player_profiles.kills,0) + EXCLUDED.kills,
    deaths = COALESCE(player_profiles.deaths,0) + EXCLUDED.deaths,
    playtime_minutes = COALESCE(player_profiles.playtime_minutes,0) + EXCLUDED.playtime_minutes;
END; $$;
REVOKE ALL ON FUNCTION public.ashfall_add_stats(text,text,integer,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ashfall_add_stats(text,text,integer,integer,integer) TO service_role;
