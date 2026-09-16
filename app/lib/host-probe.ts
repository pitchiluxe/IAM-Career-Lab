/**
 * Real host inspection. Server-only.
 *
 * This module never fabricates host data. It either returns values actually
 * read from the machine the Next.js server process is running on, or it
 * returns `probed: false` with the reason it could not look.
 *
 * Context matters: when this app is deployed to Vercel the server runs in a
 * Linux container, NOT on the learner's Windows host. Reporting that
 * container's CPU/RAM as "your lab host" would be a lie, so we detect the
 * hosted case and refuse to report.
 */

import { execFile } from "node:child_process";
import os from "node:os";

export type ProbeStatus = "ok" | "not-windows" | "hosted" | "powershell-failed" | "timeout";

export interface HostProbe {
  probed: boolean;
  status: ProbeStatus;
  reason?: string;
  probedAt: string;
  os: { caption: string; version: string; architecture: string };
  cpu: {
    name: string;
    logicalProcessors: number;
    /** Win32_Processor flag. Unreliable — see `hypervisorPresent`. */
    virtualizationEnabled: boolean | null;
    slat: boolean | null;
    /**
     * Win32_ComputerSystem.HypervisorPresent. If true, a hypervisor is already
     * running on this machine, which PROVES the firmware virtualization
     * extensions are enabled regardless of what the flags above claim.
     */
    hypervisorPresent: boolean | null;
  };
  memory: { totalGB: number; freeGB: number };
  disk: { drive: string; totalGB: number; freeGB: number }[];
  hyperV: { available: boolean | null; cmdletsAvailable: boolean; featureState: string | null; note: string };
  vms: { name: string; state: string }[];
  switches: { name: string; type: string }[];
  /** Third-party hypervisors found on the host — an alternative path to the labs. */
  alternativeHypervisors: { name: string; version: string }[];
}

const PROBE_TIMEOUT_MS = 20_000;

/**
 * One PowerShell round-trip that emits a single JSON object. Running one
 * process instead of six keeps the page fast and keeps the parse surface
 * small. -NoProfile stops a slow user profile from eating the timeout.
 */
const PROBE_SCRIPT = `
$ErrorActionPreference = 'SilentlyContinue'
$os  = Get-CimInstance Win32_OperatingSystem
$cs  = Get-CimInstance Win32_ComputerSystem
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"

# Third-party hypervisors give a working path to the labs on editions that
# have no Hyper-V (Windows Home), so it is worth knowing whether one is here.
$alt = @()
foreach ($probe in @(
  @{ name = 'VirtualBox'; cmd = 'VBoxManage.exe'; args = @('--version') },
  @{ name = 'VMware Workstation'; cmd = 'vmrun.exe'; args = @() }
)) {
  $found = Get-Command $probe.cmd -ErrorAction SilentlyContinue
  if ($found) {
    $ver = 'installed'
    try { if ($probe.args.Count -gt 0) { $ver = (& $found.Source $probe.args 2>$null | Select-Object -First 1) } } catch {}
    $alt += @{ name = $probe.name; version = [string]$ver }
  }
}

$feature = $null
try { $feature = (Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction Stop).State } catch { $feature = $null }
$hasVmCmdlet = $null -ne (Get-Command Get-VM -ErrorAction SilentlyContinue)

$vms = @()
$switches = @()
if ($hasVmCmdlet) {
  $vms = @(Get-VM | ForEach-Object { @{ name = $_.Name; state = [string]$_.State } })
  $switches = @(Get-VMSwitch | ForEach-Object { @{ name = $_.Name; type = [string]$_.SwitchType } })
}

[PSCustomObject]@{
  os = @{
    caption      = [string]$os.Caption
    version      = [string]$os.Version
    architecture = [string]$os.OSArchitecture
  }
  cpu = @{
    name                  = [string]$cpu.Name
    logicalProcessors     = [int]$cpu.NumberOfLogicalProcessors
    virtualizationEnabled = [bool]$cpu.VirtualizationFirmwareEnabled
    slat                  = [bool]$cpu.SecondLevelAddressTranslationExtensions
    hypervisorPresent     = [bool]$cs.HypervisorPresent
  }
  memory = @{
    totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
    freeGB  = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
  }
  disk = @($disks | ForEach-Object {
    @{
      drive  = [string]$_.DeviceID
      totalGB = [math]::Round($_.Size / 1GB, 1)
      freeGB  = [math]::Round($_.FreeSpace / 1GB, 1)
    }
  })
  hyperV = @{
    featureState     = $feature
    cmdletsAvailable = $hasVmCmdlet
  }
  vms = $vms
  switches = $switches
  alternativeHypervisors = $alt
} | ConvertTo-Json -Depth 5 -Compress
`;

