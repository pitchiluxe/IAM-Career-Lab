# SCRIPTS

Validated automation for the OMARI Technologies lab.

Recommended categories:
- host readiness
- Hyper-V
- AD provisioning
- GPO validation
- ticket generation
- evidence collection
- IAM lifecycle automation
- API clients
- reports

Scripts must include:
- purpose
- prerequisites
- parameters
- permissions
- safe-use warning
- validation
- rollback where applicable

Never embed credentials. Take passwords as a `[SecureString]` parameter marked
`[Parameter(Mandatory = $true)]` with **no default**, so PowerShell prompts for
the value and it never lands in the file, the repository, or shell history.

## PowerShell files must be ASCII-only

Do not put em-dashes (`—`), en-dashes (`–`), curly quotes (`“ ” ‘ ’`), ellipses
(`…`) or non-breaking spaces in a `.ps1` file. Use `-`, `"`, `'` and `...`.

This is not a style preference. These files are UTF-8 without a BOM. Windows
PowerShell 5.1 — which is what ships with Windows and what every learner will
actually run — assumes the ANSI codepage when a file has no BOM, so the UTF-8
bytes for an em-dash (`E2 80 94`) decode as `â€”`. That trailing character is
`”` (U+201D), and **the PowerShell parser accepts curly quotes as string
delimiters**. A decorative dash inside a `Write-Host` string therefore closes
the string early and every brace and quote after it parses as garbage.

Four of the eight VM scripts in `vm/` were completely unrunnable for exactly
this reason. The failure is invisible in Git, in VS Code, and in `pwsh` 7
(which defaults to UTF-8) — it only appears on the machine that matters.

Verify before committing:

```powershell
Get-ChildItem 09-SCRIPTS -Recurse -Filter *.ps1 | ForEach-Object {
    $errors = $null
    [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errors) | Out-Null
    $nonAscii = (Get-Content $_.FullName -Raw).ToCharArray() | Where-Object { [int]$_ -gt 127 }
    if ($errors.Count -or $nonAscii) {
        Write-Host "FAIL $($_.Name) - $($errors.Count) parse error(s), $($nonAscii.Count) non-ASCII char(s)" -ForegroundColor Red
    } else {
        Write-Host "OK   $($_.Name)" -ForegroundColor Green
    }
}
```

## VM build order

Run from an elevated PowerShell on the lab host, in order:

| Script | Purpose |
| --- | --- |
| `vm/00-Host-Preflight.ps1` | Read-only host discovery and readiness report |
| `vm/01-New-LabSwitch.ps1` | Create the isolated Hyper-V private switch |
| `vm/02-New-DC01.ps1` | Create DC01, install Windows Server, promote to DC |
| `vm/03-Build-ADStructure.ps1` | OUs, groups, synthetic users and baseline GPOs |
| `vm/04-New-HD01.ps1` | Create HD01 Windows 11 client and domain-join it |
| `vm/05-New-FS01.ps1` | Optional file server for NTFS/share permission labs |
| `vm/06-Manage-Checkpoints.ps1` | Checkpoint create / restore / list |
| `vm/07-Validate-Lab.ps1` | Full validation suite |

Windows installation media is never distributed with this project. Supply your
own legally obtained ISO and licence.
