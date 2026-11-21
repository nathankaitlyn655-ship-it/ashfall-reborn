# Windows PowerShell 5.1. READ ONLY: no keys printed, no payments, no permission changes.
param([string]$RustRoot = 'C:\rustserver', [string]$Website = 'https://ashfallreborn.com')
$ErrorActionPreference = 'Stop'

Write-Host 'ASHFALL VIP PRE-LAUNCH CHECK (READ ONLY)' -ForegroundColor Cyan
$pluginsPath = Join-Path $RustRoot 'oxide\plugins'
$configPath = Join-Path $RustRoot 'oxide\config'

foreach ($name in @('AshfallVIP.cs', 'AshfallWebsiteLive.cs')) {
    $exists = Test-Path (Join-Path $pluginsPath $name) -PathType Leaf
    Write-Host ('Plugin {0}: {1}' -f $name, $(if ($exists) { 'PRESENT' } else { 'MISSING' }))
}

$vipConfigFile = Join-Path $configPath 'AshfallVIP.json'
$bridgeConfigFile = Join-Path $configPath 'AshfallWebsiteLive.json'
if ((Test-Path $vipConfigFile) -and (Test-Path $bridgeConfigFile)) {
    $vip = Get-Content -LiteralPath $vipConfigFile -Raw | ConvertFrom-Json
    $bridge = Get-Content -LiteralPath $bridgeConfigFile -Raw | ConvertFrom-Json
    $keyName = 'ASHFALL_BRIDGE_SECRET (same value as Vercel)'
    $vipSecret = [string]$vip.$keyName
    $bridgeSecret = [string]$bridge.$keyName
    $sameKey = $vipSecret.Length -ge 32 -and $vipSecret -ne 'CHANGE_ME' -and $vipSecret -ceq $bridgeSecret
    Write-Host ('VIP/website bridge secrets match (secret not displayed): {0}' -f $sameKey)
    Write-Host ('VIP entitlement URL is HTTPS: {0}' -f ([string]$vip.'Website entitlement API URL').StartsWith('https://'))
} else {
    Write-Warning 'One or both plugin config files are missing. Load the plugins once, then configure them.'
}

try {
    $url = $Website.TrimEnd('/') + '/api/vip/checkout'
    $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 12
    Write-Host ('Website VIP purchase availability: {0}' -f $(if ($response.available) { 'ENABLED - verify all perks before offering sales' } else { 'DISABLED (safe during testing)' }))
} catch {
    Write-Warning 'Could not reach VIP website check: inspect VPS internet/DNS and website deployment.'
}

$perks = @(
    @{ Label = 'Skinbox'; Pattern = 'skinbox|skins' },
    @{ Label = 'Box sorting'; Pattern = 'boxsort|sorter' },
    @{ Label = 'Team auto-auth'; Pattern = 'teamauth|teamshare|autoshare' },
    @{ Label = 'Queue priority'; Pattern = 'queue|reserved' },
    @{ Label = 'Colored chat names'; Pattern = 'betterchat|chatformat|chatcolor' }
)
$installed = @(Get-ChildItem -LiteralPath $pluginsPath -Filter '*.cs' -File -ErrorAction SilentlyContinue)
foreach ($perk in $perks) {
    $matches = @($installed | Where-Object { $_.BaseName -match $perk.Pattern })
    $result = if ($matches.Count -gt 0) { 'CANDIDATE FOUND (permissions still need testing)' } else { 'NO MATCHING PLUGIN FILE FOUND' }
    Write-Host ('{0}: {1}' -f $perk.Label, $result)
}

Write-Host ''
Write-Host 'Next: run ashfall.vip.status in the physical Rust server console.' -ForegroundColor Yellow
Write-Host 'This script cannot verify active Stripe payment, Discord bot roles, or that every advertised perk works.'
Write-Host 'Do NOT enable VIP_CHECKOUT_READY until real perk and Stripe sandbox tests are complete.'
