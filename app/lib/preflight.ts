export interface PreflightResult {
  timestamp: string;
  os: {
    caption: string;
    version: string;
    architecture: string;
  };
  cpu: {
    name: string;
    logicalProcessors: number;
    virtualizationEnabled: boolean;
    slat: boolean;
  };
  memory: {
    totalGB: number;
    freeGB: number;
  };
  disk: {
    drive: string;
    totalGB: number;
    freeGB: number;
  }[];
  hyperV: {
    available: boolean;
    cmdletsAvailable: boolean;
    note: string;
  };
  ollama: {
    available: boolean;
    models: string[];
    error?: string;
  };
  vmRequirements: {
    canBuildVMs: boolean;
    blockers: string[];
    recommendations: string[];
  };
}

export const PREFLIGHT_BLOCKERS_HOST = [
  "Windows 11 Home does not support Hyper-V natively (requires Pro/Enterprise/Education)",
  "CPU virtualization is disabled in firmware (VirtualizationFirmwareEnabled=False)",
  "SLAT (Second Level Address Translation) is not available",
  "Insufficient free disk space for VM disk images (need ~60GB+ free, only ~27GB available)",
];

export const PREFLIGHT_RECOMMENDATIONS = [
  "Upgrade to Windows 11 Pro, Enterprise, or Education for Hyper-V support",
  "Enable CPU virtualization in BIOS/UEFI firmware settings",
  "Free up disk space to at least 60GB for DC01 + HD01 VM disk images",
  "Install Ollama from https://ollama.com and run 'ollama serve' to enable the tutor",
  "Ensure at least 8GB RAM is free for VM allocation (DC01: 2GB, HD01: 4GB recommended)",
];

export function createPreflightResult(): PreflightResult {
  return {
    timestamp: new Date().toISOString(),
    os: {
      caption: "Microsoft Windows 11 Home Insider Preview",
      version: "10.0.26340",
      architecture: "64-bit",
    },
    cpu: {
      name: "12th Gen Intel(R) Core(TM) i3-1215U",
      logicalProcessors: 8,
      virtualizationEnabled: false,
      slat: false,
    },
    memory: {
      totalGB: 24,
      freeGB: 8,
    },
    disk: [
      { drive: "C:", totalGB: 1860, freeGB: 27 },
    ],
    hyperV: {
      available: false,
      cmdletsAvailable: false,
      note: "Hyper-V is not available on Windows 11 Home. Requires Pro/Enterprise/Education edition.",
    },
    ollama: {
      available: false,
      models: [],
      error: "Connection refused — Ollama is not running on localhost:11434",
    },
    vmRequirements: {
      canBuildVMs: false,
      blockers: PREFLIGHT_BLOCKERS_HOST,
      recommendations: PREFLIGHT_RECOMMENDATIONS,
    },
  };
}
