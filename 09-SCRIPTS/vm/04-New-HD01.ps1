<#
.SYNOPSIS
    IAM Career Lab — Create HD01 Windows 11 client VM
.DESCRIPTION
    Creates the HD01 Windows 11 client VM, domain-joined to lab.local.
    Requires legitimate Windows 11 installation media (ISO). Does NOT pirate or bypass licensing.
.NOTES
    Purpose:     Student workstation and help desk troubleshooting target
    Prerequisites: Hyper-V, lab switch, DC01 running with AD DS
    Permissions: Administrator
    Safe-use:    Creates one client VM on isolated network
    Rollback:    Stop-VM HD01; Remove-VM HD01 -Force; Remove-Item VM disk
    Validation:  Get-VM HD01; domain login test
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$IsoPath,
    [string]$VMName = "HD01",
    [string]$SwitchName = "Lab-Net",
    [int64]$MemoryGB = 4,
    [int]$ProcessorCount = 2,
    [int64]$DiskGB = 50,
    [string]$VHDPath = "$env:USERPROFILE\HyperV\HD01\HD01.vhdx",
    [string]$StaticIP = "10.10.10.100",
    [string]$SubnetMask = "255.255.255.0",
    [string]$DNSServer = "10.10.10.10",
    [string]$DomainName = "lab.local"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating HD01 client VM for $DomainName" -ForegroundColor Cyan

if (-not (Test-Path $IsoPath)) {
    Write-Error "Windows 11 ISO not found at: $IsoPath`nProvide a legitimate Windows 11 ISO path."
    return
}

$existing = Get-VM -Name $VMName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "VM '$VMName' already exists (State: $($existing.State)). No action needed." -ForegroundColor Green
    return
}

$vmDir = Split-Path $VHDPath -Parent
if (-not (Test-Path $vmDir)) { New-Item -ItemType Directory -Path $vmDir -Force | Out-Null }

Write-Host "Creating VHD: $VHDPath ($DiskGB GB)" -ForegroundColor White
New-VHD -Path $VHDPath -SizeBytes ($DiskGB * 1GB) -Dynamic -Generation 2 | Out-Null

Write-Host "Creating VM: $VMName" -ForegroundColor White
New-VM -Name $VMName -Generation 2 -MemoryStartupBytes ($MemoryGB * 1GB) `
    -VHDPath $VHDPath -SwitchName $SwitchName -ProcessorCount $ProcessorCount | Out-Null

# Attach ISO
Add-VMDvdDrive -VMName $VMName -Path $IsoPath
Set-VMFirmware -VMName $VMName -FirstBootDevice (Get-VMDvdDrive -VMName $VMName)

# Enable checkpoints
Set-VM -VMName $VMName -CheckpointType Enabled

Write-Host "Starting VM '$VMName'..." -ForegroundColor Green
Start-VM -Name $VMName

Write-Host ""
Write-Host "MANUAL STEPS REQUIRED (inside the VM console):" -ForegroundColor Yellow
Write-Host "  1. Install Windows 11" -ForegroundColor Yellow
Write-Host "  2. Set computer name to HD01" -ForegroundColor Yellow
Write-Host "  3. Set static IP: $StaticIP / $SubnetMask" -ForegroundColor Yellow
Write-Host "  4. Set DNS to $DNSServer (DC01)" -ForegroundColor Yellow
Write-Host "  5. Join domain: $DomainName" -ForegroundColor Yellow
Write-Host "  6. Restart and log in with a domain account (e.g., c.williams)" -ForegroundColor Yellow
Write-Host "  7. Run gpresult /h to verify GPO application" -ForegroundColor Yellow
Write-Host ""
Write-Host "Checkpoint after domain join: Checkpoint-VM -VMName $VMName -Name 'POST-DOMAIN-JOIN'" -ForegroundColor DarkGray
Write-Host "Rollback: Stop-VM $VMName; Remove-VM $VMName -Force; Remove-Item '$VHDPath' -Force" -ForegroundColor DarkGray
