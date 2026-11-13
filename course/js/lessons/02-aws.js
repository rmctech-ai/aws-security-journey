/* ============ 04 IAM ATTACKS ============ */
LESSONS.push({
  id: 'iam-attacks', num: 4, cat: 'aws', layer: 3, mins: 15,
  title: 'IAM Attacks & Defenses', short: 'Leaked keys, wildcards, PassRole escalation',
  overview: `<p>In the cloud, identity is the perimeter. Most AWS breaches don't break encryption or hack hypervisors: they use a <b>leaked access key</b> or an <b>over-permissive policy</b>. This lesson follows the AWS Skill Builder IAM plan from the attacker's side, then shows the defenses.</p>`,
  hook: `<b>Leaked key + "Action": "*" = game over. Least privilege + no long-lived keys = game saved.</b>`,
  why: `The Skill Builder IAM learning plan is step 2 of your roadmap, and IAM misconfiguration is the #1 cloud finding in every audit.`,
  scene: { type: 'graph', nodes: [
    { id: 'gh', x: 110, y: 110, icon: 'code', label: 'Public GitHub', sub: 'key in a commit' },
    { id: 'att', x: 110, y: 370, icon: 'bug', label: 'Attacker', sub: 'scrapes for AKIA…' },
    { id: 'key', x: 360, y: 240, icon: 'key', label: 'ci-legacy key', sub: 'AKIA… long-lived' },
    { id: 'pol', x: 610, y: 110, icon: 'json', label: 'Policy', sub: '"Action": "*"' },
    { id: 'role', x: 610, y: 370, icon: 'root', label: 'Admin role', sub: 'via iam:PassRole', at: 2 },
    { id: 'acct', x: 850, y: 240, icon: 'cloud', label: 'AWS account', sub: 'everything' },
    { id: 'def', x: 850, y: 420, icon: 'shield', label: 'Defenses', sub: 'roles, MFA, Access Analyzer', at: 3 }
  ], edges: [{ a: 'gh', b: 'att' }, { a: 'att', b: 'key' }, { a: 'key', b: 'pol' }, { a: 'pol', b: 'acct' }, { a: 'key', b: 'role', at: 2 }, { a: 'role', b: 'acct', at: 2 }, { a: 'def', b: 'acct', at: 3 }] },
  steps: [
    { t: 'Leaked access keys', sub: 'The most common way in',
      body: `<p><b>Attack:</b> long-lived access keys (<code>AKIA…</code>) get committed to GitHub, pasted in chat, baked into Docker images or left in an n8n credential export. Bots scan public repos within minutes and start calling AWS with them, often to launch crypto-mining instances.</p><p><b>Defense:</b> no long-lived keys for people (use IAM Identity Center), roles for workloads, secret scanning (GitHub push protection), and rotate or delete any key that leaks.</p>`,
      analogy: `Leaving your <b>house key taped to the front door</b> with your address on it.`,
      hook: `<b>AKIA in a repo = assume compromised. Delete, don't just rotate later.</b>`,
      words: ['access key', 'AKIA', 'secret scanning', 'long-lived credentials', 'temporary credentials'],
      flow: { from: 'gh', to: 'att', label: 'SCRAPE', detail: ['regex AKIA[0-9A-Z]{16}', 'found in 4 minutes'], color: 'red' }, focus: ['gh', 'att', 'key'],
      cmds: [{ c: 'aws iam update-access-key --user-name ci-legacy --access-key-id AKIAEXAMPLELEGACY01 --status Inactive', o: '', k: 'def' }] },
    { t: 'Wildcard policies', sub: '"Action": "*", "Resource": "*"',
      body: `<p><b>Attack:</b> a stolen key is only as dangerous as its policy. A CI user with <code>"Action": "*", "Resource": "*"</code> (often added "temporarily" to fix an AccessDenied) lets the attacker do anything: create admin users, delete backups, read every bucket.</p><p><b>Defense:</b> least privilege. Specific actions on specific ARNs. Use IAM Access Analyzer policy generation to build a policy from what the role actually used.</p>`,
      analogy: `Giving the <b>delivery rider a master key</b> to the whole building because he once needed the lobby door.`,
      hook: `<b>"*" on Action AND Resource = AdministratorAccess in disguise.</b>`,
      words: ['wildcard', 'least privilege', 'AdministratorAccess', 'IAM Access Analyzer', 'policy generation'],
      flow: { from: 'key', to: 'pol', label: 'EVALUATE', detail: ['Sid Everything: Allow * on *'], color: 'red' }, focus: ['pol', 'acct'],
      cmds: [{ c: 'aws iam get-user-policy --user-name ci-legacy --policy-name ci --query "PolicyDocument.Statement[?Sid==\'Everything\']"', o: '[ { "Sid": "Everything", "Effect": "Allow", "Action": "*", "Resource": "*" } ]', k: 'att' }] },
    { t: 'Privilege escalation', sub: 'iam:PassRole and friends',
      body: `<p><b>Attack:</b> even without <code>*</code>, some permissions let a user <b>give themselves more</b>. <code>iam:PassRole</code> on <code>"Resource": "*"</code> plus <code>lambda:CreateFunction</code> means: create a function that runs as the admin role. Others: <code>iam:AttachUserPolicy</code>, <code>iam:CreatePolicyVersion</code>, <code>iam:UpdateAssumeRolePolicy</code>.</p><p><b>Defense:</b> scope PassRole to specific role ARNs, use permissions boundaries, and review IAM write permissions carefully.</p>`,
      analogy: `A staff member who can't open the vault but <b>can print themselves a new ID badge</b>.`,
      hook: `<b>PassRole on * = "become any role". Scope it to named roles.</b>`,
      words: ['privilege escalation', 'iam:PassRole', 'permissions boundary', 'iam:CreatePolicyVersion', 'AttachUserPolicy'],
      flow: { from: 'key', to: 'role', label: 'ESCALATE', detail: ['lambda:CreateFunction', '--role arn:…:role/Admin'], color: 'red' }, focus: ['role', 'key'],
      cmds: [{ c: 'aws lambda create-function --function-name x --runtime python3.13 --handler x.h --role arn:aws:iam::111122223333:role/OrgAdmin --zip-file fileb://x.zip', o: '{ "FunctionName": "x", "Role": "arn:aws:iam::111122223333:role/OrgAdmin" }', k: 'att' }] },
    { t: 'The defensive toolkit', sub: 'Identity Center, MFA, Access Analyzer',
      body: `<p><b>IAM Identity Center</b>: people sign in once with MFA and get short-lived role credentials. <b>Roles</b> for EC2, Lambda and CI (GitHub Actions OIDC, no stored keys). <b>MFA</b> everywhere, especially root. <b>IAM Access Analyzer</b>: finds resources shared outside the account, unused access, and validates policies. <b>SCPs</b> set guardrails across accounts.</p>`,
      analogy: `<b>Hotel key cards</b> that expire at checkout, a guard who checks two IDs, and an auditor who flags spare keys.`,
      hook: `<b>People → Identity Center + MFA. Workloads → roles. CI → OIDC. Audit → Access Analyzer.</b>`,
      words: ['IAM Identity Center', 'MFA', 'IAM roles', 'OIDC', 'Access Analyzer', 'SCP'],
      flow: { from: 'def', to: 'acct', label: 'GUARD', detail: ['no IAM users with keys', 'CI via OIDC role'], color: 'green' }, focus: ['def', 'acct'],
      cloud: `<b>In my world:</b> GitHub Actions deploying my Lambda should use an OIDC role (CI/CD Explorer lesson), not an access key stored in repo secrets.`,
      cmds: [{ c: 'aws accessanalyzer validate-policy --policy-type IDENTITY_POLICY --policy-document file://ci.json --query "findings[].[findingType,issueCode]"', o: '[ [ "SECURITY_WARNING", "PASS_ROLE_WITH_STAR_IN_RESOURCE" ], [ "SECURITY_WARNING", "PERMISSIVE_ACTION_WITH_WILDCARD" ] ]', k: 'def' }] },
    { t: 'Responding to a leaked key', sub: 'The first 15 minutes',
      body: `<p>1. <b>Deactivate</b> the key (update-access-key Inactive). 2. Check <b>CloudTrail</b> for what it did (by AccessKeyId). 3. Look for <b>persistence</b>: new users, keys, roles, Lambda functions, EC2 instances in unusual Regions. 4. Delete them, then <b>delete</b> the key and fix the policy. 5. Write the note: Attack · Defense · In my world.</p>`,
      analogy: `Lost wallet: <b>block the card first</b>, then check the statement, then cancel anything you don't recognize.`,
      hook: `<b>Deactivate → investigate (CloudTrail) → remove persistence → delete → learn.</b>`,
      words: ['incident response', 'deactivate key', 'CloudTrail lookup', 'persistence', 'unusual Region'],
      flow: { from: 'def', to: 'acct', label: 'CONTAIN', detail: ['key Inactive', 'CloudTrail: RunInstances in us-east-2 ⚠'], color: 'amber' }, focus: ['def', 'key'],
      cloud: `Deep dive on policies and evaluation: <b>IAM Explorer</b> (policy simulator lab).`,
      cmds: [{ c: 'aws cloudtrail lookup-events --lookup-attributes AttributeKey=AccessKeyId,AttributeValue=AKIAEXAMPLELEGACY01 --query "Events[].EventName"', o: '[ "RunInstances", "CreateUser", "CreateAccessKey", "ListBuckets" ]', k: 'def' }] }
  ],
  summary: { title: 'You know how IAM gets attacked', sub: 'Keys, wildcards, escalation', text: `<p>Most cloud breaches use leaked long-lived keys or over-permissive policies. Wildcards on Action and Resource equal admin; iam:PassRole on * enables privilege escalation. Defend with Identity Center and MFA for people, roles and OIDC for workloads and CI, least privilege, permissions boundaries, SCPs and IAM Access Analyzer, and respond to a leak by deactivating, investigating in CloudTrail and removing persistence.</p>` },
  quiz: [
    { q: 'An access key appears in a public GitHub commit. First action?', a: ['Make the repo private and wait', 'Deactivate the key immediately', 'Change the IAM user password', 'Enable versioning on S3'], c: 1, why: 'Assume it is already being used; cut it off first.' },
    { q: 'Why is iam:PassRole on "Resource": "*" dangerous?', a: ['It costs more', 'It lets a user launch services that run as any role, including admin roles', 'It disables MFA', 'It deletes CloudTrail'], c: 1, why: 'Passing an admin role to a new resource is privilege escalation.' },
    { q: 'Best way for GitHub Actions to deploy to AWS?', a: ['Store an access key in repo secrets', 'Assume an IAM role through OIDC with temporary credentials', 'Use the root user', 'Share a developer\'s key'], c: 1, why: 'OIDC gives short-lived credentials with no stored secret.' },
    { q: 'Which service flags resources shared outside your account and validates policies?', a: ['IAM Access Analyzer', 'Amazon Polly', 'AWS Snowball', 'Amazon Lightsail'], c: 0, why: 'Access Analyzer finds external access and policy issues.' }
  ],
  challenge: { task: 'Write risky_statements(policy) → list of Sids (in order) of Allow statements that grant "*" as an action (Action is "*" or contains "*"), or grant "iam:PassRole" on Resource "*". Deny statements are never risky.',
    hint: R`def risky_statements(policy):
    out = []
    for s in policy["Statement"]:
        if s["Effect"] != "Allow":
            continue
        actions = s["Action"] if isinstance(s["Action"], list) else [s["Action"]]
        res = s["Resource"] if isinstance(s["Resource"], list) else [s["Resource"]]
        if "*" in actions or ("iam:PassRole" in actions and "*" in res):
            out.append(s["Sid"])
    return out

print(risky_statements(ci_policy))
`,
    starter: R`for s in ci_policy["Statement"]:
    print(s["Sid"], s["Effect"], s["Action"], s["Resource"])

def risky_statements(policy):
    # return Sids of risky Allow statements
    return []

print(risky_statements(ci_policy))
`,
    check: '_t(lambda: risky_statements(ci_policy) == ["Everything", "PassAnyRole"] and risky_statements({"Statement":[{"Sid":"D","Effect":"Deny","Action":"*","Resource":"*"},{"Sid":"P","Effect":"Allow","Action":"iam:PassRole","Resource":"arn:aws:iam::1:role/app"}]}) == [])' },
  next: `Fixing one policy is good; securing the whole account is better. Next: the <b>Secure AWS Account Baseline</b>, the first project in your roadmap.`,
  cheat: [['AKIA…', 'long-lived key: avoid'], ['"Action":"*","Resource":"*"', 'admin in disguise'], ['iam:PassRole on *', 'privilege escalation'], ['Identity Center + MFA', 'people'], ['roles / OIDC', 'workloads & CI'], ['deactivate → CloudTrail → clean up', 'leaked key response']]
});

