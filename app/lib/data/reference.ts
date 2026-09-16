import type { ReferenceSection, InterviewQuestion, Certification } from "./types";

/**
 * Working reference material.
 *
 * Scoped deliberately to things worth having in recall rather than everything
 * that could be looked up. The test applied to every entry: would needing to
 * search for this mid-incident or mid-interview cost you credibility?
 */
export const referenceSections: ReferenceSection[] = [
  {
    id: "ref-ports",
    title: "Ports and protocols",
    yearId: "year-1",
    intro:
      "Enough to read a firewall rule or a packet capture without looking anything up. Pay attention to the encrypted and unencrypted pairs - seeing the wrong one of a pair is frequently the finding.",
    entries: [
      { item: "53 / UDP and TCP", meaning: "DNS", note: "UDP for normal queries, TCP for zone transfers and responses over 512 bytes." },
      { item: "67, 68 / UDP", meaning: "DHCP server and client", note: "Broadcast based, so it does not cross a router without a relay agent." },
      { item: "88 / TCP and UDP", meaning: "Kerberos", note: "The authentication protocol domain logon actually uses. NTLM is the fallback you want to eliminate." },
      { item: "135 / TCP", meaning: "RPC endpoint mapper", note: "Then negotiates a high dynamic port, which is why naive firewall rules break AD." },
      { item: "389 / TCP", meaning: "LDAP", note: "Unencrypted. Seeing a bind on 389 means credentials may be crossing in the clear." },
      { item: "445 / TCP", meaning: "SMB", note: "File sharing. Should never be exposed to the internet, ever." },
      { item: "636 / TCP", meaning: "LDAPS", note: "LDAP over TLS. The one you want." },
      { item: "3268, 3269 / TCP", meaning: "Global Catalog and Global Catalog over SSL", note: "Forest-wide searches." },
      { item: "3389 / TCP", meaning: "RDP", note: "The most commonly brute-forced port on the internet. Never expose it directly." },
      { item: "443 / TCP", meaning: "HTTPS", note: "Carries SAML, OIDC and almost all modern federation traffic." },
      { item: "1812, 1813 / UDP", meaning: "RADIUS authentication and accounting", note: "Network access control, VPN and wireless." },
    ],
  },
  {
    id: "ref-events",
    title: "Windows security event IDs for identity",
    yearId: "year-1",
    intro:
      "The events that matter for identity investigations. Knowing the logon type matters as much as the event id - the same event id means very different things depending on it.",
    entries: [
      { item: "4624", meaning: "Successful logon", note: "Always check the Logon Type field. The event alone tells you very little." },
      { item: "4625", meaning: "Failed logon", note: "The failure sub-status distinguishes bad password from disabled account from expired password." },
      { item: "4634 / 4647", meaning: "Logoff / user-initiated logoff", note: "Useful for reconstructing session duration." },
      { item: "4648", meaning: "Logon using explicit credentials", note: "Often runas. A cluster of these can indicate lateral movement." },
      { item: "4672", meaning: "Special privileges assigned to new logon", note: "Effectively 'an administrator just logged on'." },
      { item: "4720", meaning: "User account created", note: "Should correlate to an approved joiner ticket. If it does not, investigate." },
      { item: "4722 / 4725", meaning: "Account enabled / disabled", note: "A leaver control produces 4725. Its absence on a departure date is a finding." },
      { item: "4724 / 4723", meaning: "Password reset by admin / changed by user", note: "The distinction matters in a compromise investigation." },
      { item: "4728 / 4732 / 4756", meaning: "Member added to global / local / universal security group", note: "The privilege escalation events. Alert on these for privileged groups." },
      { item: "4740", meaning: "Account locked out", note: "The Caller Computer Name field identifies the source of the bad attempts." },
      { item: "4768 / 4769", meaning: "Kerberos TGT requested / service ticket requested", note: "Unusual 4769 patterns can indicate Kerberoasting." },
      { item: "4771", meaning: "Kerberos pre-authentication failed", note: "The Kerberos equivalent of a bad password." },
    ],
    // Logon types are grouped separately below because learners consistently
    // memorise event ids and then misread them by ignoring the type.
  },
  {
    id: "ref-logon-types",
    title: "Logon types (the field that changes everything)",
    yearId: "year-1",
    intro:
      "Event 4624 is meaningless without this. A type 3 on a file server is routine; a type 10 on a domain controller at 3am is an incident.",
    entries: [
      { item: "Type 2", meaning: "Interactive", note: "Someone physically at the console." },
      { item: "Type 3", meaning: "Network", note: "Accessing a share or a resource over the network. By far the most common." },
      { item: "Type 4", meaning: "Batch", note: "Scheduled task. A human account here is a smell." },
      { item: "Type 5", meaning: "Service", note: "Service start-up." },
      { item: "Type 7", meaning: "Unlock", note: "Workstation unlocked." },
      { item: "Type 8", meaning: "NetworkCleartext", note: "Credentials sent in the clear. Investigate why." },
      { item: "Type 9", meaning: "NewCredentials", note: "runas /netonly." },
      { item: "Type 10", meaning: "RemoteInteractive", note: "RDP. The one to watch on servers." },
      { item: "Type 11", meaning: "CachedInteractive", note: "Logged on with cached credentials, so no domain controller was reachable." },
    ],
  },
  {
    id: "ref-powershell-ad",
    title: "PowerShell for Active Directory",
    yearId: "year-1",
    intro:
      "The commands that cover the majority of day-to-day directory work. Every one of these is read-only or easily reversible except where noted.",
    entries: [
      { item: "Get-ADUser -Identity <sam> -Properties *", meaning: "Full attribute dump for one user", note: "Without -Properties you get a tiny default subset and will miss the attribute you need." },
      { item: "Search-ADAccount -LockedOut", meaning: "Every locked account", note: "Also -AccountDisabled, -AccountExpired, -AccountInactive." },
      { item: "Unlock-ADAccount -Identity <sam>", meaning: "Unlock an account", note: "Unlocking is not the same as resetting a password." },
      { item: "Get-ADPrincipalGroupMembership <sam>", meaning: "Groups a user belongs to", note: "Configured membership, not the issued token. Use whoami /groups for the token." },
      { item: "Get-ADGroupMember <group> -Recursive", meaning: "Members including nested groups", note: "Without -Recursive you miss nested membership, which is where over-privilege hides." },
      { item: "Get-ADUser -Filter {Enabled -eq $false}", meaning: "All disabled accounts", note: "Leaver review starting point." },
      { item: "Get-ADDomain / Get-ADForest", meaning: "Domain and forest configuration", note: "Includes functional levels and FSMO role holders." },
      { item: "Get-ADDefaultDomainPasswordPolicy", meaning: "Password and lockout policy", note: "Answers 'is this an expiry or a lockout' immediately." },
      { item: "Get-ADReplicationFailure -Target <dc>", meaning: "Replication problems", note: "Explains 'it works on one DC but not the other'." },
      { item: "gpresult /h report.html", meaning: "Applied Group Policy report", note: "Shows denied policies and the reason, which is usually the answer." },
      { item: "gpupdate /force", meaning: "Reapply Group Policy now", note: "Some settings still require a logoff or reboot to take effect." },
    ],
  },
  {
    id: "ref-network-triage",
    title: "Network triage commands",
    yearId: "year-1",
    intro: "Run in roughly this order. Each one eliminates a layer, so you narrow the fault instead of guessing.",
    entries: [
      { item: "ipconfig /all", meaning: "Address, gateway, DNS servers, DHCP lease", note: "A 169.254.x.x address means DHCP failed." },
      { item: "ping <gateway>", meaning: "Local network reachability", note: "Failing here means the problem is local, not remote." },
      { item: "nslookup <host> <dnsserver>", meaning: "Test a specific resolver", note: "Specifying the server proves whether the client is simply asking the wrong one." },
      { item: "Test-NetConnection <host> -Port <n>", meaning: "TCP reachability on a specific port", note: "Far more useful than ping, since ICMP is frequently blocked while the service is fine." },
      { item: "nltest /dsgetdc:<domain>", meaning: "Which domain controller the client is using", note: "Surfaces site and DC selection problems." },
      { item: "klist", meaning: "Current Kerberos tickets", note: "klist purge forces fresh tickets after a group change." },
      { item: "ipconfig /flushdns", meaning: "Clear the resolver cache", note: "Rules out a stale negative cache entry." },
    ],
  },
  {
    id: "ref-identity-terms",
    title: "Identity vocabulary that gets misused",
    yearId: "year-2",
    intro:
      "Using these precisely is one of the fastest ways to sound senior. Using them loosely is one of the fastest ways to sound junior.",
    entries: [
      { item: "Authentication vs authorisation", meaning: "Who you are vs what you may do", note: "'Access denied' is authorisation. 'Cannot sign in' is authentication." },
      { item: "Identification vs authentication", meaning: "Claiming an identity vs proving it", note: "A username identifies; a credential authenticates." },
      { item: "Provisioning vs entitlement", meaning: "Creating the account vs granting a specific permission", note: "An account can exist with no entitlements at all." },
      { item: "SSO vs federation", meaning: "One sign-in for many apps vs trust between separate identity domains", note: "You can have SSO without federation, within a single domain." },
      { item: "Delegated vs application permissions", meaning: "Acting for a signed-in user vs acting as itself unattended", note: "Application permissions have no user context, so they are far higher risk." },
      { item: "Role vs group", meaning: "A business function vs a directory object used to grant access", note: "Groups implement roles; they are not the same concept." },
      { item: "Standing vs just-in-time access", meaning: "Permanent privilege vs privilege granted for a window", note: "Standing privileged access is the thing audits find hundreds of." },
      { item: "Attestation vs certification", meaning: "A statement that access is correct vs the formal review process producing it", note: "Used interchangeably in practice; know both." },
    ],
  },
  {
    id: "ref-protocol-compare",
    title: "Federation protocols side by side",
    yearId: "year-2",
    intro: "The comparison you will be asked to make in an interview, and the failure modes you will actually debug.",
    entries: [
      { item: "SAML 2.0", meaning: "XML assertions, browser-based enterprise SSO", note: "Common failures: expired signing cert, entity ID mismatch, clock skew, wrong ACS URL." },
      { item: "OAuth 2.0", meaning: "Delegated authorisation framework, issues access tokens", note: "Not an authentication protocol. Using it as one is a known vulnerability class." },
      { item: "OIDC", meaning: "Authentication layer on OAuth 2.0, issues an ID token as a JWT", note: "Common failures: audience not validated, expiry ignored, signature unverified." },
      { item: "WS-Federation", meaning: "Older Microsoft federation protocol", note: "Still present in legacy estates; know it exists." },
      { item: "SCIM", meaning: "Standard for provisioning and deprovisioning users between systems", note: "The protocol that actually removes access. Federation alone does not deprovision." },
      { item: "LDAP", meaning: "Directory query protocol", note: "Authentication by bind. Use LDAPS in every case." },
      { item: "Kerberos", meaning: "Ticket-based authentication used inside a domain", note: "Requires time sync. Skew beyond tolerance breaks authentication outright." },
    ],
  },
];

