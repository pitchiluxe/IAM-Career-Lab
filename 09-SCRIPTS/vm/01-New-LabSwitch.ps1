<#
.SYNOPSIS
    IAM Career Lab — Create isolated Hyper-V lab switch
.DESCRIPTION
    Creates a private Hyper-V virtual switch for the 10.10.10.0/24 lab network.
    Idempotent: if the switch already exists, it reports and exits.
.NOTES
    Purpose:     Isolated lab networking for DC01, HD01, FS01
    Prerequisites: Hyper-V enabled, run as Administrator
    Permissions: Administrator
    Safe-use:    Creates one private switch; does not affect host networking
    Rollback:    Remove-VMSwitch -Name "Lab-Net" -Force
#>

[CmdletBinding()]
param(
    [string]$SwitchName = "Lab-Net",
    [string]$Subnet = "10.10.10.0/24"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating Hyper-V lab switch: $SwitchName ($Subnet)" -ForegroundColor Cyan

$existing = Get-VMSwitch -Name $SwitchName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Switch '$SwitchName' already exists (Type: $($existing.SwitchType)). No action needed." -ForegroundColor Green
    return
}

# Check for IP conflict on host
$adapter = Get-NetIPAddress -IPAddress "10.10.10.*" -ErrorAction SilentlyContinue
if ($adapter) {
    Write-Warning "An adapter already uses 10.10.10.x — verify this is expected before proceeding."
}

New-VMSwitch -Name $SwitchName -SwitchType Private

Write-Host "Created private switch '$SwitchName'." -ForegroundColor Green
Write-Host "Lab subnet: $Subnet" -ForegroundColor White
Write-Host "DC01: 10.10.10.10 | FS01: 10.10.10.20 | MGMT01: 10.10.10.30 | Clients: 10.10.10.100-199" -ForegroundColor White
Write-Host ""
Write-Host "Rollback: Remove-VMSwitch -Name '$SwitchName' -Force" -ForegroundColor DarkGray