/* ============ 05 ACCOUNT BASELINE ============ */
LESSONS.push({
  id: 'account-baseline', num: 5, cat: 'aws', layer: 4, mins: 16,
  title: 'Secure AWS Account Baseline', short: 'The 10 settings every account needs',
  overview: `<p>Before building anything, a new AWS account needs a <b>security baseline</b>: the handful of settings that stop the most common disasters. This is the <b>Security Champion</b> mindset and Project 1 of your roadmap: apply it, prove it with Security Hub scores, and document it.</p>`,
  hook: `<b>Root locked · trail on · detectors on · public access blocked · budget alert · encryption by default.</b>`,
  why: `The Security Champion badge path and the CIS AWS Foundations Benchmark both start here, and "how would you secure a new AWS account?" is the most common cloud security interview question.`,
  scene: { type: 'graph', nodes: [
    { id: 'acct', x: 470, y: 240, icon: 'cloud', label: 'New AWS account', sub: 'raul-sandbox' },
    { id: 'root', x: 140, y: 80, icon: 'root', label: 'Root', sub: 'MFA, no keys' },
    { id: 'trail', x: 470, y: 60, icon: 'log', label: 'CloudTrail', sub: 'all Regions' },
    { id: 'gd', x: 800, y: 80, icon: 'eye', label: 'GuardDuty + Security Hub', sub: 'detect & score', at: 1 },
    { id: 'bpa', x: 140, y: 400, icon: 'bucket', label: 'S3 Block Public Access', sub: 'account level', at: 2 },
    { id: 'aa', x: 470, y: 430, icon: 'search', label: 'Access Analyzer', sub: 'external access', at: 2 },
    { id: 'bud', x: 800, y: 400, icon: 'bell', label: 'Budget alert', sub: 'cost = security signal', at: 3 }
  ], edges: [{ a: 'root', b: 'acct' }, { a: 'trail', b: 'acct' }, { a: 'gd', b: 'acct', at: 1 }, { a: 'bpa', b: 'acct', at: 2 }, { a: 'aa', b: 'acct', at: 2 }, { a: 'bud', b: 'acct', at: 3 }] },
  steps: [
    { t: 'Lock down root', sub: 'MFA on, keys off',
      body: `<p>Root can do everything and can't be limited by IAM. <b>Enable MFA</b> (hardware key or authenticator app), <b>delete root access keys</b>, set strong contact details, and never use root for daily work. Create an admin through IAM Identity Center instead.</p>`,
      analogy: `The <b>land title</b> goes in the bank safe deposit box, not in your wallet.`,
      hook: `<b>Root: MFA yes, keys no, daily use never.</b>`,
      words: ['root user', 'MFA', 'root access keys', 'Identity Center admin', 'break-glass'],
      flow: { from: 'root', to: 'acct', label: 'LOCK', detail: ['AccountMFAEnabled: 1', 'AccountAccessKeysPresent: 0'], color: 'green' }, focus: ['root'],
      cmds: [{ c: 'aws iam get-account-summary --query "SummaryMap.[AccountMFAEnabled,AccountAccessKeysPresent]"', o: '[ 0, 1 ]', k: 'att' }] },
    { t: 'See everything', sub: 'CloudTrail, GuardDuty, Security Hub',
      body: `<p><b>CloudTrail</b>: a multi-Region trail to a dedicated, locked S3 bucket (log file validation on). <b>GuardDuty</b>: threat detection from CloudTrail, VPC Flow Logs and DNS logs, enabled in every Region. <b>Security Hub</b>: turns on standards (AWS Foundational Security Best Practices, CIS) and gives you a <b>score</b>.</p>`,
      analogy: `<b>CCTV</b> (CloudTrail), a <b>guard who recognizes burglars</b> (GuardDuty), and a <b>report card</b> (Security Hub).`,
      hook: `<b>Trail = record. GuardDuty = detect. Security Hub = score.</b>`,
      words: ['CloudTrail', 'multi-Region trail', 'GuardDuty', 'Security Hub', 'FSBP standard', 'CIS benchmark'],
      flow: { from: 'gd', to: 'acct', label: 'WATCH', detail: ['Security Hub score: 41% → 92%'], color: 'blue' }, focus: ['trail', 'gd'],
      cmds: [{ c: 'aws guardduty create-detector --enable --finding-publishing-frequency FIFTEEN_MINUTES', o: '{ "DetectorId": "12abc34def56..." }', k: 'def' }] },
    { t: 'Close the classic holes', sub: 'Public S3, external access, weak passwords',
      body: `<p><b>S3 Block Public Access</b> at the account level stops accidental public buckets. <b>IAM Access Analyzer</b> lists anything shared outside the account. A <b>password policy</b> (length 14+, if you have IAM users at all). <b>Default EBS encryption</b> so every new volume is encrypted.</p>`,
      analogy: `Child-proof locks on <b>every cabinet at once</b>, instead of remembering each one.`,
      hook: `<b>Block Public Access + Access Analyzer + default encryption.</b>`,
      words: ['Block Public Access', 'IAM Access Analyzer', 'password policy', 'default EBS encryption'],
      flow: { from: 'bpa', to: 'acct', label: 'BLOCK', detail: ['BlockPublicAcls / Policy: true'], color: 'green' }, focus: ['bpa', 'aa'],
      cmds: [{ c: 'aws ec2 enable-ebs-encryption-by-default', o: '{ "EbsEncryptionByDefault": true }', k: 'def' }] },
    { t: 'Budgets are a security control', sub: 'A surprise bill is often an attack',
      body: `<p>Crypto-mining with stolen keys shows up first as a <b>cost spike</b>. A <b>budget alert</b> (and Cost Anomaly Detection) is a cheap detective control, and it protects you from your own mistakes too, like a forgotten NAT gateway.</p>`,
      analogy: `A <b>text message for every big card purchase</b>: you notice fraud the same day.`,
      hook: `<b>Unexpected cost = unexpected activity. Alert on it.</b>`,
      words: ['AWS Budgets', 'Cost Anomaly Detection', 'crypto-mining', 'detective control'],
      flow: { from: 'bud', to: 'acct', label: 'ALERT', detail: ['forecast > $20 → email'], color: 'amber' }, focus: ['bud'],
      cmds: [{ c: 'aws budgets describe-budgets --account-id 111122223333 --query "Budgets[].[BudgetName,BudgetLimit.Amount]"', o: '[ [ "monthly-guard", "20.0" ] ]', k: 'def' }] },
    { t: 'Prove it and document it', sub: 'Your first security portfolio project',
      body: `<p>Turn the baseline into a project: before/after screenshots of the Security Hub score, the commands or CloudFormation you used, the findings you fixed, and a short Attack · Defense · In my world write-up per control. Then <b>delete paid resources</b> you don't need. That's a recruiter-ready project.</p>`,
      analogy: `A <b>home renovation album</b>: before photo, what you fixed, after photo.`,
      hook: `<b>Before score → fixes → after score → write-up.</b>`,
      words: ['portfolio project', 'evidence', 'Security Hub score', 'write-up', 'CIS benchmark'],
      focus: ['acct', 'root', 'trail', 'gd', 'bpa', 'aa', 'bud'],
      cloud: `<b>In my world:</b> this is roadmap step 4, "Project: Secure AWS Account Baseline", in my aws-security-journey repo.`,
      cmds: [{ c: 'aws securityhub get-findings --filters "{\\"ComplianceStatus\\":[{\\"Value\\":\\"FAILED\\",\\"Comparison\\":\\"EQUALS\\"}]}" --query "length(Findings)"', o: '3', k: 'def' }] }
  ],
  summary: { title: 'You can baseline an AWS account', sub: 'Ten settings, one project', text: `<p>Lock root (MFA, no keys), record everything with a multi-Region CloudTrail, detect with GuardDuty, score with Security Hub, block public S3 at the account level, review external access with Access Analyzer, enforce default EBS encryption and a password policy, and alert on cost. Prove it with before/after Security Hub scores in a portfolio write-up.</p>` },
  quiz: [
    { q: 'Which is NOT part of a basic account baseline?', a: ['MFA on the root user', 'Deleting root access keys', 'Using root for daily admin work', 'A multi-Region CloudTrail trail'], c: 2, why: 'Root should almost never be used.' },
    { q: 'Which service gives a security score against standards like AWS FSBP and CIS?', a: ['AWS Security Hub', 'Amazon Macie', 'AWS Shield', 'Amazon Detective'], c: 0, why: 'Security Hub runs standards checks and scores them.' },
    { q: 'Why is a budget alert useful for security?', a: ['It encrypts data', 'Unexpected spend can reveal compromised credentials (e.g., crypto-mining)', 'It blocks API calls', 'It enables MFA'], c: 1, why: 'Cost spikes are an early sign of abuse.' },
    { q: 'S3 Block Public Access at the account level…', a: ['Prevents buckets from being made public by mistake', 'Encrypts all objects', 'Deletes public buckets', 'Speeds up downloads'], c: 0, why: 'It overrides public ACLs and policies account-wide.' }
  ],
  challenge: { task: 'Write baseline_gaps(acct) → sorted list of failing check names from the account dict: root_mfa must be True, root_access_keys 0, cloudtrail_multi_region/guardduty/security_hub/s3_block_public_access/budget_alert/access_analyzer/default_ebs_encryption True, iam_users_with_old_keys empty, password_policy_min_length >= 14.',
    hint: R`def baseline_gaps(acct):
    gaps = []
    for k in ["root_mfa", "cloudtrail_multi_region", "guardduty", "security_hub", "s3_block_public_access",
              "budget_alert", "access_analyzer", "default_ebs_encryption"]:
        if not acct.get(k):
            gaps.append(k)
    if acct.get("root_access_keys", 0) > 0:
        gaps.append("root_access_keys")
    if acct.get("iam_users_with_old_keys"):
        gaps.append("iam_users_with_old_keys")
    if acct.get("password_policy_min_length", 0) < 14:
        gaps.append("password_policy_min_length")
    return sorted(gaps)

print(baseline_gaps(account))
`,
    starter: R`print(account)

def baseline_gaps(acct):
    # return a sorted list of the check names that fail
    return []

print(baseline_gaps(account))
`,
    check: '_t(lambda: baseline_gaps(account) == ["access_analyzer","default_ebs_encryption","guardduty","iam_users_with_old_keys","password_policy_min_length","root_access_keys","root_mfa","security_hub"] and baseline_gaps({"root_mfa":True,"root_access_keys":0,"cloudtrail_multi_region":True,"guardduty":True,"security_hub":True,"s3_block_public_access":True,"budget_alert":True,"access_analyzer":True,"iam_users_with_old_keys":[],"password_policy_min_length":14,"default_ebs_encryption":True}) == [])' },
  next: `The account is baselined. Now the resources inside it: <b>network exposure and data protection</b>: open security groups, unencrypted buckets, KMS and Secrets Manager.`,
  cheat: [['root: MFA, no keys', 'first'], ['multi-Region CloudTrail', 'record'], ['GuardDuty · Security Hub', 'detect · score'], ['Block Public Access', 'account-wide'], ['Access Analyzer', 'external access'], ['budget alert', 'cost = security signal']]
});