function emptyProbe(status: ProbeStatus, reason: string): HostProbe {
  return {
    probed: false,
    status,
    reason,
    probedAt: new Date().toISOString(),
    os: { caption: "unknown", version: "unknown", architecture: "unknown" },
    cpu: { name: "unknown", logicalProcessors: 0, virtualizationEnabled: null, slat: null, hypervisorPresent: null },
    memory: { totalGB: 0, freeGB: 0 },
    disk: [],
    hyperV: { available: null, cmdletsAvailable: false, featureState: null, note: reason },
    vms: [],
    switches: [],
    alternativeHypervisors: [],
  };
}

function runPowerShell(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // powershell.exe (5.1) ships with every Windows install; pwsh may not.
    const child = execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
      { timeout: PROBE_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, windowsHide: true },
      (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout);
      },
    );
    child.on("error", reject);
  });
}

/** True when this server process is NOT running on the learner's own machine. */
export function isHostedDeployment(): boolean {
  return Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function probeHost(): Promise<HostProbe> {
  if (isHostedDeployment()) {
    return emptyProbe(
      "hosted",
      "This instance is running on a hosted server, not on your computer. Host inspection is only possible in the desktop app or when you run the platform locally with 'npm run dev'.",
    );
  }

  if (os.platform() !== "win32") {
    return emptyProbe(
      "not-windows",
      `Host inspection requires Windows (detected platform: ${os.platform()}). Hyper-V labs are Windows-only.`,
    );
  }

  let stdout: string;
  try {
    stdout = await runPowerShell(PROBE_SCRIPT);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status: ProbeStatus = /timed? ?out|ETIMEDOUT/i.test(msg) ? "timeout" : "powershell-failed";
    return emptyProbe(status, `Could not run the PowerShell host probe: ${msg}`);
  }

  let raw: any;
  try {
    raw = JSON.parse(stdout);
  } catch {
    return emptyProbe("powershell-failed", "The host probe returned output that could not be parsed as JSON.");
  }

  // ConvertTo-Json collapses a single-element array to a bare object.
  const asArray = <T,>(v: T | T[] | null | undefined): T[] =>
    v == null ? [] : Array.isArray(v) ? v : [v];

  const featureState: string | null = raw.hyperV?.featureState ?? null;
  const cmdletsAvailable = Boolean(raw.hyperV?.cmdletsAvailable);

  return {
    probed: true,
    status: "ok",
    probedAt: new Date().toISOString(),
    os: {
      caption: raw.os?.caption || "unknown",
      version: raw.os?.version || "unknown",
      architecture: raw.os?.architecture || "unknown",
    },
    cpu: {
      name: raw.cpu?.name || "unknown",
      logicalProcessors: Number(raw.cpu?.logicalProcessors) || os.cpus().length,
      virtualizationEnabled: typeof raw.cpu?.virtualizationEnabled === "boolean" ? raw.cpu.virtualizationEnabled : null,
      slat: typeof raw.cpu?.slat === "boolean" ? raw.cpu.slat : null,
      hypervisorPresent: typeof raw.cpu?.hypervisorPresent === "boolean" ? raw.cpu.hypervisorPresent : null,
    },
    memory: {
      totalGB: Number(raw.memory?.totalGB) || 0,
      freeGB: Number(raw.memory?.freeGB) || 0,
    },
    disk: asArray<any>(raw.disk).map((d) => ({
      drive: String(d.drive),
      totalGB: Number(d.totalGB) || 0,
      freeGB: Number(d.freeGB) || 0,
    })),
    hyperV: {
      // "Enabled" is the only state that means the hypervisor is actually on.
      available: featureState === null ? null : featureState === "Enabled",
      cmdletsAvailable,
      featureState,
      note:
        featureState === null
          ? "Hyper-V feature state could not be queried. This usually means the platform is not running elevated, or the Windows edition does not offer Hyper-V (Home editions do not)."
          : `Hyper-V optional feature state: ${featureState}.`,
    },
    vms: asArray<any>(raw.vms).map((v) => ({ name: String(v.name), state: String(v.state) })),
    switches: asArray<any>(raw.switches).map((s) => ({ name: String(s.name), type: String(s.type) })),
    alternativeHypervisors: asArray<any>(raw.alternativeHypervisors).map((h) => ({
      name: String(h.name),
      version: String(h.version ?? "installed").trim(),
    })),
  };
}
