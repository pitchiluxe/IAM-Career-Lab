<#
.SYNOPSIS
    IAM Career Lab — Create FS01 file server VM (optional)
.DESCRIPTION
    Creates the FS01 file server VM for permissions, shares, NTFS, and access-control labs.
    Requires legitimate Windows Server installation media (ISO). Does NOT pirate or bypass licensing.
.NOTES
    Purpose:     File server for permissions and share labs
    Prerequisites: Hyper-V, lab switch, DC01 running with AD DS
    Permissions: Administrator
    Safe-use:    Creates one file server VM on isolated network
    Rollback:    Stop-VM FS01; Remove-VM FS01 -Force; Remove-Item VM disk
    Validation:  Get-VM FS01; share access test
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$IsoPath,
    [string]$VMName = "FS01",
    [string]$SwitchName = "Lab-Net",
    [int64]$MemoryGB = 2,
    [int]$ProcessorCount = 2,
    [int64]$DiskGB = 30,
    [string]$VHDPath = "$env:USERPROFILE\HyperV\FS01\FS01.vhdx",
    [string]$StaticIP = "10.10.10.20",
    [string]$SubnetMask = "255.255.255.0",
    [string]$DNSServer = "10.10.10.10",
    [string]$DomainName = "lab.local"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating FS01 file server VM for $DomainName" -ForegroundColor Cyan

if (-not (Test-Path $IsoPath)) {
    Write-Error "Windows Server ISO not found at: $IsoPath`nProvide a legitimate Windows Server ISO path."
    return
}

$existing = Get-VM -Name $VMName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "VM '$VMName' already exists. No action needed." -ForegroundColor Green
    return
}

$vmDir = Split-Path $VHDPath -Parent
if (-not (Test-Path $vmDir)) { New-Item -ItemType Directory -Path $vmDir -Force | Out-Null }

New-VHD -Path $VHDPath -SizeBytes ($DiskGB * 1GB) -Dynamic -Generation 2 | Out-Null
New-VM -Name $VMName -Generation 2 -MemoryStartupBytes ($MemoryGB * 1GB) `
    -VHDPath $VHDPath -SwitchName $SwitchName -ProcessorCount $ProcessorCount | Out-Null

Add-VMDvdDrive -VMName $VMName -Path $IsoPath
Set-VMFirmware -VMName $VMName -FirstBootDevice (Get-VMDvdDrive -VMName $VMName)
Set-VM -VMName $VMName -CheckpointType Enabled

Start-VM -Name $VMName

Write-Host ""
Write-Host "MANUAL STEPS REQUIRED (inside the VM console):" -ForegroundColor Yellow
Write-Host "  1. Install Windows Server (Desktop Experience)" -ForegroundColor Yellow
Write-Host "  2. Set computer name to FS01" -ForegroundColor Yellow
Write-Host "  3. Set static IP: $StaticIP / $SubnetMask" -ForegroundColor Yellow
Write-Host "  4. Set DNS to $DNSServer (DC01)" -ForegroundColor Yellow
Write-Host "  5. Join domain: $DomainName" -ForegroundColor Yellow
Write-Host "  6. Create shared folders with NTFS permissions for labs:" -ForegroundColor Yellow
Write-Host "     - \\FS01\Finance (GG-Finance: Modify)" -ForegroundColor Yellow
Write-Host "     - \\FS01\Engineering (GG-Engineering: Modify)" -ForegroundColor Yellow
Write-Host "     - \\FS01\Public (GG-File-Read: Read)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Checkpoint: Checkpoint-VM -VMName $VMName -Name 'POST-SETUP'" -ForegroundColor DarkGray
Write-Host "Rollback: Stop-VM $VMName; Remove-VM $VMName -Force; Remove-Item '$VHDPath' -Force" -ForegroundColor DarkGray