/* ============ 06 NETWORK & DATA PROTECTION ============ */
LESSONS.push({
  id: 'network-data', num: 6, cat: 'aws', layer: 4, mins: 15,
  title: 'Protect Networks & Data in AWS', short: 'Open SGs, public buckets, KMS, secrets',
  overview: `<p>Inside a baselined account, the next findings are always the same: a <b>security group open to the world</b>, an <b>unencrypted or public bucket</b>, and a <b>secret in code</b>. This lesson maps each to its AWS defense, and you'll write the auditor that finds them.</p>`,
  hook: `<b>0.0.0.0/0 on a non-web port = finding. Unencrypted or public bucket = finding. Secret in code = finding.</b>`,
  why: `These are the top findings in Security Hub, Trusted Advisor and every Security Champion exercise, and they map directly to CCP questions on KMS, Secrets Manager, WAF and Shield.`,
  scene: { type: 'graph', nodes: [
    { id: 'net', x: 120, y: 240, icon: 'globe', label: 'Internet', sub: '0.0.0.0/0' },
    { id: 'waf', x: 330, y: 100, icon: 'firewall', label: 'WAF + Shield', sub: 'L7 + DDoS', at: 3 },
    { id: 'sg', x: 330, y: 330, icon: 'firewall', label: 'Security groups', sub: 'per resource' },
    { id: 'app', x: 570, y: 240, icon: 'server', label: 'App', sub: 'private subnet' },
    { id: 's3', x: 820, y: 110, icon: 'bucket', label: 'S3', sub: 'encrypted, private', at: 1 },
    { id: 'kms', x: 820, y: 260, icon: 'key', label: 'KMS', sub: 'keys & audit', at: 1 },
    { id: 'sec', x: 820, y: 410, icon: 'vault', label: 'Secrets Manager', sub: 'rotated secrets', at: 2 }
  ], edges: [{ a: 'net', b: 'sg' }, { a: 'sg', b: 'app' }, { a: 'net', b: 'waf', at: 3 }, { a: 'waf', b: 'app', at: 3 }, { a: 'app', b: 's3', at: 1 }, { a: 's3', b: 'kms', at: 1 }, { a: 'app', b: 'sec', at: 2 }] },
  steps: [
    { t: 'Open security groups', sub: 'The world can reach your database',
      body: `<p><b>Attack:</b> a security group allowing <code>0.0.0.0/0</code> on 22, 3389, 5432 or "all traffic" (often a "temp-debug" rule nobody removed) gets found by scanners within hours.</p><p><b>Defense:</b> only 80/443 from the internet, and only to the load balancer. Other tiers reference security groups (app SG allows 5432 from the web SG), not IP ranges.</p>`,
      analogy: `A <b>"temporary" open gate</b> is open forever until someone closes it.`,
      hook: `<b>World-open: only 80/443. Everything else: SG-to-SG.</b>`,
      words: ['0.0.0.0/0', 'security group', 'SG referencing', 'temp rules', 'exposure'],
      flow: { from: 'net', to: 'sg', label: 'PROBE', detail: ['sg-0all: all traffic from 0.0.0.0/0 ⚠', 'sg-0db: 5432 from 0.0.0.0/0 ⚠'], color: 'red' }, focus: ['net', 'sg'],
      cmds: [{ c: 'aws ec2 describe-security-groups --filters Name=ip-permission.cidr,Values=0.0.0.0/0 --query "SecurityGroups[].GroupName"', o: '[ "web", "bastion", "postgres", "temp-debug" ]', k: 'att' }] },
    { t: 'Encrypt data at rest with KMS', sub: 'Keys you control, every use logged',
      body: `<p><b>AWS KMS</b> manages encryption keys. S3 (SSE-KMS), EBS, RDS and DynamoDB encrypt with a KMS key in one setting. KMS <b>key policies</b> control who can decrypt, and every use is logged in CloudTrail. Customer managed keys can be rotated automatically.</p><p>Encryption doesn't stop someone with permission from reading data, but it stops stolen disks and snapshots, and adds a second permission check.</p>`,
      analogy: `A <b>safe inside the warehouse</b>, where the key is kept by a different guard who writes down every time it's used.`,
      hook: `<b>KMS = keys + key policy + CloudTrail audit. Encrypt by default.</b>`,
      words: ['KMS', 'SSE-KMS', 'customer managed key', 'key policy', 'key rotation', 'envelope encryption'],
      flow: { from: 's3', to: 'kms', label: 'DECRYPT?', detail: ['key policy: only role/app', 'CloudTrail: kms:Decrypt'], color: 'purple' }, focus: ['s3', 'kms'],
      cmds: [{ c: 'aws s3api put-bucket-encryption --bucket raul-backups --server-side-encryption-configuration "{\\"Rules\\":[{\\"ApplyServerSideEncryptionByDefault\\":{\\"SSEAlgorithm\\":\\"aws:kms\\"},\\"BucketKeyEnabled\\":true}]}"', o: '', k: 'def' }] },
    { t: 'Secrets out of code', sub: 'Secrets Manager and Parameter Store',
      body: `<p><b>Attack:</b> database passwords and API keys in source code, <code>.env</code> files in Git, or n8n/Docker images leak with every copy.</p><p><b>Defense:</b> store them in <b>Secrets Manager</b> (automatic rotation for RDS and more) or <b>SSM Parameter Store</b> SecureString; the app reads them at runtime with its IAM role. Never print them in logs.</p>`,
      analogy: `The cashier asks the <b>manager's safe</b> for the vault code each time, instead of writing it on the register.`,
      hook: `<b>Secrets → Secrets Manager (rotation) or Parameter Store. Read at runtime via role.</b>`,
      words: ['Secrets Manager', 'Parameter Store', 'SecureString', 'rotation', '.env leak'],
      flow: { from: 'app', to: 'sec', label: 'GET SECRET', detail: ['role/app → secret shop/db', 'rotated every 30 days'], color: 'green' }, focus: ['app', 'sec'],
      cloud: `<b>In my world:</b> my Claude API key and Supabase service key belong in Secrets Manager or the platform's secret store, never in a FastAPI file or an n8n workflow export.`,
      cmds: [{ c: 'aws secretsmanager get-secret-value --secret-id shop/db --query "VersionStages"', o: '[ "AWSCURRENT" ]', k: 'def' }] },
    { t: 'Edge protection', sub: 'WAF and Shield',
      body: `<p><b>AWS WAF</b> filters HTTP requests at CloudFront, ALB or API Gateway: managed rules for SQL injection and XSS patterns, rate-based rules against floods, IP and geo rules. <b>AWS Shield Standard</b> (free, automatic) absorbs common network DDoS; <b>Shield Advanced</b> adds DDoS response support and cost protection.</p>`,
      analogy: `WAF is the <b>bouncer checking each guest</b>; Shield is the <b>crowd barrier</b> for a stampede.`,
      hook: `<b>WAF = layer 7 rules (SQLi, XSS, rate). Shield = DDoS.</b>`,
      words: ['AWS WAF', 'managed rules', 'rate-based rule', 'Shield Standard', 'Shield Advanced', 'DDoS'],
      flow: { from: 'net', to: 'waf', label: 'FILTER', detail: ["' OR 1=1-- → BLOCKED (SQLi rule)"], color: 'green' }, focus: ['waf'],
      cmds: [{ c: 'aws wafv2 get-sampled-requests --web-acl-arn arn:aws:wafv2:...:webacl/shop/abc --rule-metric-name SQLiRule --scope REGIONAL --time-window StartTime=1731542400,EndTime=1731546000 --max-items 1 --query "SampledRequests[0].Action"', o: '"BLOCK"', k: 'def' }] },
    { t: 'Find sensitive data', sub: 'Macie and data classification',
      body: `<p>You can't protect data you don't know you have. <b>Amazon Macie</b> scans S3 for personal data (names, emails, IDs, credit card numbers) and credentials, and flags public or unencrypted buckets. Classify data (public / internal / confidential) and apply stronger controls to the sensitive classes.</p>`,
      analogy: `An <b>inventory of the valuables</b> before you decide where to install the safe.`,
      hook: `<b>Macie = find sensitive data in S3.</b>`,
      words: ['Amazon Macie', 'PII', 'data classification', 'sensitive data discovery'],
      flow: { from: 'app', to: 's3', label: 'SCAN', detail: ['Macie: 312 emails in raul-tmp ⚠'], color: 'amber' }, focus: ['s3'],
      cloud: `Deep dive: <b>Cloud Security Explorer</b> (data protection and network lessons).`,
      cmds: [{ c: 'aws macie2 list-findings --finding-criteria "{\\"criterion\\":{\\"category\\":{\\"eq\\":[\\"CLASSIFICATION\\"]}}}" --query "length(findingIds)"', o: '2', k: 'def' }] }
  ],
  summary: { title: 'You protect networks and data', sub: 'SGs, KMS, secrets, edge, Macie', text: `<p>Only 80/443 should face the internet, and tiers should reference security groups. Encrypt at rest with KMS (key policies plus CloudTrail audit), keep secrets in Secrets Manager or Parameter Store and read them via roles, filter web traffic with WAF and absorb DDoS with Shield, and use Macie to find sensitive data in S3.</p>` },
  quiz: [
    { q: 'A security group allows port 5432 from 0.0.0.0/0. The best fix:', a: ['Change the port to 5433', 'Allow 5432 only from the app tier\'s security group', 'Add a NACL allow rule', 'Enable S3 versioning'], c: 1, why: 'SG referencing restricts access to the app tier.' },
    { q: 'Where should a database password used by a Lambda function be stored?', a: ['In the function code', 'In AWS Secrets Manager, read at runtime via the function\'s role', 'In a public S3 bucket', 'In the function name'], c: 1, why: 'Secrets Manager stores and rotates secrets.' },
    { q: 'Which service filters SQL injection and XSS patterns in HTTP requests?', a: ['AWS WAF', 'AWS Shield Standard', 'Amazon Inspector', 'AWS Config'], c: 0, why: 'WAF inspects layer 7 requests with rules.' },
    { q: 'Which service discovers personal data stored in S3?', a: ['Amazon Macie', 'Amazon GuardDuty', 'AWS KMS', 'Amazon Route 53'], c: 0, why: 'Macie classifies sensitive data in S3.' }
  ],
  challenge: { task: 'Using the lab data, write world_open(groups) → sorted list of GroupNames that allow 0.0.0.0/0 on anything other than port 80 or 443 (protocol "-1" means all traffic), and weak_buckets(buckets) → sorted list of bucket names that are unencrypted (encryption None) OR public (policy_public True or public_access_block False).',
    hint: R`def world_open(groups):
    bad = set()
    for g in groups:
        for p in g["IpPermissions"]:
            world = any(r["CidrIp"] == "0.0.0.0/0" for r in p.get("IpRanges", []))
            if not world:
                continue
            if p["IpProtocol"] == "-1" or p.get("FromPort") not in (80, 443):
                bad.add(g["GroupName"])
    return sorted(bad)

def weak_buckets(buckets):
    return sorted(b["name"] for b in buckets
                  if b["encryption"] is None or b["policy_public"] or not b["public_access_block"])

print(world_open(security_groups))
print(weak_buckets(buckets))
`,
    starter: R`for g in security_groups:
    print(g["GroupName"], g["IpPermissions"])
for b in buckets:
    print(b)

def world_open(groups):
    return []

def weak_buckets(buckets):
    return []

print(world_open(security_groups), weak_buckets(buckets))
`,
    check: '_t(lambda: world_open(security_groups) == ["bastion", "postgres", "temp-debug"] and weak_buckets(buckets) == ["raul-backups", "raul-public-site", "raul-tmp"])' },
  next: `Even with good controls, something will eventually get through. Next: <b>detection and incident response</b>: triaging GuardDuty findings and containing a compromised instance.`,
  cheat: [['0.0.0.0/0 on non-80/443', 'finding'], ['SG → SG references', 'tier-to-tier access'], ['KMS', 'keys, key policy, audit'], ['Secrets Manager / Parameter Store', 'secrets out of code'], ['WAF · Shield', 'L7 rules · DDoS'], ['Macie', 'find PII in S3']]
});

