<#
.SYNOPSIS
    IAM Career Lab — Build AD structure (OUs, users, groups, GPOs)
.DESCRIPTION
    Creates the IAM Career Lab OU structure, synthetic users, groups, and baseline GPOs
    on the lab.local domain. Run from DC01 or a domain-joined admin workstation.
.NOTES
    Purpose:     Populate AD with lab data for training
    Prerequisites: DC01 promoted to domain controller for lab.local
    Permissions: Domain Admin
    Safe-use:    Creates OUs/users/groups in the domain; does not modify existing infrastructure
    Rollback:    Remove-ADOrganizationalUnit -Recursive on created OUs
    Validation:   Get-ADUser, Get-ADGroup, Get-ADOrganizationalUnit
#>

[CmdletBinding()]
param(
    [string]$DomainDN = "DC=omari,DC=local",
    [string]$DomainName = "lab.local"
)

$ErrorActionPreference = "Stop"

Write-Host "Building IAM Career Lab AD structure on $DomainName" -ForegroundColor Cyan

# --- OUs ---
$ouNames = @("Users", "Groups", "Workstations", "Servers", "HelpDesk", "IAM", "Privileged", "Disabled", "ServiceAccounts")
$ouChildren = @{
    "Users" = @("Corporate", "HelpDesk", "IAM", "Engineering", "Executives")
}

foreach ($ou in $ouNames) {
    $ouDN = "OU=$ou,$DomainDN"
    if (-not (Get-ADOrganizationalUnit -Filter "DistinguishedName -eq '$ouDN'" -ErrorAction SilentlyContinue)) {
        New-ADOrganizationalUnit -Name $ou -Path $DomainDN
        Write-Host "  Created OU: $ou" -ForegroundColor Green
    } else {
        Write-Host "  OU exists: $ou" -ForegroundColor DarkGray
    }
}

foreach ($parent in $ouChildren.Keys) {
    $parentDN = "OU=$parent,$DomainDN"
    foreach ($child in $ouChildren[$parent]) {
        $childDN = "OU=$child,$parentDN"
        if (-not (Get-ADOrganizationalUnit -Filter "DistinguishedName -eq '$childDN'" -ErrorAction SilentlyContinue)) {
            New-ADOrganizationalUnit -Name $child -Path $parentDN
            Write-Host "  Created child OU: $parent\$child" -ForegroundColor Green
        }
    }
}

# --- Groups ---
$groups = @(
    @{Name="GG-HelpDesk"; Desc="Help desk technicians"},
    @{Name="GG-IAM-Analysts"; Desc="IAM analysts"},
    @{Name="GG-Engineering"; Desc="Engineering staff"},
    @{Name="GG-Finance"; Desc="Finance staff"},
    @{Name="GG-HR"; Desc="HR staff"},
    @{Name="GG-Executives"; Desc="Executive leadership"},
    @{Name="GG-VPN-Users"; Desc="VPN users"},
    @{Name="GG-File-Read"; Desc="Read access to file shares"},
    @{Name="GG-File-Modify"; Desc="Modify access to file shares"}
)

$groupsOU = "OU=Groups,$DomainDN"
foreach ($g in $groups) {
    if (-not (Get-ADGroup -Filter "Name -eq '$($g.Name)'" -ErrorAction SilentlyContinue)) {
        New-ADGroup -Name $g.Name -Description $g.Desc -GroupCategory Security -GroupScope Global -Path $groupsOU
        Write-Host "  Created group: $($g.Name)" -ForegroundColor Green
    } else {
        Write-Host "  Group exists: $($g.Name)" -ForegroundColor DarkGray
    }
}