/**
 * Interview preparation.
 *
 * The `weakAnswer` field is the point of this data. Most preparation material
 * tells candidates what to say; very little tells them what is quietly getting
 * them rejected. Each question also names the lab that supplies a real story,
 * because a concrete example from work you actually did outperforms a
 * textbook answer every time.
 */
export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "IQ-001",
    yearId: "year-1",
    tests: "Whether you troubleshoot systematically or guess and check.",
    question: "A user says they cannot log in. Walk me through what you do.",
    strongAnswer: [
      "Ask clarifying questions first: which machine, what exact message, when did it last work, what changed",
      "Distinguish disabled, locked out and expired password before touching anything",
      "Check whether the problem follows the user or stays with the machine",
      "State what you would verify at each step rather than listing tools",
      "Finish with verification and documentation, not just the fix",
    ],
    weakAnswer:
      "Jumping straight to 'I'd reset their password.' It answers a question you have not established, and it tells the interviewer you fix symptoms rather than diagnose causes.",
    drawOnLab: "Ticket HD-002 and phase Y1-P07",
  },
  {
    id: "IQ-002",
    yearId: "year-1",
    tests: "Whether you understand permission layering or just click through dialogs.",
    question: "A user has Full Control on a folder in NTFS but still cannot write to it over the network. Why?",
    strongAnswer: [
      "Share permissions and NTFS permissions both apply and the most restrictive wins",
      "The share is almost certainly set to Read",
      "Explain that the NTFS tab will look entirely correct while you stare at it",
      "Mention that common practice is a permissive share controlled by NTFS",
      "Also consider an explicit Deny, which overrides an Allow",
    ],
    weakAnswer:
      "Saying you would grant Full Control everywhere to make it work. That solves the ticket and creates a security finding, and the interviewer is listening for exactly that instinct.",
    drawOnLab: "Phase Y1-P02 and the FS01 permissions labs",
  },
  {
    id: "IQ-003",
    yearId: "year-2",
    tests: "Depth on federation, and whether you can teach a concept clearly.",
    question: "Explain SAML to me as if I were a project manager.",
    strongAnswer: [
      "Use the trust relationship framing: the application trusts the identity provider to vouch for who you are",
      "Name the three parties: user, identity provider, service provider",
      "Explain the signed assertion as the vouching mechanism and what the signature protects",
      "Mention that the application never sees the password, which is a security benefit worth stating",
      "Offer when you would choose OIDC instead, without being asked",
    ],
    weakAnswer:
      "Reciting the message flow step by step in protocol terms. It shows memorisation, not understanding, and it fails the actual test, which is whether you can explain a technical concept to a non-technical stakeholder.",
    drawOnLab: "Phase Y2-P04",
  },
  {
    id: "IQ-004",
    yearId: "year-2",
    tests: "Whether you understand that IAM controls fail silently.",
    question: "How would you make sure a leaver actually loses all their access?",
    strongAnswer: [
      "Start from a complete application inventory, and acknowledge that an incomplete one is the usual root cause",
      "Distinguish federated applications from ones with local accounts, which do not honour a directory disable",
      "Include session and token revocation, not just the account disable",
      "Add verification as a distinct step, since deprovisioning has nobody waiting on it to notice failure",
      "Propose evidence captured for audit at the time, not reconstructed later",
    ],
    weakAnswer:
      "'Disable the account in AD.' It is the first step of many, and stopping there is precisely the failure that produces post-departure access to customer data.",
    drawOnLab: "Ticket ENG-007 and phase Y2-P02",
  },
  {
    id: "IQ-005",
    yearId: "year-2",
    tests: "Judgement under business pressure, and whether you can be overruled gracefully.",
    question: "An executive demands an MFA exemption. What do you do?",
    strongAnswer: [
      "Diagnose the real friction first rather than answering the question as posed",
      "Offer an alternative that solves their actual problem, such as a hardware key that works offline",
      "Express the risk in business terms, not control terms",
      "If an exemption is unavoidable, make it time-bound with compensating controls and a review date",
      "If overruled, document the accepted risk and name the risk owner rather than escalating emotionally",
    ],
    weakAnswer:
      "A flat 'no, policy is policy.' It signals you cannot operate in a business context, and in practice the exemption gets granted over your head anyway - with you now excluded from the decision.",
    drawOnLab: "Ticket ARCH-002",
  },
  {
    id: "IQ-006",
    yearId: "year-3",
    tests: "Engineering maturity. This is the question that separates scripters from engineers.",
    question: "What does it mean for your provisioning automation to be idempotent, and why should I care?",
    strongAnswer: [
      "Running it twice produces the same result as running it once",
      "Give the concrete failure: an operator re-runs after an apparent hang and you get duplicate accounts",
      "Explain how you prove it rather than assert it - run twice, diff the state",
      "Connect it to dry-run mode and to safe retry after partial failure",
      "Note that identity is harder than infrastructure because you cannot destroy and recreate a user cheaply",
    ],
    weakAnswer:
      "Defining the word correctly and stopping. The definition is the easy half; the interviewer wants the failure mode you have personally had to clean up.",
    drawOnLab: "Ticket ENG-001 and phase Y3-P09",
  },
  {
    id: "IQ-007",
    yearId: "year-3",
    tests: "Incident response ordering under pressure.",
    question: "You find a working API credential in your repository's commit history. What do you do, in order?",
    strongAnswer: [
      "Rotate and revoke first - that is what stops the exposure",
      "Then investigate whether it was used during the exposure window, and from where",
      "Then address history, while stating plainly that existing clones cannot be recalled",
      "Treat it as compromised from the original commit date, not from the discovery date",
      "Add pre-commit scanning so detection no longer depends on someone noticing",
    ],
    weakAnswer:
      "Leading with rewriting Git history. It feels like the fix and it is the least urgent step - the credential stays valid the entire time you are doing it.",
    drawOnLab: "Ticket ENG-008",
  },
  {
    id: "IQ-008",
    yearId: "year-4",
    tests: "Whether you can hold an architectural position without being dogmatic.",
    question: "A critical legacy application cannot support SSO and the vendor no longer exists. What is your recommendation?",
    strongAnswer: [
      "Reject the binary framing of federate-or-accept",
      "Propose layered compensating controls, each mapped to the specific risk it reduces",
      "Be precise about what the controls do not fix, especially the deprovisioning gap",
      "State residual risk explicitly and get formal acceptance from a named owner",
      "Put a costed replacement on the roadmap rather than leaving it aspirational",
    ],
    weakAnswer:
      "Either 'replace it' with no regard for an 18-month timeline and unfunded budget, or 'accept the risk' with no compensating controls. Both avoid the actual job, which is engineering a defensible middle.",
    drawOnLab: "Ticket ARCH-003",
  },
  {
    id: "IQ-009",
    yearId: "year-4",
    tests: "Whether you understand that your own successful projects create new risk.",
    question: "You rolled out SSO to every application. What new risk have you just created?",
    strongAnswer: [
      "Concentration: the identity provider is now a single point of failure and the highest-value target",
      "Give the concrete scenario: a provider outage locks out the entire workforce, including incident responders",
      "Name the circular dependency trap in break-glass design",
      "Describe tiered continuity - which functions must survive an identity provider outage",
      "Insist the break-glass path is tested under simulated outage, not merely documented",
    ],
    weakAnswer:
      "Saying SSO is purely a security improvement. It is a genuine improvement with a genuine trade-off, and not seeing the trade-off is the thing being tested.",
    drawOnLab: "Ticket ARCH-005",
  },
  {
    id: "IQ-010",
    yearId: "year-4",
    tests: "Executive communication, which is most of an architect's job.",
    question: "You have five minutes with the CFO to justify IAM investment. What do you say?",
    strongAnswer: [
      "Lead with business exposure: regulatory penalty, audit finding, breach cost, operational overhead",
      "Quantify where you honestly can and say clearly where you cannot",
      "Give one concrete scenario with a number attached rather than a general warning",
      "Present options with costs, not a single take-it-or-leave-it ask",
      "Close with a specific decision you need from them today",
    ],
    weakAnswer:
      "Presenting a maturity model, a control coverage percentage or a tool comparison. That is an answer to a question the CFO did not ask, and you will not get the five minutes again.",
    drawOnLab: "Phase Y4-P10",
  },
];

