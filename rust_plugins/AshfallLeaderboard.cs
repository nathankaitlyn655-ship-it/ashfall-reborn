using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Plugins;
using Oxide.Game.Rust.Cui;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("AshfallLeaderboard", "ASHFALL REBORN", "1.5.0")]
    [Description("Persistent player/clan PvP and gathering statistics, branded leaderboard UI, and automatic wipe-prize chat standings.")]
    public class AshfallLeaderboard : RustPlugin
    {
        private const string Ui = "Ashfall.Leaderboard.V1";
        private const string UiTabs = Ui + ".Tabs";
        private const string UiContent = Ui + ".Content";
        private const string ChatIcon = "76561199123965805";
        private const string Accent = "0.89 0.36 0.15 1";
        private const string White = "0.98 0.97 0.94 1";
        private const string Muted = "0.67 0.72 0.73 1";
        private const string Raised = "0.126 0.153 0.163 1";
        private const string DataFile = "AshfallLeaderboard";

        [PluginReference] private Plugin AshfallClans;
        private Settings settings;
        private StoredData data;
        private readonly Dictionary<string, float> recentKills = new Dictionary<string, float>();
        private readonly HashSet<ulong> openWindows = new HashSet<ulong>();
        private readonly Dictionary<ulong, string> clanMembers = new Dictionary<ulong, string>();
        private readonly HashSet<string> knownClanTags = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        private float lastClanRosterRead = -1000f;
        private bool warnedClanRoster;

        // A read-only view of AshfallClans' own oxide/data/AshfallClans.json.
        // This works even when a different loaded clan version does not expose
        // its API_GetClanTag hook to other plugins.
        private class ClanRosterData
        {
            public Dictionary<string, ClanRosterEntry> Clans = new Dictionary<string, ClanRosterEntry>();
        }

        private class ClanRosterEntry
        {
            public string Tag;
            public List<ulong> Members = new List<ulong>();
        }

        private class Settings
        {
            [JsonProperty("Minutes before the same attacker-victim kill can earn another point")]
            public float RepeatKillCooldownMinutes = 10f;

            [JsonProperty("Ignore kills against players in the same Ashfall clan")]
            public bool IgnoreSameClanKills = true;

            [JsonProperty("How many leaders to show per category (maximum 8)")]
            public int VisibleTop = 8;

            [JsonProperty("Minutes between automatic saves")]
            public float SaveEveryMinutes = 5f;

            [JsonProperty("Enable automatic top-three leaderboard chat messages")]
            public bool EnableChatAnnouncements = true;

            [JsonProperty("Minutes between leaderboard chat messages")]
            public float AnnounceEveryMinutes = 15f;

            [JsonProperty("USD prize for the #1 PvP kills player at wipe")]
            public int PvPKillsPrizeUsd = 15;

            [JsonProperty("USD prize for the #1 sulfur miner at wipe")]
            public int SulfurPrizeUsd = 10;

            [JsonProperty("USD total prize for the #1 clan at wipe (shared by entire clan, not per member)")]
            public int ClanPrizeUsdTotal = 20;
        }

        private class PlayerStat
        {
            public string Name = "Unknown";
            public int Kills;
            public int Deaths;
            public int CurrentStreak;
            public int BestStreak;
            public long Sulfur;
            public long Stone;
            public long Metal;
        }

        private class ClanStat
        {
            public int PvPKills;
            public long Sulfur;
        }

        private class StoredData
        {
            public Dictionary<ulong, PlayerStat> Players = new Dictionary<ulong, PlayerStat>();
            public Dictionary<string, ClanStat> Clans = new Dictionary<string, ClanStat>(StringComparer.OrdinalIgnoreCase);
        }

        // Audit records remain separate from wipe statistics and are not reset.
        private class PrizeEntry
        {
            public int Rank;
            public string SteamId;
            public string Name;
            public long Score;
            public long TieBreaker;
            public string[] ClanMemberSteamIds;
        }

        private class WipePrizeArchive
        {
            public string RecordedUtc;
            public string Reason;
            public int PvPKillsPrizeUsd;
            public int SulfurPrizeUsd;
            public int ClanPrizeUsdTotal;
            public List<PrizeEntry> PvPKills;
            public List<PrizeEntry> SulfurMined;
            public List<PrizeEntry> ClansByPvPKills;
        }

        protected override void LoadDefaultConfig()
        {
            settings = new Settings();
            SaveConfig();
        }

        protected override void LoadConfig()
        {
            base.LoadConfig();
            try { settings = Config.ReadObject<Settings>() ?? new Settings(); }
            catch (Exception ex) { PrintWarning("Invalid config; using defaults: " + ex.Message); settings = new Settings(); }
            settings.RepeatKillCooldownMinutes = Mathf.Clamp(settings.RepeatKillCooldownMinutes, 0f, 1440f);
            settings.SaveEveryMinutes = Mathf.Clamp(settings.SaveEveryMinutes, 1f, 60f);
            settings.AnnounceEveryMinutes = Mathf.Clamp(settings.AnnounceEveryMinutes, 1f, 180f);
            settings.PvPKillsPrizeUsd = Mathf.Clamp(settings.PvPKillsPrizeUsd, 0, 100000);
            settings.SulfurPrizeUsd = Mathf.Clamp(settings.SulfurPrizeUsd, 0, 100000);
            settings.ClanPrizeUsdTotal = Mathf.Clamp(settings.ClanPrizeUsdTotal, 0, 100000);
            settings.VisibleTop = Mathf.Clamp(settings.VisibleTop, 3, 8);
            SaveConfig();
        }

        protected override void SaveConfig() { Config.WriteObject(settings, true); }

        private void Init()
        {
            try { data = Interface.Oxide.DataFileSystem.ReadObject<StoredData>(DataFile) ?? new StoredData(); }
            catch (Exception ex)
            {
                PrintError("Could not read leaderboard data. Existing data was NOT overwritten: " + ex.Message);
                data = null;
                return;
            }
            if (data.Players == null) data.Players = new Dictionary<ulong, PlayerStat>();
            // JSON deserialization does not preserve the dictionary's case-insensitive comparer.
            if (data.Clans == null) data.Clans = new Dictionary<string, ClanStat>(StringComparer.OrdinalIgnoreCase);
            else data.Clans = new Dictionary<string, ClanStat>(data.Clans, StringComparer.OrdinalIgnoreCase);
            timer.Every(settings.SaveEveryMinutes * 60f, SaveData);
            if (settings.EnableChatAnnouncements)
                timer.Every(settings.AnnounceEveryMinutes * 60f, BroadcastLeaderboard);
        }

        private void SaveData()
        {
            if (data != null) Interface.Oxide.DataFileSystem.WriteObject(DataFile, data);
        }

        private void OnServerSave() { SaveData(); }

        private void Unload()
        {
            SaveData();
            foreach (BasePlayer player in BasePlayer.activePlayerList) CuiHelper.DestroyUi(player, Ui);
            openWindows.Clear();
        }

        private void OnPlayerConnected(BasePlayer player)
        {
            if (IsRealPlayer(player) && data != null) GetStat(player);
        }

        private static bool IsRealPlayer(BasePlayer player)
        {
            return player != null && !player.IsNpc && player.userID >= 76561197960265728UL;
        }

        private PlayerStat GetStat(BasePlayer player)
        {
            PlayerStat result;
            if (!data.Players.TryGetValue(player.userID, out result) || result == null)
            {
                result = new PlayerStat();
                data.Players[player.userID] = result;
            }
            result.Name = Clean(player.displayName, 22);
            return result;
        }

        private string ClanTag(BasePlayer player)
        {
            if (player == null) return null;
            if (AshfallClans != null)
            {
                try
                {
                    string tag = AshfallClans.Call("API_GetClanTag", player.userID) as string;
                    if (!string.IsNullOrWhiteSpace(tag)) return Clean(tag, 16);
                }
                catch (Exception ex)
                {
                    if (!warnedClanRoster)
                    {
                        PrintWarning("AshfallClans API unavailable; trying saved clan roster: " + ex.Message);
                        warnedClanRoster = true;
                    }
                }
            }
            RefreshClanRoster(false);
            string fallback;
            return clanMembers.TryGetValue(player.userID, out fallback) ? Clean(fallback, 16) : null;
        }

        private void RefreshClanRoster(bool force)
        {
            float now = Time.realtimeSinceStartup;
            if (!force && now - lastClanRosterRead < 15f) return;
            lastClanRosterRead = now;
            try
            {
                ClanRosterData roster = Interface.Oxide.DataFileSystem.ReadObject<ClanRosterData>("AshfallClans");
                if (roster == null || roster.Clans == null) return;
                clanMembers.Clear();
                knownClanTags.Clear();
                foreach (var kv in roster.Clans)
                {
                    if (kv.Value == null) continue;
                    string tag = string.IsNullOrWhiteSpace(kv.Value.Tag) ? kv.Key : kv.Value.Tag;
                    if (string.IsNullOrWhiteSpace(tag)) continue;
                    knownClanTags.Add(tag);
                    if (kv.Value.Members == null) continue;
                    foreach (ulong id in kv.Value.Members) clanMembers[id] = tag;
                }
            }
            catch (Exception ex)
            {
                if (warnedClanRoster) return;
                PrintWarning("Could not read AshfallClans data (existing leaderboard data left intact): " + ex.Message);
                warnedClanRoster = true;
            }
        }

        private void OnAshfallClanChanged() { RefreshClanRoster(true); }

        [ConsoleCommand("ashfall.lb.clans")]
        private void ClanDiagnostic(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null && !arg.IsAdmin) return;
            RefreshClanRoster(true);
            arg.ReplyWith("ASHFALL leaderboard clan link: plugin " +
                (AshfallClans == null ? "not found" : "loaded") +
                "; known clan tags=" + knownClanTags.Count +
                "; mapped clan members=" + clanMembers.Count +
                "; clan kill records=" + (data == null ? 0 : data.Clans.Count));
        }

        private ClanStat GetClanStat(string tag)
        {
            ClanStat stat;
            if (!data.Clans.TryGetValue(tag, out stat) || stat == null)
            {
                stat = new ClanStat();
                data.Clans[tag] = stat;
            }
            return stat;
        }

        private void OnPlayerDeath(BasePlayer victim, HitInfo hit)
        {
            if (data == null || !IsRealPlayer(victim)) return;

            PlayerStat victimStat = GetStat(victim);
            victimStat.Deaths++;
            victimStat.CurrentStreak = 0;

            BasePlayer attacker = hit == null ? null : hit.InitiatorPlayer;
            if (!IsRealPlayer(attacker) || attacker.userID == victim.userID) return;

            string attackerClan = ClanTag(attacker);
            string victimClan = ClanTag(victim);
            if (settings.IgnoreSameClanKills && attackerClan != null && victimClan != null &&
                string.Equals(attackerClan, victimClan, StringComparison.OrdinalIgnoreCase)) return;

            string pair = attacker.userID + ":" + victim.userID;
            float now = Time.realtimeSinceStartup;
            float last;
            if (recentKills.TryGetValue(pair, out last) && now - last < settings.RepeatKillCooldownMinutes * 60f) return;
            recentKills[pair] = now;

            PlayerStat attackerStat = GetStat(attacker);
            attackerStat.Kills++;
            attackerStat.CurrentStreak++;
            attackerStat.BestStreak = Math.Max(attackerStat.BestStreak, attackerStat.CurrentStreak);
            if (attackerClan != null) GetClanStat(attackerClan).PvPKills++;
        }

        // Post-gather hooks: measure final items after other gathering modifiers run.
        private void OnDispenserGathered(ResourceDispenser dispenser, BasePlayer player, Item item) { TrackResources(player, item); }
        private void OnDispenserBonusReceived(ResourceDispenser dispenser, BasePlayer player, Item item) { TrackResources(player, item); }
        private void OnCollectiblePickedup(CollectibleEntity entity, BasePlayer player, Item item) { TrackResources(player, item); }

        private void TrackResources(BasePlayer player, Item item)
        {
            if (data == null || !IsRealPlayer(player) || item == null || item.info == null || item.amount <= 0) return;
            string type = item.info.shortname;
            if (type != "sulfur.ore" && type != "stones" && type != "metal.ore") return;
            PlayerStat stat = GetStat(player);
            if (type == "sulfur.ore")
            {
                stat.Sulfur += item.amount;
                string clan = ClanTag(player);
                if (clan != null) GetClanStat(clan).Sulfur += item.amount;
            }
            else if (type == "stones") stat.Stone += item.amount;
            else stat.Metal += item.amount;
        }

        // Three short messages every 15 minutes (configurable), sent with the
        // server's Steam chat icon. This only ANNOUNCES prizes; it never pays out
        // money, issues items, or changes stats. Current scores are from this
        // wipe's leaderboard data, so reset/archive them after each wipe.
        private string[] BuildChatStandings()
        {
            string kills = Podium(data.Players
                .Where(x => x.Value != null && x.Value.Kills > 0)
                .OrderByDescending(x => x.Value.Kills)
                .ThenByDescending(x => x.Value.BestStreak)
                .ThenBy(x => x.Key)
                .Take(3)
                .Select(x => Clean(x.Value.Name, 18) + " (" + x.Value.Kills + ")"));

            string sulfur = Podium(data.Players
                .Where(x => x.Value != null && x.Value.Sulfur > 0)
                .OrderByDescending(x => x.Value.Sulfur)
                .ThenByDescending(x => x.Value.Kills)
                .ThenBy(x => x.Key)
                .Take(3)
                .Select(x => Clean(x.Value.Name, 18) + " (" + FormatNumber(x.Value.Sulfur) + ")"));

            // The clan leaderboard ranks clans by PvP KILLS, not by member count.
            string clans = Podium(data.Clans
                .Where(x => x.Value != null && x.Value.PvPKills > 0)
                .OrderByDescending(x => x.Value.PvPKills)
                .ThenByDescending(x => x.Value.Sulfur)
                .ThenBy(x => x.Key, StringComparer.OrdinalIgnoreCase)
                .Take(3)
                .Select(x => "[" + Clean(x.Key, 16) + "] (" + x.Value.PvPKills + ")"));

            return new[]
            {
                "<color=#ffc976>TOP PVP KILLS</color> | " + kills +
                    " | <color=#ffc976>$" + settings.PvPKillsPrizeUsd + " to #1 at wipe</color>",
                "<color=#ffc976>TOP SULFUR MINED</color> | " + sulfur +
                    " | <color=#ffc976>$" + settings.SulfurPrizeUsd + " to #1 at wipe</color>",
                "<color=#ffc976>TOP CLANS (PVP KILLS)</color> | " + clans +
                    " | <color=#ffc976>$" + settings.ClanPrizeUsdTotal +
                    " TOTAL to #1 clan at wipe (shared, not per member)</color>"
            };
        }

        // Called by AshfallWebsiteLive. This is a read-only export of the
        // SAME wipe stats and tie-breakers used for in-game prize standings.
        // Do not rename the hook: the website bridge depends on it.
        [HookMethod("API_GetWebsiteLeaderboards")]
        private object GetWebsiteLeaderboards()
        {
            if (data == null) return null;

            var pvp = data.Players
                .Where(x => x.Value != null && x.Value.Kills > 0)
                .OrderByDescending(x => x.Value.Kills)
                .ThenByDescending(x => x.Value.BestStreak)
                .ThenBy(x => x.Key)
                .Take(5)
                .Select(x => new { name = Clean(x.Value.Name, 22), value = x.Value.Kills })
                .ToArray();

            var sulfur = data.Players
                .Where(x => x.Value != null && x.Value.Sulfur > 0)
                .OrderByDescending(x => x.Value.Sulfur)
                .ThenByDescending(x => x.Value.Kills)
                .ThenBy(x => x.Key)
                .Take(5)
                .Select(x => new
                {
                    name = Clean(x.Value.Name, 22),
                    // The website API accepts integer values up to one billion.
                    value = Math.Min(x.Value.Sulfur, 1000000000L)
                })
                .ToArray();

            var clans = data.Clans
                .Where(x => x.Value != null && x.Value.PvPKills > 0)
                .OrderByDescending(x => x.Value.PvPKills)
                .ThenByDescending(x => x.Value.Sulfur)
                .ThenBy(x => x.Key, StringComparer.OrdinalIgnoreCase)
                .Take(5)
                .Select(x => new { name = "[" + Clean(x.Key, 16) + "]", value = x.Value.PvPKills })
                .ToArray();

            return new { pvp, sulfur, clans };
        }

        [ConsoleCommand("ashfall.lb.website")]
        private void WebsiteExportDiagnostic(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null && !arg.IsAdmin) return;
            if (data == null)
            {
                arg.ReplyWith("Website leaderboard export unavailable: stat data did not load. Original data was not overwritten.");
                return;
            }
            arg.ReplyWith("Website leaderboard export READY: " +
                data.Players.Count + " tracked players, " + data.Clans.Count +
                " clan stat records. The website bridge sends top-five PvP, sulfur and clan prize standings.");
        }

        private static string Podium(IEnumerable<string> entrants)
        {
            int place = 0;
            string[] ranked = entrants.Select(x => "#" + (++place) + " " + x).ToArray();
            return ranked.Length == 0 ? "No recorded scores yet" : string.Join(" | ", ranked);
        }

        private void BroadcastLeaderboard()
        {
            if (data == null || BasePlayer.activePlayerList.Count == 0) return;
            string[] messages = BuildChatStandings();
            foreach (BasePlayer player in BasePlayer.activePlayerList)
            {
                if (!IsRealPlayer(player) || !player.IsConnected) continue;
                foreach (string message in messages) Chat(player, message);
            }
        }

        // From the dedicated console or admin RCON: immediately sends the same
        // standings as the periodic timer, without modifying player statistics.
        [ConsoleCommand("ashfall.lb.announce")]
        private void AnnounceCommand(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null && !arg.IsAdmin) return;
            if (data == null) { arg.ReplyWith("Leaderboard data unavailable; no announcement sent."); return; }
            BroadcastLeaderboard();
            arg.ReplyWith("Leaderboard chat standings sent to connected players (if any).");
        }

        // Run before each wipe/reset. Copy the output and back up the JSON
        // before paying prizes; this plugin does not award money automatically.
        [ConsoleCommand("ashfall.lb.winners")]
        private void WinnersCommand(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null && !arg.IsAdmin) return;
            if (data == null) { arg.ReplyWith("Leaderboard data unavailable."); return; }
            string pvp = Podium(data.Players
                .Where(x => x.Value != null && x.Value.Kills > 0)
                .OrderByDescending(x => x.Value.Kills).ThenByDescending(x => x.Value.BestStreak)
                .ThenBy(x => x.Key).Take(3)
                .Select(x => Clean(x.Value.Name, 22) + " / SteamID " + x.Key + " / " + x.Value.Kills + " kills"));
            string sulfur = Podium(data.Players
                .Where(x => x.Value != null && x.Value.Sulfur > 0)
                .OrderByDescending(x => x.Value.Sulfur).ThenByDescending(x => x.Value.Kills)
                .ThenBy(x => x.Key).Take(3)
                .Select(x => Clean(x.Value.Name, 22) + " / SteamID " + x.Key + " / " + x.Value.Sulfur + " sulfur"));
            string clans = Podium(data.Clans
                .Where(x => x.Value != null && x.Value.PvPKills > 0)
                .OrderByDescending(x => x.Value.PvPKills).ThenByDescending(x => x.Value.Sulfur)
                .ThenBy(x => x.Key, StringComparer.OrdinalIgnoreCase).Take(3)
                .Select(x => "[" + Clean(x.Key, 16) + "] / " + x.Value.PvPKills + " PvP kills"));
            arg.ReplyWith("ASHFALL CURRENT STANDINGS (subject to staff verification):\n" +
                "PVP (winner prize $" + settings.PvPKillsPrizeUsd + "): " + pvp + "\n" +
                "SULFUR (winner prize $" + settings.SulfurPrizeUsd + "): " + sulfur + "\n" +
                "CLANS (winner prize $" + settings.ClanPrizeUsdTotal + " TOTAL): " + clans +
                "\nClan prize is one $" + settings.ClanPrizeUsdTotal +
                " payment for the winning clan, NOT per member. Back up oxide/data/AshfallLeaderboard.json before wipe/reset.");
        }

        private string WritePrizeArchive(string reason)
        {
            if (data == null) throw new InvalidOperationException("Leaderboard data has not loaded; refusing archive.");
            RefreshClanRoster(true);

            WipePrizeArchive snapshot = new WipePrizeArchive
            {
                RecordedUtc = DateTime.UtcNow.ToString("o"),
                Reason = reason,
                PvPKillsPrizeUsd = settings.PvPKillsPrizeUsd,
                SulfurPrizeUsd = settings.SulfurPrizeUsd,
                ClanPrizeUsdTotal = settings.ClanPrizeUsdTotal,
                PvPKills = data.Players
                    .Where(x => x.Value != null && x.Value.Kills > 0)
                    .OrderByDescending(x => x.Value.Kills)
                    .ThenByDescending(x => x.Value.BestStreak)
                    .ThenBy(x => x.Key)
                    .Take(3)
                    .Select((x, index) => new PrizeEntry
                    {
                        Rank = index + 1,
                        SteamId = x.Key.ToString(),
                        Name = Clean(x.Value.Name, 22),
                        Score = x.Value.Kills,
                        TieBreaker = x.Value.BestStreak
                    }).ToList(),
                SulfurMined = data.Players
                    .Where(x => x.Value != null && x.Value.Sulfur > 0)
                    .OrderByDescending(x => x.Value.Sulfur)
                    .ThenByDescending(x => x.Value.Kills)
                    .ThenBy(x => x.Key)
                    .Take(3)
                    .Select((x, index) => new PrizeEntry
                    {
                        Rank = index + 1,
                        SteamId = x.Key.ToString(),
                        Name = Clean(x.Value.Name, 22),
                        Score = x.Value.Sulfur,
                        TieBreaker = x.Value.Kills
                    }).ToList(),
                ClansByPvPKills = data.Clans
                    .Where(x => x.Value != null && x.Value.PvPKills > 0)
                    .OrderByDescending(x => x.Value.PvPKills)
                    .ThenByDescending(x => x.Value.Sulfur)
                    .ThenBy(x => x.Key, StringComparer.OrdinalIgnoreCase)
                    .Take(3)
                    .Select((x, index) => new PrizeEntry
                    {
                        Rank = index + 1,
                        Name = Clean(x.Key, 16),
                        Score = x.Value.PvPKills,
                        TieBreaker = x.Value.Sulfur,
                        ClanMemberSteamIds = clanMembers
                            .Where(m => string.Equals(m.Value, x.Key, StringComparison.OrdinalIgnoreCase))
                            .Select(m => m.Key.ToString())
                            .OrderBy(id => id)
                            .ToArray()
                    }).ToList()
            };

            // Every execution gets a new file. Old prize evidence is untouched.
            string filename = "AshfallLeaderboardWinners_" +
                DateTime.UtcNow.ToString("yyyyMMdd_HHmmss_fff") + "_" +
                Guid.NewGuid().ToString("N").Substring(0, 6);
            Interface.Oxide.DataFileSystem.WriteObject(filename, snapshot);
            return filename;
        }

        [ConsoleCommand("ashfall.lb.archive")]
        private void ArchiveConsole(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null)
            {
                arg.ReplyWith("Only the physical server console may archive wipe prizes.");
                return;
            }
            try
            {
                SaveData();
                string filename = WritePrizeArchive("manual_wipe_review");
                arg.ReplyWith("Prize standings archived to oxide/data/" + filename +
                    ".json. Verify player SteamIDs and clan membership before paying prizes.");
            }
            catch (Exception ex)
            {
                PrintError("Prize archive FAILED. Statistics were NOT reset: " + ex.Message);
                arg.ReplyWith("Prize archive failed. No statistics were reset.");
            }
        }

        [ChatCommand("leaderboard")]
        private void LeaderboardCommand(BasePlayer player, string cmd, string[] args) { Show(player, "kills"); }

        [ChatCommand("lb")]
        private void ShortCommand(BasePlayer player, string cmd, string[] args) { Show(player, "kills"); }

        [ChatCommand("top")]
        private void TopCommand(BasePlayer player, string cmd, string[] args) { Show(player, "kills"); }

        [ChatCommand("stats")]
        private void StatsCommand(BasePlayer player, string cmd, string[] args) { Show(player, "me"); }

        [HookMethod("API_OpenLeaderboard")]
        private void OpenFromHelp(BasePlayer player) { Show(player, "kills"); }

        [ConsoleCommand("ashfall.lb.page")]
        private void PageCommand(ConsoleSystem.Arg arg)
        {
            BasePlayer player = arg.Player();
            if (player == null) return;
            string page = arg.GetString(0, "kills");
            if (page == "kills" || page == "sulfur" || page == "clans" || page == "me") Show(player, page);
        }

        [ConsoleCommand("ashfall.lb.close")]
        private void CloseCommand(ConsoleSystem.Arg arg)
        {
            BasePlayer player = arg.Player();
            if (player != null) CloseWindow(player);
        }

        [ConsoleCommand("ashfall.lb.reset")]
        private void ResetConsole(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null) { arg.ReplyWith("Only the physical server console may reset leaderboard statistics."); return; }
            if (arg.GetString(0, "") != "CONFIRM") { arg.ReplyWith("Usage: ashfall.lb.reset CONFIRM (permanently resets leaderboard stats; back up oxide/data/AshfallLeaderboard.json first)"); return; }
            if (data == null) { arg.ReplyWith("Data is unavailable; reset refused."); return; }
            string archive;
            try
            {
                SaveData();
                archive = WritePrizeArchive("automatic_pre_reset");
            }
            catch (Exception ex)
            {
                PrintError("Refused leaderboard reset because prize archival failed: " + ex.Message);
                arg.ReplyWith("Reset REFUSED: archival failed. Original statistics are intact.");
                return;
            }
            data = new StoredData();
            recentKills.Clear();
            SaveData();
            arg.ReplyWith("ASHFALL leaderboard reset completed. Prior wipe archived in oxide/data/" + archive + ".json");
        }

        private void Show(BasePlayer player, string page)
        {
            if (player == null || !player.IsConnected) return;
            if (data == null) { Chat(player, "Statistics are temporarily unavailable. Check the Oxide console."); return; }

            // Keep the cursor-enabled root in place when the page changes.
            if (openWindows.Add(player.userID)) DrawShell(player);
            DrawPage(player, page);
        }

        private void DrawShell(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, Ui);
            CuiElementContainer ui = new CuiElementContainer();
            ui.Add(new CuiPanel
            {
                Image = { Color = "0.058 0.075 0.085 0.99" },
                RectTransform = { AnchorMin = "0.26 0.20", AnchorMax = "0.74 0.80" },
                CursorEnabled = true
            }, "Overlay", Ui);

            Panel(ui, Accent, "0 0", "0.008 1");
            Label(ui, "ASHFALL  /  LEADERBOARDS", 21, White, "0.055 0.86", "0.90 0.96", TextAnchor.MiddleLeft);
            Label(ui, "MONTHLY  |  REAL PLAYER STATISTICS", 10, Muted, "0.057 0.818", "0.90 0.865", TextAnchor.MiddleLeft);
            Button(ui, "X", "ashfall.lb.close", "0.928 0.879", "0.978 0.951", Raised, 15);
            Panel(ui, "0.2 0.24 0.24 0.8", "0.045 0.793", "0.965 0.796");

            Panel(ui, "0.2 0.24 0.24 0.8", "0.047 0.137", "0.962 0.14");
            Label(ui, "www.ashfallreborn.com", 11, "0.95 0.48 0.25 1", "0.057 0.047", "0.53 0.127", TextAnchor.MiddleLeft);
            Label(ui, "Use /help for server commands", 10, Muted, "0.56 0.047", "0.949 0.127", TextAnchor.MiddleRight);
            CuiHelper.AddUi(player, ui);
        }

        private void DrawPage(BasePlayer player, string page)
        {
            // Replace only child panels. Destroying the root would recenter Rust's cursor.
            CuiHelper.DestroyUi(player, UiTabs);
            CuiHelper.DestroyUi(player, UiContent);
            CuiElementContainer ui = new CuiElementContainer();
            ui.Add(new CuiElement
            {
                Name = UiTabs,
                Parent = Ui,
                Components = { new CuiRectTransformComponent { AnchorMin = "0 0", AnchorMax = "1 1" } }
            });
            ui.Add(new CuiElement
            {
                Name = UiContent,
                Parent = Ui,
                Components = { new CuiRectTransformComponent { AnchorMin = "0 0", AnchorMax = "1 1" } }
            });

            string[] tabs = { "kills", "sulfur", "clans", "me" };
            string[] titles = { "PVP KILLS", "SULFUR", "TOP CLANS", "MY STATS" };
            for (int i = 0; i < tabs.Length; i++)
            {
                float x = 0.055f + i * 0.231f;
                Button(ui, titles[i], "ashfall.lb.page " + tabs[i], Pos(x, 0.711f), Pos(x + 0.219f, 0.773f), tabs[i] == page ? Accent : Raised, 12, UiTabs);
            }

            if (page == "me") DrawPersonal(ui, player);
            else DrawTop(ui, page);

            CuiHelper.AddUi(player, ui);
        }

        private void CloseWindow(BasePlayer player)
        {
            openWindows.Remove(player.userID);
            CuiHelper.DestroyUi(player, Ui);
        }

        private void DrawTop(CuiElementContainer ui, string page)
        {
            Label(ui, page == "kills" ? "TOP PVP PLAYERS" : page == "sulfur" ? "TOP SULFUR MINERS" : "TOP CLANS BY PVP KILLS", 17, White, "0.060 0.623", "0.94 0.69", TextAnchor.MiddleLeft, UiContent);

            List<KeyValuePair<string, string>> rows = new List<KeyValuePair<string, string>>();
            if (page == "clans")
            {
                RefreshClanRoster(false);
                HashSet<string> tags = new HashSet<string>(knownClanTags, StringComparer.OrdinalIgnoreCase);
                foreach (string tag in data.Clans.Keys) tags.Add(tag);
                foreach (string tag in tags.OrderByDescending(x => data.Clans.ContainsKey(x) ? data.Clans[x].PvPKills : 0)
                                            .ThenByDescending(x => data.Clans.ContainsKey(x) ? data.Clans[x].Sulfur : 0)
                                            .Take(settings.VisibleTop))
                {
                    ClanStat stat;
                    data.Clans.TryGetValue(tag, out stat);
                    rows.Add(new KeyValuePair<string, string>("[" + Clean(tag, 16) + "]",
                        (stat == null ? 0 : stat.PvPKills) + " KILLS  |  " +
                        FormatNumber(stat == null ? 0 : stat.Sulfur) + " SULFUR"));
                }
            }
            else
            {
                IEnumerable<KeyValuePair<ulong, PlayerStat>> ordered = page == "sulfur"
                    ? data.Players.OrderByDescending(x => x.Value.Sulfur).ThenByDescending(x => x.Value.Kills)
                    : data.Players.OrderByDescending(x => x.Value.Kills).ThenByDescending(x => x.Value.BestStreak);
                foreach (var entry in ordered.Where(x => page == "sulfur" ? x.Value.Sulfur > 0 : x.Value.Kills > 0).Take(settings.VisibleTop))
                {
                    string right = page == "sulfur" ? FormatNumber(entry.Value.Sulfur) + " ORE" : entry.Value.Kills + " KILLS  |  " + entry.Value.Deaths + " DEATHS";
                    rows.Add(new KeyValuePair<string, string>(Clean(entry.Value.Name, 22), right));
                }
            }

            if (rows.Count == 0)
            {
                Label(ui, "No recorded results yet. Be the first on the board.", 13, Muted, "0.065 0.33", "0.94 0.60", TextAnchor.MiddleCenter, UiContent);
                return;
            }

            float rowHeight = 0.055f;
            for (int i = 0; i < rows.Count; i++)
            {
                float top = 0.616f - (i * 0.058f);
                float bottom = top - rowHeight;
                Panel(ui, i % 2 == 0 ? Raised : "0.095 0.116 0.127 1", Pos(0.055f, bottom), Pos(0.949f, top), UiContent);
                Label(ui, (i + 1).ToString("00"), 13, Accent, Pos(0.071f, bottom), Pos(0.13f, top), TextAnchor.MiddleLeft, UiContent);
                Label(ui, rows[i].Key, 13, White, Pos(0.14f, bottom), Pos(0.625f, top), TextAnchor.MiddleLeft, UiContent);
                Label(ui, rows[i].Value, 11, Muted, Pos(0.63f, bottom), Pos(0.931f, top), TextAnchor.MiddleRight, UiContent);
            }
        }

        private void DrawPersonal(CuiElementContainer ui, BasePlayer player)
        {
            PlayerStat stat = GetStat(player);
            Label(ui, "YOUR SURVIVAL RECORD", 17, White, "0.061 0.622", "0.939 0.69", TextAnchor.MiddleLeft, UiContent);
            Label(ui, "PLAYER  " + Clean(player.displayName, 24), 12, Muted, "0.062 0.573", "0.94 0.622", TextAnchor.MiddleLeft, UiContent);
            PersonalLine(ui, "PVP KILLS", stat.Kills.ToString(), 0.565f);
            PersonalLine(ui, "DEATHS", stat.Deaths.ToString(), 0.494f);
            PersonalLine(ui, "K / D", stat.Deaths == 0 ? stat.Kills.ToString("0.00") : ((double)stat.Kills / stat.Deaths).ToString("0.00"), 0.423f);
            PersonalLine(ui, "CURRENT / BEST STREAK", stat.CurrentStreak + " / " + stat.BestStreak, 0.352f);
            PersonalLine(ui, "SULFUR ORE MINED", FormatNumber(stat.Sulfur), 0.281f);
            string clan = ClanTag(player);
            PersonalLine(ui, "CLAN", clan == null ? "NONE" : "[" + clan + "]", 0.210f);
        }

        private static void PersonalLine(CuiElementContainer ui, string title, string value, float top)
        {
            Panel(ui, Raised, Pos(0.06f, top - 0.061f), Pos(0.94f, top), UiContent);
            Label(ui, title, 12, Muted, Pos(0.079f, top - 0.061f), Pos(0.63f, top), TextAnchor.MiddleLeft, UiContent);
            Label(ui, value, 14, White, Pos(0.64f, top - 0.061f), Pos(0.922f, top), TextAnchor.MiddleRight, UiContent);
        }

        private static string FormatNumber(long number) { return number.ToString("N0"); }

        private static string Clean(string value, int max)
        {
            if (string.IsNullOrWhiteSpace(value)) return "Unknown";
            string clean = new string(value.Where(c => c != '<' && c != '>' && !char.IsControl(c)).ToArray());
            return clean.Length > max ? clean.Substring(0, max - 1) + "…" : clean;
        }

        private static string Pos(float x, float y)
        {
            return x.ToString("0.000", System.Globalization.CultureInfo.InvariantCulture) + " " + y.ToString("0.000", System.Globalization.CultureInfo.InvariantCulture);
        }

        private static void Panel(CuiElementContainer ui, string color, string min, string max, string parent = Ui)
        {
            ui.Add(new CuiPanel { Image = { Color = color }, RectTransform = { AnchorMin = min, AnchorMax = max } }, parent);
        }

        private static void Label(CuiElementContainer ui, string message, int size, string color, string min, string max, TextAnchor align, string parent = Ui)
        {
            ui.Add(new CuiLabel { Text = { Text = message, FontSize = size, Color = color, Align = align }, RectTransform = { AnchorMin = min, AnchorMax = max } }, parent);
        }

        private static void Button(CuiElementContainer ui, string title, string cmd, string min, string max, string color, int fontSize, string parent = Ui)
        {
            ui.Add(new CuiButton { Button = { Command = cmd, Color = color }, Text = { Text = title, FontSize = fontSize, Color = White, Align = TextAnchor.MiddleCenter }, RectTransform = { AnchorMin = min, AnchorMax = max } }, parent);
        }

        private static void Chat(BasePlayer player, string message)
        {
            player.SendConsoleCommand("chat.add", 2, ChatIcon, "<color=#e97a45>ASHFALL</color> " + message);
        }

        private void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            if (player != null) CloseWindow(player);
        }
    }
}
