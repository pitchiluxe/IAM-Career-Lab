/**
 * Preflight: turns a real host probe into a build/no-build verdict.
 *
 * Every blocker below is derived from a value actually read off the machine.
 * If the host could not be inspected, `canBuildVMs` is null (unknown) — never
 * false-by-assumption and never true-by-assumption.
 */

import { probeHost, type HostProbe, type ProbeStatus } from "./host-probe";

/** Minimum host resources for DC01 + HD01 to coexist. */
export const LAB_REQUIREMENTS = {
  /** DC01 20GB dynamic + HD01 40GB dynamic, plus headroom for checkpoints. */
  freeDiskGB: 60,
  /** DC01 2GB + HD01 4GB + host headroom. */
  totalRamGB: 8,
  freeRamGB: 6,
  logicalProcessors: 4,
} as const;

export interface PreflightCheck {
  id: string;
  label: string;
  /** null = could not determine */
  passed: boolean | null;
  detail: string;
  blocking: boolean;
}

export interface PreflightResult {
  timestamp: string;
  host: HostProbe;
  checks: PreflightCheck[];
  /** null when the host could not be inspected. */
  canBuildVMs: boolean | null;
  blockers: string[];
  recommendations: string[];
  ollama: {
    available: boolean;
    models: string[];
    error?: string;
  };
}

function editionSupportsHyperV(caption: string): boolean | null {
  if (!caption || caption === "unknown") return null;
  if (/\bHome\b/i.test(caption)) return false;
  if (/\bPro\b|\bEnterprise\b|\bEducation\b|\bServer\b/i.test(caption)) return true;
  return null;
}

