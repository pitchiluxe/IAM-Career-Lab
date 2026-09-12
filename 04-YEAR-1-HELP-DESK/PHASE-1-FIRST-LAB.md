# YEAR 1 — PHASE 1 FIRST LAB
## OMARI Technologies Host & Hyper-V Readiness

### Objective
Prepare the Windows 11 host for the real OMARI Technologies virtual enterprise.

### Student outcome
You should be able to explain:
- what a hypervisor does,
- why the lab network should be isolated,
- why VM checkpoints are not backups,
- why real domain services matter,
- why DNS is essential to Active Directory.

### Tasks
1. Verify Windows version and system architecture.
2. Verify CPU virtualization support.
3. Verify Hyper-V availability.
4. Verify adequate disk/RAM for DC01 and HD01.
5. Create the lab directory.
6. Create a private/internal Hyper-V switch.
7. Document the proposed subnet.
8. Create the DC01 VM.
9. Install Windows Server from legitimate installation media.
10. Create a clean checkpoint after OS validation.

### Do not
- expose the lab domain to the public Internet,
- use real passwords in documentation,
- disable security products unnecessarily,
- skip validation.

### Instructor challenge
Before building DC01, explain to Ollama:
"Why should Active Directory clients use the domain controller's DNS rather than an arbitrary public DNS resolver?"

The instructor should grade your explanation.

### Evidence
Capture:
- Hyper-V configuration
- virtual switch
- DC01 VM settings
- successful boot
- checkpoint
- written explanation of network isolation

### Pass criteria
- VM boots normally.
- Network design is documented.
- No secrets are stored.
- Student can explain the purpose of the private lab network.