/**
 * Certification mapping.
 *
 * `worthIt` is written honestly, including where a certification is weak.
 * Training material that claims every certification is essential is selling
 * something; a learner deciding where to spend limited money and time deserves
 * the real trade-off.
 */
export const certifications: Certification[] = [
  {
    id: "cert-aplus",
    name: "CompTIA A+",
    vendor: "CompTIA",
    yearId: "year-1",
    worthIt:
      "Genuinely useful for getting a first help desk interview when you have no experience, and many HR filters screen for it. Its technical value is modest if you already build and troubleshoot systems - the value is passing the filter, and that is a legitimate reason.",
    mapsToPhases: ["Y1-P02", "Y1-P03", "Y1-P10"],
  },
  {
    id: "cert-netplus",
    name: "CompTIA Network+",
    vendor: "CompTIA",
    yearId: "year-1",
    worthIt:
      "Worth it if networking is your weak area, and networking is the most common weak area for people entering IAM. Skippable if you can already explain DNS, DHCP and subnetting without hesitating. Consider going straight to CCNA if networking interests you.",
    mapsToPhases: ["Y1-P03", "Y1-P05"],
  },
  {
    id: "cert-secplus",
    name: "CompTIA Security+",
    vendor: "CompTIA",
    yearId: "year-1",
    worthIt:
      "The highest-return certification on this list for an IAM career. It is a hard requirement for many government and contractor roles and a common HR filter everywhere else. Do this one even if you do no others.",
    mapsToPhases: ["Y1-P09", "Y2-P01", "Y2-P05"],
  },
  {
    id: "cert-sc300",
    name: "SC-300 Identity and Access Administrator",
    vendor: "Microsoft",
    yearId: "year-2",
    worthIt:
      "The most directly relevant certification for an IAM analyst working in a Microsoft estate, which is most estates. Maps almost one to one onto Year 2. Strongly recommended, and it is realistically your second certification after Security+.",
    mapsToPhases: ["Y2-P02", "Y2-P04", "Y2-P05", "Y2-P06", "Y2-P08"],
  },
  {
    id: "cert-okta-pro",
    name: "Okta Certified Professional",
    vendor: "Okta",
    yearId: "year-2",
    worthIt:
      "Valuable specifically if you are targeting employers who run Okta, and near-worthless if you are not. Check job postings in your market before spending anything. Vendor certifications are a bet on a particular employer population.",
    mapsToPhases: ["Y2-P04", "Y2-P06"],
  },
  {
    id: "cert-az104",
    name: "AZ-104 Azure Administrator",
    vendor: "Microsoft",
    yearId: "year-3",
    worthIt:
      "Useful supporting breadth for an IAM engineer, since identity rarely stays inside identity. Secondary to SC-300 if you must choose, but it fills the infrastructure context gap that IAM specialists often have.",
    mapsToPhases: ["Y3-P04", "Y3-P09"],
  },
  {
    id: "cert-sailpoint",
    name: "SailPoint IdentityIQ Engineer",
    vendor: "SailPoint",
    yearId: "year-3",
    worthIt:
      "High value in the specific market of enterprises running SailPoint, where qualified engineers are scarce and well paid. Access to training is usually through an employer or partner, which makes it hard to pursue independently - treat it as a goal once employed rather than a prerequisite.",
    mapsToPhases: ["Y3-P05"],
  },
  {
    id: "cert-cyberark",
    name: "CyberArk Defender",
    vendor: "CyberArk",
    yearId: "year-3",
    worthIt:
      "Same shape as SailPoint: strong value in a specific market, and normally reached through an employer. Learn the PAM concepts regardless, because they transfer to every vendor; the certification itself can wait.",
    mapsToPhases: ["Y3-P06"],
  },
  {
    id: "cert-cissp",
    name: "CISSP",
    vendor: "ISC2",
    yearId: "year-4",
    worthIt:
      "The standard credential for senior security roles and a frequent hard requirement for architect and management positions. It requires five years of documented experience - you can pass the exam earlier and hold Associate status until you qualify. This platform prepares you for the concepts; it does not and cannot certify you.",
    mapsToPhases: ["Y4-P01", "Y4-P03", "Y4-P04", "Y4-P09"],
  },
  {
    id: "cert-sabsa",
    name: "SABSA or TOGAF",
    vendor: "SABSA Institute / The Open Group",
    yearId: "year-4",
    worthIt:
      "Relevant only if you are moving into formal enterprise architecture where these frameworks are already in use. Check whether your target employers actually use them before investing - in organisations that do not, the credential carries very little weight.",
    mapsToPhases: ["Y4-P01", "Y4-P07"],
  },
];

export function getReferenceByYear(yearId: string): ReferenceSection[] {
  return referenceSections.filter((s) => s.yearId === yearId);
}

export function getInterviewByYear(yearId: string): InterviewQuestion[] {
  return interviewQuestions.filter((q) => q.yearId === yearId);
}

export function getCertificationsByYear(yearId: string): Certification[] {
  return certifications.filter((c) => c.yearId === yearId);
}
