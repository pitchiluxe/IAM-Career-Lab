import type { ArchitectureData } from "./types";

/**
 * The fictional enterprise every lab is set inside.
 *
 * Naming is deliberate and must stay in sync with the curriculum documents in
 * 04-YEAR-1-HELP-DESK/ .. 07-YEAR-4-IAM-ARCHITECT/ and the provisioning scripts
 * in 09-SCRIPTS/vm/. The platform is called "IAM Career Lab"; the *company the
 * learner works for inside the labs* is OMARI Technologies. Mixing the two
 * makes ticket text and portfolio artifacts read as though they came from two
 * different organizations.
 *
 * All identities below are invented. No real employee data is used anywhere.
 */
export const architecture: ArchitectureData = {
  company: "OMARI Technologies",
  domain: "omari.local",
  netbios: "OMARI",
  ouStructure: [
    {
      name: "OMARI",
      children: [
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
        { name: "Groups" },
        { name: "Workstations" },
        { name: "Servers" },
        { name: "HelpDesk" },
        { name: "IAM" },
        { name: "Privileged" },
        { name: "ServiceAccounts" },
        { name: "Disabled" },
      ],
    },
  ],
  baselineIdentities: [
    { name: "Alice Johnson", department: "Finance", role: "Financial Analyst", ou: "Users/Corporate" },
    { name: "Brian Smith", department: "HR", role: "HR Specialist", ou: "Users/Corporate" },
    { name: "Carol Williams", department: "Help Desk", role: "Help Desk Technician", ou: "Users/HelpDesk" },
    { name: "Daniel Brown", department: "Engineering", role: "Software Engineer", ou: "Users/Engineering" },
    { name: "Elena Davis", department: "IAM", role: "IAM Analyst", ou: "Users/IAM" },
    { name: "Frank Miller", department: "Executive", role: "CIO", ou: "Users/Executives" },
    // Deliberately NOT seeded: Grace Lee is the new hire the learner provisions
    // by hand in ticket HD-001. Pre-creating her would remove the exercise.
    { name: "Henry Adams", department: "IT Operations", role: "Systems Administrator", ou: "Privileged" },
  ],
  baselineGroups: [
    { name: "GG-HelpDesk", description: "Help desk technicians with password reset and basic AD rights" },
    { name: "GG-IAM-Analysts", description: "IAM analysts managing identity lifecycle and access reviews" },
    { name: "GG-Engineering", description: "Engineering staff with development environment access" },
    { name: "GG-Finance", description: "Finance staff with access to financial shares" },
    { name: "GG-HR", description: "HR staff with access to personnel records" },
    { name: "GG-Executives", description: "Executive leadership with broad read access" },
    { name: "GG-VPN-Users", description: "Users permitted to use VPN access" },
    { name: "GG-File-Read", description: "Read access to shared file resources" },
    { name: "GG-File-Modify", description: "Modify access to shared file resources" },
    { name: "GG-Tier0-Admins", description: "Domain-tier privileged administrators — separate accounts only, never daily-driver identities" },
    { name: "GG-Tier1-ServerAdmins", description: "Server administrators scoped to member servers, not domain controllers" },
    { name: "GG-JIT-Eligible", description: "Identities eligible to request time-bound elevated access" },
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
    { name: "Tiered Logon Restriction", description: "Deny Tier 0 accounts the right to log on to workstations" },
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