/* ============ 07 DETECTION & INCIDENT RESPONSE ============ */
LESSONS.push({
  id: 'detect-respond', num: 7, cat: 'aws', layer: 4, mins: 15,
  title: 'Detection & Incident Response', short: 'Triage findings, contain, investigate, recover',
  overview: `<p>Detection tells you something is wrong; <b>incident response</b> is what you do in the next hour. AWS gives you the signals (GuardDuty, Security Hub, CloudTrail) and the levers (security groups, IAM, snapshots). This lesson walks the IR lifecycle on a real-looking case: an EC2 instance mining crypto and leaking its credentials.</p>`,
  hook: `<b>Prepare → Detect → Contain → Investigate → Eradicate & recover → Learn.</b>`,
  why: `"Prepare for security events" is a Security pillar principle, and SOC / cloud security roles live in this loop. The Security Champion path and interviews ask "what would you do if…".`,
  scene: { type: 'graph', nodes: [
    { id: 'gd', x: 120, y: 240, icon: 'eye', label: 'GuardDuty', sub: 'findings' },
    { id: 'hub', x: 330, y: 100, icon: 'list', label: 'Security Hub', sub: 'triage queue' },
    { id: 'ec2', x: 560, y: 240, icon: 'server', label: 'i-0abc123', sub: 'mining crypto ⚠' },
    { id: 'snap', x: 800, y: 100, icon: 'disk', label: 'Snapshot', sub: 'evidence first', at: 2 },
    { id: 'q', x: 800, y: 380, icon: 'firewall', label: 'Quarantine SG', sub: 'no in, no out', at: 2 },
    { id: 'eb', x: 330, y: 400, icon: 'lambda', label: 'EventBridge → Lambda', sub: 'auto-response', at: 4 }
  ], edges: [{ a: 'gd', b: 'hub' }, { a: 'gd', b: 'ec2' }, { a: 'ec2', b: 'snap', at: 2 }, { a: 'ec2', b: 'q', at: 2 }, { a: 'gd', b: 'eb', at: 4 }, { a: 'eb', b: 'ec2', at: 4 }] },
  steps: [
    { t: 'Prepare before it happens', sub: 'Playbooks, access, tools',
      body: `<p><b>Prepare</b>: written playbooks for likely incidents (leaked key, compromised instance, public bucket), pre-created IR roles and a forensics account, logging already on (you can't investigate what you never recorded), and contact lists. Practice with tabletop exercises.</p>`,
      analogy: `A <b>fire plan on the wall</b>, extinguishers checked, and a drill every quarter.`,
      hook: `<b>No logs, no playbook, no practice = no response.</b>`,
      words: ['incident response plan', 'playbook', 'tabletop exercise', 'forensics account', 'IR role'],
      focus: ['gd', 'hub'],
      cmds: [{ c: 'ls playbooks/', o: 'compromised-ec2.md  leaked-access-key.md  public-s3-bucket.md  ransomware.md', k: 'sh' }] },
    { t: 'Detect and triage', sub: 'Highest severity first',
      body: `<p>GuardDuty findings have a <b>severity</b>: low (1–3.9), medium (4–6.9), high (7–8.9) and critical (9 and above). Triage means: sort by severity, group by resource, and ask "is this real, and how bad?". Two high findings on the same instance (crypto-mining + credential exfiltration) means that instance is compromised.</p>`,
      analogy: `An <b>ER triage nurse</b>: the bleeding patient before the sprained ankle.`,
      hook: `<b>Sort by severity, group by resource, confirm, then act.</b>`,
      words: ['triage', 'severity', 'finding type', 'true positive', 'false positive'],
      flow: { from: 'gd', to: 'hub', label: 'TRIAGE', detail: ['8.5 InstanceCredentialExfiltration', '8.0 BitcoinTool → i-0abc123'], color: 'red' }, focus: ['gd', 'hub', 'ec2'],
      cmds: [{ c: 'aws guardduty get-findings --detector-id 12abc --finding-ids f5 --query "Findings[0].[Type,Severity]"', o: '[ "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS", 8.5 ]', k: 'att' }] },
    { t: 'Contain, but keep evidence', sub: 'Snapshot first, then isolate',
      body: `<p><b>Contain</b> to stop the damage without destroying evidence: <b>snapshot</b> the EBS volumes first, then swap the instance's security group to a <b>quarantine SG</b> (no inbound, no outbound), detach it from the Auto Scaling group, and revoke the instance role's active sessions. Don't just terminate: you'd lose the evidence.</p>`,
      analogy: `<b>Photograph the crime scene, then tape it off</b>. Don't mop the floor first.`,
      hook: `<b>Snapshot → quarantine SG → revoke sessions. Terminate last.</b>`,
      words: ['containment', 'EBS snapshot', 'quarantine security group', 'evidence', 'revoke sessions'],
      flow: { from: 'ec2', to: 'q', label: 'ISOLATE', detail: ['snapshot vol-0data ✓', 'groups → sg-0quarantine'], color: 'amber' }, focus: ['ec2', 'snap', 'q'],
      cmds: [{ c: 'aws ec2 modify-instance-attribute --instance-id i-0abc123 --groups sg-0quarantine', o: '', k: 'def' }] },
    { t: 'Investigate, eradicate, recover', sub: 'What happened, and clean up',
      body: `<p><b>Investigate</b>: CloudTrail for what the stolen role credentials did, VPC Flow Logs for where traffic went, <b>Amazon Detective</b> to visualize the activity. <b>Eradicate</b>: remove persistence (new users, keys, Lambda functions), patch the hole (old AMI, open port). <b>Recover</b>: launch clean instances from a known-good image.</p>`,
      analogy: `Find <b>how the burglar got in</b>, change all the locks, then reopen the shop.`,
      hook: `<b>CloudTrail + Flow Logs + Detective → remove persistence → rebuild clean.</b>`,
      words: ['investigation', 'Amazon Detective', 'VPC Flow Logs', 'eradication', 'recovery'],
      focus: ['ec2', 'hub'],
      cmds: [{ c: 'aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=i-0abc123 --query "Events[].EventName"', o: '[ "RunInstances", "ModifyInstanceAttribute" ]', k: 'def' }] },
    { t: 'Automate and learn', sub: 'EventBridge response and post-incident review',
      body: `<p>Known patterns can be <b>auto-contained</b>: an EventBridge rule on GuardDuty high-severity EC2 findings triggers a Lambda that snapshots and quarantines. After every incident, a <b>blameless post-incident review</b>: timeline, root cause, what worked, and action items (new Config rule, updated playbook, training).</p>`,
      analogy: `A smoke detector <b>wired to the sprinklers</b>, plus a team meeting after every fire.`,
      hook: `<b>Repeatable response → automate. Every incident → lessons learned.</b>`,
      words: ['auto-remediation', 'EventBridge rule', 'post-incident review', 'root cause', 'lessons learned'],
      flow: { from: 'eb', to: 'ec2', label: 'AUTO-CONTAIN', detail: ['severity ≥ 7 → Lambda quarantine'], color: 'green' }, focus: ['eb', 'ec2'],
      cloud: `<b>In my world:</b> an n8n workflow can receive Security Hub findings via EventBridge → SNS → webhook and post them to Slack. Just make sure the webhook itself is protected (lesson 12).`,
      cmds: [{ c: 'aws events put-rule --name gd-high-ec2 --event-pattern "{\\"source\\":[\\"aws.guardduty\\"],\\"detail\\":{\\"severity\\":[{\\"numeric\\":[\\">=\\",7]}],\\"resource\\":{\\"resourceType\\":[\\"Instance\\"]}}}"', o: '{ "RuleArn": "arn:aws:events:ap-southeast-1:111122223333:rule/gd-high-ec2" }', k: 'def' }] }
  ],
  summary: { title: 'You can run the first hour of an incident', sub: 'Prepare, triage, contain, investigate, learn', text: `<p>Prepare playbooks, roles and logging in advance. Triage findings by severity and resource. Contain without destroying evidence: snapshot, quarantine SG, revoke sessions. Investigate with CloudTrail, Flow Logs and Detective; remove persistence and rebuild clean. Automate known responses with EventBridge and Lambda, and learn from every incident in a blameless review.</p>` },
  quiz: [
    { q: 'An EC2 instance is confirmed compromised. What should you do BEFORE isolating or terminating it?', a: ['Reboot it', 'Take EBS snapshots to preserve evidence', 'Delete CloudTrail', 'Change its instance type'], c: 1, why: 'Preserve evidence, then contain.' },
    { q: 'A GuardDuty finding with severity 8.5 is…', a: ['Low', 'Medium', 'High', 'Informational'], c: 2, why: '7.0–8.9 is high severity.' },
    { q: 'Which service helps visualize and investigate the activity behind security findings?', a: ['Amazon Detective', 'AWS Budgets', 'Amazon Lightsail', 'AWS Snowball'], c: 0, why: 'Detective builds behavior graphs from logs.' },
    { q: 'Automatically quarantining instances on high-severity findings is best built with…', a: ['EventBridge rule + Lambda', 'Route 53 failover', 'S3 lifecycle rules', 'AWS Artifact'], c: 0, why: 'EventBridge routes findings to automated responders.' }
  ],
  challenge: { task: 'Write triage(findings, min_sev=7) → list of finding Ids with Severity >= min_sev, highest severity first. Then write contain(instance_id, volume_id) that FIRST calls ec2.create_snapshot(VolumeId=volume_id, Description="IR evidence") and THEN ec2.modify_instance_attribute(InstanceId=instance_id, Groups=["sg-0quarantine"]). Use the boto3 client provided.',
    hint: R`import boto3
ec2 = boto3.client("ec2")

def triage(findings, min_sev=7):
    hot = [f for f in findings if f["Severity"] >= min_sev]
    return [f["Id"] for f in sorted(hot, key=lambda f: f["Severity"], reverse=True)]

def contain(instance_id, volume_id):
    ec2.create_snapshot(VolumeId=volume_id, Description="IR evidence")
    ec2.modify_instance_attribute(InstanceId=instance_id, Groups=["sg-0quarantine"])

print(triage(guardduty_findings))
contain("i-0abc123", "vol-0data")
print(calls("ec2"))
`,
    starter: R`import boto3
ec2 = boto3.client("ec2")
for f in guardduty_findings:
    print(f["Id"], f["Severity"], f["Type"])

def triage(findings, min_sev=7):
    return []

def contain(instance_id, volume_id):
    pass
`,
    check: '_t(lambda: triage(guardduty_findings) == ["f5", "f2", "f7"] and triage(guardduty_findings, 8.2) == ["f5"] and (contain("i-0abc123", "vol-0data") or True) and [c["op"] for c in calls("ec2")] == ["CreateSnapshot", "ModifyInstanceAttribute"] and calls("ec2")[1].get("Groups") == ["sg-0quarantine"] and calls("ec2")[0].get("VolumeId") == "vol-0data")' },
  next: `That's the AWS side. Now the application side: the <b>Hacksplaining</b> attacks, starting with the most famous of all, <b>SQL injection</b>.`,
  cheat: [['Prepare → Detect → Contain → Investigate → Recover → Learn', 'IR lifecycle'], ['severity 7–8.9 high, 9+ critical', 'GuardDuty'], ['snapshot first', 'preserve evidence'], ['quarantine SG', 'isolate'], ['Detective · Flow Logs · CloudTrail', 'investigate'], ['EventBridge → Lambda', 'auto-contain']]
});
