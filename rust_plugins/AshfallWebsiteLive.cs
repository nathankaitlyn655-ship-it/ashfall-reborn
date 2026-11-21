using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Oxide.Core.Libraries;
using Oxide.Core.Plugins;

namespace Oxide.Plugins
{
    [Info("AshfallWebsiteLive", "ASHFALL REBORN", "1.1.0")]
    [Description("Read-only website heartbeat for real connected players and official wipe leaderboard standings.")]
    public class AshfallWebsiteLive : RustPlugin
    {
        [PluginReference] private Plugin AshfallLeaderboard;
        private Settings settings;
        private bool sending;
        private DateTime nextWarning = DateTime.MinValue;
        private DateTime nextLeaderboardWarning = DateTime.MinValue;

        private class Settings
        {
            [JsonProperty("Website live API URL")]
            public string ApiUrl = "https://ashfallreborn.com/api/live-snapshot";

            [JsonProperty("ASHFALL_BRIDGE_SECRET (same value as Vercel)")]
            public string Secret = "CHANGE_ME";

            [JsonProperty("Heartbeat interval in seconds (minimum 30)")]
            public float IntervalSeconds = 30f;
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
            try { settings = Config.ReadObject<Settings>(); }
            catch { settings = new Settings(); }
            if (settings == null) settings = new Settings();
            SaveConfig();
        }

        private bool Configured
        {
            get
            {
                return !string.IsNullOrEmpty(settings.ApiUrl) &&
                    settings.ApiUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) &&
                    !string.IsNullOrEmpty(settings.Secret) &&
                    settings.Secret.Length >= 32 && settings.Secret != "CHANGE_ME";
            }
        }

        private void OnServerInitialized()
        {
            if (!Configured)
                PrintWarning("Set the live API URL and a 32+ character ASHFALL_BRIDGE_SECRET in oxide/config/AshfallWebsiteLive.json");
            else SendSnapshot();
            timer.Every(Math.Max(30f, settings.IntervalSeconds), SendSnapshot);
        }

        private void OnPlayerConnected(BasePlayer player)
        {
            timer.Once(4f, SendSnapshot);
        }

        private void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            timer.Once(4f, SendSnapshot);
        }

        private void SendSnapshot()
        {
            if (!Configured || sending) return;
            var players = new List<OnlinePlayer>();
            foreach (BasePlayer player in BasePlayer.activePlayerList)
            {
                if (player != null && player.IsConnected)
                    players.Add(new OnlinePlayer { steamId = player.UserIDString, displayName = player.displayName });
            }
            var snapshot = new Dictionary<string, object>
            {
                { "onlinePlayers", players },
                { "maxPlayers", ConVar.Server.maxplayers }
            };

            // AshfallLeaderboard owns the statistics; this bridge never
            // edits them and never invents or alters player counts.
            if (AshfallLeaderboard != null)
            {
                try
                {
                    object standings = AshfallLeaderboard.Call("API_GetWebsiteLeaderboards");
                    if (standings != null) snapshot["leaderboards"] = standings;
                }
                catch (Exception ex)
                {
                    if (DateTime.UtcNow >= nextLeaderboardWarning)
                    {
                        nextLeaderboardWarning = DateTime.UtcNow.AddMinutes(5);
                        PrintWarning("Website leaderboard export unavailable; real-player heartbeat continues: " + ex.Message);
                    }
                }
            }

            var payload = JsonConvert.SerializeObject(snapshot);
            sending = true;
            var headers = new Dictionary<string, string>
            {
                { "Content-Type", "application/json" },
                { "X-Ashfall-Bridge-Key", settings.Secret }
            };
            webrequest.Enqueue(settings.ApiUrl, payload, (code, response) =>
            {
                sending = false;
                if (code >= 200 && code < 300) return;
                if (DateTime.UtcNow < nextWarning) return;
                nextWarning = DateTime.UtcNow.AddMinutes(5);
                PrintWarning("Website heartbeat failed (HTTP " + code + "). Check Vercel environment, SQL migration and bridge key.");
            }, this, RequestMethod.POST, headers);
        }
    }
}
