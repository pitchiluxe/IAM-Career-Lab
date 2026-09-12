# MASTER BUILD CONTRACT

## Mission

Build one evolving enterprise laboratory named **OMARI Technologies** that develops the student from entry-level IT support through IAM architect.

The coding agent must build the environment, validate it, document it, and preserve state between career years.

## NON-NEGOTIABLE REQUIREMENTS

1. Use real bootable virtual machines whenever the operating system/service licensing allows.
2. Year 1 must contain a real Windows Server domain controller and a real Windows client.
3. The Windows client must have a normal Windows desktop, Start menu, taskbar, login screen, and domain login.
4. DC01 must run Active Directory Domain Services and DNS.
5. HD01 must join the OMARI domain and authenticate against DC01.
6. The lab must use a private Hyper-V network and must not expose intentionally vulnerable services to the public Internet.
7. Build idempotent scripts where practical: running setup twice should not unnecessarily destroy the environment.
8. Every major build action must have a validation test.
9. Never fake successful execution. If an operation cannot be performed, report the exact blocker.
10. Never store real passwords, API keys, tokens, recovery codes, or secrets in Git.
11. Use synthetic student/company data only.
12. The student must solve realistic tickets rather than receiving the root cause immediately.
13. Ollama is the local instructor/tutor. It should coach, evaluate, and provide hints rather than automatically completing every exercise.
14. Commercial IAM services must be used only through legitimate authorized accounts/tenants/trials.
15. Years 2–4 must extend the same enterprise rather than replacing Year 1.

## Enterprise identity

Company: OMARI Technologies  
Internal domain: `omari.test` (lab-only; never use it for public DNS)  
NetBIOS: `OMARI`  
Primary DC: DC01  
Help-desk workstation: HD01  
Optional file server: FS01

Suggested private subnet:
- 10.10.10.0/24
- DC01: 10.10.10.10
- HD01: DHCP reservation or 10.10.10.20
- FS01: 10.10.10.30

Do not use these addresses if they conflict with the host network. The agent must detect conflicts before applying configuration.

## Year gates

### Gate 1 — Year 1
Must demonstrate:
- Windows administration
- basic networking
- ticket handling
- AD users/groups/OUs
- password/account troubleshooting
- DNS/DHCP concepts
- GPO
- PowerShell basics
- security fundamentals
- documentation

### Gate 2 — Year 2
Must demonstrate:
- authentication vs authorization
- identity lifecycle
- joiner/mover/leaver workflows
- SSO
- MFA
- RBAC
- federation concepts
- Entra/Okta-style administration in an authorized lab
- access reviews
- IAM ticket investigation

### Gate 3 — Year 3
Must demonstrate:
- automation
- PowerShell/Python
- REST APIs
- service accounts
- secrets handling
- IGA concepts
- PAM concepts
- access certification
- IAM incident response
- engineering documentation

### Gate 4 — Year 4
Must demonstrate:
- enterprise IAM architecture
- Zero Trust
- governance
- risk
- policy
- privileged access architecture
- IGA/PAM strategy
- disaster recovery
- executive communication
- architecture defense

## Agent completion standard

The agent must not say "done" until it has:
- executed or explicitly verified the relevant build steps,
- recorded validation results,
- documented assumptions,
- identified manual steps,
- provided rollback/recovery instructions,
- updated the checkpoint file.

## Deliverables

The agent should maintain:
- `/lab`
- `/scripts`
- `/docs`
- `/tickets`
- `/evidence`
- `/checkpoints`
- `/portfolio`

Keep screenshots and evidence sanitized. Never commit secrets.

## Failure behavior

If Hyper-V, Windows ISO availability, CPU virtualization, RAM, disk space, Windows edition, or licensing prevents a step:
1. stop the affected step,
2. explain the blocker,
3. offer the closest legitimate alternative,
4. do not simulate completion,
5. record the blocker in the checkpoint.

## Build order

1. Host readiness
2. Hyper-V readiness
3. Virtual switch
4. DC01
5. AD DS
6. DNS
7. OU/group/user baseline
8. HD01
9. Domain join
10. GPO
11. File/resource services
12. Ticket engine/documentation
13. Ollama instructor integration
14. Year 1 labs
15. Year 1 capstone
16. Unlock Year 2 only after assessment
