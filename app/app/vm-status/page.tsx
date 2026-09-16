"use client";

import { useState, useEffect, useCallback } from "react";
import type { PreflightResult, PreflightCheck } from "@/lib/preflight";
import { architecture } from "@/lib/data/architecture";

const SCRIPTS: [string, string][] = [
  ["00-Host-Preflight.ps1", "Host discovery + preflight report (read-only)"],
  ["01-New-LabSwitch.ps1", "Create the isolated Hyper-V private switch"],
  ["02-New-DC01.ps1", "Create DC01, install Windows Server, promote to domain controller"],
  ["03-Build-ADStructure.ps1", "Create OUs, users, groups and GPOs for the training domain"],
  ["04-New-HD01.ps1", "Create HD01 Windows 11 client and domain-join it"],
  ["05-New-FS01.ps1", "Optional file server (FS01) for permissions labs"],
  ["06-Manage-Checkpoints.ps1", "Checkpoint create / restore / list"],
  ["07-Validate-Lab.ps1", "Full validation suite"],
];

function CheckRow({ check }: { check: PreflightCheck }) {
  const icon = check.passed === true ? "PASS" : check.passed === false ? "FAIL" : "N/A";
  const color =
    check.passed === true ? "text-green-400" : check.passed === false ? "text-red-400" : "text-[#93a4c0]";
  return (
    <li className="flex gap-3 border-b border-[#1f2d4d] py-3 last:border-0">
      <span className={`mt-0.5 w-10 flex-shrink-0 font-mono text-xs font-bold ${color}`}>{icon}</span>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-[#e6edf7]">{check.label}</span>
          {!check.blocking && <span className="badge bg-[#1f2d4d] text-[#93a4c0]">advisory</span>}
        </div>
        <p className="mt-0.5 text-xs text-[#93a4c0]">{check.detail}</p>
      </div>
    </li>
  );
}

export default function VmStatusPage() {
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/preflight", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Preflight API returned HTTP ${r.status}`);
        return r.json();
      })
      .then((data: PreflightResult) => setPreflight(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Preflight request failed"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const host = preflight?.host;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">VM Status &amp; Host Preflight</h1>
          <p className="mt-1 text-sm text-[#93a4c0]">
            Live inspection of the machine this platform is running on. Nothing here is pre-written — every value is
            read from the host at the moment you load the page.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-ghost text-sm">
          {loading ? "Probing..." : "Re-run probe"}
        </button>
      </div>

      {loading && !preflight && (
        <div className="panel p-5 text-sm text-[#93a4c0]">
          Inspecting host. This shells out to PowerShell and can take a few seconds.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {preflight && host && (
        <>
          <div
            className={`panel mb-6 p-5 ${
              preflight.canBuildVMs === true
                ? "border-green-500/30"
                : preflight.canBuildVMs === false
                  ? "border-amber-500/30"
                  : "border-[#2a3a5e]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  preflight.canBuildVMs === true
                    ? "bg-green-500"
                    : preflight.canBuildVMs === false
                      ? "bg-amber-500"
                      : "bg-[#5a6b88]"
                }`}
              />
              <h2
                className={`text-lg font-semibold ${
                  preflight.canBuildVMs === true
                    ? "text-green-400"
                    : preflight.canBuildVMs === false
                      ? "text-amber-400"
                      : "text-[#93a4c0]"
                }`}
              >
                {preflight.canBuildVMs === true
                  ? "This host can build the lab VMs"
                  : preflight.canBuildVMs === false
                    ? "This host cannot build Hyper-V VMs yet"
                    : "Host readiness unknown"}
              </h2>
            </div>

            {!host.probed && (
              <div className="mt-3 rounded-lg border border-[#2a3a5e] bg-[#0d1626] p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5a6b88]">
                  Why there is no host data
                </div>
                <p className="mt-1 text-sm text-[#cfd9ec]">{host.reason}</p>
                <p className="mt-2 text-xs text-[#93a4c0]">
                  Probe status: <code className="text-omari-300">{host.status}</code>. This platform will not display
                  invented hardware figures in place of a real reading.
                </p>
              </div>
            )}

            {preflight.canBuildVMs === false && (
              <p className="mt-2 text-sm text-[#cfd9ec]">
                The provisioning scripts in <code className="text-omari-300">09-SCRIPTS/vm/</code> are ready and
                correct; they will refuse to run until the blockers below are cleared. Coursework, tickets, drills and
                the tutor all work without VMs — only the hands-on Windows exercises need them.
              </p>
            )}
          </div>

          {preflight.checks.length > 0 && (
            <div className="panel mb-6 p-5">
              <h3 className="mb-1 text-sm font-semibold text-white">Readiness checks</h3>
              <p className="mb-2 text-xs text-[#5a6b88]">Probed at {new Date(host.probedAt).toLocaleString()}</p>
              <ul>
                {preflight.checks.map((c) => (
                  <CheckRow key={c.id} check={c} />
                ))}
              </ul>
            </div>
          )}

          {host.probed && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="panel p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Operating System</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Name</dt>
                    <dd className="text-right text-[#cfd9ec]">{host.os.caption}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Version</dt>
                    <dd className="text-[#cfd9ec]">{host.os.version}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Architecture</dt>
                    <dd className="text-[#cfd9ec]">{host.os.architecture}</dd>
                  </div>
                </dl>
              </div>

              <div className="panel p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">CPU</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Model</dt>
                    <dd className="text-right text-[#cfd9ec]">{host.cpu.name}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Logical cores</dt>
                    <dd className="text-[#cfd9ec]">{host.cpu.logicalProcessors}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Virtualization</dt>
                    <dd
                      className={
                        host.cpu.hypervisorPresent === true || host.cpu.virtualizationEnabled === true
                          ? "text-green-400"
                          : "text-[#93a4c0]"
                      }
                    >
                      {host.cpu.hypervisorPresent === true
                        ? "Enabled"
                        : host.cpu.virtualizationEnabled === true
                          ? "Enabled"
                          : "Not reported"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">SLAT</dt>
                    <dd
                      className={
                        host.cpu.hypervisorPresent === true || host.cpu.slat === true
                          ? "text-green-400"
                          : "text-[#93a4c0]"
                      }
                    >
                      {host.cpu.hypervisorPresent === true || host.cpu.slat === true ? "Available" : "Not reported"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Hypervisor running</dt>
                    <dd className="text-[#cfd9ec]">
                      {host.cpu.hypervisorPresent === null ? "Unknown" : host.cpu.hypervisorPresent ? "Yes" : "No"}
                    </dd>
                  </div>
                </dl>
                {host.cpu.hypervisorPresent === true &&
                  (host.cpu.virtualizationEnabled === false || host.cpu.slat === false) && (
                    <p className="mt-2 text-xs text-[#5a6b88]">
                      Win32_Processor reports these flags as False, but a hypervisor is running on this machine, which
                      is only possible with virtualization and SLAT enabled. The raw flags read False whenever a
                      hypervisor has already claimed the CPU, so the values shown above reflect reality rather than the
                      raw flag.
                    </p>
                  )}
              </div>

              <div className="panel p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Memory</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Total</dt>
                    <dd className="text-[#cfd9ec]">{host.memory.totalGB} GB</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Free now</dt>
                    <dd className="text-[#cfd9ec]">{host.memory.freeGB} GB</dd>
                  </div>
                </dl>
              </div>

              <div className="panel p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Disk</h3>
                <dl className="space-y-1 text-sm">
                  {host.disk.length === 0 && <div className="text-[#93a4c0]">No fixed disks reported.</div>}
                  {host.disk.map((d) => (
                    <div key={d.drive} className="flex justify-between gap-3">
                      <dt className="text-[#93a4c0]">{d.drive}</dt>
                      <dd className={d.freeGB < 60 ? "text-red-400" : "text-green-400"}>
                        {d.freeGB} GB free <span className="text-[#5a6b88]">of {d.totalGB} GB</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="panel p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Hyper-V</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Feature state</dt>
                    <dd
                      className={
                        host.hyperV.available === true
                          ? "text-green-400"
                          : host.hyperV.available === false
                            ? "text-red-400"
                            : "text-[#93a4c0]"
                      }
                    >
                      {host.hyperV.featureState ?? "Unknown"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">PowerShell module</dt>
                    <dd className={host.hyperV.cmdletsAvailable ? "text-green-400" : "text-red-400"}>
                      {host.hyperV.cmdletsAvailable ? "Available" : "Not available"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-[#5a6b88]">{host.hyperV.note}</p>
              </div>

              <div className="panel p-5">
                <h3 className="mb-3 text-sm font-semibold text-white">Ollama tutor</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#93a4c0]">Reachable</dt>
                    <dd className={preflight.ollama.available ? "text-green-400" : "text-red-400"}>
                      {preflight.ollama.available ? "Yes" : "No"}
                    </dd>
                  </div>
                  {preflight.ollama.available && preflight.ollama.models.length > 0 && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#93a4c0]">Models</dt>
                      <dd className="text-right text-[#cfd9ec]">{preflight.ollama.models.join(", ")}</dd>
                    </div>
                  )}
                </dl>
                {!preflight.ollama.available && preflight.ollama.error && (
                  <p className="mt-2 text-xs text-red-400">{preflight.ollama.error}</p>
                )}
              </div>
            </div>
          )}

          {host.probed && host.hyperV.cmdletsAvailable && (
            <div className="panel-2 mt-6 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Virtual machines found on this host</h3>
              {host.vms.length === 0 ? (
                <p className="text-sm text-[#93a4c0]">No virtual machines exist yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {host.vms.map((vm) => (
                    <li key={vm.name} className="flex justify-between">
                      <span className="font-mono text-[#cfd9ec]">{vm.name}</span>
                      <span className={vm.state === "Running" ? "text-green-400" : "text-[#93a4c0]"}>{vm.state}</span>
                    </li>
                  ))}
                </ul>
              )}
              <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-[#5a6b88]">
                Virtual switches
              </h4>
              {host.switches.length === 0 ? (
                <p className="text-sm text-[#93a4c0]">No virtual switches configured.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {host.switches.map((s) => (
                    <li key={s.name} className="flex justify-between">
                      <span className="font-mono text-[#cfd9ec]">{s.name}</span>
                      <span className="text-[#93a4c0]">{s.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {preflight.blockers.length > 0 && (
            <div className="panel-2 mt-6 p-5">
              <h3 className="mb-3 text-sm font-semibold text-red-400">Blockers</h3>
              <ul className="space-y-1.5">
                {preflight.blockers.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                    <span className="text-red-400">-</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preflight.recommendations.length > 0 && (
            <div className="panel-2 mt-6 p-5">
              <h3 className="mb-3 text-sm font-semibold text-omari-300">What to do next</h3>
              <ul className="space-y-1.5">
                {preflight.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#cfd9ec]">
                    <span className="text-omari-400">&rarr;</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="panel-2 mt-6 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">{architecture.company} lab network plan</h3>
            <div className="text-sm text-[#cfd9ec]">
              <div>
                Domain <code className="text-omari-300">{architecture.domain}</code> on subnet{" "}
                <code className="text-omari-300">{architecture.networkPlan.subnet}</code> (isolated Hyper-V private
                switch)
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
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
                      <td className="py-1 font-mono text-omari-300" colSpan={2}>
                        {architecture.networkPlan.clients}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="panel-2 mt-6 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">VM provisioning scripts</h3>
            <p className="mb-3 text-sm text-[#cfd9ec]">
              In <code className="text-omari-300">09-SCRIPTS/vm/</code>. Run in an elevated PowerShell, in order.
            </p>
            <ul className="space-y-1 text-sm">
              {SCRIPTS.map(([file, desc]) => (
                <li key={file} className="text-[#cfd9ec]">
                  <code className="text-omari-300">{file}</code> &mdash; {desc}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
