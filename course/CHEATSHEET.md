# Security Journey Cheat Sheet

_Auto-generated from the Security Journey Explorer lessons. One master memory hook + the key commands per lesson._

## 01 · The Security Mindset

> ★ Protect C-I-A. Risk = likelihood × impact. Think like the attacker, act like the defender.

| Command | What it does |
|---|---|
| `C · I · A` | secret · correct · available |
| `risk` | likelihood × impact |
| `vulnerability / threat / exploit` | weakness / actor / technique |
| `prevent · detect · respond` | control types |
| `MITRE ATT&CK` | catalogue of attacker tactics |
| `Attack · Defense · In my world` | note format |

**Memory hooks:**

- **The CIA triad**: C = secret, I = correct, A = available.
- **Threat, vulnerability, risk**: Vulnerability = weak spot. Threat = who/what could use it. Risk = likelihood × impact.
- **Think like an attacker**: Recon → access → escalate → move → impact. Break the chain early.
- **Controls**: Prevent · Detect · Respond. Never rely on one.
- **Attack · Defense · In my world**: Attack → Defense → In my world. Three lines, every time.

## 02 · Networks Through an Attacker's Eyes

> ★ Every open port is a door. Public: 80/443 only. Everything else: private or closed.

| Command | What it does |
|---|---|
| `22 · 80 · 443 · 3306 · 5432 · 6379 · 3389` | common ports |
| `open / closed / filtered` | nmap states |
| `attack surface` | everything reachable |
| `Session Manager` | no port 22 |
| `SG` | stateful, allow-only |
| `NACL` | stateless, allow + deny |

**Memory hooks:**

- **IP, ports and protocols**: 22 SSH · 80/443 web · 3306/5432 databases · 3389 RDP · 6379 Redis.
- **DNS and HTTP**: Forgotten subdomains are free targets. HTTPS everywhere.
- **Port scanning**: open = answering · closed = nobody home · filtered = firewall.
- **Shrink the attack surface**: Fewer doors, fewer break-ins. No port 22: use Session Manager.
- **Security groups and NACLs**: SG = stateful, allow-only, instance. NACL = stateless, allow+deny, subnet.

## 03 · Linux Logs for Defenders

> ★ Logs are the CCTV of a server. grep first, then automate.

| Command | What it does |
|---|---|
| `/var/log/auth.log · /var/log/secure` | login & sudo logs |
| `journalctl -u ssh` | one service's log |
| `grep \| sort \| uniq -c` | count per IP |
| `Failed × N → Accepted` | compromise |
| `PasswordAuthentication no` | keys only |
| `CloudWatch metric filter · GuardDuty` | at scale |

**Memory hooks:**

- **Where the logs live**: auth.log / secure = who tried to get in. journalctl -u = one service's story.
- **Spot the brute force**: Burst of "Failed password" + common usernames + one IP = brute force.
- **The scariest line**: Failed × N then Accepted from the same IP = compromise.
- **Defend the door**: Keys only · no root login · fail2ban · or no SSH at all.
- **At cloud scale**: Central logs + metric filter + alarm. GuardDuty spots brute force for you.

## 04 · IAM Attacks & Defenses

> ★ Leaked key + "Action": "*" = game over. Least privilege + no long-lived keys = game saved.

| Command | What it does |
|---|---|
| `AKIA…` | long-lived key: avoid |
| `"Action":"*","Resource":"*"` | admin in disguise |
| `iam:PassRole on *` | privilege escalation |
| `Identity Center + MFA` | people |
| `roles / OIDC` | workloads & CI |
| `deactivate → CloudTrail → clean up` | leaked key response |

**Memory hooks:**

- **Leaked access keys**: AKIA in a repo = assume compromised. Delete, don't just rotate later.
- **Wildcard policies**: "*" on Action AND Resource = AdministratorAccess in disguise.
- **Privilege escalation**: PassRole on * = "become any role". Scope it to named roles.
- **The defensive toolkit**: People → Identity Center + MFA. Workloads → roles. CI → OIDC. Audit → Access Analyzer.
- **Responding to a leaked key**: Deactivate → investigate (CloudTrail) → remove persistence → delete → learn.

## 05 · Secure AWS Account Baseline

> ★ Root locked · trail on · detectors on · public access blocked · budget alert · encryption by default.

| Command | What it does |
|---|---|
| `root: MFA, no keys` | first |
| `multi-Region CloudTrail` | record |
| `GuardDuty · Security Hub` | detect · score |
| `Block Public Access` | account-wide |
| `Access Analyzer` | external access |
| `budget alert` | cost = security signal |

**Memory hooks:**

- **Lock down root**: Root: MFA yes, keys no, daily use never.
- **See everything**: Trail = record. GuardDuty = detect. Security Hub = score.
- **Close the classic holes**: Block Public Access + Access Analyzer + default encryption.
- **Budgets are a security control**: Unexpected cost = unexpected activity. Alert on it.
- **Prove it and document it**: Before score → fixes → after score → write-up.