export function evaluateHost(host: HostProbe): {
  checks: PreflightCheck[];
  canBuildVMs: boolean | null;
  blockers: string[];
  recommendations: string[];
} {
  if (!host.probed) {
    return {
      checks: [],
      canBuildVMs: null,
      blockers: [],
      recommendations: [
        host.reason ?? "Host could not be inspected.",
        "Run 09-SCRIPTS/vm/00-Host-Preflight.ps1 in an elevated PowerShell window on your lab host to get the same report directly.",
      ],
    };
  }

  const checks: PreflightCheck[] = [];
  const edition = editionSupportsHyperV(host.os.caption);
  const biggestDisk = host.disk.reduce<number>((max, d) => Math.max(max, d.freeGB), 0);

  checks.push({
    id: "edition",
    label: "Windows edition supports Hyper-V",
    passed: edition,
    detail:
      edition === false
        ? `${host.os.caption} does not include Hyper-V. Pro, Enterprise, Education or Server is required.`
        : edition === true
          ? `${host.os.caption} includes the Hyper-V role.`
          : `Could not classify the edition string "${host.os.caption}".`,
    blocking: true,
  });

  // Win32_Processor's virtualization flags are famously unreliable: they report
  // False both when VT-x is genuinely off in firmware AND when a hypervisor
  // (Hyper-V, VBS/Credential Guard, WSL2, VirtualBox) has already claimed the
  // extensions. HypervisorPresent=True is positive proof they work, so it wins.
  // Because a False is ambiguous, these checks are advisory, never blocking —
  // telling someone to "enable VT-x in BIOS" when it is already on wastes a
  // reboot and destroys trust in every other check on this page.
  const virtProven = host.cpu.hypervisorPresent === true;
  checks.push({
    id: "virtualization",
    label: "CPU virtualization extensions",
    passed: virtProven ? true : host.cpu.virtualizationEnabled === true ? true : null,
    detail: virtProven
      ? "A hypervisor is already running on this machine, which proves Intel VT-x / AMD-V is enabled in firmware."
      : host.cpu.virtualizationEnabled === true
        ? "Firmware reports virtualization extensions are enabled."
        : "Win32_Processor reports VirtualizationFirmwareEnabled=False, but this flag is unreliable and also reads False when another hypervisor has claimed the CPU. Confirm in your BIOS/UEFI (Intel VT-x or AMD SVM Mode) before assuming it is off.",
    blocking: false,
  });

  checks.push({
    id: "slat",
    label: "SLAT (Second Level Address Translation)",
    passed: virtProven ? true : host.cpu.slat === true ? true : null,
    detail:
      host.cpu.slat === true || virtProven
        ? "SLAT is available."
        : "SLAT was not reported. Every Intel CPU since Nehalem (2008) and every AMD CPU since Barcelona supports it, so a False here almost always means the flag is masked rather than missing. Run `systeminfo` and read the Hyper-V Requirements section for a second opinion.",
    blocking: false,
  });

  checks.push({
    id: "hyperv-feature",
    label: "Hyper-V Windows feature enabled",
    passed: host.hyperV.available,
    detail: host.hyperV.note,
    blocking: true,
  });

  checks.push({
    id: "disk",
    label: `At least ${LAB_REQUIREMENTS.freeDiskGB} GB free disk`,
    passed: host.disk.length === 0 ? null : biggestDisk >= LAB_REQUIREMENTS.freeDiskGB,
    detail:
      host.disk.length === 0
        ? "No fixed disks reported."
        : `Largest free volume: ${biggestDisk} GB (DC01 ~20 GB + HD01 ~40 GB dynamic, plus checkpoint growth).`,
    blocking: true,
  });

  checks.push({
    id: "ram",
    label: `At least ${LAB_REQUIREMENTS.totalRamGB} GB total RAM`,
    passed: host.memory.totalGB === 0 ? null : host.memory.totalGB >= LAB_REQUIREMENTS.totalRamGB,
    detail: `Total ${host.memory.totalGB} GB, currently free ${host.memory.freeGB} GB. DC01 needs 2 GB and HD01 needs 4 GB running together.`,
    blocking: true,
  });

  checks.push({
    id: "cpu-cores",
    label: `At least ${LAB_REQUIREMENTS.logicalProcessors} logical processors`,
    passed: host.cpu.logicalProcessors === 0 ? null : host.cpu.logicalProcessors >= LAB_REQUIREMENTS.logicalProcessors,
    detail: `${host.cpu.logicalProcessors} logical processors detected.`,
    blocking: false,
  });

  checks.push({
    id: "hyperv-cmdlets",
    label: "Hyper-V PowerShell module available",
    passed: host.hyperV.cmdletsAvailable,
    detail: host.hyperV.cmdletsAvailable
      ? "Get-VM is available, so the provisioning scripts can run."
      : "Get-VM is not available. Install the Hyper-V Management Tools feature.",
    blocking: false,
  });

  const blocking = checks.filter((c) => c.blocking);
  const canBuildVMs = blocking.some((c) => c.passed === false)
    ? false
    : blocking.every((c) => c.passed === true)
      ? true
      : null;

  const blockers = blocking.filter((c) => c.passed === false).map((c) => c.detail);

  const recommendations: string[] = [];
  if (edition === false) {
    recommendations.push(
      "Upgrade to Windows 11 Pro, Enterprise or Education (Settings > System > Activation > Upgrade your edition of Windows), or run the lab on a spare machine that already has Pro. Hyper-V is the only blocker on this host that an upgrade fixes.",
    );
    if (host.alternativeHypervisors.length > 0) {
      recommendations.push(
        `No upgrade needed: ${host.alternativeHypervisors
          .map((h) => `${h.name} (${h.version})`)
          .join(", ")} is already installed on this machine. Build DC01 and HD01 there instead. Every lab exercise, the AD structure and all coursework are hypervisor-independent — only 09-SCRIPTS/vm/ is Hyper-V specific.`,
      );
    } else {
      recommendations.push(
        "No-upgrade alternative: install VirtualBox (free, and it works on Windows Home) and build DC01/HD01 there. Every lab exercise and the whole AD structure are hypervisor-independent — only 09-SCRIPTS/vm/ is Hyper-V specific.",
      );
    }
  }
  if (host.hyperV.available === false && edition !== false) {
    recommendations.push(
      "Enable Hyper-V: run `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All` in an elevated PowerShell, then reboot.",
    );
  }
  if (host.disk.length > 0 && biggestDisk < LAB_REQUIREMENTS.freeDiskGB) {
    recommendations.push(
      `Free at least ${LAB_REQUIREMENTS.freeDiskGB - Math.floor(biggestDisk)} GB more, or attach an external SSD and point the VM path there (every provisioning script accepts a -VMPath parameter).`,
    );
  }
  if (host.memory.totalGB > 0 && host.memory.totalGB < LAB_REQUIREMENTS.totalRamGB) {
    recommendations.push("Run DC01 and HD01 one at a time rather than together, or add RAM.");
  }
  if (canBuildVMs === true) {
    recommendations.push("Host is ready. Start with 09-SCRIPTS/vm/01-New-LabSwitch.ps1 in an elevated PowerShell.");
  }

  return { checks, canBuildVMs, blockers, recommendations };
}

export async function runPreflight(ollama: { available: boolean; models: string[]; error?: string }): Promise<PreflightResult> {
  const host = await probeHost();
  const { checks, canBuildVMs, blockers, recommendations } = evaluateHost(host);

  if (!ollama.available) {
    recommendations.push("Install Ollama from https://ollama.com, then run `ollama serve` and `ollama pull llama3.1` to bring the tutor online.");
  }

  return {
    timestamp: new Date().toISOString(),
    host,
    checks,
    canBuildVMs,
    blockers,
    recommendations,
    ollama,
  };
}

export type { HostProbe, ProbeStatus };
