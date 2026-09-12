<#
.SYNOPSIS
    IAM Career Lab — Create DC01 domain controller VM
.DESCRIPTION
    Creates the DC01 VM (Windows Server) with AD DS + DNS for the lab.local domain.
    Requires legitimate Windows Server installation media (ISO). Does NOT pirate or bypass licensing.
.NOTES
    Purpose:     Domain controller for the IAM Career Lab lab
    Prerequisites: Hyper-V enabled, lab switch created, Windows Server ISO
    Permissions: Administrator
    Safe-use:    Creates one VM with static IP on isolated network
    Rollback:    Stop-VM DC01; Remove-VM DC01 -Force; Remove-Item VM disk
    Validation:   Get-VM DC01; Test-Connection 10.10.10.10
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$IsoPath,
    [string]$VMName = "DC01",
    [string]$SwitchName = "Lab-Net",
    [int64]$MemoryGB = 2,
    [int]$ProcessorCount = 2,
    [int64]$DiskGB = 40,
    [string]$VHDPath = "$env:USERPROFILE\HyperV\DC01\DC01.vhdx",
    [string]$StaticIP = "10.10.10.10",
    [string]$SubnetMask = "255.255.255.0",
    [string]$DomainName = "lab.local",
    [string]$NetBIOS = "LAB"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating DC01 VM for $DomainName" -ForegroundColor Cyan

if (-not (Test-Path $IsoPath)) {
    Write-Error "Windows Server ISO not found at: $IsoPath`nProvide a legitimate Windows Server ISO path."
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
$vm = New-VM -Name $VMName -Generation 2 -MemoryStartupBytes ($MemoryGB * 1GB) `
    -VHDPath $VHDPath -SwitchName $SwitchName -ProcessorCount $ProcessorCount

# Attach ISO
$dvddrive = Get-VMDvdDrive -VMName $VMName
if ($dvddrive) {
    Set-VMDvdDrive -VMName $VMName -Path $IsoPath
} else {
    Add-VMDvdDrive -VMName $VMName -Path $IsoPath
}

# Set boot order to DVD first
$vmFirmware = Get-VMFirmware -VMName $VMName
Set-VMFirmware -VMName $VMName -FirstBootDevice (Get-VMDvdDrive -VMName $VMName)

# Enable checkpoints
Set-VM -VMName $VMName -CheckpointType Enabled

Write-Host "VM '$VMName' created. Starting VM..." -ForegroundColor Green
Start-VM -Name $VMName

Write-Host ""
Write-Host "MANUAL STEPS REQUIRED (inside the VM console):" -ForegroundColor Yellow
Write-Host "  1. Install Windows Server (Desktop Experience recommended)" -ForegroundColor Yellow
Write-Host "  2. Set computer name to DC01" -ForegroundColor Yellow
Write-Host "  3. Set static IP: $StaticIP / $SubnetMask" -ForegroundColor Yellow
Write-Host "  4. Set DNS to 127.0.0.1 (will change after AD install)" -ForegroundColor Yellow
Write-Host "  5. Install AD DS + DNS roles" -ForegroundColor Yellow
Write-Host "  6. Promote to domain controller for $DomainName (NetBIOS: $NetBIOS)" -ForegroundColor Yellow
Write-Host "  7. Run 03-Build-ADStructure.ps1 after promotion" -ForegroundColor Yellow
Write-Host ""
Write-Host "Checkpoint after OS install:  Checkpoint-VM -VMName $VMName -Name 'POST-OS'" -ForegroundColor DarkGray
Write-Host "Checkpoint after AD install:  Checkpoint-VM -VMName $VMName -Name 'POST-AD'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Rollback: Stop-VM $VMName; Remove-VM $VMName -Force; Remove-Item '$VHDPath' -Force" -ForegroundColor DarkGray
