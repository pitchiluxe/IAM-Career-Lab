# YEAR 1 BUILD PROMPT — HELP DESK + ACTIVE DIRECTORY

Build and validate the Year 1 layer of the OMARI Technologies enterprise lab.

Do not build a simulated UI. Use real bootable VMs.

## Required environment

- Hyper-V
- DC01 Windows Server
- HD01 Windows 11
- AD DS
- DNS
- domain `omari.test`
- OUs, users, groups
- baseline GPOs
- realistic ticket/evidence system
- Ollama instructor integration

## Build sequence

1. inspect host readiness
2. report any prerequisites
3. create private lab switch
4. create DC01
5. install/configure AD DS + DNS
6. create OU/group/user structure
7. create HD01
8. join HD01 to domain
9. validate domain login
10. apply GPOs
11. build ticket dataset
12. create checkpoint
13. run Phase 1
14. stop before Phase 2 until Phase 1 passes

## Student experience

The student should log into HD01 as a domain user and receive a ticket. They investigate using the GUI and approved commands. The instructor should not give the root cause at the start.

## Required validation report

Provide:
- VM inventory
- IP/DNS settings
- domain health
- user/group validation
- GPO validation
- ticket validation
- errors and remediation
- checkpoint location

If a real VM cannot be created because of a host/licensing limitation, explain it and stop rather than simulating it.