# --- Users (synthetic) ---
$users = @(
    @{Name="Alice Johnson"; Sam="a.johnson"; Dept="Finance"; Role="Financial Analyst"; OU="Corporate"; Groups=@("GG-Finance","GG-File-Read")},
    @{Name="Brian Smith"; Sam="b.smith"; Dept="HR"; Role="HR Specialist"; OU="Corporate"; Groups=@("GG-HR","GG-File-Read")},
    @{Name="Carol Williams"; Sam="c.williams"; Dept="Help Desk"; Role="Help Desk Technician"; OU="HelpDesk"; Groups=@("GG-HelpDesk","GG-File-Modify")},
    @{Name="Daniel Brown"; Sam="d.brown"; Dept="Engineering"; Role="Software Engineer"; OU="Engineering"; Groups=@("GG-Engineering","GG-File-Modify")},
    @{Name="Elena Davis"; Sam="e.davis"; Dept="IAM"; Role="IAM Analyst"; OU="IAM"; Groups=@("GG-IAM-Analysts","GG-File-Read")},
    @{Name="Frank Miller"; Sam="f.miller"; Dept="Executive"; Role="CIO"; OU="Executives"; Groups=@("GG-Executives","GG-File-Read")}
)

foreach ($u in $users) {
    $userOU = "OU=$($u.OU),OU=Users,$DomainDN"
    if (-not (Get-ADUser -Filter "SamAccountName -eq '$($u.Sam)'" -ErrorAction SilentlyContinue)) {
        $parts = $u.Name -split " "
        New-ADUser -Name $u.Name -GivenName $parts[0] -Surname $parts[1] -SamAccountName $u.Sam `
            -UserPrincipalName "$($u.Sam)@$DomainName" -Department $u.Dept -Title $u.Role `
            -Path $userOU -AccountPassword (ConvertTo-SecureString "OmariLab!2024" -AsPlainText -Force) `
            -Enabled $true -ChangePasswordAtLogon $true
        Write-Host "  Created user: $($u.Name) ($($u.Sam))" -ForegroundColor Green
        foreach ($grp in $u.Groups) {
            Add-ADGroupMember -Identity $grp -Members $u.Sam
        }
        Write-Host "    Added to groups: $($u.Groups -join ', ')" -ForegroundColor DarkGray
    } else {
        Write-Host "  User exists: $($u.Name)" -ForegroundColor DarkGray
    }
}

# --- Baseline GPOs ---
$gpoNames = @("Password Policy", "Account Lockout", "Workstation Security Baseline", "Screen Lock", "Windows Firewall", "Audit Policy")
foreach ($gpoName in $gpoNames) {
    if (-not (Get-GPO -Name $gpoName -ErrorAction SilentlyContinue)) {
        New-GPO -Name $gpoName | Out-Null
        Write-Host "  Created GPO: $gpoName" -ForegroundColor Green
    } else {
        Write-Host "  GPO exists: $gpoName" -ForegroundColor DarkGray
    }
}

# Link password policy and account lockout to domain root
$domainDN = $DomainDN
foreach ($gpoName in @("Password Policy", "Account Lockout")) {
    $gpo = Get-GPO -Name $gpoName
    $linked = Get-GPInheritance -Target $domainDN | Select-Object -ExpandProperty GpoLinks
    if (-not ($linked | Where-Object { $_.DisplayName -eq $gpoName })) {
        New-GPLink -Name $gpoName -Target $domainDN | Out-Null
        Write-Host "  Linked GPO: $gpoName to domain root" -ForegroundColor Green
    }
}

# Link workstation GPOs to Workstations OU
$workstationsOU = "OU=Workstations,$DomainDN"
foreach ($gpoName in @("Workstation Security Baseline", "Screen Lock", "Windows Firewall", "Audit Policy")) {
    $gpo = Get-GPO -Name $gpoName -ErrorAction SilentlyContinue
    if ($gpo) {
        $linked = Get-GPInheritance -Target $workstationsOU -ErrorAction SilentlyContinue | Select-Object -ExpandProperty GpoLinks
        if (-not ($linked | Where-Object { $_.DisplayName -eq $gpoName })) {
            New-GPLink -Name $gpoName -Target $workstationsOU | Out-Null
            Write-Host "  Linked GPO: $gpoName to Workstations OU" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "AD structure build complete." -ForegroundColor Cyan
Write-Host "Validation: Get-ADUser -Filter * | Format-Table Name, SamAccountName, Department" -ForegroundColor DarkGray
Write-Host "Validation: Get-ADGroup -Filter * | Format-Table Name" -ForegroundColor DarkGray
Write-Host "Validation: Get-GPO -Name 'Password Policy'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Checkpoint: Checkpoint-VM -VMName DC01 -Name 'POST-AD-STRUCTURE'" -ForegroundColor DarkGray
