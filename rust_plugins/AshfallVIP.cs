using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Oxide.Core.Libraries;

namespace Oxide.Plugins
{
    [Info("AshfallVIP", "ASHFALL REBORN", "1.1.0")]
    [Description("Checks the website's verified Stripe VIP entitlement and syncs the ashfallvip.member permission.")]
    public class AshfallVIP : RustPlugin
    {
        private const string VipPermission = "ashfallvip.member";
        private Settings settings;

        private class Settings
        {
            [JsonProperty("Website entitlement API URL")]
            public string EntitlementApiUrl = "https://ashfallreborn.com/api/vip/entitlement";

            [JsonProperty("ASHFALL_BRIDGE_SECRET (same value as Vercel)")]
            public string Secret = "CHANGE_ME";

            [JsonProperty("Entitlement recheck interval seconds")]
            public float RecheckSeconds = 180f;
        }

        protected override void LoadDefaultConfig() { settings = new Settings(); SaveConfig(); }
        protected override void SaveConfig() { Config.WriteObject(settings, true); }

        private void Init()
        {
            permission.RegisterPermission(VipPermission, this);
            try { settings = Config.ReadObject<Settings>(); }
            catch { settings = new Settings(); }
            if (settings == null) settings = new Settings();
            SaveConfig();
        }

        private bool Configured
        {
            get
            {
                return !string.IsNullOrEmpty(settings.EntitlementApiUrl) &&
                    settings.EntitlementApiUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) &&
                    !string.IsNullOrEmpty(settings.Secret) &&
                    settings.Secret.Length >= 32 && settings.Secret != "CHANGE_ME";
            }
        }

        private void OnServerInitialized()
        {
            if (!Configured)
                PrintWarning("Configure oxide/config/AshfallVIP.json before accepting VIP purchases.");
            else UpdateOnlinePlayers();
            timer.Every(Math.Max(60f, settings.RecheckSeconds), UpdateOnlinePlayers);
        }

        private void OnPlayerConnected(BasePlayer player)
        {
            if (player != null) timer.Once(5f, () => Check(player));
        }

        private void UpdateOnlinePlayers()
        {
            foreach (BasePlayer player in BasePlayer.activePlayerList)
                if (player != null && player.IsConnected) Check(player);
        }

        // Diagnostic only. Never prints the secret, grants VIP, or touches billing.
        [ConsoleCommand("ashfall.vip.status")]
        private void VipStatus(ConsoleSystem.Arg arg)
        {
            if (arg.Connection != null && !arg.IsAdmin) return;
            int online = 0;
            int withPermission = 0;
            foreach (BasePlayer player in BasePlayer.activePlayerList)
            {
                if (player == null || !player.IsConnected) continue;
                online++;
                if (permission.UserHasPermission(player.UserIDString, VipPermission)) withPermission++;
            }
            arg.ReplyWith("ASHFALL VIP entitlement checker: " +
                (Configured ? "CONFIGURED" : "NOT CONFIGURED") +
                "; online=" + online + "; online with ashfallvip.member=" + withPermission +
                ". This tests entitlement plumbing only, NOT separate perk plugins.");
        }

        private void Check(BasePlayer player)
        {
            if (!Configured || player == null || !player.IsConnected) return;
            string steamId = player.UserIDString;
            var headers = new Dictionary<string, string> { { "X-Ashfall-Bridge-Key", settings.Secret } };
            string endpoint = settings.EntitlementApiUrl + "?steamId=" + Uri.EscapeDataString(steamId);
            webrequest.Enqueue(endpoint, null, (code, response) =>
            {
                if (code != 200 || string.IsNullOrEmpty(response))
                {
                    // Never grant new VIP access on an unknown response. Existing
                    // permissions are rechecked at the next successful poll.
                    return;
                }
                bool entitled;
                try
                {
                    var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(response);
                    entitled = result != null && result.ContainsKey("entitled") &&
                        string.Equals(Convert.ToString(result["entitled"]), "True", StringComparison.OrdinalIgnoreCase);
                }
                catch { return; }

                // The player may have left between the request and response.
                if (!player.IsConnected || player.UserIDString != steamId) return;
                if (entitled && !permission.UserHasPermission(steamId, VipPermission))
                {
                    permission.GrantUserPermission(steamId, VipPermission, this);
                    Puts("VIP enabled for verified SteamID " + steamId);
                }
                else if (!entitled && permission.UserHasPermission(steamId, VipPermission))
                {
                    permission.RevokeUserPermission(steamId, VipPermission);
                    Puts("VIP removed for expired/canceled SteamID " + steamId);
                }
            }, this, RequestMethod.GET, headers);
        }
    }
}
