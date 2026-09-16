import type { DrillCard } from "./types";

/**
 * Active-recall drill deck.
 *
 * These are deliberately NOT multiple choice. Recognition is a much weaker
 * memory signal than recall, and in an interview or an incident nobody offers
 * four options. Every card asks a question, the learner commits to an answer
 * out loud or in writing, and only then reveals.
 *
 * Every card carries a `whyItMatters` line because a fact recalled without
 * knowing when to use it does not transfer to the job. That line is the
 * difference between memorising port 389 and knowing why seeing it in a packet
 * capture should worry you.
 */
export const drillCards: DrillCard[] = [
  // ===================== YEAR 1 =====================
  {
    id: "D-Y1-001",
    yearId: "year-1",
    category: "Active Directory",
    prompt: "A user cannot log in. How do you tell a disabled account from a locked account from an expired password?",
    answer:
      "Disabled: an administrator turned the account off, it stays off until someone enables it. Locked: too many failed password attempts tripped the lockout policy, it clears on its own after the lockout duration or on manual unlock. Expired password: the credential aged past the maximum password age, the account is healthy and the user just needs to set a new password.",
    whyItMatters:
      "These three produce nearly identical user complaints and completely different fixes. Resetting a password on a locked account does not unlock it, and unlocking a disabled account does nothing. Getting this wrong is the single most common help desk mistake.",
  },
  {
    id: "D-Y1-002",
    yearId: "year-1",
    category: "Active Directory",
    prompt: "What does `whoami /groups` tell you that the Active Directory Users and Computers console does not?",
    answer:
      "It shows the groups actually present in the user's current access token, including nested groups already resolved and well-known SIDs. ADUC shows what has been configured; the token shows what the session is really carrying.",
    whyItMatters:
      "If you add someone to a group and they still cannot access a resource, the token is usually the answer: it was issued before the change and will not reflect it until they sign out and back in. Checking the token first saves an hour of chasing permissions that are already correct.",
  },
  {
    id: "D-Y1-003",
    yearId: "year-1",
    category: "Networking",
    prompt: "A workstation can ping the domain controller by IP address but cannot resolve its hostname. Where do you look first?",
    answer:
      "The client's configured DNS server. Run `ipconfig /all` and check whether the DNS server points at the domain controller. If it points at a public resolver, that resolver has no knowledge of the internal zone and never will.",
    whyItMatters:
      "Pinging by IP proves the network path is fine, so the problem is name resolution, not connectivity. Domain-joined clients must use the internal DNS server; pointing them at a public one breaks domain logon, GPO and almost everything else in subtle ways.",
  },
  {
    id: "D-Y1-004",
    yearId: "year-1",
    category: "Networking",
    prompt: "Name the port numbers for DNS, LDAP, LDAPS, Kerberos, RDP, SMB and HTTPS.",
    answer: "DNS 53 (UDP and TCP), LDAP 389, LDAPS 636, Kerberos 88, RDP 3389, SMB 445, HTTPS 443.",
    whyItMatters:
      "You need these to read a firewall rule or a packet capture without looking anything up. Seeing LDAP on 389 rather than LDAPS on 636 between a server and a domain controller means credentials may be crossing the network unencrypted.",
  },
  {
    id: "D-Y1-005",
    yearId: "year-1",
    category: "Networking",
    prompt: "What does an address in the 169.254.x.x range tell you?",
    answer:
      "APIPA, an automatic private address. The client asked for DHCP, got no answer, and assigned itself a link-local address. It is a symptom of DHCP failure, never a working configuration.",
    whyItMatters:
      "It instantly narrows the fault to DHCP or the path to it: the scope is exhausted, the server is down, the relay is misconfigured, or the cable or VLAN is wrong. Recognising this on sight skips a lot of guessing.",
  },
  {
    id: "D-Y1-006",
    yearId: "year-1",
    category: "Windows",
    prompt: "What is the difference between share permissions and NTFS permissions, and which one wins?",
    answer:
      "Share permissions apply only over the network; NTFS permissions apply both locally and over the network. When both apply, the effective access is the MOST RESTRICTIVE of the two.",
    whyItMatters:
      "A user with Full Control in NTFS but Read on the share still only gets Read across the network, and the NTFS tab will look completely correct while you stare at it. The usual professional practice is to leave the share permissive and control access with NTFS.",
  },
  {
    id: "D-Y1-007",
    yearId: "year-1",
    category: "Active Directory",
    prompt: "In what order are Group Policy Objects applied, and what happens on conflict?",
    answer:
      "Local, then Site, then Domain, then OU, with nested OUs applying parent before child. On conflict the last writer wins, so the OU closest to the object normally takes precedence. Enforced links and Block Inheritance change this.",
    whyItMatters:
      "LSDOU explains why a policy you set at the domain is being overridden further down. Without it you end up editing the wrong GPO repeatedly and concluding that Group Policy is broken.",
  },
  {
    id: "D-Y1-008",
    yearId: "year-1",
    category: "PowerShell",
    prompt: "Which command shows which Group Policy Objects actually applied to a user and machine, including the ones that were filtered out?",
    answer: "`gpresult /h report.html` for a full readable report, or `gpresult /r` for a quick summary in the console.",
    whyItMatters:
      "It tells you what really applied rather than what should have applied, and crucially it shows denied policies with the reason. That reason is usually security filtering or a WMI filter, which you would otherwise never find.",
  },
  {
    id: "D-Y1-009",
    yearId: "year-1",
    category: "PowerShell",
    prompt: "How do you find every account in the domain that has been disabled?",
    answer: "`Search-ADAccount -AccountDisabled` or `Get-ADUser -Filter {Enabled -eq $false}`.",
    whyItMatters:
      "This is the starting point for a leaver review and an audit staple. `Search-ADAccount` also handles locked out, inactive and expired accounts with the same pattern, so learning one gives you four.",
  },
  {
    id: "D-Y1-010",
    yearId: "year-1",
    category: "Security",
    prompt: "What are the three parts of the CIA triad, and give an IAM control that serves each?",
    answer:
      "Confidentiality: least privilege and access controls. Integrity: segregation of duties and audit logging. Availability: break-glass accounts and identity provider resilience.",
    whyItMatters:
      "It is the frame for justifying any control to a business audience. It also prevents the common mistake of treating security as confidentiality only - locking an account so hard nobody can work is an availability failure, not a win.",
  },
  {
    id: "D-Y1-011",
    yearId: "year-1",
    category: "Security",
    prompt: "What does 'least privilege' actually require you to do, beyond not granting admin rights?",
    answer:
      "Grant only the access required for the specific task, only for as long as it is needed, and remove it when the need ends. It includes time-bounding and revocation, not just the initial grant decision.",
    whyItMatters:
      "Most organisations do the grant half and skip the revoke half, which is exactly how you accumulate hundreds of accounts with standing privilege. Least privilege that only applies at grant time decays into over-privilege within a year.",
  },
  {
    id: "D-Y1-012",
    yearId: "year-1",
    category: "Windows",
    prompt: "A problem follows the user to a different workstation. What does that tell you, and what if it stays with the machine instead?",
    answer:
      "Following the user points at the account, the profile, or user-scoped policy. Staying with the machine points at hardware, the OS build, machine-scoped policy, drivers or local configuration.",
    whyItMatters:
      "This single test halves the search space in about two minutes and requires no tooling. It is the fastest triage move in help desk work and interviewers ask about it constantly.",
  },
  {
    id: "D-Y1-013",
    yearId: "year-1",
    category: "Active Directory",
    prompt: "What is an OU for, and why can you not apply Group Policy to a security group?",
    answer:
      "An OU is a container used for delegating administration and linking Group Policy. GPOs link to sites, domains and OUs only. You can influence which members of an OU receive a GPO using security filtering on a group, but the link itself must target an OU.",
    whyItMatters:
      "Confusing groups with OUs leads to structures where neither delegation nor policy works cleanly. Groups are for authorisation, OUs are for administration and policy - keeping those separate is what makes a directory maintainable.",
  },
  {
    id: "D-Y1-014",
    yearId: "year-1",
    category: "Security",
    prompt: "Why should you document the current state before changing anything during troubleshooting?",
    answer:
      "So you can roll back, so you can prove what you changed, and so that the next person can tell your change apart from the original fault. Without it you cannot distinguish the problem from your own attempts to fix it.",
    whyItMatters:
      "This is the habit that separates a technician from someone who causes second incidents. It is also the evidence that protects you when something breaks later and the question of who touched it comes up.",
  },
  {
    id: "D-Y1-015",
    yearId: "year-1",
    category: "Identity",
    prompt: "What are the joiner, mover and leaver events, and which one is most often done badly?",
    answer:
      "Joiner: provision access for a new starter. Mover: adjust access on a role change. Leaver: remove all access on departure. Mover is the most commonly mishandled, because access is usually added for the new role without removing the old.",
    whyItMatters:
      "Accumulated mover access is the main source of over-privilege in most organisations. Someone who has moved three times carries the permissions of four roles, and no single grant ever looked unreasonable on its own.",
  },

  // ===================== YEAR 2 =====================
  {
    id: "D-Y2-001",
    yearId: "year-2",
    category: "Identity",
    prompt: "Distinguish authentication, authorisation and accounting in one sentence each.",
    answer:
      "Authentication proves who you are. Authorisation decides what you may do. Accounting records what you actually did.",
    whyItMatters:
      "Most access incidents are misdiagnosed because these get conflated. 'I cannot get in' is authentication; 'it says access denied' is authorisation - and they have entirely different investigation paths.",
  },
  {
    id: "D-Y2-002",
    yearId: "year-2",
    category: "Protocols",
    prompt: "What is the core difference between SAML and OIDC?",
    answer:
      "SAML is XML-based, built for browser-based enterprise web SSO, and passes assertions. OIDC is JSON and JWT based, built on OAuth 2.0, works well for mobile and APIs as well as browsers, and returns an ID token.",
    whyItMatters:
      "You will be asked to choose between them. The short version: SAML for older enterprise applications that already support it, OIDC for anything new, especially with mobile or API clients.",
  },
  {
    id: "D-Y2-003",
    yearId: "year-2",
    category: "Protocols",
    prompt: "OAuth 2.0 and OIDC are often confused. What is each one actually for?",
    answer:
      "OAuth 2.0 is an authorisation framework - it grants an application delegated access to a resource. OIDC is an authentication layer built on top of OAuth 2.0 that adds an identity token telling you who the user is.",
    whyItMatters:
      "Using bare OAuth 2.0 for authentication is a classic security mistake: an access token proves someone authorised access, not who is present. This exact confusion has produced real account takeover vulnerabilities.",
  },
  {
    id: "D-Y2-004",
    yearId: "year-2",
    category: "Protocols",
    prompt: "In a SAML flow, who is the Identity Provider and who is the Service Provider, and what does each trust?",
    answer:
      "The Identity Provider authenticates the user and issues a signed assertion. The Service Provider is the application consuming it. The SP trusts the IdP's signing certificate; the IdP trusts the SP's configured endpoint and entity ID.",
    whyItMatters:
      "Nearly all SAML failures are one of: expired signing certificate, entity ID mismatch, clock skew, or wrong assertion consumer URL. Knowing who trusts what turns a wall of XML into four things to check.",
  },
  {
    id: "D-Y2-005",
    yearId: "year-2",
    category: "Identity",
    prompt: "Compare RBAC and ABAC, and say when each breaks down.",
    answer:
      "RBAC grants access through role membership - simple and auditable, but suffers role explosion when every exception becomes a new role. ABAC evaluates attributes such as department, location and device at request time - far more expressive, but much harder to audit and to explain to a reviewer.",
    whyItMatters:
      "The realistic answer in an interview is a hybrid: RBAC for the stable majority and attributes for the contextual edges. Claiming one is simply better signals that you have not run either at scale.",
  },
  {
    id: "D-Y2-006",
    yearId: "year-2",
    category: "Security",
    prompt: "Rank these MFA factors by strength and say why: SMS, TOTP app, push notification, hardware security key.",
    answer:
      "Hardware security key is strongest because it is phishing-resistant and cryptographically bound to the origin. TOTP is decent but phishable. Push is convenient but vulnerable to MFA fatigue. SMS is weakest - vulnerable to SIM swap and interception.",
    whyItMatters:
      "'We have MFA' says nothing on its own. SMS MFA against a targeted attacker is close to no MFA. Being able to rank factors is what makes you useful in a policy conversation.",
  },
  {
    id: "D-Y2-007",
    yearId: "year-2",
    category: "Security",
    prompt: "What is MFA fatigue, and what stops it?",
    answer:
      "An attacker who already has the password spams push approvals until the user taps approve out of irritation or confusion. Number matching, context display showing location and application, rate limiting, and moving to phishing-resistant factors all mitigate it.",
    whyItMatters:
      "It has been the entry point in several major breaches. It also demonstrates the general principle that a control defeated by predictable human behaviour is a design problem, not a user problem.",
  },
  {
    id: "D-Y2-008",
    yearId: "year-2",
    category: "Identity",
    prompt: "What makes an access review meaningful rather than a rubber-stamping exercise?",
    answer:
      "Reviewers understand what they are approving because entitlements are described in business language, they have enough context to say no, revocations are actually executed and verified, and completion time is monitored as a quality signal.",
    whyItMatters:
      "A campaign with a 100 percent approval rate and a two-second median decision time provides zero assurance while producing an audit artifact that claims otherwise. That is worse than no review, because it creates false confidence.",
  },
  {
    id: "D-Y2-009",
    yearId: "year-2",
    category: "Identity",
    prompt: "What is the source of authority for identity data, and why does naming one matter?",
    answer:
      "The authoritative system that defines whether a person exists and what their role is - usually the HR system for employees. Naming one prevents conflicting records, because when two systems disagree there is a defined winner.",
    whyItMatters:
      "Without a declared authority every integration becomes a negotiation and stale data has nowhere to be corrected. Most large-scale identity data quality problems trace back to never having answered this question.",
  },
  {
    id: "D-Y2-010",
    yearId: "year-2",
    category: "Protocols",
    prompt: "What is inside a JWT, and what must you always verify before trusting one?",
    answer:
      "A header, a claims payload and a signature, base64url encoded and dot-separated. You must verify the signature, the issuer, the audience and the expiry. The payload is encoded, not encrypted - anyone can read it.",
    whyItMatters:
      "Developers routinely assume a JWT is secret because it looks opaque, and put sensitive data in the claims. Anyone can paste it into a decoder. Skipping audience validation also allows a token issued for one application to be replayed against another.",
  },
  {
    id: "D-Y2-011",
    yearId: "year-2",
    category: "Identity",
    prompt: "What is conditional access, and what is the most common way it is misconfigured?",
    answer:
      "Policy that evaluates signals such as user, device, location and risk at sign-in and decides to allow, block, or require additional controls. The most common misconfiguration is a policy with no exclusion for break-glass accounts, which can lock every administrator out of the tenant.",
    whyItMatters:
      "This mistake has locked real organisations out of their own tenants. Any conditional access design conversation should start with the break-glass exclusion, before any of the interesting rules.",
  },
  {
    id: "D-Y2-012",
    yearId: "year-2",
    category: "Identity",
    prompt: "Why is deprovisioning harder than provisioning?",
    answer:
      "Provisioning is driven by an event someone is waiting on, so failures are noticed immediately. Deprovisioning has no one waiting, so failures are silent. It also has to reach every system the identity ever touched, including ones IAM may not know about.",
    whyItMatters:
      "This is why leaver controls fail quietly for months and surface in an audit. It is also the reason a complete application inventory is an access control requirement, not just good housekeeping.",
  },

  // ===================== YEAR 3 =====================
  {
    id: "D-Y3-001",
    yearId: "year-3",
    category: "PowerShell",
    prompt: "What does idempotent mean for a provisioning script, and how do you prove it?",
    answer:
      "Running it twice produces the same end state as running it once, with no duplicates and no errors. You prove it by running it twice against a test environment and diffing the resulting state.",
    whyItMatters:
      "Any job can be re-run after an apparent hang, a timeout or a partial failure. A script without this guarantee turns an operator's reasonable retry into an incident - exactly what happened in ticket ENG-001.",
  },
  {
    id: "D-Y3-002",
    yearId: "year-3",
    category: "Protocols",
    prompt: "An API integration reports exactly 100 records every run. Why is that number suspicious?",
    answer:
      "It is a default page size. The client is almost certainly reading only the first page and ignoring the pagination cursor, so it silently processes a fraction of the data while reporting success.",
    whyItMatters:
      "A silent partial success is more dangerous than a crash, because nothing alerts and the control appears healthy. Suspicious round numbers are one of the most reliable smells in integration work.",
  },
  {
    id: "D-Y3-003",
    yearId: "year-3",
    category: "Protocols",
    prompt: "What HTTP status codes should an API client handle distinctly, and what does each mean for retry behaviour?",
    answer:
      "401 unauthorised - refresh the token and retry once. 403 forbidden - do not retry, the permission is wrong. 404 not found - do not retry. 429 too many requests - back off and respect Retry-After. 5xx - retry with exponential backoff.",
    whyItMatters:
      "Retrying a 403 forever hammers the API and never succeeds. Not retrying a 429 gets your integration rate-limited or blocked. The distinction between retryable and non-retryable is the core of a reliable client.",
  },
  {
    id: "D-Y3-004",
    yearId: "year-3",
    category: "Security",
    prompt: "A secret was committed and then removed in a later commit. Is it safe?",
    answer:
      "No. Git history is immutable, so it remains fully readable in the history and in every clone and fork. The only effective response is to rotate and revoke the credential; scrubbing history is cleanup that cannot recall existing clones.",
    whyItMatters:
      "Getting the order wrong wastes the window that matters. Rotate first, investigate use during the exposure window second, rewrite history third - and state plainly that clones cannot be recalled.",
  },
  {
    id: "D-Y3-005",
    yearId: "year-3",
    category: "Windows",
    prompt: "What do Windows security event IDs 4624, 4625, 4740 and 4728 mean?",
    answer:
      "4624 successful logon, 4625 failed logon, 4740 account locked out, 4728 member added to a security-enabled global group.",
    whyItMatters:
      "These four cover most identity investigations. 4728 in particular is the one that tells you someone gained privilege, and it is the event most worth alerting on in an environment with no other detections.",
  },
  {
    id: "D-Y3-006",
    yearId: "year-3",
    category: "Windows",
    prompt: "In event 4624, what is the difference between logon types 2, 3 and 10?",
    answer:
      "Type 2 is interactive, someone physically at the console. Type 3 is network, such as accessing a file share. Type 10 is RemoteInteractive, which is RDP.",
    whyItMatters:
      "The type changes the meaning entirely. A type 10 logon to a domain controller at 3am is alarming; a type 3 from a file server is routine. Alerting on 4624 without filtering on type generates pure noise.",
  },
  {
    id: "D-Y3-007",
    yearId: "year-3",
    category: "Security",
    prompt: "What is just-in-time access, and what problem does it solve that a vault alone does not?",
    answer:
      "Privilege is granted only for a defined window on approved request, then automatically removed. A vault protects the credential; JIT removes the standing entitlement itself, so there is no persistent privilege to steal.",
    whyItMatters:
      "Vaulting a credential for an account that is permanently a Domain Admin still leaves a permanently privileged account. JIT shrinks the window of exposure rather than just protecting the key to it.",
  },
  {
    id: "D-Y3-008",
    yearId: "year-3",
    category: "Security",
    prompt: "Why is rotating a credential without revoking the old one incomplete?",
    answer:
      "The old credential remains valid until revoked, so an attacker who already has it retains access. Rotation issues a new credential; revocation is what removes the attacker's.",
    whyItMatters:
      "Teams routinely believe they have remediated a leak when they have only created a second working credential. During an active incident this distinction is the whole response.",
  },
  {
    id: "D-Y3-009",
    yearId: "year-3",
    category: "Security",
    prompt: "What makes an alert actionable at 3am?",
    answer:
      "It says what happened, why it matters, what the expected normal is, and what to do first. An alert that only states a condition forces the analyst to do the research the detection author skipped.",
    whyItMatters:
      "Non-actionable alerts create alert fatigue, and alert fatigue is a security risk rather than an inconvenience - it is how the one real alert gets dismissed alongside the hundred false ones.",
  },
  {
    id: "D-Y3-010",
    yearId: "year-3",
    category: "PowerShell",
    prompt: "Why should automation that changes identity state have a dry-run mode?",
    answer:
      "So the operator can see exactly what would change before anything does. Identity changes are often hard to reverse - you cannot simply destroy and recreate a user without breaking every reference to their identifier.",
    whyItMatters:
      "In infrastructure you can often rebuild. In identity, deleting and recreating an account produces a new security identifier, which orphans permissions, mailbox access and audit history. Dry-run is the last cheap check.",
  },

  // ===================== YEAR 4 =====================
  {
    id: "D-Y4-001",
    yearId: "year-4",
    category: "Architecture",
    prompt: "State the core assumption of Zero Trust in one sentence, and name the most common way organisations get it wrong.",
    answer:
      "Never trust, always verify - trust is never granted by network location and every request is evaluated on identity, device and context. The most common error is buying a product and declaring Zero Trust achieved, rather than removing implicit trust from the architecture.",
    whyItMatters:
      "Zero Trust is an architectural property, not a purchase. Being able to say that clearly, and then describe what you would actually remove, separates architects from people repeating vendor language.",
  },
  {
    id: "D-Y4-002",
    yearId: "year-4",
    category: "Architecture",
    prompt: "Where do you draw a trust boundary when threat modelling an identity system?",
    answer:
      "Wherever authority changes hands - not where the network segment changes. The boundary is the point at which one component starts relying on another's assertion about who someone is.",
    whyItMatters:
      "Drawing boundaries at network edges produces a network diagram with threat labels on it. Drawing them where authority transfers is what surfaces token replay, assertion forgery and delegation abuse.",
  },
  {
    id: "D-Y4-003",
    yearId: "year-4",
    category: "Governance",
    prompt: "What is the difference between a risk that is accepted and a risk that is ignored?",
    answer:
      "An accepted risk has a named owner, a documented rationale, stated residual impact and a review date. An ignored risk has none of those and is usually discovered by an auditor or an attacker.",
    whyItMatters:
      "Architects cannot eliminate every risk, and pretending otherwise destroys credibility. Formal acceptance is how you stay honest and how accountability lands with the person who actually owns the business outcome.",
  },
  {
    id: "D-Y4-004",
    yearId: "year-4",
    category: "Architecture",
    prompt: "Why is a break-glass account that depends on the primary identity provider useless?",
    answer:
      "Because the scenario it exists for is the primary provider being unavailable. If the recovery path requires the failed system, it is a circular dependency and there is effectively no recovery path.",
    whyItMatters:
      "This exact flaw turns a provider outage into a total business outage, as in ticket ARCH-005. It is also the kind of error that only surfaces during a real incident unless you deliberately test it.",
  },
  {
    id: "D-Y4-005",
    yearId: "year-4",
    category: "Governance",
    prompt: "An executive asks why IAM needs more budget. What framing works and what framing fails?",
    answer:
      "Works: expected loss reduction, audit and regulatory exposure, operational cost of manual access handling, and time-to-productivity for new staff. Fails: control counts, tool names, maturity scores and anything expressed in security jargon.",
    whyItMatters:
      "Budget conversations are lost on framing far more often than on merit. Executives fund business outcomes; describing your control coverage percentage answers a question they did not ask.",
  },
  {
    id: "D-Y4-006",
    yearId: "year-4",
    category: "Architecture",
    prompt: "What does a certificate actually prove, and what does it not?",
    answer:
      "It proves that a certificate authority you have chosen to trust asserted a binding between a public key and an identity, and that the holder controls the matching private key. It does not prove the holder is trustworthy, honest, or uncompromised.",
    whyItMatters:
      "Conflating cryptographic validity with trustworthiness is why valid certificates on phishing sites work so well. A padlock proves the channel is encrypted, not that the far end deserves your data.",
  },
  {
    id: "D-Y4-007",
    yearId: "year-4",
    category: "Governance",
    prompt: "What is segregation of duties, and give a concrete toxic combination.",
    answer:
      "No single identity should control an entire sensitive process end to end. A classic toxic combination is the same person being able to both create a vendor record and approve payments to it.",
    whyItMatters:
      "SoD violations rarely look wrong entitlement by entitlement - each grant is individually defensible. They are only visible when you analyse combinations, which is why detection must be designed in rather than spotted by reviewers.",
  },
  {
    id: "D-Y4-008",
    yearId: "year-4",
    category: "Architecture",
    prompt: "In a build-versus-buy decision, which requirement should the proof of concept test?",
    answer:
      "The riskiest assumption - typically the hardest integration, the largest data volume, or the most unusual business rule. Not the happy path the vendor will happily demonstrate.",
    whyItMatters:
      "Vendor demos are designed to succeed. A proof of concept that only confirms what the demo already showed has told you nothing and consumed a quarter doing it.",
  },
  {
    id: "D-Y4-009",
    yearId: "year-4",
    category: "Architecture",
    prompt: "Why is centralising authentication both a security improvement and a new risk?",
    answer:
      "It improves security by giving one place to enforce MFA, conditional access, logging and deprovisioning. It concentrates risk because that one place becomes a single point of failure and the highest-value target in the estate.",
    whyItMatters:
      "Recognising the trade-off is what drives resilience design. Teams that only see the benefit roll out SSO enthusiastically and then discover the failure mode during their first provider outage.",
  },
  {
    id: "D-Y4-010",
    yearId: "year-4",
    category: "Governance",
    prompt: "What is the difference between a control metric and a vanity metric in IAM?",
    answer:
      "A control metric changes when control health changes - mean time to deprovision, percentage of privileged access that is time-bound, access review revocation rate. A vanity metric goes up regardless - number of accounts managed, policies written, tickets closed.",
    whyItMatters:
      "Vanity metrics make reporting comfortable and hide deterioration. A 100 percent access review completion rate with a zero percent revocation rate is a strong signal that nobody is actually reviewing anything.",
  },
];

export function getDrillsByYear(yearId: string): DrillCard[] {
  return drillCards.filter((c) => c.yearId === yearId);
}

/**
 * Orders a deck for study using a simple leitner-style rule: cards with the
 * shortest correct streak come first, so weak material is seen most often.
 * Ties keep curriculum order, which keeps a session feeling coherent rather
 * than randomly scattered across four years.
 */
export function orderForStudy(cards: DrillCard[], streaks: Record<string, number>): DrillCard[] {
  return [...cards].sort((a, b) => (streaks[a.id] ?? 0) - (streaks[b.id] ?? 0));
}
