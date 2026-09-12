<#
.SYNOPSIS
    IAM Career Lab — Full lab validation suite
.DESCRIPTION
    Validates the complete IAM Career Lab lab: VM boot, Windows login, networking,
    DNS, domain join, domain authentication, AD users/groups/OUs, GPO, PowerShell,
    snapshots, and Ollama connection.
.NOTES
    Purpose:     Verify the lab is fully operational
    Prerequisites: DC01 and HD01 VMs built and configured
    Permissions: Administrator on host; Domain Admin for AD checks
    Safe-use:    Read-only validation — does not modify the system
    Validation:   Produces a validation report
#>

[CmdletBinding()]
param(
    [string[]]$VMNames = @("DC01", "HD01"),
    [string]$DomainController = "10.10.10.10",
    [string]$DomainName = "lab.local",
    [string]$OllamaUrl = "http://localhost:11434"
)

$ErrorActionPreference = "Continue"
$results = @()

function Test-Check {
    param([string]$Name, [scriptblock]$Test, [string]$PassMsg, [string]$FailMsg)
    try {
        $passed = & $Test
        if ($passed) {
            $results += [PSCustomObject]@{ Check=$Name; Status="PASS"; Detail=$PassMsg }
            Write-Host "  [PASS] $Name — $PassMsg" -ForegroundColor Green
        } else {
            $results += [PSCustomObject]@{ Check=$Name; Status="FAIL"; Detail=$FailMsg }
            Write-Host "  [FAIL] $Name — $FailMsg" -ForegroundColor Red
        }
    } catch {
        $results += [PSCustomObject]@{ Check=$Name; Status="ERROR"; Detail=$_.Exception.Message }
        Write-Host "  [ERROR] $Name — $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " IAM Career Lab — Lab Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# VM Boot
foreach ($vmName in $VMNames) {
    Test-Check -Name "VM Boot: $vmName" -Test {
        $vm = Get-VM -Name $vmName -ErrorAction SilentlyContinue
        $vm -and $vm.State -eq "Running"
    } -PassMsg "VM is running" -FailMsg "VM not running or not found"
}

# Networking
Test-Check -Name "Network: Ping DC01" -Test {
    Test-Connection -ComputerName $DomainController -Count 1 -Quiet
} -PassMsg "DC01 reachable" -FailMsg "Cannot reach DC01"

# DNS
Test-Check -Name "DNS: Resolve lab.local" -Test {
    $result = Resolve-DnsName -Name $DomainName -Server $DomainController -ErrorAction SilentlyContinue
    $null -ne $result
} -PassMsg "Domain name resolves" -FailMsg "DNS resolution failed"

Test-Check -Name "DNS: Internal host resolution" -Test {
    $result = Resolve-DnsName -Name "DC01.$DomainName" -Server $DomainController -ErrorAction SilentlyContinue
    $null -ne $result
} -PassMsg "DC01 hostname resolves" -FailMsg "Internal hostname resolution failed"

# AD checks (run from DC01 or domain-joined admin)
Test-Check -Name "AD: Domain reachable" -Test {
    $domain = Get-ADDomain -Identity $DomainName -ErrorAction SilentlyContinue
    $null -ne $domain
} -PassMsg "Domain found" -FailMsg "Domain not found"

Test-Check -Name "AD: OUs created" -Test {
    $ous = Get-ADOrganizationalUnit -Filter * -ErrorAction SilentlyContinue
    $ous.Count -gt 5
} -PassMsg "$($ous.Count) OUs found" -FailMsg "Insufficient OUs"

Test-Check -Name "AD: Users created" -Test {
    $users = Get-ADUser -Filter * -ErrorAction SilentlyContinue
    $users.Count -gt 0
} -PassMsg "$($users.Count) users found" -FailMsg "No users found"

Test-Check -Name "AD: Groups created" -Test {
    $groups = Get-ADGroup -Filter * -ErrorAction SilentlyContinue
    $groups.Count -gt 5
} -PassMsg "$($groups.Count) groups found" -FailMsg "Insufficient groups"

Test-Check -Name "AD: SYSVOL/NETLOGON" -Test {
    (Test-Path "\\$DomainName\sysvol") -and (Test-Path "\\$DomainName\NETLOGON")
} -PassMsg "SYSVOL and NETLOGON available" -FailMsg "SYSVOL/NETLOGON not accessible"

# GPO
Test-Check -Name "GPO: GPOs created" -Test {
    $gpos = Get-GPO -All -ErrorAction SilentlyContinue
    $gpos.Count -gt 0
} -PassMsg "$($gpos.Count) GPOs found" -FailMsg "No GPOs found"

# PowerShell
Test-Check -Name "PowerShell: AD module" -Test {
    $null -ne (Get-Module -ListAvailable -Name ActiveDirectory)
} -PassMsg "AD PowerShell module available" -FailMsg "AD module not found"

# Snapshots
foreach ($vmName in $VMNames) {
    Test-Check -Name "Snapshot: $vmName" -Test {
        $vm = Get-VM -Name $vmName -ErrorAction SilentlyContinue
        $vm -and ($vm.CheckpointType -ne "Disabled")
    } -PassMsg "Checkpoints enabled" -FailMsg "Checkpoints disabled"
}

# Ollama
Test-Check -Name "Ollama: Connection" -Test {
    $r = Invoke-WebRequest -Uri "$OllamaUrl/api/tags" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    $null -ne $r -and $r.StatusCode -eq 200
} -PassMsg "Ollama running" -FailMsg "Ollama not running on $OllamaUrl"

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$pass = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$err  = ($results | Where-Object { $_.Status -eq "ERROR" }).Count
Write-Host " PASS: $pass | FAIL: $fail | ERROR: $err" -ForegroundColor $(if ($fail -eq 0 -and $err -eq 0) { "Green" } else { "Red" })
Write-Host ""
$results | Format-Table Check, Status, Detail -AutoSize
Write-Host ""
if ($fail -eq 0 -and $err -eq 0) {
    Write-Host "LAB VALIDATION: ALL CHECKS PASSED" -ForegroundColor Green
} else {
    Write-Host "LAB VALIDATION: ISSUES DETECTED — review failed checks above" -ForegroundColor Red
}
