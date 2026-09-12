# OMARI TECHNOLOGIES ENTERPRISE LAB ARCHITECTURE

## Logical architecture

Internet (host only)
        |
Windows 11 Host
        |
Hyper-V Private Lab Switch
        |
+-------------------+-------------------+
|                   |                   |
DC01               HD01                FS01
Windows Server      Windows 11         Windows Server
AD DS + DNS         Student client     File/resource server
|                   |                   |
+--------- OMARI Technologies domain ----+

Later layers:
- IAM analyst cloud/authorized SaaS tenant
- SSO/federation test applications
- automation/API workstation
- IGA/PAM lab components
- logging/SIEM-style evidence collection
- architecture documentation

## OU model

OMARI
├── Admin
├── Users
│   ├── Corporate
│   ├── HelpDesk
│   ├── IAM
│   ├── Engineering
│   └── Executives
├── Computers
│   ├── Workstations
│   └── Servers
├── Groups
├── ServiceAccounts
├── Disabled
└── Lab

## Baseline identities

Create synthetic users such as:
- Alice Johnson — Finance
- Brian Smith — HR
- Carol Williams — Help Desk
- Daniel Brown — Engineering
- Elena Davis — IAM
- Frank Miller — Executive

Create groups:
- GG-HelpDesk
- GG-IAM-Analysts
- GG-Engineering
- GG-Finance
- GG-HR
- GG-Executives
- GG-VPN-Users
- GG-File-Read
- GG-File-Modify

Never use real personal information.

## Baseline GPO concepts

- password policy
- account lockout
- workstation security baseline
- screen lock
- Windows Firewall
- audit policy
- removable media policy discussion
- mapped drive
- controlled administrative access

Apply policies by OU and test scope deliberately.

## Validation checklist

- [ ] DC01 boots
- [ ] AD DS installed
- [ ] DNS resolves internal names
- [ ] Client uses DC01 for DNS
- [ ] HD01 joins domain
- [ ] Domain user can sign in
- [ ] Group membership works
- [ ] GPO applies
- [ ] File permissions reflect groups
- [ ] PowerShell remoting is configured only if needed and secured
- [ ] Host-only/private network is isolated