## 06 · Protect Networks & Data in AWS

> ★ 0.0.0.0/0 on a non-web port = finding. Unencrypted or public bucket = finding. Secret in code = finding.

| Command | What it does |
|---|---|
| `0.0.0.0/0 on non-80/443` | finding |
| `SG → SG references` | tier-to-tier access |
| `KMS` | keys, key policy, audit |
| `Secrets Manager / Parameter Store` | secrets out of code |
| `WAF · Shield` | L7 rules · DDoS |
| `Macie` | find PII in S3 |

**Memory hooks:**

- **Open security groups**: World-open: only 80/443. Everything else: SG-to-SG.
- **Encrypt data at rest with KMS**: KMS = keys + key policy + CloudTrail audit. Encrypt by default.
- **Secrets out of code**: Secrets → Secrets Manager (rotation) or Parameter Store. Read at runtime via role.
- **Edge protection**: WAF = layer 7 rules (SQLi, XSS, rate). Shield = DDoS.
- **Find sensitive data**: Macie = find sensitive data in S3.

## 07 · Detection & Incident Response

> ★ Prepare → Detect → Contain → Investigate → Eradicate & recover → Learn.

| Command | What it does |
|---|---|
| `Prepare → Detect → Contain → Investigate → Recover → Learn` | IR lifecycle |
| `severity 7–8.9 high, 9+ critical` | GuardDuty |
| `snapshot first` | preserve evidence |
| `quarantine SG` | isolate |
| `Detective · Flow Logs · CloudTrail` | investigate |
| `EventBridge → Lambda` | auto-contain |

**Memory hooks:**

- **Prepare before it happens**: No logs, no playbook, no practice = no response.
- **Detect and triage**: Sort by severity, group by resource, confirm, then act.
- **Contain, but keep evidence**: Snapshot → quarantine SG → revoke sessions. Terminate last.
- **Investigate, eradicate, recover**: CloudTrail + Flow Logs + Detective → remove persistence → rebuild clean.
- **Automate and learn**: Repeatable response → automate. Every incident → lessons learned.

## 08 · SQL Injection

> ★ Never build queries with string formatting. Parameters keep data as data.

| Command | What it does |
|---|---|
| `' OR '1'='1` | tautology attack |
| `f"…{x}…" in SQL` | vulnerable |
| `execute(sql, (x,))` | parameterized: safe |
| `least-privilege DB user` | limit damage |
| `RLS` | Supabase/Postgres row rules |
| `WAF SQLi rules` | edge layer |

**Memory hooks:**

- **The vulnerable code**: f"…{input}…" inside SQL = the user writes part of your query.
- **The attack**: The quote closes your string; the rest becomes their code.
- **The defense: parameters**: Placeholder in the SQL, value in the parameters. Always.
- **Defense in depth**: Parameters + least-privilege DB user + validation + quiet errors + RLS.
- **At the edge**: WAF catches common payloads. Parameters fix the bug.

## 09 · XSS & CSRF

> ★ XSS: escape output. CSRF: require a secret token (and SameSite cookies).

| Command | What it does |
|---|---|
| `stored / reflected / DOM XSS` | types |
| `html.escape()` | escape output |
| `CSP · HttpOnly` | extra XSS layers |
| `CSRF` | forged request with victim's cookies |
| `CSRF token + SameSite` | defenses |
| `hmac.compare_digest` | constant-time compare |

**Memory hooks:**

- **Stored XSS**: User text rendered as HTML = attacker code in your users' browsers.
- **Escape output**: html.escape() on the way OUT. Never innerHTML untrusted text.
- **More XSS layers**: CSP limits which scripts run. HttpOnly hides the session cookie from scripts.
- **CSRF**: Cookies are sent automatically, so "logged in" ≠ "intended".
- **Stop CSRF**: CSRF token + SameSite cookies. Compare tokens in constant time.

## 10 · Broken Authentication & Access Control

> ★ Hash passwords slowly with a salt. Check ownership on EVERY object, every request.

| Command | What it does |
|---|---|
| `bcrypt · Argon2 · PBKDF2 + salt` | password storage |
| `credential stuffing / spraying` | login attacks |
| `MFA + rate limit` | login defense |
| `HttpOnly, Secure, SameSite, short expiry` | sessions |
| `IDOR / BOLA` | missing ownership check |
| `RLS: owner_id = auth.uid()` | DB-level authZ |

**Memory hooks:**

- **Storing passwords**: Salt (unique) + slow hash (bcrypt / Argon2 / PBKDF2). Never MD5, never plain text.
- **Login attacks**: MFA beats stolen passwords. Rate-limit logins. Don't reveal which part was wrong.
- **Sessions and tokens**: Random, short-lived, HttpOnly, rotated, revocable.
- **IDOR: the ownership bug**: Logged in ≠ allowed. Check owner on every object.
- **Authorization done right**: Deny by default · central check · RLS · UUIDs as a bonus, not a fix.

