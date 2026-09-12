# VM BUILD VALIDATION

## Host checks

Verify:
- Windows 11
- CPU virtualization enabled
- Hyper-V available
- sufficient RAM
- sufficient disk
- Windows installation media legally available
- host firewall/security software remains enabled

## DC01 checks

Run appropriate administrative validation:
- computer name is DC01
- static IP is correct for the lab
- DNS points appropriately
- AD DS health
- DNS health
- SYSVOL/NETLOGON availability
- time synchronization
- event logs reviewed

## HD01 checks

- Windows desktop boots normally
- correct hostname
- correct DNS
- domain join succeeds
- domain login succeeds
- GPO can be observed with `gpresult`
- local and domain authentication are distinguishable

## Recovery

Take VM checkpoints only at clean milestones:
- POST-OS
- POST-AD
- POST-DOMAIN-JOIN
- POST-GPO
- PRE-CAPSTONE

Do not treat checkpoints as backups.
