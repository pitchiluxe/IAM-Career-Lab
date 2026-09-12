<#
.SYNOPSIS
    IAM Career Lab — VM checkpoint management
.DESCRIPTION
    Manages VM checkpoints at clean milestones. Checkpoints are NOT backups.
.NOTES
    Purpose:     Create, list, and restore VM checkpoints
    Prerequisites: Hyper-V, VMs created
    Permissions: Administrator
    Safe-use:    Creates checkpoints; restoring reverts VM state (destructive to current state)
    Rollback:    Restore-VMSnapshot reverts to checkpoint state
    Validation:  Get-VMSnapshot
#>

[CmdletBinding()]
param(
    [string[]]$VMNames = @("DC01", "HD01", "FS01"),
    [ValidateSet("Create", "List", "Restore")]
    [string]$Action = "List",
    [string]$CheckpointName = ""
)

$ErrorActionPreference = "Stop"

$standardCheckpoints = @{
    "POST-OS"           = "After OS installation"
    "POST-AD"           = "After AD DS promotion"
    "POST-AD-STRUCTURE" = "After OUs/users/groups/GPOs created"
    "POST-DOMAIN-JOIN"  = "After client domain join"
    "POST-GPO"          = "After GPO configuration"
    "PRE-CAPSTONE"      = "Before capstone assessment"
}

switch ($Action) {
    "List" {
        foreach ($vmName in $VMNames) {
            $vm = Get-VM -Name $vmName -ErrorAction SilentlyContinue
            if (-not $vm) { continue }
            Write-Host "VM: $vmName (State: $($vm.State))" -ForegroundColor Cyan
            $snapshots = Get-VMSnapshot -VMName $vmName -ErrorAction SilentlyContinue
            if ($snapshots) {
                $snapshots | Format-Table Name, CreationTime, ParentSnapshotName -AutoSize
            } else {
                Write-Host "  No checkpoints." -ForegroundColor DarkGray
            }
        }
        Write-Host ""
        Write-Host "Standard checkpoint names:" -ForegroundColor Cyan
        foreach ($k in $standardCheckpoints.Keys) {
            Write-Host "  $k — $($standardCheckpoints[$k])" -ForegroundColor White
        }
    }

    "Create" {
        if (-not $CheckpointName) {
            Write-Host "Available checkpoint names:" -ForegroundColor Yellow
            foreach ($k in $standardCheckpoints.Keys) {
                Write-Host "  $k — $($standardCheckpoints[$k])" -ForegroundColor White
            }
            $CheckpointName = Read-Host "Enter checkpoint name"
        }
        foreach ($vmName in $VMNames) {
            $vm = Get-VM -Name $vmName -ErrorAction SilentlyContinue
            if (-not $vm) { continue }
            $existing = Get-VMSnapshot -VMName $vmName -Name $CheckpointName -ErrorAction SilentlyContinue
            if ($existing) {
                Write-Host "Checkpoint '$CheckpointName' already exists for $vmName" -ForegroundColor DarkGray
            } else {
                Checkpoint-VM -VMName $vmName -Name $CheckpointName
                Write-Host "Created checkpoint '$CheckpointName' for $vmName" -ForegroundColor Green
            }
        }
    }

    "Restore" {
        if (-not $CheckpointName) { Write-Error "CheckpointName required for Restore"; return }
        foreach ($vmName in $VMNames) {
            $vm = Get-VM -Name $vmName -ErrorAction SilentlyContinue
            if (-not $vm) { continue }
            $snap = Get-VMSnapshot -VMName $vmName -Name $CheckpointName -ErrorAction SilentlyContinue
            if ($snap) {
                if ($vm.State -ne "Off") {
                    Write-Host "Stopping $vmName before restore..." -ForegroundColor Yellow
                    Stop-VM -VMName $vmName -Force
                }
                Restore-VMSnapshot -VMName $vmName -Name $CheckpointName -Confirm:$false
                Write-Host "Restored $vmName to checkpoint '$CheckpointName'" -ForegroundColor Green
            } else {
                Write-Host "Checkpoint '$CheckpointName' not found for $vmName" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "NOTE: Checkpoints are NOT backups. Use them for lab state management only." -ForegroundColor Yellow
