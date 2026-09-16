import type { Ticket } from "./types";

/**
 * Year 3 and Year 4 work queues.
 *
 * These deliberately change shape as the career progresses. Year 1 and 2
 * tickets have a single concrete root cause to find. Year 3 tickets are
 * engineering defects where the visible symptom is several steps removed from
 * the bug. Year 4 items are not "tickets" in the help desk sense at all -
 * they are decision records, where the failure mode is choosing badly under
 * pressure rather than misdiagnosing. That progression is the point: an
 * architect who is still looking for a single root cause has not moved up.
 *
 * All organisations, people and systems are fictional.
 */

export const year3Tickets: Ticket[] = [
  {
    id: "ENG-001",
    yearId: "year-3",
    phaseId: "Y3-P02",
    title: "Joiner automation created duplicate accounts overnight",
    scenario:
      "The nightly joiner automation ran twice after an operator re-ran it when the first run appeared to hang. This morning there are 23 duplicate accounts in the Corporate OU with a numeric suffix, and the HR feed reconciliation report is failing.",
    businessImpact:
      "New starters have two accounts each and neither reliably receives group membership. Managers cannot tell which account to use. Every downstream system that consumed the feed now holds inconsistent identity data.",
    symptoms: [
      "23 accounts exist with a trailing numeric suffix on the sAMAccountName",
      "The reconciliation report errors with a uniqueness violation",
      "Some duplicates have group membership and some have none",
      "The first automation run produced no error output before it was killed",
    ],
    priority: "High",
    affectedAsset: "Joiner automation / Corporate OU / HR reconciliation job",
    evidenceAvailable: [
      "Automation script source",
      "Both run logs with timestamps",
      "HR source feed for the affected date",
      "AD object creation timestamps and whenCreated attributes",
    ],
    hiddenRootCause:
      "The provisioning script is not idempotent. It creates an account unconditionally instead of checking for an existing object first, and its uniqueness handling appends a numeric suffix on collision rather than treating the collision as 'already done'. The apparent hang in the first run was a slow directory replication, not a failure - so the operator's re-run was a second full create pass. The operator did nothing wrong; the script had no safe re-run guarantee.",
    hints: [
      "The operator re-ran the job. Should re-running a provisioning job twice ever produce a different result than running it once?",
      "Look at what the script does before it calls New-ADUser. Is there a check, and if so, what exactly is it matching on?",
      "Trace the suffix logic. When the script hits an existing account, what does it conclude - that the work is already done, or that it needs a new name?",
      "Compare the whenCreated timestamps against the two run logs. What does the gap tell you about whether the first run actually failed?",
    ],
    acceptanceCriteria: [
      "Duplicates identified, the authoritative account chosen per user, and the surplus removed with evidence",
      "Script refactored so a second run is a no-op rather than a second create",
      "Idempotency proven by running the fixed script twice against a test OU with identical end state",
      "Dry-run mode added so the next operator can see intent before applying",
      "Root cause written up as a script defect, not as operator error",
    ],
    escalationThreshold:
      "Escalate immediately if any duplicate account was granted privileged group membership, or if a downstream system has already provisioned entitlements against the wrong account.",
    remediation:
      "Add an existence check keyed on the immutable HR identifier rather than the display name, return success when the object already exists, add a -WhatIf dry-run path, and reconcile the duplicates using the earliest-created account as authoritative.",
    portfolioArtifact:
      "Idempotency incident report with the before and after script diff, proof of repeat-run safety, and the reconciliation evidence",
  },
  {
    id: "ENG-002",
    yearId: "year-3",
    phaseId: "Y3-P03",
    title: "API sync silently misses most users",
    scenario:
      "An integration pulls the workforce roster from a REST API and compares it with the directory. It reports 100 users every run and claims a clean reconciliation, but HR insists the company has over 400 staff. The job exits zero and nobody has questioned it for weeks.",
    businessImpact:
      "Leavers beyond the first 100 records are never detected, so their access is never removed. The organisation believes it has a working leaver control and it does not. This is an audit finding waiting to happen.",
    symptoms: [
      "The sync reports exactly 100 users every single run",
      "The job exits successfully with no warnings",
      "Spot-checked employees are absent from the sync output",
      "The number is suspiciously round and never varies",
    ],
    priority: "Critical",
    affectedAsset: "Workforce roster API integration / leaver detection control",
    evidenceAvailable: [
      "Integration source code",
      "Raw API response for a single call",
      "API documentation",
      "Run logs across several weeks",
    ],
    hiddenRootCause:
      "The client reads only the first page of a paginated API. The response body contains a 'next' cursor that the code never follows, and the API's default page size is 100. Because a partial result is still a valid result, nothing errors - the integration reports complete success on 25 percent of the data. The round number 100 is the tell.",
    hints: [
      "The count is exactly 100 every run, and never 99 or 101. What kind of number is that?",
      "Read the raw API response body carefully - all of it, including the fields the code ignores. What is in there besides the array of users?",
      "Check the API documentation for a default page size and for how it signals that more data exists.",
      "The job exits zero. Ask a harder question: how would this integration ever know it had incomplete data? What would have to be true for it to fail loudly?",
    ],
    acceptanceCriteria: [
      "Pagination implemented so every page is followed to exhaustion",
      "A sanity assertion added that fails the run if the record count is implausible or exactly equals the page size",
      "Backfill performed to identify leavers missed while the bug was live",
      "Rate limiting and retry with backoff handled during the backfill",
      "Written explanation of why a silent partial success is more dangerous than a crash",
    ],
    escalationThreshold:
      "Escalate now. Undetected leavers are an active access control failure. Notify the control owner and treat the missed-leaver population as a security finding, not just a bug.",
    remediation:
      "Follow the pagination cursor until exhausted, assert on expected record volume, add structured logging of pages fetched and total records, then backfill and remediate the leavers that were missed.",
    portfolioArtifact:
      "API integration defect report with root cause, the fix, the backfill methodology, and the control gap analysis",
  },
  {
    id: "ENG-003",
    yearId: "year-3",
    phaseId: "Y3-P07",
    title: "Nightly sync fails after scheduled credential rotation",
    scenario:
      "The service account credential for the directory sync was rotated on schedule on Friday evening, following the documented procedure. Since Saturday the nightly sync has failed every night with an authentication error, and the account has now locked out twice.",
    businessImpact:
      "Identity data has been stale for three days. Joiners are not provisioned and movers keep access they should have lost. The lockouts are also generating security alerts that are consuming analyst time.",
    symptoms: [
      "Authentication failures begin immediately after the rotation window",
      "The service account locked out twice, both times shortly after midnight",
      "The new credential works when tested manually",
      "Two separate jobs use this identity, and only one was updated",
    ],
    priority: "High",
    affectedAsset: "Directory sync service account / nightly provisioning job",
    evidenceAvailable: [
      "Rotation runbook and the completed change record",
      "Scheduler configuration for both jobs",
      "Authentication failure events with source host",
      "Lockout events with the originating caller",
    ],
    hiddenRootCause:
      "The credential is consumed in more places than the rotation runbook accounted for. A second scheduled task on a different host still holds the old password and retries on a timer, and those retries are what drive the lockout. The rotation itself succeeded; the inventory of consumers was incomplete. The manual test works because it uses the new credential directly.",
    hints: [
      "The new credential works when you test it by hand. So what exactly is presenting the old one?",
      "Read the lockout events rather than the authentication failures. Which host is the caller, and is it the host you expect?",
      "Count the consumers of this identity. How does the runbook know it found all of them?",
      "The lockouts cluster shortly after midnight. What else runs on a timer around then?",
    ],
    acceptanceCriteria: [
      "Every consumer of the credential enumerated and evidenced, not assumed",
      "All consumers updated and the sync verified green for a full cycle",
      "Rotation runbook amended to include a consumer inventory step and an overlap window",
      "Monitoring added that alerts on authentication failure from an unexpected source host",
      "Post-incident review records the process gap rather than blaming the rotation",
    ],
    escalationThreshold:
      "Escalate if the lockouts originate from a host that should not hold this credential at all - that is a potential compromise, not a rotation defect.",
    remediation:
      "Inventory all consumers from the lockout source evidence, update each one, adopt an overlap window where both credentials are briefly valid, and add source-host alerting to catch stragglers on the next rotation.",
    portfolioArtifact:
      "Credential rotation post-incident review with the consumer inventory method and the amended runbook",
  },
  {
    id: "ENG-004",
    yearId: "year-3",
    phaseId: "Y3-P05",
    title: "Access certification campaign shows entitlements that no longer exist",
    scenario:
      "A quarterly access certification campaign launched on Monday. Reviewers are complaining that they are being asked to approve access to systems that were decommissioned last quarter, and that several genuinely current entitlements are missing from the review entirely.",
    businessImpact:
      "Reviewers are losing confidence in the campaign and rubber-stamping to get through it. A certification that reviewers do not trust provides no assurance while still consuming hundreds of hours and producing an audit artifact that claims otherwise.",
    symptoms: [
      "Decommissioned systems appear in review items",
      "Some current entitlements are absent from the campaign",
      "Reviewers are approving in bulk without reading",
      "The entitlement catalog was last refreshed before the decommission",
    ],
    priority: "High",
    affectedAsset: "Access certification campaign / entitlement catalog",
    evidenceAvailable: [
      "Campaign configuration and its data snapshot date",
      "Entitlement catalog with last-refresh timestamps",
      "Decommission change records",
      "Reviewer completion times per item",
    ],
    hiddenRootCause:
      "The campaign was generated from a cached entitlement snapshot rather than from live source data, and the catalog refresh job has been failing silently since the decommission project. The missing current entitlements are ones created after the stale snapshot was taken. The campaign is internally consistent - it is just describing a world that stopped existing three months ago.",
    hints: [
      "Both symptoms are present at once: extra items and missing items. What single cause produces both?",
      "Find the date of the data the campaign was built from. Compare it against the decommission dates and the creation dates of the missing entitlements.",
      "Check whether the catalog refresh job is actually running. Is anyone alerted when it does not?",
      "Look at reviewer completion times. What does a two-second decision tell you about the assurance this campaign provides?",
    ],
    acceptanceCriteria: [
      "Campaign suspended rather than allowed to complete on bad data",
      "Catalog refresh failure root-caused and monitoring added so silent failure is impossible",
      "Campaign regenerated from verified live data and reviewers told plainly why it was reissued",
      "Reviewer completion time tracked as a quality signal going forward",
      "Written argument for why completing the bad campaign would have been worse than restarting it",
    ],
    escalationThreshold:
      "Escalate to the control owner and to audit before any results are published. A certification signed off on stale data is a misrepresentation, and letting it stand is worse than missing the deadline.",
    remediation:
      "Suspend the campaign, fix and monitor the refresh job, regenerate from live source data, communicate transparently to reviewers, and add completion-time telemetry to detect rubber-stamping.",
    portfolioArtifact:
      "Certification integrity report explaining the stale data root cause and the decision to restart rather than publish",
  },
  {
    id: "ENG-005",
    yearId: "year-3",
    phaseId: "Y3-P06",
    title: "Administrator performing privileged work from a daily-driver account",
    scenario:
      "During a routine review you notice a systems administrator has been making changes to domain controllers using the same account they use for email and web browsing. The changes themselves are legitimate, approved and correct. The administrator points out that they have done it this way for two years without incident.",
    businessImpact:
      "A single phishing click on that account compromises the domain. Tier separation exists precisely because administrators are high-value targets, and two years without incident is not evidence of safety - it is evidence of luck that has not run out yet.",
    symptoms: [
      "One account used for both email and domain controller administration",
      "The account is a member of a privileged group with standing access",
      "Sign-in logs show browser sessions and administrative sessions from the same identity",
      "A separate administrative account exists but has not been used in months",
    ],
    priority: "High",
    affectedAsset: "Administrator identity / domain controller tier",
    evidenceAvailable: [
      "Sign-in logs showing session types",
      "Group membership with the date it was granted",
      "Change records for the administrative work performed",
      "The unused separate administrative account",
    ],
    hiddenRootCause:
      "Tier separation was designed and the separate administrative account was created, but the workflow was never made practical - the admin account cannot access the ticketing system needed to record changes, so using it means constantly switching sessions. The control was bypassed because compliance with it was slower than ignoring it. This is a design failure, not a discipline failure.",
    hints: [
      "The administrator has a separate admin account and is not using it. Before assuming carelessness, ask what happens when they try.",
      "Walk through the administrator's actual workflow step by step with the admin account. Where does it break down?",
      "A control that is slower than the workaround will lose to the workaround every time. What would make the compliant path the easy path?",
      "Distinguish the two questions: is standing privileged access appropriate here at all, and separately, why is the existing control unusable?",
    ],
    acceptanceCriteria: [
      "The workflow obstacle identified and fixed so the compliant path is usable",
      "Tier separation enforced technically, not by policy alone, including logon restrictions",
      "Standing privileged access replaced with a time-bound elevation path",
      "Administrator engaged as a collaborator rather than disciplined",
      "Finding written up as a control design defect with the human factors named",
    ],
    escalationThreshold:
      "Escalate if the daily-driver account shows any sign of compromise, or if other administrators are doing the same thing - that indicates a systemic control failure rather than an individual case.",
    remediation:
      "Fix the tooling gap that made the admin account impractical, apply logon-type restrictions that technically prevent Tier 0 accounts on workstations, move to just-in-time elevation, and re-test the workflow with the administrator before enforcing.",
    portfolioArtifact:
      "Privileged access control review analysing why the control was bypassed and the usability fix that made compliance viable",
  },
  {
    id: "ENG-006",
    yearId: "year-3",
    phaseId: "Y3-P03",
    title: "Provisioning job fails intermittently with 401 after about an hour",
    scenario:
      "A long-running bulk provisioning job processes several thousand identities. It consistently succeeds for roughly the first hour and then begins returning 401 Unauthorized for every subsequent call. Restarting the job makes it work again - for about another hour.",
    businessImpact:
      "Bulk operations cannot complete in a single run. The team has resorted to restarting the job repeatedly through the night, which is unsustainable and has already caused partial-state inconsistencies when a restart overlapped a previous run.",
    symptoms: [
      "Succeeds for approximately 60 minutes then fails consistently",
      "Restart temporarily resolves it",
      "The failure is total after onset, not intermittent",
      "Short jobs never exhibit the problem",
    ],
    priority: "Medium",
    affectedAsset: "Bulk provisioning job / API client",
    evidenceAvailable: [
      "Job source code including the authentication path",
      "Token response body from the identity provider",
      "Request and response logs with timestamps",
      "API documentation on token lifetime",
    ],
    hiddenRootCause:
      "The client fetches an access token once at startup and reuses it for the life of the process. The token has a 60 minute lifetime, so every call after expiry fails. Restarting works because it fetches a fresh token. The code never inspects the expires_in value in the token response, and never handles 401 by refreshing.",
    hints: [
      "The failure time is consistent and close to a round number. What in an authentication flow has a lifetime measured in minutes?",
      "Look at where the token is acquired in the code. How many times does that happen across the life of the process?",
      "Read the full token response body. What field is being discarded?",
      "A short job never fails. What does that tell you about whether this is load-related or time-related?",
    ],
    acceptanceCriteria: [
      "Token refresh implemented proactively before expiry rather than reactively on failure",
      "A 401 handled by refreshing once and retrying, with a bounded retry count",
      "Job made resumable so a restart does not reprocess or duplicate completed work",
      "Clock skew tolerance included in the expiry calculation",
      "Full run completed successfully without restart, with evidence",
    ],
    escalationThreshold:
      "Escalate if partial runs have already produced inconsistent state in downstream systems - that needs reconciliation before the fix is deployed.",
    remediation:
      "Parse expires_in, refresh proactively with a safety margin, handle 401 with a single refresh-and-retry, add checkpointing so the job is resumable, and reconcile any inconsistent state from previous partial runs.",
    portfolioArtifact:
      "API authentication defect report covering token lifecycle handling, retry design, and job resumability",
  },
  {
    id: "ENG-007",
    yearId: "year-3",
    phaseId: "Y3-P05",
    title: "Leaver retains access to a business system after deprovisioning completed",
    scenario:
      "A leaver was processed correctly last month. The directory account is disabled, the ticket is closed and the leaver checklist is fully signed off. During an unrelated review, their account is found still active in a customer-facing SaaS application, and it was accessed after their departure date.",
    businessImpact:
      "A former employee retained access to customer data after leaving. This is a reportable access control failure and potentially a data protection incident. Every other leaver processed under the same checklist is now in question.",
    symptoms: [
      "Directory account correctly disabled on the departure date",
      "Leaver checklist fully signed off",
      "The SaaS account remains active",
      "Access recorded after the departure date",
    ],
    priority: "Critical",
    affectedAsset: "Departed employee identity / customer-facing SaaS application",
    evidenceAvailable: [
      "Leaver ticket and completed checklist",
      "Directory account status and disable timestamp",
      "SaaS application user list and access logs",
      "Application inventory and its integration status",
    ],
    hiddenRootCause:
      "The SaaS application authenticates locally rather than through the directory, so disabling the directory account has no effect on it. It was onboarded by a business unit without going through IAM, so it never appeared on the leaver checklist. The checklist is complete and correct for every application it knows about - the failure is that the application inventory is incomplete. Any other shadow-onboarded application has the same gap.",
    hints: [
      "The checklist was completed correctly and the outcome is still wrong. So the defect is not in execution - where else could it be?",
      "How does this application actually authenticate users? Trace it, do not assume it federates.",
      "Ask how this application got onboarded and who approved it. Does IAM know it exists?",
      "Do not stop at this one application. What is the population of applications that could have the same problem, and how would you find out?",
    ],
    acceptanceCriteria: [
      "Access revoked immediately and the post-departure access reviewed for what was actually accessed",
      "Incident reported through the correct channel given customer data exposure",
      "Full application inventory reconciled to find every other locally-authenticating system",
      "All leavers from the affected period re-checked against the newly discovered applications",
      "Onboarding control added so a new application cannot go live without an offboarding path",
    ],
    escalationThreshold:
      "Escalate immediately and in parallel with remediation. Post-departure access to customer data is a security incident with potential regulatory notification duties - do not wait until the investigation is complete to report it.",
    remediation:
      "Revoke access, assess what was accessed after departure, report the incident, reconcile the application inventory, re-check the affected leaver population, and add an IAM gate to application onboarding.",
    portfolioArtifact:
      "Deprovisioning gap incident report with the shadow IT inventory findings and the systemic control added",
  },
  {
    id: "ENG-008",
    yearId: "year-3",
    phaseId: "Y3-P07",
    title: "Working credential found in repository commit history",
    scenario:
      "A secret scanner flags an API credential in a repository. The current version of the file does not contain it - it was removed in a commit three months ago. Testing confirms the credential is still valid. The repository is internal, but it has been cloned by an unknown number of people.",
    businessImpact:
      "A valid credential has been readable by anyone with repository access for three months, and exists in every clone and fork. Removing it from the current file achieved nothing, because Git keeps history. The credential must be treated as compromised.",
    symptoms: [
      "Scanner flags a credential in commit history",
      "The current file is clean",
      "The credential still authenticates successfully",
      "The repository has an unknown number of clones",
    ],
    priority: "Critical",
    affectedAsset: "Repository history / integration service credential",
    evidenceAvailable: [
      "Scanner finding with the commit hash",
      "Full commit history and author information",
      "Repository access log and clone events",
      "Authentication logs for the exposed credential",
    ],
    hiddenRootCause:
      "The credential was committed, then removed in a later commit, which the author believed resolved it. Git history is immutable by design, so the secret remained fully readable in every clone for three months. The deeper cause is that there was no pre-commit secret scanning, so the only control was the author noticing - and the author did notice, and still got it wrong, because removing a file is not the same as removing history.",
    hints: [
      "The file is clean today and the secret is still exposed. What does Git actually store, and what does deleting a line from a file change about that?",
      "Order the response correctly before you do anything else. Of rotating the credential and scrubbing the history, which one actually stops the bleeding, and which one is cleanup?",
      "The repository has been cloned. What does that mean for your ability to make the secret unreachable by rewriting history?",
      "Check whether the credential was used from anywhere unexpected during the exposure window. Absence of evidence is not evidence of absence - say so explicitly.",
    ],
    acceptanceCriteria: [
      "Credential rotated and the old one revoked FIRST, before any history work begins",
      "Authentication logs reviewed across the full exposure window for unexpected use",
      "History remediation attempted with an explicit written acknowledgement that existing clones cannot be recalled",
      "Pre-commit secret scanning added so detection no longer depends on a human noticing",
      "Incident documented including the exposure window and the limits of the remediation",
    ],
    escalationThreshold:
      "Escalate immediately. Treat as compromised from the moment of the original commit, not from the moment of discovery, and say so in the report.",
    remediation:
      "Revoke and rotate first, then investigate use during the exposure window, then scrub history while stating plainly that clones cannot be recalled, and finally add pre-commit scanning plus secret injection at runtime.",
    portfolioArtifact:
      "Secret exposure incident report with the response ordering rationale and the honest limits of history rewriting",
  },
];