## 11 · SSRF, Path Traversal & Uploads

> ★ Never fetch a user's URL blindly. Allowlist hosts, block internal IPs, use IMDSv2.

| Command | What it does |
|---|---|
| `SSRF` | server fetches attacker URL |
| `169.254.169.254` | EC2 metadata |
| `IMDSv2: HttpTokens=required` | AWS defense |
| `https + host allowlist + no private IPs` | URL validation |
| `../` | path traversal |
| `uploads → S3, renamed, checked` | file safety |

**Memory hooks:**

- **The feature**: User-chosen URL + server-side fetch = SSRF risk.
- **The attack**: 169.254.169.254 = metadata. localhost / 10.x / 172.16–31.x / 192.168.x = internal.
- **IMDSv2**: HttpTokens=required (IMDSv2) on every instance.
- **Validate URLs**: https only · host allowlist · no private/loopback/link-local IPs · no blind redirects.
- **Path traversal and uploads**: No user input in file paths. Uploads → S3, renamed, size-limited, type-checked.

## 12 · API Security

> ★ Authorize every object, limit every client, accept only known fields, protect every webhook.

| Command | What it does |
|---|---|
| `BOLA` | owner check per object |
| `response model` | no excessive data |
| `throttling · rate rules · 429` | rate limiting |
| `request model allowlist` | stop mass assignment |
| `OAuth/OIDC, scopes, authorizers` | API auth |
| `HMAC signature + timestamp` | webhook defense |

**Memory hooks:**

- **BOLA and data exposure**: Owner check on every object. Response model = only needed fields.
- **Rate limiting**: Limit per client, per window. Expensive endpoints (login, AI) get the tightest limits.
- **Mass assignment**: Request model = allowlist of fields. Never update(**request.json()).
- **Authentication for APIs**: Standard auth, scoped tokens, authorizers, and an inventory of every endpoint.
- **Protecting webhooks**: Webhook = public door. Verify signature, check timestamp, validate payload.

## 13 · LLM & AI Agent Security

> ★ All text the model reads is untrusted. All text it writes is untrusted. Give tools the least power possible.

| Command | What it does |
|---|---|
| `direct / indirect prompt injection` | user / content |
| `system prompt ≠ security boundary` | never rely on it |
| `delimit untrusted content` | data, not instructions |
| `LLM output = untrusted` | escape, validate |
| `excessive agency` | tool allowlist + approvals |
| `max_tokens + budgets` | unbounded consumption |

**Memory hooks:**

- **Direct prompt injection**: The system prompt is guidance, not a security boundary.
- **Indirect injection**: Anything the model reads can contain instructions. Treat it as data.
- **Guard the input**: Screen + delimit + size-limit inputs. No secrets in the prompt.
- **Treat output as untrusted**: LLM output = user input. Escape, validate, never execute directly.
- **Limit agency**: Fewest tools · narrowest credentials · human-in-the-loop for risky actions · spend caps.

## 14 · GRC Basics

> ★ Governance = who decides. Risk = what matters most. Compliance = prove it.

| Command | What it does |
|---|---|
| `G · R · C` | govern · risk · comply |
| `score = L × I` | risk register |
| `mitigate · transfer · accept · avoid` | treatments |
| `NIST CSF 2.0` | Govern Identify Protect Detect Respond Recover |
| `Artifact · Audit Manager` | AWS reports · your evidence |
| `Data Privacy Act 2012` | Philippines, NPC |

**Memory hooks:**

- **Governance**: Policy says what. Owner says who. Review says how well.
- **Risk management**: Score = L × I. 15+ high · 8–14 medium · under 8 low.
- **Risk treatment**: Mitigate · Transfer · Accept · Avoid.
- **Frameworks and compliance**: NIST CSF: Govern, Identify, Protect, Detect, Respond, Recover.
- **GRC on AWS**: Artifact = AWS's reports. Audit Manager = your evidence. Config/Security Hub = controls as code.

## 15 · Your Security Journey & Portfolio

> ★ Learn → write the note → build the project → show the evidence → tell the story.

| Command | What it does |
|---|---|
| `CCP → IAM plan + Champion → THM + Hacksplaining → Baseline` | roadmap |
| `problem · actions · evidence · lessons · cleanup` | project write-up |
| `Attack · Defense · In my world` | note format |
| `STAR` | interview stories |
| `one note per lesson` | compounding |
| `visible progress` | tracker + LinkedIn |

**Memory hooks:**

- **The roadmap**: CCP → Skill Builder (IAM + Champion) → THM + Hacksplaining → Baseline project.
- **Projects with evidence**: Problem → actions → evidence → lessons → cleanup.
- **Notes that compound**: One note per lesson. Three lines. Every time.
- **Interview stories**: Situation · Task · Action · Result, with real numbers.
- **Keep the momentum**: Consistent beats intense. Visible beats private.

