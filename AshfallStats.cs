using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Oxide.Core;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("AshfallStats", "Ashfall Reborn", "1.0.0")]
    [Description("Reports Rust kills, deaths, playtime and online players to the Ashfall Reborn website.")]
    public class AshfallStats : RustPlugin
    {
        private Settings settings;
        private readonly Dictionary<ulong, double> lastPlaytime = new Dictionary<ulong, double>();
        private readonly HashSet<ulong> reportedDeaths = new HashSet<ulong>();
        private const string DataName = "AshfallStats_Pending";
        private PendingData pending = new PendingData();
        private bool sending;

        private class Settings
        {
            [JsonProperty("Website API URL (HTTPS)")]
            public string ApiUrl = "https://ashfallreborn.com/api/player-stats";
            [JsonProperty("STATS_API_SECRET (must match website environment variable)")]
            public string ApiSecret = "CHANGE_ME";
            [JsonProperty("Playtime report interval in seconds")]
            public float PlaytimeInterval = 60f;
            [JsonProperty("Online player report interval in seconds")]
            public float OnlineInterval = 60f;
        }
        private class PendingData
        {
            public List<Payload> Queue = new List<Payload>();
        }
        private class Payload
        {
            public string killerName;
            public string victimName;
            public string killerSteamId;
            public string victimSteamId;
            public string deathType;
            public string playtimeName;
            public string playtimeSteamId;
            public int playtimeMinutes;
            public List<OnlinePlayer> onlinePlayers;
        }
        private class OnlinePlayer
        {
            public string steamId;
            public string displayName;
        }
        protected override void LoadDefaultConfig() { settings = new Settings(); SaveConfig(); }
        protected override void SaveConfig() { Config.WriteObject(settings, true); }
        private void Init()
        {
            try { settings = Config.ReadObject<Settings>(); } catch { settings = new Settings(); }
            if (settings == null) settings = new Settings();
            SaveConfig();
            try { pending = Interface.Oxide.DataFileSystem.ReadObject<PendingData>(DataName) ?? new PendingData(); }
            catch { pending = new PendingData(); }
            if (pending.Queue == null) pending.Queue = new List<Payload>();
        }
        private bool Configured { get { return settings.ApiUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(settings.ApiSecret) && settings.ApiSecret != "CHANGE_ME"; } }
        private void OnServerInitialized()
        {
            double now = Clock();
            foreach (BasePlayer p in BasePlayer.activePlayerList) lastPlaytime[p.userID] = now;
            timer.Every(Mathf.Max(30f, settings.PlaytimeInterval), ReportPlaytime);
            timer.Every(Mathf.Max(30f, settings.OnlineInterval), ReportOnline);
            timer.Every(10f, SendNext);
            if (!Configured) PrintWarning("Set the HTTPS API URL and STATS_API_SECRET in oxide/config/AshfallStats.json");
            else { ReportOnline(); SendNext(); }
        }
        private static double Clock() { return (DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds; }
        private void OnPlayerConnected(BasePlayer player)
        {
            if (player == null) return;
            lastPlaytime[player.userID] = Clock();
            timer.Once(3f, ReportOnline);
        }
        private void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            if (player == null) return;
            FlushPlayerTime(player);
            lastPlaytime.Remove(player.userID);
            reportedDeaths.Remove(player.userID);
            timer.Once(3f, ReportOnline);
        }
        private void OnPlayerRespawned(BasePlayer player)
        {
            if (player != null) reportedDeaths.Remove(player.userID);
        }
        private void OnPlayerDeath(BasePlayer victim, HitInfo info)
        {
            if (victim == null || !reportedDeaths.Add(victim.userID)) return;
            BasePlayer killer = info != null ? info.InitiatorPlayer : null;
            // Suicide, environmental deaths and NPC kills are deaths but not PvP kills.
            bool pvp = killer != null && killer.userID != victim.userID && killer.userID >= 76561197960265728UL;
            Queue(new Payload {
                killerName = pvp ? killer.displayName : null,
                killerSteamId = pvp ? killer.UserIDString : null,
                victimName = victim.displayName,
                victimSteamId = victim.UserIDString,
                deathType = pvp ? "player" : (killer == victim ? "suicide" : "environment")
            });
        }
        private void ReportPlaytime()
        {
            foreach (BasePlayer p in BasePlayer.activePlayerList) FlushPlayerTime(p);
        }
        private void FlushPlayerTime(BasePlayer p)
        {
            if (p == null || !p.IsConnected) return;
            double now = Clock();
            double since;
            if (!lastPlaytime.TryGetValue(p.userID, out since)) { lastPlaytime[p.userID] = now; return; }
            int minutes = (int)Math.Floor((now - since) / 60.0);
            if (minutes < 1) return;
            lastPlaytime[p.userID] = since + minutes * 60;
            Queue(new Payload { playtimeSteamId = p.UserIDString, playtimeName = p.displayName, playtimeMinutes = minutes });
        }
        private void ReportOnline()
        {
            var list = new List<OnlinePlayer>();
            foreach (BasePlayer p in BasePlayer.activePlayerList)
                if (p != null && p.IsConnected) list.Add(new OnlinePlayer { steamId = p.UserIDString, displayName = p.displayName });
            Queue(new Payload { onlinePlayers = list });
        }
        private void Queue(Payload payload)
        {
            if (pending.Queue.Count >= 2000) { PrintWarning("Stats queue is full; dropping oldest event"); pending.Queue.RemoveAt(0); }
            pending.Queue.Add(payload);
            SavePending();
            SendNext();
        }
        private void SavePending() { Interface.Oxide.DataFileSystem.WriteObject(DataName, pending); }
        private void SendNext()
        {
            if (sending || !Configured || pending.Queue.Count == 0) return;
            sending = true;
            Payload item = pending.Queue[0];
            var body = new Dictionary<string, object>();
            body["secret"] = settings.ApiSecret;
            if (item.onlinePlayers != null) body["onlinePlayers"] = item.onlinePlayers;
            else if (!string.IsNullOrEmpty(item.playtimeSteamId))
            {
                body["playtimeSteamId"] = item.playtimeSteamId;
                body["playtimeName"] = item.playtimeName;
                body["playtimeMinutes"] = item.playtimeMinutes;
            }
            else
            {
                body["killerSteamId"] = item.killerSteamId;
                body["killerName"] = item.killerName;
                body["victimSteamId"] = item.victimSteamId;
                body["victimName"] = item.victimName;
                body["deathType"] = item.deathType;
            }
            webrequest.Enqueue(settings.ApiUrl, JsonConvert.SerializeObject(body), (code, response) =>
            {
                sending = false;
                if (code >= 200 && code < 300 && response != null && response.Contains("\"success\":true"))
                {
                    if (pending.Queue.Count > 0) pending.Queue.RemoveAt(0);
                    SavePending();
                    if (pending.Queue.Count > 0) timer.Once(0.2f, SendNext);
                }
                else PrintWarning("Stats API report failed (HTTP " + code + "). Retrying. Response: " + (response ?? "none"));
            }, this, Oxide.Core.Libraries.RequestMethod.POST, new Dictionary<string, string> { { "Content-Type", "application/json" } });
        }
        private void Unload()
        {
            ReportPlaytime();
            SavePending();
        }
    }
}
