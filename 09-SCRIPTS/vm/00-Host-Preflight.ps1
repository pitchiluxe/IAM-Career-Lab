<#
.SYNOPSIS
    IAM Career Lab — Host Preflight Check
.DESCRIPTION
    Inspects the host system for VM readiness: OS, CPU, RAM, disk, Hyper-V, virtualization, and Ollama.
    Produces a preflight report. Does not change anything.
.NOTES
    Purpose:     Detect host capabilities before building VMs
    Prerequisites: Windows 10/11, PowerShell 5.1+
    Permissions: Run as Administrator for full Hyper-V detection
    Safe-use:    Read-only — does not modify the system
    Rollback:    N/A (no changes made)
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " IAM Career Lab — Host Preflight" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# OS
$os = Get-CimInstance Win32_OperatingSystem
Write-Host "[OS] Caption: $($os.Caption)" -ForegroundColor White
Write-Host "[OS] Version: $($os.Version)" -ForegroundColor White
Write-Host "[OS] Architecture: $($os.OSArchitecture)" -ForegroundColor White
Write-Host ""

# CPU
$cpu = Get-CimInstance Win32_Processor
Write-Host "[CPU] Name: $($cpu.Name)" -ForegroundColor White
Write-Host "[CPU] Logical Processors: $($cpu.NumberOfLogicalProcessors)" -ForegroundColor White
$virtEnabled = $cpu.VirtualizationFirmwareEnabled
$slat = $cpu.SecondLevelAddressTranslationExtensions
Write-Host "[CPU] Virtualization Firmware Enabled: $virtEnabled" -ForegroundColor $(if ($virtEnabled) { "Green" } else { "Red" })
Write-Host "[CPU] SLAT: $slat" -ForegroundColor $(if ($slat) { "Green" } else { "Red" })
Write-Host ""

# RAM
$totalRAM = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
$freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
Write-Host "[RAM] Total: ${totalRAM} GB" -ForegroundColor White
Write-Host "[RAM] Free: ${freeRAM} GB" -ForegroundColor $(if ($freeRAM -ge 8) { "Green" } else { "Red" })
Write-Host ""

# Disk
$disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
foreach ($disk in $disks) {
    $totalGB = [math]::Round($disk.Size / 1GB, 1)
    $freeGB = [math]::Round($disk.FreeSpace / 1GB, 1)
    Write-Host "[DISK] $($disk.DeviceID) Total: ${totalGB} GB, Free: ${freeGB} GB" -ForegroundColor $(if ($freeGB -ge 60) { "Green" } else { "Red" })
}
Write-Host ""

# Hyper-V
$hyperVFeature = $null
try {
    $hyperVFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction Stop
} catch {
    Write-Host "[HYPER-V] Cannot query feature (needs elevation or not available)" -ForegroundColor Yellow
}
if ($hyperVFeature) {
    Write-Host "[HYPER-V] Feature State: $($hyperVFeature.State)" -ForegroundColor $(if ($hyperVFeature.State -eq "Enabled") { "Green" } else { "Red" })
}
$hyperVCmdlet = Get-Command Get-VM -ErrorAction SilentlyContinue
Write-Host "[HYPER-V] Get-VM cmdlet available: $($null -ne $hyperVCmdlet)" -ForegroundColor $(if ($hyperVCmdlet) { "Green" } else { "Red" })
Write-Host ""

# Existing VMs and switches
if ($hyperVCmdlet) {
    Write-Host "[VM] Existing VMs:" -ForegroundColor White
    Get-VM | Format-Table Name, State, MemoryAssigned, ProcessorCount -AutoSize
    Write-Host "[VM] Existing Switches:" -ForegroundColor White
    Get-VMSwitch | Format-Table Name, SwitchType -AutoSize
} else {
    Write-Host "[VM] Cannot list VMs — Hyper-V cmdlets not available" -ForegroundColor Yellow
}
Write-Host ""

# Ollama
try {
    $ollamaResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5
    Write-Host "[OLLAMA] Available: True" -ForegroundColor Green
    $ollamaData = $ollamaResponse.Content | ConvertFrom-Json
    Write-Host "[OLLAMA] Models: $($ollamaData.models.name -join ', ')" -ForegroundColor White
} catch {
    Write-Host "[OLLAMA] Available: False (not running on localhost:11434)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " PREFLIGHT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$blockers = @()
if ($os.Caption -notmatch "Pro|Enterprise|Education|Server") {
    $blockers += "Windows Home edition does not support Hyper-V (needs Pro/Enterprise/Education)"
}
if (-not $virtEnabled) { $blockers += "CPU virtualization is disabled in firmware" }
if (-not $slat) { $blockers += "SLAT not available" }
if ($freeRAM -lt 8) { $blockers += "Insufficient free RAM (need 8GB+, have ${freeRAM}GB)" }
foreach ($disk in $disks) {
    $freeGB = [math]::Round($disk.FreeSpace / 1GB, 1)
    if ($freeGB -lt 60) { $blockers += "$($disk.DeviceID) has only ${freeGB} GB free (need 60GB+ for VMs)" }
}
if (-not $hyperVCmdlet) { $blockers += "Hyper-V cmdlets not available" }

if ($blockers.Count -eq 0) {
    Write-Host " RESULT: HOST IS READY FOR VMs" -ForegroundColor Green
} else {
    Write-Host " RESULT: HOST NEEDS UPGRADES BEFORE VMs CAN BE BUILT" -ForegroundColor Red
    Write-Host ""
    Write-Host " Blockers:" -ForegroundColor Red
    foreach ($b in $blockers) { Write-Host "  - $b" -ForegroundColor Red }
    Write-Host ""
    Write-Host " Recommendations:" -ForegroundColor Yellow
    Write-Host "  - Upgrade to Windows 11 Pro/Enterprise/Education" -ForegroundColor Yellow
    Write-Host "  - Enable CPU virtualization in BIOS/UEFI" -ForegroundColor Yellow
    Write-Host "  - Free up disk space to at least 60GB" -ForegroundColor Yellow
    Write-Host "  - Install Ollama from https://ollama.com" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Preflight complete. No changes were made to the system." -ForegroundColor Cyan