export const year4Tickets: Ticket[] = [
  {
    id: "ARCH-001",
    yearId: "year-4",
    phaseId: "Y4-P07",
    title: "Post-acquisition directory merge with colliding identities",
    scenario:
      "OMARI Technologies has acquired a smaller competitor. Both organisations run their own directory. There are 41 people whose username collides with an existing OMARI account, and 6 people who genuinely work for both entities under different identities. The integration deadline is 90 days, set by the board before anyone consulted IAM.",
    businessImpact:
      "Acquired staff cannot access OMARI systems and OMARI staff cannot collaborate with them. Every week of delay costs integration value. A botched merge, however, creates identity collisions that are extremely expensive to unpick later, and some choices here are effectively permanent.",
    symptoms: [
      "41 username collisions across the two directories",
      "6 people legitimately present in both with different identifiers",
      "Different UPN suffixes and naming conventions on each side",
      "A 90 day deadline set without IAM input",
    ],
    priority: "High",
    affectedAsset: "Enterprise identity architecture / both directory forests",
    evidenceAvailable: [
      "Both directory exports with attributes",
      "HR records from both organisations",
      "Application inventory for both estates",
      "Board integration timeline and its stated business drivers",
    ],
    hiddenRootCause:
      "There is no single defect to find. This is a decision under constraint, and the real risk is committing to an irreversible identity design to meet a deadline that was set without technical input. The correct move is to separate what must be decided now from what can be deferred, and to renegotiate the deadline with evidence rather than silently accepting it and cutting corners on the parts that cannot be undone.",
    hints: [
      "Which decisions here are genuinely irreversible, and which only feel urgent? Separate those two lists before designing anything.",
      "The 6 dual-identity people are not an edge case to defer - they define your identity model. What does your answer for them imply for everyone else?",
      "Consider coexistence rather than a single cutover. What would have to be true for both directories to operate authoritatively for a period?",
      "The deadline was set without IAM input. What evidence would you need to renegotiate it, and what is the cost of not trying?",
    ],
    acceptanceCriteria: [
      "Target identity model defined including the naming convention and the authoritative source",
      "Collision resolution rule documented, with the 6 dual-identity cases explicitly resolved",
      "Coexistence plan covering the period where both directories are live",
      "Irreversible decisions listed separately, with the rationale recorded for each",
      "Deadline either evidenced as achievable or formally renegotiated with the risk stated in writing",
    ],
    escalationThreshold:
      "Escalate to the executive sponsor if the deadline forces an irreversible identity decision without adequate analysis. Putting that trade-off in writing is the job, not an escape from it.",
    remediation:
      "Produce a decision record: target model, collision rules, coexistence approach, phased cutover, and an explicit written statement of what is irreversible and what risk the timeline imposes.",
    portfolioArtifact:
      "Merger identity architecture decision record with collision strategy, coexistence plan, and documented irreversible decisions",
  },
  {
    id: "ARCH-002",
    yearId: "year-4",
    phaseId: "Y4-P03",
    title: "Executive requests a permanent MFA exemption",
    scenario:
      "A senior executive finds MFA disruptive while travelling and has formally requested a permanent exemption. They have escalated to the CIO, who has asked you for a recommendation. The executive has broad access to financial and strategic data, and is exactly the profile attackers target.",
    businessImpact:
      "Granting it removes the strongest available control from one of the highest-value accounts in the company. Refusing it without offering a workable alternative damages the credibility of the security function and invites the exemption to be granted over your head anyway.",
    symptoms: [
      "Formal exemption request from a high-privilege user",
      "Escalated to CIO level",
      "Genuine usability friction while travelling",
      "The account has broad access to sensitive data",
    ],
    priority: "High",
    affectedAsset: "Executive identity / conditional access policy",
    evidenceAvailable: [
      "The exemption request and its stated reasons",
      "The executive's access footprint",
      "Threat intelligence on executive account targeting",
      "Available authentication method options and their usability profiles",
    ],
    hiddenRootCause:
      "The stated problem is MFA, but the actual problem is almost always a specific method failing in a specific situation - typically SMS or push failing on international roaming with poor connectivity. Treating it as a binary exempt-or-refuse question misses that a different authenticator solves it completely. The request is legitimate friction wearing the costume of a policy dispute.",
    hints: [
      "Do not answer the question as asked. Find out what actually happens when they try to authenticate abroad - which method, which failure, how often.",
      "What authentication methods work with no connectivity at all? Does the executive know those exist?",
      "If you refuse with no alternative, what happens next? Model that outcome honestly before you choose your position.",
      "Frame the risk in terms the executive cares about. What does a compromise of this specific account cost the business?",
    ],
    acceptanceCriteria: [
      "The underlying friction diagnosed specifically rather than the request answered as posed",
      "An alternative proposed that works offline, such as a hardware security key or TOTP",
      "Risk articulated in business terms, not control terms",
      "If any exemption is granted, it is time-bound with compensating controls and a review date",
      "Decision documented with the accountable owner named",
    ],
    escalationThreshold:
      "If a permanent unmitigated exemption is directed despite the recommendation, document the accepted risk formally, name the risk owner, and place it on the risk register. Escalation here means recording, not resisting.",
    remediation:
      "Diagnose the specific failing method, provision a hardware security key, validate it against the executive's real travel pattern, and close the exemption request as resolved rather than refused.",
    portfolioArtifact:
      "Risk-based exemption decision record with alternatives evaluated, business-language risk statement, and the named risk owner",
  },
  {
    id: "ARCH-003",
    yearId: "year-4",
    phaseId: "Y4-P01",
    title: "Critical legacy application cannot support modern authentication",
    scenario:
      "The SSO rollout has reached a 15-year-old application that runs a core business process. It supports only local accounts with its own password store. The vendor no longer exists. Replacement is estimated at 18 months and a budget nobody has allocated. Roughly 200 staff use it daily.",
    businessImpact:
      "It is the only system holding local credentials outside the directory, so it is exempt from password policy, MFA, lockout policy and central deprovisioning. It is both the weakest link and genuinely business-critical, which is why previous attempts to address it stalled.",
    symptoms: [
      "Local authentication only, with no federation capability",
      "No vendor support and no upgrade path",
      "Around 200 daily users on a core process",
      "Credentials exist outside all central identity controls",
    ],
    priority: "High",
    affectedAsset: "Legacy business application / enterprise SSO architecture",
    evidenceAvailable: [
      "Application technical documentation",
      "Local user list and password policy configuration",
      "Network architecture and access paths",
      "Replacement project estimate and business case",
    ],
    hiddenRootCause:
      "There is no fix that makes the application modern. The architectural error is treating this as binary - either federate it or accept the risk. The professional answer is layered compensating controls that reduce exposure without touching the application, combined with an honest risk acceptance for what remains and a funded path to eventual replacement.",
    hints: [
      "You cannot change the application. What can you change around it?",
      "If you place the application behind an identity-aware proxy or restrict it to a controlled network path, which risks does that actually remove and which does it leave untouched? Be precise.",
      "Deprovisioning is the sharpest gap. What manual or scripted control closes it, and what is that control's own failure mode?",
      "Some residual risk will remain. Who owns it, and what does a defensible written acceptance look like?",
    ],
    acceptanceCriteria: [
      "Layered compensating controls designed, each mapped to the specific risk it reduces",
      "Residual risk stated explicitly rather than implied",
      "Deprovisioning gap closed by a defined and monitored process",
      "Risk formally accepted by a named owner with a review date",
      "Replacement path costed and placed on the roadmap rather than left aspirational",
    ],
    escalationThreshold:
      "Escalate for a formal risk acceptance decision. An architect does not silently absorb this risk - the business owner accepts it in writing, with the residual clearly stated.",
    remediation:
      "Place the application behind an access proxy, restrict network reachability, enforce credential standards by process where the application cannot, monitor authentication centrally, close deprovisioning with a monitored procedure, and record a formal risk acceptance with a funded replacement roadmap.",
    portfolioArtifact:
      "Legacy application security architecture with compensating control mapping, residual risk statement, and formal acceptance record",
  },
  {
    id: "ARCH-004",
    yearId: "year-4",
    phaseId: "Y4-P05",
    title: "Audit finds several hundred accounts with standing privileged access",
    scenario:
      "An external audit has identified 412 accounts holding standing privileged access across the estate. Management's instinct is to remove them all this weekend to clear the finding before the report is issued. Nobody has established which of those entitlements are actually in use.",
    businessImpact:
      "The finding is legitimate and standing privilege at this scale is a serious exposure. But removing 412 privileged entitlements without knowing which support live business processes risks a self-inflicted outage across an unknown number of systems, which would be worse than the finding.",
    symptoms: [
      "412 accounts with standing privileged access",
      "No usage data available for the entitlements",
      "Pressure to remediate before the report is issued",
      "Unknown dependency between these accounts and running processes",
    ],
    priority: "High",
    affectedAsset: "Privileged access model across the enterprise",
    evidenceAvailable: [
      "Audit finding with the account population",
      "Privileged group membership with grant dates",
      "Available authentication and usage logs",
      "Service account inventory",
    ],
    hiddenRootCause:
      "The 412 accounts are not a single population. They are a mix of stale human accounts that can be removed immediately, service accounts whose removal breaks production, and genuinely required administrative access. Treating them as one bucket is what makes both the mass-removal and the do-nothing options bad. The absent usage data is the actual blocker, and it is obtainable.",
    hints: [
      "Before deciding anything, segment the population. What distinct categories are hiding inside that single number of 412?",
      "You lack usage data. How long would it take to get it, and what does that cost compared to an unplanned outage?",
      "Which subset can you remove today with near-zero risk, and what does removing it do to the finding?",
      "The audit deadline is driving the urgency. What can you commit to that satisfies the auditor without gambling production?",
    ],
    acceptanceCriteria: [
      "Population segmented into categories with counts and rationale",
      "Usage telemetry enabled before bulk removal",
      "Phased remediation with the zero-risk subset removed first",
      "Just-in-time elevation designed for the genuinely required access",
      "A remediation plan with dates agreed with audit instead of a rushed weekend change",
    ],
    escalationThreshold:
      "Escalate if mass removal is directed without usage analysis. Document the outage risk in writing and require an accountable owner for that decision.",
    remediation:
      "Segment the population, enable usage logging, remove the stale human accounts immediately, migrate service accounts to managed identities on a plan, implement JIT elevation for the remainder, and agree the phased timeline with audit.",
    portfolioArtifact:
      "Privileged access remediation strategy with population segmentation, phased plan, and the outage risk analysis that justified phasing",
  },
  {
    id: "ARCH-005",
    yearId: "year-4",
    phaseId: "Y4-P08",
    title: "Identity provider outage locks the entire workforce out",
    scenario:
      "The cloud identity provider suffered a four-hour regional outage. Because SSO was rolled out successfully to nearly every application, essentially nobody could work - including the incident response team, who could not authenticate to the tools needed to manage the incident.",
    businessImpact:
      "Four hours of total workforce productivity loss. More seriously, the incident response capability itself was unavailable, meaning a concurrent security incident would have been unmanageable. The SSO programme's success is exactly what created the single point of failure.",
    symptoms: [
      "Total authentication failure across the estate",
      "Incident responders locked out of their own tooling",
      "No documented break-glass path that worked",
      "Recovery entirely dependent on the provider's own timeline",
    ],
    priority: "Critical",
    affectedAsset: "Enterprise authentication architecture / business continuity",
    evidenceAvailable: [
      "Provider incident report and status history",
      "Application inventory with authentication dependencies",
      "Existing business continuity plan",
      "Break-glass account documentation, such as it is",
    ],
    hiddenRootCause:
      "Centralising authentication concentrated risk, and the resilience design never caught up with the rollout. The specific failure that turned an outage into a crisis is that break-glass accounts either did not exist, depended on the same failed provider, or had credentials nobody could reach without authenticating first. The circular dependency is the finding.",
    hints: [
      "Trace the dependency chain for your break-glass path. Does any step require the very system that is down?",
      "The incident responders were locked out too. What does that say about where resilience planning stopped?",
      "You cannot make a third-party provider never fail. So what is actually in scope for you to control?",
      "A break-glass credential you cannot reach during an outage is not a control. Where does it have to live, and what does that mean for how it is protected and monitored?",
    ],
    acceptanceCriteria: [
      "Authentication dependency map produced, including the dependencies of the recovery path itself",
      "Break-glass accounts designed with no dependency on the primary provider",
      "Break-glass credentials stored so they are reachable during a total outage, with tamper-evident protection and alerting on use",
      "Tiered continuity defining which functions must survive an IdP outage",
      "The break-glass path tested under simulated outage, not merely documented",
    ],
    escalationThreshold:
      "Escalate to executive level. This is enterprise business continuity, not an IAM defect, and the funding decision sits above the architecture function.",
    remediation:
      "Map authentication dependencies including the recovery path, implement independent break-glass access with monitored offline credential storage, define tiered continuity requirements, and run a live failure exercise to prove the path works.",
    portfolioArtifact:
      "Authentication resilience architecture with dependency mapping, break-glass design, and evidence from a tested outage exercise",
  },
  {
    id: "ARCH-006",
    yearId: "year-4",
    phaseId: "Y4-P06",
    title: "Third-party integration requests broad tenant-wide permissions",
    scenario:
      "A business unit has selected a SaaS analytics tool and wants it integrated this quarter. During review you find its integration requests tenant-wide read access to all mailboxes and all files, granted as application permissions with no user context. The vendor states these are required and that all their customers approve them.",
    businessImpact:
      "Approving it grants a third party standing, unattended access to all corporate mail and documents - a larger data exposure than most employee accounts represent. Refusing without alternatives blocks a business initiative with executive backing and pushes the business unit toward buying it without telling you.",
    symptoms: [
      "Tenant-wide application permissions requested",
      "No user context or per-user consent in the access model",
      "Vendor asserts the scope is mandatory",
      "Business pressure to approve within the quarter",
    ],
    priority: "High",
    affectedAsset: "Tenant-wide data / third-party integration governance",
    evidenceAvailable: [
      "Requested permission scopes in full",
      "Vendor security documentation and attestations",
      "The stated business requirement",
      "Available scoping mechanisms in the platform",
    ],
    hiddenRootCause:
      "The vendor asks for the broadest scope because it is simpler for them to build against, not because the business requirement needs it. Most platforms support scoping application permissions to a specific subset of mailboxes or sites. The failure mode is accepting the vendor's framing that the request is atomic, when the actual business requirement usually touches a fraction of the data requested.",
    hints: [
      "Separate two different things: what the vendor asked for, and what the business outcome actually requires. Write both down.",
      "Does your platform support constraining application permissions to a subset of mailboxes or sites? Check before conceding the point.",
      "Application permissions run unattended with no user in the loop. What does that change about your monitoring and revocation requirements?",
      "If the vendor genuinely cannot be scoped down, that is itself a finding about the product. What does that tell you about the selection decision?",
    ],
    acceptanceCriteria: [
      "Actual data requirement established independently of the vendor's request",
      "Scoped permissions applied so access is limited to the required subset",
      "Monitoring and alerting configured for the application identity's activity",
      "Revocation procedure defined and tested before go-live",
      "If broad scope is unavoidable, risk formally accepted by a named business owner with a review date",
    ],
    escalationThreshold:
      "Escalate if the business proceeds without approval or if broad tenant-wide consent is granted over the recommendation. Unattended third-party access to all corporate data is a board-level risk.",
    remediation:
      "Establish the true data requirement, apply application access policy to scope permissions to the required subset, monitor the application identity, test revocation, and record a formal risk acceptance for anything that cannot be scoped.",
    portfolioArtifact:
      "Third-party integration risk assessment with scope reduction analysis, monitoring design, and the governance decision record",
  },
];
