import type { ArchitectureData } from "./types";

export const architecture: ArchitectureData = {
  company: "IAM Career Lab",
  domain: "lab.local",
  netbios: "LAB",
  ouStructure: [
    { name: "LAB" },
    { name: "Admin" },
    {
      name: "Users",
      children: [
        { name: "Corporate" },
        { name: "HelpDesk" },
        { name: "IAM" },
        { name: "Engineering" },
        { name: "Executives" },
      ],
    },
    {
      name: "Computers",
      children: [{ name: "Workstations" }, { name: "Servers" }],
    },
    { name: "Groups" },
    { name: "ServiceAccounts" },
    { name: "Disabled" },
    { name: "Lab" },
  ],
  baselineIdentities: [
    { name: "Alice Johnson", department: "Finance", role: "Financial Analyst", ou: "Corporate" },
    { name: "Brian Smith", department: "HR", role: "HR Specialist", ou: "Corporate" },
    { name: "Carol Williams", department: "Help Desk", role: "Help Desk Technician", ou: "HelpDesk" },
    { name: "Daniel Brown", department: "Engineering", role: "Software Engineer", ou: "Engineering" },
    { name: "Elena Davis", department: "IAM", role: "IAM Analyst", ou: "IAM" },
    { name: "Frank Miller", department: "Executive", role: "CIO", ou: "Executives" },
  ],
  baselineGroups: [
    { name: "GG-HelpDesk", description: "Help desk technicians with reset and basic AD rights" },
    { name: "GG-IAM-Analysts", description: "IAM analysts managing identity lifecycle and access reviews" },
    { name: "GG-Engineering", description: "Engineering staff with development environment access" },
    { name: "GG-Finance", description: "Finance staff with access to financial shares" },
    { name: "GG-HR", description: "HR staff with access to personnel records" },
    { name: "GG-Executives", description: "Executive leadership with broad read access" },
    { name: "GG-VPN-Users", description: "Users permitted to use VPN access" },
    { name: "GG-File-Read", description: "Read access to shared file resources" },
    { name: "GG-File-Modify", description: "Modify access to shared file resources" },
  ],
  gpoConcepts: [
    { name: "Password Policy", description: "Enforce complexity, length, and maximum age" },
    { name: "Account Lockout", description: "Lock accounts after repeated failed attempts" },
    { name: "Workstation Security Baseline", description: "Baseline security settings for all workstations" },
    { name: "Screen Lock", description: "Force screen saver lock after inactivity" },
    { name: "Windows Firewall", description: "Standard firewall profile rules" },
    { name: "Audit Policy", description: "Enable security auditing for logon and object access" },
    { name: "Removable Media Policy", description: "Control removable storage access" },
    { name: "Mapped Drive", description: "Deploy mapped network drives via preferences" },
    { name: "Controlled Administrative Access", description: "Restrict local admin group membership" },
  ],
  networkPlan: {
    subnet: "10.10.10.0/24",
    assignments: [
      { host: "DC01", ip: "10.10.10.10", role: "Domain Controller + DNS" },
      { host: "FS01", ip: "10.10.10.20", role: "File Server" },
      { host: "MGMT01", ip: "10.10.10.30", role: "Management Workstation" },
    ],
    clients: "DHCP reserved range 10.10.10.100-199",
  },
};
