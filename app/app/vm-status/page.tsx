"use client";

import { useState, useEffect } from "react";
import type { PreflightResult } from "@/lib/preflight";
import { architecture } from "@/lib/data/architecture";

export default function VmStatusPage() {
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/preflight")
      .then((r) => r.json())
      .then((data) => {
        setPreflight(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">VM Status & Host Preflight</h1>
        <p className="mt-1 text-sm text-[#93a4c0]">
          Real Hyper-V VM status and host readiness report. The lab requires real bootable VMs, not simulated desktops.
        </p>
      </div>

      {loading && <div className="text-sm text-[#93a4c0]">Running preflight checks...</div>}

      {preflight && (
        <>
          {/* VM Status banner */}
          <div className={`panel mb-6 p-5 ${preflight.vmRequirements.canBuildVMs ? "border-green-500/30" : "border-amber-500/30"}`}>
            <div className="flex items-center gap-3">
              {preflight.vmRequirements.canBuildVMs ? (
                <>
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  <h2 className="text-lg font-semibold text-green-400">VMs Can Be Built</h2>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                  <h2 className="text-lg font-semibold text-amber-400">VMs Require Host Upgrade</h2>
                </>
              )}
            </div>
            {!preflight.vmRequirements.canBuildVMs && (
              <p className="mt-2 text-sm text-[#cfd9ec]">
                Real Hyper-V VMs cannot be built on this host. The platform honestly reports this rather than faking a VM.
                The VM provisioning scripts in <code className="text-omari-300">09-SCRIPTS/vm/</code> are ready to run once the host is upgraded.
              </p>
            )}
          </div>

          {/* Host details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Operating System</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Name:</dt><dd className="text-[#cfd9ec]">{preflight.os.caption}</dd></div>
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Version:</dt><dd className="text-[#cfd9ec]">{preflight.os.version}</dd></div>
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Architecture:</dt><dd className="text-[#cfd9ec]">{preflight.os.architecture}</dd></div>
              </dl>
            </div>

            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">CPU</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Model:</dt><dd className="text-[#cfd9ec]">{preflight.cpu.name}</dd></div>
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Logical Cores:</dt><dd className="text-[#cfd9ec]">{preflight.cpu.logicalProcessors}</dd></div>
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Virtualization:</dt><dd className={preflight.cpu.virtualizationEnabled ? "text-green-400" : "text-red-400"}>{preflight.cpu.virtualizationEnabled ? "Enabled" : "Disabled"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#93a4c0]">SLAT:</dt><dd className={preflight.cpu.slat ? "text-green-400" : "text-red-400"}>{preflight.cpu.slat ? "Available" : "Not Available"}</dd></div>
              </dl>
            </div>

            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Memory</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Total:</dt><dd className="text-[#cfd9ec]">{preflight.memory.totalGB} GB</dd></div>
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Free:</dt><dd className="text-[#cfd9ec]">{preflight.memory.freeGB} GB</dd></div>
              </dl>
            </div>

            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Disk</h3>
              <dl className="space-y-1 text-sm">
                {preflight.disk.map((d) => (
                  <div key={d.drive}>
                    <div className="flex justify-between"><dt className="text-[#93a4c0]">{d.drive} Total:</dt><dd className="text-[#cfd9ec]">{d.totalGB} GB</dd></div>
                    <div className="flex justify-between"><dt className="text-[#93a4c0]">{d.drive} Free:</dt><dd className={d.freeGB < 60 ? "text-red-400" : "text-green-400"}>{d.freeGB} GB</dd></div>
                  </div>
                ))}
              </dl>
            </div>

            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Hyper-V</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Available:</dt><dd className={preflight.hyperV.available ? "text-green-400" : "text-red-400"}>{preflight.hyperV.available ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Cmdlets:</dt><dd className={preflight.hyperV.cmdletsAvailable ? "text-green-400" : "text-red-400"}>{preflight.hyperV.cmdletsAvailable ? "Available" : "Not Available"}</dd></div>
              </dl>
              <p className="mt-2 text-xs text-[#5a6b88]">{preflight.hyperV.note}</p>
            </div>

            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Ollama</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-[#93a4c0]">Available:</dt><dd className={preflight.ollama.available ? "text-green-400" : "text-red-400"}>{preflight.ollama.available ? "Yes" : "No"}</dd></div>
                {preflight.ollama.available && preflight.ollama.models.length > 0 && (
                  <div className="flex justify-between"><dt className="text-[#93a4c0]">Models:</dt><dd className="text-[#cfd9ec]">{preflight.ollama.models.join(", ")}</dd></div>
                )}
                {!preflight.ollama.available && preflight.ollama.error && (
                  <dd className="text-xs text-red-400">{preflight.ollama.error}</dd>
                )}
              </dl>
            </div>
          </div>

          {/* Blockers */}
          {!preflight.vmRequirements.canBuildVMs && (
            <div className="panel-2 mt-6 p-5">
              <h3 className="mb-3 text-sm font-semibold text-red-400">Blockers</h3>
              <ul className="space-y-1.5">
                {preflight.vmRequirements.blockers.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                    <span className="text-red-400">✗</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="panel-2 mt-6 p-5">
            <h3 className="mb-3 text-sm font-semibold text-omari-300">Recommendations to Enable Real VMs</h3>
            <ul className="space-y-1.5">
              {preflight.vmRequirements.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                  <span className="text-omari-400">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Lab network plan */}
          <div className="panel-2 mt-6 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">Lab Network Plan</h3>
            <div className="text-sm text-[#cfd9ec]">
              <div>Subnet: <code className="text-omari-300">{architecture.networkPlan.subnet}</code> (isolated Hyper-V private network)</div>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-left text-[#5a6b88]">
                    <th className="pb-2">Host</th>
                    <th className="pb-2">IP</th>
                    <th className="pb-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {architecture.networkPlan.assignments.map((a) => (
                    <tr key={a.host} className="text-[#cfd9ec]">
                      <td className="py-1 font-mono">{a.host}</td>
                      <td className="py-1 font-mono text-omari-300">{a.ip}</td>
                      <td className="py-1">{a.role}</td>
                    </tr>
                  ))}
                  <tr className="text-[#cfd9ec]">
                    <td className="py-1 font-mono">Clients</td>
                    <td className="py-1 font-mono text-omari-300" colSpan={2}>{architecture.networkPlan.clients}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* VM scripts */}
          <div className="panel-2 mt-6 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">VM Provisioning Scripts</h3>
            <p className="mb-3 text-sm text-[#cfd9ec]">
              Ready-to-run PowerShell scripts in <code className="text-omari-300">09-SCRIPTS/vm/</code>. Run them on a host that meets the requirements above.
            </p>
            <ul className="space-y-1 text-sm">
              <li className="text-[#cfd9ec]"><code className="text-omari-300">00-Host-Preflight.ps1</code> — Full host discovery + preflight report</li>
              <li className="text-[#cfd9ec]"><code className="text-omari-300">01-New-LabSwitch.ps1</code> — Create isolated Hyper-V private switch</li>
              <li className="text-[#cfd9ec]"><code className="text-omari-300">02-New-DC01.ps1</code> — Create DC01 VM, install Windows Server, promote to DC</li>
              <li className="text-[#cfd9ec]"><code className="text-omari-300">03-Build-ADStructure.ps1</code> — Create OUs, users, groups, GPOs for lab.local</li>
              <li className="text-[#cfd9ec]"><code className="text-omari-300">04-New-HD01.ps1</code> — Create HD01 Windows 11 client, domain join</li>
              <li className="text-[#cfd9ec]"><code className="text-omari-300">05-New-FS01.ps1</code> — Optional file server (FS01)</li>
              <li className="text-[#cfd9ec]"><code className="text-omari-300">06-Manage-Checkpoints.ps1</code> — Checkpoint management</li>
              <li className="text-[#cfd9ec]"><code className="text-omari-300">07-Validate-Lab.ps1</code> — Full validation suite</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
